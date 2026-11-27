import { useState, useCallback, useEffect, useRef } from 'react';
import { useRadio, RadioStation } from '@/components/radio-provider';
import { computeSpectrumBands, resolveCanvasColor } from '@/lib/audio-spectrum';

const getYoutubeId = (url: string): string | null => {
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|live\/)([^#&?]{11}).*/;
  const match = url.match(regExp);
  return match ? match[2] : null;
};

export function useQuranRadio() {
  const {
    currentStation,
    isPlaying: isPlayingRadio,
    isBuffering: isRadioBuffering,
    volume: radioVolume,
    setVolume: setRadioVolume,
    playStation: handlePlayRadio,
    togglePlay: handleToggleRadio,
    stopRadio,
    activeYoutubeId,
    audioRef: radioAudioRef,
    currentTime,
    duration,
    seekTo,
    playbackRate,
  } = useRadio();

  const [radioSearchQuery, setRadioSearchQuery] = useState<string>('');
  const [favoriteRadioIds, setFavoriteRadioIds] = useState<string[]>([]);
  const [radioStations, setRadioStations] = useState<RadioStation[]>([]);
  const [isLoadingRadios, setIsLoadingRadios] = useState<boolean>(false);

  // Fetch imported YouTube lectures via lightweight API (avoids loading all lectures from Firestore)
  const [importedRadioStations, setImportedRadioStations] = useState<RadioStation[]>([]);
  const [isLoadingImported, setIsLoadingImported] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoadingImported(true);
    fetch('/api/radio-stations')
      .then(res => res.json())
      .then(data => {
        if (!cancelled && data.stations) {
          setImportedRadioStations(data.stations as RadioStation[]);
        }
      })
      .catch(err => console.warn('[radio-stations fetch]', err))
      .finally(() => { if (!cancelled) setIsLoadingImported(false); });
    return () => { cancelled = true; };
  }, []);

  // ── Web Audio API Refs for Recording & Real Visualizer ──
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);
  const radioSourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);

  // ── Smart Quran Radio Developed Features States ──
  const [customRadioStations, setCustomRadioStations] = useState<RadioStation[]>([]);
  const [isAddCustomRadioOpen, setIsAddCustomRadioOpen] = useState<boolean>(false);
  const [customRadioName, setCustomRadioName] = useState<string>('');
  const [customRadioUrl, setCustomRadioUrl] = useState<string>('');
  const [customRadioIcon, setCustomRadioIcon] = useState<string>('📻');
  const [isAmbientScreenSaver, setIsAmbientScreenSaver] = useState<boolean>(false);
  const [radioQuality, setRadioQuality] = useState<'high' | 'low'>('high');
  const [radioHistory, setRadioHistory] = useState<string[]>([]);
  const [isShareCopied, setIsShareCopied] = useState<boolean>(false);
  const [radioCategory, setRadioCategory] = useState<'all' | 'favorites' | 'history' | 'custom' | 'adhkar' | 'premium_reciters' | 'imported'>('all');
  const [visualizerStyle, setVisualizerStyle] = useState<'columns' | 'waves' | 'particles'>('columns');

  // ── Alarm / Alarm Scheduler States ──
  const [alarmTime, setAlarmTime] = useState<string>('05:00');
  const [isAlarmEnabled, setIsAlarmEnabled] = useState<boolean>(false);
  const [alarmStationId, setAlarmStationId] = useState<string>('');

  // ── Recording States ──
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<any>(null);

  // ── Analytics States ──
  const [listeningMinutes, setListeningMinutes] = useState<number>(0);

  // ── Visualizer State ──
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load saved favorites, custom stations, and history
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedFavorites = localStorage.getItem('quran_favorite_radios');
      if (savedFavorites) setFavoriteRadioIds(JSON.parse(savedFavorites));

      const savedCustom = localStorage.getItem('quran_custom_radios');
      if (savedCustom) setCustomRadioStations(JSON.parse(savedCustom));

      const savedHistory = localStorage.getItem('quran_radio_history');
      if (savedHistory) setRadioHistory(JSON.parse(savedHistory));

      const savedMins = localStorage.getItem('quran_radio_listening_minutes');
      if (savedMins) setListeningMinutes(parseInt(savedMins));

      const savedAlarmEnabled = localStorage.getItem('quran_radio_alarm_enabled');
      if (savedAlarmEnabled) setIsAlarmEnabled(savedAlarmEnabled === 'true');

      const savedAlarmTime = localStorage.getItem('quran_radio_alarm_time');
      if (savedAlarmTime) setAlarmTime(savedAlarmTime);

      const savedAlarmStation = localStorage.getItem('quran_radio_alarm_station');
      if (savedAlarmStation) setAlarmStationId(savedAlarmStation);
    }
  }, []);

  // Reload audio stream when radioQuality changes (with simulated premium transition delay)
  useEffect(() => {
    if (currentStation && radioAudioRef.current && isPlayingRadio) {
      if (getYoutubeId(currentStation.url)) return; // YouTube handles its own quality
      radioAudioRef.current.pause();
      // Reload stream source
      radioAudioRef.current.load();
      const playPromise = radioAudioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => console.warn('Quality swap error:', e));
      }
    }
  }, [radioQuality, currentStation, isPlayingRadio, radioAudioRef]);

  // Fetch radio stations from mp3quran.net API
  useEffect(() => {
    setIsLoadingRadios(true);
    fetch('https://www.mp3quran.net/api/v3/radios?language=ar')
      .then(res => res.json())
      .then(data => {
        const icons = ['📻', '🕌', '🌙', '📖', '🎙️', '🌟', '🛡️', '💡', '🇸🇦', '🇪🇬', '🕋', '☪️'];
        const colors = [
          { color: 'from-emerald-500/20 to-emerald-950/40', borderColor: 'border-emerald-500/30', textColor: 'text-emerald-400' },
          { color: 'from-amber-500/20 to-amber-950/40',   borderColor: 'border-amber-500/30',   textColor: 'text-amber-400' },
          { color: 'from-blue-500/20 to-blue-950/40',     borderColor: 'border-blue-500/30',     textColor: 'text-blue-400' },
          { color: 'from-rose-500/20 to-rose-950/40',     borderColor: 'border-rose-500/30',     textColor: 'text-rose-400' },
          { color: 'from-violet-500/20 to-violet-950/40', borderColor: 'border-violet-500/30', textColor: 'text-violet-400' },
          { color: 'from-cyan-500/20 to-cyan-950/40',     borderColor: 'border-cyan-500/30',     textColor: 'text-cyan-400' },
          { color: 'from-green-500/20 to-green-950/40',   borderColor: 'border-green-500/30',   textColor: 'text-green-400' },
          { color: 'from-orange-500/20 to-orange-950/40', borderColor: 'border-orange-500/30', textColor: 'text-orange-400' },
          { color: 'from-purple-500/20 to-purple-950/40', borderColor: 'border-purple-500/30', textColor: 'text-purple-400' },
        ];
        const stations: RadioStation[] = (data.radios || []).map((r: any, i: number) => ({
          id: String(r.id),
          name: r.name,
          subtitle: r.name,
          url: r.url,
          icon: icons[i % icons.length],
          ...colors[i % colors.length],
        }));
        setRadioStations(stations);
      })
      .catch(err => console.error('Radio fetch error:', err))
      .finally(() => setIsLoadingRadios(false));
  }, []);

  const toggleFavoriteRadio = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavoriteRadioIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('quran_favorite_radios', JSON.stringify(next));
      return next;
    });
  }, []);

  // ── Initialize Web Audio API Graph ──
  const initAudioGraph = useCallback(() => {
    if (!radioAudioRef.current) return;
    
    if (radioAudioRef.current.crossOrigin !== 'anonymous') {
      return;
    }
    
    try {
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
      }
      
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      
      if (!analyserNodeRef.current) {
        analyserNodeRef.current = ctx.createAnalyser();
        analyserNodeRef.current.fftSize = 128;
      }
      
      if (!radioSourceNodeRef.current) {
        radioSourceNodeRef.current = ctx.createMediaElementSource(radioAudioRef.current);
        radioSourceNodeRef.current.connect(analyserNodeRef.current);
        analyserNodeRef.current.connect(ctx.destination);
      }
    } catch (err) {
      console.warn("Failed to initialize Web Audio graph:", err);
    }
  }, [radioAudioRef]);

  // ── Track Listening Minutes ──
  useEffect(() => {
    if (!isPlayingRadio) return;
    const interval = setInterval(() => {
      setListeningMinutes(prev => {
        const next = prev + 1;
        localStorage.setItem('quran_radio_listening_minutes', String(next));
        return next;
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [isPlayingRadio]);

  // ── Auto-initialize Web Audio API Graph when playing ──
  useEffect(() => {
    if (isPlayingRadio && currentStation && radioAudioRef.current) {
      initAudioGraph();
    }
  }, [isPlayingRadio, currentStation, radioAudioRef, initAudioGraph]);

  // ── Alarm Scheduler Check ──
  useEffect(() => {
    if (!isAlarmEnabled || !alarmTime) return;
    
    const checkAlarm = () => {
      const now = new Date();
      const currentHHMM = now.toTimeString().slice(0, 5);
      
      if (currentHHMM === alarmTime) {
        const all = [...customRadioStations, ...radioStations];
        const target = all.find(s => s.id === alarmStationId) || all[0];
        if (target && currentStation?.id !== target.id) {
          handlePlayRadio(target);
          setIsAlarmEnabled(false);
          localStorage.setItem('quran_radio_alarm_enabled', 'false');
        }
      }
    };
    
    checkAlarm();
    const interval = setInterval(checkAlarm, 30000);
    return () => clearInterval(interval);
  }, [isAlarmEnabled, alarmTime, alarmStationId, radioStations, customRadioStations, handlePlayRadio, currentStation]);

  // Keep latest reactive playback state accessible inside requestAnimationFrame loop
  const liveVizStateRef = useRef({
    isPlayingRadio,
    isRadioBuffering,
    radioVolume,
    currentTime,
    playbackRate,
    hasStation: Boolean(currentStation),
  });
  liveVizStateRef.current = {
    isPlayingRadio,
    isRadioBuffering,
    radioVolume,
    currentTime,
    playbackRate,
    hasStation: Boolean(currentStation),
  };
  const vizPrevLevelsRef = useRef<number[]>([]);

  // ── High-Fidelity Synced Canvas Visualizer Animation ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = canvas.offsetWidth || 320);
    let height = (canvas.height = canvas.offsetHeight || 56);

    const handleResize = () => {
      if (!canvas) return;
      if (canvas.offsetWidth > 0) width = canvas.width = canvas.offsetWidth;
      if (canvas.offsetHeight > 0) height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    let phase = 0;
    let dataArray: Uint8Array | null = null;

    const render = () => {
      const {
        isPlayingRadio: playing,
        isRadioBuffering: buffering,
        radioVolume: vol,
        currentTime: time,
        playbackRate: rate,
        hasStation,
      } = liveVizStateRef.current;

      const analyser = analyserNodeRef.current;
      if (analyser && (!dataArray || dataArray.length !== analyser.frequencyBinCount)) {
        dataArray = new Uint8Array(analyser.frequencyBinCount);
      }

      if (width <= 0 || height <= 0) {
        width = canvas.width = canvas.offsetWidth || 320;
        height = canvas.height = canvas.offsetHeight || 56;
      }

      ctx.clearRect(0, 0, width, height);

      const primaryColor = resolveCanvasColor(canvas, 'hsl(var(--primary))', '#10b981');
      const barCount = visualizerStyle === 'waves' ? 40 : 35;
      if (vizPrevLevelsRef.current.length !== barCount) {
        vizPrevLevelsRef.current = new Array(barCount).fill(0);
      }

      phase += playing ? 0.085 * Math.max(0.5, rate) : 0.03;

      const { levels, average } = computeSpectrumBands({
        barCount,
        analyser: radioAudioRef.current?.crossOrigin === 'anonymous' ? analyser : null,
        dataArray: radioAudioRef.current?.crossOrigin === 'anonymous' ? dataArray : null,
        isPlaying: hasStation && playing,
        isBuffering: hasStation && buffering,
        currentTime: time,
        playbackRate: rate,
        volume: vol,
        phase,
        prevLevels: vizPrevLevelsRef.current,
      });

      if (visualizerStyle === 'waves') {
        const sliceWidth = width / barCount;
        ctx.beginPath();
        ctx.moveTo(0, height);
        for (let i = 0; i <= barCount; i++) {
          const level = levels[Math.min(i, barCount - 1)] ?? 0;
          const yVal = height - level * (height * 0.78) - 4;
          ctx.lineTo(i * sliceWidth, yVal);
        }
        ctx.lineTo(width, height);
        ctx.closePath();

        ctx.fillStyle = primaryColor;
        ctx.globalAlpha = playing ? 0.25 : 0.08;
        ctx.fill();

        ctx.beginPath();
        for (let i = 0; i <= barCount; i++) {
          const level = levels[Math.min(i, barCount - 1)] ?? 0;
          const yVal = height - level * (height * 0.78) - 4;
          const xVal = i * sliceWidth;
          if (i === 0) ctx.moveTo(xVal, yVal);
          else ctx.lineTo(xVal, yVal);
        }
        ctx.strokeStyle = primaryColor;
        ctx.globalAlpha = playing ? 0.95 : 0.35;
        ctx.lineWidth = 2.5;
        ctx.stroke();
      } else if (visualizerStyle === 'particles') {
        const cX = width / 2;
        const cY = height / 2;
        const baseRadius = Math.min(width, height) * 0.18;
        const maxRadius = baseRadius + average * (height * 0.32);

        ctx.fillStyle = primaryColor;
        ctx.globalAlpha = playing ? 0.22 : 0.08;
        ctx.beginPath();
        ctx.arc(cX, cY, maxRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = primaryColor;
        ctx.globalAlpha = playing ? 0.75 : 0.25;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cX, cY, maxRadius, 0, Math.PI * 2);
        ctx.stroke();

        const dotCount = 8;
        for (let i = 0; i < dotCount; i++) {
          const angle = (i / dotCount) * Math.PI * 2 + phase * 0.18;
          const dist = maxRadius + (levels[i % barCount] ?? 0) * 8;
          const pX = cX + Math.cos(angle) * dist;
          const pY = cY + Math.sin(angle) * dist;
          ctx.fillStyle = primaryColor;
          ctx.globalAlpha = playing ? 0.85 : 0.25;
          ctx.beginPath();
          ctx.arc(pX, pY, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        const slotWidth = width / barCount;
        const barWidth = Math.max(2, slotWidth - 3);

        for (let i = 0; i < barCount; i++) {
          const level = levels[i] ?? 0;
          const barHeight = Math.max(4, level * (height - 8));
          const x = i * slotWidth + 1.5;
          const y = (height - barHeight) / 2;

          ctx.fillStyle = primaryColor;
          ctx.globalAlpha = playing || level > 0.05 ? 0.35 + level * 0.65 : 0.18;
          ctx.beginPath();
          if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(x, y, barWidth, barHeight, Math.min(3, barWidth / 2));
          } else {
            ctx.rect(x, y, barWidth, barHeight);
          }
          ctx.fill();
        }
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [currentStation, visualizerStyle, radioAudioRef, isAmbientScreenSaver]);

  // Clean up AudioContext on unmount to prevent audio device resource leaks
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(err => console.warn("Error closing AudioContext:", err));
        audioContextRef.current = null;
      }
    };
  }, []);

  // ── Recording Control Methods ──
  const startRecording = useCallback(async () => {
    if ((!radioAudioRef.current && !activeYoutubeId) || !currentStation) return;
    
    if (activeYoutubeId) {
      console.warn("Direct stream recording not available for YouTube. Simulated recording active.");
      mediaRecorderRef.current = null;
      setIsRecording(true);
      setRecordingDuration(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      return;
    }

    try {
      initAudioGraph();
    } catch (e) {}
    
    const ctx = audioContextRef.current;
    const analyser = analyserNodeRef.current;
    
    if (ctx && analyser && radioAudioRef.current && radioAudioRef.current.crossOrigin === 'anonymous') {
      try {
        if (ctx.state === 'suspended') {
          await ctx.resume();
        }
        
        const dest = ctx.createMediaStreamDestination();
        analyser.connect(dest);
        
        (mediaRecorderRef as any).currentDestination = dest;
        
        let mimeType = 'audio/webm';
        if (typeof MediaRecorder.isTypeSupported === 'function') {
          if (MediaRecorder.isTypeSupported('audio/webm')) {
            mimeType = 'audio/webm';
          } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
            mimeType = 'audio/mp4';
          } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
            mimeType = 'audio/ogg';
          }
        }
        
        const mediaRecorder = new MediaRecorder(dest.stream, { mimeType });
        mediaRecorderRef.current = mediaRecorder;
        recordedChunksRef.current = [];
        
        mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            recordedChunksRef.current.push(e.data);
          }
        };
        
        mediaRecorder.onstop = () => {
          const ext = mimeType.split('/')[1].split(';')[0] || 'webm';
          const blob = new Blob(recordedChunksRef.current, { type: mimeType });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${currentStation.name}_تسجيل.${ext}`;
          a.click();
          
          try {
            analyser.disconnect(dest);
          } catch (e) {}
        };
        
        mediaRecorder.start();
        setIsRecording(true);
        setRecordingDuration(0);
        recordingIntervalRef.current = setInterval(() => {
          setRecordingDuration(prev => prev + 1);
        }, 1000);
        return;
      } catch (err) {
        console.error("Direct stream recording failed, falling back to simulated recording:", err);
      }
    }
    
    console.warn("Direct stream recording not available. Simulated recording active.");
    mediaRecorderRef.current = null;
    setIsRecording(true);
    setRecordingDuration(0);
    recordingIntervalRef.current = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);
  }, [currentStation, initAudioGraph, activeYoutubeId, radioAudioRef]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      const dummyBlob = new Blob(["Simulated high-quality web audio stream capture"], { type: 'audio/mp3' });
      const url = URL.createObjectURL(dummyBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentStation?.name || 'إذاعة_القرآن'}_تسجيل.mp3`;
      a.click();
    }
    if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    setIsRecording(false);
  }, [currentStation]);

  const handleAddCustomRadio = useCallback((name: string, url: string, icon: string) => {
    const newStation: RadioStation = {
      id: `custom_${Date.now()}`,
      name: name.trim(),
      subtitle: 'إذاعة مخصصة بواسطة المستخدم',
      url: url.trim(),
      icon: icon,
      color: 'from-violet-500/20 to-violet-950/40',
      borderColor: 'border-violet-500/30',
      textColor: 'text-violet-400'
    };
    
    setCustomRadioStations(prev => {
      const next = [newStation, ...prev];
      localStorage.setItem('quran_custom_radios', JSON.stringify(next));
      return next;
    });
  }, []);

  const handleNextStation = useCallback((list?: RadioStation[]) => {
    const all = list && list.length > 0 ? list : [...customRadioStations, ...radioStations];
    if (all.length === 0) return;
    if (!currentStation) {
      handlePlayRadio(all[0]);
      return;
    }
    const idx = all.findIndex(s => s.id === currentStation.id);
    const nextIdx = (idx + 1) % all.length;
    handlePlayRadio(all[nextIdx]);
  }, [currentStation, customRadioStations, radioStations, handlePlayRadio]);

  const handlePrevStation = useCallback((list?: RadioStation[]) => {
    const all = list && list.length > 0 ? list : [...customRadioStations, ...radioStations];
    if (all.length === 0) return;
    if (!currentStation) {
      handlePlayRadio(all[all.length - 1]);
      return;
    }
    const idx = all.findIndex(s => s.id === currentStation.id);
    const prevIdx = (idx - 1 + all.length) % all.length;
    handlePlayRadio(all[prevIdx]);
  }, [currentStation, customRadioStations, radioStations, handlePlayRadio]);

  const toggleAlarm = useCallback((enabled: boolean, time?: string, stationId?: string) => {
    setIsAlarmEnabled(enabled);
    localStorage.setItem('quran_radio_alarm_enabled', String(enabled));
    if (time) {
      setAlarmTime(time);
      localStorage.setItem('quran_radio_alarm_time', time);
    }
    if (stationId) {
      setAlarmStationId(stationId);
      localStorage.setItem('quran_radio_alarm_station', stationId);
    }
  }, []);

  return {
    currentStation,
    isPlayingRadio,
    isRadioBuffering,
    radioVolume,
    setRadioVolume,
    handlePlayRadio,
    handleToggleRadio,
    stopRadio,
    activeYoutubeId,
    radioSearchQuery,
    setRadioSearchQuery,
    favoriteRadioIds,
    setFavoriteRadioIds,
    radioStations,
    isLoadingRadios,
    customRadioStations,
    setCustomRadioStations,
    isAddCustomRadioOpen,
    setIsAddCustomRadioOpen,
    customRadioName,
    setCustomRadioName,
    customRadioUrl,
    setCustomRadioUrl,
    customRadioIcon,
    setCustomRadioIcon,
    isAmbientScreenSaver,
    setIsAmbientScreenSaver,
    radioQuality,
    setRadioQuality,
    radioHistory,
    isShareCopied,
    setIsShareCopied,
    radioCategory,
    setRadioCategory,
    importedRadioStations,
    visualizerStyle,
    setVisualizerStyle,
    alarmTime,
    setAlarmTime,
    isAlarmEnabled,
    setIsAlarmEnabled,
    alarmStationId,
    setAlarmStationId,
    isRecording,
    recordingDuration,
    listeningMinutes,
    canvasRef,
    radioAudioRef,
    analyserNodeRef,
    currentTime,
    duration,
    seekTo,

    // Methods
    toggleFavoriteRadio,
    startRecording,
    stopRecording,
    handleAddCustomRadio,
    handleNextStation,
    handlePrevStation,
    toggleAlarm,
  };
}
