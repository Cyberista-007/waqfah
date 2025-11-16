
"use client";

import { useEffect, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { handleAdminLogin } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full bg-primary/80 text-primary-foreground hover:bg-primary/90" disabled={pending}>
      {pending ? "جاري الدخول..." : "دخول لوحة تحكم المدير"}
    </Button>
  );
}

const initialState: { error?: string } = {
  error: undefined,
};

export default function AdminLoginPage() {
  const [state, formAction] = useActionState(handleAdminLogin, initialState);
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
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">تسجيل دخول المدير</CardTitle>
          <CardDescription>
            أدخل كلمة المرور للوصول إلى لوحة التحكم.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input id="password" name="password" type="password" required />
            </div>
             <SubmitButton />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
