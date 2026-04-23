"use client";

import { useState, useRef } from "react";
import { Award, Download, Share2, CheckCircle2, Trophy, Star, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

interface SeriesCertificateProps {
  seriesTitle: string;
  userName: string;
  completionDate?: string;
  seriesId: string;
}

export function SeriesCertificate({ seriesTitle, userName, completionDate, seriesId }: SeriesCertificateProps) {
  const { toast } = useToast();
  const certificateRef = useRef<HTMLDivElement>(null);

  const handleShare = async () => {
    const shareData = {
      title: "أتممت سلسلة محاضرات!",
      text: `بفضل الله، أتممت سلسلة "${seriesTitle}" على منصة وقفة.`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({ title: "تم نسخ الرابط!" });
      }
    } catch (e) {
      console.error("Error sharing:", e);
    }
  };

  return (
    <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-card to-primary/10 shadow-2xl animate-in fade-in zoom-in duration-700">
      {/* Decorative elements */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
      
      <CardContent className="p-8 md:p-12 text-center space-y-8 relative">
        <div className="flex justify-center">
            <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
                <div className="h-24 w-24 bg-primary/10 border-2 border-primary/30 rounded-full flex items-center justify-center relative z-10 shadow-inner">
                    <Trophy className="h-12 w-12 text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                </div>
                <div className="absolute -top-2 -right-2 transform rotate-12 bg-card border border-primary/50 rounded-lg p-1.5 shadow-lg">
                    <Star className="h-5 w-5 text-primary fill-primary" />
                </div>
            </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2">
             <div className="h-px w-8 bg-gradient-to-r from-transparent to-primary/40" />
             <h2 className="text-xl md:text-2xl font-black font-headline uppercase tracking-widest text-primary">تم الإنجاز بنجاح</h2>
             <div className="h-px w-8 bg-gradient-to-l from-transparent to-primary/40" />
          </div>
          
          <div className="space-y-2">
            <p className="text-muted-foreground font-medium text-lg">يسر منصة وقفة أن تشهد بأن الطالب:</p>
            <h3 className="text-3xl md:text-5xl font-extrabold font-headline text-foreground py-2 drop-shadow-sm">{userName}</h3>
          </div>

          <div className="max-w-md mx-auto py-4">
            <p className="text-muted-foreground font-medium">قد أتم بجدارة واجتهاد متابعة سلسلة:</p>
            <div className="mt-2 p-4 rounded-2xl bg-primary/5 border border-primary/10 shadow-sm transition-transform hover:scale-[1.02] duration-300">
               <h4 className="text-2xl md:text-3xl font-black font-headline text-primary">{seriesTitle}</h4>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col md:flex-row items-center justify-center gap-4">
          <Button onClick={handleShare} size="lg" className="rounded-full px-8 font-bold gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95">
            <Share2 className="h-5 w-5" />
            مشاركة هذا الإنجاز
          </Button>
          <Button variant="outline" size="lg" className="rounded-full px-8 font-bold gap-2 border-primary/20 hover:bg-primary/5 transition-all">
            <Download className="h-5 w-5" />
            تحميل الشهادة الرقمية
          </Button>
        </div>

        <div className="flex items-center justify-center gap-6 pt-4 text-muted-foreground/40 font-mono text-xs uppercase tracking-tighter">
            <div className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> VERIFIED BY WAQFAH</div>
            <div className="flex items-center gap-1 font-bold">ID: {seriesId.substring(0,8).toUpperCase()}</div>
        </div>
      </CardContent>
      
      {/* Decorative Corners */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/30 rounded-tl-xl" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary/30 rounded-tr-xl" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary/30 rounded-bl-xl" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary/30 rounded-br-xl" />
    </Card>
  );
}
