"use client"

import Link from "next/link"
import {
  LogIn,
  Menu,
  Search,
  ChevronDown,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ThemeToggle } from "./theme-toggle"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useScroll } from "@/hooks/use-scroll"

const mainNavItems = [
  { href: "/", label: "الرئيسية" },
  { href: "/series", label: "السلاسل" },
  { href: "/lectures", label: "كل المحاضرات" },
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

  return (
    <header className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled ? "bg-background/80 backdrop-blur-sm shadow-md" : "bg-transparent"
    )}>
      <nav className="container mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold font-headline hover:text-primary transition-colors">
            موقع أمجد سمير
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

        <div className="hidden md:flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-foreground/70 hover:text-primary">
            <Search className="h-5 w-5" />
            <span className="sr-only">بحث</span>
          </Button>
          
          <ThemeToggle />

          <Button asChild>
            <Link href="/auth/login">
              <span>تسجيل الدخول</span>
              <LogIn className="w-4 h-4" />
            </Link>
          </Button>
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
              <Link href="/" className="text-xl font-bold font-headline hover:text-primary transition-colors mb-4">
                  موقع أمجد سمير
              </Link>
                {[...mainNavItems, ...moreNavItems].map((item) => (
                  <Link key={item.label} href={item.href} className="block text-foreground/80 hover:text-primary py-2 font-medium">
                    {item.label}
                  </Link>
                ))}
                <div className="border-t border-border pt-4 space-y-3">
                  <Button asChild className="w-full justify-center">
                    <Link href="/auth/login">
                      <span>تسجيل الدخول</span>
                      <LogIn className="w-5 h-5" />
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Search className="h-5 w-5 me-2" />
                    <span>بحث</span>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}
