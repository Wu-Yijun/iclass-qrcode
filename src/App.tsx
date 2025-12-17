import React, { useEffect, useRef, useState } from "react";
import QRCodeCard, {
  QRCodeOnly,
  SaveActions,
} from "./components/QRCodeDisplay";
import EditView from "./components/EditView";
import TagList from "./components/TagList";
import { SavedItem, ViewState } from "./types";
import {
  decodeShareData,
  HOME_PAGE,
  trimId,
  loadFromLocalStorage,
  saveToLocalStorage,
  scanQRCodeFromFile,
} from "./utils";
import { Camera, Github, Languages, Link, QrCode, Save, Settings, Upload } from "lucide-react";
import { useLanguage } from "./contexts/LanguageContext";

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>("MAIN");
  const [currentId, setCurrentId_raw] = useState<string>("");
  const setCurrentId = (id: string) => setCurrentId_raw(trimId(id));
  const [items, setItems] = useState<SavedItem[]>([]);
  const [tempLabel, setTempLabel] = useState("");
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraCaptureRef = useRef<HTMLInputElement>(null);

  const [availableQrSize, setAvailableQrSize] = useState(220);
  const qrCodeRef = useRef<HTMLDivElement>(null);

  const { t, language, setLanguage } = useLanguage();

  useEffect(() => {
    const loaded = loadFromLocalStorage();
    setItems(loaded);

    const params = new URLSearchParams(window.location.search);
    const idParam = params.get("id");
    const shareParam = params.get("share");

    if (shareParam) {
      const sharedItems = decodeShareData(shareParam);
      if (sharedItems.length > 0) {
        const merged = [...loaded];
        sharedItems.forEach((shareItem) => {
          if (!merged.find((m) => m.id === shareItem.id)) {
            merged.push(shareItem);
          }
        });
        setItems(merged);
        saveToLocalStorage(merged);
        window.history.replaceState({}, "", window.location.pathname);
        alert(t("imported_tags_success_1") + sharedItems.length + t("imported_tags_success_2"));
      }
    }

    const handleResize = () => {
      if (qrCodeRef.current !== null) {
        const min = Math.min(
          qrCodeRef.current.clientHeight,
          qrCodeRef.current.clientWidth,
          400,
        );
        setAvailableQrSize(Math.max(100, min - 10));
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();

    if (idParam) {
      setCurrentId(idParam);
    }
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleUpdateItems = (newItems: SavedItem[]) => {
    setItems(newItems);
    saveToLocalStorage(newItems);
  };

  const handleManualIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentId(e.target.value);
    setShowSavePrompt(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const id = await scanQRCodeFromFile(e.target.files[0]);
      if (id) {
        setCurrentId(id);
      } else {
        alert("Could not decode QR code.");
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const triggerCameraCapture = ()=>{
    cameraCaptureRef.current?.click();
  }

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const saveCurrentId = () => {
    if (!currentId) return;
    if (!items.find((i) => i.id === currentId)) {
      setTempLabel("");
      setShowSavePrompt(true);
    } else {
      alert("ID already saved.");
    }
  };

  const confirmSave = () => {
    if (!tempLabel) return;
    const newItem: SavedItem = {
      id: currentId,
      label: tempLabel,
      timestamp: Date.now(),
    };
    const updated = [...items, newItem];
    handleUpdateItems(updated);
    setShowSavePrompt(false);
  };

  const shareCurrentId = () => {
    if (!currentId) return;
    const url =
      `${window.location.origin}${window.location.pathname}?id=${currentId}`;
    navigator.clipboard.writeText(url).then(() => {
      alert(t("link_copied"));
    });
  };

  if (view === "EDIT") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <EditView
          items={items}
          onUpdate={handleUpdateItems}
          onBack={() => setView("MAIN")}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col items-center overflow-x-hidden">
      {/* Header - Fixed in Wide Mode */}
      <div className="w-full wide:fixed wide:top-0 wide:z-20 wide:bg-gray-50/90 wide:backdrop-blur-sm wide:border-b wide:border-gray-200">
        <header className="w-full max-w-md wide:max-w-7xl mx-auto flex justify-between items-center px-4 py-4 wide:py-2 wide:justify-center relative">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 lg:w-9 lg:h-9 bg-brand-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-brand-200">
              <QrCode size={20} />
            </div>
            <div>
              <h1 className="text-lg lg:text-xl font-bold leading-tight">
                {t("app_title")}
              </h1>
              <p className="text-[10px] lg:text-xs text-gray-500 uppercase tracking-wide">
                {t("app_sub_title")}
              </p>
            </div>
          </div>
          {/* Settings button absolute right in wide mode */}
          <div className="wide:absolute wide:right-4 flex flex-row gap-1 wide:gap-3">
            <button
              onClick={(e) => {
                if (e.ctrlKey) {
                  window.open(HOME_PAGE, "_blank");
                } else {
                  window.location.href = HOME_PAGE;
                }
              }}
              title={t("jump_to_github")}
              className="p-2 bg-white text-gray-600 rounded-lg hover:bg-gray-100 border border-gray-200 shadow-sm transition-all active:scale-95"
            >
              <Github size={18} />
            </button>
            <button
              onClick={() => setLanguage(language === "en" ? "zh" : "en")}
              title={t(language === "en" ? "switch_zh" : "switch_en")}
              className="p-2 bg-white text-gray-600 rounded-lg hover:bg-gray-100 border border-gray-200 shadow-sm transition-all active:scale-95"
            >
              <Languages size={18} />
            </button>
            <button
              onClick={() => setView("EDIT")}
              title={t("enter_manage_tags")}
              className="p-2 bg-white text-gray-600 rounded-lg hover:bg-gray-100 border border-gray-200 shadow-sm transition-all active:scale-95"
            >
              <Settings size={18} />
            </button>
          </div>
        </header>
      </div>

      {/* Main Layout Container */}
      <div className="flex flex-col w-full max-w-md wide:max-w-none wide:flex wide:flex-row wide:justify-center wide:h-screen wide:pt-16 wide:px-8 wide:gap-12 flex-1">
        {/* Left Column: Inputs & Tags */}
        <div className="flex flex-col flex-1 w-full wide:w-1/2 wide:max-w-sm wide:py-4 px-4 wide:px-0 wide:justify-center">
          {/* Inputs */}
          <div className="mb-6">
            <div className="relative group">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={currentId}
                onChange={handleManualIdChange}
                placeholder={t("input_placeholder")}
                className="w-full pl-3 pr-24 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-4 focus:ring-brand-100 focus:border-brand-500 outline-none text-base font-mono transition-all"
              />
              <div className="absolute right-1.5 top-1.5 bottom-1.5 flex items-center space-x-1">
                <button
                  onClick={triggerCameraCapture}
                  className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
                  title={t("camera_cap")}
                >
                  <Camera size={18} />
                </button>
                <button
                  onClick={triggerFileUpload}
                  className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
                  title={t("upload_qr")}
                >
                  <Upload size={18} />
                </button>
                {currentId && (
                  <button
                    onClick={shareCurrentId}
                    className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
                    title={t("share_link")}
                  >
                    <Link size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex justify-between items-center">
              {currentId && !items.find((i) => i.id === currentId) &&
                !showSavePrompt && (
                  <button
                    onClick={saveCurrentId}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 bg-brand-50 px-2.5 py-1 rounded-full transition-colors"
                  >
                    <Save size={12} /> {t("save_id")}
                  </button>
                )}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
              />
              {/* capture="environment" 强制调用后置摄像头，capture="user" 调用前置 */}
              <input 
                type="file"
                ref={cameraCaptureRef} 
                className="hidden"
                accept="image/*" 
                capture="environment" 
                onChange={handleFileUpload} 
              />
            </div>

            {/* Inline Save Prompt */}
            {showSavePrompt && (
              <div className="mt-2 p-2 bg-white rounded-lg border border-brand-200 shadow-sm animate-fade-in flex items-center gap-2">
                <input
                  type="text"
                  autoFocus
                  placeholder={t("tag_name_placeholder")}
                  value={tempLabel}
                  onChange={(e) => setTempLabel(e.target.value)}
                  className="flex-1 text-sm outline-none border-none p-1"
                  onKeyDown={(e) => e.key === "Enter" && confirmSave()}
                />
                <button
                  onClick={confirmSave}
                  className="bg-brand-600 text-white p-1 rounded-md hover:bg-brand-700"
                >
                  <Save size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="mb-6 lg:mb-0">
            <TagList
              items={items}
              currentId={currentId}
              onSelect={(id) => setCurrentId(id)}
            />
          </div>

          {/* --- Mobile Only: Combined QR Card --- */}
          <div className="wide:hidden">
            {currentId
              ? <QRCodeCard id={currentId} />
              : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 opacity-50 mb-12 py-12">
                  <QrCode size={64} className="mb-4 text-gray-300" />
                  <p className="text-sm">{t("enter_id_to_generate")}</p>
                </div>
              )}
          </div>

          {/* --- Wide Mode Only: Save Actions Sunk to Bottom --- */}
          {currentId && (
            <div className="wide:block">
              <SaveActions id={currentId} />
            </div>
          )}
        </div>

        {/* --- Wide Mode Only: Right Column QR Display --- */}
        <div
          ref={qrCodeRef}
          className="hidden my-10 wide:flex wide:w-2/5 wide:items-center wide:justify-center"
        >
          {currentId
            ? (
              <div className="h-0">
                <div className="translate-y-[-50%]">
                  <QRCodeOnly id={currentId} size={availableQrSize} />
                </div>
              </div>
            )
            : (
              <div className="w-full h-full max-h-[400px] max-w-[400px] bg-white rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-300">
                <QrCode size={64} className="mb-3 opacity-50" />
                <p className="text-base font-medium opacity-75">
                  {t("waiting_for_id")}
                </p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default App;
