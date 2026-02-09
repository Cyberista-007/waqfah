'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useDoc, useFirestore, useCollection } from '@/firebase';
import type { PinnedLectureSettings, Lecture } from '@/lib/types';
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Pin } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AdminPinnedLecturePage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { data: currentSettings, isLoading: settingsLoading } = useDoc<PinnedLectureSettings>('settings/pinned_lecture');
  const { data: allLectures, isLoading: lecturesLoading } = useCollection<Lecture>('lectures', { orderBy: ['createdAt', 'desc']});

  const [lectureId, setLectureId] = useState('');
  const [message, setMessage] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentSettings) {
      setLectureId(currentSettings.lectureId || '');
      setMessage(currentSettings.message || '');
      setIsActive(currentSettings.isActive || false);
    }
  }, [currentSettings]);

  const handleSubmit = async () => {
    if (!firestore) {
        toast({ variant: 'destructive', title: 'خطأ في الاتصال بقاعدة البيانات.' });
        return;
    }
    if (!lectureId && isActive) {
        toast({ variant: 'destructive', title: 'لا يمكن تفعيل قسم بدون تحديد محاضرة.' });
        return;
    }

    setIsSubmitting(true);
    try {
        const settingsRef = doc(firestore, 'settings', 'pinned_lecture');
        await setDoc(settingsRef, { lectureId, message, isActive }, { merge: true });
        toast({ title: 'تم حفظ إعدادات المحاضرة المثبتة بنجاح!' });
    } catch (error) {
        console.error("Error saving pinned lecture settings:", error);
        toast({ variant: 'destructive', title: 'فشل حفظ الإعدادات.' });
    } finally {
        setIsSubmitting(false);
    }
  };

  const isLoading = settingsLoading || lecturesLoading;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-headline flex items-center gap-2">
            <Pin />
            تثبيت محاضرة في الرئيسية
        </CardTitle>
        <CardDescription>
            اختر محاضرة لتثبيتها في الصفحة الرئيسية مع رسالة مخصصة.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : (
            <div className="space-y-6 max-w-2xl">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="is-active" className="text-base">تفعيل القسم</Label>
                    <CardDescription>
                      عند تفعيله، سيظهر قسم المحاضرة المثبتة في الصفحة الرئيسية.
                    </CardDescription>
                  </div>
                  <Switch
                    id="is-active"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                </div>
            
                <div className="space-y-2">
                    <Label htmlFor="lecture-select">اختر المحاضرة</Label>
                    <Select value={lectureId} onValueChange={setLectureId}>
                        <SelectTrigger id="lecture-select">
                            <SelectValue placeholder="اختر محاضرة لتثبيتها..." />
                        </SelectTrigger>
                        <SelectContent>
                            {allLectures?.map(lecture => (
                                <SelectItem key={lecture.id} value={lecture.id}>
                                    {lecture.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="pinned-message">رسالة مخصصة (اختياري)</Label>
                    <Textarea 
                        id="pinned-message" 
                        placeholder="مثال: محاضرة هامة بمناسبة شهر رمضان..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
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
