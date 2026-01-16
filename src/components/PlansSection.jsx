// src/components/PlansSection.jsx
import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Badge,
  HStack,
  VStack,
  IconButton,
} from '@chakra-ui/react';
import { CalendarIcon, MapPinIcon, ChevronLeftIcon, ChevronRightIcon, SignalIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import CountryFlag from './CountryFlag';
import { fetchHandpickedPackages } from '../services/esimAccessApi';
import { HANDPICKED_PLAN_SLUGS, calculateFinalPrice, formatPrice } from '../config/pricing';
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
      borderRadius="24px"
      overflow="visible"
      transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
      transform={isHovered ? 'translateY(-8px)' : 'translateY(0)'}
      shadow={isHovered ? '0 25px 50px rgba(254, 79, 24, 0.2)' : '0 4px 12px rgba(0, 0, 0, 0.06)'}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      opacity={isVisible ? 1 : 0}
      style={{
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`,
      }}
      minWidth="340px"
      width="340px"
      flexShrink={0}
    >
      <Box p={8}>
        <VStack align="stretch" spacing={5} height="100%">
          {/* Country Name and Flag */}
          <HStack spacing={3} mb={2}>
            <Heading
              size="xl"
              fontWeight="700"
              color="#151618"
              flex={1}
            >
              {plan.country}
            </Heading>
            <Box
              borderRadius="12px"
              overflow="hidden"
              shadow="sm"
              width="52px"
              height="38px"
              flexShrink={0}
              display="flex"
              alignItems="center"
              justifyContent="center"
              border="1px solid"
              borderColor="#E8E9EE"
              transition="all 0.3s"
              transform={isHovered ? 'scale(1.1)' : 'scale(1)'}
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
              px={4}
              py={2}
              borderRadius="full"
              border="2px solid"
              borderColor="#E8E9EE"
              bg="white"
            >
              <SignalIcon className="w-4 h-4 text-[#FE4F18]" />
              <Text fontSize="sm" fontWeight="700" color="#151618">
                {plan.speed}
              </Text>
            </HStack>
            <HStack
              spacing={2}
              px={4}
              py={2}
              borderRadius="full"
              border="2px solid"
              borderColor="#E8E9EE"
              bg="white"
            >
              <CalendarIcon className="w-4 h-4 text-[#FE4F18]" />
              <Text fontSize="sm" fontWeight="700" color="#151618">
                {plan.days} {t('plans.card.days')}
              </Text>
            </HStack>
          </HStack>

          {/* Data Amount */}
          <Box py={4}>
            <Text
              fontSize="sm"
              color="#6B7280"
              fontWeight="600"
              mb={2}
            >
              Количество трафика
            </Text>
            <Heading
              fontSize="5xl"
              fontWeight="700"
              color="#151618"
              letterSpacing="tight"
            >
              {plan.data}
            </Heading>
          </Box>

          {/* Price Section */}
          <Box mt="auto">
            <HStack align="baseline" spacing={2} mb={1}>
              <Text fontSize="xl" color="#6B7280" fontWeight="600">
                {plan.priceUSD}$
              </Text>
            </HStack>
            <HStack align="baseline" spacing={2} mb={4}>
              <Heading
                fontSize="3xl"
                fontWeight="700"
                color="#151618"
                letterSpacing="tight"
              >
                {plan.price}
              </Heading>
              <Text fontSize="md" color="#6B7280" fontWeight="600">
                {t('plans.card.currency')}
              </Text>
            </HStack>

            {/* Buy Button */}
            <Button
              size="lg"
              width="full"
              bg="#FE4F18"
              color="white"
              _hover={{
                bg: '#FF6B3D',
                transform: 'translateY(-2px)',
                shadow: '0 10px 30px rgba(254, 79, 24, 0.3)',
              }}
              transition="all 0.3s"
              borderRadius="full"
              fontWeight="700"
              fontSize="md"
              py={6}
              onClick={handleBuyClick}
            >
              {t('plans.card.buy')}
            </Button>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
};

// Loading Skeleton Component
const PlanCardSkeleton = ({ delay = 0 }) => {
  return (
    <Box
      borderRadius="2xl"
      overflow="hidden"
      border="2px solid"
      borderColor="gray.100"
      minWidth="340px"
      width="340px"
      flexShrink={0}
      className="animate__animated animate__fadeIn"
      style={{
        animationDelay: `${delay}ms`,
      }}
    >
      <Box p={8}>
        <VStack align="stretch" spacing={6}>
          <Box>
            <HStack spacing={4} mb={4}>
              <Box
                borderRadius="xl"
                width="56px"
                height="42px"
                bg="gray.200"
                flexShrink={0}
                animation="pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
              />
              <Box
                width="140px"
                height="28px"
                bg="gray.200"
                borderRadius="lg"
                animation="pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
              />
            </HStack>
            <Box
              width="60px"
              height="24px"
              bg="gray.200"
              borderRadius="full"
              animation="pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
            />
          </Box>
          <Box
            height="80px"
            bg="gray.100"
            borderRadius="xl"
            animation="pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
          />
          <Box
            height="60px"
            bg="gray.100"
            borderRadius="lg"
            animation="pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
          />
          <Box
            height="80px"
            bg="gray.100"
            borderRadius="lg"
            animation="pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
          />
        </VStack>
      </Box>
    </Box>
  );
};

// Main Plans Section Component
const PlansSection = () => {
  const { currentLanguage } = useLanguage();
  const [plansData, setPlansData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const scrollContainerRef = useRef(null);
  const autoScrollIntervalRef = useRef(null);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction, isAutoScroll = false) => {
    if (scrollContainerRef.current) {
      // For manual clicks: scroll 2 cards (728px), for auto-scroll: scroll 1px
      const scrollAmount = isAutoScroll ? 1 : 728; // 2 cards (364px * 2)
      const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: isAutoScroll ? 'auto' : 'smooth'
      });
    }
  };

  // Auto-scroll functionality
  useEffect(() => {
    if (!loading && plansData.length > 0 && !isHovered) {
      // Start auto-scrolling to the right slowly
      autoScrollIntervalRef.current = setInterval(() => {
        if (scrollContainerRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;

          // If reached the end, scroll back to start
          if (scrollLeft >= scrollWidth - clientWidth - 10) {
            scrollContainerRef.current.scrollTo({
              left: 0,
              behavior: 'smooth'
            });
          } else {
            // Scroll slowly to the right
            scroll('right', true);
          }
        }
      }, 30); // Scroll every 30ms for smooth animation

      return () => {
        if (autoScrollIntervalRef.current) {
          clearInterval(autoScrollIntervalRef.current);
        }
      };
    }
  }, [loading, plansData, isHovered]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      checkScroll();
      container.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        container.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [plansData]);

  useEffect(() => {
    const loadHandpickedPackages = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🎯 Loading handpicked packages by slug...');

        // Fetch packages using slugs
        const packages = await fetchHandpickedPackages(HANDPICKED_PLAN_SLUGS, currentLanguage);

        console.log('💰 PRICING CALCULATION:');
        
        // Transform packages with pricing
        const transformedPackages = packages.map(pkg => {
          const finalPriceUZS = calculateFinalPrice(pkg.priceUSD);
          const formattedPrice = formatPrice(finalPriceUZS);

          console.log(`💵 ${pkg.country}:`, {
            priceUSD: pkg.priceUSD,
            finalPriceUZS: finalPriceUZS,
            formattedPrice: formattedPrice,
          });

          return {
            ...pkg,
            priceUSD: pkg.priceUSD,
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
              fontWeight="700"
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

          <Box position="relative" mt={12}>
            {/* Navigation Arrows - Top Right */}
            <HStack
              position="absolute"
              top="-60px"
              right="0"
              spacing={2}
              zIndex={10}
            >
              {showLeftArrow && (
                <IconButton
                  onClick={() => scroll('left')}
                  bg="white"
                  shadow="lg"
                  borderRadius="full"
                  size="md"
                  _hover={{
                    bg: '#FFF4F0',
                    transform: 'scale(1.1)',
                  }}
                  transition="all 0.3s"
                  aria-label="Scroll left"
                >
                  <ChevronLeftIcon className="w-5 h-5 text-[#FE4F18]" />
                </IconButton>
              )}
              {showRightArrow && (
                <IconButton
                  onClick={() => scroll('right')}
                  bg="white"
                  shadow="lg"
                  borderRadius="full"
                  size="md"
                  _hover={{
                    bg: '#FFF4F0',
                    transform: 'scale(1.1)',
                  }}
                  transition="all 0.3s"
                  aria-label="Scroll right"
                >
                  <ChevronRightIcon className="w-5 h-5 text-[#FE4F18]" />
                </IconButton>
              )}
            </HStack>

            {/* Scrollable Container */}
            <Box
              ref={scrollContainerRef}
              overflowX="auto"
              overflowY="hidden"
              css={{
                '&::-webkit-scrollbar': {
                  display: 'none',
                },
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
              pb={4}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <HStack
                spacing={6}
                align="stretch"
                className="animate__animated animate__fadeIn"
                style={{ animationDelay: '200ms' }}
              >
                {loading ? (
                  <>
                    {[0, 1, 2, 3, 4].map((i) => (
                      <PlanCardSkeleton key={i} delay={i * 100} />
                    ))}
                  </>
                ) : plansData.length > 0 ? (
                  plansData.map((plan, index) => (
                    <PlanCard key={plan.id} plan={plan} delay={index * 100} lang={currentLanguage} />
                  ))
                ) : (
                  <Box w="100%" textAlign="center" py={16}>
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
              </HStack>
            </Box>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default PlansSection;