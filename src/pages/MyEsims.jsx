// src/pages/MyEsims.jsx
import { useState, useEffect } from 'react';
import {
  Box,
  Container,
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
import { getCountryName } from '../config/i18n';
import { getOrderStatusText, getOrderStatusColor, getEsimStatusText, getEsimStatusColor, checkOrderStatus, queryEsimUsage } from '../services/orderService';

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

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
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
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
    });
  };

  // Format bytes to MB/GB
  const formatDataSize = (bytes) => {
    if (!bytes) return '0 MB';
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
    const [usageData, setUsageData] = useState(null);
    const [loadingUsage, setLoadingUsage] = useState(false);

    // Fetch usage data if order_no is available AND eSIM is activated
    useEffect(() => {
      const fetchUsageData = async () => {
        // Only fetch usage data for ALLOCATED orders
        if (!order.order_no || order.order_status !== 'ALLOCATED') {
          console.log('⏭️ [USAGE] Skipping - not allocated. Order:', order.id, 'Status:', order.order_status);
          return;
        }

        // Don't fetch usage for eSIMs that haven't been installed yet
        // GOT_RESOURCE_RELEASED means the eSIM is ready but not installed on any device yet
        if (order.esim_status === 'GOT_RESOURCE_RELEASED' || order.esim_status === 'GOT_RESOURCE') {
          console.log('⏭️ [USAGE] Skipping - eSIM not installed yet. Order:', order.id, 'eSIM Status:', order.esim_status);
          return;
        }

        console.log('📊 [USAGE] Fetching usage data for Order No:', order.order_no, {
          iccid: order.iccid,
          esimStatus: order.esim_status,
          smdpStatus: order.smdp_status
        });
        setLoadingUsage(true);
        try {
          const data = await queryEsimUsage(order.order_no);
          console.log('✅ [USAGE] Usage data received:', data);

          // Check for successful response and data
          if (data && data.success && data.obj?.esimList && data.obj.esimList.length > 0) {
            const esimData = data.obj.esimList[0];
            console.log('📈 [USAGE] Usage data set:', {
              totalVolume: esimData.totalVolume,
              orderUsage: esimData.orderUsage,
              esimStatus: esimData.esimStatus,
              smdpStatus: esimData.smdpStatus
            });
            setUsageData(esimData);
          } else {
            console.log('⚠️ [USAGE] No usage data found in response:', data);
          }
        } catch (err) {
          console.error('❌ [USAGE] Failed to fetch usage data:', {
            error: err.message,
            orderNo: order.order_no,
            iccid: order.iccid
          });
          // Don't set error state, just log it - usage data is optional
        } finally {
          setLoadingUsage(false);
        }
      };

      fetchUsageData();
    }, [order.order_no, order.order_status, order.esim_status, order.iccid]);

    // For ALLOCATED orders, show eSIM status if available; otherwise show order status
    const useEsimStatus = order.order_status === 'ALLOCATED' && order.esim_status;

    // Determine status - use eSIM status if available, otherwise use order status
    let statusText = useEsimStatus ? getEsimStatusText(order.esim_status, order.smdp_status) : getOrderStatusText(order.order_status);
    let statusColor = useEsimStatus ? getEsimStatusColor(order.esim_status, order.smdp_status) : getOrderStatusColor(order.order_status);

    const countryName = getCountryName(order.country_code, currentLanguage);
    const expiryDate = formatExpiryDate(usageData?.expiredTime || order.expiry_date);

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
                  Заказ #{order.order_no || order.id.slice(0, 8)}
                </Text>
              </VStack>
            </HStack>
            <Badge colorScheme={statusColor} fontSize="sm" px={3} py={1} borderRadius="full">
              {statusText}
            </Badge>
          </HStack>

          <Divider />

          {/* Details */}
          <Grid templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)' }} gap={3}>
            <HStack spacing={2}>
              <Database size={16} color="#6b7280" />
              <Text fontSize="sm" color="gray.600">Данные:</Text>
              <Text fontSize="sm" fontWeight="600">{order.data_amount || '-'}</Text>
            </HStack>
            <HStack spacing={2}>
              <Calendar size={16} color="#6b7280" />
              <Text fontSize="sm" color="gray.600">Срок:</Text>
              <Text fontSize="sm" fontWeight="600">
                {order.validity_days
                  ? `${order.validity_days} дней${expiryDate ? ` (до ${expiryDate})` : ''}`
                  : '-'}
              </Text>
            </HStack>
            <HStack spacing={2}>
              <Globe size={16} color="#6b7280" />
              <Text fontSize="sm" color="gray.600">Регион:</Text>
              <Text fontSize="sm" fontWeight="600">{countryName || '-'}</Text>
            </HStack>
            <HStack spacing={2}>
              <Calendar size={16} color="#6b7280" />
              <Text fontSize="sm" color="gray.600">Дата:</Text>
              <Text fontSize="sm" fontWeight="600">{formatDate(order.created_at)}</Text>
            </HStack>
          </Grid>

          {/* ICCID if available */}
          {order.iccid && (
            <Box bg="gray.50" p={3} borderRadius="lg">
              <HStack justify="space-between" flexWrap="wrap" gap={2}>
                <VStack align="flex-start" spacing={0}>
                  <Text fontSize="xs" color="gray.500">ICCID</Text>
                  <Text fontSize="sm" fontWeight="600" fontFamily="mono">{order.iccid}</Text>
                </VStack>
                <Button
                  size="xs"
                  variant="ghost"
                  colorScheme="purple"
                  onClick={() => handleCopyCode(order.iccid)}
                >
                  <Copy size={14} />
                </Button>
              </HStack>
            </Box>
          )}

          {/* Price */}
          <HStack justify="space-between" pt={2}>
            <Text fontSize="sm" color="gray.500">Стоимость:</Text>
            <Text fontSize="lg" fontWeight="800" color="purple.600">
              {order.price_uzs ? `${Number(order.price_uzs).toLocaleString('ru-RU')} UZS` : '-'}
            </Text>
          </HStack>

          {/* Actions */}
          {order.order_status === 'ALLOCATED' && (
            <VStack spacing={3} width="full">
              {/* Data Usage Progress Bar */}
              {usageData && usageData.totalVolume > 0 && (
                <Box width="full" bg="gray.50" p={3} borderRadius="lg">
                  <VStack spacing={2} align="stretch">
                    <HStack justify="space-between" fontSize="xs" color="gray.600">
                      <Text fontWeight="600">Использовано данных</Text>
                      <Text fontWeight="600">
                        {formatDataSize(usageData.orderUsage)} / {formatDataSize(usageData.totalVolume)}
                      </Text>
                    </HStack>
                    <Progress
                      value={((usageData.orderUsage / usageData.totalVolume) * 100)}
                      size="sm"
                      colorScheme={
                        (usageData.orderUsage / usageData.totalVolume) > 0.8
                          ? 'red'
                          : (usageData.orderUsage / usageData.totalVolume) > 0.5
                          ? 'orange'
                          : 'purple'
                      }
                      borderRadius="full"
                      bg="gray.200"
                    />
                    <HStack justify="space-between" fontSize="xs" color="gray.500">
                      <Text>
                        {((usageData.orderUsage / usageData.totalVolume) * 100).toFixed(1)}% использовано
                      </Text>
                      <Text>
                        {formatDataSize(usageData.totalVolume - usageData.orderUsage)} осталось
                      </Text>
                    </HStack>
                  </VStack>
                </Box>
              )}
              {(order.qr_code_url || order.activation_code) && (
                <Button
                  size="md"
                  width="full"
                  bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  color="white"
                  _hover={{ opacity: 0.9 }}
                  onClick={() => handleViewQr(order)}
                  leftIcon={<QrCode size={18} />}
                >
                  Показать QR-код
                </Button>
              )}
              {/* Only show cancel button if eSIM is not activated (smdpStatus is RELEASED) */}
              {(!usageData || usageData.smdpStatus === 'RELEASED') && (
                <Button
                  size="sm"
                  width="full"
                  variant="outline"
                  colorScheme="red"
                  leftIcon={<XCircle size={16} />}
                  onClick={() => handleCancelClick(order)}
                  isLoading={cancellingOrder === order.id}
                  loadingText="Отмена..."
                >
                  Отменить eSIM
                </Button>
              )}
            </VStack>
          )}

          {order.order_status === 'PENDING' && (
            <VStack spacing={3}>
              <Alert status="info" borderRadius="lg" fontSize="sm">
                <AlertIcon />
                Ваш eSIM обрабатывается. Это может занять несколько минут.
              </Alert>
              <Button
                size="sm"
                variant="outline"
                colorScheme="purple"
                width="full"
                leftIcon={<RefreshCw size={16} />}
                onClick={() => handleCheckStatus(order.id)}
                isLoading={checkingStatus === order.id}
                loadingText="Проверка..."
              >
                Проверить статус
              </Button>
            </VStack>
          )}

          {order.order_status === 'FAILED' && (
            <Alert status="error" borderRadius="lg" fontSize="sm">
              <AlertIcon />
              {order.error_message || 'Произошла ошибка при обработке заказа'}
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
        <Heading size="md" color="gray.800">Мои заказы</Heading>
        <Button
          size="sm"
          variant="outline"
          colorScheme="purple"
          leftIcon={<RefreshCw size={16} />}
          onClick={fetchOrders}
          isLoading={isLoading}
        >
          Обновить
        </Button>
      </HStack>

      {/* Loading State */}
      {isLoading && (
        <Box textAlign="center" py={12}>
          <Spinner size="xl" color="purple.500" />
          <Text mt={4} color="gray.600">Загрузка заказов...</Text>
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
            У вас пока нет заказов
          </Heading>
          <Text color="gray.500" mb={6}>
            Выберите подходящий eSIM пакет и оформите первый заказ
          </Text>
          <Button
            as="a"
            href="/"
            bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            color="white"
            _hover={{ opacity: 0.9 }}
          >
            Выбрать eSIM
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
