// src/components/PriceSyncDebug.jsx
import React, { useState, useEffect } from 'react';
import { Box, HStack, VStack, Text, IconButton, Collapse, Button, useToast } from '@chakra-ui/react';
import { ChevronUp, ChevronDown, RefreshCw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation, TRANSLATIONS } from '../config/i18n';
import { API_BASE } from '../config/api.js';

/**
 * PriceSyncDebug - Shows price sync status and last update info
 * Displays in bottom right corner on home page only
 */
const PriceSyncDebug = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [syncData, setSyncData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const { currentLanguage } = useLanguage();
  const t = (key) => getTranslation(currentLanguage, key);
  const toast = useToast();

  useEffect(() => {
    // Fetch sync status on mount
    fetchSyncStatus();
  }, []);

  const fetchSyncStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/sync-status`);
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
      case 'partial':
        return 'orange.500';
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
      case 'partial':
        return currentLanguage === 'uz' ? 'Qisman' : 'Частично';
      case 'running':
        return t('priceSync.statusRunning');
      case 'failed':
        return t('priceSync.statusFailed');
      default:
        return status;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return t('priceSync.noData');

    const date = new Date(dateString);
    const day = date.getDate();
    const monthNames = TRANSLATIONS[currentLanguage]?.priceSync?.months || TRANSLATIONS['ru'].priceSync.months;
    const month = monthNames[date.getMonth()];
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day} ${month}, ${hours}:${minutes}`;
  };

  const getNextScheduledSync = () => {
    const now = new Date();
    const nextSync = new Date();

    // Next sync is at 02:00 UTC daily
    nextSync.setUTCHours(2, 0, 0, 0);

    // If we've already passed 02:00 UTC today, schedule for tomorrow
    if (now.getUTCHours() >= 2) {
      nextSync.setUTCDate(nextSync.getUTCDate() + 1);
    }

    return formatDateTime(nextSync.toISOString());
  };

  const handleManualSync = async () => {
    try {
      setSyncing(true);

      const response = await fetch(`${API_BASE}/price-sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-vercel-cron': '1', // Simulate cron request
        },
        body: JSON.stringify({ days: 7 }),
      });

      // Try to parse JSON, but handle non-JSON responses
      let result;
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        // Got HTML error page instead of JSON
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned HTML error page (check Vercel logs)');
      }

      if (response.ok && result.success) {
        const updatedCount = result.stats?.updated || 0;
        const importedCount = result.stats?.autoImported || 0;

        let description = `${t('priceSync.packagesUpdated')} ${updatedCount}`;
        if (importedCount > 0) {
          description += `\n${t('priceSync.autoImported')} ${importedCount}`;
        }

        toast({
          title: t('priceSync.syncSuccess'),
          description,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        // Refresh sync data
        await fetchSyncStatus();
      } else {
        throw new Error(result.message || result.error || 'Sync failed');
      }
    } catch (error) {
      console.error('Manual sync failed:', error);
      toast({
        title: t('priceSync.syncError'),
        description: error.message,
        status: 'error',
        duration: 8000,
        isClosable: true,
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Box
      position="fixed"
      bottom="0"
      right="320px"
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
                  {formatDateTime(syncData.lastSyncAt)}
                </Text>
                {/* Warning if last sync is more than 30 hours old */}
                {syncData.hoursAgo > 30 && (
                  <Text fontSize="xs" color="orange.600" mt={1}>
                    ⚠️ {currentLanguage === 'uz' ? 'Yangilanish kechikmoqda' : 'Обновление задерживается'}
                  </Text>
                )}
              </Box>

              {/* Next Scheduled Update */}
              <Box>
                <Text fontSize="xs" color="gray.600" mb={1}>
                  {t('priceSync.nextUpdate')}
                </Text>
                <Text fontSize="sm" fontWeight="bold" color="#FE4F18">
                  {getNextScheduledSync()}
                </Text>
                <Text fontSize="xs" color="gray.500" mt={0.5}>
                  {t('priceSync.daily')}
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

              {/* Auto Imported - Success */}
              {syncData.autoImported > 0 && (
                <>
                  <HStack spacing={2} justify="space-between">
                    <Text fontSize="xs" color="gray.600">
                      {t('priceSync.autoImported')}
                    </Text>
                    <Text fontSize="sm" fontWeight="600" color="green.600">
                      {syncData.autoImported}
                    </Text>
                  </HStack>
                  <Box bg="green.50" p={2} borderRadius="md" border="1px solid" borderColor="green.200">
                    <Text fontSize="xs" color="green.700" fontWeight="600">
                      ✅ {t('priceSync.successImport')}
                    </Text>
                    {syncData.importedPackages && syncData.importedPackages.length > 0 && (
                      <VStack align="stretch" mt={2} spacing={1}>
                        {syncData.importedPackages.slice(0, 3).map((pkg, idx) => (
                          <Text key={idx} fontSize="xs" color="green.600">
                            • {pkg.package_code} - {pkg.product_name}
                          </Text>
                        ))}
                        {syncData.importedPackages.length > 3 && (
                          <Text fontSize="xs" color="green.600" fontStyle="italic">
                            ...{currentLanguage === 'uz' ? 'va yana' : 'и ещё'} {syncData.importedPackages.length - 3}
                          </Text>
                        )}
                      </VStack>
                    )}
                  </Box>
                </>
              )}

              {/* Packages Not Found - Warning */}
              {syncData.packagesNotFound > 0 && (
                <>
                  <HStack spacing={2} justify="space-between">
                    <Text fontSize="xs" color="gray.600">
                      {t('priceSync.packagesNotFound')}
                    </Text>
                    <Text fontSize="sm" fontWeight="600" color="orange.600">
                      {syncData.packagesNotFound}
                    </Text>
                  </HStack>
                  <Box bg="orange.50" p={2} borderRadius="md" border="1px solid" borderColor="orange.200">
                    <Text fontSize="xs" color="orange.700" fontWeight="600">
                      ⚠️ {t('priceSync.warning')}
                    </Text>
                    {syncData.missingPackages && syncData.missingPackages.length > 0 && (
                      <VStack align="stretch" mt={2} spacing={1}>
                        {syncData.missingPackages.slice(0, 3).map((pkg, idx) => (
                          <Text key={idx} fontSize="xs" color="orange.600">
                            • {pkg.package_code} - {pkg.product_name}
                          </Text>
                        ))}
                        {syncData.missingPackages.length > 3 && (
                          <Text fontSize="xs" color="orange.600" fontStyle="italic">
                            ...{currentLanguage === 'uz' ? 'va yana' : 'и ещё'} {syncData.missingPackages.length - 3}
                          </Text>
                        )}
                      </VStack>
                    )}
                  </Box>
                </>
              )}

              {/* Error message if failed */}
              {syncData.status === 'failed' && syncData.errorMessage && (
                <Text fontSize="xs" color="red.600" mt={2}>
                  {syncData.errorMessage}
                </Text>
              )}

              {/* Manual Sync Button */}
              <Button
                size="sm"
                colorScheme="orange"
                leftIcon={<RefreshCw size={14} />}
                onClick={handleManualSync}
                isLoading={syncing}
                loadingText={t('priceSync.syncing')}
                width="full"
                mt={2}
                fontWeight="600"
              >
                {t('priceSync.manualSync')}
              </Button>
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
