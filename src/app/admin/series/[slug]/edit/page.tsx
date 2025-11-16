
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
import { series as seriesData, getSeriesBySlug } from "@/lib/data";
import { notFound, useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import type { Series } from "@/lib/types";

export default function AdminEditSeriesPage({
  params,
}: {
  params: { slug: string };
}) {
  const { toast } = useToast();
  const router = useRouter();
  const [series, setSeries] = useState<Series | undefined>(undefined);

  useEffect(() => {
    // Fetch the series data on the client side to ensure we have the latest
    const seriesItem = getSeriesBySlug(params.slug);
    if (seriesItem) {
      setSeries(seriesItem);
    } else {
      notFound();
    }
  }, [params.slug]);


  if (!series) {
    // You can show a loading spinner here
    return <div>جار التحميل...</div>;
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    // Find the index of the series to update
    const seriesIndex = seriesData.findIndex(s => s.slug === series.slug);

    if (seriesIndex !== -1) {
        // Update the data in the mock database
        seriesData[seriesIndex].title = title;
        seriesData[seriesIndex].description = description;
    }

    toast({
        title: "تم الحفظ بنجاح",
        description: `تم تحديث بيانات سلسلة "${title}".`,
    });

    router.push("/admin/series");
    router.refresh();
  };

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
