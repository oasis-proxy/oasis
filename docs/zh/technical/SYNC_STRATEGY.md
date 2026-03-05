# Oasis 配置版本控制与同步策略

## 1. 概述

Oasis 使用 `chrome.storage.sync` 实现了一个强大的多设备同步系统。该系统通过严格的版本控制方案，优先考虑数据完整性、存储效率和准确的冲突检测。

## 2. 版本控制策略

配置版本控制依赖于根 `config` 对象中的两个字段：

- **`version` (整数)**: 一个严格递增的计数器，代表配置的代数。
- **`updatedAt` (时间戳)**: 上次重大本地修改的确切时间（毫秒）。

### 2.1. 递增规则

版本号 **仅在** 对本地配置进行实质性更改时递增。这包括：

- 添加、编辑或删除代理服务器、策略或 PAC 脚本。
- 修改全局设置（例如：UI 偏好、行为设置）。

`touchConfig()` 辅助函数确保任何此类保存操作都会执行：

```javascript
config.version = currentVersion + 1
config.updatedAt = Date.now()
```

### 2.2. 排除情况（由于不涉及配置内容更改，不递增版本）

以下操作 **不会** 递增版本号，确保元数据反映的是浏览器的“内容”而非“状态”：

- **自动同步开关**: 启用或禁用自动同步被视为本地设备偏好。
- **同步推送 (Sync Push)**: 上传到云端是发布 _当前_ 版本，不会人为递增加版本号。
- **补全 (Hydration)**: 下载缓存内容（例如：远程规则集列表、远程 PAC 脚本）被视为缓存操作，而非配置更改。

## 3. 存储架构

由于 `chrome.storage.sync` 的大小限制（总共 100KB，每个条目 8KB），Oasis 采用了 **分块存储 (Chunked Storage)** 方法。

### 3.1. 数据结构

配置被拆分为：

1.  **元数据 (`sync_meta`)**:
    - `version`: 配置版本。
    - `timestamp`: `updatedAt` 时间戳。
    - `count`: 数据块总数。

2.  **数据块 (`sync_chunk_0`, `sync_chunk_1`, ...)**:
    - 完整的配置 JSON 被序列化并拆分为 7KB 的块（7000 字节），以便舒适地适应每个条目 8KB 的限制。

## 4. 同步工作流

### 4.1. 推送 (同步到云端)

当同步 _到_ 云端时（手动或自动）：

1.  **快照 (Snapshot)**: 创建当前本地配置的副本。
2.  **优化**:
    - **剥离仅限本地的数据**:
      - `config.sync` 设置（例如：启用状态）。
      - `config.activeProfileId`（当前活动的配置文件是设备特定的）。
    - **剥离缓存**: 删除大体积内容以节省空间：
      - `policy.rules[].ruleSet.content`（缓存的规则集文本）
      - `pac.script`（缓存的远程 PAC 脚本）
    - _注意：保留了远程 URL，允许其他设备重新获取内容。_
3.  **分块**: 对优化后的负载进行分块。
4.  **上传**: 将元数据和分块写入 `chrome.storage.sync`。

```mermaid
graph TD
    A[开始: 触发向云端同步] --> B[深拷贝本地配置];
    B --> C{剔除仅保留在本地的数据};
    C -->|"删除"| D1[activeProfileId (活跃策略ID)];
    C -->|"删除"| D2[同步偏好设置];

    C --> E[优化 Payload 数据量];
    E -->|"剥离"| F1[RuleSet 缓存内容];
    E -->|"剥离"| F2[远程 PAC 缓存脚本];

    E --> G[序列化为 JSON];
    G --> H[计算分块];
    H -->|"每 7000 字符分割"| I[生成 sync_chunk_N];
    I --> J[生成 sync_meta (元数据)];

    J --> K{校验云端版本};
    K -->|"冲突: 云端 > 本地"| L[抛出 SYNC_CONFLICT 冲突异常];
    K -->|"校验通过"| M[从 Chrome Sync 中移除旧分块];

    M --> N[将新分块保存回 Chrome Sync];
    N --> O[更新本地的最后同步版本记录];
    O --> P[结束: 云端同步完成];

    classDef action fill:#e1f5fe,stroke:#0288d1;
    classDef check fill:#fff3e0,stroke:#f57c00;
    classDef error fill:#ffebee,stroke:#d32f2f;

    class B,C,E,G,H,I,J,M,N,O action;
    class K check;
    class L error;
```

### 4.2. 拉取 (从云端同步)

当 _从_ 云端同步时：

1.  **获取与重组**: 获取所有分块并合并以重建 JSON。
2.  **合并**: 云端配置覆盖本地配置。
3.  **本地保留**: 将仅限本地的设置（如 `sync.enabled`）恢复到新配置中。
4.  **补全 (Hydration)**:
    - 由于缓存内容在上传期间被剥离，本地客户端会立即执行 **补全** 步骤。
    - 它检测规则集缺少的 `content` 和远程 PAC 缺少的 `script`。
    - 它从原始 URL 获取这些资源。
    - 获取的内容保存到本地存储，且 **不** 递增版本。

```mermaid
graph TD
    A[开始: 触发从云端同步] --> B[从 Chrome Sync Storage 获取数据];
    B --> C{检查 sync_meta 是否存在};
    C -->|"否"| D[检查遗留的 'config' 键];
    D -->|"存在"| E[使用遗留配置];
    D -->|"不存在"| F[结束: 无云端数据];

    C -->|"是"| G[从 sync_chunk_N 组装配置];
    G --> H[解析合并后的 JSON];

    H --> I{比对版本号};
    E --> I;
    I -->|"云端 <= 本地"| J[结束: 已经是最新版本];
    I -->|"云端 > 本地 或 强制同步"| K[初始化 DEFAULT_CONFIG];

    K --> L[将云端配置合并入 DEFAULT_CONFIG];

    L --> M[恢复仅保留在本地的数据];
    M -->|"保留"| N1[sync.enabled 状态];
    M -->|"如有仍然存在则保留"| N2[local.activeProfileId];

    M --> O[水合配置资源 (Hydrate)];
    O -->|"请求/本地恢复"| P1[RuleSet 规则集内容];
    O -->|"请求"| P2[远程 PAC 脚本内容];

    O --> Q[将合并后的最终配置写入本地存储];
    Q --> R[触发 Background 中的 chrome.storage.onChanged];

    R --> S[重新加载最新本地配置];
    S --> T[将代理设置应用到浏览器];
    T -->|"回退补救"| U[仅当找不到之前的配置时重置为 'direct'];
    T --> V[仅当 activeProfileId 发生变化时清空临时规则];

    T --> W[更新右键菜单与连接监控状态];
    W --> X[更新本地的最后同步版本记录];
    X --> Y[结束: 成功应用云端配置];

    classDef action fill:#e1f5fe,stroke:#0288d1;
    classDef check fill:#fff3e0,stroke:#f57c00;
    classDef terminal fill:#f3e5f5,stroke:#7b1fa2;

    class B,G,H,K,L,M,O,Q,R,S,T,W,X action;
    class C,I,D check;
    class F,J,Y terminal;
```

### 4.3. 自动同步与冲突解决

- **触发**: 当启用自动同步且发生本地更改时运行。
- **安全检查**: 在启用自动同步之前，客户端会检查云端版本。
  - **检测到冲突** (`Cloud > Local`): 出现一个弹窗以防止立即启用。
    - _选项 A (拉取)_: 使用云端覆盖本地（解析为云端版本）。
    - _选项 B (推送)_: 使用本地覆盖云端（解析为本地版本）。
  - **安全**: 启用自动同步并触发即时推送。
