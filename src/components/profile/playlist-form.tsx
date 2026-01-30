"use client";

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { collection, doc, Timestamp, serverTimestamp } from 'firebase/firestore';
import type { Playlist, Lecture } from '@/lib/types';
import { Loader2, Search } from 'lucide-react';
import { addDocumentNonBlocking, updateDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';

interface PlaylistFormProps {
  playlist?: Playlist | null;
  allLectures: Lecture[];
  onFormClose: () => void;
  userId: string;
}

export function PlaylistForm({ playlist, allLectures, onFormClose, userId }: PlaylistFormProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!playlist;

  const [selectedLectures, setSelectedLectures] = useState<string[]>(playlist?.lectureIds || []);
  const [isPublic, setIsPublic] = useState<boolean>(playlist?.isPublic || false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleCheckboxChange = (id: string, checked: boolean) => {
    setSelectedLectures(prev => checked ? [...prev, id] : prev.filter(item => item !== id));
  };
  
  const filteredLectures = allLectures.filter(lecture =>
    lecture.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firestore) return;
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    if (!name) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'يرجى إدخال اسم لقائمة التشغيل.',
      });
      setIsSubmitting(false);
      return;
    }
    
    const playlistId = isEditMode ? playlist.id : `${userId}_${Date.now()}`;

    const playlistData = {
      userId,
      name,
      description,
      lectureIds: selectedLectures,
      isPublic,
      createdAt: isEditMode ? playlist.createdAt : Timestamp.now(),
    };

    try {
      const playlistRef = doc(firestore, 'users', userId, 'playlists', playlistId);
      
      if (isEditMode) {
        await updateDocumentNonBlocking(playlistRef, playlistData);
         toast({
            title: "تم التحديث بنجاح",
            description: `تم تحديث قائمة التشغيل "${name}".`,
        });
      } else {
        await setDocumentNonBlocking(playlistRef, playlistData, {});
         toast({
            title: "تم الإنشاء بنجاح",
            description: `تمت إضافة قائمة التشغيل "${name}" الجديدة.`,
        });
      }
      onFormClose();
    } catch (error) {
      console.error('Error submitting playlist:', error);
      toast({
        variant: 'destructive',
        title: 'حدث خطأ',
        description: 'لم نتمكن من حفظ قائمة التشغيل. يرجى المحاولة مرة أخرى.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">
          {isEditMode ? `تعديل قائمة: ${playlist?.name}` : 'إنشاء قائمة تشغيل جديدة'}
        </CardTitle>
        <CardDescription>
          اختر المحاضرات التي تريد إضافتها إلى قائمتك.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <Label htmlFor="name">اسم القائمة</Label>
                <Input id="name" name="name" defaultValue={playlist?.name} required disabled={isSubmitting} />
              </div>
              <div>
                <Label htmlFor="description">وصف القائمة (اختياري)</Label>
                <Textarea id="description" name="description" defaultValue={playlist?.description} disabled={isSubmitting} />
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Switch id="is-public" checked={isPublic} onCheckedChange={setIsPublic} disabled={isSubmitting}/>
                <Label htmlFor="is-public">جعل القائمة عامة</Label>
              </div>
            </div>
            <div>
              <Label>اختر المحاضرات</Label>
               <div className="relative mb-2">
                  <Input
                      type="search"
                      placeholder="ابحث عن محاضرة..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                  />
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              <ScrollArea className="h-64 rounded-md border p-4">
                {filteredLectures.length > 0 ? (
                  filteredLectures.map(lecture => (
                    <div key={lecture.id} className="flex items-center space-x-2 space-x-reverse mb-2">
                      <Checkbox
                        id={`lecture-${lecture.id}`}
                        checked={selectedLectures.includes(lecture.id)}
                        onCheckedChange={(checked) => handleCheckboxChange(lecture.id, !!checked)}
                      />
                      <label
                        htmlFor={`lecture-${lecture.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {lecture.title}
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center">
                    {allLectures.length === 0 ? 'لا توجد محاضرات متاحة.' : 'لا توجد محاضرات تطابق بحثك.'}
                  </p>
                )}
              </ScrollArea>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? 'حفظ التغييرات' : 'إنشاء القائمة'}
            </Button>
            <Button type="button" variant="outline" onClick={onFormClose}>
              إلغاء
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
