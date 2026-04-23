import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { books } = await request.json();
    const filePath = path.join(process.cwd(), 'public', 'data', 'library.json');
    
    // Write to the local library.json file
    fs.writeFileSync(filePath, JSON.stringify({ books }, null, 2), 'utf8');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update library.json', error);
    return NextResponse.json({ success: false, error: 'Failed to update local file' }, { status: 500 });
  }
}
