

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
import { useState, useEffect } from "react";
import { useFirestore, useStorage } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import type { Channel } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { updateDocumentNonBlocking, addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

interface ChannelFormProps {
    item?: Channel | null;
    onFormClose: () => void;
    initialYoutubeUrl?: string;
}

interface YoutubeChannelInfo {
    name: string;
    description: string;
    imageUrl: string;
}

const AUTOSAVE_KEY = 'autosave_channel_form';

export function ChannelForm({ item, onFormClose, initialYoutubeUrl }: ChannelFormProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const storage = useStorage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const isEditMode = !!item;

  const [name, setName] = useState(item?.name || "");
  const [description, setDescription] = useState(item?.description || "");
  const [youtubeUrl, setYoutubeUrl] = useState(item?.youtubeUrl || "");
  const [rssFeedUrl, setRssFeedUrl] = useState(item?.rssFeedUrl || "");
  const [imagePreview, setImagePreview] = useState<string | null>(item?.imageUrl || null);
  
  useEffect(() => {
    if (!isEditMode) {
      const savedDataJSON = localStorage.getItem(AUTOSAVE_KEY);
      if (savedDataJSON) {
        try {
          const savedData = JSON.parse(savedDataJSON);
          setName(savedData.name || "");
          setDescription(savedData.description || "");
          setYoutubeUrl(savedData.youtubeUrl || "");
          setRssFeedUrl(savedData.rssFeedUrl || "");
          setImagePreview(savedData.imagePreview || null);
        } catch (e) {
          console.error("Failed to parse autosaved channel data", e);
          localStorage.removeItem(AUTOSAVE_KEY);
        }
      } else if (initialYoutubeUrl) {
        if (initialYoutubeUrl.includes('.xml') || initialYoutubeUrl.includes('rss') || initialYoutubeUrl.includes('feed')) {
             setRssFeedUrl(initialYoutubeUrl);
             setYoutubeUrl('');
        } else {
             setYoutubeUrl(initialYoutubeUrl);
             setRssFeedUrl('');
             handleFetchFromYoutube(initialYoutubeUrl);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, initialYoutubeUrl]);

  useEffect(() => {
    if (!isEditMode) {
      const dataToSave = { name, description, youtubeUrl, rssFeedUrl, imagePreview };
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(dataToSave));
    }
  }, [isEditMode, name, description, youtubeUrl, rssFeedUrl, imagePreview]);

  const handleClose = () => {
    if (!isEditMode) {
      localStorage.removeItem(AUTOSAVE_KEY);
    }
    onFormClose();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setImageFile(file);
          setImagePreview(URL.createObjectURL(file));
      }
  }

  const handleFetchFromYoutube = async (urlToFetch?: string) => {
    const finalUrl = urlToFetch || youtubeUrl;
    if (!finalUrl) {
        toast({ variant: "destructive", title: "الرجاء إدخال رابط القناة أولاً." });
        return;
    }
    setIsFetching(true);
    try {
        const response = await fetch(`${window.location.origin}/api/youtube-import`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: finalUrl, fetchChannelInfo: true }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "فشل في جلب بيانات يوتيوب.");
        }

        const data: { channelInfo?: YoutubeChannelInfo } = await response.json();
        
        if (data.channelInfo) {
            setName(data.channelInfo.name);
            setDescription(data.channelInfo.description);
            setImagePreview(data.channelInfo.imageUrl);
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firestore || !storage) return;
    setIsSubmitting(true);
    
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

        if (imageFile) {
            const imageRef = ref(storage, `channel-images/${slug}/${imageFile.name}`);
            const snapshot = await uploadBytes(imageRef, imageFile);
            finalImageUrl = await getDownloadURL(snapshot.ref);
        } else if (imagePreview) {
            finalImageUrl = imagePreview;
        }

        const itemData: Omit<Channel, 'id'> = {
            name,
            slug,
            description,
            youtubeUrl,
            rssFeedUrl,
            imageUrl: finalImageUrl,
            imageId: item?.imageId || `channel-${slug}`,
            followerCount: item?.followerCount || 0,
        };
        

        if (isEditMode && item) {
          const itemRef = doc(firestore, 'channels', item.id);
          await updateDocumentNonBlocking(itemRef, itemData);
          toast({
              title: "تم التحديث بنجاح",
              description: `تم تحديث بيانات القناة "${name}".`,
          });
        } else {
            await addDocumentNonBlocking(collection(firestore, 'channels'), itemData);
            toast({
              title: "تم الإنشاء بنجاح",
              description: `تمت إضافة القناة "${name}" الجديدة.`,
            });
        }
        handleClose();
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
          املأ الحقول أدناه لإنشاء أو تعديل قناة. يمكنك جلب البيانات تلقائيًا من يوتيوب.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                  <AvatarImage src={imagePreview || undefined} />
                  <AvatarFallback className="text-3xl">{getInitials(name)}</AvatarFallback>
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
            <Label htmlFor="youtubeUrl">رابط قناة يوتيوب</Label>
            <div className="flex gap-2">
                <Input id="youtubeUrl" name="youtubeUrl" type="url" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} required disabled={isSubmitting || isFetching} />
                <Button type="button" onClick={() => handleFetchFromYoutube()} disabled={isFetching || isSubmitting}>
                    {isFetching ? <Loader2 className="h-4 w-4 animate-spin"/> : "جلب البيانات"}
                </Button>
            </div>
          </div>
           <div>
            <Label htmlFor="rssFeedUrl">رابط بودكاست RSS (اختياري)</Label>
            <Input id="rssFeedUrl" name="rssFeedUrl" type="url" value={rssFeedUrl} onChange={(e) => setRssFeedUrl(e.target.value)} disabled={isSubmitting} />
          </div>
          <div>
            <Label htmlFor="name">اسم القناة</Label>
            <Input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} required disabled={isSubmitting} />
          </div>
          <div>
            <Label htmlFor="description">وصف القناة (اختياري)</Label>
            <Textarea id="description" name="description" value={description} onChange={(e) => setDescription(e.target.value)} disabled={isSubmitting} rows={4} />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? 'حفظ التغييرات' : 'إنشاء القناة'}
            </Button>
            <Button type="button" onClick={handleClose} variant="outline">
              إلغاء
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
