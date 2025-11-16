
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Note: This page is now a placeholder. Full implementation would require a form similar to the 'new lecture' page.
export default function AdminEditLecturePage({ params }: { params: { slug: string } }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>تعديل المحاضرة (قيد الإنشاء)</CardTitle>
      </CardHeader>
      <CardContent>
        <p>هنا يمكنك تعديل تفاصيل المحاضرة. هذه الميزة لم تكتمل بعد.</p>
        <p className="text-muted-foreground">معرف المحاضرة: {params.slug}</p>
      </CardContent>
    </Card>
  );
}
