# Company Information Configuration

This directory contains centralized configuration for company information and legal details.

## File: `companyInfo.js`

This file contains all company-related information that is used throughout the application, especially in legal documents (Terms of Service, Privacy Policy, etc.).

### How to Update Company Information

All company details are centralized in the `COMPANY_INFO` object. Simply update the values in `src/config/companyInfo.js`:

```javascript
export const COMPANY_INFO = {
  // Company Details
  name: 'ONETECH PRO LLC',
  inn: 'XXXX', // ← Update your INN here
  address: 'XXXX', // ← Update your physical address here
  email: 'XXXX', // ← Update your support email here
  phone: 'XXXX', // ← Update your contact phone here

  // Website
  websiteDomain: '[XXXX]', // ← Update your domain here
  websiteUrl: 'https://[XXXX]', // ← Update full URL here

  // ... other fields
};
```

### Fields That Need to Be Updated

Look for values containing `XXXX` or `[XXXX]` - these are placeholders that need to be replaced with actual values:

- `inn` - Company INN (ИНН)
- `address` - Physical company address
- `email` - Support email address
- `phone` - Contact phone number
- `websiteDomain` - Your website domain name
- `websiteUrl` - Full website URL
- `lastUpdated` - Date of last terms update
- `refundProcessingDays` - Number of business days for refund processing

### Helper Functions

The file exports helper functions to format company information:

- `getCompanyName()` - Returns the company name
- `getPaymentProvidersText()` - Returns formatted list of payment providers (e.g., "Atmos, Click и Payme")
- `needsUpdate(value)` - Checks if a value still needs to be updated (contains XXXX or brackets)

### Usage Example

```javascript
import { COMPANY_INFO, getPaymentProvidersText } from '../config/companyInfo';

// Use in your component
<Text>Company: {COMPANY_INFO.name}</Text>
<Text>Payment methods: {getPaymentProvidersText()}</Text>
```

### Where This Config Is Used

- `/src/pages/legal/TermsOfService.jsx` - Terms of Service page
- `/src/pages/legal/PrivacyPolicy.jsx` - Privacy Policy page (if exists)
- Any other legal or informational pages

### Important Notes

1. **Single Source of Truth**: Update values ONLY in `companyInfo.js` - they will automatically propagate to all pages using them.
2. **Version Control**: When you update company information, commit the changes with a clear message indicating what was changed.
3. **Validation**: Before going to production, check that no values still contain `XXXX` or placeholder brackets.
