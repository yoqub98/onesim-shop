// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Input,
  VStack,
  HStack,
  Link,
  FormControl,
  FormLabel,
  FormErrorMessage,
} from '@chakra-ui/react';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { getTranslation, DEFAULT_LANGUAGE } from '../config/i18n';
import { toaster } from '../components/ui/toaster';

const LoginPage = () => {
  const lang = DEFAULT_LANGUAGE;
  const t = (key) => getTranslation(lang, key);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) newErrors.email = t('auth.errors.emailRequired');
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = t('auth.errors.emailInvalid');
    
    if (!password) newErrors.password = t('auth.errors.passwordRequired');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await signIn(email, password);
      
      toaster.create({
        title: t('auth.login.success'),
        type: 'success',
        duration: 3000,
      });

      navigate('/');
    } catch (error) {
      toaster.create({
        title: t('auth.errors.loginFailed'),
        description: error.message,
        type: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg="gray.50" py={20}>
      <Container maxW="md">
        <VStack spacing={8}>
          <VStack spacing={2}>
            <Heading
              size="2xl"
              background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              backgroundClip="text"
              fontWeight="800"
            >
              {t('auth.login.title')}
            </Heading>
            <Text color="gray.600" fontSize="lg">
              {t('auth.login.subtitle')}
            </Text>
          </VStack>

          <Box
            as="form"
            onSubmit={handleSubmit}
            w="full"
            bg="white"
            p={8}
            borderRadius="2xl"
            shadow="lg"
          >
            <VStack spacing={4}>
              <FormControl isInvalid={!!errors.email}>
                <FormLabel>{t('auth.fields.email')}</FormLabel>
                <HStack>
                  <Box color="gray.500" px={3}>
                    <Mail size={18} />
                  </Box>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('auth.placeholders.email')}
                  />
                </HStack>
                {errors.email && <FormErrorMessage>{errors.email}</FormErrorMessage>}
              </FormControl>

              <FormControl isInvalid={!!errors.password}>
                <FormLabel>{t('auth.fields.password')}</FormLabel>
                <HStack>
                  <Box color="gray.500" px={3}>
                    <Lock size={18} />
                  </Box>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('auth.placeholders.password')}
                  />
                </HStack>
                {errors.password && <FormErrorMessage>{errors.password}</FormErrorMessage>}
              </FormControl>

              <Button
                type="submit"
                w="full"
                size="lg"
                bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                color="white"
                fontWeight="700"
                isLoading={loading}
                _hover={{
                  transform: 'translateY(-2px)',
                  shadow: 'lg',
                }}
                mt={2}
              >
                {t('auth.login.button')}
              </Button>

              <Text fontSize="sm" color="gray.600">
                {t('auth.login.noAccount')}{' '}
                <Link as={RouterLink} to="/signup" color="purple.600" fontWeight="600">
                  {t('auth.login.signupLink')}
                </Link>
              </Text>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default LoginPage;