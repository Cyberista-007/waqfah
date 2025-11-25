
"use client";

import { useState, FormEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useUser, useAuth, useFirestore } from "@/firebase";
import { useRouter, useSearchParams } from "next/navigation";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getFirebaseAuthErrorMessage } from "@/lib/firebase-errors";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import type { UserProfile } from "@/lib/types";

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


export default function LoginPage() {
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const fullName = formData.get("name") as string;
    
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
        if (!fullName || !email || !password || !confirmPassword) {
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
                createdAt: Timestamp.now(),
                role: 'user', // Default role
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
                    <div className="space-y-2">
                        <Label htmlFor="name">الاسم الكامل</Label>
                        <Input id="name" name="name" type="text" required placeholder="الاسم الكامل"/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">البريد الإلكتروني</Label>
                        <Input id="email" name="email" type="email" required placeholder="أدخل بريدك الإلكتروني" />
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
