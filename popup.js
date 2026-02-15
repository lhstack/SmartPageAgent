const apiKeyInput = document.getElementById("apiKeyInput");
const modelInput = document.getElementById("modelInput");
const modelList = document.getElementById("modelList");
const baseUrlInput = document.getElementById("baseUrlInput");
const allowScriptInput = document.getElementById("allowScriptInput");
const requestTimeoutSecInput = document.getElementById("requestTimeoutSecInput");
const toolTurnLimitInput = document.getElementById("toolTurnLimitInput");
const unlimitedTurnsInput = document.getElementById("unlimitedTurnsInput");
const thinkingLevelInput = document.getElementById("thinkingLevelInput");
const saveStatus = document.getElementById("saveStatus");
const addMcpServiceBtn = document.getElementById("addMcpServiceBtn");
const mcpServicesList = document.getElementById("mcpServicesList");

const openSettingsBtn = document.getElementById("openSettingsBtn");
const closeSettingsBtn = document.getElementById("closeSettingsBtn");
const settingsModal = document.getElementById("settingsModal");

const promptInput = document.getElementById("promptInput");
const runBtn = document.getElementById("runBtn");
const clearBtn = document.getElementById("clearBtn");
const chatLogNode = document.getElementById("chatLog");
const runState = document.getElementById("runState");
const quickModelInput = document.getElementById("quickModelInput");

const UI_CACHE_KEY = "web_agent_ui_cache_v1";
const MAX_CHAT_HISTORY = 120;
const MAX_MODEL_CACHE = 300;
const MODEL_LIST_TTL_MS = 30 * 1000;
const DEFAULT_REQUEST_TIMEOUT_SEC = 120;
const DEFAULT_TOOL_TURN_LIMIT = 0;
const DEFAULT_THINKING_LEVEL = "auto";
const MAX_PROMPT_DRAFT_CHARS = 12000;

const state = {
  running: false,
  stopping: false,
  saveTimer: null,
  uiSaveTimer: null,
  modelFetchInFlight: false,
  models: [],
  modelsUpdatedAt: 0,
  streamingNode: null,
  streamBuffer: "",
  streamFlushTimer: null,
  reasoningNode: null,
  reasoningContentNode: null,
  reasoningToggleNode: null,
  reasoningCollapsed: false,
  mcpServices: [],
  currentTaskId: "",
  streamPort: null,
};

async function callBackground(type, payload = {}) {
  return chrome.runtime.sendMessage({ type, payload });
}

function scrollChatToBottom() {
  chatLogNode.scrollTop = chatLogNode.scrollHeight;
}

function createBubble(text, kind = "assistant") {
  if (String(kind || "").includes("reasoning")) {
    return createReasoningBubble(text, kind, { bindState: false, collapsed: true });
  }
  const node = document.createElement("div");
  node.className = `bubble ${kind}`.trim();
  node.textContent = text || "";
  return node;
}

function updateReasoningToggleText(collapsed) {
  if (!state.reasoningToggleNode) return;
  state.reasoningToggleNode.textContent = collapsed ? "推理内容（展开）" : "推理内容（收起）";
  state.reasoningToggleNode.setAttribute("aria-expanded", collapsed ? "false" : "true");
}

function setReasoningCollapsed(collapsed) {
  const next = !!collapsed;
  state.reasoningCollapsed = next;
  if (state.reasoningNode) {
    state.reasoningNode.classList.toggle("collapsed", next);
  }
  updateReasoningToggleText(next);
}

function createReasoningBubble(text = "", kind = "reasoning", options = {}) {
  const bindState = !!options.bindState;
  const initialCollapsed = typeof options.collapsed === "boolean" ? options.collapsed : true;
  const node = document.createElement("div");
  node.className = `bubble ${kind} reasoning-panel`.trim();
  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "reasoning-toggle";
  const content = document.createElement("div");
  content.className = "reasoning-content";
  content.textContent = text || "";
  node.appendChild(toggle);
  node.appendChild(content);
  let collapsed = bindState ? state.reasoningCollapsed : initialCollapsed;
  const applyLocalCollapsed = (value) => {
    collapsed = !!value;
    node.classList.toggle("collapsed", collapsed);
    toggle.textContent = collapsed ? "推理内容（展开）" : "推理内容（收起）";
    toggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
  };
  toggle.addEventListener("click", () => {
    if (bindState) {
      setReasoningCollapsed(!state.reasoningCollapsed);
    } else {
      applyLocalCollapsed(!collapsed);
    }
    scheduleUICacheSave();
  });
  applyLocalCollapsed(collapsed);
  if (bindState) {
    state.reasoningNode = node;
    state.reasoningContentNode = content;
    state.reasoningToggleNode = toggle;
    setReasoningCollapsed(state.reasoningCollapsed);
  }
  return node;
}

function ensureReasoningNode() {
  if (
    state.reasoningNode &&
    state.reasoningContentNode &&
    state.reasoningToggleNode &&
    state.reasoningNode.isConnected &&
    state.reasoningContentNode.isConnected &&
    state.reasoningToggleNode.isConnected
  ) {
    return state.reasoningNode;
  }
  state.reasoningNode = null;
  state.reasoningContentNode = null;
  state.reasoningToggleNode = null;
  const existedList = Array.from(chatLogNode.querySelectorAll(".bubble.reasoning.streaming.reasoning-panel"));
  const existed = existedList.length ? existedList[existedList.length - 1] : null;
  if (existed) {
    const content = existed.querySelector(".reasoning-content");
    const toggle = existed.querySelector(".reasoning-toggle");
    if (content && toggle) {
      const text = String(content.textContent || "");
      const collapsed = existed.classList.contains("collapsed");
      state.reasoningCollapsed = collapsed;
      existed.remove();
      const node = createReasoningBubble(text, "reasoning streaming", { bindState: true, collapsed });
      chatLogNode.appendChild(node);
      return node;
    }
  }
  const node = createReasoningBubble("", "reasoning streaming", { bindState: true, collapsed: state.reasoningCollapsed });
  chatLogNode.appendChild(node);
  return node;
}

function appendBubble(text, kind = "assistant", options = {}) {
  const node = createBubble(text, kind);
  chatLogNode.appendChild(node);
  scrollChatToBottom();
  if (options.persist !== false) {
    scheduleUICacheSave();
  }
  return node;
}

function setSaveStatus(text, isErr = false) {
  saveStatus.textContent = text;
  saveStatus.style.color = isErr ? "#9b2f2f" : "#5f7997";
}
function normalizeThinkingLevel(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (raw === "low" || raw === "medium" || raw === "high" || raw === "xhigh") {
    return raw;
  }
  return DEFAULT_THINKING_LEVEL;
}
function normalizeRequestTimeoutSec(value) {
  const raw = Number(value);
  if (!Number.isFinite(raw)) {
    return DEFAULT_REQUEST_TIMEOUT_SEC;
  }
  return Math.min(600, Math.max(5, Math.floor(raw)));
}
function normalizeToolTurnLimit(value) {
  const raw = Number(value);
  if (!Number.isFinite(raw)) {
    return DEFAULT_TOOL_TURN_LIMIT;
  }
  return Math.max(0, Math.floor(raw));
}
function syncToolTurnLimitUI(value) {
  const normalized = normalizeToolTurnLimit(value);
  const unlimited = normalized === 0;
  if (unlimitedTurnsInput) {
    unlimitedTurnsInput.checked = unlimited;
  }
  if (toolTurnLimitInput) {
    toolTurnLimitInput.disabled = unlimited;
    toolTurnLimitInput.value = String(normalized);
  }
}

function setRunning(on, text = "") {
  state.running = on;
  if (!on) {
    state.stopping = false;
  }
  runBtn.disabled = false;
  promptInput.disabled = on;
  thinkingLevelInput.disabled = on;
  document.querySelectorAll(".quick-btn").forEach((btn) => {
    btn.disabled = on;
  });
  if (on) {
    runState.textContent = text;
  } else {
    runState.textContent = "";
  }
  renderRunButton();
  updateModelAvailability();
}
function renderRunButton() {
  runBtn.classList.toggle("stop", state.running);
  if (state.running) {
    runBtn.textContent = state.stopping ? "…" : "■";
    runBtn.title = state.stopping ? "停止中" : "停止";
    runBtn.disabled = !!state.stopping;
  } else {
    runBtn.textContent = "➤";
    runBtn.title = "发送";
    runBtn.disabled = false;
  }
}

function resetStreamingNode() {
  if (state.streamFlushTimer) {
    clearTimeout(state.streamFlushTimer);
    state.streamFlushTimer = null;
  }
  state.streamBuffer = "";
  state.streamingNode = null;
  state.reasoningNode = null;
  state.reasoningContentNode = null;
  state.reasoningToggleNode = null;
}

function flushStreamBuffer(force = false) {
  if (!state.streamingNode) {
    state.streamBuffer = "";
    if (state.streamFlushTimer) {
      clearTimeout(state.streamFlushTimer);
      state.streamFlushTimer = null;
    }
    return;
  }
  if (!state.streamBuffer) {
    state.streamFlushTimer = null;
    return;
  }
  const size = force ? state.streamBuffer.length : 18;
  const piece = state.streamBuffer.slice(0, size);
  state.streamBuffer = state.streamBuffer.slice(size);
  state.streamingNode.textContent += piece;
  scrollChatToBottom();
  scheduleUICacheSave();
  if (state.streamBuffer) {
    state.streamFlushTimer = setTimeout(() => {
      state.streamFlushTimer = null;
      flushStreamBuffer(false);
    }, 16);
  } else {
    state.streamFlushTimer = null;
  }
}

function appendStream(delta) {
  if (!delta) {
    return;
  }
  const text = String(delta || "");
  if (!text.trim() && !state.streamingNode?.textContent?.trim()) {
    return;
  }
  if (!state.streamingNode) {
    state.streamingNode = createBubble("", "assistant streaming");
    chatLogNode.appendChild(state.streamingNode);
  }
  state.streamBuffer += text;
  if (!state.streamFlushTimer) {
    flushStreamBuffer(false);
  }
}

function appendReasoningStream(delta) {
  if (!delta) {
    return;
  }
  const text = String(delta || "");
  if (!text.trim() && !state.reasoningContentNode?.textContent?.trim()) {
    return;
  }
  ensureReasoningNode();
  state.reasoningContentNode.textContent += text;
  scrollChatToBottom();
  scheduleUICacheSave();
}

function finalizeStreamingNode() {
  flushStreamBuffer(true);
  if (state.streamingNode) {
    const answerText = String(state.streamingNode.textContent || "").trim();
    if (!answerText) {
      state.streamingNode.remove();
    } else {
      state.streamingNode.classList.remove("streaming");
    }
  }
  if (state.reasoningNode) {
    const reasoningText = String(state.reasoningContentNode?.textContent || "").trim();
    if (!reasoningText) {
      state.reasoningNode.remove();
    } else {
      const collapsed = state.reasoningNode.classList.contains("collapsed");
      const finalized = createReasoningBubble(reasoningText, "reasoning", {
        bindState: false,
        collapsed,
      });
      state.reasoningNode.replaceWith(finalized);
    }
  }
  if (state.streamFlushTimer) {
    clearTimeout(state.streamFlushTimer);
    state.streamFlushTimer = null;
  }
  state.streamBuffer = "";
  state.streamingNode = null;
  state.reasoningNode = null;
  state.reasoningContentNode = null;
  state.reasoningToggleNode = null;
  scheduleUICacheSave();
}

async function syncSettingsFromBackground(options = {}) {
  const silent = !!options.silent;
  const res = await callBackground("GET_SETTINGS");
  if (!res?.ok) {
    if (!silent) {
      setSaveStatus(res?.error || "读取设置失败", true);
    }
    return false;
  }

  apiKeyInput.value = res.settings.apiKey || "";
  setModelValue(res.settings.model || "");
  thinkingLevelInput.value = normalizeThinkingLevel(res.settings.thinkingLevel);
  baseUrlInput.value = res.settings.baseURL || "https://api.openai.com/v1";
  allowScriptInput.checked = !!res.settings.allowScript;
  requestTimeoutSecInput.value = String(normalizeRequestTimeoutSec(res.settings.requestTimeoutSec));
  syncToolTurnLimitUI(res.settings.toolTurnLimit);
  state.mcpServices = normalizeMcpServices(res.settings.mcpServices || []);
  renderMcpServices();

  updateModelAvailability();
  updateSelectedModelHint();
  if (!silent) {
    setSaveStatus("设置已同步");
  }
  return true;
}

function openSettings() {
  settingsModal.classList.remove("hidden");
  void syncSettingsFromBackground({ silent: true });
}

function closeSettings() {
  settingsModal.classList.add("hidden");
}

function getCurrentModelValue() {
  return String(quickModelInput.value || modelInput.value || "").trim();
}

function setModelValue(value, source = "any") {
  const text = String(value || "").trim();
  if (source !== "quick") {
    quickModelInput.value = text;
  }
  if (source !== "settings") {
    modelInput.value = text;
  }
  quickModelInput.title = text;
  modelInput.title = text;
}

function updateSelectedModelHint() {
  if (!state.running) {
    runState.textContent = "";
  }
}

function inferBubbleKind(node) {
  if (!node || !node.classList) return "assistant";
  if (node.classList.contains("user")) return "user";
  if (node.classList.contains("error")) return "error";
  if (node.classList.contains("debug")) return "debug";
  if (node.classList.contains("reasoning")) return "reasoning";
  return "assistant";
}

function collectChatHistoryFromDOM() {
  const entries = [];
  chatLogNode.querySelectorAll(".bubble").forEach((node) => {
    const kind = inferBubbleKind(node);
    let text = "";
    if (kind === "reasoning") {
      const reasoningContent = node.querySelector(".reasoning-content");
      text = String(reasoningContent?.textContent || "").trim();
    } else {
      text = String(node.textContent || "").trim();
    }
    if (!text) return;
    entries.push({
      kind,
      text,
      streaming: node.classList.contains("streaming"),
      collapsed: kind === "reasoning" ? node.classList.contains("collapsed") : void 0,
    });
  });
  if (entries.length > MAX_CHAT_HISTORY) {
    return entries.slice(entries.length - MAX_CHAT_HISTORY);
  }
  return entries;
}

function cleanupReasoningPanelsInDOM() {
  const nodes = Array.from(chatLogNode.querySelectorAll(".bubble.reasoning.reasoning-panel"));
  for (const node of nodes) {
    const text = String(node.querySelector(".reasoning-content")?.textContent || "").trim();
    if (!text) {
      node.remove();
    }
  }
  const emptyAssistant = Array.from(chatLogNode.querySelectorAll(".bubble.assistant"));
  for (const node of emptyAssistant) {
    if (!String(node.textContent || "").trim()) {
      node.remove();
    }
  }
}

function scheduleUICacheSave() {
  if (state.uiSaveTimer) {
    clearTimeout(state.uiSaveTimer);
  }
  state.uiSaveTimer = setTimeout(() => {
    void saveUICache();
  }, 120);
}

async function saveUICache() {
  try {
    const promptDraft = String(promptInput?.value || "").slice(0, MAX_PROMPT_DRAFT_CHARS);
    const cache = {
      savedAt: Date.now(),
      models: state.models.slice(0, MAX_MODEL_CACHE),
      modelsUpdatedAt: state.modelsUpdatedAt || 0,
      promptDraft,
      chat: collectChatHistoryFromDOM(),
    };
    await chrome.storage.local.set({ [UI_CACHE_KEY]: cache });
  } catch (_err) {
    // ignore cache write failures
  }
}

async function loadUICache() {
  try {
    const data = await chrome.storage.local.get(UI_CACHE_KEY);
    const cache = data?.[UI_CACHE_KEY] || {};
    const draft = String(cache.promptDraft || "");
    if (draft) {
      promptInput.value = draft.slice(0, MAX_PROMPT_DRAFT_CHARS);
    }
    if (Array.isArray(cache.models) && cache.models.length > 0) {
      updateModelList(cache.models, {
        persist: false,
        updatedAt: Number(cache.modelsUpdatedAt || 0),
      });
    } else {
      state.modelsUpdatedAt = 0;
    }
    if (Array.isArray(cache.chat) && cache.chat.length > 0) {
      for (const item of cache.chat) {
        const kind = String(item?.kind || "assistant");
        const text = String(item?.text || "");
        if (kind === "reasoning") {
          const streaming = !!item?.streaming;
          const collapsed = typeof item?.collapsed === "boolean" ? item.collapsed : true;
          const node = createReasoningBubble(text, streaming ? "reasoning streaming" : "reasoning", {
            bindState: false,
            collapsed,
          });
          chatLogNode.appendChild(node);
        } else {
          appendBubble(text, kind, { persist: false });
        }
      }
      cleanupReasoningPanelsInDOM();
      return cache.chat.length;
    }
  } catch (_err) {
    // ignore cache read failures
  }
  return 0;
}

function normalizeMcpTransport(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (raw === "cmd") return "stdio";
  if (raw === "http" || raw === "sse" || raw === "stdio" || raw === "streamable_http") {
    return raw;
  }
  return "streamable_http";
}

function makeMcpService(input = {}) {
  const idSeed = Math.random().toString(36).slice(2, 8);
  return {
    id: String(input.id || `svc_${Date.now()}_${idSeed}`),
    name: String(input.name || ""),
    enabled: input.enabled !== false,
    transport: normalizeMcpTransport(input.transport),
    baseURL: String(input.baseURL || ""),
    apiKey: String(input.apiKey || ""),
    command: String(input.command || ""),
    args: String(input.args || ""),
    envText: String(input.envText || ""),
  };
}

function normalizeMcpServices(list) {
  if (!Array.isArray(list)) {
    return [];
  }
  return list.map((item) => makeMcpService(item));
}

function findServiceIndex(id) {
  return state.mcpServices.findIndex((item) => item.id === id);
}

function updateMcpService(id, patch) {
  const idx = findServiceIndex(id);
  if (idx < 0) {
    return;
  }
  state.mcpServices[idx] = {
    ...state.mcpServices[idx],
    ...patch,
  };
}

function removeMcpService(id) {
  state.mcpServices = state.mcpServices.filter((item) => item.id !== id);
}

function escapeHTML(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildMcpServiceCard(service) {
  const isStdio = service.transport === "stdio";
  const isSSE = service.transport === "sse";
  const isHTTP = service.transport === "http";
  const isStreamableHTTP = service.transport === "streamable_http";

  const baseURLLabel = isSSE ? "SSE 服务 URL" : isHTTP || isStreamableHTTP ? "服务 URL" : "桥接 URL";
  const baseURLHint = isHTTP
    ? "例如：https://mcp-gateway.example.com"
    : isStreamableHTTP
    ? "例如：https://mcp.example.com/mcp"
    : isSSE
    ? "优先： https://xxx/sse（直连）; 或桥接： http://127.0.0.1:8787/mcp-bridge"
    : "例如：http://127.0.0.1:8787/mcp-bridge";
  const stdioHiddenClass = isStdio ? "" : "hidden";

  let transportNote = "Streamable HTTP：原生 MCP JSON-RPC。";
  if (isHTTP) {
    transportNote = "HTTP：兼容 /tools + /call 网关接口。";
  } else if (isSSE) {
    transportNote = "SSE：支持直连 /sse 端点（推荐）或桥接模式；若服务支持 Streamable HTTP，优先选择 Streamable HTTP。";
  } else if (isStdio) {
    transportNote = "STDIO：通过桥接服务按 command/args/env 启动。";
  }

  const node = document.createElement("article");
  node.className = "mcp-service";
  node.dataset.id = service.id;
  node.innerHTML = `
    <div class="mcp-service-head">
      <label class="mcp-service-title">
        <input data-field="enabled" type="checkbox" ${service.enabled ? "checked" : ""} />
        <span>启用服务</span>
      </label>
      <button data-action="remove" type="button" class="danger-btn">删除</button>
    </div>
    <div class="mcp-service-grid">
      <label>
        服务名称
        <input data-field="name" type="text" placeholder="例如：本地 Playwright MCP" value="${escapeHTML(service.name)}" />
      </label>
      <label>
        类型
        <select data-field="transport">
          <option value="streamable_http" ${service.transport === "streamable_http" ? "selected" : ""}>Streamable HTTP</option>
          <option value="http" ${service.transport === "http" ? "selected" : ""}>HTTP 网关</option>
          <option value="sse" ${service.transport === "sse" ? "selected" : ""}>SSE（直连/桥接）</option>
          <option value="stdio" ${service.transport === "stdio" ? "selected" : ""}>STDIO（桥接）</option>
        </select>
      </label>
      <div class="full-row tip">${transportNote}</div>
      <label class="full-row">
        ${baseURLLabel}
        <input data-field="baseURL" type="text" placeholder="${baseURLHint}" value="${escapeHTML(service.baseURL)}" />
      </label>
      <label class="full-row">
        Token（可选）
        <input data-field="apiKey" type="password" placeholder="可选，用于 MCP 鉴权" value="${escapeHTML(service.apiKey)}" />
      </label>
      <label class="full-row ${stdioHiddenClass}" data-cmd-field="command">
        STDIO Command
        <input data-field="command" type="text" placeholder="例如：npx -y @modelcontextprotocol/server-filesystem ." value="${escapeHTML(service.command)}" />
      </label>
      <label class="full-row ${stdioHiddenClass}" data-cmd-field="args">
        STDIO Args（可选，空格分隔）
        <input data-field="args" type="text" placeholder="例如：--port 3001" value="${escapeHTML(service.args)}" />
      </label>
      <label class="full-row ${stdioHiddenClass}" data-cmd-field="envText">
        STDIO Env（可选，JSON 或 KEY=VALUE 每行一个）
        <textarea data-field="envText" rows="3" placeholder="{&quot;DEBUG&quot;:&quot;1&quot;}">${escapeHTML(service.envText)}</textarea>
      </label>
    </div>
  `;
  return node;
}

function bindMcpServiceCard(node, serviceId) {
  const removeBtn = node.querySelector('[data-action="remove"]');
  if (removeBtn) {
    removeBtn.addEventListener("click", () => {
      removeMcpService(serviceId);
      renderMcpServices();
      scheduleSave();
    });
  }

  node.querySelectorAll("[data-field]").forEach((input) => {
    const field = input.getAttribute("data-field");
    const isCheckbox = input.type === "checkbox";
    const handler = () => {
      const value = isCheckbox ? input.checked : input.value;
      updateMcpService(serviceId, { [field]: value });

      if (field === "transport") {
        renderMcpServices();
      }
      scheduleSave();
    };
    input.addEventListener("input", handler);
    input.addEventListener("change", handler);
  });
}

function renderMcpServices() {
  mcpServicesList.innerHTML = "";
  if (state.mcpServices.length === 0) {
    const empty = document.createElement("div");
    empty.className = "tip";
    empty.textContent = "暂无 MCP 服务，点击“新增服务”添加。";
    mcpServicesList.appendChild(empty);
    return;
  }

  for (const service of state.mcpServices) {
    const card = buildMcpServiceCard(service);
    mcpServicesList.appendChild(card);
    bindMcpServiceCard(card, service.id);
  }
}

function collectSettingsFromUI() {
  const thinkingLevel = normalizeThinkingLevel(thinkingLevelInput?.value);
  thinkingLevelInput.value = thinkingLevel;
  const requestTimeoutSec = normalizeRequestTimeoutSec(requestTimeoutSecInput?.value);
  const toolTurnLimit = unlimitedTurnsInput?.checked ? 0 : normalizeToolTurnLimit(toolTurnLimitInput?.value);
  return {
    apiKey: apiKeyInput.value.trim(),
    model: getCurrentModelValue(),
    thinkingLevel,
    baseURL: baseUrlInput.value.trim(),
    allowScript: allowScriptInput.checked,
    requestTimeoutSec,
    toolTurnLimit,
    mcpServices: normalizeMcpServices(state.mcpServices),
  };
}

async function loadSettings() {
  await syncSettingsFromBackground({ silent: false });
}

function scheduleSave() {
  if (state.saveTimer) {
    clearTimeout(state.saveTimer);
  }

  state.saveTimer = setTimeout(async () => {
    const res = await callBackground("SAVE_SETTINGS", collectSettingsFromUI());
    if (!res?.ok) {
      setSaveStatus(res?.error || "保存失败", true);
      return;
    }
    setSaveStatus("设置已保存");
    updateSelectedModelHint();
  }, 150);
}

function updateModelList(models, options = {}) {
  state.models = Array.isArray(models) ? models.filter(Boolean) : [];
  state.modelsUpdatedAt =
    typeof options.updatedAt === "number" && Number.isFinite(options.updatedAt)
      ? Math.max(0, options.updatedAt)
      : Date.now();
  modelList.innerHTML = "";
  for (const name of state.models) {
    const option = document.createElement("option");
    option.value = name;
    modelList.appendChild(option);
  }
  updateModelAvailability();
  if (options.persist !== false) {
    scheduleUICacheSave();
  }
}

function updateModelAvailability() {
  const hasKey = !!apiKeyInput.value.trim();

  modelInput.disabled = !hasKey || state.running;
  quickModelInput.disabled = !hasKey || state.running;
  thinkingLevelInput.disabled = state.running;
}

function isModelCacheFresh() {
  if (!state.models.length || !state.modelsUpdatedAt) {
    return false;
  }
  return Date.now() - state.modelsUpdatedAt <= MODEL_LIST_TTL_MS;
}

function invalidateModelCache() {
  state.models = [];
  state.modelsUpdatedAt = 0;
  modelList.innerHTML = "";
  scheduleUICacheSave();
}

async function refreshModelsSilently(options = {}) {
  const force = !!options.force;
  if (state.modelFetchInFlight) {
    return;
  }
  const hasKey = !!apiKeyInput.value.trim();
  if (!hasKey || state.running) {
    return;
  }
  if (!force && isModelCacheFresh()) {
    return;
  }

  state.modelFetchInFlight = true;

  try {
    const res = await callBackground("LIST_MODELS", {
      apiKey: apiKeyInput.value.trim(),
      baseURL: baseUrlInput.value.trim(),
    });

    if (!res?.ok) {
      // silent mode: model list refresh failure should not interrupt the chat UI
      return;
    }

    updateModelList(res.models || [], { updatedAt: Date.now() });
    if (state.models.length > 0 && !getCurrentModelValue()) {
      setModelValue(state.models[0]);
      scheduleSave();
    }
  } catch (_err) {
    // silent mode
  } finally {
    state.modelFetchInFlight = false;
  }
}

function ensureModelCacheOnDropdownOpen() {
  if (isModelCacheFresh()) {
    return;
  }
  void refreshModelsSilently({ force: true });
}

function chatContainsSnippet(text) {
  const raw = String(text || "").trim();
  if (!raw) return true;
  const snippet = raw.slice(0, 120);
  const bubbles = chatLogNode.querySelectorAll(".bubble");
  for (const node of bubbles) {
    let current = "";
    if (node.classList.contains("reasoning")) {
      current = String(node.querySelector(".reasoning-content")?.textContent || "");
    } else {
      current = String(node.textContent || "");
    }
    if (current.includes(snippet)) {
      return true;
    }
  }
  return false;
}

function applyTaskSnapshot(task = {}) {
  if (!task || typeof task !== "object") {
    return;
  }
  if (task.statusText) {
    runState.textContent = task.statusText;
  }
  if (task.reasoningText) {
    ensureReasoningNode();
    state.reasoningContentNode.textContent = task.reasoningText;
  }
  if (task.assistantText) {
    const assistantText = String(task.assistantText || "");
    if (!assistantText.trim()) {
      scrollChatToBottom();
      scheduleUICacheSave();
      return;
    }
    if (!state.streamingNode) {
      state.streamingNode = createBubble("", "assistant streaming");
      chatLogNode.appendChild(state.streamingNode);
    }
    state.streamingNode.textContent = assistantText;
  }
  scrollChatToBottom();
  scheduleUICacheSave();
}

function startAgentStream(payload) {
  if (state.streamPort) {
    try {
      state.streamPort.disconnect();
    } catch (_err) {
      // ignore
    }
    state.streamPort = null;
  }
  const port = chrome.runtime.connect({ name: "agent_stream" });
  state.streamPort = port;
  let done = false;

  port.onMessage.addListener((msg) => {
    if (!msg || typeof msg !== "object") {
      return;
    }

    if (msg.type === "status") {
      runState.textContent = msg.text || "";
      return;
    }

    if (msg.type === "debug") {
      appendBubble(msg.text || "", "debug");
      return;
    }

    if (msg.type === "stream_delta") {
      appendStream(msg.delta || "");
      return;
    }

    if (msg.type === "reasoning_delta") {
      appendReasoningStream(msg.delta || "");
      return;
    }

    if (msg.type === "accepted") {
      state.currentTaskId = String(msg.taskId || "");
      return;
    }

    if (msg.type === "task_snapshot") {
      applyTaskSnapshot(msg.task || {});
      return;
    }

    if (msg.type === "result") {
      const hadAnswerStreaming = !!state.streamingNode;
      finalizeStreamingNode();
      if (!hadAnswerStreaming) {
        appendBubble(msg.message || "执行完成", "assistant");
      }
      return;
    }

    if (msg.type === "error") {
      finalizeStreamingNode();
      appendBubble(msg.error || "执行失败", "error");
      return;
    }

    if (msg.type === "stopped") {
      finalizeStreamingNode();
      appendBubble(msg.message || "任务已停止", "assistant");
      return;
    }

    if (msg.type === "done") {
      done = true;
      state.currentTaskId = "";
      state.stopping = false;
      setRunning(false, "");
      void syncSettingsFromBackground({ silent: true });
      state.streamPort = null;
      try {
        port.disconnect();
      } catch (_err) {
        // ignore
      }
    }
  });

  port.onDisconnect.addListener(() => {
    if (state.streamPort === port) {
      state.streamPort = null;
    }
    if (state.stopping) {
      state.stopping = false;
      renderRunButton();
    }
    if (!done) {
      appendBubble("实时连接已断开，后台任务仍可能继续。重新打开弹窗会自动恢复。", "assistant");
    }
  });

  port.postMessage(payload);
}
async function stopCurrentTask() {
  if (!state.running || state.stopping) {
    return;
  }
  state.stopping = true;
  renderRunButton();
  runState.textContent = "停止中...";
  const res = await callBackground("STOP_AGENT_TASK", {
    taskId: state.currentTaskId || "",
    reason: "用户手动停止任务",
  });
  if (!res?.ok) {
    state.stopping = false;
    renderRunButton();
    appendBubble(res?.error || "停止失败", "error");
    return;
  }
}

async function tryResumeBackgroundTask() {
  try {
    const res = await callBackground("GET_AGENT_TASK");
    const task = res?.ok ? res.task : null;
    if (!task || task.status !== "running" || !task.id) {
      return false;
    }
    state.currentTaskId = String(task.id);
    setRunning(true, task.statusText || "后台执行中...");
    applyTaskSnapshot(task);
    startAgentStream({
      type: "ATTACH_TASK",
      payload: { taskId: state.currentTaskId },
    });
    return true;
  } catch (_err) {
    return false;
  }
}

async function restoreLastTaskFragments() {
  try {
    const res = await callBackground("GET_AGENT_TASK");
    const task = res?.ok ? res.task : null;
    if (!task || task.status === "running") {
      return false;
    }
    let changed = false;
    const prompt = String(task.prompt || "").trim();
    const reasoningText = String(task.reasoningText || "").trim();
    const assistantText = String(task.assistantText || task.message || "").trim();
    const errorText = String(task.error || "").trim();

    if (prompt && !chatContainsSnippet(prompt)) {
      appendBubble(prompt, "user", { persist: false });
      changed = true;
    }
    if (reasoningText && !chatContainsSnippet(reasoningText)) {
      appendBubble(reasoningText, "reasoning", { persist: false });
      changed = true;
    }
    if (assistantText && !chatContainsSnippet(assistantText)) {
      appendBubble(assistantText, "assistant", { persist: false });
      changed = true;
    }
    if (errorText && !chatContainsSnippet(errorText)) {
      appendBubble(errorText, "error", { persist: false });
      changed = true;
    }
    if (changed) {
      scheduleUICacheSave();
    }
    return changed;
  } catch (_err) {
    return false;
  }
}

async function runCommand() {
  if (state.running) {
    return;
  }
  const prompt = promptInput.value.trim();
  if (!prompt) {
    appendBubble("请输入指令，例如：把页面中所有英文段落翻译成中文", "error");
    return;
  }

  const model = getCurrentModelValue();
  if (!model) {
    appendBubble("请先选择模型", "error");
    return;
  }

  setRunning(true, "执行中...");
  resetStreamingNode();
  appendBubble(prompt, "user");
  promptInput.value = "";
  scheduleUICacheSave();

  startAgentStream({
    type: "RUN_AGENT_STREAM",
    payload: {
      prompt,
      settings: {
        ...collectSettingsFromUI(),
        model,
      },
    },
  });
}

function bindEvents() {
  [apiKeyInput, modelInput, quickModelInput, baseUrlInput, allowScriptInput, requestTimeoutSecInput, toolTurnLimitInput, unlimitedTurnsInput, thinkingLevelInput].forEach((el) => {
    el.addEventListener("input", scheduleSave);
    el.addEventListener("change", scheduleSave);
  });
  thinkingLevelInput.addEventListener("change", () => {
    thinkingLevelInput.value = normalizeThinkingLevel(thinkingLevelInput.value);
    scheduleSave();
  });
  requestTimeoutSecInput.addEventListener("blur", () => {
    requestTimeoutSecInput.value = String(normalizeRequestTimeoutSec(requestTimeoutSecInput.value));
    scheduleSave();
  });
  toolTurnLimitInput.addEventListener("blur", () => {
    if (unlimitedTurnsInput?.checked) {
      syncToolTurnLimitUI(0);
    } else {
      syncToolTurnLimitUI(toolTurnLimitInput.value);
    }
    scheduleSave();
  });
  if (unlimitedTurnsInput) {
    unlimitedTurnsInput.addEventListener("change", () => {
      if (unlimitedTurnsInput.checked) {
        syncToolTurnLimitUI(0);
      } else {
        const current = normalizeToolTurnLimit(toolTurnLimitInput?.value);
        syncToolTurnLimitUI(current === 0 ? 20 : current);
      }
      scheduleSave();
    });
  }

  apiKeyInput.addEventListener("input", () => {
    if (!apiKeyInput.value.trim()) {
      invalidateModelCache();
      setModelValue("");
    } else {
      updateModelAvailability();
      invalidateModelCache();
    }
    updateSelectedModelHint();
  });
  baseUrlInput.addEventListener("input", () => {
    invalidateModelCache();
  });

  modelInput.addEventListener("input", () => {
    setModelValue(modelInput.value, "settings");
    updateSelectedModelHint();
  });
  modelInput.addEventListener("change", () => {
    setModelValue(modelInput.value, "settings");
    updateSelectedModelHint();
  });
  quickModelInput.addEventListener("input", () => {
    setModelValue(quickModelInput.value, "quick");
    updateSelectedModelHint();
  });
  quickModelInput.addEventListener("change", () => {
    setModelValue(quickModelInput.value, "quick");
    updateSelectedModelHint();
  });
  modelInput.addEventListener("focus", ensureModelCacheOnDropdownOpen);
  modelInput.addEventListener("click", ensureModelCacheOnDropdownOpen);
  quickModelInput.addEventListener("focus", ensureModelCacheOnDropdownOpen);
  quickModelInput.addEventListener("click", ensureModelCacheOnDropdownOpen);

  addMcpServiceBtn.addEventListener("click", () => {
    state.mcpServices.push(makeMcpService({ enabled: true, transport: "streamable_http" }));
    renderMcpServices();
    scheduleSave();
  });

  document.querySelectorAll(".quick-btn[data-q]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const q = btn.getAttribute("data-q") || "";
      promptInput.value = q;
      promptInput.focus();
    });
  });

  openSettingsBtn.addEventListener("click", openSettings);
  closeSettingsBtn.addEventListener("click", closeSettings);
  settingsModal.addEventListener("click", (event) => {
    if (event.target === settingsModal) {
      closeSettings();
    }
  });

  runBtn.addEventListener("click", async () => {
    if (state.running) {
      await stopCurrentTask();
      return;
    }
    await runCommand();
  });
  clearBtn.addEventListener("click", async () => {
    chatLogNode.innerHTML = "";
    resetStreamingNode();
    promptInput.value = "";
    updateSelectedModelHint();
    try {
      await chrome.storage.local.set({
        [UI_CACHE_KEY]: {
          savedAt: Date.now(),
          models: state.models.slice(0, MAX_MODEL_CACHE),
          modelsUpdatedAt: state.modelsUpdatedAt || 0,
          promptDraft: "",
          chat: [],
        },
      });
    } catch (_err) {
      // ignore cache write failures
    }
    await callBackground("CLEAR_CHAT_STATE");
  });

  promptInput.addEventListener("keydown", async (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      await runCommand();
    }
  });
  promptInput.addEventListener("input", () => {
    scheduleUICacheSave();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !settingsModal.classList.contains("hidden")) {
      closeSettings();
    }
  });
}

window.addEventListener("DOMContentLoaded", async () => {
  bindEvents();
  const restoredMessages = await loadUICache();
  cleanupReasoningPanelsInDOM();
  await loadSettings();
  const resumed = await tryResumeBackgroundTask();
  if (!resumed) {
    await restoreLastTaskFragments();
    cleanupReasoningPanelsInDOM();
  }
  if (!resumed && restoredMessages === 0) {
    appendBubble("已就绪。请先点右上角设置，完成 API Key 和模型配置后开始对话。", "assistant");
  }
});

window.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    void saveUICache();
  }
});

window.addEventListener("beforeunload", () => {
  void saveUICache();
});

