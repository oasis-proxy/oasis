# Temporary Rules Storage Format

Temporary rules are stored in `chrome.storage.session` to persist across the extension's lifespan (e.g. between popup and options page interactions) but are cleared when the browser session ends.

## Storage Key

Key: `tempRules`

## Data Structure

The `tempRules` value is an array of rule objects.

```json
[
  {
    "id": "rule_1707123456789",
    "type": "rule",
    "ruleType": "wildcard", // "wildcard" | "regex" | "ip" | "ruleset"
    "pattern": "*.example.com",
    "proxyId": "proxy_1",
    "valid": true,
    "timestamp": 1707123456789 // Optional creation time
  }
]
```

## Fields

- **id**: Unique identifier string.
- **type**: String, always "rule".
- **ruleType**: String enum: `wildcard`, `regex`, `ip`, `ruleset`.
- **pattern**: string, the matching pattern.
- **proxyId**: string, ID of the proxy profile to use.
- **valid**: boolean, true if the rule is active (checkbox state).
- **ruleSet**: object (optional), contains content/fetch status if `ruleType` is `ruleset`.

## Actions

- **Accept**: Moves the rule to a permanent policy (usually prompts user to choose which policy or defaults to 'Auto Policy').
- **Delete**: Removes the rule from the temporary list.
- **Clear All**: Removes all temporary rules.
- **Merge Rules**: Bulk accepts/merges rules into a policy.
