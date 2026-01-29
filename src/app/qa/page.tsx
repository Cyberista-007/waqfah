'use client';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { QAPair } from '@/lib/types';
import { useCollection } from '@/firebase';
import { Loader2 } from 'lucide-react';

export default function QAPage() {
  const { data: qanda, isLoading } = useCollection<QAPair>('question_answers');

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8 font-headline">سؤال وجواب</h1>
      <div className="max-w-3xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="font-headline">اطرح سؤالك</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div>
                <Label htmlFor="qa-name">اسمك (اختياري)</Label>
                <Input type="text" id="qa-name" placeholder="اسمك" />
              </div>
              <div>
                <Label htmlFor="qa-question">سؤالك</Label>
                <Textarea id="qa-question" placeholder="اكتب سؤالك هنا..." required />
              </div>
              <Button type="submit" className="w-full bg-primary/80 text-primary-foreground hover:bg-primary/90">
                إرسال السؤال
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-2">
          <h2 className="text-3xl font-bold mb-4 font-headline">الأسئلة الشائعة</h2>
            {isLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {qanda && qanda.length > 0 ? (
                    qanda.map(item => (
                      <AccordionItem value={item.id} key={item.id}>
                        <AccordionTrigger className="text-lg text-right font-semibold font-headline">{item.question}</AccordionTrigger>
                        <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))
                ) : (
                    <p className="text-muted-foreground text-center py-8">لا توجد أسئلة شائعة حالياً.</p>
                )}
              </Accordion>
            )}
        </div>
      </div>
    </div>
  );
}
