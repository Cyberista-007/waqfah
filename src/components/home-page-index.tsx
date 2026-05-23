
"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { 
    Home, 
    Grid, 
    Layers, 
    GraduationCap, 
    Star, 
    Smartphone, 
    PlayCircle, 
    HelpCircle,
    ChevronLeft
} from "lucide-react"

const sections = [
  { id: "hero", label: "الرئيسية", sub: "بداية الرحلة والبحث", icon: Home },
  { id: "categories", label: "الأقسام العلمية", sub: "تصفح العلوم حسب التصنيف", icon: Grid },
  { id: "hub", label: "كنوز إسلامية", sub: "قرآن، أذكار، وأحاديث", icon: Layers },
  { id: "pathways", label: "المسارات المنهجية", sub: "خرائط طريق لطلب العلم", icon: GraduationCap },
  { id: "merits", label: "لماذا وقفة؟", sub: "مميزاتنا وأهداف المنصة", icon: Star },
  { id: "app", label: "تطبيق الجوال", sub: "تثبيت المنصة على هاتفك", icon: Smartphone },
  { id: "latest", label: "آخر التحديثات", sub: "جديد الدروس والسلاسل", icon: PlayCircle },
  { id: "faq", label: "الأسئلة الشائعة", sub: "إجابات لاستفساراتك", icon: HelpCircle },
]

export function PageIndex() {
  const [activeSection, setActiveSection] = useState("hero")
  const [isHovered, setIsHovered] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 100)
      
      // Calculate scroll progress
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = (window.scrollY / totalHeight) * 100
      setScrollProgress(progress)

      const sectionOffsets = sections.map(section => {
        const el = document.getElementById(section.id)
        return {
          id: section.id,
          offset: el ? el.offsetTop - 250 : 0
        }
      })

      const scrollPosition = window.scrollY
      const current = sectionOffsets.reduce((prev, curr) => {
        if (scrollPosition >= curr.offset) {
          return curr.id
        }
        return prev
      }, "hero")

      setActiveSection(current)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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
          {/* Desktop Premium Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="fixed right-8 top-1/2 -translate-y-1/2 z-[60] hidden lg:flex flex-col gap-1.5 p-2 rounded-[2.5rem] bg-zinc-950/40 backdrop-blur-3xl border border-white/5 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] group/sidebar transition-all duration-500 hover:bg-zinc-950/60"
          >
            {/* Scroll Progress Line */}
            <div className="absolute left-[-2px] top-10 bottom-10 w-0.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                    className="w-full bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"
                    style={{ height: `${scrollProgress}%` }}
                />
            </div>

            {sections.map((section, idx) => {
              const isActive = activeSection === section.id
              return (
                <div key={section.id} className="relative flex items-center">
                  <motion.button
                    whileHover={{ scale: 1.1, x: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => scrollTo(section.id)}
                    className="relative flex items-center group/btn"
                  >
                    <div className={cn(
                      "w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-500",
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-[0_0_30px_rgba(var(--primary-rgb),0.4)] scale-110 rotate-[-5deg]" 
                        : "text-white/30 hover:text-white hover:bg-white/5"
                    )}>
                      <section.icon size={18} className={cn("transition-transform duration-500", isActive && "scale-110")} />
                    </div>

                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0, x: 20, scale: 0.95 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          exit={{ opacity: 0, x: 20, scale: 0.95 }}
                          className="absolute right-full mr-5 p-4 rounded-3xl bg-zinc-900/90 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] whitespace-nowrap pointer-events-none min-w-[160px]"
                        >
                          <div className="flex flex-col text-right">
                            <span className="text-sm font-black text-white mb-0.5">{section.label}</span>
                            <span className="text-[10px] font-bold text-white/30 uppercase tracking-wider">{section.sub}</span>
                          </div>
                          {/* Premium Arrow */}
                          <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-zinc-900/90 border-r border-t border-white/10 rotate-45" />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {isActive && (
                        <motion.div 
                            layoutId="activeDot"
                            className="absolute -right-4 w-2 h-2 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary-rgb),1)]"
                        />
                    )}
                  </motion.button>
                </div>
              )
            })}
            
            <div className="mt-2 pt-2 border-t border-white/5 flex justify-center">
              <motion.button 
                  whileHover={{ y: -3 }}
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="p-2 text-white/10 hover:text-primary transition-colors"
                  title="العودة للأعلى"
              >
                  <ChevronLeft className="rotate-90 w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>

          {/* Mobile Floating Action Menu */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed bottom-28 right-6 z-[60] lg:hidden"
          >
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="w-16 h-16 rounded-full bg-primary text-white shadow-[0_15px_40px_rgba(var(--primary-rgb),0.3)] flex items-center justify-center border border-white/10 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent" />
              {isMobileOpen ? <ChevronLeft className="rotate-90 relative z-10" /> : <Layers className="relative z-10" />}
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
