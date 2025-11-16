import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { LogIn } from "lucide-react";

export default function LoginPage() {
    return (
        <div className="flex items-center justify-center py-12">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-headline">تسجيل الدخول</CardTitle>
                    <CardDescription>
                        ميزة تسجيل الدخول قيد التطوير حالياً.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                    <p className="text-muted-foreground text-center">
                       في الوقت الحالي، يمكنك تصفح جميع المحاضرات والاستماع إليها.
                       سيسمح لك تسجيل الدخول قريباً بحفظ مفضلاتك وتقييم المحاضرات.
                    </p>
                    <Button asChild className="w-full bg-primary/80 text-primary-foreground hover:bg-primary/90">
                        <Link href="/">
                            <LogIn className="me-2 h-4 w-4" /> العودة إلى الرئيسية
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
