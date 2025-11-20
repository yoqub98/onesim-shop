// src/pages/PersonalCabinetPage.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Avatar,
  Separator,
} from '@chakra-ui/react';
import { LogOut, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { getTranslation, DEFAULT_LANGUAGE } from '../config/i18n';

const PersonalCabinetPage = () => {
  const navigate = useNavigate();
  const { user, userProfile, signOut, loading } = useAuth();
  const lang = DEFAULT_LANGUAGE;
  const t = (key) => getTranslation(lang, key);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    console.log('👤 Cabinet - Auth state:', { loading, user: !!user, userProfile });
    
    if (!loading) {
      setIsChecking(false);
      
      if (!user) {
        console.log('❌ No user found, redirecting to login');
        navigate('/login', { replace: true });
      }
    }
  }, [loading, user, navigate]);

  const handleLogout = async () => {
    console.log('🚪 Logging out from cabinet...');
    try {
      await signOut();
      console.log('✅ Logout successful');
      navigate('/', { replace: true });
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };

  if (loading || isChecking) {
    console.log('⏳ Cabinet loading...');
    return (
      <Box minH="calc(100vh - 80px)" display="flex" alignItems="center" justifyContent="center" bg="gray.50">
        <VStack gap={4}>
          <Box
            w="50px"
            h="50px"
            borderRadius="full"
            border="4px solid"
            borderColor="purple.200"
            borderTopColor="purple.600"
            animation="spin 1s linear infinite"
            sx={{
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' },
              },
            }}
          />
          <Text color="gray.600" fontWeight="600">Загрузка...</Text>
        </VStack>
      </Box>
    );
  }

  if (!user) {
    return null;
  }

  const fullName = userProfile
    ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim()
    : user.email;

  return (
    <Box minH="calc(100vh - 80px)" bg="gray.50" py={12}>
      <Container maxW="6xl">
        <VStack gap={8} align="stretch">
          <Box bg="white" p={8} borderRadius="2xl" boxShadow="0 4px 12px rgba(100, 100, 100, 0.15)">
            <HStack gap={6} flexWrap="wrap">
              <Avatar
                size="2xl"
                name={fullName}
                bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                color="white"
              />
              <VStack align="flex-start" gap={2} flex={1}>
                <Heading fontSize="3xl" fontWeight="800" color="gray.900">
                  {t('cabinet.welcome')}, {fullName}!
                </Heading>
                <Text fontSize="md" color="gray.600">{user.email}</Text>
                {userProfile?.phone && (
                  <Text fontSize="md" color="gray.600">{userProfile.phone}</Text>
                )}
              </VStack>
              <Button
                leftIcon={<LogOut size={20} />}
                colorPalette="red"
                variant="outline"
                size="md"
                onClick={handleLogout}
                fontWeight="700"
                _hover={{ bg: 'red.50' }}
              >
                {t('cabinet.logout')}
              </Button>
            </HStack>
          </Box>

          <Separator />

          <Box bg="white" p={8} borderRadius="2xl" boxShadow="0 4px 12px rgba(100, 100, 100, 0.15)" minH="400px">
            <VStack gap={6} align="stretch">
              <HStack gap={3}>
                <Package size={28} color="#667eea" />
                <Heading fontSize="2xl" fontWeight="800" color="gray.900">
                  {t('cabinet.ordersTitle')}
                </Heading>
              </HStack>

              <Box p={12} bg="gray.50" borderRadius="xl" border="2px dashed" borderColor="gray.300" textAlign="center">
                <VStack gap={4}>
                  <Box p={4} bg="purple.100" borderRadius="full" display="inline-flex">
                    <Package size={40} color="#7c3aed" />
                  </Box>
                  <VStack gap={2}>
                    <Heading fontSize="xl" fontWeight="700" color="gray.700">
                      {t('cabinet.noOrders')}
                    </Heading>
                    <Text fontSize="md" color="gray.500" maxW="md">
                      {t('cabinet.ordersPlaceholder')}
                    </Text>
                  </VStack>
                  <Button
                    mt={4}
                    size="lg"
                    bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    color="white"
                    fontWeight="700"
                    onClick={() => navigate('/')}
                    _hover={{
                      transform: 'translateY(-2px)',
                      shadow: '0 10px 20px rgba(102, 126, 234, 0.3)',
                    }}
                    transition="all 0.3s"
                  >
                    Выбрать план
                  </Button>
                </VStack>
              </Box>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );


};

export default PersonalCabinetPage;