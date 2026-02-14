# 智页（SmartPage Agent）

一个基于 Chrome Extension Manifest V3 的网页智能体插件。  
你可以直接用自然语言对当前网页进行读取、提取、修改和翻译，并支持通过 MCP 扩展外部工具能力。

## 核心能力

- OpenAI SDK 接入（兼容 OpenAI 协议的 Base URL）
- 模型列表拉取与缓存（30 秒）
- 对话流式输出（含推理内容分区展示）
- Function Calling 循环执行（多轮工具调用）
- 页面操作工具（抓取 DOM、改属性、改文本、整页替换等）
- MCP 多服务配置（可独立启用/关闭）

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
- `get_whole_html`
- `replace_whole_html`
- `translate_whole_page_to_zh`
- `append_script`（高风险，默认需手动开启）

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
- `sse`：SSE 桥接模式
- `stdio`：通过桥接服务启动本地命令

## 常用开发命令

```bash
# 单次构建
npm run build

# 监听构建
npm run build:watch
```

## 安全提示

- 开启 `append_script` 后，模型可以在页面注入并执行脚本，请仅在可信页面使用。
- API Key、MCP Token、MCP 服务配置保存在 `chrome.storage.local`。
- `chrome://` 等浏览器内部页面无法注入内容脚本。
