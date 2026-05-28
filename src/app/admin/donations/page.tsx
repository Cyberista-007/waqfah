'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import type { Donation, DonationSettings } from '@/lib/types';
import { useCollection, useDoc, useFirestore } from '@/firebase';
import { doc, setDoc, runTransaction, increment, collection, Timestamp } from 'firebase/firestore';
import { Loader2, Heart, Edit, Trash2, PlusCircle, Settings, List, Bot } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DonationForm } from '@/components/admin/donation-form';
import { DeleteConfirmationDialog } from '@/components/admin/delete-dialog';
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { format } from 'date-fns';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { cn } from '@/lib/utils';

function SettingsTab() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { data: currentSettings, isLoading } = useDoc<DonationSettings>('settings/donations');

  const [monthlyGoal, setMonthlyGoal] = useState(0);
  const [currentAmount, setCurrentAmount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [distBooks, setDistBooks] = useState(40);
  const [distDev, setDistDev] = useState(35);
  const [distOrphans, setDistOrphans] = useState(25);

  const totalDist = distBooks + distDev + distOrphans;

  useEffect(() => {
    if (currentSettings) {
      setMonthlyGoal(currentSettings.monthlyGoal || 0);
      setCurrentAmount(currentSettings.currentAmount || 0);
    }
  }, [currentSettings]);

  useEffect(() => {
    const saved = localStorage.getItem('waqfah_donations_dist');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setDistBooks(parsed.books ?? 40);
        setDistDev(parsed.dev ?? 35);
        setDistOrphans(parsed.orphans ?? 25);
      } catch(e) {}
    }
  }, []);

  const handleSubmit = async () => {
    if (!firestore) {
        toast({ variant: 'destructive', title: 'خطأ في الاتصال بقاعدة البيانات.' });
        return;
    }

    if (totalDist !== 100) {
        toast({ variant: 'destructive', title: 'عذراً، يجب أن يكون مجموع نسب التوزيع 100% تماماً.' });
        return;
    }

    setIsSubmitting(true);
    try {
        const settingsRef = doc(firestore, 'settings', 'donations');
        await setDoc(settingsRef, { monthlyGoal: Number(monthlyGoal), currentAmount: Number(currentAmount) }, { merge: true });
        localStorage.setItem('waqfah_donations_dist', JSON.stringify({ books: distBooks, dev: distDev, orphans: distOrphans }));
        toast({ title: 'تم حفظ إعدادات التبرع ونسب التوزيع بنجاح!' });
    } catch (error) {
        console.error("Error saving donation settings:", error);
        toast({ variant: 'destructive', title: 'فشل حفظ الإعدادات.' });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Column 1: Settings Form */}
        <div className="space-y-6">
            {isLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : (
                <>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span>⚙</span>
                        <span>مستهدفات التمويل الوقفي</span>
                    </h3>
                    
                    <div className="space-y-2">
                        <Label htmlFor="monthly-goal">الهدف الشهري (بالجنيه المصري)</Label>
                        <Input 
                            id="monthly-goal"
                            type="number"
                            value={monthlyGoal}
                            onChange={(e) => setMonthlyGoal(Number(e.target.value))}
                            className="bg-white/5 border-white/10"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="current-amount">المبلغ الذي تم جمعه (بالجنيه المصري)</Label>
                        <Input 
                            id="current-amount"
                            type="number"
                            value={currentAmount}
                            onChange={(e) => setCurrentAmount(Number(e.target.value))}
                            className="bg-white/5 border-white/10"
                        />
                    </div>
                    
                    <Button onClick={handleSubmit} disabled={isSubmitting || totalDist !== 100} className="w-full">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        حفظ الإعدادات والتوزيع
                    </Button>
                </>
            )}
        </div>

        {/* Column 2: Category Distribution */}
        <div className="bg-zinc-950/40 border border-white/10 rounded-2xl p-5 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>📊</span>
                <span>توزيع مصارف الوقف والتبرعات</span>
            </h3>
            <p className="text-xs text-zinc-400">
                حدد نسب توزيع التبرعات الواردة على مصارف الوقف المختلفة للتأكد من إيصال الدعم لمستحقيه.
            </p>

            <div className="space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                        <Label htmlFor="dist-books" className="text-zinc-300">كتب ومصاحف ورقية لطلبة العلم</Label>
                        <span className="text-primary">{distBooks}%</span>
                    </div>
                    <Input 
                        id="dist-books"
                        type="number"
                        min="0"
                        max="100"
                        value={distBooks}
                        onChange={(e) => setDistBooks(Number(e.target.value))}
                        className="bg-white/5 border-white/10"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                        <Label htmlFor="dist-dev" className="text-zinc-300">بث وتطوير وصيانة منصة وقفة</Label>
                        <span className="text-blue-400">{distDev}%</span>
                    </div>
                    <Input 
                        id="dist-dev"
                        type="number"
                        min="0"
                        max="100"
                        value={distDev}
                        onChange={(e) => setDistDev(Number(e.target.value))}
                        className="bg-white/5 border-white/10"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                        <Label htmlFor="dist-orphans" className="text-zinc-300">كفالة الأيتام والطلبة المحتاجين</Label>
                        <span className="text-emerald-400">{distOrphans}%</span>
                    </div>
                    <Input 
                        id="dist-orphans"
                        type="number"
                        min="0"
                        max="100"
                        value={distOrphans}
                        onChange={(e) => setDistOrphans(Number(e.target.value))}
                        className="bg-white/5 border-white/10"
                    />
                </div>
            </div>

            <div className={cn(
                "p-3 rounded-xl text-center text-xs font-bold",
                totalDist === 100 
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                    : "bg-red-500/10 text-red-400 border border-red-500/20"
            )}>
                {totalDist === 100 
                    ? "المجموع: 100% (جاهز للحفظ)" 
                    : `تنبيه: يجب أن يكون مجموع النسب 100% (المجموع الحالي: ${totalDist}%)`}
            </div>
        </div>
    </div>
  );
}

function DonationsListTab() {
  const { data: donations, isLoading } = useCollection<Donation>('donations', { orderBy: ['donatedAt', 'desc'] });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<Donation | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Donation | null>(null);
  const [thankYouDonor, setThankYouDonor] = useState<Donation | null>(null);
  const firestore = useFirestore();
  const { toast } = useToast();
  const { isAdmin } = useAdminAuth();
  const [isCreatingFake, setIsCreatingFake] = useState(false);

  const handleNew = () => {
    setItemToEdit(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: Donation) => {
    setItemToEdit(item);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setItemToEdit(null);
  };
  
  const handleDelete = async () => {
    if (!itemToDelete || !firestore) return;
    deleteDocumentNonBlocking(doc(firestore, 'donations', itemToDelete.id));
    toast({ title: 'تم حذف التبرع بنجاح.' });
    setItemToDelete(null);
  };

  const handleCreateFakeDonation = async () => {
    if (!firestore) return;
    setIsCreatingFake(true);

    const fakeDonation = {
      donorName: 'متبرع تجريبي',
      amount: Math.floor(Math.random() * (500 - 50 + 1) + 50), // Random amount between 50 and 500
      isAnonymous: Math.random() < 0.3, // 30% chance of being anonymous
      donatedAt: Timestamp.now(),
      userId: null
    };

    try {
        const donationRef = doc(collection(firestore, 'donations'));
        const settingsRef = doc(firestore, 'settings', 'donations');

        await runTransaction(firestore, async (transaction) => {
            transaction.set(donationRef, fakeDonation);
            transaction.set(settingsRef, { currentAmount: increment(fakeDonation.amount) }, { merge: true });
        });
        
        toast({ title: 'تم إنشاء تبرع تجريبي بنجاح' });
    } catch (error) {
        console.error('Error creating fake donation:', error);
        toast({ variant: 'destructive', title: 'فشل إنشاء التبرع التجريبي' });
    } finally {
        setIsCreatingFake(false);
    }
  };


  if (isFormOpen) {
    return <DonationForm item={itemToEdit} onFormClose={handleFormClose} />;
  }

  return (
    <>
      <div className="flex justify-end mb-4 gap-2">
        {isAdmin && (
            <Button onClick={handleCreateFakeDonation} disabled={isCreatingFake} variant="secondary">
                {isCreatingFake ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Bot className="me-2 h-4 w-4" />}
                إضافة تبرع وهمي
            </Button>
        )}
        <Button onClick={handleNew}><PlusCircle className="me-2 h-4 w-4" /> إضافة تبرع جديد</Button>
      </div>
      <Table dir="rtl">
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">اسم المتبرع</TableHead>
            <TableHead className="text-right">المبلغ</TableHead>
            <TableHead className="text-right">التاريخ</TableHead>
            <TableHead className="text-right">مجهول</TableHead>
            <TableHead className="text-right">إجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow><TableCell colSpan={5} className="text-center"><Loader2 className="animate-spin mx-auto" /></TableCell></TableRow>
          ) : (
            donations?.map(d => (
              <TableRow key={d.id}>
                <TableCell className="text-right font-medium">{d.donorName}</TableCell>
                <TableCell className="text-right font-semibold text-emerald-400">
                  {d.amount ? new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(d.amount) : 'N/A'}
                </TableCell>
                <TableCell className="text-right">{d.donatedAt ? format(typeof (d.donatedAt as any).toDate === 'function' ? (d.donatedAt as any).toDate() : new Date(d.donatedAt as any), 'yyyy/MM/dd') : '-'}</TableCell>
                <TableCell className="text-right">{d.isAnonymous ? 'نعم' : 'لا'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-start">
                    <Button variant="outline" size="sm" onClick={() => setThankYouDonor(d)} className="text-xs text-primary font-bold bg-primary/10 border-primary/20 hover:bg-primary/20">
                      شكر ✉
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleEdit(d)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="destructive" size="icon" onClick={() => setItemToDelete(d)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
       <DeleteConfirmationDialog 
          isOpen={!!itemToDelete}
          onClose={() => setItemToDelete(null)}
          onConfirm={handleDelete}
          title="حذف التبرع"
          description="هل أنت متأكد من رغبتك في حذف هذا التبرع؟"
        />

      {/* Thank-You Template Generation Dialog */}
      {thankYouDonor && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full bg-zinc-950 border-white/10 p-6 space-y-6 text-center relative shadow-2xl rounded-3xl">
            <button 
              onClick={() => setThankYouDonor(null)} 
              className="absolute top-4 right-4 text-zinc-400 hover:text-white text-lg font-bold"
            >
              ✕
            </button>
            <CardHeader className="p-0">
              <CardTitle className="text-xl font-bold font-headline text-white">بطاقة شكر المتبرع الجاهزة</CardTitle>
              <CardDescription>يمكنك نسخ النص الجاهز لمشاركته مع الداعم الكريم.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-5">
              <div className="bg-gradient-to-br from-primary/10 via-zinc-900 to-primary/5 border border-primary/20 p-6 rounded-2xl space-y-4 text-right">
                <p className="text-xs text-zinc-500 font-bold text-center">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
                <p className="text-sm text-zinc-200 leading-relaxed">
                  تتقدم **منصة وقفة التعليمية** بخالص الشكر والامتنان للمحسن الكريم: 
                  <span className="text-primary font-black block my-1.5 text-center text-lg">{thankYouDonor.donorName}</span>
                  على مساهمته الوقفية الكريمة بقيمة 
                  <span className="text-emerald-400 font-black"> {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(thankYouDonor.amount || 0)} </span>
                  في دعم طباعة ونشر كتب ورقية وبث مواد علمية شرعية.
                </p>
                <p className="text-[10px] text-zinc-400 text-center mt-3 font-semibold">«مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ»</p>
              </div>

              <Button 
                onClick={() => {
                  const text = `تتقدم منصة وقفة التعليمية بخالص الشكر والامتنان للمحسن الكريم ${thankYouDonor.donorName} على مساهمته الوقفية بقيمة ${new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(thankYouDonor.amount || 0)} في دعم وبث المواد العلمية الشرعية. «مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ»`;
                  navigator.clipboard.writeText(text);
                  toast({ title: 'تم نسخ نص الشكر بنجاح!' });
                }} 
                className="w-full bg-primary text-black hover:bg-primary/90 rounded-xl py-5 text-sm font-bold"
              >
                نسخ نص الشكر للحافظة 📋
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}


export default function AdminDonationsPage() {
  const { data: currentSettings } = useDoc<DonationSettings>('settings/donations');
  const goal = currentSettings?.monthlyGoal || 0;
  const current = currentSettings?.currentAmount || 0;
  const percentage = goal > 0 ? Math.min(Math.round((current / goal) * 100), 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-headline flex items-center gap-2">
            <Heart className="text-red-500 fill-red-500 animate-pulse-subtle" />
            <span>إدارة التبرعات والأوقاف</span>
        </CardTitle>
        <CardDescription>
            تحكم في إعدادات التبرع، تابع سجل الإسهامات، ونظّم توزيع مصارف الوقف.
        </CardDescription>

        {goal > 0 && (
          <div className="mt-6 p-5 bg-zinc-950/40 border border-white/10 rounded-2xl space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-400 font-bold">الهدف الشهري لتمويل المنصة والكتب:</span>
              <span className="font-bold text-white">
                {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(current)} من {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(goal)}
              </span>
            </div>
            <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden relative shadow-inner">
              <div
                className="bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 h-full rounded-full transition-all duration-1000"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-xs text-zinc-500">
              <span>نسبة تحقيق الهدف: {percentage}%</span>
              <span>متبقي: {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(Math.max(goal - current, 0))}</span>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="settings" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="settings"><Settings className="me-2 h-4 w-4" />الإعدادات والتوزيع</TabsTrigger>
                <TabsTrigger value="donations"><List className="me-2 h-4 w-4" />سجل التبرعات وشرفية الداعمين</TabsTrigger>
            </TabsList>
            <TabsContent value="settings" className="mt-6">
                <SettingsTab />
            </TabsContent>
            <TabsContent value="donations" className="mt-6">
                <DonationsListTab />
            </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
