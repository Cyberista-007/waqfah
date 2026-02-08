'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Book, Clapperboard, Home, ListVideo, Users, LogOut, Hash, HelpCircle, CalendarClock, Upload, UserCog, LayoutDashboard, MicVocal, Loader2, ShieldX, Youtube, Podcast, Flame, Palette, Megaphone, Heart } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';


const AdminLayout = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isAdmin, isLoading } = useAdminAuth();
  const auth = useAuth();
  
  const handleLogout = async () => {
    if (auth) {
        await signOut(auth);
    }
    router.push('/');
  }

  // While checking auth, show a full-screen loader
  if (isLoading) {
    return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-16 w-16 animate-spin" />
        </div>
    )
  }

  // If we are done loading, and the user is an admin, show the layout
  if (isAdmin) {
      const navItems = [
        { href: '/admin/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
        { href: '/admin/programs', label: 'البرامج', icon: Podcast },
        { href: '/admin/channels', label: 'القنوات', icon: Youtube },
        { href: '/admin/lectures', label: 'المحاضرات', icon: Clapperboard },
        { href: '/admin/series', label: 'السلاسل', icon: ListVideo },
        { href: '/admin/books', label: 'الكتب', icon: Book },
        { href: '/admin/topics', label: 'المواضيع', icon: Hash },
        { href: '/admin/challenges', label: 'التحديات', icon: Flame },
        { href: '/admin/sins', label: 'المهلكات', icon: ShieldX },
        { href: '/admin/schedule', label: 'جدول الدروس', icon: CalendarClock },
        { href: '/admin/qa', label: 'سؤال وجواب', icon: HelpCircle },
        { href: '/admin/appearance', label: 'المظهر', icon: Palette },
        { href: '/admin/announcement', label: 'الإعلان', icon: Megaphone },
        { href: '/admin/donations', label: 'إدارة التبرعات', icon: Heart },
        { href: '/admin/users', label: 'المستخدمون', icon: UserCog },
        { href: '/admin/lectures/import', label: 'استيراد', icon: Upload },
      ];

      return (
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
                      <LayoutDashboard className="h-6 w-6" />
                      <span className="">لوحة التحكم</span>
                  </Link>
              </header>
              <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/20 rounded-xl">
                {children}
              </main>
            </div>
          </div>
      );
  }

  // If not loading and not an admin, show access denied message
  return (
    <div className="flex h-screen flex-col items-center justify-center text-center p-4">
        <ShieldX className="w-24 h-24 text-destructive mb-4"/>
        <h1 className="text-3xl font-bold font-headline mb-2">الوصول مرفوض</h1>
        <p className="text-lg text-muted-foreground mb-6">
            عذراً، هذه المنطقة مخصصة للمدير فقط.
        </p>
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/">العودة إلى الصفحة الرئيسية</Link>
          </Button>
           <Button asChild variant="secondary">
            <Link href="/auth/login">تسجيل الدخول</Link>
          </Button>
        </div>
    </div>
  );
};

export default AdminLayout;
