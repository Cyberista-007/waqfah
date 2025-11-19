
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
  
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // If user is already an admin, redirect to the dashboard.
    if (!isLoading && isAdmin) {
        router.replace('/admin/dashboard');
    }
  }, [isAdmin, isLoading, router]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    const success = loginAdmin(username, password);

    if (success) {
        router.replace('/admin/dashboard');
    } else {
        setError('Please enter your username and password.');
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
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-3 items-center">
                    <Label htmlFor="username" className="text-right pr-4">Username:</Label>
                    <Input 
                        id="username"
                        className="col-span-2"
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        />
                </div>
                <div className="grid grid-cols-3 items-center">
                    <Label htmlFor="password" className="text-right pr-4">Password:</Label>
                    <Input 
                        id="password" 
                        className="col-span-2"
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        />
                </div>
                {error && <p className="text-orange-500 text-sm text-center">{error}</p>}
                <div className="flex justify-center gap-4 pt-4">
                    <Button type="submit" disabled={isSubmitting} className="px-8">
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Login'}
                    </Button>
                    <Button type="button" variant="outline" className="px-8" onClick={() => router.push('/')}>
                        Cancel
                    </Button>
                </div>
            </form>
        </CardContent>
      </Card>
    </div>
  );
}
