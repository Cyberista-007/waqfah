import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminBooksPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>إدارة الكتب</CardTitle>
      </CardHeader>
      <CardContent>
        <p>هنا يمكنك إضافة وتعديل وحذف الكتب.</p>
      </CardContent>
    </Card>
  );
}
