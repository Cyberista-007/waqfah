
"use client";

import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useUser, useAuth } from "@/firebase";
import { useRouter, useSearchParams } from "next/navigation";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getFirebaseAuthErrorMessage } from "@/lib/firebase-errors";

function SubmitButton({ isLoginMode, isLoading }: { isLoginMode: boolean, isLoading: boolean }) {
  return (
    <Button type="submit" className="w-full" disabled={isLoading}>
      {isLoading ? <Loader2 className="animate-spin" /> : isLoginMode ? "تسجيل الدخول" : "إنشاء حساب"}
    </Button>
  );
}

export default function LoginPage() {
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;
    const redirectTo = searchParams.get('redirect_to') || '/';

    if (!auth) {
        toast({
            variant: "destructive",
            title: "خطأ في التهيئة",
            description: "خدمة المصادقة غير متوفرة. يرجى المحاولة مرة أخرى لاحقًا.",
        });
        setIsLoading(false);
        return;
    }

    if (!email || !password || (!isLoginMode && !name)) {
        toast({
            variant: "destructive",
            title: "حقول ناقصة",
            description: "يرجى ملء جميع الحقول المطلوبة.",
        });
        setIsLoading(false);
        return;
    }

    try {
        if (isLoginMode) {
            await signInWithEmailAndPassword(auth, email, password);
            toast({ title: "أهلاً بعودتك!", description: "تم تسجيل دخولك بنجاح." });
            router.push(redirectTo);
        } else {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            if (userCredential.user) {
              await updateProfile(userCredential.user, { displayName: name });
            }
            toast({ title: "تم إنشاء الحساب بنجاح!", description: "مرحباً بك." });
            router.push(redirectTo);
        }
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "حدث خطأ",
            description: getFirebaseAuthErrorMessage(error),
        });
    } finally {
        setIsLoading(false);
    }
  };

  if (isUserLoading) {
      return (
          <div className="flex h-screen items-center justify-center">
              <Loader2 className="h-16 w-16 animate-spin" />
          </div>
      )
  }

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">
            {isLoginMode ? "تسجيل الدخول" : "حساب جديد"}
          </CardTitle>
          <CardDescription>
            {isLoginMode ? "أدخل بريدك الإلكتروني وكلمة المرور للمتابعة." : "املأ الحقول لإنشاء حساب جديد."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLoginMode && (
              <div className="space-y-2">
                <Label htmlFor="name">الاسم</Label>
                <Input id="name" name="name" type="text" required />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input id="password" name="password" type="password" required />
            </div>
             <SubmitButton isLoginMode={isLoginMode} isLoading={isLoading} />
          </form>
           <div className="mt-4 text-center text-sm">
                {isLoginMode ? "ليس لديك حساب؟" : "لديك حساب بالفعل؟"}{' '}
                <Button variant="link" className="p-0 h-auto" onClick={() => setIsLoginMode(!isLoginMode)}>
                    {isLoginMode ? "أنشئ حساباً جديداً" : "سجل الدخول"}
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
