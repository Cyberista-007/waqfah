
"use client";

import { useState, FormEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldCheck, Mail, Lock, User, ArrowRight, Sparkles } from "lucide-react";
import { useUser, useAuth, useFirestore } from "@/firebase";
import { useRouter, useSearchParams } from "next/navigation";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getFirebaseAuthErrorMessage } from "@/lib/firebase-errors";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import type { UserProfile } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

function SubmitButton({ isLoginMode, isLoading }: { isLoginMode: boolean, isLoading: boolean }) {
  return (
    <Button
      type="submit"
      className="w-full h-14 text-lg font-black bg-white text-black hover:bg-zinc-200 rounded-2xl shadow-xl shadow-white/5 transition-all group"
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="animate-spin" />
      ) : (
        <div className="flex items-center gap-2">
            {isLoginMode ? "تسجيل الدخول" : "إنشاء حساب"}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </div>
      )}
    </Button>
  );
}

export default function LoginPage() {
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const fullName = formData.get("name") as string;
    
    const redirectTo = searchParams.get('redirect_to') || '/';

    if (!auth || !firestore) {
        toast({
            variant: "destructive",
            title: "خطأ في التهيئة",
            description: "خدمة المصادقة غير متوفرة. يرجى المحاولة مرة أخرى لاحقًا.",
        });
        setIsLoading(false);
        return;
    }

    try {
        if (isLoginMode) {
            if (!email || !password) throw new Error("يرجى إدخال البريد الإلكتروني وكلمة المرور.");
            await signInWithEmailAndPassword(auth, email, password);
            toast({ title: "أهلاً بعودتك!", description: "تم تسجيل دخولك بنجاح." });
            router.push(redirectTo);
        } else {
            if (!fullName || !email || !password || !confirmPassword) throw new Error("يرجى ملء جميع الحقول الإلزامية.");
            if (password !== confirmPassword) throw new Error("الرجاء التأكد من تطابق كلمة المرور وتأكيدها.");
            
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const newUser = userCredential.user;
            await updateProfile(newUser, { displayName: fullName });
            
            const userRef = doc(firestore, "users", newUser.uid);
            const newUserProfile: Omit<UserProfile, 'id'> = {
                name: fullName,
                email: newUser.email!,
                createdAt: new Date().toISOString(),
                role: 'user',
            };
            await setDoc(userRef, newUserProfile, { merge: true });

            toast({ title: "تم إنشاء الحساب بنجاح!", description: "مرحباً بك في وقفة." });
            router.push(redirectTo);
        }
    } catch (error: any) {
        toast({ 
            variant: "destructive", 
            title: "فشل العملية", 
            description: error.message || getFirebaseAuthErrorMessage(error) 
        });
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isUserLoading && user) {
        const redirectTo = searchParams.get('redirect_to') || '/';
        router.push(redirectTo);
    }
  },[user, isUserLoading, router, searchParams]);

  if (isUserLoading || user) {
      return (
          <div className="flex h-screen items-center justify-center bg-[#030303]">
              <Loader2 className="h-16 w-16 animate-spin text-white/20" />
          </div>
      )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#030303]">
        {/* ── Background Atmos ── */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-600/10 blur-[120px] rounded-full -translate-x-1/2 translate-y-1/2" />
        </div>

        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-xl relative z-10"
        >
          <div className="text-center mb-12">
            <motion.div 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/[0.03] border border-white/10 mb-8 shadow-2xl"
            >
                <ShieldCheck className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-black text-white font-headline tracking-tighter mb-4">
                {isLoginMode ? "عودة" : "انضم"} إلى <span className="text-transparent bg-clip-text bg-gradient-to-l from-indigo-300 via-indigo-500 to-emerald-500 italic">وقفة</span>
            </h1>
            <p className="text-white/30 text-lg font-medium">بوابتك إلى العلم الشرعي بأسلوب عصري</p>
          </div>

          <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-[0_0_100px_-20px_rgba(0,0,0,0.5)]">
            <AnimatePresence mode="wait">
              <motion.form 
                key={isLoginMode ? "login" : "register"}
                initial={{ opacity: 0, x: isLoginMode ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isLoginMode ? 20 : -20 }}
                onSubmit={handleSubmit} 
                className="space-y-6"
              >
                {!isLoginMode && (
                    <div className="space-y-3">
                        <Label className="text-xs font-black text-white/30 uppercase tracking-widest mr-2" htmlFor="name">الاسم الكامل</Label>
                        <div className="relative">
                            <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                            <Input id="name" name="name" type="text" required placeholder="كيف نناديك؟" className="h-14 bg-white/5 border-white/5 rounded-2xl pr-12 text-white placeholder:text-white/10 focus:bg-white/10 transition-all" />
                        </div>
                    </div>
                )}
                
                <div className="space-y-3">
                    <Label className="text-xs font-black text-white/30 uppercase tracking-widest mr-2" htmlFor="email">البريد الإلكتروني</Label>
                    <div className="relative">
                        <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                        <Input id="email" name="email" type="email" required placeholder="example@waqfah.com" className="h-14 bg-white/5 border-white/5 rounded-2xl pr-12 text-white placeholder:text-white/10 focus:bg-white/10 transition-all" />
                    </div>
                </div>

                <div className="space-y-3">
                    <Label className="text-xs font-black text-white/30 uppercase tracking-widest mr-2" htmlFor="password">كلمة المرور</Label>
                    <div className="relative">
                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                        <Input id="password" name="password" type="password" required placeholder="••••••••" className="h-14 bg-white/5 border-white/5 rounded-2xl pr-12 text-white placeholder:text-white/10 focus:bg-white/10 transition-all" />
                    </div>
                </div>

                {!isLoginMode && (
                    <div className="space-y-3">
                        <Label className="text-xs font-black text-white/30 uppercase tracking-widest mr-2" htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                        <div className="relative">
                            <ShieldCheck className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                            <Input id="confirmPassword" name="confirmPassword" type="password" required placeholder="أكد حماية حسابك" className="h-14 bg-white/5 border-white/5 rounded-2xl pr-12 text-white placeholder:text-white/10 focus:bg-white/10 transition-all" />
                        </div>
                    </div>
                )}

                <div className="pt-4">
                    <SubmitButton isLoginMode={isLoginMode} isLoading={isLoading} />
                </div>
              </motion.form>
            </AnimatePresence>

            <div className="mt-10 pt-8 border-t border-white/5 text-center">
                <p className="text-white/30 font-medium">
                    {isLoginMode ? "ليس لديك حساب؟" : "لديك حساب بالفعل؟"}{' '}
                    <button 
                        onClick={() => setIsLoginMode(!isLoginMode)}
                        className="text-white hover:text-indigo-400 transition-colors font-black underline underline-offset-8 decoration-white/10"
                    >
                        {isLoginMode ? "أنشئ حساباً جديداً" : "سجل دخولك الآن"}
                    </button>
                </p>
            </div>
          </div>

          {/* Footer Branding */}
          <div className="mt-12 flex items-center justify-center gap-6 opacity-20 grayscale hover:grayscale-0 transition-all duration-700">
             <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.5em]">
                <Sparkles className="w-4 h-4" />
                علم نافع
             </div>
             <div className="w-8 h-px bg-white" />
             <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.5em]">
                أثر يبقى
             </div>
          </div>
        </motion.div>
    </div>
  );
}

