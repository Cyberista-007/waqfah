"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { collection, Timestamp } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Loader2 } from 'lucide-react';

interface ClipCreationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  lectureId: string;
  lectureDuration: number;
}

// Helper to parse MM:SS or SS to seconds
const parseTimeToSeconds = (timeStr: string): number => {
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 2) {
        return (parts[0] * 60) + parts[1];
    }
    if (parts.length === 1) {
        return parts[0];
    }
    return 0;
};


export function ClipCreationDialog({ isOpen, onOpenChange, lectureId, lectureDuration }: ClipCreationDialogProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firestore || !user) {
        toast({ variant: 'destructive', title: "يرجى تسجيل الدخول أولاً."});
        return;
    };
    
    setIsSubmitting(true);
    
    const formData = new FormData(event.currentTarget);
    const title = formData.get("title") as string;
    const startTimeStr = formData.get("startTime") as string;
    const endTimeStr = formData.get("endTime") as string;

    const startTime = parseTimeToSeconds(startTimeStr);
    const endTime = parseTimeToSeconds(endTimeStr);

    if (!title || !startTimeStr || !endTimeStr) {
        toast({ variant: 'destructive', title: "يرجى ملء جميع الحقول." });
        setIsSubmitting(false);
        return;
    }

    if (startTime >= endTime) {
        toast({ variant: 'destructive', title: "وقت البدء يجب أن يكون قبل وقت النهاية." });
        setIsSubmitting(false);
        return;
    }
    
    if (endTime > lectureDuration) {
        toast({ variant: 'destructive', title: `وقت النهاية يتجاوز مدة المحاضرة.` });
        setIsSubmitting(false);
        return;
    }

    const clipsCollection = collection(firestore, 'lectures', lectureId, 'clips');
    const clipData = {
        lectureId,
        userId: user.uid,
        title,
        startTime,
        endTime,
        createdAt: Timestamp.now(),
    };

    addDocumentNonBlocking(clipsCollection, clipData);
    toast({ title: "تم إنشاء المقطع بنجاح!" });
    onOpenChange(false);
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>إنشاء مقطع جديد</DialogTitle>
          <DialogDescription>
            حدد عنوانًا ووقت البدء والنهاية لمقطعك.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="title">عنوان المقطع</Label>
                <Input id="title" name="title" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="startTime">وقت البدء (د:ث)</Label>
                    <Input id="startTime" name="startTime" placeholder="00:30" required />
                </div>
                 <div>
                    <Label htmlFor="endTime">وقت النهاية (د:ث)</Label>
                    <Input id="endTime" name="endTime" placeholder="01:15" required />
                </div>
            </div>
            <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>إلغاء</Button>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                حفظ المقطع
            </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
