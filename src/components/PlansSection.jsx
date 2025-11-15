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
import { Calendar, Wifi, MapPin, ArrowRight } from 'lucide-react';
import Flag from 'react-world-flags';
import { fetchHandpickedPackages } from '../services/esimAccessApi';
import { HANDPICKED_PLAN_CODES, calculateFinalPrice, formatPrice } from '../config/pricing';
import { getTranslation, DEFAULT_LANGUAGE } from '../config/i18n';

// Enhanced Plan Card Component
const PlanCard = ({ plan, delay = 0, lang = DEFAULT_LANGUAGE }) => {
  const [isHovered, setIsHovered] = useState(false);
  const t = (key) => getTranslation(lang, key);

  return (
    <Card.Root
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

      <Card.Body p={8}>
        <VStack align="stretch" gap={6} height="100%">
          <Box>
            <HStack gap={3} mb={4} flexWrap="nowrap">
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
              <HStack gap={2} overflow="hidden" flexGrow={1}>
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
              colorPalette="purple"
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
      </Card.Body>
    </Card.Root>
  );
};

// Loading Skeleton Component
const PlanCardSkeleton = ({ delay = 0 }) => {
  return (
    <Card.Root
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
      <Card.Body p={8}>
        <VStack align="stretch" gap={6}>
          <Box>
            <HStack gap={4} mb={4}>
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
      </Card.Body>
    </Card.Root>
  );
};

// Main Plans Section Component
const PlansSection = () => {
  const [plansData, setPlansData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const lang = DEFAULT_LANGUAGE;
  
  const t = (key) => getTranslation(lang, key);

  useEffect(() => {
    const loadHandpickedPackages = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🎯 Loading handpicked packages...');
        
        const packages = await fetchHandpickedPackages(HANDPICKED_PLAN_CODES, lang);

        const transformedPackages = packages.map(pkg => ({
          ...pkg,
          price: formatPrice(calculateFinalPrice(pkg.priceUSD)),
        }));

        setPlansData(transformedPackages);
        console.log(`✅ Loaded ${transformedPackages.length} handpicked plans`);
      } catch (err) {
        console.error('Error loading handpicked packages:', err);
        setError(t('plans.error'));
      } finally {
        setLoading(false);
      }
    };

    loadHandpickedPackages();
  }, [lang, t]);

  return (
    <Box as="section" py={24} bg="gray.50" id="plans" position="relative">
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

      <Container maxW="8xl" position="relative">
        <VStack gap={16}>
          <VStack gap={4} textAlign="center" className="animate__animated animate__fadeIn">
            <Badge
              colorPalette="purple"
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

          <Grid
            templateColumns={{ 
              base: '1fr', 
              md: 'repeat(2, 1fr)', 
              lg: 'repeat(3, 1fr)',
              xl: 'repeat(5, 1fr)' 
            }}
            gap={6}
            mt={12}
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
                <PlanCard key={plan.id} plan={plan} delay={index * 100} lang={lang} />
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
                    {t('plans.empty')}
                  </Heading>
                  <Text fontSize="md" color="gray.500" fontWeight="500">
                    {t('plans.emptyDescription')}
                  </Text>
                </VStack>
              </Box>
            )}
          </Grid>
        </VStack>
      </Container>
    </Box>
  );
};

export default PlansSection;