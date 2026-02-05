# Oasis Extension Design System (Extracted from GeneralSettings)

## 1. Page Layout

- **Container**: Flex column, full height (`h-full flex flex-col`).
- **Header**:
  - Height: `h-24` (6rem / 96px)
  - Padding: `px-8` (2rem / 32px)
  - Border: Bottom `border-b` (`border-slate-100` / `dark:border-slate-700`)
  - Alignment: `flex items-center justify-between`
- **Content Area**:
  - Scrollable: `flex-1 overflow-y-auto custom-scrollbar`
  - Padding: `px-5 pt-4 pb-5` (Sides: 3rem/48px, Top: 1.5rem/24px, Bottom: 3rem/48px)
  - Max Width: `max-w-3xl mx-auto` (48rem / 768px inner content)
  - Spacing: `d-flex flex-column gap-5` (3rem / 48px) between sections

## 2. Typography

- **Global**: Font size `16px` (`1rem` = `16px` in HTML default).
- **Header Title**:
  - Size: `text-[22px]`
  - Weight: `font-bold`
  - Color: `text-slate-900` (`dark:text-slate-50`)
- **Header Description**:
  - Size: `text-xs` (12px)
  - Color: `text-slate-500` (`dark:text-slate-400`/`#94a3b8`)
  - Margin: `mt-1`
- **Section Label**:
  - Size: `text-sm` (14px)
  - Weight: `font-semibold`
  - Color: `.settings-label` (`slate-900` / `white`)
  - Icon size: `text-[20px]`
- **Card Item Title**:
  - Size: `text-sm` (14px)
  - Weight: `font-medium`
  - Color: `.settings-text-primary` (`slate-900` / `dark:text-slate-100` `#f1f5f9`)
- **Card Item Description**:
  - Size: `text-xs` (12px)
  - Color: `.settings-text-secondary` (`slate-500` / `dark:text-slate-400` `#94a3b8`)
  - Margin: `mt-0.5`

### Dark Mode Text Summary

- **Primary Text**: `slate-100` (`#f1f5f9`)
- **Secondary/Muted**: `slate-400` (`#94a3b8`)
- **Headings**: `slate-50` (`#f8fafc`)

## 3. Colors

- **Primary**: `#137fec` (var(--bs-primary))
- **Primary (Dark)**: `#3b82f6` (blue-500) or `#60a5fa` (blue-400) for better contrast.
- **Backgrounds**:
  - Body: `#f3f4f6` (`slate-50` equiv) / Dark: `#0f172a` (`slate-900`)
  - Card: `#ffffff` / Dark: `#252525`
  - Header: Same as Body/Card context (White/Dark usually)
- **Borders**:
  - Light: `#e2e8f0` (`slate-200`) or `#f1f5f9` (`slate-100` for dividers)
  - Dark: `#333333`
- **Hovers**:
  - List Items: `hover:bg-slate-50/50` / Dark: `hover:bg-slate-700/30`

### Semantic Status Colors (Dark Mode)

- **Success**: `#4ade80` (green-400)
- **Danger**: `#f87171` (red-400)
- **Info**: `#38bdf8` (sky-400)
- **Warning**: `#fbbf24` (amber-400)

## 4. Components

### Cards

- Class: `.settings-card`
- Style: `rounded-xl border divide-y shadow-sm`
- Item Padding: `p-4` (1.5rem / 24px)
- **Spacing**:
  - Between Cards: `space-y-6` (1.5rem / 24px)
  - Inside Card (Sections): `space-y-3` (0.75rem / 12px)

### Icons

- Container: `p-2 rounded-lg`
- Size: `text-[24px]`
- Variants:
  - Blue: `.settings-icon-blue` (bg-blue-50 text-blue-600)
  - Indigo: `.settings-icon-indigo`
  - Green: `.settings-icon-green`
  - Purple: `.settings-icon-purple`
  - Orange: `.settings-icon-orange`
  - Red: `.settings-icon-red`
  - Teal: `.settings-icon-teal`
  - Pink: `.settings-icon-pink`
  - Gray: `.settings-icon-gray`

### Inputs & Selects

- Class: `.settings-input` (mapped to `.ui-input`)
- Height: `h-8` (2rem / 32px)
- **Constraints**:
  - Inputs: `max-width: 200px`
  - Selects: `max-width: 100px`
- Radius: `rounded-lg`
- Border: `border`
- Text: `text-xs` (12px)
- **Text Color**:
  - Light: Default
  - Dark: White (`#ffffff`) or Slate-50 (`#f8fafc`)
- Border: `border`
- Text: `text-xs` (12px)
- Focus: `focus:border-primary focus:ring-primary`
- **Spacing**:
  - Grid Gap: `gap-4` (1rem / 16px) for input groups.

### Buttons

- **Primary (Main Actions)**:
  - Class: `.settings-button-primary` (mapped to `.ui-button-primary`)
  - Background: Var `--bs-primary` (`#137fec`)
  - Text: White
  - Hover: Darker Blue (`#1170cf`)
- **Secondary (Default Actions)**:
  - Class: `.settings-button-secondary`
  - Size: `px-3 py-2 text-xs font-medium`
  - Style: `border rounded-lg`
- **Tertiary (Add Actions)**:
  - Class: `.ui-button-tertiary`
  - Size: `px-2.5 py-1.5 text-[11px] font-medium` (smaller than primary/secondary)
  - Style: `bg-primary/10 no-border rounded-lg`
  - Usage: "Add Rule", "Add Item" buttons
  - Dark Mode: No border. Text matches semantic color if applicable.
- **Danger (Delete/Clear)**:
  - Class: `.settings-button-danger`
- **Dashed (Add New)**:
  - Class: `.settings-button-dashed`
  - Style: `border border-dashed w-full flex items-center justify-center`
- **Icon Button (Action)**:
  - Class: `.ui-button-icon`
  - Style: `bg-transparent border-0 p-1 rounded text-slate-400 hover:text-primary transition-colors`
  - Hover Bg: `hover:bg-transparent` (Light) / `dark:hover:bg-white/5` (Dark)
  - Default Color (Dark): `text-slate-400` (`#94a3b8`)
  - Hover Color: Matches Primary or Semantic Danger/Success.

### Toggles (Switches)

- Standard Bootstrap `form-switch` with `form-check-input`.

### Modals

- **Overlay**:
  - Class: `position-fixed top-0 start-0 w-100 h-100`
  - **Background**: `rgba(15, 23, 42, 0.5)` (Slate-900 @ 50%)
  - **Effect**: `backdrop-filter: blur(4px)`
  - Z-Index: `1050`

- **Container (Card)**:
  - Class: `.ui-card`
  - **Background**:
    - Light: `#ffffff` (White)
    - Dark: `#252525` (Card Dark)
  - Radius: `rounded-xl`
  - Shadow: `shadow-lg`
  - Width: `w-100` with `max-width` constraint

- **Header**:
  - **Background**: Transparent (Inherits Container)
  - **Border Bottom**:
    - Light: `#f1f5f9` (Slate-100)
    - Dark: `#333333` (Divider Dark)
  - Padding: `p-4`
  - Title: `.ui-modal-title` (18px, font-semibold, ui-text-primary)

- **Body**:
  - **Background**: Transparent (Inherits Container)
  - Padding: `px-4`
  - Spacing: `gap-3` (vertical stack)

- **Footer**:
  - **Background**: Transparent (Inherits Container)
  - **Border Top**: Same as Header
  - Padding: `p-4`
  - Alignment: `d-flex justify-content-end gap-3`

## 10. Toast Notifications

**Component**: `src/options/components/Toast.vue`  
**Utility**: `src/options/utils/toast.js`

### Design Specifications

- **Position**: Fixed, top-right corner
  - `top: 80px` (below header)
  - `right: 24px`
  - `z-index: 9999`
- **Size**:
  - `min-width: 320px`
  - `max-width: 480px`
- **Styling**:
  - Background: `var(--ui-card-bg)`
  - Border: `1px solid var(--ui-border)` + 3px colored left border
  - Border Radius: `12px`
  - Shadow: `0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.08)`
  - Backdrop Filter: `blur(10px)`
  - Padding: `14px 16px`

### Toast Types

| Type    | Color     | Icon                           | Border Color |
| ------- | --------- | ------------------------------ | ------------ |
| Success | `#10b981` | `bi-check-circle-fill`         | Green        |
| Error   | `#ef4444` | `bi-exclamation-circle-fill`   | Red          |
| Warning | `#f59e0b` | `bi-exclamation-triangle-fill` | Amber        |
| Info    | `#3b82f6` | `bi-info-circle-fill`          | Blue         |

### Animation

- **Enter**: Slide from right + scale up
- **Leave**: Slide to right + scale down
- **Duration**: 300ms
- **Easing**: `cubic-bezier(0.4, 0, 0.2, 1)`

### Usage

```javascript
import { toast } from '@/options/utils/toast'

// Quick methods
toast.success('Changes saved successfully')
toast.error('Failed to save changes')
toast.warning('You have unsaved changes')
toast.info('Loading data...')
```

---

**Last Updated**: 2026-01-30

## Sidebar Component

**Component**: `src/options/components/AppSidebar.vue`

### Layout

- **Width**: `w-72` (288px, fixed)
- **Background**: `bg-slate-50` / `dark:bg-sidebar-dark`
- **Border**: `border-r border-slate-200` / `dark:border-divider-dark`

### Logo/Brand Section

- **Height**: `h-24` (96px)
- **Padding**: `px-4`
- **Border**: `border-b border-slate-100` / `dark:border-divider-dark`
- **Logo Icon**: `32x32px`, `bg-primary`, `rounded-lg`, icon size `text-base` (16px)
- **Title**: `text-base` (16px), `font-bold`

### Navigation Section

- **Padding**: `p-3`
- **Gap between groups**: `gap-4`
- **Scrollable**: `overflow-y-auto custom-scrollbar`

### Section Headers

- **Text**: `text-xs` (12px), `font-semibold`, `uppercase`, `tracking-wider`
- **Color**: `text-slate-400` / `dark:text-slate-500`
- **Padding**: `px-2 mb-2`

### Navigation Items

- **Padding**: `px-3 py-2`
- **Border Radius**: `rounded-lg`
- **Gap**: `gap-2` (0.5rem / 8px)
- **Icon Size**: `text-base` (16px)
- **Text Size**: `text-xs` (12px) ← Updated from 14px
- **Active State**: `nav-item-active`, `text-primary`, `font-medium`, `shadow-sm`
- **Inactive State**: `text-slate-600` / `dark:text-slate-400`
- **Hover**: `nav-item-hover`

### Add Buttons (+ icons)

- **Size**: `ui-button-icon`
- **Icon Size**: `text-xs` (12px) ← Updated from 14px
- **Position**: Right side of section header

### Status Indicators

- **Size**: `w-2 h-2` (8px)
- **Shape**: `rounded-full`
- **Position**: `ml-auto`

---

## 11. Button Border Specifications

- **Primary Button**: No border.
- **Secondary Button**:
  - **Light Mode**: 1px solid slate-300 (`#cbd5e1`).
  - **Dark Mode**: No visible border (`border-color: transparent`).
- **Tertiary / Icon Button**: No border.
