"use client";

import {
  Bell,
  ChevronRight,
  Download,
  Globe,
  Headphones,
  History,
  Loader2,
  LogOut,
  Sparkles,
  User as UserIcon,
  Edit,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { useUser, useFirestore, useDoc, useAuth, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { getInitials } from '@/lib/utils';
import { EditProfileForm } from '@/components/profile/edit-profile-form';
import { signOut } from 'firebase/auth';

const SettingsItem = ({
  icon: Icon,
  label,
  value,
  href = '#',
}: {
  icon: React.ElementType;
  label: string;
  value?: string;
  href?: string;
}) => (
  <Link href={href} className="block">
    <div className="flex items-center py-4 px-2 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors">
      <Icon className="w-6 h-6 me-4 text-muted-foreground" />
      <span className="flex-grow text-lg font-medium">{label}</span>
      {value && <span className="text-muted-foreground text-lg me-2">{value}</span>}
      <ChevronRight className="w-5 h-5 text-muted-foreground" />
    </div>
  </Link>
);

const SectionTitle = ({ title }: { title: string }) => (
  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-2 pt-6 pb-2">
    {title}
  </h2>
);

export default function SettingsPage() {
    const { user, isUserLoading } = useUser();
    const auth = useAuth();
    const firestore = useFirestore();
    const router = useRouter();

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

    if (isEditing) {
        return (
            <EditProfileForm 
                user={user} 
                userProfile={userProfile}
                onClose={() => setIsEditing(false)}
            />
        );
    }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-6 font-headline text-center">
        الإعدادات
      </h1>

      <header className="flex flex-col sm:flex-row items-center gap-6 bg-card p-6 rounded-xl">
        <Avatar className="h-24 w-24">
            <AvatarImage src={user.photoURL || userProfile?.photoURL || ''} alt={user.displayName || 'User'} />
            <AvatarFallback className="text-3xl">{getInitials(user.displayName)}</AvatarFallback>
        </Avatar>
        <div className="text-center sm:text-right">
            <h2 className="text-2xl font-bold font-headline">{user.displayName}</h2>
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

      <div className="space-y-2 mt-8">
        <SectionTitle title="عام" />
        <div className="bg-card rounded-xl p-2">
          <SettingsItem icon={Bell} label="الإشعارات" />
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
    </div>
  );
}
