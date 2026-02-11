# Interactive Features

Oasis is designed for high accessibility, enabling network setting management without disruption to standard browsing workflows.

## 1. Extension Popup

Immediate access to proxy settings is available through the extension icon (Popup).

- **One-click Profile Switching**: Options for toggling between Direct, System, Proxy Hosts, PACs, and Auto Policies.
- **Fast Navigation**: Shortcuts to the Settings page, Request Monitor, and Quick Add console.

---

## 2. Dynamic Sidepanel (Download Management)

The Sidepanel provides a specialized interface for managing browser downloads.

### Solving Download Failures

> [!IMPORTANT]
> A common issue for users is downloads failing or experiencing limited speeds because the source domain lacks an appropriate proxy rule. The Sidepanel provides a solution for this scenario.

- **Integrated History**: View all browser downloads from the last 7 days.
- **Dynamic Rule Addition**: Use the "Add Rule" icon next to any download item to instantly delegate its domain to a proxy via Quick Add.
- **Actionable Retries**: After adding a rule, use the **Re-download** button to restart the task with the new proxy settings applied.

### Additional Actions

- **Show in Folder**: Direct access to the local file location.
- **Copy Link**: Extract the original download URL for external use.
- **Search & Filter**: Rapidly locate specific tasks by filename or domain.

---

## 3. Quick Add Console

The Quick Add console facilitates the inclusion of new rules into policies during active browsing sessions.

### Smart Suggestions

- **Failed Domains**: Automatically identifies blocked or erroneous requests when the console is opened.
- **Wildcard Auto-discovery**: Automated suggestion of root wildcard patterns (e.g., suggesting `.google.com` instead of just `api.google.com`).

### Destination Options

- **Current Policy**: Permanent rule addition to the active Auto Policy.
- **Session Rules (Temporary)**: Rule addition for the current browsing session only. See the [Temporary Rules Guide](TEMPORARY_RULES.md).

---

## 4. Context Menu Integration

Oasis integrates into the browser's right-click menu for accelerated interaction.

- **Add to Oasis**: Right-clicking on a page, link, or highlighted text displays the "Add domain to Oasis" option.
- **Instant Delegation**: Selection of this option opens the Quick Add interface with the relevant domain pre-filled.

---

## 5. Status Indicators

The extension icon provides immediate feedback regarding the active proxy state.

- **Badge Text**: Displays a short identifier for the active profile (e.g., "AUTO", "HK1", "DIR").
- **Badge Color**: Matched to the custom color assigned to the profile in settings.
- **Visual Feedback**: Dynamic icon color changes occur during profile shifts or traffic routing.

---

## Technical Reference

- [Data Management](DATA_SYNC.md)
- [Extension Configuration](EXTENSION_CONFIG.md)
