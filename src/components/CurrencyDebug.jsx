// src/components/CurrencyDebug.jsx
import React, { useState } from 'react';
import { Box, HStack, VStack, Text, IconButton, Collapse } from '@chakra-ui/react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';

/**
 * CurrencyDebug - Minimal currency status widget for footer
 * Shows CBU API connection status and current rate
 */
const CurrencyDebug = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { exchangeRate, loading } = useCurrency();

  const isUsingFallback = exchangeRate === 12800;
  const isUsingAPI = exchangeRate && exchangeRate !== 12800;

  // Calculate official rate (reverse the 1% markup)
  const officialRate = isUsingAPI ? Math.round(exchangeRate / 1.01) : null;
  const markupAmount = isUsingAPI ? exchangeRate - officialRate : null;

  return (
    <Box
      position="fixed"
      bottom="0"
      right="20px"
      bg="white"
      borderRadius="xl xl 0 0"
      shadow="lg"
      border="1px solid"
      borderColor="gray.200"
      zIndex={9999}
      minW="280px"
    >
      {/* Toggle Button */}
      <HStack
        px={4}
        py={2}
        cursor="pointer"
        onClick={() => setIsOpen(!isOpen)}
        _hover={{ bg: 'gray.50' }}
        borderRadius="xl xl 0 0"
        spacing={2}
      >
        <Box
          w="8px"
          h="8px"
          borderRadius="full"
          bg={isUsingAPI ? 'green.500' : 'orange.500'}
        />
        <Text fontSize="xs" fontWeight="600" color="gray.700" flex={1}>
          Currency Status
        </Text>
        <IconButton
          size="xs"
          variant="ghost"
          aria-label="Toggle currency info"
          icon={isOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        />
      </HStack>

      {/* Collapsible Content */}
      <Collapse in={isOpen} animateOpacity>
        <VStack align="stretch" spacing={3} px={4} pb={4} pt={2} borderTop="1px solid" borderColor="gray.100">
          {/* Status */}
          <HStack spacing={2}>
            <Text fontSize="xs" color="gray.600">
              Status:
            </Text>
            <Text fontSize="xs" fontWeight="600" color={isUsingAPI ? 'green.600' : 'orange.600'}>
              {loading ? 'Loading...' : isUsingAPI ? '✅ Connected to CBU' : '⚠️ Using Fallback'}
            </Text>
          </HStack>

          {/* Current Exchange Rate */}
          {isUsingAPI && (
            <>
              <Box>
                <Text fontSize="xs" color="gray.600" mb={1}>
                  Current Exchange Rate:
                </Text>
                <Text fontSize="lg" fontWeight="bold" color="gray.900">
                  {officialRate?.toLocaleString('en-US').replace(/,/g, ' ')} UZS
                </Text>
                <Text fontSize="xs" color="gray.500" mt={1}>
                  +1% markup: {markupAmount?.toLocaleString('en-US').replace(/,/g, ' ')} UZS
                </Text>
              </Box>
            </>
          )}

          {/* Fallback message */}
          {isUsingFallback && (
            <Text fontSize="xs" color="orange.600">
              Using fallback rate: {exchangeRate} UZS
            </Text>
          )}
        </VStack>
      </Collapse>
    </Box>
  );
};

export default CurrencyDebug;
