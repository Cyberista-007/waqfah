'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ShieldCheck,
  Smartphone,
  Zap,
  Search,
  Headphones,
  ArrowLeft,
  Music,
  Users,
  Globe,
  Heart,
  CheckCircle2,
  Download,
  BookOpen,
  Info,
  X,
  Play
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AboutPlatformModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function AboutPlatformModal({ open, onOpenChange, trigger }: AboutPlatformModalProps) {
  const [activeTab, setActiveTab] = useState<'features' | 'app' | 'stats'>('features');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent
        hideCloseButton
        className="max-w-5xl w-[95vw] max-h-[90vh] overflow-y-auto rounded-[2.5rem] bg-zinc-950/95 backdrop-blur-3xl border border-white/15 p-6 sm:p-10 shadow-[0_30px_90px_rgba(0,0,0,0.95)] z-[100] text-right"
        dir="rtl"
      >
        {/* Close Button */}
        <DialogClose className="absolute top-6 left-6 w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all cursor-pointer z-20">
          <X className="w-5 h-5" />
          <span className="sr-only">إغلاق</span>
        </DialogClose>

        {/* Modal Header */}
        <DialogHeader className="text-center sm:text-right space-y-3 pb-6 border-b border-white/10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black w-fit">
            <Sparkles className="w-3.5 h-3.5" />
            <span>التعريف بالمنصة ورسالتها</span>
          </div>

          <DialogTitle className="text-3xl sm:text-4xl md:text-5xl font-black font-headline tracking-tight text-white">
            لماذا <span className="text-primary italic">وقفة</span>؟ ✨
          </DialogTitle>

          <p className="text-sm sm:text-base text-white/60 font-medium max-w-2xl leading-relaxed">
            نجمَع بين أصالة المحتوى الشرعي وعالمية التطوير التقني، لنقدم لك صرحاً علمياً يليق بثوابتنا.
          </p>

          {/* Interactive Navigation Pills inside Modal */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-3">
            {[
              { id: 'features', label: 'مميزات المنصة (٥)', icon: Sparkles },
              { id: 'app', label: 'تطبيق الجوال وعمل بلا إنترنت', icon: Smartphone },
              { id: 'stats', label: 'إحصائيات وأرقام المنصة', icon: Zap },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black transition-all cursor-pointer",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-105"
                      : "bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </DialogHeader>

        {/* Dynamic Tab Body */}
        <div className="py-6">
          <AnimatePresence mode="wait">
            {/* ── TAB 1: 5 BENTO FEATURES ── */}
            {activeTab === 'features' && (
              <motion.div
                key="features"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
              >
                {/* 1. Sharia */}
                <div className="p-6 rounded-3xl bg-white/[0.02] border border-blue-500/20 hover:border-blue-500/40 transition-all flex flex-col justify-between group">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4 text-blue-400 group-hover:scale-110 transition-transform">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h4 className="text-xl font-black text-white mb-2">محتوى شرعي موثوق</h4>
                    <p className="text-xs text-white/50 leading-relaxed">
                      نخبة من المشايخ والعلماء لضمان تقديم العلم الشرعي بوسطية واعتدال وفق منهج أهل السنة والجماعة.
                    </p>
                  </div>
                  <div className="mt-5 pt-4 border-t border-white/5 flex flex-wrap gap-1.5">
                    {['العقيدة', 'التفسير', 'الحديث', 'الفقه'].map((t, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-[10px] font-bold border border-blue-500/20">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 2. Modern UX */}
                <div className="p-6 rounded-3xl bg-white/[0.02] border border-purple-500/20 hover:border-purple-500/40 transition-all flex flex-col justify-between group">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4 text-purple-400 group-hover:scale-110 transition-transform">
                      <Smartphone className="w-6 h-6" />
                    </div>
                    <h4 className="text-xl font-black text-white mb-2">تجربة مستخدم حديثة</h4>
                    <p className="text-xs text-white/50 leading-relaxed">
                      واجهة سلسة متكيفة تدعم جميع الأجهزة والهواتف وشاشات اللمس مع تجربة قراءة واستماع لا مثيل لها.
                    </p>
                  </div>
                  <div className="mt-5 pt-4 border-t border-white/5 flex items-center gap-2 text-purple-400 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تصميم عصري سريع الاستجابة</span>
                  </div>
                </div>

                {/* 3. Speed & Performance */}
                <div className="p-6 rounded-3xl bg-white/[0.02] border border-amber-500/20 hover:border-amber-500/40 transition-all flex flex-col justify-between group">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4 text-amber-400 group-hover:scale-110 transition-transform">
                      <Zap className="w-6 h-6" />
                    </div>
                    <h4 className="text-xl font-black text-white mb-2">سرعة وتفاعلية فائقة</h4>
                    <p className="text-xs text-white/50 leading-relaxed">
                      مشغل فيديو وصوت ذكي يواكب تطلعاتك ويعمل بكفاءة عالية واستهلاك منخفض للبيانات دون تباطؤ.
                    </p>
                  </div>
                  <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                      ⚡ زمن استجابة 0.08 ثانية
                    </span>
                  </div>
                </div>

                {/* 4. Smart Search */}
                <div className="p-6 rounded-3xl bg-white/[0.02] border border-emerald-500/20 hover:border-emerald-500/40 transition-all flex flex-col justify-between group">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 text-emerald-400 group-hover:scale-110 transition-transform">
                      <Search className="w-6 h-6" />
                    </div>
                    <h4 className="text-xl font-black text-white mb-2">محرك بحث ذكي</h4>
                    <p className="text-xs text-white/50 leading-relaxed">
                      صل لما تريد في أجزاء من الثانية من بين آلاف الدروس والمحاضرات والمتون المفهرسة بدقة عالية.
                    </p>
                  </div>
                  <div className="mt-5 pt-4 border-t border-white/5 flex items-center gap-2 text-emerald-400 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>بحث شامل في العناوين والتفريغات</span>
                  </div>
                </div>

                {/* 5. Pure Audio */}
                <div className="p-6 rounded-3xl bg-white/[0.02] border border-rose-500/20 hover:border-rose-500/40 transition-all flex flex-col justify-between group md:col-span-2 lg:col-span-2">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4 text-rose-400 group-hover:scale-110 transition-transform">
                      <Headphones className="w-6 h-6" />
                    </div>
                    <h4 className="text-xl font-black text-white mb-2">جودة صوت نقية ومعالجة احترافية</h4>
                    <p className="text-xs text-white/50 leading-relaxed">
                      نظام صوتي متقدم مع إمكانية تسريع الصوت، وتكرار المقاطع لحفظ المتون، مع مشغل عائم يتنقل معك في كل أرجاء المنصة دون انقطاع.
                    </p>
                  </div>
                  <div className="mt-5 pt-4 border-t border-white/5 flex items-center gap-2 text-rose-400 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>مشغل عائم + حفظ تلقائي لآخر نقطة استماع</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── TAB 2: MOBILE APP SHOWCASE ── */}
            {activeTab === 'app' && (
              <motion.div
                key="app"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="p-8 sm:p-10 rounded-[2.5rem] bg-gradient-to-br from-primary/10 via-white/[0.02] to-transparent border border-white/10 relative overflow-hidden">
                  <div className="max-w-2xl space-y-4">
                    <span className="px-3.5 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-[11px] font-black">
                      📱 تطبيق ويب متقدم (PWA)
                    </span>
                    <h3 className="text-2xl sm:text-4xl font-black font-headline text-white tracking-tight">
                      عِلمٌ راسخٌ.. <span className="text-primary italic">مَعك أينما كنت!</span>
                    </h3>
                    <p className="text-sm text-white/70 leading-relaxed font-medium">
                      حوّل منصة "وقفة" إلى تطبيق متكامل على هاتفك الذكي بضغطة زر واحدة. استمتع بمميزات الاستماع دون اتصال والتحميل المباشر لتواكب رحلتك العلمية في كل الظروف.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                    {[
                      { t: "تثبيت فوري بضغطة", d: "أضف المنصة لشاشتك الرئيسية كأي تطبيق أصلي بدون متجر." },
                      { t: "استماع بلا إنترنت", d: "تحميل المحاضرات والدروس والاستماع في السفر دون شبكة." },
                      { t: "تنبيهات الدروس والمجالس", d: "إشعارات بجديد الدروس والبثوث المباشرة." },
                      { t: "تزامن سحابي لحسابك", d: "واصل الاستماع من النقطة التي توقفت عندها على أي جهاز." },
                    ].map((item, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center shrink-0 text-primary mt-0.5">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="font-bold text-white text-sm">{item.t}</h5>
                          <p className="text-xs text-white/50 mt-0.5 leading-relaxed">{item.d}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── TAB 3: PLATFORM STATS ── */}
            {activeTab === 'stats' && (
              <motion.div
                key="stats"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "محاضرة علمية مفهرسة", value: "3,500+", icon: Music, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
                    { label: "مستمع نشط ومستفيد", value: "12,000+", icon: Users, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
                    { label: "برنامج دعوي متكامل", value: "85+", icon: Globe, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
                    { label: "ساعة استماع مسجلة", value: "150K+", icon: Zap, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
                  ].map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                      <div
                        key={idx}
                        className={cn(
                          "p-6 rounded-3xl bg-white/[0.02] border transition-all text-center flex flex-col items-center justify-center gap-3",
                          stat.border
                        )}
                      >
                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", stat.bg, stat.color)}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="text-3xl sm:text-4xl font-black font-headline text-white tracking-tight">
                          {stat.value}
                        </div>
                        <div className="text-xs text-white/50 font-bold">{stat.label}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Waqf Declaration Banner */}
                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
                      <Heart className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base">مشروع وقفي خيري لوجه الله تعالى</h4>
                      <p className="text-xs text-white/50 mt-1">كافة المواد العلمية والتسجيلات والأدوات متاحة مجاناً لكافة المسلمين بلا إعلانات تجارية.</p>
                    </div>
                  </div>
                  <div className="px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-black border border-emerald-500/20 shrink-0">
                    وقف خيري مستمر ✦
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            وقفة © صرحٌ علميٌّ متكامل لنشر العلوم الشرعية وتيسير طلب العلم.
          </p>
          <DialogClose asChild>
            <Button variant="ghost" className="rounded-full px-6 h-10 text-xs font-bold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10">
              إغلاق النافذة
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
