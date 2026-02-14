

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDoc, useFirestore, useStorage } from '@/firebase';
import type { AppearanceSettings } from '@/lib/types';
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Palette } from 'lucide-react';
import { themes } from '@/components/theme-switcher';
import { fonts } from '@/components/font-switcher';
import { Switch } from '@/components/ui/switch';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import Image from 'next/image';
import { Textarea } from '@/components/ui/textarea';

export default function AdminAppearancePage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const storage = useStorage();
  const { data: currentSettings, isLoading } = useDoc<AppearanceSettings>('settings/appearance');

  const [defaultTheme, setDefaultTheme] = useState<string>('');
  const [defaultFont, setDefaultFont] = useState<string>('');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [quranIconFile, setQuranIconFile] = useState<File | null>(null);
  const [hadithIconFile, setHadithIconFile] = useState<File | null>(null);
  const [quranIconPreview, setQuranIconPreview] = useState<string | null>(null);
  const [hadithIconPreview, setHadithIconPreview] = useState<string | null>(null);
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null);

  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');

  useEffect(() => {
    if (currentSettings) {
      setDefaultTheme(currentSettings.defaultTheme || 'theme-default-dark');
      setDefaultFont(currentSettings.defaultFont || 'font-body');
      setMaintenanceMode(currentSettings.maintenanceMode || false);
      setQuranIconPreview(currentSettings.quranIconUrl || null);
      setHadithIconPreview(currentSettings.hadithIconUrl || null);
      setHeroImagePreview(currentSettings.heroImageUrl || null);
      setHeroTitle(currentSettings.heroTitle || 'العلم الشرعي بين يديك');
      setHeroSubtitle(currentSettings.heroSubtitle || 'منصة شاملة لمحاضرات ودروس نخبة من العلماء. تصفح، استمع، وتعلم.');
    } else if (!isLoading) {
      setDefaultTheme('theme-default-dark');
      setDefaultFont('font-body');
      setMaintenanceMode(false);
      setHeroTitle('العلم الشرعي بين يديك');
      setHeroSubtitle('منصة شاملة لمحاضرات ودروس نخبة من العلماء. تصفح، استمع، وتعلم.');
    }
  }, [currentSettings, isLoading]);

  const handleFileChange = (setter: React.Dispatch<React.SetStateAction<File | null>>, previewSetter: React.Dispatch<React.SetStateAction<string | null>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setter(file);
        previewSetter(URL.createObjectURL(file));
    }
  }

  const handleSubmit = async () => {
    if (!firestore || !storage || !defaultTheme || !defaultFont) {
        toast({ variant: 'destructive', title: 'يرجى اختيار الثيم والخط الافتراضي.' });
        return;
    }

    setIsSubmitting(true);
    try {
        const uploadIcon = async (file: File, name: string): Promise<string> => {
            const imageRef = ref(storage, `system_icons/${name}_${Date.now()}`);
            const snapshot = await uploadBytes(imageRef, file);
            return await getDownloadURL(snapshot.ref);
        };
        
        let finalQuranIconUrl = currentSettings?.quranIconUrl || '';
        if (quranIconFile) {
            finalQuranIconUrl = await uploadIcon(quranIconFile, 'quran_icon');
        }

        let finalHadithIconUrl = currentSettings?.hadithIconUrl || '';
        if (hadithIconFile) {
            finalHadithIconUrl = await uploadIcon(hadithIconFile, 'hadith_icon');
        }

        let finalHeroImageUrl = currentSettings?.heroImageUrl || '';
        if (heroImageFile) {
            finalHeroImageUrl = await uploadIcon(heroImageFile, 'hero_banner');
        }

        const settingsRef = doc(firestore, 'settings', 'appearance');
        await setDoc(settingsRef, { 
            defaultTheme, 
            defaultFont, 
            maintenanceMode,
            quranIconUrl: finalQuranIconUrl,
            hadithIconUrl: finalHadithIconUrl,
            heroImageUrl: finalHeroImageUrl,
            heroTitle,
            heroSubtitle,
        }, { merge: true });

        toast({ title: 'تم حفظ الإعدادات بنجاح!' });
    } catch (error) {
        console.error("Error saving appearance settings:", error);
        toast({ variant: 'destructive', title: 'فشل حفظ الإعدادات.' });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-headline flex items-center gap-2">
            <Palette />
            إدارة المظهر
        </CardTitle>
        <CardDescription>
            تحكم في الثيم والخط الافتراضي، أيقونات الأدلة، وقم بتفعيل وضع الصيانة.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : (
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="default-theme">الثيم الافتراضي</Label>
                            <Select value={defaultTheme} onValueChange={setDefaultTheme}>
                                <SelectTrigger id="default-theme">
                                    <SelectValue placeholder="اختر الثيم الافتراضي..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {themes.map(theme => (
                                        <SelectItem key={theme.value} value={theme.value}>
                                            {theme.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="default-font">الخط الافتراضي</Label>
                            <Select value={defaultFont} onValueChange={setDefaultFont}>
                                <SelectTrigger id="default-font">
                                    <SelectValue placeholder="اختر الخط الافتراضي..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {fonts.map(font => (
                                        <SelectItem key={font.value} value={font.value}>
                                            {font.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="hero-image">صورة البانر الرئيسي</Label>
                            {heroImagePreview && <Image src={heroImagePreview} alt="Hero Image Preview" width={300} height={150} className="rounded-md bg-muted p-1 object-cover" />}
                            <Input id="hero-image" type="file" accept="image/*" onChange={handleFileChange(setHeroImageFile, setHeroImagePreview)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="hero-title">العنوان الرئيسي للبانر</Label>
                            <Input id="hero-title" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="hero-subtitle">العنوان الفرعي للبانر</Label>
                            <Textarea id="hero-subtitle" value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} rows={3} />
                        </div>
                    </div>
                     <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="quran-icon">أيقونة المصحف (في نافذة المهلكات)</Label>
                            {quranIconPreview && <Image src={quranIconPreview} alt="Quran Icon Preview" width={64} height={64} className="rounded-md bg-muted p-1" />}
                            <Input id="quran-icon" type="file" accept="image/png, image/svg+xml, image/jpeg" onChange={handleFileChange(setQuranIconFile, setQuranIconPreview)} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="hadith-icon">أيقونة الحديث (في نافذة المهلكات)</Label>
                            {hadithIconPreview && <Image src={hadithIconPreview} alt="Hadith Icon Preview" width={64} height={64} className="rounded-md bg-muted p-1" />}
                            <Input id="hadith-icon" type="file" accept="image/png, image/svg+xml, image/jpeg" onChange={handleFileChange(setHadithIconFile, setHadithIconPreview)} />
                        </div>
                         <div className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <Label htmlFor="maintenance-mode" className="text-base">وضع الصيانة</Label>
                            <CardDescription>
                              عند تفعيله، لن يتمكن سوى المديرين من الوصول للموقع.
                            </CardDescription>
                          </div>
                          <Switch
                            id="maintenance-mode"
                            checked={maintenanceMode}
                            onCheckedChange={setMaintenanceMode}
                          />
                        </div>
                    </div>
                </div>


                <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    حفظ الإعدادات
                </Button>
            </div>
        )}
      </CardContent>
    </Card>
  );
}

    