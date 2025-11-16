import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminQAPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>إدارة الأسئلة والأجوبة</CardTitle>
      </CardHeader>
      <CardContent>
        <p>هنا يمكنك إضافة وتعديل وحذف الأسئلة والأجوبة.</p>
      </CardContent>
    </Card>
  );
}
