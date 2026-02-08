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
import { BookCheck, Calendar as CalendarIcon, Loader2, Save, Sunrise, BookOpen, Sparkles, HeartHandshake, GraduationCap, Notebook } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useRouter } from 'next/navigation';

// A more visually engaging card for each section
const SectionCard = ({ title, icon: Icon, children }: { title: string, icon: React.ElementType, children: React.ReactNode }) => (
    <Card className="transform-gpu transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="font-headline text-2xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 pt-4">{children}</CardContent>
    </Card>
);

// Styled radio group options
const QuestionRadio = ({ label, name, value, onValueChange, options, disabled }: { label: string, name: string, value?: string, onValueChange: (value: string) => void, options: { label: string, value: string }[], disabled: boolean }) => (
    <div className="space-y-3">
        <Label className="text-lg font-semibold">{label}</Label>
        <RadioGroup name={name} value={value} onValueChange={onValueChange} className="flex flex-wrap gap-3" disabled={disabled}>
            {options.map(opt => (
                <div key={opt.value}>
                    <RadioGroupItem value={opt.value} id={`${name}-${opt.value}`} className="sr-only" />
                    <Label 
                        htmlFor={`${name}-${opt.value}`} 
                        className={cn(
                            "cursor-pointer rounded-full border-2 border-border px-4 py-2 transition-colors",
                            "hover:bg-accent hover:text-accent-foreground",
                            value === opt.value ? "bg-primary text-primary-foreground border-primary" : "bg-transparent"
                        )}
                    >
                        {opt.label}
                    </Label>
                </div>
            ))}
        </RadioGroup>
    </div>
);

// Toggle-like radio for Yes/No questions
const QuestionToggle = ({ label, name, value, onValueChange, disabled }: { label: string, name: string, value?: boolean, onValueChange: (value: boolean) => void, disabled: boolean }) => (
    <div className="space-y-3">
        <Label className="text-lg font-semibold">{label}</Label>
        <RadioGroup name={name} value={value?.toString()} onValueChange={(v) => onValueChange(v === 'true')} className="flex flex-wrap gap-3" disabled={disabled}>
            <div>
                <RadioGroupItem value="true" id={`${name}-true`} className="sr-only" />
                <Label htmlFor={`${name}-true`} className={cn("cursor-pointer rounded-full border-2 px-6 py-2 transition-colors", value === true ? "bg-primary text-primary-foreground border-primary" : "bg-transparent hover:bg-accent")}>نعم</Label>
            </div>
            <div>
                <RadioGroupItem value="false" id={`${name}-false`} className="sr-only" />
                <Label htmlFor={`${name}-false`} className={cn("cursor-pointer rounded-full border-2 px-6 py-2 transition-colors", value === false ? "bg-destructive text-destructive-foreground border-destructive" : "bg-transparent hover:bg-accent")}>لا</Label>
            </div>
        </RadioGroup>
    </div>
);


export function AccountabilityTracker({ redirectToOnAuth = '/accountability', showHeader = true }: { redirectToOnAuth?: string, showHeader?: boolean }) {
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
            router.push(`/auth/login?redirect_to=${redirectToOnAuth}`);
        }
    }, [isUserLoading, user, router, redirectToOnAuth]);

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

    if (isUserLoading && !user) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-16 w-16 animate-spin" /></div>;
    }
    
    const isLoading = isEntryLoading;

    return (
        <div className="space-y-8">
            {showHeader && (
                <header className="space-y-4 text-center">
                    <BookCheck className="mx-auto h-16 w-16 text-primary animate-pulse" />
                    <h1 className="text-5xl font-extrabold mt-4 mb-3 font-headline tracking-tight">محاسبة النفس</h1>
                    <p className="max-w-2xl mx-auto text-xl text-muted-foreground">
                        "حَاسِبُوا أَنْفُسَكُمْ قَبْلَ أَنْ تُحَاسَبُوا، وَزِنُوا أَنْفُسَكُمْ قَبْلَ أَنْ تُوزَنُوا" - عمر بن الخطاب رضي الله عنه
                    </p>
                </header>
            )}

            <Card className="max-w-md mx-auto sticky top-20 z-20">
                <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-center gap-4">
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

            {isLoading ? (
                <div className="flex justify-center p-16"><Loader2 className="h-12 w-12 animate-spin" /></div>
            ) : (
                <div className="max-w-4xl mx-auto space-y-8">
                    <SectionCard title="الصلاة" icon={Sunrise}>
                        <QuestionRadio label="صلاة الفجر؟" name="fajr" value={formState.fajr} onValueChange={(v) => handleValueChange('fajr', v)} options={[{label: 'في وقتها', value: 'on-time'}, {label: 'بعد الوقت', value: 'late'}, {label: 'لم أصلها', value: 'missed'}]} disabled={isSubmitting} />
                        <QuestionRadio label="السنن الرواتب؟" name="sunnah" value={formState.sunnah} onValueChange={(v) => handleValueChange('sunnah', v)} options={[{label: 'كلها', value: 'all'}, {label: 'معظمها', value: 'most'}, {label: 'بعضها', value: 'some'}, {label: 'لم أصل شيئًا', value: 'none'}]} disabled={isSubmitting} />
                        <QuestionToggle label="صلاة الضحى؟" name="duha" value={formState.duha} onValueChange={(v) => handleValueChange('duha', v)} disabled={isSubmitting} />
                        <QuestionToggle label="قيام الليل؟" name="qiyam" value={formState.qiyam} onValueChange={(v) => handleValueChange('qiyam', v)} disabled={isSubmitting} />
                        <QuestionToggle label="صلاة الوتر؟" name="witr" value={formState.witr} onValueChange={(v) => handleValueChange('witr', v)} disabled={isSubmitting} />
                    </SectionCard>

                    <SectionCard title="القرآن" icon={BookOpen}>
                        <QuestionToggle label="هل قرأت وردك اليومي؟" name="quranWird" value={formState.quranWird} onValueChange={(v) => handleValueChange('quranWird', v)} disabled={isSubmitting} />
                        <QuestionRadio label="مقدار القراءة؟" name="quranAmount" value={formState.quranAmount} onValueChange={(v) => handleValueChange('quranAmount', v)} options={[{label: 'جزء أو أكثر', value: 'juz'}, {label: 'نصف جزء', value: 'half-juz'}, {label: 'أقل من نصف جزء', value: 'less'}]} disabled={isSubmitting} />
                        <QuestionToggle label="هل تدبرت الآيات؟" name="quranTadabbur" value={formState.quranTadabbur} onValueChange={(v) => handleValueChange('quranTadabbur', v)} disabled={isSubmitting} />
                        <QuestionToggle label="هل استمعت للقرآن؟" name="quranListen" value={formState.quranListen} onValueChange={(v) => handleValueChange('quranListen', v)} disabled={isSubmitting} />
                    </SectionCard>

                    <SectionCard title="الأذكار" icon={Sparkles}>
                        <QuestionToggle label="أذكار الصباح والمساء؟" name="adhkarMorningEvening" value={formState.adhkarMorningEvening} onValueChange={(v) => handleValueChange('adhkarMorningEvening', v)} disabled={isSubmitting} />
                        <QuestionToggle label="أذكار بعد الصلاة؟" name="adhkarAfterSalah" value={formState.adhkarAfterSalah} onValueChange={(v) => handleValueChange('adhkarAfterSalah', v)} disabled={isSubmitting} />
                        <QuestionToggle label="أذكار النوم؟" name="adhkarBeforeSleep" value={formState.adhkarBeforeSleep} onValueChange={(v) => handleValueChange('adhkarBeforeSleep', v)} disabled={isSubmitting} />
                        <QuestionToggle label="الاستغفار والتسبيح والتهليل؟" name="adhkarGeneral" value={formState.adhkarGeneral} onValueChange={(v) => handleValueChange('adhkarGeneral', v)} disabled={isSubmitting} />
                    </SectionCard>

                    <SectionCard title="السلوك وطلب العلم" icon={GraduationCap}>
                        <QuestionRadio label="هل كنت بارًا بوالديك؟" name="parentsDutifulness" value={formState.parentsDutifulness} onValueChange={(v) => handleValueChange('parentsDutifulness', v)} options={[{label: 'نعم', value: 'yes'}, {label: 'إلى حد ما', value: 'somewhat'}, {label: 'لا', value: 'no'}]} disabled={isSubmitting} />
                        <QuestionRadio label="هل حفظت لسانك عن الغيبة والنميمة؟" name="tongueGuarded" value={formState.tongueGuarded} onValueChange={(v) => handleValueChange('tongueGuarded', v)} options={[{label: 'نعم', value: 'yes'}, {label: 'إلى حد ما', value: 'somewhat'}, {label: 'لا', value: 'no'}]} disabled={isSubmitting} />
                        <QuestionRadio label="هل غضضت بصرك عن الحرام؟" name="gazeLowered" value={formState.gazeLowered} onValueChange={(v) => handleValueChange('gazeLowered', v)} options={[{label: 'نعم', value: 'yes'}, {label: 'إلى حد ما', value: 'somewhat'}, {label: 'لا', value: 'no'}]} disabled={isSubmitting} />
                        <QuestionRadio label="هل كنت صادقًا في حديثك؟" name="truthful" value={formState.truthful} onValueChange={(v) => handleValueChange('truthful', v)} options={[{label: 'نعم', value: 'yes'}, {label: 'إلى حد ما', value: 'somewhat'}, {label: 'لا', value: 'no'}]} disabled={isSubmitting} />
                        <QuestionToggle label="هل استمعت لمحاضرة أو درس علمي؟" name="listenedToLecture" value={formState.listenedToLecture} onValueChange={(v) => handleValueChange('listenedToLecture', v)} disabled={isSubmitting} />
                        <QuestionToggle label="هل قرأت في كتاب نافع؟" name="readBook" value={formState.readBook} onValueChange={(v) => handleValueChange('readBook', v)} disabled={isSubmitting} />
                    </SectionCard>
                    
                    <SectionCard title="ملاحظات ونوايا الغد" icon={Notebook}>
                        <Textarea placeholder="اكتب هنا ما قصرت فيه اليوم، وما تنوي أن تفعله غدًا..." rows={6} value={formState.notes || ''} onChange={(e) => handleValueChange('notes', e.target.value)} disabled={isSubmitting} />
                    </SectionCard>
                </div>
            )}

            <div className="flex justify-end sticky bottom-4 md:bottom-8">
                <Button size="lg" onClick={handleSave} disabled={isSubmitting || isLoading} className="shadow-lg">
                    {isSubmitting ? <Loader2 className="me-2 h-5 w-5 animate-spin" /> : <Save className="me-2 h-5 w-5" />}
                    حفظ التقييم
                </Button>
            </div>
        </div>
    );
}
