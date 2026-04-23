import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'الحديث النبوي',
  description: 'أحاديث نبوية شريفة مصنّفة حسب الموضوع — ابحث واحفظ وشارك من صحاح السنة النبوية المطهرة.',
  openGraph: {
    title: 'الحديث النبوي | وقفة',
    description: 'أحاديث نبوية شريفة مصنّفة — إيمان، أخلاق، عبادة، علم وأسرة',
    type: 'website',
    locale: 'ar_SA',
  },
};

export default function HadithLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
