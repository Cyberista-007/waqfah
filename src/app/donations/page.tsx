'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Server, Film, BookOpen, Gift, Users, Share2, CreditCard, Landmark, Loader2, Star, Shield, Gem, Crown, HandHeart, Sparkles, Zap, Quote, Globe, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useCollection, useDoc, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import type { Donation, DonationSettings, UserProfile } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppearance } from '@/components/appearance-provider';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';

type Currency = {
    code: string;
    name: string;
    rate: number;
};

/* -------------------------------------------------------------------------- */
/*                                ANIMATION VARS                               */
/* -------------------------------------------------------------------------- */

const scrollFadeVariant: Variants = {
    hidden: { opacity: 0, y: 150, scale: 0.85, filter: 'blur(20px)' },
    visible: { 
        opacity: 1, 
        y: 0, 
        scale: 1, 
        filter: 'blur(0px)',
        transition: { 
            duration: 1.5, 
            ease: [0.16, 1, 0.3, 1] 
        } 
    }
};

const staggerContainer: Variants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.15
        }
    }
};

/* -------------------------------------------------------------------------- */
/*                                 COMPONENTS                                 */
/* -------------------------------------------------------------------------- */

function DonationGoalBackgroundController() {
    const { setBackgroundEffect, setParticleColor, setParticleSettings } = useAppearance();
    const { data: settings } = useDoc<DonationSettings>('settings/donations');

    const progress = useMemo(() => {
        if (!settings || !settings.monthlyGoal || settings.monthlyGoal <= 0) {
            return 0;
        }
        const { monthlyGoal = 0, currentAmount = 0 } = settings;
        return (monthlyGoal > 0) ? Math.min((currentAmount / monthlyGoal) * 100, 100) : 0;
    }, [settings]);

    const handleSetParticleSettings = useCallback(setParticleSettings, [setParticleSettings]);
    const handleSetParticleColor = useCallback(setParticleColor, [setParticleColor]);
    const handleSetBackgroundEffect = useCallback(setBackgroundEffect, [setBackgroundEffect]);

    useEffect(() => {
        const originalParticleColor = localStorage.getItem("site-particle-color") || '#FFFFFF';
        const originalParticleSettings = localStorage.getItem("site-particle-settings");
        const originalEffect = localStorage.getItem("site-background-effect") as 'none' | 'particles' | null;

        handleSetBackgroundEffect('particles');
        
        if (progress < 25) {
            handleSetParticleColor('#FFFFFF'); 
            handleSetParticleSettings({ count: 50, speed: 0.1, lineDistance: 150 });
        } else if (progress < 50) {
            handleSetParticleColor('#FFFFE0'); 
            handleSetParticleSettings({ count: 70, speed: 0.2, lineDistance: 140 });
        } else if (progress < 75) {
            handleSetParticleColor('#FFD700'); 
            handleSetParticleSettings({ count: 100, speed: 0.3, lineDistance: 130 });
        } else if (progress < 100) {
            handleSetParticleColor('#FFAC1C');
            handleSetParticleSettings({ count: 150, speed: 0.5, lineDistance: 120 });
        } else { 
            handleSetParticleColor('#FFD700'); 
            handleSetParticleSettings({ count: 250, speed: 1, lineDistance: 150 }); 
        }

        return () => {
            handleSetBackgroundEffect(originalEffect || 'none');
            if (originalParticleSettings) {
                try { handleSetParticleSettings(JSON.parse(originalParticleSettings)); } catch (e) { /* ignore */ }
            } else {
                handleSetParticleSettings({ interaction: true, count: 80, speed: 0.3, lineDistance: 120 });
            }
            handleSetParticleColor(originalParticleColor);
        };
    }, [progress, handleSetBackgroundEffect, handleSetParticleSettings, handleSetParticleColor]);

    return null;
}

function OneClickDonation({ currency }: { currency: Currency }) {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState<number | null>(null);

    const userDocRef = useMemoFirebase(
        () => (user && firestore ? doc(firestore, 'users', user.uid) : null),
        [user, firestore]
    );
    const { data: userProfile, isLoading } = useDoc<UserProfile>(userDocRef);

    const handleOneClickDonate = async (amount: number) => {
        setIsSubmitting(amount);
        await new Promise(resolve => setTimeout(resolve, 1500));
        toast({
            title: "شكرًا لدعمك المستمر!",
            description: `تم التبرع بمبلغ ${new Intl.NumberFormat('ar-EG').format(amount)} جنيه مصري بنجاح.`,
        });
        setIsSubmitting(null);
    };

    if (isLoading || !user || !userProfile?.savedCardLast4) return null;

    const cardBrand = userProfile?.savedCardBrand || 'Visa';
    const last4 = userProfile?.savedCardLast4 || '4242';
    const amounts = [100, 250, 500];

    return (
        <motion.div variants={scrollFadeVariant} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
            <Card className="bg-primary/5 border-primary/20 backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                <CardHeader>
                    <CardTitle className="text-2xl font-black font-headline flex items-center gap-3">
                        <CreditCard className="h-7 w-7 text-primary" />
                        تبرع سريع (بنقرة واحدة)
                    </CardTitle>
                    <CardDescription className="text-md">
                        بما أنك داعم سابق، يمكنك استخدام بطاقتك المحفوظة ({cardBrand} •••• {last4}) للمساهمة فوراً.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row justify-around gap-4 pt-4">
                    {amounts.map(amount => {
                        const convertedAmount = amount * currency.rate;
                        const formattedAmount = new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 0 }).format(Math.round(convertedAmount));
                        return (
                            <Button
                                key={amount}
                                size="lg"
                                className="flex-grow h-14 rounded-2xl text-lg font-bold"
                                onClick={() => handleOneClickDonate(amount)}
                                disabled={!!isSubmitting}
                            >
                                {isSubmitting === amount ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    `تبرع بـ ${formattedAmount} ${currency.code}`
                                )}
                            </Button>
                        )
                    })}
                </CardContent>
            </Card>
        </motion.div>
    );
}

function ImpactCalculator({ currency }: { currency: Currency }) {
    const [amount, setAmount] = useState(250);
    
    const impacts = useMemo(() => {
        const egpAmount = amount / currency.rate;
        return {
            students: Math.floor(egpAmount / 5),
            minutesEdited: Math.floor(egpAmount / 15), 
            pagesTranslated: Math.floor(egpAmount / 50)
        };
    }, [amount, currency]);

    return (
        <motion.div 
            variants={scrollFadeVariant} 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true, amount: 0.2 }}
            className="h-full"
        >
            <Card className="bg-card/40 backdrop-blur-2xl border-primary/20 overflow-hidden relative group h-full">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-16 translate-x-16" />
                 <CardHeader>
                    <CardTitle className="text-3xl font-black font-headline tracking-tighter flex items-center gap-3">
                       <Zap className="h-8 w-8 text-primary animate-pulse" />
                       تخيل أثرك الحقيقي
                    </CardTitle>
                    <CardDescription className="text-lg">
                        حرك المؤشر لترى كيف ستساهم تبرعاتك في تغيير حياة الآخرين بالعلم.
                    </CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-10">
                    <div className="space-y-4">
                        <input 
                            type="range" 
                            min="50" 
                            max="5000" 
                            step="50"
                            value={amount}
                            onChange={(e) => setAmount(parseInt(e.target.value))}
                            className="w-full h-3 bg-primary/20 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <div className="text-center">
                            <span className="text-5xl font-black text-primary font-headline tracking-tighter">
                                {new Intl.NumberFormat('ar-EG').format(amount)} {currency.code}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { label: 'طالب علم ستصل إليه', value: impacts.students, icon: Users, color: 'text-blue-500' },
                            { label: 'دقيقة من المحتوى المنقى', value: impacts.minutesEdited, icon: Film, color: 'text-rose-500' },
                            { label: 'صفحة مترجمة بالكامل', value: impacts.pagesTranslated, icon: Globe, color: 'text-emerald-500' }
                        ].map((impact, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center space-y-2 relative overflow-hidden"
                            >
                                <div className={cn("mx-auto w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4", impact.color)}>
                                    <impact.icon className="h-6 w-6" />
                                </div>
                                <div className="text-3xl font-black font-headline tabular-nums">{impact.value}</div>
                                <div className="text-sm text-muted-foreground font-bold">{impact.label}</div>
                            </motion.div>
                        ))}
                    </div>
                 </CardContent>
            </Card>
        </motion.div>
    )
}

function WallOfSupporters() {
    const { data: supporters, isLoading } = useCollection<Donation>('donations', {
        where: ['isAnonymous', '==', false],
        orderBy: ['donatedAt', 'desc'],
        limit: 50
    });

    if (isLoading) return null;

    return (
        <motion.section 
            variants={scrollFadeVariant} 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true, amount: 0.1 }}
            className="py-24 relative overflow-hidden rounded-[4rem] bg-card/10 border border-white/5"
        >
            <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full translate-y-20 opacity-30" />
            <div className="text-center mb-16 space-y-4 relative z-10 px-4">
                <h2 className="text-4xl md:text-5xl font-black font-headline tracking-tighter">سجل الخالدين بأثرهم</h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto italic">"أحب الأعمال إلى الله أدومها وإن قل.. فكيف بمن غرس نبتة علم تورق للأبد؟"</p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 max-w-6xl mx-auto relative z-10 px-6">
                <AnimatePresence>
                {supporters?.slice(0, 30).map((supporter, index) => (
                    <motion.div 
                        key={index}
                        initial={{ opacity: 0, scale: 0.5 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.02, type: 'spring', stiffness: 100 }}
                        className="px-6 py-3 rounded-full bg-card/60 backdrop-blur-xl border border-white/5 hover:border-primary/50 hover:bg-primary/10 transition-all cursor-default group shadow-lg"
                    >
                         <div className="flex items-center gap-2">
                            {index < 3 && <Star className="w-3 h-3 text-amber-400 fill-current animate-pulse" />}
                            <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 group-hover:from-primary group-hover:to-primary/70 transition-all">
                                {supporter.donorName}
                            </span>
                         </div>
                    </motion.div>
                ))}
                </AnimatePresence>
            </div>
            {(!supporters || supporters.length === 0) && (
                <p className="text-center text-muted-foreground py-10">كُن أول من يخط اسمه في هذه اللائحة المباركة.</p>
            )}
        </motion.section>
    );
}

/* -------------------------------------------------------------------------- */
/*                               MAIN PAGE                                    */
/* -------------------------------------------------------------------------- */

export default function DonationsPage() {
  const currencies: Currency[] = [
    { code: 'EGP', name: 'جنيه مصري', rate: 1 },
    { code: 'USD', name: 'دولار أمريكي', rate: 1 / 47.5 },
    { code: 'SAR', name: 'ريال سعودي', rate: 3.75 / 47.5 },
    { code: 'EUR', name: 'يورو', rate: 0.92 / 47.5 }
  ];
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(currencies[0]);
  const { data: settings } = useDoc<DonationSettings>('settings/donations');

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  const progress = useMemo(() => {
      if (!settings || !settings.monthlyGoal || settings.monthlyGoal <= 0) return 0;
      return Math.min(((settings.currentAmount || 0) / settings.monthlyGoal) * 100, 100);
  }, [settings]);

  useEffect(() => {
    const localeCurrencyMap: { [key: string]: string } = {
        'ar-EG': 'EGP', 'ar-SA': 'SAR', 'en-GB': 'EUR', 'de-DE': 'EUR', 'fr-FR': 'EUR'
    };
    const userLocale = navigator.language;
    const currencyCode = localeCurrencyMap[userLocale];
    if (currencyCode) {
        const currency = currencies.find(c => c.code === currencyCode);
        if (currency) setSelectedCurrency(currency);
    }
  }, []);

  const donationReasons = [
    {
      icon: Server,
      title: 'تكاليف الاستضافة الخارقة',
      description: 'ضمان بقاء الموقع سريعًا ومتاحًا للملايين على مدار الساعة دون انقطاع.',
      example: 'كل 50$ تغطي تكاليف الخادم وقواعد البيانات ليوم كامل.'
    },
    {
      icon: Film,
      title: 'صناعة المحتوى الإبداعي',
      description: 'تمويل عمليات التسجيل، المونتاج، والإنتاج الفني للمحاضرات والسلاسل.',
      example: 'كل 25$ تساهم في تحرير وإخراج ساعة من المحتوى العلمي.'
    },
    {
      icon: BookOpen,
      title: 'التراث الرقمي والترجمة',
      description: 'أرشفة الدروس، التفريغ النصي الدقيق، والترجمة للعالمية.',
      example: 'كل 10$ توفر تفريغاً نصياً احترافياً لمحاضرة كاملة.'
    },
  ];

  return (
    <>
      <DonationGoalBackgroundController />
      
      {/* 🚀 Apple-style Top Progress Bar */}
      <motion.div className="fixed top-0 left-0 right-0 h-1bg-primary origin-left z-[100] h-1.5 bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" style={{ scaleX }} />

      {/* 🔮 1. Cinematic Hero Section */}
      <section className="relative h-[115vh] md:h-[110vh] -mt-20 overflow-hidden flex items-center justify-center">
         <div className="absolute inset-0 z-0">
            <motion.img 
               initial={{ scale: 1.1 }}
               animate={{ scale: 1 }}
               transition={{ duration: 2 }}
               src="/donation_hero_cinematic_1774731279542.png" 
               className="w-full h-full object-cover filter brightness-[0.4] saturate-[0.8]" 
               alt="cinematic legacy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
         </div>

         <div className="container relative z-10 px-6 text-center space-y-12 max-w-5xl">
            <motion.div 
               initial={{ opacity: 0, y: 50, filter: 'blur(10px)' }}
               animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
               transition={{ duration: 1, ease: 'easeOut' }}
               className="space-y-8"
            >
               <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/15 border border-primary/20 backdrop-blur-md text-primary font-black tracking-widest text-xs uppercase mb-4 animate-pulse">
                  <Star className="w-4 h-4 fill-primary" />
                  صدقة جارية بـأثرٍ باقٍ
               </div>
               <h1 className="text-6xl md:text-9xl font-black font-headline tracking-tighter leading-[0.9] bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40 drop-shadow-2xl">
                  كُن سبباً <br/> في استنارة عقل
               </h1>
               <p className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto leading-relaxed font-medium italic">
                  "وقفة" هو وقفٌ إسلامي رقمي، كل حرفٍ يُبث فيه هو صدقة جارية في ميزانك. بدعمك، تضمن استدامة هذا النور الرباني.
               </p>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 1, duration: 1 }}
                className="flex flex-col md:flex-row items-center justify-center gap-6 pt-10"
            >
                <div className="w-48">
                   <Select value={selectedCurrency.code} onValueChange={(code) => setSelectedCurrency(currencies.find(c => c.code === code) || currencies[0])}>
                       <SelectTrigger className="bg-white/5 border-white/20 backdrop-blur-xl h-14 rounded-2xl text-lg font-bold">
                           <SelectValue placeholder="اختر العملة..." />
                       </SelectTrigger>
                       <SelectContent>
                           {currencies.map(c => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}
                       </SelectContent>
                   </Select>
                </div>
                <Button size="lg" className="h-14 px-12 rounded-2xl text-xl font-black font-headline bg-primary hover:bg-primary/90 shadow-[0_0_30px_rgba(var(--primary-rgb),0.5)] group overflow-hidden relative">
                    <span className="relative z-10">ابدأ في بناء أثرك الآن</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </Button>
            </motion.div>
         </div>

         {/* Cinematic Floating Down Arrow */}
         <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 10, 0] }}
            transition={{ delay: 2, duration: 2, repeat: Infinity }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/30"
         >
            <div className="w-px h-16 bg-gradient-to-b from-transparent via-white/50 to-transparent mx-auto" />
         </motion.div>
      </section>

      <div className="space-y-48 py-32 px-4 md:px-10 max-w-7xl mx-auto">
        
        {/* 🏔️ 2. Modernized One Click & Progress (Scroll Reveal) */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 items-stretch">
            <div className="lg:col-span-3 space-y-16">
                <OneClickDonation currency={selectedCurrency} />
                
                <motion.section 
                    variants={scrollFadeVariant}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    className="relative p-10 md:p-14 rounded-[4rem] bg-card/60 backdrop-blur-3xl border border-border/40 space-y-10 shadow-2xl relative overflow-hidden h-full flex flex-col justify-center"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0" />
                    <div className="space-y-4 text-center">
                        <h3 className="text-4xl font-black font-headline tracking-tighter">استدامة الوقف التقني</h3>
                        <p className="text-muted-foreground font-medium text-lg italic">"وقفة" أمانة في أعناقنا جميعاً.</p>
                    </div>
                    
                    <div className="space-y-6">
                        <div className="flex justify-between text-sm font-black uppercase tracking-widest text-muted-foreground">
                            <span className="text-primary italic animate-pulse">تم الإنجاز: {Math.round(progress)}%</span>
                            <span>{new Intl.NumberFormat('ar-EG').format(Math.round(settings?.currentAmount || 0))} / {new Intl.NumberFormat('ar-EG').format(settings?.monthlyGoal || 0)} ج.م</span>
                        </div>
                        <div className="relative h-5 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-1 shadow-inner">
                            <motion.div 
                                initial={{ width: 0 }}
                                whileInView={{ width: `${progress}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
                                className="h-full bg-primary rounded-full relative group shadow-[0_0_20px_rgba(var(--primary-rgb),0.6)]"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-shimmer" />
                            </motion.div>
                        </div>
                    </div>

                    <div className="flex gap-6 items-center justify-center p-6 rounded-[2rem] bg-primary/5 border border-primary/20">
                        <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                        <p className="text-lg font-black text-foreground text-center line-clamp-2">
                            تبقّى فقط {new Intl.NumberFormat('ar-EG').format((settings?.monthlyGoal || 0) - (settings?.currentAmount || 0))} ج.م لضمان التشغيل الكامل هذا الشهر.
                        </p>
                    </div>
                </motion.section>
            </div>
            
            <div className="lg:col-span-2">
                <ImpactCalculator currency={selectedCurrency} />
            </div>
        </div>

        {/* 🏆 3. Levels of Benevolence (Staggered Scroll) */}
        <motion.section 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="space-y-24"
        >
          <div className="text-center space-y-6">
            <h2 className="text-5xl md:text-7xl font-black font-headline tracking-tighter text-white">درجات الإحسان</h2>
            <p className="text-muted-foreground text-xl max-w-3xl mx-auto font-medium leading-relaxed">
                بمشاركتك تتدرج في مراتب الداعمين، ليس فخراً بالرقم، وإنما تسابقاً في عمل الخير وتأكيداً على الالتزام ببناء مجتمعٍ متعلم.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {[
                { name: 'داعم برونزي', icon: Star, color: 'text-orange-400', border: 'border-orange-500/20', amount: 500 },
                { name: 'داعم فضي', icon: Star, color: 'text-slate-300', border: 'border-slate-500/20', amount: 2500, fill: true },
                { name: 'داعم ذهبي', icon: Shield, color: 'text-amber-400', border: 'border-amber-500/20', amount: 5000, fill: true },
                { name: 'داعم بلاتيني', icon: Gem, color: 'text-cyan-400', border: 'border-cyan-500/20', amount: 10000 },
                { name: 'داعم ماسي', icon: Crown, color: 'text-violet-400', border: 'border-violet-500/20', amount: 25000 },
                { name: 'محسن معطاء', icon: HandHeart, color: 'text-rose-400', border: 'border-rose-500/30', amount: 50000, fill: true, highlight: true }
              ].map((tier, idx) => (
                <motion.div 
                    key={idx}
                    variants={scrollFadeVariant}
                    whileHover={{ scale: 1.05, y: -10 }}
                    className={cn(
                        "p-12 rounded-[3rem] border-2 bg-card/40 backdrop-blur-xl transition-all relative overflow-hidden group mb-4",
                        tier.border,
                        tier.highlight && "ring-4 ring-rose-500/20 shadow-[0_20px_50px_rgba(244,63,94,0.2)]"
                    )}
                >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br from-white to-transparent" />
                    <tier.icon className={cn("w-16 h-16 mb-8 block mx-auto drop-shadow-2xl", tier.color, tier.fill && "fill-current animate-pulse")} />
                    <h3 className={cn("text-3xl font-black font-headline text-center mb-3", tier.color)}>{tier.name}</h3>
                    <p className="text-center text-muted-foreground font-black tracking-tight text-lg">عند تجاوز {new Intl.NumberFormat('ar-EG').format(tier.amount)} ج.م</p>
                </motion.div>
              ))}
          </div>
        </motion.section>

        {/* 💎 4. Detailed Breakdown (Parallax-ish Scroll) */}
        <motion.section 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-24 py-16"
        >
          <div className="text-center space-y-4">
            <h2 className="text-5xl font-black font-headline tracking-tighter text-white">أين تذهب بذرتك؟</h2>
            <p className="text-muted-foreground text-lg italic font-bold">كل قرشٍ يوضع في مكانه الصحيح لخدمة العلم الشريف.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {donationReasons.map((reason, index) => {
              const Icon = reason.icon;
              return (
                <motion.div 
                    key={index}
                    variants={scrollFadeVariant}
                    className="text-center space-y-8 group"
                >
                  <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-[2.5rem] bg-primary/10 group-hover:bg-primary/20 transition-all duration-700 border border-primary/20 shadow-2xl group-hover:scale-110 group-hover:rotate-12 group-hover:shadow-primary/30">
                    <Icon className="h-12 w-12 text-primary" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-3xl font-black font-headline text-white">{reason.title}</h3>
                    <p className="text-muted-foreground text-lg leading-relaxed font-medium">{reason.description}</p>
                    <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="inline-block px-6 py-2 rounded-full bg-primary/5 border border-primary/20 text-primary text-md font-black shadow-inner"
                    >
                        {reason.example}
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* 💳 5. Payment Gateways (Sliding Reveal) */}
        <motion.section 
            variants={scrollFadeVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="py-32 p-10 md:p-20 rounded-[5rem] bg-card/30 border border-border/40 relative overflow-hidden ring-1 ring-white/5 shadow-2xl"
        >
             <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[200px] pointer-events-none" />
             <div className="text-center mb-20 space-y-6 relative z-10">
                <h2 className="text-5xl md:text-7xl font-black font-headline tracking-tighter text-white">قنوات البذل</h2>
                <p className="text-muted-foreground font-black text-xl">اختر الوسيلة التي تناسبك لغرس أثرك اليوم في أرض العلم.</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 relative z-10">
                {[
                    { name: 'باتريون', icon: Heart, desc: 'للدعم الشهري المستدام وتطوير الميزات.', variant: 'secondary' },
                    { name: 'باي بال', icon: Zap, desc: 'للمساهمات السريعة والعالمية.' },
                    { name: 'بطاقة ائتمانية', icon: CreditCard, desc: 'دفع آمن ومباشر عبر نظام Stripe العالمي.' },
                    { name: 'تحويل بنكي', icon: Landmark, desc: 'للمساهمات الكبيرة والأوقاف المباشرة لمنصة وقفة.', variant: 'secondary' }
                ].map((gate, idx) => (
                    <motion.div 
                        key={idx} 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.15 }}
                        className="flex flex-col"
                    >
                        <Card className="bg-white/5 border-white/10 hover:border-primary/40 transition-all p-10 rounded-[3.5rem] flex flex-col justify-between group h-full hover:shadow-2xl hover:shadow-primary/20 hover:bg-white/10">
                            <div className="space-y-8">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 group-hover:bg-primary/20 border border-white/10 flex items-center justify-center text-primary group-hover:scale-110 transition-all group-hover:rotate-12 shadow-inner">
                                    <gate.icon className="w-8 h-8" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black font-headline mb-2 text-white">{gate.name}</h3>
                                    <p className="text-md text-muted-foreground leading-relaxed font-bold">{gate.desc}</p>
                                </div>
                            </div>
                            <Button className="mt-12 rounded-[1.5rem] h-14 text-lg font-black transition-all group-hover:scale-[1.05] shadow-lg" variant={gate.variant as any || 'default'}>رابط الدعم</Button>
                        </Card>
                    </motion.div>
                ))}
             </div>
        </motion.section>

        {/* 🤝 6. Community Support & Developer's Message (Deep Reveal) */}
        <section className="space-y-16">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* 🏰 The Developer's Message (Apple-style Slide & Blur) */}
                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    variants={{
                        hidden: { opacity: 0, x: -100, filter: 'blur(20px)' },
                        visible: { opacity: 1, x: 0, filter: 'blur(0px)' }
                    }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    className="lg:col-span-2 p-12 md:p-16 rounded-[4rem] bg-gradient-to-br from-primary/30 via-primary/5 to-transparent border border-primary/30 space-y-10 relative overflow-hidden flex flex-col justify-center shadow-2xl ring-1 ring-white/10"
                >
                    <Quote className="absolute top-12 right-12 w-48 h-48 text-primary/10 -rotate-12 pointer-events-none" />
                    
                    <div className="space-y-6 relative z-10">
                        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-black uppercase tracking-widest shadow-lg">
                            <Sparkles className="w-4 h-4 animate-pulse" />
                            كلمة من خلف الكواليس
                        </div>
                        <h2 className="text-5xl md:text-6xl font-black font-headline tracking-tighter text-white leading-tight">حكاية وقفة..<br/> ورسالة مطورها</h2>
                    </div>

                    <div className="space-y-8 relative z-10">
                        <p className="text-2xl md:text-3xl text-foreground font-black leading-tight italic border-r-8 border-primary pr-8 drop-shadow-sm">
                            "إخوتي وأخواتي في الله، أنا مطور هذا الموقع. أريدكم أن تعلموا أن مشروع 'وقفة' هو جهدٌ فردي تماماً، بدأ بفضل الله ثم برغبة في تطويع التقنية لخدمة دينه."
                        </p>
                        <p className="text-xl text-muted-foreground font-black leading-relaxed">
                            أود التأكيد بأنني <span className="text-primary underline underline-offset-8 decoration-primary/50 text-2xl">أعمل على هذا المشروع بشكل تطوعي خالص ولا أتقاضى عنه أي أجر مادي أو راتب</span>؛ فكل تبرعاتكم تُوجّه بالكامل لتغطية تكاليف التشغيل وتطوير المنصة. جزاكم الله خيراً على السند.
                        </p>
                    </div>

                    <div className="flex items-center gap-8 pt-8 relative z-10 border-t border-white/10">
                        <div className="relative">
                            <Avatar className="h-24 w-24 border-3 border-primary/40 shadow-2xl ring-8 ring-primary/5">
                                <AvatarImage src="/dev-avatar.png" alt="Developer" />
                                <AvatarFallback className="bg-primary/20 text-primary font-black text-3xl">A</AvatarFallback>
                            </Avatar>
                            <motion.div 
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="absolute -bottom-2 -right-2 bg-primary text-white p-2.5 rounded-full shadow-2xl border-4 border-background"
                            >
                                <Heart className="w-5 h-5 fill-current" />
                            </motion.div>
                        </div>
                        <div className="space-y-1">
                            <p className="font-black text-3xl font-headline tracking-tight text-white">مطور منصة وقفة</p>
                            <p className="text-lg text-primary font-black uppercase tracking-widest opacity-80 italic">خادم لطلبة العلم.</p>
                        </div>
                    </div>
                </motion.div>
                
                <div className="flex flex-col gap-8">
                    {[
                        { title: 'شارك النور', icon: Share2, desc: 'تذكر أن الدال على الخير كفاعله، نشرك للمنصة هو صدقة جارية عظيمة.' },
                        { title: 'التطوع التقني', icon: MessageCircle, desc: 'هل تملك مهارات برمجية أو لغوية؟ ساعدنا في النمو المستمر.', link: '/contact' },
                        { title: 'الدعاء الصادق', icon: Gift, desc: 'دعواتكم بظهر الغيب هي المحرك الحقيقي لنا في هذه الرحلة.' }
                    ].map((item, i) => (
                        <motion.div 
                            key={i}
                            initial="hidden"
                            whileInView="visible"
                            variants={{
                                hidden: { opacity: 0, x: 50 },
                                visible: { opacity: 1, x: 0 }
                            }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2, duration: 0.8 }}
                            className="p-10 rounded-[3rem] bg-card/60 border border-border/40 hover:border-primary/50 transition-all flex flex-col justify-between group shadow-xl hover:bg-white/5"
                        >
                            <div className="space-y-6">
                                <item.icon className="w-12 h-12 text-muted-foreground transition-all group-hover:scale-125 group-hover:text-primary mb-2 group-hover:rotate-12" />
                                <h3 className="text-2xl font-black font-headline text-white">{item.title}</h3>
                                <p className="text-md text-muted-foreground font-black leading-relaxed">{item.desc}</p>
                            </div>
                            {item.link && (
                                <Button asChild variant="link" className="p-0 h-auto justify-end text-primary font-black mt-8 text-xl hover:no-underline group">
                                    <Link href={item.link} className="flex items-center gap-3">تواصل معنا <span className="group-hover:translate-x-[-12px] transition-transform">←</span></Link>
                                </Button>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>

        <WallOfSupporters />
      </div>

      {/* 🌠 Bottom Atmospheric Aura */}
      <div className="fixed bottom-0 left-0 right-0 h-[60vh] bg-gradient-to-t from-primary/20 via-primary/5 to-transparent pointer-events-none z-[-1]" />
    </>
  );
}
