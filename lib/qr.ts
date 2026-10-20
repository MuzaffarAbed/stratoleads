import "server-only";

import QRCode from "qrcode";

import { cardUrl } from "@/lib/site";

const qrOptions = {
  errorCorrectionLevel: "M" as const,
  margin: 1,
  width: 280,
  color: {
    dark: "#10131C",
    light: "#FFFFFF",
  },
};

export async function cardQrDataUrl(slug: string): Promise<string> {
  return QRCode.toDataURL(cardUrl(slug), qrOptions);
}

export async function cardQrPng(slug: string): Promise<Buffer> {
  return QRCode.toBuffer(cardUrl(slug), { ...qrOptions, width: 640 });
}
