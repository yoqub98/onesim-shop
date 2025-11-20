// src/pages/SignupPage.jsx
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
import { Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { getTranslation, DEFAULT_LANGUAGE } from '../config/i18n';
import { toaster } from '../components/ui/toaster';
// Note: Dialog and PinInput may need to be added as snippets
// Run: npx @chakra-ui/cli snippet add dialog
// Run: npx @chakra-ui/cli snippet add pin-input

const SignupPage = () => {
  const lang = DEFAULT_LANGUAGE;
  const t = (key) => getTranslation(lang, key);
  const navigate = useNavigate();
  const { signUp, verifyOtp } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);

  const formatPhoneDisplay = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 5) return `${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
    if (cleaned.length <= 7) return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`;
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7, 9)}`;
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 9) {
      setPhone(value);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!firstName.trim()) newErrors.firstName = t('auth.errors.firstNameRequired');
    if (!lastName.trim()) newErrors.lastName = t('auth.errors.lastNameRequired');
    if (!phone.trim()) newErrors.phone = t('auth.errors.phoneRequired');
    else if (phone.length !== 9) newErrors.phone = t('auth.errors.phoneInvalid');
    
    if (!email.trim()) newErrors.email = t('auth.errors.emailRequired');
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = t('auth.errors.emailInvalid');
    
    if (!password) newErrors.password = t('auth.errors.passwordRequired');
    else if (password.length < 6) newErrors.password = t('auth.errors.passwordTooShort');
    
    if (password !== confirmPassword) newErrors.confirmPassword = t('auth.errors.passwordMismatch');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await signUp(email, password, firstName, lastName, `+998${phone}`);
      
      toaster.create({
        title: t('auth.signup.verificationSent'),
        description: t('auth.signup.checkEmail'),
        type: 'success',
        duration: 5000,
      });

      setShowPinModal(true);
    } catch (error) {
      toaster.create({
        title: t('auth.errors.signupFailed'),
        description: error.message,
        type: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPin = async () => {
    if (pin.length !== 8) {
      toaster.create({
        title: t('auth.errors.invalidPin'),
        type: 'error',
        duration: 3000,
      });
      return;
    }

    setVerifyLoading(true);
    try {
      await verifyOtp(email, pin);
      
      toaster.create({
        title: t('auth.signup.success'),
        type: 'success',
        duration: 3000,
      });

      setShowPinModal(false);
      navigate('/');
    } catch (error) {
      toaster.create({
        title: t('auth.errors.verificationFailed'),
        description: error.message,
        type: 'error',
        duration: 5000,
      });
    } finally {
      setVerifyLoading(false);
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
              {t('auth.signup.title')}
            </Heading>
            <Text color="gray.600" fontSize="lg">
              {t('auth.signup.subtitle')}
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
              <FormControl isInvalid={!!errors.firstName}>
                <FormLabel>{t('auth.fields.firstName')}</FormLabel>
                <HStack spacing={0}>
                  <Box color="gray.500" px={3}>
                    <User size={18} />
                  </Box>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder={t('auth.placeholders.firstName')}
                  />
                </HStack>
                {errors.firstName && <FormErrorMessage>{errors.firstName}</FormErrorMessage>}
              </FormControl>

              <FormControl isInvalid={!!errors.lastName}>
                <FormLabel>{t('auth.fields.lastName')}</FormLabel>
                <HStack spacing={0}>
                  <Box color="gray.500" px={3}>
                    <User size={18} />
                  </Box>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder={t('auth.placeholders.lastName')}
                  />
                </HStack>
                {errors.lastName && <FormErrorMessage>{errors.lastName}</FormErrorMessage>}
              </FormControl>

              <FormControl isInvalid={!!errors.phone}>
                <FormLabel>{t('auth.fields.phone')}</FormLabel>
                <HStack spacing={0}>
                  <Box bg="gray.100" px={3} py={2} borderRadius="md">
                    <Text fontWeight="600">+998</Text>
                  </Box>
                  <Input
                    type="tel"
                    value={formatPhoneDisplay(phone)}
                    onChange={handlePhoneChange}
                    placeholder={t('auth.placeholders.phone')}
                  />
                </HStack>
                {errors.phone && <FormErrorMessage>{errors.phone}</FormErrorMessage>}
              </FormControl>

              <FormControl isInvalid={!!errors.email}>
                <FormLabel>{t('auth.fields.email')}</FormLabel>
                <HStack spacing={0}>
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
                <HStack spacing={0}>
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

              <FormControl isInvalid={!!errors.confirmPassword}>
                <FormLabel>{t('auth.fields.confirmPassword')}</FormLabel>
                <HStack spacing={0}>
                  <Box color="gray.500" px={3}>
                    <Lock size={18} />
                  </Box>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t('auth.placeholders.confirmPassword')}
                  />
                </HStack>
                {errors.confirmPassword && <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>}
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
                {t('auth.signup.button')}
              </Button>

              <Text fontSize="sm" color="gray.600">
                {t('auth.signup.haveAccount')}{' '}
                <Link as={RouterLink} to="/login" color="purple.600" fontWeight="600">
                  {t('auth.signup.loginLink')}
                </Link>
              </Text>
            </VStack>
          </Box>
        </VStack>
      </Container>

      {/* Note: Replace this with Dialog component from snippets */}
      {/* The Modal API has changed completely in v3 */}
      {showPinModal && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="blackAlpha.600"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex="modal"
        >
          <Box bg="white" p={6} borderRadius="xl" maxW="md" w="full" mx={4}>
            <Heading size="lg" mb={4}>{t('auth.verification.title')}</Heading>
            <VStack spacing={4}>
              <Text fontSize="sm" color="gray.600" textAlign="center">
                {t('auth.verification.description')}
              </Text>
              
              <Input
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter 8-digit code"
                maxLength={8}
                textAlign="center"
                fontSize="lg"
              />

              <Button
                w="full"
                bg="purple.600"
                color="white"
                onClick={handleVerifyPin}
                isLoading={verifyLoading}
                isDisabled={pin.length !== 8}
              >
                {t('auth.verification.button')}
              </Button>
            </VStack>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default SignupPage;