// src/components/legal/LegalLayout.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Link,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from '@chakra-ui/react';
import { ChevronRight } from 'lucide-react';

/**
 * LegalLayout - Shared layout for all legal document pages
 * @param {string} title - Page title
 * @param {string} lastUpdated - Last update date
 * @param {array} tableOfContents - Array of section objects {id, title}
 * @param {ReactNode} children - Document content
 */
const LegalLayout = ({ title, lastUpdated, tableOfContents = [], children }) => {
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      const sections = tableOfContents.map(item => document.getElementById(item.id));
      const scrollPosition = window.scrollY + 100;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(tableOfContents[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [tableOfContents]);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 100;
      const elementPosition = element.offsetTop - offset;
      window.scrollTo({ top: elementPosition, behavior: 'smooth' });
    }
  };

  return (
    <Box minH="100vh" bg="gray.50" py={10}>
      <Container maxW="7xl">
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          spacing={2}
          separator={<ChevronRight size={16} color="#718096" />}
          mb={6}
          fontSize="sm"
        >
          <BreadcrumbItem>
            <BreadcrumbLink href="/" color="gray.600" _hover={{ color: 'purple.600' }}>
              Главная
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink href="/legal/offer" color="gray.600" _hover={{ color: 'purple.600' }}>
              Юридические документы
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink color="purple.600" fontWeight="600">
              {title}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <HStack align="flex-start" spacing={8}>
          {/* Table of Contents - Sticky Sidebar */}
          {tableOfContents.length > 0 && (
            <Box
              display={{ base: 'none', lg: 'block' }}
              w="250px"
              position="sticky"
              top="100px"
              flexShrink={0}
            >
              <VStack
                align="stretch"
                spacing={2}
                bg="white"
                p={6}
                borderRadius="xl"
                shadow="sm"
              >
                <Text fontSize="sm" fontWeight="700" color="gray.700" mb={2}>
                  Содержание
                </Text>
                {tableOfContents.map((item) => (
                  <Link
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    fontSize="sm"
                    color={activeSection === item.id ? 'purple.600' : 'gray.600'}
                    fontWeight={activeSection === item.id ? '600' : '500'}
                    py={2}
                    px={3}
                    borderRadius="md"
                    bg={activeSection === item.id ? 'purple.50' : 'transparent'}
                    _hover={{
                      color: 'purple.600',
                      bg: 'purple.50',
                      textDecoration: 'none',
                    }}
                    transition="all 0.2s"
                    cursor="pointer"
                  >
                    {item.title}
                  </Link>
                ))}
              </VStack>
            </Box>
          )}

          {/* Main Content */}
          <Box flex={1} bg="white" p={{ base: 6, md: 10 }} borderRadius="xl" shadow="sm">
            <VStack align="stretch" spacing={6}>
              {/* Header */}
              <Box>
                <Heading
                  as="h1"
                  fontSize={{ base: '2xl', md: '3xl', lg: '4xl' }}
                  fontWeight="800"
                  color="gray.900"
                  mb={2}
                >
                  {title}
                </Heading>
                {lastUpdated && (
                  <Text fontSize="sm" color="gray.500">
                    Последнее обновление: {lastUpdated}
                  </Text>
                )}
              </Box>

              {/* Document Content */}
              <Box
                sx={{
                  // Main section headings (h2)
                  'h2': {
                    fontSize: { base: 'xl', md: '2xl', lg: '3xl' },
                    fontWeight: '800',
                    color: 'gray.900',
                    mt: 10,
                    mb: 5,
                    pb: 3,
                    borderBottom: '2px solid',
                    borderColor: 'purple.100',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                  },
                  // Sub-section headings (h3)
                  'h3': {
                    fontSize: { base: 'lg', md: 'xl' },
                    fontWeight: '700',
                    color: 'purple.700',
                    mt: 6,
                    mb: 3,
                    letterSpacing: '0.3px',
                  },
                  // Paragraph text
                  'p': {
                    fontSize: { base: 'sm', md: 'md' },
                    color: 'gray.700',
                    lineHeight: '1.9',
                    mb: 4,
                    textAlign: 'justify',
                  },
                  // Lists
                  'ul, ol': {
                    pl: 6,
                    mb: 4,
                    mt: 2,
                  },
                  'li': {
                    fontSize: { base: 'sm', md: 'md' },
                    color: 'gray.700',
                    lineHeight: '1.9',
                    mb: 2,
                    '&::marker': {
                      color: 'purple.500',
                    },
                  },
                  // Bold text
                  'strong': {
                    fontWeight: '700',
                    color: 'gray.900',
                  },
                  // Warning boxes
                  '.warning': {
                    bg: 'orange.50',
                    border: '2px solid',
                    borderColor: 'orange.300',
                    borderRadius: 'lg',
                    p: 5,
                    my: 6,
                    shadow: 'sm',
                  },
                  // Important/critical boxes
                  '.important': {
                    bg: 'red.50',
                    border: '2px solid',
                    borderColor: 'red.300',
                    borderRadius: 'lg',
                    p: 5,
                    my: 6,
                    shadow: 'sm',
                  },
                  // Print styles
                  '@media print': {
                    'nav, aside': {
                      display: 'none',
                    },
                  },
                }}
              >
                {children}
              </Box>
            </VStack>
          </Box>
        </HStack>
      </Container>
    </Box>
  );
};

export default LegalLayout;
