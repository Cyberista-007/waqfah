import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export const metadata = {
    title: 'تواصل معنا',
};

export default function ContactPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-8 font-headline text-center">تواصل معنا</h1>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline">أرسل رسالة</CardTitle>
          <CardDescription>
            نسعد بتواصلكم واقتراحاتكم. يرجى ملء النموذج أدناه.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div>
              <Label htmlFor="name">الاسم</Label>
              <Input type="text" id="name" name="name" required />
            </div>
            <div>
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input type="email" id="email" name="email" required />
            </div>
            <div>
              <Label htmlFor="message">الرسالة</Label>
              <Textarea id="message" name="message" rows={5} required />
            </div>
            <Button type="submit" className="w-full bg-primary/80 text-primary-foreground hover:bg-primary/90">
              إرسال الرسالة
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
