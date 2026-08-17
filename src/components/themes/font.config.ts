import { Inter } from 'next/font/google';

import { cn } from '@/lib/utils';

// Not named --font-sans — that's the theme-controlled token each
// [data-theme] rule sets on <html>. See src/styles/themes/*.css.
const fontInter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
});

export const fontVariables = cn(fontInter.variable);
