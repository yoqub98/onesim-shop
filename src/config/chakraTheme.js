// src/config/chakraTheme.js
// Chakra UI Theme Configuration for OneSIM
// This ensures Manrope font is used across ALL components

import { extendTheme } from '@chakra-ui/react';

const chakraTheme = extendTheme({
  fonts: {
    heading: "'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    body: "'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  styles: {
    global: {
      'html, body': {
        fontFamily: "'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      },
      '*': {
        fontFamily: "'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      },
    },
  },
});

export default chakraTheme;
