"use client";

import { useActionState, useEffect } from "react";
import { handleAdminLogin } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function AdminLoginPage() {
  const [state, formAction] = useActionState(handleAdminLogin, null);
  const { toast } = useToast();

  useEffect(() => {
    if (state?.error) {
      toast({
        variant: "destructive",
        title: "خطأ في تسجيل الدخول",
        description: state.error,
      });
    }
  }, [state, toast]);

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">تسجيل دخول المدير</CardTitle>
          <CardDescription>
            الرجاء إدخال كلمة المرور للوصول إلى لوحة التحكم.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-primary/80 text-primary-foreground hover:bg-primary/90">
              دخول
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
