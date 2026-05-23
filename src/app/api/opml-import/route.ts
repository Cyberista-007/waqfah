
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { initializeAdminApp } from '@/lib/firebase-admin';
import type { Program } from '@/lib/types';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('opml') as File;

        if (!file) {
            return NextResponse.json({ message: 'لم يتم العثور على ملف OPML.' }, { status: 400 });
        }

        const text = await file.text();
        
        // Basic regex parser for OPML
        const urlRegex = /xmlUrl="([^"]+)"/g;
        const matches = text.matchAll(urlRegex);
        const feedUrls = Array.from(matches, m => m[1]);

        if (feedUrls.length === 0) {
             return NextResponse.json({ matched: [], unmatched: [], message: 'لم يتم العثور على روابط RSS في الملف.' });
        }

        const { firestore } = initializeAdminApp();
        if (!firestore) {
            throw new Error("فشل تهيئة وصول المدير لقاعدة البيانات.");
        }

        const programsSnap = await firestore.collection('programs').get();
        
        const allPrograms = programsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Program));

        const urlToItemMap = new Map<string, Program>();
        allPrograms.forEach(p => {
            if(p.youtubeUrl) urlToItemMap.set(p.youtubeUrl, p);
            if(p.rssFeedUrl) urlToItemMap.set(p.rssFeedUrl, p);
        });

        const matched: Program[] = [];
        const unmatched: string[] = [];

        feedUrls.forEach(url => {
            const foundItem = urlToItemMap.get(url);
            if (foundItem) {
                // Avoid adding duplicates to the matched array
                if (!matched.some(m => m.id === foundItem.id)) {
                    matched.push(foundItem);
                }
            } else {
                unmatched.push(url);
            }
        });

        return NextResponse.json({ matched, unmatched });

    } catch (error: any) {
        console.error("OPML Import Error:", error);
        return NextResponse.json({ message: error.message || "فشل في معالجة ملف OPML." }, { status: 500 });
    }
}
