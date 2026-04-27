

'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import type { AccountabilityEntry, CustomAccountabilityAction, DestructiveSin } from '@/lib/types';
import { doc, setDoc, Timestamp, collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { BookCheck, Calendar as CalendarIcon, Loader2, Save, Sunrise, Sun, Sunset, Moon, Sparkles, Plus, X, Angry, EyeOff, MessageSquareX, ChevronRight, ChevronLeft, AlertTriangle, Info, CalendarDays, BookOpen, Scroll, ChevronDown, FileText, TrendingUp, Scale, ThumbsUp, Trophy, Flame, CheckCircle2, TableProperties, ScrollText, Video, PieChart as PieChartIcon } from 'lucide-react';
import { format, addDays, subDays, addMonths, subMonths } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { accountabilityStructure, AccountabilityAction, AccountabilityActionGroup } from '@/lib/accountability-data';
import { Dialog, DialogContent, DialogTrigger, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useAppearance } from './appearance-provider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from './ui/separator';
import type { Locale } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { TooltipProvider, Tooltip as ShadTooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';






const ActionButton = ({ action, isSelected, onToggle }: { action: AccountabilityAction, isSelected: boolean, onToggle: () => void }) => {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full"
        >
            <Button
                variant="ghost"
                onClick={onToggle}
                className={cn(
                    "h-auto text-wrap py-5 px-4 rounded-[2.5rem] w-full transition-all duration-500 transform-gpu border relative overflow-hidden group",
                    isSelected
                        ? 'bg-primary/20 text-primary border-primary/40 shadow-[0_0_30px_rgba(var(--primary-rgb),0.25)]'
                        : 'bg-white/[0.03] hover:bg-white/[0.08] text-white/60 border-white/5 backdrop-blur-md'
                )}
            >
                {isSelected && (
                    <motion.div
                        layoutId={`active-${action.id}`}
                        className="absolute inset-0 bg-primary/10 blur-2xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    />
                )}
                <div className="flex flex-col gap-1.5 items-center justify-center relative z-10">
                    <span className="font-black text-sm md:text-base whitespace-nowrap overflow-hidden text-ellipsis w-full text-center tracking-tight group-hover:text-white transition-colors">{action.label}</span>
                    <span className="text-[9px] font-black opacity-40 bg-white/10 px-2.5 py-0.5 rounded-full uppercase tracking-tighter group-hover:opacity-80 transition-opacity">
                        {action.points} نقاط
                    </span>
                </div>
            </Button>
        </motion.div>
    )
}

const CustomActionButton = ({ action, isSelected, onToggle, onRemove }: { action: CustomAccountabilityAction, isSelected: boolean, onToggle: () => void, onRemove: (e: React.MouseEvent) => void }) => {
    return (
         <motion.div
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="relative"
        >
            <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <Button
                    variant="ghost"
                    onClick={onToggle}
                    className={cn(
                        "h-auto text-wrap py-5 px-4 rounded-[2.5rem] w-full transition-all duration-500 transform-gpu border relative overflow-hidden group",
                        isSelected
                            ? 'bg-primary/20 text-primary border-primary/40 shadow-[0_0_30px_rgba(var(--primary-rgb),0.25)]'
                            : 'bg-white/[0.03] hover:bg-white/[0.08] text-white/60 border-white/5 backdrop-blur-md'
                    )}
                >
                    <div className="flex flex-col gap-1.5 items-center justify-center relative z-10">
                        <span className="font-black text-sm md:text-base whitespace-nowrap overflow-hidden text-ellipsis w-full text-center tracking-tight group-hover:text-white transition-colors">{action.title}</span>
                        <span className="text-[9px] font-black opacity-40 bg-white/10 px-2.5 py-0.5 rounded-full uppercase tracking-tighter group-hover:opacity-80 transition-opacity">
                            {action.points} نقاط
                        </span>
                    </div>
                </Button>
            </motion.div>
             <Button size="icon" variant="ghost" className="absolute -top-1 -right-1 h-8 w-8 rounded-full bg-red-500/80 backdrop-blur-md text-white shadow-lg hover:bg-red-600 hover:scale-110 transition-transform z-20 border border-white/10" onClick={onRemove}>
                <X className="h-4 w-4"/>
             </Button>
        </motion.div>
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
                <motion.div
                    whileHover={{ scale: 1.02, translateY: -5 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Card className="flex items-center justify-center p-6 min-h-[120px] border-dashed border-2 border-white/10 bg-white/5 cursor-pointer hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all rounded-[2.5rem] text-muted-foreground group overflow-hidden relative">
                         <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="text-center relative z-10">
                            <Plus className="mx-auto h-8 w-8 group-hover:scale-110 transition-transform text-primary/60 group-hover:text-primary" />
                            <p className="mt-2 font-black tracking-tight">نافلة إضافية</p>
                        </div>
                    </Card>
                </motion.div>
            </DialogTrigger>
            <DialogContent className="bg-zinc-950/90 backdrop-blur-3xl border border-white/10 text-white rounded-[3rem] shadow-2xl overflow-hidden p-8">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[60px] pointer-events-none" />
                <DialogHeader className="relative z-10">
                    <DialogTitle className="text-3xl font-black text-white tracking-tighter">إضافة <span className="text-primary italic">نافلة</span> جديدة</DialogTitle>
                    <DialogDescription className="text-white/40 font-medium">أضف عملًا صالحاً إضافياً لتتبعه اليوم في ميزان حسناتك.</DialogDescription>
                </DialogHeader>
                <div className="space-y-8 py-8 relative z-10">
                    <div className="space-y-3">
                        <Label htmlFor="custom-action-title" className="font-black text-white/60 text-xs uppercase tracking-widest px-1">عنوان العمل</Label>
                        <Input id="custom-action-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="مثال: ركعتي الضحى، ذكر الله..." className="bg-white/5 border-white/10 rounded-2xl h-14 focus:ring-primary/20 transition-all font-bold placeholder:text-white/10" />
                    </div>
                     <div className="space-y-3">
                        <Label htmlFor="custom-action-points" className="font-black text-white/60 text-xs uppercase tracking-widest px-1">النقاط المستحقة</Label>
                        <Input id="custom-action-points" type="number" value={points} onChange={e => setPoints(Number(e.target.value))} className="bg-white/5 border-white/10 rounded-2xl h-14 focus:ring-primary/20 transition-all font-black text-lg" />
                    </div>
                </div>
                <DialogFooter className="gap-3 relative z-10">
                    <Button variant="ghost" onClick={() => setIsOpen(false)} className="rounded-2xl h-14 px-8 font-black text-white/40 hover:bg-white/5">إلغاء</Button>
                    <Button onClick={handleAdd} className="rounded-2xl h-14 px-10 bg-primary text-white hover:bg-primary/90 font-black text-lg shadow-xl shadow-primary/20">إضافة العمل</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
};

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
        <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[3.5rem] p-8 lg:p-10 shadow-[0_30px_100px_rgba(0,0,0,0.4)] relative overflow-hidden group transition-all duration-700 hover:bg-white/[0.05] hover:border-primary/20"
        >
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-primary/10 transition-colors duration-1000 z-0" />
            <h3 className="text-3xl font-black font-headline text-center mb-10 relative z-10 text-white tracking-tighter drop-shadow-lg">{group.title}</h3>
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="relative z-10 grid grid-cols-2 gap-4"
            >
                 {group.actions.map(action => (
                    <motion.div key={action.id} variants={itemVariants}>
                        <ActionButton
                            action={action}
                            isSelected={completedActionIds.includes(action.id)}
                            onToggle={() => onActionToggle(action.id, group.id, group.type)}
                        />
                    </motion.div>
                ))}
                 <AnimatePresence mode="popLayout">
                    {customActions.map(action => (
                        <motion.div key={action.id} variants={itemVariants} exit={{ opacity: 0, scale: 0.5 }}>
                            <CustomActionButton
                                action={action}
                                isSelected={completedActionIds.includes(action.id)}
                                onToggle={() => onCustomActionToggle(action)}
                                onRemove={(e) => { e.stopPropagation(); onRemoveCustom(action.id); }}
                            />
                        </motion.div>
                    ))}
                 </AnimatePresence>
                 {group.id.includes('sunnah') && (
                    <motion.div variants={itemVariants} className="col-span-full mt-2">
                        <AddCustomActionCard onAdd={onAddCustom} />
                    </motion.div>
                 )}
            </motion.div>
        </motion.div>
    )
}




const REPORT_TABS = [
  { id: 'main', label: 'الرئيسية' },
  { id: 'daily', label: 'التفاصيل اليومية' },
  { id: 'weekly', label: 'أرشيف الأسابيع' },
  { id: 'monthly', label: 'أرشيف الشهور' },
];

const StatCard = ({ icon: Icon, label, value, color, delay, isSmall }: { icon: any, label: string, value: string | number, color: string, delay: number, isSmall?: boolean }) => {
    const colorClasses: { [key: string]: string } = {
        blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        orange: "bg-orange-500/10 text-orange-400 border-orange-500/20",
        red: "bg-red-500/10 text-red-400 border-red-500/20",
        green: "bg-green-500/10 text-green-400 border-green-500/20",
    };

    return (
        <motion.div
            variants={itemVariants}
            whileHover={{ translateY: -8, transition: { duration: 0.4, ease: "easeOut" } }}
        >
            <Card className={cn(
                "h-full bg-gradient-to-b from-white/[0.08] to-transparent backdrop-blur-2xl border border-white/10 p-8 rounded-[3rem] flex flex-col items-center justify-center relative overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-500 hover:bg-white/[0.12]",
                colorClasses[color]
            )}>
                <div className={cn("absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[50px] opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity duration-700", `bg-${color}-500`)} />
                <div className={cn("p-5 rounded-[2rem] mb-5 relative z-10 bg-white/[0.03] border border-white/5 group-hover:scale-110 transition-transform duration-500 shadow-xl", colorClasses[color].split(' ')[1])}>
                    <Icon className="h-10 w-10" />
                </div>
                <div className="text-center relative z-10">
                    <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] mb-2 opacity-60 group-hover:opacity-100 transition-opacity">{label}</p>
                    <p className={cn(
                        "font-black tracking-tighter leading-none text-white",
                        isSmall ? "text-4xl" : "text-6xl"
                    )}>{value}</p>
                </div>
            </Card>
        </motion.div>
    );
};

const ImanHarvestReport = () => {
    const { toast } = useToast();
    const [timeframe, setTimeframe] = useState('weekly');
    const { user } = useUser();
    const [activeReportTab, setActiveReportTab] = useState('main');
    
    const componentRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadData = useCallback(() => {
        if (!rawEntries) {
            toast({
                variant: "destructive",
                title: "لا توجد بيانات للتحميل",
            });
            return;
        }

        const dataToDownload = {
            reportDate: new Date().toISOString(),
            stats,
            rawEntries,
        };

        const dataStr = JSON.stringify(dataToDownload, (key, value) => {
             if (value && typeof value === 'object' && value.toDate instanceof Function) {
                return value.toDate().toISOString();
            }
             if (key === 'date' && value && value.seconds) {
                return new Date(value.seconds * 1000).toISOString();
            }
            return value;
        }, 2);
        
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const fileName = `iman-harvest-report-${new Date().toISOString().split('T')[0]}.json`;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast({
            title: "اكتمل التنزيل!",
            description: "تم تنزيل بيانات تقريرك بنجاح بصيغة JSON.",
        });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    
    const thirtyDaysAgo = subDays(new Date(), 30);
    const accountabilityPath = user ? `users/${user.uid}/accountability` : null;
    const { data: rawEntries, isLoading } = useCollection<AccountabilityEntry>(
        accountabilityPath,
        { where: ['date', '>=', thirtyDaysAgo], orderBy: ['date', 'desc'] }
    );
    
    const MAX_POSSIBLE_POINTS = 55;

    const stats = useMemo(() => {
        if (!rawEntries) return {
            commitmentDays: 0,
            bestDay: '-',
            avgPoints: 0,
            performanceData: [],
            categoryDistribution: [],
            mostKept: [],
            needsFocus: [],
            fullCommitmentDays: 0
        };
        
        const commitmentDays = rawEntries.length;

        let maxPoints = 0;
        let bestDayOfWeek = -1;
        rawEntries.forEach(entry => {
            if ((entry.totalPoints || 0) > maxPoints) {
                maxPoints = entry.totalPoints || 0;
                bestDayOfWeek = new Date(entry.date).getDay();
            }
        });
        const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        const bestDay = bestDayOfWeek !== -1 ? dayNames[bestDayOfWeek] : 'غير محدد';
        const fullCommitmentDays = rawEntries.filter(entry => entry.totalPoints && entry.totalPoints >= MAX_POSSIBLE_POINTS).length;


        const totalPoints = rawEntries.reduce((sum, entry) => sum + (entry.totalPoints || 0), 0);
        const avgPoints = commitmentDays > 0 ? Math.round(totalPoints / commitmentDays) : 0;
        
        const recentEntries = rawEntries.slice(0, 7).reverse();
        const performanceData = recentEntries.map(entry => ({
            name: new Date(entry.date).toLocaleDateString('ar-EG', { weekday: 'short' }),
            points: entry.totalPoints || 0
        }));

        const categoryPoints: {[key: string]: number} = {
            'الصلوات': 0, 'الأذكار': 0, 'السنن': 0, 'النوافل': 0, 'القرآن والعلم': 0,
        };

        const categoryMap: {[key: string]: string} = {
            'prayer': 'الصلوات', 'adhkar': 'الأذكار', 'sunnah': 'السنن', 'witr': 'النوافل',
            'quran': 'القرآن والعلم', 'knowledge': 'القرآن والعلم', 'charity': 'النوافل'
        };

        const allActions = Object.values(accountabilityStructure).flatMap(p => p.groups.flatMap(g => g.actions.map(a => ({...a, groupId: g.id}))));
        const actionCounts: {[key: string]: { count: number, label: string }} = {};
        allActions.forEach(a => actionCounts[a.id] = { count: 0, label: a.label });
        
        rawEntries.forEach(entry => {
            const allCustomActions = Object.values(entry.customActions || {}).flat();
            entry.completedActionIds?.forEach(actionId => {
                let action;
                let categoryKey: string | undefined;

                if (actionId.startsWith('custom_')) {
                    action = allCustomActions.find(a => a.id === actionId);
                    categoryKey = 'النوافل';
                } else {
                    const foundAction = allActions.find(a => a.id === actionId);
                    if (foundAction) {
                        action = foundAction;
                        actionCounts[action.id].count++;
                        const groupKey = Object.keys(categoryMap).find(key => foundAction.groupId.includes(key));
                        categoryKey = groupKey ? categoryMap[groupKey] : 'النوافل';
                    }
                }
                
                if (action && categoryKey && categoryPoints.hasOwnProperty(categoryKey)) {
                    categoryPoints[categoryKey] += action.points;
                }
            });
        });

        const categoryDistribution = Object.entries(categoryPoints)
            .filter(([, points]) => points > 0)
            .map(([name, value], index) => {
                const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#ff5733'];
                return { name, value, fill: colors[index % colors.length] };
            });
        
        const actionPerformance = Object.entries(actionCounts)
            .map(([id, {count, label}]) => ({ id, label, percentage: (count / commitmentDays) * 100 }))
            .sort((a,b) => a.percentage - b.percentage);

        const mostKept = actionPerformance.filter(a => a.percentage > 75).slice(-5).reverse();
        const needsFocus = actionPerformance.filter(a => a.percentage <= 75).slice(0, 5);

        return { commitmentDays, bestDay, avgPoints, performanceData, categoryDistribution, mostKept, needsFocus, fullCommitmentDays };
    }, [rawEntries]);

    if (isLoading) {
      return (
        <div className="p-4 sm:p-6 md:p-8 bg-slate-900/50 rounded-2xl">
          <div className="flex justify-center items-center h-96">
            <Loader2 className="w-12 h-12 animate-spin text-slate-400" />
          </div>
        </div>
      );
    }
    
    const completionPercentage = stats.avgPoints > 0 ? Math.min(Math.round((stats.avgPoints / MAX_POSSIBLE_POINTS) * 100), 100) : 0;
    
    const PrintableReport = React.forwardRef<HTMLDivElement, { stats: any; period: string }>(({ stats, period }, ref) => (
        <div ref={ref} className="p-10 bg-white text-black font-body" dir="rtl">
            <div className="text-center mb-10 border-b pb-4">
                <h1 className="text-4xl font-bold mb-2 font-headline">حصادك الإيماني</h1>
                <p className="text-gray-600">تقرير {period} - صادر بتاريخ: {new Date().toLocaleDateString('ar-EG')}</p>
            </div>
            
            <div className="grid grid-cols-3 gap-6 mb-10 text-center">
                 <div className="bg-gray-100 p-4 rounded-lg">
                    <h3 className="text-lg font-bold text-gray-500">أيام الالتزام</h3>
                    <p className="text-5xl font-bold text-blue-600">{stats.commitmentDays}</p>
                </div>
                 <div className="bg-gray-100 p-4 rounded-lg">
                    <h3 className="text-lg font-bold text-gray-500">أفضل يوم</h3>
                    <p className="text-5xl font-bold text-green-600">{stats.bestDay}</p>
                </div>
                 <div className="bg-gray-100 p-4 rounded-lg">
                    <h3 className="text-lg font-bold text-gray-500">نسبة الإنجاز</h3>
                    <p className="text-5xl font-bold text-red-600">{completionPercentage}%</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
                <div>
                    <h2 className="text-2xl font-bold mb-4">تطور أدائك</h2>
                    <div className="h-[300px] w-full">
                       <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.performanceData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="points" name="النقاط" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                 <div>
                    <h2 className="text-2xl font-bold mb-4">توزيع العبادات</h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={stats.categoryDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} label>
                                    {stats.categoryDistribution.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div>
                    <h2 className="text-2xl font-bold mb-4 text-green-700">أكثر ما حافظت عليه</h2>
                    <ul className="space-y-2">
                        {stats.mostKept.map((item: any) => (
                            <li key={item.id} className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
                                <span>{item.label}</span>
                                <span className="font-bold">{Math.round(item.percentage)}%</span>
                            </li>
                        ))}
                    </ul>
                </div>
                 <div>
                    <h2 className="text-2xl font-bold mb-4 text-yellow-700">يحتاج لتركيز أكبر</h2>
                     <ul className="space-y-2">
                        {stats.needsFocus.map((item: any) => (
                            <li key={item.id} className="flex justify-between items-center p-2 bg-yellow-50 rounded-lg">
                                <span>{item.label}</span>
                                <span className="font-bold">{Math.round(item.percentage)}%</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <footer className="mt-10 pt-4 border-t text-center text-gray-500 text-sm">
                تقرير صادر من منصة وقفة
            </footer>
        </div>
    ));
    PrintableReport.displayName = 'PrintableReport';


    return (
        <>
            <div className="non-printable">
                <div className="p-4 sm:p-6 md:p-8 bg-slate-900/50 rounded-2xl">
                    <motion.header 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col lg:flex-row justify-between items-center mb-16 gap-8"
                    >
                        <div className="space-y-2 text-center lg:text-right">
                            <h2 className="text-5xl md:text-7xl font-black text-white font-headline tracking-tighter">حصادك <span className="text-primary italic">الإيماني</span></h2>
                            <p className="text-white/30 font-bold italic text-lg">" وَنَكْتُبُ مَا قَدَّمُوا وَآثَارَهُمْ "</p>
                        </div>
                        <div className="flex flex-wrap justify-center items-center gap-3 p-2 bg-white/[0.03] backdrop-blur-3xl rounded-[2rem] border border-white/10 shadow-2xl">
                            {REPORT_TABS.map(tab => (
                                <TooltipProvider key={tab.id}>
                                    <ShadTooltip>
                                        <TooltipTrigger asChild>
                                            <Button 
                                                onClick={() => tab.id === 'main' && setActiveReportTab(tab.id)}
                                                variant={activeReportTab === tab.id ? 'default' : 'ghost'} 
                                                disabled={tab.id !== 'main'}
                                                className={cn(
                                                    'rounded-full px-8 py-6 font-black transition-all duration-500 h-auto',
                                                    activeReportTab === tab.id 
                                                        ? 'bg-primary text-white shadow-[0_10px_30px_rgba(var(--primary-rgb),0.4)] scale-105' 
                                                        : 'text-white/40 hover:bg-white/5 hover:text-white',
                                                    tab.id !== 'main' && 'opacity-20 cursor-not-allowed'
                                                )}>
                                                {tab.label}
                                            </Button>
                                        </TooltipTrigger>
                                        {tab.id !== 'main' && <TooltipContent><p>قريباً بإذن الله</p></TooltipContent>}
                                    </ShadTooltip>
                                </TooltipProvider>
                            ))}
                        </div>
                    </motion.header>

                    <div className="flex justify-end mb-8">
                        <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl border border-white/5">
                            <Button onClick={() => setTimeframe('monthly')} variant={timeframe === 'monthly' ? 'secondary' : 'ghost'} size="sm" className="rounded-lg px-4 font-bold">شهري</Button>
                            <Button onClick={() => setTimeframe('weekly')} variant={timeframe === 'weekly' ? 'secondary' : 'ghost'} size="sm" className="rounded-lg px-4 font-bold">أسبوعي</Button>
                        </div>
                    </div>

                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                    >
                         <StatCard 
                            icon={CalendarDays} 
                            label="أيام الالتزام" 
                            value={stats.commitmentDays} 
                            color="blue" 
                            delay={0}
                        />
                         <StatCard 
                            icon={Flame} 
                            label="التزام تام" 
                            value={stats.fullCommitmentDays} 
                            color="purple" 
                            delay={0.1}
                        />
                         <StatCard 
                            icon={Trophy} 
                            label="أفضل يوم" 
                            value={stats.bestDay} 
                            color="orange" 
                            delay={0.2}
                            isSmall={true}
                        />
                         <StatCard 
                            icon={CheckCircle2} 
                            label="نسبة الإنجاز" 
                            value={`${completionPercentage}%`} 
                            color="red" 
                            delay={0.3}
                        />
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <Card className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl">
                            <CardHeader className="border-b border-white/5 pb-6">
                                <CardTitle className="flex items-center gap-3 text-white font-black text-xl">
                                    <TrendingUp className="h-6 w-6 text-primary"/>
                                    تطور أدائك (آخر 7 أيام)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="h-[350px] w-full pt-10">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats.performanceData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#d97706" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <XAxis 
                                            dataKey="name" 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{ fill: '#71717a', fontWeight: 'bold', fontSize: 12 }} 
                                        />
                                        <YAxis hide />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '12px', fontWeight: 'bold' }}
                                            itemStyle={{ color: '#fbbf24' }}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="points" 
                                            stroke="#fbbf24" 
                                            strokeWidth={4}
                                            fillOpacity={1} 
                                            fill="url(#colorPoints)" 
                                            animationDuration={2000}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                        <Card className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl">
                            <CardHeader className="border-b border-white/5 pb-6">
                                <CardTitle className="flex items-center gap-3 text-white font-black text-xl">
                                    <PieChartIcon className="h-6 w-6 text-primary"/>
                                    توزيع العبادات
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="h-[350px] w-full pt-10">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie 
                                            data={stats.categoryDistribution} 
                                            dataKey="value" 
                                            nameKey="name" 
                                            cx="50%" 
                                            cy="50%" 
                                            innerRadius={80} 
                                            outerRadius={110} 
                                            paddingAngle={8}
                                            animationBegin={500}
                                            animationDuration={1500}
                                        >
                                            {stats.categoryDistribution.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} stroke="none" />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '12px', fontWeight: 'bold' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <Card className="bg-slate-800/50 border-slate-700/50 text-white">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-green-400">
                                    <ThumbsUp className="h-5 w-5"/>
                                    أكثر ما حافظت عليه
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {stats.mostKept.map(item => (
                                    <div key={item.id} className="flex justify-between items-center text-sm">
                                        <span>{item.label}</span>
                                        <span className="font-mono">{Math.round(item.percentage)}%</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                        <Card className="bg-slate-800/50 border-slate-700/50 text-white">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-yellow-400">
                                    <AlertTriangle className="h-5 w-5"/>
                                    يحتاج لتركيز أكبر
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {stats.needsFocus.map(item => (
                                    <div key={item.id} className="flex justify-between items-center text-sm">
                                        <span>{item.label}</span>
                                        <span className="font-mono">{Math.round(item.percentage)}%</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                    
                    <footer className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                         <Button onClick={handlePrint} size="lg" className="h-14 text-lg bg-gradient-to-r from-teal-500 to-cyan-600 text-white" >
                            <FileText className="me-2 h-5 w-5"/>
                            تحميل التقرير الأسبوعي (PDF)
                        </Button>
                         <Button onClick={handleDownloadData} size="lg" className="h-14 text-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white" >
                            <FileText className="me-2 h-5 w-5"/>
                            تحميل بيانات التقرير (JSON)
                        </Button>
                    </footer>
                </div>
            </div>
             <div className="hidden">
                <div className="printable-area">
                    <PrintableReport ref={componentRef} stats={stats} period={timeframe === 'weekly' ? 'الأسبوعي' : 'الشهري'} />
                </div>
            </div>
        </>
    );
};

export function AccountabilityTracker({ redirectToOnAuth = '/accountability', showHeader = true }: { redirectToOnAuth?: string, showHeader?: boolean }) {
    const { toast } = useToast();
    const router = useRouter();
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();
    const { quranIconUrl, hadithIconUrl } = useAppearance();
    
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
    
    const gregorianFormatters = {
        formatWeekdayName: (weekday: Date, options?: { locale?: Locale }) => 
            new Intl.DateTimeFormat(options?.locale?.code === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'short' }).format(weekday).substring(0, 1).toUpperCase(),
    };

    const hijriFormatters = {
        formatDay: (date: Date) => new Intl.DateTimeFormat('ar-SA-u-ca-islamic-nu-latn', { day: 'numeric' }).format(date),
        formatCaption: (date: Date) => new Intl.DateTimeFormat('ar-SA-u-ca-islamic-nu-latn', { month: 'long', year: 'numeric' }).format(date),
        formatWeekdayName: (weekday: Date) => new Intl.DateTimeFormat('ar-SA-u-ca-islamic', { weekday: 'short' }).format(weekday).substring(0, 1),
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

        } else {
            setCompletedActions([]);
            setCustomActions({});
        }
    }, [currentEntry]);

     const totalPoints = useMemo(() => {
        let points = 0;
        const allActions = Object.values(accountabilityStructure).flatMap(p => p.groups.flatMap(g => g.actions));
        const allCustomActions = Object.values(customActions).flat();

        completedActions.forEach(actionId => {
            const action = allActions.find(a => a.id === actionId) || allCustomActions.find(a => a.id === actionId);
            if(action) {
                points += action.points;
            }
        });
        return points;
    }, [completedActions, customActions]);
    
    const handleActionToggle = (actionId: string, groupId: string, type: 'single' | 'multi') => {
        const isSelected = completedActions.includes(actionId);
        
        let newCompleted = [...completedActions];

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
        <div className="relative min-h-screen overflow-hidden bg-[#0a0a0c] selection:bg-primary/30 selection:text-white">
            {/* Cinematic Background Orbs */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <motion.div 
                    animate={{ 
                        x: [0, 100, 0], 
                        y: [0, -100, 0],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]" 
                />
                <motion.div 
                    animate={{ 
                        x: [0, -100, 0], 
                        y: [0, 100, 0],
                        scale: [1, 1.3, 1]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-amber-500/5 rounded-full blur-[150px]" 
                />
                <motion.div 
                    animate={{ 
                        opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.05)_0%,transparent_70%)]" 
                />
            </div>

            <div className="relative z-10 space-y-8 pb-20">
            {showHeader && (
                <motion.header 
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="relative space-y-6 text-center py-16 px-4"
                >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none z-0" />
                    
                    <motion.div
                        animate={{ 
                            scale: [1, 1.05, 1],
                        }}
                        transition={{ 
                            duration: 6,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="relative z-10 w-fit mx-auto mb-8"
                    >
                        <div className="absolute inset-0 bg-primary/40 blur-[40px] rounded-full opacity-50" />
                        <BookCheck className="h-28 w-28 text-white relative z-10" />
                    </motion.div>

                    <h1 className="text-6xl md:text-9xl font-black mt-4 mb-6 font-headline tracking-tighter text-white relative z-10 drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                        محاسبة <span className="text-primary italic">النفس</span>
                    </h1>
                    
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="space-y-6"
                    >
                        <p className="max-w-4xl mx-auto text-2xl md:text-3xl text-white/40 leading-relaxed font-bold relative z-10 italic drop-shadow-md">
                            "حَاسِبُوا أَنْفُسَكُمْ قَبْلَ أَنْ تُحَاسَبُوا، وَزِنُوا أَنْفُسَكُمْ قَبْلَ أَنْ تُوزَنُوا"
                        </p>
                        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                            <span className="text-xs md:text-sm font-black text-primary tracking-[0.3em] uppercase opacity-80 italic">عمر بن الخطاب رضي الله عنه</span>
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 1 }}
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-primary/50 to-transparent" 
                    />
                </motion.header>
            )}

            <div className={cn("max-w-md mx-auto sticky top-20 z-20 transition-all duration-500", !isDateCardVisible && "opacity-0 -translate-y-full pointer-events-none")}>
                <Popover>
                    <PopoverTrigger asChild>
                         <Button
                            variant="outline"
                            className="w-full h-14 text-lg font-bold rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.3)] bg-card/60 backdrop-blur-xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-foreground"
                        >
                            <CalendarIcon className="w-5 h-5 me-2 text-primary" />
                            {formatGregorianForButton(selectedDate)} | {formatHijriForButton(selectedDate)}
                            <ChevronDown className="w-4 h-4 ms-2 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 flex bg-card/80 backdrop-blur-3xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl" dir="rtl">
                         <div className="p-2">
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
                                    Chevron: (props) => props.orientation === 'left' ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />,
                                }}
                                classNames={{
                                    caption_label: "font-bold text-primary",
                                    nav_button_previous: "absolute right-1",
                                    nav_button_next: "absolute right-auto left-1",
                                }}
                            />
                        </div>
                        <Separator orientation="vertical" className="h-auto"/>
                        <div className="p-2">
                            <Calendar
                                locale={ar}
                                mode="single"
                                selected={selectedDate}
                                onSelect={handleDateSelect}
                                month={gregorianMonth}
                                onMonthChange={setGregorianMonth}
                                formatters={gregorianFormatters}
                                dir="rtl"
                                 components={{
                                     Chevron: (props) => props.orientation === 'left' ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />,
                                 }}
                                classNames={{
                                    nav_button_previous: "absolute right-1",
                                    nav_button_next: "absolute right-auto left-1",
                                }}
                            />
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            <Tabs defaultValue="fajr" className="w-full">
              <div className="flex justify-center overflow-x-auto pb-8 custom-scrollbar">
                <TabsList className="h-auto p-2 shrink-0 bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.3)] gap-2">
                    <TabsTrigger 
                        value="iman-harvest" 
                        className="px-6 py-3 rounded-full flex items-center gap-2 transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)]"
                    >
                        <FileText className="h-5 w-5" />
                        <span className="font-bold">الحصاد الإيماني</span>
                    </TabsTrigger>
                    {Object.entries(accountabilityStructure).reverse().map(([key, { name }]) => {
                        const Icon = prayerIcons[key as keyof typeof prayerIcons];
                        const isFajr = key === 'fajr';
                        return (
                            <TabsTrigger 
                                key={key}
                                value={key} 
                                className={cn(
                                    "px-6 py-3 rounded-full flex items-center gap-2 transition-all",
                                    "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_0_20_rgba(var(--primary-rgb),0.4)] font-bold",
                                    isFajr && "data-[state=active]:bg-gradient-to-tr data-[state=active]:from-yellow-300 data-[state=active]:via-orange-400 data-[state=active]:to-red-500"
                                )}
                            >
                                {Icon && <Icon className="h-5 w-5" />}
                                <span>{name}</span>
                            </TabsTrigger>
                        )
                    })}
                </TabsList>
              </div>
                
                <AnimatePresence mode="wait">
                    <TabsContent value="iman-harvest" key="iman-harvest" className="mt-6">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.4 }}
                        >
                            <ImanHarvestReport />
                        </motion.div>
                    </TabsContent>

                    {isLoading ? (
                        <TabsContent value="loading" key="loading" className="flex justify-center p-16">
                            <Loader2 className="h-12 w-12 animate-spin text-primary/40" />
                        </TabsContent>
                    ) : (
                        Object.entries(accountabilityStructure).reverse().map(([key, prayerConfig]) => (
                            <TabsContent key={key} value={key} className="mt-6">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 1.02, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="text-4xl font-black text-center mb-8 font-headline tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-white/40">
                                        {prayerConfig.name}
                                    </div>
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
                                </motion.div>
                            </TabsContent>
                        ))
                    )}
                </AnimatePresence>
            </Tabs>



            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4">
                 <div className="bg-black/40 backdrop-blur-3xl border border-white/10 p-3 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.8)] flex items-center justify-between relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-50" />
                    <div className="flex items-center gap-8 px-8 py-3 relative z-10 w-full justify-center">
                        <motion.div
                            animate={{ 
                                scale: [1, 1.15, 1],
                            }}
                            key={totalPoints}
                            transition={{ duration: 0.4 }}
                            className="relative"
                        >
                            <div className="absolute inset-0 bg-primary/40 blur-xl rounded-full" />
                            <Trophy className="w-10 h-10 text-white relative z-10 drop-shadow-lg" />
                        </motion.div>
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] uppercase font-black tracking-[0.3em] text-white/30 mb-1">الرصيد الإيماني</span>
                            <motion.span 
                                key={totalPoints}
                                initial={{ scale: 0.8, opacity: 0.5 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-5xl font-black text-white leading-none tracking-tighter drop-shadow-2xl"
                            >
                                {totalPoints}
                            </motion.span>
                        </div>
                    </div>
                 </div>
            </div>
          </div>
        </div>
    );
}

const prayerIcons = {
    fajr: Sunrise,
    dhuhr: Sun,
    asr: Sunset,
    maghrib: Sunset,
    isha: Moon,
    general: Sparkles
};
