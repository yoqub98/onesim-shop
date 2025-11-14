// src/config/i18n.js
// Internationalization configuration for OneSIM

// Available languages
export const LANGUAGES = {
  RU: 'ru',
  UZ: 'uz',
  EN: 'en',
};

// Default language
export const DEFAULT_LANGUAGE = LANGUAGES.RU;

// Country translations dictionary (100 countries)
export const COUNTRY_TRANSLATIONS = {
  // Asia
  TH: { ru: 'Таиланд', uz: 'Tailand', en: 'Thailand' },
  AE: { ru: 'ОАЭ', uz: 'BAA', en: 'UAE' },
  VN: { ru: 'Вьетнам', uz: 'Vyetnam', en: 'Vietnam' },
  MY: { ru: 'Малайзия', uz: 'Malayziya', en: 'Malaysia' },
  CN: { ru: 'Китай', uz: 'Xitoy', en: 'China' },
  JP: { ru: 'Япония', uz: 'Yaponiya', en: 'Japan' },
  KR: { ru: 'Южная Корея', uz: 'Janubiy Koreya', en: 'South Korea' },
  SG: { ru: 'Сингапур', uz: 'Singapur', en: 'Singapore' },
  ID: { ru: 'Индонезия', uz: 'Indoneziya', en: 'Indonesia' },
  PH: { ru: 'Филиппины', uz: 'Filippin', en: 'Philippines' },
  IN: { ru: 'Индия', uz: 'Hindiston', en: 'India' },
  HK: { ru: 'Гонконг', uz: 'Gonkong', en: 'Hong Kong' },
  TW: { ru: 'Тайвань', uz: 'Tayvan', en: 'Taiwan' },
  KH: { ru: 'Камбоджа', uz: 'Kambodja', en: 'Cambodia' },
  LA: { ru: 'Лаос', uz: 'Laos', en: 'Laos' },
  MM: { ru: 'Мьянма', uz: 'Myanma', en: 'Myanmar' },
  MO: { ru: 'Макао', uz: 'Makao', en: 'Macau' },
  MN: { ru: 'Монголия', uz: 'Mongoliya', en: 'Mongolia' },
  NP: { ru: 'Непал', uz: 'Nepal', en: 'Nepal' },
  LK: { ru: 'Шри-Ланка', uz: 'Shri-Lanka', en: 'Sri Lanka' },
  
  // Europe
  TR: { ru: 'Турция', uz: 'Turkiya', en: 'Turkey' },
  GE: { ru: 'Грузия', uz: 'Gruziya', en: 'Georgia' },
  IT: { ru: 'Италия', uz: 'Italiya', en: 'Italy' },
  FR: { ru: 'Франция', uz: 'Fransiya', en: 'France' },
  AZ: { ru: 'Азербайджан', uz: 'Ozarbayjon', en: 'Azerbaijan' },
  ES: { ru: 'Испания', uz: 'Ispaniya', en: 'Spain' },
  DE: { ru: 'Германия', uz: 'Germaniya', en: 'Germany' },
  GB: { ru: 'Великобритания', uz: 'Buyuk Britaniya', en: 'United Kingdom' },
  PT: { ru: 'Португалия', uz: 'Portugaliya', en: 'Portugal' },
  GR: { ru: 'Греция', uz: 'Gretsiya', en: 'Greece' },
  NL: { ru: 'Нидерланды', uz: 'Niderlandiya', en: 'Netherlands' },
  BE: { ru: 'Бельгия', uz: 'Belgiya', en: 'Belgium' },
  AT: { ru: 'Австрия', uz: 'Avstriya', en: 'Austria' },
  CH: { ru: 'Швейцария', uz: 'Shveytsariya', en: 'Switzerland' },
  SE: { ru: 'Швеция', uz: 'Shvetsiya', en: 'Sweden' },
  NO: { ru: 'Норвегия', uz: 'Norvegiya', en: 'Norway' },
  DK: { ru: 'Дания', uz: 'Daniya', en: 'Denmark' },
  FI: { ru: 'Финляндия', uz: 'Finlandiya', en: 'Finland' },
  PL: { ru: 'Польша', uz: 'Polsha', en: 'Poland' },
  CZ: { ru: 'Чехия', uz: 'Chexiya', en: 'Czech Republic' },
  HU: { ru: 'Венгрия', uz: 'Vengriya', en: 'Hungary' },
  RO: { ru: 'Румыния', uz: 'Ruminiya', en: 'Romania' },
  BG: { ru: 'Болгария', uz: 'Bolgariya', en: 'Bulgaria' },
  HR: { ru: 'Хорватия', uz: 'Xorvatiya', en: 'Croatia' },
  RS: { ru: 'Сербия', uz: 'Serbiya', en: 'Serbia' },
  UA: { ru: 'Украина', uz: 'Ukraina', en: 'Ukraine' },
  BY: { ru: 'Беларусь', uz: 'Belarus', en: 'Belarus' },
  MD: { ru: 'Молдова', uz: 'Moldova', en: 'Moldova' },
  AM: { ru: 'Армения', uz: 'Armaniston', en: 'Armenia' },
  IE: { ru: 'Ирландия', uz: 'Irlandiya', en: 'Ireland' },
  IS: { ru: 'Исландия', uz: 'Islandiya', en: 'Iceland' },
  LU: { ru: 'Люксембург', uz: 'Lyuksemburg', en: 'Luxembourg' },
  MT: { ru: 'Мальта', uz: 'Malta', en: 'Malta' },
  CY: { ru: 'Кипр', uz: 'Kipr', en: 'Cyprus' },
  
  // Americas
  US: { ru: 'США', uz: 'AQSH', en: 'United States' },
  CA: { ru: 'Канада', uz: 'Kanada', en: 'Canada' },
  MX: { ru: 'Мексика', uz: 'Meksika', en: 'Mexico' },
  BR: { ru: 'Бразилия', uz: 'Braziliya', en: 'Brazil' },
  AR: { ru: 'Аргентина', uz: 'Argentina', en: 'Argentina' },
  CL: { ru: 'Чили', uz: 'Chili', en: 'Chile' },
  CO: { ru: 'Колумбия', uz: 'Kolumbiya', en: 'Colombia' },
  PE: { ru: 'Перу', uz: 'Peru', en: 'Peru' },
  VE: { ru: 'Венесуэла', uz: 'Venesuela', en: 'Venezuela' },
  EC: { ru: 'Эквадор', uz: 'Ekvador', en: 'Ecuador' },
  UY: { ru: 'Уругвай', uz: 'Urugvay', en: 'Uruguay' },
  PY: { ru: 'Парагвай', uz: 'Paragvay', en: 'Paraguay' },
  BO: { ru: 'Боливия', uz: 'Boliviya', en: 'Bolivia' },
  CR: { ru: 'Коста-Рика', uz: 'Kosta-Rika', en: 'Costa Rica' },
  PA: { ru: 'Панама', uz: 'Panama', en: 'Panama' },
  
  // Middle East & Africa
  SA: { ru: 'Саудовская Аравия', uz: 'Saudiya Arabistoni', en: 'Saudi Arabia' },
  QA: { ru: 'Катар', uz: 'Qatar', en: 'Qatar' },
  KW: { ru: 'Кувейт', uz: 'Quvayt', en: 'Kuwait' },
  BH: { ru: 'Бахрейн', uz: 'Bahrayn', en: 'Bahrain' },
  OM: { ru: 'Оман', uz: 'Ummon', en: 'Oman' },
  JO: { ru: 'Иордания', uz: 'Iordaniya', en: 'Jordan' },
  IL: { ru: 'Израиль', uz: 'Isroil', en: 'Israel' },
  EG: { ru: 'Египет', uz: 'Misr', en: 'Egypt' },
  ZA: { ru: 'ЮАР', uz: 'JAR', en: 'South Africa' },
  MA: { ru: 'Марокко', uz: 'Marokash', en: 'Morocco' },
  TN: { ru: 'Тунис', uz: 'Tunis', en: 'Tunisia' },
  KE: { ru: 'Кения', uz: 'Keniya', en: 'Kenya' },
  NG: { ru: 'Нигерия', uz: 'Nigeriya', en: 'Nigeria' },
  GH: { ru: 'Гана', uz: 'Gana', en: 'Ghana' },
  
  // Oceania
  AU: { ru: 'Австралия', uz: 'Avstraliya', en: 'Australia' },
  NZ: { ru: 'Новая Зеландия', uz: 'Yangi Zelandiya', en: 'New Zealand' },
  FJ: { ru: 'Фиджи', uz: 'Fiji', en: 'Fiji' },
  
  // Central Asia
  UZ: { ru: 'Узбекистан', uz: 'Oʻzbekiston', en: 'Uzbekistan' },
  KZ: { ru: 'Казахстан', uz: 'Qozogʻiston', en: 'Kazakhstan' },
  KG: { ru: 'Кыргызстан', uz: 'Qirgʻiziston', en: 'Kyrgyzstan' },
  TJ: { ru: 'Таджикистан', uz: 'Tojikiston', en: 'Tajikistan' },
  TM: { ru: 'Туркменистан', uz: 'Turkmaniston', en: 'Turkmenistan' },
};

// UI translations
export const TRANSLATIONS = {
  ru: {
    // Navigation
    nav: {
      home: 'Главная',
      plans: 'Планы',
      contacts: 'Контакты',
    },
    
    // Hero Section
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
    
    // Plans Section
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
    
    // Popular Destinations
    destinations: {
      badge: 'Популярные направления',
      title: 'Куда вы',
      titleHighlight: 'отправляетесь?',
      description: 'Выберите страну и найдите идеальный тарифный план для вашего путешествия',
      explore: 'Смотреть планы',
    },
    
    // Country Page
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
    
    // Footer
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
  
  uz: {
    // Navigation
    nav: {
      home: 'Bosh sahifa',
      plans: 'Rejalar',
      contacts: 'Aloqa',
    },
    
    // Hero Section
    hero: {
      badge: 'eSIM oniy faollashtirish',
      title: 'Chegaralarsiz sayohat qiling',
      description: 'Dunyoning 190 dan ortiq mamlakatida mobil aloqa. Har doim va har yerda qulay tariflar bilan aloqada boʻling.',
      features: {
        coverage: '190+ mamlakat qamrovi',
        activation: '2 daqiqada oniy faollashtirish',
        secure: 'Xavfsiz 5G aloqa',
      },
      cta: 'Batafsil',
    },
    
    // Plans Section
    plans: {
      badge: 'Bizning tariflar',
      title: 'Mukammal',
      titleHighlight: 'rejani',
      description: 'Har bir mamlakat uchun yuqori tezlikdagi internet bilan moslashuvchan tariflar',
      tabs: {
        asia: 'OSIYO',
        europe: 'YEVROPA',
      },
      card: {
        internet: 'INTERNET',
        days: 'kun',
        valid: 'AMAL QILADI',
        price: 'NARX',
        currency: 'SUM',
        buy: 'Sotib olish',
      },
      empty: 'Bu mintaqa uchun rejalar tez orada paydo boʻladi',
      emptyDescription: 'Biz bu mintaqa uchun tariflarni qoʻshish ustida ishlayapmiz',
      error: 'Rejalarni yuklab boʻlmadi. Iltimos keyinroq urinib koʻring.',
    },
    
    // Popular Destinations
    destinations: {
      badge: 'Mashhur yoʻnalishlar',
      title: 'Qayerga',
      titleHighlight: 'ketyapsiz?',
      description: 'Mamlakatni tanlang va sayohatingiz uchun ideal tarifni toping',
      explore: 'Rejalarni koʻrish',
    },
    
    // Country Page
    countryPage: {
      title: 'dagi eSIM rejalar',
      backButton: 'Rejalarga qaytish',
      filterLabel: 'Filtrlar',
      dataLabel: 'Maʼlumotlar hajmi',
      durationLabel: 'Muddat',
      allData: 'Barcha hajmlar',
      allDuration: 'Barcha muddatlar',
      noPlans: 'Rejalar topilmadi',
      noPlansDescription: 'Filtrlarni oʻzgartiring yoki keyinroq qaytib keling',
    },
    
    // Footer
    footer: {
      description: 'Mobil aloqa dunyosida ishonchli hamkoringiz. eSIM yechimlari bilan chegaralarsiz sayohat qiling.',
      quickLinks: 'Tezkor havolalar',
      legal: 'Huquqiy maʼlumot',
      privacy: 'Maxfiylik',
      terms: 'Foydalanish shartlari',
      copyright: 'Barcha huquqlar himoyalangan.',
      madeWith: '❤️ bilan sayohatchilar uchun yaratildi',
    },
  },
  
  en: {
    // Navigation
    nav: {
      home: 'Home',
      plans: 'Plans',
      contacts: 'Contacts',
    },
    
    // Hero Section
    hero: {
      badge: 'Instant eSIM Activation',
      title: 'Travel Without Borders with',
      description: 'Global mobile coverage in more than 190 countries worldwide. Stay connected everywhere and always with our affordable plans.',
      features: {
        coverage: '190+ countries coverage',
        activation: 'Instant activation in 2 minutes',
        secure: 'Secure 5G connection',
      },
      cta: 'Learn More',
    },
    
    // Plans Section
    plans: {
      badge: 'Our Plans',
      title: 'Choose the Perfect',
      titleHighlight: 'Plan',
      description: 'Flexible plans for every country with high-speed internet',
      tabs: {
        asia: 'ASIA',
        europe: 'EUROPE',
      },
      card: {
        internet: 'INTERNET',
        days: 'days',
        valid: 'VALID',
        price: 'PRICE',
        currency: 'UZS',
        buy: 'Buy',
      },
      empty: 'Plans for this region coming soon',
      emptyDescription: 'We are working on adding plans for this region',
      error: 'Failed to load plans. Please try again later.',
    },
    
    // Popular Destinations
    destinations: {
      badge: 'Popular Destinations',
      title: 'Where are you',
      titleHighlight: 'heading?',
      description: 'Choose a country and find the perfect plan for your trip',
      explore: 'Explore Plans',
    },
    
    // Country Page
    countryPage: {
      title: 'eSIM Plans in',
      backButton: 'Back to Plans',
      filterLabel: 'Filters',
      dataLabel: 'Data Amount',
      durationLabel: 'Duration',
      allData: 'All Data',
      allDuration: 'All Durations',
      noPlans: 'No Plans Found',
      noPlansDescription: 'Try changing filters or come back later',
    },
    
    // Footer
    footer: {
      description: 'Your reliable partner in the world of mobile communications. Travel without borders with our eSIM solutions.',
      quickLinks: 'Quick Links',
      legal: 'Legal Information',
      privacy: 'Privacy',
      terms: 'Terms of Use',
      copyright: 'All rights reserved.',
      madeWith: 'Made with ❤️ for travelers',
    },
  },
};

/**
 * Get translation for a key
 * @param {string} lang - Language code (ru, uz, en)
 * @param {string} key - Translation key (e.g., 'hero.title')
 * @returns {string} Translated text
 */
export const getTranslation = (lang, key) => {
  const keys = key.split('.');
  let value = TRANSLATIONS[lang] || TRANSLATIONS[DEFAULT_LANGUAGE];
  
  for (const k of keys) {
    value = value[k];
    if (!value) return key;
  }
  
  return value;
};

/**
 * Get country name translation
 * @param {string} countryCode - ISO country code (e.g., 'TR')
 * @param {string} lang - Language code (ru, uz, en)
 * @returns {string} Translated country name
 */
export const getCountryName = (countryCode, lang = DEFAULT_LANGUAGE) => {
  const country = COUNTRY_TRANSLATIONS[countryCode];
  if (!country) return countryCode;
  return country[lang] || country[DEFAULT_LANGUAGE];
};