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
import { Search, RotateCcw, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Flag from 'react-world-flags';
import { fetchHandpickedPackages } from '../services/esimAccessApi';
import { HANDPICKED_PLAN_SLUGS, calculateFinalPrice, formatPrice } from '../config/pricing';
import { getTranslation, getCountryName, COUNTRY_TRANSLATIONS } from '../config/i18n';
import { useLanguage } from '../contexts/LanguageContext';

// Package cache - stores fetched packages by country code
const packageCache = new Map();

// Supported countries list (from your existing translations)
const SUPPORTED_COUNTRIES = Object.keys(COUNTRY_TRANSLATIONS.ru);

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
  useEffect(() => {
    loadPopularPackages();
  }, []);

  const loadPopularPackages = async () => {
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
  };

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

      const fetchedPackages = data.obj.packageList.map(pkg => ({
        id: pkg.slug,
        packageCode: pkg.packageCode,
        name: pkg.name,
        countryCode: pkg.locationCode,
        slug: pkg.slug,
        volume: pkg.volume, // in bytes
        duration: pkg.duration,
        priceUsd: pkg.price / 10000, // Price from API is in cents * 100
        priceUzs: calculateFinalPrice(pkg.price / 10000),
        network: pkg.networkType,
      }));

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
      filtered = filtered.filter(pkg => pkg.duration >= minDays);
    }

    // Filter by minimum data volume (convert bytes to GB)
    if (filters.minDataVolume) {
      const minGB = parseFloat(filters.minDataVolume);
      filtered = filtered.filter(pkg => {
        const volumeGB = pkg.volume / (1024 * 1024 * 1024);
        return volumeGB >= minGB;
      });
    }

    // Filter by price range
    if (filters.minPrice) {
      const minPrice = parseFloat(filters.minPrice);
      filtered = filtered.filter(pkg => pkg.priceUsd >= minPrice);
    }
    if (filters.maxPrice) {
      const maxPrice = parseFloat(filters.maxPrice);
      filtered = filtered.filter(pkg => pkg.priceUsd <= maxPrice);
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

  // Convert bytes to GB for display
  const bytesToGB = (bytes) => {
    const gb = bytes / (1024 * 1024 * 1024);
    return gb % 1 === 0 ? gb.toFixed(0) : gb.toFixed(2);
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
                {/* Country Filter */}
                <Box>
                  <Text fontWeight="medium" mb={2} color="gray.700">
                    {t('plansPage.filters.country')}
                  </Text>
                  <Select
                    placeholder={t('plansPage.filters.countryPlaceholder')}
                    value={filters.country}
                    onChange={(e) => setFilters({ ...filters, country: e.target.value })}
                    size="lg"
                  >
                    {SUPPORTED_COUNTRIES.sort().map((code) => (
                      <option key={code} value={code}>
                        {getCountryName(code, currentLanguage)}
                      </option>
                    ))}
                  </Select>
                </Box>

                {/* Duration and Data Volume */}
                <HStack spacing={4} align="flex-start">
                  <Box flex={1}>
                    <Text fontWeight="medium" mb={2} color="gray.700">
                      {t('plansPage.filters.duration')}
                    </Text>
                    <Input
                      type="number"
                      placeholder={t('plansPage.filters.durationPlaceholder')}
                      value={filters.minDuration}
                      onChange={(e) => setFilters({ ...filters, minDuration: e.target.value })}
                      size="lg"
                      min={1}
                    />
                  </Box>
                  <Box flex={1}>
                    <Text fontWeight="medium" mb={2} color="gray.700">
                      {t('plansPage.filters.dataVolume')}
                    </Text>
                    <Input
                      type="number"
                      placeholder={t('plansPage.filters.dataPlaceholder')}
                      value={filters.minDataVolume}
                      onChange={(e) => setFilters({ ...filters, minDataVolume: e.target.value })}
                      size="lg"
                      min={0.1}
                      step={0.1}
                    />
                  </Box>
                </HStack>

                {/* Price Range */}
                <Box>
                  <Text fontWeight="medium" mb={2} color="gray.700">
                    {t('plansPage.filters.priceRange')}
                  </Text>
                  <HStack spacing={4}>
                    <Input
                      type="number"
                      placeholder={t('plansPage.filters.minPrice')}
                      value={filters.minPrice}
                      onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                      size="lg"
                      min={0}
                      step={0.1}
                    />
                    <Text color="gray.500">—</Text>
                    <Input
                      type="number"
                      placeholder={t('plansPage.filters.maxPrice')}
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                      size="lg"
                      min={0}
                      step={0.1}
                    />
                  </HStack>
                </Box>
              </Stack>

              {/* Action Buttons */}
              <HStack spacing={4}>
                <Button
                  leftIcon={<Search size={18} />}
                  colorScheme="purple"
                  size="lg"
                  onClick={handleSearch}
                  isLoading={loading}
                  flex={1}
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
                              <Flag
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
                            {bytesToGB(pkg.volume)} GB
                          </Badge>
                        </Td>
                        <Td isNumeric>
                          <Badge colorScheme="green" fontSize="sm">
                            {pkg.duration} {t('countryPage.filters.days')}
                          </Badge>
                        </Td>
                        <Td isNumeric>
                          <VStack spacing={0} align="flex-end">
                            <Text fontWeight="bold" color="purple.600">
                              ${pkg.priceUsd.toFixed(2)}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {formatPrice(pkg.priceUzs)} UZS
                            </Text>
                          </VStack>
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
