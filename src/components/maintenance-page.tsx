
import { Wrench } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export function MaintenancePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <Wrench className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="mt-4 text-3xl font-headline">
            الموقع تحت الصيانة حاليًا
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-lg">
            نحن نقوم ببعض التحسينات والتحديثات لتحسين تجربتك. سنعود للعمل قريبًا جدًا. شكرًا لصبركم!
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
