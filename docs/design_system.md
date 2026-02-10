# Oasis Extension Design System

This document outlines the design tokens, components, and utility classes used in the Oasis Extension, based on the CSS files in `src/styles/`.

## 1. Global Variables (`theme.css`)

### Brand Colors

| Variable              | Value                                | Description               |
| --------------------- | ------------------------------------ | ------------------------- |
| `--bs-primary`        | `#137fec` (Light) / `#3b9eff` (Dark) | Primary brand color       |
| `--bs-primary-hover`  | `#1170cf` (Light) / `#5aadff` (Dark) | Primary hover state       |
| `--bs-primary-subtle` | `#e0f2fe` (Light) / `#1e3a5f` (Dark) | Subtle primary background |

### Semantic Colors

| Context            | Variable              | Light Mode | Dark Mode |
| ------------------ | --------------------- | ---------- | --------- |
| **Background**     | `--bs-body-bg`        | `#f3f4f6`  | `#0f172a` |
| **Card Bg**        | `--ui-bg-card`        | `#ffffff`  | `#1e293b` |
| **Subtle Bg**      | `--ui-bg-subtle`      | `#f8fafc`  | `#1e293b` |
| **Hover Bg**       | `--ui-bg-hover`       | `#f1f5f9`  | `#334155` |
| **Text Primary**   | `--ui-text-primary`   | `#0f172a`  | `#f1f5f9` |
| **Text Secondary** | `--ui-text-secondary` | `#64748b`  | `#94a3b8` |
| **Text Tertiary**  | `--ui-text-tertiary`  | `#94a3b8`  | `#64748b` |
| **Border**         | `--ui-border`         | `#cbd5e1`  | `#475569` |
| **Border Subtle**  | `--ui-border-subtle`  | `#e2e8f0`  | `#334155` |

### Status Colors

| Status      | Color Var      | Bg Var            | Text Var           |
| ----------- | -------------- | ----------------- | ------------------ |
| **Success** | `--ui-success` | `--ui-success-bg` | `--ui-success`     |
| **Danger**  | `--ui-danger`  | `--ui-danger-bg`  | `--ui-danger-text` |
| **Warning** | `--ui-warning` | `--ui-warning-bg` | `--ui-warning`     |
| **Info**    | `--ui-info`    | `--ui-info-bg`    | `--ui-info`        |

### Typography

Font Family: `'Inter', system-ui, -apple-system, sans-serif`

| Variable      | Size   | Weight Vars                    |
| ------------- | ------ | ------------------------------ |
| `--font-xs`   | `12px` | `--font-weight-normal` (400)   |
| `--font-sm`   | `14px` | `--font-weight-medium` (500)   |
| `--font-base` | `16px` | `--font-weight-semibold` (600) |
| `--font-lg`   | `18px` | `--font-weight-bold` (700)     |
| `--font-xl`   | `20px` |                                |
| `--font-2xl`  | `24px` |                                |
| `--font-3xl`  | `30px` |                                |

### Icon Palette

Used for `ui-icon-*` classes.

- Blue, Indigo, Green, Purple, Orange, Red, Teal, Pink, Gray.

---

## 2. Components

### Buttons (`buttons.css`)

| Class                  | Appearance                                                      |
| ---------------------- | --------------------------------------------------------------- |
| `.ui-button-primary`   | Solid primary color, white text. No border.                     |
| `.ui-button-secondary` | Card background, border, secondary text.                        |
| `.ui-button-danger`    | Solid danger color, white text. No border.                      |
| `.ui-button-icon`      | Transparent, tertiary text. Primary color on hover. Size: 28px. |
| `.ui-button-icon.sm`   | Small icon button (16px).                                       |

**Common Specs**: Height 32px, Padding 0 12px, Flex centered.

### Cards & Layout (`cards.css`)

- **Card Container**: `.ui-card`
  - Background: `--ui-bg-card`
  - Border: `--ui-border-subtle`
- **Header**: `.ui-card-header`
  - Background: `--ui-bg-card-header`
  - Border Bottom: `--ui-border-light`
  - Typography: `--font-xs`, semibold, uppercase, tracking-wider.
- **Label**: `.ui-card-label`
  - Typography: `--font-sm`, semibold, uppercase, tracking-wide.
- **Footer**: `.ui-card-footer`
  - Background: `--ui-bg-subtle`
  - Border Top: `--ui-border-light`

### Inputs & Forms (`inputs.css`, `dropdowns.css`)

- **Input**: `.ui-input`
  - Height: 32px
  - Radius: 8px
  - Bg: `white` (Light) / `slate-50` (Dark check?)
  - **Constraints**: Text inputs max-width 200px, Selects max-width 100px.
- **Select**: `.form-select`
  - Matches card background and border.
- **Switches**: Standard Bootstrap `.form-check-input[type="checkbox"][role="switch"]`.
  - Checked color: `--bs-primary`.
- **Radio**: `.form-check-input[type="radio"]`.
  - Border: `--ui-radio-border`.

### Content Tags (`tags.css`)

Base Class: `.ui-tag`

- Specs: `inline-flex`, `padding: 2px 6px`, `font-size: 9px`.

**Variants**:

- `.ui-tag-default`: Subtle gray.
- `.ui-tag-primary`: Primary color subtle.
- `.ui-tag-success`: Success color.
- `.ui-tag-danger`: Danger color.
- `.ui-tag-warning`: Warning color.
- `.ui-tag-info`: Info color.

### Navigation (`nav.css`, `AppSidebar.vue` specs)

- **Items**:
  - Active: `.nav-item-active` (Primary text, active bg).
  - Inactive: `.nav-item-inactive` (Secondary text, transparent bg).
- **Sidebar Width**: `w-72` (18rem).

### Modals (`modals.css`)

- **Header**: `--font-lg`, semibold.
- **Content**: Card background.
- **Backdrop**: `--ui-backdrop` with opacity.
- **Close Button**: Transparent, hovers to secondary text.

### Toasts (`toasts.css`)

- **Position**: Fixed top-right (24px).
- **Style**: Card background, dropped shadow, blur effect.
- **Variants**: Success, Error, Warning, Info (Colored icon and left border).
- **Animation**: Slide in from right/bottom.

---

## 3. Utilities (`utils.css`)

### Text & Backgrounds

- `.text-slate-{300,400,500,600,700,900}`
- `.text-primary`, `.text-white`
- `.bg-subtle`, `.bg-hover`, `.bg-background-light`
- `.ui-icon-wrapper`: Default subtle background for icons.

### Scrollbars

- `.custom-scrollbar`: Thin (6px) scrollbar with `--ui-border` thumb color.

### Icon Wrappers

- `.ui-icon-{color}`: Sets specific background and text color defined in variables (e.g., `.ui-icon-blue`).

### Layout Helpers

- `.w-72`, `.w-64`
- `.h-24`, `.h-14`, `.h-8`
- `.max-w-6xl`
- `.rounded-{md,lg,xl,2xl,full}`

### Animations

- `.animate-spin`
- `.animate-fade-in`
- `.animate-fade-in-up`
