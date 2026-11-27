'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCollection, useUser, useFirestore } from '@/firebase';
import type { Playlist, Lecture } from '@/lib/types';
import {
  Loader2,
  PlusCircle,
  Edit,
  Trash2,
  ArrowRight,
  Lock,
  Globe,
  ListMusic,
  Play,
} from 'lucide-react';
import { PlaylistForm } from '@/components/profile/playlist-form';
import { DeleteConfirmationDialog } from '@/components/admin/delete-dialog';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

export default function ManagePlaylistsPage() {
  const { t, isRtl } = useTranslation();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const firestore = useFirestore();

  const playlistsPath = user ? `users/${user.uid}/playlists` : null;
  const { data: playlists, isLoading: playlistsLoading } = useCollection<Playlist>(playlistsPath, {
    orderBy: ['createdAt', 'desc'],
  });
  const { data: allLectures, isLoading: lecturesLoading } = useCollection<Lecture>('lectures');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [playlistToEdit, setPlaylistToEdit] = useState<Playlist | null>(null);
  const [playlistToDelete, setPlaylistToDelete] = useState<Playlist | null>(null);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth/login?redirect_to=/profile/playlists');
    }
  }, [isUserLoading, user, router]);

  if (isUserLoading || !user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
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
      title: t('تم الحذف بنجاح', 'Deleted successfully'),
      description: `${t('تم حذف قائمة التشغيل', 'Deleted playlist')} "${playlistToDelete.name}".`,
    });
    setPlaylistToDelete(null);
  };

  const isLoading = playlistsLoading || lecturesLoading;

  return (
    <div className="min-h-screen pb-20" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-3 sm:px-6 pt-6 md:pt-10 space-y-8 max-w-6xl">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/60">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
              <ListMusic className="w-3.5 h-3.5" />
              <span>{t('لوحة التحكم الشخصية', 'Personal Library')}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black font-headline text-foreground tracking-tight">
              {t('إدارة', 'Manage')} <span className="text-primary">{t('قوائم التشغيل', 'Playlists')}</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              {t('أنشئ ورتّب قوائمك الصوتية والمرئية بكل سهولة.', 'Create and organize your audio & video playlists.')}
            </p>
          </div>

          {!isFormOpen && (
            <div className="flex items-center gap-2.5">
              <Button asChild variant="outline" className="h-10 px-4 rounded-xl font-bold gap-2">
                <Link href="/playlists">
                  <ArrowRight className="w-4 h-4" />
                  <span>{t('القوائم العامة', 'Public Playlists')}</span>
                </Link>
              </Button>
              <Button onClick={handleNew} className="h-10 px-5 rounded-xl font-bold gap-2">
                <PlusCircle className="w-4 h-4" />
                <span>{t('قائمة جديدة', 'New Playlist')}</span>
              </Button>
            </div>
          )}
        </header>

        {isFormOpen ? (
          <div className="bg-card/85 backdrop-blur-xl border border-border rounded-3xl p-4 sm:p-6 shadow-sm">
            <PlaylistForm
              playlist={playlistToEdit}
              allLectures={allLectures || []}
              onFormClose={handleFormClose}
              userId={user.uid}
            />
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-[220px] rounded-2xl bg-muted/50 animate-pulse border border-border" />
            ))}
          </div>
        ) : playlists && playlists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {playlists.map((p) => (
              <div
                key={p.id}
                className="flex flex-col rounded-2xl border border-border bg-card/80 p-5 space-y-4 shadow-sm hover:border-primary/40 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <ListMusic className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="secondary" className="text-[11px] font-bold">
                      {p.lectureIds?.length || 0} {t('مادة', 'Items')}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[11px] font-bold gap-1',
                        p.isPublic ? 'text-emerald-500 border-emerald-500/30' : 'text-muted-foreground'
                      )}
                    >
                      {p.isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      <span>{p.isPublic ? t('عامة', 'Public') : t('خاصة', 'Private')}</span>
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1 flex-1">
                  <h3 className="text-lg font-bold text-foreground line-clamp-1">{p.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {p.description || t('لا يوجد وصف.', 'No description.')}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-border/60">
                  <Button asChild variant="outline" className="h-9 px-3 rounded-xl font-bold text-xs gap-1.5">
                    <Link href={`/playlists/${p.id}?u=${user.uid}`}>
                      <Play className="w-3.5 h-3.5" />
                      <span>{t('فتح', 'Open')}</span>
                    </Link>
                  </Button>
                  <Button
                    onClick={() => handleEdit(p)}
                    variant="secondary"
                    className="flex-1 h-9 rounded-xl font-bold text-xs gap-1.5"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>{t('تعديل', 'Edit')}</span>
                  </Button>
                  <Button
                    onClick={() => setPlaylistToDelete(p)}
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-xl text-destructive hover:bg-destructive/10 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center space-y-4 bg-card/50 border border-dashed border-border rounded-3xl">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto text-muted-foreground">
              <ListMusic className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">
                {t('مكتبتك فارغة حالياً', 'Your playlist library is empty')}
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                {t(
                  'لم تقم بإنشاء أي قوائم تشغيل بعد. ابدأ الآن بإنشاء أول قائمة لتنظيم محاضراتك.',
                  'Create your first playlist to organize your favorite lectures.'
                )}
              </p>
            </div>
            <Button onClick={handleNew} className="rounded-xl h-10 px-6 font-bold gap-2">
              <PlusCircle className="w-4 h-4" />
              <span>{t('إنشاء أول قائمة', 'Create First Playlist')}</span>
            </Button>
          </div>
        )}
      </div>

      <DeleteConfirmationDialog
        isOpen={!!playlistToDelete}
        onClose={() => setPlaylistToDelete(null)}
        onConfirm={handleDelete}
        title={t(`حذف "${playlistToDelete?.name}"؟`, `Delete "${playlistToDelete?.name}"?`)}
        description={t(
          'هل أنت متأكد من رغبتك في حذف قائمة التشغيل هذه؟ هذا الإجراء لا يمكن التراجع عنه.',
          'Are you sure you want to delete this playlist? This action cannot be undone.'
        )}
      />
    </div>
  );
}
