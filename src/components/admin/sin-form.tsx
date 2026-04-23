"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useStorage, useCollection } from "@/firebase";
import { collection, doc, addDoc, updateDoc } from "firebase/firestore";
import type { DestructiveSin, Lecture } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Loader2, 
  MessageSquareX, 
  EyeOff, 
  Angry, 
  AlertTriangle, 
  X, 
  Plus, 
  Search, 
  Video, 
  Save, 
  BookOpen, 
  ScrollText, 
  CalendarDays, 
  Info,
  Sparkles,
  Zap,
  UploadCloud,
  CheckCircle2,
  ShieldPlus,
  ActivitySquare
} from "lucide-react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface SinFormProps {
    item?: DestructiveSin | null;
    onFormClose: () => void;
}

const ICONS = ['MessageSquareX', 'EyeOff', 'Angry', 'custom-backbiting', 'AlertTriangle'];
const ICONS_MAP = { MessageSquareX, EyeOff, Angry, AlertTriangle };

export function SinForm({ item, onFormClose }: SinFormProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const storage = useStorage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [title, setTitle] = useState(item?.title || "");
  const [dialogTitle, setDialogTitle] = useState(item?.dialogTitle || "");
  const [concept, setConcept] = useState(item?.concept || "");
  const [dailyLifeExamples, setDailyLifeExamples] = useState<string[]>(item?.dailyLifeExamples || [""]);
  const [quranVerses, setQuranVerses] = useState<string[]>(item?.quranVerses || [""]);
  const [hadiths, setHadiths] = useState<string[]>(item?.hadiths || [""]);
  const [curePlan, setCurePlan] = useState<string[]>(item?.curePlan || [""]);
  const [testQuestions, setTestQuestions] = useState<string[]>(item?.testQuestions || [""]);
  const [linkedVideoId, setLinkedVideoId] = useState(item?.linkedVideoId || "none");

  const [selectedIcon, setSelectedIcon] = useState(item?.icon && ICONS.includes(item.icon) ? item.icon : "");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(item?.icon?.startsWith('http') ? item.icon : null);

  const { data: allLectures } = useCollection<Lecture>('lectures', { orderBy: ['title', 'asc'] });

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({ variant: "destructive", title: "الملف كبير جداً", description: "يرجى اختيار صورة أقل من 2MB." });
        return;
      }
      setIconFile(file);
      setIconPreview(URL.createObjectURL(file));
      setSelectedIcon("");
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firestore || !storage) {
        toast({ variant: 'destructive', title: 'خطأ في الاتصال', description: 'لم يتم تحميل خدمات Firebase بشكل صحيح.' });
        return;
    }
    setIsSubmitting(true);

    if (!title || !dialogTitle) {
        toast({ variant: "destructive", title: "حقول مطلوبة", description: "يرجى ملء العناوين الأساسية للبطاقة." });
        setIsSubmitting(false);
        return;
    }
    
    try {
        let finalIconValue = selectedIcon;

        // Priority 1: New File Upload
        if (iconFile) {
            const fileName = `destructive_sins/${Date.now()}_${iconFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
            const imageRef = ref(storage, fileName);
            const snapshot = await uploadBytes(imageRef, iconFile);
            finalIconValue = await getDownloadURL(snapshot.ref);
        } 
        // Priority 2: Existing HTTP Preview (preserved if no new file)
        else if (iconPreview && iconPreview.startsWith('http')) { 
            finalIconValue = iconPreview;
        }

        if (!finalIconValue) {
            toast({ variant: "destructive", title: "الأيقونة مطلوبة", description: "يرجى اختيار أيقونة أو رفع صورة مخصصة." });
            setIsSubmitting(false);
            return;
        }

        const itemData = {
            title,
            dialogTitle,
            concept,
            quranVerses: quranVerses.filter(v => v.trim() !== ''),
            hadiths: hadiths.filter(h => h.trim() !== ''),
            dailyLifeExamples: dailyLifeExamples.filter(e => e.trim() !== ''),
            icon: finalIconValue,
            linkedVideoId: linkedVideoId === "none" ? null : linkedVideoId,
            curePlan: curePlan.filter(c => c.trim() !== ''),
            testQuestions: testQuestions.filter(q => q.trim() !== ''),
            updatedAt: new Date().toISOString()
        };

        if (item) {
            await updateDoc(doc(firestore, 'destructive_sins', item.id), itemData);
            toast({ title: "تم التحديث", description: `تم تحديث بطاقة "${title}" بنجاح.` });
        } else {
            await addDoc(collection(firestore, 'destructive_sins'), {
                ...itemData,
                createdAt: new Date().toISOString()
            });
            toast({ title: "تم الإنشاء", description: `تمت إضافة بطاقة "${title}" بنجاح.` });
        }
        onFormClose();
    } catch (error: any) {
        console.error("Error saving sin item:", error);
        toast({ variant: 'destructive', title: 'فشل الحفظ', description: error.message || 'حدث خطأ غير متوقع.' });
    } finally {
        setIsSubmitting(false);
    }
  };

  const getIcon = (iconName: string) => {
    if (iconName.startsWith('http')) {
      return (
        <div className="relative w-16 h-16 transform transition-transform group-hover:scale-110 duration-500">
          <Image src={iconName} alt="Preview" fill className="object-contain drop-shadow-md" unoptimized />
        </div>
      );
    }
    const IconComp = { 
        MessageSquareX, 
        EyeOff, 
        Angry, 
        AlertTriangle,
        'custom-backbiting': () => (
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><line x1="2" y1="22" x2="22" y2="2" />
            </svg>
        )
    }[iconName] || AlertTriangle;
    return <IconComp className="h-10 w-10 text-primary drop-shadow-sm" />;
  };

  return (
    <Card className="border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl overflow-hidden rounded-[3rem] animate-in fade-in zoom-in-95 duration-500 max-w-6xl mx-auto border border-white/20">
      <CardHeader className="bg-gradient-to-r from-primary/10 via-background to-background p-10 md:p-14 border-b border-primary/5">
        <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-right">
          <div className="h-24 w-24 md:h-28 md:w-28 bg-gradient-to-br from-white to-primary/5 dark:from-zinc-900 dark:to-primary/10 rounded-[2.5rem] flex items-center justify-center shadow-[0_20px_40px_-10px_rgba(var(--primary),0.2)] border border-primary/10 group overflow-hidden">
             {iconPreview || selectedIcon ? (
                getIcon(iconPreview || selectedIcon)
             ) : (
                <Zap className="h-10 w-10 text-primary/30 animate-pulse" />
             )}
          </div>
          <div className="space-y-2">
            <CardTitle className="text-4xl md:text-5xl font-black font-headline tracking-tighter italic uppercase text-primary drop-shadow-sm leading-tight">
              {item ? `تحرير المصيبة: ${item.title}` : 'تكوين مهلكة جديدة'}
            </CardTitle>
            <div className="flex items-center justify-center md:justify-start gap-2">
                 <div className="h-1 w-8 bg-primary rounded-full" />
                 <CardDescription className="text-lg font-bold opacity-60 italic tracking-widest uppercase">
                    Destructive Sin Architecture
                 </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="p-10 md:p-14 space-y-16">
          {/* Section 1: Core Identity */}
          <div className="space-y-8">
            <div className="flex items-center gap-3 text-primary/40 font-black uppercase tracking-[0.2em] text-xs">
                <span className="h-px w-8 bg-current" /> بـطاقة التعريف <span className="h-px w-full bg-current opacity-20" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="space-y-4 group">
                 <Label className="text-sm font-bold ps-2 transition-colors group-focus-within:text-primary">اسم المهلكة الشعبي</Label>
                 <Input 
                   value={title} 
                   onChange={(e) => setTitle(e.target.value)} 
                   placeholder="مثال: قطيعة الرحم" 
                   className="h-16 rounded-[1.5rem] border-2 bg-muted/20 focus:bg-background border-transparent focus:border-primary/40 transition-all font-black text-xl shadow-inner px-6"
                 />
               </div>
               <div className="space-y-4 group">
                 <Label className="text-sm font-bold ps-2 transition-colors group-focus-within:text-primary">عنوان الوعيد والتحذير</Label>
                 <Input 
                   value={dialogTitle} 
                   onChange={(e) => setDialogTitle(e.target.value)} 
                   placeholder="مثال: عاقبة قاطع الرحم" 
                   className="h-16 rounded-[1.5rem] border-2 bg-muted/20 focus:bg-background border-transparent focus:border-primary/40 transition-all font-black text-xl shadow-inner px-6"
                 />
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            {/* Left Column: Visuals & Links (4 cols) */}
            <div className="lg:col-span-4 space-y-12">
              <section className="space-y-8">
                <div className="flex items-center gap-4 text-primary font-black uppercase tracking-tighter italic text-xl">
                  <div className="p-2 bg-primary/10 rounded-xl"><Sparkles className="w-5 h-5 text-primary" /></div>
                  الهوية البصرية
                </div>
                
                <div className="space-y-8 p-8 rounded-[2.5rem] bg-muted/10 border border-black/5 dark:border-white/5 shadow-inner">
                  {/* Icon Selector Grid */}
                  <div className="grid grid-cols-4 gap-4">
                    {ICONS.map(iconName => (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => { setSelectedIcon(iconName); setIconPreview(null); setIconFile(null); }}
                        className={cn(
                          "aspect-square flex items-center justify-center rounded-[1.25rem] border-2 transition-all duration-300 hover:rotate-3 active:scale-90",
                          selectedIcon === iconName ? "bg-primary border-primary shadow-lg shadow-primary/30 text-white scale-110 z-10" : "bg-background border-transparent hover:border-primary/20 opacity-60 hover:opacity-100"
                        )}
                      >
                         {(() => {
                            if (iconName === 'custom-backbiting') {
                              return (
                                <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><line x1="2" y1="22" x2="22" y2="2" />
                                </svg>
                              );
                            }
                            const Icon = { MessageSquareX, EyeOff, Angry, AlertTriangle }[iconName as keyof typeof ICONS_MAP] || AlertTriangle;
                            return <Icon className="w-6 h-6" />;
                         })()}
                      </button>
                    ))}
                  </div>

                  <div className="relative pt-4 overflow-hidden">
                    <input type="file" id="icon-upload" className="hidden" onChange={handleIconUpload} accept="image/*" />
                    <label
                      htmlFor="icon-upload"
                      className="flex flex-col items-center justify-center p-8 min-h-[140px] rounded-[2rem] border-4 border-dashed border-primary/10 bg-primary/5 hover:bg-primary/10 hover:border-primary/30 cursor-pointer transition-all gap-4 group shadow-inner"
                    >
                      {iconPreview ? (
                        <div className="flex flex-col items-center gap-4 w-full">
                           <div className="relative h-20 w-20 border-4 border-white dark:border-zinc-800 rounded-3xl bg-white shadow-xl overflow-hidden group-hover:scale-110 transition-transform duration-500">
                              <Image src={iconPreview} alt="Preview" fill className="object-contain p-2" unoptimized />
                           </div>
                           <div className="flex items-center gap-3">
                               <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                               <span className="text-xs font-black tracking-widest text-primary/70 italic uppercase">قيد الاستخدام</span>
                               <Button 
                                 type="button" 
                                 variant="ghost" 
                                 size="icon" 
                                 className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-full" 
                                 onClick={(e) => { e.preventDefault(); setIconPreview(null); setIconFile(null); setSelectedIcon(""); }}
                               >
                                 <X className="h-4 w-4" />
                               </Button>
                           </div>
                        </div>
                      ) : (
                        <>
                          <div className="h-14 w-14 bg-primary/20 rounded-2xl flex items-center justify-center group-hover:rotate-12 group-hover:scale-110 transition-all duration-500">
                             <UploadCloud className="h-8 w-8 text-primary shadow-lg shadow-primary/20" />
                          </div>
                          <span className="font-black text-sm uppercase tracking-widest text-primary/60 italic drop-shadow-sm">استيراد أيقونة من الجهاز</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </section>

              <section className="space-y-6 pt-10 border-t border-black/5 dark:border-white/5">
                <div className="flex items-center gap-4 text-primary font-black uppercase tracking-tighter italic text-xl">
                   <div className="p-2 bg-primary/10 rounded-xl"><Video className="w-5 h-5 text-primary" /></div>
                   المحتوى المرئي
                </div>
                <div className="space-y-4 p-8 rounded-[2.5rem] bg-primary/5 border border-primary/10 group">
                  <Label className="text-xs font-black uppercase tracking-[0.2em] opacity-40 px-2">ربط بمحاضرة توضيحية (PRO)</Label>
                  <Select value={linkedVideoId} onValueChange={setLinkedVideoId}>
                    <SelectTrigger className="h-16 rounded-3xl border-2 border-transparent bg-background shadow-lg shadow-black/5 font-black text-lg focus:border-primary/40 focus:ring-0 transition-all">
                       <div className="flex items-center gap-3">
                          <SelectValue placeholder="اختر المحاضرة" />
                       </div>
                    </SelectTrigger>
                    <SelectContent className="max-h-[400px] rounded-[2rem] shadow-2xl border-primary/10 overflow-hidden">
                      <div className="p-4 sticky top-0 bg-popover/90 backdrop-blur-md z-10 border-b">
                        <div className="flex items-center gap-3 px-4 h-12 bg-muted rounded-2xl border border-black/5">
                          <Search className="w-4 h-4 opacity-40" />
                          <input placeholder="البحث في مكتبة المحاضرات..." className="bg-transparent text-sm w-full outline-none font-bold" />
                        </div>
                      </div>
                      <SelectItem value="none" className="font-black text-primary/40 italic py-4 rounded-xl cursor-pointer hover:bg-primary/5">-- بدون محاضرة مرتبطة --</SelectItem>
                      {allLectures?.map(lecture => (
                        <SelectItem key={lecture.id} value={lecture.id} className="cursor-pointer py-4 rounded-xl border-b border-black/5 last:border-0 hover:bg-primary/5">
                          <div className="flex flex-col gap-1 items-start">
                            <span className="font-black text-lg">{lecture.title}</span>
                            <span className="text-[10px] font-black opacity-30 uppercase tracking-widest">{lecture.programName || 'Uncategorized'}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-start gap-3 px-2 opacity-50">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <p className="text-[10px] font-bold leading-relaxed uppercase italic">سيتم إضافة زر تفاعلي ينقل المستخدم لصفحة المحاضرة فوراً من داخل بطاقة الذنب.</p>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column: Educational Content (8 cols) */}
            <div className="lg:col-span-8 space-y-16">
               <section className="space-y-8 p-10 md:p-14 rounded-[3.5rem] bg-gradient-to-br from-primary/5 to-transparent border border-primary/10 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.05)] relative group">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 transition-all group-hover:bg-primary/20 pointer-events-none" />
                  <div className="flex items-center gap-4 relative">
                    <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/10 shadow-lg shadow-primary/5">
                       <Info className="w-6 h-6 text-primary" />
                    </div>
                    <Label className="text-xl font-black uppercase tracking-tighter text-primary italic drop-shadow-sm">المفهوم والتعريف الـشرعي</Label>
                  </div>
                  <Textarea 
                    value={concept} 
                    onChange={(e) => setConcept(e.target.value)} 
                    placeholder="ابدأ بكتابة تعريف دقيق وشامل لهذا الذنب بأسلوب وعظي مؤثر..." 
                    className="min-h-[200px] rounded-[2.5rem] border-2 border-transparent bg-background/60 focus:bg-background focus:border-primary/20 transition-all text-2xl font-amiri leading-[3rem] p-10 shadow-inner resize-none focus:ring-0"
                  />
               </section>

               <div className="space-y-12">
                  <EducationalSection 
                    title="الوعيـد القرآني" 
                    icon={<BookOpen className="w-5 h-5" />} 
                    items={quranVerses} 
                    setItems={setQuranVerses} 
                    placeholder="أدخل آية وعيد محذرة من هذا الذنب..."
                    colorClass="text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                  />
                  
                  <EducationalSection 
                    title="هـدي النبوة" 
                    icon={<ScrollText className="w-5 h-5" />} 
                    items={hadiths} 
                    setItems={setHadiths} 
                    placeholder="أدخل حديثاً نبوياً شريفاً ينهى عن هذا الفعل..."
                    colorClass="text-amber-500 bg-amber-500/10 border-amber-500/20"
                  />

                  <EducationalSection 
                    title="صور الهلاك اليومي" 
                    icon={<CalendarDays className="w-5 h-5" />} 
                    items={dailyLifeExamples} 
                    setItems={setDailyLifeExamples} 
                    placeholder="صف صورة واقعية يقع فيها الناس في هذا المحظور..."
                    colorClass="text-indigo-500 bg-indigo-500/10 border-indigo-500/20"
                  />

                  <EducationalSection 
                    title="البروتوكول العلاجي" 
                    icon={<ShieldPlus className="w-5 h-5" />} 
                    items={curePlan} 
                    setItems={setCurePlan} 
                    placeholder="أدخل خطوة عملية للعلاج..."
                    colorClass="text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                  />

                  <EducationalSection 
                    title="مقياس التقييم الذاتي" 
                    icon={<ActivitySquare className="w-5 h-5" />} 
                    items={testQuestions} 
                    setItems={setTestQuestions} 
                    placeholder="أدخل سؤالاً للتقييم الذاتي..."
                    colorClass="text-amber-500 bg-amber-500/10 border-amber-500/20"
                  />
               </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-10 md:p-14 bg-muted/20 border-t border-black/5 dark:border-white/5 flex flex-col md:flex-row gap-6 items-center">
          <Button 
            disabled={isSubmitting} 
            type="submit" 
            className="w-full md:w-fit min-w-[280px] h-20 rounded-[2.5rem] bg-primary hover:bg-primary/90 text-white font-black text-2xl shadow-[0_25px_50px_-12px_rgba(var(--primary),0.3)] transition-all hover:-translate-y-2 hover:shadow-[0_40px_80px_-15px_rgba(var(--primary),0.4)] active:scale-95 gap-4 uppercase italic tracking-tighter"
          >
            {isSubmitting ? <Loader2 className="animate-spin h-8 w-8" /> : <Save className="h-8 w-8" />}
            {isSubmitting ? 'جاري الحفظ والتحصين...' : item ? 'تم التعديل' : 'حفظ ونشر البطاقة'}
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onFormClose} 
            className="w-full md:w-fit h-20 rounded-[2.5rem] text-muted-foreground font-black text-xl hover:bg-destructive/10 hover:text-destructive transition-all duration-300 uppercase italic opacity-60 hover:opacity-100"
          >
            إلغاء العملية
          </Button>
          <p className="ms-auto text-[10px] font-black opacity-20 uppercase tracking-[0.3em] italic text-center md:text-right">
             Wahfah Security Protocol v4.0.1 <br/> Finalizing Encryption & Distribution
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

function EducationalSection({ title, icon, items, setItems, placeholder, colorClass }: { 
  title: string; 
  icon: React.ReactNode; 
  items: string[]; 
  setItems: React.Dispatch<React.SetStateAction<string[]>>; 
  placeholder: string;
  colorClass: string;
}) {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
       <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
             <div className={cn("h-10 w-10 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:rotate-6", colorClass)}>
                {icon}
             </div>
             <h3 className="font-black uppercase tracking-[0.15em] text-sm italic opacity-70">{title}</h3>
          </div>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={() => setItems(prev => [...prev, ''])} 
            className="text-primary font-black gap-2 hover:bg-primary/10 rounded-2xl px-6 h-10 border border-primary/10 group active:scale-95"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" /> إضافة فقرة
          </Button>
       </div>
       
       <div className="space-y-6">
          {items.map((item, index) => (
            <div key={index} className="group relative flex gap-6 animate-in slide-in-from-right duration-500" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="absolute -right-3 top-0 bottom-0 w-1.5 rounded-full scale-y-0 group-focus-within:scale-y-100 group-hover:scale-y-50 transition-all origin-top bg-primary/40 duration-500" />
              <div className="flex-grow space-y-2">
                 <Textarea 
                    value={item} 
                    onChange={(e) => {
                       const newItems = [...items];
                       newItems[index] = e.target.value;
                       setItems(newItems);
                    }} 
                    placeholder={placeholder}
                    className="flex-grow rounded-3xl border-2 border-transparent bg-muted/10 hover:bg-muted/20 focus:bg-background focus:border-primary/20 transition-all p-8 font-amiri text-2xl leading-relaxed min-h-[120px] shadow-sm focus:ring-0 resize-none"
                  />
                  <div className="flex justify-between items-center px-4">
                     <span className="text-[10px] font-black opacity-20 uppercase tracking-widest italic">Snippet #{index + 1}</span>
                     {items.length > 1 && (
                        <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setItems(prev => prev.filter((_, i) => i !== index))}
                            className="text-destructive font-black text-[10px] uppercase italic hover:bg-destructive/10 rounded-lg px-3 transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <X className="w-3 h-3 me-1" /> حذف الفقرة
                        </Button>
                     )}
                  </div>
              </div>
            </div>
          ))}
          {items.length === 0 && (
             <div className="py-16 text-center rounded-[2.5rem] border-4 border-dashed border-black/5 dark:border-white/5 text-primary/10 transition-colors hover:border-primary/10">
                <Plus className="h-10 w-10 mx-auto opacity-40 mb-3" />
                <p className="font-black text-xs uppercase tracking-[0.3em] italic">No Content Added Yet</p>
             </div>
          )}
       </div>
    </div>
  );
}
