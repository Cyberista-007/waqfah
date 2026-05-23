'use client';

import React, { useState } from 'react';
import { LiquidImage, Hotspot } from '@/components/ui/liquid-image';
import { 
  Sliders, Image as ImageIcon, Video, Maximize2, Sparkles, 
  RefreshCw, Trash2, Plus, ArrowLeft, Layers, Compass
} from 'lucide-react';
import Link from 'next/link';

const PRESET_IMAGES = [
  {
    name: 'المسجد الأقصى - القدس',
    src: '/palestine_gallery_jerusalem_old_city.png',
    alt: 'القدس القديمة ومسجد قبة الصخرة'
  },
  {
    name: 'غروب الشمس في غزة',
    src: '/palestine_gallery_gaza_sunset.png',
    alt: 'غروب الشمس الجميل على ساحل غزة'
  },
  {
    name: 'مسجد المدينة المنورة القديم',
    src: '/madinah_early_mosque_cinematic_1777413331481.png',
    alt: 'رسم سينمائي للمسجد النبوي في المدينة المنورة'
  },
  {
    name: 'أشجار الزيتون الفلسطينية',
    src: '/palestine_landscape_olive_trees.png',
    alt: 'شجر الزيتون المبارك في تلال فلسطين'
  },
  {
    name: 'نقوش هندسية إسلامية ذهبية',
    src: '/islamic_geometric_pattern_gold_cinematic_1777414372644.png',
    alt: 'فن الزخرفة الإسلامية باللون الذهبي'
  }
];

const PRESET_VIDEOS = [
  {
    name: 'تموجات الألوان التجريدية',
    src: 'https://framerusercontent.com/assets/MLWPbW1dUQawJLhhun3dBwpgJak.mp4'
  },
  {
    name: 'حبر سائل متدفق',
    src: 'https://assets.mixkit.co/videos/preview/mixkit-liquid-ink-swirling-underwater-43187-large.mp4'
  }
];

export default function LiquidImagePlayground() {
  const [sourceType, setSourceType] = useState<'image' | 'video'>('image');
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [selectedVidIndex, setSelectedVidIndex] = useState(0);
  const [strength, setStrength] = useState(0.12);
  const [speed, setSpeed] = useState(0.15);
  const [fit, setFit] = useState<'cover' | 'contain' | 'fill'>('cover');
  const [borderRadius, setBorderRadius] = useState(24);
  const [hotspots, setHotspots] = useState<Hotspot[]>([
    { x: 0.3, y: 0.3 },
    { x: 0.7, y: 0.6 }
  ]);

  const activeImage = PRESET_IMAGES[selectedImgIndex];
  const activeVideo = PRESET_VIDEOS[selectedVidIndex];

  const handleAddHotspot = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = parseFloat(((e.clientX - rect.left) / rect.width).toFixed(3));
    const y = parseFloat(((e.clientY - rect.top) / rect.height).toFixed(3));

    if (hotspots.length >= 8) {
      // Remove first and add new (circular buffer of 8 max)
      setHotspots([...hotspots.slice(1), { x, y }]);
    } else {
      setHotspots([...hotspots, { x, y }]);
    }
  };

  const handleClearHotspots = () => {
    setHotspots([]);
  };

  const handleRandomHotspots = () => {
    const randoms = Array.from({ length: 3 }, () => ({
      x: parseFloat(Math.random().toFixed(2)),
      y: parseFloat(Math.random().toFixed(2))
    }));
    setHotspots(randoms);
  };

  return (
    <div className="min-h-screen bg-[#08080c] text-zinc-100 flex flex-col relative overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full blur-[140px] bg-indigo-500/10 opacity-60 pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full blur-[160px] bg-violet-600/10 opacity-40 pointer-events-none" />

      {/* Header */}
      <header className="border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10 text-zinc-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-400 animate-spin-slow" />
              <span>لوحة تجارب التموج السائل</span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-bold">WebGL</span>
            </h1>
            <p className="text-[11px] text-zinc-400 font-medium">مؤثر تفاعلي سائل للصور والفيديوهات مع كشف الألوان ونقاط التركيز</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
          <span>تحريك الفأرة أو اللمس لتجربة المؤثر المائي</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 max-w-7xl mx-auto w-full z-10">
        
        {/* Left Control Panel */}
        <section className="lg:col-span-4 flex flex-col gap-5 bg-zinc-950/60 border border-white/5 rounded-3xl p-5 backdrop-blur-xl shadow-2xl h-fit">
          
          {/* Controls Title */}
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center gap-2 font-bold text-sm text-zinc-200">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>إعدادات العرض</span>
            </div>
            <button 
              onClick={() => {
                setStrength(0.12);
                setSpeed(0.15);
                setFit('cover');
                setBorderRadius(24);
                setHotspots([{ x: 0.3, y: 0.3 }, { x: 0.7, y: 0.6 }]);
              }}
              className="text-[10px] font-bold text-zinc-400 hover:text-indigo-400 transition-colors flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>إعادة تعيين</span>
            </button>
          </div>

          {/* Source Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-black text-zinc-400 uppercase tracking-wider">مصدر المحتوى</label>
            <div className="grid grid-cols-2 gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
              <button 
                onClick={() => setSourceType('image')}
                className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${sourceType === 'image' ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-200'}`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>صورة</span>
              </button>
              <button 
                onClick={() => setSourceType('video')}
                className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${sourceType === 'video' ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-200'}`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>فيديو</span>
              </button>
            </div>
          </div>

          {/* Strength Slider */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs font-bold text-zinc-300">
              <span className="text-zinc-400">قوة التموج (Strength)</span>
              <span className="text-indigo-400 font-mono">{strength.toFixed(2)}</span>
            </div>
            <input 
              type="range" 
              min="0.01" 
              max="0.40" 
              step="0.01" 
              value={strength} 
              onChange={e => setStrength(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 bg-white/5 rounded-lg h-1.5 appearance-none cursor-pointer"
            />
          </div>

          {/* Speed Slider */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs font-bold text-zinc-300">
              <span className="text-zinc-400">سرعة الحركة (Speed)</span>
              <span className="text-indigo-400 font-mono">{speed.toFixed(2)}</span>
            </div>
            <input 
              type="range" 
              min="0.01" 
              max="0.80" 
              step="0.01" 
              value={speed} 
              onChange={e => setSpeed(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 bg-white/5 rounded-lg h-1.5 appearance-none cursor-pointer"
            />
          </div>

          {/* Fit Mode Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-black text-zinc-400 uppercase tracking-wider">ملاءمة الأبعاد (Fit)</label>
            <div className="grid grid-cols-3 gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
              {(['cover', 'contain', 'fill'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setFit(mode)}
                  className={`py-1.5 rounded-lg text-[10px] font-bold capitalize transition-all ${fit === mode ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-extrabold' : 'text-zinc-400 hover:text-zinc-200'}`}
                >
                  {mode === 'cover' ? 'تغطية' : mode === 'contain' ? 'احتواء' : 'تمدد'}
                </button>
              ))}
            </div>
          </div>

          {/* Border Radius */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs font-bold text-zinc-300">
              <span className="text-zinc-400">تدوير الحواف (Radius)</span>
              <span className="text-indigo-400 font-mono">{borderRadius}px</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="64" 
              step="1" 
              value={borderRadius} 
              onChange={e => setBorderRadius(parseInt(e.target.value))}
              className="w-full accent-indigo-500 bg-white/5 rounded-lg h-1.5 appearance-none cursor-pointer"
            />
          </div>

          {/* Hotspots Section */}
          <div className="flex flex-col gap-3 pt-3 border-t border-white/5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>نقاط كشف الألوان ({hotspots.length}/8)</span>
              </label>
              <div className="flex gap-2">
                <button 
                  onClick={handleRandomHotspots}
                  className="text-[9px] font-bold bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/5 px-2 py-1 rounded-md transition-colors"
                >
                  عشوائي
                </button>
                <button 
                  onClick={handleClearHotspots}
                  className="text-[9px] font-bold text-rose-400 hover:text-rose-300 flex items-center gap-0.5"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>مسح الكل</span>
                </button>
              </div>
            </div>
            
            <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">
              النقاط تحدد مراكز دائرية دائمة تظهر فيها الألوان الكاملة للصور وتتفاعل مع موجات الماء. انقر فوق الصورة بالجهة اليمنى لإضافة نقطة جديدة.
            </p>

            {hotspots.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                {hotspots.map((h, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-bold text-indigo-300"
                  >
                    <span>نقطة {idx + 1} ({Math.round(h.x * 100)}%, {Math.round(h.y * 100)}%)</span>
                    <button 
                      onClick={() => setHotspots(hotspots.filter((_, i) => i !== idx))}
                      className="hover:text-rose-400 p-0.5"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-2 rounded-xl bg-white/[0.02] border border-dashed border-white/5 text-[9px] text-zinc-600 font-bold">
                لا توجد نقاط كشف حالية. انقر فوق الصورة لإضافة نقاط.
              </div>
            )}
          </div>

        </section>

        {/* Right Canvas and Asset Selectors */}
        <section className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Interactive WebGL Canvas Box */}
          <div className="flex-1 bg-zinc-950/40 border border-white/5 rounded-3xl p-4 flex flex-col gap-3 relative min-h-[400px] lg:min-h-[500px]">
            
            {/* Overlay Info */}
            <div className="absolute top-6 right-6 z-20 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full text-[10px] font-bold text-zinc-300 pointer-events-none flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>مساحة تفاعلية مائية</span>
            </div>

            {/* Canvas Container */}
            <div 
              className="flex-1 w-full relative group cursor-crosshair rounded-2xl overflow-hidden bg-[#0c0c14] border border-white/5 select-none"
              onClick={handleAddHotspot}
            >
              <LiquidImage 
                sourceType={sourceType}
                image={activeImage}
                video={activeVideo.src}
                strength={strength}
                speed={speed}
                fit={fit}
                borderRadius={0}
                hotspots={hotspots}
                className="w-full h-full absolute inset-0"
              />

              {/* Hotspots Visual Markers on Canvas */}
              {hotspots.map((h, idx) => (
                <div 
                  key={idx}
                  className="absolute w-4 h-4 -ml-2 -mt-2 rounded-full border border-indigo-400 bg-indigo-500/20 backdrop-blur-[1px] flex items-center justify-center text-[8px] font-black text-indigo-200 pointer-events-none shadow-lg animate-pulse"
                  style={{ left: `${h.x * 100}%`, top: `${h.y * 100}%` }}
                >
                  {idx + 1}
                </div>
              ))}
            </div>

            {/* Bottom Note */}
            <div className="flex justify-between items-center text-[10px] text-zinc-500 px-1 font-bold">
              <span>انقر لإضافة نقطة كشف ألوان مخصصة</span>
              <span>دقة شاشة عالية الكثافة (DPI)</span>
            </div>

          </div>

          {/* Preset Selectors */}
          <div className="bg-zinc-950/40 border border-white/5 rounded-3xl p-5 backdrop-blur-xl">
            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>المحتويات الجاهزة للتجربة</span>
            </h3>

            {sourceType === 'image' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {PRESET_IMAGES.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImgIndex(index)}
                    className={`flex flex-col gap-2 p-2 rounded-2xl border text-right transition-all group overflow-hidden ${selectedImgIndex === index ? 'bg-indigo-600/10 border-indigo-500/40 shadow-lg' : 'bg-white/[0.01] border-white/5 hover:bg-white/5'}`}
                  >
                    <div className="aspect-[4/3] rounded-lg overflow-hidden relative border border-white/5">
                      <img 
                        src={img.src} 
                        alt={img.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <span className="text-[10px] font-bold text-zinc-300 truncate w-full text-center block">{img.name}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRESET_VIDEOS.map((vid, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedVidIndex(index)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border text-right transition-all group ${selectedVidIndex === index ? 'bg-indigo-600/10 border-indigo-500/40 shadow-lg' : 'bg-white/[0.01] border-white/5 hover:bg-white/5'}`}
                  >
                    <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center shrink-0">
                      <Video className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="flex flex-col gap-0.5 truncate">
                      <span className="text-xs font-bold text-zinc-200 truncate">{vid.name}</span>
                      <span className="text-[9px] text-zinc-500 truncate">{vid.src}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

        </section>

      </main>
    </div>
  );
}
