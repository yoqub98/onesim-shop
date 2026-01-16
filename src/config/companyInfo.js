// src/config/companyInfo.js
// Centralized configuration for company information and legal details
// Update these values when company details change or are finalized

export const COMPANY_INFO = {
  // Company Details
  name: 'ONETECH PRO LLC',
  inn: 'XXXX', // ИНН - to be updated
  address: 'XXXX', // Physical address - to be updated
  email: 'XXXX', // Support email - to be updated
  phone: 'XXXX', // Contact phone - to be updated

  // Website
  websiteDomain: '[XXXX]', // Website domain - to be updated
  websiteUrl: 'https://[XXXX]', // Full website URL - to be updated

  // eSIM Provider
  esimProvider: {
    name: 'EsimAccess Limited',
    description: 'иностранное юридическое лицо, зарегистрированное в соответствии с законодательством иностранного государства',
  },

  // Payment Services
  paymentProviders: ['Atmos', 'Click', 'Payme'],

  // Authentication
  authMethods: {
    oneId: 'OneID',
    hasOneId: true,
  },

  // Legal
  lastUpdated: 'XX.XX.2026', // Date of last terms update - to be updated
  refundProcessingDays: 'XX', // Number of business days for refund processing - to be updated

  // Country
  country: 'Республика Узбекистан',
  jurisdiction: 'законодательством Республики Узбекистан',
};

// Helper function to get formatted company name
export const getCompanyName = () => COMPANY_INFO.name;

// Helper function to get payment providers as formatted string
export const getPaymentProvidersText = () => {
  const providers = COMPANY_INFO.paymentProviders;
  if (providers.length === 0) return '';
  if (providers.length === 1) return providers[0];
  return providers.slice(0, -1).join(', ') + ' и ' + providers[providers.length - 1];
};

// Helper to check if value needs to be updated (contains XXXX or brackets)
export const needsUpdate = (value) => {
  if (!value) return true;
  return value.includes('XXXX') || value.includes('[') || value.includes(']');
};
