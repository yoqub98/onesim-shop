// src/pages/legal/PrivacyPolicy.jsx
import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';
import LegalLayout from '../../components/legal/LegalLayout';

// =============================================================================
// PLACEHOLDER VALUES - Update these when information becomes available
// =============================================================================
const PLACEHOLDERS = {
  // Company Information
  COMPANY_NAME: 'ONETECH PRO LLC',
  COMPANY_REGISTRATION_STATUS: '(после регистрации)',
  COMPANY_REQUISITES: 'XXXX',            // TODO: Add company requisites after registration
  COMPANY_ADDRESS: 'XXXX',               // TODO: Add legal address after registration

  // Contact Information
  CONTACT_EMAIL: 'XXXX',                 // TODO: Add contact email
  CONTACT_PHONE: 'XXXX',                 // TODO: Add contact phone

  // Website
  WEBSITE_DOMAIN: '[домен сайта]',       // TODO: Add website domain

  // Policy effective date
  EFFECTIVE_DATE: '«XX» XX 2026 г.',     // TODO: Update effective date
  LAST_UPDATED: '18 января 2026 г.',
};
// =============================================================================

const PrivacyPolicy = () => {
  const tableOfContents = [
    { id: 'intro', title: 'Введение' },
    { id: 'terms', title: '1. Термины и определения' },
    { id: 'operator', title: '2. Оператор данных' },
    { id: 'data-collect', title: '3. Сбор и категории обрабатываемых данных' },
    { id: 'data-purpose', title: '4. Цели обработки персональных данных' },
    { id: 'legal-basis', title: '5. Правовые основания обработки' },
    { id: 'data-storage', title: '6. Условия и сроки хранения' },
    { id: 'data-sharing', title: '7. Передача данных третьим сторонам' },
    { id: 'cookies', title: '8. Cookies и аналогичные технологии' },
    { id: 'user-rights', title: '9. Права субъектов данных' },
    { id: 'security', title: '10. Безопасность данных' },
    { id: 'changes', title: '11. Изменения в Политике' },
    { id: 'contacts', title: '12. Контактная информация' },
  ];

  return (
    <LegalLayout
      title="Политика конфиденциальности (Privacy Policy)"
      lastUpdated={PLACEHOLDERS.LAST_UPDATED}
      tableOfContents={tableOfContents}
    >
      {/* Введение */}
      <Box id="intro">
        <Text fontWeight="600" mb={2}>
          Дата вступления в силу: {PLACEHOLDERS.EFFECTIVE_DATE}
        </Text>
        <Text>
          Настоящая Политика конфиденциальности (далее — «Политика») определяет порядок
          обработки и защиты персональных данных пользователей, использующих
          интернет-платформу по продаже eSIM-планов, расположенную по адресу{' '}
          <strong>{PLACEHOLDERS.WEBSITE_DOMAIN}</strong> (далее — «Платформа»).
        </Text>
        <Text>
          Использование Платформы означает, что вы выражаете своё согласие с условиями
          настоящей Политики.
        </Text>
      </Box>

      {/* 1. Термины и определения */}
      <Box id="terms">
        <Heading as="h2">1. Термины и определения</Heading>
        <Text>
          <strong>Персональные данные</strong> — любая информация, относящаяся к прямо или косвенно
          определённому или определяемому физическому лицу (в соответствии с Законом
          Республики Узбекистан «О персональных данных»).
        </Text>
        <Text>
          <strong>Пользователь</strong> — физическое лицо, использующее Платформу.
        </Text>
        <Text>
          <strong>Оператор данных</strong> — юридическое лицо, осуществляющее обработку персональных
          данных.
        </Text>
      </Box>

      {/* 2. Оператор данных */}
      <Box id="operator">
        <Heading as="h2">2. Оператор данных</Heading>
        <Text>Оператором персональных данных является:</Text>
        <Text>
          <strong>{PLACEHOLDERS.COMPANY_NAME}</strong> {PLACEHOLDERS.COMPANY_REGISTRATION_STATUS}
        </Text>
        <Text>Реквизиты: {PLACEHOLDERS.COMPANY_REQUISITES}</Text>
        <Text>Email: {PLACEHOLDERS.CONTACT_EMAIL}</Text>
        <Text>Телефон: {PLACEHOLDERS.CONTACT_PHONE}</Text>
      </Box>

      {/* 3. Сбор и категории обрабатываемых данных */}
      <Box id="data-collect">
        <Heading as="h2">3. Сбор и категории обрабатываемых данных</Heading>
        <Text>
          В рамках исполнения договорных и технических обязательств Платформа обрабатывает
          следующие категории данных:
        </Text>

        <Heading as="h3">3.1. Регистрационные данные</Heading>
        <ul>
          <li>адрес электронной почты (email)</li>
          <li>имя (вводится вручную или получено от Google Sign-In)</li>
        </ul>

        <Heading as="h3">3.2. Учетные данные</Heading>
        <ul>
          <li>пароль (хранится в зашифрованном виде)</li>
        </ul>

        <Heading as="h3">3.3. Технические данные</Heading>
        <ul>
          <li>IP-адрес</li>
          <li>история активации eSIM</li>
          <li>тип устройства, версия ОС</li>
          <li>технические логи (для диагностики)</li>
        </ul>

        <Heading as="h3">3.4. Cookie и аналитические данные</Heading>
        <ul>
          <li>cookie файловые идентификаторы</li>
          <li>агрегированные данные Google Analytics (без идентификации личности)</li>
        </ul>

        <Heading as="h3">3.5. Платёжные данные</Heading>
        <Text>
          Платёжные данные <strong>не обрабатываются</strong> и <strong>не хранятся</strong> на серверах Платформы.
          Они обрабатываются сторонними платёжными системами (Click, Payme, Atmos и др.).
        </Text>
      </Box>

      {/* 4. Цели обработки персональных данных */}
      <Box id="data-purpose">
        <Heading as="h2">4. Цели обработки персональных данных</Heading>
        <Text>Персональные данные обрабатываются в следующих целях:</Text>

        <Heading as="h3">4.1. Исполнение договорных обязательств:</Heading>
        <ul>
          <li>регистрация и аутентификация пользователей;</li>
          <li>оформление и обработка заказов;</li>
          <li>обеспечение доступа к приобретённым услугам;</li>
          <li>уведомления по заказам.</li>
        </ul>

        <Heading as="h3">4.2. Обеспечение безопасности:</Heading>
        <ul>
          <li>защита от несанкционированного доступа;</li>
          <li>выявление и предотвращение мошенничества.</li>
        </ul>

        <Heading as="h3">4.3. Аналитика и улучшение сервиса:</Heading>
        <ul>
          <li>понимание поведения пользователей;</li>
          <li>улучшение интерфейса и функциональности.</li>
        </ul>

        <Heading as="h3">4.4. Технические нужды:</Heading>
        <ul>
          <li>ведение логов для диагностики;</li>
          <li>поддержка и развитие Платформы.</li>
        </ul>
      </Box>

      {/* 5. Правовые основания обработки */}
      <Box id="legal-basis">
        <Heading as="h2">5. Правовые основания обработки</Heading>
        <Text>Обработка персональных данных осуществляется на основании:</Text>
        <Text>
          <strong>5.1.</strong> Заключения, исполнения и прекращения договора между Пользователем и
          Оператором.
        </Text>
        <Text>
          <strong>5.2.</strong> Требований действующего законодательства Республики Узбекистан о защите
          персональных данных.
        </Text>
        <Text>
          <strong>5.3.</strong> Согласия Пользователя на обработку его персональных данных при регистрации.
        </Text>
      </Box>

      {/* 6. Условия и сроки хранения */}
      <Box id="data-storage">
        <Heading as="h2">6. Условия и сроки хранения</Heading>
        <Text>
          <strong>6.1.</strong> Данные хранятся в зашифрованном виде на серверах, расположенных в
          инфраструктуре облачных провайдеров.
        </Text>
        <Text>
          <strong>6.2.</strong> Срок хранения данных составляет не менее, чем требуется для выполнения
          обязательств перед пользователем, а также в соответствии с законодательством
          Республики Узбекистан.
        </Text>
        <Text>
          <strong>6.3.</strong> После истечения сроков хранения данные подлежат удалению или обезличиванию.
        </Text>
      </Box>

      {/* 7. Передача данных третьим сторонам */}
      <Box id="data-sharing">
        <Heading as="h2">7. Передача данных третьим сторонам</Heading>
        <Text>
          <strong>7.1.</strong> Для исполнения обязательств перед Пользователем персональные данные могут
          быть переданы:
        </Text>
        <ul>
          <li>платёжным системам (для обработки транзакций);</li>
          <li>сервисам аналитики (агрегированные данные);</li>
          <li>государственным органам в случаях, предусмотренных законом.</li>
        </ul>
        <Text>
          <strong>7.2.</strong> Платёжные данные (номер карты, CVV и т. п.) <strong>не передаются</strong> Оператору и{' '}
          <strong>не хранятся</strong> на серверах Платформы.
        </Text>
      </Box>

      {/* 8. Cookies и аналогичные технологии */}
      <Box id="cookies">
        <Heading as="h2">8. Cookies и аналогичные технологии</Heading>
        <Text>
          <strong>8.1.</strong> Сайт использует cookie для обеспечения функционирования Платформы и аналитики.
        </Text>
        <Text>
          <strong>8.2.</strong> Cookie можно отключить через настройки браузера, но это может ограничить
          функциональность Платформы.
        </Text>
        <Text>
          <strong>8.3.</strong> Используются исключительно:
        </Text>
        <ul>
          <li>строго необходимые cookie;</li>
          <li>аналитические cookie (Google Analytics и др.).</li>
        </ul>
      </Box>

      {/* 9. Права субъектов данных */}
      <Box id="user-rights">
        <Heading as="h2">9. Права субъектов данных</Heading>
        <Text>Пользователь имеет право:</Text>
        <Text>
          <strong>9.1.</strong> Получить подтверждение факта обработки своих данных.
        </Text>
        <Text>
          <strong>9.2.</strong> Запросить доступ к своим персональным данным.
        </Text>
        <Text>
          <strong>9.3.</strong> Потребовать исправления неточных данных.
        </Text>
        <Text>
          <strong>9.4.</strong> Потребовать удаления данных, если иное не требуется по закону.
        </Text>
        <Text>
          <strong>9.5.</strong> Ограничить обработку данных.
        </Text>
        <Text>
          <strong>9.6.</strong> Отозвать согласие на обработку в любой момент (если это не нарушает исполнение
          договора).
        </Text>
        <Text mt={4}>
          Запросы на реализацию прав направляются по email: <strong>{PLACEHOLDERS.CONTACT_EMAIL}</strong>.
          Ответ будет предоставлен в срок, предусмотренный законом.
        </Text>
      </Box>

      {/* 10. Безопасность данных */}
      <Box id="security">
        <Heading as="h2">10. Безопасность данных</Heading>
        <Text>
          Оператор применяет технические и организационные меры для защиты данных:
        </Text>
        <ul>
          <li>шифрование при передаче и хранении;</li>
          <li>разграничение доступа;</li>
          <li>регулярные аудиты безопасности.</li>
        </ul>
      </Box>

      {/* 11. Изменения в Политике */}
      <Box id="changes">
        <Heading as="h2">11. Изменения в Политике</Heading>
        <Text>
          <strong>11.1.</strong> Оператор вправе изменять Политику в одностороннем порядке.
        </Text>
        <Text>
          <strong>11.2.</strong> Новая редакция вступает в силу с момента публикации на Платформе.
        </Text>
        <Text>
          <strong>11.3.</strong> Продолжение использования после изменений означает согласие с обновлённой
          Политикой.
        </Text>
      </Box>

      {/* 12. Контактная информация */}
      <Box id="contacts">
        <Heading as="h2">12. Контактная информация</Heading>
        <Text>
          По всем вопросам обработки персональных данных обращайтесь:
        </Text>
        <Text mt={3}>
          <strong>Email:</strong> {PLACEHOLDERS.CONTACT_EMAIL}
        </Text>
        <Text>
          <strong>Юридическое лицо:</strong> {PLACEHOLDERS.COMPANY_NAME} {PLACEHOLDERS.COMPANY_REGISTRATION_STATUS}
        </Text>
        <Text>
          <strong>Адрес:</strong> {PLACEHOLDERS.COMPANY_ADDRESS}
        </Text>
      </Box>
    </LegalLayout>
  );
};

export default PrivacyPolicy;
