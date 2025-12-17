import React, { useEffect, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { generateUrl, isUUID } from "../utils";
import { Clock, Download } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

interface CommonProps {
  id: string;
}

// Logic hook for download
const useDownloadLogic = (id: string) => {
  const [downloadOffset, setDownloadOffset] = useState<number | null>(null);
  const hiddenCanvasRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (downloadOffset !== null && hiddenCanvasRef.current) {
      const timer = setTimeout(() => {
        const canvas = hiddenCanvasRef.current?.querySelector("canvas");
        if (canvas) {
          const url = canvas.toDataURL("image/png");
          const link = document.createElement("a");
          link.download = `iclass_${id}_${downloadOffset}s.png`;
          link.href = url;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        setDownloadOffset(null);
        setIsDownloading(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [downloadOffset, id]);

  return {
    downloadOffset,
    hiddenCanvasRef,
    isDownloading,
    setDownloadOffset,
    setIsDownloading,
  };
};

// --- Sub Components ---

export const SaveActions: React.FC<CommonProps> = ({ id }) => {
  const {
    downloadOffset,
    hiddenCanvasRef,
    isDownloading,
    setDownloadOffset,
    setIsDownloading,
  } = useDownloadLogic(id);
  const { t } = useLanguage();
  const futureUrl = downloadOffset !== null
    ? generateUrl(id, downloadOffset)
    : "";
  const quality = isUUID(id) ? "Q" : "H";

  const handleDownload = (offset: number) => {
    setDownloadOffset(offset);
    setIsDownloading(true);
  };

  return (
    <>
      <div className="w-full my-5 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-xs font-bold text-gray-600 mb-2 flex items-center uppercase tracking-wide">
          <Download size={12} className="mr-1.5" />
          {t("save_image")}
        </h3>
        <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-5">
          <DownloadBtn
            label={t("now")}
            offset={0}
            onClick={handleDownload}
            loading={isDownloading}
          />
          <DownloadBtn
            label={t("plus_5s")}
            offset={5}
            onClick={handleDownload}
            loading={isDownloading}
          />
          <DownloadBtn
            label={t("plus_10s")}
            offset={10}
            onClick={handleDownload}
            loading={isDownloading}
          />
          <DownloadBtn
            label={t("plus_30s")}
            offset={30}
            onClick={handleDownload}
            loading={isDownloading}
          />
          <DownloadBtn
            label={t("plus_60s")}
            offset={60}
            onClick={handleDownload}
            loading={isDownloading}
          />
        </div>
      </div>
      {/* Hidden Render Area */}
      <div className="hidden" ref={hiddenCanvasRef}>
        {downloadOffset !== null && (
          <QRCodeCanvas
            value={futureUrl}
            size={500}
            level={quality}
          />
        )}
      </div>
    </>
  );
};

export const QRCodeMinimal: React.FC<CommonProps & { size: number }> = (
  { id, size },
) => {
  const [timestamp, setTimestamp] = useState(Date.now());
  const { t } = useLanguage();

  useEffect(() => {
    const interval = setInterval(() => setTimestamp(Date.now()), 5000);
    return () => clearInterval(interval);
  }, []);

  const currentUrl = generateUrl(id, 0);
  const quality = isUUID(id)?"Q":"H";

  return (
    <div className="flex flex-col items-center w-full">
      {/* QR Canvas Container - Remove border/bg if minimal text is hidden (implies landscape) */}
      <div className="p-1.5 rounded-lg bg-transparent">
        <QRCodeCanvas
          value={currentUrl}
          size={size}
          level={quality}
        />
      </div>

      <div className="mt-3 flex items-center space-x-2 text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-100/50">
        <Clock size={12} className="animate-pulse" />
        <span className="text-[10px] font-bold">{t("auto_refreshing")}</span>
      </div>
    </div>
  );
};

// Standard Mobile Card View
const QRCodeCard: React.FC<CommonProps> = ({ id }) => {
  return (
    <div className="flex flex-col items-center space-y-4 w-full animate-fade-in">
      <div className="bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center w-full">
        <QRCodeMinimal id={id} size={300} />
      </div>
    </div>
  );
};

const DownloadBtn: React.FC<
  {
    label: string;
    offset: number;
    onClick: (o: number) => void;
    loading: boolean;
  }
> = ({ label, offset, onClick, loading }) => (
  <button
    disabled={loading}
    onClick={() => onClick(offset)}
    className="px-1 py-1.5 text-[10px] font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 active:bg-brand-200 rounded-md transition-colors border border-brand-200 flex flex-col items-center justify-center disabled:opacity-50"
  >
    {label}
  </button>
);

export { QRCodeCard, QRCodeMinimal as QRCodeOnly };
export default QRCodeCard;
