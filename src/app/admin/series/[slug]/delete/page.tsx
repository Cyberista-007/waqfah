
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
import { doc, getDoc, writeBatch } from "firebase/firestore";
import { getDbSafe } from "@/lib/data";
import { toSerializable } from "@/lib/data-helpers";
import Link from "next/link";
import { revalidatePath } from 'next/cache';

// Server-side function to handle deletion
async function deleteSeriesAction(seriesId: string, seriesTitle: string) {
    "use server";
    const { db } = getDbSafe();
    if (!db) {
        throw new Error("Database not available");
    }

    const seriesRef = doc(db, 'series', seriesId);
    
    const batch = writeBatch(db);
    batch.delete(seriesRef);
    
    await batch.commit();

    revalidatePath('/admin/series');
    redirect('/admin/series');
}


export default async function AdminDeleteSeriesPage({
  params,
}: {
  params: { slug: string }; // slug is the document ID
}) {
  const seriesId = params.slug;
  const { db } = getDbSafe();
  
  if (!db) {
      return <p>قاعدة البيانات غير متاحة. تحقق من إعدادات الخادم.</p>
  }

  const seriesDocRef = doc(db, "series", seriesId);
  const seriesSnap = await getDoc(seriesDocRef);
  
  if (!seriesSnap.exists()) {
    notFound();
  }

  const series = toSerializable({ ...seriesSnap.data(), id: seriesSnap.id }) as Series;

  // Server-side check: if the series has lectures, redirect immediately.
  if ((series.lectureCount || 0) > 0) {
      // It's better to redirect from the server if the condition is not met.
      redirect('/admin/series');
      // The toast can be set in the /admin/series page by checking for a query param if needed.
  }
  
  const deleteAction = deleteSeriesAction.bind(null, series.id, series.title);


  return (
    <AlertDialog open={true}>
      <AlertDialogContent dir="rtl">
         <form action={deleteAction}>
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
                <Link href="/admin/series"><Button variant="outline">إلغاء</Button></Link>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
                <Button variant="destructive" type="submit">نعم، قم بالحذف</Button>
            </AlertDialogAction>
            </AlertDialogFooter>
         </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
