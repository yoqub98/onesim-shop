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
} from 'lucide-react';
import Flag from 'react-world-flags';
import { useAuth } from '../contexts/AuthContext.jsx';
import { getCountryName, DEFAULT_LANGUAGE } from '../config/i18n';
import { getUserOrders, getOrderStatusText, getOrderStatusColor } from '../services/orderService';

const MyPage = () => {
  const lang = DEFAULT_LANGUAGE;
  const { user, profile } = useAuth();

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [copied, setCopied] = useState(false);

  const { isOpen: isQrModalOpen, onOpen: onQrModalOpen, onClose: onQrModalClose } = useDisclosure();

  // Fetch user orders
  const fetchOrders = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const userOrders = await getUserOrders(user.id);
      setOrders(userOrders);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError('Не удалось загрузить заказы');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user?.id]);

  // Handle QR code modal
  const handleViewQr = (order) => {
    setSelectedOrder(order);
    onQrModalOpen();
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

  // Order Card Component
  const OrderCard = ({ order }) => {
    const statusColor = getOrderStatusColor(order.order_status);
    const statusText = getOrderStatusText(order.order_status);
    const countryName = getCountryName(order.country_code, lang);

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
              <Text fontSize="sm" fontWeight="600">{order.validity_days ? `${order.validity_days} дней` : '-'}</Text>
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
          {order.order_status === 'ALLOCATED' && (order.qr_code_url || order.activation_code) && (
            <Button
              size="md"
              bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              color="white"
              _hover={{ opacity: 0.9 }}
              onClick={() => handleViewQr(order)}
              leftIcon={<QrCode size={18} />}
            >
              Показать QR-код
            </Button>
          )}

          {order.order_status === 'PENDING' && (
            <Alert status="info" borderRadius="lg" fontSize="sm">
              <AlertIcon />
              Ваш eSIM обрабатывается. Это может занять несколько минут.
            </Alert>
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
                {/* QR Code */}
                {selectedOrder.qr_code_url ? (
                  <Box
                    bg="white"
                    p={4}
                    borderRadius="xl"
                    border="2px solid"
                    borderColor="purple.100"
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
                  <AlertIcon />
                  <Text fontSize="sm">
                    Откройте настройки телефона, перейдите в раздел "Сотовая связь" и отсканируйте этот QR-код для установки eSIM.
                  </Text>
                </Alert>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              color="white"
              _hover={{ opacity: 0.9 }}
              onClick={onQrModalClose}
            >
              Закрыть
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default MyPage;
