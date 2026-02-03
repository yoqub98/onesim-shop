// src/components/DataPlanRow.jsx
// Desktop horizontal plan row component
import { useState, useEffect } from 'react';
import {
  Box,
  Text,
  HStack,
  VStack,
  IconButton,
  Button,
} from '@chakra-ui/react';
import { WifiIcon, HeartIcon } from '@heroicons/react/24/outline';
import { getTranslation } from '../config/i18n';
import { useCurrency } from '../contexts/CurrencyContext';
import { calculateFinalPriceUSD, formatPrice } from '../config/pricing';
import { parseHighestSpeed, smartRoundDollar, formatOperatorsList } from './DataPlanCard';

/**
 * DataPlanRow - Desktop horizontal plan row component
 * Used in the two-column desktop layout of CountryPage
 *
 * @param {Object} plan - Plan data object
 * @param {string} lang - Current language code
 * @param {Function} onClick - Click handler for the row
 */
const DataPlanRow = ({ plan, lang, onClick }) => {
  const [priceUZS, setPriceUZS] = useState(null);
  const t = (key) => getTranslation(lang, key);
  const { convertToUZS } = useCurrency();

  // Parse data value
  const parseDataValue = (data) => {
    if (!data) return { value: plan.dataGB || '0', unit: 'GB' };
    const dataStr = String(data).trim();
    if (/MB|МБ/i.test(dataStr)) {
      const value = dataStr.replace(/\s?(MB|МБ)/i, '').trim();
      return { value, unit: 'MB' };
    }
    const value = dataStr.replace(/\s?(GB|ГБ)/i, '').trim();
    return { value, unit: 'GB' };
  };

  const { value: dataValue, unit: dataUnit } = parseDataValue(plan.data);

  // Get highest network speed
  const networkType = parseHighestSpeed(plan.speed);

  // Format operators list
  const operatorsText = formatOperatorsList(plan.operatorList);

  // Calculate prices with margin
  const priceUSDWithMargin = calculateFinalPriceUSD(plan.priceUSD);

  // Convert to UZS asynchronously
  useEffect(() => {
    const loadUZSPrice = async () => {
      try {
        const uzs = await convertToUZS(priceUSDWithMargin);
        // Smart round to nearest thousand
        const roundedUZS = Math.round(uzs / 1000) * 1000;
        setPriceUZS(roundedUZS);
      } catch (error) {
        console.error('[DataPlanRow] Error converting to UZS:', error);
        setPriceUZS(0);
      }
    };
    loadUZSPrice();
  }, [priceUSDWithMargin, convertToUZS]);

  const formattedPriceUZS = priceUZS !== null ? formatPrice(priceUZS) : '...';

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    // Future favorites feature
  };

  const handleBuyClick = (e) => {
    e.stopPropagation();
    // Let the row's onClick handle navigation
    if (onClick) onClick();
  };

  return (
    <Box
      bg="white"
      borderRadius="20px"
      px="22px"
      py="20px"
      boxShadow="0 -7px 48px 0px rgba(28, 32, 37, 0.1)"
      cursor="pointer"
      onClick={onClick}
      transition="all 0.2s"
      _hover={{
        transform: 'translateY(-2px)',
        boxShadow: '0 -10px 60px 0px rgba(28, 32, 37, 0.15)',
      }}
      fontFamily="'Manrope', sans-serif"
    >
      <HStack spacing={6} align="center">
        {/* LEFT SECTION - Plan details */}
        <VStack flex={1} align="stretch" spacing="26px">
          {/* Row 1: Data value + Period */}
          <HStack spacing="42px" align="flex-end">
            {/* Data value group */}
            <HStack align="flex-end" spacing="2px">
              <Text
                fontSize="34px"
                fontWeight="800"
                color="#000000"
                lineHeight="1"
                fontFamily="'Manrope', sans-serif"
              >
                {dataValue}
              </Text>
              <Text
                fontSize="20px"
                fontWeight="700"
                color="#1D1D1D"
                lineHeight="1"
                fontFamily="'Manrope', sans-serif"
              >
                {dataUnit}
              </Text>
            </HStack>

            {/* Period group */}
            <VStack align="flex-end" spacing={0}>
              <Text
                fontSize="11px"
                fontWeight="500"
                color="#7F8184"
                fontFamily="'Manrope', sans-serif"
              >
                Период
              </Text>
              <Text
                fontSize="20px"
                fontWeight="700"
                color="#1D1D1D"
                fontFamily="'Manrope', sans-serif"
              >
                {plan.days} дней
              </Text>
            </VStack>
          </HStack>

          {/* Row 2: Network badge + Operators badge */}
          <HStack spacing="9px">
            {/* Network badge */}
            <HStack
              borderRadius="12px"
              h="36px"
              minW="77px"
              px="9px"
              bg="white"
              border="1px solid #D4D7E5"
              spacing="9px"
              justify="center"
            >
              <Box as={WifiIcon} w="19px" h="19px" color="#FE4F18" />
              <Text
                fontSize="13px"
                fontWeight="500"
                color="#151618"
                fontFamily="'Manrope', sans-serif"
              >
                {networkType}
              </Text>
            </HStack>

            {/* Operators badge */}
            {operatorsText && (
              <Box
                borderRadius="12px"
                h="36px"
                w="195px"
                px="16px"
                bg="white"
                border="1px solid #D4D7E5"
                display="flex"
                alignItems="center"
              >
                <Text
                  fontSize="13px"
                  fontWeight="600"
                  color="#151618"
                  fontFamily="'Manrope', sans-serif"
                  overflow="hidden"
                  textOverflow="ellipsis"
                  whiteSpace="nowrap"
                >
                  {operatorsText}
                </Text>
              </Box>
            )}
          </HStack>
        </VStack>

        {/* RIGHT SECTION - Price block */}
        <Box
          bg="#F2F3F6"
          borderRadius="18px"
          w="347px"
          h="97px"
          px="16px"
          py="15px"
        >
          <HStack justify="space-between" h="100%" align="center">
            {/* Left: Prices */}
            <VStack align="flex-start" spacing="1px">
              {/* UZS price */}
              <Text
                fontSize="15px"
                fontWeight="600"
                color="#FE4F18"
                fontFamily="'Manrope', sans-serif"
              >
                {formattedPriceUZS} UZS
              </Text>

              {/* USD price */}
              <HStack align="baseline" spacing="2px">
                <Text
                  fontSize="20px"
                  fontWeight="700"
                  color="#151618"
                  fontFamily="'Manrope', sans-serif"
                  lineHeight="1"
                >
                  $
                </Text>
                <Text
                  fontSize="22px"
                  fontWeight="700"
                  color="#151618"
                  fontFamily="'Manrope', sans-serif"
                  lineHeight="1"
                >
                  {smartRoundDollar(priceUSDWithMargin)}
                </Text>
              </HStack>
            </VStack>

            {/* Right: Heart + Buy button */}
            <HStack spacing="11px">
              {/* Heart icon button */}
              <IconButton
                aria-label="Add to favorites"
                icon={<HeartIcon style={{ width: '24px', height: '24px' }} />}
                w="45px"
                h="45px"
                minW="45px"
                borderRadius="full"
                bg="white"
                border="1px solid #E8E8E8"
                color="#151618"
                onClick={handleFavoriteClick}
                _hover={{
                  color: '#FE4F18',
                  borderColor: '#FE4F18',
                }}
                transition="all 0.2s"
              />

              {/* Buy button */}
              <Button
                w="135px"
                h="46px"
                borderRadius="full"
                bg="rgba(255, 255, 255, 0.33)"
                border="2px solid #FE4F18"
                fontSize="15px"
                fontWeight="700"
                color="#1F1F1F"
                fontFamily="'Manrope', sans-serif"
                onClick={handleBuyClick}
                _hover={{
                  bg: '#FE4F18',
                  color: 'white',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 10px 30px rgba(254, 79, 24, 0.4)',
                }}
                transition="all 0.3s"
              >
                {t('plans.card.buy')}
              </Button>
            </HStack>
          </HStack>
        </Box>
      </HStack>
    </Box>
  );
};

export default DataPlanRow;
