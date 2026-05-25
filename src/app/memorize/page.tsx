'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Play, Pause, RotateCcw, Award, CheckCircle, Info, 
  HelpCircle, Eye, EyeOff, Volume2, Sparkles, ChevronLeft, ChevronRight, ListMusic
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Verse {
  number: number;
  firstHalf: string;
  secondHalf: string;
  meaning: string;
  vocabulary: { word: string; meaning: string }[];
}

interface Matn {
  id: string;
  title: string;
  author: string;
  category: string;
  audioUrl: string;
  description: string;
  verses: Verse[];
}

const matnsData: Matn[] = [
  {
    id: 'bayquniyyah',
    title: 'المنظومة البيقونية',
    author: 'الشيخ عمر بن محمد البيقوني الشافعي',
    category: 'مصطلح الحديث',
    audioUrl: 'https://archive.org/download/albajqunijah/albajqunijah.mp3',
    description: 'منظومة لطيفة من بحر الرجز في علم مصطلح الحديث، وتعتبر من أهم المداخل لقوانين الجرح والتعديل وتقسيم الحديث.',
    verses: [
      {
        number: 1,
        firstHalf: "أَبْدَأُ بِالْحَمْدِ مُصَلِّيًا عَلَى",
        secondHalf: "مُحَمَّدٍ خَيْرِ نَبِيٍّ أُرْسِلَا",
        meaning: "يبدأ الناظم نظمه بحمد الله تعالى والثناء عليه، تلو الصلاة على رسوله الكريم محمد ﷺ.",
        vocabulary: [
          { word: "أبدأ بالحمد", meaning: "الثناء على الله بجميل صفاته الاختيارية" },
          { word: "أُرْسِلَا", meaning: "بُعث هدىً ونوراً للعالمين" }
        ]
      },
      {
        number: 2,
        firstHalf: "وَذِي مِنْ أَقْسَامِ الْحَدِيثِ عِدَّهْ",
        secondHalf: "وَكُلُّ وَاحِدٍ أَتَى وَحَدَّهْ",
        meaning: "يشير الناظم إلى أن هذه الأبيات تشتمل على جملة من أنواع علوم الحديث، مع تعريف كل قسم بحدّه.",
        vocabulary: [
          { word: "عِدّه", meaning: "جملة أو طائفة من الأقسام" },
          { word: "حدّه", meaning: "تعريفه اللغوي والاصطلاحي المانع للجهالة" }
        ]
      },
      {
        number: 3,
        firstHalf: "أَوَّلُهَا الصَّحِيحُ وَهْوَ مَا اتَّصَلْ",
        secondHalf: "إِسْنَادُهُ وَلَمْ يُشَذَّ أَوْ يُعَلّ",
        meaning: "الحديث الصحيح هو ما اتصل سنده بنقل العدل الضابط عن مثله إلى منتهاه، من غير شذوذ ولا علة قادحة.",
        vocabulary: [
          { word: "اتصل إسناده", meaning: "أن يكون كل راوٍ قد سمع الحديث من شيخه مباشرة" },
          { word: "لم يشذّ", meaning: "ألا يخالف الراوِي المقبول من هو أوثق منه" },
          { word: "يُعلّ", meaning: "أن يخلو من علة خفية تقدح في صحة الحديث مع أن ظاهره السلامة" }
        ]
      },
      {
        number: 4,
        firstHalf: "يَرْوِيهِ عَدْلٌ ضَابِطٌ عَنْ مِثْلِهِ",
        secondHalf: "مُعْتَمَدٌ فِي ضَبْطِهِ وَنَقْلِهِ",
        meaning: "شروط الرواي في الحديث الصحيح: أن يكون عدلاً (مسلماً، بالغاً، عاقلاً، غير فاسق) وضابطاً لحفظه وكتابته.",
        vocabulary: [
          { word: "عدل", meaning: "من اتصف بالتقوى والاستقامة وتجنب الكبائر والمروءة" },
          { word: "ضابط", meaning: "الحفظ الصدرِي التام بحيث يؤدي الحديث كما سمعه" }
        ]
      },
      {
        number: 5,
        firstHalf: "وَالْحَسَنُ الْمَعْرُوفُ طُرْقًا وَغَدَتْ",
        secondHalf: "رِجَالُهُ لاَ كالصَّحِيحِ اشْتَهَرَتْ",
        meaning: "الحديث الحسن هو ما اشتهرت طرقه وعُرفت، ولكن رجاله أقل في رتبة الحفظ والضبط من رجال الصحيح.",
        vocabulary: [
          { word: "معروف طرقاً", meaning: "اشتهر مخارج الحديث ورواته" },
          { word: "لا كالصحيح", meaning: "أي أن ضبطهم أخف شأناً من ضبط رجال الصحيح" }
        ]
      },
      {
        number: 6,
        firstHalf: "وَكُلُّ مَا عَنْ رُتْبَةِ الْحُسْنِ قَصُرْ",
        secondHalf: "فَهْوَ الضَّعِيفُ وَهْوَ أَقْسَامًا كُثُرْ",
        meaning: "كل حديث لم يجمع صفات الحديث الصحيح ولا الحسن، فهو الحديث الضعيف وله أنواع كثيرة.",
        vocabulary: [
          { word: "قصر", meaning: "نزل ونقص عن رتبة القبول" },
          { word: "أقسامه كثر", meaning: "تتعدد أقسامه حسب شروط القبول المفقودة كالمعلق والمرسل والمنقطع" }
        ]
      },
      {
        number: 7,
        firstHalf: "وَمَا أُضِيفَ لِلنَّبِيِّ الْمَرْفُوعُ",
        secondHalf: "وَمَا لِتَابِعٍ هُوَ الْمَقْطُوعُ",
        meaning: "الحديث المرفوع هو ما نُسب إلى النبي ﷺ من قول أو فعل. أما المنسوب إلى التابعي فصاعداً فيسمى المقطوع.",
        vocabulary: [
          { word: "أضيف للنبي", meaning: "سواء كان المتصل أو المنقطع ما دام المنسوب إليه هو المصطفى ﷺ" },
          { word: "لتابع", meaning: "من لقي الصحابي مؤمناً ومات على ذلك" }
        ]
      },
      {
        number: 8,
        firstHalf: "وَالْمُسْنَدُ الْمُتَّصِلُ الإِسْنَادِ مِنْ",
        secondHalf: "رَاوِيهِ حَتَّى الْمُصْطَفَى وَلَمْ يَبِنْ",
        meaning: "الحديث المسند هو ما اتصل سنده من أوله إلى منتهاه مرفوعاً إلى النبي ﷺ دون انقطاع.",
        vocabulary: [
          { word: "المسند", meaning: "ما اتصل إسناده مرفوعاً للنبي ﷺ" },
          { word: "ولم يبن", meaning: "لم ينقطع أو ينفصل" }
        ]
      }
    ]
  },
  {
    id: 'tohfat-al-atfal',
    title: 'تحفة الأطفال والغلمان',
    author: 'الشيخ سليمان بن حسين الجمزوري',
    category: 'علم التجويد',
    audioUrl: 'https://archive.org/download/tohfa-atfal/tohfa.mp3',
    description: 'منظومة شعرية مبسطة وسهلة في أحكام تجويد القرآن الكريم، تركز على أحكام النون الساكنة والتنوين والمدود.',
    verses: [
      {
        number: 1,
        firstHalf: "يَقُولُ رَاجِي رَحمةِ الْغَفُورِ",
        secondHalf: "دَوْمَاً سُلَيْمَانُ هُوَ الْجَمْزُورِى",
        meaning: "مقدمة المنظومة: يبدأ الناظم بحمد الله والصلاة على النبي ﷺ والتعريف بهذا النظم في علم التجويد.",
        vocabulary: [{"word": "راجي", "meaning": "المتمني والداعي لله تعالى بالرحمة"}, {"word": "الجمزوري", "meaning": "نسبة لبلدة جمزور بالقرب من طنطا في مصر"}]
      },
      {
        number: 2,
        firstHalf: "الْحَمْدُ لِلَّهِ مُصَلِّياً عَلى",
        secondHalf: "مُحَمَدٍ وآلِهِ وَمَنْ تَلاَ",
        meaning: "مقدمة المنظومة: يبدأ الناظم بحمد الله والصلاة على النبي ﷺ والتعريف بهذا النظم في علم التجويد.",
        vocabulary: [{"word": "من تلا", "meaning": "من قرأ القرآن أو تبع هداهم"}]
      },
      {
        number: 3,
        firstHalf: "وَبَعْدُ هذَا النَّظْمُ لِلْمُرِيدِ",
        secondHalf: "في النُونِ والتَّنْوِينِ وَالْمُدُودِ",
        meaning: "مقدمة المنظومة: يبدأ الناظم بحمد الله والصلاة على النبي ﷺ والتعريف بهذا النظم في علم التجويد.",
        vocabulary: [{"word": "للمريد", "meaning": "طالب العلم القاصد لمعرفته وإتقان تلاوة كتاب الله"}]
      },
      {
        number: 4,
        firstHalf: "سَمَّيتُهُ بِتُحفَة الأَطْفَالِ",
        secondHalf: "عَنْ شَيْخِنَا الْمِيهِىِّ ذِي الْكَمالِ",
        meaning: "مقدمة المنظومة: يبدأ الناظم بحمد الله والصلاة على النبي ﷺ والتعريف بهذا النظم في علم التجويد.",
        vocabulary: [{"word": "تحفة", "meaning": "الشيء الفاخر الثمين المستطرف"}, {"word": "الميهي", "meaning": "نسبة إلى بلدة ميه في المنوفية بمصر"}]
      },
      {
        number: 5,
        firstHalf: "أَرْجُو بِه أَنْ يَنْفَعَ الطُّلاَّبَا",
        secondHalf: "وَالأَجْرَ وَالْقَبُولَ وَالثَّوَابا",
        meaning: "مقدمة المنظومة: يبدأ الناظم بحمد الله والصلاة على النبي ﷺ والتعريف بهذا النظم في علم التجويد.",
        vocabulary: [{"word": "القبول", "meaning": "رضا الله عن العمل وجعله مباركاً مستمراً"}]
      },
      {
        number: 6,
        firstHalf: "لِلنُّونِ إِنْ تَسْكُنْ وَلِلتَّنْوِينِ",
        secondHalf: "أَرْبَعُ أَحْكَامٍ فَخُذْ تَبْيِينِي",
        meaning: "من أحكام النون الساكنة والتنوين: يوضح الناظم الأحكام الأربعة وهي الإظهار، الإدغام، الإقلاب، والإخفاء.",
        vocabulary: [{"word": "تبييني", "meaning": "شرحي وتوضيحي وتفصيلي للأحكام"}]
      },
      {
        number: 7,
        firstHalf: "فَالأَوَّلُ الإظْهَارُ قَبْلَ أَحْرُفِ",
        secondHalf: "لِلْحَلْقِ سِتٍ رُتِّبَتْ فَلتَعْرِفِ",
        meaning: "من أحكام النون الساكنة والتنوين: يوضح الناظم الأحكام الأربعة وهي الإظهار، الإدغام، الإقلاب، والإخفاء.",
        vocabulary: [{"word": "للحلْق", "meaning": "مخرج حروف الإظهار الستة وهي أقصى ووسط وأدنى الحلق"}]
      },
      {
        number: 8,
        firstHalf: "هَمْزٌ فَهَاءٌ ثُمَّ عَيْنٌ حَاءُ",
        secondHalf: "مُهْمَلَتَانِ ثُمَّ غَيْنٌ خَاءُ",
        meaning: "من أحكام النون الساكنة والتنوين: يوضح الناظم الأحكام الأربعة وهي الإظهار، الإدغام، الإقلاب، والإخفاء.",
        vocabulary: []
      },
      {
        number: 9,
        firstHalf: "والثَّاني إِدْغَامٌ بِستَّةٍ أَتَتْ",
        secondHalf: "فِي يَرْمَلُونَ عِنْدَهُمْ قَدْ ثَبَتَتْ",
        meaning: "من أحكام النون الساكنة والتنوين: يوضح الناظم الأحكام الأربعة وهي الإظهار، الإدغام، الإقلاب، والإخفاء.",
        vocabulary: [{"word": "يرملون", "meaning": "مجموعة حروف الإدغام (ي، ر، م، ل، و، ن)"}]
      },
      {
        number: 10,
        firstHalf: "لَكِنَّهَا قِسْمَانِ قِسْمٌ يُدْغَمَا",
        secondHalf: "فِيهِ بِغُنَّةٍ بِيَنْمُو عُلِمَا",
        meaning: "من أحكام النون الساكنة والتنوين: يوضح الناظم الأحكام الأربعة وهي الإظهار، الإدغام، الإقلاب، والإخفاء.",
        vocabulary: []
      },
      {
        number: 11,
        firstHalf: "إِلاَّ إِذَا كَانَا بِكِلْمَةٍ فَلاَ",
        secondHalf: "تُدْغِمْ كَدُنْيَا ثُمَّ صِنْوَانٍ تَلاَ",
        meaning: "من أحكام النون الساكنة والتنوين: يوضح الناظم الأحكام الأربعة وهي الإظهار، الإدغام، الإقلاب، والإخفاء.",
        vocabulary: [{"word": "دنيا", "meaning": "مثال للنون الساكنة التي التقت بالياء في كلمة واحدة وجب إظهارها"}, {"word": "صنوان", "meaning": "مثال للنون الساكنة التي التقت بالواو في كلمة واحدة وجب إظهارها"}]
      },
      {
        number: 12,
        firstHalf: "وَالثَّاني إِدْغَامٌ بِغَيْرِ غُنَّةْ",
        secondHalf: "في اللاَّمِ وَالرَّا ثُمَّ كَرّرَنَّهْ",
        meaning: "من أحكام النون الساكنة والتنوين: يوضح الناظم الأحكام الأربعة وهي الإظهار، الإدغام، الإقلاب، والإخفاء.",
        vocabulary: []
      },
      {
        number: 13,
        firstHalf: "وَّالثَالثُ الإِقْلاَبُ عِنْدَ الْبَاءِ",
        secondHalf: "مِيماً بِغُنَةٍ مَعَ الإِخْفَاءِ",
        meaning: "من أحكام النون الساكنة والتنوين: يوضح الناظم الأحكام الأربعة وهي الإظهار، الإدغام، الإقلاب، والإخفاء.",
        vocabulary: [{"word": "الإقلاب", "meaning": "قلب النون الساكنة أو التنوين ميماً مخفاة بغنة عند ملاقاتها للباء"}]
      },
      {
        number: 14,
        firstHalf: "وَالرَّابِعُ الإِخْفَاءُ عِنْدَ الْفاضِلِ",
        secondHalf: "مِنَ الحُرُوفِ وَاجِبٌ لِلْفَاضِلِ",
        meaning: "من أحكام النون الساكنة والتنوين: يوضح الناظم الأحكام الأربعة وهي الإظهار، الإدغام، الإقلاب، والإخفاء.",
        vocabulary: []
      },
      {
        number: 15,
        firstHalf: "في خَمْسَةٍ مِنْ بَعْدِ عَشْرٍ رَمْزُهَا",
        secondHalf: "فِي كِلْمِ هذَا البَيْتِ قَدْ ضَمَّنْتُهَا",
        meaning: "من أحكام النون الساكنة والتنوين: يوضح الناظم الأحكام الأربعة وهي الإظهار، الإدغام، الإقلاب، والإخفاء.",
        vocabulary: [{"word": "رمزها", "meaning": "حروف الإخفاء الـ 15 المذكورة في أوائل كلمات البيت التالي"}]
      },
      {
        number: 16,
        firstHalf: "صِفْ ذَا ثَنَا كَمْ جَادَ شَخْصٌ قَدْ سمَا",
        secondHalf: "دُمْ طَيَّباً زِدْ فِي تُقَىً ضَعْ ظَالِمَا",
        meaning: "من أحكام النون الساكنة والتنوين: يوضح الناظم الأحكام الأربعة وهي الإظهار، الإدغام، الإقلاب، والإخفاء.",
        vocabulary: []
      },
      {
        number: 17,
        firstHalf: "وَغُنَّ مِيماً ثُمَّ نُوناً شُدِّدَا",
        secondHalf: "وَسَمِّ كُلاً حَرْفَ غُنَّةٍ بَدَا",
        meaning: "حكم النون والميم المشددتين: وجوب إظهار الغنة بمقدار حركتين عند النطق بالنون أو الميم المشددة.",
        vocabulary: []
      },
      {
        number: 18,
        firstHalf: "وَالِميمُ إِنْ تَسْكُنْ تَجِى قَبْلَ الْهِجَا",
        secondHalf: "لاَ أَلفٍ لَيِّنَةٍ لِذِى الْحِجَا",
        meaning: "أحكام الميم الساكنة: يذكر الناظم أحكام الميم الساكنة الثلاثة وهي الإخفاء الشفوي، إدغام المتماثلين الصغير، والإظهار الشفوي.",
        vocabulary: []
      },
      {
        number: 19,
        firstHalf: "أَحْكَامُهَا ثَلاَثَةٌ لِمَنْ ضَبَطْ",
        secondHalf: "إِخْفَاءٌ ادْغَامٌ وَإِظْهَارٌ فَقَطْ",
        meaning: "أحكام الميم الساكنة: يذكر الناظم أحكام الميم الساكنة الثلاثة وهي الإخفاء الشفوي، إدغام المتماثلين الصغير، والإظهار الشفوي.",
        vocabulary: []
      },
      {
        number: 20,
        firstHalf: "فَالأَوَّلُ الإِخْفَاءُ عِنْدَ الْبَاءِ",
        secondHalf: "وَسَمِّهِ الشَّفْوِىَّ لِلْقُرَّاءِ",
        meaning: "أحكام الميم الساكنة: يذكر الناظم أحكام الميم الساكنة الثلاثة وهي الإخفاء الشفوي، إدغام المتماثلين الصغير، والإظهار الشفوي.",
        vocabulary: []
      },
      {
        number: 21,
        firstHalf: "وَالثَّانى إِدْغَامٌ بِمِثْلِهَا أَتَى",
        secondHalf: "وَسَمِّ إدغاماً صَغِيراً يَا فَتَى",
        meaning: "أحكام الميم الساكنة: يذكر الناظم أحكام الميم الساكنة الثلاثة وهي الإخفاء الشفوي، إدغام المتماثلين الصغير، والإظهار الشفوي.",
        vocabulary: []
      },
      {
        number: 22,
        firstHalf: "وَالثَّالِثُ الإِظْهَارُ فِى الْبَقِيَّةْ",
        secondHalf: "مِنْ أَحْرُفٍ وَسَمِّهَا شَفْوِيَّهْ",
        meaning: "أحكام الميم الساكنة: يذكر الناظم أحكام الميم الساكنة الثلاثة وهي الإخفاء الشفوي، إدغام المتماثلين الصغير، والإظهار الشفوي.",
        vocabulary: []
      },
      {
        number: 23,
        firstHalf: "وَاحْذَرْ لَدَى وَاوٍ وَفَا أَنْ تَخْتَفىِ",
        secondHalf: "لِقُرْبِهَا وَلاتحادِ فَاعْرِفِ",
        meaning: "أحكام الميم الساكنة: يذكر الناظم أحكام الميم الساكنة الثلاثة وهي الإخفاء الشفوي، إدغام المتماثلين الصغير، والإظهار الشفوي.",
        vocabulary: [{"word": "واحذر لدى واو وفا", "meaning": "تنبيه شديد على إظهار الميم الساكنة عند ملاقاة الواو أو الفاء لقرب المخارج"}]
      },
      {
        number: 24,
        firstHalf: "لِلاَمِ أَلْ حَالاَنِ قَبْلَ الأَحْرُفِ",
        secondHalf: "أُولاَهُمَا إِظْهَارُهَا فَلْتَعْرِفِ",
        meaning: "حكم لام أل ولام الفعل: تفصيل أحكام اللام القمرية (المظهرة) واللام الشمسية (المدغمة)، مع إظهار لام الفعل مطلقاً.",
        vocabulary: []
      },
      {
        number: 25,
        firstHalf: "قَبْلَ ارْبَعٍ مَعْ عَشْرَةٍ خُذْ عِلْمَهُ",
        secondHalf: "مِنَ ابْغِ حَجَّكَ وَخَفْ عَقِيمهُ",
        meaning: "حكم لام أل ولام الفعل: تفصيل أحكام اللام القمرية (المظهرة) واللام الشمسية (المدغمة)، مع إظهار لام الفعل مطلقاً.",
        vocabulary: [{"word": "ابغ حجك وخف عقيمه", "meaning": "العبارة الجامعة لحروف اللام القمرية الـ 14"}]
      },
      {
        number: 26,
        firstHalf: "ثَانِيهِمَا إِدْغَامُهَا فى أَرْبَعٍ",
        secondHalf: "وَعَشْرَةٍ أَيْضاً وَرَمْزَهَا فَعِ",
        meaning: "حكم لام أل ولام الفعل: تفصيل أحكام اللام القمرية (المظهرة) واللام الشمسية (المدغمة)، مع إظهار لام الفعل مطلقاً.",
        vocabulary: []
      },
      {
        number: 27,
        firstHalf: "طِبْ ثُمَّ صِلْ رُحْمَاً تَفُزْ ضِفْ ذَا نِعَم",
        secondHalf: "دَعْ سُوءَ ظَنٍ زُرْ شَرِيفَاً لِلْكَرَم",
        meaning: "حكم لام أل ولام الفعل: تفصيل أحكام اللام القمرية (المظهرة) واللام الشمسية (المدغمة)، مع إظهار لام الفعل مطلقاً.",
        vocabulary: []
      },
      {
        number: 28,
        firstHalf: "وَاللاَّمَ الاُولَى سَمِّهَا قَمْرِيَّهْ",
        secondHalf: "وَاللاَّمَ الاُخْرىَ سَمِّهَا شَمْسِيَّهْ",
        meaning: "حكم لام أل ولام الفعل: تفصيل أحكام اللام القمرية (المظهرة) واللام الشمسية (المدغمة)، مع إظهار لام الفعل مطلقاً.",
        vocabulary: [{"word": "قمرية", "meaning": "اللام التي تلفظ بوضوح (مظهرة)"}, {"word": "شمسية", "meaning": "اللام التي تدغم في الحرف الذي يليها فلا تلفظ"}]
      },
      {
        number: 29,
        firstHalf: "وأظْهِرَنَّ لاَمَ فِعْلٍ مُطْلَقاً",
        secondHalf: "فى نَحْوِ قُلْ نَعَمْ وَقُلْنَا وَالْتَقَى",
        meaning: "حكم لام أل ولام الفعل: تفصيل أحكام اللام القمرية (المظهرة) واللام الشمسية (المدغمة)، مع إظهار لام الفعل مطلقاً.",
        vocabulary: []
      },
      {
        number: 30,
        firstHalf: "إِنْ فِي الصِّفَاتِ وَالمَخَارِجِ اتَّفَقْ",
        secondHalf: "حَرْفَانِ فَالْمِثْلاَنِ فِيهِمَا أَحَقْ",
        meaning: "علاقات الحروف: بيان أقسام علاقات الحروف المتجاورة وهي المتماثلان، المتقاربان، والمتجانسان، مع بيان الصغير والكبير منها.",
        vocabulary: [{"word": "المثلان", "meaning": "الحرفان اللذان اتفقا مخرجاً وصفة مثل الباء مع الباء"}]
      },
      {
        number: 31,
        firstHalf: "وَإِنْ يَكُونَا مَخْرَجا ًتَقَارَبَا",
        secondHalf: "وَفي الصِّفَاتِ اخْتَلَفَا يُلَقَّبَا",
        meaning: "علاقات الحروف: بيان أقسام علاقات الحروف المتجاورة وهي المتماثلان، المتقاربان، والمتجانسان، مع بيان الصغير والكبير منها.",
        vocabulary: []
      },
      {
        number: 32,
        firstHalf: "مُتْقَارِبَيْنِ أَوْ يَكُونَا اتَّفَقَا",
        secondHalf: "فِي مَخْرَجٍ دُونَ الصِّفَاتِ حُقِّقَا",
        meaning: "علاقات الحروف: بيان أقسام علاقات الحروف المتجاورة وهي المتماثلان، المتقاربان، والمتجانسان، مع بيان الصغير والكبير منها.",
        vocabulary: []
      },
      {
        number: 33,
        firstHalf: "بِالْمُتَجَانِسَيْنِ ثُمَّ إِنْ سَكَنْ",
        secondHalf: "أَوَّلُ كُلٍّ فَالصَّغِيرَ سَمِّيَنْ",
        meaning: "علاقات الحروف: بيان أقسام علاقات الحروف المتجاورة وهي المتماثلان، المتقاربان، والمتجانسان، مع بيان الصغير والكبير منها.",
        vocabulary: []
      },
      {
        number: 34,
        firstHalf: "أَوْ حُرِّكَ الحَرْفَانِ فى كُلٍّ فَقُلْ",
        secondHalf: "كُلٌّ كَبِيرُ وافْهَمَنْهُ بِالْمُثُلْ",
        meaning: "علاقات الحروف: بيان أقسام علاقات الحروف المتجاورة وهي المتماثلان، المتقاربان، والمتجانسان، مع بيان الصغير والكبير منها.",
        vocabulary: []
      },
      {
        number: 35,
        firstHalf: "وَالمَدُّ أَصْلِىُّ وَ فَرْعِىٌّ لَهُ",
        secondHalf: "وَسَمِّ أَوَّلاً طَبِيعِيّاً وَهُو",
        meaning: "أقسام المد: تقسيم المد إلى أصلي (طبيعي) وفرعي بسبب همز أو سكون، وحروفه الثلاثة (الواي).",
        vocabulary: [{"word": "أصلي", "meaning": "المد الطبيعي الذي لا تقوم ذات الحرف إلا به ولا يتوقف على سبب"}, {"word": "فرعي", "meaning": "المد الزائد عن الطبيعي بسبب همز أو سكون"}]
      },
      {
        number: 36,
        firstHalf: "مَالاَ تَوَقُّفٌ لَهُ عَلى سَبَبْ",
        secondHalf: "وَلابِدُونِهِ الحُرُوفُ تُجْتَلَبْ",
        meaning: "أقسام المد: تقسيم المد إلى أصلي (طبيعي) وفرعي بسبب همز أو سكون، وحروفه الثلاثة (الواي).",
        vocabulary: []
      },
      {
        number: 37,
        firstHalf: "بلْ أَىُّ حَرْفٍ غَيْرُ هَمْزٍ أَوْ سُكُونْ",
        secondHalf: "جَا بَعْدَ مَدٍّ فَالطَّبِيِعىَّ يَكُونْ",
        meaning: "أقسام المد: تقسيم المد إلى أصلي (طبيعي) وفرعي بسبب همز أو سكون، وحروفه الثلاثة (الواي).",
        vocabulary: []
      },
      {
        number: 38,
        firstHalf: "وَالآخَرُ الْفَرْعِىُّ مَوْقُوفٌ عَلي",
        secondHalf: "سَبَبْ كَهَمْزٍ أَوْ سُكُونٍ مُسْجَلاً",
        meaning: "أقسام المد: تقسيم المد إلى أصلي (طبيعي) وفرعي بسبب همز أو سكون، وحروفه الثلاثة (الواي).",
        vocabulary: []
      },
      {
        number: 39,
        firstHalf: "حُرُوفُهُ ثَلاَثَةٌ فَعِيهَا",
        secondHalf: "مِنْ لَفْظِ وَاىٍ وَهْىَ فى نُوحِيهَا",
        meaning: "أقسام المد: تقسيم المد إلى أصلي (طبيعي) وفرعي بسبب همز أو سكون، وحروفه الثلاثة (الواي).",
        vocabulary: [{"word": "واي", "meaning": "حروف المد الثلاثة: الواو الساكنة المضموم ما قبلها، والألف، والياء الساكنة المكسور ما قبلها"}]
      },
      {
        number: 40,
        firstHalf: "وَالكَسْرُ قَبْلَ الْيَا وَقَبْلَ الْواوِ ضَمْ",
        secondHalf: "شَرْطٌ وَفَتْحٌ قَبْلَ أَلفٍ يُلْتَزَمْ",
        meaning: "أقسام المد: تقسيم المد إلى أصلي (طبيعي) وفرعي بسبب همز أو سكون، وحروفه الثلاثة (الواي).",
        vocabulary: []
      },
      {
        number: 41,
        firstHalf: "وَاللِّينُ مِنْهَا الْيَا وَوَاوٌ سَكَنَا",
        secondHalf: "إِنِ انْفِتَاحٌ قَبْلَ كُلٍّ أُعْلِنَا",
        meaning: "أقسام المد: تقسيم المد إلى أصلي (طبيعي) وفرعي بسبب همز أو سكون، وحروفه الثلاثة (الواي).",
        vocabulary: []
      },
      {
        number: 42,
        firstHalf: "لِلْمَدِّ أَحْكَامٌ ثَلاَثَةٌ تَدُومْ",
        secondHalf: "وَهْيَ الْوُجُوبُ وَالْجَوَازُ وَاللُّزُومْ",
        meaning: "أحكام المد الفرعي: وهي الوجوب (للمتصل)، الجواز (للمنفصل والعارض للسكون والبدل)، واللزوم (للمد اللازم).",
        vocabulary: []
      },
      {
        number: 43,
        firstHalf: "فَوَاجِبٌ إِنْ جَاءَ هَمْزٌ بَعْدَ مَدْ",
        secondHalf: "فِي كِلْمَةٍ وَذَا بِمُتَّصْلٍ يُعَدْ",
        meaning: "أحكام المد الفرعي: وهي الوجوب (للمتصل)، الجواز (للمنفصل والعارض للسكون والبدل)، واللزوم (للمد اللازم).",
        vocabulary: [{"word": "متصل", "meaning": "أن يقع الهمز بعد حرف المد في كلمة واحدة ووجب مده 4 أو 5 حركات"}]
      },
      {
        number: 44,
        firstHalf: "وَجَائزٌ مَدٌ وَقَصْرٌ إِنْ فُصِل",
        secondHalf: "كُلٌّ بِكِلْمَةٍ وَهَذَا المُنْفَصِلْ",
        meaning: "أحكام المد الفرعي: وهي الوجوب (للمتصل)، الجواز (للمنفصل والعارض للسكون والبدل)، واللزوم (للمد اللازم).",
        vocabulary: [{"word": "منفصل", "meaning": "أن يكون حرف المد في كلمة والهمز في الكلمة التالية"}]
      },
      {
        number: 45,
        firstHalf: "وَمِثْلُ ذَا إِنْ عَرَضَ السُّكُونُ",
        secondHalf: "وَقْفَاً كَتَعْلَمُونَ نَسْتَعِينُ",
        meaning: "أحكام المد الفرعي: وهي الوجوب (للمتصل)، الجواز (للمنفصل والعارض للسكون والبدل)، واللزوم (للمد اللازم).",
        vocabulary: []
      },
      {
        number: 46,
        firstHalf: "أَوْ قُدِّمَ الْهَمْزُ عَلَي المَدِّ وَذَا",
        secondHalf: "بَدَلْ كَآمَنُوا وَإِيَماناً خُذَا",
        meaning: "أحكام المد الفرعي: وهي الوجوب (للمتصل)، الجواز (للمنفصل والعارض للسكون والبدل)، واللزوم (للمد اللازم).",
        vocabulary: []
      },
      {
        number: 47,
        firstHalf: "وَلاَزِمٌ إِنِ السُّكُونُ أُصِّلاَ",
        secondHalf: "وَصْلاَ وَوَقْفاً بَعْدَ مَدٍّ طُوّلاَ",
        meaning: "أحكام المد الفرعي: وهي الوجوب (للمتصل)، الجواز (للمنفصل والعارض للسكون والبدل)، واللزوم (للمد اللازم).",
        vocabulary: []
      },
      {
        number: 48,
        firstHalf: "أَقْسَامُ لاَزِمٍ لَدَيهم أَرْبَعَةْ",
        secondHalf: "وَتِلْكَ كِلْمِيُّ وَحَرْفِيٌّ مَعَهْ",
        meaning: "أقسام المد اللازم: تقسيم المد اللازم إلى كلمي وحرفي، وكل منهما ينقسم إلى مخفف ومثقل، ومجموع الحروف في فواتح السور.",
        vocabulary: []
      },
      {
        number: 49,
        firstHalf: "كِلاَهُمَا مُخَفَّفٌ مُثَقَّلُ",
        secondHalf: "فَهَذِهِ أَرْبَعَةٌ تُفَصَّلُ",
        meaning: "أقسام المد اللازم: تقسيم المد اللازم إلى كلمي وحرفي، وكل منهما ينقسم إلى مخفف ومثقل، ومجموع الحروف في فواتح السور.",
        vocabulary: []
      },
      {
        number: 50,
        firstHalf: "فَإِنْ بِكِلْمَةٍ سُكُونٌ اجْتَمَعْ",
        secondHalf: "مَعْ حَرْفِ مَدٍّ فَهْوَ كِلْمِيُّ وَقَعْ",
        meaning: "أقسام المد اللازم: تقسيم المد اللازم إلى كلمي وحرفي، وكل منهما ينقسم إلى مخفف ومثقل، ومجموع الحروف في فواتح السور.",
        vocabulary: []
      },
      {
        number: 51,
        firstHalf: "أَوْ في ثُلاَثِيِّ الحُرُوفِ وُجِدَا",
        secondHalf: "وَالمَدُّ وَسْطُهُ فَحَرْفِيٌّ بَدَا",
        meaning: "أقسام المد اللازم: تقسيم المد اللازم إلى كلمي وحرفي، وكل منهما ينقسم إلى مخفف ومثقل، ومجموع الحروف في فواتح السور.",
        vocabulary: []
      },
      {
        number: 52,
        firstHalf: "كِلاَهُمَا مُثَقّلٌ إِنْ أُدْغِمَا",
        secondHalf: "مَخَفَّفٌ كُلُّ إِذَا لَمْ يُدْغَمَا",
        meaning: "أقسام المد اللازم: تقسيم المد اللازم إلى كلمي وحرفي، وكل منهما ينقسم إلى مخفف ومثقل، ومجموع الحروف في فواتح السور.",
        vocabulary: []
      },
      {
        number: 53,
        firstHalf: "وَاللاَّزِمُ الْحَرفِيُّ أَوَّلَ السُّوَرْ",
        secondHalf: "وُجُودُهُ وَفِي ثَمَانٍ انحَصَرْ",
        meaning: "أقسام المد اللازم: تقسيم المد اللازم إلى كلمي وحرفي، وكل منهما ينقسم إلى مخفف ومثقل، ومجموع الحروف في فواتح السور.",
        vocabulary: []
      },
      {
        number: 54,
        firstHalf: "يَجْمَعُهَا حُرُوفُ كَمْ عَسَلْ نَقَصْ",
        secondHalf: "وَعَيْنُ ذُو وَجْهَيْنِ والطُّولُ أَخَصْ",
        meaning: "أقسام المد اللازم: تقسيم المد اللازم إلى كلمي وحرفي، وكل منهما ينقسم إلى مخفف ومثقل، ومجموع الحروف في فواتح السور.",
        vocabulary: [{"word": "كم عسل نقص", "meaning": "الحروف الثمانية التي تمد مداً لازماً بمقدار 6 حركات في فواتح السور"}]
      },
      {
        number: 55,
        firstHalf: "وَمَا سِوَي الحَرْفِ الثُّلاَثِي لاَ أَلِفْ",
        secondHalf: "فَمُدُّه مَدّاً طَبِيعِيَّا أُلِفْ",
        meaning: "أقسام المد اللازم: تقسيم المد اللازم إلى كلمي وحرفي، وكل منهما ينقسم إلى مخفف ومثقل، ومجموع الحروف في فواتح السور.",
        vocabulary: []
      },
      {
        number: 56,
        firstHalf: "وَذَاكَ أَيْضاً فِي فَوَاتِحِ السُّوَرْ",
        secondHalf: "فِي لَفْظِ حَيٍّ طَاهِرٍ قَدِ انْحَصَرْ",
        meaning: "أقسام المد اللازم: تقسيم المد اللازم إلى كلمي وحرفي، وكل منهما ينقسم إلى مخفف ومثقل، ومجموع الحروف في فواتح السور.",
        vocabulary: [{"word": "حي طهر", "meaning": "الحروف الخمسة التي تمد مداً طبيعياً بمقدار حركتين في فواتح السور"}]
      },
      {
        number: 57,
        firstHalf: "وَيَجْمَعُ الْفَوَاتِحَ الأَرْبَعْ عَشَرْ",
        secondHalf: "صِلْهُ سُحَيْراً مَنْ قَطَعْك ذَا اشْتَهَرْ",
        meaning: "أقسام المد اللازم: تقسيم المد اللازم إلى كلمي وحرفي، وكل منهما ينقسم إلى مخفف ومثقل، ومجموع الحروف في فواتح السور.",
        vocabulary: []
      },
      {
        number: 58,
        firstHalf: "وَتَمَّ ذَا النَّظْمُ بِحَمْدِ اللَّهِ",
        secondHalf: "عَلَى تَمَامِهِ بِلاَ تَنَاهِى",
        meaning: "خاتمة المنظومة: حمد الله وتاريخ نظم الأبيات والصلاة والسلام على النبي محمد وآله وصحبه وقراء وسامعي القرآن.",
        vocabulary: []
      },
      {
        number: 59,
        firstHalf: "أَبْيَاتُهُ نَدٌّ بَداَ لِذِى النُّهَى",
        secondHalf: "تَارِيخُهُ بُشْرَى لِمَنْ يُتْقِنُهَا",
        meaning: "خاتمة المنظومة: حمد الله وتاريخ نظم الأبيات والصلاة والسلام على النبي محمد وآله وصحبه وقراء وسامعي القرآن.",
        vocabulary: [{"word": "ند بدا", "meaning": "رمز لحساب الجمل يشير لعدد الأبيات وهو 61 بيتاً"}]
      },
      {
        number: 60,
        firstHalf: "ثُمَّ الصَّلاَةُ وَالسَّلاَمُ أَبَداَ",
        secondHalf: "عِلى خِتَامِ الأَنْبِيَاءِ أَحْمَدَا",
        meaning: "خاتمة المنظومة: حمد الله وتاريخ نظم الأبيات والصلاة والسلام على النبي محمد وآله وصحبه وقراء وسامعي القرآن.",
        vocabulary: []
      },
      {
        number: 61,
        firstHalf: "وَالآلِ وَالصَّحْبِ وَكُلِّ تَابِعِ",
        secondHalf: "وَكُلِّ قَارِئٍ وكُلِّ سَامِعِ",
        meaning: "خاتمة المنظومة: حمد الله وتاريخ نظم الأبيات والصلاة والسلام على النبي محمد وآله وصحبه وقراء وسامعي القرآن.",
        vocabulary: [{"word": "الآل", "meaning": "أهل بيت النبي ﷺ المؤمنون به"}]
      },
    ]
  }
];

export default function MemorizePage() {
  const [selectedMatn, setSelectedMatn] = useState<Matn>(matnsData[0]);
  const [activeVerseIndex, setActiveVerseIndex] = useState<number>(0);
  
  // Memorization Mode: 'show' | 'hideFirst' | 'hideSecond' | 'hideAll'
  const [hideMode, setHideMode] = useState<'show' | 'hideFirst' | 'hideSecond' | 'hideAll'>('show');
  
  // Memorized verses progress state
  const [memorizedState, setMemorizedState] = useState<Record<string, boolean>>({});
  
  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Set up audio source upon selected matn change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    audioRef.current = new Audio(selectedMatn.audioUrl);
    audioRef.current.addEventListener('ended', () => setIsPlaying(false));
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [selectedMatn]);

  const handleAudioPlayToggle = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(err => console.log("Audio play error", err));
      setIsPlaying(true);
    }
  };

  const handleRestartAudio = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    if (!isPlaying) {
      audioRef.current.play().catch(err => console.log(err));
      setIsPlaying(true);
    }
  };

  const toggleVerseMemorized = (verseNum: number) => {
    const key = `${selectedMatn.id}-${verseNum}`;
    setMemorizedState(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const isVerseDone = (verseNum: number) => {
    return !!memorizedState[`${selectedMatn.id}-${verseNum}`];
  };

  const getMatnProgress = (matn: Matn) => {
    let completed = 0;
    matn.verses.forEach(v => {
      if (memorizedState[`${matn.id}-${v.number}`]) completed++;
    });
    return Math.round((completed / matn.verses.length) * 100);
  };

  const activeVerse = selectedMatn.verses[activeVerseIndex];

  return (
    <div className="min-h-screen text-foreground relative py-12 px-4 md:px-8 max-w-6xl mx-auto animate-fadeIn" dir="rtl">
      
      {/* Dynamic flowing background glows */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-[380px] h-[380px] rounded-full bg-amber-500/5 blur-[120px]" />
        <div className="absolute bottom-[20%] right-[5%] w-[420px] h-[420px] rounded-full bg-primary/5 blur-[140px] animate-pulse-slow" />
      </div>

      {/* Header */}
      <header className="text-center mb-12 relative">
        <div className="inline-flex p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-primary mb-4 shadow-xl">
          <BookOpen className="h-10 w-10 text-amber-500" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black font-headline text-white mb-3">
          حافظ وقارئ المتون التفاعلي
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-base leading-relaxed font-bold">
          أداة حفظ مرنة وصوتية لتعلم المنظومات والمتون الشرعية، تدعم إخفاء الشطور لاختبار الحفظ، التكرار، والوقوف على غريب الألفاظ.
        </p>
      </header>

      {/* Matn Selection Bar */}
      <div className="flex flex-wrap gap-4 justify-center mb-10">
        {matnsData.map((matn) => {
          const isSelected = selectedMatn.id === matn.id;
          const prog = getMatnProgress(matn);
          
          return (
            <button
              key={matn.id}
              onClick={() => {
                setSelectedMatn(matn);
                setActiveVerseIndex(0);
              }}
              className={cn(
                "py-4 px-6 rounded-2xl border transition-all duration-300 text-right flex flex-col gap-1.5 relative overflow-hidden group min-w-[200px]",
                isSelected 
                  ? "border-primary bg-primary/5 text-white" 
                  : "border-white/5 bg-white/[0.01] text-muted-foreground hover:border-white/10 hover:bg-white/[0.02]"
              )}
            >
              <div className="flex justify-between items-center w-full">
                <span className="font-black text-sm text-white group-hover:text-amber-400 transition-colors">
                  {matn.title}
                </span>
                <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full text-muted-foreground">
                  {matn.category}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground">{matn.author}</span>
              
              {/* Progress bar */}
              <div className="w-full bg-white/5 h-1 rounded-full mt-2 overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-500" 
                  style={{ width: `${prog}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Study Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Playback & Study Dashboard */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Header Info & Audio Player */}
          <div className="glass-card rounded-[2.5rem] p-6 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-white">{selectedMatn.title}</h3>
              <p className="text-muted-foreground text-xs font-semibold">{selectedMatn.description}</p>
            </div>
            
            {/* Audio Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleRestartAudio}
                className="p-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                title="إعادة تشغيل الصوت"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              
              <button
                onClick={handleAudioPlayToggle}
                className="py-3 px-6 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center gap-2 shadow-glow-primary-sm hover:opacity-90 transition-opacity"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlaying ? 'إيقاف مؤقت' : 'استماع للمنظومة'}</span>
              </button>
            </div>
          </div>

          {/* Verses Arena */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                <ListMusic className="h-5 w-5 text-amber-500" /> قائمة أبيات النظم:
              </h4>

              {/* Hide/Show Mode selectors */}
              <div className="flex items-center bg-white/5 border border-white/5 p-1 rounded-xl gap-1">
                {[
                  { mode: 'show', label: 'إظهار الكل', icon: Eye },
                  { mode: 'hideFirst', label: 'إخفاء الصدر', icon: EyeOff },
                  { mode: 'hideSecond', label: 'إخفاء العجز', icon: EyeOff },
                  { mode: 'hideAll', label: 'إخفاء البيت', icon: EyeOff },
                ].map((item) => (
                  <button
                    key={item.mode}
                    onClick={() => setHideMode(item.mode as any)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5",
                      hideMode === item.mode 
                        ? "bg-primary text-primary-foreground font-black" 
                        : "text-muted-foreground hover:text-white"
                    )}
                  >
                    <item.icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Verses Scroller */}
            <div className="space-y-3">
              {selectedMatn.verses.map((verse, index) => {
                const isActive = activeVerseIndex === index;
                const isDone = isVerseDone(verse.number);
                
                return (
                  <div
                    key={verse.number}
                    onClick={() => setActiveVerseIndex(index)}
                    className={cn(
                      "p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col gap-4 cursor-pointer",
                      isActive 
                        ? "border-primary bg-primary/[0.03] shadow-lg scale-[1.01]" 
                        : "border-white/5 bg-white/[0.01] hover:border-white/10 hover:bg-white/[0.02]"
                    )}
                  >
                    {/* Verse numbers and controls */}
                    <div className="flex justify-between items-center w-full border-b border-white/5 pb-2 text-[10px] text-muted-foreground">
                      <span className="font-bold font-mono">البيت رقم {verse.number}</span>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleVerseMemorized(verse.number);
                        }}
                        className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold border transition-colors flex items-center gap-1",
                          isDone 
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                            : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/20 hover:text-white"
                        )}
                      >
                        <CheckCircle className="w-3 h-3" />
                        <span>{isDone ? 'تم الحفظ' : 'تعليم كمحفوظ'}</span>
                      </button>
                    </div>

                    {/* The Poem Verse Columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center text-lg md:text-xl font-bold py-2 text-white leading-loose relative">
                      
                      {/* First Half (الصدر) */}
                      <div className="relative group">
                        <span className={cn(
                          "transition-all duration-300",
                          (hideMode === 'hideFirst' || hideMode === 'hideAll') && "blur-md select-none hover:blur-none opacity-20 hover:opacity-100 cursor-help"
                        )}>
                          {verse.firstHalf}
                        </span>
                        {(hideMode === 'hideFirst' || hideMode === 'hideAll') && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40 group-hover:opacity-0 transition-opacity">
                            <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-muted-foreground">انقر للاستكشاف</span>
                          </div>
                        )}
                      </div>

                      {/* Second Half (العجز) */}
                      <div className="relative group">
                        <span className={cn(
                          "transition-all duration-300",
                          (hideMode === 'hideSecond' || hideMode === 'hideAll') && "blur-md select-none hover:blur-none opacity-20 hover:opacity-100 cursor-help"
                        )}>
                          {verse.secondHalf}
                        </span>
                        {(hideMode === 'hideSecond' || hideMode === 'hideAll') && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40 group-hover:opacity-0 transition-opacity">
                            <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-muted-foreground">انقر للاستكشاف</span>
                          </div>
                        )}
                      </div>

                    </div>

                  </div>
                );
              })}
            </div>

          </div>

        </div>

        {/* Info & Meanings Sidebar */}
        <div className="lg:col-span-4">
          <div className="glass-card rounded-[2.5rem] p-6 border border-white/5 space-y-6 text-right sticky top-6">
            
            <div className="flex items-center gap-2.5 pb-4 border-b border-white/5">
              <Info className="h-5 w-5 text-amber-500" />
              <h4 className="text-lg font-black text-white">معاني وإيضاح البيت</h4>
            </div>

            {/* General meaning */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-muted-foreground block">المعنى العام للبيت:</span>
              <p className="text-white/80 text-sm leading-relaxed font-semibold">
                {activeVerse.meaning}
              </p>
            </div>

            {/* Vocabulary meaning */}
            <div className="space-y-4 pt-2">
              <span className="text-[10px] font-bold text-muted-foreground block">غريب الألفاظ والمفردات:</span>
              
              {activeVerse.vocabulary && activeVerse.vocabulary.length > 0 ? (
                <div className="space-y-3">
                  {activeVerse.vocabulary.map((vocab, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-white/[0.01] border border-white/5 space-y-1">
                      <span className="text-xs font-black text-amber-400 block">{vocab.word}</span>
                      <p className="text-muted-foreground text-[11px] leading-relaxed">
                        {vocab.meaning}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-xs italic">لا توجد كلمات غريبة تحتاج لشرح في هذا البيت.</p>
              )}
            </div>

            {/* Quick helper tip */}
            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-amber-400/90 text-xs leading-relaxed flex items-start gap-3">
              <Sparkles className="w-5 h-5 flex-shrink-0 mt-0.5 animate-pulse" />
              <div>
                <span className="font-bold block mb-1">نصيحة الحفظ المنهجي:</span>
                كرر قراءة البيت 5 مرات مع إغماض عينيك، ثم قم بتفعيل "إخفاء الشطور" واختبر نفسك حتى تتقنه تماماً قبل الانتقال للبيت التالي.
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
