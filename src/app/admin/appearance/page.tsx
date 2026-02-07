
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDoc, useFirestore } from '@/firebase';
import type { AppearanceSettings } from '@/lib/types';
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Palette } from 'lucide-react';
import { themes } from '@/components/theme-switcher';
import { fonts } from '@/components/font-switcher';
import { Switch } from '@/components/ui/switch';

export default function AdminAppearancePage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { data: currentSettings, isLoading } = useDoc<AppearanceSettings>('settings/appearance');

  const [defaultTheme, setDefaultTheme] = useState<string>('');
  const [defaultFont, setDefaultFont] = useState<string>('');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentSettings) {
      setDefaultTheme(currentSettings.defaultTheme || 'theme-default-dark');
      setDefaultFont(currentSettings.defaultFont || 'font-body');
      setMaintenanceMode(currentSettings.maintenanceMode || false);
    } else if (!isLoading) {
      setDefaultTheme('theme-default-dark');
      setDefaultFont('font-body');
      setMaintenanceMode(false);
    }
  }, [currentSettings, isLoading]);

  const handleSubmit = async () => {
    if (!firestore || !defaultTheme || !defaultFont) {
        toast({ variant: 'destructive', title: 'يرجى اختيار الثيم والخط الافتراضي.' });
        return;
    }

    setIsSubmitting(true);
    try {
        const settingsRef = doc(firestore, 'settings', 'appearance');
        await setDoc(settingsRef, { defaultTheme, defaultFont, maintenanceMode }, { merge: true });
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
            تحكم في الثيم والخط الافتراضي الذي يراه الزوار الجدد، وقم بتفعيل وضع الصيانة.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : (
            <div className="space-y-6 max-w-md">
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
