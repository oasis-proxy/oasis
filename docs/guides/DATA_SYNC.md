# Data Management & Backup

Oasis utilizes Chrome's native cloud infrastructure for secure, portable, and synchronized configuration management.

## 1. Chrome Cloud Sync

**Chrome Sync Storage** is used for the automated synchronization of settings, including profiles, policies, and global configurations across devices.

### Conflict Resolution

> [!IMPORTANT]
> The "Sync Conflict" modal appears when local and cloud versions diverge.

- **Pull from Cloud**: Overwrites local settings with the cloud version.
- **Push to Cloud**: Overwrites the cloud version with current local settings.
- **Compare**: Provides a breakdown of modification timestamps, rule counts, and profile counts to assist in selection.

---

## 2. Backup & Recovery

JSON-based import and export tools are available for manual migrations and offline backups.

### Full Configuration Export

- Generation of a single `.json` file containing the entire Oasis environment.
- This includes Proxy Hosts, Groups, PACs, Auto Policies, and General Settings.

### JSON Import

- **Validation**: Automated verification of incoming JSON files for compatibility and security.
- **Safe Import**: The import process replaces the current configuration; an export of current settings is recommended prior to importing.

### Data Maintenance

- **Clear Local**: Resetting Oasis to its default state on the current device.
- **Clear Sync**: Deletion of Oasis data stored in Chrome Cloud storage.
- _Manual confirmation is required for these actions._

---

## Technical Reference

- [Proxy Node Configuration](PROXY_TYPES.md)
- [Auto Policy Routing](AUTO_POLICY.md)
- [Extension Configuration](EXTENSION_CONFIG.md)
