
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
import { Loader2, PlusCircle, Edit, Trash2 } from "lucide-react";
import { PlaylistForm } from "@/components/profile/playlist-form";
import { DeleteConfirmationDialog } from "@/components/admin/delete-dialog";
import { doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-16 w-16 animate-spin" /></div>;
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
            variant: "destructive",
            title: "تم الحذف بنجاح",
            description: `تم حذف قائمة التشغيل "${playlistToDelete.name}".`,
        });
        setPlaylistToDelete(null);
    };

    if (isFormOpen) {
        return <PlaylistForm 
            playlist={playlistToEdit} 
            allLectures={allLectures || []} 
            onFormClose={handleFormClose} 
            userId={user.uid}
        />;
    }
    
    const isLoading = playlistsLoading || lecturesLoading;

    return (
       <>
        <Card>
            <CardHeader className="flex flex-row justify-between items-start">
                <div>
                <CardTitle className="text-2xl font-headline">إدارة قوائم التشغيل</CardTitle>
                <CardDescription>
                    قم بإنشاء وتعديل قوائم التشغيل الخاصة بك.
                </CardDescription>
                </div>
                <div className="flex gap-2">
                    <Button asChild variant="outline"><Link href="/profile">العودة للملف الشخصي</Link></Button>
                    <Button onClick={handleNew}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    إنشاء قائمة جديدة
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                     <div className="text-center p-8"><Loader2 className="mx-auto my-8 h-8 w-8 animate-spin" /></div>
                ): playlists && playlists.length > 0 ? (
                     <div className="space-y-4">
                        {playlists.map(p => (
                            <div key={p.id} className="border p-4 rounded-lg flex justify-between items-center">
                                <div>
                                    <h3 className="font-semibold text-lg">{p.name}</h3>
                                    <p className="text-sm text-muted-foreground">{p.lectureIds?.length || 0} محاضرة</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={() => handleEdit(p)} variant="outline" size="sm">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button onClick={() => setPlaylistToDelete(p)} variant="destructive" size="sm">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ): (
                    <p className="py-8 text-center text-muted-foreground">لم تقم بإنشاء أي قوائم تشغيل بعد.</p>
                )}
            </CardContent>
        </Card>
         <DeleteConfirmationDialog 
          isOpen={!!playlistToDelete}
          onClose={() => setPlaylistToDelete(null)}
          onConfirm={handleDelete}
          title="حذف قائمة التشغيل"
          description={`هل أنت متأكد من رغبتك في حذف قائمة "${playlistToDelete?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        />
       </>
    );
}
