
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useFirestore } from "@/firebase";
import { collection, doc, Timestamp, runTransaction, increment } from "firebase/firestore";
import type { Sheikh } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";

interface SheikhFormProps {
    sheikh?: Sheikh | null;
    onFormClose: () => void;
}

export function SheikhForm({ sheikh, onFormClose }: SheikhFormProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isEditMode = !!sheikh;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firestore) return;
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const bio = formData.get("bio") as string;
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

    if (!name || !bio) {
        toast({
            variant: "destructive",
            title: "خطأ",
            description: "يرجى ملء جميع الحقول المطلوبة.",
        });
        setIsSubmitting(false);
        return;
    }

    const sheikhData = {
        name,
        slug,
        bio,
        imageId: `sheikh-${slug}`, // Placeholder
    };

    try {
        if (isEditMode && sheikh) {
          const sheikhRef = doc(firestore, 'sheikhs', sheikh.id);
          const updateData = {
              ...sheikhData,
          };
          updateDocumentNonBlocking(sheikhRef, updateData);
          toast({
              title: "تم التحديث بنجاح",
              description: `تم تحديث بيانات الشيخ "${name}".`,
          });
        } else {
          const addData = {
              ...sheikhData,
              createdAt: Timestamp.now(),
              followerCount: 0,
          };
          const newSheikhRef = doc(collection(firestore, 'sheikhs'));
          const statsRef = doc(firestore, 'stats', 'global');

          await runTransaction(firestore, async (transaction) => {
              transaction.set(newSheikhRef, addData);
              // Use set with merge to avoid error if doc doesn't exist
              transaction.set(statsRef, { sheikhs: increment(1) }, { merge: true });
          });

          toast({
              title: "تم الإنشاء بنجاح",
              description: `تمت إضافة الشيخ "${name}" الجديد.`,
          });
        }
        onFormClose();
    } catch (error) {
        console.error("Error submitting sheikh:", error);
        toast({
            variant: "destructive",
            title: "حدث خطأ",
            description: "لم نتمكن من حفظ بيانات الشيخ.",
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">{isEditMode ? `تعديل الشيخ: ${sheikh?.name}` : 'إضافة شيخ جديد'}</CardTitle>
        <CardDescription>
          املأ الحقول أدناه لإنشاء أو تعديل شيخ.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="name">اسم الشيخ</Label>
            <Input id="name" name="name" defaultValue={sheikh?.name} required disabled={isSubmitting} />
          </div>
          <div>
            <Label htmlFor="bio">نبذة تعريفية</Label>
            <Textarea id="bio" name="bio" defaultValue={sheikh?.bio} required disabled={isSubmitting} rows={4} />
          </div>
           <div>
            <Label htmlFor="image">صورة الشيخ</Label>
            <Input id="image" name="image" type="file" disabled={isSubmitting}/>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? 'حفظ التغييرات' : 'إنشاء الشيخ'}
            </Button>
            <Button type="button" onClick={onFormClose} variant="outline">
              إلغاء
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
