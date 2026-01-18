// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  Link,
  FormControl,
  FormLabel,
  FormErrorMessage,
} from '@chakra-ui/react';
import { Mail, Lock } from 'lucide-react';
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

const LoginPage = () => {
  const { currentLanguage } = useLanguage();
  const t = (key) => getTranslation(currentLanguage, key);
  const navigate = useNavigate();
  const { signIn, signInWithGoogle } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);

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
      console.error('Login error:', error);
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

  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      // Redirect will happen automatically via Supabase OAuth
    } catch (error) {
      console.error('[Login] Google Sign-In error:', error);
      toaster.create({
        title: t('auth.errors.loginFailed'),
        description: error.message,
        type: 'error',
        duration: 5000,
      });
      setGoogleLoading(false);
    }
  };

  return (
    <Flex minH="100vh" direction={{ base: 'column', lg: 'row' }}>
      {/* Left Side - Login Form */}
      <Box
        w={{ base: '100%', lg: '35%' }}
        minH={{ base: 'auto', lg: '100vh' }}
        bg="#F5F6F8"
        display="flex"
        flexDirection="column"
        position="relative"
      >
        {/* Form Container */}
        <Flex
          flex={1}
          justify="center"
          align="center"
          px={{ base: 4, md: 8 }}
          py={{ base: 8, lg: 0 }}
        >
          <StyledCard w="full" maxW="420px">
            <VStack spacing={6} align="stretch">
              <Heading
                fontSize="2xl"
                fontWeight="700"
                color="gray.900"
              >
                {t('auth.login.title')}
              </Heading>

              <Box as="form" onSubmit={handleSubmit}>
                <VStack spacing={5}>
                  {/* Email Field */}
                  <FormControl isInvalid={!!errors.email}>
                    <FormLabel
                      fontSize="sm"
                      fontWeight="600"
                      color="gray.700"
                      mb={2}
                    >
                      {t('auth.login.emailLabel')}
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
                    <FormLabel
                      fontSize="sm"
                      fontWeight="600"
                      color="gray.700"
                      mb={2}
                    >
                      {t('auth.login.passwordLabel')}
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

                  {/* Consent Checkbox */}
                  <Box w="full">
                    <ConsentCheckbox
                      isChecked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      variant="login"
                    />
                  </Box>

                  {/* Login Button */}
                  <StyledButton
                    type="submit"
                    w="full"
                    isLoading={loading}
                  >
                    {t('auth.login.button')}
                  </StyledButton>

                  {/* Google Sign In */}
                  <GoogleSignInButton
                    onClick={handleGoogleSignIn}
                    isLoading={googleLoading}
                  >
                    {t('auth.login.googleButton')}
                  </GoogleSignInButton>

                  {/* Sign Up Link */}
                  <Text fontSize="sm" color="gray.600" textAlign="center">
                    {t('auth.login.noAccount')}{' '}
                    <Link
                      as={RouterLink}
                      to="/signup"
                      color="gray.900"
                      fontWeight="700"
                      _hover={{ textDecoration: 'underline' }}
                    >
                      {t('auth.login.signupLink')}
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
        w={{ base: '100%', lg: '65%' }}
        minH={{ base: '300px', lg: '100vh' }}
        position="relative"
        display={{ base: 'none', lg: 'block' }}
        sx={{
          background: `linear-gradient(326deg, rgba(0, 0, 0, 0.41) 41.86%, #F3561D 102.54%), url('https://static.vecteezy.com/system/resources/thumbnails/035/118/518/small_2x/social-media-and-people-young-redhead-girl-sits-on-street-uses-mobile-phone-app-looks-up-information-in-internet-holds-smartphone-photo.jpg') lightgray 1.625px 0px / 108.331% 100% no-repeat`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Tagline */}
        <Flex
          position="absolute"
          bottom={{ base: '15%', xl: '20%' }}
          left={0}
          right={0}
          p={{ base: 8, md: 12 }}
          direction="column"
        >
          <Text
            fontSize={{ base: '2xl', md: '3xl', lg: '4xl', xl: '5xl' }}
            fontWeight="400"
            color="white"
            lineHeight="1.2"
          >
            {t('auth.login.tagline1')}
          </Text>
          <Text
            fontSize={{ base: '2xl', md: '3xl', lg: '4xl', xl: '5xl' }}
            fontWeight="700"
            color="white"
            lineHeight="1.2"
          >
            {t('auth.login.tagline2')}
          </Text>
        </Flex>
      </Box>
    </Flex>
  );
};

export default LoginPage;
