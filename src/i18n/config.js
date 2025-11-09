import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import enTranslations from './locales/en.json'
import esTranslations from './locales/es.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations
      },
      es: {
        translation: esTranslations
      }
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'es'],
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false // Disable suspense to avoid eval issues
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
      convertDetectedLanguage: (lng) => {
        // Normalize language codes to 'en' or 'es'
        if (lng && lng.startsWith('es')) return 'es'
        if (lng && lng.startsWith('en')) return 'en'
        return 'en' // default fallback
      }
    }
  })

export default i18n

