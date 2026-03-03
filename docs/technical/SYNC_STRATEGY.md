# Oasis Configuration Versioning & Synchronization Strategy

## 1. Overview

Oasis implements a robust multi-device synchronization system using `chrome.storage.sync`. The system prioritizes data integrity, storage efficiency, and accurate conflict detection using a strict versioning scheme.

## 2. Versioning Strategy

The configuration versioning relies on two fields in the root `config` object:

- **`version` (Integer)**: A strictly increasing counter representing the configuration generation.
- **`updatedAt` (Timestamp)**: The exact time (milliseconds) of the last significant local modification.

### 2.1. Increment Rules

The version number is incremented **ONLY** when a substantive change is made to the local configuration. This includes:

- Adding, editing, or deleting a Proxy, Policy, or PAC script.
- Modifying general settings (e.g., UI preferences, behavior).

The `touchConfig()` helper ensures that any such save operation performs:

```javascript
config.version = currentVersion + 1
config.updatedAt = Date.now()
```

### 2.2. Exclusions (No Version Increment)

The following actions do **NOT** increment the version number, ensuring that metadata reflects the _content_ rather than the _state_ of the browser:

- **Auto Sync Toggle**: Enabling or disabling Auto Sync is considered a local device preference.
- **Sync Push**: Uploading to the cloud publishes the _current_ version. It does not artificially increment the version.
- **Hydration**: Downloading cached content (e.g., remote RuleSet lists, remote PAC scripts) is considered a caching operation, not a configuration change.

## 3. Storage Architecture

Due to the limited size of `chrome.storage.sync` (100KB total, 8KB per item), Oasis uses a **Chunked Storage** approach.

### 3.1. Data Structure

The configuration is split into:

1.  **Metadata (`sync_meta`)**:
    - `version`: The configuration version.
    - `timestamp`: The `updatedAt` timestamp.
    - `count`: Total number of data chunks.

2.  **Data Chunks (`sync_chunk_0`, `sync_chunk_1`, ...)**:
    - The full configuration JSON is serialized and split into 7KB chunks (7000 bytes) to fit comfortably within the 8KB per-item limit.

## 4. Synchronization Flow

### 4.1. Push (Sync to Cloud)

When syncing _to_ the cloud (Manual or Auto):

1.  **Snapshot**: A copy of the current local configuration is created.
2.  **Optimization**:
    - **Strip Local-Only Data**:
      - `config.sync` settings (e.g., enabled state).
      - `config.activeProfileId` (Current active profile is device-specific).
    - **Strip Cache**: Heavy content is removed to save space:
      - `policy.rules[].ruleSet.content` (Cached RuleSet text)
      - `pac.script` (Cached remote PAC script)
    - _Note: Remote URLs are preserved, allowing the other device to re-fetch the content._
3.  **Chunking**: The optimized payload is chunked.
4.  **Upload**: Metadata and chunks are written to `chrome.storage.sync`.

```mermaid
graph TD
    A[Start: Trigger Sync To Cloud] --> B[Deep Copy Local Config];
    B --> C{Remove Local-Only Data};
    C --> |Delete| D1[activeProfileId];
    C --> |Delete| D2[sync preferences];

    C --> E[Optimize Payload];
    E --> |Strip| F1[RuleSet cached content];
    E --> |Strip| F2[Remote PAC cached scripts];

    E --> G[Serialize to JSON];
    G --> H[Calculate Chunks];
    H --> |Split every 7000 chars| I[Generate sync_chunk_N];
    I --> J[Generate sync_meta];

    J --> K{Check Cloud Version};
    K -->|Conflict: Cloud > Local| L[Throw SYNC_CONFLICT Error];
    K -->|OK| M[Remove Old Chunks from Chrome Sync];

    M --> N[Save New Chunks to Chrome Sync];
    N --> O[Update Local Last Synced Version];
    O --> P[End: Sync to Cloud Complete];

    classDef action fill:#e1f5fe,stroke:#0288d1;
    classDef check fill:#fff3e0,stroke:#f57c00;
    classDef error fill:#ffebee,stroke:#d32f2f;

    class B,C,E,G,H,I,J,M,N,O action;
    class K check;
    class L error;
```

### 4.2. Pull (Sync from Cloud)

When syncing _from_ the cloud:

1.  **Fetch & Reassemble**: All chunks are fetched and joined to reconstruct the JSON.
2.  **Merge**: The cloud configuration overwrites the local configuration.
3.  **Local Preservation**: Local-only settings (like `sync.enabled`) are restored to the new config.
4.  **Hydration**:
    - Because cached content was stripped during upload, the local client immediately performs a **Hydration** step.
    - It detects missing `content` for RuleSets and `script` for remote PACs.
    - It fetches these resources from their original URLs.
    - The fetched content is saved to local storage _without_ incrementing the version.

```mermaid
graph TD
    A[Start: Trigger Sync From Cloud] --> B[Fetch Data from Chrome Sync Storage];
    B --> C{Verify sync_meta exists};
    C -->|No| D[Check for legacy 'config' key];
    D -->|Found| E[Use legacy config];
    D -->|Not Found| F[End: No Cloud Data];

    C -->|Yes| G[Assemble Config from sync_chunk_N];
    G --> H[Parse Combined JSON];

    H --> I{Compare Versions};
    E --> I;
    I -->|Cloud <= Local| J[End: Already Up To Date];
    I -->|Cloud > Local or Force| K[Initialize DEFAULT_CONFIG];

    K --> L[Merge Cloud Config into DEFAULT];

    L --> M[Restore Local-Only Data];
    M --> |Preserve| N1[sync.enabled state];
    M --> |Preserve if Exists| N2[local.activeProfileId];

    M --> O[Hydrate Config Resources];
    O --> |Fetch/Restore| P1[RuleSet Contents];
    O --> |Fetch| P2[Remote PAC Scripts];

    O --> Q[Save Merged Config to Local Storage];
    Q --> R[chrome.storage.onChanged triggers in Background];

    R --> S[Load Latest Config];
    S --> T[Apply Proxy Settings to Browser];
    T --> |Fallback| U[Defaults to 'direct' ONLY if previous profile was deleted];
    T --> V[Clear temporary rules ONLY IF activeProfileId changed];

    T --> W[Update Context Menus & Monitoring State];
    W --> X[Update Local Last Synced Version];
    X --> Y[End: Cloud Sync Applied];

    classDef action fill:#e1f5fe,stroke:#0288d1;
    classDef check fill:#fff3e0,stroke:#f57c00;
    classDef terminal fill:#f3e5f5,stroke:#7b1fa2;

    class B,G,H,K,L,M,O,Q,R,S,T,W,X action;
    class C,I,D check;
    class F,J,Y terminal;
```

### 4.3. Auto Sync & Conflict Resolution

- **Trigger**: Auto Sync runs when enabled and a local change occurs.
- **Safety Check**: Before enabling Auto Sync, the client checks the Cloud Version.
  - **Conflict Detected** (`Cloud > Local`): A modal appears preventing immediate enable.
    - _Option A (Pull)_: Overwrite local with cloud (resolves to Cloud Version).
    - _Option B (Push)_: Overwrite cloud with local (resolves to Local Version).
  - **Safe**: Auto Sync enables and triggers an immediate Push.
