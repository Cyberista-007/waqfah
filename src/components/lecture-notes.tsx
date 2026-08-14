"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import type { Lecture, LectureNote } from '@/lib/types';
import { Textarea } from './ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Stamp, Edit, Eye, PlayCircle, Clock, Copy, Download, Check } from 'lucide-react';
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
  const [copied, setCopied] = useState(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const [quickNoteText, setQuickNoteText] = useState("");
  const [currentTimeFormatted, setCurrentTimeFormatted] = useState("00:00");

  const getCurrentTime = useCallback((): number | undefined => {
      let currentTime: number | undefined;

      if (iframeTrack?.type === 'youtube' && videoPlayerRef.current && typeof videoPlayerRef.current.getPlayerState === 'function') {
          const playerState = videoPlayerRef.current.getPlayerState();
          if ([1, 2, 3].includes(playerState)) {
              currentTime = videoPlayerRef.current.getCurrentTime();
          }
      }

      if (currentTime === undefined && audioRef.current) {
          if (isPlaying || audioRef.current.currentTime > 0) {
              currentTime = audioRef.current.currentTime;
          }
      }
      return currentTime;
  }, [iframeTrack, videoPlayerRef, audioRef, isPlaying]);

  useEffect(() => {
    const interval = setInterval(() => {
      const time = getCurrentTime();
      if (time !== undefined) {
        setCurrentTimeFormatted(formatDuration(time));
      }
    }, 500);
    return () => clearInterval(interval);
  }, [getCurrentTime]);

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

  const handleAddQuickNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNoteText.trim()) return;

    const time = getCurrentTime();
    const timeStr = time !== undefined ? formatDuration(time) : "00:00";
    
    const newLine = `${content ? '\n' : ''}[${timeStr}] ${quickNoteText.trim()}`;
    const newContent = content + newLine;
    
    setContent(newContent);
    setQuickNoteText("");
    saveNote(newContent);
    
    toast({
      title: "تمت إضافة الفائدة الموقوتة",
      description: `تم ربط الملاحظة باللحظة [${timeStr}] بنجاح.`,
    });
  };

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

  const handleInsertSingleTimestamp = () => {
    const currentTime = getCurrentTime();
    if (currentTime === undefined) {
      toast({
        title: "يرجى تشغيل المحاضرة أولاً",
        description: "قم بتشغيل الصوت أو الفيديو لإدراج التوقيت الحالي بدقة.",
      });
      return;
    }

    const textarea = textareaRef.current;
    if (!textarea) return;

    const timeStr = `[${formatDuration(currentTime)}] `;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = content.substring(0, start) + timeStr + content.substring(end);
    setContent(newContent);

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    saveNote(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + timeStr.length;
    }, 0);

    toast({
      title: "تم إدراج التوقيت",
      description: `تم إدراج الموضع ${formatDuration(currentTime)} في ملاحظاتك.`,
    });
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

        if (debounceTimeout.current) {
          clearTimeout(debounceTimeout.current);
        }
        saveNote(newContent);
        
        setTimeout(() => {
          textarea.focus();
          textarea.selectionStart = textarea.selectionEnd = start + timestamp.length;
        }, 0);
    };

    const handleCopyNotes = () => {
      if (!content) return;
      navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "تم النسخ بنجاح",
        description: "تم نسخ ملاحظاتك إلى الحافظة.",
      });
    };

    const handleExportNotes = () => {
      if (!content) return;
      const exportHeader = `# فوائد وملاحظات: ${lecture.title}\nمنصة وقفة التعليمية\nتاريخ التصدير: ${new Date().toLocaleDateString('ar-SA')}\n\n---\n\n`;
      const blob = new Blob([exportHeader + content], { type: 'text/markdown;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `فوائد_${lecture.title.replace(/[/\\?%*:|"<>]/g, '_')}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({
        title: "تم تصدير الملاحظات",
        description: "تم حفظ الملف بصيغة Markdown على جهازك.",
      });
    };

    const handleTimestampClick = (startTimeInSeconds: number, endTimeInSeconds: number | null) => {
        if (isPlayerVisible && iframeTrack?.type === 'youtube' && videoPlayerRef.current && typeof videoPlayerRef.current.seekTo === 'function') {
            const player = videoPlayerRef.current;
            player.seekTo(startTimeInSeconds, true);
            const playerState = player.getPlayerState();
            if (playerState !== 1) {
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
                        e.stopPropagation();
                        handleTimestampClick(startTimeInSeconds, endTimeInSeconds);
                    }}
                    className="inline-flex items-center gap-1 bg-primary/10 hover:bg-primary/20 text-primary font-mono text-xs font-bold px-2 py-0.5 rounded-lg border border-primary/20 hover:border-primary/40 transition-all mx-1 shadow-sm active:scale-95"
                    title="انقر للاستماع من هذا الموضع"
                >
                    <PlayCircle className="w-3 h-3 text-primary" />
                    <span>{fullMatch}</span>
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
       {/* Quick Note Input Bar */}
       <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <form onSubmit={handleAddQuickNote} className="flex-1 flex gap-2 bg-white/5 border border-white/10 rounded-2xl p-1.5 backdrop-blur-md">
             <input
                 type="text"
                 value={quickNoteText}
                 onChange={(e) => setQuickNoteText(e.target.value)}
                 placeholder="اكتب ملاحظة سريعة في هذه اللحظة..."
                 className="flex-1 bg-transparent border-none outline-none text-xs text-white placeholder-white/35 px-2 focus:ring-0 focus:border-none focus:outline-none"
                 dir="rtl"
             />
             <Button 
                 type="submit" 
                 disabled={!quickNoteText.trim() || isNoteLoading}
                 size="sm"
                 className="bg-primary hover:bg-primary/95 text-white font-black text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm"
             >
                 <Stamp className="w-3.5 h-3.5" />
                 <span>إضافة عند {currentTimeFormatted}</span>
             </Button>
          </form>

          <div className="flex items-center justify-end gap-2 shrink-0">
             {content && (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleCopyNotes}
                    className="h-8 text-xs font-bold gap-1 text-muted-foreground hover:text-foreground"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "تم النسخ" : "نسخ الفوائد"}</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleExportNotes}
                    className="h-8 text-xs font-bold gap-1 text-muted-foreground hover:text-foreground"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تصدير (.md)</span>
                  </Button>
                </>
             )}
             {isEditing && (
                <div className="flex items-center gap-1.5">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={handleInsertSingleTimestamp} 
                      disabled={isNoteLoading}
                      className="h-8 text-xs font-bold gap-1"
                    >
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      <span>إدراج الموضع الحالي</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={clipStartTime === null ? handleSetStartTime : handleInsertClip} 
                      disabled={isNoteLoading}
                      className="h-8 text-xs font-bold"
                    >
                        {clipStartTime === null ? (
                            <><PlayCircle className="w-3.5 h-3.5 me-1.5"/> تحديد مقطع</>
                        ) : (
                            <><Stamp className="w-3.5 h-3.5 me-1.5 text-primary"/> إدراج النهاية</>
                        )}
                    </Button>
                    {clipStartTime !== null && (
                        <Button variant="ghost" size="sm" onClick={() => setClipStartTime(null)} className="h-8 text-xs text-destructive">
                            إلغاء ({formatDuration(clipStartTime)})
                        </Button>
                    )}
                </div>
             )}
             <Button 
               variant={isEditing ? "default" : "outline"} 
               size="sm" 
               onClick={isEditing ? handleSaveClick : handleEditClick}
               className="h-8 text-xs font-bold"
             >
                 {isEditing ? <><Eye className="w-3.5 h-3.5 me-1.5"/> عرض وحفظ</> : <><Edit className="w-3.5 h-3.5 me-1.5"/> تعديل الفوائد</>}
             </Button>
          </div>
       </div>

       {isEditing ? (
            <Textarea
                ref={textareaRef}
                value={content}
                onChange={handleContentChange}
                placeholder="اكتب ملاحظاتك وفوائدك من هذه المحاضرة هنا. سيتم الحفظ تلقائيًا... يمكنك إدراج التوقيتات بنقرة زر أعلاه."
                rows={12}
                className="w-full text-base leading-relaxed rounded-2xl border-border/60 bg-muted/20 focus:bg-background transition-colors p-4"
                disabled={isNoteLoading}
            />
       ) : (
            <div 
                className="prose dark:prose-invert max-w-none p-5 border border-border/40 rounded-2xl min-h-[224px] bg-muted/20 hover:border-primary/30 transition-colors cursor-text shadow-sm"
                onClick={handleEditClick}
            >
                {content ? renderNoteContent(content) : (
                  <div className="flex flex-col items-center justify-center py-10 text-muted-foreground/60 gap-2">
                    <Edit className="w-8 h-8 opacity-40" />
                    <p className="text-sm font-medium">انقر هنا لبدء كتابة فوائدك وملاحظاتك الموقوتة حول هذه المحاضرة...</p>
                  </div>
                )}
            </div>
       )}

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="text-[11px] opacity-70">
          💡 يمكنك النقر على أي توقيت داخل الملاحظات للانتقال إليه مباشرة في المشغل.
        </span>
        <div className="flex items-center h-5">
          {isSaving ? (
            <div className="flex items-center gap-1.5 text-primary text-xs font-medium">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>جاري الحفظ...</span>
            </div>
          ) : hasUnsavedChanges ? (
               <p className="text-amber-500 text-xs">تغييرات غير محفوظة...</p>
          ) : (
              note && <p className="text-emerald-500 text-xs font-medium flex items-center gap-1"><Check className="w-3 h-3"/> تم الحفظ تلقائيًا</p>
          )}
        </div>
      </div>
    </div>
  );
}
