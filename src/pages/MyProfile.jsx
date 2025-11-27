// src/pages/MyProfile.jsx
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Grid,
  Badge,
  Divider,
} from '@chakra-ui/react';
import {
  User,
  Phone,
  Mail,
  Package,
} from 'lucide-react';

const MyProfile = ({ user, profile, orders }) => {
  return (
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
  );
};

export default MyProfile;
