// src/pages/PackagePage.jsx
import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Badge,
  Grid,
  GridItem,
  Divider,
  List,
  ListItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import {
  ArrowLeft,
  Wifi,
  Calendar,
  Database,
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
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import CountryFlag from '../components/CountryFlag';
import { getCountryName } from '../config/i18n';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { createOrder } from '../services/orderService';

const PackagePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentLanguage } = useLanguage();

  const [isOrdering, setIsOrdering] = useState(false);
  const [orderError, setOrderError] = useState(null);

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

  // Redirect if no plan data
  if (!plan) {
    return (
      <Box minH="100vh" bg="gray.50" py={20}>
        <Container maxW="4xl" textAlign="center">
          <Heading mb={4}>Пакет не найден</Heading>
          <Text color="gray.600" mb={6}>Информация о пакете недоступна</Text>
          <Button onClick={() => navigate('/')} colorScheme="purple">
            Вернуться на главную
          </Button>
        </Container>
      </Box>
    );
  }

  const countryName = getCountryName(countryCode, currentLanguage);
  const operatorName = plan.operatorList?.[0]?.operatorName || 'Не указан';
  const networkType = plan.operatorList?.[0]?.networkType || '4G/LTE';
  const packageType = plan.smsSupported || plan.callsSupported ? 'Данные + Звонки/SMS' : 'Только данные';

  const installationSteps = [
    { icon: Mail, text: 'После покупки QR-код будет в разделе "Мои eSIM"' },
    { icon: Settings, text: 'Откройте настройки телефона' },
    { icon: QrCode, text: 'Отсканируйте QR-код' },
    { icon: Download, text: 'Установите профиль eSIM' },
    { icon: Smartphone, text: 'Активируйте и начните использовать' },
  ];

  // Handle purchase button click
  const handlePurchaseClick = async () => {
    // Check if user is logged in
    if (!user) {
      onLoginModalOpen();
      return;
    }

    // User is logged in, proceed with order
    setIsOrdering(true);
    setOrderError(null);

    try {
      // Extract price from formatted string (e.g., "150 000" -> 150000)
      const priceUzs = parseFloat(plan.price.replace(/\s/g, '')) || 0;

      const orderData = {
        userId: user.id,
        userEmail: user.email,
        packageCode: plan.packageCode || plan.id,
        packageName: plan.name || `${plan.data} - ${plan.days} дней`,
        countryCode: countryCode,
        dataAmount: plan.data,
        validityDays: plan.days,
        priceUzs: priceUzs,
        priceUsd: plan.priceUSD || 0,
      };

      await createOrder(orderData);

      onSuccessModalOpen();

    } catch (error) {
      console.error('Order failed:', error);
      setOrderError(error.message || 'Не удалось создать заказ. Попробуйте позже.');
      onErrorModalOpen();
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Header */}
      <Box bg="white" borderBottom="1px solid" borderColor="gray.200" py={4}>
        <Container maxW="6xl">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            fontWeight="600"
            color="gray.700"
            _hover={{ bg: 'gray.100' }}
          >
            <HStack spacing={2}>
              <ArrowLeft size={20} />
              <Text>Назад</Text>
            </HStack>
          </Button>
        </Container>
      </Box>

      <Container maxW="6xl" py={8}>
        <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={8}>
          {/* Main Content */}
          <GridItem>
            {/* Package Header */}
            <Box bg="white" borderRadius="2xl" p={6} mb={6} shadow="sm">
              <HStack spacing={4} mb={6}>
                <Box
                  borderRadius="xl"
                  overflow="hidden"
                  width="60px"
                  height="45px"
                  border="2px solid"
                  borderColor="gray.200"
                  flexShrink={0}
                >
                  <CountryFlag
                    code={countryCode}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Box>
                <VStack align="flex-start" spacing={0}>
                  <Heading size="lg" color="gray.800">
                    eSIM для {countryName}
                  </Heading>
                  <Text color="gray.500" fontSize="sm">
                    {plan.name || `${plan.data} / ${plan.days} дней`}
                  </Text>
                </VStack>
              </HStack>

              {/* Key Details Grid */}
              <Grid templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)' }} gap={4}>
                {/* Data Volume */}
                <Box bg="purple.50" p={4} borderRadius="xl" border="1px solid" borderColor="purple.100">
                  <HStack spacing={3}>
                    <Box bg="purple.100" p={2} borderRadius="lg">
                      <Database size={20} color="#7c3aed" />
                    </Box>
                    <VStack align="flex-start" spacing={0}>
                      <Text fontSize="xs" color="purple.600" fontWeight="600">Объем данных</Text>
                      <Text fontSize="xl" fontWeight="700" color="purple.700">{plan.data}</Text>
                    </VStack>
                  </HStack>
                </Box>

                {/* Validity */}
                <Box bg="blue.50" p={4} borderRadius="xl" border="1px solid" borderColor="blue.100">
                  <HStack spacing={3}>
                    <Box bg="blue.100" p={2} borderRadius="lg">
                      <Calendar size={20} color="#2563eb" />
                    </Box>
                    <VStack align="flex-start" spacing={0}>
                      <Text fontSize="xs" color="blue.600" fontWeight="600">Срок действия</Text>
                      <Text fontSize="xl" fontWeight="700" color="blue.700">{plan.days} дней</Text>
                    </VStack>
                  </HStack>
                </Box>

                {/* Network Type */}
                <Box bg="green.50" p={4} borderRadius="xl" border="1px solid" borderColor="green.100">
                  <HStack spacing={3}>
                    <Box bg="green.100" p={2} borderRadius="lg">
                      <Wifi size={20} color="#16a34a" />
                    </Box>
                    <VStack align="flex-start" spacing={0}>
                      <Text fontSize="xs" color="green.600" fontWeight="600">Тип сети</Text>
                      <Text fontSize="xl" fontWeight="700" color="green.700">{plan.speed || networkType}</Text>
                    </VStack>
                  </HStack>
                </Box>

                {/* Package Type */}
                <Box bg="orange.50" p={4} borderRadius="xl" border="1px solid" borderColor="orange.100">
                  <HStack spacing={3}>
                    <Box bg="orange.100" p={2} borderRadius="lg">
                      <Phone size={20} color="#ea580c" />
                    </Box>
                    <VStack align="flex-start" spacing={0}>
                      <Text fontSize="xs" color="orange.600" fontWeight="600">Тип пакета</Text>
                      <Text fontSize="lg" fontWeight="700" color="orange.700">{packageType}</Text>
                    </VStack>
                  </HStack>
                </Box>
              </Grid>
            </Box>

            {/* Provider & Coverage Info */}
            <Box bg="white" borderRadius="2xl" p={6} mb={6} shadow="sm">
              <Heading size="md" mb={4} color="gray.800">Информация о провайдере</Heading>

              <VStack align="stretch" spacing={4}>
                <HStack justify="space-between" py={2}>
                  <HStack spacing={3}>
                    <Radio size={18} color="#6b7280" />
                    <Text color="gray.600">Оператор</Text>
                  </HStack>
                  <Text fontWeight="700" color="gray.800">{operatorName}</Text>
                </HStack>

                <Divider />

                <HStack justify="space-between" py={2}>
                  <HStack spacing={3}>
                    <Globe size={18} color="#6b7280" />
                    <Text color="gray.600">Покрытие</Text>
                  </HStack>
                  <Text fontWeight="700" color="gray.800">{countryName}</Text>
                </HStack>

                <Divider />

                <HStack justify="space-between" py={2}>
                  <HStack spacing={3}>
                    <Wifi size={18} color="#6b7280" />
                    <Text color="gray.600">Скорость</Text>
                  </HStack>
                  <Badge colorScheme="purple" fontSize="sm" px={3} py={1}>
                    {plan.speed || '4G/LTE'}
                  </Badge>
                </HStack>

                {plan.operatorList && plan.operatorList.length > 1 && (
                  <>
                    <Divider />
                    <Box py={2}>
                      <Text color="gray.600" mb={2}>Все операторы:</Text>
                      <HStack flexWrap="wrap" spacing={2}>
                        {plan.operatorList.map((op, idx) => (
                          <Badge key={idx} colorScheme="blue" fontSize="xs" px={2} py={1}>
                            {op.operatorName} {op.networkType && `(${op.networkType})`}
                          </Badge>
                        ))}
                      </HStack>
                    </Box>
                  </>
                )}
              </VStack>
            </Box>

            {/* Installation Instructions */}
            <Box bg="white" borderRadius="2xl" p={6} shadow="sm">
              <Heading size="md" mb={4} color="gray.800">Инструкция по установке</Heading>

              <List spacing={4}>
                {installationSteps.map((step, index) => (
                  <ListItem key={index} display="flex" alignItems="flex-start">
                    <Box
                      bg="purple.100"
                      p={2}
                      borderRadius="lg"
                      mr={4}
                      flexShrink={0}
                    >
                      <step.icon size={18} color="#7c3aed" />
                    </Box>
                    <VStack align="flex-start" spacing={0}>
                      <Text fontWeight="600" color="gray.700">Шаг {index + 1}</Text>
                      <Text color="gray.600">{step.text}</Text>
                    </VStack>
                  </ListItem>
                ))}
              </List>
            </Box>
          </GridItem>

          {/* Sidebar - Purchase Section */}
          <GridItem>
            <Box
              bg="white"
              borderRadius="2xl"
              p={6}
              shadow="sm"
              position="sticky"
              top="100px"
            >
              <VStack align="stretch" spacing={6}>
                <Box textAlign="center">
                  <Text fontSize="sm" color="gray.500" fontWeight="600" mb={1}>
                    Стоимость пакета
                  </Text>
                  <HStack justify="center" spacing={2}>
                    <Heading fontSize="4xl" fontWeight="700" color="gray.800">
                      {plan.price}
                    </Heading>
                    <Text fontSize="xl" color="gray.600" fontWeight="700">
                      UZS
                    </Text>
                  </HStack>
                </Box>

                <Divider />

                {/* Quick Summary */}
                <VStack align="stretch" spacing={3}>
                  <HStack justify="space-between">
                    <Text color="gray.500" fontSize="sm">Данные</Text>
                    <Text fontWeight="700" color="gray.700">{plan.data}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text color="gray.500" fontSize="sm">Срок</Text>
                    <Text fontWeight="700" color="gray.700">{plan.days} дней</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text color="gray.500" fontSize="sm">Регион</Text>
                    <Text fontWeight="700" color="gray.700">{countryName}</Text>
                  </HStack>
                </VStack>

                <Button
                  size="lg"
                  bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  color="white"
                  py={7}
                  fontWeight="700"
                  borderRadius="xl"
                  _hover={{
                    transform: 'translateY(-2px)',
                    shadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
                  }}
                  _disabled={{
                    opacity: 0.7,
                    cursor: 'not-allowed',
                    transform: 'none',
                  }}
                  transition="all 0.3s"
                  onClick={handlePurchaseClick}
                  isDisabled={isOrdering}
                >
                  {isOrdering ? (
                    <HStack spacing={2}>
                      <Spinner size="sm" />
                      <Text>Оформление...</Text>
                    </HStack>
                  ) : (
                    <HStack spacing={2}>
                      <ShoppingCart size={20} />
                      <Text>Купить</Text>
                    </HStack>
                  )}
                </Button>

                <HStack justify="center" spacing={4} pt={2}>
                  <HStack spacing={1}>
                    <CheckCircle size={14} color="#16a34a" />
                    <Text fontSize="xs" color="gray.500">Мгновенная доставка</Text>
                  </HStack>
                </HStack>
              </VStack>
            </Box>
          </GridItem>
        </Grid>
      </Container>

      {/* Login Required Modal */}
      <Modal isOpen={isLoginModalOpen} onClose={onLoginModalClose} isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent mx={4} borderRadius="2xl">
          <ModalHeader>
            <HStack spacing={3}>
              <Box bg="purple.100" p={2} borderRadius="lg">
                <LogIn size={24} color="#7c3aed" />
              </Box>
              <Text>Требуется авторизация</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Text color="gray.600">
              Для оформления заказа на eSIM необходимо войти в аккаунт или зарегистрироваться.
            </Text>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button variant="outline" onClick={onLoginModalClose}>
              Отмена
            </Button>
            <Button
              bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              color="white"
              _hover={{ opacity: 0.9 }}
              onClick={() => navigate('/login')}
            >
              Войти
            </Button>
            <Button
              variant="outline"
              colorScheme="purple"
              onClick={() => navigate('/signup')}
            >
              Регистрация
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Order Success Modal */}
      <Modal isOpen={isSuccessModalOpen} onClose={onSuccessModalClose} isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent mx={4} borderRadius="2xl">
          <ModalHeader>
            <HStack spacing={3}>
              <Box bg="green.100" p={2} borderRadius="lg">
                <CheckCircle size={24} color="#16a34a" />
              </Box>
              <Text>Заказ оформлен!</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack align="stretch" spacing={4}>
              <Text color="gray.600">
                Ваш eSIM успешно заказан! QR-код для активации будет доступен в разделе "Мои eSIM" через несколько минут.
              </Text>
              <Alert status="success" borderRadius="lg">
                <AlertIcon />
                <Text fontSize="sm">
                  Обработка занимает 1-2 минуты. После этого вы сможете просмотреть и скачать QR-код в личном кабинете.
                </Text>
              </Alert>
            </VStack>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button variant="outline" onClick={onSuccessModalClose}>
              Закрыть
            </Button>
            <Button
              bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              color="white"
              _hover={{ opacity: 0.9 }}
              onClick={() => navigate('/mypage')}
            >
              Перейти в профиль
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Order Error Modal */}
      <Modal isOpen={isErrorModalOpen} onClose={onErrorModalClose} isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent mx={4} borderRadius="2xl">
          <ModalHeader>
            <HStack spacing={3}>
              <Box bg="red.100" p={2} borderRadius="lg">
                <AlertCircle size={24} color="#dc2626" />
              </Box>
              <Text>Ошибка заказа</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Alert status="error" borderRadius="lg">
              <AlertIcon />
              <Text>{orderError}</Text>
            </Alert>
          </ModalBody>
          <ModalFooter>
            <Button
              bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              color="white"
              _hover={{ opacity: 0.9 }}
              onClick={onErrorModalClose}
            >
              Понятно
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default PackagePage;
