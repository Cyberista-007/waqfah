

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useDoc, useFirestore, useCollection } from '@/firebase';
import type { PinnedLectureSettings, Lecture } from '@/lib/types';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Pin, Check, ChevronsUpDown, X, GripVertical, Calendar as CalendarIcon } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function SortableLectureItem({ id, lecture, onRemove }: { id: string, lecture: Lecture, onRemove: (id: string) => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };
    
    return (
        <div ref={setNodeRef} style={style} className="flex items-center gap-2 w-full">
             <Button variant="ghost" size="icon" {...attributes} {...listeners} className="cursor-grab shrink-0">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
             </Button>
            <Badge variant="secondary" className="flex-grow flex items-center justify-between gap-1 pl-3 pr-1 py-1 h-auto">
                <span className="truncate">{lecture.title}</span>
                <div
                    role="button"
                    aria-label={`إزالة ${lecture.title}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove(lecture.id);
                    }}
                    className="rounded-full hover:bg-primary/20 p-0.5 transition-colors cursor-pointer shrink-0"
                >
                    <X className="h-4 w-4" />
                </div>
            </Badge>
        </div>
    );
}

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

export default function AdminPinnedLecturePage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { data: currentSettings, isLoading: settingsLoading } = useDoc<PinnedLectureSettings>('settings/pinned_lecture');
  const { data: allLectures, isLoading: lecturesLoading } = useCollection<Lecture>('lectures', { orderBy: ['createdAt', 'desc']});

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [layout, setLayout] = useState<'grid' | 'carousel'>('grid');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    if (currentSettings) {
      setSelectedIds(currentSettings.lectureIds || []);
      setMessage(currentSettings.message || '');
      setIsActive(currentSettings.isActive || false);
      setStartDate(toDate(currentSettings.startDate));
      setEndDate(toDate(currentSettings.endDate));
      setLayout(currentSettings.layout || 'grid');
    }
  }, [currentSettings]);

  const handleSubmit = async () => {
    if (!firestore) {
        toast({ variant: 'destructive', title: 'خطأ في الاتصال بقاعدة البيانات.' });
        return;
    }
    if (selectedIds.length === 0 && isActive) {
        toast({ variant: 'destructive', title: 'لا يمكن تفعيل قسم بدون تحديد محاضرات.' });
        return;
    }

    setIsSubmitting(true);
    try {
        const settingsRef = doc(firestore, 'settings', 'pinned_lecture');
        await setDoc(settingsRef, { 
            lectureIds: selectedIds, 
            message, 
            isActive,
            startDate: startDate ? Timestamp.fromDate(startDate) : null,
            endDate: endDate ? Timestamp.fromDate(endDate) : null,
            layout,
        }, { merge: true });
        toast({ title: 'تم حفظ إعدادات المحاضرات المثبتة بنجاح!' });
    } catch (error) {
        console.error("Error saving pinned lecture settings:", error);
        toast({ variant: 'destructive', title: 'فشل حفظ الإعدادات.' });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDragEnd = useCallback((event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
        setSelectedIds((items) => {
            const oldIndex = items.indexOf(active.id);
            const newIndex = items.indexOf(over.id);
            return arrayMove(items, oldIndex, newIndex);
        });
    }
  }, []);

  const isLoading = settingsLoading || lecturesLoading;
  
  const selectedLectures = selectedIds.map(id => allLectures?.find(l => l.id === id)).filter((l): l is Lecture => !!l);
  
  const removeLecture = (idToRemove: string) => {
    setSelectedIds(currentIds => currentIds.filter(id => id !== idToRemove));
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-headline flex items-center gap-2">
            <Pin />
            تثبيت محاضرات في الرئيسية
        </CardTitle>
        <CardDescription>
            اختر المحاضرات لتثبيتها في الصفحة الرئيسية مع رسالة مخصصة وجدولة زمنية.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : (
            <div className="space-y-6 max-w-2xl">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="is-active" className="text-base">تفعيل القسم</Label>
                    <CardDescription>
                      عند تفعيله، سيظهر القسم في الرئيسية (ضمن التواريخ المحددة إن وجدت).
                    </CardDescription>
                  </div>
                  <Switch
                    id="is-active"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                </div>
            
                <div className="space-y-2">
                    <Label>المحاضرات المثبتة (اسحب للإعادة الترتيب)</Label>
                     <div className="p-2 border rounded-md min-h-[50px] space-y-2">
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={selectedIds} strategy={verticalListSortingStrategy}>
                                {selectedLectures.length > 0 ? (
                                    selectedLectures.map(lecture => (
                                        <SortableLectureItem key={lecture.id} id={lecture.id} lecture={lecture} onRemove={removeLecture} />
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground p-2 text-center">لم يتم اختيار محاضرات بعد.</p>
                                )}
                            </SortableContext>
                        </DndContext>
                    </div>

                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={open}
                          className="w-full justify-between mt-2"
                        >
                          <span>اختر محاضرة أو أكثر...</span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                          <CommandInput placeholder="ابحث عن محاضرة..." />
                          <CommandList>
                            <CommandEmpty>لا توجد نتائج.</CommandEmpty>
                            <CommandGroup>
                              {allLectures?.map((lecture) => (
                                <CommandItem
                                  key={lecture.id}
                                  value={lecture.title}
                                  onSelect={() => {
                                    setSelectedIds(
                                      selectedIds.includes(lecture.id)
                                        ? selectedIds.filter((id) => id !== lecture.id)
                                        : [...selectedIds, lecture.id]
                                    )
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedIds.includes(lecture.id) ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                   <span className="flex-grow">{lecture.title}</span>
                                    {lecture.suggestionCount && lecture.suggestionCount > 0 && (
                                        <Badge variant="outline">{lecture.suggestionCount}</Badge>
                                    )}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="pinned-message">رسالة مخصصة (اختياري)</Label>
                    <Textarea 
                        id="pinned-message" 
                        placeholder="مثال: محاضرات هامة بمناسبة شهر رمضان..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label>تصميم العرض في الرئيسية</Label>
                    <Select value={layout} onValueChange={(v) => setLayout(v as any)}>
                        <SelectTrigger>
                            <SelectValue placeholder="اختر تصميمًا..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="grid">شبكة (Grid)</SelectItem>
                            <SelectItem value="carousel">شريط تمرير (Carousel)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label>تاريخ البدء (اختياري)</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                            <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {startDate ? format(startDate, "PPP") : <span>اختر تاريخاً</span>}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus /></PopoverContent>
                        </Popover>
                     </div>
                     <div className="space-y-2">
                        <Label>تاريخ الانتهاء (اختياري)</Label>
                         <Popover>
                            <PopoverTrigger asChild>
                            <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {endDate ? format(endDate, "PPP") : <span>اختر تاريخاً</span>}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus /></PopoverContent>
                        </Popover>
                     </div>
                </div>
                
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    حفظ الإعدادات
                </Button>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
