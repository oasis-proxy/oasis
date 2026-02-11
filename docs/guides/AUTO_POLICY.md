# Auto Policy (Rule-Based Routing)

Auto Policies constitute the core of the Oasis routing engine, allowing the definition of rules that determine proxy assignment based on request URL or IP.

## 1. Entry Points & Navigation

### Creating a Policy

- In the Options page **Sidebar**, click the **(+)** icon next to the "Policy Rules" header to create a new Auto Policy.

### Managing Existing Policies

- Once a specific policy is selected in the sidebar, the following actions are available in the **Header** of the detail view:
  - **Popup Visibility**: Use the "Show in Popup" toggle in the header to control whether this policy appears in the extension's Popup menu.
  - **More Actions**: Click the three dots (Action Menu) icon on the far right to access:
    - **Rename/Clone/Delete**: Modify the basic metadata or lifecycle of the policy.
    - **Export PAC**: Export the current policy as a static script.
    - **Merge Policy**: Import rules from another policy into the current one (supports conflict resolution via "Ignore" or "Overwrite").

---

## 2. Rule Types & Matching Patterns

Oasis supports four primary rule types:

- **Wildcard**: Flexible domain-based pattern matching.
  - `google.com`: Exact match for the `google.com` domain.
  - `.google.com`: Matches `google.com` and **all subdomains** (e.g., `www.google.com`).
  - `*.google.com`: Identical to `.google.com`, matching the domain and **all subdomains**.
  - `**.google.com`: Matches **subdomains only** (e.g., `www.google.com`), excluding the root `google.com`.
  - `*google*`: Fuzzy matching (e.g., matching `google.com`, `google.com.hk`, `mygoogle.net`).
- **Regex**: Advanced pattern matching for complex scenarios.
- **IP & CIDR**: Matching based on destination IP or network ranges (e.g., `192.168.1.0/24`).
- **RuleSet Subscriptions**: Support for external rule lists (e.g., GFWList) with automated downloading and parsing. RuleSet content must follow the **AutoProxy** specification.

---

## 3. Advanced Rule Operations

### Adding Rules

- **Add Single Rule**: Click the **(+)** icon at the top of the "Normal Rules" card.
- **Add RuleSet**: After adding a new rule row, switch the "Rule Type" dropdown to **Rule Set** and enter the subscription URL.
- **Add Divider**: Click the "Folder/Storage" icon in the action column of any rule row to insert an editable category header into the list.
- **Batch Replace**: Click the **"List/Check"** icon at the top of the card to replace all instances of one proxy with another within the current policy.

### RuleSet Management

- **Format Support**: Subscriptions support **AutoProxy (Base64)** and **AutoProxy Plain Text** formats.
- **Offline Resilience**: The system automatically caches content locally, ensuring the routing policy remains functional even if the subscription link is offline.
- **Real-time Inspection**: Use the "View Content" feature to inspect the downloaded and parsed rule list in real-time.

---

## 4. Priority Logic

Rules are evaluated from top to bottom, following global priority weighting (reference: `General Settings` -> `Priority`):

1. **Reject Rules**: Evaluated first. Matching requests are blocked immediately and redirected.
2. **Temporary Rules**: Session-only rules generated via Quick Add. See the [Temporary Rules Guide](TEMPORARY_RULES.md).
3. **Normal Rules**: Persistent rules within the policy; supports drag-and-drop reordering for custom priority.
4. **Default Strategy**: A fallback setting applied when no rules match.

---

## 5. Unsaved Changes Protection

The Auto Policy detail page implements a strict page-switching protection mechanism:

- **Locked State**: If there are unsaved modifications in the current policy (rule additions/deletions, reordering, or attribute edits), sidebar navigation is locked.
- **Unlocking**: One must click the **Save** button at the top of the page to persist the configuration, or click **Reset** to discard changes for the current session.
- **Purpose**: Ensures that users do not lose complex routing rules due to accidental misoperation.

---

## Technical Reference

- [Proxy Node Configuration](PROXY_TYPES.md)
- [Request Monitor](MONITORING.md)
- [Extension Configuration](EXTENSION_CONFIG.md)
