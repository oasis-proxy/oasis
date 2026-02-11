# Oasis 扩展设计系统 (Design System)

本文档概述了 Oasis 扩展中使用的设计令牌、组件和实用类，这些内容基于 `src/styles/` 中的 CSS 文件。

## 1. 全局变量 (`theme.css`)

### 品牌颜色 (Brand Colors)

| 变量                  | 值                                  | 描述             |
| --------------------- | ----------------------------------- | ---------------- |
| `--bs-primary`        | `#137fec` (浅色) / `#3b9eff` (深色) | 主要品牌颜色     |
| `--bs-primary-hover`  | `#1170cf` (浅色) / `#5aadff` (深色) | 主要悬停状态     |
| `--bs-primary-subtle` | `#e0f2fe` (浅色) / `#1e3a5f` (深色) | 柔和的主要背景色 |

### 语义颜色 (Semantic Colors)

| 上下文       | 变量                  | 浅色模式  | 深色模式  |
| ------------ | --------------------- | --------- | --------- |
| **背景**     | `--bs-body-bg`        | `#f3f4f6` | `#0f172a` |
| **卡片背景** | `--ui-bg-card`        | `#ffffff` | `#1e293b` |
| **柔和背景** | `--ui-bg-subtle`      | `#f8fafc` | `#1e293b` |
| **悬停背景** | `--ui-bg-hover`       | `#f1f5f9` | `#334155` |
| **一级文本** | `--ui-text-primary`   | `#0f172a` | `#f1f5f9` |
| **二级文本** | `--ui-text-secondary` | `#64748b` | `#94a3b8` |
| **三级文本** | `--ui-text-tertiary`  | `#94a3b8` | `#64748b` |
| **边框**     | `--ui-border`         | `#cbd5e1` | `#475569` |
| **细微边框** | `--ui-border-subtle`  | `#e2e8f0` | `#334155` |

### 状态颜色 (Status Colors)

| 状态     | 颜色变量       | 背景变量          | 文本变量           |
| -------- | -------------- | ----------------- | ------------------ |
| **成功** | `--ui-success` | `--ui-success-bg` | `--ui-success`     |
| **危险** | `--ui-danger`  | `--ui-danger-bg`  | `--ui-danger-text` |
| **警告** | `--ui-warning` | `--ui-warning-bg` | `--ui-warning`     |
| **信息** | `--ui-info`    | `--ui-info-bg`    | `--ui-info`        |

### 字体 (Typography)

字体族: `'Inter', system-ui, -apple-system, sans-serif`

| 变量          | 大小   | 权重变量                       |
| ------------- | ------ | ------------------------------ |
| `--font-xs`   | `12px` | `--font-weight-normal` (400)   |
| `--font-sm`   | `14px` | `--font-weight-medium` (500)   |
| `--font-base` | `16px` | `--font-weight-semibold` (600) |
| `--font-lg`   | `18px` | `--font-weight-bold` (700)     |
| `--font-xl`   | `20px` |                                |
| `--font-2xl`  | `24px` |                                |
| `--font-3xl`  | `30px` |                                |

### 图标调色板

用于 `ui-icon-*` 类。

- 蓝色, 靛蓝色, 绿色, 紫色, 橙色, 红色, 青色, 粉色, 灰色。

---

## 2. 组件 (Components)

### 按钮 (`buttons.css`)

| 类名                   | 外观                                                 |
| ---------------------- | ---------------------------------------------------- |
| `.ui-button-primary`   | 纯色主要颜色，白色文本。无边框。                     |
| `.ui-button-secondary` | 卡片背景，有边框，二级文本。                         |
| `.ui-button-danger`    | 纯色危险颜色，白色文本。无边框。                     |
| `.ui-button-icon`      | 透明背景，三级文本。悬停时显示主要颜色。大小：28px。 |
| `.ui-button-icon.sm`   | 小型图标按钮 (16px)。                                |

**通用规范**: 高度 32px，内边距 0 12px，Flex 居中。

### 卡片与布局 (`cards.css`)

- **卡片容器**: `.ui-card`
  - 背景: `--ui-bg-card`
  - 边框: `--ui-border-subtle`
- **页眉**: `.ui-card-header`
  - 背景: `--ui-bg-card-header`
  - 下边框: `--ui-border-light`
  - 字体: `--font-xs`, 半粗体, 大写, 字母间距加宽。
- **标签**: `.ui-card-label`
  - 字体: `--font-sm`, 半粗体, 大写, 字母间距加宽。
- **页脚**: `.ui-card-footer`
  - 背景: `--ui-bg-subtle`
  - 上边框: `--ui-border-light`

### 输入框与表单 (`inputs.css`, `dropdowns.css`)

- **输入框**: `.ui-input`
  - 高度: 32px
  - 圆角: 8px
  - 背景: `white` (浅色) / `slate-50` (深色)
  - **限制**: 文本输入框最大宽度 200px，选择框最大宽度 100px。
- **选择框**: `.form-select`
  - 与卡片背景和边框匹配。
- **开关**: 标准 Bootstrap `.form-check-input[type="checkbox"][role="switch"]`。
  - 选中颜色: `--bs-primary`。
- **单选框**: `.form-check-input[type="radio"]`。
  - 边框: `--ui-radio-border`。

### 内容标签 (`tags.css`)

基础类: `.ui-tag`

- 规范: `inline-flex`, `内边距: 2px 6px`, `字体大小: 9px`。

**变体**:

- `.ui-tag-default`: 细微灰色。
- `.ui-tag-primary`: 柔和的主要颜色。
- `.ui-tag-success`: 成功颜色。
- `.ui-tag-danger`: 危险颜色。
- `.ui-tag-warning`: 警告颜色。
- `.ui-tag-info`: 信息颜色。

### 导航 (`nav.css`, `AppSidebar.vue` 规范)

- **项目**:
  - 活动项: `.nav-item-active` (主要文本，活动背景)。
  - 非活动项: `.nav-item-inactive` (二级文本，透明背景)。
- **侧边栏宽度**: `w-72` (18rem)。

### 模态框/弹窗 (`modals.css`)

- **页眉**: `--font-lg`, 半粗体。
- **内容**: 卡片背景。
- **背景遮罩**: `--ui-backdrop` 带有透明度。
- **关闭按钮**: 透明，悬停时显示二级文本。

### 吐司通知/气泡提示 (`toasts.css`)

- **位置**: 固定右上角 (24px)。
- **样式**: 卡片背景，有阴影，模糊效果。
- **变体**: 成功、错误、警告、信息（带颜色的图标和左边框）。
- **动画**: 从右侧/底部滑入。

---

## 3. 实用类 (`utils.css`)

### 文本与背景

- `.text-slate-{300,400,500,600,700,900}`
- `.text-primary`, `.text-white`
- `.bg-subtle`, `.bg-hover`, `.bg-background-light`
- `.ui-icon-wrapper`: 图标的默认细微背景。

### 滚动条

- `.custom-scrollbar`: 细滚动条 (6px)，滑块颜色为 `--ui-border`。

### 图标包装器

- `.ui-icon-{color}`: 设置变量中定义的特定背景色和文本颜色（例如：`.ui-icon-blue`）。

### 布局辅助

- `.w-72`, `.w-64`
- `.h-24`, `.h-14`, `.h-8`
- `.max-w-6xl`
- `.rounded-{md,lg,xl,2xl,full}`

### 动画

- `.animate-spin`
- `.animate-fade-in`
- `.animate-fade-in-up`
