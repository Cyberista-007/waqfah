'use client';

import { ReactNode, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import {
  AlertTriangle,
  Book,
  CalendarClock,
  Clapperboard,
  Copy,
  ExternalLink,
  Flame,
  GraduationCap,
  Heart,
  HelpCircle,
  Home,
  Layers,
  LayoutDashboard,
  ListVideo,
  Loader2,
  LogOut,
  Megaphone,
  Menu,
  Palette,
  Pin,
  Podcast,
  Quote,
  Search,
  ShieldCheck,
  ShieldX,
  Trophy,
  Upload,
  UserCog,
  X,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'نظرة عامة',
    items: [{ href: '/admin/dashboard', label: 'لوحة القيادة', icon: LayoutDashboard }],
  },
  {
    title: 'إدارة المحتوى',
    items: [
      { href: '/admin/programs', label: 'البرامج', icon: Podcast },
      { href: '/admin/series', label: 'السلاسل', icon: ListVideo },
      { href: '/admin/lectures', label: 'المحاضرات', icon: Clapperboard },
      { href: '/admin/books', label: 'الكتب', icon: Book },
      { href: '/admin/import', label: 'استيراد المحتوى', icon: Upload },
      { href: '/admin/duplicates', label: 'المكررات', icon: Copy },
    ],
  },
  {
    title: 'التنظيم والمناهج',
    items: [
      { href: '/admin/curriculums', label: 'المناهج', icon: GraduationCap },
      { href: '/admin/topics', label: 'المسارات', icon: Layers },
      { href: '/admin/pinned', label: 'العناصر المثبتة', icon: Pin },
    ],
  },
  {
    title: 'الميزات التفاعلية',
    items: [
      { href: '/admin/challenges', label: 'التحديات', icon: Flame },
      { href: '/admin/badges', label: 'الأوسمة', icon: Trophy },
      { href: '/admin/schedule', label: 'جدول الدروس', icon: CalendarClock },
      { href: '/admin/qa', label: 'سؤال وجواب', icon: HelpCircle },
      { href: '/admin/shubuhat', label: 'حصن اليقين (الشبهات)', icon: ShieldCheck },
      { href: '/admin/inspiration', label: 'الأحاديث والحكم', icon: Quote },
      { href: '/admin/sins', label: 'إدارة المهلكات', icon: AlertTriangle },
    ],
  },
  {
    title: 'إدارة المنصة',
    items: [
      { href: '/admin/homepage', label: 'الصفحة الرئيسية', icon: Home },
      { href: '/admin/appearance', label: 'المظهر والسمات', icon: Palette },
      { href: '/admin/announcement', label: 'شريط الإعلان', icon: Megaphone },
      { href: '/admin/donations', label: 'إدارة التبرعات', icon: Heart },
      { href: '/admin/users', label: 'المستخدمون', icon: UserCog },
    ],
  },
];

function SidebarContent({
  pathname,
  navFilter,
  setNavFilter,
  onNavigate,
  onLogout,
}: {
  pathname: string;
  navFilter: string;
  setNavFilter: (v: string) => void;
  onNavigate?: () => void;
  onLogout: () => void;
}) {
  const filteredGroups = useMemo(() => {
    const q = navFilter.trim().toLowerCase();
    if (!q) return NAV_GROUPS;
    return NAV_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter((item) => item.label.toLowerCase().includes(q)),
    })).filter((group) => group.items.length > 0);
  }, [navFilter]);

  return (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className="flex h-18 items-center justify-between px-5 py-4 border-b border-border/60 shrink-0">
        <Link
          href="/admin/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-3 font-black text-xl group"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-headline tracking-tight text-foreground leading-none">مركز القيادة</span>
            <span className="text-[11px] text-muted-foreground font-bold mt-1">إدارة منصة وقفة</span>
          </div>
        </Link>
      </div>

      {/* Sidebar Search */}
      <div className="px-4 pt-4 pb-2 shrink-0">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-muted-foreground absolute right-3 pointer-events-none" />
          <input
            type="text"
            value={navFilter}
            onChange={(e) => setNavFilter(e.target.value)}
            placeholder="ابحث في الأقسام..."
            className="w-full h-9 pr-9 pl-3 rounded-xl bg-background/60 border border-border/70 text-xs font-bold text-foreground placeholder:text-muted-foreground/70 outline-none focus:border-primary/60"
          />
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-3 space-y-5">
        {filteredGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <div className="px-3 pb-1 text-[11px] font-black text-muted-foreground/80">
              {group.title}
            </div>
            <nav className="flex flex-col gap-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all relative group',
                      isActive
                        ? 'bg-primary/15 text-primary border border-primary/25 shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-transparent'
                    )}
                  >
                    {isActive && (
                      <span className="absolute right-0 top-2 bottom-2 w-1 bg-primary rounded-l-full" />
                    )}
                    <div
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                        isActive ? 'bg-primary/20 text-primary' : 'bg-muted/40 group-hover:bg-muted'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
        {filteredGroups.length === 0 && (
          <p className="text-center text-xs text-muted-foreground py-8">لا توجد أقسام مطابقة.</p>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-border/60 space-y-2 shrink-0 bg-card/40">
        <Button
          size="sm"
          variant="outline"
          className="w-full justify-start rounded-xl h-10 font-bold border-border/70"
          asChild
        >
          <Link href="/" onClick={onNavigate}>
            <ExternalLink className="ml-2.5 h-4 w-4 text-primary" />
            <span>العودة للموقع</span>
          </Link>
        </Button>
        <Button
          onClick={onLogout}
          size="sm"
          variant="ghost"
          className="w-full justify-start rounded-xl h-10 font-bold text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
        >
          <LogOut className="ml-2.5 h-4 w-4" />
          <span>تسجيل الخروج</span>
        </Button>
      </div>
    </div>
  );
}

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isAdmin, isLoading } = useAdminAuth();
  const auth = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navFilter, setNavFilter] = useState('');

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
    }
    router.push('/');
  };

  const currentPageLabel = useMemo(() => {
    for (const group of NAV_GROUPS) {
      const found = group.items.find(
        (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
      );
      if (found) return found.label;
    }
    return 'لوحة التحكم';
  }, [pathname]);

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-bold text-muted-foreground">جاري التحقق من الصلاحيات...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex h-screen flex-col items-center justify-center text-center p-6 bg-background" dir="rtl">
        <div className="w-20 h-20 rounded-3xl bg-destructive/10 border border-destructive/25 flex items-center justify-center mb-5">
          <ShieldX className="w-10 h-10 text-destructive" />
        </div>
        <h1 className="text-3xl font-black font-headline mb-2 text-foreground">الوصول مرفوض</h1>
        <p className="text-base text-muted-foreground mb-7 max-w-md">
          عذراً، هذه المنطقة مخصصة لمديري المنصة فقط. يرجى تسجيل الدخول بحساب مدير للمتابعة.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild className="rounded-xl px-6 font-bold">
            <Link href="/">العودة إلى الصفحة الرئيسية</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl px-6 font-bold">
            <Link href="/auth/login">تسجيل الدخول</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative" dir="rtl">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.07),transparent_60%)] pointer-events-none" />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[275px] h-full border-l border-border/60 bg-card/50 backdrop-blur-2xl relative z-20 shrink-0">
        <SidebarContent
          pathname={pathname}
          navFilter={navFilter}
          setNavFilter={setNavFilter}
          onLogout={handleLogout}
        />
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative z-10 w-[285px] max-w-[85vw] h-full bg-card border-l border-border shadow-2xl flex flex-col">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="إغلاق القائمة"
              className="absolute top-4 left-4 w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center text-foreground z-20"
            >
              <X className="w-4 h-4" />
            </button>
            <SidebarContent
              pathname={pathname}
              navFilter={navFilter}
              setNavFilter={setNavFilter}
              onNavigate={() => setMobileMenuOpen(false)}
              onLogout={handleLogout}
            />
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10 w-full">
        {/* Top Admin Header */}
        <header className="flex h-16 items-center justify-between gap-4 border-b border-border/60 bg-card/40 backdrop-blur-xl px-4 sm:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="فتح قائمة الإدارة"
              className="md:hidden w-9 h-9 rounded-xl bg-muted/60 border border-border/60 flex items-center justify-center text-foreground"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black font-headline text-foreground">{currentPageLabel}</span>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-black">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                متصل
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="outline" className="rounded-xl h-9 text-xs font-bold hidden sm:inline-flex">
              <Link href="/" target="_blank" className="flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5 text-primary" />
                <span>معاينة الموقع</span>
              </Link>
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
