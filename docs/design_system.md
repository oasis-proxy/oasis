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
  - Padding: `p-8` (2rem / 32px)
  - Max Width: `max-w-3xl mx-auto` (48rem / 768px inner content)
  - Spacing: `space-y-8` between sections

## 2. Typography

- **Global**: Font size `14px` (`1rem` = `14px` in HTML).
- **Header Title**:
  - Size: `text-[20px]`
  - Weight: `font-bold`
  - Color: `text-slate-900` (`dark:text-slate-50`)
- **Header Description**:
  - Size: `text-[10px]`
  - Color: `text-slate-500` (`dark:text-slate-400`)
  - Margin: `mt-1`
- **Section Label**:
  - Size: `text-[10px]`
  - Weight: `font-semibold`
  - Color: `.settings-label` (`slate-900` / `white`)
  - Icon size: `text-[18px]`
- **Card Item Title**:
  - Size: `text-xs` (12px)
  - Weight: `font-medium`
  - Color: `.settings-text-primary` (`slate-900` / `slate-50`)
- **Card Item Description**:
  - Size: `text-[10px]`
  - Color: `.settings-text-secondary` (`slate-500` / `slate-400`)
  - Margin: `mt-0.5`

## 3. Colors

- **Primary**: `#137fec` (var(--bs-primary))
- **Backgrounds**:
  - Body: `#f3f4f6` (`slate-50` equiv) / Dark: `#0f172a` (`slate-900`)
  - Card: `#ffffff` / Dark: `#252525`
  - Header: Same as Body/Card context (White/Dark usually)
- **Borders**:
  - Light: `#e2e8f0` (`slate-200`) or `#f1f5f9` (`slate-100` for dividers)
  - Dark: `#333333`
- **Hovers**:
  - List Items: `hover:bg-slate-50/50` / Dark: `hover:bg-slate-700/30`

## 4. Components

### Cards

- Class: `.settings-card`
- Style: `rounded-xl border divide-y shadow-sm`
- Item Padding: `p-5` (1.25rem / 20px)
- **Spacing**:
  - Between Cards: `space-y-6` (1.5rem / 24px)
  - Inside Card (Sections): `space-y-6`

### Icons

- Container: `p-2 rounded-lg`
- Size: `text-[22px]`
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
- Text: `text-[10px]`
- Border: `border`
- Text: `text-[10px]`
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
  - Size: `px-3 py-2 text-[10px] font-medium`
  - Style: `border rounded-lg`
- **Danger (Delete/Clear)**:
  - Class: `.settings-button-danger`
- **Dashed (Add New)**:
  - Class: `.settings-button-dashed`
  - Style: `border border-dashed w-full flex items-center justify-center`

### Toggles (Switches)

- Standard Bootstrap `form-switch` with `form-check-input`.
