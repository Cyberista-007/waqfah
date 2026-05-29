'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useSync } from '@/hooks/useSync';
import { useToast } from '@/hooks/use-toast';
import {
  Shield, Flame, EyeOff, Zap, ShieldAlert, Award, Calendar, Video,
  HelpCircle, BarChart3, Heart, Check, Plus, AlertCircle, RefreshCw,
  ChevronDown, BookOpen, Clock, Activity, MessageSquare, Compass,
  Brain, Moon, Sparkles, Smile, ArrowLeft, ArrowRight, UserCheck, Play,
  CheckCircle2, Info, Share2, Clipboard, Download, HeartHandshake, Eye,
  BookOpenCheck, Volume2, VolumeX, Save, FileText, Calculator, AwardIcon,
  CheckSquare, BarChart, History, Upload, FileJson, RefreshCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ChastityPage() {
  return <ChastityPageContent />;
}

// Interfaces
interface RelapseLog {
  date: string;
  mood: string;
  trigger: string;
  notes: string;
  hour?: number; // 0-23
}

interface ResistedUrgeLog {
  date: string;
  mood: string;
  trigger: string;
  intensity: number; // 1-10
}

interface JournalEntry {
  date: string;
  timestamp: string;
  urgeLevel: number;
  mood: string;
  reflection: string;
}

interface PreventionPlan {
  riskTriggers: string[];
  copingStrategies: string[];
  spiritualAnchors: string[];
  safeContacts: string[];
}

interface QuizResult {
  score: number;
  level: string;
  date: string;
}

// Cinematic Liquid Glass styling tokens
const glassCardClass = "bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-[2.25rem] shadow-[inset_0_1px_2px_rgba(255,255,255,0.15),inset_0_-1px_1px_rgba(255,255,255,0.05),0_15px_35px_rgba(0,0,0,0.5)] transition-all duration-500 ease-out hover:border-emerald-500/25 hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.25),inset_0_-1px_1px_rgba(255,255,255,0.05),0_25px_50px_rgba(16,185,129,0.04)] hover:bg-white/[0.03]";
const glassInputClass = "bg-white/[0.015] backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 focus:bg-white/[0.03] focus:shadow-[0_0_15px_rgba(16,185,129,0.15)] transition-all";
const textGlowStyle = { textShadow: '0 0 20px rgba(16, 185, 129, 0.3)' };

function ChastityPageContent() {
  const { state: globalState, updateState: syncUpdate } = useSync();
  const { toast } = useToast();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'challenge' | 'videos' | 'quiz' | 'prevention' | 'analyzer' | 'faq'>('dashboard');

  // Neuroscience and FAQ sub-tabs
  const [academyTab, setAcademyTab] = useState<'neuro' | 'dopamine' | 'faq' | 'diagnostic' | 'spiritual'>('neuro');
  const [selectedNeuroPart, setSelectedNeuroPart] = useState<'pfc' | 'amygdala' | 'dopamine' | 'pathways'>('pfc');
  const [analyzerSubTab, setAnalyzerSubTab] = useState<'journals' | 'resisted' | 'relapses'>('journals');

  // Dopamine Simulator State
  const [simDopamineLevel, setSimDopamineLevel] = useState(100);
  const [simReceptorsHealth, setSimReceptorsHealth] = useState(100);
  const [simStatusMsg, setSimStatusMsg] = useState('الدماغ في حالة اتزان فطري طبيعي.');
  const [simStatusType, setSimStatusType] = useState<'neutral' | 'healthy' | 'overloaded' | 'healing'>('neutral');

  // Brain Diagnostic State
  const [diagAnswers, setDiagAnswers] = useState<Record<number, number>>({});
  const [showDiagResult, setShowDiagResult] = useState(false);

  // State for Chastity Data (stored in localStorage)
  const [chastityData, setChastityData] = useState<{
    startDate: string | null;
    bestStreak: number;
    relapsesLog: RelapseLog[];
    watchedVideos: string[];
    gazeLowerings: number;
    lastGazeResetDate: string;
    completedDays: number[];
    quizResult: QuizResult | null;
    quizHistory: QuizResult[];
    habitChecklist: Record<string, boolean>;
    lastHabitResetDate: string;
    journalLogs: JournalEntry[];
    preventionPlan: PreventionPlan | null;
    lastJournalDate: string;
    letterToSelf: string;
    wastedHoursPerWeek: number;
    resistedUrgesLog: ResistedUrgeLog[];
  }>({
    startDate: null,
    bestStreak: 0,
    relapsesLog: [],
    watchedVideos: [],
    gazeLowerings: 0,
    lastGazeResetDate: '',
    completedDays: [],
    quizResult: null,
    quizHistory: [],
    habitChecklist: {
      blockSites: false,
      noPhoneInBed: false,
      sports: false,
      adhkar: false,
      quranReading: false,
      goodCompany: false,
    },
    lastHabitResetDate: '',
    journalLogs: [],
    preventionPlan: null,
    lastJournalDate: '',
    letterToSelf: '',
    wastedHoursPerWeek: 7,
    resistedUrgesLog: [],
  });

  const [isClient, setIsClient] = useState(false);
  const [showRelapseModal, setShowRelapseModal] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showUrgeModal, setShowUrgeModal] = useState(false);
  const [showResistModal, setShowResistModal] = useState(false);

  // Resisted Urge Form State
  const [resistMood, setResistMood] = useState('طبيعي');
  const [resistTrigger, setResistTrigger] = useState('الملل والفراغ');
  const [resistIntensity, setResistIntensity] = useState(5);

  // Prevention Plan Creator State
  const [planTriggers, setPlanTriggers] = useState<string[]>([]);
  const [planCopings, setPlanCopings] = useState<string[]>([]);
  const [planAnchors, setPlanAnchors] = useState<string[]>([]);
  const [planContacts, setPlanContacts] = useState<string[]>([]);

  const [customTriggerInput, setCustomTriggerInput] = useState('');
  const [customCopingInput, setCustomCopingInput] = useState('');
  const [customAnchorInput, setCustomAnchorInput] = useState('');
  const [customContactInput, setCustomContactInput] = useState('');

  // Daily Journal Input State
  const [journalUrge, setJournalUrge] = useState(3);
  const [journalMood, setJournalMood] = useState('طبيعي');
  const [journalReflection, setJournalReflection] = useState('');

  // Time Tracker State
  const [timeElapsed, setTimeElapsed] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalSeconds: 0
  });

  // Relapse Form State
  const [relapseMood, setRelapseMood] = useState('ملل وفراغ');
  const [relapseTrigger, setRelapseTrigger] = useState('الهاتف بمفردي في السرير');
  const [relapseNotes, setRelapseNotes] = useState('');
  const [customStartDate, setCustomStartDate] = useState('');

  // Ambient Audio Synthesizer States
  const [ambientPlaying, setAmbientPlaying] = useState<string | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // 1. Initial Load
  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem('waqfah_chastity_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setChastityData(prev => ({
          ...prev,
          ...parsed,
          journalLogs: parsed.journalLogs || [],
          preventionPlan: parsed.preventionPlan || null,
          lastJournalDate: parsed.lastJournalDate || '',
          letterToSelf: parsed.letterToSelf || '',
          wastedHoursPerWeek: typeof parsed.wastedHoursPerWeek === 'number' ? parsed.wastedHoursPerWeek : 7,
          resistedUrgesLog: parsed.resistedUrgesLog || [],
          quizHistory: parsed.quizHistory || (parsed.quizResult ? [parsed.quizResult] : []),
        }));
      } catch (e) {
        console.error("Failed to parse chastity data", e);
      }
    }
  }, []);

  // 2. Save to localStorage
  const saveChastityData = (newData: typeof chastityData) => {
    setChastityData(newData);
    localStorage.setItem('waqfah_chastity_data', JSON.stringify(newData));
  };

  // 3. Time calculation loop
  useEffect(() => {
    if (!chastityData.startDate) return;

    const interval = setInterval(() => {
      const start = new Date(chastityData.startDate!).getTime();
      const now = new Date().getTime();
      const diff = now - start;

      if (diff <= 0) {
        setTimeElapsed({ days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 });
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const days = Math.floor(totalSeconds / (3600 * 24));
      const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setTimeElapsed({ days, hours, minutes, seconds, totalSeconds });

      // Sync 90 days grid
      if (days > 0) {
        const currentCompletedDays = Array.from({ length: Math.min(days, 90) }, (_, i) => i + 1);
        const hasChanges = currentCompletedDays.some(d => !chastityData.completedDays.includes(d));
        if (hasChanges) {
          const mergedDays = Array.from(new Set([...chastityData.completedDays, ...currentCompletedDays]));
          saveChastityData({
            ...chastityData,
            completedDays: mergedDays
          });
        }
      }

      // Check if best streak is exceeded
      if (days > chastityData.bestStreak) {
        saveChastityData({
          ...chastityData,
          bestStreak: days
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [chastityData.startDate, chastityData.completedDays, chastityData.bestStreak, chastityData]);

  // 4. Daily Gaze Reset & Habit Reset
  useEffect(() => {
    if (!isClient) return;

    const todayStr = new Date().toLocaleDateString('en-US');

    // Gaze Reset
    if (chastityData.lastGazeResetDate !== todayStr) {
      saveChastityData({
        ...chastityData,
        gazeLowerings: 0,
        lastGazeResetDate: todayStr
      });
    }

    // Habit Reset
    if (chastityData.lastHabitResetDate !== todayStr) {
      saveChastityData({
        ...chastityData,
        habitChecklist: {
          blockSites: false,
          noPhoneInBed: false,
          sports: false,
          adhkar: false,
          quranReading: false,
          goodCompany: false,
        },
        lastHabitResetDate: todayStr
      });
    }
  }, [isClient, chastityData]);

  // Award Points
  const awardPoints = (amount: number, reason: string) => {
    if (globalState) {
      const currentPoints = globalState.points || 0;
      syncUpdate({ points: currentPoints + amount });
      toast({
        title: "🎉 حصلت على نقاط تزكية!",
        description: `أضيفت لرصيدك: +${amount} نقطة (${reason})`,
        variant: "default",
      });
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.8 }
      });
    }
  };

  // Start Tracker
  const handleStartTracker = (dateString?: string) => {
    const startStr = dateString || new Date().toISOString();
    const newData = {
      ...chastityData,
      startDate: startStr,
      habitChecklist: {
        blockSites: false,
        noPhoneInBed: false,
        sports: false,
        adhkar: false,
        quranReading: false,
        goodCompany: false,
      }
    };
    saveChastityData(newData);
    setShowStartModal(false);
    toast({
      title: "🛡️ انطلق مسار التعافي",
      description: "عقدت العزم، فاستعن بالله ولا تعجز. رحلتك نحو النور بدأت الآن.",
    });
    awardPoints(25, "بدء مسار العفة والتعافي");
  };

  // Log Relapse
  const handleLogRelapse = () => {
    if (!chastityData.startDate) return;

    const currentHour = new Date().getHours();
    const relapseItem: RelapseLog = {
      date: new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      mood: relapseMood,
      trigger: relapseTrigger,
      notes: relapseNotes,
      hour: currentHour
    };

    const newLogs = [relapseItem, ...chastityData.relapsesLog];
    const newData = {
      ...chastityData,
      startDate: new Date().toISOString(),
      relapsesLog: newLogs,
      completedDays: [],
    };

    saveChastityData(newData);
    setShowRelapseModal(false);
    setRelapseNotes('');

    toast({
      title: "❤️‍🩹 كبوة لا تعني النهاية",
      description: "الانتكاسة جزء من مسار التعافي، لا تيأس ولا تقنط. قف مجدداً وحلل محفزاتك وابدأ فوراً.",
      variant: "destructive",
    });
  };

  // Log Resisted Urge
  const handleLogResistUrge = () => {
    const newUrge: ResistedUrgeLog = {
      date: new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      mood: resistMood,
      trigger: resistTrigger,
      intensity: resistIntensity,
    };

    const newData = {
      ...chastityData,
      resistedUrgesLog: [newUrge, ...chastityData.resistedUrgesLog]
    };

    saveChastityData(newData);
    setShowResistModal(false);

    toast({
      title: "💪 انتصار يسجل لك!",
      description: "تم توثيق مقاومة الرغبة بنجاح. كل مقاومة هي بناء لعضلات إرادتك العصبية.",
    });
    awardPoints(15, "مقاومة رغبة وإثبات قوة الإرادة");
  };

  // Increment Gaze
  const handleIncrementGaze = () => {
    const current = chastityData.gazeLowerings + 1;
    const newData = {
      ...chastityData,
      gazeLowerings: current
    };
    saveChastityData(newData);

    if (current === 5) {
      awardPoints(20, "تحقيق الهدف اليومي لغض البصر (5 مرات)");
    } else {
      confetti({
        particleCount: 15,
        spread: 30,
        colors: ['#10b981', '#34d399', '#a7f3d0']
      });
    }
  };

  // Toggle checklist habit
  const handleToggleHabit = (key: string) => {
    const nextChecklist = {
      ...chastityData.habitChecklist,
      [key]: !chastityData.habitChecklist[key]
    };

    const newData = {
      ...chastityData,
      habitChecklist: nextChecklist
    };
    saveChastityData(newData);

    if (!chastityData.habitChecklist[key]) {
      awardPoints(5, "إتمام عادة وقائية يومية");
    }
  };

  // Journal Submit
  const handleJournalSubmit = () => {
    const todayStr = new Date().toLocaleDateString('ar-EG');
    const newEntry: JournalEntry = {
      date: todayStr,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      urgeLevel: journalUrge,
      mood: journalMood,
      reflection: journalReflection
    };

    const newData = {
      ...chastityData,
      journalLogs: [newEntry, ...chastityData.journalLogs],
      lastJournalDate: todayStr
    };

    saveChastityData(newData);
    setJournalReflection('');
    toast({
      title: "📝 تم حفظ مذكرتك اليومية",
      description: "الكتابة تفرغ مشاعرك الذهنية وتساعدك في الحفاظ على وعيك.",
    });
    awardPoints(15, "مشاركة التأمل اليومي للمشاعر");
  };

  // Relapse Prevention Plan Saving
  const handleSavePreventionPlan = () => {
    if (planTriggers.length === 0 || planCopings.length === 0) {
      toast({
        title: "خطأ في الإدخال",
        description: "يرجى اختيار محفز واحد على الأقل وإستراتيجية وقائية واحدة.",
        variant: "destructive"
      });
      return;
    }

    const newPlan: PreventionPlan = {
      riskTriggers: planTriggers,
      copingStrategies: planCopings,
      spiritualAnchors: planAnchors,
      safeContacts: planContacts
    };

    const newData = {
      ...chastityData,
      preventionPlan: newPlan
    };

    saveChastityData(newData);
    toast({
      title: "🛡️ تم تفعيل درع الوقاية الشخصي",
      description: "لديك الآن خطة طوارئ مكتوبة جاهزة لمواجهة الوساوس في أي لحظة.",
    });
    awardPoints(40, "إنشاء خطة الوقاية من الانتكاسة الشخصية");
  };

  // Level info
  const getRecoveryLevel = (days: number) => {
    if (days < 3) return { title: 'المستيقظ', color: 'text-rose-400', desc: 'مرحلة اليقظة ومواجهة أعراض الانسحاب الأولية.', icon: AlertCircle, bg: 'bg-rose-500/10 border-rose-500/20' };
    if (days < 7) return { title: 'المجاهد', color: 'text-amber-400', desc: 'مرحلة الجهاد والصبر لكسر الدورة الأولى للإدمان.', icon: Zap, bg: 'bg-amber-500/10 border-amber-500/20' };
    if (days < 14) return { title: 'المبصر', color: 'text-sky-400', desc: 'بدء تلاشي الضباب العقلي وعودة النشاط الطبيعي.', icon: EyeOff, bg: 'bg-sky-500/10 border-sky-500/20' };
    if (days < 30) return { title: 'الثابت', color: 'text-indigo-400', desc: 'ثبات العزيمة وبداية إعادة تهيئة مستقبلات الدوبامين.', icon: Shield, bg: 'bg-indigo-500/10 border-indigo-500/20' };
    if (days < 60) return { title: 'العفيف', color: 'text-emerald-400', desc: 'عفة النفس وتطهير القلب والعيون من دنس الشاشات.', icon: Sparkles, bg: 'bg-emerald-500/10 border-emerald-500/20' };
    if (days < 90) return { title: 'الحر', color: 'text-teal-400', desc: 'تذوق طعم الحرية الحقيقية والتخلص الكامل من القيود.', icon: Flame, bg: 'bg-teal-500/10 border-teal-500/20' };
    return { title: 'القدوة العفيف', color: 'text-purple-400', desc: 'بلوغ التعافي الكامل ونقل الخبرة لإفادة وتوعية الآخرين.', icon: Award, bg: 'bg-purple-500/10 border-purple-500/20' };
  };

  const currentLevel = getRecoveryLevel(timeElapsed.days);

  // Check which achievements are unlocked
  const achievements = useMemo(() => {
    const isStarted = chastityData.startDate !== null;
    const isFiveGaze = chastityData.gazeLowerings >= 5;
    const isWeekStreak = chastityData.bestStreak >= 7;
    const isMonthStreak = chastityData.bestStreak >= 30;
    const isQuizDone = chastityData.quizResult !== null;
    const isPlanDone = chastityData.preventionPlan !== null;
    const isAllVideos = chastityData.watchedVideos.length >= 8;
    const isNinetyDays = chastityData.bestStreak >= 90;

    return [
      { id: 'start', title: 'عقد العزم', desc: 'بدء عداد التعافي وإطلاق العزيمة.', unlocked: isStarted, icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10' },
      { id: 'gaze', title: 'حارس البصر', desc: 'تحقيق غض البصر 5 مرات في يوم واحد.', unlocked: isFiveGaze, icon: EyeOff, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
      { id: 'week', title: 'الأسبوع الأول', desc: 'إتمام 7 أيام كاملة من الصمود.', unlocked: isWeekStreak, icon: Shield, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
      { id: 'month', title: 'درع الشهر', desc: 'إتمام 30 يوماً من العفة والتطهير.', unlocked: isMonthStreak, icon: Award, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
      { id: 'quiz', title: 'طبيب النفس', desc: 'إجراء فحص مقياس شدة الإدمان.', unlocked: isQuizDone, icon: Brain, color: 'text-purple-400', bg: 'bg-purple-500/10' },
      { id: 'plan', title: 'صائد الثغرات', desc: 'بناء خطة الوقاية الشخصية الطارئة.', unlocked: isPlanDone, icon: BookOpenCheck, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
      { id: 'videos', title: 'المثقف الواعي', desc: 'مشاهدة جميع الفيديوهات التوعوية الثمانية.', unlocked: isAllVideos, icon: Video, color: 'text-rose-400', bg: 'bg-rose-500/10' },
      { id: 'ninety', title: 'بطل التسعين', desc: 'التعافي الكامل وإعادة برمجة الدماغ (90 يوماً).', unlocked: isNinetyDays, icon: Sparkles, color: 'text-teal-400', bg: 'bg-teal-500/10' },
    ];
  }, [chastityData]);

  // Chaser Effect Rescue Plan Checker
  const showRescueCard = useMemo(() => {
    if (chastityData.relapsesLog.length === 0) return false;
    return timeElapsed.days < 3 && chastityData.startDate !== null;
  }, [chastityData.relapsesLog, chastityData.startDate, timeElapsed.days]);

  // Timeline benefits
  const milestones = [
    { day: 1, title: 'الدوبامين المفرط', desc: 'خروج آخر مشاهدة من ذاكرة الدماغ قصيرة المدى، تعامل مع الرغبة كضيف راحل.' },
    { day: 3, title: 'قمة التوتر', desc: 'يبدأ الدماغ بالمطالبة بجرعته المعتادة. مارس الرياضة وتجنب العزلة تماماً.' },
    { day: 7, title: 'ارتفاع هرمون الذكورة', desc: 'زيادة واضحة في الطاقة الجسدية والتركيز العقلي. استغلها في التعلم والعبادة.' },
    { day: 14, title: 'وضوح الرؤية', desc: 'تحسن في النوم وتلاشي الخمول الصباحي. الغدة النخامية تبدأ بالتعافي.' },
    { day: 30, title: 'إعادة تهيئة المستقبلات', desc: 'حساسية الدوبامين تتحسن بنسبة 40%. تفاصيل الحياة البسيطة تصبح ممتعة مجدداً.' },
    { day: 60, title: 'الاستقرار النفسي', desc: 'انخفاض القلق الاجتماعي وبناء ثقة قوية بالنفس. النظرة للمرأة تصبح طبيعية ومحترمة.' },
    { day: 90, title: 'التحول الكامل (90 يوماً)', desc: 'اكتمال الدورة العلاجية لإعادة برمجة الدماغ. الفص الجبهي استعاد سيطرته على السلوك.' },
  ];

  // Video data
  const videos = [
    { id: '8M_4m8W28l8', title: 'لماذا يصعب الإقلاع عن الإباحية؟ علم الأعصاب يجيب', duration: '14:32', category: 'medical', channel: 'واعي Waa`y', desc: 'شرح مبسط لكيفية اختطاف الدوبامين للغدة النخامية والفص الجبهي وتغيير كيمياء المخ.' },
    { id: 'sU-g3lXp0D0', title: 'خريطة طريق التعافي: ماذا يحدث لدماغك خلال 90 يوماً؟', duration: '12:05', category: 'medical', channel: 'واعي Waa`y', desc: 'التغيرات الفيزيولوجية والسلوكية التي يمر بها المتعافي أسبوعاً بعد أسبوع.' },
    { id: '9xT2M97Yd4M', title: 'أولى خطوات التخلص من العادة السرية والإباحية نهائياً', duration: '18:40', category: 'psych', channel: 'د. محمد عبد الجواد', desc: 'خطوات عملية وتطبيقية من مؤسس فريق واعي للتغلب على فخ الانتكاسة وتجنب المثيرات.' },
    { id: 'R4K7XlYI75s', title: 'علاج الإدمان السلوكي وإعادة برمجة الدماغ بدون انتكاس', duration: '15:15', category: 'psych', channel: 'عيادة سلوكية', desc: 'كيف تتعامل مع لحظات الضغط النفسي والملل دون اللجوء للشاشات كمسكن.' },
    { id: 'X6m7g_d-K88', title: 'علاج قوي وعملي لفتنة غض البصر والشهوات مستعرة', duration: '22:10', category: 'spiritual', channel: 'دروس شرعية', desc: 'المنظور الإيماني والعبادات قلبية التي تحمي الشاب من الاستسلام للنظرة المحرمة.' },
    { id: '_O5-h8hW6e8', title: 'الآثار النفسية والاجتماعية المدمرة للأفلام الإباحية', duration: '16:45', category: 'psych', channel: 'واعي Waa`y', desc: 'تأثير الإباحية على العلاقات الزوجية والرهاب الاجتماعي ومستوى تقدير الذات.' },
    { id: '7n_ZlB1dK2Q', title: 'قصص نجاح من تعافوا تماماً وبدأوا حياة جديدة', duration: '20:30', category: 'spiritual', channel: 'تجارب واقعية', desc: 'رسائل ملهمة من شباب وفتيات اجتازوا تحدي الـ 90 يوماً بنجاح وتغيرت حياتهم للأفضل.' },
    { id: 'd0d4E9F1g6c', title: 'كيف تحمي عائلتك وأطفالك من خطر الإباحية الإلكترونية؟', duration: '19:20', category: 'spiritual', channel: 'كنف التربية', desc: 'دليل شامل للتربية الجنسية السليمة واستخدام الفلاتر الوقائية لحماية البيئة الأسرية.' },
  ];

  const [videoCategory, setVideoCategory] = useState<'all' | 'medical' | 'psych' | 'spiritual'>('all');
  const filteredVideos = videos.filter(v => videoCategory === 'all' || v.category === videoCategory);

  const handleToggleWatchVideo = (id: string) => {
    const isWatched = chastityData.watchedVideos.includes(id);
    let nextWatched = [...chastityData.watchedVideos];
    if (isWatched) {
      nextWatched = nextWatched.filter(v => v !== id);
    } else {
      nextWatched.push(id);
      awardPoints(10, "مشاهدة فيديو توعوي في مسار العفة");
    }
    saveChastityData({
      ...chastityData,
      watchedVideos: nextWatched
    });
  };

  // Triggers calculations
  const triggerStats = useMemo(() => {
    const total = chastityData.relapsesLog.length;
    const totalResisted = chastityData.resistedUrgesLog.length;

    // Victory Ratio
    const victoryRatio = totalResisted + total > 0
      ? Math.round((totalResisted / (totalResisted + total)) * 100)
      : 100;

    if (total === 0) return { moods: [] as { name: string; percentage: number; count: number }[], triggers: [] as { name: string; percentage: number; count: number }[], total: 0, totalResisted, victoryRatio };

    const moods: Record<string, number> = {};
    const triggers: Record<string, number> = {};

    chastityData.relapsesLog.forEach(log => {
      moods[log.mood] = (moods[log.mood] || 0) + 1;
      triggers[log.trigger] = (triggers[log.trigger] || 0) + 1;
    });

    const formatPercent = (count: number) => Math.round((count / total) * 100);

    const formattedMoods = Object.entries(moods).map(([key, val]) => ({ name: key, percentage: formatPercent(val), count: val }));
    const formattedTriggers = Object.entries(triggers).map(([key, val]) => ({ name: key, percentage: formatPercent(val), count: val }));

    return {
      moods: formattedMoods.sort((a, b) => b.count - a.count),
      triggers: formattedTriggers.sort((a, b) => b.count - a.count),
      total,
      totalResisted,
      victoryRatio
    };
  }, [chastityData.relapsesLog, chastityData.resistedUrgesLog]);

  // Quiz State
  const [quizStep, setQuizStep] = useState<number>(-1);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const quizQuestions = [
    { q: 'كم مرة تقضيها في تصفح المواقع الإباحية أسبوعياً？', opts: ['نادراً أو لا أفتحها أبداً', 'مرة إلى مرتين', 'من 3 إلى 5 مرات', 'يومياً بشكل شبه مستمر'] },
    { q: 'هل تشعر أن رغبتك في المشاهدة تزداد عند الغضب، التوتر، أو الشعور بالوحدة والملل؟', opts: ['لا، ليس لها علاقة بحالتي المزاجية', 'أحياناً ألجأ إليها في فترات الملل', 'غالباً ما تكون وسيلتي للهروب من المشاعر السلبية', 'دائماً أفر إليها كمخفف وحيد للتوتر'] },
    { q: 'هل حاولت الإقلاع عن الإباحية سابقاً وفشلت في الاستمرار？', opts: ['لم أحاول بعد / لا أحتاج لذلك', 'حاولت ونجحت لفترات مقبولة', 'حاولت مراراً وتكراراً ولم أتحمل أكثر من أيام قليلة', 'أشعر بعجز تام ويأس من القدرة على التوقف'] },
    { q: 'هل تؤثر المشاهدة على واجباتك اليومية (دراسة، عمل، صلوات، مسؤوليات)？', opts: ['لا تؤثر نهائياً', 'تؤخرني أحياناً عن بعض المواعيد والمهام', 'تسببت في إهمال ملحوظ لواجباتي وضياع الصلوات', 'أعطل حياتي بالكامل لأتفرغ للمشاهدة لأوقات طويلة'] },
    { q: 'هل تجد نفسك بحاجة لمشاهدة محتوى أكثر شذوذاً أو غرابة لتحصل على نفس الإثارة السابقة؟', opts: ['لا، المشاهدة عادية جداً', 'أحياناً أبحث عن تصنيفات جديدة', 'نعم، المحتوى العادي لم يعد يثير اهتمامي مثل السابق', 'أشعر بقلق كبير من المحتويات الشاذة التي أصبحت أشاهدها'] },
    { q: 'هل تمارس العزلة وتفضل البقاء وحيداً مع هاتفك لساعات طويلة بعيداً عن أهلك وأصدقائك؟', opts: ['لا، حياتي الاجتماعية ممتازة ومفتوحة', 'أفضل الجلوس بمفردي أحياناً', 'أتهرب من الجلسات العائلية لكي أجد فرصة للتصفح', 'أنعزل تماماً وأشعر بخوف شديد من تواجدي مع الآخرين'] },
    { q: 'هل ينتابك شعور قوي بالندم، تأنيب الضمير، أو الاحتقار لذاتك بعد كل مشاهدة؟', opts: ['لا أشعر بشيء خاص', 'أشعر بضيق خفيف يزول سريعاً', 'أشعر بحزن وإحباط كبير وتأنيب ضمير حاد', 'أدخل في حالة اكتئاب وتمني الموت من شدة القهر الداخلي'] },
    { q: 'هل تؤثر المشاهدة على صحتك الجسدية (ضعف نظر، خمول وكسل، آلام أسفل الظهر، ضعف تركيز)؟', opts: ['لا أشعر بأي أعراض جسدية', 'أعاني من كسل وخمول مؤقت بعد المشاهدة', 'أعاني من ضعف تركيز حاد، تشوش ذهني، وآلام مستمرة', 'جسدي منهك تماماً وأشعر بالشيخوخة المبكرة والتشتت'] },
    { q: 'كم من الوقت تقضيه في البحث عن المقطع المثالي للمشاهدة؟', opts: ['دقائق معدودة ولا أهتم كثيراً', 'من 10 إلى 30 دقيقة', 'أقضي ساعة أو أكثر أبحث وأنتقل بين المقاطع', 'قد يضيع يومي بالكامل في البحث دون الشعور بالوقت'] },
    { q: 'هل فكرت أن علاقتك بالإباحية هي إدمان حقيقي خارج عن سيطرتك؟', opts: ['لا، أستطيع التوقف في أي وقت أريد', 'أظن أنه مجرد عادة سيئة يمكنني علاجها', 'أشعر بالخوف من احتمالية أنني مدمن سلوكي', 'أيقن تماماً أنني مدمن ومسجون داخل هذه العادة القاتلة'] }
  ];

  const handleQuizAnswer = (optIndex: number) => {
    const nextAnswers = [...quizAnswers, optIndex];
    setQuizAnswers(nextAnswers);

    if (quizStep < quizQuestions.length - 1) {
      setQuizStep(quizStep + 1);
    } else {
      const totalScore = nextAnswers.reduce((sum, current) => sum + current, 0);
      let level = '';
      if (totalScore <= 5) level = 'سليم أو إدمان خفيف جداً';
      else if (totalScore <= 15) level = 'إدمان متوسط (في مرحلة الخطر)';
      else if (totalScore <= 25) level = 'إدمان شديد (يتطلب خطة صارمة)';
      else level = 'إدمان قهري وحرج (تحتاج لمجاهدة كبرى ومساعدة)';

      const result = {
        score: totalScore,
        level,
        date: new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
      };

      const newHistory = [result, ...(chastityData.quizHistory || [])];

      saveChastityData({
        ...chastityData,
        quizResult: result,
        quizHistory: newHistory
      });

      setQuizStep(10);
      awardPoints(35, "إتمام اختبار مقياس الإدمان الذاتي");
    }
  };

  const handleRestartQuiz = () => {
    setQuizAnswers([]);
    setQuizStep(0);
  };

  // Dopamine dynamic baseline percentage calculation
  const dopaminePercentage = useMemo(() => {
    const days = timeElapsed.days;
    if (days <= 0) return 40;
    if (days >= 90) return 100;
    return Math.min(100, Math.round(40 + (days / 90) * 60));
  }, [timeElapsed.days]);

  // Wasted vs Saved Time Calculator Math
  const calculatorYield = useMemo(() => {
    const hoursPerWeek = chastityData.wastedHoursPerWeek || 7;
    const hoursPerDay = hoursPerWeek / 7;
    const daysStreak = timeElapsed.days || 0;
    const hoursSaved = Math.round(daysStreak * hoursPerDay);

    const yearlyWastedHours = hoursPerWeek * 52;
    const yearlyWastedDays = Math.round(yearlyWastedHours / 24);

    const booksRead = Math.round(yearlyWastedHours / 6);
    const coursesFinished = Math.round(yearlyWastedHours / 15);
    const walksKilometers = Math.round(yearlyWastedHours * 5);

    return {
      hoursSaved,
      yearlyWastedHours,
      yearlyWastedDays,
      booksRead,
      coursesFinished,
      walksKilometers
    };
  }, [chastityData.wastedHoursPerWeek, timeElapsed.days]);

  // Backup Data Export Utility
  const handleExportData = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(chastityData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `waqfah_chastity_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      toast({
        title: "💾 تم تصدير النسخة الاحتياطية",
        description: "تم تحميل ملف سجل التعافي لجهازك بنجاح. احتفظ به جيداً للاستعادة لاحقاً.",
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "خطأ في التصدير",
        description: "فشلت عملية حفظ النسخة الاحتياطية.",
        variant: "destructive"
      });
    }
  };

  // Backup Data Import Utility
  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = event.target.files;
    if (!files || files.length === 0) return;

    fileReader.readAsText(files[0], "UTF-8");
    fileReader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);

        // Validation check
        if (typeof importedData !== 'object' || importedData === null) {
          throw new Error("Invalid structure");
        }

        const mergedData = {
          ...chastityData,
          ...importedData,
          relapsesLog: Array.isArray(importedData.relapsesLog) ? importedData.relapsesLog : [],
          journalLogs: Array.isArray(importedData.journalLogs) ? importedData.journalLogs : [],
          resistedUrgesLog: Array.isArray(importedData.resistedUrgesLog) ? importedData.resistedUrgesLog : [],
          quizHistory: Array.isArray(importedData.quizHistory) ? importedData.quizHistory : [],
        };

        saveChastityData(mergedData);

        toast({
          title: "📂 تم استيراد السجل بنجاح",
          description: "تم تحميل بيانات صمودك ومذكراتك السابقة بالكامل وتحديث العداد.",
        });

        // Trigger page reload to sync state cleanly
        setTimeout(() => window.location.reload(), 1000);
      } catch (err) {
        console.error(err);
        toast({
          title: "ملف غير صالح",
          description: "الملف الذي قمت بتحميله لا يطابق بنية بيانات درع العفة لـ وقفة.",
          variant: "destructive"
        });
      }
    };
  };

  // Ambient Audio Synthesizer Functions
  const startAmbient = (type: string) => {
    try {
      if (audioCtxRef.current) {
        stopAmbient();
      }

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      if (type === 'brown') {
        const bufferSize = 10 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5;
        }

        const source = ctx.createBufferSource();
        source.buffer = noiseBuffer;
        source.loop = true;

        const gain = ctx.createGain();
        gain.gain.value = 0.6;

        source.connect(gain);
        gain.connect(ctx.destination);
        source.start();

        sourceNodeRef.current = source;
        gainNodeRef.current = gain;
        setAmbientPlaying('brown');
      }

      else if (type === 'rain') {
        const bufferSize = 4 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
          b6 = white * 0.115926;
          output[i] = pink * 0.11;

          if (Math.random() < 0.0025) {
            output[i] += (Math.random() * 0.4 - 0.2);
          }
        }

        const source = ctx.createBufferSource();
        source.buffer = noiseBuffer;
        source.loop = true;

        const gain = ctx.createGain();
        gain.gain.value = 0.5;

        source.connect(gain);
        gain.connect(ctx.destination);
        source.start();

        sourceNodeRef.current = source;
        gainNodeRef.current = gain;
        setAmbientPlaying('rain');
      }

      else if (type === 'ocean') {
        const bufferSize = 8 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5;
        }

        const source = ctx.createBufferSource();
        source.buffer = noiseBuffer;
        source.loop = true;

        const gain = ctx.createGain();
        gain.gain.value = 0.3;

        const osc = ctx.createOscillator();
        osc.frequency.value = 0.13;

        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 0.25;

        osc.connect(lfoGain);
        lfoGain.connect(gain.gain);

        source.connect(gain);
        gain.connect(ctx.destination);

        source.start();
        osc.start();

        sourceNodeRef.current = source;
        gainNodeRef.current = gain;
        setAmbientPlaying('ocean');
      }

      toast({
        title: "🎧 مشغل التهدئة يعمل",
        description: "تم بدء بث الصوت التخليقي لتهدئة خلايا القلق وعزل المثيرات الخارجية.",
      });

    } catch (err) {
      console.error("Audio Context initialization failed:", err);
    }
  };

  const stopAmbient = () => {
    try {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect();
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    } catch (e) {
      console.error(e);
    }
    audioCtxRef.current = null;
    sourceNodeRef.current = null;
    gainNodeRef.current = null;
    setAmbientPlaying(null);
  };

  // Danger Relapse Hours Alert
  const dangerHoursAlert = useMemo(() => {
    if (chastityData.relapsesLog.length === 0) return null;
    const hours = chastityData.relapsesLog.map(l => l.hour).filter(h => h !== undefined) as number[];
    if (hours.length === 0) return null;

    let lateNight = 0;
    let dayHours = 0;

    hours.forEach(h => {
      if (h >= 22 || h <= 4) lateNight++;
      else dayHours++;
    });

    if (lateNight > dayHours) {
      return {
        title: "🚨 تنبيه خطر السهر ووقت المتأخر من الليل",
        desc: "تشير تحليلات تعثراتك السابقة إلى أن معظمها يحدث بعد الساعة 10 مساءً. نوصي بشدة بوضع الهاتف خارج غرفة النوم تماماً قبل الساعة 10:00 مساءً."
      };
    }
    return null;
  }, [chastityData.relapsesLog]);

  if (!isClient) return null;

  return (
    <div className="min-h-screen pb-24 bg-transparent text-white selection:bg-emerald-500/30 overflow-x-hidden relative">

      {/* Dynamic Style injection for non-tailwind configurations */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .quran-font {
          font-family: var(--font-scheherazade-new), 'Scheherazade New', serif;
        }
      `}} />

      {/* ── Background: Cinematic Glows & Animated Liquid Blobs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Animated Blob 1 */}
        <motion.div
          animate={{
            x: [0, 80, -50, 0],
            y: [0, -100, 60, 0],
            scale: [1, 1.25, 0.85, 1]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
          className="absolute top-[-5%] right-[-5%] w-[700px] h-[700px] bg-emerald-500/20 blur-[110px] rounded-full"
        />
        {/* Animated Blob 2 */}
        <motion.div
          animate={{
            x: [0, -90, 40, 0],
            y: [0, 80, -50, 0],
            scale: [1, 0.8, 1.2, 1]
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
          className="absolute bottom-[-5%] left-[-5%] w-[600px] h-[600px] bg-teal-500/18 blur-[100px] rounded-full"
        />
        {/* Animated Blob 3 */}
        <motion.div
          animate={{
            x: [0, 60, -40, 0],
            y: [0, 90, -60, 0],
            scale: [1, 1.15, 0.85, 1]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
          className="absolute top-[35%] left-[25%] w-[550px] h-[550px] bg-purple-600/12 blur-[120px] rounded-full"
        />

        {/* Subtle grid mesh */}
        <div className="absolute inset-0 opacity-[0.025] bg-[radial-gradient(#ffffff_1.2px,transparent_1.2px)] bg-[size:32px_32px]" />
      </div>

      <div className="container relative z-10 px-4 sm:px-6">

        {/* ── Header Card ── */}
        <div className={cn(glassCardClass, "w-full mx-auto mt-8 p-6 md:p-12 relative overflow-hidden group/frame")}>
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] bg-[size:40px_40px]" />

          {/* Hero Header */}
          <div className="flex flex-col lg:flex-row justify-between items-center gap-8 relative z-10 pb-8 border-b border-white/10">
            <div className="text-right flex-1">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black mb-4 uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                <Shield className="w-3.5 h-3.5 fill-emerald-500/20 animate-pulse" /> درع العفة والتحصين السلوكي
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 leading-tight" style={textGlowStyle}>
                بوابة <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">التعافي والتحرر</span>
              </h1>
              <p className="text-white/50 text-sm md:text-lg max-w-2xl leading-relaxed">
                منصة شاملة لمكافحة إدمان الإباحية وبناء حصانة سلوكية ونفسية متكاملة. بياناتك مشفرة ومحفوظة بالكامل على جهازك بسرية مطلقة 🛡️
              </p>
              <div className="flex items-center gap-2 mt-4 text-[11px] text-emerald-400/80 font-bold bg-emerald-500/5 px-3 py-1.5 rounded-lg w-fit border border-emerald-500/10">
                <span>🔒 خصوصية 100%: لا توجد خوادم خارجية لحفظ السجلات، كل شيء مخزن محلياً.</span>
              </div>
            </div>

            {/* Stats badges */}
            <div className="flex flex-wrap justify-center gap-4 flex-shrink-0">
              <div className="bg-white/[0.015] border border-white/10 rounded-2xl p-4 text-center min-w-[120px] hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                <Flame className="w-6 h-6 text-orange-400 mx-auto mb-1.5 filter drop-shadow-[0_0_8px_rgba(251,146,60,0.3)]" />
                <div className="text-2xl font-black">{timeElapsed.days} يوماً</div>
                <div className="text-[10px] text-white/40 font-bold">العداد الحالي</div>
              </div>
              <div className="bg-white/[0.015] border border-white/10 rounded-2xl p-4 text-center min-w-[120px] hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                <Award className="w-6 h-6 text-emerald-400 mx-auto mb-1.5 filter drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]" />
                <div className="text-2xl font-black">{chastityData.bestStreak} يوماً</div>
                <div className="text-[10px] text-white/40 font-bold">أفضل سلسلة صمود</div>
              </div>
              <div className="bg-white/[0.015] border border-white/10 rounded-2xl p-4 text-center min-w-[120px] hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                <Activity className="w-6 h-6 text-teal-400 mx-auto mb-1.5 filter drop-shadow-[0_0_8px_rgba(45,212,191,0.3)]" />
                <div className="text-2xl font-black">{chastityData.gazeLowerings}</div>
                <div className="text-[10px] text-white/40 font-bold">غض البصر اليومي</div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-6 mt-2 border-t border-white/0 scroll-smooth">
            {[
              { id: 'dashboard', label: 'لوحة التحكم والمؤشرات', icon: Shield },
              { id: 'challenge', label: 'تحدي الـ 90 يوماً والفوائد', icon: Calendar },
              { id: 'videos', label: 'مكتبة الفيديوهات التوعوية', icon: Video },
              { id: 'quiz', label: 'مقياس شدة الإدمان', icon: Brain },
              { id: 'prevention', label: 'درع الوقاية الطارئ', icon: HeartHandshake },
              { id: 'analyzer', label: 'محلل المحفزات والمذكرات', icon: BarChart3 },
              { id: 'faq', label: 'الأسئلة الشائعة وعلم الأعصاب', icon: HelpCircle },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "px-5 py-3 rounded-2xl text-xs md:text-sm font-black whitespace-nowrap transition-all flex items-center gap-2 border",
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-emerald-500 to-teal-400 text-black border-emerald-400 shadow-lg shadow-emerald-500/20 scale-105"
                    : "text-white/50 border-transparent hover:text-white hover:bg-white/5 hover:border-white/10"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

        </div>

        {/* ── 3-Day Rescue Plan Card ── */}
        {showRescueCard && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 max-w-4xl mx-auto bg-gradient-to-r from-amber-600/10 to-rose-600/10 border border-amber-500/30 backdrop-blur-2xl rounded-[2.5rem] p-6 md:p-8 text-right relative overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.5)]"
          >
            <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/5 blur-xl rounded-full" />
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h3 className="text-lg font-black text-white">خطة الإنقاذ لمنع انتكاسة التكرار (Chaser Effect)</h3>
                  <span className="bg-amber-500 text-black text-[9px] font-black px-2 py-0.5 rounded-md uppercase animate-pulse">حالة استنفار</span>
                </div>
                <p className="text-white/60 text-xs leading-relaxed max-w-3xl mb-4">
                  تعد الأيام الثلاثة الأولى بعد الكبوة هي الأخطر على الإطلاق بسبب رغبة الدماغ الشديدة في تعويض الدوبامين المفقود بسرعة. التزامك بهذه المهام الصغيرة سيحميك من الغرق في سيل متكرر من الانتكاسات.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { day: 1, task: "الاستحمام البارد + إبعاد الهاتف عن السرير تماماً الليلة." },
                    { day: 2, task: "المشي ساعة كاملة خارج المنزل لإفراغ هرمون التوتر وتجنب الوحدة." },
                    { day: 3, task: "صلاة ركعتين توبة + كتابة خطة الوقاية لمنع هذا الفخ مجدداً." }
                  ].map((rescue, i) => (
                    <div key={i} className="p-3 bg-black/40 border border-white/10 rounded-xl text-right backdrop-blur-md">
                      <div className="text-[10px] font-black text-amber-400 mb-1">المهمة اليومية - اليوم {rescue.day}</div>
                      <p className="text-xs text-white/80 leading-relaxed font-bold">{rescue.task}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Emergency Quick Urgent Panel ── */}
        <div className="mt-8 flex justify-center">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowUrgeModal(true)}
            className="w-full max-w-4xl bg-gradient-to-r from-red-600/90 to-rose-700/90 hover:from-red-500 hover:to-rose-600 text-white font-black text-lg py-4.5 px-8 rounded-3xl shadow-2xl flex items-center justify-center gap-3 relative overflow-hidden border border-red-500/30 group/emergency backdrop-blur-2xl"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/emergency:opacity-100 transition-opacity duration-300 animate-pulse" />
            <ShieldAlert className="w-6 h-6 animate-bounce text-red-200" />
            <span style={textGlowStyle}>أشعر برغبة شديدة ملحة الآن! (زر الطوارئ السلوكي العاجل)</span>
            <span className="hidden sm:inline-block px-3 py-1 bg-black/30 text-[10px] rounded-lg tracking-widest font-black uppercase text-red-200">ملاذ آمن</span>
          </motion.button>
        </div>

        {/* ── Main Tab Contents ── */}
        <div className="mt-8 max-w-7xl mx-auto relative">
          <AnimatePresence mode="wait">

            {/* TAB: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              >
                {/* Sobriety Timer & Actions */}
                <div className="lg:col-span-2 space-y-8">

                  {/* Liquid Glass Sobriety card */}
                  <div className={cn(glassCardClass, "p-8 flex flex-col justify-between min-h-[420px] relative overflow-hidden")}>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/[0.02] blur-[80px] rounded-full pointer-events-none" />

                    <div className="flex justify-between items-start z-10">
                      <div>
                        <h3 className="text-2xl font-black text-white">عداد زمن التعافي الحر</h3>
                        <p className="text-white/40 text-xs mt-1">يحسب اللحظات التي عشتها حراً من قيود العبودية الرقمية.</p>
                      </div>
                      {chastityData.startDate && (
                        <div className={cn("px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-md shadow-md", currentLevel.bg)}>
                          <currentLevel.icon className="w-3.5 h-3.5" />
                          <span>المستوى: {currentLevel.title}</span>
                        </div>
                      )}
                    </div>

                    {/* The counter view */}
                    {!chastityData.startDate ? (
                      <div className="text-center py-12 z-10 flex-1 flex flex-col justify-center items-center">
                        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                          <Shield className="w-10 h-10 text-emerald-400" />
                        </div>
                        <h4 className="text-xl font-bold text-white mb-2">أنت لم تبدأ عداد التعافي بعد</h4>
                        <p className="text-white/40 text-sm max-w-sm mx-auto mb-6">اتخذ القرار الآن، استعن بالله، وابدأ بتسجيل أولى خطواتك المباركة في طريق الطهارة والعفة.</p>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button
                            onClick={() => handleStartTracker()}
                            className="bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-black px-8 py-3.5 rounded-2xl text-base shadow-xl shadow-emerald-500/20 transition-all hover:scale-105"
                          >
                            ابدأ العداد من هذه اللحظة
                          </button>
                          <button
                            onClick={() => setShowStartModal(true)}
                            className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold px-6 py-3.5 rounded-2xl text-sm transition-all backdrop-blur-md"
                          >
                            تحديد وقت انطلاق سابق
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="py-10 z-10 flex-1 flex flex-col justify-center items-center">
                        {/* Countdown Grid */}
                        <div className="grid grid-cols-4 gap-3 sm:gap-6 w-full max-w-md">
                          {[
                            { value: timeElapsed.days, label: 'أيام' },
                            { value: timeElapsed.hours, label: 'ساعات' },
                            { value: timeElapsed.minutes, label: 'دقائق' },
                            { value: timeElapsed.seconds, label: 'ثوانٍ' },
                          ].map((unit, idx) => (
                            <div key={idx} className="bg-white/[0.015] border border-white/10 rounded-3xl p-3 sm:p-5 text-center relative group hover:border-emerald-500/40 hover:bg-emerald-500/[0.02] transition-all shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.1),0_10px_20px_rgba(0,0,0,0.5)]">
                              <span className="text-3xl sm:text-5xl font-black text-emerald-400 block tracking-tight" style={textGlowStyle}>{String(unit.value).padStart(2, '0')}</span>
                              <span className="text-[10px] text-white/30 font-bold block mt-1 uppercase tracking-wider">{unit.label}</span>
                            </div>
                          ))}
                        </div>

                        <p className="text-white/40 text-[11px] font-bold mt-6 flex items-center gap-1.5 bg-white/[0.01] px-4 py-2 rounded-full border border-white/5 backdrop-blur-md">
                          <Clock className="w-3.5 h-3.5 text-emerald-400" />
                          <span>بدأت المسيرة في: {new Date(chastityData.startDate).toLocaleString('ar-EG', { dateStyle: 'long', timeStyle: 'short' })}</span>
                        </p>

                        <div className="flex flex-wrap justify-center gap-3 mt-8">
                          <button
                            onClick={() => setShowResistModal(true)}
                            className="bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-black px-6 py-3 rounded-2xl text-xs shadow-xl shadow-emerald-500/10 transition-all hover:scale-103 flex items-center gap-2"
                          >
                            <Zap className="w-4 h-4" /> قاومت رغبة بنجاح! 💪
                          </button>
                          <button
                            onClick={() => {
                              const text = `بفضل الله، أكملت ${timeElapsed.days} يوماً و ${timeElapsed.hours} ساعة من التعافي في مسار درع العفة على منصة وقفة 🛡️. العفة طريق الأحرار.`;
                              navigator.clipboard.writeText(text);
                              toast({
                                title: "📋 تم نسخ النص بنجاح",
                                description: "يمكنك مشاركته الآن لدعم زملائك في طريق العفة والتعافي.",
                              });
                            }}
                            className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all flex items-center gap-2 backdrop-blur-md"
                          >
                            <Compass className="w-3.5 h-3.5" /> مشاركة التقدم بسرية
                          </button>
                          <button
                            onClick={() => setShowRelapseModal(true)}
                            className="bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 font-bold px-5 py-2.5 rounded-xl text-xs transition-all flex items-center gap-2 backdrop-blur-md"
                          >
                            <AlertCircle className="w-3.5 h-3.5" /> تسجيل تعثر / انتكاسة
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Dopamine baseline recovery curve */}
                  <div className={cn(glassCardClass, "p-8 relative overflow-hidden")}>
                    <h3 className="text-xl font-black text-white flex items-center gap-2">
                      <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
                      مؤشر استرداد حساسية مستقبلات الدوبامين
                    </h3>
                    <p className="text-white/40 text-xs mt-1">
                      منحنى تقديري يوضح تعافي الدماغ وإصلاح الخلايا العصبية تدريجياً لتعود لمستوى الفطرة (التسعين يوماً).
                    </p>

                    <div className="mt-6 flex flex-col md:flex-row gap-6 items-center">
                      <div className="w-full md:w-2/3 h-48 bg-black/40 border border-white/5 rounded-2xl relative p-4 flex items-end backdrop-blur-md">
                        <svg className="w-full h-full" viewBox="0 0 100 50">
                          <line x1="0" y1="5" x2="100" y2="5" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                          <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                          <line x1="0" y1="35" x2="100" y2="35" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />

                          <path
                            d="M 5,45 Q 15,35 30,25 T 90,5"
                            fill="none"
                            stroke="rgba(16, 185, 129, 0.15)"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                          <path
                            d={`M 5,45 Q 15,35 30,25 T ${Math.min(90, 5 + (timeElapsed.days / 90) * 85)},${45 - ((dopaminePercentage - 40) / 60) * 40}`}
                            fill="none"
                            stroke="url(#dopamineGlow)"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                          />

                          <circle
                            cx={Math.min(90, 5 + (timeElapsed.days / 90) * 85)}
                            cy={45 - ((dopaminePercentage - 40) / 60) * 40}
                            r="3"
                            fill="#10b981"
                            className="animate-ping opacity-70"
                          />
                          <circle
                            cx={Math.min(90, 5 + (timeElapsed.days / 90) * 85)}
                            cy={45 - ((dopaminePercentage - 40) / 60) * 40}
                            r="2"
                            fill="#34d399"
                          />

                          <defs>
                            <linearGradient id="dopamineGlow" x1="0%" y1="100%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#10b981" />
                              <stop offset="100%" stopColor="#2dd4bf" />
                            </linearGradient>
                          </defs>

                          <text x="5" y="49" fill="rgba(255,255,255,0.3)" fontSize="3">يوم 0</text>
                          <text x="30" y="49" fill="rgba(255,255,255,0.3)" fontSize="3">يوم 30</text>
                          <text x="60" y="49" fill="rgba(255,255,255,0.3)" fontSize="3">يوم 60</text>
                          <text x="85" y="49" fill="rgba(255,255,255,0.3)" fontSize="3">يوم 90</text>
                        </svg>
                      </div>

                      <div className="w-full md:w-1/3 space-y-4">
                        <div className="bg-white/[0.01] border border-white/10 rounded-2xl p-4 text-right shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] backdrop-blur-md">
                          <span className="text-[10px] text-white/30 font-bold block">مستوى الدوبامين الحالي</span>
                          <span className="text-3xl font-black text-emerald-400" style={textGlowStyle}>{dopaminePercentage}%</span>
                          <p className="text-[10px] text-white/50 leading-relaxed mt-1">
                            {dopaminePercentage <= 50 ? 'مرحلة انسحاب شديدة وصعوبة بالتركيز.' :
                              dopaminePercentage <= 75 ? 'تحسن ملحوظ في تذوق متعة الحياة البسيطة.' :
                                dopaminePercentage <= 90 ? 'تقارب مستويات الدوبامين الطبيعية بشكل ممتاز.' :
                                  'استشفاء شبه كامل لمستقبلات الدوبامين بالفص الجبهي.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Wasted vs Saved Calculator */}
                  <div className={cn(glassCardClass, "p-8 relative overflow-hidden")}>
                    <h3 className="text-xl font-black text-white flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-emerald-400" />
                      حاسبة عوائد التعافي واستعادة الوقت
                    </h3>
                    <p className="text-white/40 text-xs mt-1">
                      حساب تقديري للوقت الثمين والطاقة المستردة بعد التوقف عن تصفح الإباحية وممارسة العادات المدمرة.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 items-center">
                      <div className="bg-white/[0.01] border border-white/10 rounded-2xl p-4 space-y-3 backdrop-blur-md">
                        <label className="text-[10px] text-white/40 font-bold block">
                          معدل الساعات المهدورة أسبوعياً في المشاهدة والآثار التابعة لها:
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={chastityData.wastedHoursPerWeek}
                            onChange={(e) => {
                              const val = Math.max(1, Number(e.target.value));
                              saveChastityData({ ...chastityData, wastedHoursPerWeek: val });
                            }}
                            className="bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-center w-20 focus:outline-none focus:border-emerald-500 text-emerald-400 font-bold"
                          />
                          <span className="text-xs text-white/60">ساعات / أسبوع</span>
                        </div>
                        <p className="text-[9px] text-white/30">يشمل ذلك البحث، المشاهدة، التشتت الذهني، والخمول البدني اللاحق.</p>
                      </div>

                      <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 text-center backdrop-blur-md">
                          <span className="text-2xl font-black text-emerald-400 block">{calculatorYield.hoursSaved} ساعة</span>
                          <span className="text-[10px] text-white/40 font-bold">مستردة في هذه السلسلة</span>
                        </div>

                        <div className="bg-white/[0.015] border border-white/10 rounded-2xl p-4 text-center backdrop-blur-md">
                          <span className="text-2xl font-black text-white block">{calculatorYield.yearlyWastedHours} ساعة</span>
                          <span className="text-[10px] text-white/40 font-bold">تهدر سنوياً في العادة ({calculatorYield.yearlyWastedDays} يوماً كاملاً)</span>
                        </div>

                        <div className="bg-white/[0.015] border border-white/10 rounded-2xl p-4 text-center col-span-2 sm:col-span-1 backdrop-blur-md">
                          <span className="text-xs text-white/40 block mb-1">تستطيع بدلاً منها تحقيق:</span>
                          <div className="text-[10px] text-emerald-400 font-bold space-y-0.5">
                            <div>📖 قراءة {calculatorYield.booksRead} كتب متوسطة</div>
                            <div>🎓 إنهاء {calculatorYield.coursesFinished} كورسات تعليمية</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Daily Protective Actions Checklists */}
                  <div className={cn(glassCardClass, "p-8")}>
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="text-2xl font-black text-white">العادات الوقائية اليومية</h3>
                        <p className="text-white/40 text-xs mt-1">سلوكيات عملية يومية تشكل درعاً يمنعك من الوصول لشاشات الفتنة.</p>
                      </div>
                      <span className="text-xs font-black text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-3 py-1 rounded-lg">
                        {Object.values(chastityData.habitChecklist).filter(Boolean).length} / 6 مكتمل
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { key: 'blockSites', label: 'تفعيل حواجب المواقع بالكامل', desc: 'استخدام تطبيقات DNS الوقائية لمنع الإباحية.' },
                        { key: 'noPhoneInBed', label: 'عدم إدخال الهاتف لغرفة النوم / الحمام', desc: 'تجنب وضع الهاتف بجانبك وقت الخلود للنوم.' },
                        { key: 'sports', label: 'ممارسة الرياضة أو المشي (20 دقيقة)', desc: 'تفريغ هرمون التوتر وتصريف الطاقة الجسدية الزائدة.' },
                        { key: 'adhkar', label: 'الالتزام بأذكار الصباح والمساء', desc: 'الحصن الإيماني الأكبر لتثبيت السكينة في القلب.' },
                        { key: 'quranReading', label: 'قراءة ورد يومي من القرآن', desc: 'تطهير البصر والقلب بكلام رب العالمين.' },
                        { key: 'goodCompany', label: 'التواصل الاجتماعي البناء', desc: 'تجنب العزلة والحديث مع صديق صالح أو أفراد الأسرة.' },
                      ].map((item) => {
                        const isChecked = chastityData.habitChecklist[item.key] || false;
                        return (
                          <div
                            key={item.key}
                            onClick={() => handleToggleHabit(item.key)}
                            className={cn(
                              "p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none backdrop-blur-md",
                              isChecked
                                ? "bg-emerald-950/20 border-emerald-500/30 text-white"
                                : "bg-white/[0.015] border-white/5 hover:border-white/15 text-white/60"
                            )}
                          >
                            <button
                              className={cn(
                                "w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 mt-0.5 transition-all",
                                isChecked ? "bg-emerald-500 border-emerald-500 text-black animate-pulse" : "bg-white/5 border-white/20 text-transparent"
                              )}
                            >
                              <Check className="w-3.5 h-3.5 stroke-[4px]" />
                            </button>
                            <div>
                              <h4 className="font-bold text-sm text-white/90">{item.label}</h4>
                              <p className="text-[11px] text-white/40 mt-0.5 leading-relaxed">{item.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Settings and Backup Widget */}
                  <div className={cn(glassCardClass, "p-8")}>
                    <h3 className="text-xl font-black text-white flex items-center gap-2">
                      <FileJson className="w-5 h-5 text-emerald-400" />
                      إدارة النسخ الاحتياطي ونقل البيانات
                    </h3>
                    <p className="text-white/40 text-xs mt-1">تصدير واستيراد سجلات صمودك ومذكراتك بملف واحد للتبديل بين الأجهزة بأمان.</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                      <button
                        onClick={handleExportData}
                        className="bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold p-4 rounded-2xl text-xs transition-all flex flex-col items-center justify-center gap-2 backdrop-blur-md"
                      >
                        <Download className="w-5 h-5 text-emerald-400" />
                        <span>تصدير نسخة احتياطية (JSON)</span>
                      </button>

                      <label className="bg-white/5 hover:bg-white/10 text-white border border-dashed border-white/20 font-bold p-4 rounded-2xl text-xs transition-all flex flex-col items-center justify-center gap-2 cursor-pointer text-center backdrop-blur-md">
                        <Upload className="w-5 h-5 text-emerald-400" />
                        <span>استيراد نسخة احتياطية</span>
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleImportData}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Side Widgets */}
                <div className="space-y-8">

                  {/* Ambient Noise Player */}
                  <div className={cn(glassCardClass, "p-8 text-right relative overflow-hidden")}>
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      <Volume2 className="w-5 h-5 text-emerald-400" />
                      عازل المثيرات السمعية التخليقي
                    </h3>
                    <p className="text-white/40 text-[10px] mt-1 mb-5">
                      مشغل أصوات طبيعية يولد ترددات صوتية برمجية تفيد في عزل عقلك عن الضوضاء وتهدئة نبضات القلق والتوتر (يعمل بالكامل أوفلاين).
                    </p>

                    <div className="space-y-3">
                      {[
                        { id: 'brown', label: '🟫 الضوضاء البنية (تفريغ الأفكار)', desc: 'تردد منخفض عميق ممتاز لتهدئة القلق وتصفية العقل.' },
                        { id: 'rain', label: '🌧️ صوت المطر الاصطناعي (التركيز)', desc: 'توليد برنامج قطرات مطر متغيرة تساعد على التركيز التام.' },
                        { id: 'ocean', label: '🌊 أمواج البحر التخليقية (الاسترخاء)', desc: 'أصوات أمواج تتصاعد وتهبط تلقائياً لمساعدتك على النوم والراحة.' }
                      ].map(sound => (
                        <div
                          key={sound.id}
                          className={cn(
                            "p-3 rounded-2xl border flex items-center justify-between transition-all backdrop-blur-md",
                            ambientPlaying === sound.id ? "bg-emerald-500/10 border-emerald-500/30" : "bg-white/[0.015] border-white/5"
                          )}
                        >
                          <div className="flex-1 pr-1 text-right">
                            <span className="text-xs font-black text-white block">{sound.label}</span>
                            <span className="text-[9px] text-white/40 mt-0.5 block leading-normal">{sound.desc}</span>
                          </div>

                          {ambientPlaying === sound.id ? (
                            <button
                              onClick={stopAmbient}
                              className="p-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white flex items-center justify-center transition-colors"
                              title="إيقاف"
                            >
                              <VolumeX className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => startAmbient(sound.id)}
                              className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center transition-all"
                              title="تشغيل"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {ambientPlaying && (
                      <div className="mt-4 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-center justify-between backdrop-blur-md">
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1.5">
                          <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                          مشغل طاقة العزل الصوتي مفعل حالياً...
                        </span>
                        <button onClick={stopAmbient} className="text-[10px] text-red-400 hover:text-red-300 font-bold">
                          إيقاف الكل
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Achievements */}
                  <div className={cn(glassCardClass, "p-8")}>
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      <Award className="w-5 h-5 text-emerald-400" />
                      أوسمة وإنجازات التعافي
                    </h3>
                    <p className="text-white/40 text-xs mt-1 mb-6">تحفزك للاستمرار في مهام التعافي وتزكية النفس اليومية.</p>

                    <div className="grid grid-cols-4 gap-3">
                      {achievements.map((ach) => (
                        <div
                          key={ach.id}
                          title={`${ach.title}: ${ach.desc}`}
                          className={cn(
                            "aspect-square rounded-2xl border flex flex-col items-center justify-center transition-all p-2 relative group cursor-help backdrop-blur-md",
                            ach.unlocked
                              ? `${ach.bg} border-emerald-500/30 text-white shadow-[0_0_15px_rgba(16,185,129,0.15)]`
                              : "bg-white/[0.01] border-white/5 text-white/10"
                          )}
                        >
                          <ach.icon className={cn("w-6 h-6 mb-1", ach.unlocked ? ach.color : "text-white/10")} />
                          <span className={cn("text-[9px] font-black block truncate w-full text-center", ach.unlocked ? "text-white/80" : "text-white/10")}>
                            {ach.title}
                          </span>

                          <div className="absolute bottom-full mb-2 hidden group-hover:block bg-zinc-950 border border-white/10 rounded-xl p-3 text-right z-30 shadow-2xl w-48 pointer-events-none backdrop-blur-md">
                            <span className={cn("text-xs font-black block", ach.unlocked ? "text-emerald-400" : "text-white/40")}>
                              {ach.title} {ach.unlocked ? '🔓 (مكتسب)' : '🔒 (مغلق)'}
                            </span>
                            <p className="text-[10px] text-white/60 leading-relaxed mt-1">{ach.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Gaze Shield widget */}
                  <div className={cn(glassCardClass, "p-8 text-center relative overflow-hidden")}>
                    <div className="absolute inset-0 opacity-[0.01] bg-[radial-gradient(#10b981_1px,transparent_1px)] bg-[size:20px_20px]" />
                    <EyeOff className="w-12 h-12 text-emerald-400 mx-auto mb-4 filter drop-shadow-[0_0_8px_rgba(16,185,129,0.2)] animate-pulse" />
                    <h3 className="text-xl font-black text-white">حصن العين والسمع</h3>
                    <p className="text-white/40 text-xs mt-1 px-4 leading-relaxed">
                      سجل انتصاراتك اليومية في غض البصر ومنع النظر للمحرمات لتعتاد عينك على الطهارة.
                    </p>

                    <div className="my-8">
                      <div className="inline-block relative">
                        <div className="w-32 h-32 rounded-full border-4 border-emerald-500/20 flex items-center justify-center bg-emerald-500/5 shadow-2xl backdrop-blur-md">
                          <span className="text-5xl font-black text-emerald-400" style={textGlowStyle}>{chastityData.gazeLowerings}</span>
                        </div>
                        <span className="absolute -top-1 -right-1 flex h-4 w-4">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
                        </span>
                      </div>
                      <div className="text-xs text-white/40 font-bold mt-3">الهدف اليومي الموصى به: 5 مرات غض بصر</div>
                    </div>

                    <button
                      onClick={handleIncrementGaze}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-black py-3 px-6 rounded-2xl transition-all shadow-xl shadow-emerald-500/10 hover:scale-103 flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5 stroke-[3px]" />
                      <span>سجل غض بصر ناجح (+1)</span>
                    </button>
                  </div>

                  {/* Supplication */}
                  <div className="bg-gradient-to-b from-[#111827]/20 to-[#030712]/40 border border-emerald-500/10 rounded-[2.25rem] p-8 text-right relative overflow-hidden backdrop-blur-md shadow-2xl">
                    <div className="absolute top-4 left-4 opacity-5">
                      <Heart className="w-24 h-24 text-emerald-400" />
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-black tracking-wider uppercase mb-4">
                      <BookOpen className="w-4 h-4" />
                      <span>دعاء التثبيت والعفة من السنة</span>
                    </div>
                    <p className="quran-font text-lg text-emerald-50/90 leading-loose mb-6">
                      «اللَّهُمَّ إنِّي أَسْأَلُكَ الهُدَى وَالتُّقَى، وَالعَفَافَ وَالغِنَى، اللَّهُمَّ طَهِّرْ قَلْبِي، وَحَصِّنْ فَرْجِي، وَاعْصِمْنِي مِنَ الفِتَنِ مَا ظَهَرَ مِنْهَا وَمَا بَطَنَ.»
                    </p>
                    <div className="text-white/40 text-xs border-t border-white/5 pt-4">
                      نصيحة إيمانية: ردده عند وساوس النفس العابرة ليحرس الله جوارحك.
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: CHALLENGE */}
            {activeTab === 'challenge' && (
              <motion.div
                key="challenge"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className={cn(glassCardClass, "p-8")}>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                      <h3 className="text-2xl font-black text-white">تحدي الـ 90 يوماً للتحول العصبي</h3>
                      <p className="text-white/40 text-xs mt-1">تتبع رحلتك يوماً بيوم. 90 يوماً كافية لإحداث تعديل بنيوي في الخلايا العصبية للفص الجبهي.</p>
                    </div>
                    <div className="bg-emerald-500/5 border border-emerald-500/20 px-4 py-2 rounded-xl text-xs font-black text-emerald-400 backdrop-blur-md">
                      إتمام التحدي: {chastityData.completedDays.length} / 90 يوماً ({Math.round((chastityData.completedDays.length / 90) * 100)}%)
                    </div>
                  </div>

                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                    {Array.from({ length: 90 }, (_, i) => {
                      const dayNumber = i + 1;
                      const isCompleted = chastityData.completedDays.includes(dayNumber);
                      const isCurrent = timeElapsed.days === i && chastityData.startDate;

                      const getDayTip = (d: number) => {
                        if (d === 1) return "احذف المقاطع والصور فوراً";
                        if (d === 3) return "تجنب العزلة الليلة";
                        if (d === 7) return "مارس الرياضة بكثافة";
                        if (d === 14) return "تصدق بنية التثبيت والعفة";
                        if (d === 30) return "أكملت ثلث المسار، أنت بطل!";
                        if (d === 60) return "بقي شهر واحد، استمر";
                        if (d === 90) return "الحرية الكاملة بفضل الله!";
                        return `اليوم ${d} من الصمود واليقظة`;
                      };

                      return (
                        <div
                          key={dayNumber}
                          title={getDayTip(dayNumber)}
                          className={cn(
                            "aspect-square rounded-xl border flex flex-col items-center justify-center relative cursor-help transition-all duration-300 backdrop-blur-md",
                            isCompleted
                              ? "bg-gradient-to-tr from-emerald-500 to-teal-400 text-black border-emerald-400 font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                              : isCurrent
                                ? "bg-white/5 border-emerald-500 text-emerald-400 font-black animate-pulse scale-105"
                                : "bg-white/[0.015] border-white/5 text-white/20 hover:border-white/20 hover:text-white/40"
                          )}
                        >
                          <span className="text-sm md:text-base font-black">{dayNumber}</span>
                          {isCompleted && <Check className="w-3 h-3 stroke-[3px] absolute bottom-1 text-black" />}
                          {isCurrent && <span className="absolute bottom-1 w-1.5 h-1.5 bg-emerald-500 rounded-full" />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className={cn(glassCardClass, "p-8")}>
                  <h3 className="text-2xl font-black text-white mb-6">خريطة التعافي الفسيولوجي والعصبي</h3>
                  <div className="space-y-6 relative before:absolute before:inset-y-0 before:right-6 before:w-px before:bg-white/10">
                    {milestones.map((item, idx) => {
                      const isReached = timeElapsed.days >= item.day;
                      return (
                        <div key={idx} className="relative pr-16 group/timeline">
                          <div className={cn(
                            "absolute right-2.5 top-2 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all z-10",
                            isReached
                              ? "bg-emerald-500 border-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                              : "bg-zinc-950 border-white/10 text-white/30"
                          )}>
                            {isReached ? <Check className="w-4 h-4 stroke-[3px]" /> : <span className="text-[10px] font-black">{item.day}</span>}
                          </div>

                          <div className={cn(
                            "p-6 rounded-3xl border transition-all backdrop-blur-md",
                            isReached
                              ? "bg-emerald-950/5 border-emerald-500/20 text-white"
                              : "bg-white/[0.015] border-white/5 text-white/50"
                          )}>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                              <h4 className={cn("text-lg font-black", isReached ? "text-emerald-400" : "text-white/60")} style={isReached ? textGlowStyle : undefined}>
                                {item.title}
                              </h4>
                              <span className="text-xs px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg font-bold">
                                اليوم {item.day}
                              </span>
                            </div>
                            <p className="text-sm text-white/60 leading-relaxed">{item.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: VIDEO LIBRARY */}
            {activeTab === 'videos' && (
              <motion.div
                key="videos"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className={cn(glassCardClass, "p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6")}>
                  <div>
                    <h3 className="text-2xl font-black text-white">المكتبة المرئية للتعافي والتوعية</h3>
                    <p className="text-white/40 text-xs mt-1">فيديوهات علمية وسلوكية وشرعية منتقاة بعناية لمساعدتك في فهم لغز الإدمان والتغلب عليه.</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="text-xs text-emerald-400 font-bold bg-emerald-500/5 border border-emerald-500/10 px-3.5 py-2 rounded-xl backdrop-blur-md">
                      فيديوهات تمت مشاهدتها: {chastityData.watchedVideos.length} من {videos.length}
                    </div>

                    <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 backdrop-blur-md">
                      {[
                        { id: 'all', label: 'الكل' },
                        { id: 'medical', label: 'طبي/عصبي' },
                        { id: 'psych', label: 'سلوكي/نفسي' },
                        { id: 'spiritual', label: 'إيماني' },
                      ].map(btn => (
                        <button
                          key={btn.id}
                          onClick={() => setVideoCategory(btn.id as any)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-black transition-all",
                            videoCategory === btn.id ? "bg-emerald-500 text-black font-black" : "text-white/40 hover:text-white/80"
                          )}
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredVideos.map(video => {
                    const isWatched = chastityData.watchedVideos.includes(video.id);
                    return (
                      <div
                        key={video.id}
                        className={cn(
                          "group rounded-3xl border overflow-hidden flex flex-col bg-zinc-950/40 backdrop-blur-md transition-all",
                          isWatched ? "border-emerald-500/20" : "border-white/5 hover:border-white/15"
                        )}
                      >
                        <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                          <img
                            src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                            alt={video.title}
                            className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-500"
                          />

                          <a
                            href={`https://www.youtube.com/watch?v=${video.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute w-12 h-12 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer z-10"
                            onClick={() => {
                              if (!isWatched) handleToggleWatchVideo(video.id);
                            }}
                          >
                            <Play className="w-5 h-5 fill-current" />
                          </a>

                          <div className="absolute bottom-3 left-3 bg-black/80 px-2 py-1 rounded-md text-[10px] text-white/80 font-mono">
                            {video.duration}
                          </div>

                          {isWatched && (
                            <div className="absolute top-3 right-3 bg-emerald-500 text-black text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md flex items-center gap-1 shadow-lg">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>تمت المشاهدة</span>
                            </div>
                          )}
                        </div>

                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/5 px-2.5 py-1 rounded-md border border-emerald-500/10">
                              {video.channel}
                            </span>
                            <h4 className="text-base font-black text-white mt-3 mb-2 leading-snug group-hover:text-emerald-300 transition-colors">
                              {video.title}
                            </h4>
                            <p className="text-xs text-white/40 leading-relaxed mb-4">
                              {video.desc}
                            </p>
                          </div>

                          <div className="flex justify-between items-center border-t border-white/5 pt-4 mt-auto">
                            <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
                              القسم: {video.category === 'medical' ? 'علم الأعصاب' : video.category === 'psych' ? 'سلوكي ونفسي' : 'إيماني وشرعي'}
                            </span>

                            <button
                              onClick={() => handleToggleWatchVideo(video.id)}
                              className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
                                isWatched
                                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                                  : "bg-white/5 border-white/10 hover:bg-white/10 text-white/60 hover:text-white"
                              )}
                            >
                              {isWatched ? 'إلغاء المشاهدة' : 'حدد كمشاهد'}
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* TAB: ADDICTION SEVERITY QUIZ */}
            {activeTab === 'quiz' && (
              <motion.div
                key="quiz"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-4xl mx-auto space-y-8"
              >
                <div className={cn(glassCardClass, "p-8 md:p-12 relative overflow-hidden")}>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/[0.01] blur-[120px] rounded-full pointer-events-none" />

                  {/* Intro Slide */}
                  {quizStep === -1 && (
                    <div className="text-center py-6">
                      <Brain className="w-16 h-16 text-emerald-400 mx-auto mb-6 animate-pulse filter drop-shadow-[0_0_8px_rgba(16,185,129,0.2)]" />
                      <h3 className="text-3xl font-black text-white mb-3">مقياس شدة إدمان الإباحية</h3>
                      <p className="text-white/40 text-sm max-w-md mx-auto leading-relaxed">
                        اختبار ذاتي سريري تم بناؤه بناءً على معايير تشخيص الإدمان السلوكي. أجب بصدق تام لمعرفة مستوى تغلغل هذه العادة في نظام المكافأة في دماغك.
                      </p>

                      <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-2xl max-w-md mx-auto my-8 text-xs text-emerald-500/80 leading-relaxed font-bold backdrop-blur-md">
                        ℹ️ تنبيه: لا يتم حفظ أي إجابات أو إرسالها إلى أي مكان. نتيجتك تظهر لك محلياً وتساعدك في توجيه خطتك العلاجية.
                      </div>

                      <button
                        onClick={() => setQuizStep(0)}
                        className="bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-black text-lg px-10 py-4 rounded-2xl transition-all hover:scale-103 shadow-lg shadow-emerald-500/10"
                      >
                        ابدأ التقييم الذاتي الآن
                      </button>

                      {chastityData.quizResult && (
                        <div className="mt-8 border-t border-white/10 pt-6 text-center">
                          <p className="text-white/40 text-xs">آخر تقييم أجريته في: {chastityData.quizResult.date}</p>
                          <p className="text-white/80 text-sm font-black mt-1">النتيجة الحالية: {chastityData.quizResult.level} ({chastityData.quizResult.score} نقطة)</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Quiz Steps */}
                  {quizStep >= 0 && quizStep < 10 && (
                    <div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full mb-8 overflow-hidden backdrop-blur-sm">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                          style={{ width: `${((quizStep) / 10) * 100}%` }}
                        />
                      </div>

                      <div className="flex justify-between items-center text-xs text-white/40 font-bold mb-4">
                        <span>سؤال {quizStep + 1} من 10</span>
                        <span>{Math.round(((quizStep) / 10) * 100)}% مكتمل</span>
                      </div>

                      <h4 className="text-xl md:text-2xl font-black text-white mb-8 leading-snug">
                        {quizQuestions[quizStep].q}
                      </h4>

                      <div className="space-y-3">
                        {quizQuestions[quizStep].opts.map((opt, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleQuizAnswer(idx)}
                            className="w-full text-right p-5 rounded-2xl bg-white/[0.015] border border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/[0.02] text-white/70 hover:text-white font-bold transition-all text-sm sm:text-base flex items-center justify-between group backdrop-blur-md"
                          >
                            <span>{opt}</span>
                            <span className="w-6 h-6 rounded-lg bg-white/5 text-[11px] font-black flex items-center justify-center text-white/40 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                              {idx === 0 ? 'أ' : idx === 1 ? 'ب' : idx === 2 ? 'ج' : 'د'}
                            </span>
                          </button>
                        ))}
                      </div>

                      <div className="mt-8 flex justify-between items-center text-xs text-white/30">
                        <span>اختر الإجابة الأقرب لواقعك الفعلي</span>
                        <button
                          onClick={() => setQuizStep(-1)}
                          className="hover:text-white transition-colors"
                        >
                          إلغاء الاختبار والعودة
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Result Screen */}
                  {quizStep === 10 && chastityData.quizResult && (
                    <div className="text-center py-6">
                      <div className="w-24 h-24 rounded-full mx-auto flex items-center justify-center bg-emerald-500/10 border-4 border-emerald-500 text-emerald-400 mb-6 shadow-2xl animate-pulse">
                        <span className="text-4xl font-black" style={textGlowStyle}>{chastityData.quizResult.score}</span>
                      </div>

                      <h3 className="text-2xl md:text-3xl font-black text-white mb-2">مستوى خطورة العلاقة بالإباحية</h3>
                      <h4 className="text-xl font-bold text-emerald-400 mb-6" style={textGlowStyle}>{chastityData.quizResult.level}</h4>

                      <div className="bg-white/[0.015] border border-white/10 rounded-3xl p-6 text-right max-w-xl mx-auto space-y-4 mb-8 backdrop-blur-md">
                        <h5 className="font-black text-white text-base">📋 التفسير والتوجيه السلوكي:</h5>
                        {chastityData.quizResult.score <= 5 ? (
                          <p className="text-xs text-white/60 leading-relaxed">
                            أنت في وضع آمن نسبياً، علاقتك بالمواقع الإباحية ضعيفة أو منعدمة. استمر في تحصين نفسك، واهتم بغض البصر والتزام الرفقة الصالحة لكي تظل في هذه الطهارة.
                          </p>
                        ) : chastityData.quizResult.score <= 15 ? (
                          <p className="text-xs text-white/60 leading-relaxed">
                            علاقتك مع الإباحية دخلت مرحلة العادة الخطرة. دماغك بدأ بربط تخفيف التوتر والملل بالمشاهدة. ننصحك بالبدء فوراً في تفعيل حواجب المواقع وحساب الأيام ومحاسبة نفسك يومياً لمنع انزلاقها للإدمان التام.
                          </p>
                        ) : chastityData.quizResult.score <= 25 ? (
                          <p className="text-xs text-white/60 leading-relaxed">
                            أنت تعاني من إدمان سلوكي شديد. الإباحية تؤثر سلباً على تركيزك، صلواتك، وحياتك اليومية. من الضروري جداً الالتزام بتحدي الـ 90 يوماً بشكل صارم، وحظر المواقع حظراً تاماً ببرامج مدفوعة إذا لزم الأمر، ومشاهدة مقاطع كيمياء الأعصاب لتفهم كيف تتغلب على رغبات دماغك المتكررة.
                          </p>
                        ) : (
                          <p className="text-xs text-white/60 leading-relaxed">
                            أنت تعاني من إدمان سلوكي قهري شديد وخطير. عقلك يعتمد كلياً على المشاهدة للتخلص من أي مشاعر ضغط. ننصحك بشدة وبدون تأخير بمشاهدة مقاطع كيمياء الدماغ، والبحث عن رفيق تعافٍ تثق به وتتحدث معه، وتفعيل الحظر الصارم، واستخدم زر الطوارئ كلما راودتك الرغبة، واليقين بأن التغيير ممكن مهما طال حبسك.
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row justify-center gap-3">
                        <button
                          onClick={() => setActiveTab('dashboard')}
                          className="bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-black px-6 py-3.5 rounded-2xl text-sm transition-all hover:scale-103"
                        >
                          ابدأ تطبيق الخطة في لوحة التحكم
                        </button>
                        <button
                          onClick={handleRestartQuiz}
                          className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold px-6 py-3.5 rounded-2xl text-sm transition-all"
                        >
                          إعادة إجراء التقييم
                        </button>
                      </div>
                    </div>
                  )}

                </div>

                {/* Quiz History Logs */}
                {chastityData.quizHistory && chastityData.quizHistory.length > 1 && (
                  <div className={cn(glassCardClass, "p-8")}>
                    <h3 className="text-xl font-black text-white flex items-center gap-2 mb-4">
                      <History className="w-5 h-5 text-emerald-400" />
                      تتبع مؤشر تراجع شدة الإدمان (Quiz History)
                    </h3>
                    <p className="text-white/40 text-xs mb-6">جدول زمني لنتائج اختباراتك السابقة لمراقبة مدى تحسن جهازك العصبي وزيادة تحكمك.</p>

                    <div className="space-y-3">
                      {chastityData.quizHistory.map((hist, idx) => (
                        <div key={idx} className="p-4 bg-white/[0.015] border border-white/5 rounded-2xl flex items-center justify-between text-right backdrop-blur-md">
                          <div>
                            <span className="text-xs text-white/40 block">{hist.date}</span>
                            <span className="text-sm font-bold text-white mt-1 block">{hist.level}</span>
                          </div>
                          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-lg font-black text-emerald-400">
                            {hist.score}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB: URGENT PREVENTION PLAN CREATOR */}
            {activeTab === 'prevention' && (
              <motion.div
                key="prevention"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-4xl mx-auto space-y-8"
              >
                {/* Letter to self */}
                <div className={cn(glassCardClass, "p-8 md:p-12 relative overflow-hidden")}>
                  <h3 className="text-xl font-black text-white flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-emerald-400" />
                    عهد الطهارة ورسالة الطوارئ الذاتية (رسالتك إلى نفسك وقت الرغبة)
                  </h3>
                  <p className="text-white/40 text-xs mb-6">
                    اكتب رسالة صادقة لنفسك الآن وأنت في حالة وعي تام وذهن صافٍ. عندما تشعر برغبة شديدة وتفتح "زر الطوارئ"، سنعرض لك هذه الرسالة فوراً لتذكرك بوعودك وخلايا عقلك السليمة.
                  </p>

                  <div className="space-y-4 text-right">
                    <textarea
                      value={chastityData.letterToSelf}
                      onChange={(e) => saveChastityData({ ...chastityData, letterToSelf: e.target.value })}
                      placeholder="اكتب هنا بصدق تام: تذكر ألم الندم بعد الذنب، تذكر أهدافك، صحتك، والديك، وكرامتك التي تضيع أمام الشاشات... لا تنخدع بالدوبامين الكاذب..."
                      className={cn(glassInputClass, "w-full h-32 resize-none leading-relaxed font-bold")}
                    />

                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-white/30">✓ يتم حفظ رسالتك محلياً بشكل فوري ومشفر.</span>
                      <button
                        onClick={() => {
                          toast({
                            title: "🔒 تم حفظ الرسالة الذاتية",
                            description: "ستظهر لك رسالتك الآن في غرفة الطوارئ وقت الأزمات لتذكرك بعهدك.",
                          });
                        }}
                        className="bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-black text-xs py-2 px-5 rounded-lg flex items-center gap-1.5 transition-all shadow-md"
                      >
                        <Save className="w-3.5 h-3.5" /> حفظ العهد
                      </button>
                    </div>
                  </div>
                </div>

                <div className={cn(glassCardClass, "p-8 md:p-12 relative overflow-hidden")}>
                  <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/[0.01] blur-[120px] rounded-full pointer-events-none" />

                  <div className="text-right pb-6 border-b border-white/10">
                    <h3 className="text-2xl font-black text-white flex items-center gap-2">
                      <HeartHandshake className="w-7 h-7 text-emerald-400" />
                      منشئ خطة الطوارئ والوقاية من الانتكاسة الشخصية
                    </h3>
                    <p className="text-white/40 text-xs mt-1">
                      اكتب خطتك الدفاعية التي ستلجأ إليها عندما يثور العقل وتشتد الرغبة. هذه الخطة هي مرجعك عند الأزمات.
                    </p>
                  </div>

                  <div className="mt-8 space-y-8 text-right">

                    {/* Triggers */}
                    <div className="space-y-3">
                      <label className="text-sm font-black text-white block">1. ما هي أهم المواقف/المحفزات التي تجعلك عرضة للسقوط؟</label>
                      <div className="flex flex-wrap gap-2">
                        {['الملل والفراغ الطويل', 'العزلة في غرفة النوم ليلاً', 'السهر بعد منتصف الليل', 'تصفح تيك توك / انستقرام', 'سماع الموسيقى المثيرة', 'الغضب والتوتر النفسي', 'الهاتف معي داخل الحمام'].map(trig => {
                          const isSelected = planTriggers.includes(trig);
                          return (
                            <button
                              key={trig}
                              onClick={() => {
                                if (isSelected) setPlanTriggers(planTriggers.filter(t => t !== trig));
                                else setPlanTriggers([...planTriggers, trig]);
                              }}
                              className={cn(
                                "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                                isSelected
                                  ? "bg-gradient-to-r from-emerald-500 to-teal-400 text-black border-emerald-400"
                                  : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"
                              )}
                            >
                              {trig}
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex gap-2 max-w-md">
                        <input
                          type="text"
                          value={customTriggerInput}
                          onChange={(e) => setCustomTriggerInput(e.target.value)}
                          placeholder="أضف محفزاً خاصاً بك..."
                          className={cn(glassInputClass, "flex-1 px-4 py-2")}
                        />
                        <button
                          onClick={() => {
                            if (customTriggerInput) {
                              setPlanTriggers([...planTriggers, customTriggerInput]);
                              setCustomTriggerInput('');
                            }
                          }}
                          className="bg-white/10 hover:bg-white/20 text-white text-xs px-4 py-2 rounded-xl font-bold border border-white/5"
                        >
                          إضافة
                        </button>
                      </div>
                    </div>

                    {/* Coping strategies */}
                    <div className="space-y-3">
                      <label className="text-sm font-black text-white block">2. ما هي الأنشطة البدنية التي ستقوم بها فوراً لكسر الرغبة؟</label>
                      <div className="flex flex-wrap gap-2">
                        {['الاستحمام بالماء البارد جداً', 'الخروج فوراً من الغرفة لبيت العائلة', 'أداء 20 تمرين ضغط أو قرفصاء', 'الخروج للمشي السريع في الخارج', 'وضع الهاتف خارج الغرفة وإغلاقه', 'شرب كوب كبير من الماء'].map(cop => {
                          const isSelected = planCopings.includes(cop);
                          return (
                            <button
                              key={cop}
                              onClick={() => {
                                if (isSelected) setPlanCopings(planCopings.filter(c => c !== cop));
                                else setPlanCopings([...planCopings, cop]);
                              }}
                              className={cn(
                                "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                                isSelected
                                  ? "bg-gradient-to-r from-emerald-500 to-teal-400 text-black border-emerald-400"
                                  : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"
                              )}
                            >
                              {cop}
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex gap-2 max-w-md">
                        <input
                          type="text"
                          value={customCopingInput}
                          onChange={(e) => setCustomCopingInput(e.target.value)}
                          placeholder="أضف إستراتيجية خاصة..."
                          className={cn(glassInputClass, "flex-1 px-4 py-2")}
                        />
                        <button
                          onClick={() => {
                            if (customCopingInput) {
                              setPlanCopings([...planCopings, customCopingInput]);
                              setCustomCopingInput('');
                            }
                          }}
                          className="bg-white/10 hover:bg-white/20 text-white text-xs px-4 py-2 rounded-xl font-bold border border-white/5"
                        >
                          إضافة
                        </button>
                      </div>
                    </div>

                    {/* Spiritual Anchors */}
                    <div className="space-y-3">
                      <label className="text-sm font-black text-white block">3. ما هي الآيات أو الأدعية أو الحكم التي ستستحضرها؟</label>
                      <div className="flex flex-wrap gap-2">
                        {['تذكر قوله تعالى: «أَلَمْ يَعْلَم بِأَنَّ اللَّهَ يَرَى»', 'دعاء: «اللهم طهر قلبي وحصن فرجي»', 'تذكر الصداع والخزي الذي يعقب المشاهدة', 'استشعار لذة الانتصار والعفة', 'الاستعاذة بالله من الشيطان والوضوء'].map(anch => {
                          const isSelected = planAnchors.includes(anch);
                          return (
                            <button
                              key={anch}
                              onClick={() => {
                                if (isSelected) setPlanAnchors(planAnchors.filter(a => a !== anch));
                                else setPlanAnchors([...planAnchors, anch]);
                              }}
                              className={cn(
                                "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                                isSelected
                                  ? "bg-gradient-to-r from-emerald-500 to-teal-400 text-black border-emerald-400"
                                  : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"
                              )}
                            >
                              {anch}
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex gap-2 max-w-md">
                        <input
                          type="text"
                          value={customAnchorInput}
                          onChange={(e) => setCustomAnchorInput(e.target.value)}
                          placeholder="أضف ذكراً أو فكرة تثبيت..."
                          className={cn(glassInputClass, "flex-1 px-4 py-2")}
                        />
                        <button
                          onClick={() => {
                            if (customAnchorInput) {
                              setPlanAnchors([...planAnchors, customAnchorInput]);
                              setCustomAnchorInput('');
                            }
                          }}
                          className="bg-white/10 hover:bg-white/20 text-white text-xs px-4 py-2 rounded-xl font-bold border border-white/5"
                        >
                          إضافة
                        </button>
                      </div>
                    </div>

                    {/* Safe Contacts */}
                    <div className="space-y-3">
                      <label className="text-sm font-black text-white block">4. من هو الصديق، الموجه، أو الرفيق الذي ستتحدث معه لتكشف رغبتك قبل الانتكاسة؟</label>
                      <div className="flex flex-wrap gap-2">
                        {['refiq_taafi_waay', 'أخي أو صديقي المفضل المقرب', 'الاتصال بوالدتي أو أحد والدي', 'الخروج للمسجد والجلوس مع الرواد صالحي الرفقة'].map(cont => {
                          const isSelected = planContacts.includes(cont);
                          return (
                            <button
                              key={cont}
                              onClick={() => {
                                if (isSelected) setPlanContacts(planContacts.filter(c => c !== cont));
                                else setPlanContacts([...planContacts, cont]);
                              }}
                              className={cn(
                                "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                                isSelected
                                  ? "bg-gradient-to-r from-emerald-500 to-teal-400 text-black border-emerald-400"
                                  : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"
                              )}
                            >
                              {cont}
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex gap-2 max-w-md">
                        <input
                          type="text"
                          value={customContactInput}
                          onChange={(e) => setCustomContactInput(e.target.value)}
                          placeholder="أضف جهة اتصال آمنة..."
                          className={cn(glassInputClass, "flex-1 px-4 py-2")}
                        />
                        <button
                          onClick={() => {
                            if (customContactInput) {
                              setPlanContacts([...planContacts, customContactInput]);
                              setCustomContactInput('');
                            }
                          }}
                          className="bg-white/10 hover:bg-white/20 text-white text-xs px-4 py-2 rounded-xl font-bold border border-white/5"
                        >
                          إضافة
                        </button>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/10 flex flex-wrap gap-4 items-center justify-between">
                      <button
                        onClick={handleSavePreventionPlan}
                        className="bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-black text-sm px-8 py-3.5 rounded-2xl transition-all shadow-xl hover:scale-103"
                      >
                        حفظ وتفعيل خطة الوقاية الشخصية
                      </button>

                      {chastityData.preventionPlan && (
                        <span className="text-emerald-400 text-xs font-bold bg-emerald-500/5 border border-emerald-500/20 px-3 py-1.5 rounded-lg backdrop-blur-md">
                          ✓ تم إنشاء درع وقاية مفعل مسبقاً
                        </span>
                      )}
                    </div>

                  </div>
                </div>

                {/* Display Current Plan */}
                {chastityData.preventionPlan && (
                  <div className={cn(glassCardClass, "p-8 md:p-12 text-right relative overflow-hidden")}>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/[0.02] blur-[80px] rounded-full pointer-events-none" />

                    <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/10">
                      <h3 className="text-xl font-black text-white flex items-center gap-2">
                        <Shield className="w-5 h-5 text-emerald-400 animate-pulse" />
                        بطاقة الطوارئ الشخصية لدرع العفة
                      </h3>
                      <button
                        onClick={() => {
                          const planText = `🛡️ بطاقة درع العفة للوقاية الشخصية:
1. محفزات الخطر: ${chastityData.preventionPlan?.riskTriggers.join(', ')}
2. الحلول العاجلة: ${chastityData.preventionPlan?.copingStrategies.join(', ')}
3. مثبتات إيمانية: ${chastityData.preventionPlan?.spiritualAnchors.join(', ')}
4. تواصل آمن مع: ${chastityData.preventionPlan?.safeContacts.join(', ')}`;

                          navigator.clipboard.writeText(planText);
                          toast({
                            title: "📋 تم نسخ بطاقتك بنجاح",
                            description: "يمكنك حفظها في مذكراتك الخاصة للوصول السريع.",
                          });
                        }}
                        className="text-xs text-white/50 hover:text-white flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl transition-all backdrop-blur-md"
                      >
                        <Clipboard className="w-3.5 h-3.5" /> نسخ البطاقة
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs leading-relaxed">
                      <div className="space-y-4">
                        <div className="bg-black/40 border border-white/5 rounded-2xl p-4 backdrop-blur-md">
                          <h4 className="font-black text-sm text-rose-400 mb-2">🚨 محفزات الخطر التي يجب تجنبها:</h4>
                          <ul className="list-disc pr-4 space-y-1.5 text-white/70">
                            {chastityData.preventionPlan.riskTriggers.map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-black/40 border border-white/5 rounded-2xl p-4 backdrop-blur-md">
                          <h4 className="font-black text-sm text-emerald-400 mb-2">🏃‍♂️ إجراءات فورية عند ثوران الرغبة:</h4>
                          <ul className="list-disc pr-4 space-y-1.5 text-white/70">
                            {chastityData.preventionPlan.copingStrategies.map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="bg-black/40 border border-white/5 rounded-2xl p-4 backdrop-blur-md">
                          <h4 className="font-black text-sm text-cyan-400 mb-2">📖 ركائز ومثبتات إيمانية وفكرية:</h4>
                          <ul className="list-disc pr-4 space-y-1.5 text-white/70">
                            {chastityData.preventionPlan.spiritualAnchors.map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-black/40 border border-white/5 rounded-2xl p-4 backdrop-blur-md">
                          <h4 className="font-black text-sm text-yellow-400 mb-2">📞 تواصل عاجل وآمن مع:</h4>
                          <ul className="list-disc pr-4 space-y-1.5 text-white/70">
                            {chastityData.preventionPlan.safeContacts.map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB: ANALYZER & JOURNAL LOGS */}
            {activeTab === 'analyzer' && (
              <motion.div
                key="analyzer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Hour Alert and stats */}
                {dangerHoursAlert && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-3xl bg-red-950/20 border border-red-500/30 text-right text-white space-y-2 backdrop-blur-md"
                  >
                    <h4 className="font-black text-sm text-red-400">{dangerHoursAlert.title}</h4>
                    <p className="text-xs text-white/70 leading-relaxed font-bold">{dangerHoursAlert.desc}</p>
                  </motion.div>
                )}

                {/* Urge Victory Rate Gauge */}
                <div className={cn(glassCardClass, "p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden")}>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/[0.01] blur-[80px] rounded-full pointer-events-none" />
                  <div className="text-right">
                    <h3 className="text-lg font-black text-white flex items-center gap-2" style={textGlowStyle}>
                      <Award className="w-5 h-5 text-emerald-400 animate-bounce" />
                      معدل نجاح مقاومة الرغبات الحادة
                    </h3>
                    <p className="text-xs text-white/40 mt-1 leading-relaxed max-w-xl">
                      يقيس هذا المؤشر نسبة تغلبك على الشهوة الطارئة. في كل مرة تضغط على "قاومت رغبة بنجاح" بدلاً من إعلان الانتكاسة، ترتفع هذه النسبة لتثبت لنفسك أنك قادر على التحكم وتطويع كيمياء عقلك.
                    </p>
                  </div>

                  <div className="flex items-center gap-6 flex-shrink-0 z-10">
                    <div className="text-center bg-white/[0.015] border border-white/10 p-4 rounded-2xl min-w-[100px] backdrop-blur-md">
                      <span className="text-2xl font-black text-emerald-400 block" style={textGlowStyle}>{triggerStats.totalResisted}</span>
                      <span className="text-[10px] text-white/30">رغبات قاومتها</span>
                    </div>
                    <div className="text-center bg-white/[0.015] border border-white/10 p-4 rounded-2xl min-w-[100px] backdrop-blur-md">
                      <span className="text-2xl font-black text-rose-400 block">{triggerStats.total}</span>
                      <span className="text-[10px] text-white/30">انتكاسات</span>
                    </div>

                    <div className="relative w-24 h-24 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="48" cy="48" r="38" stroke="rgba(255,255,255,0.03)" strokeWidth="6" fill="none" />
                        <circle cx="48" cy="48" r="38" stroke="#10b981" strokeWidth="6" fill="none"
                          strokeDasharray={2 * Math.PI * 38}
                          strokeDashoffset={2 * Math.PI * 38 * (1 - triggerStats.victoryRatio / 100)}
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <span className="absolute text-xl font-black text-white" style={textGlowStyle}>{triggerStats.victoryRatio}%</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className={cn(glassCardClass, "p-6 text-center")}>
                    <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-3 filter drop-shadow-[0_0_8px_rgba(244,63,94,0.25)] animate-pulse" />
                    <span className="text-3xl font-black text-white">{triggerStats.total}</span>
                    <p className="text-xs text-white/40 font-bold mt-1">إجمالي التعثرات المسجلة</p>
                  </div>
                  <div className={cn(glassCardClass, "p-6 text-center")}>
                    <Smile className="w-8 h-8 text-emerald-400 mx-auto mb-3 filter drop-shadow-[0_0_8px_rgba(16,185,129,0.25)]" />
                    <span className="text-3xl font-black text-emerald-400" style={textGlowStyle}>
                      {triggerStats.total > 0 ? Math.max(1, 90 - triggerStats.total * 3) : 100}%
                    </span>
                    <p className="text-xs text-white/40 font-bold mt-1">مؤشر عافية الجهاز العصبي</p>
                  </div>
                  <div className={cn(glassCardClass, "p-6 text-center")}>
                    <Zap className="w-8 h-8 text-amber-400 mx-auto mb-3 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.25)] animate-pulse" />
                    <span className="text-3xl font-black text-white block truncate" style={textGlowStyle}>
                      {triggerStats.triggers && triggerStats.triggers[0] ? triggerStats.triggers[0].name : 'لا يوجد سجل'}
                    </span>
                    <p className="text-xs text-white/40 font-bold mt-1">المحفز الأكثر تهديداً</p>
                  </div>
                </div>

                {/* Daily Journal Form */}
                <div className={cn(glassCardClass, "p-8 md:p-12 relative overflow-hidden")}>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/[0.01] blur-[120px] rounded-full pointer-events-none" />
                  <h3 className="text-xl font-black text-white flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-emerald-400" />
                    المفكرة السلوكية اليومية والتأمل الذاتي
                  </h3>
                  <p className="text-white/40 text-xs mb-6">
                    تدوين مشاعرك وأفكارك ومستوى رغبتك يومياً هو أقوى حائط صد وعي لحماية دماغك من الانزلاق وراء الدوبامين التلقائي.
                  </p>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: Mood and Urge selector */}
                    <div className="space-y-6 text-right">
                      {/* Mood Selector */}
                      <div className="space-y-3">
                        <label className="text-xs font-black text-white block">كيف تشعر الآن؟ (الحالة المزاجية):</label>
                        <div className="grid grid-cols-5 gap-2">
                          {[
                            { name: 'متفائل', emoji: '😃' },
                            { name: 'طبيعي', emoji: '😐' },
                            { name: 'حزين', emoji: '😔' },
                            { name: 'متوتر', emoji: '😫' },
                            { name: 'مرهق', emoji: '😴' }
                          ].map(m => (
                            <button
                              key={m.name}
                              type="button"
                              onClick={() => setJournalMood(m.name)}
                              className={cn(
                                "flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition-all",
                                journalMood === m.name
                                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                                  : "bg-white/[0.01] border-white/5 text-white/55 hover:bg-white/5 hover:text-white"
                              )}
                            >
                              <span className="text-xl mb-1">{m.emoji}</span>
                              <span>{m.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Urge Level */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-black text-white block">مستوى رغبة الدماغ والإلحاح السلوكي:</label>
                          <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                            {journalUrge === 1 ? 'هدوء تام' :
                             journalUrge === 2 ? 'رغبة خفيفة' :
                             journalUrge === 3 ? 'رغبة متوسطة' :
                             journalUrge === 4 ? 'رغبة شديدة' : 'إلحاح طاحن'}
                          </span>
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                          {[1, 2, 3, 4, 5].map(lvl => (
                            <button
                              key={lvl}
                              type="button"
                              onClick={() => setJournalUrge(lvl)}
                              className={cn(
                                "py-3 rounded-2xl border text-xs font-black transition-all",
                                journalUrge === lvl
                                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                                  : "bg-white/[0.01] border-white/5 text-white/55 hover:bg-white/5"
                              )}
                            >
                              {lvl}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right: Reflection text input */}
                    <div className="space-y-4 text-right flex flex-col justify-between">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-white block">كتابة تأملاتك الحرة (أفرغ ما في عقلك):</label>
                        <textarea
                          value={journalReflection}
                          onChange={(e) => setJournalReflection(e.target.value)}
                          placeholder="اكتب هنا بصدق: ما الصعوبات التي واجهتها اليوم؟ كيف كان صمودك؟ ما الأفكار أو المخاوف التي تدور في عقلك الآن؟..."
                          className={cn(glassInputClass, "w-full h-36 resize-none leading-relaxed font-bold")}
                        />
                      </div>

                      <button
                        onClick={handleJournalSubmit}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-black text-xs py-3.5 rounded-2xl flex items-center justify-center gap-1.5 transition-all shadow-md hover:scale-101"
                      >
                        حفظ المذكرات والحصول على نقاط 📝
                      </button>
                    </div>
                  </div>
                </div>

                {/* Logs History Panel */}
                <div className={cn(glassCardClass, "p-8 md:p-10 relative overflow-hidden")}>
                  <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/[0.01] blur-[100px] rounded-full pointer-events-none" />

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-white/10 mb-8 text-right">
                    <div>
                      <h3 className="text-lg font-black text-white flex items-center gap-2">
                        <History className="w-5 h-5 text-emerald-400" />
                        سجلات التتبع والمذكرات التاريخية
                      </h3>
                      <p className="text-white/40 text-xs mt-1">تصفح سجلات مذكراتك اليومية، مقاومة الرغبات، والتعثرات السابقة.</p>
                    </div>

                    {/* Sub-tab navigation */}
                    <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 gap-1 w-full sm:w-auto">
                      {[
                        { id: 'journals', label: `📝 مذكراتي (${chastityData.journalLogs.length})` },
                        { id: 'resisted', label: `💪 مقاومة (${chastityData.resistedUrgesLog.length})` },
                        { id: 'relapses', label: `⚠️ تعثرات (${chastityData.relapsesLog.length})` }
                      ].map(subTab => (
                        <button
                          key={subTab.id}
                          onClick={() => setAnalyzerSubTab(subTab.id as any)}
                          className={cn(
                            "flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap",
                            analyzerSubTab === subTab.id
                              ? "bg-gradient-to-r from-emerald-500 to-teal-400 text-black shadow-md"
                              : "text-white/40 hover:text-white"
                          )}
                        >
                          {subTab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Render Logs based on subTab */}
                  {analyzerSubTab === 'journals' && (
                    <div className="space-y-4 text-right">
                      {chastityData.journalLogs.length === 0 ? (
                        <p className="text-white/40 text-xs py-8 text-center font-bold">لا توجد مذكرات مسجلة بعد. ابدأ بكتابة أول تأمل لك بالخيار أعلاه.</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {chastityData.journalLogs.map((entry, idx) => (
                            <div key={idx} className="p-5 bg-white/[0.015] border border-white/5 rounded-2xl space-y-3 backdrop-blur-md">
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] text-white/35 font-bold">{entry.date} - {entry.timestamp}</span>
                                <div className="flex gap-1.5">
                                  <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md">
                                    رغبة: {entry.urgeLevel}/5
                                  </span>
                                  <span className="text-[9px] font-black bg-white/5 text-white/60 px-2 py-0.5 rounded-md">
                                    مزاج: {entry.mood}
                                  </span>
                                </div>
                              </div>
                              <p className="text-xs text-white/80 leading-relaxed font-bold break-words">{entry.reflection}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {analyzerSubTab === 'resisted' && (
                    <div className="space-y-4 text-right">
                      {chastityData.resistedUrgesLog.length === 0 ? (
                        <p className="text-white/40 text-xs py-8 text-center font-bold">لا توجد مقاومات مسجلة بعد. استخدم زر "قاومت رغبة بنجاح" في لوحة التحكم عند ثوران الشهوة.</p>
                      ) : (
                        <div className="space-y-3">
                          {chastityData.resistedUrgesLog.map((urge, idx) => (
                            <div key={idx} className="p-4 bg-white/[0.015] border border-white/5 rounded-2xl flex items-center justify-between text-right backdrop-blur-md">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm font-black">
                                  +{urge.intensity}
                                </div>
                                <div>
                                  <span className="text-xs text-white/40 block">{urge.date}</span>
                                  <span className="text-xs font-black text-white mt-0.5 block">
                                    المحفز: <span className="text-emerald-400">{urge.trigger}</span>
                                  </span>
                                </div>
                              </div>
                              <span className="text-[10px] font-bold text-white/50 bg-white/5 px-2 py-1 rounded-lg">
                                مزاج: {urge.mood}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {analyzerSubTab === 'relapses' && (
                    <div className="space-y-4 text-right">
                      {chastityData.relapsesLog.length === 0 ? (
                        <p className="text-emerald-400/90 text-xs py-8 text-center font-black bg-emerald-500/5 border border-emerald-500/10 rounded-2xl backdrop-blur-md">
                          🎉 الحمد لله، لا توجد تعثرات مسجلة! حافظ على طهارة ذهنك وسلسلة صمودك العظيمة.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {chastityData.relapsesLog.map((rel, idx) => (
                            <div key={idx} className="p-5 bg-rose-950/5 border border-rose-500/10 rounded-2xl space-y-3 text-right backdrop-blur-md">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-black text-rose-400">{rel.date} {rel.hour !== undefined ? `الساعة ${rel.hour}:00` : ''}</span>
                                <span className="text-[10px] font-bold bg-rose-500/10 text-rose-300 px-2.5 py-0.5 rounded-lg border border-rose-500/20">
                                  مزاج: {rel.mood}
                                </span>
                              </div>
                              <div className="text-xs text-white/80 leading-relaxed font-bold">
                                <div className="text-white/40 text-[10px] mb-1 font-black">المحفز الرئيسي للسقوط:</div>
                                <div className="text-rose-300/90 mb-3">{rel.trigger}</div>
                                {rel.notes && (
                                  <>
                                    <div className="text-white/40 text-[10px] mb-1 font-black">ملاحظات والتأمل الذاتي حول الكبوة:</div>
                                    <p className="text-white/70 p-3 bg-black/40 border border-white/5 rounded-xl font-medium break-words leading-relaxed">{rel.notes}</p>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB: FAQs */}
            {activeTab === 'faq' && (
              <motion.div
                key="faq"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-4xl mx-auto space-y-8"
              >
                {/* Academy Header Card */}
                <div className={cn(glassCardClass, "p-8 md:p-10 relative overflow-hidden")}>
                  <div className="absolute top-0 left-0 w-45 h-45 bg-emerald-500/5 blur-3xl rounded-full" />
                  <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 pb-6 border-b border-white/10 mb-8">
                    <div>
                      <h3 className="text-2xl md:text-3xl font-black text-white mb-2" style={textGlowStyle}>أكاديمية الأعصاب وعلم التعافي</h3>
                      <p className="text-white/40 text-xs md:text-sm">
                        دليل متكامل وأدوات تفاعلية لفهم الدماغ الإدماني، واحتساب مستويات الدوبامين، وقياس تعافي الفص الجبهي.
                      </p>
                    </div>
                    {/* Sub Tab buttons */}
                    <div className="flex flex-wrap bg-white/5 p-1 rounded-2xl border border-white/10 w-full xl:w-auto gap-1">
                      {[
                        { id: 'neuro', label: '🔬 تشريح الأعصاب', icon: Brain },
                        { id: 'dopamine', label: '📊 محاكي الدوبامين', icon: Activity },
                        { id: 'diagnostic', label: '🧠 مقياس الترميم', icon: UserCheck },
                        { id: 'spiritual', label: '🕌 الإيمان والأعصاب', icon: Compass },
                        { id: 'faq', label: '❓ الأسئلة الشائعة', icon: HelpCircle }
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setAcademyTab(tab.id as any)}
                          className={cn(
                            "flex-1 xl:flex-initial px-3 py-2 rounded-xl text-[10px] sm:text-xs font-black transition-all flex items-center justify-center gap-1 whitespace-nowrap",
                            academyTab === tab.id 
                              ? "bg-gradient-to-r from-emerald-500 to-teal-400 text-black shadow-md scale-103" 
                              : "text-white/40 hover:text-white"
                          )}
                        >
                          <tab.icon className="w-3.5 h-3.5" />
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* SUB TAB CONTENT: NEUROBIOLOGY */}
                  {academyTab === 'neuro' && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="grid grid-cols-1 lg:grid-cols-12 gap-8"
                    >
                      {/* Left: Interactive list of brain parts */}
                      <div className="lg:col-span-5 space-y-3">
                        <p className="text-xs text-white/30 font-bold mb-4">انقر على أي جزء من أجزاء الدماغ لاستكشاف تفاصيله وكيفية تعافيه:</p>
                        {[
                          { id: 'pfc', title: 'الفص الجبهي (PFC)', desc: 'مركز اتخاذ القرارات وقوة الإرادة والمنطق.', icon: Brain },
                          { id: 'amygdala', title: 'اللوزة الدماغية (Amygdala)', desc: 'مركز العواطف، الخوف والإنذار بالخطر.', icon: ShieldAlert },
                          { id: 'dopamine', title: 'مستقبلات الدوبامين (D2)', desc: 'قنوات الشعور بالمتعة والمكافأة الفطرية.', icon: Zap },
                          { id: 'pathways', title: 'المسارات العصبية (Neural Pathways)', desc: 'أخاديد وممرات العادات المكررة.', icon: Activity }
                        ].map(part => (
                          <button
                            key={part.id}
                            onClick={() => setSelectedNeuroPart(part.id as any)}
                            className={cn(
                              "w-full text-right p-4 rounded-2xl border transition-all text-xs flex items-start gap-3",
                              selectedNeuroPart === part.id 
                                ? "bg-emerald-500/10 border-emerald-500/30 text-white shadow-lg" 
                                : "bg-white/[0.01] border-white/5 text-white/60 hover:bg-white/[0.03] hover:text-white"
                            )}
                          >
                            <div className={cn(
                              "p-2 rounded-xl border flex-shrink-0 mt-0.5",
                              selectedNeuroPart === part.id ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-white/5 border-white/10 text-white/40"
                            )}>
                              <part.icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-black text-sm">{part.title}</span>
                                <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded-md", selectedNeuroPart === part.id ? "bg-emerald-500/20 text-emerald-300" : "bg-white/5 text-white/40")}>نشط</span>
                              </div>
                              <p className="text-[11px] text-white/40 truncate">{part.desc}</p>
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* Right: Detailed visual analysis */}
                      <div className="lg:col-span-7 bg-white/[0.015] border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col justify-between">
                        {selectedNeuroPart === 'pfc' && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <div className="flex items-center gap-3">
                              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400">
                                <Brain className="w-6 h-6" />
                              </div>
                              <div>
                                <h4 className="text-lg font-black text-white">الفص الجبهي (Prefrontal Cortex)</h4>
                                <span className="text-xs text-white/40">المسؤول عن: كبح الجماح، المنطق، والسيطرة الذاتية</span>
                              </div>
                            </div>
                            
                            <div className="space-y-4 text-sm leading-relaxed font-medium text-white/70">
                              <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/15">
                                <h5 className="font-black text-rose-400 text-xs mb-1.5 flex items-center gap-1.5">🚨 أثر الإدمان (حالة التآكل):</h5>
                                <p className="text-xs text-white/60">
                                  تقوم الإثارة الفائقة من المواد الإباحية بتخدير وإضعاف خلايا الفص الجبهي (Hypofrontality). النتيجة هي فقدان القدرة على كبح النبضات، وضعف اتخاذ القرارات، والانسياق الأعمى خلف الشهوة دون تفكير في العواقب، تماماً مثل سيارة تسير بدون مكابح.
                                </p>
                              </div>

                              <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/15">
                                <h5 className="font-black text-emerald-400 text-xs mb-1.5 flex items-center gap-1.5">🌱 آلية الترميم والتعافي:</h5>
                                <p className="text-xs text-white/60">
                                  عند التوقف الكامل عن المشاهدة، يبدأ الفص الجبهي بإعادة بناء تفرعاته العصبية (Neuroplasticity). تعود المادة الرمادية للنمو مجدداً، وتتحسن إرادتك بشكل مذهل، وتستعيد القدرة على التخطيط البعيد والقول بثبات: "لا" لأي مغريات عابرة.
                                </p>
                              </div>
                            </div>

                            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-xs">
                              <span className="font-black text-emerald-400 block mb-1">🏋️ تمرين تقوية يومي:</span>
                              <p className="text-white/60 leading-relaxed font-bold">
                                مارس تمارين التأمل الواعي، وقراءة الكتب المركزة لمدة لا تقل عن 20 دقيقة يومياً، بالإضافة لاتخاذ قرارات واعية صغيرة تتطلب تأجيل اللذة (مثل إكمال مهام صعبة قبل استخدام الهاتف).
                              </p>
                            </div>
                          </motion.div>
                        )}

                        {selectedNeuroPart === 'amygdala' && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <div className="flex items-center gap-3">
                              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400">
                                <ShieldAlert className="w-6 h-6" />
                              </div>
                              <div>
                                <h4 className="text-lg font-black text-white">اللوزة الدماغية (Amygdala)</h4>
                                <span className="text-xs text-white/40">المسؤول عن: الاستجابات العاطفية، التوتر، وإنذار الخطر</span>
                              </div>
                            </div>
                            
                            <div className="space-y-4 text-sm leading-relaxed font-medium text-white/70">
                              <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/15">
                                <h5 className="font-black text-rose-400 text-xs mb-1.5 flex items-center gap-1.5">🚨 أثر الإدمان (حالة التوتر الدائم):</h5>
                                <p className="text-xs text-white/60">
                                  في فترات الانقطاع الأولى، تصاب اللوزة بفرط نشاط شديد بسبب تراجع الدوبامين، وتصنف هذا النقص على أنه خطر حقيقي يهدد البقاء. هذا هو سر شعورك بالتوتر الطاحن، والضيق النفسي، والرغبة الهستيرية في الهروب للمشاهدة لتهدئة هذا الإنذار الكاذب.
                                </p>
                              </div>

                              <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/15">
                                <h5 className="font-black text-emerald-400 text-xs mb-1.5 flex items-center gap-1.5">🌱 آلية الترميم والتعافي:</h5>
                                <p className="text-xs text-white/60">
                                  مع الصمود والوقت، تتعلم اللوزة الدماغية تدريجياً أن نقص جرعات الدوبامين الاصطناعية ليس تهديداً للموت. تنخفض حساسيتها للتوتر، ويزول القلق المزمن، وتصبح قادراً على مواجهة ضغوطات الحياة الطبيعية بهدوء ورباطة جأش دون رعب أو رغبة بالهروب.
                                </p>
                              </div>
                            </div>

                            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-xs">
                              <span className="font-black text-emerald-400 block mb-1">🏋️ تمرين تقوية يومي:</span>
                              <p className="text-white/60 leading-relaxed font-bold">
                                مارس تمارين التنفس البطني العميق (مثل تنفس المربع) عند التعرض لأي ضغط نفسي، وتجنب الاندفاع في ردود أفعالك عند حدوث توتر مفاجئ.
                              </p>
                            </div>
                          </motion.div>
                        )}

                        {selectedNeuroPart === 'dopamine' && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <div className="flex items-center gap-3">
                              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400">
                                <Zap className="w-6 h-6 animate-pulse" />
                              </div>
                              <div>
                                <h4 className="text-lg font-black text-white">مستقبلات الدوبامين (D2 Receptors)</h4>
                                <span className="text-xs text-white/40">المسؤول عن: تذوق المتعة، الدافعية، والحيوية اليومية</span>
                              </div>
                            </div>
                            
                            <div className="space-y-4 text-sm leading-relaxed font-medium text-white/70">
                              <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/15">
                                <h5 className="font-black text-rose-400 text-xs mb-1.5 flex items-center gap-1.5">🚨 أثر الإدمان (التسطح وبلادة المشاعر):</h5>
                                <p className="text-xs text-white/60">
                                  المشاهدة تعطي الدماغ كميات فيضانية مدمرة من الدوبامين. لحماية الدماغ من فرط الضغط، يقوم بتعطيل وتقليص عدد مستقبلات الدوبامين D2. النتيجة هي حدوث بلادة تامة (تسطح)، حيث تشعر أن الحياة بلا ألوان، وتفقد الأنشطة الطبيعية (الرياضة، التعلم، الأسرة) بريقها بالكامل.
                                </p>
                              </div>

                              <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/15">
                                <h5 className="font-black text-emerald-400 text-xs mb-1.5 flex items-center gap-1.5">🌱 آلية الترميم والتعافي:</h5>
                                <p className="text-xs text-white/60">
                                  هذه هي المعجزة البيولوجية الكبرى. عند الصمود ومنع الفيضان الكيميائي، يقوم الدماغ تدريجياً بإعادة تنشيط وزراعة مستقبلات الدوبامين D2 من جديد. في غضون 60 إلى 90 يوماً، تعود لحالتك الطبيعية وتستعيد متعة الحياة الفطرية والتفاصيل الصغيرة كضحكة طفل أو كوب قهوة.
                                </p>
                              </div>
                            </div>

                            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-xs">
                              <span className="font-black text-emerald-400 block mb-1">🏋️ تمرين تقوية يومي:</span>
                              <p className="text-white/60 leading-relaxed font-bold">
                                التزم بصيام دوباميني جزئي: توقف عن تصفح الشاشات أثناء تناول الطعام أو المشي، وتعلم العيش في صمت تام لبعض الوقت لتسمح لمستقبلاتك بالراحة والترميم العصبي.
                              </p>
                            </div>
                          </motion.div>
                        )}

                        {selectedNeuroPart === 'pathways' && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <div className="flex items-center gap-3">
                              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-purple-400">
                                <Activity className="w-6 h-6" />
                              </div>
                              <div>
                                <h4 className="text-lg font-black text-white">المسارات العصبية (Neural Pathways)</h4>
                                <span className="text-xs text-white/40">المسؤول عن: تشكيل الأنماط التلقائية والروتين السلوكي</span>
                              </div>
                            </div>
                            
                            <div className="space-y-4 text-sm leading-relaxed font-medium text-white/70">
                              <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/15">
                                <h5 className="font-black text-rose-400 text-xs mb-1.5 flex items-center gap-1.5">🚨 أثر الإدمان (طريق سيار فائق السرعة):</h5>
                                <p className="text-xs text-white/60">
                                  كلما استجبت للرغبة، قمت بتقوية وتوسيع المسار العصبي للمشاهدة حتى يصبح كطريق سريع واسع ومغلف بالميالين، يسلكه دماغك تلقائياً عند أول بادرة ملل أو ضيق دون أي جهد ذهني واعٍ منك.
                                </p>
                              </div>

                              <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/15">
                                <h5 className="font-black text-emerald-400 text-xs mb-1.5 flex items-center gap-1.5">🌱 آلية الترميم والتعافي:</h5>
                                <p className="text-xs text-white/60">
                                  قاعدة الدماغ الذهبية: "الخلايا التي لا تنشط معاً، يضعف ترابطها". بمرور الوقت مع الامتناع، يبدأ الدماغ بهدم المسار الإدماني لقلة استخدامه. وفي الوقت نفسه، يمهد مسارات عصبية جديدة لعاداتك البديلة (مثل الرياضة أو القرآن) حتى تصبح هي العادة التلقائية المريحة لك.
                                </p>
                              </div>
                            </div>

                            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-xs">
                              <span className="font-black text-emerald-400 block mb-1">🏋️ تمرين تقوية يومي:</span>
                              <p className="text-white/60 leading-relaxed font-bold">
                                ابنِ عادات يومية بديلة صارمة. عندما تشعر بالرغبة المعتادة في مسار الإدمان، قم فوراً بسلوك مختلف تماماً (الوضوء، أو تمارين الضغط) لتعيد برمجة اتجاه المسارات العصبية.
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* SUB TAB CONTENT: DOPAMINE INTERACTIVE SIMULATOR */}
                  {academyTab === 'dopamine' && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-8"
                    >
                      <div className="bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-3xl text-right">
                        <h4 className="text-sm font-black text-emerald-400 mb-1 flex items-center gap-1.5">📊 محاكي الدوبامين الكيميائي وتوازن المستقبلات</h4>
                        <p className="text-xs text-white/60 leading-relaxed font-bold">
                          انقر على الأنشطة بالأسفل لتشاهد كيف تؤثر التغييرات الكيميائية الفورية على مستوى الدوبامين ومدى استجابة مستقبلاتك العصبية بالدماغ.
                        </p>
                      </div>

                      {/* Visual indicators of simulation */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/[0.01] border border-white/5 rounded-3xl p-6">
                        {/* Meters */}
                        <div className="space-y-5 text-right">
                          <h5 className="text-xs font-black text-white/40 mb-3 uppercase tracking-wider">🔬 المقاييس الكيميائية اللحظية:</h5>
                          
                          {/* Dopamine Level */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-bold">
                              <span className="text-white/70">تدفق الدوبامين (Dopamine Flow)</span>
                              <span className={cn(simDopamineLevel > 200 ? "text-red-400" : "text-emerald-400")}>
                                {simDopamineLevel}%
                              </span>
                            </div>
                            <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 flex items-center pr-1">
                              <motion.div
                                animate={{ width: `${Math.min((simDopamineLevel / 350) * 100, 100)}%` }}
                                className={cn("h-1.5 rounded-full transition-colors", simDopamineLevel > 200 ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "bg-emerald-500")}
                              />
                            </div>
                          </div>

                          {/* Receptors health */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-bold">
                              <span className="text-white/70">حساسية المستقبلات (Receptors Sensitivity)</span>
                              <span className={cn(simReceptorsHealth < 60 ? "text-red-400" : "text-emerald-400")}>
                                {simReceptorsHealth}%
                              </span>
                            </div>
                            <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 flex items-center pr-1">
                              <motion.div
                                animate={{ width: `${simReceptorsHealth}%` }}
                                className={cn("h-1.5 rounded-full transition-colors", simReceptorsHealth < 60 ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "bg-emerald-500")}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Receptors visualization */}
                        <div className="flex flex-col justify-center items-center p-4 bg-white/[0.015] border border-white/5 rounded-2xl">
                          <span className="text-xs text-white/50 font-bold mb-3">حالة مستقبلات الدوبامين (D2 Receptors Grid)</span>
                          <div className="grid grid-cols-5 gap-3">
                            {Array.from({ length: 10 }).map((_, i) => {
                              const isActive = (i + 1) * 10 <= simReceptorsHealth;
                              return (
                                <motion.div
                                  key={i}
                                  animate={{
                                    scale: isActive ? [1, 1.1, 1] : 1,
                                    opacity: isActive ? 1 : 0.25
                                  }}
                                  transition={{ repeat: Infinity, duration: 2, delay: i * 0.15 }}
                                  className={cn(
                                    "w-7 h-7 rounded-full border flex items-center justify-center text-[8px] font-black transition-colors",
                                    isActive 
                                      ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]" 
                                      : "bg-red-500/10 border-red-500/30 text-red-500/70"
                                  )}
                                >
                                  D2
                                </motion.div>
                              );
                            })}
                          </div>
                          <span className="text-[10px] text-white/30 font-bold mt-3">
                            {simReceptorsHealth === 100 
                              ? "المستقبلات مستيقظة بالكامل ومستعدة لالتقاط اللذة الفطرية." 
                              : simReceptorsHealth < 60 
                                ? "إغلاق اضطراري وحجب للمستقبلات لمنع حدوث صدمة عصبية."
                                : "المستقبلات تلتئم وتعود للنشاط تدريجياً."}
                          </span>
                        </div>
                      </div>

                      {/* Msg */}
                      <div className={cn(
                        "p-5 rounded-2xl border text-right text-xs md:text-sm font-bold transition-all",
                        simStatusType === 'overloaded' ? "bg-red-500/10 border-red-500/20 text-red-300" :
                        simStatusType === 'healing' ? "bg-blue-500/10 border-blue-500/20 text-blue-300" :
                        "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                      )}>
                        <div className="flex items-center gap-2 mb-1">
                          <Info className="w-4 h-4 flex-shrink-0" />
                          <span className="font-black text-sm">التشخيص الكيميائي الحالي:</span>
                        </div>
                        <p className="leading-relaxed font-bold">{simStatusMsg}</p>
                      </div>

                      {/* Interactive Buttons */}
                      <div className="flex flex-wrap gap-2.5 justify-center pt-2">
                        <button
                          onClick={() => {
                            setSimDopamineLevel(120);
                            setSimReceptorsHealth(100);
                            setSimStatusMsg("تفاحة / وجبة شهية: إفراز دوبامين طبيعي وممتع. المستقبلات تمتص الإشارة بكفاءة وتستمتع باللحظة دون إجهاد.");
                            setSimStatusType('healthy');
                          }}
                          className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold px-4 py-3 rounded-xl text-xs transition-all"
                        >
                          🍎 تفاحة / وجبة شهية
                        </button>
                        <button
                          onClick={() => {
                            setSimDopamineLevel(140);
                            setSimReceptorsHealth(100);
                            setSimStatusMsg("الركض والرياضة 30 دقيقة: إفراز رائع وطويل الأمد للدوبامين والإندورفين. يعزز الصحة العصبية ونشاط المستقبلات.");
                            setSimStatusType('healthy');
                          }}
                          className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold px-4 py-3 rounded-xl text-xs transition-all"
                        >
                          🏃‍♂️ الركض والرياضة 30د
                        </button>
                        <button
                          onClick={() => {
                            setSimDopamineLevel(320);
                            setSimReceptorsHealth(40);
                            setSimStatusMsg("مشاهدة مقطع إباحي: غسيل كيميائي وإغراق فائق! الدماغ يغلق قنوات ومستقبلات الدوبامين لحماية نفسه من فرط الضغط الكيميائي. تكرار هذا يسبب بلادة المشاعر وضمور الفص الجبهي.");
                            setSimStatusType('overloaded');
                          }}
                          className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold px-4 py-3 rounded-xl text-xs transition-all"
                        >
                          🚨 مشاهدة مقطع إباحي (PMO)
                        </button>
                        <button
                          onClick={() => {
                            setSimDopamineLevel(95);
                            setSimReceptorsHealth(75);
                            setSimStatusMsg("صمود 30 يوماً: تراجع التدفق الاصطناعي وبدء المستقبلات المغلقة بالاستيقاظ التدريجي. قد تشعر بالخمول والملل مؤقتاً ولكنه مؤشر على شفائك.");
                            setSimStatusType('healing');
                          }}
                          className="bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 font-bold px-4 py-3 rounded-xl text-xs transition-all"
                        >
                          🛡️ صمود وتعافي 30 يوم
                        </button>
                        <button
                          onClick={() => {
                            setSimDopamineLevel(100);
                            setSimReceptorsHealth(100);
                            setSimStatusMsg("اكتمال 90 يوماً: استعادة التوازن الكيميائي بالكامل. المستقبلات نشطة وحساسة، وتذوق متعة الحياة الفطرية الهادئة قد عاد!");
                            setSimStatusType('healthy');
                          }}
                          className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold px-4 py-3 rounded-xl text-xs transition-all"
                        >
                          🏆 اكتمال التعافي 90 يوم
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* SUB TAB CONTENT: DIAGNOSTIC QUIZ */}
                  {academyTab === 'diagnostic' && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <div className="bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-3xl text-right">
                        <h4 className="text-sm font-black text-emerald-400 mb-1 flex items-center gap-1.5">🧠 مقياس ترميم الدماغ والتقييم السلوكي</h4>
                        <p className="text-xs text-white/60 leading-relaxed font-bold">
                          أجب عن الأسئلة الأربعة التالية لتشخيص حالة الفص الجبهي، اللوزة الدماغية، مستقبلات الدوبامين، ونشاط مساراتك العصبية بدقة.
                        </p>
                      </div>

                      {!showDiagResult ? (
                        <div className="space-y-6 text-right">
                          {[
                            {
                              id: 1,
                              category: 'PFC (الفص الجبهي - الإرادة)',
                              q: '1. كم من الوقت يمكنك التركيز في قراءة كتاب أو الاستماع لمادة نافعة دون تشتت أو رغبة بفتح الهاتف؟',
                              options: [
                                { val: 0, text: 'أقل من 5 دقائق (الفص الجبهي مجهد ومشتت بشدة)' },
                                { val: 1, text: 'من 5 إلى 15 دقيقة (بداية تماسك وتجميع للتركيز)' },
                                { val: 2, text: 'أكثر من 15 دقيقة (الفص الجبهي قوي ولديه سيطرة جيدة)' }
                              ]
                            },
                            {
                              id: 2,
                              category: 'Amygdala (اللوزة الدماغية - التوتر)',
                              q: '2. عند حدوث ضيق، ملل أو توتر مفاجئ في حياتك اليومية، كيف تتصرف تلقائياً؟',
                              options: [
                                { val: 0, text: 'أهرب فوراً للهاتف ومواقع الإباحية لتهدئة مشاعري' },
                                { val: 1, text: 'أشعر برغبة عارمة بالهروب ولكني أقاوم بجهد نفسي شديد' },
                                { val: 2, text: 'أتعامل مع التوتر بالرياضة، الصلاة، أو الحديث الاجتماعي الهادئ' }
                              ]
                            },
                            {
                              id: 3,
                              category: 'Receptors (المستقبلات - تذوق اللذة)',
                              q: '3. هل تشعر ببهجة ولذة حقيقية عند الجلوس مع العائلة، المشي في الطبيعة، أو تحقيق نجاح بسيط؟',
                              options: [
                                { val: 0, text: 'لا، أشعر ببلادة وتسطح مشاعري التام (الحياة رمادية بلا طعم)' },
                                { val: 1, text: 'أحياناً أشعر بالبهجة، ولكن الفتور والملل يغلب عليّ معظم الوقت' },
                                { val: 2, text: 'نعم، أستمتع بالتفاصيل الصغيرة والمبهجات البسيطة وأشعر بالحيوية' }
                              ]
                            },
                            {
                              id: 4,
                              category: 'Pathways (المسارات العصبية - التلقائية)',
                              q: '4. عندما تكون بمفردك في الغرفة ليلاً والهاتف بيدك، هل يذهب إصبعك للمتصفح تلقائياً؟',
                              options: [
                                { val: 0, text: 'نعم، أجد نفسي أفتحه بشكل آلي لا إرادي (المسار الإدماني عميق جداً)' },
                                { val: 1, text: 'أتردد كثيراً، وأخوض صراعاً داخلياً، أحياناً أنتصر وأحياناً أهزم' },
                                { val: 2, text: 'لا، قمت بوضع حواجز صارمة ودماغي اعتاد النوم والراحة مباشرة' }
                              ]
                            }
                          ].map(item => (
                            <div key={item.id} className="p-5 bg-white/[0.01] border border-white/5 rounded-2xl space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded">{item.category}</span>
                              </div>
                              <h5 className="text-xs sm:text-sm font-black text-white">{item.q}</h5>
                              <div className="grid grid-cols-1 gap-2 pt-1">
                                {item.options.map(opt => (
                                  <button
                                    key={opt.val}
                                    onClick={() => setDiagAnswers(prev => ({ ...prev, [item.id]: opt.val }))}
                                    className={cn(
                                      "w-full text-right p-3 rounded-xl border text-xs font-bold transition-all",
                                      diagAnswers[item.id] === opt.val 
                                        ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300" 
                                        : "bg-white/[0.01] border-white/5 text-white/50 hover:bg-white/[0.03] hover:text-white"
                                    )}
                                  >
                                    {opt.text}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}

                          <div className="text-center pt-4">
                            <button
                              onClick={() => {
                                if (Object.keys(diagAnswers).length < 4) {
                                  toast({
                                    title: "تنبيه",
                                    description: "يرجى الإجابة على جميع الأسئلة الأربعة لإجراء التشخيص.",
                                    variant: "destructive"
                                  });
                                } else {
                                  setShowDiagResult(true);
                                }
                              }}
                              className="bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-black px-10 py-3.5 rounded-2xl text-xs sm:text-sm shadow-lg scale-103 transition-transform"
                            >
                              عرض تقرير تشخيص الدماغ 📊
                            </button>
                          </div>
                        </div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="space-y-6 text-right"
                        >
                          <div className="p-6 bg-emerald-500/5 border border-emerald-500/15 rounded-3xl space-y-4">
                            <h5 className="text-lg font-black text-white border-b border-white/10 pb-3 flex items-center gap-2">
                              <Award className="w-5 h-5 text-emerald-400" />
                              تقرير ترميم الدماغ والتشخيص العصبي
                            </h5>

                            {/* Scores for each category */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {/* PFC */}
                              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-1">
                                <span className="text-[10px] text-white/40 font-black block">الفص الجبهي (الإرادة):</span>
                                <span className={cn("text-sm font-black", 
                                  diagAnswers[1] === 0 ? "text-red-400" : 
                                  diagAnswers[1] === 1 ? "text-amber-400" : "text-emerald-400"
                                )}>
                                  {diagAnswers[1] === 0 ? "⚠️ متآكل ومشتت (بحاجة للتمرين)" : 
                                   diagAnswers[1] === 1 ? "⚡ تماسك متوسط (قيد البناء)" : "🛡️ قوي ومتحكم (إرادة ممتازة)"}
                                </span>
                                <p className="text-[10px] text-white/50 leading-relaxed pt-1.5">
                                  {diagAnswers[1] === 0 ? "الفص الجبهي يمر بحالة خمول. ننصحك بقراءة كتب مطبوعة لمدد متزايدة وتخفيف استخدام الهواتف." :
                                   diagAnswers[1] === 1 ? "في مسار جيد للتعافي. واصل الصمود وتأخير اللذات اليومية لتقوية خلايا السيطرة." :
                                   "رائع! الفص الجبهي يعمل بكفاءة، حافظ عليه بالاستمرار في حواجز الحماية."}
                                </p>
                              </div>

                              {/* Amygdala */}
                              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-1">
                                <span className="text-[10px] text-white/40 font-black block">اللوزة الدماغية (التوتر):</span>
                                <span className={cn("text-sm font-black", 
                                  diagAnswers[2] === 0 ? "text-red-400" : 
                                  diagAnswers[2] === 1 ? "text-amber-400" : "text-emerald-400"
                                )}>
                                  {diagAnswers[2] === 0 ? "⚠️ هائجة وحساسة (هروب دوباميني)" : 
                                   diagAnswers[2] === 1 ? "⚡ تستجيب للمقاومة الصعبة" : "🛡️ مستقرة ومتزنة"}
                                </span>
                                <p className="text-[10px] text-white/50 leading-relaxed pt-1.5">
                                  {diagAnswers[2] === 0 ? "عندما تشعر بالتوتر، تهرب تلقائياً للمشاهدة. يجب كسر هذه الحلقة عن طريق ممارسة تمرين الضغط أو الخروج من الغرفة فور حدوث الضيق." :
                                   diagAnswers[2] === 1 ? "أنت تبذل جهداً كبيراً. أتقن تمارين التنفس 4-7-8 لخفض التوتر وتهدئة اللوزة بدون إرهاق إرادتك." :
                                   "ممتاز! لوزتك الدماغية مستقرة وتتعامل مع الضغوط بوسائل صحية."}
                                </p>
                              </div>

                              {/* Receptors */}
                              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-1">
                                <span className="text-[10px] text-white/40 font-black block">مستقبلات الدوبامين (اللذة):</span>
                                <span className={cn("text-sm font-black", 
                                  diagAnswers[3] === 0 ? "text-red-400" : 
                                  diagAnswers[3] === 1 ? "text-amber-400" : "text-emerald-400"
                                )}>
                                  {diagAnswers[3] === 0 ? "⚠️ منكمشة (تسطح وبلادة مشاعر)" : 
                                   diagAnswers[3] === 1 ? "⚡ تستعيد حساسيتها تدريجياً" : "🛡️ نشطة وتستمتع بالحياة الفطرية"}
                                </span>
                                <p className="text-[10px] text-white/50 leading-relaxed pt-1.5">
                                  {diagAnswers[3] === 0 ? "تسطح المشاعر دليل على حاجة دماغك لإجازة دوبامينية. صمّم على استكمال 40 يوماً من الامتناع وسيعود بريق الأنشطة البسيطة." :
                                   diagAnswers[3] === 1 ? "بدأت تلاحظ عودة المتعة للأمور البسيطة. ابتعد عن التصفح اللانهائي لتعطي المستقبلات فرصة للتعافي التام." :
                                   "تهانينا! دماغك في حالة توازن كيميائي طبيعي وقادر على تذوق مباهج الحياة الفطرية الهادئة."}
                                </p>
                              </div>

                              {/* Pathways */}
                              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-1">
                                <span className="text-[10px] text-white/40 font-black block">المسارات العصبية (التلقائية):</span>
                                <span className={cn("text-sm font-black", 
                                  diagAnswers[4] === 0 ? "text-red-400" : 
                                  diagAnswers[4] === 1 ? "text-amber-400" : "text-emerald-400"
                                )}>
                                  {diagAnswers[4] === 0 ? "⚠️ مسار إدماني عميق وتلقائي" : 
                                   diagAnswers[4] === 1 ? "⚡ المسار القديم يضعف ببطء" : "🛡️ مسار العفة هو النمط الافتراضي"}
                                </span>
                                <p className="text-[10px] text-white/50 leading-relaxed pt-1.5">
                                  {diagAnswers[4] === 0 ? "تتحرك يدك تلقائياً عند الوحدة. الحل الوحيد هو وضع الهواتف خارج الغرفة ليلاً تماماً وقطع الروتين القديم." :
                                   diagAnswers[4] === 1 ? "الروتين القديم يضعف يوماً بعد يوم. واصل تعزيز البدائل الإيجابية كالصلوات والأذكار في نفس التوقيت المعتاد للشهوة." :
                                   "ممتاز! لقد بنيت مسارات عصبية جديدة وصار سلوك العفة هو الخيار المريح والافتراضي لدماغك."}
                                </p>
                              </div>
                            </div>

                            {/* Summary advice */}
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-xs">
                              <span className="font-black text-emerald-400 block mb-1">💡 التوصية السلوكية الموحدة لدماغك:</span>
                              <p className="text-white/60 leading-relaxed font-bold">
                                {diagAnswers[1] + diagAnswers[2] + diagAnswers[3] + diagAnswers[4] <= 3 
                                  ? "جهازك العصبي في حالة إجهاد دوباميني شديد. نوصيك بقطع المحفزات كلياً، ووضع الهاتف خارج غرفة نومك ليلاً، وتفعيل حماية العائلة وتطبيقات الحظر بشكل إجباري لتريح دماغك من الصراع الداخلي."
                                  : diagAnswers[1] + diagAnswers[2] + diagAnswers[3] + diagAnswers[4] <= 6
                                    ? "دماغك في مرحلة انتقالية عظيمة وإعادة التوصيل (Rewiring) جارية الآن بنجاح. واصل الاستحمام بالماء البارد عند ثوران الرغبة لكسر الدورة الكيميائية للوزة، وقم بممارسة التأمل الواعي لتقوية الفص الجبهي."
                                    : "أنت في مرحلة ممتازة من الحصانة العصبية. مسارات العفة أصبحت هي الأساس. حافظ على المكاسب عبر الاستمرار في غض البصر كوقاية مستدامة ونقل تجربتك لمساعدة غيرك."}
                              </p>
                            </div>
                          </div>

                          <div className="text-center pt-2">
                            <button
                              onClick={() => {
                                setDiagAnswers({});
                                setShowDiagResult(false);
                              }}
                              className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black px-6 py-2.5 rounded-xl text-xs transition-all"
                            >
                              إعادة إجراء الفحص التشخيصي 🔄
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  )}

                  {/* SUB TAB CONTENT: SPIRITUAL ALIGNMENT */}
                  {academyTab === 'spiritual' && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6 text-right"
                    >
                      <div className="bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-3xl">
                        <h4 className="text-sm font-black text-emerald-400 mb-1 flex items-center gap-1.5">🕌 الطب الوقائي والمنظور الإيماني العصبي للتعافي</h4>
                        <p className="text-xs text-white/60 leading-relaxed font-bold">
                          المعجزات السلوكية في الشريعة الإسلامية ليست مجرد عبادات روحية، بل هي تدريبات عصبية مباشرة تقوي أجزاء الدماغ وتسرع ترميمه العصبي.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          {
                            title: '🌊 الوضوء بالماء البارد واللوزة الدماغية',
                            desc: 'الماء البارد على الوجه والأطراف يحدث صدمة حرارية إيجابية ترفع إفراز النورأدرينالين بمستويات مستقرة. هذا يهدئ فوراً تهيج اللوزة الدماغية (Amygdala) المسؤولة عن القلق ونوبات الهلع أثناء الانسحاب، ويكسر الرغبة الإدمانية الفورية.'
                          },
                          {
                            title: '🕌 الخشوع في الصلاة وتمرين الفص الجبهي',
                            desc: 'ممارسة التركيز والوقوف بثبات وغض البصر في الصلاة، وتثبيت الذهن في معاني الآيات وتجنب السرحان، هو أقوى تدريب إدراكي يقوي الفص الجبهي (PFC) المسؤول عن قوة الإرادة واتخاذ القرارات الواعية.'
                          },
                          {
                            title: '👁️ غض البصر وحفظ المستقبلات الدوبامينية',
                            desc: 'الامتناع عن إطلاق البصر في المغريات يمنع التدفق الدوباميني الاصطناعي الفادح. هذا يمنح مستقبلات الدوبامين D2 فترة الراحة الكاملة (Dopamine Rest) اللازمة للتكاثر مجدداً والتخلص من البلادة واستعادة حساسية المتعة الفطرية.'
                          },
                          {
                            title: '📿 الذكر والاستغفار وتهدئة القلق الكيميائي',
                            desc: 'تكرار كلمات الذكر بهدوء ويقين يحدث استرخاءً عميقاً في الجهاز العصبي اللاودي (Parasympathetic)، مما يخفض مستويات الكورتيزول والأدرينالين ويمنع العقل من إفراز وساوس القلق التي تقود للانتكاسة.'
                          },
                          {
                            title: '🥖 صيام النوافل وتقوية كبح النبضات',
                            desc: 'الصيام يعود الدماغ على حرمان نفسه الواعي من أقوى المغريات البيولوجية (الطعام والشراب المباح). هذا يعزز قدرة الفص الجبهي على كبح أي رغبات عشوائية أخرى، ويقوي العزيمة والقدرة على قول "لا" عند الضرورة.'
                          },
                          {
                            title: '👥 صلاة الجماعة وكسر حلقة العزلة',
                            desc: 'الخروج المنتظم للمسجد خمس مرات يومياً يكسر نمط العزلة والانطواء الجغرافي الذي يعد البيئة المثالية لنشاط المسارات الإدمانية، ويوفر بيئة اجتماعية داعمة تشعر الدماغ بالأمان والانتماء.'
                          }
                        ].map((item, idx) => (
                          <div key={idx} className="p-5 bg-white/[0.01] border border-white/5 hover:border-emerald-500/20 rounded-2xl transition-all">
                            <h5 className="font-black text-sm text-emerald-400 mb-2 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              {item.title}
                            </h5>
                            <p className="text-xs text-white/50 leading-relaxed font-bold">{item.desc}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* SUB TAB CONTENT: DETAILED FAQS */}
                  {academyTab === 'faq' && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      {[
                        {
                          q: '1. ما هي مرحلة الفلاتلاين (Flatline) وكيف أتعامل معها بنجاح؟',
                          a: 'هي مرحلة من الفتور التام وتراجع الحافز وانعدام الرغبة، وهي شبيهة بعملية إيقاف تشغيل النظام لإعادة التهيئة والترميم. تستمر عادة من أسبوعين إلى شهرين وتعد أقوى مؤشر للتعافي. الكثير من المتعافين يقع في فخ فحص أنفسهم بمشاهدة مقاطع إباحية ليتأكدوا من قدرتهم، مما يؤدي للانتكاسة. الحل هو: الصبر التام، واليقين بأن هذه علامة شفاء عظيمة لجهازك العصبي.'
                        },
                        {
                          q: '2. هل الاستحمام بالماء البارد وممارسة الرياضة تساعد فعلاً علمياً؟',
                          a: 'نعم، الاستحمام بالماء البارد يحدث صدمة حرارية إيجابية ترفع إفراز النورأدرينالين والدوبامين الطبيعي بنسبة 250% بشكل تدريجي ومستقر لعدة ساعات دون التسبب في هبوط ارتدادي أو أذى للمستقبلات. أما الرياضة عالية الكثافة، فتقوم بحرق الطاقة الفائضة والتوتر المتراكم في اللوزة الدماغية وتصريف هرمون الكورتيزول.'
                        },
                        {
                          q: '3. كيف أتعامل مع كثرة المغريات وغض البصر في عصر الشاشات المفتوحة؟',
                          a: 'غض البصر ليس مجرد فضيلة أخلاقية بل ضرورة علمية عصبية لحماية الدماغ. المشهد العابر يطلق نبضة دوبامين صغيرة تنبه الدائرة الإدمانية وتبدأ في طلب المزيد. كل نظرة تستجيب لها، توسع المسار العصبي للرغبة. درّب دماغك على قاعدة (الثانية الأولى لك والثانية عليك)، واقفل الشاشة فوراً دون تردد أو استرسال.'
                        },
                        {
                          q: '4. أشعر بصداع شديد وضعف تركيز وتشتت حاد (Brain Fog)، متى يزول ذلك؟',
                          a: 'ضباب الدماغ أو (Brain Fog) هو عرض انسحاب كيميائي ناتج عن نقص الدوبامين والأسيتيل كولين في قشرة الدماغ الجبهية بعد التوقف. يستمر عادة من 10 إلى 30 يوماً ثم يتلاشى تدريجياً. لسرعة التعافي: اشرب كميات وفيرة من الماء، التزم بالنوم المبكر، ومارس تمارين التدوين وتلخيص الكتب لتمرين الذاكرة.'
                        },
                        {
                          q: '5. ما كفارة ذنب مشاهدة المحرمات شرعاً، وكيف أزكي نفسي؟',
                          a: 'كفارة ذنب الخلوات البصرية هي التوبة الصادقة المكونة من: الإقلاع التام، الندم القلبي، والعزم الأكيد على عدم العودة. ومحو الذنب بالطاعات الكبرى كالصلاة والقرآن وصدقة السر، مستشعراً قوله تعالى: «إن الحسنات يذهبن السيئات». واعلم أن مجاهدتك لترك هذا الذنب هي من أعظم العبادات التي يحبها الله.'
                        },
                        {
                          q: '6. هل يؤثر إدمان الإباحية على الصحة الزوجية والقدرة مستقبلاً؟',
                          a: 'نعم بشكل كبير. تسبب المشاهدة ما يعرف بـ (ضعف القدرة الناجم عن الإباحية - PIED)، نتيجة تبلد المستقبلات واعتياد الدماغ على إثارة ببيرة وجوانب بصرية لا يمكن توفرها في العلاقة الطبيعية الفطرية. الخبر السار هو أن التوقف الكامل لمدة 90 يوماً كفيل بإعادة ضبط استجابة الدماغ وشفاء PIED تماماً بدون أي أدوية.'
                        },
                        {
                          q: '7. كيف أتجنب الانتكاسة التكرارية (Chaser Effect) بعد السقوط؟',
                          a: 'تأثير الملاحقة (Chaser Effect) يحدث عندما ينتكس الشخص مرة واحدة، فيطالب الدماغ الجائع بفيض سريع لتعويض الخسارة، مما يقود المتعافي لسلسلة انتكاسات متتالية تهدم كل الإنجاز. لمنع هذا: اعزل نفسك تماماً عن الأجهزة في أول 72 ساعة بعد الانتكاسة، واعلم أن زلة واحدة لا تهدم كل البناء إذا وقفت فوراً.'
                        },
                        {
                          q: '8. هل أحتاج إلى رفيق تعافٍ (Sponsor) لتخطي الإدمان؟',
                          a: 'وجود شريك تعافٍ أو شخص تثق به وتشاركه تقدمك بنظام مشفر وسري يعد من أقوى العوامل المساعدة على الالتزام. حيث يقلل من مشاعر العزلة والخجل ويبني مسؤولية سلوكية مشتركة. ومع ذلك، إذا كنت تفضل الخصوصية المطلقة، فإن التدوين اليومي ومتابعة العداد يفيان بالغرض تماماً.'
                        }
                      ].map((faq, idx) => (
                        <FaqItem key={idx} q={faq.q} a={faq.a} />
                      ))}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* ── MODALS SECTION ── */}

      {/* 1. START TRACKER MODAL */}
      <AnimatePresence>
        {showStartModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowStartModal(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-lg"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-zinc-950 border border-white/15 rounded-[2.5rem] p-6 text-right z-10 shadow-2xl backdrop-blur-md"
            >
              <h3 className="text-xl font-black text-white mb-2">تحديد وقت بدء التعافي</h3>
              <p className="text-xs text-white/40 leading-relaxed mb-6">
                إذا كنت قد بدأت التعافي بالفعل منذ أيام وتريد احتساب سلسلتك الحالية بدقة، حدد الوقت والتاريخ بدقة بالأسفل.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-white/40 block mb-2 font-bold">تاريخ ووقت البدء</label>
                  <input
                    type="datetime-local"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className={cn(glassInputClass, "w-full")}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      if (customStartDate) {
                        handleStartTracker(new Date(customStartDate).toISOString());
                      } else {
                        toast({
                          title: "تنبيه",
                          description: "يرجى تحديد وقت البدء أولاً",
                          variant: "destructive",
                        });
                      }
                    }}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-black py-3 rounded-xl text-sm shadow-md"
                  >
                    حفظ وإطلاق العداد
                  </button>
                  <button
                    onClick={() => setShowStartModal(false)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl text-sm border border-white/10"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. LOG RELAPSE MODAL */}
      <AnimatePresence>
        {showRelapseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRelapseModal(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-lg"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-zinc-955 border border-white/15 rounded-[2.5rem] p-6 text-right z-10 shadow-2xl overflow-y-auto max-h-[90vh] backdrop-blur-md"
            >
              <h3 className="text-xl font-black text-rose-400 mb-2">تسجيل تعثر / انتكاسة (تعلم من خطئك)</h3>
              <p className="text-xs text-white/40 leading-relaxed mb-6">
                الانتكاس ليس عجزاً بل خطوة نحو التعلم. تدوين المحفزات والمزاج وقت السقوط يساعد الدماغ على فهم الفخاخ السلوكية وتجنبها مستقبلاً.
              </p>

              <div className="space-y-4 text-right">
                <div>
                  <label className="text-xs text-white/40 block mb-2 font-bold">ما هو المزاج الذي كنت تشعر به قبل المشاهدة مباشرة؟</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['ملل وفراغ', 'توتر وقلق', 'غضب وضيق', 'شهوة مستعرة', 'حزن ووحدة', 'تعب وإرهاق'].map(mood => (
                      <button
                        key={mood}
                        type="button"
                        onClick={() => setRelapseMood(mood)}
                        className={cn(
                          "py-2 px-3 rounded-xl border text-xs font-bold transition-all",
                          relapseMood === mood ? "bg-rose-500/20 border-rose-500/50 text-rose-400" : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"
                        )}
                      >
                        {mood}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-white/40 block mb-2 font-bold">أين وقع التعثر؟ (المحفز البصري أو الجغرافي)</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['الهاتف بمفردي في السرير', 'وسائل التواصل (انستقرام/تيكتوك)', 'الحمام الهاتف معي', 'جهاز الكمبيوتر وقت الليل', 'مواقع الأفلام والمسلسلات', 'أخرى'].map(trigger => (
                      <button
                        key={trigger}
                        type="button"
                        onClick={() => setRelapseTrigger(trigger)}
                        className={cn(
                          "py-2 px-3 rounded-xl border text-xs font-bold transition-all",
                          relapseTrigger === trigger ? "bg-rose-500/20 border-rose-500/50 text-rose-400" : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"
                        )}
                      >
                        {trigger}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-white/40 block mb-2 font-bold">دروس مستفادة أو ملاحظات (اختياري)</label>
                  <textarea
                    value={relapseNotes}
                    onChange={(e) => setRelapseNotes(e.target.value)}
                    placeholder="ما الذي ستفعله لتفادي هذا الموقف في المرة القادمة؟ (مثال: سأضع الهاتف خارج الغرفة ليلاً)"
                    className={cn(glassInputClass, "w-full h-20 resize-none font-bold")}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleLogRelapse}
                    className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-black py-3 rounded-xl text-sm shadow-lg shadow-rose-500/10"
                  >
                    نعم، تسجيل وتصفير العداد للبدء من جديد
                  </button>
                  <button
                    onClick={() => setShowRelapseModal(false)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl text-sm border border-white/10"
                  >
                    إلغاء (لم أنتكس)
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. LOG RESISTED URGE MODAL */}
      <AnimatePresence>
        {showResistModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowResistModal(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-lg"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-zinc-955 border border-white/15 rounded-[2.5rem] p-6 text-right z-10 shadow-2xl overflow-y-auto max-h-[90vh] backdrop-blur-md"
            >
              <h3 className="text-xl font-black text-emerald-400 mb-2">تسجيل انتصار ومقاومة رغبة بنجاح</h3>
              <p className="text-xs text-white/40 leading-relaxed mb-6">
                سجل الموقف الذي كدت أن تسقط فيه ولكنك قاومته وتغلبت عليه. توثيق المقاومات يعطيك قوة بصرية ونسبة نجاح تفخر بها في التحليلات.
              </p>

              <div className="space-y-4 text-right">
                <div>
                  <label className="text-xs text-white/40 block mb-2 font-bold">الحالة المزاجية وقت ثوران الرغبة:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['طبيعي', 'ملل وفراغ', 'توتر وقلق', 'غضب وضيق', 'حزن ووحدة', 'تعب وإرهاق'].map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setResistMood(m)}
                        className={cn(
                          "py-2 px-3 rounded-xl border text-xs font-bold transition-all",
                          resistMood === m ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400" : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"
                        )}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-white/40 block mb-2 font-bold">المحفز الذي واجهته وقهرته:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['الملل والفراغ', 'تصفح وسائل التواصل', 'صورة أو مقطع عابر', 'وقت السرير ليلاً', 'العزلة التامة', 'وسواس شيطاني عابر'].map(trig => (
                      <button
                        key={trig}
                        type="button"
                        onClick={() => setResistTrigger(trig)}
                        className={cn(
                          "py-2 px-3 rounded-xl border text-xs font-bold transition-all",
                          resistTrigger === trig ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400" : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"
                        )}
                      >
                        {trig}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-white/40 block mb-2 font-bold">شدة الرغبة التي واجهتها: ({resistIntensity} / 10)</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={resistIntensity}
                    onChange={(e) => setResistIntensity(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                  <div className="flex justify-between text-[10px] text-white/30 font-bold mt-1">
                    <span>1 (سهلة العبور)</span>
                    <span>10 (إلحاح طاحن كدت أسقط فيه)</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleLogResistUrge}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-black py-3 rounded-xl text-sm shadow-lg"
                  >
                    نعم، سجل هذا الانتصار في صفحتي!
                  </button>
                  <button
                    onClick={() => setShowResistModal(false)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl text-sm border border-white/10"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. URGENT PANIC MODAL */}
      <AnimatePresence>
        {showUrgeModal && (
          <UrgeModal letterToSelf={chastityData.letterToSelf} onClose={() => setShowUrgeModal(false)} />
        )}
      </AnimatePresence>

    </div>
  );
}

// Separate component for the Panic Modal to handle Box Breathing, Stroop test, and timers cleanly
function UrgeModal({ letterToSelf, onClose }: { letterToSelf: string; onClose: () => void }) {
  const { toast } = useToast();
  const [panicTab, setPanicTab] = useState<'breathe' | 'letter' | 'stroop' | 'disrupt' | 'spiritual'>('breathe');

  // Breathing configuration state
  const [breathingMode, setBreathingMode] = useState<'box' | 'deep' | 'coherent'>('box');
  const [breathePhase, setBreathePhase] = useState<'inhale' | 'hold1' | 'exhale' | 'hold2'>('inhale');
  const [breatheSeconds, setBreatheSeconds] = useState(4);

  // Stroop Game State
  const [stroopRound, setStroopRound] = useState(0);
  const [stroopScore, setStroopScore] = useState(0);
  const [stroopCompleted, setStroopCompleted] = useState(false);

  const colorsList = useMemo(() => [
    { name: 'أحمر', hex: '#ef4444', id: 'red' },
    { name: 'أزرق', hex: '#3b82f6', id: 'blue' },
    { name: 'أخضر', hex: '#10b981', id: 'green' },
    { name: 'أصفر', hex: '#eab308', id: 'yellow' }
  ], []);

  // Generate Stroop Question
  const currentStroopQuestion = useMemo(() => {
    // Generate different word and display color to create cognitive dissonance (Stroop Effect)
    const wordIdx = Math.floor(Math.random() * 4);
    let colorIdx = Math.floor(Math.random() * 4);
    while (colorIdx === wordIdx) {
      colorIdx = Math.floor(Math.random() * 4);
    }
    return {
      word: colorsList[wordIdx].name,
      textColorHex: colorsList[colorIdx].hex,
      correctColorId: colorsList[colorIdx].id
    };
  }, [stroopRound, colorsList]);

  const handleStroopAnswer = (selectedColorId: string) => {
    if (selectedColorId === currentStroopQuestion.correctColorId) {
      const nextScore = stroopScore + 1;
      setStroopScore(nextScore);
      if (nextScore >= 5) {
        setStroopCompleted(true);
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
        toast({
          title: "🧠 تم تشتيت الفص الجبهي بنجاح!",
          description: "أجبت على 5 جولات تركيز بشكل صحيح. تم تعطيل حلقة الاشتهاء الدوبامينية تلقائياً.",
        });
      } else {
        setStroopRound(prev => prev + 1);
      }
    } else {
      // Reset on wrong answer to force high cognitive load
      setStroopScore(0);
      setStroopRound(prev => prev + 1);
      toast({
        title: "❌ إجابة خاطئة",
        description: "اضغط على لون الخط الفعلي، وليس الكلمة المكتوبة. تم تصفير المحاولات المتتالية.",
        variant: "destructive"
      });
    }
  };

  // Spiritual random text index
  const [quranIndex, setQuranIndex] = useState(0);

  const spiritualReminders = [
    { text: "«قُل لِّلْمُؤْمِنِينَ يَغُضُّوا مِنْ أَبْصَارِهِمْ وَيَحْفَظُوا فُرُوجَهُمْ ذَلِكَ أَزْكَى لَهُمْ إِنَّ اللَّهَ خَبِيرٌ بِمَا يَصْنَعُونَ»", ref: "سورة النور - آية 30" },
    { text: "«أَلَمْ يَعْلَم بِأَنَّ اللَّهَ يَرَى»", ref: "سورة العلق - آية 14" },
    { text: "«وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا * وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ»", ref: "سورة الطلاق" },
    { text: "يا نفس اصبري، فإنما هي ساعات وتمر الرغبة وتفوزين بالعزة والطهارة، ولذة الانتصار على الهوى أعظم بمئات المرات من لذة المعصية المؤقتة التي يعقبها الخزي والندم.", ref: "حكمة التعافي" },
    { text: "الدوبامين المفرط كاذب. دماغك يخدعك الآن ظاناً أن هذا هو الحل الوحيد للارتياح. بمجرد انتهاء الشهوة ستشعر بفراغ أعمق. اصمد 10 دقائق فقط وسيتراجع الدماغ.", ref: "علم السلوك" }
  ];

  // Dynamic config based on selected mode
  const breathingConfig = useMemo(() => {
    if (breathingMode === 'box') {
      return { inhale: 4, hold1: 4, exhale: 4, hold2: 4, title: "التنفس المربع (4-4-4-4)", desc: "تهدئة عاجلة للوزة المخ وإبطاء تسارع الأفكار." };
    } else if (breathingMode === 'deep') {
      return { inhale: 4, hold1: 7, exhale: 8, hold2: 0, title: "تنفس الاسترخاء العميق (4-7-8)", desc: "مثالي للمساعدة على النوم ومحاربة الأرق والتوتر الشديد." };
    } else {
      return { inhale: 5, hold1: 0, exhale: 5, hold2: 0, title: "التنفس المتناغم (5-5)", desc: "يحقق توازن ضربات القلب ويخفض ضغط الدم العالي." };
    }
  }, [breathingMode]);

  // Adjust seconds when changing breathing mode
  useEffect(() => {
    setBreathePhase('inhale');
    setBreatheSeconds(breathingConfig.inhale);
  }, [breathingMode, breathingConfig]);

  // Breathing Loop
  useEffect(() => {
    if (panicTab !== 'breathe') return;

    const interval = setInterval(() => {
      setBreatheSeconds(prev => {
        if (prev > 1) return prev - 1;

        setBreathePhase(current => {
          if (current === 'inhale') {
            if (breathingConfig.hold1 > 0) return 'hold1';
            return 'exhale';
          }
          if (current === 'hold1') {
            return 'exhale';
          }
          if (current === 'exhale') {
            if (breathingConfig.hold2 > 0) return 'hold2';
            return 'inhale';
          }
          return 'inhale';
        });

        let nextPhase: typeof breathePhase = 'inhale';
        if (breathePhase === 'inhale') nextPhase = breathingConfig.hold1 > 0 ? 'hold1' : 'exhale';
        else if (breathePhase === 'hold1') nextPhase = 'exhale';
        else if (breathePhase === 'exhale') nextPhase = breathingConfig.hold2 > 0 ? 'hold2' : 'inhale';
        else nextPhase = 'inhale';

        if (nextPhase === 'inhale') return breathingConfig.inhale;
        if (nextPhase === 'hold1') return breathingConfig.hold1;
        if (nextPhase === 'exhale') return breathingConfig.exhale;
        return breathingConfig.hold2;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [panicTab, breathePhase, breathingConfig]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        className="relative w-full max-w-2xl bg-zinc-950/80 border border-red-500/30 rounded-[3rem] p-6 md:p-10 text-right z-10 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden backdrop-blur-2xl"
      >
        <div className="flex justify-between items-center pb-4 border-b border-white/10">
          <div className="flex items-center gap-2 text-red-500">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
            <h3 className="text-xl md:text-2xl font-black text-cinematic-glow">غرفة الطوارئ والتحصين العاجل</h3>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-white/60 hover:text-white"
          >
            ❌
          </button>
        </div>

        {/* Inner Tabs */}
        <div className="flex border-b border-white/10 my-4 overflow-x-auto no-scrollbar whitespace-nowrap">
          {[
            { id: 'breathe', label: '1. التنفس والأنماط' },
            { id: 'stroop', label: '2. مشتت الرغبة المعرفي (ستروب)' },
            { id: 'letter', label: '3. عهد الطهارة (رسالتك)' },
            { id: 'disrupt', label: '4. أنشطة كسر الحلقة' },
            { id: 'spiritual', label: '5. التثبيت الإيماني' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setPanicTab(t.id as any)}
              className={cn(
                "flex-1 px-4 py-3 text-xs md:text-sm font-black text-center transition-colors whitespace-nowrap",
                panicTab === t.id ? "text-red-400 border-b-2 border-red-500 bg-white/[0.02]" : "text-white/40 hover:text-white"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto py-4 min-h-[300px] flex flex-col justify-center">

          {/* Tab 1: Breathing */}
          {panicTab === 'breathe' && (
            <div className="text-center space-y-6">
              <div className="flex bg-white/5 p-1 rounded-xl w-fit mx-auto gap-1 border border-white/10 backdrop-blur-md">
                {[
                  { id: 'box', label: 'المربع 4-4-4-4' },
                  { id: 'deep', label: 'الاسترخاء 4-7-8' },
                  { id: 'coherent', label: 'المتناغم 5-5' },
                ].map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => setBreathingMode(mode.id as any)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[10px] font-black transition-all",
                      breathingMode === mode.id ? "bg-red-600 text-white font-black" : "text-white/40 hover:text-white/80"
                    )}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>

              <div>
                <h4 className="text-base font-bold text-white/80">{breathingConfig.title}</h4>
                <p className="text-[11px] text-white/40 max-w-sm mx-auto mt-0.5 leading-relaxed">
                  {breathingConfig.desc}
                </p>
              </div>

              <div className="relative w-40 h-40 mx-auto flex items-center justify-center my-4">
                <motion.div
                  animate={{
                    scale: breathePhase === 'inhale' ? 1.3 :
                      breathePhase === 'hold1' ? 1.3 :
                        breathePhase === 'exhale' ? 0.9 : 0.9
                  }}
                  transition={{ duration: breatheSeconds, ease: "easeInOut" }}
                  className={cn(
                    "absolute inset-0 rounded-full blur-md opacity-40 transition-colors duration-1000",
                    breathePhase === 'inhale' ? 'bg-emerald-500' :
                      breathePhase === 'hold1' ? 'bg-amber-500' :
                        breathePhase === 'exhale' ? 'bg-blue-500' : 'bg-red-500'
                  )}
                />

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((h, i) => (
                      <motion.div
                        key={i}
                        className="w-1 bg-red-500 rounded-full"
                        animate={{ height: breathePhase === 'inhale' || breathePhase === 'exhale' ? [10, h * 6, 10] : 10 }}
                        transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.1 }}
                      />
                    ))}
                  </div>
                </div>

                <div className="relative w-36 h-36 rounded-full bg-zinc-900 border border-white/10 flex flex-col items-center justify-center z-10 backdrop-blur-md shadow-2xl">
                  <span className="text-xs font-black text-white/40 mb-1 uppercase tracking-wider">الحالة</span>
                  <span className="text-base font-black text-white">
                    {breathePhase === 'inhale' && '📥 شهــــيق'}
                    {breathePhase === 'hold1' && '🛑 اكتم النفس'}
                    {breathePhase === 'exhale' && '📤 زفــــير'}
                    {breathePhase === 'hold2' && '🛑 اكتم النفس'}
                  </span>
                  <span className="text-3xl font-black text-red-500 mt-2">{breatheSeconds}ث</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Stroop Cognitive Game */}
          {panicTab === 'stroop' && (
            <div className="text-center space-y-6">
              <h4 className="text-base font-bold text-white/80">تشغيل الفص الجبهي - اختبار ستروب</h4>
              <p className="text-xs text-white/40 max-w-sm mx-auto leading-relaxed">
                انقر على اسم **اللون الفعلي للخط** الذي كتبت به الكلمة، وليس الكلمة نفسها! (مثال: كلمة "أزرق" المكتوبة بلون أحمر، إجابتها هي أحمر).
              </p>

              {!stroopCompleted ? (
                <div className="space-y-8">
                  {/* Score Indicator */}
                  <div className="flex justify-center gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-8 h-2.5 rounded-full transition-all border",
                          i < stroopScore ? "bg-emerald-500 border-emerald-500" : "bg-white/5 border-white/10"
                        )}
                      />
                    ))}
                  </div>

                  {/* Word Display */}
                  <div
                    className="text-5xl font-black tracking-wide py-8 transition-colors select-none font-sans filter drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                    style={{ color: currentStroopQuestion.textColorHex }}
                  >
                    {currentStroopQuestion.word}
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-md mx-auto">
                    {colorsList.map(color => (
                      <button
                        key={color.id}
                        onClick={() => handleStroopAnswer(color.id)}
                        className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all backdrop-blur-md shadow-md"
                      >
                        {color.name}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl max-w-md mx-auto space-y-4 backdrop-blur-md">
                  <Award className="w-12 h-12 text-emerald-400 mx-auto animate-bounce filter drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                  <h5 className="font-black text-white text-lg">أحسنت! تم كسر حلقة الاشتهاء بنجاح</h5>
                  <p className="text-xs text-white/60 leading-relaxed">
                    من خلال إجهاد عقلك في التمييز المعرفي للستيروب، نجحت في قطع تيار الشهوة وإخضاع دماغك للتحكم مجدداً. خذ نفساً عميقاً وواصل حريتك!
                  </p>
                  <button
                    onClick={() => {
                      setStroopScore(0);
                      setStroopCompleted(false);
                    }}
                    className="bg-emerald-500 text-black font-black text-xs py-2 px-4 rounded-lg mt-2 transition-transform hover:scale-103"
                  >
                    إعادة اللعب والتشتيت
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Letter to self */}
          {panicTab === 'letter' && (
            <div className="space-y-4 max-w-lg mx-auto text-right">
              <h4 className="text-base font-bold text-center text-white/80">📜 عهد الطهارة ورسالتك الشخصية</h4>
              <p className="text-xs text-center text-white/40 leading-relaxed mb-4">
                هذا هو صوت عقلك الواعي الذي كتبته عندما كنت بكامل قواك الذهنية. اقرأ كلماتك بتمهل ودعها تذيب وساوس الدوبامين المؤقتة.
              </p>

              {letterToSelf ? (
                <div className="p-6 rounded-2xl bg-zinc-900 border border-white/10 text-white/90 leading-relaxed text-sm whitespace-pre-wrap font-bold max-h-48 overflow-y-auto backdrop-blur-md shadow-inner">
                  {letterToSelf}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-zinc-900 border border-dashed border-white/10 text-center text-xs text-white/40 backdrop-blur-md">
                  أنت لم تكتب رسالتك الشخصية بعد. ننصحك بكتابتها لاحقاً في قسم "درع الوقاية الطارئ" لتجدها هنا وقت الأزمات.
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Activity Disrupters */}
          {panicTab === 'disrupt' && (
            <div className="space-y-4">
              <h4 className="text-base font-bold text-center text-white/80">تشتيت كيميائي فوري للدماغ</h4>
              <p className="text-xs text-center text-white/40 max-w-sm mx-auto leading-relaxed">
                الرغبة الإدمانية تنحصر في تكرار فكرة معينة. كسر الحلقة السلوكية عبر نشاط بدني عاجل يفسد الدورة الكيميائية للدوبامين.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                {[
                  { title: "🌊 الوضوء والماء البارد", desc: "اغسل وجهك وجسدك بماء بارد فوراً. الماء البارد يحدث صدمة حرارية تشتت رغبة الدماغ." },
                  { title: "🏃‍♂️ تمرين الـ 20 ضغطاً", desc: "قم بأداء 20 تمرين ضغط أو قرفصاء بكثافة. تصريف الطاقة يعيد توجيه الدورة الدموية." },
                  { title: "🚪 غادر الغرفة فوراً", desc: "اخرج للصالة، افتح الباب، اذهب للتحدث مع والدتك أو إخوتك. كسر العزلة يقتل الرغبة." },
                  { title: "📴 إطفاء الهاتف بالكامل", desc: "أغلق هاتفك تماماً وضعه في غرفة أخرى، واذهب لأداء صلاة أو المشي 10 دقائق." },
                ].map((act, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-white/[0.015] border border-white/5 hover:border-red-500/30 transition-all text-right backdrop-blur-md shadow-sm">
                    <h5 className="font-black text-sm text-red-400">{act.title}</h5>
                    <p className="text-[11px] text-white/50 mt-1 leading-relaxed">{act.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 5: Spiritual Anchors */}
          {panicTab === 'spiritual' && (
            <div className="text-center space-y-6">
              <h4 className="text-base font-bold text-white/80">الملاذ الإيماني للتثبيت</h4>

              <div className="p-6 rounded-3xl bg-red-950/10 border border-red-500/20 max-w-md mx-auto relative min-h-[120px] flex flex-col justify-center backdrop-blur-md">
                <p className="quran-font text-lg md:text-xl text-red-100/90 leading-loose">
                  {spiritualReminders[quranIndex].text}
                </p>
                {spiritualReminders[quranIndex].ref && (
                  <span className="text-[10px] text-red-400/80 font-bold block mt-3">
                    — {spiritualReminders[quranIndex].ref}
                  </span>
                )}
              </div>

              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setQuranIndex((quranIndex + 1) % spiritualReminders.length)}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold px-6 py-2 rounded-xl text-xs transition-all backdrop-blur-md"
                >
                  عرض تذكير آخر 🔄
                </button>
              </div>
            </div>
          )}

        </div>

        <div className="pt-4 border-t border-white/10 mt-auto flex justify-between items-center text-xs">
          <span className="text-red-400/60">هل صمدت وتلاشت الرغبة؟</span>
          <button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-500 text-white font-black px-6 py-2.5 rounded-xl transition-colors shadow-lg"
          >
            نعم، انتصرت وعبرت بأمان! 🛡️
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// Helper component for FAQ items to follow React Hooks guidelines
function FaqItem({ q, a }: { q: string; a: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-white/5 pb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-right py-3 flex justify-between items-center text-sm md:text-base font-black text-white hover:text-emerald-300 transition-colors"
      >
        <span>{q}</span>
        <ChevronDown className={cn("w-5 h-5 text-white/40 transition-transform", isOpen && "rotate-180 text-emerald-400")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="text-xs md:text-sm text-white/50 leading-relaxed py-2 pl-4 pr-1 border-r border-emerald-500/20 mr-1 mt-1 font-bold">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
