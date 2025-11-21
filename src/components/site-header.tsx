
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
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet"
import { ThemeToggle } from "./theme-toggle"
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
import { ThemeSwitcherDialog } from "./theme-switcher"
import { FontSwitcherDialog } from "./font-switcher"
import { getInitials } from "@/lib/utils"
import { ScrollArea, ScrollBar } from "./ui/scroll-area"

const mainNavItems = [
  { href: "/", label: "الرئيسية" },
  { href: "/sheikhs", label: "المشايخ" },
  { href: "/series", label: "السلاسل" },
  { href: "/lectures", label: "كل المحاضرات" },
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

export function SiteHeader() {
  const scrolled = useScroll(50);
  const { user, isUserLoading } = useUser();
  const { isAdmin, logoutAdmin } = useAdminAuth();
  const router = useRouter();
  const [isThemeSwitcherOpen, setIsThemeSwitcherOpen] = useState(false);
  const [isFontSwitcherOpen, setIsFontSwitcherOpen] = useState(false);


  const handleLogout = async () => {
    if (user) {
        await signOut(user.auth);
    }
    logoutAdmin();
    router.push('/');
  }
  
  const dynamicMoreNavItems = isAdmin
    ? [...moreNavItems, { href: "/admin", label: "لوحة التحكم", icon: LayoutDashboard }]
    : moreNavItems;
  
  return (
    <>
    <header className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled ? "bg-background/80 backdrop-blur-sm shadow-md" : "bg-transparent"
    )}>
      <nav className="container mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <div className="md:hidden">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Menu className="h-6 w-6" />
                            <span className="sr-only">فتح القائمة</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-3/4">
                        <ScrollArea className="h-full">
                           <div className="flex flex-col gap-4 p-4">
                            <SheetClose asChild>
                                <Link href="/" className="text-2xl font-bold font-headline mb-4">وقـــفــــة</Link>
                            </SheetClose>
                            {[...mainNavItems, ...dynamicMoreNavItems].map((item) => (
                                <SheetClose asChild key={item.label}>
                                    <Link href={item.href} className="text-lg py-2 font-medium text-foreground/80 hover:text-primary">
                                        {item.label}
                                    </Link>
                                </SheetClose>
                            ))}
                             </div>
                        </ScrollArea>
                    </SheetContent>
                </Sheet>
            </div>
            <Link
            href="/"
            className="flex items-center space-x-2 space-x-reverse cursor-pointer"
            >
            <div className="text-3xl font-extrabold font-headline tracking-tight text-foreground">
                وقـــفــــة
            </div>
            </Link>
        </div>
        
        <div className="hidden md:flex flex-grow justify-center items-center gap-2">
          {mainNavItems.map((item) => (
            <Button asChild key={item.label} variant="ghost" className="text-foreground/80 hover:text-primary font-bold">
              <Link href={item.href}>
                {item.label}
              </Link>
            </Button>
          ))}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-foreground/80 hover:text-primary font-bold">
                        <span>المزيد</span>
                        <ChevronDown className="h-4 w-4 ms-1"/>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-background border-border">
                    {dynamicMoreNavItems.map((item) => {
                      const Icon = item.icon;
                      return(
                        <DropdownMenuItem key={item.label} asChild className="focus:bg-primary/10 focus:text-primary justify-end">
                            <Link href={item.href} className="flex justify-end w-full items-center gap-2">
                                <span>{item.label}</span>
                                {Icon && <Icon className="h-4 w-4" />}
                            </Link>
                        </DropdownMenuItem>
                      )
                    })}
                    <DropdownMenuSeparator />
                     <DropdownMenuItem onSelect={() => setIsThemeSwitcherOpen(true)} className="focus:bg-primary/10 focus:text-primary justify-end">
                        <div className="flex items-center gap-2">
                           <Palette className="h-4 w-4" />
                           <span>تغيير الثيم</span>
                        </div>
                    </DropdownMenuItem>
                     <DropdownMenuItem onSelect={() => setIsFontSwitcherOpen(true)} className="focus:bg-primary/10 focus:text-primary justify-end">
                        <div className="flex items-center gap-2">
                           <CaseSensitive className="h-4 w-4" />
                           <span>تغيير الخط</span>
                        </div>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
           <Link href="/search" className='hidden sm:inline-block'>
              <Button variant="ghost" size="icon" className="text-foreground/70 hover:text-primary">
                <Search className="h-5 w-5" />
                <span className="sr-only">بحث</span>
              </Button>
           </Link>
          
          <ThemeToggle />

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
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                          <LogOut className="me-2 h-4 w-4" />
                          تسجيل الخروج
                      </DropdownMenuItem>
                  </DropdownMenuContent>
              </DropdownMenu>
              ) : (
                 <Button asChild className='hidden sm:inline-flex'>
                  <Link href="/auth/login">
                    <span>تسجيل الدخول</span>
                  </Link>
                </Button>
              )}
            </>
          )}
        </div>

      </nav>
        <div className="md:hidden">
            <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex w-max space-x-4 space-x-reverse px-4 pb-2">
                    {[...mainNavItems].map((item) => (
                        <Button asChild key={item.label} variant="ghost" className="text-foreground/80 hover:text-primary font-bold">
                            <Link href={item.href}>{item.label}</Link>
                        </Button>
                    ))}
                </div>
                <ScrollBar orientation="horizontal" className="invisible" />
            </ScrollArea>
        </div>
    </header>
    <ThemeSwitcherDialog isOpen={isThemeSwitcherOpen} onOpenChange={setIsThemeSwitcherOpen} />
    <FontSwitcherDialog isOpen={isFontSwitcherOpen} onOpenChange={setIsFontSwitcherOpen} />
    </>
  )
}
