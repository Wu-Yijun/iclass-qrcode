import { SavedItem, ShareData } from "./types";
import jsQR from "jsqr";

export const generateUrl = (id: string, offsetSeconds: number = 0): string => {
  const timestamp = Date.now() + offsetSeconds * 1000;
  return `https://iclass.ucas.edu.cn:8181/app/course/stu_scan_sign.action?courseSchedId=${id}&timestamp=${timestamp}`;
};

export const saveToLocalStorage = (items: SavedItem[]) => {
  try {
    localStorage.setItem("iclass_saved_items", JSON.stringify(items));
  } catch (e) {
    console.error("Failed to save items", e);
  }
};

export const loadFromLocalStorage = (): SavedItem[] => {
  try {
    const data = localStorage.getItem("iclass_saved_items");
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const encodeShareData = (items: SavedItem[]): string => {
  try {
    const json = JSON.stringify({ items });
    // Handle Unicode strings
    return btoa(
      encodeURIComponent(json).replace(
        /%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
          return String.fromCharCode(parseInt(p1, 16));
        },
      ),
    );
  } catch (e) {
    console.error("Encode failed", e);
    return "";
  }
};

export const decodeShareData = (str: string): SavedItem[] => {
  try {
    const decoded = decodeURIComponent(
      atob(str).split("").map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(""),
    );
    const data: ShareData = JSON.parse(decoded);
    if (!Array.isArray(data.items)) return [];
    data.items.forEach((item) => {
      if (
        typeof item.id !== "string" || typeof item.label !== "string" ||
        typeof item.timestamp !== "number"
      ) {
        throw new Error("Invalid item format");
      }
      item.id = item.id.replaceAll(/[^0-9]/g, "");
      item.label = item.label.trim();
    });
    return data.items.filter((item) => item.id !== "" && item.label !== "");
  } catch (e) {
    console.error("Decode failed", e);
    return [];
  }
};

export const scanQRCodeFromFile = (file: File): Promise<string | null> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code) {
          // Attempt to extract ID from URL if it matches pattern, otherwise return raw text
          try {
            const url = new URL(code.data);
            const id = url.searchParams.get("courseSchedId");
            resolve(id || code.data);
          } catch {
            resolve(code.data);
          }
        } else {
          resolve(null);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

export const HOME_PAGE = "https://github.com/Wu-Yijun/iclass-qrcode";
