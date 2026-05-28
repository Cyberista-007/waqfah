import {
  Cairo,
  Tajawal,
  Amiri,
  Source_Code_Pro,
  Almarai,
  Lalezar,
  Noto_Sans_Arabic,
  IBM_Plex_Sans_Arabic,
  Changa,
  El_Messiri,
  Reem_Kufi,
  Markazi_Text,
  Scheherazade_New,
  Mada,
} from 'next/font/google';

export const cairo = Cairo({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '700', '900'],
  variable: '--font-body',
  display: 'swap',
});

export const sourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  variable: '--font-code',
  display: 'swap',
});

export const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-tajawal',
  display: 'swap',
});

export const amiri = Amiri({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-amiri',
  display: 'swap',
});

export const almarai = Almarai({
  subsets: ['arabic'],
  weight: ['300', '400', '700', '800'],
  variable: '--font-almarai',
  display: 'swap',
});

export const lalezar = Lalezar({
  subsets: ['arabic'],
  weight: ['400'],
  variable: '--font-lalezar',
  display: 'swap',
});

export const notoSansArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-noto-sans-arabic',
  display: 'swap',
});

export const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-ibm-plex-sans-arabic',
  display: 'swap',
});

export const changa = Changa({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-changa',
  display: 'swap',
});

export const elMessiri = El_Messiri({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-el-messiri',
  display: 'swap',
});

export const reemKufi = Reem_Kufi({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-reem-kufi',
  display: 'swap',
});

export const markaziText = Markazi_Text({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-markazi-text',
  display: 'swap',
});

export const scheherazadeNew = Scheherazade_New({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-scheherazade-new',
  display: 'swap',
});

export const mada = Mada({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-mada',
  display: 'swap',
});
