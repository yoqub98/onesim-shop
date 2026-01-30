# UI Implementation Guide for Travel Tariff Interface

This document contains the detailed UI specifications for the "Where are you going?" travel tariff interface.

## 1. Header Section
* **No UI changes, remains as it is.** (Refer to previous implementation for text/color content).

## 2. Tab Switcher (Focus)
The tab switcher requires specific sizing to fit the new compact layout.

* **Container:**
  - Background: `rgba(236, 238, 242, 0.59)`
  - Padding: `8px` inner padding.
  - Border Radius: `34px`.
  - Gap: `8px` between tabs.
* **Tab Item (Active):**
  - Background: `white`
  - Shadow: Small/Soft drop shadow (`shadow-sm`).
  - Border Radius: `24px`.
  - Padding: `12px 16px`.
  - Font: Bold, `14px`.
  - **Interaction:** Should feel tactile and distinct from the background.
* **Tab Item (Inactive):**
  - Border: `1px solid rgba(33, 40, 48, 0.17)`.
  - Background: Transparent.
  - Font: Medium, `14px`.

## 3. Region Cards (Focus)
The cards have been redesigned to be wider and more compact vertically.

### Dimensions & Shape
* **Height:** Fixed at `180px`.
* **Width:** `100%` (fills the grid column).
* **Border Radius:** `24px`.
* **Background:** Light linear gradient (White/Off-white).

### Special Gradient Border (Critical)
The card must have a **radial gradient border stroke** (overlay) with specific opacity stops.
* **Colors:**
  1. `#FE5F37` (Vibrant Orange) - *Start*
  2. `#AA999E` (45% Opacity) - *Middle*
  3. `#93A3B3` (30% Opacity) - *End*
* **Positioning:** The orange accent (`#FE5F37`) must be positioned at the **bottom-right corner** of the card.
* **Implementation Tip:** Use a CSS mask or a pseudo-element with `radial-gradient(circle at 100% 100%, ...)` to achieve the border effect without affecting the inner content.

### Content Layout
* **Typography:** Scale down titles to `22px` or `24px` (ExtraBold).
* **Flag Stack:**
  - **Overlap:** Flags must slightly overlap each other. Use a negative margin (e.g., `-10px` gap).
  - **Size:** Approx `32px` diameter.
* **Icons:**
  - **Use Heroicons** (e.g., `ArrowRightIcon` from `@heroicons/react/24/solid`) for the arrow button.
  - The arrow icon should be placed inside a **White Circle** (`48px` size) with a soft drop shadow.

## 4. Search Bar
* **Style:** Rounded pill shape (`24px` radius) with a light grey border.
* **Icon:** Use **Heroicons** `MagnifyingGlassIcon` (or similar search icon).

## 5. Layout & Responsiveness
The grid system is crucial for the section's behavior across devices.

* **Wide Screen (Desktop):**
  - **3 Columns** (3x3 layout if multiple rows).
* **Narrow Screen (Tablet/Laptop):**
  - **2 Columns** (2x2 layout).
* **Mobile:**
  - **1 Column** (1 card per row).
  - Cards stack vertically.
* **Container:** Center-aligned with a max-width of approx `1200px`.
