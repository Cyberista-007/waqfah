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
import { collection, doc, Timestamp } from "firebase/firestore";
import type { Challenge, Series } from "@/lib/types";
import { Loader2, Calendar as CalendarIcon } from "lucide-react";
import { addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";


interface ChallengeFormProps {
    item?: Challenge | null;
    onFormClose: () => void;
}

const AUTOSAVE_KEY = 'autosave_challenge_form';

export function ChallengeForm({ item, onFormClose }: ChallengeFormProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isEditMode = !!item;
  
  const { data: allSeries, isLoading: seriesLoading } = useCollection<Series>('series', { orderBy: ['title', 'asc'] });
  
  const toDate = (timestamp: any): Date | undefined => {
      if (!timestamp) return undefined;
      if (timestamp.toDate && typeof timestamp.toDate === 'function') return timestamp.toDate();
      try {
        const d = new Date(timestamp);
        return isNaN(d.getTime()) ? undefined : d;
      } catch {
        return undefined;
      }
  }

  // Convert all fields to controlled components
  const [title, setTitle] = useState(item?.title || "");
  const [description, setDescription] = useState(item?.description || "");
  const [rewardPoints, setRewardPoints] = useState<number>(item?.rewardPoints || 0);
  const [startDate, setStartDate] = useState<Date | undefined>(toDate(item?.startDate));
  const [endDate, setEndDate] = useState<Date | undefined>(toDate(item?.endDate));
  const [isActive, setIsActive] = useState<boolean>(item?.isActive || false);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>(item?.seriesId || "");

  // Load from localStorage on mount for new challenges
  useEffect(() => {
    if (!isEditMode) {
      const savedDataJSON = localStorage.getItem(AUTOSAVE_KEY);
      if (savedDataJSON) {
        try {
          const savedData = JSON.parse(savedDataJSON);
          setTitle(savedData.title || "");
          setDescription(savedData.description || "");
          setRewardPoints(savedData.rewardPoints || 0);
          setSelectedSeriesId(savedData.selectedSeriesId || "");
          setIsActive(savedData.isActive || false);
          if (savedData.startDate) setStartDate(new Date(savedData.startDate));
          if (savedData.endDate) setEndDate(new Date(savedData.endDate));
        } catch (e) {
          console.error("Failed to parse autosaved challenge data", e);
          localStorage.removeItem(AUTOSAVE_KEY);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode]);

  // Save to localStorage on change for new challenges
  useEffect(() => {
    if (!isEditMode) {
      const dataToSave = {
        title,
        description,
        rewardPoints,
        selectedSeriesId,
        isActive,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
      };
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(dataToSave));
    }
  }, [isEditMode, title, description, rewardPoints, selectedSeriesId, isActive, startDate, endDate]);

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

    if (!title || !description || !selectedSeriesId || !startDate || !endDate) {
        toast({
            variant: "destructive",
            title: "خطأ",
            description: "يرجى ملء جميع الحقول المطلوبة.",
        });
        setIsSubmitting(false);
        return;
    }

    const itemData = {
        title,
        description,
        seriesId: selectedSeriesId,
        startDate: Timestamp.fromDate(startDate),
        endDate: Timestamp.fromDate(endDate),
        rewardPoints: Number(rewardPoints),
        isActive,
        participantCount: item?.participantCount || 0,
    };

    try {
        if (isEditMode && item) {
          const itemRef = doc(firestore, 'challenges', item.id);
          updateDocumentNonBlocking(itemRef, itemData);
          toast({
              title: "تم التحديث بنجاح",
              description: `تم تحديث التحدي "${title}".`,
          });
        } else {
          const itemsCollection = collection(firestore, 'challenges');
          addDocumentNonBlocking(itemsCollection, itemData);
          toast({
              title: "تم الإنشاء بنجاح",
              description: `تمت إضافة التحدي "${title}" الجديد.`,
          });
        }
        handleClose(); // This now also clears storage
    } catch(e) {
        console.error("Error submitting challenge:", e);
        toast({ variant: 'destructive', title: "حدث خطأ", description: "لم نتمكن من حفظ التحدي." });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const isLoading = seriesLoading;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">{isEditMode ? `تعديل التحدي` : 'إضافة تحدي جديد'}</CardTitle>
        <CardDescription>
          املأ الحقول أدناه لإنشاء أو تعديل تحدي.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title">عنوان التحدي</Label>
            <Input id="title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} required disabled={isSubmitting} />
          </div>
           <div>
            <Label htmlFor="description">وصف التحدي</Label>
            <Textarea id="description" name="description" value={description} onChange={(e) => setDescription(e.target.value)} required disabled={isSubmitting} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="seriesId">السلسلة المستهدفة</Label>
              <Select name="seriesId" onValueChange={setSelectedSeriesId} value={selectedSeriesId} disabled={isLoading}>
                  <SelectTrigger>
                      <SelectValue placeholder="اختر سلسلة..." />
                  </SelectTrigger>
                  <SelectContent>
                      {allSeries?.map(s => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}
                  </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="rewardPoints">نقاط المكافأة</Label>
              <Input id="rewardPoints" name="rewardPoints" type="number" value={rewardPoints} onChange={(e) => setRewardPoints(Number(e.target.value))} disabled={isSubmitting} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>تاريخ البدء</Label>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : <span>اختر تاريخاً</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                    </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>تاريخ الانتهاء</Label>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : <span>اختر تاريخاً</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                    </PopoverContent>
                </Popover>
              </div>
          </div>
          
          <div className="flex items-center space-x-2 space-x-reverse">
             <Switch id="is-active" checked={isActive} onCheckedChange={setIsActive} />
             <Label htmlFor="is-active">تفعيل التحدي (سيظهر للمستخدمين)</Label>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting || isLoading}>
                {(isSubmitting || isLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? 'حفظ التغييرات' : 'إنشاء التحدي'}
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
