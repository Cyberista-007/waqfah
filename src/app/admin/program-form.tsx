
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
import { useFirestore, useStorage, useCollection } from "@/firebase";
import { collection, doc, Timestamp, runTransaction, increment, updateDoc } from "firebase/firestore";
import type { Program, Lecture } from "@/lib/types";
import { Loader2, Upload } from "lucide-react";
import { updateDocumentNonBlocking, addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { ToastAction } from "@/components/ui/toast";
import Link from "next/link";
import { useRouter } from "next/navigation";


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

const AUTOSAVE_KEY = 'autosave_program_form';

export function ProgramForm({ program, onFormClose, initialYoutubeUrl }: ProgramFormProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const storage = useStorage();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const { data: allLectures, isLoading: lecturesLoading } = useCollection<Lecture>('lectures');
  const isEditMode = !!program;

  const [name, setName] = useState(program?.name ?? "");
  const [bio, setBio] = useState(program?.bio ?? "");
  const [youtubeUrl, setYoutubeUrl] = useState(program?.youtubeUrl ?? "");
  const [rssFeedUrl, setRssFeedUrl] = useState(program?.rssFeedUrl ?? "");
  const [imagePreview, setImagePreview] = useState<string | null>(program?.imageUrl || null);
  
  useEffect(() => {
    if (!isEditMode) {
      const savedDataJSON = localStorage.getItem(AUTOSAVE_KEY);
      if (savedDataJSON) {
        try {
          const savedData = JSON.parse(savedDataJSON);
          setName(savedData.name ?? "");
          setBio(savedData.bio ?? "");
          setYoutubeUrl(savedData.youtubeUrl ?? "");
          setRssFeedUrl(savedData.rssFeedUrl ?? "");
          setImagePreview(savedData.imagePreview || null);
        } catch (e) {
          console.error("Failed to parse autosaved program data", e);
          localStorage.removeItem(AUTOSAVE_KEY);
        }
      } else if (initialYoutubeUrl) {
          if (initialYoutubeUrl.includes('.xml') || initialYoutubeUrl.includes('rss') || initialYoutubeUrl.includes('feed')) {
             setRssFeedUrl(initialYoutubeUrl);
             setYoutubeUrl(''); // Clear youtube url if it's an rss feed
        } else {
             setYoutubeUrl(initialYoutubeUrl ?? '');
             setRssFeedUrl('');
             handleFetchFromYoutube(initialYoutubeUrl);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, initialYoutubeUrl]);
  
  useEffect(() => {
    if (!isEditMode) {
      const dataToSave = { name, bio, youtubeUrl, rssFeedUrl, imagePreview };
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(dataToSave));
    }
  }, [isEditMode, name, bio, youtubeUrl, rssFeedUrl, imagePreview]);

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

        const data: { channelInfo?: YoutubeProgramInfo } = await response.json();
        
        if (data.channelInfo) {
            setName(data.channelInfo.name ?? '');
            setBio(data.channelInfo.description ?? '');
            setImagePreview(data.channelInfo.imageUrl || null);
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

  const handleSyncContent = async () => {
    if (!program || (!program.youtubeUrl && !program.rssFeedUrl) || !firestore) {
        toast({
            variant: "destructive",
            title: "لا يوجد رابط للمزامنة",
            description: `الرجاء إضافة رابط قناة يوتيوب أو RSS أولاً.`,
        });
        return;
    }
    
    if (!program.youtubeUrl) {
         toast({
            title: "ميزة استيراد RSS قيد التطوير",
            description: "يمكنك حاليًا الاستيراد من قنوات يوتيوب فقط.",
        });
        return;
    }

    setIsSyncing(true);
    toast({ title: `بدء مزامنة محتوى "${program.name}"...` });

    try {
        const response = await fetch(`${window.location.origin}/api/youtube-import`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: program.youtubeUrl, fetchChannelInfo: true }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "فشل في جلب الفيديوهات.");
        }

        const data = await response.json();
        
        let updatesApplied = false;

        if (data.channelInfo) {
            const programRef = doc(firestore, 'programs', program.id);
            const updatePayload: Partial<Program> = {};
            if (data.channelInfo.name && data.channelInfo.name !== name) updatePayload.name = data.channelInfo.name;
            if (data.channelInfo.description && data.channelInfo.description !== bio) updatePayload.bio = data.channelInfo.description;
            if (data.channelInfo.imageUrl && data.channelInfo.imageUrl !== (imagePreview || program.imageUrl)) updatePayload.imageUrl = data.channelInfo.imageUrl;
            
            if (Object.keys(updatePayload).length > 0) {
                await updateDoc(programRef, updatePayload);
                if (updatePayload.name) setName(updatePayload.name);
                if (updatePayload.bio) setBio(updatePayload.bio);
                if (updatePayload.imageUrl) setImagePreview(updatePayload.imageUrl);
                updatesApplied = true;
            }
        }

        const fetchedVideos: any[] = [...(data.videos || []), ...(data.shorts || [])];
        const lecturesForThisProgram = allLectures?.filter(l => l.programId === program.id);
        const existingYoutubeUrls = new Set(lecturesForThisProgram?.map(doc => doc.youtubeUrl));
        const newVideos = fetchedVideos.filter(v => !existingYoutubeUrls.has(`https://www.youtube.com/watch?v=${v.videoId}`));

        if (newVideos.length > 0) {
            toast({
                title: `تم العثور على ${newVideos.length} محاضرة جديدة`,
                description: 'جاري توجيهك لصفحة الاستيراد لتأكيد الإضافة.',
            });
            router.push(`/admin/lectures/import?youtubeUrl=${encodeURIComponent(program.youtubeUrl!)}`);
        } else if (updatesApplied) {
            toast({
                title: 'تم تحديث بيانات البرنامج',
                description: 'لا توجد محاضرات جديدة لاستيرادها.',
            });
        } else {
             toast({
                title: 'البرنامج محدّث',
                description: 'لا توجد محاضرات جديدة لاستيرادها وبيانات البرنامج محدثة.',
            });
        }
    } catch (error: any) {
         console.error("Error syncing program content:", error);
         toast({
            variant: "destructive",
            title: "فشلت المزامنة",
            description: error.message || "حدث خطأ غير متوقع.",
        });
    } finally {
        setIsSyncing(false);
    }
  };


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firestore || !storage) return;
    setIsSubmitting(true);

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
        let finalImageUrl = program?.imageUrl ?? '';

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
            rssFeedUrl,
            imageUrl: finalImageUrl,
            imageId: program?.imageId || `program-${slug}`,
        };

        if (isEditMode && program) {
          const programRef = doc(firestore, 'programs', program.id);
          updateDocumentNonBlocking(programRef, programData);
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
        handleClose();
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
          هذه الصفحة لإدارة البرامج (العلماء، القنوات، إلخ). يمكنك لصق رابط قناة يوتيوب أو بودكاست RSS لجلب البيانات تلقائيًا، ثم تعديلها وحفظها.
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
                <Input id="youtubeUrl" name="youtubeUrl" type="text" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} disabled={isSubmitting || isFetching} />
                <Button type="button" onClick={() => handleFetchFromYoutube()} disabled={isFetching || isSubmitting}>
                    {isFetching ? <Loader2 className="h-4 w-4 animate-spin"/> : "جلب البيانات"}
                </Button>
            </div>
             <p className="text-sm text-muted-foreground mt-1">
                مثال: https://www.youtube.com/@somehandle أو https://www.youtube.com/channel/UC...
            </p>
          </div>
           <div>
            <Label htmlFor="rssFeedUrl">رابط بودكاست RSS (اختياري)</Label>
            <Input id="rssFeedUrl" name="rssFeedUrl" type="text" value={rssFeedUrl} onChange={(e) => setRssFeedUrl(e.target.value)} disabled={isSubmitting} />
          </div>
          <div>
            <Label htmlFor="name">اسم البرنامج</Label>
            <Input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} required disabled={isSubmitting} />
          </div>
          <div>
            <Label htmlFor="bio">نبذة تعريفية</Label>
            <Textarea id="bio" name="bio" value={bio} onChange={(e) => setBio(e.target.value)} required disabled={isSubmitting} rows={4} />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? 'حفظ التغييرات' : 'إنشاء البرنامج'}
            </Button>
            {isEditMode && program && (program.youtubeUrl || program.rssFeedUrl) && (
              <Button type="button" variant="secondary" onClick={handleSyncContent} disabled={isSyncing || lecturesLoading}>
                {isSyncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                استيراد / مزامنة المحتوى
              </Button>
            )}
            <Button type="button" onClick={handleClose} variant="outline">
              إلغاء
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
