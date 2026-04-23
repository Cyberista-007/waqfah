'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFirestore } from '@/firebase';
import { collection, doc, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Inspiration } from '@/lib/types';
import { Loader2, ChevronRight, Quote as QuoteIcon } from 'lucide-react';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";

interface InspirationFormProps {
    item?: Inspiration | null;
    onFormClose: () => void;
}

export function InspirationForm({ item, onFormClose }: InspirationFormProps) {
    const { toast } = useToast();
    const firestore = useFirestore();
    const [isLoading, setIsLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        text: item?.text || '',
        author: item?.author || '',
        title: item?.title || '',
        type: item?.type || 'wisdom' as 'hadith' | 'quote' | 'wisdom',
    });

    const isEditing = !!item;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firestore) return;

        setIsLoading(true);
        try {
            const dataToSave = {
                ...formData,
                updatedAt: Timestamp.now(),
            };

            if (isEditing) {
                const itemRef = doc(firestore, 'inspiration', item.id);
                updateDocumentNonBlocking(itemRef, dataToSave);
                toast({ title: "تم التحديث", description: "تم تحديث الحكمة بنجاح." });
            } else {
                const itemsCollection = collection(firestore, 'inspiration');
                addDocumentNonBlocking(itemsCollection, {
                    ...dataToSave,
                    createdAt: Timestamp.now(),
                });
                toast({ title: "تمت الإضافة", description: "تمت إضافة حكمة جديدة بنجاح." });
            }
            onFormClose();
        } catch (error) {
            console.error("Error saving inspiration:", error);
            toast({ variant: "destructive", title: "خطأ", description: "حدث خطأ أثناء حفظ البيانات." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="max-w-4xl mx-auto border-white/10 bg-zinc-950/50 backdrop-blur-xl" dir="rtl">
            <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                    <Button variant="ghost" size="icon" onClick={onFormClose} className="rounded-full">
                        <ChevronRight className="h-4 w-4 rotate-180" />
                    </Button>
                    <div className="p-2 bg-primary/20 rounded-xl">
                        <QuoteIcon className="h-6 w-6 text-primary" />
                    </div>
                </div>
                <CardTitle className="text-3xl font-black font-headline tracking-tighter">
                    {isEditing ? 'تعديل الحكمة' : 'إضافة حكمة جديدة'}
                </CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label className="text-lg font-bold">نص الحكمة / الحديث</Label>
                        <Textarea 
                            required 
                            placeholder="أدخل النص هنا..." 
                            className="min-h-[150px] text-xl font-headline leading-relaxed scrollbar-thin rounded-2xl border-white/10 bg-white/5"
                            value={formData.text}
                            onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="font-bold">القائل / الراوي</Label>
                            <Input 
                                required 
                                placeholder="مثل: الإمام الشافعي" 
                                className="h-12 rounded-xl border-white/10 bg-white/5"
                                value={formData.author}
                                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-bold">المصدر (اختياري)</Label>
                            <Input 
                                placeholder="مثل: رواه البخاري" 
                                className="h-12 rounded-xl border-white/10 bg-white/5"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="font-bold">النوع</Label>
                        <Select 
                            value={formData.type} 
                            onValueChange={(v: any) => setFormData({ ...formData, type: v })}
                        >
                            <SelectTrigger className="h-12 rounded-xl border-white/10 bg-white/5">
                                <SelectValue placeholder="اختر النوع" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-white/10">
                                <SelectItem value="hadith">حديث نبوي</SelectItem>
                                <SelectItem value="quote">قول عالم</SelectItem>
                                <SelectItem value="wisdom">حكمة / قول مأثور</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-3 pt-6 border-t border-white/5">
                    <Button type="button" variant="ghost" onClick={onFormClose} className="rounded-xl h-12">إلغاء</Button>
                    <Button type="submit" disabled={isLoading} className="rounded-xl h-12 px-8 font-bold">
                        {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                        {isEditing ? 'حفظ التغييرات' : 'إضافة الحكمة'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
