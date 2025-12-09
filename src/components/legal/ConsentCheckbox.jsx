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
      colorScheme="purple"
      isChecked={isChecked}
      onChange={onChange}
      alignItems="flex-start"
    >
      <Text fontSize="sm" color="gray.600" lineHeight="1.6">
        {content.text}
        <Link
          href="/legal/offer"
          color="purple.600"
          fontWeight="600"
          target="_blank"
          _hover={{ textDecoration: 'underline' }}
        >
          {content.offer}
        </Link>
        {content.and}
        <Link
          href="/legal/privacy"
          color="purple.600"
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
