
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getAllScheduleItems } from '@/lib/data';
import { CalendarPlus } from 'lucide-react';
import type { ScheduleItem } from '@/lib/types';

export const metadata = {
    title: 'جدول الدروس',
};

// Revalidate this page every hour
export const revalidate = 3600;

function generateICSLink(item: ScheduleItem) {
    if (!item.dateTime?.toDate) return '#';

    const startTime = item.dateTime.toDate();
    const endTime = new Date(startTime.getTime() + (item.duration || 60) * 60 * 1000); // Default to 60 minutes if no duration

    const toICSFormat = (date: Date) => {
        return date.toISOString().replace(/[-:.]/g, '');
    }

    const event = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        `DTSTART:${toICSFormat(startTime)}`,
        `DTEND:${toICSFormat(endTime)}`,
        `SUMMARY:${encodeURIComponent(item.title)}`,
        `DESCRIPTION:${encodeURIComponent(item.isLive ? "بث مباشر" : "درس مسجل")}`,
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\n');

    return `data:text/calendar;charset=utf8,${event}`;
}


export default async function SchedulePage() {
  const scheduleItems = await getAllScheduleItems();

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8 font-headline">جدول الدروس والبث المباشر</h1>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">الدروس القادمة</CardTitle>
          <CardDescription>أضف مواعيد الدروس إلى تقويمك الخاص لتبقى على اطلاع دائم.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {scheduleItems.map((item, index) => (
              <div key={item.id}>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4">
                    <div>
                        <h3 className="text-xl font-bold text-foreground font-headline">{item.title}</h3>
                        <p className="text-muted-foreground">{item.date}</p>
                        <p className="text-muted-foreground">{item.time}</p>
                         {item.isLive && (
                           <span className="inline-flex items-center mt-2">
                             <span className="relative flex h-3 w-3">
                               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                               <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                             </span>
                             <span className="ms-2 text-sm font-semibold text-destructive">بث مباشر الآن</span>
                           </span>
                        )}
                    </div>
                    <Button asChild>
                        <a href={generateICSLink(item)} download={`${item.title}.ics`}>
                            <CalendarPlus className="me-2"/>
                            أضف إلى التقويم
                        </a>
                    </Button>
                </div>
                {index < scheduleItems.length - 1 && <Separator />}
              </div>
            ))}
             {!scheduleItems || scheduleItems.length === 0 && (
                <p className="text-center text-muted-foreground py-8">لا توجد دروس مجدولة حالياً.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
