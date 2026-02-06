// src/pages/PackagePage.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Text,
  Button,
  VStack,
  HStack,
  Grid,
  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Spinner,
} from '@chakra-ui/react';
import { useCurrency } from '../contexts/CurrencyContext';
import { calculateFinalPriceUSD, formatPrice } from '../config/pricing';
import { smartRoundDollar } from '../components/DataPlanCard';
import {
  ArrowLeft,
  Wifi,
  Globe,
  Radio,
  Phone,
  CheckCircle,
  ShoppingCart,
  Mail,
  Settings,
  QrCode,
  Download,
  Smartphone,
  LogIn,
  AlertCircle,
  Shield,
  Zap,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import CountryFlag from '../components/CountryFlag';
import { getCountryName, getTranslation } from '../config/i18n';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { createOrder } from '../services/orderService';
import { REGION_DEFINITIONS } from '../services/packageCacheService.js';

const PackagePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentLanguage } = useLanguage();
  const { convertToUZS } = useCurrency();

  const [isOrdering, setIsOrdering] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [priceUZS, setPriceUZS] = useState(0);
  const [formattedPriceUZS, setFormattedPriceUZS] = useState('0');

  // Modal controls
  const {
    isOpen: isLoginModalOpen,
    onOpen: onLoginModalOpen,
    onClose: onLoginModalClose
  } = useDisclosure();

  const {
    isOpen: isSuccessModalOpen,
    onOpen: onSuccessModalOpen,
    onClose: onSuccessModalClose
  } = useDisclosure();

  const {
    isOpen: isErrorModalOpen,
    onOpen: onErrorModalOpen,
    onClose: onErrorModalClose
  } = useDisclosure();

  const plan = location.state?.plan;
  const countryCode = location.state?.countryCode;

  // Get ORIGINAL price (without margin) - handle multiple data formats
  const getOriginalPriceUSD = () => {
    if (!plan) return 0;

    if (plan.originalPriceUSD) {
      console.log('[PackagePage] Using originalPriceUSD:', plan.originalPriceUSD);
      return parseFloat(plan.originalPriceUSD);
    }

    if (plan.originalPrice) {
      const price = plan.originalPrice / 10000;
      console.log('[PackagePage] Using originalPrice / 10000:', price);
      return price;
    }

    if (plan.rawPackage && plan.priceUSD) {
      console.log('[PackagePage] Using priceUSD from RegionalPackagesPage (no margin):', plan.priceUSD);
      return parseFloat(plan.priceUSD);
    }

    const reversedPrice = parseFloat(plan.priceUSD) / 1.5;
    console.log('[PackagePage] Reversed from priceUSD / 1.5:', reversedPrice);
    return reversedPrice;
  };

  const originalPriceUSD = getOriginalPriceUSD();
  const priceUSDWithMargin = calculateFinalPriceUSD(originalPriceUSD);

  useEffect(() => {
    if (!plan) return;

    const convertPrice = async () => {
      try {
        const convertedPrice = await convertToUZS(priceUSDWithMargin);
        setPriceUZS(convertedPrice);
        setFormattedPriceUZS(formatPrice(convertedPrice));
        console.log('[PackagePage] Price converted:', priceUSDWithMargin, 'USD =', convertedPrice, 'UZS');
      } catch (error) {
        console.error('[PackagePage] Error converting price:', error);
        setPriceUZS(0);
        setFormattedPriceUZS('0');
      }
    };

    convertPrice();
  }, [plan, priceUSDWithMargin, convertToUZS]);

  const t = (key) => getTranslation(currentLanguage, key);

  // Redirect if no plan data
  if (!plan) {
    return (
      <Box minH="100vh" bg="#F9F9F9" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4} textAlign="center" p={8}>
          <Text fontSize="24px" fontWeight="700" color="#1C1C1E">
            {t('packagePage.notFound')}
          </Text>
          <Text color="#8E8E93" fontSize="15px">
            {t('packagePage.notFoundDescription')}
          </Text>
          <Button
            onClick={() => navigate('/')}
            bg="#FE4F18"
            color="white"
            borderRadius="full"
            px={8}
            py={5}
            h="auto"
            fontWeight="700"
            _hover={{ bg: '#E44615' }}
          >
            {t('packagePage.backToHome')}
          </Button>
        </VStack>
      </Box>
    );
  }

  // Determine if this is regional or global plan
  const isGlobalPlan = countryCode === 'GLOBAL';
  const isRegionalPlan = countryCode && REGION_DEFINITIONS[countryCode] && !isGlobalPlan;

  // Get plan title based on type
  let planTitle = '';
  if (isGlobalPlan) {
    planTitle = currentLanguage === 'uz' ? 'Global reja' : 'Глобальный план';
  } else if (isRegionalPlan) {
    const region = REGION_DEFINITIONS[countryCode];
    const regionName = currentLanguage === 'uz' ? region.nameUz : region.nameRu;
    planTitle = currentLanguage === 'uz' ? `Mintaqaviy reja ${regionName}` : `Региональный план ${regionName}`;
  } else {
    const countryName = getCountryName(countryCode, currentLanguage);
    planTitle = `eSIM ${t('packagePage.esimFor')} ${countryName}`;
  }

  const operatorName = plan.operatorList?.[0]?.operatorName || t('packagePage.provider.notSpecified');
  const networkType = plan.operatorList?.[0]?.networkType || '4G/LTE';

  // Determine package type text based on dataType
  const getPackageTypeText = () => {
    if (plan.dataType === 4) {
      return t('plans.dataTypeBadge.dailyUnlimited');
    }
    if (plan.dataType === 2) {
      return currentLanguage === 'uz' ? 'Kunlik limit (tezlik kamayadi)' : 'Дневной лимит (снижение скорости)';
    }
    if (plan.dataType === 3) {
      return currentLanguage === 'uz' ? 'Kunlik limit (to\'xtatiladi)' : 'Дневной лимит (отключение)';
    }
    return plan.smsSupported || plan.callsSupported
      ? t('packagePage.details.dataWithCalls')
      : t('packagePage.details.dataOnly');
  };
  const packageType = getPackageTypeText();

  // Extract covered countries for regional/global plans
  const coveredCountries = new Set();
  if (plan.operatorList && Array.isArray(plan.operatorList)) {
    plan.operatorList.forEach(op => {
      if (op.locationCode && !op.locationCode.startsWith('!')) {
        let code = op.locationCode;
        const hyphenIndex = code.indexOf('-');
        if (hyphenIndex > 0) {
          code = code.substring(hyphenIndex + 1);
        }
        coveredCountries.add(code);
      }
    });
  }
  const countryList = Array.from(coveredCountries);

  // Parse data value and unit
  const parseDataValue = (data) => {
    if (!data) return { value: plan.dataGB || '0', unit: 'GB' };
    const dataStr = String(data).trim();
    if (/MB|МБ/i.test(dataStr)) {
      return { value: dataStr.replace(/\s?(MB|МБ)/i, '').trim(), unit: 'MB' };
    }
    return { value: dataStr.replace(/\s?(GB|ГБ)/i, '').trim(), unit: 'GB' };
  };
  const { value: dataValue, unit: dataUnit } = parseDataValue(plan.data);

  // Parse highest speed
  const parseHighestSpeed = (speed) => {
    if (!speed) return '4G';
    const networks = speed.match(/(5G|4G|LTE|3G|2G)/gi) || [];
    if (networks.length === 0) return speed;
    const priority = ['5G', '4G', 'LTE', '3G', '2G'];
    for (const net of priority) {
      if (networks.some(n => n.toUpperCase() === net)) return net;
    }
    return networks[0] || speed;
  };
  const highestSpeed = parseHighestSpeed(plan.speed || networkType);

  const installationSteps = [
    { icon: Mail, text: t('packagePage.installation.step1') },
    { icon: Settings, text: t('packagePage.installation.step2') },
    { icon: QrCode, text: t('packagePage.installation.step3') },
    { icon: Download, text: t('packagePage.installation.step4') },
    { icon: Smartphone, text: t('packagePage.installation.step5') },
  ];

  // Handle purchase button click
  const handlePurchaseClick = async () => {
    if (!user) {
      onLoginModalOpen();
      return;
    }

    setIsOrdering(true);
    setOrderError(null);

    try {
      console.log('[ORDER] Sending order with ORIGINAL price:', {
        originalPriceUSD,
        priceUSDWithMargin,
        packageCode: plan.packageCode,
      });

      const orderData = {
        userId: user.id,
        userEmail: user.email,
        packageCode: plan.packageCode || plan.id,
        packageName: plan.name || `${plan.data} - ${plan.days} ${t('packagePage.details.days')}`,
        countryCode: countryCode,
        dataAmount: plan.data,
        validityDays: plan.days,
        priceUzs: priceUZS,
        priceUsd: originalPriceUSD,
      };

      await createOrder(orderData);
      onSuccessModalOpen();
    } catch (error) {
      console.error('[ORDER] Failed:', error);
      setOrderError(error.message || 'Order failed');
      onErrorModalOpen();
    } finally {
      setIsOrdering(false);
    }
  };

  // --- Detail row component ---
  const DetailRow = ({ icon: Icon, label, value, iconColor = '#FE4F18', badge = false }) => (
    <HStack justify="space-between" py={3}>
      <HStack spacing={3}>
        <Box
          bg="#F2F2F7"
          p={2}
          borderRadius="12px"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Icon size={18} color={iconColor} />
        </Box>
        <Text fontSize="15px" fontWeight="500" color="#8E8E93">
          {label}
        </Text>
      </HStack>
      {badge ? (
        <Box bg="#F2F2F7" px={3} py={1.5} borderRadius="10px">
          <Text fontSize="14px" fontWeight="700" color="#1C1C1E">{value}</Text>
        </Box>
      ) : (
        <Text fontSize="15px" fontWeight="700" color="#1C1C1E">{value}</Text>
      )}
    </HStack>
  );

  return (
    <Box minH="100vh" bg="#F9F9F9" fontFamily="'Manrope', sans-serif">
      {/* Back Header */}
      <Box bg="white" borderBottom="1px solid #E8E9EE" py={3}>
        <Container maxW="6xl">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            fontWeight="600"
            color="#1C1C1E"
            _hover={{ bg: '#F2F2F7' }}
            borderRadius="12px"
            px={3}
          >
            <HStack spacing={2}>
              <ArrowLeft size={20} color="#1C1C1E" />
              <Text>{t('packagePage.back')}</Text>
            </HStack>
          </Button>
        </Container>
      </Box>

      <Container maxW="6xl" py={8}>
        <Grid templateColumns={{ base: '1fr', lg: '1fr 380px' }} gap={8}>
          {/* Main Content */}
          <Box>
            {/* Hero Card — Data & Duration */}
            <Box
              bg="white"
              borderRadius="32px"
              p={{ base: 6, md: 8 }}
              mb={6}
              boxShadow="0 4px 12px rgba(0, 0, 0, 0.06)"
            >
              {/* Title with flag */}
              <HStack spacing={4} mb={6}>
                {!isRegionalPlan && !isGlobalPlan && (
                  <Box
                    borderRadius="14px"
                    overflow="hidden"
                    width="56px"
                    height="42px"
                    border="2px solid #E8E9EE"
                    flexShrink={0}
                  >
                    <CountryFlag
                      code={countryCode}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Box>
                )}
                {(isRegionalPlan || isGlobalPlan) && (
                  <Box
                    bg="#F2F2F7"
                    p={2.5}
                    borderRadius="14px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink={0}
                  >
                    <Globe size={24} color="#FE4F18" />
                  </Box>
                )}
                <VStack align="flex-start" spacing={0}>
                  <Text fontSize="22px" fontWeight="700" color="#1C1C1E">
                    {planTitle}
                  </Text>
                  <Text color="#8E8E93" fontSize="14px" fontWeight="500">
                    {plan.name || `${plan.data} / ${plan.days} ${t('packagePage.details.days')}`}
                  </Text>
                </VStack>
              </HStack>

              {/* Data & Duration - Big Numbers */}
              <Grid templateColumns="1fr 1fr" gap={4} mb={6}>
                <Box bg="#F2F2F7" borderRadius="20px" p={5}>
                  <Text fontSize="13px" fontWeight="500" color="#8E8E93" mb={1}>
                    {t('packagePage.details.dataVolume')}
                  </Text>
                  <HStack align="baseline" spacing={1}>
                    <Text fontSize="36px" fontWeight="800" color="#1C1C1E" lineHeight="1">
                      {dataValue}
                    </Text>
                    <Text fontSize="18px" fontWeight="600" color="#1C1C1E">
                      {dataUnit}
                    </Text>
                  </HStack>
                </Box>
                <Box bg="#F2F2F7" borderRadius="20px" p={5}>
                  <Text fontSize="13px" fontWeight="500" color="#8E8E93" mb={1}>
                    {t('packagePage.details.validity')}
                  </Text>
                  <HStack align="baseline" spacing={1}>
                    <Text fontSize="36px" fontWeight="800" color="#1C1C1E" lineHeight="1">
                      {plan.days}
                    </Text>
                    <Text fontSize="18px" fontWeight="600" color="#1C1C1E">
                      {t('packagePage.details.days')}
                    </Text>
                  </HStack>
                </Box>
              </Grid>

              {/* Badges Row */}
              <HStack spacing={3} flexWrap="wrap">
                {/* Network badge */}
                <HStack
                  spacing={2}
                  px={4}
                  py={2.5}
                  borderRadius="14px"
                  bg="#F2F2F7"
                >
                  <Wifi size={18} color="#FE4F18" />
                  <Text fontSize="15px" fontWeight="600" color="#1C1C1E">
                    {highestSpeed}
                  </Text>
                </HStack>

                {/* Data type badge */}
                {plan.dataType === 4 && (
                  <HStack spacing={2} px={4} py={2.5} borderRadius="14px" bg="#FFF4F0">
                    <Zap size={16} color="#FE4F18" />
                    <Text fontSize="14px" fontWeight="600" color="#FE4F18">
                      {t('plans.dataTypeBadge.dailyUnlimited')}
                    </Text>
                  </HStack>
                )}
                {(plan.dataType === 2 || plan.dataType === 3) && (
                  <HStack spacing={2} px={4} py={2.5} borderRadius="14px" bg="#FFF4F0">
                    <AlertCircle size={16} color="#FE4F18" />
                    <Text fontSize="14px" fontWeight="600" color="#FE4F18">
                      {t('plans.dataTypeBadge.dailyLimit')}
                    </Text>
                  </HStack>
                )}

                {/* Package type badge */}
                <HStack spacing={2} px={4} py={2.5} borderRadius="14px" bg="#F2F2F7">
                  <Phone size={16} color="#8E8E93" />
                  <Text fontSize="14px" fontWeight="500" color="#1C1C1E">
                    {packageType}
                  </Text>
                </HStack>
              </HStack>
            </Box>

            {/* Provider & Coverage Info */}
            <Box
              bg="white"
              borderRadius="32px"
              p={{ base: 6, md: 8 }}
              mb={6}
              boxShadow="0 4px 12px rgba(0, 0, 0, 0.06)"
            >
              <Text fontSize="18px" fontWeight="700" color="#1C1C1E" mb={4}>
                {isRegionalPlan || isGlobalPlan
                  ? t('packagePage.provider.coverageTitle')
                  : t('packagePage.provider.title')}
              </Text>

              <VStack align="stretch" spacing={0} divider={<Divider borderColor="#F2F2F7" />}>
                {/* Operator - only for single country */}
                {!isRegionalPlan && !isGlobalPlan && (
                  <DetailRow
                    icon={Radio}
                    label={t('packagePage.provider.operator')}
                    value={operatorName}
                  />
                )}

                {/* Coverage */}
                <DetailRow
                  icon={Globe}
                  label={t('packagePage.provider.coverage')}
                  value={
                    isGlobalPlan || isRegionalPlan
                      ? `${countryList.length} ${t('packagePage.provider.countries')}`
                      : getCountryName(countryCode, currentLanguage)
                  }
                />

                {/* Speed */}
                <DetailRow
                  icon={Wifi}
                  label={t('packagePage.provider.speed')}
                  value={plan.speed || '4G/LTE'}
                  badge
                />
              </VStack>

              {/* Covered countries list */}
              {(isRegionalPlan || isGlobalPlan) && countryList.length > 0 && (
                <Box mt={5}>
                  <HStack justify="space-between" align="center" mb={3}>
                    <Text fontSize="15px" fontWeight="600" color="#1C1C1E">
                      {t('packagePage.provider.coveredCountries')}
                    </Text>
                    <Box bg="#FFF4F0" px={3} py={1} borderRadius="10px">
                      <Text fontSize="13px" fontWeight="700" color="#FE4F18">
                        {countryList.length} {t('packagePage.provider.countries')}
                      </Text>
                    </Box>
                  </HStack>
                  <Box
                    maxH="360px"
                    overflowY="auto"
                    pr={1}
                    css={{
                      '&::-webkit-scrollbar': { width: '4px' },
                      '&::-webkit-scrollbar-track': { background: 'transparent' },
                      '&::-webkit-scrollbar-thumb': { background: '#D1D3D9', borderRadius: '10px' },
                    }}
                  >
                    <Grid templateColumns="repeat(auto-fill, minmax(150px, 1fr))" gap={2.5}>
                      {countryList.map((code) => (
                        <HStack
                          key={code}
                          spacing={2.5}
                          bg="#F2F2F7"
                          px={3}
                          py={2.5}
                          borderRadius="14px"
                        >
                          <Box
                            borderRadius="6px"
                            overflow="hidden"
                            width="24px"
                            height="18px"
                            flexShrink={0}
                            border="1px solid #E8E9EE"
                          >
                            <CountryFlag
                              code={code}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </Box>
                          <Text fontSize="13px" fontWeight="600" color="#1C1C1E">
                            {getCountryName(code, currentLanguage)}
                          </Text>
                        </HStack>
                      ))}
                    </Grid>
                  </Box>
                </Box>
              )}

              {/* Multiple operators */}
              {!isRegionalPlan && !isGlobalPlan && plan.operatorList && plan.operatorList.length > 1 && (
                <Box mt={4}>
                  <Text fontSize="14px" fontWeight="600" color="#8E8E93" mb={2}>
                    {t('packagePage.provider.allOperators')}
                  </Text>
                  <HStack flexWrap="wrap" gap={2}>
                    {plan.operatorList.map((op, idx) => (
                      <Box key={idx} bg="#F2F2F7" px={3} py={1.5} borderRadius="10px">
                        <Text fontSize="13px" fontWeight="600" color="#1C1C1E">
                          {op.operatorName} {op.networkType && `(${op.networkType})`}
                        </Text>
                      </Box>
                    ))}
                  </HStack>
                </Box>
              )}
            </Box>

            {/* Daily Limit Explanation */}
            {(plan.dataType === 2 || plan.dataType === 3 || plan.dataType === 4) && (
              <Box
                bg="white"
                borderRadius="32px"
                p={{ base: 6, md: 8 }}
                mb={6}
                boxShadow="0 4px 12px rgba(0, 0, 0, 0.06)"
              >
                <HStack spacing={3} mb={5}>
                  <Box bg="#FFF4F0" p={2.5} borderRadius="14px">
                    <AlertCircle size={20} color="#FE4F18" />
                  </Box>
                  <Text fontSize="18px" fontWeight="700" color="#1C1C1E">
                    {t('packagePage.dailyLimit.title')}
                  </Text>
                </HStack>

                <VStack align="stretch" spacing={3}>
                  {[
                    t('packagePage.dailyLimit.resetInfo'),
                    plan.dataType === 2 && t('packagePage.dailyLimit.speedReduced'),
                    plan.dataType === 3 && t('packagePage.dailyLimit.serviceCutoff'),
                    plan.dataType === 4 && (
                      currentLanguage === 'uz'
                        ? 'Kunlik internet cheklanmagan, lekin adolatli foydalanish siyosati amal qiladi'
                        : 'Безлимитный интернет в день, но действует политика справедливого использования'
                    ),
                    t('packagePage.dailyLimit.difference'),
                  ].filter(Boolean).map((text, idx) => (
                    <HStack key={idx} align="flex-start" spacing={3}>
                      <Box
                        w="6px"
                        h="6px"
                        borderRadius="full"
                        bg="#FE4F18"
                        mt={2}
                        flexShrink={0}
                      />
                      <Text fontSize="14px" color="#6B7280" lineHeight="1.6">
                        {text}
                      </Text>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            )}

            {/* Installation Instructions */}
            <Box
              bg="white"
              borderRadius="32px"
              p={{ base: 6, md: 8 }}
              boxShadow="0 4px 12px rgba(0, 0, 0, 0.06)"
            >
              <Text fontSize="18px" fontWeight="700" color="#1C1C1E" mb={5}>
                {t('packagePage.installation.title')}
              </Text>

              <VStack align="stretch" spacing={4}>
                {installationSteps.map((step, index) => (
                  <HStack key={index} spacing={4} align="flex-start">
                    <Box
                      bg="#F2F2F7"
                      minW="44px"
                      h="44px"
                      borderRadius="14px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      flexShrink={0}
                    >
                      <step.icon size={20} color="#FE4F18" />
                    </Box>
                    <VStack align="flex-start" spacing={0} pt={1}>
                      <Text fontSize="13px" fontWeight="600" color="#FE4F18">
                        {t('packagePage.installation.step')} {index + 1}
                      </Text>
                      <Text fontSize="15px" fontWeight="500" color="#1C1C1E">
                        {step.text}
                      </Text>
                    </VStack>
                  </HStack>
                ))}
              </VStack>
            </Box>
          </Box>

          {/* Sidebar — Purchase Card */}
          <Box>
            <Box
              bg="white"
              borderRadius="32px"
              p={7}
              boxShadow="0 4px 12px rgba(0, 0, 0, 0.06)"
              position="sticky"
              top="100px"
            >
              <VStack align="stretch" spacing={6}>
                {/* Price */}
                <Box textAlign="center">
                  <Text fontSize="13px" color="#8E8E93" fontWeight="600" mb={2}>
                    {t('packagePage.purchase.packagePrice')}
                  </Text>
                  <HStack justify="center" spacing={1} mb={1}>
                    <Text fontSize="16px" color="#8E8E93" fontWeight="500">
                      {formattedPriceUZS}
                    </Text>
                    <Text fontSize="14px" color="#8E8E93" fontWeight="500" textTransform="uppercase">
                      UZS
                    </Text>
                  </HStack>
                  <HStack justify="center" spacing={1}>
                    <Text fontSize="40px" fontWeight="800" color="#1C1C1E" lineHeight="1.1">
                      ${smartRoundDollar(priceUSDWithMargin)}
                    </Text>
                  </HStack>
                </Box>

                <Box h="1px" bg="#F2F2F7" />

                {/* Quick Summary */}
                <VStack align="stretch" spacing={3}>
                  <HStack justify="space-between">
                    <Text color="#8E8E93" fontSize="14px" fontWeight="500">
                      {t('packagePage.purchase.data')}
                    </Text>
                    <Text fontWeight="700" fontSize="15px" color="#1C1C1E">{plan.data}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text color="#8E8E93" fontSize="14px" fontWeight="500">
                      {t('packagePage.purchase.period')}
                    </Text>
                    <Text fontWeight="700" fontSize="15px" color="#1C1C1E">
                      {plan.days} {t('packagePage.details.days')}
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text color="#8E8E93" fontSize="14px" fontWeight="500">
                      {t('packagePage.purchase.region')}
                    </Text>
                    <Text fontWeight="700" fontSize="15px" color="#1C1C1E">
                      {isGlobalPlan
                        ? (currentLanguage === 'uz' ? 'Global' : 'Глобальный')
                        : isRegionalPlan
                        ? (currentLanguage === 'uz' ? REGION_DEFINITIONS[countryCode].nameUz : REGION_DEFINITIONS[countryCode].nameRu)
                        : getCountryName(countryCode, currentLanguage)}
                    </Text>
                  </HStack>
                </VStack>

                {/* Buy Button */}
                <Button
                  size="lg"
                  bg="#FE4F18"
                  color="white"
                  py={7}
                  fontWeight="700"
                  fontSize="16px"
                  borderRadius="full"
                  _hover={{
                    bg: '#E44615',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 10px 30px rgba(254, 79, 24, 0.35)',
                  }}
                  _active={{
                    bg: '#C93D12',
                    transform: 'translateY(0)',
                  }}
                  _disabled={{
                    opacity: 0.6,
                    cursor: 'not-allowed',
                    transform: 'none',
                  }}
                  transition="all 0.3s ease"
                  onClick={handlePurchaseClick}
                  isDisabled={isOrdering}
                >
                  {isOrdering ? (
                    <HStack spacing={2}>
                      <Spinner size="sm" />
                      <Text>{t('packagePage.purchase.ordering')}</Text>
                    </HStack>
                  ) : (
                    <HStack spacing={2}>
                      <ShoppingCart size={20} />
                      <Text>{t('packagePage.purchase.buy')}</Text>
                    </HStack>
                  )}
                </Button>

                {/* Trust badges */}
                <HStack justify="center" spacing={4}>
                  <HStack spacing={1.5}>
                    <CheckCircle size={14} color="#10B981" />
                    <Text fontSize="12px" color="#8E8E93" fontWeight="500">
                      {t('packagePage.purchase.instantDelivery')}
                    </Text>
                  </HStack>
                  <HStack spacing={1.5}>
                    <Shield size={14} color="#10B981" />
                    <Text fontSize="12px" color="#8E8E93" fontWeight="500">
                      eSIM
                    </Text>
                  </HStack>
                </HStack>
              </VStack>
            </Box>
          </Box>
        </Grid>
      </Container>

      {/* Login Required Modal */}
      <Modal isOpen={isLoginModalOpen} onClose={onLoginModalClose} isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(8px)" />
        <ModalContent mx={4} borderRadius="28px" p={2}>
          <ModalHeader>
            <HStack spacing={3}>
              <Box bg="#F2F2F7" p={2.5} borderRadius="14px">
                <LogIn size={22} color="#FE4F18" />
              </Box>
              <Text fontSize="18px" fontWeight="700" color="#1C1C1E">
                {t('packagePage.loginModal.title')}
              </Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton top={5} right={5} />
          <ModalBody pb={4}>
            <Text color="#6B7280" fontSize="15px">
              {t('packagePage.loginModal.message')}
            </Text>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button
              variant="ghost"
              onClick={onLoginModalClose}
              borderRadius="full"
              color="#8E8E93"
              fontWeight="600"
            >
              {t('packagePage.loginModal.cancel')}
            </Button>
            <Button
              bg="#FE4F18"
              color="white"
              borderRadius="full"
              px={6}
              fontWeight="700"
              _hover={{ bg: '#E44615' }}
              onClick={() => navigate('/login')}
            >
              {t('packagePage.loginModal.login')}
            </Button>
            <Button
              variant="outline"
              borderColor="#FE4F18"
              color="#FE4F18"
              borderWidth="2px"
              borderRadius="full"
              px={6}
              fontWeight="700"
              _hover={{ bg: '#FFF4F0' }}
              onClick={() => navigate('/signup')}
            >
              {t('packagePage.loginModal.signup')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Order Success Modal */}
      <Modal isOpen={isSuccessModalOpen} onClose={onSuccessModalClose} isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(8px)" />
        <ModalContent mx={4} borderRadius="28px" p={2}>
          <ModalHeader>
            <HStack spacing={3}>
              <Box bg="#ECFDF5" p={2.5} borderRadius="14px">
                <CheckCircle size={22} color="#10B981" />
              </Box>
              <Text fontSize="18px" fontWeight="700" color="#1C1C1E">
                {t('packagePage.successModal.title')}
              </Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton top={5} right={5} />
          <ModalBody pb={4}>
            <VStack align="stretch" spacing={4}>
              <Text color="#6B7280" fontSize="15px">
                {t('packagePage.successModal.message')}
              </Text>
              <Box bg="#ECFDF5" px={4} py={3} borderRadius="16px">
                <Text fontSize="13px" color="#059669" fontWeight="500">
                  {t('packagePage.successModal.info')}
                </Text>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button
              variant="ghost"
              onClick={onSuccessModalClose}
              borderRadius="full"
              color="#8E8E93"
              fontWeight="600"
            >
              {t('packagePage.successModal.close')}
            </Button>
            <Button
              bg="#FE4F18"
              color="white"
              borderRadius="full"
              px={6}
              fontWeight="700"
              _hover={{ bg: '#E44615' }}
              onClick={() => navigate('/mypage')}
            >
              {t('packagePage.successModal.goToProfile')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Order Error Modal */}
      <Modal isOpen={isErrorModalOpen} onClose={onErrorModalClose} isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(8px)" />
        <ModalContent mx={4} borderRadius="28px" p={2}>
          <ModalHeader>
            <HStack spacing={3}>
              <Box bg="#FEF2F2" p={2.5} borderRadius="14px">
                <AlertCircle size={22} color="#EF4444" />
              </Box>
              <Text fontSize="18px" fontWeight="700" color="#1C1C1E">
                {t('packagePage.errorModal.title')}
              </Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton top={5} right={5} />
          <ModalBody pb={4}>
            <Box bg="#FEF2F2" px={4} py={3} borderRadius="16px">
              <Text fontSize="14px" color="#DC2626" fontWeight="500">{orderError}</Text>
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button
              bg="#FE4F18"
              color="white"
              borderRadius="full"
              px={6}
              fontWeight="700"
              _hover={{ bg: '#E44615' }}
              onClick={onErrorModalClose}
            >
              {t('packagePage.errorModal.ok')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default PackagePage;
