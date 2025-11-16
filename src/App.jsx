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
import { ChevronRight, Menu, X, Globe, Zap, Shield, Wifi, CreditCard, Clock, Smartphone } from 'lucide-react';
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
          <GridItem className="animate__animated animate__fadeInLeft">
            <VStack align="flex-start" gap={8}>
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

// Benefits Section Component
const BenefitsSection = () => {
  const lang = DEFAULT_LANGUAGE;
  const t = (key) => getTranslation(lang, key);

  const benefits = [
    {
      icon: Zap,
      title: t('benefits.instant.title'),
      description: t('benefits.instant.description'),
      color: '#f59e0b',
      bgColor: '#fef3c7',
    },
    {
      icon: CreditCard,
      title: t('benefits.savings.title'),
      description: t('benefits.savings.description'),
      color: '#10b981',
      bgColor: '#d1fae5',
    },
    {
      icon: Smartphone,
      title: t('benefits.noPhysical.title'),
      description: t('benefits.noPhysical.description'),
      color: '#8b5cf6',
      bgColor: '#ede9fe',
    },
    {
      icon: Globe,
      title: t('benefits.multiCountry.title'),
      description: t('benefits.multiCountry.description'),
      color: '#3b82f6',
      bgColor: '#dbeafe',
    },
    {
      icon: Wifi,
      title: t('benefits.dataControl.title'),
      description: t('benefits.dataControl.description'),
      color: '#ec4899',
      bgColor: '#fce7f3',
    },
  ];

  return (
    <Box
      as="section"
      py={24}
      bg="white"
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        top="20%"
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
        <VStack gap={16}>
          <VStack gap={4} textAlign="center" maxW="3xl" mx="auto" className="animate__animated animate__fadeIn">
            <Heading
              as="h2"
              fontSize={{ base: '4xl', md: '5xl' }}
              fontWeight="800"
              color="gray.900"
              letterSpacing="tight"
            >
              {t('benefits.title')}{' '}
              <Box
                as="span"
                background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                backgroundClip="text"
              >
                {t('benefits.titleHighlight')}
              </Box>
            </Heading>
            <Text
              fontSize={{ base: 'lg', md: 'xl' }}
              color="gray.600"
              fontWeight="500"
            >
              {t('benefits.description')}
            </Text>
          </VStack>

          <Grid
            templateColumns={{ 
              base: '1fr', 
              md: 'repeat(2, 1fr)', 
              lg: 'repeat(3, 1fr)',
              xl: 'repeat(5, 1fr)' 
            }}
            gap={6}
            w="100%"
            className="animate__animated animate__fadeIn"
            style={{ animationDelay: '200ms' }}
          >
            {benefits.map((benefit, index) => (
              <BenefitCard key={index} benefit={benefit} delay={index * 100} />
            ))}
          </Grid>
        </VStack>
      </Container>
    </Box>
  );
};

// Benefit Card Component
const BenefitCard = ({ benefit, delay }) => {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = benefit.icon;

  return (
    <Box
      bg="white"
      borderRadius="2xl"
      p={8}
      border="2px solid"
      borderColor={isHovered ? 'purple.200' : 'gray.100'}
      transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
      transform={isHovered ? 'translateY(-8px)' : 'translateY(0)'}
      shadow={isHovered ? '0 25px 50px rgba(102, 126, 234, 0.15)' : '0 4px 12px rgba(0, 0, 0, 0.05)'}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="animate__animated animate__fadeInUp"
      style={{
        animationDelay: `${delay}ms`,
      }}
      cursor="default"
    >
      <VStack align="flex-start" gap={4} h="100%">
        <Box
          bg={benefit.bgColor}
          p={4}
          borderRadius="xl"
          transition="all 0.3s"
          transform={isHovered ? 'scale(1.1) rotate(5deg)' : 'scale(1) rotate(0deg)'}
        >
          <Icon size={32} color={benefit.color} />
        </Box>

        <Heading
          size="md"
          fontWeight="700"
          color="gray.900"
        >
          {benefit.title}
        </Heading>

        <Text
          fontSize="sm"
          color="gray.600"
          lineHeight="1.7"
          fontWeight="500"
        >
          {benefit.description}
        </Text>
      </VStack>
    </Box>
  );
};

// FAQ Section Component
const FAQSection = () => {
  const lang = DEFAULT_LANGUAGE;
  const t = (key) => getTranslation(lang, key);
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: t('faq.questions.whatIsEsim.question'),
      answer: t('faq.questions.whatIsEsim.answer'),
    },
    {
      question: t('faq.questions.howToActivate.question'),
      answer: t('faq.questions.howToActivate.answer'),
    },
    {
      question: t('faq.questions.deviceCompatibility.question'),
      answer: t('faq.questions.deviceCompatibility.answer'),
    },
    {
      question: t('faq.questions.canKeepNumber.question'),
      answer: t('faq.questions.canKeepNumber.answer'),
    },
  ];

  return (
    <Box
      as="section"
      py={24}
      bg="gray.50"
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        bottom="10%"
        right="-10%"
        width="500px"
        height="500px"
        bg="purple.50"
        borderRadius="full"
        filter="blur(100px)"
        opacity="0.5"
        pointerEvents="none"
      />

      <Container maxW="4xl" position="relative">
        <VStack gap={12}>
          <VStack gap={4} textAlign="center" className="animate__animated animate__fadeIn">
            <Heading
              as="h2"
              fontSize={{ base: '4xl', md: '5xl' }}
              fontWeight="800"
              color="gray.900"
              letterSpacing="tight"
            >
              {t('faq.title')}{' '}
              <Box
                as="span"
                background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                backgroundClip="text"
              >
                {t('faq.titleHighlight')}
              </Box>
            </Heading>
            <Text
              fontSize={{ base: 'lg', md: 'xl' }}
              color="gray.600"
              fontWeight="500"
            >
              {t('faq.description')}
            </Text>
          </VStack>

          <VStack gap={4} w="100%" align="stretch" className="animate__animated animate__fadeIn" style={{ animationDelay: '200ms' }}>
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                faq={faq}
                isOpen={openIndex === index}
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              />
            ))}
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
};

// FAQ Item Component
const FAQItem = ({ faq, isOpen, onClick }) => {
  return (
    <Box
      bg="white"
      borderRadius="xl"
      border="2px solid"
      borderColor={isOpen ? 'purple.200' : 'gray.100'}
      overflow="hidden"
      transition="all 0.3s"
      shadow={isOpen ? '0 10px 30px rgba(102, 126, 234, 0.15)' : '0 2px 8px rgba(0, 0, 0, 0.05)'}
    >
      <Button
        onClick={onClick}
        w="100%"
        p={6}
        bg="transparent"
        _hover={{ bg: 'gray.50' }}
        borderRadius="0"
        justifyContent="space-between"
        alignItems="center"
        h="auto"
        fontWeight="700"
        fontSize="lg"
        color="gray.900"
        textAlign="left"
      >
        <Text flex={1}>{faq.question}</Text>
        <Box
          transition="transform 0.3s"
          transform={isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
        >
          <ChevronRight size={24} color="#7c3aed" />
        </Box>
      </Button>
      
      <Box
        maxHeight={isOpen ? '500px' : '0'}
        overflow="hidden"
        transition="max-height 0.3s ease-in-out"
      >
        <Box p={6} pt={0}>
          <Text color="gray.600" fontSize="md" lineHeight="1.8" fontWeight="500">
            {faq.answer}
          </Text>
        </Box>
      </Box>
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
      <BenefitsSection />
      <PlansSection />
      <PopularDestinations />
      <FAQSection />
    </>
  );
};

// Main App Component
function App() {
  return (
    <Router>
      <Box fontFamily="'Inter Tight', sans-serif">
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700;800&display=swap');
          `}
        </style>
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/country/:countryCode" element={<CountryPage />} />
        </Routes>
        <Footer />
      </Box>
    </Router>
  );
}

export default App;