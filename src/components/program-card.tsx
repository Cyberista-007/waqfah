"use client";

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Program } from '@/lib/types';
import { cn, getInitials } from '@/lib/utils';
import { FollowButton } from './follow-button';
import { MessageSquare, Users, Sparkles, ChevronLeft } from 'lucide-react';
import { memo } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ThreeDTilt } from './ui/three-d-tilt';

interface ProgramCardProps {
    program: Program;
    index?: number;
    pinnedMessage?: string;
}

const ProgramCardComponent = ({ program, index = 0, pinnedMessage }: ProgramCardProps) => {
    const imageUrl = program.imageUrl;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="h-full"
        >
            <ThreeDTilt tiltMax={8} className="h-full">
                <Card 
                    className={cn(
                        "h-full flex flex-col relative overflow-hidden transition-all duration-500 transform-gpu",
                        "bg-card border border-white/10 shadow-xl rounded-3xl group",
                        "hover:border-primary/40 hover:shadow-primary/5"
                    )}
                >
                {/* Banner Section */}
                <div className="relative h-28 overflow-hidden bg-zinc-900 border-b border-white/5">
                    <div className="absolute inset-0 z-0">
                         <Image
                            src={imageUrl || `https://picsum.photos/seed/${program.slug}/800/200`}
                            alt={`${program.name} banner`}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            priority={index < 4}
                            className="object-cover opacity-30 transition-transform duration-1000 group-hover:scale-110 grayscale-[0.5]"
                        />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
                    
                    {/* Decorative Elements */}
                    <div className="absolute top-3 right-3 z-20">
                         <div className="px-2 py-1 bg-primary/20 backdrop-blur-md border border-primary/30 rounded-full text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                             <Sparkles className="w-2.5 h-2.5 animate-pulse" />
                             برنامج مميز
                         </div>
                    </div>
                </div>

                {/* Avatar Section - Floating */}
                <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30">
                    <Link href={`/programs/${program.slug}`} className="block relative">
                        <Avatar className="h-20 w-20 border-4 border-card bg-zinc-950 shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:border-primary/40 group-hover:ring-8 group-hover:ring-primary/5">
                            {imageUrl && <AvatarImage src={imageUrl} alt={program.name} className="object-cover" />}
                            <AvatarFallback className="text-3xl font-black bg-primary/10 text-primary">
                                {getInitials(program.name)}
                            </AvatarFallback>
                        </Avatar>
                    </Link>
                </div>

                {/* Content Section */}
                <div className="flex-grow flex flex-col text-center px-5 pb-5 pt-12 relative z-20">
                     <Link href={`/programs/${program.slug}`} className="group/link flex flex-col items-center">
                        <CardHeader className="p-0 mb-2">
                            <CardTitle className="font-headline text-2xl font-black text-white group-hover/link:text-primary transition-colors tracking-tight leading-tight">
                                {program.name}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <CardDescription className="text-muted-foreground font-medium line-clamp-2 text-xs leading-relaxed mb-4 opacity-80 group-hover:opacity-100 transition-opacity">
                                {program.bio || "استكشف كنوز العلم والمعرفة عبر هذا البرنامج المتميز."}
                            </CardDescription>
                        </CardContent>
                    </Link>

                    {/* Stats / Followers */}
                    <div className="flex justify-center items-center gap-4 mb-5 text-muted-foreground">
                        <div className="flex flex-col items-center gap-0.5">
                            <div className="flex items-center gap-1 text-white/90 font-bold text-sm">
                                <Users className="w-3 h-3 text-primary" />
                                <span>{program.followerCount || 0}</span>
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-widest opacity-60 italic">متابع</span>
                        </div>
                        <div className="w-px h-5 bg-white/10" />
                        <div className="flex flex-col items-center gap-0.5">
                            <div className="flex items-center gap-1 text-white/90 font-bold text-sm">
                                <MessageSquare className="w-3 h-3 text-primary" />
                                <span>{(program.followerCount || 0) * 2 + 5}</span>
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-widest opacity-60 italic">تفاعل</span>
                        </div>
                    </div>

                    {pinnedMessage && (
                        <div className="mb-5 bg-primary/5 p-3 rounded-2xl border border-primary/10">
                            <p className="text-[10px] text-primary/80 italic leading-relaxed line-clamp-2">
                                "{pinnedMessage}"
                            </p>
                        </div>
                    )}

                    <div className="mt-auto flex items-center justify-between gap-3 bg-white/5 p-2 rounded-2xl border border-white/5">
                        <div className="flex-1">
                            <FollowButton programId={program.id} className="h-9 rounded-xl text-xs font-bold" />
                        </div>
                        <Link 
                            href={`/programs/${program.slug}`}
                            className="flex-shrink-0 h-9 w-9 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl hover:bg-primary hover:text-primary-foreground transition-all group/btn"
                        >
                            <ChevronLeft className="w-4 h-4 transition-transform group-hover/btn:-translate-x-1" />
                        </Link>
                    </div>
                </div>
                </Card>
            </ThreeDTilt>
        </motion.div>
    );
};

export const ProgramCard = memo(ProgramCardComponent);
