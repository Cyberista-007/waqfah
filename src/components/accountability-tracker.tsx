

'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import type { AccountabilityEntry, CustomAccountabilityAction, DestructiveSin } from '@/lib/types';
import { doc, setDoc, Timestamp, collection, writeBatch } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { BookCheck, Calendar as CalendarIcon, Loader2, Save, Sunrise, Sun, Sunset, Moon, Sparkles, Plus, X, Angry, EyeOff, MessageSquareX, ChevronRight, ChevronLeft, AlertTriangle, Info, CalendarDays, BookOpen, Scroll } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useRouter } from 'next/navigation';
import { accountabilityStructure, AccountabilityAction, AccountabilityActionGroup } from '@/lib/accountability-data';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useAppearance } from './appearance-provider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { destructiveSinsData } from '@/lib/sins-data';
import { ScrollArea } from '@/components/ui/scroll-area';

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

function DestructiveSinsSection() {
    const { data: sinsFromDB, isLoading } = useCollection<DestructiveSin>('destructive_sins');
    const [activeSin, setActiveSin] = useState<DestructiveSin | null>(null);
    const { quranIconUrl, hadithIconUrl } = useAppearance();
    const firestore = useFirestore();
    const { isAdmin } = useAdminAuth();

    // Seed the destructive_sins collection if it's empty and user is admin
    useEffect(() => {
        const seedData = async () => {
            if (isAdmin && firestore && !isLoading && sinsFromDB && sinsFromDB.length === 0) {
                console.log("Destructive sins collection is empty. Seeding data from local file...");
                const batch = writeBatch(firestore);
                const sinsCollection = collection(firestore, 'destructive_sins');
                destructiveSinsData.forEach(sin => {
                    const docRef = doc(sinsCollection, sin.id); // Use the ID from the local data
                    batch.set(docRef, sin);
                });
                try {
                    await batch.commit();
                    console.log("Successfully seeded destructive sins data.");
                } catch (error) {
                    console.error("Error seeding destructive sins:", error);
                }
            }
        };

        seedData();
    }, [sinsFromDB, isLoading, firestore, isAdmin]);

    const sins = useMemo(() => {
        // If firestore has data, it is the source of truth.
        if (sinsFromDB && sinsFromDB.length > 0) {
            return sinsFromDB;
        }
        // If firestore is still loading, wait.
        if (isLoading) {
            return null;
        }
        // If firestore is done and empty, use the local seed data as a fallback for all users.
        return destructiveSinsData;
    }, [sinsFromDB, isLoading]);

    const getIcon = (iconName: string) => {
        if (iconName?.startsWith('http')) {
            return <img src={iconName} alt="icon" className="h-10 w-10 object-contain" />;
        }
        switch (iconName) {
            case 'MessageSquareX': return <MessageSquareX className="h-10 w-10" />;
            case 'EyeOff': return <EyeOff className="h-10 w-10" />;
            case 'Angry': return <Angry className="h-10 w-10" />;
            case 'custom-backbiting':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        <line x1="2" y1="22" x2="22" y2="2" />
                    </svg>
                );
            default:
                return <AlertTriangle className="h-10 w-10" />;
        }
    };
    
    if (isLoading && !sins) {
        return <Card className="mt-8 bg-card"><CardContent className="p-6 text-center"><Loader2 className="animate-spin mx-auto" /></CardContent></Card>
    }
    
  return (
    <>
      <Card className="mt-8 bg-card">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-destructive text-center border-b-2 border-destructive/50 pb-2">
            احذر المهلكات
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
            {sins?.map((sin) => (
                <button
                key={sin.id}
                onClick={() => setActiveSin(sin)}
                className="group p-4 rounded-xl bg-destructive hover:bg-destructive/90 transition-all duration-300 text-destructive-foreground flex flex-col items-center justify-center gap-4 aspect-square shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/40 transform-gpu hover:-translate-y-2 hover:scale-105"
                >
                <div className="transition-transform duration-300 group-hover:scale-125">
                    {getIcon(sin.icon)}
                </div>
                <span className="font-bold text-lg">{sin.title}</span>
                </button>
            ))
          }
        </CardContent>
      </Card>
      <Dialog open={!!activeSin} onOpenChange={(isOpen) => !isOpen && setActiveSin(null)}>
        <DialogContent className="max-w-lg bg-slate-900/80 backdrop-blur-md text-white p-0 rounded-xl border-t-2 border-r-2 border-l-2 border-red-500/50 shadow-lg shadow-red-500/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-red-500/0 via-red-500/70 to-red-500/0"></div>
            <ScrollArea className="max-h-[80vh] custom-scrollbar-red">
                <div className="p-6">
                    <DialogHeader className="flex flex-row justify-between items-center mb-4 space-y-0">
                        <DialogTitle className="font-headline text-3xl text-red-400">
                            {activeSin?.dialogTitle}
                        </DialogTitle>
                        <DialogClose asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:text-white rounded-full">
                                <X className="h-5 w-5" />
                            </Button>
                        </DialogClose>
                    </DialogHeader>
                    
                    <div className="space-y-4 mt-4">
                        {activeSin?.concept && (
                            <div className="bg-red-950/40 border border-red-500/30 p-4 rounded-xl space-y-2">
                                <div className="flex items-center gap-2 font-bold text-red-400">
                                    <Info className="h-5 w-5"/>
                                    <h3>المفهوم:</h3>
                                </div>
                                <p className="text-white/90">{activeSin.concept}</p>
                            </div>
                        )}

                        {activeSin?.daily_life_example && (
                            <div className="border-2 border-dashed border-slate-600 p-4 rounded-xl space-y-2">
                                <div className="flex items-center gap-2 font-bold text-red-400">
                                    <CalendarDays className="h-5 w-5"/>
                                    <h3>مثال من واقعنا (يومي):</h3>
                                </div>
                                <p className="text-white/90">"{activeSin.daily_life_example}"</p>
                            </div>
                        )}

                        {activeSin?.quranVerse && (
                            <div className="bg-slate-800/50 p-4 rounded-xl space-y-2">
                                <div className="flex items-center gap-2 font-bold text-red-400">
                                    {quranIconUrl ? <img src={quranIconUrl} alt="Quran Icon" className="h-5 w-5" /> : <BookOpen className="h-5 w-5"/>}
                                    <h3>دليل من القرآن:</h3>
                                </div>
                                <p className="font-amiri text-xl text-center leading-relaxed text-white/90">
                                    "{activeSin.quranVerse}"
                                </p>
                            </div>
                        )}

                        {activeSin?.hadith && (
                            <div className="bg-slate-800/50 p-4 rounded-xl space-y-2">
                                <div className="flex items-center gap-2 font-bold text-red-400">
                                    {hadithIconUrl ? <img src={hadithIconUrl} alt="Hadith Icon" className="h-5 w-5" /> : <Scroll className="h-5 w-5"/>}
                                    <h3>دليل من السنة:</h3>
                                </div>
                                <p className="font-amiri text-xl text-center leading-relaxed text-white/90">
                                    "{activeSin.hadith}"
                                </p>
                            </div>
                        )}
                         {activeSin?.hadith2 && (
                             <div className="bg-slate-800/50 p-4 rounded-xl space-y-2">
                                <div className="flex items-center gap-2 font-bold text-red-400">
                                    {hadithIconUrl ? <img src={hadithIconUrl} alt="Hadith Icon" className="h-5 w-5" /> : <Scroll className="h-5 w-5"/>}
                                    <h3>دليل آخر من السنة:</h3>
                                </div>
                                <p className="font-amiri text-xl text-center leading-relaxed text-white/90">
                                    "{activeSin.hadith2}"
                                </p>
                            </div>
                         )}
                    </div>

                    <DialogFooter className="mt-6">
                        <Button className="w-full bg-red-800 hover:bg-red-900 border border-red-600 text-white">
                            <BookOpen className="me-2 h-4 w-4"/>
                            اقرأ قصة من السيرة
                        </Button>
                    </DialogFooter>
                </div>
            </ScrollArea>
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

    const sinsSectionRef = useRef<HTMLDivElement>(null);
    const [isDateCardVisible, setIsDateCardVisible] = useState(true);

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
        const sinsRef = sinsSectionRef.current;
        if (!sinsRef) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsDateCardVisible(false);
                } else {
                    if (entry.boundingClientRect.top > 0) {
                        setIsDateCardVisible(true);
                    }
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(sinsRef);

        return () => {
            if (sinsRef) {
                observer.unobserve(sinsRef);
            }
        };
    }, []);

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

             <Card className={cn("max-w-md mx-auto sticky top-20 z-20 transition-all duration-500", !isDateCardVisible && "opacity-0 -translate-y-full pointer-events-none")}>
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

            <Tabs defaultValue="general" className="w-full">
              <div className="flex justify-center overflow-x-auto pb-2">
                <TabsList className="h-auto p-1.5 shrink-0">
                    {Object.entries(accountabilityStructure).reverse().map(([key, { name }]) => {
                         const Icon = prayerIcons[key as keyof typeof prayerIcons];
                        return (
                             <TabsTrigger key={key} value={key} className="px-4 py-2 rounded-full flex items-center gap-2">
                                {Icon && <Icon className="h-5 w-5" />}
                                <span>{name}</span>
                             </TabsTrigger>
                        )
                    })}
                </TabsList>
              </div>
                
                {isLoading ? (
                     <div className="flex justify-center p-16"><Loader2 className="h-12 w-12 animate-spin" /></div>
                ) : (
                    Object.entries(accountabilityStructure).reverse().map(([key, prayerConfig]) => (
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

            <div ref={sinsSectionRef}>
                <DestructiveSinsSection />
            </div>

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
