"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import type { Lecture, LectureNote } from '@/lib/types';
import { Textarea } from './ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Stamp, Edit, Eye, PlayCircle, X } from 'lucide-react';
import { Button } from './ui/button';
import { useAudioPlayer } from '@/components/audio-player-provider';
import { formatDuration } from '@/lib/utils';
import { cn } from '@/lib/utils';


const parseTimestampToSeconds = (timestamp: string): number => {
    if (!timestamp) return 0;
    const parts = timestamp.split(':').map(Number);
    if (parts.some(isNaN)) return 0;
    
    if (parts.length === 3) { // HH:MM:SS
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    if (parts.length === 2) { // MM:SS
        return parts[0] * 60 + parts[1];
    }
    if (parts.length === 1) { // SS
        return parts[0];
    }
    return 0;
};


interface LectureNotesProps {
  lecture: Lecture;
  userId: string;
}

export function LectureNotes({ lecture, userId }: LectureNotesProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { audioRef, videoPlayerRef, iframeTrack, playTrack, isPlaying, isPlayerVisible, setVideoClipEndTime } = useAudioPlayer();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const noteDocRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'users', userId, 'notes', lecture.id) : null),
    [firestore, userId, lecture.id]
  );

  const { data: note, isLoading: isNoteLoading } = useDoc<LectureNote>(noteDocRef);

  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [clipStartTime, setClipStartTime] = useState<number | null>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (note) {
      setContent(note.content);
    } else {
        setContent('');
    }
  }, [note]);
  
  const handleEditClick = () => {
    setIsEditing(true);
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const handleSaveClick = () => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    saveNote(content);
    setIsEditing(false);
  };


  const saveNote = useCallback(async (newContent: string) => {
    if (!firestore || !noteDocRef) return;

    setIsSaving(true);
    try {
      await setDoc(noteDocRef, {
        userId,
        lectureId: lecture.id,
        content: newContent,
        updatedAt: Timestamp.now(),
      }, { merge: true });
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to save note:', error);
      toast({
        variant: 'destructive',
        title: 'فشل حفظ الملاحظة',
        description: 'حدث خطأ أثناء محاولة حفظ ملاحظاتك. يرجى المحاولة مرة أخرى.',
      });
    } finally {
      setIsSaving(false);
    }
  }, [firestore, noteDocRef, userId, lecture.id, toast]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    setHasUnsavedChanges(true);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      saveNote(newContent);
    }, 2000); // Auto-save after 2 seconds of inactivity
  };
  
    const getCurrentTime = (): number | undefined => {
        let currentTime: number | undefined;

        // 1. Try to get time from YouTube player (either inline or floating)
        if (videoPlayerRef.current && typeof videoPlayerRef.current.getPlayerState === 'function') {
            try {
                const playerState = videoPlayerRef.current.getPlayerState();
                // -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
                if ([1, 2, 3, 5].includes(playerState)) {
                    currentTime = videoPlayerRef.current.getCurrentTime();
                }
            } catch (e) {
                console.error("Error getting time from YouTube player:", e);
            }
        } 
        
        // Handle soundcloud case if iframeTrack is active
        if (currentTime === undefined && iframeTrack?.type === 'soundcloud') {
            toast({
                variant: "default",
                title: "الميزة غير مدعومة",
                description: "تحديد الوقت الحالي من مشغل ساوندكلاود غير مدعوم حاليًا. يرجى استخدام المشغل الصوتي.",
            });
            return undefined;
        }

        // 2. Try to get time from standard audio player
        if (currentTime === undefined && audioRef.current) {
            if (isPlaying || audioRef.current.currentTime > 0) {
                currentTime = audioRef.current.currentTime;
            }
        }
        return currentTime;
    };

  const handleSetStartTime = () => {
        const currentTime = getCurrentTime();
        if (currentTime === undefined) {
            toast({
                variant: "default",
                title: "يرجى تشغيل المحاضرة أولاً",
            });
            return;
        }
        setClipStartTime(currentTime);
        toast({
            title: "تم تحديد بداية المقطع.",
            description: `الآن انتقل إلى نقطة النهاية ثم اضغط "تحديد نهاية وإدراج".`,
        });
    };

    const handleInsertClip = () => {
        const endTime = getCurrentTime();
        if (endTime === undefined || clipStartTime === null) {
            toast({ variant: 'destructive', title: "خطأ", description: "لم يتم تحديد وقت البدء أو النهاية." });
            return;
        }
        if (endTime <= clipStartTime) {
            toast({ variant: 'destructive', title: "خطأ", description: "وقت النهاية يجب أن يكون بعد وقت البداية." });
            return;
        }

        const textarea = textareaRef.current;
        if (!textarea) return;

        const startTimestampStr = formatDuration(clipStartTime);
        const endTimestampStr = formatDuration(endTime);
        const timestamp = `[${startTimestampStr} - ${endTimestampStr}] `;
        
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newContent = content.substring(0, start) + timestamp + content.substring(end);
        setContent(newContent);
        setClipStartTime(null);

        // Debounce saving
        if (debounceTimeout.current) {
          clearTimeout(debounceTimeout.current);
        }
        saveNote(newContent);
        
        // Focus and move cursor
        setTimeout(() => {
          textarea.focus();
          textarea.selectionStart = textarea.selectionEnd = start + timestamp.length;
        }, 0);
    };

  
    const handleTimestampClick = (startTimeInSeconds: number, endTimeInSeconds: number | null) => {
        if (isPlayerVisible && iframeTrack?.type === 'youtube' && videoPlayerRef.current && typeof videoPlayerRef.current.seekTo === 'function') {
            const player = videoPlayerRef.current;
            player.seekTo(startTimeInSeconds, true);
            const playerState = player.getPlayerState();
            if (playerState !== 1) { // if not playing
                player.playVideo();
            }
            if (endTimeInSeconds) {
                setVideoClipEndTime(endTimeInSeconds);
            }
        } else {
            playTrack(lecture, startTimeInSeconds, endTimeInSeconds);
        }
    };

    const renderNoteContent = (text: string) => {
        const timestampRegex = /\[(\d{1,2}:\d{2}(?::\d{2})?)(?:\s*-\s*(\d{1,2}:\d{2}(?::\d{2})?))?\]/g;
        const parts = [];
        let lastIndex = 0;

        for (const match of text.matchAll(timestampRegex)) {
            const preText = text.substring(lastIndex, match.index);
            if (preText) {
                parts.push(<span key={`pre-${lastIndex}`}>{preText}</span>);
            }

            const fullMatch = match[0];
            const startTimeStr = match[1];
            const endTimeStr = match[2];
            
            const startTimeInSeconds = parseTimestampToSeconds(startTimeStr);
            const endTimeInSeconds = endTimeStr ? parseTimestampToSeconds(endTimeStr) : null;

            parts.push(
                <button
                    key={`match-${match.index}`}
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent edit mode from triggering
                        handleTimestampClick(startTimeInSeconds, endTimeInSeconds);
                    }}
                    className="bg-primary/10 text-primary font-mono px-2 py-0.5 rounded-md hover:bg-primary/20 transition-colors mx-1"
                >
                    {fullMatch}
                </button>
            );

            lastIndex = (match.index || 0) + fullMatch.length;
        }

        const postText = text.substring(lastIndex);
        if (postText) {
            parts.push(<span key="post-last">{postText}</span>);
        }
        
        return <div className="text-base leading-relaxed whitespace-pre-wrap font-body">{parts}</div>;
    };


  useEffect(() => {
      return () => {
          if (debounceTimeout.current) {
              clearTimeout(debounceTimeout.current);
          }
      }
  }, []);

  return (
    <div className="space-y-4">
       <div className="flex items-center justify-end gap-2">
         {isEditing && (
            <div className="flex items-center gap-2">
                <Button variant="outline" onClick={clipStartTime === null ? handleSetStartTime : handleInsertClip} disabled={isNoteLoading}>
                    {clipStartTime === null ? (
                        <><PlayCircle className="w-4 h-4 me-2"/> تحديد بداية</>
                    ) : (
                        <><Stamp className="w-4 h-4 me-2"/> تحديد نهاية وإدراج</>
                    )}
                </Button>
                {clipStartTime !== null && (
                    <Button variant="ghost" size="sm" onClick={() => setClipStartTime(null)}>
                        إلغاء ({formatDuration(clipStartTime)})
                    </Button>
                )}
            </div>
         )}
         <Button variant="outline" onClick={isEditing ? handleSaveClick : handleEditClick}>
             {isEditing ? <><Eye className="w-4 h-4 me-2"/> عرض الملاحظات</> : <><Edit className="w-4 h-4 me-2"/> تعديل الملاحظات</>}
         </Button>
      </div>

       {isEditing ? (
            <Textarea
                ref={textareaRef}
                value={content}
                onChange={handleContentChange}
                placeholder="اكتب ملاحظاتك وفوائدك من هذه المحاضرة هنا. سيتم الحفظ تلقائيًا..."
                rows={12}
                className="w-full text-base leading-relaxed"
                disabled={isNoteLoading}
            />
       ) : (
            <div 
                className="prose dark:prose-invert max-w-none p-4 border rounded-md min-h-[224px] bg-muted/30 cursor-text"
                onClick={handleEditClick}
            >
                {content ? renderNoteContent(content) : <p className="text-muted-foreground">انقر هنا لبدء كتابة الملاحظات...</p>}
            </div>
       )}

      <div className="flex items-center justify-end h-6">
        {isSaving ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>جاري الحفظ...</span>
          </div>
        ) : hasUnsavedChanges ? (
             <p className="text-muted-foreground text-sm">تغييرات غير محفوظة...</p>
        ) : (
            note && <p className="text-muted-foreground text-sm">تم الحفظ</p>
        )}
      </div>
    </div>
  );
}
