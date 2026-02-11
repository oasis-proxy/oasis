# Temporary Rules

Temporary Rules provide a **session-only** routing mechanism in Oasis, allowing for rapid proxy adjustments for specific requests without modifying persistent policies.

## 1. Core Features

- **Session Persistence**: Temporary rules are stored in the browser's `session` storage. This means they are automatically cleared when the browser is completely closed or the session ends.
- **High Priority**: Temporary rules are evaluated with a higher priority than persistent Normal Rules, but lower than Reject Rules. Priority can be adjusted in `General Settings` -> `Priority`.
- **One-way Transition**: Validated temporary rules can be promoted to persistent rules in the active Auto Policy with a single click.

---

## 2. Rule Creation

Temporary rules are primarily generated via the **"Quick Add"** workflow:

1. Open the extension **Popup**.
2. Switch to the **"Quick"** tab.
3. Select the desired domains from the list of captured failed requests.
4. In the "Add To" dropdown, select **"Temporary (Session)"**.
5. Click **Confirm**.

The selected domains will immediately apply the chosen proxy and appear in the "Temporary Rules" list in the sidebar.

---

## 3. Management & Promotion

Access the management interface by clicking **"Temporary Rules"** in the sidebar:

- **Real-time Editing**: Modify matching patterns (Wildcard/Regex), types, or target proxies in the list. Click **Save** to apply changes.
- **Accept (Promote)**: Click the **"Checkmark/Accept"** icon to move a rule from the temporary list to the active persistent Auto Policy.
- **Accept All**: Click the **"Double Checkmark"** icon at the top of the card to move all temporary rules into the persistent policy at once.
- **Merge Rules (Smart Merge)**: Click the **"Merge"** icon at the top of the card. This triggers the Smart Merge engine to deduplicate rules and contract wildcards (e.g., merging subdomains into a root domain pattern) before persisting them.
- **Delete**: Click the "Trash" icon to remove a single temporary rule.
- **Clear All**: Click the "Trash" icon at the top of the card to wipe all session rules at once.

---

## 4. Unsaved Changes Protection

Oasis implements a strict page-switching protection mechanism:

- **Locked State**: If there are unsaved modifications on the current page, sidebar navigation is locked.
- **Unlocking**: One must click the **Save** button at the top of the page to apply changes, or click **Reset** to discard edits and revert to the last saved state.
- **Purpose**: Prevents accidental loss of routing rules or proxy configurations during editing.

---

## 5. Considerations

- **Prerequisites**: Temporary rules are only functional when the current active profile is an **Auto Policy**. They remain inactive if the profile is switched to "Direct Connect", "System Proxy", "PAC", or "Proxy Host".
- **Conflict Resolution**: In the event of a conflict between a temporary rule and a persistent one, the temporary rule takes precedence.

---

## Related Guides

- [Auto Policy (Rule-Based Routing)](AUTO_POLICY.md)
- [Interface Overview (Popup & Sidepanel)](INTERACTIVE.md)
