'use client';

import { useState, FormEvent, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldCheck, Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import { useUser, useAuth, useFirestore } from '@/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { getFirebaseAuthErrorMessage } from '@/lib/firebase-errors';
import { doc, setDoc } from 'firebase/firestore';
import { useTranslation } from '@/lib/i18n';
import type { UserProfile } from '@/lib/types';

function LoginPageContent() {
  const { t, isRtl } = useTranslation();
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
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    const fullName = formData.get('name') as string;

    const redirectTo = searchParams.get('redirect_to') || '/';

    if (!auth || !firestore) {
      toast({
        variant: 'destructive',
        title: t('خطأ في التهيئة', 'Initialization error'),
        description: t(
          'خدمة المصادقة غير متوفرة. يرجى المحاولة مرة أخرى لاحقًا.',
          'Authentication service is unavailable. Please try again.'
        ),
      });
      setIsLoading(false);
      return;
    }

    try {
      if (isLoginMode) {
        if (!email || !password) {
          throw new Error(t('يرجى إدخال البريد الإلكتروني وكلمة المرور.', 'Please enter email and password.'));
        }
        await signInWithEmailAndPassword(auth, email, password);
        toast({
          title: t('أهلاً بعودتك!', 'Welcome back!'),
          description: t('تم تسجيل دخولك بنجاح.', 'You have signed in successfully.'),
        });
        router.push(redirectTo);
      } else {
        if (!fullName || !email || !password || !confirmPassword) {
          throw new Error(t('يرجى ملء جميع الحقول الإلزامية.', 'Please fill in all required fields.'));
        }
        if (password !== confirmPassword) {
          throw new Error(t('الرجاء التأكد من تطابق كلمة المرور وتأكيدها.', 'Passwords do not match.'));
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;
        await updateProfile(newUser, { displayName: fullName });

        const userRef = doc(firestore, 'users', newUser.uid);
        const newUserProfile: Omit<UserProfile, 'id'> = {
          name: fullName,
          email: newUser.email!,
          createdAt: new Date().toISOString(),
          role: 'user',
        };
        await setDoc(userRef, newUserProfile, { merge: true });

        toast({
          title: t('تم إنشاء الحساب بنجاح!', 'Account created!'),
          description: t('مرحباً بك في وقفة.', 'Welcome to Waqfah.'),
        });
        router.push(redirectTo);
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: t('فشل العملية', 'Action failed'),
        description: error.message || getFirebaseAuthErrorMessage(error),
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
  }, [user, isUserLoading, router, searchParams]);

  if (isUserLoading || user) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary shadow-sm">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black font-headline text-foreground tracking-tight">
            {isLoginMode ? t('تسجيل الدخول', 'Sign In') : t('إنشاء حساب جديد', 'Create Account')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('بوابتك إلى العلم الشرعي ومتابعة تقدمك عبر الأجهزة', 'Your gateway to Islamic knowledge and synced progress')}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-card/85 backdrop-blur-xl border border-border rounded-3xl p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLoginMode && (
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-bold text-muted-foreground">
                  {t('الاسم الكامل', 'Full Name')}
                </Label>
                <div className="relative">
                  <User className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder={t('أدخل اسمك...', 'Enter your name...')}
                    className="h-11 bg-background border-border rounded-xl pr-10"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold text-muted-foreground">
                {t('البريد الإلكتروني', 'Email Address')}
              </Label>
              <div className="relative">
                <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="example@waqfah.com"
                  className="h-11 bg-background border-border rounded-xl pr-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-bold text-muted-foreground">
                {t('كلمة المرور', 'Password')}
              </Label>
              <div className="relative">
                <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="h-11 bg-background border-border rounded-xl pr-10"
                />
              </div>
            </div>

            {!isLoginMode && (
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs font-bold text-muted-foreground">
                  {t('تأكيد كلمة المرور', 'Confirm Password')}
                </Label>
                <div className="relative">
                  <ShieldCheck className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    placeholder="••••••••"
                    className="h-11 bg-background border-border rounded-xl pr-10"
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 rounded-xl font-bold text-sm gap-2 mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>{isLoginMode ? t('تسجيل الدخول', 'Sign In') : t('إنشاء حساب', 'Create Account')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-border text-center text-sm text-muted-foreground">
            {isLoginMode ? t('ليس لديك حساب؟', "Don't have an account?") : t('لديك حساب بالفعل؟', 'Already have an account?')}{' '}
            <button
              type="button"
              onClick={() => setIsLoginMode(!isLoginMode)}
              className="text-primary font-bold hover:underline"
            >
              {isLoginMode ? t('أنشئ حساباً جديداً', 'Sign up') : t('سجل دخولك', 'Sign in')}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>{t('منصة وقفة — علم نافع ومحتوى موثوق', 'Waqfah Platform — Beneficial Knowledge')}</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[70vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <LoginPageContent />
    </Suspense>
  );
}
