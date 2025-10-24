"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { isLanguage, translate, type Language } from "@/lib/i18n";

type LanguageContextValue = {
  language: Language;
  setLanguage: (next: Language) => void;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined,
);

const STORAGE_KEY = "resumedrive:language";

function setDocumentLang(lang: Language) {
  if (typeof document !== "undefined") {
    document.documentElement.lang = lang;
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("id");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && isLanguage(stored)) {
        setLanguageState(stored);
        setDocumentLang(stored);
        return;
      }
    } catch {
      // Ignore storage failures and fall back to default
    }
    setDocumentLang("id");
  }, []);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    setDocumentLang(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore storage failures so the UI can still update language
    }
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
    }),
    [language, setLanguage],
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}

export function useTranslation() {
  const { language, setLanguage } = useLanguage();

  const t = useCallback(
    (
      key: string,
      params?: Record<string, string | number | null | undefined>,
    ) => translate(language, key, params),
    [language],
  );

  return {
    language,
    setLanguage,
    t,
  };
}

