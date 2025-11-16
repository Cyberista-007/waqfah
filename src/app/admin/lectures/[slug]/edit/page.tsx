import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminEditLecturePage({ params }: { params: { slug: string } }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>تعديل المحاضرة: {params.slug}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>هنا يمكنك تعديل تفاصيل المحاضرة.</p>
      </CardContent>
    </Card>
  );
}
