import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function parseMobiles(json: string | null | undefined): string[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [String(parsed)];
  } catch {
    return json ? [json] : [];
  }
}

export function stringifyMobiles(mobiles: string[]): string {
  return JSON.stringify(mobiles.filter(Boolean));
}

// Convert price string "0-50-0-0-00" → "50 Lakh"
export function formatPrice(price: string | null | undefined): string {
  if (!price) return "—";
  const parts = price.split("-");
  if (parts.length < 4) return price;
  const [crore, lakh, thousand, hundred] = parts.map(Number);
  const parts2: string[] = [];
  if (crore) parts2.push(`${crore} Cr`);
  if (lakh) parts2.push(`${lakh} L`);
  if (thousand) parts2.push(`${thousand}K`);
  if (hundred) parts2.push(`${hundred}H`);
  return parts2.join(" ") || "—";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
