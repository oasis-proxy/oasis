# Oasis 代理配置指南

本说明文档描述了 Oasis 代理在 `chrome.storage.local` 中使用的数据结构。

## 本地存储架构 (Local Storage Schema)

扩展程序在 `chrome.storage.local` 中使用以下顶级键。

| 键名          | 描述                                           |
| :------------ | :--------------------------------------------- |
| `config`      | **常规设置**: UI、行为、更新间隔和同步元数据。 |
| `proxies`     | **代理映射**: 已定义的代理服务器字典。         |
| `proxyGroups` | **代理组映射**: 负载均衡/故障转移组字典。      |
| `pacs`        | **PAC 映射**: PAC 脚本配置字典。               |
| `policies`    | **策略映射**: 自动代理策略（规则集）字典。     |
| `system`      | **单例**: 系统代理配置文件定义。               |
| `direct`      | **单例**: 直接连接配置文件定义。               |
| `reject`      | **单例**: 拒绝（黑洞）配置文件定义。           |

---

## 1. 常规配置 (`config`)

存储应用程序范围的设置和元数据。

```json
{
  "version": 1, // 整数：配置生成版本（用于同步）
  "updatedAt": 1678888888888, // 时间戳：最后修改时间
  "activeProfileId": "direct", // 字符串：当前活动配置文件的 ID

  "ui": {
    "theme": "auto", // "light" | "dark" | "auto"
    "showContextMenu": false // 布尔值：是否显示右键菜单项
  },

  "update": {
    "interval": 720 // 数字：后台更新间隔分钟数（-1 = 手动）
  },

  "behavior": {
    "refreshOnSwitch": false, // 布尔值：切换配置文件时是否刷新标签页
    "connectionMonitoring": false // 布尔值：是否监控连接健康状况
  },

  "sync": {
    "enabled": false // 布尔值：云同步状态（仅限本地）
  },

  "rulePriority": ["reject", "temp", "normal"], // 字符串数组：规则评估优先级

  "ipTags": {
    // 映射：IP 的自定义标签
    "127.0.0.1": "Localhost"
  }
}
```

## 2. 代理服务器 (`proxies`)

代理服务器定义映射。键是唯一的 `id`。

```json
{
  "proxy_12345": {
    "id": "proxy_12345",
    "type": "server", // 固定类型："server"
    "label": "我的代理",
    "color": "#137fec", // UI 颜色 (十六进制)
    "showInPopup": true, // 布尔值：是否在弹出菜单中显示
    "scheme": "socks5", // "http" | "https" | "socks4" | "socks5"
    "host": "192.168.1.1",
    "port": 1080,
    "auth": {
      // 可选
      "username": "user",
      "password": "pass"
    },
    "bypassList": [
      // 字符串数组：绕过代理的域名/IP
      "localhost",
      "127.0.0.1",
      "*.local"
    ],
    "overrides": {
      // 可选：特定协议的服务器覆盖
      "http": {
        "scheme": "http",
        "host": "proxy-http.com",
        "port": 80,
        "authUsername": "user",
        "authPassword": "pass"
      },
      "https": { "scheme": "default" }, // "default" 表示使用主设置
      "ftp": { "scheme": "default" }
    }
  }
}
```

## 3. 代理组 (`proxyGroups`)

代理组（故障转移链）映射。键是 `id`。

```json
{
  "group_67890": {
    "id": "group_67890",
    "type": "group",
    "name": "自动选择",
    "color": "#6366f1", // UI 颜色 (十六进制)
    "proxies": ["proxy_12345"], // 代理 ID 数组（故障转移链）
    "fallbackEnabled": true, // 布尔值：最终回退开关
    "fallback": {
      "type": "direct" // "direct" | "reject"
    }
  }
}
```

## 4. PAC 脚本 (`pacs`)

PAC 配置映射。

```json
{
  "pac_abcde": {
    "id": "pac_abcde",
    "name": "我的 PAC", // 字符串：显示名称
    "color": "#8b5cf6", // UI 颜色 (十六进制)
    "showInPopup": true, // 布尔值：是否在弹出菜单中显示
    "mode": "remote", // "remote" | "manual"
    "url": "https://example.com/proxy.pac", // 用于 "remote" 模式
    "script": "function FindProxyForURL...", // 原始或缓存的内容
    "updateInterval": 720, // 数字：更新间隔分钟数
    "lastUpdated": 1678888888888 // 时间戳：上次获取/编辑时间
  }
}
```

## 5. 策略 (`policies`)

自动切换策略映射。键是 `id`。

```json
{
  "policy_xyz": {
    "id": "policy_xyz",
    "type": "policy",
    "name": "智能模式",
    "color": "#137fec",
    "showInPopup": true, // 布尔值：是否在弹出菜单中显示
    "defaultProfileId": "direct", // 字符串：回退配置文件 ID

    "rules": [
      {
        "id": "rule_1", // 字符串：唯一规则 ID
        "type": "rule", // "rule" | "divider"
        "ruleType": "wildcard", // "wildcard" | "regex" | "ip" | "ruleset"
        "pattern": "*.google.com",
        "proxyId": "proxy_12345",
        "valid": true // 布尔值：规则是否生效
      },
      {
        "type": "divider",
        "label": "广告" // 字符串：分隔符标签
      },
      {
        "id": "rule_2",
        "type": "rule",
        "ruleType": "ruleset",
        "pattern": "https://example.com/rules.txt",
        "proxyId": "reject",
        "valid": true,
        "ruleSet": {
          // 远程规则集缓存
          "content": "...", // 字符串：原始规则集文本
          "lastUpdated": 1678888888888,
          "lastFetched": 1678888888888,
          "fetchError": null
        }
      }
    ],
    "rejectRules": [] // 规则数组：以最高优先级处理的规则
  }
}
```
