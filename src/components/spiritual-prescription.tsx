'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, Brain, CloudRain, Sun, Zap, Moon, Anchor, ArrowLeft, RefreshCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const MOODS = [
  { 
    id: 'sad', 
    label: 'أشعر بالحزن', 
    icon: CloudRain, 
    hexColor: '#60a5fa', 
    glowColor: 'rgba(96, 165, 250, 0.4)', 
    bgGradient: 'from-blue-500/10 via-cyan-500/5 to-transparent',
    desc: 'جرعة السلوان وبشرى الفرج',
    color: 'text-blue-400'
  },
  { 
    id: 'anxious', 
    label: 'متوتر أو قلق', 
    icon: Zap, 
    hexColor: '#fbbf24', 
    glowColor: 'rgba(251, 191, 36, 0.4)', 
    bgGradient: 'from-amber-500/10 via-yellow-500/5 to-transparent',
    desc: 'جرعة السكينة واليقين',
    color: 'text-amber-400'
  },
  { 
    id: 'weak-faith', 
    label: 'فتور في الإيمان', 
    icon: Moon, 
    hexColor: '#c084fc', 
    glowColor: 'rgba(192, 132, 252, 0.4)', 
    bgGradient: 'from-purple-500/10 via-fuchsia-500/5 to-transparent',
    desc: 'جرعة الإحياء والوصل',
    color: 'text-purple-400'
  },
  { 
    id: 'happy', 
    label: 'ممتن وسعيد', 
    icon: Sun, 
    hexColor: '#fb923c', 
    glowColor: 'rgba(251, 146, 60, 0.4)', 
    bgGradient: 'from-orange-500/10 via-red-500/5 to-transparent',
    desc: 'جرعة الشكر وحفظ النعمة',
    color: 'text-orange-400'
  },
  { 
    id: 'distracted', 
    label: 'مشتت الذهن', 
    icon: Brain, 
    hexColor: '#34d399', 
    glowColor: 'rgba(52, 211, 153, 0.4)', 
    bgGradient: 'from-emerald-500/10 via-teal-500/5 to-transparent',
    desc: 'جرعة التركيز والجمع',
    color: 'text-emerald-400'
  },
  { 
    id: 'need-strength', 
    label: 'أحتاج قوة وعزيمة', 
    icon: Anchor, 
    hexColor: '#f43f5e', 
    glowColor: 'rgba(244, 63, 94, 0.4)', 
    bgGradient: 'from-rose-500/10 via-pink-500/5 to-transparent',
    desc: 'جرعة الثبات والاستبصار',
    color: 'text-rose-400'
  },
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
    aya: "إِنَّمَا الْمُؤْمِنُونَ الَّذِينَ إِذَا ذُكِرَ اللَّهَ وَجِلَتْ قُلُوبُهُمْ",
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
  const [isFormulating, setIsFormulating] = useState(false);
  const [formulationStep, setFormulationStep] = useState(0);

  const selectedMoodData = MOODS.find(m => m.id === selectedMood);
  const prescription = selectedMood ? PRESCRIPTIONS[selectedMood] : null;

  const handleMoodSelect = (moodId: string) => {
    setSelectedMood(moodId);
    setIsFormulating(true);
    setFormulationStep(0);

    const timer1 = setTimeout(() => {
      setFormulationStep(1);
    }, 900);

    const timer2 = setTimeout(() => {
      setFormulationStep(2);
    }, 1800);

    const timer3 = setTimeout(() => {
      setIsFormulating(false);
    }, 2800);
  };

  return (
    <section className="container px-4 py-24 relative overflow-hidden">
      {/* CSS Keyframes and custom styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes orb-pulse {
          0%, 100% { transform: scale(1) translate(0, 0); opacity: 0.2; }
          50% { transform: scale(1.15) translate(10px, -10px); opacity: 0.35; }
        }
        @keyframes scan-line {
          0% { transform: translateY(-5px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(180px); opacity: 0; }
        }
        @keyframes particle-rise {
          0% { transform: translateY(0) scale(0.6); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.4; }
          100% { transform: translateY(-100px) scale(1.2); opacity: 0; }
        }
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes glow-path-flow {
          0% { stroke-dashoffset: 1000; }
          100% { stroke-dashoffset: -1000; }
        }
        .animate-orb-pulse {
          animation: orb-pulse 6s ease-in-out infinite;
        }
        .animate-particle-1 {
          animation: particle-rise 2.5s ease-out infinite;
        }
        .animate-particle-2 {
          animation: particle-rise 3.2s ease-out infinite 0.7s;
        }
        .animate-particle-3 {
          animation: particle-rise 2.8s ease-out infinite 1.4s;
        }
        .animate-scan {
          animation: scan-line 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        .animate-spin-reverse-slow {
          animation: spin-slow 15s linear infinite reverse;
        }
        .text-glow-custom {
          text-shadow: 0 0 15px rgba(255,255,255,0.05), 0 0 30px var(--text-glow-color, rgba(244,63,94,0.15));
        }
      `}} />

      {/* Background Ornaments */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.01] select-none text-[20rem] md:text-[30rem] font-black text-white leading-none whitespace-nowrap overflow-hidden z-0">
        SPIRITUAL PULSE
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-black uppercase tracking-widest mb-6"
          >
            <Heart className="w-4 h-4 fill-current" /> الوصفة الإيمانية
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4">
            كيف تجد <span className="text-rose-400">قلبك</span> اليوم؟
          </h2>
          <p className="text-white/40 text-base md:text-lg font-medium max-w-2xl mx-auto">
            اختر حالتك النفسية وسيقوم المعمل الإيماني بتركيب وصفة علاجية مخصصة لروحك من آيات الذكر الحكيم وأوراد النبوة.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!selectedMood ? (
            <motion.div 
              key="mood-selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10"
            >
              {MOODS.map((mood) => {
                const MoodIcon = mood.icon;
                return (
                  <button
                    key={mood.id}
                    onClick={() => handleMoodSelect(mood.id)}
                    className="relative flex items-center justify-between p-6 rounded-full border border-white/10 bg-white/[0.01] backdrop-blur-xl transition-all duration-500 group overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] hover:shadow-2xl text-right"
                    style={{
                      borderColor: 'rgba(255, 255, 255, 0.08)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = mood.hexColor;
                      e.currentTarget.style.boxShadow = `0 0 25px ${mood.glowColor}, inset 0 1px 2px rgba(255,255,255,0.1)`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {/* Glowing background gradient on hover */}
                    <div 
                      className={cn(
                        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-r",
                        mood.bgGradient
                      )} 
                    />

                    {/* Capsule Inner Design */}
                    <div className="flex items-center gap-4 w-full relative z-10">
                      {/* Left: The Essence (Pill container for icon) */}
                      <div className="flex items-center justify-center w-12 h-12 rounded-full border border-white/10 bg-white/[0.03] transition-all duration-500 relative overflow-hidden shrink-0 group-hover:border-white/20 group-hover:scale-110">
                        {/* Colored liquid fill wave inside */}
                        <div 
                          className="absolute bottom-0 left-0 right-0 top-1/2 transition-all duration-500 group-hover:top-0 opacity-40 group-hover:opacity-75"
                          style={{
                            background: `linear-gradient(to top, ${mood.hexColor}, transparent)`
                          }}
                        />
                        <MoodIcon className={cn("w-5 h-5 z-10 transition-transform duration-500 group-hover:rotate-6", mood.color)} />
                      </div>
                      
                      {/* Center: Mood Labels */}
                      <div className="flex flex-col text-right flex-grow">
                        <span className="text-white/90 group-hover:text-white transition-colors font-bold text-base md:text-lg leading-tight">
                          {mood.label}
                        </span>
                        <span className="text-white/30 text-xs mt-1 font-medium transition-colors group-hover:text-white/60">
                          {mood.desc}
                        </span>
                      </div>

                      {/* Right: Dot indicating the dosage status */}
                      <div className="flex items-center justify-center w-6 h-6 shrink-0">
                        <div 
                          className="w-2.5 h-2.5 rounded-full transition-all duration-500 group-hover:scale-150 relative"
                          style={{ backgroundColor: mood.hexColor }} 
                        >
                          <span 
                            className="absolute inset-0 rounded-full animate-ping opacity-0 group-hover:opacity-100" 
                            style={{ backgroundColor: mood.hexColor }}
                          />
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </motion.div>
          ) : isFormulating ? (
            <motion.div 
              key="formulating"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="bg-white/[0.01] backdrop-blur-3xl border border-white/5 rounded-[3.5rem] p-12 md:p-20 relative overflow-hidden flex flex-col items-center justify-center min-h-[520px] shadow-2xl relative z-10"
            >
              {/* Dynamic Glow Orb */}
              <div 
                className="absolute w-96 h-96 rounded-full blur-[120px] pointer-events-none opacity-30 animate-orb-pulse"
                style={{
                  background: `radial-gradient(circle, ${selectedMoodData?.hexColor} 0%, transparent 70%)`
                }}
              />

              {/* Holographic grid overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,255,255,0.05),transparent)] pointer-events-none" />

              <div className="relative z-10 flex flex-col items-center w-full max-w-lg">
                {/* 3D Glass Capsule Apothecary Jar */}
                <div className="relative w-36 h-48 flex items-center justify-center mb-12">
                  
                  {/* Outer Glass Jar Shell */}
                  <div 
                    className="absolute inset-0 rounded-[2.5rem] border border-white/20 backdrop-blur-md overflow-hidden flex flex-col justify-between"
                    style={{
                      boxShadow: `0 0 40px ${selectedMoodData?.glowColor}, inset 0 2px 4px rgba(255,255,255,0.15), inset 0 -8px 20px rgba(0,0,0,0.5)`,
                      borderColor: 'rgba(255, 255, 255, 0.15)'
                    }}
                  >
                    {/* Lid (Top Half) */}
                    <div className="h-1/3 w-full bg-white/[0.07] border-b border-white/10 relative">
                      <div className="absolute inset-x-3 top-2 h-3 rounded-full bg-white/10 blur-[1px]" />
                    </div>

                    {/* Essence Fluid (Bottom Half) */}
                    <div className="h-2/3 w-full relative overflow-hidden">
                      {/* Fluid wave */}
                      <div 
                        className="absolute inset-x-0 bottom-0 top-[20%] transition-all duration-1000 ease-in-out"
                        style={{
                          background: `linear-gradient(to top, ${selectedMoodData?.hexColor}44, ${selectedMoodData?.hexColor}11)`,
                        }}
                      />
                      
                      {/* Scanning Laser Line */}
                      <div 
                        className="absolute left-0 right-0 h-[2px] bg-white opacity-80 pointer-events-none animate-scan"
                        style={{
                          boxShadow: `0 0 10px 2px ${selectedMoodData?.hexColor}`,
                        }}
                      />

                      {/* Bubbles */}
                      <div className="absolute inset-x-0 bottom-0 top-0">
                        <div className="absolute w-1.5 h-1.5 rounded-full bg-white opacity-70 animate-particle-1 left-[25%] bottom-2" />
                        <div className="absolute w-2 h-2 rounded-full bg-white opacity-40 animate-particle-2 left-[50%] bottom-1" />
                        <div className="absolute w-1.5 h-1.5 rounded-full bg-white opacity-60 animate-particle-3 left-[75%] bottom-3" />
                      </div>
                    </div>
                  </div>

                  {/* Rotating Orbital Rings */}
                  <div 
                    className="absolute w-52 h-52 rounded-full border border-dashed border-white/10 animate-spin-slow"
                    style={{ borderColor: `${selectedMoodData?.hexColor}33` }}
                  />
                  <div 
                    className="absolute w-44 h-44 rounded-full border border-double border-white/5 animate-spin-reverse-slow"
                    style={{ borderColor: `${selectedMoodData?.hexColor}22` }}
                  />
                </div>

                {/* Progress Steps */}
                <div className="w-full space-y-4">
                  {[
                    { label: 'استشعار نبض القلب...', icon: Heart },
                    { label: 'استحضار الشفاء من الوحي الشريف...', icon: Sparkles },
                    { label: 'تركيب الورد المقترح ونصيحة القلب...', icon: Brain },
                  ].map((step, idx) => {
                    const isCompleted = formulationStep > idx;
                    const isActive = formulationStep === idx;
                    const StepIcon = step.icon;

                    return (
                      <div 
                        key={idx}
                        className={cn(
                          "flex items-center gap-4 px-6 py-4 rounded-2xl border transition-all duration-500",
                          isActive 
                            ? "bg-white/[0.03] border-white/10 shadow-lg scale-[1.02]" 
                            : isCompleted 
                              ? "bg-transparent border-transparent opacity-60" 
                              : "bg-transparent border-transparent opacity-20"
                        )}
                        style={isActive ? {
                          borderColor: `${selectedMoodData?.hexColor}22`,
                          boxShadow: `0 4px 20px -5px ${selectedMoodData?.glowColor}`
                        } : {}}
                      >
                        {/* Status Marker */}
                        <div className="flex items-center justify-center w-8 h-8 rounded-full shrink-0 relative">
                          {isCompleted ? (
                            <div 
                              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-sans"
                              style={{ backgroundColor: `${selectedMoodData?.hexColor}22`, color: selectedMoodData?.hexColor, border: `1px solid ${selectedMoodData?.hexColor}44` }}
                            >
                              ✓
                            </div>
                          ) : isActive ? (
                            <div className="w-6 h-6 rounded-full flex items-center justify-center">
                              <span className="w-2.5 h-2.5 rounded-full absolute animate-ping" style={{ backgroundColor: selectedMoodData?.hexColor }} />
                              <span className="w-2 h-2 rounded-full relative" style={{ backgroundColor: selectedMoodData?.hexColor }} />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10" />
                          )}
                        </div>

                        {/* Text Label */}
                        <div className="flex-grow text-right flex items-center gap-3">
                          <StepIcon className={cn("w-5 h-5 shrink-0", isActive ? "animate-pulse" : "")} style={{ color: isActive ? selectedMoodData?.hexColor : 'inherit' }} />
                          <span className={cn(
                            "font-bold text-sm md:text-base transition-colors",
                            isActive ? "text-white" : isCompleted ? "text-white/60" : "text-white/20"
                          )}>
                            {step.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="prescription"
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -40 }}
              className="bg-white/[0.01] backdrop-blur-3xl border border-white/5 rounded-[4rem] p-8 md:p-16 relative overflow-hidden shadow-2xl relative z-10"
            >
              {/* Dynamic Theme Glow Orb in background */}
              <div 
                className="absolute top-0 right-0 w-[450px] h-[450px] rounded-full blur-[140px] pointer-events-none opacity-25 animate-orb-pulse"
                style={{
                  background: `radial-gradient(circle, ${selectedMoodData?.hexColor} 0%, transparent 70%)`
                }}
              />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/[0.02] blur-[100px] rounded-full pointer-events-none" />

              {/* Glowing Line Flow SVG Animation - Background decoration */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible opacity-30 z-0">
                <defs>
                  <linearGradient id="beamGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={selectedMoodData?.hexColor} stopOpacity="0" />
                    <stop offset="25%" stopColor={selectedMoodData?.hexColor} stopOpacity="1" />
                    <stop offset="75%" stopColor={selectedMoodData?.hexColor} stopOpacity="1" />
                    <stop offset="100%" stopColor={selectedMoodData?.hexColor} stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Wavy beam descending from center top */}
                <path
                  d="M 50% 0 Q 45% 150 50% 300 T 50% 600"
                  fill="none"
                  stroke="url(#beamGrad)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="250 750"
                  className="animate-[glow-path-flow_8s_linear_infinite]"
                  style={{
                    filter: `drop-shadow(0 0 8px ${selectedMoodData?.hexColor})`
                  }}
                />
              </svg>

              <div className="relative z-10">
                {/* Header controls */}
                <div className="flex items-center justify-between mb-12 border-b border-white/5 pb-6">
                   <button 
                    onClick={() => setSelectedMood(null)}
                    className="flex items-center gap-2 text-white/40 hover:text-white transition-colors font-bold text-sm group"
                   >
                     <RefreshCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" /> 
                     <span>العودة للاختيار</span>
                   </button>
                   
                   <div 
                     className="px-5 py-2 rounded-full border text-xs font-black uppercase tracking-wider transition-all duration-300"
                     style={{
                       backgroundColor: `${selectedMoodData?.hexColor}10`,
                       borderColor: `${selectedMoodData?.hexColor}33`,
                       color: selectedMoodData?.hexColor,
                       boxShadow: `0 0 15px ${selectedMoodData?.glowColor}`
                     }}
                   >
                     الوصفة الروحية المقترحة
                   </div>
                </div>

                <div className="space-y-12">
                   {/* Quranic Verse card - The Divine Healing */}
                   <div className="text-center relative py-8 px-6 rounded-[2.5rem] bg-white/[0.01] border border-white/5 backdrop-blur-xl shadow-xl overflow-hidden group">
                      {/* Inner ambient glow on hover */}
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none"
                        style={{
                          background: `radial-gradient(circle at center, ${selectedMoodData?.hexColor}08 0%, transparent 70%)`
                        }}
                      />

                      <p className="text-white/20 text-[11px] font-black uppercase tracking-[0.4em] mb-6">الدستور الرباني الشافي</p>
                      
                      <h3 
                        className="font-amiri text-4xl md:text-5xl lg:text-6xl text-white leading-loose transition-all duration-700 text-glow-custom"
                        style={{
                          '--text-glow-color': selectedMoodData?.glowColor
                        } as React.CSSProperties}
                      >
                        " {prescription.aya} "
                      </h3>
                      
                      <div className="mt-8 flex justify-center">
                         <div 
                           className="w-32 h-[2px] transition-all duration-700 group-hover:w-48" 
                           style={{
                             background: `linear-gradient(to right, transparent, ${selectedMoodData?.hexColor}, transparent)`
                           }}
                         />
                      </div>
                   </div>

                   {/* Treatment items: Adhkar & Advice */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Ward card */}
                      <div 
                        className="p-8 rounded-[2.5rem] bg-white/[0.01] border border-white/5 backdrop-blur-xl relative overflow-hidden group transition-all duration-500 hover:scale-[1.02] hover:border-white/10"
                        style={{
                          boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05)'
                        }}
                      >
                        {/* Glow corner */}
                        <div 
                          className="absolute -top-12 -right-12 w-24 h-24 rounded-full blur-2xl opacity-20 transition-all duration-500 group-hover:opacity-40"
                          style={{ backgroundColor: selectedMoodData?.hexColor }}
                        />
                        
                        <div className="flex items-center gap-3 mb-6 relative z-10">
                           <Sparkles className="w-5 h-5" style={{ color: selectedMoodData?.hexColor }} />
                           <h4 className="text-lg font-black text-white">الورد المقترح (العلاج)</h4>
                        </div>
                        <p className="text-white/80 text-lg leading-relaxed font-bold relative z-10 pr-2 border-r-2" style={{ borderColor: selectedMoodData?.hexColor }}>
                          {prescription.adhkar}
                        </p>
                      </div>

                      {/* Heart advice card */}
                      <div 
                        className="p-8 rounded-[2.5rem] bg-white/[0.01] border border-white/5 backdrop-blur-xl relative overflow-hidden group transition-all duration-500 hover:scale-[1.02] hover:border-white/10"
                        style={{
                          boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05)'
                        }}
                      >
                        {/* Glow corner */}
                        <div 
                          className="absolute -top-12 -right-12 w-24 h-24 rounded-full blur-2xl opacity-20 transition-all duration-500 group-hover:opacity-40"
                          style={{ backgroundColor: '#10b981' }} // emerald
                        />

                        <div className="flex items-center gap-3 mb-6 relative z-10">
                           <Brain className="w-5 h-5 text-emerald-400" />
                           <h4 className="text-lg font-black text-white">نصيحة القلب</h4>
                        </div>
                        <p className="text-white/70 text-base md:text-lg leading-relaxed relative z-10 pr-2 border-r-2 border-emerald-500">
                          {prescription.advice}
                        </p>
                      </div>
                   </div>

                   {/* Action buttons / suggestions */}
                   <div className="flex flex-col items-center justify-center gap-4 pt-8">
                      {/* Flow Glow Path animation connecting verse to CTA */}
                      <div 
                        className="h-10 w-[2px] mb-2 animate-pulse"
                        style={{
                          background: `linear-gradient(to bottom, ${selectedMoodData?.hexColor}, transparent)`
                        }}
                      />
                      
                      <Button 
                        asChild 
                        className="h-16 px-12 rounded-full font-black text-lg text-white shadow-2xl transition-all duration-500 hover:scale-105 active:scale-95 group relative overflow-hidden"
                        style={{
                          background: `linear-gradient(135deg, ${selectedMoodData?.hexColor}, ${selectedMoodData?.hexColor}dd)`,
                          boxShadow: `0 10px 30px -5px ${selectedMoodData?.glowColor}`
                        }}
                      >
                        <a href={prescription.actionLink} className="flex items-center gap-4">
                          <span>{prescription.actionLabel}</span>
                          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform duration-300" />
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
