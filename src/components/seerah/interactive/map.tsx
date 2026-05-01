'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Info, Compass, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

const locations = [
    { id: 'makkah', name: 'مكة المكرمة', x: '55%', y: '65%', desc: 'منبع الرسالة، مهبط الوحي، ومسقط رأس النبي ﷺ. تضم الكعبة المشرفة وغار حراء.' },
    { id: 'madinah', name: 'المدينة المنورة', x: '45%', y: '45%', desc: 'طابة الطيبة، مأرز الإيمان، وعاصمة الإسلام الأولى. احتضنت النبي وأصحابه بعد الهجرة.' },
    { id: 'badr', name: 'بدر', x: '42%', y: '52%', desc: 'موقع أول معركة كبرى في الإسلام (2 هـ)، حيث نصر الله المؤمنين بمدد من السماء.' },
    { id: 'abyssinia', name: 'الحبشة', x: '15%', y: '85%', desc: 'أرض الهجرة الأولى (5 للبعثة)، حيث هاجر الصحابة لملك لا يُظلم عنده أحد.' },
    { id: 'taif', name: 'الطائف', x: '58%', y: '68%', desc: 'رحلة الصبر والأمل، حيث ذهب النبي لدعوة أهلها فواجه الصدّ ولكن دعا لهم بالهداية.' },
    { id: 'tabuk', name: 'تبوك', x: '35%', y: '25%', desc: 'أبعد نقطة وصل إليها النبي ﷺ في غزواته (9 هـ)، وكانت اختباراً عظيماً لليقين.' },
];

export function SeerahInteractiveMap() {
    const [selected, setSelected] = useState<string | null>(null);
    const [radarAngle, setRadarAngle] = useState(0);

    // Radar rotation
    useEffect(() => {
        let frame: number;
        const rotateRadar = () => {
            setRadarAngle(prev => (prev + 1) % 360);
            frame = requestAnimationFrame(rotateRadar);
        };
        frame = requestAnimationFrame(rotateRadar);
        return () => cancelAnimationFrame(frame);
    }, []);

    return (
        <section className="py-32 w-full px-4 md:px-8 lg:px-12 relative z-10" dir="rtl">
            <div className="relative aspect-[16/9] w-full max-h-[800px] border-y border-amber-900/30 bg-[#030303] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.9)] perspective-[2000px]">
                
                {/* 3D Map Container */}
                <motion.div 
                    className="absolute inset-0 transform-gpu"
                    initial={{ rotateX: 20 }}
                    animate={{ rotateX: selected ? 0 : 20 }}
                    transition={{ type: "spring", stiffness: 50, damping: 20 }}
                    style={{ transformStyle: "preserve-3d" }}
                >
                    {/* Topographic Map Background (Conceptual SVG) */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                        <svg viewBox="0 0 1000 600" className="w-full h-full fill-transparent stroke-amber-500/30 stroke-1" style={{ filter: "drop-shadow(0 0 8px rgba(245,158,11,0.5))" }}>
                            {/* Contour Lines */}
                            <path d="M400 100 C500 150, 600 200, 550 300 C500 400, 450 500, 500 600 L300 600 C250 500, 200 400, 250 300 C300 200, 350 150, 400 100" />
                            <path d="M420 120 C510 160, 580 210, 530 300 C490 380, 470 480, 510 580 L320 580 C270 480, 220 390, 270 300 C310 220, 360 160, 420 120" />
                            <path d="M700 300 C800 350, 850 400, 800 500 C750 600, 650 650, 600 600" />
                            <path d="M720 320 C800 360, 830 410, 780 490 C740 570, 660 630, 620 590" />
                            {/* Grid Lines */}
                            {Array.from({ length: 20 }).map((_, i) => (
                                <line key={`v-${i}`} x1={i * 50} y1="0" x2={i * 50} y2="600" className="stroke-amber-900/20" strokeWidth="0.5" />
                            ))}
                            {Array.from({ length: 12 }).map((_, i) => (
                                <line key={`h-${i}`} x1="0" y1={i * 50} x2="1000" y2={i * 50} className="stroke-amber-900/20" strokeWidth="0.5" />
                            ))}
                        </svg>
                    </div>

                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />

                    {/* Radar Sweep Effect */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                        <div 
                            className="w-[120%] aspect-square rounded-full origin-center"
                            style={{ 
                                background: 'conic-gradient(from 0deg, rgba(245, 158, 11, 0) 0%, rgba(245, 158, 11, 0.1) 80%, rgba(245, 158, 11, 0.4) 100%)',
                                transform: `rotate(${radarAngle}deg)` 
                            }}
                        />
                        <div className="absolute w-[100%] h-[100%] rounded-full border border-amber-500/10" />
                        <div className="absolute w-[70%] h-[70%] rounded-full border border-amber-500/10" />
                        <div className="absolute w-[40%] h-[40%] rounded-full border border-amber-500/10" />
                    </div>

                    {/* Location Holographic Pins */}
                    {locations.map((loc) => (
                        <div
                            key={loc.id}
                            className="absolute z-20 -translate-x-1/2 -translate-y-1/2 transform-gpu"
                            style={{ left: loc.x, top: loc.y, transform: 'translateZ(20px)' }}
                        >
                            <button
                                onClick={() => setSelected(selected === loc.id ? null : loc.id)}
                                className="relative flex flex-col items-center group/pin"
                            >
                                {/* Holographic Beam */}
                                <div className={cn(
                                    "absolute bottom-4 w-1 bg-gradient-to-t from-amber-500 to-transparent blur-[1px] transition-all duration-700 origin-bottom",
                                    selected === loc.id ? "h-24 opacity-80" : "h-12 opacity-30 group-hover:h-16 group-hover:opacity-60"
                                )} />
                                
                                <div className={cn(
                                    "relative w-10 h-10 rounded-full border-2 transition-all duration-500 flex items-center justify-center backdrop-blur-md shadow-[0_0_20px_rgba(245,158,11,0.3)] z-10",
                                    selected === loc.id ? "bg-amber-500 border-white scale-125" : "bg-black/80 border-amber-500 hover:scale-110"
                                )}>
                                    <Target className={cn(
                                        "absolute inset-0 w-full h-full opacity-30 animate-spin-slow transition-colors",
                                        selected === loc.id ? "text-black" : "text-amber-500"
                                    )} />
                                    <MapPin className={cn(
                                        "w-5 h-5 transition-colors relative z-10",
                                        selected === loc.id ? "text-black" : "text-amber-500"
                                    )} />
                                </div>
                                
                                {/* Label */}
                                <div className={cn(
                                    "absolute top-12 whitespace-nowrap px-4 py-2 rounded-xl bg-black/80 backdrop-blur-xl border border-amber-500/30 text-xs font-black text-amber-100 transition-all shadow-xl",
                                    selected === loc.id ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"
                                )}>
                                    {loc.name}
                                </div>
                            </button>
                            
                            {/* Base Pulse */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-amber-500/20 rounded-full animate-ping pointer-events-none" style={{ animationDuration: '3s' }} />
                        </div>
                    ))}
                </motion.div>

                {/* HUD Overlay */}
                <div className="absolute top-8 right-8 z-30 pointer-events-none">
                    <div className="flex items-center gap-5 bg-black/60 backdrop-blur-2xl p-6 rounded-[2rem] border border-amber-500/20 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                        <div className="relative w-12 h-12 flex items-center justify-center">
                            <Compass className="w-8 h-8 text-amber-500 relative z-10" />
                            <div className="absolute inset-0 border-2 border-amber-500/30 border-dashed rounded-full animate-spin-slow" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-amber-600 font-headline">الخريطة الجغرافية</h3>
                            <p className="text-amber-500/60 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">نظام تتبع السيرة النبوية النشط</p>
                        </div>
                    </div>
                </div>

                {/* Info Overlay (Holographic Panel) */}
                <AnimatePresence>
                    {selected && (
                        <motion.div
                            initial={{ opacity: 0, x: -50, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: -50, scale: 0.95 }}
                            className="absolute bottom-8 left-8 w-[400px] z-40 p-8 bg-gradient-to-br from-[#1a1410]/90 to-black/90 backdrop-blur-2xl border border-amber-500/30 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.8),inset_0_0_30px_rgba(245,158,11,0.1)]"
                        >
                            <div className="absolute top-0 right-10 w-20 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
                            <div className="absolute bottom-0 left-10 w-20 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

                            <div className="flex items-center gap-5 mb-6">
                                <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                                    <Info className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-3xl font-black text-white font-headline">
                                        {locations.find(l => l.id === selected)?.name}
                                    </h4>
                                    <div className="text-[9px] text-amber-500/60 font-mono tracking-widest mt-1">
                                        COORD: {locations.find(l => l.id === selected)?.x} / {locations.find(l => l.id === selected)?.y}
                                    </div>
                                </div>
                            </div>
                            <p className="text-white/70 text-lg leading-relaxed font-bold border-r-2 border-amber-500/30 pr-4">
                                {locations.find(l => l.id === selected)?.desc}
                            </p>
                            <button 
                                onClick={() => setSelected(null)}
                                className="mt-8 w-full py-3 rounded-xl bg-white/5 border border-white/10 text-amber-500 font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-colors"
                            >
                                إغلاق البيانات
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </section>
    );
}
