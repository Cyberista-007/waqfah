'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useDragControls, useMotionValue } from 'framer-motion';
import { Network, Search, LocateFixed, Crown, Shield, Star, Droplets } from 'lucide-react';
import { cn } from '@/lib/utils';

const LINEAGE_DATA = [
    { id: '1', name: 'إبراهيم', title: 'خليل الرحمن', type: 'prophet', level: 0, desc: 'أبو الأنبياء' },
    { id: '2', name: 'إسماعيل', title: 'الذبيح', type: 'prophet', level: 1, desc: 'جد العرب المستعربة' },
    { id: '3', name: 'عدنان', title: 'الجد الجامع', type: 'ancestor', level: 2, desc: 'إليه ينتهي النسب الثابت' },
    { id: '4', name: 'معد', title: '', type: 'ancestor', level: 3, desc: '' },
    { id: '5', name: 'نزار', title: '', type: 'ancestor', level: 4, desc: '' },
    { id: '6', name: 'مضر', title: '', type: 'ancestor', level: 5, desc: 'صاحب الصوت الحسن' },
    { id: '7', name: 'إلياس', title: '', type: 'ancestor', level: 6, desc: '' },
    { id: '8', name: 'مدركة', title: 'عامر', type: 'ancestor', level: 7, desc: '' },
    { id: '9', name: 'خزيمة', title: '', type: 'ancestor', level: 8, desc: '' },
    { id: '10', name: 'كنانة', title: '', type: 'ancestor', level: 9, desc: '' },
    { id: '11', name: 'النضر', title: 'قريش', type: 'tribe', level: 10, desc: 'أصل قبيلة قريش' },
    { id: '12', name: 'مالك', title: '', type: 'ancestor', level: 11, desc: '' },
    { id: '13', name: 'فهر', title: 'قريش الأوسط', type: 'ancestor', level: 12, desc: '' },
    { id: '14', name: 'غالب', title: '', type: 'ancestor', level: 13, desc: '' },
    { id: '15', name: 'لؤي', title: '', type: 'ancestor', level: 14, desc: '' },
    { id: '16', name: 'كعب', title: '', type: 'ancestor', level: 15, desc: 'كان يجمع قومه يوم الجمعة' },
    { id: '17', name: 'مرة', title: '', type: 'ancestor', level: 16, desc: '' },
    { id: '18', name: 'كلاب', title: 'حكيم', type: 'ancestor', level: 17, desc: '' },
    { id: '19', name: 'قصي', title: 'مجمع قريش', type: 'ancestor', level: 18, desc: 'جمع قريشاً في مكة' },
    { id: '20', name: 'عبد مناف', title: 'المغيرة', type: 'ancestor', level: 19, desc: 'سيد بطحاء مكة' },
    { id: '21', name: 'هاشم', title: 'عمرو', type: 'ancestor', level: 20, desc: 'أول من هشم الثريد للحجاج' },
    { id: '22', name: 'عبد المطلب', title: 'شيبة الحمد', type: 'grandfather', level: 21, desc: 'حافر زمزم وسيد مكة' },
    { id: '23', name: 'عبد الله', title: 'الذبيح الثاني', type: 'father', level: 22, desc: 'والد النبي ﷺ' },
    { id: '24', name: 'محمد ﷺ', title: 'رسول الله', type: 'messenger', level: 23, desc: 'خاتم الأنبياء والمرسلين' },
];

export function LineageTree() {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLDivElement>(null);
    const [zoom, setZoom] = useState(1);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const handleZoomIn = () => setZoom(z => Math.min(z + 0.2, 1.5));
    const handleZoomOut = () => setZoom(z => Math.max(z - 0.2, 0.4));
    const x = useMotionValue(0);
    const y = useMotionValue(-1800); // Start near the bottom for Prophet Muhammad

    const handleRecenter = () => {
        setZoom(1);
        x.set(0);
        y.set(-1800);
    };

    const getNodeStyle = (type: string) => {
        switch(type) {
            case 'messenger': return "bg-gradient-to-br from-amber-400 to-amber-600 border-amber-300 text-black shadow-[0_0_50px_rgba(245,158,11,0.8)] scale-125 z-30";
            case 'prophet': return "bg-gradient-to-br from-blue-800 to-blue-950 border-blue-400 text-blue-100 shadow-[0_0_20px_rgba(59,130,246,0.5)] z-20";
            case 'tribe': return "bg-gradient-to-br from-emerald-800 to-emerald-950 border-emerald-400 text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.5)] z-20";
            case 'grandfather': 
            case 'father': return "bg-gradient-to-br from-rose-900 to-red-950 border-rose-400 text-rose-100 shadow-lg z-10";
            default: return "bg-[#111] border-white/20 text-white/80 hover:bg-[#222] hover:border-amber-500/50 hover:text-amber-500";
        }
    };

    const getIcon = (type: string) => {
        switch(type) {
            case 'messenger': return <Crown className="w-5 h-5 text-black" />;
            case 'prophet': return <Star className="w-4 h-4 text-blue-300" />;
            case 'tribe': return <Shield className="w-4 h-4 text-emerald-300" />;
            case 'grandfather':
            case 'father': return <Droplets className="w-4 h-4 text-rose-300" />;
            default: return <div className="w-2 h-2 rounded-full bg-white/20" />;
        }
    };

    if (!isClient) return null;

    return (
        <section className="pt-24 pb-0 bg-transparent relative overflow-hidden" dir="rtl">
            {/* Background Details */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none" />
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-amber-900/10 rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[150px] pointer-events-none" />

            <div className="w-full px-4 md:px-8 lg:px-12 relative z-10 text-center mb-10">
                <div className="w-16 h-16 mx-auto bg-amber-500/10 rounded-[2rem] border border-amber-500/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                    <Network className="w-8 h-8 text-amber-500" />
                </div>
                <h2 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 font-headline mb-4">شجرة النسب الشريف</h2>
                <p className="text-white/40 text-lg font-bold">
                    خيار من خيار من خيار.. نسب طاهر متصل إلى إبراهيم عليه السلام. (اسحب الخريطة للتنقل)
                </p>
            </div>

            <div className="relative w-full h-[85vh] min-h-[700px] border-y border-white/10 bg-[#050505] overflow-hidden shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]">
                
                {/* HUD Controls */}
                <div className="absolute top-8 right-8 z-50 flex flex-col gap-3">
                    <button onClick={handleZoomIn} className="w-12 h-12 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all backdrop-blur-xl shadow-lg hover:scale-110">
                        <span className="text-2xl leading-none mb-1">+</span>
                    </button>
                    <button onClick={handleZoomOut} className="w-12 h-12 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all backdrop-blur-xl shadow-lg hover:scale-110">
                        <span className="text-3xl leading-none mb-1">-</span>
                    </button>
                    <button onClick={handleRecenter} className="w-12 h-12 mt-4 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500 hover:bg-amber-500/40 transition-all backdrop-blur-xl shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:scale-110 hover:rotate-90">
                        <LocateFixed className="w-5 h-5" />
                    </button>
                </div>

                {/* Draggable Canvas Window */}
                <div 
                    ref={containerRef}
                    className="absolute inset-0 cursor-grab active:cursor-grabbing overflow-hidden"
                >
                    <motion.div
                        ref={canvasRef}
                        drag
                        dragConstraints={{ top: -2200, left: -500, right: 500, bottom: 200 }}
                        dragElastic={0.1}
                        style={{ x, y, scale: zoom, originX: 0.5, originY: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="w-[2000px] h-[3000px] absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center justify-start pt-32"
                    >
                        {/* Connecting Golden Line (SVG) */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                            <defs>
                                <linearGradient id="goldLine" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="rgba(59,130,246,0.8)" />
                                    <stop offset="50%" stopColor="rgba(245,158,11,0.2)" />
                                    <stop offset="100%" stopColor="rgba(245,158,11,1)" />
                                </linearGradient>
                            </defs>
                            {LINEAGE_DATA.map((node, i) => {
                                if (i === 0) return null;
                                return (
                                    <motion.line 
                                        key={`line-${i}`}
                                        x1="1000" 
                                        y1={LINEAGE_DATA[i-1].level * 110 + 60} 
                                        x2="1000" 
                                        y2={node.level * 110 + 20} 
                                        stroke="url(#goldLine)" 
                                        strokeWidth="4"
                                        strokeDasharray="8 8"
                                        className="opacity-60"
                                    />
                                );
                            })}
                        </svg>

                        {/* Nodes */}
                        {LINEAGE_DATA.map((node, index) => (
                            <motion.div
                                key={node.id}
                                className={cn(
                                    "absolute left-1/2 -translate-x-1/2 min-w-[280px] p-4 rounded-3xl border-2 font-black transition-all duration-300 flex items-center gap-4 backdrop-blur-md",
                                    getNodeStyle(node.type)
                                )}
                                style={{
                                    top: node.level * 110,
                                    boxShadow: node.type === 'messenger' ? '0 0 50px rgba(245,158,11,0.6)' : undefined
                                }}
                                whileHover={{ scale: 1.05, zIndex: 50 }}
                            >
                                <div className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center shrink-0 border border-white/10 shadow-inner">
                                    {getIcon(node.type)}
                                </div>
                                <div className="flex flex-col text-right w-full">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-xl font-headline tracking-wide">{node.name}</span>
                                        <span className="text-[10px] opacity-50 bg-black/20 px-2 py-0.5 rounded-full">{node.level + 1}</span>
                                    </div>
                                    <div className="flex gap-2 text-xs mt-1">
                                        {node.title && <span className="opacity-80">{node.title}</span>}
                                        {node.title && node.desc && <span className="opacity-40">•</span>}
                                        {node.desc && <span className="opacity-60 truncate">{node.desc}</span>}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
                
                {/* Overlay Vignette */}
                <div className="absolute inset-0 pointer-events-none rounded-[3rem] shadow-[inset_0_0_100px_rgba(0,0,0,0.9)]" />
                
                {/* Scroll Indication */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none bg-black/60 px-6 py-2 rounded-full border border-white/10 backdrop-blur-md flex items-center gap-3 opacity-60">
                    <Search className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold text-white uppercase tracking-widest">اسحب لاستكشاف شجرة النسب</span>
                </div>
            </div>
        </section>
    );
}
