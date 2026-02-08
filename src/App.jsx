// src/App.jsx (FULL FILE - copy entire thing)
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
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
  Input,
  InputGroup,
  InputLeftElement,
  List,
  ListItem,
  useOutsideClick,
} from '@chakra-ui/react';
import {
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import Flag from 'react-world-flags';
import 'animate.css';
import PlansSection from './components/PlansSection';
import PopularDestinations from './components/PopularDestinations';
import FeaturesSection from './components/FeaturesSection';
import CountryFlag from './components/CountryFlag';
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
import { getTranslation, LANGUAGES, COUNTRY_TRANSLATIONS, getCountrySearchNames } from './config/i18n.js';
// Logo imports
import logoWhite from './assets/images/logo-white.svg';
import logoColored from './assets/new-logo.svg';
import CurrencyDebug from './components/CurrencyDebug';
import PriceSyncDebug from './components/PriceSyncDebug';

// Navigation Component
const Navigation = () => {
  const { currentLanguage, changeLanguage } = useLanguage();
  const t = (key) => getTranslation(currentLanguage, key);
  const { user, profile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

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

  // On homepage: transparent on top, glassmorphism dark on scroll
  // On other pages: white background
  const navBg = isHomePage
    ? (scrolled ? 'rgba(21, 22, 24, 0.85)' : 'transparent')
    : (scrolled ? 'rgba(255, 255, 255, 0.95)' : 'white');
  const navTextColor = isHomePage ? 'white' : 'gray.700';
  const navHoverColor = isHomePage ? 'whiteAlpha.200' : 'gray.50';
  const navBorderColor = isHomePage
    ? (scrolled ? 'whiteAlpha.100' : 'transparent')
    : (scrolled ? 'gray.200' : 'transparent');

  return (
    <Box
      as="nav"
      position={isHomePage ? 'fixed' : 'sticky'}
      top="0"
      left="0"
      right="0"
      bg={navBg}
      backdropFilter={scrolled || isHomePage ? 'blur(20px)' : 'none'}
      css={{ WebkitBackdropFilter: scrolled || isHomePage ? 'blur(20px)' : 'none' }}
      borderBottom="1px solid"
      borderColor={navBorderColor}
      zIndex="1000"
      shadow={scrolled && !isHomePage ? 'lg' : 'none'}
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      sx={{
        animation: 'navSlideDown 0.6s ease-out',
        '@keyframes navSlideDown': {
          from: { opacity: 0, transform: 'translateY(-20px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      <Container maxW="8xl">
        <Flex h="72px" alignItems="center" justifyContent="space-between">
          <Link href="/" textDecoration="none">
            <Image
              src={isHomePage ? logoWhite : logoColored}
              alt="OneSIM"
              h="30px"
              cursor="pointer"
              transition="all 0.3s"
              _hover={{ transform: 'scale(1.05)' }}
            />
          </Link>

          <HStack spacing={6} display={{ base: 'none', md: 'flex' }}>
            <Link
              href="/#home"
              fontWeight="600"
              color={navTextColor}
              fontSize="md"
              position="relative"
              _hover={{
                color: isHomePage ? 'white' : '#FE4F18',
                _after: { width: '100%' }
              }}
              _after={{
                content: '""',
                position: 'absolute',
                bottom: '-4px',
                left: 0,
                width: 0,
                height: '2px',
                bg: isHomePage ? 'white' : '#FE4F18',
                transition: 'width 0.3s ease',
              }}
            >
              {t('nav.home')}
            </Link>
            <Link
              href="/plans"
              fontWeight="600"
              color={navTextColor}
              fontSize="md"
              position="relative"
              _hover={{
                color: isHomePage ? 'white' : '#FE4F18',
                _after: { width: '100%' }
              }}
              _after={{
                content: '""',
                position: 'absolute',
                bottom: '-4px',
                left: 0,
                width: 0,
                height: '2px',
                bg: isHomePage ? 'white' : '#FE4F18',
                transition: 'width 0.3s ease',
              }}
            >
              {t('nav.plans')}
            </Link>
            <Link
              href="/how-to-install"
              fontWeight="600"
              color={navTextColor}
              fontSize="md"
              position="relative"
              _hover={{
                color: isHomePage ? 'white' : '#FE4F18',
                _after: { width: '100%' }
              }}
              _after={{
                content: '""',
                position: 'absolute',
                bottom: '-4px',
                left: 0,
                width: 0,
                height: '2px',
                bg: isHomePage ? 'white' : '#FE4F18',
                transition: 'width 0.3s ease',
              }}
            >
              {t('nav.howToInstall')}
            </Link>
            <Link
              href="/#contacts"
              fontWeight="600"
              color={navTextColor}
              fontSize="md"
              position="relative"
              _hover={{
                color: isHomePage ? 'white' : '#FE4F18',
                _after: { width: '100%' }
              }}
              _after={{
                content: '""',
                position: 'absolute',
                bottom: '-4px',
                left: 0,
                width: 0,
                height: '2px',
                bg: isHomePage ? 'white' : '#FE4F18',
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
                _hover={{ bg: navHoverColor }}
              >
                <HStack spacing={1}>
                  <Box
                    width="24px"
                    height="18px"
                    borderRadius="sm"
                    overflow="hidden"
                    border="1px solid"
                    borderColor={isHomePage ? 'whiteAlpha.400' : 'gray.200'}
                    flexShrink={0}
                  >
                    <Flag
                      code={currentLanguage === 'uz' ? 'UZ' : 'RU'}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Box>
                  <Text fontSize="sm" fontWeight="600" color={navTextColor}>
                    {currentLanguage === 'uz' ? 'UZ' : 'RU'}
                  </Text>
                  <ChevronDownIcon className="w-3.5 h-3.5" style={{ color: isHomePage ? 'white' : undefined }} />
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
                  color={navTextColor}
                  _hover={{ bg: navHoverColor }}
                  leftIcon={<UserIcon className="w-[18px] h-[18px]" style={{ color: isHomePage ? 'white' : undefined }} />}
                >
                  {t('nav.myPage')}
                </Button>
                <Menu>
                  <MenuButton
                    as={Button}
                    variant="ghost"
                    px={3}
                    py={2}
                    _hover={{ bg: navHoverColor }}
                    _active={{ bg: isHomePage ? 'whiteAlpha.300' : 'gray.100' }}
                  >
                    <HStack spacing={2}>
                      <Avatar
                        size="sm"
                        name={`${profile.first_name} ${profile.last_name}`}
                        bg="purple.500"
                        color="white"
                      />
                      <Text fontWeight="600" color={navTextColor}>
                        {profile.first_name} {profile.last_name}
                      </Text>
                      <ChevronDownIcon className="w-[18px] h-[18px]" style={{ color: isHomePage ? 'white' : undefined }} />
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
                  borderColor={isHomePage ? 'whiteAlpha.400' : '#E8E9EE'}
                  color={navTextColor}
                  fontWeight="700"
                  borderWidth="2px"
                  borderRadius="full"
                  _hover={{
                    bg: isHomePage ? 'whiteAlpha.200' : '#F5F6F8',
                    borderColor: isHomePage ? 'whiteAlpha.600' : '#D1D3D9',
                  }}
                >
                  Регистрация
                </Button>
                <Button
                  as="a"
                  href="/login"
                  size="md"
                  bg={isHomePage ? 'white' : '#FE4F18'}
                  color={isHomePage ? '#FE4F18' : 'white'}
                  fontWeight="700"
                  borderRadius="full"
                  _hover={{
                    bg: isHomePage ? 'whiteAlpha.900' : '#FF6B3D',
                    transform: 'translateY(-2px)',
                    shadow: isHomePage ? '0 10px 30px rgba(255, 255, 255, 0.3)' : '0 10px 30px rgba(254, 79, 24, 0.3)',
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
            color={navTextColor}
            _hover={{ bg: navHoverColor }}
          >
            {mobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
          </IconButton>
        </Flex>

        {mobileMenuOpen && (
          <Box
            display={{ base: 'block', md: 'none' }}
            pb={4}
            bg={isHomePage ? 'rgba(21, 22, 24, 0.9)' : 'white'}
            borderRadius="0 0 16px 16px"
            className="animate__animated animate__fadeInDown animate__faster"
          >
            <VStack spacing={2} align="stretch">
              <Link href="/#home" fontWeight="600" color={navTextColor} py={3} px={4} borderRadius="lg" _hover={{ bg: navHoverColor }} onClick={() => setMobileMenuOpen(false)}>
                {t('nav.home')}
              </Link>
              <Link href="/plans" fontWeight="600" color={navTextColor} py={3} px={4} borderRadius="lg" _hover={{ bg: navHoverColor }} onClick={() => setMobileMenuOpen(false)}>
                {t('nav.plans')}
              </Link>
              <Link href="/how-to-install" fontWeight="600" color={navTextColor} py={3} px={4} borderRadius="lg" _hover={{ bg: navHoverColor }} onClick={() => setMobileMenuOpen(false)}>
                {t('nav.howToInstall')}
              </Link>
              <Link href="/#contacts" fontWeight="600" color={navTextColor} py={3} px={4} borderRadius="lg" _hover={{ bg: navHoverColor }} onClick={() => setMobileMenuOpen(false)}>
                {t('nav.contacts')}
              </Link>

              {/* Language Switcher Mobile */}
              <HStack spacing={3} py={3} px={4}>
                <Button
                  size="sm"
                  variant={currentLanguage === 'ru' ? 'solid' : 'ghost'}
                  colorScheme={currentLanguage === 'ru' ? 'orange' : 'gray'}
                  onClick={() => changeLanguage(LANGUAGES.RU)}
                  flex={1}
                  color={currentLanguage === 'ru' ? 'white' : navTextColor}
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
                  colorScheme={currentLanguage === 'uz' ? 'orange' : 'gray'}
                  onClick={() => changeLanguage(LANGUAGES.UZ)}
                  flex={1}
                  color={currentLanguage === 'uz' ? 'white' : navTextColor}
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
                  <Link href="/mypage" fontWeight="600" color={navTextColor} py={3} px={4} borderRadius="lg" _hover={{ bg: navHoverColor }} onClick={() => setMobileMenuOpen(false)}>
                    {t('nav.myPage')}
                  </Link>
                  <Button onClick={handleLogout} variant="ghost" justifyContent="flex-start" fontWeight="600" color="red.400">
                    {t('nav.logout')}
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/signup" fontWeight="600" color={navTextColor} py={3} px={4} borderRadius="lg" _hover={{ bg: navHoverColor }} onClick={() => setMobileMenuOpen(false)}>
                    Регистрация
                  </Link>
                  <Link href="/login" fontWeight="600" color={navTextColor} py={3} px={4} borderRadius="lg" _hover={{ bg: navHoverColor }} onClick={() => setMobileMenuOpen(false)}>
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

// Hero Search Component
const HeroSearch = ({ animDelay = '0.6s' }) => {
  const { currentLanguage } = useLanguage();
  const t = (key) => getTranslation(currentLanguage, key);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useOutsideClick({
    ref: dropdownRef,
    handler: () => setShowDropdown(false),
  });

  const allCountries = useMemo(() => {
    const countries = COUNTRY_TRANSLATIONS[currentLanguage] || {};
    return Object.entries(countries)
      .filter(([code]) => code.length === 2)
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [currentLanguage]);

  const filteredCountries = useMemo(() => {
    if (!searchQuery) return allCountries.slice(0, 8);
    const search = searchQuery.toLowerCase();
    return allCountries.filter(country => {
      const searchNames = getCountrySearchNames(country.code, currentLanguage);
      return searchNames.some(name => name.toLowerCase().includes(search));
    }).slice(0, 8);
  }, [allCountries, searchQuery, currentLanguage]);

  const highlightText = useCallback((text, search) => {
    if (!search) return text;
    const index = text.toLowerCase().indexOf(search.toLowerCase());
    if (index === -1) return text;
    const before = text.substring(0, index);
    const match = text.substring(index, index + search.length);
    const after = text.substring(index + search.length);
    return (
      <>
        {before}
        <Text as="span" bg="rgba(254, 79, 24, 0.2)" color="#FE4F18" fontWeight="700">
          {match}
        </Text>
        {after}
      </>
    );
  }, []);

  const handleCountrySelect = (countryCode) => {
    setShowDropdown(false);
    setSearchQuery('');
    navigate(`/country/${countryCode}`);
  };

  return (
    <Box
      position="relative"
      ref={dropdownRef}
      w="100%"
      maxW="480px"
      sx={{
        animation: `heroFadeUp 0.7s ease-out ${animDelay} both`,
      }}
    >
      <InputGroup size="lg">
        <InputLeftElement pointerEvents="none" h="56px" pl={2}>
          <MagnifyingGlassIcon style={{ width: '22px', height: '22px', color: 'rgba(255,255,255,0.6)' }} />
        </InputLeftElement>
        <Input
          ref={inputRef}
          placeholder={t('hero.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          h="56px"
          pl="52px"
          borderRadius="full"
          bg="rgba(255, 255, 255, 0.18)"
          backdropFilter="blur(10px)"
          css={{ WebkitBackdropFilter: 'blur(10px)' }}
          border="1.5px solid rgba(255, 255, 255, 0.25)"
          color="white"
          fontWeight="500"
          fontSize="16px"
          _placeholder={{ color: 'rgba(255, 255, 255, 0.6)' }}
          _hover={{ bg: 'rgba(255, 255, 255, 0.24)', borderColor: 'rgba(255, 255, 255, 0.4)' }}
          _focus={{ bg: 'rgba(255, 255, 255, 0.24)', borderColor: 'rgba(255, 255, 255, 0.5)', boxShadow: '0 0 0 1px rgba(255,255,255,0.3)' }}
        />
      </InputGroup>

      {showDropdown && filteredCountries.length > 0 && (
        <Box
          position="absolute"
          top="100%"
          left={0}
          right={0}
          mt={2}
          bg="white"
          borderRadius="20px"
          boxShadow="0 12px 40px rgba(0, 0, 0, 0.15)"
          maxH="320px"
          overflowY="auto"
          zIndex={1000}
          border="1px solid #E8E9EE"
          css={{
            '&::-webkit-scrollbar': { width: '6px' },
            '&::-webkit-scrollbar-track': { background: '#F5F6F8', borderRadius: '10px' },
            '&::-webkit-scrollbar-thumb': { background: '#FE4F18', borderRadius: '10px' },
          }}
        >
          <List spacing={0} py={2}>
            {filteredCountries.map((country) => (
              <ListItem
                key={country.code}
                onClick={() => handleCountrySelect(country.code)}
                cursor="pointer"
                px={4}
                py={3}
                _hover={{ bg: '#FFF4F0' }}
                transition="all 0.15s"
              >
                <HStack spacing={3}>
                  <Box
                    width="32px"
                    height="24px"
                    borderRadius="6px"
                    overflow="hidden"
                    border="1px solid #E8E9EE"
                    flexShrink={0}
                  >
                    <CountryFlag
                      code={country.code}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Box>
                  <Text fontWeight="500" color="gray.800" fontSize="15px">
                    {highlightText(country.name, searchQuery)}
                  </Text>
                </HStack>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
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
      position="relative"
      bg="radial-gradient(100% 86.35% at 49.97% 0%, #FF9472 0%, #F1511F 52.6%, #F04E1B 100%)"
      h={{ base: 'auto', lg: '720px' }}           /* CONTROL: hero section height */
      pb={{ base: '100px', lg: '0' }}
      zIndex={1}
      sx={{
        /* ============================================================
           CURVE CONTROLLER (clip-path ellipse approach)
           - First value (120%): horizontal radius — bigger = wider/shallower curve
           - Second value (100%): vertical radius — controls how tall the ellipse is
           - "at 50% 0%": anchor point — 50% centers it, 0% pins to top

           Examples:
             ellipse(120% 100% at 50% 0%)  — default, nice curve
             ellipse(150% 100% at 50% 0%)  — flatter/wider curve
             ellipse(100% 100% at 50% 0%)  — more rounded curve
             ellipse(120% 90% at 50% 0%)   — shorter ellipse, more clipping
           ============================================================ */
        clipPath: {
          base: 'ellipse(180% 100% at 50% 0%)',   /* CONTROL: mobile curve */
          lg: 'ellipse(120% 100% at 50% 0%)',      /* CONTROL: desktop curve */
        },
      }}
    >
      <Container maxW="8xl" position="relative" zIndex={2} pt={{ base: '84px', md: '90px', lg: '96px' }}>
        <Flex
          direction={{ base: 'column', lg: 'row' }}
          justify="space-between"
          align={{ base: 'center', lg: 'flex-start' }}
          pt={{ base: 0, lg: '60px' }}
          minH={{ base: 'auto', lg: 'calc(720px - 96px)' }}
          gap={{ base: 8, lg: 4 }}
        >
          {/* Left: Text content */}
          <Box flex={{ base: '1', lg: '0 0 45%' }} zIndex={10}>
            <VStack align="flex-start" spacing={{ base: 5, md: 7 }} maxW="620px">
              <Heading
                as="h1"
                fontSize={{ base: '2.4rem', md: '3.2rem', lg: '3.8rem', xl: '4.2rem' }}
                fontWeight="800"
                lineHeight="1.08"
                color="white"
                letterSpacing="-0.02em"
                sx={{
                  animation: 'heroFadeUp 0.7s ease-out 0.15s both',
                  '@keyframes heroFadeUp': {
                    from: { opacity: 0, transform: 'translateY(24px)' },
                    to: { opacity: 1, transform: 'translateY(0)' },
                  },
                }}
              >
                {t('hero.title')}{' '}
                <Box as="span" fontWeight="900" display="inline">
                  {t('hero.titleAccent')}
                </Box>
              </Heading>

              <VStack align="flex-start" spacing={1}
                sx={{ animation: 'heroFadeUp 0.7s ease-out 0.3s both' }}
              >
                <Text
                  fontSize={{ base: 'sm', md: 'md', lg: 'lg' }}
                  color="rgba(255, 255, 255, 0.88)"
                  lineHeight="1.7"
                  fontWeight="500"
                >
                  {t('hero.subtitle1')}
                </Text>
                <Text
                  fontSize={{ base: 'sm', md: 'md', lg: 'lg' }}
                  color="rgba(255, 255, 255, 0.88)"
                  lineHeight="1.7"
                  fontWeight="500"
                >
                  {t('hero.subtitle2')}
                </Text>
              </VStack>

              <HeroSearch animDelay="0.5s" />
            </VStack>
          </Box>

          {/* Right: People image with floating cards */}
          <Box
            flex={{ base: '1', lg: '0 0 55%' }}
            position="relative"
            display="flex"
            alignItems="flex-end"
            justifyContent="center"
            h="100%"
            ml={{ base: 0, lg: '-120px' }}         /* CONTROL: overlap with text column */
            sx={{ animation: 'heroFadeRight 0.8s ease-out 0.3s both',
              '@keyframes heroFadeRight': {
                from: { opacity: 0, transform: 'translateX(40px)' },
                to: { opacity: 1, transform: 'translateX(0)' },
              },
            }}
          >
            {/* ============================================================
               PEOPLE IMAGE CONTROLLER
               - height: controls how tall the image is (105% = slightly overflows)
               - transform translateY: positive = push down (overflow past curve)
               - transform scale: shrink/grow (0.92 = 92% size)
               - transformOrigin: "bottom center" keeps feet anchored
               ============================================================ */}
            <Image
              src="https://ik.imagekit.io/php1jcf0t/OneSim/img-people.png"
              alt="People using eSIM"
              h={{ base: '90%', lg: '105%' }}       /* CONTROL: image height (% of container) */
              w="auto"
              loading="lazy"
              position="relative"
              zIndex={2}
              transformOrigin="bottom center"
              transform="translateY(-18%) scale(0.92)"  /* CONTROL: translateY = vertical shift (negative = up), scale = size */
            />

            {/* ============================================================
               UI CARD 1 CONTROLLER (top right — Европа 10/30)
               - Position: adjust top and right values
               - Scale/size: adjust w (width) values per breakpoint
               ============================================================ */}
            <Box
              position="absolute"
              top={{ base: '-2%', lg: '0%' }}      /* CONTROL: vertical position */
              right={{ base: '-15%', lg: '-10%' }}  /* CONTROL: horizontal position */
              w={{ base: '200px', md: '280px', lg: '340px' }}  /* CONTROL: card size/scale */
              zIndex={3}
              sx={{
                animation: 'cardFloat1 0.7s ease-out 0.7s both',
                '@keyframes cardFloat1': {
                  from: { opacity: 0, transform: 'translateY(20px)' },
                  to: { opacity: 1, transform: 'translateY(0)' },
                },
              }}
            >
              <Image
                src="https://ik.imagekit.io/php1jcf0t/OneSim/ui-screenshot1.png"
                alt="Europe 10/30 plan"
                w="100%"
                h="auto"
                loading="lazy"
                borderRadius="16px"
              />
            </Box>

            {/* ============================================================
               UI CARD 2 CONTROLLER (bottom right — Германия 20 дней)
               - Position: adjust bottom and right values
               - Scale/size: adjust w (width) values per breakpoint
               ============================================================ */}
            <Box
              position="absolute"
              bottom={{ base: '18%', lg: '22%' }}  /* CONTROL: vertical position */
              right={{ base: '-18%', lg: '-15%' }}  /* CONTROL: horizontal position */
              w={{ base: '220px', md: '300px', lg: '380px' }}  /* CONTROL: card size/scale */
              zIndex={3}
              sx={{
                animation: 'cardFloat2 0.7s ease-out 0.9s both',
                '@keyframes cardFloat2': {
                  from: { opacity: 0, transform: 'translateY(20px)' },
                  to: { opacity: 1, transform: 'translateY(0)' },
                },
              }}
            >
              <Image
                src="https://ik.imagekit.io/php1jcf0t/OneSim/ui-screenshot2.png"
                alt="Germany 20 days order"
                w="100%"
                h="auto"
                loading="lazy"
                borderRadius="16px"
              />
            </Box>
          </Box>
        </Flex>
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
      {/* Wrapper with peach bg so no white gap shows behind the hero clip-path curve */}
      <Box bg="#FFCFC0">
        <HeroSection />
      </Box>
      <PopularDestinations
        scrollToSection={navigationState.scrollToDestinations}
        initialTab={navigationState.activeTab}
      />
      <FeaturesSection />
      <FAQSection />
      <PlansSection />
      <PriceSyncDebug />
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