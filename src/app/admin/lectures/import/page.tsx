'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Youtube, FileText, Loader2, ListVideo } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { Program } from '@/lib/types';

// YouTube Import Component
function YoutubeImport() {
    const [url, setUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleFetch = async () => {
        if (!url) {
            toast({ variant: 'destructive', title: 'الرجاء إدخال رابط أولاً.' });
            return;
        }
        setIsLoading(true);

        try {
            const response = await fetch(`${window.location.origin}/api/youtube-import`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: url }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "فشل في جلب البيانات.");
            }
            
            // On success, we would normally process the data here or navigate.
            // For now, let's just show a success message and log the data.
            const data = await response.json();
            console.log("Fetched data:", data);
            toast({ title: "تم جلب البيانات بنجاح", description: "سيتم الآن عرض المحتوى للاستيراد." });
            // In a real scenario, you'd likely redirect to a page to confirm the import.
            // For example: router.push(`/admin/lectures/confirm-import?url=${encodeURIComponent(url)}`);

        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'حدث خطأ أثناء جلب البيانات',
                description: error.message,
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="space-y-4">
            <div>
                <Label htmlFor="youtube-url">رابط برنامج أو قائمة تشغيل يوتيوب</Label>
                <div className="flex gap-2">
                    <Input 
                        id="youtube-url" 
                        placeholder="https://www.youtube.com/..." 
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        disabled={isLoading}
                    />
                    <Button onClick={handleFetch} disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin" /> : "جلب البيانات"}
                    </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                    إذا كان البرنامج غير مضاف، سيتم إضافته تلقائيًا عند جلب البيانات.
                </p>
            </div>
             <p className="text-xs text-muted-foreground">
                ملاحظة: الفيديو الذي تقل مدته عن 3 دقائق سيُعامل على أنه "فيديو قصير".
            </p>
        </div>
    );
}

// OPML Import Component
function OpmlImport() {
    const [file, setFile] = useState<File | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [results, setResults] = useState<{ matched: Program[], unmatched: string[] } | null>(null);
    const router = useRouter();
    const { toast } = useToast();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setFile(event.target.files[0]);
        }
    };

    const handleImport = async () => {
        if (!file) {
            toast({ variant: 'destructive', title: 'الرجاء اختيار ملف OPML.' });
            return;
        }

        setIsImporting(true);
        setResults(null);
        const formData = new FormData();
        formData.append('opml', file);

        try {
            const response = await fetch('/api/opml-import', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'فشل استيراد الملف.');
            }
            
            setResults(data);
            toast({
                title: 'اكتملت المعالجة',
                description: `تم العثور على ${data.matched.length} برنامج مطابق و ${data.unmatched.length} غير مطابق.`,
            });
            
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'خطأ', description: error.message });
        } finally {
            setIsImporting(false);
        }
    };

    const handleCreateProgram = (youtubeUrl: string) => {
        router.push(`/admin/programs?youtubeUrl=${encodeURIComponent(youtubeUrl)}`);
    };


    return (
        <div className="space-y-4">
             <div className="space-y-2">
                <Label htmlFor="opml-file">ملف OPML</Label>
                <Input id="opml-file" type="file" accept=".opml, .xml" onChange={handleFileChange} />
            </div>
            <Button onClick={handleImport} disabled={isImporting || !file}>
                {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                استيراد من OPML
            </Button>
            
            {results && (
                <div className="mt-6 space-y-4">
                    {results.matched.length > 0 && (
                        <Card>
                            <CardHeader><CardTitle>البرامج المتطابقة ({results.matched.length})</CardTitle></CardHeader>
                            <CardContent>
                                <ul className="list-disc pl-5">
                                    {results.matched.map(program => <li key={program.id}>{program.name}</li>)}
                                </ul>
                            </CardContent>
                        </Card>
                    )}
                    {results.unmatched.length > 0 && (
                         <Card>
                            <CardHeader><CardTitle>روابط لم يتم العثور عليها ({results.unmatched.length})</CardTitle></CardHeader>
                            <CardContent className="space-y-2">
                                {results.unmatched.map((url, index) => (
                                    <div key={index} className="flex justify-between items-center text-sm">
                                        <span className="truncate">{url}</span>
                                        <Button size="sm" variant="outline" onClick={() => handleCreateProgram(url)}>إضافة كبرنامج</Button>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
}

// Main Page Component
export default function ImportLecturesPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl font-headline flex items-center gap-2"><Upload />استيراد المحتوى</CardTitle>
                <CardDescription>استورد المحاضرات والسلاسل من مصادر مختلفة مثل يوتيوب أو ملفات CSV و OPML.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="youtube">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="youtube"><Youtube className="me-2 h-4 w-4" />يوتيوب</TabsTrigger>
                        <TabsTrigger value="opml"><ListVideo className="me-2 h-4 w-4" />ملف OPML</TabsTrigger>
                        <TabsTrigger value="csv" disabled><FileText className="me-2 h-4 w-4" />ملف CSV</TabsTrigger>
                    </TabsList>
                    <TabsContent value="youtube" className="pt-6">
                        <YoutubeImport />
                    </TabsContent>
                    <TabsContent value="opml" className="pt-6">
                        <OpmlImport />
                    </TabsContent>
                    <TabsContent value="csv" className="pt-6">
                        <p className="text-center text-muted-foreground">قيد التطوير.</p>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
