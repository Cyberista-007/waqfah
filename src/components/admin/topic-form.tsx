
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
import { useState, useEffect } from "react";
import { useFirestore, useCollection } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import type { Topic, Lecture, Series } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TopicFormProps {
    topic?: Topic | null;
    onFormClose: () => void;
}

const AUTOSAVE_KEY = 'autosave_topic_form';

export function TopicForm({ topic, onFormClose }: TopicFormProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isEditMode = !!topic;

  const { data: allLectures, isLoading: lecturesLoading } = useCollection<Lecture>('lectures', { orderBy: ['title', 'asc'] });
  const { data: allSeries, isLoading: seriesLoading } = useCollection<Series>('series', { orderBy: ['title', 'asc'] });
  
  const [name, setName] = useState(topic?.name || "");
  const [description, setDescription] = useState(topic?.description || "");
  const [selectedLectures, setSelectedLectures] = useState<string[]>(topic?.lectureIds || []);
  const [selectedSeries, setSelectedSeries] = useState<string[]>(topic?.seriesIds || []);

  useEffect(() => {
    if (!isEditMode) {
      const savedDataJSON = localStorage.getItem(AUTOSAVE_KEY);
      if (savedDataJSON) {
        try {
          const savedData = JSON.parse(savedDataJSON);
          setName(savedData.name || "");
          setDescription(savedData.description || "");
          setSelectedLectures(savedData.selectedLectures || []);
          setSelectedSeries(savedData.selectedSeries || []);
        } catch (e) {
          console.error("Failed to parse autosaved topic data", e);
          localStorage.removeItem(AUTOSAVE_KEY);
        }
      }
    }
  }, [isEditMode]);

  useEffect(() => {
    if (!isEditMode) {
      const dataToSave = { name, description, selectedLectures, selectedSeries };
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(dataToSave));
    }
  }, [isEditMode, name, description, selectedLectures, selectedSeries]);
  
  const handleClose = () => {
    if (!isEditMode) {
      localStorage.removeItem(AUTOSAVE_KEY);
    }
    onFormClose();
  };

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

    const slug = name.trim().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\u0600-\u06FF-]/g, '');

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
        updateDocumentNonBlocking(topicRef, topicData);
        toast({
            title: "تم التحديث بنجاح",
            description: `تم تحديث موضوع "${name}".`,
        });
      } else {
        const topicsCollection = collection(firestore, 'topics');
        addDocumentNonBlocking(topicsCollection, topicData);
        toast({
            title: "تم الإنشاء بنجاح",
            description: `تمت إضافة موضوع "${name}" الجديد.`,
        });
      }
      handleClose();
    } catch(e) {
      console.error("Error submitting topic:", e);
      toast({ variant: 'destructive', title: "حدث خطأ", description: "لم نتمكن من حفظ الموضوع." });
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
                    <Input id="name" name="name" value={name} onChange={e => setName(e.target.value)} required disabled={isSubmitting} />
                </div>
                <div>
                    <Label htmlFor="description">وصف الموضوع</Label>
                    <Textarea id="description" name="description" value={description} onChange={e => setDescription(e.target.value)} required disabled={isSubmitting} />
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
            <Button type="button" onClick={handleClose} variant="outline">
              إلغاء
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
