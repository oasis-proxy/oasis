# Monitoring & Analytics

Oasis provides transparency into network traffic, detailing which requests are proxied or connected directly, along with the policy routing logic.

## 1. Real-time Request Monitor Page

The Request Monitor is a full-screen analysis tool providing a live feed of browser requests handled by Oasis.

### Log Details

The monitor displays the following for every request:

- **Method & Status**: (e.g., GET 200, POST 404).
- **Domain & IP**: Target hostname and the actual request service IP address (if a proxy is used, this may be the proxy server address).
- **Duration**: Total connection time.
- **Proxy Node**: The specific Proxy Host or Group utilized.
- **Rule Source**: Identification of the triggering rule (Wildcard, Regex, or RuleSet).

### Advanced Filtering & Management

- **Tab Filter**: Filter traffic for a specific browser tab.
- **Search Query**: Real-time log filtering by domain, IP, or proxy name.
- **Status Filter**: Filter failed requests (errors/timeouts) for connectivity debugging.
- **One-Click Clear**: Functionality to clear all logged requests or isolated tab history.

---

## 2. One-Click Batch Rule Generation

The monitor is more than just an analysis tool—it is an engine for efficient configuration. For request-heavy websites, the "Add Tab Domains" feature provides a rapid setup path.

### Workflow

1. Select a specific **browser tab** from the left sidebar.
2. Click the **Add Tab Domains** icon at the top of the request list.
3. Oasis will automatically extract and deduplicate all unique domains requested by that tab.

### Smart Merging

> [!TIP]
> Batch addition leverages the Oasis "Smart Merge" engine, which automatically suggests grouping multiple subdomains into wildcard patterns (e.g., merging `a.com` and `b.a.com` into `*.a.com`) to keep your policy rules concise.

---

## 3. Connection Monitor (Popup)

The **Popup** provides a "Mini Monitor" for rapid status checks without page navigation.

- **Active Tracking**: Lists all domains and actual request IP addresses for the active tab (merged and deduplicated by domain).
- **Error Alerts**: Indicators for site request error messages.

_Note: Real-time tracking can be enabled in [Extension Configuration](EXTENSION_CONFIG.md)._

---

## Technical Reference

- [Interactive Features](INTERACTIVE.md)
- [Extension Configuration](EXTENSION_CONFIG.md)
