import OpenAI from "openai";
import CryptoJS from "crypto-js";

var SETTINGS_KEY = "web_agent_settings_v1";
var TASK_STATE_KEY = "web_agent_last_task_v1";
var AGENT_MEMORY_KEY = "web_agent_memory_v1";
var AGENT_TOOL_STORAGE_KEY = "web_agent_tool_storage_v1";
var AGENT_CRYPTO_PROFILE_STORAGE_KEY = "web_agent_crypto_profiles_v1";
var ENABLE_TRACE_LOGS = false;
var DEFAULT_SETTINGS = {
  apiKey: "",
  model: "",
  thinkingLevel: "auto",
  baseURL: "https://api.openai.com/v1",
  allowScript: false,
  requestTimeoutSec: 120,
  toolTurnLimit: 0,
  mcpServices: []
};
var runningTask = null;
var keepAliveTimer = null;
var persistTaskTimer = null;
var MAX_MEMORY_ENTRIES = 16;
var MAX_MEMORY_TEXT_CHARS = 1800;
var mcpRpcSeq = 0;
var mcpStreamableSessions = {};
var mcpSSESessions = {};
function createTaskCancelledError(reason = "任务已停止") {
  const err = new Error(String(reason || "任务已停止"));
  err.name = "TaskCancelledError";
  return err;
}
function isTaskCancelledError(err) {
  if (!err) return false;
  if (err?.name === "TaskCancelledError") return true;
  const message = String(err?.message || err || "").toLowerCase();
  return message.includes("taskcancellederror") || message.includes("任务已停止") || message.includes("aborted") || message.includes("abort");
}
function ensureTaskActive(hooks) {
  if (hooks?.cancelSignal?.aborted) {
    throw createTaskCancelledError(hooks?.cancelReason || hooks?.cancelSignal?.reason || "任务已停止");
  }
}
function stopRunningTask(reason = "用户已停止任务") {
  if (!runningTask || runningTask.status !== "running") {
    return { ok: false, error: "当前没有可停止的运行任务" };
  }
  runningTask.cancelRequested = true;
  runningTask.cancelReason = String(reason || "用户已停止任务");
  runningTask.statusText = "停止中...";
  schedulePersistTaskState(runningTask);
  broadcastTask(runningTask, { type: "status", text: runningTask.statusText });
  try {
    if (runningTask.abortController && !runningTask.abortController.signal.aborted) {
      runningTask.abortController.abort(runningTask.cancelReason);
    }
  } catch (_err) {
  }
  return { ok: true, taskId: runningTask.id, status: "stopping" };
}

function generateTaskID() {
  return `task_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
function toTaskPublicState(task) {
  if (!task) return null;
  return {
    id: task.id,
    status: task.status,
    prompt: task.prompt,
    statusText: task.statusText || "",
    assistantText: task.assistantText || "",
    reasoningText: task.reasoningText || "",
    message: task.message || "",
    error: task.error || "",
    cancelRequested: !!task.cancelRequested,
    cancelReason: task.cancelReason || "",
    startedAt: Number(task.startedAt || 0),
    endedAt: Number(task.endedAt || 0)
  };
}
async function persistTaskStateNow(task) {
  try {
    await chrome.storage.local.set({ [TASK_STATE_KEY]: toTaskPublicState(task) });
  } catch (_err) {
  }
}
function schedulePersistTaskState(task) {
  if (persistTaskTimer) {
    clearTimeout(persistTaskTimer);
  }
  persistTaskTimer = setTimeout(() => {
    persistTaskTimer = null;
    void persistTaskStateNow(task);
  }, 250);
}
function broadcastTask(task, message) {
  if (!task?.subscribers || task.subscribers.size === 0) return;
  for (const port of Array.from(task.subscribers)) {
    safePost(port, message);
  }
}
function attachPortToTask(port, task) {
  if (!task || !port) return;
  task.subscribers.add(port);
}
function detachPortFromTask(port, task) {
  if (!task || !port) return;
  task.subscribers.delete(port);
}
function startKeepAlive() {
  if (keepAliveTimer) return;
  keepAliveTimer = setInterval(() => {
    try {
      chrome.runtime.getPlatformInfo(() => {
        void chrome.runtime.lastError;
      });
    } catch (_err) {
    }
  }, 2e4);
}
function stopKeepAliveIfIdle() {
  if (runningTask?.status === "running") return;
  if (keepAliveTimer) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
  }
}
async function executeBackgroundTask(task, settings, hooksBuilder) {
  startKeepAlive();
  await persistTaskStateNow(task);
  try {
    const hooks = hooksBuilder(task);
    ensureTaskActive(hooks);
    const result = await runAgent(task.prompt, settings, hooks);
    task.endedAt = Date.now();
    if (result?.cancelled || task.cancelRequested) {
      task.status = "stopped";
      task.message = String(result?.message || task.cancelReason || "任务已停止");
      broadcastTask(task, { type: "stopped", message: task.message });
    } else if (result?.ok) {
      task.status = "done";
      task.message = String(result?.message || "\u6267\u884C\u5B8C\u6210");
      broadcastTask(task, { type: "result", message: task.message });
    } else {
      task.status = "error";
      task.error = String(result?.error || "\u6267\u884C\u5931\u8D25");
      broadcastTask(task, { type: "error", error: task.error });
    }
  } catch (err) {
    task.endedAt = Date.now();
    if (task.cancelRequested || isTaskCancelledError(err)) {
      task.status = "stopped";
      task.message = String(task.cancelReason || "任务已停止");
      broadcastTask(task, { type: "stopped", message: task.message });
    } else {
      task.status = "error";
      task.error = String(err || "\u6267\u884C\u5931\u8D25");
      broadcastTask(task, { type: "error", error: task.error });
    }
  } finally {
    await persistTaskStateNow(task);
    broadcastTask(task, { type: "done" });
    if (runningTask?.id === task.id) {
      runningTask = null;
    }
    stopKeepAliveIfIdle();
  }
}
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  handleMessage(message).then((res) => sendResponse(res)).catch((err) => sendResponse({ ok: false, error: String(err) }));
  return true;
});
chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== "agent_stream") {
    return;
  }
  let subscribedTask = null;
  port.onDisconnect.addListener(() => {
    if (subscribedTask) {
      detachPortFromTask(port, subscribedTask);
      subscribedTask = null;
    }
  });
  port.onMessage.addListener(async (message) => {
    if (!message || typeof message !== "object") {
      return;
    }
    if (message.type === "ATTACH_TASK") {
      const wantedID = String(message?.payload?.taskId || "");
      if (!runningTask || runningTask.status !== "running" || (wantedID && runningTask.id !== wantedID)) {
        safePost(port, { type: "error", error: "\u672A\u627E\u5230\u53EF\u6302\u8F7D\u7684\u540E\u53F0\u8FD0\u884C\u4EFB\u52A1" });
        safePost(port, { type: "done" });
        return;
      }
      if (subscribedTask) {
        detachPortFromTask(port, subscribedTask);
      }
      subscribedTask = runningTask;
      attachPortToTask(port, subscribedTask);
      safePost(port, { type: "accepted", taskId: subscribedTask.id, resumed: true });
      safePost(port, { type: "task_snapshot", task: toTaskPublicState(subscribedTask) });
      return;
    }
    if (message.type !== "RUN_AGENT_STREAM") {
      return;
    }
    const payload = message?.payload || {};
    if (runningTask && runningTask.status === "running") {
      if (subscribedTask) {
        detachPortFromTask(port, subscribedTask);
      }
      subscribedTask = runningTask;
      attachPortToTask(port, subscribedTask);
      safePost(port, { type: "accepted", taskId: subscribedTask.id, resumed: true });
      safePost(port, { type: "task_snapshot", task: toTaskPublicState(subscribedTask) });
      return;
    }
    const task = {
      id: generateTaskID(),
      status: "running",
      prompt: String(payload.prompt || ""),
      statusText: "",
      assistantText: "",
      reasoningText: "",
      message: "",
      error: "",
      cancelRequested: false,
      cancelReason: "",
      abortController: new AbortController(),
      startedAt: Date.now(),
      endedAt: 0,
      subscribers: /* @__PURE__ */ new Set()
    };
    runningTask = task;
    if (subscribedTask) {
      detachPortFromTask(port, subscribedTask);
    }
    subscribedTask = task;
    attachPortToTask(port, task);
    safePost(port, { type: "accepted", taskId: task.id, resumed: false });
    void executeBackgroundTask(task, payload.settings || {}, (task2) => ({
      onStatus: (text) => {
        task2.statusText = String(text || "");
        schedulePersistTaskState(task2);
        broadcastTask(task2, { type: "status", text });
      },
      onDelta: (delta) => {
        const text = String(delta || "");
        if (!text) return;
        task2.assistantText += text;
        schedulePersistTaskState(task2);
        broadcastTask(task2, { type: "stream_delta", delta: text });
      },
      onReasoning: (delta) => {
        const text = String(delta || "");
        if (!text) return;
        task2.reasoningText += text;
        schedulePersistTaskState(task2);
        broadcastTask(task2, { type: "reasoning_delta", delta: text });
      },
      onDebug: ENABLE_TRACE_LOGS ? (text) => broadcastTask(task2, { type: "debug", text }) : void 0,
      cancelSignal: task2.abortController?.signal,
      cancelReason: task2.cancelReason || "任务已停止"
    }));
  });
});
function safePost(port, data) {
  try {
    port.postMessage(data);
  } catch (_err) {
  }
}
function normalizeMemoryText(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  if (text.length <= MAX_MEMORY_TEXT_CHARS) return text;
  return `${text.slice(0, MAX_MEMORY_TEXT_CHARS)} ...`;
}
function normalizeMemoryEntry(item) {
  const role = item?.role === "assistant" ? "assistant" : "user";
  const text = normalizeMemoryText(item?.text);
  if (!text) return null;
  return {
    role,
    text,
    ts: Number(item?.ts || Date.now())
  };
}
function normalizeMemoryEntries(items) {
  if (!Array.isArray(items)) return [];
  const list = [];
  for (const item of items) {
    const entry = normalizeMemoryEntry(item);
    if (!entry) continue;
    list.push(entry);
  }
  if (list.length > MAX_MEMORY_ENTRIES) {
    return list.slice(list.length - MAX_MEMORY_ENTRIES);
  }
  return list;
}
function memoryTabKey(tabId) {
  return String(tabId || "");
}
async function loadMemoryStore() {
  const data = await chrome.storage.local.get(AGENT_MEMORY_KEY);
  const raw = data?.[AGENT_MEMORY_KEY];
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }
  return raw;
}
async function getConversationMemory(tabId) {
  const key = memoryTabKey(tabId);
  if (!key) return [];
  const store = await loadMemoryStore();
  return normalizeMemoryEntries(store?.[key]);
}
async function appendConversationMemory(tabId, userText, assistantText) {
  const key = memoryTabKey(tabId);
  if (!key) return;
  const user = normalizeMemoryText(userText);
  const assistant = normalizeMemoryText(assistantText);
  if (!user || !assistant) return;
  const store = await loadMemoryStore();
  const current = normalizeMemoryEntries(store?.[key]);
  current.push({ role: "user", text: user, ts: Date.now() });
  current.push({ role: "assistant", text: assistant, ts: Date.now() });
  store[key] = normalizeMemoryEntries(current);
  await chrome.storage.local.set({ [AGENT_MEMORY_KEY]: store });
}
async function clearConversationMemory(tabId) {
  const key = memoryTabKey(tabId);
  if (!key) return;
  const store = await loadMemoryStore();
  if (!Object.prototype.hasOwnProperty.call(store, key)) return;
  delete store[key];
  await chrome.storage.local.set({ [AGENT_MEMORY_KEY]: store });
}
function normalizeToolStorageKey(value) {
  const key = String(value || "").trim();
  if (!key) return "";
  if (key.length > 128) return "";
  if (!/^[a-zA-Z0-9._:-]+$/.test(key)) return "";
  return key;
}
async function loadToolStorageStore() {
  const data = await chrome.storage.local.get(AGENT_TOOL_STORAGE_KEY);
  const raw = data?.[AGENT_TOOL_STORAGE_KEY];
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }
  return raw;
}
function ensureJSONSerializable(value) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch (_err) {
    return void 0;
  }
}
async function setToolStorage(args) {
  const key = normalizeToolStorageKey(args?.key);
  if (!key) {
    return { ok: false, error: "invalid key: only letters/digits/._:- and max 128 chars" };
  }
  if (!Object.prototype.hasOwnProperty.call(args || {}, "value")) {
    return { ok: false, error: "value is required" };
  }
  const value = ensureJSONSerializable(args.value);
  if (typeof value === "undefined") {
    return { ok: false, error: "value must be JSON serializable" };
  }
  const store = await loadToolStorageStore();
  store[key] = value;
  await chrome.storage.local.set({ [AGENT_TOOL_STORAGE_KEY]: store });
  return { ok: true, key, value };
}
async function getToolStorage(args) {
  const key = normalizeToolStorageKey(args?.key);
  if (!key) {
    return { ok: false, error: "invalid key: only letters/digits/._:- and max 128 chars" };
  }
  const store = await loadToolStorageStore();
  if (!Object.prototype.hasOwnProperty.call(store, key)) {
    return { ok: true, key, exists: false, value: null };
  }
  return { ok: true, key, exists: true, value: store[key] };
}
function normalizeCryptoEncoding(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (raw === "utf8" || raw === "utf-8") return "utf8";
  if (raw === "base64" || raw === "hex" || raw === "unicode") return raw;
  return "utf8";
}
function normalizeSymmetricAlgorithm(value) {
  const raw = String(value || "").trim().toUpperCase();
  if (raw === "3DES" || raw === "DES3" || raw === "TRIPLEDES") return "DESEDE";
  if (raw === "AES" || raw === "DES" || raw === "DESEDE") return raw;
  return "AES";
}
function normalizeSymmetricMode(value) {
  const raw = String(value || "").trim().toUpperCase();
  if (raw === "ECB" || raw === "CBC") return raw;
  return "ECB";
}
function normalizeSymmetricKeySize(value) {
  const raw = Number(value);
  if (raw === 64 || raw === 128 || raw === 192 || raw === 256) return raw;
  return 128;
}
function normalizeCryptoProfileId(value) {
  const id = String(value || "").trim();
  if (!id) return "";
  if (id.length > 128) return "";
  if (!/^[a-zA-Z0-9._:-]+$/.test(id)) return "";
  return id;
}
function createCryptoProfileId() {
  return `crypto_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
function normalizeCryptoProfile(input = {}) {
  const now = Date.now();
  const createdAt = Number(input.createdAt || now);
  const updatedAt = Number(input.updatedAt || now);
  return {
    id: normalizeCryptoProfileId(input.id) || createCryptoProfileId(),
    name: String(input.name || "").trim().slice(0, 80),
    algorithm: normalizeSymmetricAlgorithm(input.algorithm),
    mode: normalizeSymmetricMode(input.mode),
    keySize: normalizeSymmetricKeySize(input.keySize),
    keyEncoding: normalizeCryptoEncoding(input.keyEncoding),
    keyValue: String(input.keyValue || ""),
    ivEncoding: normalizeCryptoEncoding(input.ivEncoding),
    ivValue: String(input.ivValue || ""),
    description: String(input.description || "").trim().slice(0, 500),
    createdAt: Number.isFinite(createdAt) ? createdAt : now,
    updatedAt: Number.isFinite(updatedAt) ? updatedAt : now
  };
}
function normalizeCryptoProfiles(items) {
  if (!Array.isArray(items)) return [];
  const out = [];
  const seen = /* @__PURE__ */ new Set();
  for (const item of items) {
    const one = normalizeCryptoProfile(item);
    if (!one.id || seen.has(one.id)) continue;
    seen.add(one.id);
    out.push(one);
  }
  return out;
}
async function loadCryptoProfiles() {
  const data = await chrome.storage.local.get(AGENT_CRYPTO_PROFILE_STORAGE_KEY);
  const raw = data?.[AGENT_CRYPTO_PROFILE_STORAGE_KEY];
  if (!raw || typeof raw !== "object") return [];
  if (Array.isArray(raw)) return normalizeCryptoProfiles(raw);
  if (Array.isArray(raw.profiles)) return normalizeCryptoProfiles(raw.profiles);
  return [];
}
async function saveCryptoProfiles(list) {
  const profiles = normalizeCryptoProfiles(list);
  await chrome.storage.local.set({
    [AGENT_CRYPTO_PROFILE_STORAGE_KEY]: {
      updatedAt: Date.now(),
      profiles
    }
  });
  return profiles;
}
function bytesToWordArray(bytes) {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
  const words = [];
  for (let i = 0; i < view.length; i += 1) {
    words[i >>> 2] |= view[i] << 24 - (i % 4) * 8;
  }
  return CryptoJS.lib.WordArray.create(words, view.length);
}
function wordArrayToBytes(wordArray) {
  const sigBytes = Number(wordArray?.sigBytes || 0);
  const words = wordArray?.words || [];
  const out = new Uint8Array(sigBytes);
  for (let i = 0; i < sigBytes; i += 1) {
    out[i] = words[i >>> 2] >>> 24 - (i % 4) * 8 & 255;
  }
  return out;
}
function decodeBase64(value) {
  try {
    const text = String(value || "").replace(/\s+/g, "");
    const raw = globalThis.atob(text);
    const out = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i += 1) {
      out[i] = raw.charCodeAt(i);
    }
    return out;
  } catch (_err) {
    return null;
  }
}
function encodeBase64(bytes) {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
  let raw = "";
  for (const b of view) {
    raw += String.fromCharCode(b);
  }
  return globalThis.btoa(raw);
}
function decodeHex(value) {
  const text = String(value || "").trim().replace(/\s+/g, "");
  if (!text) return new Uint8Array([]);
  if (text.length % 2 !== 0) return null;
  if (!/^[0-9a-fA-F]+$/.test(text)) return null;
  const out = new Uint8Array(text.length / 2);
  for (let i = 0; i < text.length; i += 2) {
    out[i / 2] = parseInt(text.slice(i, i + 2), 16);
  }
  return out;
}
function encodeHex(bytes) {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
  let out = "";
  for (const b of view) {
    out += b.toString(16).padStart(2, "0");
  }
  return out;
}
function unicodeEncode(text) {
  let out = "";
  const raw = String(text || "");
  for (let i = 0; i < raw.length; i += 1) {
    const code = raw.charCodeAt(i);
    out += `\\u${code.toString(16).padStart(4, "0")}`;
  }
  return out;
}
function unicodeDecode(text) {
  try {
    return String(text || "").replace(/\\u([0-9a-fA-F]{4})/g, (_m, g1) => String.fromCharCode(parseInt(g1, 16)));
  } catch (_err) {
    return "";
  }
}
function parseBytes(value, encoding, fieldName = "value") {
  const mode = normalizeCryptoEncoding(encoding);
  const text = String(value || "");
  if (mode === "utf8") {
    return { ok: true, bytes: new TextEncoder().encode(text) };
  }
  if (mode === "unicode") {
    return { ok: true, bytes: new TextEncoder().encode(unicodeDecode(text)) };
  }
  if (mode === "base64") {
    const parsed = decodeBase64(text);
    if (!parsed) return { ok: false, error: `${fieldName} is not valid base64` };
    return { ok: true, bytes: parsed };
  }
  const parsed = decodeHex(text);
  if (!parsed) return { ok: false, error: `${fieldName} is not valid hex` };
  return { ok: true, bytes: parsed };
}
function formatBytes(bytes, encoding) {
  const mode = normalizeCryptoEncoding(encoding);
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
  if (mode === "base64") return encodeBase64(view);
  if (mode === "hex") return encodeHex(view);
  const text = new TextDecoder().decode(view);
  if (mode === "unicode") return unicodeEncode(text);
  return text;
}
function normalizeToSize(bytes, bitSize) {
  const sizeBytes = Math.max(1, Math.floor(Number(bitSize || 0) / 8));
  const out = new Uint8Array(sizeBytes);
  const src = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
  out.set(src.slice(0, sizeBytes), 0);
  return out;
}
function resolveKeySpec(algorithm, keySize) {
  const algo = normalizeSymmetricAlgorithm(algorithm);
  const raw = normalizeSymmetricKeySize(keySize);
  if (algo === "DES") {
    return { keySize: 64, note: raw === 64 ? "" : "DES keySize fixed to 64 bits" };
  }
  if (algo === "DESEDE") {
    if (raw === 128 || raw === 192) return { keySize: raw, note: "" };
    if (raw === 64) return { keySize: 128, note: "DESede keySize 64 adjusted to 128 bits" };
    if (raw === 256) return { keySize: 192, note: "DESede keySize 256 adjusted to 192 bits" };
    return { keySize: 192, note: "" };
  }
  if (raw === 128 || raw === 192 || raw === 256) return { keySize: raw, note: "" };
  if (raw === 64) return { keySize: 128, note: "AES keySize 64 adjusted to 128 bits" };
  return { keySize: 128, note: "" };
}
function resolveProfileRef(profiles, args = {}) {
  const id = normalizeCryptoProfileId(args.profileId || args.id);
  const name = String(args.profileName || args.name || "").trim().toLowerCase();
  const index = Number(args.index);
  if (id) {
    return profiles.find((item) => item.id === id) || null;
  }
  if (name) {
    return profiles.find((item) => String(item.name || "").trim().toLowerCase() === name) || null;
  }
  if (Number.isInteger(index) && index >= 0 && index < profiles.length) {
    return profiles[index];
  }
  return null;
}
function resolveProfileRefs(profiles, args = {}) {
  if (!Array.isArray(profiles) || profiles.length === 0) return [];
  if (args.all === true) return profiles.slice();
  const idSet = /* @__PURE__ */ new Set();
  const addById = (value) => {
    const id = normalizeCryptoProfileId(value);
    if (!id) return;
    const found = profiles.find((item) => item.id === id);
    if (found) idSet.add(found.id);
  };
  const addByName = (value) => {
    const name = String(value || "").trim().toLowerCase();
    if (!name) return;
    for (const item of profiles) {
      if (String(item.name || "").trim().toLowerCase() === name) {
        idSet.add(item.id);
      }
    }
  };
  const addByIndex = (value) => {
    const index = Number(value);
    if (!Number.isInteger(index)) return;
    if (index < 0 || index >= profiles.length) return;
    idSet.add(profiles[index].id);
  };
  addById(args.profileId || args.id);
  addByName(args.profileName || args.name);
  addByIndex(args.index);
  if (Array.isArray(args.profileIds)) {
    args.profileIds.forEach(addById);
  }
  if (Array.isArray(args.profileNames)) {
    args.profileNames.forEach(addByName);
  }
  if (Array.isArray(args.indexes)) {
    args.indexes.forEach(addByIndex);
  }
  const query = String(args.query || "").trim().toLowerCase();
  if (query) {
    for (const item of profiles) {
      if (String(item.name || "").trim().toLowerCase().includes(query)) {
        idSet.add(item.id);
      }
    }
  }
  if (idSet.size === 0) {
    const single = resolveProfileRef(profiles, args);
    if (single) idSet.add(single.id);
  }
  return profiles.filter((item) => idSet.has(item.id));
}
function buildSymmetricConfig(args = {}, profile = null) {
  const source = profile || {};
  const algorithm = normalizeSymmetricAlgorithm(args.algorithm || source.algorithm);
  const mode = normalizeSymmetricMode(args.mode || source.mode);
  const keyEncoding = normalizeCryptoEncoding(args.keyEncoding || source.keyEncoding);
  const ivEncoding = normalizeCryptoEncoding(args.ivEncoding || source.ivEncoding);
  const keyValue = Object.prototype.hasOwnProperty.call(args, "key") ? String(args.key || "") : Object.prototype.hasOwnProperty.call(args, "keyValue") ? String(args.keyValue || "") : String(source.keyValue || "");
  const ivValue = Object.prototype.hasOwnProperty.call(args, "iv") ? String(args.iv || "") : Object.prototype.hasOwnProperty.call(args, "ivValue") ? String(args.ivValue || "") : String(source.ivValue || "");
  const keySpec = resolveKeySpec(algorithm, args.keySize || source.keySize);
  return {
    algorithm,
    mode,
    keySize: keySpec.keySize,
    keySizeNote: keySpec.note,
    keyEncoding,
    keyValue,
    ivEncoding,
    ivValue
  };
}
function getCryptoEngine(algorithm) {
  const algo = normalizeSymmetricAlgorithm(algorithm);
  if (algo === "DES") return CryptoJS.DES;
  if (algo === "DESEDE") return CryptoJS.TripleDES;
  return CryptoJS.AES;
}
function getCryptoMode(mode) {
  return normalizeSymmetricMode(mode) === "CBC" ? CryptoJS.mode.CBC : CryptoJS.mode.ECB;
}
function stripPemHeader(value) {
  const raw = String(value || "").trim();
  if (!raw.includes("-----BEGIN")) return raw.replace(/\s+/g, "");
  return raw.replace(/-----BEGIN [^-]+-----/g, "").replace(/-----END [^-]+-----/g, "").replace(/\s+/g, "");
}
function parseRSAKey(value, encoding, fieldName) {
  const mode = String(encoding || "").trim().toLowerCase();
  if (mode === "pem") {
    const body = stripPemHeader(value);
    const parsed = decodeBase64(body);
    if (!parsed) return { ok: false, error: `${fieldName} is not valid PEM/base64` };
    return { ok: true, bytes: parsed };
  }
  return parseBytes(value, mode === "hex" ? "hex" : "base64", fieldName);
}
function safeJsonParse(value, fallback = null) {
  try {
    return JSON.parse(String(value || ""));
  } catch (_err) {
    return fallback;
  }
}
function toProfileMeta(profile) {
  return {
    id: profile.id,
    name: profile.name,
    algorithm: profile.algorithm,
    mode: profile.mode,
    keySize: profile.keySize,
    keyEncoding: profile.keyEncoding,
    ivEncoding: profile.ivEncoding,
    description: profile.description,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt
  };
}
async function toolCryptoProfileList(args = {}) {
  const profiles = await loadCryptoProfiles();
  const includeSecret = !!args.includeSecret;
  return {
    ok: true,
    count: profiles.length,
    profiles: includeSecret ? profiles : profiles.map((item) => toProfileMeta(item))
  };
}
async function toolCryptoProfileGet(args = {}) {
  const profiles = await loadCryptoProfiles();
  const profile = resolveProfileRef(profiles, args);
  if (!profile) return { ok: false, error: "profile not found" };
  const includeSecret = args.includeSecret !== false;
  return { ok: true, profile: includeSecret ? profile : toProfileMeta(profile) };
}
async function toolCryptoProfileSave(args = {}) {
  const name = String(args.name || "").trim();
  if (!name) return { ok: false, error: "name is required" };
  const profiles = await loadCryptoProfiles();
  const now = Date.now();
  const found = resolveProfileRef(profiles, args);
  const nextProfile = normalizeCryptoProfile({
    ...found,
    ...args,
    id: normalizeCryptoProfileId(args.id) || found?.id || createCryptoProfileId(),
    name,
    createdAt: found?.createdAt || now,
    updatedAt: now
  });
  const next = profiles.filter((item) => item.id !== nextProfile.id);
  next.push(nextProfile);
  const saved = await saveCryptoProfiles(next);
  return { ok: true, profile: nextProfile, count: saved.length };
}
async function toolCryptoProfileDelete(args = {}) {
  const profiles = await loadCryptoProfiles();
  const targets = resolveProfileRefs(profiles, args);
  if (!targets.length) {
    return {
      ok: false,
      error: "profile not found, use id/name/index or profileIds/profileNames/indexes/all/query",
      available: profiles.map((item, idx) => ({ index: idx, id: item.id, name: item.name }))
    };
  }
  const idSet = new Set(targets.map((item) => item.id));
  const next = profiles.filter((item) => !idSet.has(item.id));
  const saved = await saveCryptoProfiles(next);
  return {
    ok: true,
    deleted: targets.length === 1 ? targets[0].id : targets.map((item) => item.id),
    deletedCount: targets.length,
    count: saved.length
  };
}
async function toolCryptoEncrypt(args = {}) {
  const profiles = await loadCryptoProfiles();
  const profile = resolveProfileRef(profiles, args);
  const cfg = buildSymmetricConfig(args, profile);
  if (!cfg.keyValue) return { ok: false, error: "key/keyValue is required" };
  const plainText = String(args.plaintext || args.text || "");
  const plainEncoding = normalizeCryptoEncoding(args.plainEncoding || args.inputEncoding || "utf8");
  const outputEncoding = String(args.outputEncoding || "base64").trim().toLowerCase() === "hex" ? "hex" : "base64";
  const keyParsed = parseBytes(cfg.keyValue, cfg.keyEncoding, "key");
  if (!keyParsed.ok) return keyParsed;
  const keyBytes = normalizeToSize(keyParsed.bytes, cfg.keySize);
  let ivBytes = new Uint8Array([]);
  if (cfg.mode === "CBC") {
    const ivParsed = parseBytes(cfg.ivValue, cfg.ivEncoding, "iv");
    if (!ivParsed.ok) return ivParsed;
    ivBytes = normalizeToSize(ivParsed.bytes, cfg.algorithm === "AES" ? 128 : 64);
  }
  const plainParsed = parseBytes(plainText, plainEncoding, "plaintext");
  if (!plainParsed.ok) return plainParsed;
  const options = { mode: getCryptoMode(cfg.mode), padding: CryptoJS.pad.Pkcs7 };
  if (cfg.mode === "CBC") {
    options.iv = bytesToWordArray(ivBytes);
  }
  try {
    const engine = getCryptoEngine(cfg.algorithm);
    const encrypted = engine.encrypt(bytesToWordArray(plainParsed.bytes), bytesToWordArray(keyBytes), options);
    const ciphertextBytes = wordArrayToBytes(encrypted.ciphertext);
    return {
      ok: true,
      algorithm: cfg.algorithm,
      mode: cfg.mode,
      keySize: cfg.keySize,
      keySizeNote: cfg.keySizeNote || void 0,
      outputEncoding,
      ciphertext: formatBytes(ciphertextBytes, outputEncoding),
      keyHex: encodeHex(keyBytes),
      ivHex: cfg.mode === "CBC" ? encodeHex(ivBytes) : ""
    };
  } catch (err) {
    return { ok: false, error: `crypto_encrypt failed: ${String(err)}` };
  }
}
async function toolCryptoDecrypt(args = {}) {
  const profiles = await loadCryptoProfiles();
  const profile = resolveProfileRef(profiles, args);
  const cfg = buildSymmetricConfig(args, profile);
  if (!cfg.keyValue) return { ok: false, error: "key/keyValue is required" };
  const cipherText = String(args.ciphertext || args.text || "");
  const cipherEncoding = String(args.cipherEncoding || args.inputEncoding || "base64").trim().toLowerCase() === "hex" ? "hex" : "base64";
  const outputEncoding = normalizeCryptoEncoding(args.outputEncoding || "utf8");
  const keyParsed = parseBytes(cfg.keyValue, cfg.keyEncoding, "key");
  if (!keyParsed.ok) return keyParsed;
  const keyBytes = normalizeToSize(keyParsed.bytes, cfg.keySize);
  let ivBytes = new Uint8Array([]);
  if (cfg.mode === "CBC") {
    const ivParsed = parseBytes(cfg.ivValue, cfg.ivEncoding, "iv");
    if (!ivParsed.ok) return ivParsed;
    ivBytes = normalizeToSize(ivParsed.bytes, cfg.algorithm === "AES" ? 128 : 64);
  }
  const cipherParsed = parseBytes(cipherText, cipherEncoding, "ciphertext");
  if (!cipherParsed.ok) return cipherParsed;
  const options = { mode: getCryptoMode(cfg.mode), padding: CryptoJS.pad.Pkcs7 };
  if (cfg.mode === "CBC") {
    options.iv = bytesToWordArray(ivBytes);
  }
  try {
    const engine = getCryptoEngine(cfg.algorithm);
    const cp = CryptoJS.lib.CipherParams.create({ ciphertext: bytesToWordArray(cipherParsed.bytes) });
    const plainWordArray = engine.decrypt(cp, bytesToWordArray(keyBytes), options);
    const plainBytes = wordArrayToBytes(plainWordArray);
    return {
      ok: true,
      algorithm: cfg.algorithm,
      mode: cfg.mode,
      keySize: cfg.keySize,
      keySizeNote: cfg.keySizeNote || void 0,
      outputEncoding,
      plaintext: formatBytes(plainBytes, outputEncoding),
      keyHex: encodeHex(keyBytes),
      ivHex: cfg.mode === "CBC" ? encodeHex(ivBytes) : ""
    };
  } catch (err) {
    return { ok: false, error: `crypto_decrypt failed: ${String(err)}` };
  }
}
async function toolCryptoEncryptDirect(args = {}) {
  const next = { ...args };
  delete next.profileId;
  delete next.profileName;
  return toolCryptoEncrypt(next);
}
async function toolCryptoDecryptDirect(args = {}) {
  const next = { ...args };
  delete next.profileId;
  delete next.profileName;
  return toolCryptoDecrypt(next);
}
async function toolRSAEncrypt(args = {}) {
  const keyEncoding = String(args.publicKeyEncoding || "base64").trim().toLowerCase();
  const keyParsed = parseRSAKey(args.publicKey || "", keyEncoding, "publicKey");
  if (!keyParsed.ok) return keyParsed;
  const inputEncoding = normalizeCryptoEncoding(args.inputEncoding || "utf8");
  const outputEncoding = String(args.outputEncoding || "base64").trim().toLowerCase() === "hex" ? "hex" : "base64";
  const hash = String(args.hash || "SHA-256").trim().toUpperCase();
  const hashName = hash === "SHA-1" || hash === "SHA-384" || hash === "SHA-512" ? hash : "SHA-256";
  const parsedText = parseBytes(String(args.plaintext || args.text || ""), inputEncoding, "plaintext");
  if (!parsedText.ok) return parsedText;
  try {
    const key = await crypto.subtle.importKey(
      "spki",
      keyParsed.bytes.buffer.slice(keyParsed.bytes.byteOffset, keyParsed.bytes.byteOffset + keyParsed.bytes.byteLength),
      { name: "RSA-OAEP", hash: hashName },
      false,
      ["encrypt"]
    );
    const encrypted = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, key, parsedText.bytes);
    return {
      ok: true,
      algorithm: "RSA-OAEP",
      hash: hashName,
      outputEncoding,
      ciphertext: formatBytes(new Uint8Array(encrypted), outputEncoding)
    };
  } catch (err) {
    return { ok: false, error: `rsa_encrypt failed: ${String(err)}` };
  }
}
async function toolRSADecrypt(args = {}) {
  const keyEncoding = String(args.privateKeyEncoding || "base64").trim().toLowerCase();
  const keyParsed = parseRSAKey(args.privateKey || "", keyEncoding, "privateKey");
  if (!keyParsed.ok) return keyParsed;
  const inputEncoding = String(args.inputEncoding || "base64").trim().toLowerCase() === "hex" ? "hex" : "base64";
  const outputEncoding = normalizeCryptoEncoding(args.outputEncoding || "utf8");
  const hash = String(args.hash || "SHA-256").trim().toUpperCase();
  const hashName = hash === "SHA-1" || hash === "SHA-384" || hash === "SHA-512" ? hash : "SHA-256";
  const parsedCipher = parseBytes(String(args.ciphertext || args.text || ""), inputEncoding, "ciphertext");
  if (!parsedCipher.ok) return parsedCipher;
  try {
    const key = await crypto.subtle.importKey(
      "pkcs8",
      keyParsed.bytes.buffer.slice(keyParsed.bytes.byteOffset, keyParsed.bytes.byteOffset + keyParsed.bytes.byteLength),
      { name: "RSA-OAEP", hash: hashName },
      false,
      ["decrypt"]
    );
    const decrypted = await crypto.subtle.decrypt({ name: "RSA-OAEP" }, key, parsedCipher.bytes);
    return {
      ok: true,
      algorithm: "RSA-OAEP",
      hash: hashName,
      outputEncoding,
      plaintext: formatBytes(new Uint8Array(decrypted), outputEncoding)
    };
  } catch (err) {
    return { ok: false, error: `rsa_decrypt failed: ${String(err)}` };
  }
}
async function toolRSAEncryptDirect(args = {}) {
  return toolRSAEncrypt(args);
}
async function toolRSADecryptDirect(args = {}) {
  return toolRSADecrypt(args);
}
async function toolRSAGenerateKeypair(args = {}) {
  const modulusLengthRaw = Number(args.modulusLength || 2048);
  const modulusLength = modulusLengthRaw === 1024 || modulusLengthRaw === 3072 || modulusLengthRaw === 4096 ? modulusLengthRaw : 2048;
  const hash = String(args.hash || "SHA-256").trim().toUpperCase();
  const hashName = hash === "SHA-1" || hash === "SHA-384" || hash === "SHA-512" ? hash : "SHA-256";
  const outputEncoding = String(args.outputEncoding || "base64").trim().toLowerCase() === "hex" ? "hex" : "base64";
  try {
    const keyPair = await crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: hashName
      },
      true,
      ["encrypt", "decrypt"]
    );
    const spki = new Uint8Array(await crypto.subtle.exportKey("spki", keyPair.publicKey));
    const pkcs8 = new Uint8Array(await crypto.subtle.exportKey("pkcs8", keyPair.privateKey));
    return {
      ok: true,
      algorithm: "RSA-OAEP",
      modulusLength,
      hash: hashName,
      outputEncoding,
      publicKey: formatBytes(spki, outputEncoding),
      privateKey: formatBytes(pkcs8, outputEncoding),
      publicKeyBase64: formatBytes(spki, "base64"),
      privateKeyBase64: formatBytes(pkcs8, "base64"),
      publicKeyHex: formatBytes(spki, "hex"),
      privateKeyHex: formatBytes(pkcs8, "hex")
    };
  } catch (err) {
    return { ok: false, error: `rsa_generate_keypair failed: ${String(err)}` };
  }
}
async function toolEncodingConvert(args = {}) {
  const fromEncoding = normalizeCryptoEncoding(args.from || args.fromEncoding || "utf8");
  const toEncoding = normalizeCryptoEncoding(args.to || args.toEncoding || "base64");
  const text = String(args.text || args.input || "");
  const parsed = parseBytes(text, fromEncoding, "input");
  if (!parsed.ok) return parsed;
  return {
    ok: true,
    fromEncoding,
    toEncoding,
    input: text,
    output: formatBytes(parsed.bytes, toEncoding)
  };
}
function normalizeHttpMethod(value) {
  const method = String(value || "GET").trim().toUpperCase();
  if (!method) return "GET";
  return method;
}
function normalizeHttpHeaders(value) {
  if (!value) return {};
  if (typeof value === "string") {
    const parsed = safeJsonParse(value, null);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
    return {};
  }
  if (typeof value === "object" && !Array.isArray(value)) return value;
  return {};
}
function buildURLWithQuery(urlText, query) {
  const u = new URL(String(urlText || ""));
  if (!query) return u.toString();
  let queryObj = query;
  if (typeof query === "string") {
    queryObj = safeJsonParse(query, null);
  }
  if (queryObj && typeof queryObj === "object" && !Array.isArray(queryObj)) {
    for (const [k, v] of Object.entries(queryObj)) {
      if (typeof v === "undefined" || v === null) continue;
      u.searchParams.set(k, String(v));
    }
  }
  return u.toString();
}
async function toolHttpRequest(args = {}) {
  const method = normalizeHttpMethod(args.method);
  const rawURL = String(args.url || "").trim();
  if (!rawURL) return { ok: false, error: "url is required" };
  let finalURL = "";
  try {
    finalURL = buildURLWithQuery(rawURL, args.query);
  } catch (err) {
    return { ok: false, error: `invalid url: ${String(err)}` };
  }
  const headers = normalizeHttpHeaders(args.headers);
  const timeoutSecRaw = Number(args.timeoutSec || 30);
  const timeoutSec = Math.min(300, Math.max(3, Number.isFinite(timeoutSecRaw) ? timeoutSecRaw : 30));
  const responseEncoding = normalizeCryptoEncoding(args.responseEncoding || "utf8");
  const responseType = String(args.responseType || "text").trim().toLowerCase();
  const includeResponseHeaders = args.includeResponseHeaders !== false;
  const maxResponseCharsRaw = Number(args.maxResponseChars || 2e5);
  const maxResponseChars = Math.min(1e6, Math.max(512, Number.isFinite(maxResponseCharsRaw) ? Math.floor(maxResponseCharsRaw) : 2e5));
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    try {
      controller.abort();
    } catch (_err) {
    }
  }, timeoutSec * 1e3);
  try {
    const fetchOptions = {
      method,
      headers,
      signal: controller.signal
    };
    if (method !== "GET" && method !== "HEAD") {
      const bodyType = String(args.bodyType || "auto").trim().toLowerCase();
      const body = args.body;
      if (bodyType === "json") {
        fetchOptions.body = typeof body === "string" ? body : JSON.stringify(body ?? {});
        if (!fetchOptions.headers["Content-Type"] && !fetchOptions.headers["content-type"]) {
          fetchOptions.headers["Content-Type"] = "application/json";
        }
      } else if (typeof body !== "undefined") {
        fetchOptions.body = typeof body === "string" ? body : JSON.stringify(body);
      }
    }
    const resp = await fetch(finalURL, fetchOptions);
    const respHeaders = {};
    if (includeResponseHeaders) {
      resp.headers.forEach((value, key) => {
        respHeaders[key] = value;
      });
    }
    let output = "";
    if (responseType === "arraybuffer" || responseType === "base64" || responseType === "hex") {
      const buf = new Uint8Array(await resp.arrayBuffer());
      if (responseType === "hex") {
        output = formatBytes(buf, "hex");
      } else {
        output = formatBytes(buf, "base64");
      }
    } else if (responseType === "json") {
      const json = await resp.json().catch(() => null);
      output = JSON.stringify(json, null, 2);
    } else {
      const txt = await resp.text();
      const clipped = txt.length > maxResponseChars ? `${txt.slice(0, maxResponseChars)} ...(truncated ${txt.length - maxResponseChars} chars)` : txt;
      if (responseEncoding === "utf8") {
        output = clipped;
      } else {
        output = formatBytes(new TextEncoder().encode(clipped), responseEncoding);
      }
    }
    return {
      ok: true,
      url: finalURL,
      method,
      status: resp.status,
      statusText: resp.statusText,
      headers: respHeaders,
      body: output
    };
  } catch (err) {
    return { ok: false, error: `http_request failed: ${String(err)}`, url: finalURL, method };
  } finally {
    clearTimeout(timeoutId);
  }
}
function secureRandomUint32() {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] >>> 0;
}
function randomIntInRange(min, max) {
  const lo = Math.ceil(Number(min));
  const hi = Math.floor(Number(max));
  if (!Number.isFinite(lo) || !Number.isFinite(hi) || hi < lo) {
    throw new Error("invalid range");
  }
  const range = hi - lo + 1;
  if (range <= 0) {
    throw new Error("range too large");
  }
  const maxUint = 4294967296;
  const limit = maxUint - maxUint % range;
  let x = 0;
  do {
    x = secureRandomUint32();
  } while (x >= limit);
  return lo + x % range;
}
function randomFloatInRange(min, max) {
  const lo = Number(min);
  const hi = Number(max);
  if (!Number.isFinite(lo) || !Number.isFinite(hi) || hi < lo) {
    throw new Error("invalid range");
  }
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  const unit = arr[0] / 4294967295;
  return lo + (hi - lo) * unit;
}
function randomBytes(size) {
  const n = Math.max(1, Math.floor(Number(size || 16)));
  const out = new Uint8Array(n);
  crypto.getRandomValues(out);
  return out;
}
function bytesToUuidV4(bytes16) {
  const b = bytes16 instanceof Uint8Array ? bytes16.slice(0, 16) : randomBytes(16);
  b[6] = b[6] & 15 | 64;
  b[8] = b[8] & 63 | 128;
  const hex = encodeHex(b);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}
function buildRandomCharset(args = {}) {
  const custom = String(args.customChars || args.chars || "");
  if (custom) return custom;
  const type = String(args.charset || "alnum").trim().toLowerCase();
  if (type === "numeric" || type === "number" || type === "digits") return "0123456789";
  if (type === "alpha" || type === "letters") return "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (type === "lower") return "abcdefghijklmnopqrstuvwxyz";
  if (type === "upper") return "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (type === "hex") return "0123456789abcdef";
  if (type === "base64") return "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  if (type === "base64url") return "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  return "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
}
async function toolRandomUUID() {
  const value = bytesToUuidV4(randomBytes(16));
  return { ok: true, uuid: value };
}
async function toolRandomUUID32() {
  const value = bytesToUuidV4(randomBytes(16)).replace(/-/g, "");
  return { ok: true, uuid32: value };
}
async function toolRandomString(args = {}) {
  const length = Math.max(1, Math.min(4096, Math.floor(Number(args.length || 16))));
  const chars = buildRandomCharset(args);
  if (!chars) return { ok: false, error: "charset is empty" };
  const uniq = Array.from(new Set(chars.split("")));
  if (uniq.length === 0) return { ok: false, error: "charset is empty" };
  let out = "";
  for (let i = 0; i < length; i += 1) {
    const idx = randomIntInRange(0, uniq.length - 1);
    out += uniq[idx];
  }
  return {
    ok: true,
    length,
    charset: String(args.charset || (args.customChars ? "custom" : "alnum")),
    value: out
  };
}
async function toolRandomNumber(args = {}) {
  const min = Number(Object.prototype.hasOwnProperty.call(args, "min") ? args.min : 0);
  const max = Number(Object.prototype.hasOwnProperty.call(args, "max") ? args.max : 100);
  const integer = args.integer !== false;
  if (!Number.isFinite(min) || !Number.isFinite(max) || max < min) {
    return { ok: false, error: "invalid range: min/max" };
  }
  if (integer) {
    try {
      const value = randomIntInRange(min, max);
      return { ok: true, min, max, integer: true, value };
    } catch (err) {
      return { ok: false, error: `random_number failed: ${String(err)}` };
    }
  }
  const precisionRaw = Number(args.precision);
  const precision = Number.isFinite(precisionRaw) ? Math.max(0, Math.min(12, Math.floor(precisionRaw))) : null;
  try {
    let value = randomFloatInRange(min, max);
    if (precision !== null) {
      value = Number(value.toFixed(precision));
    }
    return { ok: true, min, max, integer: false, precision: precision === null ? void 0 : precision, value };
  } catch (err) {
    return { ok: false, error: `random_number failed: ${String(err)}` };
  }
}
function normalizeDigestAlgorithm(value) {
  const raw = String(value || "").trim().toUpperCase().replace(/-/g, "");
  if (raw === "MD5") return "MD5";
  if (raw === "SHA1") return "SHA1";
  if (raw === "SHA256") return "SHA256";
  if (raw === "SHA512") return "SHA512";
  return "SHA256";
}
function computeDigestWordArray(algorithm, wordArray) {
  const algo = normalizeDigestAlgorithm(algorithm);
  if (algo === "MD5") return CryptoJS.MD5(wordArray);
  if (algo === "SHA1") return CryptoJS.SHA1(wordArray);
  if (algo === "SHA512") return CryptoJS.SHA512(wordArray);
  return CryptoJS.SHA256(wordArray);
}
function computeHmacWordArray(algorithm, messageWordArray, keyWordArray) {
  const algo = normalizeDigestAlgorithm(algorithm);
  if (algo === "MD5") return CryptoJS.HmacMD5(messageWordArray, keyWordArray);
  if (algo === "SHA1") return CryptoJS.HmacSHA1(messageWordArray, keyWordArray);
  if (algo === "SHA512") return CryptoJS.HmacSHA512(messageWordArray, keyWordArray);
  return CryptoJS.HmacSHA256(messageWordArray, keyWordArray);
}
async function toolHashDigest(args = {}) {
  const text = String(args.text || args.input || "");
  const inputEncoding = normalizeCryptoEncoding(args.inputEncoding || "utf8");
  const outputEncoding = String(args.outputEncoding || "hex").trim().toLowerCase() === "base64" ? "base64" : "hex";
  const parsed = parseBytes(text, inputEncoding, "input");
  if (!parsed.ok) return parsed;
  try {
    const digestWordArray = computeDigestWordArray(args.algorithm || "SHA256", bytesToWordArray(parsed.bytes));
    const digestBytes = wordArrayToBytes(digestWordArray);
    return {
      ok: true,
      algorithm: normalizeDigestAlgorithm(args.algorithm || "SHA256"),
      inputEncoding,
      outputEncoding,
      digest: formatBytes(digestBytes, outputEncoding)
    };
  } catch (err) {
    return { ok: false, error: `hash_digest failed: ${String(err)}` };
  }
}
async function toolHmacSign(args = {}) {
  const text = String(args.text || args.input || "");
  const key = String(args.key || "");
  if (!key) return { ok: false, error: "key is required" };
  const inputEncoding = normalizeCryptoEncoding(args.inputEncoding || "utf8");
  const keyEncoding = normalizeCryptoEncoding(args.keyEncoding || "utf8");
  const outputEncoding = String(args.outputEncoding || "hex").trim().toLowerCase() === "base64" ? "base64" : "hex";
  const parsedText = parseBytes(text, inputEncoding, "input");
  if (!parsedText.ok) return parsedText;
  const parsedKey = parseBytes(key, keyEncoding, "key");
  if (!parsedKey.ok) return parsedKey;
  try {
    const macWordArray = computeHmacWordArray(
      args.algorithm || "SHA256",
      bytesToWordArray(parsedText.bytes),
      bytesToWordArray(parsedKey.bytes)
    );
    const macBytes = wordArrayToBytes(macWordArray);
    return {
      ok: true,
      algorithm: normalizeDigestAlgorithm(args.algorithm || "SHA256"),
      inputEncoding,
      keyEncoding,
      outputEncoding,
      hmac: formatBytes(macBytes, outputEncoding)
    };
  } catch (err) {
    return { ok: false, error: `hmac_sign failed: ${String(err)}` };
  }
}
async function toolUrlEncode(args = {}) {
  const text = String(args.text || "");
  const component = args.component !== false;
  try {
    return { ok: true, encoded: component ? encodeURIComponent(text) : encodeURI(text), component };
  } catch (err) {
    return { ok: false, error: `url_encode failed: ${String(err)}` };
  }
}
async function toolUrlDecode(args = {}) {
  const text = String(args.text || "");
  const component = args.component !== false;
  const plusAsSpace = !!args.plusAsSpace;
  try {
    const input = plusAsSpace ? text.replace(/\+/g, "%20") : text;
    return { ok: true, decoded: component ? decodeURIComponent(input) : decodeURI(input), component, plusAsSpace };
  } catch (err) {
    return { ok: false, error: `url_decode failed: ${String(err)}` };
  }
}
function decodeBase64URL(text) {
  const raw = String(text || "").trim().replace(/-/g, "+").replace(/_/g, "/");
  const pad = raw.length % 4 === 0 ? "" : "=".repeat(4 - raw.length % 4);
  return decodeBase64(raw + pad);
}
function parseJsonLoose(text) {
  try {
    return JSON.parse(String(text || ""));
  } catch (_err) {
    return null;
  }
}
async function toolJwtDecode(args = {}) {
  const token = String(args.token || "").trim();
  if (!token) return { ok: false, error: "token is required" };
  const parts = token.split(".");
  if (parts.length < 2) return { ok: false, error: "invalid jwt token" };
  const headerBytes = decodeBase64URL(parts[0]);
  const payloadBytes = decodeBase64URL(parts[1]);
  if (!headerBytes || !payloadBytes) return { ok: false, error: "invalid base64url in jwt" };
  const headerText = new TextDecoder().decode(headerBytes);
  const payloadText = new TextDecoder().decode(payloadBytes);
  return {
    ok: true,
    header: parseJsonLoose(headerText) ?? headerText,
    payload: parseJsonLoose(payloadText) ?? payloadText,
    signature: parts[2] || "",
    validFormat: parts.length >= 3
  };
}
function parseJsonPath(pathText) {
  const path = String(pathText || "").trim();
  if (!path || path[0] !== "$") return { ok: false, error: "jsonpath must start with $" };
  const tokens = [];
  let i = 1;
  while (i < path.length) {
    const ch = path[i];
    if (ch === ".") {
      i += 1;
      if (path[i] === "*") {
        tokens.push({ type: "wildcard" });
        i += 1;
        continue;
      }
      let j = i;
      while (j < path.length && /[A-Za-z0-9_$-]/.test(path[j])) j += 1;
      if (j === i) return { ok: false, error: `invalid token near . at ${i}` };
      tokens.push({ type: "prop", key: path.slice(i, j) });
      i = j;
      continue;
    }
    if (ch === "[") {
      i += 1;
      if (path[i] === "*") {
        i += 1;
        if (path[i] !== "]") return { ok: false, error: "expected ] after [*]" };
        tokens.push({ type: "wildcard" });
        i += 1;
        continue;
      }
      if (path[i] === "'" || path[i] === '"') {
        const quote = path[i];
        i += 1;
        let j = i;
        while (j < path.length && path[j] !== quote) j += 1;
        if (j >= path.length) return { ok: false, error: "unterminated quoted property" };
        const key = path.slice(i, j);
        j += 1;
        if (path[j] !== "]") return { ok: false, error: "expected ] after quoted property" };
        tokens.push({ type: "prop", key });
        i = j + 1;
        continue;
      }
      let j = i;
      while (j < path.length && /[-0-9]/.test(path[j])) j += 1;
      const indexText = path.slice(i, j);
      if (!indexText || !/^-?\d+$/.test(indexText)) return { ok: false, error: `invalid array index near ${i}` };
      if (path[j] !== "]") return { ok: false, error: "expected ] after index" };
      tokens.push({ type: "index", index: Number(indexText) });
      i = j + 1;
      continue;
    }
    if (/\s/.test(ch)) {
      i += 1;
      continue;
    }
    return { ok: false, error: `unexpected token '${ch}' at ${i}` };
  }
  return { ok: true, tokens };
}
function applyJsonPath(root, tokens) {
  let nodes = [root];
  for (const token of tokens) {
    const next = [];
    for (const node of nodes) {
      if (token.type === "prop") {
        if (node && typeof node === "object" && Object.prototype.hasOwnProperty.call(node, token.key)) {
          next.push(node[token.key]);
        }
      } else if (token.type === "index") {
        if (Array.isArray(node)) {
          const idx = token.index < 0 ? node.length + token.index : token.index;
          if (idx >= 0 && idx < node.length) next.push(node[idx]);
        }
      } else if (token.type === "wildcard") {
        if (Array.isArray(node)) {
          for (const item of node) next.push(item);
        } else if (node && typeof node === "object") {
          for (const value of Object.values(node)) next.push(value);
        }
      }
    }
    nodes = next;
  }
  return nodes;
}
async function toolJsonpathQuery(args = {}) {
  const path = String(args.path || "").trim();
  if (!path) return { ok: false, error: "path is required" };
  let input = args.json;
  if (typeof input === "string") {
    input = safeJsonParse(input, null);
  }
  if (typeof input === "undefined" || input === null) {
    return { ok: false, error: "json input is required" };
  }
  const parsed = parseJsonPath(path);
  if (!parsed.ok) return parsed;
  const results = applyJsonPath(input, parsed.tokens);
  const firstOnly = !!args.firstOnly;
  return {
    ok: true,
    path,
    count: results.length,
    result: firstOnly ? results[0] ?? null : results
  };
}
async function toolRegexExtract(args = {}) {
  const text = String(args.text || "");
  const pattern = String(args.pattern || "");
  if (!pattern) return { ok: false, error: "pattern is required" };
  const rawFlags = String(args.flags || "").toLowerCase().replace(/[^gimsuy]/g, "");
  const all = args.all !== false;
  const group = Number.isFinite(Number(args.group)) ? Number(args.group) : 0;
  const limitRaw = Number(args.limit || 50);
  const limit = Math.max(1, Math.min(500, Number.isFinite(limitRaw) ? Math.floor(limitRaw) : 50));
  try {
    if (!all) {
      const reg = new RegExp(pattern, rawFlags.replace(/g/g, ""));
      const m = reg.exec(text);
      if (!m) return { ok: true, matched: false, match: null };
      return {
        ok: true,
        matched: true,
        match: {
          index: m.index,
          full: m[0],
          groups: Array.from(m).slice(1),
          value: typeof m[group] === "undefined" ? null : m[group]
        }
      };
    }
    const flags = rawFlags.includes("g") ? rawFlags : `${rawFlags}g`;
    const reg = new RegExp(pattern, flags);
    const list = [];
    let m;
    while ((m = reg.exec(text)) && list.length < limit) {
      list.push({
        index: m.index,
        full: m[0],
        groups: Array.from(m).slice(1),
        value: typeof m[group] === "undefined" ? null : m[group]
      });
      if (m[0] === "") {
        reg.lastIndex += 1;
      }
    }
    return { ok: true, matched: list.length > 0, count: list.length, matches: list };
  } catch (err) {
    return { ok: false, error: `regex_extract failed: ${String(err)}` };
  }
}
function maskSecret(value) {
  const raw = String(value || "");
  if (!raw) return "";
  if (raw.length <= 8) return "****";
  return `${raw.slice(0, 3)}***${raw.slice(-3)}`;
}
function findMcpServiceByArgs(list, args = {}) {
  const id = String(args.serviceId || args.id || "").trim();
  const name = String(args.serviceName || args.name || "").trim().toLowerCase();
  const index = Number(args.index);
  if (id) {
    const item = list.find((x) => x.id === id);
    if (item) return item;
  }
  if (name) {
    const item = list.find((x) => String(x.name || "").trim().toLowerCase() === name);
    if (item) return item;
  }
  if (Number.isInteger(index) && index >= 0 && index < list.length) {
    return list[index];
  }
  return null;
}
function pickMcpPayload(args = {}) {
  if (args.service && typeof args.service === "object" && !Array.isArray(args.service)) {
    return args.service;
  }
  const out = {};
  const fields = ["id", "name", "enabled", "transport", "baseURL", "apiKey", "mcpHeaders", "headers", "command", "args", "envText"];
  for (const field of fields) {
    if (Object.prototype.hasOwnProperty.call(args, field)) {
      out[field] = args[field];
    }
  }
  return out;
}
async function toolMcpServiceList(args = {}) {
  const settings = await getSettings();
  const includeSecret = !!args.includeSecret;
  const list = normalizeMcpServices(settings.mcpServices || []);
  const services = includeSecret ? list : list.map((item) => ({
    ...item,
    apiKey: maskSecret(item.apiKey),
    mcpHeaders: Array.isArray(item.mcpHeaders) ? item.mcpHeaders.map((h) => ({
      ...h,
      value: maskSecret(h?.value)
    })) : []
  }));
  return { ok: true, count: services.length, services };
}
async function toolMcpServiceUpsert(args = {}) {
  const settings = await getSettings();
  const current = normalizeMcpServices(settings.mcpServices || []);
  const payload = pickMcpPayload(args);
  const found = findMcpServiceByArgs(current, args);
  const requestedName = String(args.serviceName || "").trim();
  const merged = normalizeMcpService({
    ...(found || {}),
    ...payload,
    name: String(payload.name || requestedName || found?.name || ""),
    id: String(payload.id || found?.id || createMcpServiceId())
  });
  if (!String(merged.name || "").trim()) {
    merged.name = `MCP-${merged.transport}-${merged.id.slice(-6)}`;
  }
  const next = current.filter((item) => item.id !== merged.id);
  next.push(merged);
  await saveSettings({ ...(settings || {}), mcpServices: next });
  return { ok: true, action: found ? "updated" : "created", service: merged, count: next.length };
}
async function toolMcpServiceSetEnabled(args = {}) {
  const settings = await getSettings();
  const current = normalizeMcpServices(settings.mcpServices || []);
  const found = findMcpServiceByArgs(current, args);
  if (!found) return { ok: false, error: "mcp service not found" };
  const enabled = args.enabled !== false;
  const next = current.map((item) => item.id === found.id ? { ...item, enabled } : item);
  await saveSettings({ ...(settings || {}), mcpServices: next });
  return { ok: true, serviceId: found.id, enabled };
}
async function toolMcpServiceTest(args = {}) {
  const settings = await getSettings();
  const current = normalizeMcpServices(settings.mcpServices || []);
  let service = null;
  if (args.service && typeof args.service === "object") {
    service = normalizeMcpService(args.service);
  } else {
    service = findMcpServiceByArgs(current, args);
  }
  if (!service) return { ok: false, error: "mcp service not found" };
  const result = await fetchMCPToolsForService(service);
  if (!result.ok) {
    return { ok: false, service: { id: service.id, name: service.name, transport: service.transport, baseURL: service.baseURL }, error: result.error || "test failed" };
  }
  const tools = Array.isArray(result.tools) ? result.tools : [];
  return {
    ok: true,
    service: { id: service.id, name: service.name, transport: service.transport, baseURL: service.baseURL },
    toolCount: tools.length,
    toolNames: tools.map((t) => String(t?.name || "").trim()).filter(Boolean).slice(0, 200)
  };
}
async function waitTabComplete(tabId, timeoutMs = 15e3) {
  const timeout = Math.max(1e3, Number(timeoutMs || 0));
  try {
    const current = await chrome.tabs.get(tabId);
    if (current?.status === "complete") {
      return { ok: true, timeout: false };
    }
  } catch (_err) {
  }
  return await new Promise((resolve) => {
    let done = false;
    const cleanup = () => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      chrome.tabs.onUpdated.removeListener(onUpdated);
      chrome.tabs.onRemoved.removeListener(onRemoved);
    };
    const finish = (value) => {
      cleanup();
      resolve(value);
    };
    const onUpdated = (updatedTabId, info) => {
      if (updatedTabId !== tabId) return;
      if (info?.status === "complete") {
        finish({ ok: true, timeout: false });
      }
    };
    const onRemoved = (removedTabId) => {
      if (removedTabId !== tabId) return;
      finish({ ok: false, timeout: false, error: "tab was closed" });
    };
    const timer = setTimeout(() => {
      finish({ ok: false, timeout: true, error: `tab load timeout after ${Math.ceil(timeout / 1e3)}s` });
    }, timeout);
    chrome.tabs.onUpdated.addListener(onUpdated);
    chrome.tabs.onRemoved.addListener(onRemoved);
  });
}
async function toolOpenURL(tabId, args = {}) {
  const url = String(args.url || args.href || "").trim();
  if (!url) return { ok: false, error: "url is required" };
  let parsed = null;
  try {
    parsed = new URL(url);
  } catch (_err) {
    return { ok: false, error: "invalid url" };
  }
  const protocol = String(parsed.protocol || "").toLowerCase();
  const allowProtocol = protocol === "http:" || protocol === "https:" || protocol === "file:" || protocol === "about:";
  if (!allowProtocol) {
    return { ok: false, error: `unsupported protocol: ${protocol}` };
  }
  const waitUntilComplete = args.waitUntilComplete !== false;
  const timeoutSec = Number(args.timeoutSec || 20);
  const timeoutMs = Math.max(1e3, Math.min(120e3, Number.isFinite(timeoutSec) ? timeoutSec * 1e3 : 20e3));
  try {
    await chrome.tabs.update(tabId, { url: parsed.toString() });
    if (waitUntilComplete) {
      const waitResult = await waitTabComplete(tabId, timeoutMs);
      if (!waitResult.ok) {
        return { ok: false, error: waitResult.error || "tab load failed", timeout: !!waitResult.timeout, url: parsed.toString() };
      }
    }
    const current = await chrome.tabs.get(tabId);
    return {
      ok: true,
      url: String(current?.url || parsed.toString()),
      title: String(current?.title || ""),
      status: String(current?.status || "")
    };
  } catch (err) {
    return { ok: false, error: String(err || "open_url failed"), url: parsed.toString() };
  }
}
async function sleepMs(ms) {
  const wait = Math.max(0, Number(ms || 0));
  if (!wait) return;
  await new Promise((resolve) => setTimeout(resolve, wait));
}
async function toolWaitForElement(tabId, args = {}) {
  const selector = String(args.selector || "").trim();
  if (!selector) return { ok: false, error: "selector is required" };
  const text = String(args.text || "").trim();
  const exact = !!args.exact;
  const visibleOnly = args.visibleOnly !== false;
  const timeoutSecRaw = Number(args.timeoutSec || 15);
  const timeoutSec = Math.max(1, Math.min(120, Number.isFinite(timeoutSecRaw) ? timeoutSecRaw : 15));
  const intervalMsRaw = Number(args.intervalMs || 250);
  const intervalMs = Math.max(50, Math.min(2e3, Number.isFinite(intervalMsRaw) ? intervalMsRaw : 250));
  const start = Date.now();
  const deadline = start + timeoutSec * 1e3;
  let lastCount = 0;
  while (Date.now() <= deadline) {
    const result = await execOnTab(tabId, (sel, targetText, useExact, onlyVisible) => {
      const normalize = (v) => String(v || "").replace(/\s+/g, " ").trim();
      const isVisible = (el) => {
        if (!onlyVisible) return true;
        const style = window.getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") return false;
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      };
      const getText = (el) => normalize(el.innerText || el.textContent || el.value || el.getAttribute("aria-label") || "");
      const list = Array.from(document.querySelectorAll(sel)).filter((el) => {
        if (!isVisible(el)) return false;
        if (!targetText) return true;
        const t = getText(el);
        return useExact ? t === targetText : t.includes(targetText);
      });
      const first = list[0] || null;
      return {
        ok: true,
        found: list.length > 0,
        count: list.length,
        first: first ? {
          tag: String(first.tagName || "").toLowerCase(),
          text: getText(first).slice(0, 240)
        } : null
      };
    }, [selector, text, exact, visibleOnly]);
    if (result?.ok && result.found) {
      return {
        ok: true,
        selector,
        count: Number(result.count || 0),
        first: result.first || null,
        elapsedMs: Date.now() - start
      };
    }
    lastCount = Number(result?.count || 0);
    await sleepMs(intervalMs);
  }
  return {
    ok: false,
    error: `wait_for_element timeout after ${timeoutSec}s`,
    selector,
    count: lastCount,
    elapsedMs: Date.now() - start
  };
}
async function toolAssertPageState(tabId, args = {}) {
  const checks = Array.isArray(args.checks) ? args.checks : [];
  if (checks.length === 0) {
    return { ok: false, error: "checks is required and must be non-empty array" };
  }
  const normalizedChecks = checks.slice(0, 50).map((item) => item && typeof item === "object" ? item : {});
  const pageInfo = await execOnTab(tabId, () => ({
    ok: true,
    url: location.href,
    title: document.title || "",
    bodyText: String(document.body?.innerText || "").slice(0, 3e5)
  }));
  const results = [];
  for (const check of normalizedChecks) {
    const type = String(check.type || "").trim().toLowerCase();
    if (type === "selector") {
      const selector = String(check.selector || "").trim();
      if (!selector) {
        results.push({ ok: false, type, error: "selector is required" });
        continue;
      }
      const text = String(check.text || "").trim();
      const exact = !!check.exact;
      const visibleOnly = check.visibleOnly !== false;
      const minCountRaw = Number(check.minCount);
      const maxCountRaw = Number(check.maxCount);
      const minCount = Number.isFinite(minCountRaw) ? Math.max(0, Math.floor(minCountRaw)) : 1;
      const maxCount = Number.isFinite(maxCountRaw) ? Math.max(minCount, Math.floor(maxCountRaw)) : Number.POSITIVE_INFINITY;
      const data = await execOnTab(tabId, (sel, targetText, useExact, onlyVisible) => {
        const normalize = (v) => String(v || "").replace(/\s+/g, " ").trim();
        const isVisible = (el) => {
          if (!onlyVisible) return true;
          const style = window.getComputedStyle(el);
          if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") return false;
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        };
        const getText = (el) => normalize(el.innerText || el.textContent || el.value || el.getAttribute("aria-label") || "");
        const list = Array.from(document.querySelectorAll(sel)).filter((el) => {
          if (!isVisible(el)) return false;
          if (!targetText) return true;
          const t = getText(el);
          return useExact ? t === targetText : t.includes(targetText);
        });
        return { ok: true, count: list.length };
      }, [selector, text, exact, visibleOnly]);
      const count = Number(data?.count || 0);
      const pass = count >= minCount && count <= maxCount;
      results.push({
        ok: pass,
        type,
        selector,
        count,
        minCount,
        maxCount: Number.isFinite(maxCount) ? maxCount : null
      });
      continue;
    }
    if (type === "url") {
      const contains = String(check.contains || check.value || "").trim();
      if (!contains) {
        results.push({ ok: false, type, error: "contains is required" });
        continue;
      }
      const current = String(pageInfo?.url || "");
      results.push({ ok: current.includes(contains), type, contains, current });
      continue;
    }
    if (type === "title") {
      const contains = String(check.contains || check.value || "").trim();
      if (!contains) {
        results.push({ ok: false, type, error: "contains is required" });
        continue;
      }
      const current = String(pageInfo?.title || "");
      results.push({ ok: current.includes(contains), type, contains, current });
      continue;
    }
    if (type === "page_text") {
      const contains = String(check.contains || check.value || "").trim();
      if (!contains) {
        results.push({ ok: false, type, error: "contains is required" });
        continue;
      }
      const current = String(pageInfo?.bodyText || "");
      results.push({ ok: current.includes(contains), type, contains, matched: current.includes(contains) });
      continue;
    }
    results.push({ ok: false, type, error: "unsupported check type, use selector/url/title/page_text" });
  }
  const passed = results.filter((item) => item.ok).length;
  const failed = results.length - passed;
  return {
    ok: failed === 0,
    passed,
    failed,
    total: results.length,
    results
  };
}
function toolToolList(args = {}, ctx = {}) {
  const includeParameters = !!args.includeParameters;
  const includeDescription = args.includeDescription !== false;
  const all = buildToolSpecs(!!ctx?.settings?.allowScript, ctx?.mcpRegistry?.toolSpecs || []);
  const tools = all.map((item) => {
    const fn = item?.function || {};
    const row = {
      name: String(fn.name || ""),
      source: String(fn.name || "").startsWith("mcp_") ? "mcp" : "local"
    };
    if (includeDescription) {
      row.description = String(fn.description || "");
    }
    if (includeParameters) {
      row.parameters = fn.parameters || {};
    }
    return row;
  }).filter((item) => item.name);
  return { ok: true, count: tools.length, tools };
}
async function toolBatchExecute(args = {}, ctx = {}) {
  const steps = Array.isArray(args.steps) ? args.steps : [];
  if (!steps.length) return { ok: false, error: "steps is required and must be non-empty array" };
  const stopOnError = args.stopOnError !== false;
  const maxStepsRaw = Number(args.maxSteps || 20);
  const maxSteps = Math.max(1, Math.min(100, Number.isFinite(maxStepsRaw) ? Math.floor(maxStepsRaw) : 20));
  const runList = steps.slice(0, maxSteps);
  const results = [];
  for (let i = 0; i < runList.length; i += 1) {
    const step = runList[i] && typeof runList[i] === "object" ? runList[i] : {};
    const name = String(step.name || step.tool || "").trim();
    let stepArgs = {};
    if (step.args && typeof step.args === "object") {
      stepArgs = step.args;
    } else if (typeof step.args === "string") {
      try {
        const parsed = JSON.parse(step.args);
        if (parsed && typeof parsed === "object") {
          stepArgs = parsed;
        }
      } catch (_err) {
      }
    }
    if (!name) {
      const bad = { ok: false, error: "step.name is required", index: i };
      results.push({ index: i, name: "", result: bad });
      if (stopOnError) break;
      continue;
    }
    if (name === "batch_execute") {
      const bad = { ok: false, error: "nested batch_execute is not allowed", index: i };
      results.push({ index: i, name, result: bad });
      if (stopOnError) break;
      continue;
    }
    const call = {
      id: `batch_${Date.now()}_${i}`,
      function: {
        name,
        arguments: JSON.stringify(stepArgs || {})
      }
    };
    const toolResult = await executeToolCall(call, {
      ...ctx,
      depth: Number(ctx?.depth || 0) + 1
    });
    results.push({ index: i, name, result: toolResult });
    if (stopOnError && !toolResult?.ok) {
      break;
    }
  }
  const failed = results.filter((item) => !item?.result?.ok).length;
  return {
    ok: failed === 0,
    total: runList.length,
    executed: results.length,
    failed,
    results
  };
}
async function toolClickElement(tabId, args = {}) {
  const selector = String(args.selector || "button,a,[role='button'],input[type='button'],input[type='submit']").trim();
  const text = String(args.text || "").trim();
  const exact = !!args.exact;
  const all = !!args.all;
  const index = Math.max(0, Number.isFinite(Number(args.index)) ? Math.floor(Number(args.index)) : 0);
  const visibleOnly = args.visibleOnly !== false;
  if (!selector) return { ok: false, error: "selector is required" };
  return execOnTab(tabId, (sel, targetText, useExact, clickAll, idx, onlyVisible) => {
    const normalize = (v) => String(v || "").replace(/\s+/g, " ").trim();
    const isVisible = (el) => {
      if (!onlyVisible) return true;
      const style = window.getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };
    const getText = (el) => normalize(el.innerText || el.textContent || el.value || el.getAttribute("aria-label") || "");
    const getSelector = (el) => {
      if (el.id) return `#${CSS.escape(el.id)}`;
      const parts = [];
      let cur = el;
      while (cur && cur.nodeType === 1 && parts.length < 6) {
        let part = cur.tagName.toLowerCase();
        if (cur.classList?.length) {
          part += "." + Array.from(cur.classList).slice(0, 2).map((x) => CSS.escape(x)).join(".");
        }
        if (cur.parentElement) {
          const same = Array.from(cur.parentElement.children).filter((n) => n.tagName === cur.tagName);
          if (same.length > 1) part += `:nth-of-type(${same.indexOf(cur) + 1})`;
        }
        parts.unshift(part);
        cur = cur.parentElement;
      }
      return parts.join(" > ");
    };
    let list = Array.from(document.querySelectorAll(sel)).filter((el) => isVisible(el));
    if (targetText) {
      list = list.filter((el) => {
        const t = getText(el);
        return useExact ? t === targetText : t.includes(targetText);
      });
    }
    if (!list.length) return { ok: false, error: "no element matched" };
    const targets = clickAll ? list : [list[Math.min(idx, list.length - 1)]];
    let clicked = 0;
    const details = [];
    for (const el of targets) {
      try {
        el.scrollIntoView({ behavior: "auto", block: "center", inline: "center" });
      } catch (_err) {
      }
      try {
        el.click();
        clicked += 1;
        details.push({ tag: el.tagName.toLowerCase(), text: getText(el).slice(0, 200), selector: getSelector(el) });
      } catch (_err) {
      }
    }
    return { ok: true, clicked, matches: list.length, targets: details };
  }, [selector, text, exact, all, index, visibleOnly]);
}
async function toolInputText(tabId, args = {}) {
  const selector = String(args.selector || "").trim();
  const text = String(args.text || "");
  const append = !!args.append;
  const all = !!args.all;
  const index = Math.max(0, Number.isFinite(Number(args.index)) ? Math.floor(Number(args.index)) : 0);
  if (!selector) return { ok: false, error: "selector is required" };
  return execOnTab(tabId, (sel, value, doAppend, inputAll, idx) => {
    const list = Array.from(document.querySelectorAll(sel));
    if (!list.length) return { ok: false, error: "no element matched" };
    const targets = inputAll ? list : [list[Math.min(idx, list.length - 1)]];
    let updated = 0;
    const details = [];
    for (const el of targets) {
      let oldValue = "";
      let nextValue = "";
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
        oldValue = String(el.value || "");
        nextValue = doAppend ? oldValue + value : value;
        el.focus();
        el.value = nextValue;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
        updated += 1;
      } else if (el && el.isContentEditable) {
        oldValue = String(el.innerText || "");
        nextValue = doAppend ? oldValue + value : value;
        el.focus();
        el.innerText = nextValue;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        updated += 1;
      }
      details.push({
        tag: el?.tagName?.toLowerCase?.() || "",
        oldValue: oldValue.slice(0, 200),
        newValue: nextValue.slice(0, 200)
      });
    }
    return { ok: true, updated, matches: list.length, targets: details };
  }, [selector, text, append, all, index]);
}
async function toolSelectOption(tabId, args = {}) {
  const selector = String(args.selector || "").trim();
  const byValue = Object.prototype.hasOwnProperty.call(args, "value") ? String(args.value || "") : "";
  const byText = Object.prototype.hasOwnProperty.call(args, "text") ? String(args.text || "") : "";
  const byIndex = Number.isFinite(Number(args.optionIndex)) ? Math.floor(Number(args.optionIndex)) : null;
  const all = !!args.all;
  const index = Math.max(0, Number.isFinite(Number(args.index)) ? Math.floor(Number(args.index)) : 0);
  if (!selector) return { ok: false, error: "selector is required" };
  return execOnTab(tabId, (sel, value, text, optionIndex, selectAll, idx) => {
    const list = Array.from(document.querySelectorAll(sel)).filter((el) => el instanceof HTMLSelectElement);
    if (!list.length) return { ok: false, error: "no select matched" };
    const targets = selectAll ? list : [list[Math.min(idx, list.length - 1)]];
    let updated = 0;
    const details = [];
    for (const el of targets) {
      let selectedIndex = -1;
      if (Number.isInteger(optionIndex) && optionIndex >= 0 && optionIndex < el.options.length) {
        selectedIndex = optionIndex;
      } else if (value) {
        selectedIndex = Array.from(el.options).findIndex((opt) => String(opt.value) === value);
      } else if (text) {
        selectedIndex = Array.from(el.options).findIndex((opt) => String(opt.text || "").trim() === text);
      } else {
        selectedIndex = 0;
      }
      if (selectedIndex >= 0) {
        el.selectedIndex = selectedIndex;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
        updated += 1;
        const opt = el.options[selectedIndex];
        details.push({
          selectedIndex,
          selectedValue: String(opt?.value || ""),
          selectedText: String(opt?.text || "")
        });
      }
    }
    return { ok: true, updated, matches: list.length, targets: details };
  }, [selector, byValue, byText, byIndex, all, index]);
}
async function toolScrollTo(tabId, args = {}) {
  const selector = String(args.selector || "").trim();
  const top = Number(args.top);
  const left = Number(args.left);
  const behavior = String(args.behavior || "auto").trim().toLowerCase() === "smooth" ? "smooth" : "auto";
  return execOnTab(tabId, (sel, y, x, scrollBehavior) => {
    if (sel) {
      const el = document.querySelector(sel);
      if (!el) return { ok: false, error: "selector not found" };
      el.scrollIntoView({ behavior: scrollBehavior, block: "center", inline: "center" });
      const rect = el.getBoundingClientRect();
      return { ok: true, mode: "element", rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }, scroll: { x: window.scrollX, y: window.scrollY } };
    }
    const nextTop = Number.isFinite(y) ? y : window.scrollY;
    const nextLeft = Number.isFinite(x) ? x : window.scrollX;
    window.scrollTo({ top: nextTop, left: nextLeft, behavior: scrollBehavior });
    return { ok: true, mode: "position", scroll: { x: window.scrollX, y: window.scrollY } };
  }, [selector, top, left, behavior]);
}
async function toolQueryByText(tabId, args = {}) {
  const text = String(args.text || "").trim();
  if (!text) return { ok: false, error: "text is required" };
  const selector = String(args.selector || "*").trim() || "*";
  const exact = !!args.exact;
  const ignoreCase = args.ignoreCase !== false;
  const limit = Math.max(1, Math.min(200, Number.isFinite(Number(args.limit)) ? Math.floor(Number(args.limit)) : 20));
  return execOnTab(tabId, (targetText, sel, useExact, ci, maxCount) => {
    const norm = (v) => String(v || "").replace(/\s+/g, " ").trim();
    const match = (value) => {
      const a = ci ? norm(value).toLowerCase() : norm(value);
      const b = ci ? targetText.toLowerCase() : targetText;
      return useExact ? a === b : a.includes(b);
    };
    const getSelector = (el) => {
      if (el.id) return `#${CSS.escape(el.id)}`;
      const parts = [];
      let cur = el;
      while (cur && cur.nodeType === 1 && parts.length < 6) {
        let part = cur.tagName.toLowerCase();
        if (cur.classList?.length) {
          part += "." + Array.from(cur.classList).slice(0, 2).map((x) => CSS.escape(x)).join(".");
        }
        parts.unshift(part);
        cur = cur.parentElement;
      }
      return parts.join(" > ");
    };
    const skipTags = new Set(["script", "style", "noscript"]);
    const out = [];
    const nodes = Array.from(document.querySelectorAll(sel));
    for (const el of nodes) {
      const tag = String(el.tagName || "").toLowerCase();
      if (skipTags.has(tag)) continue;
      const value = norm(el.innerText || el.textContent || el.value || el.getAttribute("aria-label") || el.getAttribute("title") || "");
      if (!value) continue;
      if (!match(value)) continue;
      out.push({
        tag,
        text: value.slice(0, 260),
        selector: getSelector(el)
      });
      if (out.length >= maxCount) break;
    }
    return { ok: true, count: out.length, items: out };
  }, [text, selector, exact, ignoreCase, limit]);
}
async function toolExtractTable(tabId, args = {}) {
  const selector = String(args.selector || "table").trim() || "table";
  const maxTables = Math.max(1, Math.min(20, Number.isFinite(Number(args.maxTables)) ? Math.floor(Number(args.maxTables)) : 5));
  const maxRows = Math.max(1, Math.min(500, Number.isFinite(Number(args.maxRows)) ? Math.floor(Number(args.maxRows)) : 100));
  return execOnTab(tabId, (sel, tableLimit, rowLimit) => {
    const norm = (v) => String(v || "").replace(/\s+/g, " ").trim();
    const getSelector = (el) => {
      if (el.id) return `#${CSS.escape(el.id)}`;
      const parts = [];
      let cur = el;
      while (cur && cur.nodeType === 1 && parts.length < 6) {
        let part = cur.tagName.toLowerCase();
        if (cur.classList?.length) part += "." + Array.from(cur.classList).slice(0, 2).map((x) => CSS.escape(x)).join(".");
        parts.unshift(part);
        cur = cur.parentElement;
      }
      return parts.join(" > ");
    };
    const tables = Array.from(document.querySelectorAll(sel)).filter((el) => el.tagName?.toLowerCase() === "table").slice(0, tableLimit);
    const items = tables.map((table) => {
      const headers = Array.from(table.querySelectorAll("thead th")).map((th) => norm(th.innerText || th.textContent || ""));
      const rows = [];
      const trs = Array.from(table.querySelectorAll("tbody tr, tr")).slice(0, rowLimit);
      for (const tr of trs) {
        const cells = Array.from(tr.querySelectorAll("th,td")).map((cell) => norm(cell.innerText || cell.textContent || ""));
        if (cells.length) rows.push(cells);
      }
      return {
        selector: getSelector(table),
        caption: norm(table.querySelector("caption")?.innerText || ""),
        headers,
        rowCount: rows.length,
        rows
      };
    });
    return { ok: true, count: items.length, tables: items };
  }, [selector, maxTables, maxRows]);
}
async function toolExtractFormSchema(tabId, args = {}) {
  const selector = String(args.selector || "form").trim() || "form";
  const maxForms = Math.max(1, Math.min(50, Number.isFinite(Number(args.maxForms)) ? Math.floor(Number(args.maxForms)) : 10));
  const maxFields = Math.max(1, Math.min(1000, Number.isFinite(Number(args.maxFields)) ? Math.floor(Number(args.maxFields)) : 200));
  const includeHidden = !!args.includeHidden;
  return execOnTab(tabId, (sel, formLimit, fieldLimit, withHidden) => {
    const norm = (v) => String(v || "").replace(/\s+/g, " ").trim();
    const getSelector = (el) => {
      if (el.id) return `#${CSS.escape(el.id)}`;
      const parts = [];
      let cur = el;
      while (cur && cur.nodeType === 1 && parts.length < 6) {
        parts.unshift(cur.tagName.toLowerCase());
        cur = cur.parentElement;
      }
      return parts.join(" > ");
    };
    const forms = Array.from(document.querySelectorAll(sel)).filter((el) => el.tagName?.toLowerCase() === "form").slice(0, formLimit);
    const items = forms.map((form) => {
      const controls = Array.from(form.querySelectorAll("input,textarea,select,button")).filter((el) => withHidden || String(el.type || "").toLowerCase() !== "hidden").slice(0, fieldLimit);
      const fields = controls.map((el) => {
        const isSelect = el.tagName?.toLowerCase() === "select";
        const options = isSelect ? Array.from(el.options || []).slice(0, 120).map((opt) => ({
          value: String(opt.value || ""),
          text: norm(opt.text || "")
        })) : void 0;
        return {
          tag: String(el.tagName || "").toLowerCase(),
          type: String(el.type || "").toLowerCase(),
          name: String(el.name || ""),
          id: String(el.id || ""),
          required: !!el.required,
          placeholder: String(el.placeholder || ""),
          value: String(el.value || ""),
          label: norm(form.querySelector(`label[for="${CSS.escape(el.id || "")}"]`)?.innerText || ""),
          options
        };
      });
      return {
        selector: getSelector(form),
        action: String(form.getAttribute("action") || ""),
        method: String(form.getAttribute("method") || "GET").toUpperCase(),
        fieldCount: fields.length,
        fields
      };
    });
    return { ok: true, count: items.length, forms: items };
  }, [selector, maxForms, maxFields, includeHidden]);
}
async function toolExtractMetaTags(tabId, args = {}) {
  const includeOpenGraph = args.includeOpenGraph !== false;
  const includeTwitter = args.includeTwitter !== false;
  return execOnTab(tabId, (withOG, withTwitter) => {
    const norm = (v) => String(v || "").trim();
    const metas = Array.from(document.querySelectorAll("meta")).map((meta) => ({
      name: norm(meta.getAttribute("name")),
      property: norm(meta.getAttribute("property")),
      httpEquiv: norm(meta.getAttribute("http-equiv")),
      content: norm(meta.getAttribute("content"))
    })).filter((item) => item.content);
    const filtered = metas.filter((item) => {
      const key = (item.property || item.name || "").toLowerCase();
      if (!withOG && key.startsWith("og:")) return false;
      if (!withTwitter && key.startsWith("twitter:")) return false;
      return true;
    });
    return {
      ok: true,
      title: document.title || "",
      canonical: norm(document.querySelector("link[rel='canonical']")?.getAttribute("href")),
      count: filtered.length,
      metas: filtered
    };
  }, [includeOpenGraph, includeTwitter]);
}
async function toolExtractJsonld(tabId, args = {}) {
  const parse = args.parse !== false;
  return execOnTab(tabId, (doParse) => {
    const scripts = Array.from(document.querySelectorAll("script[type='application/ld+json']"));
    const items = scripts.map((script, idx) => {
      const raw = String(script.textContent || "").trim();
      if (!doParse) {
        return { index: idx, raw };
      }
      try {
        return { index: idx, data: JSON.parse(raw) };
      } catch (_err) {
        return { index: idx, raw, parseError: true };
      }
    });
    return { ok: true, count: items.length, items };
  }, [parse]);
}
function buildMemoryMessages(memoryEntries) {
  if (!Array.isArray(memoryEntries) || memoryEntries.length === 0) {
    return [];
  }
  return memoryEntries.map((item) => ({
    role: item.role === "assistant" ? "assistant" : "user",
    content: String(item.text || "")
  }));
}
function maskAuth(value) {
  const text = String(value || "");
  if (!text) return "";
  const prefix = text.startsWith("Bearer ") ? "Bearer " : "";
  const token = prefix ? text.slice(7) : text;
  if (token.length <= 8) return `${prefix}****`;
  return `${prefix}${token.slice(0, 4)}...${token.slice(-4)}`;
}
function sanitizeDebug(value, depth = 0) {
  if (value == null) return value;
  if (typeof value === "string") {
    if (value.length > 700) return `${value.slice(0, 700)} ...(truncated ${value.length - 700} chars)`;
    return value;
  }
  if (typeof value !== "object") return value;
  if (depth >= 3) return "[Object]";
  if (Array.isArray(value)) {
    const list = value.slice(0, 30).map((item) => sanitizeDebug(item, depth + 1));
    if (value.length > 30) list.push(`...(truncated ${value.length - 30} items)`);
    return list;
  }
  const out = {};
  for (const [k, v] of Object.entries(value)) {
    if (k.toLowerCase() === "authorization") {
      out[k] = maskAuth(v);
      continue;
    }
    out[k] = sanitizeDebug(v, depth + 1);
  }
  return out;
}
function toDebugText(title, request, extra = "") {
  const safeReq = sanitizeDebug(request);
  const lines = [
    `[${title}]`,
    `${safeReq.method || "GET"} ${safeReq.url || ""}`,
    `headers: ${JSON.stringify(safeReq.headers || {}, null, 2)}`
  ];
  if (typeof safeReq.body !== "undefined") {
    lines.push(`body: ${JSON.stringify(safeReq.body, null, 2)}`);
  }
  if (extra) {
    lines.push(extra);
  }
  return lines.join("\n");
}
function emitDebug(hooks, title, request, extra = "") {
  if (!ENABLE_TRACE_LOGS) return;
  const text = toDebugText(title, request, extra);
  try {
    console.log(`[WebAgentTrace] ${text}`);
  } catch (_err) {
  }
  if (typeof hooks?.onDebug === "function") {
    hooks.onDebug(text);
  }
}
function headersToObject(headers) {
  if (!headers) return {};
  if (headers instanceof Headers) {
    return Object.fromEntries(headers.entries());
  }
  if (Array.isArray(headers)) {
    const out = {};
    for (const item of headers) {
      if (!Array.isArray(item) || item.length < 2) continue;
      out[String(item[0])] = String(item[1]);
    }
    return out;
  }
  if (typeof headers === "object") {
    return { ...headers };
  }
  return {};
}
function parseBodyForDebug(body) {
  if (typeof body === "undefined" || body === null) return body;
  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch (_err) {
      return body;
    }
  }
  return body;
}
function getErrorStatus(err) {
  const status = Number(err?.status || err?.response?.status || 0);
  return Number.isFinite(status) ? status : 0;
}
function formatOpenAIError(err) {
  if (!err) return "unknown error";
  const status = getErrorStatus(err);
  const text = String(err?.error?.message || err?.message || err).trim();
  if (!status) {
    return text || "unknown error";
  }
  return text ? `HTTP ${status}: ${text}` : `HTTP ${status}`;
}
function buildOpenAIBaseURLCandidates(baseURL) {
  const base = normalizeBaseURL(baseURL);
  const baseNoV1 = stripV1Suffix(base);
  return uniqueStrings([base.endsWith("/v1") ? base : `${base}/v1`, base, `${baseNoV1}/v1`]);
}
async function fetchWithTimeout(url, init = {}, timeoutMs = 0) {
  const ms = Number(timeoutMs || 0);
  if (!Number.isFinite(ms) || ms <= 0) {
    return fetch(url, init);
  }
  const controller = new AbortController();
  let timeoutId = null;
  let abortedByOuterSignal = false;
  const outerSignal = init?.signal;
  const abortFromOuter = () => {
    abortedByOuterSignal = true;
    try {
      controller.abort(outerSignal?.reason);
    } catch (_err) {
      controller.abort();
    }
  };
  if (outerSignal) {
    if (outerSignal.aborted) {
      abortFromOuter();
    } else {
      outerSignal.addEventListener("abort", abortFromOuter, { once: true });
    }
  }
  timeoutId = setTimeout(() => {
    try {
      controller.abort(new Error(`Request timeout after ${Math.ceil(ms / 1e3)}s`));
    } catch (_err) {
      controller.abort();
    }
  }, ms);
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal
    });
  } catch (err) {
    if (controller.signal.aborted && !abortedByOuterSignal) {
      throw new Error(`\u8BF7\u6C42\u8D85\u65F6(${Math.ceil(ms / 1e3)}\u79D2)`);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
    if (outerSignal) {
      outerSignal.removeEventListener("abort", abortFromOuter);
    }
  }
}
function mergeAbortSignals(...signals) {
  const list = signals.filter((sig) => sig && typeof sig === "object");
  if (list.length === 0) return null;
  if (list.length === 1) return list[0];
  const controller = new AbortController();
  const cleanups = [];
  const abortWith = (reason) => {
    if (controller.signal.aborted) return;
    try {
      controller.abort(reason);
    } catch (_err) {
      controller.abort();
    }
    for (const off of cleanups) {
      try {
        off();
      } catch (_err) {
      }
    }
  };
  for (const sig of list) {
    if (sig.aborted) {
      abortWith(sig.reason);
      return controller.signal;
    }
    const onAbort = () => abortWith(sig.reason);
    sig.addEventListener("abort", onAbort, { once: true });
    cleanups.push(() => sig.removeEventListener("abort", onAbort));
  }
  return controller.signal;
}
function createOpenAIClient({ apiKey, baseURL, hooks, timeoutMs }) {
  const requestFetch = async (url, init = {}) => {
    ensureTaskActive(hooks);
    const method = String(init?.method || "GET").toUpperCase();
    const headers = headersToObject(init?.headers);
    const body = parseBodyForDebug(init?.body);
    emitDebug(hooks, "OpenAI SDK Request", {
      method,
      url: String(url || ""),
      headers,
      body,
      timeoutMs: Number(timeoutMs || 0)
    });
    const mergedSignal = mergeAbortSignals(init?.signal, hooks?.cancelSignal);
    const resp = await fetchWithTimeout(url, { ...init, signal: mergedSignal }, timeoutMs);
    emitDebug(hooks, "OpenAI SDK Response", { method, url: String(url || ""), headers }, `status: ${resp.status}`);
    return resp;
  };
  return new OpenAI({
    apiKey,
    baseURL,
    dangerouslyAllowBrowser: true,
    fetch: requestFetch
  });
}
async function tracedFetch(url, init = {}, hooks, title = "HTTP Request") {
  const method = String(init?.method || "GET").toUpperCase();
  const headers = headersToObject(init?.headers);
  const body = parseBodyForDebug(init?.body);
  emitDebug(hooks, title, { method, url: String(url || ""), headers, body });
  const resp = await fetch(url, init);
  emitDebug(hooks, `${title} Response`, { method, url: String(url || ""), headers }, `status: ${resp.status}`);
  return resp;
}
async function handleMessage(message) {
  const type = message?.type;
  const payload = message?.payload || {};
  switch (type) {
    case "GET_SETTINGS":
      return { ok: true, settings: await getSettings() };
    case "GET_AGENT_TASK": {
      if (runningTask && runningTask.status === "running") {
        return { ok: true, task: toTaskPublicState(runningTask) };
      }
      const data = await chrome.storage.local.get(TASK_STATE_KEY);
      return { ok: true, task: data?.[TASK_STATE_KEY] || null };
    }
    case "CLEAR_AGENT_MEMORY": {
      const tab = payload?.tabId ? { id: Number(payload.tabId) } : await getActiveTab();
      if (!tab?.id) {
        return { ok: false, error: "\u672A\u627E\u5230\u5F53\u524D\u6FC0\u6D3B\u6807\u7B7E\u9875" };
      }
      await clearConversationMemory(tab.id);
      return { ok: true };
    }
    case "CLEAR_CHAT_STATE": {
      const tab = payload?.tabId ? { id: Number(payload.tabId) } : await getActiveTab();
      if (tab?.id) {
        await clearConversationMemory(tab.id);
      }
      await chrome.storage.local.remove(TASK_STATE_KEY);
      return { ok: true };
    }
    case "STOP_AGENT_TASK": {
      const wantedID = String(payload?.taskId || "");
      if (wantedID && runningTask && runningTask.id !== wantedID) {
        return { ok: false, error: "目标任务已变化或不存在" };
      }
      return stopRunningTask(String(payload?.reason || "用户手动停止任务"));
    }
    case "SAVE_SETTINGS":
      await saveSettings(payload);
      return { ok: true };
    case "LIST_MODELS":
      return listModels(payload || {});
    case "RUN_AGENT":
      return runAgent(payload.prompt || "", payload.settings || {});
    default:
      return { ok: false, error: `unknown message: ${type}` };
  }
}
async function getSettings() {
  const data = await chrome.storage.local.get(SETTINGS_KEY);
  const loaded = data?.[SETTINGS_KEY] || {};
  return normalizeSettings({
    ...DEFAULT_SETTINGS,
    ...loaded
  });
}
function normalizeBaseURL(value) {
  const raw = String(value || "").trim() || DEFAULT_SETTINGS.baseURL;
  return raw.replace(/\/+$/, "");
}
function normalizeRequestTimeoutSec(value) {
  const raw = Number(value);
  if (!Number.isFinite(raw)) {
    return DEFAULT_SETTINGS.requestTimeoutSec;
  }
  return Math.min(600, Math.max(5, Math.floor(raw)));
}
function uniqueStrings(items) {
  const out = [];
  const seen = /* @__PURE__ */ new Set();
  for (const v of items) {
    const s = String(v || "");
    if (!s || seen.has(s)) continue;
    seen.add(s);
    out.push(s);
  }
  return out;
}
function stripV1Suffix(base) {
  return String(base || "").replace(/\/v1$/i, "");
}
function normalizeToolTurnLimit(value) {
  const raw = Number(value);
  if (!Number.isFinite(raw)) {
    return DEFAULT_SETTINGS.toolTurnLimit;
  }
  return Math.max(0, Math.floor(raw));
}
function normalizeThinkingLevel(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (raw === "low" || raw === "medium" || raw === "high" || raw === "xhigh") {
    return raw;
  }
  return DEFAULT_SETTINGS.thinkingLevel;
}
function createMcpServiceId() {
  const seed = Math.random().toString(36).slice(2, 8);
  return `svc_${Date.now()}_${seed}`;
}
function normalizeMcpTransport(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (raw === "cmd") return "stdio";
  if (raw === "http" || raw === "sse" || raw === "stdio" || raw === "streamable_http") {
    return raw;
  }
  return "streamable_http";
}
function normalizeMcpHeaderName(value) {
  const name = String(value || "").trim();
  if (!name) return "";
  if (name.length > 128) return "";
  if (!/^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/.test(name)) return "";
  return name;
}
function normalizeMcpHeaderValue(value) {
  return String(value ?? "");
}
function normalizeMcpHeaders(input, legacyApiKey = "") {
  const out = [];
  const seen = /* @__PURE__ */ new Set();
  const pushOne = (rawName, rawValue, rawEnabled = true) => {
    const name = normalizeMcpHeaderName(rawName);
    if (!name) return;
    const value = normalizeMcpHeaderValue(rawValue);
    const enabled = rawEnabled !== false;
    const key = name.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ name, value, enabled });
  };
  if (Array.isArray(input)) {
    for (const item of input) {
      if (!item || typeof item !== "object") continue;
      pushOne(item.name || item.key || item.header, item.value, item.enabled);
    }
  } else if (input && typeof input === "object") {
    for (const [name, value] of Object.entries(input)) {
      pushOne(name, value, true);
    }
  } else if (typeof input === "string" && input.trim()) {
    for (const line of input.split(/\r?\n/)) {
      const row = line.trim();
      if (!row) continue;
      const sep = row.indexOf(":");
      if (sep <= 0) continue;
      pushOne(row.slice(0, sep), row.slice(sep + 1), true);
    }
  }
  const legacy = String(legacyApiKey || "");
  if (legacy) {
    const hasAuth = out.some((item) => String(item.name || "").trim().toLowerCase() === "authorization");
    if (!hasAuth) {
      pushOne("Authorization", legacy, true);
    }
  }
  return out;
}
function mcpHeadersToObject(service, extra = {}) {
  const headers = {};
  const list = Array.isArray(service?.mcpHeaders) ? service.mcpHeaders : normalizeMcpHeaders(service?.mcpHeaders, service?.apiKey);
  for (const item of list) {
    if (!item || item.enabled === false) continue;
    const name = normalizeMcpHeaderName(item.name);
    if (!name) continue;
    headers[name] = normalizeMcpHeaderValue(item.value);
  }
  if (!headers.Authorization && String(service?.apiKey || "").trim()) {
    headers.Authorization = String(service.apiKey);
  }
  if (extra.sessionId) {
    headers["MCP-Session-Id"] = String(extra.sessionId);
  }
  return headers;
}
function normalizeMcpService(item = {}) {
  const legacyApiKey = String(item.apiKey || "").trim();
  const headersInput = Object.prototype.hasOwnProperty.call(item, "mcpHeaders") ? item.mcpHeaders : item.headers;
  return {
    id: String(item.id || createMcpServiceId()),
    name: String(item.name || "").trim(),
    enabled: item.enabled !== false,
    transport: normalizeMcpTransport(item.transport),
    baseURL: String(item.baseURL || "").trim().replace(/\/+$/, ""),
    apiKey: legacyApiKey,
    mcpHeaders: normalizeMcpHeaders(headersInput, legacyApiKey),
    command: String(item.command || "").trim(),
    args: String(item.args || "").trim(),
    envText: String(item.envText || "")
  };
}
function normalizeMcpServices(list) {
  if (!Array.isArray(list)) {
    return [];
  }
  return list.map((item) => normalizeMcpService(item));
}
function upgradeLegacyMcpSettings(input = {}) {
  if (Array.isArray(input.mcpServices)) {
    return input.mcpServices;
  }
  if (!input.mcpEnabled || !input.mcpBaseURL) {
    return [];
  }
  return [
    {
      id: createMcpServiceId(),
      name: "Legacy MCP",
      enabled: true,
      transport: "http",
      baseURL: String(input.mcpBaseURL || "").trim(),
      apiKey: String(input.mcpApiKey || "").trim(),
      mcpHeaders: normalizeMcpHeaders([], String(input.mcpApiKey || "").trim()),
      command: "",
      args: "",
      envText: ""
    }
  ];
}
function normalizeSettings(input = {}) {
  const mcpServices = normalizeMcpServices(upgradeLegacyMcpSettings(input));
  return {
    apiKey: String(input.apiKey || "").trim(),
    model: String(input.model || "").trim(),
    thinkingLevel: normalizeThinkingLevel(input.thinkingLevel),
    baseURL: normalizeBaseURL(input.baseURL),
    allowScript: !!input.allowScript,
    requestTimeoutSec: normalizeRequestTimeoutSec(input.requestTimeoutSec),
    toolTurnLimit: normalizeToolTurnLimit(input.toolTurnLimit),
    mcpServices
  };
}
async function saveSettings(input) {
  const merged = normalizeSettings({
    ...await getSettings(),
    ...input
  });
  await chrome.storage.local.set({ [SETTINGS_KEY]: merged });
}
async function listModels(override = {}) {
  const settings = normalizeSettings({
    ...await getSettings(),
    ...override
  });
  if (!settings.apiKey) {
    return { ok: false, error: "\u8BF7\u5148\u586B\u5199 API Key" };
  }
  const baseCandidates = buildOpenAIBaseURLCandidates(settings.baseURL);
  const tried = [];
  let lastError = null;
  for (const candidate of baseCandidates) {
    tried.push(candidate);
    try {
      const client = createOpenAIClient({
        apiKey: settings.apiKey,
        baseURL: candidate,
        timeoutMs: settings.requestTimeoutSec * 1e3
      });
      const page = await client.models.list();
      const list = Array.isArray(page?.data) ? page.data.map((item) => String(item?.id || "").trim()).filter(Boolean).sort((a, b) => a.localeCompare(b)) : [];
      return {
        ok: true,
        models: list,
        debug: `[OpenAI SDK Models]
baseURL: ${candidate}
tried: ${tried.join(" | ")}`
      };
    } catch (err) {
      lastError = err;
      if (getErrorStatus(err) !== 404) {
        return {
          ok: false,
          error: `${formatOpenAIError(err)} (${candidate})`,
          debug: `[OpenAI SDK Models]
baseURL: ${candidate}
tried: ${tried.join(" | ")}`
        };
      }
    }
  }
  const finalBase = baseCandidates[baseCandidates.length - 1] || "";
  return {
    ok: false,
    error: `${formatOpenAIError(lastError) || "HTTP 404"} (${finalBase})`,
    debug: `[OpenAI SDK Models]
baseURL: ${finalBase}
tried: ${tried.join(" | ")}`
  };
}
async function runAgent(prompt, overrideSettings = {}, hooks = {}) {
  ensureTaskActive(hooks);
  const cleanPrompt = String(prompt || "").trim();
  if (!cleanPrompt) {
    return { ok: false, error: "prompt is empty" };
  }
  const settings = normalizeSettings({
    ...await getSettings(),
    ...overrideSettings
  });
  if (!settings.apiKey) {
    return { ok: false, error: "\u8BF7\u5148\u5728\u8BBE\u7F6E\u4E2D\u586B\u5199 API Key" };
  }
  if (!settings.model) {
    return { ok: false, error: "\u8BF7\u5148\u83B7\u53D6\u5E76\u9009\u62E9\u6A21\u578B" };
  }
  const tab = await getActiveTab();
  if (!tab?.id) {
    return { ok: false, error: "\u672A\u627E\u5230\u5F53\u524D\u6FC0\u6D3B\u6807\u7B7E\u9875" };
  }
  const tabURL = String(tab.url || "");
  let streamedAssistant = "";
  const agentHooks = {
    ...hooks,
    onDelta: (delta) => {
      if (hooks?.cancelSignal?.aborted) {
        return;
      }
      const text = String(delta || "");
      if (text) {
        streamedAssistant += text;
      }
      hooks.onDelta?.(delta);
    }
  };
  let result;
  ensureTaskActive(agentHooks);
  if (isWholePageTranslateRequest(cleanPrompt)) {
    if (isRestrictedBrowserPage(tabURL)) {
      return { ok: false, error: "\u6D4F\u89C8\u5668\u5185\u90E8\u9875\u9762\u65E0\u6CD5\u8BFB/\u6539 DOM\uFF0C\u6574\u9875\u7FFB\u8BD1\u8BF7\u5728 http/https \u666E\u901A\u7F51\u9875\u6267\u884C" };
    }
    result = await runWholePageTranslate(cleanPrompt, tab.id, settings, agentHooks);
  } else {
    result = await runFunctionCallingAgent(cleanPrompt, tab.id, tabURL, settings, agentHooks);
  }
  ensureTaskActive(agentHooks);
  const finalText = normalizeMemoryText(result?.message || "");
  const partialText = normalizeMemoryText(streamedAssistant);
  const fallbackText = result?.ok ? "\u6267\u884C\u5B8C\u6210" : `\u672A\u5B8C\u6210: ${String(result?.error || "\u672A\u77E5\u9519\u8BEF")}`;
  const memoryText = finalText || partialText || fallbackText;
  if (memoryText) {
    await appendConversationMemory(tab.id, cleanPrompt, memoryText);
  }
  return result;
}
async function runWholePageTranslate(prompt, tabId, settings, hooks) {
  ensureTaskActive(hooks);
  hooks.onStatus?.("\u8BFB\u53D6\u6574\u9875 HTML...");
  const originalHTML = await getWholePageHTML(tabId);
  if (!originalHTML || originalHTML.length < 200) {
    return { ok: false, error: "\u9875\u9762\u5185\u5BB9\u8FC7\u5C11\uFF0C\u65E0\u6CD5\u6267\u884C\u6574\u9875\u7FFB\u8BD1" };
  }
  hooks.onStatus?.("\u6A21\u578B\u7FFB\u8BD1\u4E2D...");
  ensureTaskActive(hooks);
  const translatedHTML = await translateWholePageHTML({
    apiKey: settings.apiKey,
    model: settings.model,
    thinkingLevel: settings.thinkingLevel,
    baseURL: settings.baseURL,
    timeoutMs: settings.requestTimeoutSec * 1e3,
    html: originalHTML,
    userPrompt: prompt,
    stream: typeof hooks.onDelta === "function",
    onDelta: hooks.onDelta,
    onReasoning: hooks.onReasoning,
    hooks
  });
  hooks.onStatus?.("\u66FF\u6362\u9875\u9762\u5185\u5BB9...");
  ensureTaskActive(hooks);
  const replaceRes = await replaceWholePageHTML(tabId, translatedHTML);
  return {
    ok: true,
    message: `\u6574\u9875\u7FFB\u8BD1\u5B8C\u6210\uFF0C\u5DF2\u66FF\u6362\u9875\u9762 HTML\u3002\u5F53\u524D\u6807\u9898\uFF1A${replaceRes?.title || "(unknown)"}`
  };
}
async function runFunctionCallingAgent(prompt, tabId, tabURL, settings, hooks) {
  ensureTaskActive(hooks);
  const attachPageContext = shouldAttachPageContext(prompt);
  if (attachPageContext && isRestrictedBrowserPage(tabURL)) {
    return {
      ok: false,
      error: "\u5F53\u524D\u662F\u6D4F\u89C8\u5668\u5185\u90E8\u9875\u9762(chrome:// / edge://)\uFF0C\u4E0D\u652F\u6301\u9875\u9762\u8BFB\u5199\u5DE5\u5177\u3002\u82E5\u53EA\u9700\u901A\u7528 function calling(\u52A0\u89E3\u5BC6/\u7F16\u89E3\u7801/http/mcp)\u8BF7\u76F4\u63A5\u63CF\u8FF0\u4EFB\u52A1\u3002"
    };
  }
  let snapshot = { title: "", url: "", selectedText: "", nodes: [] };
  if (attachPageContext) {
    hooks.onStatus?.("\u52A0\u8F7D\u9875\u9762\u5FEB\u7167...");
    ensureTaskActive(hooks);
    snapshot = await collectPageSnapshot(tabId);
  } else {
    hooks.onStatus?.("\u8DF3\u8FC7\u9875\u9762\u5FEB\u7167(\u672C\u8F6E\u6309\u9700\u8C03\u7528\u9875\u9762\u5DE5\u5177)...");
  }
  ensureTaskActive(hooks);
  const memoryEntries = await getConversationMemory(tabId);
  return runFunctionCallingAgentLegacy(prompt, tabId, settings, hooks, snapshot, memoryEntries, attachPageContext);
}
function isRestrictedBrowserPage(url) {
  const raw = String(url || "").trim().toLowerCase();
  return raw.startsWith("chrome://") || raw.startsWith("edge://") || raw.startsWith("chrome-extension://");
}
async function runFunctionCallingAgentLegacy(prompt, tabId, settings, hooks, snapshot, memoryEntries, attachPageContext = true) {
  ensureTaskActive(hooks);
  hooks.onStatus?.("\u52A0\u8F7D\u5DE5\u5177\u5217\u8868...");
  const mcpRegistry = await fetchMCPTools(settings);
  const tools = buildToolSpecs(settings.allowScript, mcpRegistry.toolSpecs || []);
  if (Array.isArray(mcpRegistry.errors) && mcpRegistry.errors.length > 0) {
    for (const err of mcpRegistry.errors) {
      hooks.onDelta?.(`
[MCP] ${err}
`);
    }
  }
  if (mcpRegistry.toolSpecs?.length) {
    hooks.onDelta?.(`
[MCP] \u5DF2\u52A0\u8F7D ${mcpRegistry.toolSpecs.length} \u4E2A\u5DE5\u5177
`);
  }
  const messages = [
    {
      role: "system",
      content: buildAgentSystemPrompt(settings.allowScript, !!mcpRegistry.toolSpecs?.length, { attachPageContext })
    },
    ...buildMemoryMessages(memoryEntries),
    {
      role: "user",
      content: JSON.stringify(attachPageContext ? {
        request: prompt,
        page: {
          title: snapshot.title,
          url: snapshot.url,
          selectedText: snapshot.selectedText,
          previewNodes: snapshot.nodes?.slice(0, 40) || []
        }
      } : {
        request: prompt,
        page: {
          attached: false,
          note: "\u672C\u8F6E\u672A\u9884\u8F7D\u9875\u9762\u5FEB\u7167\u3002\u82E5\u4EFB\u52A1\u9700\u8981\u9875\u9762\u4FE1\u606F\uff0C\u8BF7\u5148\u8C03\u7528 get_page_snapshot/query_elements \u518D\u64CD\u4F5C\u3002"
        }
      })
    }
  ];
  const maxTurns = normalizeToolTurnLimit(settings.toolTurnLimit);
  for (let turn = 1; ; turn += 1) {
    ensureTaskActive(hooks);
    if (maxTurns > 0 && turn > maxTurns) {
      return { ok: false, error: `\u5DE5\u5177\u8C03\u7528\u8F6E\u6B21\u8FBE\u5230\u4E0A\u9650(${maxTurns})\uFF0C\u5EFA\u8BAE\u7F29\u5C0F\u4EFB\u52A1\u8303\u56F4` };
    }
    hooks.onStatus?.("\u6A21\u578B\u601D\u8003\u4E2D...");
    const completion = await callChatCompletion({
      apiKey: settings.apiKey,
      baseURL: settings.baseURL,
      model: settings.model,
      thinkingLevel: settings.thinkingLevel,
      timeoutMs: settings.requestTimeoutSec * 1e3,
      messages,
      tools,
      stream: typeof hooks.onDelta === "function",
      hooks
    });
    const choice = completion?.choices?.[0] || {};
    const assistantMessage = choice?.message || {};
    const assistantText = messageContentToText(assistantMessage?.content);
    if (typeof hooks.onDelta !== "function") {
      const reasoningText = extractReasoningFromCompletion(completion);
      if (reasoningText) {
        hooks.onReasoning?.(reasoningText);
      }
    }
    const toolCalls = Array.isArray(assistantMessage?.tool_calls) ? assistantMessage.tool_calls : [];
    if (toolCalls.length === 0) {
      return { ok: true, message: assistantText || "\u6267\u884C\u5B8C\u6210" };
    }
    messages.push({
      role: "assistant",
      content: assistantText || "",
      tool_calls: toolCalls
    });
    for (const call of toolCalls) {
      ensureTaskActive(hooks);
      const toolResult = await executeToolCall(call, {
        tabId,
        settings,
        mcpRegistry,
        hooks,
        depth: 0
      });
      messages.push({
        role: "tool",
        tool_call_id: call.id,
        name: call?.function?.name || "unknown_tool",
        content: safeJSONString(toolResult)
      });
      hooks.onDelta?.(`
[tool:${call?.function?.name || "unknown"}] ${summarizeToolResult(toolResult)}
`);
    }
  }
}
function buildOpenAISDKMCPToolConfig(settings) {
  const enabledServices = Array.isArray(settings?.mcpServices) ? settings.mcpServices.filter((item) => item && item.enabled) : [];
  if (enabledServices.length === 0) {
    return { tools: [], warnings: [] };
  }
  const warnings = [];
  const tools = [];
  const usedLabels = /* @__PURE__ */ new Set();
  const ensureLabel = (rawLabel) => {
    let base = String(rawLabel || "mcp").trim() || "mcp";
    base = base.replace(/\s+/g, "_");
    if (!usedLabels.has(base)) {
      usedLabels.add(base);
      return base;
    }
    let i = 2;
    while (usedLabels.has(`${base}_${i}`)) i += 1;
    const next = `${base}_${i}`;
    usedLabels.add(next);
    return next;
  };
  for (const service of enabledServices) {
    const name = getMCPServiceName(service);
    const transport = normalizeMcpTransport(service.transport);
    if (transport !== "streamable_http") {
      warnings.push(`[${name}] \u975E streamable_http \u4F20\u8F93(${transport})\u6682\u4E0D\u8D70 SDK MCP\uff0c\u4F1A\u56DE\u9000\u5230\u672C\u5730\u5B9E\u73B0`);
      return { tools: [], warnings };
    }
    const serverURL = String(service.baseURL || "").trim();
    if (!serverURL) {
      warnings.push(`[${name}] \u672A\u914D\u7F6E MCP URL\uff0C\u5DF2\u8DF3\u8FC7`);
      continue;
    }
    const headers = mcpHeadersToObject(service);
    const tool = {
      type: "mcp",
      server_label: ensureLabel(name),
      server_url: serverURL,
      require_approval: "never"
    };
    if (Object.keys(headers).length > 0) {
      tool.headers = headers;
    }
    tools.push(tool);
  }
  return { tools, warnings };
}
function buildResponsesFunctionToolSpecs(allowScript) {
  const localChatTools = buildToolSpecs(allowScript, []);
  const list = [];
  for (const item of localChatTools) {
    const fn = item?.function;
    if (!fn?.name) continue;
    list.push({
      type: "function",
      name: String(fn.name),
      description: String(fn.description || ""),
      parameters: fn.parameters || { type: "object", properties: {}, additionalProperties: false },
      strict: true
    });
  }
  return list;
}
function extractResponseFunctionCalls(response) {
  const output = Array.isArray(response?.output) ? response.output : [];
  const calls = [];
  for (const item of output) {
    if (!item || item.type !== "function_call") continue;
    calls.push({
      call_id: String(item.call_id || item.id || ""),
      name: String(item.name || ""),
      arguments: typeof item.arguments === "string" ? item.arguments : "{}"
    });
  }
  return calls.filter((item) => item.call_id && item.name);
}
function extractResponsesOutputText(response) {
  const direct = String(response?.output_text || "").trim();
  if (direct) return direct;
  const output = Array.isArray(response?.output) ? response.output : [];
  const parts = [];
  for (const item of output) {
    if (!item || item.type !== "message") continue;
    parts.push(anyValueToText(item.content));
  }
  return parts.filter(Boolean).join("\n").trim();
}
async function callResponsesAgent({
  apiKey,
  baseURL,
  model,
  thinkingLevel,
  timeoutMs,
  instructions,
  input,
  previousResponseID,
  tools,
  stream,
  hooks
}) {
  ensureTaskActive(hooks);
  const baseCandidates = buildOpenAIBaseURLCandidates(baseURL);
  const tried = [];
  let lastError = "";
  for (const candidate of baseCandidates) {
    ensureTaskActive(hooks);
    tried.push(candidate);
    try {
      const client = createOpenAIClient({
        apiKey,
        baseURL: candidate,
        hooks,
        timeoutMs
      });
      const body = {
        model,
        instructions,
        input,
        previous_response_id: previousResponseID || void 0,
        tools,
        tool_choice: "auto",
        parallel_tool_calls: false,
        temperature: 0.1,
        stream: !!stream
      };
      const normalizedThinkingLevel = normalizeThinkingLevel(thinkingLevel);
      if (normalizedThinkingLevel !== "auto") {
        body.reasoning = { effort: normalizedThinkingLevel };
      }
      if (!stream) {
        return await client.responses.create(body);
      }
      const streamResp = await client.responses.create(body);
      let completed = null;
      for await (const event of streamResp) {
        ensureTaskActive(hooks);
        if (!event || typeof event !== "object") continue;
        if (event.type === "response.output_text.delta" && event.delta) {
          hooks?.onDelta?.(String(event.delta));
          continue;
        }
        if (
          (event.type === "response.reasoning_text.delta" || event.type === "response.reasoning_summary_text.delta") &&
          event.delta
        ) {
          hooks?.onReasoning?.(String(event.delta));
          continue;
        }
        if (event.type === "response.completed" && event.response) {
          completed = event.response;
        }
      }
      if (completed) {
        return completed;
      }
      throw new Error("responses stream ended without response.completed");
    } catch (err) {
      if (hooks?.cancelSignal?.aborted || isTaskCancelledError(err)) {
        throw createTaskCancelledError(hooks?.cancelReason || hooks?.cancelSignal?.reason || "任务已停止");
      }
      lastError = formatOpenAIError(err);
      if (getErrorStatus(err) !== 404) {
        throw new Error(`${lastError} (${candidate})`);
      }
    }
  }
  throw new Error(`${lastError || "HTTP 404"} (tried baseURL: ${tried.join(" | ")})`);
}
async function runFunctionCallingAgentWithResponsesMCP(prompt, tabId, settings, hooks, snapshot, memoryEntries, sdkMcpTools) {
  ensureTaskActive(hooks);
  const functionTools = buildResponsesFunctionToolSpecs(settings.allowScript);
  const tools = functionTools.concat(sdkMcpTools || []);
  const history = normalizeMemoryEntries(memoryEntries).slice(-12);
  const initialInput = [
    {
      type: "message",
      role: "user",
      content: [
        {
          type: "input_text",
          text: JSON.stringify({
            request: prompt,
            memory: history,
            page: {
              title: snapshot.title,
              url: snapshot.url,
              selectedText: snapshot.selectedText,
              previewNodes: snapshot.nodes?.slice(0, 40) || []
            }
          })
        }
      ]
    }
  ];
  let pendingInput = initialInput;
  let previousResponseID = null;
  const maxTurns = normalizeToolTurnLimit(settings.toolTurnLimit);
  for (let turn = 1; ; turn += 1) {
    ensureTaskActive(hooks);
    if (maxTurns > 0 && turn > maxTurns) {
      return { ok: false, error: `\u5DE5\u5177\u8C03\u7528\u8F6E\u6B21\u8FBE\u5230\u4E0A\u9650(${maxTurns})\uFF0C\u5EFA\u8BAE\u7F29\u5C0F\u4EFB\u52A1\u8303\u56F4` };
    }
    hooks.onStatus?.("\u6A21\u578B\u601D\u8003\u4E2D...");
    const response = await callResponsesAgent({
      apiKey: settings.apiKey,
      baseURL: settings.baseURL,
      model: settings.model,
      thinkingLevel: settings.thinkingLevel,
      timeoutMs: settings.requestTimeoutSec * 1e3,
      instructions: buildAgentSystemPrompt(settings.allowScript, true),
      input: pendingInput,
      previousResponseID,
      tools,
      stream: typeof hooks.onDelta === "function",
      hooks
    });
    previousResponseID = String(response?.id || previousResponseID || "");
    const functionCalls = extractResponseFunctionCalls(response);
    if (functionCalls.length === 0) {
      const assistantText = extractResponsesOutputText(response);
      return { ok: true, message: assistantText || "\u6267\u884C\u5B8C\u6210" };
    }
    const outputs = [];
    for (const call of functionCalls) {
      ensureTaskActive(hooks);
      const toolResult = await executeToolCall(
        {
          id: call.call_id,
          function: {
            name: call.name,
            arguments: call.arguments
          }
        },
        {
          tabId,
          settings,
          mcpRegistry: { aliasMap: {} },
          hooks,
          depth: 0
        }
      );
      outputs.push({
        type: "function_call_output",
        call_id: call.call_id,
        output: safeJSONString(toolResult)
      });
      hooks.onDelta?.(`
[tool:${call.name}] ${summarizeToolResult(toolResult)}
`);
    }
    pendingInput = outputs;
  }
}
function shouldAttachPageContext(prompt) {
  const text = String(prompt || "").trim().toLowerCase();
  if (!text) return true;
  const toolCatalogWords = [
    "function calling",
    "function list",
    "tool list",
    "tools list",
    "\u51FD\u6570\u5217\u8868",
    "\u5DE5\u5177\u5217\u8868",
    "\u53EF\u7528\u51FD\u6570",
    "\u6709\u54EA\u4E9B\u51FD\u6570",
    "\u6709\u54EA\u4E9Bfunction",
    "\u6709\u54EA\u4E9Btool",
    "\u6709\u54EA\u4E9Bfunction calling"
  ];
  if (toolCatalogWords.some((item) => text.includes(item))) {
    return false;
  }
  const hardNoPage = [
    "\u4E0D\u8981\u8BFB\u53D6\u9875\u9762",
    "\u65E0\u9700\u9875\u9762",
    "\u53EA\u8C03\u51FD\u6570",
    "\u53EA\u8C03\u7528\u5DE5\u5177",
    "no page",
    "without page context"
  ];
  if (hardNoPage.some((item) => text.includes(item))) {
    return false;
  }
  const pageWords = [
    "\u7F51\u9875",
    "\u9875\u9762",
    "\u5F53\u524D\u9875",
    "dom",
    "\u5143\u7D20",
    "\u6807\u7B7E",
    "\u6309\u94AE",
    "\u94FE\u63A5",
    "a\u6807\u7B7E",
    "html",
    "css",
    "script",
    "\u811A\u672C",
    "\u7FFB\u8BD1",
    "\u6293\u53D6",
    "\u63D0\u53D6",
    "\u603B\u7ED3\u9875\u9762",
    "\u4FEE\u6539\u9875\u9762",
    "query",
    "snapshot",
    "click",
    "input",
    "select",
    "scroll"
  ];
  if (pageWords.some((item) => text.includes(item))) {
    return true;
  }
  const utilityWords = [
    "function",
    "functions",
    "tool",
    "tools",
    "function calling",
    "\u51FD\u6570",
    "\u5DE5\u5177",
    "\u5DE5\u5177\u5217\u8868",
    "\u51FD\u6570\u5217\u8868",
    "\u53EF\u7528\u51FD\u6570",
    "\u52A0\u5BC6",
    "\u89E3\u5BC6",
    "aes",
    "des",
    "desede",
    "rsa",
    "base64",
    "hex",
    "unicode",
    "\u7F16\u7801",
    "\u89E3\u7801",
    "hash",
    "hmac",
    "sha",
    "md5",
    "jwt",
    "jsonpath",
    "\u6B63\u5219",
    "regex",
    "\u968F\u673A",
    "uuid",
    "http",
    "request",
    "mcp",
    "\u914D\u7F6E",
    "profile",
    "storage"
  ];
  if (utilityWords.some((item) => text.includes(item))) {
    return false;
  }
  return false;
}
function buildAgentSystemPrompt(allowScript, hasMCP, options = {}) {
  const attachPageContext = options.attachPageContext !== false;
  return [
    "\u4F60\u662F\u7F51\u9875\u81EA\u52A8\u5316\u4EE3\u7406\u3002\u8BF7\u6309\u7528\u6237\u610F\u56FE\u9009\u62E9\u5DE5\u5177\uFF0C\u4E0D\u8981\u673A\u68B0\u5730\u6BCF\u8F6E\u5148\u8BFB\u9875\u9762\u3002",
    "\u89C4\u5219\uFF1A",
    "1. \u4EC5\u5728\u7528\u6237\u4EFB\u52A1\u660E\u786E\u6D89\u53CA\u7F51\u9875\u5185\u5BB9(\u9605\u8BFB/\u63D0\u53D6/\u4FEE\u6539/DOM/\u7FFB\u8BD1)\u65F6\uFF0C\u624D\u8C03\u7528 get_page_snapshot\u3001query/extract/click/input/select/scroll \u7C7B\u5DE5\u5177\u3002",
    "2. \u5982\u679C\u4EFB\u52A1\u662F\u901A\u7528\u51FD\u6570(\u52A0\u89E3\u5BC6\u3001\u7F16\u89E3\u7801\u3001hash/hmac\u3001\u968F\u673A\u6570\u3001http\u8BF7\u6C42\u3001MCP/\u914D\u7F6E\u7BA1\u7406)\uFF0C\u4E0D\u8981\u4E3B\u52A8\u8BFB\u9875\u9762\uFF0C\u76F4\u63A5\u8C03\u7528\u5BF9\u5E94 function calling \u5DE5\u5177\u3002",
    "3. \u5C40\u90E8\u4FEE\u6539\u4F18\u5148\u4F7F\u7528 query/extract/set/remove \u5DE5\u5177\uFF1B\u6574\u9875\u7FFB\u8BD1\u4F7F\u7528 translate_whole_page_to_zh\u3002",
    "3.5 \u9700\u8981\u8DE8\u8F6E\u6B21\u4FDD\u5B58\u6570\u636E\u65F6\u53EF\u7528 set_storage/get_storage\u3002",
    "3.6 \u52A0\u89E3\u5BC6/\u7F16\u89E3\u7801/\u7F51\u7EDC\u8BF7\u6C42\u8BF7\u4F18\u5148\u4F7F\u7528 crypto_*, rsa_*, encoding_convert, http_request \u5DE5\u5177\u3002",
    "3.7 \u9700\u8981\u4EA4\u4E92\u6216\u7ED3\u6784\u5316\u62BD\u53D6\u65F6\u4F18\u5148\u4F7F\u7528 click/input/select/scroll \u4EE5\u53CA extract_table/extract_form_schema/query_by_text/meta/jsonld \u5DE5\u5177\u3002",
    "3.8 \u505A\u6D4B\u8BD5\u6D41\u7A0B\u65F6\uFF0C\u8BF7\u4F18\u5148\u7EC4\u5408 open_url + wait_for_element + assert_page_state + batch_execute\uff0c\u6309\u76EE\u6807\u81EA\u52A8\u51B3\u7B56\u4E0B\u4E00\u6B65\u3002",
    allowScript ? "4. execute_script/append_script \u4EC5\u5728\u65E0\u5176\u4ED6\u5DE5\u5177\u53EF\u7528\u4E14\u7528\u6237\u660E\u786E\u8981\u6C42\u6267\u884C\u811A\u672C\u65F6\u624D\u80FD\u8C03\u7528\u3002" : "4. execute_script/append_script \u7981\u7528\uFF0C\u4E0D\u8981\u8C03\u7528\u3002",
    hasMCP ? "5. \u5141\u8BB8\u8C03\u7528 MCP \u5DE5\u5177\u8865\u5145\u80FD\u529B\u3002" : "5. \u5F53\u524D\u65E0 MCP \u5DE5\u5177\u3002",
    attachPageContext ? "6. \u672C\u8F6E\u5DF2\u9644\u5E26\u9875\u9762\u9884\u89C8\u4FE1\u606F\uFF0C\u4EC5\u5728\u4E0D\u8DB3\u65F6\u518D\u8C03\u7528 get_page_snapshot \u8865\u5145\u3002" : "6. \u672C\u8F6E\u672A\u9884\u8F7D\u9875\u9762\u5FEB\u7167\uFF0C\u9664\u975E\u4EFB\u52A1\u5FC5\u987B\u4F9D\u8D56\u9875\u9762\u4FE1\u606F\uFF0C\u5426\u5219\u4E0D\u8981\u8C03\u7528\u9875\u9762\u5DE5\u5177\u3002",
    "\u6700\u540E\u7528\u4E2D\u6587\u56DE\u590D\uFF0C\u8BF4\u660E\u6267\u884C\u6B65\u9AA4\u548C\u7ED3\u679C\u3002"
  ].join("\n");
}
function buildToolSpecs(allowScript, mcpToolSpecs) {
  const local = [
    defineTool("get_page_snapshot", "Get page snapshot", {
      type: "object",
      properties: {},
      additionalProperties: false
    }),
    defineTool("query_elements", "Query elements by selector", {
      type: "object",
      properties: {
        selector: { type: "string" },
        limit: { type: "integer", minimum: 1, maximum: 50 },
        include_html: { type: "boolean" }
      },
      required: ["selector"],
      additionalProperties: false
    }),
    defineTool("extract_text", "Extract text from selector", {
      type: "object",
      properties: {
        selector: { type: "string" },
        maxLength: { type: "integer", minimum: 100, maximum: 2e4 }
      },
      required: ["selector"],
      additionalProperties: false
    }),
    defineTool("extract_links", "Extract links", {
      type: "object",
      properties: {
        selector: { type: "string" },
        maxCount: { type: "integer", minimum: 1, maximum: 200 }
      },
      additionalProperties: false
    }),
    defineTool("extract_all_anchors", "Extract all anchor(a) elements info", {
      type: "object",
      properties: {
        maxCount: { type: "integer", minimum: 1, maximum: 500 },
        includeAttributes: { type: "boolean" }
      },
      additionalProperties: false
    }),
    defineTool("extract_elements_by_criteria", "Extract elements by selector/tag/id/class/css attribute", {
      type: "object",
      properties: {
        selector: { type: "string" },
        tag: { type: "string" },
        id: { type: "string" },
        className: { type: "string" },
        attrName: { type: "string" },
        attrValue: { type: "string" },
        maxCount: { type: "integer", minimum: 1, maximum: 200 },
        includeHTML: { type: "boolean" },
        includeAttributes: { type: "boolean" }
      },
      additionalProperties: false
    }),
    defineTool("extract_buttons_info", "Extract button and clickable-button attributes", {
      type: "object",
      properties: {
        selector: { type: "string" },
        maxCount: { type: "integer", minimum: 1, maximum: 200 },
        includeAttributes: { type: "boolean" }
      },
      additionalProperties: false
    }),
    defineTool("set_text", "Set text content", {
      type: "object",
      properties: {
        selector: { type: "string" },
        text: { type: "string" }
      },
      required: ["selector", "text"],
      additionalProperties: false
    }),
    defineTool("set_html", "Set inner HTML", {
      type: "object",
      properties: {
        selector: { type: "string" },
        html: { type: "string" }
      },
      required: ["selector", "html"],
      additionalProperties: false
    }),
    defineTool("set_attribute", "Set attribute", {
      type: "object",
      properties: {
        selector: { type: "string" },
        name: { type: "string" },
        value: { type: "string" }
      },
      required: ["selector", "name", "value"],
      additionalProperties: false
    }),
    defineTool("remove_elements", "Remove elements", {
      type: "object",
      properties: { selector: { type: "string" } },
      required: ["selector"],
      additionalProperties: false
    }),
    defineTool("set_storage", "Persist value by key in extension storage", {
      type: "object",
      properties: {
        key: { type: "string", description: "Storage key. Allowed: letters, digits, ., _, :, -" },
        value: {
          anyOf: [{ type: "object" }, { type: "array" }, { type: "string" }, { type: "number" }, { type: "boolean" }],
          description: "JSON value to persist"
        }
      },
      required: ["key", "value"],
      additionalProperties: false
    }),
    defineTool("get_storage", "Read value by key from extension storage", {
      type: "object",
      properties: {
        key: { type: "string", description: "Storage key" }
      },
      required: ["key"],
      additionalProperties: false
    }),
    defineTool("crypto_encrypt", "Encrypt text with AES/DES/DESede and ECB/CBC", {
      type: "object",
      properties: {
        profileId: { type: "string" },
        profileName: { type: "string" },
        algorithm: { type: "string", enum: ["AES", "DES", "DESede"] },
        mode: { type: "string", enum: ["ECB", "CBC"] },
        keySize: { type: "integer", enum: [64, 128, 192, 256] },
        keyEncoding: { type: "string", enum: ["utf8", "base64", "hex"] },
        key: { type: "string" },
        ivEncoding: { type: "string", enum: ["utf8", "base64", "hex"] },
        iv: { type: "string" },
        plaintext: { type: "string" },
        plainEncoding: { type: "string", enum: ["utf8", "base64", "hex", "unicode"] },
        outputEncoding: { type: "string", enum: ["base64", "hex"] }
      },
      required: ["plaintext"],
      additionalProperties: false
    }),
    defineTool("crypto_encrypt_direct", "Encrypt with explicit parameters only (no profile)", {
      type: "object",
      properties: {
        algorithm: { type: "string", enum: ["AES", "DES", "DESede"] },
        mode: { type: "string", enum: ["ECB", "CBC"] },
        keySize: { type: "integer", enum: [64, 128, 192, 256] },
        keyEncoding: { type: "string", enum: ["utf8", "base64", "hex"] },
        key: { type: "string" },
        ivEncoding: { type: "string", enum: ["utf8", "base64", "hex"] },
        iv: { type: "string" },
        plaintext: { type: "string" },
        plainEncoding: { type: "string", enum: ["utf8", "base64", "hex", "unicode"] },
        outputEncoding: { type: "string", enum: ["base64", "hex"] }
      },
      required: ["algorithm", "mode", "keyEncoding", "key", "plaintext"],
      additionalProperties: false
    }),
    defineTool("crypto_decrypt", "Decrypt AES/DES/DESede ciphertext", {
      type: "object",
      properties: {
        profileId: { type: "string" },
        profileName: { type: "string" },
        algorithm: { type: "string", enum: ["AES", "DES", "DESede"] },
        mode: { type: "string", enum: ["ECB", "CBC"] },
        keySize: { type: "integer", enum: [64, 128, 192, 256] },
        keyEncoding: { type: "string", enum: ["utf8", "base64", "hex"] },
        key: { type: "string" },
        ivEncoding: { type: "string", enum: ["utf8", "base64", "hex"] },
        iv: { type: "string" },
        ciphertext: { type: "string" },
        cipherEncoding: { type: "string", enum: ["base64", "hex"] },
        outputEncoding: { type: "string", enum: ["utf8", "base64", "hex", "unicode"] }
      },
      required: ["ciphertext"],
      additionalProperties: false
    }),
    defineTool("crypto_decrypt_direct", "Decrypt with explicit parameters only (no profile)", {
      type: "object",
      properties: {
        algorithm: { type: "string", enum: ["AES", "DES", "DESede"] },
        mode: { type: "string", enum: ["ECB", "CBC"] },
        keySize: { type: "integer", enum: [64, 128, 192, 256] },
        keyEncoding: { type: "string", enum: ["utf8", "base64", "hex"] },
        key: { type: "string" },
        ivEncoding: { type: "string", enum: ["utf8", "base64", "hex"] },
        iv: { type: "string" },
        ciphertext: { type: "string" },
        cipherEncoding: { type: "string", enum: ["base64", "hex"] },
        outputEncoding: { type: "string", enum: ["utf8", "base64", "hex", "unicode"] }
      },
      required: ["algorithm", "mode", "keyEncoding", "key", "ciphertext"],
      additionalProperties: false
    }),
    defineTool("rsa_encrypt", "Encrypt with RSA public key (RSA-OAEP)", {
      type: "object",
      properties: {
        publicKey: { type: "string" },
        publicKeyEncoding: { type: "string", enum: ["base64", "hex", "pem"] },
        plaintext: { type: "string" },
        inputEncoding: { type: "string", enum: ["utf8", "base64", "hex", "unicode"] },
        outputEncoding: { type: "string", enum: ["base64", "hex"] },
        hash: { type: "string", enum: ["SHA-1", "SHA-256", "SHA-384", "SHA-512"] }
      },
      required: ["publicKey", "plaintext"],
      additionalProperties: false
    }),
    defineTool("rsa_encrypt_direct", "Encrypt with explicit RSA public key parameters", {
      type: "object",
      properties: {
        publicKey: { type: "string" },
        publicKeyEncoding: { type: "string", enum: ["base64", "hex", "pem"] },
        plaintext: { type: "string" },
        inputEncoding: { type: "string", enum: ["utf8", "base64", "hex", "unicode"] },
        outputEncoding: { type: "string", enum: ["base64", "hex"] },
        hash: { type: "string", enum: ["SHA-1", "SHA-256", "SHA-384", "SHA-512"] }
      },
      required: ["publicKey", "publicKeyEncoding", "plaintext"],
      additionalProperties: false
    }),
    defineTool("rsa_decrypt", "Decrypt with RSA private key (RSA-OAEP)", {
      type: "object",
      properties: {
        privateKey: { type: "string" },
        privateKeyEncoding: { type: "string", enum: ["base64", "hex", "pem"] },
        ciphertext: { type: "string" },
        inputEncoding: { type: "string", enum: ["base64", "hex"] },
        outputEncoding: { type: "string", enum: ["utf8", "base64", "hex", "unicode"] },
        hash: { type: "string", enum: ["SHA-1", "SHA-256", "SHA-384", "SHA-512"] }
      },
      required: ["privateKey", "ciphertext"],
      additionalProperties: false
    }),
    defineTool("rsa_decrypt_direct", "Decrypt with explicit RSA private key parameters", {
      type: "object",
      properties: {
        privateKey: { type: "string" },
        privateKeyEncoding: { type: "string", enum: ["base64", "hex", "pem"] },
        ciphertext: { type: "string" },
        inputEncoding: { type: "string", enum: ["base64", "hex"] },
        outputEncoding: { type: "string", enum: ["utf8", "base64", "hex", "unicode"] },
        hash: { type: "string", enum: ["SHA-1", "SHA-256", "SHA-384", "SHA-512"] }
      },
      required: ["privateKey", "privateKeyEncoding", "ciphertext"],
      additionalProperties: false
    }),
    defineTool("rsa_generate_keypair", "Generate RSA keypair and return base64/hex keys", {
      type: "object",
      properties: {
        modulusLength: { type: "integer", enum: [1024, 2048, 3072, 4096] },
        hash: { type: "string", enum: ["SHA-1", "SHA-256", "SHA-384", "SHA-512"] },
        outputEncoding: { type: "string", enum: ["base64", "hex"] }
      },
      additionalProperties: false
    }),
    defineTool("encoding_convert", "Convert text between utf8/base64/hex/unicode encodings", {
      type: "object",
      properties: {
        text: { type: "string" },
        from: { type: "string", enum: ["utf8", "base64", "hex", "unicode"] },
        to: { type: "string", enum: ["utf8", "base64", "hex", "unicode"] }
      },
      required: ["text", "from", "to"],
      additionalProperties: false
    }),
    defineTool("http_request", "Send arbitrary HTTP request with method/headers/body/query", {
      type: "object",
      properties: {
        url: { type: "string" },
        method: { type: "string" },
        query: {
          anyOf: [{ type: "object" }, { type: "string" }]
        },
        headers: {
          anyOf: [{ type: "object" }, { type: "string" }]
        },
        body: {
          anyOf: [{ type: "object" }, { type: "string" }, { type: "number" }, { type: "boolean" }]
        },
        bodyType: { type: "string", enum: ["auto", "json", "text"] },
        timeoutSec: { type: "integer", minimum: 3, maximum: 300 },
        responseType: { type: "string", enum: ["text", "json", "base64", "hex", "arraybuffer"] },
        responseEncoding: { type: "string", enum: ["utf8", "base64", "hex", "unicode"] },
        includeResponseHeaders: { type: "boolean" },
        maxResponseChars: { type: "integer", minimum: 512, maximum: 1000000 }
      },
      required: ["url"],
      additionalProperties: false
    }),
    defineTool("random_uuid", "Generate random UUID v4", {
      type: "object",
      properties: {},
      additionalProperties: false
    }),
    defineTool("random_uuid32", "Generate random UUID v4 without hyphens (32 chars)", {
      type: "object",
      properties: {},
      additionalProperties: false
    }),
    defineTool("random_string", "Generate random string with given length and charset", {
      type: "object",
      properties: {
        length: { type: "integer", minimum: 1, maximum: 4096 },
        charset: { type: "string", enum: ["alnum", "alpha", "lower", "upper", "numeric", "hex", "base64", "base64url", "custom"] },
        customChars: { type: "string", description: "Used when charset=custom or as direct charset source" }
      },
      additionalProperties: false
    }),
    defineTool("random_number", "Generate random number in range", {
      type: "object",
      properties: {
        min: { type: "number" },
        max: { type: "number" },
        integer: { type: "boolean", description: "default true" },
        precision: { type: "integer", minimum: 0, maximum: 12, description: "only for float" }
      },
      additionalProperties: false
    }),
    defineTool("tool_list", "List all available function calling tools", {
      type: "object",
      properties: {
        includeDescription: { type: "boolean" },
        includeParameters: { type: "boolean" }
      },
      additionalProperties: false
    }),
    defineTool("open_url", "Open URL in current tab", {
      type: "object",
      properties: {
        url: { type: "string" },
        waitUntilComplete: { type: "boolean" },
        timeoutSec: { type: "integer", minimum: 1, maximum: 120 }
      },
      required: ["url"],
      additionalProperties: false
    }),
    defineTool("wait_for_element", "Wait until selector appears (optionally with text filter)", {
      type: "object",
      properties: {
        selector: { type: "string" },
        text: { type: "string" },
        exact: { type: "boolean" },
        visibleOnly: { type: "boolean" },
        timeoutSec: { type: "integer", minimum: 1, maximum: 120 },
        intervalMs: { type: "integer", minimum: 50, maximum: 2000 }
      },
      required: ["selector"],
      additionalProperties: false
    }),
    defineTool("assert_page_state", "Assert page conditions for automation testing", {
      type: "object",
      properties: {
        checks: {
          type: "array",
          items: {
            type: "object",
            properties: {
              type: { type: "string", enum: ["selector", "url", "title", "page_text"] },
              selector: { type: "string" },
              text: { type: "string" },
              exact: { type: "boolean" },
              visibleOnly: { type: "boolean" },
              minCount: { type: "integer", minimum: 0 },
              maxCount: { type: "integer", minimum: 0 },
              contains: { type: "string" },
              value: { type: "string" }
            },
            required: ["type"],
            additionalProperties: false
          }
        }
      },
      required: ["checks"],
      additionalProperties: false
    }),
    defineTool("batch_execute", "Execute multiple tool calls in one request", {
      type: "object",
      properties: {
        stopOnError: { type: "boolean" },
        maxSteps: { type: "integer", minimum: 1, maximum: 100 },
        steps: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              tool: { type: "string" },
              args: { type: "object" }
            },
            additionalProperties: false
          }
        }
      },
      required: ["steps"],
      additionalProperties: false
    }),
    defineTool("click_element", "Click element by selector or text filter", {
      type: "object",
      properties: {
        selector: { type: "string" },
        text: { type: "string" },
        exact: { type: "boolean" },
        all: { type: "boolean" },
        index: { type: "integer", minimum: 0 },
        visibleOnly: { type: "boolean" }
      },
      additionalProperties: false
    }),
    defineTool("input_text", "Input text into input/textarea/contentEditable element", {
      type: "object",
      properties: {
        selector: { type: "string" },
        text: { type: "string" },
        append: { type: "boolean" },
        all: { type: "boolean" },
        index: { type: "integer", minimum: 0 }
      },
      required: ["selector", "text"],
      additionalProperties: false
    }),
    defineTool("select_option", "Select option in select element by value/text/index", {
      type: "object",
      properties: {
        selector: { type: "string" },
        value: { type: "string" },
        text: { type: "string" },
        optionIndex: { type: "integer", minimum: 0 },
        all: { type: "boolean" },
        index: { type: "integer", minimum: 0 }
      },
      required: ["selector"],
      additionalProperties: false
    }),
    defineTool("scroll_to", "Scroll page to selector or coordinates", {
      type: "object",
      properties: {
        selector: { type: "string" },
        top: { type: "number" },
        left: { type: "number" },
        behavior: { type: "string", enum: ["auto", "smooth"] }
      },
      additionalProperties: false
    }),
    defineTool("extract_table", "Extract table data", {
      type: "object",
      properties: {
        selector: { type: "string" },
        maxTables: { type: "integer", minimum: 1, maximum: 20 },
        maxRows: { type: "integer", minimum: 1, maximum: 500 }
      },
      additionalProperties: false
    }),
    defineTool("extract_form_schema", "Extract form schema and fields", {
      type: "object",
      properties: {
        selector: { type: "string" },
        maxForms: { type: "integer", minimum: 1, maximum: 50 },
        maxFields: { type: "integer", minimum: 1, maximum: 1000 },
        includeHidden: { type: "boolean" }
      },
      additionalProperties: false
    }),
    defineTool("extract_meta_tags", "Extract meta tags and canonical/title info", {
      type: "object",
      properties: {
        includeOpenGraph: { type: "boolean" },
        includeTwitter: { type: "boolean" }
      },
      additionalProperties: false
    }),
    defineTool("extract_jsonld", "Extract JSON-LD scripts from page", {
      type: "object",
      properties: {
        parse: { type: "boolean", description: "default true, parse JSON if possible" }
      },
      additionalProperties: false
    }),
    defineTool("query_by_text", "Find elements by visible text", {
      type: "object",
      properties: {
        text: { type: "string" },
        selector: { type: "string" },
        exact: { type: "boolean" },
        ignoreCase: { type: "boolean" },
        limit: { type: "integer", minimum: 1, maximum: 200 }
      },
      required: ["text"],
      additionalProperties: false
    }),
    defineTool("hash_digest", "Compute hash digest: MD5/SHA1/SHA256/SHA512", {
      type: "object",
      properties: {
        text: { type: "string" },
        inputEncoding: { type: "string", enum: ["utf8", "base64", "hex", "unicode"] },
        algorithm: { type: "string", enum: ["MD5", "SHA1", "SHA256", "SHA512"] },
        outputEncoding: { type: "string", enum: ["hex", "base64"] }
      },
      required: ["text"],
      additionalProperties: false
    }),
    defineTool("hmac_sign", "Compute HMAC signature: MD5/SHA1/SHA256/SHA512", {
      type: "object",
      properties: {
        text: { type: "string" },
        inputEncoding: { type: "string", enum: ["utf8", "base64", "hex", "unicode"] },
        key: { type: "string" },
        keyEncoding: { type: "string", enum: ["utf8", "base64", "hex", "unicode"] },
        algorithm: { type: "string", enum: ["MD5", "SHA1", "SHA256", "SHA512"] },
        outputEncoding: { type: "string", enum: ["hex", "base64"] }
      },
      required: ["text", "key"],
      additionalProperties: false
    }),
    defineTool("url_encode", "URL encode text", {
      type: "object",
      properties: {
        text: { type: "string" },
        component: { type: "boolean", description: "true=encodeURIComponent, false=encodeURI" }
      },
      required: ["text"],
      additionalProperties: false
    }),
    defineTool("url_decode", "URL decode text", {
      type: "object",
      properties: {
        text: { type: "string" },
        component: { type: "boolean", description: "true=decodeURIComponent, false=decodeURI" },
        plusAsSpace: { type: "boolean", description: "decode + as space before decoding" }
      },
      required: ["text"],
      additionalProperties: false
    }),
    defineTool("jwt_decode", "Decode JWT header/payload without verifying signature", {
      type: "object",
      properties: {
        token: { type: "string" }
      },
      required: ["token"],
      additionalProperties: false
    }),
    defineTool("jsonpath_query", "Query JSON by JSONPath (supports $, .prop, [index], ['prop'], [*])", {
      type: "object",
      properties: {
        json: {
          anyOf: [{ type: "object" }, { type: "array" }, { type: "string" }]
        },
        path: { type: "string" },
        firstOnly: { type: "boolean" }
      },
      required: ["json", "path"],
      additionalProperties: false
    }),
    defineTool("regex_extract", "Extract by regex pattern", {
      type: "object",
      properties: {
        text: { type: "string" },
        pattern: { type: "string" },
        flags: { type: "string" },
        all: { type: "boolean" },
        group: { type: "integer", minimum: 0 },
        limit: { type: "integer", minimum: 1, maximum: 500 }
      },
      required: ["text", "pattern"],
      additionalProperties: false
    }),
    defineTool("mcp_service_list", "List MCP services in current settings", {
      type: "object",
      properties: {
        includeSecret: { type: "boolean" }
      },
      additionalProperties: false
    }),
    defineTool("mcp_service_upsert", "Add or update MCP service by id/name and config", {
      type: "object",
      properties: {
        serviceId: { type: "string" },
        serviceName: { type: "string" },
        id: { type: "string" },
        name: { type: "string" },
        enabled: { type: "boolean" },
        transport: { type: "string", enum: ["streamable_http", "http", "sse", "stdio"] },
        baseURL: { type: "string" },
        apiKey: { type: "string" },
        mcpHeaders: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              value: { type: "string" },
              enabled: { type: "boolean" }
            },
            required: ["name", "value"],
            additionalProperties: false
          }
        },
        headers: {
          anyOf: [
            {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  value: { type: "string" },
                  enabled: { type: "boolean" }
                },
                required: ["name", "value"],
                additionalProperties: false
              }
            },
            { type: "object" }
          ]
        },
        command: { type: "string" },
        args: { type: "string" },
        envText: { type: "string" },
        service: { type: "object" }
      },
      additionalProperties: false
    }),
    defineTool("mcp_service_set_enabled", "Enable/disable MCP service by id/name/index", {
      type: "object",
      properties: {
        serviceId: { type: "string" },
        serviceName: { type: "string" },
        index: { type: "integer", minimum: 0 },
        enabled: { type: "boolean" }
      },
      required: ["enabled"],
      additionalProperties: false
    }),
    defineTool("mcp_service_test", "Test one MCP service and list available tool names", {
      type: "object",
      properties: {
        serviceId: { type: "string" },
        serviceName: { type: "string" },
        index: { type: "integer", minimum: 0 },
        service: { type: "object" }
      },
      additionalProperties: false
    }),
    defineTool("crypto_profile_list", "List persisted crypto profiles", {
      type: "object",
      properties: {
        includeSecret: { type: "boolean" }
      },
      additionalProperties: false
    }),
    defineTool("crypto_profile_get", "Get persisted crypto profile by id/name/index", {
      type: "object",
      properties: {
        profileId: { type: "string" },
        profileName: { type: "string" },
        id: { type: "string" },
        name: { type: "string" },
        index: { type: "integer", minimum: 0 },
        includeSecret: { type: "boolean" }
      },
      additionalProperties: false
    }),
    defineTool("crypto_profile_save", "Create or update persisted crypto profile", {
      type: "object",
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        algorithm: { type: "string", enum: ["AES", "DES", "DESede"] },
        mode: { type: "string", enum: ["ECB", "CBC"] },
        keySize: { type: "integer", enum: [64, 128, 192, 256] },
        keyEncoding: { type: "string", enum: ["utf8", "base64", "hex"] },
        keyValue: { type: "string" },
        ivEncoding: { type: "string", enum: ["utf8", "base64", "hex"] },
        ivValue: { type: "string" },
        description: { type: "string" }
      },
      required: ["name", "algorithm", "mode", "keyEncoding", "keyValue"],
      additionalProperties: false
    }),
    defineTool("crypto_profile_delete", "Delete persisted crypto profile(s) by id/name/index, or bulk delete", {
      type: "object",
      properties: {
        profileId: { type: "string" },
        profileName: { type: "string" },
        id: { type: "string" },
        name: { type: "string" },
        index: { type: "integer", minimum: 0 },
        profileIds: { type: "array", items: { type: "string" } },
        profileNames: { type: "array", items: { type: "string" } },
        indexes: { type: "array", items: { type: "integer", minimum: 0 } },
        query: { type: "string" },
        all: { type: "boolean" }
      },
      additionalProperties: false
    }),
    defineTool("crypto_profile_delete_many", "Alias of crypto_profile_delete for deleting multiple profiles", {
      type: "object",
      properties: {
        profileId: { type: "string" },
        profileName: { type: "string" },
        id: { type: "string" },
        name: { type: "string" },
        index: { type: "integer", minimum: 0 },
        profileIds: { type: "array", items: { type: "string" } },
        profileNames: { type: "array", items: { type: "string" } },
        indexes: { type: "array", items: { type: "integer", minimum: 0 } },
        query: { type: "string" },
        all: { type: "boolean" }
      },
      additionalProperties: false
    }),
    defineTool("get_whole_html", "Get full page HTML", {
      type: "object",
      properties: {},
      additionalProperties: false
    }),
    defineTool("replace_whole_html", "Replace full page HTML", {
      type: "object",
      properties: { html: { type: "string" } },
      required: ["html"],
      additionalProperties: false
    }),
    defineTool("translate_whole_page_to_zh", "Translate full page to Chinese and replace", {
      type: "object",
      properties: { note: { type: "string" } },
      additionalProperties: false
    })
  ];
  if (allowScript) {
    local.push(
      defineTool("execute_script", "Execute JavaScript in current page and return result (prefer `return ...`)", {
        type: "object",
        properties: {
          code: {
            type: "string",
            description: "JavaScript code to execute. Prefer explicit `return ...` to get result."
          },
          awaitPromise: {
            type: "boolean",
            description: "Whether to await Promise result. Default: true."
          }
        },
        required: ["code"],
        additionalProperties: false
      }),
      defineTool("append_script", "Append script", {
        type: "object",
        properties: { code: { type: "string" } },
        required: ["code"],
        additionalProperties: false
      })
    );
  }
  return local.concat(mcpToolSpecs || []);
}
function defineTool(name, description, parameters) {
  return {
    type: "function",
    function: {
      name,
      description,
      parameters
    }
  };
}
async function executeToolCall(call, ctx) {
  ensureTaskActive(ctx?.hooks);
  const name = call?.function?.name || "";
  const args = parseToolArgs(call?.function?.arguments || "{}");
  const depth = Number(ctx?.depth || 0);
  switch (name) {
    case "get_page_snapshot":
      return collectPageSnapshot(ctx.tabId);
    case "query_elements":
      return queryElements(ctx.tabId, args);
    case "extract_text":
      return extractText(ctx.tabId, args);
    case "extract_links":
      return extractLinks(ctx.tabId, args);
    case "extract_all_anchors":
      return extractAllAnchors(ctx.tabId, args);
    case "extract_elements_by_criteria":
      return extractElementsByCriteria(ctx.tabId, args);
    case "extract_buttons_info":
      return extractButtonsInfo(ctx.tabId, args);
    case "set_text":
      return setText(ctx.tabId, args);
    case "set_html":
      return setHTML(ctx.tabId, args);
    case "set_attribute":
      return setAttribute(ctx.tabId, args);
    case "remove_elements":
      return removeElements(ctx.tabId, args);
    case "set_storage":
      return setToolStorage(args);
    case "get_storage":
      return getToolStorage(args);
    case "crypto_encrypt":
      return toolCryptoEncrypt(args);
    case "crypto_encrypt_direct":
      return toolCryptoEncryptDirect(args);
    case "crypto_decrypt":
      return toolCryptoDecrypt(args);
    case "crypto_decrypt_direct":
      return toolCryptoDecryptDirect(args);
    case "rsa_encrypt":
      return toolRSAEncrypt(args);
    case "rsa_encrypt_direct":
      return toolRSAEncryptDirect(args);
    case "rsa_decrypt":
      return toolRSADecrypt(args);
    case "rsa_decrypt_direct":
      return toolRSADecryptDirect(args);
    case "rsa_generate_keypair":
      return toolRSAGenerateKeypair(args);
    case "encoding_convert":
      return toolEncodingConvert(args);
    case "http_request":
      return toolHttpRequest(args);
    case "random_uuid":
      return toolRandomUUID(args);
    case "random_uuid32":
      return toolRandomUUID32(args);
    case "random_string":
      return toolRandomString(args);
    case "random_number":
      return toolRandomNumber(args);
    case "tool_list":
      return toolToolList(args, ctx);
    case "open_url":
      return toolOpenURL(ctx.tabId, args);
    case "wait_for_element":
      return toolWaitForElement(ctx.tabId, args);
    case "assert_page_state":
      return toolAssertPageState(ctx.tabId, args);
    case "batch_execute":
      if (depth >= 1) {
        return { ok: false, error: "nested batch_execute is not allowed" };
      }
      return toolBatchExecute(args, { ...ctx, depth });
    case "click_element":
      return toolClickElement(ctx.tabId, args);
    case "input_text":
      return toolInputText(ctx.tabId, args);
    case "select_option":
      return toolSelectOption(ctx.tabId, args);
    case "scroll_to":
      return toolScrollTo(ctx.tabId, args);
    case "extract_table":
      return toolExtractTable(ctx.tabId, args);
    case "extract_form_schema":
      return toolExtractFormSchema(ctx.tabId, args);
    case "extract_meta_tags":
      return toolExtractMetaTags(ctx.tabId, args);
    case "extract_jsonld":
      return toolExtractJsonld(ctx.tabId, args);
    case "query_by_text":
      return toolQueryByText(ctx.tabId, args);
    case "hash_digest":
      return toolHashDigest(args);
    case "hmac_sign":
      return toolHmacSign(args);
    case "url_encode":
      return toolUrlEncode(args);
    case "url_decode":
      return toolUrlDecode(args);
    case "jwt_decode":
      return toolJwtDecode(args);
    case "jsonpath_query":
      return toolJsonpathQuery(args);
    case "regex_extract":
      return toolRegexExtract(args);
    case "mcp_service_list":
      return toolMcpServiceList(args);
    case "mcp_service_upsert":
      return toolMcpServiceUpsert(args);
    case "mcp_service_set_enabled":
      return toolMcpServiceSetEnabled(args);
    case "mcp_service_test":
      return toolMcpServiceTest(args);
    case "crypto_profile_list":
      return toolCryptoProfileList(args);
    case "crypto_profile_get":
      return toolCryptoProfileGet(args);
    case "crypto_profile_save":
      return toolCryptoProfileSave(args);
    case "crypto_profile_delete":
    case "crypto_profile_delete_many":
    case "crypto_profile_remove":
    case "crypto_delete_profile":
      return toolCryptoProfileDelete(args);
    case "append_script":
      if (!ctx.settings.allowScript) {
        return { ok: false, error: "append_script disabled by settings" };
      }
      return appendScript(ctx.tabId, args);
    case "execute_script":
      if (!ctx.settings.allowScript) {
        return { ok: false, error: "execute_script disabled by settings" };
      }
      return executeScriptWithResult(ctx.tabId, args);
    case "get_whole_html":
      return { ok: true, html: await getWholePageHTML(ctx.tabId) };
    case "replace_whole_html":
      return { ok: true, replaced: await replaceWholePageHTML(ctx.tabId, String(args.html || "")) };
    case "translate_whole_page_to_zh": {
      const html = await getWholePageHTML(ctx.tabId);
      const translated = await translateWholePageHTML({
        apiKey: ctx.settings.apiKey,
        model: ctx.settings.model,
        thinkingLevel: ctx.settings.thinkingLevel,
        baseURL: ctx.settings.baseURL,
        timeoutMs: ctx.settings.requestTimeoutSec * 1e3,
        html,
        userPrompt: "\u628A\u6574\u9875\u5185\u5BB9\u7FFB\u8BD1\u6210\u4E2D\u6587\u5E76\u4FDD\u6301\u7ED3\u6784\u4E0D\u53D8",
        stream: false,
        onReasoning: ctx.hooks?.onReasoning,
        hooks: ctx.hooks
      });
      return { ok: true, replaced: await replaceWholePageHTML(ctx.tabId, translated) };
    }
    default:
      if (name.startsWith("mcp_")) {
        return callMCPToolByAlias(ctx.mcpRegistry, name, args);
      }
      return { ok: false, error: `unknown tool: ${name}` };
  }
}
function parseToolArgs(raw) {
  try {
    const parsed = JSON.parse(String(raw || "{}"));
    if (parsed && typeof parsed === "object") {
      return parsed;
    }
  } catch (_err) {
  }
  return {};
}
async function queryElements(tabId, args) {
  const selector = String(args.selector || "").trim();
  const limit2 = Math.min(50, Math.max(1, Number(args.limit || 10)));
  const includeHTML = !!args.include_html;
  if (!selector) {
    return { ok: false, error: "selector is required" };
  }
  return execOnTab(
    tabId,
    (sel, lim, withHTML) => {
      const nodes = Array.from(document.querySelectorAll(sel)).slice(0, lim);
      return {
        ok: true,
        count: nodes.length,
        items: nodes.map((el) => ({
          tag: el.tagName.toLowerCase(),
          text: (el.innerText || el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 300),
          html: withHTML ? String(el.innerHTML || "").slice(0, 1200) : void 0
        }))
      };
    },
    [selector, limit2, includeHTML]
  );
}
async function extractText(tabId, args) {
  const selector = String(args.selector || "").trim();
  const maxLength = Math.min(2e4, Math.max(100, Number(args.maxLength || 2e3)));
  if (!selector) {
    return { ok: false, error: "selector is required" };
  }
  return execOnTab(
    tabId,
    (sel, maxLen) => {
      const nodes = Array.from(document.querySelectorAll(sel));
      const text = nodes.map((n) => (n.innerText || n.textContent || "").trim()).filter(Boolean).join("\n").slice(0, maxLen);
      return { ok: true, selector: sel, count: nodes.length, text };
    },
    [selector, maxLength]
  );
}
async function extractLinks(tabId, args) {
  const selector = String(args.selector || "a").trim() || "a";
  const maxCount = Math.min(200, Math.max(1, Number(args.maxCount || 30)));
  return execOnTab(
    tabId,
    (sel, maxCnt) => {
      const nodes = Array.from(document.querySelectorAll(sel)).filter((n) => n.tagName === "A").slice(0, maxCnt);
      return {
        ok: true,
        count: nodes.length,
        links: nodes.map((n) => ({
          text: (n.innerText || n.textContent || "").trim(),
          href: n.getAttribute("href") || n.href || ""
        }))
      };
    },
    [selector, maxCount]
  );
}
async function extractAllAnchors(tabId, args) {
  const maxCount = Math.min(500, Math.max(1, Number(args.maxCount || 200)));
  const includeAttributes = !!args.includeAttributes;
  return execOnTab(
    tabId,
    (maxCnt, withAttrs) => {
      const nodes = Array.from(document.querySelectorAll("a")).slice(0, maxCnt);
      return {
        ok: true,
        count: nodes.length,
        items: nodes.map((n) => ({
          text: (n.innerText || n.textContent || "").replace(/\s+/g, " ").trim(),
          href: n.getAttribute("href") || n.href || "",
          title: n.getAttribute("title") || "",
          target: n.getAttribute("target") || "",
          rel: n.getAttribute("rel") || "",
          id: n.id || "",
          className: n.className || "",
          attributes: withAttrs
            ? Array.from(n.attributes || []).reduce((acc, attr) => {
                acc[attr.name] = attr.value;
                return acc;
              }, {})
            : void 0
        }))
      };
    },
    [maxCount, includeAttributes]
  );
}
async function extractElementsByCriteria(tabId, args) {
  const selector = String(args.selector || "").trim();
  const tag = String(args.tag || "").trim().toLowerCase();
  const id = String(args.id || "").trim();
  const className = String(args.className || "").trim();
  const attrName = String(args.attrName || "").trim();
  const attrValue = String(args.attrValue || "");
  const maxCount = Math.min(200, Math.max(1, Number(args.maxCount || 30)));
  const includeHTML = !!args.includeHTML;
  const includeAttributes = !!args.includeAttributes;

  if (!selector && !tag && !id && !className && !attrName) {
    return { ok: false, error: "selector/tag/id/className/attrName 至少需要一个" };
  }

  return execOnTab(
    tabId,
    (sel, t, elementId, cls, aName, aValue, maxCnt, withHTML, withAttrs) => {
      const toSafeSelectorById = (v) => {
        if (!v) return "";
        if (window.CSS && typeof window.CSS.escape === "function") {
          return `#${window.CSS.escape(v)}`;
        }
        return `#${String(v).replace(/[^a-zA-Z0-9_-]/g, "")}`;
      };

      const queryBySelector = () => {
        if (sel) return Array.from(document.querySelectorAll(sel));
        if (elementId) return Array.from(document.querySelectorAll(toSafeSelectorById(elementId)));

        let baseSel = t || "*";
        if (cls) {
          if (window.CSS && typeof window.CSS.escape === "function") {
            baseSel += `.${window.CSS.escape(cls)}`;
          } else {
            baseSel += `.${String(cls).replace(/[^a-zA-Z0-9_-]/g, "")}`;
          }
        }
        return Array.from(document.querySelectorAll(baseSel));
      };

      let nodes = queryBySelector();
      if (aName) {
        nodes = nodes.filter((el) => {
          if (!el.hasAttribute(aName)) return false;
          if (aValue === "") return true;
          return (el.getAttribute(aName) || "") === aValue;
        });
      }

      nodes = nodes.slice(0, maxCnt);
      return {
        ok: true,
        count: nodes.length,
        items: nodes.map((el) => ({
          tag: el.tagName.toLowerCase(),
          id: el.id || "",
          className: el.className || "",
          text: (el.innerText || el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 500),
          html: withHTML ? String(el.innerHTML || "").slice(0, 2000) : void 0,
          attributes: withAttrs
            ? Array.from(el.attributes || []).reduce((acc, attr) => {
                acc[attr.name] = attr.value;
                return acc;
              }, {})
            : void 0
        }))
      };
    },
    [selector, tag, id, className, attrName, attrValue, maxCount, includeHTML, includeAttributes]
  );
}
async function extractButtonsInfo(tabId, args) {
  const selector = String(args.selector || "button, input[type='button'], input[type='submit'], [role='button']").trim();
  const maxCount = Math.min(200, Math.max(1, Number(args.maxCount || 100)));
  const includeAttributes = !!args.includeAttributes;
  return execOnTab(
    tabId,
    (sel, maxCnt, withAttrs) => {
      const nodes = Array.from(document.querySelectorAll(sel)).slice(0, maxCnt);
      return {
        ok: true,
        count: nodes.length,
        items: nodes.map((el) => ({
          tag: el.tagName.toLowerCase(),
          id: el.id || "",
          className: el.className || "",
          type: el.getAttribute("type") || "",
          name: el.getAttribute("name") || "",
          value: el.getAttribute("value") || "",
          role: el.getAttribute("role") || "",
          ariaLabel: el.getAttribute("aria-label") || "",
          title: el.getAttribute("title") || "",
          disabled: !!el.disabled || el.hasAttribute("disabled"),
          text: (el.innerText || el.textContent || el.value || "").replace(/\s+/g, " ").trim(),
          attributes: withAttrs
            ? Array.from(el.attributes || []).reduce((acc, attr) => {
                acc[attr.name] = attr.value;
                return acc;
              }, {})
            : void 0
        }))
      };
    },
    [selector, maxCount, includeAttributes]
  );
}
async function setText(tabId, args) {
  const selector = String(args.selector || "").trim();
  const text = String(args.text || "");
  if (!selector) {
    return { ok: false, error: "selector is required" };
  }
  return execOnTab(
    tabId,
    (sel, txt) => {
      const nodes = Array.from(document.querySelectorAll(sel));
      for (const n of nodes) n.textContent = txt;
      return { ok: true, updated: nodes.length };
    },
    [selector, text]
  );
}
async function setHTML(tabId, args) {
  const selector = String(args.selector || "").trim();
  const html = String(args.html || "");
  if (!selector) {
    return { ok: false, error: "selector is required" };
  }
  return execOnTab(
    tabId,
    (sel, h) => {
      const nodes = Array.from(document.querySelectorAll(sel));
      for (const n of nodes) n.innerHTML = h;
      return { ok: true, updated: nodes.length };
    },
    [selector, html]
  );
}
async function setAttribute(tabId, args) {
  const selector = String(args.selector || "").trim();
  const name = String(args.name || "").trim();
  const value = String(args.value || "");
  if (!selector || !name) {
    return { ok: false, error: "selector and name are required" };
  }
  return execOnTab(
    tabId,
    (sel, attr, val) => {
      const nodes = Array.from(document.querySelectorAll(sel));
      for (const n of nodes) n.setAttribute(attr, val);
      return { ok: true, updated: nodes.length };
    },
    [selector, name, value]
  );
}
async function removeElements(tabId, args) {
  const selector = String(args.selector || "").trim();
  if (!selector) {
    return { ok: false, error: "selector is required" };
  }
  return execOnTab(
    tabId,
    (sel) => {
      const nodes = Array.from(document.querySelectorAll(sel));
      for (const n of nodes) n.remove();
      return { ok: true, removed: nodes.length };
    },
    [selector]
  );
}
async function appendScript(tabId, args) {
  const code = String(args.code || "");
  if (!code.trim()) {
    return { ok: false, error: "code is required" };
  }
  const result = await chrome.scripting.executeScript({
    target: { tabId },
    world: "MAIN",
    args: [code],
    func: (js) => {
      try {
        // Prefer executing in main world directly, avoid inline <script> injection blocked by CSP.
        const fn = new Function(js);
        const value = fn();
        return { ok: true, mode: "main_world_function", value: typeof value === "undefined" ? null : value };
      } catch (err1) {
        try {
          // Secondary fallback for some OpenAI-compatible automation snippets.
          const value = (0, eval)(js);
          return { ok: true, mode: "main_world_eval", value: typeof value === "undefined" ? null : value };
        } catch (err2) {
          return {
            ok: false,
            error: `script execution blocked or failed: ${String(err2 || err1)}`,
            hint: "当前页面可能受 CSP 限制。可改用 DOM 工具（set_text/set_html/set_attribute/remove_elements）执行操作。"
          };
        }
      }
    }
  });
  return result?.[0]?.result || { ok: false, error: "no result" };
}
async function executeScriptWithResult(tabId, args) {
  const code = String(args.code || "");
  const awaitPromise = args.awaitPromise !== false;
  if (!code.trim()) {
    return { ok: false, error: "code is required" };
  }
  const result = await chrome.scripting.executeScript({
    target: { tabId },
    world: "MAIN",
    args: [code, awaitPromise],
    func: async (js, waitPromise) => {
      const seen = new WeakSet();
      const toSerializable = (value, depth = 0) => {
        if (value === null || typeof value === "undefined") return value ?? null;
        const t = typeof value;
        if (t === "string" || t === "number" || t === "boolean") return value;
        if (t === "bigint") return `${value.toString()}n`;
        if (t === "symbol") return String(value);
        if (t === "function") return `[Function ${value.name || "anonymous"}]`;
        if (value instanceof Date) return value.toISOString();
        if (value instanceof Error) {
          return {
            name: String(value.name || "Error"),
            message: String(value.message || ""),
            stack: String(value.stack || "")
          };
        }
        if (typeof Element !== "undefined" && value instanceof Element) {
          return {
            nodeType: "element",
            tag: String(value.tagName || "").toLowerCase(),
            id: String(value.id || ""),
            className: String(value.className || "")
          };
        }
        if (typeof Node !== "undefined" && value instanceof Node) {
          return {
            nodeType: String(value.nodeName || "").toLowerCase(),
            text: String(value.textContent || "").slice(0, 300)
          };
        }
        if (depth >= 4) return "[MaxDepth]";
        if (Array.isArray(value)) {
          return value.slice(0, 80).map((item) => toSerializable(item, depth + 1));
        }
        if (t === "object") {
          if (seen.has(value)) return "[Circular]";
          seen.add(value);
          const out = {};
          let i = 0;
          for (const key of Object.keys(value)) {
            out[key] = toSerializable(value[key], depth + 1);
            i += 1;
            if (i >= 80) break;
          }
          return out;
        }
        return String(value);
      };
      try {
        // Script can use await and return explicit value.
        const fn = new Function(`"use strict"; return (async () => {\n${js}\n})();`);
        let value = fn();
        if (waitPromise && value && typeof value.then === "function") {
          value = await value;
        }
        if (typeof value === "undefined") {
          try {
            let fallback = (0, eval)(js);
            if (waitPromise && fallback && typeof fallback.then === "function") {
              fallback = await fallback;
            }
            if (typeof fallback !== "undefined") {
              return {
                ok: true,
                mode: "execute_script_eval_fallback",
                value: toSerializable(fallback),
                note: "script block has no return, used eval fallback value"
              };
            }
          } catch (_fallbackErr) {
          }
          return {
            ok: true,
            mode: "execute_script_function",
            value: null,
            note: "script returned undefined, add `return ...` to get explicit value"
          };
        }
        return {
          ok: true,
          mode: "execute_script_function",
          value: toSerializable(value)
        };
      } catch (err1) {
        try {
          // Fallback for expression snippets.
          let value = (0, eval)(js);
          if (waitPromise && value && typeof value.then === "function") {
            value = await value;
          }
          return {
            ok: true,
            mode: "execute_script_eval",
            value: typeof value === "undefined" ? null : toSerializable(value),
            note: typeof value === "undefined" ? "expression result is undefined, add `return ...`" : void 0
          };
        } catch (err2) {
          return {
            ok: false,
            error: `script execution blocked or failed: ${String(err2 || err1)}`,
            hint: "当前页面可能受 CSP 限制。可改用 DOM 工具（set_text / set_html / set_attribute / remove_elements）。"
          };
        }
      }
    }
  });
  return result?.[0]?.result || { ok: false, error: "no result" };
}
async function execOnTab(tabId, func, args = []) {
  const result = await chrome.scripting.executeScript({
    target: { tabId },
    args,
    func
  });
  return result?.[0]?.result || { ok: false, error: "no result" };
}
async function getActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs?.[0] || null;
}
function isWholePageTranslateRequest(prompt) {
  const text = String(prompt || "").toLowerCase();
  const hasPageWord = text.includes("\u6574\u9875") || text.includes("\u6574\u4E2A\u9875\u9762") || text.includes("\u5F53\u524D\u9875\u9762") || text.includes("whole page");
  const hasTranslateWord = text.includes("\u7FFB\u8BD1") || text.includes("\u8BD1\u6210") || text.includes("translate");
  return hasPageWord && hasTranslateWord;
}
async function getWholePageHTML(tabId) {
  const result = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      const docType = document.doctype ? `<!DOCTYPE ${document.doctype.name}${document.doctype.publicId ? ` PUBLIC "${document.doctype.publicId}"` : ""}${document.doctype.systemId ? ` "${document.doctype.systemId}"` : ""}>` : "<!DOCTYPE html>";
      return `${docType}
${document.documentElement.outerHTML}`;
    }
  });
  return String(result?.[0]?.result || "");
}
async function replaceWholePageHTML(tabId, html) {
  const result = await chrome.scripting.executeScript({
    target: { tabId },
    args: [String(html || "")],
    func: (newHTML) => {
      document.open();
      document.write(newHTML);
      document.close();
      return { title: document.title || "", url: location.href };
    }
  });
  return result?.[0]?.result || {};
}
function stripCodeFence(text) {
  const raw = String(text || "").trim();
  const match = raw.match(/^```(?:html)?\s*([\s\S]*?)\s*```$/i);
  return match ? match[1].trim() : raw;
}
async function translateWholePageHTML({ apiKey, model, thinkingLevel, baseURL, timeoutMs, html, userPrompt, stream, onDelta, onReasoning, hooks }) {
  const systemPrompt = [
    "\u4F60\u662F\u7F51\u9875\u7FFB\u8BD1\u5668\u3002",
    "\u628A\u8F93\u5165 HTML \u4E2D\u53EF\u89C1\u82F1\u6587\u7FFB\u8BD1\u6210\u4E2D\u6587\u3002",
    "\u4FDD\u6301 HTML \u7ED3\u6784\u3001\u6807\u7B7E\u3001\u5C5E\u6027\u3001\u811A\u672C\u548C\u6837\u5F0F\u57FA\u672C\u4E0D\u53D8\u3002",
    "\u53EA\u8F93\u51FA\u5B8C\u6574 HTML\uFF0C\u4E0D\u8981\u89E3\u91CA\u3002"
  ].join("\n");
  const text = await requestModelText({
    apiKey,
    model,
    thinkingLevel,
    baseURL,
    timeoutMs,
    systemPrompt,
    userPayload: { instruction: userPrompt, html },
    stream: !!stream,
    onDelta,
    onReasoning,
    hooks
  });
  const cleaned = stripCodeFence(text);
  if (!cleaned.toLowerCase().includes("<html")) {
    throw new Error("\u6A21\u578B\u672A\u8FD4\u56DE\u5B8C\u6574 HTML\uFF0C\u5DF2\u4E2D\u6B62\u66FF\u6362");
  }
  return cleaned;
}
async function collectPageSnapshot(tabId) {
  const result = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      const cssEscape = (value) => {
        if (window.CSS && typeof window.CSS.escape === "function") {
          return window.CSS.escape(value);
        }
        return String(value).replace(/[^a-zA-Z0-9_-]/g, "");
      };
      const getSelector = (el) => {
        if (!el || el.nodeType !== 1) return "";
        if (el.id) return `#${cssEscape(el.id)}`;
        const parts = [];
        let cur = el;
        while (cur && cur.nodeType === 1 && parts.length < 5) {
          let seg = cur.tagName.toLowerCase();
          const classNames = Array.from(cur.classList || []).map((name) => name.trim()).filter(Boolean).slice(0, 2).map((name) => `.${cssEscape(name)}`).join("");
          seg += classNames;
          if (cur.parentElement) {
            const same = Array.from(cur.parentElement.children).filter((n) => n.tagName === cur.tagName);
            if (same.length > 1) {
              seg += `:nth-of-type(${same.indexOf(cur) + 1})`;
            }
          }
          parts.unshift(seg);
          cur = cur.parentElement;
        }
        return parts.join(" > ");
      };
      const pick = Array.from(
        document.querySelectorAll("h1,h2,h3,h4,p,li,a,button,label,span,strong,em,td,th,input,textarea")
      ).filter((el) => {
        const text = el.tagName === "INPUT" || el.tagName === "TEXTAREA" ? el.value || el.placeholder || "" : el.textContent || "";
        return text.trim().length > 0;
      }).slice(0, 180).map((el) => {
        const text = el.tagName === "INPUT" || el.tagName === "TEXTAREA" ? el.value || el.placeholder || "" : el.textContent || "";
        return {
          selector: getSelector(el),
          tag: el.tagName.toLowerCase(),
          text: text.replace(/\s+/g, " ").trim().slice(0, 180),
          href: el.tagName === "A" ? el.getAttribute("href") || "" : ""
        };
      });
      const selectedText = window.getSelection()?.toString().trim() || "";
      const bodyText = (document.body?.innerText || "").replace(/\s+/g, " ").trim().slice(0, 5e3);
      return { title: document.title || "", url: location.href, selectedText, bodyText, nodes: pick };
    }
  });
  return result?.[0]?.result || {};
}
async function fetchMCPTools(settings) {
  const enabledServices = Array.isArray(settings.mcpServices) ? settings.mcpServices.filter((item) => item && item.enabled) : [];
  if (enabledServices.length === 0) {
    return { toolSpecs: [], aliasMap: {}, errors: [] };
  }
  const resolved = await Promise.all(enabledServices.map((service) => fetchMCPToolsForService(service)));
  const toolSpecs = [];
  const aliasMap = {};
  const errors = [];
  for (const item of resolved) {
    if (!item.ok) {
      errors.push(item.error || "\u672A\u77E5 MCP \u9519\u8BEF");
      continue;
    }
    const service = item.service;
    const serviceName = getMCPServiceName(service);
    if (!Array.isArray(item.tools) || item.tools.length === 0) {
      errors.push(toMCPError(service, "未返回可用工具列表（0 个 tools），请检查 transport、URL 与鉴权配置"));
      continue;
    }
    for (const t of item.tools) {
      const realName = String(t?.name || "").trim();
      if (!realName) {
        continue;
      }
      const alias = toSafeMCPAlias(service.id, realName, aliasMap);
      aliasMap[alias] = {
        serviceId: service.id,
        serviceName,
        transport: service.transport,
        baseURL: service.baseURL,
        apiKey: service.apiKey,
        mcpHeaders: service.mcpHeaders,
        command: service.command,
        args: service.args,
        envText: service.envText,
        realName
      };
      toolSpecs.push(
        defineTool(
          alias,
          `[${serviceName}] ${String(t?.description || `MCP tool: ${realName}`)}`,
          normalizeToolSchema(t?.input_schema || t?.parameters || t?.inputSchema)
        )
      );
    }
  }
  if (toolSpecs.length === 0 && errors.length === 0 && enabledServices.length > 0) {
    errors.push("MCP 已启用但未加载到任何工具，请检查服务是否返回 tools/list。");
  }
  return { toolSpecs, aliasMap, errors };
}
function getMCPServiceName(service) {
  const name = String(service?.name || "").trim();
  return name || `MCP(${service?.transport || "http"})`;
}
function toMCPError(service, message) {
  return `[${getMCPServiceName(service)}] ${message}`;
}
async function fetchMCPToolsForService(service) {
  if (!service?.baseURL) {
    return { ok: false, service, error: toMCPError(service, "\u672A\u914D\u7F6E Base URL/\u6865\u63A5 URL") };
  }
  if (service.transport === "stdio" && !String(service.command || "").trim()) {
    return { ok: false, service, error: toMCPError(service, "STDIO \u6A21\u5F0F\u7F3A\u5C11 command") };
  }
  try {
    if (service.transport === "streamable_http") {
      const result = await callStreamableHTTP(service, "tools/list");
      const tools2 = parseMCPToolsFromResponse(result?.tools ? result : result?.result || result);
      return { ok: true, service, tools: tools2 };
    }
    if (service.transport === "sse" && isLikelyDirectSSEEndpoint(service)) {
      const result = await callSSEMCP(service, "tools/list", {});
      const tools2 = parseMCPToolsFromResponse(result?.tools ? result : result?.result || result);
      return { ok: true, service, tools: tools2 };
    }
    if (service.transport === "http") {
      const resp2 = await tracedFetch(
        joinURL(service.baseURL, "tools"),
        {
          method: "GET",
          headers: buildMCPHeaders(service)
        },
        null,
        "MCP Tools List"
      );
      const data2 = await resp2.json().catch(() => ({}));
      if (!resp2.ok) {
        return {
          ok: false,
          service,
          error: toMCPError(service, `${data2?.error?.message || `MCP /tools HTTP ${resp2.status}`} (${joinURL(service.baseURL, "tools")})`)
        };
      }
      const tools2 = parseMCPToolsFromResponse(data2);
      return { ok: true, service, tools: tools2 };
    }
    const bridgePayload = buildBridgeTransportPayload(service);
    const resp = await tracedFetch(
      joinURL(service.baseURL, "tools"),
      {
        method: "POST",
        headers: buildMCPHeaders(service),
        body: JSON.stringify(bridgePayload)
      },
      null,
      "MCP Bridge Tools List"
    );
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      return {
        ok: false,
        service,
        error: toMCPError(
          service,
          `${data?.error?.message || `MCP bridge /tools HTTP ${resp.status}`} (${joinURL(service.baseURL, "tools")})`
        )
      };
    }
    const tools = parseMCPToolsFromResponse(data);
    return { ok: true, service, tools };
  } catch (err) {
    return { ok: false, service, error: toMCPError(service, String(err)) };
  }
}
function parseMCPToolsFromResponse(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.tools)) return data.tools;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}
function buildBridgeTransportPayload(service) {
  if (service.transport === "stdio") {
    return {
      transport: "stdio",
      command: String(service.command || "").trim(),
      args: parseStdioArgs(service.args),
      env: parseStdioEnv(service.envText)
    };
  }
  if (service.transport === "sse") {
    return {
      transport: "sse"
    };
  }
  return {
    transport: String(service.transport || "http")
  };
}
function parseStdioArgs(raw) {
  const text = String(raw || "").trim();
  if (!text) return [];
  if (text.startsWith("[")) {
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        return parsed.map((v) => String(v));
      }
    } catch (_err) {
    }
  }
  const tokens = text.match(/"[^"]*"|'[^']*'|\S+/g) || [];
  return tokens.map((token) => token.replace(/^['"]|['"]$/g, ""));
}
function parseStdioEnv(raw) {
  const text = String(raw || "").trim();
  if (!text) {
    return {};
  }
  if (text.startsWith("{")) {
    try {
      const obj = JSON.parse(text);
      if (obj && typeof obj === "object" && !Array.isArray(obj)) {
        return obj;
      }
    } catch (_err) {
    }
  }
  const env = {};
  for (const line of text.split(/\r?\n/)) {
    const row = line.trim();
    if (!row || row.startsWith("#")) continue;
    const i = row.indexOf("=");
    if (i <= 0) continue;
    const key = row.slice(0, i).trim();
    const value = row.slice(i + 1).trim();
    if (key) env[key] = value;
  }
  return env;
}
function normalizeToolSchema(schema) {
  if (schema && typeof schema === "object") return schema;
  return { type: "object", properties: {}, additionalProperties: true };
}
function toSafeMCPAlias(serviceId, realName, existingMap) {
  const safeServiceId = String(serviceId || "svc").replace(/[^a-zA-Z0-9_]/g, "_");
  const safeName = String(realName || "tool").replace(/[^a-zA-Z0-9_]/g, "_");
  const base = `mcp_${safeServiceId}_${safeName}`;
  let alias = base;
  let idx = 2;
  while (existingMap[alias]) {
    alias = `${base}_${idx}`;
    idx += 1;
  }
  return alias;
}
async function callMCPToolByAlias(mcpRegistry, alias, args) {
  const toolEntry = mcpRegistry?.aliasMap?.[alias];
  if (!toolEntry) {
    return { ok: false, error: `unknown MCP alias: ${alias}` };
  }
  try {
    if (toolEntry.transport === "streamable_http") {
      const result = await callStreamableHTTP(toolEntry, "tools/call", {
        name: toolEntry.realName,
        arguments: args || {}
      });
      return { ok: true, result: typeof result?.result !== "undefined" ? result.result : result };
    }
    if (toolEntry.transport === "sse" && isLikelyDirectSSEEndpoint(toolEntry)) {
      const result = await callSSEMCP(toolEntry, "tools/call", {
        name: toolEntry.realName,
        arguments: args || {}
      });
      return { ok: true, result: typeof result?.result !== "undefined" ? result.result : result };
    }
    if (toolEntry.transport === "http") {
      const resp2 = await tracedFetch(
        joinURL(toolEntry.baseURL, "call"),
        {
          method: "POST",
          headers: buildMCPHeaders(toolEntry),
          body: JSON.stringify({ name: toolEntry.realName, arguments: args || {} })
        },
        null,
        "MCP Tool Call"
      );
      const data2 = await resp2.json().catch(() => ({}));
      if (!resp2.ok) {
        return {
          ok: false,
          error: data2?.error?.message || `[${toolEntry.serviceName}] MCP /call HTTP ${resp2.status} (${joinURL(toolEntry.baseURL, "call")})`
        };
      }
      return { ok: true, result: typeof data2?.result !== "undefined" ? data2.result : data2 };
    }
    const bridgePayload = {
      ...buildBridgeTransportPayload(toolEntry),
      name: toolEntry.realName,
      arguments: args || {}
    };
    const resp = await tracedFetch(
      joinURL(toolEntry.baseURL, "call"),
      {
        method: "POST",
        headers: buildMCPHeaders(toolEntry),
        body: JSON.stringify(bridgePayload)
      },
      null,
      "MCP Bridge Tool Call"
    );
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      return {
        ok: false,
        error: data?.error?.message || `[${toolEntry.serviceName}] MCP bridge /call HTTP ${resp.status} (${joinURL(toolEntry.baseURL, "call")})`
      };
    }
    return { ok: true, result: typeof data?.result !== "undefined" ? data.result : data };
  } catch (err) {
    return { ok: false, error: `[${toolEntry.serviceName}] ${String(err)}` };
  }
}
function isLikelyDirectSSEEndpoint(service) {
  const raw = String(service?.baseURL || "").trim().toLowerCase();
  if (!raw) return false;
  try {
    const url = new URL(raw);
    const path = String(url.pathname || "").toLowerCase();
    if (path.endsWith("/sse") || path.endsWith("/sse/")) return true;
    if (path.includes("/sse/")) return true;
    if (path.endsWith("/events") || path.endsWith("/event-stream")) return true;
  } catch (_err) {
  }
  return /\/sse(?:\/|\?|$)/.test(raw);
}
function normalizeSSEHandshakeEndpoint(baseURL) {
  const raw = String(baseURL || "").trim();
  if (!raw) return "";
  try {
    const u = new URL(raw);
    let p = String(u.pathname || "");
    p = p.replace(/\/+$/, "");
    if (/\/sse\/(tools|call)$/i.test(p)) {
      p = p.replace(/\/(tools|call)$/i, "");
      u.pathname = p || "/";
      return u.toString();
    }
    return u.toString();
  } catch (_err) {
    return raw.replace(/\/sse\/(tools|call)(\?|$)/i, "/sse$2");
  }
}
function getMcpSSESessionKey(service) {
  return `${getMcpServiceCacheKey(service)}|sse`;
}
function clearSSESession(service) {
  const key = getMcpSSESessionKey(service);
  if (!Object.prototype.hasOwnProperty.call(mcpSSESessions, key)) {
    return;
  }
  const entry = mcpSSESessions[key];
  try {
    if (entry?.reader && typeof entry.reader.cancel === "function") {
      entry.reader.cancel();
    }
  } catch (_err) {
  }
  try {
    if (entry?.controller && typeof entry.controller.abort === "function") {
      entry.controller.abort();
    }
  } catch (_err) {
  }
  rejectAllSSEPending(entry, "SSE session cleared");
  delete mcpSSESessions[key];
}
function parseSSEBlocks(buffer) {
  const normalized = String(buffer || "");
  const parts = normalized.split(/\r?\n\r?\n/);
  const remain = parts.pop() || "";
  return { blocks: parts, remain };
}
function parseSSEBlock(block) {
  const lines = String(block || "").split(/\r?\n/);
  let event = "";
  const dataLines = [];
  for (const line of lines) {
    const row = String(line || "").trim();
    if (!row) continue;
    if (row.startsWith("event:")) {
      event = row.slice(6).trim();
      continue;
    }
    if (row.startsWith("data:")) {
      dataLines.push(row.slice(5).trim());
    }
  }
  return { event: event.toLowerCase(), data: dataLines.join("\n").trim() };
}
function normalizeRpcID(id) {
  if (typeof id === "string") return id.trim();
  if (typeof id === "number" || typeof id === "bigint") return String(id);
  return "";
}
function rejectAllSSEPending(entry, reason) {
  if (!entry?.pending || typeof entry.pending.forEach !== "function") return;
  const text = String(reason || "SSE session closed");
  entry.pending.forEach((waiter) => {
    try {
      if (waiter?.timerId) clearTimeout(waiter.timerId);
    } catch (_err) {
    }
    try {
      if (typeof waiter?.reject === "function") waiter.reject(new Error(text));
    } catch (_err) {
    }
  });
  try {
    entry.pending.clear();
  } catch (_err) {
  }
}
function consumeSSEInbox(entry, requestId) {
  if (!entry?.inbox || typeof entry.inbox.get !== "function") return null;
  const rid = normalizeRpcID(requestId);
  if (!rid) return null;
  const hit = entry.inbox.get(rid);
  if (typeof hit === "undefined") return null;
  try {
    entry.inbox.delete(rid);
  } catch (_err) {
  }
  return hit;
}
function waitForSSEJsonRpcResponse(entry, requestId, timeoutMs = 15e3) {
  const rid = normalizeRpcID(requestId);
  if (!rid) return Promise.resolve(null);
  const inboxHit = consumeSSEInbox(entry, rid);
  if (inboxHit) return Promise.resolve(inboxHit);
  if (!entry.pending || typeof entry.pending.set !== "function") {
    entry.pending = /* @__PURE__ */ new Map();
  }
  return new Promise((resolve, reject) => {
    const timerId = setTimeout(() => {
      try {
        entry.pending.delete(rid);
      } catch (_err) {
      }
      reject(new Error(`SSE response timeout for request id=${rid}`));
    }, Math.max(1500, Number(timeoutMs || 0)));
    entry.pending.set(rid, { resolve, reject, timerId });
  });
}
function resolveSSEPostURL(baseURL, rawData) {
  const data = String(rawData || "").trim();
  if (!data) return "";
  if (/^https?:\/\//i.test(data)) return data;
  try {
    return new URL(data, String(baseURL || "")).toString();
  } catch (_err) {
    return "";
  }
}
function extractSessionIdFromURL(urlText) {
  const raw = String(urlText || "").trim();
  if (!raw) return "";
  try {
    const u = new URL(raw);
    const keys = ["session_id", "sessionId", "sid", "session-id"];
    for (const key of keys) {
      const value = String(u.searchParams.get(key) || "").trim();
      if (value) return value;
    }
  } catch (_err) {
  }
  return "";
}
function buildSSEHeaders(service, extra = {}) {
  const headers = {
    Accept: "text/event-stream, application/json",
    ...mcpHeadersToObject(service, { sessionId: extra.sessionId })
  };
  return headers;
}
async function openSSESession(service) {
  const endpoint = normalizeSSEHandshakeEndpoint(service.baseURL);
  const key = getMcpSSESessionKey(service);
  const exists = mcpSSESessions[key];
  if (exists?.postURL && !exists?.closed) {
    return exists;
  }
  if (exists?.openingPromise) {
    return exists.openingPromise;
  }
  const openingPromise = (async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      try {
        controller.abort();
      } catch (_err) {
      }
    }, 8e3);
    try {
      const resp = await fetch(endpoint, {
        method: "GET",
        headers: buildSSEHeaders(service),
        signal: controller.signal
      });
      if (!resp.ok) {
        const txt = await resp.text().catch(() => "");
        throw new Error(txt || `SSE handshake HTTP ${resp.status}`);
      }
      const headerSessionId = readMcpSessionIDFromHeaders(resp.headers);
      let postURL = "";
      let sessionId = headerSessionId;
      let reader = null;
      let decoder = null;
      let remain = "";
      const ctype = String(resp.headers.get("content-type") || "").toLowerCase();
      if (ctype.includes("application/json")) {
        const data = await resp.json().catch(() => ({}));
        postURL = resolveSSEPostURL(endpoint, data?.endpoint || data?.url || data?.postUrl || data?.messageUrl || "");
        sessionId = String(data?.sessionId || data?.session_id || sessionId || "").trim();
      } else if (resp.body && typeof resp.body.getReader === "function") {
        reader = resp.body.getReader();
        decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          remain += decoder.decode(value, { stream: true });
          const parsed = parseSSEBlocks(remain);
          remain = parsed.remain;
          for (const block of parsed.blocks) {
            const evt = parseSSEBlock(block);
            if (!evt.data) continue;
            if (evt.event.includes("endpoint") || evt.event.includes("message")) {
              postURL = resolveSSEPostURL(endpoint, evt.data);
            } else {
              try {
                const asObj = JSON.parse(evt.data);
                if (!postURL) {
                  postURL = resolveSSEPostURL(endpoint, asObj?.endpoint || asObj?.url || asObj?.postUrl || "");
                }
                if (!sessionId) {
                  sessionId = String(asObj?.sessionId || asObj?.session_id || "").trim();
                }
              } catch (_err) {
                if (!postURL && (evt.data.startsWith("/") || /^https?:\/\//i.test(evt.data))) {
                  postURL = resolveSSEPostURL(endpoint, evt.data);
                }
              }
            }
            if (postURL) break;
          }
          if (postURL) break;
        }
      } else {
        const text = await resp.text().catch(() => "");
        const parsed = parseSSEBlock(text);
        postURL = resolveSSEPostURL(endpoint, parsed.data);
      }
      if (!postURL) {
        throw new Error("SSE handshake failed: no endpoint event received");
      }
      if (!sessionId) {
        sessionId = extractSessionIdFromURL(postURL);
      }
      const entry = {
        postURL,
        sessionId,
        initialized: false,
        updatedAt: Date.now(),
        controller,
        reader,
        pending: /* @__PURE__ */ new Map(),
        inbox: /* @__PURE__ */ new Map(),
        closed: false,
        openingPromise: null
      };
      mcpSSESessions[key] = entry;
      if (reader && decoder) {
        void (async () => {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              remain += decoder.decode(value, { stream: true });
              const parsed = parseSSEBlocks(remain);
              remain = parsed.remain;
              for (const block of parsed.blocks) {
                const evt = parseSSEBlock(block);
                if (!evt.data) continue;
                try {
                  const asObj = JSON.parse(evt.data);
                  const sid = String(asObj?.sessionId || asObj?.session_id || "").trim();
                  if (sid) {
                    entry.sessionId = sid;
                    entry.updatedAt = Date.now();
                  }
                  if (asObj && typeof asObj === "object" && Object.prototype.hasOwnProperty.call(asObj, "id")) {
                    const rid = normalizeRpcID(asObj.id);
                    if (rid) {
                      const waiter = entry.pending?.get(rid);
                      if (waiter) {
                        try {
                          if (waiter.timerId) clearTimeout(waiter.timerId);
                        } catch (_err) {
                        }
                        try {
                          entry.pending.delete(rid);
                        } catch (_err) {
                        }
                        if (asObj.error) {
                          const detail = extractMcpErrorMessage(asObj) || "SSE RPC error";
                          waiter.reject(createMcpHttpError(400, detail, asObj));
                        } else {
                          waiter.resolve(asObj);
                        }
                      } else if (entry.inbox && typeof entry.inbox.set === "function") {
                        entry.inbox.set(rid, asObj);
                      }
                    }
                  }
                } catch (_err) {
                }
              }
            }
          } catch (_err) {
          } finally {
            entry.closed = true;
            rejectAllSSEPending(entry, "SSE stream closed");
            if (mcpSSESessions[key] === entry) {
              delete mcpSSESessions[key];
            }
          }
        })();
      }
      return entry;
    } finally {
      clearTimeout(timeoutId);
    }
  })();
  mcpSSESessions[key] = { openingPromise };
  try {
    return await openingPromise;
  } catch (err) {
    if (mcpSSESessions[key]?.openingPromise === openingPromise) {
      delete mcpSSESessions[key];
    }
    throw err;
  }
}
async function postSSEJSONRPC(service, session, method, params, options = {}) {
  const payload = {
    jsonrpc: "2.0",
    method: String(method || "")
  };
  let requestId = null;
  if (!options.notification) {
    requestId = nextMcpRpcID();
    payload.id = requestId;
  }
  if (typeof params !== "undefined") {
    payload.params = params;
  }
  const resp = await tracedFetch(
    session.postURL,
    {
      method: "POST",
      headers: {
        ...buildMCPHeaders(service, { sessionId: session.sessionId }),
        Accept: "application/json, text/event-stream"
      },
      body: JSON.stringify(payload)
    },
    null,
    "MCP SSE Call"
  );
  const data = await parseJSONOrSSEResponse(resp);
  const sid = readMcpSessionIDFromHeaders(resp.headers);
  if (sid) {
    session.sessionId = sid;
  }
  if (!resp.ok) {
    const detail = extractMcpErrorMessage(data);
    throw createMcpHttpError(resp.status, detail || `SSE RPC HTTP ${resp.status}`, data);
  }
  if (options.notification) {
    return data;
  }
  if (data && typeof data === "object" && (Object.prototype.hasOwnProperty.call(data, "result") || Object.prototype.hasOwnProperty.call(data, "error"))) {
    return data;
  }
  const rid = normalizeRpcID(requestId);
  if (!rid) {
    return data;
  }
  const streamData = await waitForSSEJsonRpcResponse(
    session,
    rid,
    Math.max(15e3, Number(options.timeoutMs || 0), Number(service?.requestTimeoutSec || 0) * 1e3 || 0)
  );
  if (streamData && typeof streamData === "object" && streamData.error) {
    const detail2 = extractMcpErrorMessage(streamData);
    throw createMcpHttpError(400, detail2 || "SSE RPC error", streamData);
  }
  return streamData || data;
}
async function ensureSSEInitialized(service, session) {
  if (session.initialized) return;
  const initParams = {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: {
      name: "smartpage-agent",
      version: "0.1.0"
    }
  };
  await postSSEJSONRPC(service, session, "initialize", initParams);
  try {
    await postSSEJSONRPC(service, session, "notifications/initialized", {}, { notification: true });
  } catch (_err) {
  }
  session.initialized = true;
}
async function callSSEMCP(service, method, params) {
  const endpoint = String(service.baseURL || "").trim();
  const normalizedParams = method === "tools/list" && params && typeof params === "object" && Object.keys(params).length === 0 ? void 0 : params;
  try {
    let session = await openSSESession(service);
    if (method !== "initialize" && method !== "notifications/initialized") {
      await ensureSSEInitialized(service, session);
    }
    const data = await postSSEJSONRPC(service, session, method, normalizedParams);
    if (data && typeof data === "object" && data.error) {
      const msg = data?.error?.message || JSON.stringify(data.error);
      throw new Error(`SSE RPC error: ${msg}`);
    }
    if (data && typeof data === "object" && Object.prototype.hasOwnProperty.call(data, "result")) {
      return data.result;
    }
    return data;
  } catch (err) {
    const status = Number(err?.status || 0);
    const retriable = status === 400 || status === 401 || status === 403 || status === 404;
    if (retriable) {
      clearSSESession(service);
      try {
        const session2 = await openSSESession(service);
        if (method !== "initialize" && method !== "notifications/initialized") {
          await ensureSSEInitialized(service, session2);
        }
        const data2 = await postSSEJSONRPC(service, session2, method, normalizedParams);
        if (data2 && typeof data2 === "object" && data2.error) {
          const msg2 = data2?.error?.message || JSON.stringify(data2.error);
          throw new Error(`SSE RPC error: ${msg2}`);
        }
        if (data2 && typeof data2 === "object" && Object.prototype.hasOwnProperty.call(data2, "result")) {
          return data2.result;
        }
        return data2;
      } catch (err2) {
        const detail2 = extractMcpErrorMessage(err2?.data) || String(err2?.message || err2);
        throw new Error(`SSE MCP error (${endpoint}): ${detail2}`);
      }
    }
    const detail = extractMcpErrorMessage(err?.data) || String(err?.message || err);
    throw new Error(`SSE MCP error (${endpoint}): ${detail}`);
  }
}
function buildMCPHeaders(service, extra = {}) {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
    ...mcpHeadersToObject(service, { sessionId: extra.sessionId })
  };
  return headers;
}
function nextMcpRpcID() {
  mcpRpcSeq += 1;
  return mcpRpcSeq;
}
function getMcpServiceCacheKey(service) {
  return `${String(service?.id || service?.serviceId || "")}|${String(service?.baseURL || "")}`;
}
function readMcpSessionIDFromHeaders(headers) {
  if (!headers) return "";
  return String(
    headers.get("mcp-session-id") ||
      headers.get("MCP-Session-Id") ||
      headers.get("x-mcp-session-id") ||
      ""
  ).trim();
}
function extractMcpErrorMessage(data) {
  if (!data) return "";
  if (typeof data === "string") return data;
  if (typeof data === "object") {
    if (data.error && typeof data.error === "object" && data.error.message) {
      return String(data.error.message);
    }
    if (typeof data.message === "string" && data.message) {
      return data.message;
    }
    if (typeof data.detail === "string" && data.detail) {
      return data.detail;
    }
    if (typeof data.__raw_text === "string" && data.__raw_text) {
      return data.__raw_text;
    }
  }
  return "";
}
function createMcpHttpError(status, message, data) {
  const err = new Error(message || `HTTP ${status}`);
  err.status = Number(status || 0);
  err.data = data;
  return err;
}
async function postStreamableHTTP(service, method, params, options = {}) {
  const endpoint = String(service.baseURL || "").trim();
  const notification = !!options.notification;
  const payload = {
    jsonrpc: "2.0",
    method: String(method || "")
  };
  if (!notification) {
    payload.id = nextMcpRpcID();
  }
  if (typeof params !== "undefined") {
    payload.params = params;
  }
  const resp = await tracedFetch(
    endpoint,
    {
      method: "POST",
      headers: buildMCPHeaders(service, { sessionId: options.sessionId }),
      body: JSON.stringify(payload)
    },
    null,
    "MCP Streamable HTTP Call"
  );
  const data = await parseJSONOrSSEResponse(resp);
  const sessionId = readMcpSessionIDFromHeaders(resp.headers);
  if (!resp.ok) {
    const detail = extractMcpErrorMessage(data);
    throw createMcpHttpError(
      resp.status,
      detail || `Streamable HTTP ${resp.status} (${endpoint})`,
      data
    );
  }
  return { data, sessionId };
}
async function ensureStreamableHTTPSession(service) {
  const key = getMcpServiceCacheKey(service);
  if (mcpStreamableSessions[key] && mcpStreamableSessions[key].sessionId) {
    return mcpStreamableSessions[key];
  }
  const initParams = {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: {
      name: "smartpage-agent",
      version: "0.1.0"
    }
  };
  try {
    const initResp = await postStreamableHTTP(service, "initialize", initParams);
    const result = initResp?.data?.result && typeof initResp.data.result === "object" ? initResp.data.result : {};
    const sessionId = String(initResp?.sessionId || result?.sessionId || "").trim();
    const entry = {
      sessionId,
      protocolVersion: String(result?.protocolVersion || initParams.protocolVersion || ""),
      updatedAt: Date.now()
    };
    mcpStreamableSessions[key] = entry;
    // Best effort notification for servers that require initialized event.
    try {
      await postStreamableHTTP(service, "notifications/initialized", {}, {
        notification: true,
        sessionId: entry.sessionId
      });
    } catch (_err) {
    }
    return entry;
  } catch (_err) {
    // Some servers don't require initialize; ignore and let normal call continue.
    return null;
  }
}
function clearStreamableHTTPSession(service) {
  const key = getMcpServiceCacheKey(service);
  if (Object.prototype.hasOwnProperty.call(mcpStreamableSessions, key)) {
    delete mcpStreamableSessions[key];
  }
}
async function callStreamableHTTP(service, method, params) {
  const rpcMethod = String(method || "");
  const needsSession = rpcMethod !== "initialize" && rpcMethod !== "notifications/initialized";
  const endpoint = String(service.baseURL || "").trim();
  let sessionId = "";
  if (needsSession) {
    const entry = await ensureStreamableHTTPSession(service);
    sessionId = String(entry?.sessionId || "").trim();
  }
  const normalizedParams = rpcMethod === "tools/list" && params && typeof params === "object" && Object.keys(params).length === 0 ? void 0 : params;
  try {
    const first = await postStreamableHTTP(service, rpcMethod, normalizedParams, { sessionId });
    if (first.sessionId) {
      mcpStreamableSessions[getMcpServiceCacheKey(service)] = {
        sessionId: first.sessionId,
        protocolVersion: "2024-11-05",
        updatedAt: Date.now()
      };
    }
    const data = first.data;
    if (data && typeof data === "object" && data.error) {
      const msg = data?.error?.message || JSON.stringify(data.error);
      throw new Error(`Streamable HTTP RPC error: ${msg}`);
    }
    if (data && typeof data === "object" && Object.prototype.hasOwnProperty.call(data, "result")) {
      return data.result;
    }
    return data;
  } catch (err) {
    const status = Number(err?.status || 0);
    const retriable = status === 400 || status === 401 || status === 403 || status === 404;
    if (needsSession && retriable) {
      clearStreamableHTTPSession(service);
      const entry2 = await ensureStreamableHTTPSession(service);
      const retrySessionID = String(entry2?.sessionId || "").trim();
      try {
        const second = await postStreamableHTTP(service, rpcMethod, normalizedParams, { sessionId: retrySessionID });
        const data2 = second.data;
        if (data2 && typeof data2 === "object" && data2.error) {
          const msg2 = data2?.error?.message || JSON.stringify(data2.error);
          throw new Error(`Streamable HTTP RPC error: ${msg2}`);
        }
        if (data2 && typeof data2 === "object" && Object.prototype.hasOwnProperty.call(data2, "result")) {
          return data2.result;
        }
        return data2;
      } catch (err2) {
        const detail2 = extractMcpErrorMessage(err2?.data) || String(err2?.message || err2);
        throw new Error(`Streamable HTTP ${status || ""} (${endpoint}) ${detail2}`.trim());
      }
    }
    const detail = extractMcpErrorMessage(err?.data) || String(err?.message || err);
    throw new Error(`Streamable HTTP ${status || ""} (${endpoint}) ${detail}`.trim());
  }
}
async function parseJSONOrSSEResponse(resp) {
  const ctype = String(resp.headers.get("content-type") || "").toLowerCase();
  if (ctype.includes("application/json")) {
    return resp.json().catch(() => ({}));
  }
  const text = await resp.text().catch(() => "");
  if (!text) {
    return {};
  }
  if (ctype.includes("text/event-stream") || text.includes("data:")) {
    let lastObj = null;
    const lines = text.split(/\r?\n/);
    for (const line of lines) {
      const raw = line.trim();
      if (!raw.startsWith("data:")) continue;
      const payload = raw.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        lastObj = JSON.parse(payload);
      } catch (_err) {
      }
    }
    return lastObj || {};
  }
  try {
    return JSON.parse(text);
  } catch (_err) {
    return { __raw_text: text.slice(0, 800) };
  }
}
function joinURL(base, path2) {
  const b = String(base || "").replace(/\/+$/, "");
  const p = String(path2 || "").replace(/^\/+/, "");
  return `${b}/${p}`;
}
async function callChatCompletion({ apiKey, baseURL, model, thinkingLevel, timeoutMs, messages, tools, stream, hooks }) {
  ensureTaskActive(hooks);
  const body = {
    model,
    messages,
    tools,
    tool_choice: "auto",
    temperature: 0.1,
    stream: !!stream
  };
  const normalizedThinkingLevel = normalizeThinkingLevel(thinkingLevel);
  if (normalizedThinkingLevel !== "auto") {
    body.reasoning_effort = normalizedThinkingLevel;
  }
  const baseCandidates = buildOpenAIBaseURLCandidates(baseURL);
  const tried = [];
  let lastError = "";
  for (const candidate of baseCandidates) {
    ensureTaskActive(hooks);
    tried.push(candidate);
    try {
      const client = createOpenAIClient({
        apiKey,
        baseURL: candidate,
        hooks,
        timeoutMs
      });
      if (!stream) {
        return await client.chat.completions.create(body);
      }

      const streamResp = await client.chat.completions.create(body);
      let fullText = "";
      let fallbackAnswerFull = "";
      let fallbackReasoningFull = "";
      const toolCallMap = /* @__PURE__ */ new Map();

      for await (const chunk of streamResp) {
        ensureTaskActive(hooks);
        const deltaParts = extractDeltaPartsFromChatChunk(chunk);
        if (!deltaParts.answer || !deltaParts.reasoning) {
          const fallbackParts = extractFallbackDeltaPartsFromChatChunk(chunk);
          if (!deltaParts.answer && fallbackParts.answer) {
            const step = textIncrementFromFull(fallbackParts.answer, fallbackAnswerFull);
            fallbackAnswerFull = step.full;
            deltaParts.answer = step.delta;
          } else if (deltaParts.answer) {
            fallbackAnswerFull += deltaParts.answer;
          }
          if (!deltaParts.reasoning && fallbackParts.reasoning) {
            const step = textIncrementFromFull(fallbackParts.reasoning, fallbackReasoningFull);
            fallbackReasoningFull = step.full;
            deltaParts.reasoning = step.delta;
          } else if (deltaParts.reasoning) {
            fallbackReasoningFull += deltaParts.reasoning;
          }
        } else {
          fallbackAnswerFull += deltaParts.answer;
          fallbackReasoningFull += deltaParts.reasoning;
        }
        if (deltaParts.reasoning && typeof hooks?.onReasoning === "function") {
          hooks.onReasoning(deltaParts.reasoning);
        }
        if (deltaParts.answer) {
          fullText += deltaParts.answer;
          if (typeof hooks?.onDelta === "function") {
            hooks.onDelta(deltaParts.answer);
          }
        }

        const toolCallsDelta = chunk?.choices?.[0]?.delta?.tool_calls;
        if (Array.isArray(toolCallsDelta)) {
          for (const tc of toolCallsDelta) {
            const idx = Number.isInteger(tc?.index) ? tc.index : 0;
            const current = toolCallMap.get(idx) || {
              id: "",
              type: "function",
              function: { name: "", arguments: "" }
            };
            if (tc?.id) current.id = tc.id;
            if (tc?.type) current.type = tc.type;
            if (typeof tc?.function?.name === "string" && tc.function.name) {
              if (!current.function.name) {
                current.function.name = tc.function.name;
              } else if (!current.function.name.endsWith(tc.function.name)) {
                current.function.name += tc.function.name;
              }
            }
            if (typeof tc?.function?.arguments === "string") {
              current.function.arguments += tc.function.arguments;
            }
            toolCallMap.set(idx, current);
          }
        }
      }

      const toolCalls = Array.from(toolCallMap.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([idx, call]) => ({
          ...call,
          id: call.id || `toolcall_${idx}`
        }));
      if (!fullText && fallbackAnswerFull) {
        fullText = fallbackAnswerFull;
      }

      return {
        choices: [
          {
            message: {
              content: fullText,
              tool_calls: toolCalls
            }
          }
        ]
      };
    } catch (err) {
      if (hooks?.cancelSignal?.aborted || isTaskCancelledError(err)) {
        throw createTaskCancelledError(hooks?.cancelReason || hooks?.cancelSignal?.reason || "任务已停止");
      }
      lastError = formatOpenAIError(err);
      if (getErrorStatus(err) !== 404) {
        throw new Error(`${lastError} (${candidate})`);
      }
    }
  }
  throw new Error(`${lastError || "HTTP 404"} (tried baseURL: ${tried.join(" | ")})`);
}
function messageContentToText(content) {
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) {
    return content.map((item) => {
      if (typeof item === "string") return item;
      const partType = String(item?.type || "").toLowerCase();
      if (partType.includes("reasoning")) return "";
      if (typeof item?.text === "string") return item.text;
      return "";
    }).join("\n").trim();
  }
  return "";
}
function anyValueToText(value) {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value).trim();
  }
  if (Array.isArray(value)) {
    return value.map((item) => {
      if (!item) return "";
      if (typeof item === "string") return item;
      if (typeof item?.text === "string") return item.text;
      if (typeof item?.text?.value === "string") return item.text.value;
      if (typeof item?.delta === "string") return item.delta;
      if (typeof item?.value === "string") return item.value;
      if (typeof item?.content === "string") return item.content;
      if (typeof item?.content?.text === "string") return item.content.text;
      if (typeof item?.content?.value === "string") return item.content.value;
      return "";
    }).filter(Boolean).join("\n").trim();
  }
  if (typeof value === "object") {
    if (typeof value.text === "string") return value.text.trim();
    if (typeof value?.text?.value === "string") return value.text.value.trim();
    if (typeof value.delta === "string") return value.delta.trim();
    if (typeof value.value === "string") return value.value.trim();
    if (typeof value.content === "string") return value.content.trim();
    if (typeof value?.content?.text === "string") return value.content.text.trim();
    if (typeof value?.content?.value === "string") return value.content.value.trim();
    if (Array.isArray(value.content)) return anyValueToText(value.content);
  }
  return "";
}
function textIncrementFromFull(nextText, prevText) {
  const next = String(nextText || "");
  const prev = String(prevText || "");
  if (!next || next === prev) {
    return { full: prev, delta: "" };
  }
  if (prev && next.startsWith(prev)) {
    return { full: next, delta: next.slice(prev.length) };
  }
  return { full: next, delta: next };
}
function extractFallbackDeltaPartsFromChatChunk(event) {
  if (!event || typeof event !== "object") {
    return { answer: "", reasoning: "" };
  }
  const choice = event?.choices?.[0] || {};
  const message = choice?.message || {};
  const answerParts = [
    messageContentToText(message?.content),
    anyValueToText(choice?.text),
    anyValueToText(choice?.delta?.text),
    anyValueToText(event?.output_text)
  ].filter(Boolean);
  const reasoningParts = [
    extractReasoningFromContent(message?.content),
    anyValueToText(message?.reasoning),
    anyValueToText(message?.reasoning_content),
    anyValueToText(choice?.reasoning),
    anyValueToText(choice?.reasoning_content),
    anyValueToText(event?.reasoning),
    anyValueToText(event?.reasoning_content)
  ].filter(Boolean);
  return {
    answer: answerParts.join("\n").trim(),
    reasoning: reasoningParts.join("\n").trim()
  };
}
function extractReasoningFromContent(content) {
  if (!Array.isArray(content)) return "";
  return content.map((item) => {
    if (!item || typeof item !== "object") return "";
    const partType = String(item.type || "").toLowerCase();
    if (!partType.includes("reasoning")) return "";
    if (typeof item.text === "string") return item.text;
    if (typeof item.content === "string") return item.content;
    return "";
  }).filter(Boolean).join("\n").trim();
}
function extractReasoningFromCompletion(data) {
  const message = data?.choices?.[0]?.message || {};
  const parts = [
    extractReasoningFromContent(message?.content),
    anyValueToText(message?.reasoning),
    anyValueToText(message?.reasoning_content),
    anyValueToText(message?.reasoningContent)
  ].filter(Boolean);
  return parts.join("\n").trim();
}
function summarizeToolResult(result) {
  if (!result || typeof result !== "object") return String(result || "");
  if (result.error) return `error: ${result.error}`;
  if (typeof result.updated === "number") return `updated: ${result.updated}`;
  if (typeof result.removed === "number") return `removed: ${result.removed}`;
  if (typeof result.count === "number") return `count: ${result.count}`;
  if (typeof result.total === "number") return `total: ${result.total}`;
  if (typeof result.entries === "number") return `entries: ${result.entries}`;
  if (Object.prototype.hasOwnProperty.call(result, "value")) {
    const preview = anyValueToText(result.value).slice(0, 120);
    const note = typeof result.note === "string" && result.note.trim() ? `, ${result.note.trim()}` : "";
    return `value: ${preview || "null"}${note}`;
  }
  if (result.replaced) return "page replaced";
  return "ok";
}
function safeJSONString(value) {
  try {
    return JSON.stringify(value);
  } catch (_err) {
    return JSON.stringify({ ok: false, error: "serialize tool result failed" });
  }
}
async function requestModelText({ apiKey, model, thinkingLevel, baseURL, timeoutMs, systemPrompt, userPayload, stream, onDelta, onReasoning, hooks }) {
  ensureTaskActive(hooks);
  const body = {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: JSON.stringify(userPayload) }
    ],
    temperature: 0.1,
    stream: !!stream
  };
  const normalizedThinkingLevel = normalizeThinkingLevel(thinkingLevel);
  if (normalizedThinkingLevel !== "auto") {
    body.reasoning_effort = normalizedThinkingLevel;
  }
  const baseCandidates = buildOpenAIBaseURLCandidates(baseURL);
  const tried = [];
  let lastError = "";
  for (const candidate of baseCandidates) {
    ensureTaskActive(hooks);
    tried.push(candidate);
    try {
      const client = createOpenAIClient({
        apiKey,
        baseURL: candidate,
        hooks,
        timeoutMs
      });
      if (!stream) {
        const data = await client.chat.completions.create(body);
        const reasoning = extractReasoningFromCompletion(data);
        if (reasoning && typeof onReasoning === "function") {
          onReasoning(reasoning);
        }
        return extractResponseText(data);
      }
      const streamResp = await client.chat.completions.create(body);
      let full = "";
      let reasoningFull = "";
      let fallbackAnswerFull = "";
      let fallbackReasoningFull = "";
      for await (const chunk of streamResp) {
        ensureTaskActive(hooks);
        const deltaParts = extractDeltaPartsFromChatChunk(chunk);
        if (!deltaParts.answer || !deltaParts.reasoning) {
          const fallbackParts = extractFallbackDeltaPartsFromChatChunk(chunk);
          if (!deltaParts.answer && fallbackParts.answer) {
            const step = textIncrementFromFull(fallbackParts.answer, fallbackAnswerFull);
            fallbackAnswerFull = step.full;
            deltaParts.answer = step.delta;
          } else if (deltaParts.answer) {
            fallbackAnswerFull += deltaParts.answer;
          }
          if (!deltaParts.reasoning && fallbackParts.reasoning) {
            const step = textIncrementFromFull(fallbackParts.reasoning, fallbackReasoningFull);
            fallbackReasoningFull = step.full;
            deltaParts.reasoning = step.delta;
          } else if (deltaParts.reasoning) {
            fallbackReasoningFull += deltaParts.reasoning;
          }
        } else {
          fallbackAnswerFull += deltaParts.answer;
          fallbackReasoningFull += deltaParts.reasoning;
        }
        if (deltaParts.reasoning) {
          reasoningFull += deltaParts.reasoning;
          if (typeof onReasoning === "function") {
            onReasoning(deltaParts.reasoning);
          }
        }
        if (deltaParts.answer) {
          full += deltaParts.answer;
          if (typeof onDelta === "function") {
            onDelta(deltaParts.answer);
          }
        }
      }
      if (!full && fallbackAnswerFull) {
        full = fallbackAnswerFull;
      }
      const text = full.trim();
      if (text) {
        return text;
      }
      const fallbackData = await client.chat.completions.create({
        ...body,
        stream: false
      });
      const fallbackReasoning = extractReasoningFromCompletion(fallbackData);
      if (fallbackReasoning && !reasoningFull.trim() && typeof onReasoning === "function") {
        onReasoning(fallbackReasoning);
      }
      return extractResponseText(fallbackData);
    } catch (err) {
      if (hooks?.cancelSignal?.aborted || isTaskCancelledError(err)) {
        throw createTaskCancelledError(hooks?.cancelReason || hooks?.cancelSignal?.reason || "任务已停止");
      }
      lastError = formatOpenAIError(err);
      if (getErrorStatus(err) !== 404) {
        throw new Error(`${lastError} (${candidate})`);
      }
    }
  }
  throw new Error(`${lastError || "HTTP 404"} (tried baseURL: ${tried.join(" | ")})`);
}
function extractDeltaPartsFromChatChunk(event) {
  if (!event || typeof event !== "object") {
    return { answer: "", reasoning: "" };
  }
  const delta = event?.choices?.[0]?.delta || {};
  let answer = "";
  let reasoning = "";
  const content = delta?.content;
  if (typeof content === "string") {
    answer = content;
  } else if (content && typeof content === "object") {
    answer = anyValueToText(content);
  } else if (Array.isArray(content)) {
    for (const item of content) {
      if (!item || typeof item !== "object") continue;
      const partType = String(item.type || "").toLowerCase();
      const text = anyValueToText(item);
      if (!text) continue;
      if (partType.includes("reasoning")) {
        reasoning += text;
      } else {
        answer += text;
      }
    }
  }
  if (!answer) {
    answer = anyValueToText(delta?.text);
  }
  const extraReasoning = [
    anyValueToText(delta?.reasoning),
    anyValueToText(delta?.reasoning_content),
    anyValueToText(delta?.reasoningContent)
  ].filter(Boolean).join("\n");
  if (extraReasoning) {
    reasoning += reasoning ? `\n${extraReasoning}` : extraReasoning;
  }
  return { answer, reasoning };
}
function extractResponseText(data) {
  const chatContent = data?.choices?.[0]?.message?.content;
  if (typeof chatContent === "string" && chatContent.trim()) return chatContent.trim();
  if (Array.isArray(chatContent)) {
    const parts = chatContent.map((item) => typeof item?.text === "string" ? item.text : "").filter(Boolean);
    if (parts.length) return parts.join("\n").trim();
  }
  throw new Error("\u6A21\u578B\u672A\u8FD4\u56DE\u53EF\u89E3\u6790\u6587\u672C");
}
