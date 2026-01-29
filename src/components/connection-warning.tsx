
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export const ConnectionWarning = ({ error }: { error: string | null }) => {
    if (!error) return null;
    return (
        <div className="container my-8">
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>فشل الاتصال بقاعدة البيانات</AlertTitle>
                <AlertDescription>
                    <p className="mb-2">لم يتمكن الخادم من الاتصال بـ Firebase لعرض البيانات الحقيقية. البيانات المعروضة حاليًا هي بيانات تجريبية للمعاينة.</p>
                    <p className="mb-2"><strong>للإصلاح:</strong> تأكد من إنشاء ملف `.env.local` في جذر المشروع، وأنه يحتوي على متغير `FIREBASE_SERVICE_ACCOUNT` بالكامل، ثم أعد تشغيل خادم التطوير. يمكنك مراجعة ملف `DEPLOYMENT.md` لمزيد من التفاصيل.</p>
                    <details className="text-xs mt-4 cursor-pointer">
                        <summary>تفاصيل الخطأ الفني</summary>
                        <pre className="mt-2 w-full rounded-md bg-muted p-2 font-code text-xs overflow-auto">
                            <code>{error}</code>
                        </pre>
                    </details>
                </AlertDescription>
            </Alert>
        </div>
    );
};
