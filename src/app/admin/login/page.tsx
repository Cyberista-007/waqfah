"use client";

import { useEffect } from "react";
import { handleAdminLogin } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full bg-primary/80 text-primary-foreground hover:bg-primary/90" disabled={pending}>
      {pending ? "جاري الدخول..." : "دخول لوحة تحكم المدير"}
    </Button>
  );
}


export default function AdminLoginPage() {
  const router = useRouter();
  const [state, formAction] = useFormState(handleAdminLogin, null);
  const { toast } = useToast();

  useEffect(() => {
    if (state?.success) {
      router.push("/admin/dashboard");
    }
    if (state?.error) {
      toast({
        variant: "destructive",
        title: "خطأ في تسجيل الدخول",
        description: state.error,
      });
    }
  }, [state, toast, router]);

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
             <SubmitButton />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
