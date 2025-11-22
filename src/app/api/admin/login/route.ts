import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '@/lib/session';

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
