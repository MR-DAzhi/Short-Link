# ⚡ Short-Link | 高性能轻量级短网址重定向引擎

Short-Link 是一款基于全球边缘网络（Cloudflare Workers）构建的高性能、零延迟短网址转发控制台。项目采用前后端分离设计，具备纯净安全的分流控能力，支持一键部署，实现零成本、零服务器开销的私有化短网址管理。

---

## ✨ 核心特性

* 🚀 **全球加速**：基于 Cloudflare Workers 边缘网络，全球请求零延迟智能转发。
* 🔒 **私密安全**：管理后台全面接入强鉴权保护与安全 Cookie 机制，根路径与非授权访问严格拦截，拒绝越权漏洞。
* 🎨 **极简美学**：前端基于 Pico CSS 框架深度定制，完美适配暗黑模式（Dark Mode），输入框高精对齐，极致流畅。
* 📉 **零开销运行**：完全依托 Cloudflare 免费版 KV 数据库，真正做到“纯本地开销、零服务器支出”。
* 🔄 **智能路由**：自动兼容末尾斜杠（`/admin` 与 `/admin/`）的习惯性输入，防止路由滑落导致 404。

---

## 🛠️ 技术栈

* **Runtime**: Cloudflare Workers (JavaScript / ES Modules)
* **Database**: Cloudflare KV (Key-Value 存储)
* **Frontend**: Vanilla JS + Pico CSS (HTML5 / CSS3)
* **Deployment**: Wrangler CLI

---

## 📦 项目结构

```text
DWZ/
├── frontend/
│   ├── 404.html            # 404 错误兜底页
│   ├── admin_login.html    # 管理员登录页
│   ├── admin.html          # 管理控制台主页（短链生成与管理）
│   ├── index.html          # 访客门户主页
│   ├── pico.min.css        # 基础样式框架
│   └── styles.css          # 自定义精美 UI 样式
├── worker.js               # 核心边缘路由与鉴权逻辑核心
└── wrangler.toml           # Cloudflare 配置文件
```
🚀 快速部署指南
1. 环境准备
确保本地已安装 Node.js 环境，并在项目根目录下初始化依赖（如果需要）。

2. 配置文件修改
打开 wrangler.toml，配置你的 Worker 名称以及绑定你的 KV 数据库空间：
```
name = "your-short-link-name"
main = "worker.js"
compatibility_date = "2026-07-04"

[vars]
ADMIN_TOKEN = "你的超级管理员密码"

[[kv_namespaces]]
binding = "DB"
id = "你的Cloudflare_KV_ID"
```
3. 本地调试与发布
在终端（CMD / Git Bash）中执行以下指令：
本地预览测试：
```
npx wrangler dev
```
一键部署至云端：
```
npx wrangler deploy
```
🔒 安全说明
1.密码保护：请务必在 wrangler.toml 或 Cloudflare 后端的环境变量中修改 ADMIN_TOKEN，切勿使用默认密码。

2.凭证隔离：系统登录成功后会颁发带有 HttpOnly 和 SameSite=Strict 属性的安全 Cookie，防止跨站脚本攻击（XSS）与跨站请求伪造（CSRF）。

📄 开源协议
本项目基于 MIT License 协议开源，欢迎自由分发、修改及商用。
