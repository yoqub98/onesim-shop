// src/components/OrderCard.jsx
import { useState, useEffect } from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Badge,
  Button,
  Grid,
  Spinner,
} from '@chakra-ui/react';
import {
  CircleStackIcon,
  CalendarIcon,
  SignalIcon,
  ClockIcon,

} from '@heroicons/react/24/outline';
import CountryFlag from './CountryFlag';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { getCountryName, getTranslation } from '../config/i18n';
import {
  getOrderStatusText,
  getOrderStatusColor,
  getEsimStatusText,
  getEsimStatusColor,
  queryEsimProfile,
  shouldShowUsage,
} from '../services/orderService';

const OrderCard = ({ order, onActivate, onViewDetails }) => {
  const { currentLanguage } = useLanguage();
  const t = (key) => getTranslation(currentLanguage, key);

  // State for LIVE data from API
  const [liveData, setLiveData] = useState(null);
  const [loadingLiveData, setLoadingLiveData] = useState(false);

  // Fetch LIVE data for ALLOCATED orders
  useEffect(() => {
    const fetchLiveData = async () => {
      if (order.order_status !== 'ALLOCATED' || !order.order_no) {
        console.log('⏭️ [OrderCard LIVE] Skipping - not ALLOCATED or no order_no:', {
          orderId: order.id,
          status: order.order_status,
          orderNo: order.order_no,
        });
        return;
      }

      console.log('🔄 [OrderCard LIVE] Fetching live data for Order No:', order.order_no);
      setLoadingLiveData(true);

      try {
        const response = await queryEsimProfile(order.order_no);

        console.log('✅ [OrderCard LIVE] Response received:', response);

        if (response && response.success && response.obj?.esimList?.length > 0) {
          const esimData = response.obj.esimList[0];

          console.log('📊 [OrderCard LIVE] Live eSIM data:', {
            esimStatus: esimData.esimStatus,
            smdpStatus: esimData.smdpStatus,
            totalVolume: esimData.totalVolume,
            orderUsage: esimData.orderUsage,
            expiredTime: esimData.expiredTime,
          });

          setLiveData({
            esimStatus: esimData.esimStatus,
            smdpStatus: esimData.smdpStatus,
            totalVolume: esimData.totalVolume,
            orderUsage: esimData.orderUsage,
            expiredTime: esimData.expiredTime,
            iccid: esimData.iccid,
            qrCodeUrl: esimData.qrCodeUrl,
            activationCode: esimData.ac,
          });
        } else {
          console.log('⚠️ [OrderCard LIVE] No eSIM data in response');
        }
      } catch (err) {
        console.error('❌ [OrderCard LIVE] Failed to fetch live data:', err.message);
      } finally {
        setLoadingLiveData(false);
      }
    };

    fetchLiveData();
  }, [order.order_no, order.order_status, order.id]);

  // Use LIVE status if available, otherwise fall back to database status
  const esimStatus = liveData?.esimStatus || order.esim_status;
  const smdpStatus = liveData?.smdpStatus || order.smdp_status;

  // Determine what to show based on LIVE status
  const showUsage = shouldShowUsage(esimStatus, smdpStatus);

  // Usage data from live response
  const totalVolume = liveData?.totalVolume || 0;
  const orderUsage = liveData?.orderUsage || 0;

  // Calculate usage percentage (cap at 100%)
  const usagePercentage = totalVolume > 0 ? Math.min((orderUsage / totalVolume) * 100, 100) : 0;

  // Calculate remaining data (don't show negative)
  const remainingData = Math.max(0, totalVolume - orderUsage);

  // Determine status display
  const useEsimStatus = order.order_status === 'ALLOCATED' && esimStatus;
  let statusText = useEsimStatus
    ? getEsimStatusText(esimStatus, smdpStatus, currentLanguage)
    : getOrderStatusText(order.order_status, currentLanguage);
  let statusColor = useEsimStatus
    ? getEsimStatusColor(esimStatus, smdpStatus)
    : getOrderStatusColor(order.order_status);

  const countryName = getCountryName(order.country_code, currentLanguage);

  // Format expiry date for duration display
  const formatExpiryDate = (expiryDateString) => {
    if (!expiryDateString) return null;
    const date = new Date(expiryDateString);
    const locale = currentLanguage === 'uz' ? 'uz-UZ' : 'ru-RU';
    return date.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const expiryDate = formatExpiryDate(liveData?.expiredTime || order.expiry_date);

  // Debug log for activation date
  console.log('📅 [OrderCard] Activation Date Debug:', {
    orderId: order.id,
    liveExpiredTime: liveData?.expiredTime,
    dbExpiryDate: order.expiry_date,
    formattedDate: expiryDate,
  });

  // Format bytes to MB/GB
  const formatDataSize = (bytes) => {
    if (!bytes || bytes <= 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(2)} GB`;
    }
    return `${mb.toFixed(0)} MB`;
  };

  // Show QR button only for non-cancelled and non-deleted eSIMs
  const showQrButton =
    (order.qr_code_url || order.activation_code || liveData?.qrCodeUrl) &&
    esimStatus !== 'CANCEL' &&
    smdpStatus !== 'DELETED';

  // Determine if card should be faded (cancelled/deleted)
  const isCancelled =
    order.order_status === 'CANCELLED' || esimStatus === 'CANCEL' || smdpStatus === 'DELETED';

  // Check if this is ready to activate (show activate button)
  // ONLY show for: GOT_RESOURCE + RELEASED = Not yet installed
  const isReadyToActivate =
    order.order_status === 'ALLOCATED' &&
    esimStatus === 'GOT_RESOURCE' &&
    smdpStatus === 'RELEASED' &&
    showQrButton;

  // Get badge styles based on status
  const getBadgeStyles = () => {
    const colorMap = {
      green: { bg: '#D1FAE5', color: '#065F46' },
      teal: { bg: '#CCFBF1', color: '#115E59' },
      blue: { bg: '#DBEAFE', color: '#1E40AF' },
      yellow: { bg: '#FEF3C7', color: '#92400E' },
      orange: { bg: '#FFEDD5', color: '#9A3412' },
      red: { bg: '#FEE2E2', color: '#991B1B' },
      gray: { bg: '#F3F4F6', color: '#374151' },
      purple: { bg: '#EDE9FE', color: '#5B21B6' },
    };

    return colorMap[statusColor] || colorMap.gray;
  };

  const badgeStyles = getBadgeStyles();

  return (
    <Box
      bg="white"
      borderRadius="28px"
      p={6}
      boxShadow="0 8px 32px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.04)"
      border="1px solid"
      borderColor="gray.100"
      maxW="980px" // 💡 CARD WIDTH CONTROL: Change this value to adjust card width
      w="full"
      transition="all 0.2s"
      _hover={{ boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.06)' }}
      opacity={isCancelled ? 0.6 : 1}
      fontFamily="'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      display="flex"
      flexDirection="column"
      minHeight="360px"
    >
      <VStack align="stretch" spacing={6} flex="1" justify="space-between">
        {/* Header */}
        <HStack justify="space-between" align="start">
          <HStack spacing={3} flex="1">
            {order.country_code && (
              <Box
                borderRadius="14px"
                overflow="hidden"
                width="48px"
                height="48px"
                flexShrink={0}
                boxShadow="sm"
              >
                <CountryFlag
                  code={order.country_code}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>
            )}
            <VStack align="flex-start" spacing={0.5}>
              <Text fontWeight="800" fontSize="lg" color="gray.900">
                {order.package_name || `${countryName} ${order.data_amount}`}
              </Text>
              <Text fontSize="sm" color="gray.500">
                {t('myPage.orders.orderNumber')} : {order.order_no || order.id.slice(0, 8)}
              </Text>
            </VStack>
          </HStack>

          {/* Status Badge */}
          {loadingLiveData ? (
            <HStack spacing={2}>
              <Spinner size="xs" color="purple.500" />
              <Text fontSize="xs" color="gray.500">
                {t('myPage.orders.loadingUsage') || 'Загрузка...'}
              </Text>
            </HStack>
          ) : (
            <Badge
              bg={badgeStyles.bg}
              color={badgeStyles.color}
              fontSize="sm"
              px={4}
              py={2}
              borderRadius="full"
              fontWeight="700"
            >
              {statusText}
            </Badge>
          )}
        </HStack>

        {/* Stats Grid - 4 columns */}
        <Grid templateColumns="repeat(4, 1fr)" gap={4}>
          {/* Data Volume */}
          <VStack align="flex-start" spacing={1}>
            <Text fontSize="13px" color="gray.500">
              {t('myPage.orders.dataVolume')}
            </Text>
            <HStack spacing={1.5}>
              <CircleStackIcon style={{ width: '16px', height: '16px', color: '#F97316' }} />
              <Text fontSize="18px" fontWeight="800" color="gray.900">
                {order.data_amount || '-'}
              </Text>
            </HStack>
          </VStack>

          {/* Coverage */}
          <VStack align="flex-start" spacing={1}>
            <Text fontSize="13px" color="gray.500">
              {t('myPage.orders.coverage')}
            </Text>
            <HStack spacing={1.5}>
              <SignalIcon style={{ width: '16px', height: '16px', color: '#F97316' }} />
              <Text fontSize="18px" fontWeight="800" color="gray.900">
                5G
              </Text>
            </HStack>
          </VStack>

          {/* Activation Date */}
          <VStack align="flex-start" spacing={1}>
            <Text fontSize="13px" color="gray.500">
              {t('myPage.orders.activationDate')}
            </Text>
            <HStack spacing={1.5}>
              <CalendarIcon style={{ width: '16px', height: '16px', color: '#F97316' }} />
              <Text fontSize="18px" fontWeight="800" color="gray.900">
                {expiryDate || '-'}
              </Text>
            </HStack>
          </VStack>

          {/* Duration */}
          <VStack align="flex-start" spacing={1}>
            <Text fontSize="13px" color="gray.500">
              {t('myPage.orders.duration')}
            </Text>
            <HStack spacing={1.5}>
              <ClockIcon style={{ width: '16px', height: '16px', color: '#F97316' }} />
              <Text fontSize="18px" fontWeight="800" color="gray.900">
                {order.validity_days ? `${order.validity_days} ${t('myPage.orders.days')}` : '-'}
              </Text>
            </HStack>
          </VStack>
        </Grid>

        {/* Data Usage Progress Bar - show for active eSIMs */}
        {!loadingLiveData && showUsage && totalVolume > 0 && (
          <Box width="full" mb={4}>
            <VStack spacing={2} align="stretch">
              <HStack justify="space-between" fontSize="sm" color="gray.600">
                <Text>
                  {t('myPage.orders.dataUsed')}: {usagePercentage.toFixed(1)}%
                </Text>
                <Text fontWeight="700">
                  {formatDataSize(orderUsage)} / {formatDataSize(totalVolume)}
                </Text>
              </HStack>
              <Box width="full" bg="gray.100" borderRadius="full" h="8px" overflow="hidden">
                <Box
                  h="full"
                  bg="linear-gradient(to right, #1f2937, #374151)"
                  borderRadius="full"
                  width={`${usagePercentage}%`}
                  transition="width 0.3s"
                />
              </Box>
              <Text fontSize="sm" color="gray.500">
                {formatDataSize(remainingData)} {t('myPage.orders.dataRemaining')}
              </Text>
            </VStack>
          </Box>
        )}

        {/* Warning Info Box - for ready to activate */}
        {isReadyToActivate && (
          <Box
            bg="#F6F8FA"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="18px"
            p={4}
            mb={4}
          >
            <HStack align="start" spacing={3}>
              <Box flexShrink={0} mt={0.5}>
                <Box
                  width="20px"
                  height="20px"
                  borderRadius="full"
                  border="2px solid"
                  borderColor="#F97316"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text fontSize="xs" fontWeight="800" color="#F97316">
                    i
                  </Text>
                </Box>
              </Box>
              <VStack align="start" spacing={1} flex="1">
                <Text fontSize="sm" fontWeight="600" color="gray.900">
                  {t('myPage.orders.readyToActivateWarning')}
                </Text>
                <Text fontSize="sm" color="gray.600" lineHeight="1.6">
                  {t('myPage.orders.readyToActivateMessage')}
                </Text>
              </VStack>
            </HStack>
          </Box>
        )}

        {/* Footer - Price & Buttons
            💡 TIP: To move this section up/down, adjust the VStack spacing value above (currently spacing={6})
            or add marginTop to this HStack. Example: mt={4} to move down, mt={-2} to move up */}
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Text fontSize="xs" color="#F97316" fontWeight="600">
              {t('myPage.orders.price')}
            </Text>
            <Text fontSize="2xl" fontWeight="800" color="gray.900">
              {order.price_uzs ? Number(order.price_uzs).toLocaleString('ru-RU') : '-'}{' '}
              <Text as="span" fontSize="lg">
                UZS
              </Text>
            </Text>
          </VStack>

          {/* Action Buttons */}
          <HStack spacing={3}>
            <Button
              px={8}
              py={5}
              h="auto"
              variant="outline"
              borderWidth="2px"
              borderColor="gray.200"
              color="gray.700"
              borderRadius="full"
              onClick={() => onViewDetails && onViewDetails(order)}
              fontWeight="700"
              fontSize="md"
              _hover={{ bg: 'gray.50', borderColor: 'gray.300' }}
              transition="all 0.2s"
            >
              {t('myPage.orders.details')}
            </Button>

            {isReadyToActivate && (
              <Button
                px={8}
                py={5}
                h="auto"
                bg="#FE4F18"
                color="white"
                borderRadius="full"
                onClick={() => onActivate && onActivate(order)}
                fontWeight="700"
                fontSize="md"
                _hover={{ opacity: 0.9 }}
                transition="all 0.2s"
              >
                {t('myPage.orders.activate')}
              </Button>
            )}
          </HStack>
        </HStack>
      </VStack>
    </Box>
  );
};

export default OrderCard;