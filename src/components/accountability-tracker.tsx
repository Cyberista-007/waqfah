'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser, useFirestore, useDoc, useMemoFirebase, deleteDocumentNonBlocking } from '@/firebase';
import type { AccountabilityEntry, CustomAccountabilityAction } from '@/lib/types';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { BookCheck, Calendar as CalendarIcon, Loader2, Save, Sunrise, Sun, Sunset, Moon, Sparkles, Plus, X, Angry, EyeOff, MessageSquareX, ChevronRight, ChevronLeft } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useRouter } from 'next/navigation';
import { accountabilityStructure, AccountabilityAction, AccountabilityActionGroup } from '@/lib/accountability-data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';

const prayerIcons = {
    fajr: Sunrise,
    dhuhr: Sun,
    asr: Sunset, // This is okay, as it's distinct from Maghrib
    maghrib: Sunset,
    isha: Moon,
    general: Sparkles
};


const ActionButton = ({ action, isSelected, onToggle }: { action: AccountabilityAction, isSelected: boolean, onToggle: () => void }) => {
    return (
        <Button
            variant={isSelected ? 'default' : 'destructive'}
            onClick={onToggle}
            className={cn(
                "h-auto text-wrap py-2 transition-all duration-200 transform-gpu",
                isSelected ? 'bg-green-600 hover:bg-green-700' : 'bg-red-800/80 hover:bg-red-800',
                 isSelected ? 'shadow-lg scale-105' : 'opacity-70'
            )}
        >
            <div className="flex flex-col">
                <span className="font-semibold">{action.label}</span>
                <span className="text-xs">({action.points} نقاط)</span>
            </div>
        </Button>
    )
}

const CustomActionButton = ({ action, isSelected, onToggle, onRemove }: { action: CustomAccountabilityAction, isSelected: boolean, onToggle: () => void, onRemove: (e: React.MouseEvent) => void }) => {
    return (
         <div className="relative">
            <Button
                variant={isSelected ? 'default' : 'secondary'}
                onClick={onToggle}
                className={cn(
                    "h-auto text-wrap py-2 w-full transition-all duration-200 transform-gpu",
                    isSelected ? 'bg-green-600 hover:bg-green-700' : 'bg-secondary hover:bg-secondary/80',
                    isSelected ? 'shadow-lg scale-105' : 'opacity-90'
                )}
            >
                <div className="flex flex-col">
                    <span className="font-semibold">{action.title}</span>
                    <span className="text-xs">({action.points} نقاط)</span>
                </div>
            </Button>
             <Button size="icon" variant="ghost" className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-card text-card-foreground hover:bg-destructive" onClick={onRemove}>
                <X className="h-4 w-4"/>
             </Button>
        </div>
    )
}


const AddCustomActionCard = ({ onAdd }: { onAdd: (title: string, points: number) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [points, setPoints] = useState(1);

    const handleAdd = () => {
        if (title && points > 0) {
            onAdd(title, points);
            setTitle('');
            setPoints(1);
            setIsOpen(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Card className="flex items-center justify-center p-4 min-h-[100px] border-dashed border-2 cursor-pointer hover:border-primary hover:text-primary transition-colors text-muted-foreground">
                    <div className="text-center">
                        <Plus className="mx-auto h-8 w-8" />
                        <p className="mt-2 font-semibold">نافلة إضافية</p>
                    </div>
                </Card>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>إضافة نافلة جديدة</DialogTitle>
                    <DialogDescription>أضف عملًا إضافيًا لتتبعه اليوم.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div>
                        <Label htmlFor="custom-action-title">عنوان العمل</Label>
                        <Input id="custom-action-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="مثال: قراءة ربع من القرآن" />
                    </div>
                     <div>
                        <Label htmlFor="custom-action-points">النقاط</Label>
                        <Input id="custom-action-points" type="number" value={points} onChange={e => setPoints(Number(e.target.value))} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsOpen(false)}>إلغاء</Button>
                    <Button onClick={handleAdd}>إضافة</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

const ActionGroupCard = ({ group, prayerKey, completedActionIds, onActionToggle, customActions, onCustomActionToggle, onAddCustom, onRemoveCustom }: {
    group: AccountabilityActionGroup;
    prayerKey: string;
    completedActionIds: string[];
    onActionToggle: (actionId: string, groupId: string, type: 'single' | 'multi') => void;
    customActions: CustomAccountabilityAction[];
    onCustomActionToggle: (action: CustomAccountabilityAction) => void;
    onAddCustom: (title: string, points: number) => void;
    onRemoveCustom: (actionId: string) => void;
}) => {
    return (
        <Card className="p-4 bg-muted/30">
            <CardTitle className="text-lg text-center mb-4">{group.title}</CardTitle>
            <CardContent className="p-0 grid grid-cols-2 gap-3">
                 {group.actions.map(action => (
                    <ActionButton
                        key={action.id}
                        action={action}
                        isSelected={completedActionIds.includes(action.id)}
                        onToggle={() => onActionToggle(action.id, group.id, group.type)}
                    />
                ))}
                 {/* Render custom actions for this group/prayer if any */}
                 {customActions.map(action => (
                     <CustomActionButton
                        key={action.id}
                        action={action}
                        isSelected={completedActionIds.includes(action.id)}
                        onToggle={() => onCustomActionToggle(action)}
                        onRemove={(e) => { e.stopPropagation(); onRemoveCustom(action.id); }}
                    />
                 ))}
                 {/* Only show "add" card for the last group, or a specific group */}
                 {group.id.includes('sunnah') && <AddCustomActionCard onAdd={onAddCustom} />}
            </CardContent>
        </Card>
    )
}

const sins = [
  {
    id: 'lying',
    title: 'خطر الكذب',
    icon: <MessageSquareX className="h-10 w-10" />,
    dialog: {
      title: 'خطر الكذب',
      quran: 'إِنَّمَا يَفْتَرِي الْكَذِبَ الَّذِينَ لَا يُؤْمِنُونَ بِآيَاتِ اللَّهِ وَأُولَٰئِكَ هُمُ الْكَاذِبُونَ',
      hadith: "إِيَّاكُمْ وَالْكَذِبَ، فَإِنَّ الْكَذْبَ يَهْدِي إِلَى الْفُجُورِ، وَإِنَّ الْفُجُورَ يَهْدِي إِلَى النَّارِ."
    }
  },
  {
    id: 'backbiting',
    title: 'الغيبة',
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            <line x1="2" y1="22" x2="22" y2="2" />
        </svg>
    ),
    dialog: {
      title: 'عاقبة الغيبة',
      quran: 'وَلَا يَغْتَب بَّعْضُكُم بَعْضًا ۚ أَيُحِبُّ أَحَدُكُمْ أَن يَأْكُلَ لَحْمَ أَخِيهِ مَيْتًا فَكَرِهْتُمُوهُ',
      hadith: 'أتدرون ما الغيبة؟ قالوا: الله ورسوله أعلم. قال: ذكرك أخاك بما يكره.'
    }
  },
  {
    id: 'gaze',
    title: 'إطلاق البصر',
    icon: <EyeOff className="h-10 w-10" />,
    dialog: {
      title: 'فتنة النظر',
      quran: 'قُل لِّلْمُؤْمِنِينَ يَغُضُّوا مِنْ أَبْصَارِهِمْ وَيَحْفَظُوا فُرُوجَهُمْ ۚ ذَٰلِكَ أَزْكَىٰ لَهُمْ',
      hadith: 'النظرة سهم من سهام إبليس مسموم، فمن تركها من مخافتي أبدلته إيمانًا يجد حلاوته في قلبه.'
    }
  },
  {
    id: 'cursing',
    title: 'السب واللعن',
    icon: <Angry className="h-10 w-10" />,
    dialog: {
      title: 'السب واللعن',
      hadith: 'ليس المؤمن بالطعان ولا اللعان ولا الفاحش ولا البذيء.',
      hadith2: 'لعن المؤمن كقتله.'
    }
  }
];

function DestructiveSinsSection() {
  const [activeSin, setActiveSin] = useState<(typeof sins)[number] | null>(null);

  return (
    <>
      <Card className="mt-8 bg-card/50">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-destructive text-center border-b-2 border-destructive/50 pb-2">
            احذر المهلكات
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
          {sins.map((sin) => (
            <button
              key={sin.id}
              onClick={() => setActiveSin(sin)}
              className="group p-4 rounded-xl bg-destructive/10 hover:bg-destructive/20 transition-all duration-300 text-destructive flex flex-col items-center justify-center gap-4 aspect-square border-2 border-transparent hover:border-destructive/30 hover:shadow-lg hover:shadow-destructive/20 hover:-translate-y-2"
            >
              <div className="transition-transform duration-300 group-hover:scale-125">
                {sin.icon}
              </div>
              <span className="font-bold text-lg">{sin.title}</span>
            </button>
          ))}
        </CardContent>
      </Card>
      <Dialog open={!!activeSin} onOpenChange={(isOpen) => !isOpen && setActiveSin(null)}>
        <DialogContent className="max-w-xl bg-slate-900/90 backdrop-blur-sm border-red-500/50 shadow-2xl shadow-red-500/20 text-white p-0" hideCloseButton={true}>
            <div className="relative p-6">
                <div className="absolute top-0 right-0 bottom-0 w-1.5 bg-red-500/70 shadow-[0_0_15px_3px_rgba(239,68,68,0.4)]"></div>
                <div className="flex justify-between items-center mb-6">
                    <DialogClose asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10">
                            <X className="h-5 w-5" />
                        </Button>
                    </DialogClose>
                    <DialogTitle className="font-headline text-2xl text-red-400">
                        {activeSin?.dialog.title}
                    </DialogTitle>
                </div>

                <div className="space-y-6">
                    {activeSin?.dialog.quran && (
                         <div className="relative bg-slate-800/50 rounded-2xl p-6 pt-10 text-center border-t-2 border-s-2 border-red-500/50">
                            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-slate-800 p-2 rounded-full border-2 border-red-500/50">
                               <svg width="40" height="40" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M40 145C40 136.716 46.7157 130 55 130H105C113.284 130 120 136.716 120 145" stroke="#293A5E" strokeWidth="16" strokeLinecap="round"/>
                                    <path d="M10.6667 80L80 30L149.333 80L80 130L10.6667 80Z" fill="#E3B456"/>
                                    <path d="M24 84L80 44L136 84L80 124L24 84Z" fill="#293A5E"/>
                                </svg>
                            </div>
                            <p className="font-amiri text-2xl leading-relaxed">
                                <span className="font-bold text-red-400">قال تعالى:</span> ({activeSin.dialog.quran})
                            </p>
                        </div>
                    )}
                    {activeSin?.dialog.hadith && (
                         <div className="relative bg-slate-800/50 rounded-2xl p-6 pt-10 text-center border-t-2 border-s-2 border-red-500/50">
                             <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-slate-800 p-2 rounded-full border-2 border-red-500/50">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-red-500">
                                    <path d="M6 3C4.89543 3 4 3.89543 4 5V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V9L15 3H6Z" fill="currentColor"></path>
                                    <path d="M8 11H16" stroke="white" strokeWidth="1.5" strokeLinecap="round"></path>
                                    <path d="M8 14H16" stroke="white" strokeWidth="1.5" strokeLinecap="round"></path>
                                    <path d="M8 17H12" stroke="white" strokeWidth="1.5" strokeLinecap="round"></path>
                                </svg>
                            </div>
                            <p className="font-amiri text-2xl leading-relaxed">
                                 <span className="font-bold text-red-400">قال رسول الله ﷺ:</span> "{activeSin.dialog.hadith}"
                            </p>
                        </div>
                    )}
                     {activeSin?.dialog.hadith2 && (
                         <div className="relative bg-slate-800/50 rounded-2xl p-6 pt-10 text-center border-t-2 border-s-2 border-red-500/50">
                             <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-slate-800 p-2 rounded-full border-2 border-red-500/50">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-red-500">
                                    <path d="M6 3C4.89543 3 4 3.89543 4 5V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V9L15 3H6Z" fill="currentColor"></path>
                                    <path d="M8 11H16" stroke="white" strokeWidth="1.5" strokeLinecap="round"></path>
                                    <path d="M8 14H16" stroke="white" strokeWidth="1.5" strokeLinecap="round"></path>
                                    <path d="M8 17H12" stroke="white" strokeWidth="1.5" strokeLinecap="round"></path>
                                </svg>
                            </div>
                            <p className="font-amiri text-2xl leading-relaxed">
                                <span className="font-bold text-red-400">قال رسول الله ﷺ:</span> "{activeSin.dialog.hadith2}"
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </DialogContent>
      </Dialog>
    </>
  );
}


export function AccountabilityTracker({ redirectToOnAuth = '/accountability', showHeader = true }: { redirectToOnAuth?: string, showHeader?: boolean }) {
    const { toast } = useToast();
    const router = useRouter();
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();
    
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const dateId = useMemo(() => format(selectedDate, 'yyyy-MM-dd'), [selectedDate]);

    const entryDocRef = useMemoFirebase(
        () => (user && firestore ? doc(firestore, 'users', user.uid, 'accountability', dateId) : null),
        [user, firestore, dateId]
    );

    const { data: currentEntry, isLoading: isEntryLoading } = useDoc<AccountabilityEntry>(entryDocRef);
    
    const [completedActions, setCompletedActions] = useState<string[]>([]);
    const [customActions, setCustomActions] = useState<{[key: string]: CustomAccountabilityAction[]}>({});
    const [totalPoints, setTotalPoints] = useState(0);


    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push(`/auth/login?redirect_to=${redirectToOnAuth}`);
        }
    }, [isUserLoading, user, router, redirectToOnAuth]);

     useEffect(() => {
        if (currentEntry) {
            setCompletedActions(currentEntry.completedActionIds || []);
            setCustomActions(currentEntry.customActions || {});
        } else {
            setCompletedActions([]);
            setCustomActions({});
        }
    }, [currentEntry]);
    
    useEffect(() => {
        let points = 0;
        const allActions = Object.values(accountabilityStructure).flatMap(p => p.groups.flatMap(g => g.actions));
        const allCustomActions = Object.values(customActions).flat();

        completedActions.forEach(actionId => {
            const action = allActions.find(a => a.id === actionId) || allCustomActions.find(a => a.id === actionId);
            if(action) {
                points += action.points;
            }
        });

        setTotalPoints(points);
        if (entryDocRef) {
            setDocumentNonBlocking(entryDocRef, { totalPoints: points }, { merge: true });
        }

    }, [completedActions, customActions, entryDocRef]);


    const saveEntry = useCallback((newCompleted: string[], newCustom: typeof customActions) => {
        if (!entryDocRef || !user) return;
        setDocumentNonBlocking(entryDocRef, { 
            userId: user.uid, 
            date: Timestamp.fromDate(selectedDate),
            completedActionIds: newCompleted,
            customActions: newCustom
        }, { merge: true });
    }, [entryDocRef, user, selectedDate]);
    
    const handleActionToggle = (actionId: string, groupId: string, type: 'single' | 'multi') => {
        let newCompleted = [...completedActions];
        const isSelected = newCompleted.includes(actionId);

        if (type === 'single') {
            const group = Object.values(accountabilityStructure).flatMap(p => p.groups).find(g => g.id === groupId);
            const groupActionIds = group?.actions.map(a => a.id) || [];
            // Deselect all other actions in the group
            newCompleted = newCompleted.filter(id => !groupActionIds.includes(id));
            if (!isSelected) {
                newCompleted.push(actionId);
            }
        } else { // multi
            if (isSelected) {
                newCompleted = newCompleted.filter(id => id !== actionId);
            } else {
                newCompleted.push(actionId);
            }
        }
        setCompletedActions(newCompleted);
        saveEntry(newCompleted, customActions);
    };

    const handleAddCustomAction = (prayerKey: string) => (title: string, points: number) => {
        const newAction: CustomAccountabilityAction = {
            id: `custom_${Date.now()}`,
            title,
            points
        };
        const newCustomActions = { ...customActions };
        if (!newCustomActions[prayerKey]) {
            newCustomActions[prayerKey] = [];
        }
        newCustomActions[prayerKey].push(newAction);
        setCustomActions(newCustomActions);

        // Also mark it as completed immediately
        const newCompleted = [...completedActions, newAction.id];
        setCompletedActions(newCompleted);

        saveEntry(newCompleted, newCustomActions);
    };
    
    const handleRemoveCustomAction = (prayerKey: string, actionId: string) => {
        const newCustomActions = { ...customActions };
        newCustomActions[prayerKey] = (newCustomActions[prayerKey] || []).filter(a => a.id !== actionId);
        setCustomActions(newCustomActions);

        const newCompleted = completedActions.filter(id => id !== actionId);
        setCompletedActions(newCompleted);

        saveEntry(newCompleted, newCustomActions);
    };

    if (isUserLoading && !user) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-16 w-16 animate-spin" /></div>;
    }
    
    const isLoading = isEntryLoading;

    return (
        <div className="space-y-8">
            {showHeader && (
                <header className="space-y-4 text-center">
                    <BookCheck className="mx-auto h-16 w-16 text-primary animate-icon-draw" />
                    <h1 className="text-5xl font-extrabold mt-4 mb-3 font-headline tracking-tight">محاسبة النفس</h1>
                    <p className="max-w-2xl mx-auto text-xl text-muted-foreground">
                        "حَاسِبُوا أَنْفُسَكُمْ قَبْلَ أَنْ تُحَاسَبُوا، وَزِنُوا أَنْفُسَكُمْ قَبْلَ أَنْ تُوزَنُوا" - عمر بن الخطاب رضي الله عنه
                    </p>
                </header>
            )}

             <Card className="max-w-md mx-auto sticky top-20 z-20">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                     <Button variant="outline" size="icon" onClick={() => setSelectedDate(prev => subDays(prev, 1))}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn("w-full justify-center text-left font-normal text-lg", !selectedDate && "text-muted-foreground")}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "EEEE, d MMMM yyyy", { locale: ar }) : <span>اختر تاريخًا</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={selectedDate} onSelect={(d) => d && setSelectedDate(d)} initialFocus />
                    </PopoverContent>
                </Popover>
                     <Button variant="outline" size="icon" onClick={() => setSelectedDate(prev => addDays(prev, 1))}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </CardContent>
            </Card>

            <Tabs defaultValue="fajr" className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                    {Object.entries(accountabilityStructure).map(([key, { name }]) => {
                         const Icon = prayerIcons[key as keyof typeof prayerIcons];
                        return (
                             <TabsTrigger key={key} value={key} className="flex flex-col sm:flex-row gap-2 h-12">
                                {Icon && <Icon className="h-5 w-5" />}
                                <span>{name}</span>
                             </TabsTrigger>
                        )
                    })}
                </TabsList>
                
                {isLoading ? (
                     <div className="flex justify-center p-16"><Loader2 className="h-12 w-12 animate-spin" /></div>
                ) : (
                    Object.entries(accountabilityStructure).map(([key, prayerConfig]) => (
                        <TabsContent key={key} value={key} className="mt-6">
                            <h2 className="text-3xl font-bold text-center mb-6">{prayerConfig.name}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {prayerConfig.groups.map(group => (
                                    <ActionGroupCard
                                        key={group.id}
                                        group={group}
                                        prayerKey={key}
                                        completedActionIds={completedActions}
                                        onActionToggle={handleActionToggle}
                                        customActions={customActions[key] || []}
                                        onCustomActionToggle={(action) => handleActionToggle(action.id, `custom-${key}`, 'multi')}
                                        onAddCustom={handleAddCustomAction(key)}
                                        onRemoveCustom={(actionId) => handleRemoveCustomAction(key, actionId)}
                                    />
                                ))}
                            </div>
                        </TabsContent>
                    ))
                )}
            </Tabs>

            <DestructiveSinsSection />

            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30">
                 <Card className="p-2 rounded-full shadow-lg border-2 border-primary/50">
                    <CardContent className="p-0 flex items-center gap-4 px-6">
                        <div className="text-sm text-muted-foreground">مجموع النقاط</div>
                        <div className="text-2xl font-bold text-primary">{totalPoints}</div>
                    </CardContent>
                 </Card>
            </div>
        </div>
    );
}
