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
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useFirestore } from "@/firebase";
import { collection, Timestamp } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export default function AdminNewSeriesPage() {
  const { toast } = useToast();
  const router = useRouter();
  const firestore = useFirestore();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firestore) return;

    const formData = new FormData(event.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');


    if (!title || !description) {
        toast({
            variant: "destructive",
            title: "خطأ",
            description: "يرجى ملء جميع الحقول المطلوبة.",
        });
        return;
    }

    const seriesCollection = collection(firestore, 'series');
    
    // Add the new series to Firestore
    try {
        await addDocumentNonBlocking(seriesCollection, {
            slug: slug,
            title: title,
            description: description,
            lectureCount: 0,
            imageId: `series-${slug}`, // a mock imageId
            createdAt: Timestamp.now()
        });

        toast({
            title: "تم الإنشاء بنجاح",
            description: `تمت إضافة سلسلة "${title}" الجديدة.`,
        });

        // Redirect to the series list page to see the new series
        router.push("/admin/series");
        router.refresh(); // To show the new item in the list
    } catch(e) {
        toast({
            variant: "destructive",
            title: "خطأ في إنشاء السلسلة",
            description: "حدث خطأ أثناء محاولة حفظ السلسلة في قاعدة البيانات.",
        });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">إضافة سلسلة جديدة</CardTitle>
        <CardDescription>
          املأ الحقول أدناه لإنشاء سلسلة جديدة.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">عنوان السلسلة</Label>
            <Input id="title" name="title" required />
          </div>
          <div>
            <Label htmlFor="description">وصف السلسلة</Label>
            <Textarea id="description" name="description" required />
          </div>
           <div>
            <Label htmlFor="image">صورة الغلاف</Label>
            <Input id="image" name="image" type="file" />
          </div>
          <div className="flex gap-2">
            <Button type="submit">إنشاء السلسلة</Button>
            <Button asChild variant="outline">
              <Link href="/admin/series">إلغاء</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
