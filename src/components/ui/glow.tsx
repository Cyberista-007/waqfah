'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface GlowCardProps extends HTMLAttributes<HTMLDivElement> {
  glowColor?: string;
  intensity?: 'subtle' | 'medium' | 'strong';
  border?: boolean;
}

/**
 * A card with a dynamic glow effect on hover.
 * Usage: wrap any content with <GlowCard>
 */
export const GlowCard = forwardRef<HTMLDivElement, GlowCardProps>(
  ({ className, children, glowColor, intensity = 'subtle', border = true, style, ...props }, ref) => {
    const intensityMap = {
      subtle: '0 0 20px',
      medium: '0 0 35px',
      strong: '0 0 60px',
    };

    const shadow = glowColor
      ? `${intensityMap[intensity]} ${glowColor}`
      : `${intensityMap[intensity]} hsl(var(--primary) / 0.25)`;

    const borderColor = glowColor || 'hsl(var(--primary) / 0.2)';

    return (
      <div
        ref={ref}
        className={cn(
          'group relative transition-all duration-500 ease-out',
          'hover:scale-[1.01]',
          className
        )}
        style={{
          '--glow-shadow': shadow,
          '--glow-border': borderColor,
          ...style,
        } as React.CSSProperties}
        {...props}
      >
        {/* Glow border */}
        {border && (
          <div
            className="absolute inset-0 rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              boxShadow: shadow,
              border: `1px solid ${borderColor}`,
            }}
          />
        )}
        {children}
      </div>
    );
  }
);

GlowCard.displayName = 'GlowCard';

/**
 * Holographic shimmer badge / tag
 */
export function HoloBadge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'relative inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold',
        'bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20',
        'border border-primary/30',
        'overflow-hidden',
        'before:absolute before:inset-0 before:translate-x-[-100%] before:bg-gradient-to-r',
        'before:from-transparent before:via-white/20 before:to-transparent',
        'before:transition-transform before:duration-700',
        'hover:before:translate-x-[100%]',
        className
      )}
    >
      {children}
    </span>
  );
}

/**
 * Neon border element — wraps any element with a glowing animated border
 */
export function NeonBorder({
  children,
  className,
  color,
}: {
  children: React.ReactNode;
  className?: string;
  color?: string;
}) {
  return (
    <div
      className={cn('relative rounded-[inherit]', className)}
      style={{
        '--neon-color': color || 'hsl(var(--primary))',
      } as React.CSSProperties}
    >
      <div
        className="absolute inset-0 rounded-[inherit] opacity-40 animate-pulse pointer-events-none"
        style={{
          boxShadow: `0 0 0 1px var(--neon-color), 0 0 12px var(--neon-color), inset 0 0 12px transparent`,
        }}
      />
      {children}
    </div>
  );
}

/**
 * Diffusion shadow — colored drop shadow using the element's accent color
 */
export function DiffusionShadow({
  children,
  className,
  color,
}: {
  children: React.ReactNode;
  className?: string;
  color?: string;
}) {
  return (
    <div
      className={cn('group relative', className)}
    >
      <div
        className="absolute inset-0 rounded-[inherit] opacity-0 group-hover:opacity-60 transition-opacity duration-700 blur-2xl scale-95 pointer-events-none -z-10"
        style={{
          backgroundColor: color || 'hsl(var(--primary) / 0.4)',
        }}
      />
      {children}
    </div>
  );
}
