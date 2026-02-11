# Extension Configuration

Global behavioral and interface customization options are centralized here to ensure a consistent browsing experience.

## 1. UI Customization

Oasis features a modern, responsive interface with several appearance options.

### Theme Engine

- **Light Mode**: High-contrast white interface.
- **Dark Mode**: Slate-dark interface.
- **System (Auto)**: Automated matching of the operating system's theme settings.

### Context Menu

- **Show Context Menu**: Toggle to enable or disable Oasis-specific items in the browser's right-click menu. (Reference: [Interactive Features](INTERACTIVE.md))

---

## 2. Browser Behavior & Routing

Manage the interaction logic between Oasis and browser tabs or network requests.

### Refresh on Switch

> [!TIP]
> Enabling "Refresh on Switch" triggers an automated reload of the active tab upon profile changes, ensuring immediate application of new routing logic.

### Connection Monitoring

- **Enable Monitoring**: Real-time tracking of domains, IPs, and connection durations for network requests. (Reference: [Monitoring & Analytics](MONITORING.md))

### IP Tags

> [!TIP]
> IP Tags allow the assignment of descriptive labels to frequently accessed server nodes.

- Custom labels (e.g., "Main API", "CDN Node 1") can be configured for any IP address.
- Labels are visible in the full Monitor and Mini-view (Popup) for rapid server identification.

### Reject Address Configuration

- Requests blocked by "Reject" rules or policies are intercepted internally; the server will not receive these requests. (Implementation: Redirecting requests to a port where no proxy service exists).
- Defaults to `127.0.0.1:65535`. If this port is occupied by other local services, it can be changed to any port without an active service.

### Global Rule Priority Weighting

- Enables adjustments to the evaluation sequence of major rule categories.
- Default priority: **Reject > Temporary > Normal**.

---

## 3. Maintenance & Updates

Automated management of remote resources ensures data remains current.

### Global Update Frequency

- Configurable check intervals for all Subscriptions (PACs and RuleSets), ranging from 15 minutes to 24 hours.

### Cache Management

- Display of "Last Updated" timestamps for all remote resources.
- Manual clearing of local caches is available for troubleshooting.

---

## Technical Reference

- [Data Management](DATA_SYNC.md)
- [Proxy Types](PROXY_TYPES.md)
