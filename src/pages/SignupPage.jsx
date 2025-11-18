// src/pages/SignupPage.jsx
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
  Grid,
} from '@chakra-ui/react';
import { Mail, Lock, User, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getTranslation, DEFAULT_LANGUAGE } from '../config/i18n';
import { toaster } from '../components/ui/toaster';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogCloseTrigger,
  DialogBackdrop,
} from '../components/ui/dialog';
import { PinInput } from '../components/ui/pin-input';
import { Field } from '../components/ui/field';

const SignupPage = () => {
  const navigate = useNavigate();
  const { signUp, verifyOtp, resendOtp } = useAuth();
  const lang = DEFAULT_LANGUAGE;

  // Debug: Log initialization
  React.useEffect(() => {
    console.log('🔧 SignupPage initialized');
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
      const testResult = t('auth.signup.title');
      console.log('🔧 Test translation result:', testResult);
    } catch (err) {
      console.error('🔧 Test translation failed:', err);
    }
  }, []);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpValue, setOtpValue] = useState(['', '', '', '', '', '', '', '']);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  const validatePhone = React.useCallback((phone) => {
    return /^\d{9}$/.test(phone);
  }, []);

  const validateForm = React.useCallback(() => {
    console.log('🔍 validateForm called');
    console.log('🔍 t type:', typeof t);
    console.log('🔍 formData:', formData);

    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = t('auth.errors.firstNameRequired') || 'Имя обязательно';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = t('auth.errors.lastNameRequired') || 'Фамилия обязательна';
    }

    if (!formData.email) {
      newErrors.email = t('auth.errors.emailRequired') || 'Email обязателен';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('auth.errors.emailInvalid') || 'Неверный формат email';
    }

    if (!formData.phone) {
      newErrors.phone = t('auth.errors.phoneRequired') || 'Номер телефона обязателен';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = t('auth.errors.phoneInvalid') || 'Неверный номер телефона';
    }

    if (!formData.password) {
      newErrors.password = t('auth.errors.passwordRequired') || 'Пароль обязателен';
    } else if (formData.password.length < 6) {
      newErrors.password = t('auth.errors.passwordMinLength') || 'Пароль должен быть не менее 6 символов';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.errors.passwordsNotMatch') || 'Пароли не совпадают';
    }

    console.log('✅ Validation complete, errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validatePhone]);

  const handleSubmit = React.useCallback(async (e) => {
    e.preventDefault();

    console.log('📝 handleSubmit called');
    console.log('🔍 t type in handleSubmit:', typeof t);

    if (!validateForm()) {
      console.warn('⚠️ Form validation failed in signup');
      return;
    }

    console.log('📝 Starting signup process...');
    setLoading(true);

    try {
      const { data, error } = await signUp(formData.email, formData.password, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: `+998${formData.phone}`,
      });

      console.log('📧 Signup response:', { data, error });

      if (error) {
        console.error('❌ Signup error:', error);
        toaster.create({
          title: 'Ошибка регистрации',
          description: error.message || t('auth.errors.signupFailed') || 'Ошибка регистрации. Попробуйте снова.',
          type: 'error',
          duration: 5000,
        });
        return;
      }

      console.log('✅ Signup successful, opening OTP modal');
      toaster.create({
        title: t('auth.success.otpSent') || 'Код подтверждения отправлен на email',
        description: 'Проверьте вашу почту',
        type: 'success',
        duration: 3000,
      });

      setOtpModalOpen(true);
    } catch (err) {
      console.error('💥 Unexpected signup error:', err);
      console.error('Error stack:', err.stack);
      console.error('Error name:', err.name);
      console.error('Error message:', err.message);
      toaster.create({
        title: 'Ошибка',
        description: 'Произошла непредвиденная ошибка',
        type: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  }, [validateForm, formData, signUp]);

  const handleVerifyOtp = React.useCallback(async () => {
    const otpCode = otpValue.join('');

    if (otpCode.length !== 8) {
      console.warn('⚠️ OTP incomplete:', otpCode.length, 'digits');
      return;
    }

    console.log('🔐 Verifying OTP...');
    console.log('🔍 t type in handleVerifyOtp:', typeof t);
    setVerifying(true);

    try {
      const { data, error } = await verifyOtp(formData.email, otpCode);

      console.log('🔍 OTP verification response:', { data, error });

      if (error) {
        console.error('❌ OTP verification failed:', error);
        toaster.create({
          title: 'Ошибка проверки',
          description: error.message || t('auth.errors.otpInvalid') || 'Неверный код подтверждения',
          type: 'error',
          duration: 5000,
        });
        setOtpValue(['', '', '', '', '', '', '', '']);
        return;
      }

      console.log('✅ OTP verified successfully');
      toaster.create({
        title: t('auth.success.signupComplete') || 'Регистрация успешна! Теперь войдите в систему.',
        description: 'Теперь вы можете войти в систему',
        type: 'success',
        duration: 3000,
      });

      setOtpModalOpen(false);
      setTimeout(() => navigate('/login'), 1000);
    } catch (err) {
      console.error('💥 Unexpected OTP verification error:', err);
      console.error('Error stack:', err.stack);
      toaster.create({
        title: 'Ошибка',
        description: 'Произошла непредвиденная ошибка',
        type: 'error',
        duration: 5000,
      });
      setOtpValue(['', '', '', '', '', '', '', '']);
    } finally {
      setVerifying(false);
    }
  }, [otpValue, verifyOtp, formData.email, navigate]);

  const handleResendOtp = React.useCallback(async () => {
    console.log('🔄 Resending OTP...');
    console.log('🔍 t type in handleResendOtp:', typeof t);
    setResending(true);

    try {
      const { error } = await resendOtp(formData.email);

      if (error) {
        console.error('❌ Resend OTP failed:', error);
        toaster.create({
          title: 'Ошибка',
          description: 'Не удалось отправить код повторно',
          type: 'error',
          duration: 3000,
        });
        return;
      }

      console.log('✅ OTP resent successfully');
      toaster.create({
        title: t('auth.success.otpSent') || 'Код подтверждения отправлен на email',
        description: 'Новый код отправлен на почту',
        type: 'success',
        duration: 3000,
      });

      setOtpValue(['', '', '', '', '', '', '', '']);
    } catch (err) {
      console.error('💥 Unexpected resend error:', err);
      console.error('Error stack:', err.stack);
      toaster.create({
        title: 'Ошибка',
        description: 'Произошла непредвиденная ошибка',
        type: 'error',
        duration: 3000,
      });
    } finally {
      setResending(false);
    }
  }, [resendOtp, formData.email]);

  const handleChange = React.useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
    <>
      <Box minH="calc(100vh - 80px)" bg="gray.50" py={12}>
        <Container maxW="lg">
          <VStack gap={8}>
            <VStack gap={2} textAlign="center">
              <Heading fontSize="4xl" fontWeight="800" color="gray.900">
                {t('auth.signup.title')}
              </Heading>
              <Text fontSize="md" color="gray.600">
                {t('auth.signup.subtitle')}
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
                  <Grid templateColumns="repeat(2, 1fr)" gap={4} w="100%">
                    <Field.Root invalid={!!errors.firstName}>
                      <Field.Label fontWeight="600" color="gray.700">
                        {t('auth.signup.firstName')}
                      </Field.Label>
                      <InputGroup startElement={<User size={18} color="#9CA3AF" />}>
                        <Input
                          name="firstName"
                          type="text"
                          placeholder={t('auth.signup.firstNamePlaceholder')}
                          value={formData.firstName}
                          onChange={handleChange}
                          size="lg"
                          borderRadius="lg"
                        />
                      </InputGroup>
                      <Field.ErrorText>{errors.firstName}</Field.ErrorText>
                    </Field.Root>

                    <Field.Root invalid={!!errors.lastName}>
                      <Field.Label fontWeight="600" color="gray.700">
                        {t('auth.signup.lastName')}
                      </Field.Label>
                      <InputGroup startElement={<User size={18} color="#9CA3AF" />}>
                        <Input
                          name="lastName"
                          type="text"
                          placeholder={t('auth.signup.lastNamePlaceholder')}
                          value={formData.lastName}
                          onChange={handleChange}
                          size="lg"
                          borderRadius="lg"
                        />
                      </InputGroup>
                      <Field.ErrorText>{errors.lastName}</Field.ErrorText>
                    </Field.Root>
                  </Grid>

                  <Field.Root invalid={!!errors.email}>
                    <Field.Label fontWeight="600" color="gray.700">
                      {t('auth.signup.email')}
                    </Field.Label>
                    <InputGroup startElement={<Mail size={18} color="#9CA3AF" />}>
                      <Input
                        name="email"
                        type="email"
                        placeholder={t('auth.signup.emailPlaceholder')}
                        value={formData.email}
                        onChange={handleChange}
                        size="lg"
                        borderRadius="lg"
                      />
                    </InputGroup>
                    <Field.ErrorText>{errors.email}</Field.ErrorText>
                  </Field.Root>

                  <Field.Root invalid={!!errors.phone}>
                    <Field.Label fontWeight="600" color="gray.700">
                      {t('auth.signup.phone')}
                    </Field.Label>
                    <InputGroup
                      startElement={
                        <HStack gap={1}>
                          <Phone size={18} color="#9CA3AF" />
                          <Text fontSize="md" color="gray.500" fontWeight="600">
                            +998
                          </Text>
                        </HStack>
                      }
                    >
                      <Input
                        name="phone"
                        type="tel"
                        placeholder={t('auth.signup.phonePlaceholder')}
                        value={formData.phone}
                        onChange={handleChange}
                        size="lg"
                        borderRadius="lg"
                        ps="5.5rem"
                        maxLength={9}
                      />
                    </InputGroup>
                    <Field.ErrorText>{errors.phone}</Field.ErrorText>
                  </Field.Root>

                  <Field.Root invalid={!!errors.password}>
                    <Field.Label fontWeight="600" color="gray.700">
                      {t('auth.signup.password')}
                    </Field.Label>
                    <InputGroup startElement={<Lock size={18} color="#9CA3AF" />}>
                      <Input
                        name="password"
                        type="password"
                        placeholder={t('auth.signup.passwordPlaceholder')}
                        value={formData.password}
                        onChange={handleChange}
                        size="lg"
                        borderRadius="lg"
                      />
                    </InputGroup>
                    <Field.ErrorText>{errors.password}</Field.ErrorText>
                  </Field.Root>

                  <Field.Root invalid={!!errors.confirmPassword}>
                    <Field.Label fontWeight="600" color="gray.700">
                      {t('auth.signup.confirmPassword')}
                    </Field.Label>
                    <InputGroup startElement={<Lock size={18} color="#9CA3AF" />}>
                      <Input
                        name="confirmPassword"
                        type="password"
                        placeholder={t('auth.signup.confirmPasswordPlaceholder')}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        size="lg"
                        borderRadius="lg"
                      />
                    </InputGroup>
                    <Field.ErrorText>{errors.confirmPassword}</Field.ErrorText>
                  </Field.Root>

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
                    loadingText={t('auth.signup.signingUp')}
                  >
                    {t('auth.signup.signUpButton')}
                  </Button>

                  <HStack gap={1} fontSize="sm">
                    <Text color="gray.600">{t('auth.signup.haveAccount')}</Text>
                    <Link
                      color="purple.600"
                      fontWeight="700"
                      onClick={() => navigate('/login')}
                      _hover={{ textDecoration: 'underline' }}
                    >
                      {t('auth.signup.loginLink')}
                    </Link>
                  </HStack>
                </VStack>
              </form>
            </Box>
          </VStack>
        </Container>
      </Box>

      {/* OTP Verification Dialog - 8 DIGITS */}
      <DialogRoot
        open={otpModalOpen}
        onOpenChange={(e) => setOtpModalOpen(e.open)}
        closeOnInteractOutside={false}
        placement="center"
        size="md"
      >
        <DialogBackdrop bg="blackAlpha.600" backdropFilter="blur(10px)" />
        <DialogContent borderRadius="2xl" p={4}>
          <DialogHeader>
            <VStack gap={2} align="center">
              <DialogTitle fontSize="2xl" fontWeight="800" color="gray.900">
                {t('auth.signup.otpModal.title')}
              </DialogTitle>
              <Text fontSize="sm" fontWeight="500" color="gray.600" textAlign="center">
                Введите 8-значный код, отправленный на
              </Text>
              <Text fontSize="md" fontWeight="700" color="purple.600">
                {formData.email}
              </Text>
            </VStack>
          </DialogHeader>
          <DialogCloseTrigger />

          <DialogBody pb={6}>
            <VStack gap={6}>
              <VStack gap={3} w="100%">
                <Text fontSize="sm" fontWeight="600" color="gray.700">
                  Код подтверждения (8 цифр)
                </Text>
                <HStack justify="center" gap={2}>
                  <PinInput
                    size="lg"
                    value={otpValue}
                    onValueChange={(details) => {
                      console.log('🔢 OTP input change:', details);
                      setOtpValue(details.value);
                      
                      // Auto-submit when all 8 digits entered
                      if (details.value.join('').length === 8) {
                        console.log('🎯 8 digits entered, auto-verifying');
                        setTimeout(() => handleVerifyOtp(), 300);
                      }
                    }}
                    otp
                  />
                </HStack>
                <Text fontSize="xs" color="gray.500" textAlign="center">
                  Код из {otpValue.join('').length}/8 символов
                </Text>
              </VStack>

              <Button
                w="100%"
                size="lg"
                bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                color="white"
                fontWeight="700"
                borderRadius="lg"
                onClick={handleVerifyOtp}
                loading={verifying}
                loadingText="Проверка..."
                disabled={otpValue.join('').length !== 8}
                _hover={{
                  transform: 'translateY(-2px)',
                  shadow: '0 10px 20px rgba(102, 126, 234, 0.3)',
                }}
                transition="all 0.3s"
              >
                Подтвердить
              </Button>

              <Button
                variant="ghost"
                size="sm"
                colorPalette="purple"
                onClick={handleResendOtp}
                loading={resending}
                loadingText="Отправка..."
              >
                Отправить код повторно
              </Button>
            </VStack>
          </DialogBody>
        </DialogContent>
      </DialogRoot>
    </>
  );
};

export default SignupPage;