'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Server, Film, BookOpen, Gift, Users, Share2, CreditCard, Landmark, Loader2, Star, Shield } from 'lucide-react';
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

type Currency = {
    code: string;
    name: string;
    rate: number;
};

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

    const handleSetParticleSettings = useCallback(setParticleSettings, []);
    const handleSetParticleColor = useCallback(setParticleColor, []);
    const handleSetBackgroundEffect = useCallback(setBackgroundEffect, []);

    useEffect(() => {
        const originalParticleColor = localStorage.getItem("site-particle-color") || '#FFFFFF';
        const originalParticleSettings = localStorage.getItem("site-particle-settings");
        const originalEffect = localStorage.getItem("site-background-effect") as 'none' | 'particles' | null;

        handleSetBackgroundEffect('particles');
        
        if (progress < 25) {
            handleSetParticleColor('#FFFFFF'); // Calm white stars
            handleSetParticleSettings({ count: 50, speed: 0.1, lineDistance: 150 });
        } else if (progress < 50) {
            handleSetParticleColor('#FFFFE0'); // Light yellow
            handleSetParticleSettings({ count: 70, speed: 0.2, lineDistance: 140 });
        } else if (progress < 75) {
            handleSetParticleColor('#FFD700'); // Gold
            handleSetParticleSettings({ count: 100, speed: 0.3, lineDistance: 130 });
        } else if (progress < 100) {
            handleSetParticleColor('#FFAC1C'); // Light Orange, more particles
            handleSetParticleSettings({ count: 150, speed: 0.5, lineDistance: 120 });
        } else { // 100% or more - Celebration!
            handleSetParticleColor('#FFD700'); // Bright Gold
            handleSetParticleSettings({ count: 250, speed: 1, lineDistance: 150 }); // "Shooting stars" effect
        }

        // On component unmount, reset to default.
        return () => {
            handleSetBackgroundEffect(originalEffect || 'none');
            
            if (originalParticleSettings) {
                try {
                  handleSetParticleSettings(JSON.parse(originalParticleSettings));
                } catch (e) { /* ignore */ }
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
        // In a real application, this would call a backend function
        // to process the payment with the saved payment method.
        // For this prototype, we'll just simulate a delay and show a success message.
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        toast({
            title: "شكرًا لدعمك!",
            description: `تم التبرع بمبلغ ${new Intl.NumberFormat('ar-EG').format(amount)} جنيه مصري بنجاح.`,
        });
        
        // In a real app, you'd also update the donation goal progress bar here.
        
        setIsSubmitting(null);
    };

    if (isLoading) {
        return (
            <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-6">
                    <Skeleton className="h-6 w-1/2 mb-4" />
                    <div className="flex justify-around gap-4">
                        <Skeleton className="h-12 w-24 rounded-full" />
                        <Skeleton className="h-12 w-24 rounded-full" />
                        <Skeleton className="h-12 w-24 rounded-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }
    
    // For demonstration, let's assume the user has a saved card.
    // In a real app, this condition would be:
    // const hasSavedCard = userProfile?.stripeCustomerId && userProfile?.savedCardLast4;
    const hasSavedCard = user; // Show for any logged-in user for demo purposes.
    const cardBrand = userProfile?.savedCardBrand || 'Visa'; // Demo data
    const last4 = userProfile?.savedCardLast4 || '4242'; // Demo data

    if (!hasSavedCard) {
        return null;
    }
    
    const amounts = [100, 250, 500];

    return (
        <section>
            <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                    <CardTitle className="text-2xl font-headline flex items-center gap-2">
                        <CreditCard className="h-6 w-6" />
                        تبرع بنقرة واحدة
                    </CardTitle>
                    <CardDescription>
                        شكرًا لكونك داعمًا مستمرًا! استخدم بطاقتك المحفوظة ({cardBrand} تنتهي بـ {last4}) للتبرع بسرعة.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row justify-around gap-4">
                    {amounts.map(amount => {
                        const convertedAmount = amount * currency.rate;
                        const formattedAmount = new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 0 }).format(Math.round(convertedAmount));
                        const currencyName = currency.code === 'EGP' ? 'جنيه' : currency.code;
                        const buttonText = currency.code === 'EGP' ? `تبرع بـ ${formattedAmount} جنيه` : `تبرع بـ ${formattedAmount} ${currencyName}`;
                        return (
                            <Button
                                key={amount}
                                size="lg"
                                className="flex-grow"
                                onClick={() => handleOneClickDonate(amount)}
                                disabled={!!isSubmitting}
                            >
                                {isSubmitting === amount ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    buttonText
                                )}
                            </Button>
                        )
                    })}
                </CardContent>
            </Card>
        </section>
    );
}

function DonationProgress({ currency }: { currency: Currency }) {
    const { data: settings, isLoading } = useDoc<DonationSettings>('settings/donations');
    
    if (isLoading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                </CardContent>
            </Card>
        );
    }
    
    if (!settings || !settings.monthlyGoal || settings.monthlyGoal <= 0) {
        return null; // Don't show if goal is not set
    }

    const { monthlyGoal = 0, currentAmount = 0 } = settings;
    const progress = (monthlyGoal > 0) ? Math.min((currentAmount / monthlyGoal) * 100, 100) : 0;
    
    const convertedCurrent = currentAmount * currency.rate;
    const convertedGoal = monthlyGoal * currency.rate;

    const numberFormat = new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 0 });
    const formattedCurrent = numberFormat.format(Math.round(convertedCurrent));
    const formattedGoal = numberFormat.format(Math.round(convertedGoal));
    const currencyName = currency.code === 'EGP' ? 'جنيه' : currency.code;

    return (
        <section>
            <Card className="text-center bg-primary/5 border-primary/20">
                <CardHeader>
                    <CardTitle className="text-2xl font-headline">ادعم استمراريتنا هذا الشهر</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <Progress value={progress} className="h-4 progress-shimmer" />
                     <div className="flex justify-between text-lg font-bold">
                        <span>{formattedCurrent} {currencyName}</span>
                        <span className="text-muted-foreground">الهدف: {formattedGoal} {currencyName}</span>
                     </div>
                </CardContent>
            </Card>
        </section>
    );
}

function WallOfSupporters() {
    const { data: supporters, isLoading } = useCollection<Donation>('donations', {
        where: ['isAnonymous', '==', false],
        orderBy: ['donatedAt', 'desc'],
        limit: 20
    });

    const extendedSupporters = useMemo(() => {
        const staticSupporters = [
            { id: 'static-supporter-1', donorName: 'عبدالرحمن رضا', isAnonymous: false, donatedAt: new Date() }
        ];

        let combinedSupporters = supporters ? [...supporters] : [];

        // Add static supporters if they are not already in the list from DB
        staticSupporters.forEach(staticSupporter => {
            if (!combinedSupporters.some(s => s.donorName === staticSupporter.donorName)) {
                combinedSupporters.unshift(staticSupporter as any);
            }
        });
        
        if (combinedSupporters.length === 0) return [];

        let items = [...combinedSupporters];
        // Ensure the carousel has enough items to loop smoothly
        while (items.length > 0 && items.length < 12) {
           items = [...items, ...combinedSupporters.slice(0, 12 - items.length)];
        }
        return items;
    }, [supporters]);

    if (isLoading) {
        return (
            <Card className="p-6 h-64 flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-muted-foreground" />
            </Card>
        );
    }
    
    if (extendedSupporters.length === 0) {
        return (
             <Card className="text-center py-10">
                <CardContent>
                    <p className="text-lg text-muted-foreground">كن أول الداعمين! سيظهر اسمك هنا بعد مساهمتك.</p>
                </CardContent>
            </Card>
        )
    }
    
    const panelCount = extendedSupporters.length;
    const radius = Math.round( ( 220 / 2 ) / Math.tan( Math.PI / panelCount ) );
    const angle = 360 / panelCount;


    return (
        <section className="h-[400px] flex flex-col items-center justify-center space-y-8">
            <h2 className="text-3xl font-bold text-center mb-8 font-headline">جدار الداعمين الكرام</h2>
            <div className="w-full h-48 flex items-center justify-center">
                <div className="scene3d">
                    <div 
                        className="carousel3d"
                        style={{
                            '--panel-count': panelCount,
                            '--radius': `${radius}px`,
                        } as React.CSSProperties}
                    >
                        {extendedSupporters.map((supporter, index) => (
                           <div 
                                key={`${supporter.id}-${index}`} 
                                className="carousel3d__cell"
                                style={{
                                    '--i': index,
                                    '--angle': `${angle}deg`
                                } as React.CSSProperties}
                            >
                                <span className="font-semibold text-xl">{supporter.donorName}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-4">نحن ممتنون لكل من ساهم في هذا المشروع. جزاكم الله خيرًا.</p>
        </section>
    );
}

export default function DonationsPage() {
  const currencies: Currency[] = [
    { code: 'EGP', name: 'جنيه مصري', rate: 1 },
    { code: 'USD', name: 'دولار أمريكي', rate: 1 / 47.5 },
    { code: 'SAR', name: 'ريال سعودي', rate: 3.75 / 47.5 },
    { code: 'EUR', name: 'يورو', rate: 0.92 / 47.5 }
  ];
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(currencies.find(c => c.code === 'EGP') || currencies[0]);

  useEffect(() => {
    const localeCurrencyMap: { [key: string]: string } = {
        'ar-EG': 'EGP',
        'ar-SA': 'SAR',
        'en-GB': 'EUR',
        'de-DE': 'EUR',
        'fr-FR': 'EUR'
    };
    const userLocale = navigator.language;
    const currencyCode = localeCurrencyMap[userLocale];
    if (currencyCode) {
        const currency = currencies.find(c => c.code === currencyCode);
        if (currency) {
            setSelectedCurrency(currency);
        }
    } else {
        setSelectedCurrency(currencies.find(c => c.code === 'EGP') || currencies[0]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const donationReasons = [
    {
      icon: Server,
      title: 'تكاليف الاستضافة',
      description: 'ضمان بقاء الموقع سريعًا ومتاحًا للجميع على مدار الساعة.',
      example: 'كل 50$ تساعد في تغطية تكاليف الخادم ليوم كامل.'
    },
    {
      icon: Film,
      title: 'إنتاج محتوى جديد',
      description: 'المساعدة في تسجيل وتحرير ونشر المزيد من المحاضرات والسلاسل العلمية.',
      example: 'كل 25$ تساهم في تفريغ محاضرة صوتية واحدة.'
    },
    {
      icon: BookOpen,
      title: 'التفريغ النصي والترجمة',
      description: 'توفير تفريغات نصية دقيقة وترجمات للمحتوى للوصول إلى جمهور أوسع.',
      example: 'كل 10$ تساعد في ترجمة صفحة من محتوى علمي.'
    },
  ];

  const otherWaysToSupport = [
      {
          icon: Share2,
          title: 'شارك المحتوى',
          description: 'أفضل دعم تقدمه هو نشر العلم. شارك المحاضرات التي تعجبك مع الآخرين.'
      },
      {
          icon: Users,
          title: 'تطوع معنا',
          description: 'إذا كانت لديك مهارات في البرمجة، التصميم، أو التفريغ الصوتي، فتواصل معنا.',
          action: <Button asChild variant="link"><Link href="/contact">تواصل معنا</Link></Button>
      },
      {
          icon: Gift,
          title: 'ادعُ لنا',
          description: 'دعاؤكم لنا بظهر الغيب من أعظم أشكال الدعم التي نتوق إليها.'
      }
  ]

  return (
    <>
      <DonationGoalBackgroundController />
      <div className="space-y-16">
        <section className="text-center">
          <Heart className="mx-auto h-16 w-16 text-primary animate-pulse" />
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <h1 className="text-5xl font-extrabold mt-4 mb-3 font-headline tracking-tight">ادعم استمرارية هذا العلم</h1>
              <div className="w-48">
                  <Select value={selectedCurrency.code} onValueChange={(code) => setSelectedCurrency(currencies.find(c => c.code === code) || currencies[0])}>
                      <SelectTrigger>
                          <SelectValue placeholder="اختر العملة..." />
                      </SelectTrigger>
                      <SelectContent>
                          {currencies.map(c => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}
                      </SelectContent>
                  </Select>
              </div>
          </div>
          <p className="max-w-3xl mx-auto text-xl text-muted-foreground">
            كل مساهمة، مهما كانت صغيرة، تساعدنا على نشر العلم الشرعي وجعله متاحًا للملايين حول العالم.
          </p>
        </section>

        <OneClickDonation currency={selectedCurrency} />

        <DonationProgress currency={selectedCurrency} />

        <section>
          <h2 className="text-3xl font-bold text-center mb-12 font-headline">مستويات الدعم التقديرية</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              {/* Bronze */}
              <Card className="group text-center p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-2 bg-card/80 rounded-2xl">
                  <CardHeader className="p-0">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/50 mb-4 ring-4 ring-orange-500/20 group-hover:ring-orange-500/40 transition-shadow duration-300">
                          <Star className="h-7 w-7 text-orange-500 dark:text-orange-400 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-[15deg]" />
                      </div>
                      <CardTitle className="font-headline text-xl text-orange-600 dark:text-orange-400">داعم برونزي</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 mt-2">
                      <p className="text-base text-muted-foreground">عند تجاوز 500 جنيه مصري</p>
                  </CardContent>
              </Card>

              {/* Silver */}
              <Card className="group text-center p-6 border-2 border-transparent transition-all duration-300 hover:shadow-lg hover:-translate-y-2 bg-card/80 rounded-2xl">
                  <CardHeader className="p-0">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700/50 mb-4 ring-4 ring-slate-500/20 group-hover:ring-slate-500/40 transition-shadow duration-300">
                          <Star className="h-8 w-8 text-slate-600 dark:text-slate-300 fill-slate-600 dark:fill-slate-300 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-[15deg]" />
                      </div>
                      <CardTitle className="font-headline text-2xl text-slate-700 dark:text-slate-200">داعم فضي</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 mt-2">
                      <p className="text-lg text-muted-foreground">عند تجاوز 2500 جنيه مصري</p>
                  </CardContent>
              </Card>
              
              {/* Gold - Highlighted */}
              <Card className="group text-center p-8 transition-all duration-300 bg-card border-2 border-amber-400/50 shadow-2xl shadow-amber-500/10 rounded-2xl hover:shadow-amber-500/20 hover:-translate-y-2 hover:scale-110">
                  <CardHeader className="p-0">
                      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/30 mb-4 ring-4 ring-amber-500/20 group-hover:ring-amber-500/40 transition-shadow duration-300">
                          <Shield className="h-10 w-10 text-amber-500 dark:text-amber-300 fill-current transition-transform duration-300 group-hover:scale-125 group-hover:rotate-[-15deg]" />
                      </div>
                      <CardTitle className="font-headline text-3xl text-amber-600 dark:text-amber-200">داعم ذهبي</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 mt-2">
                      <p className="text-lg text-muted-foreground">عند تجاوز 5000 جنيه مصري</p>
                  </CardContent>
              </Card>
          </div>
        </section>

        <section>
            <Card className="bg-card/50">
              <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-headline">اختر طريقة الدعم المناسبة لك</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="rounded-lg p-6 text-center space-y-4 border">
                      <h3 className="text-xl font-bold font-headline flex items-center justify-center gap-2">
                          <Heart className="h-5 w-5" /> دعم شهري (باتريون)
                      </h3>
                      <p className="text-muted-foreground text-sm">
                          دعمك المستمر يضمن لنا الاستقرار المالي ويساعدنا في التخطيط طويل الأمد.
                      </p>
                      <Button asChild size="lg" variant="secondary" className="w-full">
                          <Link href="#">ادعمنا عبر باتريون</Link>
                      </Button>
                  </div>
                  <div className="rounded-lg p-6 text-center space-y-4 border">
                      <h3 className="text-xl font-bold font-headline flex items-center justify-center gap-2">
                          <svg className="h-6 w-6" viewBox="0 0 24 24"><path fill="currentColor" d="M7.336 2.112H2.944a.2.2 0 00-.2.2v16.945a.2.2 0 00.2.2h3.626v-6.072h1.614a4.41 4.41 0 110-8.82H7.336zm4.618 5.378a.65.65 0 00-.65.65v5.18a.65.65 0 00.65.65h1.16a.65.65 0 000-1.3H12.6V8.14a.65.65 0 00-.646-.65zM15.42 8.7a.64.64 0 000 1.28h.592v3.29h-.592a.64.64 0 100 1.28h.592a2.536 2.536 0 002.536-2.536V9.91a2.536 2.536 0 00-2.536-2.535h-1.87a.64.64 0 000 1.28h1.278z"></path></svg>
                          تبرع لمرة واحدة (باي بال)
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        ساهم ولو لمرة واحدة لتغطية التكاليف التشغيلية.
                      </p>
                      <Button asChild size="lg" className="w-full">
                          <Link href="#">تبرع عبر باي بال</Link>
                      </Button>
                  </div>
                  <div className="rounded-lg p-6 text-center space-y-4 border">
                      <h3 className="text-xl font-bold font-headline flex items-center justify-center gap-2">
                          <CreditCard className="h-5 w-5" /> البطاقة الإئتمانية (Stripe)
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        طريقة آمنة ومباشرة لدعم الموقع باستخدام بطاقتك الإئتمانية.
                      </p>
                      <Button asChild size="lg" className="w-full">
                          <Link href="#">تبرع عبر Stripe</Link>
                      </Button>
                  </div>
                  <div className="rounded-lg p-6 text-center space-y-4 border">
                      <h3 className="text-xl font-bold font-headline flex items-center justify-center gap-2">
                          <Landmark className="h-5 w-5" /> تحويل بنكي مباشر
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        للمساهمات المباشرة، يمكنكم استخدام تفاصيل الحساب البنكي.
                      </p>
                      <Button asChild size="lg" variant="secondary" className="w-full">
                          <Link href="#">عرض تفاصيل الحساب</Link>
                      </Button>
                  </div>
              </CardContent>
            </Card>
        </section>

        <WallOfSupporters />

        <section>
          <h2 className="text-3xl font-bold text-center mb-8 font-headline">أين تذهب مساهماتكم؟</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {donationReasons.map((reason, index) => {
              const Icon = reason.icon;
              return (
                <Card key={index} className="text-center p-6 border-0 shadow-none bg-transparent">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 font-headline">{reason.title}</h3>
                  <p className="text-muted-foreground">{reason.description}</p>
                  <p className="text-sm font-semibold text-primary mt-3">{reason.example}</p>
                </Card>
              );
            })}
          </div>
        </section>

        <section>
          <Card className="bg-primary/5 border-primary/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline text-primary">
                <Heart className="h-6 w-6 fill-current" />
                رسالة من مطور الموقع
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-foreground/80 leading-relaxed">
                هذا المشروع تم تطويره كعمل خالص لوجه الله تعالى، بهدف نشر العلم النافع وتيسير وصوله لأبناء الأمة الإسلامية.
                مطور الموقع لا يتقاضى أي أجر شخصي من هذه التبرعات. جميع المساهمات تُستخدم بشكل مباشر لتغطية التكاليف التشغيلية للموقع وضمان استمراريته ونموه.
              </p>
            </CardContent>
          </Card>
        </section>

        <section>
            <h2 className="text-3xl font-bold text-center mb-8 font-headline">طرق أخرى للدعم</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {otherWaysToSupport.map((way, index) => {
                  const Icon = way.icon;
                  return (
                      <Card key={index} className="bg-card/50 p-6 text-center flex flex-col">
                        <div className="flex-grow">
                          <Icon className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-bold font-headline">{way.title}</h3>
                          <p className="text-sm text-muted-foreground mt-2">{way.description}</p>
                        </div>
                        {way.action && <div className="mt-4">{way.action}</div>}
                      </Card>
                  )
              })}
            </div>
        </section>
      </div>
    </>
  );
}
