// src/components/DataPlanCard.jsx
// Design System Component - Data Plan Card
import { useState } from 'react';
import {
  Box,
  Text,
  Button,
  HStack,
  VStack,
} from '@chakra-ui/react';
import { WifiIcon } from '@heroicons/react/24/outline';
import { getTranslation } from '../config/i18n';

// Utility function to extract the highest network speed
export const parseHighestSpeed = (speed) => {
  if (!speed) return '4G';

  // Extract all network types (5G, 4G, 3G, LTE, etc.)
  const networks = speed.match(/(5G|4G|LTE|3G|2G)/gi) || [];

  if (networks.length === 0) return speed;

  // Priority order (highest to lowest)
  const priority = ['5G', '4G', 'LTE', '3G', '2G'];

  for (const network of priority) {
    if (networks.some(n => n.toUpperCase() === network)) {
      return network;
    }
  }

  return networks[0] || speed;
};

// Format operators list to show first two and count the rest
const formatOperatorsList = (operatorList) => {
  if (!operatorList || operatorList.length === 0) return '';

  const operators = operatorList.map(op => op.operatorName || op);

  if (operators.length === 1) {
    return operators[0];
  } else if (operators.length === 2) {
    return `${operators[0]}, ${operators[1]}`;
  } else {
    const remaining = operators.length - 2;
    return `${operators[0]}, ${operators[1]}...+${remaining}`;
  }
};

/**
 * DataPlanCard - Design System Component
 *
 * A reusable card component for displaying eSIM data plans
 * Features:
 * - Clean, modern design with Manrope font
 * - Hover effects
 * - Network type badge (shows highest speed only)
 * - Operator list display
 * - Pricing with USD and local currency
 *
 * @param {Object} plan - Plan data object
 * @param {string} lang - Current language code
 * @param {Function} onClick - Click handler for the card
 */
const DataPlanCard = ({ plan, lang, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const t = (key) => getTranslation(lang, key);

  // Parse data value and unit (handle both GB and MB)
  const parseDataValue = (data) => {
    if (!data) return { value: plan.dataGB || '0', unit: 'GB' };

    const dataStr = String(data).trim();

    // Check if it contains MB
    if (/MB|МБ/i.test(dataStr)) {
      const value = dataStr.replace(/\s?(MB|МБ)/i, '').trim();
      return { value, unit: 'MB' };
    }

    // Otherwise assume GB
    const value = dataStr.replace(/\s?(GB|ГБ)/i, '').trim();
    return { value, unit: 'GB' };
  };

  const { value: dataValue, unit: dataUnit } = parseDataValue(plan.data);

  // Get highest network speed
  const networkType = parseHighestSpeed(plan.speed);

  // Format operators
  const operatorsText = formatOperatorsList(plan.operatorList);

  return (
    <Box
      position="relative"
      minWidth={{ base: '280px', md: '370px' }}
      width={{ base: '100%', md: '370px' }}
      fontFamily="'Manrope', sans-serif"
    >
      {/* Lighting effect background - only visible on hover */}
      {isHovered && (
        <Box
          position="absolute"
          top="-20px"
          left="-20px"
          right="-20px"
          bottom="-20px"
          bg="radial-gradient(circle at center, rgba(254, 79, 24, 0.15) 0%, rgba(254, 79, 24, 0.05) 40%, transparent 70%)"
          borderRadius="50px"
          filter="blur(25px)"
          zIndex={-1}
          pointerEvents="none"
          animation="pulse 2s ease-in-out infinite"
          sx={{
            '@keyframes pulse': {
              '0%, 100%': { opacity: 0.6 },
              '50%': { opacity: 1 },
            },
          }}
        />
      )}

      {/* Card itself - stays white */}
      <Box
        cursor="pointer"
        bg="white"
        borderRadius="32px"
        overflow="visible"
        transition="all 0.3s ease-out"
        transform={isHovered ? 'translateY(-6px)' : 'translateY(0)'}
        boxShadow={
          isHovered
            ? '0 24px 48px -12px rgba(254, 79, 24, 0.25), 0 0 0 1px rgba(254, 79, 24, 0.1)'
            : '0 4px 12px rgba(0, 0, 0, 0.06)'
        }
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
        p={6}
        position="relative"
        zIndex={1}
      >
      <VStack align="stretch" spacing={5}>
        {/* Header Section: Data & Duration */}
        <HStack justify="space-between" align="flex-start">
          {/* Data Amount */}
          <HStack align="baseline" spacing={0.5}>
            <Text
              fontSize="48px"
              fontWeight="700"
              lineHeight="1"
              letterSpacing="-1.5px"
              color="#000"
            >
              {dataValue}
            </Text>
            <Text
              fontSize="24px"
              fontWeight="500"
              color="#000"
              ml={1}
            >
              {dataUnit}
            </Text>
          </HStack>

          {/* Duration Block */}
          <VStack align="flex-end" spacing={0}>
            <Text
              fontSize="13px"
              color="#8E8E93"
              fontWeight="400"
            >
              {t('countryPage.card.period')}
            </Text>
            <Text
              fontSize="20px"
              fontWeight="600"
              color="#1C1C1E"
              whiteSpace="nowrap"
            >
              {plan.days} {t('plans.card.days')}
            </Text>
          </VStack>
        </HStack>

        {/* Middle Section: Network Type & Operators */}
        <HStack spacing={3} align="center">
          {/* Network Badge */}
          <HStack
            spacing={2}
            px={3.5}
            py={2}
            borderRadius="12px"
            bg="#F2F2F7"
            align="center"
            minW="fit-content"
          >
            <Box as={WifiIcon} w="20px" h="20px" color="#FE4F18" />
            <Text fontSize="15px" fontWeight="600" color="#000" whiteSpace="nowrap">
              {networkType}
            </Text>
          </HStack>

          {/* Operators Badge */}
          {operatorsText && (
            <Box
              flex={1}
              px={3.5}
              py={2}
              borderRadius="12px"
              bg="#F2F2F7"
              overflow="hidden"
            >
              <Text
                fontSize="14px"
                fontWeight="400"
                color="#000"
                whiteSpace="nowrap"
                overflow="hidden"
                textOverflow="ellipsis"
              >
                {operatorsText}
              </Text>
            </Box>
          )}
        </HStack>

        {/* Footer Section: Price & Action */}
        <Box
          bg="#F2F2F7"
          borderRadius="20px"
          p={4}
        >
          <HStack justify="space-between" align="center">
            {/* Price Information */}
            <VStack align="flex-start" spacing={0.5}>
              <Text fontSize="18px" color="#494951" fontWeight="500">
                {plan.priceUSD}$
              </Text>
              <HStack align="baseline" spacing={1}>
                <Text
                  fontSize="25px"
                  fontWeight="800"
                  color="#000"
                  letterSpacing="tight"
                >
                  {plan.price}
                </Text>
                <Text fontSize="14px" fontWeight="400" color="#000" textTransform="uppercase">
                  {t('plans.card.currency')}
                </Text>
              </HStack>
            </VStack>

            {/* Buy Button - matching PlansSection style */}
            <Button
              size="md"
              variant="outline"
              borderColor="#FE4F18"
              color="#FE4F18"
              bg="rgba(255, 255, 255, 0.6)"
              borderWidth="2px"
              _hover={{
                bg: '#FE4F18',
                color: 'white',
                transform: 'translateY(-2px)',
                shadow: '0 10px 30px rgba(254, 79, 24, 0.4)',
              }}
              transition="all 0.3s ease-in-out"
              borderRadius="full"
              fontWeight="700"
              fontSize="md"
              px={8}
              py={4}
              h="auto"
              whiteSpace="nowrap"
            >
              {t('plans.card.buy')}
            </Button>
          </HStack>
        </Box>
      </VStack>
      </Box>
    </Box>
  );
};

export default DataPlanCard;
