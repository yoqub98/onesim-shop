// src/pages/MyEsims.jsx
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Grid,
  Button,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import {
  Package,
  RefreshCw,
} from 'lucide-react';
import OrderCard from '../components/OrderCard';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { getTranslation } from '../config/i18n';

const MyEsims = ({
  orders,
  isLoading,
  error,
  fetchOrders,
  handleViewQr,
}) => {
  const { currentLanguage } = useLanguage();
  const t = (key) => getTranslation(currentLanguage, key);

  return (
    <VStack align="stretch" spacing={4}>
      {/* Header */}
      <HStack justify="space-between" flexWrap="wrap" gap={2}>
        <Heading size="md" color="gray.800">{t('myPage.orders.title')}</Heading>
        <Button
          px={6}
          py={4}
          h="auto"
          variant="outline"
          borderWidth="2px"
          borderColor="#D1D5DB"
          color="#4B5563"
          bg="white"
          borderRadius="full"
          leftIcon={<RefreshCw size={16} />}
          onClick={fetchOrders}
          isLoading={isLoading}
          fontWeight="700"
          fontSize="md"
          _hover={{
            bg: '#1F2937',
            color: 'white',
            borderColor: '#1F2937',
            transform: 'translateY(-1px)',
          }}
          transition="all 0.2s ease-in-out"
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
        <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onActivate={handleViewQr}
              onViewDetails={handleViewQr}
            />
          ))}
        </Grid>
      )}
    </VStack>
  );
};

export default MyEsims;