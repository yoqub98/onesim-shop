// src/pages/RegionalPackagesPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Grid,
  HStack,
  VStack,
  IconButton,
  Select,
} from '@chakra-ui/react';
import { ArrowLeft, ArrowUp, ArrowDown } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import DataPlanCard from '../components/DataPlanCard';
import { fetchPackagesByRegion } from '../services/packageService.js';
import { getRegionName } from '../services/packageCacheService.js';
import { calculateFinalPriceUSD } from '../config/pricing';
import { getTranslation } from '../config/i18n';
import { useLanguage } from '../contexts/LanguageContext';

const DEFAULT_DURATION_FILTER = 30;

// Loading Skeleton
const PlanCardSkeleton = () => {
  return (
    <Box
      borderRadius="32px"
      overflow="hidden"
      bg="white"
      boxShadow="0 4px 12px rgba(0, 0, 0, 0.06)"
      p={6}
      minWidth={{ base: '280px', md: '370px' }}
      width={{ base: '100%', md: '370px' }}
    >
      <VStack align="stretch" spacing={5}>
        <HStack justify="space-between">
          <Box
            width="120px"
            height="48px"
            bg="gray.200"
            borderRadius="lg"
            sx={{
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.5 },
              },
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
          <Box
            width="80px"
            height="40px"
            bg="gray.200"
            borderRadius="lg"
            sx={{
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.5 },
              },
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
        </HStack>
      </VStack>
    </Box>
  );
};

// Main Regional Packages Page Component
const RegionalPackagesPage = () => {
  const { regionCode } = useParams();
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();
  const t = (key) => getTranslation(currentLanguage, key);

  const [allPlans, setAllPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedData, setSelectedData] = useState('all');
  const [selectedDuration, setSelectedDuration] = useState(DEFAULT_DURATION_FILTER.toString());
  const [sortOrder, setSortOrder] = useState(null);

  const regionName = getRegionName(regionCode, currentLanguage);

  // Load regional packages
  useEffect(() => {
    let isMounted = true;

    const loadPlans = async () => {
      try {
        setLoading(true);
        setError(null);

        const packages = await fetchPackagesByRegion(regionCode);

        if (!isMounted) return;

        if (!packages || packages.length === 0) {
          setError(getTranslation(currentLanguage, 'country.noPlansAvailable'));
          setAllPlans([]);
          return;
        }

        // Packages come from DB already formatted
        setAllPlans(packages);
      } catch (err) {
        console.error('Error loading regional packages:', err);
        if (isMounted) {
          setError(getTranslation(currentLanguage, 'country.errorLoading'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadPlans();

    return () => {
      isMounted = false;
    };
  }, [regionCode, currentLanguage, regionName]);

  // Get unique data and duration options
  const { dataOptions, durationOptions } = useMemo(() => {
    const dataSet = new Set();
    const durationSet = new Set();

    allPlans.forEach(plan => {
      dataSet.add(plan.dataGB);
      durationSet.add(plan.days);
    });

    return {
      dataOptions: Array.from(dataSet).sort((a, b) => a - b),
      durationOptions: Array.from(durationSet).sort((a, b) => a - b),
    };
  }, [allPlans]);

  // Filter and sort plans
  const filteredAndSortedPlans = useMemo(() => {
    let filtered = [...allPlans];

    // Filter by data
    if (selectedData !== 'all') {
      const targetGB = parseFloat(selectedData);
      filtered = filtered.filter(plan => plan.dataGB === targetGB);
    }

    // Filter by duration
    if (selectedDuration !== 'all') {
      const targetDays = parseInt(selectedDuration);
      filtered = filtered.filter(plan => plan.days === targetDays);
    }

    // Sort by price
    if (sortOrder) {
      filtered.sort((a, b) => {
        const priceA = calculateFinalPriceUSD(a.priceUSD);
        const priceB = calculateFinalPriceUSD(b.priceUSD);
        return sortOrder === 'asc' ? priceA - priceB : priceB - priceA;
      });
    }

    return filtered;
  }, [allPlans, selectedData, selectedDuration, sortOrder]);

  // No pagination - display all plans

  // Get background image based on region
  const getBackgroundImage = (region) => {
    const regionLower = region?.toLowerCase() || '';
    if (regionLower.includes('europe') || regionLower === 'eu') {
      return 'https://ik.imagekit.io/php1jcf0t/OneSim/Background-Cover-Images/europe.webp';
    } else if (regionLower.includes('asia')) {
      return 'https://ik.imagekit.io/php1jcf0t/OneSim/Background-Cover-Images/asia.webp';
    } else if (regionLower.includes('africa') || regionLower.includes('afric')) {
      return 'https://ik.imagekit.io/php1jcf0t/OneSim/Background-Cover-Images/africa.webp';
    } else {
      return 'https://ik.imagekit.io/php1jcf0t/OneSim/Background-Cover-Images/latin.webp';
    }
  };

  // Get description based on region
  const getRegionDescription = (region) => {
    const regionLower = region?.toLowerCase() || '';
    if (regionLower.includes('europe') || regionLower === 'eu') {
      return t('regional.descriptions.EUROPE');
    } else if (regionLower.includes('asia')) {
      return t('regional.descriptions.ASIA');
    } else if (regionLower.includes('africa') || regionLower.includes('afric')) {
      return t('regional.descriptions.AFRICA');
    } else if (regionLower.includes('middle') || regionLower.includes('east')) {
      return t('regional.descriptions.MIDDLE_EAST');
    } else {
      return t('regional.descriptions.OTHER');
    }
  };

  return (
    <Box bg="#F9FAFB" minH="100vh">
      {/* Hero Banner Section */}
      <Box
        position="relative"
        h="400px"
        bgImage={`url('${getBackgroundImage(regionCode)}')`}
        bgSize="cover"
        bgPosition="center"
        overflow="hidden"
      >
        {/* Gradient Overlay */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          background="linear-gradient(177deg, rgba(0, 0, 0, 0.74) 9.55%, rgba(38, 18, 10, 0.74) 60.58%, rgba(255, 118, 69, 0.74) 100%)"
        />

        {/* Content */}
        <Container maxW="1400px" h="100%" position="relative" zIndex={1}>
          <VStack align="stretch" justify="flex-end" h="100%" pb={12} spacing={4}>
            {/* Back Button */}
            <Button
              leftIcon={<ArrowLeft size={20} />}
              onClick={() => navigate('/', { state: { scrollToDestinations: true, activeTab: 'regional' } })}
              bg="transparent"
              color="white"
              borderRadius="full"
              px={4}
              py={2}
              fontWeight="600"
              fontSize="md"
              width="fit-content"
              border="1px solid rgba(255, 255, 255, 0.3)"
              _hover={{
                bg: 'rgba(255, 255, 255, 0.1)',
                borderColor: 'rgba(255, 255, 255, 0.5)',
              }}
              transition="all 0.2s"
            >
              {t('country.back')}
            </Button>

            {/* Title and Region */}
            <VStack align="start" spacing={2}>
              <Text
                fontSize="26px"
                fontWeight="600"
                color="white"
                fontFamily="'Manrope', sans-serif"
              >
                {t('regional.title')}
              </Text>
              <Heading
                fontSize={{ base: '53px', md: '70px' }}
                fontWeight="800"
                color="white"
                fontFamily="'Manrope', sans-serif"
                lineHeight="1.1"
              >
                {regionName}
              </Heading>
              <Text
                fontSize="16px"
                fontWeight="400"
                color="rgba(255, 255, 255, 0.9)"
                fontFamily="'Manrope', sans-serif"
                maxW="750px"
                lineHeight="1.6"
              >
                {getRegionDescription(regionCode)}
              </Text>

              {/* Plans Available Badge */}
              {!loading && !error && (
                <Box
                  bg="rgba(255, 255, 255, 0.2)"
                  backdropFilter="blur(10px)"
                  borderRadius="full"
                  px={5}
                  py={2}
                  mt={2}
                >
                  <Text
                    fontSize="14px"
                    fontWeight="700"
                    color="white"
                    fontFamily="'Manrope', sans-serif"
                    textTransform="uppercase"
                    letterSpacing="wide"
                  >
                    {allPlans.length} {t('regional.plansAvailable')}
                  </Text>
                </Box>
              )}
            </VStack>
          </VStack>
        </Container>
      </Box>

      <Container maxW="1400px" pb={20}>

        {/* Filters Bar - Matching CountryPage */}
        {!loading && !error && allPlans.length > 0 && (
          <Box
            bg="transparent"
            py={6}
          >
            <HStack spacing={4} flexWrap="wrap" align="center">
              <Text fontWeight="700" color="#151618" fontSize="md" fontFamily="'Manrope', sans-serif">
                {t('countryPage.filters')}
              </Text>

              <Box minW="180px">
                <Select
                  value={selectedData}
                  onChange={(e) => setSelectedData(e.target.value)}
                  bg="white"
                  borderRadius="full"
                  border="1px solid"
                  borderColor="#E8E9EE"
                  fontSize="14px"
                  fontWeight="600"
                  fontFamily="'Manrope', sans-serif"
                  color="#151618"
                  h="46px"
                  cursor="pointer"
                  _hover={{
                    borderColor: '#FE4F18',
                  }}
                  _focus={{
                    borderColor: '#FE4F18',
                    boxShadow: '0 0 0 1px #FE4F18',
                  }}
                >
                  <option value="all">{t('countryPage.allDataOptions')}</option>
                  {dataOptions.map((gb) => (
                    <option key={gb} value={gb}>
                      {gb >= 1 ? `${gb}GB` : `${Math.round(gb * 1024)}MB`}
                    </option>
                  ))}
                </Select>
              </Box>

              <Box minW="180px">
                <Select
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(e.target.value)}
                  bg="white"
                  borderRadius="full"
                  border="1px solid"
                  borderColor="#E8E9EE"
                  fontSize="14px"
                  fontWeight="600"
                  fontFamily="'Manrope', sans-serif"
                  color="#151618"
                  h="46px"
                  cursor="pointer"
                  _hover={{
                    borderColor: '#FE4F18',
                  }}
                  _focus={{
                    borderColor: '#FE4F18',
                    boxShadow: '0 0 0 1px #FE4F18',
                  }}
                >
                  <option value="all">{t('countryPage.allDurationOptions')}</option>
                  {durationOptions.map((days) => (
                    <option key={days} value={days}>
                      {days} {t('countryPage.banner.days')}
                    </option>
                  ))}
                </Select>
              </Box>

              {/* Sort by Price */}
              <HStack spacing={3} align="center">
                <Text fontWeight="600" color="#151618" fontSize="sm" fontFamily="'Manrope', sans-serif">
                  {t('countryPage.sortByPrice')}:
                </Text>
                <HStack spacing={2}>
                  <IconButton
                    onClick={() => setSortOrder(sortOrder === 'asc' ? null : 'asc')}
                    bg={sortOrder === 'asc' ? '#FE4F18' : 'white'}
                    color={sortOrder === 'asc' ? 'white' : '#151618'}
                    borderRadius="full"
                    size="md"
                    h="46px"
                    w="46px"
                    aria-label="Sort price ascending"
                    _hover={{
                      bg: sortOrder === 'asc' ? '#E5461A' : '#FFF4F0',
                      transform: 'scale(1.05)',
                    }}
                    transition="all 0.2s"
                    title="Low to High"
                  >
                    <ArrowUp size={20} />
                  </IconButton>

                  <IconButton
                    onClick={() => setSortOrder(sortOrder === 'desc' ? null : 'desc')}
                    bg={sortOrder === 'desc' ? '#FE4F18' : 'white'}
                    color={sortOrder === 'desc' ? 'white' : '#151618'}
                    borderRadius="full"
                    size="md"
                    h="46px"
                    w="46px"
                    aria-label="Sort price descending"
                    _hover={{
                      bg: sortOrder === 'desc' ? '#E5461A' : '#FFF4F0',
                      transform: 'scale(1.05)',
                    }}
                    transition="all 0.2s"
                    title="High to Low"
                  >
                    <ArrowDown size={20} />
                  </IconButton>
                </HStack>
              </HStack>

              <Text color="#6B7280" fontSize="sm" ml="auto" fontFamily="'Manrope', sans-serif" fontWeight="500">
                {t('countryPage.showing')} {filteredAndSortedPlans.length} {t('countryPage.of')} {allPlans.length}
              </Text>
            </HStack>
          </Box>
        )}

        {/* Loading State */}
        {loading && (
          <Grid
            templateColumns={{
              base: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)',
            }}
            gap={6}
            justifyItems="center"
          >
            {[...Array(6)].map((_, i) => (
              <PlanCardSkeleton key={i} />
            ))}
          </Grid>
        )}

        {/* Error State */}
        {error && !loading && (
          <Box
            bg="white"
            borderRadius="24px"
            p={12}
            textAlign="center"
            boxShadow="0 4px 12px rgba(0, 0, 0, 0.06)"
          >
            <Text fontSize="xl" color="#6B7280" fontWeight="600">
              {error}
            </Text>
            <Button
              mt={6}
              onClick={() => navigate('/')}
              bg="#FE4F18"
              color="white"
              borderRadius="full"
              px={8}
              py={3}
              fontWeight="600"
              _hover={{ bg: '#E5450F' }}
            >
              {t('country.backToHome')}
            </Button>
          </Box>
        )}

        {/* Plans Grid */}
        {!loading && !error && filteredAndSortedPlans.length > 0 && (
          <Grid
            templateColumns={{
              base: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)',
            }}
            gap={3}
            columnGap={2}
            justifyItems="center"
            mb={8}
          >
            {filteredAndSortedPlans.map((plan) => (
              <DataPlanCard
                key={plan.id}
                plan={plan}
                lang={currentLanguage}
                showTitle={true}
                showLabels={true}
                onClick={() => navigate(`/package/${plan.slug}`, {
                  state: {
                    plan: plan,
                    countryCode: plan.countryCode || regionCode
                  }
                })}
              />
            ))}
          </Grid>
        )}

        {/* No Results */}
        {!loading && !error && filteredAndSortedPlans.length === 0 && allPlans.length > 0 && (
          <Box
            bg="white"
            borderRadius="24px"
            p={12}
            textAlign="center"
            boxShadow="0 4px 12px rgba(0, 0, 0, 0.06)"
          >
            <Text fontSize="xl" color="#6B7280" fontWeight="600">
              {t('country.noMatchingPlans')}
            </Text>
            <Button
              mt={6}
              onClick={() => {
                setSelectedData('all');
                setSelectedDuration('all');
                setSortOrder(null);
              }}
              bg="#FE4F18"
              color="white"
              borderRadius="full"
              px={8}
              py={3}
              fontWeight="600"
              _hover={{ bg: '#E5450F' }}
            >
              {t('country.clearFilters')}
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default RegionalPackagesPage;
