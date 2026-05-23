
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useFirestore } from "@/firebase";
import { collection, doc, Timestamp } from "firebase/firestore";
import type { ScheduleItem } from "@/lib/types";
import { Loader2, Calendar as CalendarIcon } from "lucide-react";
import { addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";

interface ScheduleFormProps {
    item?: ScheduleItem | null;
    onFormClose: () => void;
}

const AUTOSAVE_KEY = 'autosave_schedule_form';

export function ScheduleForm({ item, onFormClose }: ScheduleFormProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isEditMode = !!item;

  const [title, setTitle] = useState(item?.title || "");
  const [duration, setDuration] = useState(item?.duration || 60);
  const [date, setDate] = useState<Date | undefined>(item?.dateTime ? (typeof (item.dateTime as any).toDate === 'function' ? (item.dateTime as any).toDate() : new Date(item.dateTime as any)) : undefined);
  const [time, setTime] = useState<string>(item?.dateTime ? format(typeof (item.dateTime as any).toDate === 'function' ? (item.dateTime as any).toDate() : new Date(item.dateTime as any), "HH:mm") : "12:00");
  const [isLive, setIsLive] = useState<boolean>(item?.isLive || false);
  
  useEffect(() => {
    if (!isEditMode) {
      const savedDataJSON = localStorage.getItem(AUTOSAVE_KEY);
      if (savedDataJSON) {
        try {
          const savedData = JSON.parse(savedDataJSON);
          setTitle(savedData.title || "");
          setDuration(savedData.duration || 60);
          if (savedData.date) setDate(new Date(savedData.date));
          setTime(savedData.time || "12:00");
          setIsLive(savedData.isLive || false);
        } catch (e) {
          console.error("Failed to parse autosaved schedule data", e);
          localStorage.removeItem(AUTOSAVE_KEY);
        }
      }
    }
  }, [isEditMode]);

  useEffect(() => {
    if (!isEditMode) {
      const dataToSave = { title, duration, date: date?.toISOString(), time, isLive };
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(dataToSave));
    }
  }, [isEditMode, title, duration, date, time, isLive]);

  const handleClose = () => {
    if (!isEditMode) {
      localStorage.removeItem(AUTOSAVE_KEY);
    }
    onFormClose();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firestore) return;
    setIsSubmitting(true);

    if (!title || !date || !time) {
        toast({
            variant: "destructive",
            title: "خطأ",
            description: "يرجى ملء جميع الحقول المطلوبة.",
        });
        setIsSubmitting(false);
        return;
    }
    
    const [hours, minutes] = time.split(':').map(Number);
    const combinedDateTime = new Date(date);
    combinedDateTime.setHours(hours, minutes);

    const itemData = {
        title,
        dateTime: Timestamp.fromDate(combinedDateTime),
        duration: duration,
        isLive,
    };

    try {
        if (isEditMode && item) {
          const itemRef = doc(firestore, 'scheduled_lessons', item.id);
          updateDocumentNonBlocking(itemRef, itemData);
          toast({
              title: "تم التحديث بنجاح",
              description: `تم تحديث الدرس "${title}".`,
          });
        } else {
          const itemsCollection = collection(firestore, 'scheduled_lessons');
          addDocumentNonBlocking(itemsCollection, itemData);
          toast({
              title: "تم الإنشاء بنجاح",
              description: `تمت إضافة الدرس "${title}" الجديد.`,
          });
        }
        handleClose();
    } catch(e) {
        console.error("Error submitting schedule item:", e);
        toast({ variant: 'destructive', title: "حدث خطأ", description: "لم نتمكن من حفظ الدرس." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">{isEditMode ? `تعديل الدرس` : 'إضافة درس جديد'}</CardTitle>
        <CardDescription>
          املأ الحقول أدناه لإنشاء أو تعديل درس في الجدول الزمني.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title">عنوان الدرس</Label>
            <Input id="title" name="title" value={title} onChange={e => setTitle(e.target.value)} required disabled={isSubmitting} />
          </div>

          <div className="flex gap-4">
              <div className="flex-1">
                <Label>تاريخ الدرس</Label>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>اختر تاريخاً</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
              </div>
              <div className="flex-1">
                <Label htmlFor="time">وقت الدرس</Label>
                <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
              </div>
          </div>
          
          <div>
             <Label htmlFor="duration">المدة (بالدقائق)</Label>
             <Input id="duration" name="duration" type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} />
          </div>

          <div className="flex items-center space-x-2 space-x-reverse">
             <Switch id="is-live" checked={isLive} onCheckedChange={setIsLive} />
             <Label htmlFor="is-live">هل هذا بث مباشر؟</Label>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? 'حفظ التغييرات' : 'إنشاء الدرس'}
            </Button>
            <Button type="button" onClick={handleClose} variant="outline">
              إلغاء
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
