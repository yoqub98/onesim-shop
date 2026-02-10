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
  ChevronRight,
  Pause,
  Calendar,
  Clock,
  Hash,
  Wifi,
  MapPin,
  Info,
  Heart,
} from 'lucide-react';
import { ReactComponent as AppleIcon } from '../assets/icons/appleIcon.svg';
import { ReactComponent as AndroidIcon } from '../assets/icons/androidIcon.svg';
import CountryFlag from '../components/CountryFlag';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useFavorites } from '../contexts/FavoritesContext.jsx';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { getTranslation } from '../config/i18n.js';
import {
  getUserOrders,
  checkOrderStatus,
  cancelOrder,
  suspendEsim,
  cancelEsimProfile,
  canCancelEsim,
} from '../services/orderService';
import MyProfile from './MyProfile.jsx';
import MyEsims from './MyEsims.jsx';
import MyFavorites from './MyFavorites.jsx';
import TopUpPlansModal from '../components/TopUpPlansModal.jsx';
import TopUpConfirmModal from '../components/TopUpConfirmModal.jsx';

const MyPage = () => {
  console.log('🔵 MyPage component rendering...');
  const { user, profile } = useAuth();
  const { favoriteIds } = useFavorites();
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
  const { isOpen: isDetailsModalOpen, onOpen: onDetailsModalOpen, onClose: onDetailsModalClose } = useDisclosure();
  const { isOpen: isCancelModalOpen, onOpen: onCancelModalOpen, onClose: onCancelModalClose } = useDisclosure();
  const { isOpen: isCancelSuccessOpen, onOpen: onCancelSuccessOpen, onClose: onCancelSuccessClose } = useDisclosure();
  const { isOpen: isTopupPlansOpen, onOpen: onTopupPlansOpen, onClose: onTopupPlansClose } = useDisclosure();
  const { isOpen: isTopupConfirmOpen, onOpen: onTopupConfirmOpen, onClose: onTopupConfirmClose } = useDisclosure();

  const [selectedTopupOrder, setSelectedTopupOrder] = useState(null);
  const [selectedTopupPlan, setSelectedTopupPlan] = useState(null);

  // Fetch user orders
  const fetchOrders = useCallback(async (fetchLiveStatus = false) => {
    if (!user?.id) {
      console.log('⏭️ [FETCH-ORDERS] No user ID, skipping fetch');
      return;
    }

    console.log('📥 [FETCH-ORDERS] ========== FETCHING USER ORDERS ==========');
    console.log('📥 [FETCH-ORDERS] User ID:', user.id, 'Live status:', fetchLiveStatus);
    setIsLoading(true);
    setError(null);

    try {
      const userOrders = await getUserOrders(user.id, fetchLiveStatus);
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
          order_usage: order.order_usage,
          total_volume: order.total_volume,
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

  // Handle details modal
  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    onDetailsModalOpen();
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

  // Handle top-up button click
  const handleTopupClick = (order) => {
    console.log('💳 [MyPage] Top-up clicked for order:', order.id);
    setSelectedTopupOrder(order);
    onTopupPlansOpen();
  };

  // Handle plan selection
  const handlePlanSelected = (plan) => {
    console.log('💳 [MyPage] Plan selected:', plan);
    setSelectedTopupPlan(plan);
    onTopupPlansClose();
    onTopupConfirmOpen();
  };

  // Handle top-up success
  const handleTopupSuccess = () => {
    console.log('✅ [MyPage] Top-up successful');
    // Refresh orders to show updated data
    fetchOrders();
    setSelectedTopupOrder(null);
    setSelectedTopupPlan(null);
  };

  // Handle top-up modals close
  const handleTopupPlansClose = () => {
    setSelectedTopupOrder(null);
    setSelectedTopupPlan(null);
    onTopupPlansClose();
  };

  const handleTopupConfirmClose = () => {
    setSelectedTopupPlan(null);
    onTopupConfirmClose();
    // Re-open plans modal if user cancels confirmation
    if (selectedTopupOrder) {
      setTimeout(() => onTopupPlansOpen(), 100);
    }
  };

  console.log('🎨 About to render MyPage JSX, orders count:', orders.length);

  return (
    <Box minH="calc(100vh - 80px)" bg="gray.50" py={{ base: 4, md: 10 }}>
      <Container maxW={{ base: '100%', md: '1700px' }} px={{ base: 3, md: 6 }}>
        <Tabs>
          <TabList mb={{ base: 4, md: 6 }} bg="white" p={{ base: 1.5, md: 2 }} borderRadius={{ base: 'xl', md: '2xl' }} shadow="sm" border="1px solid" borderColor="gray.100">
            <Tab
              fontWeight="700"
              fontSize={{ base: 'sm', md: 'md' }}
              borderRadius={{ base: 'lg', md: 'xl' }}
              color="gray.600"
              px={{ base: 3, md: 4 }}
              _selected={{
                bg: '#FE4F18',
                color: 'white',
              }}
              _hover={{
                color: '#FE4F18',
              }}
              transition="all 0.2s"
            >
              <HStack spacing={{ base: 1.5, md: 2 }}>
                <User size={18} />
                <Text display={{ base: 'none', sm: 'block' }}>Профиль</Text>
                <Text display={{ base: 'block', sm: 'none' }}>Я</Text>
              </HStack>
            </Tab>
            <Tab
              fontWeight="700"
              fontSize={{ base: 'sm', md: 'md' }}
              borderRadius={{ base: 'lg', md: 'xl' }}
              color="gray.600"
              px={{ base: 3, md: 4 }}
              _selected={{
                bg: '#FE4F18',
                color: 'white',
              }}
              _hover={{
                color: '#FE4F18',
              }}
              transition="all 0.2s"
            >
              <HStack spacing={{ base: 1.5, md: 2 }}>
                <Package size={18} />
                <Text>eSIM</Text>
                {orders.length > 0 && (
                  <Badge
                    bg="#FEF3C7"
                    color="#92400E"
                    borderRadius="full"
                    fontSize="xs"
                    fontWeight="700"
                    px={{ base: 1.5, md: 2 }}
                  >
                    {orders.length}
                  </Badge>
                )}
              </HStack>
            </Tab>
            <Tab
              fontWeight="700"
              fontSize={{ base: 'sm', md: 'md' }}
              borderRadius={{ base: 'lg', md: 'xl' }}
              color="gray.600"
              px={{ base: 3, md: 4 }}
              _selected={{
                bg: '#FE4F18',
                color: 'white',
              }}
              _hover={{
                color: '#FE4F18',
              }}
              transition="all 0.2s"
            >
              <HStack spacing={{ base: 1.5, md: 2 }}>
                <Heart size={18} />
                <Text display={{ base: 'none', sm: 'block' }}>Избранное</Text>
                <Text display={{ base: 'block', sm: 'none' }}>❤️</Text>
                {favoriteIds.length > 0 && (
                  <Badge
                    bg="#FEF3C7"
                    color="#92400E"
                    borderRadius="full"
                    fontSize="xs"
                    fontWeight="700"
                    px={{ base: 1.5, md: 2 }}
                  >
                    {favoriteIds.length}
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
                handleViewDetails={handleViewDetails}
                handleCancelClick={handleCancelClick}
                handleCheckStatus={handleCheckStatus}
                handleTopup={handleTopupClick}
              />
            </TabPanel>

            {/* Favorites Tab */}
            <TabPanel p={0}>
              <MyFavorites />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>

      {/* QR Code Modal - New Design */}
      <Modal isOpen={isQrModalOpen} onClose={onQrModalClose} isCentered size={{ base: 'full', md: 'lg' }}>
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(8px)" />
        <ModalContent
          mx={{ base: 0, md: 4 }}
          borderRadius={{ base: '0', md: '3xl' }}
          maxW={{ base: '100%', md: '500px' }}
          maxH={{ base: '100vh', md: 'auto' }}
          my={{ base: 0, md: 'auto' }}
        >
          <ModalHeader textAlign="center" pt={{ base: 6, md: 8 }} pb={4}>
            <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="700" color="gray.800">
              {getTranslation(currentLanguage, 'myPage.qrModal.title')}
            </Text>
          </ModalHeader>
          <ModalCloseButton top={{ base: 4, md: 3 }} right={{ base: 4, md: 3 }} />
          <ModalBody pb={{ base: 6, md: 8 }} px={{ base: 5, md: 8 }} overflowY="auto">
            {selectedOrder && (
              <VStack spacing={{ base: 4, md: 5 }}>
                {/* Country Flag + Plan Name */}
                <HStack spacing={3} justify="center">
                  {selectedOrder.country_code && (
                    <Box
                      borderRadius="lg"
                      overflow="hidden"
                      width={{ base: '28px', md: '32px' }}
                      height={{ base: '20px', md: '24px' }}
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
                  <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="600" color="gray.700">
                    {selectedOrder.package_name}
                  </Text>
                </HStack>

                {/* QR Code */}
                {selectedOrder.qr_code_url && (
                  <Box
                    bg="gray.100"
                    p={{ base: 6, md: 8 }}
                    borderRadius="2xl"
                    w="full"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Image
                      src={selectedOrder.qr_code_url}
                      alt="QR Code"
                      maxW={{ base: '180px', md: '200px' }}
                      mx="auto"
                    />
                  </Box>
                )}

                {/* Instructions */}
                <VStack spacing={2}>
                  <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.600" textAlign="center" lineHeight="1.6">
                    {getTranslation(currentLanguage, 'myPage.qrModal.instructions')}
                  </Text>
                  {selectedOrder.expiry_date && (
                    <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.700" textAlign="center" fontWeight="600">
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
                </VStack>

                {/* Quick Install Buttons - Side by Side */}
                {selectedOrder.activation_code && (
                  <VStack spacing={{ base: 2, md: 3 }} w="full">
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
                      px={{ base: 4, md: 6 }}
                      py={{ base: 3, md: 4 }}
                      h="auto"
                      w="full"
                      justifyContent="space-between"
                    >
                      <HStack spacing={{ base: 3, md: 4 }}>
                        <Box flexShrink={0}>
                          <AppleIcon style={{ width: '32px', height: '32px' }} />
                        </Box>
                        <VStack align="flex-start" spacing={0}>
                          <Text fontSize={{ base: 'sm', md: 'md' }} fontWeight="700" color="gray.900">
                            {getTranslation(currentLanguage, 'myPage.qrModal.quickInstallIOS')}
                          </Text>
                          <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.500" fontWeight="400">
                            {getTranslation(currentLanguage, 'myPage.qrModal.quickInstallIOSHelper')}
                          </Text>
                        </VStack>
                      </HStack>
                      <ChevronRight size={18} color="#9CA3AF" />
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
                      px={{ base: 4, md: 6 }}
                      py={{ base: 3, md: 4 }}
                      h="auto"
                      w="full"
                      justifyContent="space-between"
                    >
                      <HStack spacing={{ base: 3, md: 4 }}>
                        <Box flexShrink={0}>
                          <AndroidIcon style={{ width: '32px', height: '32px' }} />
                        </Box>
                        <VStack align="flex-start" spacing={0}>
                          <Text fontSize={{ base: 'sm', md: 'md' }} fontWeight="700" color="gray.900">
                            {getTranslation(currentLanguage, 'myPage.qrModal.quickInstallAndroid')}
                          </Text>
                          <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.500" fontWeight="400">
                            {getTranslation(currentLanguage, 'myPage.qrModal.quickInstallAndroidHelper')}
                          </Text>
                        </VStack>
                      </HStack>
                      <ChevronRight size={18} color="#9CA3AF" />
                    </Button>
                  </VStack>
                )}

                {/* Troubleshooting Link */}
                <VStack spacing={1}>
                  <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.600">
                    {getTranslation(currentLanguage, 'myPage.qrModal.troubleShooting')}
                  </Text>
                  <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.600" textAlign="center">
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

                {/* Terms and Conditions Agreement */}
                <Text fontSize={{ base: '2xs', md: 'xs' }} color="gray.500" textAlign="center" lineHeight="1.5">
                  {currentLanguage === 'uz'
                    ? "eSIM-ni faollashtirish orqali siz bizning "
                    : "Активируя eSIM, вы соглашаетесь с нашими "}
                  <Text
                    as="a"
                    href="/terms"
                    color="gray.600"
                    textDecoration="underline"
                    fontWeight="500"
                    _hover={{ color: 'gray.800' }}
                  >
                    {currentLanguage === 'uz'
                      ? "Shartlar va shartlar"
                      : "Условиями использования"}
                  </Text>
                </Text>

                {/* Close Button */}
                <Button
                  onClick={onQrModalClose}
                  w="full"
                  size="lg"
                  bg="gray.200"
                  color="gray.700"
                  borderRadius="full"
                  _hover={{ bg: 'gray.300' }}
                  fontWeight="600"
                  py={{ base: 4, md: 6 }}
                  h="auto"
                  fontSize={{ base: 'md', md: 'lg' }}
                >
                  {getTranslation(currentLanguage, 'myPage.qrModal.close')}
                </Button>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* eSIM Details Modal */}
      <Modal isOpen={isDetailsModalOpen} onClose={onDetailsModalClose} isCentered size={{ base: 'full', md: 'xl' }}>
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(8px)" />
        <ModalContent
          mx={{ base: 0, md: 4 }}
          borderRadius={{ base: '0', md: '3xl' }}
          maxW={{ base: '100%', md: '600px' }}
          maxH={{ base: '100vh', md: 'auto' }}
          my={{ base: 0, md: 'auto' }}
        >
          <ModalHeader textAlign="center" pt={{ base: 6, md: 8 }} pb={4} borderBottom="1px solid" borderColor="gray.100">
            <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="700" color="gray.800">
              {currentLanguage === 'uz' ? "eSIM tafsilotlari" : "Подробная информация"}
            </Text>
          </ModalHeader>
          <ModalCloseButton top={{ base: 4, md: 3 }} right={{ base: 4, md: 3 }} />
          <ModalBody pb={{ base: 6, md: 8 }} px={{ base: 5, md: 8 }} overflowY="auto">
            {selectedOrder && (
              <VStack spacing={{ base: 4, md: 5 }} align="stretch">
                {/* Package Name */}
                <Box>
                  <HStack spacing={2} mb={2}>
                    <Package size={18} color="#F97316" />
                    <Text fontSize="sm" fontWeight="600" color="gray.500">
                      {currentLanguage === 'uz' ? "Paket nomi" : "Название пакета"}
                    </Text>
                  </HStack>
                  <Text fontSize="lg" fontWeight="700" color="gray.900">
                    {selectedOrder.package_name || '-'}
                  </Text>
                </Box>

                {/* Order No */}
                <Box>
                  <HStack spacing={2} mb={2}>
                    <Hash size={18} color="#F97316" />
                    <Text fontSize="sm" fontWeight="600" color="gray.500">
                      {currentLanguage === 'uz' ? "Buyurtma raqami" : "Номер заказа"}
                    </Text>
                  </HStack>
                  <Text fontSize="md" fontWeight="600" color="gray.900" fontFamily="monospace">
                    {selectedOrder.order_no || '-'}
                  </Text>
                </Box>

                {/* ICCID - Only show if activated */}
                {selectedOrder.iccid && (
                  <Box>
                    <HStack spacing={2} mb={2}>
                      <Info size={18} color="#F97316" />
                      <Text fontSize="sm" fontWeight="600" color="gray.500">
                        ICCID
                      </Text>
                    </HStack>
                    <Text fontSize="md" fontWeight="600" color="gray.900" fontFamily="monospace">
                      {selectedOrder.iccid}
                    </Text>
                  </Box>
                )}

                <Box height="1px" bg="gray.200" my={2} />

                {/* Total Data */}
                <HStack justify="space-between">
                  <HStack spacing={2}>
                    <Wifi size={18} color="#F97316" />
                    <Text fontSize="sm" fontWeight="600" color="gray.600">
                      {currentLanguage === 'uz' ? "Jami internet" : "Всего данных"}
                    </Text>
                  </HStack>
                  <Text fontSize="md" fontWeight="700" color="gray.900">
                    {selectedOrder.data_amount || '-'}
                  </Text>
                </HStack>

                {/* Region */}
                <HStack justify="space-between">
                  <HStack spacing={2}>
                    <MapPin size={18} color="#F97316" />
                    <Text fontSize="sm" fontWeight="600" color="gray.600">
                      {currentLanguage === 'uz' ? "Hudud" : "Регион"}
                    </Text>
                  </HStack>
                  <Text fontSize="md" fontWeight="700" color="gray.900">
                    {selectedOrder.country_code || '-'}
                  </Text>
                </HStack>

                {/* Duration */}
                <HStack justify="space-between">
                  <HStack spacing={2}>
                    <Clock size={18} color="#F97316" />
                    <Text fontSize="sm" fontWeight="600" color="gray.600">
                      {currentLanguage === 'uz' ? "Muddati" : "Срок действия"}
                    </Text>
                  </HStack>
                  <Text fontSize="md" fontWeight="700" color="gray.900">
                    {selectedOrder.validity_days ? `${selectedOrder.validity_days} ${currentLanguage === 'uz' ? 'kun' : 'дней'}` : '-'}
                  </Text>
                </HStack>

                {/* Package Code */}
                <HStack justify="space-between">
                  <Text fontSize="sm" fontWeight="600" color="gray.600">
                    {currentLanguage === 'uz' ? "Paket kodi" : "Код пакета"}
                  </Text>
                  <Text fontSize="sm" fontWeight="600" color="gray.900" fontFamily="monospace">
                    {selectedOrder.package_code || '-'}
                  </Text>
                </HStack>

                <Box height="1px" bg="gray.200" my={2} />

                {/* Ordered At */}
                <HStack justify="space-between">
                  <HStack spacing={2}>
                    <Calendar size={18} color="#F97316" />
                    <Text fontSize="sm" fontWeight="600" color="gray.600">
                      {currentLanguage === 'uz' ? "Buyurtma sanasi" : "Дата заказа"}
                    </Text>
                  </HStack>
                  <Text fontSize="sm" fontWeight="600" color="gray.900">
                    {selectedOrder.created_at
                      ? new Date(selectedOrder.created_at).toLocaleString(
                          currentLanguage === 'uz' ? 'uz-UZ' : 'ru-RU',
                          {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            timeZoneName: 'short',
                          }
                        )
                      : '-'}
                  </Text>
                </HStack>

                {/* Activation Date - Only if activated */}
                {selectedOrder.activation_date && (
                  <HStack justify="space-between">
                    <HStack spacing={2}>
                      <CheckCircle size={18} color="#10B981" />
                      <Text fontSize="sm" fontWeight="600" color="gray.600">
                        {currentLanguage === 'uz' ? "Faollashtirilgan" : "Дата активации"}
                      </Text>
                    </HStack>
                    <Text fontSize="sm" fontWeight="600" color="gray.900">
                      {new Date(selectedOrder.activation_date).toLocaleString(
                        currentLanguage === 'uz' ? 'uz-UZ' : 'ru-RU',
                        {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          timeZoneName: 'short',
                        }
                      )}
                    </Text>
                  </HStack>
                )}

                {/* Action Buttons */}
                <VStack spacing={3} mt={4}>
                  {/* Suspend Button - Only for IN_USE status */}
                  {selectedOrder.esim_status === 'IN_USE' && selectedOrder.iccid && (
                    <Button
                      w="full"
                      py={4}
                      h="auto"
                      variant="outline"
                      borderWidth="2px"
                      borderColor="orange.400"
                      color="orange.600"
                      borderRadius="full"
                      leftIcon={<Pause size={20} />}
                      onClick={async () => {
                        try {
                          await suspendEsim(selectedOrder.iccid);
                          // Refresh orders after suspend
                          fetchOrders();
                          onDetailsModalClose();
                        } catch (error) {
                          console.error('Failed to suspend:', error);
                        }
                      }}
                      fontWeight="700"
                      fontSize="md"
                      _hover={{ bg: 'orange.50' }}
                    >
                      {currentLanguage === 'uz' ? "To'xtatish" : "Приостановить"}
                    </Button>
                  )}

                  {/* Cancel Button - Only for GOT_RESOURCE + RELEASED */}
                  {canCancelEsim(selectedOrder.esim_status, selectedOrder.smdp_status) &&
                    selectedOrder.esim_tran_no && (
                      <Button
                        w="full"
                        py={4}
                        h="auto"
                        variant="outline"
                        borderWidth="2px"
                        borderColor="red.400"
                        color="red.600"
                        borderRadius="full"
                        leftIcon={<XCircle size={20} />}
                        onClick={async () => {
                          try {
                            await cancelEsimProfile(selectedOrder.esim_tran_no);
                            // Refresh orders after cancel
                            fetchOrders();
                            onDetailsModalClose();
                          } catch (error) {
                            console.error('Failed to cancel:', error);
                          }
                        }}
                        fontWeight="700"
                        fontSize="md"
                        _hover={{ bg: 'red.50' }}
                      >
                        {currentLanguage === 'uz' ? "Bekor qilish" : "Отменить eSIM"}
                      </Button>
                    )}

                  {/* Close Button */}
                  <Button
                    w="full"
                    py={4}
                    h="auto"
                    bg="gray.200"
                    color="gray.700"
                    borderRadius="full"
                    onClick={onDetailsModalClose}
                    fontWeight="700"
                    fontSize="md"
                    _hover={{ bg: 'gray.300' }}
                  >
                    {currentLanguage === 'uz' ? "Yopish" : "Закрыть"}
                  </Button>
                </VStack>
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

      {/* Top-up Plans Modal */}
      <TopUpPlansModal
        isOpen={isTopupPlansOpen}
        onClose={handleTopupPlansClose}
        order={selectedTopupOrder}
        userId={user?.id}
        onSelectPlan={handlePlanSelected}
      />

      {/* Top-up Confirm Modal */}
      <TopUpConfirmModal
        isOpen={isTopupConfirmOpen}
        onClose={handleTopupConfirmClose}
        order={selectedTopupOrder}
        userId={user?.id}
        selectedPlan={selectedTopupPlan}
        onSuccess={handleTopupSuccess}
      />
    </Box>
  );
};

export default MyPage;
