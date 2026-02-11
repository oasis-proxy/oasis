# Oasis - 智能浏览器代理管理器

[**English**](README.md) | [中文]

Oasis 是一款现代、高性能的浏览器扩展，旨在通过高级路由、监控和同步功能，为您提供对网络流量的完全控制。

---

## 功能特性

- **协议支持**: 支持 HTTP, HTTPS, SOCKS4 和 SOCKS5。
- **故障转移链**: 自动化的回退逻辑，确保高可用性。
- **智能规则合并**: 对路由规则进行智能优化与收缩。
- **未保存更改保护**: 严格的导航守卫，防止编辑过程中数据丢失。
- **环境感知**: 直接从页面、下载任务或监控日志中添加规则。
- **跨设备同步**: 通过 Chrome 云轻松同步您的整个配置环境。

---

## 文档指南

通过我们的详细指南探索 Oasis 的功能和配置选项：

- [**代理节点与 PAC 配置**](docs/zh/guides/PROXY_TYPES.md) - 了解代理服务器、代理组（故障转移）和 PAC 脚本。
- [**自动策略与路由**](docs/zh/guides/AUTO_POLICY.md) - 如何使用通配符、正则表达式和规则集路由流量。
- [**临时规则**](docs/zh/guides/TEMPORARY_RULES.md) - 管理会话级规则并将其“转正”为持久规则。
- [**监控与分析**](docs/zh/guides/MONITORING.md) - 实时请求监控、匹配调试和 IP 标签。
- [**交互功能**](docs/zh/guides/INTERACTIVE.md) - 使用弹出页面、侧边栏、快速添加和右键菜单。
- [**扩展配置**](docs/zh/guides/EXTENSION_CONFIG.md) - 主题自定义、浏览器行为和全局规则。
- [**数据管理与备份**](docs/zh/guides/DATA_SYNC.md) - Chrome 云同步、备份和冲突解决。

## Wiki

[Wiki](https://github.com/oasis-proxy/oasis/wiki)

---

## 项目参考

本项目站在巨人的肩膀上，使用了以下开源技术：

- **[Vue.js](https://vuejs.org/)**: 渐进式 JavaScript 框架。
- **[Bootstrap 5](https://getbootstrap.com/)**: 强大、可扩展且功能丰富的前端工具包。
- **[Bootstrap Icons](https://icons.getbootstrap.com/)**: Bootstrap 的官方开源 SVG 图标库。
- **[Vite](https://vitejs.dev/)**: 下一代前端构建工具。
- **[CRXJS](https://crxjs.dev/)**: 专为 Chrome 扩展设计的 Vite 插件。
- **[Popper](https://popper.js.org/)**: 提示框与弹出框定位引擎。

---

## 隐私政策

我们非常重视您的隐私。请阅读我们的 [Privacy Policy](docs/PRIVACY.md) 了解我们如何处理您的数据。
