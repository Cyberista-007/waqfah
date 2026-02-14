
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
import { cn } from '@/lib/utils';

export default function AdminAppearancePage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const storage = useStorage();

  const { data: currentSettings, isLoading } = useDoc<AppearanceSettings>('settings/appearance');

  const [defaultTheme, setDefaultTheme] = useState('');
  const [defaultFont, setDefaultFont] = useState('');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');

  const [quranIconFile, setQuranIconFile] = useState<File | null>(null);
  const [hadithIconFile, setHadithIconFile] = useState<File | null>(null);
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  
  const [quranIconPreview, setQuranIconPreview] = useState<string | null>(null);
  const [hadithIconPreview, setHadithIconPreview] = useState<string | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentSettings) {
      setDefaultTheme(currentSettings.defaultTheme || 'theme-default-dark');
      setDefaultFont(currentSettings.defaultFont || 'font-body');
      setMaintenanceMode(currentSettings.maintenanceMode || false);
      setHeroTitle(currentSettings.heroTitle || 'العلم الشرعي بين يديك');
      setHeroSubtitle(currentSettings.heroSubtitle || 'منصة شاملة لمحاضرات ودروس نخبة من العلماء. تصفح، استمع، وتعلم.');
      
      setQuranIconPreview(currentSettings.quranIconUrl || null);
      setHadithIconPreview(currentSettings.hadithIconUrl || null);
      setHeroImagePreview(currentSettings.heroImageUrl || null);
    } else if (!isLoading) {
      setDefaultTheme('theme-default-dark');
      setDefaultFont('font-body');
      setHeroTitle('العلم الشرعي بين يديك');
      setHeroSubtitle('منصة شاملة لمحاضرات ودروس نخبة من العلماء. تصفح، استمع، وتعلم.');
    }
  }, [currentSettings, isLoading]);

  const handleFileChange = (setter: React.Dispatch<React.SetStateAction<File | null>>, previewSetter: React.Dispatch<React.SetStateAction<string | null>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setter(file);
      previewSetter(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!firestore || !storage) {
      toast({ variant: 'destructive', title: 'خدمات Firebase غير جاهزة.' });
      return;
    }
    
    setIsSubmitting(true);

    try {
      const uploadImage = async (file: File | null, path: string): Promise<string | null> => {
        if (!file) return null;
        try {
          const storageRef = ref(storage, path);
          await uploadBytes(storageRef, file);
          return await getDownloadURL(storageRef);
        } catch (uploadError) {
          console.error(`Failed to upload ${file.name}:`, uploadError);
          return null; 
        }
      };

      const uploadPromises = [
        uploadImage(quranIconFile, `system_icons/quran_icon_${Date.now()}`),
        uploadImage(hadithIconFile, `system_icons/hadith_icon_${Date.now()}`),
        uploadImage(heroImageFile, `system_icons/hero_banner_${Date.now()}`),
      ];

      const [quranIconUrl, hadithIconUrl, heroImageUrl] = await Promise.all(uploadPromises);

      if ( (quranIconFile && !quranIconUrl) || (hadithIconFile && !hadithIconUrl) || (heroImageFile && !heroImageUrl) ) {
          throw new Error('فشل رفع صورة واحدة أو أكثر. يرجى التأكد من أن حجم الصورة مناسب والمحاولة مرة أخرى.');
      }

      const newSettings: Partial<AppearanceSettings> = {
        ...currentSettings,
        defaultTheme,
        defaultFont,
        maintenanceMode,
        heroTitle,
        heroSubtitle,
      };

      if (quranIconUrl) newSettings.quranIconUrl = quranIconUrl;
      if (hadithIconUrl) newSettings.hadithIconUrl = hadithIconUrl;
      if (heroImageUrl) newSettings.heroImageUrl = heroImageUrl;
      
      const settingsRef = doc(firestore, 'settings', 'appearance');
      await setDoc(settingsRef, newSettings, { merge: true });

      setQuranIconFile(null);
      setHadithIconFile(null);
      setHeroImageFile(null);
      
      toast({ title: 'تم حفظ الإعدادات بنجاح!' });

    } catch (error: any) {
      console.error("Error saving appearance settings:", error);
      toast({
        variant: 'destructive',
        title: 'فشل حفظ الإعدادات.',
        description: error.message || 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderImageUploader = (
    id: string,
    label: string,
    previewUrl: string | null,
    fileSetter: React.Dispatch<React.SetStateAction<File | null>>,
    previewSetter: React.Dispatch<React.SetStateAction<string | null>>,
    imageClassName: string = "rounded-md"
  ) => (
    <div className="space-y-2">
        <Label htmlFor={id}>{label}</Label>
        {previewUrl && (
            <Image 
                src={previewUrl} 
                alt={`${label} Preview`} 
                width={300} 
                height={150} 
                className={cn("bg-muted p-1 object-contain", imageClassName)}
            />
        )}
        <Input 
            id={id} 
            type="file" 
            accept="image/jpeg,image/png,image/webp,image/svg+xml" 
            onChange={handleFileChange(fileSetter, previewSetter)}
            disabled={isSubmitting}
        />
    </div>
  );


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
                    {/* Left Column */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="default-theme">الثيم الافتراضي</Label>
                            <Select value={defaultTheme} onValueChange={setDefaultTheme} disabled={isSubmitting}>
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
                            <Select value={defaultFont} onValueChange={setDefaultFont} disabled={isSubmitting}>
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
                        
                        {renderImageUploader("hero-image", "صورة البانر الرئيسي", heroImagePreview, setHeroImageFile, setHeroImagePreview, "w-full object-cover")}
                        
                        <div className="space-y-2">
                            <Label htmlFor="hero-title">العنوان الرئيسي للبانر</Label>
                            <Input id="hero-title" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} disabled={isSubmitting} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="hero-subtitle">العنوان الفرعي للبانر</Label>
                            <Textarea id="hero-subtitle" value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} rows={3} disabled={isSubmitting} />
                        </div>
                    </div>

                    {/* Right Column */}
                     <div className="space-y-6">
                        {renderImageUploader("quran-icon", "أيقونة المصحف (في نافذة المهلكات)", quranIconPreview, setQuranIconFile, setQuranIconPreview, "w-16 h-16")}
                        {renderImageUploader("hadith-icon", "أيقونة الحديث (في نافذة المهلكات)", hadithIconPreview, setHadithIconFile, setHadithIconPreview, "w-16 h-16")}
                         
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
                            disabled={isSubmitting}
                          />
                        </div>
                    </div>
                </div>

                {/* Save Button */}
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
