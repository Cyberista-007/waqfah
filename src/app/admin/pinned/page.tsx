'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useDoc, useFirestore, useCollection } from '@/firebase';
import type { PinnedLectureSettings, Lecture } from '@/lib/types';
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Pin, Check, ChevronsUpDown } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function AdminPinnedLecturePage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { data: currentSettings, isLoading: settingsLoading } = useDoc<PinnedLectureSettings>('settings/pinned_lecture');
  const { data: allLectures, isLoading: lecturesLoading } = useCollection<Lecture>('lectures', { orderBy: ['createdAt', 'desc']});

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (currentSettings) {
      setSelectedIds(currentSettings.lectureIds || []);
      setMessage(currentSettings.message || '');
      setIsActive(currentSettings.isActive || false);
    }
  }, [currentSettings]);

  const handleSubmit = async () => {
    if (!firestore) {
        toast({ variant: 'destructive', title: 'خطأ في الاتصال بقاعدة البيانات.' });
        return;
    }
    if (selectedIds.length === 0 && isActive) {
        toast({ variant: 'destructive', title: 'لا يمكن تفعيل قسم بدون تحديد محاضرات.' });
        return;
    }

    setIsSubmitting(true);
    try {
        const settingsRef = doc(firestore, 'settings', 'pinned_lecture');
        await setDoc(settingsRef, { lectureIds: selectedIds, message, isActive }, { merge: true });
        toast({ title: 'تم حفظ إعدادات المحاضرات المثبتة بنجاح!' });
    } catch (error) {
        console.error("Error saving pinned lecture settings:", error);
        toast({ variant: 'destructive', title: 'فشل حفظ الإعدادات.' });
    } finally {
        setIsSubmitting(false);
    }
  };

  const isLoading = settingsLoading || lecturesLoading;
  
  const selectedLectures = allLectures?.filter(l => selectedIds.includes(l.id)) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-headline flex items-center gap-2">
            <Pin />
            تثبيت محاضرات في الرئيسية
        </CardTitle>
        <CardDescription>
            اختر المحاضرات لتثبيتها في الصفحة الرئيسية مع رسالة مخصصة.
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
                      عند تفعيله، سيظهر قسم المحاضرات المثبتة في الصفحة الرئيسية.
                    </CardDescription>
                  </div>
                  <Switch
                    id="is-active"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                </div>
            
                <div className="space-y-2">
                    <Label htmlFor="lecture-select">اختر المحاضرات</Label>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={open}
                          className="w-full justify-between h-auto min-h-10"
                        >
                          <div className="flex gap-1 flex-wrap">
                            {selectedLectures.length > 0 ? selectedLectures.map(lecture => (
                                <Badge key={lecture.id} variant="secondary">{lecture.title}</Badge>
                            )) : "اختر محاضرة أو أكثر..."}
                          </div>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                          <CommandInput placeholder="ابحث عن محاضرة..." />
                          <CommandList>
                            <CommandEmpty>لا توجد نتائج.</CommandEmpty>
                            <CommandGroup>
                              {allLectures?.map((lecture) => (
                                <CommandItem
                                  key={lecture.id}
                                  onSelect={() => {
                                    setSelectedIds(
                                      selectedIds.includes(lecture.id)
                                        ? selectedIds.filter((id) => id !== lecture.id)
                                        : [...selectedIds, lecture.id]
                                    )
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedIds.includes(lecture.id) ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {lecture.title}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="pinned-message">رسالة مخصصة (اختياري)</Label>
                    <Textarea 
                        id="pinned-message" 
                        placeholder="مثال: محاضرات هامة بمناسبة شهر رمضان..."
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
