
import 'server-only';
import { initializeAdminApp } from '@/lib/firebase-admin';
import { cache } from 'react';
import type { Lecture, Series, Program, Topic, AppearanceSettings } from '@/lib/types';

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

export const getAllLectures = cache(() => getAllDocs<Lecture>('lectures'));
export const getAllSeries = cache(() => getAllDocs<Series>('series'));
export const getAllPrograms = cache(() => getAllDocs<Program>('programs'));
export const getAllTopics = cache(() => getAllDocs<Topic>('topics'));

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
