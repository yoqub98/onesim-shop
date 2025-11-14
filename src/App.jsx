// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
} from '@chakra-ui/react';
import { ChevronRight, Menu, X, Globe, Zap, Shield } from 'lucide-react';
import 'animate.css';
import PlansSection from './components/PlansSection';
import PopularDestinations from './components/PopularDestinations';
import CountryPage from './pages/CountryPage.jsx';
import { getTranslation, DEFAULT_LANGUAGE } from './config/i18n';

// Navigation Component
const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const lang = DEFAULT_LANGUAGE;
  const t = (key) => getTranslation(lang, key);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
          {/* Logo */}
          <Link href="/" textDecoration="none">
            <Heading
              size="2xl"
              background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              backgroundClip="text"
              fontWeight="800"
              letterSpacing="tight"
              cursor="pointer"
              transition="all 0.3s"
              _hover={{
                transform: 'scale(1.05)',
              }}
            >
              OneSIM
            </Heading>
          </Link>

          {/* Desktop Navigation */}
          <HStack gap={10} hideBelow="md">
            <Link 
              href="/#home" 
              fontWeight="600" 
              color="gray.700" 
              fontSize="md"
              position="relative"
              _hover={{ 
                color: 'purple.600',
                _after: {
                  width: '100%',
                }
              }}
              _after={{
                content: '""',
                position: 'absolute',
                bottom: '-4px',
                left: 0,
                width: 0,
                height: '2px',
                bg: 'purple.600',
                transition: 'width 0.3s ease',
              }}
            >
              {t('nav.home')}
            </Link>
            <Link 
              href="/#plans" 
              fontWeight="600" 
              color="gray.700"
              fontSize="md"
              position="relative"
              _hover={{ 
                color: 'purple.600',
                _after: {
                  width: '100%',
                }
              }}
              _after={{
                content: '""',
                position: 'absolute',
                bottom: '-4px',
                left: 0,
                width: 0,
                height: '2px',
                bg: 'purple.600',
                transition: 'width 0.3s ease',
              }}
            >
              {t('nav.plans')}
            </Link>
            <Link 
              href="/#contacts" 
              fontWeight="600" 
              color="gray.700"
              fontSize="md"
              position="relative"
              _hover={{ 
                color: 'purple.600',
                _after: {
                  width: '100%',
                }
              }}
              _after={{
                content: '""',
                position: 'absolute',
                bottom: '-4px',
                left: 0,
                width: 0,
                height: '2px',
                bg: 'purple.600',
                transition: 'width 0.3s ease',
              }}
            >
              {t('nav.contacts')}
            </Link>
          </HStack>

          {/* Mobile Menu Button */}
          <IconButton
            hideFrom="md"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            variant="ghost"
            aria-label="Toggle menu"
            color="gray.700"
            _hover={{
              bg: 'gray.100',
            }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </IconButton>
        </Flex>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <Box
            hideFrom="md"
            pb={4}
            className="animate__animated animate__fadeInDown animate__faster"
          >
            <VStack gap={2} align="stretch">
              <Link
                href="/#home"
                fontWeight="600"
                py={3}
                px={4}
                borderRadius="lg"
                _hover={{
                  bg: 'gray.50',
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.home')}
              </Link>
              <Link
                href="/#plans"
                fontWeight="600"
                py={3}
                px={4}
                borderRadius="lg"
                _hover={{
                  bg: 'gray.50',
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.plans')}
              </Link>
              <Link
                href="/#contacts"
                fontWeight="600"
                py={3}
                px={4}
                borderRadius="lg"
                _hover={{
                  bg: 'gray.50',
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.contacts')}
              </Link>
            </VStack>
          </Box>
        )}
      </Container>
    </Box>
  );
};

// Hero Section Component
const HeroSection = () => {
  const lang = DEFAULT_LANGUAGE;
  const t = (key) => getTranslation(lang, key);

  return (
    <Box
      as="section"
      id="home"
      background="linear-gradient(180deg, #fafafa 0%, #ffffff 100%)"
      py={{ base: 20, md: 28 }}
      minH="calc(100vh - 80px)"
      display="flex"
      alignItems="center"
      position="relative"
      overflow="hidden"
    >
      {/* Background decoration */}
      <Box
        position="absolute"
        top="-50%"
        right="-20%"
        width="600px"
        height="600px"
        bg="purple.50"
        borderRadius="full"
        filter="blur(100px)"
        opacity="0.5"
        pointerEvents="none"
      />
      <Box
        position="absolute"
        bottom="-30%"
        left="-10%"
        width="500px"
        height="500px"
        bg="blue.50"
        borderRadius="full"
        filter="blur(100px)"
        opacity="0.4"
        pointerEvents="none"
      />

      <Container maxW="8xl" position="relative">
        <Grid
          templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }}
          gap={16}
          alignItems="center"
        >
          {/* Left Content */}
          <GridItem className="animate__animated animate__fadeInLeft">
            <VStack align="flex-start" gap={8}>
              {/* Badge */}
              <Box
                bg="purple.50"
                color="purple.700"
                px={5}
                py={2}
                borderRadius="full"
                fontSize="sm"
                fontWeight="700"
                display="inline-flex"
                alignItems="center"
                gap={2}
              >
                <Zap size={16} />
                {t('hero.badge')}
              </Box>

              <Heading
                as="h1"
                fontSize={{ base: '4xl', md: '5xl', lg: '6xl' }}
                fontWeight="800"
                lineHeight="1.1"
                color="gray.900"
                letterSpacing="tight"
              >
                {t('hero.title')}{' '}
                <Box
                  as="span"
                  background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  backgroundClip="text"
                  display="inline"
                >
                  OneSIM
                </Box>
              </Heading>

              <Text 
                fontSize={{ base: 'lg', md: 'xl' }} 
                color="gray.600" 
                lineHeight="1.8"
                fontWeight="500"
              >
                {t('hero.description')}
              </Text>

              {/* Features */}
              <VStack align="flex-start" gap={4} mt={2}>
                <HStack gap={3}>
                  <Box
                    bg="purple.100"
                    p={2}
                    borderRadius="lg"
                  >
                    <Globe size={20} color="#7c3aed" />
                  </Box>
                  <Text fontWeight="600" color="gray.700">
                    {t('hero.features.coverage')}
                  </Text>
                </HStack>
                <HStack gap={3}>
                  <Box
                    bg="purple.100"
                    p={2}
                    borderRadius="lg"
                  >
                    <Zap size={20} color="#7c3aed" />
                  </Box>
                  <Text fontWeight="600" color="gray.700">
                    {t('hero.features.activation')}
                  </Text>
                </HStack>
                <HStack gap={3}>
                  <Box
                    bg="purple.100"
                    p={2}
                    borderRadius="lg"
                  >
                    <Shield size={20} color="#7c3aed" />
                  </Box>
                  <Text fontWeight="600" color="gray.700">
                    {t('hero.features.secure')}
                  </Text>
                </HStack>
              </VStack>

              <Button
                size="lg"
                bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                color="white"
                px={10}
                py={7}
                fontSize="lg"
                fontWeight="700"
                borderRadius="xl"
                _hover={{
                  transform: 'translateY(-3px)',
                  shadow: '0 20px 40px rgba(102, 126, 234, 0.4)',
                }}
                _active={{
                  transform: 'translateY(-1px)',
                }}
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                shadow="0 10px 30px rgba(102, 126, 234, 0.3)"
              >
                {t('hero.cta')}
                <ChevronRight size={22} style={{ marginLeft: '8px' }} />
              </Button>
            </VStack>
          </GridItem>

          {/* Right Image */}
          <GridItem className="animate__animated animate__fadeInRight">
            <Box
              position="relative"
              _before={{
                content: '""',
                position: 'absolute',
                top: '10%',
                left: '10%',
                right: '-10%',
                bottom: '-10%',
                bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '3xl',
                opacity: 0.1,
                zIndex: 0,
              }}
            >
              <Image
                src="https://ik.imagekit.io/php1jcf0t/OneSim/Gemini_Generated_Image_lvrtw5lvrtw5lvrt%20(1).png?updatedAt=1762971827953"
                alt="OneSIM Global Coverage"
                borderRadius="3xl"
                w="full"
                position="relative"
                zIndex={1}
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
  const lang = DEFAULT_LANGUAGE;
  const t = (key) => getTranslation(lang, key);

  return (
    <Box 
      as="footer" 
      background="linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)" 
      color="white" 
      py={16}
      mt={20}
      id="contacts"
    >
      <Container maxW="8xl">
        <Grid
          templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
          gap={12}
          mb={12}
        >
          {/* Brand Section */}
          <GridItem>
            <VStack align="flex-start" gap={4}>
              <Heading
                size="xl"
                background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                backgroundClip="text"
                fontWeight="800"
              >
                OneSIM
              </Heading>
              <Text color="gray.400" fontSize="sm" lineHeight="1.7">
                {t('footer.description')}
              </Text>
            </VStack>
          </GridItem>

          {/* Quick Links */}
          <GridItem>
            <VStack align="flex-start" gap={3}>
              <Heading size="md" fontWeight="700" mb={2}>
                {t('footer.quickLinks')}
              </Heading>
              <Link href="/#home" color="gray.400" _hover={{ color: 'white' }} fontWeight="500">
                {t('nav.home')}
              </Link>
              <Link href="/#plans" color="gray.400" _hover={{ color: 'white' }} fontWeight="500">
                {t('nav.plans')}
              </Link>
              <Link href="/#contacts" color="gray.400" _hover={{ color: 'white' }} fontWeight="500">
                {t('nav.contacts')}
              </Link>
            </VStack>
          </GridItem>

          {/* Legal */}
          <GridItem>
            <VStack align="flex-start" gap={3}>
              <Heading size="md" fontWeight="700" mb={2}>
                {t('footer.legal')}
              </Heading>
              <Link href="#privacy" color="gray.400" _hover={{ color: 'white' }} fontWeight="500">
                {t('footer.privacy')}
              </Link>
              <Link href="#terms" color="gray.400" _hover={{ color: 'white' }} fontWeight="500">
                {t('footer.terms')}
              </Link>
            </VStack>
          </GridItem>
        </Grid>

        {/* Bottom Bar */}
        <Box
          pt={8}
          borderTop="1px solid"
          borderColor="whiteAlpha.200"
        >
          <Flex
            direction={{ base: 'column', md: 'row' }}
            justify="space-between"
            align="center"
            gap={4}
          >
            <Text color="gray.400" fontSize="sm" fontWeight="500">
              © 2025 OneSIM. {t('footer.copyright')}
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

// Home Page Component
const HomePage = () => {
  return (
    <>
      <HeroSection />
      <PlansSection />
      <PopularDestinations />
    </>
  );
};

// Main App Component
function App() {
  return (
    <Router>
        {console.log("🟧 <Router> mounted")}
      <Box fontFamily="'Inter Tight', sans-serif">
        {/* Google Fonts Import */}
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700;800&display=swap');
          `}
        </style>
         {console.log("🟨 Rendering Navigation")}
        <Navigation />
          {console.log("🟪 Defining routes")}
        <Routes>
          <Route
            path="/"
            element={
              <>
                {console.log("🟩 ROUTE: / matched")}
                <HomePage />
              </>
            }
          />
          <Route
            path="/country/:countryCode"
            element={
              <>
                {console.log("🟥 ROUTE: /country/:countryCode matched")}
                <CountryPage />
              </>
            }
          />
        </Routes>
        
        <Footer />
      </Box>
    </Router>
  );
}

export default App;