
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState, useMemo } from "react";
import { useFirestore, useCollection } from "@/firebase";
import { collection, doc, orderBy, query, Timestamp } from "firebase/firestore";
import type { Topic, Lecture, Series } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TopicFormProps {
    topic?: Topic | null;
    onFormClose: () => void;
}

export function TopicForm({ topic, onFormClose }: TopicFormProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isEditMode = !!topic;

  const lecturesQuery = useMemo(
    () => (firestore ? query(collection(firestore, 'lectures'), orderBy('title')) : null),
    [firestore]
  );
  const { data: allLectures, isLoading: lecturesLoading } = useCollection<Lecture>(lecturesQuery);

  const seriesQuery = useMemo(
    () => (firestore ? query(collection(firestore, 'series'), orderBy('title')) : null),
    [firestore]
  );
  const { data: allSeries, isLoading: seriesLoading } = useCollection<Series>(seriesQuery);
  
  const [selectedLectures, setSelectedLectures] = useState<string[]>(topic?.lectureIds || []);
  const [selectedSeries, setSelectedSeries] = useState<string[]>(topic?.seriesIds || []);

  const handleCheckboxChange = (type: 'lecture' | 'series', id: string, checked: boolean) => {
      if (type === 'lecture') {
          setSelectedLectures(prev => checked ? [...prev, id] : prev.filter(item => item !== id));
      } else {
          setSelectedSeries(prev => checked ? [...prev, id] : prev.filter(item => item !== id));
      }
  }


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firestore) return;
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

    if (!name || !description) {
        toast({
            variant: "destructive",
            title: "خطأ",
            description: "يرجى ملء جميع الحقول المطلوبة.",
        });
        setIsSubmitting(false);
        return;
    }

    const topicData = {
        name,
        slug,
        description,
        imageId: `topic-${slug}`,
        lectureIds: selectedLectures,
        seriesIds: selectedSeries,
    };

    try {
      if (isEditMode && topic) {
        const topicRef = doc(firestore, 'topics', topic.id);
        await updateDocumentNonBlocking(topicRef, topicData);
        toast({
            title: "تم التحديث بنجاح",
            description: `تم تحديث موضوع "${name}".`,
        });
      } else {
        const topicsCollection = collection(firestore, 'topics');
        await addDocumentNonBlocking(topicsCollection, topicData);
        toast({
            title: "تم الإنشاء بنجاح",
            description: `تمت إضافة موضوع "${name}" الجديد.`,
        });
      }
      onFormClose();
    } catch (error) {
      console.error("Error submitting topic:", error);
      toast({
        variant: "destructive",
        title: "حدث خطأ",
        description: "لم نتمكن من حفظ الموضوع. يرجى المحاولة مرة أخرى.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const isLoading = lecturesLoading || seriesLoading;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">{isEditMode ? `تعديل الموضوع: ${topic?.name}` : 'إضافة موضوع جديد'}</CardTitle>
        <CardDescription>
          {isEditMode ? 'قم بتحديث تفاصيل الموضوع والمحتوى المرتبط به.' : 'املأ الحقول أدناه لإنشاء موضوع جديد.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                    <Label htmlFor="name">اسم الموضوع</Label>
                    <Input id="name" name="name" defaultValue={topic?.name} required disabled={isSubmitting} />
                </div>
                <div>
                    <Label htmlFor="description">وصف الموضوع</Label>
                    <Textarea id="description" name="description" defaultValue={topic?.description} required disabled={isSubmitting} />
                </div>
              </div>
              <div className="space-y-4">
                 <div>
                    <Label>المحاضرات المرتبطة</Label>
                    <ScrollArea className="h-40 rounded-md border p-4">
                        {isLoading ? <Loader2 className="animate-spin" /> : allLectures?.map(lecture => (
                            <div key={lecture.id} className="flex items-center space-x-2 space-x-reverse mb-2">
                                <Checkbox
                                    id={`lecture-${lecture.id}`}
                                    checked={selectedLectures.includes(lecture.id)}
                                    onCheckedChange={(checked) => handleCheckboxChange('lecture', lecture.id, !!checked)}
                                />
                                <label htmlFor={`lecture-${lecture.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    {lecture.title}
                                </label>
                            </div>
                        ))}
                    </ScrollArea>
                 </div>
                 <div>
                    <Label>السلاسل المرتبطة</Label>
                     <ScrollArea className="h-40 rounded-md border p-4">
                        {isLoading ? <Loader2 className="animate-spin" /> : allSeries?.map(s => (
                            <div key={s.id} className="flex items-center space-x-2 space-x-reverse mb-2">
                                <Checkbox
                                    id={`series-${s.id}`}
                                    checked={selectedSeries.includes(s.id)}
                                    onCheckedChange={(checked) => handleCheckboxChange('series', s.id, !!checked)}
                                />
                                <label htmlFor={`series-${s.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    {s.title}
                                </label>
                            </div>
                        ))}
                    </ScrollArea>
                 </div>
              </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting || isLoading}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? 'حفظ التغييرات' : 'إنشاء الموضوع'}
            </Button>
            <Button type="button" onClick={onFormClose} variant="outline">
              إلغاء
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
