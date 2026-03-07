

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useDoc, useFirestore, useCollection } from '@/firebase';
import type { PinnedItemSettings, PinnedItem, Lecture, Series, Program } from '@/lib/types';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Pin, Check, ChevronsUpDown, X, GripVertical, Calendar as CalendarIcon } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
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

function SortableItem({ item, allData, onRemove, onMessageChange }: { 
    item: PinnedItem;
    allData: { lecture: Lecture[], series: Series[], program: Program[] };
    onRemove: (id: string) => void;
    onMessageChange: (id: string, message: string) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
    const style = { transform: CSS.Transform.toString(transform), transition };

    // Find the corresponding data item from the collections
    const dataItem = useMemo(() => {
        return (allData[item.type] || []).find(d => d.id === item.id);
    }, [allData, item.type, item.id]);
    
    if (!dataItem) return null; // Should not happen if data is loaded

    return (
        <div ref={setNodeRef} style={style} className="flex items-start gap-2 w-full p-3 bg-muted/50 rounded-lg">
            <Button variant="ghost" size="icon" {...attributes} {...listeners} className="cursor-grab shrink-0 mt-2">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
            </Button>
            <div className="flex-grow space-y-2">
                <div className="flex items-center gap-2">
                    <Badge variant="secondary">{item.type === 'lecture' ? 'محاضرة' : item.type === 'series' ? 'سلسلة' : 'برنامج'}</Badge>
                    <p className="font-semibold truncate">{(dataItem as any).title || (dataItem as any).name}</p>
                </div>
                <Input
                    placeholder="رسالة مخصصة (اختياري)"
                    value={item.message || ''}
                    onChange={(e) => onMessageChange(item.id, e.target.value)}
                />
            </div>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemove(item.id)}
                className="shrink-0 text-destructive hover:bg-destructive/10"
            >
                <X className="h-4 w-4" />
            </Button>
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

export default function AdminPinnedItemsPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { data: currentSettings, isLoading: settingsLoading } = useDoc<PinnedItemSettings>('settings/pinned_items');
  
  const { data: allLectures, isLoading: lecturesLoading } = useCollection<Lecture>('lectures');
  const { data: allSeries, isLoading: seriesLoading } = useCollection<Series>('series');
  const { data: allPrograms, isLoading: programsLoading } = useCollection<Program>('programs');

  const [pinnedItems, setPinnedItems] = useState<PinnedItem[]>([]);
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
      setPinnedItems(currentSettings.pinnedItems || []);
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
    if (pinnedItems.length === 0 && isActive) {
        toast({ variant: 'destructive', title: 'لا يمكن تفعيل قسم بدون تحديد عناصر.' });
        return;
    }

    setIsSubmitting(true);
    try {
        const settingsRef = doc(firestore, 'settings', 'pinned_items');
        await setDoc(settingsRef, { 
            pinnedItems, 
            isActive,
            startDate: startDate ? Timestamp.fromDate(startDate) : null,
            endDate: endDate ? Timestamp.fromDate(endDate) : null,
            layout,
        }, { merge: true });
        toast({ title: 'تم حفظ الإعدادات بنجاح!' });
    } catch (error) {
        console.error("Error saving pinned items settings:", error);
        toast({ variant: 'destructive', title: 'فشل حفظ الإعدادات.' });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDragEnd = useCallback((event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
        setPinnedItems((items) => {
            const oldIndex = items.findIndex(item => item.id === active.id);
            const newIndex = items.findIndex(item => item.id === over.id);
            return arrayMove(items, oldIndex, newIndex);
        });
    }
  }, []);

  const isLoading = settingsLoading || lecturesLoading || seriesLoading || programsLoading;
  
  const allData = useMemo(() => ({
      lecture: allLectures || [],
      series: allSeries || [],
      program: allPrograms || []
  }), [allLectures, allSeries, allPrograms]);

  const handleSelect = (item: { id: string; type: 'lecture' | 'series' | 'program' }) => {
    setPinnedItems(currentItems => {
        const exists = currentItems.some(i => i.id === item.id);
        if (exists) {
            return currentItems.filter(i => i.id !== item.id);
        } else {
            return [...currentItems, { ...item, message: '' }];
        }
    });
  };
  
  const handleMessageChange = (id: string, message: string) => {
      setPinnedItems(currentItems => currentItems.map(item => item.id === id ? {...item, message} : item));
  };
  
  const removePinnedItem = (idToRemove: string) => {
    setPinnedItems(currentItems => currentItems.filter(item => item.id !== idToRemove));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-headline flex items-center gap-2">
            <Pin />
            تثبيت عناصر في الرئيسية
        </CardTitle>
        <CardDescription>
            اختر المحاضرات، السلاسل، أو البرامج لتثبيتها في الصفحة الرئيسية.
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
                    <Label>العناصر المثبتة (اسحب للإعادة الترتيب)</Label>
                     <div className="p-2 border rounded-md min-h-[50px] space-y-2">
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={pinnedItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
                                {pinnedItems.length > 0 ? (
                                    pinnedItems.map(item => (
                                        <SortableItem key={item.id} item={item} allData={allData} onRemove={removePinnedItem} onMessageChange={handleMessageChange} />
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground p-2 text-center">لم يتم اختيار عناصر بعد.</p>
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
                          <span>اختر عنصرًا أو أكثر...</span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                          <CommandInput placeholder="ابحث..." />
                          <CommandList>
                            <CommandEmpty>لا توجد نتائج.</CommandEmpty>
                            <CommandGroup heading="محاضرات">
                              {allData.lecture.map((item) => (
                                <CommandItem key={item.id} value={`lecture-${item.title}`} onSelect={() => handleSelect({id: item.id, type: 'lecture'})}>
                                  <Check className={cn("mr-2 h-4 w-4", pinnedItems.some(p => p.id === item.id) ? "opacity-100" : "opacity-0")} />
                                   {item.title}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                             <CommandGroup heading="سلاسل">
                              {allData.series.map((item) => (
                                <CommandItem key={item.id} value={`series-${item.title}`} onSelect={() => handleSelect({id: item.id, type: 'series'})}>
                                  <Check className={cn("mr-2 h-4 w-4", pinnedItems.some(p => p.id === item.id) ? "opacity-100" : "opacity-0")} />
                                   {item.title}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                             <CommandGroup heading="برامج">
                              {allData.program.map((item) => (
                                <CommandItem key={item.id} value={`program-${item.name}`} onSelect={() => handleSelect({id: item.id, type: 'program'})}>
                                  <Check className={cn("mr-2 h-4 w-4", pinnedItems.some(p => p.id === item.id) ? "opacity-100" : "opacity-0")} />
                                   {item.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
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
