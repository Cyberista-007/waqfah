import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminCommentsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>مراجعة التعليقات</CardTitle>
      </CardHeader>
      <CardContent>
        <p>هنا يمكنك مراجعة وإدارة تعليقات المستخدمين.</p>
      </CardContent>
    </Card>
  );
}
