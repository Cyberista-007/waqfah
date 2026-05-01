'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Heart, Users, Crown, Info, X, Sparkles, BookOpen, Shield, Calendar, Baby, ArrowLeft, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface FamilyMember {
    id: string;
    name: string;
    relation: string;
    category: 'parents' | 'wives' | 'children';
    mother?: string;
    birth?: string;
    death?: string;
    ageAtDeath?: string;
    bio: string;
    fullStory: string;
    color: string;
    accent: string;
}

const FAMILY: FamilyMember[] = [
    // Parents
    { 
        id: 'abdullah', 
        name: "عبد الله بن عبد المطلب", 
        relation: "والد النبي ﷺ", 
        category: 'parents',
        birth: "81 قبل الهجرة تقريباً",
        death: "53 قبل الهجرة",
        ageAtDeath: "25 سنة",
        bio: "والد النبي ﷺ، توفي وهو جنين في بطن أمه. كان أحب أبناء عبد المطلب إليه، وفداه بمائة من الإبل.",
        fullStory: "عبد الله بن عبد المطلب هو الذبيح الثاني بعد إسماعيل عليه السلام، حيث نذر والده عبد المطلب إن رزقه الله عشرة أبناء أن يذبح أحدهم قرباناً، وخرج السهم على عبد الله، ففداه أهله بمائة من الإبل. تزوج بآمنة بنت وهب، وخرج في رحلة تجارية إلى الشام، وفي طريق العودة مرض وتوفي في يثرب (المدينة المنورة) ودفن بها، وكان النبي ﷺ لا يزال جنيناً في بطن أمه. ترك عبد الله إرثاً من النبل والجمال وُصف به في مكة، وكان نور النبوة يرى في وجهه.",
        color: "text-amber-500", 
        accent: "bg-amber-500" 
    },
    { 
        id: 'amina', 
        name: "آمنة بنت وهب", 
        relation: "والدة النبي ﷺ", 
        category: 'parents',
        birth: "77 قبل الهجرة تقريباً",
        death: "47 قبل الهجرة",
        ageAtDeath: "30 سنة",
        bio: "أم النبي ﷺ، رأت حين حملت به نورا خرج منها أضاءت له قصور بصرى من أرض الشام. توفيت والنبي ﷺ في السادسة من عمره.",
        fullStory: "آمنة بنت وهب بن عبد مناف، كانت تُعد من أفضل نساء قريش نسباً ومكانة. تزوجت بعبد الله بن عبد المطلب ولم يمكث معها طويلاً حتى توفي. شهدت آمنة في حملها آيات وبركات، ورأت رؤى تبشر بعظمة وليدها. توفيت وهي في طريق العودة من المدينة المنورة إلى مكة في مكان يُسمى 'الأبواء'، وكان النبي ﷺ حينها في السادسة من عمره، فترك ذلك في نفسه أثراً عميقاً من الحنين والوفاء.",
        color: "text-rose-500", 
        accent: "bg-rose-500" 
    },
    { 
        id: 'abdul-muttalib', 
        name: "عبد المطلب", 
        relation: "جد النبي ﷺ", 
        category: 'parents',
        birth: "127 قبل الهجرة تقريباً",
        death: "45 قبل الهجرة",
        ageAtDeath: "82 سنة",
        bio: "سيد قريش، كفل النبي ﷺ بعد وفاة أمه وأحبه حباً شديداً. كان يقول: 'إن لابني هذا شأناً'.",
        fullStory: "شيبة الحمد عبد المطلب بن هاشم، سيد مكة وكبير قريش في زمانه. هو الذي أعاد حفر بئر زمزم بعد أن طُمرت لقرون. كان صاحب هيبة وحكمة، ووقف في وجه أبرهة الحبشي حين جاء لهدم الكعبة قائلاً: 'أنا رب الإبل، وللبيت رب يحميه'. كفل حفيده محمداً ﷺ بعد وفاة أمه آمنة، وكان يضعه معه على فراشه بجوار الكعبة ويمنع أحداً من الجلوس عليه، وكان يقول لمستنكريه: 'دعوا ابني، فإن له شأناً'. توفي والنبي ﷺ في الثامنة من عمره.",
        color: "text-blue-500", 
        accent: "bg-blue-500" 
    },

    // Wives (Mothers of the Believers)
    { 
        id: 'khadija', 
        name: "خديجة بنت خويلد", 
        relation: "زوجة النبي ﷺ", 
        category: 'wives',
        birth: "68 قبل الهجرة",
        death: "3 قبل الهجرة",
        ageAtDeath: "65 سنة",
        bio: "أولى زوجاته ﷺ، ناصرته بمالها ونفسها حين كذبه الناس. بشرها الله ببيت في الجنة من قصب.",
        fullStory: "خديجة بنت خويلد، الطاهرة، سيدة نساء العالمين. كانت تاجرة ذات مال وشرف، اختارت محمداً ﷺ لصدقه وأمانته قبل البعثة. كانت أول من آمن برسالة الإسلام، وحين نزل الوحي وارتجف النبي ﷺ، قالت كلماتها الخالدة: 'كلا والله لا يخزيك الله أبداً'. بذلت مالها كله في سبيل الله، وصبرت مع النبي ﷺ في حصار الشعب. حزن النبي ﷺ لوفاتها حزناً شديداً وسُمي العام بـ 'عام الحزن'، وظل يذكرها ويفخر بحبها قائلاً: 'إني رُزقت حبها'.",
        color: "text-rose-400", 
        accent: "bg-rose-500" 
    },
    { 
        id: 'sawda', 
        name: "سودة بنت زمعة", 
        relation: "زوجة النبي ﷺ", 
        category: 'wives',
        birth: "قبل الهجرة",
        death: "54 هـ",
        ageAtDeath: "80 سنة تقريباً",
        bio: "تزوجها النبي ﷺ بعد وفاة خديجة بمكة، كانت تخدمه وتؤنسه. وهبت يومها لعائشة.",
        fullStory: "السيدة سودة بنت زمعة، كانت من السابقات إلى الإسلام وهاجرت إلى الحبشة. بعد وفاة السيدة خديجة، تزوجها النبي ﷺ بمكة لتكون أماً لبناته ورفيقة لدربه. عُرفت بروحها الطيبة وحبها للصدقة. حين كبرت في السن وخافت أن يطلقها النبي ﷺ، وهبت يومها للسيدة عائشة رضي الله عنها، رغبةً منها في أن تُبعث زوجة للنبي ﷺ في الجنة. كانت ضخمة الجسم، عظيمة القدر، شديدة الوفاء لرسول الله ﷺ.",
        color: "text-zinc-400", 
        accent: "bg-zinc-500" 
    },
    { 
        id: 'aisha', 
        name: "عائشة بنت أبي بكر", 
        relation: "زوجة النبي ﷺ", 
        category: 'wives',
        birth: "9 قبل الهجرة",
        death: "58 هـ",
        ageAtDeath: "67 سنة",
        bio: "أحب زوجات النبي ﷺ إليه، والفقيهة العالمة التي نقلت للأمة شطراً كبيراً من الدين.",
        fullStory: "عائشة بنت أبي بكر الصديق، المبرأة من فوق سبع سموات. كانت أحب الناس إلى النبي ﷺ بعد أبيها. تميزت بذكاء فذ وحافظة قوية، مما جعلها المرجع الأول للصحابة في أحاديث النبي ﷺ وأحكام الفقه. توفي النبي ﷺ في بيتها وبين سحرها ونحرها. عاشت بعده تنشر العلم والقرآن، ورُوي عنها أكثر من 2000 حديث شريف. كانت مدرسة متنقلة، وعُرفت بالزهد والصدقة رغم الثراء الذي فتح الله به على المسلمين.",
        color: "text-blue-400", 
        accent: "bg-blue-500" 
    },
    { 
        id: 'hafsa', 
        name: "حفصة بنت عمر", 
        relation: "زوجة النبي ﷺ", 
        category: 'wives',
        birth: "18 قبل الهجرة",
        death: "45 هـ",
        ageAtDeath: "63 سنة",
        bio: "ابنة الفاروق عمر، الصوامة القوامة. كانت مؤتمنة على أول نسخة من المصحف الشريف.",
        fullStory: "حفصة بنت عمر بن الخطاب، لقبت بـ 'الصوامة القوامة'. هاجرت مع زوجها الأول إلى المدينة، وبعد وفاته تأثر أبوها عمر، فعرضها على أبي بكر وعثمان فلم يجيباه، فخطبها النبي ﷺ لنفسه. عُرفت بصلابتها في الحق وحبها للعلم، وكانت من القلائل اللاتي تعلمن الكتابة في مكة. اختارها الصحابة لتكون حارسة لأول مصحف مكتوب جُمع في عهد أبي بكر الصديق، وظل عندها حتى عهد عثمان بن عفان حين نُسخت منه المصاحف.",
        color: "text-emerald-400", 
        accent: "bg-emerald-500" 
    },
    { 
        id: 'zaynab-khuzayma', 
        name: "زينب بنت خزيمة", 
        relation: "زوجة النبي ﷺ", 
        category: 'wives',
        birth: "26 قبل الهجرة تقريباً",
        death: "4 هـ",
        ageAtDeath: "30 سنة",
        bio: "لُقبت بـ 'أم المساكين' لكثرة إطعامها وصدقتها عليهم. توفيت سريعاً بعد الزواج.",
        fullStory: "زينب بنت خزيمة رضي الله عنها، لُقبت في الجاهلية والإسلام بـ 'أم المساكين' لشدة رحمتها بالفقراء وكثرة صدقاتها. تزوجها النبي ﷺ في السنة الثالثة للهجرة، ولم تمكث معه سوى أشهر قليلة حتى توفيت بالمدينة المنورة. كانت من أرحم النساء بالضعفاء، وصلى عليها النبي ﷺ ودفنها بالبقيع.",
        color: "text-yellow-400", 
        accent: "bg-yellow-500" 
    },
    { 
        id: 'umm-salama', 
        name: "أم سلمة", 
        relation: "زوجة النبي ﷺ", 
        category: 'wives',
        birth: "28 قبل الهجرة",
        death: "61 هـ",
        ageAtDeath: "89 سنة",
        bio: "صاحبة الرأي الراجح، استشارها النبي ﷺ يوم الحديبية فكان رأيها فرجاً للمسلمين.",
        fullStory: "هند بنت أبي أمية، المعروفة بـ 'أم سلمة'. كانت من أوائل المهاجرات إلى الحبشة ثم إلى المدينة، وعانت في هجرتها لوعة الفراق والأسر. بعد وفاة زوجها أبي سلمة، تزوجها النبي ﷺ ليرعى أيتامها. عُرفت بجمالها وعقلها الراجح، وكان لها دور محوري في صلح الحديبية؛ فحين تعب الصحابة ولم يمتثلوا لأمر النبي ﷺ بالتحلل، استشارها، فقالت: 'اخرج يا رسول الله فاحلق وانحر ولا تكلم أحداً'، ففعل النبي ﷺ واقتدى به المسلمون.",
        color: "text-indigo-400", 
        accent: "bg-indigo-500" 
    },
    { 
        id: 'zaynab-jahsh', 
        name: "زينب بنت جحش", 
        relation: "زوجة النبي ﷺ", 
        category: 'wives',
        birth: "32 قبل الهجرة",
        death: "20 هـ",
        ageAtDeath: "52 سنة",
        bio: "ابنة عمة النبي ﷺ، زوجها الله إياه من فوق سبع سموات.",
        fullStory: "زينب بنت جحش، ابنة عمة النبي ﷺ أميمة بنت عبد المطلب. تميز زواجها من النبي ﷺ بنزول آيات قرآنية تثبت هذا الزواج (فلما قضى زيد منها وطراً زوجناكها)، فكانت تفتخر على زوجات النبي ﷺ قائلة: 'زوجكن أهاليكن، وزوجني الله من فوق سبع سموات'. كانت امرأة صالحة، تعمل بيدها وتتصدق بكسبها على الفقراء.",
        color: "text-purple-400", 
        accent: "bg-purple-500" 
    },
    { 
        id: 'juwayriya', 
        name: "جويرية بنت الحارث", 
        relation: "زوجة النبي ﷺ", 
        category: 'wives',
        birth: "15 قبل الهجرة",
        death: "50 هـ",
        ageAtDeath: "65 سنة",
        bio: "بزواج النبي ﷺ منها أطلق المسلمون سراح مائة أهل بيت من قومها إكراماً له.",
        fullStory: "جويرية بنت الحارث، ابنة سيد بني المصطلق. وقعت في الأسر بعد غزوة بني المصطلق، فجاءت تطلب من النبي ﷺ أن يعينها في مكاتبة عتقها، فخيرها النبي ﷺ في أن يقضي عنها مكاتبتها ويتزوجها، فوافقت. حين علم الصحابة بهذا الزواج، قالوا: 'أصهار رسول الله في الأسر!'، فأعتقوا كل من كان في أيديهم من بني المصطلق.",
        color: "text-teal-400", 
        accent: "bg-teal-500" 
    },
    { 
        id: 'umm-habiba', 
        name: "أم حبيبة", 
        relation: "زوجة النبي ﷺ", 
        category: 'wives',
        birth: "25 قبل الهجرة",
        death: "44 هـ",
        ageAtDeath: "69 سنة",
        bio: "صبرت في هجرتها للحبشة وبقيت ثابتة على دينها. تزوجها النبي ﷺ وهي هناك لتكريمها.",
        fullStory: "رملة بنت أبي سفيان، المعروفة بـ 'أم حبيبة'. ابنة زعيم قريش، هاجرت مع زوجها إلى الحبشة فراراً بدينها، وهناك ارتد زوجها عن الإسلام ومات، فبقيت وحيدة صابرة في أرض الغربة. كرمها النبي ﷺ بأن أرسل للنجاشي يطلب زواجها، فكان النجاشي هو الذي وكّلها وأصدقها عن النبي ﷺ.",
        color: "text-orange-400", 
        accent: "bg-orange-500" 
    },
    { 
        id: 'safiyya', 
        name: "صفية بنت حيي", 
        relation: "زوجة النبي ﷺ", 
        category: 'wives',
        birth: "9 قبل الهجرة",
        death: "50 هـ",
        ageAtDeath: "59 سنة",
        bio: "من نسل نبي الله هارون عليه السلام، كانت عاقلة حليمة فاضلة.",
        fullStory: "صفية بنت حيي بن أخطب، من سبط نبي الله هارون بن عمران عليه السلام. وقعت في الأسر يوم خيبر، فأعتقها النبي ﷺ وجعل عتقها صداقها وتزوجها. عُرفت بجمالها وحلمها وعمق إيمانها. دافع عنها النبي ﷺ حين غارت منها بعض أمهات المؤمنين قائلاً: 'إن أباك نبي، وإن عمك نبي، وإنك لتحت نبي، ففيم تفتخر عليك؟'.",
        color: "text-cyan-400", 
        accent: "bg-cyan-500" 
    },
    { 
        id: 'maymuna', 
        name: "ميمونة بنت الحارث", 
        relation: "زوجة النبي ﷺ", 
        category: 'wives',
        birth: "28 قبل الهجرة",
        death: "51 هـ",
        ageAtDeath: "79 سنة",
        bio: "آخر من تزوج النبي ﷺ من أمهات المؤمنين. كانت شديدة التقوى.",
        fullStory: "ميمونة بنت الحارث الهلالية، كانت خالة لعبد الله بن عباس وخالد بن الوليد. تزوجها النبي ﷺ في عمرة القضاء، وكانت آخر زوجاته دخولاً عليه. عُرفت بشدة الورع وتقوى الله، وقالت عنها السيدة عائشة رضي الله عنها: 'أما إنها كانت من أتقانا لله وأوصلنا للرحم'.",
        color: "text-lime-400", 
        accent: "bg-lime-500" 
    },
    { 
        id: 'mariya', 
        name: "مارية القبطية", 
        relation: "زوجة النبي ﷺ", 
        category: 'wives',
        birth: "قبل الهجرة",
        death: "16 هـ",
        ageAtDeath: "30-35 سنة",
        bio: "أهداها المقوقس للنبي ﷺ، رزق منها بابنه إبراهيم. حظيت بمكانة غالية.",
        fullStory: "مارية بنت شمعون القبطية، أهداها المقوقس صاحب مصر للنبي ﷺ في السنة السابعة للهجرة. أسلمت في طريقها للمدينة وحسُن إسلامها. رزقها الله بشرف عظيم؛ إذ كانت الوحيدة التي أنجبت للنبي ﷺ بعد السيدة خديجة، فأنجبت ابنه إبراهيم. حظيت برعاية خاصة من النبي ﷺ، وأوصى بها وبأهلها خيراً.",
        color: "text-sky-400", 
        accent: "bg-sky-500" 
    },

    // Children
    { 
        id: 'fatima', 
        name: "فاطمة الزهراء", 
        relation: "ابنة النبي ﷺ", 
        category: 'children',
        mother: "خديجة بنت خويلد",
        birth: "18 قبل الهجرة",
        death: "11 هـ",
        ageAtDeath: "29 سنة",
        bio: "أحب أولاد النبي ﷺ إليه، سيدة نساء أهل الجنة.",
        fullStory: "فاطمة بنت محمد ﷺ، الملقبة بـ 'الزهراء' و'البتول'. كانت أحب الناس إلى قلبه، وكان إذا رآها قام إليها فقبلها وأجلسها مكانه. عُرفت بـ 'أم أبيها' لعنايتها الشديدة بالنبي ﷺ بعد وفاة أمها. تزوجت بعلي بن أبي طالب رضي الله عنه وعاشا حياة الزهد والتقوى، ومن نسلهما كان الحسن والحسين سيدا شباب أهل الجنة. كانت أول أهله لحوقاً به بعد وفاته بثمانية أشهر.",
        color: "text-emerald-500", 
        accent: "bg-emerald-500" 
    },
    { 
        id: 'al-qasim', 
        name: "القاسم بن محمد", 
        relation: "ابن النبي ﷺ", 
        category: 'children',
        mother: "خديجة بنت خويلد",
        birth: "24 قبل الهجرة",
        death: "22 قبل الهجرة",
        ageAtDeath: "سنتان",
        bio: "أكبر أبناء النبي ﷺ وبه يُكنى (أبا القاسم). توفي صغيراً.",
        fullStory: "القاسم بن محمد، هو الابن البكر لرسول الله ﷺ ومنه أخذ كنيته الشهيرة 'أبو القاسم'. ولد في مكة المكرمة قبل البعثة النبوية الشريفة، وفرح به النبي ﷺ والسيدة خديجة فرحاً كبيراً. لم يطل عمر القاسم طويلاً، إذ توفي وهو طفل رضيع. كانت وفاته أول ابتلاء للنبي ﷺ في أولاده.",
        color: "text-amber-400", 
        accent: "bg-amber-500" 
    },
    { 
        id: 'zaynab-child', 
        name: "زينب بنت محمد", 
        relation: "ابنة النبي ﷺ", 
        category: 'children',
        mother: "خديجة بنت خويلد",
        birth: "23 قبل الهجرة",
        death: "8 هـ",
        ageAtDeath: "31 سنة",
        bio: "كبرى بنات النبي ﷺ، هاجرت للمدينة بعد بدر. كانت صابرة محتسبة.",
        fullStory: "زينب بنت محمد ﷺ، كبرى بناته وأول صهره. تزوجت بابن خالتها أبي العاص بن الربيع قبل الإسلام، وهاجرت إلى المدينة المنورة في قصة بطولية بعد معركة بدر. عُرفت بصبرها العظيم وحبها لزوجها الذي أسلم لاحقاً بفضل وفائها. كانت من أكثر الناس شبهاً بالنبي ﷺ في حلمه وصبره. توفيت في السنة الثامنة للهجرة.",
        color: "text-rose-400", 
        accent: "bg-rose-500" 
    },
    { 
        id: 'ruqayya', 
        name: "رقية بنت محمد", 
        relation: "ابنة النبي ﷺ", 
        category: 'children',
        mother: "خديجة بنت خويلد",
        birth: "20 قبل الهجرة",
        death: "2 هـ",
        ageAtDeath: "22 سنة",
        bio: "زوجة عثمان بن عفان رضي الله عنه، هاجرت معه للحبشة ثم المدينة.",
        fullStory: "رقية بنت محمد ﷺ، الملقبة بـ 'ذات الهجرتين' لأنها هاجرت مع زوجها عثمان بن عفان إلى الحبشة ثم إلى المدينة المنورة. عُرفت بجمالها وأدبها الرفيع. حين مرضت في المدينة، تخلف عثمان عن غزوة بدر لتمريضها بأمر من النبي ﷺ. توفيت في اليوم الذي جاء فيه البشير بنصر المسلمين في بدر.",
        color: "text-blue-400", 
        accent: "bg-blue-500" 
    },
    { 
        id: 'umm-kulthum-child', 
        name: "أم كلثوم بنت محمد", 
        relation: "ابنة النبي ﷺ", 
        category: 'children',
        mother: "خديجة بنت خويلد",
        birth: "19 قبل الهجرة",
        death: "9 هـ",
        ageAtDeath: "28 سنة",
        bio: "تزوجها عثمان بن عفان بعد وفاة أختها رقية، وبذلك لُقب بـ 'ذو النورين'.",
        fullStory: "أم كلثوم بنت محمد ﷺ، تزوجها عثمان بن عفان رضي الله عنه في السنة الثالثة للهجرة بعد وفاة أختها رقية، ولذلك لُقب عثمان بـ 'ذو النورين' لأنه لم يجمع أحد غيره بين ابنتي نبي. عاشت مع عثمان حياة ملؤها الإيمان والمودة، ولم تلد له. توفيت في السنة التاسعة للهجرة.",
        color: "text-indigo-400", 
        accent: "bg-indigo-500" 
    },
    { 
        id: 'abdullah-child', 
        name: "عبد الله بن محمد", 
        relation: "ابن النبي ﷺ", 
        category: 'children',
        mother: "خديجة بنت خويلد",
        birth: "بعد البعثة",
        death: "قبل الهجرة",
        ageAtDeath: "سنتان",
        bio: "يُلقب بـ 'الطيب' و'الطاهر' لأنه ولد بعد النبوة. توفي صغيراً في مكة.",
        fullStory: "عبد الله بن محمد، ولد في مكة المكرمة بعد بعثة النبي ﷺ، ولذلك لُقب بـ 'الطيب' و'الطاهر'. هو آخر أبناء النبي ﷺ من السيدة خديجة رضي الله عنها. توفي وهو طفل صغير في مكة، وبموته شمت به بعض المشركين، فنزل جبريل عليه السلام بسورة الكوثر تخليداً لذكر النبي ﷺ وكرامته.",
        color: "text-amber-300", 
        accent: "bg-amber-500" 
    },
    { 
        id: 'ibrahim', 
        name: "إبراهيم بن محمد", 
        relation: "ابن النبي ﷺ", 
        category: 'children',
        mother: "مارية القبطية",
        birth: "8 هـ",
        death: "10 هـ",
        ageAtDeath: "18 شهراً",
        bio: "ابن النبي ﷺ من مارية القبطية، ولد بالمدينة وتوفي رضيعاً.",
        fullStory: "إبراهيم بن محمد ﷺ، ولد في المدينة المنورة من السيدة مارية القبطية في السنة الثامنة للهجرة. استبشر به النبي ﷺ وسماه باسم جده إبراهيم عليه السلام. توفي وهو رضيع في السنة العاشرة للهجرة، وحزن النبي ﷺ عليه حزناً مشهوداً، وصادف موته كسوف الشمس، فخطب النبي ﷺ موضحاً أن الشمس والقمر لا ينكسفان لموت أحد.",
        color: "text-amber-200", 
        accent: "bg-amber-500" 
    },
];

const CATEGORIES = [
    { id: 'all', label: 'الكل', icon: Users },
    { id: 'parents', label: 'الآباء والأجداد', icon: Shield },
    { id: 'wives', label: 'أمهات المؤمنين', icon: Heart },
    { id: 'children', label: 'الأبناء والبنات', icon: Sparkles },
];

function Card3D({ member, onClick }: { member: FamilyMember, onClick: () => void }) {
    const cardRef = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    
    const smoothX = useSpring(mouseX, { damping: 20, stiffness: 150 });
    const smoothY = useSpring(mouseY, { damping: 20, stiffness: 150 });
    
    const rotateX = useTransform(smoothY, [-0.5, 0.5], [15, -15]);
    const rotateY = useTransform(smoothX, [-0.5, 0.5], [-15, 15]);

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
        mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    };

    const handlePointerLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            transition={{ duration: 0.5, type: "spring" }}
            onClick={onClick}
            className="perspective-[1000px] cursor-pointer h-full"
        >
            <motion.div
                ref={cardRef}
                onPointerMove={handlePointerMove}
                onPointerLeave={handlePointerLeave}
                style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                className={cn(
                    "relative h-full p-8 md:p-10 rounded-[3rem] bg-[#0f0f0f]/80 backdrop-blur-3xl border border-white/5 transition-colors duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.5)] group",
                    "hover:bg-[#151515] hover:border-white/20"
                )}
            >
                {/* 3D Glow element inside card */}
                <div 
                    className={cn("absolute -top-10 -right-10 w-40 h-40 rounded-full blur-[80px] opacity-10 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none transform-gpu", member.accent)} 
                    style={{ transform: "translateZ(-20px)" }}
                />
                
                <div className="relative z-10 flex flex-col h-full transform-gpu" style={{ transform: "translateZ(30px)" }}>
                    <h4 className="text-3xl font-black text-white mb-2 font-headline leading-tight group-hover:text-amber-400 transition-colors">
                        {member.name}
                    </h4>
                    <p className={cn("font-black text-xs uppercase tracking-[0.2em] mb-6", member.color)}>
                        {member.relation}
                    </p>

                    {member.category === 'children' && member.mother && (
                        <div className="mb-4 flex items-center gap-2 text-white/40 text-[10px] font-black uppercase tracking-widest bg-white/5 w-fit px-3 py-1.5 rounded-full border border-white/10">
                            <Heart className="w-3 h-3 text-rose-500" />
                            <span>الأم: {member.mother}</span>
                        </div>
                    )}
                    
                    <p className="text-white/60 text-sm font-bold leading-relaxed mb-6 line-clamp-3">
                        {member.bio}
                    </p>
                    
                    <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                        <div className="flex gap-4">
                            {member.ageAtDeath && (
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">العمر عند الوفاة</span>
                                    <span className="text-xs text-white/80 font-black">{member.ageAtDeath}</span>
                                </div>
                            )}
                        </div>
                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors", member.color)}>
                            <Info className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

export function SeerahFamilyTree() {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
    const [isReadingFullStory, setIsReadingFullStory] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    const filteredFamily = selectedCategory === 'all' ? FAMILY : FAMILY.filter(m => m.category === selectedCategory);
    const selectedMember = FAMILY.find(m => m.id === selectedMemberId);

    const handleClose = () => {
        setSelectedMemberId(null);
        setTimeout(() => setIsReadingFullStory(false), 300);
    };

    return (
        <section className={cn("py-32 relative overflow-hidden bg-[#020202]", selectedMemberId ? "z-50" : "z-10")} dir="rtl">
            {/* Cinematic Deep Space Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-amber-900/10 rounded-full blur-[120px]" />
                <Image 
                    src="/islamic_geometric_pattern_gold_cinematic_1777414372644.png" 
                    fill 
                    className="object-cover opacity-[0.03] mix-blend-screen" 
                    alt="Background" 
                />
            </div>

            <div className="w-full px-4 md:px-8 lg:px-12 relative z-10">
                <div className="w-full">
                    {/* The Prophet at the Center */}
                    <div className="flex flex-col items-center mb-32 relative">
                        {/* Connecting energetic lines behind */}
                        <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent -z-10" />
                        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gradient-to-b from-transparent via-amber-500/30 to-transparent -z-10" />

                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 1, type: "spring", bounce: 0.4 }}
                            className="relative perspective-[1000px]"
                        >
                            <motion.div 
                                animate={{ rotateY: [0, 10, -10, 0] }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                className="w-64 h-64 md:w-80 md:h-80 rounded-[3rem] bg-gradient-to-br from-amber-500/20 to-black border-2 border-amber-500/30 backdrop-blur-3xl flex flex-col items-center justify-center shadow-[0_0_100px_rgba(245,158,11,0.3)] group cursor-default transform-gpu"
                            >
                                <Crown className="w-16 h-16 text-amber-500 mb-6 drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]" />
                                <h3 className="text-5xl md:text-7xl font-black text-white font-headline drop-shadow-2xl">محمد ﷺ</h3>
                                <p className="text-amber-400 font-black text-sm uppercase tracking-[0.4em] mt-4 bg-black/50 px-4 py-1 rounded-full border border-amber-500/20">رسول الله وخاتم النبيين</p>
                            </motion.div>
                            {/* Orbital rings */}
                            <div className="absolute -inset-10 rounded-[4rem] border border-amber-500/20 animate-spin-slow pointer-events-none" style={{ animationDuration: '20s' }} />
                            <div className="absolute -inset-20 rounded-[5rem] border border-amber-500/10 animate-spin-slow pointer-events-none" style={{ animationDuration: '30s', animationDirection: 'reverse' }} />
                        </motion.div>
                    </div>

                    {/* Category Filter */}
                    <div className="flex flex-wrap justify-center gap-4 mb-20">
                        {CATEGORIES.map((cat) => (
                            <Button
                                key={cat.id}
                                variant="ghost"
                                onClick={() => setSelectedCategory(cat.id)}
                                className={cn(
                                    "rounded-full px-8 h-14 font-black transition-all duration-500 text-sm md:text-base border backdrop-blur-md",
                                    selectedCategory === cat.id 
                                        ? "bg-amber-500/20 border-amber-500/50 text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.2)]" 
                                        : "bg-white/5 border-white/10 hover:bg-white/10 text-white/50 hover:text-white"
                                )}
                            >
                                <cat.icon className={cn("w-5 h-5 me-3 transition-transform", selectedCategory === cat.id ? "scale-110" : "")} />
                                {cat.label}
                            </Button>
                        ))}
                    </div>

                    {/* Family Members Grid (3D Masonry Feel) */}
                    <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <AnimatePresence mode="popLayout">
                            {filteredFamily.map((member) => (
                                <Card3D key={member.id} member={member} onClick={() => setSelectedMemberId(member.id)} />
                            ))}
                        </AnimatePresence>
                    </motion.div>

                    {/* Member Encyclopedia Modal */}
                    {mounted && createPortal(
                    <AnimatePresence>
                        {selectedMemberId && selectedMember && (
                            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-10 perspective-[2000px]">
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={handleClose}
                                    className="absolute inset-0 bg-[#020202]/90 backdrop-blur-xl"
                                />
                                
                                <motion.div 
                                    layout
                                    initial={{ opacity: 0, scale: 0.9, rotateX: -20 }}
                                    animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, rotateX: 20 }}
                                    transition={{ type: "spring", damping: 25, stiffness: 120 }}
                                    className={cn(
                                        "relative w-full transition-all duration-700 bg-gradient-to-br from-[#111] to-[#050505] border border-white/10 rounded-[3rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.9)] z-10 p-8 md:p-12 transform-gpu",
                                        isReadingFullStory ? "max-w-5xl h-[90vh] flex flex-col" : "max-w-2xl text-center"
                                    )}
                                >
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-10 pointer-events-none mix-blend-overlay" />
                                    
                                    {/* Close Button */}
                                    <Button 
                                        onClick={handleClose}
                                        variant="ghost" 
                                        size="icon" 
                                        className="absolute top-6 left-6 rounded-full bg-white/10 hover:bg-white/20 text-white h-10 w-10 z-50 backdrop-blur-md transition-transform hover:rotate-90"
                                    >
                                        <X size={20} />
                                    </Button>

                                    {/* Back to Summary Button */}
                                    {isReadingFullStory && (
                                        <Button 
                                            onClick={() => setIsReadingFullStory(false)}
                                            variant="ghost" 
                                            className="absolute top-6 right-6 text-white/50 hover:text-white font-black text-[10px] uppercase tracking-widest gap-2 bg-white/5 hover:bg-white/10 rounded-full h-10 px-6 backdrop-blur-md"
                                        >
                                            <ArrowLeft className="w-4 h-4" />
                                            العودة للملخص
                                        </Button>
                                    )}

                                    <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 pr-2">
                                        <div className={cn("flex flex-col items-center", isReadingFullStory ? "items-start text-right" : "")}>
                                            
                                            {!isReadingFullStory ? (
                                                <>
                                                    <div className={cn("w-20 h-20 rounded-2xl bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center mx-auto mb-8 shadow-2xl border border-white/10", selectedMember.color)}>
                                                        <Info size={36} className="drop-shadow-md" />
                                                    </div>

                                                    <h2 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 font-headline mb-4 tracking-tighter">{selectedMember.name}</h2>
                                                    
                                                    <div className={cn("px-6 py-2 rounded-full bg-white/5 border border-white/10 inline-flex items-center gap-3 mb-10 shadow-inner", selectedMember.color)}>
                                                        <div className={cn("w-2 h-2 rounded-full animate-pulse", selectedMember.accent)} />
                                                        <span className="font-black text-sm uppercase tracking-widest">{selectedMember.relation}</span>
                                                    </div>

                                                    <div className="max-w-lg mx-auto mb-10">
                                                        <p className="text-lg md:text-2xl text-white/70 font-bold leading-relaxed">
                                                            {selectedMember.bio}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <Button 
                                                            onClick={() => setIsReadingFullStory(true)}
                                                            className="h-14 px-8 rounded-full bg-amber-500 hover:bg-amber-600 text-black font-black text-lg shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:shadow-[0_0_40px_rgba(245,158,11,0.5)] transition-all group"
                                                        >
                                                            <BookOpen className="w-5 h-5 me-3 group-hover:-translate-y-1 transition-transform" />
                                                            السيرة الكاملة
                                                        </Button>
                                                    </div>
                                                </>
                                            ) : (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 30 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.1 }}
                                                    className="w-full space-y-12 py-10"
                                                >
                                                    <div className="flex items-center gap-6 border-b border-white/10 pb-8">
                                                        <div className={cn("w-20 h-20 rounded-2xl bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center shrink-0 shadow-2xl border border-white/10", selectedMember.color)}>
                                                            <Crown size={36} className="drop-shadow-md" />
                                                        </div>
                                                        <div>
                                                            <h2 className="text-5xl font-black text-white font-headline leading-none mb-3">{selectedMember.name}</h2>
                                                            <p className={cn("font-black text-sm uppercase tracking-[0.3em]", selectedMember.color)}>
                                                                {selectedMember.relation}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="prose prose-invert max-w-none pr-4 border-r-4 border-white/10">
                                                        <p className="text-3xl text-white/90 font-bold leading-[1.8] drop-shadow-md font-tajawal">
                                                            {selectedMember.fullStory}
                                                        </p>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
                                                        {selectedMember.birth && (
                                                            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col gap-2">
                                                                <Calendar className="w-6 h-6 text-amber-500/70" />
                                                                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">الميلاد</p>
                                                                <p className="text-white font-bold text-lg">{selectedMember.birth}</p>
                                                            </div>
                                                        )}
                                                        {selectedMember.death && (
                                                            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col gap-2">
                                                                <Calendar className="w-6 h-6 text-rose-500/70" />
                                                                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">الوفاة</p>
                                                                <p className="text-white font-bold text-lg">{selectedMember.death}</p>
                                                            </div>
                                                        )}
                                                        {selectedMember.ageAtDeath && (
                                                            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col gap-2">
                                                                <Clock className="w-6 h-6 text-blue-500/70" />
                                                                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">العمر</p>
                                                                <p className="text-white font-bold text-lg">{selectedMember.ageAtDeath}</p>
                                                            </div>
                                                        )}
                                                        {selectedMember.mother && (
                                                            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col gap-2">
                                                                <Baby className="w-6 h-6 text-purple-500/70" />
                                                                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">الأم</p>
                                                                <p className="text-white font-bold text-lg">{selectedMember.mother}</p>
                                                            </div>
                                                        )}
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
                </div>
            </div>
        </section>
    );
}
