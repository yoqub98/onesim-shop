// src/components/PopularDestinations.jsx
import React, { useState } from 'react';
import {
  Box,
  Card,
  Container,
  Heading,
  Text,
  Button,
  Grid,
  Badge,
  HStack,
  VStack,
} from '@chakra-ui/react';
import { ArrowRight } from 'lucide-react';
import Flag from 'react-world-flags';
import { useNavigate } from 'react-router-dom';
import { POPULAR_DESTINATIONS } from '../config/pricing';
import { getCountryName, getTranslation, DEFAULT_LANGUAGE } from '../config/i18n';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

// Destination Card Component
const DestinationCard = ({ countryCode, delay = 0, lang = DEFAULT_LANGUAGE }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [cardRef, isVisible] = useScrollAnimation(0.1);
  const navigate = useNavigate();
  const t = (key) => getTranslation(lang, key);
  const countryName = getCountryName(countryCode, lang);

  const handleExplore = () => {
    navigate(`/country/${countryCode}`);
  };

  return (
    <Card.Root
      ref={cardRef}
      position="relative"
      cursor="pointer"
      bg="white"
      borderRadius="2xl"
      overflow="hidden"
      border="2px solid"
      borderColor={isHovered ? 'purple.200' : 'gray.100'}
      transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
      transform={isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)'}
      shadow={isHovered ? '0 25px 50px rgba(102, 126, 234, 0.25)' : '0 4px 12px rgba(0, 0, 0, 0.08)'}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleExplore}
      opacity={isVisible ? 1 : 0}
      style={{
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`,
      }}
      minH="180px"
    >
      {/* Gradient overlay on hover */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        height="6px"
        background="linear-gradient(90deg, #667eea 0%, #764ba2 100%)"
        opacity={isHovered ? 1 : 0}
        transition="opacity 0.3s"
      />

      <Card.Body p={8}>
        <VStack align="stretch" gap={6} justify="space-between" h="100%">
          {/* Flag and Country Name */}
          <HStack gap={4} flexWrap="nowrap">
            <Box
              borderRadius="xl"
              overflow="hidden"
              shadow="md"
              width="64px"
              height="48px"
              flexShrink={0}
              display="flex"
              alignItems="center"
              justifyContent="center"
              border="2px solid"
              borderColor="gray.100"
              transition="all 0.3s"
              transform={isHovered ? 'scale(1.1)' : 'scale(1)'}
            >
              <Flag 
                code={countryCode} 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover' 
                }} 
              />
            </Box>
            <Heading 
              size="xl" 
              fontWeight="800" 
              color="gray.900"
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
            >
              {countryName}
            </Heading>
          </HStack>

          {/* Explore Button - Appears on Hover */}
          <Box
            opacity={isHovered ? 1 : 0}
            maxHeight={isHovered ? '60px' : '0'}
            overflow="hidden"
            transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
          >
            <Button
              width="100%"
              bg="purple.600"
              color="white"
              _hover={{
                bg: 'purple.700',
              }}
              transition="all 0.3s"
              borderRadius="lg"
              fontWeight="700"
              rightIcon={<ArrowRight size={18} />}
              onClick={handleExplore}
            >
              {t('destinations.explore')}
            </Button>
          </Box>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};

// Loading Skeleton Component
const DestinationCardSkeleton = ({ delay = 0 }) => {
  return (
    <Card.Root
      borderRadius="2xl"
      overflow="hidden"
      border="2px solid"
      borderColor="gray.100"
      minH="180px"
      className="animate__animated animate__fadeIn"
      style={{
        animationDelay: `${delay}ms`,
      }}
    >
      <Card.Body p={8}>
        <HStack gap={4}>
          <Box
            borderRadius="xl"
            width="64px"
            height="48px"
            bg="gray.200"
            flexShrink={0}
            animation="pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
          />
          <Box
            width="140px"
            height="28px"
            bg="gray.200"
            borderRadius="lg"
            animation="pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
          />
        </HStack>
      </Box>
    </Box>

  );
};

// Main Popular Destinations Component
const PopularDestinations = () => {
  const lang = DEFAULT_LANGUAGE; // For MVP, hardcode to Russian
  const t = (key) => getTranslation(lang, key);

  return (
    <Box as="section" py={24} bg="white" position="relative">
      {/* Background decoration */}
      <Box
        position="absolute"
        top="20%"
        right="-10%"
        width="500px"
        height="500px"
        bg="purple.50"
        borderRadius="full"
        filter="blur(100px)"
        opacity="0.5"
        pointerEvents="none"
      />

      <Container maxW="8xl" position="relative">
        <VStack gap={16}>
          {/* Section Header */}
          <VStack gap={4} textAlign="center" className="animate__animated animate__fadeIn">
            <Badge
              colorPalette="purple"
              fontSize="sm"
              fontWeight="800"
              px={5}
              py={2}
              borderRadius="full"
              textTransform="uppercase"
            >
              {t('destinations.badge')}
            </Badge>
            <Heading
              as="h2"
              fontSize={{ base: '4xl', md: '5xl' }}
              fontWeight="800"
              color="gray.900"
              letterSpacing="tight"
            >
              {t('destinations.title')}{' '}
              <Box
                as="span"
                background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                backgroundClip="text"
              >
                {t('destinations.titleHighlight')}
              </Box>
            </Heading>
            <Text
              fontSize={{ base: 'lg', md: 'xl' }}
              color="gray.600"
              maxW="2xl"
              fontWeight="500"
            >
              {t('destinations.description')}
            </Text>
          </VStack>

          {/* Destinations Grid */}
          <Grid
            templateColumns={{ 
              base: '1fr', 
              md: 'repeat(2, 1fr)', 
              lg: 'repeat(4, 1fr)' 
            }}
            gap={6}
            w="100%"
            className="animate__animated animate__fadeIn"
            style={{ animationDelay: '200ms' }}
          >
            {POPULAR_DESTINATIONS.map((destination, index) => (
              <DestinationCard 
                key={destination.code} 
                countryCode={destination.code}
                delay={index * 100}
                lang={lang}
              />
            ))}
          </Grid>
        </VStack>
      </Container>
    </Box>
  );
};

export default PopularDestinations;