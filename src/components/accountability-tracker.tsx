'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import type { AccountabilityEntry, CustomAccountabilityAction, DestructiveSin } from '@/lib/types';
import { doc, setDoc, Timestamp, collection, writeBatch } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { BookCheck, Calendar as CalendarIcon, Loader2, Save, Sunrise, Sun, Sunset, Moon, Sparkles, Plus, X, Angry, EyeOff, MessageSquareX, ChevronRight, ChevronLeft, AlertTriangle, Info, CalendarDays, BookOpen, Scroll, ChevronDown, FileText, TrendingUp, Scale, ThumbsUp, Trophy, Flame, CheckCircle2, TableProperties } from 'lucide-react';
import { format, addDays, subDays, addMonths, subMonths } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useRouter } from 'next/navigation';
import { accountabilityStructure, AccountabilityAction, AccountabilityActionGroup } from '@/lib/accountability-data';
import { Dialog, DialogContent, DialogTrigger, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useAppearance } from './appearance-provider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { destructiveSinsData } from '@/lib/sins-data';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from './ui/separator';
import type { Locale } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';


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
                    className="group p-4 rounded-xl bg-destructive hover:bg-destructive/90 transition-all duration-300 text-destructive-foreground flex flex-col items-center justify-center gap-4 aspect-square transform-gpu hover:-translate-y-2 hover:scale-105"
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

const ImanHarvestReport = () => {
    const [timeframe, setTimeframe] = useState('weekly');

    // Mock data based on the image
    const weeklyPointsData = useMemo(() => [
        { name: 'الخميس', points: 75 },
        { name: 'الاربعاء', points: 80 },
        { name: 'الثلاثاء', points: 60 },
        { name: 'الاثنين', points: 90 },
        { name: 'الأحد', points: 70 },
        { name: 'السبت', points: 50 },
        { name: 'الجمعة', points: 65 },
    ].reverse(), []);

    const categoryData = useMemo(() => [
        { name: 'الصلوات', value: 40, fill: '#8884d8' }, // Blueish
        { name: 'الأذكار', value: 25, fill: '#82ca9d' },   // Greenish
        { name: 'القرآن', value: 15, fill: '#ffc658' },    // Yellowish
        { name: 'قيام الليل', value: 10, fill: '#ff8042' },   // Orangish
        { name: 'السنن', value: 10, fill: '#ff5733' },     // Reddish
    ], []);

    const needsFocusData = [
        { label: 'قيام الليل', value: 35 },
        { label: 'السنن', value: 55 },
        { label: 'الورد اليومي', value: 62 },
    ];

    const mostConsistentData = [
        { label: 'الصلوات', value: 100 },
        { label: 'القرآن', value: 85 },
        { label: 'الأذكار', value: 92 },
    ];

    return (
        <div className="p-4 sm:p-6 md:p-8 bg-slate-900/50 rounded-2xl">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-4xl font-bold text-white font-headline">حصادك الإيماني</h1>
                <div className="flex items-center gap-2 p-1 bg-slate-800/60 rounded-full">
                    {['الرئيسية', 'التفاصيل اليومية', 'أرشيف الأسابيع', 'أرشيف الشهور'].map(tab => (
                        <Button key={tab} variant={tab === 'الرئيسية' ? 'default' : 'ghost'} className={cn(
                            'rounded-full',
                            tab === 'الرئيسية' ? 'bg-primary/80 text-primary-foreground' : 'text-muted-foreground hover:bg-slate-700/50 hover:text-white'
                        )}>
                            {tab}
                        </Button>
                    ))}
                </div>
            </header>

            {/* Timeframe Toggle */}
            <div className="flex justify-end mb-6">
                <div className="flex items-center gap-1 p-1 bg-slate-800/60 rounded-full">
                    <Button onClick={() => setTimeframe('monthly')} variant={timeframe === 'monthly' ? 'secondary' : 'ghost'} size="sm" className="rounded-full">شهري</Button>
                    <Button onClick={() => setTimeframe('weekly')} variant={timeframe === 'weekly' ? 'secondary' : 'ghost'} size="sm" className="rounded-full">أسبوعي</Button>
                </div>
            </div>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="bg-slate-800/50 border-slate-700/50 text-white text-center p-6">
                    <CardHeader className="p-0 items-center">
                        <div className="p-3 bg-blue-500/20 rounded-full mb-2">
                             <Calendar className="h-6 w-6 text-blue-400"/>
                        </div>
                        <CardDescription className="text-slate-400">أيام الالتزام التام</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 mt-2">
                        <p className="text-4xl font-bold">12</p>
                    </CardContent>
                </Card>
                 <Card className="bg-slate-800/50 border-slate-700/50 text-white text-center p-6">
                    <CardHeader className="p-0 items-center">
                        <div className="p-3 bg-green-500/20 rounded-full mb-2">
                             <Trophy className="h-6 w-6 text-green-400"/>
                        </div>
                        <CardDescription className="text-slate-400">أفضل يوم</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 mt-2">
                        <p className="text-4xl font-bold">الخميس</p>
                    </CardContent>
                </Card>
                 <Card className="bg-slate-800/50 border-slate-700/50 text-white text-center p-6">
                    <CardHeader className="p-0 items-center">
                        <div className="p-3 bg-red-500/20 rounded-full mb-2">
                             <ThumbsUp className="h-6 w-6 text-red-400"/>
                        </div>
                        <CardDescription className="text-slate-400">نسبة الإنجاز</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 mt-2">
                        <p className="text-4xl font-bold text-red-400">81%</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Pie Chart */}
                <Card className="bg-slate-800/50 border-slate-700/50 text-white">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-300">
                            <Scale className="h-5 w-5"/>
                            توزيع العبادات
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} labelLine={false} label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}>
                                    {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'hsl(225 8% 13%)', border: '1px solid hsl(225 8% 22%)', color: 'white' }}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Area Chart */}
                <Card className="bg-slate-800/50 border-slate-700/50 text-white">
                     <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-300">
                             <TrendingUp className="h-5 w-5"/>
                             تطور أدائك
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={weeklyPointsData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.2)" />
                                <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                                <Tooltip contentStyle={{ backgroundColor: 'hsl(225 8% 13%)', border: '1px solid hsl(225 8% 22%)' }}/>
                                <Area type="monotone" dataKey="points" name="النقاط" stroke="#8884d8" fillOpacity={1} fill="url(#colorPoints)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Needs Focus */}
                <Card className="bg-slate-800/50 border-slate-700/50 text-white">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-400">
                            <AlertTriangle className="h-5 w-5" />
                            يحتاج لتركيز أكبر
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {needsFocusData.map(item => (
                            <div key={item.label} className="flex justify-between items-center text-lg">
                                <span className="text-slate-300">{item.label}</span>
                                <span className="font-bold text-red-400">{item.value}%</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Most Consistent */}
                <Card className="bg-slate-800/50 border-slate-700/50 text-white">
                     <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-400">
                            <CheckCircle2 className="h-5 w-5" />
                            أكثر ما حافظت عليه
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         {mostConsistentData.map(item => (
                            <div key={item.label} className="flex justify-between items-center text-lg">
                                <span className="text-slate-300">{item.label}</span>
                                <span className="font-bold text-green-400">{item.value}%</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
            
            {/* Footer Buttons */}
             <footer className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <Button size="lg" className="h-14 text-lg bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white">
                    <FileText className="me-2 h-5 w-5"/>
                    تحميل التقرير الشهري
                </Button>
                 <Button size="lg" className="h-14 text-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white">
                    <FileText className="me-2 h-5 w-5"/>
                    تحميل التقرير الأسبوعي
                </Button>
            </footer>
        </div>
    );
};

export function AccountabilityTracker({ redirectToOnAuth = '/accountability', showHeader = true }: { redirectToOnAuth?: string, showHeader?: boolean }) {
    const { toast } = useToast();
    const router = useRouter();
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();
    
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [gregorianMonth, setGregorianMonth] = useState<Date>(new Date());
    const [hijriMonth, setHijriMonth] = useState<Date>(new Date());
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
    
    const hijriFormatters = {
        formatDay: (date: Date) => new Intl.DateTimeFormat('ar-SA-u-ca-islamic-nu-latn', { day: 'numeric' }).format(date),
        formatCaption: (date: Date, options?: { locale?: Locale }) => {
            const formatted = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-nu-latn', { month: 'long', year: 'numeric' }).format(date);
            return formatted.includes('هـ') ? formatted : `${formatted}`;
        },
        formatWeekdayName: (weekday: Date, options?: { locale?: Locale }) => new Intl.DateTimeFormat('ar-SA', { weekday: 'short' }).format(weekday).charAt(0),
    };
    
    const formatGregorianForButton = (date: Date) => {
        return new Intl.DateTimeFormat('ar-EG-u-nu-latn', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
    }
    const formatHijriForButton = (date: Date) => {
        return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-nu-latn', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
    }

    const handleDateSelect = (date: Date | undefined) => {
        if (!date) return;
        setSelectedDate(date);
        setGregorianMonth(date);
        setHijriMonth(date);
    }


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

     const saveEntry = useCallback((newCompleted: string[], newCustom: typeof customActions) => {
        if (!entryDocRef || !user) return;

        let points = 0;
        const allActions = Object.values(accountabilityStructure).flatMap(p => p.groups.flatMap(g => g.actions));
        const allCustomActions = Object.values(newCustom).flat();

        newCompleted.forEach(actionId => {
            const action = allActions.find(a => a.id === actionId) || allCustomActions.find(a => a.id === actionId);
            if(action) {
                points += action.points;
            }
        });

        setTotalPoints(points);

        setDocumentNonBlocking(entryDocRef, { 
            userId: user.uid, 
            date: Timestamp.fromDate(selectedDate),
            completedActionIds: newCompleted,
            customActions: newCustom,
            totalPoints: points
        }, { merge: true });
    }, [entryDocRef, user, selectedDate]);
    
    useEffect(() => {
        if (currentEntry) {
            setCompletedActions(currentEntry.completedActionIds || []);
            setCustomActions(currentEntry.customActions || {});
             setTotalPoints(currentEntry.totalPoints || 0);

        } else {
            setCompletedActions([]);
            setCustomActions({});
            setTotalPoints(0);
        }
    }, [currentEntry]);
    
    const handleActionToggle = (actionId: string, groupId: string, type: 'single' | 'multi') => {
        let newCompleted = [...completedActions];
        const isSelected = newCompleted.includes(actionId);

        if (type === 'single') {
            const group = Object.values(accountabilityStructure).flatMap(p => p.groups).find(g => g.id === groupId);
            const groupActionIds = group?.actions.map(a => a.id) || [];
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
                <CardContent className="p-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" className="w-full h-auto text-lg p-2">
                                {formatGregorianForButton(selectedDate)} | {formatHijriForButton(selectedDate)}
                                <ChevronDown className="h-4 w-4 ms-2" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 flex" dir="rtl">
                            <Calendar
                                locale={ar}
                                mode="single"
                                selected={selectedDate}
                                onSelect={handleDateSelect}
                                month={hijriMonth}
                                onMonthChange={setHijriMonth}
                                formatters={hijriFormatters}
                                dir="rtl"
                                components={{
                                    IconLeft: () => <ChevronRight className="h-4 w-4" />,
                                    IconRight: () => <ChevronLeft className="h-4 w-4" />,
                                }}
                                classNames={{
                                    caption_label: "font-bold text-primary",
                                    nav_button_previous: "absolute right-1",
                                    nav_button_next: "absolute right-auto left-1",
                                }}
                            />
                            <Separator orientation="vertical" className="h-auto"/>
                            <Calendar
                                locale={ar}
                                mode="single"
                                selected={selectedDate}
                                onSelect={handleDateSelect}
                                month={gregorianMonth}
                                onMonthChange={setGregorianMonth}
                                dir="rtl"
                                components={{
                                    IconLeft: () => <ChevronRight className="h-4 w-4" />,
                                    IconRight: () => <ChevronLeft className="h-4 w-4" />,
                                }}
                                classNames={{
                                    nav_button_previous: "absolute right-1",
                                    nav_button_next: "absolute right-auto left-1",
                                }}
                            />
                        </PopoverContent>
                    </Popover>
                </CardContent>
            </Card>

            <Tabs defaultValue="fajr" className="w-full">
              <div className="flex justify-center overflow-x-auto pb-2">
                <TabsList className="h-auto p-1.5 shrink-0">
                    <TabsTrigger value="iman-harvest" className="px-4 py-2 rounded-full flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        <span>الحصاد الإيماني</span>
                    </TabsTrigger>
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
                
                <TabsContent value="iman-harvest" className="mt-6">
                    <ImanHarvestReport />
                </TabsContent>

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
