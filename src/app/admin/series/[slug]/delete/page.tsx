
"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRouter, notFound, redirect } from "next/navigation";
import type { Series } from "@/lib/types";
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

export default function AdminDeleteSeriesPage({
  params,
}: {
  params: { slug: string }; // slug is now the document ID
}) {
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  
  const seriesDocRef = useMemoFirebase(
    () => (firestore ? doc(firestore, "series", params.slug) : null),
    [firestore, params.slug]
  );
  const { data: series, isLoading } = useDoc<Series>(seriesDocRef);

  useEffect(() => {
    if (!isLoading && series) {
        if ((series.lectureCount || 0) > 0) {
            toast({
                variant: "destructive",
                title: "لا يمكن الحذف",
                description: "لا يمكنك حذف سلسلة تحتوي على محاضرات. قم بحذف المحاضرات أولاً."
            });
            redirect('/admin/series');
        }
    }
  }, [series, isLoading, toast, router]);

  const handleDelete = async () => {
    if (!series || !seriesDocRef) return;
    
    // Final check to be safe
    if ((series.lectureCount || 0) > 0) {
        toast({
            variant: "destructive",
            title: "لا يمكن الحذف",
            description: "السلسلة تحتوي على محاضرات."
        });
        router.push("/admin/series");
        return;
    }

    await deleteDocumentNonBlocking(seriesDocRef);

    toast({
      variant: "destructive",
      title: "تم الحذف بنجاح",
      description: `تم حذف سلسلة "${series.title}".`,
    });

    router.push("/admin/series");
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoading || !series) {
    return (
       <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <Loader2 className="h-16 w-16 animate-spin text-white" />
       </div>
    );
  }

  // Double check, as redirect might not have completed
  if ((series.lectureCount || 0) > 0) {
      return (
           <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                <div className="bg-background p-8 rounded-lg">
                    <p>إعادة توجيه...</p>
                </div>
           </div>
      )
  }

  return (
    <AlertDialog open={true} onOpenChange={(open) => !open && handleCancel()}>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle>هل أنت متأكد تماماً؟</AlertDialogTitle>
          <AlertDialogDescription>
            هذا الإجراء لا يمكن التراجع عنه. سيؤدي هذا إلى حذف السلسلة
            <span className="font-bold mx-1">"{series.title}"</span>
            بشكل دائم.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline" onClick={handleCancel}>إلغاء</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant="destructive" onClick={handleDelete}>نعم، قم بالحذف</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
