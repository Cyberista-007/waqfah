

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { DestructiveSin } from "@/lib/types";
import { useCollection, useFirestore } from "@/firebase";
import { doc, writeBatch, collection } from "firebase/firestore";
import { Loader2, Trash2, Edit, PlusCircle, AlertTriangle, Database, LayoutGrid, Info, ExternalLink } from "lucide-react";
import { DeleteConfirmationDialog } from "@/components/admin/delete-dialog";
import { SinForm } from "@/components/admin/sin-form";
import { deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import Image from "next/image";
import { destructiveSinsData } from "@/lib/sins-data";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileJson, Link2, Upload, AlertCircle, CheckCircle } from "lucide-react";

export default function AdminSinsPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { isAdmin } = useAdminAuth();
  const [itemToDelete, setItemToDelete] = useState<DestructiveSin | null>(null);
  const [itemToEdit, setItemToEdit] = useState<DestructiveSin | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Import States
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importUrl, setImportUrl] = useState("");
  const [importMode, setImportMode] = useState<"merge" | "overwrite">("merge");
  const [isImporting, setIsImporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  const { data: allItems, isLoading } = useCollection<DestructiveSin>('destructive_sins', { orderBy: ['title', 'asc'] });

  const handleDelete = async () => {
    if (!itemToDelete || !firestore) return;
    const itemRef = doc(firestore, 'destructive_sins', itemToDelete.id);
    deleteDocumentNonBlocking(itemRef);
    toast({
      variant: "destructive",
      title: "تم الحذف بنجاح",
      description: `تم حذف "${itemToDelete.title}".`,
    });
    setItemToDelete(null);
  };

  const handleNew = () => {
    setItemToEdit(null);
    setIsFormOpen(true);
  }

  const handleEdit = (item: DestructiveSin) => {
    setItemToEdit(item);
    setIsFormOpen(true);
  }

  const handleFormClose = () => {
    setIsFormOpen(false);
    setItemToEdit(null);
  }

  const validateSinsData = (data: any): data is DestructiveSin[] => {
    if (!Array.isArray(data)) return false;
    return data.every(item =>
      item &&
      typeof item === 'object' &&
      typeof item.id === 'string' &&
      typeof item.title === 'string' &&
      typeof item.dialogTitle === 'string' &&
      typeof item.icon === 'string'
    );
  };

  const handleImport = async () => {
    if (!firestore) return;
    setIsImporting(true);

    let rawData: any = null;

    try {
      if (importFile) {
        // Import from File
        const text = await importFile.text();
        rawData = JSON.parse(text);
      } else if (importUrl.trim()) {
        // Import from URL
        const response = await fetch(importUrl.trim());
        if (!response.ok) {
          throw new Error(`فشل جلب البيانات: ${response.statusText}`);
        }
        rawData = await response.json();
      } else {
        toast({
          variant: "destructive",
          title: "خطأ في الإدخال",
          description: "يرجى تحديد ملف JSON أو إدخال رابط مباشر.",
        });
        setIsImporting(false);
        return;
      }

      if (!validateSinsData(rawData)) {
        throw new Error("تنسيق ملف JSON غير صالح. يجب أن يكون مصفوفة من بطاقات المهلكات وتحتوي على الحقول الأساسية: id, title, dialogTitle, icon.");
      }

      const sinsCollection = collection(firestore, "destructive_sins");
      const ops: { ref: any; data: any; type: "set" | "delete" }[] = [];

      // If overwrite, delete existing documents first
      if (importMode === "overwrite" && allItems) {
        allItems.forEach(item => {
          const docRef = doc(firestore, "destructive_sins", item.id);
          ops.push({ ref: docRef, data: null, type: "delete" });
        });
      }

      // Add import items
      rawData.forEach((sin: DestructiveSin) => {
        const docRef = doc(sinsCollection, sin.id);
        ops.push({
          ref: docRef,
          data: {
            ...sin,
            updatedAt: new Date().toISOString(),
          },
          type: "set",
        });
      });

      // Execute batch writes in chunks of 400 to prevent Firestore limits
      let batch = writeBatch(firestore);
      let count = 0;
      for (const op of ops) {
        if (op.type === "set") {
          batch.set(op.ref, op.data);
        } else if (op.type === "delete") {
          batch.delete(op.ref);
        }
        count++;
        if (count === 400) {
          await batch.commit();
          batch = writeBatch(firestore);
          count = 0;
        }
      }
      if (count > 0) {
        await batch.commit();
      }

      toast({
        title: "تم الاستيراد بنجاح",
        description: `تم استيراد ${rawData.length} بطاقة بنجاح إلى قاعدة البيانات.`,
      });

      // Reset states
      setIsImportOpen(false);
      setImportUrl("");
      setImportFile(null);
    } catch (error: any) {
      console.error("Error importing JSON:", error);
      toast({
        variant: "destructive",
        title: "فشل الاستيراد",
        description: error.message || "حدث خطأ غير متوقع أثناء معالجة الملف.",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleSeedData = async () => {
    if (!firestore) return;
    setIsSeeding(true);
    const batch = writeBatch(firestore);
    const sinsCollection = collection(firestore, 'destructive_sins');
    destructiveSinsData.forEach(sin => {
      const docRef = doc(sinsCollection, sin.id);
      batch.set(docRef, sin);
    });
    try {
      await batch.commit();
      toast({ title: "تمت إضافة البيانات الأولية بنجاح." });
    } catch (error) {
      console.error("Error seeding sins data:", error);
      toast({ variant: 'destructive', title: "فشل إضافة البيانات." });
    } finally {
      setIsSeeding(false);
    }
  };

  if (isFormOpen) {
    return (
      <div className="space-y-6">
        <Button onClick={handleFormClose} variant="ghost" className="gap-2">
          &rarr; العودة للقائمة
        </Button>
        <SinForm item={itemToEdit} onFormClose={handleFormClose} />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black font-headline flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            إدارة بطاقات "احذر المهلكات"
          </h1>
          <p className="text-muted-foreground mt-2">تحكم في المحتوى التحذيري الذي يظهر للمستخدمين في قسم المحاسبة.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {isAdmin && !isLoading && allItems?.length === 0 && (
            <Button onClick={handleSeedData} disabled={isSeeding} variant="outline" className="rounded-xl">
              {isSeeding ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Database className="me-2 h-4 w-4" />}
              إضافة البيانات الأولية
            </Button>
          )}

          {/* GitHub / JSON Import Button */}
          <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="rounded-xl h-11 px-5 border-dashed border-2 hover:border-solid gap-2">
                <FileJson className="h-4 w-4 text-primary" />
                استيراد من JSON / GitHub
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md rounded-3xl" dir="rtl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold flex items-center gap-2 text-right">
                  <FileJson className="h-5 w-5 text-primary" />
                  استيراد بطاقات المهلكات
                </DialogTitle>
                <DialogDescription className="text-right">
                  يمكنك تحديث أو استيراد بطاقات جديدة من ملف JSON محلي أو مباشرة من رابط GitHub Raw.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 my-4">
                <div className="space-y-2 text-right">
                  <Label className="text-sm font-semibold">رابط الملف المباشر (GitHub Raw URL)</Label>
                  <div className="relative">
                    <Link2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={importUrl}
                      onChange={(e) => {
                        setImportUrl(e.target.value);
                        if (e.target.value) setImportFile(null);
                      }}
                      placeholder="https://raw.githubusercontent.com/..."
                      className="pr-10 text-left font-mono text-xs"
                      dir="ltr"
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground block leading-normal">
                    تأكد من استخدام رابط الـ <strong>Raw</strong> المباشر (يبدأ بـ raw.githubusercontent.com).
                  </span>
                </div>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-border"></div>
                  <span className="flex-shrink mx-4 text-muted-foreground text-xs">أو رفع ملف محلي</span>
                  <div className="flex-grow border-t border-border"></div>
                </div>

                <div className="space-y-2 text-right">
                  <Label className="text-sm font-semibold">تحديد ملف JSON من جهازك</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="file"
                      accept=".json"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setImportFile(file);
                          setImportUrl("");
                        }
                      }}
                      className="hidden"
                      id="json-file-input"
                    />
                    <label
                      htmlFor="json-file-input"
                      className="flex-grow flex items-center justify-center gap-2 border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 rounded-xl p-4 cursor-pointer transition-colors bg-muted/5"
                    >
                      <Upload className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs font-medium">
                        {importFile ? importFile.name : "اختر ملف JSON..."}
                      </span>
                    </label>
                  </div>
                </div>

                <div className="space-y-2 text-right">
                  <Label className="text-sm font-semibold">طريقة الكتابة على البيانات</Label>
                  <select
                    value={importMode}
                    onChange={(e) => setImportMode(e.target.value as "merge" | "overwrite")}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="merge">دمج (تحديث الحالية وإضافة الجديدة)</option>
                    <option value="overwrite">مسح وإعادة كتابة (حذف الكل واستيراد هذه فقط)</option>
                  </select>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0 flex-row-reverse">
                <Button
                  onClick={handleImport}
                  disabled={isImporting || (!importUrl && !importFile)}
                  className="flex-1 rounded-xl"
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      جاري الاستيراد...
                    </>
                  ) : (
                    "بدء الاستيراد"
                  )}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setIsImportOpen(false)}
                  className="flex-1 rounded-xl"
                >
                  إلغاء
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button onClick={handleNew} className="rounded-xl h-11 px-6 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
            <PlusCircle className="mr-2 h-5 w-5" />
            إضافة بطاقة جديدة
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-20 bg-muted/20 rounded-[2rem] border-2 border-dashed">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="font-bold text-muted-foreground">جاري تحميل البطاقات...</p>
        </div>
      ) : allItems && allItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {allItems.map((item) => (
            <Card key={item.id} className="group relative overflow-hidden border-border/50 hover:border-destructive/30 hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] bg-gradient-to-b from-background to-muted/20">
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-10">
                <Button onClick={() => handleEdit(item)} variant="secondary" size="icon" className="h-9 w-9 rounded-full shadow-md hover:bg-primary hover:text-white transition-colors">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button onClick={() => setItemToDelete(item)} variant="destructive" size="icon" className="h-9 w-9 rounded-full shadow-md">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <CardContent className="p-8 pt-10 flex flex-col items-center text-center">
                <div className="mb-6 h-24 w-24 bg-white dark:bg-slate-900 rounded-[2rem] flex items-center justify-center shadow-inner p-4 group-hover:scale-110 transition-transform duration-500">
                  {item.icon.startsWith('http') ? (
                    <div className="relative w-full h-full">
                      <Image src={item.icon} alt={item.title} fill className="object-contain" unoptimized />
                    </div>
                  ) : (
                    <AlertTriangle className="h-12 w-12 text-destructive/50" />
                  )}
                </div>
                <h3 className="text-xl font-black font-headline mb-2">{item.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">{item.dialogTitle}</p>

                <div className="mt-6 pt-6 border-t w-full flex flex-col gap-3">
                  {item.linkedVideoId ? (
                    <Badge variant="outline" className="w-fit mx-auto gap-1 border-primary/20 text-primary bg-primary/5 py-1 px-3">
                      <ExternalLink className="w-3 h-3" />
                      محاضرة مرتبطة
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="w-fit mx-auto text-muted-foreground bg-muted/30 py-1 px-3">
                      بدون فيديو
                    </Badge>
                  )}
                  <div className="flex gap-2 justify-center">
                    <span className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground/60">{item.quranVerses?.length || 0} آية</span>
                    <span className="text-[10px] font-bold text-muted-foreground/30">•</span>
                    <span className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground/60">{item.hadiths?.length || 0} حديث</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-20 bg-muted/20 rounded-[2rem] border-2 border-dashed text-center">
          <Database className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
          <h3 className="text-xl font-bold">لا يوجد بطاقات حالياً</h3>
          <p className="text-muted-foreground mt-1">ابدأ بإضافة أول بطاقة تحذيرية للمنصة.</p>
          <Button onClick={handleNew} variant="outline" className="mt-6 rounded-xl">
            إضافة أول بطاقة
          </Button>
        </div>
      )}

      <DeleteConfirmationDialog
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDelete}
        title="حذف البطاقة"
        description={`هل أنت متأكد من رغبتك في حذف بطاقة "${itemToDelete?.title}"؟ لا يمكن التراجع عن هذا الإجراء وسيتم حذفه من قسم المحاسبة لدى جميع المستخدمين.`}
      />
    </div>
  );
}
