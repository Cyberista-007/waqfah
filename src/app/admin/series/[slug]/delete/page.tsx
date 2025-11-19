
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
  const slug = params.slug;
  
  const seriesDocRef = useMemoFirebase(
    () => (firestore ? doc(firestore, "series", slug) : null),
    [firestore, slug]
  );
  const { data: series, isLoading } = useDoc<Series>(seriesDocRef);

  useEffect(() => {
    // This effect runs on the client after the component mounts and the data is loaded.
    if (!isLoading && series) {
        // If the series has lectures, it's a critical error to be on this page.
        // Redirect and show a toast.
        if ((series.lectureCount || 0) > 0) {
            toast({
                variant: "destructive",
                title: "لا يمكن الحذف",
                description: "لا يمكنك حذف سلسلة تحتوي على محاضرات. قم بحذف المحاضرات أولاً."
            });
            // Using `redirect` from Next.js is preferred for server components,
            // but since this is a client component with hooks, router.replace is appropriate.
            router.replace('/admin/series');
        }
    } else if (!isLoading && !series) {
        // If data fetching is complete and no series was found, this is a 404.
        notFound();
    }
  }, [series, isLoading, toast, router]);

  const handleDelete = async () => {
    if (!series || !seriesDocRef) return;
    
    // A final client-side check to be absolutely sure before deleting.
    if ((series.lectureCount || 0) > 0) {
        toast({
            variant: "destructive",
            title: "لا يمكن الحذف",
            description: "السلسلة تحتوي على محاضرات."
        });
        router.push("/admin/series");
        return;
    }

    deleteDocumentNonBlocking(seriesDocRef);

    toast({
      variant: "destructive",
      title: "تم الحذف بنجاح",
      description: `تم حذف سلسلة "${series.title}".`,
    });

    router.push("/admin/series");
    router.refresh();
  };

  const handleCancel = () => {
    router.back();
  };

  // While loading, show a full-screen spinner.
  if (isLoading || !series) {
    return (
       <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
       </div>
    );
  }
  
  // This check is a safeguard. The useEffect should handle the redirect.
  if ((series.lectureCount || 0) > 0) {
      return null;
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
