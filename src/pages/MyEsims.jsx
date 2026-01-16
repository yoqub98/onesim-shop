// src/pages/MyEsims.jsx
import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Grid,
  Badge,
  Button,
  Spinner,
  Divider,
  Alert,
  AlertIcon,
  Progress,
} from '@chakra-ui/react';
import {
  Package,
  QrCode,
  Calendar,
  Globe,
  Database,
  RefreshCw,
  Copy,
  XCircle,
} from 'lucide-react';
import CountryFlag from '../components/CountryFlag';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { getCountryName, getTranslation } from '../config/i18n';
import {
  getOrderStatusText,
  getOrderStatusColor,
  getEsimStatusText,
  getEsimStatusColor,
  queryEsimProfile,
  shouldShowUsage,
  canCancelEsim
} from '../services/orderService';

const MyEsims = ({
  orders,
  isLoading,
  error,
  checkingStatus,
  cancellingOrder,
  fetchOrders,
  handleViewQr,
  handleCancelClick,
  handleCheckStatus,
}) => {
  const { currentLanguage } = useLanguage();
  const t = (key) => getTranslation(currentLanguage, key);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const locale = currentLanguage === 'uz' ? 'uz-UZ' : 'ru-RU';
    return date.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format expiry date for duration display
  const formatExpiryDate = (expiryDateString) => {
    if (!expiryDateString) return null;
    const date = new Date(expiryDateString);
    const locale = currentLanguage === 'uz' ? 'uz-UZ' : 'ru-RU';
    return date.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
    });
  };

  // Format bytes to MB/GB
  const formatDataSize = (bytes) => {
    if (!bytes || bytes <= 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(2)} GB`;
    }
    return `${mb.toFixed(0)} MB`;
  };

  // Copy activation code to clipboard
  const handleCopyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Order Card Component
  const OrderCard = ({ order }) => {
    // State for LIVE data from API
    const [liveData, setLiveData] = useState(null);
    const [loadingLiveData, setLoadingLiveData] = useState(false);
    const [liveDataError, setLiveDataError] = useState(null);

    // Fetch LIVE data for ALLOCATED orders
    useEffect(() => {
      const fetchLiveData = async () => {
        // Only fetch for ALLOCATED orders that have an order_no
        if (order.order_status !== 'ALLOCATED' || !order.order_no) {
          console.log('⏭️ [LIVE] Skipping - not ALLOCATED or no order_no:', {
            orderId: order.id,
            status: order.order_status,
            orderNo: order.order_no
          });
          return;
        }

        console.log('🔄 [LIVE] Fetching live data for Order No:', order.order_no);
        setLoadingLiveData(true);
        setLiveDataError(null);

        try {
          // Query the eSIM profile to get CURRENT status
          const response = await queryEsimProfile(order.order_no);
          
          console.log('✅ [LIVE] Response received:', response);

          if (response && response.success && response.obj?.esimList?.length > 0) {
            const esimData = response.obj.esimList[0];
            
            console.log('📊 [LIVE] Live eSIM data:', {
              esimStatus: esimData.esimStatus,
              smdpStatus: esimData.smdpStatus,
              totalVolume: esimData.totalVolume,
              orderUsage: esimData.orderUsage,
              expiredTime: esimData.expiredTime
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
            console.log('⚠️ [LIVE] No eSIM data in response');
          }
        } catch (err) {
          console.error('❌ [LIVE] Failed to fetch live data:', err.message);
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
    const usagePercentage = totalVolume > 0
      ? Math.min((orderUsage / totalVolume) * 100, 100)
      : 0;
    
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
    const expiryDate = formatExpiryDate(liveData?.expiredTime || order.expiry_date);

    // Show QR button only for non-cancelled and non-deleted eSIMs
    const showQrButton = (order.qr_code_url || order.activation_code || liveData?.qrCodeUrl) 
      && esimStatus !== 'CANCEL' 
      && smdpStatus !== 'DELETED';

    return (
      <Box
        bg="white"
        borderRadius="2xl"
        p={6}
        shadow="sm"
        border="1px solid"
        borderColor="gray.100"
        transition="all 0.2s"
        _hover={{ shadow: 'md', borderColor: 'purple.200' }}
      >
        <VStack align="stretch" spacing={4}>
          {/* Header */}
          <HStack justify="space-between" flexWrap="wrap" gap={2}>
            <HStack spacing={3}>
              {order.country_code && (
                <Box
                  borderRadius="lg"
                  overflow="hidden"
                  width="40px"
                  height="30px"
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
              <VStack align="flex-start" spacing={0}>
                <Text fontWeight="700" color="gray.800">
                  {order.package_name || `eSIM ${countryName}`}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {t('myPage.orders.orderNumber')} #{order.order_no || order.id.slice(0, 8)}
                </Text>
              </VStack>
            </HStack>
            
            {/* Status Badge - show loading indicator if fetching */}
            {loadingLiveData ? (
              <HStack spacing={2}>
                <Spinner size="xs" color="purple.500" />
                <Text fontSize="xs" color="gray.500">{t('myPage.orders.loadingUsage') || 'Загрузка...'}</Text>
              </HStack>
            ) : (
              <Badge colorScheme={statusColor} fontSize="sm" px={3} py={1} borderRadius="full">
                {statusText}
              </Badge>
            )}
          </HStack>

          <Divider />

          {/* Details */}
          <Grid templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)' }} gap={3}>
            <HStack spacing={2}>
              <Database size={16} color="#6b7280" />
              <Text fontSize="sm" color="gray.600">{t('myPage.orders.data')}:</Text>
              <Text fontSize="sm" fontWeight="600">{order.data_amount || '-'}</Text>
            </HStack>
            <HStack spacing={2}>
              <Calendar size={16} color="#6b7280" />
              <Text fontSize="sm" color="gray.600">{t('myPage.orders.validity')}:</Text>
              <Text fontSize="sm" fontWeight="600">
                {order.validity_days
                  ? `${order.validity_days} ${t('myPage.orders.days')}${expiryDate ? ` (${t('myPage.orders.until')} ${expiryDate})` : ''}`
                  : '-'}
              </Text>
            </HStack>
            <HStack spacing={2}>
              <Globe size={16} color="#6b7280" />
              <Text fontSize="sm" color="gray.600">{t('myPage.orders.region')}:</Text>
              <Text fontSize="sm" fontWeight="600">{countryName || '-'}</Text>
            </HStack>
            <HStack spacing={2}>
              <Calendar size={16} color="#6b7280" />
              <Text fontSize="sm" color="gray.600">{t('myPage.orders.date')}:</Text>
              <Text fontSize="sm" fontWeight="600">{formatDate(order.created_at)}</Text>
            </HStack>
          </Grid>

          {/* ICCID if available */}
          {(order.iccid || liveData?.iccid) && (
            <Box bg="gray.50" p={3} borderRadius="lg">
              <HStack justify="space-between" flexWrap="wrap" gap={2}>
                <VStack align="flex-start" spacing={0}>
                  <Text fontSize="xs" color="gray.500">ICCID</Text>
                  <Text fontSize="sm" fontWeight="600" fontFamily="mono">
                    {liveData?.iccid || order.iccid}
                  </Text>
                </VStack>
                <Button
                  size="xs"
                  variant="ghost"
                  colorScheme="purple"
                  onClick={() => handleCopyCode(liveData?.iccid || order.iccid)}
                >
                  <Copy size={14} />
                </Button>
              </HStack>
            </Box>
          )}

          {/* Price */}
          <HStack justify="space-between" pt={2}>
            <Text fontSize="sm" color="gray.500">{t('myPage.orders.price')}:</Text>
            <Text fontSize="lg" fontWeight="800" color="purple.600">
              {order.price_uzs ? `${Number(order.price_uzs).toLocaleString('ru-RU')} UZS` : '-'}
            </Text>
          </HStack>

          {/* Actions for ALLOCATED orders */}
          {order.order_status === 'ALLOCATED' && (
            <VStack spacing={3} width="full">
              {/* Data Usage Progress Bar - show for active/used eSIMs */}
              {!loadingLiveData && showUsage && totalVolume > 0 && (
                <Box width="full" bg="gray.50" p={3} borderRadius="lg">
                  <VStack spacing={2} align="stretch">
                    <HStack justify="space-between" fontSize="xs" color="gray.600">
                      <Text fontWeight="600">{t('myPage.orders.dataUsed')}</Text>
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
                    <HStack justify="space-between" fontSize="xs" color="gray.500">
                      <Text>
                        {usagePercentage.toFixed(1)}% {t('myPage.orders.percentUsed')}
                      </Text>
                      <Text>
                        {formatDataSize(remainingData)} {t('myPage.orders.dataRemaining')}
                      </Text>
                    </HStack>
                  </VStack>
                </Box>
              )}

              {/* Show error if live data fetch failed */}
              {!loadingLiveData && liveDataError && (
                <Box width="full" bg="orange.50" p={3} borderRadius="lg">
                  <Text fontSize="xs" color="orange.600">
                    {t('myPage.orders.usageError') || 'Не удалось загрузить данные'}
                  </Text>
                </Box>
              )}

              {/* QR Code button - show for valid eSIMs */}
              {showQrButton && (
                <Button
                  size="md"
                  width="full"
                  bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  color="white"
                  _hover={{ opacity: 0.9 }}
                  onClick={() => handleViewQr(order)}
                  leftIcon={<QrCode size={18} />}
                >
                  {t('myPage.actions.showQr')}
                </Button>
              )}

              {/* Cancel button - only for non-installed eSIMs */}
              {isCancellable && (
                <Button
                  size="sm"
                  width="full"
                  variant="outline"
                  colorScheme="red"
                  leftIcon={<XCircle size={16} />}
                  onClick={() => handleCancelClick(order)}
                  isLoading={cancellingOrder === order.id}
                  loadingText={t('myPage.actions.cancelling')}
                >
                  {t('myPage.actions.cancelEsim')}
                </Button>
              )}
            </VStack>
          )}

          {/* PENDING order actions */}
          {order.order_status === 'PENDING' && (
            <VStack spacing={3}>
              <Alert status="info" borderRadius="lg" fontSize="sm">
                <AlertIcon />
                {t('myPage.status.processing')}
              </Alert>
              <Button
                size="sm"
                variant="outline"
                colorScheme="purple"
                width="full"
                leftIcon={<RefreshCw size={16} />}
                onClick={() => handleCheckStatus(order.id)}
                isLoading={checkingStatus === order.id}
                loadingText={t('myPage.actions.checking')}
              >
                {t('myPage.actions.checkStatus')}
              </Button>
            </VStack>
          )}

          {/* FAILED order status */}
          {order.order_status === 'FAILED' && (
            <Alert status="error" borderRadius="lg" fontSize="sm">
              <AlertIcon />
              {order.error_message || t('myPage.status.error')}
            </Alert>
          )}

          {/* CANCELLED order status */}
          {order.order_status === 'CANCELLED' && (
            <Alert status="warning" borderRadius="lg" fontSize="sm">
              <AlertIcon />
              {t('esimStatus.CANCELLED')}
            </Alert>
          )}
        </VStack>
      </Box>
    );
  };

  return (
    <VStack align="stretch" spacing={4}>
      {/* Header */}
      <HStack justify="space-between" flexWrap="wrap" gap={2}>
        <Heading size="md" color="gray.800">{t('myPage.orders.title')}</Heading>
        <Button
          size="sm"
          variant="outline"
          colorScheme="purple"
          leftIcon={<RefreshCw size={16} />}
          onClick={fetchOrders}
          isLoading={isLoading}
        >
          {t('myPage.orders.refresh')}
        </Button>
      </HStack>

      {/* Loading State */}
      {isLoading && (
        <Box textAlign="center" py={12}>
          <Spinner size="xl" color="purple.500" />
          <Text mt={4} color="gray.600">{t('myPage.orders.loading')}</Text>
        </Box>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <Alert status="error" borderRadius="lg">
          <AlertIcon />
          {error}
        </Alert>
      )}

      {/* Empty State */}
      {!isLoading && !error && orders.length === 0 && (
        <Box
          bg="white"
          borderRadius="2xl"
          p={12}
          textAlign="center"
          shadow="sm"
        >
          <Box bg="gray.100" p={4} borderRadius="full" display="inline-flex" mb={4}>
            <Package size={40} color="#9ca3af" />
          </Box>
          <Heading size="md" color="gray.700" mb={2}>
            {t('myPage.empty.title')}
          </Heading>
          <Text color="gray.500" mb={6}>
            {t('myPage.empty.description')}
          </Text>
          <Button
            as="a"
            href="/"
            bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            color="white"
            _hover={{ opacity: 0.9 }}
          >
            {t('myPage.empty.button')}
          </Button>
        </Box>
      )}

      {/* Orders List */}
      {!isLoading && !error && orders.length > 0 && (
        <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={4}>
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </Grid>
      )}
    </VStack>
  );
};

export default MyEsims;