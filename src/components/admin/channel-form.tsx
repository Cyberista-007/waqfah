
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
import { useState, useRef, useEffect } from "react";
import { useCollection, useFirestore, useStorage } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import type { Channel } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { updateDocumentNonBlocking, addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { getInitials } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface ChannelFormProps {
    item?: Channel | null;
    onFormClose: () => void;
    initialYoutubeUrl?: string;
}

// Simplified Youtube Info type
interface YoutubeChannelInfo {
    name: string;
    description: string;
    imageUrl: string;
}

export function ChannelForm({ item, onFormClose, initialYoutubeUrl }: ChannelFormProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const storage = useStorage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(item?.imageUrl || null);
  
  const nameRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const youtubeUrlRef = useRef<HTMLInputElement>(null);

  const isEditMode = !!item;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setImageFile(file);
          // Create a local URL for instant preview
          setImagePreview(URL.createObjectURL(file));
      }
  }

  const handleFetchFromYoutube = async () => {
    const url = youtubeUrlRef.current?.value;
    if (!url) {
        toast({ variant: "destructive", title: "الرجاء إدخال رابط القناة أولاً." });
        return;
    }
    setIsFetching(true);
    try {
        const response = await fetch('/api/youtube-import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, fetchChannelInfo: true }), // Add flag to fetch channel details
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "فشل في جلب بيانات يوتيوب.");
        }

        const data: { channelInfo?: YoutubeChannelInfo } = await response.json();
        
        if (data.channelInfo) {
            if(nameRef.current) nameRef.current.value = data.channelInfo.name;
            if(descriptionRef.current) descriptionRef.current.value = data.channelInfo.description;
            setImagePreview(data.channelInfo.imageUrl);
            // We don't set imageFile here, we just use the URL for preview. 
            // The logic on submit will handle using the URL directly if no file is chosen.
            setImageFile(null); 
            toast({ title: "تم جلب بيانات القناة بنجاح." });
        } else {
             toast({ variant: "destructive", title: "خطأ", description: "لم يتم العثور على معلومات القناة. يرجى التحقق من الرابط." });
        }

    } catch (error: any) {
        toast({ variant: "destructive", title: "خطأ", description: error.message });
    } finally {
        setIsFetching(false);
    }
  }

  useEffect(() => {
    if (initialYoutubeUrl && youtubeUrlRef.current) {
        youtubeUrlRef.current.value = initialYoutubeUrl;
        handleFetchFromYoutube();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialYoutubeUrl]);


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firestore || !storage) return;
    setIsSubmitting(true);

    const name = nameRef.current?.value || "";
    const description = descriptionRef.current?.value || "";
    const youtubeUrl = youtubeUrlRef.current?.value || "";
    
    if (!name || !youtubeUrl) {
        toast({
            variant: "destructive",
            title: "خطأ",
            description: "يرجى ملء جميع الحقول المطلوبة.",
        });
        setIsSubmitting(false);
        return;
    }
    
    const slug = name.trim().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\u0600-\u06FF-]/g, '');

    try {
        let finalImageUrl = item?.imageUrl || '';

        // If a file was manually selected, it takes precedence and is uploaded.
        if (imageFile) {
            const imageRef = ref(storage, `channel-images/${slug}/${imageFile.name}`);
            const snapshot = await uploadBytes(imageRef, imageFile);
            finalImageUrl = await getDownloadURL(snapshot.ref);
        } 
        // If there's a preview URL (from YouTube or a previous upload) and no new file was selected.
        else if (imagePreview) {
            finalImageUrl = imagePreview;
        }

        const itemData: Omit<Channel, 'id'> = {
            name,
            slug,
            description,
            youtubeUrl,
            imageUrl: finalImageUrl,
            imageId: item?.imageId || `channel-${slug}`,
            followerCount: item?.followerCount || 0,
        };
        

        if (isEditMode && item) {
          const itemRef = doc(firestore, 'channels', item.id);
          await updateDocumentNonBlocking(itemRef, itemData);
          toast({
              title: "تم التحديث بنجاح",
              description: `تم تحديث بيانات البرنامج "${name}".`,
          });
        } else {
            // Using addDocumentNonBlocking for creation
            await addDocumentNonBlocking(collection(firestore, 'channels'), itemData);
            toast({
              title: "تم الإنشاء بنجاح",
              description: `تمت إضافة البرنامج "${name}" الجديد.`,
            });
        }
        onFormClose();
    } catch(e) {
        console.error("Error submitting channel form: ", e);
         toast({
            variant: "destructive",
            title: "خطأ",
            description: "فشل حفظ بيانات البرنامج.",
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">{isEditMode ? `تعديل البرنامج: ${item?.name}` : 'إضافة برنامج جديد'}</CardTitle>
        <CardDescription>
          املأ الحقول أدناه لإنشاء أو تعديل برنامج. يمكنك جلب البيانات تلقائيًا من يوتيوب.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                  <AvatarImage src={imagePreview || undefined} />
                  <AvatarFallback className="text-3xl">{getInitials(item?.name || nameRef.current?.value)}</AvatarFallback>
              </Avatar>
              <div>
                <Label htmlFor="image">صورة البرنامج</Label>
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
            <Label htmlFor="youtubeUrl">رابط قناة يوتيوب</Label>
            <div className="flex gap-2">
                <Input id="youtubeUrl" name="youtubeUrl" type="url" defaultValue={item?.youtubeUrl} required disabled={isSubmitting || isFetching} ref={youtubeUrlRef} />
                <Button type="button" onClick={handleFetchFromYoutube} disabled={isFetching || isSubmitting}>
                    {isFetching ? <Loader2 className="h-4 w-4 animate-spin"/> : "جلب البيانات"}
                </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="name">اسم البرنامج</Label>
            <Input id="name" name="name" defaultValue={item?.name} required disabled={isSubmitting} ref={nameRef} />
          </div>
          <div>
            <Label htmlFor="description">وصف البرنامج (اختياري)</Label>
            <Textarea id="description" name="description" defaultValue={item?.description} disabled={isSubmitting} rows={4} ref={descriptionRef}/>
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
