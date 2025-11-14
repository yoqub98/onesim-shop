// src/components/PlansSection.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Container,
  Heading,
  Text,
  Button,
  Grid,
  Badge,
  HStack,
  VStack,
} from '@chakra-ui/react';
import { Calendar } from 'lucide-react';
import Flag from 'react-world-flags';
import { fetchPackagesForCountries } from '../services/esimAccessApi';
import { COUNTRY_MAPPINGS, calculateFinalPrice, formatPrice } from '../config/pricing';

// Plan Card Component
const PlanCard = ({ plan }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card.Root
      position="relative"
      cursor="pointer"
      transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
      height={isHovered ? 'auto' : '280px'}
      _hover={{
        transform: 'translateY(-8px)',
        shadow: '0 20px 40px rgba(99, 102, 241, 0.3)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="animate__animated animate__fadeInUp"
      borderRadius="3xl"
      overflow="hidden"
    >
      <Card.Body p={8}>
        {/* 5G Badge */}
        <Badge
          position="absolute"
          top={6}
          right={6}
          colorPalette="purple"
          fontSize="xs"
          fontWeight="bold"
          px={4}
          py={2}
          borderRadius="full"
          textTransform="uppercase"
        >
          {plan.speed}
        </Badge>

        {/* Card Content */}
        <VStack align="flex-start" gap={5}>
          <Box width="220pt">
            {/* Country with Flag */}
            <HStack gap={3} mb={2}>
              <Box
                borderRadius="lg"
                overflow="hidden"
                shadow="sm"
                width="40px"
                height="30px"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Flag 
                  code={plan.countryCode} 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover' 
                  }} 
                />
              </Box>
              <Heading size="xl" fontWeight="bold">
                {plan.country}
              </Heading>
            </HStack>
            
            <Text fontSize="xl" color="gray.600" fontWeight="semibold" mt={2}>
              {plan.data}
            </Text>
          </Box>

          <HStack gap={2} color="gray.600">
            <Calendar size={18} />
            <Text fontSize="sm" fontWeight="medium">
              {plan.days} ДНЕЙ
            </Text>
          </HStack>

          <Heading
            fontSize="2xl"
            fontWeight="bold"
            background="linear-gradient(to right, #6366f1, #8b5cf6)"
            backgroundClip="text"
          >
            {plan.price} UZS
          </Heading>
        </VStack>

        {/* Bottom Text Button - Appears on Hover */}
        <Box
          mt={6}
          pt={4}
          borderTop="1px solid"
          borderColor="gray.100"
          opacity={isHovered ? 1 : 0}
          maxHeight={isHovered ? '60px' : '0'}
          overflow="hidden"
          transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
        >
          <Text
            color="purple.600"
            fontWeight="bold"
            fontSize="md"
            textAlign="center"
            cursor="pointer"
            _hover={{
              color: 'purple.700',
              textDecoration: 'underline',
            }}
            transition="all 0.2s"
          >
            Подробнее →
          </Text>
        </Box>
      </Card.Body>
    </Card.Root>
  );
};

// Loading Skeleton Component
const PlanCardSkeleton = () => {
  return (
    <Card.Root
      borderRadius="3xl"
      overflow="hidden"
      height="280px"
    >
      <Card.Body p={8}>
        <VStack align="flex-start" gap={5}>
          <Box width="220pt">
            <HStack gap={3} mb={2}>
              <Box
                borderRadius="lg"
                width="40px"
                height="30px"
                bg="gray.200"
                animation="pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
              />
              <Box
                width="120px"
                height="24px"
                bg="gray.200"
                borderRadius="md"
                animation="pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
              />
            </HStack>
            <Box
              width="80px"
              height="20px"
              bg="gray.200"
              borderRadius="md"
              mt={2}
              animation="pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
            />
          </Box>
          <Box
            width="100px"
            height="16px"
            bg="gray.200"
            borderRadius="md"
            animation="pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
          />
          <Box
            width="150px"
            height="28px"
            bg="gray.200"
            borderRadius="md"
            animation="pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
          />
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};

// Main Plans Section Component
const PlansSection = () => {
  const [activeTab, setActiveTab] = useState('ASIA');
  const [plansData, setPlansData] = useState({ ASIA: [], EUROPE: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPackages = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch packages for Asia countries
        const asiaPackages = await fetchPackagesForCountries(COUNTRY_MAPPINGS.ASIA);
        
        // Fetch packages for Europe countries
        const europePackages = await fetchPackagesForCountries(COUNTRY_MAPPINGS.EUROPE);

        // Transform packages with pricing
        const transformedAsiaPackages = asiaPackages.map(pkg => ({
          ...pkg,
          price: formatPrice(calculateFinalPrice(pkg.priceUSD)),
        }));

        const transformedEuropePackages = europePackages.map(pkg => ({
          ...pkg,
          price: formatPrice(calculateFinalPrice(pkg.priceUSD)),
        }));

        setPlansData({
          ASIA: transformedAsiaPackages,
          EUROPE: transformedEuropePackages,
        });
      } catch (err) {
        console.error('Error loading packages:', err);
        setError('Не удалось загрузить планы. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    loadPackages();
  }, []);

  return (
    <Box as="section" py={20} bg="gray.50" id="plans">
      <Container maxW="8xl">
        <VStack gap={12}>
          <Heading
            as="h2"
            fontSize={{ base: '3xl', md: '4xl' }}
            fontWeight="extrabold"
            textAlign="center"
            background="linear-gradient(to right, #1f2937, #4b5563)"
            backgroundClip="text"
            className="animate__animated animate__fadeIn"
          >
            Тарифные планы
          </Heading>

          {/* Custom Tabs */}
          <Box className="animate__animated animate__fadeIn">
            <HStack
              bg="gray.200"
              p={2}
              borderRadius="3xl"
              gap={2}
              mx="auto"
              width="fit-content"
              shadow="sm"
            >
              <Button
                onClick={() => setActiveTab('ASIA')}
                bg={activeTab === 'ASIA' ? 'purple.600' : 'transparent'}
                color={activeTab === 'ASIA' ? 'white' : 'gray.700'}
                borderRadius="3xl"
                _hover={{
                  bg: activeTab === 'ASIA' ? 'purple.700' : 'gray.300',
                  transform: 'scale(1.02)',
                }}
                transition="all 0.3s"
                fontWeight="bold"
                px={10}
                py={6}
                shadow={activeTab === 'ASIA' ? 'md' : 'none'}
              >
                АЗИЯ
              </Button>
              <Button
                onClick={() => setActiveTab('EUROPE')}
                bg={activeTab === 'EUROPE' ? 'purple.600' : 'transparent'}
                color={activeTab === 'EUROPE' ? 'white' : 'gray.700'}
                borderRadius="3xl"
                _hover={{
                  bg: activeTab === 'EUROPE' ? 'purple.700' : 'gray.300',
                  transform: 'scale(1.02)',
                }}
                transition="all 0.3s"
                fontWeight="bold"
                px={10}
                py={6}
                shadow={activeTab === 'EUROPE' ? 'md' : 'none'}
              >
                ЕВРОПА
              </Button>
            </HStack>

            {/* Error Message */}
            {error && (
              <Box
                mt={6}
                p={4}
                bg="red.50"
                borderRadius="lg"
                border="1px solid"
                borderColor="red.200"
              >
                <Text color="red.600" textAlign="center">
                  {error}
                </Text>
              </Box>
            )}

            {/* Plans Grid */}
            <Grid
              templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }}
              gap={8}
              mt={10}
            >
              {loading ? (
                // Show loading skeletons
                <>
                  <PlanCardSkeleton />
                  <PlanCardSkeleton />
                  <PlanCardSkeleton />
                  <PlanCardSkeleton />
                </>
              ) : plansData[activeTab].length > 0 ? (
                // Show actual plans
                plansData[activeTab].map((plan) => (
                  <PlanCard key={plan.id} plan={plan} />
                ))
              ) : (
                // Show empty state
                <Box gridColumn="1 / -1" textAlign="center" py={10}>
                  <Text fontSize="lg" color="gray.500">
                    Планы для этого региона скоро появятся
                  </Text>
                </Box>
              )}
            </Grid>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default PlansSection;