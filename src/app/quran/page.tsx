
'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Copy, Share2, Check, Search, X,
  Layers, Heart, Star, Bookmark, LayoutGrid, Sparkles,
  Play, Pause, Volume2, Settings2, ArrowLeft, ArrowRight,
  Maximize2, Minimize2, Languages, History, Info,
  User, ChevronDown, Music, Quote, Download, Image as ImageIcon, ImagePlus,
  Palette, Edit3, Smartphone, Trophy, Target, CheckCircle2, Clock,
  Flame, BookmarkCheck, FileText, AlignRight, ChevronLeft, ChevronRight,
  Loader2, Mic
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useReadingMode } from '@/components/reading-provider';
import { ReadingModeToggle } from '@/components/reading-mode-toggle';
import { useSync } from '@/hooks/useSync';
import { QURAN_DATA, Verse as VerseType } from '@/lib/quran-data';

// ━━━━━━━━━━━ TYPES & CONSTANTS ━━━━━━━━━━━

type SurahInfo = {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
};

const RECITERS = [
  { id: 'ar.alafasy', name: 'مشاري العفاسي', icon: '🎙️' },
  { id: 'ar.husary', name: 'محمود خليل الحصري', icon: '📖' },
  { id: 'ar.minshawi', name: 'محمد صديق المنشاوي', icon: '✨' },
  { id: 'ar.abdulbasitmurattal', name: 'عبد الباسط عبد الصمد', icon: '🌙' },
];

const TAFSEERS = [
  { id: 'ar.jalalayn', name: 'تفسير الجلالين' },
  { id: 'ar.muyassar', name: 'التفسير الميسر' },
  { id: 'ar.ibnkathir', name: 'تفسير ابن كثير' },
  { id: 'ar.qurtubi', name: 'تفسير القرطبي' },
];

const SCRIPTS = [
  { id: 'uthmani', name: 'مصحف المدينة (رسم عثماني)', edition: 'quran-uthmani', font: 'font-quran' },
  { id: 'simple', name: 'رسم إملائي (بسيط)', edition: 'quran-simple', font: 'font-amiri' },
];

const TOPICS = [
  { id: 'all', label: 'الكل' },
  { id: 'iman', label: 'الإيمان' },
  { id: 'sabr', label: 'الصبر والتوكل' },
  { id: 'rahma', label: 'الرحمة والمغفرة' },
  { id: 'memorized', label: 'المحفوظات' },
  { id: 'bookmarks', label: 'الإشارات المرجعية' },
];

const MEMO_PLANS = [
  { id: '1year', label: 'ختمة في سنة', months: 12, pagesPerDay: 1.7 },
  { id: '2years', label: 'ختمة في سنتين', months: 24, pagesPerDay: 0.8 },
  { id: '6months', label: 'ختمة في 6 أشهر', months: 6, pagesPerDay: 3.3 },
  { id: 'custom', label: 'خطة مخصصة', months: 0, pagesPerDay: 0 },
];

const MEMORIZATION_STATUS = {
  'not-started': { label: 'لم تبدأ', color: 'text-white/20', icon: Clock, bg: 'bg-white/5' },
  'memorizing': { label: 'جاري الحفظ', color: 'text-amber-400', icon: Target, bg: 'bg-amber-500/10' },
  'completed': { label: 'تم الحفظ', color: 'text-emerald-400', icon: CheckCircle2, bg: 'bg-emerald-500/10' },
  'reviewed': { label: 'تمت المراجعة', color: 'text-blue-400', icon: Trophy, bg: 'bg-blue-500/10' },
};

const CARD_THEMES = [
  { id: 'emerald', bg: 'bg-gradient-to-br from-[#022c22] via-[#064e3b] to-black', text: 'text-emerald-100', accent: 'bg-emerald-400', textGradient: 'from-emerald-200 to-emerald-500' },
  { id: 'indigo', bg: 'bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-black', text: 'text-indigo-100', accent: 'bg-indigo-400', textGradient: 'from-indigo-200 to-blue-500' },
  { id: 'amber', bg: 'bg-gradient-to-br from-[#451a03] via-[#78350f] to-black', text: 'text-amber-100', accent: 'bg-amber-400', textGradient: 'from-yellow-200 to-amber-600' },
  { id: 'rose', bg: 'bg-gradient-to-br from-[#4c0519] via-[#881337] to-black', text: 'text-rose-100', accent: 'bg-rose-400', textGradient: 'from-rose-200 to-pink-600' },
  { id: 'purple', bg: 'bg-gradient-to-br from-[#3b0764] via-[#581c87] to-black', text: 'text-purple-100', accent: 'bg-purple-400', textGradient: 'from-purple-200 to-fuchsia-600' },
  { id: 'dark', bg: 'bg-[#050505]', text: 'text-white', accent: 'bg-white/20', textGradient: 'from-white to-gray-500' },
  { id: 'gold', bg: 'bg-gradient-to-br from-[#422006] via-[#713f12] to-[#0a0a0a]', text: 'text-yellow-100', accent: 'bg-yellow-500', textGradient: 'from-yellow-100 via-yellow-400 to-yellow-700' },
  { id: 'royal', bg: 'bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-[#1e3a8a] via-[#1e40af] to-black', text: 'text-blue-100', accent: 'bg-blue-400', textGradient: 'from-blue-200 to-cyan-500' },
  { id: 'sunset', bg: 'bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#7f1d1d] via-[#991b1b] to-black', text: 'text-red-100', accent: 'bg-red-400', textGradient: 'from-orange-200 to-red-500' },
];

const CARD_PATTERNS = [
  { id: 'none', label: 'بدون', css: '', url: '' },
  { id: 'arabesque', label: 'أرابيسك', css: 'opacity-100', url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nNDAnIGhlaWdodD0nNDAnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc+PGNpcmNsZSBjeD0nMjAnIGN5PTIwJyByPScxNScgZmlsbD0nbm9uZScgc3Ryb2tlPSdyZ2JhKDI1NSwyNTUsMjU1LDAuMTUpJyBzdHJva2Utd2lkdGg9JzEuNScvPjxjaXJjbGUgY3g9JzAnIGN5PScwJyByPScxNScgZmlsbD0nbm9uZScgc3Ryb2tlPSdyZ2JhKDI1NSwyNTUsMjU1LDAuMTUpJyBzdHJva2Utd2lkdGg9JzEuNScvPjxjaXJjbGUgY3g9JzQwJyBjeT0nMCcgcj0nMTUnIGZpbGw9J25vbmUnIHN0cm9rZT0ncmdiYSgyNTUsMjU1LDI1NSwwLjE1KScgc3Ryb2tlLXdpZHRoPScxLjUnLz48Y2lyY2xlIGN4PScwJyBjeT0nNDAnIHI9JzE1JyBmaWxsPSdub25lJyBzdHJva2U9J3JnYmEoMjU1LDI1NSwyNTUsMC4xNSknIHN0cm9rZS13aWR0aD0nMS41Jy8+PGNpcmNsZSBjeD0nNDAnIGN5PSc0MCcgcj0nMTUnIGZpbGw9J25vbmUnIHN0cm9rZT0ncmdiYSgyNTUsMjU1LDI1NSwwLjE1KScgc3Ryb2tlLXdpZHRoPScxLjUnLz48L3N2Zz4=" },
  { id: 'geometry', label: 'هندسي', css: 'opacity-100', url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nNDAnIGhlaWdodD0nNDAnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc+PHJlY3QgeD0nMTAnIHk9JzEwJyB3aWR0aD0nMjAnIGhlaWdodD0nMjAnIGZpbGw9J25vbmUnIHN0cm9rZT0ncmdiYSgyNTUsMjU1LDI1NSwwLjIpJyBzdHJva2Utd2lkdGg9JzEuNScvPjxyZWN0IHg9JzEwJyB5PScxMCcgd2lkdGg9JzIwJyBoZWlnaHQ9JzIwJyBmaWxsPSdub25lJyBzdHJva2U9J3JnYmEoMjU1LDI1NSwyNTUsMC4yKScgc3Ryb2tlLXdpZHRoPScxLjUnIHRyYW5zZm9ybT0ncm90YXRlKDQ1IDIwIDIwKScvPjwvc3ZnPg==" },
  { id: 'diamonds', label: 'معين', css: 'opacity-100', url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMjAnIGhlaWdodD0nMjAnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc+PHBhdGggZD0nTTEwIDBMMjAgMTBMMTAgMjBMMCAxMFonIGZpbGw9J25vbmUnIHN0cm9rZT0ncmdiYSgyNTUsMjU1LDI1NSwwLjE1KScgc3Ryb2tlLXdpZHRoPScxLjUnLz48L3N2Zz4=" },
  { id: 'hexagons', label: 'سداسي', css: 'opacity-100', url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMjgnIGhlaWdodD0nNDknIHZpZXdCb3g9JzAgMCAyOCA0OScgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJz48ZyBmaWxsPSdub25lJyBzdHJva2U9J3JnYmEoMjU1LDI1NSwyNTUsMC4xNSknIHN0cm9rZS13aWR0aD0nMS41Jz48cGF0aCBkPSdNMTMuOTkgOS4yNWwxMyA3LjV2MTVsLTEzIDcuNUwxIDMxLjc1di0xNWwxMi45OS03LjV6TTAgMTEuOGwxMi45OC03LjVWMS41aDE1djIuOGwxMi45OSA3LjVMMjcuOTkgMTkuM3YxMC40bDEyLjk5IDcuNXYxMC40bC0xMi45OSA3LjVWNThoLTE1di0yLjhsLTEyLjk4LTcuNUwwIDM3Ljd2LTEwLjRsLTEyLjk4LTcuNVY5LjRsMTIuOTgtNy41eicvPjwvZz48L3N2Zz4=" },
  { id: 'stars', label: 'نجوم', css: 'opacity-100', url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nNDAnIGhlaWdodD0nNDAnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc+PHBhdGggZD0nTTIwIDE1IEwyMSAxOSBMMjUgMjAgTDIxIDIxIEwyMCAyNSBMMTkgMjEgTDE1IDIwIEwxOSAxOSBaIE01IDUgTDUuNSA2LjUgTDcgNyBMNS41IDcuNSBMNSA5IEw0LjUgNy41IEwzIDcgTDQuNSA2LjUgWicgZmlsbD0ncmdiYSgyNTUsMjU1LDI1NSwwLjMpJy8+PC9zdmc+" },
];

const CARD_FRAMES = [
  { id: 'none', label: 'بدون', border: '' },
  { id: 'minimal', label: 'بسيط', border: 'border-2 border-white/40 m-4 rounded-[2rem]' },
  { id: 'elegant', label: 'أنيق', border: 'border-[1px] border-white/60 m-8 rounded-[1rem]' },
  { id: 'classic', label: 'كلاسيك', border: 'border-8 border-double border-white/40 m-6 rounded-[1.5rem]' },
  { id: 'mihrab', label: 'محراب', border: 'border-4 border-b-0 border-white/50 m-6 rounded-t-full' },
  { id: 'double', label: 'مضاعف', border: 'border-4 border-white/30 m-4 rounded-[2.5rem] before:content-[""] before:absolute before:inset-2 before:border-2 before:border-white/20 before:rounded-[2rem]' },
];


// ━━━━━━━━━━━ COMPONENTS ━━━━━━━━━━━

function ModalPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

function PlanProgress({ percentage }: { percentage: number }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-40 h-40 flex items-center justify-center mx-auto">
      <svg className="w-full h-full -rotate-90">
        <circle cx="80" cy="80" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
        <motion.circle
          cx="80" cy="80" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="text-primary"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-white">{percentage}%</span>
        <span className="text-[8px] text-white/30 font-black uppercase tracking-[0.2em]">الإنجاز</span>
      </div>
    </div>
  );
}

function SurahInfoModal({ surah, onClose }: { surah: SurahInfo; onClose: () => void }) {
  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-[3rem] overflow-hidden shadow-3xl">
          <div className="p-8 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-xl font-black text-white flex items-center gap-3"><Info className="w-5 h-5 text-primary" /> تفاصيل السورة</h3>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors"><X className="w-5 h-5 text-white/40" /></button>
          </div>
          <div className="p-10 space-y-10">
            <div className="text-center">
              <h2 className="text-6xl font-black text-white mb-2">{surah.name}</h2>
              <p className="text-primary font-bold tracking-[0.3em] uppercase text-xs">{surah.englishName}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5 text-center">
                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-2">مكان النزول</p>
                <p className="text-xl font-black text-white">{surah.revelationType === 'Meccan' ? 'مكية 🕋' : 'مدنية 🕌'}</p>
              </div>
              <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5 text-center">
                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-2">عدد الآيات</p>
                <p className="text-xl font-black text-white">{surah.numberOfAyahs} آية</p>
              </div>
              <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5 text-center">
                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-2">ترتيب النزول</p>
                <p className="text-xl font-black text-white">{surah.number}</p>
              </div>
              <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5 text-center">
                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-2">تاريخ القراءة</p>
                <p className="text-xl font-black text-emerald-400">نشط الآن</p>
              </div>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-primary/10 border border-primary/20 text-center">
              <p className="text-white/60 text-sm leading-relaxed">
                تعتبر {surah.name} من السور العظيمة في القرآن الكريم، وتتميز بمواضيعها الإيمانية العميقة وتشريعاتها الحكيمة.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </ModalPortal>
  );
}

function ShareModal({ verse, onClose }: { verse: any; onClose: () => void }) {
  const [activeTheme, setActiveTheme] = useState(CARD_THEMES[0]);
  const [isCustomTheme, setIsCustomTheme] = useState(false);
  const [customBg, setCustomBg] = useState('#134e4a'); // Default custom teal
  const [customText, setCustomText] = useState('#ccfbf1');
  const [userImage, setUserImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activePatterns, setActivePatterns] = useState([CARD_PATTERNS[1]]);
  const [activeFrames, setActiveFrames] = useState([CARD_FRAMES[0]]);
  const [aspectRatio, setAspectRatio] = useState<'square' | 'story'>('square');
  const [showTafseer, setShowTafseer] = useState(false);
  const [showLogo, setShowLogo] = useState(true);
  const [textGlow, setTextGlow] = useState(true);
  const [glassEffect, setGlassEffect] = useState(true);
  const [overlayOpacity, setOverlayOpacity] = useState(0.4);
  const [shadowDepth, setShadowDepth] = useState(40);
  const [signature, setSignature] = useState('');
  const [cardFont, setCardFont] = useState(verse.fontClass);
  const [customFontSize, setCustomFontSize] = useState(verse.arabic?.length > 150 ? 18 : 32);
  const [textAlign, setTextAlign] = useState<'center' | 'right' | 'justify'>('center');
  const [cardRadius, setCardRadius] = useState(40);
  const [filmGrain, setFilmGrain] = useState(false);
  const [gradientText, setGradientText] = useState(false);
  const [showMetadata, setShowMetadata] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const copyToClipboard = async () => {
    if (!cardRef.current) return;
    setIsCopying(true);
    try {
      const { toBlob } = await import('html-to-image');
      const blob = await toBlob(cardRef.current, { cacheBust: true, pixelRatio: 3 });
      if (blob) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        alert('تم نسخ الصورة بنجاح! يمكنك لصقها الآن في أي محادثة.');
      }
    } catch (err) { console.error(err); alert('تعذر النسخ، يرجى استخدام زر التحميل.'); } finally { setIsCopying(false); }
  };

  const exportImage = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 3 });
      const link = document.createElement('a');
      link.download = `waqfah-ayah-${verse.ayahNumber}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) { console.error(err); } finally { setIsExporting(false); }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserImage(reader.result as string);
        setIsCustomTheme(true);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[300] flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#0a0a0a]" />
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full h-full bg-[#0a0a0a] flex flex-col md:flex-row overflow-hidden"
        >
          {/* Preview Area - Left Side */}
          <div className="flex-1 bg-black/60 p-6 md:p-12 flex items-center justify-center overflow-hidden border-b md:border-b-0 md:border-l border-white/5 relative group min-h-0">
            <div className="absolute top-6 right-6 flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full text-[8px] font-black tracking-widest text-white/20 uppercase z-50">
              معاينة التصميم <Sparkles className="w-3 h-3" />
            </div>

            {/* Responsive Card Container */}
            <div className="w-full h-full flex items-center justify-center overflow-auto custom-scrollbar p-4">
              <div
                ref={cardRef}
                className={cn(
                  "flex flex-col justify-between relative overflow-hidden transition-all duration-700 shadow-2xl shrink-0 h-auto",
                  !isCustomTheme && activeTheme.bg,
                  aspectRatio === 'square' ? "w-full max-w-[500px] min-h-[500px]" : "w-[350px] md:w-[400px] min-h-[620px] md:min-h-[711px]"
                )}
                style={{
                  borderRadius: `${cardRadius}px`,
                  backgroundColor: isCustomTheme ? customBg : undefined,
                  backgroundImage: (isCustomTheme && userImage) ? `url(${userImage})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {/* Pattern, Grain & Overlay Layer */}
                {activePatterns.map(pattern => (
                  <div
                    key={pattern.id}
                    className={cn("absolute inset-0 pointer-events-none transition-all duration-700", pattern.css)}
                    style={{ backgroundImage: pattern.url ? `url('${pattern.url}')` : 'none' }}
                  />
                ))}
                {filmGrain && (
                  <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
                )}
                <div className="absolute inset-0 bg-black pointer-events-none" style={{ opacity: overlayOpacity }} />

                {/* Frame Layers */}
                {activeFrames.map(frame => (
                  frame.id !== 'none' && <div key={frame.id} className={cn("absolute inset-0 pointer-events-none z-20 transition-all duration-500", frame.border)} />
                ))}

                {/* Content Container */}
                <div className="relative z-30 flex-1 flex flex-col justify-center gap-4 p-6 md:p-10">
                  <div className={cn(
                    "p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] transition-all duration-700 w-full flex-1 flex flex-col justify-center",
                    glassEffect ? "bg-white/[0.03] backdrop-blur-md border border-white/10 shadow-2xl" : ""
                  )}
                    style={{ boxShadow: glassEffect ? `0 ${shadowDepth}px ${shadowDepth * 2}px -${shadowDepth / 2}px rgba(0,0,0,0.5)` : 'none' }}>
                    <Quote className={cn("w-8 h-8 md:w-10 md:h-10 mx-auto mb-4 md:mb-6 opacity-10 shrink-0", !isCustomTheme && activeTheme.text)} style={{ color: isCustomTheme ? customText : undefined }} />
                    <div className="space-y-4 md:space-y-6" style={{ textAlign }}>
                      <p
                        dir="rtl"
                        style={{
                          fontSize: `${customFontSize}px`,
                          textShadow: textGlow ? `0 0 30px ${isCustomTheme || activeTheme.id === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.6)'}` : 'none',
                          color: (isCustomTheme && !gradientText) ? customText : undefined
                        }}
                        className={cn(
                          "leading-[1.6] md:leading-[2.2] transition-all",
                          gradientText ? (isCustomTheme ? "bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-500" : `bg-clip-text text-transparent bg-gradient-to-br ${activeTheme.textGradient}`) : (!isCustomTheme && activeTheme.text),
                          cardFont
                        )}
                      >
                        {verse.arabic}
                      </p>
                      {showTafseer && (
                        <p className={cn("text-[10px] md:text-sm opacity-60 leading-relaxed max-w-[90%] mx-auto font-medium", !isCustomTheme && activeTheme.text)} style={{ color: isCustomTheme ? customText : undefined }}>
                          {verse.tafseer}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Info */}
                {showMetadata && (
                  <div className="relative z-30 flex flex-col items-center pt-4 md:pt-6 mt-auto p-6 md:p-8 shrink-0">
                    <div className={cn("h-px w-12 mb-4 opacity-30", !isCustomTheme && activeTheme.accent)} style={{ backgroundColor: isCustomTheme ? customText : undefined }} />
                    <div className="text-center">
                      <span className={cn("text-[10px] md:text-sm font-black uppercase tracking-[0.2em] block mb-1", !isCustomTheme && activeTheme.text)} style={{ color: isCustomTheme ? customText : undefined }}>
                        سورة {verse.surah}
                      </span>
                      <span className={cn("text-[8px] md:text-xs font-bold opacity-60 uppercase tracking-widest", !isCustomTheme && activeTheme.text)} style={{ color: isCustomTheme ? customText : undefined }}>
                        الآية رقم {verse.ayahNumber}
                      </span>
                    </div>

                    {signature && (
                      <p className={cn("mt-4 text-[8px] md:text-[9px] font-black italic opacity-40", activeTheme.text)}>بواسطة: {signature}</p>
                    )}

                    {showLogo && (
                      <div className="mt-6 md:mt-8 flex items-center gap-2">
                        <div className={cn("px-3 py-1 rounded-full border text-[7px] md:text-[8px] font-black tracking-[0.3em] uppercase", activeTheme.text, "border-white/10 bg-white/5")}>
                          WAQFAH.COM
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Controls Area - Right Side */}
          <div className="w-full md:w-[380px] lg:w-[420px] flex flex-col bg-[#080808] border-l border-white/5 h-full shrink-0">
            <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#080808]/90 backdrop-blur-md z-50">
              <div className="flex flex-col">
                <h3 className="text-lg md:text-xl font-black text-white flex items-center gap-3">التصميم السينمائي</h3>
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">تعديل بطاقة المشاركة</span>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors"><X className="w-5 h-5 text-white/40" /></button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 space-y-10">
              {/* Groups... */}
              <div className="space-y-8">
                <section className="space-y-4">
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">١. التخطيط والأبعاد</p>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'square', label: 'Feed (مربع)', icon: LayoutGrid },
                        { id: 'story', label: 'Story (رأسي)', icon: Maximize2 }
                      ].map(opt => (
                        <button key={opt.id} onClick={() => setAspectRatio(opt.id as any)} className={cn("flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all", aspectRatio === opt.id ? "bg-primary/10 border-primary text-primary" : "bg-white/5 border-transparent text-white/40 hover:bg-white/10")}>
                          <opt.icon className="w-4 h-4" />
                          <span className="text-[9px] font-black">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center"><span className="text-[9px] font-black text-white/40 uppercase">استدارة الحواف</span><span className="text-[10px] font-black text-primary">{cardRadius}px</span></div>
                      <input type="range" min="0" max="60" value={cardRadius} onChange={(e) => setCardRadius(parseInt(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary" />
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">٢. الهوية البصرية</p>
                  <div className="grid grid-cols-6 gap-2">
                    {CARD_THEMES.map(theme => (
                      <button key={theme.id} onClick={() => { setIsCustomTheme(false); setActiveTheme(theme); }} className={cn("w-full aspect-square rounded-xl border-2 transition-all", theme.bg, !isCustomTheme && activeTheme.id === theme.id ? "border-primary scale-105 shadow-glow-primary" : "border-transparent opacity-40 hover:opacity-100")} />
                    ))}
                    <button onClick={() => setIsCustomTheme(true)} className={cn("w-full aspect-square rounded-xl border-2 transition-all flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900", isCustomTheme && !userImage ? "border-primary scale-105 shadow-glow-primary" : "border-transparent opacity-40 hover:opacity-100")}>
                      <span className="text-[10px] font-black">ألواني</span>
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className={cn("w-full aspect-square rounded-xl border-2 transition-all flex flex-col items-center justify-center bg-white/5", isCustomTheme && userImage ? "border-primary scale-105 shadow-glow-primary" : "border-transparent opacity-40 hover:opacity-100")}>
                      <ImagePlus className="w-4 h-4 mb-1" />
                      <span className="text-[8px] font-black uppercase">خلفيتي</span>
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                  </div>

                  {isCustomTheme && (
                    <div className="grid grid-cols-2 gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl animate-in fade-in slide-in-from-top-2">
                      <div className="space-y-2 flex flex-col items-center">
                        <label className="text-[9px] font-black text-white/50 uppercase">لون الخلفية</label>
                        <input type="color" value={customBg} onChange={(e) => setCustomBg(e.target.value)} className="w-full h-10 rounded cursor-pointer bg-transparent border-0" />
                      </div>
                      <div className="space-y-2 flex flex-col items-center">
                        <label className="text-[9px] font-black text-white/50 uppercase">لون النص</label>
                        <input type="color" value={customText} onChange={(e) => setCustomText(e.target.value)} className="w-full h-10 rounded cursor-pointer bg-transparent border-0" />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setGradientText(!gradientText)} className={cn("flex items-center justify-between p-3 rounded-xl border transition-all", gradientText ? "bg-primary/10 border-primary/20 text-primary" : "bg-white/5 border-transparent text-white/40 hover:bg-white/10")}>
                      <span className="text-[9px] font-black">نص مُذَهَّب</span>
                      {gradientText ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-white/20" />}
                    </button>
                    <button onClick={() => setFilmGrain(!filmGrain)} className={cn("flex items-center justify-between p-3 rounded-xl border transition-all", filmGrain ? "bg-primary/10 border-primary/20 text-primary" : "bg-white/5 border-transparent text-white/40 hover:bg-white/10")}>
                      <span className="text-[9px] font-black">تشويش (Grain)</span>
                      {filmGrain ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-white/20" />}
                    </button>
                  </div>
                </section>

                <section className="space-y-4">
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">٣. الزخارف والإطارات</p>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      {CARD_PATTERNS.map(p => {
                        const isActive = activePatterns.some(ap => ap.id === p.id);
                        return (
                          <button
                            key={p.id}
                            onClick={() => {
                              if (p.id === 'none') {
                                setActivePatterns([p]);
                              } else {
                                if (isActive) {
                                  const next = activePatterns.filter(ap => ap.id !== p.id);
                                  setActivePatterns(next.length ? next : [CARD_PATTERNS[0]]);
                                } else {
                                  setActivePatterns([...activePatterns.filter(ap => ap.id !== 'none'), p]);
                                }
                              }
                            }}
                            className={cn("py-2 px-1 rounded-xl text-[10px] font-black transition-all text-center", isActive ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.3)]" : "bg-white/5 text-white/40 hover:bg-white/10")}
                          >
                            {p.label}
                          </button>
                        );
                      })}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {CARD_FRAMES.map(f => {
                        const isActive = activeFrames.some(af => af.id === f.id);
                        return (
                          <button
                            key={f.id}
                            onClick={() => {
                              if (f.id === 'none') {
                                setActiveFrames([f]);
                              } else {
                                if (isActive) {
                                  const next = activeFrames.filter(af => af.id !== f.id);
                                  setActiveFrames(next.length ? next : [CARD_FRAMES[0]]);
                                } else {
                                  setActiveFrames([...activeFrames.filter(af => af.id !== 'none'), f]);
                                }
                              }
                            }}
                            className={cn("py-2 px-1 rounded-xl text-[10px] font-black transition-all text-center border", isActive ? "border-primary text-primary bg-primary/10 shadow-[0_0_15px_rgba(var(--primary),0.1)]" : "border-white/5 text-white/40 hover:bg-white/10")}
                          >
                            {f.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </section>

                <section className="space-y-6">
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">٤. إعدادات النص المتقدمة</p>
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center"><span className="text-[9px] font-black text-white/40 uppercase">حجم الخط</span><span className="text-[10px] font-black text-primary">{customFontSize}px</span></div>
                      <input type="range" min="10" max="64" value={customFontSize} onChange={(e) => setCustomFontSize(parseInt(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary" />
                    </div>

                    <div className="space-y-2">
                      <p className="text-[9px] font-black text-white/40 uppercase">محاذاة النص</p>
                      <div className="flex gap-2 p-1 bg-white/5 rounded-lg border border-white/5">
                        {[
                          { id: 'right', label: 'يمين', icon: AlignRight },
                          { id: 'center', label: 'توسيط', icon: LayoutGrid },
                          { id: 'justify', label: 'ضبط', icon: FileText }
                        ].map(a => (
                          <button key={a.id} onClick={() => setTextAlign(a.id as any)} className={cn("flex-1 py-2 flex justify-center items-center rounded-md transition-all", textAlign === a.id ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white/80")}>
                            <a.icon className="w-3.5 h-3.5" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center"><span className="text-[9px] font-black text-white/40 uppercase">تعتيم الخلفية</span><span className="text-[10px] font-black text-primary">{Math.round(overlayOpacity * 100)}%</span></div>
                      <input type="range" min="0" max="0.9" step="0.1" value={overlayOpacity} onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center"><span className="text-[9px] font-black text-white/40 uppercase">عمق الظل</span><span className="text-[10px] font-black text-primary">{shadowDepth}px</span></div>
                      <input type="range" min="0" max="100" value={shadowDepth} onChange={(e) => setShadowDepth(parseInt(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary" />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => setTextGlow(!textGlow)} className={cn("flex flex-col items-center gap-2 p-3 rounded-xl transition-all", textGlow ? "bg-primary/10 text-primary" : "bg-white/5 text-white/40")}>
                        <Sparkles className="w-4 h-4" />
                        <span className="text-[8px] font-black uppercase">توهج النص</span>
                      </button>
                      <button onClick={() => setGlassEffect(!glassEffect)} className={cn("flex flex-col items-center gap-2 p-3 rounded-xl transition-all", glassEffect ? "bg-primary/10 text-primary" : "bg-white/5 text-white/40")}>
                        <Layers className="w-4 h-4" />
                        <span className="text-[8px] font-black uppercase">تأثير الزجاج</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">نوع الخط</p>
                      <div className="grid grid-cols-2 gap-2">
                        {['font-quran', 'font-amiri'].map(f => (
                          <button key={f} onClick={() => setCardFont(f)} className={cn("p-2 rounded-lg text-[9px] font-black transition-all border", cardFont === f ? "border-primary text-primary bg-primary/5" : "border-white/5 text-white/40")}>
                            {f === 'font-quran' ? 'عثماني' : 'كلاسيك'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">٥. التوقيع والمحتوى</p>
                  <div className="space-y-3">
                    <div className="relative">
                      <Edit3 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                      <input
                        type="text"
                        placeholder="أدخل اسمك للتوقيع..."
                        value={signature}
                        onChange={(e) => setSignature(e.target.value)}
                        className="w-full bg-white/5 border border-white/5 rounded-xl py-3.5 pl-10 pr-4 text-[10px] font-bold text-white placeholder:text-white/10 focus:outline-none focus:border-primary/40 transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'التفسير', state: showTafseer, setter: setShowTafseer },
                        { label: 'المعلومات', state: showMetadata, setter: setShowMetadata },
                        { label: 'الشعار', state: showLogo, setter: setShowLogo },
                      ].map((t, i) => (
                        <button key={i} onClick={() => t.setter(!t.state)} className={cn("flex items-center justify-between p-3 rounded-xl transition-all", t.state ? "bg-white/10 text-white" : "bg-white/5 text-white/20", i === 2 && "col-span-2")}>
                          <span className="text-[9px] font-black">{t.label}</span>
                          {t.state ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>
              </div>
            </div>

            <div className="p-6 md:p-8 border-t border-white/5 bg-black/80 sticky bottom-0 z-50 flex gap-2">
              <button disabled={isCopying} onClick={copyToClipboard} className="h-14 md:h-16 px-6 bg-white/10 text-white rounded-2xl md:rounded-[2rem] font-black flex items-center justify-center hover:bg-white/20 transition-all border border-white/10 shrink-0">
                {isCopying ? <Loader2 className="w-5 h-5 animate-spin" /> : <Copy className="w-5 h-5" />}
              </button>
              <button disabled={isExporting} onClick={exportImage} className="flex-1 h-14 md:h-16 bg-white text-black rounded-2xl md:rounded-[2rem] font-black flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-4xl">
                {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                {isExporting ? 'جاري التصدير...' : 'تصدير التصميم النهائي'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </ModalPortal>
  );
}



function ExamModal({ memorizedVerses, onClose, onComplete }: { memorizedVerses: any[]; onClose: () => void; onComplete: (points: number) => void }) {
  const [currentExamVerse, setCurrentExamVerse] = useState<any>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [examStep, setExamStep] = useState<'question' | 'result'>('question');

  useEffect(() => {
    if (memorizedVerses.length > 0) {
      const random = memorizedVerses[Math.floor(Math.random() * memorizedVerses.length)];
      setCurrentExamVerse(random);
    }
  }, [memorizedVerses]);

  if (!currentExamVerse) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/95 backdrop-blur-xl" />
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[3.5rem] overflow-hidden shadow-4xl p-10 md:p-16 text-center">
          <div className="mb-12">
            <div className="w-20 h-20 bg-primary/20 rounded-[2rem] flex items-center justify-center mx-auto mb-6"><Trophy className="w-10 h-10 text-primary" /></div>
            <h3 className="text-3xl font-black text-white">اختبار تثبيت الحفظ</h3>
            <p className="text-white/40 text-sm mt-2">هل تتذكر الآية التالية؟</p>
          </div>

          <div className="space-y-10">
            <div className="p-10 rounded-[2.5rem] bg-white/[0.03] border border-white/5 relative">
              <div className="absolute -top-4 right-10 px-4 py-1 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-black text-primary uppercase tracking-widest">الآية السابقة</div>
              <p className="text-2xl md:text-3xl font-quran leading-relaxed text-white/60">"{currentExamVerse.arabic.split(' ').slice(0, -3).join(' ')}..."</p>
            </div>

            <AnimatePresence>
              {showAnswer ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-10 rounded-[2.5rem] bg-emerald-500/10 border border-emerald-500/20 text-center">
                  <p className="text-3xl md:text-4xl font-quran leading-relaxed text-emerald-400 mb-6">{currentExamVerse.arabic}</p>
                  <div className="flex items-center justify-center gap-4">
                    <button onClick={() => { onComplete(10); onClose(); }} className="px-8 py-4 bg-emerald-500 text-white rounded-2xl font-black text-sm hover:scale-105 transition-all">أجبت بشكل صحيح ✅</button>
                    <button onClick={onClose} className="px-8 py-4 bg-white/5 text-white/40 rounded-2xl font-black text-sm hover:bg-white/10 transition-all">أحتاج للمراجعة 🔄</button>
                  </div>
                </motion.div>
              ) : (
                <button onClick={() => setShowAnswer(true)} className="w-full h-24 rounded-[2.5rem] border-2 border-dashed border-white/10 text-white/20 font-black hover:border-primary/40 hover:text-primary transition-all text-xl">اضغط هنا لكشف الآية والتأكد</button>
              )}
            </AnimatePresence>
          </div>

          <button onClick={onClose} className="mt-12 text-white/20 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">إلغاء الاختبار</button>
        </motion.div>
      </div>
    </ModalPortal>
  );
}

function WordAnalysisModal({ analysis, onClose }: { analysis: any; onClose: () => void }) {
  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
        <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} className="relative w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl p-8 text-center">
          <div className="absolute top-4 right-4"><button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors"><X className="w-4 h-4" /></button></div>

          <h3 className="text-xs font-black text-white/30 uppercase tracking-[0.2em] mb-8">التحليل اللغوي للكلمة</h3>

          {analysis.loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-4"><Loader2 className="w-8 h-8 text-primary animate-spin" /><p className="text-white/40 text-xs font-bold">جاري استخراج المعاني...</p></div>
          ) : analysis.error ? (
            <div className="py-12"><p className="text-red-400 text-sm font-bold">عذراً، تعذر جلب معلومات الكلمة. تأكد من اتصالك بالإنترنت.</p></div>
          ) : analysis.wordData ? (
            <div className="space-y-6">
              <div className="p-8 rounded-[2rem] bg-white/[0.03] border border-white/5">
                <p className="text-5xl font-quran text-primary leading-normal mb-4 drop-shadow-[0_0_15px_rgba(var(--primary),0.3)]">{analysis.wordData.text_uthmani}</p>
                {analysis.wordData.transliteration?.text && <p className="text-white/40 text-[10px] font-mono tracking-widest uppercase">{analysis.wordData.transliteration.text}</p>}
              </div>

              <div className="space-y-4 text-right">
                <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                  <p className="text-[10px] text-primary/60 font-black uppercase tracking-widest mb-2 flex items-center gap-2"><FileText className="w-3 h-3" /> المعنى (عربي)</p>
                  <p className="text-lg font-bold text-white/90 leading-relaxed">{analysis.wordData.translation?.text || 'المعنى غير متوفر لهذه الكلمة'}</p>
                </div>
              </div>
            </div>
          ) : null}
        </motion.div>
      </div>
    </ModalPortal>
  );
}

function VerseCard({ verse, accentColor, border, index, isReadingMode, fontSize, onPlay, onShare, onBookmark, onWordClick, isPlaying, isBookmarked, reciterName, id, fontClass, searchQuery }: any) {
  const [copied, setCopied] = useState(false);
  const verseRef = useRef<HTMLDivElement>(null);

  const normalizeArabic = (text: string) => {
    if (!text) return '';
    return text
      .replace(/[ًٌٍَُِّْ]/g, "")
      .replace(/[أإآ]/g, "ا")
      .replace(/ة/g, "ه")
      .replace(/ى/g, "ي")
      .trim();
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query || query.length < 2) return text;
    const normalizedText = normalizeArabic(text);
    const normalizedQuery = normalizeArabic(query);

    if (normalizedText.includes(normalizedQuery)) {
      // This is a simple highlighting. For perfect Quranic highlighting, we'd need word-by-word mapping.
      // But this will work well for visual feedback.
      return <span className="text-primary drop-shadow-glow-primary font-black">{text}</span>;
    }
    return text;
  };

  // Auto-scroll effect
  useEffect(() => {
    if (isPlaying && verseRef.current) {
      verseRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isPlaying]);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${verse.arabic}\n— ${verse.surah}: ${verse.ayahNumber}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <motion.div
      ref={verseRef}
      id={`verse-${id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "group relative rounded-[2.5rem] border overflow-hidden p-6 md:p-10 transition-all duration-500",
        isPlaying ? "bg-primary/20 border-primary/60 shadow-[0_0_50px_-10px_rgba(var(--primary),0.4)] scale-[1.02]" : "bg-white/[0.03] border-white/5 hover:border-white/20 hover:bg-white/[0.05]",
        border
      )}
    >
      {verse.sajdah && <div className="absolute top-0 left-0 bg-primary px-4 py-1 rounded-br-2xl text-[8px] font-black uppercase tracking-widest text-primary-foreground flex items-center gap-1.5 z-20 shadow-lg"><Star className="w-3 h-3 fill-current" /> سجدة تلاوة</div>}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <span className={cn("px-4 py-1.5 rounded-full text-[10px] font-black border bg-black/20", border, accentColor)}>{verse.surah}</span>
          <span className="px-4 py-1.5 rounded-full text-[10px] font-black border border-white/5 bg-black/20 text-white/40">{verse.ayahNumber}</span>
        </div>
        <div className="flex items-center gap-2">
          {isPlaying && <span className="text-[10px] font-bold text-primary animate-pulse ml-2 flex items-center gap-1"><Music className="w-3 h-3" /> جاري التلاوة...</span>}
          <button onClick={() => onPlay?.(verse)} className={cn("w-12 h-12 rounded-2xl transition-all duration-300 flex items-center justify-center", isPlaying ? "bg-primary text-primary-foreground shadow-glow-primary" : "bg-white/5 text-white/40 hover:bg-primary/20 hover:text-primary")}>{isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}</button>
        </div>
      </div>
      <p
        dir="rtl"
        className={cn("text-white/95 text-right transition-all duration-500 select-none", isReadingMode ? "text-4xl md:text-6xl" : "text-2xl md:text-3xl", fontClass)}
        style={{
          fontSize: isReadingMode && fontSize ? `${fontSize + 10}px` : undefined,
          lineHeight: '2.3',
          paddingTop: '0.25rem',
          paddingBottom: '0.25rem'
        }}
      >
        {verse.arabic.split(' ').map((word: string, i: number) => (
          <span
            key={i}
            onClick={() => onWordClick?.(verse, i)}
            className="hover:text-primary hover:bg-primary/10 rounded-lg px-1.5 py-0.5 cursor-pointer transition-colors inline-block"
            title="انقر لمعرفة التحليل اللغوي"
          >
            {searchQuery ? highlightMatch(word, searchQuery) : word}{' '}
          </span>
        ))}
      </p>
      <div className="mt-8 pt-8 border-t border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4 max-w-2xl text-right"><Info className="w-4 h-4 text-white/20 mt-1 shrink-0" /><p className="text-white/50 text-sm leading-relaxed">{verse.tafseer}</p></div>
        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
          <button onClick={() => onShare?.(verse)} className="p-3 rounded-xl bg-white/5 text-white/40 hover:text-primary hover:bg-primary/10 transition-all flex items-center gap-2 text-xs font-bold"><ImageIcon className="w-4 h-4" /> مشاركة</button>
          <button onClick={() => onBookmark?.(verse)} className={cn("p-3 rounded-xl transition-all", isBookmarked ? "bg-primary/20 text-primary" : "bg-white/5 text-white/40 hover:text-white")}><BookmarkCheck className={cn("w-4 h-4", isBookmarked && "fill-current")} /></button>
          <button onClick={handleCopy} className="p-3 rounded-xl bg-white/5 text-white/40 hover:text-white transition-colors">{copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}</button>
        </div>
      </div>
    </motion.div>
  );
}

// ━━━━━━━━━━━ MAIN PAGE ━━━━━━━━━━━

export default function QuranPage() {
  const { isReadingMode, fontSize } = useReadingMode();
  const { state, updateState } = useSync();
  const [view, setView] = useState<'collections' | 'full' | 'plan'>('collections');
  const [activeCollection, setActiveCollection] = useState(QURAN_DATA[0].id);
  const [activeTopic, setActiveTopic] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [surahs, setSurahs] = useState<SurahInfo[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [surahContent, setSurahContent] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedReciter, setSelectedReciter] = useState(RECITERS[0]);
  const [selectedTafseer, setSelectedTafseer] = useState(TAFSEERS[0]);
  const [selectedScript, setSelectedScript] = useState(SCRIPTS[0]);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isLoop, setIsLoop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSurahInfo, setActiveSurahInfo] = useState<SurahInfo | null>(null);
  const [dailyVerse, setDailyVerse] = useState<any>(null);
  const [sharingVerse, setSharingVerse] = useState<any>(null);
  const [isExamOpen, setIsExamOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'ayah' | 'page'>('ayah');
  const [currentPage, setCurrentPage] = useState(1);
  const [recentSurahs, setRecentSurahs] = useState<number[]>([]);
  const [activeWordAnalysis, setActiveWordAnalysis] = useState<{ verse: any, wordIndex: number, wordData?: any, loading?: boolean, error?: boolean } | null>(null);
  const [mushafError, setMushafError] = useState(false);
  const [globalResults, setGlobalResults] = useState<any[]>([]);
  const [tafseerResults, setTafseerResults] = useState<any[]>([]);
  const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [searchFilter, setSearchFilter] = useState<'all' | 'surahs' | 'verses' | 'tafseer'>('all');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Persistence Effect
  useEffect(() => {
    const savedReciter = localStorage.getItem('quran_reciter');
    const savedTafseer = localStorage.getItem('quran_tafseer');
    const savedScript = localStorage.getItem('quran_script');
    const savedSpeed = localStorage.getItem('quran_speed');
    const savedHistory = localStorage.getItem('quran_search_history');

    if (savedReciter) setSelectedReciter(JSON.parse(savedReciter));
    if (savedTafseer) setSelectedTafseer(JSON.parse(savedTafseer));
    if (savedScript) setSelectedScript(JSON.parse(savedScript));
    if (savedSpeed) setPlaybackSpeed(parseFloat(savedSpeed));
    if (savedHistory) setSearchHistory(JSON.parse(savedHistory));
  }, []);

  useEffect(() => {
    localStorage.setItem('quran_reciter', JSON.stringify(selectedReciter));
    localStorage.setItem('quran_tafseer', JSON.stringify(selectedTafseer));
    localStorage.setItem('quran_script', JSON.stringify(selectedScript));
    localStorage.setItem('quran_speed', playbackSpeed.toString());
  }, [selectedReciter, selectedTafseer, selectedScript, playbackSpeed]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = playbackSpeed;
  }, [playbackSpeed, currentAudio]);

  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      setScrollProgress(scrolled);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetch('https://api.alquran.cloud/v1/surah').then(res => res.json()).then(data => setSurahs(data.data));
    const recents = JSON.parse(localStorage.getItem('quran_recents') || '[]');
    setRecentSurahs(recents);
    const randomAyah = Math.floor(Math.random() * 6236) + 1;
    fetch(`https://api.alquran.cloud/v1/ayah/${randomAyah}/editions/${selectedScript.edition},ar.jalalayn`).then(res => res.json()).then(data => {
      const scriptData = data.data[0]; const jalalayn = data.data[1];
      setDailyVerse({ id: scriptData.number, arabic: scriptData.text, tafseer: jalalayn.text, surah: scriptData.surah.name, ayahNumber: scriptData.numberInSurah });
    });
  }, [selectedScript]);


  const loadSurah = useCallback(async (num: number) => {
    setIsLoading(true); setSelectedSurah(num);
    setRecentSurahs(prev => {
      const newRecents = [num, ...prev.filter(n => n !== num)].slice(0, 4);
      localStorage.setItem('quran_recents', JSON.stringify(newRecents));
      return newRecents;
    });
    try {
      const [scriptData, tafseer] = await Promise.all([
        fetch(`https://api.alquran.cloud/v1/surah/${num}/editions/${selectedScript.edition}`).then(res => res.json()),
        fetch(`https://api.alquran.cloud/v1/surah/${num}/${selectedTafseer.id}`).then(res => res.json())
      ]);
      const combined = scriptData.data[0].ayahs.map((ayah: any, i: number) => ({
        id: ayah.number,
        surah: scriptData.data[0].name,
        surahNumber: num,
        ayahNumber: ayah.numberInSurah,
        arabic: ayah.text,
        tafseer: tafseer.data.ayahs[i].text,
        sajdah: ayah.sajdah,
        page_number: ayah.page || 1,
        juz_number: ayah.juz || 1
      }));

      // Clean Bismillah from first verse if surah is not Fatiha (1) or Tawbah (9)
      if (num !== 1 && num !== 9 && combined.length > 0) {
        // Very aggressive regex to handle almost all Bismillah variations across different APIs/Scripts
        const bismillahPattern = /^بِسْمِ[\s\S]*?الرَّحِيْمِ\s*|^بِسْمِ[\s\S]*?الرَّحِيمِ\s*/;
        combined[0].arabic = combined[0].arabic.replace(bismillahPattern, "").trim();
      }

      setSurahContent(combined);
      // Immediately set current page to the first page of this surah
      if (combined.length > 0) {
        setCurrentPage(combined[0].page_number);
      }
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  }, [selectedTafseer, selectedScript]);

  // Effect to reload surah when tafseer or script changes
  useEffect(() => {
    if (selectedSurah) loadSurah(selectedSurah);
  }, [selectedTafseer, selectedScript, loadSurah, selectedSurah]);

  const normalizeArabic = (text: string) => {
    if (!text) return '';
    return text
      .replace(/[\u064B-\u065F\u06D6-\u06ED]/g, "") 
      .replace(/[أإآ]/g, "ا")
      .replace(/ة/g, "ه")
      .replace(/ى/g, "ي")
      .trim();
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query || !text) return text;
    const normalizedQuery = normalizeArabic(query.toLowerCase());
    const words = text.split(' ');
    
    return words.map((word, i) => {
      const normalizedWord = normalizeArabic(word.toLowerCase());
      if (normalizedWord.includes(normalizedQuery)) {
        return (
          <span key={i} className="text-primary drop-shadow-glow-primary font-black">
            {word}{' '}
          </span>
        );
      }
      return word + ' ';
    });
  };

  const filteredSurahs = useMemo(() => {
    const query = normalizeArabic(searchQuery.toLowerCase());
    if (!query) return surahs;

    return surahs.filter(s =>
      normalizeArabic(s.name).includes(query) ||
      s.englishName.toLowerCase().includes(query) ||
      s.number.toString() === query
    );
  }, [surahs, searchQuery]);

  const searchResults = useMemo(() => {
    const query = normalizeArabic(searchQuery.trim());
    if (!query || query.length < 2) return [];

    const results: any[] = [];

    // 1. Search in global results first (most accurate for broad search)
    globalResults.forEach(v => {
      results.push({
        ...v,
        type: 'verse',
        accentColor: 'text-primary',
        border: 'border-primary/20',
        isGlobal: true
      });
    });

    // 2. Search in selected collections
    if (results.length < 10) {
      QURAN_DATA.forEach(col => {
        col.verses.forEach(v => {
          if (normalizeArabic(v.arabic).includes(query) || normalizeArabic(v.tafseer).includes(query)) {
            if (!results.some(r => r.id === v.id)) {
              results.push({ ...v, type: 'verse', accentColor: col.color, border: col.border });
            }
          }
        });
      });
    }

    // 3. Search in currently loaded surah content
    if (surahContent.length > 0 && results.length < 15) {
      surahContent.forEach(v => {
        if (normalizeArabic(v.arabic).includes(query) || normalizeArabic(v.tafseer).includes(query)) {
          if (!results.some(r => r.id === v.id)) {
            results.push({ ...v, type: 'verse', accentColor: 'text-primary', border: 'border-primary/20' });
          }
        }
      });
    }

    return results.slice(0, 30);
  }, [searchQuery, surahContent, globalResults]);

  // Global Search Effect (Debounced)
  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 3) {
      setGlobalResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingGlobal(true);
      try {
        // Save to history if query is significant
        if (query.length > 3) {
          setSearchHistory(prev => {
            const next = [query, ...prev.filter(h => h !== query)].slice(0, 6);
            localStorage.setItem('quran_search_history', JSON.stringify(next));
            return next;
          });
        }

        // Fetch BOTH Quran and Tafseer results for separate tabs
        const [quranRes, tafseerRes] = await Promise.all([
          fetch(`https://api.alquran.cloud/v1/search/${query}/all/quran-simple`),
          fetch(`https://api.alquran.cloud/v1/search/${query}/all/ar.muyassar`)
        ]);

        const [quranData, tafseerData] = await Promise.all([quranRes.json(), tafseerRes.json()]);
        
        if (quranData.data && quranData.data.matches) {
          setGlobalResults(quranData.data.matches.map((m: any) => ({
            id: m.number,
            surah: m.surah.name,
            surahNumber: m.surah.number,
            ayahNumber: m.numberInSurah,
            arabic: m.text,
            type: 'verse',
            page_number: m.page
          })));
        }

        if (tafseerData.data && tafseerData.data.matches) {
          setTafseerResults(tafseerData.data.matches.map((m: any) => ({
            id: m.number,
            surah: m.surah.name,
            surahNumber: m.surah.number,
            ayahNumber: m.numberInSurah,
            arabic: m.text,
            type: 'tafseer',
            page_number: m.page
          })));
        }
      } catch (e) {
        console.error("Global search failed", e);
      } finally {
        setIsSearchingGlobal(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchResultClick = (v: any) => {
    setView('full');
    setViewMode('ayah');
    setSelectedSurah(v.surahNumber);
    loadSurah(v.surahNumber);
    setSearchQuery('');
    
    let attempts = 0;
    const scrollInterval = setInterval(() => {
      const el = document.getElementById(`verse-${v.id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-4', 'ring-primary/40', 'ring-offset-8');
        setTimeout(() => el.classList.remove('ring-4', 'ring-primary/40', 'ring-offset-8'), 3000);
        clearInterval(scrollInterval);
      }
      if (attempts++ > 15) clearInterval(scrollInterval);
    }, 400);
  };

  const toggleBookmark = (verse: any) => {
    const currentBookmarks = state.favorites || [];
    const id = `quran_${verse.id}`;
    if (currentBookmarks.includes(id)) { updateState({ favorites: currentBookmarks.filter(b => b !== id) }); }
    else { updateState({ favorites: [...currentBookmarks, id] }); }
  };

  const updateMemorization = (surahNum: number, status: keyof typeof MEMORIZATION_STATUS) => {
    const currentProg = state.quranMemorization || {};
    updateState({ quranMemorization: { ...currentProg, [surahNum]: status } });
  };

  const memorizedVerses = useMemo(() => {
    const list: any[] = [];
    QURAN_DATA.forEach(col => {
      col.verses.forEach(v => {
        if (state.quranMemorization?.[v.surahNumber] === 'completed') {
          list.push(v);
        }
      });
    });
    return list;
  }, [state.quranMemorization]);

  const pages = useMemo(() => {
    if (!selectedSurah || surahContent.length === 0) return {};
    const grouped: { [key: number]: any[] } = {};
    surahContent.forEach((v: any) => {
      const p = v.page_number || 1;
      if (!grouped[p]) grouped[p] = [];
      grouped[p].push(v);
    });
    return grouped;
  }, [selectedSurah, surahContent]);

  const pageNumbers = useMemo(() => Object.keys(pages).map(Number).sort((a, b) => a - b), [pages]);

  const memorizationStats = useMemo(() => {
    const prog = state.quranMemorization || {};
    const completed = Object.values(prog).filter(s => s === 'completed' || s === 'reviewed').length;
    return { completed, percentage: Math.round((completed / 114) * 100) };
  }, [state.quranMemorization]);

  const handlePlayVerse = useCallback((verse: any) => {
    if (currentAudio?.id === verse.id) {
      if (isPlaying) { audioRef.current?.pause(); setIsPlaying(false); }
      else { audioRef.current?.play(); setIsPlaying(true); }
      return;
    }

    setCurrentAudio(verse);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.src = `https://cdn.islamic.network/quran/audio/128/${selectedReciter.id}/${verse.id}.mp3`;
      audioRef.current.playbackRate = playbackSpeed;
      audioRef.current.play();
    }
  }, [selectedReciter, isPlaying, currentAudio, playbackSpeed]);

  const handleAudioEnded = useCallback(() => {
    if (isLoop) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
      return;
    }

    if (!isAutoPlay) {
      setIsPlaying(false);
      return;
    }

    // Find next verse in current mode
    let nextVerse = null;
    if (viewMode === 'ayah') {
      const idx = surahContent.findIndex(v => v.id === currentAudio?.id);
      if (idx !== -1 && idx < surahContent.length - 1) nextVerse = surahContent[idx + 1];
    } else {
      const currentPageVerses = pages[currentPage] || [];
      const idx = currentPageVerses.findIndex(v => v.id === currentAudio?.id);
      if (idx !== -1 && idx < currentPageVerses.length - 1) nextVerse = currentPageVerses[idx + 1];
    }

    if (nextVerse) {
      handlePlayVerse(nextVerse);
    } else {
      setIsPlaying(false);
    }
  }, [isLoop, isAutoPlay, viewMode, surahContent, pages, currentPage, currentAudio, handlePlayVerse]);



  const activatePlan = (planId: string) => {
    updateState({
      activeMemoPlan: {
        planId,
        startDate: new Date().toISOString(),
        dailyReminderTime: '08:00'
      }
    });
    // Request notification permission
    if (typeof window !== "undefined" && "Notification" in window) {
      Notification.requestPermission();
    }
  };

  const handleExamComplete = (points: number) => {
    updateState({ points: (state.points || 0) + points });
  };

  const getDailyWord = useCallback(() => {
    if (!state.activeMemoPlan) return null;
    const plan = MEMO_PLANS.find(p => p.id === state.activeMemoPlan?.planId);
    if (!plan || plan.id === 'custom') return { page: 1, surah: 'البقرة' };

    const start = new Date(state.activeMemoPlan.startDate);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - start.getTime()) / (1000 * 3600 * 24));

    const targetPage = Math.min(604, Math.floor(diffDays * plan.pagesPerDay) + 1);

    // Simple lookup for surah based on page (could be more precise with a full map)
    let surah = 'البقرة';
    if (targetPage > 582) surah = 'النبأ';
    else if (targetPage > 562) surah = 'الملك';
    else if (targetPage > 526) surah = 'الواقعة';
    else if (targetPage > 499) surah = 'الأحقاف';
    else if (targetPage > 440) surah = 'يس';
    else if (targetPage > 282) surah = 'الإسراء';
    else if (targetPage > 177) surah = 'الأعراف';

    return { page: targetPage, surah };
  }, [state.activeMemoPlan]);

  const dailyWord = useMemo(() => getDailyWord(), [getDailyWord]);

  useEffect(() => {
    if (pageNumbers.length > 0 && !pageNumbers.includes(currentPage)) {
      setCurrentPage(pageNumbers[0]);
    }
  }, [pageNumbers, currentPage]);

  const handleShare = useCallback((verse: any) => {
    setSharingVerse({ ...verse, fontClass: selectedScript.font });
  }, [selectedScript]);

  const streak = useMemo(() => {
    // Simple streak logic (could be more complex with actual dates)
    return memorizationStats.completed > 0 ? (memorizationStats.completed % 7) + 1 : 0;
  }, [memorizationStats]);

  const handleWordClick = async (verse: any, wordIndex: number) => {
    // verse.surahNumber must be available. If not, we might need a lookup, but it should be available.
    const sNum = verse.surahNumber || QURAN_DATA.find(c => c.verses.some(v => v.id === verse.id))?.verses.find(v => v.id === verse.id)?.surahNumber || 2;

    setActiveWordAnalysis({ verse, wordIndex, loading: true });
    try {
      // language=ar gives Arabic translation, text_uthmani for clean display
      const res = await fetch(`https://api.quran.com/api/v4/verses/by_key/${sNum}:${verse.ayahNumber}?language=ar&words=true&word_fields=text_uthmani,translation,transliteration`);
      const data = await res.json();
      const apiWords = data.verse.words;
      // Map frontend clicked word to API word array. API array often includes the end symbol as a word.
      const wordData = apiWords[wordIndex] || apiWords[apiWords.length - 2];

      setActiveWordAnalysis({ verse, wordIndex, wordData, loading: false });
    } catch (e) {
      setActiveWordAnalysis({ verse, wordIndex, error: true, loading: false });
    }
  };

  return (
    <div className="min-h-screen pb-40">
      <div className="fixed top-0 left-0 w-full h-1 z-[250] pointer-events-none">
        <motion.div className="h-full bg-primary shadow-glow-primary" style={{ width: `${scrollProgress}%` }} />
      </div>

      <audio ref={audioRef} onEnded={handleAudioEnded} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} />
      <AnimatePresence>
        {sharingVerse && <ShareModal verse={sharingVerse} onClose={() => setSharingVerse(null)} />}
        {isExamOpen && <ExamModal memorizedVerses={memorizedVerses} onClose={() => setIsExamOpen(false)} onComplete={handleExamComplete} />}
        {activeSurahInfo && <SurahInfoModal surah={activeSurahInfo} onClose={() => setActiveSurahInfo(null)} />}
        {activeWordAnalysis && <WordAnalysisModal analysis={activeWordAnalysis} onClose={() => setActiveWordAnalysis(null)} />}
      </AnimatePresence>

      <div className="container relative z-10 px-4 pt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-16">
          <div className="flex items-center gap-4 order-2 md:order-1">
            {/* Tafseer Selector */}
            <div className={cn("relative group transition-all", isReadingMode && "opacity-0 scale-95 pointer-events-none")}>
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-2 pr-4 hover:bg-white/10 cursor-pointer">
                <div className="text-right"><p className="text-[8px] font-black text-white/30 uppercase tracking-widest">التفسير الحالي</p><p className="text-xs font-bold text-white">{selectedTafseer.name}</p></div>
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary"><FileText className="w-5 h-5" /></div>
                <ChevronDown className="w-4 h-4 text-white/20 mr-2" />
              </div>
              <div className="absolute top-[90%] right-0 pt-3 w-56 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all z-[80]">
                <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-2 shadow-3xl backdrop-blur-3xl">
                  {TAFSEERS.map(t => (<button key={t.id} onClick={() => setSelectedTafseer(t)} className={cn("w-full text-right p-4 rounded-xl text-xs font-bold transition-all", selectedTafseer.id === t.id ? "bg-primary text-primary-foreground" : "text-white/40 hover:bg-white/5 hover:text-white")}>{t.name}</button>))}
                </div>
              </div>
            </div>

            {/* Script Selector */}
            <div className={cn("relative group transition-all", isReadingMode && "opacity-0 scale-95 pointer-events-none")}>
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-2 pr-4 hover:bg-white/10 cursor-pointer">
                <div className="text-right"><p className="text-[8px] font-black text-white/30 uppercase tracking-widest">نوع الرسم</p><p className="text-xs font-bold text-white">{selectedScript.name}</p></div>
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary"><AlignRight className="w-5 h-5" /></div>
                <ChevronDown className="w-4 h-4 text-white/20 mr-2" />
              </div>
              <div className="absolute top-[90%] right-0 pt-3 w-64 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all z-[75]">
                <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-2 shadow-3xl backdrop-blur-3xl">
                  {SCRIPTS.map(s => (<button key={s.id} onClick={() => setSelectedScript(s)} className={cn("w-full text-right p-4 rounded-xl text-xs font-bold transition-all flex items-center justify-between", selectedScript.id === s.id ? "bg-primary text-primary-foreground" : "text-white/40 hover:bg-white/5 hover:text-white")}><span>{s.name}</span>{selectedScript.id === s.id && <Check className="w-3 h-3" />}</button>))}
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 md:order-2"><ReadingModeToggle /></div>

          <div className="flex items-center gap-4 order-3">
            <div className={cn("flex bg-white/5 border border-white/10 rounded-2xl p-1", isReadingMode && "opacity-0 scale-95 pointer-events-none")}>
              <button onClick={() => setViewMode('ayah')} className={cn("px-4 py-2 rounded-xl text-[10px] font-black transition-all", viewMode === 'ayah' ? "bg-primary text-primary-foreground shadow-glow-primary" : "text-white/30 hover:text-white")}>آيات</button>
              <button onClick={() => setViewMode('page')} className={cn("px-4 py-2 rounded-xl text-[10px] font-black transition-all", viewMode === 'page' ? "bg-primary text-primary-foreground shadow-glow-primary" : "text-white/30 hover:text-white")}>صفحة</button>
            </div>
            {/* Reciter Selector */}
            <div className={cn("relative group transition-all", isReadingMode && "opacity-0 scale-95 pointer-events-none")}>
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-2 pr-4 hover:bg-white/10 cursor-pointer">
                <div className="text-right"><p className="text-[8px] font-black text-white/30 uppercase tracking-widest">القارئ الحالي</p><p className="text-xs font-bold text-white">{selectedReciter.name}</p></div>
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-xl">{selectedReciter.icon}</div>
                <ChevronDown className="w-4 h-4 text-white/20 mr-2" />
              </div>
              <div className="absolute top-[90%] left-0 pt-3 w-64 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all z-[70]">
                <div className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-3 shadow-3xl backdrop-blur-3xl">
                  <div className="grid gap-1">{RECITERS.map(r => (<button key={r.id} onClick={() => setSelectedReciter(r)} className={cn("flex items-center justify-between p-4 rounded-2xl transition-all", selectedReciter.id === r.id ? "bg-primary/20 text-primary" : "hover:bg-white/5 text-white/40 hover:text-white")}><span className="font-bold text-sm">{r.name}</span><span className="text-lg">{r.icon}</span></button>))}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Recent Surahs ── */}
        {!isReadingMode && !selectedSurah && recentSurahs.length > 0 && (
          <div className="w-full mb-10 overflow-hidden">
            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-4 flex items-center gap-2 px-4"><History className="w-3.5 h-3.5" /> استكمل قراءتك</p>
            <div className="flex gap-3 overflow-x-auto no-scrollbar px-4">
              {recentSurahs.map(num => {
                const surah = surahs.find(s => s.number === num);
                if (!surah) return null;
                return (<button key={num} onClick={() => loadSurah(num)} className="flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-4 rounded-2xl hover:bg-white/10 hover:border-primary/20 transition-all whitespace-nowrap"><span className="w-8 h-8 rounded-lg bg-primary/20 text-primary text-[10px] font-black flex items-center justify-center">{num}</span><span className="font-bold text-sm">{surah.name}</span></button>);
              })}
            </div>
          </div>
        )}

        {/* ── Dashboard Bento Grid ── */}
        {!isReadingMode && !selectedSurah && view === 'full' && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="w-full mb-16 grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Memorization Progress (Large, spans 2 columns) */}
            <div className="md:col-span-2 bg-[#0a0a0a] border border-white/10 rounded-[3rem] p-8 md:p-12 relative overflow-hidden group hover:border-white/20 transition-all cursor-default shadow-3xl">
              <div className="absolute top-0 left-0 h-1.5 bg-gradient-to-r from-primary to-emerald-400 w-full opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/10 blur-[100px] rounded-full group-hover:bg-primary/20 transition-all duration-700 pointer-events-none" />

              <div className="relative z-10 flex flex-col justify-between h-full gap-10">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-primary/30 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform shadow-glow-primary border border-primary/20"><Trophy className="w-8 h-8 text-primary" /></div>
                    <div>
                      <h3 className="text-2xl font-black text-white mb-2">إنجاز الحفظ</h3>
                      <p className="text-white/40 text-sm font-bold flex items-center gap-2">
                        المصحف كاملاً
                        <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                        114 سورة
                      </p>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl border border-white/5 bg-white/5 flex items-center justify-center text-white/30 group-hover:text-primary group-hover:bg-primary/10 transition-all cursor-help relative" title="النسبة المئوية لما أتممت حفظه من إجمالي سور القرآن الكريم.">
                    <Info className="w-5 h-5" />
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="flex items-end justify-between">
                    <span className="text-6xl font-black text-primary drop-shadow-[0_0_15px_rgba(var(--primary),0.3)]">{memorizationStats.percentage}%</span>
                    <span className="text-sm font-black text-white/40 uppercase tracking-widest mb-2 bg-white/5 px-4 py-2 rounded-full border border-white/5">تم حفظ {memorizationStats.completed} سورة</span>
                  </div>
                  <div className="h-5 bg-black rounded-full overflow-hidden border border-white/10 relative p-1 shadow-inner">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${memorizationStats.percentage}%` }} className="h-full bg-gradient-to-r from-primary to-emerald-400 shadow-glow-primary rounded-full relative overflow-hidden">
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-overlay" />
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Streak Card (Square) */}
            <div className="bg-gradient-to-br from-[#1c0a00] to-[#0a0400] border border-orange-500/20 rounded-[3rem] p-8 relative overflow-hidden group hover:border-orange-500/40 hover:shadow-[0_0_50px_-15px_rgba(249,115,22,0.3)] transition-all cursor-default flex flex-col justify-center items-center text-center shadow-3xl">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10 mix-blend-overlay pointer-events-none" />

              <div className="w-24 h-24 rounded-full bg-gradient-to-t from-orange-500/10 to-orange-500/30 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500 shadow-[0_0_30px_rgba(249,115,22,0.3)] border border-orange-500/20 relative">
                <Flame className="w-12 h-12 text-orange-500 drop-shadow-[0_0_20px_rgba(249,115,22,1)] z-10" />
                <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl animate-pulse" />
              </div>

              <h4 className="text-5xl font-black text-white mb-2 drop-shadow-md">{streak}</h4>
              <p className="text-orange-500/80 text-[10px] font-black uppercase tracking-[0.3em]">أيام متتالية</p>

              {/* Tooltip / Motivation */}
              <div className="absolute bottom-6 px-5 py-2.5 bg-orange-500/10 backdrop-blur-md rounded-full border border-orange-500/20 text-[10px] font-black text-orange-200 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 shadow-xl">
                حافظ على وردك اليومي 🔥
              </div>
            </div>

            {/* Quick Access / Plan Cards */}
            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] p-6 flex items-center justify-between group hover:bg-white/[0.03] hover:border-white/10 transition-all cursor-pointer shadow-xl" onClick={() => setView('plan')}>
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-[1rem] bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors shadow-inner"><Target className="w-6 h-6 text-blue-400" /></div>
                  <div>
                    <h4 className="text-white font-black text-sm mb-1">الخطة الحالية</h4>
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">ختمة في سنة</p>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center group-hover:bg-white/5 transition-colors">
                  <ChevronLeft className="w-5 h-5 text-white/20 group-hover:text-blue-400 transition-colors" />
                </div>
              </div>

              <div className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] p-6 flex items-center justify-between group hover:bg-white/[0.03] hover:border-white/10 transition-all cursor-pointer shadow-xl" onClick={() => setView('collections')}>
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-[1rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors shadow-inner"><BookmarkCheck className="w-6 h-6 text-emerald-400" /></div>
                  <div>
                    <h4 className="text-white font-black text-sm mb-1">الآيات المحفوظة</h4>
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">راجع وردك اليومي</p>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center group-hover:bg-white/5 transition-colors">
                  <ChevronLeft className="w-5 h-5 text-white/20 group-hover:text-emerald-400 transition-colors" />
                </div>
              </div>
            </div>

          </motion.div>
        )}

        {/* ── Daily Verse ── */}
        {!isReadingMode && !selectedSurah && view === 'collections' && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full mb-20 group">
            <div className="relative rounded-[3.5rem] p-1.5 bg-gradient-to-br from-primary/30 via-primary/5 to-transparent border border-primary/10">
              <div className="bg-[#050505]/80 backdrop-blur-3xl rounded-[3.4rem] p-10 md:p-14 overflow-hidden relative">
                <Quote className="absolute -top-10 -left-10 w-40 h-40 text-primary/5 -rotate-12" />
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="px-5 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-10">آيـة الـيـوم الملهمة</div>
                  {dailyVerse ? (
                    <>
                      <p
                        className={cn("text-3xl md:text-5xl text-white/90 mb-10 text-center", selectedScript.font)}
                        style={{ lineHeight: '2.5', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
                      >
                        {dailyVerse.arabic}
                      </p>
                      <div className="flex flex-col items-center gap-4">
                        <p className="text-white/40 text-sm leading-relaxed max-w-2xl italic">"{dailyVerse.tafseer}"</p>
                        <div className="h-px w-20 bg-primary/20 my-2" />
                        <span className="text-primary font-black text-xs uppercase tracking-widest font-tajawal">
                          سورة {dailyVerse.surah} • آية {dailyVerse.ayahNumber}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-10">
                        <button onClick={() => handleShare(dailyVerse)} className="w-14 h-14 rounded-2xl bg-white/5 text-white/40 flex items-center justify-center hover:text-primary transition-all"><ImageIcon className="w-6 h-6" /></button>
                        <button onClick={() => handlePlayVerse(dailyVerse)} className="w-20 h-20 rounded-[2.5rem] bg-primary text-primary-foreground flex items-center justify-center hover:scale-105 transition-transform shadow-glow-primary">{currentAudio?.id === dailyVerse.id && isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 fill-current" />}</button>
                        <button className="w-14 h-14 rounded-2xl bg-white/5 text-white/40 flex items-center justify-center hover:text-white transition-all"><Share2 className="w-6 h-6" /></button>
                      </div>
                    </>
                  ) : <Loader2 className="w-10 h-10 text-primary animate-spin" />}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Tabs & Search ── */}
        <div className={cn("w-full mb-16 space-y-8", isReadingMode && "opacity-0 h-0 overflow-hidden mb-0 transition-all")}>
          <div className="flex flex-wrap gap-4 justify-center">
            {['collections', 'full', 'plan'].map((v: any) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "px-8 md:px-12 py-5 rounded-[2rem] font-black text-sm transition-all duration-500 border relative overflow-hidden group",
                  view === v ? "bg-white text-black border-white shadow-glow-white" : "bg-white/5 text-white/30 border-white/5 hover:bg-white/10"
                )}
              >
                {v === 'collections' ? 'آيات مختارة' : v === 'full' ? 'المصحف كاملاً' : 'خطة الحفظ'}
                {view === v && <motion.div layoutId="tab-glow" className="absolute inset-0 bg-primary/20 blur-xl" />}
              </button>
            ))}
          </div>
          <div className="relative group">
            <Search className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder={view === 'full' ? "ابحث عن سورة، جزء، أو رقم..." : "ابحث في الآيات المختارة..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-20 bg-white/5 border border-white/10 rounded-[2.5rem] ps-16 pe-16 text-xl text-white outline-none focus:border-primary/30 focus:bg-white/[0.08] transition-all shadow-inner"
            />
            <button
              onClick={() => {
                const recognition = new (window as any).webkitSpeechRecognition();
                recognition.lang = 'ar-SA';
                recognition.onstart = () => setIsListening(true);
                recognition.onend = () => setIsListening(false);
                recognition.onresult = (e: any) => setSearchQuery(e.results[0][0].transcript);
                recognition.start();
              }}
              className={cn(
                "absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-glow-primary overflow-hidden",
                isListening ? "bg-red-500 text-white animate-pulse scale-110" : "bg-primary/10 text-primary border border-primary/20 hover:scale-110"
              )}
            >
              {isListening ? (
                <div className="flex gap-0.5">
                  {[1, 2, 3].map(i => <motion.div key={i} animate={{ height: [8, 16, 8] }} transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }} className="w-1 bg-white rounded-full" />)}
                </div>
              ) : <Mic className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex flex-col items-center gap-6">
            {searchHistory.length > 0 && searchQuery.length === 0 && (
              <div className="flex flex-wrap gap-2 justify-center px-4 animate-in fade-in slide-in-from-top-2">
                <span className="text-[10px] font-black text-white/10 uppercase tracking-[0.2em] w-full text-center mb-1">عمليات البحث الأخيرة</span>
                {searchHistory.map(h => (
                  <button key={h} onClick={() => setSearchQuery(h)} className="px-5 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-[10px] font-bold text-white/40 hover:text-primary hover:bg-primary/10 transition-all flex items-center gap-2">
                    <Clock className="w-3 h-3 opacity-30" /> {h}
                  </button>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2 justify-center px-4">
              {['الجنة', 'الصبر', 'الرحمة', 'القلب', 'الاستغفار', 'التوكل'].map(keyword => (
                <button
                  key={keyword}
                  onClick={() => setSearchQuery(keyword)}
                  className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black text-white/30 hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all"
                >
                  # {keyword}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Search Results Overlay ── */}
        <AnimatePresence>
          {searchQuery.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="w-full mb-16 space-y-6"
            >
              <div className="flex items-center justify-between px-6">
                <h3 className="text-sm font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-primary" /> نتائج البحث الذكي ({searchResults.length})
                </h3>
                <div className="flex bg-white/5 rounded-xl p-1 border border-white/5">
                  {[
                    { id: 'all', label: 'الكل' },
                    { id: 'surahs', label: 'سور' },
                    { id: 'verses', label: 'آيات' },
                    { id: 'tafseer', label: 'تفسير' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setSearchFilter(tab.id as any)}
                      className={cn(
                        "px-4 py-1.5 rounded-lg text-[10px] font-black transition-all",
                        searchFilter === tab.id ? "bg-primary text-primary-foreground shadow-glow-primary" : "text-white/20 hover:text-white"
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-6">
                {isSearchingGlobal && (
                  <div className="flex items-center justify-center py-10 gap-3 text-primary animate-pulse">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-widest">جاري البحث في كامل المصحف...</span>
                  </div>
                )}

                {/* Surah Matches (if in 'all' or 'surahs' filter) */}
                {(searchFilter === 'all' || searchFilter === 'surahs') && filteredSurahs.length > 0 && searchQuery.length > 1 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    {filteredSurahs.slice(0, 6).map((s: any) => (
                      <motion.button
                        key={`search-surah-${s.number}`}
                        whileHover={{ y: -3, scale: 1.02 }}
                        onClick={() => { setSelectedSurah(s.number); loadSurah(s.number); setView('full'); setViewMode('ayah'); setSearchQuery(''); }}
                        className="flex items-center gap-4 p-5 rounded-[2rem] bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-all text-right group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary text-[10px] font-black flex items-center justify-center group-hover:scale-110 transition-transform">{s.number}</div>
                        <div>
                          <h4 className="text-white font-black text-sm">{highlightMatch(s.name, searchQuery)}</h4>
                          <p className="text-[8px] text-white/30 font-bold uppercase tracking-widest">{s.numberOfAyahs} آية</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}

                {/* Verse Matches (if in 'all' or 'verses' filter) */}
                {(searchFilter === 'all' || searchFilter === 'verses') && searchResults.map((v, i) => (
                  <div key={`search-container-${v.id}`} onClick={() => handleSearchResultClick(v)} className="cursor-pointer">
                    <VerseCard
                      id={v.id}
                      verse={v}
                      accentColor={v.accentColor}
                      border={v.border}
                      index={i}
                      searchQuery={searchQuery}
                      onPlay={(e: any) => { e.stopPropagation(); handlePlayVerse(v); }}
                      onShare={(e: any) => { e.stopPropagation(); handleShare(v); }}
                      onBookmark={(e: any) => { e.stopPropagation(); toggleBookmark(v); }}
                      onWordClick={(e: any) => { e.stopPropagation(); handleWordClick(v, 0); }}
                      isPlaying={currentAudio?.id === v.id && isPlaying}
                      isBookmarked={state.favorites?.includes(`quran_${v.id}`)}
                      reciterName={selectedReciter.name}
                      fontClass={selectedScript.font}
                    />
                  </div>
                ))}

                {/* Tafseer Matches */}
                {(searchFilter === 'all' || searchFilter === 'tafseer') && tafseerResults.map((v, i) => (
                  <div key={`search-tafseer-${v.id}`} onClick={() => handleSearchResultClick(v)} className="cursor-pointer">
                    <div className="p-8 rounded-[2.5rem] bg-amber-500/5 border border-amber-500/10 hover:bg-amber-500/10 transition-all text-right group relative overflow-hidden">
                       <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />
                       <div className="flex justify-between items-center mb-6 relative z-10">
                          <span className="px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-widest">نتائج التفسير الميسر</span>
                          <span className="text-xs font-black text-white/20">{v.surah} - آية {v.ayahNumber}</span>
                       </div>
                       <p className="text-xl md:text-2xl text-white/80 leading-relaxed font-medium relative z-10">
                          {highlightMatch(v.arabic, searchQuery)}
                       </p>
                       <div className="mt-4 flex items-center gap-2 text-amber-400/40 text-[10px] font-bold relative z-10">
                          <Sparkles className="w-3 h-3" /> اضغط للانتقال لموضع الآية في المصحف
                       </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="h-px w-full bg-gradient-to-r from-transparent via-white/5 to-transparent my-10" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Content View ── */}
        <div className="w-full">
          {view === 'collections' && !isReadingMode && (
            <div className="space-y-12">
              <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar justify-center">{TOPICS.map(topic => (<button key={topic.id} onClick={() => setActiveTopic(topic.id)} className={cn("px-8 py-3 rounded-2xl whitespace-nowrap font-bold transition-all border text-sm", activeTopic === topic.id ? "bg-primary border-primary text-primary-foreground shadow-glow-primary" : "bg-white/5 border-transparent text-white/40 hover:bg-white/10")}>{topic.label}</button>))}</div>
              <div className="grid gap-10">{QURAN_DATA.map(col => {
                if (activeTopic === 'memorized') return col.verses.filter(v => state.quranMemorization?.[v.surahNumber] === 'completed').map((v, i) => (<VerseCard key={v.id} verse={v} accentColor={col.color} border={col.border} index={i} onPlay={handlePlayVerse} onShare={handleShare} onBookmark={toggleBookmark} onWordClick={handleWordClick} isPlaying={currentAudio?.id === v.id && isPlaying} isBookmarked={state.favorites?.includes(`quran_${v.id}`)} reciterName={selectedReciter.name} fontClass={selectedScript.font} />));
                if (activeTopic === 'bookmarks') return col.verses.filter(v => state.favorites?.includes(`quran_${v.id}`)).map((v, i) => (<VerseCard key={v.id} verse={v} accentColor={col.color} border={col.border} index={i} onPlay={handlePlayVerse} onShare={handleShare} onBookmark={toggleBookmark} onWordClick={handleWordClick} isPlaying={currentAudio?.id === v.id && isPlaying} isBookmarked={true} reciterName={selectedReciter.name} fontClass={selectedScript.font} />));
                if (activeTopic !== 'all' && col.id !== activeTopic) return null;
                return col.verses.map((v, i) => (<VerseCard key={v.id} verse={v} accentColor={col.color} border={col.border} index={i} onPlay={handlePlayVerse} onShare={handleShare} onBookmark={toggleBookmark} onWordClick={handleWordClick} isPlaying={currentAudio?.id === v.id && isPlaying} isBookmarked={state.favorites?.includes(`quran_${v.id}`)} reciterName={selectedReciter.name} fontClass={selectedScript.font} />));
              })}</div>
            </div>
          )}

          {view === 'full' && (
            <div className="space-y-12">
              {!selectedSurah ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSurahs.map((s: SurahInfo, i: number) => {
                    const status = (state.quranMemorization?.[s.number] || 'not-started') as keyof typeof MEMORIZATION_STATUS;
                    const config = MEMORIZATION_STATUS[status];
                    const StatusIcon = config.icon;

                    return (
                      <motion.button
                        key={s.number}
                        whileHover={{ y: -5, scale: 1.02 }}
                        onClick={() => loadSurah(s.number)}
                        className="group flex items-center justify-between p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] hover:border-primary/20 transition-all text-right relative overflow-hidden"
                      >
                        {status !== 'not-started' && (
                          <div className={cn("absolute top-0 right-0 w-2 h-full", config.color.replace('text-', 'bg-'))} />
                        )}
                        <div className="flex items-center gap-5 relative z-10">
                          <div className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center text-sm font-black transition-all shadow-xl",
                            status !== 'not-started' ? `${config.bg} ${config.color}` : "bg-white/5 text-white/20"
                          )}>
                            {status === 'not-started' ? s.number : <StatusIcon className="w-6 h-6" />}
                          </div>
                          <div>
                            <h3 className="text-2xl font-black text-white group-hover:text-primary transition-colors leading-relaxed font-tajawal">
                              {s.name}
                            </h3>
                            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
                              {s.numberOfAyahs} آية • {config.label}
                            </p>
                          </div>
                        </div>
                        <ArrowLeft className="w-5 h-5 text-white/10 group-hover:text-primary transition-all" />
                      </motion.button>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-12">
                  <div className={cn("flex flex-col md:flex-row justify-between items-center gap-8 bg-white/5 p-10 rounded-[3.5rem] border border-white/10", isReadingMode && "fixed top-8 left-8 right-8 z-50")}>
                    <button onClick={() => setSelectedSurah(null)} className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/5 text-white/60 hover:bg-white/10 transition-all font-black text-sm border border-white/10"><ArrowRight className="w-4 h-4" /> الفهرس</button>
                    <div className="text-center group">
                      <h2
                        onClick={() => {
                          const surah = surahs.find(s => s.number === selectedSurah);
                          if (surah) setActiveSurahInfo(surah);
                        }}
                        className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-4 cursor-help hover:text-primary transition-colors flex items-center justify-center gap-4"
                      >
                        {surahContent[0]?.surah}
                        <Info className="w-8 h-8 opacity-0 group-hover:opacity-20 transition-all" />
                      </h2>
                      <div className="flex flex-wrap items-center justify-center gap-2">{Object.entries(MEMORIZATION_STATUS).map(([key, config]) => (<button key={key} onClick={() => updateMemorization(selectedSurah, key as any)} className={cn("flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black transition-all border", (state.quranMemorization?.[selectedSurah] || 'not-started') === key ? `${config.bg} ${config.color} border-white/20` : "bg-white/5 text-white/20 border-transparent hover:bg-white/10")}><config.icon className="w-3.5 h-3.5" /> {config.label}</button>))}</div>
                    </div>
                    <div className="w-32 hidden md:block" />
                  </div>
                  {isLoading ? (
                    <div className="flex flex-col items-center py-48 gap-6"><Loader2 className="w-16 h-16 text-primary animate-spin" /><p className="text-white/20 font-black tracking-widest uppercase text-[10px]">جاري جلب الآيات العظيمة...</p></div>
                  ) : (
                    <>
                      {viewMode === 'ayah' ? (
                        <div className="grid gap-10">
                          {selectedSurah !== 1 && selectedSurah !== 9 && (
                            <div className={cn("text-center py-10 opacity-80", selectedScript.font)}>
                              <p className="text-4xl md:text-6xl text-white/90">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
                            </div>
                          )}
                          {surahContent.map((v, i) => (
                            <VerseCard key={v.id} id={v.id} verse={v} accentColor="text-primary" border="border-primary/20" index={i} isReadingMode={isReadingMode} fontSize={fontSize} onPlay={handlePlayVerse} onShare={handleShare} onBookmark={toggleBookmark} onWordClick={handleWordClick} isBookmarked={state.favorites?.includes(`quran_${v.id}`)} isPlaying={currentAudio?.id === v.id && isPlaying} reciterName={selectedReciter.name} fontClass={selectedScript.font} />
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-10">
                          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="w-full bg-[#080808] border border-white/5 rounded-[4rem] p-10 md:p-20 shadow-4xl relative overflow-hidden">
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
                            <div className="relative z-10">
                              {pages[currentPage] ? (
                                <>
                                  <div className="relative flex flex-col items-center">
                                    {/* Mushaf Page Info Header */}
                                    <div className="w-full flex justify-between items-center mb-10 px-8 text-[11px] font-black uppercase tracking-[0.2em] text-primary/60 border-b border-primary/10 pb-6">
                                      <div className="flex flex-col items-center">
                                        <span className="text-white/20 text-[9px] mb-1">الجزء</span>
                                        <span>{pages[currentPage]?.[0]?.juz_number || '-'}</span>
                                      </div>
                                      <div className="px-6 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary shadow-glow-primary">
                                        صفحة {currentPage}
                                      </div>
                                      <div className="flex flex-col items-center">
                                        <span className="text-white/20 text-[9px] mb-1">السورة</span>
                                        <span>{surahContent[0]?.surah || '-'}</span>
                                      </div>
                                    </div>

                                    {/* Real Mushaf Image Container */}
                                    <div className="relative group perspective-1000">
                                      <div className="absolute -inset-4 bg-primary/5 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" />

                                      {!mushafError ? (
                                        <div className="relative bg-[#fcf9f2] p-2 md:p-4 rounded-sm shadow-[20px_0_50px_-10px_rgba(0,0,0,0.5),-10px_0_30px_-5px_rgba(0,0,0,0.3)] border-r-4 border-black/10 overflow-hidden transform-gpu transition-all duration-700 hover:rotate-y-[-2deg]">
                                          <img
                                            src={`https://raw.githubusercontent.com/OmarIthawi/quran-images/master/images/page${String(currentPage).padStart(3, '0')}.png`}
                                            onError={() => setMushafError(true)}
                                            alt={`Quran Page ${currentPage}`}
                                            className="w-full h-auto min-h-[500px] object-contain mix-blend-multiply opacity-95"
                                            loading="lazy"
                                          />
                                          {/* Paper Texture Overlay */}
                                          <div className="absolute inset-0 pointer-events-none opacity-[0.15] bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] mix-blend-overlay" />
                                        </div>
                                      ) : (
                                        /* Fallback to Text View */
                                        <div className="text-center relative z-10 px-4 md:px-10 animate-in fade-in duration-700">
                                          {/* Traditional Surah Header */}
                                          {currentPage === pageNumbers[0] && (
                                            <div className="relative mb-12 py-8 px-4 border-y-2 border-primary/30 bg-gradient-to-r from-transparent via-primary/5 to-transparent">
                                              <h2 className="text-4xl md:text-6xl font-black text-white font-tajawal drop-shadow-glow">
                                                سورة {surahContent[0]?.surah}
                                              </h2>
                                            </div>
                                          )}

                                          {/* Bismillah Box */}
                                          {selectedSurah !== 1 && selectedSurah !== 9 && currentPage === pageNumbers[0] && (
                                            <div className={cn("relative mx-auto w-full mb-12 py-10 px-8 border border-primary/20 rounded-3xl bg-primary/[0.02] overflow-hidden", selectedScript.font)}>
                                              <p className="text-4xl md:text-6xl text-white/90">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
                                            </div>
                                          )}

                                          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2" dir="rtl">
                                            {pages[currentPage]?.map((v: any) => (
                                              <span
                                                key={v.id}
                                                onClick={() => handlePlayVerse(v)}
                                                className={cn(
                                                  selectedScript.font, "text-3xl md:text-5xl leading-[2.6] cursor-pointer transition-all hover:text-primary relative group inline-flex items-center flex-wrap justify-center",
                                                  currentAudio?.id === v.id ? "text-primary scale-[1.02] drop-shadow-glow-primary" : "text-white/90"
                                                )}
                                              >
                                                {v.arabic}
                                                <span className="mx-3 inline-flex w-14 h-14 rounded-full border-2 border-primary/30 bg-primary/5 items-center justify-center text-[10px] font-black text-primary align-middle shadow-glow-primary">
                                                  {v.ayahNumber}
                                                </span>
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <div className="py-20 flex flex-col items-center gap-4 text-white/20">
                                  <Loader2 className="w-8 h-8 animate-spin" />
                                  <p className="text-[10px] font-black uppercase tracking-widest">جاري إعداد الصفحة...</p>
                                </div>
                              )}
                            </div>
                          </motion.div>

                          <div className="flex items-center gap-6">
                            <button
                              disabled={pageNumbers.indexOf(currentPage) === 0}
                              onClick={() => setCurrentPage(pageNumbers[pageNumbers.indexOf(currentPage) - 1])}
                              className="w-20 h-20 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-primary hover:border-primary/40 transition-all disabled:opacity-20 shadow-xl"
                            >
                              <ChevronRight className="w-8 h-8" />
                            </button>
                            <div className="px-10 h-20 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center font-black text-white/40 text-sm tracking-widest shadow-inner">
                              {pageNumbers.indexOf(currentPage) + 1} <span className="mx-2 opacity-20">/</span> {pageNumbers.length}
                            </div>
                            <button
                              disabled={pageNumbers.indexOf(currentPage) === pageNumbers.length - 1}
                              onClick={() => setCurrentPage(pageNumbers[pageNumbers.indexOf(currentPage) + 1])}
                              className="w-20 h-20 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-primary hover:border-primary/40 transition-all disabled:opacity-20 shadow-xl"
                            >
                              <ChevronLeft className="w-8 h-8" />
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {view === 'plan' && (
            <div className="space-y-12">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative">
                <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
                  {/* Left Column: Progress & Quick Actions */}
                  <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 text-center relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <PlanProgress percentage={memorizationStats.percentage} />
                      <div className="mt-8">
                        <h3 className="text-2xl font-black text-white mb-2">تقدمك الحالي</h3>
                        <p className="text-white/30 text-xs font-bold leading-relaxed">
                          أنت تسير بشكل رائع! لقد أنجزت {memorizationStats.completed} سورة من أصل 114 سورة.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-8">
                        <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                          <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">سور محفوظة</p>
                          <p className="text-xl font-black text-white">{memorizationStats.completed}</p>
                        </div>
                        <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                          <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">النقاط</p>
                          <p className="text-xl font-black text-primary">{(state.points || 0) + (memorizationStats.completed * 50)}</p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsExamOpen(true)}
                      disabled={memorizedVerses.length === 0}
                      className="w-full p-8 rounded-[2.5rem] bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20 hover:border-amber-500/40 transition-all flex items-center justify-between group disabled:opacity-50 shadow-xl"
                    >
                      <div className="text-right">
                        <h4 className="text-amber-100 font-black mb-1">اختبار الحفظ</h4>
                        <p className="text-[10px] text-amber-500/60 font-bold uppercase tracking-widest">ثبت حفظك بالاختبارات</p>
                      </div>
                      <Trophy className="w-8 h-8 text-amber-400" />
                    </button>
                  </div>

                  {/* Right Column: Active Plan & Selection */}
                  <div className="lg:col-span-8 space-y-8">
                    {state.activeMemoPlan ? (
                      <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 md:p-12 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 text-white/[0.02] text-9xl font-black select-none pointer-events-none">📖</div>

                        <div className="relative z-10 flex flex-col md:flex-row items-start justify-between gap-8">
                          <div className="text-right">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                              <Target className="w-3.5 h-3.5" /> الخطة الحالية
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                              {MEMO_PLANS.find(p => p.id === state.activeMemoPlan?.planId)?.label}
                            </h2>
                            <p className="text-white/40 text-sm leading-relaxed max-w-md">
                              تتطلب هذه الخطة حفظ {MEMO_PLANS.find(p => p.id === state.activeMemoPlan?.planId)?.pagesPerDay} صفحة يومياً لإكمال المصحف كاملاً.
                            </p>
                          </div>

                          <div className="w-full md:w-auto p-8 rounded-[2.5rem] bg-primary text-primary-foreground shadow-glow-primary text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-70">الورد اليومي المقترح</p>
                            <h3 className="text-2xl font-black mb-6">
                              صفحة {dailyWord?.page} - {dailyWord?.surah}
                            </h3>
                            <button
                              onClick={() => {
                                setView('full');
                                setViewMode('page');
                                setCurrentPage(dailyWord?.page || 1);
                                // Optional: load the specific surah for that page
                              }}
                              className="w-full py-4 bg-black/20 hover:bg-black/30 rounded-xl font-black text-sm flex items-center justify-center gap-3 transition-all"
                            >
                              ابدأ الآن <ArrowLeft className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-12 pt-12 border-t border-white/5">
                          <h4 className="text-sm font-black text-white/30 uppercase tracking-widest mb-8">تغيير الخطة</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            {MEMO_PLANS.map(plan => {
                              const isActive = state.activeMemoPlan?.planId === plan.id;
                              return (
                                <button
                                  key={plan.id}
                                  onClick={() => activatePlan(plan.id)}
                                  className={cn(
                                    "p-6 rounded-2xl border transition-all text-right group",
                                    isActive ? "bg-primary/20 border-primary shadow-glow-primary" : "bg-white/5 border-white/5 hover:border-white/20"
                                  )}
                                >
                                  <h5 className={cn("font-black text-sm mb-1", isActive ? "text-primary" : "text-white/60")}>{plan.label}</h5>
                                  <p className="text-[10px] text-white/20 font-bold">{plan.months > 0 ? `${plan.months} شهراً` : 'مخصص'}</p>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white/5 border border-white/10 rounded-[3rem] p-16 text-center space-y-8">
                        <Sparkles className="w-16 h-16 text-primary mx-auto opacity-20" />
                        <div>
                          <h2 className="text-3xl font-black text-white mb-4">ابدأ رحلتك المباركة</h2>
                          <p className="text-white/40 max-w-md mx-auto leading-relaxed">قم باختيار الخطة التي تناسب وقتك وقدراتك لنقوم بمساعدتك في تتبع وردك اليومي ومراجعتك بانتظام.</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                          {MEMO_PLANS.map(plan => (
                            <button key={plan.id} onClick={() => activatePlan(plan.id)} className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-primary/40 hover:bg-primary/5 transition-all text-right group">
                              <h4 className="text-white font-black mb-2 group-hover:text-primary transition-colors">{plan.label}</h4>
                              <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{plan.months > 0 ? `${plan.months} شهراً` : 'خطة حرة'}</p>
                              <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                                <span className="text-sm font-black text-primary">{plan.pagesPerDay} <span className="text-[10px] text-white/40 font-normal">صفحة/يوم</span></span>
                                <ArrowLeft className="w-4 h-4 text-white/10 group-hover:text-primary group-hover:translate-x-[-4px] transition-all" />
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 flex items-center justify-between">
                        <div className="text-right">
                          <h4 className="text-white font-black mb-1">أوسمة الإنجاز</h4>
                          <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">تلقيت 3 أوسمة هذا الأسبوع</p>
                        </div>
                        <div className="flex -space-x-3">
                          {[1, 2, 3].map(i => <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 border-2 border-[#0a0a0a] flex items-center justify-center text-[10px] shadow-lg">🏆</div>)}
                        </div>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 flex items-center justify-between">
                        <div className="text-right">
                          <h4 className="text-white font-black mb-1">سجل المراجعة</h4>
                          <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">آخر مراجعة: منذ يومين</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/20 flex items-center justify-center text-blue-400"><History className="w-6 h-6" /></div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {currentAudio && (
          <motion.div initial={{ y: 150, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 150, opacity: 0 }} className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-xl">
            <div className="bg-[#0a0a0a]/90 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-6 shadow-[0_20px_100px_-20px_rgba(0,0,0,1)] flex items-center justify-between gap-8">
              <div className="flex items-center gap-5 overflow-hidden"><div className="w-16 h-16 rounded-[2rem] bg-primary/20 flex items-center justify-center shrink-0 shadow-inner"><span className="text-2xl animate-pulse">{selectedReciter.icon}</span></div><div className="overflow-hidden"><h4 className="text-white font-black text-base truncate mb-1">سورة {currentAudio.surah}</h4><div className="flex items-center gap-2"><span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-black">آية {currentAudio.ayahNumber}</span><span className="text-white/20 text-[10px] font-bold">بصوت {selectedReciter.name}</span></div></div></div>
              <div className="flex items-center gap-4">
                <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl border border-white/5">
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-widest mr-2">التشغيل</span>
                  <button onClick={() => setIsAutoPlay(!isAutoPlay)} className={cn("p-2 rounded-lg transition-all", isAutoPlay ? "text-primary" : "text-white/20")} title="تشغيل تلقائي"><ArrowRight className="w-4 h-4" /></button>
                  <button onClick={() => setIsLoop(!isLoop)} className={cn("p-2 rounded-lg transition-all", isLoop ? "text-primary" : "text-white/20")} title="تكرار الآية"><History className="w-4 h-4" /></button>
                </div>
                <div className="hidden md:flex items-center gap-1 px-3 py-2 bg-white/5 rounded-2xl border border-white/5">
                  <span className="text-[8px] font-black text-white/20 uppercase tracking-widest mr-2">السرعة</span>
                  {[0.5, 1, 1.5, 2].map(speed => (
                    <button key={speed} onClick={() => setPlaybackSpeed(speed)} className={cn("w-8 h-8 rounded-lg text-[10px] font-black transition-all", playbackSpeed === speed ? "bg-primary text-primary-foreground" : "text-white/40 hover:bg-white/10")}>{speed}x</button>
                  ))}
                </div>
                <button onClick={() => setIsPlaying(!isPlaying)} className="w-16 h-16 rounded-[2rem] bg-white text-black flex items-center justify-center hover:scale-105 transition-all shadow-glow-white shrink-0">{isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 fill-current" />}</button>
                <button onClick={() => { setCurrentAudio(null); setIsPlaying(false); audioRef.current?.pause(); }} className="w-12 h-12 rounded-2xl bg-white/5 text-white/20 hover:text-white transition-all flex items-center justify-center shrink-0"><X className="w-5 h-5" /></button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
