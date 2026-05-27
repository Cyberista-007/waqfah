'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { GlowCard, HoloBadge, NeonBorder } from '@/components/ui/glow';
import { Sparkles, Sun, Moon, Briefcase, Users, CheckSquare, ShieldCheck, AlertCircle, RefreshCw, Flame, BookOpen, Heart, Plus, Calendar, Smile, BarChart2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Daily Etiquette Milestones
const dailySunnahs = [
  {
    id: 'morning',
    time: 'الصباح والاستيقاظ',
    icon: Sun,
    color: '#f59e0b',
    items: [
      { id: 'm1', text: 'قول دعاء الاستيقاظ: "الحمد لله الذي أحيانا بعد ما أماتنا وإليه النشور"' },
      { id: 'm2', text: 'استخدام السواك وغسل اليدين ثلاثاً قبل إدخالهما الإناء' },
      { id: 'm3', text: 'أداء أذكار الصباح وقراءة آية الكرسي والمعوذات' }
    ]
  },
  {
    id: 'leave',
    time: 'الخروج والسعي في الأرض',
    icon: Briefcase,
    color: '#10b981',
    items: [
      { id: 'l1', text: 'قول دعاء الخروج: "بسم الله، توكلت على الله، ولا حول ولا قوة إلا بالله"' },
      { id: 'l2', text: 'إفشاء السلام على من عرفت ومن لم تعرف في طريقك' },
      { id: 'l3', text: 'إماطة الأذى عن الطريق واحتسابها صدقة' }
    ]
  },
  {
    id: 'social',
    time: 'المجلس والتواصل اليومي',
    icon: Users,
    color: '#3b82f6',
    items: [
      { id: 's1', text: 'التبسم في وجوه الآخرين ("تبسمك في وجه أخي كصدقة")' },
      { id: 's2', text: 'حفظ اللسان من الغيبة والنميمة وتجنب الجدال العقيم' },
      { id: 's3', text: 'التأني والتثبت قبل نقل الأخبار أو التعليقات الرقمية' }
    ]
  },
  {
    id: 'night',
    time: 'المساء والنوم',
    icon: Moon,
    color: '#8b5cf6',
    items: [
      { id: 'n1', text: 'الوضوء قبل النوم ونفض الفراش ثلاثاً' },
      { id: 'n2', text: 'النوم على الشق الأيمن ووضع اليد اليمنى تحت الخد الأيمن' },
      { id: 'n3', text: 'قول دعاء النوم: "باسمك ربي وضعت جنبي وبك أرفعه"' }
    ]
  }
];

// 30-Day Etiquette Tasks
const thirtyDayChallenge = [
  'إلقاء السلام بابتسامة على 3 غرباء 🤝',
  'كظم الغيظ وتجنب الغضب طوال اليوم 🤐',
  'أداء سنّة الضحى ركعتين ☀️',
  'قراءة أذكار الصباح والمساء بيقين 📖',
  'إعانة شخص محتاج أو التصدق بمبلغ بسيط 💰',
  'صدمة لسانية: تجنب الجدال ولو كنت محقاً 🤫',
  'عيادة مريض أو السؤال عن قريب منقطع 📞',
  'تقديم هدية بسيطة لأحد أفراد العائلة 🎁',
  'بر الوالدين بطلب رضاهما أو الدعاء لهما 🤍',
  'النوم على طهارة كاملة ووضوء 🌙',
  'إفشاء السلام داخل المنزل عند الدخول والخروج 🕌',
  'استخدام السواك مع كل صلاة اليوم 🦷',
  'شكر الله على 3 نعم وتدوينها ✍️',
  'سقاية طائر أو حيوان أو ري نبات 💧',
  'التسامح مع شخص أخطأ في حقك اليوم 🌸',
  'تجنب نقل الإشاعات والتأكد من الأخبار 🛡️',
  'التزام الكلمة الطيبة والثناء على الآخرين 🗣️',
  'غض البصر وحفظ العين عن المحرمات 👀',
  'أداء الصلوات الخمس في جماعة بالمسجد 🕋',
  'مساعدة الزوجة أو الوالدة في أعمال المنزل 🧹',
  'صيام يوم تطوعي (إثنين أو خميس) 🥛',
  'الاستماع لآيات من القرآن الكريم بإنصات 🎧',
  'تطهير المجلس من الغيبة والنميمة 🚫',
  'تعلم سنة جديدة وتطبقها ونشرها 💡',
  'الاستغفار 100 مرة في الصباح والمساء 📿',
  'إماطة الأذى عن طريق المارة 🛣️',
  'كتابة رسالة شكر لمعلمك أو مرشدك ✉️',
  'المحافظة على السنن الرواتب للصلوات 🕌',
  'الدعاء بظهر الغيب لـ 5 من أصحابك 🤲',
  'جلسة تدبر وتفكر في خلق الله لمدة 10 دقائق 🌌'
];

const ethicalScenarios = [
  {
    id: 1,
    title: 'الجدال على وسائل التواصل الاجتماعي',
    situation: 'رأيت منشوراً يهاجم فكرة تؤمن بها بشدة، وهناك تعليقات مستفزة وجدالات حادة تجري بين المتابعين. كيف تتصرف؟',
    options: [
      {
        text: 'أكتب رداً مطولاً مستخدماً عبارات شديدة اللهجة لإفحام الطرف الآخر والانتصار للحق.',
        feedback: 'غير مستحب. الجدال العنيف غالباً ما يورث الضغينة ويقود إلى الشقاق، وقد قال صلى الله عليه وسلم: "أنا زعيم ببيت في ربض الجنة لمن ترك المراء وإن كان محقاً".',
        isCorrect: false
      },
      {
        text: 'أعرض عن المنشور تماماً، أو أكتب تعليقاً واحداً هادئاً وموثقاً بالدليل دون الدخول في مهاترات.',
        feedback: 'رائع ومطابق للأدب النبوي! الإعراض عن الجدال العقيم يحفظ القلوب، والنصح بالرفق واللين هو الأبلغ أثراً وعملاً بقوله تعالى: "وَإِذَا خَاطَبَهُمُ الْجَاهِلُونَ قَالُوا سَلَامًا".',
        isCorrect: true
      }
    ]
  },
  {
    id: 2,
    title: 'الغضب في الطريق أثناء القيادة',
    situation: 'قام سائق آخر بقطع الطريق عليك فجأة بطريقة متهورة كادت تتسبب في حادث، ثم أشار إليك بغضب كأنك أنت المخطئ. كيف تتصرف؟',
    options: [
      {
        text: 'أطلق بوق السيارة بقوة وأصرخ في وجهه أو أقوم بملاحقته لتلقينه درساً.',
        feedback: 'خيار غير لائق. الغضب جمرة من الشيطان تدمر الاتزان الأخلاقي، وقد قال رسول الله صلى الله عليه وسلم: "ليس الشديد بالصُّرَعَة، إنما الشديد الذي يملك نفسه عند الغضب".',
        isCorrect: false
      },
      {
        text: 'أكظم غيظي، وأستعيذ بالله من الشيطان الرجيم، وأتابع طريقي متمنياً له الهداية والسلامة.',
        feedback: 'ممتاز! كظم الغيظ من أعظم صفات المحسنين التي امتدحها الله عز وجل بقوله: "وَالْكَاظِمِينَ الْغَيْظَ وَالْعَافِينَ عَنِ النَّاسِ ۗ وَاللَّهُ يُحِبُّ الْمُحْسِنِينَ".',
        isCorrect: true
      }
    ]
  }
];

const spiritualWirds = [
  { id: 'w1', text: 'أداء السنن الرواتب (12 ركعة)' },
  { id: 'w2', text: 'ورد تلاوة القرآن اليومي (حزب أو صفحة)' },
  { id: 'w3', text: 'أذكار الصباح والمساء كاملة' },
  { id: 'w4', text: 'صلاة قيام الليل والوتر' },
  { id: 'w5', text: 'الاستغفار والذكر (100 مرة فأكثر)' }
];

export default function AdabPage() {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [streak, setStreak] = useState(0);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [scenarioAnswered, setScenarioAnswered] = useState(false);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);

  // 30-Day challenge states
  const [challengeDays, setChallengeDays] = useState<Record<number, boolean>>({});
  const [selectedChallengeDay, setSelectedChallengeDay] = useState<number | null>(null);

  // Gratitude states
  const [gratitudes, setGratitudes] = useState<string[]>([]);
  const [newGratitude, setNewGratitude] = useState('');

  // Accountability states
  const [checkedWirds, setCheckedWirds] = useState<Record<string, boolean>>({});
  const [sincerityScore, setSincerityScore] = useState<number>(3);

  // Load from LocalStorage
  useEffect(() => {
    const savedChecked = localStorage.getItem('waqfah_checked_adab');
    const savedStreak = localStorage.getItem('waqfah_streak_adab');
    const savedDays = localStorage.getItem('waqfah_challenge_days');
    const savedGratitude = localStorage.getItem('waqfah_gratitudes');
    const savedWirds = localStorage.getItem('waqfah_wirds');
    const savedSincerity = localStorage.getItem('waqfah_sincerity');

    if (savedChecked) {
      try { setCheckedItems(JSON.parse(savedChecked)); } catch (e) { console.error(e); }
    }
    if (savedStreak) setStreak(Number(savedStreak));
    if (savedDays) {
      try { setChallengeDays(JSON.parse(savedDays)); } catch (e) { console.error(e); }
    }
    if (savedGratitude) {
      try { setGratitudes(JSON.parse(savedGratitude)); } catch (e) { console.error(e); }
    }
    if (savedWirds) {
      try { setCheckedWirds(JSON.parse(savedWirds)); } catch (e) { console.error(e); }
    }
    if (savedSincerity) setSincerityScore(Number(savedSincerity));
  }, []);

  const totalItems = dailySunnahs.reduce((acc, cat) => acc + cat.items.length, 0);
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const progressPercent = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;

  // Calculate Character Balance Dimensions
  const characterBalance = useMemo(() => {
    const categories = [
      { name: 'العبادات والسنن', count: 0, total: 6 }, // morning + night
      { name: 'الآداب الاجتماعية', count: 0, total: 3 }, // leave/social
      { name: 'الشكر والامتنان', count: gratitudes.length, total: 3 }
    ];

    // Compute items
    if (checkedItems['m1']) categories[0].count++;
    if (checkedItems['m2']) categories[0].count++;
    if (checkedItems['m3']) categories[0].count++;
    if (checkedItems['n1']) categories[0].count++;
    if (checkedItems['n2']) categories[0].count++;
    if (checkedItems['n3']) categories[0].count++;

    if (checkedItems['l1']) categories[1].count++;
    if (checkedItems['l2']) categories[1].count++;
    if (checkedItems['l3']) categories[1].count++;
    if (checkedItems['s1']) categories[1].count++;
    if (checkedItems['s2']) categories[1].count++;
    if (checkedItems['s3']) categories[1].count++;

    return categories.map(cat => ({
      ...cat,
      percent: Math.min(100, Math.round((cat.count / cat.total) * 100))
    }));
  }, [checkedItems, gratitudes]);

  const toggleCheck = (itemId: string) => {
    const newChecked = { ...checkedItems, [itemId]: !checkedItems[itemId] };
    setCheckedItems(newChecked);
    localStorage.setItem('waqfah_checked_adab', JSON.stringify(newChecked));

    const newCheckedCount = Object.values(newChecked).filter(Boolean).length;
    const newProgress = Math.round((newCheckedCount / totalItems) * 100);

    if (newProgress >= 50 && progressPercent < 50) {
      const updatedStreak = streak === 0 ? 1 : streak + 1;
      setStreak(updatedStreak);
      localStorage.setItem('waqfah_streak_adab', String(updatedStreak));
    } else if (newProgress < 50 && progressPercent >= 50) {
      const updatedStreak = Math.max(0, streak - 1);
      setStreak(updatedStreak);
      localStorage.setItem('waqfah_streak_adab', String(updatedStreak));
    }
  };

  const handleScenarioOption = (idx: number) => {
    if (scenarioAnswered) return;
    setSelectedOptionIndex(idx);
    setScenarioAnswered(true);
  };

  const nextScenario = () => {
    setScenarioIndex((prev) => (prev + 1) % ethicalScenarios.length);
    setScenarioAnswered(false);
    setSelectedOptionIndex(null);
  };

  const toggleChallengeDay = (dayIdx: number) => {
    const updated = { ...challengeDays, [dayIdx]: !challengeDays[dayIdx] };
    setChallengeDays(updated);
    localStorage.setItem('waqfah_challenge_days', JSON.stringify(updated));
  };

  const addGratitude = () => {
    if (newGratitude.trim() && gratitudes.length < 3) {
      const updated = [...gratitudes, newGratitude.trim()];
      setGratitudes(updated);
      localStorage.setItem('waqfah_gratitudes', JSON.stringify(updated));
      setNewGratitude('');
    }
  };

  const clearGratitude = () => {
    setGratitudes([]);
    localStorage.removeItem('waqfah_gratitudes');
  };

  const toggleWird = (wirdId: string) => {
    const updated = { ...checkedWirds, [wirdId]: !checkedWirds[wirdId] };
    setCheckedWirds(updated);
    localStorage.setItem('waqfah_wirds', JSON.stringify(updated));
  };

  const handleSincerityChange = (val: number[]) => {
    setSincerityScore(val[0]);
    localStorage.setItem('waqfah_sincerity', String(val[0]));
  };

  const resetTracker = () => {
    setCheckedItems({});
    setStreak(0);
    setChallengeDays({});
    setCheckedWirds({});
    setSincerityScore(3);
    localStorage.removeItem('waqfah_checked_adab');
    localStorage.removeItem('waqfah_streak_adab');
    localStorage.removeItem('waqfah_challenge_days');
    localStorage.removeItem('waqfah_wirds');
    localStorage.removeItem('waqfah_sincerity');
  };

  // Calculate spiritual index
  const spiritualIndex = useMemo(() => {
    const completedWirds = Object.values(checkedWirds).filter(Boolean).length;
    const wirdWeight = (completedWirds / spiritualWirds.length) * 70;
    const sincerityWeight = (sincerityScore / 5) * 30;
    return Math.round(wirdWeight + sincerityWeight);
  }, [checkedWirds, sincerityScore]);

  const currentScenario = ethicalScenarios[scenarioIndex];
  const completedChallengeCount = Object.values(challengeDays).filter(Boolean).length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Title */}
      <div className="text-center mb-12">
        <HoloBadge className="mb-3">
          <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
          <span>مدرس السلوك والآداب</span>
        </HoloBadge>
        <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-primary/80 mb-4">
          أدَب - دليل الآداب والأخلاق اليومية
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base text-center">
          تتبع السنن اليومية، خض تحدي الـ 30 يوماً السلوكي، وتدرب على اتخاذ القرارات الحكيمة وفق الهدي والآداب الإسلامية.
        </p>
      </div>

      {/* Daily Verse Reflection Card with Share Options */}
      <Card className="bg-gradient-to-r from-zinc-900 to-zinc-950 border border-primary/20 rounded-3xl p-6 mb-8 text-right shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1.5 flex-1">
            <span className="text-[10px] text-primary font-black uppercase tracking-wider flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" /> آية التدبر والآداب اليومية
            </span>
            <p className="font-headline text-lg font-black text-white leading-loose">
              &quot;وَقُولُوا لِلنَّاسِ حُسْنًا&quot; (البقرة: 83)
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              توجيه رباني بليغ يرسم دستور التعامل البشري؛ فالكلمة الطيبة واللطف في الخطاب لهما أثر عظيم في تأليف القلوب وإشاعة التسامح والسلام بين الناس.
            </p>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center">
            <button
              onClick={() => {
                navigator.clipboard.writeText("قال تعالى: {وَقُولُوا لِلنَّاسِ حُسْنًا} [البقرة: 83] - أدب وتوجيه رباني كريم.");
                alert("تم نسخ آية التدبر بنجاح!");
              }}
              className="text-xs bg-white/5 hover:bg-white/10 text-white border border-white/10 px-3 py-2 rounded-xl transition-all font-bold"
            >
              نسخ النص 📋
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'آية التدبر والآداب اليومية',
                    text: 'قال تعالى: {وَقُولُوا لِلنَّاسِ حُسْنًا} [البقرة: 83] - أدب وتوجيه رباني كريم.',
                    url: window.location.href
                  }).catch(console.error);
                } else {
                  alert("ميزة المشاركة غير مدعومة في متصفحك، تم نسخ الرابط بدلاً من ذلك!");
                }
              }}
              className="text-xs bg-primary text-black px-3 py-2 rounded-xl transition-all font-black"
            >
              مشاركة 🔗
            </button>
          </div>
        </div>
      </Card>

      {/* Streak Dashboard Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-zinc-950/40 border-white/10 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-500/10 rounded-xl">
              <Flame className="h-6 w-6 text-red-500 animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground">التزامك المتواصل (Streak)</div>
              <div className="text-lg font-bold text-white">{streak} أيام متتالية</div>
            </div>
          </div>
          <span className="text-[10px] text-red-400 bg-red-500/10 px-2.5 py-1 rounded font-bold">ملتزم بالسنن 🔥</span>
        </Card>

        <Card className="bg-zinc-950/40 border-white/10 rounded-2xl p-4 flex items-center justify-between md:col-span-2 text-right">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 rounded-xl">
              <Smile className="h-6 w-6 text-emerald-400 animate-bounce" />
            </div>
            <div className="flex-1">
              <div className="text-[10px] text-emerald-400 font-bold">تحدي الـ 30 يوماً للآداب:</div>
              <p className="text-xs text-white/95 mt-0.5 font-bold">أنجزت {completedChallengeCount} من 30 يوماً. استمر في البناء الأخلاقي!</p>
            </div>
          </div>
          <button onClick={resetTracker} className="text-xs text-muted-foreground hover:text-red-400 flex items-center gap-1">
            <RefreshCw className="h-3.5 w-3.5" /> إعادة ضبط البيانات
          </button>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left/Main Side: Habit timeline & 30-Day Grid */}
        <div className="lg:col-span-2 space-y-6">
          {/* Daily Tracker */}
          <Card className="bg-zinc-950/40 backdrop-blur-xl border-white/10 rounded-3xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-primary" />
                  <span>متابع السنن والآداب اليومي</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">أحيي السنة النبوية في تفاصيل يومك</p>
              </div>
            </div>

            {/* Progress */}
            <div className="bg-white/5 border border-white/5 p-4 rounded-2xl mb-8 flex items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex justify-between text-xs font-bold text-muted-foreground mb-1.5">
                  <span>نسبة الإنجاز اليومي للآداب والسنن</span>
                  <span className="text-primary">{progressPercent}%</span>
                </div>
                <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                  <motion.div
                    className="bg-primary h-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
              <div className="text-center shrink-0">
                <div className="text-2xl font-black text-white">{checkedCount}/{totalItems}</div>
                <div className="text-[10px] text-muted-foreground">السنن المحققة</div>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-8 relative">
              <div className="absolute right-6 top-6 bottom-6 w-0.5 bg-white/10 pointer-events-none -z-10" />

              {dailySunnahs.map((category) => {
                const CatIcon = category.icon;
                return (
                  <div key={category.id} className="relative flex gap-6 text-right">
                    <div
                      className="h-12 w-12 rounded-full border-2 border-zinc-950 flex items-center justify-center shrink-0 shadow-lg z-10"
                      style={{ backgroundColor: `${category.color}20`, borderColor: category.color }}
                    >
                      <CatIcon className="h-5 w-5" style={{ color: category.color }} />
                    </div>

                    <div className="flex-1 bg-white/5 border border-white/5 p-5 rounded-2xl space-y-3">
                      <h3 className="font-bold text-sm" style={{ color: category.color }}>{category.time}</h3>
                      <div className="space-y-2">
                        {category.items.map((item) => (
                          <label
                            key={item.id}
                            className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                              checkedItems[item.id]
                                ? 'bg-primary/10 border-primary/40 text-primary font-medium'
                                : 'bg-white/5 border-transparent hover:bg-white/10'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={!!checkedItems[item.id]}
                              onChange={() => toggleCheck(item.id)}
                              className="hidden"
                            />
                            <div className={`mt-0.5 h-4.5 w-4.5 rounded border flex items-center justify-center shrink-0 ${
                              checkedItems[item.id]
                                ? 'bg-primary border-primary text-primary-foreground'
                                : 'border-white/30 bg-transparent'
                            }`}>
                              {checkedItems[item.id] && (
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <span className="text-xs leading-relaxed text-foreground/90">{item.text}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* 30-Day Grid Challenge */}
          <Card className="bg-zinc-950/40 backdrop-blur-xl border-white/10 rounded-3xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-right justify-start text-white">
              <Calendar className="h-5 w-5 text-primary" />
              <span>تحدي الـ 30 يوماً لتهذيب السلوك والآداب</span>
            </h2>
            <p className="text-xs text-muted-foreground mb-6 text-right">اختر يوماً لمشاهدة التحدي المقابل، وأكمل التحدي لوضع ملصق النجمة!</p>

            <div className="grid grid-cols-5 md:grid-cols-10 gap-3 mb-6">
              {Array.from({ length: 30 }).map((_, i) => {
                const dayNum = i + 1;
                const isCompleted = !!challengeDays[i];
                const isSelected = selectedChallengeDay === i;
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedChallengeDay(i)}
                    className={`h-11 rounded-xl font-bold transition-all border flex items-center justify-center text-xs ${
                      isCompleted
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/5'
                        : isSelected
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 text-muted-foreground'
                    }`}
                  >
                    {isCompleted ? '★' : dayNum}
                  </button>
                );
              })}
            </div>

            {selectedChallengeDay !== null && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 p-5 rounded-2xl text-right flex justify-between items-center gap-4"
              >
                <div>
                  <span className="text-[10px] text-primary font-bold">تحدي اليوم {selectedChallengeDay + 1}:</span>
                  <p className="text-xs font-bold text-white mt-1">{thirtyDayChallenge[selectedChallengeDay]}</p>
                </div>
                <Button
                  onClick={() => toggleChallengeDay(selectedChallengeDay)}
                  size="sm"
                  className={`rounded-xl text-xs font-bold ${
                    challengeDays[selectedChallengeDay]
                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {challengeDays[selectedChallengeDay] ? 'إلغاء الإكمال' : 'أكملت التحدي 🌟'}
                </Button>
              </motion.div>
            )}
          </Card>
        </div>

        {/* Right Side: Scenario, Gratitude and Moral Balance */}
        <div className="lg:col-span-1 space-y-6">
          {/* Moral Balance Dashboard */}
          <Card className="bg-zinc-950/40 backdrop-blur-xl border-white/10 rounded-3xl p-5 shadow-2xl text-right">
            <h3 className="text-sm font-bold flex items-center gap-2 mb-4 justify-start text-white">
              <BarChart2 className="h-5 w-5 text-primary" />
              <span>محلل التوازن الأخلاقي والسلوكي</span>
            </h3>

            <div className="space-y-4">
              {characterBalance.map((dim) => (
                <div key={dim.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{dim.name} ({dim.count}/{dim.total})</span>
                    <span className="font-bold text-primary">{dim.percent}%</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all duration-300"
                      style={{ width: `${dim.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Advanced spiritual Wird and Accountability Scorecard */}
          <Card className="bg-zinc-950/40 backdrop-blur-xl border-white/10 rounded-3xl p-5 shadow-2xl text-right">
            <h3 className="text-sm font-bold flex items-center gap-2 mb-2 justify-start text-white">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span>لوحة المراقبة الذاتية والورد اليومي</span>
            </h3>
            <p className="text-[10px] text-muted-foreground mb-4">
              أدخل وردك اليومي وقيم حضور قلبك لتوليد مؤشر الرضا الروحي اليومي.
            </p>

            <div className="space-y-3 mb-4">
              {spiritualWirds.map((w) => (
                <label
                  key={w.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                    checkedWirds[w.id]
                      ? 'bg-primary/10 border-primary/30 text-primary'
                      : 'bg-white/5 border-transparent text-muted-foreground hover:bg-white/10'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={!!checkedWirds[w.id]}
                    onChange={() => toggleWird(w.id)}
                    className="hidden"
                  />
                  <span className="text-xs font-medium">{w.text}</span>
                  <div className={`h-4.5 w-4.5 rounded border flex items-center justify-center shrink-0 ${
                    checkedWirds[w.id] ? 'bg-primary border-primary text-black' : 'border-white/20 bg-transparent'
                  }`}>
                    {checkedWirds[w.id] && <span className="text-[10px] font-black">✓</span>}
                  </div>
                </label>
              ))}
            </div>

            <div className="space-y-2 border-t border-white/5 pt-3">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">تقييم حضور القلب والإخلاص:</span>
                <span className="font-bold text-primary">{sincerityScore} / 5</span>
              </div>
              <Slider
                value={[sincerityScore]}
                onValueChange={handleSincerityChange}
                max={5}
                min={1}
                step={1}
                className="py-1"
              />
            </div>

            <div className="mt-4 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-2xl text-center">
              <span className="text-[10px] text-emerald-300 font-bold">مؤشر الرضا الروحي اليومي:</span>
              <div className="text-2xl font-black text-white mt-1">{spiritualIndex}%</div>
            </div>
          </Card>

          {/* Ethical Decision Scenarios */}
          <Card className="bg-zinc-950/40 backdrop-blur-xl border-white/10 rounded-3xl overflow-hidden shadow-2xl relative h-max">
            <NeonBorder color="hsl(var(--primary) / 0.3)">
              <CardHeader className="pb-4 border-b border-white/10">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary animate-pulse" />
                  <span>القرار والسلوك الأخلاقي</span>
                </CardTitle>
                <CardDescription>كيف تتصرف وفق الهدي والآداب النبوية؟</CardDescription>
              </CardHeader>
              <CardContent className="p-5 space-y-4 min-h-[360px] flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="text-xs text-primary font-bold">موقف واقعي: {currentScenario.title}</div>
                  <p className="text-xs font-medium leading-relaxed text-white/95">{currentScenario.situation}</p>

                  <div className="space-y-2.5 pt-2">
                    {currentScenario.options.map((option, idx) => {
                      const isSelected = selectedOptionIndex === idx;
                      return (
                        <button
                          key={idx}
                          disabled={scenarioAnswered}
                          onClick={() => handleScenarioOption(idx)}
                          className={`w-full text-right p-3 rounded-xl border text-xs leading-relaxed transition-all ${
                            scenarioAnswered
                              ? option.isCorrect
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                                : isSelected
                                ? 'bg-red-500/20 border-red-500 text-red-300'
                                : 'bg-white/5 border-transparent opacity-60'
                              : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-primary/50'
                          }`}
                        >
                          {option.text}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {scenarioAnswered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-xl border text-xs leading-relaxed mt-2 flex items-start gap-2 ${
                      currentScenario.options[selectedOptionIndex || 0].isCorrect
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                        : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                    }`}
                  >
                    <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                    <div>
                      <strong>توجيه أخلاقي:</strong>
                      <p className="mt-1 leading-relaxed">
                        {currentScenario.options[selectedOptionIndex || 0].feedback}
                      </p>
                    </div>
                  </motion.div>
                )}

                {scenarioAnswered && (
                  <Button onClick={nextScenario} className="w-full mt-4 bg-primary hover:bg-primary/90 text-black font-bold rounded-xl text-xs">
                    الموقف التالي
                  </Button>
                )}
              </CardContent>
            </NeonBorder>
          </Card>

          {/* Daily Islamic Gratitude Journal */}
          <Card className="bg-zinc-950/40 backdrop-blur-xl border-white/10 rounded-3xl p-5 shadow-2xl text-right">
            <h3 className="text-base font-bold flex items-center gap-2 mb-2 justify-start text-white">
              <Heart className="h-5 w-5 text-red-400" />
              <span>مفكرة الشكر والامتنان لله</span>
            </h3>
            <p className="text-[10px] text-muted-foreground mb-4">قال تعالى: &quot;لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ&quot;. دوّن 3 نعم تلمسها اليوم وتشكر الله عليها.</p>

            <div className="space-y-3">
              {gratitudes.map((g, idx) => (
                <div key={idx} className="bg-white/5 border border-white/5 p-2.5 rounded-xl text-xs text-white/90">
                  {idx + 1}. {g}
                </div>
              ))}

              {gratitudes.length < 3 ? (
                <div className="flex gap-2">
                  <Input
                    placeholder="نعمة البصر، الصحة، الأهل..."
                    value={newGratitude}
                    onChange={(e) => setNewGratitude(e.target.value)}
                    className="bg-white/5 border-white/10 rounded-xl text-xs text-right"
                  />
                  <Button onClick={addGratitude} size="sm" className="rounded-xl bg-primary hover:bg-primary/95 text-black font-bold text-xs">
                    شكر
                  </Button>
                </div>
              ) : (
                <p className="text-[10px] text-emerald-400 font-bold text-center mt-2">✨ لقد أتممت شكر نعم اليوم. بارك الله لك فيها!</p>
              )}

              {gratitudes.length > 0 && (
                <button onClick={clearGratitude} className="text-[9px] text-muted-foreground hover:text-red-400 mt-2 block mx-auto underline">
                  مسح قائمة النعم وتدبر أخرى
                </button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
