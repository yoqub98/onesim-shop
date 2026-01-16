// src/pages/PlansPage.jsx - High-performance Plans page with advanced filtering
import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  HStack,
  VStack,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
  useToast,
  Flex,
  Card,
  CardBody,
  Stack,
  Divider,
} from '@chakra-ui/react';
import { Search, RotateCcw, Package, Globe, Calendar, ChevronDown, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CountryFlag from '../components/CountryFlag';
import { fetchHandpickedPackages } from '../services/esimAccessApi';
import { HANDPICKED_PLAN_SLUGS, POPULAR_DESTINATIONS, calculateFinalPrice, formatPrice } from '../config/pricing';
import { getTranslation, getCountryName } from '../config/i18n';
import { useLanguage } from '../contexts/LanguageContext';

// Package cache - stores fetched packages by country code
const packageCache = new Map();

// Duration options for dropdown
const DURATION_OPTIONS = [1, 7, 10, 15, 30, 180];

const PlansPage = () => {
  const { currentLanguage } = useLanguage();
  const t = (key) => getTranslation(currentLanguage, key);
  const navigate = useNavigate();
  const toast = useToast();

  // Filter state
  const [filters, setFilters] = useState({
    country: '',
    minDuration: '',
    minDataVolume: '',
    minPrice: '',
    maxPrice: '',
  });

  // Data state
  const [packages, setPackages] = useState([]);
  const [displayedPackages, setDisplayedPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);

  // Load popular packages on mount (cached from landing page)
  const loadPopularPackages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if already cached
      const cacheKey = 'popular';
      if (packageCache.has(cacheKey)) {
        const cached = packageCache.get(cacheKey);
        setPackages(cached);
        setDisplayedPackages(cached);
        setInitialLoad(false);
        setLoading(false);
        return;
      }

      // Fetch the same 5 popular packages shown on landing page
      const popularPackages = await fetchHandpickedPackages(HANDPICKED_PLAN_SLUGS, currentLanguage);

      // Cache them
      packageCache.set(cacheKey, popularPackages);
      setPackages(popularPackages);
      setDisplayedPackages(popularPackages);
      setInitialLoad(false);
    } catch (err) {
      console.error('❌ [PLANS] Failed to load popular packages:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentLanguage]);

  useEffect(() => {
    loadPopularPackages();
  }, [loadPopularPackages]);

  // Fetch packages for selected country
  const fetchPackagesByCountry = async (countryCode) => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      if (packageCache.has(countryCode)) {
        console.log('📦 [PLANS] Using cached packages for:', countryCode);
        setPackages(packageCache.get(countryCode));
        setLoading(false);
        return;
      }

      console.log('🔍 [PLANS] Fetching packages for country:', countryCode);

      // Fetch from API
      const response = await fetch('/api/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationCode: countryCode }),
      });

      const data = await response.json();

      if (!data.success || !data.obj?.packageList) {
        throw new Error('Failed to fetch packages');
      }

      const fetchedPackages = data.obj.packageList.map(pkg => {
        const priceUSD = pkg.price / 10000; // Price from API is in cents * 100
        const volumeInGB = pkg.volume / (1024 * 1024 * 1024);

        return {
          id: pkg.slug,
          packageCode: pkg.packageCode,
          name: pkg.name,
          countryCode: pkg.locationCode,
          slug: pkg.slug,
          volume: pkg.volume, // in bytes (for filtering)
          dataGB: volumeInGB, // in GB (for filtering)
          days: pkg.duration, // Match popular packages structure
          duration: pkg.duration, // Keep for compatibility
          priceUSD: priceUSD, // Match popular packages structure (capital USD)
          priceUsd: priceUSD, // Keep lowercase for compatibility
          priceUzs: calculateFinalPrice(priceUSD),
          network: pkg.networkType,
        };
      });

      // Cache the results
      packageCache.set(countryCode, fetchedPackages);
      setPackages(fetchedPackages);
    } catch (err) {
      console.error('❌ [PLANS] Error fetching packages:', err);
      setError(err.message);
      toast({
        title: t('plansPage.error'),
        description: err.message,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Apply client-side filters
  const applyFilters = useCallback(() => {
    let filtered = [...packages];

    // Filter by minimum duration
    if (filters.minDuration) {
      const minDays = parseInt(filters.minDuration);
      filtered = filtered.filter(pkg => (pkg.days || pkg.duration) >= minDays);
    }

    // Filter by minimum data volume (use dataGB field)
    if (filters.minDataVolume) {
      const minGB = parseFloat(filters.minDataVolume);
      filtered = filtered.filter(pkg => {
        const volumeGB = pkg.dataGB || (pkg.volume / (1024 * 1024 * 1024));
        return volumeGB >= minGB;
      });
    }

    // Filter by price range (use priceUSD field)
    if (filters.minPrice) {
      const minPrice = parseFloat(filters.minPrice);
      filtered = filtered.filter(pkg => (pkg.priceUSD || pkg.priceUsd) >= minPrice);
    }
    if (filters.maxPrice) {
      const maxPrice = parseFloat(filters.maxPrice);
      filtered = filtered.filter(pkg => (pkg.priceUSD || pkg.priceUsd) <= maxPrice);
    }

    setDisplayedPackages(filtered);
  }, [packages, filters]);

  // Apply filters whenever packages or filters change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Handle search button click
  const handleSearch = () => {
    if (!filters.country) {
      toast({
        title: t('plansPage.results.selectCountry'),
        description: t('plansPage.results.selectCountryDescription'),
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setInitialLoad(false);
    fetchPackagesByCountry(filters.country);
  };

  // Reset filters
  const handleReset = () => {
    setFilters({
      country: '',
      minDuration: '',
      minDataVolume: '',
      minPrice: '',
      maxPrice: '',
    });
    loadPopularPackages();
    setInitialLoad(true);
  };

  // Navigate to package page
  const handleBuyClick = (pkg) => {
    navigate(`/package/${pkg.id}`, {
      state: { plan: pkg, countryCode: pkg.countryCode }
    });
  };

  // Get data volume in GB for display
  const getDataVolumeGB = (pkg) => {
    // Use dataGB if available, otherwise calculate from volume
    const gb = pkg.dataGB || (pkg.volume / (1024 * 1024 * 1024));
    return gb % 1 === 0 ? gb.toFixed(0) : gb.toFixed(2);
  };

  // Get duration in days
  const getDays = (pkg) => {
    return pkg.days || pkg.duration || 0;
  };

  // Get price in USD
  const getPriceUSD = (pkg) => {
    return pkg.priceUSD || pkg.priceUsd || 0;
  };

  return (
    <Box minHeight="100vh" bg="gray.50" pt={24} pb={16}>
      <Container maxW="7xl">
        {/* Header */}
        <VStack spacing={4} align="center" mb={10}>
          <Badge
            colorScheme="purple"
            fontSize="sm"
            px={3}
            py={1}
            borderRadius="full"
            textTransform="uppercase"
          >
            {t('plansPage.title')}
          </Badge>
          <Heading
            as="h1"
            size="2xl"
            textAlign="center"
            bgGradient="linear(to-r, purple.600, pink.500)"
            bgClip="text"
          >
            {t('plansPage.title')}
          </Heading>
          <Text fontSize="lg" color="gray.600" textAlign="center" maxW="2xl">
            {t('plansPage.subtitle')}
          </Text>
        </VStack>

        {/* Filter Panel */}
        <Card mb={8} shadow="lg">
          <CardBody>
            <Stack spacing={6}>
              <Heading size="md" color="gray.700">
                {t('plansPage.filters.title')}
              </Heading>
              <Divider />

              {/* Filter Inputs */}
              <Stack spacing={4}>
                {/* Country Filter with Globe Icon */}
                <Box>
                  <Text fontWeight="semibold" mb={2} color="gray.800" fontSize="md">
                    {t('plansPage.filters.country')}
                  </Text>
                  <InputGroup size="lg">
                    <InputLeftElement pointerEvents="none" height="100%">
                      <Globe size={20} color="#9333ea" />
                    </InputLeftElement>
                    <Select
                      placeholder={t('plansPage.filters.countryPlaceholder')}
                      value={filters.country}
                      onChange={(e) => setFilters({ ...filters, country: e.target.value })}
                      size="lg"
                      icon={<ChevronDown size={20} />}
                      pl={10}
                      fontSize="sm"
                      _placeholder={{ color: 'gray.400', fontSize: 'sm' }}
                    >
                      {POPULAR_DESTINATIONS.map((dest) => (
                        <option key={dest.code} value={dest.code}>
                          {getCountryName(dest.code, currentLanguage)}
                        </option>
                      ))}
                    </Select>
                  </InputGroup>
                </Box>

                {/* Duration and Data Volume */}
                <HStack spacing={4} align="flex-start">
                  <Box flex={1}>
                    <Text fontWeight="semibold" mb={2} color="gray.800" fontSize="md">
                      {t('plansPage.filters.duration')}
                    </Text>
                    <InputGroup size="lg">
                      <InputLeftElement pointerEvents="none" height="100%">
                        <Calendar size={20} color="#10b981" />
                      </InputLeftElement>
                      <Select
                        placeholder={t('plansPage.filters.durationPlaceholder')}
                        value={filters.minDuration}
                        onChange={(e) => setFilters({ ...filters, minDuration: e.target.value })}
                        size="lg"
                        icon={<ChevronDown size={20} />}
                        pl={10}
                        fontSize="sm"
                        _placeholder={{ color: 'gray.400', fontSize: 'sm' }}
                      >
                        {DURATION_OPTIONS.map((days) => (
                          <option key={days} value={days}>
                            {days} {t('packagePage.details.days')}
                          </option>
                        ))}
                      </Select>
                    </InputGroup>
                  </Box>
                  <Box flex={1}>
                    <Text fontWeight="semibold" mb={2} color="gray.800" fontSize="md">
                      {t('plansPage.filters.dataVolume')}
                    </Text>
                    <NumberInput
                      value={filters.minDataVolume}
                      onChange={(value) => setFilters({ ...filters, minDataVolume: value })}
                      size="lg"
                      min={0.1}
                      step={0.5}
                      precision={1}
                    >
                      <NumberInputField
                        placeholder={t('plansPage.filters.dataPlaceholder')}
                        fontSize="sm"
                        _placeholder={{ color: 'gray.400', fontSize: 'sm' }}
                      />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </Box>
                </HStack>

                {/* Price Range */}
                <Box>
                  <Text fontWeight="semibold" mb={2} color="gray.800" fontSize="md">
                    {t('plansPage.filters.priceRange')} (USD)
                  </Text>
                  <HStack spacing={3} maxW="600px">
                    <NumberInput
                      value={filters.minPrice}
                      onChange={(value) => setFilters({ ...filters, minPrice: value })}
                      size="lg"
                      min={0}
                      step={1}
                      precision={1}
                      flex={1}
                    >
                      <NumberInputField
                        placeholder={t('plansPage.filters.minPrice')}
                        fontSize="sm"
                        _placeholder={{ color: 'gray.400', fontSize: 'sm' }}
                      />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <Text color="gray.400" fontSize="lg" fontWeight="bold">—</Text>
                    <NumberInput
                      value={filters.maxPrice}
                      onChange={(value) => setFilters({ ...filters, maxPrice: value })}
                      size="lg"
                      min={0}
                      step={1}
                      precision={1}
                      flex={1}
                    >
                      <NumberInputField
                        placeholder={t('plansPage.filters.maxPrice')}
                        fontSize="sm"
                        _placeholder={{ color: 'gray.400', fontSize: 'sm' }}
                      />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </HStack>
                </Box>
              </Stack>

              {/* Action Buttons */}
              <HStack spacing={4}>
                <Button
                  leftIcon={<Search size={18} />}
                  colorScheme="blue"
                  size="lg"
                  onClick={handleSearch}
                  isLoading={loading}
                  flex={1}
                  bgGradient="linear(to-r, blue.400, blue.600)"
                  _hover={{
                    bgGradient: "linear(to-r, blue.500, blue.700)",
                  }}
                >
                  {t('plansPage.filters.searchButton')}
                </Button>
                <Button
                  leftIcon={<RotateCcw size={18} />}
                  variant="outline"
                  size="lg"
                  onClick={handleReset}
                >
                  {t('plansPage.filters.resetButton')}
                </Button>
              </HStack>
            </Stack>
          </CardBody>
        </Card>

        {/* Results Section */}
        {loading ? (
          <Flex justify="center" align="center" minH="300px">
            <VStack spacing={4}>
              <Spinner size="xl" color="purple.500" thickness="4px" />
              <Text color="gray.600">{t('plansPage.loading')}</Text>
            </VStack>
          </Flex>
        ) : error ? (
          <Alert status="error" borderRadius="lg">
            <AlertIcon />
            <Box flex={1}>
              <AlertTitle>{t('plansPage.error')}</AlertTitle>
              <AlertDescription>{t('plansPage.errorDescription')}</AlertDescription>
            </Box>
          </Alert>
        ) : displayedPackages.length === 0 ? (
          <Card>
            <CardBody>
              <VStack spacing={4} py={8}>
                <Package size={64} color="gray.400" />
                <Heading size="md" color="gray.600">
                  {initialLoad
                    ? t('plansPage.results.selectCountry')
                    : t('plansPage.results.noResults')}
                </Heading>
                <Text color="gray.500" textAlign="center">
                  {initialLoad
                    ? t('plansPage.results.selectCountryDescription')
                    : t('plansPage.results.noResultsDescription')}
                </Text>
              </VStack>
            </CardBody>
          </Card>
        ) : (
          <>
            {/* Results Count */}
            <Flex justify="space-between" align="center" mb={4}>
              <Text color="gray.600">
                {t('plansPage.results.showing')} <strong>{displayedPackages.length}</strong> {t('plansPage.results.of')} <strong>{packages.length}</strong> {t('plansPage.results.packages')}
              </Text>
            </Flex>

            {/* Results Table */}
            <Card shadow="lg" overflow="hidden">
              <TableContainer>
                <Table variant="simple" size="md">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th>{t('plansPage.table.country')}</Th>
                      <Th>{t('plansPage.table.packageName')}</Th>
                      <Th isNumeric>{t('plansPage.table.data')}</Th>
                      <Th isNumeric>{t('plansPage.table.duration')}</Th>
                      <Th isNumeric>{t('plansPage.table.price')}</Th>
                      <Th>{t('plansPage.table.action')}</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {displayedPackages.map((pkg, index) => (
                      <Tr
                        key={`${pkg.id}-${index}`}
                        _hover={{ bg: 'purple.50' }}
                        transition="all 0.2s"
                      >
                        <Td>
                          <HStack spacing={3}>
                            <Box
                              width="40px"
                              height="30px"
                              borderRadius="md"
                              overflow="hidden"
                              border="1px solid"
                              borderColor="gray.200"
                              flexShrink={0}
                            >
                              <CountryFlag
                                code={pkg.countryCode}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            </Box>
                            <Text fontWeight="medium">
                              {getCountryName(pkg.countryCode, currentLanguage)}
                            </Text>
                          </HStack>
                        </Td>
                        <Td>
                          <Text noOfLines={1}>{pkg.name}</Text>
                        </Td>
                        <Td isNumeric>
                          <Badge colorScheme="blue" fontSize="sm">
                            {getDataVolumeGB(pkg)} GB
                          </Badge>
                        </Td>
                        <Td isNumeric>
                          <Badge colorScheme="green" fontSize="sm">
                            {getDays(pkg)} {t('packagePage.details.days')}
                          </Badge>
                        </Td>
                        <Td isNumeric>
                          <Text fontWeight="bold" color="purple.600" fontSize="lg">
                            {formatPrice(pkg.priceUzs || calculateFinalPrice(getPriceUSD(pkg)))} UZS
                          </Text>
                        </Td>
                        <Td>
                          <Button
                            size="sm"
                            colorScheme="purple"
                            onClick={() => handleBuyClick(pkg)}
                          >
                            {t('plansPage.table.buy')}
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            </Card>
          </>
        )}
      </Container>
    </Box>
  );
};

export default PlansPage;
