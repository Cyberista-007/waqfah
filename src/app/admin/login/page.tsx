
"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAdminActivation } from "@/hooks/use-admin-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function AdminLoginPage() {
  const { user, isUserLoading } = useUser();
  const { isAdmin, isLoading: isAdminLoading, activateAdmin } = useAdminActivation();
  const router = useRouter();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // If user is not logged in, redirect them to the standard login page.
    // They must be a user before they can become an admin.
    if (!isUserLoading && !user) {
        router.replace('/auth/login?redirect_to=/admin');
    }
    // If user is already an admin, redirect to the dashboard.
    if (!isAdminLoading && isAdmin) {
        router.replace('/admin/dashboard');
    }
  }, [user, isUserLoading, isAdmin, isAdminLoading, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = activateAdmin(password);
    if (success) {
        toast({ title: "أهلاً بك أيها المدير!", description: "تم تسجيل دخولك إلى لوحة التحكم." });
        router.replace('/admin/dashboard');
    } else {
        toast({ variant: "destructive", title: "كلمة مرور غير صحيحة", description: "لم تتمكن من الوصول إلى لوحة التحكم." });
        setIsSubmitting(false);
    }
  };

  // Show a loader while checking auth states.
  if (isUserLoading || isAdminLoading || isAdmin) {
    return (
        <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin" />
        </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center bg-muted/40">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <CardTitle className="text-2xl font-headline">دخول المدير</CardTitle>
            <CardDescription>أدخل كلمة المرور للوصول إلى لوحة التحكم.</CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="password">كلمة مرور المدير</Label>
                    <Input 
                        id="password" 
                        type="password" 
                        required 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    دخول
                </Button>
            </form>
        </CardContent>
      </Card>
    </div>
  );
}
