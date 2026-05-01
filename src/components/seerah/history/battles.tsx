'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Sword, Shield, Users, Calendar, MapPin, Target, 
    BookOpen, Sparkles, X, ChevronRight, Info, Award,
    Trophy, Flag, ScrollText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface Battle {
    id: string;
    title: string;
    year: string;
    location: string;
    muslimForce: string;
    enemyForce: string;
    summary: string;
    events: string[];
    lessons: string[];
    result: string;
    image?: string;
    color: string;
}

const BATTLES: Battle[] = [
    {
        id: 'badr',
        title: "غزوة بدر الكبرى",
        year: "17 رمضان - 2 هـ",
        location: "بئر بدر (جنوب غرب المدينة)",
        muslimForce: "313 مقاتلاً",
        enemyForce: "1000 مقاتل",
        summary: "يوم الفرقان، أول معركة كبرى في تاريخ الإسلام، حيث نصر الله المؤمنين رغم قلة عددهم.",
        events: [
            "خروج المسلمين لاعتراض قافلة قريش بقيادة أبي سفيان.",
            "تحول الهدف من القافلة إلى مواجهة جيش قريش الذي خرج لحمايتها.",
            "مشاورة النبي ﷺ لأصحابه، وكلمة المقداد وسعد بن معاذ الشهيرة.",
            "نزول المطر ليلة المعركة وتثبيت أقدام المؤمنين.",
            "الدعاء المستمر من النبي ﷺ حتى سقط رداؤه.",
            "نزول الملائكة لمساندة المسلمين في القتال.",
            "انتهاء المعركة بنصر مؤزر ومقتل رؤوس الكفر مثل أبي جهل."
        ],
        lessons: [
            "النصر من عند الله وحده وليس بكثرة العدد.",
            "أهمية الشورى والالتفاف حول القيادة.",
            "قيمة الدعاء والتضرع لله في وقت الشدة.",
            "العدالة في التعامل مع الأسرى (فداء الأسرى بتعليم المسلمين)."
        ],
        result: "نصر تاريخي حاسم للمسلمين",
        image: "/battle_badr_cinematic_landscape_1777413990459.png",
        color: "text-emerald-500"
    },
    {
        id: 'uhud',
        title: "غزوة أحد",
        year: "شوال - 3 هـ",
        location: "جبل أحد (شمال المدينة)",
        muslimForce: "700 مقاتل",
        enemyForce: "3000 مقاتل",
        summary: "غزوة شهدت اختباراً عظيماً للمسلمين، وتعلموا فيها أهمية طاعة القائد العسكري.",
        events: [
            "خروج قريش لطلب الثأر لما حدث في بدر.",
            "وضع النبي ﷺ لـ 50 رامياً على جبل الرماة لحماية ظهر الجيش.",
            "بداية المعركة بنصر للمسلمين وفرار المشركين.",
            "نزول الرماة من الجبل لجمع الغنائم ظناً منهم بانتهاء المعركة.",
            "استغلال خالد بن الوليد (قبل إسلامه) للثغرة والتفافه خلف المسلمين.",
            "استبسال الصحابة في الدفاع عن النبي ﷺ بعد شائعة مقتله.",
            "استشهاد سيد الشهداء حمزة بن عبد المطلب رضي الله عنه."
        ],
        lessons: [
            "عاقبة مخالفة أوامر القائد العسكري.",
            "الدنيا ومتاعها قد تكون سبباً في الفشل إذا قُدمت على الآخرة.",
            "الابتلاء والتمحيص سنة ربانية لتمييز الصادق من المنافق.",
            "الصبر عند الصدمة الأولى والثبات في الميدان."
        ],
        result: "ابتلاء وتمحيص واستشهاد 70 صحابياً",
        color: "text-rose-500"
    },
    {
        id: 'khandaq',
        title: "غزوة الخندق (الأحزاب)",
        year: "شوال - 5 هـ",
        location: "شمال المدينة المنورة",
        muslimForce: "3000 مقاتل",
        enemyForce: "10,000 مقاتل (الأحزاب)",
        summary: "حصار عظيم واجهته المدينة من قبائل العرب واليهود، وانتهى بنصر إلهي بالريح.",
        events: [
            "تجمع الأحزاب (قريش، غطفان، يهود بني النضير) لاستئصال المسلمين.",
            "إشارة سلمان الفارسي رضي الله عنه بحفر خندق حول المدينة.",
            "مفاجأة المشركين بالخندق الذي لم تعهده العرب في حروبها.",
            "نقض بني قريظة لعهدهم مع النبي ﷺ وتفاقم الخطر.",
            "نعيم بن مسعود ودوره الذكي في تفريق صفوف الأحزاب.",
            "إرسال الله ريحاً صرصراً قلعت خيامهم وكفأت قدورهم.",
            "رحيل الأحزاب خائبين دون قتال مباشر كبير."
        ],
        lessons: [
            "قيمة الإبداع والابتكار في التخطيط (حفر الخندق).",
            "الثقة بالله وقت الكرب (بلغت القلوب الحناجر).",
            "أهمية الحرب النفسية والذكاء السياسي في فض النزاعات.",
            "الجزاء من جنس العمل (غدر اليهود قابله تطهير المدينة)."
        ],
        result: "هزيمة الأحزاب وتشتت شملهم",
        color: "text-blue-500"
    },
    {
        id: 'khaybar',
        title: "غزوة خيبر",
        year: "محرم - 7 هـ",
        location: "حصون خيبر (شمال المدينة)",
        muslimForce: "1600 مقاتل",
        enemyForce: "10,000 مقاتل يهودي",
        summary: "فتح أعظم معاقل اليهود في الجزيرة العربية وتأمين حدود الدولة الإسلامية.",
        events: [
            "التوجه لخيبر بعد صلح الحديبية لتأمين الجبهة الشمالية.",
            "تسليم الراية لعلي بن أبي طالب رضي الله عنه بعد استعصاء الحصون.",
            "فتح الحصون واحداً تلو الآخر ببطولة وإقدام.",
            "مبارزة علي بن أبي طالب لمرحب بطل اليهود وقتله.",
            "استسلام بقية الحصون وطلب الصلح من اليهود.",
            "إقرار اليهود في أرضهم للعمل فيها مقابل شطر الثمار."
        ],
        lessons: [
            "أهمية اختيار القيادة المناسبة للمهام الصعبة (الراية لعلي).",
            "التعامل مع أهل الكتاب وفق العهود والمواثيق.",
            "الصبر على الحصار الطويل والتخطيط لفتح الثغرات.",
            "تأمين الجبهة الداخلية قبل التوسع الخارجي."
        ],
        result: "فتح خيبر وتأمين شمال الجزيرة",
        color: "text-amber-500"
    },
    {
        id: 'makkah',
        title: "فتح مكة",
        year: "رمضان - 8 هـ",
        location: "مكة المكرمة",
        muslimForce: "10,000 مقاتل",
        enemyForce: "قريش وحلفاؤها",
        summary: "الفتح الأعظم الذي طهر الكعبة من الأصنام وأعاد النبي إلى بلده ناصراً.",
        events: [
            "نقض قريش لصلح الحديبية باعتدائها على حلفاء المسلمين.",
            "تجهيز جيش ضخم والتحرك نحو مكة في سرية تامة.",
            "إسلام أبي سفيان قبل دخول الجيش.",
            "دخول الجيش من أربع جهات دون قتال يذكر.",
            "إعلان العفو العام بكلمة: 'اذهبوا فأنتم الطلقاء'.",
            "تكسير الأصنام حول الكعبة وتطهيرها.",
            "بلال رضي الله عنه يؤذن فوق الكعبة المشرفة."
        ],
        lessons: [
            "الوفاء بالعهود وشناعة نقضها.",
            "عظمة التسامح النبوي والعفو عند المقدرة.",
            "التواضع عند النصر (دخل النبي مكة مطأطئ الرأس).",
            "أهمية القوة في ردع المعتدين وتحقيق السلم."
        ],
        result: "نصر مبين ودخول الناس في دين الله أفواجاً",
        color: "text-yellow-500"
    },
    {
        id: 'hunayn',
        title: "غزوة حنين",
        year: "شوال - 8 هـ",
        location: "وادي حنين (بين مكة والطائف)",
        muslimForce: "12,000 مقاتل",
        enemyForce: "قبائل هوازن وثقيف",
        summary: "غزوة علمت المسلمين أن النصر ليس بالكثرة، بل بالثبات والتوكل.",
        events: [
            "خروج قبائل هوازن لقتال المسلمين بعد فتح مكة.",
            "اغترار بعض المسلمين بكثرة عددهم (لن نغلب اليوم من قلة).",
            "كمين هوازن في مضايق الوادي وبداية تراجع المسلمين.",
            "ثبات النبي ﷺ ومن معه ومناداته: 'أنا النبي لا كذب، أنا ابن عبد المطلب'.",
            "اجتماع المسلمين مرة أخرى حول النبي ﷺ والهجوم المضاد.",
            "هزيمة هوازن وحصول المسلمين على غنائم ضخمة."
        ],
        lessons: [
            "الكثرة ليست مقياساً للنصر إذا غاب الإخلاص.",
            "شجاعة القائد وثباته هي صمام أمان الجيش.",
            "أهمية الاستطلاع العسكري لتفادي الكمائن.",
            "الحكمة في توزيع الغنائم لتأليف القلوب."
        ],
        result: "نصر بعد تراجع، وتأديب القبائل المعتدية",
        color: "text-indigo-500"
    },
    {
        id: 'tabuk',
        title: "غزوة تبوك (العسرة)",
        year: "رجب - 9 هـ",
        location: "تبوك (شمال الجزيرة)",
        muslimForce: "30,000 مقاتل",
        enemyForce: "جيش الروم وحلفاؤهم",
        summary: "آخر غزوات النبي ﷺ، كانت اختباراً للمؤمنين في وقت الحر الشديد والفقر.",
        events: [
            "وصول أخبار بتجمع الروم لغزو المدينة.",
            "إعلان النبي ﷺ النفير العام رغم شدة الحر وبعد المسافة.",
            "مسارعة الصحابة للتصدق (عثمان جهز جيش العسرة).",
            "تخلف المنافقين واختلاقهم الأعذار الواهية.",
            "السير لمسافة طويلة وتحمل الجوع والعطش (جيش العسرة).",
            "انسحاب الروم من تبوك قبل وصول المسلمين لهيبتهم.",
            "عقد معاهدات مع القبائل الشمالية وتأمين الحدود."
        ],
        lessons: [
            "البذل والتضحية في سبيل الله (تجهيز الجيش).",
            "كشف زيف المنافقين وتمييز صف المؤمنين.",
            "أهمية الردع العسكري وإظهار القوة للعدو البعيد.",
            "التوبة الصادقة (قصة الثلاثة الذين خُلفوا)."
        ],
        result: "انسحاب الروم وتحقيق هيبة الدولة",
        color: "text-cyan-500"
    }
];

export function SeerahBattles() {
    const [selectedBattleId, setSelectedBattleId] = useState<string | null>(null);
    const selectedBattle = BATTLES.find(b => b.id === selectedBattleId);

    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    return (
        <section className="py-24 relative overflow-hidden" dir="rtl">
            <div className="w-full px-4 md:px-8 lg:px-12 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                    {BATTLES.map((battle, index) => (
                        <motion.div
                            key={battle.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => setSelectedBattleId(battle.id)}
                            className="group cursor-pointer"
                        >
                            <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 backdrop-blur-3xl hover:bg-white/[0.05] hover:border-white/10 transition-all duration-500 h-full flex flex-col relative overflow-hidden shadow-2xl">
                                {/* Decorative Gradient */}
                                <div className={cn("absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[60px] opacity-0 group-hover:opacity-10 transition-opacity", battle.color.replace('text-', 'bg-'))} />
                                
                                <div className="flex justify-between items-start mb-6">
                                    <div className={cn("p-4 rounded-2xl bg-white/5 border border-white/10 shrink-0", battle.color)}>
                                        <Sword size={20} />
                                    </div>
                                    <span className="px-4 py-1 rounded-full bg-white/5 border border-white/10 text-white/40 text-[9px] font-black tracking-widest uppercase">
                                        {battle.year}
                                    </span>
                                </div>

                                <h3 className="text-2xl font-black text-white mb-3 font-headline leading-tight group-hover:text-amber-500 transition-colors">
                                    {battle.title}
                                </h3>
                                <p className="text-white/40 text-sm leading-relaxed font-bold mb-8 line-clamp-2">
                                    {battle.summary}
                                </p>

                                <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-widest">
                                        <Award className="w-3 h-3" />
                                        <span>{battle.result.split(' ')[0]}</span>
                                    </div>
                                    <ChevronRight className={cn("w-5 h-5 transition-transform group-hover:translate-x-[-5px]", battle.color)} />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Battle Detail Modal */}
            {mounted && createPortal(
                <AnimatePresence>
                    {selectedBattleId && selectedBattle && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8">
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSelectedBattleId(null)}
                                className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                            />
                            
                            <motion.div 
                                layoutId={selectedBattle.id}
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative w-full max-w-5xl h-[85vh] bg-[#0c0c0c] border border-white/10 rounded-[3rem] overflow-hidden flex flex-col shadow-2xl"
                            >
                                {/* Header with Image Overlay */}
                                <div className="relative h-64 md:h-80 shrink-0">
                                    {selectedBattle.image ? (
                                        <Image src={selectedBattle.image} fill className="object-cover opacity-40" alt={selectedBattle.title} />
                                    ) : (
                                        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-black" />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-transparent to-transparent" />
                                    
                                    <Button 
                                        onClick={() => setSelectedBattleId(null)}
                                        variant="ghost" 
                                        size="icon" 
                                        className="absolute top-6 left-6 rounded-full bg-black/50 backdrop-blur-md hover:bg-black/70 text-white h-10 w-10 z-50"
                                    >
                                        <X size={20} />
                                    </Button>

                                    <div className="absolute bottom-8 right-8 left-8">
                                        <div className={cn("inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/5 border border-white/10 mb-4", selectedBattle.color)}>
                                            <Sparkles className="w-3 h-3" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{selectedBattle.year}</span>
                                        </div>
                                        <h2 className="text-4xl md:text-6xl font-black text-white font-headline leading-tight">{selectedBattle.title}</h2>
                                    </div>
                                </div>

                                {/* Content Tabs/Sections */}
                                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-12">
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                                        {/* Left Column: Summary & Stats */}
                                        <div className="lg:col-span-4 space-y-8">
                                            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                                                <h4 className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                                                    <Info className="w-3.5 h-3.5" /> بطاقة المعركة
                                                </h4>
                                                <div className="space-y-6">
                                                    <StatRow icon={<MapPin />} label="الموقع" value={selectedBattle.location} />
                                                    <StatRow icon={<Users />} label="جيش المسلمين" value={selectedBattle.muslimForce} />
                                                    <StatRow icon={<Target />} label="جيش العدو" value={selectedBattle.enemyForce} />
                                                    <StatRow icon={<Trophy />} label="النتيجة" value={selectedBattle.result} />
                                                </div>
                                            </div>

                                            <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10">
                                                <p className="text-lg text-amber-500/90 font-bold leading-relaxed italic">
                                                    "{selectedBattle.summary}"
                                                </p>
                                            </div>
                                        </div>

                                        {/* Right Column: Events & Lessons */}
                                        <div className="lg:col-span-8 space-y-12">
                                            {/* Events Timeline */}
                                            <section>
                                                <div className="flex items-center gap-4 mb-8">
                                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                                        <ScrollText size={20} />
                                                    </div>
                                                    <h3 className="text-2xl font-black text-white">تسلسل الأحداث</h3>
                                                </div>
                                                <div className="space-y-4">
                                                    {selectedBattle.events.map((event, i) => (
                                                        <div key={i} className="flex gap-4 group">
                                                            <div className="flex flex-col items-center">
                                                                <div className="w-2 h-2 rounded-full bg-blue-500/40 group-hover:bg-blue-500 transition-colors mt-2.5" />
                                                                {i !== selectedBattle.events.length - 1 && (
                                                                    <div className="w-[1px] flex-1 bg-white/5 my-2" />
                                                                )}
                                                            </div>
                                                            <p className="text-white/70 font-bold leading-relaxed pb-4 border-b border-white/[0.02] w-full">
                                                                {event}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </section>

                                            {/* Lessons Learned */}
                                            <section>
                                                <div className="flex items-center gap-4 mb-8">
                                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                                        <BookOpen size={20} />
                                                    </div>
                                                    <h3 className="text-2xl font-black text-white">العبر والدروس</h3>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {selectedBattle.lessons.map((lesson, i) => (
                                                        <div key={i} className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-start gap-4 hover:bg-emerald-500/10 transition-colors">
                                                            <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-500 text-[10px] font-black">
                                                                {i + 1}
                                                            </div>
                                                            <p className="text-white/80 font-bold text-sm leading-relaxed">
                                                                {lesson}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </section>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </section>
    );
}

function StatRow({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/30 shrink-0">
                {icon}
            </div>
            <div>
                <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-white/80 font-bold text-xs">{value}</p>
            </div>
        </div>
    );
}
