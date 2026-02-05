# Claude Code Prompt — DestinationCard Fixes & Refinements

---

## ISSUES TO FIX

### 1. CARD SIZE — Scale Down by ~18%

The current card (438px × 570px) is too large. Scale down all dimensions proportionally by approximately 18% to achieve better visual balance.

**NEW DIMENSIONS**:
```
Card outer: 360px wide × 470px tall (was 438×570)
Scale factor: 0.82 (18% reduction)
```

**Apply scaling to ALL measurements**:

| Element | Current | New (scaled) |
|---------|---------|--------------|
| Card width × height | 438×570px | **360×470px** |
| Card border radius | 48px | **39px** |
| Bottom bar width × height | 385×90px | **316×74px** |
| Bottom bar border radius | 47px | **39px** |
| Bottom bar position from edges | 26px | **21px** |
| Bottom bar padding horizontal | 22px / 12px | **18px / 10px** |
| Flag size | 51.5×34.333px | **42×28px** |
| Flag border radius | 8px | **7px** |
| Country name font size | 36px | **26px** (user specified 24-26px) |
| Country name letter spacing | -0.36px | **-0.26px** |
| Arrow circle size | 67.281px | **55px** |
| Arrow icon size | 24px | **20px** |
| Top badge width × height | 149×50px | **122×41px** |
| Top badge position | top: 27px, right: 26px | **top: 22px, right: 21px** |
| Top badge border radius | 54px | **44px** |
| Badge text font size | 20px | **16px** |
| Badge letter spacing | -0.2px | **-0.16px** |
| Dark overlay height | 420px | **345px** |
| Dark overlay border radius | 33px | **27px** |
| Gap between flag and name | 17px | **14px** |

---

### 2. LONG COUNTRY NAME TRUNCATION

When country names are too long (e.g., "Саудовская Аравия"), they overflow the card. Implement smart truncation.

**Approach**: Create a truncation map for long names in Russian/Uzbek:

```javascript
const COUNTRY_NAME_OVERRIDES = {
  ru: {
    SA: 'С. Аравия',          // Саудовская Аравия → С. Аравия
    AE: 'ОАЭ',                // Объединённые Арабские Эмираты → ОАЭ
    US: 'США',                // Соединённые Штаты Америки → США
  },
  uz: {
    SA: 'S. Arabiya',         // Saudiya Arabistoni → S. Arabiya
    AE: 'BAA',                // Birlashgan Arab Amirliklari → BAA
    US: 'AQSh',               // Amerika Qo'shma Shtatlari → AQSh
  },
  en: {
    SA: 'Saudi Arabia',       // Keep full name in English (shorter)
    AE: 'UAE',                // United Arab Emirates → UAE
    US: 'USA',                // United States of America → USA
  }
};

const getDisplayCountryName = (countryCode, lang) => {
  // Check if there's an override for this country in this language
  if (COUNTRY_NAME_OVERRIDES[lang]?.[countryCode]) {
    return COUNTRY_NAME_OVERRIDES[lang][countryCode];
  }
  // Otherwise use the default from i18n
  return getCountryName(countryCode, lang);
};
```

**Update component**:
```javascript
const countryName = getDisplayCountryName(countryCode, lang);
```

**Fallback CSS** (if name still overflows):
```jsx
<Text
  // ... existing props
  maxW="200px"              // NEW: max width constraint
  overflow="hidden"         // NEW: hide overflow
  textOverflow="ellipsis"   // NEW: show ... if still too long
  whiteSpace="nowrap"       // Keep existing
>
  {countryName}
</Text>
```

---

### 3. REDUCE BACKDROP BLUR ON BOTTOM BAR

The current blur (66.65px) is too strong and makes the text hard to read. Reduce it moderately.

**Change**:
```
Current: backdropFilter="blur(66.65px)"
New:     backdropFilter="blur(40px)"
```

This maintains the frosted glass effect but improves text legibility.

---

### 4. ADD MISSING ORANGE OVERLAY GRADIENT ON HOVER

There's a missing warm orange gradient that appears on hover, covering the entire card from top to bottom.

**New layer** (insert AFTER dark overlay, BEFORE bottom bar):

```jsx
{/* 3. Orange Overlay Gradient (appears on hover) */}
<Box
  position="absolute"
  top="0"
  left="0"
  right="0"
  bottom="0"
  bgGradient="linear(to-b, rgba(157,157,157,0) 0%, #DE5226 100%)"
  borderRadius="39px"
  opacity={isHovered ? 1 : 0}
  transition="opacity 0.4s ease-out"
  zIndex={1.5}
  pointerEvents="none"
/>
```

**Key details**:
- Gradient: from transparent gray at top (rgba(157,157,157,0)) to solid orange at bottom (#DE5226)
- Z-index: 1.5 (above dark overlay [1], below bottom bar [2])
- Opacity: 0 by default, 1 on hover
- Transition: `opacity 0.4s ease-out` — gentle fade-in
- Border radius: 39px (matches scaled card radius)

---

### 5. BOTTOM BAR HOVER STATE CHANGES

The bottom bar should have **enhanced styling on hover** (more prominent border, shadow, and background):

**Current code** (DEFAULT state):
```jsx
border={isHovered ? '1px solid rgba(255,255,255,0.15)' : '3px solid rgba(255,255,255,0.24)'}
boxShadow={isHovered ? 'none' : '0px 4px 23.6px 0px rgba(255, 161, 128, 0.4)'}
```

**NEW code** (SWAP the logic — hover state becomes MORE prominent):
```jsx
border={isHovered ? '3px solid rgba(255,255,255,0.24)' : '1px solid rgba(255,255,255,0.15)'}
boxShadow={isHovered ? '0 4px 23.6px 0 rgba(255,161,128,0.40)' : 'none'}
```

**Explanation**:
- **Default state**: subtle border (1px), no shadow — bar blends into card
- **Hover state**: thick bright border (3px), peachy glow shadow — bar "pops out"

The background and blur stay the same:
```jsx
bg="rgba(255, 255, 255, 0.07)"
backdropFilter="blur(40px)"  // ← updated from 66.65px
borderRadius="39px"          // ← scaled from 47px
```

---

## UPDATED FULL COMPONENT STRUCTURE

Here's the complete layer order with all fixes applied:

```jsx
<Box
  ref={cardRef}
  w="360px"                    // ← scaled from 438px
  h="470px"                    // ← scaled from 570px
  borderRadius="39px"          // ← scaled from 48px
  overflow="hidden"
  position="relative"
  cursor="pointer"
  onClick={handleExplore}
  onMouseEnter={() => setIsHovered(true)}
  onMouseLeave={() => setIsHovered(false)}
  opacity={isVisible ? 1 : 0}
  style={{
    transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
    transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`,
  }}
>
  {/* 1. Background Image (scales on hover) */}
  <Box
    position="absolute"
    top="-10%"
    left="0"
    w="100%"
    h="122%"
    zIndex={0}
    transition="transform 0.4s ease-out"
    transform={isHovered ? 'scale(1.08)' : 'scale(1)'}
  >
    <Image
      src={backgroundImageUrl}
      alt={countryName}
      w="100%"
      h="100%"
      objectFit="cover"
    />
  </Box>

  {/* 2. Dark Overlay (appears on hover) */}
  <Box
    position="absolute"
    bottom="0"
    left="0"
    right="0"
    h="345px"                  // ← scaled from 420px
    bgGradient="linear(to-b, rgba(55,55,55,0) 0%, rgba(4,4,4,0.47) 64%, rgba(0,0,0,0.5) 96%)"
    borderRadius="27px"        // ← scaled from 33px
    opacity={isHovered ? 1 : 0}
    transition="opacity 0.3s ease-out"
    zIndex={1}
    pointerEvents="none"
  />

  {/* 3. Orange Overlay Gradient (appears on hover) — NEW */}
  <Box
    position="absolute"
    top="0"
    left="0"
    right="0"
    bottom="0"
    bgGradient="linear(to-b, rgba(157,157,157,0) 0%, #DE5226 100%)"
    borderRadius="39px"
    opacity={isHovered ? 1 : 0}
    transition="opacity 0.4s ease-out"
    zIndex={1.5}
    pointerEvents="none"
  />

  {/* 4. Bottom Bar (flag + name + arrow) */}
  <HStack
    position="absolute"
    bottom="21px"              // ← scaled from 26px
    left="21px"                // ← scaled from 26px
    w="316px"                  // ← scaled from 385px
    h="74px"                   // ← scaled from 90px
    bg="rgba(255, 255, 255, 0.07)"
    backdropFilter="blur(40px)"  // ← REDUCED from 66.65px
    borderRadius="39px"        // ← scaled from 47px
    // SWAPPED hover logic — hover becomes MORE prominent
    border={isHovered ? '3px solid rgba(255,255,255,0.24)' : '1px solid rgba(255,255,255,0.15)'}
    boxShadow={isHovered ? '0 4px 23.6px 0 rgba(255,161,128,0.40)' : 'none'}
    transition="all 0.3s ease-out"
    justify="space-between"
    align="center"
    px="18px"                  // ← scaled from 22px
    pl="18px"
    pr="10px"                  // ← scaled from 12px
    py="6px"                   // ← scaled from 7px
    zIndex={2}
    pointerEvents="none"
  >
    {/* Left: flag + name */}
    <HStack spacing="14px" align="center">  {/* ← scaled from 17px */}
      <Box w="42px" h="28px" borderRadius="7px" overflow="hidden">  {/* ← scaled */}
        <CountryFlag
          code={countryCode}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </Box>
      <Text
        fontFamily="'Manrope', sans-serif"
        fontWeight="700"
        fontSize="26px"          // ← scaled from 36px (user spec: 24-26px)
        color="white"
        letterSpacing="-0.26px"  // ← scaled from -0.36px
        lineHeight="normal"
        whiteSpace="nowrap"
        maxW="200px"             // ← NEW: prevent overflow
        overflow="hidden"        // ← NEW
        textOverflow="ellipsis"  // ← NEW
      >
        {countryName}
      </Text>
    </HStack>

    {/* Right: arrow icon (slides in on hover) */}
    <Box
      w="55px"                   // ← scaled from 67.281px
      h="55px"
      borderRadius="full"
      bg="rgba(255, 255, 255, 0.15)"
      border="1px solid rgba(255, 255, 255, 0.2)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      transform={isHovered ? 'translateX(0)' : 'translateX(-65px)'}  // ← scaled from -80px
      opacity={isHovered ? 1 : 0}
      transition="transform 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.1s, opacity 0.3s ease-out"
    >
      <ArrowRightIcon style={{ width: '20px', height: '20px', color: 'white' }} />  {/* ← scaled from 24px */}
    </Box>
  </HStack>

  {/* 5. Top-Right Badge (package count, appears on hover) */}
  {packageCount !== null && (
    <Box
      position="absolute"
      top="22px"                 // ← scaled from 27px
      right="21px"               // ← scaled from 26px
      w="122px"                  // ← scaled from 149px
      h="41px"                   // ← scaled from 50px
      borderRadius="44px"        // ← scaled from 54px
      bg="rgba(0, 0, 0, 0.14)"
      backdropFilter="blur(10px)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      opacity={isHovered ? 1 : 0}
      transform={isHovered ? 'scale(1)' : 'scale(0.9)'}
      transition="opacity 0.3s ease-out 0.15s, transform 0.3s ease-out 0.15s"
      zIndex={3}
      pointerEvents="none"
    >
      <Text
        fontFamily="'Manrope', sans-serif"
        fontWeight="400"
        fontSize="16px"          // ← scaled from 20px
        color="white"
        letterSpacing="-0.16px"  // ← scaled from -0.2px
        lineHeight="normal"
      >
        {packageCount}+ тарифов
      </Text>
    </Box>
  )}
</Box>
```

---

## HELPER FUNCTION UPDATES

Add the country name override function at the top of the component file:

```javascript
// Add near the top with IMAGE_SLUG_MAP
const COUNTRY_NAME_OVERRIDES = {
  ru: {
    SA: 'С. Аравия',
    AE: 'ОАЭ',
    US: 'США',
  },
  uz: {
    SA: 'S. Arabiya',
    AE: 'BAA',
    US: 'AQSh',
  },
  en: {
    SA: 'Saudi Arabia',
    AE: 'UAE',
    US: 'USA',
  }
};

const getDisplayCountryName = (countryCode, lang) => {
  if (COUNTRY_NAME_OVERRIDES[lang]?.[countryCode]) {
    return COUNTRY_NAME_OVERRIDES[lang][countryCode];
  }
  return getCountryName(countryCode, lang);
};
```

Then update the component to use it:
```javascript
const countryName = getDisplayCountryName(countryCode, lang);  // ← instead of getCountryName
```

---

## UPDATED SCALING REFERENCE TABLE

Quick lookup for all scaled values:

| Measurement | Formula | Old | New |
|-------------|---------|-----|-----|
| Scale factor | - | 1.0 | **0.82** |
| Card W×H | - | 438×570 | **360×470** |
| All border radii | old × 0.82 | 48/47/33/8 | **39/39/27/7** |
| All positions | old × 0.82 | 26/27 | **21/22** |
| All padding | old × 0.82 | 22/12/7 | **18/10/6** |
| All font sizes | old × 0.72 | 36/20 | **26/16** |
| All widths/heights | old × 0.82 | various | **see table above** |

---

## Z-INDEX LAYER ORDER (for clarity)

From back to front:
1. **Z=0**: Background image
2. **Z=1**: Dark overlay (bottom gradient)
3. **Z=1.5**: Orange overlay (NEW — full card gradient)
4. **Z=2**: Bottom bar (frosted glass)
5. **Z=3**: Top badge

---

## WHAT CHANGED SUMMARY

1. ✅ **Card scaled down 18%** — all dimensions proportionally reduced
2. ✅ **Country name truncation** — smart overrides + CSS ellipsis
3. ✅ **Blur reduced** — 66.65px → 40px on bottom bar
4. ✅ **Orange gradient added** — new hover overlay layer
5. ✅ **Bottom bar hover enhanced** — border/shadow logic swapped (hover = more prominent)

---

## TESTING CHECKLIST

- [ ] Card appears smaller (360×470px instead of 438×570px)
- [ ] Country name font is 24-26px (now 26px)
- [ ] Long names truncate correctly (e.g., "С. Аравия")
- [ ] Bottom bar text is legible (blur reduced to 40px)
- [ ] Orange gradient appears smoothly on hover
- [ ] Bottom bar gets brighter border + shadow on hover (not dimmer)
- [ ] Arrow still slides in from left
- [ ] Badge still fades in from top-right
- [ ] All animations feel smooth (0.3-0.4s timing)
- [ ] Test with all 10 countries (TR, SA, AE, EG, TH, VN, CN, US, MY, ID)

---

**END OF FIX PROMPT**
