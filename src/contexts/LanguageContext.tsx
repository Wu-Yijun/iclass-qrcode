import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export type Language = "en" | "zh";
type Translations = {
  [key in Language]: {
    [key: string]: string;
  };
};


const TRANSLATIONS = {
  en: {
    // App
    app_title: "iClass QR",
    switch_en: "Switch to English",
    switch_zh: "Switch to Chinese",
    app_sub_title: "Sign-in Helper",
  },
  zh: {
    // App
    app_title: "清新课堂二维码",
    switch_en: "切换至英文",
    switch_zh: "切换至中文",
    app_sub_title: "线上签到助手",
  },
} as const satisfies Translations;

const translations: Translations = TRANSLATIONS;
export type TransKey = keyof typeof TRANSLATIONS[Language];

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TransKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export const LanguageProvider: React.FC<{ children: ReactNode }> = (
  { children },
) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("app_language");
    return (saved === "en" || saved === "zh") ? saved : "en";
  });

  useEffect(() => {
    localStorage.setItem("app_language", language);
  }, [language]);

  const t = (key: TransKey): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
