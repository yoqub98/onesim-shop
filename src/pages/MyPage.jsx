// src/pages/MyPage.jsx
import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Text,
  VStack,
  HStack,
  Badge,
  Button,
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
} from '@chakra-ui/react';
import {
  User,
  Package,
  QrCode,
  Copy,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Share2,
  ExternalLink,
  Shield,
  Info,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { getUserOrders, checkOrderStatus, cancelOrder } from '../services/orderService';
import MyProfile from './MyProfile.jsx';
import MyEsims from './MyEsims.jsx';

const MyPage = () => {
  console.log('🔵 MyPage component rendering...');
  const { user, profile } = useAuth();
  console.log('👤 User:', user?.id, 'Profile:', profile?.first_name);

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
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

  // Copy activation code to clipboard
  const [copied, setCopied] = useState(false);
  const handleCopyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
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
              <MyProfile user={user} profile={profile} orders={orders} />
            </TabPanel>

            {/* Orders Tab */}
            <TabPanel p={0}>
              <MyEsims
                orders={orders}
                isLoading={isLoading}
                error={error}
                checkingStatus={checkingStatus}
                cancellingOrder={cancellingOrder}
                fetchOrders={fetchOrders}
                handleViewQr={handleViewQr}
                handleCancelClick={handleCancelClick}
                handleCheckStatus={handleCheckStatus}
              />
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
