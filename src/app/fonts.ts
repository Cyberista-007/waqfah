
import {
  Alegreya,
  Cairo,
  Noto_Sans_Arabic,
  Lalezar,
  Tajawal,
  Amiri,
  Markazi_Text,
  IBM_Plex_Sans_Arabic,
  Almarai,
  Changa,
  El_Messiri,
  Reem_Kufi,
  Mada,
  Scheherazade_New,
  Source_Code_Pro,
  Rubik,
} from 'next/font/google';

export const alegreya = Alegreya({
  subsets: ['latin'],
  variable: '--font-body',
});

export const sourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  variable: '--font-code',
});

export const rubikOrigami = Rubik({
    subsets: ['latin'],
    weight: '400',
    variable: '--font-rubik-origami'
})

export const cairo = Cairo({
  subsets: ['arabic'],
  variable: '--font-cairo',
});
export const notoSansArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  variable: '--font-noto-sans-arabic',
});
export const lalezar = Lalezar({
  subsets: ['arabic'],
  weight: '400',
  variable: '--font-lalezar',
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
export const markaziText = Markazi_Text({
  subsets: ['arabic'],
  variable: '--font-markazi-text',
});
export const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-ibm-plex-sans-arabic',
});
export const almarai = Almarai({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-almarai',
});
export const changa = Changa({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-changa',
});
export const elMessiri = El_Messiri({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-el-messiri',
});
export const reemKufi = Reem_Kufi({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-reem-kufi',
});
export const mada = Mada({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-mada',
});
export const scheherazadeNew = Scheherazade_New({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-scheherazade-new',
});
