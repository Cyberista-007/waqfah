
"use client";

import { ReactNode } from 'react';
import { Book, Clapperboard, Home, ListVideo, MessageSquare, Users, LogOut } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { handleAdminLogout } from '@/lib/actions';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const auth = useAuth();

  const navItems = [
    { href: '/admin/dashboard', label: 'لوحة التحكم', icon: Home },
    { href: '/admin/lectures', label: 'المحاضرات', icon: Clapperboard },
    { href: '/admin/series', label: 'السلاسل', icon: ListVideo },
    { href: '/admin/books', label: 'الكتب', icon: Book },
    { href: '/admin/comments', label: 'التعليقات', icon: MessageSquare },
  ];

  const onLogout = async () => {
    // This will sign out the Firebase user if one is logged in, but our admin auth is cookie-based.
    if (auth.currentUser) {
      await signOut(auth);
    }
    // This server action clears the admin cookie and redirects.
    await handleAdminLogout();
  }

  return (
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
                  // Check if the current path starts with the nav item's href
                  const isActive = pathname.startsWith(item.href) && (item.href !== '/admin/dashboard' || pathname === item.href);
                   const isDashboardActive = pathname === '/admin/dashboard';
                  
                  return (
                    <Link
                        key={item.label}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                           (item.href === '/admin/dashboard' && isDashboardActive) || (item.href !== '/admin/dashboard' && isActive)
                            ? "bg-primary/10 text-primary"
                            : ""
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
             <Button size="sm" className="w-full" variant="outline" onClick={onLogout}>
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
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/20">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
