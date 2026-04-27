
"use client"

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, HelpCircle, CheckCircle2, AlertCircle, 
  ArrowRight, ArrowLeft, Trophy, Sparkles,
  Zap, Info, RefreshCcw, Share2, Timer
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { Quiz, QuizQuestion } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useSync } from '@/hooks/useSync';

interface QuizDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  quiz: Quiz;
}

export function QuizDialog({ isOpen, onOpenChange, quiz }: QuizDialogProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds per question
  const { toast } = useToast();
  const { state, updateState } = useSync();

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / quiz.questions.length) * 100;

  // Timer logic
  useEffect(() => {
    if (isOpen && !isComplete && !isAnswered && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !isAnswered) {
      handleOptionSelect(-1); // Mark as wrong/skipped
    }
  }, [isOpen, isComplete, isAnswered, timeLeft]);

  const handleOptionSelect = (optionIndex: number) => {
    if (isAnswered) return;
    
    setSelectedOption(optionIndex);
    setIsAnswered(true);
    
    if (optionIndex === currentQuestion.correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeLeft(30);
    } else {
      setIsComplete(true);
      // Award points if score is good
      if (score >= quiz.questions.length / 2) {
          updateState({ points: (state.points || 0) + quiz.rewardPoints });
          toast({
              title: "إنجاز علمي جديد!",
              description: `لقد حصلت على ${quiz.rewardPoints} نقطة علمية.`,
          });
      }
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsComplete(false);
    setTimeLeft(30);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 border-0 bg-[#0a0a0a]/90 backdrop-blur-3xl overflow-hidden rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
        <DialogHeader className="sr-only">
          <DialogTitle>{quiz.title}</DialogTitle>
        </DialogHeader>

        <div className="relative flex flex-col h-[600px]">
          {/* Progress Header */}
          <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-primary/20 border border-primary/20 flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white font-headline">{quiz.title}</h3>
                <div className="flex items-center gap-2">
                   <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">
                     السؤال {currentQuestionIndex + 1} من {quiz.questions.length}
                   </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
               {!isComplete && (
                 <div className={cn(
                   "flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-colors",
                   timeLeft < 10 ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-white/5 border-white/10 text-white/40"
                 )}>
                   <Timer className="w-3.5 h-3.5" />
                   <span className="text-xs font-mono font-bold">{timeLeft}s</span>
                 </div>
               )}
               <button 
                onClick={() => onOpenChange(false)}
                className="p-2 hover:bg-white/5 rounded-xl text-white/20 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <Progress value={isComplete ? 100 : progress} className="h-1 rounded-none bg-white/5" />

          {/* Main Body */}
          <div className="flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar relative">
            <AnimatePresence mode="wait">
              {!isComplete ? (
                <motion.div
                  key={currentQuestionIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <h2 className="text-2xl md:text-3xl font-black text-white leading-tight text-center">
                    {currentQuestion.question}
                  </h2>

                  <div className="grid grid-cols-1 gap-3">
                    {currentQuestion.options.map((option, idx) => {
                      const isSelected = selectedOption === idx;
                      const isCorrect = idx === currentQuestion.correctAnswer;
                      const showResult = isAnswered;

                      return (
                        <button
                          key={idx}
                          disabled={isAnswered}
                          onClick={() => handleOptionSelect(idx)}
                          className={cn(
                            "group relative p-6 rounded-[1.5rem] border text-right transition-all duration-300",
                            !showResult && "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20",
                            showResult && isCorrect && "bg-emerald-500/10 border-emerald-500/40 text-emerald-400",
                            showResult && isSelected && !isCorrect && "bg-red-500/10 border-red-500/40 text-red-400",
                            showResult && !isSelected && !isCorrect && "bg-white/[0.02] border-white/5 text-white/20"
                          )}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <span className={cn(
                                "text-lg font-bold transition-all",
                                showResult && !isCorrect && !isSelected && "opacity-30"
                            )}>
                                {option}
                            </span>
                            <div className={cn(
                              "w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                              !showResult && "border-white/10 group-hover:border-primary/40",
                              showResult && isCorrect && "bg-emerald-500 border-emerald-500 text-black",
                              showResult && isSelected && !isCorrect && "bg-red-500 border-red-500 text-white"
                            )}>
                              {showResult && isCorrect && <CheckCircle2 className="w-5 h-5" />}
                              {showResult && isSelected && !isCorrect && <AlertCircle className="w-5 h-5" />}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {isAnswered && currentQuestion.explanation && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 rounded-2xl bg-primary/5 border border-primary/10 flex gap-4"
                    >
                      <Info className="w-5 h-5 text-primary shrink-0" />
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase text-primary tracking-widest">توضيح المعرفة</p>
                        <p className="text-sm text-white/70 leading-relaxed">{currentQuestion.explanation}</p>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center space-y-10"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full animate-pulse" />
                    <div className="relative w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/20 flex items-center justify-center shadow-2xl">
                      <Trophy className="w-16 h-16 text-primary drop-shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-4xl md:text-5xl font-black text-white font-headline italic tracking-tighter">
                      {score === quiz.questions.length ? "علامة كاملة!" : score > quiz.questions.length / 2 ? "أحسنت صنعاً!" : "حاول مجدداً!"}
                    </h2>
                    <p className="text-white/40 text-lg font-medium">
                      لقد أجبت بشكل صحيح على <span className="text-white font-black">{score}</span> من أصل <span className="text-white font-black">{quiz.questions.length}</span> أسئلة.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/5 text-center">
                        <Zap className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                        <div className="text-2xl font-black text-white">+{score >= quiz.questions.length / 2 ? quiz.rewardPoints : 0}</div>
                        <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">نقطة علمية</div>
                    </div>
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/5 text-center">
                        <Sparkles className="w-6 h-6 text-primary mx-auto mb-2" />
                        <div className="text-2xl font-black text-white">{Math.round((score / quiz.questions.length) * 100)}%</div>
                        <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">نسبة الإتقان</div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 w-full">
                    <Button 
                      onClick={resetQuiz} 
                      className="flex-1 h-14 rounded-2xl bg-white text-black hover:bg-zinc-200 font-black text-lg gap-3"
                    >
                      <RefreshCcw className="w-5 h-5" /> إعادة الاختبار
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex-1 h-14 rounded-2xl border-white/10 hover:bg-white/5 text-white font-black text-lg gap-3"
                    >
                      <Share2 className="w-5 h-5" /> مشاركة النتيجة
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Navigation */}
          {!isComplete && isAnswered && (
            <div className="p-6 bg-white/[0.02] border-t border-white/5 flex justify-end">
              <Button 
                onClick={nextQuestion}
                className="h-14 px-10 rounded-2xl bg-primary text-white font-black text-lg gap-3 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
              >
                {currentQuestionIndex < quiz.questions.length - 1 ? "السؤال التالي" : "عرض النتيجة"}
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
