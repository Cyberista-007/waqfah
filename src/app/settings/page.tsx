'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { deleteUser, signOut, type User } from 'firebase/auth';
import { collection, doc, getDocs, writeBatch } from 'firebase/firestore';
import {
  Bell,
  Book,
  Bot,
  CaseSensitive,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Crown,
  Database,
  Droplets,
  Edit,
  ExternalLink,
  Globe,
  Grid,
  HardDriveDownload,
  ImageIcon,
  Info,
  ListMusic,
  Loader2,
  LogOut,
  MessageSquare,
  Palette,
  Settings,
  ShieldAlert,
  Sparkles,
  Trash2,
  UserX,
  Wifi,
  XCircle,
  Youtube,
} from 'lucide-react';

import type {
  Following,
  Lecture,
  ListenHistoryItem,
  NotificationSettings,
  Program,
  UserProfile,
} from '@/lib/types';
import {
  updateDocumentNonBlocking,
  useAuth,
  useCollection,
  useDoc,
  useFirestore,
  useMemoFirebase,
  useUser,
} from '@/firebase';
import { cn, formatBytes, getInitials } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAppearance } from '@/components/appearance-provider';
import { useTranslation } from '@/lib/i18n';
import { ThemeSwitcherDialog } from '@/components/theme-switcher';
import { FontSwitcherDialog } from '@/components/font-switcher';
import { PatternSwitcherDialog } from '@/components/pattern-switcher';
import { SolidColorSwitcherDialog } from '@/components/solid-color-switcher';
import { LanguageSwitcherDialog, languages } from '@/components/language-switcher';
import { DonationTierBadge } from '@/components/DonationTierBadge';
import { EditProfileForm } from '@/components/profile/edit-profile-form';
import { DeleteConfirmationDialog } from '@/components/admin/delete-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

type SettingsTab = 'appearance' | 'ai' | 'notifications' | 'account';

const SubViewHeader = ({ title, onBack }: { title: string; onBack: () => void }) => (
  <div className="flex items-center gap-3 mb-6">
    <Button onClick={onBack} variant="outline" size="icon" className="rounded-xl shrink-0">
      <ChevronRight className="h-5 w-5" />
    </Button>
    <h1 className="text-2xl font-black font-headline text-foreground">{title}</h1>
  </div>
);

const SettingsRow = ({
  icon: Icon,
  label,
  description,
  value,
  onClick,
  danger,
}: {
  icon: React.ElementType;
  label: string;
  description?: string;
  value?: string;
  onClick?: () => void;
  danger?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full flex items-center justify-between gap-4 p-4 rounded-2xl hover:bg-muted/50 transition-all text-right cursor-pointer group"
  >
    <div className="flex items-center gap-3.5 min-w-0">
      <div
        className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border',
          danger
            ? 'bg-destructive/10 border-destructive/20 text-destructive'
            : 'bg-primary/10 border-primary/20 text-primary'
        )}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <div className={cn('text-sm sm:text-base font-bold', danger ? 'text-destructive' : 'text-foreground')}>
          {label}
        </div>
        {description && <div className="text-xs text-muted-foreground mt-0.5 truncate">{description}</div>}
      </div>
    </div>
    <div className="flex items-center gap-2 shrink-0">
      {value && <span className="text-xs font-bold text-muted-foreground">{value}</span>}
      <ChevronLeft className="w-4 h-4 text-muted-foreground group-hover:-translate-x-0.5 transition-transform" />
    </div>
  </button>
);

function NotificationsView({
  onBack,
  onSelectNewEpisodes,
  userProfile,
  userId,
}: {
  onBack: () => void;
  onSelectNewEpisodes: () => void;
  userProfile: UserProfile;
  userId: string;
}) {
  const firestore = useFirestore();

  const handleSettingChange = (setting: keyof NotificationSettings, value: boolean) => {
    if (!firestore) return;
    const userRef = doc(firestore, 'users', userId);
    updateDocumentNonBlocking(userRef, {
      [`notificationSettings.${setting}`]: value,
    });
  };

  const newPrograms = userProfile?.notificationSettings?.newPrograms ?? true;
  const newPlaylists = userProfile?.notificationSettings?.newPlaylists ?? false;
  const newBooks = userProfile?.notificationSettings?.newBooks ?? true;

  return (
    <div className="max-w-3xl mx-auto py-6 px-4" dir="rtl">
      <SubViewHeader title="إعدادات الإشعارات" onBack={onBack} />
      <Card className="rounded-3xl luxury-card p-4 sm:p-6 space-y-2">
        <p className="text-xs font-bold text-muted-foreground px-2 pb-2">يصلني إشعار عند:</p>
        <SettingsRow
          icon={Bell}
          label="صدور حلقات جديدة"
          description="تخصيص الإشعارات لكل برنامج تتابعه"
          onClick={onSelectNewEpisodes}
        />
        <Separator />
        <div className="flex items-center justify-between p-4 rounded-2xl">
          <Label htmlFor="switch-new-programs" className="text-sm sm:text-base font-bold cursor-pointer flex items-center gap-3.5">
            <span className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Youtube className="w-5 h-5" />
            </span>
            <span>صدور برامج جديدة</span>
          </Label>
          <Switch
            id="switch-new-programs"
            checked={newPrograms}
            onCheckedChange={(value) => handleSettingChange('newPrograms', value)}
          />
        </div>
        <Separator />
        <div className="flex items-center justify-between p-4 rounded-2xl">
          <Label htmlFor="switch-new-playlists" className="text-sm sm:text-base font-bold cursor-pointer flex items-center gap-3.5">
            <span className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <ListMusic className="w-5 h-5" />
            </span>
            <span>صدور سلاسل وقوائم تشغيل جديدة</span>
          </Label>
          <Switch
            id="switch-new-playlists"
            checked={newPlaylists}
            onCheckedChange={(value) => handleSettingChange('newPlaylists', value)}
          />
        </div>
        <Separator />
        <div className="flex items-center justify-between p-4 rounded-2xl">
          <Label htmlFor="switch-new-books" className="text-sm sm:text-base font-bold cursor-pointer flex items-center gap-3.5">
            <span className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Book className="w-5 h-5" />
            </span>
            <span>إضافة كتب جديدة للمكتبة</span>
          </Label>
          <Switch
            id="switch-new-books"
            checked={newBooks}
            onCheckedChange={(value) => handleSettingChange('newBooks', value)}
          />
        </div>
      </Card>
    </div>
  );
}

function NewEpisodesView({ onBack }: { onBack: () => void }) {
  const { user } = useUser();
  const firestore = useFirestore();

  const followingPath = user ? `users/${user.uid}/following` : null;
  const { data: following, isLoading: followingLoading } = useCollection<Following>(followingPath);
  const { data: allPrograms, isLoading: programsLoading } = useCollection<Program>('programs');

  const isLoading = programsLoading || followingLoading;

  const followedPrograms = useMemo(() => {
    if (!allPrograms || !following) return [];
    const subscribedProgramIds = new Set(following.map((f) => f.programId));
    return allPrograms.filter((c) => subscribedProgramIds.has(c.id));
  }, [allPrograms, following]);

  const handleToggle = (programId: string, newState: boolean) => {
    if (!user || !firestore) return;
    const docRef = doc(firestore, 'users', user.uid, 'following', programId);
    updateDocumentNonBlocking(docRef, { notificationsEnabled: newState });
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4" dir="rtl">
      <SubViewHeader title="إشعارات الحلقات الجديدة" onBack={onBack} />
      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      ) : followedPrograms.length > 0 ? (
        <Card className="rounded-3xl luxury-card p-3 space-y-1">
          {followedPrograms.map((program) => {
            const followInfo = following?.find((f) => f.programId === program.id);
            const isEnabled = followInfo?.notificationsEnabled ?? true;

            return (
              <div
                key={program.id}
                className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-muted/50 transition-colors"
              >
                <Label htmlFor={`switch-${program.id}`} className="text-sm sm:text-base font-bold cursor-pointer flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={program.imageUrl} />
                    <AvatarFallback>{getInitials(program.name)}</AvatarFallback>
                  </Avatar>
                  <span>{program.name}</span>
                </Label>
                <Switch
                  id={`switch-${program.id}`}
                  checked={isEnabled}
                  onCheckedChange={(checked) => handleToggle(program.id, checked)}
                />
              </div>
            );
          })}
        </Card>
      ) : (
        <Card className="rounded-3xl luxury-card text-center p-10">
          <p className="text-muted-foreground font-medium mb-4">أنت لا تتابع أي برامج حالياً.</p>
          <Button asChild className="rounded-xl font-bold">
            <Link href="/programs">تصفح البرامج</Link>
          </Button>
        </Card>
      )}
    </div>
  );
}

function StorageManagementView({ onBack, user }: { onBack: () => void; user: User }) {
  const { toast } = useToast();
  const [downloadedLectures, setDownloadedLectures] = useState<(Lecture & { size: number })[]>([]);
  const [itemToDelete, setItemToDelete] = useState<(Lecture & { size: number }) | null>(null);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const { data: listenHistory, isLoading: historyLoading } = useCollection<ListenHistoryItem>(
    user ? `users/${user.uid}/listenHistory` : null
  );
  const { data: allLectures, isLoading: lecturesLoading } = useCollection<Lecture>('lectures');

  const isLoading = historyLoading || lecturesLoading;

  useEffect(() => {
    if (isLoading) return;
    if (listenHistory && allLectures) {
      const downloads = listenHistory
        .map((historyItem) => {
          const lecture = allLectures.find((l) => l.id === historyItem.lectureId);
          if (lecture) {
            const size = Math.round((lecture.duration / 60) * 1.5 * 1024 * 1024);
            return { ...lecture, size };
          }
          return null;
        })
        .filter((l): l is Lecture & { size: number } => !!l);
      setDownloadedLectures(downloads);
    }
  }, [listenHistory, allLectures, isLoading]);

  const totalSize = useMemo(() => downloadedLectures.reduce((acc, l) => acc + l.size, 0), [downloadedLectures]);
  const TOTAL_QUOTA = 5 * 1024 * 1024 * 1024;

  const handleDelete = (lectureId: string) => {
    setDownloadedLectures((prev) => prev.filter((l) => l.id !== lectureId));
    toast({ title: 'تم حذف العنصر من القائمة المحلية.' });
    setItemToDelete(null);
  };

  const handleDeleteAll = () => {
    setDownloadedLectures([]);
    toast({ variant: 'destructive', title: 'تم تفريغ جميع العناصر المحفوظة.' });
    setIsDeletingAll(false);
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4" dir="rtl">
      <SubViewHeader title="إدارة مساحة التخزين" onBack={onBack} />
      <Card className="rounded-3xl luxury-card">
        <CardHeader>
          <CardTitle className="font-headline font-black">مساحة التخزين المستخدمة</CardTitle>
          <CardDescription>
            استعرض المحاضرات المحفوظة في الذاكرة المؤقتة وأزل ما لا تحتاجه.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Progress value={(totalSize / TOTAL_QUOTA) * 100} />
            <div className="flex justify-between text-xs font-bold text-muted-foreground">
              <span>المستخدم: {formatBytes(totalSize)}</span>
              <span>السعة التقديرية: {formatBytes(TOTAL_QUOTA)}</span>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
          ) : downloadedLectures.length > 0 ? (
            <ScrollArea className="h-72 rounded-2xl border border-border/60 p-3">
              <div className="space-y-2">
                {downloadedLectures.map((lecture) => (
                  <div
                    key={lecture.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-background/50 border border-border/50"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{lecture.title}</p>
                      <p className="text-xs text-muted-foreground">{formatBytes(lecture.size)}</p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:bg-destructive/10 shrink-0"
                      onClick={() => setItemToDelete(lecture)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <p className="text-center text-sm text-muted-foreground py-8">لا توجد ملفات محفوظة حالياً.</p>
          )}

          {downloadedLectures.length > 0 && (
            <Button
              variant="destructive"
              onClick={() => setIsDeletingAll(true)}
              className="w-full rounded-xl font-bold"
            >
              <Trash2 className="w-4 h-4 ml-2" />
              تفريغ جميع المحفوظات
            </Button>
          )}
        </CardContent>
      </Card>

      <DeleteConfirmationDialog
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={() => itemToDelete && handleDelete(itemToDelete.id)}
        title="حذف المحاضرة المحفوظة"
        description={`هل تريد حذف "${itemToDelete?.title}" من المساحة المؤقتة؟`}
      />

      <DeleteConfirmationDialog
        isOpen={isDeletingAll}
        onClose={() => setIsDeletingAll(false)}
        onConfirm={handleDeleteAll}
        title="تفريغ المساحة بالكامل"
        description="سيتم مسح جميع المحاضرات المحفوظة مؤقتاً من هذه القائمة."
      />
    </div>
  );
}

export default function SettingsPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const { t, isRtl } = useTranslation();
  const bgFileInputRef = useRef<HTMLInputElement>(null);

  const {
    isBackgroundShown,
    toggleBackground,
    setBackground,
    language,
    aiApiKey,
    setAiApiKey,
    aiModel,
    setAiModel,
    showChatbot,
    setShowChatbot,
  } = useAppearance();

  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');
  const [view, setView] = useState<'main' | 'notifications' | 'newEpisodes' | 'storage'>('main');
  const [isEditing, setIsEditing] = useState(false);
  const [isThemeSwitcherOpen, setIsThemeSwitcherOpen] = useState(false);
  const [isFontSwitcherOpen, setIsFontSwitcherOpen] = useState(false);
  const [isLanguageSwitcherOpen, setIsLanguageSwitcherOpen] = useState(false);
  const [isPatternSwitcherOpen, setIsPatternSwitcherOpen] = useState(false);
  const [isSolidColorSwitcherOpen, setIsSolidColorSwitcherOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isClearHistoryConfirmOpen, setIsClearHistoryConfirmOpen] = useState(false);
  const [isClearingHistory, setIsClearingHistory] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [wifiOnly, setWifiOnly] = useState(true);

  useEffect(() => {
    const savedWifi = localStorage.getItem('waqfah_wifi_only');
    if (savedWifi !== null) setWifiOnly(savedWifi === 'true');
  }, []);

  const userDocRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  const onLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/');
    }
  };

  const handleBackgroundFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setBackground({ image: `url("${reader.result}")`, color: null, type: 'image' });
          toast({ title: 'تم تحديث صورة الخلفية بنجاح.' });
        }
      };
      reader.readAsDataURL(file);
    },
    [setBackground, toast]
  );

  const handleClearListenHistory = async () => {
    if (!user || !firestore) return;
    setIsClearingHistory(true);
    try {
      const snap = await getDocs(collection(firestore, 'users', user.uid, 'listenHistory'));
      const batch = writeBatch(firestore);
      snap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      toast({ title: 'تم مسح سجل الاستماع بنجاح.' });
    } catch {
      toast({ variant: 'destructive', title: 'تعذر مسح سجل الاستماع.' });
    } finally {
      setIsClearingHistory(false);
      setIsClearHistoryConfirmOpen(false);
    }
  };

  const handleDownloadData = async () => {
    if (isDownloading || !user || !firestore) {
      if (!user) {
        toast({ variant: 'destructive', title: 'خطأ', description: 'يجب تسجيل الدخول لتنزيل بياناتك.' });
      }
      return;
    }

    setIsDownloading(true);
    toast({ title: 'جاري تجهيز بياناتك...', description: 'قد تستغرق هذه العملية بضع لحظات.' });

    try {
      const userData: any = { profile: userProfile, subcollections: {} };
      const subcollections = [
        'favorites',
        'following',
        'listenHistory',
        'playlists',
        'notes',
        'user_challenges',
        'accountability',
        'user_badges',
        'curriculum_progress',
      ];

      for (const sub of subcollections) {
        const querySnapshot = await getDocs(collection(firestore, 'users', user.uid, sub));
        userData.subcollections[sub] = querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      }

      const dataStr = JSON.stringify(
        userData,
        (_key, value) => (value && typeof value === 'object' && value.toDate instanceof Function ? value.toDate().toISOString() : value),
        2
      );

      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${user.displayName || 'user'}-waqfah-data.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({ title: 'اكتمل التنزيل!', description: 'تم تنزيل بياناتك بنجاح.' });
    } catch {
      toast({ variant: 'destructive', title: 'فشل تنزيل البيانات', description: 'حدث خطأ غير متوقع.' });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || !auth || !firestore) {
      toast({ variant: 'destructive', title: 'خطأ', description: 'خدمات الحساب غير جاهزة.' });
      return;
    }

    setIsDeleting(true);
    try {
      const subcollections = [
        'favorites',
        'following',
        'listenHistory',
        'playlists',
        'notes',
        'user_challenges',
        'accountability',
        'user_badges',
        'curriculum_progress',
      ];

      const batch = writeBatch(firestore);
      for (const sub of subcollections) {
        const snap = await getDocs(collection(firestore, 'users', user.uid, sub));
        snap.forEach((d) => batch.delete(d.ref));
      }
      batch.delete(doc(firestore, 'users', user.uid));
      await batch.commit();
      await deleteUser(user);

      toast({ title: 'تم حذف الحساب بنجاح', description: 'نأمل أن نراك مرة أخرى قريباً.' });
    } catch (error: any) {
      let description = 'فشل حذف الحساب. يرجى المحاولة مرة أخرى.';
      if (error.code === 'auth/requires-recent-login') {
        description = 'تتطلب هذه العملية تسجيل الدخول مجدداً قبل الحذف.';
      }
      toast({ variant: 'destructive', title: 'حدث خطأ', description, duration: 8000 });
    } finally {
      setIsDeleting(false);
      setIsDeleteConfirmOpen(false);
    }
  };

  if (isUserLoading || (user && isProfileLoading)) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (view === 'notifications' && userProfile && user) {
    return (
      <NotificationsView
        onBack={() => setView('main')}
        onSelectNewEpisodes={() => setView('newEpisodes')}
        userProfile={userProfile}
        userId={user.uid}
      />
    );
  }

  if (view === 'newEpisodes') {
    return <NewEpisodesView onBack={() => setView('notifications')} />;
  }

  if (view === 'storage' && user) {
    return <StorageManagementView onBack={() => setView('main')} user={user} />;
  }

  const currentLanguageName = languages.find((l) => l.value === language)?.name || 'العربية';

  const tabs: { id: SettingsTab; label: string; icon: React.ElementType; desc: string }[] = [
    { id: 'appearance', label: t('المظهر واللغة', 'Appearance & Language'), icon: Palette, desc: t('السمة، الخطوط، والخلفيات', 'Themes, fonts & backgrounds') },
    { id: 'ai', label: t('المساعد الذكي', 'AI Assistant'), icon: Bot, desc: t('مفتاح Gemini والنموذج', 'Gemini API key & model') },
    { id: 'notifications', label: t('الإشعارات والتخزين', 'Notifications & Storage'), icon: Bell, desc: t('التنبيهات وإدارة المحفوظات', 'Alerts & offline cache') },
    { id: 'account', label: t('الحساب والبيانات', 'Account & Data'), icon: ShieldAlert, desc: t('التصدير وسجل الاستماع', 'Export & listen history') },
  ];

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8 space-y-8" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Hidden image uploader */}
      <input
        ref={bgFileInputRef}
        id="background-uploader-input"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleBackgroundFileUpload}
      />

      {/* Page Title & Profile Banner */}
      <header className="rounded-3xl luxury-glass border border-border/70 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        {user ? (
          <>
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-right">
              <Avatar className="h-20 w-20 border-2 border-primary/30">
                <AvatarImage src={user.photoURL || userProfile?.photoURL || ''} alt={user.displayName || 'User'} />
                <AvatarFallback className="text-2xl font-black bg-primary/15 text-primary">
                  {getInitials(user.displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2.5 justify-center sm:justify-start">
                  <h1 className="text-2xl font-black font-headline text-foreground">{user.displayName}</h1>
                  {userProfile && <DonationTierBadge tier={userProfile.donationTier} />}
                  {userProfile?.role === 'admin' && (
                    <Link href="/admin/dashboard">
                      <Badge variant="destructive" className="cursor-pointer">
                        وضع المدير
                      </Badge>
                    </Link>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                {userProfile?.bio && <p className="text-xs text-foreground/80 pt-1">{userProfile.bio}</p>}
              </div>
            </div>
            <div className="flex flex-wrap gap-2.5 shrink-0">
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="rounded-xl font-bold cursor-pointer">
                <Edit className="me-1.5 h-4 w-4" />
                {t('تعديل الملف', 'Edit Profile')}
              </Button>
              <Button onClick={onLogout} variant="ghost" size="sm" className="rounded-xl font-bold text-destructive hover:bg-destructive/10 cursor-pointer">
                <LogOut className="me-1.5 h-4 w-4" />
                {t('خروج', 'Sign Out')}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-start">
              <div className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
                <Settings className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl font-black font-headline text-foreground">{t('إعدادات المنصة', 'Platform Settings')}</h1>
                <p className="text-sm text-muted-foreground">
                  {t('سجل الدخول لحفظ تفضيلاتك، إشعاراتك، وسجل استماعك عبر أجهزتك.', 'Sign in to save your preferences, notifications, and listen history across devices.')}
                </p>
              </div>
            </div>
            <Button asChild className="rounded-xl font-black shrink-0">
              <Link href="/auth/login?redirect_to=/settings">{t('تسجيل الدخول / حساب جديد', 'Sign In / Create Account')}</Link>
            </Button>
          </>
        )}
      </header>

      {/* 2-Column Settings Workspace */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Category Navigation */}
        <aside className="md:col-span-4 flex md:flex-col gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-3 p-3.5 rounded-2xl border text-right transition-all shrink-0 md:w-full cursor-pointer',
                  isActive
                    ? 'bg-primary/15 border-primary/35 text-primary shadow-sm'
                    : 'bg-card/50 border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                <div
                  className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                    isActive ? 'bg-primary/20 text-primary' : 'bg-muted/50'
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="hidden md:block min-w-0">
                  <div className="text-sm font-black">{tab.label}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{tab.desc}</div>
                </div>
                <span className="md:hidden text-xs font-black whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Active Panel */}
        <div className="md:col-span-8">
          {activeTab === 'appearance' && (
            <Card className="rounded-3xl luxury-card p-4 sm:p-6 space-y-2">
              <div className="px-2 pb-2">
                <h2 className="text-xl font-black font-headline text-foreground">{t('المظهر واللغة', 'Appearance & Language')}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{t('خصّص شكل المنصة والخطوط بما يريح عينيك.', 'Customize the platform theme, fonts, and display language.')}</p>
              </div>
              <SettingsRow
                icon={Palette}
                label={t('السمة اللونية (الثيم)', 'Color Theme')}
                description={t('اختر من بين 19 سمة فاتحة وداكنة', 'Choose from 19 dark & light themes')}
                onClick={() => setIsThemeSwitcherOpen(true)}
              />
              <Separator />
              <SettingsRow
                icon={CaseSensitive}
                label={t('نوع الخط', 'Font Family')}
                description={t('اختر خط القراءة والعناوين المفضل', 'Select your preferred reading & heading font')}
                onClick={() => setIsFontSwitcherOpen(true)}
              />
              <Separator />
              <SettingsRow
                icon={Globe}
                label={t('اللغة', 'Language')}
                value={currentLanguageName}
                onClick={() => setIsLanguageSwitcherOpen(true)}
              />
              <Separator />
              <SettingsRow
                icon={Droplets}
                label={t('الألوان السادة للخلفية', 'Solid Background Colors')}
                onClick={() => setIsSolidColorSwitcherOpen(true)}
              />
              <Separator />
              <SettingsRow
                icon={Grid}
                label={t('اختيار نمط خلفية', 'Background Pattern')}
                onClick={() => setIsPatternSwitcherOpen(true)}
              />
              <Separator />
              <SettingsRow
                icon={ImageIcon}
                label={t('رفع صورة خلفية مخصصة', 'Upload Custom Background')}
                onClick={() => bgFileInputRef.current?.click()}
              />
              <Separator />
              <div className="flex items-center justify-between p-4 rounded-2xl">
                <Label htmlFor="bg-switch" className="text-sm sm:text-base font-bold cursor-pointer flex items-center gap-3.5">
                  <span className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <ImageIcon className="w-5 h-5" />
                  </span>
                  <span>{t('إظهار الخلفية المخصصة', 'Show Custom Background')}</span>
                </Label>
                <Switch id="bg-switch" checked={isBackgroundShown} onCheckedChange={toggleBackground} />
              </div>
            </Card>
          )}

          {activeTab === 'ai' && (
            <Card className="rounded-3xl luxury-card p-6 space-y-6">
              <div>
                <h2 className="text-xl font-black font-headline text-foreground">{t('المساعد الذكي (Gemini AI)', 'AI Assistant (Gemini AI)')}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t('إعدادات المساعد العلمي الذكي لتلخيص الدروس والإجابة عن الاستفسارات.', 'Configure the AI assistant for lecture summaries and Q&A.')}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label htmlFor="ai-api-key" className="text-sm font-bold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span>{t('مفتاح Gemini API', 'Gemini API Key')}</span>
                  </Label>
                  <Link
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    <span>{t('احصل على مفتاح مجاني', 'Get a free key')}</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                <div className="relative">
                  <Input
                    id="ai-api-key"
                    type="password"
                    placeholder={t('أدخل مفتاح الـ API الخاص بك هنا...', 'Enter your Gemini API key here...')}
                    value={aiApiKey || ''}
                    onChange={(e) => setAiApiKey(e.target.value)}
                    className="h-12 bg-background/60 border-border rounded-xl font-mono pl-24"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    {aiApiKey ? (
                      <span className="inline-flex items-center gap-1 text-emerald-500 text-xs font-black">
                        <CheckCircle2 className="w-4 h-4" />
                        {t('مفعل', 'Active')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-muted-foreground text-xs font-bold">
                        <XCircle className="w-4 h-4" />
                        {t('غير مفعل', 'Inactive')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                    {t('يُحفظ هذا المفتاح محلياً في متصفحك فقط ولا يُرسل إلى خوادمنا إلا لتنفيذ طلبات الذكاء الاصطناعي.', 'This key is stored locally in your browser only and is used solely to process AI requests.')}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label htmlFor="ai-model-select" className="text-sm font-bold flex items-center gap-2">
                  <Bot className="w-4 h-4 text-primary" />
                  <span>{t('نموذج الذكاء الاصطناعي', 'AI Model')}</span>
                </Label>
                <Select value={aiModel} onValueChange={setAiModel}>
                  <SelectTrigger id="ai-model-select" className="h-12 bg-background/60 border-border rounded-xl">
                    <SelectValue placeholder={t('اختر نموذجاً...', 'Select a model...')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemini-4-hydrogen">Gemini 4 Hydrogen ({t('الأحدث والأسرع', 'Latest & Fastest')})</SelectItem>
                    <SelectItem value="gemini-3.8-flash">Gemini 3.8 Flash</SelectItem>
                    <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
                    <SelectItem value="gemini-2.5-pro">Gemini 2.5 Pro ({t('للمسائل المعقدة', 'Complex Reasoning')})</SelectItem>
                    <SelectItem value="gemini-2.0-flash">Gemini 2.0 Flash</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <div>
                    <Label htmlFor="show-chatbot-switch" className="text-sm font-bold cursor-pointer block">
                      {t('إظهار أيقونة المساعد الذكي', 'Show Floating AI Assistant')}
                    </Label>
                    <span className="text-xs text-muted-foreground">{t('إظهار أو إخفاء زر المساعد العائم أسفل الشاشة', 'Show or hide the floating assistant button')}</span>
                  </div>
                </div>
                <Switch id="show-chatbot-switch" checked={showChatbot} onCheckedChange={setShowChatbot} />
              </div>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card className="rounded-3xl luxury-card p-4 sm:p-6 space-y-2">
              <div className="px-2 pb-2">
                <h2 className="text-xl font-black font-headline text-foreground">{t('الإشعارات والتخزين', 'Notifications & Storage')}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{t('التحكم بالتنبيهات وسعة التخزين المؤقتة.', 'Manage alerts and offline cache storage.')}</p>
              </div>

              {user ? (
                <>
                  <SettingsRow
                    icon={Bell}
                    label={t('تفضيلات الإشعارات', 'Notification Preferences')}
                    description={t('تنبيهات الحلقات الجديدة والبرامج والكتب', 'Alerts for new episodes, programs & books')}
                    onClick={() => setView('notifications')}
                  />
                  <Separator />
                  <SettingsRow
                    icon={Database}
                    label={t('إدارة مساحة التخزين', 'Manage Storage')}
                    description={t('عرض وحذف المحاضرات المحفوظة مؤقتاً', 'View and remove cached lectures')}
                    onClick={() => setView('storage')}
                  />
                  <Separator />
                </>
              ) : (
                <div className="p-4 rounded-2xl bg-muted/40 text-xs text-muted-foreground font-medium mb-2">
                  {t('سجل الدخول للوصول إلى إشعارات البرامج وإدارة مساحة التخزين الخاصة بحسابك.', 'Sign in to manage your program notifications and storage.')}
                </div>
              )}

              <div className="flex items-center justify-between p-4 rounded-2xl">
                <Label htmlFor="wifi-only-switch" className="text-sm sm:text-base font-bold cursor-pointer flex items-center gap-3.5">
                  <span className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <Wifi className="w-5 h-5" />
                  </span>
                  <span>{t('التنزيل عبر Wi-Fi فقط', 'Download over Wi-Fi only')}</span>
                </Label>
                <Switch
                  id="wifi-only-switch"
                  checked={wifiOnly}
                  onCheckedChange={(checked) => {
                    setWifiOnly(checked);
                    localStorage.setItem('waqfah_wifi_only', String(checked));
                  }}
                />
              </div>
            </Card>
          )}

          {activeTab === 'account' && (
            <Card className="rounded-3xl luxury-card p-4 sm:p-6 space-y-2">
              <div className="px-2 pb-2">
                <h2 className="text-xl font-black font-headline text-foreground">{t('الحساب والبيانات', 'Account & Data')}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{t('تصدير بياناتك الشخصية أو إدارة سجلات الحساب.', 'Export your personal data or manage account records.')}</p>
              </div>

              {user ? (
                <>
                  <SettingsRow
                    icon={isClearingHistory ? Loader2 : Trash2}
                    label={t('مسح سجل الاستماع', 'Clear Listen History')}
                    description={t('حذف سجل المحاضرات التي استمعت إليها', 'Delete your listening history records')}
                    onClick={() => setIsClearHistoryConfirmOpen(true)}
                  />
                  <Separator />
                  <SettingsRow
                    icon={isDownloading ? Loader2 : HardDriveDownload}
                    label={isDownloading ? t('جاري تجهيز البيانات...', 'Preparing your data...') : t('تنزيل نسخة من بياناتي (JSON)', 'Download My Data (JSON)')}
                    description={t('تصدير المفضلة وقوائم التشغيل والتقدم العلمي', 'Export favorites, playlists & progress')}
                    onClick={handleDownloadData}
                  />
                  <Separator />
                  <SettingsRow
                    icon={UserX}
                    label={t('حذف الحساب نهائياً', 'Delete Account Permanently')}
                    description={t('حذف الحساب وكافة البيانات المرتبطة به', 'Permanently remove your account and all data')}
                    danger
                    onClick={() => setIsDeleteConfirmOpen(true)}
                  />
                </>
              ) : (
                <div className="p-8 text-center space-y-3">
                  <Crown className="w-10 h-10 text-primary/40 mx-auto" />
                  <p className="font-bold text-foreground">{t('الحساب والبيانات محمية', 'Account & Data Protected')}</p>
                  <p className="text-xs text-muted-foreground">
                    {t('يرجى تسجيل الدخول لتصدير بياناتك أو إدارة سجل الاستماع.', 'Please sign in to export your data or manage listen history.')}
                  </p>
                  <Button asChild size="sm" className="rounded-xl font-bold mt-2">
                    <Link href="/auth/login?redirect_to=/settings">{t('تسجيل الدخول', 'Sign In')}</Link>
                  </Button>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="p-0 border-0 max-w-2xl bg-transparent">
          <DialogHeader className="sr-only">
            <DialogTitle>تعديل الملف الشخصي</DialogTitle>
          </DialogHeader>
          {user && userProfile && (
            <EditProfileForm user={user} userProfile={userProfile} onClose={() => setIsEditing(false)} />
          )}
        </DialogContent>
      </Dialog>

      <ThemeSwitcherDialog isOpen={isThemeSwitcherOpen} onOpenChange={setIsThemeSwitcherOpen} />
      <FontSwitcherDialog isOpen={isFontSwitcherOpen} onOpenChange={setIsFontSwitcherOpen} />
      <LanguageSwitcherDialog isOpen={isLanguageSwitcherOpen} onOpenChange={setIsLanguageSwitcherOpen} />
      <PatternSwitcherDialog isOpen={isPatternSwitcherOpen} onOpenChange={setIsPatternSwitcherOpen} />
      <SolidColorSwitcherDialog isOpen={isSolidColorSwitcherOpen} onOpenChange={setIsSolidColorSwitcherOpen} />

      <DeleteConfirmationDialog
        isOpen={isClearHistoryConfirmOpen}
        onClose={() => setIsClearHistoryConfirmOpen(false)}
        onConfirm={handleClearListenHistory}
        title="هل تريد مسح سجل الاستماع؟"
        description="سيتم حذف سجل المحاضرات التي استمعت إليها من حسابك بشكل دائم."
        confirmButtonText={isClearingHistory ? 'جاري المسح...' : 'نعم، امسح السجل'}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeleteAccount}
        title="هل أنت متأكد من حذف حسابك؟"
        description="سيتم حذف جميع بياناتك بشكل دائم، بما في ذلك قوائم التشغيل والمفضلة وسجل الاستماع."
        confirmButtonText={isDeleting ? 'جاري الحذف...' : 'نعم، قم بحذف حسابي'}
      />
    </div>
  );
}
