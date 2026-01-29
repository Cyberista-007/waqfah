
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
import type { Program } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";

interface ProgramFormProps {
    program?: Program | null;
    onFormClose: () => void;
}

export function ProgramForm({ program, onFormClose }: ProgramFormProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isEditMode = !!program;

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

    const programData = {
        name,
        slug,
        bio,
        imageId: `program-${slug}`, // Placeholder
    };

    try {
        if (isEditMode && program) {
          const programRef = doc(firestore, 'programs', program.id);
          const updateData = {
              ...programData,
          };
          updateDocumentNonBlocking(programRef, updateData);
          toast({
              title: "تم التحديث بنجاح",
              description: `تم تحديث بيانات البرنامج "${name}".`,
          });
        } else {
          const addData = {
              ...programData,
              createdAt: Timestamp.now(),
              followerCount: 0,
          };
          const newProgramRef = doc(collection(firestore, 'programs'));
          const statsRef = doc(firestore, 'stats', 'global');

          await runTransaction(firestore, async (transaction) => {
              transaction.set(newProgramRef, addData);
              // Use set with merge to avoid error if doc doesn't exist
              transaction.set(statsRef, { programs: increment(1) }, { merge: true });
          });

          toast({
              title: "تم الإنشاء بنجاح",
              description: `تمت إضافة البرنامج "${name}" الجديد.`,
          });
        }
        onFormClose();
    } catch (error) {
        console.error("Error submitting program:", error);
        toast({
            variant: "destructive",
            title: "حدث خطأ",
            description: "لم نتمكن من حفظ بيانات البرنامج.",
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">{isEditMode ? `تعديل البرنامج: ${program?.name}` : 'إضافة برنامج جديد'}</CardTitle>
        <CardDescription>
          املأ الحقول أدناه لإنشاء أو تعديل برنامج.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="name">اسم البرنامج</Label>
            <Input id="name" name="name" defaultValue={program?.name} required disabled={isSubmitting} />
          </div>
          <div>
            <Label htmlFor="bio">نبذة تعريفية</Label>
            <Textarea id="bio" name="bio" defaultValue={program?.bio} required disabled={isSubmitting} rows={4} />
          </div>
           <div>
            <Label htmlFor="image">صورة البرنامج</Label>
            <Input id="image" name="image" type="file" disabled={isSubmitting}/>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? 'حفظ التغييرات' : 'إنشاء البرنامج'}
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
