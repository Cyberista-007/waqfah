'use client';

import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Heart,
  HelpCircle,
  Loader2,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  TreePine,
  Trophy,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { QUIZ_QUESTIONS } from './constants';

const PALESTINE_DUAS = [
  'اللهم احفظ المسجد الأقصى وأهله المرابطين، واجعله شامخاً عزيزاً إلى يوم الدين.',
  'اللهم كن لأهلنا في غزة وفلسطين عوناً ونصيراً، واربط على قلوبهم، وتقبل شهداءهم، واشفِ جرحاهم.',
  'اللهم أقرّ أعيننا بتحرير المسجد الأقصى وصلاةٍ فيه آمنين مطمئنين.',
];

export function ActionAndQuizTab() {
  const { toast } = useToast();

  // Solidarity Pledge State
  const [pledgeCount, setPledgeCount] = useState<number | null>(null);
  const [pledgedName, setPledgedName] = useState('');
  const [pledgeStatus, setPledgeStatus] = useState<'idle' | 'pledged' | 'already_pledged' | 'error'>('idle');
  const [isSubmittingPledge, setIsSubmittingPledge] = useState(false);

  // Dua & Symbolic Olive Tree State
  const [duaCount, setDuaCount] = useState(0);
  const [plantedTrees, setPlantedTrees] = useState(0);

  // Knowledge Quiz State
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  useEffect(() => {
    fetch('/api/palestine/pledge')
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.count === 'number') setPledgeCount(data.count);
      })
      .catch(() => setPledgeCount(null));

    const savedStatus = localStorage.getItem('palestine_pledge_status');
    const savedName = localStorage.getItem('palestine_pledged_name');
    if (savedStatus === 'true') {
      setPledgeStatus('already_pledged');
      if (savedName) setPledgedName(savedName);
    }

    const savedDuas = Number(localStorage.getItem('palestine_dua_count') || '0');
    const savedTrees = Number(localStorage.getItem('palestine_olive_trees') || '0');
    if (!Number.isNaN(savedDuas)) setDuaCount(savedDuas);
    if (!Number.isNaN(savedTrees)) setPlantedTrees(savedTrees);
  }, []);

  const handlePledgeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingPledge || pledgeStatus === 'pledged' || pledgeStatus === 'already_pledged') return;

    setIsSubmittingPledge(true);
    try {
      const res = await fetch('/api/palestine/pledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: pledgedName.trim() }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setPledgeStatus('pledged');
        if (typeof data.count === 'number') setPledgeCount(data.count);
        localStorage.setItem('palestine_pledge_status', 'true');
        if (pledgedName.trim()) localStorage.setItem('palestine_pledged_name', pledgedName.trim());
        toast({ title: 'تم تسجيل تعهدك بنجاح', description: 'جزاك الله خيراً على موقفك التضامني.' });
      } else if (res.status === 409 || data.alreadyPledged) {
        setPledgeStatus('already_pledged');
        localStorage.setItem('palestine_pledge_status', 'true');
        toast({ title: 'تم تسجيل دعمك مسبقاً', description: data.message });
      } else {
        throw new Error(data.message || 'تعذر تسجيل التعهد حالياً');
      }
    } catch (err: unknown) {
      setPledgeStatus('error');
      toast({
        variant: 'destructive',
        title: 'تعذر الإرسال',
        description: err instanceof Error ? err.message : 'حاول مرة أخرى',
      });
    } finally {
      setIsSubmittingPledge(false);
    }
  };

  const handleDuaClick = () => {
    const next = duaCount + 1;
    setDuaCount(next);
    localStorage.setItem('palestine_dua_count', String(next));
  };

  const handlePlantTree = () => {
    const next = plantedTrees + 1;
    setPlantedTrees(next);
    localStorage.setItem('palestine_olive_trees', String(next));
    toast({ title: 'غُرست شجرة زيتون جديدة', description: `إجمالي أشجارك الرمزية: ${next}` });
  };

  const handleCopyDua = (text: string) => {
    navigator.clipboard?.writeText(text);
    toast({ title: 'تم نسخ الدعاء' });
  };

  const activeQuestion = QUIZ_QUESTIONS[questionIndex];

  const handleSelectQuizOption = (idx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    if (idx === activeQuestion.correct) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (questionIndex < QUIZ_QUESTIONS.length - 1) {
      setQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setShowHint(false);
    } else {
      setQuizFinished(true);
    }
  };

  const resetQuiz = () => {
    setQuestionIndex(0);
    setSelectedOption(null);
    setShowHint(false);
    setScore(0);
    setQuizFinished(false);
  };

  return (
    <div className="space-y-8">
      {/* Row 1: Pledge + Dua/Olive Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Solidarity Pledge */}
        <Card className="lg:col-span-7 bg-card/85 border-border rounded-3xl shadow-sm">
          <CardHeader className="border-b border-border/60 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="text-xl font-black text-foreground flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <span>ميثاق الوفاء والتضامن</span>
              </CardTitle>
              {pledgeCount !== null && (
                <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {pledgeCount.toLocaleString('ar-EG')} متضامن مسجّل
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            <p className="text-sm text-muted-foreground leading-relaxed">
              وقّع على عهد الثبات على نشر الوعي بالحق الفلسطيني، والدعاء المستمر لأهلنا المرابطين في القدس وغزة وسائر فلسطين.
            </p>

            {pledgeStatus === 'pledged' || pledgeStatus === 'already_pledged' ? (
              <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-foreground">
                    {pledgedName ? `شكراً لك يا ${pledgedName} — تم توثيق عهدك` : 'تم توثيق موقفك التضامني بنجاح'}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    كل توقيع يذكّرنا بأن قضية فلسطين حيّة في القلوب.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePledgeSubmit} className="flex flex-col sm:flex-row gap-3">
                <Input
                  value={pledgedName}
                  onChange={(e) => setPledgedName(e.target.value)}
                  placeholder="اكتب اسمك أو كنيتك (اختياري)..."
                  maxLength={60}
                  className="bg-background border-border rounded-xl h-11 flex-1"
                />
                <Button
                  type="submit"
                  disabled={isSubmittingPledge}
                  className="rounded-xl h-11 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shrink-0"
                >
                  {isSubmittingPledge ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin me-2" />
                      جارٍ التسجيل...
                    </>
                  ) : (
                    'توقيع الميثاق'
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Dua Counter & Olive Tree */}
        <Card className="lg:col-span-5 bg-card/85 border-border rounded-3xl shadow-sm">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle className="text-xl font-black text-foreground flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" />
              <span>عداد الدعاء وغرس الزيتون</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-border bg-muted/35 text-center space-y-3">
              <div className="text-3xl font-black text-rose-500">{duaCount}</div>
              <p className="text-xs text-muted-foreground font-bold">دعوة صادقة لأهل فلسطين</p>
              <Button
                type="button"
                onClick={handleDuaClick}
                size="sm"
                className="w-full rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
              >
                آمين / تسجيل دعوة
              </Button>
            </div>

            <div className="p-4 rounded-2xl border border-border bg-muted/35 text-center space-y-3">
              <div className="text-3xl font-black text-emerald-500 flex items-center justify-center gap-1.5">
                <TreePine className="w-6 h-6" />
                <span>{plantedTrees}</span>
              </div>
              <p className="text-xs text-muted-foreground font-bold">شجرة زيتون مغروسة</p>
              <Button
                type="button"
                onClick={handlePlantTree}
                size="sm"
                variant="outline"
                className="w-full rounded-xl font-bold text-xs border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
              >
                + اغرس شجرة
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Copyable Duas + Knowledge Quiz */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Selected Duas */}
        <Card className="lg:col-span-5 bg-card/85 border-border rounded-3xl shadow-sm">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle className="text-lg font-black text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>أدعية للمسجد الأقصى وغزة</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {PALESTINE_DUAS.map((dua, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl border border-border bg-muted/35 space-y-2.5"
              >
                <p className="text-sm font-bold text-foreground leading-relaxed">{dua}</p>
                <button
                  type="button"
                  onClick={() => handleCopyDua(dua)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ الدعاء</span>
                </button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Knowledge Quiz */}
        <Card className="lg:col-span-7 bg-card/85 border-border rounded-3xl shadow-sm">
          <CardHeader className="border-b border-border/60 pb-4">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-lg font-black text-foreground flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <span>اختبر معرفتك بتاريخ وجغرافية فلسطين</span>
              </CardTitle>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                {quizFinished ? `${score} / ${QUIZ_QUESTIONS.length}` : `${questionIndex + 1} / ${QUIZ_QUESTIONS.length}`}
              </span>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {quizFinished ? (
              <div className="text-center py-6 space-y-4">
                <Trophy className="w-12 h-12 text-amber-500 mx-auto" />
                <h3 className="text-2xl font-black text-foreground">
                  أتممت الاختبار بنتيجة {score} من {QUIZ_QUESTIONS.length}
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  الوعي بتاريخ الأرض ومدنها ومعالمها ركيزة أساسية في حفظ الهوية ونقل الرواية للأجيال.
                </p>
                <Button type="button" onClick={resetQuiz} className="rounded-xl gap-2 font-bold">
                  <RotateCcw className="w-4 h-4" />
                  <span>إعادة الاختبار</span>
                </Button>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg sm:text-xl font-black text-foreground leading-snug">
                    {activeQuestion.question}
                  </h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHint((prev) => !prev)}
                    className="rounded-xl text-xs font-bold gap-1 text-muted-foreground shrink-0"
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span>تلميح</span>
                  </Button>
                </div>

                {showHint && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-medium text-amber-600 dark:text-amber-400">
                    {activeQuestion.hint}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeQuestion.options.map((opt, idx) => {
                    const isPicked = selectedOption === idx;
                    const isCorrect = idx === activeQuestion.correct;
                    const hasAnswered = selectedOption !== null;

                    return (
                      <button
                        key={opt}
                        type="button"
                        disabled={hasAnswered}
                        onClick={() => handleSelectQuizOption(idx)}
                        className={cn(
                          'p-3.5 rounded-xl border text-right text-sm font-bold transition-all',
                          hasAnswered
                            ? isCorrect
                              ? 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                              : isPicked
                              ? 'bg-rose-500/15 border-rose-500 text-rose-500'
                              : 'bg-muted/30 border-border text-muted-foreground opacity-65'
                            : 'bg-background/80 border-border text-foreground hover:bg-muted hover:border-primary/40'
                        )}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {selectedOption !== null && (
                  <div className="p-4 rounded-2xl border border-border bg-muted/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                      <strong className="text-primary me-1">التوضيح:</strong>
                      {activeQuestion.explanation}
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleNextQuestion}
                      className="rounded-xl font-bold shrink-0"
                    >
                      {questionIndex < QUIZ_QUESTIONS.length - 1 ? 'السؤال التالي' : 'عرض النتيجة'}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
