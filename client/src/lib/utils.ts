import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function generateEventUrl(eventId: number): string {
  return `${window.location.origin}/event-participant/${eventId}`;
}

// Truncate a string (e.g., wallet address) to a readable format
export function truncateString(str: string, startChars = 6, endChars = 4): string {
  if (!str) return '';
  if (str.length <= startChars + endChars) return str;
  
  return `${str.substring(0, startChars)}...${str.substring(str.length - endChars)}`;
}
