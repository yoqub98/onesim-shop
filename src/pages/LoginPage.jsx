// src/pages/LoginPage.jsx
import React, { useState } from 'react';
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
} from '@chakra-ui/react';
import { Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getTranslation, DEFAULT_LANGUAGE } from '../config/i18n';
import { toaster } from '../components/ui/toaster';
import { Field } from '../components/ui/field';
import { Checkbox } from '../components/ui/checkbox';

const LoginPage = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const lang = DEFAULT_LANGUAGE;
  const t = (key) => getTranslation(lang, key);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = t('auth.errors.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('auth.errors.emailInvalid');
    }

    if (!formData.password) {
      newErrors.password = t('auth.errors.passwordRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    const { data, error } = await signIn(formData.email, formData.password);
    setLoading(false);

    if (error) {
      toaster.create({
        title: 'Ошибка входа',
        description: t('auth.errors.loginFailed'),
        type: 'error',
        duration: 5000,
      });
      return;
    }

    toaster.create({
      title: t('auth.success.loginComplete'),
      type: 'success',
      duration: 3000,
    });

    navigate('/');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <Box minH="calc(100vh - 80px)" bg="gray.50" py={12}>
      <Container maxW="md">
        <VStack gap={8}>
          <VStack gap={2} textAlign="center">
            <Heading
              fontSize="4xl"
              fontWeight="800"
              color="gray.900"
            >
              {t('auth.login.title')}
            </Heading>
            <Text fontSize="md" color="gray.600">
              {t('auth.login.subtitle')}
            </Text>
          </VStack>

          <Box
            bg="white"
            p={8}
            borderRadius="2xl"
            boxShadow="0 4px 12px rgba(100, 100, 100, 0.15)"
            w="100%"
          >
            <form onSubmit={handleSubmit}>
              <VStack gap={5}>
                <Field.Root invalid={!!errors.email}>
                  <Field.Label fontWeight="600" color="gray.700">
                    {t('auth.login.email')}
                  </Field.Label>
                  <Box position="relative">
                    <Box position="absolute" left="3" top="50%" transform="translateY(-50%)" zIndex="1">
                      <Mail size={18} color="#9CA3AF" />
                    </Box>
                    <Input
                      name="email"
                      type="email"
                      placeholder={t('auth.login.emailPlaceholder')}
                      value={formData.email}
                      onChange={handleChange}
                      size="lg"
                      borderRadius="lg"
                      pl="10"
                    />
                  </Box>
                  <Field.ErrorText>{errors.email}</Field.ErrorText>
                </Field.Root>

                <Field.Root invalid={!!errors.password}>
                  <Field.Label fontWeight="600" color="gray.700">
                    {t('auth.login.password')}
                  </Field.Label>
                  <Box position="relative">
                    <Box position="absolute" left="3" top="50%" transform="translateY(-50%)" zIndex="1">
                      <Lock size={18} color="#9CA3AF" />
                    </Box>
                    <Input
                      name="password"
                      type="password"
                      placeholder={t('auth.login.passwordPlaceholder')}
                      value={formData.password}
                      onChange={handleChange}
                      size="lg"
                      borderRadius="lg"
                      pl="10"
                    />
                  </Box>
                  <Field.ErrorText>{errors.password}</Field.ErrorText>
                </Field.Root>

                <HStack justify="space-between" w="100%">
                  <Checkbox
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onCheckedChange={(e) => handleChange({ target: { name: 'rememberMe', type: 'checkbox', checked: e.checked } })}
                    colorPalette="purple"
                  >
                    <Text fontSize="sm" color="gray.600">
                      {t('auth.login.rememberMe')}
                    </Text>
                  </Checkbox>
                  <Link
                    fontSize="sm"
                    color="purple.600"
                    fontWeight="600"
                    _hover={{ textDecoration: 'underline' }}
                    onClick={() => {
                      toaster.create({
                        title: 'Скоро появится',
                        description: 'Функция восстановления пароля будет добавлена в ближайшее время',
                        type: 'info',
                        duration: 3000,
                      });
                    }}
                  >
                    {t('auth.login.forgotPassword')}
                  </Link>
                </HStack>

                <Button
                  type="submit"
                  size="lg"
                  w="100%"
                  bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  color="white"
                  fontWeight="700"
                  borderRadius="lg"
                  _hover={{
                    transform: 'translateY(-2px)',
                    shadow: '0 10px 20px rgba(102, 126, 234, 0.3)',
                  }}
                  transition="all 0.3s"
                  loading={loading}
                  loadingText={t('auth.login.loggingIn')}
                >
                  {t('auth.login.loginButton')}
                </Button>

                <HStack gap={1} fontSize="sm">
                  <Text color="gray.600">{t('auth.login.noAccount')}</Text>
                  <Link
                    color="purple.600"
                    fontWeight="700"
                    onClick={() => navigate('/signup')}
                    _hover={{ textDecoration: 'underline' }}
                  >
                    {t('auth.login.signUpLink')}
                  </Link>
                </HStack>
              </VStack>
            </form>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default LoginPage;
