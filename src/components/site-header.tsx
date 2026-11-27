"use client"

import { useState } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { signOut } from "firebase/auth"
import {
  Menu,
  Search,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  Palette,
  CaseSensitive,
  HelpCircle,
  Heart,
  Mail,
  ListMusic,
  Radio,
  Home,
  ListVideo,
  Settings,
  Podcast,
  Flame,
  BookCheck,
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
  Sparkles,
  Droplets,
  Scale,
  Compass,
  Mic2,
  Grid2x2,
} from "lucide-react"

import { cn, getInitials } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useScroll } from "@/hooks/use-scroll"
import { useAdminAuth } from "@/hooks/use-admin-auth"
import { useAppearance } from "@/components/appearance-provider"
import { AppearanceManager } from "@/components/appearance-manager"
import { NotificationBell } from "@/components/notification-bell"
import { useAuth, useUser } from "@/firebase"
import { useSearch } from "@/components/search-provider"
import { useTranslation } from "@/lib/i18n"
import { languages } from "@/components/language-switcher"

const ThemeSwitcherDialog = dynamic(
  () => import("./theme-switcher").then((mod) => mod.ThemeSwitcherDialog),
  { ssr: false }
)
const FontSwitcherDialog = dynamic(
  () => import("./font-switcher").then((mod) => mod.FontSwitcherDialog),
  { ssr: false }
)
const SolidColorSwitcherDialog = dynamic(
  () => import("./solid-color-switcher").then((mod) => mod.SolidColorSwitcherDialog),
  { ssr: false }
)
const LanguageSwitcherDialog = dynamic(
  () => import("./language-switcher").then((mod) => mod.LanguageSwitcherDialog),
  { ssr: false }
)

interface NavItem {
  href: string
  label: string
  enLabel: string
  icon: React.ComponentType<{ className?: string }>
  isLive?: boolean
}

const PRIMARY_NAV_ITEMS: NavItem[] = [
  { href: "/", label: "الرئيسية", enLabel: "Home", icon: Home },
  { href: "/podcasts", label: "البودكاست", enLabel: "Podcasts", icon: Mic2 },
  { href: "/radio", label: "الإذاعة", enLabel: "Radio", icon: Headphones },
  { href: "/pathways", label: "المسارات", enLabel: "Pathways", icon: GraduationCap },
  { href: "/live", label: "البث المباشر", enLabel: "Live", icon: Radio, isLive: true },
]

const SECONDARY_QUICK_ITEMS: NavItem[] = [
  { href: "/pathways", label: "المسارات", enLabel: "Pathways", icon: GraduationCap },
  { href: "/programs", label: "البرامج", enLabel: "Programs", icon: Podcast },
  { href: "/lectures", label: "المحاضرات", enLabel: "Lectures", icon: ListVideo },
  { href: "/palestine", label: "فلسطين", enLabel: "Palestine", icon: Flag },
  { href: "/profile", label: "مكتبتي", enLabel: "My Library", icon: ListMusic },
]

const MORE_NAV_ITEMS: NavItem[] = [
  { href: "/hadith", label: "الحديث النبوي", enLabel: "Hadith", icon: BookOpen },
  { href: "/quran", label: "آيات قرآنية", enLabel: "Quran Verses", icon: Layers },
  { href: "/adhkar", label: "الأذكار والتسبيحات", enLabel: "Adhkar", icon: Headphones },
  { href: "/dua", label: "الأدعية المأثورة", enLabel: "Duas", icon: HandHeart },
  { href: "/books", label: "الكتب", enLabel: "Books", icon: BookOpen },
  { href: "/playlists", label: "قوائم التشغيل", enLabel: "Playlists", icon: ListMusic },
  { href: "/bayan", label: "بيان (معجم المفردات)", enLabel: "Bayan (Lexicon)", icon: Sparkles },
  { href: "/athar", label: "أثر (أطلس التاريخ)", enLabel: "Athar (Atlas)", icon: Compass },
  { href: "/namaa", label: "نماء (حاسبة الزكاة)", enLabel: "Namaa (Zakat)", icon: Scale },
  { href: "/mirath", label: "حاسبة المواريث", enLabel: "Inheritance Calc", icon: Scale },
  { href: "/adab", label: "أدب (الآداب الأخلاقية)", enLabel: "Adab (Ethics)", icon: BookCheck },
  { href: "/kanaf", label: "كنف (البيت والتربية)", enLabel: "Kanaf (Family)", icon: Heart },
  { href: "/aqeedah", label: "العقيدة", enLabel: "Aqeedah", icon: Shield },
  { href: "/essentials", label: "ما لا يسع المسلم جهله", enLabel: "Essentials", icon: BookCheck },
  { href: "/sciences-tree", label: "شجرة العلوم الشرعية", enLabel: "Sciences Tree", icon: Compass },
  { href: "/memorize", label: "حافظ المتون التفاعلي", enLabel: "Memorization", icon: BookOpen },
  { href: "/curriculums", label: "المناهج التعليمية", enLabel: "Curriculums", icon: GraduationCap },
  { href: "/shubuhat", label: "تفنيد الشبهات", enLabel: "Refutations", icon: Shield },
  { href: "/muhlikat", label: "المهلكات", enLabel: "Heart Diseases", icon: TriangleAlert },
  { href: "/chastity", label: "درع العفة", enLabel: "Chastity Shield", icon: Shield },
  { href: "/accountability", label: "محاسبة النفس", enLabel: "Accountability", icon: BookCheck },
  { href: "/challenges", label: "التحديات", enLabel: "Challenges", icon: Flame },
  { href: "/badges", label: "الأوسمة", enLabel: "Badges", icon: Medal },
  { href: "/leaderboard", label: "لوحة الصدارة", enLabel: "Leaderboard", icon: Trophy },
  { href: "/qa", label: "سؤال وجواب", enLabel: "Q & A", icon: HelpCircle },
  { href: "/contact", label: "تواصل معنا", enLabel: "Contact Us", icon: Mail },
]

const MOBILE_DOCK_ITEMS: NavItem[] = [
  { href: "/", icon: Home, label: "الرئيسية", enLabel: "Home" },
  { href: "/programs", icon: Podcast, label: "البرامج", enLabel: "Programs" },
  { href: "/palestine", icon: Flag, label: "فلسطين", enLabel: "Palestine" },
  { href: "/search", icon: Search, label: "بحث", enLabel: "Search" },
  { href: "/profile", icon: ListMusic, label: "مكتبتي", enLabel: "Library" },
]

export function SiteHeader() {
  const scrolled = useScroll(32)
  const { user, isUserLoading } = useUser()
  const auth = useAuth()
  const { isAdmin } = useAdminAuth()
  const router = useRouter()
  const pathname = usePathname()

  const [isThemeSwitcherOpen, setIsThemeSwitcherOpen] = useState(false)
  const [isFontSwitcherOpen, setIsFontSwitcherOpen] = useState(false)
  const [isSolidColorSwitcherOpen, setIsSolidColorSwitcherOpen] = useState(false)
  const [isLanguageSwitcherOpen, setIsLanguageSwitcherOpen] = useState(false)
  const [isHeaderHidden, setIsHeaderHidden] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const { openSearch } = useSearch()
  const { language: activeLanguage } = useAppearance()
  const { t, isRtl } = useTranslation()

  const activeLanguageCode =
    activeLanguage === "en"
      ? "EN"
      : languages.find((l) => l.value === activeLanguage)?.name.slice(0, 2) || "عر"

  const isRouteActive = (href: string) =>
    (href === "/" && pathname === "/") || (href !== "/" && pathname.startsWith(href))

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth)
    }
    router.push("/")
  }

  const allDrawerMain = Array.from(
    new Map(
      [...PRIMARY_NAV_ITEMS, ...SECONDARY_QUICK_ITEMS].map((item) => [item.href, item])
    ).values()
  )
  const drawerMore = isAdmin
    ? [
        ...MORE_NAV_ITEMS,
        {
          href: "/admin/dashboard",
          label: "لوحة التحكم",
          enLabel: "Admin Dashboard",
          icon: LayoutDashboard,
        },
      ]
    : MORE_NAV_ITEMS

  return (
    <>
      <AppearanceManager />

      {/* Reveal button when header is collapsed */}
      <AnimatePresence>
        {isHeaderHidden && (
          <motion.div
            initial={{ y: -24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -24, opacity: 0 }}
            className="fixed top-2 left-1/2 -translate-x-1/2 z-[60]"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsHeaderHidden(false)}
              className="h-7 px-3 rounded-full bg-card/90 backdrop-blur-md border-border shadow-md hover:border-primary/50 hover:text-primary gap-1 text-xs font-bold"
              title={t("إظهار الشريط العلوي", "Show Header")}
              aria-label={t("إظهار الشريط العلوي", "Show Header")}
            >
              <ChevronDown className="h-3.5 w-3.5" />
              <span>{t("إظهار القائمة", "Show Bar")}</span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Sticky Header */}
      <header
        dir={isRtl ? "rtl" : "ltr"}
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300",
          isHeaderHidden && "-translate-y-full opacity-0 pointer-events-none",
          scrolled ? "px-3 sm:px-6 pt-2.5" : "px-0 pt-0"
        )}
      >
        <div
          className={cn(
            "mx-auto transition-all duration-300",
            scrolled
              ? "max-w-[1440px] rounded-2xl border border-border/80 bg-background/90 backdrop-blur-xl shadow-lg px-3 sm:px-5"
              : "w-full border-b border-border/60 bg-background/85 backdrop-blur-md px-4 sm:px-8"
          )}
        >
          <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-3">
            {/* Start Zone: Navigation Drawer + Brand Logo */}
            <div className="flex items-center gap-2.5 shrink-0">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-xl border-border/80 bg-card/60 hover:bg-muted hover:border-primary/40 hover:text-primary shrink-0"
                    aria-label={t("فتح القائمة الجانبية للتنقل", "Open navigation menu")}
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side={isRtl ? "right" : "left"}
                  className="w-[310px] sm:w-[360px] p-0 border-border bg-background text-foreground shadow-2xl flex flex-col h-full"
                  dir={isRtl ? "rtl" : "ltr"}
                >
                  {isMobileMenuOpen && (
                    <div className="flex flex-col h-full">
                      <div className="p-5 border-b border-border bg-card/50 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h2 className="text-xl font-black font-headline text-primary">
                              {t("وقـــفــــة", "WAQFAH")}
                            </h2>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {t("القائمة الرئيسية للمنصة", "Main Navigation")}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsMobileMenuOpen(false)
                            openSearch()
                          }}
                          className="w-full flex items-center justify-between gap-2 rounded-xl border border-border bg-muted/50 hover:bg-muted px-3 py-2 text-xs text-muted-foreground transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <Search className="h-3.5 w-3.5 text-primary" />
                            <span>{t("ابحث عن درس أو شيخ...", "Search lectures, scholars...")}</span>
                          </span>
                          <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px]">
                            ⌘K
                          </kbd>
                        </button>
                      </div>

                      <ScrollArea className="flex-1 p-4">
                        <div className="space-y-6">
                          <div className="space-y-1">
                            <p className="px-2.5 pb-1 text-[11px] font-bold text-muted-foreground">
                              {t("التنقل السريع", "Quick Navigation")}
                            </p>
                            {allDrawerMain.map((item) => {
                              const active = isRouteActive(item.href)
                              return (
                                <SheetClose asChild key={item.href}>
                                  <Link
                                    href={item.href}
                                    prefetch={false}
                                    className={cn(
                                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors",
                                      active
                                        ? "bg-primary/10 text-primary"
                                        : "text-foreground/80 hover:text-primary hover:bg-muted/60"
                                    )}
                                  >
                                    <item.icon className="h-4 w-4 shrink-0" />
                                    <span className="flex-1">{t(item.label, item.enLabel)}</span>
                                    {item.isLive && (
                                      <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                                      </span>
                                    )}
                                  </Link>
                                </SheetClose>
                              )
                            })}
                          </div>

                          <Separator />

                          <div className="space-y-1">
                            <p className="px-2.5 pb-1 text-[11px] font-bold text-muted-foreground">
                              {t("الأقسام والمعارف", "Sections & Tools")}
                            </p>
                            {drawerMore.map((item) => {
                              const active = isRouteActive(item.href)
                              return (
                                <SheetClose asChild key={item.href}>
                                  <Link
                                    href={item.href}
                                    prefetch={false}
                                    className={cn(
                                      "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors",
                                      active
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                                    )}
                                  >
                                    <item.icon className="h-4 w-4 shrink-0" />
                                    <span>{t(item.label, item.enLabel)}</span>
                                  </Link>
                                </SheetClose>
                              )
                            })}
                          </div>
                        </div>
                      </ScrollArea>

                      <div className="p-4 border-t border-border bg-card/40 grid grid-cols-3 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl text-xs font-bold gap-1.5"
                          onClick={() => setIsThemeSwitcherOpen(true)}
                        >
                          <Palette className="h-3.5 w-3.5 text-primary" />
                          <span>{t("الثيم", "Theme")}</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl text-xs font-bold gap-1.5"
                          onClick={() => setIsFontSwitcherOpen(true)}
                        >
                          <CaseSensitive className="h-3.5 w-3.5 text-primary" />
                          <span>{t("الخط", "Font")}</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl text-xs font-bold"
                          onClick={() => setIsLanguageSwitcherOpen(true)}
                        >
                          {activeLanguageCode}
                        </Button>
                      </div>
                    </div>
                  )}
                </SheetContent>
              </Sheet>

              <Link
                href="/"
                className="flex items-center gap-2 shrink-0 whitespace-nowrap group"
              >
                <span className="text-2xl font-black font-headline tracking-tight text-foreground group-hover:text-primary transition-colors">
                  {t("وقفة", "WAQFAH")}
                </span>
              </Link>
            </div>

            {/* Center Zone: Bounded, Non-Overlapping Primary Links */}
            <nav
              aria-label={t("التنقل الرئيسي", "Primary navigation")}
              className="hidden lg:flex flex-1 min-w-0 overflow-x-auto px-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              <div className="mx-auto flex w-max items-center justify-center gap-1">
                {PRIMARY_NAV_ITEMS.map((item) => {
                  const active = isRouteActive(item.href)
                  const isXlOnly = item.href === "/pathways"
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch={false}
                      className={cn(
                        isXlOnly ? "hidden xl:inline-flex" : "inline-flex",
                        "items-center gap-1.5 px-2.5 py-1.5 xl:px-3 xl:py-2 rounded-xl text-[13px] xl:text-sm font-bold whitespace-nowrap shrink-0 transition-colors",
                        active
                          ? "bg-primary/12 text-primary border border-primary/25"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-transparent"
                      )}
                    >
                      <item.icon className={cn("h-4 w-4 shrink-0", active && "text-primary")} />
                      <span>{t(item.label, item.enLabel)}</span>
                      {item.isLive && (
                        <span className="relative flex h-2 w-2 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                        </span>
                      )}
                    </Link>
                  )
                })}

                {/* 2xl+ Extra Direct Link */}
                <Link
                  href="/programs"
                  prefetch={false}
                  className={cn(
                    "hidden 2xl:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold whitespace-nowrap shrink-0 transition-colors",
                    isRouteActive("/programs")
                      ? "bg-primary/12 text-primary border border-primary/25"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-transparent"
                  )}
                >
                  <Podcast className="h-4 w-4 shrink-0" />
                  <span>{t("البرامج", "Programs")}</span>
                </Link>

                {/* Click-Friendly More Dropdown */}
                <DropdownMenu dir={isRtl ? "rtl" : "ltr"}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-9 px-2.5 xl:px-3 rounded-xl text-[13px] xl:text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-muted/60 gap-1.5 whitespace-nowrap shrink-0"
                    >
                      <Grid2x2 className="h-4 w-4" />
                      <span>{t("الأقسام", "Sections")}</span>
                      <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                    </Button>
                  </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="center"
                  className="w-[460px] p-3 rounded-2xl border-border bg-popover text-popover-foreground shadow-xl"
                >
                  <div className="mb-2.5">
                    <DropdownMenuLabel className="px-2 py-1 text-[11px] font-bold text-muted-foreground">
                      {t("وصول سريع", "Quick Access")}
                    </DropdownMenuLabel>
                    <div className="grid grid-cols-2 gap-1.5 mt-1">
                      {SECONDARY_QUICK_ITEMS.map((item) => (
                        <DropdownMenuItem key={item.href} asChild className="rounded-xl cursor-pointer">
                          <Link
                            href={item.href}
                            prefetch={false}
                            className="flex items-center justify-between gap-2 px-2.5 py-2 font-bold text-xs"
                          >
                            <span className="flex items-center gap-2">
                              <item.icon className="h-4 w-4 text-primary shrink-0" />
                              <span>{t(item.label, item.enLabel)}</span>
                            </span>
                            <ChevronLeft className="h-3.5 w-3.5 opacity-40" />
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  </div>

                  <DropdownMenuSeparator />

                  <DropdownMenuLabel className="px-2 py-1 text-[11px] font-bold text-muted-foreground mt-1">
                    {t("المكتبة والأدوات التفاعلية", "Library & Interactive Tools")}
                  </DropdownMenuLabel>
                  <ScrollArea className="h-[260px] mt-1">
                    <div className="grid grid-cols-2 gap-1 pe-2">
                      {drawerMore.map((item) => (
                        <DropdownMenuItem key={item.href} asChild className="rounded-xl cursor-pointer">
                          <Link
                            href={item.href}
                            prefetch={false}
                            className="flex items-center gap-2 px-2.5 py-2 text-xs font-semibold"
                          >
                            <item.icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="truncate">{t(item.label, item.enLabel)}</span>
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  </ScrollArea>

                  <DropdownMenuSeparator className="my-2" />

                  <div className="grid grid-cols-3 gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start gap-2 rounded-xl text-xs font-bold"
                      onClick={() => setIsThemeSwitcherOpen(true)}
                    >
                      <Palette className="h-3.5 w-3.5 text-primary" />
                      <span>{t("الثيم", "Theme")}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start gap-2 rounded-xl text-xs font-bold"
                      onClick={() => setIsFontSwitcherOpen(true)}
                    >
                      <CaseSensitive className="h-3.5 w-3.5 text-primary" />
                      <span>{t("الخط", "Font")}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start gap-2 rounded-xl text-xs font-bold"
                      onClick={() => setIsSolidColorSwitcherOpen(true)}
                    >
                      <Droplets className="h-3.5 w-3.5 text-primary" />
                      <span>{t("الألوان", "Colors")}</span>
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              </div>
            </nav>

            {/* End Zone: Search, Utilities, Donate CTA, User */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Single-line Search Pill on xl+ */}
              <button
                type="button"
                onClick={openSearch}
                className="hidden xl:flex items-center justify-between gap-2.5 h-9 w-44 2xl:w-56 rounded-xl border border-border/80 bg-muted/50 hover:bg-muted hover:border-primary/40 px-3 text-xs text-muted-foreground transition-colors whitespace-nowrap shrink-0 group"
                aria-label={t("بحث", "Search")}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="truncate font-medium">
                    {t("ابحث في وقفة...", "Search Waqfah...")}
                  </span>
                </span>
                <kbd className="hidden 2xl:inline-flex h-5 items-center gap-0.5 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-semibold text-muted-foreground shrink-0">
                  ⌘K
                </kbd>
              </button>

              {/* Compact Search Icon on smaller screens */}
              <Button
                variant="outline"
                size="icon"
                onClick={openSearch}
                className="xl:hidden h-9 w-9 rounded-xl border-border/80 bg-card/60 hover:bg-muted hover:text-primary shrink-0"
                aria-label={t("بحث", "Search")}
              >
                <Search className="h-4 w-4" />
              </Button>

              <NotificationBell />

              {/* Unified Compact Utility Bar (Appearance, Language, Collapse Header) */}
              <div className="hidden md:flex items-center rounded-xl border border-border/80 bg-muted/40 p-0.5 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsThemeSwitcherOpen(true)}
                  className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-background"
                  title={t("المظهر والثيمات", "Theme & Appearance")}
                  aria-label={t("المظهر والثيمات", "Theme & Appearance")}
                >
                  <Palette className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsLanguageSwitcherOpen(true)}
                  className="h-8 px-2 rounded-lg text-[11px] font-black text-muted-foreground hover:text-primary hover:bg-background"
                  title={t("تغيير اللغة", "Change Language")}
                  aria-label={t("تغيير اللغة", "Change Language")}
                >
                  {activeLanguageCode}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsHeaderHidden(true)}
                  className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-background"
                  title={t("إخفاء الشريط العلوي", "Hide Header")}
                  aria-label={t("إخفاء الشريط العلوي", "Hide Header")}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
              </div>

              {/* Donate Button */}
              <Button
                asChild
                variant="outline"
                size="sm"
                className="hidden sm:inline-flex h-9 px-3 rounded-xl border-primary/35 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground font-bold whitespace-nowrap shrink-0 transition-colors"
              >
                <Link href="/donations" prefetch={false} className="inline-flex items-center gap-1.5">
                  <Heart className="h-3.5 w-3.5 fill-primary/20" />
                  <span>{t("ادعمنا", "Donate")}</span>
                </Link>
              </Button>

              {/* Auth / Profile */}
              {isUserLoading ? (
                <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
              ) : user ? (
                <DropdownMenu dir={isRtl ? "rtl" : "ltr"}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-xl border-border/80 p-0 overflow-hidden shrink-0"
                    >
                      <Avatar className="h-9 w-9 rounded-xl">
                        <AvatarImage
                          src={user.photoURL || undefined}
                          alt={user.displayName || "User"}
                        />
                        <AvatarFallback className="rounded-xl text-xs font-bold">
                          {getInitials(user.displayName)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 rounded-xl bg-popover border-border">
                    <DropdownMenuItem asChild className="rounded-lg">
                      <Link href="/profile" prefetch={false}>
                        <UserIcon className="me-2 h-4 w-4" />
                        {t("الملف الشخصي", "Profile")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-lg">
                      <Link href="/settings" prefetch={false}>
                        <Settings className="me-2 h-4 w-4" />
                        {t("الإعدادات", "Settings")}
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild className="rounded-lg">
                        <Link href="/admin/dashboard" prefetch={false}>
                          <LayoutDashboard className="me-2 h-4 w-4" />
                          {t("لوحة التحكم", "Admin Dashboard")}
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="rounded-lg text-destructive focus:text-destructive">
                      <LogOut className="me-2 h-4 w-4" />
                      {t("تسجيل الخروج", "Sign Out")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  asChild
                  size="sm"
                  className="h-9 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold whitespace-nowrap shrink-0"
                >
                  <Link href="/auth/login" prefetch={false}>
                    {t("دخول", "Sign In")}
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Dock */}
      <nav
        aria-label={t("شريط التنقل السريع للهاتف", "Mobile navigation")}
        dir={isRtl ? "rtl" : "ltr"}
        className={cn(
          "md:hidden fixed bottom-4 left-3 right-3 z-40 h-16 rounded-2xl border border-border/80 bg-background/90 backdrop-blur-xl shadow-xl flex items-center justify-around px-1 transition-all duration-300",
          isHeaderHidden && "translate-y-24 opacity-0 pointer-events-none"
        )}
      >
        {MOBILE_DOCK_ITEMS.map((item) => {
          const active = isRouteActive(item.href)
          const href =
            (item.href === "/profile" || item.href === "/settings") && !user
              ? `/auth/login?redirect_to=${item.href}`
              : item.href

          return (
            <Link
              key={item.href}
              href={href}
              prefetch={false}
              className={cn(
                "relative flex flex-col items-center justify-center flex-1 h-full gap-0.5 rounded-xl transition-colors",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-bold">{t(item.label, item.enLabel)}</span>
              {active && (
                <span className="absolute bottom-1 h-1 w-4 rounded-full bg-primary" />
              )}
            </Link>
          )
        })}
      </nav>

      {isThemeSwitcherOpen && (
        <ThemeSwitcherDialog
          isOpen={isThemeSwitcherOpen}
          onOpenChange={setIsThemeSwitcherOpen}
        />
      )}
      {isFontSwitcherOpen && (
        <FontSwitcherDialog
          isOpen={isFontSwitcherOpen}
          onOpenChange={setIsFontSwitcherOpen}
        />
      )}
      {isSolidColorSwitcherOpen && (
        <SolidColorSwitcherDialog
          isOpen={isSolidColorSwitcherOpen}
          onOpenChange={setIsSolidColorSwitcherOpen}
        />
      )}
      {isLanguageSwitcherOpen && (
        <LanguageSwitcherDialog
          isOpen={isLanguageSwitcherOpen}
          onOpenChange={setIsLanguageSwitcherOpen}
        />
      )}
    </>
  )
}
