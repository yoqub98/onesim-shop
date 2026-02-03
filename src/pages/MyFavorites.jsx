// src/pages/MyFavorites.jsx
import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Text,
  VStack,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useFavorites } from '../contexts/FavoritesContext.jsx';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { fetchPackageById } from '../services/esimAccessApi.js';
import { calculateFinalPriceUSD, formatPrice } from '../config/pricing.js';
import DataPlanRow from '../components/DataPlanRow.jsx';

const MyFavorites = () => {
  const { user } = useAuth();
  const { favoriteIds, loading: favoritesLoading } = useFavorites();
  const { currentLanguage } = useLanguage();
  const navigate = useNavigate();

  const [favoritePlans, setFavoritePlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadFavoritePlans = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      if (favoriteIds.length === 0) {
        setFavoritePlans([]);
        setLoading(false);
        return;
      }

      // Fetch details for each favorite package
      const planPromises = favoriteIds.map(async (packageId) => {
        try {
          const pkg = await fetchPackageById(packageId, currentLanguage);
          return {
            ...pkg,
            priceUSD: calculateFinalPriceUSD(pkg.priceUSD),
            price: formatPrice(calculateFinalPriceUSD(pkg.priceUSD)),
          };
        } catch (err) {
          console.error('[MyFavorites] Error fetching package:', packageId, err);
          return null;
        }
      });

      const plans = await Promise.all(planPromises);
      // Filter out null values (failed fetches)
      const validPlans = plans.filter(plan => plan !== null);
      setFavoritePlans(validPlans);
    } catch (err) {
      console.error('[MyFavorites] Error loading favorite plans:', err);
      setError('Не удалось загрузить избранные eSIM');
    } finally {
      setLoading(false);
    }
  }, [user?.id, favoriteIds, currentLanguage]);

  useEffect(() => {
    loadFavoritePlans();
  }, [loadFavoritePlans]);

  const handlePlanClick = (plan) => {
    // Extract country code from plan
    const countryCode = plan.countryCode || plan.country;
    navigate(`/package/${plan.id}`, {
      state: { plan, countryCode },
    });
  };

  if (favoritesLoading || loading) {
    return (
      <Center py={12}>
        <VStack spacing={4}>
          <Spinner size="xl" color="#FE4F18" thickness="4px" />
          <Text color="gray.600" fontFamily="'Manrope', sans-serif">
            Загрузка избранных...
          </Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Box p={6} bg="red.50" borderRadius="lg" border="1px solid" borderColor="red.200">
        <Text color="red.600" fontWeight="600" fontFamily="'Manrope', sans-serif">
          {error}
        </Text>
      </Box>
    );
  }

  if (favoritePlans.length === 0) {
    return (
      <Center py={12}>
        <VStack spacing={4}>
          <Box
            p={6}
            borderRadius="full"
            bg="gray.100"
          >
            <Heart size={48} color="#9CA3AF" />
          </Box>
          <Text
            fontSize="xl"
            fontWeight="600"
            color="gray.700"
            fontFamily="'Manrope', sans-serif"
          >
            У вас пока нет избранных eSIM
          </Text>
          <Text
            fontSize="md"
            color="gray.500"
            textAlign="center"
            maxW="400px"
            fontFamily="'Manrope', sans-serif"
          >
            Добавляйте понравившиеся eSIM в избранное, нажимая на иконку сердечка
          </Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Container maxW="8xl" py={0}>
      <VStack align="stretch" spacing="34px">
        {favoritePlans.map((plan) => (
          <DataPlanRow
            key={plan.id}
            plan={plan}
            lang={currentLanguage}
            onClick={() => handlePlanClick(plan)}
          />
        ))}
      </VStack>
    </Container>
  );
};

export default MyFavorites;
