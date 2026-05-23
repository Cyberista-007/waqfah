
'use client';

import {
  Bell,
  ChevronRight,
  ChevronLeft,
  Download,
  Globe,
  Headphones,
  History,
  Loader2,
  LogOut,
  Sparkles,
  User as UserIcon,
  Edit,
  Book,
  ListMusic,
  Youtube,
  ImageIcon,
  Palette,
  CaseSensitive,
  Grid,
  XCircle,
  Bot,

  DownloadCloud,
  Wifi,
  Database,
  Contrast,
  Trash2,
  HardDriveDownload,
  UserX,
  Crown,
  Link as LinkIcon,
  Smartphone,
  PlayCircle,
  Stamp,
  Eye,
  X,
  ExternalLink,
  CheckCircle2,
  Info,
  Wind,
  Layers as LayersIcon,
  Zap,
  Activity,
  Droplets,
  Waves,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection, updateDocumentNonBlocking, useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { doc, collection, deleteDoc, getDocs, writeBatch } from 'firebase/firestore';
import type { UserProfile, Following, Program, NotificationSettings, Lecture, ListenHistoryItem } from '@/lib/types';
import { getInitials, formatBytes } from '@/lib/utils';
import { EditProfileForm } from '@/components/profile/edit-profile-form';
import { signOut, deleteUser } from 'firebase/auth';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ThemeSwitcherDialog, themes } from '@/components/theme-switcher';
import { FontSwitcherDialog } from '@/components/font-switcher';
import { useAppearance, BackgroundEffect, ParticleSettings, gradientPresets, liquidImagePresets } from '@/components/appearance-provider';
import { PatternSwitcherDialog } from '@/components/pattern-switcher';
import { SolidColorSwitcherDialog } from '@/components/solid-color-switcher';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { DonationTierBadge } from '@/components/DonationTierBadge';
import { LanguageSwitcherDialog, languages } from '@/components/language-switcher';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { DeleteConfirmationDialog } from '@/components/admin/delete-dialog';
import type { User } from 'firebase/auth';


const SettingsHeader = ({ title, onBack }: { title: string, onBack: () => void }) => (
    <div className="flex items-center gap-2 mb-4">
        <Button onClick={onBack} variant="ghost" size="icon" className="shrink-0">
            <ChevronRight className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-bold font-headline">{title}</h1>
    </div>
);

const SettingsItem = ({
  icon: Icon,
  label,
  value,
  href,
  onClick,
  className,
}: {
  icon: React.ElementType;
  label: string;
  value?: string;
  href?: string;
  onClick?: () => void;
  className?: string;
}) => {
  const content = (
    <div className={cn("flex items-center py-3 px-2", className)}>
      <Icon className="w-6 h-6 me-4 text-muted-foreground" />
      <span className="flex-grow text-lg">{label}</span>
      {value && <span className="text-muted-foreground text-lg me-2">{value}</span>}
      <ChevronLeft className="w-5 h-5 text-muted-foreground" />
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block text-right hover:bg-muted/50 rounded-lg transition-colors">
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className="w-full text-right hover:bg-muted/50 rounded-lg transition-colors">
      {content}
    </button>
  );
};


const SectionTitle = ({ title }: { title: string }) => (
  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-2 pt-6 pb-2">
    {title}
  </h2>
);

function NotificationsView({ onBack, onSelectNewEpisodes, userProfile, userId }: { onBack: () => void; onSelectNewEpisodes: () => void; userProfile: UserProfile; userId: string; }) {
    const firestore = useFirestore();

    const handleSettingChange = (setting: keyof NotificationSettings, value: boolean) => {
        if (!firestore) return;

        const userRef = doc(firestore, 'users', userId);
        updateDocumentNonBlocking(userRef, {
            [`notificationSettings.${setting}`]: value
        });
    };
    
    const newPrograms = userProfile?.notificationSettings?.newPrograms ?? true;
    const newPlaylists = userProfile?.notificationSettings?.newPlaylists ?? false;
    const newBooks = userProfile?.notificationSettings?.newBooks ?? true;

    return (
        <div>
            <SettingsHeader title="الإشعارات" onBack={onBack} />
            <div className="bg-card rounded-xl p-2">
                <div className="px-2 py-3">
                    <p className="text-muted-foreground">يصلني اشعار عندما:</p>
                </div>
                <button onClick={onSelectNewEpisodes} className="w-full text-right hover:bg-muted/50 rounded-lg transition-colors">
                    <div className="flex items-center justify-between py-3 px-2">
                        <div className="flex items-center gap-4">
                            <Bell className="w-6 h-6 text-muted-foreground" />
                            <span className="text-lg">عند صدور حلقات جديدة</span>
                        </div>
                        <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                    </div>
                </button>
                <Separator />
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
                    <Label htmlFor="switch-new-programs" className="text-lg cursor-pointer flex items-center gap-4">
                        <Youtube className="w-6 h-6 text-muted-foreground" />
                        <span>عند صدور برامج جديدة</span>
                    </Label>
                    <Switch
                        id="switch-new-programs"
                        checked={newPrograms}
                        onCheckedChange={(value) => handleSettingChange('newPrograms', value)}
                    />
                </div>
                <Separator />
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
                    <Label htmlFor="switch-new-playlists" className="text-lg cursor-pointer flex items-center gap-4">
                        <ListMusic className="w-6 h-6 text-muted-foreground" />
                        <span>عند صدور قوائم تشغيل جديدة</span>
                    </Label>
                    <Switch
                        id="switch-new-playlists"
                        checked={newPlaylists}
                        onCheckedChange={(value) => handleSettingChange('newPlaylists', value)}
                    />
                </div>
                <Separator />
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
                    <Label htmlFor="switch-new-books" className="text-lg cursor-pointer flex items-center gap-4">
                        <Book className="w-6 h-6 text-muted-foreground" />
                        <span>عند صدور كتب جديدة</span>
                    </Label>
                    <Switch
                        id="switch-new-books"
                        checked={newBooks}
                        onCheckedChange={(value) => handleSettingChange('newBooks', value)}
                    />
                </div>
            </div>
        </div>
    );
}

function NewEpisodesView({ onBack }: { onBack: () => void; }) {
    const { user } = useUser();
    const firestore = useFirestore();

    const followingPath = user ? `users/${user.uid}/following` : null;
    const { data: following, isLoading: followingLoading } = useCollection<Following>(followingPath);

    const [followedPrograms, setFollowedPrograms] = useState<Program[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const { data: allPrograms, isLoading: programsLoading } = useCollection<Program>('programs');

     useState(() => {
        if (programsLoading || followingLoading || !allPrograms || !following) {
             if (!programsLoading && !followingLoading) {
                setIsLoading(false);
             }
            return;
        };
        
        const subscribedProgramIds = following.map(f => f.programId);
        const subscribedPrograms = allPrograms.filter(c => subscribedProgramIds.includes(c.id));
        setFollowedPrograms(subscribedPrograms);
        setIsLoading(false);

    });

    const handleToggle = (programId: string, newState: boolean) => {
        if (!user || !firestore) return;
        const docRef = doc(firestore, 'users', user.uid, 'following', programId);
        updateDocumentNonBlocking(docRef, { notificationsEnabled: newState });
    };

    return (
        <div>
            <SettingsHeader title="عند صدور حلقات جديدة" onBack={onBack} />
             {isLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8" /></div>
            ) : followedPrograms.length > 0 ? (
                <div className="bg-card rounded-xl p-2 space-y-1">
                    {followedPrograms.map(program => {
                        const followInfo = following?.find(f => f.programId === program.id);
                        // Default to true if the field is not set
                        const isEnabled = followInfo?.notificationsEnabled ?? true;

                        return (
                             <div key={program.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
                                <Label htmlFor={`switch-${program.id}`} className="text-lg cursor-pointer flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={program.imageUrl} />
                                        <AvatarFallback>{getInitials(program.name)}</AvatarFallback>
                                    </Avatar>
                                    {program.name}
                                </Label>
                                <Switch
                                    id={`switch-${program.id}`}
                                    checked={isEnabled}
                                    onCheckedChange={(checked) => handleToggle(program.id, checked)}
                                />
                            </div>
                        )
                    })}
                </div>
            ) : (
                <Card className="text-center">
                    <CardContent className="p-8">
                        <p className="text-muted-foreground">أنت لا تتابع أي برامج حاليًا.</p>
                        <Button variant="link" asChild><Link href="/programs">تصفح البرامج</Link></Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

function StorageManagementView({ onBack, user }: { onBack: () => void; user: User }) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [downloadedLectures, setDownloadedLectures] = useState<(Lecture & { size: number })[]>([]);
    const [itemToDelete, setItemToDelete] = useState<(Lecture & { size: number }) | null>(null);
    const [isDeletingAll, setIsDeletingAll] = useState(false);

    const { data: listenHistory, isLoading: historyLoading } = useCollection<ListenHistoryItem>(user ? `users/${user.uid}/listenHistory` : null);
    const { data: allLectures, isLoading: lecturesLoading } = useCollection<Lecture>('lectures');

    useEffect(() => {
        if (historyLoading || lecturesLoading) return;

        if (listenHistory && allLectures) {
            const downloads = listenHistory.map(historyItem => {
                const lecture = allLectures.find(l => l.id === historyItem.lectureId);
                if (lecture) {
                    const size = Math.round((lecture.duration / 60) * 1.5 * 1024 * 1024); // Fake size: 1.5MB per minute
                    return { ...lecture, size };
                }
                return null;
            }).filter((l): l is Lecture & { size: number } => !!l);
            setDownloadedLectures(downloads);
        }
        setIsLoading(false);
    }, [listenHistory, allLectures, historyLoading, lecturesLoading]);

    const totalSize = useMemo(() => downloadedLectures.reduce((acc, l) => acc + l.size, 0), [downloadedLectures]);
    const FAKE_TOTAL_STORAGE = 5 * 1024 * 1024 * 1024; // 5 GB

    const handleDelete = (lectureId: string) => {
        // In a real app, you would also delete from device storage and firestore listen history.
        setDownloadedLectures(prev => prev.filter(l => l.id !== lectureId));
        toast({ title: "تم حذف التنزيل." });
        setItemToDelete(null);
    };
    
    const handleDeleteAll = () => {
        setDownloadedLectures([]);
        toast({ variant: 'destructive', title: "تم حذف جميع التنزيلات." });
        setIsDeletingAll(false);
    }

    return (
        <div>
            <SettingsHeader title="إدارة مساحة التخزين" onBack={onBack} />
            <Card>
                <CardHeader>
                    <CardTitle>مساحة التخزين المستخدمة</CardTitle>
                    <CardDescription>
                        هنا يمكنك رؤية المحاضرات التي تم تنزيلها وحذفها لتوفير مساحة على جهازك.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Progress value={(totalSize / FAKE_TOTAL_STORAGE) * 100} />
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>المستخدم: {formatBytes(totalSize)}</span>
                            <span>الإجمالي المتوفر: {formatBytes(FAKE_TOTAL_STORAGE)}</span>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button variant="destructive" onClick={() => setIsDeletingAll(true)} disabled={downloadedLectures.length === 0}>
                            <Trash2 className="me-2 h-4 w-4" />
                            حذف جميع التنزيلات
                        </Button>
                    </div>

                    <ScrollArea className="h-96 rounded-md border p-2">
                        <div className="space-y-2 p-2">
                            {isLoading ? (
                                <div className="text-center p-4 flex justify-center"><Loader2 className="animate-spin" /></div>
                            ) : downloadedLectures.length > 0 ? (
                                downloadedLectures.map(lecture => (
                                    <div key={lecture.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                                        <div>
                                            <p className="font-semibold">{lecture.title}</p>
                                            <p className="text-sm text-muted-foreground">{formatBytes(lecture.size)}</p>
                                        </div>
                                        <Button size="icon" variant="ghost" onClick={() => setItemToDelete(lecture)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-muted-foreground p-8">لا توجد تنزيلات حالياً.</p>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

            {itemToDelete && <DeleteConfirmationDialog
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                onConfirm={() => handleDelete(itemToDelete!.id)}
                title={`حذف "${itemToDelete?.title}"؟`}
                description="سيتم حذف الملف من جهازك. هل أنت متأكد؟"
            />}
            <DeleteConfirmationDialog
                isOpen={isDeletingAll}
                onClose={() => setIsDeletingAll(false)}
                onConfirm={handleDeleteAll}
                title={`حذف جميع التنزيلات؟`}
                description={`سيتم حذف ${downloadedLectures.length} ملف من جهازك. هل أنت متأكد؟`}
            />
        </div>
    );
}

const hexToHSL = (hex: string): string => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
        r = parseInt(hex.substring(1, 3), 16);
        g = parseInt(hex.substring(3, 5), 16);
        b = parseInt(hex.substring(5, 7), 16);
    }
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export default function SettingsPage() {
    const { user, isUserLoading } = useUser();
    const auth = useAuth();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();
    const { 
        isBackgroundShown, 
        toggleBackground, 
        particleColor, 
        setParticleColor,
        backgroundEffect,
        setBackgroundEffect,
        particleSettings,
        setParticleSettings,
        language,
        aiApiKey,
        setAiApiKey,
        aiModel,
        setAiModel,
        gradientPreset: activePreset, 
        setGradientPreset,
        customColors,
        setCustomColors,
        auroraSpeed,
        setAuroraSpeed,
        auroraBlur,
        setAuroraBlur,
        auroraComplexity,
        setAuroraComplexity,
        auroraChaos,
        setAuroraChaos,
        auroraSaturation,
        setAuroraSaturation,
        auroraGrain,
        setAuroraGrain,
        liquidImageSourceType,
        setLiquidImageSourceType,
        liquidImageImage,
        setLiquidImageImage,
        liquidImageVideo,
        setLiquidImageVideo,
        liquidImageStrength,
        setLiquidImageStrength,
        liquidImageSpeed,
        setLiquidImageSpeed
    } = useAppearance();

    const [view, setView] = useState<'main' | 'notifications' | 'newEpisodes' | 'storage'>('main');
    const [isEditing, setIsEditing] = useState(false);
    const [isThemeSwitcherOpen, setIsThemeSwitcherOpen] = useState(false);
    const [isFontSwitcherOpen, setIsFontSwitcherOpen] = useState(false);
    const [isLanguageSwitcherOpen, setIsLanguageSwitcherOpen] = useState(false);
    const [isPatternSwitcherOpen, setIsPatternSwitcherOpen] = useState(false);
    const [isSolidColorSwitcherOpen, setIsSolidColorSwitcherOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    const userDocRef = useMemoFirebase(() => (user && firestore ? doc(firestore, "users", user.uid) : null), [user, firestore]);
    const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

    // Guest users are allowed to access settings to change appearance/AI keys.
    // So we do not redirect them to login page.

    const onLogout = async () => {
        if (auth) {
            await signOut(auth);
            router.push('/');
        }
    }
    
    const handleDownloadData = async () => {
        if (isDownloading || !user || !firestore) {
            if(!user) {
                toast({
                    variant: "destructive",
                    title: "خطأ",
                    description: "يجب تسجيل الدخول لتنزيل بياناتك.",
                });
            }
            return;
        }
    
        setIsDownloading(true);
        toast({
            title: "جاري تجهيز بياناتك...",
            description: "قد تستغرق هذه العملية بضع لحظات.",
        });
    
        try {
            const userData: any = {
                profile: userProfile,
                subcollections: {},
            };
    
            const subcollections = [
                'favorites', 'following', 'listenHistory', 'playlists', 'notes',
                'user_challenges', 'accountability', 'user_badges', 'curriculum_progress'
            ];
    
            for (const subcollection of subcollections) {
                const querySnapshot = await getDocs(collection(firestore, 'users', user.uid, subcollection));
                userData.subcollections[subcollection] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            }
    
            const dataStr = JSON.stringify(userData, (key, value) => {
                if (value && typeof value === 'object' && value.toDate instanceof Function) {
                    return value.toDate().toISOString();
                }
                return value;
            }, 2);
            
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const fileName = `${user.displayName} - تلك البيانات الخاصة بحسابك في موقع وقفة.json`;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            toast({
                title: "اكتمل التنزيل!",
                description: "تم تنزيل بياناتك بنجاح.",
            });
    
        } catch (error) {
            console.error("Error downloading data:", error);
            toast({
                variant: "destructive",
                title: "فشل تنزيل البيانات",
                description: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.",
            });
        } finally {
            setIsDownloading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!user || !auth || !firestore) {
            toast({ variant: 'destructive', title: 'خطأ', description: 'المستخدم غير مسجل دخوله أو أن خدمات Firebase غير جاهزة.' });
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
                'curriculum_progress'
            ];

            const batch = writeBatch(firestore);

            for (const subcollection of subcollections) {
                const querySnapshot = await getDocs(collection(firestore, 'users', user.uid, subcollection));
                querySnapshot.forEach((doc) => {
                    batch.delete(doc.ref);
                });
            }

            const userDocRef = doc(firestore, 'users', user.uid);
            batch.delete(userDocRef);

            await batch.commit();
            await deleteUser(user);
            
            toast({ title: 'تم حذف الحساب بنجاح', description: 'نأمل أن نراك مرة أخرى قريبًا.' });
            
        } catch (error: any) {
            console.error("Error deleting account:", error);
            let description = 'فشل حذف الحساب. يرجى المحاولة مرة أخرى.';
            if (error.code === 'auth/requires-recent-login') {
                description = 'هذه عملية حساسة وتتطلب منك تسجيل الدخول مرة أخرى قبل حذف حسابك. الرجاء تسجيل الخروج ثم إعادة تسجيل الدخول والمحاولة مرة أخرى.';
            } else if (error.code === 'permission-denied') {
                 description = 'ليس لديك الصلاحية لحذف هذا الحساب.';
            }
            toast({
                variant: 'destructive',
                title: 'حدث خطأ',
                description: description,
                duration: 9000,
            });
        } finally {
            setIsDeleting(false);
            setIsDeleteConfirmOpen(false);
        }
    };


    if (isUserLoading || (user && isProfileLoading)) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin" />
            </div>
        )
    }
    
    if (view === 'notifications' && userProfile && user) {
        return <NotificationsView onBack={() => setView('main')} onSelectNewEpisodes={() => setView('newEpisodes')} userProfile={userProfile} userId={user.uid} />;
    }

    if (view === 'newEpisodes') {
        return <NewEpisodesView onBack={() => setView('notifications')} />;
    }
    
    if (view === 'storage' && user) {
        return <StorageManagementView onBack={() => setView('main')} user={user} />;
    }
    
    const currentLanguageName = languages.find(l => l.value === language)?.name || 'العربية';

  return (
    <div className="max-w-4xl mx-auto">
      
      {user ? (
        <header className="flex flex-col sm:flex-row items-center gap-6 bg-card p-6 rounded-xl mb-8">
          <Avatar className="h-24 w-24">
              <AvatarImage src={user.photoURL || userProfile?.photoURL || ''} alt={user.displayName || 'User'} />
              <AvatarFallback className="text-3xl">{getInitials(user.displayName)}</AvatarFallback>
          </Avatar>
          <div className="text-center sm:text-right">
              <div className="flex items-center gap-3 justify-center sm:justify-start">
                  <h2 className="text-2xl font-bold font-headline">{user.displayName}</h2>
                  {userProfile && <DonationTierBadge tier={userProfile.donationTier} />}
                  {userProfile?.role === 'admin' && (
                    <Link href="/admin/dashboard">
                      <Badge variant="destructive" className="cursor-pointer hover:bg-destructive/80">وضع المدير</Badge>
                    </Link>
                  )}
              </div>
              <p className="text-muted-foreground">{user.email}</p>
              {userProfile?.bio && <p className="mt-2 text-foreground">{userProfile.bio}</p>}
              <div className="flex gap-2 mt-4 justify-center sm:justify-start">
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      <Edit className="me-2 h-4 w-4" /> تعديل الملف الشخصي
                  </Button>
                  <Button onClick={onLogout} variant="secondary" size="sm">
                      <LogOut className="me-2 h-4 w-4" /> تسجيل الخروج
                  </Button>
              </div>
          </div>
        </header>
      ) : (
        <header className="flex flex-col sm:flex-row items-center gap-6 bg-card p-6 rounded-xl mb-8">
          <Avatar className="h-24 w-24">
              <AvatarFallback className="text-3xl bg-primary/20 text-primary">زائر</AvatarFallback>
          </Avatar>
          <div className="text-center sm:text-right">
              <h2 className="text-2xl font-bold font-headline">زائر المنصة</h2>
              <p className="text-muted-foreground text-sm">سجل الدخول لحفظ سجل استماعك وقوائم تشغيلك ومزامنتها عبر أجهزتك المختلفة.</p>
              <div className="flex gap-2 mt-4 justify-center sm:justify-start">
                  <Button asChild size="sm" className="bg-primary hover:bg-primary/95 text-primary-foreground font-black">
                      <Link href="/auth/login?redirect_to=/settings">تسجيل الدخول / إنشاء حساب</Link>
                  </Button>
              </div>
          </div>
        </header>
      )}
        
      <h1 className="text-4xl font-bold mb-6 font-headline text-center">
        الإعدادات
      </h1>

      <div className="space-y-2 mt-8">
        <SectionTitle title="عام" />
        <div className="bg-card rounded-xl p-2">
          {user && (
            <>
              <SettingsItem icon={Bell} label="الإشعارات" onClick={() => setView('notifications')}/>
              <Separator />
            </>
          )}
          <SettingsItem icon={Globe} label="اللغة" value={currentLanguageName} onClick={() => setIsLanguageSwitcherOpen(true)} />
          <Separator />
          <SettingsItem icon={Headphones} label="إعدادات الصوت" />
        </div>

        <SectionTitle title="المظهر" />
        <div className="bg-card rounded-xl p-2">
            <SettingsItem icon={Palette} label="تغيير الثيم" onClick={() => setIsThemeSwitcherOpen(true)} />
            <Separator />
            <SettingsItem icon={CaseSensitive} label="تغيير الخط" onClick={() => setIsFontSwitcherOpen(true)} />
            <Separator />
            <SettingsItem icon={Droplets} label="الألوان السادة" onClick={() => setIsSolidColorSwitcherOpen(true)} />
            <Separator />
            <SettingsItem icon={ImageIcon} label="رفع صورة خلفية" onClick={() => document.getElementById('background-uploader-input')?.click()} />
            <Separator />
            <SettingsItem icon={Grid} label="اختيار نمط خلفية" onClick={() => setIsPatternSwitcherOpen(true)} />
            <Separator />
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
                <Label htmlFor="bg-switch" className="text-lg cursor-pointer flex items-center gap-4">
                    <ImageIcon className="w-6 h-6 text-muted-foreground" />
                    <span>إظهار الخلفية</span>
                </Label>
                <Switch
                    id="bg-switch"
                    checked={isBackgroundShown}
                    onCheckedChange={toggleBackground}
                />
            </div>
        </div>
        
        <SectionTitle title="المؤثرات الخلفية" />
        <div className="bg-card rounded-xl p-4 space-y-4">
            <div>
                <Label htmlFor="bg-effect-select">تأثير الخلفية</Label>
                <Select value={backgroundEffect} onValueChange={(value) => setBackgroundEffect(value as 'none' | 'particles' | 'liquid-image')}>
                    <SelectTrigger id="bg-effect-select">
                        <SelectValue placeholder="اختر تأثيرًا..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">بدون تأثير</SelectItem>
                        <SelectItem value="particles">جزيئات متفاعلة</SelectItem>
                        <SelectItem value="liquid-image">خلفية مائية تفاعلية WebGL</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {backgroundEffect === 'particles' && (
                <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="particle-interaction" className="flex items-center gap-2">تفاعل مع الفأرة</Label>
                        <Switch 
                            id="particle-interaction" 
                            checked={particleSettings.interaction}
                            onCheckedChange={(checked) => setParticleSettings({ interaction: checked })}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="particle-color-picker">لون الجزيئات</Label>
                         <div className="flex items-center gap-2">
                             <Input 
                                id="particle-color-picker" 
                                type="color"
                                value={particleColor}
                                onChange={(e) => setParticleColor(e.target.value)}
                                className="p-1 h-10 w-14 cursor-pointer"
                                aria-label="Color picker"
                            />
                            <Input 
                                id="particle-color-text" 
                                type="text"
                                value={particleColor}
                                onChange={(e) => setParticleColor(e.target.value)}
                                aria-label="Hex color code"
                            />
                         </div>
                    </div>
                     <div className="space-y-2">
                        <div className="flex justify-between">
                            <Label>الكثافة</Label>
                            <span className="text-sm text-muted-foreground">{particleSettings.count}</span>
                        </div>
                        <Slider 
                            value={[particleSettings.count]}
                            max={300}
                            step={10}
                            onValueChange={([value]) => setParticleSettings({ count: value })}
                        />
                    </div>
                     <div className="space-y-2">
                        <div className="flex justify-between">
                            <Label>السرعة</Label>
                            <span className="text-sm text-muted-foreground">{particleSettings.speed.toFixed(1)}</span>
                        </div>
                        <Slider 
                            value={[particleSettings.speed]}
                            max={2}
                            step={0.1}
                            onValueChange={([value]) => setParticleSettings({ speed: value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <Label>مسافة الربط</Label>
                            <span className="text-sm text-muted-foreground">{particleSettings.lineDistance}</span>
                        </div>
                        <Slider 
                            value={[particleSettings.lineDistance]}
                            max={300}
                            step={10}
                            onValueChange={([value]) => setParticleSettings({ lineDistance: value })}
                        />
                    </div>
                </div>
            )}

            {backgroundEffect === 'liquid-image' && (
                <div className="space-y-6 pt-4 border-t border-white/5">
                    {/* Source Type Selector */}
                    <div className="space-y-2">
                        <Label>نوع مصدر الخلفية</Label>
                        <div className="grid grid-cols-2 gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
                            <Button 
                                type="button"
                                variant={liquidImageSourceType === 'image' ? 'default' : 'ghost'}
                                onClick={() => setLiquidImageSourceType('image')}
                                className={cn(
                                    "py-2 h-9 rounded-lg text-xs font-bold transition-all",
                                    liquidImageSourceType === 'image' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-foreground'
                                )}
                            >
                                <ImageIcon className="w-4 h-4 me-2" />
                                <span>صورة</span>
                            </Button>
                            <Button 
                                type="button"
                                variant={liquidImageSourceType === 'video' ? 'default' : 'ghost'}
                                onClick={() => setLiquidImageSourceType('video')}
                                className={cn(
                                    "py-2 h-9 rounded-lg text-xs font-bold transition-all",
                                    liquidImageSourceType === 'video' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-foreground'
                                )}
                            >
                                <PlayCircle className="w-4 h-4 me-2" />
                                <span>فيديو</span>
                            </Button>
                        </div>
                    </div>

                    {/* Preset Picker */}
                    <div className="space-y-2">
                        <Label>المحتوى المختار</Label>
                        {liquidImageSourceType === 'image' ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {liquidImagePresets.images.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setLiquidImageImage(img.src)}
                                        className={cn(
                                            "flex flex-col gap-2 p-2 rounded-xl border text-right transition-all group overflow-hidden",
                                            liquidImageImage === img.src ? 'bg-primary/10 border-primary shadow-lg' : 'bg-white/[0.01] border-white/5 hover:bg-white/5'
                                        )}
                                    >
                                        <div className="aspect-[16/9] w-full rounded-lg overflow-hidden relative border border-white/5">
                                            <img 
                                                src={img.src} 
                                                alt={img.name} 
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        </div>
                                        <span className="text-[10px] font-bold text-zinc-300 truncate w-full text-center block">{img.name}</span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {liquidImagePresets.videos.map((vid, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setLiquidImageVideo(vid.src)}
                                        className={cn(
                                            "flex items-center gap-3 p-3 rounded-xl border text-right transition-all group",
                                            liquidImageVideo === vid.src ? 'bg-primary/10 border-primary shadow-lg' : 'bg-white/[0.01] border-white/5 hover:bg-white/5'
                                        )}
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center shrink-0">
                                            <PlayCircle className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                                        </div>
                                        <div className="flex flex-col gap-0.5 truncate text-start">
                                            <span className="text-xs font-bold text-zinc-200 truncate">{vid.name}</span>
                                            <span className="text-[9px] text-zinc-500 truncate">{vid.src}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Strength Slider */}
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <Label>قوة التموج (Strength)</Label>
                            <span className="text-sm font-bold text-primary font-mono">{liquidImageStrength.toFixed(2)}</span>
                        </div>
                        <Slider 
                            value={[liquidImageStrength]}
                            min={0.01}
                            max={0.40}
                            step={0.01}
                            onValueChange={([value]) => setLiquidImageStrength(value)}
                        />
                    </div>

                    {/* Speed Slider */}
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <Label>سرعة الحركة (Speed)</Label>
                            <span className="text-sm font-bold text-primary font-mono">{liquidImageSpeed.toFixed(2)}</span>
                        </div>
                        <Slider 
                            value={[liquidImageSpeed]}
                            min={0.01}
                            max={0.80}
                            step={0.01}
                            onValueChange={([value]) => setLiquidImageSpeed(value)}
                        />
                    </div>
                </div>
            )}
        </div>



        {user && (
          <>
            <SectionTitle title="التنزيلات والتخزين" />
            <div className="bg-card rounded-xl p-2">
                <SettingsItem icon={DownloadCloud} label="جودة التنزيل" value="عالية" />
                <Separator />
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
                    <Label htmlFor="wifi-only-switch" className="text-lg cursor-pointer flex items-center gap-4">
                        <Wifi className="w-6 h-6 text-muted-foreground" />
                        <span>التنزيل عبر Wi-Fi فقط</span>
                    </Label>
                    <Switch id="wifi-only-switch" defaultChecked={true} />
                </div>
                <Separator />
                <SettingsItem icon={Database} label="إدارة مساحة التخزين" onClick={() => setView('storage')} />
            </div>
          </>
        )}

        <SectionTitle title="إمكانية الوصول" />
        <div className="bg-card rounded-xl p-2">
             <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
                <Label htmlFor="high-contrast-switch" className="text-lg cursor-pointer flex items-center gap-4">
                    <Contrast className="w-6 h-6 text-muted-foreground" />
                    <span>وضع التباين العالي</span>
                </Label>
                <Switch id="high-contrast-switch" />
            </div>
        </div>

        <SectionTitle title="المساعد الذكي (AI)" />
        <div className="bg-card rounded-xl p-6 space-y-6">
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Sparkles className="w-6 h-6 text-primary" />
                        <Label htmlFor="ai-api-key" className="text-lg">مفتاح Gemini API</Label>
                    </div>
                    <Link 
                        href="https://aistudio.google.com/app/apikey" 
                        target="_blank" 
                        className="text-[10px] font-black text-primary hover:underline flex items-center gap-1"
                    >
                        احصل على مفتاح مجاني <ExternalLink className="w-3 h-3" />
                    </Link>
                </div>
                <div className="relative group">
                    <Input 
                        id="ai-api-key"
                        type="password"
                        placeholder="أدخل مفتاح الـ API الخاص بك هنا..."
                        value={aiApiKey || ''}
                        onChange={(e) => setAiApiKey(e.target.value)}
                        className="h-14 bg-white/5 border-white/5 rounded-2xl focus:bg-white/10 focus:ring-4 focus:ring-primary/10 transition-all font-mono"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        {aiApiKey ? (
                            <div className="flex items-center gap-2 text-emerald-500 animate-in fade-in zoom-in">
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase">مفعل</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-white/20">
                                <XCircle className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase">غير مفعل</span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-3">
                    <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <p className="text-[11px] text-white/50 leading-relaxed font-medium">
                        هذا المفتاح يتم تخزينه **محلياً في متصفحك فقط** ولا يرسل إلى خوادمنا. سيُستخدم لتمكين المساعد الذكي من الإجابة على تساؤلاتك المتعلقة بمحتوى المنصة وبناء خططك العلمية.
                    </p>
                </div>
            </div>
            
            <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex items-center gap-3">
                    <Bot className="w-6 h-6 text-primary" />
                    <Label htmlFor="ai-model-select" className="text-lg">نموذج الذكاء الاصطناعي (Gemini Model)</Label>
                </div>
                <Select value={aiModel} onValueChange={(value) => setAiModel(value)}>
                    <SelectTrigger id="ai-model-select" className="h-12 bg-white/5 border-white/5 rounded-xl">
                        <SelectValue placeholder="اختر نموذجًا..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash (الأحدث - سريع وذكي)</SelectItem>
                        <SelectItem value="gemini-2.5-pro">Gemini 2.5 Pro (الأقوى - للمسائل والخطط العلمية المعقدة)</SelectItem>
                        <SelectItem value="gemini-2.0-flash">Gemini 2.0 Flash (سرعة فائقة واستقرار)</SelectItem>
                        <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash (الكلاسيكي السريع)</SelectItem>
                        <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro (الكلاسيكي المحترف - للكتب الطويلة)</SelectItem>
                    </SelectContent>
                </Select>
                <p className="text-[10px] text-white/30 leading-normal font-medium">
                    إذا كان النموذج المختار غير معتمد لمفتاحك، سيتحول النظام تلقائياً للنموذج المستقر التالي لضمان عدم توقف الخدمة.
                </p>
            </div>
        </div>

        <SectionTitle title="الحساب والبيانات" />
        {user ? (
            <div className="bg-card rounded-xl p-2">
              <SettingsItem icon={Crown} label="إدارة الاشتراكات" />
              <Separator />
              <SettingsItem icon={LinkIcon} label="الحسابات المرتبطة" />
              <Separator />
              <SettingsItem icon={Smartphone} label="الأجهزة المتصلة" />
              <Separator />
              <SettingsItem icon={Trash2} label="مسح سجل الاستماع" />
              <Separator />
              <SettingsItem 
                icon={isDownloading ? Loader2 : HardDriveDownload} 
                label={isDownloading ? "جاري التجهيز..." : "تنزيل بياناتي"} 
                onClick={handleDownloadData} 
                className={cn(isDownloading && "animate-pulse cursor-not-allowed")} 
              />
              <Separator />
              <SettingsItem icon={UserX} label="حذف الحساب" className="text-destructive" onClick={() => setIsDeleteConfirmOpen(true)} />
            </div>
        ) : (
            <Card className="border-2 border-dashed bg-card/50">
                <CardContent className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
                    <Crown className="w-10 h-10 text-primary opacity-30" />
                    <p className="font-bold">الحساب والبيانات محمية</p>
                    <p className="text-xs">يرجى تسجيل الدخول للوصول إلى إدارة الاشتراكات، الحسابات المرتبطة، ومسح سجلات الاستماع.</p>
                </CardContent>
            </Card>
        )}
      </div>

       <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogContent className="p-0 border-0 max-w-2xl bg-transparent">
                <DialogHeader className="sr-only">
                  <DialogTitle>تعديل الملف الشخصي</DialogTitle>
                </DialogHeader>
                {user && userProfile && (
                    <EditProfileForm 
                        user={user} 
                        userProfile={userProfile}
                        onClose={() => setIsEditing(false)}
                    />
                )}
            </DialogContent>
        </Dialog>

        <ThemeSwitcherDialog isOpen={isThemeSwitcherOpen} onOpenChange={setIsThemeSwitcherOpen} />
        <FontSwitcherDialog isOpen={isFontSwitcherOpen} onOpenChange={setIsFontSwitcherOpen} />
        <LanguageSwitcherDialog isOpen={isLanguageSwitcherOpen} onOpenChange={setIsLanguageSwitcherOpen} />
        <PatternSwitcherDialog isOpen={isPatternSwitcherOpen} onOpenChange={setIsPatternSwitcherOpen} />
        <SolidColorSwitcherDialog isOpen={isSolidColorSwitcherOpen} onOpenChange={setIsSolidColorSwitcherOpen} />
        
        <DeleteConfirmationDialog
            isOpen={isDeleteConfirmOpen}
            onClose={() => setIsDeleteConfirmOpen(false)}
            onConfirm={handleDeleteAccount}
            title="هل أنت متأكد من حذف حسابك؟"
            description="سيتم حذف جميع بياناتك بشكل دائم، بما في ذلك قوائم التشغيل والمفضلة وسجل الاستماع. لا يمكن التراجع عن هذا الإجراء."
            confirmButtonText={isDeleting ? "جاري الحذف..." : "نعم، قم بحذف حسابي"}
        />
    </div>
  );
}
