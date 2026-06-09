'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRadio } from './radio-provider';
import { Play, Pause, X, Radio, Volume2, VolumeX, ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function FloatingRadioPlayer() {
  const { currentStation, isPlaying, isBuffering, volume, setVolume, togglePlay, stopRadio, activeYoutubeId } = useRadio();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const prevVolume = useRef(volume);

  const [origin, setOrigin] = useState('');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  // Don't show if no station selected
  if (!currentStation) return null;

  const handleMuteToggle = () => {
    if (isMuted) {
      setVolume(prevVolume.current);
      setIsMuted(false);
    } else {
      prevVolume.current = volume;
      setVolume(0);
      setIsMuted(true);
    }
  };

  return (
    <>
      {/* Hidden YouTube iframe for global radio */}
      {activeYoutubeId && origin && (
        <iframe
          id="global-youtube-radio"
          src={`https://www.youtube.com/embed/${activeYoutubeId}?enablejsapi=1&autoplay=1&controls=0&modestbranding=1&origin=${encodeURIComponent(origin)}`}
          className="hidden"
          allow="autoplay"
          title="radio-audio"
          onLoad={() => {
            const iframe = document.getElementById('global-youtube-radio') as HTMLIFrameElement;
            if (iframe?.contentWindow) {
              iframe.contentWindow.postMessage(
                JSON.stringify({
                  event: 'command',
                  func: 'setVolume',
                  args: [volume * 100],
                }),
                '*'
              );
            }
          }}
        />
      )}

      <AnimatePresence>
        <motion.div
          key="floating-radio"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={cn(
            'fixed z-[60] left-4 bottom-4',
            'transition-all duration-300'
          )}
          style={{ bottom: '80px' }} // above the bottom nav on mobile
        >
          <div
            className={cn(
              'relative overflow-hidden rounded-2xl shadow-2xl border',
              'bg-black/80 backdrop-blur-xl border-white/10',
              'transition-all duration-300',
              isExpanded ? 'w-72' : 'w-auto'
            )}
          >
            {/* Gradient accent background */}
            <div className={cn('absolute inset-0 bg-gradient-to-br opacity-30 pointer-events-none', currentStation.color)} />

            {/* Collapsed / Header row */}
            <div className="relative flex items-center gap-3 p-3">
              {/* Station icon */}
              <div
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 bg-gradient-to-br overflow-hidden',
                  currentStation.color,
                  'border border-white/10'
                )}
              >
                {isBuffering ? (
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                ) : (
                  currentStation.icon && (currentStation.icon.startsWith('http://') || currentStation.icon.startsWith('https://')) ? (
                    <img src={currentStation.icon} alt={currentStation.name} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <span>{currentStation.icon}</span>
                  )
                )}
              </div>

              {/* Station name - shown when expanded */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 'auto', opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className={cn('text-sm font-bold whitespace-nowrap', currentStation.textColor)}>
                      {currentStation.name}
                    </p>
                    <p className="text-xs text-white/40 whitespace-nowrap">بث مباشر</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Controls */}
              <div className="flex items-center gap-1 mr-auto">
                {/* Mute button */}
                <button
                  onClick={handleMuteToggle}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
                  title={isMuted ? 'إلغاء كتم الصوت' : 'كتم الصوت'}
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>

                {/* Play/Pause */}
                <button
                  onClick={togglePlay}
                  className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center transition-all',
                    'bg-white/10 hover:bg-white/20 text-white'
                  )}
                  title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
                >
                  {isBuffering ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>

                {/* Expand toggle */}
                <button
                  onClick={() => setIsExpanded((p) => !p)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
                >
                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                </button>

                {/* Stop */}
                <button
                  onClick={stopRadio}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-white/10 transition-all"
                  title="إيقاف المذياع"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Expanded panel */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-3 space-y-3 border-t border-white/5 pt-2">
                    {/* Volume slider */}
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-3.5 h-3.5 text-white/40 shrink-0" />
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={volume}
                        onChange={(e) => {
                          setVolume(parseFloat(e.target.value));
                          setIsMuted(false);
                        }}
                        className="w-full h-1 accent-emerald-400 cursor-pointer"
                      />
                    </div>

                    {/* Live indicator */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            'inline-block w-2 h-2 rounded-full',
                            isPlaying ? 'bg-red-500 animate-pulse' : 'bg-white/20'
                          )}
                        />
                        <span className="text-xs text-white/40">
                          {isPlaying ? 'يُبثّ الآن' : 'متوقف'}
                        </span>
                      </div>

                      {/* Link back to Quran page */}
                      <Link
                        href="/quran?tab=radio"
                        className={cn(
                          'text-xs font-semibold px-2 py-1 rounded-lg transition-all',
                          'bg-white/5 hover:bg-white/10',
                          currentStation.textColor
                        )}
                      >
                        <Radio className="w-3 h-3 inline ml-1" />
                        المذياع
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Playing equalizer animation */}
            {isPlaying && !isBuffering && (
              <div className="absolute top-3 right-3 flex items-end gap-[2px] h-4 pointer-events-none">
                {[1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className={cn('w-[3px] rounded-full bg-current', currentStation.textColor)}
                    style={{
                      animation: `equalize ${0.4 + i * 0.15}s ease-in-out infinite alternate`,
                      height: `${30 + i * 20}%`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      <style jsx>{`
        @keyframes equalize {
          from { transform: scaleY(0.3); }
          to { transform: scaleY(1); }
        }
      `}</style>
    </>
  );
}
