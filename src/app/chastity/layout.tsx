import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'درع العفة | التعافي من الإباحية والتحصين السلوكي',
  description: 'بوابة متكاملة لمرافقتك في رحلة التحرر من إدمان الإباحية وبناء حصانة سلوكية ونفسية متكاملة، بخصوصية وسرية تامة.',
  openGraph: {
    title: 'درع العفة والتعافي | وقفة',
    description: 'بوابة متكاملة لمرافقتك في رحلة التحرر من إدمان الإباحية وبناء عقل وقلب سليمين.',
    type: 'website',
    locale: 'ar_SA',
  },
};

export default function ChastityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
