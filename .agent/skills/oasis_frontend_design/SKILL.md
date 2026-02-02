---
name: Oasis Frontend Design
description: Guidelines and specifications for implementing UI components in the Oasis project, ensuring adherence to the strict design system.
---

# Oasis Frontend Design Skill

This skill provides the mandatory design specifications for the **Oasis** project, derived from the `stich_oasis_proxy` reference.

## 1. Critical Rules (MUST FOLLOW)

### 1.1 Iconography

- **ALWAYS** use **Bootstrap Icons** (`bi-*` classes).
- **NEVER** use Material Symbols or Material Icons, even if the reference HTML uses them.
- **Import**: Icons are imported via CSS in `main.css`. Do not add CDN links.
- **Example**: Use `<i class="bi bi-gear"></i>` instead of `<span class="material-symbols-outlined">settings</span>`.

### 1.2 Typography & Sizing

- **Root Font Size**: `16px` (1rem = 16px).
- **Font Family**: `Inter`, sans-serif (`font-display`).
- **Strict Size Classes**:
  - `text-xs`: (12px) for badges, tiny labels.
  - `text-sm`: (14px) for body text, section labels.
  - `text-base`: (16px) for body text.
  - `text-[20px]`: for sidebar icons.
  - `text-[22px]`: for large icons.

### 1.3 Input Constraints

- **Text Input**: `max-width: 200px`, `height: 2rem` (32px).
- **Select**: `max-width: 100px`, `height: 2rem` (32px).
- **Overrides**: Use utility classes (e.g., `w-full`, `w-48`) to override this defaults if needed (ensure utilities have higher specificity or `!important`).

### 1.4 Colors

- **Primary**: `#137fec` (`bg-primary`, `text-primary`).
- **Backgrounds**:
  - Light: `#f3f4f6` (`bg-background-light`).
  - Dark: `#101922` (`bg-background-dark`).
  - Content Area (Light): `#ffffff` (`bg-white`).
  - Surface: `#ffffff` (`bg-white`) / `#1e293b` (`bg-surface-dark`).

## 2. Component Patterns

### 2.1 Sidebar (Options Page)

**Component**: `src/options/components/AppSidebar.vue`

**Layout**:

- Width: `w-72` (288px, fixed)
- Background: `bg-slate-50` / `dark:bg-sidebar-dark`
- Border: `border-r border-slate-200` / `dark:border-divider-dark`

**Logo/Brand Section**:

- Height: `h-24` (96px)
- Padding: `px-4`
- Border: `border-b border-slate-100` / `dark:border-divider-dark`
- Logo Icon: `32x32px`, `bg-primary`, `rounded-lg`
- Logo Icon Size: `text-base` (16px)
- Title: `text-base` (16px), `font-bold`

**Navigation Section**:

- Padding: `p-3`
- Gap between groups: `gap-4`
- Scrollable: `overflow-y-auto custom-scrollbar`

**Section Headers**:

- Text: `text-xs` (12px), `font-semibold`, `uppercase`, `tracking-wider`
- Color: `text-slate-400` / `dark:text-slate-500`
- Padding: `px-2 mb-2`

**Navigation Items**:

- Padding: `px-3 py-2`
- Border Radius: `rounded-lg`
- **Gap: `gap-2` (0.5rem / 8px)**
- **Icon Size: `text-base` (16px)**
- **Text Size: `text-xs` (12px)**
- Active State: `nav-item-active`, `text-primary`, `font-medium`, `shadow-sm`
- Inactive State: `text-slate-600` / `dark:text-slate-400`
- Hover: `nav-item-hover`

**Add Buttons** (+ icons):

- Standard: **Icon Button** (see below)
- Position: Right side of section header

**Status Indicators**:

- Size: `w-2 h-2` (8px)
- Shape: `rounded-full`
- Position: `ml-auto`

### 2.2 Header

- Height: `h-24` (Options), `h-14` (Popup).
- Padding: `px-8` (Horizontal).
- Visual: Border bottom, flex layout, `justify-between`.
- **Title**: `text-[22px] font-bold ui-text-primary m-0`.
- **Subtitle**: `text-xs ui-text-secondary mt-1 m-0`.

### 2.3 Page Layout (Standard)

- **Container**: `h-full flex flex-col`.
- **Content Area**: `flex-1 overflow-y-auto custom-scrollbar p-8`.
- **Max Width**: `max-w-3xl mx-auto space-y-8` (for settings pages).

### 2.3 Status Badges

- **Blocked**: `bg-red-50 text-red-600 border-red-100`.
- **Allowed**: `bg-green-50 text-green-600 border-green-100`.
- **Tracker**: `bg-orange-50 text-orange-600 border-orange-100`.

### 2.5 Detailed UI Components

#### Cards

- **Class**: `.settings-card`
- **Structure**: `rounded-xl border divide-y shadow-sm`
- **Item Padding**: `p-5`
- **Titles**: `text-sm font-medium settings-text-primary`
- **Descriptions**: `text-xs settings-text-secondary`

#### Buttons

- **Primary**: `.ui-button-primary` (`bg-primary text-white border-0`).
- **Secondary (Default)**: `.ui-button-secondary`.
  - Light: `bg-white border border-slate-300 text-slate-600`.
  - Dark: `bg-slate-700/800 border-transparent text-slate-300`.
- **Danger**: `.ui-button-danger`

- **Icon Button**:
  - **Class**: `.ui-button-icon`
  - **Scope**: Auto policy rule actions, Sidebar add buttons.
  - **Visual**: No border, no background in default state.
  - **Hover**: Icon/Text color changes (e.g., to Primary color). No background change.
  - **Sizes**: `text-sm` (14px) or `text-xs` (12px).

#### Inputs & Selects

- **Class**: `.settings-input`
- **Height**: `h-8`
- **Font**: `text-xs`
- **State**: `focus:border-primary focus:ring-primary`

#### Section Labels

- **Style**: `text-sm font-semibold settings-label mb-4 flex items-center gap-2`

- **Icon**: None.

#### Grid Layouts (Forms)

- **Protocol / Host / Port**: Use a single row with grid columns.
  - Ratio: **3 : 7 : 2** (e.g., `col-span-3`, `col-span-7`, `col-span-2` in a 12-col grid).
  - Inputs: Must use `!max-w-full` class to override default width constraints.
- **Authentication**: Use a single row.
  - Ratio: **50% : 50%** (e.g., `grid-cols-2`).

### 2.4 Dark Mode Standards

**Principles**:

- **Semantic Overrides**: NEVER rely on `bg-white` + `dark:bg-...` overrides alone, as specificity issues (like `!important` in `bg-white`) will break them.
- **Transparency**: Highlighting in dark mode should use **White with Opacity** (e.g., `rgba(255,255,255,0.05)`), NOT solid colors.
- **Text Safety**: Text must explicitly switch to white/light-grey. Do not rely on inheritance.

**Semantic Classes (Required)**:
Use these classes instead of raw Tailwind utilities for settings pages:

| Element            | Class                | Light Mode                | Dark Mode                          |
| :----------------- | :------------------- | :------------------------ | :--------------------------------- |
| **Containers**     | `.ui-card`           | White / Border Slate-200  | `#252525` / Border `#333`          |
| **Inputs**         | `.ui-input`          | Slate-50 / Text Slate-900 | `#2d2d2d` / Text White             |
| **Primary Text**   | `.ui-text-primary`   | Slate-900                 | White                              |
| **Secondary Text** | `.ui-text-secondary` | Slate-500                 | Slate-400                          |
| **Icons**          | `.ui-icon-{color}`   | `bg-{color}-50`           | `rgba({color}, 0.2)` (Transparent) |

| **Switch** | `.form-switch` | Bootstrap Default | **Start Color**: `#4b5563` (Gray-600) / **Checked**: Primary |

**Implementation Rule**:

```html
<!-- INCORRECT -->
<div class="bg-white dark:bg-slate-800 ...">
  <h3 class="text-slate-900">Title</h3>
</div>

<!-- CORRECT -->
<div class="ui-card ...">
  <h3 class="ui-text-primary">Title</h3>
</div>
```

4. **Use Shared CSS**: Ensure `main.css` is imported.

### 2.6 Form Components (Bootstrap)

#### Switches (Toggles)

- **Class**: `.form-check .form-switch`
- **Dark Mode**:
  - **Unchecked**: Background `#4b5563` (Gray-600) (NOT Black).
  - **Checked**: Primary Color.
  - **Knob**: White / Light Gray.

---

**Usage**: Read this file before creating or modifying any Vue components or HTML files to ensure UI consistency.

### 2.8 Toast Notifications

**Component**: `src/options/components/Toast.vue`  
**Utility**: `src/options/utils/toast.js`

**Design Specifications**:

- **Position**: Fixed, top-right (`top: 80px; right: 24px`)
- **Size**: `min-width: 320px; max-width: 480px`
- **Background**: `var(--ui-card-bg)` with backdrop blur
- **Border**: `1px solid var(--ui-border)` + 3px colored left border
- **Border Radius**: `12px`
- **Shadow**: `0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.08)`
- **Padding**: `14px 16px`
- **Animation**: Slide in from right with scale effect

**Types & Colors**:

- **Success**: `#10b981` (green) - `bi-check-circle-fill`
- **Error**: `#ef4444` (red) - `bi-exclamation-circle-fill`
- **Warning**: `#f59e0b` (amber) - `bi-exclamation-triangle-fill`
- **Info**: `#3b82f6` (blue) - `bi-info-circle-fill`

**Usage**:

```javascript
import { toast } from '@/options/utils/toast'

toast.success('Changes saved successfully')
toast.error('Failed to save changes')
toast.warning('You have unsaved changes')
toast.info('Loading data...')
```
