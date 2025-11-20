import { createStandaloneToast } from '@chakra-ui/react';

// Create standalone toast for use outside of React components
const { toast, ToastContainer } = createStandaloneToast();

// Create a toaster object that matches the v3 API structure
export const toaster = {
  create: ({ title, description, type = 'info', duration = 5000 }) => {
    // Map v3 'type' to v2 'status'
    const status = type === 'error' ? 'error' : type === 'success' ? 'success' : type === 'warning' ? 'warning' : 'info';

    return toast({
      title,
      description,
      status,
      duration,
      isClosable: true,
      position: 'top',
    });
  },
};

// Export ToastContainer to be rendered in the app
export const Toaster = ToastContainer;
