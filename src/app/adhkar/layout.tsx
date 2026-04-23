import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'الأذكار والتسبيحات',
  description: 'أذكار الصباح والمساء والنوم والتسبيحات — عدّاد تفاعلي لحفظ تقدمك في التسبيح وتحصين يومك بذكر الله.',
  openGraph: {
    title: 'الأذكار والتسبيحات | وقفة',
    description: 'أذكار الصباح والمساء والنوم والتسبيحات مع عدّاد تفاعلي',
    type: 'website',
    locale: 'ar_SA',
  },
};

export default function AdhkarLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
