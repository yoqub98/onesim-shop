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

// Feature Card Component
const FeatureCard = ({ iconSrc, title, description, delay = 0 }) => {
  const [cardRef, isVisible] = useScrollAnimation(0.1);

  return (
    <Box
      ref={cardRef}
      bg="white"
      borderRadius="2xl"
      p={8}
      shadow="0 4px 12px rgba(0, 0, 0, 0.06)"
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      _hover={{
        transform: 'translateY(-8px)',
        shadow: '0 20px 40px rgba(254, 79, 24, 0.15)',
      }}
      opacity={isVisible ? 1 : 0}
      style={{
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`,
      }}
      height="100%"
    >
      <VStack align="flex-start" spacing={5} height="100%">
        {/* Icon */}
        <Box
          bg="#FFF4F0"
          borderRadius="xl"
          p={4}
          display="inline-flex"
          alignItems="center"
          justifyContent="center"
        >
          <Image src={iconSrc} alt={title} w="32px" h="32px" />
        </Box>

        {/* Title */}
        <Heading
          as="h3"
          fontSize="xl"
          fontWeight="700"
          color="gray.900"
          letterSpacing="tight"
        >
          {title}
        </Heading>

        {/* Description */}
        <Text
          fontSize="md"
          color="gray.600"
          lineHeight="1.7"
          fontWeight="500"
        >
          {description}
        </Text>
      </VStack>
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
              />
            ))}
          </Grid>
        </VStack>
      </Container>
    </Box>
  );
};

export default FeaturesSection;
