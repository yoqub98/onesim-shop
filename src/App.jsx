// src/App.jsx
import React, { useState } from 'react';
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
import { ChevronRight, Menu, X } from 'lucide-react';
import 'animate.css';
import PlansSection from './components/PlansSection';

// Navigation Component
const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <Box
      as="nav"
      position="sticky"
      top="0"
      bg="white"
      borderBottom="1px solid"
      borderColor="gray.200"
      zIndex="1000"
      shadow="sm"
      className="animate__animated animate__fadeInDown"
    >
      <Container maxW="8xl">
        <Flex h="70px" alignItems="center" justifyContent="space-between">
          {/* Logo */}
          <Heading
            size="2xl"
            background="linear-gradient(to right, #6366f1, #8b5cf6)"
            backgroundClip="text"
            fontWeight="extrabold"
            letterSpacing="tight"
          >
            OneSIM
          </Heading>

          {/* Desktop Navigation */}
          <HStack gap={8} hideBelow="md">
            <Link href="#home" fontWeight="medium" color="gray.600" _hover={{ color: 'purple.600' }}>
              Главная
            </Link>
            <Link href="#plans" fontWeight="medium" color="gray.600" _hover={{ color: 'purple.600' }}>
              Планы
            </Link>
            <Link href="#contacts" fontWeight="medium" color="gray.600" _hover={{ color: 'purple.600' }}>
              Контакты
            </Link>
          </HStack>

          {/* Mobile Menu Button */}
          <IconButton
            hideFrom="md"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            variant="ghost"
            aria-label="Toggle menu"
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
            <VStack gap={3} align="stretch">
              <Link
                href="#home"
                fontWeight="medium"
                py={2}
                onClick={() => setMobileMenuOpen(false)}
              >
                Главная
              </Link>
              <Link
                href="#plans"
                fontWeight="medium"
                py={2}
                onClick={() => setMobileMenuOpen(false)}
              >
                Планы
              </Link>
              <Link
                href="#contacts"
                fontWeight="medium"
                py={2}
                onClick={() => setMobileMenuOpen(false)}
              >
                Контакты
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
  return (
    <Box
      as="section"
      background="linear-gradient(to bottom, #f9fafb, white)"
      py={{ base: 16, md: 24 }}
      minH="calc(100vh - 70px)"
      display="flex"
      alignItems="center"
    >
      <Container maxW="8xl">
        <Grid
          templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
          gap={12}
          alignItems="center"
        >
          {/* Left Content */}
          <GridItem className="animate__animated animate__fadeInLeft">
            <VStack align="flex-start" gap={6}>
              <Heading
                as="h1"
                fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}
                fontWeight="extrabold"
                lineHeight="1.1"
                background="linear-gradient(to right, #1f2937, #4b5563)"
                backgroundClip="text"
              >
                Путешествуйте без границ с OneSIM
              </Heading>
              <Text fontSize={{ base: 'lg', md: 'xl' }} color="gray.600" lineHeight="1.75">
                Глобальное покрытие мобильной связи в более чем 190 странах мира.
                Оставайтесь на связи везде и всегда с нашими выгодными тарифами.
              </Text>
              <Button
                size="lg"
                bg="purple.600"
                color="white"
                _hover={{
                  bg: 'purple.700',
                  transform: 'translateY(-2px)',
                  shadow: 'xl',
                }}
                _active={{
                  transform: 'translateY(0)',
                }}
                transition="all 0.3s"
                shadow="lg"
              >
                Узнать больше
                <ChevronRight size={20} style={{ marginLeft: '8px' }} />
              </Button>
            </VStack>
          </GridItem>

          {/* Right Image */}
          <GridItem className="animate__animated animate__fadeInRight">
            <Image
              src="https://ik.imagekit.io/php1jcf0t/OneSim/Gemini_Generated_Image_lvrtw5lvrtw5lvrt%20(1).png?updatedAt=1762971827953"
              alt="OneSIM Global Coverage"
              borderRadius="2xl"
              shadow="2xl"
              w="full"
            />
          </GridItem>
        </Grid>
      </Container>
    </Box>
  );
};

// Footer Component
const Footer = () => {
  return (
    <Box as="footer" background="linear-gradient(to right, #1f2937, #374151)" color="white" py={12}>
      <Container maxW="8xl">
        <Flex
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align="center"
          gap={6}
        >
          <Text color="gray.300">© 2025 OneSIM. Все права защищены.</Text>
          <HStack gap={8}>
            <Link href="#privacy" color="gray.300" _hover={{ color: 'white' }}>
              Конфиденциальность
            </Link>
            <Link href="#terms" color="gray.300" _hover={{ color: 'white' }}>
              Условия использования
            </Link>
            <Link href="#contact" color="gray.300" _hover={{ color: 'white' }}>
              Контакты
            </Link>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
};

// Main App Component
function App() {
  return (
    <Box>
      <Navigation />
      <HeroSection />
      <PlansSection />
      <Footer />
    </Box>
  );
}

export default App;