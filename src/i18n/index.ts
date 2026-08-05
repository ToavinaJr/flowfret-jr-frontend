import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en/translation.json";
import fr from "./locales/fr/translation.json";

const resources = {
  en: { translation: en },
  fr: { translation: fr },
} as const;

const savedLanguage = typeof window !== "undefined" ? window.localStorage.getItem("fretflow-language") : null;
const savedTheme = typeof window !== "undefined" ? window.localStorage.getItem("fretflow-theme") : null;

void i18n.use(initReactI18next).init({
  resources,
  lng: savedLanguage || "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

if (typeof window !== "undefined" && savedTheme) {
  document.documentElement.classList.toggle("dark", savedTheme === "dark");
  document.documentElement.classList.toggle("light", savedTheme === "light");
}

export default i18n;
