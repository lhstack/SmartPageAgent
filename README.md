# 智页（SmartPage Agent）

一个基于 Chrome Extension Manifest V3 的网页智能体插件。  
你可以直接用自然语言对当前网页进行读取、提取、修改和翻译，并支持通过 MCP 扩展外部工具能力。

## 核心能力

- OpenAI SDK 接入（兼容 OpenAI 协议的 Base URL）
- 模型列表拉取与缓存（30 秒）
- 对话流式输出（含推理内容分区展示）
- Function Calling 循环执行（多轮工具调用）
- 页面操作工具（抓取 DOM、改属性、改文本、整页替换等）
- 本地存储工具（`set_storage` / `get_storage`）
- MCP 多服务配置（可独立启用/关闭）

## 近期变更

- 已移除抓包相关功能（`start_network_capture` / `get_network_capture` / `stop_network_capture`）。
- SSE MCP 链路已支持按 JSON-RPC `id` 对齐响应，兼容 `POST` 空响应体场景。

## 内置网页工具

- `get_page_snapshot`
- `query_elements`
- `extract_text`
- `extract_links`
- `extract_all_anchors`
- `extract_buttons`
- `extract_elements_by_criteria`
- `set_text`
- `set_html`
- `set_attribute`
- `remove_elements`
- `set_storage`（按 key 持久化存储 JSON 值）
- `get_storage`（按 key 读取存储值）
- `get_whole_html`
- `replace_whole_html`
- `translate_whole_page_to_zh`
- `execute_script`（执行脚本并返回结果，高风险，默认需手动开启）
- `append_script`（高风险，默认需手动开启）

`execute_script` 建议写法示例：`{"code":"return new Date().toString()"}`  
如果不写 `return`，插件会尝试回退为表达式求值，但复杂脚本仍建议显式 `return`。

`set_storage/get_storage` 示例：  
- `{"key":"profile","value":{"name":"lhstack","lang":"zh-CN"}}`  
- `{"key":"profile"}`

## 快速开始

1. 安装依赖

```bash
npm install
```

2. 构建后台脚本

```bash
npm run build
```

3. 在 Chrome 打开 `chrome://extensions`
4. 打开「开发者模式」
5. 点击「加载已解压的扩展程序」
6. 选择目录 `chrome-web-agent`
7. 打开扩展后在设置中填写：
- API Key
- Base URL
- 可选：MCP 服务（支持多个）

## MCP 支持的传输类型

- `streamable_http`：原生 MCP JSON-RPC（推荐）
- `http`：`/tools + /call` 网关模式
- `sse`：SSE 直连 MCP（推荐填写 `/sse` 端点）；也支持桥接模式
- `stdio`：通过桥接服务启动本地命令

说明：MCP 默认采用独立调用链路（`tools/list` + `tools/call` / streamable HTTP JSON-RPC），不依赖 `responses`。
提示：SSE 配置建议填 `.../sse`，不要填 `.../sse/tools` 或 `.../sse/call`；若服务支持 Streamable HTTP，优先选 `streamable_http`。

### SSE 链路（本次更新）

- 新增 SSE JSON-RPC `id` 对齐：当 `POST` 仅返回 `202/空体` 时，会继续在 SSE 事件流中按请求 `id` 等待对应结果（避免误判为无返回）。
- 增加 SSE 会话内 `pending/inbox` 管理，解决握手后响应与请求的竞态问题。
- 会话清理或流关闭时会主动中止并回收等待中的请求，避免前端“卡住”。
- 当服务返回 0 个工具时会显示明确提示：`未返回可用工具列表（0 个 tools）`，用于区分“链路问题”和“服务端确实无工具”。

## 常用开发命令

```bash
# 单次构建
npm run build

# 监听构建
npm run build:watch
```

## 安全提示

- 开启 `execute_script` / `append_script` 后，模型可以在页面执行脚本，请仅在可信页面使用。
- API Key、MCP Token、MCP 服务配置保存在 `chrome.storage.local`。
- `chrome://` 等浏览器内部页面无法注入内容脚本。
