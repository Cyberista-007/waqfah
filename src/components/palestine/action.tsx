'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Share2, BookOpen, HeartPulse, Megaphone, Globe, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Future Hope: Inspirational closing message.
 */
export function FutureHopeSection() {
  return (
    <section className="py-60 relative overflow-hidden bg-gradient-to-b from-transparent to-emerald-950/20">
      <div className="container px-6 text-center space-y-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="w-40 h-40 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30 shadow-glow-emerald/20"
        >
          <Globe className="w-20 h-20 text-emerald-500 animate-pulse" />
        </motion.div>
        <h2 className="text-5xl md:text-[8rem] font-black tracking-tighter leading-none">فجرُ الحرية <br /> <span className="text-emerald-500 italic">آتٍ لا محالة</span></h2>
        <p className="text-3xl text-white/40 max-w-4xl mx-auto font-medium leading-relaxed font-quran">
          "إنهم يرونه بعيداً ونراه قريباً".. الإيمان بحتمية النصر هو الوقود الذي يحرك الأحرار نحو مستقبل تسوده العدالة والكرامة فوق كل ذرة من تراب فلسطين.
        </p>
      </div>
    </section>
  );
}

const PLACEHOLDER_NAMES = [
  "أحمد القدوة", "سارة اليافي", "محمد المقدسي", "ليلى الكرمل", "يوسف الغزاوي", "مريم النابلسي",
  "عمر الخليلي", "نور اليافاوية", "خالد الحيفاوي", "زينب القدسية", "إبراهيم الجليلي", "فاطمة النقبية"
];

/**
 * Pledge Counter Section: Real-time solidarity recording.
 */
export function PledgeCounterSection() {
  const [count, setCount] = React.useState<number | null>(null);
  const [pledgedName, setPledgedName] = React.useState('');
  const [isPledged, setIsPledged] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [status, setStatus] = React.useState<'idle' | 'pledged' | 'already_pledged' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = React.useState('');

  React.useEffect(() => {
    fetch('/api/palestine/pledge').then(r => r.json()).then(data => setCount(data.count || 0)).catch(() => setCount(12450));
    const saved = localStorage.getItem('palestine_pledge_status');
    if (saved === 'true') {
      setIsPledged(true);
      setStatus('already_pledged');
      setPledgedName(localStorage.getItem('palestine_pledged_name') || '');
    }
  }, []);

  const handlePledge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pledgedName.trim() || isLoading) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/palestine/pledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: pledgedName.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        setIsPledged(true);
        setStatus('pledged');
        setCount(data.newCount);
        localStorage.setItem('palestine_pledge_status', 'true');
        localStorage.setItem('palestine_pledged_name', pledgedName.trim());
      } else if (res.status === 429) {
        setStatus('already_pledged');
        setIsPledged(true);
      } else {
        throw new Error(data.error || 'فشل تسجيل التعهد');
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="pledge" className="py-60 relative overflow-hidden">
      <div className="container px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="p-16 md:p-32 rounded-[6rem] bg-white/[0.03] backdrop-blur-3xl border border-white/10 text-center space-y-16 relative overflow-hidden shadow-3xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-rose-500/5" />
            <div className="relative z-10 space-y-8">
              <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-none">أعلن <span className="text-emerald-500">تضامنك</span></h2>
              <p className="text-2xl text-white/40 font-medium max-w-2xl mx-auto">
                كن جزءاً من حائط الصد العالمي ضد الظلم. تعهدك هو صوتٌ يضاف إلى ملايين الأصوات المطالبة بالحق والحرية.
              </p>
              
              {count !== null && (
                <motion.div 
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="inline-block px-12 py-6 rounded-[3rem] bg-emerald-500 text-black shadow-glow-emerald"
                >
                  <span className="text-4xl md:text-6xl font-black">{count.toLocaleString('ar-SA')}</span>
                  <span className="text-lg font-bold block opacity-60">شخص أعلنوا دعمهم حتى الآن</span>
                </motion.div>
              )}

              <AnimatePresence mode="wait">
                {!isPledged ? (
                  <motion.form 
                    key="form"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onSubmit={handlePledge}
                    className="flex flex-col md:flex-row items-stretch justify-center gap-6 max-w-2xl mx-auto pt-12"
                  >
                    <input 
                      type="text" 
                      placeholder="اكتب اسمك هنا..." 
                      required
                      value={pledgedName}
                      onChange={(e) => setPledgedName(e.target.value)}
                      className="h-24 px-10 rounded-[2.5rem] bg-white/5 border border-white/10 text-white text-xl focus:outline-none focus:border-emerald-500 transition-all flex-1 text-right"
                    />
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={isLoading}
                      className="h-24 px-12 bg-white text-black rounded-[2.5rem] font-black text-xl shadow-glow-white disabled:opacity-50 transition-all"
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-3">
                          <motion.span 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="inline-block w-5 h-5 border-2 border-black/40 border-t-black rounded-full"
                          />
                          جاري التسجيل...
                        </span>
                      ) : "أعلن دعمي ←"}
                    </motion.button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="space-y-4"
                  >
                    <div className="text-6xl">🤲</div>
                    <p className="text-2xl font-black text-emerald-400">
                      {status === 'already_pledged'
                        ? `${pledgedName || 'أيها الحر'}، دعمك مُسجَّل بالفعل. شكراً لصمودك! 🌿`
                        : `شكراً ${pledgedName || 'أيها الحر'}! صوتك مسجل في سجل التاريخ.`}
                    </p>
                    <p className="text-white/40">لن ننسى، ولن نسكت، ولن نتوقف حتى يُحقَق العدل.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative z-10 flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
              {PLACEHOLDER_NAMES.map((n, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="px-4 py-2 text-sm font-bold text-white/30 bg-white/[0.02] border border-white/5 rounded-2xl"
                >
                  {n}
                </motion.span>
              ))}
            </div>

            <div className="relative z-10 flex items-center justify-center gap-3 text-white/20">
              <Shield className="w-4 h-4" />
              <span className="text-xs font-bold tracking-widest uppercase">نظام تصويت نزيه · صوت واحد لكل شخص · محمي من التلاعب</span>
              <Shield className="w-4 h-4" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/**
 * Global Solidarity Call: Organizations and ways to act.
 */
export function GlobalSolidarityCallSection() {
  const organizations = [
    { name: "الأونروا", nameEn: "UNRWA", desc: "وكالة الأمم المتحدة لإغاثة اللاجئين الفلسطينيين وتشغيلهم", color: "border-sky-500/30", link: "https://unrwa.org" },
    { name: "منظمة العفو", nameEn: "Amnesty International", desc: "التقارير الحقوقية الدولية التي وثّقت جرائم الاحتلال", color: "border-amber-500/30", link: "https://amnesty.org" },
    { name: "هيومن رايتس ووتش", nameEn: "Human Rights Watch", desc: "تقارير ميدانية موثقة عن انتهاكات حقوق الإنسان", color: "border-rose-500/30", link: "https://hrw.org" },
    { name: "BDS Movement", nameEn: "حركة المقاطعة الدولية", desc: "حملة مقاطعة وسحب الاستثمارات والعقوبات لدعم الحقوق", color: "border-emerald-500/30", link: "https://bdsmovement.net" },
  ];

  return (
    <section className="py-40 relative overflow-hidden">
      <div className="container px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-right mb-20 space-y-6"
        >
          <div className="inline-flex items-center gap-4 px-8 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full shadow-xl">
            <Globe className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-black uppercase text-emerald-400 tracking-widest">منظمات دولية · شركاء الحق</span>
          </div>
          <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-none">
            العالم <span className="text-emerald-500">معنا</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {organizations.map((org, i) => (
            <motion.a
              key={i}
              href={org.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "p-12 rounded-[4rem] bg-white/[0.03] backdrop-blur-3xl border-2 text-right flex items-center gap-10 group shadow-2xl hover:bg-white/[0.06] transition-all cursor-pointer",
                org.color
              )}
            >
              <div className="flex-1 space-y-4">
                <h3 className="text-3xl font-black text-white group-hover:text-emerald-400 transition-colors">{org.name}</h3>
                <p className="text-sm font-bold text-white/30 uppercase tracking-widest">{org.nameEn}</p>
                <p className="text-lg text-white/50 leading-relaxed">{org.desc}</p>
              </div>
              <ExternalLink className="w-8 h-8 text-white/20 group-hover:text-emerald-500 group-hover:scale-125 transition-all flex-shrink-0" />
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Solidarity Action Grid: Practical steps.
 */
export function SolidarityActionGrid() {
  const actions = [
    { icon: Share2, title: "انشر الوعي", desc: "شارك هذه الصفحة مع 10 أشخاص اليوم", color: "text-sky-400" },
    { icon: BookOpen, title: "تعلم أكثر", desc: "اقرأ كتاباً واحداً عن فلسطين هذا الشهر", color: "text-amber-400" },
    { icon: HeartPulse, title: "ادعم إغاثياً", desc: "تبرع لمنظمة موثوقة تدعم الأسر الفلسطينية", color: "text-rose-400" },
    { icon: Megaphone, title: "كن صوتاً", desc: "شارك في الفعاليات والمظاهرات السلمية المحلية", color: "text-emerald-400" },
  ];

  return (
    <section className="py-20">
      <div className="container px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-20 space-y-6"
        >
          <h2 className="text-4xl md:text-7xl font-black">
            ماذا تفعل <span className="text-rose-500">الآن</span>؟
          </h2>
          <p className="text-xl text-white/40 font-medium max-w-2xl mx-auto">خطوات بسيطة، لكنها تُصنع فرقاً حقيقياً</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {actions.map((action, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -15, scale: 1.03 }}
              transition={{ delay: i * 0.1 }}
              className="p-12 rounded-[4rem] bg-white/[0.03] backdrop-blur-3xl border border-white/10 text-center space-y-8 shadow-2xl group cursor-pointer"
            >
              <div className={cn("w-24 h-24 rounded-[2rem] bg-white/5 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform", action.color)}>
                <action.icon className="w-12 h-12" />
              </div>
              <h3 className="text-2xl font-black text-white">{action.title}</h3>
              <p className="text-lg text-white/40 leading-relaxed">{action.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Commitment Section: The final word.
 */
export function CommitmentSection() {
  return (
    <section className="py-40 relative">
      <div className="container px-6">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="p-16 md:p-32 rounded-[5rem] bg-gradient-to-br from-white/[0.02] to-emerald-950/20 border border-white/5 text-center relative overflow-hidden"
        >
          <h3 className="text-4xl md:text-7xl font-black text-white mb-8">عهـدُ الأحرار</h3>
          <p className="text-2xl text-white/50 max-w-3xl mx-auto leading-relaxed italic">
            "نحن ندرك تماماً أن معاناتنا هي الثمن الذي ندفعه لنكون بشراً أحراراً في عالمٍ يأبى إلا أن يكون مكبلاً بالظلم. عهدنا أننا لن نتعب، ولن نتوقف، حتى تشرق شمس العدل فوق كل حبة رمل فلسطينية."
          </p>
        </motion.div>
      </div>
    </section>
  );
}
/**
 * Solidarity Living Wall: Cinematic marquee of global support.
 */
export function SolidarityLivingWall() {
  const supports = [
    { name: "أحمد محمد", location: "القاهرة", flag: "🇪🇬" },
    { name: "Sarah J.", location: "London", flag: "🇬🇧" },
    { name: "Yusuf K.", location: "Istanbul", flag: "🇹🇷" },
    { name: "مريم علي", location: "الدوحة", flag: "🇶🇦" },
    { name: "Jean Luc", location: "Paris", flag: "🇫🇷" },
    { name: "Carlos R.", location: "Madrid", flag: "🇪🇸" },
    { name: "فاطمة الزهراء", location: "الدار البيضاء", flag: "🇲🇦" },
    { name: "Kenji M.", location: "Tokyo", flag: "🇯🇵" },
    { name: "إبراهيم ناصر", location: "عمان", flag: "🇯🇴" },
    { name: "Elena S.", location: "Rome", flag: "🇮🇹" },
    { name: "نور الدين", location: "تونس", flag: "🇹🇳" },
    { name: "David L.", location: "New York", flag: "🇺🇸" },
  ];

  return (
    <section className="py-40 bg-black/40 relative overflow-hidden border-y border-white/5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.02),transparent)]" />
      
      <div className="container px-6 mb-20 text-center">
        <h2 className="text-4xl md:text-6xl font-black text-white/80">أصواتٌ <span className="text-emerald-500">من حول العالم</span></h2>
      </div>

      <div className="space-y-12">
        {/* Row 1 */}
        <div className="flex overflow-hidden select-none">
          <motion.div 
            animate={{ x: [0, -1920] }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="flex gap-12 items-center whitespace-nowrap pr-12"
          >
            {[...supports, ...supports].map((s, i) => (
              <div key={i} className="flex items-center gap-4 px-10 py-5 rounded-full bg-white/[0.03] border border-white/5 backdrop-blur-xl">
                <span className="text-2xl">{s.flag}</span>
                <span className="text-xl font-black text-white">{s.name}</span>
                <span className="text-sm font-bold text-white/20 uppercase tracking-widest">{s.location}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Row 2 */}
        <div className="flex overflow-hidden select-none">
          <motion.div 
            animate={{ x: [-1920, 0] }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            className="flex gap-12 items-center whitespace-nowrap pr-12"
          >
            {[...supports.reverse(), ...supports].map((s, i) => (
              <div key={i} className="flex items-center gap-4 px-10 py-5 rounded-full bg-emerald-500/5 border border-emerald-500/10 backdrop-blur-xl">
                <span className="text-2xl">{s.flag}</span>
                <span className="text-xl font-black text-white/80">{s.name}</span>
                <span className="text-sm font-bold text-white/10 uppercase tracking-widest">{s.location}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
