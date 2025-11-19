'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useUser, useDoc, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { Book, Clapperboard, Home, ListVideo, Users, LogOut, Hash, HelpCircle, CalendarClock, Upload, UserCog, Loader2, LayoutDashboard, MicVocal } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { UserProfile } from '@/lib/types';
import { useMemo } from 'react';

// This is the Guard component that handles all auth logic.
function AdminAuthGuard({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  // Memoize the document reference
  const userDocRef = useMemo(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  const isAdmin = userProfile?.role === 'admin';
  const isAuthCheckComplete = !isUserLoading && !isProfileLoading;

  useEffect(() => {
    if (isAuthCheckComplete) {
      if (!user) {
        // If auth check is done and there's no user, redirect to login
        router.replace('/auth/login?redirect_to=/admin');
      } else if (!isAdmin) {
        // If user is logged in but is not an admin, redirect to home
        router.replace('/');
      }
    }
  }, [user, isAdmin, isAuthCheckComplete, router]);
  
  // While checking user auth or profile, show a loader.
  // Also show a loader if the check is complete but the user is not an admin yet (avoids flashing content).
  if (!isAuthCheckComplete || !isAdmin) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }
  
  // If all checks pass (user exists and is an admin), render the admin layout.
  return <>{children}</>;
}


const AdminLayout = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  
  const handleLogout = async () => {
    if (user) {
        await signOut(user.auth);
        router.push('/');
    }
  }

  const navItems = [
    { href: '/admin/dashboard', label: 'لوحة التحكم', icon: Home },
    { href: '/admin/sheikhs', label: 'المشايخ', icon: MicVocal },
    { href: '/admin/lectures', label: 'المحاضرات', icon: Clapperboard },
    { href: '/admin/series', label: 'السلاسل', icon: ListVideo },
    { href: '/admin/books', label: 'الكتب', icon: Book },
    { href: '/admin/topics', label: 'المواضيع', icon: Hash },
    { href: '/admin/schedule', label: 'جدول الدروس', icon: CalendarClock },
    { href: '/admin/qa', label: 'سؤال وجواب', icon: HelpCircle },
    { href: '/admin/users', label: 'المستخدمون', icon: UserCog },
    { href: '/admin/lectures/import', label: 'استيراد', icon: Upload },
  ];

  return (
    <AdminAuthGuard>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <aside className="hidden border-r bg-muted/40 md:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
              <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold">
                <LayoutDashboard className="h-6 w-6" />
                <span className="">لوحة التحكم</span>
              </Link>
            </div>
            <div className="flex-1">
              <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                {navItems.map(item => {
                    const Icon = item.icon;
                    const isActive = pathname.startsWith(item.href);
                    
                    return (
                      <Link
                          key={item.label}
                          href={item.href}
                          className={cn(
                              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                            isActive ? "bg-primary/10 text-primary" : ""
                          )}
                      >
                          <Icon className="h-4 w-4" />
                          {item.label}
                      </Link>
                    )
                })}
              </nav>
            </div>
            <div className="mt-auto p-4 space-y-2">
                  <Button onClick={handleLogout} size="sm" variant="outline" className="w-full">
                    <LogOut className="mr-2 h-4 w-4" />
                    تسجيل الخروج
                  </Button>
              <Button size="sm" className="w-full" asChild>
                <Link href="/">العودة للموقع</Link>
              </Button>
            </div>
          </div>
        </aside>
        <div className="flex flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 md:hidden">
              <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold">
                  <Users className="h-6 w-6" />
                  <span className="">لوحة التحكم</span>
              </Link>
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/20">
            {children}
          </main>
        </div>
      </div>
    </AdminAuthGuard>
  );
};

export default AdminLayout;
