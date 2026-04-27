
"use client"

import { motion } from 'framer-motion';
import { 
  Radio, Users, MessageCircle, Share2, 
  Heart, Calendar, Play, Bell, Info, 
  Sparkles, Youtube, ExternalLink, Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function LivePage() {
  return (
    <div className="min-h-screen pb-20 space-y-16">
      {/* Cinematic Hero Section */}
      <section className="relative mx-4 sm:mx-8 mt-4 sm:mt-8 pt-32 pb-20 flex flex-col items-center text-center overflow-hidden border border-white/10 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl">
        {/* Dynamic Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-zinc-950" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-red-500/10 blur-[120px] rounded-full opacity-20" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="container px-4 space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">
            <Radio className="w-3.5 h-3.5" /> البث المباشر الآن
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black font-headline tracking-tighter text-white">
            مجالس <span className="text-red-500 italic">الذِّكرِ المباشرة</span>
          </h1>
          
          <p className="text-xl text-white/30 max-w-2xl mx-auto font-medium leading-relaxed italic">
            شارك في الدروس المباشرة، اسأل المشايخ، وتفاعل مع طلاب العلم من كل مكان في الوقت الحقيقي.
          </p>
        </motion.div>
      </section>

      {/* Main Live Player Section */}
      <section className="container px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Player Area */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2 space-y-8"
          >
            <div className="relative aspect-video rounded-[3rem] overflow-hidden border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] ring-1 ring-white/5 bg-zinc-900 group">
                {/* Simulated Player Background */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12 bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950">
                   <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                      <Youtube className="w-12 h-12 text-red-600" />
                   </div>
                   <h3 className="text-2xl font-black text-white mb-4">لا يوجد بث مباشر حالياً</h3>
                   <p className="text-white/30 max-w-xs mx-auto text-sm font-medium">
                     ترقبوا البث القادم: شرح متن العقيدة الطحاوية - اليوم الساعة ٨:٠٠ م بتوقيت القاهرة.
                   </p>
                   <Button variant="outline" className="mt-8 rounded-2xl border-white/10 hover:bg-white/5 text-white gap-3 h-12 px-8">
                     <Calendar className="w-4 h-4" /> جدول المواعيد
                   </Button>
                </div>
                
                {/* Live Badge Top Right */}
                <div className="absolute top-8 right-8 z-10 flex items-center gap-3">
                   <div className="px-4 py-2 rounded-xl bg-red-600 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-red-600/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      مباشر
                   </div>
                   <div className="px-4 py-2 rounded-xl bg-black/60 backdrop-blur-xl border border-white/10 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                      <Users className="w-3.5 h-3.5" /> 1.2K مشاهد
                   </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between gap-6 p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 backdrop-blur-xl">
               <div className="space-y-4">
                  <h2 className="text-3xl font-black text-white">ترقبوا: شرح متن العقيدة الطحاوية</h2>
                  <div className="flex items-center gap-4 text-white/40">
                     <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span className="text-sm font-bold">للباحثين عن الحق</span>
                     </div>
                     <div className="w-1 h-1 rounded-full bg-white/20" />
                     <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm font-bold">كل إثنين وجمعة</span>
                     </div>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <Button variant="outline" className="rounded-2xl border-white/10 hover:bg-white/5 text-white h-14 w-14 p-0">
                     <Share2 className="w-6 h-6" />
                  </Button>
                  <Button variant="outline" className="rounded-2xl border-white/10 hover:bg-white/5 text-white h-14 w-14 p-0">
                     <Bell className="w-6 h-6" />
                  </Button>
                  <Button className="rounded-2xl bg-primary text-white hover:bg-primary/90 h-14 px-8 font-black text-lg gap-3">
                     <Heart className="w-5 h-5 fill-current" /> دعم البث
                  </Button>
               </div>
            </div>
          </motion.div>

          {/* Chat / Sidebar Area */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            {/* Live Chat Simulated */}
            <div className="h-[600px] flex flex-col rounded-[2.5rem] bg-[#0a0a0a]/60 backdrop-blur-3xl border border-white/10 overflow-hidden shadow-2xl">
               <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <MessageCircle className="w-5 h-5 text-primary" />
                     <h4 className="text-sm font-black text-white uppercase tracking-tight">الدردشة الحية</h4>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               </div>
               
               <div className="flex-1 p-6 overflow-y-auto space-y-6 custom-scrollbar opacity-30 pointer-events-none">
                  {[
                    { u: "أحمد", m: "جزاكم الله خيراً على هذا المجهود", c: "text-emerald-400" },
                    { u: "طالب علم", m: "هل سيكون هناك ملف PDF للدرس؟", c: "text-sky-400" },
                    { u: "فاطمة", m: "البث واضح جداً شكراً لكم", c: "text-rose-400" },
                    { u: "يوسف", m: "متى يبدأ درس التفسير؟", c: "text-amber-400" },
                  ].map((msg, i) => (
                    <div key={i} className="space-y-1">
                       <span className={cn("text-[10px] font-black uppercase tracking-widest", msg.c)}>{msg.u}</span>
                       <p className="text-sm text-white/70 leading-relaxed font-medium">{msg.m}</p>
                    </div>
                  ))}
                  <div className="pt-20 text-center space-y-4">
                     <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
                        <Lock className="w-6 h-6 text-white/20" />
                     </div>
                     <p className="text-xs text-white/20 font-bold">يجب تسجيل الدخول للمشاركة في الدردشة</p>
                  </div>
               </div>

               <div className="p-6 bg-white/[0.02] border-t border-white/5">
                  <Button className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:bg-white/10 hover:text-white transition-all font-black text-sm">
                     اكتب رسالة...
                  </Button>
               </div>
            </div>

            {/* Upcoming Streams */}
            <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 space-y-6">
               <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">بثوث قادمة</h4>
               <div className="space-y-6">
                  {[
                    { t: "فقه المعاملات المالية", d: "غداً ٧:٣٠ م", i: Play },
                    { t: "تنبيه الغبي لشرح المنهج", d: "الأحد ٩:٠٠ م", i: Play },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center gap-4 group cursor-pointer">
                       <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <s.i className="w-5 h-5 text-primary" />
                       </div>
                       <div>
                          <h5 className="font-bold text-white text-sm group-hover:text-primary transition-colors">{s.t}</h5>
                          <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">{s.d}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
