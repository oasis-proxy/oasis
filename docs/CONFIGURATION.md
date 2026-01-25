# Oasis Proxy Configuration Guide

This document describes the configuration structure used in the Oasis Proxy extension. The configuration is stored in `chrome.storage.local` (persistent) and `chrome.storage.session` (temporary).

## Storage Keys

- `proxyConfig`: The main configuration object (Persistent).
- `tempRules`: Array of temporary rules valid only for the current browser session (Session).

## Configuration Object Structure

The configuration object (`config`) has the following top-level properties:

### 1. `mode`

Defines the current active proxy mode.

- `'fixed'`: Use a single fixed proxy server.
- `'pac'`: Use a PAC script URL.
- `'auto'`: Use automatic rule-based switching (PAC generated internally).

### 2. `proxies`

A map of defined proxy profiles. Keys are unique profile IDs.
Each profile object contains:

- `id` (string): Unique identifier.
- `type` (string): Proxy type (`'direct'`, `'system'`, `'reject'`, `'server'`).
- `label` (string): Display name.
- `scheme` (string, optional): Protocol (`http`, `https`, `socks4`, `socks5`). Only for `server` type.
- `host` (string, optional): Server IP or hostname.
- `port` (number, optional): Server port.
- `auth` (object, optional): Username/password (if applicable).

**Special Profiles:**

- `direct`: Direct connection.
- `system`: Use system proxy settings.
- `reject`: Blocks the request (Blackhole).
  - `host`: Default `127.0.0.1` (Configurable).
  - `port`: Default `65535` (Configurable).

### 3. `fixed`

Configuration for "Fixed Server" mode.

- `activeProxyId` (string): The ID of the proxy profile to use.

### 4. `pac`

Configuration for "PAC Script" mode.

- `url` (string): The URL of the PAC file.

### 5. `auto`

Configuration for "Auto Switch" mode.

#### Properties:

- `defaultProfileId` (string): The default proxy profile ID to use if no rules match.

#### Rule Lists (In Priority Order):

priority is determined by the order in the generated PAC script:

**0. Temporary Session Rules (`tempRules`)**

- Stored in `chrome.storage.session`.
- Highest priority.
- Structure: Array of Rule objects.

**1. Custom Reject Rules (`rejectRules`)**

- User-defined blocking rules.
- Route to the `reject` profile (blackhole).

**2. Custom Proxy Rules (`proxyRules`)**

- User-defined switching rules.
- Route to any defined proxy profile.

#### Rule Object Structure:

- `id` (string): Unique rule ID.
- `type` (string): Rule match type.
  - `'domainSuffix'`: Matches domain suffix (e.g., `google.com`).
  - `'domainKeyword'`: Matches keyword in host (e.g., `google`).
  - `'ipCIDR'`: Matches IP range (e.g., `192.168.0.0/16`).
  - `'wildcard'`: Glob matching (e.g., `*.example.com`).
  - `'regex'`: Regular expression.
- `pattern` (string): The value to match against.
- `profileId` (string): The ID of the proxy profile to use if matched.

#### External Subscriptions (Pending Implementation):

- `rejectRuleSets`: List of external blocking lists (e.g., AdBlock lists).
- `proxyRuleSets`: List of external proxy lists (e.g., GFWList).

### 6. `ui`

Global interface settings.

- `theme` (string): `'light'`, `'dark'`, or `'auto'` (default).

### 7. `update`

Rule update settings.

- `interval` (number): Update check interval in minutes.
  - `0`: Manual update only.
  - `15`: 15 minutes.
  - `60`: 1 hour.
  - `720`: 12 hours.
  - `1440`: 24 hours.

### 8. `behavior`

Browser behavior settings.

- `refreshOnSwitch` (boolean): Whether to refresh the current active tab when switching proxy modes or profiles (default `false`).

### 9. `sync`

Cloud synchronization settings.

- `enabled` (boolean): Whether to sync configuration to `chrome.storage.sync` (default `false`).

### 10. `ipTags`

Map of IP addresses to custom names (Tags).

- Key: IP Address (e.g., `'127.0.0.1'`).
- Value: Tag Name (e.g., `'Localhost'`).
