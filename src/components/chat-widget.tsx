"use client"

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { 
  MessageSquare, X, Send, Sparkles, User, 
  Bot, Loader2, Settings, Info, AlertCircle,
  Minimize2, Maximize2, Trash2, Copy, Check, ChevronLeft,
  FileDown, Notebook, Book as BookIcon, Compass,
  Mic, MicOff, Volume2, VolumeX, Palette, Shield
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
  // Regex to match **bold** or [label](url)
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
          className="text-primary font-bold underline hover:text-white transition-colors duration-200 cursor-pointer inline"
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
    <div className="my-4 p-5 rounded-3xl bg-amber-500/[0.03] border border-amber-500/20 shadow-[0_4px_20px_rgba(245,158,11,0.05)] flex flex-col gap-3 selection:bg-amber-500/20 selection:text-amber-200">
      <div className="flex items-center justify-between border-b border-amber-500/10 pb-2.5">
        <div className="flex items-center gap-2 text-amber-500">
          <BookIcon className="w-4 h-4" />
          <span className="text-xs font-black font-headline">آية قرآنية</span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-black text-amber-500">
          سورة {surah} - آية {ayah}
        </span>
      </div>
      <p className="text-xl font-bold font-quran leading-loose text-center text-amber-100 drop-shadow-[0_0_10px_rgba(245,158,11,0.2)] py-2 select-text">
        {text}
      </p>
      <div className="flex justify-end gap-2 mt-1">
        <button
          onClick={() => {
            if (tafsir) {
              setShowTafsir(!showTafsir);
            } else {
              onQuery(`ما التفسير الميسر للآية الكريمة: "${text}" [سورة ${surah} آية ${ayah}]؟`);
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-500 text-[10px] font-black transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          <span>{tafsir ? (showTafsir ? "إخفاء التفسير" : "عرض التفسير الميسر") : "طلب تفسير الآية من المساعد"}</span>
        </button>
      </div>
      {showTafsir && tafsir && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-4 rounded-2xl bg-amber-500/[0.05] border border-amber-500/10 text-xs font-medium text-amber-200/90 leading-relaxed text-right select-text"
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
    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
    : "bg-amber-500/10 border-amber-500/20 text-amber-400";

  return (
    <div className="my-4 p-5 rounded-3xl bg-emerald-500/[0.02] border border-emerald-500/15 shadow-[0_4px_20px_rgba(16,185,129,0.03)] flex flex-col gap-3 selection:bg-emerald-500/20 selection:text-emerald-200">
      <div className="flex items-center justify-between border-b border-emerald-500/10 pb-2.5">
        <div className="flex items-center gap-2 text-emerald-500">
          <Compass className="w-4 h-4 text-emerald-400" style={{ animation: 'spin 20s linear infinite' }} />
          <span className="text-xs font-black font-headline">حديث نبوي شريف</span>
        </div>
        <div className="flex gap-1.5">
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/10 text-[10px] font-black text-emerald-400">
            {source}
          </span>
          <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-black border", gradeClass)}>
            {grade}
          </span>
        </div>
      </div>
      <p className="text-sm font-bold leading-relaxed text-right text-emerald-100/90 py-2 select-text">
        {text}
      </p>
      <div className="flex justify-end gap-2 mt-1">
        <button
          onClick={() => {
            if (explanation) {
              setShowExplanation(!showExplanation);
            } else {
              onQuery(`ما شرح وتخريج الحديث النبوي الشريف: "${text}" [المصدر: ${source}]؟`);
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-[10px] font-black transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>{explanation ? (showExplanation ? "إخفاء الشرح" : "عرض شرح الحديث") : "طلب شرح وتخريج الحديث"}</span>
        </button>
      </div>
      {showExplanation && explanation && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-4 rounded-2xl bg-emerald-500/[0.05] border border-emerald-500/10 text-xs font-medium text-emerald-200/90 leading-relaxed text-right select-text"
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

  // Flexibly parse quran tags
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
  textWithTokens = textWithTokens.replace(quranRegex, () => {
    return `\n%%QURAN_BLOCK_${quranCounter++}%%\n`;
  });

  // Flexibly parse hadith tags
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
  textWithTokens = textWithTokens.replace(hadithRegex, () => {
    return `\n%%HADITH_BLOCK_${hadithCounter++}%%\n`;
  });

  const lines = textWithTokens.split('\n');
  return lines.map((line, i) => {
    const trimmed = line.trim();

    // Check for tokens
    const quranTokenMatch = trimmed.match(/^%%QURAN_BLOCK_(\d+)%%$/);
    if (quranTokenMatch) {
      const idx = parseInt(quranTokenMatch[1], 10);
      const block = quranBlocks[idx];
      if (block) {
        return <QuranVerseCard key={`quran-${idx}-${i}`} {...block} onQuery={onQuery} />;
      }
    }

    const hadithTokenMatch = trimmed.match(/^%%HADITH_BLOCK_(\d+)%%$/);
    if (hadithTokenMatch) {
      const idx = parseInt(hadithTokenMatch[1], 10);
      const block = hadithBlocks[idx];
      if (block) {
        return <HadithCard key={`hadith-${idx}-${i}`} {...block} onQuery={onQuery} />;
      }
    }

    // Check for headings
    if (trimmed.startsWith('### ')) {
      return <h5 key={i} className="text-sm font-black text-white mt-3 mb-1.5 font-headline">{trimmed.substring(4)}</h5>;
    }
    if (trimmed.startsWith('## ')) {
      return <h4 key={i} className="text-base font-black text-white mt-4 mb-2 font-headline">{trimmed.substring(3)}</h4>;
    }
    if (trimmed.startsWith('# ')) {
      return <h3 key={i} className="text-lg font-black text-white mt-4 mb-2 font-headline">{trimmed.substring(2)}</h3>;
    }
    
    // Check for list items
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const content = trimmed.substring(2);
      return (
        <li key={i} className="list-disc list-inside mr-4 text-white/90 leading-relaxed my-1 pr-2">
          {parseInlineMarkdown(content)}
        </li>
      );
    }
    
    if (trimmed.startsWith('1. ') || trimmed.match(/^\d+\.\s/)) {
      const content = trimmed.substring(trimmed.indexOf('.') + 1).trim();
      return (
        <li key={i} className="list-decimal list-inside mr-4 text-white/90 leading-relaxed my-1 pr-2">
          {parseInlineMarkdown(content)}
        </li>
      );
    }

    if (trimmed === '') {
      return <div key={i} className="h-2" />;
    }

    return (
      <p key={i} className="leading-relaxed my-1.5 text-white/90">
        {parseInlineMarkdown(line)}
      </p>
    );
  });
}

const AVAILABLE_MODELS = [
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash (الأحدث)", desc: "سرعة فائقة وذكاء معزز ومثالي للمهام والأسئلة اليومية" },
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro (الأقوى)", desc: "أداء نخبوي للتحليل الشرعي المعقد والخطط العلمية المفصلة" },
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash (المستقر)", desc: "سرعة استجابة مذهلة مع جودة إجابة متميزة" },
  { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash (الكلاسيكي)", desc: "سريع وموثوق للمهام والاستفسارات القياسية" },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro (الكلاسيكي المحترف)", desc: "تحليل سياق ضخم وعميق لمطالعة الكتب الطويلة" }
];

export function ChatWidget() {
  const { aiApiKey, setAiApiKey, aiModel, setAiModel } = useAppearance();
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

  // Initialize dimensions responsibly on mount to prevent SSR mismatch
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const initialW = Math.min(420, window.innerWidth - 32);
      const initialH = Math.min(600, window.innerHeight - 100);
      setWidth(initialW);
      setHeight(initialH);
    }
  }, []);

  // ── Widget Appearance States ──────────────────────────────────────────────
  const [widgetTheme, setWidgetThemeState] = useState<'obsidian' | 'glass' | 'emerald'>('obsidian');
  const [enableGlow, setEnableGlowState] = useState(true);
  const [blurStrength, setBlurStrengthState] = useState<'md' | 'xl' | 'max'>('xl');
  const [chatFontSize, setChatFontSizeState] = useState<'sm' | 'base'>('sm');
  const [settingsTab, setSettingsTab] = useState<'models' | 'design' | 'voice' | 'tester'>('models');

  // ── Voice States ──────────────────────────────────────────────────────────
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // ── API Key Tester States ─────────────────────────────────────────────────
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [keyTestResult, setKeyTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  // Load persisted appearance settings on mount
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

  // ── Computed Theme Classes (glassmorphism / obsidian / emerald) ───────────
  const themeClasses = useMemo(() => {
    const blurClass = blurStrength === 'md'
      ? 'backdrop-blur-xl'
      : blurStrength === 'max'
        ? 'backdrop-blur-[50px]'
        : 'backdrop-blur-3xl';
    const glowShadow = enableGlow
      ? 'shadow-[0_0_0_1px_rgba(99,102,241,0.18),0_50px_100px_-20px_rgba(0,0,0,0.65),0_0_60px_-15px_rgba(99,102,241,0.12)]'
      : 'shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)]';
    if (widgetTheme === 'glass') {
      return `bg-white/[0.07] ${blurClass} border border-white/[0.14] rounded-[2.5rem] ${glowShadow} overflow-hidden flex flex-col select-none relative`;
    }
    if (widgetTheme === 'emerald') {
      return `bg-[#030f07]/93 ${blurClass} border border-emerald-500/25 rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7),0_0_70px_-20px_rgba(16,185,129,0.09)] overflow-hidden flex flex-col select-none relative`;
    }
    // Default: obsidian
    return `bg-[#0c0c0c]/88 ${blurClass} border border-white/10 rounded-[2.5rem] ${glowShadow} overflow-hidden flex flex-col select-none relative`;
  }, [widgetTheme, blurStrength, enableGlow]);

  // ── Voice: Speech-to-Text ─────────────────────────────────────────────────
  const startListening = () => {
    const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SR) return;
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
    utter.rate = 0.88;
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
      const m = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
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
        const newWidth = Math.max(320, Math.min(900, startW + deltaX));
        setWidth(newWidth);
      }
      if (direction === 'n' || direction === 'ne') {
        const newHeight = Math.max(380, Math.min(900, startH - deltaY));
        setHeight(newHeight);
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


  // Load local collections for client-side RAG context
  const { data: allPrograms } = useCollection<Program>('programs', { limit: 50 });
  const { data: allSeries } = useCollection<Series>('series', { limit: 50 });
  const { data: allBooks } = useCollection<Book>('books', { limit: 50 });
  const { data: allLectures } = useCollection<Lecture>('lectures', { orderBy: ['createdAt', 'desc'], limit: 50 });
  const { data: allShubuhat } = useCollection<Shubha>('shubuhat', { limit: 50 });
  const { data: allDestructiveSins } = useCollection<DestructiveSin>('destructive_sins', { limit: 50 });

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, showSettings]);

  const getPageFriendlyName = (path: string) => {
    if (path === '/') return 'الصفحة الرئيسية';
    if (path.startsWith('/quran')) return 'صفحة القرآن الكريم';
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
      
      // Remove scripts, styles, chat widget elements, and buttons to keep only the pure content
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

  const getGreetingData = (path: string, userName?: string) => {
    const welcome = userName ? `أهلاً بك يا ${userName} في وقفة AI` : `أهلاً بك في وقفة AI`;
    if (path.startsWith('/quran')) {
      return {
        title: welcome,
        description: "أنا هنا لمساعدتك في تدبر آيات القرآن الكريم وفهم معانيها السامية وتوجيهات أوراد الحفظ والتدبر الخاصة بك.",
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
        description: "مرحباً بك في قسم محاسبة النفس والعبادات. سأساعدك في تنظيم أورادك الطاعة والعبادات والمحافظة عليها.",
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
        description: "أهلاً بك في قسم تفادي المهلكات وكبائر الذنوب. سأساعدك في معرفة سبل الوقاية والخطط العلاجية من الذنوب.",
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
      description: `أنا هنا لمساعدتك في رحلتك العلمية باستخدام نموذج ${getModelFriendlyName(aiModel)}. كيف يمكنني خدمتك اليوم؟`,
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
      // List of active and supported models to try in order of preference, starting with the user's selected model
      const modelsToTry = [
        aiModel,
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

      // Extract relevant context
      let relevantContext = "";
      try {
        const normalizedQuery = normalizeArabic(textToSend.toLowerCase());
        const queryWords = normalizedQuery.split(/\s+/).filter(w => w.trim().length > 1);
        const matches: string[] = [];

        if (queryWords.length > 0) {
          allPrograms?.forEach(p => {
            const normName = normalizeArabic(p.name.toLowerCase());
            const normBio = p.bio ? normalizeArabic(p.bio.toLowerCase()) : '';
            const nameMatch = queryWords.some(word => normName.includes(word));
            const bioMatch = normBio ? queryWords.some(word => normBio.includes(word)) : false;
            if (nameMatch || bioMatch) {
              matches.push(`- برنامج علمي: "${p.name}" (رابط الصفحة: [/programs/${p.slug}](/programs/${p.slug})) - الوصف: ${p.bio || 'لا يوجد وصف'}`);
            }
          });
          allSeries?.forEach(s => {
            const normTitle = normalizeArabic(s.title.toLowerCase());
            const normDesc = s.description ? normalizeArabic(s.description.toLowerCase()) : '';
            const titleMatch = queryWords.some(word => normTitle.includes(word));
            const descMatch = normDesc ? queryWords.some(word => normDesc.includes(word)) : false;
            if (titleMatch || descMatch) {
              matches.push(`- سلسلة علمية: "${s.title}" (رابط الصفحة: [/series/${s.slug}](/series/${s.slug})) - الوصف: ${s.description || 'لا يوجد وصف'}`);
            }
          });
          allBooks?.forEach(b => {
            const normTitle = normalizeArabic(b.title.toLowerCase());
            const normAuthor = b.author ? normalizeArabic(b.author.toLowerCase()) : '';
            const normDesc = b.description ? normalizeArabic(b.description.toLowerCase()) : '';
            const titleMatch = queryWords.some(word => normTitle.includes(word));
            const authorMatch = normAuthor ? queryWords.some(word => normAuthor.includes(word)) : false;
            const descMatch = normDesc ? queryWords.some(word => normDesc.includes(word)) : false;
            if (titleMatch || authorMatch || descMatch) {
              matches.push(`- كتاب: "${b.title}" للمؤلف ${b.author || 'غير معروف'} (رابط الصفحة: [/books/${b.slug}](/books/${b.slug})) - الوصف: ${b.description || 'لا يوجد وصف'}`);
            }
          });
          allLectures?.forEach(l => {
            const normTitle = normalizeArabic(l.title.toLowerCase());
            const normDesc = l.description ? normalizeArabic(l.description.toLowerCase()) : '';
            const titleMatch = queryWords.some(word => normTitle.includes(word));
            const descMatch = normDesc ? queryWords.some(word => normDesc.includes(word)) : false;
            if (titleMatch || descMatch) {
              matches.push(`- محاضرة: "${l.title}" (رابط الصفحة: [/lectures/${l.slug}](/lectures/${l.slug})) - الوصف: ${l.description || 'لا يوجد وصف'}`);
            }
          });
          allShubuhat?.forEach(sh => {
            const normQ = normalizeArabic(sh.question.toLowerCase());
            const normSum = sh.summary ? normalizeArabic(sh.summary.toLowerCase()) : '';
            const qMatch = queryWords.some(word => normQ.includes(word));
            const sMatch = normSum ? queryWords.some(word => normSum.includes(word)) : false;
            if (qMatch || sMatch) {
              matches.push(`- سؤال وتفنيد شبهة: "${sh.question}" (رابط القسم: [/shubuhat](/shubuhat)) - الخلاصة والرد: ${sh.summary}`);
            }
          });
          allDestructiveSins?.forEach(ds => {
            const normTitle = normalizeArabic(ds.title.toLowerCase());
            const normConcept = ds.concept ? normalizeArabic(ds.concept.toLowerCase()) : '';
            const tMatch = queryWords.some(word => normTitle.includes(word));
            const cMatch = normConcept ? queryWords.some(word => normConcept.includes(word)) : false;
            if (tMatch || cMatch) {
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

      // Check if user entered custom API keys
      const cleanKeys = aiApiKey ? aiApiKey.split(',').map(k => k.trim()).filter(Boolean) : [];

      if (cleanKeys.length > 0) {
        // Outer loop: Try each API key in rotation
        for (const key of cleanKeys) {
          const genAI = new GoogleGenerativeAI(key);

          // Inner loop: Try each model
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

              // Limit chat history to the last 12 messages to prevent token bloat and avoid 429 Rate Limits
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
                  break; // Exit retry loop on success
                } catch (retryErr: any) {
                  const errStr = retryErr.toString().toLowerCase();
                  if ((errStr.includes("quota") || errStr.includes("429")) && retryCount < maxRetries) {
                    retryCount++;
                    const delay = retryCount * 1500;
                    console.warn(`Hit 429 for key ${key.slice(0, 6)}... Retrying in ${delay}ms... (Attempt ${retryCount}/${maxRetries})`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                  } else {
                    throw retryErr;
                  }
                }
              }
              if (successfulResponseText) break; // Exit inner model loop
            } catch (err: any) {
              lastError = err;
              const errStr = err.toString().toLowerCase();
              
              // Check for key-level issues
              if (errStr.includes("api_key_invalid") || errStr.includes("401") || errStr.includes("403") || errStr.includes("invalid key")) {
                console.warn(`API Key starting with ${key.slice(0, 6)}... failed with auth error.`);
                break; // Break inner loop to try next API key
              }
              if (errStr.includes("quota") || errStr.includes("429")) {
                quotaError = err;
                console.warn(`API Key starting with ${key.slice(0, 6)}... hit rate limit.`);
                break; // Break inner loop to try next API key
              }
              
              if (errStr.includes("blocked") || errStr.includes("safety")) safetyError = err;
              else if (errStr.includes("404")) modelNotFoundError = err;
              
              console.warn(`Model ${modelName} failed for key ${key.slice(0, 6)}...`, err);
            }
          }

          // If we got a successful response, exit the outer key loop
          if (successfulResponseText) break;
        }
      }

      // If local keys failed, or if no custom keys are configured, fallback to secure server-side API!
      if (!successfulResponseText) {
        console.log("No custom keys succeeded. Falling back to server-side API handler...");
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
            { role: 'user', parts: [{ text: textToSend.trim() }] } // The current user query
          ];

          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              messages: history,
              model: aiModel
            })
          });

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || `HTTP_${response.status}`);
          }

          const resData = await response.json();
          successfulResponseText = resData.text;
        } catch (serverErr: any) {
          console.error("Server fallback failed:", serverErr);
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
      
      if (errorStr.includes("401") || errorStr.includes("403")) {
        errorMessageContent = "مفتاح الـ API غير صالح. تأكد من نسخه بشكل صحيح دون مسافات إضافية.";
      } else if (errorStr.includes("429")) {
        errorMessageContent = "تم تجاوز حصة الاستخدام (الخطأ 429). إذا كان هذا المفتاح جديداً تماماً ولم تستخدمه من قبل، فإن شركة Google تعطل المفاتيح المجانية تلقائياً في بعض الحالات للأسباب التالية:\n1️⃣ استخدام اتصال VPN أو بروكسي غير مدعوم (يرجى إيقافه والمحاولة مجدداً).\n2️⃣ قيود إقليمية على حسابك الجغرافي (الدولة).\n3️⃣ حاجة حساب Google Cloud لربط بطاقة دفع (سيبقى مجانياً ولكن لإثبات الهوية وتفعيل الحصص).\n\n💡 الحل السريع: حاول إيقاف الـ VPN، أو قم بإنشاء مشروع جديد تماماً في Google AI Studio واستخراج مفتاح آخر، أو أضف بطاقة دفع لحسابك لتفعيل الاستخدام المجاني فوراً.";
      } else if (errorStr.includes("safety")) {
        errorMessageContent = "تم حجب الإجابة بواسطة مرشحات الأمان الخاصة بالمحرك.";
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
      console.error("Error exporting file:", e);
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
        title: "خطأ في الاتصال",
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
      console.error("Failed to save note:", error);
      toast({
        variant: "destructive",
        title: "فشل الحفظ",
        description: "حدث خطأ غير متوقع أثناء محاولة الحفظ. يرجى المحاولة مرة أخرى.",
      });
    } finally {
      setIsSavingNote(null);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const getModelFriendlyName = (id: string) => {
    return AVAILABLE_MODELS.find(m => m.id === id)?.name.split(" (")[0] || id;
  };

  return (
    <div className="fixed bottom-6 left-6 z-[100] pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            drag
            dragControls={dragControls}
            dragListener={false}
            dragMomentum={false}
            dragElastic={0.05}
            dragConstraints={{ left: -1200, right: 1200, top: -1200, bottom: 1200 }}
            initial={{ opacity: 0, y: 20, scale: 0.9, filter: 'blur(10px)' }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1, 
              filter: 'blur(0px)',
              height: isMinimized ? 80 : height,
              width: isMinimized ? 320 : width,
            }}
            exit={{ opacity: 0, y: 20, scale: 0.9, filter: 'blur(10px)' }}
            className={cn(
              'pointer-events-auto',
              themeClasses,
              isMinimized ? 'mb-4' : 'mb-6'
            )}
          >
            {/* Resize Handles */}
            {!isMinimized && (
              <>
                {/* Top Border Resizer */}
                <div 
                  onPointerDown={(e) => startResize(e, 'n')}
                  className="absolute top-0 left-4 right-4 h-1.5 cursor-ns-resize z-50 hover:bg-primary/20 transition-colors"
                />
                {/* Right Border Resizer */}
                <div 
                  onPointerDown={(e) => startResize(e, 'e')}
                  className="absolute top-4 right-0 bottom-4 w-1.5 cursor-ew-resize z-50 hover:bg-primary/20 transition-colors"
                />
                {/* Top-Right Corner Resizer with Visual Grip Icon */}
                <div 
                  onPointerDown={(e) => startResize(e, 'ne')}
                  className="absolute top-2 right-2 w-6 h-6 cursor-nesw-resize flex items-center justify-center text-white/20 hover:text-primary hover:bg-white/5 rounded-lg z-50 transition-all group"
                  title="تغيير حجم النافذة"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" className="opacity-60 group-hover:opacity-100 transition-opacity">
                    <line x1="10" y1="0" x2="0" y2="10" stroke="currentColor" strokeWidth="1.5" />
                    <line x1="10" y1="4" x2="4" y2="10" stroke="currentColor" strokeWidth="1.5" />
                    <line x1="10" y1="8" x2="8" y2="10" stroke="currentColor" strokeWidth="1.5" />
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
              className="pt-3 px-6 pb-5 border-b border-white/5 flex flex-col gap-2.5 bg-white/[0.02] cursor-grab active:cursor-grabbing select-none"
            >
              {/* Drag Indicator Capsule */}
              <div className="w-12 h-1 bg-white/15 rounded-full mx-auto" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary/20 border border-primary/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white font-headline tracking-tight">وقفة AI</h3>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">
                        {showSettings ? "إعدادات المساعد" : `نشط: ${getModelFriendlyName(aiModel)}`}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                                  {/* Settings Panel */}
                {showSettings && (
                  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="w-full max-w-md mx-auto bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4 backdrop-blur-lg">
                      {/* Tab Navigation */}
                      <div className="flex space-x-2 mb-3">
                        <button
                          onClick={() => setSettingsTab('design')}
                          className={cn(
                            "px-3 py-1 rounded-full text-sm font-medium",
                            settingsTab === 'design'
                              ? "bg-primary text-white"
                              : "bg-white/10 text-white"
                          )}
                        >
                          تصميم
                        </button>
                        <button
                          onClick={() => setSettingsTab('voice')}
                          className={cn(
                            "px-3 py-1 rounded-full text-sm font-medium",
                            settingsTab === 'voice'
                              ? "bg-primary text-white"
                              : "bg-white/10 text-white"
                          )}
                        >
                          صوت
                        </button>
                        <button
                          onClick={() => setSettingsTab('tester')}
                          className={cn(
                            "px-3 py-1 rounded-full text-sm font-medium",
                            settingsTab === 'tester'
                              ? "bg-primary text-white"
                              : "bg-white/10 text-white"
                          )}
                        >
                          اختبار المفتاح
                        </button>
                      </div>

                      {/* Tab Content */}
                      {settingsTab === 'design' && (
                        <div className="space-y-3">
                          {/* Theme Selection */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-white/80">السمة</span>
                            <select
                              value={widgetTheme}
                              onChange={e => setWidgetTheme(e.target.value as any)}
                              className="bg-white/10 text-white rounded px-2 py-1"
                            >
                              <option value="obsidian">أوبسيديان</option>
                              <option value="glass">زجاجي</option>
                              <option value="emerald">زمردي</option>
                            </select>
                          </div>
                          {/* Glow Toggle */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-white/80">التوهج</span>
                            <button
                              onClick={() => setEnableGlow(!enableGlow)}
                              className={cn(
                                "px-3 py-1 rounded-full text-xs font-medium",
                                enableGlow ? "bg-primary text-white" : "bg-white/10 text-white"
                              )}
                            >
                              {enableGlow ? 'مفعل' : 'معطل'}
                            </button>
                          </div>
                          {/* Blur Strength */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-white/80">الضباب</span>
                            <select
                              value={blurStrength}
                              onChange={e => setBlurStrength(e.target.value as any)}
                              className="bg-white/10 text-white rounded px-2 py-1"
                            >
                              <option value="md">متوسط</option>
                              <option value="xl">قوي</option>
                              <option value="max">أقصى</option>
                            </select>
                          </div>
                          {/* Font Size */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-white/80">حجم الخط</span>
                            <select
                              value={chatFontSize}
                              onChange={e => setChatFontSize(e.target.value as any)}
                              className="bg-white/10 text-white rounded px-2 py-1"
                            >
                              <option value="sm">صغير</option>
                              <option value="base">متوسط</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {settingsTab === 'voice' && (
                        <div className="flex flex-col space-y-2 items-center">
                          <button
                            onClick={isListening ? stopListening : startListening}
                            className={cn(
                              "flex items-center gap-2 px-4 py-2 rounded-full",
                              isListening ? "bg-emerald-500 text-white" : "bg-primary text-white"
                            )}
                          >
                            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                            {isListening ? 'إيقاف التسجيل' : 'بدء التسجيل'}
                          </button>
                        </div>
                      )}

                      {settingsTab === 'tester' && (
                        <div className="flex flex-col space-y-2">
                          <button
                            onClick={testApiKey}
                            disabled={isTestingKey}
                            className="w-full px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50"
                          >
                            {isTestingKey ? '... يجري الفحص' : 'اختبار المفتاح'}
                          </button>
                          {keyTestResult && (
                            <div className={cn(
                              "p-2 rounded",
                              keyTestResult.ok ? "bg-emerald-500/20 text-emerald-100" : "bg-rose-500/20 text-rose-100"
                            )}>
                              {keyTestResult.message}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex justify-end mt-4">
                        <button
                          onClick={() => setShowSettings(false)}
                          className="px-3 py-1 bg-white/10 text-white rounded"
                        >
                          إغلاق
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                  <button 
                    onClick={() => { setShowSettings(!showSettings); setIsMinimized(false); }}
                    className={cn(
                      "p-2 rounded-xl transition-all",
                      showSettings ? "text-primary bg-primary/10" : "text-white/20 hover:text-white hover:bg-white/5"
                    )}
                    title="إعدادات المساعد الذكي"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 hover:bg-white/5 rounded-xl text-white/20 hover:text-white transition-all"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                {!showSettings && (
                  <button 
                    onClick={clearChat}
                    className="p-2 hover:bg-white/5 rounded-xl text-white/20 hover:text-white transition-all"
                    title="مسح المحادثة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-xl text-white/20 hover:text-red-500 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

            {/* Chat Body */}
            {!isMinimized && (
              <div className="flex-1 flex flex-col min-h-0">
                {showSettings ? (
                  /* Settings Interface inside Widget */
                  <div 
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-black/40"
                  >
                    <div className="space-y-2">
                      <h4 className="text-sm font-black text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span>تخصيص نموذج الذكاء الاصطناعي</span>
                      </h4>
                      <p className="text-[11px] text-white/40 leading-relaxed font-medium">
                        تسمح لك منصة وقفة باختيار النموذج المناسب لموارد جهازك واحتياجاتك البحثية.
                      </p>
                    </div>

                    {/* Model Picker */}
                    <div className="space-y-3">
                      <label className="text-[9px] font-black uppercase tracking-wider text-white/30 mr-1">
                        اختر نموذج Gemini
                      </label>
                      <div className="grid grid-cols-1 gap-2.5">
                        {AVAILABLE_MODELS.map((model) => {
                          const isSelected = aiModel === model.id;
                          return (
                            <button
                              key={model.id}
                              onClick={() => setAiModel(model.id)}
                              className={cn(
                                "flex flex-col text-right p-4 rounded-2xl border transition-all duration-300 w-full group/model",
                                isSelected
                                  ? "border-primary bg-primary/5 text-white"
                                  : "border-white/5 bg-white/[0.02] text-white/60 hover:bg-white/5 hover:border-white/10"
                              )}
                            >
                              <div className="flex items-center justify-between w-full mb-1">
                                <span className={cn(
                                  "text-xs font-black transition-colors",
                                  isSelected ? "text-primary" : "text-white group-hover/model:text-primary"
                                )}>
                                  {model.name}
                                </span>
                                {isSelected && (
                                  <span className="text-[8px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-black uppercase">
                                    نشط
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-white/40 leading-normal font-medium">
                                {model.desc}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Quick API Key Access */}
                    <div className="space-y-3 pt-4 border-t border-white/5">
                      <label className="text-[9px] font-black uppercase tracking-wider text-white/30 mr-1">
                        مفتاح الـ API الحالي
                      </label>
                      <div className="relative">
                        <Input 
                          type="password"
                          placeholder="أدخل مفتاح Gemini API هنا..."
                          value={aiApiKey || ''}
                          onChange={(e) => setAiApiKey(e.target.value)}
                          className="h-12 bg-white/5 border-white/5 rounded-xl focus:bg-white/10 text-xs font-mono pr-4 pl-10"
                        />
                        {aiApiKey && (
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 px-1">
                        <div className="flex justify-between items-center">
                          <Link 
                            href="https://aistudio.google.com/app/apikey" 
                            target="_blank" 
                            className="text-[9px] font-black text-primary hover:underline"
                          >
                            احصل على مفتاح مجاني من Google
                          </Link>
                          <span className="text-[8px] text-white/20">يُحفظ محلياً في متصفحك</span>
                        </div>
                        <span className="text-[9.5px] text-white/40 leading-relaxed text-right block">
                          تلميح: يمكنك إدخال عدة مفاتيح تفصل بينها فاصلة (,) للتدوير التلقائي وتفادي قيود الاستخدام.
                        </span>
                      </div>
                    </div>

                    <Button 
                      onClick={() => setShowSettings(false)}
                      className="w-full h-12 rounded-xl bg-primary text-white font-black hover:scale-[1.01] active:scale-95 transition-all mt-4"
                    >
                      حفظ والعودة للمحادثة
                    </Button>
                  </div>
                ) : (
                  /* Chat View */
                  <>
                    <div 
                      ref={scrollRef}
                      className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
                    >
                      {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                          <div className="w-20 h-20 rounded-[2rem] bg-white/5 flex items-center justify-center border border-white/10">
                            <Bot className="w-10 h-10 text-white/50" />
                          </div>
                          {(() => {
                            const greeting = getGreetingData(pathname, userProfile?.name);
                            return (
                              <>
                                <div className="space-y-2">
                                  <p className="text-xl font-black font-headline text-white">{greeting.title}</p>
                                  <p className="text-xs font-medium max-w-[280px] mx-auto leading-relaxed text-white/60">
                                    {greeting.description}
                                  </p>
                                </div>
                                
                                {aiApiKey && (
                                  <div className="flex flex-wrap gap-2 justify-center max-w-[320px] mx-auto pt-2">
                                    {greeting.suggestions.map((s, idx) => (
                                      <button
                                        key={idx}
                                        onClick={() => handleSend(s.text)}
                                        className="text-[11px] font-bold text-primary/80 hover:text-white bg-primary/5 hover:bg-primary border border-primary/10 hover:border-primary px-3 py-2 rounded-full transition-all duration-300 transform active:scale-95"
                                      >
                                        {s.label}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </>
                            );
                          })()}

                          {!aiApiKey && (
                            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 max-w-[280px]">
                               <div className="flex items-center gap-2 text-amber-500 mb-2 justify-center">
                                 <AlertCircle className="w-4 h-4" />
                                 <span className="text-[10px] font-black uppercase tracking-widest">تنبيه التقنية</span>
                               </div>
                               <p className="text-[10px] text-white/60 font-medium leading-relaxed mb-4">
                                 للبدء في استخدام المساعد الذكي، يرجى إضافة مفتاح Gemini API الخاص بك.
                               </p>
                               <Button 
                                 size="sm" 
                                 onClick={() => setShowSettings(true)}
                                 className="w-full h-10 rounded-xl bg-amber-500 text-black hover:bg-amber-600 font-black"
                                >
                                 إعداد المفتاح والنموذج
                               </Button>
                            </div>
                          )}
                        </div>
                      ) : (
                        messages.map((msg) => (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={cn(
                              "flex gap-4 group/msg",
                              msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                            )}
                          >
                            <div className={cn(
                              "w-10 h-10 rounded-2xl flex items-center justify-center border shrink-0",
                              msg.role === 'user' 
                                ? "bg-white/5 border-white/10" 
                                : "bg-primary/10 border-primary/20"
                            )}>
                              {msg.role === 'user' ? <User className="w-5 h-5 text-white/20" /> : <Sparkles className="w-5 h-5 text-primary" />}
                            </div>
                            <div className={cn(
                              "max-w-[80%] space-y-2",
                              msg.role === 'user' ? "items-end" : "items-start"
                            )}>
                              <div className={cn(
                                "p-5 rounded-[2rem] text-sm leading-relaxed relative",
                                msg.role === 'user' 
                                  ? "bg-white/5 text-white rounded-tr-none whitespace-pre-line" 
                                  : "bg-primary/5 text-white/90 rounded-tl-none border border-primary/10"
                              )}>
                                {msg.role === 'user' ? (
                                  msg.content
                                ) : (
                                  <div className="space-y-1.5 break-words">
                                    {parseMarkdown(msg.content, (q) => handleSend(q))}
                                  </div>
                                )}
                                
                                {msg.role === 'assistant' && (
                                  <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/5 justify-end">
                                    <button
                                      onClick={() => copyToClipboard(msg.content, msg.id)}
                                      className="flex items-center gap-1 text-[10px] font-bold text-white/40 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg transition-all"
                                      title="نسخ النص"
                                    >
                                      {copiedId === msg.id ? (
                                        <><Check className="w-3 h-3 text-emerald-500" /> تم النسخ</>
                                      ) : (
                                        <><Copy className="w-3 h-3" /> نسخ</>
                                      )}
                                    </button>

                                    <button
                                      onClick={() => exportAsFile(msg.content)}
                                      className="flex items-center gap-1 text-[10px] font-bold text-white/40 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg transition-all"
                                      title="تصدير كملف نصي"
                                    >
                                      <FileDown className="w-3 h-3" /> تصدير
                                    </button>

                                    {user && (
                                      <button
                                        onClick={() => saveToNotebook(msg.id, msg.content)}
                                        disabled={isSavingNote === msg.id}
                                        className="flex items-center gap-1 text-[10px] font-bold text-white/40 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg transition-all disabled:opacity-50"
                                        title="حفظ في المفكرة"
                                      >
                                        {isSavingNote === msg.id ? (
                                          <Loader2 className="w-3 h-3 animate-spin text-primary" />
                                        ) : (
                                          <Notebook className="w-3 h-3 text-primary" />
                                        )}
                                        <span>حفظ بالمفكرة</span>
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                              <span className="text-[8px] font-black uppercase text-white/20 px-4 tracking-[0.2em]">
                                {msg.timestamp.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </motion.div>
                        ))
                      )}

                      {isLoading && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex gap-4"
                        >
                          <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <Loader2 className="w-5 h-5 text-primary animate-spin" />
                          </div>
                          <div className="bg-primary/5 border border-primary/10 p-5 rounded-[2rem] rounded-tl-none flex items-center gap-3">
                             <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" />
                                <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:0.2s]" />
                                <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:0.4s]" />
                             </div>
                             <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest">جاري صياغة الإجابة...</span>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Input Area */}
                    <div className="p-6 bg-white/[0.02] border-t border-white/5">
                        <div className="flex justify-start mb-3">
                          <button
                            onClick={handleSummarizePage}
                            disabled={isLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black hover:bg-primary hover:text-white disabled:opacity-50 transition-all duration-300 transform active:scale-95 cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                            <span>تلخيص هذه الصفحة ({getPageFriendlyName(pathname)})</span>
                          </button>
                        </div>
                        <div className="relative group">
                           <Input 
                             placeholder={`اسأل وقفة AI (${getModelFriendlyName(aiModel)})...`}
                             value={input}
                             onChange={(e) => setInput(e.target.value)}
                             onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                             disabled={isLoading}
                             className="h-16 pr-6 pl-20 bg-white/5 border-white/5 rounded-2xl focus:bg-white/10 focus:ring-8 focus:ring-primary/5 transition-all text-sm font-bold text-white placeholder:text-white/20"
                           />
                           <div className="absolute left-2 top-1/2 -translate-y-1/2 flex gap-1">
                             <Button 
                               onClick={() => handleSend()}
                               disabled={!input.trim() || isLoading}
                               className="w-12 h-12 rounded-xl bg-primary text-white shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all p-0"
                             >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                             </Button>
                           </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between px-2">
                           <div className="flex items-center gap-2">
                             <Info className="w-3 h-3 text-white/20" />
                             <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">
                               مدعوم بـ {getModelFriendlyName(aiModel)}
                             </span>
                           </div>
                           <button 
                             onClick={() => setShowSettings(true)}
                             className="text-[8px] font-black text-primary uppercase tracking-widest hover:underline bg-transparent border-none cursor-pointer"
                           >
                             تغيير الإعدادات
                          </button>
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
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "pointer-events-auto w-16 h-16 md:w-20 md:h-20 rounded-[2rem] shadow-2xl flex items-center justify-center transition-all duration-500 relative group",
          isOpen 
            ? "bg-white text-black rotate-90" 
            : "bg-primary text-white shadow-primary/40 hover:shadow-primary/60"
        )}
      >
        <div className="absolute inset-0 bg-white/20 rounded-[2rem] animate-ping opacity-20 pointer-events-none group-hover:opacity-40" />
        {isOpen ? <X className="w-8 h-8" /> : <MessageSquare className="w-8 h-8 md:w-10 md:h-10" />}
        {!isOpen && !aiApiKey && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full border-4 border-zinc-950 flex items-center justify-center">
            <AlertCircle className="w-2.5 h-2.5 text-black" />
          </div>
        )}
      </motion.button>
    </div>
  );
}
