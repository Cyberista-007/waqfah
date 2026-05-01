'use client';

import React from 'react';
import { 
  SeerahFilmGrain,
  SeerahScrollProgress, 
  SeerahSoulWords,
  SeerahAudioPlayer,
  SeerahSectionHeader,
  SeerahBentoCard
} from '@/components/seerah/layout/elements';
import { SeerahStarfield } from '@/components/seerah/layout/starfield';
import { SeerahHero } from '@/components/seerah/identity/hero';
import { SeerahTimeline } from '@/components/seerah/history/timeline';
import { SeerahCompanions } from '@/components/seerah/people/companions';
import { SeerahQuiz } from '@/components/seerah/interactive/quiz';

// New Sections
import { SeerahFamilyTree } from '@/components/seerah/identity/family-tree';
import { SeerahInteractiveMap } from '@/components/seerah/interactive/map';
import { SeerahConstitution } from '@/components/seerah/history/constitution';
import { SeerahPropheticDay } from '@/components/seerah/identity/prophetic-day';
import { GPSHistory } from '@/components/seerah/history/gps-history';
import { SeerahBattles } from '@/components/seerah/history/battles';
import { MiraclesGallery } from '@/components/seerah/miracles/miracles-gallery';
import { RoyalLetters } from '@/components/seerah/history/royal-letters';
import { PropheticTraits } from '@/components/seerah/identity/prophetic-traits';
import { RevelationCave } from '@/components/seerah/history/revelation-cave';
import { MothersOfBelievers } from '@/components/seerah/people/mothers-of-believers';
import { BadrSky } from '@/components/seerah/history/badr-sky';
import { MosqueBuilder } from '@/components/seerah/interactive/mosque-builder';
import { KiswaSimulator } from '@/components/seerah/interactive/kiswa-simulator';
import { ArmoryGallery } from '@/components/seerah/history/armory-gallery';
import { TimeLens } from '@/components/seerah/interactive/time-lens';
import { LineageTree } from '@/components/seerah/people/lineage-tree';
import { ParchmentScroll } from '@/components/seerah/history/parchment-scroll';
import { IsraAscension } from '@/components/seerah/history/isra-ascension';
import { BattleFog } from '@/components/seerah/interactive/battle-fog';
import { StellarConquests } from '@/components/seerah/interactive/stellar-conquests';

import { motion, useScroll, useTransform } from 'framer-motion';
import { 
    Sparkles, Star, Moon, Heart, Shield, BookOpen, Sun, Wind, Cloud, 
    MessageCircle, HelpCircle, Users, Sword, Crown, Map, Quote, ArrowLeft
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function SeerahPage() {
  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 1000], [0, -200]);

  return (
    <main id="seerah-page" className="min-h-screen text-foreground selection:bg-amber-500/30 selection:text-amber-400 overflow-x-hidden relative" dir="rtl">
      {/* 🧩 Layout Foundation */}
      <SeerahStarfield />
      <SeerahScrollProgress />
      <SeerahFilmGrain />
      <SeerahSoulWords />
      <SeerahAudioPlayer />

      {/* 🕋 Phase 1: Makkah - The Dawn of Revelation */}
      <SeerahHero 
        title="مكة المكرمة"
        subtitle="حيث بدأ النور، ومنبع الرسالة الخالدة التي غيرت مجرى التاريخ البشري.."
        image="/seerah_hero_cinematic_1777413309420.png"
      />

      {/* 🕋 Phase 1.1: Kaaba Kiswa Simulator */}
      <KiswaSimulator />

      <div className="w-full px-4 md:px-8 lg:px-12">
        <SeerahSectionHeader 
            title="العهد المكي" 
            subtitle="من الميلاد إلى الهجرة" 
            icon={Sparkles} 
        />
        <SeerahTimeline era="makkah" />
      </div>

      {/* 🏔️ Phase 1.5: The First Revelation */}
      <RevelationCave />

      {/* ✨ Phase 2: The Prophet's Character (Bento Grid) */}
      <section className="w-full px-4 md:px-8 lg:px-12 py-48">
        <SeerahSectionHeader 
            title="خُلق عظيم" 
            subtitle="كان خلقه القرآن" 
            icon={Heart} 
        />
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 w-full">
            <SeerahBentoCard 
                title="الرحمة المهداة" 
                subtitle="وَمَا أَرْسَلْنَاكَ إِلَّا رَحْمَةً لِّلْعَالَمِينَ"
                icon={<Heart />}
                image="/prophet_mercy_symbol_cinematic_1777413683628.png"
                className="md:col-span-8 h-[600px]"
            >
                كان أرحم الناس بالصغير والكبير، بالعدو والصديق، وحتى بالحيوان والجماد. شملت رحمته كل ذي كبد رطبة، فكان غيثاً يحيي القلوب الميتة ويزرع الأمل في النفوس المنكسرة.
            </SeerahBentoCard>

            <SeerahBentoCard 
                title="الصادق الأمين" 
                subtitle="قبل البعثة وبعدها"
                icon={<Shield />}
                className="md:col-span-4 h-[600px]"
            >
                لم يُعرف عنه كذبة قط، حتى أعداؤه في قمة خصومتهم كانوا يضعون أماناتهم عنده. شهد له القريب والبعيد بنقاء السريرة وصدق الحديث، وكان هذا الصدق هو مفتاح القلوب لرسالته.
            </SeerahBentoCard>

            <SeerahBentoCard 
                title="التواضع" 
                icon={<Wind />}
                className="md:col-span-4 h-[450px]"
                delay={0.2}
            >
                كان يجلس حيث ينتهي به المجلس، ويخصف نعله، ويرقع ثوبه، ويخدم في مهنة أهله. لم يكن يطري عليه المديح، بل كان يقول: "إنما أنا عبد الله ورسوله".
            </SeerahBentoCard>

            <SeerahBentoCard 
                title="الحلم والصبر" 
                icon={<Cloud />}
                className="md:col-span-8 h-[450px]"
                delay={0.2}
            >
                ما خُيّر بين أمرين إلا اختار أيسرهما ما لم يكن إثماً. كان يقابل الإساءة بالإحسان، ويعفو عند المقدرة، ويصبر على الأذى في سبيل الله حتى أتاه اليقين ونصر الله القريب.
            </SeerahBentoCard>
        </div>
      </section>

      {/* ⏰ Phase 2.1: A Day in the Life (NEW) */}
      <SeerahPropheticDay />

      {/* 👤 Phase 2.2: Prophetic Traits */}
      <PropheticTraits />

      {/* 🌳 Phase 2.5: The Prophet's Family Tree */}
      <div className="w-full px-4 md:px-8 lg:px-12">
          <SeerahSectionHeader 
              title="أهل البيت" 
              subtitle="النسب الشريف والأصل الطيب" 
              icon={Users} 
          />
      </div>
      <LineageTree />

      {/* 👑 Phase 2.6: Mothers of the Believers */}
      <MothersOfBelievers />

      {/* 🌌 Phase 2.7: Isra and Mi'raj */}
      <IsraAscension />

      {/* 🐫 Phase 3: The Hijrah - The Great Transition */}
      <section className="relative py-64 overflow-hidden border-y border-white/5 bg-zinc-950/50">
        <motion.div style={{ y: parallaxY }} className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] scale-150" />
        <div className="w-full px-4 md:px-8 lg:px-12 relative z-10 text-center">
             <div className="w-40 h-40 rounded-full bg-amber-500/10 border-2 border-amber-500/20 flex items-center justify-center mx-auto mb-16 group hover:scale-110 transition-transform duration-700 shadow-[0_0_80px_rgba(245,158,11,0.2)]">
                <Moon className="w-20 h-20 text-amber-500" />
             </div>
             <h2 className="text-7xl md:text-[9rem] font-black font-headline text-white tracking-tight mb-12">طريق الهجرة</h2>
             <p className="text-2xl md:text-4xl text-white/50 max-w-5xl mx-auto font-bold leading-relaxed mb-24">
               "لا تحزن إن الله معنا" - كلمات خلدها التاريخ في غار ثور، لتبدأ أعظم رحلة غيرت وجه الأرض وأرخت للعالم فجراً جديداً.
             </p>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
                <StatCard icon={<Heart className="text-rose-500" />} label="الإيثار" value="آخى بين المهاجرين والأنصار" />
                <StatCard icon={<Shield className="text-blue-500" />} label="التخطيط" value="الأخذ بالأسباب والتوكل" />
                <StatCard icon={<Star className="text-amber-500" />} label="اليقين" value="ثقة مطلقة في نصر الله" />
             </div>
        </div>
      </section>

      {/* 📍 Phase 3.5: Interactive Map */}
      <SeerahInteractiveMap />

      {/* 📍 Phase 3.6: Where are they now? (GPS History) */}
      <GPSHistory />

      {/* 🕌 Phase 4: Madinah - The State of Light */}
      <SeerahHero 
        title="المدينة المنورة"
        subtitle="طابة الطيبة، ومأرز الإيمان، وعاصمة الإسلام الأولى التي احتضنت النور وبنت الدولة.."
        image="/madinah_early_mosque_cinematic_1777413331481.png"
        tag="عاصمة النور واليقين"
      />

      {/* 📜 Phase 4.1: Madinah Constitution */}
      <ParchmentScroll />

      {/* ✉️ Phase 4.2: Royal Letters */}
      <RoyalLetters />

      {/* 🏗️ Phase 4.3: Mosque Builder */}
      <MosqueBuilder />

      <div className="w-full px-4 md:px-8 lg:px-12">
        <SeerahSectionHeader 
            title="العهد المدني" 
            subtitle="بناء الدولة والتمكين" 
            icon={Star} 
        />
        <SeerahTimeline era="madinah" />
      </div>

      {/* 🔍 Phase 4.4: Time Lens Madinah */}
      <TimeLens />

      {/* 🌌 Phase 4.5: Badr Sky */}
      <BadrSky />

      {/* ⚔️ Phase 5: Battles of Islam (Interactive Section) */}
      <section className="py-48 bg-zinc-950/80 border-y border-white/5">
        <div className="w-full px-4 md:px-8 lg:px-12">
            <SeerahSectionHeader 
                title="أيام خالدة" 
                subtitle="غزوات الرسول ﷺ" 
                icon={Sword} 
            />
            <SeerahBattles />
        </div>
      </section>

      {/* 🗡️ Phase 5.3: Prophetic Armory */}
      <ArmoryGallery />

      {/* 🌫️ Phase 5.4: Battle Fog of War */}
      <BattleFog />

      {/* ✨ Phase 5.5: Miracles Gallery */}
      <MiraclesGallery />

      {/* 👥 Phase 6: The Sahaba - Stars of Guidance */}
      <section className="w-full px-4 md:px-8 lg:px-12 py-48">
        <SeerahSectionHeader 
            title="أصحابي كالنجوم" 
            subtitle="جيل النصر والفرقان" 
            icon={Users} 
        />
        <SeerahCompanions />
      </section>

      {/* 📜 Phase 7: The Farewell Pilgrimage & Legacy */}
      <section className="relative py-64">
          <div className="absolute inset-0">
                <Image src="/farewell_pilgrimage_arafat_cinematic_1777414009459.png" fill className="object-cover opacity-20 brightness-50" alt="Legacy" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]" />
          </div>
          <div className="w-full px-4 md:px-8 lg:px-12 relative z-10 text-center">
                <SeerahSectionHeader 
                    title="الوصية الخالدة" 
                    subtitle="حجة الوداع والكمال" 
                    icon={Quote} 
                />
                <div className="max-w-5xl mx-auto p-16 rounded-[4rem] bg-white/[0.01] border border-white/5 backdrop-blur-3xl shadow-2xl group hover:bg-white/[0.03] transition-all duration-700">
                    <p className="text-3xl md:text-5xl font-black text-white italic leading-snug mb-12 font-headline">
                        "أيها الناس، إن دماءكم وأموالكم عليكم حرام كحرمة يومكم هذا في شهركم هذا في بلدكم هذا.."
                    </p>
                    <div className="h-1 w-40 bg-amber-500 mx-auto opacity-30 mb-12" />
                    <p className="text-xl text-white/40 font-bold leading-relaxed">
                        أرسى النبي في هذه الخطبة قواعد حقوق الإنسان، والعدالة، والمساواة، وأكمل بها الدين وأتم النعمة على المسلمين أجمعين.
                    </p>
                </div>
          </div>
      </section>

      {/* 🏛️ Phase 8: The Rashidun Caliphs */}
      <section className="relative py-48 overflow-hidden bg-zinc-950/50 border-y border-white/5">
        <div className="absolute inset-0 z-0">
            <Image src="/four_caliphs_pillars_cinematic_1777413858589.png" fill className="object-cover opacity-10 brightness-50" alt="Rashidun Caliphs" />
        </div>

        <div className="w-full px-4 md:px-8 lg:px-12 relative z-10">
          <SeerahSectionHeader 
            title="خلفاء الهدى" 
            subtitle="الخلفاء الراشدون" 
            icon={Crown} 
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <CaliphCard name="أبو بكر الصديق" title="خليفة رسول الله" desc="رجل الثبات في المحن، ناصر الدين في حروب الردة." color="border-amber-500/30" />
            <CaliphCard name="عمر بن الخطاب" title="الفاروق" desc="مؤسس الدولة، ناشر العدل، وفتح في عهده بيت المقدس." color="border-rose-500/30" />
            <CaliphCard name="عثمان بن عفان" title="ذو النورين" desc="المنفق السخي، جامع القرآن، وصاحب أول أسطول بحري." color="border-blue-500/30" />
            <CaliphCard name="علي بن أبي طالب" title="أبو التراب" desc="باب مدينة العلم، الفدائي الأول، والشجاع الذي لم يُهزم." color="border-emerald-500/30" />
          </div>
        </div>
      </section>

      {/* 💡 Phase 9: Interactive Quiz */}
      <SeerahQuiz />

      {/* 🌟 Phase 10: Stellar Conquests Map */}
      <StellarConquests />

      {/* 📜 Final Footer Quote */}
      <section className="py-64 text-center bg-black relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/5 to-transparent opacity-30" />
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="w-full px-4 md:px-8 lg:px-12 relative z-10"
          >
            <Sun className="w-24 h-24 text-amber-500 mx-auto mb-16 opacity-30 animate-spin-slow" />
            <h2 className="text-5xl md:text-8xl font-black text-white font-headline leading-tight mb-16">
              "لقد تركت فيكم ما إن تمسكتم به لن تضلوا بعدي أبداً: <br/>
              <span className="text-amber-500">كتاب الله وسنتي</span>"
            </h2>
            <div className="flex justify-center gap-6 mb-12">
                {[1, 2, 3].map(i => <div key={i} className="w-3 h-3 rounded-full bg-amber-500/20" />)}
            </div>
            <p className="text-2xl text-white/30 font-black uppercase tracking-[0.6em]">عليه أفضل الصلاة وأتم التسليم</p>
            
            <div className="mt-32">
                <button className="px-12 py-5 rounded-full border border-white/10 bg-white/5 text-white font-black hover:bg-white/10 transition-all flex items-center gap-4 mx-auto">
                   <ArrowLeft className="w-5 h-5" /> العودة للرئيسية
                </button>
            </div>
          </motion.div>
      </section>
      
    </main>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div className="p-12 rounded-[3.5rem] bg-white/[0.01] border border-white/5 backdrop-blur-3xl hover:bg-white/[0.03] transition-all group shadow-2xl">
            <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-10 group-hover:scale-110 transition-transform shadow-2xl">
                {icon}
            </div>
            <p className="text-white/40 text-xs font-black uppercase tracking-[0.4em] mb-4">{label}</p>
            <h4 className="text-3xl font-black text-white">{value}</h4>
        </div>
    );
}

function CaliphCard({ name, title, desc, color }: { name: string, title: string, desc: string, color: string }) {
    return (
        <motion.div
            whileHover={{ y: -10 }}
            className={cn(
                "p-12 rounded-[3.5rem] bg-white/[0.01] backdrop-blur-3xl border transition-all duration-700 group relative overflow-hidden shadow-2xl",
                color,
                "hover:bg-white/[0.03] hover:border-white/10"
            )}
        >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Star className="w-32 h-32 text-white" />
            </div>
            <h3 className="text-4xl font-black text-white mb-3 font-headline leading-tight">{name}</h3>
            <p className="text-amber-500 font-black text-xs uppercase tracking-[0.4em] mb-10">{title}</p>
            <p className="text-white/30 text-lg leading-relaxed font-bold">{desc}</p>
            
            <div className="mt-12 flex justify-end">
                <div className="w-12 h-1 bg-white/5 group-hover:w-24 group-hover:bg-amber-500/40 transition-all duration-700" />
            </div>
        </motion.div>
    );
}

function BattleCard({ title, year, desc, stats, image }: { title: string, year: string, desc: string, stats: any, image?: string }) {
    return (
        <motion.div
            whileHover={{ y: -10 }}
            className="p-10 rounded-[3.5rem] bg-white/[0.01] border border-white/5 backdrop-blur-3xl group relative overflow-hidden transition-all duration-700 hover:bg-white/[0.03] shadow-2xl"
        >
            {image && (
                <div className="absolute inset-0 -z-10 opacity-10 group-hover:opacity-30 transition-opacity duration-1000">
                    <Image src={image} fill className="object-cover" alt={title} />
                </div>
            )}
            <div className="flex justify-between items-start mb-10">
                <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500">
                    <Sword size={24} />
                </div>
                <span className="px-5 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/40 text-[10px] font-black tracking-widest">{year}</span>
            </div>
            <h3 className="text-3xl font-black text-white mb-6 font-headline tracking-tight">{title}</h3>
            <p className="text-white/40 text-lg leading-relaxed font-bold mb-10">{desc}</p>
            <div className="flex gap-6">
                <div className="flex-1 p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">المجاهدين</p>
                    <p className="text-white font-black">{stats.soldiers}</p>
                </div>
                <div className="flex-1 p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">النتيجة</p>
                    <p className="text-emerald-400 font-black">{stats.result}</p>
                </div>
            </div>
        </motion.div>
    );
}
