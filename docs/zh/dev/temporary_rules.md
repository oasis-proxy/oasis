# 临时规则存储格式 (Temporary Rules Storage Format)

临时规则存储在 `chrome.storage.session` 中，以便在扩展程序的生命周期内（例如在弹出页面和选项页面交互之间）持久存在，但在浏览器会话结束时（重启浏览器）会被清除。

## 存储键名

键名: `tempRules`

## 数据结构

`tempRules` 的值是一个规则对象数组。

```json
[
  {
    "id": "rule_1707123456789",
    "type": "rule",
    "ruleType": "wildcard", // "wildcard" | "regex" | "ip" | "ruleset"
    "pattern": "*.example.com",
    "proxyId": "proxy_1",
    "valid": true,
    "timestamp": 1707123456789 // 可选的创建时间
  }
]
```

## 字段说明

- **id**: 唯一的标识符字符串。
- **type**: 字符串，固定为 "rule"。
- **ruleType**: 字符串枚举：`wildcard` (通配符), `regex` (正则表达式), `ip` (IP/CIDR), `ruleset` (规则集)。
- **pattern**: 字符串，匹配模式。
- **proxyId**: 字符串，要使用的代理配置文件的 ID。
- **valid**: 布尔值，如果规则处于活动状态（对应复选框状态），则为 true。
- **ruleSet**: 对象（可选），如果 `ruleType` 为 `ruleset`，则包含内容/获取状态。

## 操作

- **接受 (Accept)**: 将规则移动到永久策略中（通常会提示用户选择哪个策略，或者默认为“自动策略”）。
- **删除 (Delete)**: 从临时列表中移除该规则。
- **全部清除 (Clear All)**: 移除所有临时规则。
- **合并规则 (Merge Rules)**: 批量接受规则并将其合并到某个策略中。
