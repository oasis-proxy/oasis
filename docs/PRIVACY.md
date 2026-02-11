# Privacy Policy for Oasis Proxy

**Last Updated:** February 11, 2026

## English

### Introduction

Oasis Proxy ("we", "us", or "our") respects your privacy. This Privacy Policy explains how Oasis Proxy collects, uses, and discloses information about you when you use our browser extension.

**Oasis Proxy is designed to be privacy-first. We do not collect, store, or transmit your personal data, browsing history, or traffic data to our own servers.** All data processing happens locally on your device or via features provided directly by the browser (like Chrome Sync).

### Data Collection and Usage

#### 1. User Settings and Configurations

- **Data:** We store the configurations you create, including proxy server details (IP, port, credentials), PAC scripts, and routing rules.
- **Storage:** This data is stored locally on your device using the browser's storage API (`chrome.storage.local`).
- **Sync:** If you enable the "Chrome Sync" feature within the extension, your settings (excluding sensitive data like passwords, unless you explicitly configure otherwise) may be synchronized across your devices using your logged-in Google Account. This data is handled by Google's infrastructure and is subject to [Google's Privacy Policy](https://policies.google.com/privacy).

#### 2. Network Activity and Browsing Data

- **Functionality:** To provide proxy services, the extension requires permission to access and modify your network requests (`webRequest`, `proxy`, `webNavigation`, `tabs`).
- **Processing:** The extension analyzes URLs and request details **locally** on your device to determine which proxy server to use based on your configured rules.
- **No Remote Logging:** We do not send your browsing history, visited URLs, or traffic data to any external servers.
- **Connection Monitoring:** If you enable the "Connection Monitoring" feature, recent request logs are stored temporarily in your browser's session memory (`chrome.storage.session`) for display in the monitoring dashboard. This data is cleared when you close the browser and is never transmitted elsewhere.

#### 3. User-Configured Remote Resources

- **PAC Scripts & RuleSets:** If you configure the extension to fetch PAC scripts or RuleSets from remote URLs, the extension will periodically make HTTP/HTTPS requests to those specific URLs to download updates. These requests are made directly from your browser to the URLs you specified.

### Permissions

The extension requests the following permissions to function:

- **webRequest / webRequestAuthProvider:** To intercept network requests and handle proxy authentication.
- **proxy:** To control the browser's proxy settings.
- **tabs / webNavigation:** To obtain tab information for rule matching and monitoring.
- **storage / unlimitedStorage:** To store your proxy configurations locally.
- **alarms:** To schedule periodic updates for your subscribed RuleSets or PAC scripts.
- **<all_urls>:** Required to intercept and proxy traffic for all websites as per your configuration.

### Third-Party Services

- **Google Chrome:** We rely on the underlying browser platform for storage and synchronization.
- **User-Defined Servers:** Your traffic is routed through the proxy servers you configure. You should ensure you trust the proxy providers you use, as they may have visibility into your traffic.

### Changes to This Policy

We may update this Privacy Policy from time to time. If we make material changes, we will notify you by updating the date at the top of the policy and potentially through a notice within the extension.

### Contact Us

If you have any questions about this Privacy Policy, please contact us via our GitHub repository or the support email listed on the Chrome Web Store.

---

## 中文 (Chinese)

### 隐私政策

**最后更新日期：** 2026年2月11日

### 简介

Oasis Proxy（“我们”）非常重视您的隐私。本隐私政策旨在说明我们在您使用我们的浏览器扩展程序时如何收集、使用和披露您的信息。

**Oasis Proxy 的设计初衷是隐私至上。我们不会收集、存储或向我们自己的服务器传输您的个人数据、浏览历史或流量数据。** 所有数据处理均在您的设备本地进行，或通过浏览器提供的功能（如 Chrome 同步）进行。

### 数据收集与使用

#### 1. 用户设置与配置

- **数据：** 我们存储您创建的配置信息，包括代理服务器详情（IP、端口、凭据）、PAC 脚本和路由规则。
- **存储：** 这些数据使用浏览器的存储 API（`chrome.storage.local`）存储在您的本地设备上。
- **同步：** 如果您在扩展程序中启用了“Chrome Sync”功能，您的设置（不包括密码等敏感数据，除非您另有配置）可能会通过您登录的 Google 账号在您的设备间同步。此数据由 Google 的基础设施处理，并受 [Google 隐私政策](https://policies.google.com/privacy) 约束。

#### 2. 网络活动与浏览数据

- **功能：** 为了提供代理服务，扩展程序需要权限来访问和修改您的网络请求（`webRequest`、`proxy`、`webNavigation`、`tabs`）。
- **处理：** 扩展程序会在您的设备上**本地**分析 URL 和请求详情，以根据您配置的规则决定使用哪个代理服务器。
- **无远程日志：** 我们不会将您的浏览历史、访问的 URL 或流量数据发送到任何外部服务器。
- **连接监控：** 如果您启用“连接监控”功能，最近的请求日志将临时存储在浏览器的会话内存（`chrome.storage.session`）中，以便在监控仪表板中显示。此数据在您关闭浏览器时会被清除，且绝不会传输到其他地方。

#### 3. 用户配置的远程资源

- **PAC 脚本与规则集（RuleSets）：** 如果您配置扩展程序从远程 URL 获取 PAC 脚本或规则集，扩展程序将定期向这些特定 URL 发起 HTTP/HTTPS 请求以下载更新。这些请求是直接从您的浏览器向您指定的 URL 发起的。

### 权限说明

本扩展程序申请以下权限以正常运行：

- **webRequest / webRequestAuthProvider：** 用于拦截网络请求并处理代理身份验证。
- **proxy：** 用于控制浏览器的代理设置。
- **tabs / webNavigation：** 用于获取标签页信息以进行规则匹配和监控。
- **storage / unlimitedStorage：** 用于在本地存储您的代理配置。
- **alarms：** 用于为您订阅的规则集或 PAC 脚本安排定期更新。
- **<all_urls>：** 需要此权限以拦截和代理所有网站的流量（根据您的配置）。

### 第三方服务

- **Google Chrome：** 我们依赖底层浏览器平台进行存储和同步。
- **用户定义的服务器：** 您的流量将通过您配置的代理服务器进行路由。您应确保您信任所使用的代理提供商，因为他们可能可见您的流量。

### 政策变更

我们可能会不时更新本隐私政策。如果我们做出重大变更，我们将更新政策顶部的日期，并可能通过扩展程序内的通知告知您。

### 联系我们

如果您对本隐私政策有任何疑问，请通过我们的 GitHub 仓库或 Chrome 应用商店上列出的支持电子邮件与我们联系。
