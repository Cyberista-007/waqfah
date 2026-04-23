import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'آيات قرآنية',
  description: 'آيات قرآنية كريمة مختارة مع التدبّر والتفسير — مجموعات في الإيمان والتوكل والذكر والأخلاق.',
  openGraph: {
    title: 'آيات قرآنية | وقفة',
    description: 'تدبّر كلام الله مع شرح وتأمّل في آيات مختارة',
    type: 'website',
    locale: 'ar_SA',
  },
};

export default function QuranLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
