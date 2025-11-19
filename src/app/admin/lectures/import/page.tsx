
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, FileText } from "lucide-react";
import Link from "next/link";
import { useCollection, useFirestore } from "@/firebase";
import type { Series, Sheikh, Lecture } from "@/lib/types";
import { writeBatch, doc, collection, Timestamp, increment } from "firebase/firestore";

// A simple CSV parser
const parseCSV = (text: string): Record<string, string>[] => {
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) return [];
    
    const header = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1).map(line => {
        const values = line.split(',');
        return header.reduce((obj, nextKey, index) => {
            obj[nextKey] = values[index]?.trim() || '';
            return obj;
        }, {} as Record<string, string>);
    });
    return rows;
};


export default function AdminImportLecturesPage() {
    const { toast } = useToast();
    const firestore = useFirestore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const { data: allSeries, isLoading: seriesLoading } = useCollection<Series>('series');
    const { data: allSheikhs, isLoading: sheikhsLoading } = useCollection<Sheikh>('sheikhs');

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!selectedFile || !firestore || !allSeries || !allSheikhs) {
            toast({
                variant: "destructive",
                title: "خطأ",
                description: "يرجى اختيار ملف والتأكد من تحميل جميع البيانات الأولية.",
            });
            return;
        }

        setIsSubmitting(true);

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const text = e.target?.result as string;
                const lecturesToImport = parseCSV(text);

                if (lecturesToImport.length === 0) {
                    throw new Error("الملف فارغ أو غير صالح.");
                }

                const batch = writeBatch(firestore);
                const seriesToUpdate = new Map<string, number>();

                for (const lectureData of lecturesToImport) {
                    const { title, description, seriesId, audioSrc, duration, youtubeUrl, pdfUrl } = lectureData;

                    if (!title || !seriesId || !audioSrc || !duration) {
                        console.warn("Skipping row due to missing data:", lectureData);
                        continue;
                    }
                    
                    const series = allSeries.find(s => s.id === seriesId);
                    if (!series) {
                         console.warn(`Skipping row: Series with ID "${seriesId}" not found for lecture "${title}".`);
                        continue;
                    }
                    const sheikh = allSheikhs.find(sh => sh.id === series.sheikhId);
                     if (!sheikh) {
                         console.warn(`Skipping row: Sheikh for series "${series.title}" not found.`);
                        continue;
                    }

                    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
                    const newLectureRef = doc(collection(firestore, 'lectures'));

                    const newLecturePayload: Omit<Lecture, 'id'> = {
                        title,
                        slug,
                        description: description || "",
                        sheikhId: sheikh.id,
                        sheikhName: sheikh.name,
                        sheikhSlug: sheikh.slug,
                        seriesId: series.id,
                        seriesSlug: series.slug,
                        seriesTitle: series.title,
                        audioSrc,
                        duration: parseInt(duration, 10),
                        imageId: `lecture-thumbnail-${Math.floor(Math.random() * 4) + 1}`,
                        youtubeUrl: youtubeUrl || "",
                        pdfUrl: pdfUrl || "",
                        rating: 0,
                        ratingCount: 0,
                        viewCount: 0,
                        transcript: [],
                        createdAt: Timestamp.now(),
                    };
                    
                    batch.set(newLectureRef, newLecturePayload);
                    seriesToUpdate.set(series.id, (seriesToUpdate.get(series.id) || 0) + 1);
                }

                seriesToUpdate.forEach((count, id) => {
                    const seriesRef = doc(firestore, 'series', id);
                    batch.update(seriesRef, { lectureCount: increment(count) });
                });
                
                await batch.commit();

                toast({
                    title: "تم الاستيراد بنجاح",
                    description: `تمت إضافة ${lecturesToImport.length} محاضرة بنجاح.`,
                });

            } catch (error: any) {
                 toast({
                    variant: "destructive",
                    title: "فشل الاستيراد",
                    description: error.message || "حدث خطأ أثناء معالجة الملف.",
                });
            } finally {
                setIsSubmitting(false);
            }
        };

        reader.readAsText(selectedFile);
    };

    const isLoading = seriesLoading || sheikhsLoading;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl font-headline flex items-center gap-2">
                    <Upload />
                    استيراد المحاضرات دفعة واحدة
                </CardTitle>
                <CardDescription>
                    قم برفع ملف بصيغة CSV يحتوي على بيانات المحاضرات لإضافتها إلى الموقع.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mb-6 p-4 border-l-4 border-primary bg-primary/10 rounded-r-lg">
                    <h4 className="font-bold mb-2">تعليمات هامة:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>يجب أن يكون الملف بصيغة CSV.</li>
                        <li>
                            يجب أن يحتوي الملف على الأعمدة التالية بالترتيب: `title`, `description`, `seriesId`, `audioSrc`, `duration`.
                        </li>
                        <li>الأعمدة `youtubeUrl` و `pdfUrl` اختيارية.</li>
                         <li>تأكد من أن `seriesId` الموجود في الملف يطابق معرف سلسلة موجود بالفعل في قاعدة البيانات.</li>
                    </ul>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="csv-file">ملف المحاضرات (CSV)</Label>
                        <Input
                            id="csv-file"
                            name="csv-file"
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            required
                            disabled={isSubmitting || isLoading}
                        />
                        {selectedFile && (
                             <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                الملف المختار: {selectedFile.name}
                            </p>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" disabled={isSubmitting || isLoading || !selectedFile}>
                            {(isSubmitting || isLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isLoading ? 'جاري تحميل البيانات...' : 'بدء الاستيراد'}
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/admin/lectures">إلغاء</Link>
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
