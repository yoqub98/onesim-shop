// src/components/legal/ConsentCheckbox.jsx
import React from 'react';
import { Checkbox, Text, Link } from '@chakra-ui/react';

/**
 * ConsentCheckbox - Reusable checkbox component for legal agreements
 * @param {boolean} isChecked - Current checked state
 * @param {function} onChange - Handler for state changes
 * @param {string} lang - Language code (default: 'ru')
 * @param {string} variant - Text variant: 'signup' or 'login' (default: 'signup')
 */
const ConsentCheckbox = ({
  isChecked,
  onChange,
  lang = 'ru',
  variant = 'signup'
}) => {
  const texts = {
    ru: {
      signup: {
        text: 'Я прочитал и согласен с ',
        offer: 'публичной офертой',
        and: ' и ',
        privacy: 'политикой конфиденциальности',
      },
      login: {
        text: 'Продолжая, вы соглашаетесь с ',
        offer: 'публичной офертой',
        and: ' и ',
        privacy: 'политикой конфиденциальности',
      },
    },
  };

  const content = texts[lang][variant];

  return (
    <Checkbox
      isChecked={isChecked}
      onChange={onChange}
      alignItems="flex-start"
      sx={{
        '& .chakra-checkbox__control': {
          borderColor: '#DFE1EB',
          borderRadius: '4px',
          _checked: {
            bg: '#404144',
            borderColor: '#404144',
            _hover: {
              bg: '#2D2F33',
              borderColor: '#2D2F33',
            },
          },
        },
      }}
    >
      <Text fontSize="sm" color="gray.600" lineHeight="1.6">
        {content.text}
        <Link
          href="/legal/offer"
          color="#1F2023"
          fontWeight="600"
          target="_blank"
          _hover={{ textDecoration: 'underline' }}
        >
          {content.offer}
        </Link>
        {content.and}
        <Link
          href="/legal/privacy"
          color="#1F2023"
          fontWeight="600"
          target="_blank"
          _hover={{ textDecoration: 'underline' }}
        >
          {content.privacy}
        </Link>
      </Text>
    </Checkbox>
  );
};

export default ConsentCheckbox;
