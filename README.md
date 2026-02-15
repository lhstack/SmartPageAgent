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
- 加解密与编码工具（AES/DES/3DES、RSA、base64/hex/unicode）
- 任意 HTTP 请求工具（方法/请求头/请求体/查询参数可配置）
- 加密配置持久化工具（profile 保存/读取/删除）
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
- `crypto_encrypt` / `crypto_decrypt`
- `crypto_encrypt_direct` / `crypto_decrypt_direct`（显式参数，不使用 profile）
- `rsa_encrypt` / `rsa_decrypt` / `rsa_generate_keypair`
- `rsa_encrypt_direct` / `rsa_decrypt_direct`（显式参数）
- `encoding_convert`（utf8/base64/hex/unicode 互转）
- `http_request`（任意方法、headers、body、query）
- `random_uuid` / `random_uuid32`
- `random_string`（指定长度与字符集）
- `random_number`（指定范围，支持整数/小数）
- `click_element` / `input_text` / `select_option` / `scroll_to`
- `extract_table` / `extract_form_schema` / `extract_meta_tags` / `extract_jsonld`
- `query_by_text`
- `hash_digest` / `hmac_sign`
- `url_encode` / `url_decode` / `jwt_decode` / `jsonpath_query` / `regex_extract`
- `mcp_service_list` / `mcp_service_upsert` / `mcp_service_set_enabled` / `mcp_service_test`
- `crypto_profile_list` / `crypto_profile_get` / `crypto_profile_save` / `crypto_profile_delete`
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

`crypto_profile_save` 示例：  
- `{"name":"aes-ecb-demo","algorithm":"AES","mode":"ECB","keySize":128,"keyEncoding":"utf8","keyValue":"demo-key-123456","description":"测试配置"}`

`crypto_encrypt` 示例（直接参数）：  
- `{"algorithm":"AES","mode":"CBC","keySize":128,"keyEncoding":"utf8","key":"1234567890abcdef","ivEncoding":"utf8","iv":"abcdef1234567890","plaintext":"hello","outputEncoding":"base64"}`

`crypto_encrypt` 示例（使用 profile）：  
- `{"profileName":"aes-ecb-demo","plaintext":"hello","outputEncoding":"hex"}`

`crypto_encrypt_direct` 示例（显式参数，不读取 profile）：  
- `{"algorithm":"AES","mode":"ECB","keySize":128,"keyEncoding":"utf8","key":"demo-key-123456","plaintext":"hello","plainEncoding":"utf8","outputEncoding":"base64"}`

`crypto_decrypt_direct` 示例（显式参数，不读取 profile）：  
- `{"algorithm":"AES","mode":"ECB","keySize":128,"keyEncoding":"utf8","key":"demo-key-123456","ciphertext":"nHi0RPI6J2M6A5iJ5x8aNA==","cipherEncoding":"base64","outputEncoding":"utf8"}`

`rsa_generate_keypair` 示例：  
- `{"modulusLength":2048,"outputEncoding":"base64"}`

`rsa_encrypt_direct` 示例：  
- `{"publicKey":"<base64-spki-public-key>","publicKeyEncoding":"base64","plaintext":"hello","inputEncoding":"utf8","outputEncoding":"base64"}`

`rsa_decrypt_direct` 示例：  
- `{"privateKey":"<base64-pkcs8-private-key>","privateKeyEncoding":"base64","ciphertext":"<base64-ciphertext>","inputEncoding":"base64","outputEncoding":"utf8"}`

`encoding_convert` 示例：  
- `{"text":"你好","from":"utf8","to":"unicode"}`

`http_request` 示例：  
- `{"url":"https://httpbin.org/post","method":"POST","headers":{"Content-Type":"application/json"},"body":{"a":1},"bodyType":"json","responseType":"json"}`

`random_uuid` 示例：  
- `{}`

`random_uuid32` 示例：  
- `{}`

`random_string` 示例：  
- `{"length":24,"charset":"alnum"}`
- `{"length":16,"charset":"custom","customChars":"ABC123xyz"}`

`random_number` 示例：  
- `{"min":1,"max":100,"integer":true}`
- `{"min":0,"max":1,"integer":false,"precision":6}`

`click_element` 示例：  
- `{"selector":"button.submit"}`

`input_text` 示例：  
- `{"selector":"input[name='email']","text":"demo@example.com"}`

`extract_table` 示例：  
- `{"selector":"table","maxTables":3,"maxRows":50}`

`query_by_text` 示例：  
- `{"text":"登录","selector":"button,a,[role='button']","limit":10}`

`hash_digest` 示例：  
- `{"text":"hello","algorithm":"SHA256","outputEncoding":"hex"}`

`hmac_sign` 示例：  
- `{"text":"hello","key":"secret","algorithm":"SHA256","outputEncoding":"base64"}`

`url_encode/url_decode` 示例：  
- `{"text":"a b&c","component":true}`

`jwt_decode` 示例：  
- `{"token":"<jwt-token>"}`

`jsonpath_query` 示例：  
- `{"json":{"a":{"b":[{"id":1},{"id":2}]}},"path":"$.a.b[1].id"}`

`regex_extract` 示例：  
- `{"text":"id=123; id=456","pattern":"id=(\\\\d+)","flags":"g","all":true,"group":1}`

`mcp_service_upsert` 示例（自动新增或更新）：  
- `{"serviceName":"本地SSE","transport":"sse","baseURL":"http://127.0.0.1:8787/sse","apiKey":"xxx","enabled":true}`

`mcp_service_test` 示例：  
- `{"serviceName":"本地SSE"}`

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
