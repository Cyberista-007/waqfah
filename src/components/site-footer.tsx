'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Heart, Mail, Twitter, Youtube, Facebook, Headphones, 
  MessageCircle, Send, Globe, ArrowUpRight, Sparkles 
} from "lucide-react";
import { Button } from "./ui/button";

export function SiteFooter() {
  return (
    <footer className="relative bg-black text-white py-24 overflow-hidden border-t border-white/10 mt-32">
      {/* Cinematic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[150px] rounded-full" />
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Brand Column */}
          <div className="lg:col-span-5 space-y-8">
            <Link href="/" className="inline-block group">
              <motion.span 
                className="text-5xl font-black font-headline tracking-tighter text-white block mb-2 group-hover:text-primary transition-colors"
              >
                وقـــفــــة
              </motion.span>
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30 block group-hover:text-white/60 transition-colors">
                للعلم الشرعي الموثوق
              </span>
            </Link>
            
            <p className="max-w-md text-lg text-white/40 leading-relaxed font-medium">
              صرحٌ تعليميٌّ متكاملٌ يهدفُ إلى تقريبِ العلمِ النافعِ، وربطِ المسلمِ بالكتابِ والسنةِ على فهمِ سلفِ الأمةِ، عبرَ تجربةٍ تقنيةٍ عالمية.
            </p>

            <div className="flex gap-4">
              {[
                { icon: Youtube, color: "hover:bg-red-500/20 hover:text-red-500" },
                { icon: Twitter, color: "hover:bg-blue-500/20 hover:text-blue-500" },
                { icon: Facebook, color: "hover:bg-indigo-500/20 hover:text-indigo-500" },
                { icon: MessageCircle, color: "hover:bg-green-500/20 hover:text-green-500" },
                { icon: Send, color: "hover:bg-sky-500/20 hover:text-sky-500" }
              ].map((social, i) => (
                <motion.a
                  key={i}
                  href="#"
                  whileHover={{ y: -5, scale: 1.1 }}
                  className={`w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 transition-all duration-300 ${social.color}`}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-12">
            <div>
              <h3 className="text-white font-black text-sm uppercase tracking-widest mb-8 flex items-center gap-2">
                <div className="w-1 h-4 bg-primary rounded-full" />
                المنصة
              </h3>
              <ul className="space-y-4">
                {[
                  { label: "جميع البرامج", href: "/programs" },
                  { label: "السلاسل العلمية", href: "/series" },
                  { label: "أحدث المحاضرات", href: "/lectures" },
                  { label: "القصص والعبر", href: "/stories" },
                  { label: "محاسبة النفس", href: "/accountability" },
                  { label: "المصحف الشامل", href: "/quran" }
                ].map((link, i) => (
                  <li key={i}>
                    <Link href={link.href} className="text-white/40 hover:text-white transition-colors text-base font-bold flex items-center group">
                      {link.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-1 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-white font-black text-sm uppercase tracking-widest mb-8 flex items-center gap-2">
                <div className="w-1 h-4 bg-emerald-500 rounded-full" />
                المحتوى
              </h3>
              <ul className="space-y-4">
                {[
                  { label: "أركان الإيمان", href: "/aqeedah" },
                  { label: "أحاديث نبوية", href: "/hadith" },
                  { label: "أذكار وأدعية", href: "/adhkar" },
                  { label: "تزكية القلوب", href: "/muhlikat" },
                  { label: "تفسير وآيات", href: "/search?category=تفسير" }
                ].map((link, i) => (
                  <li key={i}>
                    <Link href={link.href} className="text-white/40 hover:text-white transition-colors text-base font-bold flex items-center group">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-2 md:col-span-1">
              <h3 className="text-white font-black text-sm uppercase tracking-widest mb-8 flex items-center gap-2">
                <div className="w-1 h-4 bg-amber-500 rounded-full" />
                الدعم
              </h3>
              <ul className="space-y-4">
                <li>
                  <Link href="/contact" className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-1 hover:bg-white/10 transition-all group">
                    <span className="text-white font-black text-sm">تواصل معنا</span>
                    <span className="text-white/30 text-xs">نحن هنا للإجابة على استفساراتك</span>
                  </Link>
                </li>
                <li>
                  <Link href="/donations" className="p-4 rounded-2xl bg-primary/10 border border-primary/20 flex flex-col gap-1 hover:bg-primary/20 transition-all group">
                    <span className="text-primary font-black text-sm flex items-center gap-2">
                      <Heart className="w-3 h-3 fill-current" /> ادعم المنصة
                    </span>
                    <span className="text-primary/40 text-xs">ساهم في نشر العلم الشرعي</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-24 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-8 text-xs font-black uppercase tracking-widest text-white/20">
             <p>© {new Date().getFullYear()} وقـــفــــة</p>
             <div className="hidden md:flex gap-6">
                <Link href="#" className="hover:text-white transition-colors">سياسة الخصوصية</Link>
                <Link href="#" className="hover:text-white transition-colors">شروط الاستخدام</Link>
             </div>
          </div>
          
          <div className="flex items-center gap-4 text-white/40 text-xs font-bold bg-white/5 px-6 py-3 rounded-full border border-white/10">
             <Globe className="w-4 h-4 text-primary" />
             بُني بحب لنصرة الدين - <span className="text-white">Waqfah Team</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
