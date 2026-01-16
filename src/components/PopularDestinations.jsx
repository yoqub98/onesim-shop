// src/components/PopularDestinations.jsx
import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Grid,
  Badge,
  HStack,
  VStack,
  Input,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { ArrowRightIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import CountryFlag from './CountryFlag';
import { useNavigate } from 'react-router-dom';
import { POPULAR_DESTINATIONS } from '../config/pricing';
import { getCountryName, getTranslation } from '../config/i18n';
import { useLanguage } from '../contexts/LanguageContext';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

// Destination Card Component
const DestinationCard = ({ countryCode, delay = 0, lang }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [cardRef, isVisible] = useScrollAnimation(0.1);
  const navigate = useNavigate();
  const t = (key) => getTranslation(lang, key);
  const countryName = getCountryName(countryCode, lang);

  const handleExplore = () => {
    navigate(`/country/${countryCode}`);
  };

  return (
    <Box
      ref={cardRef}
      position="relative"
      cursor="pointer"
      bg="white"
      borderRadius="2xl"
      overflow="hidden"
      border="2px solid"
      borderColor={isHovered ? '#FE4F18' : '#E8E9EE'}
      transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
      transform={isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)'}
      shadow={isHovered ? '0 25px 50px rgba(254, 79, 24, 0.2)' : '0 4px 12px rgba(0, 0, 0, 0.08)'}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleExplore}
      opacity={isVisible ? 1 : 0}
      style={{
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`,
      }}
      minH="160px"
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

      <Box p={8}>
        <VStack align="stretch" spacing={6} justify="space-between" h="100%">
          {/* Flag and Country Name */}
          <HStack spacing={4} flexWrap="nowrap">
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
              <CountryFlag
                code={countryCode}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </Box>
            <Heading
              size="lg"
              fontWeight="700"
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
              bg="#FE4F18"
              color="white"
              _hover={{
                bg: '#FF6B3D',
              }}
              transition="all 0.3s"
              borderRadius="lg"
              fontWeight="700"
              rightIcon={<ArrowRightIcon className="w-[18px] h-[18px]" />}
              onClick={handleExplore}
            >
              {t('destinations.explore')}
            </Button>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
};

// Main Popular Destinations Component
const PopularDestinations = () => {
  const { currentLanguage } = useLanguage();
  const t = (key) => getTranslation(currentLanguage, key);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // Filter destinations based on search query - first letter must match
  const filteredDestinations = POPULAR_DESTINATIONS.filter(destination => {
    if (!searchQuery) return true;
    const countryName = getCountryName(destination.code, currentLanguage).toLowerCase();
    return countryName.startsWith(searchQuery.toLowerCase());
  });

  return (
    <Box as="section" py={24} bg="#F5F6F8" position="relative">
      {/* Background decoration */}
      <Box
        position="absolute"
        top="20%"
        right="-10%"
        width="500px"
        height="500px"
        bg="#FFF4F0"
        borderRadius="full"
        filter="blur(100px)"
        opacity="0.5"
        pointerEvents="none"
      />

      <Container maxW="8xl" position="relative">
        <VStack spacing={16}>
          {/* Section Header */}
          <VStack spacing={4} textAlign="center" className="animate__animated animate__fadeIn" width="100%">
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
              {t('destinations.badge')}
            </Badge>
            <Heading
              as="h2"
              fontSize={{ base: '4xl', md: '5xl' }}
              fontWeight="700"
              color="gray.900"
              letterSpacing="tight"
            >
              {t('destinations.title')}{' '}
              <Box
                as="span"
                color="#FE4F18"
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

            {/* Animated Search */}
            <Box width="100%" display="flex" justifyContent="flex-start" mt={6}>
              {!isSearchExpanded ? (
                <Button
                  leftIcon={<MagnifyingGlassIcon className="w-[18px] h-[18px]" />}
                  onClick={() => setIsSearchExpanded(true)}
                  variant="outline"
                  borderColor="#FE4F18"
                  color="#FE4F18"
                  borderWidth="2px"
                  fontWeight="700"
                  size="md"
                  _hover={{ bg: '#FFF4F0' }}
                  className="animate__animated animate__fadeIn"
                >
                  {t('destinations.search')}
                </Button>
              ) : (
                <InputGroup
                  maxW="400px"
                  className="animate__animated animate__fadeIn animate__faster"
                >
                  <InputLeftElement pointerEvents="none">
                    <MagnifyingGlassIcon className="w-[18px] h-[18px] text-[#FE4F18]" />
                  </InputLeftElement>
                  <Input
                    placeholder={t('destinations.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onBlur={() => {
                      if (!searchQuery) {
                        setIsSearchExpanded(false);
                      }
                    }}
                    autoFocus
                    borderWidth="2px"
                    borderColor="#E8E9EE"
                    _focus={{
                      borderColor: '#FE4F18',
                      boxShadow: '0 0 0 1px #FE4F18',
                    }}
                    fontWeight="600"
                    size="md"
                  />
                </InputGroup>
              )}
            </Box>
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
            {filteredDestinations.length > 0 ? (
              filteredDestinations.map((destination, index) => (
                <DestinationCard
                  key={destination.code}
                  countryCode={destination.code}
                  delay={index * 100}
                  lang={currentLanguage}
                />
              ))
            ) : (
              <Box gridColumn="1 / -1" textAlign="center" py={12}>
                <Text fontSize="xl" color="gray.500" fontWeight="600">
                  {t('destinations.notFound')}
                </Text>
              </Box>
            )}
          </Grid>
        </VStack>
      </Container>
    </Box>
  );
};

export default PopularDestinations;