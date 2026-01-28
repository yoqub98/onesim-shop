/**
 * Cache Management Component
 * Admin utility for managing package cache
 *
 * Usage:
 * - Import and add to admin page or debug panel
 * - Provides cache statistics and manual refresh controls
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Heading,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  useToast,
  Badge,
  Card,
  CardHeader,
  CardBody,
  SimpleGrid,
  Spinner,
} from '@chakra-ui/react';
import {
  getCacheStats,
  invalidateCache,
} from '../services/packageCacheService.js';
import { fetchRegionalPackages, fetchGlobalPackages } from '../services/esimAccessApi.js';

const CacheManagement = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState({ regional: false, global: false });
  const toast = useToast();

  const loadStats = async () => {
    setLoading(true);
    try {
      const cacheStats = await getCacheStats();
      setStats(cacheStats);
    } catch (error) {
      console.error('Error loading cache stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load cache statistics',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleInvalidate = async (cacheType) => {
    try {
      await invalidateCache(cacheType);
      toast({
        title: 'Success',
        description: `${cacheType} cache invalidated`,
        status: 'success',
        duration: 2000,
      });
      await loadStats();
    } catch (error) {
      console.error('Error invalidating cache:', error);
      toast({
        title: 'Error',
        description: 'Failed to invalidate cache',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleRefresh = async (cacheType) => {
    setRefreshing({ ...refreshing, [cacheType]: true });

    try {
      // Invalidate first
      await invalidateCache(cacheType);

      // Fetch fresh data to populate cache
      if (cacheType === 'regional') {
        await fetchRegionalPackages();
      } else if (cacheType === 'global') {
        await fetchGlobalPackages();
      }

      toast({
        title: 'Success',
        description: `${cacheType} cache refreshed successfully`,
        status: 'success',
        duration: 3000,
      });

      await loadStats();
    } catch (error) {
      console.error('Error refreshing cache:', error);
      toast({
        title: 'Error',
        description: `Failed to refresh ${cacheType} cache`,
        status: 'error',
        duration: 3000,
      });
    } finally {
      setRefreshing({ ...refreshing, [cacheType]: false });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (metadata) => {
    if (!metadata) return <Badge colorScheme="gray">Unknown</Badge>;

    const isExpired = new Date(metadata.expires_at) < new Date();
    const isValid = metadata.is_valid && !isExpired;

    if (isValid) {
      return <Badge colorScheme="green">Valid</Badge>;
    } else if (isExpired) {
      return <Badge colorScheme="red">Expired</Badge>;
    } else {
      return <Badge colorScheme="orange">Invalid</Badge>;
    }
  };

  const getTimeRemaining = (expiresAt) => {
    if (!expiresAt) return 'N/A';

    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires - now;

    if (diff < 0) return 'Expired';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    return `${days}d ${hours}h`;
  };

  if (loading) {
    return (
      <Box p={8} textAlign="center">
        <Spinner size="xl" color="orange.500" />
        <Text mt={4}>Loading cache statistics...</Text>
      </Box>
    );
  }

  const regionalMetadata = stats?.metadata?.find(m => m.cache_type === 'regional');
  const globalMetadata = stats?.metadata?.find(m => m.cache_type === 'global');

  return (
    <Box p={8}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>Package Cache Management</Heading>
          <Text color="gray.600">
            Monitor and manage package cache for regional and global packages
          </Text>
        </Box>

        <Divider />

        {/* Regional Cache Card */}
        <Card>
          <CardHeader>
            <HStack justify="space-between">
              <HStack>
                <Heading size="md">Regional Packages Cache</Heading>
                {getStatusBadge(regionalMetadata)}
              </HStack>
            </HStack>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mb={4}>
              <Stat>
                <StatLabel>Total Records</StatLabel>
                <StatNumber>{stats?.regionalCount || 0}</StatNumber>
                <StatHelpText>Region groups</StatHelpText>
              </Stat>
              <Stat>
                <StatLabel>Last Updated</StatLabel>
                <StatNumber fontSize="sm">
                  {formatDate(regionalMetadata?.last_updated)}
                </StatNumber>
              </Stat>
              <Stat>
                <StatLabel>Expires At</StatLabel>
                <StatNumber fontSize="sm">
                  {formatDate(regionalMetadata?.expires_at)}
                </StatNumber>
              </Stat>
              <Stat>
                <StatLabel>Time Remaining</StatLabel>
                <StatNumber fontSize="lg">
                  {getTimeRemaining(regionalMetadata?.expires_at)}
                </StatNumber>
              </Stat>
            </SimpleGrid>

            <HStack spacing={3}>
              <Button
                colorScheme="orange"
                onClick={() => handleRefresh('regional')}
                isLoading={refreshing.regional}
                loadingText="Refreshing..."
              >
                Refresh Cache
              </Button>
              <Button
                variant="outline"
                colorScheme="red"
                onClick={() => handleInvalidate('regional')}
              >
                Invalidate
              </Button>
            </HStack>
          </CardBody>
        </Card>

        {/* Global Cache Card */}
        <Card>
          <CardHeader>
            <HStack justify="space-between">
              <HStack>
                <Heading size="md">Global Packages Cache</Heading>
                {getStatusBadge(globalMetadata)}
              </HStack>
            </HStack>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mb={4}>
              <Stat>
                <StatLabel>Total Records</StatLabel>
                <StatNumber>{stats?.globalCount || 0}</StatNumber>
                <StatHelpText>Global packages</StatHelpText>
              </Stat>
              <Stat>
                <StatLabel>Last Updated</StatLabel>
                <StatNumber fontSize="sm">
                  {formatDate(globalMetadata?.last_updated)}
                </StatNumber>
              </Stat>
              <Stat>
                <StatLabel>Expires At</StatLabel>
                <StatNumber fontSize="sm">
                  {formatDate(globalMetadata?.expires_at)}
                </StatNumber>
              </Stat>
              <Stat>
                <StatLabel>Time Remaining</StatLabel>
                <StatNumber fontSize="lg">
                  {getTimeRemaining(globalMetadata?.expires_at)}
                </StatNumber>
              </Stat>
            </SimpleGrid>

            <HStack spacing={3}>
              <Button
                colorScheme="orange"
                onClick={() => handleRefresh('global')}
                isLoading={refreshing.global}
                loadingText="Refreshing..."
              >
                Refresh Cache
              </Button>
              <Button
                variant="outline"
                colorScheme="red"
                onClick={() => handleInvalidate('global')}
              >
                Invalidate
              </Button>
            </HStack>
          </CardBody>
        </Card>

        {/* Bulk Actions */}
        <Card>
          <CardHeader>
            <Heading size="md">Bulk Actions</Heading>
          </CardHeader>
          <CardBody>
            <HStack spacing={3}>
              <Button
                colorScheme="orange"
                onClick={async () => {
                  await handleRefresh('regional');
                  await handleRefresh('global');
                }}
                isLoading={refreshing.regional || refreshing.global}
              >
                Refresh All Caches
              </Button>
              <Button
                variant="outline"
                colorScheme="red"
                onClick={() => handleInvalidate('all')}
              >
                Invalidate All
              </Button>
              <Button variant="outline" onClick={loadStats}>
                Reload Stats
              </Button>
            </HStack>
          </CardBody>
        </Card>

        {/* Info Box */}
        <Box p={4} bg="blue.50" borderRadius="md" borderLeft="4px solid" borderColor="blue.500">
          <Heading size="sm" mb={2}>Cache Information</Heading>
          <VStack align="start" spacing={1} fontSize="sm" color="gray.700">
            <Text>• Cache duration: 7 days</Text>
            <Text>• Auto-refresh on expiration</Text>
            <Text>• Invalidate to force immediate refresh</Text>
            <Text>• Refresh populates cache with fresh data from API</Text>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default CacheManagement;
