/**
 * Cache Management Component (DEPRECATED)
 *
 * This component is no longer needed as package caching has been removed.
 * All packages now come directly from Supabase database via packageService.js
 *
 * Migration: Cache system replaced with database-first architecture
 */

import React from 'react';
import {
  Box,
  Text,
  Heading,
  VStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';

const CacheManagement = () => {
  return (
    <Box p={8}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>Cache Management (Deprecated)</Heading>
        </Box>

        <Alert
          status="info"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          minHeight="200px"
          borderRadius="md"
        >
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            Cache System Removed
          </AlertTitle>
          <AlertDescription maxWidth="sm">
            Package caching is no longer used. All packages now come directly from the Supabase database.
            The new architecture provides faster performance without the need for manual cache management.
          </AlertDescription>
          <Text mt={4} fontSize="sm" color="gray.600">
            Database is synced daily via automated price sync at 2 AM UTC.
          </Text>
        </Alert>
      </VStack>
    </Box>
  );
};

export default CacheManagement;
