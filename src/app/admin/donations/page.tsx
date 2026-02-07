
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useDoc, useFirestore } from '@/firebase';
import type { DonationSettings } from '@/lib/types';
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Heart } from 'lucide-react';

export default function AdminDonationsPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { data: currentSettings, isLoading } = useDoc<DonationSettings>('settings/donations');

  const [monthlyGoal, setMonthlyGoal] = useState(0);
  const [currentAmount, setCurrentAmount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentSettings) {
      setMonthlyGoal(currentSettings.monthlyGoal || 0);
      setCurrentAmount(currentSettings.currentAmount || 0);
    }
  }, [currentSettings]);

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
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-headline flex items-center gap-2">
            <Heart />
            إدارة التبرعات
        </CardTitle>
        <CardDescription>
            تحكم في هدف التبرعات الشهري والمبلغ الذي تم جمعه لعرضه في صفحة الدعم.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : (
            <div className="space-y-6 max-w-md">
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
            </div>
        )}
      </CardContent>
    </Card>
  );
}
