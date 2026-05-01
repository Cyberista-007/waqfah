'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Star, Shield, Heart, Sword, Book, Users, MessageCircle, Crown, 
    X, Info, Target, Sparkles, Quote, History, Zap, MapPin,
    ArrowLeft, BookOpen, Award, Medal, Flame
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Companion {
    id: string;
    name: string;
    title: string;
    category: 'rashidun' | 'promised' | 'leaders' | 'shuhada' | 'women';
    keyMoment: string;
    role: string;
    bio: string;
    fullStory: string;
    bshara?: string;
    achievements: string[];
    icon: any;
    color: string;
    accent: string;
}

const COMPANIONS: Companion[] = [
    { 
        id: 'abu-bakr',
        name: "أبو بكر الصديق", 
        title: "الصديق والأنيس", 
        category: 'rashidun',
        keyMoment: "رفيق الغار والهجرة",
        role: "صاحب النبي ﷺ في الغار وأول الخلفاء الراشدين.", 
        bio: "أحب الرجال إلى النبي ﷺ، صدّقه حين كذبه الناس، ورافقه في أخطر رحلة في تاريخ الإسلام. عُرف برقة قلبه وصلابة مواقفه في الحق.",
        fullStory: "عبد الله بن أبي قحافة، الملقب بالصديق لأنه صدق النبي ﷺ في خبر الإسراء والمعراج دون تردد. كان أول من آمن من الرجال، وبذل ماله كله في سبيل الله حتى أعتق بلالاً وغيره من الضعفاء. في رحلة الهجرة، كان يقي النبي ﷺ بنفسه، ويمشي أمامه وخلفه وعن يمينه وشماله خوفاً عليه. بعد وفاة النبي ﷺ، كان الصخرة التي ثبتت عليها الأمة، وواجه حروب الردة بحزم وقوة، وجمع القرآن لأول مرة. توفي في السنة 13 هـ ودفن بجوار النبي ﷺ.",
        bshara: "قال ﷺ: «أبو بكر في الجنة»، وفي حديث آخر سأل النبي ﷺ: من أصبح منكم اليوم صائماً؟ من عاد مريضاً؟ من اتبع جنازة؟ من أطعم مسكيناً؟ فقال أبو بكر: أنا في كلها، فقال ﷺ: «ما اجتمعن في امرئ إلا دخل الجنة».",
        achievements: ["أنفق ماله كله لله", "أول من آمن من الرجال", "ثبّت الأمة يوم وفاة النبي", "قائد حروب الردة"],
        icon: Shield, 
        color: "text-amber-500",
        accent: "bg-amber-500/20"
    },
    { 
        id: 'omar',
        name: "عمر بن الخطاب", 
        title: "الفاروق", 
        category: 'rashidun',
        keyMoment: "الجهر بالإسلام والعدل",
        role: "أعز الله به الإسلام وجعل الحق على لسانه وقلبه.", 
        bio: "كان إسلامه فتحاً، وهجرته نصراً، وإمارته رحمة. فرّق الله به بين الحق والباطل، وبنى دولة العدل التي لم تغب عنها الشمس.",
        fullStory: "عمر بن الخطاب العدوي القرشي، كان إسلامه بدعوة النبي ﷺ 'اللهم أعز الإسلام بأحب هذين الرجلين إليك'. أعلن هجرته أمام قريش متحدياً إياهم، بينما هاجر غيره سراً. عُرف بلقب 'الفاروق' ولقبه به النبي ﷺ. في خلافته، توسعت الدولة الإسلامية بشكل مذهل، ففتحت القدس وفارس ومصر. وضع الدواوين، وأنشأ البريد، وأسس التقويم الهجري. كان يطوف ليلاً يتفقد أحوال الرعية، واشتهر بعدله الزاهد. استشهد على يد أبي لؤلؤة المجوسي عام 23 هـ.",
        bshara: "قال ﷺ: «عمر في الجنة»، وقال: «بينا أنا نائم رأيتني في الجنة، فإذا امرأة تتوضأ إلى جانب قصر، فقلت: لمن هذا القصر؟ قالوا: لعمر، فذكرت غيرتك فوليت مدبراً»، فبكى عمر وقال: أعليك أغار يا رسول الله؟",
        achievements: ["مؤسس التقويم الهجري", "وافق القرآن في عدة مواضع", "فتح بيت المقدس", "واضع نظام الدواوين"],
        icon: Crown, 
        color: "text-blue-500",
        accent: "bg-blue-500/20"
    },
    { 
        id: 'othman',
        name: "عثمان بن عفان", 
        title: "ذو النورين", 
        category: 'rashidun',
        keyMoment: "تجهيز جيش العسرة",
        role: "المنفق الحيي الذي استحيت منه ملائكة الرحمن.", 
        bio: "صهر النبي ﷺ على ابنتيه، عُرف بشدة الحياء وكثرة الإنفاق في سبيل الله. في عهده جُمع القرآن في مصحف واحد.",
        fullStory: "عثمان بن عفان، لُقب بـ 'ذو النورين' لزواجه من ابنتي النبي ﷺ رقية ثم أم كلثوم. كان من أغنى قريش، سخر ماله كله لخدمة الإسلام، فاشترى بئر رومة وجعلها للمسلمين، وجهز ثلث جيش العسرة (تبوك) بمفرده. في عهده جُمع القرآن الكريم على حرف واحد ليحفظ الأمة من الاختلاف. اتسعت رقعة الإسلام في عهده ووصلت لأطراف بعيدة. استشهد صابراً محتسباً وهو يقرأ القرآن في بيته عام 35 هـ.",
        bshara: "قال ﷺ: «عثمان في الجنة»، وفي غزوة تبوك حين جهز جيش العسرة قال ﷺ: «ما ضر عثمان ما عمل بعد اليوم».",
        achievements: ["اشترى بئر رومة للمسلمين", "توسع في المسجد النبوي", "أول من أنشأ أسطولاً بحرياً", "جمع القرآن الكريم"],
        icon: Book, 
        color: "text-emerald-500",
        accent: "bg-emerald-500/20"
    },
    { 
        id: 'ali',
        name: "علي بن أبي طالب", 
        title: "الكرار", 
        category: 'rashidun',
        keyMoment: "الفداء في ليلة الهجرة",
        role: "ابن عم النبي ﷺ وباب مدينة العلم وشجاع الأمة.", 
        bio: "أول من أسلم من الصبيان، نام في فراش النبي ﷺ ليلة الهجرة مضحياً بنفسه. كان فارساً لا يُشق له غبار وحكيماً تقياً.",
        fullStory: "علي بن أبي طالب، ربيب بيت النبوة وزوج السيدة فاطمة الزهراء. عُرف بشجاعة منقطعة النظير، فكان بطل المبارزات في بدر وأحد وخيبر. هو الفدائي الأول في الإسلام حين نام في فراش النبي ﷺ ليلة الهجرة ليؤدي الأمانات ويغطي على رحيل النبي. كان مرجع الصحابة في القضاء والعلم، ولقبه النبي ﷺ بـ 'أبي التراب'. تولى الخلافة في ظروف صعبة، ومع ذلك لم يتنازل عن مبادئه في العدل والزهد. استشهد عام 40 هـ على يد عبد الرحمن بن ملجم.",
        bshara: "قال ﷺ: «علي في الجنة»، وقال له: «أنت مني بمنزلة هارون من موسى إلا أنه لا نبي بعدي». ويوم خيبر قال ﷺ: «لأعطين الراية غداً رجلاً يحب الله ورسوله، ويحبه الله ورسوله، يفتح الله على يديه»، فأعطاها لعلي.",
        achievements: ["بطل غزوة خيبر", "حامل لواء النبي", "زوج سيدة نساء العالمين", "رابع الخلفاء الراشدين"],
        icon: Sword, 
        color: "text-indigo-500",
        accent: "bg-indigo-500/20"
    },
    { 
        id: 'talha',
        name: "طلحة بن عبيد الله", 
        title: "طلحة الخير", 
        category: 'promised',
        keyMoment: "حماية النبي في غزوة أحد",
        role: "أحد الثمانية الذين سبقوا إلى الإسلام ومن العشرة المبشرين.", 
        bio: "كان يلقبه النبي بـ 'طلحة الخير' و'طلحة الجود'. استبسل في حماية النبي يوم أحد حتى شُلّت يده.",
        fullStory: "طلحة بن عبيد الله، أحد الستة أهل الشورى الذين اختارهم عمر بن الخطاب. يوم معركة أحد، جعل نفسه درعاً للنبي ﷺ، فكان يتلقى السهام والنبال بيده وجسده، حتى أُصيب بـ 75 طعنة وضربة، وشُلّت كفّه وهو يحمي وجه الرسول. قال عنه النبي ﷺ: 'من أراد أن ينظر إلى شهيد يمشي على وجه الأرض فلينظر إلى طلحة بن عبيد الله'. كان تاجراً ثرياً وجواداً كريماً، ينفق أمواله بسخاء في وجوه الخير.",
        bshara: "قال ﷺ: «طلحة في الجنة»، ويوم أحد حين برك طلحة ليصعد النبي ﷺ على ظهره إلى الصخرة، قال ﷺ: «أوجب طلحة» (أي وجبت له الجنة).",
        achievements: ["شهيد يمشي على الأرض", "أحد الستة أهل الشورى", "تلقى 75 طعنة دفاعاً عن النبي"],
        icon: Sparkles, 
        color: "text-yellow-400",
        accent: "bg-yellow-500/20"
    },
    { 
        id: 'zubayr',
        name: "الزبير بن العوام", 
        title: "حواري رسول الله", 
        category: 'promised',
        keyMoment: "أول من سلّ سيفاً في الإسلام",
        role: "ابن عمة النبي ﷺ وحواريه المخلص وشجاع الإسلام.", 
        bio: "أحد العشرة المبشرين بالجنة، وأحد الستة أصحاب الشورى. عُرف بفروسيته وإقدامه الدائم.",
        fullStory: "الزبير بن العوام، ابن عمة النبي ﷺ صفية بنت عبد المطلب. كان أول من سل سيفاً في سبيل الله في مكة عندما ظن أن النبي ﷺ قد قُتل. شهد المشاهد كلها مع رسول الله، وكان له دور حاسم في معارك اليرموك وغيرها. قال عنه النبي ﷺ: 'لكل نبي حواري، وحواريي الزبير'. تميز بجلد وصبر عظيم، وكان جسده مليئاً بآثار السيوف والرماح. كان تاجراً ناجحاً وأوصى بثلث ماله لليتامى والمحتاجين.",
        bshara: "قال ﷺ: «الزبير في الجنة»، وفي غزوة الخندق حين انتدب النبي ﷺ أحداً يأتيه بخبر بني قريظة، فانتدب الزبير ثلاث مرات، قال ﷺ: «إن لكل نبي حوارياً، وحواريي الزبير».",
        achievements: ["حواري رسول الله", "أول من سل سيفاً في الإسلام", "أحد الستة أهل الشورى"],
        icon: Sword, 
        color: "text-sky-400",
        accent: "bg-sky-500/20"
    },
    { 
        id: 'abdurrahman',
        name: "عبد الرحمن بن عوف", 
        title: "أغنى الصحابة إيماناً", 
        category: 'promised',
        keyMoment: "ترك ماله كله في سبيل الله",
        role: "الصحابي التاجر الذي بارك الله في تجارته فأنفقها في الإسلام.", 
        bio: "أحد الثمانية الأوائل في الإسلام والعشرة المبشرين. عُرف بعفة نفسه وقدرته الفذة في التجارة والإنفاق.",
        fullStory: "عبد الرحمن بن عوف، أحد الستة أهل الشورى. هاجر للمدينة فقيراً لا يملك شيئاً، فرفض مساعدة الأنصار قائلاً: 'دلوني على السوق'. بارك الله في تجارته حتى قيل إنه لو رفع حجراً لوجد تحته ذهباً. جهز جيوشاً بأكملها من ماله الخاص، وتصدق بقافلة من 700 بعير محملة بالأرزاق لأهل المدينة مرة واحدة. كان متواضعاً جداً، حتى إنه كان لا يُعرف من بين خدمه من شدة تواضعه في لباسه ومجلسه.",
        bshara: "قال ﷺ: «عبد الرحمن بن عوف في الجنة». وقد صلى النبي ﷺ خلفه في غزوة تبوك، وهذا شرف عظيم لم ينله إلا القليل.",
        achievements: ["تصدق بـ 700 ناقة دفعة واحدة", "أحد الستة أهل الشورى", "جهز جيش العسرة بماله"],
        icon: Award, 
        color: "text-orange-400",
        accent: "bg-orange-500/20"
    },
    { 
        id: 'saad',
        name: "سعد بن أبي وقاص", 
        title: "فارس الإسلام", 
        category: 'promised',
        keyMoment: "أول من رمى بسهم في سبيل الله",
        role: "خال النبي ﷺ، وأحد العشرة المبشرين، وفارس القادسية.", 
        bio: "عُرف ببراعته في الرماية، وكان النبي يفخر به ويقول: 'هذا خالي فليرني امرؤ خاله'.",
        fullStory: "سعد بن أبي وقاص الزهري، أحد الستة أهل الشورى. كان أول من رمى بسهم في الإسلام، وكان النبي ﷺ يقول له يوم أحد: 'ارمِ فداك أبي وأمي'. هو قائد معركة القادسية الخالدة التي فتح الله بها بلاد الفرس، وبنى مدينة الكوفة. كان مجاب الدعوة، ولم يُهزم في معركة قادها قط. توفي في قصره بالعقيق وهو آخر من مات من المهاجرين عام 55 هـ، وأوصى أن يُكفن ببردة قديمة شهد بها يوم بدر.",
        bshara: "قال ﷺ: «سعد في الجنة». وفي أحد الأيام قال النبي ﷺ لأصحابه: «يطلع عليكم الآن رجل من أهل الجنة»، فطلع سعد بن أبي وقاص، وتكرر ذلك ثلاثة أيام.",
        achievements: ["قائد معركة القادسية", "أول من رمى بسهم في الإسلام", "مجاب الدعوة بدعاء النبي له"],
        icon: Target, 
        color: "text-rose-500",
        accent: "bg-rose-500/20"
    },
    { 
        id: 'said',
        name: "سعيد بن زيد", 
        title: "المستجاب الدعوة", 
        category: 'promised',
        keyMoment: "الثبات في وجه قريش",
        role: "من السابقين الأولين للإسلام، وزوج أخت عمر بن الخطاب.", 
        bio: "أحد العشرة المبشرين بالجنة، عُرف بزهده وعبادته وبعده عن الفتن. كان والده زيد بن عمرو يبحث عن التوحيد قبل البعثة.",
        fullStory: "سعيد بن زيد القرشي، ابن زيد بن عمرو بن نفيل الذي مات على التوحيد قبل البعثة. أسلم سعيد قديماً هو وزوجته فاطمة بنت الخطاب، وكانا سبباً في إسلام الفاروق عمر. شهد المشاهد كلها مع رسول الله إلا بدراً (كان في مهمة استطلاعية). عُرف بزهده الشديد في المناصب والولايات، وكان يفضل العبادة والجهاد. عاش طويلاً حتى توفي عام 51 هـ، وكان مستجاب الدعوة بشهادة الصحابة.",
        bshara: "روى هو بنفسه حديث العشرة المبشرين بالجنة وذكر نفسه فيهم، وقال: «أشهد على رسول الله ﷺ أني سمعته يقول... وسعيد بن زيد في الجنة».",
        achievements: ["أحد العشرة المبشرين", "سبب إسلام عمر بن الخطاب", "من السابقين الأولين للإسلام"],
        icon: Heart, 
        color: "text-purple-400",
        accent: "bg-purple-500/20"
    },
    { 
        id: 'abu-ubaidah',
        name: "أبو عبيدة بن الجراح", 
        title: "أمين هذه الأمة", 
        category: 'promised',
        keyMoment: "الصبر والزهد في القيادة",
        role: "أحد العشرة المبشرين، والقائد الزاهد الذي فتح بلاد الشام.", 
        bio: "قال عنه النبي ﷺ: 'لكل أمة أمين، وأمين هذه الأمة أبو عبيدة'. عُرف بأمانته وتواضعه الشديد.",
        fullStory: "عامر بن عبد الله بن الجراح، الملقب بـ 'أمين الأمة'. كان من أوائل المهاجرين للحبشة ثم للمدينة. يوم أحد، استخرج حلقتي المغفر من وجنتي النبي ﷺ بأسنانه حتى سقطت ثناياه (أسنانه الأمامية). قاد جيوش الفتح في بلاد الشام، وحين زاره عمر بن الخطاب في بيته وجده لا يملك إلا سيفه وترسه وفرشه، فبكى عمر وقال: 'غيرتنا الدنيا كلنا غيرك يا أبا عبيدة'. توفي في طاعون عمواس عام 18 هـ.",
        bshara: "قال ﷺ: «أبو عبيدة بن الجراح في الجنة»، وحين قدم أهل نجران طلبوا رجلاً أميناً، فأمسك النبي ﷺ بيد أبي عبيدة وقال: «هذا أمين هذه الأمة».",
        achievements: ["أمين هذه الأمة", "فاتح بلاد الشام", "أحد العشرة المبشرين"],
        icon: Medal, 
        color: "text-teal-400",
        accent: "bg-teal-500/20"
    },
    { 
        id: 'hamza',
        name: "حمزة بن عبد المطلب", 
        title: "أسد الله", 
        category: 'shuhada',
        keyMoment: "نصرة النبي بمكة",
        role: "سيد الشهداء وعم النبي ﷺ والدرع الحصين للإسلام.", 
        bio: "بطل شجاع، كان إسلامه عزاً للمسلمين في مكة. استشهد في معركة أحد مقبلاً غير مدبر، وحزن عليه النبي ﷺ حزناً شديداً.",
        fullStory: "حمزة بن عبد المطلب، عم النبي ﷺ وأخوه من الرضاعة. كان من أقوى فتيان قريش وأكثرهم هيبة. أعلن إسلامه عندما علم بإيذاء أبي جهل للنبي ﷺ، فدخل المسجد الحرام وشج رأسه قائلاً: 'أتشتمه وأنا على دينه؟'. كان يلقب بـ 'أسد الله' لشجاعته الفائقة في بدر. في معركة أحد، كان يقاتل بسيفين أمام النبي ﷺ حتى استشهد غدراً برمية رمح. لقبه النبي ﷺ بـ 'سيد الشهداء' وبكى عليه بكاءً مراً لم يبكه على أحد من قبل.",
        bshara: "قال ﷺ: «سيد الشهداء حمزة بن عبد المطلب»، ورآه النبي ﷺ في رؤيا يشرب لبناً في الجنة.",
        achievements: ["صاحب أول لواء في الإسلام", "قتل صناديد قريش في بدر", "لقبه النبي بسيد الشهداء"],
        icon: Star, 
        color: "text-orange-500",
        accent: "bg-orange-500/20"
    },
    { 
        id: 'khalid',
        name: "خالد بن الوليد", 
        title: "سيف الله المسلول", 
        category: 'leaders',
        keyMoment: "الانسحاب العبقري في مؤتة",
        role: "القائد الذي لم يُهزم في أكثر من مائة معركة.", 
        bio: "عبقرية عسكرية فذة، سماه النبي ﷺ سيف الله المسلول. أنقذ جيش المسلمين في مؤتة بحنكته، وكان سبباً في فتوحات عظيمة.",
        fullStory: "خالد بن الوليد بن المغيرة، أسلم قبل فتح مكة وصار أعظم قادة الإسلام العسكريين. في غزوة مؤتة، تكسرت في يده تسعة أسياف، واستطاع بعبقرية نادرة أن ينسحب بالجيش أمام 200 ألف من الروم دون خسائر تذكر، فلقبه النبي ﷺ بـ 'سيف من سيوف الله'. خاض معارك اليرموك والولجة واليمامة، ولم يُهزم في أي منها قط. كان يقول عند وفاته وهو يبكي: 'ما في جسدي موضع شبر إلا وفيه ضربة سيف أو طعنة رمح، وها أنا ذا أموت على فراشي كما يموت البعير، فلا نامت أعين الجبناء'.",
        achievements: ["بطل معركة اليرموك", "لم يُهزم في حياته أبداً", "أنهى إمبراطورية الفرس", "سيف الله المسلول"],
        icon: Zap, 
        color: "text-zinc-400",
        accent: "bg-zinc-500/20"
    },
    { 
        id: 'musab',
        name: "مصعب بن عمير", 
        title: "سفير الإسلام الأول", 
        category: 'shuhada',
        keyMoment: "نشر الإسلام في يثرب",
        role: "الشاب المترف الذي ترك النعيم من أجل جنة رب العالمين.", 
        bio: "كان أنعم فتى في مكة، فترك الثراء والجمال ليكون أول سفير للنبي ﷺ إلى المدينة المنورة، وفتحها بالقرآن.",
        fullStory: "مصعب بن عمير، كان يلبس أغلى الثياب ويضع أطيب العطور، فلما أسلم منعته أمه المال وحبسته، فصبر وهاجر للحبشة. اختاره النبي ﷺ ليكون أول معلم للقرآن في المدينة، فأسلم على يديه كبار الأنصار مثل سعد بن معاذ. في أحد، حمل اللواء وثبت بجوار النبي ﷺ حتى قُطعت يده اليمنى فأمسك اللواء باليسرى، ثم قُطعت اليسرى فاحتضنه بصدره حتى استشهد. لم يجدوا كفناً يغطيه كاملاً، فبكى النبي ﷺ تذكراً لنعيمه القديم وشهادته العظيمة.",
        achievements: ["أول سفير في الإسلام", "أسلمت المدينة على يديه", "حامل لواء النبي في أحد"],
        icon: BookOpen, 
        color: "text-cyan-400",
        accent: "bg-cyan-500/20"
    },
    { 
        id: 'jaafar',
        name: "جعفر بن أبي طالب", 
        title: "الطيار", 
        category: 'shuhada',
        keyMoment: "خطابه أمام النجاشي",
        role: "صاحب الهجرتين والخطيب المفوه الذي نصر الإسلام في الحبشة.", 
        bio: "أشبه الناس خلقاً وخُلقاً بالنبي ﷺ. قاد المهاجرين للحبشة، واستشهد في مؤتة وهو يذود عن لواء الإسلام.",
        fullStory: "جعفر بن أبي طالب، أخو علي بن أبي طالب. هاجر للحبشة وكان المتحدث باسم المسلمين أمام ملكها النجاشي، فأقنعه بجمال الإسلام وحمايتهم. عاد يوم فتح خيبر فقبله النبي ﷺ وقال: 'لا أدري بأيهما أنا أسر؟ بفتح خيبر أم بقدوم جعفر'. في غزوة مؤتة، حمل الراية بعد زيد، فقطعت يمينه فأمسكها بشماله، فقطعت شماله فاحتضنها بعضديه حتى قتل وفيه بضع وثمانون طعنة. بشر النبي ﷺ بأن الله أبدله بجناحين يطير بهما في الجنة حيث يشاء، فلقب بـ 'جعفر الطيار'.",
        bshara: "قال ﷺ: «رأيت جعفراً يطير في الجنة مع الملائكة بجناحين» إثر استشهاده وقطعت يداه في غزوة مؤتة.",
        achievements: ["قائد هجرة الحبشة", "أبدله الله جناحين في الجنة", "أشبه الناس بالنبي ﷺ"],
        icon: MapPin, 
        color: "text-sky-400",
        accent: "bg-sky-500/20"
    },
];

const CATEGORIES = [
    { id: 'all', label: 'الكل', icon: Users },
    { id: 'rashidun', label: 'الخلفاء الراشدون', icon: Crown },
    { id: 'promised', label: 'المبشرون بالجنة', icon: Sparkles },
    { id: 'leaders', label: 'قادة الجيوش', icon: Sword },
    { id: 'shuhada', label: 'الشهداء', icon: Flame },
];

export function SeerahCompanions() {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isReadingFullStory, setIsReadingFullStory] = useState(false);

    const filteredCompanions = selectedCategory === 'all' 
        ? COMPANIONS 
        : COMPANIONS.filter(c => c.category === selectedCategory);

    const selectedCompanion = COMPANIONS.find(c => c.id === selectedId);

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    const handleClose = () => {
        setSelectedId(null);
        setTimeout(() => setIsReadingFullStory(false), 300);
    };

    return (
        <section className={cn("py-20 relative", selectedId ? "z-50" : "z-10")} dir="rtl">
            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-3 mb-16">
                {CATEGORIES.map((cat) => (
                    <Button
                        key={cat.id}
                        variant={selectedCategory === cat.id ? 'default' : 'outline'}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={cn(
                            "rounded-2xl px-8 h-14 font-black transition-all text-lg",
                            selectedCategory === cat.id 
                                ? "bg-amber-500 text-white shadow-xl shadow-amber-500/20 scale-105" 
                                : "bg-white/5 border-white/10 hover:bg-white/10 text-white/60"
                        )}
                    >
                        <cat.icon className="w-5 h-5 me-3" />
                        {cat.label}
                    </Button>
                ))}
            </div>

            {/* Companions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <AnimatePresence mode="popLayout">
                    {filteredCompanions.map((companion, i) => (
                        <motion.div
                            key={companion.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.4 }}
                            onClick={() => setSelectedId(companion.id)}
                            className="cursor-pointer group"
                        >
                            <div className="p-10 rounded-[3rem] bg-white/[0.01] border border-white/5 backdrop-blur-3xl relative overflow-hidden transition-all duration-700 hover:bg-white/[0.05] hover:border-white/10 hover:scale-[1.02] shadow-2xl h-full flex flex-col">
                                <div className={cn("absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[60px] opacity-0 group-hover:opacity-20 transition-opacity", companion.accent)} />
                                
                                <div className="relative z-10 flex flex-col h-full">
                                    <div className={cn("w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-8 transition-all duration-700 group-hover:scale-110 group-hover:rotate-6 shadow-xl", companion.color)}>
                                        <companion.icon size={32} />
                                    </div>
                                    <h4 className="text-3xl font-black text-white mb-2 font-headline leading-tight">{companion.name}</h4>
                                    <div className="flex items-center gap-2 mb-6">
                                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                        <span className="text-amber-500 font-black text-[10px] uppercase tracking-[0.2em]">{companion.title}</span>
                                    </div>
                                    
                                    <div className="mt-auto pt-6 border-t border-white/5 space-y-4">
                                        <div className="flex items-start gap-3">
                                            <Target className="w-4 h-4 text-primary shrink-0 mt-1" />
                                            <div>
                                                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">الموقف الأبرز</p>
                                                <p className="text-white/80 font-bold text-xs leading-relaxed">{companion.keyMoment}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Companion Encyclopedia Modal rendered via Portal */}
            {mounted && createPortal(
            <AnimatePresence>
                {selectedId && selectedCompanion && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-10">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleClose}
                            className="absolute inset-0 bg-[#050505]/95 backdrop-blur-2xl"
                        />
                        
                        <motion.div 
                            layout
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className={cn(
                                "relative w-full transition-all duration-700 bg-[#0f0f0f] border border-white/10 rounded-[3rem] overflow-hidden shadow-[0_0_150px_rgba(0,0,0,0.8)] z-10 p-6 md:p-10 flex flex-col max-h-[90vh]",
                                isReadingFullStory ? "max-w-4xl h-[85vh]" : "max-w-xl text-center"
                            )}
                        >
                            {/* Close Button */}
                            <Button 
                                onClick={handleClose}
                                variant="ghost" 
                                size="icon" 
                                className="absolute top-6 left-6 rounded-full bg-white/5 hover:bg-white/10 text-white h-10 w-10 z-50"
                            >
                                <X size={20} />
                            </Button>

                            {/* Back to Summary Button (Story Mode only) */}
                            {isReadingFullStory && (
                                <Button 
                                    onClick={() => setIsReadingFullStory(false)}
                                    variant="ghost" 
                                    className="absolute top-6 right-6 text-white/40 hover:text-white font-black text-xs uppercase tracking-widest gap-2"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    العودة للملخص
                                </Button>
                            )}

                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                <div className={cn("flex flex-col items-center", isReadingFullStory ? "items-start text-right" : "")}>
                                    
                                    {!isReadingFullStory ? (
                                        <>
                                            <div className={cn("w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6 shadow-2xl", selectedCompanion.color)}>
                                                <selectedCompanion.icon size={28} />
                                            </div>

                                            <h2 className="text-3xl md:text-4xl font-black text-white font-headline mb-3">{selectedCompanion.name}</h2>
                                            <div className="px-5 py-1 rounded-full bg-white/5 border border-white/10 inline-flex items-center gap-2 mb-6">
                                                <Crown className="w-3.5 h-3.5 text-amber-500" />
                                                <span className="text-amber-500 font-black text-xs uppercase tracking-widest">{selectedCompanion.title}</span>
                                            </div>

                                            {selectedCompanion.bshara && (
                                                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-5 w-full max-w-md mx-auto">
                                                    <h5 className="flex items-center justify-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-widest mb-1.5">
                                                        <Sparkles className="w-3 h-3" />
                                                        بشارة الجنة
                                                    </h5>
                                                    <p className="text-xs text-emerald-400 font-bold leading-relaxed">
                                                        {selectedCompanion.bshara}
                                                    </p>
                                                </div>
                                            )}

                                            <div className="p-4 rounded-3xl bg-primary/5 border border-primary/20 mb-6 w-full max-w-md mx-auto">
                                                <h5 className="flex items-center justify-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.3em] mb-2">
                                                    <History className="w-3.5 h-3.5" />
                                                    الموقف الأبرز
                                                </h5>
                                                <p className="text-base text-white font-black leading-tight">{selectedCompanion.keyMoment}</p>
                                            </div>

                                            <div className="max-w-lg mx-auto">
                                                <p className="text-base text-white/90 font-bold leading-relaxed italic">
                                                    "{selectedCompanion.bio}"
                                                </p>
                                            </div>

                                            <div className="mt-6 flex justify-center gap-4">
                                                <Button 
                                                    onClick={() => setIsReadingFullStory(true)}
                                                    className="h-12 px-8 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-base shadow-xl shadow-amber-500/20 group"
                                                >
                                                    <BookOpen className="w-4 h-4 me-2 group-hover:rotate-12 transition-transform" />
                                                    سيرة الصحابي الكاملة
                                                </Button>
                                            </div>
                                        </>
                                    ) : (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="w-full space-y-10 py-10"
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className={cn("w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center shrink-0 shadow-2xl", selectedCompanion.color)}>
                                                    <selectedCompanion.icon size={28} />
                                                </div>
                                                <div>
                                                    <h2 className="text-4xl font-black text-white font-headline leading-none">{selectedCompanion.name}</h2>
                                                    <p className="text-amber-500 font-black text-xs uppercase tracking-[0.2em] mt-2">
                                                        {selectedCompanion.title}
                                                    </p>
                                                </div>
                                            </div>

                                            {selectedCompanion.bshara && (
                                                <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/20">
                                                    <h4 className="text-emerald-500 font-black text-xs uppercase tracking-widest flex items-center gap-2 mb-3">
                                                        <Sparkles className="w-4 h-4" />
                                                        بشارة الجنة وموقفها
                                                    </h4>
                                                    <p className="text-emerald-400 text-lg font-bold leading-relaxed">
                                                        {selectedCompanion.bshara}
                                                    </p>
                                                </div>
                                            )}

                                            <div className="prose prose-invert max-w-none">
                                                <p className="text-2xl text-white font-bold leading-relaxed opacity-90 first-letter:text-5xl first-letter:font-black first-letter:text-amber-500">
                                                    {selectedCompanion.fullStory}
                                                </p>
                                            </div>

                                            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 space-y-6">
                                                <h4 className="text-white/40 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                                                    <Award className="w-4 h-4" />
                                                    الفضائل والمنجزات
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {selectedCompanion.achievements.map((item, idx) => (
                                                        <div key={idx} className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group/item">
                                                            <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 font-black text-xs group-hover/item:bg-amber-500 group-hover/item:text-white transition-colors">
                                                                {idx + 1}
                                                            </div>
                                                            <p className="text-white/90 text-sm font-bold">{item}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
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
