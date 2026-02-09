// src/components/TopUpPlansModal.jsx
import { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Button,
  Box,
  Radio,
  RadioGroup,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { BoltIcon, WifiIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../config/i18n';
import { getTopupPlans } from '../services/orderService';

const TopUpPlansModal = ({ isOpen, onClose, order, userId, onSelectPlan }) => {
  const { currentLanguage } = useLanguage();
  const t = useCallback((key) => getTranslation(currentLanguage, key), [currentLanguage]);

  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [topupCount, setTopupCount] = useState(0);
  const [maxTopups] = useState(10);

  const fetchPlans = useCallback(async () => {
    if (!order || !userId) return;

    setIsLoading(true);
    setError(null);
    setPlans([]);
    setSelectedPlanId(null);

    try {
      console.log('📥 [TopUpModal] Fetching plans for order:', order.id);
      const response = await getTopupPlans(order.id, userId);

      console.log('✅ [TopUpModal] Plans fetched:', response);
      setPlans(response.plans || []);
      setTopupCount(response.topupCount || 0);

      // Auto-select first plan if available
      if (response.plans && response.plans.length > 0) {
        setSelectedPlanId(response.plans[0].packageCode);
      }
    } catch (err) {
      console.error('❌ [TopUpModal] Failed to fetch plans:', err);
      setError(err.message || t('myPage.topup.failed'));
    } finally {
      setIsLoading(false);
    }
  }, [order, userId, t]);

  // Fetch available top-up plans when modal opens
  useEffect(() => {
    if (isOpen && order && userId) {
      fetchPlans();
    }
  }, [isOpen, order, userId, fetchPlans]);

  const handleConfirm = () => {
    const selectedPlan = plans.find((p) => p.packageCode === selectedPlanId);
    if (selectedPlan && onSelectPlan) {
      onSelectPlan(selectedPlan);
    }
  };

  const selectedPlan = plans.find((p) => p.packageCode === selectedPlanId);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size={{ base: 'full', md: 'xl' }}>
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(8px)" />
      <ModalContent
        mx={{ base: 0, md: 4 }}
        borderRadius={{ base: '0', md: '3xl' }}
        maxW={{ base: '100%', md: '600px' }}
        maxH={{ base: '100vh', md: 'auto' }}
        my={{ base: 0, md: 'auto' }}
      >
        <ModalHeader textAlign="center" pt={{ base: 6, md: 8 }} pb={4} borderBottom="1px solid" borderColor="gray.100">
          <VStack spacing={2}>
            <HStack spacing={2}>
              <BoltIcon style={{ width: '24px', height: '24px', color: '#FE4F18' }} />
              <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="700" color="gray.800">
                {t('myPage.topup.title')}
              </Text>
            </HStack>
            {order && (
              <Text fontSize="sm" color="gray.600" fontWeight="500">
                {order.package_name}
              </Text>
            )}
          </VStack>
        </ModalHeader>
        <ModalCloseButton top={{ base: 4, md: 3 }} right={{ base: 4, md: 3 }} />

        <ModalBody pb={{ base: 6, md: 8 }} px={{ base: 5, md: 8 }} overflowY="auto">
          <VStack spacing={{ base: 4, md: 5 }} align="stretch">
            {/* Top-up Count */}
            {!isLoading && topupCount > 0 && (
              <Box bg="blue.50" p={3} borderRadius="lg" border="1px solid" borderColor="blue.200">
                <Text fontSize="sm" color="blue.800" fontWeight="600">
                  {t('myPage.topup.topupCount')}: {topupCount}/{maxTopups}
                </Text>
              </Box>
            )}

            {/* Loading State */}
            {isLoading && (
              <VStack spacing={4} py={8}>
                <Spinner size="xl" color="#FE4F18" thickness="4px" />
                <Text color="gray.600">{t('myPage.topup.loading')}</Text>
              </VStack>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <Alert status="error" borderRadius="lg">
                <AlertIcon />
                <Text fontSize="sm">{error}</Text>
              </Alert>
            )}

            {/* No Plans Available */}
            {!isLoading && !error && plans.length === 0 && (
              <Alert status="info" borderRadius="lg">
                <AlertIcon />
                <Text fontSize="sm">{t('myPage.topup.noPlansAvailable')}</Text>
              </Alert>
            )}

            {/* Plans List */}
            {!isLoading && !error && plans.length > 0 && (
              <>
                <Text fontSize="md" fontWeight="600" color="gray.700">
                  {t('myPage.topup.selectPlan')}
                </Text>

                <RadioGroup value={selectedPlanId} onChange={setSelectedPlanId}>
                  <VStack spacing={3} align="stretch">
                    {plans.map((plan) => (
                      <Box
                        key={plan.packageCode}
                        as="label"
                        p={4}
                        borderRadius="xl"
                        border="2px solid"
                        borderColor={selectedPlanId === plan.packageCode ? '#FE4F18' : 'gray.200'}
                        bg={selectedPlanId === plan.packageCode ? 'orange.50' : 'white'}
                        cursor="pointer"
                        transition="all 0.2s"
                        _hover={{ borderColor: '#FE4F18', bg: 'orange.50' }}
                      >
                        <HStack justify="space-between" align="center">
                          <HStack spacing={3} flex="1">
                            <Radio value={plan.packageCode} colorScheme="orange" />
                            <HStack spacing={6} flex="1">
                              <HStack spacing={2}>
                                <WifiIcon style={{ width: '18px', height: '18px', color: '#F97316' }} />
                                <Text fontSize="xl" fontWeight="800" color="gray.900">
                                  {plan.dataGB}
                                </Text>
                                <Text fontSize="md" fontWeight="600" color="gray.600">
                                  GB
                                </Text>
                              </HStack>
                              <HStack spacing={2}>
                                <ClockIcon style={{ width: '18px', height: '18px', color: '#F97316' }} />
                                <Text fontSize="xl" fontWeight="800" color="gray.900">
                                  {plan.duration}
                                </Text>
                                <Text fontSize="md" fontWeight="600" color="gray.600">
                                  {t('myPage.orders.days')}
                                </Text>
                              </HStack>
                            </HStack>
                          </HStack>
                          <VStack align="end" spacing={0}>
                            <Text fontSize="lg" fontWeight="800" color="gray.900">
                              ${plan.priceUsd}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {plan.priceUzs.toLocaleString('ru-RU')} UZS
                            </Text>
                          </VStack>
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                </RadioGroup>

                {/* Selected Plan Summary */}
                {selectedPlan && (
                  <Box bg="gray.50" p={4} borderRadius="xl" border="1px solid" borderColor="gray.200">
                    <VStack align="stretch" spacing={2}>
                      <Text fontSize="sm" fontWeight="600" color="gray.700">
                        {t('myPage.topup.selectedPlan')}
                      </Text>
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600">{t('myPage.topup.dataAdded')}:</Text>
                        <Text fontSize="sm" fontWeight="700" color="gray.900">
                          {selectedPlan.dataGB} GB
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600">{t('myPage.topup.daysAdded')}:</Text>
                        <Text fontSize="sm" fontWeight="700" color="gray.900">
                          {selectedPlan.duration} {t('myPage.orders.days')}
                        </Text>
                      </HStack>
                    </VStack>
                  </Box>
                )}
              </>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter gap={3} borderTop="1px solid" borderColor="gray.100">
          <Button
            variant="outline"
            onClick={onClose}
            fontWeight="700"
            borderRadius="full"
            px={6}
            borderWidth="2px"
            borderColor="gray.300"
          >
            {t('myPage.topup.cancel')}
          </Button>
          <Button
            bg="#FE4F18"
            color="white"
            onClick={handleConfirm}
            isDisabled={!selectedPlanId || isLoading}
            fontWeight="700"
            borderRadius="full"
            px={6}
            _hover={{ opacity: 0.9 }}
          >
            {t('myPage.topup.confirm')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TopUpPlansModal;
