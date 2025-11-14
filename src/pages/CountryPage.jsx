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
} from '@chakra-ui/react';
import { ArrowLeft, Calendar, Wifi, MapPin, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import Flag from 'react-world-flags';
import { fetchAllPackagesForCountry } from '../services/esimAccessApi.js';
import { calculateFinalPrice, formatPrice } from '../config/pricing';
import { getCountryName, getTranslation, DEFAULT_LANGUAGE } from '../config/i18n';

const PLANS_PER_PAGE = 12;

// Plan Card Component (optimized - no animations on load)
const CountryPlanCard = ({ plan, lang = DEFAULT_LANGUAGE }) => {
  const [isHovered, setIsHovered] = useState(false);
  const t = (key) => getTranslation(lang, key);

  return (
    <Box
      position="relative"
      cursor="pointer"
      bg="white"
      borderRadius="2xl"
      overflow="hidden"
      border="2px solid"
      borderColor={isHovered ? 'purple.200' : 'gray.100'}
      transition="all 0.3s ease"
      transform={isHovered ? 'translateY(-4px)' : 'translateY(0)'}
      boxShadow={isHovered ? '0 20px 40px rgba(102, 126, 234, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.05)'}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      minWidth="280px"
    >
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        height="4px"
        background="linear-gradient(90deg, #667eea 0%, #764ba2 100%)"
        opacity={isHovered ? 1 : 0}
        transition="opacity 0.3s"
      />

      <Box p={6}>
        <VStack align="stretch" gap={4} height="100%">
          {/* Speed Badge */}
          <HStack justify="space-between">
            <Badge
              colorScheme="purple"
              fontSize="xs"
              fontWeight="700"
              px={2}
              py={1}
              borderRadius="full"
              textTransform="uppercase"
            >
              <HStack gap={1}>
                <Wifi size={10} />
                <Text>{plan.speed}</Text>
              </HStack>
            </Badge>
          </HStack>

          {/* Data Amount */}
          <Box
            bg="purple.50"
            p={3}
            borderRadius="lg"
            border="1px solid"
            borderColor="purple.100"
          >
            <Text 
              fontSize="2xl" 
              fontWeight="800" 
              color="purple.700"
              textAlign="center"
            >
              {plan.data}
            </Text>
            <Text 
              fontSize="xs" 
              color="purple.600" 
              textAlign="center"
              fontWeight="600"
            >
              {t('plans.card.internet') || 'Интернет'}
            </Text>
          </Box>

          {/* Duration */}
          <HStack 
            gap={2} 
            p={2}
            bg="gray.50"
            borderRadius="md"
            justify="center"
          >
            <Calendar size={16} color="#9333ea" />
            <Text fontSize="md" fontWeight="700" color="gray.900">
              {plan.days} {t('plans.card.days') || 'дней'}
            </Text>
          </HStack>

          {/* Price */}
          <Box
            mt="auto"
            pt={3}
            borderTop="2px dashed"
            borderColor="gray.200"
          >
            <HStack justify="space-between" align="center">
              <VStack align="flex-start" gap={0}>
                <Text fontSize="xs" color="gray.500" fontWeight="600">
                  {t('plans.card.price') || 'Цена'}
                </Text>
                <Heading
                  fontSize="2xl"
                  fontWeight="800"
                  color="gray.800"
                >
                  {plan.price}
                </Heading>
                <Text fontSize="xs" color="gray.500" fontWeight="600">
                  {t('plans.card.currency') || 'USD'}
                </Text>
              </VStack>

              <Button
                size="sm"
                bg={isHovered ? 'purple.600' : 'gray.100'}
                color={isHovered ? 'white' : 'gray.700'}
                _hover={{
                  bg: 'purple.700',
                  color: 'white',
                }}
                transition="all 0.3s"
                borderRadius="lg"
                fontWeight="700"
                px={3}
              >
                <HStack gap={1}>
                  <Text>{t('plans.card.buy') || 'Купить'}</Text>
                  <ArrowRight size={14} />
                </HStack>
              </Button>
            </HStack>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
};

// Minimal Loading Skeleton
const PlanCardSkeleton = () => {
  return (
    <Box
      borderRadius="2xl"
      overflow="hidden"
      border="2px solid"
      borderColor="gray.100"
      minWidth="280px"
      bg="white"
    >
      <Box p={6}>
        <VStack align="stretch" gap={4}>
          <Box
            width="50px"
            height="20px"
            bg="gray.200"
            borderRadius="full"
            sx={{
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.5 },
              },
              animation: 'pulse 2s ease-in-out infinite',
            }}
          />
          <Box
            height="60px"
            bg="gray.100"
            borderRadius="lg"
            sx={{
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.5 },
              },
              animation: 'pulse 2s ease-in-out infinite',
            }}
          />
          <Box
            height="40px"
            bg="gray.100"
            borderRadius="md"
            sx={{
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.5 },
              },
              animation: 'pulse 2s ease-in-out infinite',
            }}
          />
          <Box
            height="60px"
            bg="gray.100"
            borderRadius="lg"
            sx={{
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.5 },
              },
              animation: 'pulse 2s ease-in-out infinite',
            }}
          />
        </VStack>
      </Box>
    </Box>
  );
};

// Compact Pagination Component
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
    <HStack gap={2} justify="center" mt={8}>
      <IconButton
        onClick={() => onPageChange(currentPage - 1)}
        isDisabled={currentPage === 1}
        variant="ghost"
        size="sm"
        aria-label="Previous"
      >
        <ChevronLeft size={18} />
      </IconButton>
      
      {start > 1 && (
        <>
          <Button size="sm" onClick={() => onPageChange(1)} variant="ghost">
            1
          </Button>
          {start > 2 && <Text fontSize="sm" color="gray.400">...</Text>}
        </>
      )}
      
      {pages.map((page) => (
        <Button
          key={page}
          size="sm"
          onClick={() => onPageChange(page)}
          bg={currentPage === page ? 'purple.600' : 'transparent'}
          color={currentPage === page ? 'white' : 'gray.700'}
          _hover={{
            bg: currentPage === page ? 'purple.700' : 'gray.100',
          }}
          minW="32px"
        >
          {page}
        </Button>
      ))}
      
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <Text fontSize="sm" color="gray.400">...</Text>}
          <Button size="sm" onClick={() => onPageChange(totalPages)} variant="ghost">
            {totalPages}
          </Button>
        </>
      )}
      
      <IconButton
        onClick={() => onPageChange(currentPage + 1)}
        isDisabled={currentPage === totalPages}
        variant="ghost"
        size="sm"
        aria-label="Next"
      >
        <ChevronRight size={18} />
      </IconButton>
    </HStack>
  );
};

// Main Country Page Component
const CountryPage = () => {
  const { countryCode } = useParams();
  const navigate = useNavigate();
  const lang = DEFAULT_LANGUAGE;
  const t = (key) => getTranslation(lang, key);
  
  const [allPlans, setAllPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedData, setSelectedData] = useState('all');
  const [selectedDuration, setSelectedDuration] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  const countryName = getCountryName(countryCode, lang);

  // Load plans once
  useEffect(() => {
    let isMounted = true;
    
    const loadPlans = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('📡 Loading packages for:', countryCode);
        const packages = await fetchAllPackagesForCountry(countryCode, lang);
        
        if (!isMounted) return;
        
        const transformedPackages = packages.map(pkg => ({
          ...pkg,
          price: formatPrice(calculateFinalPrice(pkg.priceUSD)),
        }));

        setAllPlans(transformedPackages);
        console.log('✅ Loaded', transformedPackages.length, 'packages');
        
      } catch (err) {
        if (!isMounted) return;
        console.error('❌ Error:', err);
        setError(t('plans.error') || 'Error loading plans');
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
  }, [countryCode, lang, t]);

  // Compute filter options
  const dataOptions = useMemo(() => {
    return [...new Set(allPlans.map(p => p.dataGB))].sort((a, b) => a - b);
  }, [allPlans]);

  const durationOptions = useMemo(() => {
    return [...new Set(allPlans.map(p => p.days))].sort((a, b) => a - b);
  }, [allPlans]);

  // Apply filters
  const filteredPlans = useMemo(() => {
    let filtered = [...allPlans];
    
    if (selectedData !== 'all') {
      filtered = filtered.filter(plan => plan.dataGB === parseInt(selectedData));
    }
    
    if (selectedDuration !== 'all') {
      filtered = filtered.filter(plan => plan.days === parseInt(selectedDuration));
    }
    
    return filtered;
  }, [allPlans, selectedData, selectedDuration]);

  // Paginate
  const paginatedPlans = useMemo(() => {
    const start = (currentPage - 1) * PLANS_PER_PAGE;
    return filteredPlans.slice(start, start + PLANS_PER_PAGE);
  }, [filteredPlans, currentPage]);

  const totalPages = Math.ceil(filteredPlans.length / PLANS_PER_PAGE);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedData, selectedDuration]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Header */}
      <Box bg="white" py={12} borderBottom="1px solid" borderColor="gray.200">
        <Container maxW="8xl">
          <VStack align="flex-start" gap={4}>
            <Button
              leftIcon={<ArrowLeft size={18} />}
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              fontWeight="600"
            >
              {t('countryPage.backButton') || 'Назад'}
            </Button>

            <HStack gap={4}>
              <Box
                borderRadius="xl"
                overflow="hidden"
                boxShadow="lg"
                width="80px"
                height="60px"
                flexShrink={0}
                border="2px solid"
                borderColor="gray.200"
              >
                <Flag 
                  code={countryCode} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              </Box>
              <VStack align="flex-start" gap={1}>
                <Heading size="xl" fontWeight="800" color="gray.900">
                  {t('countryPage.title') || 'eSIM для'} {countryName}
                </Heading>
                <Badge colorScheme="purple" fontSize="sm" px={3} py={1}>
                  {loading ? '...' : `${filteredPlans.length} планов`}
                </Badge>
              </VStack>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Filters */}
      <Box bg="white" py={6} borderBottom="1px solid" borderColor="gray.200">
        <Container maxW="8xl">
          <HStack gap={4} flexWrap="wrap">
            <Text fontWeight="600" color="gray.700">
              {t('countryPage.filterLabel') || 'Фильтры'}:
            </Text>
            
            <Box minW="180px">
              <select
                value={selectedData}
                onChange={(e) => setSelectedData(e.target.value)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                <option value="all">Все данные</option>
                {dataOptions.map(gb => (
                  <option key={gb} value={gb}>
                    {gb}GB
                  </option>
                ))}
              </select>
            </Box>

            <Box minW="180px">
              <select
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                <option value="all">Все сроки</option>
                {durationOptions.map(days => (
                  <option key={days} value={days}>
                    {days} дней
                  </option>
                ))}
              </select>
            </Box>

            {!loading && (
              <Text color="gray.500" fontSize="sm" ml="auto">
                {paginatedPlans.length} из {filteredPlans.length}
              </Text>
            )}
          </HStack>
        </Container>
      </Box>

      {/* Plans Grid */}
      <Box py={12}>
        <Container maxW="8xl">
          {error && (
            <Box p={4} bg="red.50" borderRadius="lg" border="1px solid" borderColor="red.200" mb={6}>
              <Text color="red.600" textAlign="center" fontWeight="600">
                {error}
              </Text>
            </Box>
          )}

          <Grid
            templateColumns={{ 
              base: '1fr', 
              md: 'repeat(2, 1fr)', 
              lg: 'repeat(3, 1fr)',
              xl: 'repeat(4, 1fr)' 
            }}
            gap={4}
          >
            {loading ? (
              Array.from({ length: 12 }).map((_, i) => (
                <PlanCardSkeleton key={i} />
              ))
            ) : paginatedPlans.length > 0 ? (
              paginatedPlans.map((plan) => (
                <CountryPlanCard key={plan.id} plan={plan} lang={lang} />
              ))
            ) : (
              <Box gridColumn="1 / -1" textAlign="center" py={12}>
                <VStack gap={3}>
                  <Box w="60px" h="60px" bg="gray.100" borderRadius="full" display="flex" alignItems="center" justifyContent="center">
                    <MapPin size={32} color="#9ca3af" />
                  </Box>
                  <Heading size="md" color="gray.700">
                    Планы не найдены
                  </Heading>
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
                    Сбросить фильтры
                  </Button>
                </VStack>
              </Box>
            )}
          </Grid>

          {!loading && totalPages > 1 && (
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default CountryPage;