import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const formatDate = (dateString: string | Date) => {
  const date = new Date(dateString);
  const today = new Date();

  const options: Intl.DateTimeFormatOptions =
    date.getFullYear() === today.getFullYear()
      ? { month: "short", day: "numeric" } // Show only Month and Day
      : { year: "numeric", month: "short", day: "numeric" }; // Show Year, Month, and Day

  return date.toLocaleDateString(undefined, options);
};

export const formatFileName = (name: string) => {
  return name.length < 32 ? name : `${name.slice(0, 23)}...`;
};
