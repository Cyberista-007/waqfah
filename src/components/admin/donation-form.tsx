
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useFirestore } from "@/firebase";
import { collection, doc, runTransaction, increment, Timestamp } from "firebase/firestore";
import type { Donation, UserProfile } from "@/lib/types";
import { Loader2, Calendar as CalendarIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface DonationFormProps {
    item?: Donation | null;
    onFormClose: () => void;
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

export function DonationForm({ item, onFormClose }: DonationFormProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isEditMode = !!item;

  const [donorName, setDonorName] = useState(item?.donorName || "");
  const [amount, setAmount] = useState<number>(item?.amount || 0);
  const [userId, setUserId] = useState<string>(item?.userId || "");
  const [donatedAt, setDonatedAt] = useState<Date | undefined>(toDate(item?.donatedAt) || new Date());
  const [isAnonymous, setIsAnonymous] = useState<boolean>(item?.isAnonymous || false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firestore) return;
    setIsSubmitting(true);

    if (!donorName || !donatedAt) {
        toast({
            variant: "destructive",
            title: "خطأ",
            description: "يرجى ملء اسم المتبرع وتاريخ التبرع.",
        });
        setIsSubmitting(false);
        return;
    }
    
    const tierThresholds = { gold: 5000, silver: 2500, bronze: 500 };

    try {
      await runTransaction(firestore, async (transaction) => {
        const donationRef = isEditMode ? doc(firestore, 'donations', item.id) : doc(collection(firestore, 'donations'));
        
        const donationData = {
            donorName,
            amount: Number(amount),
            userId: userId || null,
            isAnonymous,
            donatedAt: Timestamp.fromDate(donatedAt),
        };
        
        transaction.set(donationRef, donationData);
        
        if (userId) {
          const userRef = doc(firestore, 'users', userId);
          const userSnap = await transaction.get(userRef);
          if (!userSnap.exists()) {
            throw new Error(`لم يتم العثور على مستخدم بالمعرف: ${userId}`);
          }
          
          const userProfile = userSnap.data() as UserProfile;
          const oldAmountForUser = isEditMode && item.userId === userId ? item.amount || 0 : 0;
          const newTotalDonated = (userProfile.totalDonated || 0) - oldAmountForUser + Number(amount);
          
          let newTier = userProfile.donationTier;
          if (newTotalDonated >= tierThresholds.gold) newTier = 'gold';
          else if (newTotalDonated >= tierThresholds.silver) newTier = 'silver';
          else if (newTotalDonated >= tierThresholds.bronze) newTier = 'bronze';
          else newTier = undefined; // No tier
          
          transaction.update(userRef, {
            totalDonated: newTotalDonated,
            donationTier: newTier,
          });
        }
        
        // Handle case where user is removed from a donation
        if (isEditMode && item.userId && item.userId !== userId) {
            const oldUserRef = doc(firestore, 'users', item.userId);
            // This could be made more robust by re-calculating the old user's total, but for now we just decrement.
             transaction.update(oldUserRef, {
                totalDonated: increment(-(item.amount || 0)),
             });
        }
        
        const settingsRef = doc(firestore, 'settings', 'donations');
        const oldAmountForStats = isEditMode ? item.amount || 0 : 0;
        transaction.set(settingsRef, { currentAmount: increment(Number(amount) - oldAmountForStats) }, { merge: true });
      });

      toast({
        title: isEditMode ? "تم تحديث التبرع" : "تمت إضافة التبرع",
      });
      onFormClose();

    } catch (error: any) {
        console.error("Error submitting donation:", error);
        toast({ variant: 'destructive', title: "حدث خطأ", description: error.message });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">{isEditMode ? `تعديل التبرع` : 'إضافة تبرع جديد'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <Label htmlFor="donorName">اسم المتبرع</Label>
                <Input id="donorName" value={donorName} onChange={e => setDonorName(e.target.value)} required disabled={isSubmitting} />
             </div>
             <div>
                <Label htmlFor="amount">المبلغ (بالجنيه المصري)</Label>
                <Input id="amount" type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} disabled={isSubmitting} />
             </div>
          </div>
           <div>
            <Label htmlFor="userId">معرف المستخدم (اختياري)</Label>
            <Input id="userId" value={userId} onChange={e => setUserId(e.target.value)} disabled={isSubmitting} placeholder="لربط التبرع بمستخدم ومنحه شارة" />
          </div>
          <div>
            <Label>تاريخ التبرع</Label>
            <Popover>
                <PopoverTrigger asChild>
                <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !donatedAt && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {donatedAt ? format(donatedAt, "PPP") : <span>اختر تاريخاً</span>}
                </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={donatedAt} onSelect={setDonatedAt} initialFocus /></PopoverContent>
            </Popover>
          </div>
           <div className="flex items-center space-x-2 space-x-reverse">
             <Switch id="is-anonymous" checked={isAnonymous} onCheckedChange={setIsAnonymous} />
             <Label htmlFor="is-anonymous">إخفاء الاسم من جدار الداعمين</Label>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? 'حفظ التغييرات' : 'إضافة التبرع'}
            </Button>
            <Button type="button" onClick={onFormClose} variant="outline">إلغاء</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
