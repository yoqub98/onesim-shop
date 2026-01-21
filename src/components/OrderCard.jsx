// src/components/OrderCard.jsx
import { useState, useEffect } from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Badge,
  Button,
  Progress,
  Alert,
  AlertIcon,
  Grid,
  Spinner,
} from '@chakra-ui/react';
import {
  Database,
  Calendar,
  Signal,
  Clock,
  Info,
} from 'lucide-react';
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
  canCancelEsim,
} from '../services/orderService';

const OrderCard = ({ order, onActivate, onViewDetails }) => {
  const { currentLanguage } = useLanguage();
  const t = (key) => getTranslation(currentLanguage, key);

  // State for LIVE data from API
  const [liveData, setLiveData] = useState(null);
  const [loadingLiveData, setLoadingLiveData] = useState(false);
  const [liveDataError, setLiveDataError] = useState(null);

  // Fetch LIVE data for ALLOCATED orders
  useEffect(() => {
    const fetchLiveData = async () => {
      // Only fetch for ALLOCATED orders that have an order_no
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
      setLiveDataError(null);

      try {
        // Query the eSIM profile to get CURRENT status
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
        setLiveDataError(err.message);
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
  const isCancellable = canCancelEsim(esimStatus, smdpStatus);

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
      month: 'long',
      year: 'numeric',
    });
  };

  const expiryDate = formatExpiryDate(liveData?.expiredTime || order.expiry_date);

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
  const isReadyToActivate =
    order.order_status === 'ALLOCATED' &&
    (esimStatus === 'GOT_RESOURCE' || smdpStatus === 'RELEASED') &&
    showQrButton;

  return (
    <Box
      bg="white"
      borderRadius="24px"
      p={6}
      shadow="sm"
      border="1px solid"
      borderColor="gray.100"
      transition="all 0.2s"
      _hover={{ shadow: 'md', borderColor: 'purple.200' }}
      opacity={isCancelled ? 0.6 : 1}
    >
      <VStack align="stretch" spacing={4}>
        {/* Header */}
        <HStack justify="space-between" align="start" flexWrap="wrap" gap={2}>
          <HStack spacing={3} flex="1">
            {order.country_code && (
              <Box
                borderRadius="lg"
                overflow="hidden"
                width="48px"
                height="36px"
                border="1px solid"
                borderColor="gray.200"
                flexShrink={0}
              >
                <CountryFlag
                  code={order.country_code}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>
            )}
            <VStack align="flex-start" spacing={0.5}>
              <Text fontWeight="700" fontSize="lg" color="gray.800">
                {order.package_name || `eSIM ${countryName}`}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {t('myPage.orders.orderNumber')} : {order.order_no || order.id.slice(0, 8)}
              </Text>
            </VStack>
          </HStack>

          {/* Status Badge - show loading indicator if fetching */}
          {loadingLiveData ? (
            <HStack spacing={2}>
              <Spinner size="xs" color="purple.500" />
              <Text fontSize="xs" color="gray.500">
                {t('myPage.orders.loadingUsage') || 'Загрузка...'}
              </Text>
            </HStack>
          ) : (
            <Badge
              colorScheme={statusColor}
              fontSize="sm"
              px={4}
              py={1.5}
              borderRadius="full"
              fontWeight="600"
            >
              {statusText}
            </Badge>
          )}
        </HStack>

        {/* Details Grid - 4 columns */}
        <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} gap={4}>
          {/* Data Volume */}
          <VStack align="flex-start" spacing={0.5}>
            <HStack spacing={1.5}>
              <Database size={14} color="#9ca3af" />
              <Text fontSize="xs" color="gray.500">
                {t('myPage.orders.dataVolume')}
              </Text>
            </HStack>
            <Text fontSize="sm" fontWeight="700" color="gray.800">
              {order.data_amount || '-'}
            </Text>
          </VStack>

          {/* Coverage */}
          <VStack align="flex-start" spacing={0.5}>
            <HStack spacing={1.5}>
              <Signal size={14} color="#9ca3af" />
              <Text fontSize="xs" color="gray.500">
                {t('myPage.orders.coverage')}
              </Text>
            </HStack>
            <Text fontSize="sm" fontWeight="700" color="gray.800">
              5G
            </Text>
          </VStack>

          {/* Activation Date */}
          <VStack align="flex-start" spacing={0.5}>
            <HStack spacing={1.5}>
              <Calendar size={14} color="#9ca3af" />
              <Text fontSize="xs" color="gray.500">
                {t('myPage.orders.activationDate')}
              </Text>
            </HStack>
            <Text fontSize="sm" fontWeight="700" color="gray.800">
              {expiryDate ? expiryDate : t('myPage.orders.notActivated')}
            </Text>
          </VStack>

          {/* Duration */}
          <VStack align="flex-start" spacing={0.5}>
            <HStack spacing={1.5}>
              <Clock size={14} color="#9ca3af" />
              <Text fontSize="xs" color="gray.500">
                {t('myPage.orders.duration')}
              </Text>
            </HStack>
            <Text fontSize="sm" fontWeight="700" color="gray.800">
              {order.validity_days ? `${order.validity_days} ${t('myPage.orders.days')}` : '-'}
            </Text>
          </VStack>
        </Grid>

        {/* Data Usage Progress Bar - show for active eSIMs */}
        {!loadingLiveData && showUsage && totalVolume > 0 && (
          <Box width="full" bg="gray.50" p={3} borderRadius="lg">
            <VStack spacing={2} align="stretch">
              <HStack justify="space-between" fontSize="xs" color="gray.600">
                <Text fontWeight="600">{t('myPage.orders.dataUsed')}: {usagePercentage.toFixed(1)}%</Text>
                <Text fontWeight="600">
                  {formatDataSize(orderUsage)} / {formatDataSize(totalVolume)}
                </Text>
              </HStack>
              <Progress
                value={usagePercentage}
                size="sm"
                colorScheme={
                  usagePercentage >= 100
                    ? 'red'
                    : usagePercentage > 80
                    ? 'orange'
                    : usagePercentage > 50
                    ? 'yellow'
                    : 'purple'
                }
                borderRadius="full"
                bg="gray.200"
              />
              <Text fontSize="xs" color="gray.500" textAlign="right">
                {formatDataSize(remainingData)} {t('myPage.orders.dataRemaining')}
              </Text>
            </VStack>
          </Box>
        )}

        {/* Warning Info Box - for ready to activate */}
        {isReadyToActivate && (
          <Alert
            status="info"
            borderRadius="xl"
            bg="blue.50"
            borderWidth="1px"
            borderColor="blue.200"
            py={3}
          >
            <Info size={18} color="#3b82f6" style={{ marginRight: '10px', flexShrink: 0 }} />
            <VStack align="start" spacing={0} w="full">
              <Text fontSize="sm" fontWeight="600" color="blue.800">
                {t('myPage.orders.readyToActivateWarning')}
              </Text>
              <Text fontSize="xs" color="blue.700" mt={1}>
                {t('myPage.orders.readyToActivateMessage')}
              </Text>
            </VStack>
          </Alert>
        )}

        {/* Price Section */}
        <HStack justify="space-between" pt={2}>
          <Text fontSize="sm" color="gray.500" fontWeight="600">
            {t('myPage.orders.price')}
          </Text>
          <Text fontSize="xl" fontWeight="700" color="gray.800">
            {order.price_uzs ? `${Number(order.price_uzs).toLocaleString('ru-RU')} UZS` : '-'}
          </Text>
        </HStack>

        {/* Action Buttons */}
        <HStack spacing={3} width="full">
          {/* Details Button - always show */}
          <Button
            size="md"
            flex={isReadyToActivate ? '1' : 'auto'}
            variant="outline"
            colorScheme="gray"
            borderRadius="full"
            onClick={() => onViewDetails && onViewDetails(order)}
            fontWeight="600"
          >
            {t('myPage.orders.details')}
          </Button>

          {/* Activate Button - only for ready to activate */}
          {isReadyToActivate && (
            <Button
              size="md"
              flex="1"
              bg="linear-gradient(135deg, #f97316 0%, #ea580c 100%)"
              color="white"
              borderRadius="full"
              _hover={{ opacity: 0.9, transform: 'translateY(-2px)' }}
              _active={{ transform: 'translateY(0)' }}
              onClick={() => onActivate && onActivate(order)}
              fontWeight="600"
              boxShadow="md"
            >
              {t('myPage.orders.activate')}
            </Button>
          )}
        </HStack>
      </VStack>
    </Box>
  );
};

export default OrderCard;
