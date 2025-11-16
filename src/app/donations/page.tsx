import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export const metadata = {
    title: 'دعم الموقع',
};

export default function DonationsPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-8 font-headline text-center">دعم الموقع</h1>
      <Card className="max-w-2xl mx-auto text-center">
        <CardHeader>
          <CardTitle className="font-headline">ساهم في استمرار هذا العمل</CardTitle>
          <CardDescription>
            دعمكم يساعدنا على تغطية تكاليف الاستضافة، إنتاج المزيد من المحتوى، ونشر العلم.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-primary/80 text-primary-foreground hover:bg-primary/90">
              <Link href="#">التبرع عبر باي بال</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="#">التبرع عبر باتريون</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
