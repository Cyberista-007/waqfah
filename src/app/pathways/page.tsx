
"use client"

import { motion } from 'framer-motion';
import { 
  Sparkles, BookOpen, HeartHandshake, ShieldCheck, 
  ArrowLeft, GraduationCap, Trophy, Play, 
  CheckCircle2, Lock, Zap, Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const PATHWAYS = [
  {
    id: "foundation",
    title: "تأسيس طالب العلم",
    subtitle: "المرحلة التمهيدية لبناء وعي شرعي رصين",
    desc: "هذا المسار مخصص لكل مسلم يريد معرفة أصول دينه وما لا يسعه جهله من العقيدة والفقه والأخلاق.",
    icon: GraduationCap,
    color: "from-blue-500 to-indigo-600",
    shadow: "shadow-blue-500/20",
    modules: [
      { id: "m1", title: "كتاب التوحيد", lectures: 12, status: "completed" },
      { id: "m2", title: "الأربعين النووية", lectures: 40, status: "active" },
      { id: "m3", title: "متن الآجرومية", lectures: 25, status: "locked" },
      { id: "m4", title: "فقه العبادات", lectures: 18, status: "locked" }
    ],
    progress: 35
  },
  {
    id: "heart",
    title: "مسار العبادة والقلوب",
    subtitle: "رحلة تزكية النفس وتهذيب السلوك",
    desc: "تركيز عميق على أعمال القلوب، السيرة النبوية، وكيفية تحويل العبادات من عادات إلى قُربات.",
    icon: HeartHandshake,
    color: "from-rose-500 to-pink-600",
    shadow: "shadow-rose-500/20",
    modules: [
      { id: "m5", title: "تهذيب الأخلاق", lectures: 15, status: "locked" },
      { id: "m6", title: "السيرة النبوية", lectures: 52, status: "locked" },
      { id: "m7", title: "أعمال القلوب", lectures: 20, status: "locked" }
    ],
    progress: 0
  },
  {
    id: "defence",
    title: "الحصن المنيع",
    subtitle: "تفنيد الشبهات وتأصيل الثوابت",
    desc: "تعلم أصول المنهج وكيفية التعامل مع الشبهات المعاصرة والرد عليها بعلم وبصيرة.",
    icon: ShieldCheck,
    color: "from-emerald-500 to-teal-600",
    shadow: "shadow-emerald-500/20",
    modules: [
      { id: "m8", title: "أصول المنهج", lectures: 10, status: "locked" },
      { id: "m9", title: "الرد على الإلحاد", lectures: 14, status: "locked" },
      { id: "m10", title: "شبهات عصرية", lectures: 8, status: "locked" }
    ],
    progress: 0
  }
];

export default function PathwaysPage() {
  return (
    <div className="min-h-screen pb-20 space-y-24">
      {/* Cinematic Hero Section */}
      <section className="relative mx-4 sm:mx-8 mt-4 sm:mt-8 pt-32 pb-20 flex flex-col items-center text-center overflow-hidden border border-white/10 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl">
        {/* Dynamic Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-zinc-950" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-primary/10 blur-[120px] rounded-full opacity-30" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="container px-4 space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">
            <Layers className="w-3.5 h-3.5" /> مسارات التعلم الممنهجة
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black font-headline tracking-tighter text-white">
            رحلة العلم <span className="text-primary italic">والإيمان</span>
          </h1>
          
          <p className="text-xl text-white/30 max-w-2xl mx-auto font-medium leading-relaxed italic">
            "من سلك طريقاً يلتمس فيه علماً سهّل الله له به طريقاً إلى الجنة"
          </p>

          <div className="flex items-center justify-center gap-6 pt-4">
             <div className="flex flex-col items-center">
                <span className="text-3xl font-black text-white">12</span>
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">مساراً متاحاً</span>
             </div>
             <div className="w-px h-10 bg-white/10" />
             <div className="flex flex-col items-center">
                <span className="text-3xl font-black text-white">150+</span>
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">محاضرة مرتبة</span>
             </div>
             <div className="w-px h-10 bg-white/10" />
             <div className="flex flex-col items-center">
                <span className="text-3xl font-black text-white">4.5K</span>
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">طالب علم</span>
             </div>
          </div>
        </motion.div>
      </section>

      {/* Pathways List */}
      <section className="container px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 gap-20">
          {PATHWAYS.map((path, idx) => (
            <motion.div
              key={path.id}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className={cn(
                "group relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center",
                idx % 2 !== 0 && "lg:flex-row-reverse"
              )}
            >
              {/* Path Visuals */}
              <div className={cn(
                "relative h-[500px] rounded-[3.5rem] overflow-hidden border border-white/5",
                idx % 2 !== 0 && "lg:order-last"
              )}>
                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-20", path.color)} />
                <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm" />
                
                <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                  <div className={cn(
                    "w-32 h-32 rounded-[2.5rem] bg-zinc-900 border border-white/10 flex items-center justify-center mb-10 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6 shadow-2xl",
                    path.shadow
                  )}>
                    <path.icon className="w-16 h-16 text-white" />
                  </div>
                  <h3 className="text-4xl font-black text-white mb-4 font-headline">{path.title}</h3>
                  <p className="text-white/40 text-lg font-medium leading-relaxed max-w-md">{path.subtitle}</p>
                  
                  <div className="mt-12 w-full max-w-xs space-y-4">
                    <div className="flex justify-between items-end">
                       <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">تقدمك في المسار</span>
                       <span className="text-sm font-black text-primary">{path.progress}%</span>
                    </div>
                    <Progress value={path.progress} className="h-2 bg-white/5" />
                  </div>
                </div>
              </div>

              {/* Path Details & Modules */}
              <div className="space-y-10">
                <div className="space-y-4">
                  <h4 className="text-primary font-black text-xs uppercase tracking-[0.4em]">حول هذا المسار</h4>
                  <p className="text-white/70 text-xl leading-relaxed font-medium italic">
                    "{path.desc}"
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                   {path.modules.map((module, mIdx) => (
                     <div 
                      key={module.id}
                      className={cn(
                        "p-6 rounded-3xl border flex items-center justify-between transition-all duration-500",
                        module.status === 'completed' ? "bg-emerald-500/5 border-emerald-500/20" : 
                        module.status === 'active' ? "bg-primary/5 border-primary/20 shadow-lg shadow-primary/5" :
                        "bg-white/[0.02] border-white/5 opacity-60"
                      )}
                     >
                       <div className="flex items-center gap-5">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center font-black",
                            module.status === 'completed' ? "bg-emerald-500/20 text-emerald-400" :
                            module.status === 'active' ? "bg-primary/20 text-primary animate-pulse" :
                            "bg-white/5 text-white/20"
                          )}>
                            {module.status === 'completed' ? <CheckCircle2 className="w-6 h-6" /> : 
                             module.status === 'locked' ? <Lock className="w-5 h-5" /> :
                             mIdx + 1}
                          </div>
                          <div>
                            <h5 className="font-black text-white">{module.title}</h5>
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">{module.lectures} محاضرة</p>
                          </div>
                       </div>
                       
                       <Button 
                        size="sm" 
                        variant={module.status === 'locked' ? 'ghost' : 'outline'}
                        disabled={module.status === 'locked'}
                        className="rounded-xl font-black h-10 px-6"
                       >
                         {module.status === 'completed' ? "مراجعة" : module.status === 'active' ? "متابعة" : "مغلق"}
                       </Button>
                     </div>
                   ))}
                </div>

                <Button className="w-full h-16 rounded-[1.5rem] bg-white text-black hover:bg-zinc-200 font-black text-lg gap-3 shadow-2xl">
                  عرض تفاصيل المسار بالكامل <ArrowLeft className="w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Graduation CTA */}
      <section className="container px-4 py-20">
        <div className="relative p-12 md:p-20 rounded-[4rem] bg-gradient-to-br from-primary to-primary/60 overflow-hidden text-center text-white shadow-2xl shadow-primary/20">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.1] pointer-events-none" />
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <Trophy className="w-64 h-64" />
          </div>
          
          <div className="relative z-10 space-y-8 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black font-headline tracking-tighter">هل أنت مستعد لبدء <br/>رحلتك العلمية؟</h2>
            <p className="text-xl font-medium opacity-90 leading-relaxed">
              انضم إلى آلاف الطلاب الذين اختاروا المنهجية الممنهجة لبناء وعيهم الإيماني والشرعي. احصل على شهادات إتمام ونافس في لوحة الصدارة.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
               <Button size="lg" className="h-16 px-10 rounded-2xl bg-white text-primary hover:bg-zinc-100 font-black text-xl shadow-xl">
                 سجل الآن مجاناً
               </Button>
               <Button size="lg" variant="outline" className="h-16 px-10 rounded-2xl border-white/20 hover:bg-white/10 text-white font-black text-xl">
                 تعرف على المناهج
               </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
