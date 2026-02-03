

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
import { useFirestore, useStorage } from "@/firebase";
import { collection, doc, Timestamp, runTransaction, increment } from "firebase/firestore";
import type { Program } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { updateDocumentNonBlocking, addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { getInitials } from "@/lib/utils";

interface ProgramFormProps {
    program?: Program | null;
    onFormClose: () => void;
    initialYoutubeUrl?: string;
}

interface YoutubeProgramInfo {
    name: string;
    description: string;
    imageUrl: string;
}

export function ProgramForm({ program, onFormClose, initialYoutubeUrl }: ProgramFormProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const storage = useStorage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(program?.imageUrl || null);
  
  const nameRef = useRef<HTMLInputElement>(null);
  const bioRef = useRef<HTMLTextAreaElement>(null);
  const youtubeUrlRef = useRef<HTMLInputElement>(null);

  const isEditMode = !!program;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setImageFile(file);
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
        const response = await fetch(`${window.location.origin}/api/youtube-import`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, fetchChannelInfo: true }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "فشل في جلب بيانات يوتيوب.");
        }

        const data: { channelInfo?: YoutubeProgramInfo } = await response.json();
        
        if (data.channelInfo) {
            if(nameRef.current) nameRef.current.value = data.channelInfo.name;
            if(bioRef.current) bioRef.current.value = data.channelInfo.description;
            setImagePreview(data.channelInfo.imageUrl);
            setImageFile(null); 
            toast({ title: "تم جلب بيانات البرنامج بنجاح." });
        } else {
             toast({ variant: "destructive", title: "خطأ", description: "لم يتم العثور على معلومات البرنامج. يرجى التحقق من الرابط." });
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
    const bio = bioRef.current?.value || "";
    const youtubeUrl = youtubeUrlRef.current?.value || "";
    
    if (!name) {
        toast({
            variant: "destructive",
            title: "خطأ",
            description: "اسم البرنامج حقل مطلوب.",
        });
        setIsSubmitting(false);
        return;
    }
    
    const slug = name.trim().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\u0600-\u06FF-]/g, '');

    try {
        let finalImageUrl = program?.imageUrl || '';

        if (imageFile) {
            const imageRef = ref(storage, `program-images/${slug}/${imageFile.name}`);
            const snapshot = await uploadBytes(imageRef, imageFile);
            finalImageUrl = await getDownloadURL(snapshot.ref);
        } else if (imagePreview) {
            finalImageUrl = imagePreview;
        }

        const programData = {
            name,
            slug,
            bio,
            youtubeUrl,
            imageUrl: finalImageUrl,
            imageId: program?.imageId || `program-${slug}`,
        };

        if (isEditMode && program) {
          const programRef = doc(firestore, 'programs', program.id);
          await updateDocumentNonBlocking(programRef, programData);
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
          املأ الحقول أدناه لإنشاء أو تعديل برنامج. يمكنك جلب البيانات تلقائيًا من يوتيوب.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                  <AvatarImage src={imagePreview || undefined} />
                  <AvatarFallback className="text-3xl">{getInitials(program?.name || nameRef.current?.value)}</AvatarFallback>
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
            <Label htmlFor="youtubeUrl">رابط قناة يوتيوب (اختياري)</Label>
            <div className="flex gap-2">
                <Input id="youtubeUrl" name="youtubeUrl" type="url" defaultValue={program?.youtubeUrl} disabled={isSubmitting || isFetching} ref={youtubeUrlRef} />
                <Button type="button" onClick={handleFetchFromYoutube} disabled={isFetching || isSubmitting}>
                    {isFetching ? <Loader2 className="h-4 w-4 animate-spin"/> : "جلب البيانات"}
                </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="name">اسم البرنامج</Label>
            <Input id="name" name="name" defaultValue={program?.name} required disabled={isSubmitting} ref={nameRef} />
          </div>
          <div>
            <Label htmlFor="bio">نبذة تعريفية</Label>
            <Textarea id="bio" name="bio" defaultValue={program?.bio} required disabled={isSubmitting} rows={4} ref={bioRef} />
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
