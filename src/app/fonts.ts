import {
  Cairo,
  Tajawal,
  Amiri,
  Source_Code_Pro,
} from 'next/font/google';
import localFont from 'next/font/local';

export const cairo = Cairo({
  subsets: ['arabic'],
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

/*
export const lazeez = localFont({
  src: '../assets/fonts/Lazeez-Regular.ttf',
  variable: '--font-lazeez',
  display: 'swap',
});

export const uthmanic = localFont({
  src: '../assets/fonts/Uthmanic.ttf',
  variable: '--font-uthmanic',
  display: 'swap',
});

export const geDinar = localFont({
  src: '../assets/fonts/GE-Dinar-Two-Medium.ttf',
  variable: '--font-ge-dinar',
  display: 'swap',
});
*/
