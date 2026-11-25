'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Heart, Mail, Twitter, Youtube, Facebook, Headphones, 
  MessageCircle, Send, Globe, ArrowUpRight, Sparkles 
} from "lucide-react";
import { Button } from "./ui/button";
import { useTranslation } from "@/lib/i18n";

export function SiteFooter() {
  const { t, isRtl } = useTranslation();

  return (
    <footer className="relative bg-black text-white py-20 overflow-hidden border-t border-white/10 mt-20" dir={isRtl ? "rtl" : "ltr"}>
      {/* Cinematic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[150px] rounded-full" />
      </div>

      <div className="w-full relative z-10 px-4 sm:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Brand Column */}
          <div className="lg:col-span-5 space-y-8">
            <Link href="/" prefetch={false} className="inline-block group">
              <motion.span 
                className="text-5xl font-black font-headline tracking-tighter text-white block mb-2 group-hover:text-primary transition-colors"
              >
                {t("وقـــفــــة", "WAQFAH")}
              </motion.span>
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/60 block group-hover:text-white/80 transition-colors">
                {t("للعلم الشرعي الموثوق", "AUTHENTIC ISLAMIC KNOWLEDGE")}
              </span>
            </Link>
            
            <p className="max-w-md text-lg text-white/60 leading-relaxed font-medium">
              {t(
                "صرحٌ تعليميٌّ متكاملٌ يهدفُ إلى تقريبِ العلمِ النافعِ، وربطِ المسلمِ بالكتابِ والسنةِ على فهمِ سلفِ الأمةِ، عبرَ تجربةٍ تقنيةٍ عالمية.",
                "An integrated educational platform dedicated to making beneficial Islamic knowledge accessible and connecting Muslims to the Quran and Sunnah through a modern digital experience."
              )}
            </p>
 
            <div className="flex gap-4">
              {[
                { icon: Youtube, label: "قناة اليوتيوب", color: "hover:bg-red-500/20 hover:text-red-500" },
                { icon: Twitter, label: "حساب تويتر", color: "hover:bg-blue-500/20 hover:text-blue-500" },
                { icon: Facebook, label: "صفحة الفيسبوك", color: "hover:bg-indigo-500/20 hover:text-indigo-500" },
                { icon: MessageCircle, label: "رابط الواتساب", color: "hover:bg-green-500/20 hover:text-green-500" },
                { icon: Send, label: "قناة التليجرام", color: "hover:bg-sky-500/20 hover:text-sky-500" }
              ].map((social, i) => (
                <motion.a
                  key={i}
                  href="#"
                  aria-label={social.label}
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
                {t("المنصة", "Platform")}
              </h3>
              <ul className="space-y-4">
                {[
                  { label: t("جميع البرامج", "All Programs"), href: "/programs" },
                  { label: t("السلاسل العلمية", "Series"), href: "/series" },
                  { label: t("أحدث المحاضرات", "Latest Lectures"), href: "/lectures" },
                  { label: t("القصص والعبر", "Stories"), href: "/stories" },
                  { label: t("محاسبة النفس", "Accountability"), href: "/accountability" },
                  { label: t("المصحف الشامل", "Holy Quran"), href: "/quran" }
                ].map((link, i) => (
                  <li key={i}>
                    <Link href={link.href} prefetch={false} className="text-white/60 hover:text-white transition-colors text-base font-bold flex items-center group">
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
                {t("المحتوى", "Content")}
              </h3>
              <ul className="space-y-4">
                {[
                  { label: t("أركان الإيمان", "Creed (Aqeedah)"), href: "/aqeedah" },
                  { label: t("أحاديث نبوية", "Hadith"), href: "/hadith" },
                  { label: t("أذكار وأدعية", "Adhkar & Duas"), href: "/adhkar" },
                  { label: t("تزكية القلوب", "Purification of Hearts"), href: "/muhlikat" },
                  { label: t("تفسير وآيات", "Tafsir & Verses"), href: "/search?category=تفسير" }
                ].map((link, i) => (
                  <li key={i}>
                    <Link href={link.href} prefetch={false} className="text-white/60 hover:text-white transition-colors text-base font-bold flex items-center group">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
 
            <div className="col-span-2 md:col-span-1">
              <h3 className="text-white font-black text-sm uppercase tracking-widest mb-8 flex items-center gap-2">
                <div className="w-1 h-4 bg-amber-500 rounded-full" />
                {t("الدعم", "Support")}
              </h3>
              <ul className="space-y-4">
                <li>
                  <Link href="/contact" prefetch={false} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-1 hover:bg-white/10 transition-all group">
                    <span className="text-white font-black text-sm">{t("تواصل معنا", "Contact Us")}</span>
                    <span className="text-white/60 text-xs">{t("نحن هنا للإجابة على استفساراتك", "We are here to answer your questions")}</span>
                  </Link>
                </li>
                <li>
                  <Link href="/donations" prefetch={false} className="p-4 rounded-2xl bg-primary/10 border border-primary/20 flex flex-col gap-1 hover:bg-primary/20 transition-all group">
                    <span className="text-primary font-black text-sm flex items-center gap-2">
                      <Heart className="w-3 h-3 fill-current" /> {t("ادعم المنصة", "Support Waqfah")}
                    </span>
                    <span className="text-primary/70 text-xs">{t("ساهم في نشر العلم الشرعي", "Contribute to spreading beneficial knowledge")}</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
 
        {/* Bottom Bar */}
        <div className="mt-24 pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-xs font-black uppercase tracking-widest text-white/60">
             <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <p>© {new Date().getFullYear()} {t("منصة وقفة العلمية — وقف خيري لوجه الله تعالى", "Waqfah Platform — Non-Profit Islamic Endowment")}</p>
             </div>
             <div className="flex gap-6">
                <Link href="#" prefetch={false} className="hover:text-primary transition-colors">{t("سياسة الخصوصية", "Privacy Policy")}</Link>
                <Link href="#" prefetch={false} className="hover:text-primary transition-colors">{t("شروط الاستخدام", "Terms of Use")}</Link>
             </div>
          </div>
          
          <div className="flex items-center gap-3 text-white/70 text-xs font-bold bg-white/5 px-6 py-3 rounded-full border border-white/10 shadow-lg backdrop-blur-xl">
             <Globe className="w-4 h-4 text-primary" />
             <span>{t("بُني باحترافية رقمية لنصرة الدين ونشر العلم الشرعي النافع", "Crafted digitally to serve and spread authentic Islamic knowledge")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
