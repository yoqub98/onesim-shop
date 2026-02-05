# Claude Code Prompt — DestinationCard Component Complete Redesign

---

## TASK OVERVIEW

Completely redesign the `DestinationCard` component to match the new Figma design. This card is displayed in the "Popular Destinations" section on the homepage. The redesign includes:
1. **New visual design** — large background image with overlay effects and frosted-glass bottom bar
2. **New hover animations** — background zoom, arrow slide-in, overlay darkening, badge fade-in
3. **New country list** — 10 countries in a specific order (replacing the current list)
4. **Dynamic package count** — fetch and display the number of available plans per country

---

## CURRENT COMPONENT TO UPDATE

**File**: `src/components/DestinationCard.jsx` (or locate it if named differently)

**Current structure** (for reference — will be completely replaced):
- Simple card with white background, border, and padding
- Flag icon (64×48px) + country name in an HStack
- "Explore" button that appears on hover
- Hover effects: translateY(-8px), scale(1.02), orange border, orange shadow
- Uses `getCountryName()` for localized names
- Navigates to `/country/${countryCode}` on click

**What to keep**:
- Same props: `countryCode`, `delay`, `lang`
- Same navigation behavior (onClick → navigate to country page)
- Same i18n approach (use `getCountryName(countryCode, lang)` for country names)
- Same scroll animation hook (`useScrollAnimation`) for entrance animation

**What changes**:
- Entire card structure and styling (see below)
- Hover animations (new approach)
- Flag display (now inside bottom bar with smaller size)
- Background image (new, from provided URLs)

---

## NEW DESIGN SPECIFICATION FROM FIGMA

### 1. CARD OUTER CONTAINER

```
Dimensions: 438px × 570px
Border radius: 48px
Overflow: hidden (CRITICAL — clips the scaling background)
Position: relative
Cursor: pointer
Background: none (image handles this)
```

**Chakra UI**:
```jsx
<Box
  w="438px"
  h="570px"
  borderRadius="48px"
  overflow="hidden"
  position="relative"
  cursor="pointer"
  onClick={handleExplore}
  // ... entrance animation props (keep existing scroll animation)
>
```

---

### 2. BACKGROUND IMAGE LAYER

This is the country photo that fills the card and scales on hover.

```
Position: absolute
Top: -10% (to allow scale room without showing edges)
Left: 0
Width: 100%
Height: 122% (oversized to allow scaling without gaps)
Object-fit: cover
Border radius: inherit (48px via parent overflow hidden)
Z-index: 0
Transition: transform 0.4s ease-out
Transform on hover: scale(1.08) — gentle zoom
```

**Chakra UI**:
```jsx
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
```

**Background image URL structure**:
Base: `https://ik.imagekit.io/php1jcf0t/OneSim/Background-Cover-Images/Country%20Cards/`
Filename: `{country-slug}.jpg`

Mapping (countryCode → slug):
```javascript
const IMAGE_SLUG_MAP = {
  TR: 'turkey',
  SA: 'saudi-arabia',
  AE: 'uae',
  EG: 'egypt',
  TH: 'thailand',
  VN: 'vietnam',
  CN: 'china',
  US: 'usa',
  MY: 'malaysia',
  ID: 'indonesia',
};
```

Construct URL:
```javascript
const getBackgroundImageUrl = (countryCode) => {
  const slug = IMAGE_SLUG_MAP[countryCode] || countryCode.toLowerCase();
  return `https://ik.imagekit.io/php1jcf0t/OneSim/Background-Cover-Images/Country%20Cards/${slug}.jpg`;
};
```

---

### 3. DARK OVERLAY LAYER (appears on hover)

This darkens the bottom half of the card on hover to make the bottom bar more prominent.

**Default state** (no overlay visible):
- Opacity: 0

**Hover state**:
- Opacity: 1
- Position: absolute, bottom 0, left 0, right 0
- Height: 420px (covers bottom ~70% of card)
- Background: `linear-gradient(to bottom, rgba(55,55,55,0) 0%, rgba(4,4,4,0.47) 64%, rgba(0,0,0,0.5) 96%)`
- Z-index: 1 (above background image, below bottom bar)
- Transition: opacity 0.3s ease-out
- Border radius: 33px (to match card inner radius)

**Chakra UI**:
```jsx
<Box
  position="absolute"
  bottom="0"
  left="0"
  right="0"
  h="420px"
  bgGradient="linear(to-b, rgba(55,55,55,0) 0%, rgba(4,4,4,0.47) 64%, rgba(0,0,0,0.5) 96%)"
  borderRadius="33px"
  opacity={isHovered ? 1 : 0}
  transition="opacity 0.3s ease-out"
  zIndex={1}
  pointerEvents="none"
/>
```

---

### 4. BOTTOM BAR (country info + arrow)

This is the frosted-glass bar at the bottom with flag, country name, and arrow icon.

**Position & Size**:
```
Position: absolute
Bottom: 26px (from card bottom)
Left: 26px
Width: 385px
Height: 90px
Border radius: 47px (fully rounded pill)
Z-index: 2 (above overlay)
```

**Styling**:
```
Background: rgba(255, 255, 255, 0.07) — semi-transparent white
Backdrop filter: blur(66.65px) — strong blur for frosted glass effect
Border (default): 3px solid rgba(255, 255, 255, 0.24) — bright, thick border
Border (hover): 1px solid rgba(255, 255, 255, 0.15) — subtle, thin border
Box shadow (default): 0px 4px 23.6px 0px rgba(255, 161, 128, 0.4) — warm peachy glow
Box shadow (hover): none — glow disappears
Transition: all 0.3s ease-out
```

**Layout inside bar**:
- Display: flex (HStack)
- Justify: space-between
- Align: center
- Padding: left 22px, right 12px, top/bottom 7px

**Chakra UI**:
```jsx
<HStack
  position="absolute"
  bottom="26px"
  left="26px"
  w="385px"
  h="90px"
  bg="rgba(255, 255, 255, 0.07)"
  backdropFilter="blur(66.65px)"
  borderRadius="47px"
  border={isHovered ? '1px solid rgba(255,255,255,0.15)' : '3px solid rgba(255,255,255,0.24)'}
  boxShadow={isHovered ? 'none' : '0px 4px 23.6px 0px rgba(255, 161, 128, 0.4)'}
  transition="all 0.3s ease-out"
  justify="space-between"
  align="center"
  px="22px"
  py="7px"
  zIndex={2}
  pointerEvents="none"
>
  {/* Left side: flag + name */}
  {/* Right side: arrow icon */}
</HStack>
```

---

### 5. BOTTOM BAR — LEFT SIDE (flag + country name)

**Flag icon**:
```
Size: 51.5px wide × 34.333px tall
Border radius: 8px
Object-fit: cover
```

**Country name**:
```
Font: Manrope Bold
Size: 36px
Color: white
Letter spacing: -0.36px
Line height: 45.427px
White-space: nowrap
```

**Gap between flag and name**: 17px

**Chakra UI**:
```jsx
<HStack spacing="17px" align="center">
  <Box
    w="51.5px"
    h="34.333px"
    borderRadius="8px"
    overflow="hidden"
  >
    <CountryFlag
      code={countryCode}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover'
      }}
    />
  </Box>
  <Text
    fontFamily="'Manrope', sans-serif"
    fontWeight="700"
    fontSize="36px"
    color="white"
    letterSpacing="-0.36px"
    lineHeight="45.427px"
    whiteSpace="nowrap"
  >
    {countryName}
  </Text>
</HStack>
```

---

### 6. BOTTOM BAR — RIGHT SIDE (arrow icon)

This is a **circular arrow icon** that slides in from the left on hover.

**Circle container**:
```
Size: 67.281px × 67.281px
Border radius: full (perfect circle)
Background: rgba(255, 255, 255, 0.15) — semi-transparent white
Border: 1px solid rgba(255, 255, 255, 0.2)
Transition: all 0.3s ease-out
```

**Arrow icon inside**:
- Use `ArrowRightIcon` from heroicons (24px size)
- Color: white
- Centered in the circle

**Animation on hover**:
- **Default state**: `translateX(-80px)` + `opacity: 0` — hidden off to the left
- **Hover state**: `translateX(0)` + `opacity: 1` — slides in from left
- **Transition**: `transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease-out`
- **Delay**: 0.1s (slight delay so it appears after the overlay darkens)

**Chakra UI**:
```jsx
<Box
  w="67.281px"
  h="67.281px"
  borderRadius="full"
  bg="rgba(255, 255, 255, 0.15)"
  border="1px solid rgba(255, 255, 255, 0.2)"
  display="flex"
  alignItems="center"
  justifyContent="center"
  transform={isHovered ? 'translateX(0)' : 'translateX(-80px)'}
  opacity={isHovered ? 1 : 0}
  transition="transform 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.1s, opacity 0.3s ease-out"
>
  <ArrowRightIcon style={{ width: '24px', height: '24px', color: 'white' }} />
</Box>
```

---

### 7. TOP-RIGHT BADGE (package count)

This badge appears on hover in the top-right corner showing "XX тарифов" (XX plans).

**Position & Size**:
```
Position: absolute
Top: 27px
Right: 26px (or left: 262px from the left edge)
Width: 149px
Height: 50px
Border radius: 54px (fully rounded pill)
Z-index: 3 (above everything)
```

**Styling**:
```
Background: rgba(0, 0, 0, 0.14) — dark semi-transparent
Backdrop filter: blur(10px) — frosted glass
Transition: opacity 0.3s ease-out, transform 0.3s ease-out
```

**Animation on hover**:
- **Default state**: `opacity: 0` + `scale(0.9)` — hidden and slightly smaller
- **Hover state**: `opacity: 1` + `scale(1)` — fades in and scales up
- **Transition**: `opacity 0.3s ease-out 0.15s, transform 0.3s ease-out 0.15s` — 0.15s delay

**Text inside**:
```
Font: Manrope Regular
Size: 20px
Color: white
Letter spacing: -0.2px
Line height: 45.427px
Format: "{count}+ тарифов" (e.g., "12+ тарифов")
```

**Chakra UI**:
```jsx
<Box
  position="absolute"
  top="27px"
  right="26px"
  w="149px"
  h="50px"
  borderRadius="54px"
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
    fontSize="20px"
    color="white"
    letterSpacing="-0.2px"
    lineHeight="45.427px"
  >
    {packageCount}+ тарифов
  </Text>
</Box>
```

---

## 8. FETCHING PACKAGE COUNT

You need to fetch the number of available packages for each country to display in the badge.

**Approach 1** — If package data is already cached or available in context:
Look for existing API calls or cached data in the codebase (e.g., `packageCacheService.js` or similar). The card might already have access to this data via props or context.

**Approach 2** — Fetch on component mount:
If not available, fetch the package count when the component mounts:

```javascript
const [packageCount, setPackageCount] = useState(null);

useEffect(() => {
  const fetchPackageCount = async () => {
    try {
      // Replace with actual API call
      const packages = await fetchAllPackagesForCountry(countryCode);
      setPackageCount(packages.length);
    } catch (error) {
      console.error('Error fetching package count:', error);
      setPackageCount(0);
    }
  };
  
  fetchPackageCount();
}, [countryCode]);
```

**Display logic**:
- If `packageCount` is null (loading), show nothing (badge stays hidden)
- If `packageCount` is 0, show "0 тарифов"
- If `packageCount` > 0, show "{packageCount}+ тарифов"

---

## 9. NEW COUNTRY LIST

Replace the current country list with these 10 countries **in this exact order**:

```javascript
const POPULAR_DESTINATIONS = [
  'TR',  // Turkey
  'SA',  // Saudi Arabia
  'AE',  // UAE
  'EG',  // Egypt
  'TH',  // Thailand
  'VN',  // Vietnam
  'CN',  // China
  'US',  // USA
  'MY',  // Malaysia
  'ID',  // Indonesia
];
```

**Where to update**:
1. Locate where the country list is defined (could be in the parent component like `HomePage.jsx`, or in a constants file like `src/config/countries.js`)
2. Replace the existing array with `POPULAR_DESTINATIONS` above
3. Ensure the parent component maps through this array and renders `<DestinationCard countryCode={code} ... />` for each

---

## 10. COMPLETE COMPONENT CODE STRUCTURE

Here's the overall structure with all layers in the correct order:

```jsx
import { Box, HStack, Text, Image } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import CountryFlag from './CountryFlag';
import { getCountryName } from '../config/i18n';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { fetchAllPackagesForCountry } from '../services/esimAccessApi'; // or wherever you fetch packages

const IMAGE_SLUG_MAP = {
  TR: 'turkey',
  SA: 'saudi-arabia',
  AE: 'uae',
  EG: 'egypt',
  TH: 'thailand',
  VN: 'vietnam',
  CN: 'china',
  US: 'usa',
  MY: 'malaysia',
  ID: 'indonesia',
};

const getBackgroundImageUrl = (countryCode) => {
  const slug = IMAGE_SLUG_MAP[countryCode] || countryCode.toLowerCase();
  return `https://ik.imagekit.io/php1jcf0t/OneSim/Background-Cover-Images/Country%20Cards/${slug}.jpg`;
};

const DestinationCard = ({ countryCode, delay = 0, lang }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [packageCount, setPackageCount] = useState(null);
  const [cardRef, isVisible] = useScrollAnimation(0.1);
  const navigate = useNavigate();
  const countryName = getCountryName(countryCode, lang);
  const backgroundImageUrl = getBackgroundImageUrl(countryCode);

  useEffect(() => {
    const fetchPackageCount = async () => {
      try {
        const packages = await fetchAllPackagesForCountry(countryCode);
        setPackageCount(packages.length);
      } catch (error) {
        console.error('Error fetching package count:', error);
        setPackageCount(0);
      }
    };
    fetchPackageCount();
  }, [countryCode]);

  const handleExplore = () => {
    navigate(`/country/${countryCode}`);
  };

  return (
    <Box
      ref={cardRef}
      w="438px"
      h="570px"
      borderRadius="48px"
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
        h="420px"
        bgGradient="linear(to-b, rgba(55,55,55,0) 0%, rgba(4,4,4,0.47) 64%, rgba(0,0,0,0.5) 96%)"
        borderRadius="33px"
        opacity={isHovered ? 1 : 0}
        transition="opacity 0.3s ease-out"
        zIndex={1}
        pointerEvents="none"
      />

      {/* 3. Bottom Bar (flag + name + arrow) */}
      <HStack
        position="absolute"
        bottom="26px"
        left="26px"
        w="385px"
        h="90px"
        bg="rgba(255, 255, 255, 0.07)"
        backdropFilter="blur(66.65px)"
        borderRadius="47px"
        border={isHovered ? '1px solid rgba(255,255,255,0.15)' : '3px solid rgba(255,255,255,0.24)'}
        boxShadow={isHovered ? 'none' : '0px 4px 23.6px 0px rgba(255, 161, 128, 0.4)'}
        transition="all 0.3s ease-out"
        justify="space-between"
        align="center"
        px="22px"
        py="7px"
        zIndex={2}
        pointerEvents="none"
      >
        {/* Left: flag + name */}
        <HStack spacing="17px" align="center">
          <Box w="51.5px" h="34.333px" borderRadius="8px" overflow="hidden">
            <CountryFlag
              code={countryCode}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </Box>
          <Text
            fontFamily="'Manrope', sans-serif"
            fontWeight="700"
            fontSize="36px"
            color="white"
            letterSpacing="-0.36px"
            lineHeight="45.427px"
            whiteSpace="nowrap"
          >
            {countryName}
          </Text>
        </HStack>

        {/* Right: arrow icon (slides in on hover) */}
        <Box
          w="67.281px"
          h="67.281px"
          borderRadius="full"
          bg="rgba(255, 255, 255, 0.15)"
          border="1px solid rgba(255, 255, 255, 0.2)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          transform={isHovered ? 'translateX(0)' : 'translateX(-80px)'}
          opacity={isHovered ? 1 : 0}
          transition="transform 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.1s, opacity 0.3s ease-out"
        >
          <ArrowRightIcon style={{ width: '24px', height: '24px', color: 'white' }} />
        </Box>
      </HStack>

      {/* 4. Top-Right Badge (package count, appears on hover) */}
      {packageCount !== null && (
        <Box
          position="absolute"
          top="27px"
          right="26px"
          w="149px"
          h="50px"
          borderRadius="54px"
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
            fontSize="20px"
            color="white"
            letterSpacing="-0.2px"
            lineHeight="45.427px"
          >
            {packageCount}+ тарифов
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default DestinationCard;
```

---

## 11. PARENT COMPONENT UPDATE (e.g., HomePage.jsx)

Find where the Popular Destinations section is rendered (probably `HomePage.jsx` or similar).

**Replace the country list** with:
```javascript
const POPULAR_DESTINATIONS = [
  'TR', 'SA', 'AE', 'EG', 'TH',
  'VN', 'CN', 'US', 'MY', 'ID'
];
```

**Rendering**:
```jsx
<Grid
  templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
  gap={6}
  w="100%"
>
  {POPULAR_DESTINATIONS.map((countryCode, index) => (
    <DestinationCard
      key={countryCode}
      countryCode={countryCode}
      lang={currentLanguage}
      delay={index * 100}
    />
  ))}
</Grid>
```

---

## 12. ANIMATION TIMING SUMMARY

All animations react **instantly** on hover (no delay on hover start, only on specific elements as noted):

| Element | Default State | Hover State | Transition | Delay |
|---------|--------------|-------------|------------|-------|
| **Background image** | scale(1) | scale(1.08) | transform 0.4s ease-out | 0 |
| **Dark overlay** | opacity: 0 | opacity: 1 | opacity 0.3s ease-out | 0 |
| **Bottom bar border** | 3px bright | 1px subtle | all 0.3s ease-out | 0 |
| **Bottom bar shadow** | peachy glow | none | all 0.3s ease-out | 0 |
| **Arrow icon** | translateX(-80px), opacity 0 | translateX(0), opacity 1 | transform 0.4s cubic-bezier + opacity 0.3s | **0.1s** |
| **Top badge** | opacity 0, scale(0.9) | opacity 1, scale(1) | opacity 0.3s + transform 0.3s | **0.15s** |

---

## 13. RESPONSIVE BEHAVIOR

The card is currently fixed at 438×570px. For smaller screens, you may want to scale it down proportionally or set a max-width. Consider:

```jsx
w={{ base: '100%', md: '438px' }}
maxW="438px"
h={{ base: 'auto', md: '570px' }}
aspectRatio="438/570"
```

Adjust font sizes and spacing proportionally for mobile if needed (but test desktop first).

---

## 14. FINAL CHECKLIST

- [ ] Update `DestinationCard.jsx` with the complete new design
- [ ] Add `IMAGE_SLUG_MAP` and `getBackgroundImageUrl()` helper
- [ ] Implement package count fetching logic
- [ ] Test all hover animations (background zoom, overlay, arrow slide, badge fade)
- [ ] Replace country list in parent component with new 10-country array
- [ ] Verify all countries load correct background images
- [ ] Test that clicking navigates to correct country page
- [ ] Check entrance scroll animation still works
- [ ] Verify responsive behavior on mobile/tablet
- [ ] Test in different browsers (Chrome, Safari, Firefox)

---

## 15. TROUBLESHOOTING NOTES

**If backdrop-filter blur doesn't work**:
- Add `-webkit-backdrop-filter: blur(66.65px)` for Safari
- Or use a Chakra prop: `css={{ WebkitBackdropFilter: 'blur(66.65px)' }}`

**If images don't load**:
- Check the URL construction in `getBackgroundImageUrl()`
- Verify imagekit.io URLs are accessible (CORS, 404 errors)
- Add error handling for `<Image>` component (fallback image)

**If arrow icon doesn't import**:
- Ensure `@heroicons/react` is installed: `npm install @heroicons/react`
- Import path: `import { ArrowRightIcon } from '@heroicons/react/24/outline'`

**If animations feel too fast/slow**:
- Adjust timing values (currently 0.3s–0.4s)
- Use Chrome DevTools to slow down animations for testing

---

## 16. DESIGN TOKENS REFERENCE

| Token | Value | Usage |
|-------|-------|-------|
| Card size | 438×570px | Outer container |
| Card radius | 48px | Outer border |
| Inner radius | 33px / 47px | Overlay / bottom bar |
| Bottom bar size | 385×90px | Flag + name + arrow |
| Top badge size | 149×50px | Package count |
| Flag size | 51.5×34.333px | Small rounded flag |
| Arrow circle | 67.281×67.281px | Circular button |
| Font family | Manrope | All text |
| Country name | 36px / bold | White, -0.36px spacing |
| Badge text | 20px / regular | White, -0.2px spacing |
| White overlay | rgba(255,255,255,0.07) | Bottom bar bg |
| Dark overlay gradient | rgba(0,0,0,0) → rgba(0,0,0,0.5) | Hover darkening |
| Peachy glow | rgba(255,161,128,0.4) | Default shadow |
| Blur strength | 66.65px | Frosted glass |

---

**END OF PROMPT**
