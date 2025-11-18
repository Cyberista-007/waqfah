

'use client';

import { ReactNode, useEffect } from 'react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { Book, Clapperboard, Home, ListVideo, MessageSquare, Users, LogOut, Hash, HelpCircle, CalendarClock, Upload, UserCog, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAdminActivation } from '@/hooks/use-admin-auth';

// This is the Guard component that handles all auth logic.
function AdminAuthGuard({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useUser();
  const { isAdmin, isLoading: isAdminLoading, checkAdminPassword } = useAdminActivation();
  const router = useRouter();

  useEffect(() => {
    // If we're still loading user or admin status, don't do anything yet.
    if (isUserLoading || isAdminLoading) {
      return;
    }

    // 1. If there's no user, redirect to the main login page.
    if (!user) {
      router.replace('/auth/login?redirect_to=/admin');
      return;
    }

    // 2. If the user is logged in, but not an admin, check the password.
    if (user && !isAdmin) {
      checkAdminPassword();
    }
  }, [user, isUserLoading, isAdmin, isAdminLoading, router, checkAdminPassword]);

  // While we are waiting for user or admin status, show a loader.
  // OR if the user is logged in but the check hasn't confirmed them as admin yet.
  if (isUserLoading || isAdminLoading || (user && !isAdmin)) {
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
  const { deActivateAdmin } = useAdminActivation();
  
  const handleLogout = async () => {
    if (user) {
        // Since useUser hook gets user from onAuthStateChanged,
        // we just need to sign out, and the user state will update automatically.
        await signOut(user.auth);
        // Clear the admin session storage as well
        deActivateAdmin();
        router.push('/');
    }
  }

  const navItems = [
    { href: '/admin/dashboard', label: 'لوحة التحكم', icon: Home },
    { href: '/admin/lectures', label: 'المحاضرات', icon: Clapperboard },
    { href: '/admin/series', label: 'السلاسل', icon: ListVideo },
    { href: '/admin/books', label: 'الكتب', icon: Book },
    { href: '/admin/topics', label: 'المواضيع', icon: Hash },
    { href: '/admin/comments', label: 'التعليقات', icon: MessageSquare },
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
                <Users className="h-6 w-6" />
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
