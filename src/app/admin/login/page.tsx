
"use client";

import { useState, FormEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/hooks/use-admin-auth";

export default function AdminLoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { loginAdmin, isAdmin, isLoading: isAuthLoading } = useAdminAuth();

  useEffect(() => {
    if (!isAuthLoading && isAdmin) {
      router.push('/admin/dashboard');
    }
  }, [isAdmin, isAuthLoading, router]);


  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    const success = await loginAdmin(username, password);

    if (success) {
      toast({ title: "أهلاً بعودتك!", description: "تم تسجيل دخولك كمدير بنجاح." });
      router.push('/admin/dashboard');
    } else {
      toast({ variant: "destructive", title: "فشل تسجيل الدخول", description: "اسم المستخدم أو كلمة المرور غير صحيحة." });
    }
    
    setIsLoading(false);
  };

  if (isAuthLoading || isAdmin) {
      return (
          <div className="flex h-screen items-center justify-center">
              <Loader2 className="h-16 w-16 animate-spin" />
          </div>
      )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
        <div className="w-full max-w-md">
          <Card className="w-full bg-card/80 backdrop-blur-md">
            <CardHeader className="text-center">
                <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit mb-2">
                    <ShieldCheck className="h-8 w-8" />
                </div>
              <CardTitle className="text-3xl font-headline">
                دخول المدير
              </CardTitle>
              <CardDescription>
                هذه الصفحة مخصصة لمدراء الموقع فقط.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="username">اسم المستخدم</Label>
                    <Input id="username" name="username" required placeholder="أدخل اسم المستخدم"/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">كلمة المرور</Label>
                    <Input id="password" name="password" type="password" required placeholder="أدخل كلمة المرور" />
                </div>
                <Button
                    type="submit"
                    className="w-full text-white bg-primary hover:bg-primary/90"
                    disabled={isLoading}
                >
                    {isLoading ? <Loader2 className="animate-spin" /> : "تسجيل الدخول"}
                </Button>
              </form>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}

