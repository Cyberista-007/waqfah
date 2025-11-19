
'use client';

import { useState, useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Terminal } from 'lucide-react';
import { Button } from './ui/button';

/**
 * An invisible component that listens for globally emitted 'permission-error' events.
 * It throws any received error to be caught by Next.js's global-error.tsx in production,
 * and displays a helpful message in development.
 */
export function FirebaseErrorListener() {
  const [error, setError] = useState<FirestorePermissionError | null>(null);

  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      // In a production environment, we would throw the error to be caught
      // by a global error boundary, which would show a generic "Something went wrong" page.
      if (process.env.NODE_ENV === 'production') {
        // This will be caught by Next.js's error boundary mechanism.
        throw error;
      }
      // In development, we'll display a more informative inline error.
      setError(error);
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  if (error && process.env.NODE_ENV === 'development') {
    return (
      <Alert variant="destructive" className="my-8">
        <Terminal className="h-4 w-4" />
        <AlertTitle>خطأ في صلاحيات الوصول إلى Firestore</AlertTitle>
        <AlertDescription>
          <div className="space-y-4">
            <p>
              تم رفض الطلب التالي من قبل قواعد أمان Firestore. هذا يعني عادةً أنك تحاول قراءة أو كتابة بيانات لا تملك صلاحية الوصول إليها.
            </p>
            <pre className="mt-2 w-full rounded-md bg-muted p-4 font-code text-sm overflow-auto">
                <code>{JSON.stringify(error.request, null, 2)}</code>
            </pre>
            <p>
                **للإصلاح:** تحقق من ملف <code className="font-code text-xs relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-semibold">firestore.rules</code> وقارن منطق الصلاحيات مع الطلب أعلاه. تأكد من أن المستخدم (إذا كان مسجلاً دخوله) أو أي قواعد عامة تسمح بهذه العملية.
            </p>
             <Button onClick={() => setError(null)} variant="secondary">إخفاء الخطأ</Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // This component renders nothing in production or if there's no error.
  return null;
}
