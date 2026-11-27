'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const AccountabilityTracker = dynamic(
  () => import('@/components/accountability-tracker').then((mod) => mod.AccountabilityTracker),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    ),
  }
);

export default function AccountabilityPage() {
  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 pt-6 sm:pt-10">
        <AccountabilityTracker />
      </div>
    </div>
  );
}
