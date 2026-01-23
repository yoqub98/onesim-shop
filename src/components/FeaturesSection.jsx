// src/components/FeaturesSection.jsx
import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Badge,
  VStack,
  Grid,
  Image,
} from '@chakra-ui/react';
import { getTranslation } from '../config/i18n';
import { useLanguage } from '../contexts/LanguageContext';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
// Import icons
import rocketIcon from '../assets/icons/rocket.svg';
import globeIcon from '../assets/icons/globe.svg';
import hotspotIcon from '../assets/icons/hotspot.svg';
import supportIcon from '../assets/icons/support.svg';

// Icon Background Shape Component (same for all cards)
const IconBackgroundShape = ({ gradientId }) => (
  <svg
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%'
    }}
    viewBox="0 0 217 179"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M0 51.0546C0 22.8579 22.8579 0 51.0546 0H216.982V85.0909C216.982 136.785 175.076 178.691 123.382 178.691H0V51.0546Z"
      fill={`url(#${gradientId})`}
    />
    <defs>
      <linearGradient
        id={gradientId}
        x1="108.491"
        y1="0"
        x2="108.491"
        y2="178.691"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="white"/>
        <stop offset="1" stopColor="#FBE1DB"/>
      </linearGradient>
    </defs>
  </svg>
);

// Feature Card Component
const FeatureCard = ({ iconSrc, title, description, delay = 0, index }) => {
  const [cardRef, isVisible] = useScrollAnimation(0.1);

  return (
    <Box
      ref={cardRef}
      position="relative"
      bg="white"
      borderRadius="32px"
      p="40px 32px"
      cursor="pointer"
      minH="380px"
      maxH="380px"
      boxShadow="0 10px 30px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05)"
      transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
      overflow="hidden"
      _hover={{
        transform: 'translateY(-8px)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.12), 0 15px 40px rgba(254, 79, 24, 0.25), 0 8px 25px rgba(225, 72, 26, 0.2)',
        '& .watermark-icon': {
          transform: 'scale(1.15)',
          opacity: 0.08,
        }
      }}
      opacity={isVisible ? 1 : 0}
      style={{
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`,
      }}
    >
      {/* Icon Background Section */}
      <Box
        position="absolute"
        top="0"
        left="0"
        width="140px"
        height="115px"
        zIndex="2"
      >
        {/* Background Shape */}
        <IconBackgroundShape gradientId={`paint0_linear_bg${index}`} />

        {/* Icon Wrapper */}
        <Box
          position="absolute"
          top="0"
          left="0"
          width="100%"
          height="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Image src={iconSrc} alt={title} w="60px" h="60px" />
        </Box>
      </Box>

      {/* Text Content */}
      <Heading
        as="h2"
        fontSize="28px"
        fontWeight="700"
        color="#1a1a1a"
        mt="140px"
        mb="20px"
        lineHeight="1.3"
        position="relative"
        zIndex="2"
      >
        {title}
      </Heading>

      <Text
        fontSize="17px"
        fontWeight="500"
        color="#666666"
        lineHeight="1.6"
        position="relative"
        zIndex="2"
      >
        {description}
      </Text>

      {/* Watermark Icon - Same as main icon, just larger and semi-transparent */}
      <Image
        className="watermark-icon"
        src={iconSrc}
        alt=""
        position="absolute"
        bottom="-40px"
        right="-40px"
        w="200px"
        h="200px"
        opacity="0.06"
        zIndex="1"
        transition="all 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
      />
    </Box>
  );
};

// Main Features Section Component
const FeaturesSection = () => {
  const { currentLanguage } = useLanguage();
  const t = (key) => getTranslation(currentLanguage, key);

  const features = [
    {
      iconSrc: rocketIcon,
      title: t('features.instantActivation.title'),
      description: t('features.instantActivation.description'),
    },
    {
      iconSrc: globeIcon,
      title: t('features.globalCoverage.title'),
      description: t('features.globalCoverage.description'),
    },
    {
      iconSrc: hotspotIcon,
      title: t('features.hotspotSupport.title'),
      description: t('features.hotspotSupport.description'),
    },
    {
      iconSrc: supportIcon,
      title: t('features.support247.title'),
      description: t('features.support247.description'),
    },
  ];

  return (
    <Box as="section" py={{ base: 16, md: 24 }} bg="#F5F6F8" position="relative" overflow="hidden">
      {/* Background decoration */}
      <Box
        position="absolute"
        top="20%"
        left="-10%"
        width="500px"
        height="500px"
        bg="#FFF4F0"
        borderRadius="full"
        filter="blur(100px)"
        opacity="0.5"
        pointerEvents="none"
      />
      <Box
        position="absolute"
        bottom="10%"
        right="-10%"
        width="500px"
        height="500px"
        bg="#FFF4F0"
        borderRadius="full"
        filter="blur(100px)"
        opacity="0.4"
        pointerEvents="none"
      />

      <Container maxW="8xl" position="relative">
        <VStack spacing={16}>
          {/* Section Header */}
          <VStack spacing={4} textAlign="center" className="animate__animated animate__fadeIn">
            <Badge
              bg="#FFF4F0"
              color="#FE4F18"
              fontSize="sm"
              fontWeight="700"
              px={5}
              py={2}
              borderRadius="full"
              textTransform="uppercase"
            >
              {t('features.badge')}
            </Badge>
            <Heading
              as="h2"
              fontSize={{ base: '4xl', md: '5xl' }}
              fontWeight="700"
              color="gray.900"
              letterSpacing="tight"
            >
              {t('features.title')}{' '}
              <Box as="span" color="#FE4F18">
                {t('features.titleHighlight')}
              </Box>
            </Heading>
            <Text
              fontSize={{ base: 'lg', md: 'xl' }}
              color="gray.600"
              maxW="2xl"
              fontWeight="500"
            >
              {t('features.description')}
            </Text>
          </VStack>

          {/* Features Grid */}
          <Grid
            templateColumns={{
              base: '1fr',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(4, 1fr)',
            }}
            gap={6}
            w="100%"
            className="animate__animated animate__fadeIn"
            style={{ animationDelay: '200ms' }}
          >
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                iconSrc={feature.iconSrc}
                title={feature.title}
                description={feature.description}
                delay={index * 100}
                index={index + 1}
              />
            ))}
          </Grid>
        </VStack>
      </Container>
    </Box>
  );
};

export default FeaturesSection;
