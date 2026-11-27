'use client';

import { useState, useMemo, FormEvent } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCollection } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  HelpCircle,
  MessageSquare,
  Search,
  Send,
  Sparkles,
  Info,
  X,
} from 'lucide-react';
import Fuse from 'fuse.js';
import { normalizeArabic } from '@/lib/utils';
import { ImanCardGenerator } from '@/components/iman-card-generator';
import { useTranslation } from '@/lib/i18n';
import type { QAPair } from '@/lib/types';

export default function QAPage() {
  const { t, isRtl } = useTranslation();
  const { toast } = useToast();
  const { data: qanda, isLoading } = useCollection<QAPair>('question_answers');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredQA = useMemo(() => {
    if (!qanda) return [];
    if (!searchTerm.trim()) return qanda;

    const fuse = new Fuse(qanda, {
      keys: ['question', 'answer'],
      threshold: 0.4,
    });

    const normalizedSearch = normalizeArabic(searchTerm);
    return fuse.search(normalizedSearch).map((r) => r.item);
  }, [qanda, searchTerm]);

  const handleAskSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast({
      title: t('تم استلام سؤالك بنجاح', 'Question submitted'),
      description: t(
        'سيتم مراجعة استفسارك والإجابة عليه في أقرب وقت بإذن الله.',
        'Your question will be reviewed and answered shortly.'
      ),
    });
    e.currentTarget.reset();
  };

  return (
    <div className="min-h-screen pb-20" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-3 sm:px-6 pt-6 md:pt-10 space-y-10 max-w-6xl">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/60">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{t('الفتاوى والاستشارات العلمية', 'Islamic Q&A Guidance')}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-headline text-foreground tracking-tight">
              {t('سؤال', 'Questions')} <span className="text-primary">{t('وجواب', '& Answers')}</span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed">
              {t(
                'اسأل عما يشغل بالك في أمور دينك ودنياك، وتصفح الإجابات الموثقة من هدي الكتاب والسنة.',
                'Browse verified answers and submit your questions in light of the Quran and Sunnah.'
              )}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card border border-border text-foreground text-xs font-bold shadow-sm self-start md:self-auto">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>{qanda?.length || 0} {t('سؤال مجاب', 'Answered Questions')}</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Ask Form */}
          <div className="lg:col-span-5 bg-card/80 border border-border rounded-3xl p-6 shadow-sm space-y-5 lg:sticky lg:top-24">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">{t('طرح استفسار جديد', 'Ask a Question')}</h2>
                <p className="text-xs text-muted-foreground">{t('إجابات موثقة بإذن الله', 'Verified answers')}</p>
              </div>
            </div>

            <form onSubmit={handleAskSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="qa-name" className="text-xs font-bold text-muted-foreground">
                  {t('الاسم (اختياري)', 'Name (optional)')}
                </Label>
                <Input
                  type="text"
                  id="qa-name"
                  placeholder={t('كيف نحب أن نناديك؟', 'Your name...')}
                  className="h-11 bg-background border-border rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="qa-question" className="text-xs font-bold text-muted-foreground">
                  {t('سؤالك', 'Your question')}
                </Label>
                <Textarea
                  id="qa-question"
                  placeholder={t('اكتب سؤالك هنا بكل وضوح...', 'Write your question clearly...')}
                  required
                  rows={5}
                  className="bg-background border-border rounded-2xl resize-none"
                />
              </div>

              <Button type="submit" className="w-full h-11 rounded-xl font-bold gap-2">
                <Send className="w-4 h-4" />
                <span>{t('إرسال السؤال', 'Submit Question')}</span>
              </Button>
            </form>

            <div className="pt-4 border-t border-border/60 flex items-start gap-2.5 text-muted-foreground">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed">
                {t(
                  'تُراجع الأسئلة قبل نشرها، وتُعرض الأسئلة ذات الفائدة العامة.',
                  'Questions are reviewed prior to publication; public-interest answers appear here.'
                )}
              </p>
            </div>
          </div>

          {/* Search & FAQ Accordion */}
          <div className="lg:col-span-7 space-y-5">
            <div className="relative">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder={t('ابحث في الأسئلة والأجوبة...', 'Search questions & answers...')}
                className="pr-10 pl-9 h-12 bg-card border-border rounded-2xl text-sm font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
                <p className="text-xs font-bold text-muted-foreground">{t('جاري تحميل الأسئلة...', 'Loading Q&A...')}</p>
              </div>
            ) : filteredQA.length > 0 ? (
              <Accordion type="single" collapsible className="w-full space-y-3">
                {filteredQA.map((item) => (
                  <AccordionItem
                    key={item.id}
                    value={item.id}
                    className="border border-border bg-card/80 rounded-2xl px-5 overflow-hidden data-[state=open]:border-primary/40 transition-colors"
                  >
                    <AccordionTrigger className="text-base md:text-lg text-right font-bold hover:no-underline py-4 gap-4">
                      <span className="flex-1 leading-snug">{item.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-sm md:text-base text-muted-foreground leading-relaxed pb-5 border-t border-border/50 pt-4 space-y-4">
                      <p className="whitespace-pre-line text-foreground/90">{item.answer}</p>
                      <div className="flex justify-end pt-2 border-t border-border/50">
                        <ImanCardGenerator
                          title={t('سؤال وجواب', 'Q&A')}
                          content={item.question}
                          secondaryContent={item.answer}
                          source={t('فتاوى واستشارات - منصة وقفة', 'Waqfah Q&A')}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="text-center py-16 bg-card/50 border border-dashed border-border rounded-3xl space-y-3">
                <HelpCircle className="h-10 w-10 text-muted-foreground/40 mx-auto" />
                <p className="text-base font-bold text-foreground">
                  {t('لم نجد إجابة مطابقة لبحثك', 'No matching questions found')}
                </p>
                {searchTerm && (
                  <Button variant="outline" onClick={() => setSearchTerm('')} className="rounded-xl font-bold">
                    {t('إظهار الكل', 'Show all')}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
