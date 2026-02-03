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
  useToast,
} from '@chakra-ui/react';
import { WifiIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { getTranslation } from '../config/i18n.js';
import { useCurrency } from '../contexts/CurrencyContext.jsx';
import { useFavorites } from '../contexts/FavoritesContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { calculateFinalPriceUSD, formatPrice } from '../config/pricing.js';
import { parseHighestSpeed, smartRoundDollar, formatOperatorsList } from './DataPlanCard.jsx';

/**
 * DataPlanRow - Desktop horizontal plan row component
 * Used in the two-column desktop layout of CountryPage
 *
 * @param {Object} plan - Plan data object
 * @param {string} lang - Current language code
 * @param {Function} onClick - Click handler for the row
 */
const DataPlanRow = ({ plan, lang, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [priceUZS, setPriceUZS] = useState(null);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const t = (key) => getTranslation(lang, key);
  const { convertToUZS } = useCurrency();
  const { user } = useAuth();
  const { isFavorited, toggleFavorite } = useFavorites();
  const toast = useToast();

  const favorited = isFavorited(plan.id);

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

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();

    if (!user) {
      toast({
        title: 'Войдите в аккаунт',
        description: 'Чтобы добавить в избранное, необходимо войти в аккаунт',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      return;
    }

    try {
      setIsTogglingFavorite(true);
      const newState = await toggleFavorite(plan.id);

      toast({
        title: newState ? 'Добавлено в избранное' : 'Удалено из избранного',
        description: newState
          ? 'eSIM добавлен в список избранных'
          : 'eSIM удален из списка избранных',
        status: 'success',
        duration: 2000,
        isClosable: true,
        position: 'top',
      });
    } catch (error) {
      console.error('[DataPlanRow] Error toggling favorite:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить избранное',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const handleBuyClick = (e) => {
    e.stopPropagation();
    // Let the row's onClick handle navigation
    if (onClick) onClick();
  };

  return (
    <Box
      position="relative"
      fontFamily="'Manrope', sans-serif"
    >
      {/* Lighting effect background - only visible on hover */}
      {isHovered && (
        <Box
          position="absolute"
          top="-15px"
          left="-15px"
          right="-15px"
          bottom="-15px"
          bg="radial-gradient(circle at center, rgba(254, 79, 24, 0.12) 0%, rgba(254, 79, 24, 0.04) 40%, transparent 70%)"
          borderRadius="35px"
          filter="blur(20px)"
          zIndex={-1}
          pointerEvents="none"
          sx={{
            '@keyframes pulse': {
              '0%, 100%': { opacity: 0.7 },
              '50%': { opacity: 1 },
            },
            animation: 'pulse 2s ease-in-out infinite',
          }}
        />
      )}

      <Box
        bg="white"
        borderRadius="20px"
        px="22px"
        py="20px"
        boxShadow="0 -7px 48px 0px rgba(28, 32, 37, 0.1)"
        cursor="pointer"
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        transition="all 0.15s ease-out"
        transform={isHovered ? 'translateY(-4px)' : 'translateY(0)'}
        _hover={{
          boxShadow: '0 -12px 60px 0px rgba(254, 79, 24, 0.2)',
        }}
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
            <VStack align="flex-start" spacing={0}>
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
                px="16px"
                bg="white"
                border="1px solid #D4D7E5"
                display="flex"
                alignItems="center"
                width="fit-content"
                maxW="250px"
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
                  fontSize="22px"
                  fontWeight="800"
                  color="#151618"
                  fontFamily="'Manrope', sans-serif"
                  lineHeight="1"
                >
                  $
                </Text>
                <Text
                  fontSize="26px"
                  fontWeight="800"
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
                aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
                icon={
                  favorited ? (
                    <HeartIconSolid style={{ width: '24px', height: '24px' }} />
                  ) : (
                    <HeartIcon style={{ width: '24px', height: '24px' }} />
                  )
                }
                w="45px"
                h="45px"
                minW="45px"
                borderRadius="full"
                bg="transparent"
                border="1px solid #C9CCD7"
                color={favorited ? '#5A5A5A' : '#151618'}
                onClick={handleFavoriteClick}
                isLoading={isTogglingFavorite}
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
                border="2.5px solid #FE4F18"
                fontSize="15px"
                fontWeight="700"
                color="#1F1F1F"
                fontFamily="'Manrope', sans-serif"
                onClick={handleBuyClick}
                position="relative"
                overflow="hidden"
                zIndex={1}
                transition="color 0.2s ease-out"
                _before={{
                  content: '""',
                  position: 'absolute',
                  zIndex: -1,
                  top: 0,
                  bottom: 0,
                  left: 0,
                  right: 0,
                  bg: '#FE4F18',
                  transform: 'scaleY(0)',
                  transformOrigin: '50%',
                  transition: 'transform 0.2s ease-out',
                  borderRadius: 'full',
                }}
                _hover={{
                  color: 'white',
                  _before: {
                    transform: 'scaleY(1)',
                  },
                }}
              >
                {t('plans.card.buy')}
              </Button>
            </HStack>
          </HStack>
        </Box>
      </HStack>
      </Box>
    </Box>
  );
};

export default DataPlanRow;
