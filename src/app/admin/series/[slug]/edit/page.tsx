
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
import { getSeriesBySlug } from "@/lib/data";
import { notFound } from "next/navigation";
import Link from "next/link";

export default function AdminEditSeriesPage({
  params,
}: {
  params: { slug: string };
}) {
  const series = getSeriesBySlug(params.slug);

  if (!series) {
    notFound();
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
        <form className="space-y-4">
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
