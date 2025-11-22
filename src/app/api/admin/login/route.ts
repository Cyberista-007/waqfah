import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME } from '@/lib/constants';

const secret = process.env.SESSION_SECRET;
if (!secret) {
    throw new Error('SESSION_SECRET environment variable is not set');
}
const secretKey = new TextEncoder().encode(secret);

async function createSession(username: string) {
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


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminUsername || !adminPassword) {
      console.error("Admin credentials are not configured on the server.");
      return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }

    if (username === adminUsername && password === adminPassword) {
      await createSession(username);
      return NextResponse.json({ success: true }, { status: 200 });
    }

    return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });

  } catch (error) {
    return NextResponse.json({ success: false, error: 'Bad Request' }, { status: 400 });
  }
}
