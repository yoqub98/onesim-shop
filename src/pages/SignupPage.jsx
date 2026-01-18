// src/pages/SignupPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Link,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Image,
  Input,
  InputGroup,
  InputLeftAddon,
} from '@chakra-ui/react';
import { Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { getTranslation } from '../config/i18n';
import { toaster } from '../components/ui/toaster';
import ConsentCheckbox from '../components/legal/ConsentCheckbox';
import {
  StyledInput,
  StyledButton,
  StyledCard,
  GoogleSignInButton,
} from '../components/ui/FormComponents';
import logoColored from '../assets/new-logo.svg';

const SignupPage = () => {
  const { currentLanguage } = useLanguage();
  const t = (key) => getTranslation(currentLanguage, key);
  const navigate = useNavigate();
  const { signUp, verifyOtp } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
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

    if (!agreedToTerms) newErrors.agreedToTerms = 'Вы должны согласиться с условиями';

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
      console.error('Signup error:', error);
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
      console.error('Verification error:', error);
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

  const handleGoogleSignUp = () => {
    // TODO: Implement Google Sign Up
    console.log('Google Sign Up clicked');
  };

  return (
    <Flex minH="100vh" direction={{ base: 'column', lg: 'row' }}>
      {/* Left Side - Signup Form */}
      <Box
        w={{ base: '100%', lg: '50%' }}
        minH={{ base: 'auto', lg: '100vh' }}
        bg="#F5F6F8"
        display="flex"
        flexDirection="column"
        position="relative"
        overflowY="auto"
      >
        {/* Logo */}
        <Box p={{ base: 6, md: 10 }}>
          <Link href="/">
            <Image
              src={logoColored}
              alt="OneSIM"
              h="32px"
              cursor="pointer"
              transition="all 0.3s"
              _hover={{ transform: 'scale(1.05)' }}
            />
          </Link>
        </Box>

        {/* Form Container */}
        <Flex
          flex={1}
          justify="center"
          align="center"
          px={{ base: 4, md: 10 }}
          py={{ base: 6, lg: 4 }}
        >
          <StyledCard w="full" maxW="420px">
            <VStack spacing={5} align="stretch">
              <Heading
                fontSize="2xl"
                fontWeight="700"
                color="gray.900"
              >
                {t('auth.signup.title')}
              </Heading>

              <Box as="form" onSubmit={handleSubmit}>
                <VStack spacing={4}>
                  {/* Name Fields - Side by Side */}
                  <HStack spacing={3} w="full">
                    <FormControl isInvalid={!!errors.firstName} flex={1}>
                      <FormLabel fontSize="sm" fontWeight="600" color="gray.700" mb={2}>
                        {t('auth.fields.firstName')}
                      </FormLabel>
                      <StyledInput
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder={t('auth.placeholders.firstName')}
                        leftIcon={<User size={18} />}
                      />
                      {errors.firstName && (
                        <FormErrorMessage fontSize="xs">{errors.firstName}</FormErrorMessage>
                      )}
                    </FormControl>

                    <FormControl isInvalid={!!errors.lastName} flex={1}>
                      <FormLabel fontSize="sm" fontWeight="600" color="gray.700" mb={2}>
                        {t('auth.fields.lastName')}
                      </FormLabel>
                      <StyledInput
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder={t('auth.placeholders.lastName')}
                        leftIcon={<User size={18} />}
                      />
                      {errors.lastName && (
                        <FormErrorMessage fontSize="xs">{errors.lastName}</FormErrorMessage>
                      )}
                    </FormControl>
                  </HStack>

                  {/* Phone Field */}
                  <FormControl isInvalid={!!errors.phone}>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700" mb={2}>
                      {t('auth.fields.phone')}
                    </FormLabel>
                    <InputGroup>
                      <InputLeftAddon
                        h="48px"
                        borderRadius="36px 0 0 36px"
                        border="1.2px solid"
                        borderColor="#DFE1EB"
                        borderRight="none"
                        bg="gray.50"
                        px={4}
                        fontWeight="600"
                        color="gray.700"
                      >
                        +998
                      </InputLeftAddon>
                      <Input
                        type="tel"
                        value={formatPhoneDisplay(phone)}
                        onChange={handlePhoneChange}
                        placeholder={t('auth.placeholders.phone')}
                        h="48px"
                        borderRadius="0 36px 36px 0"
                        border="1.2px solid"
                        borderColor="#DFE1EB"
                        bg="white"
                        fontSize="md"
                        fontWeight="500"
                        _hover={{ borderColor: '#C5C8D4' }}
                        _focus={{ borderColor: '#FE4F18', boxShadow: '0 0 0 1px #FE4F18' }}
                      />
                    </InputGroup>
                    {errors.phone && (
                      <FormErrorMessage>{errors.phone}</FormErrorMessage>
                    )}
                  </FormControl>

                  {/* Email Field */}
                  <FormControl isInvalid={!!errors.email}>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700" mb={2}>
                      {t('auth.fields.email')}
                    </FormLabel>
                    <StyledInput
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('auth.placeholders.email')}
                      leftIcon={<Mail size={18} />}
                    />
                    {errors.email && (
                      <FormErrorMessage>{errors.email}</FormErrorMessage>
                    )}
                  </FormControl>

                  {/* Password Field */}
                  <FormControl isInvalid={!!errors.password}>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700" mb={2}>
                      {t('auth.fields.password')}
                    </FormLabel>
                    <StyledInput
                      isPassword
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('auth.placeholders.password')}
                      leftIcon={<Lock size={18} />}
                    />
                    {errors.password && (
                      <FormErrorMessage>{errors.password}</FormErrorMessage>
                    )}
                  </FormControl>

                  {/* Confirm Password Field */}
                  <FormControl isInvalid={!!errors.confirmPassword}>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700" mb={2}>
                      {t('auth.fields.confirmPassword')}
                    </FormLabel>
                    <StyledInput
                      isPassword
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={t('auth.placeholders.confirmPassword')}
                      leftIcon={<Lock size={18} />}
                    />
                    {errors.confirmPassword && (
                      <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
                    )}
                  </FormControl>

                  {/* Consent Checkbox */}
                  <FormControl isInvalid={!!errors.agreedToTerms}>
                    <ConsentCheckbox
                      isChecked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      variant="signup"
                    />
                    {errors.agreedToTerms && (
                      <FormErrorMessage>{errors.agreedToTerms}</FormErrorMessage>
                    )}
                  </FormControl>

                  {/* Signup Button */}
                  <StyledButton
                    type="submit"
                    w="full"
                    isLoading={loading}
                    isDisabled={!agreedToTerms}
                  >
                    {t('auth.signup.button')}
                  </StyledButton>

                  {/* Google Sign Up */}
                  <GoogleSignInButton onClick={handleGoogleSignUp}>
                    {t('auth.signup.googleButton')}
                  </GoogleSignInButton>

                  {/* Login Link */}
                  <Text fontSize="sm" color="gray.600" textAlign="center">
                    {t('auth.signup.haveAccount')}{' '}
                    <Link
                      as={RouterLink}
                      to="/login"
                      color="gray.900"
                      fontWeight="700"
                      _hover={{ textDecoration: 'underline' }}
                    >
                      {t('auth.signup.loginLink')}
                    </Link>
                  </Text>
                </VStack>
              </Box>
            </VStack>
          </StyledCard>
        </Flex>
      </Box>

      {/* Right Side - Hero Image */}
      <Box
        w={{ base: '100%', lg: '50%' }}
        minH={{ base: '300px', lg: '100vh' }}
        position="relative"
        display={{ base: 'none', lg: 'block' }}
        sx={{
          background: `linear-gradient(326deg, rgba(0, 0, 0, 0.41) 41.86%, #F3561D 102.54%), url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&q=80') lightgray center / cover no-repeat`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Tagline */}
        <Flex
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          p={{ base: 8, md: 12 }}
          direction="column"
          justify="flex-end"
        >
          <Text
            fontSize={{ base: '2xl', md: '3xl', xl: '4xl' }}
            fontWeight="400"
            color="white"
            lineHeight="1.3"
            textShadow="0 2px 10px rgba(0,0,0,0.3)"
          >
            {t('auth.signup.tagline1')}
          </Text>
          <Text
            fontSize={{ base: '2xl', md: '3xl', xl: '4xl' }}
            fontWeight="700"
            color="white"
            lineHeight="1.3"
            textShadow="0 2px 10px rgba(0,0,0,0.3)"
          >
            {t('auth.signup.tagline2')}
          </Text>
        </Flex>
      </Box>

      {/* Verification Modal */}
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
          <StyledCard maxW="400px" w="full" mx={4}>
            <VStack spacing={5}>
              <Heading size="lg" color="gray.900">
                {t('auth.verification.title')}
              </Heading>
              <Text fontSize="sm" color="gray.600" textAlign="center">
                {t('auth.verification.description')}
              </Text>

              <StyledInput
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="12345678"
                maxLength={8}
                textAlign="center"
                fontSize="xl"
                letterSpacing="0.5em"
                fontWeight="600"
              />

              <StyledButton
                w="full"
                onClick={handleVerifyPin}
                isLoading={verifyLoading}
                isDisabled={pin.length !== 8}
              >
                {t('auth.verification.button')}
              </StyledButton>
            </VStack>
          </StyledCard>
        </Box>
      )}
    </Flex>
  );
};

export default SignupPage;
