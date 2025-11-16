"use client"

import Link from "next/link"
import {
  LogIn,
  Menu,
  Search,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ThemeToggle } from "./theme-toggle"

const navItems = [
  { href: "/", label: "الرئيسية" },
  { href: "/series", label: "السلاسل" },
  { href: "/lectures", label: "كل المحاضرات" },
  { href: "/books", label: "الكتب" },
  { href: "/schedule", label: "جدول الدروس" },
  { href: "/qa", label: "سؤال وجواب" },
  { href: "/donations", label: "الدعم" },
  { href: "/contact", label: "تواصل معنا" },
]

export function SiteHeader() {
  return (
    <header className="bg-gray-900/75 backdrop-blur-sm text-white sticky top-0 z-50">
      <nav className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold font-headline hover:text-gray-300">
            موقع أمجد سمير
        </Link>
        
        <div className="hidden md:flex flex-grow justify-center space-x-8 space-x-reverse">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} className="text-gray-300 hover:text-white transition-colors">
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center space-x-4 space-x-reverse">
          <Button variant="ghost" size="icon" className="bg-gray-700 p-2 rounded-full text-white hover:bg-gray-600">
            <Search className="h-5 w-5" />
            <span className="sr-only">بحث</span>
          </Button>
          
          <ThemeToggle />

          <Button asChild className="border border-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm">
            <Link href="/auth/login">
              <span>تسجيل الدخول</span>
              <LogIn className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-gray-900 text-white border-l-gray-700 w-[250px] p-6">
              <div className="flex flex-col space-y-4">
              <Link href="/" className="text-xl font-bold font-headline hover:text-gray-300 mb-4">
                  موقع أمجد سمير
              </Link>
                {navItems.map((item) => (
                  <Link key={item.label} href={item.href} className="block text-gray-300 hover:text-white py-2">
                    {item.label}
                  </Link>
                ))}
                <div className="border-t border-gray-700 pt-4 space-y-3">
                  <Button asChild className="w-full justify-center border border-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
                    <Link href="/auth/login">
                      <span>تسجيل الدخول</span>
                      <LogIn className="w-5 h-5" />
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full bg-gray-700 p-2 rounded-lg text-white hover:bg-gray-600">
                    <Search className="h-5 w-5 me-2" />
                    <span>بحث</span>
                  </Button>
                  <div className="w-full bg-gray-700 p-2 rounded-lg text-white hover:bg-gray-600 flex items-center justify-between">
                    <span>تبديل الوضع</span>
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}
