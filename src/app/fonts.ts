
import {
  Cairo,
  Tajawal,
  Amiri,
  Source_Code_Pro,
} from 'next/font/google';

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
