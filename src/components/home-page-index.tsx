
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
  { id: "hero", label: "الرئيسية", icon: Home },
  { id: "categories", label: "الأقسام", icon: Grid },
  { id: "hub", label: "كنوز إسلامية", icon: Layers },
  { id: "pathways", label: "المسارات", icon: GraduationCap },
  { id: "merits", label: "لماذا وقفة؟", icon: Star },
  { id: "app", label: "التطبيق", icon: Smartphone },
  { id: "latest", label: "آخر المحتويات", icon: PlayCircle },
  { id: "faq", label: "الأسئلة الشائعة", icon: HelpCircle },
]

export function PageIndex() {
  const [activeSection, setActiveSection] = useState("hero")
  const [isHovered, setIsHovered] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling a tiny bit
      setIsVisible(window.scrollY > 100)

      const sectionOffsets = sections.map(section => {
        const el = document.getElementById(section.id)
        return {
          id: section.id,
          offset: el ? el.offsetTop - 200 : 0
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
          {/* Desktop Version */}
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="fixed right-6 top-1/2 -translate-y-1/2 z-[60] hidden lg:flex flex-col gap-3 p-3 rounded-[2.5rem] bg-zinc-950/60 backdrop-blur-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] ring-1 ring-white/5"
          >
            {sections.map((section) => {
              const isActive = activeSection === section.id
              return (
                <button
                  key={section.id}
                  onClick={() => scrollTo(section.id)}
                  className="relative flex items-center group"
                >
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)] scale-110" 
                      : "text-white/40 hover:text-white hover:bg-white/5"
                  )}>
                    <section.icon size={20} className={cn("transition-transform duration-500", isActive && "scale-110")} />
                  </div>

                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, x: -10, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -10, scale: 0.95 }}
                        className="absolute right-full mr-4 px-4 py-2 rounded-xl bg-zinc-900 border border-white/10 shadow-2xl whitespace-nowrap pointer-events-none"
                      >
                        <span className="text-sm font-black text-white">{section.label}</span>
                        {/* Arrow indicator */}
                        <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-zinc-900 border-r border-t border-white/10 rotate-45" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {isActive && (
                      <motion.div 
                          layoutId="activeIndicator"
                          className="absolute -right-1 w-1 h-6 bg-primary rounded-full"
                      />
                  )}
                </button>
              )
            })}
            
            <div className="mt-2 pt-2 border-t border-white/5 flex justify-center">
              <button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="p-2 text-white/20 hover:text-primary transition-colors"
                  title="العودة للأعلى"
              >
                  <ChevronLeft className="rotate-90 w-5 h-5" />
              </button>
            </div>
          </motion.div>

          {/* Mobile Version Toggle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed bottom-24 right-6 z-[60] lg:hidden"
          >
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="w-14 h-14 rounded-full bg-primary text-white shadow-2xl flex items-center justify-center border border-white/10"
            >
              {isMobileOpen ? <ChevronLeft className="rotate-90" /> : <Layers />}
            </button>

            <AnimatePresence>
              {isMobileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.9 }}
                  className="absolute bottom-20 right-0 w-48 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden p-2 shadow-2xl"
                >
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollTo(section.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-2xl transition-colors text-right",
                        activeSection === section.id ? "bg-primary/20 text-primary" : "text-white/60"
                      )}
                    >
                      <section.icon size={16} />
                      <span className="text-xs font-bold">{section.label}</span>
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
