

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
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection, updateDocumentNonBlocking, useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { doc, collection } from 'firebase/firestore';
import type { UserProfile, Following, Program, NotificationSettings } from '@/lib/types';
import { getInitials } from '@/lib/utils';
import { EditProfileForm } from '@/components/profile/edit-profile-form';
import { signOut } from 'firebase/auth';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ThemeSwitcherDialog, themes } from '@/components/theme-switcher';
import { FontSwitcherDialog } from '@/components/font-switcher';
import { useAppearance, BackgroundEffect, ParticleSettings } from '@/components/appearance-provider';
import { PatternSwitcherDialog } from '@/components/pattern-switcher';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { DonationTierBadge } from '@/components/DonationTierBadge';
import { LanguageSwitcherDialog, languages } from '@/components/language-switcher';
import { cn } from '@/lib/utils';


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

export default function SettingsPage() {
    const { user, isUserLoading } = useUser();
    const auth = useAuth();
    const firestore = useFirestore();
    const router = useRouter();
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
    } = useAppearance();

    const [view, setView] = useState<'main' | 'notifications' | 'newEpisodes'>('main');
    const [isEditing, setIsEditing] = useState(false);
    const [isThemeSwitcherOpen, setIsThemeSwitcherOpen] = useState(false);
    const [isFontSwitcherOpen, setIsFontSwitcherOpen] = useState(false);
    const [isLanguageSwitcherOpen, setIsLanguageSwitcherOpen] = useState(false);
    const [isPatternSwitcherOpen, setIsPatternSwitcherOpen] = useState(false);

    const userDocRef = useMemoFirebase(() => (user && firestore ? doc(firestore, "users", user.uid) : null), [user, firestore]);
    const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/auth/login?redirect_to=/settings');
        }
    }, [user, isUserLoading, router]);

    const onLogout = async () => {
        if (auth) {
            await signOut(auth);
            router.push('/');
        }
    }

    if (isUserLoading || isProfileLoading || !user || !userProfile) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin" />
            </div>
        )
    }
    
    if (view === 'notifications') {
        return <NotificationsView onBack={() => setView('main')} onSelectNewEpisodes={() => setView('newEpisodes')} userProfile={userProfile} userId={user.uid} />;
    }

    if (view === 'newEpisodes') {
        return <NewEpisodesView onBack={() => setView('notifications')} />;
    }
    
    const currentLanguageName = languages.find(l => l.value === language)?.name || 'العربية';

  return (
    <div className="max-w-4xl mx-auto">
      
      <header className="flex flex-col sm:flex-row items-center gap-6 bg-card p-6 rounded-xl mb-8">
        <Avatar className="h-24 w-24">
            <AvatarImage src={user.photoURL || userProfile?.photoURL || ''} alt={user.displayName || 'User'} />
            <AvatarFallback className="text-3xl">{getInitials(user.displayName)}</AvatarFallback>
        </Avatar>
        <div className="text-center sm:text-right">
            <div className="flex items-center gap-3 justify-center sm:justify-start">
                <h2 className="text-2xl font-bold font-headline">{user.displayName}</h2>
                <DonationTierBadge tier={userProfile.donationTier} />
                {userProfile.role === 'admin' && (
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
        
      <h1 className="text-4xl font-bold mb-6 font-headline text-center">
        الإعدادات
      </h1>

      <div className="space-y-2 mt-8">
        <SectionTitle title="عام" />
        <div className="bg-card rounded-xl p-2">
          <SettingsItem icon={Bell} label="الإشعارات" onClick={() => setView('notifications')}/>
          <Separator />
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
                <Select value={backgroundEffect} onValueChange={(value) => setBackgroundEffect(value as 'none' | 'particles')}>
                    <SelectTrigger id="bg-effect-select">
                        <SelectValue placeholder="اختر تأثيرًا..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">بدون تأثير</SelectItem>
                        <SelectItem value="particles">جزيئات متفاعلة</SelectItem>
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
                        <Label htmlFor="particle-color">لون الجزيئات</Label>
                         <div className="flex items-center gap-2">
                            <Input 
                                id="particle-color" 
                                type="text"
                                value={particleColor}
                                onChange={(e) => setParticleColor(e.target.value)}
                            />
                            <div className="w-8 h-8 rounded-md border" style={{ backgroundColor: particleColor }} />
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
        </div>

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
            <SettingsItem icon={Database} label="إدارة مساحة التخزين" />
        </div>

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

        <SectionTitle title="الحساب والبيانات" />
        <div className="bg-card rounded-xl p-2">
          <SettingsItem icon={Crown} label="إدارة الاشتراكات" />
          <Separator />
          <SettingsItem icon={LinkIcon} label="الحسابات المرتبطة" />
          <Separator />
          <SettingsItem icon={Smartphone} label="الأجهزة المتصلة" />
          <Separator />
          <SettingsItem icon={Trash2} label="مسح سجل الاستماع" />
          <Separator />
          <SettingsItem icon={HardDriveDownload} label="تنزيل بياناتي" />
          <Separator />
          <SettingsItem icon={UserX} label="حذف الحساب" className="text-destructive"/>
        </div>
      </div>

       <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogContent className="p-0 border-0 max-w-2xl bg-transparent">
                <DialogHeader className="sr-only">
                  <DialogTitle>تعديل الملف الشخصي</DialogTitle>
                </DialogHeader>
                <EditProfileForm 
                    user={user} 
                    userProfile={userProfile}
                    onClose={() => setIsEditing(false)}
                />
            </DialogContent>
        </Dialog>

        <ThemeSwitcherDialog isOpen={isThemeSwitcherOpen} onOpenChange={setIsThemeSwitcherOpen} />
        <FontSwitcherDialog isOpen={isFontSwitcherOpen} onOpenChange={setIsFontSwitcherOpen} />
        <LanguageSwitcherDialog isOpen={isLanguageSwitcherOpen} onOpenChange={setIsLanguageSwitcherOpen} />
        <PatternSwitcherDialog isOpen={isPatternSwitcherOpen} onOpenChange={setIsPatternSwitcherOpen} />
    </div>
  );
}
