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
import { ArrowLeft, ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import DataPlanCard from '../components/DataPlanCard';
import { fetchRegionalPackages } from '../services/esimAccessApi.js';
import { getRegionName, REGION_DEFINITIONS } from '../services/packageCacheService.js';
import { calculateFinalPriceUSD } from '../config/pricing';
import { getTranslation } from '../config/i18n';
import { useLanguage } from '../contexts/LanguageContext';

const PLANS_PER_PAGE = 12;
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

// Pagination Component
const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
  const maxVisiblePages = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let end = Math.min(totalPages, start + maxVisiblePages - 1);

  if (end - start < maxVisiblePages - 1) {
    start = Math.max(1, end - maxVisiblePages + 1);
  }

  return (
    <HStack spacing={2}>
      <IconButton
        onClick={() => onPageChange(currentPage - 1)}
        isDisabled={currentPage === 1}
        bg="white"
        borderRadius="12px"
        size="md"
        aria-label="Previous"
        _hover={{
          bg: '#FFF4F0',
          transform: 'scale(1.05)',
        }}
        _disabled={{
          opacity: 0.4,
          cursor: 'not-allowed',
          _hover: {
            bg: 'white',
            transform: 'none',
          },
        }}
        transition="all 0.2s"
      >
        <ChevronLeft size={20} color="#151618" />
      </IconButton>

      {start > 1 && (
        <>
          <Button
            size="md"
            onClick={() => onPageChange(1)}
            bg="white"
            color="#6B7280"
            borderRadius="12px"
            fontWeight="600"
            minW="40px"
            _hover={{
              bg: '#FFF4F0',
              color: '#FE4F18',
            }}
            transition="all 0.2s"
          >
            1
          </Button>
          {start > 2 && (
            <Text fontSize="md" color="#6B7280" fontWeight="600">
              ...
            </Text>
          )}
        </>
      )}

      {Array.from({ length: end - start + 1 }, (_, i) => start + i).map((page) => (
        <Button
          key={page}
          size="md"
          onClick={() => onPageChange(page)}
          bg={currentPage === page ? '#2C2C2E' : 'white'}
          color={currentPage === page ? 'white' : '#6B7280'}
          borderRadius="12px"
          fontWeight="600"
          minW="40px"
          _hover={{
            bg: currentPage === page ? '#2C2C2E' : '#FFF4F0',
            color: currentPage === page ? 'white' : '#FE4F18',
            transform: 'scale(1.05)',
          }}
          transition="all 0.2s"
        >
          {page}
        </Button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && (
            <Text fontSize="md" color="#6B7280" fontWeight="600">
              ...
            </Text>
          )}
          <Button
            size="md"
            onClick={() => onPageChange(totalPages)}
            bg="white"
            color="#6B7280"
            borderRadius="12px"
            fontWeight="600"
            minW="40px"
            _hover={{
              bg: '#FFF4F0',
              color: '#FE4F18',
            }}
            transition="all 0.2s"
          >
            {totalPages}
          </Button>
        </>
      )}

      <IconButton
        onClick={() => onPageChange(currentPage + 1)}
        isDisabled={currentPage === totalPages}
        bg="white"
        borderRadius="12px"
        size="md"
        aria-label="Next"
        _hover={{
          bg: '#FFF4F0',
          transform: 'scale(1.05)',
        }}
        _disabled={{
          opacity: 0.4,
          cursor: 'not-allowed',
          _hover: {
            bg: 'white',
            transform: 'none',
          },
        }}
        transition="all 0.2s"
      >
        <ChevronRight size={20} color="#151618" />
      </IconButton>
    </HStack>
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
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState(null);

  const regionName = getRegionName(regionCode, currentLanguage);
  const regionIcon = REGION_DEFINITIONS[regionCode]?.icon || '🌍';

  // Load regional packages
  useEffect(() => {
    let isMounted = true;

    const loadPlans = async () => {
      try {
        setLoading(true);
        setError(null);

        const regionalData = await fetchRegionalPackages(currentLanguage);

        if (!isMounted) return;

        // Get packages for this specific region
        const regionData = regionalData[regionCode];

        if (!regionData || !regionData.packages || regionData.packages.length === 0) {
          setError(getTranslation(currentLanguage, 'country.noPlansAvailable'));
          setAllPlans([]);
          return;
        }

        // Transform packages to match expected format
        const packages = regionData.packages.map(pkg => ({
          id: `${pkg.packageCode}_${pkg.slug}`,
          packageCode: pkg.packageCode,
          slug: pkg.slug,
          country: regionName,
          countryCode: regionCode,
          data: pkg.volume >= 1073741824
            ? `${Math.round(pkg.volume / 1073741824)}GB`
            : `${Math.round(pkg.volume / 1048576)}MB`,
          dataGB: pkg.volume / 1073741824,
          days: pkg.duration,
          speed: pkg.speed || '4G/5G',
          priceUSD: pkg.price / 10000,
          originalPrice: pkg.price,
          description: pkg.description || pkg.name,
          name: pkg.name,
          operatorList: pkg.locationNetworkList || [],
          rawPackage: pkg
        }));

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

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedPlans.length / PLANS_PER_PAGE);
  const paginatedPlans = filteredAndSortedPlans.slice(
    (currentPage - 1) * PLANS_PER_PAGE,
    currentPage * PLANS_PER_PAGE
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedData, selectedDuration, sortOrder]);

  const toggleSort = () => {
    if (sortOrder === null) {
      setSortOrder('asc');
    } else if (sortOrder === 'asc') {
      setSortOrder('desc');
    } else {
      setSortOrder(null);
    }
  };

  return (
    <Box bg="#F9FAFB" minH="100vh" pt={32} pb={20}>
      <Container maxW="1400px">
        {/* Header */}
        <VStack align="stretch" spacing={8} mb={12}>
          <Button
            leftIcon={<ArrowLeft size={20} />}
            onClick={() => navigate('/')}
            bg="white"
            color="#2C2C2E"
            borderRadius="full"
            px={6}
            py={3}
            fontWeight="600"
            fontSize="md"
            width="fit-content"
            boxShadow="0 2px 8px rgba(0, 0, 0, 0.06)"
            _hover={{
              bg: '#FFF4F0',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            }}
            transition="all 0.2s"
          >
            {t('country.back')}
          </Button>

          <HStack spacing={4} align="center">
            <Text fontSize="6xl">{regionIcon}</Text>
            <VStack align="start" spacing={2}>
              <Heading
                fontSize={{ base: '3xl', md: '5xl' }}
                fontWeight="800"
                color="#2C2C2E"
                fontFamily="'Manrope', sans-serif"
              >
                {regionName}
              </Heading>
              <Text fontSize="lg" color="#6B7280" fontWeight="500">
                {filteredAndSortedPlans.length} {t('country.plansAvailable')}
              </Text>
            </VStack>
          </HStack>
        </VStack>

        {/* Filters */}
        {!loading && !error && allPlans.length > 0 && (
          <Box
            bg="white"
            borderRadius="24px"
            p={6}
            mb={8}
            boxShadow="0 4px 12px rgba(0, 0, 0, 0.06)"
          >
            <Grid
              templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
              gap={4}
            >
              {/* Data Filter */}
              <VStack align="stretch" spacing={2}>
                <Text fontSize="sm" fontWeight="600" color="#6B7280">
                  {t('country.dataAmount')}
                </Text>
                <Select
                  value={selectedData}
                  onChange={(e) => setSelectedData(e.target.value)}
                  bg="white"
                  borderColor="#E8E9EE"
                  borderRadius="12px"
                  fontWeight="500"
                  _hover={{ borderColor: '#FE4F18' }}
                  _focus={{ borderColor: '#FE4F18', boxShadow: '0 0 0 1px #FE4F18' }}
                >
                  <option value="all">{t('country.allData')}</option>
                  {dataOptions.map((gb) => (
                    <option key={gb} value={gb}>
                      {gb >= 1 ? `${gb}GB` : `${Math.round(gb * 1024)}MB`}
                    </option>
                  ))}
                </Select>
              </VStack>

              {/* Duration Filter */}
              <VStack align="stretch" spacing={2}>
                <Text fontSize="sm" fontWeight="600" color="#6B7280">
                  {t('country.validity')}
                </Text>
                <Select
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(e.target.value)}
                  bg="white"
                  borderColor="#E8E9EE"
                  borderRadius="12px"
                  fontWeight="500"
                  _hover={{ borderColor: '#FE4F18' }}
                  _focus={{ borderColor: '#FE4F18', boxShadow: '0 0 0 1px #FE4F18' }}
                >
                  <option value="all">{t('country.allDurations')}</option>
                  {durationOptions.map((days) => (
                    <option key={days} value={days}>
                      {days} {t('country.days')}
                    </option>
                  ))}
                </Select>
              </VStack>

              {/* Sort by Price */}
              <VStack align="stretch" spacing={2}>
                <Text fontSize="sm" fontWeight="600" color="#6B7280">
                  {t('country.sortByPrice')}
                </Text>
                <Button
                  onClick={toggleSort}
                  rightIcon={
                    sortOrder === 'asc' ? (
                      <ArrowUp size={18} />
                    ) : sortOrder === 'desc' ? (
                      <ArrowDown size={18} />
                    ) : null
                  }
                  bg={sortOrder ? '#FFF4F0' : 'white'}
                  color={sortOrder ? '#FE4F18' : '#6B7280'}
                  borderRadius="12px"
                  fontWeight="600"
                  border="1px solid"
                  borderColor={sortOrder ? '#FE4F18' : '#E8E9EE'}
                  _hover={{
                    bg: '#FFF4F0',
                    color: '#FE4F18',
                    borderColor: '#FE4F18',
                  }}
                  transition="all 0.2s"
                  height="40px"
                >
                  {sortOrder === 'asc'
                    ? t('country.lowToHigh')
                    : sortOrder === 'desc'
                    ? t('country.highToLow')
                    : t('country.sortByPrice')}
                </Button>
              </VStack>
            </Grid>
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
        {!loading && !error && paginatedPlans.length > 0 && (
          <>
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
              {paginatedPlans.map((plan) => (
                <DataPlanCard
                  key={plan.id}
                  plan={plan}
                  lang={currentLanguage}
                  onClick={() => navigate(`/package/${plan.slug}`, {
                    state: {
                      plan: plan,
                      countryCode: plan.countryCode || regionCode
                    }
                  })}
                />
              ))}
            </Grid>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box display="flex" justifyContent="center" mt={8}>
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </Box>
            )}
          </>
        )}

        {/* No Results */}
        {!loading && !error && paginatedPlans.length === 0 && allPlans.length > 0 && (
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
