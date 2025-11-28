// src/pages/HowToInstall.jsx
import { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
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

  return (
    <Box
      minH="100vh"
      background="linear-gradient(180deg, #F4F2FF 0%, #FFFFFF 70%)"
      py={{ base: 10, md: 16, lg: 20 }}
    >
      <Container maxW="1300px">
        <VStack spacing={{ base: 8, md: 10, lg: 12 }} align="center">
          {/* Header Section */}
          <VStack spacing={4} textAlign="center">
            <Heading
              fontSize={{ base: '28px', md: '36px', lg: '42px' }}
              fontWeight="700"
              color="#1E1E2F"
              lineHeight="1.2"
            >
              {t('howToInstall.title.part1')}{' '}
              <Box as="span" color="#7A4DFF">
                {t('howToInstall.title.highlight')}
              </Box>{' '}
              {t('howToInstall.title.part2')}
            </Heading>
            <Text
              fontSize={{ base: '14px', md: '16px', lg: '18px' }}
              color="#6B6B7A"
              fontWeight="500"
            >
              {t('howToInstall.subtitle')}
            </Text>
          </VStack>

          {/* OS Tabs */}
          <HStack spacing={3} mt={4}>
            <Button
              onClick={() => setActiveOS('iOS')}
              bg={
                activeOS === 'iOS'
                  ? 'linear-gradient(90deg, #A686F6 0%, #B35AB2 100%)'
                  : '#ECE9FF'
              }
              color={activeOS === 'iOS' ? 'white' : '#555'}
              borderRadius="999px"
              px={8}
              py={6}
              fontSize="16px"
              fontWeight="600"
              transition="all 0.3s"
              _hover={{
                opacity: activeOS === 'iOS' ? 0.9 : 1,
                bg: activeOS === 'iOS' ? undefined : '#DDD7FF',
              }}
              _active={{ transform: 'scale(0.98)' }}
            >
              iOS
            </Button>
            <Button
              onClick={() => setActiveOS('ANDROID')}
              bg={
                activeOS === 'ANDROID'
                  ? 'linear-gradient(90deg, #A686F6 0%, #B35AB2 100%)'
                  : '#ECE9FF'
              }
              color={activeOS === 'ANDROID' ? 'white' : '#555'}
              borderRadius="999px"
              px={8}
              py={6}
              fontSize="16px"
              fontWeight="600"
              transition="all 0.3s"
              _hover={{
                opacity: activeOS === 'ANDROID' ? 0.9 : 1,
                bg: activeOS === 'ANDROID' ? undefined : '#DDD7FF',
              }}
              _active={{ transform: 'scale(0.98)' }}
            >
              ANDROID
            </Button>
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
            mt={{ base: 8, md: 10, lg: 12 }}
            px={{ base: 4, md: 0 }}
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
              >
                <VStack spacing={4} align="center">
                  {/* Phone Image */}
                  <Box
                    position="relative"
                    w={{ base: '200px', md: '180px', lg: '200px' }}
                    h={{ base: '400px', md: '360px', lg: '400px' }}
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
                    minH="140px"
                    borderRadius="24px"
                    background="linear-gradient(180deg, #A686F6 0%, #B35AB2 60%, rgba(179,90,178,0) 100%)"
                    p={5}
                    position="relative"
                  >
                    <VStack align="flex-start" spacing={3}>
                      {/* Step Number Badge */}
                      <Box
                        w="40px"
                        h="40px"
                        borderRadius="50%"
                        bg="rgba(255, 255, 255, 0.25)"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontWeight="700"
                        fontSize="16px"
                        color="white"
                      >
                        {step.number}
                      </Box>

                      {/* Step Description */}
                      <Text
                        color="white"
                        fontSize="14px"
                        fontWeight="500"
                        lineHeight="1.5"
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
