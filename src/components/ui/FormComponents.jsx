// src/components/ui/FormComponents.jsx
// Reusable form components with consistent styling across the app

import React, { useState } from 'react';
import {
  Input as ChakraInput,
  Button as ChakraButton,
  Box,
  InputGroup,
  InputLeftElement,
  InputRightElement,
} from '@chakra-ui/react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * Styled Input with iOS-like rounded corners
 *
 * Usage:
 * <StyledInput
 *   type="email"
 *   placeholder="Email"
 *   leftIcon={<Mail size={18} />}
 *   value={email}
 *   onChange={(e) => setEmail(e.target.value)}
 * />
 */
export const StyledInput = ({
  leftIcon,
  rightIcon,
  type = 'text',
  isPassword = false,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <InputGroup>
      {leftIcon && (
        <InputLeftElement
          pointerEvents="none"
          h="full"
          pl={4}
          color="gray.400"
        >
          {leftIcon}
        </InputLeftElement>
      )}
      <ChakraInput
        type={inputType}
        h="48px"
        pl={leftIcon ? 12 : 5}
        pr={isPassword ? 12 : rightIcon ? 12 : 5}
        borderRadius="36px"
        border="1.2px solid"
        borderColor="#DFE1EB"
        bg="white"
        fontSize="md"
        fontWeight="500"
        color="gray.800"
        _placeholder={{
          color: 'gray.400',
          fontWeight: '400',
        }}
        _hover={{
          borderColor: '#C5C8D4',
        }}
        _focus={{
          borderColor: '#FE4F18',
          boxShadow: '0 0 0 1px #FE4F18',
        }}
        _invalid={{
          borderColor: 'red.400',
          boxShadow: '0 0 0 1px red.400',
        }}
        sx={{
          // iOS-like smooth corners
          WebkitAppearance: 'none',
        }}
        {...props}
      />
      {isPassword && (
        <InputRightElement
          h="full"
          pr={4}
          cursor="pointer"
          onClick={() => setShowPassword(!showPassword)}
        >
          <Box color="gray.400" _hover={{ color: 'gray.600' }}>
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </Box>
        </InputRightElement>
      )}
      {!isPassword && rightIcon && (
        <InputRightElement
          pointerEvents="none"
          h="full"
          pr={4}
          color="gray.400"
        >
          {rightIcon}
        </InputRightElement>
      )}
    </InputGroup>
  );
};

/**
 * Primary Styled Button (Orange)
 *
 * Usage:
 * <StyledButton onClick={handleClick} isLoading={loading}>
 *   Войти
 * </StyledButton>
 */
export const StyledButton = ({
  children,
  variant = 'primary',
  isLoading = false,
  leftIcon,
  ...props
}) => {
  const variants = {
    primary: {
      bg: '#FE4F18',
      color: 'white',
      _hover: {
        bg: '#E5450F',
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 25px rgba(254, 79, 24, 0.35)',
      },
      _active: {
        bg: '#D13D0A',
        transform: 'translateY(0)',
      },
    },
    outline: {
      bg: 'white',
      color: 'gray.700',
      border: '1.2px solid',
      borderColor: '#DFE1EB',
      _hover: {
        bg: 'gray.50',
        borderColor: '#C5C8D4',
      },
      _active: {
        bg: 'gray.100',
      },
    },
    ghost: {
      bg: 'transparent',
      color: 'gray.700',
      _hover: {
        bg: 'gray.50',
      },
    },
  };

  return (
    <ChakraButton
      h="48px"
      borderRadius="36px"
      fontSize="md"
      fontWeight="700"
      px={8}
      transition="all 0.2s ease"
      isLoading={isLoading}
      {...variants[variant]}
      {...props}
    >
      {leftIcon && <Box mr={2}>{leftIcon}</Box>}
      {children}
    </ChakraButton>
  );
};

/**
 * Card Container with shadow
 *
 * Usage:
 * <StyledCard>
 *   <form>...</form>
 * </StyledCard>
 */
export const StyledCard = ({ children, ...props }) => {
  return (
    <Box
      bg="white"
      borderRadius="20px"
      boxShadow="0 4px 157px 0 rgba(0, 0, 0, 0.08)"
      p={{ base: 6, md: 10 }}
      {...props}
    >
      {children}
    </Box>
  );
};

/**
 * Google Sign-in Button
 *
 * Usage:
 * <GoogleSignInButton onClick={handleGoogleSignIn} isLoading={loading}>
 *   Войти с помощью Google
 * </GoogleSignInButton>
 */
export const GoogleSignInButton = ({ children, onClick, isLoading = false, isDisabled = false, ...props }) => {
  return (
    <ChakraButton
      w="full"
      h="48px"
      borderRadius="36px"
      bg="white"
      border="1.2px solid"
      borderColor="#DFE1EB"
      color="gray.700"
      fontSize="md"
      fontWeight="600"
      isLoading={isLoading}
      isDisabled={isDisabled || isLoading}
      _hover={{
        bg: 'gray.50',
        borderColor: '#C5C8D4',
      }}
      _active={{
        bg: 'gray.100',
      }}
      _disabled={{
        opacity: 0.6,
        cursor: 'not-allowed',
      }}
      onClick={onClick}
      {...props}
    >
      {!isLoading && (
        <Box mr={3} display="flex" alignItems="center">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        </Box>
      )}
      {children}
    </ChakraButton>
  );
};

// Named exports are preferred - use: import { StyledInput, StyledButton } from './FormComponents'
