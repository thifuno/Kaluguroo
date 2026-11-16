import type { Language } from '@/types/models';

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function dateFromKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function lastNDays(n: number, from = new Date()): string[] {
  return Array.from({ length: n }, (_, i) => toDateKey(addDays(from, i - (n - 1))));
}

const THAI_MONTHS = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
];

const EN_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export function formatDateKey(key: string, language: Language): string {
  const date = dateFromKey(key);
  const day = date.getDate();
  const month = language === 'th' ? THAI_MONTHS[date.getMonth()] : EN_MONTHS[date.getMonth()];
  const year = language === 'th' ? date.getFullYear() + 543 : date.getFullYear();
  return `${day} ${month} ${year}`;
}

export function formatShortDate(key: string, language: Language): string {
  const date = dateFromKey(key);
  const day = date.getDate();
  const month = language === 'th' ? THAI_MONTHS[date.getMonth()] : EN_MONTHS[date.getMonth()];
  return `${day} ${month}`;
}

export function relativeDayLabel(key: string, language: Language): string {
  const today = todayKey();
  const yesterday = toDateKey(addDays(new Date(), -1));
  if (key === today) return language === 'th' ? 'วันนี้' : 'Today';
  if (key === yesterday) return language === 'th' ? 'เมื่อวาน' : 'Yesterday';
  return formatShortDate(key, language);
}

export function greetingKey(date = new Date()): 'morning' | 'afternoon' | 'evening' {
  const hour = date.getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}
