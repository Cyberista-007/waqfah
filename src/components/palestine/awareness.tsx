'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Globe, BookOpen, Library, Info, Camera, Play, ArrowRight, Shield } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { GLOBAL_TRUTH_DATA, RESOURCES, GALLERY_IMAGES } from './constants';

/**
 * Global Awareness Grid: Exposing the hidden truths.
 */
export function GlobalAwarenessGrid() {
  return (
    <section className="py-40 relative overflow-hidden bg-black/40">
      <div className="container px-6">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-right mb-32 space-y-6"
        >
           <div className="inline-flex items-center gap-4 px-8 py-3 bg-rose-500/10 border border-rose-500/20 rounded-full">
              <Info className="w-5 h-5 text-rose-500 shadow-glow-rose" />
              <span className="text-xs font-black uppercase text-rose-500 tracking-widest">حقائق غائبة عن الإعلام</span>
           </div>
           <h2 className="text-5xl md:text-9xl font-black tracking-tighter leading-none">واقعٌ <br /> <span className="text-white/20 italic">تخفيه العناوين</span></h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
           {GLOBAL_TRUTH_DATA.map((truth, i) => (
             <motion.div
               key={i}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               className="p-16 rounded-[4rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all text-right group relative overflow-hidden"
             >
                <div className="absolute top-0 right-0 w-2 h-full bg-rose-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <h3 className="text-4xl font-black text-white mb-6 group-hover:text-rose-400 transition-colors">{truth.title}</h3>
                <p className="text-2xl text-white/40 leading-relaxed font-medium">{truth.desc}</p>
             </motion.div>
           ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Global Voices: Testimonials and international solidarity.
 */
export function GlobalVoicesSection() {
  const voices = [
    { text: "إن حريتنا لن تكتمل بدون حرية الفلسطينيين.", author: "نيلسون مانديلا", role: "زعيم جنوب أفريقيا ومناضل عالمي" },
    { text: "إذا لم تكن حذراً، فإن الصحف ستجعلك تكره المضطهدين وتحب أولئك الذين يقومون بالاضطهاد.", author: "مالكوم إكس", role: "داعية حقوقي ومدافع عن الحرية" },
    { text: "فلسطين هي الامتحان الأكبر للضمير العالمي في القرن الحادي والعشرين، والعدالة فيها هي ميزان عدالة العالم.", author: "مفكر معاصر", role: "صوت إنساني من أجل الحق" },
  ];

  return (
    <section className="py-60 relative overflow-hidden">
      <div className="container px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {voices.map((voice, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className="p-16 rounded-[4.5rem] bg-white/[0.02] border border-white/10 flex flex-col justify-between text-center group shadow-3xl"
            >
               <p className="text-3xl font-black text-white/90 leading-relaxed font-quran">"{voice.text}"</p>
               <div className="pt-12 space-y-4">
                  <p className="text-2xl font-black text-emerald-500">{voice.author}</p>
                  <p className="text-xs font-bold text-white/20 uppercase tracking-widest">{voice.role}</p>
               </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Global Media Watch: Trusted sources.
 */
export function GlobalMediaWatchSection() {
  const sources = [
    { category: "وثائقيات", icon: "🎬", items: [
      { title: "فيلم فرحة", desc: "رواية النكبة من عيون طفلة فلسطينية", tag: "Netflix" },
      { title: "5 كاميرات مكسورة", desc: "تصوير ميداني للمقاومة الشعبية", tag: "Oscar" },
      { title: "مواطن/مهاجر", desc: "قصة الهوية في ظل الاحتلال", tag: "Sundance" },
    ]},
    { category: "كتب مرجعية", icon: "📚", items: [
      { title: "تطهير فلسطين عرقياً", desc: "إيلان بابيه - الرواية التاريخية الموثقة", tag: "تاريخ" },
      { title: "رأيت رام الله", desc: "مريد البرغوثي - سيرة العودة المؤلمة", tag: "أدب" },
      { title: "The Question of Palestine", desc: "إدوارد سعيد - الصوت الأكاديمي الأكبر", tag: "أكاديمي" },
    ]},
    { category: "مصادر إخبارية", icon: "📡", items: [
      { title: "الجزيرة الإنجليزية", desc: "أوسع تغطية ميدانية في العالم العربي", tag: "aljazeera.com" },
      { title: "Middle East Eye", desc: "تقارير معمقة من داخل الأراضي الفلسطينية", tag: "middleeasteye.net" },
      { title: "972 Magazine", desc: "صحافة مستقلة من الأرض المحتلة", tag: "+972mag.com" },
    ]},
  ];

  return (
    <section className="py-40 relative overflow-hidden">
      <div className="container px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-right mb-24 space-y-6"
        >
          <div className="inline-flex items-center gap-4 px-8 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full shadow-xl">
            <BookOpen className="w-5 h-5 text-sky-400" />
            <span className="text-xs font-black uppercase text-sky-400 tracking-widest">مصادر موثوقة · اعرف الحقيقة</span>
          </div>
          <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-none">
            تعلّم <span className="text-sky-500">الحقيقة</span> <br />
            <span className="text-white/20">من مصادرها</span>
          </h2>
          <p className="text-2xl text-white/40 max-w-3xl mr-auto font-medium leading-relaxed">
            في زمن تشويه الحقائق، المعرفة هي السلاح الأول. هذه المصادر الموثوقة ستجعلك سفيراً للحق في كل مكان.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {sources.map((src, i) => (
            <motion.div
              key={src.category}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="p-12 rounded-[4rem] bg-white/[0.02] border border-white/5 space-y-12 shadow-2xl relative overflow-hidden"
            >
               <div className="flex items-center justify-between">
                  <h3 className="text-3xl font-black text-white">{src.category}</h3>
                  <span className="text-4xl">{src.icon}</span>
               </div>
               <div className="space-y-8">
                  {src.items.map((item, j) => (
                    <div key={j} className="space-y-2 text-right group cursor-pointer">
                       <p className="text-xl font-black text-white/80 group-hover:text-sky-400 transition-colors">{item.title}</p>
                       <p className="text-sm text-white/30 leading-relaxed">{item.desc}</p>
                       <span className="inline-block px-3 py-1 bg-white/5 text-[10px] font-black text-sky-400/60 rounded-md mt-2">{item.tag}</span>
                    </div>
                  ))}
               </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Digital Library: Curated resources.
 */
export function DigitalLibrarySection() {
  return (
    <section className="py-40">
      <div className="container px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-32">
          <div className="space-y-8 text-right">
             <div className="inline-flex items-center gap-4 px-8 py-3 bg-amber-500/10 border border-amber-500/20 rounded-full">
                <Library className="w-5 h-5 text-amber-500 shadow-glow-amber" />
                <span className="text-xs font-black uppercase text-amber-500 tracking-widest">كنوز المعرفة الفلسطينية</span>
             </div>
             <h2 className="text-5xl md:text-8xl font-black text-right tracking-tighter">المكتبة <br /> <span className="text-white/20">الرقمية للحق</span></h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {RESOURCES.map((res, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="p-12 rounded-[4rem] bg-white/[0.03] border border-white/5 hover:border-amber-500/30 transition-all text-right group shadow-2xl"
            >
               <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">{res.type}</span>
               <h3 className="text-3xl font-black text-white mb-4 group-hover:text-amber-400 transition-colors">{res.title}</h3>
               <p className="text-lg text-white/40 leading-relaxed font-medium mb-6">{res.desc}</p>
               <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <span className="text-xs font-bold text-white/20 italic">{res.author}</span>
                  <button className="text-amber-500 hover:scale-110 transition-transform"><ArrowRight className="w-6 h-6" /></button>
               </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Media Gallery: Visual storytelling.
 */
export function MediaGallery() {
  return (
    <section id="gallery" className="py-40">
      <div className="container px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 h-[auto] md:h-[800px]">
          {GALLERY_IMAGES.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "relative rounded-[4rem] overflow-hidden group shadow-3xl",
                i === 0 ? "md:col-span-2 md:row-span-2" : ""
              )}
            >
              <Image 
                src={img.src} 
                alt={img.title} 
                fill 
                className="object-cover group-hover:scale-110 transition-transform duration-[3s]" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="absolute bottom-10 left-10 right-10 text-right translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700">
                <p className="text-2xl font-black text-white">{img.title}</p>
                <p className="text-sm font-bold text-emerald-400 mt-2">{img.location}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
