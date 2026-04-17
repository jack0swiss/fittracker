import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatKg(value: number, fractionDigits = 1): string {
  return `${value.toLocaleString('de-CH', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })} kg`;
}

export function formatDateCH(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return format(date, 'dd.MM.yyyy', { locale: de });
}

export function formatTimeCH(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return format(date, 'HH:mm', { locale: de });
}

export function formatRelativeShort(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 60) return `vor ${diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `vor ${diffH} h`;
  const diffD = Math.round(diffH / 24);
  if (diffD < 7) return `vor ${diffD} Tagen`;
  return formatDateCH(date);
}
