

import 'server-only';
import { initializeAdminApp } from '@/lib/firebase-admin';
import { cache } from 'react';
import type { Lecture, Series, Program, Topic, AppearanceSettings, AnnouncementSettings, Curriculum, ScheduleItem, QAPair, Playlist, HomepageDetailedConfig } from '@/lib/types';
import { Timestamp } from 'firebase-admin/firestore';

const getFirestore = () => {
    const { firestore } = initializeAdminApp();
    return firestore;
}

let quotaExhaustedUntil = 0;
const serverReadCache = new Map<string, { value: any; expiresAt: number }>();

function isQuotaBlocked(): boolean {
    return Date.now() < quotaExhaustedUntil;
}

function handleFirestoreError(label: string, error: any) {
    if (error?.code === 8 || String(error?.message || '').includes('RESOURCE_EXHAUSTED')) {
        quotaExhaustedUntil = Date.now() + 60_000;
    }
    console.error(`${label}:`, error?.message || error);
}

async function withServerCache<T>(key: string, ttlMs: number, loader: () => Promise<T>, fallback: T): Promise<T> {
    if (isQuotaBlocked()) return fallback;
    const hit = serverReadCache.get(key);
    if (hit && Date.now() < hit.expiresAt) {
        return hit.value as T;
    }
    try {
        const value = await loader();
        serverReadCache.set(key, { value, expiresAt: Date.now() + ttlMs });
        return value;
    } catch (error) {
        handleFirestoreError(`Server cache fetch failed [${key}]`, error);
        return fallback;
    }
}

const getAllDocs = async <T>(collectionName: string): Promise<(T & { id: string })[]> => {
    const firestore = getFirestore();
    // If Firestore admin instance is not available (e.g., no service account), return empty array.
    if (!firestore || isQuotaBlocked()) return [];

    try {
        const snapshot = await firestore.collection(collectionName).get();
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(doc => ({ ...(doc.data() as T), id: doc.id }));
    } catch (error) {
        handleFirestoreError(`Could not fetch collection ${collectionName}`, error);
        return [];
    }
};

const getDocsWithQuery = async <T>(collectionName: string, options: { orderBy: [string, 'asc' | 'desc'], limit: number }): Promise<(T & { id: string })[]> => {
    const firestore = getFirestore();
    if (!firestore || isQuotaBlocked()) return [];

    try {
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
        return snapshot.docs.map(doc => ({ ...(doc.data() as T), id: doc.id }));
    } catch (error) {
        handleFirestoreError(`Could not query collection ${collectionName}`, error);
        return [];
    }
};

export const getLatestSeries = cache(() => getDocsWithQuery<Series>('series', { orderBy: ['createdAt', 'desc'], limit: 12 }));
export const getLatestLectures = cache(() => getDocsWithQuery<Lecture>('lectures', { orderBy: ['createdAt', 'desc'], limit: 12 }));
export const getTopPrograms = cache(() => getDocsWithQuery<Program>('programs', { orderBy: ['followerCount', 'desc'], limit: 12 }));

// Fetch specific lectures by their document IDs (used for homepage strips)
export const getLecturesByIds = cache(async (ids: string[]): Promise<Lecture[]> => {
    if (!ids || ids.length === 0) return [];
    const firestore = getFirestore();
    if (!firestore) return [];

    // Firestore 'in' queries support max 10 items per query
    const CHUNK_SIZE = 10;
    const results: Lecture[] = [];

    for (let i = 0; i < ids.length; i += CHUNK_SIZE) {
        const chunk = ids.slice(i, i + CHUNK_SIZE);
        try {
            const snapshot = await firestore.collection('lectures')
                .where('__name__', 'in', chunk)
                .get();
            snapshot.docs.forEach(doc => {
                results.push({ ...(doc.data() as Lecture), id: doc.id });
            });
        } catch (e) {
            console.error('getLecturesByIds chunk failed:', e);
        }
    }

    // Return in the same order as the input IDs
    const byId = Object.fromEntries(results.map(l => [l.id, l]));
    return ids.map(id => byId[id]).filter(Boolean) as Lecture[];
});


export const getAllLectures = cache(() => getAllDocs<Lecture>('lectures'));
export const getAllSeries = cache(() => getAllDocs<Series>('series'));
export const getAllPrograms = cache(() => getAllDocs<Program>('programs'));
export const getAllTopics = cache(() => getAllDocs<Topic>('topics'));
export const getAllCurriculums = cache(() => getAllDocs<Curriculum>('curriculums'));

export const getAppearanceSettings = cache(async (): Promise<AppearanceSettings | null> => {
    const firestore = getFirestore();
    if (!firestore) return null;

    return withServerCache('settings/appearance', 60_000, async () => {
        const docSnap = await firestore.doc('settings/appearance').get();
        return docSnap.exists ? (docSnap.data() as AppearanceSettings) : null;
    }, null);
});

export const getAnnouncement = cache(async (): Promise<AnnouncementSettings | null> => {
    const firestore = getFirestore();
    if (!firestore) return null;

    return withServerCache('settings/announcement', 60_000, async () => {
        const docSnap = await firestore.doc('settings/announcement').get();
        return docSnap.exists ? (docSnap.data() as AnnouncementSettings) : null;
    }, null);
});

export const getHomepageConfig = async (): Promise<HomepageDetailedConfig | null> => {
    const firestore = getFirestore();
    if (!firestore) return null;

    return withServerCache('settings/homepage', 60_000, async () => {
        const docSnap = await firestore.doc('settings/homepage').get();
        return docSnap.exists ? (docSnap.data() as HomepageDetailedConfig) : null;
    }, null);
};

export const getUpcomingLesson = cache(async (): Promise<ScheduleItem | null> => {
    const firestore = getFirestore();
    if (!firestore) return null;

    try {
        const snapshot = await firestore.collection('scheduled_lessons')
            .where('dateTime', '>=', Timestamp.now())
            .orderBy('dateTime', 'asc')
            .limit(1)
            .get();
            
        if (snapshot.empty) {
            return null;
        }
        const doc = snapshot.docs[0];
        return { ...(doc.data() as ScheduleItem), id: doc.id };
    } catch (e) {
        console.error("Failed to fetch upcoming lesson:", e);
        return null;
    }
});

export const getLatestQAPair = cache(async (): Promise<QAPair | null> => {
    const firestore = getFirestore();
    if (!firestore) return null;
    try {
        const snapshot = await firestore.collection('question_answers')
            .orderBy('createdAt', 'desc')
            .limit(1)
            .get();
            
        if (snapshot.empty) {
            return null;
        }
        const doc = snapshot.docs[0];
        return { ...(doc.data() as QAPair), id: doc.id };
    } catch (e) {
        console.error("Failed to fetch latest Q&A:", e);
        return null;
    }
});

export const getPublicPlaylists = cache(async (): Promise<Playlist[]> => {
    const firestore = getFirestore();
    if (!firestore) return [];

    try {
        const snapshot = await firestore.collectionGroup('playlists')
            .where('isPublic', '==', true)
            .orderBy('createdAt', 'desc')
            .limit(3)
            .get();

        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(doc => ({ ...(doc.data() as Playlist), id: doc.id }));
    } catch (e) {
        console.error("Failed to fetch public playlists:", e);
        return [];
    }
});

export const getLectureBySlug = cache(async (slug: string): Promise<Lecture | null> => {
    const firestore = getFirestore();
    if (!firestore) return null;

    try {
        const snapshot = await firestore.collection('lectures')
            .where('slug', '==', slug)
            .limit(1)
            .get();

        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return { ...(doc.data() as Lecture), id: doc.id };
    } catch (e) {
        console.error('getLectureBySlug failed:', e);
        return null;
    }
});

export const getProgramBySlug = cache(async (slug: string): Promise<Program | null> => {
    const firestore = getFirestore();
    if (!firestore) return null;

    try {
        const snapshot = await firestore.collection('programs')
            .where('slug', '==', slug)
            .limit(1)
            .get();

        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return { ...(doc.data() as Program), id: doc.id };
    } catch (e) {
        console.error('getProgramBySlug failed:', e);
        return null;
    }
});

export const getSeriesByProgram = cache(async (programId: string): Promise<Series[]> => {
    const firestore = getFirestore();
    if (!firestore) return [];

    try {
        const snapshot = await firestore.collection('series')
            .where('programId', '==', programId)
            .get();

        return snapshot.docs.map(doc => ({ ...(doc.data() as Series), id: doc.id }));
    } catch (e) {
        console.error('getSeriesByProgram failed:', e);
        return [];
    }
});

export const getSeriesBySlug = cache(async (slug: string): Promise<Series | null> => {
    const firestore = getFirestore();
    if (!firestore) return null;

    try {
        const snapshot = await firestore.collection('series')
            .where('slug', '==', slug)
            .limit(1)
            .get();

        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return { ...(doc.data() as Series), id: doc.id };
    } catch (e) {
        console.error('getSeriesBySlug failed:', e);
        return null;
    }
});

export const getLecturesBySeries = cache(async (seriesId: string): Promise<Lecture[]> => {
    const firestore = getFirestore();
    if (!firestore) return [];

    try {
        const snapshot = await firestore.collection('lectures')
            .where('seriesId', '==', seriesId)
            .orderBy('createdAt', 'asc')
            .get();

        return snapshot.docs.map(doc => ({ ...(doc.data() as Lecture), id: doc.id }));
    } catch (e) {
        console.error('getLecturesBySeries failed:', e);
        return [];
    }
});

export const getProgramById = cache(async (id: string): Promise<Program | null> => {
    const firestore = getFirestore();
    if (!firestore) return null;

    try {
        const docSnap = await firestore.collection('programs').doc(id).get();
        if (!docSnap.exists) return null;
        return { ...(docSnap.data() as Program), id: docSnap.id };
    } catch (e) {
        console.error('getProgramById failed:', e);
        return null;
    }
});

export const getRelatedLectures = cache(async (seriesId: string, currentLectureId: string): Promise<Lecture[]> => {
    const firestore = getFirestore();
    if (!firestore) return [];

    try {
        const snapshot = await firestore.collection('lectures')
            .where('seriesId', '==', seriesId)
            .limit(4)
            .get();

        return snapshot.docs
            .map(doc => ({ ...(doc.data() as Lecture), id: doc.id }))
            .filter(l => l.id !== currentLectureId)
            .slice(0, 3);
    } catch (e) {
        console.error('getRelatedLectures failed:', e);
        return [];
    }
});

export const getLecturesByProgram = cache(async (programId: string, limitNum: number = 50): Promise<Lecture[]> => {
    const firestore = getFirestore();
    if (!firestore) return [];

    try {
        const snapshot = await firestore.collection('lectures')
            .where('programId', '==', programId)
            .orderBy('createdAt', 'desc')
            .limit(limitNum)
            .get();

        return snapshot.docs.map(doc => ({ ...(doc.data() as Lecture), id: doc.id }));
    } catch (e) {
        console.error('getLecturesByProgram failed:', e);
        return [];
    }
});
