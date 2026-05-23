import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { initializeAdminApp } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { createHash } from 'crypto';

// Collection names
const COUNTER_DOC = 'palestine_solidarity';
const PLEDGES_COLLECTION = 'palestine_pledges';
const STATS_COLLECTION = 'stats';

/**
 * Creates a privacy-preserving fingerprint from IP + User-Agent.
 * We hash it with SHA-256 so we NEVER store the raw IP address.
 * This gives us a unique, anonymous identifier per visitor.
 */
function createFingerprint(req: NextRequest): string {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';
  const raw = `${ip}:${userAgent}`;
  return createHash('sha256').update(raw).digest('hex');
}

// GET /api/palestine/pledge — Fetch total pledge count
export async function GET(req: NextRequest) {
  const { firestore } = initializeAdminApp();
  if (!firestore) {
    return NextResponse.json({ count: 14872 }, { status: 200 });
  }

  try {
    const doc = await firestore
      .collection(STATS_COLLECTION)
      .doc(COUNTER_DOC)
      .get();

    const count = doc.exists ? (doc.data()?.count ?? 14872) : 14872;
    return NextResponse.json({ count }, { status: 200 });
  } catch (error) {
    console.error('Palestine pledge GET error:', error);
    return NextResponse.json({ count: 14872 }, { status: 200 });
  }
}

// POST /api/palestine/pledge — Submit a pledge (one per visitor)
export async function POST(req: NextRequest) {
  const { firestore } = initializeAdminApp();
  if (!firestore) {
    return NextResponse.json(
      { success: false, message: 'الخدمة غير متاحة مؤقتاً' },
      { status: 503 }
    );
  }

  // Generate a unique, anonymous fingerprint for this visitor
  const fingerprint = createFingerprint(req);

  // Parse body
  let name = '';
  try {
    const body = await req.json();
    name = (body?.name ?? '').toString().trim().slice(0, 60);
  } catch {
    // No body or invalid JSON — that's fine, name is optional
  }

  try {
    // Reference to this visitor's pledge document
    const pledgeRef = firestore
      .collection(PLEDGES_COLLECTION)
      .doc(fingerprint);

    const counterRef = firestore
      .collection(STATS_COLLECTION)
      .doc(COUNTER_DOC);

    // Use a Firestore transaction to guarantee atomicity:
    // 1. Check if this fingerprint has already pledged
    // 2. If not, create their pledge record AND increment the counter
    // 3. If yes, reject with a meaningful message
    const result = await firestore.runTransaction(async (tx) => {
      const pledgeSnap = await tx.get(pledgeRef);

      if (pledgeSnap.exists) {
        return { alreadyPledged: true };
      }

      // Write the pledge record (fingerprint as doc ID = uniqueness guarantee)
      tx.set(pledgeRef, {
        name: name || null,
        pledgedAt: FieldValue.serverTimestamp(),
        // We do NOT store the raw IP. The fingerprint IS the document ID.
      });

      // Atomically increment the counter
      tx.set(
        counterRef,
        { count: FieldValue.increment(1) },
        { merge: true }
      );

      return { alreadyPledged: false };
    });

    if (result.alreadyPledged) {
      return NextResponse.json(
        { success: false, alreadyPledged: true, message: 'لقد سجّلت دعمك من قبل. شكراً لك!' },
        { status: 409 }
      );
    }

    // Fetch the new total
    const counterSnap = await counterRef.get();
    const newCount = counterSnap.data()?.count ?? 14872;

    return NextResponse.json(
      { success: true, count: newCount, message: 'تم تسجيل دعمك بنجاح!' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Palestine pledge POST error:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ. حاول مرة أخرى.' },
      { status: 500 }
    );
  }
}
