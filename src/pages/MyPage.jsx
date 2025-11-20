// src/pages/MyPage.jsx
import React from 'react';
import { Box, Container, Heading, Text, VStack } from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { getTranslation, DEFAULT_LANGUAGE } from '../config/i18n';

const MyPage = () => {
  const lang = DEFAULT_LANGUAGE;
  const t = (key) => getTranslation(lang, key);
  const { profile } = useAuth();

  return (
    <Box minH="calc(100vh - 80px)" bg="gray.50" py={20}>
      <Container maxW="4xl">
        <VStack gap={6} align="flex-start">
          <Heading size="xl">{t('myPage.title')}</Heading>
          
          {profile && (
            <Box bg="white" p={6} borderRadius="xl" w="full" shadow="md">
              <VStack align="flex-start" gap={3}>
                <Text fontSize="lg">
                  <strong>{t('myPage.name')}:</strong> {profile.first_name} {profile.last_name}
                </Text>
                <Text fontSize="lg">
                  <strong>{t('myPage.phone')}:</strong> {profile.phone}
                </Text>
              </VStack>
            </Box>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default MyPage;