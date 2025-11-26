// src/components/CountryFlag.jsx
// Custom flag component that handles EU multi-country flags and regular country flags
import React from 'react';
import Flag from 'react-world-flags';
import { Box } from '@chakra-ui/react';

// Custom EU Flag SVG Component
const EUFlag = ({ style }) => (
  <svg
    viewBox="0 0 60 40"
    style={style}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Light blue background */}
    <rect width="60" height="40" fill="#4A90E2" />

    {/* White "EU" text */}
    <text
      x="30"
      y="24"
      fontFamily="Arial, sans-serif"
      fontSize="16"
      fontWeight="bold"
      fill="white"
      textAnchor="middle"
      dominantBaseline="middle"
    >
      EU
    </text>
  </svg>
);

/**
 * CountryFlag component that handles both regular country flags and EU multi-country flags
 * @param {string} code - Country code (e.g., 'TR', 'US', 'EU-30', 'EU-15')
 * @param {object} style - CSS styles to apply to the flag
 * @param {object} rest - Additional props to pass to the flag component
 */
const CountryFlag = ({ code, style, ...rest }) => {
  // Check if this is a European multi-country plan (locationCode starts with "EU-")
  const isEU = code && (code.startsWith('EU-') || code === 'EU' || code === 'EUROPE' || code === 'Europe');

  if (isEU) {
    return <EUFlag style={style} {...rest} />;
  }

  // Regular country flag using react-world-flags
  return <Flag code={code} style={style} {...rest} />;
};

export default CountryFlag;
