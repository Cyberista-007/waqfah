'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ArrowRight, Trophy, Quote, Leaf, Heart, BookCheck } from 'lucide-react';
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
  
  const [isScanning, setIsScanning] = React.useState(false);
  const [scanStep, setScanStep] = React.useState(0);

  const handleAnswer = (index: number) => {
    setSelectedOption(index);
    setIsScanning(true);
    setScanStep(0);
    
    // Phase 1 -> Phase 2 (500ms)
    setTimeout(() => {
      setScanStep(1);
    }, 500);
    
    // Phase 2 -> Phase 3 (1000ms)
    setTimeout(() => {
      setScanStep(2);
    }, 1000);
    
    // Phase 3 -> Done (1500ms)
    setTimeout(() => {
      setIsScanning(false);
      if (index === QUIZ_QUESTIONS[currentQuestion].correct) setScore(prev => prev + 1);
      setShowResult(true);
    }, 1500);
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
            {/* Holographic Scan Overlay */}
            <AnimatePresence>
              {isScanning && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/85 backdrop-blur-2xl flex flex-col items-center justify-center z-50 p-8 text-center"
                >
                  <div className="relative w-40 h-40 mb-8 flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border border-dashed border-emerald-500/30 rounded-full"
                    />
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-4 border border-dashed border-emerald-500/20 rounded-full"
                    />
                    <div className="w-20 h-28 border-2 border-emerald-500/40 rounded-full bg-emerald-500/5 backdrop-blur-xl relative overflow-hidden flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                      <motion.div
                        animate={{ y: [-40, 100, -40] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_10px_#10b981]"
                      />
                      <BookCheck className="w-10 h-10 text-emerald-400/70" />
                    </div>
                  </div>
                  
                  <div className="space-y-4 max-w-sm w-full">
                    {[
                      { label: "البحث في دفاتر التاريخ...", icon: "📚" },
                      { label: "مطابقة الحقائق والوقائع...", icon: "⚖️" },
                      { label: "تأكيد المعلومة الصحيحة...", icon: "✅" }
                    ].map((step, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "flex items-center gap-4 px-6 py-3 rounded-full border transition-all duration-300 text-right",
                          scanStep === idx
                            ? "bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)] scale-105"
                            : scanStep > idx
                            ? "bg-white/5 border-white/10 text-white/40"
                            : "bg-white/[0.01] border-white/5 text-white/10"
                        )}
                      >
                        <span className="text-xl">{step.icon}</span>
                        <span className="font-bold text-sm md:text-base">{step.label}</span>
                        {scanStep > idx && (
                          <span className="mr-auto text-emerald-400 text-sm">✓</span>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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
                        disabled={showResult || isScanning}
                        onClick={() => handleAnswer(i)}
                        className={cn(
                          "py-6 px-10 rounded-full text-right font-black text-xl transition-all duration-300 border relative overflow-hidden group backdrop-blur-xl w-full",
                          selectedOption === i 
                            ? (i === QUIZ_QUESTIONS[currentQuestion].correct 
                                ? "bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.2)] scale-102" 
                                : "bg-rose-500/10 border-rose-500 text-rose-400 shadow-[0_0_25px_rgba(244,63,94,0.2)] scale-98") 
                            : "bg-white/[0.02] border-white/5 hover:border-white/20 text-white/60 hover:text-white hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:scale-102"
                        )}
                      >
                        <div className="flex items-center justify-between w-full gap-4">
                          <span className="text-right flex-1">{option}</span>
                          <div 
                            className={cn(
                              "w-4 h-4 rounded-full border flex-shrink-0 transition-all duration-300 flex items-center justify-center",
                              selectedOption === i 
                                ? (i === QUIZ_QUESTIONS[currentQuestion].correct 
                                    ? "bg-emerald-500 border-emerald-400 shadow-[0_0_10px_#10b981]" 
                                    : "bg-rose-500 border-rose-400 shadow-[0_0_10px_#f43f5e]")
                                : "bg-white/10 border-white/20 group-hover:bg-white/30"
                            )}
                          >
                            {selectedOption === i && (
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            )}
                          </div>
                        </div>
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
                         className="h-16 px-12 bg-white text-black rounded-full font-black text-lg hover:scale-105 transition-all shadow-glow-white mr-auto flex items-center gap-3"
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
                     <button onClick={restart} className="h-16 px-12 bg-white/5 border border-white/10 text-white rounded-full font-black hover:bg-white/10 transition-all">إعادة التحدي</button>
                     <button className="h-16 px-12 bg-emerald-500 text-black rounded-full font-black hover:scale-105 transition-all shadow-glow-emerald">شارك نتيجتك</button>
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
  const [isFormulating, setIsFormulating] = React.useState(false);
  const [formulationStep, setFormulationStep] = React.useState(0);

  const plantTree = () => {
    setIsFormulating(true);
    setFormulationStep(0);
    
    // Phase 1 -> Phase 2 (1000ms)
    setTimeout(() => {
      setFormulationStep(1);
    }, 1000);
    
    // Phase 2 -> Phase 3 (2000ms)
    setTimeout(() => {
      setFormulationStep(2);
    }, 2000);
    
    // Phase 3 -> Done (3000ms)
    setTimeout(() => {
      setIsFormulating(false);
      setIsPlanted(true);
    }, 3000);
  };

  return (
    <section className="py-40 relative overflow-hidden">
      <div className="container px-6 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto rounded-[5rem] bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-16 md:p-24 relative overflow-hidden shadow-3xl space-y-16"
        >
          {/* Formulation Overlay */}
          <AnimatePresence>
            {isFormulating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/85 backdrop-blur-2xl flex flex-col items-center justify-center z-50 p-8 text-center"
              >
                <div className="relative w-40 h-40 mb-8 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border border-emerald-500/20 rounded-full"
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-2 border-2 border-dashed border-emerald-500/10 rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-24 h-24 rounded-full bg-emerald-500/5 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.1)]"
                  >
                    <Leaf className="w-10 h-10 text-emerald-400 animate-pulse" />
                  </motion.div>
                </div>

                <div className="space-y-4 max-w-sm w-full">
                  {[
                    { label: "تهيئة التربة المباركة...", icon: "🌱" },
                    { label: "سقاية الغرسة بماء الذاكرة...", icon: "💧" },
                    { label: "إنبات شجرة الزيتون المباركة...", icon: "🌳" }
                  ].map((step, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex items-center gap-4 px-6 py-3 rounded-full border transition-all duration-300 text-right",
                        formulationStep === idx
                          ? "bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)] scale-105"
                          : formulationStep > idx
                          ? "bg-white/5 border-white/10 text-white/40"
                          : "bg-white/[0.01] border-white/5 text-white/10"
                      )}
                    >
                      <span className="text-xl">{step.icon}</span>
                      <span className="font-bold text-sm md:text-base">{step.label}</span>
                      {formulationStep > idx && (
                        <span className="mr-auto text-emerald-400 text-sm">✓</span>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-6 relative z-10">
            <h2 className="text-4xl md:text-7xl font-black">ازرع <span className="text-emerald-500">زيتونة</span> للأمل المستمر</h2>
            <p className="text-2xl text-white/40 font-medium">شجرة الزيتون هي أعظم رمز للصمود الفلسطيني؛ فهي لا تموت، تضرب جذورها في التاريخ، وتثمر خيراً للأجيال. ازرع زيتونة رمزية الآن.</p>
          </div>

          <div className="relative h-96 flex items-center justify-center relative z-10">
             <AnimatePresence mode="wait">
                {!isPlanted ? (
                  <motion.button
                    key="seed"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={plantTree}
                    className="group relative h-20 px-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-black text-xl hover:bg-emerald-500/20 hover:text-white transition-all shadow-[0_0_30px_rgba(16,185,129,0.15)] flex items-center justify-center gap-4 cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-emerald-500/5 rounded-full animate-pulse pointer-events-none" />
                    <Leaf className="w-7 h-7 text-emerald-400 group-hover:scale-110 transition-transform" />
                    <span className="tracking-wide">ازرع زيتونة الأمل</span>
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981] animate-ping ml-2" />
                  </motion.button>
                ) : (
                  <motion.div
                    key="tree"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 100, damping: 15 }}
                    className="flex flex-col items-center gap-8 w-full"
                  >
                     {/* Glowing Glass Dome Container */}
                     <div className="relative w-80 h-[22rem] border-t border-x border-white/10 rounded-t-full bg-gradient-to-b from-white/[0.04] to-transparent p-6 overflow-hidden shadow-[0_-15px_30px_rgba(16,185,129,0.05)] backdrop-blur-md flex flex-col items-center justify-end">
                        {/* Base of the dome */}
                        <div className="absolute bottom-0 left-0 right-0 h-4 bg-emerald-950/40 border-t border-white/10 rounded-b-md" />
                        
                        {/* Floating Leaf Particles */}
                        {Array.from({ length: 12 }).map((_, idx) => {
                          const randomX = Math.random() * 200 - 100;
                          const randomDuration = 4 + Math.random() * 4;
                          const randomDelay = Math.random() * 4;
                          const randomScale = 0.4 + Math.random() * 0.7;
                          return (
                            <motion.div
                              key={idx}
                              initial={{ y: 150, x: randomX, opacity: 0, scale: randomScale, rotate: 0 }}
                              animate={{
                                y: [-20, -280],
                                x: [randomX, randomX + (Math.random() * 40 - 20), randomX],
                                opacity: [0, 0.7, 0.7, 0],
                                rotate: [0, 360]
                              }}
                              transition={{
                                duration: randomDuration,
                                repeat: Infinity,
                                delay: randomDelay,
                                ease: "easeOut"
                              }}
                              className="absolute bottom-4 text-emerald-500/40 pointer-events-none"
                            >
                              <Leaf className="w-4 h-4 fill-emerald-500/20" />
                            </motion.div>
                          );
                        })}
                        
                        {/* The Tree Mockup */}
                        <div className="relative z-10 flex flex-col items-center pb-2">
                           <motion.div
                             animate={{ 
                               rotate: [-1, 1, -1],
                               y: [-2, 2, -2]
                             }}
                             transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                             className="relative"
                           >
                             <Image src="/palestine_landscape_olive_trees_1777280376366.png" alt="Planted Olive Tree" width={180} height={180} className="rounded-full border-2 border-emerald-500/20 shadow-3xl" />
                             <div className="absolute inset-0 rounded-full bg-emerald-500/5 mix-blend-color-dodge blur-xl pointer-events-none" />
                           </motion.div>
                           <div className="w-1.5 h-10 bg-emerald-900/60 rounded-full -mt-2 shadow-glow-emerald" />
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
            whileTap={{ scale: 0.95 }}
            onClick={increment}
            className="group relative py-6 px-16 rounded-full border bg-rose-500/10 border-rose-500/30 text-rose-400 transition-all duration-300 shadow-[0_0_30px_rgba(244,63,94,0.15)] mx-auto flex items-center justify-between gap-8 max-w-md w-full overflow-hidden"
          >
             {/* Glowing aura */}
             <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
             
             <div className="flex items-center gap-4 relative z-10">
               <Heart className={cn(
                 "w-8 h-8 transition-all duration-500",
                 count > 0 ? "text-rose-500 fill-rose-500 scale-110" : "text-rose-400/50",
                 isJumping ? "scale-125" : ""
               )} />
               <span className="text-xl font-black text-white">أرسل دعاء بالثبات والصمود</span>
             </div>

             <motion.div 
               key={count}
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               className="relative z-10 bg-rose-500/20 px-5 py-2 rounded-full border border-rose-500/30 text-rose-300 font-mono text-lg font-black flex items-center gap-2"
             >
                <span>{count.toLocaleString('ar-SA')}</span>
                <span className="text-xs font-bold font-sans">دعوة</span>
             </motion.div>
          </motion.button>
       </div>
    </section>
  );
}
