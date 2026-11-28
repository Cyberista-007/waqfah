'use client';

import Link from "next/link";
import {
  Heart, Twitter, Youtube, Facebook,
  MessageCircle, Send, Globe, ArrowUpRight,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export function SiteFooter() {
  const { t, isRtl } = useTranslation();

  return (
    <footer
      className="relative bg-card text-foreground py-14 sm:py-16 border-t border-border mt-16"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="container mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-5 space-y-6">
            <Link href="/" prefetch={false} className="inline-block group">
              <span className="text-4xl font-black font-headline tracking-tight text-foreground block mb-1.5 group-hover:text-primary transition-colors">
                {t("وقـــفــــة", "WAQFAH")}
              </span>
              <span className="text-[11px] font-bold uppercase tracking-[0.35em] text-muted-foreground block">
                {t("للعلم الشرعي الموثوق", "AUTHENTIC ISLAMIC KNOWLEDGE")}
              </span>
            </Link>

            <p className="max-w-md text-sm sm:text-base text-muted-foreground leading-relaxed font-medium">
              {t(
                "صرحٌ تعليميٌّ متكاملٌ يهدفُ إلى تقريبِ العلمِ النافعِ، وربطِ المسلمِ بالكتابِ والسنةِ على فهمِ سلفِ الأمةِ، عبرَ تجربةٍ تقنيةٍ واضحةٍ وسريعة.",
                "An integrated educational platform dedicated to making beneficial Islamic knowledge accessible through a clear, fast digital experience."
              )}
            </p>

            <div className="flex gap-2.5">
              {[
                { icon: Youtube, label: "قناة اليوتيوب", color: "hover:border-red-500/40 hover:text-red-500" },
                { icon: Twitter, label: "حساب تويتر", color: "hover:border-blue-500/40 hover:text-blue-500" },
                { icon: Facebook, label: "صفحة الفيسبوك", color: "hover:border-indigo-500/40 hover:text-indigo-500" },
                { icon: MessageCircle, label: "رابط الواتساب", color: "hover:border-green-500/40 hover:text-green-500" },
                { icon: Send, label: "قناة التليجرام", color: "hover:border-sky-500/40 hover:text-sky-500" },
              ].map((social, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label={social.label}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl bg-muted/70 border border-border text-muted-foreground transition-colors duration-200 ${social.color}`}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-10">
            <div>
              <h3 className="text-foreground font-black text-xs uppercase tracking-widest mb-5 flex items-center gap-2">
                <span className="w-1 h-4 bg-primary rounded-full" />
                {t("المنصة", "Platform")}
              </h3>
              <ul className="space-y-3">
                {[
                  { label: t("جميع البرامج", "All Programs"), href: "/programs" },
                  { label: t("السلاسل العلمية", "Series"), href: "/series" },
                  { label: t("أحدث المحاضرات", "Latest Lectures"), href: "/lectures" },
                  { label: t("القصص والعبر", "Stories"), href: "/stories" },
                  { label: t("محاسبة النفس", "Accountability"), href: "/accountability" },
                  { label: t("المصحف الشامل", "Holy Quran"), href: "/quran" },
                ].map((link, i) => (
                  <li key={i}>
                    <Link
                      href={link.href}
                      prefetch={false}
                      className="text-muted-foreground hover:text-foreground transition-colors text-sm font-bold flex items-center gap-1 group"
                    >
                      <span>{link.label}</span>
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-foreground font-black text-xs uppercase tracking-widest mb-5 flex items-center gap-2">
                <span className="w-1 h-4 bg-emerald-500 rounded-full" />
                {t("المحتوى", "Content")}
              </h3>
              <ul className="space-y-3">
                {[
                  { label: t("أركان الإيمان", "Creed (Aqeedah)"), href: "/aqeedah" },
                  { label: t("أحاديث نبوية", "Hadith"), href: "/hadith" },
                  { label: t("أذكار وأدعية", "Adhkar & Duas"), href: "/adhkar" },
                  { label: t("تزكية القلوب", "Purification of Hearts"), href: "/muhlikat" },
                  { label: t("تفسير وآيات", "Tafsir & Verses"), href: "/search?category=تفسير" },
                ].map((link, i) => (
                  <li key={i}>
                    <Link
                      href={link.href}
                      prefetch={false}
                      className="text-muted-foreground hover:text-foreground transition-colors text-sm font-bold flex items-center"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-2 md:col-span-1">
              <h3 className="text-foreground font-black text-xs uppercase tracking-widest mb-5 flex items-center gap-2">
                <span className="w-1 h-4 bg-amber-500 rounded-full" />
                {t("الدعم", "Support")}
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/contact"
                    prefetch={false}
                    className="p-3.5 rounded-xl bg-muted/60 border border-border flex flex-col gap-1 hover:bg-muted transition-colors"
                  >
                    <span className="text-foreground font-black text-sm">{t("تواصل معنا", "Contact Us")}</span>
                    <span className="text-muted-foreground text-xs">{t("نحن هنا للإجابة على استفساراتك", "We are here to answer your questions")}</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/donations"
                    prefetch={false}
                    className="p-3.5 rounded-xl bg-primary/10 border border-primary/25 flex flex-col gap-1 hover:bg-primary/15 transition-colors"
                  >
                    <span className="text-primary font-black text-sm flex items-center gap-2">
                      <Heart className="w-3.5 h-3.5 fill-current" /> {t("ادعم المنصة", "Support Waqfah")}
                    </span>
                    <span className="text-primary/80 text-xs">{t("ساهم في نشر العلم الشرعي", "Contribute to spreading beneficial knowledge")}</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-xs font-bold text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <p>© {new Date().getFullYear()} {t("منصة وقفة العلمية — وقف خيري لوجه الله تعالى", "Waqfah Platform — Non-Profit Islamic Endowment")}</p>
            </div>
            <div className="flex gap-5">
              <Link href="/contact" prefetch={false} className="hover:text-primary transition-colors">{t("سياسة الخصوصية", "Privacy Policy")}</Link>
              <Link href="/contact" prefetch={false} className="hover:text-primary transition-colors">{t("شروط الاستخدام", "Terms of Use")}</Link>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-foreground/80 text-xs font-bold bg-muted/70 px-5 py-2.5 rounded-full border border-border">
            <Globe className="w-4 h-4 text-primary shrink-0" />
            <span>{t("بُني باحترافية رقمية لنصرة الدين ونشر العلم الشرعي النافع", "Crafted digitally to serve and spread authentic Islamic knowledge")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
