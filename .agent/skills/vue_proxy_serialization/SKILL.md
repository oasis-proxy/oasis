---
name: Vue Proxy Serialization
description: Guidelines for safely storing Vue reactive objects involved in Chrome Extension storage to avoid serialization artifacts.
---

# Vue Proxy Serialization

## Problem

Vue 3 uses JavaScript `Proxy` for reactivity. When these reactive objects (created via `ref` or `reactive`) are passed directly to storage APIs (like `chrome.storage.local.set` or `localStorage.setItem` via `JSON.stringify`), they may not serialize as expected.

Specifically, **Arrays can be serialized as Objects** (e.g., `['a', 'b']` becomes `{0: 'a', 1: 'b'}`). This corruption persists when reading the data back, causing runtime errors (e.g., `.map is not a function` or `v-for` failing).

## Solution

Always "unwrap" or "strip" reactivity before storing data.

### 1. Using `JSON.parse(JSON.stringify(value))`

This is the most universal / "poor man's" deep clone that effectively strips all Vue proxy wrappers.

```javascript
// BAD
await chrome.storage.local.set({ settings: reactiveSettings })

// GOOD
const rawSettings = JSON.parse(JSON.stringify(reactiveSettings))
await chrome.storage.local.set({ settings: rawSettings })
```

### 2. Using `toRaw` (If properly imported from Vue)

If you are inside a Vue component or file where `vue` is available:

```javascript
import { toRaw } from 'vue'

// Note: toRaw is shallow-ish for some deep structures depending on usage,
// deep cloning via JSON methods is often safer for pure data objects.
const raw = toRaw(state)
```

**Recommendation:** For Chrome Extension background/common scripts where Vue might not be imported, use **Method 1**.

## Checklist when modifying Storage logic

- [ ] Are you saving a `ref` or `reactive` object directly?
- [ ] Did you unwrap it?
- [ ] If modifying a nested array (like `rules: []`), verify it remains an array in validity checks.
