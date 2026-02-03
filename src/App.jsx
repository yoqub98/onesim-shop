// src/App.jsx (FULL FILE - copy entire thing)
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  Button,
  Image,
  Grid,
  GridItem,
  HStack,
  VStack,
  IconButton,
  Link,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import {
  ChevronRightIcon,
  Bars3Icon,
  XMarkIcon,
  GlobeAltIcon,
  BoltIcon,
  ShieldCheckIcon,
  ChevronDownIcon,
  UserIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import Flag from 'react-world-flags';
import 'animate.css';
import PlansSection from './components/PlansSection';
import PopularDestinations from './components/PopularDestinations';
import FeaturesSection from './components/FeaturesSection';
import CountryPage from './pages/CountryPage.jsx';
import PackagePage from './pages/PackagePage.jsx';
import PlansPage from './pages/PlansPage.jsx';
import RegionalPackagesPage from './pages/RegionalPackagesPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage';
import AuthCallback from './pages/AuthCallback.jsx';
import MyPage from './pages/MyPage';
import HowToInstall from './pages/HowToInstall.jsx';
import PublicOffer from './pages/legal/PublicOffer.jsx';
import PrivacyPolicy from './pages/legal/PrivacyPolicy.jsx';
import TermsOfService from './pages/legal/TermsOfService.jsx';
import RefundPolicy from './pages/legal/RefundPolicy.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext.jsx';
import { CurrencyProvider } from './contexts/CurrencyContext.jsx';
import { FavoritesProvider } from './contexts/FavoritesContext.jsx';
import { getTranslation, LANGUAGES } from './config/i18n.js';
// Logo imports
import logoWhite from './assets/images/logo-white.svg';
import logoColored from './assets/new-logo.svg';
import CurrencyDebug from './components/CurrencyDebug';

// Navigation Component
const Navigation = () => {
  const { currentLanguage, changeLanguage } = useLanguage();
  const t = (key) => getTranslation(currentLanguage, key);
  const { user, profile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Box
      as="nav"
      position="sticky"
      top="0"
      bg={scrolled ? 'rgba(255, 255, 255, 0.95)' : 'white'}
      backdropFilter={scrolled ? 'blur(10px)' : 'none'}
      borderBottom="1px solid"
      borderColor={scrolled ? 'gray.200' : 'transparent'}
      zIndex="1000"
      shadow={scrolled ? 'lg' : 'none'}
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      className="animate__animated animate__fadeInDown"
    >
      <Container maxW="8xl">
        <Flex h="80px" alignItems="center" justifyContent="space-between">
          <Link href="/" textDecoration="none">
            <Image
              src={logoColored}
              alt="OneSIM"
              h="32px"
              cursor="pointer"
              transition="all 0.3s"
              _hover={{ transform: 'scale(1.05)' }}
            />
          </Link>

          <HStack spacing={6} display={{ base: 'none', md: 'flex' }}>
            <Link
              href="/#home"
              fontWeight="600"
              color="gray.700"
              fontSize="md"
              position="relative"
              _hover={{
                color: '#FE4F18',
                _after: { width: '100%' }
              }}
              _after={{
                content: '""',
                position: 'absolute',
                bottom: '-4px',
                left: 0,
                width: 0,
                height: '2px',
                bg: '#FE4F18',
                transition: 'width 0.3s ease',
              }}
            >
              {t('nav.home')}
            </Link>
            <Link
              href="/plans"
              fontWeight="600"
              color="gray.700"
              fontSize="md"
              position="relative"
              _hover={{
                color: '#FE4F18',
                _after: { width: '100%' }
              }}
              _after={{
                content: '""',
                position: 'absolute',
                bottom: '-4px',
                left: 0,
                width: 0,
                height: '2px',
                bg: '#FE4F18',
                transition: 'width 0.3s ease',
              }}
            >
              {t('nav.plans')}
            </Link>
            <Link
              href="/how-to-install"
              fontWeight="600"
              color="gray.700"
              fontSize="md"
              position="relative"
              _hover={{
                color: '#FE4F18',
                _after: { width: '100%' }
              }}
              _after={{
                content: '""',
                position: 'absolute',
                bottom: '-4px',
                left: 0,
                width: 0,
                height: '2px',
                bg: '#FE4F18',
                transition: 'width 0.3s ease',
              }}
            >
              {t('nav.howToInstall')}
            </Link>
            <Link
              href="/#contacts"
              fontWeight="600"
              color="gray.700"
              fontSize="md"
              position="relative"
              _hover={{
                color: '#FE4F18',
                _after: { width: '100%' }
              }}
              _after={{
                content: '""',
                position: 'absolute',
                bottom: '-4px',
                left: 0,
                width: 0,
                height: '2px',
                bg: '#FE4F18',
                transition: 'width 0.3s ease',
              }}
            >
              {t('nav.contacts')}
            </Link>

            {/* Language Switcher */}
            <Menu>
              <MenuButton
                as={Button}
                variant="ghost"
                size="sm"
                px={2}
                _hover={{ bg: 'gray.50' }}
              >
                <HStack spacing={1}>
                  <Box
                    width="24px"
                    height="18px"
                    borderRadius="sm"
                    overflow="hidden"
                    border="1px solid"
                    borderColor="gray.200"
                    flexShrink={0}
                  >
                    <Flag
                      code={currentLanguage === 'uz' ? 'UZ' : 'RU'}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Box>
                  <Text fontSize="sm" fontWeight="600">
                    {currentLanguage === 'uz' ? 'UZ' : 'RU'}
                  </Text>
                  <ChevronDownIcon className="w-3.5 h-3.5" />
                </HStack>
              </MenuButton>
              <MenuList minW="120px">
                <MenuItem onClick={() => changeLanguage(LANGUAGES.RU)}>
                  <HStack spacing={2}>
                    <Box
                      width="24px"
                      height="18px"
                      borderRadius="sm"
                      overflow="hidden"
                      border="1px solid"
                      borderColor="gray.200"
                      flexShrink={0}
                    >
                      <Flag code="RU" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </Box>
                    <Text>Русский</Text>
                  </HStack>
                </MenuItem>
                <MenuItem onClick={() => changeLanguage(LANGUAGES.UZ)}>
                  <HStack spacing={2}>
                    <Box
                      width="24px"
                      height="18px"
                      borderRadius="sm"
                      overflow="hidden"
                      border="1px solid"
                      borderColor="gray.200"
                      flexShrink={0}
                    >
                      <Flag code="UZ" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </Box>
                    <Text>O'zbekcha</Text>
                  </HStack>
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>

          {/* User Dropdown or Login/Signup Buttons */}
          <HStack spacing={3} display={{ base: 'none', md: 'flex' }}>
            {user && profile ? (
              <>
                <Button
                  as="a"
                  href="/mypage"
                  size="md"
                  variant="ghost"
                  fontWeight="600"
                  color="gray.700"
                  _hover={{ bg: 'gray.50' }}
                  leftIcon={<UserIcon className="w-[18px] h-[18px]" />}
                >
                  {t('nav.myPage')}
                </Button>
                <Menu>
                  <MenuButton
                    as={Button}
                    variant="ghost"
                    px={3}
                    py={2}
                    _hover={{ bg: 'gray.50' }}
                    _active={{ bg: 'gray.100' }}
                  >
                    <HStack spacing={2}>
                      <Avatar
                        size="sm"
                        name={`${profile.first_name} ${profile.last_name}`}
                        bg="purple.500"
                        color="white"
                      />
                      <Text fontWeight="600" color="gray.700">
                        {profile.first_name} {profile.last_name}
                      </Text>
                      <ChevronDownIcon className="w-[18px] h-[18px]" />
                    </HStack>
                  </MenuButton>
                  <MenuList>
                    <MenuItem icon={<ArrowRightOnRectangleIcon className="w-[18px] h-[18px]" />} onClick={handleLogout} color="red.600">
                      {t('nav.logout')}
                    </MenuItem>
                  </MenuList>
                </Menu>
              </>
            ) : (
              <>
                <Button
                  as="a"
                  href="/signup"
                  size="md"
                  variant="outline"
                  borderColor="#E8E9EE"
                  color="#151618"
                  fontWeight="700"
                  borderWidth="2px"
                  borderRadius="full"
                  _hover={{
                    bg: '#F5F6F8',
                    borderColor: '#D1D3D9',
                  }}
                >
                  Регистрация
                </Button>
                <Button
                  as="a"
                  href="/login"
                  size="md"
                  bg="#FE4F18"
                  color="white"
                  fontWeight="700"
                  borderRadius="full"
                  _hover={{
                    bg: '#FF6B3D',
                    transform: 'translateY(-2px)',
                    shadow: '0 10px 30px rgba(254, 79, 24, 0.3)',
                  }}
                >
                  {t('nav.login')}
                </Button>
              </>
            )}
          </HStack>

          <IconButton
            display={{ base: 'flex', md: 'none' }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            variant="ghost"
            aria-label="Toggle menu"
            color="gray.700"
            _hover={{ bg: 'gray.100' }}
          >
            {mobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
          </IconButton>
        </Flex>

        {mobileMenuOpen && (
          <Box display={{ base: 'block', md: 'none' }} pb={4} className="animate__animated animate__fadeInDown animate__faster">
            <VStack spacing={2} align="stretch">
              <Link href="/#home" fontWeight="600" py={3} px={4} borderRadius="lg" _hover={{ bg: 'gray.50' }} onClick={() => setMobileMenuOpen(false)}>
                {t('nav.home')}
              </Link>
              <Link href="/plans" fontWeight="600" py={3} px={4} borderRadius="lg" _hover={{ bg: 'gray.50' }} onClick={() => setMobileMenuOpen(false)}>
                {t('nav.plans')}
              </Link>
              <Link href="/how-to-install" fontWeight="600" py={3} px={4} borderRadius="lg" _hover={{ bg: 'gray.50' }} onClick={() => setMobileMenuOpen(false)}>
                {t('nav.howToInstall')}
              </Link>
              <Link href="/#contacts" fontWeight="600" py={3} px={4} borderRadius="lg" _hover={{ bg: 'gray.50' }} onClick={() => setMobileMenuOpen(false)}>
                {t('nav.contacts')}
              </Link>

              {/* Language Switcher Mobile */}
              <HStack spacing={3} py={3} px={4}>
                <Button
                  size="sm"
                  variant={currentLanguage === 'ru' ? 'solid' : 'ghost'}
                  colorScheme={currentLanguage === 'ru' ? 'purple' : 'gray'}
                  onClick={() => changeLanguage(LANGUAGES.RU)}
                  flex={1}
                  leftIcon={
                    <Box
                      width="20px"
                      height="15px"
                      borderRadius="sm"
                      overflow="hidden"
                      border="1px solid"
                      borderColor="gray.300"
                    >
                      <Flag code="RU" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </Box>
                  }
                >
                  RU
                </Button>
                <Button
                  size="sm"
                  variant={currentLanguage === 'uz' ? 'solid' : 'ghost'}
                  colorScheme={currentLanguage === 'uz' ? 'purple' : 'gray'}
                  onClick={() => changeLanguage(LANGUAGES.UZ)}
                  flex={1}
                  leftIcon={
                    <Box
                      width="20px"
                      height="15px"
                      borderRadius="sm"
                      overflow="hidden"
                      border="1px solid"
                      borderColor="gray.300"
                    >
                      <Flag code="UZ" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </Box>
                  }
                >
                  UZ
                </Button>
              </HStack>

              {user && profile ? (
                <>
                  <Link href="/mypage" fontWeight="600" py={3} px={4} borderRadius="lg" _hover={{ bg: 'gray.50' }} onClick={() => setMobileMenuOpen(false)}>
                    {t('nav.myPage')}
                  </Link>
                  <Button onClick={handleLogout} variant="ghost" justifyContent="flex-start" fontWeight="600" color="red.600">
                    {t('nav.logout')}
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/signup" fontWeight="600" py={3} px={4} borderRadius="lg" _hover={{ bg: 'gray.50' }} onClick={() => setMobileMenuOpen(false)}>
                    Регистрация
                  </Link>
                  <Link href="/login" fontWeight="600" py={3} px={4} borderRadius="lg" _hover={{ bg: 'gray.50' }} onClick={() => setMobileMenuOpen(false)}>
                    {t('nav.login')}
                  </Link>
                </>
              )}
            </VStack>
          </Box>
        )}
      </Container>
    </Box>
  );
};

// Hero Section Component
const HeroSection = () => {
  const { currentLanguage } = useLanguage();
  const t = (key) => getTranslation(currentLanguage, key);

  return (
    <Box
      as="section"
      id="home"
      bg="#F5F6F8"
      pt={0}
      pb={{ base: 20, md: 28 }}
      minH="calc(100vh - 80px)"
      display="flex"
      alignItems="center"
      position="relative"
      overflow="hidden"
    >
      <Box position="absolute" top="-50%" right="-20%" width="600px" height="600px" bg="#FFF4F0" borderRadius="full" filter="blur(100px)" opacity="0.5" pointerEvents="none" />
      <Box position="absolute" bottom="-30%" left="-10%" width="500px" height="500px" bg="#E8E9EE" borderRadius="full" filter="blur(100px)" opacity="0.4" pointerEvents="none" />

      <Container maxW="8xl" position="relative">
        <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={16} alignItems="center">
          <GridItem className="animate__animated animate__fadeInLeft">
            <VStack align="flex-start" spacing={8}>
              <Heading
                as="h1"
                fontSize={{ base: '2.5rem', md: '3rem', lg: '3.6rem' }}
                fontWeight="800"
                lineHeight="1.1"
                color="gray.900"
                letterSpacing="tight"
                sx={{
                  WebkitTextStroke: '0.5px #151618',
                }}
              >
                {t('hero.title')}{' '}
                <Box as="span" color="#FE4F18" display="inline" sx={{ WebkitTextStroke: '0.5px #FE4F18' }}>
                  OneSIM
                </Box>
              </Heading>

              <Text fontSize={{ base: 'lg', md: 'xl' }} color="gray.600" lineHeight="1.8" fontWeight="500">
                {t('hero.description')}
              </Text>

              <VStack align="flex-start" spacing={4} mt={2}>
                <HStack spacing={3}>
                  <Box bg="#FEEADE" p={3} borderRadius="lg">
                    <Box as={GlobeAltIcon} w="24px" h="24px" color="#FE4F18" />
                  </Box>
                  <Text fontWeight="600" color="gray.700">{t('hero.features.coverage')}</Text>
                </HStack>
                <HStack spacing={3}>
                  <Box bg="#FEEADE" p={3} borderRadius="lg">
                    <Box as={BoltIcon} w="24px" h="24px" color="#FE4F18" />
                  </Box>
                  <Text fontWeight="600" color="gray.700">{t('hero.features.activation')}</Text>
                </HStack>
                <HStack spacing={3}>
                  <Box bg="#FEEADE" p={3} borderRadius="lg">
                    <Box as={ShieldCheckIcon} w="24px" h="24px" color="#FE4F18" />
                  </Box>
                  <Text fontWeight="600" color="gray.700">{t('hero.features.secure')}</Text>
                </HStack>
              </VStack>

              <Button
                size="lg"
                bg="#151618"
                color="white"
                px={10}
                py={7}
                fontSize="lg"
                fontWeight="700"
                borderRadius="full"
                _hover={{
                  bg: '#2D2F33',
                  transform: 'translateY(-3px)',
                  shadow: '0 20px 40px rgba(21, 22, 24, 0.4)',
                }}
                _active={{ transform: 'translateY(-1px)' }}
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                shadow="0 10px 30px rgba(21, 22, 24, 0.3)"
              >
                {t('hero.cta')}
                <ChevronRightIcon className="w-5 h-5 ml-2" />
              </Button>
            </VStack>
          </GridItem>

          <GridItem className="animate__animated animate__fadeInRight">
            <Box
              position="relative"
              overflow="visible"
            >
              {/* Gradient rectangle decoration behind the image */}
              <Box
                position="absolute"
                bottom="-30px"
                right="-30px"
                width="100%"
                height="100%"
                bgGradient="linear(137deg, #FD916A 6.42%, #7D7571 57.11%, #727272 100%)"
                opacity={0.2}
                borderRadius="3xl"
                zIndex={0}
              />
              <Image
                src="https://ik.imagekit.io/php1jcf0t/OneSim/banner-image.png"
                alt="OneSIM Global Coverage"
                borderRadius="3xl"
                w="full"
                position="relative"
                zIndex={1}
                display="block"
              />
            </Box>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  );
};

// Footer Component
const Footer = () => {
  const { currentLanguage } = useLanguage();
  const t = (key) => getTranslation(currentLanguage, key);

  return (
    <Box as="footer" bg="#151618" color="white" py={16} mt={20} id="contacts">
      <Container maxW="8xl">
        <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={12} mb={12}>
          <GridItem>
            <VStack align="flex-start" spacing={4}>
              <Image
                src={logoWhite}
                alt="OneSIM"
                h="35px"
              />
              <Text color="gray.400" fontSize="sm" lineHeight="1.7">
                {t('footer.description')}
              </Text>
            </VStack>
          </GridItem>

          <GridItem>
            <VStack align="flex-start" spacing={3}>
              <Heading size="md" fontWeight="700" mb={2}>{t('footer.quickLinks')}</Heading>
              <Link href="/#home" color="gray.400" _hover={{ color: 'white' }} fontWeight="500">{t('nav.home')}</Link>
              <Link href="/plans" color="gray.400" _hover={{ color: 'white' }} fontWeight="500">{t('nav.plans')}</Link>
              <Link href="/#contacts" color="gray.400" _hover={{ color: 'white' }} fontWeight="500">{t('nav.contacts')}</Link>
            </VStack>
          </GridItem>

          <GridItem>
            <VStack align="flex-start" spacing={3}>
              <Heading size="md" fontWeight="700" mb={2}>{t('footer.legal')}</Heading>
              <Link href="/legal/offer" color="gray.400" _hover={{ color: 'white' }} fontWeight="500">Публичная оферта</Link>
              <Link href="/legal/privacy" color="gray.400" _hover={{ color: 'white' }} fontWeight="500">Политика конфиденциальности</Link>
              <Link href="/legal/terms" color="gray.400" _hover={{ color: 'white' }} fontWeight="500">Пользовательское соглашение</Link>
              <Link href="/legal/refund" color="gray.400" _hover={{ color: 'white' }} fontWeight="500">Политика возврата</Link>
            </VStack>
          </GridItem>
        </Grid>

        <Box pt={8} borderTop="1px solid" borderColor="whiteAlpha.200">
          <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align="center" gap={4}>
            <Text color="gray.400" fontSize="sm" fontWeight="500">
              © 2025 ONETECH PRO LLC. {t('footer.copyright')}
            </Text>
            <Text color="gray.500" fontSize="xs">
              {t('footer.madeWith')}
            </Text>
          </Flex>
        </Box>
      </Container>
    </Box>
  );
};

// FAQ Section Component
const FAQSection = () => {
  const { currentLanguage } = useLanguage();
  const t = (key) => getTranslation(currentLanguage, key);

  const questions = [
    {
      id: 'whatIsEsim',
      question: t('faq.questions.whatIsEsim.question'),
      answer: t('faq.questions.whatIsEsim.answer'),
    },
    {
      id: 'howToActivate',
      question: t('faq.questions.howToActivate.question'),
      answer: t('faq.questions.howToActivate.answer'),
    },
    {
      id: 'deviceCompatibility',
      question: t('faq.questions.deviceCompatibility.question'),
      answer: t('faq.questions.deviceCompatibility.answer'),
    },
    {
      id: 'canKeepNumber',
      question: t('faq.questions.canKeepNumber.question'),
      answer: t('faq.questions.canKeepNumber.answer'),
    },
    {
      id: 'howMuchData',
      question: t('faq.questions.howMuchData.question'),
      answer: t('faq.questions.howMuchData.answer'),
    },
  ];

  return (
    <Box as="section" py={{ base: 16, md: 24 }} bg="#F5F6F8">
      <Container maxW="5xl">
        <VStack spacing={12}>
          {/* Header */}
          <VStack spacing={4} textAlign="center">
            <Heading
              fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}
              fontWeight="800"
              color="gray.900"
              className="animate__animated animate__fadeInUp"
            >
              {t('faq.title')}{' '}
              <Box
                as="span"
                color="#FE4F18"
              >
                {t('faq.titleHighlight')}
              </Box>
            </Heading>
            <Text
              fontSize={{ base: 'lg', md: 'xl' }}
              color="gray.600"
              maxW="2xl"
              className="animate__animated animate__fadeInUp animate__delay-1s"
            >
              {t('faq.description')}
            </Text>
          </VStack>

          {/* FAQ Accordion */}
          <Accordion
            allowToggle
            w="full"
            className="animate__animated animate__fadeInUp animate__delay-2s"
          >
            {questions.map((item, index) => (
              <AccordionItem
                key={item.id}
                border="none"
                bg="white"
                mb={4}
                borderRadius="xl"
                shadow="sm"
                _hover={{ shadow: '0 20px 40px rgba(254, 79, 24, 0.15)' }}
                transition="all 0.3s ease-in-out"
              >
                <AccordionButton
                  py={6}
                  px={8}
                  borderRadius="xl"
                  _hover={{ bg: '#FFF4F0' }}
                  _expanded={{ bg: '#FFF4F0', borderBottomRadius: 0 }}
                >
                  <Box flex="1" textAlign="left">
                    <Text fontSize="lg" fontWeight="700" color="gray.800">
                      {item.question}
                    </Text>
                  </Box>
                  <AccordionIcon fontSize="24px" color="#FE4F18" />
                </AccordionButton>
                <AccordionPanel px={8} py={6} bg="#FFF4F0" borderBottomRadius="xl">
                  <Text fontSize="md" color="gray.700" lineHeight="1.8">
                    {item.answer}
                  </Text>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </VStack>
      </Container>
    </Box>
  );
};

// Home Page Component
const HomePage = () => {
  const location = useLocation();

  // Get state from navigation
  const navigationState = location.state || {};

  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <FAQSection />
      <PlansSection />
      <PopularDestinations
        scrollToSection={navigationState.scrollToDestinations}
        initialTab={navigationState.activeTab}
      />
    </>
  );
};

// Main App Component
function AppContent() {
  return (
    <Box fontFamily="'Manrope', sans-serif">
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap');`}
      </style>

      {/* TEMPORARY: Currency Debug Panel - Remove after testing */}
      <CurrencyDebug />

      <Navigation />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/plans" element={<PlansPage />} />
        <Route path="/how-to-install" element={<HowToInstall />} />
        <Route path="/country/:countryCode" element={<CountryPage />} />
        <Route path="/regional/:regionCode" element={<RegionalPackagesPage />} />
        <Route path="/package/:packageId" element={<PackagePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/legal/offer" element={<PublicOffer />} />
        <Route path="/legal/privacy" element={<PrivacyPolicy />} />
        <Route path="/legal/terms" element={<TermsOfService />} />
        <Route path="/legal/refund" element={<RefundPolicy />} />
        <Route
          path="/mypage"
          element={
            <ProtectedRoute>
              <MyPage />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Footer />
    </Box>
  );
}

function App() {
  return (
    <Router>
      <LanguageProvider>
        <CurrencyProvider>
          <AuthProvider>
            <FavoritesProvider>
              <AppContent />
            </FavoritesProvider>
          </AuthProvider>
        </CurrencyProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;