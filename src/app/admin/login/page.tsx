"use client";

import { useEffect } from "react";
import { useActionState } from "react";
import { handleAdminLogin } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
            اضغط على الزر أدناه للوصول إلى لوحة التحكم.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <Button type="submit" className="w-full bg-primary/80 text-primary-foreground hover:bg-primary/90">
              دخول لوحة تحكم المدير
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
