'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, Brain, CloudRain, Sun, Zap, Moon, Anchor, ArrowLeft, RefreshCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const MOODS = [
  { id: 'sad', label: 'أشعر بالحزن', icon: CloudRain, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { id: 'anxious', label: 'متوتر أو قلق', icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  { id: 'weak-faith', label: 'فتور في الإيمان', icon: Moon, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  { id: 'happy', label: 'ممتن وسعيد', icon: Sun, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  { id: 'distracted', label: 'مشتت الذهن', icon: Brain, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { id: 'need-strength', label: 'أحتاج قوة وعزيمة', icon: Anchor, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
];

const PRESCRIPTIONS: Record<string, any> = {
  sad: {
    aya: "لَا تَحْزَنْ إِنَّ اللَّهَ مَعَنَا",
    adhkar: "سبحان الله وبحمده (100 مرة)",
    advice: "تذكر أن الدنيا دار ممر، وأن مع العسر يسراً.",
    actionLink: "/dua",
    actionLabel: "أدعية كشف الكرب"
  },
  anxious: {
    aya: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
    adhkar: "لا حول ولا قوة إلا بالله (فضل عظيم في إزالة الهم)",
    advice: "سلم أمرك لله، فما قدّره الله كان، وما لم يقدّره لم يكن.",
    actionLink: "/adhkar",
    actionLabel: "أذكار الطمأنينة"
  },
  'weak-faith': {
    aya: "إِنَّمَا الْمُؤْمِنُونَ الَّذِينَ إِذَا ذُكِرَ اللَّهُ وَجِلَتْ قُلُوبُهُمْ",
    adhkar: "يا مقلب القلوب ثبت قلبي على دينك",
    advice: "جدد إيمانك بسماع آيات الله، وصحبة العلماء الربانيين.",
    actionLink: "/aqeedah",
    actionLabel: "تجديد أصول الإيمان"
  },
  happy: {
    aya: "لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ",
    adhkar: "الحمد لله ملء السماوات وملء الأرض",
    advice: "الشكر قيد النعم، فزد من الطاعة ليزيدك الله من فضله.",
    actionLink: "/hadith",
    actionLabel: "أحاديث في فضل الشكر"
  },
  distracted: {
    aya: "وَاذْكُر رَّبَّكَ إِذَا نَسِيتَ",
    adhkar: "أستغفر الله العظيم (تصفية للقلب والذهن)",
    advice: "اخلُ بنفسك دقائق، واذكر الله بصدق، ستجد السكينة.",
    actionLink: "/adhkar",
    actionLabel: "أذكار التركيز"
  },
  'need-strength': {
    aya: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ",
    adhkar: "حسبُنا الله ونعم الوكيل",
    advice: "القوة تُستمد من القوي المتين، فلا تعجز واستعن بالله.",
    actionLink: "/muhlikat",
    actionLabel: "تقوية العزيمة"
  }
};

export function SpiritualPrescription() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const prescription = selectedMood ? PRESCRIPTIONS[selectedMood] : null;

  return (
    <section className="container px-4 py-24 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.03] select-none text-[30rem] font-black text-white leading-none whitespace-nowrap overflow-hidden">
        SPIRITUAL PULSE
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-black uppercase tracking-widest mb-6"
          >
            <Heart className="w-4 h-4 fill-current" /> الوصفة الإيمانية
          </motion.div>
          <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4">كيف تجد <span className="text-rose-400">قلبك</span> اليوم؟</h2>
          <p className="text-white/40 text-lg md:text-xl font-medium max-w-2xl mx-auto">
            اختر حالتك النفسية وسنقترح لك "وصفة إيمانية" من الوحي والسنة لتعينك.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!selectedMood ? (
            <motion.div 
              key="mood-selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-2 md:grid-cols-3 gap-6"
            >
              {MOODS.map((mood) => (
                <button
                  key={mood.id}
                  onClick={() => setSelectedMood(mood.id)}
                  className={cn(
                    "flex flex-col items-center justify-center p-10 rounded-[3rem] border transition-all duration-500 group relative overflow-hidden",
                    mood.bg, mood.border, "hover:scale-105 hover:shadow-2xl hover:shadow-rose-500/10"
                  )}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <mood.icon className={cn("w-12 h-12 mb-6 transition-transform group-hover:scale-110 group-hover:rotate-6", mood.color)} />
                  <span className="font-bold text-lg text-white text-center">{mood.label}</span>
                </button>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="prescription"
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -40 }}
              className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[4rem] p-10 md:p-20 relative overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 blur-[120px] rounded-full pointer-events-none" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-12">
                   <button 
                    onClick={() => setSelectedMood(null)}
                    className="flex items-center gap-2 text-white/30 hover:text-white transition-colors font-bold text-sm"
                   >
                     <RefreshCcw className="w-4 h-4" /> العودة للاختيار
                   </button>
                   <div className="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-black text-rose-400 uppercase tracking-widest">
                     Spiritual Prescription
                   </div>
                </div>

                <div className="space-y-12">
                   {/* The Aya */}
                   <div className="text-center group">
                      <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.4em] mb-6">الدستور الرباني</p>
                      <h3 className="font-amiri text-4xl md:text-6xl text-white leading-loose group-hover:text-rose-200 transition-colors duration-700">
                        "{prescription.aya}"
                      </h3>
                      <div className="mt-8 flex justify-center">
                         <div className="w-20 h-1 bg-gradient-to-r from-transparent via-rose-500/30 to-transparent" />
                      </div>
                   </div>

                   {/* The Adhkar & Advice */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="p-10 rounded-[2.5rem] bg-white/[0.03] border border-white/5">
                        <div className="flex items-center gap-3 mb-6">
                           <Sparkles className="w-5 h-5 text-amber-400" />
                           <h4 className="text-xl font-black text-white">الورد المقترح</h4>
                        </div>
                        <p className="text-white/60 text-lg leading-relaxed font-bold">{prescription.adhkar}</p>
                      </div>
                      <div className="p-10 rounded-[2.5rem] bg-white/[0.03] border border-white/5">
                        <div className="flex items-center gap-3 mb-6">
                           <Brain className="w-5 h-5 text-emerald-400" />
                           <h4 className="text-xl font-black text-white">نصيحة القلب</h4>
                        </div>
                        <p className="text-white/60 text-lg leading-relaxed">{prescription.advice}</p>
                      </div>
                   </div>

                   {/* Action */}
                   <div className="flex justify-center pt-8">
                      <Button asChild className="h-16 px-12 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xl shadow-2xl shadow-rose-500/20 group">
                        <a href={prescription.actionLink} className="flex items-center gap-4">
                          {prescription.actionLabel}
                          <ArrowLeft className="w-6 h-6 group-hover:-translate-x-2 transition-transform" />
                        </a>
                      </Button>
                   </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
