// src/pages/CountryPage.jsx
import React, { useState, useEffect } from 'react';
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
} from '@chakra-ui/react';
import { ArrowLeft, Calendar, Wifi, MapPin, ArrowRight } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import Flag from 'react-world-flags';
import { fetchAllPackagesForCountry } from '../services/esimAccessApi';
import { calculateFinalPrice, formatPrice } from '../config/pricing';
import { getCountryName, getTranslation, DEFAULT_LANGUAGE } from '../config/i18n';

// Plan Card Component
const CountryPlanCard = ({ plan, delay = 0, lang = DEFAULT_LANGUAGE }) => {
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
      transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
      transform={isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)'}
      boxShadow={isHovered ? '0 25px 50px rgba(102, 126, 234, 0.25)' : '0 4px 12px rgba(0, 0, 0, 0.08)'}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="animate__animated animate__fadeInUp"
      style={{
        animationDelay: `${delay}ms`,
      }}
      minWidth="280px"
    >
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        height="6px"
        background="linear-gradient(90deg, #667eea 0%, #764ba2 100%)"
        opacity={isHovered ? 1 : 0}
        transition="opacity 0.3s"
      />

      <Box p={8}>
        <VStack align="stretch" gap={6} height="100%">
          {/* Speed Badge */}
          <HStack justify="space-between">
            <Badge
              colorScheme="purple"
              fontSize="xs"
              fontWeight="800"
              px={3}
              py={1.5}
              borderRadius="full"
              textTransform="uppercase"
              display="inline-flex"
              alignItems="center"
              gap={1.5}
            >
              <Wifi size={12} />
              {plan.speed}
            </Badge>
          </HStack>

          {/* Data Amount */}
          <Box
            bg="purple.50"
            p={4}
            borderRadius="xl"
            border="1px solid"
            borderColor="purple.100"
          >
            <Text 
              fontSize="3xl" 
              fontWeight="800" 
              color="purple.700"
              textAlign="center"
              letterSpacing="tight"
            >
              {plan.data}
            </Text>
            <Text 
              fontSize="xs" 
              color="purple.600" 
              textAlign="center"
              fontWeight="600"
              mt={1}
            >
              {t('plans.card.internet')}
            </Text>
          </Box>

          {/* Duration */}
          <HStack 
            gap={3} 
            color="gray.600"
            p={3}
            bg="gray.50"
            borderRadius="lg"
            justify="center"
          >
            <Calendar size={20} color="#9333ea" />
            <Text fontSize="lg" fontWeight="700" color="gray.900">
              {plan.days} {t('plans.card.days')}
            </Text>
          </HStack>

          {/* Price */}
          <Box
            mt="auto"
            pt={4}
            borderTop="2px dashed"
            borderColor="gray.200"
          >
            <HStack justify="space-between" align="center">
              <VStack align="flex-start" gap={0}>
                <Text fontSize="xs" color="gray.500" fontWeight="600">
                  {t('plans.card.price')}
                </Text>
                <Heading
                  fontSize="3xl"
                  fontWeight="800"
                  color="gray.800"
                  letterSpacing="tight"
                >
                  {plan.price}
                </Heading>
                <Text fontSize="xs" color="gray.500" fontWeight="600">
                  {t('plans.card.currency')}
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
                px={4}
                rightIcon={<ArrowRight size={16} />}
              >
                {t('plans.card.buy')}
              </Button>
            </HStack>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
};

// Loading Skeleton
const PlanCardSkeleton = ({ delay = 0 }) => {
  return (
    <Box
      borderRadius="2xl"
      overflow="hidden"
      border="2px solid"
      borderColor="gray.100"
      minWidth="280px"
      className="animate__animated animate__fadeIn"
      style={{
        animationDelay: `${delay}ms`,
      }}
    >
      <Box p={8}>
        <VStack align="stretch" gap={6}>
          <Box
            width="60px"
            height="24px"
            bg="gray.200"
            borderRadius="full"
            sx={{
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.5 },
              },
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          />
          <Box
            height="80px"
            bg="gray.100"
            borderRadius="xl"
            sx={{
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.5 },
              },
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
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
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          />
          <Box
            height="80px"
            bg="gray.100"
            borderRadius="lg"
            sx={{
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.5 },
              },
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          />
        </VStack>
      </Box>
    </Box>
  );
};

// Main Country Page Component
const CountryPage = () => {
  const { countryCode } = useParams();
  const navigate = useNavigate();
  const lang = DEFAULT_LANGUAGE;
  const t = (key) => getTranslation(lang, key);
  
  const [allPlans, setAllPlans] = useState([]);
  const [filteredPlans, setFilteredPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [selectedData, setSelectedData] = useState('all');
  const [selectedDuration, setSelectedDuration] = useState('all');
  
  // Get unique data amounts and durations for filters
  const [dataOptions, setDataOptions] = useState([]);
  const [durationOptions, setDurationOptions] = useState([]);
  
  const countryName = getCountryName(countryCode, lang);

  useEffect(() => {
    console.log('🔵 CountryPage mounted, countryCode:', countryCode);
    
    const loadPlans = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('📡 Fetching packages for:', countryCode);
        const packages = await fetchAllPackagesForCountry(countryCode, lang);
        console.log('📦 Received packages:', packages);
        
        // Transform with pricing
        const transformedPackages = packages.map(pkg => ({
          ...pkg,
          price: formatPrice(calculateFinalPrice(pkg.priceUSD)),
        }));

        console.log('✅ Transformed packages:', transformedPackages);

        setAllPlans(transformedPackages);
        setFilteredPlans(transformedPackages);
        
        // Extract unique data amounts and sort
        const uniqueData = [...new Set(transformedPackages.map(p => p.dataGB))].sort((a, b) => a - b);
        setDataOptions(uniqueData);
        
        // Extract unique durations and sort
        const uniqueDurations = [...new Set(transformedPackages.map(p => p.days))].sort((a, b) => a - b);
        setDurationOptions(uniqueDurations);
        
      } catch (err) {
        console.error('❌ Error loading country plans:', err);
        setError(t('plans.error') || 'Error loading plans');
      } finally {
        setLoading(false);
      }
    };

    if (countryCode) {
      loadPlans();
    }
  }, [countryCode, lang, t]);

  // Apply filters
  useEffect(() => {
    let filtered = [...allPlans];
    
    if (selectedData !== 'all') {
      filtered = filtered.filter(plan => plan.dataGB === parseInt(selectedData));
    }
    
    if (selectedDuration !== 'all') {
      filtered = filtered.filter(plan => plan.days === parseInt(selectedDuration));
    }
    
    setFilteredPlans(filtered);
  }, [selectedData, selectedDuration, allPlans]);

  console.log('🎨 Rendering CountryPage, loading:', loading, 'plans:', filteredPlans.length);

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Hero Section with Country Info */}
      <Box
        bg="linear-gradient(180deg, #fafafa 0%, #ffffff 100%)"
        py={16}
        borderBottom="1px solid"
        borderColor="gray.200"
      >
        <Container maxW="8xl">
          <VStack align="flex-start" gap={6}>
            {/* Back Button */}
            <Button
              leftIcon={<ArrowLeft size={20} />}
              variant="ghost"
              onClick={() => navigate('/')}
              fontWeight="700"
              color="gray.700"
              _hover={{
                bg: 'gray.100',
              }}
            >
              {t('countryPage.backButton') || 'Назад'}
            </Button>

            {/* Country Header */}
            <HStack gap={6} flexWrap="nowrap">
              <Box
                borderRadius="2xl"
                overflow="hidden"
                boxShadow="xl"
                width="120px"
                height="90px"
                flexShrink={0}
                display="flex"
                alignItems="center"
                justifyContent="center"
                border="3px solid"
                borderColor="gray.200"
              >
                <Flag 
                  code={countryCode} 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover' 
                  }} 
                />
              </Box>
              <VStack align="flex-start" gap={2}>
                <Heading
                  fontSize={{ base: '3xl', md: '5xl' }}
                  fontWeight="800"
                  color="gray.900"
                  letterSpacing="tight"
                >
                  {t('countryPage.title') || 'eSIM для'} {countryName}
                </Heading>
                <Badge
                  colorScheme="purple"
                  fontSize="sm"
                  fontWeight="700"
                  px={4}
                  py={2}
                  borderRadius="full"
                >
                  {allPlans.length} {allPlans.length === 1 ? 'план' : 'планов'}
                </Badge>
              </VStack>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Filters Section */}
      <Box bg="white" py={8} borderBottom="1px solid" borderColor="gray.200">
        <Container maxW="8xl">
          <HStack gap={6} flexWrap="wrap">
            <Text fontWeight="700" color="gray.700" fontSize="lg">
              {t('countryPage.filterLabel') || 'Фильтры'}:
            </Text>
            
            {/* Data Filter */}
            <Box minW="200px">
              <select
                value={selectedData}
                onChange={(e) => setSelectedData(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
              >
                <option value="all">{t('countryPage.allData') || 'Все объёмы данных'}</option>
                {dataOptions.map(gb => (
                  <option key={gb} value={gb.toString()}>
                    {gb}GB
                  </option>
                ))}
              </select>
            </Box>

            {/* Duration Filter */}
            <Box minW="200px">
              <select
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
              >
                <option value="all">{t('countryPage.allDuration') || 'Все сроки'}</option>
                {durationOptions.map(days => (
                  <option key={days} value={days.toString()}>
                    {days} {t('plans.card.days') || 'дней'}
                  </option>
                ))}
              </select>
            </Box>

            {/* Results Count */}
            {!loading && (
              <Text color="gray.600" fontWeight="600" ml="auto">
                {filteredPlans.length} {filteredPlans.length === 1 ? 'результат' : 'результатов'}
              </Text>
            )}
          </HStack>
        </Container>
      </Box>

      {/* Plans Grid */}
      <Box py={16}>
        <Container maxW="8xl">
          {error && (
            <Box
              p={6}
              bg="red.50"
              borderRadius="xl"
              border="2px solid"
              borderColor="red.200"
              mb={8}
            >
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
            gap={6}
          >
            {loading ? (
              <>
                {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <PlanCardSkeleton key={i} delay={i * 50} />
                ))}
              </>
            ) : filteredPlans.length > 0 ? (
              filteredPlans.map((plan, index) => (
                <CountryPlanCard 
                  key={plan.id} 
                  plan={plan} 
                  delay={index * 50}
                  lang={lang}
                />
              ))
            ) : (
              <Box gridColumn="1 / -1" textAlign="center" py={16}>
                <VStack gap={4}>
                  <Box
                    w="80px"
                    h="80px"
                    bg="gray.100"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <MapPin size={40} color="#9ca3af" />
                  </Box>
                  <Heading size="lg" color="gray.700">
                    {t('countryPage.noPlans') || 'Планы не найдены'}
                  </Heading>
                  <Text fontSize="md" color="gray.500" fontWeight="500">
                    {t('countryPage.noPlansDescription') || 'Попробуйте изменить фильтры'}
                  </Text>
                  <Button
                    mt={4}
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
        </Container>
      </Box>
    </Box>
  );
};

export default CountryPage;