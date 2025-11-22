import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/constants';

function deleteSession() {
    cookies().delete(SESSION_COOKIE_NAME);
}

export async function POST() {
    deleteSession();
    return NextResponse.json({ success: true });
}
