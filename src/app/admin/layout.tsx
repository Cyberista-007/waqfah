
'use client';

import { ReactNode, useEffect } from 'react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { Book, Clapperboard, Home, ListVideo, Users, LogOut, Hash, HelpCircle, CalendarClock, Upload, UserCog, Loader2, LayoutDashboard, MicVocal } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAdminAuth } from '@/hooks/use-admin-auth';

// This is the Guard component that handles all auth logic.
function AdminAuthGuard({ children }: { children: ReactNode }) {
  const { isAdmin, isLoading } = useAdminAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (isLoading) {
      return; // Wait until loading is complete.
    }
    
    // If not an admin, redirect to admin login page.
    if (!isAdmin) {
      router.replace('/admin/login');
      return;
    }

  }, [isAdmin, isLoading, router]);
  
  // Show a loader while verifying admin status.
  if (isLoading || !isAdmin) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <svg version="1.1" id="loader-1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
          width="64px" height="64px" viewBox="0 0 50 50" enableBackground="new 0 0 50 50" xmlSpace="preserve">
          <path fill="hsl(var(--primary))" d="M25.251,6.461c-10.318,0-18.683,8.365-18.683,18.683h4.068c0-8.071,6.543-14.615,14.615-14.615V6.461z">
            <animateTransform attributeType="xml"
              attributeName="transform"
              type="rotate"
              from="0 25 25"
              to="360 25 25"
              dur="0.6s"
              repeatCount="indefinite"/>
            </path>
        </svg>
      </div>
    );
  }
  
  // If all checks pass, render the admin layout.
  return <>{children}</>;
}


const AdminLayout = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const { logoutAdmin } = useAdminAuth();
  
  const handleLogout = async () => {
    // This logs out the main user, not the admin session.
    // The admin session is separate.
    if (user) {
        await signOut(user.auth);
    }
    logoutAdmin(); // This clears the admin session
    router.push('/');
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
