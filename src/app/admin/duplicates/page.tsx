"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCollection, useFirestore } from "@/firebase";
import { 
  Loader2, Trash2, AlertTriangle, Check, Layers, Copy, 
  Clapperboard, Podcast, ListVideo, Calendar, Eye, Clock, CheckSquare, Square
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Lecture, Series, Program } from "@/lib/types";
import { doc, runTransaction, increment, collection, writeBatch, Timestamp, getDocs, query, where } from "firebase/firestore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getVideoIdFromUrl, normalizeArabic } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function DuplicatesManagerPage() {
  const { toast } = useToast();
  const firestore = useFirestore();

  // Load all content
  const { data: allLectures, isLoading: lecturesLoading } = useCollection<Lecture>('lectures', { orderBy: ['createdAt', 'asc'] });
  const { data: allSeries, isLoading: seriesLoading } = useCollection<Series>('series', { orderBy: ['createdAt', 'asc'] });
  const { data: allPrograms, isLoading: programsLoading } = useCollection<Program>('programs', { orderBy: ['createdAt', 'asc'] });

  const isLoading = lecturesLoading || seriesLoading || programsLoading;

  // Tabs state
  const [activeTab, setActiveTab] = useState("lectures");

  // Selected duplicate IDs to delete
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Helper: Format date
  const formatDate = (date: any) => {
    if (!date) return "غير محدد";
    try {
      const d = typeof date.toDate === 'function' 
        ? date.toDate() 
        : (typeof date.seconds === 'number' ? new Date(date.seconds * 1000) : new Date(date));
      return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return "تاريخ غير صالح";
    }
  };

  // Helper: Format duration
  const formatDurationText = (sec: number) => {
    if (!sec) return "0:00";
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // --- Duplicate Detection Logic ---

  // 1. Lecture Duplicates
  const lectureDuplicateGroups = useMemo(() => {
    if (!allLectures) return [];

    // Group by youtube Video ID, or audioSrc (if no YouTube ID)
    const groups: Record<string, Lecture[]> = {};

    allLectures.forEach(lecture => {
      let key = "";
      if (lecture.youtubeUrl) {
        const vidId = getVideoIdFromUrl(lecture.youtubeUrl);
        if (vidId) {
          key = `youtube-${vidId}`;
        }
      }
      
      if (!key && lecture.audioSrc) {
        key = `audio-${lecture.audioSrc.trim().toLowerCase()}`;
      }

      if (!key) {
        // Fallback: title normalized
        key = `title-${normalizeArabic(lecture.title).replace(/\s+/g, '')}`;
      }

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(lecture);
    });

    // Return groups that have more than 1 item, sorted so the oldest (original) is first
    return Object.entries(groups)
      .filter(([_, items]) => items.length > 1)
      .map(([key, items]) => {
        // Sort by publishedAt or createdAt ascending (oldest first)
        const sorted = [...items].sort((a, b) => {
          const timeA = (a.publishedAt || a.createdAt as any)?.seconds || 0;
          const timeB = (b.publishedAt || b.createdAt as any)?.seconds || 0;
          return timeA - timeB;
        });

        const keyType = key.startsWith("youtube-") ? "فيديو يوتيوب" : key.startsWith("audio-") ? "ملف صوتي" : "العنوان";
        const val = key.replace(/^(youtube-|audio-|title-)/, "");

        return {
          key,
          keyLabel: `${keyType}: ${val}`,
          items: sorted,
        };
      });
  }, [allLectures]);

  // 2. Series Duplicates
  const seriesDuplicateGroups = useMemo(() => {
    if (!allSeries) return [];

    const groups: Record<string, Series[]> = {};

    allSeries.forEach(series => {
      const key = normalizeArabic(series.title).trim().replace(/\s+/g, '');
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(series);
    });

    return Object.entries(groups)
      .filter(([_, items]) => items.length > 1)
      .map(([key, items]) => {
        const sorted = [...items].sort((a, b) => {
          const timeA = (a.createdAt as any)?.seconds || 0;
          const timeB = (b.createdAt as any)?.seconds || 0;
          return timeA - timeB;
        });

        return {
          key,
          keyLabel: `اسم السلسلة: ${items[0].title}`,
          items: sorted,
        };
      });
  }, [allSeries]);

  // 3. Program Duplicates
  const programDuplicateGroups = useMemo(() => {
    if (!allPrograms) return [];

    const groups: Record<string, Program[]> = {};

    allPrograms.forEach(program => {
      const key = normalizeArabic(program.name).trim().replace(/\s+/g, '');
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(program);
    });

    return Object.entries(groups)
      .filter(([_, items]) => items.length > 1)
      .map(([key, items]) => {
        const sorted = [...items].sort((a, b) => {
          const timeA = (a.createdAt as any)?.seconds || 0;
          const timeB = (b.createdAt as any)?.seconds || 0;
          return timeA - timeB;
        });

        return {
          key,
          keyLabel: `اسم البرنامج: ${items[0].name}`,
          items: sorted,
        };
      });
  }, [allPrograms]);

  // Select all recommended duplicates (all items in a group except the first one)
  const selectRecommended = () => {
    let ids: string[] = [];
    if (activeTab === "lectures") {
      lectureDuplicateGroups.forEach(g => {
        // Skip first item (original), select the rest
        g.items.slice(1).forEach(item => ids.push(item.id));
      });
    } else if (activeTab === "series") {
      seriesDuplicateGroups.forEach(g => {
        g.items.slice(1).forEach(item => ids.push(item.id));
      });
    } else if (activeTab === "programs") {
      programDuplicateGroups.forEach(g => {
        g.items.slice(1).forEach(item => ids.push(item.id));
      });
    }
    setSelectedIds(ids);
  };

  const handleSelectToggle = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (!checked) {
      setSelectedIds([]);
      return;
    }

    let ids: string[] = [];
    if (activeTab === "lectures") {
      lectureDuplicateGroups.forEach(g => g.items.forEach(item => ids.push(item.id)));
    } else if (activeTab === "series") {
      seriesDuplicateGroups.forEach(g => g.items.forEach(item => ids.push(item.id)));
    } else if (activeTab === "programs") {
      programDuplicateGroups.forEach(g => g.items.forEach(item => ids.push(item.id)));
    }
    setSelectedIds(ids);
  };

  // Perform Deletion inside Firestore Transaction
  const executeDelete = async () => {
    if (!firestore || selectedIds.length === 0) return;

    setIsDeleting(true);
    setIsConfirmOpen(false);

    try {
      if (activeTab === "lectures") {
        await runTransaction(firestore, async (transaction) => {
          const lecturesToDelete = allLectures!.filter(l => selectedIds.includes(l.id));
          const seriesUpdateCounts: Record<string, number> = {};
          
          lecturesToDelete.forEach(lecture => {
            if (lecture.seriesId) {
              if (!seriesUpdateCounts[lecture.seriesId]) {
                seriesUpdateCounts[lecture.seriesId] = 0;
              }
              seriesUpdateCounts[lecture.seriesId]--;
            }
          });

          // 1. PERFORM ALL READS FIRST
          const seriesDocMap = new Map<string, any>();
          for (const seriesId in seriesUpdateCounts) {
            const seriesRef = doc(firestore, 'series', seriesId);
            const seriesDoc = await transaction.get(seriesRef);
            if (seriesDoc.exists()) {
              seriesDocMap.set(seriesId, seriesDoc.data());
            }
          }

          const statsRef = doc(firestore, 'stats', 'global');
          const statsDoc = await transaction.get(statsRef);
          const currentStats = statsDoc.exists() ? (statsDoc.data() || {}) : {};

          // 2. PERFORM ALL WRITES SECOND
          // Update affected series lecture counts
          seriesDocMap.forEach((data, seriesId) => {
            const seriesRef = doc(firestore, 'series', seriesId);
            const currentCount = data.lectureCount || 0;
            transaction.update(seriesRef, { 
              lectureCount: Math.max(0, currentCount + seriesUpdateCounts[seriesId]) 
            });
          });

          // Update global stats
          if (statsDoc.exists()) {
            transaction.update(statsRef, {
              lectures: Math.max(0, (currentStats.lectures || 0) - lecturesToDelete.length)
            });
          }

          // Delete lecture documents
          lecturesToDelete.forEach(lecture => {
            const lRef = doc(firestore, 'lectures', lecture.id);
            transaction.delete(lRef);
          });
        });

        toast({
          title: "تم حذف المحاضرات بنجاح",
          description: `تم إزالة ${selectedIds.length} محاضرة مكررة وتعديل الإحصائيات بنجاح.`,
        });

      } else if (activeTab === "series") {
        const seriesToDelete = allSeries!.filter(s => selectedIds.includes(s.id));
        
        // 1. Fetch all lectures belonging to the selected series outside of transaction
        const lecturesToDeleteRefs: any[] = [];
        for (const series of seriesToDelete) {
          const q = query(collection(firestore, 'lectures'), where("seriesId", "==", series.id));
          const lecturesSnapshot = await getDocs(q);
          lecturesSnapshot.docs.forEach((docSnap: any) => {
            lecturesToDeleteRefs.push(docSnap.ref);
          });
        }

        // 2. Run transaction for writes
        await runTransaction(firestore, async (transaction) => {
          // Read stats first
          const statsRef = doc(firestore, 'stats', 'global');
          const statsDoc = await transaction.get(statsRef);
          const currentStats = statsDoc.exists() ? (statsDoc.data() || {}) : {};

          // Update stats
          if (statsDoc.exists()) {
            transaction.update(statsRef, {
              series: Math.max(0, (currentStats.series || 0) - seriesToDelete.length),
              lectures: Math.max(0, (currentStats.lectures || 0) - lecturesToDeleteRefs.length)
            });
          }

          // Delete lectures
          lecturesToDeleteRefs.forEach(ref => {
            transaction.delete(ref);
          });

          // Delete series
          seriesToDelete.forEach(series => {
            const sRef = doc(firestore, 'series', series.id);
            transaction.delete(sRef);
          });
        });

        toast({
          title: "تم حذف السلاسل بنجاح",
          description: `تم إزالة ${selectedIds.length} سلسلة مكررة وجميع محاضراتها المرتبطة بها.`,
        });

      } else if (activeTab === "programs") {
        // Deleting programs
        await runTransaction(firestore, async (transaction) => {
          const programsToDelete = allPrograms!.filter(p => selectedIds.includes(p.id));

          // 1. Read stats first
          const statsRef = doc(firestore, 'stats', 'global');
          const statsDoc = await transaction.get(statsRef);
          const currentStats = statsDoc.exists() ? (statsDoc.data() || {}) : {};

          // 2. Perform all writes
          if (statsDoc.exists()) {
            transaction.update(statsRef, {
              programs: Math.max(0, (currentStats.programs || 0) - programsToDelete.length)
            });
          }

          programsToDelete.forEach(program => {
            const pRef = doc(firestore, 'programs', program.id);
            transaction.delete(pRef);
          });
        });

        toast({
          title: "تم حذف البرامج بنجاح",
          description: `تم إزالة ${selectedIds.length} برنامج مكرر بنجاح.`,
        });
      }

      setSelectedIds([]);
    } catch (e: any) {
      console.error("Failed to delete duplicates:", e);
      toast({
        variant: "destructive",
        title: "فشل الحذف المجمع",
        description: "حدث خطأ غير متوقع أثناء إزالة العناصر المكررة.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const currentGroups = useMemo(() => {
    if (activeTab === "lectures") return lectureDuplicateGroups;
    if (activeTab === "series") return seriesDuplicateGroups;
    return programDuplicateGroups;
  }, [activeTab, lectureDuplicateGroups, seriesDuplicateGroups, programDuplicateGroups]);

  const totalDuplicatesCount = useMemo(() => {
    let sum = 0;
    currentGroups.forEach(g => {
      // Duplicates count is total items in group minus 1 (the original)
      sum += g.items.length - 1;
    });
    return sum;
  }, [currentGroups]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black font-headline tracking-tight text-white flex items-center gap-3">
            <Copy className="h-8 w-8 text-primary" />
            إدارة العناصر المكررة
          </h1>
          <p className="text-muted-foreground mt-1.5 text-base">
            ابحث عن الفيديوهات، السلاسل، والبرامج المكررة في قاعدة البيانات وقم بتنظيفها بضغطة زر.
          </p>
        </div>

        {!isLoading && totalDuplicatesCount > 0 && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={selectRecommended} className="rounded-xl border-white/10 hover:bg-white/5">
              تحديد التوصيات الحذفية
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => setIsConfirmOpen(true)} 
              disabled={selectedIds.length === 0 || isDeleting}
              className="rounded-xl shadow-lg shadow-destructive/20"
            >
              <Trash2 className="ml-2 h-4 w-4" />
              حذف المكرر المحدد ({selectedIds.length})
            </Button>
          </div>
        )}
      </div>

      {/* Duplicate Count Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#0c0c0e]/40 border-white/5 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">محاضرات وشورتس مكررة</CardTitle>
            <Clapperboard className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : lectureDuplicateGroups.reduce((acc, g) => acc + (g.items.length - 1), 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">بناءً على رابط يوتيوب، الملف الصوتي أو تطابق العنوان</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0c0c0e]/40 border-white/5 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">سلاسل وقوائم تشغيل مكررة</CardTitle>
            <ListVideo className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : seriesDuplicateGroups.reduce((acc, g) => acc + (g.items.length - 1), 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">بناءً على تطابق العنوان</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0c0c0e]/40 border-white/5 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">قنوات وبرامج مكررة</CardTitle>
            <Podcast className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : programDuplicateGroups.reduce((acc, g) => acc + (g.items.length - 1), 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">بناءً على تطابق اسم القناة</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); setSelectedIds([]); }} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-[#0c0c0e]/60 border border-white/5 p-1 rounded-2xl h-14">
          <TabsTrigger value="lectures" className="rounded-xl text-base data-[state=active]:bg-primary data-[state=active]:text-white">
            <Clapperboard className="ml-2 h-4 w-4" />
            المحاضرات ({lectureDuplicateGroups.length} مجموعة)
          </TabsTrigger>
          <TabsTrigger value="series" className="rounded-xl text-base data-[state=active]:bg-primary data-[state=active]:text-white">
            <ListVideo className="ml-2 h-4 w-4" />
            السلاسل ({seriesDuplicateGroups.length} مجموعة)
          </TabsTrigger>
          <TabsTrigger value="programs" className="rounded-xl text-base data-[state=active]:bg-primary data-[state=active]:text-white">
            <Podcast className="ml-2 h-4 w-4" />
            البرامج ({programDuplicateGroups.length} مجموعة)
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-muted-foreground">جاري جلب وفحص البيانات والكشف عن التكرار...</p>
            </div>
          ) : currentGroups.length === 0 ? (
            <Card className="bg-[#0c0c0e]/30 border-white/5 rounded-3xl py-16 text-center backdrop-blur-md">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white">البيانات سليمة تماماً!</h3>
              <p className="text-muted-foreground mt-1">لم يتم العثور على أي عناصر مكررة في هذا التبويب.</p>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Batch Actions row inside list */}
              <div className="flex items-center justify-between bg-[#0c0c0e]/40 border border-white/5 p-4 rounded-2xl backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      const allCurrentIds: string[] = [];
                      currentGroups.forEach(g => g.items.forEach(item => allCurrentIds.push(item.id)));
                      const isAll = allCurrentIds.every(id => selectedIds.includes(id));
                      handleSelectAll(!isAll);
                    }}
                    className="p-2 hover:bg-white/5 rounded-xl h-10 w-10 text-muted-foreground hover:text-foreground"
                    title="تحديد الكل"
                  >
                    {currentGroups.every(g => g.items.every(item => selectedIds.includes(item.id))) ? (
                      <CheckSquare className="h-6 w-6 text-primary" />
                    ) : (
                      <Square className="h-6 w-6" />
                    )}
                  </Button>
                  <span className="text-sm font-medium text-white/80">تحديد كل النسخ</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  تم تحديد <span className="text-primary font-bold">{selectedIds.length}</span> نسخة للحذف من أصل <span className="text-white font-bold">{totalDuplicatesCount}</span> نسخة مكررة.
                </div>
              </div>

              {/* Groups listing */}
              {currentGroups.map((group) => (
                <div key={group.key} className="border border-white/5 rounded-3xl bg-[#0c0c0e]/20 overflow-hidden shadow-2xl backdrop-blur-xl">
                  {/* Group Header */}
                  <div className="bg-white/[0.02] border-b border-white/5 p-4 md:px-6 flex justify-between items-center">
                    <span className="text-sm font-semibold text-primary font-mono tracking-tight dir-ltr text-right max-w-[80%] truncate">
                      {group.keyLabel}
                    </span>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border border-primary/20 rounded-lg text-xs py-1 px-2.5">
                      {group.items.length} نسخ مكررة
                    </Badge>
                  </div>

                  {/* Group Items */}
                  <div className="divide-y divide-white/5">
                    {group.items.map((item, index) => {
                      const isOriginal = index === 0;
                      const isSelected = selectedIds.includes(item.id);

                      return (
                        <div 
                          key={item.id} 
                          className={`p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-300 ${isOriginal ? 'bg-primary/[0.01]' : isSelected ? 'bg-destructive/5' : 'hover:bg-white/[0.01]'}`}
                        >
                          <div className="flex items-start gap-4 flex-grow max-w-[85%]">
                            {/* Checkbox for duplicate copy */}
                            {!isOriginal && (
                              <button
                                onClick={() => handleSelectToggle(item.id)}
                                className="mt-1 shrink-0 p-1 hover:bg-white/5 rounded-lg text-muted-foreground hover:text-foreground transition-all"
                              >
                                {isSelected ? (
                                  <CheckSquare className="h-5 w-5 text-destructive" />
                                ) : (
                                  <Square className="h-5 w-5 text-white/20" />
                                )}
                              </button>
                            )}

                            {/* Info */}
                            <div className="space-y-1.5 min-w-0">
                              <h4 className="font-bold text-lg text-white leading-tight truncate">
                                {activeTab === "lectures" ? (item as Lecture).title : activeTab === "series" ? (item as Series).title : (item as Program).name}
                              </h4>
                              
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground font-medium">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3.5 w-3.5 text-primary" />
                                  <span>تاريخ الإضافة: {formatDate(item.createdAt)}</span>
                                </div>

                                {activeTab === "lectures" && (
                                  <>
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3.5 w-3.5 text-primary" />
                                      <span>المدة: {formatDurationText((item as Lecture).duration)}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Eye className="h-3.5 w-3.5 text-primary" />
                                      <span>المشاهدات: {(item as Lecture).youtubeViewCount || (item as Lecture).viewCount || 0}</span>
                                    </div>
                                    {(item as Lecture).programName && (
                                      <Badge variant="outline" className="border-white/10 text-white/60 bg-white/[0.01] rounded-md text-[10px]">
                                        {(item as Lecture).programName}
                                      </Badge>
                                    )}
                                  </>
                                )}

                                <span className="font-mono text-white/30 text-[10px]">ID: {item.id}</span>
                              </div>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div className="shrink-0 self-end md:self-center">
                            {isOriginal ? (
                              <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl px-3 py-1 font-bold text-xs">
                                النسخة المعتمدة (الأقدم)
                              </Badge>
                            ) : (
                              <Badge variant="outline" className={`${isSelected ? 'border-destructive/30 text-destructive bg-destructive/5' : 'border-white/10 text-white/50 bg-white/5'} rounded-xl px-3 py-1 text-xs font-semibold`}>
                                {isSelected ? "محددة للحذف" : "نسخة مكررة إضافية"}
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Tabs>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="bg-[#0b0b0d] border border-white/10 rounded-3xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-headline text-white flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-destructive animate-bounce" />
              تأكيد حذف المكرر المجمع
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm leading-relaxed mt-2 text-right">
              {activeTab === "lectures" && `أنت على وشك حذف ${selectedIds.length} محاضرة مكررة بشكل نهائي. سيتم تلقائياً تحديث إحصائيات البرامج والسلاسل المرتبطة بها لضمان دقة البيانات بالمنصة.`}
              {activeTab === "series" && `تحذير: أنت على وشك حذف ${selectedIds.length} سلسلة مكررة بشكل نهائي. سيؤدي هذا الإجراء أيضاً لحذف كافة المحاضرات والمقاطع المرتبطة بهذه السلاسل وتعديل إحصائيات الموقع.`}
              {activeTab === "programs" && `أنت على وشك حذف ${selectedIds.length} برنامج مكرر بشكل نهائي. تأكد من أن هذه البرامج لا تحتوي على سلاسل أو محاضرات تود الاحتفاظ بها.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 mt-4 justify-end">
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)} className="rounded-xl border-white/10 hover:bg-white/5">
              إلغاء
            </Button>
            <Button variant="destructive" onClick={executeDelete} disabled={isDeleting} className="rounded-xl shadow-lg shadow-destructive/20">
              {isDeleting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              تأكيد وحذف نهائي
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
