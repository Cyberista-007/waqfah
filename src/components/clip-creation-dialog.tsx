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
import { useState, useEffect } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { useAudioPlayer } from '@/components/audio-player-provider';
import { collection, Timestamp } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Loader2, Clock } from 'lucide-react';
import { formatDuration } from '@/lib/utils';

interface ClipCreationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  lectureId: string;
  lectureDuration: number;
  initialStartTime?: number;
}

// Helper to parse MM:SS or SS to seconds
const parseTimeToSeconds = (timeStr: string): number => {
    if (!timeStr) return 0;
    const parts = timeStr.split(':').map(Number);
    if (parts.some(isNaN)) return 0; // handle invalid input

    if (parts.length === 3) { // HH:MM:SS
        return (parts[0] * 3600) + (parts[1] * 60) + parts[2];
    }
    if (parts.length === 2) { // MM:SS
        return (parts[0] * 60) + parts[1];
    }
    if (parts.length === 1) {
        return parts[0];
    }
    return 0;
};


export function ClipCreationDialog({ isOpen, onOpenChange, lectureId, lectureDuration, initialStartTime }: ClipCreationDialogProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const { audioRef, videoPlayerRef, isPlaying } = useAudioPlayer();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [title, setTitle] = useState('');
  const [startTimeValue, setStartTimeValue] = useState('');
  const [endTimeValue, setEndTimeValue] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialStartTime !== undefined) {
        setStartTimeValue(formatDuration(initialStartTime));
      }
    } else {
      // Reset form on close
      setTitle('');
      setStartTimeValue('');
      setEndTimeValue('');
    }
  }, [isOpen, initialStartTime]);

  const handleSetCurrentTime = async (field: 'start' | 'end') => {
    let currentTime: number | undefined;

    if (videoPlayerRef.current && typeof videoPlayerRef.current.getPlayerState === 'function') {
        const playerState = await videoPlayerRef.current.getPlayerState();
        if ([1, 2, 3].includes(playerState)) {
            currentTime = await videoPlayerRef.current.getCurrentTime();
        }
    }
    if (currentTime === undefined && audioRef.current) {
        if (isPlaying || audioRef.current.currentTime > 0) {
            currentTime = audioRef.current.currentTime;
        }
    }
    
    if (currentTime !== undefined) {
        const formattedTime = formatDuration(currentTime);
        if (field === 'start') {
            setStartTimeValue(formattedTime);
        } else {
            setEndTimeValue(formattedTime);
        }
    } else {
        toast({
            variant: "default",
            title: "يرجى تشغيل المحاضرة أولاً",
            description: "يجب تشغيل المحاضرة (صوت أو فيديو) لتتمكن من تحديد الوقت الحالي.",
        });
    }
  };


  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firestore || !user) {
        toast({ variant: 'destructive', title: "يرجى تسجيل الدخول أولاً."});
        return;
    };
    
    setIsSubmitting(true);

    const startTime = parseTimeToSeconds(startTimeValue);
    const endTime = parseTimeToSeconds(endTimeValue);

    if (!title || !startTimeValue || !endTimeValue) {
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
        toast({ variant: 'destructive', title: `وقت النهاية يتجاوز مدة المحاضرة (${formatDuration(lectureDuration)}).` });
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
            حدد عنوانًا ووقت البدء والنهاية لمقطعك. يمكنك استخدام الأزرار لتحديد الوقت الحالي من المشغل.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div>
                <Label htmlFor="title">عنوان المقطع</Label>
                <Input id="title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="startTime">وقت البدء</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="startTime" 
                        name="startTime" 
                        placeholder="00:30" 
                        required 
                        value={startTimeValue}
                        onChange={(e) => setStartTimeValue(e.target.value)}
                      />
                      <Button variant="outline" size="icon" type="button" onClick={() => handleSetCurrentTime('start')} aria-label="Set start time to current time">
                        <Clock className="h-4 w-4"/>
                      </Button>
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="endTime">وقت النهاية</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="endTime" 
                        name="endTime" 
                        placeholder="01:15" 
                        required 
                        value={endTimeValue}
                        onChange={(e) => setEndTimeValue(e.target.value)}
                      />
                       <Button variant="outline" size="icon" type="button" onClick={() => handleSetCurrentTime('end')} aria-label="Set end time to current time">
                        <Clock className="h-4 w-4"/>
                      </Button>
                    </div>
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
