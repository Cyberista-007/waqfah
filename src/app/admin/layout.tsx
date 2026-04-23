
'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  AlertTriangle, Book, CalendarClock, Clapperboard, Flame, Hash, Heart, HelpCircle,
  LayoutDashboard, ListVideo, Loader2, LogOut, Megaphone, Palette, Pin, Podcast,
  ShieldX, UserCog, Trophy, GraduationCap, Upload, Layers, Quote, ShieldCheck
} from 'lucide-react';
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

  if (isLoading) {
    return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-16 w-16 animate-spin" />
        </div>
    )
  }

  if (isAdmin) {
    const navItems = [
      // Overview
      { href: '/admin/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
      
      // Content Management
      { href: '/admin/programs', label: 'البرامج', icon: Podcast },
      { href: '/admin/series', label: 'السلاسل', icon: ListVideo },
      { href: '/admin/lectures', label: 'المحاضرات', icon: Clapperboard },
      { href: '/admin/books', label: 'الكتب', icon: Book },
      { href: '/admin/import', label: 'استيراد', icon: Upload },

      // Content Organization
      { href: '/admin/curriculums', label: 'المناهج', icon: GraduationCap },
      { href: '/admin/topics', label: 'المسارات', icon: Layers },
      { href: '/admin/pinned', label: 'العناصر المثبتة', icon: Pin },

      // Feature Management
      { href: '/admin/challenges', label: 'التحديات', icon: Flame },
      { href: '/admin/badges', label: 'الأوسمة', icon: Trophy },
      { href: '/admin/schedule', label: 'جدول الدروس', icon: CalendarClock },
      { href: '/admin/qa', label: 'سؤال وجواب', icon: HelpCircle },
      { href: '/admin/shubuhat', label: 'حصن اليقين (الشبهات)', icon: ShieldCheck },
      { href: '/admin/inspiration', label: 'الأحاديث والحكم', icon: Quote },
      { href: '/admin/sins', label: 'إدارة المهلكات', icon: AlertTriangle },

      // Site Administration
      { href: '/admin/homepage', label: 'الرئيسية', icon: Megaphone },
      { href: '/admin/appearance', label: 'المظهر', icon: Palette },
      { href: '/admin/announcement', label: 'الإعلان', icon: Megaphone },
      { href: '/admin/donations', label: 'إدارة التبرعات', icon: Heart },
      { href: '/admin/users', label: 'المستخدمون', icon: UserCog },
    ];
    
      return (
          <div className="flex h-screen w-full bg-background overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />
            
            <aside className="hidden md:flex flex-col w-[280px] h-full border-r border-border/40 bg-card/30 backdrop-blur-2xl relative z-10 shadow-[4px_0_24px_-4px_rgba(0,0,0,0.3)]">
              <div className="flex flex-col h-full gap-2">
                <div className="flex h-20 items-center px-6 mt-2 relative">
                  <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                  <Link href="/admin/dashboard" className="flex items-center gap-3 font-semibold text-2xl group w-full">
                    <div className="p-2.5 bg-gradient-to-br from-primary/30 to-primary/10 rounded-xl group-hover:scale-105 transition-transform duration-300 shadow-lg shadow-primary/20 border border-primary/20">
                      <LayoutDashboard className="h-7 w-7 text-primary" />
                    </div>
                    <span className="font-headline tracking-tighter bg-clip-text text-transparent bg-gradient-to-l from-foreground to-foreground/70 drop-shadow-sm">مركز القيادة</span>
                  </Link>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar-gradient px-4 py-6">
                    <nav className="flex flex-col gap-1.5 text-sm font-medium">
                        {navItems.map(item => {
                            const Icon = item.icon;
                            const isActive = pathname.startsWith(item.href);
                            
                            return (
                              <Link
                                  key={item.label}
                                  href={item.href}
                                  className={cn(
                                      "flex items-center gap-3.5 rounded-xl px-4 py-3.5 text-muted-foreground transition-all duration-300 hover:text-foreground hover:bg-muted/50 relative overflow-hidden group",
                                    isActive ? "bg-primary/15 text-primary shadow-[inset_0px_1px_1px_rgba(255,255,255,0.05)] border border-primary/20 font-bold" : "border border-transparent"
                                  )}
                              >
                                  {isActive && <div className="absolute right-0 top-1/4 bottom-1/4 w-1.5 bg-primary rounded-l-full shadow-[0_0_10px_2px_rgba(var(--primary-rgb),0.5)]" />}
                                  <div className={cn("p-1.5 rounded-lg transition-colors duration-300", isActive ? "bg-primary/20" : "bg-transparent group-hover:bg-muted")}>
                                      <Icon className={cn("h-5 w-5 transition-transform duration-300 group-hover:scale-110", isActive && "text-primary")} />
                                  </div>
                                  <span className="text-[15px]">{item.label}</span>
                              </Link>
                            )
                        })}
                      </nav>
                </div>
                
                <div className="mt-auto p-4 space-y-3 bg-gradient-to-t from-background/80 to-transparent pt-8 relative">
                    <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
                  <Button onClick={handleLogout} size="sm" variant="ghost" className="w-full justify-start rounded-xl h-12 text-red-500/80 hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-300">
                    <LogOut className="ml-3 h-5 w-5" />
                    <span className="text-base">تسجيل الخروج</span>
                  </Button>
                  <Button size="sm" className="w-full justify-start rounded-xl h-12 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 shadow-sm transition-all duration-300" asChild>
                    <Link href="/">
                      <LayoutDashboard className="ml-3 h-5 w-5" />
                      <span className="text-base">العودة للموقع</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </aside>
            
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10 w-full">
              <header className="flex h-16 items-center gap-4 border-b border-border/40 bg-card/50 backdrop-blur-xl px-4 lg:px-6 md:hidden">
                  <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold">
                      <LayoutDashboard className="h-6 w-6 text-primary" />
                      <span className="font-headline tracking-tighter">مركز القيادة</span>
                  </Link>
              </header>
              <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-10 custom-scrollbar-gradient relative">
                {/* Subtle animated background shapes for the main content area */}
                <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="max-w-7xl mx-auto w-full relative z-10">
                    {children}
                </div>
              </main>
            </div>
          </div>
      );
  }

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
