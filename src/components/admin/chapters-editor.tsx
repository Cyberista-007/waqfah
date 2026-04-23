'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, GripVertical, ListVideo, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LectureChapter } from '@/lib/types';

interface ChaptersEditorProps {
  chapters: LectureChapter[];
  onChange: (chapters: LectureChapter[]) => void;
}

/** Parse "mm:ss" or "hh:mm:ss" → seconds */
function parseTime(str: string): number {
  const parts = str.split(':').map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return parseInt(str, 10) || 0;
}

/** seconds → "mm:ss" */
function formatTime(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function ChaptersEditor({ chapters, onChange }: ChaptersEditorProps) {
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('');
  const [error, setError] = useState('');

  const sorted = [...chapters].sort((a, b) => a.startTime - b.startTime);

  const addChapter = () => {
    const title = newTitle.trim();
    const startTime = parseTime(newTime.trim());

    if (!title) { setError('أدخل عنوان الفصل'); return; }
    if (isNaN(startTime)) { setError('أدخل وقتاً صحيحاً (مثال: 01:30)'); return; }
    if (chapters.some(c => c.startTime === startTime)) {
      setError('يوجد فصل بنفس الوقت بالفعل');
      return;
    }

    setError('');
    onChange([...chapters, { title, startTime }]);
    setNewTitle('');
    setNewTime('');
  };

  const removeChapter = (idx: number) => {
    onChange(sorted.filter((_, i) => i !== idx));
  };

  const updateTitle = (idx: number, title: string) => {
    const updated = sorted.map((c, i) => i === idx ? { ...c, title } : c);
    onChange(updated);
  };

  const updateTime = (idx: number, timeStr: string) => {
    const startTime = parseTime(timeStr);
    const updated = sorted.map((c, i) => i === idx ? { ...c, startTime } : c);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <ListVideo className="h-4 w-4 text-primary" />
        <Label className="text-sm font-bold">فصول المحاضرة (Chapters)</Label>
        <span className="text-xs text-muted-foreground">— اختياري، تساعد المستمع على التنقل</span>
      </div>

      {/* Existing chapters */}
      {sorted.length > 0 ? (
        <div className="space-y-2 border border-border/50 rounded-xl p-3">
          {sorted.map((chapter, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 cursor-grab" />
              <div className="flex-1 flex items-center gap-2">
                <div className="flex items-center gap-1 bg-muted/50 border border-border/50 rounded-lg px-2 w-24 shrink-0">
                  <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                  <input
                    type="text"
                    defaultValue={formatTime(chapter.startTime)}
                    onBlur={e => updateTime(idx, e.target.value)}
                    className="w-full bg-transparent text-xs font-mono py-1.5 outline-none"
                    placeholder="00:00"
                  />
                </div>
                <Input
                  value={chapter.title}
                  onChange={e => updateTitle(idx, e.target.value)}
                  className="h-8 text-sm flex-1"
                  placeholder="عنوان الفصل"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:bg-destructive/10 shrink-0"
                onClick={() => removeChapter(idx)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 border-2 border-dashed border-border/40 rounded-xl text-muted-foreground text-sm">
          <ListVideo className="h-6 w-6 mx-auto mb-2 opacity-30" />
          لا توجد فصول بعد — أضف أول فصل أدناه
        </div>
      )}

      {/* Add new chapter */}
      <div className="flex items-end gap-2 pt-1">
        <div className="space-y-1 w-28 shrink-0">
          <Label className="text-xs text-muted-foreground">الوقت (دق:ثا)</Label>
          <div className="flex items-center gap-1 h-9 bg-background border border-input rounded-md px-2">
            <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={newTime}
              onChange={e => setNewTime(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addChapter())}
              className="w-full bg-transparent text-xs font-mono outline-none"
              placeholder="01:30"
            />
          </div>
        </div>
        <div className="space-y-1 flex-1">
          <Label className="text-xs text-muted-foreground">عنوان الفصل</Label>
          <Input
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addChapter())}
            placeholder="مثال: مقدمة، شروط المسألة، ختام..."
            className="h-9 text-sm"
          />
        </div>
        <Button
          type="button"
          onClick={addChapter}
          size="sm"
          className="h-9 px-4 shrink-0 gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          إضافة
        </Button>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <p className="text-xs text-muted-foreground opacity-60">
        💡 اكتب الوقت بصيغة دقيقة:ثانية (مثال: <span className="font-mono">01:30</span>) أو ساعة:دقيقة:ثانية (<span className="font-mono">1:01:30</span>)
      </p>
    </div>
  );
}
