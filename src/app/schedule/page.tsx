import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getAllScheduleItems } from '@/lib/data';

export const metadata = {
    title: 'جدول الدروس',
};

export default function SchedulePage() {
  const scheduleItems = getAllScheduleItems();

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8 font-headline">جدول الدروس والبث المباشر</h1>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">الدروس القادمة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scheduleItems.map((item, index) => (
              <div key={item.id}>
                <div className="pb-4">
                  <h3 className="text-xl font-bold text-primary-foreground/90 font-headline">{item.title}</h3>
                  <p className="text-muted-foreground">{item.date}</p>
                  <p className="text-muted-foreground">{item.time}</p>
                  {item.isLive && (
                    <Badge variant="destructive" className="mt-2 animate-pulse">بث مباشر</Badge>
                  )}
                </div>
                {index < scheduleItems.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
