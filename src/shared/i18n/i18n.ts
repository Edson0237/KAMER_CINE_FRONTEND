import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import fr from '@/locales/fr/common.json';
import en from '@/locales/en/common.json';

const STORAGE_KEY = 'kct_lang';

function initialLanguage(): 'fr' | 'en' {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'fr';
  } catch {
    return 'fr';
  }
}

/**
 * Initialisation i18next (§6.12) — français par défaut (langue
 * obligatoire), anglais en repli explicite ; le choix de l'utilisateur est
 * mémorisé. Ossature (menus, en-tête) et connexion déjà traduits ; les
 * écrans métier sont migrés progressivement : tout texte nouveau doit
 * passer par les fichiers `locales/{fr,en}/common.json`.
 */
void i18n
  .use(initReactI18next)
  .init({
    resources: {
      fr: { common: fr },
      en: { common: en },
    },
    lng: initialLanguage(),
    fallbackLng: 'fr',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
  });

i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
  try {
    localStorage.setItem(STORAGE_KEY, lng);
  } catch {
    /* stockage indisponible : le choix vaut pour la session */
  }
});

export default i18n;
