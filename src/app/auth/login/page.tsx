
"use client";

import { useActionState, useEffect, useState } from "react";
import { handleEmailLogin, handleEmailSignup } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useFormStatus } from "react-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/firebase";
import { redirect } from "next/navigation";

function SubmitButton({ isLoginMode }: { isLoginMode: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : isLoginMode ? "تسجيل الدخول" : "إنشاء حساب"}
    </Button>
  );
}

export default function LoginPage() {
  const [loginState, loginAction] = useActionState(handleEmailLogin, null);
  const [signupState, signupAction] = useActionState(handleEmailSignup, null);
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const [isLoginMode, setIsLoginMode] = useState(true);

  useEffect(() => {
    if (user) {
        redirect('/');
    }
  }, [user]);

  useEffect(() => {
    const state = isLoginMode ? loginState : signupState;
    if (state?.error) {
      toast({
        variant: "destructive",
        title: "حدث خطأ",
        description: state.error,
      });
    }
  }, [loginState, signupState, toast, isLoginMode]);

  if (isUserLoading || user) {
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
          <form action={isLoginMode ? loginAction : signupAction} className="space-y-4">
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
             <SubmitButton isLoginMode={isLoginMode} />
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
