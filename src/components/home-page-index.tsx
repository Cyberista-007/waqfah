"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import {
  Home,
  Grid,
  Layers,
  GraduationCap,
  Star,
  PlayCircle,
  HelpCircle,
  ChevronUp,
  X,
} from "lucide-react";

const sections = [
  { id: "hero", label: "الرئيسية", sub: "بداية الرحلة والبحث", icon: Home },
  { id: "categories", label: "أبواب العلم", sub: "القرآن والعلوم والأقسام", icon: Grid },
  { id: "spiritual", label: "وقفات إيمانية", sub: "آية اليوم والروشتة الإيمانية", icon: Star },
  { id: "latest", label: "أحدث المحتوى", sub: "البرامج والمحاضرات والسلاسل", icon: PlayCircle },
  { id: "pathways", label: "المسارات المنهجية", sub: "خرائط طريق لطلب العلم", icon: GraduationCap },
  { id: "faq", label: "الأسئلة الشائعة", sub: "إجابات لاستفساراتك", icon: HelpCircle },
];

export function PageIndex() {
  const [activeSection, setActiveSection] = useState("hero");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollPosition = window.scrollY;
          let current = "hero";

          for (const section of sections) {
            const el = document.getElementById(section.id);
            if (el && scrollPosition >= el.offsetTop - 250) {
              current = section.id;
            }
          }

          setActiveSection((prev) => (prev !== current ? current : prev));
          ticking = false;
        });
        ticking = true;
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = el.offsetTop - 90;
      window.scrollTo({
        top: Math.max(0, offset),
        behavior: "smooth",
      });
    }
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className="fixed bottom-8 right-24 z-[55]"
      dir="rtl"
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute bottom-14 right-0 w-64 rounded-2xl bg-card/95 backdrop-blur-xl border border-border p-2.5 shadow-2xl space-y-1"
          >
            <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-border/60 mb-1">
              <span className="text-xs font-black text-foreground">فهرس الصفحة</span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="إغلاق الفهرس"
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {sections.map((section) => {
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => scrollTo(section.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-right cursor-pointer",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-foreground/80 hover:bg-muted hover:text-foreground"
                  )}
                >
                  <section.icon size={16} className="shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold truncate">{section.label}</span>
                    <span
                      className={cn(
                        "text-[10px] truncate",
                        isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                      )}
                    >
                      {section.sub}
                    </span>
                  </div>
                </button>
              );
            })}

            <div className="pt-1 mt-1 border-t border-border/60">
              <button
                type="button"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <ChevronUp className="w-3.5 h-3.5" />
                <span>العودة للأعلى</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compact On-Demand Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "إغلاق فهرس الصفحة" : "فتح فهرس الصفحة"}
        title="فهرس أقسام الصفحة"
        className={cn(
          "h-11 px-3.5 rounded-full border shadow-lg backdrop-blur-xl flex items-center gap-2 text-xs font-bold transition-all cursor-pointer",
          isOpen
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-card/90 border-border text-foreground hover:border-primary/50 hover:text-primary"
        )}
      >
        {isOpen ? <X className="w-4 h-4 shrink-0" /> : <Layers className="w-4 h-4 shrink-0 text-primary" />}
        <span className="hidden sm:inline">فهرس الصفحة</span>
      </button>
    </div>
  );
}

export function HomePageIndexWrapper() {
  const pathname = usePathname();
  if (pathname !== "/") return null;
  return <PageIndex />;
}
