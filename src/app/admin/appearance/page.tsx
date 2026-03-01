
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDoc, useFirestore, useStorage, setDocumentNonBlocking } from '@/firebase';
import type { AppearanceSettings } from '@/lib/types';
import { doc } from 'firebase/firestore';
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

  const handleSubmit = () => {
    if (!firestore || !storage) {
      toast({ variant: 'destructive', title: 'خدمات Firebase غير جاهزة.' });
      return;
    }

    const settingsRef = doc(firestore, 'settings', 'appearance');
    
    // --- Step 1: Immediately save all text-based data ---
    const textSettings: Partial<AppearanceSettings> = {
      defaultTheme,
      defaultFont,
      maintenanceMode,
      heroTitle,
      heroSubtitle,
    };
    setDocumentNonBlocking(settingsRef, textSettings, { merge: true });

    // --- Step 2: Handle file uploads in the background ---
    const filesToUpload = [
      { file: quranIconFile, key: 'quranIconUrl', path: `system_icons/quran_icon_${Date.now()}` },
      { file: hadithIconFile, key: 'hadithIconUrl', path: `system_icons/hadith_icon_${Date.now()}` },
      { file: heroImageFile, key: 'heroImageUrl', path: `system_icons/hero_banner_${Date.now()}` },
    ].filter(item => item.file);

    if (filesToUpload.length > 0) {
      toast({ title: 'تم حفظ الإعدادات النصية.', description: 'جاري الآن رفع الصور في الخلفية...' });

      // Process each file upload independently
      filesToUpload.forEach(({ file, key, path }) => {
        (async () => {
          try {
            const storageRef = ref(storage, path);
            await uploadBytes(storageRef, file!);
            const downloadURL = await getDownloadURL(storageRef);
            // This is another non-blocking update
            setDocumentNonBlocking(settingsRef, { [key]: downloadURL }, { merge: true });
          } catch (uploadError) {
            console.error(`Failed to upload ${file!.name}:`, uploadError);
            toast({
              variant: 'destructive',
              title: `فشل رفع صورة: ${file!.name}`,
            });
          }
        })(); // Fire and forget for each file
      });
      
      // Clear file inputs optimistically
      setQuranIconFile(null);
      setHadithIconFile(null);
      setHeroImageFile(null);
    } else {
      // No files, just a simple save message.
      toast({ title: 'تم حفظ الإعدادات بنجاح!' });
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
                        
                        {renderImageUploader("hero-image", "صورة البانر الرئيسي", heroImagePreview, setHeroImageFile, setHeroImagePreview, "w-full object-cover")}
                        
                        <div className="space-y-2">
                            <Label htmlFor="hero-title">العنوان الرئيسي للبانر</Label>
                            <Input id="hero-title" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="hero-subtitle">العنوان الفرعي للبانر</Label>
                            <Textarea id="hero-subtitle" value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} rows={3} />
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
                          />
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <Button onClick={handleSubmit}>
                    حفظ الإعدادات
                </Button>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
