'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { QAPair } from '@/lib/types';
import { useCollection } from '@/firebase';
import { Loader2, HelpCircle, MessageSquare, Search, Send, Sparkles, Heart, HelpCircle as QuestionIcon, ArrowLeft, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import Fuse from 'fuse.js';
import { normalizeArabic } from '@/lib/utils';
import { ImanCardGenerator } from '@/components/iman-card-generator';

export default function QAPage() {
  const { data: qanda, isLoading } = useCollection<QAPair>('question_answers');
  const [searchTerm, setSearchTerm] = useState("");

  const filteredQA = useMemo(() => {
    if (!qanda) return [];
    if (!searchTerm) return qanda;

    const fuse = new Fuse(qanda, {
      keys: ['question', 'answer'],
      threshold: 0.4
    });

    const normalizedSearch = normalizeArabic(searchTerm);
    return fuse.search(normalizedSearch).map(r => r.item);
  }, [qanda, searchTerm]);

  return (
    <div className="min-h-screen pb-32 overflow-hidden">
      {/* 🎭 Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-500/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="container relative z-10 px-4">
        {/* 🏛️ Hero Section */}
        <section className="pt-20 pb-16 text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-6 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full shadow-inner"
          >
            <HelpCircle className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-primary/80 italic">Faith & Knowledge Guidance</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-black font-headline tracking-tighter leading-tight"
          >
            سُؤال <span className="text-primary italic">وَجَواب</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-zinc-400 font-medium leading-relaxed max-w-2xl mx-auto"
          >
            اسأل عما يشغل بالك في أمور دينك ودنياك، واحصل على إجابات موثقة ومبسطة من هدي الكتاب والسنة.
          </motion.p>
        </section>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 mt-12">
          
          {/* 📬 Ask Question Form (Left Side) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-5"
          >
            <Card className="border-white/5 bg-white/[0.02] backdrop-blur-3xl rounded-[3rem] overflow-hidden sticky top-32">
              <CardContent className="p-10 space-y-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
                    <MessageSquare className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black font-headline">طرح استفسار</h3>
                    <p className="text-white/20 text-xs font-bold uppercase tracking-widest">إجابات موثقة بإذن الله</p>
                  </div>
                </div>

                <form className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="qa-name" className="text-xs font-black uppercase tracking-widest text-white/40 mr-2">الاسم (اختياري)</Label>
                    <Input 
                      type="text" 
                      id="qa-name" 
                      placeholder="كيف نحب أن نناديك؟" 
                      className="h-14 bg-white/5 border-white/5 rounded-2xl focus:bg-white/10 focus:ring-4 focus:ring-primary/10 transition-all font-bold"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="qa-question" className="text-xs font-black uppercase tracking-widest text-white/40 mr-2">سؤالك</Label>
                    <Textarea 
                      id="qa-question" 
                      placeholder="اكتب سؤالك هنا بكل وضوح..." 
                      required 
                      className="min-h-[180px] bg-white/5 border-white/5 rounded-2xl focus:bg-white/10 focus:ring-4 focus:ring-primary/10 transition-all font-bold p-6 leading-relaxed"
                    />
                  </div>
                  <Button type="submit" className="w-full h-16 rounded-2xl bg-primary text-white font-black text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 gap-3">
                    إرسال السؤال
                    <Send className="w-5 h-5 -rotate-45" />
                  </Button>
                </form>

                <div className="pt-6 border-t border-white/5 flex items-center gap-3 text-white/20">
                  <Info className="w-4 h-4" />
                  <p className="text-[10px] font-bold leading-relaxed">سيتم مراجعة سؤالك والإجابة عليه في أقرب وقت ممكن. سيتم عرض الأسئلة العامة فقط.</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 🔍 FAQ & Search (Right Side) */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-7 space-y-10"
          >
            {/* Search Hub */}
            <div className="relative group/search">
              <Search className="absolute right-6 top-1/2 -translate-y-1/2 h-6 w-6 text-white/20 group-focus-within/search:text-primary transition-all duration-300" />
              <Input 
                placeholder="ابحث في الأسئلة الشائعة..." 
                className="pr-16 h-20 bg-white/5 border-white/10 rounded-[2rem] focus:bg-white/10 focus:ring-8 focus:ring-primary/5 focus:border-primary/50 transition-all font-black text-xl shadow-2xl text-right"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between px-6">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <h2 className="text-3xl font-black font-headline">الأسئلة الشائعة</h2>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/20">نتائج البحث: {filteredQA.length}</span>
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center p-20 space-y-4">
                  <Loader2 className="animate-spin h-10 w-10 text-primary" />
                  <p className="text-white/20 font-black uppercase tracking-widest text-[10px]">جاري تحميل الحكمة...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredQA.length > 0 ? (
                    <Accordion type="single" collapsible className="w-full space-y-4 border-none">
                      {filteredQA.map((item, idx) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <AccordionItem 
                            value={item.id} 
                            className="border-white/5 bg-white/[0.03] backdrop-blur-md rounded-[2rem] px-8 overflow-hidden transition-all hover:bg-white/[0.05] hover:border-white/10 group data-[state=open]:bg-primary/[0.05] data-[state=open]:border-primary/20"
                          >
                            <AccordionTrigger className="text-xl md:text-2xl text-right font-black font-headline hover:no-underline py-8 gap-4">
                              <span className="flex-1 text-right leading-tight group-hover:text-primary transition-colors">{item.question}</span>
                            </AccordionTrigger>
                            <AccordionContent className="text-lg text-white/50 leading-[2] font-medium pb-8 border-t border-white/5 pt-6 animate-in slide-in-from-top-2 duration-500 space-y-6">
                              <div className="flex gap-4">
                                <div className="w-1 bg-primary/20 rounded-full shrink-0" />
                                <div className="flex-1">{item.answer}</div>
                              </div>
                              <div className="flex justify-end pt-4 border-t border-white/5">
                                <ImanCardGenerator 
                                  title="سؤال وجواب"
                                  content={item.question}
                                  secondaryContent={item.answer}
                                  source="فتاوى واستشارات - منصة وقفة"
                                />
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </motion.div>
                      ))}
                    </Accordion>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-24 bg-white/5 border-2 border-dashed border-white/10 rounded-[3rem] space-y-6"
                    >
                      <div className="flex justify-center">
                        <QuestionIcon className="h-16 w-16 text-white/10" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-2xl font-black text-white/40">لم نجد إجابة لهذا التساؤل بعد</p>
                        <p className="text-sm text-white/20 font-medium">حاول البحث بكلمات أخرى أو أرسل سؤالك لنجيبك عليه.</p>
                      </div>
                      <Button variant="outline" onClick={() => setSearchTerm('')} className="rounded-xl px-8 border-white/10 font-black">إظهار الكل</Button>
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            {/* 💎 Achievement/Motivation Card */}
            <div className="p-10 rounded-[3rem] bg-gradient-to-br from-primary/20 to-transparent border border-primary/20 space-y-6 overflow-hidden relative group">
              <Sparkles className="absolute -top-10 -right-10 w-40 h-40 text-primary/10 group-hover:scale-125 transition-transform duration-1000" />
              <h4 className="text-2xl font-black font-headline text-white relative z-10">"فَاسْأَلُوا أَهْلَ الذِّكْرِ إِن كُنتُمْ لَا تَعْلَمُونَ"</h4>
              <p className="text-white/40 text-lg leading-relaxed relative z-10">طلب العلم فريضة، والسؤال هو مفتاح المعرفة. لا تتردد في طلب الفهم لتعيش على بصيرة ونور من الله.</p>
              <div className="flex items-center gap-4 pt-4 relative z-10">
                <div className="flex -space-x-3 rtl:space-x-reverse">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-zinc-950 bg-zinc-800 flex items-center justify-center overflow-hidden">
                       <img src={`https://i.pravatar.cc/100?u=${i+10}`} alt="avatar" className="w-full h-full object-cover grayscale opacity-50" />
                    </div>
                  ))}
                </div>
                <p className="text-xs font-black text-primary/60 uppercase tracking-widest">+500 مستفيد اليوم</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

