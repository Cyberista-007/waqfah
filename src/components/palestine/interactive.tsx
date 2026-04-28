'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ArrowRight, Trophy, Quote, Leaf, Heart } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { QUIZ_QUESTIONS, POETRY } from './constants';

/**
 * Knowledge Quiz: Interactive educational game.
 */
export function KnowledgeQuiz() {
  const [currentQuestion, setCurrentQuestion] = React.useState(0);
  const [selectedOption, setSelectedOption] = React.useState<number | null>(null);
  const [showResult, setShowResult] = React.useState(false);
  const [score, setScore] = React.useState(0);
  const [isFinished, setIsFinished] = React.useState(false);

  const handleAnswer = (index: number) => {
    setSelectedOption(index);
    if (index === QUIZ_QUESTIONS[currentQuestion].correct) setScore(score + 1);
    setShowResult(true);
  };

  const nextQuestion = () => {
    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else setIsFinished(true);
  };

  const restart = () => {
    setCurrentQuestion(0);
    setSelectedOption(null);
    setShowResult(false);
    setScore(0);
    setIsFinished(false);
  };

  return (
    <section id="quiz" className="py-40 relative">
      <div className="container px-6">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto rounded-[5rem] bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-16 md:p-32 relative overflow-hidden shadow-3xl"
        >
           <div className="absolute top-12 left-12 flex items-center gap-4 text-white/20 font-black text-[10px] uppercase tracking-[0.4em]">
              <span>تحدي المعرفة</span>
              <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-emerald-500" 
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
                />
              </div>
              <span>{currentQuestion + 1} / {QUIZ_QUESTIONS.length}</span>
           </div>

           <AnimatePresence mode="wait">
              {!isFinished ? (
                <motion.div 
                  key={currentQuestion} 
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-12 text-right"
                >
                  <h4 className="text-3xl md:text-5xl font-black text-white leading-tight">
                    {QUIZ_QUESTIONS[currentQuestion].question}
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {QUIZ_QUESTIONS[currentQuestion].options.map((option, i) => (
                      <button 
                        key={i} 
                        disabled={showResult}
                        onClick={() => handleAnswer(i)}
                        className={cn(
                          "p-10 rounded-[2.5rem] text-right font-black text-xl transition-all border shadow-2xl",
                          selectedOption === i 
                            ? (i === QUIZ_QUESTIONS[currentQuestion].correct 
                                ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-glow-emerald/20 scale-105" 
                                : "bg-rose-500/20 border-rose-500 text-rose-400 scale-95") 
                            : "bg-white/[0.03] border-white/5 hover:border-white/20 text-white/60 hover:text-white"
                        )}
                      >
                        {option}
                      </button>
                    ))}
                  </div>

                  {showResult && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-12 rounded-[3.5rem] bg-white/[0.03] border border-white/10 space-y-6"
                    >
                       <div className="flex items-center justify-between">
                          <p className={cn(
                            "text-2xl font-black",
                            selectedOption === QUIZ_QUESTIONS[currentQuestion].correct ? "text-emerald-500" : "text-rose-500"
                          )}>
                            {selectedOption === QUIZ_QUESTIONS[currentQuestion].correct ? 'إجابة صحيحة ومباركة!' : 'للاسف، المعلومة الصحيحة هي:'}
                          </p>
                          <Star className={cn("w-8 h-8", selectedOption === QUIZ_QUESTIONS[currentQuestion].correct ? "text-emerald-500 fill-emerald-500" : "text-rose-500")} />
                       </div>
                       <p className="text-xl text-white/60 leading-relaxed font-medium">{QUIZ_QUESTIONS[currentQuestion].explanation}</p>
                       <button 
                         onClick={nextQuestion}
                         className="h-16 px-12 bg-white text-black rounded-2xl font-black text-lg hover:scale-105 transition-all shadow-glow-white mr-auto flex items-center gap-3"
                       >
                         السؤال التالي <ArrowRight className="w-5 h-5" />
                       </button>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-12 py-16"
                >
                  <div className="w-32 h-32 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-glow-emerald">
                     <Trophy className="w-16 h-16 text-black" />
                  </div>
                  <div className="space-y-4">
                     <h4 className="text-4xl md:text-6xl font-black text-white">انتهى التحدي المعرفي!</h4>
                     <p className="text-2xl text-white/40 font-medium">لقد أجبت على {score} من أصل {QUIZ_QUESTIONS.length} بشكل صحيح.</p>
                  </div>
                  <div className="flex items-center justify-center gap-6">
                     <button onClick={restart} className="h-16 px-12 bg-white/5 border border-white/10 text-white rounded-2xl font-black hover:bg-white/10 transition-all">إعادة التحدي</button>
                     <button className="h-16 px-12 bg-emerald-500 text-black rounded-2xl font-black hover:scale-105 transition-all shadow-glow-emerald">شارك نتيجتك</button>
                  </div>
                </motion.div>
              )}
           </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

/**
 * Immersive Poetry Wall: Cinematic Palestinian poetry showcase.
 */
export function ImmersivePoetryWall() {
  const poems = [
    {
      text: "عَلَى هَذِهِ الأَرْضِ مَا يَسْتَحِقُّ الحَيَاةَ",
      author: "محمود درويش",
      work: "قصيدة: على هذه الأرض"
    },
    {
      text: "أَنَا لا أَكْرَهُ النَّاسَ.. وَلا أَسْطُو عَلَى أَحَدٍ.. وَلَكِنِّي.. إِذَا مَا جُعْتُ.. آكُلُ لَحْمَ مُغْتَصِبِي",
      author: "محمود درويش",
      work: "سجل أنا عربي"
    },
    {
      text: "يَا بَحْرُ جِئْنَاكَ.. نَحْمِلُ أَوْجَاعَنَا.. وَنَشْكُو إِلَيْكَ.. ظُلْمَ القَرِيبِ وَالبَعِيدِ",
      author: "شاعر من غزة",
      work: "رسائل تحت القصف"
    },
    {
      text: "سَأَحْمِلُ رُوحِي عَلَى رَاحَتِي.. وَأُلْقِي بِهَا فِي مَهَاوِي الرَّدَى",
      author: "عبد الرحيم محمود",
      work: "الشهيد"
    }
  ];

  const [active, setActive] = React.useState(0);

  return (
    <section className="py-60 relative overflow-hidden bg-black/20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(225,29,72,0.05),transparent)]" />
      <div className="container px-6">
        <div className="max-w-6xl mx-auto mb-40">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative p-16 md:p-24 rounded-[5rem] bg-white/[0.03] backdrop-blur-3xl border border-white/10 text-center shadow-3xl overflow-hidden"
            >
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-rose-500/5 blur-[80px] rounded-full" />
              <Quote className="w-12 h-12 md:w-20 md:h-20 text-rose-500/10 mx-auto mb-10" />
              <p className="text-xl md:text-5xl font-black leading-relaxed text-white mb-12 font-quran">
                "{poems[active].text}"
              </p>
              <div className="space-y-2">
                <p className="text-lg md:text-xl font-black text-rose-400">{poems[active].author}</p>
                <p className="text-[10px] md:text-sm text-white/30 font-bold uppercase tracking-widest">{poems[active].work}</p>
              </div>

              <div className="flex justify-center gap-4 mt-12">
                {poems.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    className={cn(
                      "transition-all duration-500 rounded-full",
                      i === active ? "w-10 h-3 bg-rose-500" : "w-3 h-3 bg-white/20 hover:bg-white/40"
                    )}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {poems.map((poem, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setActive(i)}
              className={cn(
                "p-10 rounded-[3.5rem] border text-right cursor-pointer transition-all group",
                active === i
                  ? "bg-rose-500/10 border-rose-500/30 shadow-[0_0_40px_rgba(244,63,94,0.1)]"
                  : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10"
              )}
            >
              <p className="text-lg font-bold text-white/70 leading-relaxed mb-6 italic">"{poem.text.slice(0, 60)}..."</p>
              <p className="text-sm font-black text-rose-400">{poem.author}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Poetry Section: The literary soul of Palestine.
 */
export function PoetrySection() {
  return (
    <section className="py-60 relative overflow-hidden bg-black/40">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
         <p className="text-[30rem] font-quran select-none">فلسطين</p>
      </div>

      <div className="container px-6 relative z-10">
        <div className="space-y-40">
          {POETRY.map((p, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5 }}
              className="max-w-6xl mx-auto text-center group"
            >
              <Quote className="w-20 h-20 text-white/5 mx-auto mb-16 group-hover:text-rose-500/20 transition-colors duration-1000" />
              <h3 className="text-5xl md:text-8xl font-quran leading-[1.4] text-white/90 mb-12 drop-shadow-2xl">
                "{p.text}"
              </h3>
              <div className="flex flex-col items-center gap-4">
                 <div className="h-px w-20 bg-rose-500/40" />
                 <span className="text-2xl font-black text-rose-500 uppercase tracking-[0.4em]">{p.author}</span>
                 {p.title && <span className="text-sm font-bold text-white/20 italic">{p.title}</span>}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Tree Planting Simulation: Interactive engagement.
 */
export function TreePlantingSimulation() {
  const [isPlanted, setIsPlanted] = React.useState(false);
  const [isAnimating, setIsAnimating] = React.useState(false);

  const plantTree = () => {
    setIsPlanted(true);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 3000);
  };

  return (
    <section className="py-40 relative overflow-hidden">
      <div className="container px-6 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto space-y-16"
        >
          <div className="space-y-6">
            <h2 className="text-4xl md:text-7xl font-black">ازرع <span className="text-emerald-500">زيتونة</span> للأمل المستمر</h2>
            <p className="text-2xl text-white/40 font-medium">شجرة الزيتون هي أعظم رمز للصمود الفلسطيني؛ فهي لا تموت، تضرب جذورها في التاريخ، وتثمر خيراً للأجيال. ازرع زيتونة رمزية الآن.</p>
          </div>

          <div className="relative h-96 flex items-center justify-center">
             <AnimatePresence mode="wait">
                {!isPlanted ? (
                  <motion.button
                    key="seed"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={plantTree}
                    className="group relative w-40 h-40 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center justify-center gap-4 transition-all shadow-glow-emerald/10"
                  >
                    <div className="absolute inset-0 bg-emerald-500/5 rounded-full animate-ping group-hover:animate-none" />
                    <Leaf className="w-16 h-16 text-emerald-500" />
                    <span className="text-xs font-black uppercase tracking-widest text-emerald-500/60">اضغط للزراعة</span>
                  </motion.button>
                ) : (
                  <motion.div
                    key="tree"
                    initial={{ scale: 0, opacity: 0, rotate: -20 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 100, damping: 15 }}
                    className="flex flex-col items-center gap-8"
                  >
                     <div className="relative">
                        <motion.div 
                          animate={{ y: [0, -20, 0], scale: [1, 1.2, 1] }}
                          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                          className="w-48 h-48 bg-emerald-500/30 rounded-full flex items-center justify-center blur-3xl absolute inset-0"
                        />
                        <div className="relative z-10 flex flex-col items-center">
                           <motion.div
                             animate={{ 
                               rotate: [-2, 2, -2],
                               scale: [1, 1.05, 1]
                             }}
                             transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                           >
                             <Image src="/palestine_landscape_olive_trees_1777280376366.png" alt="Planted Olive Tree" width={300} height={300} className="rounded-full border-4 border-emerald-500/30 shadow-3xl" />
                           </motion.div>
                           <div className="w-2 h-16 bg-emerald-900/60 rounded-full -mt-4 shadow-glow-emerald" />
                        </div>
                     </div>
                     <motion.div 
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: 0.5 }}
                       className="space-y-4"
                     >
                        <p className="text-4xl font-black text-white">تمت الزراعة بنجاح في أرض الذاكرة!</p>
                        <p className="text-xl text-white/40 font-bold uppercase tracking-[0.3em]">لقد غرست اليوم جذراً جديداً للأمل لا يمكن اقتلاعه.</p>
                     </motion.div>
                  </motion.div>
                )}
             </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/**
 * Prayer Counter: Spiritual solidarity engagement.
 */
export function PrayerCounter() {
  const [count, setCount] = React.useState(0);
  const [isJumping, setIsJumping] = React.useState(false);

  const increment = () => {
    setCount(prev => prev + 1);
    setIsJumping(true);
    setTimeout(() => setIsJumping(false), 500);
  };

  return (
    <section className="py-40 bg-black/30 text-center relative overflow-hidden">
       <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(225,29,72,0.02),transparent)]" />
       <div className="container px-6 space-y-12 relative z-10">
          <h2 className="text-3xl md:text-5xl font-black text-white/80">أرسل دعوة صادقة لأهلنا في فلسطين</h2>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={increment}
            className="group relative w-48 h-48 rounded-[3rem] bg-white/[0.03] border border-white/10 flex flex-col items-center justify-center mx-auto hover:bg-white/5 hover:border-rose-500/40 transition-all shadow-3xl"
          >
             <Heart className={cn(
               "w-16 h-16 transition-all duration-500",
               count > 0 ? "text-rose-500 fill-rose-500 scale-110 shadow-glow-rose" : "text-white/20",
               isJumping ? "animate-bounce" : ""
             )} />
             <motion.span 
               key={count}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="mt-4 text-xl font-black text-white"
             >
                {count.toLocaleString('ar-SA')} دعوة
             </motion.span>
          </motion.button>
       </div>
    </section>
  );
}
