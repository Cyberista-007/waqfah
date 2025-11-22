import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from './constants';

const secret = process.env.SESSION_SECRET;
if (!secret) {
    throw new Error('SESSION_SECRET environment variable is not set');
}
const secretKey = new TextEncoder().encode(secret);


// --- Functions to be used in Server Components and API Routes ---

export async function createSession(username: string) {
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const session = await new SignJWT({ username })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(secretKey);

    cookies().set(SESSION_COOKIE_NAME, session, {
        expires,
        httpOnly: true,
        path: '/',
    });
}

export async function getSessionPayload() {
    const sessionCookie = cookies().get(SESSION_COOKIE_NAME)?.value;
    if (!sessionCookie) return null;
    try {
        const { payload } = await jwtVerify(sessionCookie, secretKey, { algorithms: ['HS256'] });
        return payload;
    } catch (e) {
        return null;
    }
}

export async function deleteSession() {
    cookies().delete(SESSION_COOKIE_NAME);
}


// --- Functions to be used in Client Components ---

// Because client components can't access cookies directly,
// we create API routes to get and clear the session state.

export async function getSession() {
    if (typeof window === 'undefined') {
        return await getSessionPayload();
    }
    const res = await fetch('/api/admin/session');
    if (!res.ok) return null;
    return await res.json();
}

export async function clearSession() {
    if (typeof window === 'undefined') {
        return await deleteSession();
    }
    await fetch('/api/admin/logout', { method: 'POST' });
}
