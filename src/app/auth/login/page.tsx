
"use client";

import { useState, FormEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useUser, useAuth, useFirestore } from "@/firebase";
import { useRouter, useSearchParams } from "next/navigation";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getFirebaseAuthErrorMessage } from "@/lib/firebase-errors";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import type { UserProfile } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

function SubmitButton({ isLoginMode, isLoading }: { isLoginMode: boolean, isLoading: boolean }) {
  return (
    <Button
      type="submit"
      className="w-full text-white bg-primary/80 hover:bg-primary"
      disabled={isLoading}
    >
      {isLoading ? <Loader2 className="animate-spin" /> : isLoginMode ? "تسجيل الدخول" : "إنشاء حساب"}
    </Button>
  );
}

const countries = [
    { value: "AF", label: "أفغانستان" },
    { value: "AL", label: "ألبانيا" },
    { value: "DZ", label: "الجزائر" },
    { value: "AZ", label: "أذربيجان" },
    { value: "BH", label: "البحرين" },
    { value: "BD", label: "بنغلاديش" },
    { value: "BN", label: "بروناي" },
    { value: "BF", label: "بوركينا فاسو" },
    { value: "TD", label: "تشاد" },
    { value: "KM", label: "جزر القمر" },
    { value: "DJ", label: "جيبوتي" },
    { value: "EG", label: "مصر" },
    { value: "GM", label: "غامبيا" },
    { value: "GN", label: "غينيا" },
    { value: "ID", label: "إندونيسيا" },
    { value: "IR", label: "إيران" },
    { value: "IQ", label: "العراق" },
    { value: "JO", label: "الأردن" },
    { value: "KZ", label: "كازاخستان" },
    { value: "KW", label: "الكويت" },
    { value: "KG", label: "قيرغيزستان" },
    { value: "LB", label: "لبنان" },
    { value: "LY", label: "ليبيا" },
    { value: "MY", label: "ماليزيا" },
    { value: "MV", label: "جزر المالديف" },
    { value: "ML", label: "مالي" },
    { value: "MR", label: "موريتانيا" },
    { value: "MA", label: "المغرب" },
    { value: "NE", label: "النيجر" },
    { value: "NG", label: "نيجيريا" },
    { value: "OM", label: "عمان" },
    { value: "PK", label: "باكستان" },
    { value: "PS", label: "فلسطين" },
    { value: "QA", label: "قطر" },
    { value: "SA", label: "المملكة العربية السعودية" },
    { value: "SN", label: "السنغال" },
    { value: "SL", label: "سيراليون" },
    { value: "SO", label: "الصومال" },
    { value: "SD", label: "السودان" },
    { value: "SY", label: "سوريا" },
    { value: "TJ", label: "طاجيكستان" },
    { value: "TN", label: "تونس" },
    { value: "TR", label: "تركيا" },
    { value: "TM", label: "تركمانستان" },
    { value: "AE", label: "الإمارات العربية المتحدة" },
    { value: "UZ", label: "أوزبكستان" },
    { value: "YE", label: "اليمن" }
];


export default function LoginPage() {
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [countryOpen, setCountryOpen] = useState(false)
  const [countryValue, setCountryValue] = useState("")

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const fullName = `${'firstName'} ${'lastName'}`;
    
    const redirectTo = searchParams.get('redirect_to') || '/';

    if (!auth || !firestore) {
        toast({
            variant: "destructive",
            title: "خطأ في التهيئة",
            description: "خدمة المصادقة غير متوفرة. يرجى المحاولة مرة أخرى لاحقًا.",
        });
        setIsLoading(false);
        return;
    }

    if (isLoginMode) {
        // --- Login Logic ---
        if (!email || !password) {
            toast({ variant: "destructive", title: "حقول ناقصة", description: "يرجى إدخال البريد الإلكتروني وكلمة المرور." });
            setIsLoading(false);
            return;
        }
        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast({ title: "أهلاً بعودتك!", description: "تم تسجيل دخولك بنجاح." });
            router.push(redirectTo);
        } catch (error: any) {
            toast({ variant: "destructive", title: "حدث خطأ", description: getFirebaseAuthErrorMessage(error) });
        }
    } else {
        // --- Registration Logic ---
        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            toast({ variant: "destructive", title: "حقول ناقصة", description: "يرجى ملء جميع الحقول الإلزامية." });
            setIsLoading(false);
            return;
        }
        if (password !== confirmPassword) {
            toast({ variant: "destructive", title: "كلمة المرور غير متطابقة", description: "الرجاء التأكد من تطابق كلمة المرور وتأكيدها." });
            setIsLoading(false);
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const newUser = userCredential.user;
            
            await updateProfile(newUser, { displayName: fullName });
            
            const userRef = doc(firestore, "users", newUser.uid);
            const newUserProfile: Omit<UserProfile, 'id'> = {
                name: fullName,
                email: newUser.email!,
                firstName,
                lastName,
                country: countryValue,
                gender: formData.get("gender") as string,
                phone: formData.get("phone") as string,
                createdAt: Timestamp.now(),
            };
            await setDoc(userRef, newUserProfile, { merge: true });

            toast({ title: "تم إنشاء الحساب بنجاح!", description: "مرحباً بك." });
            router.push(redirectTo);
        } catch (error: any) {
            toast({ variant: "destructive", title: "حدث خطأ", description: getFirebaseAuthErrorMessage(error) });
        }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (!isUserLoading && user) {
        const redirectTo = searchParams.get('redirect_to') || '/';
        router.push(redirectTo);
    }
  },[user, isUserLoading, router, searchParams]);

  if (isUserLoading || user) {
      return (
          <div className="flex h-screen items-center justify-center">
              <Loader2 className="h-16 w-16 animate-spin" />
          </div>
      )
  }

  return (
    <div className="flex items-center justify-center py-12">
        <div className="w-full max-w-2xl">
          <Card className="w-full bg-card/80 backdrop-blur-md">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-headline">
                {isLoginMode ? "تسجيل الدخول" : "إنشاء حساب جديد"}
              </CardTitle>
              <CardDescription>
                {isLoginMode ? "أدخل بريدك الإلكتروني وكلمة المرور للمتابعة." : "أنشئ حساب جديد للاستفادة من ميزات الموقع."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {isLoginMode ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="email">البريد الإلكتروني</Label>
                      <Input id="email" name="email" type="email" required placeholder="أدخل بريدك الإلكتروني"/>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">كلمة المرور</Label>
                      <Input id="password" name="password" type="password" required placeholder="أدخل كلمة المرور" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">الاسم الأول</Label>
                            <Input id="firstName" name="firstName" type="text" required placeholder="الاسم الأول"/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">الاسم الأخير</Label>
                            <Input id="lastName" name="lastName" type="text" required placeholder="الاسم الأخير"/>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">البريد الإلكتروني</Label>
                        <Input id="email" name="email" type="email" required placeholder="أدخل بريدك الإلكتروني" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="gender">الجنس *</Label>
                            <Select name="gender" required>
                                <SelectTrigger><SelectValue placeholder="اختر الجنس" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">ذكر</SelectItem>
                                    <SelectItem value="female">أنثى</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="country">الدولة *</Label>
                             <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={countryOpen}
                                    className="w-full justify-between"
                                    >
                                    {countryValue
                                        ? countries.find((country) => country.value.toLowerCase() === countryValue)?.label
                                        : "اختر الدولة..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0">
                                    <Command>
                                        <CommandInput placeholder="ابحث عن الدولة..." />
                                        <CommandList>
                                            <CommandEmpty>لم يتم العثور على الدولة.</CommandEmpty>
                                            <CommandGroup>
                                                {countries.map((country) => (
                                                <CommandItem
                                                    key={country.value}
                                                    value={country.label}
                                                    onSelect={(currentValue) => {
                                                        const selected = countries.find(c => c.label.toLowerCase() === currentValue);
                                                        setCountryValue(selected ? selected.value.toLowerCase() : "")
                                                        setCountryOpen(false)
                                                    }}
                                                >
                                                    <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        countryValue === country.value.toLowerCase() ? "opacity-100" : "opacity-0"
                                                    )}
                                                    />
                                                    {country.label}
                                                </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="phone">رقم الهاتف (اختياري)</Label>
                        <Input id="phone" name="phone" type="tel" placeholder="أدخل رقم الهاتف" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">كلمة المرور</Label>
                      <Input id="password" name="password" type="password" required placeholder="أدخل كلمة المرور" />
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                      <Input id="confirmPassword" name="confirmPassword" type="password" required placeholder="أعد إدخال كلمة المرور" />
                    </div>
                  </>
                )}
                 <SubmitButton isLoginMode={isLoginMode} isLoading={isLoading} />
              </form>
               <div className="mt-4 text-center text-sm">
                    {isLoginMode ? "ليس لديك حساب؟" : "لديك حساب بالفعل؟"}{' '}
                    <Button variant="link" className="p-0 h-auto text-primary hover:underline" onClick={() => setIsLoginMode(!isLoginMode)}>
                        {isLoginMode ? "أنشئ حساباً جديداً" : "سجل دخولك"}
                    </Button>
                </div>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}

    