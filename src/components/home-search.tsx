'use client';

import { Search, Mic, MicOff } from 'lucide-react';
import { useSearch } from './search-provider';
import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function HomeSearch() {
  const router = useRouter();
  const { openSearch } = useSearch();
  const { t } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasSpeech = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
      setSupported(hasSpeech);
    }
  }, []);

  const startVoiceSearch = useCallback(() => {
    if (!supported || isListening) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'ar-SA';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
    };

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const result = event.results[current];
      const text = result[0].transcript;
      setTranscript(text);

      if (result.isFinal && text.trim()) {
        setIsListening(false);
        router.push(`/search?q=${encodeURIComponent(text.trim())}`);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      setTranscript('');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }, [supported, isListening, router]);

  return (
    <div className="max-w-2xl mx-auto relative">
      <div
        role="button"
        tabIndex={0}
        onClick={openSearch}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openSearch();
          }
        }}
        className="w-full flex items-center justify-between h-14 sm:h-16 ps-5 pe-2.5 rounded-2xl bg-card border border-border hover:border-primary/50 text-muted-foreground hover:text-foreground transition-colors duration-200 shadow-sm group/search text-start cursor-pointer"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Search className="w-5 h-5 text-primary shrink-0" />
          <span className={cn('text-sm sm:text-base font-bold truncate', isListening && 'text-primary')}>
            {isListening
              ? transcript || t('جارٍ الاستماع...', 'Listening...')
              : t('ابحث عن محاضرة، سلسلة، كتاب...', 'Search lectures, series, books...')}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {supported && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                startVoiceSearch();
              }}
              className={cn(
                'p-2.5 rounded-xl border transition-colors duration-200',
                isListening
                  ? 'bg-primary/15 border-primary text-primary animate-pulse'
                  : 'bg-muted/60 border-border text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30'
              )}
              title="بحث صوتي"
              aria-label="بحث صوتي"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}

          <div className="h-10 sm:h-11 px-4 rounded-xl bg-primary text-primary-foreground flex items-center justify-center gap-2 text-xs sm:text-sm font-black shadow-sm">
            <span>{t('ابحث', 'Search')}</span>
          </div>
        </div>
      </div>

      {isListening && (
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2.5 px-4 py-2 rounded-full bg-card border border-primary/40 text-primary text-xs font-bold shadow-lg z-20 whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
          <span>جارٍ الاستماع... تحدث الآن</span>
        </div>
      )}
    </div>
  );
}
