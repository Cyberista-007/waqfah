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
  Star,
  Info,
  Trophy,
  Video,
  Book as BookIcon
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger 
} from "@/components/ui/dialog";
import confetti from "canvas-confetti";

const sections = [
  {
    id: "aqeedah",
    title: "أصول العقيدة",
    description: "معرفة الله ورسله واليوم الآخر وكل ما يجب الإيمان به.",
    icon: Shield,
    color: "from-blue-600 to-cyan-500",
    badge: "وسام الموحد",
    items: [
      { id: "a1", title: "معنى كلمة التوحيد", detail: "لا إله إلا الله هي مفتاح الجنة، وتعني أنه لا معبود بحق إلا الله وحده، وتتضمن النفي (لا إله) والإثبات (إلا الله).", link: "/lectures/aqeedah-1" },
      { id: "a2", title: "أركان الإيمان الستة", detail: "الإيمان بالله، وملائكته، وكتبه، ورسله، واليوم الآخر، والقدر خيره وشره.", link: "/lectures/iman-pillars" },
      { id: "a3", title: "أسماء الله وصفاته", detail: "إثبات ما أثبته الله لنفسه وما أثبته له رسوله ﷺ من غير تحريف ولا تعطيل ولا تكييف ولا تمثيل.", link: "/books/names-of-allah" },
      { id: "a4", title: "شروط قبول العمل", detail: "لكي يقبل الله عملك لابد من شرطين: الإخلاص (أن يكون لله وحده) والمتابعة (أن يكون على سنة النبي ﷺ).", link: "/lectures/sincerity" }
    ]
  },
  {
    id: "tahara",
    title: "فقه الطهارة",
    description: "كيف تتطهر لتصح صلاتك وعبادتك.",
    icon: Droplets,
    color: "from-emerald-600 to-teal-500",
    badge: "وسام الطهارة",
    items: [
      { id: "t1", title: "كيفية الوضوء", detail: "النية، غسل الوجه، اليدين للمرفقين، مسح الرأس، غسل الرجلين للكعبين، مع الترتيب والموالاة.", link: "/lectures/wudu" },
      { id: "t2", title: "موجبات الغسل", detail: "الجنابة، الحيض والنفاس، دخول الإسلام، والموت.", link: "/lectures/ghusl" },
      { id: "t3", title: "أحكام النجاسات", detail: "تطهير الثوب والبدن والمكان من النجاسات (كالبول والغائط) شرط لصحة الصلاة.", link: "/lectures/purity" },
      { id: "t4", title: "المسح على الخفين", detail: "رخصة للمسلم أن يمسح على جواربه يوماً وليلة للمقيم، وثلاثة أيام للمسافر، بشرط لبسها على طهارة.", link: "/lectures/khuff" }
    ]
  },
  {
    id: "salah",
    title: "فقه الصلاة",
    description: "الركن الثاني من أركان الإسلام، عماد الدين.",
    icon: BookOpen,
    color: "from-amber-600 to-orange-500",
    badge: "وسام المصلين",
    items: [
      { id: "s1", title: "أركان الصلاة", detail: "القيام، تكبيرة الإحرام، الفاتحة، الركوع، الرفع منه، السجود، الجلوس بين السجدتين، التشهد الأخير.", link: "/lectures/salah-pillars" },
      { id: "s2", title: "مبطلات الصلاة", detail: "الأكل والشرب، الكلام العمد، الحركة الكثيرة، ضحك القهقهة، انتقاض الطهارة.", link: "/lectures/invalid-salah" },
      { id: "s3", title: "صلاة الجماعة", detail: "تفضل صلاة الجماعة على صلاة الفرد بسبع وعشرين درجة، وهي واجبة على الرجال القادرين.", link: "/lectures/jamaah" },
      { id: "s4", title: "خشوع الصلاة", detail: "الخشوع هو روح الصلاة، ويكون باستحضار عظمة الله وتدبر الآيات والأذكار.", link: "/lectures/khushua" }
    ]
  },
  {
    id: "akhlaq",
    title: "الأخلاق والآداب",
    description: "جوهر الدين ومعاملة الناس بالحسنى.",
    icon: Heart,
    color: "from-rose-600 to-pink-500",
    badge: "وسام المحسنين",
    items: [
      { id: "e1", title: "بر الوالدين", detail: "أعظم الحقوق بعد حق الله تعالى، ويكون بطاعتهما والإحسان إليهما وخفض الجناح لهما.", link: "/lectures/parents" },
      { id: "e2", title: "الصدق والأمانة", detail: "من أعظم صفات المؤمن، والكذب من آيات المنافقين.", link: "/lectures/honesty" },
      { id: "e3", title: "حفظ اللسان", detail: "المسلم من سلم المسلمون من لسانه ويده، والغيبة والنميمة من كبائر الذنوب.", link: "/lectures/tongue" },
      { id: "e4", title: "حسن الجوار", detail: "الإحسان إلى الجار وكف الأذى عنه وصية جبريل للنبي ﷺ حتى ظن أنه سيورثه.", link: "/lectures/neighbors" }
    ]
  }
];

export default function EssentialsPage() {
  const { toast } = useToast();
  const [completed, setCompleted] = useState<string[]>([]);
  const [activeItem, setActiveItem] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("waqfah_essentials_progress");
    if (saved) setCompleted(JSON.parse(saved));
  }, []);

  const toggleItem = (itemId: string, sectionId: string) => {
    const isNowCompleted = !completed.includes(itemId);
    const newCompleted = isNowCompleted
      ? [...completed, itemId]
      : completed.filter(i => i !== itemId);
    
    setCompleted(newCompleted);
    localStorage.setItem("waqfah_essentials_progress", JSON.stringify(newCompleted));

    if (isNowCompleted) {
      // Check if section is now fully completed
      const section = sections.find(s => s.id === sectionId);
      const sectionItemIds = section?.items.map(i => i.id) || [];
      const allCompleted = sectionItemIds.every(id => newCompleted.includes(id));

      if (allCompleted) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#3b82f6', '#f59e0b']
        });
        toast({
          title: `مبروك! حصلت على ${section?.badge} 🏆`,
          description: `لقد أتممت قسم ${section?.title} بالكامل.`,
        });
      } else {
        toast({
          title: "تم الحفظ ✅",
          description: "استمر في رحلة طلب العلم.",
        });
      }
    }
  };

  const totalItems = sections.reduce((acc, s) => acc + s.items.length, 0);
  const progressPercent = Math.round((completed.length / totalItems) * 100);

  return (
    <div className="min-h-screen pb-32 overflow-x-hidden">
      {/* 🏛️ Premium Hero Section */}
      <section className="relative h-[70vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        <div className="absolute inset-0 bg-zinc-950">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.15)_0%,transparent_70%)] opacity-50" />
          <motion.div 
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" 
          />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 space-y-10"
        >
          <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl text-primary text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl">
            <Trophy className="w-5 h-5 fill-primary" />
            منهج طالب العلم المبتدئ
          </div>
          
          <div className="space-y-4">
            <h1 className="text-7xl md:text-9xl font-black font-headline tracking-tighter text-white uppercase italic leading-[0.8] block">
              ما لا يسع <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-400 to-primary animate-gradient">المسلم</span> جهله
            </h1>
          </div>

          <p className="text-2xl text-white/40 max-w-3xl mx-auto font-medium leading-relaxed italic">
            تعلم أصول دينك وما لا تصح صلاتك وعبادتك بدونه، في رحلة تعليمية تفاعلية مشوقة.
          </p>
          
          {/* 📊 Immersive Progress Tracker */}
          <div className="max-w-xl mx-auto pt-10">
            <div className="flex justify-between items-end mb-4">
              <div className="flex flex-col items-start">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/20">رتبة العلم</span>
                <span className="text-xl font-black text-white">{progressPercent < 30 ? "طالب علم ناشئ" : progressPercent < 70 ? "طالب علم مجتهد" : "طالب علم متمكن"}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-4xl font-black text-primary tracking-tighter">{progressPercent}%</span>
              </div>
            </div>
            <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-1">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)] relative"
              >
                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-shimmer" />
              </motion.div>
            </div>
          </div>
        </motion.div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-20">
          <div className="w-1 h-12 rounded-full bg-gradient-to-b from-primary to-transparent" />
        </div>
      </section>

      {/* 🧩 Interactive Grid */}
      <div className="container px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {sections.map((section, idx) => {
            const sectionItemIds = section.items.map(i => i.id);
            const isCompleted = sectionItemIds.every(id => completed.includes(id));
            
            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative"
              >
                {/* 🏅 Achievement Badge */}
                <AnimatePresence>
                  {isCompleted && (
                    <motion.div 
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="absolute -top-6 -right-6 z-40 bg-gradient-to-br from-yellow-400 to-orange-500 p-4 rounded-3xl shadow-2xl shadow-yellow-500/20 border-4 border-zinc-950"
                    >
                      <Trophy className="w-8 h-8 text-black" />
                      <div className="absolute -bottom-8 right-0 whitespace-nowrap bg-zinc-900 text-yellow-500 text-[10px] font-black px-3 py-1 rounded-full border border-yellow-500/20 uppercase tracking-widest">{section.badge}</div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Card className={cn(
                  "h-full border-white/5 bg-white/[0.02] backdrop-blur-3xl rounded-[3rem] overflow-hidden transition-all duration-700 relative",
                  isCompleted ? "border-primary/40 bg-primary/5" : "hover:border-white/20"
                )}>
                  <CardContent className="p-12 space-y-10">
                    <div className="flex items-start justify-between">
                      <div className="space-y-4">
                        <div className={cn("inline-flex p-4 rounded-[2rem] bg-gradient-to-br shadow-2xl", section.color)}>
                          <section.icon className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-4xl font-black font-headline text-white">{section.title}</h2>
                      </div>
                      <div className="text-6xl font-black text-white/5 font-mono select-none">0{idx + 1}</div>
                    </div>

                    <p className="text-xl text-white/40 font-medium leading-relaxed italic">{section.description}</p>

                    <div className="grid grid-cols-1 gap-4 pt-4">
                      {section.items.map((item) => {
                        const isItemDone = completed.includes(item.id);
                        return (
                          <div key={item.id} className="relative group/item">
                            <button
                              onClick={() => toggleItem(item.id, section.id)}
                              className={cn(
                                "w-full flex items-center justify-between p-6 rounded-[1.5rem] border transition-all duration-500 text-right pr-16",
                                isItemDone 
                                  ? "bg-primary/20 border-primary/30 text-white" 
                                  : "bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:border-white/10"
                              )}
                            >
                              <span className="text-lg font-black">{item.title}</span>
                              <ChevronLeft className={cn("w-5 h-5 transition-all opacity-0", !isItemDone && "group-hover/item:opacity-40 group-hover/item:translate-x-[-10px]")} />
                            </button>
                            
                            {/* Checkmark Circle */}
                            <div 
                              onClick={(e) => { e.stopPropagation(); toggleItem(item.id, section.id); }}
                              className={cn(
                                "absolute right-5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer z-10",
                                isItemDone ? "bg-primary border-primary scale-110" : "border-white/10 hover:border-primary/40"
                              )}
                            >
                              {isItemDone && <CheckCircle2 className="w-5 h-5 text-black font-bold" />}
                            </div>

                            {/* Info Trigger */}
                            <Dialog>
                              <DialogTrigger asChild>
                                <button className="absolute left-6 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-white/5 text-white/20 hover:text-primary hover:bg-primary/10 transition-all opacity-0 group-hover/item:opacity-100">
                                  <Info className="w-5 h-5" />
                                </button>
                              </DialogTrigger>
                              <DialogContent className="bg-zinc-950 border-white/10 max-w-lg rounded-[2.5rem] p-10">
                                <DialogHeader className="space-y-6">
                                  <div className={cn("w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center", section.color)}>
                                    <Info className="w-8 h-8 text-white" />
                                  </div>
                                  <DialogTitle className="text-3xl font-black font-headline">{item.title}</DialogTitle>
                                  <DialogDescription className="text-xl text-white/60 leading-relaxed font-medium text-right">
                                    {item.detail}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid grid-cols-2 gap-4 mt-10">
                                  <Button variant="outline" className="rounded-2xl h-14 font-bold border-white/10" asChild>
                                    <a href={item.link}><Video className="ml-2 w-4 h-4" /> درس مرئي</a>
                                  </Button>
                                  <Button className="rounded-2xl h-14 font-bold" asChild>
                                    <a href="/books"><BookIcon className="ml-2 w-4 h-4" /> كتاب إضافي</a>
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* 🎓 Master Completion UI */}
        {progressPercent === 100 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-32 p-20 rounded-[4rem] bg-gradient-to-br from-primary via-emerald-500 to-blue-600 text-center space-y-10 relative overflow-hidden shadow-[0_0_100px_rgba(var(--primary-rgb),0.3)]"
          >
            <Sparkles className="absolute -top-20 -left-20 w-80 h-80 text-white/10 animate-spin-slow" />
            <div className="inline-flex p-8 rounded-[3rem] bg-white text-black shadow-2xl scale-125">
              <GraduationCap className="w-20 h-20" />
            </div>
            <div className="space-y-4">
              <h2 className="text-6xl md:text-8xl font-black font-headline text-black italic uppercase">تم إنجاز المنهج!</h2>
              <p className="text-2xl text-black font-black uppercase tracking-widest opacity-80">أهلاً بك في ركب أهل العلم</p>
            </div>
            <p className="text-2xl text-black/70 max-w-2xl mx-auto font-bold leading-relaxed">
              "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ"
              <br /><span className="opacity-60">لقد أتممت اليوم الأساسيات الضرورية، وأنت الآن جاهز للانطلاق في بحر العلوم الشرعية الأوسع.</span>
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10">
              <Button size="lg" className="rounded-2xl px-12 h-20 text-2xl font-black bg-zinc-950 text-white hover:bg-zinc-900 shadow-2xl" asChild>
                <a href="/lectures">ابدأ المسار المتقدم</a>
              </Button>
              <Button size="lg" variant="outline" className="rounded-2xl px-12 h-20 text-2xl font-black border-black/20 bg-transparent text-black hover:bg-black/10" onClick={() => window.print()}>
                تحميل شهادة الإنجاز
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
