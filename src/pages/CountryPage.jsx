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
} from '@chakra-ui/react';
import { ArrowLeft, Calendar, Wifi, ArrowRight, ChevronLeft, ChevronRight, CreditCard } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import Flag from 'react-world-flags';
import { fetchAllPackagesForCountry } from '../services/esimAccessApi';
import { calculateFinalPrice, formatPrice } from '../config/pricing';
import { getCountryName, getTranslation, DEFAULT_LANGUAGE } from '../config/i18n';

const PLANS_PER_PAGE = 12;
const DEFAULT_DURATION_FILTER = 30; // Default to 30 days

// Plan Card Component
const CountryPlanCard = ({ plan, lang = DEFAULT_LANGUAGE }) => {
  const [isHovered, setIsHovered] = useState(false);
  const t = (key) => getTranslation(lang, key);

  // Debug logging
  console.log('Plan data:', {
    id: plan.id,
    data: plan.data,
    operatorList: plan.operatorList,
    hasOperators: plan.operatorList && plan.operatorList.length > 0
  });

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
      boxShadow={isHovered ? '0 20px 40px rgba(100, 100, 100, 0.25)' : '0 4px 12px rgba(100, 100, 100, 0.15)'}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
        <VStack align="stretch" gap={4}>
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
            <Box color="purple.600">
              <CreditCard size={20} />
            </Box>
          </HStack>

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

          {/* Operator/Telecom Provider */}
          {plan.operatorList && plan.operatorList.length > 0 && (
            <Box
              p={2}
              bg="blue.50"
              borderRadius="md"
              border="1px solid"
              borderColor="blue.100"
            >
              <Text fontSize="xs" color="blue.600" fontWeight="600" textAlign="center" mb={1}>
                Провайдер
              </Text>
              <VStack gap={1} align="stretch">
                {plan.operatorList.map((operator, idx) => (
                  <HStack key={idx} justify="center" gap={1}>
                    <Text fontSize="sm" fontWeight="700" color="blue.800">
                      {operator.operatorName}
                    </Text>
                    {operator.networkType && (
                      <Badge colorScheme="blue" fontSize="xs" px={1.5} py={0.5}>
                        {operator.networkType}
                      </Badge>
                    )}
                  </HStack>
                ))}
              </VStack>
            </Box>
          )}

          <Box
            pt={3}
            borderTop="2px dashed"
            borderColor="gray.200"
          >
            <HStack justify="space-between" align="center">
              <VStack align="flex-start" gap={0.5}>
                <Text fontSize="xs" color="gray.500" fontWeight="600">
                  {t('plans.card.price') || 'Цена'}
                </Text>
                <HStack gap={1.5} align="baseline">
                  <Heading
                    fontSize="2xl"
                    fontWeight="800"
                    color="gray.800"
                  >
                    {plan.price}
                  </Heading>
                  <Text fontSize="md" color="gray.600" fontWeight="700">
                    UZS
                  </Text>
                </HStack>
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

// Loading Skeleton
const PlanCardSkeleton = () => {
  return (
    <Box
      borderRadius="2xl"
      overflow="hidden"
      border="2px solid"
      borderColor="gray.100"
      bg="white"
    >
      <Box p={6}>
        <VStack align="stretch" gap={4}>
          {[20, 60, 40, 50, 60].map((height, i) => (
            <Box
              key={i}
              height={`${height}px`}
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
          ))}
        </VStack>
      </Box>
    </Box>
  );
};

// Pagination Component
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
        disabled={currentPage === 1}
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
        disabled={currentPage === totalPages}
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
  
  // Default to 30 days filter
  const [selectedData, setSelectedData] = useState('all');
  const [selectedDuration, setSelectedDuration] = useState(DEFAULT_DURATION_FILTER.toString());
  const [currentPage, setCurrentPage] = useState(1);
  
  const countryName = getCountryName(countryCode, lang);

  // Load plans once on mount
  useEffect(() => {
    let isMounted = true;
    
    const loadPlans = async () => {
      try {
        setLoading(true);
        setError(null);

        const packages = await fetchAllPackagesForCountry(countryCode, lang);
        
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
  }, [countryCode, lang]);

  // Get unique filter options
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
    if (countryCode?.toLowerCase() === 'tr') {
      return 'https://ik.imagekit.io/php1jcf0t/OneSim/1278.jpg';
    }
    return null; // Use gray background for other countries
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
          <VStack align="flex-start" justify="space-between" minH="400px" py={8} gap={6}>
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
              <HStack gap={2}>
                <ArrowLeft size={20} />
                <Text>Назад</Text>
              </HStack>
            </Button>

            {/* Main Content */}
            <VStack align="flex-start" gap={6} w="100%">
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
                <Flag
                  code={countryCode}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>

              {/* Text Content */}
              <VStack align="flex-start" gap={5} flex={1} maxW="700px">
                <Heading
                  fontSize={{ base: '5xl', md: '6xl' }}
                  fontWeight="900"
                  color={headerBgImage ? 'white' : 'gray.800'}
                  lineHeight="1.2"
                  textShadow={headerBgImage ? '0 2px 10px rgba(0,0,0,0.3)' : 'none'}
                >
                  eSIM для {countryName}
                </Heading>

                <Text
                  fontSize={{ base: 'md', md: 'lg' }}
                  color={headerBgImage ? 'whiteAlpha.900' : 'gray.600'}
                  fontWeight="500"
                  lineHeight="1.6"
                  textShadow={headerBgImage ? '0 1px 5px rgba(0,0,0,0.3)' : 'none'}
                >
                  Выберите идеальный план мобильного интернета для вашей поездки.
                  Быстрая активация, надежная связь и доступные цены.
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
                    <HStack gap={2}>
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
        bg="white"
        py={6}
        borderBottom="1px solid"
        borderColor="gray.200"
        boxShadow="0 6px 20px rgba(100, 100, 100, 0.12)"
      >
        <Container maxW="8xl">
          <HStack gap={4} flexWrap="wrap">
            <Text fontWeight="600" color="gray.700">
              Фильтры:
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
                Показано {paginatedPlans.length} из {filteredPlans.length}
              </Text>
            )}
          </HStack>
        </Container>
      </Box>

      {/* Plans Grid */}
      <Box py={12} bg="white">
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
                gap={4}
              >
                {paginatedPlans.map((plan) => (
                  <CountryPlanCard key={plan.id} plan={plan} lang={lang} />
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
              <VStack gap={3}>
                <Heading size="md" color="gray.700">
                  Планы не найдены
                </Heading>
                <Text color="gray.500">
                  Попробуйте изменить фильтры
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
                  Сбросить фильтры
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