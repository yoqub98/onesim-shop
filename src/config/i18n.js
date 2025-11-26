// src/config/i18n.js
// Internationalization configuration for OneSIM

// Supported languages
export const LANGUAGES = {
  RU: 'ru',
  UZ: 'uz',
};

// Default language
export const DEFAULT_LANGUAGE = LANGUAGES.RU;

// Country translations dictionary (multilingual)
export const COUNTRY_TRANSLATIONS = {
  ru: {
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
  },
  uz: {
    // Asia
    TH: 'Tailand',
    AE: 'BAA',
    VN: 'Vyetnam',
    MY: 'Malayziya',
    CN: 'Xitoy',
    JP: 'Yaponiya',
    KR: 'Janubiy Koreya',
    SG: 'Singapur',
    ID: 'Indoneziya',
    PH: 'Filippin',
    IN: 'Hindiston',
    HK: 'Gonkong',
    TW: 'Tayvan',
    KH: 'Kambodja',
    LA: 'Laos',
    MM: 'Myanma',
    MO: 'Makao',
    MN: 'Mo\'g\'uliston',
    NP: 'Nepal',
    LK: 'Shri-Lanka',

    // Europe
    TR: 'Turkiya',
    GE: 'Gruziya',
    IT: 'Italiya',
    FR: 'Fransiya',
    AZ: 'Ozarbayjon',
    ES: 'Ispaniya',
    DE: 'Germaniya',
    GB: 'Buyuk Britaniya',
    PT: 'Portugaliya',
    GR: 'Gretsiya',
    NL: 'Niderlandiya',
    BE: 'Belgiya',
    AT: 'Avstriya',
    CH: 'Shveytsariya',
    SE: 'Shvetsiya',
    NO: 'Norvegiya',
    DK: 'Daniya',
    FI: 'Finlandiya',
    PL: 'Polsha',
    CZ: 'Chexiya',
    HU: 'Vengriya',
    RO: 'Ruminiya',
    BG: 'Bolgariya',
    HR: 'Xorvatiya',
    RS: 'Serbiya',
    UA: 'Ukraina',
    BY: 'Belarus',
    MD: 'Moldova',
    AM: 'Armaniston',
    IE: 'Irlandiya',
    IS: 'Islandiya',
    LU: 'Lyuksemburg',
    MT: 'Malta',
    CY: 'Kipr',

    // Americas
    US: 'AQSH',
    CA: 'Kanada',
    MX: 'Meksika',
    BR: 'Braziliya',
    AR: 'Argentina',
    CL: 'Chili',
    CO: 'Kolumbiya',
    PE: 'Peru',
    VE: 'Venesuela',
    EC: 'Ekvador',
    UY: 'Urugvay',
    PY: 'Paragvay',
    BO: 'Boliviya',
    CR: 'Kosta-Rika',
    PA: 'Panama',

    // Middle East & Africa
    SA: 'Saudiya Arabistoni',
    QA: 'Qatar',
    KW: 'Quvayt',
    BH: 'Bahrayn',
    OM: 'Ummon',
    JO: 'Iordaniya',
    IL: 'Isroil',
    EG: 'Misr',
    ZA: 'JAR',
    MA: 'Marokash',
    TN: 'Tunis',
    KE: 'Keniya',
    NG: 'Nigeriya',
    GH: 'Gana',

    // Oceania
    AU: 'Avstraliya',
    NZ: 'Yangi Zelandiya',
    FJ: 'Fiji',

    // Central Asia
    UZ: 'O\'zbekiston',
    KZ: 'Qozog\'iston',
    KG: 'Qirg\'iziston',
    TJ: 'Tojikiston',
    TM: 'Turkmaniston',
  },
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
      search: 'Поиск',
      searchPlaceholder: 'Введите название страны...',
      notFound: 'Страна не найдена',
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
      banner: {
        title: 'Найдите лучший eSIM для',
        description: 'Выберите идеальный тарифный план для вашего путешествия. Быстрая активация, доступные цены.',
        days: 'дней',
      },
      filterLabel: 'Фильтры',
      dataLabel: 'Объем данных',
      durationLabel: 'Период',
      allData: 'Все объемы',
      allDuration: 'Все периоды',
      back: 'Назад',
      filters: 'Фильтры:',
      allDataOptions: 'Все данные',
      allDurationOptions: 'Все сроки',
      showing: 'Показано',
      of: 'из',
      noPlans: 'Планы не найдены',
      noPlansDescription: 'Попробуйте изменить фильтры или вернитесь позже',
      resetFilters: 'Сбросить фильтры',
    },
    packagePage: {
      back: 'Назад',
      esimFor: 'eSIM для',
      notFound: 'Пакет не найден',
      notFoundDescription: 'Информация о пакете недоступна',
      backToHome: 'Вернуться на главную',
      details: {
        dataVolume: 'Объем данных',
        validity: 'Срок действия',
        days: 'дней',
        networkType: 'Тип сети',
        packageType: 'Тип пакета',
        dataOnly: 'Только данные',
        dataWithCalls: 'Данные + Звонки/SMS',
      },
      provider: {
        title: 'Информация о провайдере',
        operator: 'Оператор',
        coverage: 'Покрытие',
        speed: 'Скорость',
        allOperators: 'Все операторы:',
        notSpecified: 'Не указан',
      },
      installation: {
        title: 'Инструкция по установке',
        step: 'Шаг',
        step1: 'После покупки QR-код будет в разделе "Мои eSIM"',
        step2: 'Откройте настройки телефона',
        step3: 'Отсканируйте QR-код',
        step4: 'Установите профиль eSIM',
        step5: 'Активируйте и начните использовать',
      },
      purchase: {
        packagePrice: 'Стоимость пакета',
        data: 'Данные',
        period: 'Срок',
        region: 'Регион',
        buy: 'Купить',
        ordering: 'Оформление...',
        instantDelivery: 'Мгновенная доставка',
      },
      loginModal: {
        title: 'Требуется авторизация',
        message: 'Для оформления заказа на eSIM необходимо войти в аккаунт или зарегистрироваться.',
        cancel: 'Отмена',
        login: 'Войти',
        signup: 'Регистрация',
      },
      successModal: {
        title: 'Заказ оформлен!',
        message: 'Ваш eSIM успешно заказан! QR-код для активации будет доступен в разделе "Мои eSIM" через несколько минут.',
        info: 'Обработка занимает 1-2 минуты. После этого вы сможете просмотреть и скачать QR-код в личном кабинете.',
        close: 'Закрыть',
        goToProfile: 'Перейти в профиль',
      },
      errorModal: {
        title: 'Ошибка заказа',
        ok: 'Понятно',
      },
    },
    plansPage: {
      title: 'Все тарифные планы',
      subtitle: 'Найдите идеальный eSIM пакет для вашего путешествия',
      filters: {
        title: 'Фильтры',
        country: 'Страна',
        countryPlaceholder: 'Выберите страну',
        duration: 'Длительность (дни)',
        durationPlaceholder: 'Минимум дней',
        dataVolume: 'Объем данных (ГБ)',
        dataPlaceholder: 'Минимум ГБ',
        priceRange: 'Диапазон цен',
        minPrice: 'Мин. цена',
        maxPrice: 'Макс. цена',
        searchButton: 'Поиск',
        resetButton: 'Сбросить',
        allCountries: 'Все страны',
      },
      table: {
        country: 'Страна',
        packageName: 'Название пакета',
        data: 'Данные',
        duration: 'Длительность',
        price: 'Цена',
        action: 'Действие',
        buy: 'Купить',
      },
      results: {
        showing: 'Показано',
        of: 'из',
        packages: 'пакетов',
        noResults: 'Пакеты не найдены',
        noResultsDescription: 'Попробуйте изменить фильтры или выбрать другую страну',
        selectCountry: 'Выберите страну для поиска',
        selectCountryDescription: 'Используйте фильтры выше для поиска eSIM пакетов',
      },
      loading: 'Загрузка пакетов...',
      error: 'Ошибка загрузки',
      errorDescription: 'Не удалось загрузить пакеты. Попробуйте снова.',
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
      tabs: {
        profile: 'Профиль',
        myEsims: 'Мои eSIM',
      },
      profile: {
        title: 'Личные данные',
        firstName: 'Имя',
        lastName: 'Фамилия',
        notSpecified: 'Не указан',
      },
      stats: {
        title: 'Статистика',
        totalOrders: 'Всего заказов',
        activeEsims: 'Активных eSIM',
      },
      orders: {
        title: 'Мои заказы',
        refresh: 'Обновить',
        loading: 'Загрузка заказов...',
        orderNumber: 'Заказ',
        data: 'Данные',
        validity: 'Срок',
        days: 'дней',
        until: 'до',
        region: 'Регион',
        date: 'Дата',
        price: 'Стоимость',
        dataUsed: 'Использовано данных',
        dataRemaining: 'осталось',
        percentUsed: 'использовано',
      },
      actions: {
        showQr: 'Показать QR-код',
        cancelEsim: 'Отменить eSIM',
        checkStatus: 'Проверить статус',
        checking: 'Проверка...',
        cancelling: 'Отмена...',
      },
      status: {
        processing: 'Ваш eSIM обрабатывается. Это может занять несколько минут.',
        error: 'Произошла ошибка при обработке заказа',
      },
      empty: {
        title: 'У вас пока нет заказов',
        description: 'Выберите подходящий eSIM пакет и оформите первый заказ',
        button: 'Выбрать eSIM',
      },
      qrModal: {
        title: 'QR-код для активации',
        warning: 'Важная информация',
        warningText1: '• Не делитесь этим QR-кодом с другими людьми - они смогут легко установить ваш eSIM',
        warningText2: '• После активации eSIM его невозможно отменить или вернуть',
        activationCode: 'Код активации:',
        openLink: 'Открыть ссылку активации',
        smdpAddress: 'SM-DP+ адрес:',
        instructions: 'Откройте настройки телефона, перейдите в раздел "Сотовая связь" и отсканируйте QR-код или используйте ссылку активации выше для установки eSIM.',
        share: 'Поделиться',
        close: 'Закрыть',
      },
      cancelModal: {
        title: 'Отменить eSIM?',
        message: 'Вы уверены, что хотите отменить этот eSIM? Это действие нельзя отменить.',
        package: 'Пакет:',
        order: 'Заказ:',
        warning: 'eSIM можно отменить только если он ещё не был установлен на устройство.',
        cancel: 'Отмена',
        confirm: 'Да, отменить',
      },
      cancelSuccess: {
        title: 'eSIM отменён',
        message: 'eSIM успешно отменён. Стоимость возвращена на баланс.',
        info: 'Средства будут зачислены на баланс в течение нескольких минут.',
        ok: 'Понятно',
      },
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
  uz: {
    nav: {
      home: 'Bosh sahifa',
      plans: 'Tariflar',
      contacts: 'Aloqa',
      login: 'Kirish',
      myPage: 'Mening sahifam',
      logout: 'Chiqish',
    },
    hero: {
      badge: 'eSIM ni bir zumda faollashtirish',
      title: 'Chegara siz sayohat qiling',
      description: 'Dunyoning 190 dan ortiq mamlakatida global mobil aloqa. Qulay tariflarimiz bilan har doim va har joyda aloqada bo\'ling.',
      features: {
        coverage: '190+ mamlakat qamrovi',
        activation: '2 daqiqada tezkor faollashtirish',
        secure: 'Xavfsiz 5G aloqa',
      },
      cta: 'Batafsil',
    },
    benefits: {
      title: 'Nima uchun',
      titleHighlight: 'eSIM?',
      description: 'Jismoniy SIM-kartasiz mobil aloqaning zamonaviy yechimi',
      instant: {
        title: 'Tezkor faollashtirish',
        description: 'Qo\'nganingizdan keyin darhol internetga kirish imkoniyati. Navbatlar va kutish yo\'q.',
      },
      savings: {
        title: 'Pulni tejash',
        description: 'Qimmat roumingdan qoching. eSIM tariflari an\'anaviy roumingdan 5-10 marta arzonroq.',
      },
      noPhysical: {
        title: 'Jismoniy karta yo\'q',
        description: 'SIM-kartalarni almashtirish kerak emas. Hammasi to\'g\'ridan-to\'g\'ri qurilmangizda raqamli boshqariladi.',
      },
      multiCountry: {
        title: 'Bir nechta mamlakat',
        description: 'Bitta eSIM profil bir nechta mamlakatda ishlaydi. Chegara siz sayohat qiling.',
      },
      dataControl: {
        title: 'Trafik nazorati',
        description: 'Qancha ma\'lumot ishlatayotganingizni aniq bilib oling. Yashirin to\'lovlar va ajablanishlar yo\'q.',
      },
    },
    plans: {
      badge: 'Bizning tariflar',
      title: 'Ideal',
      titleHighlight: 'tarifni tanlang',
      description: 'Har bir mamlakat uchun yuqori tezlikli internet bilan moslashuvchan tarif rejalari',
      tabs: {
        asia: 'OSIYO',
        europe: 'EVROPA',
      },
      card: {
        internet: 'INTERNET',
        days: 'kun',
        valid: 'AMAL QILADI',
        price: 'NARX',
        currency: 'UZS',
        buy: 'Sotib olish',
      },
      empty: 'Ushbu mintaqa uchun tariflar tez orada paydo bo\'ladi',
      emptyDescription: 'Biz ushbu mintaqa uchun tariflarni qo\'shish ustida ishlamoqdamiz',
      error: 'Tariflarni yuklab bo\'lmadi. Iltimos, keyinroq urinib ko\'ring.',
    },
    destinations: {
      badge: 'Mashhur yo\'nalishlar',
      title: 'Qayerga',
      titleHighlight: 'borasiz?',
      description: 'Mamlakatni tanlang va sayohatingiz uchun ideal tarif rejasini toping',
      explore: 'Tariflarni ko\'rish',
      search: 'Qidirish',
      searchPlaceholder: 'Mamlakat nomini kiriting...',
      notFound: 'Mamlakat topilmadi',
    },
    faq: {
      title: 'Tez-tez so\'raladigan',
      titleHighlight: 'savollar',
      description: 'eSIM haqida bilishingiz kerak bo\'lgan hamma narsa',
      questions: {
        whatIsEsim: {
          question: 'eSIM nima?',
          answer: 'eSIM - bu qurilmangizga allaqachon o\'rnatilgan o\'rnatilgan SIM-karta. Jismoniy karta o\'rniga, siz QR-kod yoki ilova orqali bir zumda faollashtirish mumkin bo\'lgan raqamli profilni olasiz.',
        },
        howToActivate: {
          question: 'eSIM ni qanday faollashtirish mumkin?',
          answer: 'Xariddan keyin QR-kodni olasiz. Uni telefoningiz kamerasi bilan uyali aloqa sozlamalarida skanerlang va eSIM avtomatik faollashadi. Butun jarayon 2 daqiqadan ko\'p vaqt olmaydi.',
        },
        deviceCompatibility: {
          question: 'Qaysi qurilmalar eSIM ni qo\'llab-quvvatlaydi?',
          answer: 'Ko\'pgina zamonaviy smartfonlar eSIM ni qo\'llab-quvvatlaydi: iPhone XS va undan keyingi, Samsung Galaxy S20 va undan keyingi, Google Pixel 3 va undan keyingi, shuningdek Huawei, Oppo va boshqa ko\'plab modellar. Xarid qilishdan oldin qurilmangiz muvofiqligini tekshiring.',
        },
        canKeepNumber: {
          question: 'Raqamimni saqlash mumkinmi?',
          answer: 'Ha, siz eSIM ni oddiy SIM-kartangiz bilan birga ishlatishingiz mumkin. Asosiy raqamingiz qo\'ng\'iroqlar va SMS uchun faol bo\'lib qoladi, eSIM esa mobil internet uchun ishlatiladi.',
        },
        howMuchData: {
          question: 'Menga qancha ma\'lumot kerak?',
          answer: 'Bu sizning foydalanishingizga bog\'liq. Oddiy ijtimoiy tarmoqlar va xaritalarni ko\'rish uchun haftasiga 1-3 GB yetarli. Video qo\'ng\'iroqlar va streaming uchun 5-10 GB tavsiya qilamiz. Barcha paketlarimizni istalgan vaqtda to\'ldirish mumkin.',
        },
      },
    },
    countryPage: {
      title: 'eSIM tariflari',
      backButton: 'Tariflarga qaytish',
      banner: {
        title: 'Eng yaxshi eSIM ni toping',
        description: 'Sayohatingiz uchun ideal tarif rejasini tanlang. Tez faollashtirish, qulay narxlar.',
        days: 'kun',
      },
      filterLabel: 'Filtrlar',
      dataLabel: 'Ma\'lumot hajmi',
      durationLabel: 'Davr',
      allData: 'Barcha hajmlar',
      allDuration: 'Barcha davrlar',
      back: 'Ortga',
      filters: 'Filtrlar:',
      allDataOptions: 'Barcha ma\'lumotlar',
      allDurationOptions: 'Barcha muddatlar',
      showing: 'Ko\'rsatilgan',
      of: 'dan',
      noPlans: 'Tariflar topilmadi',
      noPlansDescription: 'Filtrlarni o\'zgartirib ko\'ring yoki keyinroq qaytib keling',
      resetFilters: 'Filtrlarni tiklash',
    },
    packagePage: {
      back: 'Ortga',
      esimFor: 'eSIM uchun',
      notFound: 'Paket topilmadi',
      notFoundDescription: 'Paket ma\'lumotlari mavjud emas',
      backToHome: 'Bosh sahifaga qaytish',
      details: {
        dataVolume: 'Ma\'lumot hajmi',
        validity: 'Amal qilish muddati',
        days: 'kun',
        networkType: 'Tarmoq turi',
        packageType: 'Paket turi',
        dataOnly: 'Faqat ma\'lumot',
        dataWithCalls: 'Ma\'lumot + Qo\'ng\'iroqlar/SMS',
      },
      provider: {
        title: 'Provayder ma\'lumotlari',
        operator: 'Operator',
        coverage: 'Qamrov',
        speed: 'Tezlik',
        allOperators: 'Barcha operatorlar:',
        notSpecified: 'Ko\'rsatilmagan',
      },
      installation: {
        title: 'O\'rnatish bo\'yicha ko\'rsatma',
        step: 'Qadam',
        step1: 'Xariddan keyin QR-kod "Mening eSIM" bo\'limida bo\'ladi',
        step2: 'Telefon sozlamalarini oching',
        step3: 'QR-kodni skanerlang',
        step4: 'eSIM profilini o\'rnating',
        step5: 'Faollashtiring va foydalanishni boshlang',
      },
      purchase: {
        packagePrice: 'Paket narxi',
        data: 'Ma\'lumot',
        period: 'Muddat',
        region: 'Mintaqa',
        buy: 'Sotib olish',
        ordering: 'Rasmiylashtirilmoqda...',
        instantDelivery: 'Darhol yetkazib berish',
      },
      loginModal: {
        title: 'Avtorizatsiya talab qilinadi',
        message: 'eSIM buyurtma qilish uchun hisobingizga kirish yoki ro\'yxatdan o\'tish kerak.',
        cancel: 'Bekor qilish',
        login: 'Kirish',
        signup: 'Ro\'yxatdan o\'tish',
      },
      successModal: {
        title: 'Buyurtma rasmiylashtirildi!',
        message: 'Sizning eSIM muvaffaqiyatli buyurtma qilindi! Faollashtirish uchun QR-kod bir necha daqiqadan keyin "Mening eSIM" bo\'limida mavjud bo\'ladi.',
        info: 'Qayta ishlash 1-2 daqiqa davom etadi. Shundan keyin siz shaxsiy kabinetingizda QR-kodni ko\'rishingiz va yuklab olishingiz mumkin.',
        close: 'Yopish',
        goToProfile: 'Profilga o\'tish',
      },
      errorModal: {
        title: 'Buyurtma xatosi',
        ok: 'Tushunarli',
      },
    },
    plansPage: {
      title: 'Barcha tarif rejalar',
      subtitle: 'Sayohatingiz uchun ideal eSIM paketini toping',
      filters: {
        title: 'Filtrlar',
        country: 'Mamlakat',
        countryPlaceholder: 'Mamlakatni tanlang',
        duration: 'Davomiyligi (kunlar)',
        durationPlaceholder: 'Minimum kunlar',
        dataVolume: 'Ma\'lumot hajmi (GB)',
        dataPlaceholder: 'Minimum GB',
        priceRange: 'Narx oralig\'i',
        minPrice: 'Min. narx',
        maxPrice: 'Maks. narx',
        searchButton: 'Qidirish',
        resetButton: 'Tozalash',
        allCountries: 'Barcha mamlakatlar',
      },
      table: {
        country: 'Mamlakat',
        packageName: 'Paket nomi',
        data: 'Ma\'lumot',
        duration: 'Davomiyligi',
        price: 'Narx',
        action: 'Harakat',
        buy: 'Sotib olish',
      },
      results: {
        showing: 'Ko\'rsatilgan',
        of: 'dan',
        packages: 'paketlar',
        noResults: 'Paketlar topilmadi',
        noResultsDescription: 'Filtrlarni o\'zgartirishga yoki boshqa mamlakatni tanlashga harakat qiling',
        selectCountry: 'Qidirish uchun mamlakatni tanlang',
        selectCountryDescription: 'eSIM paketlarini qidirish uchun yuqoridagi filtrlardan foydalaning',
      },
      loading: 'Paketlar yuklanmoqda...',
      error: 'Yuklash xatosi',
      errorDescription: 'Paketlarni yuklash amalga oshmadi. Qayta urinib ko\'ring.',
    },
    auth: {
      fields: {
        firstName: 'Ism',
        lastName: 'Familiya',
        phone: 'Telefon',
        email: 'Elektron pochta',
        password: 'Parol',
        confirmPassword: 'Parolni tasdiqlang',
      },
      placeholders: {
        firstName: 'Ismingizni kiriting',
        lastName: 'Familiyangizni kiriting',
        phone: 'XX XXX XX XX',
        email: 'example@mail.com',
        password: 'Kamida 6 belgi',
        confirmPassword: 'Parolni takrorlang',
      },
      errors: {
        firstNameRequired: 'Ism majburiy',
        lastNameRequired: 'Familiya majburiy',
        phoneRequired: 'Telefon majburiy',
        phoneInvalid: 'Noto\'g\'ri format (9 ta raqam bo\'lishi kerak)',
        emailRequired: 'Email majburiy',
        emailInvalid: 'Noto\'g\'ri email format',
        passwordRequired: 'Parol majburiy',
        passwordTooShort: 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak',
        passwordMismatch: 'Parollar mos kelmaydi',
        signupFailed: 'Ro\'yxatdan o\'tish xatosi',
        loginFailed: 'Kirish xatosi',
        verificationFailed: 'Tasdiqlash xatosi',
        invalidPin: '8 raqamli kodni kiriting',
      },
      signup: {
        title: 'Ro\'yxatdan o\'tish',
        subtitle: 'Davom etish uchun hisob yarating',
        button: 'Ro\'yxatdan o\'tish',
        haveAccount: 'Hisobingiz bormi?',
        loginLink: 'Kirish',
        verificationSent: 'Kod yuborildi',
        checkEmail: 'Pochtangizni tekshiring va tasdiqlash kodini kiriting',
        success: 'Xush kelibsiz!',
      },
      login: {
        title: 'Kirish',
        subtitle: 'Hisobingizga kiring',
        button: 'Kirish',
        noAccount: 'Hisobingiz yo\'qmi?',
        signupLink: 'Ro\'yxatdan o\'tish',
        success: 'Siz tizimga kirdingiz',
      },
      verification: {
        title: 'Email tasdiqlash',
        description: 'Pochtangizga yuborilgan 8 raqamli kodni kiriting',
        button: 'Tasdiqlash',
      },
    },
    myPage: {
      title: 'Mening sahifam',
      name: 'Ism',
      phone: 'Telefon',
      tabs: {
        profile: 'Profil',
        myEsims: 'Mening eSIM',
      },
      profile: {
        title: 'Shaxsiy ma\'lumotlar',
        firstName: 'Ism',
        lastName: 'Familiya',
        notSpecified: 'Ko\'rsatilmagan',
      },
      stats: {
        title: 'Statistika',
        totalOrders: 'Jami buyurtmalar',
        activeEsims: 'Faol eSIM',
      },
      orders: {
        title: 'Mening buyurtmalarim',
        refresh: 'Yangilash',
        loading: 'Buyurtmalar yuklanmoqda...',
        orderNumber: 'Buyurtma',
        data: 'Ma\'lumot',
        validity: 'Muddat',
        days: 'kun',
        until: 'gacha',
        region: 'Mintaqa',
        date: 'Sana',
        price: 'Narx',
        dataUsed: 'Ishlatilgan ma\'lumot',
        dataRemaining: 'qoldi',
        percentUsed: 'ishlatilgan',
      },
      actions: {
        showQr: 'QR-kodni ko\'rsatish',
        cancelEsim: 'eSIM ni bekor qilish',
        checkStatus: 'Holatni tekshirish',
        checking: 'Tekshirilmoqda...',
        cancelling: 'Bekor qilinmoqda...',
      },
      status: {
        processing: 'eSIM qayta ishlanmoqda. Bu bir necha daqiqa davom etishi mumkin.',
        error: 'Buyurtmani qayta ishlashda xatolik yuz berdi',
      },
      empty: {
        title: 'Sizda hali buyurtmalar yo\'q',
        description: 'Mos eSIM paketini tanlang va birinchi buyurtmani joylashtiring',
        button: 'eSIM tanlash',
      },
      qrModal: {
        title: 'Faollashtirish uchun QR-kod',
        warning: 'Muhim ma\'lumot',
        warningText1: '• Bu QR-kodni boshqalar bilan baham ko\'rmang - ular sizning eSIM ni osongina o\'rnatishlari mumkin',
        warningText2: '• eSIM faollashtirilgandan keyin uni bekor qilish yoki qaytarish mumkin emas',
        activationCode: 'Faollashtirish kodi:',
        openLink: 'Faollashtirish havolasini ochish',
        smdpAddress: 'SM-DP+ manzil:',
        instructions: 'Telefon sozlamalarini oching, "Uyali aloqa" bo\'limiga o\'ting va QR-kodni skanerlang yoki yuqoridagi faollashtirish havolasidan foydalanib eSIM ni o\'rnating.',
        share: 'Ulashish',
        close: 'Yopish',
      },
      cancelModal: {
        title: 'eSIM ni bekor qilish?',
        message: 'Siz bu eSIM ni bekor qilmoqchimisiz? Bu harakatni bekor qilib bo\'lmaydi.',
        package: 'Paket:',
        order: 'Buyurtma:',
        warning: 'eSIM ni faqat u qurilmaga o\'rnatilmagan bo\'lsa bekor qilish mumkin.',
        cancel: 'Bekor qilish',
        confirm: 'Ha, bekor qilish',
      },
      cancelSuccess: {
        title: 'eSIM bekor qilindi',
        message: 'eSIM muvaffaqiyatli bekor qilindi. Narx balansga qaytarildi.',
        info: 'Mablag\'lar bir necha daqiqa ichida balansga o\'tkaziladi.',
        ok: 'Tushunarli',
      },
    },
    esimStatus: {
      // Order statuses
      PENDING: 'Ishlov berilmoqda',
      PROCESSING: 'Qayta ishlanmoqda',
      ALLOCATED: 'Faollashtirishga tayyor',
      FAILED: 'Xato',
      CANCELLED: 'Bekor qilindi',
      // eSIM statuses (esimStatus field)
      GOT_RESOURCE_RELEASED: 'Faollashtirishga tayyor',
      GOT_RESOURCE_INSTALLED: 'O\'rnatildi',
      IN_USE: 'Ishlatilmoqda',
      USED_UP: 'Tugadi',
      USED_EXPIRED: 'Muddati tugadi',
      CANCEL: 'Bekor qilindi',
      DELETED: 'O\'chirildi',
    },
    footer: {
      description: 'Mobil aloqa dunyosida ishonchli hamkoringiz. eSIM yechimlarimiz bilan chegara siz sayohat qiling.',
      quickLinks: 'Tezkor havolalar',
      legal: 'Huquqiy ma\'lumot',
      privacy: 'Maxfiylik',
      terms: 'Foydalanish shartlari',
      copyright: 'Barcha huquqlar himoyalangan.',
      madeWith: 'Sayohatchilar uchun ❤️ bilan yaratildi',
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

export const getCountryName = (countryCode, lang = DEFAULT_LANGUAGE) => {
  try {
    // Validate inputs
    if (!countryCode) {
      console.warn('getCountryName: Missing countryCode parameter');
      return '';
    }

    // Get the language-specific country translations, fallback to default language
    const langCountries = COUNTRY_TRANSLATIONS[lang] || COUNTRY_TRANSLATIONS[DEFAULT_LANGUAGE];

    if (!langCountries) {
      console.warn(`getCountryName: No country translations found for language "${lang}"`);
      return countryCode;
    }

    // Get the country name
    const countryName = langCountries[countryCode];

    if (!countryName) {
      console.warn(`getCountryName: Country code "${countryCode}" not found for language "${lang}"`);
      return countryCode;
    }

    return countryName;
  } catch (error) {
    console.error('getCountryName error:', error);
    return countryCode;
  }
};