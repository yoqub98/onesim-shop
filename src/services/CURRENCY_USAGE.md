# Currency Service Usage Guide

## Overview
The currency service fetches dynamic USD to UZS exchange rates from the Central Bank of Uzbekistan (CBU) API, caches them for 24 hours, and provides conversion utilities.

## Features
- ✅ Fetches daily exchange rate from CBU API
- ✅ 24-hour cache in localStorage
- ✅ 1% markup on official CBU rate
- ✅ Fallback rate: 12,800 UZS/USD if API fails
- ✅ React Context for app-wide state management

## Quick Start

### 1. Currency Context is Already Integrated
The `CurrencyProvider` is already wrapped around your app in `App.jsx`:

```jsx
<CurrencyProvider>
  <AuthProvider>
    <AppContent />
  </AuthProvider>
</CurrencyProvider>
```

### 2. Using Currency in Components

```jsx
import { useCurrency } from '../contexts/CurrencyContext';

function MyComponent() {
  const { exchangeRate, convertToUZS, format, loading } = useCurrency();

  // Example: Convert $10 to UZS
  const [uzsPrice, setUzsPrice] = useState(0);

  useEffect(() => {
    const convert = async () => {
      const price = await convertToUZS(10); // $10
      setUzsPrice(price);
    };
    convert();
  }, [convertToUZS]);

  return (
    <div>
      {loading ? 'Loading...' : `Price: ${format(uzsPrice)} UZS`}
    </div>
  );
}
```

### 3. Updating Existing Price Calculations

**Before (static rate):**
```jsx
import { calculateFinalPrice, formatPrice } from '../config/pricing';

const uzsPrice = calculateFinalPrice(usdPrice); // Static rate
```

**After (dynamic rate):**
```jsx
import { useCurrency } from '../contexts/CurrencyContext';
import { calculateFinalPriceWithRate, formatPrice } from '../config/pricing';

function PriceComponent({ usdPrice }) {
  const { exchangeRate } = useCurrency();
  const [finalPrice, setFinalPrice] = useState(0);

  useEffect(() => {
    if (exchangeRate) {
      const price = calculateFinalPriceWithRate(usdPrice, exchangeRate);
      setFinalPrice(price);
    }
  }, [usdPrice, exchangeRate]);

  return <Text>{formatPrice(finalPrice)} UZS</Text>;
}
```

## API Reference

### `useCurrency()` Hook

Returns:
- `exchangeRate` (number) - Current USD to UZS rate
- `loading` (boolean) - Loading state
- `error` (string|null) - Error message if any
- `convertToUZS(usdAmount)` (function) - Convert USD to UZS
- `format(amount)` (function) - Format UZS amount (e.g., "125 000")
- `refresh()` (function) - Manually refresh rate from API

### Direct Service Functions

```js
import {
  getExchangeRate,
  convertUSDToUZS,
  formatUZS,
  refreshExchangeRate,
  getCacheInfo
} from '../services/currencyService';

// Get current rate
const rate = await getExchangeRate();

// Convert USD to UZS
const uzs = await convertUSDToUZS(10);

// Format for display
const formatted = formatUZS(125000); // "125 000"

// Force refresh (bypasses cache)
await refreshExchangeRate();

// Check cache status
const cacheInfo = getCacheInfo();
console.log(cacheInfo);
// {
//   rate: 12950,
//   timestamp: "2025-12-09T10:30:00.000Z",
//   isValid: true,
//   expiresIn: 86340000
// }
```

## Files to Update

These files currently use `calculateFinalPrice` and should be updated to use dynamic rates:

1. ✅ `src/config/pricing.js` - Added `calculateFinalPriceWithRate()` function
2. ⏳ `src/pages/PlansPage.jsx` - Update to use `useCurrency()`
3. ⏳ `src/pages/CountryPage.jsx` - Update to use `useCurrency()`
4. ⏳ `src/components/PlansSection.jsx` - Update to use `useCurrency()`

## Testing

### Manual Rate Refresh (for testing)
```jsx
import { useCurrency } from '../contexts/CurrencyContext';

function AdminPanel() {
  const { refresh, exchangeRate } = useCurrency();

  return (
    <div>
      <p>Current Rate: {exchangeRate}</p>
      <button onClick={refresh}>Refresh Rate</button>
    </div>
  );
}
```

### Clear Cache (for testing)
Open browser console and run:
```js
localStorage.removeItem('cbu_exchange_rate');
localStorage.removeItem('cbu_exchange_rate_timestamp');
```

## CBU API Information

- **Endpoint:** https://cbu.uz/ru/arkhiv-kursov-valyut/json/USD
- **Rate Type:** Official CBU daily rate
- **Update Time:** Updated daily by CBU (usually around 8:00 AM Tashkent time)
- **Markup:** 1% is added to the official rate
- **Cache:** 24 hours

## Error Handling

The service automatically falls back to 12,800 UZS/USD if:
- CBU API is down
- Network error occurs
- Invalid response received

All errors are logged to console with `[CurrencyService]` prefix for debugging.
