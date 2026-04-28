"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCollection, useUser, useFirestore } from "@/firebase";
import type { Playlist, Lecture } from "@/lib/types";
import { Loader2, PlusCircle, Edit, Trash2, ArrowRight, Settings2, Shield, Lock, Globe, ListMusic, Sparkles } from "lucide-react";
import { PlaylistForm } from "@/components/profile/playlist-form";
import { DeleteConfirmationDialog } from "@/components/admin/delete-dialog";
import { doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function ManagePlaylistsPage() {
    const { user } = useUser();
    const { toast } = useToast();
    const router = useRouter();
    const firestore = useFirestore();

    const playlistsPath = user ? `users/${user.uid}/playlists` : null;
    const { data: playlists, isLoading: playlistsLoading } = useCollection<Playlist>(playlistsPath, { orderBy: ['createdAt', 'desc'] });
    const { data: allLectures, isLoading: lecturesLoading } = useCollection<Lecture>('lectures');
    
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [playlistToEdit, setPlaylistToEdit] = useState<Playlist | null>(null);
    const [playlistToDelete, setPlaylistToDelete] = useState<Playlist | null>(null);

    if (!user) {
        router.push('/auth/login?redirect_to=/profile/playlists');
        return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
    }
    
    const handleNew = () => {
        setPlaylistToEdit(null);
        setIsFormOpen(true);
    };

    const handleEdit = (playlist: Playlist) => {
        setPlaylistToEdit(playlist);
        setIsFormOpen(true);
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setPlaylistToEdit(null);
    };
    
    const handleDelete = async () => {
        if (!playlistToDelete || !firestore || !user) return;
        
        const playlistRef = doc(firestore, 'users', user.uid, 'playlists', playlistToDelete.id);
        
        deleteDocumentNonBlocking(playlistRef);

        toast({
            title: "تم الحذف بنجاح",
            description: `تم حذف قائمة التشغيل "${playlistToDelete.name}".`,
        });
        setPlaylistToDelete(null);
    };
    
    const isLoading = playlistsLoading || lecturesLoading;

    return (
        <div className="min-h-screen pb-40 overflow-hidden bg-[#050505] text-right" dir="rtl">
            {/* 🎭 Cinematic Deep Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-600/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/3" />
            </div>

            <div className="w-full relative z-10 px-4 md:px-8 lg:px-12 xl:px-20 mx-auto max-w-7xl pt-32">
                
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16"
                >
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl">
                            <Settings2 className="h-4 w-4 text-primary animate-spin-slow" />
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-white/80">لوحة التحكم الشخصية</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black font-headline text-white drop-shadow-lg">إدارة <span className="text-primary italic px-2">قوائمك</span></h1>
                        <p className="text-xl text-white/40 font-medium">قم ببناء وتنسيق مكتبتك الصوتية المفضلة بكل سهولة.</p>
                    </div>

                    {!isFormOpen && (
                        <div className="flex gap-3 w-full md:w-auto">
                            <Button asChild variant="outline" className="h-16 rounded-[1.5rem] px-8 bg-white/5 border-white/10 hover:bg-white/10 text-white font-black hover:scale-105 transition-all flex-1 md:flex-none">
                                <Link href="/playlists">
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                    تصفح القوائم العامة
                                </Link>
                            </Button>
                            <Button onClick={handleNew} className="h-16 rounded-[1.5rem] px-10 bg-primary text-white hover:bg-primary/90 font-black shadow-[0_0_40px_rgba(var(--primary-rgb),0.3)] hover:scale-105 transition-all flex-1 md:flex-none text-lg">
                                <PlusCircle className="ml-3 h-6 w-6" />
                                قائمة جديدة
                            </Button>
                        </div>
                    )}
                </motion.div>

                <AnimatePresence mode="wait">
                    {isFormOpen ? (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            className="bg-[#0a0a0a]/80 backdrop-blur-3xl border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden relative"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                            <div className="p-2">
                                <PlaylistForm 
                                    playlist={playlistToEdit} 
                                    allLectures={allLectures || []} 
                                    onFormClose={handleFormClose} 
                                    userId={user.uid}
                                />
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            {isLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[1, 2, 3, 4, 5, 6].map(i => (
                                        <div key={i} className="h-[250px] rounded-[2rem] bg-white/5 animate-pulse border border-white/5 shadow-2xl" />
                                    ))}
                                </div>
                            ) : playlists && playlists.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {playlists.map((p, index) => (
                                        <motion.div 
                                            key={p.id}
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="group relative"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
                                            <Card className="relative h-full flex flex-col overflow-hidden border-white/10 bg-[#0a0a0a]/60 backdrop-blur-3xl rounded-[2.5rem] transition-all duration-500 hover:border-white/20 shadow-2xl group-hover:-translate-y-2">
                                                <CardContent className="p-8 space-y-6 flex-grow flex flex-col">
                                                    <div className="flex justify-between items-start w-full">
                                                        <div className="w-14 h-14 rounded-[1rem] flex items-center justify-center border border-white/10 bg-white/5 text-white transition-transform duration-500 group-hover:rotate-6 group-hover:bg-primary/20 group-hover:text-primary group-hover:border-primary/30">
                                                           <ListMusic className="w-7 h-7" />
                                                        </div>
                                                        <div className="flex gap-2">
                                                           <Badge variant="outline" className="rounded-full px-4 py-1.5 bg-white/5 border-white/10 text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                                                              {p.lectureIds?.length || 0} مادة
                                                           </Badge>
                                                           <Badge variant={p.isPublic ? "secondary" : "outline"} className={cn("rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest backdrop-blur-md flex items-center gap-1.5", p.isPublic ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-white/5 border-white/10 text-white/50")}>
                                                              {p.isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                                                              {p.isPublic ? 'عامة' : 'خاصة'}
                                                           </Badge>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2 flex-grow">
                                                        <h3 className="text-2xl font-black font-headline text-white group-hover:text-primary transition-colors line-clamp-1">
                                                            {p.name}
                                                        </h3>
                                                        <p className="text-white/40 text-sm font-medium line-clamp-2 leading-relaxed">
                                                            {p.description || "لا يوجد وصف."}
                                                        </p>
                                                    </div>

                                                    <div className="flex gap-3 pt-6 border-t border-white/10 mt-auto w-full">
                                                        <Button onClick={() => handleEdit(p)} className="flex-1 h-14 rounded-[1.2rem] bg-white/10 hover:bg-white/20 text-white font-black text-sm transition-all flex items-center justify-center gap-2">
                                                            <Edit className="w-4 h-4" />
                                                            تعديل
                                                        </Button>
                                                        <Button onClick={() => setPlaylistToDelete(p)} variant="destructive" className="w-14 h-14 rounded-[1.2rem] bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 hover:border-red-500 transition-all shrink-0">
                                                            <Trash2 className="w-5 h-5" />
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="py-32 text-center space-y-8 bg-white/[0.02] border-2 border-dashed border-white/10 rounded-[4rem] backdrop-blur-md max-w-4xl mx-auto shadow-2xl relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-primary/5 blur-[100px] pointer-events-none" />
                                    <div className="w-32 h-32 rounded-full bg-white/5 flex items-center justify-center border border-white/10 mx-auto shadow-inner relative z-10">
                                        <Shield className="w-16 h-16 text-white/20" />
                                    </div>
                                    <div className="space-y-4 relative z-10">
                                        <h3 className="text-4xl font-black font-headline text-white/60">مكتبتك فارغة حالياً</h3>
                                        <p className="text-white/30 font-medium max-w-md mx-auto leading-relaxed text-lg">
                                            لم تقم بإنشاء أي قوائم تشغيل بعد. ابدأ الآن بإنشاء أول قائمة لتنظيم رحلتك العلمية.
                                        </p>
                                    </div>
                                    <Button onClick={handleNew} className="relative z-10 rounded-[2rem] h-16 px-12 bg-primary text-white font-black text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-transform gap-3">
                                        <PlusCircle className="w-6 h-6" />
                                        إنشاء أول قائمة
                                    </Button>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <DeleteConfirmationDialog 
                isOpen={!!playlistToDelete}
                onClose={() => setPlaylistToDelete(null)}
                onConfirm={handleDelete}
                title="حذف القائمة نهائياً"
                description={`هل أنت متأكد من رغبتك في حذف قائمة "${playlistToDelete?.name}"؟ هذا الإجراء لا يمكن التراجع عنه.`}
            />
        </div>
    );
}
