'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { GlowCard, HoloBadge, NeonBorder } from '@/components/ui/glow';
import { Compass, Sparkles, MapPin, Calendar, Clock, BookOpen, Footprints, Award, CheckCircle, XCircle, RefreshCw, Eye, Landmark, ArrowRight, Play, Swords } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Historical Checkpoints & Figures & Landmarks & Quiz
const historicalEras = [
  {
    id: 'rashidun',
    name: 'الخلافة الراشدة',
    period: '1 - 40 هـ (632 - 661 م)',
    center: 'المدينة المنورة',
    description: 'عهد الخلفاء الراشدين الأربعة. شهدت انتشار الإسلام الأول وتدوين المصحف وتأسيس الولايات الإسلامية وتوسيع رقعتها.',
    color: '#10b981',
    trivia: 'هل تعلم أن التقويم الهجري اعتمد رسمياً في عهد عمر بن الخطاب رضي الله عنه بدءاً من سنة الهجرة النبوية.',
    points: [
      { name: 'المدينة المنورة', desc: 'عاصمة الخلافة الأولى ومأوى الوحي ومركز إدارة الفتوحات.', x: 500, y: 190 },
      { name: 'مكة المكرمة', desc: 'مهبط الوحي وقبلة المسلمين، مركز الحج السنوي والروحاني.', x: 490, y: 220 },
      { name: 'البصرة', desc: 'مصر إسلامي جديد أسسه عتبة بن غزوان لتأمين الحدود وسير التجارة.', x: 540, y: 140 },
      { name: 'القدس', desc: 'تم فتحها صلحاً وتسلّم الخليفة عمر بن الخطاب مفاتيحها بنفسه.', x: 450, y: 120 }
    ],
    milestones: [
      { year: '2 هـ', title: 'غزوة بدر الكبرى', text: 'انتصار المسلمين الأول وتثبيت دعائم الدولة الناشئة.' },
      { year: '12 هـ', title: 'جمع القرآن الكريم', text: 'أمر الخليفة أبو بكر الصديق بجمع القرآن في صحف بعد استشهاد حفاظ اليمامة.' }
    ],
    travelers: [
      {
        name: 'رحلة عمر بن الخطاب للقدس',
        path: 'المدينة المنورة ➔ القدس',
        routePoints: [
          { x: 500, y: 190 },
          { x: 450, y: 120 }
        ],
        desc: 'رحلة الخليفة عمر بن الخطاب التاريخية لتسلم مفاتيح بيت المقدس وكتابة العهدة العمرية لأهل إيلياء.'
      }
    ],
    landmarks: [
      { title: 'المسجد النبوي الشريف', city: 'المدينة المنورة', desc: 'تأسس مع هجرة النبي صلى الله عليه وسلم، وكان مقراً للحكم والشورى والتعليم.' },
      { title: 'مسجد قباء', city: 'المدينة المنورة', desc: 'أول مسجد أُسس على التقوى في الإسلام بناه النبي صلى الله عليه وسلم عند وصوله للمدينة.' }
    ],
    quiz: {
      question: 'أي مدينة كانت عاصمة الخلافة الراشدة الأولى والمنطلق الأول للفتوحات الإسلامية؟',
      options: ['القدس', 'مكة المكرمة', 'المدينة المنورة', 'البصرة'],
      correctAnswer: 'المدينة المنورة',
      feedback: 'أحسنت! المدينة المنورة هي دار هجرة المصطفى وعاصمة الخلافة الراشدة الأولى التي انطلقت منها الجيوش.'
    }
  },
  {
    id: 'umayyad',
    name: 'الدولة الأموية',
    period: '41 - 132 هـ (661 - 750 م)',
    center: 'دمشق',
    description: 'أكبر دولة إسلامية جغرافياً في التاريخ، امتدت من حدود الصين شرقاً إلى فرنسا غرباً، وعرفت بازدهار البناء والعمارة وتأسيس الأساطيل البحرية.',
    color: '#eab308',
    trivia: 'هل تعلم أن أول مستشفى (بيمارستان) إسلامي متخصص أسسه الخليفة الوليد بن عبد الملك بدمشق عام 88 هـ.',
    points: [
      { name: 'دمشق', desc: 'عاصمة الخلافة الأموية وقاعدة انطلاق الفتوحات الكبرى نحو الشرق والغرب.', x: 470, y: 110 },
      { name: 'القيروان', desc: 'أسسها عقبة بن نافع لتكون قاعدة عسكرية لنشر الإسلام في المغرب العربي.', x: 320, y: 120 },
      { name: 'قرطبة', desc: 'دخلها المسلمون عقب فتح الأندلس بقيادة طارق بن زياد وموسى بن نصير.', x: 200, y: 80 }
    ],
    milestones: [
      { year: '50 هـ', title: 'بناء مدينة القيروان', text: 'تأسيس الحصن الإسلامي الأول في إفريقية لتثبيت دعائم الإسلام.' },
      { year: '92 هـ', title: 'فتح الأندلس', text: 'عبر طارق بن زياد المضيق وفتح الأندلس معلناً بداية فجر جديد لأوروبا.' }
    ],
    travelers: [
      {
        name: 'مسار فتح الأندلس (طارق بن زياد)',
        path: 'القيروان ➔ طنجة ➔ قرطبة',
        routePoints: [
          { x: 320, y: 120 },
          { x: 240, y: 130 },
          { x: 200, y: 80 }
        ],
        desc: 'خط سير جيش الفتح بقيادة طارق بن زياد من شمال إفريقيا لعبور البحر وتأسيس الوجود الإسلامي بالأندلس.'
      }
    ],
    landmarks: [
      { title: 'الجامع الأموي بدمشق', city: 'دمشق', desc: 'تحفة هندسية فريدة بناها الوليد بن عبد الملك تمثل أوج الفنون المعمارية الأموية.' },
      { title: 'مسجد قبة الصخرة', city: 'القدس', desc: 'أمر ببنائه الخليفة عبد الملك بن مروان بقبته الذهبية المشهورة فوق الصخرة المشرفة.' }
    ],
    quiz: {
      question: 'من القائد الذي أسس مدينة القيروان في تونس لتكون قاعدة عسكرية للدولة الأموية؟',
      options: ['عقبة بن نافع', 'طارق بن زياد', 'قتيبة بن مسلم', 'موسى بن نصير'],
      correctAnswer: 'عقبة بن نافع',
      feedback: 'صحيح! عقبة بن نافع هو الذي اختار موضع القيروان وأطلق كلمته الشهيرة: "يا معشر المسلمين إن هذا موضعكم".'
    }
  },
  {
    id: 'abbasid',
    name: 'الدولة العباسية',
    period: '132 - 656 هـ (750 - 1258 م)',
    center: 'بغداد',
    description: 'العصر الذهبي للعلوم والآداب والترجمة. تأسس فيه دار الحكمة ونشأ فيه كبار الأئمة وأئمة المذاهب الفقهية والحديثية وتطور الطب والفلك.',
    color: '#3b82f6',
    trivia: 'هل تعلم أن بيت الحكمة ببغداد كان يحتوي على نظام فهارس متطور شبيه بنظم المكتبات الحديثة لتصنيف المعارف.',
    points: [
      { name: 'بغداد', desc: 'مدينة السلام وعاصمة العلم الكبرى وحاضرة دار الحكمة الكبرى.', x: 520, y: 110 },
      { name: 'نيسابور', desc: 'أحد أكبر حواضر العلم في خراسان، نشأ فيها كبار المحدثين كالإمام مسلم.', x: 610, y: 100 },
      { name: 'بخارى', desc: 'موطن الإمام البخاري رائد تدوين الحديث النبوي الشريف وصاحب الصحيح.', x: 640, y: 60 }
    ],
    milestones: [
      { year: '145 هـ', title: 'بناء بغداد', text: 'أسسها الخليفة أبو جعفر المنصور لتكون عاصمة الخلافة الجديدة.' },
      { year: '250 هـ', title: 'عصر التدوين الذهبي', text: 'تصنيف أمهات الكتب الستة للحديث النبوي وعلى رأسها صحيح البخاري وصحيح مسلم.' }
    ],
    travelers: [
      {
        name: 'رحلة الإمام البخاري لطلب الحديث',
        path: 'بخارى ➔ نيسابور ➔ بغداد ➔ مكة',
        routePoints: [
          { x: 640, y: 60 },
          { x: 610, y: 100 },
          { x: 520, y: 110 },
          { x: 490, y: 220 }
        ],
        desc: 'رحلة الإمام البخاري العلمية الطويلة لطلب الحديث الشريف ومقابلة الشيوخ وتصنيف صحيحه.'
      }
    ],
    landmarks: [
      { title: 'دار الحكمة ببغداد', city: 'بغداد', desc: 'أكبر مركز علمي وترجمي في القرون الوسطى، كانت منارة للعلوم العقلية والنقلية.' },
      { title: 'مدرسة المستنصرية', city: 'بغداد', desc: 'أول جامعة تدرس فيها المذاهب الفقهية الأربعة في بناء وصرح تعليمي موحد.' }
    ],
    quiz: {
      question: 'ما هو المركز العلمي الشهير الذي ازدهر في بغداد وجمع ترجمة أمهات كتب الفلسفة والطب والفلك والترجمة؟',
      options: ['مدرسة المستنصرية', 'بيت الحكمة', 'الجامع الأزهر', 'جامع عقبة'],
      correctAnswer: 'بيت الحكمة',
      feedback: 'أحسنت! بيت الحكمة في بغداد كان رائد الحركة العلمية والترجمة العالمية في العصر العباسي.'
    }
  }
];

const simulatedBattles = [
  {
    title: 'غزوة تبوك (9 هـ)',
    details: [
      { day: 'اليوم 1', log: 'تجهيز جيش العسرة وحث الصحابة على الإنفاق بتقديم عثمان بن عفان وأبو بكر الصديق لصدقات عظيمة.' },
      { day: 'اليوم 8', log: 'انطلاق المسلمين بـ 30,000 مقاتل باتجاه الشام في حرارة الصيف الشديدة.' },
      { day: 'اليوم 15', log: 'الوصول إلى تبوك، استعراض القوات، مصالحة ملوك أيلة ودومة الجندل دون قتال وتأمين حدود الدولة.' }
    ]
  },
  {
    title: 'فتح مكة (8 هـ)',
    details: [
      { day: 'اليوم 1', log: 'تحرك الجيش الإسلامي من المدينة المنورة في 10 رمضان بكتمان شديد لعنصر المفاجأة.' },
      { day: 'اليوم 9', log: 'الوصول لمر الظهران وإشعال النيران في المعسكر لإرهاب قريش، وإسلام أبي سفيان.' },
      { day: 'اليوم 10', log: 'دخول مكة من أربعة محاور بسلام وتطهير الكعبة من الأصنام وإعلان العفو العام: "اذهبوا فأنتم الطلقاء".' }
    ]
  }
];

export default function AtharAtlasPage() {
  const [selectedEraIndex, setSelectedEraIndex] = useState(0);
  const [hoveredPoint, setHoveredPoint] = useState<any>(null);
  const [selectedPoint, setSelectedPoint] = useState<any>(null);
  const [activeTravelRoute, setActiveTravelRoute] = useState<any>(null);
  const [sliderVal, setSliderVal] = useState([0]);

  // Quiz interactive state
  const [userScore, setUserScore] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<string | null>(null);

  // Overlay state: compare other route
  const [showOverlapRoute, setShowOverlapRoute] = useState(false);
  const [activeConquestOverlay, setActiveConquestOverlay] = useState<'none' | 'sham' | 'andalus'>('none');

  // Conquest simulation state
  const [selectedBattleIndex, setSelectedBattleIndex] = useState(0);
  const [battleStep, setBattleStep] = useState<number>(-1);

  const currentEra = historicalEras[selectedEraIndex];

  const handleSliderChange = (val: number[]) => {
    setSliderVal(val);
    const eraIdx = Math.min(Math.floor((val[0] / 100) * historicalEras.length), historicalEras.length - 1);
    setSelectedEraIndex(eraIdx);
    setActiveTravelRoute(null);
    setSelectedPoint(null);
    setQuizAnswered(false);
    setSelectedQuizAnswer(null);
  };

  const handleRouteSelect = (route: any) => {
    setActiveTravelRoute(activeTravelRoute?.name === route.name ? null : route);
    setSelectedPoint(null);
  };

  const handleQuizSubmit = (opt: string) => {
    if (quizAnswered) return;
    setSelectedQuizAnswer(opt);
    setQuizAnswered(true);
    if (opt === currentEra.quiz.correctAnswer) {
      setUserScore((prev) => prev + 15);
    }
  };

  const routePathString = useMemo(() => {
    if (!activeTravelRoute) return '';
    return activeTravelRoute.routePoints
      .map((p: any, idx: number) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ');
  }, [activeTravelRoute]);

  // Simulated overlap route: Ibn Battuta baseline path
  const overlapPathString = 'M 200 80 L 320 120 L 440 150 L 500 190';

  const selectedBattle = simulatedBattles[selectedBattleIndex];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Title */}
      <div className="text-center mb-12">
        <HoloBadge className="mb-3">
          <Compass className="h-3.5 w-3.5 text-primary animate-spin-slow" />
          <span>أطلس الحضارة والتاريخ</span>
        </HoloBadge>
        <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-primary/80 mb-4">
          أثَر - أطلس التاريخ والحضارة الإسلامية
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base text-center">
          تصفح جغرافية العالم الإسلامي عبر العصور وتتبع مسارات رحلات كبار الأئمة والعلماء والفتوحات الإسلامية.
        </p>
      </div>

      {/* Trivia Notification Box */}
      <div className="bg-primary/10 border border-primary/20 p-4 rounded-3xl mb-8 flex items-center gap-3 text-right">
        <Sparkles className="h-5 w-5 text-primary shrink-0 animate-pulse" />
        <div className="flex-1">
          <span className="text-[10px] text-primary font-bold">إضاءة تاريخية خاطفة:</span>
          <p className="text-xs text-white/90 mt-0.5">{currentEra.trivia}</p>
        </div>
      </div>

      {/* Era Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {historicalEras.map((era, index) => (
          <button
            key={era.id}
            onClick={() => {
              setSelectedEraIndex(index);
              setSliderVal([Math.round((index / (historicalEras.length - 1)) * 100)]);
              setActiveTravelRoute(null);
              setSelectedPoint(null);
              setQuizAnswered(false);
              setSelectedQuizAnswer(null);
            }}
            className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between ${
              selectedEraIndex === index
                ? 'bg-zinc-900 border-primary shadow-lg shadow-primary/10'
                : 'bg-zinc-950/40 border-white/10 hover:bg-white/5'
            }`}
          >
            <span
              className="text-xs font-black px-2 py-0.5 rounded w-max mb-2"
              style={{ backgroundColor: `${era.color}20`, color: era.color }}
            >
              {era.period}
            </span>
            <h3 className="font-bold text-white text-base">{era.name}</h3>
            <span className="text-xs text-muted-foreground mt-1">المركز: {era.center}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Map */}
        <div className="lg:col-span-2 space-y-6">
          <GlowCard className="bg-zinc-950/40 backdrop-blur-xl border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-4 left-4 z-10 flex gap-2 flex-wrap max-w-full">
              {/* Comparator Toggle */}
              <label className="text-xs bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-muted-foreground flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOverlapRoute}
                  onChange={(e) => setShowOverlapRoute(e.target.checked)}
                  className="rounded border-white/20 bg-transparent text-primary focus:ring-0"
                />
                <Eye className="h-3.5 w-3.5" />
                <span>مقارنة مسار ابن بطوطة 🗺️</span>
              </label>

              {/* Regional Conquest select */}
              <select
                value={activeConquestOverlay}
                onChange={(e: any) => setActiveConquestOverlay(e.target.value)}
                className="text-xs bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-primary cursor-pointer focus:outline-none"
              >
                <option value="none" className="bg-zinc-950 text-white">تراكب الفتوحات: لا يوجد</option>
                <option value="sham" className="bg-zinc-950 text-white">فتوحات الشام ⚔️</option>
                <option value="andalus" className="bg-zinc-950 text-white">فتح الأندلس ⚔️</option>
              </select>

              <span className="text-xs bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-white flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: currentEra.color }} />
                <span>عرض جغرافيا: {currentEra.name}</span>
              </span>
            </div>

            {/* Interactive Map Visual */}
            <div className="relative h-[400px] w-full bg-zinc-950/80 border border-white/5 rounded-3xl overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

              <svg className="w-full h-full opacity-35 absolute inset-0" viewBox="0 0 800 300" fill="none">
                <path
                  d="M100 80 C 130 90, 180 80, 200 90 C 230 100, 280 80, 310 110 C 340 140, 320 180, 350 200 M100 130 C 120 150, 160 160, 180 180 C 200 200, 250 230, 300 240 M450 100"
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="2"
                  strokeDasharray="5 5"
                />

                <motion.path
                  key={currentEra.id}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1 }}
                  d={
                    currentEra.id === 'rashidun'
                      ? 'M420 100 Q 480 130, 560 130 T 560 210 Q 500 230, 450 200 Z'
                      : currentEra.id === 'umayyad'
                      ? 'M160 70 C 220 60, 320 90, 350 110 C 420 130, 520 100, 600 80 C 680 60, 720 120, 680 160 Z'
                      : 'M300 100 C 350 110, 420 80, 520 70 C 620 60, 680 80, 660 130 Z'
                  }
                  fill={`${currentEra.color}08`}
                  stroke={currentEra.color}
                  strokeWidth="2.5"
                  className="opacity-70"
                />
              </svg>

              {activeTravelRoute && (
                <svg className="w-full h-full absolute inset-0 z-10 pointer-events-none" viewBox="0 0 800 300" fill="none">
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: 'easeInOut' }}
                    d={routePathString}
                    stroke="hsl(var(--primary))"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="8 6"
                  />
                </svg>
              )}

              {/* Show overlap path comparisons */}
              {showOverlapRoute && (
                <svg className="w-full h-full absolute inset-0 z-10 pointer-events-none" viewBox="0 0 800 300" fill="none">
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    d={overlapPathString}
                    stroke="#ec4899"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray="4 4"
                  />
                </svg>
              )}

              {activeConquestOverlay === 'sham' && (
                <svg className="w-full h-full absolute inset-0 z-10 pointer-events-none" viewBox="0 0 800 300" fill="none">
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    d="M 500 190 L 480 150 L 470 110"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="6 4"
                  />
                  <text x="490" y="140" fill="#10b981" className="text-[9px] font-bold">مسار معركة اليرموك</text>
                </svg>
              )}

              {activeConquestOverlay === 'andalus' && (
                <svg className="w-full h-full absolute inset-0 z-10 pointer-events-none" viewBox="0 0 800 300" fill="none">
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    d="M 320 120 L 240 130 L 200 80"
                    stroke="#eab308"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="6 4"
                  />
                  <text x="240" y="105" fill="#eab308" className="text-[9px] font-bold">فتح طارق بن زياد</text>
                </svg>
              )}

              {currentEra.points.map((point) => (
                <div
                  key={point.name}
                  style={{
                    position: 'absolute',
                    left: `${(point.x / 800) * 100}%`,
                    top: `${(point.y / 300) * 100}%`
                  }}
                  className="transform -translate-x-1/2 -translate-y-1/2 z-20"
                >
                  <button
                    onMouseEnter={() => setHoveredPoint(point)}
                    onMouseLeave={() => setHoveredPoint(null)}
                    onClick={() => {
                      setSelectedPoint(point);
                      setActiveTravelRoute(null);
                    }}
                    className={`relative flex items-center justify-center h-8 w-8 rounded-full bg-zinc-900 border transition-all hover:scale-125 focus:outline-none ${
                      selectedPoint?.name === point.name ? 'border-primary ring-2 ring-primary/40' : ''
                    }`}
                    style={{ borderColor: currentEra.color }}
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full animate-ping absolute opacity-70"
                      style={{ backgroundColor: currentEra.color }}
                    />
                    <MapPin className="h-4 w-4" style={{ color: selectedPoint?.name === point.name ? 'hsl(var(--primary))' : currentEra.color }} />
                  </button>
                </div>
              ))}

              <AnimatePresence>
                {hoveredPoint && !selectedPoint && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-4 left-4 right-4 bg-zinc-950/90 border border-white/10 backdrop-blur-md p-4 rounded-2xl shadow-xl flex items-start gap-3 text-right z-30"
                  >
                    <div className="p-2 rounded-xl bg-white/5">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{hoveredPoint.name}</h4>
                      <p className="text-muted-foreground text-xs mt-1 leading-relaxed">{hoveredPoint.desc}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {selectedPoint && (
                <div className="absolute inset-x-4 bottom-4 bg-zinc-950/95 border border-primary/30 p-4 rounded-2xl shadow-2xl flex justify-between items-start gap-4 text-right z-30 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-black text-white text-base">{selectedPoint.name}</h4>
                      <p className="text-muted-foreground text-xs mt-1 leading-relaxed">{selectedPoint.desc}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPoint(null)}
                    className="text-xs bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-xl text-muted-foreground border border-white/10"
                  >
                    إغلاق
                  </button>
                </div>
              )}
            </div>

            {/* Travel route display */}
            <div className="mt-6 p-4 bg-white/5 border border-white/5 rounded-3xl space-y-3">
              <h4 className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 justify-start">
                <Footprints className="h-4 w-4 text-primary" />
                <span>الرحلات الجغرافية ومسارات الفتوحات (اختر لعرض المسار المتحرك)</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {currentEra.travelers.map((tr) => (
                  <button
                    key={tr.name}
                    onClick={() => handleRouteSelect(tr)}
                    className={`text-xs px-3.5 py-2 rounded-xl border transition-all flex items-center gap-2 ${
                      activeTravelRoute?.name === tr.name
                        ? 'bg-primary text-black font-black border-primary shadow-lg shadow-primary/20'
                        : 'bg-zinc-900 border-white/5 text-muted-foreground hover:bg-white/5'
                    }`}
                  >
                    <Footprints className="h-3.5 w-3.5" />
                    <span>{tr.name}</span>
                  </button>
                ))}
              </div>
              {activeTravelRoute && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-3 bg-black/40 border border-white/5 rounded-2xl text-xs text-muted-foreground leading-relaxed text-right space-y-1"
                >
                  <div className="font-bold text-white">المسار: {activeTravelRoute.path}</div>
                  <p>{activeTravelRoute.desc}</p>
                </motion.div>
              )}
            </div>

            {/* Timeline Slider */}
            <div className="mt-6 space-y-3">
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>نهاية العصور الزاهرة (1400 هـ)</span>
                <span>بداية التاريخ الهجري (1 هـ)</span>
              </div>
              <Slider value={sliderVal} onValueChange={handleSliderChange} max={100} step={5} className="py-2" />
            </div>
          </GlowCard>

          {/* Conquest / Battle Simulation Console */}
          <Card className="bg-zinc-950/40 backdrop-blur-xl border-white/10 rounded-3xl p-6 shadow-2xl text-right">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Swords className="h-5 w-5 text-primary" />
              <span>لوحة محاكاة الفتوحات والغزوات الإسلامية</span>
            </h3>
            <p className="text-xs text-muted-foreground mb-6">تتبع تفاصيل التحركات العسكرية يومياً من خلال محاكي الأحداث اللوجستي.</p>

            <div className="flex gap-2 mb-4">
              {simulatedBattles.map((b, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedBattleIndex(idx);
                    setBattleStep(-1);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    selectedBattleIndex === idx
                      ? 'bg-primary/20 border-primary text-primary'
                      : 'bg-white/5 border-transparent text-muted-foreground hover:bg-white/10'
                  }`}
                >
                  {b.title}
                </button>
              ))}
            </div>

            <div className="bg-black/40 border border-white/5 p-4 rounded-2xl space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-muted-foreground">مرحلة المحاكاة</span>
                <Button
                  onClick={() => {
                    if (battleStep < selectedBattle.details.length - 1) {
                      setBattleStep(prev => prev + 1);
                    } else {
                      setBattleStep(-1);
                    }
                  }}
                  className="rounded-xl bg-primary hover:bg-primary/90 text-black font-bold text-xs"
                >
                  <Play className="h-3 w-3 me-1" />
                  {battleStep === -1 ? 'بدء المحاكاة' : battleStep === selectedBattle.details.length - 1 ? 'إعادة تشغيل' : 'اليوم التالي'}
                </Button>
              </div>

              <div className="space-y-2 min-h-[80px]">
                {battleStep === -1 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">انقر على زر البدء لتشغيل المسار الزمني للغزوة.</p>
                ) : (
                  selectedBattle.details.slice(0, battleStep + 1).map((det, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white/5 p-2.5 rounded-xl border border-white/5 text-xs flex justify-between gap-4"
                    >
                      <span className="font-bold text-primary shrink-0">{det.day}</span>
                      <p className="text-muted-foreground text-right flex-1">{det.log}</p>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </Card>

          {/* Historical Architecture/Landmarks Gallery */}
          <Card className="bg-zinc-950/40 backdrop-blur-xl border-white/10 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span>معالم وشواهد العمارة الخالدة في {currentEra.name}</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentEra.landmarks.map((land, idx) => (
                <div key={idx} className="bg-white/5 border border-white/5 p-4 rounded-2xl text-right space-y-2 hover:border-primary/40 transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] bg-primary/10 text-primary px-2.5 py-0.5 rounded font-bold">{land.city}</span>
                    <span className="text-[9px] text-muted-foreground">معلم تاريخي</span>
                  </div>
                  <h4 className="font-bold text-sm text-white">{land.title}</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{land.desc}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Side: Timeline & Quiz */}
        <div className="lg:col-span-1 space-y-6">
          {/* Timeline Milestones */}
          <Card className="bg-zinc-950/40 backdrop-blur-xl border-white/10 rounded-3xl overflow-hidden shadow-2xl h-max">
            <CardHeader className="border-b border-white/10 pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <span>جدول الأحداث والمعالم</span>
              </CardTitle>
              <CardDescription>أبرز المحطات في عهد {currentEra.name}</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6 max-h-[300px] overflow-y-auto">
              <p className="text-xs text-muted-foreground leading-relaxed text-right">{currentEra.description}</p>
              <div className="relative border-r border-white/10 pr-4 space-y-6 mr-2">
                {currentEra.milestones.map((m, idx) => (
                  <div key={idx} className="relative text-right">
                    <span
                      className="absolute -right-[21px] top-1 h-3.5 w-3.5 rounded-full border-2 border-zinc-950"
                      style={{ backgroundColor: currentEra.color }}
                    />
                    <div className="space-y-1">
                      <span className="text-[10px] font-black opacity-80 px-2 py-0.5 rounded" style={{ backgroundColor: `${currentEra.color}20`, color: currentEra.color }}>
                        {m.year}
                      </span>
                      <h4 className="font-bold text-white text-sm mt-1">{m.title}</h4>
                      <p className="text-muted-foreground text-xs leading-relaxed mt-0.5">{m.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Interactive Historical Geography Quiz */}
          <Card className="bg-zinc-950/40 backdrop-blur-xl border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
            <NeonBorder color="hsl(var(--primary) / 0.3)">
              <CardHeader className="pb-2 border-b border-white/10">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base font-bold flex items-center gap-2 text-white">
                    <Award className="h-4.5 w-4.5 text-primary" />
                    <span>تحدي الجغرافيا التاريخية</span>
                  </CardTitle>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                    النقاط: {userScore}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="text-xs text-muted-foreground leading-relaxed text-right">
                  {currentEra.quiz.question}
                </div>

                <div className="space-y-2">
                  {currentEra.quiz.options.map((opt, i) => {
                    const isSelected = selectedQuizAnswer === opt;
                    const isCorrect = opt === currentEra.quiz.correctAnswer;
                    return (
                      <button
                        key={i}
                        disabled={quizAnswered}
                        onClick={() => handleQuizSubmit(opt)}
                        className={`w-full text-right p-3 rounded-xl border text-xs leading-relaxed transition-all flex items-center justify-between ${
                          quizAnswered
                            ? isCorrect
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                              : isSelected
                              ? 'bg-red-500/20 border-red-500 text-red-300'
                              : 'bg-white/5 border-transparent opacity-60'
                            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-primary/50'
                        }`}
                      >
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {quizAnswered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3.5 rounded-xl border text-xs leading-relaxed flex items-start gap-2 text-right ${
                      selectedQuizAnswer === currentEra.quiz.correctAnswer
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                        : 'bg-red-500/10 border-red-500/20 text-red-300'
                    }`}
                  >
                    {selectedQuizAnswer === currentEra.quiz.correctAnswer ? (
                      <CheckCircle className="h-4.5 w-4.5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-4.5 w-4.5 text-red-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h5 className="font-bold">{selectedQuizAnswer === currentEra.quiz.correctAnswer ? 'إجابة صحيحة (+15 نقطة)!' : 'إجابة خاطئة!'}</h5>
                      <p className="mt-1 leading-relaxed">{currentEra.quiz.feedback}</p>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </NeonBorder>
          </Card>
        </div>
      </div>
    </div>
  );
}
