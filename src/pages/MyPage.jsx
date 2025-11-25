// src/pages/MyPage.jsx
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Image,
  Alert,
  AlertIcon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Progress,
} from '@chakra-ui/react';
import {
  User,
  Phone,
  Mail,
  Package,
  QrCode,
  Calendar,
  Globe,
  Database,
  RefreshCw,
  Copy,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Share2,
  ExternalLink,
  Shield,
  Info,
} from 'lucide-react';
import Flag from 'react-world-flags';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { getCountryName } from '../config/i18n';
import { getUserOrders, getOrderStatusText, getOrderStatusColor, getEsimStatusText, getEsimStatusColor, checkOrderStatus, cancelOrder, queryEsimUsage } from '../services/orderService';

const MyPage = () => {
  console.log('🔵 MyPage component rendering...');
  const { currentLanguage } = useLanguage();
  const { user, profile } = useAuth();
  console.log('👤 User:', user?.id, 'Profile:', profile?.first_name);

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [copied, setCopied] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(null); // orderId being checked
  const [cancellingOrder, setCancellingOrder] = useState(null); // orderId being cancelled
  const [orderToCancel, setOrderToCancel] = useState(null); // order for confirmation modal

  const { isOpen: isQrModalOpen, onOpen: onQrModalOpen, onClose: onQrModalClose } = useDisclosure();
  const { isOpen: isCancelModalOpen, onOpen: onCancelModalOpen, onClose: onCancelModalClose } = useDisclosure();
  const { isOpen: isCancelSuccessOpen, onOpen: onCancelSuccessOpen, onClose: onCancelSuccessClose } = useDisclosure();

  // Fetch user orders
  const fetchOrders = async () => {
    if (!user?.id) {
      console.log('⏭️ [FETCH-ORDERS] No user ID, skipping fetch');
      return;
    }

    console.log('📥 [FETCH-ORDERS] ========== FETCHING USER ORDERS ==========');
    console.log('📥 [FETCH-ORDERS] User ID:', user.id);
    setIsLoading(true);
    setError(null);

    try {
      const userOrders = await getUserOrders(user.id);
      console.log('✅ [FETCH-ORDERS] Received', userOrders.length, 'order(s)');

      // Log each order's status
      userOrders.forEach((order, index) => {
        console.log(`📦 [FETCH-ORDERS] Order ${index + 1}:`, {
          id: order.id,
          order_no: order.order_no,
          order_status: order.order_status,
          esim_status: order.esim_status,
          smdp_status: order.smdp_status,
          has_qr_code: !!order.qr_code_url,
          has_short_url: !!order.short_url,
          iccid: order.iccid || 'NOT SET'
        });
      });

      setOrders(userOrders);
    } catch (err) {
      console.error('❌ [FETCH-ORDERS] Failed to fetch orders:', err);
      setError('Не удалось загрузить заказы');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user?.id]);

  // AUTO-CHECK PENDING ORDERS - Poll every 10 seconds
  useEffect(() => {
    if (!orders || orders.length === 0) return;

    const pendingOrders = orders.filter(o => o.order_status === 'PENDING');

    if (pendingOrders.length === 0) {
      console.log('⏭️ [AUTO-CHECK] No pending orders to check');
      return;
    }

    console.log('🔄 [AUTO-CHECK] Found', pendingOrders.length, 'pending order(s). Setting up auto-check...');

    const checkPendingOrders = async () => {
      console.log('🔄 [AUTO-CHECK] Checking status of pending orders...');

      for (const order of pendingOrders) {
        console.log('🔄 [AUTO-CHECK] Checking order:', order.id, 'Order No:', order.order_no);
        try {
          const result = await checkOrderStatus(order.id);
          console.log('✅ [AUTO-CHECK] Status check result:', result);

          if (result.success && result.data.order_status === 'ALLOCATED') {
            console.log('✅ [AUTO-CHECK] Order allocated! Refreshing orders list...');
            // Refresh orders list to show updated status
            fetchOrders();
            break; // Exit loop and let the next interval handle remaining orders
          }
        } catch (err) {
          console.error('❌ [AUTO-CHECK] Failed to check order:', order.id, err);
        }
      }
    };

    // Check immediately on mount
    checkPendingOrders();

    // Then check every 10 seconds
    const intervalId = setInterval(checkPendingOrders, 10000);

    return () => {
      console.log('🛑 [AUTO-CHECK] Stopping auto-check interval');
      clearInterval(intervalId);
    };
  }, [orders]); // Re-run when orders change

  // Handle QR code modal
  const handleViewQr = (order) => {
    setSelectedOrder(order);
    onQrModalOpen();
  };

  // Open cancel confirmation modal
  const handleCancelClick = (order) => {
    setOrderToCancel(order);
    onCancelModalOpen();
  };

  // Confirm and execute cancellation
  const handleConfirmCancel = async () => {
    if (!orderToCancel || !user?.id) return;

    setCancellingOrder(orderToCancel.id);
    onCancelModalClose();

    try {
      const result = await cancelOrder(orderToCancel.id, user.id);
      if (result.success) {
        // Update the order in local state
        setOrders(prev => prev.map(o =>
          o.id === orderToCancel.id ? { ...o, order_status: 'CANCELLED' } : o
        ));
        onCancelSuccessOpen();
      }
    } catch (err) {
      console.error('Failed to cancel order:', err);
      setError(err.message || 'Не удалось отменить заказ');
    } finally {
      setCancellingOrder(null);
      setOrderToCancel(null);
    }
  };

  // Check order status (polling)
  const handleCheckStatus = async (orderId) => {
    setCheckingStatus(orderId);
    try {
      const result = await checkOrderStatus(orderId);
      if (result.data) {
        // Update the order in local state
        setOrders(prev => prev.map(o =>
          o.id === orderId ? result.data : o
        ));
      }
    } catch (err) {
      console.error('Failed to check status:', err);
    } finally {
      setCheckingStatus(null);
    }
  };

  // Copy activation code to clipboard
  const handleCopyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Share or download QR code
  const handleShareQr = async () => {
    if (!selectedOrder?.qr_code_url) return;

    const qrCodeUrl = selectedOrder.qr_code_url;

    try {
      // Try to fetch the image as a blob
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const file = new File([blob], `onesim-qr-${selectedOrder.iccid}.png`, { type: 'image/png' });

      // Check if Web Share API is available and can share files
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'OneSIM QR-код',
          text: `QR-код для активации eSIM (${selectedOrder.package_name})`,
          files: [file],
        });
      } else {
        // Fallback: Download the image
        const link = document.createElement('a');
        link.href = qrCodeUrl;
        link.download = `onesim-qr-${selectedOrder.iccid}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error('Failed to share QR code:', err);
      // If sharing fails, try to just download
      try {
        const link = document.createElement('a');
        link.href = qrCodeUrl;
        link.download = `onesim-qr-${selectedOrder.iccid}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (downloadErr) {
        console.error('Failed to download QR code:', downloadErr);
      }
    }
  };

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

        // Don't fetch usage for eSIMs that haven't been installed yet (smdpStatus === 'RELEASED')
        // RELEASED means the eSIM is ready but not installed on any device yet
        if (order.smdp_status === 'RELEASED') {
          console.log('⏭️ [USAGE] Skipping - eSIM not installed yet (RELEASED). Order:', order.id, 'ICCID:', order.iccid);
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
    }, [order.order_no, order.order_status, order.smdp_status, order.iccid]);

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
                  <Flag
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

  console.log('🎨 About to render MyPage JSX, orders count:', orders.length);

  return (
    <Box minH="calc(100vh - 80px)" bg="gray.50" py={10}>
      <Container maxW="6xl">
        <Tabs colorScheme="purple" variant="soft-rounded">
          <TabList mb={6} bg="white" p={2} borderRadius="xl" shadow="sm">
            <Tab fontWeight="600">
              <HStack spacing={2}>
                <User size={18} />
                <Text>Профиль</Text>
              </HStack>
            </Tab>
            <Tab fontWeight="600">
              <HStack spacing={2}>
                <Package size={18} />
                <Text>Мои eSIM</Text>
                {orders.length > 0 && (
                  <Badge colorScheme="purple" borderRadius="full">{orders.length}</Badge>
                )}
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            {/* Profile Tab */}
            <TabPanel p={0}>
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                {/* Profile Card */}
                <Box bg="white" p={6} borderRadius="2xl" shadow="sm">
                  <VStack align="stretch" spacing={4}>
                    <HStack spacing={3}>
                      <Box bg="purple.100" p={3} borderRadius="xl">
                        <User size={24} color="#7c3aed" />
                      </Box>
                      <Heading size="md">Личные данные</Heading>
                    </HStack>

                    <Divider />

                    {profile && (
                      <VStack align="stretch" spacing={4}>
                        <HStack spacing={3}>
                          <User size={18} color="#6b7280" />
                          <VStack align="flex-start" spacing={0}>
                            <Text fontSize="xs" color="gray.500">Имя</Text>
                            <Text fontWeight="600">{profile.first_name} {profile.last_name}</Text>
                          </VStack>
                        </HStack>

                        <HStack spacing={3}>
                          <Phone size={18} color="#6b7280" />
                          <VStack align="flex-start" spacing={0}>
                            <Text fontSize="xs" color="gray.500">Телефон</Text>
                            <Text fontWeight="600">{profile.phone || 'Не указан'}</Text>
                          </VStack>
                        </HStack>

                        <HStack spacing={3}>
                          <Mail size={18} color="#6b7280" />
                          <VStack align="flex-start" spacing={0}>
                            <Text fontSize="xs" color="gray.500">Email</Text>
                            <Text fontWeight="600">{user?.email || 'Не указан'}</Text>
                          </VStack>
                        </HStack>
                      </VStack>
                    )}
                  </VStack>
                </Box>

                {/* Stats Card */}
                <Box bg="white" p={6} borderRadius="2xl" shadow="sm">
                  <VStack align="stretch" spacing={4}>
                    <HStack spacing={3}>
                      <Box bg="green.100" p={3} borderRadius="xl">
                        <Package size={24} color="#16a34a" />
                      </Box>
                      <Heading size="md">Статистика</Heading>
                    </HStack>

                    <Divider />

                    <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                      <Box bg="purple.50" p={4} borderRadius="xl" textAlign="center">
                        <Text fontSize="3xl" fontWeight="800" color="purple.600">
                          {orders.length}
                        </Text>
                        <Text fontSize="sm" color="gray.600">Всего заказов</Text>
                      </Box>
                      <Box bg="green.50" p={4} borderRadius="xl" textAlign="center">
                        <Text fontSize="3xl" fontWeight="800" color="green.600">
                          {orders.filter(o => o.order_status === 'ALLOCATED').length}
                        </Text>
                        <Text fontSize="sm" color="gray.600">Активных eSIM</Text>
                      </Box>
                    </Grid>
                  </VStack>
                </Box>
              </Grid>
            </TabPanel>

            {/* Orders Tab */}
            <TabPanel p={0}>
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
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>

      {/* QR Code Modal */}
      <Modal isOpen={isQrModalOpen} onClose={onQrModalClose} isCentered size="md">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent mx={4} borderRadius="2xl">
          <ModalHeader>
            <HStack spacing={3}>
              <Box bg="purple.100" p={2} borderRadius="lg">
                <QrCode size={24} color="#7c3aed" />
              </Box>
              <Text>QR-код для активации</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedOrder && (
              <VStack spacing={4}>
                {/* Security Warning */}
                <Alert
                  status="warning"
                  borderRadius="xl"
                  bg="orange.50"
                  borderWidth="1px"
                  borderColor="orange.200"
                >
                  <Shield size={20} color="#f97316" style={{ marginRight: '12px', flexShrink: 0 }} />
                  <VStack align="start" spacing={1} w="full">
                    <Text fontSize="sm" fontWeight="600" color="orange.800">
                      Важная информация
                    </Text>
                    <Text fontSize="xs" color="orange.700">
                      • Не делитесь этим QR-кодом с другими людьми - они смогут легко установить ваш eSIM
                      <br />
                      • После активации eSIM его невозможно отменить или вернуть
                    </Text>
                  </VStack>
                </Alert>

                {/* QR Code */}
                {selectedOrder.qr_code_url ? (
                  <Box
                    bg="white"
                    p={4}
                    borderRadius="xl"
                    border="2px solid"
                    borderColor="purple.100"
                    w="full"
                  >
                    <Image
                      src={selectedOrder.qr_code_url}
                      alt="QR Code"
                      maxW="250px"
                      mx="auto"
                    />
                  </Box>
                ) : selectedOrder.activation_code ? (
                  <Box
                    bg="gray.50"
                    p={4}
                    borderRadius="xl"
                    w="full"
                  >
                    <Text fontSize="xs" color="gray.500" mb={2}>Код активации:</Text>
                    <HStack justify="space-between">
                      <Text
                        fontFamily="mono"
                        fontSize="sm"
                        fontWeight="600"
                        wordBreak="break-all"
                      >
                        {selectedOrder.activation_code}
                      </Text>
                      <Button
                        size="sm"
                        variant="ghost"
                        colorScheme="purple"
                        onClick={() => handleCopyCode(selectedOrder.activation_code)}
                      >
                        {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                      </Button>
                    </HStack>
                  </Box>
                ) : null}

                {/* Activation Link Button */}
                {selectedOrder.short_url && (
                  <Button
                    as="a"
                    href={selectedOrder.short_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    w="full"
                    size="lg"
                    bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    color="white"
                    _hover={{ opacity: 0.9, transform: 'translateY(-1px)' }}
                    _active={{ transform: 'translateY(0)' }}
                    rightIcon={<ExternalLink size={18} />}
                    boxShadow="md"
                    transition="all 0.2s"
                  >
                    Открыть ссылку активации
                  </Button>
                )}

                {/* SM-DP+ Address */}
                {selectedOrder.smdp_address && (
                  <Box bg="blue.50" p={4} borderRadius="xl" w="full">
                    <Text fontSize="xs" color="blue.600" mb={1}>SM-DP+ адрес:</Text>
                    <Text fontSize="sm" fontWeight="600" fontFamily="mono">
                      {selectedOrder.smdp_address}
                    </Text>
                  </Box>
                )}

                {/* Instructions */}
                <Alert status="info" borderRadius="lg">
                  <Info size={20} style={{ marginRight: '12px', flexShrink: 0 }} />
                  <Text fontSize="sm">
                    Откройте настройки телефона, перейдите в раздел "Сотовая связь" и отсканируйте QR-код или используйте ссылку активации выше для установки eSIM.
                  </Text>
                </Alert>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter gap={3}>
            <Button
              variant="outline"
              colorScheme="purple"
              leftIcon={<Share2 size={18} />}
              onClick={handleShareQr}
              flex={1}
            >
              Поделиться
            </Button>
            <Button
              bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              color="white"
              _hover={{ opacity: 0.9 }}
              onClick={onQrModalClose}
              flex={1}
            >
              Закрыть
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal isOpen={isCancelModalOpen} onClose={onCancelModalClose} isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent mx={4} borderRadius="2xl">
          <ModalHeader>
            <HStack spacing={3}>
              <Box bg="red.100" p={2} borderRadius="lg">
                <AlertTriangle size={24} color="#dc2626" />
              </Box>
              <Text>Отменить eSIM?</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <Text color="gray.600">
                Вы уверены, что хотите отменить этот eSIM? Это действие нельзя отменить.
              </Text>
              {orderToCancel && (
                <Box bg="gray.50" p={4} borderRadius="lg">
                  <VStack align="stretch" spacing={2}>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.500">Пакет:</Text>
                      <Text fontSize="sm" fontWeight="600">{orderToCancel.package_name}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.500">Заказ:</Text>
                      <Text fontSize="sm" fontWeight="600">#{orderToCancel.order_no}</Text>
                    </HStack>
                  </VStack>
                </Box>
              )}
              <Alert status="warning" borderRadius="lg">
                <AlertIcon />
                <Text fontSize="sm">
                  eSIM можно отменить только если он ещё не был установлен на устройство.
                </Text>
              </Alert>
            </VStack>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button variant="outline" onClick={onCancelModalClose}>
              Отмена
            </Button>
            <Button
              colorScheme="red"
              onClick={handleConfirmCancel}
              leftIcon={<XCircle size={18} />}
            >
              Да, отменить
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Cancel Success Modal */}
      <Modal isOpen={isCancelSuccessOpen} onClose={onCancelSuccessClose} isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent mx={4} borderRadius="2xl">
          <ModalHeader>
            <HStack spacing={3}>
              <Box bg="green.100" p={2} borderRadius="lg">
                <CheckCircle size={24} color="#16a34a" />
              </Box>
              <Text>eSIM отменён</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <Text color="gray.600">
                eSIM успешно отменён. Стоимость возвращена на баланс.
              </Text>
              <Alert status="success" borderRadius="lg">
                <AlertIcon />
                <Text fontSize="sm">
                  Средства будут зачислены на баланс в течение нескольких минут.
                </Text>
              </Alert>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              color="white"
              _hover={{ opacity: 0.9 }}
              onClick={onCancelSuccessClose}
            >
              Понятно
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default MyPage;
