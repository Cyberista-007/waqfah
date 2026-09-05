'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dialog, 
  DialogContent, 
  DialogTrigger, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogClose 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  Eye, 
  EyeOff, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  Play, 
  Pause,
  Award,
  Sparkles,
  HelpCircle,
  Clock,
  ChevronRight,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface HadithMemorizerProps {
  text: string;
  reference: string;
  trigger?: React.ReactNode;
}

function normalizeArabic(text: string): string {
  return text
    .replace(/[\u064B-\u065F]/g, "") // remove tashkeel (diacritics)
    .replace(/[أإآا]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()«»""'']/g, "")
    .trim()
    .toLowerCase();
}

function getEditDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          )
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

interface MaskedWord {
  word: string;
  normalized: string;
  isMasked: boolean;
  isRevealed: boolean;
}

class GoogleTTSPlayer {
  private audioChunks: string[] = [];
  private currentChunkIndex = 0;
  private audio: HTMLAudioElement | null = null;
  private isPlaying = false;
  private speed = 1.0;
  private onEndCallback: () => void = () => {};
  private onErrorCallback: () => void = () => {};

  constructor(text: string, speed: number, onEnd: () => void, onError: () => void) {
    this.speed = speed;
    this.onEndCallback = onEnd;
    this.onErrorCallback = onError;
    this.audioChunks = this.splitTextIntoChunks(text, 150);
  }

  private splitTextIntoChunks(text: string, maxLength: number): string[] {
    const words = text.split(' ');
    const chunks: string[] = [];
    let currentChunk = '';

    for (const word of words) {
      if ((currentChunk + ' ' + word).trim().length > maxLength) {
        if (currentChunk) chunks.push(currentChunk.trim());
        currentChunk = word;
      } else {
        currentChunk = (currentChunk + ' ' + word).trim();
      }
    }
    if (currentChunk) chunks.push(currentChunk.trim());
    return chunks;
  }

  public play() {
    this.isPlaying = true;
    this.currentChunkIndex = 0;
    this.playNextChunk();
  }

  private playNextChunk() {
    if (!this.isPlaying) return;

    if (this.currentChunkIndex >= this.audioChunks.length) {
      this.isPlaying = false;
      this.onEndCallback();
      return;
    }

    const chunk = this.audioChunks[this.currentChunkIndex];
    const url = `/api/tts?text=${encodeURIComponent(chunk)}`;
    
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
    }

    this.audio = new Audio(url);
    this.audio.defaultPlaybackRate = this.speed;
    this.audio.playbackRate = this.speed;
    
    this.audio.onended = () => {
      this.currentChunkIndex++;
      this.playNextChunk();
    };

    this.audio.onerror = () => {
      this.isPlaying = false;
      this.onErrorCallback();
    };

    this.audio.play().catch(() => {
      this.isPlaying = false;
      this.onErrorCallback();
    });
  }

  public stop() {
    this.isPlaying = false;
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }
  }
}

export function HadithMemorizer({ text, reference, trigger }: HadithMemorizerProps) {
    const googleTTSRef = useRef<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'masking' | 'looping' | 'test'>('masking');
  const { toast } = useToast();

  // --- Masking Tab States ---
  const [maskDensity, setMaskDensity] = useState(30); // percentage (0 to 100)
  const [words, setWords] = useState<MaskedWord[]>([]);

  // --- Audio Looping Tab States ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  // Pre-fetch/cache voices on mount and listen to voiceschanged
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      const handleVoicesChanged = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      };
    }
  }, []);

  const [loopCount, setLoopCount] = useState(1);
  const [currentLoop, setCurrentLoop] = useState(1);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // --- Test Tab States ---
  const [typedText, setTypedText] = useState('');
  const [testResult, setTestResult] = useState<{
    score: number;
    diff: { word: string; status: 'correct' | 'wrong' | 'missing' }[];
  } | null>(null);

  const generateMaskedWords = useCallback((density: number) => {
    const rawWords = text.replace(/«|»/g, '').trim().split(/\s+/);
    const mapped = rawWords.map((word) => {
      const norm = normalizeArabic(word);
      const isPunctuationOnly = norm.length === 0;
      // Randomly mask word based on density if it's not punctuation
      const shouldMask = !isPunctuationOnly && Math.random() * 100 < density;
      return {
        word,
        normalized: norm,
        isMasked: shouldMask,
        isRevealed: false
      };
    });
    setWords(mapped);
  }, [text]);

  // Parse words on open or text change
  useEffect(() => {
    if (isOpen && text) {
      generateMaskedWords(maskDensity);
      // Reset testing state
      setTypedText('');
      setTestResult(null);
      // Cancel speech
      stopSpeech();
    }
    return () => stopSpeech();
  }, [isOpen, text, generateMaskedWords, maskDensity]);

  const handleDensityChange = (density: number) => {
    setMaskDensity(density);
    generateMaskedWords(density);
  };

  const toggleWordReveal = (index: number) => {
    setWords((prev) =>
      prev.map((w, idx) => (idx === index ? { ...w, isRevealed: !w.isRevealed } : w))
    );
  };

  const revealAllWords = () => {
    setWords((prev) => prev.map((w) => ({ ...w, isRevealed: true })));
  };

  const hideAllWords = () => {
    setWords((prev) => prev.map((w) => ({ ...w, isRevealed: false })));
  };

  // --- Audio Looping Handler ---
  const startSpeech = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      toast({ title: 'نظام القراءة الصوتية غير مدعوم في متصفحك حالياً.' });
      return;
    }

    window.speechSynthesis.cancel();
    setIsPlaying(true);
    setCurrentLoop(1);

    const cleanText = text
      .replace(/ﷺ/g, 'صلى الله عليه وسلم')
      .replace(/ؓ/g, 'رضي الله عنه')
      .replace(/[()[\]{}«»''""]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    runSpeechLoop(cleanText, loopCount);
  };

  const runSpeechLoop = (speechText: string, totalLoops: number) => {
    if (typeof window === 'undefined') return;

    let loopIndex = 1;
    const savedVoice = localStorage.getItem('hadith_speech_voice') || 'google-cloud-tts';

    if (savedVoice === 'google-cloud-tts') {
      const playNextLoop = () => {
        const savedStrip = localStorage.getItem('hadith_strip_tashkeel') === 'true';
        let cleanText = speechText;
        if (savedStrip) {
          cleanText = speechText.replace(/[\u064B-\u0652\u0670]/g, '');
        }

        const player = new GoogleTTSPlayer(cleanText, speechRate, () => {
          if (loopIndex < totalLoops && isPlaying) {
            loopIndex++;
            setCurrentLoop(loopIndex);
            setTimeout(playNextLoop, 1500);
          } else {
            setIsPlaying(false);
            setCurrentLoop(1);
          }
        }, () => {
          setIsPlaying(false);
          setCurrentLoop(1);
        });

        googleTTSRef.current = player;
        player.play();
      };
      
      playNextLoop();
    } else {
      const speak = () => {
        const savedStrip = localStorage.getItem('hadith_strip_tashkeel') === 'true';
        let cleanText = speechText;
        if (savedStrip) {
          cleanText = speechText.replace(/[\u064B-\u0652\u0670]/g, '');
        }
        
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'ar-SA';
        utterance.rate = speechRate;
        
        const voices = window.speechSynthesis.getVoices();
        const chosenVoice = voices.find(v => v.name === savedVoice) || voices.find(v => v.lang.startsWith('ar')) || voices[0];
        if (chosenVoice) utterance.voice = chosenVoice;

        utterance.onend = () => {
          if (loopIndex < totalLoops && isPlaying) {
            loopIndex++;
            setCurrentLoop(loopIndex);
            setTimeout(speak, 1500);
          } else {
            setIsPlaying(false);
            setCurrentLoop(1);
          }
        };

        utterance.onerror = () => {
          setIsPlaying(false);
          setCurrentLoop(1);
        };

        speechUtteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      };

      speak();
    }
  };

  const stopSpeech = () => {
    setIsPlaying(false);
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  useEffect(() => {
    if (!isPlaying) {
      stopSpeech();
    }
  }, [isPlaying]);

  // --- Writing Test Handler ---
  const handleCheckTest = () => {
    if (!typedText.trim()) {
      toast({ title: 'الرجاء كتابة الحديث أولاً لتصحيحه.' });
      return;
    }

    const origWords = text.replace(/«|»/g, '').trim().split(/\s+/);
    const typedWords = typedText.trim().split(/\s+/);
    const origNorm = origWords.map(w => normalizeArabic(w));
    const typedNorm = typedWords.map(w => normalizeArabic(w));
    
    let typedIdx = 0;
    const diff: { word: string; status: 'correct' | 'wrong' | 'missing' }[] = [];
    let correctCount = 0;
    let totalEvaluable = 0;

    for (let i = 0; i < origWords.length; i++) {
      const oNorm = origNorm[i];
      if (!oNorm) {
        // Skip punctuation/empty normalized words in scoring, just add to visualization as correct
        diff.push({ word: origWords[i], status: 'correct' });
        continue;
      }
      totalEvaluable++;
      
      // Look ahead up to 4 words to match alignment (handles forgot/missing words)
      let foundIdx = -1;
      for (let j = typedIdx; j < Math.min(typedIdx + 4, typedNorm.length); j++) {
        if (typedNorm[j] === oNorm) {
          foundIdx = j;
          break;
        }
      }

      if (foundIdx !== -1) {
        diff.push({ word: origWords[i], status: 'correct' });
        correctCount++;
        typedIdx = foundIdx + 1;
      } else {
        // Spelling mistake check
        const currentTyped = typedNorm[typedIdx];
        if (currentTyped && getEditDistance(oNorm, currentTyped) <= 2) {
          diff.push({ word: origWords[i], status: 'wrong' });
          typedIdx++;
        } else {
          diff.push({ word: origWords[i], status: 'missing' });
        }
      }
    }

    const score = Math.round((correctCount / totalEvaluable) * 100);
    setTestResult({ score, diff });

    if (score === 100) {
      toast({
        title: 'أحسنت! تسميع كامل وبدون أخطاء 🎉',
        description: 'لقد حفظت الحديث الشريف بنسبة 100%',
      });
    } else if (score >= 80) {
      toast({
        title: 'ممتاز! درجة حفظ عالية 👏',
        description: `لقد حققت دقة تسميع بنسبة ${score}%`,
      });
    } else {
      toast({
        title: 'محاولة جيدة! استمر في التكرار 💪',
        description: `دقة التسميع الحالية: ${score}%، ننصحك باستخدام وضع التكرار والتغطية.`,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => { setIsOpen(val); if (!val) stopSpeech(); }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 hover:bg-amber-500/10 hover:text-amber-500 hover:border-amber-500/20 transition-all text-white/40"
            title="مساعد الحفظ التفاعلي"
          >
            <Brain className="w-4 h-4 text-emerald-400 animate-pulse" />
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-3xl bg-zinc-950/95 backdrop-blur-3xl border border-white/10 text-white rounded-[3rem] shadow-2xl p-8 overflow-hidden select-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[90px] pointer-events-none" />

        <DialogHeader className="relative z-10 text-right pb-4 border-b border-white/5">
          <DialogTitle className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
            <Brain className="w-7 h-7 text-emerald-400 animate-bounce" />
            <span>مساعد <span className="text-emerald-400 italic">حفظ الحديث</span> التفاعلي</span>
          </DialogTitle>
          <DialogDescription className="text-white/40 font-medium mt-1">
            أدوات متطورة لتسهيل وتثبيت حفظ الحديث النبوي الشريف عبر ثلاث طرق علمية مبتكرة.
          </DialogDescription>
        </DialogHeader>

        {/* Tab Selectors */}
        <div className="flex p-1 bg-white/5 rounded-2xl border border-white/5 gap-1 mt-6 relative z-10">
          <button
            onClick={() => { setActiveTab('masking'); stopSpeech(); }}
            className={cn(
              "flex-1 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2",
              activeTab === 'masking' ? "bg-white text-black shadow-lg" : "text-white/40 hover:text-white"
            )}
          >
            <EyeOff className="w-4 h-4" />
            <span>تغطية الكلمات</span>
          </button>
          <button
            onClick={() => { setActiveTab('looping'); }}
            className={cn(
              "flex-1 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2",
              activeTab === 'looping' ? "bg-white text-black shadow-lg" : "text-white/40 hover:text-white"
            )}
          >
            <Volume2 className="w-4 h-4" />
            <span>التكرار السمعي</span>
          </button>
          <button
            onClick={() => { setActiveTab('test'); stopSpeech(); }}
            className={cn(
              "flex-1 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2",
              activeTab === 'test' ? "bg-white text-black shadow-lg" : "text-white/40 hover:text-white"
            )}
          >
            <Award className="w-4 h-4" />
            <span>اختبار التسميع</span>
          </button>
        </div>

        <div className="py-6 min-h-[300px] flex flex-col justify-between relative z-10">
          <AnimatePresence mode="wait">
            
            {/* Tab 1: Word Masking */}
            {activeTab === 'masking' && (
              <motion.div
                key="masking-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 flex flex-col justify-between h-full"
              >
                {/* Density Settings */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-2 text-white/50 text-xs font-bold">
                    <Settings className="w-4 h-4 text-emerald-400" />
                    <span>نسبة الكلمات المغطاة: {maskDensity}%</span>
                  </div>
                  <div className="flex gap-1.5">
                    {[10, 30, 50, 75, 100].map((d) => (
                      <button
                        key={d}
                        onClick={() => handleDensityChange(d)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[10px] font-black border transition-all",
                          maskDensity === d
                            ? "bg-emerald-500 border-emerald-500 text-black font-black"
                            : "bg-white/5 border-white/5 text-white/40 hover:text-white"
                        )}
                      >
                        {d === 100 ? 'كامل' : `${d}%`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hadith Text with Interactive Masking */}
                <div className="p-8 md:p-10 rounded-3xl bg-zinc-900/60 border border-white/5 leading-[2.2] text-xl md:text-2xl text-right font-headline font-bold text-white max-h-[220px] overflow-y-auto no-scrollbar">
                  <div className="flex flex-wrap gap-x-2 gap-y-3 justify-start direction-rtl" dir="rtl">
                    {words.map((w, idx) => {
                      if (w.isMasked && !w.isRevealed) {
                        return (
                          <motion.button
                            key={idx}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => toggleWordReveal(idx)}
                            className="px-2 py-0.5 min-w-[50px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-black cursor-pointer hover:bg-emerald-500/20 text-center animate-pulse transition-all inline-block align-middle"
                            title="انقر لإظهار الكلمة"
                          >
                            ؟
                          </motion.button>
                        );
                      }
                      
                      return (
                        <span
                          key={idx}
                          onClick={w.isMasked ? () => toggleWordReveal(idx) : undefined}
                          className={cn(
                            "inline-block transition-colors cursor-pointer",
                            w.isRevealed && w.isMasked ? "text-emerald-400 font-black border-b border-dashed border-emerald-500/40" : "text-white"
                          )}
                          title={w.isMasked ? "انقر لإخفاء الكلمة مجدداً" : undefined}
                        >
                          {w.word}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Footer buttons for Masking */}
                <div className="flex justify-between items-center mt-4">
                  <div className="text-[10px] text-white/30 font-medium">💡 انقر على المربعات الخضراء للكشف عن الكلمات المستترة.</div>
                  <div className="flex gap-2">
                    <Button
                      onClick={hideAllWords}
                      variant="ghost"
                      className="px-4 py-2 text-xs font-black text-white/40 hover:bg-white/5 rounded-xl"
                    >
                      إعادة تغطية الكل
                    </Button>
                    <Button
                      onClick={revealAllWords}
                      variant="ghost"
                      className="px-4 py-2 text-xs font-black text-emerald-400 hover:bg-emerald-500/10 rounded-xl"
                    >
                      كشف الكل
                    </Button>
                    <Button
                      onClick={() => generateMaskedWords(maskDensity)}
                      className="px-4 py-2 text-xs font-black bg-white text-black hover:bg-white/90 rounded-xl flex items-center gap-1.5"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      تغطية عشوائية جديدة
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tab 2: Audio Looping */}
            {activeTab === 'looping' && (
              <motion.div
                key="looping-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 flex flex-col justify-between h-full"
              >
                {/* Advanced Audio Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Speed Rate */}
                  <div className="bg-white/5 p-5 rounded-2xl border border-white/5 space-y-3">
                    <div className="text-xs font-black text-white/50 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-400" />
                      <span>سرعة التسميع الصوتي</span>
                    </div>
                    <div className="flex gap-2">
                      {[0.75, 1.0, 1.25].map((rate) => (
                        <button
                          key={rate}
                          onClick={() => { setSpeechRate(rate); if (isPlaying) startSpeech(); }}
                          className={cn(
                            "flex-1 py-2 rounded-xl text-xs font-black border transition-all",
                            speechRate === rate
                              ? "bg-emerald-500 border-emerald-500 text-black"
                              : "bg-black/30 border-white/5 text-white/40 hover:text-white"
                          )}
                        >
                          {rate === 1.0 ? 'طبيعي (1x)' : `${rate}x`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Loop Counts */}
                  <div className="bg-white/5 p-5 rounded-2xl border border-white/5 space-y-3">
                    <div className="text-xs font-black text-white/50 flex items-center gap-2">
                      <RotateCw className="w-4 h-4 text-emerald-400" />
                      <span>تكرار التلاوة تلقائياً</span>
                    </div>
                    <div className="flex gap-2">
                      {[1, 3, 5, 10].map((count) => (
                        <button
                          key={count}
                          onClick={() => { setLoopCount(count); if (isPlaying) startSpeech(); }}
                          className={cn(
                            "flex-1 py-2 rounded-xl text-xs font-black border transition-all",
                            loopCount === count
                              ? "bg-emerald-500 border-emerald-500 text-black"
                              : "bg-black/30 border-white/5 text-white/40 hover:text-white"
                          )}
                        >
                          {count === 1 ? 'مرة واحدة' : `${count} مرات`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Hadith Text with Highlight during play */}
                <div className="p-8 md:p-10 rounded-3xl bg-zinc-900/60 border border-white/5 leading-[2.2] text-xl md:text-2xl text-right font-headline font-bold text-white max-h-[160px] overflow-y-auto no-scrollbar relative flex items-center justify-center">
                  <p className={cn("text-center transition-all duration-300", isPlaying ? "text-emerald-300 scale-105" : "text-white/80")}>
                    «{text}»
                  </p>
                </div>

                {/* Play Button Panel */}
                <div className="flex items-center justify-between mt-4">
                  {isPlaying ? (
                    <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl">
                      <div className="flex gap-0.5 items-center">
                        <span className="w-1.5 h-3.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <span className="w-1.5 h-4.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        <span className="w-1.5 h-3 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                      </div>
                      <span className="text-xs font-bold text-emerald-400">جاري قراءة التكرار {currentLoop} من {loopCount}...</span>
                    </div>
                  ) : (
                    <div className="text-[10px] text-white/30 font-medium">💡 يساعدك التكرار السمعي المستمر للحديث على ترسيخ الكلمات في الذهن.</div>
                  )}

                  <Button
                    onClick={isPlaying ? stopSpeech : startSpeech}
                    className={cn(
                      "px-6 py-4 rounded-xl font-black text-xs flex items-center gap-2",
                      isPlaying 
                        ? "bg-red-500 hover:bg-red-600 text-white" 
                        : "bg-emerald-500 hover:bg-emerald-600 text-black"
                    )}
                  >
                    {isPlaying ? (
                      <>
                        <VolumeX className="w-4 h-4" />
                        <span>إيقاف الاستماع</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current" />
                        <span>بدء التكرار الصوتي</span>
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Tab 3: Memorization Self-Test */}
            {activeTab === 'test' && (
              <motion.div
                key="test-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 flex flex-col justify-between h-full"
              >
                {!testResult ? (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold text-white/50 px-2">
                        <span>أكتب الحديث غيباً في الحقل أدناه (يتم تجاهل التشكيل وعلامات الترقيم):</span>
                      </div>
                      <textarea
                        value={typedText}
                        onChange={(e) => setTypedText(e.target.value)}
                        placeholder="أكتب الحديث الشريف هنا من ذاكرتك..."
                        rows={6}
                        dir="rtl"
                        className="w-full p-6 rounded-3xl bg-zinc-900/60 border border-white/10 focus:border-emerald-500/50 outline-none font-headline font-bold text-lg leading-relaxed text-right text-white placeholder-white/20 focus:bg-zinc-900 transition-all"
                      />
                    </div>
                    
                    <div className="flex justify-end gap-2 mt-2">
                      <Button
                        onClick={() => setTypedText('')}
                        variant="ghost"
                        className="px-5 py-3 rounded-xl font-black text-xs text-white/40 hover:bg-white/5"
                      >
                        مسح
                      </Button>
                      <Button
                        onClick={handleCheckTest}
                        className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-black text-xs rounded-xl flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        تصحيح وتسميع الحديث
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-6">
                    {/* Score Circle & Statistics */}
                    <div className="flex flex-col md:flex-row items-center gap-6 bg-white/5 p-6 rounded-3xl border border-white/5 justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                          <svg className="w-20 h-20 transform -rotate-90">
                            <circle cx="40" cy="40" r="34" className="stroke-white/5" strokeWidth="6" fill="transparent" />
                            <circle 
                              cx="40" 
                              cy="40" 
                              r="34" 
                              className={cn(
                                "transition-all duration-1000",
                                testResult.score >= 90 ? "stroke-emerald-400" : testResult.score >= 70 ? "stroke-amber-400" : "stroke-rose-500"
                              )} 
                              strokeWidth="6" 
                              fill="transparent" 
                              strokeDasharray={2 * Math.PI * 34}
                              strokeDashoffset={2 * Math.PI * 34 * (1 - testResult.score / 100)}
                              strokeLinecap="round"
                            />
                          </svg>
                          <span className="absolute text-base font-black">{testResult.score}%</span>
                        </div>
                        <div className="text-right">
                          <h4 className="text-lg font-black text-white">دقة الحفظ الإجمالية</h4>
                          <p className="text-xs text-white/40 mt-0.5">تمت مقارنة تسميعك بنسخة الحديث الأصلية.</p>
                        </div>
                      </div>

                      <div className="flex gap-3 text-[10px] font-black uppercase tracking-wider">
                        <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> صحيح
                        </span>
                        <span className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" /> خطأ إملائي
                        </span>
                        <span className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" /> منسيّ
                        </span>
                      </div>
                    </div>

                    {/* Diff Visualization */}
                    <div className="p-8 md:p-10 rounded-3xl bg-zinc-900/60 border border-white/5 leading-[2.2] text-xl md:text-2xl text-right font-headline font-bold text-white max-h-[180px] overflow-y-auto no-scrollbar">
                      <div className="flex flex-wrap gap-x-2 gap-y-3 justify-start direction-rtl" dir="rtl">
                        {testResult.diff.map((item, idx) => {
                          let style = "text-white";
                          if (item.status === 'correct') style = "text-emerald-400";
                          else if (item.status === 'wrong') style = "text-amber-400 border-b-2 border-amber-500/40";
                          else if (item.status === 'missing') style = "text-rose-500/40 line-through decoration-rose-500/40 decoration-2";

                          return (
                            <span key={idx} className={cn("inline-block", style)} title={item.status === 'wrong' ? "خطأ إملائي أو تبديل" : item.status === 'missing' ? "كلمة لم تذكرها" : "صحيح"}>
                              {item.word}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Retest Panel */}
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-[10px] text-white/30 font-medium">💡 يمكنك مراجعة الأخطاء الملونة وإعادة الاختبار لتحسين نتيجتك.</span>
                      <Button
                        onClick={() => { setTestResult(null); setTypedText(''); }}
                        className="px-5 py-2.5 bg-white text-black hover:bg-white/90 rounded-xl font-black text-xs flex items-center gap-1.5"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        إعادة الاختبار
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Dialog Footer */}
        <div className="flex justify-between items-center pt-6 border-t border-white/5 mt-4 relative z-10">
          <div className="text-right">
            <p className="text-[10px] font-bold text-emerald-400 italic mb-0.5">{reference}</p>
            <p className="text-[9px] font-black opacity-30 tracking-widest uppercase">منصة وقفة الإيمانية</p>
          </div>
          
          <DialogClose asChild>
            <Button 
              onClick={stopSpeech}
              variant="outline" 
              className="rounded-2xl h-12 px-6 border-white/10 hover:bg-white/5 text-white font-bold text-xs"
            >
              إغلاق
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
