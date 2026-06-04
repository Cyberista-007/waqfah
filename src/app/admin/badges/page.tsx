"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import type { GamificationBadge } from "@/lib/types";
import { useCollection, useFirestore } from "@/firebase";
import { collection, doc, writeBatch, setDoc, deleteDoc } from "firebase/firestore";
import { Loader2, Database, Trophy, Gem, BookOpen, Headphones, Film, Sparkles, Plus, Trash, Star, Calendar, Crown } from "lucide-react";
import { badges as badgesData } from '@/lib/badges-data';

const iconMap: { [key: string]: React.ElementType } = {
    Headphones,
    BookOpen,
    Film,
    Sparkles,
    Gem,
    Trophy,
    Star,
    Calendar,
    Crown
};

const metricOptions = [
  { value: 'minutesListened', label: 'دقائق الاستماع (minutesListened)' },
  { value: 'lecturesCompleted', label: 'المحاضرات المكتملة (lecturesCompleted)' },
  { value: 'seriesCompleted', label: 'السلاسل المكتملة (seriesCompleted)' },
  { value: 'totalDonated', label: 'إجمالي التبرعات (totalDonated)' },
  { value: 'points', label: 'النقاط الإجمالية (points)' },
  { value: 'fajrStreak', label: 'أيام الفجر المتتالية (fajrStreak)' },
];

export default function AdminBadgesPage() {
    const { toast } = useToast();
    const firestore = useFirestore();
    const { data: existingBadges, isLoading } = useCollection<GamificationBadge>('gamification_badges');
    const [isSeeding, setIsSeeding] = useState(false);
    const [activeTab, setActiveTab] = useState<string>("list");
    
    // Form states for new badge
    const [newBadgeId, setNewBadgeId] = useState("");
    const [newBadgeTitle, setNewBadgeTitle] = useState("");
    const [newBadgeDesc, setNewBadgeDesc] = useState("");
    const [newBadgeIcon, setNewBadgeIcon] = useState("Trophy");
    const [newBadgeMetric, setNewBadgeMetric] = useState("minutesListened");
    const [newBadgeThreshold, setNewBadgeThreshold] = useState("");
    const [newBadgePoints, setNewBadgePoints] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const existingBadgeIds = new Set(existingBadges?.map(b => b.id));
    const badgesToSeed = badgesData.filter(b => !existingBadgeIds.has(b.id));

    const handleSeedBadges = async () => {
        if (!firestore || badgesToSeed.length === 0) return;
        
        setIsSeeding(true);
        try {
            const batch = writeBatch(firestore);
            const badgesCollection = collection(firestore, 'gamification_badges');
            
            badgesToSeed.forEach(badge => {
                const docRef = doc(badgesCollection, badge.id);
                batch.set(docRef, badge);
            });

            await batch.commit();
            toast({
                title: "تمت إضافة الأوسمة بنجاح!",
                description: `تمت إضافة ${badgesToSeed.length} وسام جديد إلى قاعدة البيانات.`,
            });
        } catch (error) {
             console.error("Error seeding badges:", error);
             toast({
                variant: "destructive",
                title: "فشل في إضافة الأوسمة",
             });
        } finally {
            setIsSeeding(false);
        }
    };

    const handleCreateBadge = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firestore) return;
        
        if (!newBadgeId || !newBadgeTitle || !newBadgeDesc || !newBadgeThreshold || !newBadgePoints) {
            toast({
                variant: "destructive",
                title: "الحقول ناقصة",
                description: "الرجاء تعبئة كافة الحقول المطلوبة.",
            });
            return;
        }

        setIsSaving(true);
        try {
            const badgeRef = doc(firestore, 'gamification_badges', newBadgeId.trim().toLowerCase());
            const newBadge: GamificationBadge = {
                id: newBadgeId.trim().toLowerCase(),
                title: newBadgeTitle.trim(),
                description: newBadgeDesc.trim(),
                icon: newBadgeIcon,
                metric: newBadgeMetric as any,
                threshold: Number(newBadgeThreshold),
                points: Number(newBadgePoints)
            };

            await setDoc(badgeRef, newBadge);
            toast({
                title: "تم إنشاء الوسام بنجاح!",
                description: `الوسام "${newBadgeTitle}" متاح الآن لجميع المستخدمين.`,
            });

            // Reset form
            setNewBadgeId("");
            setNewBadgeTitle("");
            setNewBadgeDesc("");
            setNewBadgeIcon("Trophy");
            setNewBadgeMetric("minutesListened");
            setNewBadgeThreshold("");
            setNewBadgePoints("");
            
            // Switch to list
            setActiveTab("list");
        } catch (error) {
            console.error("Error creating badge:", error);
            toast({
                variant: "destructive",
                title: "خطأ أثناء الحفظ",
                description: "لم نتمكن من حفظ الوسام الجديد في قاعدة البيانات.",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteBadge = async (badgeId: string, title: string) => {
        if (!firestore) return;
        if (!confirm(`هل أنت متأكد من رغبتك في حذف وسام "${title}"؟`)) return;

        try {
            await deleteDoc(doc(firestore, 'gamification_badges', badgeId));
            toast({
                title: "تم حذف الوسام",
                description: `تم إزالة وسام "${title}" من النظام بنجاح.`,
            });
        } catch (error) {
            console.error("Error deleting badge:", error);
            toast({
                variant: "destructive",
                title: "فشل الحذف",
                description: "حدث خطأ أثناء محاولة إزالة الوسام.",
            });
        }
    };

    return (
        <Card className="w-full max-w-5xl mx-auto border-white/5 bg-zinc-950/60 backdrop-blur-md">
            <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <CardTitle className="text-2xl font-headline flex items-center gap-2 text-white">
                        <Trophy className="text-amber-500" /> إدارة الأوسمة التفاعلية
                    </CardTitle>
                    <CardDescription className="text-zinc-400">
                        عرض، تعديل، بذر، أو إنشاء أوسمة مخصصة لنظام النقاط وجدارة المستخدمين.
                    </CardDescription>
                </div>
                <div className="flex gap-2">
                    <Button 
                        variant="outline"
                        onClick={handleSeedBadges} 
                        disabled={isLoading || isSeeding || badgesToSeed.length === 0}
                        className="border-white/10 hover:bg-white/5 text-white"
                    >
                        {isSeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4 text-primary" />}
                        {badgesToSeed.length > 0 ? `بذر ${badgesToSeed.length} أوسمة افتراضية` : 'الأوسمة الافتراضية مزروعة'}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full text-right" dir="rtl">
                    <TabsList className="bg-white/5 border border-white/5 rounded-xl mb-6 flex justify-start gap-2 h-auto p-1 max-w-xs">
                        <TabsTrigger value="list" className="px-6 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-zinc-950 text-zinc-400 font-bold">
                            قائمة الأوسمة
                        </TabsTrigger>
                        <TabsTrigger value="new" className="px-6 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-zinc-950 text-zinc-400 font-bold flex items-center gap-1.5">
                            <Plus className="w-4 h-4" /> وسام جديد
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="list" className="outline-none">
                        <Table className="border border-white/5 rounded-2xl overflow-hidden">
                            <TableHeader className="bg-white/5">
                                <TableRow className="border-b border-white/5 hover:bg-transparent">
                                    <TableHead className="text-right text-zinc-300 font-black">الوسام</TableHead>
                                    <TableHead className="text-right text-zinc-300 font-black">الوصف</TableHead>
                                    <TableHead className="text-right text-zinc-300 font-black">المعيار المطلوب</TableHead>
                                    <TableHead className="text-right text-zinc-300 font-black">القيمة المطلوبة</TableHead>
                                    <TableHead className="text-right text-zinc-300 font-black">النقاط الممنوحة</TableHead>
                                    <TableHead className="text-center text-zinc-300 font-black">إجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12">
                                            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                                            <p className="text-zinc-500 text-xs mt-2 font-bold">جاري جلب الأوسمة من قاعدة البيانات...</p>
                                        </TableCell>
                                    </TableRow>
                                ) : existingBadges && existingBadges.length > 0 ? (
                                    existingBadges.map((badge) => {
                                        const Icon = iconMap[badge.icon] || Trophy;
                                        const metricObj = metricOptions.find(opt => opt.value === badge.metric);
                                        
                                        return (
                                            <TableRow key={badge.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                                                <TableCell className="font-bold text-white">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                                                            <Icon className="h-5 w-5" />
                                                        </div>
                                                        <span>{badge.title}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-zinc-300 text-sm">{badge.description}</TableCell>
                                                <TableCell className="text-zinc-400 font-bold text-xs">{metricObj ? metricObj.label : badge.metric}</TableCell>
                                                <TableCell className="font-bold text-white tabular-nums">{badge.threshold}</TableCell>
                                                <TableCell className="font-bold text-amber-400 tabular-nums">+{badge.points}</TableCell>
                                                <TableCell className="text-center">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon"
                                                        onClick={() => handleDeleteBadge(badge.id, badge.title)}
                                                        className="text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg"
                                                    >
                                                        <Trash className="w-4 h-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12 text-zinc-500">
                                            لا توجد أوسمة حالياً في قاعدة البيانات. اضغط على "بذر الأوسمة الافتراضية" أو "وسام جديد" للبدء.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TabsContent>

                    <TabsContent value="new" className="outline-none">
                        <form onSubmit={handleCreateBadge} className="space-y-6 max-w-2xl bg-white/[0.01] border border-white/5 rounded-3xl p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="badge-id" className="text-zinc-300 font-bold text-sm">المعرف الفريد (Unique Slug)</Label>
                                    <Input
                                        id="badge-id"
                                        placeholder="مثال: listener-expert"
                                        value={newBadgeId}
                                        onChange={(e) => setNewBadgeId(e.target.value)}
                                        required
                                        className="bg-white/5 border-white/10 text-white rounded-xl placeholder:text-zinc-600 focus:border-primary focus:ring-1 focus:ring-primary"
                                    />
                                    <p className="text-[10px] text-zinc-500 font-bold">يجب أن يكون بالإنجليزية وبأحرف صغيرة وبدون مسافات.</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="badge-title" className="text-zinc-300 font-bold text-sm">عنوان الوسام (بالعربية)</Label>
                                    <Input
                                        id="badge-title"
                                        placeholder="مثال: مستمع ذهبي"
                                        value={newBadgeTitle}
                                        onChange={(e) => setNewBadgeTitle(e.target.value)}
                                        required
                                        className="bg-white/5 border-white/10 text-white rounded-xl placeholder:text-zinc-600 focus:border-primary focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="badge-desc" className="text-zinc-300 font-bold text-sm">الوصف التفصيلي وشروط التخطي</Label>
                                <Textarea
                                    id="badge-desc"
                                    placeholder="اكتب وصفاً للوسام ليظهر للمستخدمين عند النقر عليه..."
                                    value={newBadgeDesc}
                                    onChange={(e) => setNewBadgeDesc(e.target.value)}
                                    required
                                    rows={3}
                                    className="bg-white/5 border-white/10 text-white rounded-xl placeholder:text-zinc-600 focus:border-primary focus:ring-1 focus:ring-primary"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-zinc-300 font-bold text-sm">أيقونة الوسام</Label>
                                    <Select value={newBadgeIcon} onValueChange={setNewBadgeIcon}>
                                        <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl">
                                            <SelectValue placeholder="اختر أيقونة" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-950 border-white/10 text-white">
                                            {Object.keys(iconMap).map((iconKey) => {
                                                const Icon = iconMap[iconKey];
                                                return (
                                                    <SelectItem key={iconKey} value={iconKey} className="hover:bg-white/10 cursor-pointer">
                                                        <span className="flex items-center gap-2">
                                                            <Icon className="w-4 h-4 text-amber-500" />
                                                            {iconKey}
                                                        </span>
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-zinc-300 font-bold text-sm">معيار القياس الحسابي (Metric)</Label>
                                    <Select value={newBadgeMetric} onValueChange={setNewBadgeMetric}>
                                        <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl">
                                            <SelectValue placeholder="اختر المعيار الحسابي" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-950 border-white/10 text-white">
                                            {metricOptions.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value} className="hover:bg-white/10 cursor-pointer">
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="badge-threshold" className="text-zinc-300 font-bold text-sm">القيمة المطلوبة للتخطي (Threshold)</Label>
                                    <Input
                                        id="badge-threshold"
                                        type="number"
                                        min="1"
                                        placeholder="مثال: 60 (للدقائق) أو 10 (للمحاضرات)"
                                        value={newBadgeThreshold}
                                        onChange={(e) => setNewBadgeThreshold(e.target.value)}
                                        required
                                        className="bg-white/5 border-white/10 text-white rounded-xl placeholder:text-zinc-600 focus:border-primary focus:ring-1 focus:ring-primary"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="badge-points" className="text-zinc-300 font-bold text-sm">النقاط الممنوحة عند التخطي</Label>
                                    <Input
                                        id="badge-points"
                                        type="number"
                                        min="1"
                                        placeholder="مثال: 50"
                                        value={newBadgePoints}
                                        onChange={(e) => setNewBadgePoints(e.target.value)}
                                        required
                                        className="bg-white/5 border-white/10 text-white rounded-xl placeholder:text-zinc-600 focus:border-primary focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button 
                                    type="submit" 
                                    disabled={isSaving}
                                    className="bg-primary hover:bg-primary/95 text-white font-black px-8 py-3 rounded-xl flex items-center gap-2"
                                >
                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                                    حفظ وإنشاء الوسام الجديد
                                </Button>
                            </div>
                        </form>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
