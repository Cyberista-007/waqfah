'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlowCard, HoloBadge, NeonBorder } from '@/components/ui/glow';
import { Search, Sparkles, BookOpen, Layers, Info, Volume2, HelpCircle, Check, X, ArrowLeft, Heart, Columns, BarChart2, Hash, ArrowRightLeft, BookOpenCheck, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Sample lexicon database with detailed linguistic statistics
const quranicRoots = [
  {
    root: 'ر ح م',
    letter: 'ر',
    meaning: 'الرحمة، الرأفة، الرقة والتعطف.',
    occurrences: 563,
    mekkiPercent: 65,
    madaniPercent: 35,
    stats: {
      nounsCount: 395,
      verbsCount: 168,
      topSurahs: ['الفاتحة', 'الأعراف', 'الأنبياء'],
      morphology: [
        { form: 'اسْتَرْحَمَ', translation: 'طلب الرحمة والتعطف.' },
        { form: 'تَرَاحَمَ', translation: 'رحم بعضهم بعضاً (تفاعل).' }
      ]
    },
    derivatives: [
      { word: 'الرَّحْمَن', definition: 'الواسع الرحمة الذي وسعت رحمته كل شيء (خاص بالله).', count: 57, verses: ['بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ (الفاتحة: 1)', 'الرَّحْمَنُ عَلَى الْعَرْشِ اسْتَوَى (طه: 5)'] },
      { word: 'الرَّحِيم', definition: 'الموصل رحمته إلى خلقه (خاص بالله في الأغلب، ولغيره بالتقييد).', count: 114, verses: ['إِنَّ اللَّهَ بِالنَّاسِ لَرَؤُوفٌ رَّحِيمٌ (البقرة: 143)', 'وَكَانَ بِالْمُؤْمِنِينَ رَحِيمًا (الأحزاب: 43)'] },
      { word: 'رَحْمَة', definition: 'النعمة والإحسان والخير واللين والشفقة.', count: 288, verses: ['wوَرَحْمَتِي وَسِعَتْ كُلَّ شَيْءٍ (الأعراف: 156)', 'إِنَّ رَحْمَتَ اللَّهِ قَرِيبٌ مِّنَ الْمُحْسِنِينَ (الأعراف: 56)'] },
      { word: 'أَرْحَم', definition: 'الأشد رحمة ورأفة والأكثر عطاءً وإحساناً.', count: 4, verses: ['وَأَنتَ أَرْحَمُ الرَّاحِمِينَ (الأنبياء: 83)', 'فَاللَّهُ خَيْرٌ حَافِظًا ۖ وَهُوَ أَرْحَمُ الرَّاحِمِينَ (يوسف: 64)'] },
      { word: 'أَرْحَام', definition: 'قرابات النسب ومواضع الأجنة في بطون الأمهات.', count: 12, verses: ['وَأُولُو الْأَرْحَامِ بَعْضُهُمْ أَوْلَىٰ بِبَعْضٍ (الأنفال: 75)', 'وَيَعْلَمُ مَا فِي الْأَرْحَامِ (لقمان: 34)'] }
    ],
    verses: [
      { text: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ', surah: 'الفاتحة', number: 1 },
      { text: 'وَرَحْمَتِي وَسِعَتْ كُلَّ شَيْءٍ ۚ فَسَأَكْتُبُهَا لِلَّذِينَ يَتَّقُونَ', surah: 'الأعراف', number: 156 },
      { text: 'إِنَّ رَحْمَتَ اللَّهِ قَرِيبٌ مِّنَ الْمُحْسِنِينَ', surah: 'الأعراف', number: 56 }
    ]
  },
  {
    root: 'ع ل م',
    letter: 'ع',
    meaning: 'العِلم، المعرفة، الإدراك، وضد الجهل.',
    occurrences: 854,
    mekkiPercent: 55,
    madaniPercent: 45,
    stats: {
      nounsCount: 520,
      verbsCount: 334,
      topSurahs: ['البقرة', 'آل عمران', 'النساء'],
      morphology: [
        { form: 'تَعَلَّمَ', translation: 'اكتسب العلم تدريجياً.' },
        { form: 'اسْتَعْلَمَ', translation: 'طلب العلم والإخبار بالشيء.' }
      ]
    },
    derivatives: [
      { word: 'الْعَلِيم', definition: 'واسع العلم المحيط بكل شيء ظاهراً وباطناً.', count: 162, verses: ['وَهُوَ الْخَلَّاقُ الْعَلِيمُ (يس: 81)', 'إِنَّ اللَّهَ عَلِيمٌ بِذَاتِ الصُّدُورِ (آل عمران: 119)'] },
      { word: 'يَعْلَمُونَ', definition: 'فعل مضارع يدل على استمرار إدراكهم ومعرفتهم للأشياء.', count: 85, verses: ['وَاللَّهُ يَعْلَمُ وَأَنتُمْ لَا تَعْلَمُونَ (البقرة: 216)', 'كَلَّا سَيَعْلَمُونَ (النبأ: 4)'] },
      { word: 'عِلْم', definition: 'إدراك الشيء على ما هو عليه إدراكاً جازماً نافعاً.', count: 105, verses: ['وَوقُل رَّبِّ زِدْنِي عِلْمًا (طه: 114)', 'وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ (البقرة: 255)'] },
      { word: 'الْعَالَمِينَ', definition: 'أصناف الخلق والخلائق أجمعين من إنس وجن وملائكة.', count: 73, verses: ['الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ (الفاتحة: 2)', 'تَنزيلٌ مِّن رَّبِّ الْعَالَمِينَ (الواقعة: 80)'] }
    ],
    verses: [
      { text: 'وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا', surah: 'البقرة', number: 31 },
      { text: 'وَقُل رَّبِّ زِدْنِي عِلْمًا', surah: 'طه', number: 114 },
      { text: 'وَاللَّهُ يَعْلَمُ وَأَنتُمْ لَا تَعْلَمُونَ', surah: 'البقرة', number: 216 }
    ]
  },
  {
    root: 'ن و ر',
    letter: 'ن',
    meaning: 'النور، الضياء، الهداية والبيان.',
    occurrences: 49,
    mekkiPercent: 40,
    madaniPercent: 60,
    stats: {
      nounsCount: 41,
      verbsCount: 8,
      topSurahs: ['النور', 'التوبة', 'الحديد'],
      morphology: [
        { form: 'اسْتَنَارَ', translation: 'طلب الضياء والهدى والوضوح.' },
        { form: 'تَنْوِير', translation: 'جعل الشيء مضيئاً وبَيِّناً.' }
      ]
    },
    derivatives: [
      { word: 'نُور', definition: 'الضوء الهادي المبدد للظلمات، ويطلق على القرآن والهدى والإيمان.', count: 33, verses: ['اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ (النور: 35)', 'يُرِيدُونَ أَن يُطْفِئُوا نُورَ اللَّهِ بِأَفْوَاهِهِمْ (التوبة: 32)'] },
      { word: 'مُنِير', definition: 'المشع المضيء لغيره كالشمس والقرآن والسراج الهادي.', count: 6, verses: ['وَدَاعِيًا إِلَى اللَّهِ بِإِذْنِهِ وَسِرَاجًا مُّنِيرًا (الأحزاب: 46)', 'وَكِتَابٍ مُّنِيرٍ (آل عمران: 184)'] }
    ],
    verses: [
      { text: 'اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ', surah: 'النور', number: 35 },
      { text: 'يُرِيدُونَ أَن يُطْفِئُوا نُورَ اللَّهِ بِأَفْوَاهِهِمْ', surah: 'التوبة', number: 32 }
    ]
  }
];

const quranicSynonyms = [
  {
    pair: 'الرِّيح مقابل الرِّيَاح',
    word1: 'الرِّيح (بالمفرد)',
    word1Desc: 'تُستعمل في القرآن الكريم غالباً في سياق العذاب والعقوبة الشديدة المدمرة.',
    word1Verse: 'وَفِي عَادٍ إِذْ أَرْسَلْنَا عَلَيْهِمُ الرِّيحَ الْعَقِيمَ (الذاريات: 41)',
    word2: 'الرِّيَاح (بالجمع)',
    word2Desc: 'تُستعمل غالباً في سياق الرحمة والخير والبشارة بالمطر وتسيير السفن.',
    word2Verse: 'وَهُوَ الَّذِي يُرْسِلُ الرِّيَاحَ بُشْرًا بَيْنَ يَدَيْ رَحْمَتِهِ (الأعراف: 57)'
  },
  {
    pair: 'جَاءَ مقابل أَتَى',
    word1: 'جَاءَ',
    word1Desc: 'تدل على المجيء بالأمور العظيمة الشاقة أو الأعيان والأجسام الثقيلة.',
    word1Verse: 'فَإِذَا جَاءَتِ الصَّاخَّةُ (التكوير: 33)',
    word2: 'أَتَى',
    word2Desc: 'تدل على المجيء السهل اليسير واليسر أو مجيء الأمور المعنوية والأحكام.',
    word2Verse: 'أَتَىٰ أَمْرُ اللَّهِ فَلَا تَسْتَعْجِلُوهُ (النحل: 1)'
  }
];

const eloquenceSecrets = [
  {
    title: 'سَبَّحَ (ماضي) مقابل يُسَبِّحُ (مضارع)',
    context: 'افتتاح السور بالتسبيح بالصيغ المختلفة.',
    rhetoric: 'استعمال الماضي يدل على ثبوت وتوفر التسبيح لله قديماً وأزلاً، واستعمال المضارع يدل على استمراره وتجدده في المستقبل والآن.',
    verse: 'سَبَّحَ لِلَّهِ مَا فِي السَّمَاوَاتِ وَالْأَرْضِ (الحديد: 1) / يُسَبِّحُ لِلَّهِ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ (الجمعة: 1)'
  },
  {
    title: 'تأديم تقديم الْمَوْتَ على الْحَيَاةَ',
    context: 'تقديم الموت في آية الخلق والابتلاء.',
    rhetoric: 'قُدم الموت لأنه كان سابقاً على الحياة (إذ كان الإنسان عدماً تراباً)، ولأنه أشد ردعاً وتذكيراً بالغاية من الابتلاء والعمل.',
    verse: 'الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا (الملك: 2)'
  }
];

const vocabularyFlashcards = [
  { word: 'عَسْعَسَ', meaning: 'أقبل بظلامه (أو أدبر، وهي من المشترك اللفظي).', verse: 'وَاللَّيْلِ إِذَا عَسْعَسَ', surah: 'التكوير: 17' },
  { word: 'الْقَسْوَرَة', definition: 'الأسد (وتعني أيضاً الرماة من الصيادين).', verse: 'فَرَّتْ مِن قَسْوَرَةٍ', surah: 'المدثر: 51' }
];

export default function BayanLexiconPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [selectedRoot, setSelectedRoot] = useState(quranicRoots[0]);
  const [activeDerivative, setActiveDerivative] = useState<any>(quranicRoots[0].derivatives[0]);
  const [cardIndex, setCardIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedSynonymIndex, setSelectedSynonymIndex] = useState(0);

  // New features: Synonym Compare Matrix toggle
  const [compareWordA, setCompareWordA] = useState('الرِّيح');
  const [compareWordB, setCompareWordB] = useState('الرِّيَاح');

  // Eloquence secrets state
  const [selectedEloqIndex, setSelectedEloqIndex] = useState(0);

  const alphabetLetters = useMemo(() => {
    return Array.from(new Set(quranicRoots.map((r) => r.letter))).sort();
  }, []);

  const handleRootSelect = (root: typeof quranicRoots[0]) => {
    setSelectedRoot(root);
    setActiveDerivative(root.derivatives[0]);
  };

  const speakWord = (word: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.85;
      synth.cancel();
      synth.speak(utterance);
    }
  };

  const toggleFavorite = (word: string) => {
    setFavorites((prev) =>
      prev.includes(word) ? prev.filter((w) => w !== word) : [...prev, word]
    );
  };

  const currentQuiz = useMemo(() => {
    const questionWord = vocabularyFlashcards[cardIndex % vocabularyFlashcards.length];
    const otherMeanings = vocabularyFlashcards
      .filter((c) => c.word !== questionWord.word)
      .map((c) => c.meaning || c.definition || '');
    const options = [questionWord.meaning || questionWord.definition || ''];
    const pool = [...otherMeanings];
    while (options.length < 3 && pool.length > 0) {
      const randIndex = Math.floor(Math.random() * pool.length);
      const option = pool.splice(randIndex, 1)[0];
      if (!options.includes(option)) options.push(option);
    }
    return {
      word: questionWord.word,
      verse: questionWord.verse,
      surah: questionWord.surah,
      correctAnswer: questionWord.meaning || questionWord.definition || '',
      options: options.sort(() => Math.random() - 0.5)
    };
  }, [cardIndex]);

  const filteredRoots = useMemo(() => {
    let result = quranicRoots;
    if (selectedLetter) {
      result = result.filter((r) => r.letter === selectedLetter);
    }
    if (searchQuery.trim()) {
      result = result.filter(
        (r) =>
          r.root.replace(/\s+/g, '').includes(searchQuery.replace(/\s+/g, '')) ||
          r.derivatives.some((d) => d.word.includes(searchQuery))
      );
    }
    return result;
  }, [searchQuery, selectedLetter]);

  const handleQuizAnswer = (option: string) => {
    if (quizAnswered) return;
    setSelectedAnswer(option);
    setQuizAnswered(true);
    if (option === currentQuiz.correctAnswer) {
      setQuizScore((prev) => prev + 1);
    }
  };

  const nextQuestion = () => {
    setCardIndex((prev) => (prev + 1) % vocabularyFlashcards.length);
    setQuizAnswered(false);
    setSelectedAnswer(null);
  };

  const currentSynonym = quranicSynonyms[selectedSynonymIndex];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Title */}
      <div className="text-center mb-12">
        <HoloBadge className="mb-3">
          <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
          <span>قسم بيان لعلوم القرآن</span>
        </HoloBadge>
        <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-primary/80 mb-4">
          بيَان - معجم الألفاظ والكلمات القرآنية
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base text-center">
          مستكشف لغوي متكامل يبحر في معاني الكلمات القرآنية وجذورها وعلاقتها البيانية مع لوحة إحصاءات لغوية متقدمة.
        </p>
      </div>

      {/* Alphabet filter block */}
      <div className="flex flex-wrap justify-center gap-1.5 mb-8 bg-white/5 border border-white/5 p-3 rounded-2xl max-w-2xl mx-auto">
        <button
          onClick={() => setSelectedLetter(null)}
          className={`px-3 py-1.5 rounded-xl text-xs transition-all ${
            selectedLetter === null ? 'bg-primary text-black font-black' : 'hover:bg-white/10 text-muted-foreground'
          }`}
        >
          الكل
        </button>
        {alphabetLetters.map((l) => (
          <button
            key={l}
            onClick={() => setSelectedLetter(l)}
            className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
              selectedLetter === l ? 'bg-primary text-black font-black scale-110 shadow-md shadow-primary/20' : 'hover:bg-white/5 text-muted-foreground'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Search & Roots Directory */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-zinc-950/40 backdrop-blur-xl border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-2 text-right justify-start">
                <Search className="h-5 w-5 text-primary" />
                <span>دليل الجذور اللغوية</span>
              </CardTitle>
              <CardDescription className="text-right">ابحث بالحروف أو بالكلمة المشتقة</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Input
                  placeholder="مثال: ر ح م، علم..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white/5 border-white/10 rounded-2xl pr-4 pl-10 focus-visible:ring-primary text-right"
                />
              </div>

              <div className="flex gap-2 justify-end items-center flex-wrap pt-1">
                <span className="text-[10px] text-muted-foreground">اقتراحات:</span>
                {['ر ح م', 'ع ل م', 'ن و ر'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSearchQuery(tag);
                      const rootObj = quranicRoots.find(r => r.root === tag);
                      if (rootObj) handleRootSelect(rootObj);
                    }}
                    className="text-[10px] bg-white/5 hover:bg-white/10 text-primary border border-white/10 px-2 py-0.5 rounded-lg"
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
                {filteredRoots.length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm py-8">لم نعثر على نتائج مألوفة</p>
                ) : (
                  filteredRoots.map((item) => (
                    <button
                      key={item.root}
                      onClick={() => handleRootSelect(item)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border ${
                        selectedRoot.root === item.root
                          ? 'bg-primary/20 border-primary text-primary font-black shadow-lg shadow-primary/10'
                          : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 text-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-4 w-4 opacity-60" />
                        <span className="text-base tracking-widest">{item.root}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs opacity-60">تكرر {item.occurrences} مرة</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Vocabulary Challenge */}
          <Card className="bg-zinc-950/40 backdrop-blur-xl border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
            <NeonBorder color="hsl(var(--primary) / 0.3)">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-bold flex items-center gap-2 animate-pulse">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    <span>تحدي المفردات الغريبة</span>
                  </CardTitle>
                  <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">
                    النتيجة: {quizScore}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentQuiz.word}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="text-center py-4 bg-white/5 rounded-2xl border border-white/10 relative overflow-hidden">
                      <div className="absolute top-2 left-2 flex gap-1">
                        <button
                          onClick={() => speakWord(currentQuiz.word)}
                          className="p-1 hover:bg-white/10 rounded text-muted-foreground hover:text-white"
                          title="استمع للنطق الصحيح"
                        >
                          <Volume2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="text-3xl font-black font-headline text-primary mb-2">{currentQuiz.word}</div>
                      <div className="text-xs text-muted-foreground italic px-4 leading-relaxed">
                        قال تعالى: &quot;{currentQuiz.verse}&quot; ({currentQuiz.surah})
                      </div>
                    </div>

                    <div className="space-y-2">
                      {currentQuiz.options.map((option, idx) => {
                        const isCorrect = option === currentQuiz.correctAnswer;
                        const isSelected = option === selectedAnswer;
                        return (
                          <button
                            key={idx}
                            disabled={quizAnswered}
                            onClick={() => handleQuizAnswer(option)}
                            className={`w-full text-right p-3 rounded-xl border text-xs leading-relaxed transition-all flex items-center justify-between ${
                              quizAnswered
                                ? isCorrect
                                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                                  : isSelected
                                  ? 'bg-red-500/20 border-red-500 text-red-300'
                                  : 'bg-white/5 border-white/5 opacity-60'
                                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-primary/50'
                            }`}
                          >
                            <span>{option}</span>
                          </button>
                        );
                      })}
                    </div>

                    {quizAnswered && (
                      <Button onClick={nextQuestion} className="w-full rounded-xl bg-primary hover:bg-primary/90 mt-2 text-xs text-black font-bold">
                        التالي <ArrowLeft className="ms-2 h-4 w-4 text-black" />
                      </Button>
                    )}
                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </NeonBorder>
          </Card>

          {/* Rhetoric & Eloquence Explorer */}
          <Card className="bg-zinc-950/40 backdrop-blur-xl border-white/10 rounded-3xl p-5 shadow-2xl text-right">
            <h3 className="text-base font-bold flex items-center gap-2 mb-2 justify-start text-white">
              <MessageCircle className="h-5 w-5 text-primary" />
              <span>مستكشف الفصاحة والبيان الإعجازي</span>
            </h3>
            <p className="text-[10px] text-muted-foreground mb-4">
              شاهد أسرار التقديم والتأخير وصيغ التعبير البلاغية المعجزة في القرآن الكريم.
            </p>

            <div className="flex gap-2 mb-4">
              {eloquenceSecrets.map((e, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedEloqIndex(idx)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all border ${
                    selectedEloqIndex === idx
                      ? 'bg-primary/20 border-primary text-primary'
                      : 'bg-white/5 border-transparent text-muted-foreground hover:bg-white/10'
                  }`}
                >
                  {e.title.split(' ')[0]}
                </button>
              ))}
            </div>

            <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-xs space-y-3">
              <div>
                <span className="text-[9px] text-primary font-bold">الرابط البلاغي:</span>
                <div className="font-bold text-white mt-0.5">{eloquenceSecrets[selectedEloqIndex].title}</div>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {eloquenceSecrets[selectedEloqIndex].rhetoric}
              </p>
              <div className="bg-black/30 border border-white/5 p-2 rounded-xl text-[10px] leading-relaxed">
                <strong>الآية الشاهدة:</strong> {eloquenceSecrets[selectedEloqIndex].verse}
              </div>
            </div>
          </Card>
        </div>

        {/* Center / Right Column: Detailed analysis & Derivatives */}
        <div className="lg:col-span-2 space-y-6">
          <GlowCard className="bg-zinc-950/40 backdrop-blur-xl border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-4 mb-6 gap-4">
              <div>
                <HoloBadge className="mb-2">جذر لغوي مفعل</HoloBadge>
                <h2 className="text-3xl font-black text-white text-right">المشتقات اللغوية للجذر: {selectedRoot.root}</h2>
              </div>
              <div className="flex gap-2">
                {selectedRoot.derivatives.map((der) => (
                  <button
                    key={der.word}
                    onClick={() => setActiveDerivative(der)}
                    className={`px-3 py-1.5 rounded-xl text-xs transition-all border ${
                      activeDerivative.word === der.word
                        ? 'bg-primary/20 border-primary text-primary font-bold'
                        : 'bg-white/5 border-transparent text-muted-foreground hover:bg-white/10'
                    }`}
                  >
                    {der.word}
                  </button>
                ))}
              </div>
            </div>

            {activeDerivative && (
              <motion.div
                key={activeDerivative.word}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 text-right"
              >
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => speakWord(activeDerivative.word)}
                    className="p-1.5 hover:bg-white/10 border border-white/10 rounded-xl text-muted-foreground hover:text-white transition-colors"
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => toggleFavorite(activeDerivative.word)}
                    className="p-1.5 hover:bg-white/10 border border-white/10 rounded-xl text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <Heart className={`h-4 w-4 ${favorites.includes(activeDerivative.word) ? 'fill-red-500 text-red-500' : ''}`} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded font-bold">المشتق المحدد</span>
                    <h4 className="text-2xl font-black text-white mt-1">{activeDerivative.word}</h4>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 justify-start">
                      <Info className="h-3.5 w-3.5 text-primary" /> المعنى البياني واللغوي
                    </span>
                    <p className="text-xs text-muted-foreground leading-relaxed">{activeDerivative.definition}</p>
                  </div>
                </div>

                <div className="space-y-3 text-right">
                  <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 justify-start">
                    <BookOpen className="h-3.5 w-3.5 text-primary" /> مواضع شواهد الآيات المشتقة
                  </span>
                  <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1">
                    {activeDerivative.verses && activeDerivative.verses.map((v: string, idx: number) => (
                      <div key={idx} className="bg-black/30 border border-white/5 p-2.5 rounded-xl text-xs">
                        <p className="font-headline font-bold text-center leading-loose text-white/90">&quot;{v.split('(')[0]}&quot;</p>
                        <div className="text-[10px] text-muted-foreground text-left mt-1">({v.split('(')[1]}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </GlowCard>

          {/* Quranic Linguistic Statistics Dashboard */}
          {selectedRoot.stats && (
            <Card className="bg-zinc-950/40 backdrop-blur-xl border-white/10 rounded-3xl p-6 shadow-2xl text-right">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 justify-start">
                <BarChart2 className="h-5 w-5 text-primary" />
                <span>محلل إحصائيات الجذر اللغوي: &quot;{selectedRoot.root}&quot;</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Noun vs Verb Ratio */}
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-3">
                  <span className="text-xs text-muted-foreground font-bold">توزيع الأقسام النحوية:</span>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-white">
                      <span>الأسماء ({selectedRoot.stats.nounsCount})</span>
                      <span>الأفعال ({selectedRoot.stats.verbsCount})</span>
                    </div>
                    <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden flex">
                      <div
                        className="bg-primary h-full"
                        style={{ width: `${(selectedRoot.stats.nounsCount / (selectedRoot.stats.nounsCount + selectedRoot.stats.verbsCount)) * 100}%` }}
                      />
                      <div
                        className="bg-amber-400 h-full"
                        style={{ width: `${(selectedRoot.stats.verbsCount / (selectedRoot.stats.nounsCount + selectedRoot.stats.verbsCount)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Top Surahs */}
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
                  <span className="text-xs text-muted-foreground font-bold flex items-center gap-1">
                    <Hash className="h-3.5 w-3.5 text-primary" />
                    <span>أكثر السور وروداً للجذر:</span>
                  </span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {selectedRoot.stats.topSurahs.map((surah) => (
                      <span key={surah} className="bg-primary/10 border border-primary/20 text-primary text-xs px-3 py-1 rounded-xl">
                        سورة {surah}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Morphological Shift Form */}
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
                  <span className="text-xs text-muted-foreground font-bold">التحولات الصرفية للمشتق:</span>
                  <div className="space-y-1">
                    {selectedRoot.stats.morphology.map((m, idx) => (
                      <div key={idx} className="flex justify-between text-xs">
                        <span className="font-bold text-white">{m.form}</span>
                        <span className="text-muted-foreground">{m.translation}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Compare Nuances Interactive Matrix */}
          <Card className="bg-zinc-950/40 backdrop-blur-xl border-white/10 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2 justify-start">
              <ArrowRightLeft className="h-5 w-5 text-primary" />
              <span>مصفوفة مقارنة الفروق البيانية المتقدمة</span>
            </h3>
            <p className="text-xs text-muted-foreground mb-6">قارن بين أي لفظين لمعرفة الفروق في الاستعمال القرآني الفريد.</p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-bold">الكلمة الأولى:</label>
                <select
                  value={compareWordA}
                  onChange={(e) => setCompareWordA(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                >
                  <option value="الرِّيح" className="bg-zinc-950">الرِّيح</option>
                  <option value="جَاءَ" className="bg-zinc-950">جَاءَ</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-bold">الكلمة الثانية:</label>
                <select
                  value={compareWordB}
                  onChange={(e) => setCompareWordB(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                >
                  <option value="الرِّيَاح" className="bg-zinc-950">الرِّيَاح</option>
                  <option value="أَتَى" className="bg-zinc-950">أَتَى</option>
                </select>
              </div>
            </div>

            <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-xs space-y-2">
              <div className="flex items-center gap-2 text-primary font-bold">
                <BookOpenCheck className="h-4 w-4" />
                <span>الاستنتاج البياني للمقارنة:</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {compareWordA === 'الرِّيح' && compareWordB === 'الرِّيَاح' && 'تُستعمل الريح مفرداً غالباً للعقاب والتدمير، بينما تُستعمل الرياح جمعاً لبشارة المطر والرحمة والخير.'}
                {compareWordA === 'جَاءَ' && compareWordB === 'أَتَى' && 'تدل جاءَ على المجيء بالأمور العظيمة الشاقة المادية، بينما تدل أتى على المجيء السهل اليسير المعنوي.'}
              </p>
            </div>
          </Card>

          {/* Quranic Synonym Nuance Comparator */}
          <Card className="bg-zinc-950/40 backdrop-blur-xl border-white/10 rounded-3xl p-6 shadow-2xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-4 mb-6 gap-4">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                  <Columns className="h-5 w-5 text-primary" />
                  <span>الفروق اللغوية الدقيقة والمترادفات</span>
                </h3>
                <p className="text-xs text-muted-foreground">شاهد الفروق البيانية اللطيفة بين الكلمات المتقاربة في القرآن</p>
              </div>

              <div className="flex gap-2">
                {quranicSynonyms.map((syn, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedSynonymIndex(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs transition-all border ${
                      selectedSynonymIndex === idx
                        ? 'bg-primary/20 border-primary text-primary font-bold'
                        : 'bg-white/5 border-transparent text-muted-foreground hover:bg-white/10'
                    }`}
                  >
                    {syn.pair.split(' ')[0]} / {syn.pair.split(' ').slice(-1)[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right">
              {/* Word 1 card */}
              <div className="bg-white/5 border border-white/5 p-5 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-black text-primary">{currentSynonym.word1}</h4>
                  <button onClick={() => speakWord(currentSynonym.word1)} className="text-muted-foreground hover:text-white">
                    <Volume2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{currentSynonym.word1Desc}</p>
                <div className="bg-black/30 border border-white/5 p-3 rounded-xl">
                  <span className="text-[10px] text-muted-foreground font-bold">شاهد قرآني:</span>
                  <p className="text-xs font-headline leading-loose text-white/90 mt-1">&quot;{currentSynonym.word1Verse.split('(')[0]}&quot;</p>
                  <span className="text-[9px] text-muted-foreground block text-left mt-0.5">({currentSynonym.word1Verse.split('(')[1]}</span>
                </div>
              </div>

              {/* Word 2 card */}
              <div className="bg-white/5 border border-white/5 p-5 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-black text-amber-400">{currentSynonym.word2}</h4>
                  <button onClick={() => speakWord(currentSynonym.word2)} className="text-muted-foreground hover:text-white">
                    <Volume2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{currentSynonym.word2Desc}</p>
                <div className="bg-black/30 border border-white/5 p-3 rounded-xl">
                  <span className="text-[10px] text-muted-foreground font-bold">شاهد قرآني:</span>
                  <p className="text-xs font-headline leading-loose text-white/90 mt-1">&quot;{currentSynonym.word2Verse.split('(')[0]}&quot;</p>
                  <span className="text-[9px] text-muted-foreground block text-left mt-0.5">({currentSynonym.word2Verse.split('(')[1]}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
