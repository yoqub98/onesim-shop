// src/components/RegionalPlanCard.jsx
// Regional Plan Card Component - matches the regional packages design
import { useState, useEffect } from 'react';
import {
  Box,
  Text,
  Button,
  HStack,
  VStack,
  Grid,
  IconButton,
} from '@chakra-ui/react';
import { Heart, Wifi, Globe } from 'lucide-react';
import { getTranslation } from '../config/i18n';
import { useCurrency } from '../contexts/CurrencyContext';
import { calculateFinalPriceUSD, formatPrice } from '../config/pricing';

// Parse highest network speed
const parseHighestSpeed = (speed) => {
  if (!speed) return '4G';
  const networks = speed.match(/(5G|4G|LTE|3G|2G)/gi) || [];
  if (networks.length === 0) return speed;
  const priority = ['5G', '4G', 'LTE', '3G', '2G'];
  for (const network of priority) {
    if (networks.some(n => n.toUpperCase() === network)) {
      return network;
    }
  }
  return networks[0] || speed;
};

/**
 * RegionalPlanCard - Card component for regional package listings
 */
const RegionalPlanCard = ({ plan, lang, onClick, regionName }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
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
  const networkType = parseHighestSpeed(plan.speed);

  // Get country coverage
  const countryCoverage = plan.rawPackage?.locationNetworkList?.length || 0;

  // Calculate prices
  const priceUSDWithMargin = calculateFinalPriceUSD(plan.priceUSD);
  const originalPriceUSD = plan.priceUSD;

  // Convert to UZS
  useEffect(() => {
    const loadUZSPrice = async () => {
      try {
        const uzs = await convertToUZS(originalPriceUSD);
        setPriceUZS(Math.round(uzs));
      } catch (error) {
        console.error('[RegionalPlanCard] Error converting to UZS:', error);
        setPriceUZS(0);
      }
    };
    loadUZSPrice();
  }, [originalPriceUSD, convertToUZS]);

  const formattedPriceUZS = priceUZS !== null ? formatPrice(priceUZS) : '...';

  return (
    <Box
      cursor="pointer"
      bg="white"
      borderRadius="24px"
      overflow="hidden"
      transition="all 0.3s ease"
      transform={isHovered ? 'translateY(-4px)' : 'translateY(0)'}
      boxShadow={
        isHovered
          ? '0 12px 24px rgba(0, 0, 0, 0.12)'
          : '0 4px 12px rgba(0, 0, 0, 0.06)'
      }
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      p={6}
      fontFamily="'Manrope', sans-serif"
      minW={{ base: '100%', md: '340px' }}
      maxW={{ base: '100%', md: '380px' }}
    >
      <VStack align="stretch" spacing={4}>
        {/* Header: Package Name and Favorite */}
        <HStack justify="space-between" align="flex-start">
          <Text
            fontSize="20px"
            fontWeight="700"
            color="#FE4F18"
            fontFamily="'Manrope', sans-serif"
          >
            {regionName} {dataValue}/{plan.days}
          </Text>
          <IconButton
            icon={<Heart size={20} />}
            variant="ghost"
            size="sm"
            color={isFavorite ? '#FE4F18' : '#8E8E93'}
            fill={isFavorite ? '#FE4F18' : 'none'}
            onClick={(e) => {
              e.stopPropagation();
              setIsFavorite(!isFavorite);
            }}
            _hover={{ bg: 'transparent', color: '#FE4F18' }}
            aria-label="Add to favorites"
          />
        </HStack>

        {/* Data and Validity Grid */}
        <Grid templateColumns="1fr 1fr" gap={4}>
          {/* Traffic Volume */}
          <VStack align="start" spacing={1}>
            <Text fontSize="13px" fontWeight="500" color="#8E8E93">
              {t('myPage.orders.dataVolume')}
            </Text>
            <HStack align="baseline" spacing={1}>
              <Text fontSize="28px" fontWeight="700" color="#1C1C1E">
                {dataValue}
              </Text>
              <Text fontSize="16px" fontWeight="600" color="#1C1C1E">
                {dataUnit}
              </Text>
            </HStack>
          </VStack>

          {/* Validity */}
          <VStack align="start" spacing={1}>
            <Text fontSize="13px" fontWeight="500" color="#8E8E93">
              {t('countryPage.card.period')}
            </Text>
            <HStack align="baseline" spacing={1}>
              <Text fontSize="28px" fontWeight="700" color="#1C1C1E">
                {plan.days}
              </Text>
              <Text fontSize="16px" fontWeight="600" color="#1C1C1E">
                {t('plans.card.days')}
              </Text>
            </HStack>
          </VStack>
        </Grid>

        {/* Badges: Network and Countries */}
        <HStack spacing={3}>
          {/* 5G Badge */}
          <HStack
            spacing={2}
            px={3}
            py={1.5}
            borderRadius="10px"
            bg="#FFE5F0"
            align="center"
          >
            <Wifi size={16} color="#FF3B6C" />
            <Text fontSize="14px" fontWeight="600" color="#FF3B6C">
              {networkType}
            </Text>
          </HStack>

          {/* Countries Badge */}
          {countryCoverage > 0 && (
            <HStack
              spacing={2}
              px={3}
              py={1.5}
              borderRadius="10px"
              bg="#FFF4F0"
              align="center"
            >
              <Globe size={16} color="#FE4F18" />
              <Text fontSize="14px" fontWeight="600" color="#FE4F18">
                {countryCoverage} {t('plans.card.countries')}
              </Text>
            </HStack>
          )}
        </HStack>

        {/* Price Section */}
        <HStack justify="space-between" align="center" pt={2}>
          {/* Price */}
          <VStack align="flex-start" spacing={0}>
            <Text
              fontSize="14px"
              fontWeight="500"
              color="#8E8E93"
              textDecoration="line-through"
            >
              {formattedPriceUZS} UZS
            </Text>
            <HStack align="baseline" spacing={0.5}>
              <Text fontSize="32px" fontWeight="800" color="#1C1C1E">
                ${Math.round(priceUSDWithMargin)}
              </Text>
            </HStack>
          </VStack>

          {/* Buy Button */}
          <Button
            size="md"
            variant="outline"
            borderColor="#FE4F18"
            color="#FE4F18"
            bg="white"
            borderWidth="2px"
            _hover={{
              bg: '#FE4F18',
              color: 'white',
            }}
            transition="all 0.2s"
            borderRadius="full"
            fontWeight="600"
            fontSize="md"
            px={6}
            h="auto"
            py={2}
          >
            {t('plans.card.buy')}
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default RegionalPlanCard;
