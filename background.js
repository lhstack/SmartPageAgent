import OpenAI from "openai";

var SETTINGS_KEY = "web_agent_settings_v1";
var TASK_STATE_KEY = "web_agent_last_task_v1";
var AGENT_MEMORY_KEY = "web_agent_memory_v1";
var AGENT_TOOL_STORAGE_KEY = "web_agent_tool_storage_v1";
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
    const result = await runAgent(task.prompt, settings, hooks);
    task.endedAt = Date.now();
    if (result?.ok) {
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
    task.status = "error";
    task.error = String(err || "\u6267\u884C\u5931\u8D25");
    broadcastTask(task, { type: "error", error: task.error });
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
      onDebug: ENABLE_TRACE_LOGS ? (text) => broadcastTask(task2, { type: "debug", text }) : void 0
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
function createOpenAIClient({ apiKey, baseURL, hooks, timeoutMs }) {
  const requestFetch = async (url, init = {}) => {
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
    const resp = await fetchWithTimeout(url, init, timeoutMs);
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
function normalizeMcpService(item = {}) {
  return {
    id: String(item.id || createMcpServiceId()),
    name: String(item.name || "").trim(),
    enabled: item.enabled !== false,
    transport: normalizeMcpTransport(item.transport),
    baseURL: String(item.baseURL || "").trim().replace(/\/+$/, ""),
    apiKey: String(item.apiKey || "").trim(),
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
  if (tab.url?.startsWith("chrome://") || tab.url?.startsWith("edge://")) {
    return { ok: false, error: "\u6D4F\u89C8\u5668\u5185\u90E8\u9875\u9762\u4E0D\u652F\u6301\u6CE8\u5165\u811A\u672C" };
  }
  let streamedAssistant = "";
  const agentHooks = {
    ...hooks,
    onDelta: (delta) => {
      const text = String(delta || "");
      if (text) {
        streamedAssistant += text;
      }
      hooks.onDelta?.(delta);
    }
  };
  let result;
  if (isWholePageTranslateRequest(cleanPrompt)) {
    result = await runWholePageTranslate(cleanPrompt, tab.id, settings, agentHooks);
  } else {
    result = await runFunctionCallingAgent(cleanPrompt, tab.id, settings, agentHooks);
  }
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
  hooks.onStatus?.("\u8BFB\u53D6\u6574\u9875 HTML...");
  const originalHTML = await getWholePageHTML(tabId);
  if (!originalHTML || originalHTML.length < 200) {
    return { ok: false, error: "\u9875\u9762\u5185\u5BB9\u8FC7\u5C11\uFF0C\u65E0\u6CD5\u6267\u884C\u6574\u9875\u7FFB\u8BD1" };
  }
  hooks.onStatus?.("\u6A21\u578B\u7FFB\u8BD1\u4E2D...");
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
  const replaceRes = await replaceWholePageHTML(tabId, translatedHTML);
  return {
    ok: true,
    message: `\u6574\u9875\u7FFB\u8BD1\u5B8C\u6210\uFF0C\u5DF2\u66FF\u6362\u9875\u9762 HTML\u3002\u5F53\u524D\u6807\u9898\uFF1A${replaceRes?.title || "(unknown)"}`
  };
}
async function runFunctionCallingAgent(prompt, tabId, settings, hooks) {
  hooks.onStatus?.("\u52A0\u8F7D\u9875\u9762\u5FEB\u7167...");
  const snapshot = await collectPageSnapshot(tabId);
  const memoryEntries = await getConversationMemory(tabId);
  return runFunctionCallingAgentLegacy(prompt, tabId, settings, hooks, snapshot, memoryEntries);
}
async function runFunctionCallingAgentLegacy(prompt, tabId, settings, hooks, snapshot, memoryEntries) {
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
      content: buildAgentSystemPrompt(settings.allowScript, !!mcpRegistry.toolSpecs?.length)
    },
    ...buildMemoryMessages(memoryEntries),
    {
      role: "user",
      content: JSON.stringify({
        request: prompt,
        page: {
          title: snapshot.title,
          url: snapshot.url,
          selectedText: snapshot.selectedText,
          previewNodes: snapshot.nodes?.slice(0, 40) || []
        }
      })
    }
  ];
  const maxTurns = normalizeToolTurnLimit(settings.toolTurnLimit);
  for (let turn = 1; ; turn += 1) {
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
      const toolResult = await executeToolCall(call, {
        tabId,
        settings,
        mcpRegistry,
        hooks
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
    const headers = {};
    if (service.apiKey) {
      headers.Authorization = `Bearer ${service.apiKey}`;
    }
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
  const baseCandidates = buildOpenAIBaseURLCandidates(baseURL);
  const tried = [];
  let lastError = "";
  for (const candidate of baseCandidates) {
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
      lastError = formatOpenAIError(err);
      if (getErrorStatus(err) !== 404) {
        throw new Error(`${lastError} (${candidate})`);
      }
    }
  }
  throw new Error(`${lastError || "HTTP 404"} (tried baseURL: ${tried.join(" | ")})`);
}
async function runFunctionCallingAgentWithResponsesMCP(prompt, tabId, settings, hooks, snapshot, memoryEntries, sdkMcpTools) {
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
          hooks
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
function buildAgentSystemPrompt(allowScript, hasMCP) {
  return [
    "\u4F60\u662F\u7F51\u9875\u81EA\u52A8\u5316\u4EE3\u7406\uFF0C\u5FC5\u987B\u4F18\u5148\u901A\u8FC7 tools \u89C2\u5BDF\u5E76\u64CD\u4F5C\u9875\u9762\u3002",
    "\u89C4\u5219\uFF1A",
    "1. \u5148\u89C2\u5BDF\u518D\u4FEE\u6539\uFF0C\u4E0D\u8981\u76F2\u6539\u3002",
    "2. \u5C40\u90E8\u4FEE\u6539\u4F18\u5148\u4F7F\u7528 query/extract/set/remove \u5DE5\u5177\u3002",
    "3. \u6574\u9875\u7FFB\u8BD1\u8BF7\u4F7F\u7528 translate_whole_page_to_zh\u3002",
    "3.5 \u9700\u8981\u8DE8\u8F6E\u6B21\u4FDD\u5B58\u6570\u636E\u65F6\u53EF\u7528 set_storage/get_storage\u3002",
    "3.6 \u9700\u8981\u6293\u5305\u8C03\u8BD5\u65F6\u4F7F\u7528 start_network_capture/get_network_capture/stop_network_capture\u3002",
    allowScript ? "4. execute_script/append_script \u53EF\u7528\uFF0C\u4F46\u4EC5\u5728\u5FC5\u8981\u65F6\u4F7F\u7528\u3002" : "4. execute_script/append_script \u7981\u7528\uFF0C\u4E0D\u8981\u8C03\u7528\u3002",
    hasMCP ? "5. \u5141\u8BB8\u8C03\u7528 MCP \u5DE5\u5177\u8865\u5145\u80FD\u529B\u3002" : "5. \u5F53\u524D\u65E0 MCP \u5DE5\u5177\u3002",
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
    defineTool("start_network_capture", "Start intercepting fetch/xhr request and response data on current page", {
      type: "object",
      properties: {
        urlIncludes: { type: "string", description: "Only capture requests whose URL includes this substring" },
        includeBodies: { type: "boolean", description: "Capture request/response body text, default true" },
        bodyMaxLength: { type: "integer", minimum: 128, maximum: 5e4, description: "Max captured body text length" },
        maxEntries: { type: "integer", minimum: 20, maximum: 2e3, description: "Max log entries kept in page memory" },
        clearOnStart: { type: "boolean", description: "Clear old logs when starting" },
        requestTransformCode: {
          type: "string",
          description: "Optional JS body: return transformed request view. Signature: (ctx, params) => any"
        },
        responseTransformCode: {
          type: "string",
          description: "Optional JS body: return transformed response view. Signature: (ctx, params) => any"
        },
        requestRewriteCode: {
          type: "string",
          description: "Optional JS body for fetch rewrite. Return {url, method, headers, body}. Signature: (ctx, params) => object"
        },
        transformParams: { type: "object", description: "Optional params for transform/rewrite code" }
      },
      additionalProperties: false
    }),
    defineTool("get_network_capture", "Get intercepted network logs from current page", {
      type: "object",
      properties: {
        limit: { type: "integer", minimum: 1, maximum: 2e3, description: "Return last N entries, default 100" },
        clear: { type: "boolean", description: "Clear logs after reading" }
      },
      additionalProperties: false
    }),
    defineTool("stop_network_capture", "Stop intercepting network requests on current page", {
      type: "object",
      properties: {
        clear: { type: "boolean", description: "Also clear logs when stopping" }
      },
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
  const name = call?.function?.name || "";
  const args = parseToolArgs(call?.function?.arguments || "{}");
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
    case "start_network_capture":
      return startNetworkCapture(ctx.tabId, args);
    case "get_network_capture":
      return getNetworkCapture(ctx.tabId, args);
    case "stop_network_capture":
      return stopNetworkCapture(ctx.tabId, args);
    case "set_storage":
      return setToolStorage(args);
    case "get_storage":
      return getToolStorage(args);
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
async function startNetworkCapture(tabId, args) {
  const config = {
    urlIncludes: String(args?.urlIncludes || "").trim(),
    includeBodies: args?.includeBodies !== false,
    bodyMaxLength: Math.min(5e4, Math.max(128, Number(args?.bodyMaxLength || 4e3))),
    maxEntries: Math.min(2e3, Math.max(20, Number(args?.maxEntries || 300))),
    clearOnStart: !!args?.clearOnStart,
    requestTransformCode: String(args?.requestTransformCode || ""),
    responseTransformCode: String(args?.responseTransformCode || ""),
    requestRewriteCode: String(args?.requestRewriteCode || ""),
    transformParams: args?.transformParams && typeof args.transformParams === "object" ? args.transformParams : {}
  };
  try {
    const result = await chrome.scripting.executeScript({
    target: { tabId },
    world: "MAIN",
    args: [config],
    func: (cfg) => {
      const KEY = "__SMARTPAGE_NET_CAPTURE__";
      const now = () => Date.now();
      const toText = (value) => {
        if (typeof value === "string") return value;
        if (value == null) return "";
        try {
          return JSON.stringify(value);
        } catch (_err) {
          return String(value);
        }
      };
      const truncate = (text, maxLen) => {
        const raw = String(text || "");
        if (raw.length <= maxLen) return raw;
        return `${raw.slice(0, maxLen)} ...(truncated ${raw.length - maxLen} chars)`;
      };
      const sanitize = (value, depth = 0) => {
        if (value == null) return value;
        const t = typeof value;
        if (t === "string" || t === "number" || t === "boolean") return value;
        if (t === "bigint") return `${value.toString()}n`;
        if (t === "symbol") return String(value);
        if (t === "function") return `[Function ${value.name || "anonymous"}]`;
        if (depth >= 3) return "[Object]";
        if (Array.isArray(value)) return value.slice(0, 30).map((x) => sanitize(x, depth + 1));
        if (t === "object") {
          const out = {};
          let i = 0;
          for (const k of Object.keys(value)) {
            out[k] = sanitize(value[k], depth + 1);
            i += 1;
            if (i >= 60) break;
          }
          return out;
        }
        return String(value);
      };
      const normalizeConfig = (input) => ({
        urlIncludes: String(input?.urlIncludes || "").trim(),
        includeBodies: input?.includeBodies !== false,
        bodyMaxLength: Math.min(5e4, Math.max(128, Number(input?.bodyMaxLength || 4e3))),
        maxEntries: Math.min(2e3, Math.max(20, Number(input?.maxEntries || 300))),
        requestTransformCode: String(input?.requestTransformCode || ""),
        responseTransformCode: String(input?.responseTransformCode || ""),
        requestRewriteCode: String(input?.requestRewriteCode || ""),
        transformParams: input?.transformParams && typeof input.transformParams === "object" ? input.transformParams : {}
      });
      const compileTransform = (code) => {
        const body = String(code || "").trim();
        if (!body) return null;
        try {
          return new Function("ctx", "params", `"use strict";\n${body}`);
        } catch (_err) {
          try {
            return new Function("ctx", "params", `"use strict"; return (${body})(ctx, params);`);
          } catch (err2) {
            return { __error: String(err2) };
          }
        }
      };
      const toHeaders = (headers) => {
        const out = {};
        if (!headers) return out;
        try {
          if (typeof headers.forEach === "function") {
            headers.forEach((v, k) => {
              out[String(k)] = String(v);
            });
            return out;
          }
        } catch (_err) {
        }
        try {
          for (const [k, v] of Object.entries(headers)) {
            out[String(k)] = String(v);
          }
        } catch (_err) {
        }
        return out;
      };
      const state = window[KEY] || {
        installed: false,
        seq: 0,
        logs: [],
        cfg: normalizeConfig(cfg),
        requestTransformFn: null,
        responseTransformFn: null,
        requestRewriteFn: null,
        originalFetch: null,
        OriginalXHR: null
      };
      state.cfg = normalizeConfig(cfg);
      state.requestTransformFn = compileTransform(state.cfg.requestTransformCode);
      state.responseTransformFn = compileTransform(state.cfg.responseTransformCode);
      state.requestRewriteFn = compileTransform(state.cfg.requestRewriteCode);
      if (cfg?.clearOnStart) {
        state.logs = [];
      }
      const runTransform = (fn, ctx) => {
        if (!fn) return void 0;
        if (fn && typeof fn === "object" && fn.__error) {
          return { __transformError: String(fn.__error) };
        }
        try {
          return sanitize(fn(ctx, state.cfg.transformParams || {}));
        } catch (err) {
          return { __transformError: String(err) };
        }
      };
      const pushLog = (entry) => {
        const item = sanitize(entry);
        state.logs.push(item);
        if (state.logs.length > state.cfg.maxEntries) {
          state.logs.splice(0, state.logs.length - state.cfg.maxEntries);
        }
      };
      const shouldCapture = (url) => {
        if (!state.cfg.urlIncludes) return true;
        return String(url || "").includes(state.cfg.urlIncludes);
      };
      if (!state.installed) {
        state.originalFetch = window.fetch.bind(window);
        const origFetch = state.originalFetch;
        window.fetch = async (...fetchArgs) => {
          const id = ++state.seq;
          const startedAt = now();
          let input = fetchArgs[0];
          let init = fetchArgs[1];
          const req0 = input instanceof Request ? input : null;
          let url = req0 ? req0.url : String(input || "");
          let method = String(init?.method || req0?.method || "GET").toUpperCase();
          let headers = {
            ...toHeaders(req0?.headers),
            ...toHeaders(init?.headers)
          };
          let requestBody = "";
          if (state.cfg.includeBodies) {
            try {
              if (typeof init?.body === "string") {
                requestBody = init.body;
              } else if (init?.body != null) {
                requestBody = toText(init.body);
              } else if (req0) {
                const clonedReq = req0.clone();
                requestBody = await clonedReq.text();
              }
            } catch (_err) {
              requestBody = "[unreadable request body]";
            }
            requestBody = truncate(requestBody, state.cfg.bodyMaxLength);
          }
          const reqCtx = {
            type: "fetch_request",
            id,
            url,
            method,
            headers: sanitize(headers),
            body: requestBody
          };
          const rewritten = runTransform(state.requestRewriteFn, reqCtx);
          if (rewritten && typeof rewritten === "object" && !rewritten.__transformError) {
            if (typeof rewritten.url === "string" && rewritten.url) url = rewritten.url;
            if (typeof rewritten.method === "string" && rewritten.method) method = rewritten.method.toUpperCase();
            if (rewritten.headers && typeof rewritten.headers === "object") headers = toHeaders(rewritten.headers);
            if (Object.prototype.hasOwnProperty.call(rewritten, "body")) requestBody = toText(rewritten.body);
            init = {
              ...(init || {}),
              method,
              headers,
              body: Object.prototype.hasOwnProperty.call(rewritten, "body") ? rewritten.body : init?.body
            };
            input = url;
          }
          try {
            const resp = await origFetch(input, init);
            if (shouldCapture(url)) {
              let responseBody = "";
              if (state.cfg.includeBodies) {
                try {
                  responseBody = truncate(await resp.clone().text(), state.cfg.bodyMaxLength);
                } catch (_err) {
                  responseBody = "[unreadable response body]";
                }
              }
              const responseHeaders = toHeaders(resp.headers);
              const entry = {
                id,
                type: "fetch",
                ts: startedAt,
                durationMs: now() - startedAt,
                request: {
                  url,
                  method,
                  headers: sanitize(headers),
                  body: requestBody
                },
                response: {
                  status: Number(resp.status || 0),
                  ok: !!resp.ok,
                  headers: sanitize(responseHeaders),
                  body: responseBody
                }
              };
              const reqView = runTransform(state.requestTransformFn, entry.request);
              const respView = runTransform(state.responseTransformFn, entry.response);
              if (typeof reqView !== "undefined") entry.requestView = reqView;
              if (typeof respView !== "undefined") entry.responseView = respView;
              pushLog(entry);
            }
            return resp;
          } catch (err) {
            if (shouldCapture(url)) {
              pushLog({
                id,
                type: "fetch_error",
                ts: startedAt,
                durationMs: now() - startedAt,
                request: {
                  url,
                  method,
                  headers: sanitize(headers),
                  body: requestBody
                },
                error: String(err)
              });
            }
            throw err;
          }
        };
        const OriginalXHR = window.XMLHttpRequest;
        state.OriginalXHR = OriginalXHR;
        const WrappedXHR = function() {
          const xhr = new OriginalXHR();
          const id = ++state.seq;
          const req = {
            id,
            type: "xhr",
            ts: now(),
            method: "GET",
            url: "",
            headers: {},
            body: ""
          };
          const open = xhr.open;
          xhr.open = function(method, url, ...rest) {
            req.method = String(method || "GET").toUpperCase();
            req.url = String(url || "");
            return open.call(xhr, method, url, ...rest);
          };
          const setHeader = xhr.setRequestHeader;
          xhr.setRequestHeader = function(name, value) {
            req.headers[String(name)] = String(value);
            return setHeader.call(xhr, name, value);
          };
          const send = xhr.send;
          xhr.send = function(body) {
            req.ts = now();
            if (state.cfg.includeBodies) {
              req.body = truncate(toText(body), state.cfg.bodyMaxLength);
            }
            xhr.addEventListener("loadend", () => {
              if (!shouldCapture(req.url)) return;
              let responseBody = "";
              if (state.cfg.includeBodies) {
                try {
                  responseBody = truncate(String(xhr.responseText || ""), state.cfg.bodyMaxLength);
                } catch (_err) {
                  responseBody = "[unreadable xhr response body]";
                }
              }
              const response = {
                status: Number(xhr.status || 0),
                ok: Number(xhr.status || 0) >= 200 && Number(xhr.status || 0) < 400,
                body: responseBody
              };
              const entry = {
                id,
                type: "xhr",
                ts: req.ts,
                durationMs: now() - req.ts,
                request: {
                  url: req.url,
                  method: req.method,
                  headers: sanitize(req.headers),
                  body: req.body
                },
                response
              };
              const reqView = runTransform(state.requestTransformFn, entry.request);
              const respView = runTransform(state.responseTransformFn, entry.response);
              if (typeof reqView !== "undefined") entry.requestView = reqView;
              if (typeof respView !== "undefined") entry.responseView = respView;
              pushLog(entry);
            }, { once: true });
            return send.call(xhr, body);
          };
          return xhr;
        };
        WrappedXHR.UNSENT = OriginalXHR.UNSENT;
        WrappedXHR.OPENED = OriginalXHR.OPENED;
        WrappedXHR.HEADERS_RECEIVED = OriginalXHR.HEADERS_RECEIVED;
        WrappedXHR.LOADING = OriginalXHR.LOADING;
        WrappedXHR.DONE = OriginalXHR.DONE;
        WrappedXHR.prototype = OriginalXHR.prototype;
        window.XMLHttpRequest = WrappedXHR;
        state.installed = true;
      }
      window[KEY] = state;
      return {
        ok: true,
        installed: !!state.installed,
        config: {
          urlIncludes: state.cfg.urlIncludes,
          includeBodies: state.cfg.includeBodies,
          bodyMaxLength: state.cfg.bodyMaxLength,
          maxEntries: state.cfg.maxEntries
        },
        entries: Number(state.logs.length || 0)
      };
    }
    });
    return result?.[0]?.result || { ok: false, error: "no result" };
  } catch (err) {
    return { ok: false, error: `start_network_capture failed: ${String(err)}` };
  }
}
async function getNetworkCapture(tabId, args) {
  const limit2 = Math.min(2e3, Math.max(1, Number(args?.limit || 100)));
  const clear = !!args?.clear;
  try {
    const result = await chrome.scripting.executeScript({
    target: { tabId },
    world: "MAIN",
    args: [limit2, clear],
    func: (limit3, clear2) => {
      const KEY = "__SMARTPAGE_NET_CAPTURE__";
      const state = window[KEY];
      if (!state) {
        return { ok: true, running: false, total: 0, items: [] };
      }
      const total = Number(state.logs?.length || 0);
      const items = Array.isArray(state.logs) ? state.logs.slice(Math.max(0, total - limit3)) : [];
      if (clear2) {
        state.logs = [];
      }
      return { ok: true, running: !!state.installed, total, items };
    }
    });
    return result?.[0]?.result || { ok: false, error: "no result" };
  } catch (err) {
    return { ok: false, error: `get_network_capture failed: ${String(err)}` };
  }
}
async function stopNetworkCapture(tabId, args) {
  const clear = !!args?.clear;
  try {
    const result = await chrome.scripting.executeScript({
    target: { tabId },
    world: "MAIN",
    args: [clear],
    func: (clear2) => {
      const KEY = "__SMARTPAGE_NET_CAPTURE__";
      const state = window[KEY];
      if (!state) {
        return { ok: true, stopped: true, hadState: false };
      }
      try {
        if (state.originalFetch) {
          window.fetch = state.originalFetch;
        }
        if (state.OriginalXHR) {
          window.XMLHttpRequest = state.OriginalXHR;
        }
      } catch (_err) {
      }
      state.installed = false;
      if (clear2) {
        state.logs = [];
      }
      return {
        ok: true,
        stopped: true,
        hadState: true,
        entries: Number(state.logs?.length || 0)
      };
    }
    });
    return result?.[0]?.result || { ok: false, error: "no result" };
  } catch (err) {
    return { ok: false, error: `stop_network_capture failed: ${String(err)}` };
  }
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
    Accept: "text/event-stream, application/json"
  };
  if (service.apiKey) headers.Authorization = `Bearer ${service.apiKey}`;
  if (extra.sessionId) headers["MCP-Session-Id"] = String(extra.sessionId);
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
    Accept: "application/json, text/event-stream"
  };
  if (service.apiKey) headers.Authorization = `Bearer ${service.apiKey}`;
  if (extra.sessionId) {
    headers["MCP-Session-Id"] = String(extra.sessionId);
  }
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
