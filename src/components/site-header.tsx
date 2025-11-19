
"use client"

import Link from "next/link"
import {
  Menu,
  Search,
  ChevronDown,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  MicVocal,
  Hash,
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
import { useUser, useDoc, useFirestore } from "@/firebase"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { signOut } from "firebase/auth"
import { useRouter } from "next/navigation"
import { Skeleton } from "./ui/skeleton"
import { doc } from "firebase/firestore"
import type { UserProfile } from "@/lib/types"
import { useMemo } from "react"
import { useAdminActivation } from "@/hooks/use-admin-auth"

const mainNavItems = [
  { href: "/", label: "الرئيسية" },
  { href: "/sheikhs", label: "المشايخ" },
  { href: "/series", label: "السلاسل" },
  { href: "/lectures", label: "كل المحاضرات" },
  { href: "/topics", label: "المواضيع" },
  { href: "/books", label: "الكتب" },
]

const moreNavItems = [
  { href: "/schedule", label: "جدول الدروس" },
  { href: "/qa", label: "سؤال وجواب" },
  { href: "/donations", label: "الدعم" },
  { href: "/contact", label: "تواصل معنا" },
]

export function SiteHeader() {
  const scrolled = useScroll(50);
  const { user, isUserLoading } = useUser();
  const { isAdmin } = useAdminActivation();
  const router = useRouter();

  const handleLogout = async () => {
    if (user) {
        await signOut(user.auth);
        router.push('/');
    }
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }
  
  return (
    <header className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled ? "bg-background/80 backdrop-blur-sm shadow-md" : "bg-transparent"
    )}>
      <nav className="container mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
        <Link 
          href="/"
          className="text-xl font-bold font-headline hover:text-primary transition-colors cursor-pointer"
        >
          منصة الدروس العلمية
        </Link>
        
        <div className="hidden md:flex flex-grow justify-center items-center gap-6">
          {mainNavItems.map((item) => (
            <Link key={item.label} href={item.href} className="font-medium text-foreground/70 hover:text-primary transition-colors">
              {item.label}
            </Link>
          ))}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-foreground/70 hover:text-primary hover:bg-transparent p-0">
                        <span>المزيد</span>
                        <ChevronDown className="h-4 w-4 ms-1"/>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-background border-border">
                    {moreNavItems.map((item) => (
                        <DropdownMenuItem key={item.label} asChild className="focus:bg-primary/10 focus:text-primary justify-end">
                            <Link href={item.href} className="flex justify-end w-full">
                                {item.label}
                            </Link>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>

        <div className="hidden md:flex items-center gap-4">
           <Link href="/search">
              <Button variant="ghost" size="icon" className="text-foreground/70 hover:text-primary">
                <Search className="h-5 w-5" />
                <span className="sr-only">بحث</span>
              </Button>
           </Link>
          
          <ThemeToggle />

          {isUserLoading ? (
            <Skeleton className="w-24 h-10 rounded-md" />
          ) : user ? (
            <>
              {isAdmin && (
                <Button asChild variant="ghost" size="icon" className="text-foreground/70 hover:text-primary">
                    <Link href="/admin">
                      <LayoutDashboard className="h-5 w-5" />
                      <span className="sr-only">لوحة التحكم</span>
                    </Link>
                </Button>
              )}
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
            </>
          ) : (
             <Button asChild>
              <Link href="/auth/login">
                <span>تسجيل الدخول</span>
              </Link>
            </Button>
          )}
        </div>

        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-background w-[280px] p-6">
              <div className="flex flex-col space-y-4">
              <SheetClose asChild>
                <Link 
                  href="/"
                  className="text-xl font-bold font-headline hover:text-primary transition-colors mb-4 cursor-pointer"
                >
                    منصة الدروس العلمية
                </Link>
              </SheetClose>
                {[...mainNavItems, ...moreNavItems].map((item) => (
                  <SheetClose asChild key={item.label}>
                    <Link href={item.href} className="block text-foreground/80 hover:text-primary py-2 font-medium">
                        {item.label}
                    </Link>
                  </SheetClose>
                ))}
                <div className="border-t border-border pt-4 space-y-3">
                   {user ? (
                     <>
                      <SheetClose asChild>
                        <Button asChild className="w-full justify-center">
                            <Link href="/profile">الملف الشخصي</Link>
                        </Button>
                       </SheetClose>
                        {isAdmin && (
                            <SheetClose asChild>
                                <Button asChild className="w-full justify-center" variant="secondary">
                                    <Link href="/admin">لوحة التحكم</Link>
                                </Button>
                            </SheetClose>
                        )}
                       <Button onClick={handleLogout} variant="outline" className="w-full">
                          تسجيل الخروج
                       </Button>
                     </>
                   ) : (
                    <SheetClose asChild>
                      <Button asChild className="w-full justify-center">
                          <Link href="/auth/login">تسجيل الدخول</Link>
                      </Button>
                    </SheetClose>
                   )}
                  <SheetClose asChild>
                     <Link href="/search" className="w-full">
                        <Button variant="outline" className="w-full">
                            <Search className="h-5 w-5 me-2" />
                            <span>بحث</span>
                        </Button>
                     </Link>
                  </SheetClose>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}
