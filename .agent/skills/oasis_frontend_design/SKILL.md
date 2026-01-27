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

- **Root Font Size**: `14px` (1rem = 14px).
- **Font Family**: `Inter`, sans-serif (`font-display`).
- **Strict Size Classes**:
  - `text-[10px]`: for badges, tiny labels.
  - `text-xs`: (12px) for secondary text.
  - `text-sm`: (14px) for body text.
  - `text-[18px]`: for sidebar icons.
  - `text-[20px]`: for large icons.

### 1.3 Input Constraints

- **Text Input**: `max-width: 200px`, `height: 2rem` (32px).
- **Select**: `max-width: 100px`, `height: 2rem` (32px).
- **Overrides**: Use utility classes (e.g., `w-full`, `w-48`) to override this defaults if needed (ensure utilities have higher specificity or `!important`).

### 1.4 Colors

- **Primary**: `#137fec` (`bg-primary`, `text-primary`).
- **Backgrounds**:
  - Light: `#f3f4f6` (`bg-background-light`).
  - Dark: `#101922` (`bg-background-dark`).
  - Surface: `#ffffff` (`bg-white`) / `#1e293b` (`bg-surface-dark`).

## 2. Component Patterns

### 2.1 Sidebar (Options Page)

- Width: `w-72` (Fixed).
- Styles: `bg-slate-50 border-r border-slate-200`.
- Navigation Items: Rounded corners, hover effects (`hover:bg-slate-100`), active state (`bg-white shadow-sm border-slate-100 text-primary`).

### 2.2 Header

- Height: `h-24` (Options), `h-14` (Popup).
- visual: Border bottom, flex layout.
- **Title**: `text-[20px] font-bold text-slate-900 dark:text-slate-50`.
- **Subtitle**: `text-[10px] text-slate-500 dark:text-slate-400 mt-1`.

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
- **Titles**: `text-xs font-medium settings-text-primary`
- **Descriptions**: `text-[10px] settings-text-secondary`

#### Buttons

- **Secondary (Default)**: `.settings-button-secondary` (`px-3 py-2 text-[10px] font-medium border rounded-lg`)
- **Danger**: `.settings-button-danger`
- **Dashed (Add)**: `.settings-button-dashed` (`border-dashed w-full`)

#### Inputs & Selects

- **Class**: `.settings-input`
- **Height**: `h-8`
- **Font**: `text-[10px]`
- **State**: `focus:border-primary focus:ring-primary`

#### Section Labels

- **Style**: `text-[10px] font-semibold settings-label mb-4 flex items-center gap-2`
- **Icon**: `text-[18px]` text-primary

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
| **Dashed Button**  | `.ui-button-dashed`  | Transparent Border        | Transparent White-05 Hover         |

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

## 3. CSS Utilities (Tailwind-Compatibility)

The project uses standard CSS that _mimics_ Tailwind classes.

- **Do not assume all Tailwind classes exist.**
- **Safe List**: `flex`, `flex-col`, `items-center`, `justify-between`, `gap-1` to `gap-4`, `p-4`, `px-8`, `rounded-lg`, `rounded-xl`, `w-full`, `h-full`.
- **Custom**: `custom-scrollbar`, `size-5` (1.25rem), `size-7` (1.75rem).

## 4. Implementation Workflow

1. **Check Reference**: Look at `stitch_oasis_proxy` HTML files for structure.
2. **Adapt Icons**: Replace any `<span class="material-symbols-...">` with `<i class="bi bi-...">`.
3. **Verify Fonts**: Ensure `text-[10px]` or `text-xs` are used exactly as in the reference.
4. **Use Shared CSS**: Ensure `main.css` is imported.

---

**Usage**: Read this file before creating or modifying any Vue components or HTML files to ensure UI consistency.
