'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlowCard, HoloBadge } from '@/components/ui/glow';
import { Sparkles, Heart, BookOpen, Music, Download, Printer, User, Smile, Plus, Trash2, Play, Pause, Award, Star, HelpingHand, Sprout, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Age Milestones Database
const ageMilestones = [
  {
    id: 'early',
    title: 'الطفولة المبكرة (2 - 5 سنوات)',
    description: 'مرحلة غرس المشاعر الدينية الإيجابية والتعلق بالرموز الإسلامية وتدريب اللسان على الكلمات الطيبة.',
    aqeedah: 'تعليم كلمة التوحيد (لا إله إلا الله)، والله هو الخالق والرازق، وتنمية حب الله ورسوله عبر الحكايات البسيطة.',
    skills: 'آداب الطعام باليمين وقول البسملة، السلام بابتسامة، وتعليم النظافة الشخصية والوضوء الرمزي.',
    quran: 'تحفيظ سورة الفاتحة وقصار السور (الإخلاص، الفلق، الناس) بالتكرار والترديد الجماعي.'
  },
  {
    id: 'middle',
    title: 'الطفولة المتوسطة (6 - 9 سنوات)',
    description: 'مرحلة التدريب الفعلي على العبادات وترسيخ الأخلاق والقدوة الحسنة وفهم الأحكام التكليفية البسيطة.',
    aqeedah: 'تعليم أركان الإسلام الخمسة وأركان الإيمان الستة، والحديث عن الجنة والنعم الإلهية.',
    skills: 'التدريب المنتظم على الصلوات الخمس بجدول تحفيزي، تعويد الطفل على بر الوالدين والصدقة البسيطة ومساعدة الآخرين.',
    quran: 'حفظ سور من جزء عم (مثل النبأ، النازعات، التكوير) وتعلم أحكام التلاوة المبسطة.'
  },
  {
    id: 'senior',
    title: 'الطفولة المتأخرة (10 - 13 سنة)',
    description: 'مرحلة المسؤولية، وبناء التوازن الفكري، ومواجهة التحديات الخارجية والتعود على الانضباط والتحكيم الذاتي.',
    aqeedah: 'ترسيخ المراقبة الذاتية لله، فهم الحكمة من العبادات، والإجابة عن التساؤلات العقدية بأسلوب منطقي وحواري.',
    skills: 'المواظبة التامة على الصلوات، الحجاب الشرعي للبنات، تحمّل المسؤولية المنزلية، والتعامل مع وسائل التواصل بأمان.',
    quran: 'إتمام جزء عم والانتقال لحفظ جزء تبارك وسورة الكهف وسورة البقرة بحسب الاستطاعة.'
  }
];

// Audio Stories
const bedtimeStories = [
  { id: 1, title: 'رحلة أصحاب الفيل الكبرى', duration: '5:24', totalSec: 324, desc: 'قصة أبرهة ودرس في حفظ الله لبيته الحرام.' },
  { id: 2, title: 'نوح عليه السلام وبناء السفينة', duration: '7:12', totalSec: 432, desc: 'قصة الصبر والإيمان والنجاة لمن صدق الله.' }
];

// Weekly Family Activities
const familyActivities = [
  { title: 'صندوق الصدقة العائلي 📦', desc: 'تزيين صندوق كرتوني ووضع صدقة يومية بسيطة لتعليم الجود والكرم.' },
  { title: 'مسابقة أسماء الله الحسنى 🏆', desc: 'حفظ وفهم اسمين من أسماء الله الحسنى معاً كعائلة نهاية كل أسبوع.' },
  { title: 'جلسة تدبر وتفكر خلوية 🌲', desc: 'الذهاب لحديقة أو مكان طبيعي وتأمل بديع خلق الله في الطيور والأشجار.' }
];

const prayers = [
  { key: 'fajr', label: 'الفجر' },
  { key: 'dhuhr', label: 'الظهر' },
  { key: 'asr', label: 'العصر' },
  { key: 'maghrib', label: 'المغرب' },
  { key: 'isha', label: 'العشاء' }
];

const weekdays = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

export default function KanafParentingPage() {
  const [selectedAgeIndex, setSelectedAgeIndex] = useState(0);
  const [childName, setChildName] = useState('');
  
  // Custom print tasks state
  const [customTasks, setCustomTasks] = useState<string[]>([
    'أداء الصلوات الخمس في وقتها 🕌',
    'بر الوالدين وسماع توجيهاتهما ❤️',
    'قراءة صفحة من القرآن الكريم 📖',
    'أداء أذكار الصباح والمساء 🤲'
  ]);
  const [newTaskText, setNewTaskText] = useState('');

  // Appreciation Certificate templates states
  const [certTemplate, setCertTemplate] = useState('emerald');
  const [certTitle, setCertTitle] = useState('بطل الصلاة والعبادة 🕌');

  // Kids Adhkar Stars interactive log
  const [adhkarStars, setAdhkarStars] = useState({
    morning: false,
    evening: false,
    sleep: false
  });

  // Prayer Tree leaf colors state (keys are: "dayIndex-prayerKey")
  const [prayerTree, setPrayerTree] = useState<Record<string, 'empty' | 'green' | 'yellow' | 'red'>>({});

  // Audio simulation state
  const [activeStory, setActiveStory] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playProgress, setPlayProgress] = useState(0); 
  const playInterval = useRef<any>(null);

  // Bedtime story quiz state
  const [storyQuizAnswered, setStoryQuizAnswered] = useState(false);
  const [selectedStoryAnswer, setSelectedStoryAnswer] = useState<string | null>(null);
  const [storyQuizFeedback, setStoryQuizFeedback] = useState<string>('');

  const currentAge = ageMilestones[selectedAgeIndex];

  // Story player simulation effect
  useEffect(() => {
    if (isPlaying && activeStory) {
      playInterval.current = setInterval(() => {
        setPlayProgress((prev) => {
          if (prev >= activeStory.totalSec) {
            setIsPlaying(false);
            clearInterval(playInterval.current);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (playInterval.current) clearInterval(playInterval.current);
    }

    return () => {
      if (playInterval.current) clearInterval(playInterval.current);
    };
  }, [isPlaying, activeStory]);

  const handleStoryPlay = (story: any) => {
    if (activeStory?.id === story.id) {
      setIsPlaying(!isPlaying);
    } else {
      setActiveStory(story);
      setPlayProgress(0);
      setIsPlaying(true);
    }
  };

  const addCustomTask = () => {
    if (newTaskText.trim()) {
      setCustomTasks([...customTasks, newTaskText.trim()]);
      setNewTaskText('');
    }
  };

  const removeCustomTask = (idx: number) => {
    setCustomTasks(customTasks.filter((_, i) => i !== idx));
  };

  const handlePrint = () => {
    window.print();
  };

  const cycleLeafColor = (dayIdx: number, prayerKey: string) => {
    const key = `${dayIdx}-${prayerKey}`;
    const current = prayerTree[key] || 'empty';
    let next: 'empty' | 'green' | 'yellow' | 'red' = 'empty';

    if (current === 'empty') next = 'green';
    else if (current === 'green') next = 'yellow';
    else if (current === 'yellow') next = 'red';
    else next = 'empty';

    setPrayerTree(prev => ({ ...prev, [key]: next }));
  };

  // Counting prayers state
  const treeStats = React.useMemo(() => {
    let green = 0;
    let yellow = 0;
    let red = 0;
    Object.values(prayerTree).forEach(val => {
      if (val === 'green') green++;
      if (val === 'yellow') yellow++;
      if (val === 'red') red++;
    });
    return { green, yellow, red };
  }, [prayerTree]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Page Title */}
      <div className="text-center mb-12 hide-in-print">
        <HoloBadge className="mb-3">
          <Heart className="h-3.5 w-3.5 text-primary animate-pulse" />
          <span>التربية والأسرة المسلمة</span>
        </HoloBadge>
        <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-primary/80 mb-4">
          كنَف - ركن التربية والبيت المسلم
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base text-center">
          تنشئة واعدة على الهدي النبوي من خلال مسارات التوجيه التربوي حسب العمر، وحكايات ما قبل النوم، وصانع شهادات التقدير ولوحات المتابعة للطباعة.
        </p>
      </div>

      {/* Age Category Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 hide-in-print">
        {ageMilestones.map((age, idx) => (
          <button
            key={age.id}
            onClick={() => setSelectedAgeIndex(idx)}
            className={`p-5 rounded-3xl border text-right transition-all flex flex-col justify-between ${
              selectedAgeIndex === idx
                ? 'bg-zinc-900 border-primary shadow-lg shadow-primary/10'
                : 'bg-zinc-950/40 border-white/10 hover:bg-white/5'
            }`}
          >
            <span className="text-xs bg-primary/15 text-primary px-3 py-1 rounded-full font-bold w-max mb-3">
              مسار تربوي مخصص
            </span>
            <h3 className="font-bold text-white text-base">{age.title}</h3>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{age.description.slice(0, 75)}...</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left/Main Side: Milestones Guides */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-zinc-950/40 backdrop-blur-xl border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative hide-in-print">
            <h2 className="text-xl font-bold border-b border-white/10 pb-4 mb-6 flex items-center gap-2">
              <Smile className="h-5 w-5 text-primary" />
              <span>أهداف النمو التربوي: {currentAge.title}</span>
            </h2>

            <div className="space-y-6">
              <div className="bg-white/5 border border-white/5 p-5 rounded-2xl space-y-2 text-right">
                <h4 className="font-bold text-sm text-primary flex items-center gap-2 justify-start">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <span>التربية العقائدية والعبادية</span>
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{currentAge.aqeedah}</p>
              </div>

              <div className="bg-white/5 border border-white/5 p-5 rounded-2xl space-y-2 text-right">
                <h4 className="font-bold text-sm text-amber-400 flex items-center gap-2 justify-start">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  <span>المهارات والسنن والأخلاق</span>
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{currentAge.skills}</p>
              </div>

              <div className="bg-white/5 border border-white/5 p-5 rounded-2xl space-y-2 text-right">
                <h4 className="font-bold text-sm text-emerald-400 flex items-center gap-2 justify-start">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span>خطة الحفظ والقرآن الكريم</span>
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{currentAge.quran}</p>
              </div>
            </div>
          </Card>

          {/* Interactive Prayer Tree Coloring Chart */}
          <Card className="bg-zinc-950/40 backdrop-blur-xl border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative text-right hide-in-print">
            <h3 className="text-xl font-bold flex items-center gap-2 mb-2 text-white justify-start">
              <Sprout className="h-5 w-5 text-emerald-400" />
              <span>شجرة الصلاة التفاعلية للأطفال (المتابعة الأسبوعية)</span>
            </h3>
            <p className="text-xs text-muted-foreground mb-6">
              اضغط على أوراق الشجرة لتلوينها وتتبع الصلوات: الأخضر (في وقتها)، الأصفر (قضاء/متأخرة)، الأحمر (فاتت)، الرمادي (لم تحن بعد).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white/5 p-3 rounded-2xl border border-white/5 text-center">
                <span className="text-[10px] text-muted-foreground font-bold">في وقتها 🟢</span>
                <div className="text-xl font-black text-emerald-400 mt-1">{treeStats.green} صلوات</div>
              </div>
              <div className="bg-white/5 p-3 rounded-2xl border border-white/5 text-center">
                <span className="text-[10px] text-muted-foreground font-bold">متأخرة 🟡</span>
                <div className="text-xl font-black text-amber-400 mt-1">{treeStats.yellow} صلوات</div>
              </div>
              <div className="bg-white/5 p-3 rounded-2xl border border-white/5 text-center">
                <span className="text-[10px] text-muted-foreground font-bold">فاتت 🔴</span>
                <div className="text-xl font-black text-red-400 mt-1">{treeStats.red} صلوات</div>
              </div>
            </div>

            <div className="bg-black/30 border border-white/5 rounded-3xl p-6 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="pb-3 text-right text-muted-foreground font-bold">اليوم</th>
                    {prayers.map(p => (
                      <th key={p.key} className="pb-3 text-center text-muted-foreground font-bold">{p.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {weekdays.map((day, dayIdx) => (
                    <tr key={day} className="border-b border-white/5 hover:bg-white/5 transition-all">
                      <td className="py-4 font-bold text-white text-right">{day}</td>
                      {prayers.map(p => {
                        const state = prayerTree[`${dayIdx}-${p.key}`] || 'empty';
                        return (
                          <td key={p.key} className="py-4 text-center">
                            <button
                              onClick={() => cycleLeafColor(dayIdx, p.key)}
                              className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center ${
                                state === 'green'
                                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                                  : state === 'yellow'
                                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                                  : state === 'red'
                                  ? 'bg-red-500/20 border-red-500 text-red-300'
                                  : 'bg-white/5 border-white/10 text-transparent'
                              }`}
                            >
                              ★
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Printable Worksheet Preview Card */}
          <GlowCard className="bg-zinc-950/40 backdrop-blur-xl border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col border-b border-white/10 pb-4 mb-6 gap-4 hide-in-print">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Download className="h-5 w-5 text-primary" />
                    <span>صانع لوحات المتابعة الأسبوعية للطفل</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">أضف أعمالاً مخصصة للطفل واطبع لوحة التقييم لتعليقها بالمنزل</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <Input
                    placeholder="اسم الطفل البطل..."
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    className="bg-white/5 border-white/10 rounded-xl text-xs max-w-[160px] text-right"
                  />
                  <Button onClick={handlePrint} className="rounded-xl bg-primary hover:bg-primary/90 text-black font-black text-xs">
                    <Printer className="h-3.5 w-3.5 me-1.5" /> طباعة
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-white/5">
                <Input
                  placeholder="مثال: تنظيف الأسنان بالفرشاة والسواك..."
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  className="bg-white/5 border-white/10 rounded-xl text-xs flex-1 text-right"
                />
                <Button onClick={addCustomTask} size="sm" className="rounded-xl bg-zinc-900 border border-white/10 text-white hover:bg-white/5 text-xs">
                  <Plus className="h-4 w-4 me-1" /> إضافة
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {customTasks.map((t, idx) => (
                  <span key={idx} className="bg-white/5 border border-white/10 text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-white/90">
                    <span>{t}</span>
                    <button onClick={() => removeCustomTask(idx)} className="text-muted-foreground hover:text-red-400">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Printable Frame Area */}
            <div className="bg-white text-zinc-950 p-6 md:p-8 rounded-3xl border border-zinc-200 shadow-lg text-right print-only-area">
              <div className="flex justify-between items-center border-b border-zinc-200 pb-4 mb-6">
                <div>
                  <h2 className="text-2xl font-black text-emerald-700">لوحتي للعمل الصالح 🌟</h2>
                  <p className="text-xs text-zinc-500 mt-1">قال رسول الله ﷺ: &quot;أحب الأعمال إلى الله أدومها وإن قل&quot;</p>
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-zinc-800">البطل الصغير: <span className="text-emerald-600 border-b border-zinc-300 px-2 font-black">{childName || '..........'}</span></div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">منصة وقفة التربوية</div>
                </div>
              </div>

              <div className="grid grid-cols-8 gap-2 mb-6">
                <div className="col-span-2 text-xs font-bold text-zinc-500 bg-zinc-100 p-2 rounded text-center">العمل الصالح</div>
                {['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'].map((day) => (
                  <div key={day} className="text-xs font-bold text-zinc-700 bg-zinc-100 p-2 rounded text-center">{day}</div>
                ))}

                {customTasks.map((task, idx) => (
                  <React.Fragment key={idx}>
                    <div className="col-span-2 text-xs font-bold text-zinc-800 bg-zinc-50 p-2.5 rounded border border-zinc-100 flex items-center justify-start">
                      {task}
                    </div>
                    {Array.from({ length: 7 }).map((_, i) => (
                      <div key={i} className="border border-zinc-200 rounded-lg flex items-center justify-center bg-white min-h-[40px]">
                        <span className="text-zinc-300 opacity-20">★</span>
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </GlowCard>

          {/* Child Appreciation Certificate Generator */}
          <Card className="bg-zinc-950/40 backdrop-blur-xl border-white/10 rounded-3xl p-6 shadow-2xl text-right hide-in-print">
            <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-6">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                  <Award className="h-5 w-5 text-primary" />
                  <span>مولد شهادات تقدير البطل الصغير</span>
                </h3>
                <p className="text-xs text-muted-foreground">صمم واطبع شهادة فخر فورية لتشجيع طفلك</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground font-bold">لقب وبادج التقدير:</label>
                <select
                  value={certTitle}
                  onChange={(e) => setCertTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="بطل الصلاة والعبادة 🕌" className="bg-zinc-950">بطل الصلاة والعبادة 🕌</option>
                  <option value="حافظ القرآن الصغير 📖" className="bg-zinc-950">حافظ القرآن الصغير 📖</option>
                  <option value="طفل بار وخلوق ❤️" className="bg-zinc-950">طفل بار وخلوق ❤️</option>
                  <option value="بطل الأخلاق والصدق ✨" className="bg-zinc-950">بطل الأخلاق والصدق ✨</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted-foreground font-bold">سمة اللون البرونزية:</label>
                <div className="flex gap-2 pt-1">
                  {['emerald', 'amber', 'indigo'].map((c) => (
                    <button
                      key={c}
                      onClick={() => setCertTemplate(c)}
                      className={`flex-1 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                        certTemplate === c
                          ? 'bg-primary/20 border-primary text-primary'
                          : 'bg-white/5 border-transparent text-muted-foreground hover:bg-white/10'
                      }`}
                    >
                      {c === 'emerald' ? 'أخضر' : c === 'amber' ? 'ذهبي' : 'أزرق'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Certificate Frame Preview */}
            <div className={`p-8 rounded-3xl border text-center relative overflow-hidden bg-white text-zinc-950 ${
              certTemplate === 'emerald' ? 'border-emerald-600' : certTemplate === 'amber' ? 'border-amber-500' : 'border-indigo-600'
            }`}>
              <div className="space-y-4">
                <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">شهادة تقدير وتميز</div>
                <h2 className="text-2xl font-black text-zinc-900 border-b border-zinc-100 pb-2 max-w-md mx-auto">
                  {certTitle}
                </h2>
                <p className="text-xs text-zinc-500">تمنح هذه الشهادة بكل فخر واعتزاز للبالبطل:</p>
                <div className="text-3xl font-black text-emerald-700 py-2 border-b-2 border-dashed border-zinc-200 max-w-sm mx-auto">
                  {childName || '..........'}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <Button onClick={handlePrint} className="rounded-xl bg-primary hover:bg-primary/95 text-black font-black text-xs">
                <Printer className="h-4 w-4 me-1.5" /> طباعة الشهادة
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Side: Stories, Adhkar Tracker, Activities Idea Bank */}
        <div className="lg:col-span-1 space-y-6 hide-in-print">
          {/* Daily Kids Adhkar Star Log */}
          <Card className="bg-zinc-950/40 backdrop-blur-xl border-white/10 rounded-3xl p-5 shadow-2xl text-right">
            <h3 className="text-base font-bold flex items-center gap-2 mb-2 justify-start text-white">
              <Star className="h-5 w-5 text-amber-400 animate-pulse" />
              <span>لوحة أذكار الطفل الملونة</span>
            </h3>
            <p className="text-[10px] text-muted-foreground mb-4">انقر على النجوم لتفعيل التلوين الجميل ومتابعة أذكار طفلك اليومية.</p>

            <div className="grid grid-cols-3 gap-3 text-center">
              <button
                onClick={() => setAdhkarStars(prev => ({ ...prev, morning: !prev.morning }))}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1.5 ${
                  adhkarStars.morning
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md shadow-amber-500/10'
                    : 'bg-white/5 border-transparent text-muted-foreground'
                }`}
              >
                <Star className={`h-5 w-5 ${adhkarStars.morning ? 'fill-amber-400 text-amber-400' : ''}`} />
                <span className="text-[10px] font-bold">أذكار الصباح</span>
              </button>

              <button
                onClick={() => setAdhkarStars(prev => ({ ...prev, evening: !prev.evening }))}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1.5 ${
                  adhkarStars.evening
                    ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300 shadow-md shadow-indigo-500/10'
                    : 'bg-white/5 border-transparent text-muted-foreground'
                }`}
              >
                <Star className={`h-5 w-5 ${adhkarStars.evening ? 'fill-indigo-400 text-indigo-400' : ''}`} />
                <span className="text-[10px] font-bold">أذكار المساء</span>
              </button>

              <button
                onClick={() => setAdhkarStars(prev => ({ ...prev, sleep: !prev.sleep }))}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1.5 ${
                  adhkarStars.sleep
                    ? 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-md shadow-purple-500/10'
                    : 'bg-white/5 border-transparent text-muted-foreground'
                }`}
              >
                <Star className={`h-5 w-5 ${adhkarStars.sleep ? 'fill-purple-400 text-purple-400' : ''}`} />
                <span className="text-[10px] font-bold">أذكار النوم</span>
              </button>
            </div>
          </Card>

          {/* Bedtime Stories */}
          <Card className="bg-zinc-950/40 backdrop-blur-xl border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <CardHeader className="border-b border-white/10 pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Music className="h-5 w-5 text-primary animate-pulse" />
                <span>حكايات ما قبل النوم</span>
              </CardTitle>
              <CardDescription>قصص الأنبياء والأخلاق النبوية مسموعة للأطفال</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {bedtimeStories.map((story) => (
                <div
                  key={story.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 text-right ${
                    activeStory?.id === story.id
                      ? 'bg-primary/10 border-primary shadow-lg shadow-primary/5'
                      : 'bg-white/5 border-transparent hover:bg-white/10'
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-white">{story.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-1">{story.desc}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-white/5 gap-2">
                    <button
                      onClick={() => {
                        setActiveStory(story);
                        setStoryQuizAnswered(false);
                        setSelectedStoryAnswer(null);
                        setStoryQuizFeedback('');
                      }}
                      className="text-[10px] text-amber-400 hover:underline font-bold"
                    >
                      أجب عن سؤال القصة 🎮
                    </button>

                    <Button
                      onClick={() => handleStoryPlay(story)}
                      variant="ghost"
                      size="sm"
                      className="text-xs text-primary hover:text-primary-foreground hover:bg-primary rounded-xl"
                    >
                      {activeStory?.id === story.id && isPlaying ? <Pause className="h-3 w-3 me-1" /> : <Play className="h-3 w-3 me-1" />}
                      {activeStory?.id === story.id && isPlaying ? 'إيقاف مؤقت' : 'استماع وحكاية'}
                    </Button>
                  </div>

                  {activeStory?.id === story.id && (
                    <div className="mt-3 p-3 bg-black/40 border border-white/5 rounded-xl space-y-2.5 text-xs">
                      {story.id === 1 ? (
                        <>
                          <div className="font-bold text-white">سؤال القصة: ماذا أرسل الله على جيش أبرهة لحماية الكعبة المشرفة؟</div>
                          <div className="grid grid-cols-1 gap-1.5 pt-1.5">
                            {[
                              'طيراً أبابيل تحمل حجارة من سجيل',
                              'ريحاً صرصراً عاتية',
                              'سحابة ممطرة بالبرق'
                            ].map((opt, oIdx) => (
                              <button
                                key={oIdx}
                                disabled={storyQuizAnswered}
                                onClick={() => {
                                  setSelectedStoryAnswer(opt);
                                  setStoryQuizAnswered(true);
                                  if (opt === 'طيراً أبابيل تحمل حجارة من سجيل') {
                                    setStoryQuizFeedback('أحسنت يا بطل! إجابة صحيحة، حفظ الله بيته الحرام بإرسال طير أبابيل.');
                                  } else {
                                    setStoryQuizFeedback('حاول مجدداً يا بطل! ركز في قصة سورة الفيل.');
                                  }
                                }}
                                className={`text-right p-2 rounded-lg border text-[11px] ${
                                  storyQuizAnswered
                                    ? opt === 'طيراً أبابيل تحمل حجارة من سجيل'
                                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                                      : selectedStoryAnswer === opt
                                      ? 'bg-red-500/20 border-red-500 text-red-300'
                                      : 'bg-transparent border-transparent opacity-65'
                                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="font-bold text-white">سؤال القصة: ما الذي أمر الله سيدنا نوح بصنعه للنجاة من الطوفان؟</div>
                          <div className="grid grid-cols-1 gap-1.5 pt-1.5">
                            {[
                              'سفينة خشبية ضخمة',
                              'قلعة حصينة فوق الجبل',
                              'سد مائي عظيم'
                            ].map((opt, oIdx) => (
                              <button
                                key={oIdx}
                                disabled={storyQuizAnswered}
                                onClick={() => {
                                  setSelectedStoryAnswer(opt);
                                  setStoryQuizAnswered(true);
                                  if (opt === 'سفينة خشبية ضخمة') {
                                    setStoryQuizFeedback('ممتاز يا ذكي! أمر الله نوحاً بصنع السفينة لينجو مع المؤمنين.');
                                  } else {
                                    setStoryQuizFeedback('حاول مجدداً! تذكر كيف عبر المؤمنون الطوفان.');
                                  }
                                }}
                                className={`text-right p-2 rounded-lg border text-[11px] ${
                                  storyQuizAnswered
                                    ? opt === 'سفينة خشبية ضخمة'
                                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                                      : selectedStoryAnswer === opt
                                      ? 'bg-red-500/20 border-red-500 text-red-300'
                                      : 'bg-transparent border-transparent opacity-65'
                                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </>
                      )}

                      {storyQuizAnswered && (
                        <div className={`p-2 rounded-lg border text-[10px] ${selectedStoryAnswer === (story.id === 1 ? 'طيراً أبابيل تحمل حجارة من سجيل' : 'سفينة خشبية ضخمة') ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                          {storyQuizFeedback}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Weekly Family Activities Idea Bank */}
          <Card className="bg-zinc-950/40 backdrop-blur-xl border-white/10 rounded-3xl p-5 shadow-2xl text-right">
            <h3 className="text-base font-bold flex items-center gap-2 mb-2 justify-start text-white">
              <HelpingHand className="h-5 w-5 text-primary animate-pulse" />
              <span>بنك الأنشطة العائلية الأسبوعية</span>
            </h3>
            <p className="text-[10px] text-muted-foreground mb-4 font-bold">أنشطة تفاعلية لترسيخ الود والتربية الإيمانية داخل المنزل.</p>

            <div className="space-y-3">
              {familyActivities.map((act, i) => (
                <div key={i} className="bg-white/5 border border-white/5 p-3 rounded-2xl space-y-1 hover:border-primary/45 transition-colors">
                  <h4 className="font-bold text-xs text-white">{act.title}</h4>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{act.desc}</p>
                  <button
                    onClick={() => setCustomTasks([...customTasks, act.title])}
                    className="text-[9px] text-primary hover:underline font-bold mt-1 block"
                  >
                    + أضف للائحة المتابعة الأسبوعية
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
