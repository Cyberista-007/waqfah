"use client";

import {
  Bell,
  ChevronRight,
  Download,
  Globe,
  Headphones,
  History,
  Loader2,
  Sparkles,
  User,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

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
    const router = useRouter();

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/auth/login?redirect_to=/settings');
        }
    }, [user, isUserLoading, router]);

    if (isUserLoading || !user) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin" />
            </div>
        )
    }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-6 font-headline text-center">
        الإعدادات
      </h1>

      <div className="space-y-2">
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
          <SettingsItem icon={User} label="إعدادات الحساب" href="/profile" />
          <Separator />
          <SettingsItem icon={Sparkles} label="اشتراك ثمانية" />
          <Separator />
          <SettingsItem icon={History} label="الإستيراد" />
        </div>
      </div>
    </div>
  );
}
