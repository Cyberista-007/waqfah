'use client';

import { useAppearance } from '@/components/appearance-provider';

export type SupportedLang = 'ar' | 'en';

export function useTranslation() {
  const { language } = useAppearance();
  const lang: SupportedLang = language === 'ar' ? 'ar' : 'en';
  const isRtl = lang === 'ar';

  const t = (ar: string, en: string): string => (lang === 'ar' ? ar : en);

  return { lang, isRtl, t };
}
