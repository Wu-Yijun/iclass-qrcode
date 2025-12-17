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
    app_sub_title: "Sign-in Helper",
    switch_en: "Switch to English",
    switch_zh: "Switch to Chinese",
    // App Main
    input_placeholder: "Enter Course ID",
    camera_cap: "Open Camera to Capture",
    upload_qr: "Upload QR Image",
    share_link: "Share Link",
    save_id: "Save ID",
    save: "Save",
    tag_name_placeholder: "Tag Name",
    course_id_placeholder: "Course ID",
    enter_id_to_generate: "Enter an ID to generate",
    waiting_for_id: "Waiting for ID...",
    id_already_saved: "ID already saved.",
    could_not_decode: "Could not decode QR code.",
    imported_tags_success_1: "Imported ",
    imported_tags_success_2: " tags successfully.",
    link_copied: "Link copied to clipboard!",
    jump_to_github: "Jump to my Github Repo",
    enter_manage_tags: "Go for Manage Tags",
    // EditView
    manage_tags: "Manage Tags",
    share_all: "Share All",
    share_all_copied: "Share link copied to clipboard!",
    add_new_tag: "Add New Tag",
    no_saved_tags: "No saved tags. Add one above.",
    label: "Label",
    id: "ID",
    // QRCodeDisplay
    save_image: "Save Image",
    now: "Now",
    plus_5s: "+5s",
    plus_10s: "+10s",
    plus_30s: "+30s",
    plus_60s: "+60s",
    auto_refreshing: "Auto-refreshing (5s)",
  },
  zh: {
    // App
    app_title: "清新课堂二维码",
    app_sub_title: "线上签到助手",
    switch_en: "切换至英文",
    switch_zh: "切换至中文",
    // App Main
    input_placeholder: "请输入课程ID",
    camera_cap: "从相机拍摄",
    upload_qr: "上传二维码图片",
    share_link: "分享链接",
    save_id: "保存ID",
    save: "保存",
    tag_name_placeholder: "课程名称",
    course_id_placeholder: "课程ID",
    enter_id_to_generate: "输入ID以生成二维码",
    waiting_for_id: "等待输入ID...",
    id_already_saved: "该ID已保存。",
    could_not_decode: "无法识别二维码。",
    imported_tags_success_1: "成功导入",
    imported_tags_success_2: "个标签。",
    link_copied: "链接已复制到剪贴板！",
    jump_to_github: "进入我的 Github 主页",
    enter_manage_tags: "进入标签管理页面",
    // EditView
    manage_tags: "管理标签",
    share_all: "分享全部",
    share_all_copied: "分享链接已复制到剪贴板！",
    add_new_tag: "添加新标签",
    no_saved_tags: "暂无已保存标签，请先添加。",
    label: "标签",
    id: "ID",
    // QRCodeDisplay
    save_image: "保存图片",
    now: "现在",
    plus_5s: "+5秒",
    plus_10s: "+10秒",
    plus_30s: "+30秒",
    plus_60s: "+60秒",
    auto_refreshing: "自动刷新（5秒）",
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
