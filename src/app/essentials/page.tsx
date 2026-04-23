"use client";

import { motion } from "framer-motion";
import { 
  Shield, 
  Droplets, 
  BookOpen, 
  Heart, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  ChevronLeft,
  GraduationCap,
  Star
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const sections = [
  {
    id: "aqeedah",
    title: "أصول العقيدة",
    description: "معرفة الله ورسله واليوم الآخر وكل ما يجب الإيمان به.",
    icon: Shield,
    color: "from-blue-500/20 to-cyan-500/20",
    items: [
      "معنى كلمة التوحيد (لا إله إلا الله)",
      "أركان الإيمان الستة",
      "معرفة الله بأسمائه وصفاته (الأساسيات)",
      "شروط قبول العمل (الإخلاص والمتابعة)"
    ]
  },
  {
    id: "tahara",
    title: "فقه الطهارة",
    description: "كيف تتطهر لتصح صلاتك وعبادتك.",
    icon: Droplets,
    color: "from-emerald-500/20 to-teal-500/20",
    items: [
      "كيفية الوضوء الصحيحة",
      "موجبات الغسل وكيفيته",
      "أحكام النجاسات وكيفية تطهيرها",
      "المسح على الخفين والجوربين"
    ]
  },
  {
    id: "salah",
    title: "فقه الصلاة",
    description: "الركن الثاني من أركان الإسلام، عماد الدين.",
    icon: BookOpen,
    color: "from-amber-500/20 to-orange-500/20",
    items: [
      "أركان الصلاة وواجباتها",
      "مبطلات الصلاة",
      "صفة صلاة النبي ﷺ",
      "مواقيت الصلاة وأهمية الجماعة"
    ]
  },
  {
    id: "akhlaq",
    title: "الأخلاق والآداب",
    description: "جوهر الدين ومعاملة الناس بالحسنى.",
    icon: Heart,
    color: "from-rose-500/20 to-pink-500/20",
    items: [
      "بر الوالدين وصلة الرحم",
      "الصدق والأمانة وترك الكذب",
      "آداب الطريق والمجلس",
      "حفظ اللسان من الغيبة والنميمة"
    ]
  }
];

export default function EssentialsPage() {
  const { toast } = useToast();
  const [completed, setCompleted] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("waqfah_essentials_progress");
    if (saved) setCompleted(JSON.parse(saved));
  }, []);

  const toggleItem = (itemId: string) => {
    const newCompleted = completed.includes(itemId)
      ? completed.filter(i => i !== itemId)
      : [...completed, itemId];
    
    setCompleted(newCompleted);
    localStorage.setItem("waqfah_essentials_progress", JSON.stringify(newCompleted));

    if (!completed.includes(itemId)) {
      toast({
        title: "رائع! أحسنت التعلم 🌟",
        description: "لقد أضفت موضوعاً جديداً لقائمة معارفك الأساسية.",
      });
    }
  };

  const totalItems = sections.reduce((acc, s) => acc + s.items.length, 0);
  const progressPercent = Math.round((completed.length / totalItems) * 100);

  return (
    <div className="min-h-screen pb-32 overflow-x-hidden">
      {/* 🏛️ Hero Section */}
      <section className="relative h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="absolute inset-0 bg-zinc-950">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.1)_0%,transparent_70%)]" />
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em]">
            <Star className="w-4 h-4 fill-primary animate-pulse" />
            الدليل التعليمي الأساسي
          </div>
          <h1 className="text-6xl md:text-8xl font-black font-headline tracking-tighter text-white uppercase italic">
            ما لا يسع <span className="text-primary underline decoration-primary/30 underline-offset-8">المسلم</span> جهله
          </h1>
          <p className="text-xl text-white/40 max-w-2xl mx-auto font-medium leading-relaxed italic">
            طريقك المختصر لتعلم أصول دينك وما لا تصح عبادتك بدونه، في عرضٍ عصريٍ ومبسط.
          </p>
          
          {/* 📊 Global Progress Bar */}
          <div className="max-w-md mx-auto pt-8">
            <div className="flex justify-between text-xs font-black uppercase tracking-widest text-white/20 mb-3">
              <span>إنجاز المنهج التعليمي</span>
              <span className="text-primary">{progressPercent}%</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                className="h-full bg-gradient-to-r from-primary to-emerald-400 shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]"
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* 🧩 Bento Grid Sections */}
      <div className="container px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {sections.map((section, idx) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="h-full border-white/5 bg-white/[0.02] backdrop-blur-3xl rounded-[2.5rem] overflow-hidden hover:border-primary/20 transition-all duration-500 group relative">
                {/* Decorative Background Icon */}
                <section.icon className="absolute -top-10 -right-10 w-40 h-40 text-white/[0.02] group-hover:text-primary/[0.05] transition-all duration-700" />
                
                <CardContent className="p-10 space-y-8">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className={cn("inline-flex p-3 rounded-2xl bg-gradient-to-br shadow-xl", section.color)}>
                        <section.icon className="w-8 h-8 text-white" />
                      </div>
                      <h2 className="text-3xl font-black font-headline text-white pt-2">{section.title}</h2>
                    </div>
                    <div className="text-[40px] font-black text-white/5 font-mono">0{idx + 1}</div>
                  </div>

                  <p className="text-white/40 font-medium leading-relaxed italic">{section.description}</p>

                  <div className="space-y-3 pt-4">
                    {section.items.map((item, i) => {
                      const itemId = `${section.id}-${i}`;
                      const isCompleted = completed.includes(itemId);
                      return (
                        <button
                          key={i}
                          onClick={() => toggleItem(itemId)}
                          className={cn(
                            "w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 text-right group/item",
                            isCompleted 
                              ? "bg-primary/10 border-primary/20 text-white" 
                              : "bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:border-white/10"
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                              isCompleted ? "bg-primary border-primary scale-110" : "border-white/10"
                            )}>
                              {isCompleted && <CheckCircle2 className="w-4 h-4 text-black font-bold" />}
                            </div>
                            <span className="font-bold">{item}</span>
                          </div>
                          <ArrowRight className={cn("w-4 h-4 transition-all opacity-0", !isCompleted && "group-hover/item:opacity-40 group-hover/item:translate-x-1")} />
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* 🎓 Completion Section */}
        {progressPercent === 100 && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-24 p-12 rounded-[3rem] bg-gradient-to-br from-primary/20 to-emerald-500/10 border border-primary/20 text-center space-y-6 relative overflow-hidden"
          >
            <Sparkles className="absolute -top-10 -left-10 w-40 h-40 text-primary/10 animate-spin-slow" />
            <div className="inline-flex p-4 rounded-full bg-primary text-black shadow-2xl shadow-primary/50">
              <GraduationCap className="w-12 h-12" />
            </div>
            <h2 className="text-4xl font-black font-headline text-white italic">تهانينا! لقد أتممت المنهج الأساسي</h2>
            <p className="text-white/60 max-w-xl mx-auto font-bold">
              "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ"
              <br />لقد وضعت اليوم أساساً متيناً لدينك، استمر في طلب العلم.
            </p>
            <Button size="lg" className="rounded-2xl px-12 h-16 text-xl font-black shadow-xl shadow-primary/20" asChild>
              <a href="/lectures">ابدأ في المحاضرات المتقدمة</a>
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
