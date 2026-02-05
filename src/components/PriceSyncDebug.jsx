// src/components/PriceSyncDebug.jsx
import React, { useState, useEffect } from 'react';
import { Box, HStack, VStack, Text, IconButton, Collapse } from '@chakra-ui/react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../config/i18n';

/**
 * PriceSyncDebug - Shows price sync status and last update info
 * Displays in bottom right corner on home page only
 */
const PriceSyncDebug = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [syncData, setSyncData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currentLanguage } = useLanguage();
  const t = (key) => getTranslation(currentLanguage, key);

  useEffect(() => {
    // Fetch sync status on mount
    fetchSyncStatus();
  }, []);

  const fetchSyncStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/sync-status');
      const result = await response.json();

      if (result.success && result.data) {
        setSyncData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch sync status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'green.500';
      case 'running':
        return 'blue.500';
      case 'failed':
        return 'red.500';
      default:
        return 'gray.500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'success':
        return t('priceSync.statusSuccess');
      case 'running':
        return t('priceSync.statusRunning');
      case 'failed':
        return t('priceSync.statusFailed');
      default:
        return status;
    }
  };

  const formatTimeAgo = () => {
    if (!syncData) return t('priceSync.noData');

    const { hoursAgo, minutesAgo } = syncData;

    if (hoursAgo >= 24) {
      const daysAgo = Math.floor(hoursAgo / 24);
      return `${daysAgo} ${currentLanguage === 'uz' ? 'kun' : 'дн.'} ${t('priceSync.hoursAgo')}`;
    } else if (hoursAgo > 0) {
      return `${hoursAgo} ${t('priceSync.hoursAgo')}`;
    } else if (minutesAgo > 0) {
      return `${minutesAgo} ${t('priceSync.minutesAgo')}`;
    } else {
      return t('priceSync.minutesAgo').replace(/\d+\s*/, '< 1 ');
    }
  };

  return (
    <Box
      position="fixed"
      bottom="0"
      right="20px"
      bg="white"
      borderRadius="xl xl 0 0"
      shadow="lg"
      border="1px solid"
      borderColor="gray.200"
      zIndex={9998}
      minW="280px"
      fontFamily="'Manrope', sans-serif"
    >
      {/* Toggle Button */}
      <HStack
        px={4}
        py={2}
        cursor="pointer"
        onClick={() => setIsOpen(!isOpen)}
        _hover={{ bg: 'gray.50' }}
        borderRadius="xl xl 0 0"
        spacing={2}
      >
        <Box
          w="8px"
          h="8px"
          borderRadius="full"
          bg={syncData ? getStatusColor(syncData.status) : 'gray.400'}
        />
        <Text fontSize="xs" fontWeight="600" color="gray.700" flex={1}>
          {t('priceSync.title')}
        </Text>
        <IconButton
          size="xs"
          variant="ghost"
          aria-label="Toggle price sync info"
          icon={isOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        />
      </HStack>

      {/* Collapsible Content */}
      <Collapse in={isOpen} animateOpacity>
        <VStack align="stretch" spacing={3} px={4} pb={4} pt={2} borderTop="1px solid" borderColor="gray.100">
          {loading ? (
            <Text fontSize="xs" color="gray.600">
              {t('priceSync.loading')}
            </Text>
          ) : syncData ? (
            <>
              {/* Status */}
              <HStack spacing={2}>
                <Text fontSize="xs" color="gray.600">
                  {t('priceSync.status')}
                </Text>
                <Text fontSize="xs" fontWeight="600" color={getStatusColor(syncData.status)}>
                  {getStatusText(syncData.status)}
                </Text>
              </HStack>

              {/* Last Update */}
              <Box>
                <Text fontSize="xs" color="gray.600" mb={1}>
                  {t('priceSync.lastUpdate')}
                </Text>
                <Text fontSize="sm" fontWeight="bold" color="gray.900">
                  {formatTimeAgo()}
                </Text>
              </Box>

              {/* Packages Checked */}
              <HStack spacing={2} justify="space-between">
                <Text fontSize="xs" color="gray.600">
                  {t('priceSync.packagesChecked')}
                </Text>
                <Text fontSize="sm" fontWeight="600" color="gray.900">
                  {syncData.totalChangesDetected || 0}
                </Text>
              </HStack>

              {/* Packages Updated */}
              <HStack spacing={2} justify="space-between">
                <Text fontSize="xs" color="gray.600">
                  {t('priceSync.packagesUpdated')}
                </Text>
                <Text fontSize="sm" fontWeight="600" color="#FE4F18">
                  {syncData.packagesUpdated || 0}
                </Text>
              </HStack>

              {/* Error message if failed */}
              {syncData.status === 'failed' && syncData.errorMessage && (
                <Text fontSize="xs" color="red.600" mt={2}>
                  {syncData.errorMessage}
                </Text>
              )}
            </>
          ) : (
            <Text fontSize="xs" color="gray.600">
              {t('priceSync.noData')}
            </Text>
          )}
        </VStack>
      </Collapse>
    </Box>
  );
};

export default PriceSyncDebug;
