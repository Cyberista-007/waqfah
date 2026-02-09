'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Library, Loader2, UploadCloud } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function ImportLibraryPage() {
    const [opmlFile, setOpmlFile] = useState<File | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const { toast } = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.name.endsWith('.opml') || file.type === 'text/xml') {
                setOpmlFile(file);
            } else {
                toast({
                    variant: 'destructive',
                    title: 'ملف غير صالح',
                    description: 'يرجى اختيار ملف بصيغة OPML.',
                });
            }
        }
    };

    const handleImport = async () => {
        if (!opmlFile) {
            toast({
                variant: 'destructive',
                title: 'لم يتم اختيار ملف',
                description: 'يرجى اختيار ملف OPML أولاً.',
            });
            return;
        }

        setIsImporting(true);
        // Simulate import process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        toast({
            title: 'بدء عملية الاستيراد',
            description: `جاري استيراد الاشتراكات من ملف: ${opmlFile.name}. سيصلك إشعار عند الانتهاء.`,
        });

        // Here you would typically read and parse the OPML file
        // and match the podcast feeds with programs/channels in your database.
        
        setIsImporting(false);
    };

    return (
        <div>
            <Button asChild variant="ghost" className="mb-4">
                <Link href="/settings">
                    <ArrowRight className="w-4 h-4 me-2" />
                    <span>العودة إلى الإعدادات</span>
                </Link>
            </Button>
            <Card className="max-w-2xl mx-auto">
                <CardHeader className="text-center">
                    <Library className="mx-auto h-12 w-12 text-primary" />
                    <CardTitle className="text-3xl font-headline mt-4">
                        استيراد المكتبة
                    </CardTitle>
                    <CardDescription className="text-lg">
                        انقل اشتراكاتك وقوائمك من تطبيقات البودكاست الأخرى بسهولة.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="p-4 border-l-4 border-primary bg-primary/10 rounded-r-lg">
                        <h4 className="font-bold mb-2">ما هو ملف OPML؟</h4>
                        <p className="text-sm text-foreground/80">
                            هو صيغة ملف قياسية لتصدير قائمة اشتراكات البودكاست. معظم تطبيقات البودكاست (مثل Apple Podcasts, Pocket Casts, Overcast) تدعم تصدير مكتبتك كملف OPML.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="opml-file" className="text-base">
                            1. اختر ملف OPML
                        </Label>
                        <Input
                            id="opml-file"
                            type="file"
                            accept=".opml,text/xml"
                            onChange={handleFileChange}
                        />
                        {opmlFile && <p className="text-sm text-muted-foreground">الملف المختار: {opmlFile.name}</p>}
                    </div>

                    <div>
                        <Button
                            onClick={handleImport}
                            disabled={!opmlFile || isImporting}
                            className="w-full"
                            size="lg"
                        >
                            {isImporting ? (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            ) : (
                                <UploadCloud className="mr-2 h-5 w-5" />
                            )}
                            بدء الاستيراد
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
