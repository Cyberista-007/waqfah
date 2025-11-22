import { getSessionPayload } from '@/lib/session';
import { NextResponse } from 'next/server';

export async function GET() {
    const session = await getSessionPayload();
    if (!session) {
        return NextResponse.json(null, { status: 404 });
    }
    return NextResponse.json(session);
}
