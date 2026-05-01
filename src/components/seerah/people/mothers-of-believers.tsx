'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Star, BookOpen, Quote, Sparkles, Shield, X, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Mother {
    id: string;
    name: string;
    title: string;
    marriageYear: string;
    role: string;
    bio: string;
    virtues: string[];
    color: string;
    accent: string;
}

const MOTHERS: Mother[] = [
    {
        id: 'khadijah',
        name: "خديجة بنت خويلد",
        title: "أم المؤمنين الأولى والمواساة",
        marriageYear: "قبل البعثة بـ 15 سنة",
        role: "أول من آمن به مطلقاً، ووزيرة صدق، ومواساة بالمال والنفس.",
        bio: "سيدة نساء العالمين في زمانها. سكنت قلب النبي ﷺ فلم ينسها قط، حتى كان يغار منها بعض زوجاته لكثرة ذكره لها بعد وفاتها.",
        virtues: ["أول من صدقه حين كذبه الناس", "أم جميع أبنائه (إلا إبراهيم)", "بشرها جبريل ببيت في الجنة من قصب", "واسته بمالها ونفسها"],
        color: "text-rose-500",
        accent: "bg-rose-500/20"
    },
    {
        id: 'sawdah',
        name: "سودة بنت زمعة",
        title: "الزوجة المواسية",
        marriageYear: "السنة 10 للبعثة",
        role: "كفلت بيت النبي وبناته بعد خديجة.",
        bio: "أرملة صالحة، تزوجها النبي ﷺ بعد وفاة خديجة ليجبر خاطرها وتكفل بناته. عُرفت بالطيبة وخفة الظل، ووهبت يومها لعائشة في كبرها.",
        virtues: ["أول من تزوجها بعد خديجة", "ضحت بيومها لعائشة", "مأوى لبنات النبي ﷺ في أصعب الأوقات"],
        color: "text-amber-500",
        accent: "bg-amber-500/20"
    },
    {
        id: 'aisha',
        name: "عائشة بنت أبي بكر",
        title: "حبيبة رسول الله والمُعلمة",
        marriageYear: "السنة 2 هـ",
        role: "أعلم النساء، راوية الحديث، وأحب زوجاته إليه.",
        bio: "ابنة الصديق. المبرأة من فوق سبع سماوات. كان النبي ﷺ يصرّح بحبها ويقول إنها أحب الناس إليه. روت أكثر من ألفي حديث عن النبي ﷺ.",
        virtues: ["أحب النساء إلى النبي ﷺ", "أنزل الله براءتها في القرآن", "توفي النبي ﷺ ورأسه على صدرها", "من أكثر الصحابة رواية للحديث"],
        color: "text-pink-400",
        accent: "bg-pink-500/20"
    },
    {
        id: 'hafsa',
        name: "حفصة بنت عمر",
        title: "حارسة القرآن",
        marriageYear: "السنة 3 هـ",
        role: "الصوامة القوامة وأمينة المصحف الأول.",
        bio: "ابنة الفاروق عمر. كانت شديدة الغيرة ومحبة للعبادة. طلقها النبي ﷺ طلقة فجاءه جبريل يقول: راجع حفصة فإنها صوامة قوامة وإنها زوجتك في الجنة.",
        virtues: ["صوامة قوامة بشهادة جبريل", "أؤتمنت على أول مصحف جُمع في عهد أبي بكر", "ابنة عمر بن الخطاب"],
        color: "text-emerald-500",
        accent: "bg-emerald-500/20"
    },
    {
        id: 'zaynab_kh',
        name: "زينب بنت خزيمة",
        title: "أم المساكين",
        marriageYear: "السنة 3 هـ",
        role: "رمز العطاء والرحمة.",
        bio: "عُرفت في الجاهلية والإسلام بـ 'أم المساكين' لكثرة إطعامها وعطفها على الفقراء. توفيت بعد زواجها من النبي ﷺ بأشهر قليلة.",
        virtues: ["تُلقب بأم المساكين", "من أوائل من توفي من زوجاته في حياته"],
        color: "text-cyan-400",
        accent: "bg-cyan-500/20"
    },
    {
        id: 'umm_salama',
        name: "أم سلمة",
        title: "صاحبة الرأي السديد",
        marriageYear: "السنة 4 هـ",
        role: "مستشارة النبي ﷺ في أزمة الحديبية.",
        bio: "هند بنت أبي أمية. هاجرت الهجرتين وفقدت زوجها أبا سلمة فحزنت عليه بشدة، فدعت الله أن يخلفها خيراً منه، فتزوجها النبي ﷺ. كان رأيها يوم الحديبية سبباً في إنقاذ الصحابة.",
        virtues: ["أنقذت الصحابة بمشورتها في الحديبية", "من أكمل النساء عقلاً", "شهدت نزول آية التطهير"],
        color: "text-indigo-400",
        accent: "bg-indigo-500/20"
    },
    {
        id: 'zaynab_j',
        name: "زينب بنت جحش",
        title: "زوجها الله من فوق سبع سماوات",
        marriageYear: "السنة 5 هـ",
        role: "إبطال عادة التبني في الإسلام.",
        bio: "ابنة عمة النبي ﷺ. كان زواجها بأمر إلهي لإبطال التبني بعد طلاقها من زيد بن حارثة. كانت تفتخر وتقول: 'زوجكن أهاليكن، وزوجني الله من فوق سبع سماوات'.",
        virtues: ["نزل القرآن بزواجها", "كانت صناع اليدين (تصنع بيدها وتتصدق)", "أطول زوجاته يداً (في الصدقة)"],
        color: "text-purple-400",
        accent: "bg-purple-500/20"
    },
    {
        id: 'juwayriya',
        name: "جويرية بنت الحارث",
        title: "أعظم النساء بركة على قومها",
        marriageYear: "السنة 5 هـ",
        role: "سبب في إعتقاق قومها.",
        bio: "وقعت أسيرة بعد غزوة بني المصطلق، فأرادت أن تفتدي نفسها، فعرض عليها النبي الزواج، فلما تزوجها أعتق الصحابة كل أسرى بني المصطلق إكراماً لأصهار رسول الله.",
        virtues: ["أعظم امرأة بركة على قومها", "كثيرة الذكر والتسبيح"],
        color: "text-teal-400",
        accent: "bg-teal-500/20"
    },
    {
        id: 'umm_habiba',
        name: "أم حبيبة",
        title: "المهاجرة الصابرة",
        marriageYear: "السنة 7 هـ",
        role: "تحملت الغربة وارتداد زوجها حباً في الإسلام.",
        bio: "رملة بنت أبي سفيان. أسلمت وهاجرت للحبشة، وهناك ارتد زوجها ومات، فخطبها النبي ﷺ وهي في الحبشة وأصدقها النجاشي. كانت شديدة التعظيم لرسول الله.",
        virtues: ["زوجها النجاشي للنبي ﷺ", "منعت أباها (وهو مشرك) من الجلوس على فراش النبي", "أقرب زوجاته إليه نسباً"],
        color: "text-orange-400",
        accent: "bg-orange-500/20"
    },
    {
        id: 'safiyya',
        name: "صفية بنت حيي",
        title: "ابنة الأنبياء",
        marriageYear: "السنة 7 هـ",
        role: "رمز التسامح وجمع القلوب.",
        bio: "من نسل هارون عليه السلام. وقعت أسيرة في خيبر، فأعتقها النبي ﷺ وجعل عتقها صداقها وتزوجها. كان يقول لها: 'أنت ابنة نبي، وعمك نبي، وزوجك نبي'.",
        virtues: ["من سلالة الأنبياء", "كانت حليمة فاضلة، وكانت تبكي حباً للنبي ﷺ في مرضه"],
        color: "text-sky-400",
        accent: "bg-sky-500/20"
    },
    {
        id: 'maymuna',
        name: "ميمونة بنت الحارث",
        title: "الواهبة نفسها",
        marriageYear: "السنة 7 هـ",
        role: "آخر زوجات النبي ﷺ.",
        bio: "تزوجها النبي ﷺ في عمرة القضاء. كانت من أتقى النساء وأوصلهن للرحم كما وصفتها عائشة. توفيت بسرف وهو نفس المكان الذي بنى بها فيه.",
        virtues: ["آخر من تزوج النبي ﷺ", "من أتقى الزوجات وأوصلهن للرحم"],
        color: "text-fuchsia-400",
        accent: "bg-fuchsia-500/20"
    }
];

export function MothersOfBelievers() {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const selectedMother = MOTHERS.find(m => m.id === selectedId);

    return (
        <section className="py-24 relative overflow-hidden" dir="rtl">
            <div className="w-full px-4 md:px-8 lg:px-12 relative z-10">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 mb-6">
                        <Heart className="w-8 h-8 text-rose-500" />
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-white font-headline mb-4">أمهات المؤمنين</h2>
                    <p className="text-white/40 text-lg md:text-xl font-bold max-w-2xl mx-auto">
                        ﴿النَّبِيُّ أَوْلَىٰ بِالْمُؤْمِنِينَ مِنْ أَنفُسِهِمْ ۖ وَأَزْوَاجُهُ أُمَّهَاتُهُمْ﴾. أطهر البيوت وأعظم النساء قدراً.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {MOTHERS.map((mother) => (
                        <motion.div
                            key={mother.id}
                            whileHover={{ y: -5 }}
                            onClick={() => setSelectedId(mother.id)}
                            className="cursor-pointer group p-6 rounded-3xl bg-white/[0.01] border border-white/5 backdrop-blur-sm hover:bg-white/[0.03] hover:border-white/10 transition-all duration-500"
                        >
                            <div className={cn("w-12 h-12 rounded-full mb-4 flex items-center justify-center transition-colors", mother.accent, mother.color)}>
                                <Star className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-black text-white font-headline mb-1">{mother.name}</h3>
                            <p className={cn("font-black text-[10px] uppercase tracking-widest mb-4", mother.color)}>
                                {mother.title}
                            </p>
                            <p className="text-sm font-bold text-white/50 line-clamp-2 leading-relaxed">
                                {mother.bio}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {selectedId && selectedMother && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedId(null)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                        />
                        
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl z-10 max-h-[90vh] overflow-y-auto custom-scrollbar"
                        >
                            <Button 
                                onClick={() => setSelectedId(null)}
                                variant="ghost" 
                                size="icon" 
                                className="absolute top-6 left-6 rounded-full bg-white/5 hover:bg-white/10 text-white"
                            >
                                <X size={20} />
                            </Button>

                            <div className="text-center mb-8">
                                <div className={cn("w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center shadow-2xl", selectedMother.accent, selectedMother.color)}>
                                    <Heart className="w-10 h-10" />
                                </div>
                                <h2 className="text-4xl font-black text-white font-headline mb-2">{selectedMother.name}</h2>
                                <p className={cn("font-black text-sm uppercase tracking-widest", selectedMother.color)}>
                                    {selectedMother.title}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                                    <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-1">تاريخ الزواج</p>
                                    <p className="text-sm text-white font-bold">{selectedMother.marriageYear}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                                    <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-1">الدور الأبرز</p>
                                    <p className="text-sm text-white font-bold">{selectedMother.role}</p>
                                </div>
                            </div>

                            <div className="mb-8 p-6 rounded-3xl bg-primary/5 border border-primary/20">
                                <h4 className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest mb-3">
                                    <Info className="w-4 h-4" /> نبذة عطرة
                                </h4>
                                <p className="text-white/90 text-base font-bold leading-relaxed italic">
                                    "{selectedMother.bio}"
                                </p>
                            </div>

                            <div>
                                <h4 className="flex items-center gap-2 text-white/40 font-black text-xs uppercase tracking-widest mb-4">
                                    <Sparkles className="w-4 h-4" /> الفضائل والمناقب
                                </h4>
                                <ul className="space-y-3">
                                    {selectedMother.virtues.map((virtue, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <div className={cn("w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5", selectedMother.accent, selectedMother.color)}>
                                                <Star className="w-3 h-3" />
                                            </div>
                                            <span className="text-white/80 font-bold text-sm leading-relaxed">{virtue}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    );
}
