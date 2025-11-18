"use client";

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { authenticate, ADMIN_USERNAME } from "@/lib/actions";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from "lucide-react"

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : "تسجيل الدخول"}
    </Button>
  );
}

export default function LoginPage() {
  const [errorMessage, dispatch] = useActionState(authenticate, undefined);

  return (
    <div className="flex items-center justify-center min-h-screen py-12 bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">
            الدخول للوحة التحكم
          </CardTitle>
          <CardDescription>
            هذه المنطقة مخصصة للمدير فقط.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={dispatch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">اسم المدير</Label>
              <Input id="name" name="name" type="text" placeholder="أدخل اسم المدير..." required />
            </div>
            {errorMessage && (
                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>خطأ في الدخول</AlertTitle>
                    <AlertDescription>
                        {errorMessage}
                    </AlertDescription>
                </Alert>
            )}
             <SubmitButton />
          </form>
          <div className="mt-4 p-4 bg-secondary/50 border border-dashed border-secondary-foreground/20 rounded-md">
            <p className="text-xs text-center text-muted-foreground">
                لأغراض العرض، اسم المستخدم هو: <br/> <strong className="font-mono">{ADMIN_USERNAME}</strong>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
