'use client';

import { Search, Sparkles, Mic, MicOff } from 'lucide-react';
import { useSearch } from './search-provider';
import { motion, AnimatePresence } from 'framer-motion';
import Magnetic from './magnetic';
import { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';

// Extend Window type to include speech recognition API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function HomeSearch() {
  const { openSearch, isSearchOpen } = useSearch();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [supported, setSupported] = useState(true);

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
        // Open search and pass the voice query via URL
        const searchUrl = `/search?q=${encodeURIComponent(text.trim())}`;
        window.location.href = searchUrl;
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
  }, [supported, isListening]);

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-0 relative">
      <motion.button
        onClick={openSearch}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full flex items-center justify-between h-20 ps-8 pe-4 rounded-[2.5rem] bg-white/[0.03] backdrop-blur-[40px] border border-white/10 text-white/30 hover:bg-white/[0.06] hover:border-white/20 transition-all duration-500 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] group/search text-start relative overflow-hidden"
      >
        {/* Internal Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-0 group-hover/search:opacity-100 transition-opacity duration-700" />

        <div className="flex items-center gap-4 relative z-10 flex-1 min-w-0">
          <div className="flex items-center justify-center p-2 rounded-xl bg-white/5 border border-white/5 text-primary group-hover/search:scale-110 transition-transform duration-500 shrink-0">
            <Sparkles className="w-4 h-4 fill-current" />
          </div>
          <AnimatePresence mode="wait">
            {isListening ? (
              <motion.span
                key="listening"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-xl font-bold tracking-tight text-primary truncate"
              >
                {transcript || 'جارٍ الاستماع...'}
              </motion.span>
            ) : (
              <motion.span
                key="placeholder"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-xl font-bold tracking-tight truncate"
              >
                ابحث عن محاضرة، سلسلة، كتاب...
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2 relative z-10 shrink-0">
          {/* Voice Search Button */}
          {supported && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                startVoiceSearch();
              }}
              className={cn(
                'p-3 rounded-2xl transition-all duration-500 border relative overflow-hidden',
                isListening
                  ? 'bg-primary/20 border-primary text-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)]'
                  : 'bg-white/5 border-white/10 text-white/40 hover:bg-primary/10 hover:text-primary hover:border-primary/30'
              )}
              title="بحث صوتي"
            >
              {/* Ripple animation when listening */}
              {isListening && (
                <>
                  <motion.div
                    className="absolute inset-0 rounded-2xl bg-primary/20"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-2xl bg-primary/10"
                    animate={{ scale: [1, 2, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
                  />
                </>
              )}
              <motion.div
                animate={isListening ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.6, repeat: Infinity }}
              >
                {isListening ? (
                  <MicOff className="w-5 h-5 relative z-10" />
                ) : (
                  <Mic className="w-5 h-5 relative z-10" />
                )}
              </motion.div>
            </button>
          )}

          {/* Search Button */}
          <Magnetic>
            <div className="p-3 rounded-2xl bg-primary text-white shadow-lg group-hover/search:shadow-primary/40 transition-all duration-500">
              <Search className="w-6 h-6" />
            </div>
          </Magnetic>
        </div>
      </motion.button>

      {/* Listening Indicator Pill */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute -bottom-14 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-bold backdrop-blur-xl shadow-xl z-20 whitespace-nowrap"
          >
            {/* Sound Bars Animation */}
            <div className="flex items-center gap-0.5 h-4">
              {[0, 0.1, 0.2, 0.1, 0].map((delay, i) => (
                <motion.div
                  key={i}
                  className="w-0.5 bg-primary rounded-full"
                  animate={{ height: ['4px', '14px', '4px'] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay, ease: 'easeInOut' }}
                />
              ))}
            </div>
            <span>جارٍ الاستماع... تحدث الآن</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
