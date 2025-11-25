
import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        body: ['var(--font-body)', 'sans-serif'],
        headline: ['var(--font-headline)', 'sans-serif'],
        code: ['var(--font-code)'],
        'cairo': ['var(--font-cairo)'],
        'noto-sans-arabic': ['var(--font-noto-sans-arabic)'],
        'lalezar': ['var(--font-lalezar)'],
        'tajawal': ['var(--font-tajawal)'],
        'amiri': ['var(--font-amiri)'],
        'markazi-text': ['var(--font-markazi-text)'],
        'ibm-plex-sans-arabic': ['var(--font-ibm-plex-sans-arabic)'],
        'almarai': ['var(--font-almarai)'],
        'changa': ['var(--font-changa)'],
        'el-messiri': ['var(--font-el-messiri)'],
        'reem-kufi': ['var(--font-reem-kufi)'],
        'mada': ['var(--font-mada)'],
        'scheherazade-new': ['var(--font-scheherazade-new)'],
        'rubik-origami': ['var(--font-rubik-origami)'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        "gradient-move": {
          "0%, 100%": {
            "background-position": "0% 50%",
          },
          "50%": {
            "background-position": "100% 50%",
          },
        },
        'fade-in-up': {
            '0%': {
                opacity: '0',
                transform: 'translateY(10px)'
            },
            '100%': {
                opacity: '1',
                transform: 'translateY(0)'
            }
        },
        'scroll-rtl': {
          'from': { transform: 'translateX(0)' },
          'to': { transform: 'translateX(-100%)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'gradient-move': 'gradient-move 15s ease infinite',
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
        'scroll-rtl': 'scroll-rtl 40s linear infinite',
      },
       animationPlayState: {
          'paused': 'paused',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    function ({ addVariant }: { addVariant: (name: string, definition: string) => void }) {
      addVariant('pause', '.group:hover &');
    }
  ],
} satisfies Config;
