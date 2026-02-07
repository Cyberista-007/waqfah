
'use client';

import { useState } from 'react';
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
import { doc, setDoc } from 'firebase/firestore';
import { Loader2, Heart, Edit, Trash2, PlusCircle, Settings, List } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DonationForm } from '@/components/admin/donation-form';
import { DeleteConfirmationDialog } from '@/components/admin/delete-dialog';
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { format } from 'date-fns';

function SettingsTab() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { data: currentSettings, isLoading } = useDoc<DonationSettings>('settings/donations');

  const [monthlyGoal, setMonthlyGoal] = useState(0);
  const [currentAmount, setCurrentAmount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useState(() => {
    if (currentSettings) {
      setMonthlyGoal(currentSettings.monthlyGoal || 0);
      setCurrentAmount(currentSettings.currentAmount || 0);
    }
  });

  const handleSubmit = async () => {
    if (!firestore) {
        toast({ variant: 'destructive', title: 'خطأ في الاتصال بقاعدة البيانات.' });
        return;
    }

    setIsSubmitting(true);
    try {
        const settingsRef = doc(firestore, 'settings', 'donations');
        await setDoc(settingsRef, { monthlyGoal: Number(monthlyGoal), currentAmount: Number(currentAmount) }, { merge: true });
        toast({ title: 'تم حفظ إعدادات التبرع بنجاح!' });
    } catch (error) {
        console.error("Error saving donation settings:", error);
        toast({ variant: 'destructive', title: 'فشل حفظ الإعدادات.' });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-md">
        {isLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : (
            <>
                <div className="space-y-2">
                    <Label htmlFor="monthly-goal">الهدف الشهري ($)</Label>
                    <Input 
                        id="monthly-goal"
                        type="number"
                        value={monthlyGoal}
                        onChange={(e) => setMonthlyGoal(Number(e.target.value))}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="current-amount">المبلغ الذي تم جمعه ($)</Label>
                    <Input 
                        id="current-amount"
                        type="number"
                        value={currentAmount}
                        onChange={(e) => setCurrentAmount(Number(e.target.value))}
                    />
                </div>
                
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    حفظ الإعدادات
                </Button>
            </>
        )}
    </div>
  )
}

function DonationsListTab() {
  const { data: donations, isLoading } = useCollection<Donation>('donations', { orderBy: ['donatedAt', 'desc'] });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<Donation | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Donation | null>(null);
  const firestore = useFirestore();
  const { toast } = useToast();

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

  if (isFormOpen) {
    return <DonationForm item={itemToEdit} onFormClose={handleFormClose} />;
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={handleNew}><PlusCircle className="me-2 h-4 w-4" /> إضافة تبرع جديد</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>اسم المتبرع</TableHead>
            <TableHead>المبلغ</TableHead>
            <TableHead>التاريخ</TableHead>
            <TableHead>مجهول</TableHead>
            <TableHead>إجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow><TableCell colSpan={5} className="text-center"><Loader2 className="animate-spin mx-auto" /></TableCell></TableRow>
          ) : (
            donations?.map(d => (
              <TableRow key={d.id}>
                <TableCell>{d.donorName}</TableCell>
                <TableCell>${d.amount || 'N/A'}</TableCell>
                <TableCell>{d.donatedAt ? format(d.donatedAt.toDate(), 'yyyy/MM/dd') : '-'}</TableCell>
                <TableCell>{d.isAnonymous ? 'نعم' : 'لا'}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
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
    </>
  );
}


export default function AdminDonationsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-headline flex items-center gap-2">
            <Heart />
            إدارة التبرعات
        </CardTitle>
        <CardDescription>
            تحكم في إعدادات التبرع وسجل التبرعات.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="settings" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="settings"><Settings className="me-2 h-4 w-4" />الإعدادات</TabsTrigger>
                <TabsTrigger value="donations"><List className="me-2 h-4 w-4" />سجل التبرعات</TabsTrigger>
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
