# Oasis Proxy 配置指南

本文档描述了 Oasis Proxy 扩展中使用的配置结构。配置存储在 `chrome.storage.local`（持久化）和 `chrome.storage.session`（临时）中。

## 存储键值 (Storage Keys)

- `proxyConfig`: 主配置对象（持久化）。
- `tempRules`: 仅在当前浏览器会话中有效的临时规则数组（临时）。

## 配置对象结构

配置对象 (`config`) 包含以下顶层属性：

### 1. `mode`

定义当前活动的代理模式。

- `'fixed'`: 使用单一的固定代理服务器。
- `'pac'`: 使用 PAC 脚本 URL。
- `'auto'`: 使用自动规则切换（内部生成 PAC）。

### 2. `proxies`

已定义代理情景模式的映射表。键是唯一的配置 ID。
每个情景模式对象包含：

- `id` (string): 唯一标识符。
- `type` (string): 代理类型 (`'direct'`, `'system'`, `'reject'`, `'server'`)。
- `label` (string): 显示名称。
- `scheme` (string, optional): 协议 (`http`, `https`, `socks4`, `socks5`)。仅适用于 `server` 类型。
- `host` (string, optional): 服务器 IP 或主机名。
- `port` (number, optional): 服务器端口。
- `auth` (object, optional): 用户名/密码（如果适用）。

**特殊情景模式:**

- `direct`: 直接连接。
- `system`: 使用系统代理设置。
- `reject`: 阻断请求 (黑洞)。
  - `host`: 默认 `127.0.0.1` (可配置)。
  - `port`: 默认 `65535` (可配置)。

### 3. `fixed`

"固定代理" 模式的配置。

- `activeProxyId` (string): 要使用的代理情景模式 ID。

### 4. `pac`

"PAC 脚本" 模式的配置。

- `url` (string): PAC 文件的 URL。

### 5. `auto`

"自动切换" 模式的配置。

#### 属性:

- `defaultProfileId` (string): 如果没有规则匹配，默认使用的代理情景模式 ID。

#### 规则列表 (按优先级排序):

优先级由生成的 PAC 脚本中的顺序决定：

**0. 临时会话规则 (`tempRules`)**

- 存储在 `chrome.storage.session` 中。
- 优先级最高。
- 结构: 规则对象数组。

**1. 自定义拒绝规则 (`rejectRules`)**

- 用户定义的阻断规则。
- 路由到 `reject` 情景模式 (黑洞)。

**2. 自定义代理规则 (`proxyRules`)**

- 用户定义的切换规则。
- 路由到任何已定义的代理情景模式。

#### 规则对象结构:

- `id` (string): 唯一规则 ID。
- `type` (string): 规则匹配类型。
  - `'domainSuffix'`: 匹配域名后缀 (例如: `google.com`)。
  - `'domainKeyword'`: 匹配主机名中的关键字 (例如: `google`)。
  - `'ipCIDR'`: 匹配 IP 范围 (例如: `192.168.0.0/16`)。
  - `'wildcard'`: 通配符匹配 (例如: `*.example.com`)。
  - `'regex'`: 正则表达式。
- `pattern` (string): 要匹配的值。
- `profileId` (string): 如果匹配，要使用的代理情景模式 ID。

#### 外部订阅 (待实现):

- `rejectRuleSets`: 外部阻断列表 (例如: AdBlock 列表)。
- `proxyRuleSets`: 外部代理列表 (例如: GFWList)。

### 6. `ui`

全局界面设置。

- `theme` (string): `'light'` (浅色), `'dark'` (深色), 或 `'auto'` (自动跟随系统) (默认: `'auto'`)。

### 7. `update`

规则更新设置。

- `interval` (number): 更新检查间隔（分钟）。
  - `0`: 仅手动更新。
  - `15`: 15 分钟。
  - `60`: 1 小时。
  - `720`: 12 小时。
  - `1440`: 24 小时。

### 8. `behavior`

浏览器行为设置。

- `refreshOnSwitch` (boolean): 切换代理模式或情景模式时是否刷新当前活动标签页 (默认 `false`)。

### 9. `sync`

云同步设置。

- `enabled` (boolean): 是否将配置同步到 `chrome.storage.sync` (默认 `false`)。

### 10. `ipTags`

IP 地址到自定义名称（标签）的映射。

- Key: IP 地址 (例如: `'127.0.0.1'`)。
- Value: 标签名称 (例如: `'Localhost'`)。
