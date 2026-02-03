'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import type { LectureNote } from '@/lib/types';
import { Textarea } from './ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Stamp, Edit, Eye } from 'lucide-react';
import { Button } from './ui/button';
import { useAudioPlayer } from './audio-player-provider';
import { formatDuration } from '@/lib/utils';
import { cn } from '@/lib/utils';


const parseTimestampToSeconds = (timestamp: string): number => {
    const parts = timestamp.split(':').map(Number);
    if (parts.some(isNaN)) return 0;
    
    if (parts.length === 3) { // HH:MM:SS
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    if (parts.length === 2) { // MM:SS
        return parts[0] * 60 + parts[1];
    }
    return 0;
};


interface LectureNotesProps {
  lectureId: string;
  userId: string;
}

export function LectureNotes({ lectureId, userId }: LectureNotesProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { audioRef, videoPlayerRef, playTrack, track, isPlaying } = useAudioPlayer();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const noteDocRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'users', userId, 'notes', lectureId) : null),
    [firestore, userId, lectureId]
  );

  const { data: note, isLoading: isNoteLoading } = useDoc<LectureNote>(noteDocRef);

  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
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
        lectureId,
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
  }, [firestore, noteDocRef, userId, lectureId, toast]);

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
  
  const handleInsertTimestamp = () => {
    let currentTime: number | undefined;

    if (videoPlayerRef.current && typeof videoPlayerRef.current.getPlayerState === 'function') {
        const playerState = videoPlayerRef.current.getPlayerState();
        if (playerState === 1 || playerState === 2 || playerState === 3) {
            currentTime = videoPlayerRef.current.getCurrentTime();
        }
    }

    if (currentTime === undefined && audioRef.current) {
        if (isPlaying || audioRef.current.currentTime > 0) {
            currentTime = audioRef.current.currentTime;
        }
    }
    
    if (currentTime === undefined) {
        toast({
            variant: "default",
            title: "يرجى تشغيل المحاضرة أولاً",
            description: "يجب تشغيل المحاضرة (صوت أو فيديو) لتتمكن من إضافة طابع زمني.",
        });
        return;
    }
    
    const textarea = textareaRef.current;
    if (!textarea) return;

    const hours = Math.floor(currentTime / 3600);
    const minutes = Math.floor((currentTime % 3600) / 60);
    const seconds = Math.floor(currentTime % 60);

    let timestampText: string;
    if (hours > 0) {
        timestampText = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
        timestampText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    const timestamp = `[${timestampText}] `;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    const newContent = content.substring(0, start) + timestamp + content.substring(end);
    setContent(newContent);
    
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    saveNote(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + timestamp.length;
    }, 0);
  };
  
    const handleTimestampClick = (timeInSeconds: number) => {
        if (videoPlayerRef.current && typeof videoPlayerRef.current.seekTo === 'function') {
            videoPlayerRef.current.seekTo(timeInSeconds, true);
            if (typeof videoPlayerRef.current.getPlayerState === 'function' && videoPlayerRef.current.getPlayerState() !== 1) {
                videoPlayerRef.current.playVideo();
            }
        } else if (audioRef.current) {
            audioRef.current.currentTime = timeInSeconds;
            if (audioRef.current.paused && track) {
                playTrack(track);
            }
        }
    };

    const renderNoteContent = (text: string) => {
        const timestampRegex = /\[(\d{1,2}:\d{2}(?::\d{2})?)\]/g;
        const parts = text.split(timestampRegex);

        return (
            <div className="text-base leading-relaxed whitespace-pre-wrap font-body">
                {parts.map((part, index) => {
                    if (index % 2 === 1) {
                        const timeInSeconds = parseTimestampToSeconds(part);
                        return (
                        <button
                            key={index}
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent edit mode from triggering
                                handleTimestampClick(timeInSeconds);
                            }}
                            className="bg-primary/10 text-primary font-mono px-2 py-0.5 rounded-md hover:bg-primary/20 transition-colors mx-1"
                        >
                            [{part}]
                        </button>
                        );
                    }
                    return <span key={index}>{part}</span>;
                })}
            </div>
        );
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
            <Button variant="outline" onClick={handleInsertTimestamp} disabled={isNoteLoading}>
                <Stamp className="w-4 h-4 me-2"/>
                إضافة طابع زمني
            </Button>
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
