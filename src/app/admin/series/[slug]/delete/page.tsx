
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
import { series as seriesData, getSeriesBySlug } from "@/lib/data";
import { notFound, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Series } from "@/lib/types";

export default function AdminDeleteSeriesPage({
  params,
}: {
  params: { slug: string };
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [series, setSeries] = useState<Series | undefined>(undefined);
  
  useEffect(() => {
    const seriesItem = getSeriesBySlug(params.slug);
    if (seriesItem) {
        setSeries(seriesItem);
    } else {
        // If series not found after trying, redirect back
        toast({
            variant: "destructive",
            title: "خطأ",
            description: "السلسلة المطلوبة غير موجودة.",
        });
        router.push("/admin/series");
    }
  }, [params.slug, router, toast]);

  const handleDelete = () => {
    if (!series) return;

    // Find the index of the series to delete
    const seriesIndex = seriesData.findIndex(s => s.slug === series.slug);
    
    if (seriesIndex !== -1) {
        // Remove the series from the mock database
        seriesData.splice(seriesIndex, 1);
    }

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

  if (!series) {
      return null; // Don't render the dialog until we find the series
  }

  return (
    <AlertDialog open={true} onOpenChange={handleCancel}>
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
