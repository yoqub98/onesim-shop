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
  InputGroup,
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
  const { signIn, user } = useAuth();
  const lang = DEFAULT_LANGUAGE;

  // Debug: Log initialization
  React.useEffect(() => {
    console.log('🔧 LoginPage initialized');
    console.log('🔧 lang:', lang);
    console.log('🔧 DEFAULT_LANGUAGE:', DEFAULT_LANGUAGE);
    console.log('🔧 getTranslation type:', typeof getTranslation);
    console.log('🔧 getTranslation function:', getTranslation);
  }, [lang]);

  // Create a simple, stable translation function - NOT using useCallback
  // This ensures t is always defined and available
  const t = (key) => {
    try {
      console.log(`🔤 Translating key: ${key}`);
      console.log('🔤 Current lang:', lang);
      console.log('🔤 getTranslation available:', typeof getTranslation);

      if (typeof getTranslation !== 'function') {
        console.error('❌ getTranslation is not a function!');
        return key;
      }

      const result = getTranslation(lang, key);
      console.log(`🔤 Translation result for [${key}]:`, result);
      return result || key;
    } catch (err) {
      console.error('❌ Translation error for key:', key, err);
      console.error('❌ Error stack:', err.stack);
      return key;
    }
  };

  // Debug: Log t function
  React.useEffect(() => {
    console.log('🔧 Translation function (t) type:', typeof t);
    console.log('🔧 Translation function (t):', t);
    console.log('🔧 Testing t function with test key...');
    try {
      const testResult = t('auth.login.title');
      console.log('🔧 Test translation result:', testResult);
    } catch (err) {
      console.error('🔧 Test translation failed:', err);
    }
  }, []);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      console.log('👤 User already logged in, redirecting to home');
      navigate('/');
    }
  }, [user, navigate]);

const validateForm = () => {
  console.log('🔍 validateForm called');
  const newErrors = {};

  if (!formData.email) {
    newErrors.email = getTranslation(lang, 'auth.errors.emailRequired') || 'Email обязателен';
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    newErrors.email = getTranslation(lang, 'auth.errors.emailInvalid') || 'Неверный формат email';
  }

  if (!formData.password) {
    newErrors.password = getTranslation(lang, 'auth.errors.passwordRequired') || 'Пароль обязателен';
  }

  console.log('✅ Validation errors:', newErrors);
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

  const handleSubmit = React.useCallback(async (e) => {
    e.preventDefault();

    console.log('📝 handleSubmit called');
    console.log('🔍 t type in handleSubmit:', typeof t);

    if (!validateForm()) {
      console.warn('⚠️ Form validation failed');
      return;
    }

    console.log('🔐 Starting login process...');
    console.log('📧 Email:', formData.email);
    setLoading(true);

    try {
      const { data, error } = await signIn(formData.email, formData.password);

      console.log('📨 Login response:', { data, error });

      if (error) {
        console.error('❌ Login error:', error);
        console.error('Error details:', {
          message: error.message,
          status: error.status,
          name: error.name,
        });

        let errorMessage = 'Не удалось войти в систему';

        if (error.message?.includes('Invalid login credentials')) {
          errorMessage = 'Неверный email или пароль';
        } else if (error.message?.includes('Email not confirmed')) {
          errorMessage = 'Email не подтвержден. Проверьте почту для подтверждения.';
        } else if (error.message) {
          errorMessage = error.message;
        }

        toaster.create({
          title: 'Ошибка входа',
          description: errorMessage,
          type: 'error',
          duration: 5000,
        });
        return;
      }

      console.log('✅ Login successful!');
      console.log('User data:', data);

      toaster.create({
        title: t('auth.success.loginComplete') || 'Вход выполнен успешно',
        description: 'Добро пожаловать!',
        type: 'success',
        duration: 3000,
      });

      // Small delay before redirect to ensure state updates
      setTimeout(() => {
        console.log('➡️ Redirecting to home page...');
        navigate('/');
      }, 500);

    } catch (err) {
      console.error('💥 Unexpected login error:', err);
      console.error('Error stack:', err.stack);
      console.error('Error name:', err.name);
      console.error('Error message:', err.message);

      toaster.create({
        title: 'Ошибка',
        description: 'Произошла непредвиденная ошибка при входе',
        type: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  }, [validateForm, formData.email, formData.password, signIn, navigate]);

  const handleChange = React.useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error for this field if it exists
    setErrors((prev) => {
      if (prev[name]) {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      }
      return prev;
    });
  }, []);

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
              {t('auth.login.title') || 'Вход в систему'}
            </Heading>
            <Text fontSize="md" color="gray.600">
              {t('auth.login.subtitle') || 'Войдите в свой аккаунт'}
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
                    {t('auth.login.email') || 'Email'}
                  </Field.Label>
                  <InputGroup
                    startElement={<Mail size={18} color="#9CA3AF" />}
                  >
                    <Input
                      name="email"
                      type="email"
                      placeholder={t('auth.login.emailPlaceholder') || 'Введите ваш email'}
                      value={formData.email}
                      onChange={handleChange}
                      size="lg"
                      borderRadius="lg"
                    />
                  </InputGroup>
                  <Field.ErrorText>{errors.email}</Field.ErrorText>
                </Field.Root>

                <Field.Root invalid={!!errors.password}>
                  <Field.Label fontWeight="600" color="gray.700">
                    {t('auth.login.password') || 'Пароль'}
                  </Field.Label>
                  <InputGroup
                    startElement={<Lock size={18} color="#9CA3AF" />}
                  >
                    <Input
                      name="password"
                      type="password"
                      placeholder={t('auth.login.passwordPlaceholder') || 'Введите пароль'}
                      value={formData.password}
                      onChange={handleChange}
                      size="lg"
                      borderRadius="lg"
                    />
                  </InputGroup>
                  <Field.ErrorText>{errors.password}</Field.ErrorText>
                </Field.Root>

                <HStack justify="space-between" w="100%">
                  <HStack gap={2}>
                    <Checkbox
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onCheckedChange={(e) => handleChange({ target: { name: 'rememberMe', type: 'checkbox', checked: e.checked } })}
                      colorPalette="purple"
                    />
                    <Text fontSize="sm" color="gray.600">
                      {t('auth.login.rememberMe') || 'Запомнить меня'}
                    </Text>
                  </HStack>
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
                    {t('auth.login.forgotPassword') || 'Забыли пароль?'}
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
                  loadingText={t('auth.login.loggingIn') || 'Вход...'}
                >
                  {t('auth.login.loginButton') || 'Войти'}
                </Button>

                <HStack gap={1} fontSize="sm">
                  <Text color="gray.600">{t('auth.login.noAccount') || 'Нет аккаунта?'}</Text>
                  <Link
                    color="purple.600"
                    fontWeight="700"
                    onClick={() => navigate('/signup')}
                    _hover={{ textDecoration: 'underline' }}
                  >
                    {t('auth.login.signUpLink') || 'Зарегистрироваться'}
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