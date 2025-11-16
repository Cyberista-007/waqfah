
export function getFirebaseAuthErrorMessage(error: any): string {
    if (typeof error !== 'object' || error === null || !('code' in error)) {
        return "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.";
    }

    switch (error.code) {
        case 'auth/invalid-email':
            return 'البريد الإلكتروني الذي أدخلته غير صالح.';
        case 'auth/user-disabled':
            return 'تم تعطيل هذا الحساب.';
        case 'auth/user-not-found':
            return 'لا يوجد حساب بهذا البريد الإلكتروني.';
        case 'auth/wrong-password':
            return 'كلمة المرور غير صحيحة.';
        case 'auth/email-already-in-use':
            return 'هذا البريد الإلكتروني مستخدم بالفعل في حساب آخر.';
        case 'auth/weak-password':
            return 'كلمة المرور ضعيفة جدًا. يجب أن تتكون من 6 أحرف على الأقل.';
        case 'auth/operation-not-allowed':
            return 'تسجيل الدخول باستخدام البريد الإلكتروني وكلمة المرور غير مفعّل حاليًا.';
        case 'auth/too-many-requests':
            return 'تم حظر الوصول إلى هذا الحساب مؤقتًا بسبب كثرة محاولات تسجيل الدخول الفاشلة. يمكنك استعادته عن طريق إعادة تعيين كلمة المرور أو المحاولة مرة أخرى لاحقًا.';
        // Fallback for other Firebase auth errors
        case 'auth/network-request-failed':
            return 'فشل الاتصال بالشبكة. يرجى التحقق من اتصالك بالإنترنت.';
        default:
            return "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.";
    }
}
