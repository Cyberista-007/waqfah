
"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminLoginPage() {
  const { isAdmin, isLoading, loginAdmin } = useAdminAuth();
  const router = useRouter();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // If user is already an admin, redirect to the dashboard.
    if (!isLoading && isAdmin) {
        router.replace('/admin/dashboard');
    }
  }, [isAdmin, isLoading, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    const success = await loginAdmin(username, password);

    if (success) {
        router.replace('/admin/dashboard');
    } else {
        setError('اسم المستخدم أو كلمة المرور غير صحيحة.');
        setIsSubmitting(false);
    }
  };

  // Show a loader while checking auth states.
  if (isLoading || isAdmin) {
    return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-16 w-16 animate-spin" />
        </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
            <CardTitle className="text-2xl font-headline">تسجيل دخول المدير</CardTitle>
            <CardDescription>أدخل بيانات الاعتماد للوصول إلى لوحة التحكم.</CardDescription>
        </CardHeader>
        <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="username">اسم المستخدم:</Label>
                    <Input 
                        id="username"
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">كلمة المرور:</Label>
                    <Input 
                        id="password" 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        />
                </div>
                {error && <p className="text-destructive text-sm text-center">{error}</p>}
                <div className="flex justify-center gap-4 pt-4">
                    <Button type="submit" disabled={isSubmitting} className="px-8">
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'دخول'}
                    </Button>
                    <Button type="button" variant="outline" className="px-8" onClick={() => router.push('/')}>
                        إلغاء
                    </Button>
                </div>
            </form>
        </CardContent>
      </Card>
    </div>
  );
}
