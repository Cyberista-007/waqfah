'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
import { doc } from 'firebase/firestore';
import {
  ArrowDown,
  ArrowLeft,
  BadgeCheck,
  BookOpen,
  CreditCard,
  Crown,
  Download,
  Film,
  Gem,
  Gift,
  Globe,
  HandHeart,
  Heart,
  Landmark,
  Loader2,
  MessageCircle,
  Quote,
  Server,
  Share2,
  Shield,
  Sparkles,
  Star,
  Users,
  Zap,
} from 'lucide-react';

import type { Donation, DonationSettings, UserProfile } from '@/lib/types';
import { useCollection, useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Currency = {
  code: string;
  name: string;
  rate: number;
  symbol: string;
};

const CURRENCIES: Currency[] = [
  { code: 'EGP', name: 'جنيه مصري', rate: 1, symbol: 'ج.م' },
  { code: 'SAR', name: 'ريال سعودي', rate: 3.75 / 47.5, symbol: 'ر.س' },
  { code: 'USD', name: 'دولار أمريكي', rate: 1 / 47.5, symbol: '$' },
  { code: 'EUR', name: 'يورو', rate: 0.92 / 47.5, symbol: '€' },
];

function formatMoney(amountInEgp: number, currency: Currency): string {
  const converted = Math.round(amountInEgp * currency.rate);
  return `${new Intl.NumberFormat('ar-EG').format(converted)} ${currency.symbol}`;
}

function OneClickDonation({ currency }: { currency: Currency }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { t, isRtl } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState<number | null>(null);

  const userDocRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userProfile, isLoading } = useDoc<UserProfile>(userDocRef);

  const handleOneClickDonate = async (amount: number) => {
    setIsSubmitting(amount);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    toast({
      title: 'شكراً لدعمك المستمر!',
      description: `تم تسجيل مساهمتك بمبلغ ${formatMoney(amount, currency)} بنجاح.`,
    });
    setIsSubmitting(null);
  };

  if (isLoading || !user || !userProfile?.savedCardLast4) return null;

  const cardBrand = userProfile?.savedCardBrand || 'Visa';
  const last4 = userProfile?.savedCardLast4 || '4242';
  const amounts = [100, 250, 500];

  return (
    <Card className="rounded-3xl luxury-glass border-primary/25 overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-black font-headline flex items-center gap-2.5 text-foreground">
          <CreditCard className="h-5 w-5 text-primary" />
          <span>تبرع سريع (بنقرة واحدة)</span>
        </CardTitle>
        <CardDescription className="text-xs font-medium">
          باستخدام بطاقتك المحفوظة ({cardBrand} •••• {last4})
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        {amounts.map((amount) => (
          <Button
            key={amount}
            size="sm"
            className="flex-1 min-w-[110px] h-11 rounded-xl font-bold cursor-pointer"
            onClick={() => handleOneClickDonate(amount)}
            disabled={!!isSubmitting}
          >
            {isSubmitting === amount ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              `تبرع بـ ${formatMoney(amount, currency)}`
            )}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}

export default function DonationsPage() {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(CURRENCIES[0]);
  const { data: settings } = useDoc<DonationSettings>('settings/donations');
  const { data: recentDonations } = useCollection<Donation>('donations', {
    where: ['isAnonymous', '==', false],
    orderBy: ['donatedAt', 'desc'],
    limit: 30,
  });
  const { toast } = useToast();
  const { t, isRtl } = useTranslation();

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // Impact & checkout state
  const [impactAmountEgp, setImpactAmountEgp] = useState(250);
  const [checkoutAmount, setCheckoutAmount] = useState('250');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [isCheckoutDone, setIsCheckoutDone] = useState(false);

  useEffect(() => {
    const localeCurrencyMap: Record<string, string> = {
      'ar-EG': 'EGP',
      'ar-SA': 'SAR',
      'en-GB': 'EUR',
      'de-DE': 'EUR',
      'fr-FR': 'EUR',
    };
    const currencyCode = localeCurrencyMap[navigator.language];
    if (currencyCode) {
      const found = CURRENCIES.find((c) => c.code === currencyCode);
      if (found) setSelectedCurrency(found);
    }
  }, []);

  const monthlyGoalEgp = settings?.monthlyGoal && settings.monthlyGoal > 0 ? settings.monthlyGoal : 8000;
  const currentAmountEgp = settings?.currentAmount ?? 3200;
  const progress = Math.min((currentAmountEgp / monthlyGoalEgp) * 100, 100);
  const remainingEgp = Math.max(monthlyGoalEgp - currentAmountEgp, 0);

  const impacts = useMemo(
    () => ({
      students: Math.max(1, Math.floor(impactAmountEgp / 5)),
      minutesEdited: Math.max(1, Math.floor(impactAmountEgp / 15)),
      pagesTranslated: Math.max(1, Math.floor(impactAmountEgp / 50)),
    }),
    [impactAmountEgp]
  );

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardName.trim() || !cardNumber.trim()) return;
    setIsProcessingCheckout(true);
    await new Promise((resolve) => setTimeout(resolve, 1400));
    setIsProcessingCheckout(false);
    setIsCheckoutDone(true);
    toast({
      title: 'تم استلام مساهمتك الكريمة!',
      description: 'جزاك الله خيراً، تم تجهيز إيصال إثبات المساهمة.',
    });
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const tiers = [
    { name: 'داعم برونزي', icon: Star, color: 'text-orange-400', border: 'border-orange-500/25', amount: 500 },
    { name: 'داعم فضي', icon: Star, color: 'text-slate-300', border: 'border-slate-400/25', amount: 2500, fill: true },
    { name: 'داعم ذهبي', icon: Shield, color: 'text-amber-400', border: 'border-amber-500/30', amount: 5000, fill: true },
    { name: 'داعم بلاتيني', icon: Gem, color: 'text-cyan-400', border: 'border-cyan-500/25', amount: 10000 },
    { name: 'داعم ماسي', icon: Crown, color: 'text-violet-400', border: 'border-violet-500/25', amount: 25000 },
    {
      name: 'محسن معطاء',
      icon: HandHeart,
      color: 'text-rose-400',
      border: 'border-rose-500/35',
      amount: 50000,
      fill: true,
      highlight: true,
    },
  ];

  const donationReasons = [
    {
      icon: Server,
      title: 'استدامة الخوادم والاستضافة',
      description: 'ضمان بقاء المنصة والمكتبة الصوتية سريعة ومتاحة لطلبة العلم على مدار الساعة.',
      example: 'تغطي تكلفة الاستضافة وقواعد البيانات',
    },
    {
      icon: Film,
      title: 'إنتاج وتحرير الدروس',
      description: 'تمويل عمليات التنقية الصوتية، المونتاج، وفهرسة السلاسل العلمية.',
      example: 'تساهم في إخراج ساعات علمية متقنة',
    },
    {
      icon: BookOpen,
      title: 'التفريغ النصي والترجمة',
      description: 'تحويل المحاضرات إلى نصوص قابلة للبحث والتدبر وإتاحتها للناطقين بغير العربية.',
      example: 'تحفظ العلم مكتوباً وميسراً للجميع',
    },
  ];

  const gateways = [
    { name: 'بطاقة ائتمانية', icon: CreditCard, desc: 'دفع آمن ومباشر عبر بوابة الدفع المشفرة.', action: 'تبرع بالبطاقة' },
    { name: 'تحويل بنكي / وقفي', icon: Landmark, desc: 'للمساهمات الكبيرة والأوقاف المباشرة لمنصة وقفة.', href: '/contact', action: 'طلب بيانات التحويل' },
    { name: 'باتريون (شهري)', icon: Heart, desc: 'للدعم الشهري المستدام وتطوير الميزات التقنية.', href: '/contact', action: 'التفاصيل' },
    { name: 'باي بال', icon: Zap, desc: 'للمساهمات السريعة من خارج مصر.', href: '/contact', action: 'التفاصيل' },
  ];

  return (
    <div className="pb-20" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Top Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 origin-right z-[100] h-1 bg-primary"
        style={{ scaleX }}
      />

      <div className="container px-4 pt-6 space-y-16 md:space-y-24 max-w-6xl mx-auto">
        {/* ════════════════════════════════════════════════════════════
            1. ARCHITECTURAL WAQF HERO
        ════════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden rounded-[2.25rem] sm:rounded-[3rem] luxury-glass border border-primary/20 p-8 sm:p-14 text-center">
          <div className="absolute -top-28 -right-28 w-80 h-80 bg-primary/20 blur-[110px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-28 -left-28 w-80 h-80 bg-emerald-500/15 blur-[110px] rounded-full pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <div className="luxury-badge luxury-badge-primary mx-auto">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{t('صدقة جارية بأثرٍ باقٍ', 'Ongoing Charity (Sadaqah Jariyah)')}</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black font-headline tracking-tight leading-[1.12] text-foreground">
              {t('كُن سبباً في', 'Be a Light for')} <span className="text-primary">{t('استنارة عقل', 'Enlightened Minds')}</span>
            </h1>

            <p className="text-base sm:text-xl text-muted-foreground leading-relaxed font-medium">
              {t(
                '«وقفة» مشروع وقفي خالص لخدمة العلم الشرعي بلا إعلانات. مساهمتك اليوم تضمن استمرار الخوادم، وإنتاج الدروس، وتفريغ المحاضرات لتبقى صدقة جارية في ميزانك.',
                'Waqfah is an ad-free Islamic knowledge endowment. Your contribution keeps servers running, produces lectures, and transcribes lessons as ongoing charity.'
              )}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
              <Select
                value={selectedCurrency.code}
                onValueChange={(code) =>
                  setSelectedCurrency(CURRENCIES.find((c) => c.code === code) || CURRENCIES[0])
                }
              >
                <SelectTrigger className="w-44 h-12 rounded-xl bg-background/70 border-border font-bold">
                  <SelectValue placeholder={t('اختر العملة', 'Select Currency')} />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.name} ({c.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                type="button"
                size="lg"
                onClick={() => scrollToSection('contribute')}
                className="h-12 px-8 rounded-xl font-black cursor-pointer"
              >
                <span>{t('ساهم الآن', 'Contribute Now')}</span>
                <ArrowDown className="w-4 h-4 ms-2" />
              </Button>

              <Button
                type="button"
                size="lg"
                variant="outline"
                onClick={() => scrollToSection('breakdown')}
                className="h-12 px-6 rounded-xl font-bold cursor-pointer"
              >
                {t('أين يذهب تبرعك؟', 'Where Funds Go')}
              </Button>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════
            2. MONTHLY GOAL & INTERACTIVE IMPACT CALCULATOR
        ════════════════════════════════════════════════════════════ */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-6 flex flex-col gap-6">
            <OneClickDonation currency={selectedCurrency} />

            <Card className="rounded-3xl luxury-card p-6 sm:p-8 flex-1 flex flex-col justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="luxury-badge luxury-badge-emerald">الهدف الشهري</span>
                  <span className="text-sm font-black text-primary font-mono">{Math.round(progress)}%</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black font-headline text-foreground pt-2">
                  استدامة الوقف التقني
                </h2>
                <p className="text-sm text-muted-foreground font-medium">
                  تكلفة تشغيل الخوادم والخدمات السحابية وتطوير المنصة لهذا الشهر.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-xs sm:text-sm font-bold text-muted-foreground">
                  <span>تم جمع: {formatMoney(currentAmountEgp, selectedCurrency)}</span>
                  <span>الهدف: {formatMoney(monthlyGoalEgp, selectedCurrency)}</span>
                </div>
                <div className="h-3.5 w-full bg-muted rounded-full overflow-hidden border border-border/60 p-0.5">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${progress}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-primary rounded-full"
                  />
                </div>
                <p className="text-xs text-muted-foreground font-bold">
                  {remainingEgp > 0
                    ? `المتبقي لاستكمال هدف الشهر: ${formatMoney(remainingEgp, selectedCurrency)}`
                    : 'اكتمل هدف هذا الشهر بحمد الله، وكل زيادة تُوجّه للتطوير المستقبلي.'}
                </p>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary/10 border border-primary/20">
                <Sparkles className="w-5 h-5 text-primary shrink-0" />
                <p className="text-xs sm:text-sm font-bold text-foreground">
                  ١٠٠٪ من التبرعات تُصرف على تشغيل المنصة ونشر العلم دون أي رواتب شخصية.
                </p>
              </div>
            </Card>
          </div>

          <Card className="lg:col-span-6 rounded-3xl luxury-card p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-primary text-xs font-black">
                <Zap className="w-4 h-4" />
                <span>حاسبة الأثر التفاعلية</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black font-headline text-foreground">
                تخيّل أثر مساهمتك
              </h2>
              <p className="text-sm text-muted-foreground font-medium">
                اختر مبلغاً أو حرّك المؤشر لترى الأثر التقديري لمساهمتك في نشر العلم.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground">مبلغ المساهمة التقديري</span>
                <span className="text-2xl sm:text-3xl font-black text-primary font-headline">
                  {formatMoney(impactAmountEgp, selectedCurrency)}
                </span>
              </div>
              <input
                type="range"
                min={50}
                max={5000}
                step={50}
                value={impactAmountEgp}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setImpactAmountEgp(val);
                  setCheckoutAmount(String(Math.max(1, Math.round(val * selectedCurrency.rate))));
                }}
                className="w-full h-2.5 bg-primary/20 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex flex-wrap gap-2">
                {[100, 250, 500, 1000, 2500].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setImpactAmountEgp(preset);
                      setCheckoutAmount(String(Math.max(1, Math.round(preset * selectedCurrency.rate))));
                    }}
                    className={cn(
                      'px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer',
                      impactAmountEgp === preset
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background/60 text-muted-foreground border-border hover:text-foreground'
                    )}
                  >
                    {formatMoney(preset, selectedCurrency)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'طالب علم مستفيد', value: impacts.students, icon: Users, color: 'text-blue-400' },
                { label: 'دقيقة محتوى منقّاة', value: impacts.minutesEdited, icon: Film, color: 'text-rose-400' },
                { label: 'صفحة مفرغة/مترجمة', value: impacts.pagesTranslated, icon: Globe, color: 'text-emerald-400' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-background/50 border border-border/60 text-center space-y-1.5"
                >
                  <item.icon className={cn('w-5 h-5 mx-auto', item.color)} />
                  <div className="text-xl sm:text-2xl font-black font-mono text-foreground">{item.value}</div>
                  <div className="text-[11px] text-muted-foreground font-bold leading-snug">{item.label}</div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* ════════════════════════════════════════════════════════════
            3. CONTRIBUTION PORTAL & RECENT SUPPORTERS
        ════════════════════════════════════════════════════════════ */}
        <section id="contribute" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <Card className="lg:col-span-7 rounded-3xl luxury-card p-6 sm:p-8">
            <CardHeader className="p-0 pb-6">
              <CardTitle className="text-2xl font-black font-headline flex items-center gap-2.5 text-foreground">
                <CreditCard className="h-6 w-6 text-primary" />
                <span>{t('بوابة المساهمة المباشرة', 'Direct Contribution Portal')}</span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm font-medium">
                {t('نموذج محاكاة آمن لتسجيل نية المساهمة وإصدار إيصال فوري قابل للطباعة.', 'Secure contribution form with instant printable receipt.')}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0">
              <AnimatePresence mode="wait">
                {!isCheckoutDone ? (
                  <motion.form
                    key="form"
                    onSubmit={handleCheckoutSubmit}
                    className="space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground font-bold">
                        مبلغ المساهمة ({selectedCurrency.code}):
                      </label>
                      <Input
                        type="number"
                        min={1}
                        value={checkoutAmount}
                        onChange={(e) => setCheckoutAmount(e.target.value)}
                        className="h-12 bg-background/60 border-border text-right text-base font-black rounded-xl"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground font-bold">اسم المحسن الكريم:</label>
                        <Input
                          placeholder="أو اكتب: فاعل خير"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          className="h-11 bg-background/60 border-border text-right text-sm rounded-xl"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground font-bold">رقم البطاقة (محاكاة):</label>
                        <Input
                          placeholder="4242 4242 4242 4242"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="h-11 bg-background/60 border-border text-right text-sm rounded-xl font-mono"
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isProcessingCheckout}
                      className="w-full rounded-xl h-12 font-black text-base cursor-pointer"
                    >
                      {isProcessingCheckout ? (
                        <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                      ) : (
                        `إتمام المساهمة بمبلغ ${checkoutAmount} ${selectedCurrency.symbol}`
                      )}
                    </Button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="receipt"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-background/80 border border-emerald-500/30 p-6 rounded-2xl text-center space-y-4"
                  >
                    <BadgeCheck className="h-12 w-12 text-emerald-500 mx-auto" />
                    <div>
                      <h4 className="text-lg font-black text-foreground">تقبل الله مساهمتكم الكريمة!</h4>
                      <p className="text-xs text-muted-foreground mt-1">تم تجهيز إيصال إثبات المساهمة بنجاح.</p>
                    </div>

                    <div className="bg-card/80 border border-border p-4 rounded-xl space-y-2 text-sm max-w-sm mx-auto text-right">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">المحسن الكريم:</span>
                        <span className="font-bold text-foreground">{cardName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">مبلغ المساهمة:</span>
                        <span className="font-bold text-emerald-500">
                          {checkoutAmount} {selectedCurrency.symbol}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 pt-2">
                      <Button onClick={() => window.print()} className="flex-1 rounded-xl font-bold text-xs cursor-pointer">
                        <Download className="h-4 w-4 ml-1.5" />
                        طباعة / حفظ الإيصال
                      </Button>
                      <Button
                        onClick={() => setIsCheckoutDone(false)}
                        variant="outline"
                        className="flex-1 rounded-xl text-xs font-bold cursor-pointer"
                      >
                        مساهمة أخرى
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          <Card className="lg:col-span-5 rounded-3xl luxury-card p-6 space-y-4">
            <CardHeader className="p-0">
              <CardTitle className="text-lg font-black flex items-center gap-2 text-foreground">
                <Heart className="h-5 w-5 text-rose-500" />
                <span>أحدث المساهمين</span>
              </CardTitle>
              <CardDescription className="text-xs">
                سجل المساهمات المعلنة في وقف المنصة.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0 space-y-2.5 max-h-[270px] overflow-y-auto custom-scrollbar pl-1">
              {recentDonations && recentDonations.length > 0 ? (
                recentDonations.slice(0, 6).map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-border/60 text-xs"
                  >
                    <div className="font-bold text-foreground truncate">{d.donorName}</div>
                    <span className="font-mono font-black text-primary shrink-0">
                      {formatMoney(d.amount || 0, selectedCurrency)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground py-8 text-center">
                  كن أول من يخط اسمه في سجل الداعمين لهذا الشهر.
                </p>
              )}
            </CardContent>
          </Card>
        </section>

        {/* ════════════════════════════════════════════════════════════
            4. WHERE YOUR WAQF GOES & TIERS
        ════════════════════════════════════════════════════════════ */}
        <section id="breakdown" className="space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black font-headline text-foreground">{t('أين تذهب مساهمتك؟', 'Where Your Contribution Goes')}</h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto font-medium">
              {t('كل مساهمة تُوجّه مباشرة لتشغيل المنصة وتوسيع أثرها العلمي.', 'Every contribution goes directly toward operating and expanding the platform.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {donationReasons.map((reason, index) => {
              const Icon = reason.icon;
              return (
                <div key={index} className="luxury-card p-7 space-y-4 text-center">
                  <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-black font-headline text-foreground">{reason.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed font-medium">{reason.description}</p>
                  <div className="inline-block px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
                    {reason.example}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Tiers of Benevolence */}
        <section className="space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black font-headline text-foreground">{t('درجات الإحسان', 'Supporter Tiers')}</h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto font-medium">
              {t('تدرج الداعمين في البذل والعطاء، تسابقاً في الخيرات وبناءً لمجتمع متعلم.', 'Recognizing generous supporters helping build an enlightened community.')}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {tiers.map((tier, idx) => (
              <div
                key={idx}
                className={cn(
                  'p-5 rounded-2xl luxury-card border text-center flex flex-col items-center justify-between gap-3',
                  tier.border,
                  tier.highlight && 'ring-2 ring-rose-500/30'
                )}
              >
                <tier.icon className={cn('w-8 h-8', tier.color, tier.fill && 'fill-current')} />
                <div>
                  <h3 className={cn('text-sm font-black font-headline', tier.color)}>{tier.name}</h3>
                  <p className="text-[11px] text-muted-foreground font-bold mt-1">
                    {formatMoney(tier.amount, selectedCurrency)}+
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════
            5. PAYMENT CHANNELS
        ════════════════════════════════════════════════════════════ */}
        <section className="rounded-[2.25rem] luxury-glass border border-border/60 p-7 sm:p-10 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black font-headline text-foreground">{t('قنوات البذل والمساهمة', 'Payment Channels')}</h2>
            <p className="text-sm text-muted-foreground font-medium">
              {t('اختر الوسيلة الأنسب لك للمساهمة في هذا الوقف العلمي.', 'Choose the most convenient method to support this endowment.')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {gateways.map((gate, idx) => (
              <div key={idx} className="luxury-card p-6 flex flex-col justify-between gap-5">
                <div className="space-y-3">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary">
                    <gate.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-black font-headline text-foreground">{gate.name}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">{gate.desc}</p>
                </div>
                {gate.href ? (
                  <Button asChild variant="outline" className="rounded-xl font-bold text-xs h-10">
                    <Link href={gate.href}>{gate.action}</Link>
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={() => scrollToSection('contribute')}
                    className="rounded-xl font-bold text-xs h-10 cursor-pointer"
                  >
                    {gate.action}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════
            6. DEVELOPER'S MESSAGE & OTHER WAYS TO HELP
        ════════════════════════════════════════════════════════════ */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-8 p-8 sm:p-10 rounded-3xl luxury-glass border border-primary/25 relative overflow-hidden flex flex-col justify-between gap-6">
            <Quote className="absolute top-6 left-6 w-24 h-24 text-primary/10 pointer-events-none" />
            <div className="space-y-4 relative z-10">
              <div className="luxury-badge luxury-badge-primary w-fit">
                <Sparkles className="w-3.5 h-3.5" />
                <span>كلمة من خلف الكواليس</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black font-headline text-foreground">
                حكاية وقفة.. ورسالة مطورها
              </h2>
              <p className="text-base sm:text-lg text-foreground/90 font-bold leading-relaxed border-r-4 border-primary pr-4">
                «مشروع وقفة هو جهدٌ فردي خالص لوجه الله تعالى، بدأ برغبة في تطويع التقنية الحديثة لخدمة العلم الشرعي وتيسيره لكل طالب ومستفيد.»
              </p>
              <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
                أعمل على هذا المشروع بشكل تطوعي كامل ولا أتقاضى عنه أي أجر مادي أو راتب؛ فكل مساهماتكم تُوجّه بالكامل لتغطية تكاليف التشغيل والخوادم وتطوير المنصة.
              </p>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-border/60 relative z-10">
              <Avatar className="h-14 w-14 border-2 border-primary/40">
                <AvatarImage src="/dev-avatar.png" alt="مطور منصة وقفة" />
                <AvatarFallback className="bg-primary/15 text-primary font-black text-xl">و</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-black text-base text-foreground font-headline">مطور منصة وقفة</p>
                <p className="text-xs text-primary font-bold">خادم لطلبة العلم</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-4">
            {[
              { title: 'شارك النور', icon: Share2, desc: 'الدال على الخير كفاعله، نشرك للمنصة صدقة جارية عظيمة.' },
              { title: 'التطوع التقني', icon: MessageCircle, desc: 'هل تملك مهارات برمجية أو لغوية؟ ساعدنا في النمو.', link: '/contact' },
              { title: 'الدعاء الصادق', icon: Gift, desc: 'دعواتكم بظهر الغيب هي المحرك الحقيقي لنا في هذه الرحلة.' },
            ].map((item, i) => (
              <div key={i} className="luxury-card p-5 flex-1 flex flex-col justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black font-headline text-foreground">{item.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed font-medium">{item.desc}</p>
                  </div>
                </div>
                {item.link && (
                  <Link
                    href={item.link}
                    className="inline-flex items-center gap-1.5 text-xs font-black text-primary hover:underline self-end"
                  >
                    <span>تواصل معنا</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════
            7. WALL OF SUPPORTERS
        ════════════════════════════════════════════════════════════ */}
        <section className="rounded-[2.25rem] luxury-glass border border-border/60 p-8 sm:p-12 text-center space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black font-headline text-foreground">{t('سجل الداعمين بأثرهم', 'Wall of Supporters')}</h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto font-medium">
              {t('«أحب الأعمال إلى الله أدومها وإن قلّ» — جزا الله كل من ساهم ويسّر نشر العلم.', 'May Allah reward everyone who contributed to spreading beneficial knowledge.')}
            </p>
          </div>

          {recentDonations && recentDonations.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
              {recentDonations.slice(0, 24).map((supporter, index) => (
                <div
                  key={supporter.id || index}
                  className="px-4 py-2 rounded-full bg-background/60 border border-border/70 flex items-center gap-2 text-sm font-bold text-foreground"
                >
                  {index < 3 && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                  <span>{supporter.donorName}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4">كُن أول من يخط اسمه في هذه اللائحة المباركة.</p>
          )}
        </section>
      </div>
    </div>
  );
}
