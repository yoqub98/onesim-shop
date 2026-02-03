# Claude Code Prompt — CountryPage Desktop Redesign

---

## TASK

Redesign `CountryPage.jsx` so that on **desktop (lg breakpoint and above)** it switches from the current card-grid layout to a new **two-column layout**: a left column with horizontal plan rows stacked vertically, and a right sidebar with a static feature-info panel. On **mobile / tablet (below lg)** the existing `DataPlanCard` grid layout stays exactly as it is — no changes there.

You will also need to create a **new component `DataPlanRow.jsx`** — this is the horizontal row version of a single plan, used only on desktop inside the new layout. The existing `DataPlanCard.jsx` stays untouched and continues to be used for mobile.

---

## WHAT STAYS UNCHANGED

- The **page header / banner** at the very top (the hero section with the country flag, country name, background image, description text, and the "X plans available" badge). Zero changes to that section.
- The **filter bar** styling and logic (the two `<Select>` dropdowns for data and duration, and the two sort arrow `<IconButton>`s). The visual style of those controls does not change. Only the background behind them changes — see below.
- All **data-fetching, filtering, sorting, pagination logic** inside `CountryPage.jsx` — keep it all the same.
- `DataPlanCard.jsx` — do not touch this file at all.

---

## PAGE-LEVEL LAYOUT CHANGE (desktop only, `lg` and up)

### Background

The entire area **below the header banner** — both the filter bar and the plans area — now sits on a single unified background color: **`#F9F9F9`** (very light gray, almost white). Previously the filter bar had `#E8E9EE` and the plans grid also had `#E8E9EE`. On desktop both of those become `#F9F9F9`. On mobile keep `#E8E9EE` as before.

### Filter Bar

The filter bar no longer has its own distinct colored stripe / border-bottom on desktop. It becomes a simple row of controls sitting on the `#F9F9F9` background with normal vertical padding (around `py={6}`). The "showing X of Y" text on the right side stays. No bottom border on desktop.

On mobile, keep the filter bar exactly as it is today (the `#E8E9EE` band with the border-bottom).

### Two-Column Layout (plans area, desktop only)

Below the filter bar, the content area splits into two columns using a flex row or Chakra `Grid`:

```
┌──────────────────────────────────────────────────────────┬──────────────────┐
│  LEFT COLUMN — plan rows stacked vertically              │  RIGHT COLUMN    │
│  width: roughly 65% of container (flex 1 or ~899px)      │  sidebar panel   │
│                                                          │  ~453px wide     │
│  gap between rows: 34px                                  │  position: sticky│
│  each row is a white rounded card                        │  top: aligned    │
│                                                          │  with first row  │
└──────────────────────────────────────────────────────────┴──────────────────┘

Gap between left and right columns: ~40px
```

Use Chakra `Grid` with `templateColumns` on desktop, e.g. `{ base: '1fr', lg: '1fr 453px' }` inside a `Container maxW="8xl"`. The right column content should be `position: sticky` and `top` set so it stays visible while scrolling through plans.

---

## NEW COMPONENT: `DataPlanRow.jsx`

This is a **new file** at `src/components/DataPlanRow.jsx`. It receives the same `plan` and `lang` props as `DataPlanCard`. It renders one horizontal plan row for the desktop layout.

### Outer Shell

- A single white (`bg="white"`) rounded card.
- `borderRadius="20px"`
- Padding: `px={22px} py={20px}` (use Chakra spacing or `px="22px" py="20px"`)
- **Shadow**: `boxShadow="0 -7px 48px 0px rgba(28, 32, 37, 0.1)"` — this is a shadow that goes *upward* (negative Y). Apply it per-row (each row has this shadow).
- The card is a horizontal flex row: left info section takes up remaining space, right price block is a fixed-width box.
- Cursor pointer, onClick navigates same as `DataPlanCard`.

### Inside the row — two sections side by side

```
┌─────────────────────────────────────────────┬──────────────────────────┐
│  LEFT SECTION (flex: 1, takes remaining)    │  RIGHT SECTION           │
│                                             │  price + heart + buy     │
│  ┌── Row 1: Data + Period ────────────┐     │  bg: #F2F3F6             │
│  │  [20] [GB]        Период           │     │  borderRadius: 18px      │
│  │                   15 дней          │     │  width: 347px            │
│  └────────────────────────────────────┘     │  height: 97px            │
│  ┌── Row 2: Network badge + Operators─┐     │                          │
│  │  [wifi 5G]  [Turk Telecom, +2]     │     │                          │
│  └────────────────────────────────────┘     │                          │
└─────────────────────────────────────────────┴──────────────────────────┘
```

---

#### LEFT SECTION — Row 1: Data value + Period

These two items sit on the **same horizontal line**, aligned by baseline. There is a **gap of 42px** between the data value group and the period group.

**Data value group** (left side):
- The number (e.g. `20`) and the unit (`GB`) sit on the same baseline, aligned to the bottom.
- Number: font `Manrope`, weight `800` (ExtraBold), size `34px`, color `#000000` (pure black).
- Unit (`GB`): font `Manrope`, weight `700` (Bold), size `20px`, color `#1D1D1D`. It sits to the right of the number, baseline-aligned (use `align="flex-end"` on the HStack, so both text bottoms line up).
- Gap between number and unit: ~2px.

**Period group** (right side of row 1):
- Stacked vertically (VStack), aligned to the **right** (`align="flex-end"`).
- Label on top: text `"Период"` — font `Manrope`, weight `500` (Medium), size `11px`, color `#7F8184` (muted gray).
- Value below: text e.g. `"15 дней"` — font `Manrope`, weight `700` (Bold), size `20px`, color `#1D1D1D`.

---

#### LEFT SECTION — Row 2: Network badge + Operators badge

This row sits below Row 1. The vertical gap between Row 1 and Row 2 is **~24–26px** (the two rows stack with the data/period on top, badges below — total left section height is ~100px).

Gap between the two badges horizontally: **9px**.

**Network badge** (e.g. `5G`):
- A pill/rounded box: `borderRadius="12px"`, height `36px`, width `77px`.
- Background: `white`.
- Border: `1px solid #D4D7E5`.
- Inside: an `HStack` with a wifi icon (use the same `WifiIcon` from heroicons, size `19px`, color `#FE4F18`) and the network text (e.g. `5G`).
- Network text: font `Manrope`, weight `500` (Medium), size `13px`, color `#151618`.
- Horizontal gap inside badge: `9px`.
- Padding inside badge: `9px` on all sides (the content is centered).

**Operators badge** (e.g. `Turk Telecom, Turkcell...+2`):
- Same pill shape: `borderRadius="12px"`, height `36px`, width `195px`.
- Background: `white`.
- Border: `1px solid #D4D7E5`.
- Inside: just text, horizontally centered (or left-padded `16px`).
- Text: font `Manrope`, weight `600` (SemiBold), size `13px`, color `#151618`.
- Text overflow: ellipsis if too long (`overflow="hidden"`, `textOverflow="ellipsis"`, `whiteSpace="nowrap"`).
- Use the same `formatOperatorsList` utility already exported from `DataPlanCard.jsx` — import and reuse it.

---

#### RIGHT SECTION — Price block

This is a self-contained box on the right side of each row.

- Background: **`#F2F3F6`** (light cool gray).
- `borderRadius="18px"`
- Width: **347px** (fixed).
- Height: **97px** (fixed).
- Padding: `px={16px} py={15px}`.
- Inside is a single horizontal row (`HStack`) that spreads its children with `justify="space-between"`.

**Left part of price block — prices stacked vertically:**
- VStack, `align="flex-start"`, gap `~1px`.

  - **UZS price** (top line):
    - Text e.g. `"225 000 UZS"` — all in one `<Text>`.
    - Font: `Manrope`, weight `600` (SemiBold), size `15px`.
    - Color: **`#FE4F18`** (orange brand color).

  - **USD price** (bottom line):
    - An HStack with the `$` sign and the number side by side, baseline aligned.
    - `$` sign: font `Manrope`, weight `700` (Bold), size `20px`, color `#151618`.
    - Number (e.g. `25`): font `Manrope`, weight `700` (Bold), size `22px`, color `#151618`.
    - Use the same `smartRoundDollar` logic from `DataPlanCard.jsx` — export it and import it here (it is not currently exported; add `export` to it).

**Right part of price block — heart icon + Buy button:**
- An HStack, `align="center"`, gap `11px`.

  - **Heart / Favorite icon button**:
    - A circular button, **45px × 45px**.
    - Background: `white`.
    - Border: `1px solid #E8E8E8` (very light gray border).
    - `borderRadius="full"` (perfect circle).
    - Inside: a heart icon (use `HeartIcon` from `@heroicons/react/24/outline`), size `24px`, color `#151618`.
    - On hover: heart color becomes `#FE4F18`, border becomes `#FE4F18`.
    - This is a placeholder for a future "favorites" feature — on click it does nothing for now (or just `e.stopPropagation()`).

  - **"Купить" (Buy) button**:
    - Width: `135px`, height `46px`.
    - `borderRadius="full"` (pill shape, fully rounded).
    - Background: **`rgba(255, 255, 255, 0.33)`** (semi-transparent white).
    - Border: `2px solid #FE4F18`.
    - Text: `t('plans.card.buy')` — font `Manrope`, weight `700` (Bold), size `15px`, color `#1F1F1F` (very dark, near black).
    - On hover: background becomes solid `#FE4F18`, text color becomes `white`, slight upward translate (`translateY(-2px)`), shadow `0 10px 30px rgba(254,79,24,0.4)` — same hover style as the existing `DataPlanCard` buy button.
    - `onClick` should call `e.stopPropagation()` and then navigate (same as `DataPlanCard` card click — or just let the whole row's `onClick` handle it for now).

---

## NEW COMPONENT: `FeatureInfoSidebar.jsx`

Create a new file `src/components/FeatureInfoSidebar.jsx`. This is the right-column sticky panel.

### Outer Shell

- Background: **`rgba(255, 255, 255, 0.27)`** — white at 27% opacity (frosted / glassmorphism feel).
- Border: **`1.8px solid #CFD2E3`** — a soft blue-gray border.
- `borderRadius="26px"`.
- Padding: `px={40px} py={28px}`.
- Width: **453px** (the parent grid column handles this; the component itself is `w="100%"`).
- No explicit box-shadow — the border and semi-transparent bg give it the glass feel.
- `position="sticky"` and `top` value set to the height of header + filter bar (you can pass a `stickyTop` prop, or just use a reasonable value like `top="180px"` — adjust to taste so it sticks below the filter bar as you scroll).

### Inside — 4 feature items

The 4 items are arranged in a single VStack. The **gap between each item is 50px** (this is a large, deliberate spacing — it gives the panel an airy, editorial feel).

Each item is a horizontal row (`HStack`), `align="center"`, gap `14px` (except the first item which has `gap 10px` in the design — use `14px` uniformly for consistency, the difference is negligible).

#### Each feature item structure:

**Icon box** (left):
- A square box, **42px × 42px**.
- `borderRadius="11px"`.
- Background: a **linear gradient** —
  ```
  linear-gradient(168.69deg,
    rgba(255, 233, 225, 0.8) 15.79%,   ← soft peach
    rgba(251, 232, 225, 0.8) 62.58%,   ← slightly warmer peach
    rgba(227, 227, 227, 0.8) 95.61%    ← light gray
  )
  ```
  This gives each icon box a warm orange-to-gray gradient wash.
- Padding inside: `7px` on all sides.
- The icon itself is **24px × 24px**, color **`#FE4F18`** (orange).

**Text block** (right of icon):
- A VStack, `align="flex-start"`, gap `0` (title and subtitle are tight).
- **Title**: font `Manrope`, weight `700` (Bold), size `16px`, color **`#20242C`** (very dark blue-black).
- **Subtitle**: font `Manrope`, weight `500` (Medium), size `14px`, color **`#5E6876`** (muted gray-blue). Letter-spacing: `-0.14px` (very slight tightening).

#### The 4 items (use i18n keys if they exist, otherwise hardcode for now):

1. **Icon**: WiFi icon (`WifiIcon` from heroicons, 24px, `#FE4F18`)
   **Title**: `"Точка доступа"` (Hotspot)
   **Subtitle**: `"Поддерживается раздача интернета по Wi-Fi"`

2. **Icon**: Lightning / bolt icon (`BoltIcon` from heroicons, 24px, `#FE4F18`)
   **Title**: `"Мгновенная активация"` (Instant activation)
   **Subtitle**: `"Активируется автоматически по прибытии"`

3. **Icon**: Phone-off / no-call icon (`PhoneXIcon` or `PhoneOffIcon` from heroicons, 24px, `#FE4F18` — pick whichever looks closest to a phone with an X)
   **Title**: `"Только Интернет!"` (Internet only!)
   **Subtitle**: `"Звонки и SMS не поддерживаются"`

4. **Icon**: A package / battery / refresh icon (`ArrowPathIcon` or `BatteryFullIcon` from heroicons, 24px, `#FE4F18` — pick whichever best represents "renewal/top-up")
   **Title**: `"Продление"` (Renewal)
   **Subtitle**: `"Можно пополнить и продлить пакет"`

---

## HOW `CountryPage.jsx` CHANGES

### Imports to add:
```js
import DataPlanRow from '../components/DataPlanRow';
import FeatureInfoSidebar from '../components/FeatureInfoSidebar';
```

### The plans rendering section (the part that currently renders the Grid of `DataPlanCard`s):

Replace it with a **responsive split**:

```jsx
{/* DESKTOP layout: lg and up */}
<Box display={{ base: 'none', lg: 'block' }}>
  <Grid templateColumns="1fr 453px" gap={10} /* 40px */>
    {/* LEFT: plan rows */}
    <VStack align="stretch" spacing="34px">
      {paginatedPlans.map((plan) => (
        <DataPlanRow
          key={plan.id}
          plan={plan}
          lang={currentLanguage}
          onClick={() => navigate(`/package/${plan.id}`, { state: { plan, countryCode } })}
        />
      ))}
    </VStack>

    {/* RIGHT: sticky sidebar */}
    <Box position="sticky" top="180px" alignSelf="flex-start">
      <FeatureInfoSidebar lang={currentLanguage} />
    </Box>
  </Grid>

  {/* Pagination stays below the two-column grid, full width */}
  {totalPages > 1 && (
    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
  )}
</Box>

{/* MOBILE layout: below lg */}
<Box display={{ base: 'block', lg: 'none' }}>
  <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
    {paginatedPlans.map((plan) => (
      <DataPlanCard key={plan.id} plan={plan} lang={currentLanguage}
        onClick={() => navigate(`/package/${plan.id}`, { state: { plan, countryCode } })}
      />
    ))}
  </Grid>
  {totalPages > 1 && (
    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
  )}
</Box>
```

### Loading skeleton on desktop:

When `loading === true` on desktop, render **3 skeleton rows** that match the `DataPlanRow` shape (white rounded box, `borderRadius 20px`, height `137px`, pulsing animation — same pulse keyframe style already used in `PlanCardSkeleton`). On mobile keep the existing `PlanCardSkeleton` grid.

### Filter bar background:
On desktop (`lg`+), set the filter bar's outer `<Box>` background to `#F9F9F9` and remove `borderBottom`. On mobile keep `#E8E9EE` with the border. Use responsive `bg` prop: `bg={{ base: '#E8E9EE', lg: '#F9F9F9' }}` and conditionally remove the border on lg.

### Plans area background:
Same logic — `bg={{ base: '#E8E9EE', lg: '#F9F9F9' }}` on the outer plans container.

---

## EXPORTS TO ADD IN `DataPlanCard.jsx`

Two things need to be exported so `DataPlanRow` can reuse them:
1. `smartRoundDollar` — add `export` keyword in front of `const smartRoundDollar`.
2. `formatOperatorsList` — already exported? If not, add `export`.
3. `parseHighestSpeed` — already exported ✓.

---

## PRECISE TOKEN / COLOR REFERENCE

| Token | Value | Used for |
|---|---|---|
| Brand orange | `#FE4F18` | Icons, UZS price text, Buy button border, icon hover |
| Dark text | `#151618` | USD price, badge text |
| Near-black | `#1D1D1D` | Data number, period value |
| Pure black | `#000` | Data number (largest) |
| Muted label | `#7F8184` | "Период" label |
| Subtitle gray | `#5E6876` | Sidebar subtitles |
| Title dark | `#20242C` | Sidebar titles |
| Badge border | `#D4D7E5` | Network / operator pill borders |
| Price block bg | `#F2F3F6` | Right side of each plan row |
| Page bg desktop | `#F9F9F9` | Filter + plans area bg on desktop |
| Page bg mobile | `#E8E9EE` | Filter + plans area bg on mobile |
| Sidebar border | `#CFD2E3` | Sidebar outer border |
| Sidebar bg | `rgba(255,255,255,0.27)` | Sidebar background |
| Heart border | `#E8E8E8` | Heart icon circle border (default) |
| Buy btn bg | `rgba(255,255,255,0.33)` | Buy button default bg |
| Row shadow | `0 -7px 48px 0px rgba(28,32,37,0.1)` | Each plan row shadow |

---

## FONT STACK

All text: `fontFamily="'Manrope', sans-serif"` — this is already used project-wide, make sure every new `<Text>` in the new components includes it (or set it once on an outer container).

---

## SUMMARY OF NEW / CHANGED FILES

| File | Action |
|---|---|
| `src/components/DataPlanRow.jsx` | **CREATE** — horizontal plan row for desktop |
| `src/components/FeatureInfoSidebar.jsx` | **CREATE** — sticky right-column info panel |
| `src/components/DataPlanCard.jsx` | **EDIT** — export `smartRoundDollar` (add `export` keyword) |
| `src/pages/CountryPage.jsx` | **EDIT** — import new components, add responsive desktop/mobile split in the plans section, update bg colors responsively |
