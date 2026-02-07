
'use client';

import { usePathname } from 'next/navigation';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { Loader2 } from 'lucide-react';
import { MaintenancePage } from '@/components/maintenance-page';

interface MaintenanceHandlerProps {
  maintenanceMode: boolean;
  children: React.ReactNode;
}

function FullScreenLoader() {
    return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-16 w-16 animate-spin" />
        </div>
    );
}

export function MaintenanceHandler({ maintenanceMode, children }: MaintenanceHandlerProps) {
  const pathname = usePathname();
  const { isAdmin, isLoading } = useAdminAuth();

  if (!maintenanceMode) {
    return <>{children}</>;
  }
  
  // Always allow access to login page so admin can log in
  if (pathname.startsWith('/auth/login')) {
      return <>{children}</>;
  }

  if (isLoading) {
    return <FullScreenLoader />;
  }

  if (isAdmin) {
    return <>{children}</>;
  }

  // Regular user in maintenance mode
  return <MaintenancePage />;
}
