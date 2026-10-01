import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { initializeAdminApp } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { auth, firestore } = initializeAdminApp();
    if (!auth) {
      return NextResponse.json({ message: 'Internal Server Error: Admin services not initialized.' }, { status: 500 });
    }

    const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
      return NextResponse.json({ message: 'Unauthorized: No token provided.' }, { status: 401 });
    }

    const decodedToken = await auth.verifyIdToken(idToken);
    let isAdmin = decodedToken.role === 'admin';
    if (!isAdmin && firestore) {
      const userDoc = await firestore.collection('users').doc(decodedToken.uid).get();
      isAdmin = userDoc.exists && userDoc.data()?.role === 'admin';
    }

    if (!isAdmin) {
      return NextResponse.json({ message: 'Forbidden: User is not an admin.' }, { status: 403 });
    }

    const { books } = await request.json();
    if (!Array.isArray(books)) {
      return NextResponse.json({ message: 'Bad Request: books must be an array.' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'public', 'data', 'library.json');
    
    // Write to the local library.json file
    fs.writeFileSync(filePath, JSON.stringify({ books }, null, 2), 'utf8');
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to update library.json', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to update local file' }, { status: 500 });
  }
}
