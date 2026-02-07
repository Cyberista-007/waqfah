'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useDoc, useFirestore } from '@/firebase';
import type { AnnouncementSettings } from '@/lib/types';
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Megaphone } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

export default function AdminAnnouncementPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { data: currentSettings, isLoading } = useDoc<AnnouncementSettings>('settings/announcement');

  const [text, setText] = useState('');
  const [link, setLink] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentSettings) {
      setText(currentSettings.text || '');
      setLink(currentSettings.link || '');
      setIsActive(currentSettings.isActive || false);
    }
  }, [currentSettings]);

  const handleSubmit = async () => {
    if (!firestore) {
        toast({ variant: 'destructive', title: 'خطأ في الاتصال بقاعدة البيانات.' });
        return;
    }
    if (!text && isActive) {
        toast({ variant: 'destructive', title: 'لا يمكن تفعيل إعلان فارغ.' });
        return;
    }

    setIsSubmitting(true);
    try {
        const settingsRef = doc(firestore, 'settings', 'announcement');
        await setDoc(settingsRef, { text, link, isActive }, { merge: true });
        toast({ title: 'تم حفظ إعدادات الإعلان بنجاح!' });
    } catch (error) {
        console.error("Error saving announcement settings:", error);
        toast({ variant: 'destructive', title: 'فشل حفظ الإعدادات.' });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-headline flex items-center gap-2">
            <Megaphone />
            إدارة شريط الإعلان
        </CardTitle>
        <CardDescription>
            تحكم في محتوى وحالة ظهور شريط الإعلان الذي يظهر أعلى الموقع.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : (
            <div className="space-y-6 max-w-2xl">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="maintenance-mode" className="text-base">تفعيل شريط الإعلان</Label>
                    <CardDescription>
                      عند تفعيله، سيظهر الشريط أعلى الموقع لجميع الزوار.
                    </CardDescription>
                  </div>
                  <Switch
                    id="maintenance-mode"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                </div>
            
                <div className="space-y-2">
                    <Label htmlFor="announcement-text">نص الإعلان</Label>
                    <Textarea 
                        id="announcement-text" 
                        placeholder="مثال: بث مباشر للشيخ فلان يوم الجمعة بعد العشاء..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="announcement-link">رابط (اختياري)</Label>
                    <Input 
                        id="announcement-link"
                        type="url"
                        placeholder="https://example.com/live"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
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
