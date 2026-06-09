import { NextResponse } from 'next/server';
import { initializeAdminApp } from '@/lib/firebase-admin';
import admin from 'firebase-admin';

export const dynamic = 'force-dynamic';

function getYoutubeId(url: string): string | null {
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|live\/)([^#&?]{11}).*/;
  const match = url.match(regExp);
  return match ? match[2] : null;
}

export async function GET() {
  try {
    const { firestore } = initializeAdminApp();

    if (!firestore) {
      // Fallback: client will use Firestore SDK directly
      return NextResponse.json({ stations: [], error: 'admin_unavailable' }, { status: 200 });
    }

    // Query only lectures that have a youtubeUrl field set
    const snapshot = await firestore
      .collection('lectures')
      .where('youtubeUrl', '!=', '')
      .orderBy('youtubeUrl')
      .orderBy('createdAt', 'desc')
      .limit(200)
      .get();

    const colors = [
      { color: 'from-rose-500/20 to-rose-950/40', borderColor: 'border-rose-500/30', textColor: 'text-rose-400' },
      { color: 'from-violet-500/20 to-violet-950/40', borderColor: 'border-violet-500/30', textColor: 'text-violet-400' },
      { color: 'from-amber-500/20 to-amber-950/40', borderColor: 'border-amber-500/30', textColor: 'text-amber-400' },
      { color: 'from-cyan-500/20 to-cyan-950/40', borderColor: 'border-cyan-500/30', textColor: 'text-cyan-400' },
      { color: 'from-emerald-500/20 to-emerald-950/40', borderColor: 'border-emerald-500/30', textColor: 'text-emerald-400' },
    ];

    const programIds = Array.from(
      new Set(
        snapshot.docs
          .map((doc) => doc.data().programId)
          .filter(Boolean)
      )
    );

    const programsMap: Record<string, any> = {};
    if (programIds.length > 0) {
      // Fetch programs in chunks of 30 due to Firestore "in" query limit
      for (let i = 0; i < programIds.length; i += 30) {
        const chunk = programIds.slice(i, i + 30);
        const programsSnapshot = await firestore
          .collection('programs')
          .where(admin.firestore.FieldPath.documentId(), 'in', chunk)
          .get();
        programsSnapshot.docs.forEach((doc) => {
          programsMap[doc.id] = doc.data();
        });
      }
    }

    const stations = snapshot.docs
      .map((doc, i) => {
        const data = doc.data();
        const ytId = getYoutubeId(data.youtubeUrl);
        if (!ytId) return null;
        const c = colors[i % colors.length];
        const program = data.programId ? programsMap[data.programId] : null;
        const imageUrl = program?.imageUrl || '';
        return {
          id: `imported_${doc.id}`,
          name: data.title || 'محاضرة',
          subtitle: data.programName || 'محاضرة مستوردة',
          url: data.youtubeUrl,
          icon: imageUrl || '🎥',
          ...c,
        };
      })
      .filter(Boolean);

    return NextResponse.json({ stations }, { status: 200 });
  } catch (error: any) {
    console.error('[radio-stations API]', error);
    return NextResponse.json({ stations: [], error: error.message }, { status: 500 });
  }
}
