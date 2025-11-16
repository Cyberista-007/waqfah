import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getAllQAPairs } from '@/lib/data';

export const metadata = {
    title: 'سؤال وجواب',
};

export default function QAPage() {
  const qanda = getAllQAPairs();

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

        <div className="space-y-6">
          <h2 className="text-3xl font-bold mb-4 font-headline">الأسئلة الشائعة</h2>
          {qanda.map(item => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle className="text-xl font-semibold font-headline">{item.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{item.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
