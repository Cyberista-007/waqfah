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

// ── Core fonts — preloaded on every page ──────────────────────────────────────

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

// ── Secondary fonts — NOT preloaded, load on demand (Appearance Settings) ─────

export const almarai = Almarai({
  subsets: ['arabic'],
  weight: ['300', '400', '700', '800'],
  variable: '--font-almarai',
  display: 'swap',
  preload: false,
});

export const lalezar = Lalezar({
  subsets: ['arabic'],
  weight: ['400'],
  variable: '--font-lalezar',
  display: 'swap',
  preload: false,
});

export const notoSansArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-noto-sans-arabic',
  display: 'swap',
  preload: false,
});

export const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-ibm-plex-sans-arabic',
  display: 'swap',
  preload: false,
});

export const changa = Changa({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-changa',
  display: 'swap',
  preload: false,
});

export const elMessiri = El_Messiri({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-el-messiri',
  display: 'swap',
  preload: false,
});

export const reemKufi = Reem_Kufi({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-reem-kufi',
  display: 'swap',
  preload: false,
});

export const markaziText = Markazi_Text({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-markazi-text',
  display: 'swap',
  preload: false,
});

export const scheherazadeNew = Scheherazade_New({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-scheherazade-new',
  display: 'swap',
  preload: false,
});

export const mada = Mada({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-mada',
  display: 'swap',
  preload: false,
});
