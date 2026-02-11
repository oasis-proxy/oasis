# Session Storage Guide

Oasis Proxy uses `chrome.storage.session` to store temporary data that persists only while the browser is open. This storage is cleared automatically when the browser is restarted or the extension is reloaded.

## Key Storage Items

The following keys are used in `chrome.storage.session`:

| Key               | Description                                                                       | Lifecycle                                                  |
| :---------------- | :-------------------------------------------------------------------------------- | :--------------------------------------------------------- |
| `tempRules`       | **Temporary Rules**: Array of proxy rules valid for the current session.          | Persists until browser restart.                            |
| `monitor_{tabId}` | **Tab Connection Log**: Per-tab record of domains, IPs, and connection errors.    | Cleared when the corresponding tab is closed or navigates. |
| `quickAddIntent`  | **UI Redirection Intent**: Stores domain and context for the "Quick Add" trigger. | Cleared immediately after the Popup consumes it.           |

---

## 1. Temporary Rules (`tempRules`)

Temporary rules are created via the **Quick Add** tab in the popup. They allow users to quickly proxy a domain without permanently modifying their policy.

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

### Integration

- **Background**: Injects these rules into the active Auto Policy at runtime.
- **Options**: Users can view, edit, or "Accept" (move to permanent policy) these rules in the **Temporary Rules** view.

---

## 2. Connection Monitoring (`monitor_{tabId}`)

When **Connection Monitoring** is enabled in settings, the background script logs connection details for every active tab.

**Key Format**: `monitor_123` (where `123` is the Chrome `tabId`).

```json
[
  {
    "domain": "www.google.com",
    "ip": "142.250.190.4",
    "error": "" // Empty string if successful
  },
  {
    "domain": "blocked-site.com",
    "ip": "",
    "error": "net::ERR_CONNECTION_RESET"
  }
]
```

### Integration

- **Popup**: The **Monitor** and **Quick** tabs read this data for the current active tab to display live status and suggested rules.

---

## 3. Quick Add Intent (`quickAddIntent`)

Used to coordinate UI actions between the **Side Panel** (Downloads) or **Context Menu** and the **Popup**.

```json
{
  "domain": "example.com",
  "source": "sidepanel", // "sidepanel" | "context-menu"
  "timestamp": 1678888888888
}
```

### Workflow

1. User clicks "Add Rule" in the Side Panel or Context Menu.
2. The UI/Background sets `quickAddIntent` in session storage.
3. The Popup is opened programmatically.
4. On launch, the Popup checks for a recent `quickAddIntent` and automatically switches to the **Quick** tab with the domain pre-selected.
