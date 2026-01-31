
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeAdminApp } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const { auth } = initializeAdminApp();

    const idToken = req.headers.get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
      return NextResponse.json({ message: 'Unauthorized: No token provided.' }, { status: 401 });
    }
    
    const decodedToken = await auth.verifyIdToken(idToken);
    if (decodedToken.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden: User is not an admin.' }, { status: 403 });
    }

    const { action, targetUid, duration } = await req.json();

    if (!action || !targetUid) {
        return NextResponse.json({ message: 'Bad Request: Missing action or targetUid.' }, { status: 400 });
    }

    switch (action) {
      case 'delete':
        await auth.deleteUser(targetUid);
        return NextResponse.json({ message: 'تم حذف المستخدم بنجاح.' });

      case 'ban_permanent':
        await auth.updateUser(targetUid, { disabled: true });
        return NextResponse.json({ message: 'تم حظر المستخدم بشكل دائم.' });

      case 'unban':
        // Enables the user and removes any temporary ban custom claim.
        await auth.updateUser(targetUid, { disabled: false });
        await auth.setCustomUserClaims(targetUid, { ban_expires: null });
        return NextResponse.json({ message: 'تم إلغاء حظر المستخدم.' });

      case 'ban_temporary':
        if (!duration) throw new Error('يجب تحديد المدة للحظر المؤقت');
        const now = Math.floor(Date.now() / 1000);
        let expiry;
        let durationText: string;

        if (duration === 'day') {
            expiry = now + 24 * 60 * 60;
            durationText = 'يوم';
        } else if (duration === 'week') {
            expiry = now + 7 * 24 * 60 * 60;
            durationText = 'أسبوع';
        } else if (duration === 'month') {
            expiry = now + 30 * 24 * 60 * 60;
            durationText = 'شهر';
        } else {
            throw new Error('مدة غير صالحة');
        }

        await auth.setCustomUserClaims(targetUid, { ban_expires: expiry });
        return NextResponse.json({ message: `تم حظر المستخدم لمدة ${durationText}.` });

      default:
        return NextResponse.json({ message: 'إجراء غير صالح' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error managing user:', error);
    const errorMessage = error.code === 'auth/user-not-found' 
      ? 'لم يتم العثور على المستخدم.' 
      : (error.message || 'خطأ داخلي في الخادم');
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
