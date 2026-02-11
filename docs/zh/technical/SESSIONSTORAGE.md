# 会话存储指南 (Session Storage Guide)

Oasis 代理使用 `chrome.storage.session` 来存储仅在浏览器打开期间持久存在的临时数据。当浏览器重启或扩展程序重新加载时，这些存储会自动清除。

## 关键存储项

`chrome.storage.session` 中使用了以下键：

| 键名              | 描述                                                      | 生命周期                            |
| :---------------- | :-------------------------------------------------------- | :---------------------------------- |
| `tempRules`       | **临时规则**: 当前会话有效的代理规则数组。                | 持久保留直至浏览器重启。            |
| `monitor_{tabId}` | **标签页连接日志**: 每个标签页的域名、IP 和连接错误记录。 | 当对应的标签页关闭或导航时清除。    |
| `quickAddIntent`  | **UI 重定向意图**: 存储“快速添加”触发器的域名和上下文。   | 在弹出页面 (Popup) 消费后立即清除。 |

---

## 1. 临时规则 (`tempRules`)

临时规则通过弹出页面中的 **快速添加 (Quick Add)** 标签页创建。它们允许用户快速代理一个域名，而无需永久修改其策略。

```json
[
  {
    "id": "rule_quick_1678888888888_abc12",
    "type": "rule",
    "ruleType": "wildcard", // "wildcard" | "regex" | "ip" | "ruleset"
    "pattern": "*.example.com",
    "proxyId": "proxy_12345",
    "valid": true
  }
]
```

### 集成

- **后台 (Background)**: 在运行时将这些规则注入到活动的自动策略中。
- **选项 (Options)**: 用户可以在 **临时规则** 视图中查看、编辑或“接受”（移至永久策略）这些规则。

---

## 2. 连接监控 (`monitor_{tabId}`)

当设置中启用了 **连接监控** 时，后台脚本会记录每个活动标签页的连接详情。

**键格式**: `monitor_123`（其中 `123` 是 Chrome 的 `tabId`）。

```json
[
  {
    "domain": "www.google.com",
    "ip": "142.250.190.4",
    "error": "" // 成功时为空字符串
  },
  {
    "domain": "blocked-site.com",
    "ip": "",
    "error": "net::ERR_CONNECTION_RESET"
  }
]
```

### 集成

- **弹出页面 (Popup)**: **监控 (Monitor)** 和 **快速 (Quick)** 标签页读取当前活动标签页的这些数据，以显示实时状态和建议规则。

---

## 3. 快速添加意图 (`quickAddIntent`)

用于协调 **侧边面板 (Side Panel)** (下载内容) 或 **右键菜单** 与 **弹出页面 (Popup)** 之间的 UI 操作。

```json
{
  "domain": "example.com",
  "source": "sidepanel", // "sidepanel" | "context-menu"
  "timestamp": 1678888888888
}
```

### 工作流

1. 用户在侧边面板或右键菜单中点击“添加规则”。
2. UI/后台在会话存储中设置 `quickAddIntent`。
3. 以编程方式打开弹出页面。
4. 启动时，弹出页面会检查最近的 `quickAddIntent`，并自动切换到 **快速** 标签页，并预先选中该域名。
