
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
import { useFirestore, useStorage } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import type { Channel } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { getInitials } from "@/lib/utils";

interface ChannelFormProps {
    item?: Channel | null;
    onFormClose: () => void;
}

export function ChannelForm({ item, onFormClose }: ChannelFormProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const storage = useStorage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(item?.imageUrl || null);
  
  const isEditMode = !!item;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setImageFile(file);
          setImagePreview(URL.createObjectURL(file));
      }
  }


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firestore || !storage) return;
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
    
    try {
        let newImageUrl = item?.imageUrl || '';

        if (imageFile) {
            const imageRef = ref(storage, `channel-images/${slug}/${imageFile.name}`);
            const snapshot = await uploadBytes(imageRef, imageFile);
            newImageUrl = await getDownloadURL(snapshot.ref);
        }

        const itemData = {
            name,
            slug,
            description,
            youtubeUrl,
            imageUrl: newImageUrl,
            imageId: item?.imageId || `channel-${slug}`, // Keep old imageId as fallback
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
    } catch(e) {
        console.error("Error submitting channel form: ", e);
         toast({
            variant: "destructive",
            title: "خطأ",
            description: "فشل حفظ بيانات القناة.",
        });
    } finally {
        setIsSubmitting(false);
    }
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
          <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                  <AvatarImage src={imagePreview || undefined} />
                  <AvatarFallback className="text-3xl">{getInitials(item?.name)}</AvatarFallback>
              </Avatar>
              <div>
                <Label htmlFor="image">صورة القناة</Label>
                <Input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isSubmitting}
                />
              </div>
          </div>
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
