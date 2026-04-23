'use client';

import { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Loader2, Check } from 'lucide-react';

type ButtonState = 'idle' | 'loading' | 'success' | 'error';

interface FluidButtonProps {
  onClick?: () => Promise<void> | void;
  children: ReactNode;
  className?: string;
  successText?: string;
  errorText?: string;
  disabled?: boolean;
  variant?: 'primary' | 'outline' | 'ghost';
}

/**
 * A button that morphs into a loading spinner, then a success/error state.
 * Usage: pass an async onClick and it handles state automatically.
 */
export function FluidButton({
  onClick,
  children,
  className,
  successText = 'تم!',
  errorText = 'خطأ',
  disabled,
  variant = 'primary',
}: FluidButtonProps) {
  const [state, setState] = useState<ButtonState>('idle');

  const handleClick = async () => {
    if (state !== 'idle' || disabled || !onClick) return;
    setState('loading');
    try {
      await onClick();
      setState('success');
      setTimeout(() => setState('idle'), 2000);
    } catch {
      setState('error');
      setTimeout(() => setState('idle'), 2000);
    }
  };

  const baseClass = cn(
    'relative inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm',
    'transition-all duration-300 overflow-hidden select-none',
    variant === 'primary' && 'bg-primary text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.5)]',
    variant === 'outline' && 'border border-border bg-transparent hover:bg-primary/5 hover:border-primary/50',
    variant === 'ghost' && 'bg-transparent hover:bg-primary/10',
    (state === 'loading' || disabled) && 'opacity-80 cursor-not-allowed',
    state === 'success' && 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400',
    state === 'error' && 'bg-destructive/20 border border-destructive/50 text-destructive',
    className
  );

  return (
    <motion.button
      className={baseClass}
      onClick={handleClick}
      disabled={state === 'loading' || disabled}
      whileTap={{ scale: state === 'idle' ? 0.96 : 1 }}
    >
      <AnimatePresence mode="wait">
        {state === 'idle' && (
          <motion.span
            key="idle"
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.span>
        )}
        {state === 'loading' && (
          <motion.span
            key="loading"
            className="flex items-center gap-2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>جارٍ التنفيذ...</span>
          </motion.span>
        )}
        {state === 'success' && (
          <motion.span
            key="success"
            className="flex items-center gap-2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <Check className="w-4 h-4" />
            <span>{successText}</span>
          </motion.span>
        )}
        {state === 'error' && (
          <motion.span
            key="error"
            className="flex items-center gap-2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <span>{errorText}</span>
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
