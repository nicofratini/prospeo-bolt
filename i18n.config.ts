import en from './i18n/locales/en.json';
import fr from './i18n/locales/fr.json';

export default defineI18nConfig(() => ({
  legacy: false,
  globalInjection: true,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en,
    fr,
  },
  numberFormats: {
    en: {
      currency: {
        style: 'currency',
      },
    },
    fr: {
      currency: {
        style: 'currency',
      },
    },
  },
}));
