"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  ArrowRight,
  Sparkles,
  Home,
  Plus,
  Play,
  Heart,
  Info,
  CheckCircle2,
  Clock,
  Trash2,
  Tv,
  BookOpen,
  Award,
  AlertTriangle,
  RotateCcw,
  Check,
  Compass,
  FileText,
  Volume2,
  Activity,
  MapPin,
  Copy,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Send,
  Bookmark
} from "lucide-react";

// ==========================================
// THEME SYSTEM CONFIGURATION
// ==========================================
interface Theme {
  id: string;
  name: string;
  bgClass: string;
  textClass: string;
  accentClass: string;
  cardBgClass: string;
  cardBorderClass: string;
  glowClass: string;
  headerBg: string;
  badgeBg: string;
  badgeText: string;
  primaryButton: string;
  inputBg: string;
  divider: string;
}

const THEMES: Record<string, Theme> = {
  emerald: {
    id: "emerald",
    name: "الروضة الشريفة",
    bgClass: "bg-[#020d08] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#06331a] via-[#020d08] to-[#010604]",
    textClass: "text-[#e8f5e9]",
    accentClass: "text-[#c5a880]",
    cardBgClass: "bg-[#041a10]/80 border-[#c5a880]/10 hover:border-[#c5a880]/30 shadow-[#c5a880]/5",
    cardBorderClass: "border-[#c5a880]/20 hover:border-[#c5a880]/40",
    glowClass: "shadow-[#c5a880]/10",
    headerBg: "bg-[#020d08]/90 border-[#c5a880]/15",
    badgeBg: "bg-[#c5a880]/10 border-[#c5a880]/20",
    badgeText: "text-[#c5a880]",
    primaryButton: "bg-gradient-to-r from-[#c5a880] to-[#e4d4c0] text-[#020d08] hover:shadow-[#c5a880]/20",
    inputBg: "bg-[#020d08]/90 border-[#c5a880]/20 text-[#e8f5e9] focus:border-[#c5a880]",
    divider: "border-[#c5a880]/10",
  },
  kaaba: {
    id: "kaaba",
    name: "كسوة الكعبة",
    bgClass: "bg-[#050508] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1d190e] via-[#050508] to-[#000000]",
    textClass: "text-[#ebd8a6]",
    accentClass: "text-[#d4af37]",
    cardBgClass: "bg-[#0b0c10]/90 border-[#d4af37]/10 hover:border-[#d4af37]/35 shadow-[#d4af37]/5",
    cardBorderClass: "border-[#d4af37]/20 hover:border-[#d4af37]/45",
    glowClass: "shadow-[#d4af37]/10",
    headerBg: "bg-[#050508]/90 border-[#d4af37]/15",
    badgeBg: "bg-[#d4af37]/10 border-[#d4af37]/20",
    badgeText: "text-[#d4af37]",
    primaryButton: "bg-gradient-to-r from-[#d4af37] to-[#ebd8a6] text-black hover:shadow-[#d4af37]/25",
    inputBg: "bg-[#0b0c10]/95 border-[#d4af37]/20 text-[#ebd8a6] focus:border-[#d4af37]",
    divider: "border-[#d4af37]/10",
  },
  indigo: {
    id: "indigo",
    name: "سماء الليل",
    bgClass: "bg-[#050716] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#10143a] via-[#050716] to-[#020308]",
    textClass: "text-slate-100",
    accentClass: "text-indigo-400",
    cardBgClass: "bg-[#090d26]/80 border-indigo-500/10 hover:border-indigo-500/30 shadow-indigo-500/5",
    cardBorderClass: "border-indigo-500/20 hover:border-indigo-500/40",
    glowClass: "shadow-indigo-500/10",
    headerBg: "bg-[#050716]/90 border-indigo-950/40",
    badgeBg: "bg-indigo-500/10 border-indigo-500/20",
    badgeText: "text-indigo-400",
    primaryButton: "bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:shadow-indigo-500/20",
    inputBg: "bg-[#090d26]/90 border-indigo-500/20 text-slate-100 focus:border-indigo-400",
    divider: "border-indigo-500/10",
  },
  sunrise: {
    id: "sunrise",
    name: "شروق الفجر",
    bgClass: "bg-[#0a0805] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#361e0b] via-[#0a0805] to-[#020100]",
    textClass: "text-amber-50",
    accentClass: "text-amber-505",
    cardBgClass: "bg-[#16110a]/85 border-amber-500/10 hover:border-amber-500/30 shadow-amber-500/5",
    cardBorderClass: "border-amber-500/20 hover:border-amber-500/40",
    glowClass: "shadow-amber-500/10",
    headerBg: "bg-[#0a0805]/90 border-amber-950/40",
    badgeBg: "bg-amber-500/10 border-amber-500/20",
    badgeText: "text-amber-400",
    primaryButton: "bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:shadow-amber-500/20",
    inputBg: "bg-[#16110a]/90 border-amber-500/20 text-amber-50 focus:border-amber-505",
    divider: "border-amber-500/10",
  },
  classic: {
    id: "classic",
    name: "الوقار الكلاسيكي",
    bgClass: "bg-[#0a0a0c] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#172221] via-[#0a0a0c] to-[#030304]",
    textClass: "text-slate-200",
    accentClass: "text-teal-400",
    cardBgClass: "bg-[#131a1a]/80 border-teal-500/10 hover:border-teal-500/30 shadow-teal-500/5",
    cardBorderClass: "border-teal-500/10 hover:border-teal-500/40",
    glowClass: "shadow-teal-500/10",
    headerBg: "bg-[#0a0a0c]/90 border-teal-950/30",
    badgeBg: "bg-teal-500/10 border-teal-500/20",
    badgeText: "text-teal-300",
    primaryButton: "bg-gradient-to-r from-teal-500 to-emerald-500 text-[#070909] hover:shadow-teal-500/20",
    inputBg: "bg-[#131a1a]/95 border-teal-500/20 text-slate-200 focus:border-teal-400",
    divider: "border-teal-500/10",
  }
};

// ==========================================
// CITIES AND PRAYER TIMES DATA
// ==========================================
interface City {
  name: string;
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

const CITIES: Record<string, City> = {
  mecca: { name: "مكة المكرمة", fajr: "04:38", dhuhr: "12:22", asr: "15:40", maghrib: "19:01", isha: "20:31" },
  medina: { name: "المدينة المنورة", fajr: "04:36", dhuhr: "12:23", asr: "15:47", maghrib: "19:05", isha: "20:35" },
  riyadh: { name: "الرياض", fajr: "04:12", dhuhr: "11:58", asr: "15:24", maghrib: "18:41", isha: "20:11" },
  cairo: { name: "القاهرة", fajr: "04:15", dhuhr: "12:59", asr: "16:37", maghrib: "19:57", isha: "21:30" },
  amman: { name: "عمان", fajr: "04:10", dhuhr: "12:44", asr: "16:25", maghrib: "19:44", isha: "21:14" },
  jerusalem: { name: "القدس الشريف", fajr: "04:12", dhuhr: "12:46", asr: "16:27", maghrib: "19:46", isha: "21:16" }
};

// ==========================================
// ADHKAR SYSTEM CONFIGURATION
// ==========================================
interface DhikrItem {
  id: string;
  text: string;
  count: number;
  description: string;
}

interface AdhkarCategoryConfig {
  label: string;
  icon: string;
  list: DhikrItem[];
}

const ADHKAR_CATEGORIES: Record<string, AdhkarCategoryConfig> = {
  post_prayer: {
    label: "أذكار بعد الصلاة",
    icon: "🕌",
    list: [
      { id: "p1", text: "أستغفرُ الله", count: 3, description: "يُقال ثلاث مرات بعد السلام مباشرة" },
      { id: "p2", text: "اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكُ السَّلَامُ، تَبَارَكْتَ ذَا الْجَلَالِ وَالْإِكْرَامِ", count: 1, description: "يُقال مرة واحدة بعد الاستغفار" },
      { id: "p3", text: "سُبْحَانَ الله", count: 33, description: "تسبيح الله ثلاثاً وثلاثين" },
      { id: "p4", text: "الْحَمْدُ لله", count: 33, description: "تحميد الله ثلاثاً وثلاثين" },
      { id: "p5", text: "اللهُ أَكْبَر", count: 33, description: "تكبير الله ثلاثاً وثلاثين" },
      { id: "p6", text: "لا إلَهَ إلَّا اللَّهُ وَحْدَهُ لا شَرِيكَ له، له المُلْكُ وَله الحَمْدُ، وَهو علَى كُلِّ شيءٍ قَدِيرٌ", count: 1, description: "تمام المئة - يغفر الخطايا وإن كانت مثل زبد البحر" },
      { id: "p7", text: "قراءة آية الكرسي", count: 1, description: "عصمة وحفظ وحرز عظيم للمسلم دبر كل صلاة" },
      { id: "p8", text: "قراءة سورة الإخلاص والمعوذتين", count: 1, description: "سورة الإخلاص، الفلق، والناس (دبر كل صلاة)" }
    ]
  },
  morning: {
    label: "أذكار الصباح",
    icon: "🌅",
    list: [
      { id: "m1", text: "قراءة آية الكرسي", count: 1, description: "من قالها حين يصبح أجير من الجن حتى يمسي" },
      { id: "m2", text: "قراءة سورة الإخلاص والمعوذات", count: 3, description: "تكفيك من كل شيء (ثلاث مرات)" },
      { id: "m3", text: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", count: 1, description: "مرة واحدة في الصباح" },
      { id: "m4", text: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ", count: 1, description: "سيد الاستغفار - من قالها موقناً بها ومات في يومه دخل الجنة" },
      { id: "m5", text: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ", count: 3, description: "لم يضره شيء في يومه وليلته" },
      { id: "m6", text: "رَضِيتُ بِاللَّهِ رَبَّاً، وَبِالْإِسْلَامِ دِيْنَّاً، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيَّاً", count: 3, description: "كان حقاً على الله أن يرضيه يوم القيامة" },
      { id: "m7", text: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ", count: 1, description: "إصلاح شأن المؤمن كله" },
      { id: "m8", text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", count: 100, description: "حُطت خطاياه وإن كانت مثل زبد البحر، ولم يأتِ أحد بأفضل مما جاء به" }
    ]
  },
  evening: {
    label: "أذكار المساء",
    icon: "🌇",
    list: [
      { id: "e1", text: "قراءة آية الكرسي", count: 1, description: "من قالها حين يمسي أجير من الجن حتى يصبح" },
      { id: "e2", text: "قراءة سورة الإخلاص والمعوذات", count: 3, description: "تكفيك من كل شيء (ثلاث مرات)" },
      { id: "e3", text: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", count: 1, description: "مرة واحدة في المساء" },
      { id: "e4", text: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ", count: 1, description: "سيد الاستغفار - من قالها موقناً بها ومات في ليلته دخل الجنة" },
      { id: "e5", text: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ", count: 3, description: "لم يضره شيء في يومه وليلته" },
      { id: "e6", text: "رَضِيتُ بِاللَّهِ رَبَّاً، وَبِالْإِسْلَامِ دِيْنَّاً، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيَّاً", count: 3, description: "كان حقاً على الله أن يرضيه يوم القيامة" },
      { id: "e7", text: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ", count: 3, description: "لم تضره حُمة (لدغة أو سم) في تلك الليلة" },
      { id: "e8", text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", count: 100, description: "حُطت خطاياه وإن كانت مثل زبد البحر" }
    ]
  },
  sleep: {
    label: "أذكار النوم",
    icon: "🌌",
    list: [
      { id: "s1", text: "جمع الكفين وقراءة الإخلاص والمعوذتين والنفث فيهما ومسح الجسد", count: 3, description: "يبدأ بمسح رأسه ووجهه وما أقبل من جسده (ثلاث مرات)" },
      { id: "s2", text: "قراءة آية الكرسي", count: 1, description: "لن يزال عليك من الله حافظ ولا يقربك شيطان حتى تصبح" },
      { id: "s3", text: "قراءة الآيتين من آخر سورة البقرة", count: 1, description: "من قرأهما في ليلة كفتاه (عن قيام الليل أو الآفات)" },
      { id: "s4", text: "بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي وَبِكَ أَرْفَعُهُ، فَإِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ", count: 1, description: "مرة واحدة قبل النوم" },
      { id: "s5", text: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ", count: 3, description: "ثلاث مرات عند وضع الكف اليمنى تحت الخد الأيمن" },
      { id: "s6", text: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا", count: 1, description: "مرة واحدة" },
      { id: "s7", text: "سُبْحَانَ الله (33)، والْحَمْدُ لله (33)، واللهُ أَكْبَر (34)", count: 1, description: "خير لكما من خادم - وصية الرسول لعلي وفاطمة رضي الله عنهما" }
    ]
  }
};

// ==========================================
// PRAYER DUAS DATABASE (Mausoo'at Ad'eeyah)
// ==========================================
const DUAS_DATABASE = [
  {
    category: "الاستفتاح",
    label: "أدعية الاستفتاح",
    items: [
      {
        id: "d1",
        title: "الصيغة الأولى (الاستفتاح بالتنزيه والحمد)",
        text: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، وَتَبَارَكَ اسْمُكَ، وَتَعَالَى جَدُّكَ، وَلَا إِلَهَ غَيْرُكَ",
        translation: "أنزهك يا الله تنزيهاً مطلقاً متلبساً بحمدك، وكثر خير اسمك وبركته، وعلا جلالك وعظمتك، ولا معبود بحق سواك.",
        benefit: "سنة بعد تكبيرة الإحرام وقبل القراءة. يبعث في القلوب التعظيم والتنزيه الكامل لله تبارك وتعالى، مما يهيئ العقل للتركيز والخشوع والتجرد من الشواغل الدنيوية.",
        source: "رواه أبو داود والترمذي وصححه الألباني"
      },
      {
        id: "d2",
        title: "الصيغة الثانية (طلب التطهير والغسيل من الذنوب)",
        text: "اللَّهُمَّ بَاعِدْ بَيْنِي وَبَيْنِ خَطَايَايَ كَمَا بَاعَدْتَ بَيْنَ الْمَشْرِقِ وَالْمَغْرِبِ، اللَّهُمَّ نَقِّنِي مِنْ خَطَايَايَ كَمَا يُنَقَّى الثَّوْبُ الْأَبْيَضُ مِنَ الدَّنَسِ، اللَّهُمَّ اغْسِلْنِي مِنْ خَطَايَايَ بِالثَّلْجِ وَالْمَاءِ وَالْبَرَدِ",
        translation: "يا رب، اجعل مسافة هائلة بيني وبين ذنوبي كما باعدت بين المشرق والمغرب، ونظفني منها كما يُنظف الثوب الأبيض من الأوساخ، واغسل خطاياي ببرد مغفرتك المطفئ لحرارة المعاصي.",
        benefit: "من أبلغ أدعية الاستفتاح في التوبة. استشعار وقوفك نقياً طاهراً يزيل عن كاهلك ثقل الذنوب، ويجعلك تقرأ القرآن بقلب سليم مطمئن وعين خاشعة.",
        source: "رواه البخاري ومسلم"
      }
    ]
  },
  {
    category: "الركوع",
    label: "أدعية الركوع",
    items: [
      {
        id: "d3",
        title: "التسبيح والتعظيم المعتاد",
        text: "سُبْحَانَ رَبِّيَ الْعَظِيمِ",
        translation: "تنزيهاً وتقديساً لربي صاحب العظمة والكبرياء والجلال.",
        benefit: "يُشرع تكرارها ثلاثاً أو أكثر. انحناء الجسد في الركوع يمثل الخضوع الظاهري، وتسبيح العظيم يمثل الخضوع القلبي الباطن، فتنحني الروح طاعة لله.",
        source: "صحيح مسلم"
      },
      {
        id: "d4",
        title: "التسبيح والتقديس لرب الملائكة",
        text: "سُبُّوحٌ قُدُّوسٌ، رَبُّ الْمَلَائِكَةِ وَالرُّوحِ",
        translation: "المطهر والمنزه المنفرد بالكمال، رب جميع الملائكة الكرام وجبريل عليه السلام.",
        benefit: "كان النبي ﷺ يكثر من قولها لربط عظمة الأرض بعظمة السماء وأكوان الغيب، فتستشعر طواف الملائكة حول العرش.",
        source: "رواه مسلم"
      },
      {
        id: "d5",
        title: "تسبيح مقرون بطلب المغفرة",
        text: "سُبْحَانَكَ اللَّهُمَّ رَبَّنَا وَبِحَمْدِكَ اللَّهُمَّ اغْفِرْ لِي",
        translation: "تنزيهاً لك يا الله ربنا وحمداً لك، أسألك أن تمحو ذنوبي وتقيل عثرتي.",
        benefit: "كان النبي ﷺ يداوم عليه متأولاً للقرآن الكريم (سورة النصر)، وهو يجمع بين التعظيم وطلب المغفرة في آن واحد.",
        source: "رواه البخاري ومسلم"
      }
    ]
  },
  {
    category: "السجود",
    label: "أدعية السجود (أقرب ما تكون)",
    items: [
      {
        id: "d6",
        title: "التسبيح الأساسي للسجود",
        text: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
        translation: "أقدس ربي الأعلى الذي له العلو المطلق فوق كل شيء، بينما أضع أشرف ما في جسدي (وجهي) على الأرض تذللاً وخضوعاً له.",
        benefit: "السجود هو غاية التواضع، وتسبيح (الأعلى) يذكرك بعظمة من تسجد له، مما يملأ النفس طمأنينة وسكينة ويقين بالإجابة.",
        source: "صحيح مسلم"
      },
      {
        id: "d7",
        title: "الدعاء الشامل لطلب المغفرة التامة",
        text: "اللَّهُمَّ اغْفِرْ لِي ذَنْبِي كُلَّهُ دِقَّهُ وَجِلَّهُ، وَأَوَّلَهُ وَآخِرَهُ وَعَلَانِيَتَهُ وَسِرَّهُ",
        translation: "اللهم اغفر لي ذنوبي جميعها: الصغير منها والكبير، القديم والحديث، ما جهرت به وما أسررته.",
        benefit: "كان يدعو به النبي ﷺ في سجوده، مستغلاً فرصة القرب الإلهي لغسل الصحيفة كلياً والعودة بقلب نقي كأنه ولد من جديد.",
        source: "رواه مسلم"
      }
    ]
  },
  {
    category: "بين السجدتين",
    label: "الدعاء بين السجدتين",
    items: [
      {
        id: "d8",
        title: "طلب الجبر والرحمة والرزق",
        text: "رَبِّ اغْفِرْ لِي، رَبِّ اغْفِرْ لِي، اللَّهُمَّ اغْفِرْ لِي وَارْحَمْنِي وَاجْبُرْنِي وَاهْدِنِي وَارْزُقْنِي",
        translation: "يا رب اغفر لي، وارحمني، واجبر كسري وضعفي، واهدني للحق، وارزقني من فضلك العظيم.",
        benefit: "هذا الدعاء يجمع كل مقومات الحياة الطيبة في الدنيا والآخرة، ويساعد على الطمأنينة وإعطاء هذا الركن حقه الشرعي بلا عجلة.",
        source: "رواه الترمذي وأبو داود"
      }
    ]
  },
  {
    category: "التشهد الأخير",
    label: "قبل السلام",
    items: [
      {
        id: "d9",
        title: "الاستعاذة من المهلكات الأربع",
        text: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عَذَابِ جَهَنَّمَ، وَمِنْ عَذَابِ الْقَبْرِ، وَمِنْ فِتْنَةِ الْمَحْيَا وَالْمَمَاتِ، وَمِنْ شَرِّ فِتْنَةِ الْمَسِيحِ الدَّجَّالِ",
        translation: "اللهم إني أستجير بك من عذاب النار وعذاب القبر، ومن فتن الدنيا عند الحياة وفتنة الموت عند الغرغرة، ومن شر فتنة المسيح الدجال الكبرى.",
        benefit: "كان النبي ﷺ يأمر أصحابه بالاستعاذة بهذه الأربع قبل التسليم والانتهاء من الصلاة لعظم شأنها وأثرها في تثبيت العقيدة.",
        source: "رواه البخاري ومسلم"
      }
    ]
  }
];

// ==========================================
// VISUAL PRAYER POSTURE STEPS
// ==========================================
interface PrayerStep {
  step: number;
  title: string;
  svg: React.ReactElement;
  sunnah: string[];
  errors: string[];
}

const PRAYER_STEPS: PrayerStep[] = [
  {
    step: 1,
    title: "تكبيرة الإحرام",
    svg: (
      <svg viewBox="0 0 100 100" className="w-24 h-24 md:w-32 md:h-32 text-inherit">
        <circle cx="50" cy="20" r="8" fill="currentColor" opacity="0.8" />
        <path d="M45,30 L55,30 L53,70 L47,70 Z" fill="currentColor" opacity="0.6" />
        <path d="M40,32 L32,22 L32,12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M60,32 L68,22 L68,12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
      </svg>
    ),
    sunnah: [
      "رفع اليدين بمحاذاة المنكبين أو الأذنين.",
      "توجيه الكفين باتجاه القبلة ونشر الأصابع.",
      "النطق بالتكبير (الله أكبر) متزامناً مع رفع اليدين.",
      "النظر إلى موضع السجود بخشوع وتذلل."
    ],
    errors: [
      "رفع اليدين فوق الأذنين بشكل مبالغ فيه أو تحت الصدر.",
      "سرعة التكبير بدون استقرار أو تحريك الرأس.",
      "تغميض العينين (إلا لحاجة دفع المشتتات البصرية)."
    ]
  },
  {
    step: 2,
    title: "القيام وقراءة الفاتحة",
    svg: (
      <svg viewBox="0 0 100 100" className="w-24 h-24 md:w-32 md:h-32 text-inherit">
        <circle cx="50" cy="21" r="8" fill="currentColor" opacity="0.8" />
        <path d="M45,30 L55,30 L52,75 L48,75 Z" fill="currentColor" opacity="0.6" />
        <path d="M43,33 L57,33" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <path d="M44,36 L56,36" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <rect x="47" y="75" width="2" height="20" fill="currentColor" opacity="0.8" />
        <rect x="51" y="75" width="2" height="20" fill="currentColor" opacity="0.8" />
      </svg>
    ),
    sunnah: [
      "وضع اليد اليمنى فوق اليسرى على الصدر أو فوق السرة.",
      "قراءة دعاء الاستفتاح سراً ثم الاستعاذة والبسملة.",
      "قراءة سورة الفاتحة بتدبر وتقسيم الآيات (آية آية).",
      "قراءة ما تيسر من القرآن بعدها في الركعتين الأولى والثانية."
    ],
    errors: [
      "كثرة الحركة والعبث بالملابس أو الساعة (يذهب الخشوع).",
      "الوقوف على قدم واحدة وترك الأخرى معلقة.",
      "الرفع بالبصر إلى السماء (ورد فيه نهي شديد)."
    ]
  },
  {
    step: 3,
    title: "الركوع والتعظيم",
    svg: (
      <svg viewBox="0 0 100 100" className="w-24 h-24 md:w-32 md:h-32 text-inherit">
        <path d="M30,45 L70,45 L70,53 L38,53 L38,80 L30,80 Z" fill="currentColor" opacity="0.6" />
        <circle cx="78" cy="48" r="7" fill="currentColor" opacity="0.8" />
        <line x1="65" y1="48" x2="60" y2="70" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="34" y1="53" x2="34" y2="90" stroke="currentColor" strokeWidth="3" />
        <line x1="38" y1="53" x2="38" y2="90" stroke="currentColor" strokeWidth="3" />
      </svg>
    ),
    sunnah: [
      "استواء الظهر تماماً بحيث لو صُب عليه الماء لاستقر.",
      "تمكين اليدين من الركبتين وتفريق الأصابع كالقابض عليهما.",
      "مد العنق ومحاذاة الرأس مع مستوى الظهر (لا يرتفع ولا ينخفض).",
      "قول سبحان ربي العظيم (ثلاثاً أو أكثر) بتفكر في معناه."
    ],
    errors: [
      "تقويس الظهر بشكل محدب أو ثني الركبتين كثيراً.",
      "ترك اليدين معلقتين دون تمكينهما من الركبتين.",
      "العجلة والسرعة وعدم الاستقرار (الاطمئنان ركن)."
    ]
  },
  {
    step: 4,
    title: "الاعتدال والرفع",
    svg: (
      <svg viewBox="0 0 100 100" className="w-24 h-24 md:w-32 md:h-32 text-inherit">
        <circle cx="50" cy="20" r="8" fill="currentColor" opacity="0.8" />
        <path d="M45,30 L55,30 L53,75 L47,75 Z" fill="currentColor" opacity="0.6" />
        <line x1="43" y1="32" x2="43" y2="60" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <line x1="57" y1="32" x2="57" y2="60" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <rect x="47" y="75" width="2" height="20" fill="currentColor" opacity="0.8" />
        <rect x="51" y="75" width="2" height="20" fill="currentColor" opacity="0.8" />
      </svg>
    ),
    sunnah: [
      "الرفع مع قول: (سمع الله لمن حمده) للإمام والمنفرد.",
      "رفع اليدين حذو المنكبين عند الرفع من الركوع.",
      "الاستقرار واقفاً حتى يرجع كل عظم لمكانه.",
      "قول: (ربنا ولك الحمد، حمداً كثيراً طيباً مباركاً فيه)."
    ],
    errors: [
      "الهبوط للسجود مباشرة دون إتمام الوقوف المستقيم.",
      "عدم الطمأنينة في هذا الركن (مبطل للصلاة عند الأئمة)."
    ]
  },
  {
    step: 5,
    title: "السجود والتذلل",
    svg: (
      <svg viewBox="0 0 100 100" className="w-24 h-24 md:w-32 md:h-32 text-inherit">
        <line x1="10" y1="85" x2="90" y2="85" stroke="currentColor" strokeWidth="2" opacity="0.5" />
        <circle cx="75" cy="79" r="6" fill="currentColor" opacity="0.8" />
        <path d="M35,60 L68,75 L65,83 L30,70 Z" fill="currentColor" opacity="0.6" />
        <line x1="68" y1="76" x2="68" y2="85" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <circle cx="32" cy="78" r="5" fill="currentColor" opacity="0.9" />
        <line x1="15" y1="70" x2="20" y2="85" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
    sunnah: [
      "السجود على الأعضاء السبعة (الجبهة والأنف، الكفان، الركبتان، القدمان).",
      "جعل الكفين حذو المنكبين أو الأذنين مبسوطة وموجهة للقبلة.",
      "رفع المرفقين عن الأرض ومجافاة العضدين عن الجانبين.",
      "ضم القدمين ونصب الكعبين وتوجيه أطراف الأصابع نحو القبلة."
    ],
    errors: [
      "بسط الذراعين بالكامل على الأرض (تشبهاً بالكلب).",
      "رفع القدمين أو إحداهما عن الأرض أثناء السجود.",
      "عدم ملامسة الأنف للأرض والاكتفاء بالجبهة فقط."
    ]
  },
  {
    step: 6,
    title: "الجلوس بين السجدتين",
    svg: (
      <svg viewBox="0 0 100 100" className="w-24 h-24 md:w-32 md:h-32 text-inherit">
        <line x1="10" y1="85" x2="90" y2="85" stroke="currentColor" strokeWidth="2" opacity="0.5" />
        <circle cx="58" cy="38" r="8" fill="currentColor" opacity="0.8" />
        <path d="M52,48 L64,48 L56,78 L44,78 Z" fill="currentColor" opacity="0.6" />
        <path d="M52,78 L30,78 L26,85" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" />
        <line x1="53" y1="52" x2="38" y2="78" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
    sunnah: [
      "الافتراش: الجلوس على الرجل اليسرى مبسوطة، ونصب اليمنى.",
      "وضع اليد اليمنى على الفخذ الأيمن، واليسرى على اليسار.",
      "الدعاء بين السجدتين: (رب اغفر لي، وارحمني، واجبرني، واهدني).",
      "إتمام السكون الكامل والاطمئنان قبل السجدة الثانية."
    ],
    errors: [
      "القعود السريع كالنقر دون استواء الظهر.",
      "وضع اليدين في وضعيات غريبة بعيدة عن الركبتين."
    ]
  },
  {
    step: 7,
    title: "التشهد والتسليم",
    svg: (
      <svg viewBox="0 0 100 100" className="w-24 h-24 md:w-32 md:h-32 text-inherit">
        <line x1="10" y1="85" x2="90" y2="85" stroke="currentColor" strokeWidth="2" opacity="0.5" />
        <circle cx="58" cy="38" r="8" fill="currentColor" opacity="0.8" />
        <path d="M52,48 L64,48 L56,78 L44,78 Z" fill="currentColor" opacity="0.6" />
        <path d="M52,78 L30,78 L26,85" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M53,52 L36,73 L28,73" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
        <circle cx="28" cy="73" r="2" fill="#ef4444" className="animate-ping" />
      </svg>
    ),
    sunnah: [
      "التورّك في التشهد الثاني (الجلوس على مقعدته ونصب رجله اليمنى).",
      "قبض أصابع اليد اليمنى والإشارة بالسبابة وتحريكها عند الدعاء.",
      "النظر إلى السبابة وعدم تجاوز البصر لها.",
      "الالتفات يميناً حنى يُرى بياض خده الأيمن، ثم يساراً."
    ],
    errors: [
      "عدم تحريك أو الإشارة بالسبابة أو العبث بها يميناً ويساراً.",
      "التسليم قبل انتهاء الإمام من قوله (السلام عليكم)."
    ]
  }
];

// ==========================================
// KHUSHU ASSESSMENT QUIZ DATA
// ==========================================
interface QuizOption {
  text: string;
  points: number;
}

interface QuizQuestion {
  id: number;
  question: string;
  options: QuizOption[];
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "ما هو سلوكك المعتاد عند قراءة الفاتحة والسورة بعد تكبيرة الإحرام؟",
    options: [
      { text: "أقرأها بسرعة دون تدبر أو تفكير في الكلمات.", points: 1 },
      { text: "أتدبر بعض الآيات وأسرح في معانٍ دنيوية في البعض الآخر.", points: 2 },
      { text: "أقف عند رأس كل آية، وأستشعر مخاطبة الله لي بالحمد والثناء.", points: 3 }
    ]
  },
  {
    id: 2,
    question: "كم مرة تشعر بالسرحان وتشتت الذهن في الركعة الواحدة؟",
    options: [
      { text: "أغلب الركعات، وقد يمر جزء من الصلاة ولا أدري أين أنا.", points: 1 },
      { text: "بين الفينة والأخرى، لكني أسعى لمجاهدة الوسوسة والعودة للتركيز فوراً.", points: 2 },
      { text: "نادراً جداً، وأشعر بحضور قلبي كامل ووعي تام بكل ركن.", points: 3 }
    ]
  },
  {
    id: 3,
    question: "كيف تصف سرعة انتقالك واستقرارك في أركان الصلاة (الركوع، السجود، والرفع منهما)؟",
    options: [
      { text: "أتحرك بسرعة فائقة (كالنقر) رغبة في إنهاء الصلاة للعودة لأشغالي.", points: 1 },
      { text: "معتدل السرعة، أقف لثانية أو ثانيتين ولا أطيل كثيراً.", points: 2 },
      { text: "أتأنى جداً وأستقر في كل وضع حتى يرجع كل مفصل لمكانه (الطمأنينة الكاملة).", points: 3 }
    ]
  },
  {
    id: 4,
    question: "ما هو حجم استعدادك وتهيئتك النفسية والروحية قبل التكبير للدخول في الصلاة؟",
    options: [
      { text: "أكبر فور سماع الإقامة أو دخول الوقت مباشرة دون أي تمهيد.", points: 1 },
      { text: "أتوضأ بهدوء وأقترب من السجادة قبل الصلاة بدقيقة أو دقيقتين.", points: 2 },
      { text: "أردد مع المؤذن، أصلي السنّة القبلية، وأستحضر عظمة الله ونية الصلاة بخشوع.", points: 3 }
    ]
  },
  {
    id: 5,
    question: "ماذا تفعل عادةً بعد الانتهاء من الصلاة والتسليم؟",
    options: [
      { text: "أنصرف فوراً لأشغالي دون قراءة أي أذكار أو أدعية.", points: 1 },
      { text: "أستغفر ثلاثاً على عجل ثم أتحرك.", points: 2 },
      { text: "أجلس بطمأنينة وأكمل الأذكار كاملة مع آية الكرسي والمعوذات بتدبر.", points: 3 }
    ]
  }
];

// ==========================================
// SUNAN & NAWAFIL DATA
// ==========================================
const SUNAN_ITEMS = [
  { key: "fajrRawatib", label: "سنة الفجر القبلية", desc: "ركعتان قبل صلاة الفجر (أفضل من الدنيا وما فيها)", rakaat: 2 },
  { key: "dhuhrPreRawatib", label: "سنة الظهر القبلية", desc: "أربع ركعات قبل صلاة الظهر (ركعتان ثم ركعتان)", rakaat: 4 },
  { key: "dhuhrPostRawatib", label: "سنة الظهر البعدية", desc: "ركعتان بعد صلاة الظهر", rakaat: 2 },
  { key: "maghribRawatib", label: "سنة المغرب البعدية", desc: "ركعتان بعد صلاة المغرب", rakaat: 2 },
  { key: "ishaRawatib", label: "سنة العشاء البعدية", desc: "ركعتان بعد صلاة العشاء", rakaat: 2 },
  { key: "duha", label: "صلاة الضحى", desc: "من ركعتين إلى ثمان ركعات (تعدل صدقة عن كل مفصل في الجسم)", rakaat: "2-8" },
  { key: "qiyamWitr", label: "قيام الليل والوتر", desc: "تبدأ من ركعة إلى إحدى عشرة ركعة بعد صلاة العشاء", rakaat: "1-11" }
];

// ==========================================
// DEFAULT SEED VIDEOS LIST
// ==========================================
const DEFAULT_VIDEOS = [
  {
    id: "vid-1",
    title: "كيف تتلذذ بالصلاة؟ - الحلقة الأولى التمهيدية",
    lecturer: "الشيخ مشاري الخراز",
    url: "https://www.youtube.com/embed/qNgo6E68H94",
    category: "الخشوع والتلذذ",
    description: "بداية رحلة تغيير الصلاة بالكامل والشعور بلذتها عبر خطوات إيمانية ونفسية عملية.",
    duration: "18 دقيقة",
    isDefault: true
  },
  {
    id: "vid-2",
    title: "علاج السرحان وتشتت الذهن في الصلاة نهائياً",
    lecturer: "الشيخ د. سليمان الرحيلي",
    url: "https://www.youtube.com/embed/H0KjS_M0_bA",
    category: "علاج السرحان",
    description: "نصائح شرعية وتوجيهات عملية للتغلب على وسوسة الشيطان، والتركيز الكامل أثناء الوقوف بين يدي الله.",
    duration: "12 دقيقة",
    isDefault: true
  },
  {
    id: "vid-3",
    title: "صفة صلاة النبي ﷺ خطوة بخطوة كأنك تراه",
    lecturer: "الشيخ محمد حسان",
    url: "https://www.youtube.com/embed/zH3vH4Z-v2M",
    category: "تعليم الصلاة",
    description: "شرح عملي وبصري مفصل لصفة الصلاة الصحيحة من التكبير حتى التسليم كما ورد في الأثر الشريف.",
    duration: "25 دقيقة",
    isDefault: true
  },
  {
    id: "vid-4",
    title: "أخطاء شائعة في الصلاة قد تبطلها أو تنقص أجرها",
    lecturer: "الشيخ د. عثمان الخميس",
    url: "https://www.youtube.com/embed/kYcsaE0KzYw",
    category: "تنبيهات وأخطاء",
    description: "استعراض للأخطاء الحركية واللفظية التي يقع فيها بعض المصلين وكيفية تفاديها باتباع السُنّة النبوية.",
    duration: "15 دقيقة",
    isDefault: true
  }
];

// Helper to convert HH:MM to minutes
const timeToMinutes = (timeStr: string) => {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
};

// Helper for countdown calculation
const getCountdown = (cityId: string) => {
  const city = CITIES[cityId] || CITIES.mecca;
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const currentSeconds = now.getSeconds();
  
  const prayers = [
    { id: "Fajr", label: "الفجر", time: city.fajr },
    { id: "Dhuhr", label: "الظهر", time: city.dhuhr },
    { id: "Asr", label: "العصر", time: city.asr },
    { id: "Maghrib", label: "المغرب", time: city.maghrib },
    { id: "Isha", label: "العشاء", time: city.isha }
  ];

  let nextPrayer = prayers[0];
  let diffMinutes = 0;

  for (const prayer of prayers) {
    const pMinutes = timeToMinutes(prayer.time);
    if (currentMinutes < pMinutes) {
      nextPrayer = prayer;
      diffMinutes = pMinutes - currentMinutes;
      break;
    }
  }

  // If we went through all and currentMinutes is after Isha
  if (currentMinutes >= timeToMinutes(city.isha)) {
    nextPrayer = prayers[0]; // Fajr
    diffMinutes = (24 * 60 - currentMinutes) + timeToMinutes(city.fajr);
  }

  let totalSeconds = diffMinutes * 60 - currentSeconds;
  if (totalSeconds < 0) totalSeconds = 0;

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    nextPrayer,
    hours,
    minutes,
    seconds,
    totalSeconds
  };
};

// Synth Audio Click Helper
const playSound = (freq = 800, type: OscillatorType = "sine", duration = 0.08) => {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.error("Audio feedback error:", e);
  }
};

// Synth Audio Chime for Qibla Alignment
const playChime = () => {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    
    const playNote = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      
      gain.gain.setValueAtTime(0.08, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };
    
    playNote(523.25, 0, 0.4); // C5
    playNote(659.25, 0.1, 0.4); // E5
    playNote(783.99, 0.2, 0.5); // G5
  } catch (e) {}
};

// Get last 7 days starting from 6 days ago up to today
const getLast7Days = () => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('en-CA');
    const dayName = d.toLocaleDateString('ar-EG', { weekday: 'short' });
    days.push({ dateStr, dayName });
  }
  return days;
};

export default function PrayerPage() {
  // ==========================================
  // COMPONENT STATE
  // ==========================================
  const { theme: globalTheme, setTheme: setGlobalTheme } = useTheme();

  const globalToLocalMap: Record<string, string> = {
    "theme-rawdah": "emerald",
    "theme-kaaba": "kaaba",
    "theme-night-sky": "indigo",
    "theme-dawn-sunrise": "sunrise",
    "theme-classic-dignity": "classic",
    "theme-deep-slate": "classic",
    "theme-midnight-indigo": "indigo",
    "theme-golden-dusk": "kaaba",
    "theme-desert-gold": "sunrise",
    "theme-forest-sage": "emerald",
    "theme-emerald-oasis": "emerald",
    "theme-ruby-ember": "sunrise",
    "theme-aqua-deep": "classic",
    "theme-rose-garden": "classic",
    "theme-obsidian-neon": "classic",
    "theme-vintage-parchment": "classic",
    "theme-royal-velvet": "indigo",
    "theme-ocean-breeze": "classic",
  };

  const localToGlobalMap: Record<string, string> = {
    "emerald": "theme-rawdah",
    "kaaba": "theme-kaaba",
    "indigo": "theme-night-sky",
    "sunrise": "theme-dawn-sunrise",
    "classic": "theme-classic-dignity"
  };

  const [activeTheme, setActiveTheme] = useState<string>("emerald");
  const [activeTab, setActiveTab] = useState<"importance" | "khushu" | "adhkar" | "duas" | "videos" | "tracker">("importance");
  
  // Sub-tabs inside "دليل الخشوع والسكينة"
  const [khushuSubTab, setKhushuSubTab] = useState<"challenge" | "visualGuide" | "assessment">("challenge");
  const [activeStep, setActiveStep] = useState<number>(0);

  // Diagnostic Concentration Assessment Quiz states
  const [quizStep, setQuizStep] = useState<number>(0); // 0 = intro, 1..5 = questions, 6 = results
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});

  // Reflection Journal states
  const [journalText, setJournalText] = useState<string>("");
  const [journalTag, setJournalTag] = useState<string>("focus");
  const [journalLogs, setJournalLogs] = useState<Array<{ id: string; text: string; tag: string; date: string }>>([]);

  // Gamification & Badges Tracking States
  const [completedAdhkarCount, setCompletedAdhkarCount] = useState<number>(0);
  const [completedMorningAdhkar, setCompletedMorningAdhkar] = useState<number>(0);
  const [completedEveningAdhkar, setCompletedEveningAdhkar] = useState<number>(0);
  const [completedSleepAdhkar, setCompletedSleepAdhkar] = useState<number>(0);
  const [watchedVideoCount, setWatchedVideoCount] = useState<number>(0);

  // Interactive Countdown widget state
  const [selectedCity, setSelectedCity] = useState<string>("mecca");
  const [countdown, setCountdown] = useState({
    nextPrayer: { id: "Fajr", label: "الفجر", time: "04:38" },
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalSeconds: 0
  });

  // Qibla Compass state
  const [userAngle, setUserAngle] = useState<number>(0);
  const [justAligned, setJustAligned] = useState<boolean>(false);

  // Prayer Duas state
  const [duaCategoryFilter, setDuaCategoryFilter] = useState<string>("الاستفتاح");
  const [expandedDuas, setExpandedDuas] = useState<Record<string, boolean>>({});
  const [copiedDuaId, setCopiedDuaId] = useState<string | null>(null);

  // Videos library state
  const [videos, setVideos] = useState<any[]>(DEFAULT_VIDEOS);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [videoCategoryFilter, setVideoCategoryFilter] = useState("الكل");
  
  // Video Form states
  const [newTitle, setNewTitle] = useState("");
  const [newLecturer, setNewLecturer] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newCategory, setNewCategory] = useState("الخشوع والتلذذ");
  const [newDesc, setNewDesc] = useState("");

  // Toast / notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Khushu Challenge state (checklist)
  const [khushuHabits, setKhushuHabits] = useState([
    { id: "h1", text: "الاستعداد المبكر وتكرار الأذن مع المؤذن", checked: false },
    { id: "h2", text: "صلاة السنن الرواتب وتهيئة العقل قبل الفريضة", checked: false },
    { id: "h3", text: "استشعار الوقوف بين يدي ملك الملوك وخالق الكون", checked: false },
    { id: "h4", text: "البطء والتأني في الانتقال بين الركوع والسجود (الطمأنينة)", checked: false },
    { id: "h5", text: "النظر إلى موضع السجود وعدم الالتفات البصري أو الذهني", checked: false },
    { id: "h6", text: "تدبر معاني الآيات التي تقرؤها وتغيير السور المعتادة", checked: false }
  ]);

  // Prayer tracker logs (for today)
  const [prayersLogged, setPrayersLogged] = useState<Record<string, { done: boolean; focus: number }>>({
    Fajr: { done: false, focus: 5 },
    Dhuhr: { done: false, focus: 5 },
    Asr: { done: false, focus: 5 },
    Maghrib: { done: false, focus: 5 },
    Isha: { done: false, focus: 5 }
  });

  // Sunan tracker logs (for today)
  const [sunanLogged, setSunanLogged] = useState<Record<string, boolean>>({
    fajrRawatib: false,
    dhuhrPreRawatib: false,
    dhuhrPostRawatib: false,
    maghribRawatib: false,
    ishaRawatib: false,
    duha: false,
    qiyamWitr: false
  });

  // 7-day history database state
  const [historyLogs, setHistoryLogs] = useState<Record<string, {
    prayers: Record<string, { done: boolean; focus: number }>;
    sunan: Record<string, boolean>;
  }>>({});

  // Subtab inside tracker tab
  const [trackerSubTab, setTrackerSubTab] = useState<"faraid" | "sunan" | "badges">("faraid");

  // Adhkar System States
  const [adhkarCategory, setAdhkarCategory] = useState<"post_prayer" | "morning" | "evening" | "sleep">("post_prayer");
  const [activeDhikrIdx, setActiveDhikrIdx] = useState<number>(0);
  const [dhikrCount, setDhikrCount] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [fontSize, setFontSize] = useState<"normal" | "large" | "xlarge">("normal");

  const handleFontSizeChange = (size: "normal" | "large" | "xlarge") => {
    setFontSize(size);
    localStorage.setItem("prayer_font_size", size);
    triggerToast(`تم ضبط حجم الخط إلى: ${size === 'normal' ? 'عادي' : size === 'large' ? 'كبير' : 'كبير جداً'}`);
  };

  const getFontScaleClass = () => {
    if (fontSize === "large") return "font-scale-large";
    if (fontSize === "xlarge") return "font-scale-xlarge";
    return "";
  };

  // Sync with global theme
  useEffect(() => {
    if (globalTheme && globalToLocalMap[globalTheme]) {
      setActiveTheme(globalToLocalMap[globalTheme]);
    }
  }, [globalTheme]);

  // Load user data from local storage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("prayer_page_theme");
    if (savedTheme && THEMES[savedTheme]) {
      setActiveTheme(savedTheme);
      const globalThemeId = localToGlobalMap[savedTheme];
      if (globalThemeId && globalTheme !== globalThemeId) {
        setGlobalTheme(globalThemeId);
      }
    } else if (globalTheme && globalToLocalMap[globalTheme]) {
      setActiveTheme(globalToLocalMap[globalTheme]);
    }

    const savedVideos = localStorage.getItem("prayer_custom_videos");
    if (savedVideos) {
      try {
        const parsed = JSON.parse(savedVideos);
        setVideos([...DEFAULT_VIDEOS, ...parsed]);
      } catch (e) {
        console.error("Error loading custom videos", e);
      }
    }

    const savedHabits = localStorage.getItem("prayer_khushu_habits");
    if (savedHabits) {
      try {
        setKhushuHabits(JSON.parse(savedHabits));
      } catch (e) {}
    }

    const savedLog = localStorage.getItem("prayer_log_today");
    if (savedLog) {
      try {
        setPrayersLogged(JSON.parse(savedLog));
      } catch (e) {}
    }

    const savedSunan = localStorage.getItem("prayer_sunan_today");
    if (savedSunan) {
      try {
        setSunanLogged(JSON.parse(savedSunan));
      } catch (e) {}
    }

    const savedHistory = localStorage.getItem("prayer_history");
    if (savedHistory) {
      try {
        setHistoryLogs(JSON.parse(savedHistory));
      } catch (e) {}
    }

    const savedJournal = localStorage.getItem("prayer_journal_logs");
    if (savedJournal) {
      try {
        setJournalLogs(JSON.parse(savedJournal));
      } catch (e) {}
    }

    const savedAdhkarCount = localStorage.getItem("prayer_completed_adhkar_count");
    if (savedAdhkarCount) setCompletedAdhkarCount(parseInt(savedAdhkarCount));

    const savedMorning = localStorage.getItem("prayer_morning_adhkar_count");
    if (savedMorning) setCompletedMorningAdhkar(parseInt(savedMorning));

    const savedEvening = localStorage.getItem("prayer_evening_adhkar_count");
    if (savedEvening) setCompletedEveningAdhkar(parseInt(savedEvening));

    const savedSleep = localStorage.getItem("prayer_sleep_adhkar_count");
    if (savedSleep) setCompletedSleepAdhkar(parseInt(savedSleep));

    const savedVideoCount = localStorage.getItem("prayer_watched_video_count");
    if (savedVideoCount) setWatchedVideoCount(parseInt(savedVideoCount));

    const savedFontSize = localStorage.getItem("prayer_font_size");
    if (savedFontSize === "normal" || savedFontSize === "large" || savedFontSize === "xlarge") {
      setFontSize(savedFontSize);
    }
  }, []);

  // Update Countdown Clock Hook
  useEffect(() => {
    setCountdown(getCountdown(selectedCity));
    const timer = setInterval(() => {
      setCountdown(getCountdown(selectedCity));
    }, 1000);
    return () => clearInterval(timer);
  }, [selectedCity]);

  // Compass Qibla Alignment Detection Hook
  const qiblaAngles: Record<string, number> = {
    mecca: 0,
    medina: 180,
    riyadh: 254,
    cairo: 135,
    amman: 161,
    jerusalem: 161
  };
  const qiblaAngle = qiblaAngles[selectedCity] || 0;
  const angleDiff = Math.abs(userAngle - qiblaAngle);
  const isAligned = selectedCity === 'mecca' ? true : (angleDiff < 5 || angleDiff > 355);

  useEffect(() => {
    if (selectedCity === 'mecca') return;
    if (isAligned && !justAligned) {
      playChime();
      triggerToast("تم محاذاة القبلة بنجاح باتجاه الكعبة المشرفة 🕋");
      setJustAligned(true);
    } else if (!isAligned && justAligned) {
      setJustAligned(false);
    }
  }, [isAligned, selectedCity]);

  // Show toast notification helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Switch Theme helper
  const handleThemeChange = (themeId: string) => {
    setActiveTheme(themeId);
    const globalThemeId = localToGlobalMap[themeId];
    if (globalThemeId) {
      setGlobalTheme(globalThemeId);
    }
    localStorage.setItem("prayer_page_theme", themeId);
    triggerToast(`تم تفعيل ثيم: ${THEMES[themeId].name}`);
  };

  // Sync to history database helper
  const syncToHistory = (
    updatedPrayers: Record<string, { done: boolean; focus: number }>,
    updatedSunan: Record<string, boolean>
  ) => {
    const todayStr = new Date().toLocaleDateString('en-CA');
    const updatedHistory = {
      ...historyLogs,
      [todayStr]: {
        prayers: updatedPrayers,
        sunan: updatedSunan
      }
    };
    setHistoryLogs(updatedHistory);
    localStorage.setItem("prayer_history", JSON.stringify(updatedHistory));
  };

  // Delete history log day helper
  const handleDeleteHistoryDay = (dateStr: string) => {
    const updated = { ...historyLogs };
    delete updated[dateStr];
    setHistoryLogs(updated);
    localStorage.setItem("prayer_history", JSON.stringify(updated));
    triggerToast("تم حذف سجل هذا اليوم بنجاح");
  };

  // YouTube URL Embed Parser
  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return "";
    let videoId = "";
    if (url.includes("youtube.com/embed/")) {
      return url;
    }
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      videoId = match[2];
    } else if (url.length === 11) {
      videoId = url;
    }
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  // Add custom video handler
  const handleAddVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newUrl) {
      triggerToast("يرجى ملء جميع الحقول الإلزامية");
      return;
    }

    const embedUrl = getYouTubeEmbedUrl(newUrl);
    const newVideoItem = {
      id: `custom-vid-${Date.now()}`,
      title: newTitle,
      lecturer: newLecturer || "مساهمة زائر",
      url: embedUrl,
      category: newCategory,
      description: newDesc || "لا يوجد وصف لهذا الفيديو.",
      duration: "منوع",
      isDefault: false
    };

    const savedCustomRaw = localStorage.getItem("prayer_custom_videos");
    let customList = [];
    if (savedCustomRaw) {
      try {
        customList = JSON.parse(savedCustomRaw);
      } catch (e) {}
    }

    const updatedCustom = [newVideoItem, ...customList];
    localStorage.setItem("prayer_custom_videos", JSON.stringify(updatedCustom));
    setVideos([...DEFAULT_VIDEOS, ...updatedCustom]);

    setNewTitle("");
    setNewLecturer("");
    setNewUrl("");
    setNewCategory("الخشوع والتلذذ");
    setNewDesc("");
    setIsAddModalOpen(false);
    triggerToast("تمت إضافة الفيديو الجديد بنجاح!");
  };

  // Delete video handler
  const handleDeleteVideo = (videoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const savedCustomRaw = localStorage.getItem("prayer_custom_videos");
    if (!savedCustomRaw) return;
    try {
      const customList = JSON.parse(savedCustomRaw);
      const filtered = customList.filter((v: any) => v.id !== videoId);
      localStorage.setItem("prayer_custom_videos", JSON.stringify(filtered));
      setVideos([...DEFAULT_VIDEOS, ...filtered]);
      triggerToast("تم حذف الفيديو من مكتبتك");
    } catch (e) {
      console.error("Error deleting video", e);
    }
  };

  // Toggle habit checkbox
  const handleToggleHabit = (id: string) => {
    const updated = khushuHabits.map((habit) => {
      if (habit.id === id) {
        return { ...habit, checked: !habit.checked };
      }
      return habit;
    });
    setKhushuHabits(updated);
    localStorage.setItem("prayer_khushu_habits", JSON.stringify(updated));
    
    const allChecked = updated.every(h => h.checked);
    if (allChecked) {
      triggerToast("هنيئاً لك! لقد حققت جميع آداب وأسباب الخشوع اليوم.");
    }
  };

  // Reset habits
  const handleResetHabits = () => {
    const reset = khushuHabits.map(h => ({ ...h, checked: false }));
    setKhushuHabits(reset);
    localStorage.setItem("prayer_khushu_habits", JSON.stringify(reset));
    triggerToast("تمت إعادة تعيين قائمة تحدي الخشوع");
  };

  // Update prayer status
  const handleTogglePrayerLog = (name: string) => {
    const updated = {
      ...prayersLogged,
      [name]: {
        ...prayersLogged[name],
        done: !prayersLogged[name].done
      }
    };
    setPrayersLogged(updated);
    localStorage.setItem("prayer_log_today", JSON.stringify(updated));
    syncToHistory(updated, sunanLogged);
  };

  // Update focus value for prayer
  const handleFocusChange = (name: string, value: number) => {
    const updated = {
      ...prayersLogged,
      [name]: {
        ...prayersLogged[name],
        focus: value
      }
    };
    setPrayersLogged(updated);
    localStorage.setItem("prayer_log_today", JSON.stringify(updated));
    syncToHistory(updated, sunanLogged);
  };

  // Update Sunan/Nawafil status
  const handleToggleSunanLog = (key: string) => {
    const updated = {
      ...sunanLogged,
      [key]: !sunanLogged[key]
    };
    setSunanLogged(updated);
    localStorage.setItem("prayer_sunan_today", JSON.stringify(updated));
    syncToHistory(prayersLogged, updated);
  };

  // Add Reflection Journal entry handler
  const handleAddJournal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalText.trim()) return;

    const newLog = {
      id: `journal-${Date.now()}`,
      text: journalText,
      tag: journalTag,
      date: new Date().toLocaleString('ar-EG', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      })
    };

    const updated = [newLog, ...journalLogs];
    setJournalLogs(updated);
    localStorage.setItem("prayer_journal_logs", JSON.stringify(updated));
    setJournalText("");
    triggerToast("تم تسجيل خاطرة الخشوع بنجاح 📝");
  };

  // Delete Reflection Journal entry
  const handleDeleteJournal = (id: string) => {
    const updated = journalLogs.filter(log => log.id !== id);
    setJournalLogs(updated);
    localStorage.setItem("prayer_journal_logs", JSON.stringify(updated));
    triggerToast("تم حذف الخاطرة");
  };

  // Handle Video click to track achievements
  const handleVideoClick = (vid: any) => {
    setSelectedVideo(vid);
    const newVideoCount = watchedVideoCount + 1;
    setWatchedVideoCount(newVideoCount);
    localStorage.setItem("prayer_watched_video_count", String(newVideoCount));
  };

  // Dua Actions
  const handleCopyDua = (text: string, id: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedDuaId(id);
      triggerToast("تم نسخ الدعاء للمحافظة عليه في صلاتك!");
      setTimeout(() => setCopiedDuaId(null), 2000);
    }
  };

  const toggleDuaExpand = (id: string) => {
    setExpandedDuas(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Evaluation Calculations
  const donePrayersCount = Object.values(prayersLogged).filter(p => p.done).length;
  const averageFocus = donePrayersCount > 0 
    ? Math.round(Object.values(prayersLogged).filter(p => p.done).reduce((acc, p) => acc + p.focus, 0) / donePrayersCount)
    : 0;

  const doneSunanCount = Object.values(sunanLogged).filter(val => val).length;

  const getEvaluationResult = (focusScore: number) => {
    if (donePrayersCount === 0) return { title: "ابدأ الصلاة اليوم", desc: "سجل صلواتك المفروضة لترى التقييم الإيماني للطمأنينة والخشوع.", color: "text-slate-400" };
    if (focusScore < 4) {
      return {
        title: "مجاهدة الصلاة",
        desc: "أجر المجاهدة عظيم. حاول التبكير بالوضوء بـ 5 دقائق والجلوس بانتظار الصلاة للاستعداد الذهني الكامل، وأطل السجود.",
        color: "text-rose-400"
      };
    } else if (focusScore >= 4 && focusScore <= 7) {
      return {
        title: "صلاة وادعة مطمئنة",
        desc: "مرتبة ممتازة، وللارتقاء أكثر: حاول تدبر معاني الآيات التي تقرؤها واستشعر أنك في مناجاة حية وخاصة مع الله عز وجل.",
        color: "text-amber-400"
      };
    } else {
      return {
        title: "مرتبة الإحسان العالية",
        desc: "ما شاء الله! تذوقت حلاوة الخشوع. استمر على هذا الحضور القلبي، واسأل الله دائماً الثبات والقبول.",
        color: "text-emerald-400"
      };
    }
  };

  const evalResult = getEvaluationResult(averageFocus);
  const theme = THEMES[activeTheme] || THEMES.emerald;

  const filteredVideos = videos.filter((vid) => {
    if (videoCategoryFilter === "الكل") return true;
    return vid.category === videoCategoryFilter;
  });

  // Compile 7 Days Progress Data
  const daysData = getLast7Days().map((day) => {
    const log = historyLogs[day.dateStr] || {
      prayers: {
        Fajr: { done: false, focus: 0 },
        Dhuhr: { done: false, focus: 0 },
        Asr: { done: false, focus: 0 },
        Maghrib: { done: false, focus: 0 },
        Isha: { done: false, focus: 0 }
      },
      sunan: {}
    };

    const doneCount = Object.values(log.prayers).filter((p: any) => p.done).length;
    const avgFocus = doneCount > 0
      ? Math.round(Object.values(log.prayers).filter((p: any) => p.done).reduce((acc: number, p: any) => acc + p.focus, 0) / doneCount)
      : 0;

    return {
      ...day,
      doneCount,
      avgFocus
    };
  });

  // Calculate SVG line path points for Focus score
  const focusPoints = daysData.map((d, i) => {
    const x = 30 + i * 65 + 15;
    const y = 110 - (d.avgFocus * 6.5);
    return { x, y, val: d.avgFocus };
  });

  const pathD = focusPoints.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, "");

  // SPIRITUAL BADGES CONFIGURATION
  const badges = [
    {
      id: "all_faraid",
      title: "تاج الفريضة",
      desc: "صلي جميع الفرائض الخمس اليوم",
      icon: "👑",
      unlocked: donePrayersCount === 5,
      color: "from-amber-500 to-yellow-400"
    },
    {
      id: "all_sunan",
      title: "نجم السنن",
      desc: "أدّ جميع السنن والنوافل السبع اليوم",
      icon: "✨",
      unlocked: doneSunanCount === 7,
      color: "from-emerald-500 to-teal-400"
    },
    {
      id: "khushu_complete",
      title: "حارس الخشوع",
      desc: "طوّع جميع عادات الخشوع الست اليوم",
      icon: "🛡️",
      unlocked: khushuHabits.every(h => h.checked),
      color: "from-cyan-500 to-blue-450"
    },
    {
      id: "adhkar_complete",
      title: "قلب مطمئن",
      desc: "أكمل مسبحة أذكار الصلاة التفاعلية",
      icon: "🕊️",
      unlocked: completedAdhkarCount > 0,
      color: "from-indigo-500 to-purple-400"
    },
    {
      id: "morning_adhkar",
      title: "نجم الصباح",
      desc: "أكمل أذكار الصباح كاملة مرة واحدة",
      icon: "🌅",
      unlocked: completedMorningAdhkar > 0,
      color: "from-amber-400 to-yellow-500"
    },
    {
      id: "evening_adhkar",
      title: "حارس المساء",
      desc: "أكمل أذكار المساء كاملة مرة واحدة",
      icon: "🌇",
      unlocked: completedEveningAdhkar > 0,
      color: "from-orange-500 to-amber-650"
    },
    {
      id: "sleep_adhkar",
      title: "نوم هنيء",
      desc: "أكمل أذكار النوم كاملة مرة واحدة",
      icon: "🌌",
      unlocked: completedSleepAdhkar > 0,
      color: "from-indigo-600 to-blue-500"
    },
    {
      id: "journal_entry",
      title: "كاتب الخواطر",
      desc: "دوّن أول خاطرة في مفكرة الخشوع",
      icon: "📝",
      unlocked: journalLogs.length > 0,
      color: "from-pink-500 to-rose-400"
    },
    {
      id: "video_watched",
      title: "مستمع المواعظ",
      desc: "شاهد أحد الدروس المرئية في مكتبة الفيديوهات",
      icon: "🎓",
      unlocked: watchedVideoCount > 0,
      color: "from-violet-500 to-fuchsia-400"
    },
    {
      id: "streak_logs",
      title: "مستمر الالتزام",
      desc: "سجل صلواتك في التقويم لـ 3 أيام مختلفة",
      icon: "📈",
      unlocked: Object.keys(historyLogs).length >= 3,
      color: "from-teal-500 to-green-400"
    }
  ];

  const activeAdhkarList = ADHKAR_CATEGORIES[adhkarCategory].list;

  return (
    <div className={`flex flex-col min-h-screen ${theme.bgClass} ${theme.textClass} font-sans transition-all duration-500 pb-32 ${getFontScaleClass()}`}>
      
      {/* Dynamic inline styles for Font Scaling */}
      <style dangerouslySetInnerHTML={{ __html: `
        .font-scale-large .text-\\[10px\\] { font-size: 12px !important; }
        .font-scale-large .text-xs { font-size: 0.85rem !important; }
        .font-scale-large .text-sm { font-size: 1.025rem !important; }
        .font-scale-large .text-base { font-size: 1.18rem !important; }
        .font-scale-large .text-lg { font-size: 1.325rem !important; }
        .font-scale-large .text-xl { font-size: 1.55rem !important; }
        .font-scale-large .text-2xl { font-size: 1.9rem !important; }
        .font-scale-large .text-3xl { font-size: 2.35rem !important; }

        .font-scale-xlarge .text-\\[10px\\] { font-size: 14px !important; }
        .font-scale-xlarge .text-xs { font-size: 0.95rem !important; }
        .font-scale-xlarge .text-sm { font-size: 1.15rem !important; }
        .font-scale-xlarge .text-base { font-size: 1.32rem !important; }
        .font-scale-xlarge .text-lg { font-size: 1.5rem !important; }
        .font-scale-xlarge .text-xl { font-size: 1.8rem !important; }
        .font-scale-xlarge .text-2xl { font-size: 2.25rem !important; }
        .font-scale-xlarge .text-3xl { font-size: 2.75rem !important; }
      ` }} />
      
      {/* ================= HEADER / BAR ================= */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b ${theme.headerBg} px-4 md:px-8 py-4 transition-all duration-300`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className={`h-9 w-9 rounded-xl bg-black/30 border ${theme.cardBorderClass} flex items-center justify-center transition-all`}
            >
              <ArrowRight className="w-4 h-4 text-inherit" />
            </Link>
            <div>
              <h1 className="text-lg md:text-xl font-bold flex items-center gap-1.5">
                فريضة الصلاة والخشوع
                <Sparkles className={`w-4 h-4 ${theme.accentClass} animate-pulse`} />
              </h1>
              <p className="text-[10px] opacity-75 font-light">صفحة تفاعلية متطورة لبيان أهمية الصلاة وتطوير الخشوع</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              href="/"
              className={`flex items-center gap-1 bg-black/40 hover:bg-black/60 border ${theme.cardBorderClass} text-xs font-semibold px-3 py-1.5 rounded-xl transition`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>الرئيسية</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ================= MAIN WRAPPER ================= */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-8 flex-1 w-full">
        
        {/* Dynamic Glassmorphic Hero Card */}
        <div className={`relative overflow-hidden rounded-3xl bg-black/20 border border-white/5 p-6 md:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-2xl transition-all`}>
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[60px] pointer-events-none" />

          <div className="flex flex-col gap-3 text-center lg:text-right max-w-xl">
            <div className={`inline-flex items-center gap-1.5 self-center lg:self-start px-3 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 ${theme.accentClass}`}>
              <Info className="w-3.5 h-3.5" />
              صلاتي هي حياتي
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              أقربُ ما يَكونُ العبْدُ مِن ربِّهِ <span className={theme.accentClass}>وَهوَ ساجِدٌ</span>
            </h2>
            <p className="opacity-80 text-xs md:text-sm leading-relaxed">
              إن الصلاة هي الصلة المباشرة التي تربط المخلوق الضعيف بالخالق القوي الرحيم. لم تُفرض الصلاة في الأرض بل فُرضت فوق سبع سماوات في رحلة المعراج، إعلاناً لمكانتها العظيمة وأهميتها القصوى في حياة المؤمن ونجاحه في الدنيا والآخرة.
            </p>
          </div>

          {/* Quick interactive widget: Next prayer counter */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-4 w-full lg:w-fit shrink-0">
            {/* Daily Obligatory Meter */}
            <div className={`flex flex-col items-center justify-center p-4 rounded-2xl bg-black/40 border border-white/10 backdrop-blur w-full sm:w-60`}>
              <div className="text-center">
                <span className="text-[10px] opacity-60 uppercase font-bold block">مؤشر الفريضة اليومي</span>
                <span className={`text-2xl font-extrabold block my-1 ${theme.accentClass}`}>{donePrayersCount} / 5</span>
                <span className="text-[10px] opacity-75 block">صلوات مفروضة تم أداؤها اليوم</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-3">
                <div 
                  className={`h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-500`}
                  style={{ width: `${(donePrayersCount / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* Daily Sunan Meter */}
            <div className={`flex flex-col items-center justify-center p-4 rounded-2xl bg-black/40 border border-white/10 backdrop-blur w-full sm:w-60`}>
              <div className="text-center">
                <span className="text-[10px] opacity-60 uppercase font-bold block">مؤشر السنن والنوافل</span>
                <span className={`text-2xl font-extrabold block my-1 text-emerald-400`}>{doneSunanCount} / 7</span>
                <span className="text-[10px] opacity-75 block">سنن ونوافل تم تسجيلها اليوم</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-3">
                <div 
                  className={`h-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-500`}
                  style={{ width: `${(doneSunanCount / 7) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ================= DUAL WIDGETS: PRAYER TIMES & QIBLA COMPASS ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column 1 & 2: Prayer Times & Countdown */}
          <div className="lg:col-span-2 flex flex-col sm:flex-row">
            <section className={`p-6 rounded-3xl bg-black/30 border border-white/5 flex flex-col gap-5 shadow-xl w-full justify-between`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-3">
                <div className="flex items-center gap-2.5">
                  <MapPin className={`w-4 h-4 ${theme.accentClass}`} />
                  <span className="text-xs font-bold text-slate-100">مواقيت الصلاة في:</span>
                  <select
                    value={selectedCity}
                    onChange={(e) => {
                      setSelectedCity(e.target.value);
                      triggerToast(`تم تحويل التوقيت إلى: ${CITIES[e.target.value].name}`);
                    }}
                    className={`px-3 py-1 rounded-xl text-xs outline-none bg-slate-900 border border-white/10 ${theme.accentClass} font-semibold cursor-pointer`}
                  >
                    {Object.entries(CITIES).map(([id, c]) => (
                      <option key={id} value={id} className="bg-slate-900 text-white">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center gap-2 bg-amber-500/10 px-3.5 py-1.5 rounded-full border border-amber-500/25">
                  <Clock className="w-4 h-4 text-amber-500 animate-spin" style={{ animationDuration: "12s" }} />
                  <span className="text-xs font-bold text-amber-400">
                    العد التنازلي لـ {countdown.nextPrayer.label}:
                  </span>
                  <span className="text-sm font-black text-amber-300 tracking-wider font-mono">
                    {String(countdown.hours).padStart(2, '0')}:
                    {String(countdown.minutes).padStart(2, '0')}:
                    {String(countdown.seconds).padStart(2, '0')}
                  </span>
                </div>
              </div>

              {/* Prayer grid */}
              <div className="grid grid-cols-5 gap-2.5 text-center">
                {[
                  { id: "Fajr", label: "الفجر", icon: "🌅" },
                  { id: "Dhuhr", label: "الظهر", icon: "☀️" },
                  { id: "Asr", label: "العصر", icon: "⛅" },
                  { id: "Maghrib", label: "المغرب", icon: "🌇" },
                  { id: "Isha", label: "العشاء", icon: "🌃" }
                ].map((p) => {
                  const isNext = countdown.nextPrayer.id === p.id;
                  const cityObj = CITIES[selectedCity] || CITIES.mecca;
                  // @ts-ignore
                  const time = cityObj[p.id.toLowerCase()];
                  return (
                    <div
                      key={p.id}
                      className={`p-2.5 rounded-2xl border transition-all duration-300 ${
                        isNext
                          ? `bg-amber-500/10 border-amber-500/40 shadow-lg ${theme.glowClass} scale-[1.03]`
                          : "bg-black/25 border-white/5 hover:border-white/10"
                      }`}
                    >
                      <span className="text-lg block">{p.icon}</span>
                      <span className="text-[9px] opacity-60 block my-1 font-bold">{p.label}</span>
                      <span className="text-xs font-extrabold block text-slate-100 font-mono">{time}</span>
                      {isNext && (
                        <span className="text-[7px] font-black text-amber-400 block animate-pulse mt-0.5">القادمة</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Column 3: Qibla Compass */}
          <div className="lg:col-span-1 flex">
            <section className={`p-6 rounded-3xl bg-black/30 border ${isAligned ? 'border-emerald-500/30 bg-emerald-950/5' : 'border-white/5'} flex flex-col gap-4 shadow-xl w-full items-center justify-between transition-all duration-300`}>
              <div className="w-full flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                  <Compass className={`w-4 h-4 ${theme.accentClass} ${isAligned ? 'animate-spin' : ''}`} />
                  محاكي بوصلة القبلة
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isAligned ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/5 text-slate-400'}`}>
                  {selectedCity === 'mecca' ? "أنت في مكة" : isAligned ? "القبلة صحيحة 🕋" : "دوّر البوصلة"}
                </span>
              </div>

              {/* Compass Dial */}
              <div className="relative flex items-center justify-center">
                <svg viewBox="0 0 150 150" className="w-32 h-32 md:w-36 md:h-36">
                  <circle cx="75" cy="75" r="68" fill="none" stroke={isAligned ? "#10b981" : "rgba(255,255,255,0.05)"} strokeWidth="2.5" className="transition-all duration-300" />
                  
                  {/* Rotating Dial Group */}
                  <g transform={`rotate(${-userAngle}, 75, 75)`} className="transition-transform duration-100">
                    <circle cx="75" cy="75" r="60" fill="rgba(0,0,0,0.5)" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
                    
                    <line x1="75" y1="15" x2="75" y2="20" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                    <line x1="75" y1="130" x2="75" y2="135" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                    <line x1="15" y1="75" x2="20" y2="75" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                    <line x1="130" y1="75" x2="135" y2="75" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                    
                    <text x="75" y="27" fill="#ef4444" fontSize="9" fontWeight="bold" textAnchor="middle">ش</text>
                    <text x="75" y="129" fill="rgba(255,255,255,0.5)" fontSize="8" textAnchor="middle">ج</text>
                    <text x="127" y="78" fill="rgba(255,255,255,0.5)" fontSize="8" textAnchor="middle">ق</text>
                    <text x="23" y="78" fill="rgba(255,255,255,0.5)" fontSize="8" textAnchor="middle">غ</text>

                    {/* Kaaba Target Marker */}
                    {selectedCity !== 'mecca' && (
                      <g transform={`rotate(${qiblaAngle}, 75, 75)`}>
                        <line x1="75" y1="15" x2="75" y2="35" stroke="#d4af37" strokeWidth="2" strokeDasharray="2,2" />
                        <circle cx="75" cy="28" r="5" fill="#d4af37" />
                        <text x="75" y="42" fill="#d4af37" fontSize="7" fontWeight="bold" textAnchor="middle">🕋 القبلة</text>
                      </g>
                    )}
                  </g>

                  {/* Fixed front pointer */}
                  <polygon points="75,10 71,20 79,20" fill={isAligned ? "#10b981" : "#ef4444"} className="transition-all duration-300" />
                  
                  {/* Needle pointing to Mecca */}
                  {selectedCity !== 'mecca' ? (
                    <g transform={`rotate(${qiblaAngle - userAngle}, 75, 75)`} className="transition-transform duration-100">
                      <polygon points="75,32 71,75 79,75" fill="#d4af37" />
                      <polygon points="75,118 71,75 79,75" fill="rgba(255,255,255,0.2)" />
                      <circle cx="75" cy="75" r="4.5" fill="#000" stroke="#d4af37" strokeWidth="1.5" />
                    </g>
                  ) : (
                    <circle cx="75" cy="75" r="8" fill="#10b981" className="animate-ping" />
                  )}
                </svg>
              </div>

              {/* Slider for rotation simulation */}
              <div className="flex flex-col items-center gap-1.5 w-full">
                <span className="text-[9px] opacity-60 font-semibold">حاكي تدوير جهازك حتى تطابق سهم القبلة:</span>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={userAngle}
                  onChange={(e) => setUserAngle(parseInt(e.target.value))}
                  className="w-full accent-amber-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between w-full text-[9px] opacity-40 font-mono">
                  <span>0° ش</span>
                  <span>90° ق</span>
                  <span>180° ج</span>
                  <span>270° غ</span>
                </div>
              </div>
            </section>
          </div>
          
        </div>

        {/* ================= SETTINGS PANEL: THEME & FONT SIZE ================= */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 rounded-3xl p-6 bg-black/30 border border-white/5 shadow-lg">
          
          {/* Column 1 & 2: Themes */}
          <div className="lg:col-span-2 flex flex-col gap-4 border-b lg:border-b-0 lg:border-l border-white/5 pb-6 lg:pb-0 lg:pl-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="text-sm font-bold flex items-center gap-1.5">
                <span>🎨 المظهر والثيم الإيماني:</span>
              </h3>
              <span className="text-[10px] opacity-55">تخصيص ألوان الصفحة للهدوء البصري</span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {Object.values(THEMES).map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleThemeChange(t.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs font-semibold transition-all duration-300 cursor-pointer ${
                    activeTheme === t.id
                      ? `${t.primaryButton} scale-[1.03] border-transparent font-black shadow-lg`
                      : "bg-black/40 border-white/10 hover:bg-black/60 text-slate-300 hover:border-white/20"
                  }`}
                >
                  <div className="w-3 h-3 rounded-full border border-black/10" style={{ 
                    backgroundColor: t.id === 'emerald' ? '#c5a880' : 
                                     t.id === 'kaaba' ? '#d4af37' : 
                                     t.id === 'indigo' ? '#818cf8' : 
                                     t.id === 'sunrise' ? '#f59e0b' : '#2dd4bf'
                  }} />
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Column 3: Font Size Controller */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="text-sm font-bold flex items-center gap-1.5">
                <span>🔍 حجم الخط للقراءة:</span>
              </h3>
              <span className="text-[10px] opacity-55">تحكم في مقاس وحجم نصوص الصفحة</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "normal", label: "عادي (A)", desc: "100%" },
                { id: "large", label: "كبير (A+)", desc: "115%" },
                { id: "xlarge", label: "كبير جداً (A++)", desc: "130%" }
              ].map((sizeObj) => (
                <button
                  key={sizeObj.id}
                  onClick={() => handleFontSizeChange(sizeObj.id as any)}
                  className={`flex flex-col items-center justify-center p-2 rounded-2xl border text-center transition-all duration-300 cursor-pointer ${
                    fontSize === sizeObj.id
                      ? `${theme.primaryButton} scale-[1.03] border-transparent font-black shadow-lg`
                      : "bg-black/40 border-white/10 hover:bg-black/60 text-slate-300 hover:border-white/20"
                  }`}
                >
                  <span className="text-xs font-bold">{sizeObj.label}</span>
                  <span className="text-[9px] opacity-60 font-mono mt-0.5">{sizeObj.desc}</span>
                </button>
              ))}
            </div>
          </div>

        </section>

        {/* ================= INTERACTIVE NAVIGATION TABS ================= */}
        <div className="flex border-b border-white/5 overflow-x-auto pb-px">
          {[
            { id: "importance", label: "أهمية الصلاة ومكانتها", icon: <FileText className="w-4 h-4" /> },
            { id: "khushu", label: "دليل الخشوع والسكينة", icon: <Award className="w-4 h-4" /> },
            { id: "adhkar", label: "سلسلة الأذكار والمسبحة", icon: <Volume2 className="w-4 h-4" /> },
            { id: "duas", label: "أدعية الصلاة", icon: <BookOpen className="w-4 h-4" /> },
            { id: "videos", label: "مكتبة المرئيات والدروس", icon: <Tv className="w-4 h-4" /> },
            { id: "tracker", label: "مخطط الصلاة والطمأنينة", icon: <Compass className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all border-b-2 cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? `border-amber-500 ${theme.accentClass} bg-white/5 rounded-t-xl font-bold`
                  : "border-transparent opacity-60 hover:opacity-100 hover:border-white/10"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ================= TAB CONTENT AREA ================= */}
        <div className="flex-1 w-full min-h-[400px]">
          
          {/* 1. IMPORTANCE OF PRAYER TAB */}
          {activeTab === "importance" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              <div className="lg:col-span-2 flex flex-col gap-6">
                
                {/* Status card */}
                <div className={`p-6 rounded-3xl ${theme.cardBgClass} border transition-all duration-300`}>
                  <h3 className={`text-lg font-bold flex items-center gap-2 mb-4 ${theme.accentClass}`}>
                    <CheckCircle2 className="w-5 h-5" />
                    مكانة الصلاة العالية في الإسلام
                  </h3>
                  <div className="flex flex-col gap-4 text-xs md:text-sm leading-relaxed opacity-90">
                    <p>
                      الصلاة ليست مجرد عبادة حركية، بل هي الركن الثاني من أركان الإسلام الخمسة وعموده الفقري الذي لا يستقيم إلا به. قال رسول الله ﷺ: <span className="font-semibold text-amber-400">«رأسُ الأمرِ الإسلامُ وعمودُهُ الصَّلاةُ»</span>.
                    </p>
                    <p>
                      هي العبادة الوحيدة التي لم تسقط عن المسلم في أي حال من الأحوال طالما بقي عقله واعيًا؛ فالمريض يصلي حسب استطاعته (قائمًا، أو قاعدًا، أو على جنب، أو بعينيه)، وفي المعارك شُرعت "صلاة الخوف"، مما يبرهن على أنها همزة الوصل الدائمة التي لا تنقطع بين العبد وخالقه.
                    </p>
                  </div>
                </div>

                {/* Virtues cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div className={`p-6 rounded-3xl ${theme.cardBgClass} border transition-all duration-300`}>
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full uppercase">البركة الدنيوية والروحية</span>
                    <h4 className="text-base font-bold text-slate-100 mt-3 mb-2">تطهير النفس وتكفير الذنوب</h4>
                    <p className="text-xs opacity-75 leading-relaxed font-light">
                      الصلاة اليومية الخمس كالنهر الجاري الذي يغتسل منه المؤمن، قال ﷺ: <span className="font-semibold text-amber-400">«أرأيتُم لو أنَّ نَهرًا ببابِ أحدِكم يَغتسِلُ منه كلَّ يومٍ خَمسَ مرَّاتٍ، هل يَبقَى من دَرنِهِ شيءٌ؟ قالوا: لا... قال: فذلِك مَثلُ الصَّلواتِ الخمسِ يَمحُو اللهُ بهنَّ الخطايا»</span>.
                    </p>
                  </div>

                  <div className={`p-6 rounded-3xl ${theme.cardBgClass} border transition-all duration-300`}>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase">الراحة والسكينة</span>
                    <h4 className="text-base font-bold text-slate-100 mt-3 mb-2">ملاذ القلوب ومصدر السكينة</h4>
                    <p className="text-xs opacity-75 leading-relaxed font-light">
                      كان النبي ﷺ إذا حزبه أمر أو فزع فزع إلى الصلاة، ويقول للمؤذن بلال بن رباح رضي الله عنه: <span className="font-semibold text-amber-400">«يا بلالُ أقمِ الصلاةَ، أرِحْنا بها»</span>. فالراحة والطمأنينة الحقيقية تكمن في الخضوع لله وتفريغ الهموم ساجداً.
                    </p>
                  </div>

                  <div className={`p-6 rounded-3xl ${theme.cardBgClass} border transition-all duration-300`}>
                    <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full uppercase">يوم القيامة</span>
                    <h4 className="text-base font-bold text-slate-100 mt-3 mb-2">أول ما يحاسب عليه المرء</h4>
                    <p className="text-xs opacity-75 leading-relaxed font-light">
                      عن أبي هريرة رضي الله عنه قال: سمعت رسول الله ﷺ يقول: <span className="font-semibold text-amber-400">«إنَّ أولَ ما يُحاسبُ به العبدُ يومَ القيامةِ من عملِهِ صلاتُهُ، فإن صَلُحَتْ فقد أفلحَ وأنجحَ، وإن فسَدَتْ فقد خابَ وخسِرَ»</span>. هي بوابة الحساب وميزان الأعمال كلها.
                    </p>
                  </div>

                  <div className={`p-6 rounded-3xl ${theme.cardBgClass} border transition-all duration-300`}>
                    <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-full uppercase">الأثر الحياتي</span>
                    <h4 className="text-base font-bold text-slate-100 mt-3 mb-2">الوقاية والتحصين من الآثام</h4>
                    <p className="text-xs opacity-75 leading-relaxed font-light">
                      للصلاة أثر عظيم يظهر في حياة العبد وسلوكه مع الناس، يقول الله عز وجل في القرآن الكريم: <span className="font-semibold text-amber-400">...إِنَّ الصَّلَاةَ تَنْهَىٰ عَنِ الْفَحْشَاءِ وَالْمُنكَرِ</span>. فهي حارس أخلاقي يصحح مسار العبد يومياً.
                    </p>
                  </div>

                </div>

              </div>

              {/* Sidebar quotes & notes */}
              <div className="flex flex-col gap-6">
                
                <div className={`p-6 rounded-3xl bg-black/45 border ${theme.cardBorderClass} shadow-xl flex flex-col justify-between`}>
                  <div>
                    <h4 className={`text-base font-bold mb-3 ${theme.accentClass}`}>💡 وقفات إيمانية وتأملات</h4>
                    <p className="text-xs opacity-80 leading-relaxed font-light">
                      تأمل كيف أن أركان الإسلام الأخرى لها شروط تسقط بها (الزكاة لمن لا يملك النصاب، الصيام للمريض والمسافر، الحج لغير المستطيع), إلا الصلاة!
                      إنها البصمة الفريدة التي تجعلك على صلة دائمة بالله.
                    </p>
                  </div>
                  <div className={`mt-6 border-t ${theme.divider} pt-4 text-[10px] opacity-60 text-left`}>
                    مستفاد من تفسير ابن كثير للآيات
                  </div>
                </div>

                <div className={`p-6 rounded-3xl bg-amber-500/5 border border-amber-500/15 shadow-xl`}>
                  <h4 className="text-xs font-bold text-amber-400 mb-2">⚠️ التحذير من التهاون أو الترك</h4>
                  <p className="text-xs opacity-80 leading-relaxed font-light">
                     حذّر الإسلام أشد التحذير من التهاون في الصلاة أو تأخيرها عن وقتها بغير عذر، فقال الله تعالى: <span className="text-amber-300 font-medium">«فَوَيْلٌ لِّلْمُصَلِّينَ * الَّذِينَ هُمْ عَن صَلَاتِهِمْ سَاهُونَ»</span>.
                    السهو هنا هو تأخيرها عن وقتها وإهمال خشوعها وأركانها.
                  </p>
                </div>

              </div>

            </div>
          )}

          {/* 2. KHUSHU GUIDE & CHALLENGE TAB */}
          {activeTab === "khushu" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Daily Khushu Challenge & Postures Guide */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                
                <div className={`p-6 rounded-3xl ${theme.cardBgClass} border transition-all duration-300`}>
                  {/* Sub Tab Switcher */}
                  <div className="flex flex-wrap gap-2 border-b border-white/5 pb-4 mb-4">
                    <button
                      onClick={() => setKhushuSubTab("challenge")}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        khushuSubTab === "challenge"
                          ? `${theme.primaryButton} scale-[1.02] shadow-md`
                          : "bg-black/30 border border-white/10 text-slate-300 hover:bg-black/50"
                      }`}
                    >
                      🛡️ تحدي الخشوع اليومي
                    </button>
                    <button
                      onClick={() => setKhushuSubTab("visualGuide")}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        khushuSubTab === "visualGuide"
                          ? `${theme.primaryButton} scale-[1.02] shadow-md`
                          : "bg-black/30 border border-white/10 text-slate-300 hover:bg-black/50"
                      }`}
                    >
                      📖 مرشد صفة الصلاة المصور
                    </button>
                    <button
                      onClick={() => setKhushuSubTab("assessment")}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        khushuSubTab === "assessment"
                          ? `${theme.primaryButton} scale-[1.02] shadow-md`
                          : "bg-black/30 border border-white/10 text-slate-300 hover:bg-black/50"
                      }`}
                    >
                      📝 مقياس الخشوع والخواطر
                    </button>
                  </div>

                  {/* SUBTAB 1: CHALLENGE CHECKLIST */}
                  {khushuSubTab === "challenge" && (
                    <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <p className="text-xs opacity-75">انقر لتفعيل العادات التي طبقتها في صلواتك اليوم:</p>
                        <button
                          onClick={handleResetHabits}
                          className="flex items-center gap-1 text-[10px] text-red-400 hover:text-red-300 bg-red-400/10 px-2 py-1 rounded-lg border border-red-500/10 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          إعادة تعيين
                        </button>
                      </div>

                      {/* Checklist items */}
                      <div className="flex flex-col gap-3">
                        {khushuHabits.map((habit) => (
                          <button
                            key={habit.id}
                            onClick={() => handleToggleHabit(habit.id)}
                            className={`flex items-center gap-3 w-full p-4 rounded-2xl border text-right transition-all duration-300 cursor-pointer ${
                              habit.checked
                                ? "bg-emerald-500/10 border-emerald-500/35 text-emerald-300 shadow-md"
                                : "bg-black/20 border-white/5 text-slate-300 hover:border-white/10"
                            }`}
                          >
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                              habit.checked ? "bg-emerald-500 border-emerald-400 text-slate-950" : "border-white/20"
                            }`}>
                              {habit.checked && <Check className="w-4 h-4 stroke-[3px]" />}
                            </div>
                            <span className="text-xs md:text-sm font-medium">{habit.text}</span>
                          </button>
                        ))}
                      </div>

                      {/* Habit progression bar */}
                      <div className="mt-4 bg-black/40 border border-white/5 p-4 rounded-2xl">
                        <div className="flex justify-between items-center text-xs mb-2">
                          <span className="font-semibold opacity-75">نسبة الإنجاز المحققة لتأصيل الخشوع:</span>
                          <span className={`font-bold ${theme.accentClass}`}>
                            {Math.round((khushuHabits.filter(h => h.checked).length / khushuHabits.length) * 100)}%
                          </span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                            style={{ width: `${(khushuHabits.filter(h => h.checked).length / khushuHabits.length) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUBTAB 2: VISUAL GUIDE STEP BY STEP */}
                  {khushuSubTab === "visualGuide" && (
                    <div className="flex flex-col gap-5 animate-in fade-in duration-200">
                      
                      {/* Step Indicator Bullets */}
                      <div className="flex justify-between items-center gap-1 overflow-x-auto pb-2">
                        {PRAYER_STEPS.map((s, idx) => (
                          <button
                            key={s.step}
                            onClick={() => setActiveStep(idx)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition cursor-pointer whitespace-nowrap ${
                              activeStep === idx
                                ? `${theme.primaryButton} shadow-md`
                                : "bg-black/35 border border-white/5 text-slate-400 hover:bg-black/50"
                            }`}
                          >
                            {s.step}. {s.title}
                          </button>
                        ))}
                      </div>

                      {/* Display Active Step Posture Card */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-black/35 border border-white/5 p-5 rounded-2xl items-center">
                        
                        {/* Visual SVG silhouette */}
                        <div className="md:col-span-4 flex flex-col items-center justify-center py-4 bg-slate-900/60 border border-white/5 rounded-2xl text-amber-500">
                          {PRAYER_STEPS[activeStep].svg}
                          <span className="text-[10px] font-black opacity-55 mt-2">الركن {PRAYER_STEPS[activeStep].step}</span>
                        </div>

                        {/* Text explanation lists */}
                        <div className="md:col-span-8 flex flex-col gap-4 text-right">
                          <div>
                            <h4 className="text-base font-extrabold text-slate-100 flex items-center gap-1.5">
                              <span className="text-amber-505">الركن {PRAYER_STEPS[activeStep].step}:</span>
                              {PRAYER_STEPS[activeStep].title}
                            </h4>
                          </div>

                          {/* Sunan list */}
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-emerald-400 font-extrabold">✨ السنن والآداب الصحيحة:</span>
                            <ul className="list-disc list-inside text-xs opacity-90 leading-relaxed font-light space-y-1 pr-3">
                              {PRAYER_STEPS[activeStep].sunnah.map((su: string, i: number) => (
                                <li key={i}>{su}</li>
                              ))}
                            </ul>
                          </div>

                          {/* Common Errors list */}
                          <div className="flex flex-col gap-1 border-t border-white/5 pt-2">
                            <span className="text-[10px] text-rose-400 font-extrabold">⚠️ أخطاء شائعة تجنبها:</span>
                            <ul className="list-disc list-inside text-xs opacity-90 leading-relaxed font-light space-y-1 pr-3">
                              {PRAYER_STEPS[activeStep].errors.map((er: string, i: number) => (
                                <li key={i} className="text-rose-200/90">{er}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                      </div>

                      {/* Pagination buttons */}
                      <div className="flex justify-between items-center border-t border-white/5 pt-3">
                        <button
                          onClick={() => {
                            if (activeStep > 0) setActiveStep(activeStep - 1);
                          }}
                          disabled={activeStep === 0}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer text-slate-100"
                        >
                          <ChevronRight className="w-4 h-4" />
                          الركن السابق
                        </button>
                        
                        <span className="text-[10px] opacity-50 font-bold">
                          {activeStep + 1} / {PRAYER_STEPS.length}
                        </span>

                        <button
                          onClick={() => {
                            if (activeStep + 1 < PRAYER_STEPS.length) setActiveStep(activeStep + 1);
                          }}
                          disabled={activeStep === PRAYER_STEPS.length - 1}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer text-slate-100"
                        >
                          الركن التالي
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  )}

                  {/* SUBTAB 3: ASSESSMENT & REFLECTION JOURNAL */}
                  {khushuSubTab === "assessment" && (
                    <div className="flex flex-col gap-8 animate-in fade-in duration-200">
                      
                      {/* QUIZ DIAGNOSTIC GAUGE */}
                      <div className="bg-black/35 border border-white/5 p-5 rounded-2xl flex flex-col gap-4">
                        <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                          <HelpCircle className={`w-4 h-4 ${theme.accentClass}`} />
                          <h4 className="text-sm font-bold text-slate-100">مقياس حضور القلب في الصلاة (تقييم تشخيصي)</h4>
                        </div>

                        {quizStep === 0 && (
                          <div className="flex flex-col items-center text-center py-6 gap-4">
                            <span className="text-3xl">📋</span>
                            <div className="max-w-md">
                              <h5 className="text-sm font-extrabold text-slate-200">قس مستوى خشوعك وتدبرك</h5>
                              <p className="text-xs opacity-70 leading-relaxed font-light mt-1.5">
                                أجب بصدق عن 5 أسئلة تشخيصية مبسطة حول عادات صلاتك اليومية للحصول على نتيجتك ونشاط إيماني مخصص لتحسين حضورك القلبي.
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                setQuizStep(1);
                                setQuizAnswers({});
                              }}
                              className={`px-6 py-2.5 rounded-xl font-bold text-xs cursor-pointer transition ${theme.primaryButton}`}
                            >
                              البدء بالتقييم الآن
                            </button>
                          </div>
                        )}

                        {quizStep >= 1 && quizStep <= 5 && (
                          <div className="flex flex-col gap-4 animate-in fade-in duration-150">
                            <div className="flex justify-between items-center text-[10px] opacity-60">
                              <span>السؤال {quizStep} من 5</span>
                              <div className="w-24 bg-white/10 h-1.5 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${(quizStep / 5) * 100}%` }} />
                              </div>
                            </div>
                            
                            <h5 className="text-sm font-bold text-slate-100 leading-snug">
                              {QUIZ_QUESTIONS[quizStep - 1].question}
                            </h5>

                            <div className="flex flex-col gap-2.5 mt-2">
                              {QUIZ_QUESTIONS[quizStep - 1].options.map((opt, i) => (
                                <button
                                  key={i}
                                  onClick={() => {
                                    setQuizAnswers(prev => ({
                                      ...prev,
                                      [quizStep]: opt.points
                                    }));
                                    if (soundEnabled) playSound(700, "sine", 0.05);
                                    setQuizStep(quizStep + 1);
                                  }}
                                  className="w-full text-right p-3 rounded-xl border border-white/5 bg-black/20 hover:bg-black/40 hover:border-amber-505/30 text-xs font-semibold text-slate-200 transition cursor-pointer"
                                >
                                  {opt.text}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {quizStep === 6 && (() => {
                          const totalScore = Object.values(quizAnswers).reduce((a, b) => a + b, 0);
                          let statusName = "";
                          let recommendation = "";
                          let colorClass = "";

                          if (totalScore <= 8) {
                            statusName = "مرتبة مجاهدة المشتتات 🛡️";
                            colorClass = "text-rose-400";
                            recommendation = "لديك رغبة طيبة، ولكن صلاتك تحتاج لمزيد من الطمأنينة. نصيحتنا لك: أطل السجود لمدة دقيقة إضافية وحاول عدم التسرع في الحركات، وحدد عينيك في موضع السجود البصري.";
                          } else if (totalScore <= 12) {
                            statusName = "مرتبة الخشوع المتوسط والسكينة 🕊️";
                            colorClass = "text-amber-400";
                            recommendation = "أنت تبذل جهداً رائعاً وتستحضر قلبك في معظم الأوقات. نصيحتنا للارتقاء: احرص على ترديد الأذن مع المؤذن وصلاة السنن الرواتب لتهيئة عقلك وجسدك تماماً قبل تكبيرة الإحرام.";
                          } else {
                            statusName = "مرتبة حضور القلب والإحسان 👑";
                            colorClass = "text-emerald-400";
                            recommendation = "ما شاء الله تبارك الله! صلاتك مفعمة بالطمأنينة والإقبال. نصيحتنا للاستمرار: حافظ على أذكار ما بعد الصلاة ببطء، وتذكر دائماً أن تدعو بالثبات والقبول الدائم.";
                          }

                          return (
                            <div className="flex flex-col items-center text-center py-4 gap-4 animate-in zoom-in-95 duration-200">
                              <div className="relative w-24 h-24 rounded-full border-4 border-amber-550/20 flex items-center justify-center bg-black/40">
                                <div className="text-center">
                                  <span className="text-3xl font-black block tracking-tighter">{totalScore}</span>
                                  <span className="text-[9px] opacity-55 block font-bold">من 15 درجة</span>
                                </div>
                              </div>

                              <div className="max-w-md">
                                <span className={`text-sm font-black block ${colorClass}`}>{statusName}</span>
                                <p className="text-xs opacity-85 leading-relaxed font-light mt-2 px-2">
                                  {recommendation}
                                </p>
                              </div>

                              <button
                                onClick={() => setQuizStep(0)}
                                className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition cursor-pointer text-slate-100"
                              >
                                إعادة التقييم
                              </button>
                            </div>
                          );
                        })()}

                      </div>

                      {/* REFLECTION JOURNAL TIMELINE */}
                      <div className="bg-black/35 border border-white/5 p-5 rounded-2xl flex flex-col gap-5">
                        
                        <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                          <Bookmark className={`w-4 h-4 ${theme.accentClass}`} />
                          <h4 className="text-sm font-bold text-slate-100">خواطر وتأملات الخشوع الشخصية</h4>
                        </div>

                        {/* Journal Form */}
                        <form onSubmit={handleAddJournal} className="flex flex-col gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] opacity-70 font-bold">دون تأملاتك بعد الصلاة (ما هي المعاني التي استشعرتها أو الصعوبات التي واجهتك؟):</label>
                            <textarea
                              required
                              placeholder="مثال: في صلاة المغرب اليوم، تدبرت معنى قوله تعالى 'الحمد لله رب العالمين' وشعرت بامتنان عظيم وعبرة في عيني..."
                              rows={3}
                              value={journalText}
                              onChange={(e) => setJournalText(e.target.value)}
                              className={`px-3 py-2 rounded-xl text-xs outline-none transition-all resize-none ${theme.inputBg}`}
                            />
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] opacity-60 font-bold">الوسم:</span>
                              <div className="flex gap-1.5">
                                {[
                                  { id: "focus", label: "صلاة خاشعة" },
                                  { id: "distraction", label: "تشتت ذهني" },
                                  { id: "benefit", label: "فائدة وتدبر" },
                                  { id: "dua", label: "دعاء قلبي" }
                                ].map((t) => (
                                  <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => setJournalTag(t.id)}
                                    className={`px-2.5 py-1 rounded-lg border text-[9px] font-bold transition cursor-pointer ${
                                      journalTag === t.id
                                        ? "bg-amber-500 text-black border-transparent font-black"
                                        : `bg-black/20 text-slate-400 border-white/5 hover:border-white/15`
                                    }`}
                                  >
                                    {t.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <button
                              type="submit"
                              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition cursor-pointer ${theme.primaryButton}`}
                            >
                              <Send className="w-3.5 h-3.5" />
                              حفظ الخاطرة
                            </button>
                          </div>
                        </form>

                        {/* Reflections List */}
                        <div className="border-t border-white/5 pt-4 flex flex-col gap-4">
                          <span className="text-[10px] opacity-60 font-bold block mb-1">الخواطر المسجلة سابقاً:</span>
                          
                          {journalLogs.length === 0 ? (
                            <div className="text-center py-6 opacity-50 text-xs">
                              لا توجد خواطر مسجلة بعد. ابدأ بكتابة أول خاطرة اليوم لتأسيس مفكرتك الروحية الخاصة.
                            </div>
                          ) : (
                            <div className="flex flex-col gap-3.5 max-h-[350px] overflow-y-auto pr-1">
                              {journalLogs.map((log) => {
                                const tagObj = [
                                  { id: "focus", label: "صلاة خاشعة", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
                                  { id: "distraction", label: "تشتت ذهني", color: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
                                  { id: "benefit", label: "فائدة وتدبر", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
                                  { id: "dua", label: "دعاء قلبي", color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" }
                                ].find(t => t.id === log.tag) || { label: "منوع", color: "bg-white/5 text-slate-300 border-white/10" };

                                return (
                                  <div key={log.id} className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex items-start justify-between gap-3.5">
                                    <div className="flex flex-col gap-2 text-right">
                                      <div className="flex items-center gap-2">
                                        <span className={`text-[8px] font-black px-2 py-0.5 rounded border uppercase ${tagObj.color}`}>
                                          {tagObj.label}
                                        </span>
                                        <span className="text-[8px] opacity-45">{log.date}</span>
                                      </div>
                                      <p className="text-xs leading-relaxed opacity-95 text-slate-100 whitespace-pre-line select-text font-light font-sans">
                                        {log.text}
                                      </p>
                                    </div>

                                    <button
                                      onClick={() => handleDeleteJournal(log.id)}
                                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/15 text-red-400 transition cursor-pointer self-start shrink-0"
                                      title="حذف الخاطرة"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                      </div>

                    </div>
                  )}

                </div>

              </div>

              {/* Sidebar Guide */}
              <div className="flex flex-col gap-6">
                
                <div className={`p-6 rounded-3xl ${theme.cardBgClass} border transition-all duration-300 flex flex-col justify-between shadow-xl`}>
                  <div>
                    <h4 className={`text-base font-bold mb-3 ${theme.accentClass}`}>❓ ما هو الخشوع في الصلاة؟</h4>
                    <p className="text-xs opacity-75 leading-relaxed font-light">
                      الخشوع هو حضور القلب وسكون الجوارح وتواضعها أمام هيبة الله وعظمته أثناء الصلاة. الخشوع روح الصلاة، والصلاة بلا خشوع كالميت بلا روح.
                      هو الفلاح الحقيقي الذي أثنى الله على أهله فقال: <span className="text-amber-500 font-semibold">«قَدْ أَفْلَحَ الْمُؤْمِنُونَ * الَّذِينَ هُمْ فِي صَلَاتِهِمْ خَاشِعُونَ»</span>.
                    </p>
                  </div>
                </div>

                <div className={`p-6 rounded-3xl bg-black/50 border border-white/5 shadow-xl`}>
                  <h4 className="text-xs font-bold text-emerald-400 mb-2">💡 نصيحة نبوية للخشوع</h4>
                  <p className="text-xs opacity-80 leading-relaxed font-light">
                    عن أبي أيوب قال: جاء رجل إلى النبي ﷺ فقال: عظني وأوجز، فقال ﷺ: <span className="text-amber-500 font-semibold">«إذا قمتَ في صلاتِكَ فصَلِّ صلاةَ مُودِّعٍ»</span>.
                    تخيل دائماً أن هذه الصلاة هي آخر عمل تقوم به في الدنيا قبل الرحيل، كيف ستصليها?
                  </p>
                </div>

              </div>

            </div>
          )}

          {/* 3. ADHKAR & TASBIH TAB */}
          {activeTab === "adhkar" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main clicker card */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                <div className={`p-6 rounded-3xl ${theme.cardBgClass} border transition-all duration-300 flex flex-col items-center justify-between min-h-[480px]`}>
                  {/* Card Header & Category Selector */}
                  <div className="w-full flex flex-col gap-4 border-b border-white/5 pb-4">
                    <div className="flex items-center justify-between text-right">
                      <h3 className="text-sm font-bold flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-emerald-400" />
                        <span>سلسلة الأذكار والمسبحة اليومية</span>
                      </h3>
                      <button
                        onClick={() => {
                          setSoundEnabled(!soundEnabled);
                          triggerToast(soundEnabled ? "تم كتم الصوت" : "تم تفعيل الصوت");
                        }}
                        className={`p-1.5 rounded-lg border text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                          soundEnabled
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                            : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                        }`}
                      >
                        {soundEnabled ? "🔊 الصوت مفعل" : "🔇 الصوت مكتوم"}
                      </button>
                    </div>

                    {/* Sub-categories selector */}
                    <div className="grid grid-cols-4 gap-1.5">
                      {Object.entries(ADHKAR_CATEGORIES).map(([catId, cat]) => (
                        <button
                          key={catId}
                          onClick={() => {
                            setAdhkarCategory(catId as any);
                            setActiveDhikrIdx(0);
                            setDhikrCount(0);
                            triggerToast(`تم اختيار: ${cat.label}`);
                          }}
                          className={`py-2 rounded-xl text-[10px] font-bold text-center transition cursor-pointer border ${
                            adhkarCategory === catId
                              ? `${theme.primaryButton} scale-[1.01] shadow border-transparent`
                              : "bg-black/30 border-white/5 text-slate-300 hover:bg-black/50"
                          }`}
                        >
                          <span className="block text-xs">{cat.icon}</span>
                          <span className="block text-[8px] sm:text-[9px] mt-0.5">{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Active Dhikr content */}
                  {activeDhikrIdx < activeAdhkarList.length ? (
                    <div className="flex flex-col items-center justify-center text-center my-6 gap-6 w-full max-w-md">
                      <div className="flex flex-col gap-2">
                        <span className="text-[9px] opacity-50 uppercase tracking-widest block font-bold">
                          الذكر {activeDhikrIdx + 1} من {activeAdhkarList.length}
                        </span>
                        <h4 className="text-base md:text-lg font-black text-slate-100 leading-relaxed px-4 min-h-[64px] flex items-center justify-center font-serif">
                          {activeAdhkarList[activeDhikrIdx].text}
                        </h4>
                        <p className="text-xs opacity-75 leading-relaxed font-light min-h-[32px]">
                          {activeAdhkarList[activeDhikrIdx].description}
                        </p>
                      </div>

                      {/* Circular clicker button */}
                      <button
                        onClick={() => {
                          const target = activeAdhkarList[activeDhikrIdx].count;
                          const nextCount = dhikrCount + 1;
                          if (nextCount >= target) {
                            if (soundEnabled) playSound(523, "sine", 0.35); // warm bell success sound
                            if (activeDhikrIdx + 1 < activeAdhkarList.length) {
                              setDhikrCount(0);
                              setActiveDhikrIdx(activeDhikrIdx + 1);
                              triggerToast(`تم إكمال الذكر: ${activeAdhkarList[activeDhikrIdx].text}`);
                            } else {
                              setDhikrCount(0);
                              setActiveDhikrIdx(activeAdhkarList.length); // mark complete
                              
                              if (adhkarCategory === "post_prayer") {
                                const newCount = completedAdhkarCount + 1;
                                setCompletedAdhkarCount(newCount);
                                localStorage.setItem("prayer_completed_adhkar_count", String(newCount));
                              } else if (adhkarCategory === "morning") {
                                const newCount = completedMorningAdhkar + 1;
                                setCompletedMorningAdhkar(newCount);
                                localStorage.setItem("prayer_morning_adhkar_count", String(newCount));
                              } else if (adhkarCategory === "evening") {
                                const newCount = completedEveningAdhkar + 1;
                                setCompletedEveningAdhkar(newCount);
                                localStorage.setItem("prayer_evening_adhkar_count", String(newCount));
                              } else if (adhkarCategory === "sleep") {
                                const newCount = completedSleepAdhkar + 1;
                                setCompletedSleepAdhkar(newCount);
                                localStorage.setItem("prayer_sleep_adhkar_count", String(newCount));
                              }
                              
                              triggerToast(`تقبل الله طاعتكم! لقد أكملت ${ADHKAR_CATEGORIES[adhkarCategory].label} بنجاح وتم تحصيل الوسام الخاص.`);
                            }
                          } else {
                            if (soundEnabled) playSound(880, "sine", 0.05); // standard click
                            setDhikrCount(nextCount);
                          }
                        }}
                        className={`relative w-40 h-40 rounded-full border-4 ${theme.cardBorderClass} bg-black/40 hover:bg-black/60 flex items-center justify-center cursor-pointer transition-all duration-300 active:scale-95 group focus:outline-none`}
                        style={{ boxShadow: "0 0 20px rgba(0, 0, 0, 0.4)" }}
                      >
                        {/* Circular progress SVG */}
                        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                          <circle
                            cx="80"
                            cy="80"
                            r="66"
                            stroke="rgba(255,255,255,0.03)"
                            strokeWidth="5"
                            fill="transparent"
                          />
                          <circle
                            cx="80"
                            cy="80"
                            r="66"
                            stroke={activeTheme === 'emerald' ? '#c5a880' : 
                                    activeTheme === 'kaaba' ? '#d4af37' : 
                                    activeTheme === 'indigo' ? '#818cf8' : 
                                    activeTheme === 'sunrise' ? '#f59e0b' : '#2dd4bf'}
                            strokeWidth="6"
                            fill="transparent"
                            strokeDasharray={2 * Math.PI * 66}
                            strokeDashoffset={2 * Math.PI * 66 * (1 - dhikrCount / activeAdhkarList[activeDhikrIdx].count)}
                            className="transition-all duration-150"
                            strokeLinecap="round"
                          />
                        </svg>
                        
                        <div className="z-10 text-center">
                          <span className="text-3xl font-black block tracking-tighter font-sans">
                            {dhikrCount}
                          </span>
                          <span className="text-[10px] opacity-55 block mt-1 font-bold">
                            الهدف: {activeAdhkarList[activeDhikrIdx].count}
                          </span>
                        </div>
                      </button>

                      {/* Controls toolbar */}
                      <div className="flex gap-3 w-full">
                        <button
                          onClick={() => {
                            if (activeDhikrIdx > 0) {
                              setActiveDhikrIdx(activeDhikrIdx - 1);
                              setDhikrCount(0);
                            }
                          }}
                          disabled={activeDhikrIdx === 0}
                          className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer text-center text-slate-100"
                        >
                          الذكر السابق
                        </button>
                        <button
                          onClick={() => {
                            setDhikrCount(0);
                            triggerToast("تم تصفير العداد");
                          }}
                          className="py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold hover:bg-white/10 transition cursor-pointer text-center text-slate-100"
                        >
                          تصفير
                        </button>
                        <button
                          onClick={() => {
                            if (activeDhikrIdx + 1 < activeAdhkarList.length) {
                              setActiveDhikrIdx(activeDhikrIdx + 1);
                              setDhikrCount(0);
                            } else {
                              setActiveDhikrIdx(activeAdhkarList.length);
                            }
                          }}
                          className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold hover:bg-white/10 transition cursor-pointer text-center text-slate-100"
                        >
                          تخطي
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center my-12 gap-5">
                      <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-3xl">
                        ✨
                      </div>
                      <div>
                        <h4 className="text-base font-black text-slate-100 mb-1">تقبل الله طاعاتكم!</h4>
                        <p className="text-xs opacity-75 max-w-sm font-light">
                          لقد أكملت جميع {ADHKAR_CATEGORIES[adhkarCategory].label} بنجاح. نسأل الله أن يكتب لك الأجر ويملأ قلبك بالطمأنينة والهدوء.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setActiveDhikrIdx(0);
                          setDhikrCount(0);
                        }}
                        className={`px-6 py-2.5 rounded-xl font-bold text-xs cursor-pointer transition ${theme.primaryButton}`}
                      >
                        البدء من جديد
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar Checklist */}
              <div className="flex flex-col gap-6">
                <div className={`p-6 rounded-3xl ${theme.cardBgClass} border transition-all duration-300 flex flex-col gap-4 shadow-xl`}>
                  <h4 className="text-sm font-bold border-b border-white/5 pb-2">قائمة الأذكار الجارية</h4>
                  <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-1">
                    {activeAdhkarList.map((d, idx) => (
                      <button
                        key={d.id}
                        onClick={() => {
                          setActiveDhikrIdx(idx);
                          setDhikrCount(0);
                        }}
                        className={`flex items-start gap-2.5 text-right p-2.5 rounded-xl border transition-all ${
                          idx === activeDhikrIdx
                            ? "bg-white/5 border-amber-505/30 text-slate-100 font-semibold"
                            : idx < activeDhikrIdx
                            ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-300 opacity-60"
                            : "bg-black/10 border-transparent text-slate-400 hover:bg-black/20"
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border text-[9px] mt-0.5 ${
                          idx < activeDhikrIdx ? "bg-emerald-500 border-emerald-400 text-black font-black" : "border-white/10"
                        }`}>
                          {idx < activeDhikrIdx ? "✓" : idx + 1}
                        </div>
                        <div className="flex flex-col gap-0.5 font-sans">
                          <span className="text-xs leading-snug line-clamp-1">{d.text}</span>
                          <span className="text-[9px] opacity-60">الهدف: {d.count} {d.count > 10 ? 'مرة' : 'مرات'}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. PRAYER DUAS TAB */}
          {activeTab === "duas" && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              
              {/* Category Pill Filters */}
              <div className="lg:col-span-1 flex flex-col gap-2">
                <span className="text-[10px] opacity-50 uppercase tracking-widest font-black block mb-1 font-sans">تصنيف الأدعية:</span>
                {DUAS_DATABASE.map((cat) => (
                  <button
                    key={cat.category}
                    onClick={() => setDuaCategoryFilter(cat.category)}
                    className={`px-4 py-3 rounded-2xl text-xs font-bold text-right transition-all border cursor-pointer ${
                      duaCategoryFilter === cat.category
                        ? `${theme.primaryButton} shadow-md scale-[1.02]`
                        : "bg-black/30 border-white/5 text-slate-300 hover:bg-black/50 hover:border-white/10"
                    }`}
                  >
                    {cat.category === "الاستفتاح" ? "🌅 دعاء الاستفتاح" :
                     cat.category === "الركوع" ? "⛅ أدعية الركوع" :
                     cat.category === "السجود" ? "🕋 أدعية السجود" :
                     cat.category === "بين السجدتين" ? "🧎 بين السجدتين" : "🤲 قبل السلام"}
                  </button>
                ))}
              </div>

              {/* Duas items list */}
              <div className="lg:col-span-3 flex flex-col gap-4">
                {DUAS_DATABASE.find(c => c.category === duaCategoryFilter)?.items.map((dua) => {
                  const isExpanded = expandedDuas[dua.id] || false;
                  const isCopied = copiedDuaId === dua.id;
                  return (
                    <div
                      key={dua.id}
                      className={`p-5 rounded-3xl ${theme.cardBgClass} border transition-all duration-305 flex flex-col gap-4`}
                    >
                      {/* Title & Actions */}
                      <div className="flex justify-between items-start gap-4 border-b border-white/5 pb-2">
                        <h4 className="text-sm font-bold text-slate-100">{dua.title}</h4>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCopyDua(dua.text, dua.id)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-350 hover:text-white transition cursor-pointer"
                            title="نسخ النص"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => toggleDuaExpand(dua.id)}
                            className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold transition cursor-pointer ${
                              isExpanded 
                                ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                                : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                            }`}
                          >
                            {isExpanded ? "إخفاء المعنى" : "فهم المعنى لتدبر الخشوع"}
                          </button>
                        </div>
                      </div>

                      {/* Large Arabic text */}
                      <p className="text-lg md:text-xl font-bold leading-loose text-center text-slate-100 px-4 select-all font-serif py-2">
                        {dua.text}
                      </p>

                      {/* Details */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] opacity-60">
                        <span>المصدر: {dua.source}</span>
                      </div>

                      {/* Expanded insights */}
                      {isExpanded && (
                        <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl flex flex-col gap-2.5 animate-in fade-in duration-200">
                          <div className="flex flex-col gap-1 text-right">
                            <span className="text-[10px] text-amber-400 font-bold">📖 المعنى اللفظي والترجمة:</span>
                            <p className="text-xs opacity-90 leading-relaxed font-light">{dua.translation}</p>
                          </div>
                          <div className="flex flex-col gap-1 border-t border-white/5 pt-2 text-right">
                            <span className="text-[10px] text-emerald-400 font-bold">✨ أثر الدعاء في تحقيق الخشوع:</span>
                            <p className="text-xs opacity-90 leading-relaxed font-light">{dua.benefit}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* 5. VIDEOS LIBRARY TAB */}
          {activeTab === "videos" && (
            <div className="flex flex-col gap-8">
              
              {/* Category Filter Toolbar & Add Video Button */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
                  {["الكل", "الخشوع والتلذذ", "علاج السرحان", "تعليم الصلاة", "تنببهات وأخطاء"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setVideoCategoryFilter(cat)}
                      className={`px-4 py-2 rounded-2xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                        videoCategoryFilter === cat
                          ? `${theme.primaryButton} font-bold scale-[1.03] shadow-md`
                          : "bg-black/40 border border-white/5 text-slate-300 hover:border-white/10"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className={`flex items-center gap-1.5 ${theme.primaryButton} text-xs font-bold px-4 py-2.5 rounded-2xl transition cursor-pointer shadow-lg`}
                >
                  <Plus className="w-4 h-4 stroke-[3px]" />
                  إضافة فيديو جديد
                </button>
              </div>

              {/* Videos Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVideos.map((vid) => (
                  <div
                    key={vid.id}
                    onClick={() => handleVideoClick(vid)}
                    className={`rounded-3xl ${theme.cardBgClass} border p-5 flex flex-col justify-between gap-4 cursor-pointer group transition-all duration-300 hover:-translate-y-1 shadow-lg`}
                  >
                    <div className="flex flex-col gap-3 text-right">
                      {/* Video Thumbnail Box Mock */}
                      <div className="relative aspect-video rounded-2xl bg-black/60 border border-white/5 overflow-hidden flex items-center justify-center group-hover:border-white/10 transition">
                        <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/40 to-transparent z-10" />
                        
                        <div className={`absolute inset-0 opacity-20 bg-gradient-to-tr from-amber-500/30 to-violet-500/30`} />

                        {/* Play button overlay */}
                        <div className="z-20 h-12 w-12 rounded-full bg-white/10 group-hover:bg-white/20 text-white flex items-center justify-center backdrop-blur transition-all duration-300 group-hover:scale-110 border border-white/20">
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </div>

                        {/* Duration label */}
                        <span className="absolute bottom-2.5 left-2.5 z-20 text-[9px] font-bold bg-black/70 px-2 py-0.5 rounded border border-white/10 text-white flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {vid.duration}
                        </span>

                        {/* Category tag */}
                        <span className="absolute top-2.5 right-2.5 z-20 text-[8px] font-bold bg-white/10 backdrop-blur px-2 py-0.5 rounded border border-white/15 text-white">
                          {vid.category}
                        </span>
                      </div>

                      {/* Video Title and Lecturer */}
                      <div>
                        <h4 className="font-bold text-sm text-slate-100 leading-snug group-hover:text-amber-400 transition-colors duration-300 line-clamp-2">
                          {vid.title}
                        </h4>
                        <span className={`text-[11px] font-medium block mt-1 ${theme.accentClass}`}>
                          بصوت: {vid.lecturer}
                        </span>
                      </div>

                      {/* Video Description */}
                      <p className="text-xs opacity-70 leading-relaxed font-light line-clamp-2">
                        {vid.description}
                      </p>
                    </div>

                    {/* Delete button */}
                    <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-1">
                      <span className="text-[10px] opacity-55">منصة وقفة التعليمية</span>
                      {!vid.isDefault && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteVideo(vid.id, e);
                          }}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/15 text-red-400 transition cursor-pointer"
                          title="حذف هذا الفيديو"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* 6. TRACKER & LOGGER TAB */}
          {activeTab === "tracker" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Daily logger panel */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                
                <div className={`p-6 rounded-3xl ${theme.cardBgClass} border transition-all duration-300`}>
                  
                  {/* Faraid / Sunan / Badges SubTabs Selector */}
                  <div className="flex flex-wrap gap-2 border-b border-white/5 pb-4 mb-4">
                    <button
                      onClick={() => setTrackerSubTab("faraid")}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        trackerSubTab === "faraid"
                          ? `${theme.primaryButton} scale-[1.02] shadow-md`
                          : "bg-black/30 border border-white/10 text-slate-300 hover:bg-black/50"
                      }`}
                    >
                      🕌 الصلوات المفروضة
                    </button>
                    <button
                      onClick={() => setTrackerSubTab("sunan")}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        trackerSubTab === "sunan"
                          ? `${theme.primaryButton} scale-[1.02] shadow-md`
                          : "bg-black/30 border border-white/10 text-slate-300 hover:bg-black/50"
                      }`}
                    >
                      ✨ السنن والنوافل
                    </button>
                    <button
                      onClick={() => setTrackerSubTab("badges")}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        trackerSubTab === "badges"
                          ? `${theme.primaryButton} scale-[1.02] shadow-md`
                          : "bg-black/30 border border-white/10 text-slate-300 hover:bg-black/50"
                      }`}
                    >
                      🏆 الأوسمة الإيمانية
                    </button>
                  </div>

                  {/* FARAID PANEL */}
                  {trackerSubTab === "faraid" && (
                    <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                      {[
                        { name: "Fajr", label: "صلاة الفجر" },
                        { name: "Dhuhr", label: "صلاة الظهر" },
                        { name: "Asr", label: "صلاة العصر" },
                        { name: "Maghrib", label: "صلاة المغرب" },
                        { name: "Isha", label: "صلاة العشاء" }
                      ].map((p) => {
                        const logged = prayersLogged[p.name] || { done: false, focus: 5 };
                        return (
                          <div
                            key={p.name}
                            className={`p-4 rounded-2xl border transition-all duration-300 ${
                              logged.done 
                                ? "bg-black/35 border-white/10 shadow-inner" 
                                : "bg-black/15 border-white/5 opacity-55 hover:opacity-85"
                            }`}
                          >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => handleTogglePrayerLog(p.name)}
                                  className={`w-7 h-7 rounded-xl border flex items-center justify-center transition cursor-pointer ${
                                    logged.done 
                                      ? "bg-emerald-500 border-emerald-400 text-slate-950" 
                                      : "border-white/20 hover:border-white/40"
                                  }`}
                                >
                                  {logged.done && <Check className="w-4 h-4 stroke-[3px]" />}
                                </button>
                                <span className="text-sm font-bold text-slate-100">{p.label}</span>
                              </div>

                              {/* Slider control for Focus level */}
                              {logged.done && (
                                <div className="flex-1 max-w-md flex items-center gap-4">
                                  <span className="text-[10px] opacity-70 whitespace-nowrap">مؤشر الخشوع:</span>
                                  <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={logged.focus}
                                    onChange={(e) => handleFocusChange(p.name, parseInt(e.target.value))}
                                    className="w-full accent-amber-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                  />
                                  <span className={`text-sm font-extrabold w-6 text-center ${
                                    logged.focus < 4 ? "text-rose-400" :
                                    logged.focus <= 7 ? "text-amber-405" : "text-emerald-400"
                                  }`}>
                                    {logged.focus}
                                  </span>
                                </div>
                              )}

                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* SUNAN PANEL */}
                  {trackerSubTab === "sunan" && (
                    <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                      {SUNAN_ITEMS.map((item) => {
                        const isDone = sunanLogged[item.key] || false;
                        return (
                          <div
                            key={item.key}
                            className={`p-4 rounded-2xl border transition-all duration-300 ${
                              isDone 
                                ? "bg-black/35 border-white/10 shadow-inner" 
                                : "bg-black/15 border-white/5 opacity-55 hover:opacity-85"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-start gap-3 text-right">
                                <button
                                  onClick={() => handleToggleSunanLog(item.key)}
                                  className={`w-7 h-7 rounded-xl border flex items-center justify-center shrink-0 transition cursor-pointer mt-0.5 ${
                                    isDone 
                                      ? "bg-emerald-500 border-emerald-400 text-slate-950" 
                                      : "border-white/20 hover:border-white/40"
                                  }`}
                                >
                                  {isDone && <Check className="w-4 h-4 stroke-[3px]" />}
                                </button>
                                <div className="flex flex-col">
                                  <span className="text-sm font-bold text-slate-100">{item.label}</span>
                                  <span className="text-[11px] opacity-65 font-light">{item.desc}</span>
                                </div>
                              </div>
                              <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/15 font-mono">
                                {item.rakaat} ركعات
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* BADGES / ACHIEVEMENTS PANEL */}
                  {trackerSubTab === "badges" && (
                    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
                      
                      {/* Stats Header */}
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-black/40 border border-white/5 p-4 rounded-2xl text-right">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-bold text-slate-100">أوسمتك وشاراتك الروحية المفتوحة</span>
                          <span className="text-[10px] opacity-60">تفاعل مع أقسام الصفحة المختلفة لفتح المزيد من الأوسمة</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-black ${theme.accentClass}`}>
                            {badges.filter(b => b.unlocked).length} من {badges.length} أوسمة
                          </span>
                          <div className="w-24 bg-white/10 h-2 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-500" 
                              style={{ width: `${(badges.filter(b => b.unlocked).length / badges.length) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Badges Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {badges.map((b) => (
                          <div
                            key={b.id}
                            className={`p-4 rounded-2xl border flex flex-col items-center text-center gap-3 transition-all duration-300 ${
                              b.unlocked
                                ? `bg-gradient-to-b from-black/20 to-black/45 border-amber-500/20 shadow-[0_4px_12px_rgba(245,158,11,0.06)]`
                                : "bg-black/10 border-white/5 opacity-40"
                            }`}
                          >
                            {/* Icon circular frame */}
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl relative ${
                              b.unlocked 
                                ? `bg-gradient-to-tr ${b.color} text-slate-950 font-black shadow-md shadow-black/30` 
                                : "bg-white/5 border border-white/10 text-slate-500"
                            }`}>
                              {b.unlocked ? b.icon : "🔒"}
                              {b.unlocked && (
                                <span className="absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 bg-emerald-500 border border-black/40 rounded-full flex items-center justify-center text-[7px] font-black text-slate-950">
                                  ✓
                                </span>
                              )}
                            </div>

                            <div className="flex flex-col gap-1">
                              <span className={`text-xs font-bold ${b.unlocked ? "text-slate-100" : "text-slate-400"}`}>
                                {b.title}
                              </span>
                              <p className="text-[9px] opacity-75 leading-relaxed font-light px-1 line-clamp-2">
                                {b.desc}
                              </p>
                            </div>

                            {/* Status badge */}
                            <span className={`text-[8px] font-black px-2 py-0.5 rounded border uppercase ${
                              b.unlocked 
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                                : "bg-white/5 text-slate-400 border-white/10"
                            }`}>
                              {b.unlocked ? "تم الفتح" : "مغلق"}
                            </span>
                          </div>
                        ))}
                      </div>

                    </div>
                  )}

                </div>

                {/* 7-DAY HISTORY SVG PROGRESS CHART */}
                <div className={`p-6 rounded-3xl ${theme.cardBgClass} border transition-all duration-300 flex flex-col gap-4`}>
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <Activity className="w-4 h-4 text-amber-500" />
                    <span>مخطط التزام وخشوع صلاة الأسبوع الماضي (آخر 7 أيام)</span>
                  </h3>
                  
                  <div className="bg-black/40 border border-white/5 rounded-2xl p-4 overflow-hidden">
                    {/* SVG Chart */}
                    <svg viewBox="0 0 500 160" className="w-full h-auto text-slate-300">
                      <defs>
                        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={activeTheme === 'emerald' ? '#c5a880' : 
                                                      activeTheme === 'kaaba' ? '#d4af37' : 
                                                      activeTheme === 'indigo' ? '#818cf8' : 
                                                      activeTheme === 'sunrise' ? '#f59e0b' : '#2dd4bf'} />
                          <stop offset="100%" stopColor="transparent" />
                        </linearGradient>
                        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#f59e0b" />
                          <stop offset="100%" stopColor="#d97706" />
                        </linearGradient>
                      </defs>

                      {/* Grid Lines */}
                      <line x1="20" y1="30" x2="480" y2="30" stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />
                      <line x1="20" y1="70" x2="480" y2="70" stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />
                      <line x1="20" y1="110" x2="480" y2="110" stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />

                      {/* Render Bars */}
                      {daysData.map((d, i) => {
                        const x = 30 + i * 65;
                        const barHeight = (d.doneCount / 5) * 80; // max 80px
                        return (
                          <g key={d.dateStr}>
                            <rect
                              x={x}
                              y={30}
                              width="30"
                              height="80"
                              rx="5"
                              fill="rgba(255,255,255,0.02)"
                            />
                            {barHeight > 0 && (
                              <rect
                                x={x}
                                y={110 - barHeight}
                                width="30"
                                height={barHeight}
                                rx="5"
                                fill="url(#barGrad)"
                                className="transition-all duration-500"
                              />
                            )}
                            <text x={x + 15} y={128} fill="currentColor" opacity="0.6" fontSize="9" textAnchor="middle" className="font-semibold font-sans">
                              {d.dayName}
                            </text>
                            <text x={x + 15} y={140} fill="currentColor" opacity="0.35" fontSize="8" textAnchor="middle" className="font-black font-mono">
                              {d.doneCount}/5
                            </text>
                          </g>
                        );
                      })}

                      {/* Render Line Graph overlay for Focus */}
                      {pathD && (
                        <path
                          d={pathD}
                          fill="none"
                          stroke="url(#lineGrad)"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="drop-shadow-[0_2px_4px_rgba(245,158,11,0.3)]"
                        />
                      )}
                      {focusPoints.map((p, i) => (
                        <g key={i}>
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r="4"
                            fill="#f59e0b"
                            stroke="#0b0c10"
                            strokeWidth="1.5"
                            className="cursor-pointer hover:scale-125 transition-transform"
                          />
                          {p.val > 0 && (
                            <text x={p.x} y={p.y - 7} fill="#f59e0b" fontSize="8" fontWeight="bold" textAnchor="middle" className="font-mono">
                              {p.val}★
                            </text>
                          )}
                        </g>
                      ))}
                    </svg>
                  </div>
                  
                  <div className="flex justify-between items-center text-[10px] opacity-60 px-2 font-sans">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block" />
                      الخط البرتقالي: مؤشر الخشوع (10★ ممتازة)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className={`w-2.5 h-2.5 rounded inline-block`} style={{ backgroundColor: theme.accentClass.includes('text-[') ? '#c5a880' : '#2dd4bf' }} />
                      الأعمدة: نسبة الصلوات المفروضة المؤداة
                    </span>
                  </div>
                </div>

                {/* DETAILED PAST-7-DAYS HISTORY LOG MANAGER */}
                <div className={`p-6 rounded-3xl ${theme.cardBgClass} border transition-all duration-300 flex flex-col gap-4 shadow-lg`}>
                  <h3 className="text-sm font-bold flex items-center gap-2 border-b border-white/5 pb-2 font-sans">
                    📋 سجل الأداء والتاريخ التفصيلي
                  </h3>
                  
                  {Object.keys(historyLogs).length === 0 ? (
                    <div className="text-center py-8 opacity-60 text-xs font-sans">
                      لا توجد سجلات سابقة مسجلة بعد. سيظهر تاريخ أداؤك هنا فور قيامك بتسجيل الصلوات.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3.5 max-h-[300px] overflow-y-auto pr-1">
                      {Object.entries(historyLogs)
                        .sort((a, b) => b[0].localeCompare(a[0])) // show newest first
                        .map(([dateStr, log]) => {
                          const dateObj = new Date(dateStr);
                          const dayName = dateObj.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'short' });
                          const donePrayers = Object.values(log.prayers).filter((p: any) => p.done);
                          const doneSunan = Object.values(log.sunan).filter(val => val).length;
                          const avgF = donePrayers.length > 0
                            ? Math.round(donePrayers.reduce((acc: number, p: any) => acc + p.focus, 0) / donePrayers.length)
                            : 0;

                          return (
                            <div key={dateStr} className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between gap-4 text-right">
                              <div className="flex flex-col gap-1 font-sans">
                                <span className="text-xs font-bold text-slate-100">{dayName}</span>
                                <div className="flex items-center gap-2 font-mono">
                                  <span className="text-[10px] opacity-60">الفرائض: {donePrayers.length}/5</span>
                                  <span className="text-[10px] opacity-60">•</span>
                                  <span className="text-[10px] text-emerald-400">السنن: {doneSunan}</span>
                                  <span className="text-[10px] opacity-60">•</span>
                                  <span className="text-[10px] text-amber-400">معدل الخشوع: {avgF}/10★</span>
                                </div>
                                
                                {/* Bullet dots preview */}
                                <div className="flex gap-1.5 mt-1.5">
                                  {["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"].map((name) => {
                                    const p = log.prayers[name] || { done: false, focus: 0 };
                                    return (
                                      <div
                                        key={name}
                                        title={`${name}: ${p.done ? `تم بـ ${p.focus}★` : "لم تؤدَ"}`}
                                        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-black ${
                                          p.done 
                                            ? "bg-emerald-500 text-slate-950" 
                                            : "bg-white/10 text-transparent"
                                        }`}
                                      >
                                        {p.done ? "✓" : ""}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              <button
                                onClick={() => handleDeleteHistoryDay(dateStr)}
                                className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/15 text-red-400 transition cursor-pointer"
                                title="إزالة سجل هذا اليوم"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>

              </div>

              {/* Evaluation Sidebar */}
              <div className="flex flex-col gap-6 font-sans">
                
                <div className={`p-6 rounded-3xl ${theme.cardBgClass} border transition-all duration-300 shadow-xl`}>
                  <h4 className={`text-base font-bold border-b border-white/5 pb-3 mb-4 flex items-center gap-2 ${theme.accentClass}`}>
                    📊 تقييم الطمأنينة العام
                  </h4>
                  
                  <div className="flex flex-col items-center justify-center py-4">
                    <div className="relative h-28 w-28 rounded-full border-4 border-white/5 flex items-center justify-center bg-black/45 shadow-inner">
                      <div className="text-center font-mono">
                        <span className={`text-4xl font-black block ${evalResult.color}`}>{averageFocus}</span>
                        <span className="text-[9px] opacity-55 block uppercase tracking-wider font-bold">معدل الخشوع</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <span className={`text-sm font-bold block mb-1 ${evalResult.color}`}>{evalResult.title}</span>
                    <p className="text-xs opacity-75 leading-relaxed font-light">
                      {evalResult.desc}
                    </p>
                  </div>
                </div>

                <div className={`p-5 rounded-2xl bg-black/40 border border-white/5 flex items-center gap-3`}>
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                  <p className="text-[10px] opacity-75 leading-relaxed font-light">
                    هذا التقييم هو تقييم ذاتي لمساعدتك على ملاحظة حضورك القلبي أثناء اليوم ومجاهدة السرحان، الصلاة مقبولة بمجرد الإتيان بشروطها وأركانها بإذن الله.
                  </p>
                </div>

              </div>

            </div>
          )}

        </div>

      </main>

      {/* ================= ADD VIDEO MODAL ================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div 
            className={`w-full max-w-xl rounded-3xl border ${theme.cardBorderClass} ${theme.cardBgClass} p-6 shadow-2xl animate-in zoom-in-95 duration-200`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4 text-right">
              <h4 className="font-extrabold text-base flex items-center gap-2">
                <Tv className={`w-5 h-5 ${theme.accentClass}`} />
                إضافة فيديو إيماني جديد للمكتبة
              </h4>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white transition cursor-pointer text-xl font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddVideo} className="flex flex-col gap-4 text-right">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold">عنوان الفيديو *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: الخشوع في الصلاة وعلاجه"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className={`px-3 py-2 rounded-xl text-xs outline-none transition-all ${theme.inputBg}`}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold">الشيخ / المحاضر</label>
                <input
                  type="text"
                  placeholder="مثال: الشيخ مشاري الخراز"
                  value={newLecturer}
                  onChange={(e) => setNewLecturer(e.target.value)}
                  className={`px-3 py-2 rounded-xl text-xs outline-none transition-all ${theme.inputBg}`}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold">رابط الفيديو (YouTube) *</label>
                <input
                  type="url"
                  required
                  placeholder="مثال: https://www.youtube.com/watch?v=..."
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className={`px-3 py-2 rounded-xl text-xs outline-none transition-all ${theme.inputBg}`}
                />
                <span className="text-[9px] opacity-60">يدعم روابط اليوتيوب العادية والمختصرة وسيقوم بتحويلها للتشغيل المباشر.</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold">التصنيف</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className={`px-3 py-2 rounded-xl text-xs outline-none transition-all ${theme.inputBg}`}
                >
                  <option value="الخشوع والتلذذ">الخشوع والتلذذ</option>
                  <option value="علاج السرحان">علاج السرحان</option>
                  <option value="تعليم الصلاة">تعليم الصلاة</option>
                  <option value="تنبيهات وأخطاء">تنبيهات وأخطاء</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold">وصف للفيديو</label>
                <textarea
                  placeholder="اكتب نبذة مختصرة عن الدروس المستفادة..."
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className={`px-3 py-2 rounded-xl text-xs outline-none transition-all resize-none ${theme.inputBg}`}
                />
              </div>

              <div className="flex justify-end gap-3 mt-4 border-t border-white/5 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-semibold transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-xl font-bold text-xs transition cursor-pointer ${theme.primaryButton}`}
                >
                  إضافة الفيديو للمكتبة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= PLAY VIDEO OVERLAY MODAL ================= */}
      {selectedVideo && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedVideo(null)}
        >
          <div 
            className={`w-full max-w-3xl rounded-3xl border ${theme.cardBorderClass} ${theme.cardBgClass} overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-video bg-black">
              <iframe
                src={selectedVideo.url}
                title={selectedVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
                allow-same-origin="true"
              />
            </div>

            <div className="p-6 text-right">
              <div className="flex justify-between items-start gap-4 mb-2">
                <div>
                  <h3 className="font-extrabold text-base md:text-lg text-slate-100 leading-snug">
                    {selectedVideo.title}
                  </h3>
                  <span className={`text-xs block mt-1 ${theme.accentClass}`}>
                    بصوت: {selectedVideo.lecturer} • تصنيف: {selectedVideo.category}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition cursor-pointer text-slate-105"
                >
                  إغلاق
                </button>
              </div>
              <p className="text-xs opacity-75 leading-relaxed font-light mt-3 border-t border-white/5 pt-3">
                {selectedVideo.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================= FLOATING TOAST NOTIFICATION ================= */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-amber-500/20 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom duration-300 text-xs font-bold text-amber-400 font-sans">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
