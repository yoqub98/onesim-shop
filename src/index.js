// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import App from './App.jsx';
import './index.css';

import 'animate.css';

// Chakra theme with Manrope font
const theme = extendTheme({
  fonts: {
    heading: "'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    body: "'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);