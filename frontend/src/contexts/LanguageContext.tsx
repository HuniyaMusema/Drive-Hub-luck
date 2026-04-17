import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useSettings } from "@/hooks/useSettings";
import { useAuth } from "./AuthContext";
import { apiFetch } from "@/services/api";

import en from "../i18n/en.json";
import am from "../i18n/am.json";
import om from "../i18n/om.json";

export type Language = "en" | "am" | "om";

interface LanguageOption {
  code: Language;
  label: string;
  nativeLabel: string;
}

export const languages: LanguageOption[] = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "am", label: "Amharic", nativeLabel: "አማርኛ" },
  { code: "om", label: "Afaan Oromoo", nativeLabel: "Afaan Oromoo" },
];

const translations: any = { en, am, om };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, replacements?: Record<string, any>) => string;
  formatDate: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("gech-lang");
    return (saved as Language) || "en";
  });

  const { settings } = useSettings();
  const { user, setUser } = useAuth();

  useEffect(() => {
    if (user?.language) {
      setLanguage(user.language as Language);
    } else {
      const saved = localStorage.getItem("gech-lang");
      const systemDefault = settings?.General?.defaultLanguage as Language;
      
      // Only force external settings if user hasn't made a choice yet
      if (systemDefault && !saved) {
        setLanguage(systemDefault);
      }
    }
  }, [user?.language, settings?.General?.defaultLanguage]);

  const handleSetLanguage = async (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("gech-lang", lang);
    if (user) {
      setUser({ ...user, language: lang });
      try {
        await apiFetch("/auth/language", {
          method: "PATCH",
          body: JSON.stringify({ language: lang }),
        });
      } catch (err) {
        console.error("Failed to sync language preference", err);
      }
    }
  };

  const t = (key: string, replacements?: Record<string, any>) => {
    const keys = key.split(".");
    let translation: any = translations[language];
    
    // Resolve hierarchical key (e.g., "auth.login.title")
    for (const k of keys) {
      translation = translation?.[k];
    }

    // Fallback to English if missing
    if (translation === undefined && language !== "en") {
      translation = translations.en;
      for (const k of keys) {
        translation = translation?.[k];
      }
    }

    // If still missing, return the key itself
    if (typeof translation !== "string") {
      if (import.meta.env.DEV) {
        console.warn(`[i18n] Missing translation for key: ${key}`);
      }
      return key;
    }

    // Handle interpolation (e.g., "Hello {name}")
    if (replacements) {
      Object.entries(replacements).forEach(([k, v]) => {
        translation = translation.replace(new RegExp(`{${k}}`, "g"), String(v));
      });
    }

    return translation;
  };

  const formatDate = (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => {
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return t("unknown");
      
      const localeMap: Record<Language, string> = {
        en: "en-US",
        am: "am-ET",
        om: "om-ET"
      };

      return d.toLocaleDateString(localeMap[language], options || { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (err) {
      return String(date);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t, formatDate }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
