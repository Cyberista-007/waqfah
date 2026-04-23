import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'الأدعية المأثورة',
  description: 'أدعية نبوية وقرآنية مأثورة مصنّفة — أدعية الصباح والمساء والنوم والكرب وأدعية يومية موثّقة من السنة النبوية.',
  openGraph: {
    title: 'الأدعية المأثورة | وقفة',
    description: 'أدعية نبوية وقرآنية مصنّفة — صباح، مساء، نوم، كرب وأدعية يومية',
    type: 'website',
    locale: 'ar_SA',
  },
};

export default function DuaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
