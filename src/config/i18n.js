// src/config/i18n.js
// Internationalization configuration for OneSIM

// ONLY RUSSIAN LANGUAGE FOR NOW
export const LANGUAGES = {
  RU: 'ru',
};

// Default language
export const DEFAULT_LANGUAGE = LANGUAGES.RU;

// Country translations dictionary (Russian only)
export const COUNTRY_TRANSLATIONS = {
  // Asia
  TH: 'Таиланд',
  AE: 'ОАЭ',
  VN: 'Вьетнам',
  MY: 'Малайзия',
  CN: 'Китай',
  JP: 'Япония',
  KR: 'Южная Корея',
  SG: 'Сингапур',
  ID: 'Индонезия',
  PH: 'Филиппины',
  IN: 'Индия',
  HK: 'Гонконг',
  TW: 'Тайвань',
  KH: 'Камбоджа',
  LA: 'Лаос',
  MM: 'Мьянма',
  MO: 'Макао',
  MN: 'Монголия',
  NP: 'Непал',
  LK: 'Шри-Ланка',

  // Europe
  TR: 'Турция',
  GE: 'Грузия',
  IT: 'Италия',
  FR: 'Франция',
  AZ: 'Азербайджан',
  ES: 'Испания',
  DE: 'Германия',
  GB: 'Великобритания',
  PT: 'Португалия',
  GR: 'Греция',
  NL: 'Нидерланды',
  BE: 'Бельгия',
  AT: 'Австрия',
  CH: 'Швейцария',
  SE: 'Швеция',
  NO: 'Норвегия',
  DK: 'Дания',
  FI: 'Финляндия',
  PL: 'Польша',
  CZ: 'Чехия',
  HU: 'Венгрия',
  RO: 'Румыния',
  BG: 'Болгария',
  HR: 'Хорватия',
  RS: 'Сербия',
  UA: 'Украина',
  BY: 'Беларусь',
  MD: 'Молдова',
  AM: 'Армения',
  IE: 'Ирландия',
  IS: 'Исландия',
  LU: 'Люксембург',
  MT: 'Мальта',
  CY: 'Кипр',

  // Americas
  US: 'США',
  CA: 'Канада',
  MX: 'Мексика',
  BR: 'Бразилия',
  AR: 'Аргентина',
  CL: 'Чили',
  CO: 'Колумбия',
  PE: 'Перу',
  VE: 'Венесуэла',
  EC: 'Эквадор',
  UY: 'Уругвай',
  PY: 'Парагвай',
  BO: 'Боливия',
  CR: 'Коста-Рика',
  PA: 'Панама',

  // Middle East & Africa
  SA: 'Саудовская Аравия',
  QA: 'Катар',
  KW: 'Кувейт',
  BH: 'Бахрейн',
  OM: 'Оман',
  JO: 'Иордания',
  IL: 'Израиль',
  EG: 'Египет',
  ZA: 'ЮАР',
  MA: 'Марокко',
  TN: 'Тунис',
  KE: 'Кения',
  NG: 'Нигерия',
  GH: 'Гана',

  // Oceania
  AU: 'Австралия',
  NZ: 'Новая Зеландия',
  FJ: 'Фиджи',

  // Central Asia
  UZ: 'Узбекистан',
  KZ: 'Казахстан',
  KG: 'Кыргызстан',
  TJ: 'Таджикистан',
  TM: 'Туркменистан',
};

// UI translations
export const TRANSLATIONS = {
  ru: {
    nav: {
      home: 'Главная',
      plans: 'Планы',
      contacts: 'Контакты',
      login: 'Войти',
      myPage: 'Моя страница',
      logout: 'Выйти',
    },
    hero: {
      badge: 'Мгновенная активация eSIM',
      title: 'Путешествуйте без границ с',
      description: 'Глобальное покрытие мобильной связи в более чем 190 странах мира. Оставайтесь на связи везде и всегда с нашими выгодными тарифами.',
      features: {
        coverage: '190+ стран покрытия',
        activation: 'Мгновенная активация за 2 минуты',
        secure: 'Безопасное соединение 5G',
      },
      cta: 'Узнать больше',
    },
    benefits: {
      title: 'Почему выбирают',
      titleHighlight: 'eSIM?',
      description: 'Современное решение для мобильной связи без физических SIM-карт',
      instant: {
        title: 'Мгновенная активация',
        description: 'Получите доступ к интернету сразу после приземления. Никаких очередей и ожидания.',
      },
      savings: {
        title: 'Экономия денег',
        description: 'Избегайте дорогого роуминга. Тарифы eSIM в 5-10 раз дешевле традиционного роуминга.',
      },
      noPhysical: {
        title: 'Без физической карты',
        description: 'Не нужно менять SIM-карты. Всё управляется цифровым способом прямо на вашем устройстве.',
      },
      multiCountry: {
        title: 'Несколько стран',
        description: 'Один eSIM профиль работает в нескольких странах. Путешествуйте без ограничений.',
      },
      dataControl: {
        title: 'Контроль трафика',
        description: 'Точно знайте, сколько данных используете. Никаких скрытых платежей и сюрпризов.',
      },
    },
    plans: {
      badge: 'Наши тарифы',
      title: 'Выберите идеальный',
      titleHighlight: 'план',
      description: 'Гибкие тарифные планы для каждой страны с высокоскоростным интернетом',
      tabs: {
        asia: 'АЗИЯ',
        europe: 'ЕВРОПА',
      },
      card: {
        internet: 'ИНТЕРНЕТ',
        days: 'дней',
        valid: 'ДЕЙСТВИТЕЛЕН',
        price: 'ЦЕНА',
        currency: 'UZS',
        buy: 'Купить',
      },
      empty: 'Планы для этого региона скоро появятся',
      emptyDescription: 'Мы работаем над добавлением тарифов для этого региона',
      error: 'Не удалось загрузить планы. Пожалуйста, попробуйте позже.',
    },
    destinations: {
      badge: 'Популярные направления',
      title: 'Куда вы',
      titleHighlight: 'отправляетесь?',
      description: 'Выберите страну и найдите идеальный тарифный план для вашего путешествия',
      explore: 'Смотреть планы',
    },
    faq: {
      title: 'Часто задаваемые',
      titleHighlight: 'вопросы',
      description: 'Всё, что вам нужно знать о eSIM',
      questions: {
        whatIsEsim: {
          question: 'Что такое eSIM?',
          answer: 'eSIM - это встроенная SIM-карта, которая уже установлена в вашем устройстве. Вместо физической карты, вы получаете цифровой профиль, который можно активировать мгновенно через QR-код или приложение.',
        },
        howToActivate: {
          question: 'Как активировать eSIM?',
          answer: 'После покупки вы получите QR-код. Просто отсканируйте его камерой телефона в настройках сотовой связи, и eSIM автоматически активируется. Весь процесс занимает не более 2 минут.',
        },
        deviceCompatibility: {
          question: 'Какие устройства поддерживают eSIM?',
          answer: 'Большинство современных смартфонов поддерживают eSIM: iPhone XS и новее, Samsung Galaxy S20 и новее, Google Pixel 3 и новее, а также многие модели Huawei, Oppo и другие. Проверьте совместимость вашего устройства перед покупкой.',
        },
        canKeepNumber: {
          question: 'Могу ли я сохранить свой номер?',
          answer: 'Да, вы можете использовать eSIM вместе с вашей обычной SIM-картой. Ваш основной номер останется активным для звонков и SMS, а eSIM будет использоваться для мобильного интернета.',
        },
        howMuchData: {
          question: 'Сколько данных мне нужно?',
          answer: 'Это зависит от вашего использования. Для обычного просмотра соцсетей и карт достаточно 1-3 ГБ на неделю. Для видеозвонков и стриминга рекомендуем 5-10 ГБ. Все наши пакеты можно пополнить в любой момент.',
        },
      },
    },
    countryPage: {
      title: 'eSIM планы в',
      backButton: 'Назад к планам',
      filterLabel: 'Фильтры',
      dataLabel: 'Объем данных',
      durationLabel: 'Период',
      allData: 'Все объемы',
      allDuration: 'Все периоды',
      noPlans: 'Планы не найдены',
      noPlansDescription: 'Попробуйте изменить фильтры или вернитесь позже',
    },
    auth: {
      fields: {
        firstName: 'Имя',
        lastName: 'Фамилия',
        phone: 'Телефон',
        email: 'Электронная почта',
        password: 'Пароль',
        confirmPassword: 'Подтвердите пароль',
      },
      placeholders: {
        firstName: 'Введите имя',
        lastName: 'Введите фамилию',
        phone: 'XX XXX XX XX',
        email: 'example@mail.com',
        password: 'Минимум 6 символов',
        confirmPassword: 'Повторите пароль',
      },
      errors: {
        firstNameRequired: 'Имя обязательно',
        lastNameRequired: 'Фамилия обязательна',
        phoneRequired: 'Телефон обязателен',
        phoneInvalid: 'Неверный формат (должно быть 9 цифр)',
        emailRequired: 'Email обязателен',
        emailInvalid: 'Неверный формат email',
        passwordRequired: 'Пароль обязателен',
        passwordTooShort: 'Пароль должен быть не менее 6 символов',
        passwordMismatch: 'Пароли не совпадают',
        signupFailed: 'Ошибка регистрации',
        loginFailed: 'Ошибка входа',
        verificationFailed: 'Ошибка подтверждения',
        invalidPin: 'Введите 8-значный код',
      },
      signup: {
        title: 'Регистрация',
        subtitle: 'Создайте аккаунт для продолжения',
        button: 'Зарегистрироваться',
        haveAccount: 'Уже есть аккаунт?',
        loginLink: 'Войти',
        verificationSent: 'Код отправлен',
        checkEmail: 'Проверьте почту и введите код подтверждения',
        success: 'Добро пожаловать!',
      },
      login: {
        title: 'Вход',
        subtitle: 'Войдите в свой аккаунт',
        button: 'Войти',
        noAccount: 'Нет аккаунта?',
        signupLink: 'Зарегистрироваться',
        success: 'Вы вошли в систему',
      },
      verification: {
        title: 'Подтверждение Email',
        description: 'Введите 8-значный код, отправленный на вашу почту',
        button: 'Подтвердить',
      },
    },
    myPage: {
      title: 'Моя страница',
      name: 'Имя',
      phone: 'Телефон',
    },
    esimStatus: {
      // Order statuses
      PENDING: 'В обработке',
      PROCESSING: 'Обрабатывается',
      ALLOCATED: 'Готов к активации',
      FAILED: 'Ошибка',
      CANCELLED: 'Отменен',
      // eSIM statuses (esimStatus field)
      GOT_RESOURCE_RELEASED: 'Готов к активации',
      GOT_RESOURCE_INSTALLED: 'Установлен',
      IN_USE: 'Используется',
      USED_UP: 'Израсходован',
      USED_EXPIRED: 'Истек срок',
      CANCEL: 'Отменен',
      DELETED: 'Удален',
    },
    footer: {
      description: 'Ваш надежный партнер в мире мобильной связи. Путешествуйте без границ с нашими eSIM решениями.',
      quickLinks: 'Быстрые ссылки',
      legal: 'Правовая информация',
      privacy: 'Конфиденциальность',
      terms: 'Условия использования',
      copyright: 'Все права защищены.',
      madeWith: 'Сделано с ❤️ для путешественников',
    },
  },
};

// Fixed getTranslation function with proper error handling
export const getTranslation = (lang, key) => {
  try {
    // Validate inputs
    if (!lang || !key) {
      console.warn('getTranslation: Missing lang or key parameter');
      return key || '';
    }

    // Get the language translations, fallback to default if not found
    const langTranslations = TRANSLATIONS[lang] || TRANSLATIONS[DEFAULT_LANGUAGE];
    
    if (!langTranslations) {
      console.warn(`getTranslation: No translations found for language "${lang}"`);
      return key;
    }

    // Split the key and traverse the object
    const keys = key.split('.');
    let value = langTranslations;
    
    for (const k of keys) {
      // Check if the current value is an object and has the key
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Key not found, return the original key
        console.warn(`getTranslation: Translation key "${key}" not found for language "${lang}"`);
        return key;
      }
    }
    
    // Make sure we return a string
    if (typeof value === 'string') {
      return value;
    } else {
      console.warn(`getTranslation: Translation for "${key}" is not a string:`, value);
      return key;
    }
  } catch (error) {
    console.error('getTranslation error:', error);
    return key || '';
  }
};

export const getCountryName = (countryCode) => {
  try {
    const country = COUNTRY_TRANSLATIONS[countryCode];
    if (!country) {
      return countryCode;
    }
    return country;
  } catch (error) {
    console.error('getCountryName error:', error);
    return countryCode;
  }
};