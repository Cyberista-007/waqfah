"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin, Send, MessageSquare, Sparkles, Globe, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function ContactPage() {
  return (
    <div className="min-h-screen pb-32 overflow-x-hidden">
      {/* ── Background Atmos ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/5 blur-[150px] rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full -translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="container relative z-10">
        <header className="text-center pt-20 pb-16">
            <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-[0.4em] mb-8"
            >
                <MessageSquare className="w-4 h-4" /> جسر التواصل
            </motion.div>
            <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-6xl md:text-8xl font-black font-headline tracking-tighter text-white mb-6"
            >
                تواصل <span className="text-transparent bg-clip-text bg-gradient-to-l from-indigo-300 via-indigo-500 to-emerald-500 italic">معنا</span>
            </motion.h1>
            <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="max-w-2xl mx-auto text-xl text-white/40 font-medium leading-relaxed italic"
            >
                نسعد دائماً باستقبال اقتراحاتكم، استفساراتكم، وطلبات الانضمام لفريق العمل. نحن هنا لنسمع منكم.
            </motion.p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 max-w-6xl mx-auto">
            {/* ── Contact Info Cards ── */}
            <div className="lg:col-span-2 space-y-6">
                {[
                    { label: 'البريد الإلكتروني', value: 'contact@waqfah.com', icon: Mail, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                    { label: 'واتساب الدعم', value: '+20 123 456 789', icon: Phone, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                    { label: 'المقر الرئيسي', value: 'القاهرة، جمهورية مصر العربية', icon: MapPin, color: 'text-sky-400', bg: 'bg-sky-500/10' },
                    { label: 'ساعات العمل', value: 'الأحد - الخميس (9ص - 5م)', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                ].map((item, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 backdrop-blur-3xl group hover:bg-white/[0.05] transition-all"
                    >
                        <div className="flex items-center gap-6">
                            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12 group-hover:scale-110", item.bg)}>
                                <item.icon className={cn("w-6 h-6", item.color)} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">{item.label}</p>
                                <p className="text-lg font-bold text-white group-hover:text-primary transition-colors">{item.value}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {/* Extra Branding */}
                <div className="pt-8 flex items-center gap-4 opacity-20">
                    <Sparkles className="w-6 h-6" />
                    <div className="h-px flex-1 bg-white" />
                    <Globe className="w-6 h-6" />
                </div>
            </div>

            {/* ── Contact Form ── */}
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="lg:col-span-3 p-10 md:p-12 rounded-[3.5rem] bg-white/[0.03] backdrop-blur-3xl border border-white/10 shadow-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                
                <form className="space-y-8 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <Label className="text-xs font-black text-white/30 uppercase tracking-widest mr-2" htmlFor="name">الاسم بالكامل</Label>
                            <Input id="name" name="name" required placeholder="محمد أحمد..." className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-white placeholder:text-white/10 focus:bg-white/10 transition-all" />
                        </div>
                        <div className="space-y-3">
                            <Label className="text-xs font-black text-white/30 uppercase tracking-widest mr-2" htmlFor="email">البريد الإلكتروني</Label>
                            <Input id="email" name="email" type="email" required placeholder="example@email.com" className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-white placeholder:text-white/10 focus:bg-white/10 transition-all" />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-xs font-black text-white/30 uppercase tracking-widest mr-2" htmlFor="subject">الموضوع</Label>
                        <Input id="subject" name="subject" required placeholder="ما هو استفسارك؟" className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-white placeholder:text-white/10 focus:bg-white/10 transition-all" />
                    </div>

                    <div className="space-y-3">
                        <Label className="text-xs font-black text-white/30 uppercase tracking-widest mr-2" htmlFor="message">رسالتك</Label>
                        <Textarea id="message" name="message" rows={6} required placeholder="اكتب لنا تفاصيل رسالتك هنا..." className="bg-white/5 border-white/5 rounded-[2rem] p-6 text-white placeholder:text-white/10 focus:bg-white/10 transition-all resize-none" />
                    </div>

                    <Button type="submit" className="w-full h-16 rounded-[2rem] bg-white text-black text-xl font-black font-headline hover:bg-zinc-200 transition-all shadow-xl shadow-white/5 group">
                        <span className="flex items-center gap-3">
                            إرسال الرسالة الآن
                            <Send className="w-5 h-5 group-hover:translate-x-[-10px] group-hover:-translate-y-1 transition-transform" />
                        </span>
                    </Button>
                </form>
            </motion.div>
        </div>
      </div>
    </div>
  );
}

