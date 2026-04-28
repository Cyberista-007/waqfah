
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
import { Loader2, Search, ArrowRight, ListMusic } from 'lucide-react';
import { addDocumentNonBlocking, updateDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Video, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const [selectedProgram, setSelectedProgram] = useState("all");

  const handleCheckboxChange = (id: string, checked: boolean) => {
    setSelectedLectures(prev => checked ? [...prev, id] : prev.filter(item => item !== id));
  };
  
  const uniquePrograms = Array.from(new Set(allLectures.map(l => l.programName).filter(Boolean))) as string[];

  const filteredLectures = allLectures.filter(lecture => {
    const matchesSearch = lecture.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProgram = selectedProgram === "all" || lecture.programName === selectedProgram;
    return matchesSearch && matchesProgram;
  });
  
  const regularLectures = filteredLectures.filter(l => l.duration > 180);
  const shortsLectures = filteredLectures.filter(l => l.duration <= 180);

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
      createdAt: (isEditMode && playlist?.createdAt) ? playlist.createdAt : serverTimestamp(),
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
    <Card className="w-full max-w-3xl mx-auto bg-transparent border-0 shadow-none">
      <CardHeader className="text-center pt-8 pb-4">
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="font-headline">
                  {isEditMode ? `تعديل قائمة: ${playlist?.name}` : 'إنشاء قائمة تشغيل جديدة'}
                </CardTitle>
                <CardDescription>
                  اختر المحاضرات التي تريد إضافتها إلى قائمتك.
                </CardDescription>
            </div>
            <Button variant="outline" onClick={onFormClose}>
                <ArrowRight className="ml-2 h-4 w-4" />
                رجوع
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <Label htmlFor="name">اسم القائمة</Label>
                <Input id="name" name="name" defaultValue={playlist?.name} required className="h-14 rounded-2xl bg-white/5 border-white/10 text-lg" />
              </div>
              <div className="space-y-3">
                <Label htmlFor="description" className="text-white/60">الوصف (اختياري)</Label>
                <Textarea id="description" name="description" defaultValue={playlist?.description} className="rounded-2xl bg-white/5 border-white/10 min-h-[120px] resize-none" disabled={isSubmitting} />
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Switch id="is-public" checked={isPublic} onCheckedChange={setIsPublic} disabled={isSubmitting}/>
                <Label htmlFor="is-public">جعل القائمة عامة</Label>
              </div>
            </div>
            <div className="space-y-4">
              <Label className="text-white/80 text-lg font-black font-headline flex items-center gap-2">
                <ListMusic className="w-5 h-5 text-primary" />
                اختر المحاضرات
              </Label>
               <div className="flex flex-col md:flex-row gap-3 relative z-10">
                   <div className="relative group flex-grow">
                      <Input
                          type="search"
                          placeholder="ابحث عن محاضرة لضمها..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="h-14 pr-12 rounded-2xl bg-white/[0.02] border-white/10 text-white placeholder:text-white/30 focus:border-primary/50 focus:bg-white/[0.05] transition-all shadow-inner w-full"
                      />
                      <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30 group-focus-within:text-primary transition-colors" />
                  </div>
                  <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                      <SelectTrigger className="md:w-[280px] h-14 rounded-2xl bg-white/[0.02] border-white/10 text-white focus:ring-primary/50 transition-all shadow-inner" dir="rtl">
                          <SelectValue placeholder="تصفية بالبرنامج" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a0a0a] border-white/10 text-white rounded-xl shadow-2xl max-h-64" dir="rtl">
                          <SelectItem value="all" className="focus:bg-white/10 cursor-pointer text-right">جميع البرامج</SelectItem>
                          {uniquePrograms.map(prog => (
                              <SelectItem key={prog} value={prog} className="focus:bg-white/10 cursor-pointer text-right">{prog}</SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
               </div>
              
              <Tabs defaultValue="regular" className="w-full" dir="rtl">
                  <TabsList className="w-full h-auto bg-white/5 border border-white/10 rounded-[1rem] p-1 mb-4 flex flex-col sm:flex-row gap-1">
                      <TabsTrigger value="regular" className="flex-1 rounded-xl h-12 data-[state=active]:bg-primary data-[state=active]:text-white text-xs md:text-sm font-bold gap-2 transition-all whitespace-normal text-center">
                          <ListMusic className="w-4 h-4 shrink-0" />
                          <span>محاضرات طويلة ({regularLectures.length})</span>
                      </TabsTrigger>
                      <TabsTrigger value="shorts" className="flex-1 rounded-xl h-12 data-[state=active]:bg-primary data-[state=active]:text-white text-xs md:text-sm font-bold gap-2 transition-all whitespace-normal text-center">
                          <Video className="w-4 h-4 shrink-0" />
                          <span>مقاطع قصيرة ({shortsLectures.length})</span>
                      </TabsTrigger>
                  </TabsList>

                  <TabsContent value="regular" className="mt-0 outline-none">
                      <ScrollArea className="h-80 rounded-[1.5rem] border border-white/5 bg-[#000000]/40 p-2 shadow-inner">
                        {regularLectures.length > 0 ? (
                          <div className="space-y-2 p-1">
                            {regularLectures.map((lecture) => {
                              const isSelected = selectedLectures.includes(lecture.id);
                              return (
                                <label
                                  key={lecture.id}
                                  htmlFor={`lecture-${lecture.id}`}
                                  className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300 border ${
                                    isSelected 
                                      ? 'bg-primary/10 border-primary/30 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]' 
                                      : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10'
                                  }`}
                                >
                                  <Checkbox
                                    id={`lecture-${lecture.id}`}
                                    checked={isSelected}
                                    onCheckedChange={(checked) => handleCheckboxChange(lecture.id, !!checked)}
                                    className={isSelected ? "border-primary bg-primary text-white" : "border-white/30"}
                                  />
                                  <div className="flex flex-col flex-grow">
                                    <span className={`text-sm font-bold leading-tight ${isSelected ? 'text-primary' : 'text-white'}`}>
                                      {lecture.title}
                                    </span>
                                    {lecture.seriesTitle && (
                                      <span className="text-xs text-white/40 mt-1 font-medium">{lecture.seriesTitle}</span>
                                    )}
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-50">
                            <ListMusic className="w-8 h-8 text-white/40" />
                            <p className="text-white/60 font-medium">
                              {allLectures.length === 0 ? 'لا توجد محاضرات متاحة حالياً.' : 'لا توجد محاضرات مطولة تطابق كلمة البحث.'}
                            </p>
                          </div>
                        )}
                      </ScrollArea>
                  </TabsContent>

                  <TabsContent value="shorts" className="mt-0 outline-none">
                      <ScrollArea className="h-80 rounded-[1.5rem] border border-white/5 bg-[#000000]/40 p-2 shadow-inner">
                        {shortsLectures.length > 0 ? (
                          <div className="space-y-2 p-1">
                            {shortsLectures.map((lecture) => {
                              const isSelected = selectedLectures.includes(lecture.id);
                              return (
                                <label
                                  key={lecture.id}
                                  htmlFor={`lecture-${lecture.id}`}
                                  className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300 border ${
                                    isSelected 
                                      ? 'bg-primary/10 border-primary/30 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]' 
                                      : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10'
                                  }`}
                                >
                                  <Checkbox
                                    id={`lecture-${lecture.id}`}
                                    checked={isSelected}
                                    onCheckedChange={(checked) => handleCheckboxChange(lecture.id, !!checked)}
                                    className={isSelected ? "border-primary bg-primary text-white" : "border-white/30"}
                                  />
                                  <div className="flex flex-col flex-grow">
                                    <span className={`text-sm font-bold leading-tight ${isSelected ? 'text-primary' : 'text-white'}`}>
                                      {lecture.title}
                                    </span>
                                    {lecture.seriesTitle && (
                                      <span className="text-xs text-white/40 mt-1 font-medium">{lecture.seriesTitle}</span>
                                    )}
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-50">
                            <Video className="w-8 h-8 text-white/40" />
                            <p className="text-white/60 font-medium">
                              {allLectures.length === 0 ? 'لا توجد مقاطع متاحة حالياً.' : 'لا توجد مقاطع قصيرة تطابق كلمة البحث.'}
                            </p>
                          </div>
                        )}
                      </ScrollArea>
                  </TabsContent>
              </Tabs>
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-white/5">
            <Button type="submit" disabled={isSubmitting} className="flex-1 h-16 rounded-2xl bg-primary text-white text-lg font-black shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] hover:scale-[1.02] active:scale-95 transition-all">
              {isSubmitting && <Loader2 className="ml-3 h-6 w-6 animate-spin" />}
              {isEditMode ? 'حفظ التغييرات' : 'إنشاء القائمة'}
            </Button>
            <Button type="button" variant="outline" onClick={onFormClose} className="h-16 px-10 rounded-2xl bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white font-bold transition-all shrink-0">
              إلغاء
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
