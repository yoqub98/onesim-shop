// src/components/FeatureInfoSidebar.jsx
// Sticky sidebar panel showing eSIM features
import { Box, HStack, VStack, Text } from '@chakra-ui/react';
import {
  WifiIcon,
  BoltIcon,
  PhoneXMarkIcon,
} from '@heroicons/react/24/outline';
import { Battery50Icon } from '@heroicons/react/24/solid';

/**
 * FeatureInfoSidebar - Sticky information panel for desktop layout
 * Displays key eSIM features with icons and descriptions
 *
 * @param {string} stickyTop - Optional top position for sticky positioning (default: "180px")
 */
const FeatureInfoSidebar = ({ stickyTop = '180px' }) => {
  const features = [
    {
      icon: WifiIcon,
      title: 'Точка доступа',
      subtitle: 'Поддерживается раздача интернета по Wi-Fi',
    },
    {
      icon: BoltIcon,
      title: 'Мгновенная активация',
      subtitle: 'Активируется автоматически по прибытии',
    },
    {
      icon: PhoneXMarkIcon,
      title: 'Только Интернет!',
      subtitle: 'Звонки и SMS не поддерживаются',
    },
    {
      icon: Battery50Icon,
      title: 'Продление',
      subtitle: 'Можно пополнить и продлить пакет',
    },
  ];

  return (
    <Box
      position="sticky"
      top={stickyTop}
      bg="rgba(255, 255, 255, 0.27)"
      border="1.8px solid #CFD2E3"
      borderRadius="26px"
      px="40px"
      py="36px"
      w="100%"
      fontFamily="'Manrope', sans-serif"
      backdropFilter="blur(10px)"
    >
      <VStack spacing="50px" align="stretch">
        {features.map((feature, index) => (
          <HStack key={index} spacing="14px" align="center">
            {/* Icon box with gradient background */}
            <Box
              w="42px"
              h="42px"
              borderRadius="11px"
              background="linear-gradient(168.69deg, rgba(255, 233, 225, 0.8) 15.79%, rgba(251, 232, 225, 0.8) 62.58%, rgba(227, 227, 227, 0.8) 95.61%)"
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
            >
              <Box
                as={feature.icon}
                w="24px"
                h="24px"
                color="#FE4F18"
              />
            </Box>

            {/* Text block */}
            <VStack align="flex-start" spacing={0} flex={1}>
              <Text
                fontSize="16px"
                fontWeight="700"
                color="#20242C"
                fontFamily="'Manrope', sans-serif"
                lineHeight="1.3"
              >
                {feature.title}
              </Text>
              <Text
                fontSize="14px"
                fontWeight="500"
                color="#5E6876"
                fontFamily="'Manrope', sans-serif"
                letterSpacing="-0.14px"
                lineHeight="1.4"
              >
                {feature.subtitle}
              </Text>
            </VStack>
          </HStack>
        ))}
      </VStack>
    </Box>
  );
};

export default FeatureInfoSidebar;
