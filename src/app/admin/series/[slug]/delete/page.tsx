
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
import { getSeriesBySlug } from "@/lib/data";
import { notFound, useRouter } from "next/navigation";

export default function AdminDeleteSeriesPage({
  params,
}: {
  params: { slug: string };
}) {
  const series = getSeriesBySlug(params.slug);
  const router = useRouter();
  const { toast } = useToast();

  if (!series) {
    notFound();
  }

  const handleDelete = () => {
    // Simulate API call for deletion
    console.log("Deleting series:", series.slug);

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

  return (
    <AlertDialog open={true} onOpenChange={handleCancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>هل أنت متأكد تماماً؟</AlertDialogTitle>
          <AlertDialogDescription>
            هذا الإجراء لا يمكن التراجع عنه. سيؤدي هذا إلى حذف السلسلة
            <span className="font-bold mx-1">"{series.title}"</span>
            وجميع المحاضرات المرتبطة بها بشكل دائم.
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
