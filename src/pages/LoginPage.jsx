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

  const t = React.useCallback((key) => {
    try {
      if (typeof getTranslation !== 'function') {
        return key;
      }
      const res = getTranslation(lang, key);
      return res || key;
    } catch (err) {
      return key;
    }
  }, [lang]);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const validateForm = React.useCallback(() => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = t('auth.errors.emailRequired') || 'Email обязателен';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('auth.errors.emailInvalid') || 'Неверный формат email';
    }

    if (!formData.password) {
      newErrors.password = t('auth.errors.passwordRequired') || 'Пароль обязателен';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.email, formData.password]);

  const handleSubmit = React.useCallback(async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await signIn(formData.email, formData.password);

      if (error) {
        let errorMessage = t('auth.errors.loginFailed') || 'Не удалось войти в систему';

        if (error.message?.includes('Invalid login credentials')) {
          errorMessage = t('auth.errors.invalidCredentials') || 'Неверный email или пароль';
        } else if (error.message?.includes('Email not confirmed')) {
          errorMessage = t('auth.errors.emailNotConfirmed') || 'Email не подтвержден. Проверьте почту';
        } else if (error.message) {
          errorMessage = error.message;
        }

        toaster.create({
          title: t('auth.login.errorTitle') || 'Ошибка входа',
          description: errorMessage,
          type: 'error',
          duration: 5000,
        });
        return;
      }

      toaster.create({
        title: t('auth.success.loginComplete') || 'Вход выполнен успешно',
        description: t('auth.success.welcome') || 'Добро пожаловать!',
        type: 'success',
        duration: 3000,
      });

      setTimeout(() => {
        navigate('/');
      }, 500);

    } catch (err) {
      console.error('Unexpected login error:', err);
      toaster.create({
        title: t('auth.login.unexpectedError') || 'Ошибка',
        description: t('auth.login.tryAgain') || 'Произошла непредвиденная ошибка при входе',
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
            <Heading fontSize="4xl" fontWeight="800" color="gray.900">
              {t('auth.login.title') || 'Вход в систему'}
            </Heading>
            <Text fontSize="md" color="gray.600">
              {t('auth.login.subtitle') || 'Войдите в свой аккаунт'}
            </Text>
          </VStack>

          <Box bg="white" p={8} borderRadius="2xl" boxShadow="0 4px 12px rgba(100, 100, 100, 0.15)" w="100%">
            <form onSubmit={handleSubmit}>
              <VStack gap={5}>
                <Field.Root invalid={!!errors.email}>
                  <Field.Label fontWeight="600" color="gray.700">
                    {t('auth.login.email') || 'Email'}
                  </Field.Label>
                  <InputGroup startElement={<Mail size={18} color="#9CA3AF" />}>
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
                  <InputGroup startElement={<Lock size={18} color="#9CA3AF" />}>
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
                    <Text fontSize="sm" color="gray.600">{t('auth.login.rememberMe') || 'Запомнить меня'}</Text>
                  </HStack>

                  <Link fontSize="sm" color="purple.600" fontWeight="600" _hover={{ textDecoration: 'underline' }}
                        onClick={() => {
                          toaster.create({
                            title: t('auth.login.forgotComing') || 'Скоро появится',
                            description: t('auth.login.forgotDesc') || 'Функция восстановления пароля будет добавлена',
                            type: 'info',
                            duration: 3000,
                          });
                        }}>
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
                  isLoading={loading}
                  isLoadingText={t('auth.login.loggingIn') || 'Вход...'}
                >
                  {t('auth.login.loginButton') || 'Войти'}
                </Button>

                <HStack gap={1} fontSize="sm">
                  <Text color="gray.600">{t('auth.login.noAccount') || 'Нет аккаунта?'}</Text>
                  <Link color="purple.600" fontWeight="700" onClick={() => navigate('/signup')} _hover={{ textDecoration: 'underline' }}>
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
