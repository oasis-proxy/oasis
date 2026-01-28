---
name: Config Integrity Check
description: Guidelines for maintaining configuration schema integrity when modifying storage or config logic.
---

# Config Integrity Check

Use this skill whenever you are:

1.  Modifying `src/common/config.js` (the schema definition).
2.  Modifying `src/common/storage.js` (persistence logic).
3.  Writing code that creates new configuration objects (e.g., "Add Proxy" or "Add Policy" features).
4.  Debugging issues related to `undefined` properties or type errors after loading data.

## 1. Source of Truth

`src/common/config.js` contains the `DEFAULT_CONFIG` export. This is the **Master Schema**.

- **Rule**: All configuration objects in the app MUST adhere to the structure defined here.
- **Action**: Before writing any save logic, read `src/common/config.js` to confirm the expected field names and types.

## 2. Initialization & Defaults

When creating a new object (e.g., `newProxy` or `newPolicy`) in a component (like `Sidebar.vue` or `*Modal.vue`):

- **Rule**: Explicitly initialize ALL fields defined in the schema, even optional ones.
- **Critical**: Arrays (like `bypassList`, `rules`) MUST be initialized as `[]`, not `null` or `undefined`.
- **Reason**: Runtime code often assumes methods like `.map()` or `.join()` are available. `undefined` breaks this.

## 3. Schema Evolution

If you add a new field to a component (e.g., adding `portRange` to a Proxy):

1.  Add it to the UI component (`v-model`).
2.  **IMMEDIATELY** add its default value to `DEFAULT_CONFIG` in `src/common/config.js`.
3.  **IMMEDIATELY** add its initialization to any "Create New" logic (e.g., `handleCreateProxy`).
4.  **Action**: Run a grep search for "CreateProxy" or similar to find all places where objects are instantiated manually.

## 4. Deep Clone & Reactivity

- **Rule**: When saving edits from a Vue component, always **Deep Clone** (`JSON.parse(JSON.stringify(ref.value))`) before modifying the object for storage (e.g., converting arrays to strings or deleting temporary fields).
- **Reason**: Modifying the reactive `ref` directly will crash the UI if fields are deleted (like `default` overrides) while `v-model` is still bound to them.

## 5. Persistence Cleanup

- **Rule**: Ensure that `saveConfig` logic cleans up or formats data consistently.
- **Check**: If a field is optional, decide if it should be saved as `null` or omitted. Be consistent.
