// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import chakraTheme from './config/chakraTheme';
import App from './App.jsx';

import 'animate.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ChakraProvider theme={chakraTheme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);