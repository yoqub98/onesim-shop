// src/pages/CountryPage.jsx
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
  Badge,
  IconButton,
  Spinner,
  Select,
} from '@chakra-ui/react';
import { ArrowLeft, ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import CountryFlag from '../components/CountryFlag';
import DataPlanCard from '../components/DataPlanCard';
import { fetchAllPackagesForCountry } from '../services/esimAccessApi';
import { calculateFinalPrice, formatPrice } from '../config/pricing';
import { getCountryName, getTranslation } from '../config/i18n';
import { useLanguage } from '../contexts/LanguageContext';

const PLANS_PER_PAGE = 12;
const DEFAULT_DURATION_FILTER = 30; // Default to 30 days

// Loading Skeleton matching new DataPlanCard design
const PlanCardSkeleton = () => {
  return (
    <Box
      borderRadius="32px"
      overflow="hidden"
      bg="white"
      boxShadow="0 4px 12px rgba(0, 0, 0, 0.06)"
      p={6}
      minWidth={{ base: '280px', md: '320px' }}
      width="100%"
    >
      <VStack align="stretch" spacing={5}>
        {/* Header skeleton */}
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

        {/* Badges skeleton */}
        <HStack spacing={3}>
          <Box
            width="80px"
            height="44px"
            bg="gray.200"
            borderRadius="12px"
            sx={{
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.5 },
              },
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
          <Box
            flex={1}
            height="44px"
            bg="gray.200"
            borderRadius="12px"
            sx={{
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.5 },
              },
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
        </HStack>

        {/* Footer skeleton */}
        <Box
          height="76px"
          bg="gray.100"
          borderRadius="20px"
          sx={{
            '@keyframes pulse': {
              '0%, 100%': { opacity: 1 },
              '50%': { opacity: 0.5 },
            },
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
      </VStack>
    </Box>
  );
};

// Pagination Component - Design System Style
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisible = 5;

  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <HStack spacing={3} justify="center" mt={8} fontFamily="'Manrope', sans-serif">
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

      {pages.map((page) => (
        <Button
          key={page}
          size="md"
          onClick={() => onPageChange(page)}
          bg={currentPage === page ? '#151618' : 'white'}
          color={currentPage === page ? 'white' : '#6B7280'}
          borderRadius="12px"
          fontWeight="700"
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

// Main Country Page Component
const CountryPage = () => {
  const { countryCode } = useParams();
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();
  const t = (key) => getTranslation(currentLanguage, key);
  
  const [allPlans, setAllPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Default to 30 days filter
  const [selectedData, setSelectedData] = useState('all');
  const [selectedDuration, setSelectedDuration] = useState(DEFAULT_DURATION_FILTER.toString());
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState(null); // null | 'asc' | 'desc'
  
  const countryName = getCountryName(countryCode, currentLanguage);

  // Load plans once on mount
  useEffect(() => {
    let isMounted = true;

    const loadPlans = async () => {
      try {
        setLoading(true);
        setError(null);

        const packages = await fetchAllPackagesForCountry(countryCode, currentLanguage);
        
        if (!isMounted) return;
        
        if (packages.length === 0) {
          setError('No plans available for this country');
          setAllPlans([]);
          return;
        }

        const transformedPackages = packages.map(pkg => ({
          ...pkg,
          price: formatPrice(calculateFinalPrice(pkg.priceUSD)),
        }));

        setAllPlans(transformedPackages);
        
      } catch (err) {
        if (!isMounted) return;
        console.error('❌ Error:', err);
        setError('Failed to load plans. Please try again.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (countryCode) {
      loadPlans();
    }

    return () => {
      isMounted = false;
    };
  }, [countryCode, currentLanguage]);

  // Get unique filter options
  const dataOptions = useMemo(() => {
    return [...new Set(allPlans.map(p => p.dataGB))].sort((a, b) => a - b);
  }, [allPlans]);

  const durationOptions = useMemo(() => {
    return [...new Set(allPlans.map(p => p.days))].sort((a, b) => a - b);
  }, [allPlans]);

  // Apply filters and sorting
  const filteredPlans = useMemo(() => {
    let filtered = [...allPlans];

    if (selectedData !== 'all') {
      filtered = filtered.filter(plan => plan.dataGB === parseInt(selectedData));
    }

    if (selectedDuration !== 'all') {
      filtered = filtered.filter(plan => plan.days === parseInt(selectedDuration));
    }

    // Apply sorting by price
    if (sortOrder === 'asc') {
      filtered.sort((a, b) => (a.priceUSD || 0) - (b.priceUSD || 0));
    } else if (sortOrder === 'desc') {
      filtered.sort((a, b) => (b.priceUSD || 0) - (a.priceUSD || 0));
    }

    return filtered;
  }, [allPlans, selectedData, selectedDuration, sortOrder]);

  // Paginate
  const paginatedPlans = useMemo(() => {
    const start = (currentPage - 1) * PLANS_PER_PAGE;
    return filteredPlans.slice(start, start + PLANS_PER_PAGE);
  }, [filteredPlans, currentPage]);

  const totalPages = Math.ceil(filteredPlans.length / PLANS_PER_PAGE);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedData, selectedDuration]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Background image logic
  const getHeaderBackground = () => {
    const countryImages = {
      'tr': 'https://ik.imagekit.io/php1jcf0t/OneSim/1278.jpg', // Turkey
      'ae': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1600&q=80', // UAE - Dubai
      'th': 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1600&q=80', // Thailand - Bangkok
      'it': 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=1600&q=80', // Italy - Rome
      'fr': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600&q=80', // France - Paris
      'ge': 'https://images.unsplash.com/photo-1598609041893-84bca8e28a7f?w=1600&q=80', // Georgia - Landscape
      'vn': 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1600&q=80', // Vietnam - Ho Chi Minh
      'es': 'https://images.unsplash.com/photo-1558642084-fd07fae5282e?w=1600&q=80', // Spain - Barcelona
      'kr': 'https://images.unsplash.com/photo-1558862107-d49ef2a04d72?w=1600&q=80', // South Korea - Seoul
      'uz': 'https://images.unsplash.com/photo-1597074866923-dc0589150ad7?w=1600&q=80', // Uzbekistan - Samarkand
      'de': 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1600&q=80', // Germany - Berlin
    };

    return countryImages[countryCode?.toLowerCase()] || null; // Use gray background if no image
  };

  const headerBgImage = getHeaderBackground();

  return (
    <Box minH="100vh" bg="white">
      {/* Hero Header with Background Image */}
      <Box
        position="relative"
        minH="400px"
        overflow="hidden"
        backgroundImage={headerBgImage ? `url(${headerBgImage})` : 'none'}
        backgroundSize="cover"
        backgroundPosition="center"
        backgroundColor={headerBgImage ? 'gray.900' : 'gray.200'}
      >
        {/* Dark Overlay */}
        {headerBgImage && (
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="blackAlpha.700"
            zIndex={1}
          />
        )}

        <Container maxW="8xl" position="relative" zIndex={2} h="100%">
          <VStack align="flex-start" justify="space-between" minH="400px" py={8} spacing={6}>
            {/* Back Navigation */}
            <Button
              variant="ghost"
              size="md"
              onClick={() => navigate('/')}
              fontWeight="700"
              color={headerBgImage ? 'white' : 'gray.800'}
              _hover={{
                bg: headerBgImage ? 'whiteAlpha.200' : 'gray.300',
              }}
              transition="all 0.3s"
            >
              <HStack spacing={2}>
                <ArrowLeft size={20} />
                <Text>{t('countryPage.back')}</Text>
              </HStack>
            </Button>

            {/* Main Content */}
            <VStack align="flex-start" spacing={6} w="100%">
              {/* Flag Above Title */}
              <Box
                borderRadius="xl"
                overflow="hidden"
                boxShadow="0 8px 25px rgba(0,0,0,0.4)"
                width={{ base: '80px', md: '96px' }}
                height={{ base: '60px', md: '72px' }}
                flexShrink={0}
                border="3px solid"
                borderColor="white"
                bg="white"
              >
                <CountryFlag
                  code={countryCode}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>

              {/* Text Content */}
              <VStack align="flex-start" spacing={5} flex={1} maxW="700px">
                <Heading
                  fontSize={{ base: '5xl', md: '6xl' }}
                  fontWeight="900"
                  color={headerBgImage ? 'white' : 'gray.800'}
                  lineHeight="1.2"
                  textShadow={headerBgImage ? '0 2px 10px rgba(0,0,0,0.3)' : 'none'}
                >
                  {t('countryPage.banner.title')} {countryName}
                </Heading>

                <Text
                  fontSize={{ base: 'md', md: 'lg' }}
                  color={headerBgImage ? 'whiteAlpha.900' : 'gray.600'}
                  fontWeight="500"
                  lineHeight="1.6"
                  textShadow={headerBgImage ? '0 1px 5px rgba(0,0,0,0.3)' : 'none'}
                >
                  {t('countryPage.banner.description')}
                </Text>

                <Badge
                  colorScheme={headerBgImage ? 'whiteAlpha' : 'purple'}
                  fontSize="md"
                  px={4}
                  py={2}
                  borderRadius="full"
                  bg={headerBgImage ? 'whiteAlpha.300' : 'purple.100'}
                  color={headerBgImage ? 'white' : 'purple.800'}
                  fontWeight="700"
                  backdropFilter={headerBgImage ? 'blur(10px)' : 'none'}
                >
                  {loading ? (
                    <HStack spacing={2}>
                      <Spinner size="sm" />
                      <Text>Загрузка...</Text>
                    </HStack>
                  ) : (
                    `${filteredPlans.length} ${filteredPlans.length === 1 ? 'план' : 'планов'} доступно`
                  )}
                </Badge>
              </VStack>
            </VStack>
          </VStack>
        </Container>
      </Box>

      {/* Filters */}
      <Box
        bg="#E8E9EE"
        py={6}
        borderBottom="1px solid"
        borderColor="gray.200"
      >
        <Container maxW="8xl">
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
                cursor={loading ? 'not-allowed' : 'pointer'}
                opacity={loading ? 0.6 : 1}
                _hover={{
                  borderColor: '#FE4F18',
                }}
                _focus={{
                  borderColor: '#FE4F18',
                  boxShadow: '0 0 0 1px #FE4F18',
                }}
              >
                <option value="all">{t('countryPage.allDataOptions')}</option>
                {dataOptions.map(gb => (
                  <option key={gb} value={gb}>
                    {gb}GB
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
                cursor={loading ? 'not-allowed' : 'pointer'}
                opacity={loading ? 0.6 : 1}
                _hover={{
                  borderColor: '#FE4F18',
                }}
                _focus={{
                  borderColor: '#FE4F18',
                  boxShadow: '0 0 0 1px #FE4F18',
                }}
              >
                <option value="all">{t('countryPage.allDurationOptions')}</option>
                {durationOptions.map(days => (
                  <option key={days} value={days}>
                    {days} {t('countryPage.banner.days')}
                  </option>
                ))}
              </Select>
            </Box>

            {/* Sort by Price Buttons */}
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
                title="Sort by price: Low to High"
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
                title="Sort by price: High to Low"
              >
                <ArrowDown size={20} />
              </IconButton>
            </HStack>

            {!loading && (
              <Text color="#6B7280" fontSize="sm" ml="auto" fontFamily="'Manrope', sans-serif" fontWeight="500">
                {t('countryPage.showing')} {paginatedPlans.length} {t('countryPage.of')} {filteredPlans.length}
              </Text>
            )}
          </HStack>
        </Container>
      </Box>

      {/* Plans Grid */}
      <Box py={12} bg="#E8E9EE">
        <Container maxW="8xl">
          {error && (
            <Box p={4} bg="red.50" borderRadius="lg" border="1px solid" borderColor="red.200" mb={6}>
              <Text color="red.600" textAlign="center" fontWeight="600">
                {error}
              </Text>
            </Box>
          )}

          {loading ? (
            <Grid
              templateColumns={{ 
                base: '1fr', 
                md: 'repeat(2, 1fr)', 
                lg: 'repeat(3, 1fr)',
                xl: 'repeat(4, 1fr)' 
              }}
              gap={4}
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <PlanCardSkeleton key={i} />
              ))}
            </Grid>
          ) : paginatedPlans.length > 0 ? (
            <>
              <Grid
                templateColumns={{
                  base: '1fr',
                  md: 'repeat(2, 1fr)',
                  lg: 'repeat(3, 1fr)',
                  xl: 'repeat(4, 1fr)'
                }}
                gap={6}
              >
                {paginatedPlans.map((plan) => (
                  <DataPlanCard
                    key={plan.id}
                    plan={plan}
                    lang={currentLanguage}
                    onClick={() => navigate(`/package/${plan.id}`, { state: { plan, countryCode } })}
                  />
                ))}
              </Grid>

              {totalPages > 1 && (
                <Pagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          ) : (
            <Box textAlign="center" py={12}>
              <VStack spacing={3}>
                <Heading size="md" color="gray.700">
                  {t('countryPage.noPlans')}
                </Heading>
                <Text color="gray.500">
                  {t('countryPage.noPlansDescription')}
                </Text>
                <Button
                  mt={2}
                  size="sm"
                  onClick={() => {
                    setSelectedData('all');
                    setSelectedDuration('all');
                  }}
                  colorScheme="purple"
                  variant="outline"
                >
                  {t('countryPage.resetFilters')}
                </Button>
              </VStack>
            </Box>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default CountryPage;