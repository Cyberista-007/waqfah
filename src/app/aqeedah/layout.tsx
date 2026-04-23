import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'علم العقيدة | أركان الإيمان الستة',
  description: 'منهج منظّم للتعرف على أركان الإيمان الستة وفهم مقتضياتها العملية في حياة المسلم، من توحيد الله والإيمان بالملائكة والكتب والرسل واليوم الآخر والقدر.',
  keywords: ['عقيدة', 'أركان الإيمان', 'توحيد', 'إسلام', 'أهل السنة والجماعة'],
  openGraph: {
    title: 'علم العقيدة | وقفة',
    description: 'أركان الإيمان الستة — دليلك للعقيدة الصحيحة',
    type: 'website',
    locale: 'ar_SA',
  },
};

export default function AqeedahLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
