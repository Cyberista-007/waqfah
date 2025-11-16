"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useRouter, notFound } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import type { Series } from "@/lib/types";
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export default function AdminEditSeriesPage({
  params,
}: {
  params: { slug: string }; // slug is now the document ID
}) {
  const { toast } = useToast();
  const router = useRouter();
  const firestore = useFirestore();

  const seriesDocRef = useMemoFirebase(
    () => (firestore ? doc(firestore, "series", params.slug) : null),
    [firestore, params.slug]
  );
  const { data: series, isLoading } = useDoc<Series>(seriesDocRef);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!series || !seriesDocRef) return;

    const formData = new FormData(event.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    
    // Update the document in Firestore
    await updateDocumentNonBlocking(seriesDocRef, {
        title,
        description,
    });

    toast({
        title: "تم الحفظ بنجاح",
        description: `تم تحديث بيانات سلسلة "${title}".`,
    });

    router.push("/admin/series");
  };
  
  if (isLoading) {
    return <div>جار التحميل...</div>;
  }

  if (!series) {
    // This will be true if the doc doesn't exist or firestore is not ready.
    // We show notFound() if it's not loading and there's no series.
    if (!isLoading) {
      notFound();
    }
    return <div>جار التحميل...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">تعديل السلسلة: {series.title}</CardTitle>
        <CardDescription>
          قم بتحديث تفاصيل السلسلة هنا.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">عنوان السلسلة</Label>
            <Input id="title" name="title" defaultValue={series.title} required />
          </div>
          <div>
            <Label htmlFor="description">وصف السلسلة</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={series.description}
              rows={5}
              required
            />
          </div>
          <div>
            <Label htmlFor="image">تغيير صورة الغلاف</Label>
            <Input id="image" name="image" type="file" />
          </div>
          <div className="flex gap-2">
            <Button type="submit">حفظ التغييرات</Button>
             <Button asChild variant="outline">
              <Link href="/admin/series">إلغاء</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
