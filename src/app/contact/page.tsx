'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export default function ContactPage() {
  const { t, isRtl } = useTranslation();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setSubmitted(true);
    toast({
      title: t('تم استلام رسالتك بنجاح', 'Message received'),
      description: t(
        'شكراً لتواصلك معنا، سيقوم فريق وقفة بالرد عليك في أقرب وقت.',
        'Thank you for reaching out. Our team will respond shortly.'
      ),
    });
    form.reset();
  };

  return (
    <div className="min-h-screen pb-20" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-3 sm:px-6 pt-6 md:pt-10 space-y-10 max-w-6xl">
        {/* Clean Header */}
        <header className="space-y-3 pb-6 border-b border-border/60">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{t('جسر التواصل', 'Get in Touch')}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-headline text-foreground tracking-tight">
            {t('تواصل', 'Contact')} <span className="text-primary">{t('معنا', 'Us')}</span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed">
            {t(
              'نسعد دائماً باستقبال اقتراحاتكم، استفساراتكم، وملاحظاتكم لتطوير المنصة.',
              'We welcome your suggestions, questions, and feedback to improve the platform.'
            )}
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Contact Info Cards */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3.5">
            {[
              {
                label: t('البريد الإلكتروني', 'Email'),
                value: 'contact@waqfah.com',
                icon: Mail,
                color: 'text-primary bg-primary/10',
              },
              {
                label: t('واتساب الدعم', 'Support WhatsApp'),
                value: '+20 123 456 789',
                icon: Phone,
                color: 'text-emerald-500 bg-emerald-500/10',
              },
              {
                label: t('المقر', 'Location'),
                value: t('القاهرة، مصر', 'Cairo, Egypt'),
                icon: MapPin,
                color: 'text-sky-500 bg-sky-500/10',
              },
              {
                label: t('ساعات العمل', 'Working Hours'),
                value: t('الأحد - الخميس (9 ص - 5 م)', 'Sun - Thu (9 AM - 5 PM)'),
                icon: Clock,
                color: 'text-amber-500 bg-amber-500/10',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-card/80 border border-border flex items-center gap-4 shadow-sm"
              >
                <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center shrink-0', item.color)}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-bold text-foreground mt-0.5 truncate">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7 p-6 md:p-8 rounded-3xl bg-card/80 border border-border shadow-sm">
            {submitted && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center gap-3 text-sm font-bold">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>
                  {t('تم إرسال رسالتك بنجاح! شكراً لتواصلك معنا.', 'Your message was sent successfully!')}
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-bold text-muted-foreground">
                    {t('الاسم بالكامل', 'Full Name')}
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    placeholder={t('أدخل اسمك...', 'Enter your name...')}
                    className="h-11 bg-background border-border rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-bold text-muted-foreground">
                    {t('البريد الإلكتروني', 'Email Address')}
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="example@email.com"
                    className="h-11 bg-background border-border rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject" className="text-xs font-bold text-muted-foreground">
                  {t('الموضوع', 'Subject')}
                </Label>
                <Input
                  id="subject"
                  name="subject"
                  required
                  placeholder={t('ما هو موضوع رسالتك؟', 'What is your message about?')}
                  className="h-11 bg-background border-border rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-xs font-bold text-muted-foreground">
                  {t('الرسالة', 'Message')}
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  placeholder={t('اكتب تفاصيل رسالتك هنا...', 'Write your message here...')}
                  className="bg-background border-border rounded-2xl resize-none"
                />
              </div>

              <Button type="submit" className="w-full h-12 rounded-xl font-bold text-base gap-2">
                <Send className="w-4 h-4" />
                <span>{t('إرسال الرسالة', 'Send Message')}</span>
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
