'use client';

import { Star, Shield, Gem, Crown, HandHeart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

type Tier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'benefactor';

interface DonationTierBadgeProps {
  tier?: Tier;
  className?: string;
}

const tierConfig = {
  bronze: {
    label: 'داعم برونزي',
    className: 'bg-orange-200 text-orange-800 border-orange-300 hover:bg-orange-200 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-800',
    icon: Star,
  },
  silver: {
    label: 'داعم فضي',
    className: 'bg-slate-200 text-slate-800 border-slate-300 hover:bg-slate-200 dark:bg-slate-700/50 dark:text-slate-300 dark:border-slate-600',
    icon: Star,
  },
  gold: {
    label: 'داعم ذهبي',
    className: 'bg-amber-200 text-amber-800 border-amber-300 hover:bg-amber-200 dark:bg-amber-500/30 dark:text-amber-300 dark:border-amber-500/50',
    icon: Shield,
  },
  platinum: {
    label: 'داعم بلاتيني',
    className: 'bg-cyan-100 text-cyan-800 border-cyan-300 hover:bg-cyan-100 dark:bg-cyan-900/50 dark:text-cyan-300 dark:border-cyan-700',
    icon: Gem,
  },
  diamond: {
    label: 'داعم ماسي',
    className: 'bg-violet-200 text-violet-800 border-violet-300 hover:bg-violet-200 dark:bg-violet-900/50 dark:text-violet-300 dark:border-violet-700',
    icon: Crown,
  },
  benefactor: {
    label: 'محسن',
    className: 'bg-rose-200 text-rose-800 border-rose-300 hover:bg-rose-200 dark:bg-rose-900/50 dark:text-rose-300 dark:border-rose-700',
    icon: HandHeart,
  },
};

export function DonationTierBadge({ tier, className }: DonationTierBadgeProps) {
  if (!tier) {
    return null;
  }

  const config = tierConfig[tier];
  const Icon = config.icon;

  return (
    <TooltipProvider>
        <Tooltip>
        <TooltipTrigger asChild>
            <Badge variant="outline" className={cn('group gap-1.5 cursor-help', config.className, className)}>
            <Icon className="h-3.5 w-3.5 fill-current transition-transform duration-300 group-hover:scale-125 group-hover:rotate-[15deg]" />
            <span>{config.label}</span>
            </Badge>
        </TooltipTrigger>
        <TooltipContent>
            <p>شكرًا لدعمك المستمر للمشروع!</p>
        </TooltipContent>
        </Tooltip>
    </TooltipProvider>
  );
}
