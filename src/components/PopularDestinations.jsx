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
import { GlobeAsiaAustraliaIcon } from '@heroicons/react/24/solid';
import { MagnifyingGlassIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import CountryFlag from './CountryFlag';
import { useNavigate } from 'react-router-dom';
import { POPULAR_DESTINATIONS } from '../config/pricing';
import { getCountryName, getTranslation } from '../config/i18n';
import { useLanguage } from '../contexts/LanguageContext';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { fetchAllRegionalPackages, fetchGlobalPackages } from '../services/packageService.js';
import { getRegionName } from '../services/packageCacheService.js';

// Custom Arrow Circle SVG Component
const ArrowCircleSvg = () => (
  <svg width="48" height="48" viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M46.5625 55L57.8125 43.75ZM57.8125 43.75L46.5625 32.5ZM57.8125 43.75H29.6875ZM77.5 43.75C77.5 48.1821 76.627 52.5708 74.9309 56.6656C73.2348 60.7603 70.7488 64.4809 67.6149 67.6149C64.4809 70.7488 60.7603 73.2348 56.6656 74.9309C52.5708 76.627 48.1821 77.5 43.75 77.5C39.3179 77.5 34.9292 76.627 30.8344 74.9309C26.7397 73.2348 23.0191 70.7488 19.8851 67.6149C16.7512 64.4809 14.2652 60.7603 12.5691 56.6656C10.873 52.5708 10 48.1821 10 43.75C10 34.7989 13.5558 26.2145 19.8851 19.8851C26.2145 13.5558 34.7989 10 43.75 10C52.7011 10 61.2855 13.5558 67.6149 19.8851C73.9442 26.2145 77.5 34.7989 77.5 43.75Z" fill="white"/>
    <path d="M46.5625 55L57.8125 43.75M57.8125 43.75L46.5625 32.5M57.8125 43.75H29.6875M77.5 43.75C77.5 48.1821 76.627 52.5708 74.9309 56.6656C73.2348 60.7603 70.7488 64.4809 67.6149 67.6149C64.4809 70.7488 60.7603 73.2348 56.6656 74.9309C52.5708 76.627 48.1821 77.5 43.75 77.5C39.3179 77.5 34.9292 76.627 30.8344 74.9309C26.7397 73.2348 23.0191 70.7488 19.8851 67.6149C16.7512 64.4809 14.2652 60.7603 12.5691 56.6656C10.873 52.5708 10 48.1821 10 43.75C10 34.7989 13.5558 26.2145 19.8851 19.8851C26.2145 13.5558 34.7989 10 43.75 10C52.7011 10 61.2855 13.5558 67.6149 19.8851C73.9442 26.2145 77.5 34.7989 77.5 43.75Z" stroke="url(#paint0_linear_274_3069)" strokeWidth="3.3" strokeLinecap="round" strokeLinejoin="round"/>
    <defs>
      <linearGradient id="paint0_linear_274_3069" x1="51.25" y1="56.75" x2="20.75" y2="11.75" gradientUnits="userSpaceOnUse">
        <stop stopColor="#71727C"/>
        <stop offset="1" stopColor="#FF6943"/>
      </linearGradient>
    </defs>
  </svg>
);

// Background image mapping for country cards
const IMAGE_SLUG_MAP = {
  TR: 'turkey',
  SA: 'saudi-arabia',
  AE: 'uae',
  EG: 'egypt',
  TH: 'thailand',
  VN: 'vietnam',
  CN: 'china',
  US: 'usa',
  MY: 'malaysia',
  ID: 'indonesia',
};

const getBackgroundImageUrl = (countryCode) => {
  const slug = IMAGE_SLUG_MAP[countryCode] || countryCode.toLowerCase();
  return `https://ik.imagekit.io/php1jcf0t/OneSim/Background-Cover-Images/Country%20Cards/${slug}.jpg`;
};

// Country name overrides for long names
const COUNTRY_NAME_OVERRIDES = {
  ru: {
    SA: 'С. Аравия',
    AE: 'ОАЭ',
    US: 'США',
  },
  uz: {
    SA: 'S. Arabiya',
    AE: 'BAA',
    US: 'AQSh',
  },
  en: {
    SA: 'Saudi Arabia',
    AE: 'UAE',
    US: 'USA',
  }
};

const getDisplayCountryName = (countryCode, lang) => {
  if (COUNTRY_NAME_OVERRIDES[lang]?.[countryCode]) {
    return COUNTRY_NAME_OVERRIDES[lang][countryCode];
  }
  return getCountryName(countryCode, lang);
};

// Country Destination Card Component - NEW DESIGN (SCALED & FIXED)
const DestinationCard = ({ countryCode, delay = 0, lang }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [packageCount, setPackageCount] = useState(null);
  const [cardRef, isVisible] = useScrollAnimation(0.1);
  const navigate = useNavigate();
  const t = (key) => getTranslation(lang, key);
  const countryName = getDisplayCountryName(countryCode, lang);
  const backgroundImageUrl = getBackgroundImageUrl(countryCode);

  // Fetch package count
  useEffect(() => {
    const fetchPackageCount = async () => {
      try {
        const response = await fetch(`/api/packages-v2?type=country&country=${countryCode}`);
        if (response.ok) {
          const result = await response.json();
          setPackageCount(result.data?.length || 0);
        }
      } catch (error) {
        console.error('Error fetching package count:', error);
        setPackageCount(0);
      }
    };
    fetchPackageCount();
  }, [countryCode]);

  const handleExplore = () => {
    navigate(`/country/${countryCode}`);
  };

  return (
    <Box
      ref={cardRef}
      w="360px"
      h="470px"
      borderRadius="39px"
      overflow="hidden"
      position="relative"
      cursor="pointer"
      onClick={handleExplore}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      opacity={isVisible ? 1 : 0}
      style={{
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`,
      }}
    >
      {/* 1. Background Image (scales on hover) */}
      <Box
        position="absolute"
        top="-10%"
        left="0"
        w="100%"
        h="122%"
        zIndex={0}
        transition="transform 0.4s ease-out"
        transform={isHovered ? 'scale(1.08)' : 'scale(1)'}
      >
        <Box
          as="img"
          src={backgroundImageUrl}
          alt={countryName}
          w="100%"
          h="100%"
          objectFit="cover"
        />
      </Box>

      {/* 2. Dark Overlay (appears on hover) */}
      <Box
        position="absolute"
        bottom="0"
        left="0"
        right="0"
        h="345px"
        bgGradient="linear(to-b, rgba(55,55,55,0) 0%, rgba(4,4,4,0.47) 64%, rgba(0,0,0,0.5) 96%)"
        borderRadius="27px"
        opacity={isHovered ? 1 : 0}
        transition="opacity 0.3s ease-out"
        zIndex={1}
        pointerEvents="none"
      />

      {/* 3. Orange Overlay Gradient (appears on hover) - NEW */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bgGradient="linear(to-b, rgba(157,157,157,0) 0%, #DE5226 100%)"
        borderRadius="39px"
        opacity={isHovered ? 1 : 0}
        transition="opacity 0.4s ease-out"
        zIndex={1.5}
        pointerEvents="none"
      />

      {/* 4. Bottom Bar (flag + name + arrow) */}
      <HStack
        position="absolute"
        bottom="21px"
        left="21px"
        w="316px"
        h="74px"
        bg="rgba(255, 255, 255, 0.07)"
        backdropFilter="blur(40px)"
        css={{ WebkitBackdropFilter: 'blur(40px)' }}
        borderRadius="39px"
        border={isHovered ? '3px solid rgba(255,255,255,0.24)' : '1px solid rgba(255,255,255,0.15)'}
        boxShadow={isHovered ? '0 4px 23.6px 0 rgba(255,161,128,0.40)' : 'none'}
        transition="all 0.3s ease-out"
        justify="space-between"
        align="center"
        pl="18px"
        pr="10px"
        py="6px"
        zIndex={2}
        pointerEvents="none"
      >
        {/* Left: flag + name */}
        <HStack spacing="14px" align="center">
          <Box w="42px" h="28px" borderRadius="7px" overflow="hidden">
            <CountryFlag
              code={countryCode}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </Box>
          <Text
            fontFamily="'Manrope', sans-serif"
            fontWeight="700"
            fontSize="26px"
            color="white"
            letterSpacing="-0.26px"
            lineHeight="normal"
            whiteSpace="nowrap"
            maxW="200px"
            overflow="hidden"
            textOverflow="ellipsis"
          >
            {countryName}
          </Text>
        </HStack>

        {/* Right: arrow icon (slides in on hover) */}
        <Box
          w="55px"
          h="55px"
          borderRadius="full"
          bg="rgba(255, 255, 255, 0.15)"
          border="1px solid rgba(255, 255, 255, 0.2)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          transform={isHovered ? 'translateX(0)' : 'translateX(-65px)'}
          opacity={isHovered ? 1 : 0}
          transition="transform 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.1s, opacity 0.3s ease-out"
        >
          <ArrowRightIcon style={{ width: '20px', height: '20px', color: 'white' }} />
        </Box>
      </HStack>

      {/* 5. Top-Right Badge (package count, appears on hover) */}
      {packageCount !== null && (
        <Box
          position="absolute"
          top="22px"
          right="21px"
          w="122px"
          h="41px"
          borderRadius="44px"
          bg="rgba(0, 0, 0, 0.14)"
          backdropFilter="blur(10px)"
          css={{ WebkitBackdropFilter: 'blur(10px)' }}
          display="flex"
          alignItems="center"
          justifyContent="center"
          opacity={isHovered ? 1 : 0}
          transform={isHovered ? 'scale(1)' : 'scale(0.9)'}
          transition="opacity 0.3s ease-out 0.15s, transform 0.3s ease-out 0.15s"
          zIndex={3}
          pointerEvents="none"
        >
          <Text
            fontFamily="'Manrope', sans-serif"
            fontWeight="400"
            fontSize="16px"
            color="white"
            letterSpacing="-0.16px"
            lineHeight="normal"
          >
            {packageCount}+ {t('destinations.plans')}
          </Text>
        </Box>
      )}
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
      transition="transform 0.15s ease-out, box-shadow 0s"
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
      h="200px"
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
        <VStack align="stretch" spacing={2} h="100%">
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
                  bg="white"
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
              transition="all 0.15s"
              transform={isHovered ? 'scale(1.05)' : 'scale(1)'}
            >
              <ArrowCircleSvg />
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
      transition="transform 0.15s ease-out, box-shadow 0s"
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
      minH="fit-content"
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

      <Box position="relative" zIndex={1} p={6}>
        <VStack align="stretch" spacing={3}>
          {/* Country Count with Globe Icon */}
          <HStack spacing={1} align="center">
            <GlobeAsiaAustraliaIcon
              style={{
                width: '16px',
                height: '16px',
                color: '#FE4F18'
              }}
            />
            <Text fontSize="sm" color="gray.600" fontWeight="600">
              {countryCount} {t('destinations.global.countries')}
            </Text>
          </HStack>

          {/* Package Name */}
          <Heading
            fontSize="24px"
            fontWeight="800"
            color="gray.900"
            fontFamily="'Manrope', sans-serif"
          >
            {pkg.name}
          </Heading>

          {/* Package Details */}
          <VStack align="stretch" spacing={1}>
            <Text fontSize="18px" fontWeight="600" color="gray.700" fontFamily="'Manrope', sans-serif">
              {dataGB}GB · {days} {t('plans.card.days')}
            </Text>
            <Text fontSize="2xl" fontWeight="800" color="#FE4F18">
              ${priceUSD}
            </Text>
          </VStack>

          {/* Country Flags and Arrow */}
          <HStack justify="space-between" align="center">
            {/* Flags */}
            <HStack spacing="-10px">
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

            {/* Arrow Button */}
            <Box
              transition="all 0.15s"
              transform={isHovered ? 'scale(1.05)' : 'scale(1)'}
            >
              <ArrowCircleSvg />
            </Box>
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
};

// Main Popular Destinations Component
// Map tab names to indices
const TAB_MAP = {
  'countries': 0,
  'regional': 1,
  'global': 2
};

const PopularDestinations = ({ scrollToSection = false, initialTab = null }) => {
  const { currentLanguage } = useLanguage();
  const t = (key) => getTranslation(currentLanguage, key);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // Set initial tab based on prop or default to 0
  const getInitialTabIndex = () => {
    if (initialTab && TAB_MAP[initialTab] !== undefined) {
      return TAB_MAP[initialTab];
    }
    return 0;
  };

  const [activeTab, setActiveTab] = useState(getInitialTabIndex());
  const [regionalPackages, setRegionalPackages] = useState({});
  const [globalPackages, setGlobalPackages] = useState([]);
  const [isLoadingRegional, setIsLoadingRegional] = useState(false);
  const [isLoadingGlobal, setIsLoadingGlobal] = useState(false);

  // Create ref for scrolling
  const sectionRef = React.useRef(null);

  // Handle scrolling to section when navigation state indicates it
  useEffect(() => {
    if (scrollToSection && sectionRef.current) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        sectionRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  }, [scrollToSection]);

  // Update active tab when initialTab prop changes
  useEffect(() => {
    if (initialTab && TAB_MAP[initialTab] !== undefined) {
      setActiveTab(TAB_MAP[initialTab]);
    }
  }, [initialTab]);

  // Fetch regional packages when Regional tab is selected
  useEffect(() => {
    if (activeTab === 1 && Object.keys(regionalPackages).length === 0) {
      setIsLoadingRegional(true);
      fetchAllRegionalPackages()
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
  }, [activeTab, regionalPackages]);

  // Fetch global packages when Global tab is selected
  useEffect(() => {
    if (activeTab === 2 && globalPackages.length === 0) {
      setIsLoadingGlobal(true);
      fetchGlobalPackages()
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
  }, [activeTab, globalPackages]);

  // Filter destinations based on search query - first letter must match
  const filteredDestinations = POPULAR_DESTINATIONS.filter(destination => {
    if (!searchQuery) return true;
    const countryName = getCountryName(destination.code, currentLanguage).toLowerCase();
    return countryName.startsWith(searchQuery.toLowerCase());
  });

  return (
    <Box as="section" ref={sectionRef} py={24} bg="#F5F6F8" position="relative">
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
                  boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.16), 0 2px 6px 0 rgba(0, 0, 0, 0.12)',
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
                  boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.16), 0 2px 6px 0 rgba(0, 0, 0, 0.12)',
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
                  boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.16), 0 2px 6px 0 rgba(0, 0, 0, 0.12)',
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
                <>
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
                    {globalPackages.slice(0, 8).map((pkg, index) => (
                      <GlobalCard
                        key={pkg.packageCode}
                        pkg={pkg}
                        delay={index * 100}
                        lang={currentLanguage}
                      />
                    ))}
                  </Grid>

                  {/* See More Plans Button */}
                  {globalPackages.length > 8 && (
                    <Box width="100%" display="flex" justifyContent="center" mt={8}>
                      <Button
                        variant="outline"
                        borderColor="gray.300"
                        color="gray.700"
                        fontWeight="600"
                        fontSize="md"
                        px={8}
                        py={6}
                        borderRadius="xl"
                        _hover={{
                          bg: 'gray.50',
                          borderColor: 'gray.400',
                        }}
                        transition="all 0.2s"
                      >
                        {t('destinations.global.seeMorePlans')}
                      </Button>
                    </Box>
                  )}
                </>
              )}
            </>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default PopularDestinations;
