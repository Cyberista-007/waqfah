import 'server-only';
import { initializeAdminApp } from '@/lib/firebase-admin';
import { cache } from 'react';
import type { Lecture, Series, Program, Topic } from '@/lib/types';

const getFirestore = () => initializeAdminApp().firestore;

const getAllDocs = async <T>(collectionName: string): Promise<(T & { id: string })[]> => {
    const firestore = getFirestore();
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
