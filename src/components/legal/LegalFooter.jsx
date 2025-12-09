// src/components/legal/LegalFooter.jsx
import React from 'react';
import { Box, Container, Grid, GridItem, VStack, Heading, Link, Text } from '@chakra-ui/react';

/**
 * LegalFooter - Footer component with legal links
 * This component should be integrated into the main App footer
 */
const LegalFooter = () => {
  return (
    <GridItem>
      <VStack align="flex-start" spacing={3}>
        <Heading size="md" fontWeight="700" mb={2}>
          Юридическая информация
        </Heading>
        <Link
          href="/legal/offer"
          color="gray.400"
          _hover={{ color: 'white' }}
          fontWeight="500"
        >
          Публичная оферта
        </Link>
        <Link
          href="/legal/privacy"
          color="gray.400"
          _hover={{ color: 'white' }}
          fontWeight="500"
        >
          Политика конфиденциальности
        </Link>
        <Link
          href="/legal/terms"
          color="gray.400"
          _hover={{ color: 'white' }}
          fontWeight="500"
        >
          Пользовательское соглашение
        </Link>
        <Link
          href="/legal/refund"
          color="gray.400"
          _hover={{ color: 'white' }}
          fontWeight="500"
        >
          Политика возврата
        </Link>
      </VStack>
    </GridItem>
  );
};

export default LegalFooter;
