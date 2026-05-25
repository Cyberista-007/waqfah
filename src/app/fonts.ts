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
  weight: ['200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-body',
});

export const sourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  variable: '--font-code',
});

export const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-tajawal',
});

export const amiri = Amiri({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-amiri',
});

export const almarai = Almarai({
  subsets: ['arabic'],
  weight: ['300', '400', '700', '800'],
  variable: '--font-almarai',
});

export const lalezar = Lalezar({
  subsets: ['arabic'],
  weight: ['400'],
  variable: '--font-lalezar',
});

export const notoSansArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-noto-sans-arabic',
});

export const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['100', '200', '300', '400', '500', '600', '700'],
  variable: '--font-ibm-plex-sans-arabic',
});

export const changa = Changa({
  subsets: ['arabic'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  variable: '--font-changa',
});

export const elMessiri = El_Messiri({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-el-messiri',
});

export const reemKufi = Reem_Kufi({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-reem-kufi',
});

export const markaziText = Markazi_Text({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-markazi-text',
});

export const scheherazadeNew = Scheherazade_New({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-scheherazade-new',
});

export const mada = Mada({
  subsets: ['arabic'],
  weight: ['200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-mada',
});
