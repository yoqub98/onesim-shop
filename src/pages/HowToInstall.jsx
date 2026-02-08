// src/pages/HowToInstall.jsx
import { useState } from 'react';
import {
  Box,
  Container,
  Text,
  VStack,
  HStack,
  Grid,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { getTranslation } from '../config/i18n';

const MotionBox = motion(Box);

const HowToInstall = () => {
  const { currentLanguage } = useLanguage();
  const t = (key) => getTranslation(currentLanguage, key);

  const [activeOS, setActiveOS] = useState('iOS');

  // iPhone mockup URLs
  const iosImages = [
    'https://ik.imagekit.io/php1jcf0t/OneSim/ios0.png',
    'https://ik.imagekit.io/php1jcf0t/OneSim/ios1.png',
    'https://ik.imagekit.io/php1jcf0t/OneSim/ios2.png',
    'https://ik.imagekit.io/php1jcf0t/OneSim/ios3.png',
    'https://ik.imagekit.io/php1jcf0t/OneSim/ios4.png',
  ];

  // For Android, reuse iOS images for now
  const androidImages = iosImages;

  // Step content
  const iosSteps = [
    { number: '01', text: t('howToInstall.ios.step1') },
    { number: '02', text: t('howToInstall.ios.step2') },
    { number: '03', text: t('howToInstall.ios.step3') },
    { number: '04', text: t('howToInstall.ios.step4') },
    { number: '05', text: t('howToInstall.ios.step5') },
  ];

  const androidSteps = [
    { number: '01', text: t('howToInstall.android.step1') },
    { number: '02', text: t('howToInstall.android.step2') },
    { number: '03', text: t('howToInstall.android.step3') },
    { number: '04', text: t('howToInstall.android.step4') },
    { number: '05', text: t('howToInstall.android.step5') },
  ];

  const currentImages = activeOS === 'iOS' ? iosImages : androidImages;
  const currentSteps = activeOS === 'iOS' ? iosSteps : androidSteps;

  // V-shape offsets: outer phones higher, center phone lower
  const getVerticalOffset = (index) => {
    const offsets = [0, 15, 30, 15, 0];
    return offsets[index] || 0;
  };

  return (
    <Box
      minH="100vh"
      bg="#F9F9F9"
      fontFamily="'Manrope', sans-serif"
      py={{ base: 10, md: 16, lg: 20 }}
    >
      <Container maxW="1300px">
        <VStack spacing={{ base: 8, md: 10, lg: 12 }} align="center">
          {/* Header Section */}
          <VStack spacing={4} textAlign="center">
            <Text
              fontSize={{ base: '32px', md: '44px', lg: '52px' }}
              fontWeight="800"
              color="#1C1C1E"
              lineHeight="1.15"
            >
              {t('howToInstall.title.part1')}{' '}
              <Box as="span" color="#FE4F18">
                {t('howToInstall.title.highlight')}
              </Box>{' '}
              {t('howToInstall.title.part2')}
            </Text>
            <Text
              fontSize={{ base: '16px', md: '18px' }}
              color="#8E8E93"
              fontWeight="500"
              maxW="500px"
            >
              {t('howToInstall.subtitle')}
            </Text>
          </VStack>

          {/* OS Tabs */}
          <HStack
            bg="#F2F2F7"
            borderRadius="20px"
            p={1.5}
            spacing={1}
          >
            {['iOS', 'ANDROID'].map((os) => (
              <Box
                key={os}
                as="button"
                onClick={() => setActiveOS(os)}
                bg={activeOS === os ? 'white' : 'transparent'}
                color={activeOS === os ? '#1C1C1E' : '#8E8E93'}
                borderRadius="16px"
                px={8}
                py={3}
                fontSize="15px"
                fontWeight="700"
                transition="all 0.25s ease"
                boxShadow={activeOS === os ? '0 2px 8px rgba(0, 0, 0, 0.08)' : 'none'}
                _hover={{
                  color: activeOS === os ? '#1C1C1E' : '#6B7280',
                }}
                _active={{ transform: 'scale(0.97)' }}
              >
                {os === 'iOS' ? 'iOS' : 'Android'}
              </Box>
            ))}
          </HStack>

          {/* Steps Grid */}
          <Grid
            templateColumns={{
              base: 'repeat(1, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(5, 1fr)',
            }}
            gap={{ base: 8, md: 6, lg: 8 }}
            w="full"
            mt={{ base: 4, md: 6, lg: 8 }}
            px={{ base: 4, md: 0 }}
            alignItems="flex-start"
          >
            {currentSteps.map((step, index) => (
              <MotionBox
                key={`${activeOS}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.15,
                  ease: 'easeOut',
                }}
                whileHover={{
                  scale: 1.08,
                  transition: { duration: 0.3, ease: 'easeOut' },
                }}
                cursor="pointer"
                pt={{ base: 0, lg: `${getVerticalOffset(index)}px` }}
              >
                <VStack spacing={4} align="center">
                  {/* Phone Image */}
                  <Box
                    position="relative"
                    w={{ base: '220px', md: '198px', lg: '220px' }}
                    h={{ base: '440px', md: '396px', lg: '440px' }}
                    filter="drop-shadow(0 10px 30px rgba(0,0,0,0.08))"
                  >
                    <img
                      src={currentImages[index]}
                      alt={`Step ${step.number}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                      }}
                    />
                  </Box>

                  {/* Step Card */}
                  <Box
                    w="full"
                    minH={{ base: '160px', md: '180px', lg: '190px' }}
                    borderRadius="24px"
                    bg="white"
                    boxShadow="0 4px 12px rgba(0, 0, 0, 0.06)"
                    p={5}
                    display="flex"
                    flexDirection="column"
                  >
                    <VStack align="flex-start" spacing={3}>
                      {/* Step Number Badge */}
                      <Box
                        w="42px"
                        h="42px"
                        minH="42px"
                        borderRadius="14px"
                        bg="#FFF4F0"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontWeight="800"
                        fontSize="16px"
                        color="#FE4F18"
                      >
                        {step.number}
                      </Box>

                      {/* Step Description */}
                      <Text
                        color="#1C1C1E"
                        fontSize="14px"
                        fontWeight="600"
                        lineHeight="1.6"
                      >
                        {step.text}
                      </Text>
                    </VStack>
                  </Box>
                </VStack>
              </MotionBox>
            ))}
          </Grid>
        </VStack>
      </Container>
    </Box>
  );
};

export default HowToInstall;
