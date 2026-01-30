// src/components/PopularDestinations.jsx
import React, { useState, useEffect } from 'react';
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
  Tabs,
  TabList,
  Tab,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { ArrowRightIcon } from '@heroicons/react/24/solid';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import CountryFlag from './CountryFlag';
import { useNavigate } from 'react-router-dom';
import { POPULAR_DESTINATIONS } from '../config/pricing';
import { getCountryName, getTranslation } from '../config/i18n';
import { useLanguage } from '../contexts/LanguageContext';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { fetchRegionalPackages, fetchGlobalPackages } from '../services/esimAccessApi.js';
import { getRegionName } from '../services/packageCacheService.js';

// Country Destination Card Component
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
      transition="all 0.15s ease-out"
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
        background="linear-gradient(90deg, #FE4F18 0%, #FF6B3D 100%)"
        opacity={isHovered ? 1 : 0}
        transition="opacity 0.15s"
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
              fontFamily="'Manrope', sans-serif"
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
            transition="all 0.15s ease-out"
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

// Regional Package Card Component
const RegionalCard = ({ regionCode, packages, coveredCountries = [], packageCount = 0, delay = 0, lang }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [cardRef, isVisible] = useScrollAnimation(0.1);
  const navigate = useNavigate();
  const t = (key) => getTranslation(lang, key);

  // Get localized region name
  const regionName = getRegionName(regionCode, lang);

  // Use provided coveredCountries or extract from packages as fallback
  let countryList = coveredCountries;
  if (!coveredCountries || coveredCountries.length === 0) {
    const countriesSet = new Set();
    packages.forEach(pkg => {
      if (pkg.locationNetworkList && Array.isArray(pkg.locationNetworkList)) {
        pkg.locationNetworkList.forEach(loc => {
          if (loc.locationCode && !loc.locationCode.startsWith('!')) {
            countriesSet.add(loc.locationCode);
          }
        });
      }
    });
    countryList = Array.from(countriesSet).map(code => ({ code }));
  }

  const displayFlags = countryList.slice(0, 5);
  const remainingCount = countryList.length > 5 ? countryList.length - 5 : 0;
  const actualPackageCount = packageCount || packages.length;

  const handleViewPlans = () => {
    navigate(`/regional/${regionCode}`);
  };

  return (
    <Box
      ref={cardRef}
      position="relative"
      cursor="pointer"
      borderRadius="24px"
      overflow="visible"
      transition="all 0.15s ease-out"
      transform={isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)'}
      shadow={isHovered ? '0 25px 50px rgba(254, 79, 24, 0.2)' : '0 4px 12px rgba(0, 0, 0, 0.08)'}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleViewPlans}
      opacity={isVisible ? 1 : 0}
      style={{
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`,
      }}
      h="180px"
      _before={{
        content: '""',
        position: 'absolute',
        inset: 0,
        borderRadius: '24px',
        padding: '2px',
        background: 'radial-gradient(circle at 100% 100%, #FE5F37 0%, rgba(170, 153, 158, 0.45) 50%, rgba(147, 163, 179, 0.3) 100%)',
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
        pointerEvents: 'none',
      }}
    >
      {/* Inner content container with background */}
      <Box
        position="absolute"
        inset="2px"
        bg="linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 100%)"
        borderRadius="22px"
        overflow="hidden"
      />

      <Box position="relative" zIndex={1} p={8} h="100%">
        <VStack align="stretch" spacing={4} h="100%">
          {/* Region Title */}
          <Heading
            fontSize="24px"
            fontWeight="800"
            color="gray.900"
            fontFamily="'Manrope', sans-serif"
          >
            {regionName}
          </Heading>

          {/* Package Count */}
          <Text fontSize="md" color="gray.600" fontWeight="500">
            {actualPackageCount} {t('destinations.regional.packagesCount')}
          </Text>

          {/* Country Flags and Arrow */}
          <HStack justify="space-between" align="center" mt="auto">
            {/* Flags */}
            <HStack spacing="-10px">
              {displayFlags.map((country, index) => {
                const countryCode = typeof country === 'string' ? country : country.code;
                return (
                  <Box
                    key={countryCode}
                    borderRadius="full"
                    overflow="hidden"
                    width="32px"
                    height="32px"
                    border="2px solid white"
                    shadow="md"
                    zIndex={displayFlags.length - index}
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
                );
              })}
              {remainingCount > 0 && (
                <Box
                  borderRadius="full"
                  width="32px"
                  height="32px"
                  border="2px solid white"
                  bg="gray.100"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  shadow="md"
                  zIndex={0}
                >
                  <Text fontSize="xs" fontWeight="700" color="gray.700">
                    +{remainingCount}
                  </Text>
                </Box>
              )}
            </HStack>

            {/* Arrow Button */}
            <Box
              bg="white"
              borderRadius="full"
              width="48px"
              height="48px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              transition="all 0.3s"
              shadow="md"
            >
              <ArrowRightIcon
                className="w-[20px] h-[20px]"
                style={{ color: '#FE4F18' }}
              />
            </Box>
          </HStack>

          {/* Countries Text */}
          <Text fontSize="sm" color="gray.500" fontWeight="500" mt={2}>
            {countryList.length} {t('destinations.regional.moreCountries')}
          </Text>
        </VStack>
      </Box>
    </Box>
  );
};

// Global Package Card Component
const GlobalCard = ({ pkg, delay = 0, lang }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [cardRef, isVisible] = useScrollAnimation(0.1);
  const navigate = useNavigate();
  const t = (key) => getTranslation(lang, key);

  // Extract package details
  const dataGB = Math.round(pkg.volume / 1073741824);
  const priceUSD = (pkg.price / 10000).toFixed(2);
  const days = pkg.duration;

  // Get covered countries count
  const coveredCountries = new Set();
  if (pkg.locationNetworkList && Array.isArray(pkg.locationNetworkList)) {
    pkg.locationNetworkList.forEach(loc => {
      if (loc.locationCode && !loc.locationCode.startsWith('!')) {
        coveredCountries.add(loc.locationCode);
      }
    });
  }

  const countryCount = coveredCountries.size;
  const displayFlags = Array.from(coveredCountries).slice(0, 5);

  const handleViewPlan = () => {
    // Transform package data to match expected format
    const planData = {
      id: `${pkg.packageCode}_${pkg.slug}`,
      packageCode: pkg.packageCode,
      slug: pkg.slug,
      country: 'Global',
      countryCode: 'GLOBAL',
      data: dataGB >= 1 ? `${dataGB}GB` : `${Math.round(pkg.volume / 1048576)}MB`,
      dataGB: dataGB,
      days: days,
      speed: pkg.speed || '4G/5G',
      priceUSD: parseFloat(priceUSD),
      originalPrice: pkg.price,
      description: pkg.description || pkg.name,
      name: pkg.name,
      operatorList: pkg.locationNetworkList || [],
      rawPackage: pkg
    };

    navigate(`/package/${pkg.slug}`, {
      state: {
        plan: planData,
        countryCode: 'GLOBAL'
      }
    });
  };

  return (
    <Box
      ref={cardRef}
      position="relative"
      cursor="pointer"
      borderRadius="24px"
      overflow="visible"
      transition="all 0.15s ease-out"
      transform={isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)'}
      shadow={isHovered ? '0 25px 50px rgba(254, 79, 24, 0.2)' : '0 4px 12px rgba(0, 0, 0, 0.08)'}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleViewPlan}
      opacity={isVisible ? 1 : 0}
      style={{
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`,
      }}
      h="180px"
      _before={{
        content: '""',
        position: 'absolute',
        inset: 0,
        borderRadius: '24px',
        padding: '2px',
        background: 'radial-gradient(circle at 100% 100%, #FE5F37 0%, rgba(170, 153, 158, 0.45) 50%, rgba(147, 163, 179, 0.3) 100%)',
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
        pointerEvents: 'none',
      }}
    >
      {/* Inner content container with background */}
      <Box
        position="absolute"
        inset="2px"
        bg="linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 100%)"
        borderRadius="22px"
        overflow="hidden"
      />

      <Box position="relative" zIndex={1} p={8} h="100%">
        <VStack align="stretch" spacing={4} h="100%">
          {/* Global Badge */}
          <Badge
            bg="#FFF4F0"
            color="#FE4F18"
            fontSize="xs"
            fontWeight="700"
            px={3}
            py={1}
            borderRadius="full"
            textTransform="uppercase"
            width="fit-content"
          >
            {t('destinations.global.coverage')}
          </Badge>

          {/* Package Details */}
          <VStack align="stretch" spacing={2}>
            <Heading fontSize="22px" fontWeight="800" color="gray.900" fontFamily="'Manrope', sans-serif">
              {dataGB}GB · {days} {t('plans.card.days')}
            </Heading>
            <Text fontSize="2xl" fontWeight="800" color="#FE4F18">
              ${priceUSD}
            </Text>
          </VStack>

          {/* Country Flags */}
          <HStack spacing="-10px" mt="auto">
            {displayFlags.map((countryCode, index) => (
              <Box
                key={countryCode}
                borderRadius="full"
                overflow="hidden"
                width="32px"
                height="32px"
                border="2px solid white"
                shadow="md"
                zIndex={displayFlags.length - index}
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
            ))}
          </HStack>

          {/* Countries Count */}
          <Text fontSize="sm" color="gray.600" fontWeight="500">
            {countryCount} {t('destinations.global.countries')}
          </Text>

          {/* View Button */}
          <Button
            width="100%"
            bg={isHovered ? '#FE4F18' : 'gray.100'}
            color={isHovered ? 'white' : 'gray.700'}
            _hover={{
              bg: '#FF6B3D',
              color: 'white',
            }}
            transition="all 0.3s"
            borderRadius="lg"
            fontWeight="700"
            rightIcon={<ArrowRightIcon className="w-[18px] h-[18px]" />}
            onClick={handleViewPlan}
          >
            {t('destinations.global.viewPlans')}
          </Button>
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
  const [activeTab, setActiveTab] = useState(0);
  const [regionalPackages, setRegionalPackages] = useState({});
  const [globalPackages, setGlobalPackages] = useState([]);
  const [isLoadingRegional, setIsLoadingRegional] = useState(false);
  const [isLoadingGlobal, setIsLoadingGlobal] = useState(false);

  // Fetch regional packages when Regional tab is selected
  useEffect(() => {
    if (activeTab === 1 && Object.keys(regionalPackages).length === 0) {
      setIsLoadingRegional(true);
      fetchRegionalPackages(currentLanguage)
        .then(data => {
          console.log('✅ Regional packages loaded:', data);
          setRegionalPackages(data);
        })
        .catch(error => {
          console.error('❌ Error loading regional packages:', error);
        })
        .finally(() => {
          setIsLoadingRegional(false);
        });
    }
  }, [activeTab, currentLanguage, regionalPackages]);

  // Fetch global packages when Global tab is selected
  useEffect(() => {
    if (activeTab === 2 && globalPackages.length === 0) {
      setIsLoadingGlobal(true);
      fetchGlobalPackages(currentLanguage)
        .then(data => {
          console.log('✅ Global packages loaded:', data);
          setGlobalPackages(data);
        })
        .catch(error => {
          console.error('❌ Error loading global packages:', error);
        })
        .finally(() => {
          setIsLoadingGlobal(false);
        });
    }
  }, [activeTab, currentLanguage, globalPackages]);

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
              fontWeight="800"
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
          </VStack>

          {/* Tab Switcher */}
          <Tabs
            variant="unstyled"
            index={activeTab}
            onChange={(index) => setActiveTab(index)}
            width="100%"
          >
            <TabList
              bg="rgba(236, 238, 242, 0.59)"
              borderRadius="34px"
              p="8px"
              gap="8px"
              width="fit-content"
              mx="auto"
            >
              <Tab
                fontWeight="600"
                fontSize="14px"
                px="16px"
                py="12px"
                borderRadius="24px"
                border="1px solid rgba(33, 40, 48, 0.17)"
                bg="transparent"
                _selected={{
                  bg: 'white',
                  color: 'gray.900',
                  fontWeight: '700',
                  border: 'none',
                  shadow: 'sm',
                }}
                color="gray.600"
                transition="all 0.3s"
                fontFamily="'Manrope', sans-serif"
              >
                {t('destinations.tabs.countries')}
              </Tab>
              <Tab
                fontWeight="600"
                fontSize="14px"
                px="16px"
                py="12px"
                borderRadius="24px"
                border="1px solid rgba(33, 40, 48, 0.17)"
                bg="transparent"
                _selected={{
                  bg: 'white',
                  color: 'gray.900',
                  fontWeight: '700',
                  border: 'none',
                  shadow: 'sm',
                }}
                color="gray.600"
                transition="all 0.3s"
                fontFamily="'Manrope', sans-serif"
              >
                {t('destinations.tabs.regional')}
              </Tab>
              <Tab
                fontWeight="600"
                fontSize="14px"
                px="16px"
                py="12px"
                borderRadius="24px"
                border="1px solid rgba(33, 40, 48, 0.17)"
                bg="transparent"
                _selected={{
                  bg: 'white',
                  color: 'gray.900',
                  fontWeight: '700',
                  border: 'none',
                  shadow: 'sm',
                }}
                color="gray.600"
                transition="all 0.3s"
                fontFamily="'Manrope', sans-serif"
              >
                {t('destinations.tabs.global')}
              </Tab>
            </TabList>
          </Tabs>

          {/* Countries Tab Content */}
          {activeTab === 0 && (
            <>
              {/* Animated Search */}
              <Box width="100%" display="flex" justifyContent="flex-start">
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

              {/* Countries Grid */}
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
            </>
          )}

          {/* Regional Tab Content */}
          {activeTab === 1 && (
            <>
              {isLoadingRegional ? (
                <Center py={12}>
                  <Spinner size="xl" color="#FE4F18" thickness="4px" />
                </Center>
              ) : (
                <Grid
                  templateColumns={{
                    base: '1fr',
                    md: 'repeat(2, 1fr)',
                    lg: 'repeat(3, 1fr)'
                  }}
                  gap={6}
                  w="100%"
                  className="animate__animated animate__fadeIn"
                >
                  {Object.entries(regionalPackages).map(([regionCode, regionData], index) => {
                    // Handle both old format (packages array) and new format (object with metadata)
                    const packages = Array.isArray(regionData) ? regionData : regionData.packages || [];
                    const coveredCountries = regionData.coveredCountries || [];
                    const packageCount = regionData.packageCount || packages.length;

                    return (
                      <RegionalCard
                        key={regionCode}
                        regionCode={regionCode}
                        packages={packages}
                        coveredCountries={coveredCountries}
                        packageCount={packageCount}
                        delay={index * 100}
                        lang={currentLanguage}
                      />
                    );
                  })}
                </Grid>
              )}
            </>
          )}

          {/* Global Tab Content */}
          {activeTab === 2 && (
            <>
              {isLoadingGlobal ? (
                <Center py={12}>
                  <Spinner size="xl" color="#FE4F18" thickness="4px" />
                </Center>
              ) : (
                <Grid
                  templateColumns={{
                    base: '1fr',
                    md: 'repeat(2, 1fr)',
                    lg: 'repeat(3, 1fr)'
                  }}
                  gap={6}
                  w="100%"
                  className="animate__animated animate__fadeIn"
                >
                  {globalPackages.map((pkg, index) => (
                    <GlobalCard
                      key={pkg.packageCode}
                      pkg={pkg}
                      delay={index * 100}
                      lang={currentLanguage}
                    />
                  ))}
                </Grid>
              )}
            </>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default PopularDestinations;
