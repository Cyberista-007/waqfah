
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
import { Loader2, Palette, Plus, Trash2, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { HeroBanner } from '@/lib/types';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import Image from 'next/image';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { themes } from '@/components/theme-switcher';
import { fonts } from '@/components/font-switcher';
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
  
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [newBannerFile, setNewBannerFile] = useState<File | null>(null);

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
      setBanners(currentSettings.heroBanners || []);
      
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

  const addBanner = async () => {
    if (!newBannerFile || !storage || !firestore) return;
    
    const bannerId = `hero_banner_${Date.now()}`;
    const storageRef = ref(storage, `banners/${bannerId}`);
    
    toast({ title: 'جاري رفع البانر الجديد...' });
    
    try {
        await uploadBytes(storageRef, newBannerFile);
        const url = await getDownloadURL(storageRef);
        const newBanner: HeroBanner = {
            imageUrl: url,
            title: '',
            subtitle: ''
        };
        const updatedBanners = [...banners, newBanner];
        setBanners(updatedBanners);
        const settingsRef = doc(firestore, 'settings', 'appearance');
        await setDocumentNonBlocking(settingsRef, { heroBanners: updatedBanners }, { merge: true });
        setNewBannerFile(null);
        toast({ title: 'تمت إضافة البانر بنجاح' });
    } catch (e) {
        toast({ variant: 'destructive', title: 'فشل رفع البانر' });
    }
  };

  const updateBannerText = (index: number, field: keyof HeroBanner, value: string) => {
    const updated = [...banners];
    updated[index] = { ...updated[index], [field]: value };
    setBanners(updated);
  };

  const removeBanner = (index: number) => {
    const updated = banners.filter((_, i) => i !== index);
    setBanners(updated);
  };

  const handleSubmit = () => {
    if (!firestore || !storage) {
      toast({ variant: 'destructive', title: 'خدمات Firebase غير جاهزة.' });
      return;
    }

    const settingsRef = doc(firestore, 'settings', 'appearance');
    
    const textSettings: Partial<AppearanceSettings> = {
      defaultTheme,
      defaultFont,
      maintenanceMode,
      heroTitle,
      heroSubtitle,
      heroBanners: banners,
    };
    setDocumentNonBlocking(settingsRef, textSettings, { merge: true });

    const filesToUpload = [
      { file: quranIconFile, key: 'quranIconUrl', path: `system_icons/quran_icon_${Date.now()}` },
      { file: hadithIconFile, key: 'hadithIconUrl', path: `system_icons/hadith_icon_${Date.now()}` },
      { file: heroImageFile, key: 'heroImageUrl', path: `system_icons/hero_banner_${Date.now()}` },
    ].filter(item => item.file);

    if (filesToUpload.length > 0) {
      toast({ title: 'تم حفظ الإعدادات النصية.', description: 'جاري الآن رفع الصور في الخلفية...' });

      filesToUpload.forEach(({ file, key, path }) => {
        (async () => {
          try {
            const storageRef = ref(storage, path);
            await uploadBytes(storageRef, file!);
            const downloadURL = await getDownloadURL(storageRef);
            setDocumentNonBlocking(settingsRef, { [key]: downloadURL }, { merge: true });
          } catch (uploadError) {
            console.error(`Failed to upload ${file!.name}:`, uploadError);
            toast({ variant: 'destructive', title: `فشل رفع صورة: ${file!.name}` });
          }
        })();
      });
      
      setQuranIconFile(null);
      setHadithIconFile(null);
      setHeroImageFile(null);
    } else {
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
            <div className="relative aspect-video w-full max-w-[300px] overflow-hidden rounded-xl border bg-muted">
                <Image 
                    src={previewUrl} 
                    alt={`${label} Preview`} 
                    fill
                    className={cn("object-cover", imageClassName)}
                />
            </div>
        )}
        <Input 
            id={id} 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange(fileSetter, previewSetter)}
            className="cursor-pointer"
        />
    </div>
  );


  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-black font-headline tracking-tighter">إدارة المظهر والبانرات</h1>
           <p className="text-muted-foreground">تحكم في الهوية البصرية والواجهة الرئيسية للمنصة.</p>
        </div>
        <Button onClick={handleSubmit} size="lg" className="font-bold shadow-xl shadow-primary/20">
            حفظ كافة التغييرات
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            {/* Banner Gallery Manager */}
            <Card className="border-2 border-primary/10 overflow-hidden">
                <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                        <ImageIcon className="text-primary" /> معرض البانرات المنزلقة
                    </CardTitle>
                    <CardDescription>أضف عدة صور للبانر الرئيسي ليظهر بشكل سلايدر سينمائي.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {banners.map((banner, idx) => (
                            <div key={idx} className="group relative border rounded-2xl p-4 bg-muted/20 hover:bg-muted/40 transition-all space-y-4">
                                <div className="relative aspect-[21/9] rounded-xl overflow-hidden shadow-inner">
                                    <Image src={banner.imageUrl} alt="Banner" fill className="object-cover" />
                                    <Button 
                                        variant="destructive" 
                                        size="icon" 
                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => removeBanner(idx)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex gap-2 items-center px-1">
                                        <Palette className="w-4 h-4 text-primary opacity-50" />
                                        <Input 
                                            placeholder="العنوان المخصص لهذا البانر..." 
                                            value={banner.title} 
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateBannerText(idx, 'title', e.target.value)}
                                            className="h-8 text-sm"
                                        />
                                    </div>
                                    <div className="flex gap-2 items-center px-1">
                                        <LinkIcon className="w-4 h-4 text-primary opacity-50" />
                                        <Input 
                                            placeholder="رابط التوجيه (اختياري)..." 
                                            value={banner.link || ''} 
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateBannerText(idx, 'link', e.target.value)}
                                            className="h-8 text-sm"
                                        />
                                    </div>
                                    <Textarea 
                                        placeholder="وصف فرعي مخصص..." 
                                        value={banner.subtitle} 
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateBannerText(idx, 'subtitle', e.target.value)}
                                        className="text-xs min-h-[60px]"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-4 hover:bg-primary/5 transition-colors">
                        <ImageIcon className="w-12 h-12 text-muted-foreground opacity-20" />
                        <div className="text-center">
                            <h4 className="font-bold">إضافة بانر جديد</h4>
                            <p className="text-sm text-muted-foreground">يفضل استخدام صور عرضية (21:9)</p>
                        </div>
                        <div className="flex gap-2 w-full max-w-md">
                            <Input 
                                type="file" 
                                accept="image/*" 
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewBannerFile(e.target.files?.[0] || null)}
                                className="flex-1"
                            />
                            <Button disabled={!newBannerFile} onClick={addBanner} className="gap-2">
                                <Plus className="w-4 h-4" /> رفع
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>نصوص البانر الافتراضية</CardTitle>
                    <CardDescription>تستخدم هذه النصوص في حال لم يتم تحديد نصوص مخصصة للبانر.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>العنوان الافتراضي</Label>
                            <Input value={heroTitle} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHeroTitle(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>الوصف الافتراضي</Label>
                            <Textarea value={heroSubtitle} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setHeroSubtitle(e.target.value)} rows={3} />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>الثيم والخطوط</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label>الثيم الافتراضي</Label>
                        <Select value={defaultTheme} onValueChange={setDefaultTheme}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {themes.map(t => <SelectItem key={t.value} value={t.value}>{t.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>الخط الافتراضي</Label>
                        <Select value={defaultFont} onValueChange={setDefaultFont}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {fonts.map(f => <SelectItem key={f.value} value={f.value}>{f.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-xl">
                        <Label className="cursor-pointer" htmlFor="main-switch">وضع الصيانة</Label>
                        <Switch id="main-switch" checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>أيقونات النظام</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {renderImageUploader("quran-icon", "أيقونة المصحف", quranIconPreview, setQuranIconFile, setQuranIconPreview, "w-16 h-16 rounded-full mx-auto")}
                    {renderImageUploader("hadith-icon", "أيقونة الحديث", hadithIconPreview, setHadithIconFile, setHadithIconPreview, "w-16 h-16 rounded-full mx-auto")}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
