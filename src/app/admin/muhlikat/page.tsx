"use client";

import { useCollection, useFirestore } from "@/firebase";
import { deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Plus, 
  Trash2, 
  Edit, 
  Loader2, 
  Search,
  Zap,
  ActivitySquare
} from "lucide-react";
import { useState } from "react";
import { doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import type { DestructiveSin } from "@/lib/types";
import { MuhlikatForm } from "@/components/admin/muhlikat-form";

export default function AdminMuhlikatPage() {
  const { data: sins, isLoading } = useCollection<DestructiveSin>("destructive_sins");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DestructiveSin | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    if (!firestore) return;
    if (confirm("هل أنت متأكد من حذف هذه المهلكة نهائياً؟")) {
      try {
        const docRef = doc(firestore, "destructive_sins", id);
        deleteDocumentNonBlocking(docRef);
        toast({
          title: "تم الحذف",
          description: "تمت إزالة المهلكة من قاعدة البيانات.",
        });
      } catch (e) {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "فشل حذف المستند.",
        });
      }
    }
  };

  const handleEdit = (item: DestructiveSin) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const filteredItems = sins?.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6 pb-20" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-2">
            <Zap className="w-8 h-8 text-red-500" />
            إدارة المهلكات
          </h1>
          <p className="text-muted-foreground mt-1">تزكية النفوس تبدأ من التشخيص الدقيق والعلاج المستمر.</p>
        </div>
        {!isFormOpen && (
          <Button onClick={() => setIsFormOpen(true)} className="bg-red-600 hover:bg-red-700">
            <Plus className="ml-2 h-4 w-4" /> إضافة مهلكة جديدة
          </Button>
        )}
      </div>

      {isFormOpen ? (
        <div className="max-w-4xl mx-auto">
          <MuhlikatForm 
            item={editingItem} 
            onFormClose={() => {
              setIsFormOpen(false);
              setEditingItem(null);
            }} 
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="بحث في المهلكات..."
              className="w-full pr-10 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الاسم</TableHead>
                  <TableHead className="text-right">الأيقونة</TableHead>
                  <TableHead className="text-right">خطة العلاج</TableHead>
                  <TableHead className="text-right">التقييم</TableHead>
                  <TableHead className="text-left w-[100px]">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-red-500" />
                      <p className="mt-2 text-muted-foreground">جاري تحميل البيانات...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredItems?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10">
                      لا توجد مهلكات حالياً.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems?.map((item) => (
                    <TableRow key={item.id} className="hover:bg-red-500/5 transition-colors">
                      <TableCell className="font-bold">{item.title}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{item.icon}</TableCell>
                      <TableCell>
                        {item.curePlan && item.curePlan.length > 0 ? (
                          <span className="text-emerald-500 text-xs flex items-center gap-1">
                            <Plus className="w-3 h-3" /> {item.curePlan.length} خطوات
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs italic">لا توجد</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.testQuestions && item.testQuestions.length > 0 ? (
                          <span className="text-amber-500 text-xs flex items-center gap-1">
                            <ActivitySquare className="w-3 h-3" /> {item.testQuestions.length} أسئلة
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs italic">لا توجد</span>
                        )}
                      </TableCell>
                      <TableCell className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(item)} className="hover:text-red-500">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
