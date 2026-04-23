import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

/**
 * A premium bento-style grid layout.
 * Children should be BentoCard components.
 */
export function BentoGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[280px] gap-4',
        className
      )}
    >
      {children}
    </div>
  );
}

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  /** How many columns this card spans */
  colSpan?: 1 | 2 | 3;
  /** How many rows this card spans */
  rowSpan?: 1 | 2;
  /** Optional gradient accent color (CSS color string) */
  accentColor?: string;
}

export function BentoCard({
  children,
  className,
  colSpan = 1,
  rowSpan = 1,
  accentColor,
}: BentoCardProps) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-3xl',
        'bg-card/50 backdrop-blur-xl border border-border/40',
        'transition-all duration-500 ease-out',
        'hover:border-primary/30 hover:shadow-[0_0_40px_hsl(var(--primary)/0.12)] hover:scale-[1.01]',
        colSpan === 2 && 'sm:col-span-2',
        colSpan === 3 && 'sm:col-span-2 lg:col-span-3',
        rowSpan === 2 && 'row-span-2',
        className
      )}
      style={
        accentColor
          ? ({'--bento-accent': accentColor} as React.CSSProperties)
          : undefined
      }
    >
      {/* Hover gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      {/* Corner glow */}
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none bg-primary" />
      {children}
    </div>
  );
}
