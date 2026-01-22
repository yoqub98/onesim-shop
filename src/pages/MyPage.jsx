// src/pages/MyPage.jsx
import { useState, useEffect, useCallback } from 'react';
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
  XCircle,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { ReactComponent as AppleIcon } from '../assets/icons/appleIcon.svg';
import { ReactComponent as AndroidIcon } from '../assets/icons/androidIcon.svg';
import CountryFlag from '../components/CountryFlag';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { getTranslation } from '../config/i18n.js';
import { getUserOrders, checkOrderStatus, cancelOrder } from '../services/orderService';
import MyProfile from './MyProfile.jsx';
import MyEsims from './MyEsims.jsx';

const MyPage = () => {
  console.log('🔵 MyPage component rendering...');
  const { user, profile } = useAuth();
  const { currentLanguage } = useLanguage();
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
  const fetchOrders = useCallback(async () => {
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
          iccid: order.iccid || 'NOT SET',
        });
      });

      setOrders(userOrders);
    } catch (err) {
      console.error('❌ [FETCH-ORDERS] Failed to fetch orders:', err);
      setError('Не удалось загрузить заказы');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // AUTO-CHECK PENDING ORDERS - Poll every 10 seconds
  useEffect(() => {
    if (!orders || orders.length === 0) return;

    const pendingOrders = orders.filter((o) => o.order_status === 'PENDING');

    if (pendingOrders.length === 0) {
      console.log('⏭️ [AUTO-CHECK] No pending orders to check');
      return;
    }

    console.log(
      '🔄 [AUTO-CHECK] Found',
      pendingOrders.length,
      'pending order(s). Setting up auto-check...'
    );

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
  }, [orders, fetchOrders]); // Re-run when orders change

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
        setOrders((prev) =>
          prev.map((o) => (o.id === orderToCancel.id ? { ...o, order_status: 'CANCELLED' } : o))
        );
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
        setOrders((prev) => prev.map((o) => (o.id === orderId ? result.data : o)));
      }
    } catch (err) {
      console.error('Failed to check status:', err);
    } finally {
      setCheckingStatus(null);
    }
  };

  console.log('🎨 About to render MyPage JSX, orders count:', orders.length);

  return (
    <Box minH="calc(100vh - 80px)" bg="gray.50" py={10}>
      <Container maxW="6xl">
        <Tabs>
          <TabList mb={6} bg="white" p={2} borderRadius="2xl" shadow="sm" border="1px solid" borderColor="gray.100">
            <Tab
              fontWeight="700"
              fontSize="md"
              borderRadius="xl"
              color="gray.600"
              _selected={{
                bg: '#FE4F18',
                color: 'white',
              }}
              _hover={{
                color: '#FE4F18',
              }}
              transition="all 0.2s"
            >
              <HStack spacing={2}>
                <User size={18} />
                <Text>Профиль</Text>
              </HStack>
            </Tab>
            <Tab
              fontWeight="700"
              fontSize="md"
              borderRadius="xl"
              color="gray.600"
              _selected={{
                bg: '#FE4F18',
                color: 'white',
              }}
              _hover={{
                color: '#FE4F18',
              }}
              transition="all 0.2s"
            >
              <HStack spacing={2}>
                <Package size={18} />
                <Text>Мои eSIM</Text>
                {orders.length > 0 && (
                  <Badge
                    bg="#FEF3C7"
                    color="#92400E"
                    borderRadius="full"
                    fontSize="xs"
                    fontWeight="700"
                  >
                    {orders.length}
                  </Badge>
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

      {/* QR Code Modal - New Design */}
      <Modal isOpen={isQrModalOpen} onClose={onQrModalClose} isCentered size="lg">
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(8px)" />
        <ModalContent mx={4} borderRadius="3xl" maxW="500px">
          <ModalHeader textAlign="center" pt={8} pb={4}>
            <Text fontSize="2xl" fontWeight="700" color="gray.800">
              {getTranslation(currentLanguage, 'myPage.qrModal.title')}
            </Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={8} px={8}>
            {selectedOrder && (
              <VStack spacing={5}>
                {/* Country Flag + Plan Name */}
                <HStack spacing={3} justify="center">
                  {selectedOrder.country_code && (
                    <Box
                      borderRadius="lg"
                      overflow="hidden"
                      width="32px"
                      height="24px"
                      border="1px solid"
                      borderColor="gray.200"
                      flexShrink={0}
                    >
                      <CountryFlag
                        code={selectedOrder.country_code}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </Box>
                  )}
                  <Text fontSize="lg" fontWeight="600" color="gray.700">
                    {selectedOrder.package_name}
                  </Text>
                </HStack>

                {/* QR Code */}
                {selectedOrder.qr_code_url && (
                  <Box
                    bg="gray.100"
                    p={8}
                    borderRadius="2xl"
                    w="full"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Image
                      src={selectedOrder.qr_code_url}
                      alt="QR Code"
                      maxW="200px"
                      mx="auto"
                    />
                  </Box>
                )}

                {/* Instructions */}
                <Text fontSize="sm" color="gray.600" textAlign="center" lineHeight="1.6">
                  {getTranslation(currentLanguage, 'myPage.qrModal.instructions')}
                </Text>

                {/* Quick Install Buttons - Side by Side */}
                {selectedOrder.activation_code && (
                  <VStack spacing={3} w="full">
                    {/* iOS Quick Install Button */}
                    <Button
                      as="a"
                      href={`https://esimsetup.apple.com/esim_qrcode_provisioning?carddata=${encodeURIComponent(
                        selectedOrder.activation_code
                      )}`}
                      size="lg"
                      variant="outline"
                      borderWidth="2px"
                      borderColor="#FE4F18"
                      bg="white"
                      color="gray.800"
                      borderRadius="full"
                      _hover={{
                        borderColor: '#FE4F18',
                        bg: 'gray.50',
                      }}
                      px={6}
                      py={4}
                      h="auto"
                      w="full"
                      justifyContent="flex-start"
                    >
                      <HStack spacing={4} w="full">
                        <Box flexShrink={0}>
                          <AppleIcon style={{ width: '40px', height: '40px' }} />
                        </Box>
                        <VStack align="flex-start" spacing={0} flex="1">
                          <Text fontSize="md" fontWeight="700" color="gray.900">
                            {getTranslation(currentLanguage, 'myPage.qrModal.quickInstallIOS')}
                          </Text>
                          <Text fontSize="sm" color="gray.500" fontWeight="400">
                            {getTranslation(currentLanguage, 'myPage.qrModal.quickInstallIOSHelper')}
                          </Text>
                        </VStack>
                      </HStack>
                    </Button>

                    {/* Android Quick Install Button */}
                    <Button
                      as="a"
                      href={`https://esimsetup.android.com/esim_qrcode_provisioning?carddata=${encodeURIComponent(
                        selectedOrder.activation_code
                      )}`}
                      size="lg"
                      variant="outline"
                      borderWidth="2px"
                      borderColor="#FE4F18"
                      bg="white"
                      color="gray.800"
                      borderRadius="full"
                      _hover={{
                        borderColor: '#FE4F18',
                        bg: 'gray.50',
                      }}
                      px={6}
                      py={4}
                      h="auto"
                      w="full"
                      justifyContent="flex-start"
                    >
                      <HStack spacing={4} w="full">
                        <Box flexShrink={0}>
                          <AndroidIcon style={{ width: '40px', height: '40px' }} />
                        </Box>
                        <VStack align="flex-start" spacing={0} flex="1">
                          <Text fontSize="md" fontWeight="700" color="gray.900">
                            {getTranslation(currentLanguage, 'myPage.qrModal.quickInstallAndroid')}
                          </Text>
                          <Text fontSize="sm" color="gray.500" fontWeight="400">
                            {getTranslation(currentLanguage, 'myPage.qrModal.quickInstallAndroidHelper')}
                          </Text>
                        </VStack>
                      </HStack>
                    </Button>
                  </VStack>
                )}

                {/* Expiration Date */}
                {selectedOrder.expiry_date && (
                  <Text fontSize="sm" color="gray.600" fontWeight="500">
                    {getTranslation(currentLanguage, 'myPage.qrModal.installBefore')}{' '}
                    {new Date(selectedOrder.expiry_date).toLocaleString(
                      currentLanguage === 'uz' ? 'uz-UZ' : 'ru-RU',
                      {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      }
                    )}
                  </Text>
                )}

                {/* Troubleshooting Link */}
                <VStack spacing={1}>
                  <Text fontSize="sm" color="gray.600">
                    {getTranslation(currentLanguage, 'myPage.qrModal.troubleShooting')}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {getTranslation(currentLanguage, 'myPage.qrModal.checkInstructions')}{' '}
                    <Text
                      as="a"
                      href="/how-to-install"
                      color="gray.800"
                      fontWeight="600"
                      textDecoration="underline"
                      _hover={{ color: 'purple.600' }}
                    >
                      {getTranslation(currentLanguage, 'myPage.qrModal.instructionsLink')}
                    </Text>
                  </Text>
                </VStack>

                {/* Close Button */}
                <Button
                  onClick={onQrModalClose}
                  w="full"
                  size="lg"
                  bg="gray.200"
                  color="gray.700"
                  borderRadius="xl"
                  _hover={{ bg: 'gray.300' }}
                  fontWeight="600"
                >
                  {getTranslation(currentLanguage, 'myPage.qrModal.close')}
                </Button>
              </VStack>
            )}
          </ModalBody>
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
