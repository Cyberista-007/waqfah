
"use client"

import Link from "next/link"
import {
  Menu,
  Search,
  ChevronDown,
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
import { useUser } from "@/firebase"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { signOut } from "firebase/auth"
import { useRouter } from "next/navigation"
import { Skeleton } from "./ui/skeleton"
import { useAdminAuth } from "@/hooks/use-admin-auth"
import { useState } from "react"
import { ThemeSwitcherDialog, themes } from "./theme-switcher"
import { FontSwitcherDialog } from "./font-switcher"
import { getInitials } from "@/lib/utils"
import { ScrollArea, ScrollBar } from "./ui/scroll-area"
import { Separator } from "./ui/separator"
import { useTheme } from "next-themes"
import { AppearanceManager } from "./appearance-manager"
import { useAppearance } from "./appearance-provider"
import { Switch } from "./ui/switch"
import { Label } from "./ui/label"

const mainNavItems = [
  { href: "/", label: "الرئيسية" },
  { href: "/channels", label: "البرامج" },
  { href: "/lectures", label: "المحاضرات" },
  { href: "/profile", label: "مكتبتي" },
  { href: "/topics", label: "المواضيع" },
  { href: "/playlists", label: "قوائم التشغيل" },
  { href: "/books", label: "الكتب" },
]

const moreNavItems = [
  { href: "/schedule", label: "جدول الدروس", icon: Calendar },
  { href: "/qa", label: "سؤال وجواب", icon: HelpCircle },
  { href: "/donations", label: "الدعم", icon: Heart },
  { href: "/contact", label: "تواصل معنا", icon: Mail },
]

const mobileNavLinks = [
    { href: '/', icon: Home, label: 'الرئيسية' },
    { href: '/channels', icon: Youtube, label: 'البرامج' },
    { href: '/search', icon: Search, label: 'بحث' },
    { href: '/profile', icon: ListMusic, label: 'مكتبتي' },
    { href: '/settings', icon: Settings, label: 'الإعدادات'}
];

export function SiteHeader() {
  const scrolled = useScroll(50);
  const { user, isUserLoading } = useUser();
  const { isAdmin } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isThemeSwitcherOpen, setIsThemeSwitcherOpen] = useState(false);
  const [isFontSwitcherOpen, setIsFontSwitcherOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { isBackgroundShown, toggleBackground } = useAppearance();

  const toggleTheme = () => {
    const currentIndex = themes.findIndex((t) => t.value === theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex]?.value;
    if (nextTheme) {
      setTheme(nextTheme);
    }
  };


  const handleLogout = async () => {
    if (user) {
        await signOut(user.auth);
    }
    router.push('/');
  }
  
  const dynamicMoreNavItems = isAdmin
    ? [...moreNavItems, { href: "/admin", label: "لوحة التحكم", icon: LayoutDashboard }]
    : moreNavItems;
  
  return (
    <>
      <AppearanceManager />
      {/* Desktop Header */}
      <header className={cn(
          "sticky top-0 z-50 transition-all duration-300 hidden md:block",
          scrolled ? "bg-background/80 backdrop-blur-sm shadow-md" : "bg-transparent"
      )}>
        <nav className="container mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
            <Link
            href="/"
            className="flex items-center space-x-2 space-x-reverse cursor-pointer"
            >
            <div className="text-3xl font-extrabold font-headline tracking-tight text-foreground">
                وقـــفــــة
            </div>
            </Link>
          
          <div className="flex flex-grow justify-center items-center gap-2">
            {mainNavItems.map((item) => (
              <Button asChild key={item.label} variant="ghost" className="text-foreground/80 hover:text-primary font-bold">
                <Link href={item.href}>
                  {item.label}
                </Link>
              </Button>
            ))}
              <HoverCard>
                  <HoverCardTrigger asChild>
                      <Button variant="ghost" className="text-foreground/80 hover:text-primary font-bold">
                          <span>المزيد</span>
                          <ChevronDown className="h-4 w-4 ms-1"/>
                      </Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-60 p-2 bg-background border-border">
                      <div className="flex flex-col space-y-1">
                        {dynamicMoreNavItems.map((item) => {
                          const Icon = item.icon;
                          return(
                            <Link
                              key={item.label}
                              href={item.href}
                              className="flex justify-end w-full items-center gap-2 p-2 rounded-md hover:bg-accent focus:bg-accent focus:outline-none"
                            >
                                <span>{item.label}</span>
                                {Icon && <Icon className="h-4 w-4" />}
                            </Link>
                          )
                        })}
                        <Separator className="my-1" />
                        <button onClick={() => setIsThemeSwitcherOpen(true)} className="flex justify-end w-full items-center gap-2 p-2 rounded-md hover:bg-accent focus:bg-accent focus:outline-none">
                          <span>تغيير الثيم</span>
                          <Palette className="h-4 w-4" />
                        </button>
                        <button onClick={() => setIsFontSwitcherOpen(true)} className="flex justify-end w-full items-center gap-2 p-2 rounded-md hover:bg-accent focus:bg-accent focus:outline-none">
                          <span>تغيير الخط</span>
                          <CaseSensitive className="h-4 w-4" />
                        </button>
                        <div className="flex justify-end w-full items-center gap-2 p-2 rounded-md">
                            <Label htmlFor="desktop-bg-switch" className="cursor-pointer">إظهار الخلفية</Label>
                            <Switch id="desktop-bg-switch" checked={isBackgroundShown} onCheckedChange={toggleBackground} />
                        </div>
                        <button onClick={() => document.getElementById('background-uploader-input')?.click()} className="flex justify-end w-full items-center gap-2 p-2 rounded-md hover:bg-accent focus:bg-accent focus:outline-none">
                          <span>تغيير الخلفية</span>
                          <ImageIcon className="h-4 w-4" />
                        </button>
                      </div>
                  </HoverCardContent>
              </HoverCard>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/search">
                <Button variant="ghost" size="icon" className="text-foreground/70 hover:text-primary">
                  <Search className="h-5 w-5" />
                  <span className="sr-only">بحث</span>
                </Button>
            </Link>
            
            <Button
              onClick={toggleTheme}
              variant="ghost"
              size="icon"
              aria-label="Toggle theme"
              className="text-foreground/70 hover:text-primary"
            >
              <Palette className="h-5 w-5" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {isUserLoading ? (
              <Skeleton className="w-10 h-10 rounded-full" />
            ) : (
              <>
                { user ? (
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
                              <Link href="/admin"><LayoutDashboard className="me-2 h-4 w-4" />لوحة التحكم</Link>
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
                  <Button asChild>
                    <Link href="/auth/login">
                      <span>تسجيل الدخول</span>
                    </Link>
                  </Button>
                )}
              </>
            )}
          </div>
        </nav>
      </header>
      
      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-background/95 border-t backdrop-blur-sm">
        <div className="grid h-full grid-cols-5 mx-auto">
            {mobileNavLinks.map((item) => {
                const isActive = (item.href === '/' && pathname === '/') || (item.href !== '/' && pathname.startsWith(item.href));
                const href = ((item.href === '/profile' || item.href === '/settings') && !user) ? `/auth/login?redirect_to=${item.href}` : item.href;
                return (
                    <Link key={item.label} href={href} className="inline-flex flex-col items-center justify-center px-2 hover:bg-accent group rounded-lg">
                        <item.icon className={cn("w-6 h-6 mb-1 text-muted-foreground group-hover:text-primary", isActive && "text-primary")} />
                        <span className={cn("text-xs text-muted-foreground group-hover:text-primary", isActive && "text-primary")}>{item.label}</span>
                    </Link>
                );
            })}
        </div>
      </div>

      <ThemeSwitcherDialog isOpen={isThemeSwitcherOpen} onOpenChange={setIsThemeSwitcherOpen} />
      <FontSwitcherDialog isOpen={isFontSwitcherOpen} onOpenChange={setIsFontSwitcherOpen} />
    </>
  )
}
