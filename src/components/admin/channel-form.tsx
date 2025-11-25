
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
import { collection, doc } from "firebase/firestore";
import type { Channel } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";

interface ChannelFormProps {
    item?: Channel | null;
    onFormClose: () => void;
}

export function ChannelForm({ item, onFormClose }: ChannelFormProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isEditMode = !!item;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firestore) return;
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const youtubeUrl = formData.get("youtubeUrl") as string;
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

    if (!name || !youtubeUrl) {
        toast({
            variant: "destructive",
            title: "خطأ",
            description: "يرجى ملء جميع الحقول المطلوبة.",
        });
        setIsSubmitting(false);
        return;
    }

    const itemData = {
        name,
        slug,
        description,
        youtubeUrl,
        imageId: `channel-${slug}`, // Placeholder
    };

    if (isEditMode && item) {
      const itemRef = doc(firestore, 'channels', item.id);
      updateDocumentNonBlocking(itemRef, itemData);
      toast({
          title: "تم التحديث بنجاح",
          description: `تم تحديث بيانات القناة "${name}".`,
      });
    } else {
      const collectionRef = collection(firestore, 'channels');
      addDocumentNonBlocking(collectionRef, itemData);
      toast({
          title: "تم الإنشاء بنجاح",
          description: `تمت إضافة القناة "${name}" الجديدة.`,
      });
    }
    onFormClose();
    setIsSubmitting(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">{isEditMode ? `تعديل القناة: ${item?.name}` : 'إضافة قناة جديدة'}</CardTitle>
        <CardDescription>
          املأ الحقول أدناه لإنشاء أو تعديل قناة.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="name">اسم القناة</Label>
            <Input id="name" name="name" defaultValue={item?.name} required disabled={isSubmitting} />
          </div>
          <div>
            <Label htmlFor="youtubeUrl">رابط قناة يوتيوب</Label>
            <Input id="youtubeUrl" name="youtubeUrl" type="url" defaultValue={item?.youtubeUrl} required disabled={isSubmitting} />
          </div>
          <div>
            <Label htmlFor="description">وصف القناة (اختياري)</Label>
            <Textarea id="description" name="description" defaultValue={item?.description} disabled={isSubmitting} rows={4} />
          </div>
           <div>
            <Label htmlFor="image">صورة القناة (اختياري)</Label>
            <Input id="image" name="image" type="file" disabled={isSubmitting}/>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? 'حفظ التغييرات' : 'إنشاء القناة'}
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
