
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

export default function AdminImportLecturesPage() {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!selectedFile) {
            toast({
                variant: "destructive",
                title: "لم يتم اختيار ملف",
                description: "يرجى اختيار ملف CSV للمتابعة.",
            });
            return;
        }

        setIsSubmitting(true);

        // --- Placeholder for actual import logic ---
        // In a real application, you would:
        // 1. Read the CSV file.
        // 2. Parse the rows.
        // 3. For each row, create a new lecture document in Firestore.
        // 4. Handle errors and provide feedback.
        // This is a complex operation and often best handled by a serverless function.
        
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing

        toast({
            title: "جاري المعالجة (محاكاة)",
            description: `بدأت معالجة الملف: ${selectedFile.name}. هذه الميزة قيد التطوير.`,
        });

        setIsSubmitting(false);
    };

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
                        <li>يجب أن يحتوي الملف على الأعمدة التالية بالترتيب: `title`, `description`, `seriesId`, `audioSrc`, `duration`.</li>
                        <li>الأعمدة الأخرى مثل `youtubeUrl` و `pdfUrl` اختيارية.</li>
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
                            disabled={isSubmitting}
                        />
                        {selectedFile && (
                             <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                الملف المختار: {selectedFile.name}
                            </p>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" disabled={isSubmitting || !selectedFile}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            بدء الاستيراد
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
