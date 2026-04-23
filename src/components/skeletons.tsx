
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export function CinematicAppLoader() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background overflow-hidden">
      {/* 🔮 Deep Ambient Aura */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] bg-primary/10 blur-[150px] rounded-full animate-pulse-slow" />
          <div className="absolute top-1/4 right-1/4 w-[40vw] h-[40vw] bg-amber-500/5 blur-[120px] rounded-full animate-pulse-slow delay-700" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 1.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center"
      >
        {/* 🖋️ The Masterpiece Title */}
        <div className="relative mb-12">
            <h1 className="text-7xl md:text-9xl font-black font-headline tracking-tighter text-foreground select-none">
                وقـــفــــة
            </h1>
            {/* Elegant Golden Sweep */}
            <motion.div 
                animate={{ x: ["-150%", "150%"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/30 to-transparent skew-x-12 pointer-events-none"
            />
        </div>

        {/* 🕯️ Subtle Progress Indicator */}
        <div className="flex flex-col items-center gap-6">
            <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        animate={{ 
                            scale: [1, 1.5, 1],
                            opacity: [0.3, 1, 0.3],
                            backgroundColor: ["rgb(var(--primary))", "rgb(255, 255, 255)", "rgb(var(--primary))"]
                        }}
                        transition={{ 
                            duration: 2, 
                            repeat: Infinity, 
                            delay: i * 0.3,
                            ease: "easeInOut"
                        }}
                        className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"
                    />
                ))}
            </div>
            
            <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 1 }}
                className="text-[10px] tracking-[0.4em] uppercase font-black text-muted-foreground/40"
            >
                جاري تهيئة التجربة
            </motion.span>
        </div>
      </motion.div>
      
      {/* 📜 Poetic Footnote */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 1.5 }}
        className="absolute bottom-16 text-muted-foreground/20 text-sm font-headline italic tracking-wide"
      >
        "صمتٌ.. ليتكلم القلب"
      </motion.div>
    </div>
  );
}

export function HomePageSkeleton() {
  return (
    <div className="space-y-12">
      <section className="relative -mt-[calc(4rem+1px)] flex h-[60vh] min-h-[500px] flex-col items-center justify-center bg-muted/30 text-center">
        <div className="container relative z-10">
          <Skeleton className="h-16 w-3/4 mx-auto mb-4" />
          <Skeleton className="h-8 w-1/2 mx-auto mb-8" />
          <Skeleton className="h-16 w-full max-w-xl mx-auto rounded-full" />
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 py-8 space-y-16">
        <section>
          <Skeleton className="h-10 w-64 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <Skeleton className="h-10 w-64 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i}>
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export function SeriesPageSkeleton() {
    return (
        <div className="container mx-auto px-4 sm:px-6 py-8 space-y-12">
            <Card className="flex flex-col md:flex-row gap-8 items-center p-8 border-none shadow-none bg-transparent">
                <Skeleton className="w-full md:w-1/4 h-64 rounded-lg" />
                <div className="md:w-3/4 space-y-4">
                    <Skeleton className="h-12 w-3/4" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-2/3" />
                    <Skeleton className="h-8 w-32" />
                </div>
            </Card>
            <section>
                <Skeleton className="h-10 w-64 mb-6" />
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                       <Skeleton key={i} className="h-20 w-full rounded-lg" />
                    ))}
                </div>
            </section>
        </div>
    )
}

export function LecturePageSkeleton() {
    return (
        <div className="container mx-auto px-4 sm:px-6 py-8 space-y-10 animate-pulse">
            <div className="flex justify-between items-start mb-4">
                <div className="space-y-3 w-3/4">
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-12 w-full" />
                </div>
                <Skeleton className="h-12 w-12 rounded-full" />
            </div>
            <Card className="shadow-lg">
                <CardContent className="p-4">
                    <Skeleton className="h-12 w-full" />
                </CardContent>
            </Card>
            {[...Array(4)].map((_, i) => (
                <section key={i}>
                    <Skeleton className="h-8 w-1/3 mb-4" />
                    <div className="flex flex-wrap gap-3">
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                </section>
            ))}
            <section>
                 <Skeleton className="h-8 w-1/3 mb-4" />
                 <Card><CardContent className="p-6 space-y-4">
                    <Skeleton className="h-24 w-full" />
                     <Skeleton className="h-10 w-32" />
                 </CardContent></Card>
            </section>
        </div>
    );
}

export function SearchSkeleton() {
  return (
    <div className="space-y-10 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex gap-4 p-5 rounded-[2rem] bg-white/5 border border-white/5">
            <Skeleton className="w-24 h-14 rounded-2xl shrink-0" />
            <div className="flex flex-col justify-center space-y-2 flex-grow">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
