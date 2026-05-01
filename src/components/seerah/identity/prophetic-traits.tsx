'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Heart, MessageCircle, Smile, Hand, Footprints, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const TRAITS = [
    {
        id: 'face',
        title: "وجهه الشريف",
        desc: "كان وجهه يتلألأ تلألؤ القمر ليلة البدر، ليس بالمطهم (المنتفخ) ولا بالمكلثم (المدور جداً)، أبيض مشرباً بحمرة، واسع الجبين.",
        icon: Smile,
        color: "text-amber-300",
        bg: "bg-amber-500/10"
    },
    {
        id: 'eyes',
        title: "عيناه",
        desc: "كان أدعج العينين (شديد سواد العين وشديد بياضها)، أهدب الأشفار (طويل رموش العين)، إذا نظر إليك ظننت أنه مكتحل وهو ليس بمكتحل.",
        icon: Eye,
        color: "text-blue-400",
        bg: "bg-blue-500/10"
    },
    {
        id: 'speech',
        title: "كلامه ومنطقه",
        desc: "كان دائم البشر، سهل الخلق، ليّن الجانب. يتكلم بجوامع الكلم، لا فضول فيه ولا تقصير. يعيد الكلمة ثلاثاً لتُعقل عنه.",
        icon: MessageCircle,
        color: "text-emerald-400",
        bg: "bg-emerald-500/10"
    },
    {
        id: 'heart',
        title: "رحمته وعطفه",
        desc: "أرحم الناس بالناس، وأرأفهم بهم. لا يغضب لنفسه، ولا ينتقم لها، إلا أن تنتهك حرمات الله فيغضب لله.",
        icon: Heart,
        color: "text-rose-400",
        bg: "bg-rose-500/10"
    },
    {
        id: 'hands',
        title: "كفاه",
        desc: "قال أنس: 'ما مسست ديباجاً ولا حريراً ألين من كف رسول الله ﷺ، ولا شممت رائحة قط أطيب من رائحته'. كان رحب الراحة.",
        icon: Hand,
        color: "text-purple-400",
        bg: "bg-purple-500/10"
    },
    {
        id: 'walk',
        title: "مشيته",
        desc: "كان إذا مشى تكفأ تكفؤاً كأنما ينحط من صبب (مكان منحدر)، يمشي بقوة وعزم، ليس بالمتماوت ولا بالكسلان.",
        icon: Footprints,
        color: "text-cyan-400",
        bg: "bg-cyan-500/10"
    }
];

export function PropheticTraits() {
    return (
        <section className="py-24 relative overflow-hidden" dir="rtl">
            <div className="w-full px-4 md:px-8 lg:px-12 relative z-10">
                <div className="text-center mb-20">
                    <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-primary/10 border border-primary/20 mb-6">
                        <ShieldCheck className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-white font-headline mb-4">الشمائل المحمدية</h2>
                    <p className="text-white/40 text-lg font-bold max-w-2xl mx-auto">
                        وصف خَلْقه وخُلُقه ﷺ، كأنك تراه.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                    {TRAITS.map((trait, idx) => (
                        <motion.div
                            key={trait.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className="group p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all duration-500"
                        >
                            <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110", trait.bg, trait.color)}>
                                <trait.icon size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-4 font-headline">{trait.title}</h3>
                            <p className="text-white/60 font-bold leading-relaxed text-lg">
                                {trait.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
