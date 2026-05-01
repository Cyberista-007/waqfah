
"use client"

import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Menu,
  Search,
  ChevronDown,
  ChevronLeft,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  Palette,
  CaseSensitive,
  Calendar,
  HelpCircle,
  Heart,
  Mail,
  ListMusic,
  Youtube,
  ImageIcon,
  Home,
  ListVideo,
  Settings,
  Podcast,
  Flame,
  BookCheck,
  Hash,
  Trophy,
  GraduationCap,
  Layers,
  BookOpen,
  Headphones,
  HandHeart,
  TriangleAlert,
  Shield,
  Medal,
  Flag,
  Sparkles
} from "lucide-react"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useScroll } from "@/hooks/use-scroll"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { signOut } from "firebase/auth"
import { useRouter } from "next/navigation"
import { Skeleton } from "./ui/skeleton"
import { useAdminAuth } from "@/hooks/use-admin-auth"
import { useState } from "react"
import { ThemeSwitcherDialog, themes } from "./theme-switcher"
import { FontSwitcherDialog } from "./font-switcher"
import { GradientSwitcherDialog } from "./gradient-switcher"
import { getInitials } from "@/lib/utils"
import { ScrollArea, ScrollBar } from "./ui/scroll-area"
import { Separator } from "./ui/separator"
import { useTheme } from "next-themes"
import { AppearanceManager } from "./appearance-manager"
import { useAppearance } from "./appearance-provider"
import { Switch } from "./ui/switch"
import { Label } from "./ui/label"
import { ThemeToggle } from "./theme-toggle"
import { NotificationBell } from "./notification-bell"
import { useAuth, useUser } from "@/firebase"
import { useSearch } from "./search-provider"
import { LanguageSwitcherDialog, languages } from "./language-switcher"
import Magnetic from "./magnetic"

const mainNavItems = [
  { href: "/", label: "الرئيسية", icon: Home },
  { href: "/pathways", label: "المسارات", icon: GraduationCap },
  { href: "/live", label: "البث المباشر", icon: Youtube, isLive: true },
  { href: "/programs", label: "البرامج", icon: Podcast },
  { href: "/lectures", label: "المحاضرات", icon: ListVideo },
  { href: "/palestine", label: "فلسطين", icon: Flag },
  { href: "/profile", label: "مكتبتي", icon: ListMusic },
]

const moreNavItems = [
  { href: "/badges", label: "الأوسمة", icon: Medal },
  { href: "/adhkar", label: "الأذكار والتسبيحات", icon: Headphones },
  { href: "/hadith", label: "الحديث النبوي", icon: BookOpen },
  { href: "/dua", label: "الأدعية المأثورة", icon: HandHeart },
  { href: "/quran", label: "آيات قرآنية", icon: Layers },
  { href: "/muhlikat", label: "المهلكات", icon: TriangleAlert },
  { href: "/shubuhat", label: "تفنيد الشبهات", icon: Shield },
  { href: "/essentials", label: "ما لا يسع المسلم جهله", icon: BookCheck },
  { href: "/aqeedah", label: "العقيدة", icon: Shield },
  { href: "/curriculums", label: "المناهج التعليمية", icon: GraduationCap },
  { href: "/leaderboard", label: "لوحة الصدارة", icon: Trophy },
  { href: "/playlists", label: "قوائم التشغيل", icon: ListMusic },
  { href: "/books", label: "الكتب", icon: BookOpen },
  { href: "/challenges", label: "التحديات", icon: Flame },
  { href: "/accountability", label: "محاسبة النفس", icon: BookCheck },
  { href: "/qa", label: "سؤال وجواب", icon: HelpCircle },
  { href: "/contact", label: "تواصل معنا", icon: Mail },
]

const mobileNavLinks = [
  { href: '/', icon: Home, label: 'الرئيسية' },
  { href: '/programs', icon: Podcast, label: 'البرامج' },
  { href: '/palestine', icon: Flag, label: 'فلسطين' },
  { href: '/search', icon: Search, label: 'بحث' },
  { href: '/accountability', icon: BookCheck, label: 'محاسبة' },
  { href: '/profile', icon: ListMusic, label: 'مكتبتي' },
  { href: '/settings', icon: Settings, label: 'الإعدادات' }
];

export function SiteHeader() {
  const scrolled = useScroll(50);
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { isAdmin } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isThemeSwitcherOpen, setIsThemeSwitcherOpen] = useState(false);
  const [isFontSwitcherOpen, setIsFontSwitcherOpen] = useState(false);
  const [isGradientSwitcherOpen, setIsGradientSwitcherOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const { isBackgroundShown, toggleBackground } = useAppearance();
  const [isLanguageSwitcherOpen, setIsLanguageSwitcherOpen] = useState(false);
  const { openSearch } = useSearch();
  const { language: activeLanguage } = useAppearance();

  const activeLanguageName = languages.find(l => l.value === activeLanguage)?.name.slice(0, 2) || 'عر';

  const toggleHeader = () => setIsHeaderHidden(!isHeaderHidden);

  const toggleTheme = () => {
    const currentIndex = themes.findIndex((t) => t.value === theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex]?.value;
    if (nextTheme) {
      setTheme(nextTheme);
    }
  };


  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
    }
    router.push('/');
  }

  const dynamicMoreNavItems = isAdmin
    ? [...moreNavItems, { href: "/admin/dashboard", label: "لوحة التحكم", icon: LayoutDashboard }]
    : moreNavItems;

  return (
    <>
      <AppearanceManager />
      {/* Dynamic Floating Trigger for Hidden Header */}
      <AnimatePresence>
        {isHeaderHidden && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 z-[60] pt-2"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsHeaderHidden(false)}
              className="h-6 w-16 bg-background/40 backdrop-blur-3xl border border-white/10 rounded-b-full hover:bg-primary/20 hover:h-8 transition-all group shadow-2xl"
              title="إظهار الشريط العلوي"
            >
              <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-primary animate-bounce-subtle" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Header */}
      <motion.header 
        initial={false}
        animate={{ 
          y: isHeaderHidden ? -120 : 0,
          opacity: isHeaderHidden ? 0 : 1
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "sticky z-50 transition-all duration-700 ease-in-out px-4",
          scrolled 
            ? "top-4 w-full bg-zinc-950/60 backdrop-blur-3xl shadow-[0_32px_64px_-15px_rgba(0,0,0,0.7)] border border-white/10 rounded-[3rem] py-0.5 ring-1 ring-white/5" 
            : "top-0 bg-transparent border-transparent py-6"
        )}
      >
        <nav className="w-full px-4 sm:px-12 py-3 flex justify-between items-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0">
              <div className="flex flex-col h-full bg-background">
                <div className="p-6 border-b">
                  <h2 className="text-2xl font-black font-headline text-primary italic">وقـــفــــة</h2>
                  <p className="text-xs text-muted-foreground mt-1">القائمة الرئيسية للمنصة</p>
                </div>
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <p className="px-2 pb-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">التنقل السريع</p>
                      {mainNavItems.map(item => (
                        <SheetClose asChild key={item.href}>
                          <Link href={item.href} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-primary/10 transition-colors font-bold group">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/20 group-hover:bg-primary transition-colors" />
                            {item.label}
                          </Link>
                        </SheetClose>
                      ))}
                    </div>
                    <div className="space-y-1">
                      <p className="px-2 pb-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">الأقسام الإضافية</p>
                      {dynamicMoreNavItems.map(item => (
                        <SheetClose asChild key={item.href}>
                          <Link href={item.href} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-muted transition-colors text-sm font-medium">
                            {item.icon && <item.icon className="h-5 w-5 text-muted-foreground" />}
                            {item.label}
                          </Link>
                        </SheetClose>
                      ))}
                    </div>
                  </div>
                </ScrollArea>
                <div className="p-4 border-t bg-muted/30">
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setIsThemeSwitcherOpen(true)}>ثيمات</Button>
                    <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setIsFontSwitcherOpen(true)}>الخطوط</Button>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Link
            href="/"
            className="flex items-center space-x-2 space-x-reverse cursor-pointer group"
          >
            <div className="relative">
                <div className="text-3xl font-black font-headline tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/40 transition-all duration-500 group-hover:tracking-normal">
                وقـــفــــة
                </div>
                <div className="absolute -bottom-1 right-0 w-0 h-0.5 bg-primary transition-all duration-500 group-hover:w-full opacity-50" />
            </div>
          </Link>

          <div className="hidden md:flex flex-grow overflow-hidden">
            <ScrollArea className="w-full whitespace-nowrap" dir="rtl">
              <div className="flex justify-center items-center gap-2 px-4 py-1">
                {mainNavItems.map((item) => {
                  const isActive = (item.href === '/' && pathname === '/') || (item.href !== '/' && pathname.startsWith(item.href));
                  return (
                    <Button asChild key={item.label} variant="ghost" className={cn(
                      "relative text-foreground/70 hover:text-primary font-bold shrink-0 flex items-center gap-2 rounded-2xl transition-all hover:scale-105 active:scale-95 group px-4 py-6",
                      isActive && "text-primary"
                    )}>
                      <Link href={item.href}>
                        <item.icon className={cn("h-4 w-4 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6", isActive ? "opacity-100 text-primary scale-110" : "opacity-40 group-hover:opacity-100")} />
                        <span className="relative z-10">{item.label}</span>
                        {(item as any).isLive && (
                           <span className="relative flex h-2 w-2 ml-1">
                             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                             <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                           </span>
                        )}
                        {isActive && (
                          <motion.div
                            layoutId="activeNav"
                            className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-[1.2rem] -z-10 shadow-[inset_0_0_20px_rgba(var(--primary-rgb),0.1)]"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-1 bg-primary rounded-full transition-all duration-500 group-hover:w-4 opacity-0 group-hover:opacity-100" />
                      </Link>
                    </Button>
                  );
                })}
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Button variant="ghost" className="text-foreground/80 hover:text-primary font-bold shrink-0 flex items-center gap-2 rounded-2xl group transition-all hover:scale-105 active:scale-95">
                      <ChevronDown className="h-4 w-4 opacity-50 group-hover:opacity-100" />
                      <span>المزيد</span>
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-64 p-3 bg-background/95 backdrop-blur-xl border-border rounded-3xl shadow-2xl" dir="rtl">
                    <div className="flex flex-col space-y-1">
                      <p className="px-3 pb-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">أقسام إضافية</p>
                      {dynamicMoreNavItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.label}
                            href={item.href}
                            className="flex justify-between w-full items-center gap-3 p-3 rounded-2xl hover:bg-primary/10 transition-all font-bold group"
                          >
                            <div className="flex items-center gap-3">
                              {Icon && <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />}
                              <span>{item.label}</span>
                            </div>
                            <ChevronLeft className="h-4 w-4 opacity-0 group-hover:opacity-50 transition-opacity" />
                          </Link>
                        )
                      })}
                      <Separator className="my-2 bg-border/40" />
                      <button onClick={() => setIsThemeSwitcherOpen(true)} className="flex justify-start w-full items-center gap-3 p-3 rounded-2xl hover:bg-primary/10 transition-all font-bold group">
                        <Palette className="h-4 w-4 text-primary" />
                        <span>تغيير الثيم</span>
                      </button>
                      <button onClick={() => setIsFontSwitcherOpen(true)} className="flex justify-start w-full items-center gap-3 p-3 rounded-2xl hover:bg-primary/10 transition-all font-bold group">
                        <CaseSensitive className="h-4 w-4 text-primary" />
                        <span>تغيير الخط</span>
                      </button>
                      <button onClick={() => setIsGradientSwitcherOpen(true)} className="flex justify-start w-full items-center gap-3 p-3 rounded-2xl hover:bg-primary/10 transition-all font-bold group">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span>تدرجات الألوان</span>
                      </button>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
              <ScrollBar orientation="horizontal" className="h-2 opacity-0 hover:opacity-100 transition-opacity" />
            </ScrollArea>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center bg-white/5 border border-white/10 rounded-full px-3 py-1.5 gap-2 hover:bg-white/10 transition-all cursor-pointer group" onClick={openSearch}>
                <Search className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-xs text-muted-foreground/60 group-hover:text-muted-foreground font-medium">ابحث عن أي شيء...</span>
                <kbd className="hidden xl:flex h-5 select-none items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </div>

            <button 
              onClick={openSearch}
              className="lg:hidden p-2 rounded-full text-foreground/70 hover:text-primary hover:bg-primary/10 transition-colors"
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">بحث</span>
            </button>

            <NotificationBell />

            <button 
              onClick={() => setIsHeaderHidden(true)}
              className="hidden md:flex p-2 rounded-full text-foreground/70 hover:text-primary hover:bg-primary/10 transition-colors"
              title="إخفاء الشريط العلوي"
            >
              <ChevronDown className="h-5 w-5 rotate-180" />
            </button>

            <ThemeToggle onClick={() => setIsThemeSwitcherOpen(true)} />

            <button
                onClick={() => setIsLanguageSwitcherOpen(true)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group relative overflow-hidden"
            >
                <span className="text-[10px] font-black group-hover:scale-110 transition-transform z-10">{activeLanguageName}</span>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            <Magnetic strength={0.1}>
              <Button asChild variant="outline" className="hidden md:flex border-primary/40 text-primary hover:bg-primary/10 btn-magnetic rounded-full relative overflow-hidden group/donate shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]">
                <Link href="/donations">
                  <Heart className="me-2 h-4 w-4 fill-primary/20 group-hover/donate:fill-primary transition-all group-hover/donate:scale-110" />
                  <span className="relative z-10 font-black">ادعمنا</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 translate-x-[-100%] group-hover/donate:translate-x-[100%] transition-transform duration-1000" />
                </Link>
              </Button>
            </Magnetic>

            {isUserLoading ? (
              <Skeleton className="w-10 h-10 rounded-full" />
            ) : (
              <>
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar>
                          <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
                          <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-background border-border">
                      <DropdownMenuItem asChild>
                        <Link href="/profile"><UserIcon className="me-2 h-4 w-4" />الملف الشخصي</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/settings"><Settings className="me-2 h-4 w-4" />الإعدادات</Link>
                      </DropdownMenuItem>
                      {isAdmin && (
                        <DropdownMenuItem asChild>
                          <Link href="/admin/dashboard"><LayoutDashboard className="me-2 h-4 w-4" />لوحة التحكم</Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="me-2 h-4 w-4" />
                        تسجيل الخروج
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button asChild className="btn-magnetic animate-pulse-subtle bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
                    <Link href="/auth/login">
                      <span className="relative z-10 font-bold">تسجيل الدخول</span>
                    </Link>
                  </Button>
                )}
              </>
            )}
          </div>
        </nav>
      </motion.header>

      {/* Mobile Bottom Nav (Floating Dock Style) */}
      <motion.div 
        animate={{ 
          y: isHeaderHidden ? 150 : 0,
          opacity: isHeaderHidden ? 0 : 1
        }} 
        className="md:hidden fixed bottom-6 left-4 right-4 z-40 h-20 bg-background/40 border border-white/10 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-around px-2 overflow-hidden"
      >
          {mobileNavLinks.map((item) => {
            const isActive = (item.href === '/' && pathname === '/') || (item.href !== '/' && pathname.startsWith(item.href));
            const href = ((item.href === '/profile' || item.href === '/settings') && !user) ? `/auth/login?redirect_to=${item.href}` : item.href;
            return (
              <Link key={item.label} href={href} className="relative flex flex-col items-center justify-center w-full h-full group touch-none">
                <div className={cn(
                    "flex flex-col items-center transition-all duration-300",
                    isActive ? "scale-110 -translate-y-1" : "scale-100 opacity-60"
                )}>
                    <item.icon className={cn("w-6 h-6 mb-1 text-muted-foreground group-hover:text-primary", isActive && "text-primary")} />
                    <span className={cn("text-[10px] font-bold text-muted-foreground group-hover:text-primary", isActive && "text-primary")}>{item.label}</span>
                </div>
                {isActive && (
                    <motion.div 
                        layoutId="activeBottomNav"
                        className="absolute bottom-1 w-1 h-1 bg-primary rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" 
                    />
                )}
              </Link>
            );
          })}
      </motion.div>

      <ThemeSwitcherDialog isOpen={isThemeSwitcherOpen} onOpenChange={setIsThemeSwitcherOpen} />
      <FontSwitcherDialog isOpen={isFontSwitcherOpen} onOpenChange={setIsFontSwitcherOpen} />
      <GradientSwitcherDialog isOpen={isGradientSwitcherOpen} onOpenChange={setIsGradientSwitcherOpen} />
      <LanguageSwitcherDialog isOpen={isLanguageSwitcherOpen} onOpenChange={setIsLanguageSwitcherOpen} />
    </>
  )
}
