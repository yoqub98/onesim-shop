// src/contexts/CurrencyContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { getExchangeRate, convertUSDToUZS, formatUZS, refreshExchangeRate } from '../services/currencyService';

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [exchangeRate, setExchangeRate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch exchange rate on mount
  useEffect(() => {
    const fetchRate = async () => {
      try {
        setLoading(true);
        setError(null);
        const rate = await getExchangeRate();
        setExchangeRate(rate);
        console.log('[CurrencyContext] Exchange rate loaded:', rate);
      } catch (err) {
        console.error('[CurrencyContext] Error loading exchange rate:', err);
        setError('Failed to load exchange rate');
      } finally {
        setLoading(false);
      }
    };

    fetchRate();
  }, []);

  /**
   * Convert USD to UZS
   * @param {number} usdAmount
   * @returns {Promise<number>}
   */
  const convertToUZS = async (usdAmount) => {
    return await convertUSDToUZS(usdAmount);
  };

  /**
   * Format UZS amount for display
   * @param {number} amount
   * @returns {string}
   */
  const format = (amount) => {
    return formatUZS(amount);
  };

  /**
   * Manually refresh exchange rate from CBU API
   * @returns {Promise<void>}
   */
  const refresh = async () => {
    try {
      setLoading(true);
      setError(null);
      const rate = await refreshExchangeRate();
      setExchangeRate(rate);
      console.log('[CurrencyContext] Exchange rate refreshed:', rate);
    } catch (err) {
      console.error('[CurrencyContext] Error refreshing exchange rate:', err);
      setError('Failed to refresh exchange rate');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    exchangeRate,
    loading,
    error,
    convertToUZS,
    format,
    refresh,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

/**
 * Custom hook to use currency context
 * @returns {object}
 */
export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export default CurrencyContext;
