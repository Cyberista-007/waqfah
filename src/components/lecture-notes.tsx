
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import type { LectureNote } from '@/lib/types';
import { Textarea } from './ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Button } from './ui/button';

interface LectureNotesProps {
  lectureId: string;
  userId: string;
}

export function LectureNotes({ lectureId, userId }: LectureNotesProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const noteDocRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'users', userId, 'notes', lectureId) : null),
    [firestore, userId, lectureId]
  );

  const { data: note, isLoading: isNoteLoading } = useDoc<LectureNote>(noteDocRef);

  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (note) {
      setContent(note.content);
    } else {
        setContent('');
    }
  }, [note]);

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
  
  useEffect(() => {
      return () => {
          if (debounceTimeout.current) {
              clearTimeout(debounceTimeout.current);
          }
      }
  }, []);

  return (
    <div className="space-y-4">
      <Textarea
        value={content}
        onChange={handleContentChange}
        placeholder="اكتب ملاحظاتك وفوائدك من هذه المحاضرة هنا. سيتم الحفظ تلقائيًا..."
        rows={8}
        className="w-full text-base"
        disabled={isNoteLoading}
      />
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
