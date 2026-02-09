// src/components/TopUpConfirmModal.jsx
import { useState } from 'react';
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
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../config/i18n';
import { processTopup } from '../services/orderService';

const TopUpConfirmModal = ({ isOpen, onClose, order, userId, selectedPlan, onSuccess }) => {
  const { currentLanguage } = useLanguage();
  const t = (key) => getTranslation(currentLanguage, key);

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleConfirm = async () => {
    if (!selectedPlan || !order) return;

    setIsProcessing(true);
    setError(null);

    try {
      console.log('💳 [TopUpConfirm] Processing top-up:', {
        orderId: order.id,
        packageCode: selectedPlan.packageCode,
      });

      const response = await processTopup({
        orderId: order.id,
        userId,
        packageCode: selectedPlan.packageCode,
        priceUzs: selectedPlan.priceUzs,
        priceUsd: selectedPlan.priceUsd,
        dataAmount: `${selectedPlan.dataGB}GB`,
        validityDays: selectedPlan.duration,
        packageName: selectedPlan.name,
      });

      console.log('✅ [TopUpConfirm] Top-up successful:', response);
      setSuccess(true);

      // Wait 2 seconds to show success message, then call onSuccess
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
        handleClose();
      }, 2000);
    } catch (err) {
      console.error('❌ [TopUpConfirm] Top-up failed:', err);
      setError(err.message || t('myPage.topup.failed'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      isCentered
      closeOnOverlayClick={!isProcessing}
      closeOnEsc={!isProcessing}
    >
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(8px)" />
      <ModalContent mx={4} borderRadius="2xl" maxW="500px">
        <ModalHeader textAlign="center" pt={6} pb={4}>
          <HStack spacing={3} justify="center">
            <Box bg={success ? 'green.100' : 'orange.100'} p={2} borderRadius="lg">
              {success ? (
                <CheckCircleIcon style={{ width: '24px', height: '24px', color: '#16a34a' }} />
              ) : (
                <ExclamationTriangleIcon style={{ width: '24px', height: '24px', color: '#FE4F18' }} />
              )}
            </Box>
            <Text fontSize="xl" fontWeight="700" color="gray.800">
              {success ? t('myPage.topup.success') : t('myPage.topup.confirmTitle')}
            </Text>
          </HStack>
        </ModalHeader>
        {!isProcessing && !success && <ModalCloseButton />}

        <ModalBody pb={6} px={6}>
          <VStack spacing={4} align="stretch">
            {/* Success State */}
            {success && (
              <Alert status="success" borderRadius="lg">
                <AlertIcon />
                <Text fontSize="sm">{t('myPage.topup.successMessage')}</Text>
              </Alert>
            )}

            {/* Error State */}
            {error && !success && (
              <Alert status="error" borderRadius="lg">
                <AlertIcon />
                <Text fontSize="sm">{error}</Text>
              </Alert>
            )}

            {/* Processing State */}
            {isProcessing && !success && (
              <VStack spacing={4} py={4}>
                <Spinner size="xl" color="#FE4F18" thickness="4px" />
                <Text color="gray.600" fontWeight="600">
                  {t('myPage.topup.processing')}
                </Text>
              </VStack>
            )}

            {/* Confirmation State */}
            {!isProcessing && !success && selectedPlan && order && (
              <>
                <Text color="gray.600" fontSize="sm">
                  {t('myPage.topup.confirmMessage')}:
                </Text>

                <Box bg="gray.50" p={4} borderRadius="xl" border="1px solid" borderColor="gray.200">
                  <VStack align="stretch" spacing={3}>
                    {/* Package Name */}
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">
                        {currentLanguage === 'uz' ? 'Paket' : 'Пакет'}:
                      </Text>
                      <Text fontSize="sm" fontWeight="700" color="gray.900">
                        {selectedPlan.name}
                      </Text>
                    </HStack>

                    {/* Data */}
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">
                        {t('myPage.topup.dataAdded')}:
                      </Text>
                      <Text fontSize="sm" fontWeight="700" color="gray.900">
                        +{selectedPlan.dataGB} GB
                      </Text>
                    </HStack>

                    {/* Duration */}
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">
                        {t('myPage.topup.daysAdded')}:
                      </Text>
                      <Text fontSize="sm" fontWeight="700" color="gray.900">
                        +{selectedPlan.duration} {t('myPage.orders.days')}
                      </Text>
                    </HStack>

                    {/* Price */}
                    <Box pt={2} borderTop="1px solid" borderColor="gray.300">
                      <HStack justify="space-between">
                        <Text fontSize="md" fontWeight="700" color="gray.700">
                          {t('myPage.orders.price')}:
                        </Text>
                        <Text fontSize="xl" fontWeight="800" color="gray.900">
                          {selectedPlan.priceUzs.toLocaleString('ru-RU')} UZS
                        </Text>
                      </HStack>
                    </Box>
                  </VStack>
                </Box>

                {/* Order Info */}
                <Box bg="blue.50" p={3} borderRadius="lg" border="1px solid" borderColor="blue.200">
                  <VStack align="stretch" spacing={1}>
                    <Text fontSize="xs" color="blue.800" fontWeight="600">
                      {currentLanguage === 'uz' ? 'eSIM:' : 'eSIM:'} {order.package_name}
                    </Text>
                    <Text fontSize="xs" color="blue.700">
                      {currentLanguage === 'uz' ? 'Buyurtma' : 'Заказ'}: {order.order_no || order.id.slice(0, 8)}
                    </Text>
                  </VStack>
                </Box>
              </>
            )}
          </VStack>
        </ModalBody>

        {!success && (
          <ModalFooter gap={3} borderTop="1px solid" borderColor="gray.100">
            <Button
              variant="outline"
              onClick={handleClose}
              isDisabled={isProcessing}
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
              isLoading={isProcessing}
              loadingText={t('myPage.topup.processing')}
              fontWeight="700"
              borderRadius="full"
              px={6}
              _hover={{ opacity: 0.9 }}
            >
              {t('myPage.topup.confirm')}
            </Button>
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
};

export default TopUpConfirmModal;
