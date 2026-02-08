'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import type { AccountabilityEntry } from '@/lib/types';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { BookCheck, Calendar as CalendarIcon, Loader2, Save } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useRouter } from 'next/navigation';


const SectionCard = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <Card>
        <CardHeader><CardTitle className="font-headline">{title}</CardTitle></CardHeader>
        <CardContent className="space-y-6">{children}</CardContent>
    </Card>
);

const QuestionRadio = ({ label, name, value, onValueChange, options, disabled }: { label: string, name: string, value?: string, onValueChange: (value: string) => void, options: { label: string, value: string }[], disabled: boolean }) => (
    <div className="space-y-2">
        <Label>{label}</Label>
        <RadioGroup name={name} value={value} onValueChange={onValueChange} className="flex gap-4 flex-wrap" disabled={disabled}>
            {options.map(opt => (
                <div key={opt.value} className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value={opt.value} id={`${name}-${opt.value}`} />
                    <Label htmlFor={`${name}-${opt.value}`} className="cursor-pointer">{opt.label}</Label>
                </div>
            ))}
        </RadioGroup>
    </div>
);

export default function AccountabilityPage() {
    const { toast } = useToast();
    const router = useRouter();
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();
    
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    
    const dateId = useMemo(() => format(selectedDate, 'yyyy-MM-dd'), [selectedDate]);

    const entryDocRef = useMemoFirebase(
        () => (user && firestore ? doc(firestore, 'users', user.uid, 'accountability', dateId) : null),
        [user, firestore, dateId]
    );

    const { data: currentEntry, isLoading: isEntryLoading } = useDoc<AccountabilityEntry>(entryDocRef);

    const [formState, setFormState] = useState<Partial<AccountabilityEntry>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/auth/login?redirect_to=/accountability');
        }
    }, [isUserLoading, user, router]);

    useEffect(() => {
        if (currentEntry) {
            setFormState(currentEntry);
        } else {
            setFormState({}); // Reset form for new date
        }
    }, [currentEntry]);

    const handleValueChange = (field: keyof AccountabilityEntry, value: any) => {
        setFormState(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        if (!user || !firestore || !entryDocRef) {
            toast({ variant: 'destructive', title: "خطأ", description: 'يجب تسجيل الدخول لحفظ البيانات.' });
            return;
        }
        setIsSubmitting(true);
        const dataToSave = {
            ...formState,
            userId: user.uid,
            date: Timestamp.fromDate(selectedDate),
        };
        
        setDocumentNonBlocking(entryDocRef, dataToSave, { merge: true });

        // Optimistic UI, but give feedback
        setTimeout(() => {
            toast({ title: 'تم الحفظ!', description: `تم حفظ محاسبة يوم ${format(selectedDate, 'd MMMM yyyy', { locale: ar })}.` });
            setIsSubmitting(false);
        }, 500);
    };

    if (isUserLoading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-16 w-16 animate-spin" /></div>;
    }
    
    const isLoading = isEntryLoading;

    return (
        <div className="space-y-8">
            <header className="space-y-4">
                <h1 className="text-4xl font-bold font-headline flex items-center gap-3">
                    <BookCheck className="h-9 w-9 animate-icon-draw" />
                    محاسبة النفس
                </h1>
                <p className="text-lg text-muted-foreground">
                    "حَاسِبُوا أَنْفُسَكُمْ قَبْلَ أَنْ تُحَاسَبُوا، وَزِنُوا أَنْفُسَكُمْ قَبْلَ أَنْ تُوزَنُوا" - عمر بن الخطاب رضي الله عنه
                </p>
                <Card className="max-w-md">
                    <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-4">
                        <Label className="text-lg font-semibold">اليوم:</Label>
                         <Popover>
                            <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn("w-[280px] justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {selectedDate ? format(selectedDate, "PPP", { locale: ar }) : <span>اختر تاريخًا</span>}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={selectedDate} onSelect={(d) => d && setSelectedDate(d)} initialFocus />
                            </PopoverContent>
                        </Popover>
                    </CardContent>
                </Card>
            </header>

            {isLoading ? (
                <div className="flex justify-center p-16"><Loader2 className="h-12 w-12 animate-spin" /></div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-8">
                        <SectionCard title="الصلاة">
                            <QuestionRadio label="صلاة الفجر؟" name="fajr" value={formState.fajr} onValueChange={(v) => handleValueChange('fajr', v)} options={[{label: 'في وقتها', value: 'on-time'}, {label: 'بعد الوقت', value: 'late'}, {label: 'لم أصلها', value: 'missed'}]} disabled={isSubmitting} />
                            <QuestionRadio label="السنن الرواتب؟" name="sunnah" value={formState.sunnah} onValueChange={(v) => handleValueChange('sunnah', v)} options={[{label: 'كلها', value: 'all'}, {label: 'معظمها', value: 'most'}, {label: 'بعضها', value: 'some'}, {label: 'لم أصل شيئًا', value: 'none'}]} disabled={isSubmitting} />
                            <QuestionRadio label="صلاة الضحى؟" name="duha" value={formState.duha?.toString()} onValueChange={(v) => handleValueChange('duha', v === 'true')} options={[{label: 'نعم', value: 'true'}, {label: 'لا', value: 'false'}]} disabled={isSubmitting} />
                            <QuestionRadio label="قيام الليل؟" name="qiyam" value={formState.qiyam?.toString()} onValueChange={(v) => handleValueChange('qiyam', v === 'true')} options={[{label: 'نعم', value: 'true'}, {label: 'لا', value: 'false'}]} disabled={isSubmitting} />
                            <QuestionRadio label="صلاة الوتر؟" name="witr" value={formState.witr?.toString()} onValueChange={(v) => handleValueChange('witr', v === 'true')} options={[{label: 'نعم', value: 'true'}, {label: 'لا', value: 'false'}]} disabled={isSubmitting} />
                        </SectionCard>

                         <SectionCard title="القرآن">
                            <QuestionRadio label="هل قرأت وردك اليومي؟" name="quranWird" value={formState.quranWird?.toString()} onValueChange={(v) => handleValueChange('quranWird', v === 'true')} options={[{label: 'نعم', value: 'true'}, {label: 'لا', value: 'false'}]} disabled={isSubmitting} />
                            <QuestionRadio label="مقدار القراءة؟" name="quranAmount" value={formState.quranAmount} onValueChange={(v) => handleValueChange('quranAmount', v)} options={[{label: 'جزء أو أكثر', value: 'juz'}, {label: 'نصف جزء', value: 'half-juz'}, {label: 'أقل من نصف جزء', value: 'less'}]} disabled={isSubmitting} />
                            <QuestionRadio label="هل تدبرت الآيات؟" name="quranTadabbur" value={formState.quranTadabbur?.toString()} onValueChange={(v) => handleValueChange('quranTadabbur', v === 'true')} options={[{label: 'نعم', value: 'true'}, {label: 'لا', value: 'false'}]} disabled={isSubmitting} />
                            <QuestionRadio label="هل استمعت للقرآن؟" name="quranListen" value={formState.quranListen?.toString()} onValueChange={(v) => handleValueChange('quranListen', v === 'true')} options={[{label: 'نعم', value: 'true'}, {label: 'لا', value: 'false'}]} disabled={isSubmitting} />
                        </SectionCard>
                        
                        <SectionCard title="طلب العلم">
                            <QuestionRadio label="هل استمعت لمحاضرة أو درس علمي؟" name="listenedToLecture" value={formState.listenedToLecture?.toString()} onValueChange={(v) => handleValueChange('listenedToLecture', v === 'true')} options={[{label: 'نعم', value: 'true'}, {label: 'لا', value: 'false'}]} disabled={isSubmitting} />
                            <QuestionRadio label="هل قرأت في كتاب نافع؟" name="readBook" value={formState.readBook?.toString()} onValueChange={(v) => handleValueChange('readBook', v === 'true')} options={[{label: 'نعم', value: 'true'}, {label: 'لا', value: 'false'}]} disabled={isSubmitting} />
                        </SectionCard>
                    </div>

                    <div className="space-y-8">
                        <SectionCard title="الأذكار">
                            <QuestionRadio label="أذكار الصباح والمساء؟" name="adhkarMorningEvening" value={formState.adhkarMorningEvening?.toString()} onValueChange={(v) => handleValueChange('adhkarMorningEvening', v === 'true')} options={[{label: 'نعم', value: 'true'}, {label: 'لا', value: 'false'}]} disabled={isSubmitting} />
                            <QuestionRadio label="أذكار بعد الصلاة؟" name="adhkarAfterSalah" value={formState.adhkarAfterSalah?.toString()} onValueChange={(v) => handleValueChange('adhkarAfterSalah', v === 'true')} options={[{label: 'نعم', value: 'true'}, {label: 'لا', value: 'false'}]} disabled={isSubmitting} />
                            <QuestionRadio label="أذكار النوم؟" name="adhkarBeforeSleep" value={formState.adhkarBeforeSleep?.toString()} onValueChange={(v) => handleValueChange('adhkarBeforeSleep', v === 'true')} options={[{label: 'نعم', value: 'true'}, {label: 'لا', value: 'false'}]} disabled={isSubmitting} />
                            <QuestionRadio label="الاستغفار والتسبيح والتهليل؟" name="adhkarGeneral" value={formState.adhkarGeneral?.toString()} onValueChange={(v) => handleValueChange('adhkarGeneral', v === 'true')} options={[{label: 'نعم', value: 'true'}, {label: 'لا', value: 'false'}]} disabled={isSubmitting} />
                        </SectionCard>

                        <SectionCard title="السلوك والأخلاق">
                            <QuestionRadio label="هل كنت بارًا بوالديك؟" name="parentsDutifulness" value={formState.parentsDutifulness} onValueChange={(v) => handleValueChange('parentsDutifulness', v)} options={[{label: 'نعم', value: 'yes'}, {label: 'إلى حد ما', value: 'somewhat'}, {label: 'لا', value: 'no'}]} disabled={isSubmitting} />
                            <QuestionRadio label="هل حفظت لسانك عن الغيبة والنميمة؟" name="tongueGuarded" value={formState.tongueGuarded} onValueChange={(v) => handleValueChange('tongueGuarded', v)} options={[{label: 'نعم', value: 'yes'}, {label: 'إلى حد ما', value: 'somewhat'}, {label: 'لا', value: 'no'}]} disabled={isSubmitting} />
                            <QuestionRadio label="هل غضضت بصرك عن الحرام؟" name="gazeLowered" value={formState.gazeLowered} onValueChange={(v) => handleValueChange('gazeLowered', v)} options={[{label: 'نعم', value: 'yes'}, {label: 'إلى حد ما', value: 'somewhat'}, {label: 'لا', value: 'no'}]} disabled={isSubmitting} />
                            <QuestionRadio label="هل كنت صادقًا في حديثك؟" name="truthful" value={formState.truthful} onValueChange={(v) => handleValueChange('truthful', v)} options={[{label: 'نعم', value: 'yes'}, {label: 'إلى حد ما', value: 'somewhat'}, {label: 'لا', value: 'no'}]} disabled={isSubmitting} />
                        </SectionCard>
                        
                         <SectionCard title="ملاحظات ونوايا الغد">
                            <Textarea placeholder="اكتب هنا ما قصرت فيه اليوم، وما تنوي أن تفعله غدًا..." rows={6} value={formState.notes || ''} onChange={(e) => handleValueChange('notes', e.target.value)} disabled={isSubmitting} />
                        </SectionCard>
                    </div>
                </div>
            )}

            <div className="flex justify-end sticky bottom-24 md:bottom-8">
                <Button size="lg" onClick={handleSave} disabled={isSubmitting || isLoading}>
                    {isSubmitting ? <Loader2 className="me-2 h-5 w-5 animate-spin" /> : <Save className="me-2 h-5 w-5" />}
                    حفظ
                </Button>
            </div>
        </div>
    );
}
    