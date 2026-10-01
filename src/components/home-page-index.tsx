
"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { 
    Home, 
    Grid, 
    Layers, 
    GraduationCap, 
    Star, 
    Smartphone, 
    PlayCircle, 
    HelpCircle,
    ChevronLeft,
    ChevronUp
} from "lucide-react"

const sections = [
  { id: "hero", label: "الرئيسية", sub: "بداية الرحلة والبحث", icon: Home },
  { id: "categories", label: "الأقسام العلمية", sub: "تصفح العلوم حسب التصنيف", icon: Grid },
  { id: "hub", label: "كنوز إسلامية", sub: "قرآن، أذكار، وأحاديث", icon: Layers },
  { id: "pathways", label: "المسارات المنهجية", sub: "خرائط طريق لطلب العلم", icon: GraduationCap },
  { id: "latest", label: "آخر التحديثات", sub: "جديد الدروس والسلاسل", icon: PlayCircle },
  { id: "faq", label: "الأسئلة الشائعة", sub: "إجابات لاستفساراتك", icon: HelpCircle },
]

export function PageIndex() {
  const [activeSection, setActiveSection] = useState("hero")
  const [isHovered, setIsHovered] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
          const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
          setScrollProgress(progress);

          const scrollPosition = window.scrollY;
          let current = "hero";

          for (const section of sections) {
            const el = document.getElementById(section.id);
            if (el && scrollPosition >= el.offsetTop - 250) {
              current = section.id;
            }
          }

          setActiveSection(prev => (prev !== current ? current : prev));
          ticking = false;
        });
        ticking = true;
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      const offset = el.offsetTop - 100
      window.scrollTo({
        top: offset,
        behavior: "smooth"
      })
      setIsMobileOpen(false)
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Desktop Luxury Capsule Sidebar */}
          <div className="fixed right-5 xl:right-6 top-1/2 -translate-y-1/2 z-[60] hidden lg:flex flex-col items-center pointer-events-none">
            <motion.div
              initial={{ opacity: 0, x: 30, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 30, scale: 0.95 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="pointer-events-auto flex flex-col items-center gap-1.5 p-1.5 py-2.5 rounded-full bg-zinc-950/90 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.12)] group/sidebar transition-all duration-300"
            >
              {sections.map((section) => {
                const isActive = activeSection === section.id
                return (
                  <div key={section.id} className="relative flex items-center justify-center">
                    <button
                      onClick={() => scrollTo(section.id)}
                      aria-label={section.label}
                      className={cn(
                        "relative w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer",
                        isActive 
                          ? "text-primary-foreground font-black" 
                          : "text-white/40 hover:text-white hover:bg-white/10"
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activePageIndexIndicator"
                          className="absolute inset-0 rounded-full bg-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.6)] -z-10"
                          transition={{ type: "spring", stiffness: 350, damping: 30 }}
                        />
                      )}
                      <section.icon size={17} className={cn("transition-transform duration-300", isActive && "scale-105")} />
                    </button>

                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0, x: 15, scale: 0.95 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          exit={{ opacity: 0, x: 15, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-full mr-3.5 px-3.5 py-2 rounded-2xl bg-zinc-950/95 backdrop-blur-2xl border border-white/10 shadow-[0_15px_35px_rgba(0,0,0,0.7)] whitespace-nowrap pointer-events-none z-20"
                        >
                          <div className="flex flex-col text-right">
                            <span className="text-xs font-black text-white">{section.label}</span>
                            <span className="text-[9px] font-medium text-white/40">{section.sub}</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
              
              {/* Subtle Horizontal Divider */}
              <div className="w-5 h-px bg-white/15 my-1 mx-auto rounded-full" />

              {/* Back to top Chevron */}
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-white/35 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="العودة للأعلى"
                aria-label="العودة للأعلى"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </motion.div>
          </div>

          {/* Mobile Floating Action Menu */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed bottom-28 left-6 z-[60] lg:hidden"
          >
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              aria-label={isMobileOpen ? "إغلاق قائمة الفهرس" : "فتح قائمة الفهرس"}
              className="w-12 h-12 rounded-full bg-zinc-950/90 backdrop-blur-2xl text-primary shadow-[0_10px_30px_rgba(0,0,0,0.6)] flex items-center justify-center border border-white/15 relative overflow-hidden"
            >
              {isMobileOpen ? <ChevronLeft className="rotate-90 w-5 h-5 text-white" /> : <Layers className="w-5 h-5 text-primary" />}
            </motion.button>

            <AnimatePresence>
              {isMobileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.9 }}
                  className="absolute bottom-20 right-0 w-56 bg-zinc-950/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] overflow-hidden p-3 shadow-[0_30px_70px_rgba(0,0,0,0.8)]"
                >
                  <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-3 px-3">فهرس المحتوى</div>
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollTo(section.id)}
                      className={cn(
                        "w-full flex items-center gap-4 p-3.5 rounded-2xl transition-all text-right",
                        activeSection === section.id 
                            ? "bg-primary text-primary-foreground shadow-lg" 
                            : "text-white/40 hover:bg-white/5"
                      )}
                    >
                      <section.icon size={18} />
                      <div className="flex flex-col">
                        <span className="text-xs font-black">{section.label}</span>
                        <span className="text-[8px] opacity-60 font-bold">{section.sub}</span>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export function HomePageIndexWrapper() {
  const pathname = usePathname();
  if (pathname !== "/") return null;
  return <PageIndex />;
}
