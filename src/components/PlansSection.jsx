// src/components/PlansSection.jsx
import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Badge,
  HStack,
  VStack,
  Grid,
} from '@chakra-ui/react';
import { CalendarIcon, MapPinIcon, WifiIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import CountryFlag from './CountryFlag';
import { fetchHandpickedPackages } from '../services/esimAccessApi';
import { HANDPICKED_PLAN_SLUGS, calculateFinalPrice, calculateFinalPriceUSD, formatPrice } from '../config/pricing';
import { getTranslation } from '../config/i18n';
import { useLanguage } from '../contexts/LanguageContext';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

// Enhanced Plan Card Component
const PlanCard = ({ plan, delay = 0, lang }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [cardRef, isVisible] = useScrollAnimation(0.1);
  const navigate = useNavigate();
  const t = (key) => getTranslation(lang, key);

  const handleBuyClick = () => {
    navigate(`/package/${plan.id}`, { state: { plan, countryCode: plan.countryCode } });
  };

  return (
    <Box
      ref={cardRef}
      position="relative"
      cursor="pointer"
      bg="white"
      borderRadius="2xl"
      overflow="visible"
      transition="all 0.15s ease-out"
      transform={isHovered ? 'translateY(-8px)' : 'translateY(0)'}
      shadow={isHovered ? '0 25px 50px rgba(254, 79, 24, 0.2)' : '0 4px 12px rgba(0, 0, 0, 0.06)'}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      opacity={isVisible ? 1 : 0}
      style={{
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`,
      }}
      width="100%"
    >
      <VStack align="stretch" spacing={5} p={6}>
        {/* Country Name and Flag */}
        <HStack justify="space-between" align="center" spacing={3}>
          <Heading
            fontSize="2xl"
            fontWeight="700"
            color="#151618"
            letterSpacing="tight"
            fontFamily="'Manrope', sans-serif"
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
            flex={1}
          >
            {plan.country}
          </Heading>
          <Box
            borderRadius="12px"
            overflow="hidden"
            width="56px"
            height="42px"
            flexShrink={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
            border="1px solid"
            borderColor="#E8E9EE"
            transition="all 0.3s"
            transform={isHovered ? 'scale(1.05)' : 'scale(1)'}
          >
            <CountryFlag
              code={plan.countryCode}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </Box>
        </HStack>

        {/* Network Type and Duration Pills */}
        <HStack spacing={3}>
          <HStack
            spacing={2}
            px={3}
            py={2}
            borderRadius="12px"
            border="1px solid"
            borderColor="#E8E9EE"
            bg="white"
            align="center"
          >
            <Box as={WifiIcon} w="20px" h="20px" color="#FE4F18" />
            <Text fontSize="sm" fontWeight="600" color="#151618" whiteSpace="nowrap">
              {plan.speed}
            </Text>
          </HStack>
          <HStack
            spacing={2}
            px={3}
            py={2}
            borderRadius="12px"
            border="1px solid"
            borderColor="#E8E9EE"
            bg="white"
            align="center"
          >
            <Box as={CalendarIcon} w="20px" h="20px" color="#FE4F18" />
            <Text fontSize="sm" fontWeight="600" color="#151618" whiteSpace="nowrap">
              {plan.days} {t('plans.card.days')}
            </Text>
          </HStack>
        </HStack>

        {/* Data Amount */}
        <VStack align="flex-start" spacing={1}>
          <Text
            fontSize="sm"
            color="#6B7280"
            fontWeight="500"
            whiteSpace="nowrap"
          >
            {t('plans.card.dataLabel')}
          </Text>
          <HStack align="baseline" spacing={1}>
            <Text
              fontSize="4xl"
              fontWeight="700"
              color="#374151"
              letterSpacing="tight"
              whiteSpace="nowrap"
            >
              {plan.data.replace(/\s?(GB|ГБ)/i, '')}
            </Text>
            <Text
              fontSize="2xl"
              fontWeight="600"
              color="#6B7280"
              whiteSpace="nowrap"
            >
              GB
            </Text>
          </HStack>
        </VStack>

        {/* Pricing Section - Gray Box */}
        <Box
          bg="#F3F4F6"
          borderRadius="20px"
          p={4}
        >
          <HStack justify="space-between" align="center" spacing={2}>
            {/* Price Information */}
            <VStack align="flex-start" spacing={0}>
              <Text fontSize="lg" fontWeight="600" color="#6B7280" whiteSpace="nowrap">
                {plan.priceUSD}$
              </Text>
              <HStack align="baseline" spacing={1}>
                <Text
                  fontSize="2xl"
                  fontWeight="800"
                  color="#151618"
                  letterSpacing="tight"
                  whiteSpace="nowrap"
                >
                  {plan.price}
                </Text>
                <Text fontSize="md" fontWeight="500" color="#6B7280" whiteSpace="nowrap">
                  {t('plans.card.currency')}
                </Text>
              </HStack>
            </VStack>

            {/* Buy Button - Outlined */}
            <Button
              size="md"
              variant="outline"
              borderColor="#FE4F18"
              color="#FE4F18"
              bg="rgba(255, 255, 255, 0.6)"
              borderWidth="2px"
              _hover={{
                bg: '#FE4F18',
                color: 'white',
                transform: 'translateY(-2px)',
                shadow: '0 10px 30px rgba(254, 79, 24, 0.4)',
              }}
              transition="all 0.3s ease-in-out"
              borderRadius="full"
              fontWeight="700"
              fontSize="md"
              px={8}
              py={4}
              h="auto"
              onClick={handleBuyClick}
              whiteSpace="nowrap"
            >
              {t('plans.card.buy')}
            </Button>
          </HStack>
        </Box>
      </VStack>
    </Box>
  );
};

// Loading Skeleton Component
const PlanCardSkeleton = ({ delay = 0 }) => {
  return (
    <Box
      borderRadius="2xl"
      overflow="hidden"
      border="1px solid"
      borderColor="gray.100"
      bg="white"
      width="100%"
      className="animate__animated animate__fadeIn"
      style={{
        animationDelay: `${delay}ms`,
      }}
    >
      <VStack align="stretch" spacing={5} p={6}>
        <HStack justify="space-between">
          <Box
            width="160px"
            height="32px"
            bg="gray.200"
            borderRadius="lg"
            animation="pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
          />
          <Box
            borderRadius="12px"
            width="56px"
            height="42px"
            bg="gray.200"
            flexShrink={0}
            animation="pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
          />
        </HStack>
        <HStack spacing={3}>
          <Box
            width="48px"
            height="40px"
            bg="gray.200"
            borderRadius="12px"
            animation="pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
          />
          <Box
            width="130px"
            height="40px"
            bg="gray.200"
            borderRadius="12px"
            animation="pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
          />
        </HStack>
        <VStack align="flex-start" spacing={1}>
          <Box
            width="150px"
            height="20px"
            bg="gray.200"
            borderRadius="lg"
            animation="pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
          />
          <Box
            width="110px"
            height="40px"
            bg="gray.200"
            borderRadius="lg"
            animation="pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
          />
        </VStack>
        <Box
          height="76px"
          bg="gray.100"
          borderRadius="20px"
          animation="pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
        />
      </VStack>
    </Box>
  );
};

// Main Plans Section Component
const PlansSection = () => {
  const { currentLanguage } = useLanguage();
  const [plansData, setPlansData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadHandpickedPackages = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🎯 Loading handpicked packages by slug...');

        // Fetch packages using slugs
        const packages = await fetchHandpickedPackages(HANDPICKED_PLAN_SLUGS, currentLanguage);

        console.log('💰 PRICING CALCULATION:');
        
        // Transform packages with pricing (apply margin to both USD and UZS)
        const transformedPackages = packages.map(pkg => {
          const finalPriceUZS = calculateFinalPrice(pkg.priceUSD);
          const finalPriceUSD = calculateFinalPriceUSD(pkg.priceUSD);
          const formattedPrice = formatPrice(finalPriceUZS);

          console.log(`💵 ${pkg.country}:`, {
            originalPriceUSD: pkg.priceUSD,
            finalPriceUSD: finalPriceUSD,
            finalPriceUZS: finalPriceUZS,
            formattedPrice: formattedPrice,
          });

          return {
            ...pkg,
            priceUSD: finalPriceUSD, // USD price with margin
            price: formattedPrice,
          };
        });

        setPlansData(transformedPackages);
        console.log(`✅ Loaded ${transformedPackages.length} handpicked plans`);
        console.log('📦 FINAL PLANS DATA:', transformedPackages);
      } catch (err) {
        console.error('Error loading handpicked packages:', err);
        setError(getTranslation(currentLanguage, 'plans.error'));
      } finally {
        setLoading(false);
      }
    };

    loadHandpickedPackages();
  }, [currentLanguage]);

  const t = (key) => getTranslation(currentLanguage, key);

  return (
    <Box as="section" py={24} bg="#E8E9EE" id="plans" position="relative" overflow="hidden">
      <Box
        position="absolute"
        top="10%"
        left="-10%"
        width="500px"
        height="500px"
        bg="#FFF4F0"
        borderRadius="full"
        filter="blur(100px)"
        opacity="0.5"
        pointerEvents="none"
      />
      <Box
        position="absolute"
        bottom="10%"
        right="-10%"
        width="500px"
        height="500px"
        bg="#FFF4F0"
        borderRadius="full"
        filter="blur(100px)"
        opacity="0.4"
        pointerEvents="none"
      />

      <Container maxW="8xl" position="relative">
        <VStack spacing={16}>
          <VStack spacing={4} textAlign="center" className="animate__animated animate__fadeIn">
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
              {t('plans.badge')}
            </Badge>
            <Heading
              as="h2"
              fontSize={{ base: '4xl', md: '5xl' }}
              fontWeight="800"
              color="gray.900"
              letterSpacing="tight"
            >
              {t('plans.title')}{' '}
              <Box
                as="span"
                color="#FE4F18"
              >
                {t('plans.titleHighlight')}
              </Box>
            </Heading>
            <Text
              fontSize={{ base: 'lg', md: 'xl' }}
              color="gray.600"
              maxW="2xl"
              fontWeight="500"
            >
              {t('plans.description')}
            </Text>
          </VStack>

          {error && (
            <Box
              p={6}
              bg="red.50"
              borderRadius="xl"
              border="2px solid"
              borderColor="red.200"
              className="animate__animated animate__shakeX"
            >
              <Text color="red.600" textAlign="center" fontWeight="600">
                {error}
              </Text>
            </Box>
          )}

          {/* Responsive Grid Container */}
          <Box width="100%" mt={8}>
            <Grid
              templateColumns={{
                base: '1fr',
                sm: 'repeat(2, 1fr)',
                lg: 'repeat(3, 1fr)',
                xl: 'repeat(4, 1fr)',
              }}
              gap={6}
              className="animate__animated animate__fadeIn"
              style={{ animationDelay: '200ms' }}
            >
              {loading ? (
                <>
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <PlanCardSkeleton key={i} delay={i * 100} />
                  ))}
                </>
              ) : plansData.length > 0 ? (
                plansData.map((plan, index) => (
                  <PlanCard key={plan.id} plan={plan} delay={index * 100} lang={currentLanguage} />
                ))
              ) : (
                <Box gridColumn="1 / -1" textAlign="center" py={16}>
                  <VStack spacing={4}>
                    <Box
                      w="80px"
                      h="80px"
                      bg="gray.100"
                      borderRadius="full"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <MapPinIcon className="w-10 h-10 text-gray-400" />
                    </Box>
                    <Heading size="lg" color="gray.700">
                      {t('plans.empty')}
                    </Heading>
                    <Text fontSize="md" color="gray.500" fontWeight="500">
                      {t('plans.emptyDescription')}
                    </Text>
                  </VStack>
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