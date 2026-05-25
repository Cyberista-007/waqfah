'use client';
import Link from "next/link";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Compass, Award, Star, Book, ChevronRight, HelpCircle, 
  Map, Lightbulb, GraduationCap, CheckCircle, Info, ExternalLink, ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScienceSubfield {
  name: string;
  description: string;
  recommendedTexts: { title: string; author: string; level: 'مبتدئ' | 'متوسط' | 'متقدم' }[];
}

interface ScienceBranch {
  id: string;
  title: string;
  arabicName: string;
  icon: string;
  color: string;
  shadowColor: string;
  summary: string;
  importance: string;
  hadithProof: string;
  subfields: ScienceSubfield[];
  coursesLink: string;
}

const scienceBranches: ScienceBranch[] = [
  {
    id: 'aqeedah',
    title: 'Aqeedah',
    arabicName: 'علم العقيدة والتوحيد',
    icon: '🕌',
    color: 'from-blue-500 to-indigo-600',
    shadowColor: 'rgba(59,130,246,0.3)',
    summary: 'أساس الدين وأصل الأعمال، ويتناول معرفة الله بألوهيته وربوبيته وأسمائه وصفاته، وأركان الإيمان الستة.',
    importance: 'هو أهم العلوم الشرعية على الإطلاق، وصحة المعتقد شرط لقبول الأعمال والنجاة في الآخرة.',
    hadithProof: 'قال ﷺ: "بني الإسلام على خمس: شهادة أن لا إله إلا الله وأن محمداً رسول الله..." [متفق عليه]',
    coursesLink: '/pathways?category=aqeedah',
    subfields: [
      {
        name: 'توحيد الربوبية والألوهية',
        description: 'إفراد الله بالخلق والرزق والتدبير، وإفراده بجميع أنواع العبادة كالدعاء والنذر والتوكل.',
        recommendedTexts: [
          { title: 'الأصول الثلاثة وأدلتها', author: 'محمد بن عبد الوهاب', level: 'مبتدئ' },
          { title: 'كتاب التوحيد الذي هو حق الله على العبيد', author: 'محمد بن عبد الوهاب', level: 'متوسط' },
          { title: 'شرح العقيدة الطحاوية', author: 'ابن أبي العز الحنفي', level: 'متقدم' }
        ]
      },
      {
        name: 'توحيد الأسماء والصفات',
        description: 'إثبات ما أثبته الله لنفسه وما أثبته له رسوله من الأسماء والصفات من غير تحريف ولا تعطيل ولا تكييف ولا تمثيل.',
        recommendedTexts: [
          { title: 'العقيدة الواسطية', author: 'ابن تيمية', level: 'مبتدئ' },
          { title: 'القواعد المثلى في صفات الله وأسمائه الحسنى', author: 'ابن عثيمين', level: 'متوسط' },
          { title: 'الرسالة التدمرية', author: 'ابن تيمية', level: 'متقدم' }
        ]
      },
      {
        name: 'الفرق والمذاهب المعاصرة',
        description: 'دراسة الفرق الإسلامية والرد العلمي على الشبهات والمذاهب الفكرية المعاصرة.',
        recommendedTexts: [
          { title: 'تطهير الاعتقاد عن درن الإلحاد', author: 'الصنعاني', level: 'مبتدئ' },
          { title: 'الفرق بين الفرق', author: 'عبد القاهر البغدادي', level: 'متقدم' }
        ]
      }
    ]
  },
  {
    id: 'hadith',
    title: 'Hadith',
    arabicName: 'علم الحديث والسنة',
    icon: '📜',
    color: 'from-amber-500 to-orange-650',
    shadowColor: 'rgba(245,158,11,0.3)',
    summary: 'دراسة كلام النبي ﷺ وأفعاله وتقريراته وصفاته الخَلقية والخُلقية، وقواعد معرفة المقبول والمردود من المرويات.',
    importance: 'السنة هي المصدر الثاني للتشريع ومبينة ومفسرة للقرآن الكريم، وحفظها حفظ للدين.',
    hadithProof: 'قال ﷺ: "نضّر الله امرأً سمع مقالتي فوعاها وحفظها وبلغها..." [رواه الترمذي]',
    coursesLink: '/hadith',
    subfields: [
      {
        name: 'مصطلح الحديث (رواية ودراية)',
        description: 'القواعد المعرفة بأحوال السند والمتن لمعرفة الحديث الصحيح والحسن والضعيف وكيفية قبول الروايات.',
        recommendedTexts: [
          { title: 'المنظومة البيقونية', author: 'طه بن محمد البيقوني', level: 'مبتدئ' },
          { title: 'نخبة الفكر في مصطلح أهل الأثر', author: 'ابن حجر العسقلاني', level: 'متوسط' },
          { title: 'مقدمة ابن الصلاح', author: 'ابن الصلاح الشهرزوري', level: 'متقدم' }
        ]
      },
      {
        name: 'شروح متون الحديث العامة',
        description: 'دراسة وفهم معاني ودلالات الأحاديث النبوية الفقهية والتربوية.',
        recommendedTexts: [
          { title: 'الأربعون النووية', author: 'يحيى بن شرف النووي', level: 'مبتدئ' },
          { title: 'عمدة الأحكام من كلام خير الأنام', author: 'عبد الغني المقدسي', level: 'متوسط' },
          { title: 'بلوغ المرام من أدلة الأحكام', author: 'ابن حجر العسقلاني', level: 'متقدم' }
        ]
      },
      {
        name: 'علم الجرح والتعديل والعلل',
        description: 'البحث في أحوال رواة الحديث من حيث القبول والرد، والبحث في العيوب الخفية القادحة في الحديث.',
        recommendedTexts: [
          { title: 'الرفع والتكميل في الجرح والتعديل', author: 'اللكنوي', level: 'متوسط' },
          { title: 'علل الترمذي الكبرى', author: 'أبو عيسى الترمذي', level: 'متقدم' }
        ]
      }
    ]
  },
  {
    id: 'fiqh',
    title: 'Fiqh',
    arabicName: 'علم الفقه وأصوله',
    icon: '⚖️',
    color: 'from-emerald-500 to-teal-650',
    shadowColor: 'rgba(16,185,129,0.3)',
    summary: 'معرفة الأحكام الشرعية العملية المكتسبة من أدلتها التفصيلية (كأحكام العبادات والمعاملات)، وأصول الاستنباط.',
    importance: 'ينظم حياة المسلم اليومية من طهارة وصلاة ومعاملات مالية وعلاقات أسرية وفق مراد الله.',
    hadithProof: 'قال ﷺ: "من يرد الله به خيراً يفقهه في الدين" [متفق عليه]',
    coursesLink: '/pathways?category=fiqh',
    subfields: [
      {
        name: 'فقه العبادات المعاملات',
        description: 'الأحكام العملية المتعلقة بالطهارة، الصلاة، الزكاة، الصوم، الحج، وكذلك أحكام البيوع والنكاح والجنايات.',
        recommendedTexts: [
          { title: 'منهج السالكين وتوضيح الفقه في الدين', author: 'عبد الرحمن السعدي', level: 'مبتدئ' },
          { title: 'زاد المستقنع في اختصار المقنع', author: 'شرف الدين الحجاوي', level: 'متوسط' },
          { title: 'المغني في فقه الإمام أحمد', author: 'ابن قدامة المقدسي', level: 'متقدم' }
        ]
      },
      {
        name: 'أصول الفقه',
        description: 'القواعد والبحوث التي يتوصل بها إلى استنباط الأحكام الشرعية العملية من أدلتها التفصيلية.',
        recommendedTexts: [
          { title: 'الورقات في أصول الفقه', author: 'أبو المعالي الجويني', level: 'مبتدئ' },
          { title: 'روضة الناظر وجنة المناظر', author: 'ابن قدامة المقدسي', level: 'متوسط' },
          { title: 'الموافقات في أصول الشريعة', author: 'الشاطبي', level: 'متقدم' }
        ]
      },
      {
        name: 'القواعد الفقهية',
        description: 'الأحكام الكلية والضوابط العامة التي تندرج تحتها جزئيات فقهية متعددة من أبواب مختلفة.',
        recommendedTexts: [
          { title: 'منظومة القواعد الفقهية', author: 'عبد الرحمن السعدي', level: 'مبتدئ' },
          { title: 'الأشباه والنظائر', author: 'جلال الدين السيوطي', level: 'متقدم' }
        ]
      }
    ]
  },
  {
    id: 'tafsir',
    title: 'Tafsir',
    arabicName: 'علم التفسير وعلوم القرآن',
    icon: '📖',
    color: 'from-sky-500 to-cyan-600',
    shadowColor: 'rgba(14,165,233,0.3)',
    summary: 'فهم كتاب الله المنزل على نبيه ﷺ، وبيان معانيه واستخراج أحكامه وحكمه، ودراسة أحوال نزول القرآن ورسمه وتلاوته.',
    importance: 'يتعلق بأشرف الكتب كلام الله سبحانه، وبه يتعلم العبد مراد ربه ليعبده على بصيرة ويستضيء بهداه.',
    hadithProof: 'قال ﷺ: "خيركم من تعلم القرآن وعلمه" [رواه البخاري]',
    coursesLink: '/quran',
    subfields: [
      {
        name: 'أصول وقواعد التفسير',
        description: 'القواعد والمناهج العلمية التي تضبط تفسير القرآن وتصون المفسر من الخطأ والقول بلا علم.',
        recommendedTexts: [
          { title: 'مقدمة في أصول التفسير', author: 'ابن تيمية', level: 'مبتدئ' },
          { title: 'قواعد التفسير: جمعاً ودراسة', author: 'خالد السبت', level: 'متقدم' }
        ]
      },
      {
        name: 'التفسير الأثري والتحليلي',
        description: 'تفسير القرآن بالقرآن، ثم بالسنة، ثم بأقوال الصحابة والتابعين، وتحليل الألفاظ ودلالاتها.',
        recommendedTexts: [
          { title: 'تيسير الكريم الرحمن في تفسير كلام المنان', author: 'عبد الرحمن السعدي', level: 'مبتدئ' },
          { title: 'تفسير القرآن العظيم', author: 'ابن كثير الدمشقي', level: 'متوسط' },
          { title: 'جامع البيان عن تأويل آي القرآن', author: 'ابن جرير الطبري', level: 'متقدم' }
        ]
      },
      {
        name: 'علوم القرآن والتجويد',
        description: 'مباحث نزول القرآن، كتابته، المكي والمدني، الإعجاز، أحكام التلاوة والتجويد، والقراءات المتواترة.',
        recommendedTexts: [
          { title: 'تحفة الأطفال في تجويد القرآن', author: 'الجمزوري', level: 'مبتدئ' },
          { title: 'الإتقان في علوم القرآن', author: 'جلال الدين السيوطي', level: 'متقدم' }
        ]
      }
    ]
  },
  {
    id: 'arabic',
    title: 'Arabic',
    arabicName: 'علوم اللغة العربية وآدابها',
    icon: '✍️',
    color: 'from-rose-500 to-red-600',
    shadowColor: 'rgba(244,63,94,0.3)',
    summary: 'دراسة لغة القرآن الكريم وقواعدها (نحو، صرف، وبلاغة) لحماية اللسان من اللحن وفهم أسرار النظم القرآني.',
    importance: 'هي مفتاح فهم القرآن الكريم والسنة المطهرة؛ فمن لا يعرف لغة العرب يعسر عليه فهم نصوص الوحي دقيقاً.',
    hadithProof: 'قال عمر بن الخطاب رضي الله عنه: "تعلموا العربية فإنها من دينكم، وتعلموا الفرائض فإنها من دينكم".',
    coursesLink: '/pathways?category=arabic',
    subfields: [
      {
        name: 'النحو والصرف',
        description: 'قواعد إعراب الكلمات وبنائها وضبط أواخر الكلم، وقواعد صياغة الكلمات وبنيتها الصرفية.',
        recommendedTexts: [
          { title: 'الآجرومية', author: 'ابن آجروم الصنهاجي', level: 'مبتدئ' },
          { title: 'قطر الندى وبل الصدى', author: 'ابن هشام الأنصاري', level: 'متوسط' },
          { title: 'ألفية ابن مالك بشرح ابن عقيل', author: 'ابن عقيل العقيلي', level: 'متقدم' }
        ]
      },
      {
        name: 'علوم البلاغة الثلاثة',
        description: 'المعاني (صحة النظم والتراكيب)، البيان (طرائق التعبير من تشبيه ومجاز)، والبديع (محسنات الكلام الفنية).',
        recommendedTexts: [
          { title: 'مئة المعاني والبيان', author: 'ابن الشحنة', level: 'مبتدئ' },
          { title: 'البلاغة الواضحة', author: 'علي الجارم ومصطفى أمين', level: 'متوسط' },
          { title: 'دلائل الإعجاز وأسرار البلاغة', author: 'عبد القاهر الجرجاني', level: 'متقدم' }
        ]
      }
    ]
  }
];

export default function SciencesTreePage() {
  const [selectedBranch, setSelectedBranch] = useState<ScienceBranch | null>(null);
  const [userProgress, setUserProgress] = useState<Record<string, boolean>>({});

  const toggleTextProgress = (textKey: string) => {
    setUserProgress(prev => ({
      ...prev,
      [textKey]: !prev[textKey]
    }));
  };

  const calculateBranchProgress = (branch: ScienceBranch) => {
    let total = 0;
    let completed = 0;
    branch.subfields.forEach(sub => {
      sub.recommendedTexts.forEach(text => {
        total++;
        if (userProgress[`${branch.id}-${sub.name}-${text.title}`]) {
          completed++;
        }
      });
    });
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  return (
    <div className="min-h-screen text-foreground relative py-12 px-4 md:px-8 max-w-6xl mx-auto" dir="rtl">
      
      {/* Decorative floating grids */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] right-[10%] w-[350px] h-[350px] rounded-full bg-primary/10 blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-[15%] left-[5%] w-[400px] h-[400px] rounded-full bg-emerald-500/5 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="text-center mb-16 relative">
        <div className="inline-flex p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 text-primary mb-4 shadow-xl">
          <Compass className="h-10 w-10 animate-spin-slow text-amber-500" />
        </div>
        <h1 className="text-4xl md:text-6xl font-black font-headline text-white mb-4">
          شجرة العلوم الشرعية التفاعلية
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed font-bold">
          خارطة طريق بصرية للعلوم الإسلامية الأساسية، تتيح لك فهم ترابط العلوم، وتحديد أولويات دراستك مع المتون الموصى بها.
        </p>
      </header>

      {/* Interactive visual canvas representation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
        
        {/* Visual Map Nodes */}
        <div className="lg:col-span-7 space-y-6">
          <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
            <Map className="h-5 w-5 text-amber-500" /> اختر أحد العلوم الشرعية لاستكشافه:
          </h3>
          
          <div className="space-y-4">
            {scienceBranches.map((branch) => {
              const progress = calculateBranchProgress(branch);
              const isSelected = selectedBranch?.id === branch.id;
              
              return (
                <motion.div
                  key={branch.id}
                  whileHover={{ scale: 1.02, x: -4 }}
                  onClick={() => setSelectedBranch(branch)}
                  className={cn(
                    "p-6 rounded-3xl border cursor-pointer transition-all duration-300 relative overflow-hidden flex items-center justify-between group",
                    isSelected 
                      ? "border-primary bg-primary/[0.04] shadow-2xl" 
                      : "border-white/5 bg-white/[0.01] hover:border-white/20 hover:bg-white/[0.02]"
                  )}
                  style={{
                    boxShadow: isSelected ? `0 10px 30px -10px ${branch.shadowColor}` : 'none'
                  }}
                >
                  <div className="flex items-center gap-5 relative z-10">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center text-3xl shadow-lg transition-transform group-hover:scale-110",
                      branch.color
                    )}>
                      {branch.icon}
                    </div>
                    <div className="space-y-1 text-right">
                      <h4 className="text-xl font-black text-white group-hover:text-amber-400 transition-colors">
                        {branch.arabicName}
                      </h4>
                      <p className="text-muted-foreground text-xs font-bold max-w-sm line-clamp-1">
                        {branch.summary}
                      </p>
                    </div>
                  </div>

                  {/* Progress Indicator */}
                  <div className="flex items-center gap-4 relative z-10">
                    {progress > 0 && (
                      <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>{progress}%</span>
                      </div>
                    )}
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-white transition-colors" />
                  </div>

                  {/* Decorative background aura on hover */}
                  <div className={cn(
                    "absolute -right-20 -bottom-20 w-40 h-40 rounded-full blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none bg-gradient-to-br",
                    branch.color
                  )} />
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Science Details Drawer Card */}
        <div className="lg:col-span-5 relative">
          <AnimatePresence mode="wait">
            {selectedBranch ? (
              <motion.div
                key={selectedBranch.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="glass-card rounded-[2.5rem] p-6 md:p-8 border border-white/5 shadow-2xl relative overflow-hidden space-y-6 text-right"
              >
                {/* Accent glow line */}
                <div className={cn(
                  "absolute top-0 right-0 left-0 h-2 bg-gradient-to-r",
                  selectedBranch.color
                )} />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{selectedBranch.icon}</span>
                    <h3 className="text-2xl font-black text-white">{selectedBranch.arabicName}</h3>
                  </div>
                  <span className="text-xs font-bold text-muted-foreground font-mono uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">
                    {selectedBranch.title}
                  </span>
                </div>

                {/* Science Importance Section */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-amber-500 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4" /> أهمية العلم وفضله:
                  </span>
                  <p className="text-muted-foreground text-sm leading-relaxed font-semibold">
                    {selectedBranch.importance}
                  </p>
                </div>

                {/* Hadith Proof Box */}
                <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-4 italic text-white/70 text-xs leading-relaxed">
                  {selectedBranch.hadithProof}
                </div>

                {/* Subfields list & recommendations */}
                <div className="space-y-4 pt-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-primary" /> التقسيمات الداخلية والمتون الموصى بها:
                  </span>

                  <div className="space-y-5">
                    {selectedBranch.subfields.map((sub, i) => (
                      <div key={i} className="space-y-3">
                        <div className="space-y-1">
                          <h5 className="text-sm font-black text-white">{sub.name}</h5>
                          <p className="text-muted-foreground text-[11px] leading-relaxed">
                            {sub.description}
                          </p>
                        </div>

                        {/* Text recommendation blocks */}
                        <div className="grid grid-cols-1 gap-2">
                          {sub.recommendedTexts.map((text, j) => {
                            const textKey = `${selectedBranch.id}-${sub.name}-${text.title}`;
                            const isDone = userProgress[textKey];
                            
                            return (
                              <div
                                key={j}
                                onClick={() => toggleTextProgress(textKey)}
                                className={cn(
                                  "p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors text-right select-none",
                                  isDone 
                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                                    : "bg-white/[0.01] border-white/5 text-white/80 hover:border-white/10"
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={cn(
                                    "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                                    isDone 
                                      ? "bg-emerald-500 border-emerald-500 text-white" 
                                      : "border-white/20 bg-transparent"
                                  )}>
                                    {isDone && <span className="text-[10px]">✓</span>}
                                  </div>
                                  <div className="space-y-0.5">
                                    <span className="text-xs font-bold block">{text.title}</span>
                                    <span className="text-[10px] text-muted-foreground block">{text.author}</span>
                                  </div>
                                </div>
                                <span className={cn(
                                  "text-[10px] font-bold px-2 py-0.5 rounded-full",
                                  text.level === 'مبتدئ' 
                                    ? "bg-blue-500/10 text-blue-400" 
                                    : text.level === 'متوسط' 
                                      ? "bg-amber-500/10 text-amber-400" 
                                      : "bg-red-500/10 text-red-400"
                                )}>
                                  {text.level}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Call-to-action button */}
                <div className="pt-4 flex justify-end">
                  <Link
                    href={selectedBranch.coursesLink}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:opacity-90 transition-opacity"
                  >
                    عرض محاضرات ومسارات هذا العلم <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>

              </motion.div>
            ) : (
              <div className="glass-card rounded-[2.5rem] p-10 border border-white/5 text-center flex flex-col items-center justify-center h-[400px]">
                <Book className="w-16 h-16 text-muted-foreground/30 mb-4 animate-bounce-slow" />
                <h4 className="text-white font-bold text-lg mb-2">اختر علماً للبدء</h4>
                <p className="text-muted-foreground text-xs max-w-xs leading-relaxed mx-auto">
                  قم بالضغط على أي فرع من فروع العلوم الشرعية في القائمة الجانبية لعرض التبويبات والمناهج والكتب الموصى بها.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* Info board regarding Study levels */}
      <footer className="mt-12 text-center text-xs text-muted-foreground leading-relaxed max-w-xl mx-auto space-y-4">
        <div className="flex items-center justify-center gap-4 text-xs font-bold text-muted-foreground border-t border-white/5 pt-6">
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500" /> مبتدئ</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-500" /> متوسط</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /> متقدم</div>
        </div>
        <p>
          تم اختيار هذه الكتب والمتون بناءً على توصيات كبار علماء المسلمين للمنهجية الصحيحة لطلب العلم الشرعي بالتدرج من الأسهل للأعمق.
        </p>
      </footer>

    </div>
  );
}
