// src/components/PlansSection.jsx
import React, { useState, useEffect, useRef } from 'react';
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
import { Calendar, Wifi, MapPin, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Flag from 'react-world-flags';
import { fetchHandpickedPackages } from '../services/esimAccessApi';
import { HANDPICKED_PLAN_SLUGS, calculateFinalPrice, formatPrice } from '../config/pricing';
import { getTranslation, DEFAULT_LANGUAGE } from '../config/i18n';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

// Enhanced Plan Card Component
const PlanCard = ({ plan, delay = 0, lang = DEFAULT_LANGUAGE }) => {
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
      overflow="hidden"
      border="2px solid"
      borderColor={isHovered ? 'purple.200' : 'gray.100'}
      transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
      transform={isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)'}
      shadow={isHovered ? '0 25px 50px rgba(102, 126, 234, 0.25)' : '0 4px 12px rgba(0, 0, 0, 0.08)'}
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
        <VStack align="stretch" spacing={6} height="100%">
          <Box>
            <HStack spacing={3} mb={4} flexWrap="nowrap">
              <Box
                borderRadius="xl"
                overflow="hidden"
                shadow="md"
                width="56px"
                height="42px"
                flexShrink={0}
                display="flex"
                alignItems="center"
                justifyContent="center"
                border="2px solid"
                borderColor="gray.100"
                transition="all 0.3s"
                transform={isHovered ? 'scale(1.1)' : 'scale(1)'}
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
              <HStack spacing={2} overflow="hidden" flexGrow={1}>
                <MapPin size={16} color="#9333ea" flexShrink={0} />
                <Heading 
                  size="xl" 
                  fontWeight="800" 
                  color="gray.900"
                  whiteSpace="nowrap"
                  overflow="hidden"
                  textOverflow="ellipsis"
                >
                  {plan.country}
                </Heading>
              </HStack>
            </HStack>

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
          </Box>

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

          <HStack
            spacing={3}
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

          <Box
            mt="auto"
            pt={4}
            borderTop="2px dashed"
            borderColor="gray.200"
          >
            <VStack align="stretch" spacing={3}>
              <VStack align="flex-start" spacing={0.5}>
                <Text fontSize="xs" color="gray.500" fontWeight="600">
                  {t('plans.card.price')}
                </Text>
                <HStack spacing={1.5} align="baseline" flexWrap="nowrap">
                  <Heading
                    fontSize="17px"
                    fontWeight="800"
                    color="gray.800"
                    letterSpacing="tight"
                    whiteSpace="nowrap"
                  >
                    {plan.price}
                  </Heading>
                  <Text fontSize="md" color="gray.600" fontWeight="600" fontsize="14px" whiteSpace="nowrap">
                    {t('plans.card.currency')}
                  </Text>
                </HStack>
              </VStack>

              <Button
                size="md"
                width="full"
                bg={isHovered ? 'purple.600' : 'gray.100'}
                color={isHovered ? 'white' : 'gray.700'}
                _hover={{
                  bg: 'purple.700',
                  color: 'white',
                }}
                transition="all 0.3s"
                borderRadius="lg"
                fontWeight="700"
                rightIcon={<ArrowRight size={16} />}
                onClick={handleBuyClick}
              >
                {t('plans.card.buy')}
              </Button>
            </VStack>
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
  const [plansData, setPlansData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const scrollContainerRef = useRef(null);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 364; // Card width (340px) + gap (24px)
      const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

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
        const packages = await fetchHandpickedPackages(HANDPICKED_PLAN_SLUGS, DEFAULT_LANGUAGE);

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
            price: formattedPrice,
          };
        });

        setPlansData(transformedPackages);
        console.log(`✅ Loaded ${transformedPackages.length} handpicked plans`);
        console.log('📦 FINAL PLANS DATA:', transformedPackages);
      } catch (err) {
        console.error('Error loading handpicked packages:', err);
        setError(getTranslation(DEFAULT_LANGUAGE, 'plans.error'));
      } finally {
        setLoading(false);
      }
    };

    loadHandpickedPackages();
  }, []);

  const t = (key) => getTranslation(DEFAULT_LANGUAGE, key);

  return (
    <Box as="section" py={24} bg="gray.50" id="plans" position="relative" overflow="hidden">
      <Box
        position="absolute"
        top="10%"
        left="-10%"
        width="500px"
        height="500px"
        bg="purple.50"
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
        bg="blue.50"
        borderRadius="full"
        filter="blur(100px)"
        opacity="0.4"
        pointerEvents="none"
      />

      <Container maxW="8xl" position="relative" overflow="hidden">
        <VStack spacing={16}>
          <VStack spacing={4} textAlign="center" className="animate__animated animate__fadeIn">
            <Badge
              colorScheme="purple"
              fontSize="sm"
              fontWeight="800"
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
                background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                backgroundClip="text"
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
                    bg: 'purple.50',
                    transform: 'scale(1.1)',
                  }}
                  transition="all 0.3s"
                  aria-label="Scroll left"
                >
                  <ChevronLeft size={20} color="#7c3aed" />
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
                    bg: 'purple.50',
                    transform: 'scale(1.1)',
                  }}
                  transition="all 0.3s"
                  aria-label="Scroll right"
                >
                  <ChevronRight size={20} color="#7c3aed" />
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
                    <PlanCard key={plan.id} plan={plan} delay={index * 100} lang={DEFAULT_LANGUAGE} />
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
                        <MapPin size={40} color="#9ca3af" />
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