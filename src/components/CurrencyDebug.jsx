// src/components/CurrencyDebug.jsx
import React from 'react';
import { Box, VStack, Heading, Text, Button, Code } from '@chakra-ui/react';
import { useCurrency } from '../contexts/CurrencyContext';
import { getCacheInfo } from '../services/currencyService';

/**
 * CurrencyDebug - Debug component to verify CBU API integration
 * Add this temporarily to any page to check if currency service is working
 *
 * Usage:
 * import CurrencyDebug from '../components/CurrencyDebug';
 * <CurrencyDebug />
 */
const CurrencyDebug = () => {
  const { exchangeRate, loading, error, refresh } = useCurrency();
  const cacheInfo = getCacheInfo();

  const handleRefresh = async () => {
    console.log('🔄 Manual refresh triggered...');
    await refresh();
    window.location.reload(); // Reload to see updated cache info
  };

  const handleClearCache = () => {
    localStorage.removeItem('cbu_exchange_rate');
    localStorage.removeItem('cbu_exchange_rate_timestamp');
    console.log('🗑️ Cache cleared! Reload page to fetch fresh rate.');
    alert('Cache cleared! Reload the page to fetch a fresh rate from CBU API.');
  };

  const isUsingFallback = exchangeRate === 12800;
  const isUsingAPI = exchangeRate && exchangeRate !== 12800;

  return (
    <Box
      position="fixed"
      bottom="20px"
      right="20px"
      bg="white"
      p={6}
      borderRadius="xl"
      shadow="2xl"
      border="2px solid"
      borderColor="purple.300"
      maxW="400px"
      zIndex={9999}
    >
      <VStack align="stretch" spacing={4}>
        <Heading size="md" color="purple.600">
          💱 Currency Debug Panel
        </Heading>

        {/* Current Rate */}
        <Box>
          <Text fontSize="sm" fontWeight="600" color="gray.600">
            Current Exchange Rate:
          </Text>
          <Text fontSize="2xl" fontWeight="bold" color={isUsingAPI ? 'green.600' : 'orange.600'}>
            {loading ? 'Loading...' : `${exchangeRate} UZS/USD`}
          </Text>
          {isUsingFallback && (
            <Text fontSize="xs" color="orange.600" mt={1}>
              ⚠️ Using fallback rate (API may have failed)
            </Text>
          )}
          {isUsingAPI && (
            <Text fontSize="xs" color="green.600" mt={1}>
              ✅ Loaded from CBU API (includes 1% markup)
            </Text>
          )}
        </Box>

        {/* Cache Info */}
        <Box>
          <Text fontSize="sm" fontWeight="600" color="gray.600">
            Cache Status:
          </Text>
          <Box bg="gray.50" p={3} borderRadius="md" fontSize="xs">
            <Text>
              <strong>Valid:</strong> {cacheInfo.isValid ? '✅ Yes' : '❌ No'}
            </Text>
            <Text>
              <strong>Cached Rate:</strong> {cacheInfo.rate || 'N/A'}
            </Text>
            <Text>
              <strong>Cached At:</strong>{' '}
              {cacheInfo.timestamp
                ? new Date(cacheInfo.timestamp).toLocaleString('ru-RU')
                : 'N/A'}
            </Text>
            <Text>
              <strong>Expires In:</strong>{' '}
              {cacheInfo.expiresIn
                ? `${Math.round(cacheInfo.expiresIn / 1000 / 60 / 60)} hours`
                : 'N/A'}
            </Text>
          </Box>
        </Box>

        {/* Error */}
        {error && (
          <Box bg="red.50" p={3} borderRadius="md">
            <Text fontSize="xs" color="red.700">
              ❌ <strong>Error:</strong> {error}
            </Text>
          </Box>
        )}

        {/* Actions */}
        <VStack spacing={2}>
          <Button
            size="sm"
            colorScheme="purple"
            w="full"
            onClick={handleRefresh}
            isLoading={loading}
          >
            🔄 Force Refresh from API
          </Button>
          <Button size="sm" variant="outline" colorScheme="red" w="full" onClick={handleClearCache}>
            🗑️ Clear Cache
          </Button>
        </VStack>

        {/* Instructions */}
        <Box bg="blue.50" p={3} borderRadius="md">
          <Text fontSize="xs" color="blue.800">
            <strong>💡 Tip:</strong> Open browser console (F12) to see detailed logs with{' '}
            <Code fontSize="xs">[CurrencyService]</Code> prefix.
          </Text>
        </Box>

        {/* How to Verify */}
        <Box bg="green.50" p={3} borderRadius="md">
          <Text fontSize="xs" color="green.800" fontWeight="600" mb={1}>
            ✅ API Working if:
          </Text>
          <Text fontSize="xs" color="green.800">
            • Rate is NOT 12800 (fallback)
            <br />
            • Cache info shows valid timestamp
            <br />
            • Console shows "Rate cached" log
          </Text>
        </Box>
      </VStack>
    </Box>
  );
};

export default CurrencyDebug;
