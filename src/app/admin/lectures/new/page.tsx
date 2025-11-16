
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
import { lectures, series } from "@/lib/data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export default function AdminNewLecturePage() {
  const { toast } = useToast();
  const router = useRouter();
  const [selectedSeries, setSelectedSeries] = useState<string>("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const audioSrc = formData.get("audioSrc") as string;
    const seriesData = series.find(s => s.slug === selectedSeries);
    const slug = title.toLowerCase().replace(/\s+/g, '-');

    if (!title || !description || !selectedSeries || !audioSrc) {
        toast({
            variant: "destructive",
            title: "خطأ",
            description: "يرجى ملء جميع الحقول المطلوبة.",
        });
        return;
    }

    if (!seriesData) {
        toast({
            variant: "destructive",
            title: "خطأ",
            description: "السلسلة المحددة غير صالحة.",
        });
        return;
    }


    // Simulate data addition
    lectures.unshift({
        slug: slug,
        title: title,
        description: description,
        seriesSlug: seriesData.slug,
        seriesTitle: seriesData.title,
        audioSrc: audioSrc,
        duration: 40, // Mock data
        imageId: `lecture-thumbnail-${Math.floor(Math.random() * 4) + 1}`, // Mock data
        transcript: [], // Mock data
        rating: 0, // Mock data
        ratingCount: 0, // Mock data
        viewCount: 0, // Mock data
        createdAt: new Date().toISOString(), // Mock data
    });

    toast({
        title: "تم الإنشاء بنجاح",
        description: `تمت إضافة محاضرة "${title}" الجديدة.`,
    });

    // Redirect to the lectures list page to see the new lecture
    router.push("/admin/lectures");
    router.refresh(); // Tell Next.js to re-fetch the data on the target page
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">إضافة محاضرة جديدة</CardTitle>
        <CardDescription>
          املأ الحقول أدناه لإضافة محاضرة جديدة إلى الموقع.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">عنوان المحاضرة</Label>
            <Input id="title" name="title" required />
          </div>
          <div>
            <Label htmlFor="series">السلسلة</Label>
             <Select name="series" onValueChange={setSelectedSeries} required>
                <SelectTrigger>
                    <SelectValue placeholder="اختر سلسلة..." />
                </SelectTrigger>
                <SelectContent>
                    {series.map(s => (
                        <SelectItem key={s.slug} value={s.slug}>{s.title}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="description">وصف المحاضرة</Label>
            <Textarea id="description" name="description" required rows={4} />
          </div>
           <div>
            <Label htmlFor="audioSrc">رابط الملف الصوتي (MP3 URL)</Label>
            <Input id="audioSrc" name="audioSrc" type="url" required />
          </div>
          <div className="flex gap-2">
            <Button type="submit">إضافة المحاضرة</Button>
            <Button asChild variant="outline">
              <Link href="/admin/lectures">إلغاء</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
