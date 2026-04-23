import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'المهلكات والآفات',
  description: 'تعرف على المهلكات وأمراض القلوب والآفات التي يجب الحذر منها وتطهير النفس من أدرانها.',
  openGraph: {
    title: 'المهلكات | وقفة',
    description: 'تعرف على المهلكات لتطهير النفس وتزكيتها',
    type: 'website',
    locale: 'ar_SA',
  },
};

export default function MuhlikatLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
