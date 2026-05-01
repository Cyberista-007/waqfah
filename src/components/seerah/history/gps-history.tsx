'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, ExternalLink, Info, Map as MapIcon, Compass } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface HistoricalLocation {
    id: string;
    title: string;
    historicalName: string;
    modernName: string;
    description: string;
    coordinates: { lat: number; lng: number };
    googleMapsUrl: string;
    imageUrl: string;
    category: 'revelation' | 'hijra' | 'battle' | 'landmark';
}

const LOCATIONS: HistoricalLocation[] = [
    {
        id: 'cave-hira',
        title: 'غار حراء',
        historicalName: 'غار حراء',
        modernName: 'جبل النور، مكة المكرمة',
        description: 'المكان الذي بدأ فيه نزول الوحي على النبي ﷺ حين كان يتعبد فيه. يقع في أعلى جبل النور ويطل على المسجد الحرام.',
        coordinates: { lat: 21.4572, lng: 39.8593 },
        googleMapsUrl: 'https://goo.gl/maps/Z8Xn9Z8Xn9Z8Xn9Z8',
        imageUrl: 'https://images.unsplash.com/photo-1591604129939-f1efa4d8f7ec?q=80&w=2070&auto=format&fit=crop',
        category: 'revelation'
    },
    {
        id: 'cave-thawr',
        title: 'غار ثور',
        historicalName: 'غار ثور',
        modernName: 'جبل ثور، مكة المكرمة',
        description: 'الغار الذي لجأ إليه النبي ﷺ وأبو بكر الصديق رضي الله عنه أثناء الهجرة النبوية لمدة ثلاث ليالٍ.',
        coordinates: { lat: 21.3789, lng: 39.8497 },
        googleMapsUrl: 'https://goo.gl/maps/Z8Xn9Z8Xn9Z8Xn9Z8',
        imageUrl: 'https://images.unsplash.com/photo-1621644781615-520c37951a70?q=80&w=1974&auto=format&fit=crop',
        category: 'hijra'
    },
    {
        id: 'badr-battlefield',
        title: 'ميدان معركة بدر',
        historicalName: 'بدر',
        modernName: 'محافظة بدر، المدينة المنورة',
        description: 'موقع أول معركة كبرى في الإسلام، حيث انتصر المسلمون على قريش. يضم المنطقة الآن مقبرة لشهداء بدر.',
        coordinates: { lat: 23.7745, lng: 38.7904 },
        googleMapsUrl: 'https://goo.gl/maps/Z8Xn9Z8Xn9Z8Xn9Z8',
        imageUrl: 'https://images.unsplash.com/photo-1542640244-7e67246cd4b1?q=80&w=2070&auto=format&fit=crop',
        category: 'battle'
    },
    {
        id: 'uhud-mountain',
        title: 'جبل أحد وجبل الرماة',
        historicalName: 'أحد',
        modernName: 'سيد الشهداء، المدينة المنورة',
        description: 'شهد جبل أحد معركة أحد الكبرى، ويقع بجانبه جبل الرماة ومقبرة سيد الشهداء حمزة رضي الله عنه ومن معه.',
        coordinates: { lat: 24.5034, lng: 39.6105 },
        googleMapsUrl: 'https://goo.gl/maps/Z8Xn9Z8Xn9Z8Xn9Z8',
        imageUrl: 'https://images.unsplash.com/photo-1590076215667-873d38354784?q=80&w=1920&auto=format&fit=crop',
        category: 'battle'
    },
    {
        id: 'quba-mosque',
        title: 'مسجد قباء',
        historicalName: 'قباء',
        modernName: 'حي قباء، المدينة المنورة',
        description: 'أول مسجد أسسه النبي ﷺ عند وصوله إلى المدينة المنورة، وله فضل كبير حيث تعد الصلاة فيه كعمرة.',
        coordinates: { lat: 24.4392, lng: 39.6172 },
        googleMapsUrl: 'https://goo.gl/maps/Z8Xn9Z8Xn9Z8Xn9Z8',
        imageUrl: 'https://images.unsplash.com/photo-1565552645632-d7c5f76a16be?q=80&w=1924&auto=format&fit=crop',
        category: 'landmark'
    },
    {
        id: 'saqifah',
        title: 'سقيفة بني ساعدة',
        historicalName: 'سقيفة بني ساعدة',
        modernName: 'حديقة السقيفة، المدينة المنورة',
        description: 'المكان الذي اجتمع فيه الصحابة بعد وفاة النبي ﷺ وتمت فيه مبايعة أبو بكر الصديق بالخلافة.',
        coordinates: { lat: 24.4712, lng: 39.6054 },
        googleMapsUrl: 'https://goo.gl/maps/Z8Xn9Z8Xn9Z8Xn9Z8',
        imageUrl: 'https://images.unsplash.com/photo-1590076215667-873d38354784?q=80&w=1920&auto=format&fit=crop',
        category: 'landmark'
    }
];

const CATEGORIES = [
    { id: 'all', label: 'الكل', icon: MapIcon },
    { id: 'revelation', label: 'بدء الوحي', icon: Info },
    { id: 'hijra', label: 'طريق الهجرة', icon: Compass },
    { id: 'battle', label: 'الغزوات', icon: MapPin },
    { id: 'landmark', label: 'المعالم', icon: Navigation },
];

export function GPSHistory() {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const filteredLocations = selectedCategory === 'all' 
        ? LOCATIONS 
        : LOCATIONS.filter(l => l.category === selectedCategory);

    return (
        <section className="py-20 px-6 relative overflow-hidden" dir="rtl">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div className="space-y-4">
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest"
                        >
                            <MapPin className="w-3.5 h-3.5" />
                            أين هم الآن؟
                        </motion.div>
                        <motion.h2 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl font-black text-white font-headline"
                        >
                            تتبع <span className="text-primary">الأثر النبوي</span> عبر الخريطة
                        </motion.h2>
                        <p className="text-muted-foreground text-lg max-w-2xl font-bold italic opacity-70">
                            استكشف المواقع التاريخية التي شهدت أحداث السيرة النبوية وكيف تبدو اليوم في عصرنا الحديث.
                        </p>
                    </div>

                    {/* Category Filter */}
                    <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map((cat) => (
                            <Button
                                key={cat.id}
                                variant={selectedCategory === cat.id ? 'default' : 'outline'}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={cn(
                                    "rounded-2xl px-6 h-12 font-black transition-all",
                                    selectedCategory === cat.id 
                                        ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105" 
                                        : "bg-white/5 border-white/10 hover:bg-white/10 text-white/60"
                                )}
                            >
                                <cat.icon className="w-4 h-4 me-2" />
                                {cat.label}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredLocations.map((location, idx) => (
                        <motion.div
                            key={location.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            onMouseEnter={() => setHoveredId(location.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            className="group relative"
                        >
                            <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:border-primary/30 flex flex-col h-full">
                                {/* Image Container */}
                                <div className="relative h-64 w-full overflow-hidden">
                                    <Image 
                                        src={location.imageUrl} 
                                        alt={location.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/20 to-transparent" />
                                    
                                    {/* Category Badge */}
                                    <div className="absolute top-4 right-4 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-black text-white/80 uppercase tracking-widest">
                                        {CATEGORIES.find(c => c.id === location.category)?.label}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-8 flex flex-col flex-1">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-2xl font-black text-white font-headline group-hover:text-primary transition-colors">{location.title}</h3>
                                            <div className="flex items-center gap-2 text-primary/60 text-xs font-bold mt-1">
                                                <Navigation className="w-3 h-3" />
                                                <span>{location.modernName}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-muted-foreground text-sm font-bold leading-relaxed mb-8 opacity-70 flex-1">
                                        {location.description}
                                    </p>

                                    <div className="flex items-center gap-3 mt-auto">
                                        <Button 
                                            asChild
                                            className="flex-1 h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black shadow-lg shadow-primary/20 group/btn"
                                        >
                                            <a href={location.googleMapsUrl} target="_blank" rel="noopener noreferrer">
                                                <MapIcon className="w-4 h-4 me-2 transition-transform group-hover/btn:rotate-12" />
                                                عرض على الخريطة
                                            </a>
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            size="icon"
                                            className="h-14 w-14 rounded-2xl bg-white/5 border-white/10 hover:bg-white/10 text-white"
                                        >
                                            <ExternalLink className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Hover Glow Effect */}
                            <AnimatePresence>
                                {hoveredId === location.id && (
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 -z-10 bg-primary/10 rounded-[2.5rem] blur-2xl pointer-events-none"
                                    />
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="mt-20 p-10 bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-[3.5rem] text-center relative overflow-hidden group"
                >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    <h3 className="text-3xl font-black text-white mb-4 font-headline">هل أنت في المدينة أو مكة الآن؟</h3>
                    <p className="text-muted-foreground text-lg font-bold mb-8 opacity-60 italic max-w-2xl mx-auto">
                        استخدم هاتفك لتتبع هذه المواقع مباشرة والمشاركة في "جولات وقفة التاريخية" لمعايشة السيرة في أرض الواقع.
                    </p>
                    <Button className="h-16 px-12 rounded-2xl bg-white text-black hover:bg-white/90 font-black text-xl shadow-2xl transition-all hover:scale-105">
                        تحميل تطبيق الهاتف للتتبع الحي
                    </Button>
                </motion.div>
            </div>
        </section>
    );
}
