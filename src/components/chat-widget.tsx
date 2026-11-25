"use client"

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import {
  MessageSquare, X, Send, Sparkles, User,
  Bot, Loader2, Settings, AlertCircle,
  Minimize2, Maximize2, Trash2, Copy, Check,
  FileDown, Notebook, Book as BookIcon, Compass,
  Mic, MicOff, Volume2, VolumeX, KeyRound, SlidersHorizontal, Cpu
} from 'lucide-react';
import { useAppearance } from '@/components/appearance-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn, normalizeArabic } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { useCollection, useUser, useDoc, useFirestore } from '@/firebase';
import { Lecture, Program, Series, Book, Shubha, DestructiveSin, UserProfile } from '@/lib/types';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isError?: boolean;
};

function parseInlineMarkdown(text: string) {
  const regex = /(\*\*.*?\*\*|\[.*?\]\(.*?\))/g;
  const parts = text.split(regex);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-black text-primary">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
      const closeBracketIdx = part.indexOf('](');
      const label = part.slice(1, closeBracketIdx);
      const url = part.slice(closeBracketIdx + 2, -1);
      return (
        <Link
          key={index}
          href={url}
          className="text-primary font-bold underline underline-offset-4 hover:text-white transition-colors duration-200 cursor-pointer inline"
        >
          {label}
        </Link>
      );
    }
    return part;
  });
}

interface QuranBlock {
  surah: string;
  ayah: string;
  tafsir: string;
  text: string;
}

interface HadithBlock {
  source: string;
  grade: string;
  explanation: string;
  text: string;
}

function QuranVerseCard({ surah, ayah, tafsir, text, onQuery }: QuranBlock & { onQuery: (q: string) => void }) {
  const [showTafsir, setShowTafsir] = useState(false);

  return (
    <div className="my-3.5 p-4 rounded-2xl bg-amber-500/[0.04] border border-amber-500/25 shadow-[0_4px_20px_rgba(245,158,11,0.06)] flex flex-col gap-2.5 selection:bg-amber-500/20 selection:text-amber-200">
      <div className="flex items-center justify-between border-b border-amber-500/15 pb-2">
        <div className="flex items-center gap-1.5 text-amber-400">
          <BookIcon className="w-3.5 h-3.5" />
          <span className="text-[11px] font-black font-headline">آية قرآنية</span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/25 text-[10px] font-black text-amber-300">
          سورة {surah} - آية {ayah}
        </span>
      </div>
      <p className="text-lg font-bold font-quran leading-loose text-center text-amber-100 py-1.5 select-text">
        {text}
      </p>
      <div className="flex justify-end">
        <button
          onClick={() => {
            if (tafsir) {
              setShowTafsir(!showTafsir);
            } else {
              onQuery(`ما التفسير الميسر للآية الكريمة: "${text}" [سورة ${surah} آية ${ayah}]؟`);
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/25 text-amber-300 text-[10px] font-black transition-all cursor-pointer"
        >
          <Sparkles className="w-3 h-3" />
          <span>{tafsir ? (showTafsir ? "إخفاء التفسير" : "عرض التفسير الميسر") : "طلب تفسير الآية"}</span>
        </button>
      </div>
      {showTafsir && tafsir && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-3 rounded-xl bg-amber-500/[0.06] border border-amber-500/15 text-xs font-medium text-amber-100/90 leading-relaxed text-right select-text"
        >
          <strong>التفسير الميسر:</strong> {tafsir}
        </motion.div>
      )}
    </div>
  );
}

function HadithCard({ source, grade, explanation, text, onQuery }: HadithBlock & { onQuery: (q: string) => void }) {
  const [showExplanation, setShowExplanation] = useState(false);

  const isSahih = grade.includes("صحيح");
  const gradeClass = isSahih
    ? "bg-emerald-500/15 border-emerald-500/25 text-emerald-300"
    : "bg-amber-500/15 border-amber-500/25 text-amber-300";

  return (
    <div className="my-3.5 p-4 rounded-2xl bg-emerald-500/[0.04] border border-emerald-500/20 shadow-[0_4px_20px_rgba(16,185,129,0.04)] flex flex-col gap-2.5 selection:bg-emerald-500/20 selection:text-emerald-200">
      <div className="flex items-center justify-between border-b border-emerald-500/15 pb-2">
        <div className="flex items-center gap-1.5 text-emerald-400">
          <Compass className="w-3.5 h-3.5" />
          <span className="text-[11px] font-black font-headline">حديث نبوي شريف</span>
        </div>
        <div className="flex gap-1.5">
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-[10px] font-black text-emerald-300">
            {source}
          </span>
          <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-black border", gradeClass)}>
            {grade}
          </span>
        </div>
      </div>
      <p className="text-sm font-bold leading-relaxed text-right text-emerald-50/95 py-1 select-text">
        {text}
      </p>
      <div className="flex justify-end">
        <button
          onClick={() => {
            if (explanation) {
              setShowExplanation(!showExplanation);
            } else {
              onQuery(`ما شرح وتخريج الحديث النبوي الشريف: "${text}" [المصدر: ${source}]؟`);
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/25 text-emerald-300 text-[10px] font-black transition-all cursor-pointer"
        >
          <Sparkles className="w-3 h-3" />
          <span>{explanation ? (showExplanation ? "إخفاء الشرح" : "عرض شرح الحديث") : "طلب شرح وتخريج الحديث"}</span>
        </button>
      </div>
      {showExplanation && explanation && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-3 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/15 text-xs font-medium text-emerald-100/90 leading-relaxed text-right select-text"
        >
          <strong>فائدة وشرح الحديث:</strong> {explanation}
        </motion.div>
      )}
    </div>
  );
}

function parseMarkdown(text: string, onQuery: (q: string) => void) {
  const quranBlocks: QuranBlock[] = [];
  const hadithBlocks: HadithBlock[] = [];

  const quranRegex = /<quran\s+surah="([^"]+)"\s+ayah="([^"]+)"(?:\s+tafsir="([^"]+)")?>([\s\S]*?)<\/quran>/g;
  let quranMatch;
  let textWithTokens = text;

  while ((quranMatch = quranRegex.exec(text)) !== null) {
    quranBlocks.push({
      surah: quranMatch[1],
      ayah: quranMatch[2],
      tafsir: quranMatch[3] || '',
      text: quranMatch[4].trim()
    });
  }

  let quranCounter = 0;
  textWithTokens = textWithTokens.replace(quranRegex, () => `\n%%QURAN_BLOCK_${quranCounter++}%%\n`);

  const hadithRegex = /<hadith\s+source="([^"]+)"\s+grade="([^"]+)"(?:\s+explanation="([^"]+)")?>([\s\S]*?)<\/hadith>/g;
  let hadithMatch;
  while ((hadithMatch = hadithRegex.exec(text)) !== null) {
    hadithBlocks.push({
      source: hadithMatch[1],
      grade: hadithMatch[2],
      explanation: hadithMatch[3] || '',
      text: hadithMatch[4].trim()
    });
  }

  let hadithCounter = 0;
  textWithTokens = textWithTokens.replace(hadithRegex, () => `\n%%HADITH_BLOCK_${hadithCounter++}%%\n`);

  const lines = textWithTokens.split('\n');
  return lines.map((line, i) => {
    const trimmed = line.trim();

    const quranTokenMatch = trimmed.match(/^%%QURAN_BLOCK_(\d+)%%$/);
    if (quranTokenMatch) {
      const idx = parseInt(quranTokenMatch[1], 10);
      const block = quranBlocks[idx];
      if (block) return <QuranVerseCard key={`quran-${idx}-${i}`} {...block} onQuery={onQuery} />;
    }

    const hadithTokenMatch = trimmed.match(/^%%HADITH_BLOCK_(\d+)%%$/);
    if (hadithTokenMatch) {
      const idx = parseInt(hadithTokenMatch[1], 10);
      const block = hadithBlocks[idx];
      if (block) return <HadithCard key={`hadith-${idx}-${i}`} {...block} onQuery={onQuery} />;
    }

    if (trimmed.startsWith('### ')) {
      return <h5 key={i} className="text-sm font-black text-white mt-3 mb-1 font-headline">{trimmed.substring(4)}</h5>;
    }
    if (trimmed.startsWith('## ')) {
      return <h4 key={i} className="text-base font-black text-white mt-3.5 mb-1.5 font-headline">{trimmed.substring(3)}</h4>;
    }
    if (trimmed.startsWith('# ')) {
      return <h3 key={i} className="text-lg font-black text-white mt-4 mb-2 font-headline">{trimmed.substring(2)}</h3>;
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const content = trimmed.substring(2);
      return (
        <li key={i} className="list-disc list-inside mr-3 text-white/90 leading-relaxed my-1 pr-1">
          {parseInlineMarkdown(content)}
        </li>
      );
    }

    if (trimmed.startsWith('1. ') || trimmed.match(/^\d+\.\s/)) {
      const content = trimmed.substring(trimmed.indexOf('.') + 1).trim();
      return (
        <li key={i} className="list-decimal list-inside mr-3 text-white/90 leading-relaxed my-1 pr-1">
          {parseInlineMarkdown(content)}
        </li>
      );
    }

    if (trimmed === '') {
      return <div key={i} className="h-1.5" />;
    }

    return (
      <p key={i} className="leading-relaxed my-1 text-white/90">
        {parseInlineMarkdown(line)}
      </p>
    );
  });
}

const AVAILABLE_MODELS = [
  { id: "gemini-4-hydrogen", name: "Gemini 4 Hydrogen (الأحدث)", desc: "الجيل الجديد الأسرع والأدق في الفهم والاستنباط العلمي" },
  { id: "gemini-3.8-flash", name: "Gemini 3.8 Flash", desc: "سريع وذكي بقدرة عالية على الاستيعاب" },
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", desc: "سرعة فائقة وذكاء معزز ومثالي للمهام والأسئلة اليومية" },
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro (الأقوى)", desc: "أداء نخبوي للتحليل الشرعي المعقد والخطط العلمية المفصلة" },
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash (المستقر)", desc: "سرعة استجابة مذهلة مع جودة إجابة متميزة" },
  { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash (الكلاسيكي)", desc: "سريع وموثوق للمهام والاستفسارات القياسية" },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro (الكلاسيكي المحترف)", desc: "تحليل سياق ضخم وعميق لمطالعة الكتب الطويلة" }
];

export function ChatWidget() {
  const { aiApiKey, setAiApiKey, aiModel, setAiModel, showChatbot } = useAppearance();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname() || '/';
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const userDocRef = useMemo(() => (user && firestore ? doc(firestore, "users", user.uid) : null), [user, firestore]);
  const { data: userProfile } = useDoc<UserProfile>(userDocRef);
  const [isSavingNote, setIsSavingNote] = useState<string | null>(null);
  const dragControls = useDragControls();
  const [width, setWidth] = useState(420);
  const [height, setHeight] = useState(600);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const initialW = Math.min(430, window.innerWidth - 32);
      const initialH = Math.min(620, window.innerHeight - 100);
      setWidth(initialW);
      setHeight(initialH);
    }
  }, []);

  // ── Widget Appearance States ──────────────────────────────────────────────
  const [widgetTheme, setWidgetThemeState] = useState<'obsidian' | 'glass' | 'emerald'>('obsidian');
  const [enableGlow, setEnableGlowState] = useState(true);
  const [blurStrength, setBlurStrengthState] = useState<'md' | 'xl' | 'max'>('xl');
  const [chatFontSize, setChatFontSizeState] = useState<'sm' | 'base'>('sm');
  const [settingsTab, setSettingsTab] = useState<'models' | 'design' | 'tester'>('models');

  // ── Voice States ──────────────────────────────────────────────────────────
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // ── API Key Tester States ─────────────────────────────────────────────────
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [keyTestResult, setKeyTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    const theme = localStorage.getItem('site-ai-theme') as 'obsidian' | 'glass' | 'emerald' | null;
    if (theme) setWidgetThemeState(theme);
    const glow = localStorage.getItem('site-ai-glow');
    if (glow !== null) setEnableGlowState(glow === 'true');
    const blur = localStorage.getItem('site-ai-blur') as 'md' | 'xl' | 'max' | null;
    if (blur) setBlurStrengthState(blur);
    const fontSize = localStorage.getItem('site-ai-fontsize') as 'sm' | 'base' | null;
    if (fontSize) setChatFontSizeState(fontSize);
  }, []);

  const setWidgetTheme = (theme: 'obsidian' | 'glass' | 'emerald') => {
    setWidgetThemeState(theme);
    localStorage.setItem('site-ai-theme', theme);
  };
  const setEnableGlow = (v: boolean) => {
    setEnableGlowState(v);
    localStorage.setItem('site-ai-glow', v.toString());
  };
  const setBlurStrength = (v: 'md' | 'xl' | 'max') => {
    setBlurStrengthState(v);
    localStorage.setItem('site-ai-blur', v);
  };
  const setChatFontSize = (v: 'sm' | 'base') => {
    setChatFontSizeState(v);
    localStorage.setItem('site-ai-fontsize', v);
  };

  const themeClasses = useMemo(() => {
    const blurClass = blurStrength === 'md'
      ? 'backdrop-blur-xl'
      : blurStrength === 'max'
        ? 'backdrop-blur-[50px]'
        : 'backdrop-blur-3xl';
    const glowShadow = enableGlow
      ? 'shadow-[0_0_0_1px_rgba(var(--primary-rgb),0.22),0_35px_90px_-20px_rgba(0,0,0,0.75),0_0_50px_-15px_rgba(var(--primary-rgb),0.18)]'
      : 'shadow-[0_35px_90px_-20px_rgba(0,0,0,0.7)]';
    if (widgetTheme === 'glass') {
      return `bg-zinc-950/65 ${blurClass} border border-white/15 rounded-[1.75rem] ${glowShadow} overflow-hidden flex flex-col select-none relative`;
    }
    if (widgetTheme === 'emerald') {
      return `bg-[#04120a]/95 ${blurClass} border border-emerald-500/25 rounded-[1.75rem] shadow-[0_35px_90px_-20px_rgba(0,0,0,0.8),0_0_50px_-15px_rgba(16,185,129,0.14)] overflow-hidden flex flex-col select-none relative`;
    }
    return `bg-zinc-950/92 ${blurClass} border border-white/10 rounded-[1.75rem] ${glowShadow} overflow-hidden flex flex-col select-none relative`;
  }, [widgetTheme, blurStrength, enableGlow]);

  // ── Voice: Speech-to-Text ─────────────────────────────────────────────────
  const startListening = () => {
    const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SR) {
      toast({ variant: 'destructive', title: 'غير مدعوم', description: 'متصفحك لا يدعم الإملاء الصوتي حالياً.' });
      return;
    }
    const recognition = new SR();
    recognition.lang = 'ar-SA';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e: any) => {
      const transcript = Array.from(e.results).map((r: any) => r[0].transcript).join('');
      setInput(transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
  };

  // ── Voice: Text-to-Speech ─────────────────────────────────────────────────
  const speakMessage = (text: string, id: string) => {
    if (speakingMsgId === id) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const clean = text.replace(/<[^>]*>/g, '').replace(/[*_`#\[\]()]/g, '').trim();
    const utter = new SpeechSynthesisUtterance(clean);
    utter.lang = 'ar-SA';
    utter.rate = 0.92;
    utter.pitch = 1;
    utter.onend = () => setSpeakingMsgId(null);
    utter.onerror = () => setSpeakingMsgId(null);
    setSpeakingMsgId(id);
    window.speechSynthesis.speak(utter);
  };

  // ── API Key Tester ────────────────────────────────────────────────────────
  const testApiKey = async () => {
    const key = (aiApiKey || '').split(',')[0].trim();
    if (!key) return;
    setIsTestingKey(true);
    setKeyTestResult(null);
    try {
      const genAI = new GoogleGenerativeAI(key);
      const m = genAI.getGenerativeModel({ model: aiModel || 'gemini-4-hydrogen' });
      await m.generateContent('مرحباً');
      setKeyTestResult({ ok: true, message: 'المفتاح صالح وجاهز للعمل بنجاح ✅' });
    } catch (e: any) {
      const msg = e.toString().toLowerCase();
      if (msg.includes('401') || msg.includes('403') || msg.includes('invalid')) {
        setKeyTestResult({ ok: false, message: 'المفتاح غير صالح أو منتهي الصلاحية ❌' });
      } else if (msg.includes('429') || msg.includes('quota')) {
        setKeyTestResult({ ok: true, message: 'المفتاح صالح لكن تجاوز الحصة المؤقتة ⚠️' });
      } else {
        setKeyTestResult({ ok: false, message: `خطأ: ${e.message || 'تعذر التحقق'} ⚠️` });
      }
    } finally {
      setIsTestingKey(false);
    }
  };

  const startResize = (e: React.PointerEvent<HTMLDivElement>, direction: 'n' | 'e' | 'ne') => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startW = width;
    const startH = height;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      if (direction === 'e' || direction === 'ne') {
        setWidth(Math.max(320, Math.min(900, startW + deltaX)));
      }
      if (direction === 'n' || direction === 'ne') {
        setHeight(Math.max(380, Math.min(900, startH - deltaY)));
      }
    };

    const handlePointerUp = () => {
      setIsResizing(false);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const { data: allPrograms } = useCollection<Program>(isOpen ? 'programs' : null, { limit: 50, silent: true });
  const { data: allSeries } = useCollection<Series>(isOpen ? 'series' : null, { limit: 50, silent: true });
  const { data: allBooks } = useCollection<Book>(isOpen ? 'books' : null, { limit: 50, silent: true });
  const { data: allLectures } = useCollection<Lecture>(isOpen ? 'lectures' : null, { orderBy: ['createdAt', 'desc'], limit: 50, silent: true });
  const { data: allShubuhat } = useCollection<Shubha>(isOpen ? 'shubuhat' : null, { limit: 50, silent: true });
  const { data: allDestructiveSins } = useCollection<DestructiveSin>(isOpen ? 'destructive_sins' : null, { limit: 50, silent: true });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, showSettings]);

  if (!showChatbot) return null;

  const getPageFriendlyName = (path: string) => {
    if (path === '/') return 'الصفحة الرئيسية';
    if (path.startsWith('/quran')) return 'صفحة القرآن الكريم';
    if (path.startsWith('/radio')) return 'إذاعة القرآن الكريم';
    if (path.startsWith('/podcasts')) return 'البودكاست الصوتي';
    if (path.startsWith('/hadith')) return 'صفحة الحديث النبوي';
    if (path.startsWith('/accountability')) return 'قسم محاسبة النفس';
    if (path.startsWith('/muhlikat')) return 'قسم المهلكات والذنوب';
    if (path.startsWith('/seerah')) return 'صفحة السيرة النبوية';
    if (path.startsWith('/shubuhat')) return 'قسم تفنيد الشبهات';
    if (path.startsWith('/leaderboard')) return 'لوحة الصدارة';
    if (path.startsWith('/playlists')) return 'قوائم التشغيل';
    if (path.startsWith('/settings')) return 'صفحة الإعدادات';
    if (path.startsWith('/profile')) return 'الملف الشخصي ومكتبتي';
    if (path.startsWith('/lectures')) return 'صفحة الدروس والمحاضرات';
    if (path.startsWith('/programs')) return 'صفحة البرامج العلمية';
    if (path.startsWith('/books')) return 'صفحة الكتب والمؤلفات';
    if (path.startsWith('/challenges')) return 'صفحة التحديات والمسابقات';
    return 'هذه الصفحة';
  };

  const getPageText = () => {
    try {
      const mainEl = document.querySelector('main');
      if (!mainEl) return document.body.innerText || "";
      const clone = mainEl.cloneNode(true) as HTMLElement;
      const excludeSelectors = ['.chat-widget', 'button', 'script', 'style', 'nav', 'footer', '.exclude-from-summary'];
      excludeSelectors.forEach(selector => {
        clone.querySelectorAll(selector).forEach(el => el.remove());
      });
      return clone.innerText || "";
    } catch (e) {
      console.error("Error reading page text content:", e);
      return "";
    }
  };

  const getModelFriendlyName = (id: string) => {
    return AVAILABLE_MODELS.find(m => m.id === id)?.name.split(" (")[0] || id;
  };

  const getGreetingData = (path: string, userName?: string) => {
    const welcome = userName ? `أهلاً بك يا ${userName}` : `أهلاً بك في وقفة AI`;
    if (path.startsWith('/quran') || path.startsWith('/radio')) {
      return {
        title: welcome,
        description: "أنا هنا لمساعدتك في تدبر آيات القرآن الكريم وفهم معانيها وتنظيم أوراد الحفظ والتلاوة.",
        suggestions: [
          { text: "كيف أبدأ في تدبر كتاب الله الكريم؟", label: "تدبر القرآن الكريم" },
          { text: "ابحث لي عن سورة أو آيات تتكلم عن الصبر وعاقبته", label: "آيات عن الصبر" },
          { text: "ما هي الطريقة الصحيحة للموازنة بين الحفظ والمراجعة؟", label: "خطة الحفظ والمراجعة" }
        ]
      };
    }
    if (path.startsWith('/hadith')) {
      return {
        title: welcome,
        description: "أنا هنا لمساعدتك في تصفح الحديث النبوي الشريف وفهم الأحاديث المعروضة وتخريجها ومعانيها المنهجية.",
        suggestions: [
          { text: "ما هي منزلة السنة النبوية المطهرة ومكانتها التشريعية؟", label: "منزلة السنة النبوية" },
          { text: "ابحث لي عن حديث يتحدث عن محاسبة النفس", label: "أحاديث عن المحاسبة" },
          { text: "كيف أدرس علوم الحديث كطالب علم مبتدئ؟", label: "دراسة علوم الحديث" }
        ]
      };
    }
    if (path.startsWith('/accountability')) {
      return {
        title: welcome,
        description: "مرحباً بك في قسم محاسبة النفس والعبادات. سأساعدك في تنظيم أورادك الطيبة والمحافظة عليها.",
        suggestions: [
          { text: "كيف أحافظ على صلاة الفجر في جماعة والالتزام بالسنن الرواتب؟", label: "المحافظة على الصلوات" },
          { text: "نصيحة عملية لمعالجة الفتور في أوراد العبادات اليومية", label: "علاج الفتور" },
          { text: "كيف يساعد جدول محاسبة النفس في تزكية النفس وبناء العادات؟", label: "فوائد محاسبة النفس" }
        ]
      };
    }
    if (path.startsWith('/profile')) {
      return {
        title: welcome,
        description: "أهلاً بك في مكتبتك وملفك الشخصي. سأساعدك في استعراض إنجازاتك العلمية وتوجيهك لتحقيق أهدافك.",
        suggestions: [
          { text: "كيف أزيد نقاطي ومستوى تحصيلي العلمي في منصة وقفة؟", label: "الارتقاء بالتحصيل" },
          { text: "ما هي الأوسمة المتاحة وكيف يمكنني الحصول عليها؟", label: "دليل الأوسمة والألقاب" },
          { text: "ساعدني في وضع خطة لمراجعة المحاضرات المفضلة لدي والمدونة في ملاحظاتي", label: "مراجعة محفوظاتي" }
        ]
      };
    }
    if (path.startsWith('/muhlikat')) {
      return {
        title: welcome,
        description: "أهلاً بك في قسم تفادي المهلكات وكبائر الذنوب. سأساعدك في معرفة سبل الوقاية والخطط العلاجية.",
        suggestions: [
          { text: "كيف أبني خطة علاجية للتخلص من ذنب متكرر؟", label: "خطة التخلص من ذنب" },
          { text: "ما هي المهلكات السبع وكيف حذرنا الإسلام منها؟", label: "المهلكات السبع" },
          { text: "ساعدني في فهم أهمية التوبة النصوح وشروط قبولها", label: "التوبة النصوح" }
        ]
      };
    }
    if (path.startsWith('/shubuhat')) {
      return {
        title: welcome,
        description: "أهلاً بك في قسم تفنيد الشبهات والرد عليها. سأساعدك في بناء البصيرة وحماية الفكر بالعلم الراسخ.",
        suggestions: [
          { text: "كيف أحمي عقيدتي وفكري من الشبهات والمنزلقات الفكرية المعاصرة؟", label: "بناء البصيرة الفكرية" },
          { text: "ما هي المنهجية الصحيحة للتعامل مع الشكوك أو الأسئلة العقدية؟", label: "التعامل مع الشبهات" },
          { text: "اعرض لي أهمية التفقه في العقيدة والتوحيد كحصن لطالب العلم", label: "أهمية دراسة العقيدة" }
        ]
      };
    }
    return {
      title: welcome,
      description: `مساعدك الشرعي والعلمي المدعوم بـ ${getModelFriendlyName(aiModel)}. اسألني في العقيدة، الفقه، التفسير، أو اطلب خطة دراسية.`,
      suggestions: [
        { text: "أريد خطة دراسية لطلب العلم الشرعي", label: "خطة دراسية مخصصة" },
        { text: "كيف أستخدم قسم محاسبة النفس لمتابعة أورادي؟", label: "شرح محاسبة النفس" },
        { text: "ما هي الكتب والبرامج المتوفرة في المنصة؟", label: "الكتب والبرامج العلمية" },
        { text: "أخبرني عن قسم تفنيد الشبهات والرد عليها", label: "الرد على الشبهات" }
      ]
    };
  };

  const handleSummarizePage = () => {
    const text = getPageText().trim().slice(0, 6000);
    const pageName = getPageFriendlyName(pathname);

    if (text.length < 50) {
      const geminiPrompt = `[طلب تلخيص الصفحة: ${pageName}]\nلا يوجد محتوى نصي كبير لعرضه في هذه الصفحة. يرجى إرشاد المستخدم عن كيفية استخدام هذه الصفحة أو استفساراته العامة المتعلقة بها.`;
      const displayPrompt = `مرحباً، هل يمكنك إرشادي وتوضيح كيفية الاستفادة من هذه الصفحة؟ (${pageName})`;
      handleSend(geminiPrompt, displayPrompt);
      return;
    }

    const geminiPrompt = `[طلب تلخيص الصفحة: ${pageName}]\nمحتوى الصفحة الحالي هو:\n"""\n${text}\n"""\n\nيرجى تلخيص محتوى هذه الصفحة بأسلوب ودود وناصح ومنظم للغاية في نقاط واضحة وعناوين منسقة وجذابة.`;
    const displayPrompt = `مرحباً، هل يمكنك تلخيص محتوى هذه الصفحة لي؟ (${pageName})`;
    handleSend(geminiPrompt, displayPrompt);
  };

  const handleSend = async (overrideInput?: string, displayInput?: string) => {
    const textToSend = overrideInput || input;
    const textToDisplay = displayInput || textToSend;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToDisplay.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const modelsToTry = [
        aiModel,
        "gemini-4-hydrogen",
        "gemini-3.8-flash",
        "gemini-2.5-flash",
        "gemini-2.5-pro",
        "gemini-2.0-flash",
        "gemini-1.5-flash",
        "gemini-1.5-pro"
      ].filter((value, index, self) => self.indexOf(value) === index);

      let quotaError: any = null;
      let safetyError: any = null;
      let modelNotFoundError: any = null;
      let lastError: any = null;
      let successfulResponseText = "";

      let relevantContext = "";
      try {
        const normalizedQuery = normalizeArabic(textToSend.toLowerCase());
        const queryWords = normalizedQuery.split(/\s+/).filter(w => w.trim().length > 1);
        const matches: string[] = [];

        if (queryWords.length > 0) {
          allPrograms?.forEach(p => {
            const normName = normalizeArabic(p.name.toLowerCase());
            const normBio = p.bio ? normalizeArabic(p.bio.toLowerCase()) : '';
            if (queryWords.some(w => normName.includes(w)) || (normBio && queryWords.some(w => normBio.includes(w)))) {
              matches.push(`- برنامج علمي: "${p.name}" (رابط الصفحة: [/programs/${p.slug}](/programs/${p.slug})) - الوصف: ${p.bio || 'لا يوجد وصف'}`);
            }
          });
          allSeries?.forEach(s => {
            const normTitle = normalizeArabic(s.title.toLowerCase());
            const normDesc = s.description ? normalizeArabic(s.description.toLowerCase()) : '';
            if (queryWords.some(w => normTitle.includes(w)) || (normDesc && queryWords.some(w => normDesc.includes(w)))) {
              matches.push(`- سلسلة علمية: "${s.title}" (رابط الصفحة: [/series/${s.slug}](/series/${s.slug})) - الوصف: ${s.description || 'لا يوجد وصف'}`);
            }
          });
          allBooks?.forEach(b => {
            const normTitle = normalizeArabic(b.title.toLowerCase());
            const normAuthor = b.author ? normalizeArabic(b.author.toLowerCase()) : '';
            const normDesc = b.description ? normalizeArabic(b.description.toLowerCase()) : '';
            if (queryWords.some(w => normTitle.includes(w)) || (normAuthor && queryWords.some(w => normAuthor.includes(w))) || (normDesc && queryWords.some(w => normDesc.includes(w)))) {
              matches.push(`- كتاب: "${b.title}" للمؤلف ${b.author || 'غير معروف'} (رابط الصفحة: [/books/${b.slug}](/books/${b.slug})) - الوصف: ${b.description || 'لا يوجد وصف'}`);
            }
          });
          allLectures?.forEach(l => {
            const normTitle = normalizeArabic(l.title.toLowerCase());
            const normDesc = l.description ? normalizeArabic(l.description.toLowerCase()) : '';
            if (queryWords.some(w => normTitle.includes(w)) || (normDesc && queryWords.some(w => normDesc.includes(w)))) {
              matches.push(`- محاضرة: "${l.title}" (رابط الصفحة: [/lectures/${l.slug}](/lectures/${l.slug})) - الوصف: ${l.description || 'لا يوجد وصف'}`);
            }
          });
          allShubuhat?.forEach(sh => {
            const normQ = normalizeArabic(sh.question.toLowerCase());
            const normSum = sh.summary ? normalizeArabic(sh.summary.toLowerCase()) : '';
            if (queryWords.some(w => normQ.includes(w)) || (normSum && queryWords.some(w => normSum.includes(w)))) {
              matches.push(`- سؤال وتفنيد شبهة: "${sh.question}" (رابط القسم: [/shubuhat](/shubuhat)) - الخلاصة والرد: ${sh.summary}`);
            }
          });
          allDestructiveSins?.forEach(ds => {
            const normTitle = normalizeArabic(ds.title.toLowerCase());
            const normConcept = ds.concept ? normalizeArabic(ds.concept.toLowerCase()) : '';
            if (queryWords.some(w => normTitle.includes(w)) || (normConcept && queryWords.some(w => normConcept.includes(w)))) {
              matches.push(`- مهلكة / ذنب: "${ds.title}" (رابط القسم: [/muhlikat](/muhlikat)) - المفهوم والعلاج: ${ds.concept || 'لا يوجد وصف'}`);
            }
          });
        }
        relevantContext = matches.slice(0, 8).join('\n');
      } catch (e) {
        console.error("Error building context:", e);
      }

      let systemPrompt = `أنت "وقفة AI"، مساعد ذكي خارق الذكاء ومتخصص في منصة "وقفة" للدروس العلمية والتربوية والشرعية. 
      مهمتك هي إرشاد طالب العلم ومساعدته في تصفح الموقع، والإجابة على تساؤلاته الشرعية والمنهجية بدقة بالغة، ومساعدته في بناء خططه الدراسية.

      روابط صفحات الموقع الهامة (استخدم روابط Markdown بالنسبة للموقع [اسم الصفحة](/الرابط) للتوجيه):
      - الصفحة الرئيسية: "/"
      - قسم محاسبة النفس (متابعة العبادات): "/accountability"
      - قسم تفنيد الشبهات والرد عليها: "/shubuhat"
      - قسم المهلكات وكبائر الذنوب: "/muhlikat"
      - قسم القرآن الكريم (البحث وتدبر الآيات): "/quran"
      - قسم الإذاعة المباشرة: "/radio"
      - قسم البودكاست الصوتي: "/podcasts"
      - قسم الحديث النبوي الشريف: "/hadith"
      - قسم لوحة الصدارة والأوسمة: "/leaderboard"
      - قسم الكتب والمؤلفات: "/books"
      - قسم البرامج العلمية: "/programs"
      - قسم السلاسل العلمية: "/series"
      - قسم الدروس والمحاضرات: "/lectures"
      - قسم الأذكار اليومية: "/adhkar"
      - قسم جدول الأوقات: "/schedule"
      - قسم البث المباشر: "/live"
      - إعدادات الحساب والمظهر: "/settings"
      - الملف الشخصي ومكتبتي: "/profile"

      قواعد وتوجيهات الإجابة:
      1. كن ذكياً جداً ومقنعاً، ونظّم إجاباتك بنقاط واضحة وعناوين منسقة وجذابة.
      2. عند اقتراح أي قسم أو توجيه المستخدم لصفحة في الموقع، استخدم صيغة روابط الماركداون الموضحة أعلاه، مثل: [صفحة الكتب](/books) أو [قسم تفنيد الشبهات](/shubuhat).
      3. اعتمد دائماً على الدليل الموثق من الكتاب والسنة بفهم سلف الأمة الصالح.
      4. إذا طلب المستخدم خطة علمية أو دراسية، صمم له خطة مخصصة ومنهجية مستعيناً بالكتب والبرامج المتاحة في المنصة.
      5. تحدث دائماً باللغة العربية الفصحى المبسطة بأسلوب ناصح ودود ومشجع للغاية.
      6. إذا سُئلت عن أمر فقهي خلافي، اعرض الأقوال بأدب واحترام واذكر القول الراجح مع الدليل دون تعصب.
      7. إذا سألك المستخدم عن شيء لا تعرفه أو لم تجد له أصلاً، فقل "الله أعلم" ووجهه لسؤال أهل العلم والاختصاص.
      8. ميزة هامة جداً للاستخراج والتخريج التلقائي: عندما تقتبس آية قرآنية أو تذكر حديثاً نبوياً في متن ردودك، يجب عليك تضمينها داخل وسوم XML مخصصة كالتالي:
         - للآيات القرآنية: استخدم وسم <quran surah="اسم السورة" ayah="رقم الآية" tafsir="تفسير ميسر ومختصر جداً للآية">نص الآية بالرسم العثماني أو الإملائي</quran>
         - للأحاديث النبوية: استخدم وسم <hadith source="مصدر الحديث مثل صحيح البخاري، صحيح مسلم الخ" grade="درجة صحة الحديث مثل صحيح، حسن الخ" explanation="شرح وتوضيح مبسط ومختصر جداً للحديث">متن الحديث الشريف</hadith>
         تأكد تماماً من عزو الآية لمكانها الصحيح وتخريج الحديث بدقة بالغة وملء كافة سمات (attributes) الوسوم بشكل صحيح ومكتمل.`;

      if (relevantContext) {
        systemPrompt += `\n\n[سياق إضافي وتفصيلي من قاعدة بيانات المنصة ذو صلة بسؤال المستخدم]:\nالمواد العلمية التالية متوفرة على منصة وقفة ويمكنك الإشارة إليها واقتراحها للمستخدم:\n${relevantContext}`;
      }

      if (userProfile) {
        systemPrompt += `\n\n[معلومات طالب العلم الحالي]:
        - الاسم: ${userProfile.name || 'غير معروف'}
        - البريد الإلكتروني: ${userProfile.email || 'غير معروف'}
        - النقاط التحصيلية: ${userProfile.points || 0} نقطة
        - دقائق الاستماع: ${userProfile.minutesListened || 0} دقيقة
        - المحاضرات المكتملة: ${userProfile.lecturesCompleted || 0} محاضرة
        - السلاسل المكتملة: ${userProfile.seriesCompleted || 0} سلسلة
        
        خاطب هذا المستخدم باسمه وشجعه بناءً على تقدمه ونقاطه، وادعه للمثابرة والاستمرار في طلب العلم.`;
      }

      const cleanKeys = aiApiKey ? aiApiKey.split(',').map(k => k.trim()).filter(Boolean) : [];

      if (cleanKeys.length > 0) {
        for (const key of cleanKeys) {
          const genAI = new GoogleGenerativeAI(key);

          for (const modelName of modelsToTry) {
            try {
              const model = genAI.getGenerativeModel({
                model: modelName,
                safetySettings: [
                  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                ]
              });

              const chatHistory = messages
                .filter(msg => !msg.isError)
                .slice(-12)
                .map(msg => ({
                  role: msg.role === 'user' ? 'user' : 'model',
                  parts: [{ text: msg.content }],
                }));

              const history = [
                { role: 'user', parts: [{ text: systemPrompt }] },
                { role: 'model', parts: [{ text: "فهمت رسالتي ومهمتي. سأكون ناصحاً أميناً ومساعداً ذكياً لطلاب العلم في منصة وقفة بإذن الله." }] },
                ...chatHistory
              ];

              let retryCount = 0;
              const maxRetries = 2;

              while (retryCount <= maxRetries) {
                try {
                  const chat = model.startChat({
                    history,
                    generationConfig: {
                      maxOutputTokens: 1200,
                      temperature: 0.6,
                    },
                  });

                  const result = await chat.sendMessage(textToSend.trim());
                  const resObj = await result.response;
                  successfulResponseText = resObj.text();
                  break;
                } catch (retryErr: any) {
                  const errStr = retryErr.toString().toLowerCase();
                  if ((errStr.includes("quota") || errStr.includes("429")) && retryCount < maxRetries) {
                    retryCount++;
                    await new Promise(resolve => setTimeout(resolve, retryCount * 1500));
                  } else {
                    throw retryErr;
                  }
                }
              }
              if (successfulResponseText) break;
            } catch (err: any) {
              lastError = err;
              const errStr = err.toString().toLowerCase();

              if (errStr.includes("api_key_invalid") || errStr.includes("401") || errStr.includes("403") || errStr.includes("invalid key")) {
                break;
              }
              if (errStr.includes("quota") || errStr.includes("429")) {
                quotaError = err;
                break;
              }
              if (errStr.includes("blocked") || errStr.includes("safety")) safetyError = err;
              else if (errStr.includes("404")) modelNotFoundError = err;
            }
          }

          if (successfulResponseText) break;
        }
      }

      if (!successfulResponseText) {
        try {
          const chatHistory = messages
            .filter(msg => !msg.isError)
            .slice(-12)
            .map(msg => ({
              role: msg.role === 'user' ? 'user' : 'model',
              parts: [{ text: msg.content }],
            }));

          const history = [
            { role: 'user', parts: [{ text: systemPrompt }] },
            { role: 'model', parts: [{ text: "فهمت رسالتي ومهمتي. سأكون ناصحاً أميناً ومساعداً ذكياً لطلاب العلم في منصة وقفة بإذن الله." }] },
            ...chatHistory,
            { role: 'user', parts: [{ text: textToSend.trim() }] }
          ];

          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: history, model: aiModel })
          });

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || `HTTP_${response.status}`);
          }

          const resData = await response.json();
          successfulResponseText = resData.text;
        } catch (serverErr: any) {
          throw serverErr || quotaError || safetyError || modelNotFoundError || lastError || new Error("FAILED_ALL_MODELS");
        }
      }

      if (!successfulResponseText) throw new Error("EMPTY_RESPONSE");

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: successfulResponseText,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("AI Error:", error);
      let errorMessageContent = "عذراً، حدث خطأ أثناء التواصل.";
      const errorStr = error.toString().toLowerCase();

      if (errorStr.includes("api_key_invalid") || errorStr.includes("api key not valid") || errorStr.includes("401") || errorStr.includes("403")) {
        errorMessageContent = "مفتاح Gemini API غير صالح أو منتهي الصلاحية. يمكنك إضافة مفتاحك المجاني من الإعدادات (/settings) في قسم المساعد الذكي، أو تحديث المتغير GOOGLE_API_KEY في ملف .env.";
      } else if (errorStr.includes("429")) {
        errorMessageContent = "تم تجاوز حصة الاستخدام المؤقتة (429). يمكنك الانتظار قليلاً أو إضافة مفتاح آخر في الإعدادات.";
      } else if (errorStr.includes("safety")) {
        errorMessageContent = "تم حجب الإجابة بواسطة مرشحات الأمان الخاصة بالمحرك.";
      } else if (errorStr.includes("api_key_missing")) {
        errorMessageContent = "يرجى إضافة مفتاح Gemini API في إعدادات المساعد لتشغيل المحادثة.";
      } else {
        errorMessageContent = `حدث خطأ تقني: ${error.message || "تعذر الاتصال"}. يرجى مراجعة إعدادات المفتاح والنموذج.`;
      }

      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: errorMessageContent, timestamp: new Date(), isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportAsFile = (content: string) => {
    try {
      const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `waqfah_ai_summary_${Date.now()}.md`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "تم تصدير الملف بنجاح",
        description: "تم تحميل الملف بصيغة الماركداون (.md).",
      });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "خطأ في التصدير",
        description: "تعذر تصدير الملف النصي حالياً.",
      });
    }
  };

  const saveToNotebook = async (msgId: string, noteContent: string) => {
    if (!firestore || !user) {
      toast({
        variant: "destructive",
        title: "تسجيل الدخول مطلوب",
        description: "يجب تسجيل الدخول أولاً لحفظ الملاحظات.",
      });
      return;
    }

    try {
      setIsSavingNote(msgId);
      const slug = pathname.startsWith('/lectures/') ? pathname.split('/lectures/')[1] : null;
      const currentLecture = slug ? allLectures?.find(l => l.slug === slug) : null;
      const noteId = currentLecture ? currentLecture.id : `ai_note_${Date.now()}`;
      const noteRef = doc(firestore, 'users', user.uid, 'notes', noteId);

      let contentToSave = noteContent;
      if (!currentLecture) {
        const pageName = getPageFriendlyName(pathname);
        contentToSave = `[فوائد مستفادة من مساعد الذكاء الاصطناعي - ${pageName}]\n\n${noteContent}`;
      }

      await setDoc(noteRef, {
        userId: user.uid,
        lectureId: noteId,
        content: contentToSave,
        updatedAt: Timestamp.now(),
      }, { merge: true });

      toast({
        title: "تم الحفظ بنجاح",
        description: currentLecture
          ? `تم حفظ التلخيص في ملاحظات محاضرة "${currentLecture.title}".`
          : "تم حفظ التلخيص كملاحظة عامة في مكتبتك.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "فشل الحفظ",
        description: "حدث خطأ غير متوقع أثناء محاولة الحفظ.",
      });
    } finally {
      setIsSavingNote(null);
    }
  };

  const clearChat = () => {
    window.speechSynthesis?.cancel();
    setSpeakingMsgId(null);
    setMessages([]);
  };

  return (
    <div className="fixed bottom-28 left-4 md:bottom-8 md:left-8 z-[100] pointer-events-none chat-widget" dir="rtl">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            drag
            dragControls={dragControls}
            dragListener={false}
            dragMomentum={false}
            dragElastic={0.05}
            dragConstraints={{ left: -1200, right: 1200, top: -1200, bottom: 1200 }}
            initial={{ opacity: 0, y: 20, scale: 0.94, filter: 'blur(8px)' }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              filter: 'blur(0px)',
              height: isMinimized ? 70 : height,
              width: isMinimized ? 310 : width,
            }}
            exit={{ opacity: 0, y: 20, scale: 0.94, filter: 'blur(8px)' }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'pointer-events-auto',
              themeClasses,
              isMinimized ? 'mb-3' : 'mb-4',
              isResizing && 'transition-none'
            )}
          >
            {/* Top-edge specular highlight */}
            <div className="absolute top-0 inset-x-10 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent pointer-events-none z-20" />

            {/* Resize Handles */}
            {!isMinimized && (
              <>
                <div
                  onPointerDown={(e) => startResize(e, 'n')}
                  className="absolute top-0 left-4 right-4 h-1.5 cursor-ns-resize z-50 hover:bg-primary/25 transition-colors"
                />
                <div
                  onPointerDown={(e) => startResize(e, 'e')}
                  className="absolute top-4 right-0 bottom-4 w-1.5 cursor-ew-resize z-50 hover:bg-primary/25 transition-colors"
                />
                <div
                  onPointerDown={(e) => startResize(e, 'ne')}
                  className="absolute top-1.5 right-1.5 w-5 h-5 cursor-nesw-resize flex items-center justify-center text-white/25 hover:text-primary rounded-md z-50 transition-colors"
                  title="تغيير حجم النافذة"
                >
                  <svg width="9" height="9" viewBox="0 0 10 10">
                    <line x1="10" y1="0" x2="0" y2="10" stroke="currentColor" strokeWidth="1.5" />
                    <line x1="10" y1="5" x2="5" y2="10" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>
              </>
            )}

            {/* Header */}
            <div
              onPointerDown={(event) => {
                const target = event.target as HTMLElement;
                if (target.closest('button')) return;
                dragControls.start(event);
              }}
              className="px-4 py-3.5 border-b border-white/10 flex items-center justify-between bg-white/[0.02] cursor-grab active:cursor-grabbing select-none shrink-0"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-black text-white font-headline tracking-tight leading-none mb-1">وقفة AI</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span className="text-[10px] font-bold text-white/60 truncate">
                      {showSettings ? "إعدادات المساعد" : getModelFriendlyName(aiModel)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => { setShowSettings(!showSettings); setIsMinimized(false); }}
                  className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer",
                    showSettings ? "text-primary bg-primary/15 border border-primary/30" : "text-white/50 hover:text-white hover:bg-white/10"
                  )}
                  title="إعدادات المساعد الذكي"
                  aria-label="إعدادات المساعد الذكي"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                  aria-label={isMinimized ? "تكبير نافذة الدردشة" : "تصغير نافذة الدردشة"}
                >
                  {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
                </button>
                {!showSettings && messages.length > 0 && (
                  <button
                    onClick={clearChat}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white/50 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                    title="مسح المحادثة"
                    aria-label="مسح المحادثة"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white/50 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                  aria-label="إغلاق المساعد الذكي"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            {!isMinimized && (
              <div className="flex-1 flex flex-col min-h-0">
                {showSettings ? (
                  /* Unified Settings View */
                  <div className="flex-1 flex flex-col min-h-0 bg-black/25">
                    {/* Settings Tab Bar */}
                    <div className="px-4 pt-3 pb-2 border-b border-white/10 flex gap-1.5 shrink-0">
                      {[
                        { id: 'models', label: 'النموذج', icon: Cpu },
                        { id: 'design', label: 'المظهر', icon: SlidersHorizontal },
                        { id: 'tester', label: 'المفتاح', icon: KeyRound },
                      ].map(tab => {
                        const TabIcon = tab.icon;
                        const active = settingsTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setSettingsTab(tab.id as any)}
                            className={cn(
                              "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer",
                              active
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
                            )}
                          >
                            <TabIcon className="w-3.5 h-3.5" />
                            <span>{tab.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                      {settingsTab === 'models' && (
                        <div className="space-y-2.5">
                          <p className="text-xs text-white/60 leading-relaxed">
                            اختر نموذج الذكاء الاصطناعي المناسب لاحتياجاتك البحثية:
                          </p>
                          {AVAILABLE_MODELS.map((model) => {
                            const isSelected = aiModel === model.id;
                            return (
                              <button
                                key={model.id}
                                onClick={() => setAiModel(model.id)}
                                className={cn(
                                  "flex flex-col text-right p-3.5 rounded-2xl border transition-all duration-200 w-full cursor-pointer",
                                  isSelected
                                    ? "border-primary/60 bg-primary/10 text-white"
                                    : "border-white/10 bg-white/[0.02] text-white/70 hover:bg-white/[0.06] hover:border-white/20"
                                )}
                              >
                                <div className="flex items-center justify-between w-full mb-1">
                                  <span className={cn("text-xs font-black", isSelected ? "text-primary" : "text-white")}>
                                    {model.name}
                                  </span>
                                  {isSelected && (
                                    <span className="text-[10px] bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full font-black">
                                      نشط
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] text-white/55 leading-snug">{model.desc}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {settingsTab === 'design' && (
                        <div className="space-y-4">
                          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                            <span className="text-xs font-black text-white block">سمة النافذة</span>
                            <div className="grid grid-cols-3 gap-2">
                              {[
                                { id: 'obsidian', label: 'أوبسيديان' },
                                { id: 'glass', label: 'زجاجي' },
                                { id: 'emerald', label: 'زمردي' },
                              ].map(t => (
                                <button
                                  key={t.id}
                                  onClick={() => setWidgetTheme(t.id as any)}
                                  className={cn(
                                    "py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer",
                                    widgetTheme === t.id
                                      ? "bg-primary/20 border-primary text-primary"
                                      : "bg-white/5 border-white/10 text-white/65 hover:text-white"
                                  )}
                                >
                                  {t.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                            <span className="text-xs font-bold text-white/85">توهج الإطار</span>
                            <button
                              onClick={() => setEnableGlow(!enableGlow)}
                              className={cn(
                                "px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer",
                                enableGlow ? "bg-primary text-primary-foreground" : "bg-white/10 text-white/70"
                              )}
                            >
                              {enableGlow ? 'مفعل' : 'معطل'}
                            </button>
                          </div>

                          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                            <span className="text-xs font-bold text-white/85">قوة الضبابية</span>
                            <div className="flex gap-1.5">
                              {[
                                { id: 'md', label: 'متوسط' },
                                { id: 'xl', label: 'قوي' },
                                { id: 'max', label: 'أقصى' },
                              ].map(b => (
                                <button
                                  key={b.id}
                                  onClick={() => setBlurStrength(b.id as any)}
                                  className={cn(
                                    "px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer",
                                    blurStrength === b.id ? "bg-primary text-primary-foreground" : "bg-white/5 text-white/60 hover:text-white"
                                  )}
                                >
                                  {b.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                            <span className="text-xs font-bold text-white/85">حجم خط المحادثة</span>
                            <div className="flex gap-1.5">
                              {[
                                { id: 'sm', label: 'قياسي' },
                                { id: 'base', label: 'كبير' },
                              ].map(f => (
                                <button
                                  key={f.id}
                                  onClick={() => setChatFontSize(f.id as any)}
                                  className={cn(
                                    "px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer",
                                    chatFontSize === f.id ? "bg-primary text-primary-foreground" : "bg-white/5 text-white/60 hover:text-white"
                                  )}
                                >
                                  {f.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {settingsTab === 'tester' && (
                        <div className="space-y-4">
                          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200 leading-relaxed">
                            يعمل المساعد تلقائياً عبر خادم المنصة، ويمكنك إضافة مفتاح Gemini API خاص بك أدناه للاستخدام المباشر.
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-black text-white/75 block">مفتاح Gemini API الخاص (اختياري)</label>
                            <div className="relative">
                              <Input
                                type="password"
                                placeholder="أدخل مفتاح Gemini API هنا..."
                                value={aiApiKey || ''}
                                onChange={(e) => setAiApiKey(e.target.value)}
                                className="h-11 bg-white/5 border-white/10 rounded-xl focus:bg-white/10 text-xs font-mono pr-4 pl-10 text-white"
                              />
                              {aiApiKey && (
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400">
                                  <Check className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                            <div className="flex justify-between items-center text-[11px] pt-1">
                              <Link
                                href="https://aistudio.google.com/app/apikey"
                                target="_blank"
                                className="font-bold text-primary hover:underline"
                              >
                                احصل على مفتاح من Google AI Studio
                              </Link>
                              <span className="text-white/40">يُحفظ محلياً</span>
                            </div>
                          </div>

                          <Button
                            onClick={testApiKey}
                            disabled={isTestingKey || !aiApiKey?.trim()}
                            className="w-full h-10 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs cursor-pointer"
                          >
                            {isTestingKey ? 'جاري فحص المفتاح...' : 'اختبار صلاحية المفتاح المخصص'}
                          </Button>

                          {keyTestResult && (
                            <div className={cn(
                              "p-3 rounded-xl text-xs font-bold border",
                              keyTestResult.ok
                                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-200"
                                : "bg-rose-500/15 border-rose-500/30 text-rose-200"
                            )}>
                              {keyTestResult.message}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="p-4 border-t border-white/10 shrink-0">
                      <Button
                        onClick={() => setShowSettings(false)}
                        className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-black hover:opacity-95 transition-all cursor-pointer"
                      >
                        حفظ والعودة للمحادثة
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Chat View */
                  <>
                    <div
                      ref={scrollRef}
                      className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 custom-scrollbar"
                    >
                      {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-5 py-4">
                          <div className="relative">
                            <div className="absolute inset-0 bg-primary/25 blur-xl rounded-full" />
                            <div className="relative w-16 h-16 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center shadow-lg">
                              <Bot className="w-8 h-8 text-primary" />
                            </div>
                          </div>

                          {(() => {
                            const greeting = getGreetingData(pathname, userProfile?.name);
                            return (
                              <>
                                <div className="space-y-1.5 max-w-[300px]">
                                  <p className="text-lg font-black font-headline text-white">{greeting.title}</p>
                                  <p className="text-xs font-medium leading-relaxed text-white/65">
                                    {greeting.description}
                                  </p>
                                </div>

                                <div className="flex flex-wrap gap-2 justify-center max-w-[340px] mx-auto pt-1">
                                  {greeting.suggestions.map((s, idx) => (
                                    <button
                                      key={idx}
                                      onClick={() => handleSend(s.text)}
                                      className="text-[11px] font-bold text-white/85 hover:text-primary-foreground bg-white/[0.04] hover:bg-primary border border-white/10 hover:border-primary px-3.5 py-2 rounded-full transition-all duration-200 active:scale-95 cursor-pointer"
                                    >
                                      {s.label}
                                    </button>
                                  ))}
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      ) : (
                        messages.map((msg) => (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                              "flex gap-2.5 group/msg",
                              msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                            )}
                          >
                            <div className={cn(
                              "w-8 h-8 rounded-xl flex items-center justify-center border shrink-0 mt-1",
                              msg.role === 'user'
                                ? "bg-white/10 border-white/15 text-white/80"
                                : "bg-primary/15 border-primary/30 text-primary"
                            )}>
                              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                            </div>

                            <div className={cn(
                              "max-w-[84%] flex flex-col gap-1",
                              msg.role === 'user' ? "items-end" : "items-start"
                            )}>
                              <div className={cn(
                                "px-4 py-3 rounded-2xl leading-relaxed relative",
                                chatFontSize === 'base' ? "text-[15px]" : "text-sm",
                                msg.role === 'user'
                                  ? "bg-primary/15 border border-primary/25 text-white rounded-tr-sm whitespace-pre-line"
                                  : msg.isError
                                    ? "bg-rose-500/10 border border-rose-500/25 text-rose-100 rounded-tl-sm"
                                    : "bg-white/[0.04] border border-white/10 text-white/95 rounded-tl-sm"
                              )}>
                                {msg.role === 'user' ? (
                                  msg.content
                                ) : (
                                  <div className="space-y-1 break-words select-text">
                                    {parseMarkdown(msg.content, (q) => handleSend(q))}
                                  </div>
                                )}

                                {msg.role === 'assistant' && !msg.isError && (
                                  <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2.5 border-t border-white/10 justify-end">
                                    <button
                                      onClick={() => speakMessage(msg.content, msg.id)}
                                      aria-label="استماع للرد"
                                      className={cn(
                                        "flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg transition-all cursor-pointer",
                                        speakingMsgId === msg.id
                                          ? "bg-primary/25 text-primary"
                                          : "text-white/55 hover:text-white bg-white/5 hover:bg-white/10"
                                      )}
                                    >
                                      {speakingMsgId === msg.id ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                                      <span>{speakingMsgId === msg.id ? 'إيقاف' : 'استماع'}</span>
                                    </button>

                                    <button
                                      onClick={() => copyToClipboard(msg.content, msg.id)}
                                      aria-label="نسخ النص"
                                      className="flex items-center gap-1 text-[10px] font-bold text-white/55 hover:text-white bg-white/5 hover:bg-white/10 px-2 py-1 rounded-lg transition-all cursor-pointer"
                                    >
                                      {copiedId === msg.id ? (
                                        <><Check className="w-3 h-3 text-emerald-400" /> تم</>
                                      ) : (
                                        <><Copy className="w-3 h-3" /> نسخ</>
                                      )}
                                    </button>

                                    <button
                                      onClick={() => exportAsFile(msg.content)}
                                      aria-label="تصدير كملف"
                                      className="flex items-center gap-1 text-[10px] font-bold text-white/55 hover:text-white bg-white/5 hover:bg-white/10 px-2 py-1 rounded-lg transition-all cursor-pointer"
                                    >
                                      <FileDown className="w-3 h-3" /> تصدير
                                    </button>

                                    {user && (
                                      <button
                                        onClick={() => saveToNotebook(msg.id, msg.content)}
                                        disabled={isSavingNote === msg.id}
                                        className="flex items-center gap-1 text-[10px] font-bold text-white/55 hover:text-white bg-white/5 hover:bg-white/10 px-2 py-1 rounded-lg transition-all disabled:opacity-50 cursor-pointer"
                                      >
                                        {isSavingNote === msg.id ? (
                                          <Loader2 className="w-3 h-3 animate-spin text-primary" />
                                        ) : (
                                          <Notebook className="w-3 h-3 text-primary" />
                                        )}
                                        <span>مفكرة</span>
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                              <span className="text-[10px] font-semibold text-white/35 px-2">
                                {msg.timestamp.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </motion.div>
                        ))
                      )}

                      {isLoading && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex gap-2.5"
                        >
                          <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
                            <Loader2 className="w-4 h-4 text-primary animate-spin" />
                          </div>
                          <div className="bg-white/[0.04] border border-white/10 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-3">
                            <div className="flex gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.15s]" />
                              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.3s]" />
                            </div>
                            <span className="text-xs font-bold text-white/70">جاري صياغة الإجابة...</span>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Input Area */}
                    <div className="p-3.5 sm:p-4 bg-white/[0.02] border-t border-white/10 shrink-0 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <button
                          onClick={handleSummarizePage}
                          disabled={isLoading}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 border border-primary/25 text-primary text-[11px] font-black hover:bg-primary hover:text-primary-foreground disabled:opacity-50 transition-all cursor-pointer truncate"
                        >
                          <Sparkles className="w-3 h-3 shrink-0" />
                          <span className="truncate">تلخيص: {getPageFriendlyName(pathname)}</span>
                        </button>

                        <button
                          onClick={() => setShowSettings(true)}
                          className="text-[11px] font-bold text-white/50 hover:text-primary transition-colors shrink-0 cursor-pointer"
                        >
                          {getModelFriendlyName(aiModel)}
                        </button>
                      </div>

                      <div className="flex items-center gap-2 bg-white/[0.04] border border-white/10 focus-within:border-primary/50 rounded-2xl p-1.5 transition-all">
                        <button
                          type="button"
                          onClick={isListening ? stopListening : startListening}
                          aria-label={isListening ? "إيقاف الإملاء الصوتي" : "إملاء صوتي"}
                          className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all cursor-pointer",
                            isListening
                              ? "bg-rose-500/20 text-rose-400 animate-pulse border border-rose-500/30"
                              : "text-white/55 hover:text-white hover:bg-white/10"
                          )}
                          title={isListening ? "إيقاف الاستماع" : "تحدث بالمايكروفون"}
                        >
                          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        </button>

                        <input
                          type="text"
                          placeholder={isListening ? "جاري الاستماع لصوتك..." : "اسأل وقفة AI..."}
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                          disabled={isLoading}
                          className="flex-1 bg-transparent text-sm font-medium text-white placeholder:text-white/40 outline-none px-1 h-10"
                        />

                        <Button
                          onClick={() => handleSend()}
                          disabled={!input.trim() || isLoading}
                          className="w-10 h-10 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all p-0 shrink-0 cursor-pointer"
                          aria-label="إرسال"
                        >
                          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger Button */}
      <motion.button
        layout
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        aria-label={isOpen ? "إغلاق المساعد الذكي" : "فتح المساعد الذكي"}
        className={cn(
          "pointer-events-auto w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all duration-300 relative group cursor-pointer border",
          isOpen
            ? "bg-zinc-900 text-white border-white/20 shadow-2xl"
            : "bg-primary text-primary-foreground border-primary/40 shadow-[0_12px_32px_-8px_rgba(var(--primary-rgb),0.6)]"
        )}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <div className="relative flex items-center justify-center">
            <MessageSquare className="w-6 h-6 md:w-7 md:h-7" />
            <Sparkles className="w-3.5 h-3.5 absolute -top-1.5 -right-1.5 text-white animate-pulse" />
          </div>
        )}
      </motion.button>
    </div>
  );
}
