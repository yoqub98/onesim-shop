// src/pages/PlansPage.jsx - Refreshed UI with advanced search and filtering
import { useState, useEffect, useCallback, useMemo } from 'react';
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
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  Switch,
  FormControl,
  FormLabel,
  List,
  ListItem,
  useOutsideClick,
} from '@chakra-ui/react';
import { MagnifyingGlassIcon, ArrowPathIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';
import CountryFlag from '../components/CountryFlag';
import { fetchHandpickedPackages } from '../services/esimAccessApi';
import { HANDPICKED_PLAN_SLUGS, calculateFinalPrice, calculateFinalPriceUSD, formatPrice } from '../config/pricing';
import { getTranslation, getCountryName, getCountrySearchNames, COUNTRY_TRANSLATIONS } from '../config/i18n';
import { useLanguage } from '../contexts/LanguageContext';

// Package cache - stores fetched packages by country code
const packageCache = new Map();

const PlansPage = () => {
  const { currentLanguage } = useLanguage();
  const t = (key) => getTranslation(currentLanguage, key);
  const navigate = useNavigate();
  const toast = useToast();
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  // Filter state
  const [filters, setFilters] = useState({
    country: '',
    countrySearch: '',
    dataVolume: '',
    isUnlimited: false,
    priceRange: [0, 100],
  });

  // UI state
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [packages, setPackages] = useState([]);
  const [displayedPackages, setDisplayedPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);

  // Close dropdown when clicking outside
  useOutsideClick({
    ref: dropdownRef,
    handler: () => setShowCountryDropdown(false),
  });

  // Get all available countries
  const allCountries = useMemo(() => {
    const countries = COUNTRY_TRANSLATIONS[currentLanguage] || {};
    return Object.entries(countries)
      .filter(([code]) => code.length === 2) // Only country codes, exclude regions
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [currentLanguage]);

  // Filter countries based on search (searches in both translated and English names)
  const filteredCountries = useMemo(() => {
    if (!filters.countrySearch) return allCountries;

    const search = filters.countrySearch.toLowerCase();
    return allCountries.filter(country => {
      // Get all search names (translated + English + code)
      const searchNames = getCountrySearchNames(country.code, currentLanguage);

      // Check if any of the names match the search query
      return searchNames.some(name =>
        name.toLowerCase().includes(search)
      );
    });
  }, [allCountries, filters.countrySearch, currentLanguage]);

  // Highlight matching text
  const highlightText = (text, search) => {
    if (!search) return text;

    const index = text.toLowerCase().indexOf(search.toLowerCase());
    if (index === -1) return text;

    const before = text.substring(0, index);
    const match = text.substring(index, index + search.length);
    const after = text.substring(index + search.length);

    return (
      <>
        {before}
        <Text as="span" bg="#FFF4F0" color="#FE4F18" fontWeight="700">
          {match}
        </Text>
        {after}
      </>
    );
  };

  // Handle country selection
  const handleCountrySelect = (countryCode, countryName) => {
    setFilters(prev => ({
      ...prev,
      country: countryCode,
      countrySearch: countryName
    }));
    setShowCountryDropdown(false);
  };

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
        const rawPriceUSD = pkg.price / 10000; // Price from API is in cents * 100
        const finalPriceUSD = calculateFinalPriceUSD(rawPriceUSD); // Apply margin
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
          originalPriceUSD: rawPriceUSD, // Keep ORIGINAL price without margin
          priceUSD: finalPriceUSD, // USD with margin applied for DISPLAY
          priceUsd: finalPriceUSD, // Keep lowercase for compatibility
          priceUzs: calculateFinalPrice(rawPriceUSD),
          network: pkg.networkType,
          dataType: pkg.dataType, // 1=Total, 2=Daily Limit (Speed Reduced), 3=Daily Limit (Cut-off), 4=Daily Unlimited
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

    // Filter by data volume
    if (filters.dataVolume && !filters.isUnlimited) {
      const targetGB = parseFloat(filters.dataVolume);
      filtered = filtered.filter(pkg => {
        const volumeGB = pkg.dataGB || (pkg.volume / (1024 * 1024 * 1024));
        return volumeGB >= targetGB;
      });
    }

    // Filter by unlimited (if enabled, only show unlimited packages)
    // dataType = 4 means "Daily Unlimited" from eSIM Access API
    if (filters.isUnlimited) {
      filtered = filtered.filter(pkg => pkg.dataType === 4);
    }

    // Filter by price range (use priceUSD field)
    const [minPrice, maxPrice] = filters.priceRange;
    filtered = filtered.filter(pkg => {
      const price = pkg.priceUSD || pkg.priceUsd;
      return price >= minPrice && price <= maxPrice;
    });

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
      countrySearch: '',
      dataVolume: '',
      isUnlimited: false,
      priceRange: [0, 100],
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
    <Box minHeight="100vh" bg="#E8E9EE" pt={24} pb={16} fontFamily="'Manrope', sans-serif">
      <Container maxW="7xl">
        {/* Header */}
        <VStack spacing={4} align="center" mb={10}>
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
            {t('plansPage.title')}
          </Badge>
          <Heading
            as="h1"
            fontSize={{ base: '4xl', md: '5xl' }}
            fontWeight="800"
            textAlign="center"
            color="#000"
            letterSpacing="tight"
          >
            {t('plansPage.title')}
          </Heading>
          <Text fontSize="lg" color="#494951" textAlign="center" maxW="2xl" fontWeight="500">
            {t('plansPage.subtitle')}
          </Text>
        </VStack>

        {/* Filter Panel */}
        <Card mb={8} borderRadius="32px" overflow="hidden" boxShadow="0 4px 12px rgba(0, 0, 0, 0.06)">
          <CardBody p={8}>
            <Stack spacing={6}>
              <Heading size="md" color="#000" fontWeight="700">
                {t('plansPage.filters.title')}
              </Heading>
              <Divider borderColor="#E8E9EE" />

              {/* Filter Inputs */}
              <Stack spacing={6}>
                {/* Country Search with Autocomplete */}
                <Box position="relative" ref={searchRef}>
                  <Text fontWeight="600" mb={2} color="#000" fontSize="15px">
                    {t('plansPage.filters.country')}
                  </Text>
                  <InputGroup size="lg">
                    <InputLeftElement pointerEvents="none" height="100%">
                      <Box as={GlobeAltIcon} w="20px" h="20px" color="#FE4F18" />
                    </InputLeftElement>
                    <Input
                      placeholder={t('plansPage.filters.countryPlaceholder')}
                      value={filters.countrySearch}
                      onChange={(e) => {
                        setFilters({ ...filters, countrySearch: e.target.value, country: '' });
                        setShowCountryDropdown(true);
                      }}
                      onFocus={() => setShowCountryDropdown(true)}
                      size="lg"
                      pl={12}
                      borderRadius="16px"
                      border="2px solid"
                      borderColor="#E8E9EE"
                      _hover={{ borderColor: "#FE4F18" }}
                      _focus={{ borderColor: "#FE4F18", boxShadow: "0 0 0 1px #FE4F18" }}
                      bg="white"
                    />
                  </InputGroup>

                  {/* Autocomplete Dropdown */}
                  {showCountryDropdown && filteredCountries.length > 0 && (
                    <Box
                      ref={dropdownRef}
                      position="absolute"
                      top="100%"
                      left={0}
                      right={0}
                      mt={2}
                      bg="white"
                      borderRadius="20px"
                      boxShadow="0 8px 24px rgba(0, 0, 0, 0.12)"
                      maxH="300px"
                      overflowY="auto"
                      zIndex={1000}
                      border="1px solid"
                      borderColor="#E8E9EE"
                      css={{
                        '&::-webkit-scrollbar': {
                          width: '8px',
                        },
                        '&::-webkit-scrollbar-track': {
                          background: '#F2F2F7',
                          borderRadius: '10px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                          background: '#FE4F18',
                          borderRadius: '10px',
                        },
                      }}
                    >
                        <List spacing={0}>
                          {filteredCountries.map((country) => (
                            <ListItem
                              key={country.code}
                              onClick={() => handleCountrySelect(country.code, country.name)}
                              cursor="pointer"
                              px={4}
                              py={3}
                              _hover={{ bg: '#FFF4F0' }}
                              transition="all 0.2s"
                            >
                              <HStack spacing={3}>
                                <Box
                                  width="32px"
                                  height="24px"
                                  borderRadius="6px"
                                  overflow="hidden"
                                  border="1px solid"
                                  borderColor="#E8E9EE"
                                  flexShrink={0}
                                >
                                  <CountryFlag
                                    code={country.code}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  />
                                </Box>
                                <Text fontWeight="500" color="#000">
                                  {highlightText(country.name, filters.countrySearch)}
                                </Text>
                              </HStack>
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                  )}
                </Box>

                {/* Data Volume & Unlimited Toggle */}
                <HStack spacing={4} align="flex-start">
                  <Box flex={1}>
                    <Text fontWeight="600" mb={2} color="#000" fontSize="15px">
                      {t('plansPage.filters.dataVolume')}
                    </Text>
                    <Select
                      placeholder={t('plansPage.filters.dataPlaceholder')}
                      value={filters.dataVolume}
                      onChange={(e) => setFilters({ ...filters, dataVolume: e.target.value })}
                      size="lg"
                      isDisabled={filters.isUnlimited}
                      borderRadius="16px"
                      border="2px solid"
                      borderColor="#E8E9EE"
                      _hover={{ borderColor: "#FE4F18" }}
                      _focus={{ borderColor: "#FE4F18", boxShadow: "0 0 0 1px #FE4F18" }}
                      bg="white"
                    >
                      <option value="0.5">500 MB</option>
                      <option value="1">1 GB</option>
                      <option value="2">2 GB</option>
                      <option value="3">3 GB</option>
                      <option value="5">5 GB</option>
                      <option value="10">10 GB</option>
                      <option value="20">20 GB</option>
                      <option value="50">50 GB</option>
                    </Select>
                  </Box>

                  <Box pt={8}>
                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="unlimited-toggle" mb="0" mr={3} fontWeight="600" color="#000" fontSize="15px">
                        {t('plansPage.filters.unlimited')}
                      </FormLabel>
                      <Switch
                        id="unlimited-toggle"
                        size="lg"
                        colorScheme="orange"
                        isChecked={filters.isUnlimited}
                        onChange={(e) => setFilters({ ...filters, isUnlimited: e.target.checked, dataVolume: '' })}
                        sx={{
                          '.chakra-switch__track': {
                            bg: '#E8E9EE',
                            _checked: {
                              bg: '#FE4F18',
                            },
                          },
                        }}
                      />
                    </FormControl>
                  </Box>
                </HStack>

                {/* Price Range Slider */}
                <Box>
                  <Text fontWeight="600" mb={2} color="#000" fontSize="15px">
                    {t('plansPage.filters.priceRange')} (USD)
                  </Text>
                  <Box px={4} pt={2} pb={4}>
                    <RangeSlider
                      value={filters.priceRange}
                      onChange={(val) => setFilters({ ...filters, priceRange: val })}
                      min={0}
                      max={100}
                      step={1}
                    >
                      <RangeSliderTrack bg="#E8E9EE" h="8px" borderRadius="full">
                        <RangeSliderFilledTrack bg="#FE4F18" />
                      </RangeSliderTrack>
                      <RangeSliderThumb index={0} boxSize={6} bg="#FE4F18" border="3px solid white" boxShadow="0 2px 8px rgba(254, 79, 24, 0.4)" />
                      <RangeSliderThumb index={1} boxSize={6} bg="#FE4F18" border="3px solid white" boxShadow="0 2px 8px rgba(254, 79, 24, 0.4)" />
                    </RangeSlider>
                    <HStack justify="space-between" mt={3}>
                      <Text fontSize="14px" fontWeight="600" color="#494951">
                        ${filters.priceRange[0]}
                      </Text>
                      <Text fontSize="14px" fontWeight="600" color="#494951">
                        ${filters.priceRange[1]}
                      </Text>
                    </HStack>
                  </Box>
                </Box>
              </Stack>

              {/* Action Buttons */}
              <HStack spacing={4}>
                <Button
                  leftIcon={<Box as={MagnifyingGlassIcon} w="20px" h="20px" />}
                  size="lg"
                  onClick={handleSearch}
                  isLoading={loading}
                  flex={1}
                  bg="#111827"
                  color="white"
                  borderRadius="full"
                  fontWeight="700"
                  _hover={{
                    bg: "#1F2937",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 24px rgba(17, 24, 39, 0.4)",
                  }}
                  transition="all 0.3s"
                >
                  {t('plansPage.filters.searchButton')}
                </Button>
                <Button
                  leftIcon={<Box as={ArrowPathIcon} w="20px" h="20px" />}
                  variant="outline"
                  size="lg"
                  onClick={handleReset}
                  borderColor="#9CA3AF"
                  color="#4B5563"
                  borderWidth="2px"
                  borderRadius="full"
                  fontWeight="700"
                  bg="transparent"
                  _hover={{
                    bg: "#F3F4F6",
                    borderColor: "#6B7280",
                  }}
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
              <Spinner size="xl" color="#FE4F18" thickness="4px" />
              <Text color="#494951" fontWeight="600">{t('plansPage.loading')}</Text>
            </VStack>
          </Flex>
        ) : error ? (
          <Alert status="error" borderRadius="20px" bg="#FFF4F0" borderColor="#FE4F18" borderWidth="2px">
            <AlertIcon color="#FE4F18" />
            <Box flex={1}>
              <AlertTitle color="#FE4F18" fontWeight="700">{t('plansPage.error')}</AlertTitle>
              <AlertDescription color="#000">{t('plansPage.errorDescription')}</AlertDescription>
            </Box>
          </Alert>
        ) : displayedPackages.length === 0 ? (
          <Card borderRadius="32px" boxShadow="0 4px 12px rgba(0, 0, 0, 0.06)">
            <CardBody p={12}>
              <VStack spacing={4}>
                <Box
                  w="80px"
                  h="80px"
                  bg="#F2F2F7"
                  borderRadius="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Box as={GlobeAltIcon} w="40px" h="40px" color="#494951" />
                </Box>
                <Heading size="md" color="#000" fontWeight="700">
                  {initialLoad
                    ? t('plansPage.results.selectCountry')
                    : t('plansPage.results.noResults')}
                </Heading>
                <Text color="#494951" textAlign="center" fontWeight="500">
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
              <Text color="#494951" fontWeight="600" fontSize="15px">
                {t('plansPage.results.showing')} <Text as="span" fontWeight="800" color="#FE4F18">{displayedPackages.length}</Text> {t('plansPage.results.of')} <Text as="span" fontWeight="800" color="#000">{packages.length}</Text> {t('plansPage.results.packages')}
              </Text>
            </Flex>

            {/* Results Table */}
            <Card borderRadius="32px" overflow="hidden" boxShadow="0 4px 12px rgba(0, 0, 0, 0.06)">
              <TableContainer>
                <Table variant="simple" size="md">
                  <Thead bg="#F2F2F7">
                    <Tr>
                      <Th color="#000" fontWeight="700" textTransform="none" fontSize="14px">{t('plansPage.table.country')}</Th>
                      <Th color="#000" fontWeight="700" textTransform="none" fontSize="14px">{t('plansPage.table.packageName')}</Th>
                      <Th color="#000" fontWeight="700" textTransform="none" fontSize="14px" isNumeric>{t('plansPage.table.data')}</Th>
                      <Th color="#000" fontWeight="700" textTransform="none" fontSize="14px" isNumeric>{t('plansPage.table.duration')}</Th>
                      <Th color="#000" fontWeight="700" textTransform="none" fontSize="14px" isNumeric>{t('plansPage.table.price')}</Th>
                      <Th color="#000" fontWeight="700" textTransform="none" fontSize="14px">{t('plansPage.table.action')}</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {displayedPackages.map((pkg, index) => (
                      <Tr
                        key={`${pkg.id}-${index}`}
                        _hover={{ bg: '#FFF4F0' }}
                        transition="all 0.2s"
                      >
                        <Td>
                          <HStack spacing={3}>
                            <Box
                              width="40px"
                              height="30px"
                              borderRadius="8px"
                              overflow="hidden"
                              border="1px solid"
                              borderColor="#E8E9EE"
                              flexShrink={0}
                            >
                              <CountryFlag
                                code={pkg.countryCode}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            </Box>
                            <Text fontWeight="600" color="#000">
                              {getCountryName(pkg.countryCode, currentLanguage)}
                            </Text>
                          </HStack>
                        </Td>
                        <Td>
                          <VStack align="flex-start" spacing={1}>
                            <Text noOfLines={1} fontWeight="500" color="#000">{pkg.name}</Text>
                            {/* Data Only Badge */}
                            {(pkg.network === 'Data' || pkg.networkType === 'Data' || !pkg.hasVoice) && (
                              <Badge
                                bg="#F3F4F6"
                                color="#000000"
                                fontSize="11px"
                                fontWeight="700"
                                px={2}
                                py={0.5}
                                borderRadius="6px"
                                textTransform="uppercase"
                              >
                                {t('plansPage.table.dataOnly')}
                              </Badge>
                            )}
                          </VStack>
                        </Td>
                        <Td isNumeric>
                          <Badge bg="#FFF4F0" color="#FE4F18" fontSize="13px" fontWeight="600" px={3} py={1} borderRadius="8px">
                            {getDataVolumeGB(pkg)} GB
                          </Badge>
                        </Td>
                        <Td isNumeric>
                          <Badge bg="#FFF4F0" color="#FE4F18" fontSize="13px" fontWeight="600" px={3} py={1} borderRadius="8px">
                            {getDays(pkg)} {t('packagePage.details.days')}
                          </Badge>
                        </Td>
                        <Td isNumeric>
                          <VStack align="flex-end" spacing={0}>
                            <Text fontSize="13px" color="#494951" fontWeight="500">
                              {formatPrice(pkg.priceUzs || calculateFinalPrice(getPriceUSD(pkg)))} UZS
                            </Text>
                            <Text fontWeight="800" color="#000000" fontSize="18px">
                              ${getPriceUSD(pkg)}
                            </Text>
                          </VStack>
                        </Td>
                        <Td>
                          <Button
                            size="sm"
                            bg="#FE4F18"
                            color="white"
                            borderRadius="full"
                            fontWeight="700"
                            onClick={() => handleBuyClick(pkg)}
                            _hover={{
                              bg: "#E5460D",
                              transform: "translateY(-2px)",
                              boxShadow: "0 4px 12px rgba(254, 79, 24, 0.4)",
                            }}
                            transition="all 0.3s"
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
