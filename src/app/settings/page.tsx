
"use client";

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
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection, updateDocumentNonBlocking, useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { doc, collection } from 'firebase/firestore';
import type { UserProfile, FollowingChannel, Channel } from '@/lib/types';
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
} from '@/components/ui/dialog';


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
}: {
  icon: React.ElementType;
  label: string;
  value?: string;
  href?: string;
  onClick?: () => void;
}) => {
  const content = (
    <div className="flex items-center py-3 px-2">
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

function NotificationsView({ onBack, onSelectNewEpisodes }: { onBack: () => void; onSelectNewEpisodes: () => void; }) {
    const [newPrograms, setNewPrograms] = useState(true);
    const [newPlaylists, setNewPlaylists] = useState(false);
    const [newBooks, setNewBooks] = useState(true);

    return (
        <div>
            <SettingsHeader title="الإشعارات" onBack={onBack} />
            <div className="bg-card rounded-xl p-2">
                <div className="px-2 py-3">
                    <p className="text-muted-foreground">يصلني اشعار عندما:</p>
                </div>
                <button onClick={onSelectNewEpisodes} className="w-full text-right hover:bg-muted/50 rounded-lg transition-colors">
                     <div className="flex items-center py-3 px-2">
                        <Bell className="w-6 h-6 me-4 text-muted-foreground" />
                        <span className="flex-grow text-lg">عند صدور حلقات جديدة</span>
                        <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                    </div>
                </button>
                <Separator />
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
                    <Label htmlFor="switch-new-programs" className="text-lg cursor-pointer flex items-center gap-3">
                        <Youtube className="w-6 h-6 me-4 text-muted-foreground" />
                        عند صدور برامج جديدة
                    </Label>
                    <Switch
                        id="switch-new-programs"
                        checked={newPrograms}
                        onCheckedChange={setNewPrograms}
                    />
                </div>
                <Separator />
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
                    <Label htmlFor="switch-new-playlists" className="text-lg cursor-pointer flex items-center gap-3">
                        <ListMusic className="w-6 h-6 me-4 text-muted-foreground" />
                        عند صدور قوائم تشغيل جديدة
                    </Label>
                    <Switch
                        id="switch-new-playlists"
                        checked={newPlaylists}
                        onCheckedChange={setNewPlaylists}
                    />
                </div>
                <Separator />
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
                    <Label htmlFor="switch-new-books" className="text-lg cursor-pointer flex items-center gap-3">
                        <Book className="w-6 h-6 me-4 text-muted-foreground" />
                        عند صدور كتب جديدة
                    </Label>
                    <Switch
                        id="switch-new-books"
                        checked={newBooks}
                        onCheckedChange={setNewBooks}
                    />
                </div>
            </div>
        </div>
    );
}

function NewEpisodesView({ onBack }: { onBack: () => void; }) {
    const { user } = useUser();
    const firestore = useFirestore();

    const followingPath = user ? `users/${user.uid}/followingChannels` : null;
    const { data: following, isLoading: followingLoading } = useCollection<FollowingChannel>(followingPath);

    const [followedChannels, setFollowedChannels] = useState<Channel[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const { data: allChannels, isLoading: channelsLoading } = useCollection<Channel>('channels');

     useEffect(() => {
        if (channelsLoading || followingLoading || !allChannels || !following) {
             if (!channelsLoading && !followingLoading) {
                setIsLoading(false);
             }
            return;
        };
        
        const subscribedChannelIds = following.map(f => f.channelId);
        const subscribedChannels = allChannels.filter(c => subscribedChannelIds.includes(c.id));
        setFollowedChannels(subscribedChannels);
        setIsLoading(false);

    }, [following, allChannels, channelsLoading, followingLoading]);

    const handleToggle = (channelId: string, newState: boolean) => {
        if (!user || !firestore) return;
        const docRef = doc(firestore, 'users', user.uid, 'followingChannels', channelId);
        updateDocumentNonBlocking(docRef, { notificationsEnabled: newState });
    };

    return (
        <div>
            <SettingsHeader title="عند صدور حلقات جديدة" onBack={onBack} />
             {isLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8" /></div>
            ) : followedChannels.length > 0 ? (
                <div className="bg-card rounded-xl p-2 space-y-1">
                    {followedChannels.map(channel => {
                        const followInfo = following?.find(f => f.channelId === channel.id);
                        // Default to true if the field is not set
                        const isEnabled = followInfo?.notificationsEnabled ?? true;

                        return (
                             <div key={channel.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
                                <Label htmlFor={`switch-${channel.id}`} className="text-lg cursor-pointer flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={channel.imageUrl} />
                                        <AvatarFallback>{getInitials(channel.name)}</AvatarFallback>
                                    </Avatar>
                                    {channel.name}
                                </Label>
                                <Switch
                                    id={`switch-${channel.id}`}
                                    checked={isEnabled}
                                    onCheckedChange={(checked) => handleToggle(channel.id, checked)}
                                />
                            </div>
                        )
                    })}
                </div>
            ) : (
                <Card className="text-center">
                    <CardContent className="p-8">
                        <p className="text-muted-foreground">أنت لا تتابع أي قنوات حاليًا.</p>
                        <Button variant="link" asChild><Link href="/channels">تصفح القنوات</Link></Button>
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

    const [view, setView] = useState<'main' | 'notifications' | 'newEpisodes'>('main');
    const [isEditing, setIsEditing] = useState(false);

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
        return <NotificationsView onBack={() => setView('main')} onSelectNewEpisodes={() => setView('newEpisodes')} />;
    }

    if (view === 'newEpisodes') {
        return <NewEpisodesView onBack={() => setView('notifications')} />;
    }

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
          <SettingsItem icon={Globe} label="اللغة" value="العربية" />
          <Separator />
          <SettingsItem icon={Headphones} label="إعدادات الصوت" />
          <Separator />
          <SettingsItem icon={Download} label="إعدادات التحميل" />
        </div>

        <SectionTitle title="الحساب" />
        <div className="bg-card rounded-xl p-2">
          <SettingsItem icon={Sparkles} label="اشتراك ثمانية" />
          <Separator />
          <SettingsItem icon={History} label="الإستيراد" />
        </div>
      </div>

       <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogContent className="p-0 border-0 max-w-2xl bg-transparent">
                <EditProfileForm 
                    user={user} 
                    userProfile={userProfile}
                    onClose={() => setIsEditing(false)}
                />
            </DialogContent>
        </Dialog>
    </div>
  );
}
