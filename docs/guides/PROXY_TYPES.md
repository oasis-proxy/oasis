# Proxy Node & PAC Configuration

This guide provides a detailed overview of the different proxy types available in Oasis and the configuration options for optimal usage.

## 1. Proxy Host (Single Node)

A Proxy Host represents a single server node, serving as the basic building block of Oasis.

### Connection Details

- **Protocol**: Support for `HTTP`, `HTTPS`, `SOCKS4`, and `SOCKS5`.
- **Address & Port**: Standard host address (domain or IP) and port number. Smart placeholders are provided for default ports (e.g., 8080 for HTTP, 1080 for SOCKS, 443 for HTTPS).

### Authentication Settings

- Standard **Username** and **Password** authentication is supported for all protocol types.
- If left blank, no authentication is applied.

### Advanced Protocol Overrides

> [!IMPORTANT]
> This feature manages complex network environments where different protocols (HTTP, HTTPS, FTP) require specific proxy nodes or settings within a single logical "Proxy Host".

- Specific overrides are available for **HTTP**, **HTTPS**, and **FTP** traffic.
- Each override allows the specification of a completely different protocol, host, port, and authentication.
- Setting to `Default` utilizes the primary connection details.

### Bypass Rules

- Requests matching these patterns bypass the proxy and connect directly.
- Supports **Wildcards** (e.g., `*.local`, `localhost`) and **IP/CIDR** ranges. See the official [Bypass Rules Reference](https://developer.chrome.com/docs/extensions/reference/api/proxy#bypass_list) for details.

### Management Features

- **Rename & Clone**: Functionality to duplicate an existing node for minor modifications.
- **Color Icons**: Custom colors can be assigned to nodes for immediate recognition in the Monitor and Popup UI.
- **Popup Control**: The "Show in Popup" toggle enables quick access to frequently used nodes while concealing others.

---

## 2. Proxy Group (Fallback Collection)

Proxy Groups facilitate the grouping of multiple Proxy Hosts into a prioritized fallback collection.

### Failover Chain Management

- Multiple nodes can be added to a group.
- **Drag-and-drop** reordering establishes the connection priority.
- Automated fallback logic switches to the next node in the list if the primary node fails.

### Termination Strategy

> [!TIP]
> The Termination Strategy determines the behavior when all nodes in the group are unreachable.

- **Direct**: Establishes a connection without a proxy if all nodes fail.
- **Reject**: Blocks the request entirely if all nodes fail, enhancing security and privacy.

---

## 3. PAC Script (JavaScript Logic)

Oasis supports fully customizable JavaScript-based Proxy Auto-Configuration (PAC) for advanced routing requirements.

### Manual Script Editing

- An integrated editor with **syntax highlighting** is available for writing `FindProxyForURL(url, host)` logic.
- This mode is suitable for complex conditional routing beyond standard wildcard capabilities.

### Remote URL Subscription

- Subscription to a PAC script hosted on a remote server.
- **Auto-fetching**: Periodic retrieval of the latest script version.
- **Local Caching**: Local storage of the script ensures functionality during remote server downtime.
- **Update Intervals**: Configurable frequency for update checks (e.g., every 1 hour, every 24 hours).

### Management Features

- **Rename & Clone**: Functionality to duplicate an existing node for minor modifications.
- **Color Icons**: Custom colors can be assigned to nodes for immediate recognition in the Monitor and Popup UI.
- **Popup Control**: The "Show in Popup" toggle enables quick access to frequently used nodes while concealing others.

---

---

## 4. Unsaved Changes Protection

Oasis implements strict navigation protection on the detail editing pages for Proxy Hosts, Proxy Groups, and PAC scripts:

- **Locked State**: If the current configuration has been modified (including name, address, port, script content, or color) and has not yet been saved, all sidebar navigation links will be locked.
- **Unlocking**: One must click the **Save** button at the top of the page to apply the configuration, or click **Reset** to revert the modifications.
- **Purpose**: Prevents the loss of unsaved data due to accidental sidebar clicks during complex proxy parameter configuration.

---

## Technical Reference

- [Auto Policy Configuration](AUTO_POLICY.md)
- [Request Monitoring](MONITORING.md)
- [Extension Configuration](EXTENSION_CONFIG.md)
