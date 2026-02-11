# Oasis Proxy Configuration Guide

This document describes the data structures used in Oasis Proxy's `chrome.storage.local`.

## Local Storage Schema

The extension uses the following top-level keys in `chrome.storage.local`.

| Key           | Description                                                              |
| :------------ | :----------------------------------------------------------------------- |
| `config`      | **General Settings**: UI, behavior, update intervals, and sync metadata. |
| `proxies`     | **Proxy Map**: Dictionary of defined proxy servers.                      |
| `proxyGroups` | **Proxy Group Map**: Dictionary of load balancing/failover groups.       |
| `pacs`        | **PAC Map**: Dictionary of PAC script configurations.                    |
| `policies`    | **Policy Map**: Dictionary of auto-proxy policies (Rule Sets).           |
| `system`      | **Singleton**: System proxy profile definition.                          |
| `direct`      | **Singleton**: Direct connection profile definition.                     |
| `reject`      | **Singleton**: Reject (Blackhole) profile definition.                    |

---

## 1. General Config (`config`)

Stores application-wide settings and metadata.

```json
{
  "version": 1, // Integer: Config generation version (for sync)
  "updatedAt": 1678888888888, // Timestamp: Last modification time
  "activeProfileId": "direct", // String: ID of the currently active profile

  "ui": {
    "theme": "auto", // "light" | "dark" | "auto"
    "showContextMenu": false // Boolean: Show context menu items
  },

  "update": {
    "interval": 720 // Number: Minutes between background updates (-1 = Manual)
  },

  "behavior": {
    "refreshOnSwitch": false, // Boolean: Refresh tab on profile switch
    "connectionMonitoring": false // Boolean: Monitor connection health
  },

  "sync": {
    "enabled": false // Boolean: Cloud sync status (Local only)
  },

  "rulePriority": ["reject", "temp", "normal"], // Array<String>: Priority of rule evaluation

  "ipTags": {
    // Map: Custom labels for IPs
    "127.0.0.1": "Localhost"
  }
}
```

## 2. Proxies (`proxies`)

A map of proxy server definitions. Key is the unique `id`.

```json
{
  "proxy_12345": {
    "id": "proxy_12345",
    "type": "server", // Fixed type: "server"
    "label": "My Proxy",
    "color": "#137fec", // UI color (hex)
    "showInPopup": true, // Boolean: Show in popup menu
    "scheme": "socks5", // "http" | "https" | "socks4" | "socks5"
    "host": "192.168.1.1",
    "port": 1080,
    "auth": {
      // Optional
      "username": "user",
      "password": "pass"
    },
    "bypassList": [
      // Array<String>: Domains/IPs to bypass proxy
      "localhost",
      "127.0.0.1",
      "*.local"
    ],
    "overrides": {
      // Optional: Protocol-specific server overrides
      "http": {
        "scheme": "http",
        "host": "proxy-http.com",
        "port": 80,
        "authUsername": "user",
        "authPassword": "pass"
      },
      "https": { "scheme": "default" }, // "default" means use main settings
      "ftp": { "scheme": "default" }
    }
  }
}
```

## 3. Proxy Groups (`proxyGroups`)

A map of proxy groups (Failover chains). Key is the `id`.

```json
{
  "group_67890": {
    "id": "group_67890",
    "type": "group",
    "name": "Auto Select",
    "color": "#6366f1", // UI color (hex)
    "proxies": ["proxy_12345"], // Array of Proxy IDs (Failover chain)
    "fallbackEnabled": true, // Boolean: Toggle for final fallback
    "fallback": {
      "type": "direct" // "direct" | "reject"
    }
  }
}
```

## 4. PAC Scripts (`pacs`)

A map of PAC configurations.

```json
{
  "pac_abcde": {
    "id": "pac_abcde",
    "name": "My PAC", // String: Display name
    "color": "#8b5cf6", // UI color (hex)
    "showInPopup": true, // Boolean: Show in popup menu
    "mode": "remote", // "remote" | "manual"
    "url": "https://example.com/proxy.pac", // For "remote" mode
    "script": "function FindProxyForURL...", // Raw or Cached content
    "updateInterval": 720, // Number: Minutes between updates
    "lastUpdated": 1678888888888 // Timestamp: Last fetch/edit time
  }
}
```

## 5. Policies (`policies`)

A map of Auto Switch policies. Key is the `id`.

```json
{
  "policy_xyz": {
    "id": "policy_xyz",
    "type": "policy",
    "name": "Smart Mode",
    "color": "#137fec",
    "showInPopup": true, // Boolean: Show in popup menu
    "defaultProfileId": "direct", // String: Fallback profile ID

    "rules": [
      {
        "id": "rule_1", // String: Unique rule ID
        "type": "rule", // "rule" | "divider"
        "ruleType": "wildcard", // "wildcard" | "regex" | "ip" | "ruleset"
        "pattern": "*.google.com",
        "proxyId": "proxy_12345",
        "valid": true // Boolean: Toggle if rule is active
      },
      {
        "type": "divider",
        "label": "Ads" // String: Divider label
      },
      {
        "id": "rule_2",
        "type": "rule",
        "ruleType": "ruleset",
        "pattern": "https://example.com/rules.txt",
        "proxyId": "reject",
        "valid": true,
        "ruleSet": {
          // Cache for remote rulesets
          "content": "...", // String: Raw ruleset text
          "lastUpdated": 1678888888888,
          "lastFetched": 1678888888888,
          "fetchError": null
        }
      }
    ],
    "rejectRules": [] // Array<Rule>: Rules processed with highest priority
  }
}
```
