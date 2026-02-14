

import 'server-only';
import { initializeAdminApp } from '@/lib/firebase-admin';
import { cache } from 'react';
import type { Lecture, Series, Program, Topic, AppearanceSettings, AnnouncementSettings, Curriculum } from '@/lib/types';

const getFirestore = () => {
    const { firestore } = initializeAdminApp();
    return firestore;
}

const getAllDocs = async <T>(collectionName: string): Promise<(T & { id: string })[]> => {
    const firestore = getFirestore();
    // If Firestore admin instance is not available (e.g., no service account), return empty array.
    if (!firestore) return [];

    const snapshot = await firestore.collection(collectionName).get();
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as T) }));
};

const getDocsWithQuery = async <T>(collectionName: string, options: { orderBy: [string, 'asc' | 'desc'], limit: number }): Promise<(T & { id: string })[]> => {
    const firestore = getFirestore();
    if (!firestore) return [];

    let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = firestore.collection(collectionName);

    if (options.orderBy) {
        query = query.orderBy(...options.orderBy);
    }
    if (options.limit) {
        query = query.limit(options.limit);
    }

    const snapshot = await query.get();
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as T) }));
};

export const getLatestSeries = cache(() => getDocsWithQuery<Series>('series', { orderBy: ['createdAt', 'desc'], limit: 12 }));
export const getLatestLectures = cache(() => getDocsWithQuery<Lecture>('lectures', { orderBy: ['createdAt', 'desc'], limit: 12 }));
export const getTopPrograms = cache(() => getDocsWithQuery<Program>('programs', { orderBy: ['followerCount', 'desc'], limit: 12 }));


export const getAllLectures = cache(() => getAllDocs<Lecture>('lectures'));
export const getAllSeries = cache(() => getAllDocs<Series>('series'));
export const getAllPrograms = cache(() => getAllDocs<Program>('programs'));
export const getAllTopics = cache(() => getAllDocs<Topic>('topics'));
export const getAllCurriculums = cache(() => getAllDocs<Curriculum>('curriculums'));

export const getAppearanceSettings = cache(async (): Promise<AppearanceSettings | null> => {
    const firestore = getFirestore();
    // If Firestore admin instance is not available, return null.
    if (!firestore) return null;

    const docRef = firestore.doc('settings/appearance');
    try {
        const docSnap = await docRef.get();
        if (!docSnap.exists) {
            return null;
        }
        return docSnap.data() as AppearanceSettings;
    } catch (error) {
        console.error("Could not fetch appearance settings:", error);
        return null;
    }
});

export const getAnnouncement = cache(async (): Promise<AnnouncementSettings | null> => {
    const firestore = getFirestore();
    if (!firestore) return null;

    const docRef = firestore.doc('settings/announcement');
    try {
        const docSnap = await docRef.get();
        if (!docSnap.exists) {
            return null;
        }
        return docSnap.data() as AnnouncementSettings;
    } catch (error) {
        console.error("Could not fetch announcement settings:", error);
        return null;
    }
});
