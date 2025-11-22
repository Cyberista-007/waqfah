import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/constants';

const secret = process.env.SESSION_SECRET;
if (!secret) {
    throw new Error('SESSION_SECRET environment variable is not set');
}
const secretKey = new TextEncoder().encode(secret);

async function getSessionPayload() {
    const sessionCookie = cookies().get(SESSION_COOKIE_NAME)?.value;
    if (!sessionCookie) return null;
    try {
        const { payload } = await jwtVerify(sessionCookie, secretKey, { algorithms: ['HS256'] });
        return payload;
    } catch (e) {
        return null;
    }
}

export async function GET() {
    const session = await getSessionPayload();
    if (!session) {
        return NextResponse.json(null, { status: 404 });
    }
    return NextResponse.json(session);
}
