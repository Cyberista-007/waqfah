
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Server, Film, BookOpen, Gift, Users, Share2, CreditCard, Landmark } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
    title: 'دعم الموقع',
};

export default function DonationsPage() {
  const donationReasons = [
    {
      icon: Server,
      title: 'تكاليف الاستضافة',
      description: 'ضمان بقاء الموقع سريعًا ومتاحًا للجميع على مدار الساعة.',
      example: 'كل 50$ تساعد في تغطية تكاليف الخادم ليوم كامل.'
    },
    {
      icon: Film,
      title: 'إنتاج محتوى جديد',
      description: 'المساعدة في تسجيل وتحرير ونشر المزيد من المحاضرات والسلاسل العلمية.',
      example: 'كل 25$ تساهم في تفريغ محاضرة صوتية واحدة.'
    },
    {
      icon: BookOpen,
      title: 'التفريغ النصي والترجمة',
      description: 'توفير تفريغات نصية دقيقة وترجمات للمحتوى للوصول إلى جمهور أوسع.',
      example: 'كل 10$ تساعد في ترجمة صفحة من محتوى علمي.'
    },
  ];

  const otherWaysToSupport = [
      {
          icon: Share2,
          title: 'شارك المحتوى',
          description: 'أفضل دعم تقدمه هو نشر العلم. شارك المحاضرات التي تعجبك مع الآخرين.'
      },
      {
          icon: Users,
          title: 'تطوع معنا',
          description: 'إذا كانت لديك مهارات في البرمجة، التصميم، أو التفريغ الصوتي، فتواصل معنا.',
          action: <Button asChild variant="link"><Link href="/contact">تواصل معنا</Link></Button>
      },
      {
          icon: Gift,
          title: 'ادعُ لنا',
          description: 'دعاؤكم لنا بظهر الغيب من أعظم أشكال الدعم التي نتوق إليها.'
      }
  ]

  return (
    <div className="space-y-16">
      <section className="text-center">
        <Heart className="mx-auto h-16 w-16 text-primary animate-pulse" />
        <h1 className="text-5xl font-extrabold mt-4 mb-3 font-headline tracking-tight">ادعم استمرارية هذا العلم</h1>
        <p className="max-w-3xl mx-auto text-xl text-muted-foreground">
          كل مساهمة، مهما كانت صغيرة، تساعدنا على نشر العلم الشرعي وجعله متاحًا للملايين حول العالم.
        </p>
      </section>

      <section>
        <Card className="bg-primary/5 border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline text-primary">
              <Heart className="h-6 w-6 fill-current" />
              رسالة من مطور الموقع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-foreground/80 leading-relaxed">
              هذا المشروع تم تطويره كعمل خالص لوجه الله تعالى، بهدف نشر العلم النافع وتيسير وصوله لأبناء الأمة الإسلامية.
              مطور الموقع لا يتقاضى أي أجر شخصي من هذه التبرعات. جميع المساهمات تُستخدم بشكل مباشر لتغطية التكاليف التشغيلية للموقع وضمان استمراريته ونموه.
            </p>
          </CardContent>
        </Card>
      </section>
      
      <section>
          <Card className="bg-card/50">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-headline">اختر طريقة الدعم المناسبة لك</CardTitle>
            </CardHeader>
             <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="rounded-lg p-6 text-center space-y-4 border">
                    <h3 className="text-xl font-bold font-headline flex items-center justify-center gap-2">
                        <Heart className="h-5 w-5" /> دعم شهري (باتريون)
                    </h3>
                    <p className="text-muted-foreground text-sm">
                        دعمك المستمر يضمن لنا الاستقرار المالي ويساعدنا في التخطيط طويل الأمد.
                    </p>
                     <Button asChild size="lg" variant="secondary" className="w-full">
                        <Link href="#">ادعمنا عبر باتريون</Link>
                    </Button>
                </div>
                 <div className="rounded-lg p-6 text-center space-y-4 border">
                    <h3 className="text-xl font-bold font-headline flex items-center justify-center gap-2">
                        <svg className="h-6 w-6" viewBox="0 0 24 24"><path fill="currentColor" d="M7.336 2.112H2.944a.2.2 0 00-.2.2v16.945a.2.2 0 00.2.2h3.626v-6.072h1.614a4.41 4.41 0 110-8.82H7.336zm4.618 5.378a.65.65 0 00-.65.65v5.18a.65.65 0 00.65.65h1.16a.65.65 0 000-1.3H12.6V8.14a.65.65 0 00-.646-.65zM15.42 8.7a.64.64 0 000 1.28h.592v3.29h-.592a.64.64 0 100 1.28h.592a2.536 2.536 0 002.536-2.536V9.91a2.536 2.536 0 00-2.536-2.535h-1.87a.64.64 0 000 1.28h1.278z"></path></svg>
                        تبرع لمرة واحدة (باي بال)
                    </h3>
                    <p className="text-muted-foreground text-sm">
                       ساهم ولو لمرة واحدة لتغطية التكاليف التشغيلية.
                    </p>
                    <Button asChild size="lg" className="w-full">
                        <Link href="#">تبرع عبر باي بال</Link>
                    </Button>
                </div>
                 <div className="rounded-lg p-6 text-center space-y-4 border">
                    <h3 className="text-xl font-bold font-headline flex items-center justify-center gap-2">
                        <CreditCard className="h-5 w-5" /> البطاقة الإئتمانية (Stripe)
                    </h3>
                    <p className="text-muted-foreground text-sm">
                       طريقة آمنة ومباشرة لدعم الموقع باستخدام بطاقتك الإئتمانية.
                    </p>
                    <Button asChild size="lg" className="w-full">
                        <Link href="#">تبرع عبر Stripe</Link>
                    </Button>
                </div>
                <div className="rounded-lg p-6 text-center space-y-4 border">
                    <h3 className="text-xl font-bold font-headline flex items-center justify-center gap-2">
                        <Landmark className="h-5 w-5" /> تحويل بنكي مباشر
                    </h3>
                    <p className="text-muted-foreground text-sm">
                       للمساهمات المباشرة، يمكنكم استخدام تفاصيل الحساب البنكي.
                    </p>
                    <Button asChild size="lg" variant="secondary" className="w-full">
                        <Link href="#">عرض تفاصيل الحساب</Link>
                    </Button>
                </div>
            </CardContent>
          </Card>
      </section>

      <section>
        <h2 className="text-3xl font-bold text-center mb-8 font-headline">أين تذهب مساهماتكم؟</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {donationReasons.map((reason, index) => {
            const Icon = reason.icon;
            return (
              <Card key={index} className="text-center p-6 border-0 shadow-none bg-transparent">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2 font-headline">{reason.title}</h3>
                <p className="text-muted-foreground">{reason.description}</p>
                <p className="text-sm font-semibold text-primary mt-3">{reason.example}</p>
              </Card>
            );
          })}
        </div>
      </section>

      <section>
          <h2 className="text-3xl font-bold text-center mb-8 font-headline">طرق أخرى للدعم</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {otherWaysToSupport.map((way, index) => {
                const Icon = way.icon;
                return (
                    <Card key={index} className="bg-card/50 p-6 text-center flex flex-col">
                      <div className="flex-grow">
                        <Icon className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-bold font-headline">{way.title}</h3>
                        <p className="text-sm text-muted-foreground mt-2">{way.description}</p>
                      </div>
                      {way.action && <div className="mt-4">{way.action}</div>}
                    </Card>
                )
            })}
          </div>
      </section>
    </div>
  );
}
