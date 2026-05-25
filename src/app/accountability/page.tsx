'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const AccountabilityTracker = dynamic(() => import("@/components/accountability-tracker").then(mod => mod.AccountabilityTracker), {
    ssr: false,
    loading: () => <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
});

export default function AccountabilityPage() {
    return <AccountabilityTracker />;
}
