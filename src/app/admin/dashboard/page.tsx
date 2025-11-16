import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllLectures } from "@/lib/data";

export default function AdminDashboardPage() {
    const lectureCount = getAllLectures().length;
    // Mock data for other stats
    const userCount = "1,500";
    const newCommentsCount = 25;

  return (
    <div>
        <h1 className="text-4xl font-bold mb-8 font-headline">لوحة تحكم المدير</h1>
        
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-muted-foreground font-headline">إجمالي المحاضرات</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-4xl font-bold">{lectureCount}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-muted-foreground font-headline">المستخدمون</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-4xl font-bold">{userCount}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-muted-foreground font-headline">التعليقات الجديدة</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-4xl font-bold">{newCommentsCount}</p>
                </CardContent>
            </Card>
        </section>

        <Card>
            <CardHeader>
                <CardTitle className="text-2xl font-semibold font-headline">إدارة المحتوى</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground mb-4">
                    (ملاحظة: هذه الأزرار للعرض فقط حالياً ولا تنفذ أي أوامر بعد)
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button size="lg">إدارة السلاسل</Button>
                    <Button size="lg">إضافة محاضرة جديدة</Button>
                    <Button size="lg">إدارة الكتب</Button>
                    <Button size="lg">إدارة الأسئلة والأجوبة</Button>
                    <Button size="lg" variant="secondary">مراجعة التعليقات</Button>
                    <Button size="lg" variant="secondary">عرض إحصائيات الموقع</Button>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
