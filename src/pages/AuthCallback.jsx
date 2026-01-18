// src/pages/AuthCallback.jsx
// OAuth callback handler for Google Sign-In
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flex, Spinner, Text, VStack } from '@chakra-ui/react';
import { supabase } from '../lib/supabaseClient';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('[AuthCallback] Processing OAuth callback...');

        // Get the session from the URL hash (Supabase handles this automatically)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('[AuthCallback] Session error:', sessionError);
          throw sessionError;
        }

        if (session) {
          console.log('[AuthCallback] Session found, user:', session.user.email);
          // Redirect to home page after successful authentication
          navigate('/', { replace: true });
        } else {
          console.log('[AuthCallback] No session found, redirecting to login...');
          navigate('/login', { replace: true });
        }
      } catch (err) {
        console.error('[AuthCallback] Error processing callback:', err);
        setError(err.message || 'Authentication failed');
        // Redirect to login after showing error
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg="#F5F6F8">
        <VStack spacing={4}>
          <Text color="red.500" fontSize="lg" fontWeight="600">
            Ошибка авторизации
          </Text>
          <Text color="gray.600">{error}</Text>
          <Text color="gray.500" fontSize="sm">
            Перенаправление на страницу входа...
          </Text>
        </VStack>
      </Flex>
    );
  }

  return (
    <Flex minH="100vh" align="center" justify="center" bg="#F5F6F8">
      <VStack spacing={4}>
        <Spinner size="xl" color="#FE4F18" thickness="4px" />
        <Text color="gray.600" fontSize="lg" fontWeight="500">
          Авторизация...
        </Text>
      </VStack>
    </Flex>
  );
};

export default AuthCallback;
