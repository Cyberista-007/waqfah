

import 'server-only';
import { initializeAdminApp } from '@/lib/firebase-admin';
import { firebaseConfig } from '@/firebase/config';
import { cache } from 'react';
import type { Lecture, Series, Program, Topic, AppearanceSettings, AnnouncementSettings, Curriculum, ScheduleItem, QAPair, Playlist, HomepageDetailedConfig } from '@/lib/types';
import { Timestamp } from 'firebase-admin/firestore';

const FIRESTORE_REST_BASE = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents`;

const getFirestore = () => {
    const { firestore } = initializeAdminApp();
    return firestore;
}

/**
 * Recursively converts Firestore Timestamps/Dates into plain JSON values
 * so data fetched on the server can safely cross the RSC -> Client boundary.
 */
function serializeValue(val: unknown): any {
    if (val === null || val === undefined) return val;
    if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') return val;
    if (val instanceof Date) return val.toISOString();
    if (Array.isArray(val)) return val.map(serializeValue);
    if (typeof val === 'object') {
        const obj = val as Record<string, any>;
        if (typeof obj.toDate === 'function') {
            return obj.toDate().toISOString();
        }
        if (typeof obj._seconds === 'number' && typeof obj._nanoseconds === 'number') {
            return new Date(obj._seconds * 1000).toISOString();
        }
        if (typeof obj.seconds === 'number' && typeof obj.nanoseconds === 'number') {
            return new Date(obj.seconds * 1000).toISOString();
        }
        const out: Record<string, any> = {};
        for (const [k, v] of Object.entries(obj)) {
            out[k] = serializeValue(v);
        }
        return out;
    }
    return val;
}

function decodeRestValue(field: Record<string, any> | undefined): any {
    if (!field) return null;
    if ('stringValue' in field) return field.stringValue;
    if ('integerValue' in field) return Number(field.integerValue);
    if ('doubleValue' in field) return Number(field.doubleValue);
    if ('booleanValue' in field) return Boolean(field.booleanValue);
    if ('timestampValue' in field) return field.timestampValue;
    if ('nullValue' in field) return null;
    if ('arrayValue' in field) {
        const values = field.arrayValue?.values || [];
        return values.map((v: Record<string, any>) => decodeRestValue(v));
    }
    if ('mapValue' in field) {
        const fields = field.mapValue?.fields || {};
        const out: Record<string, any> = {};
        for (const [k, v] of Object.entries(fields)) {
            out[k] = decodeRestValue(v as Record<string, any>);
        }
        return out;
    }
    return null;
}

function decodeRestDocument<T>(doc: { name?: string; fields?: Record<string, any> }): (T & { id: string }) | null {
    if (!doc?.name) return null;
    const id = doc.name.split('/').pop() || '';
    const data: Record<string, any> = {};
    for (const [k, v] of Object.entries(doc.fields || {})) {
        data[k] = decodeRestValue(v as Record<string, any>);
    }
    return { ...(data as T), id };
}

async function fetchRestCollection<T>(
    collectionName: string,
    options?: { orderBy?: [string, 'asc' | 'desc']; limit?: number; select?: string[] }
): Promise<(T & { id: string })[]> {
    const structuredQuery: Record<string, any> = {
        from: [{ collectionId: collectionName }],
    };
    if (options?.select?.length) {
        structuredQuery.select = {
            fields: options.select.map((fieldPath) => ({ fieldPath })),
        };
    }
    if (options?.orderBy) {
        structuredQuery.orderBy = [
            {
                field: { fieldPath: options.orderBy[0] },
                direction: options.orderBy[1] === 'asc' ? 'ASCENDING' : 'DESCENDING',
            },
        ];
    }
    if (options?.limit) {
        structuredQuery.limit = options.limit;
    }
    const res = await fetch(`${FIRESTORE_REST_BASE}:runQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ structuredQuery }),
        next: { revalidate: 120 },
    });
    if (!res.ok) {
        throw new Error(`Firestore REST HTTP ${res.status}`);
    }
    const rows = (await res.json()) as Array<{ document?: { name?: string; fields?: Record<string, any> } }>;
    return rows
        .map((row) => (row.document ? decodeRestDocument<T>(row.document) : null))
        .filter((item): item is T & { id: string } => item !== null);
}

async function fetchRestDoc<T>(docPath: string): Promise<T | null> {
    const res = await fetch(`${FIRESTORE_REST_BASE}/${docPath}`, {
        next: { revalidate: 120 },
    });
    if (res.status === 404) return null;
    if (!res.ok) {
        throw new Error(`Firestore REST HTTP ${res.status}`);
    }
    const doc = await res.json();
    return decodeRestDocument<T>(doc);
}

let quotaExhaustedUntil = 0;
const serverReadCache = new Map<string, { value: any; expiresAt: number }>();

function isQuotaBlocked(): boolean {
    return Date.now() < quotaExhaustedUntil;
}

function handleFirestoreError(label: string, error: any) {
    const msg = String(error?.message || '');
    if (error?.code === 8 || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('HTTP 429')) {
        quotaExhaustedUntil = Date.now() + 60_000;
    }
    console.error(`${label}:`, msg || error);
}

async function withServerCache<T>(key: string, ttlMs: number, loader: () => Promise<T>, fallback: T): Promise<T> {
    if (isQuotaBlocked()) return fallback;
    const hit = serverReadCache.get(key);
    if (hit && Date.now() < hit.expiresAt) {
        return hit.value as T;
    }
    try {
        const value = await loader();
        const isNonEmpty = Array.isArray(value) ? value.length > 0 : value !== null && value !== undefined;
        if (isNonEmpty) {
            serverReadCache.set(key, { value, expiresAt: Date.now() + ttlMs });
        }
        return value;
    } catch (error) {
        handleFirestoreError(`Server cache fetch failed [${key}]`, error);
        return fallback;
    }
}

const getAllDocs = async <T>(collectionName: string, select?: string[]): Promise<(T & { id: string })[]> => {
    const firestore = getFirestore();
    if (isQuotaBlocked()) return [];
    if (!firestore) {
        try {
            return await fetchRestCollection<T>(collectionName, select ? { select } : undefined);
        } catch (error) {
            handleFirestoreError(`REST fetch failed for ${collectionName}`, error);
            return [];
        }
    }

    try {
        let ref: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = firestore.collection(collectionName);
        if (select?.length) {
            ref = ref.select(...select);
        }
        const snapshot = await ref.get();
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(doc => serializeValue({ ...(doc.data() as T), id: doc.id }));
    } catch (error) {
        handleFirestoreError(`Could not fetch collection ${collectionName}`, error);
        return [];
    }
};

const getDocsWithQuery = async <T>(collectionName: string, options: { orderBy: [string, 'asc' | 'desc'], limit: number, select?: string[] }): Promise<(T & { id: string })[]> => {
    if (isQuotaBlocked()) return [];
    const cacheKey = `query:${collectionName}:${options.orderBy.join(':')}:${options.limit}:${options.select?.join(',') || '*'}`;

    return withServerCache(cacheKey, 120_000, async () => {
        const firestore = getFirestore();
        if (!firestore) {
            return fetchRestCollection<T>(collectionName, options);
        }

        let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = firestore.collection(collectionName);
        if (options.select?.length) {
            query = query.select(...options.select);
        }
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
        return snapshot.docs.map(doc => serializeValue({ ...(doc.data() as T), id: doc.id }));
    }, []);
};

const LECTURE_SUMMARY_FIELDS = [
    'slug',
    'title',
    'programId',
    'programName',
    'programSlug',
    'seriesId',
    'seriesSlug',
    'seriesTitle',
    'duration',
    'audioSrc',
    'imageId',
    'youtubeUrl',
    'description',
    'rating',
    'ratingCount',
    'viewCount',
    'youtubeViewCount',
    'publishedAt',
    'createdAt',
    'language',
];

export const getLatestSeries = cache(() => getDocsWithQuery<Series>('series', { orderBy: ['createdAt', 'desc'], limit: 12 }));
export const getLatestLectures = cache(() => getDocsWithQuery<Lecture>('lectures', { orderBy: ['createdAt', 'desc'], limit: 12, select: LECTURE_SUMMARY_FIELDS }));
export const getTopPrograms = cache(() => getDocsWithQuery<Program>('programs', { orderBy: ['followerCount', 'desc'], limit: 50 }));

// Fetch specific lectures by their document IDs (used for homepage strips)
export const getLecturesByIds = cache(async (ids: string[]): Promise<Lecture[]> => {
    if (!ids || ids.length === 0) return [];
    const firestore = getFirestore();
    if (!firestore) {
        const docs = await Promise.all(
            ids.map((id) => fetchRestDoc<Lecture>(`lectures/${id}`).catch(() => null))
        );
        return docs.filter(Boolean) as Lecture[];
    }

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
                results.push(serializeValue({ ...(doc.data() as Lecture), id: doc.id }));
            });
        } catch (e) {
            console.error('getLecturesByIds chunk failed:', e);
        }
    }

    // Return in the same order as the input IDs
    const byId = Object.fromEntries(results.map(l => [l.id, l]));
    return ids.map(id => byId[id]).filter(Boolean) as Lecture[];
});


export const getAllLectures = cache((select?: string[]) => getAllDocs<Lecture>('lectures', select));
export const getAllSeries = cache((select?: string[]) => getAllDocs<Series>('series', select));
export const getAllPrograms = cache((select?: string[]) => getAllDocs<Program>('programs', select));
export const getAllTopics = cache((select?: string[]) => getAllDocs<Topic>('topics', select));
export const getAllCurriculums = cache((select?: string[]) => getAllDocs<Curriculum>('curriculums', select));

export const getAppearanceSettings = cache(async (): Promise<AppearanceSettings | null> => {
    return withServerCache('settings/appearance', 120_000, async () => {
        const firestore = getFirestore();
        if (!firestore) return fetchRestDoc<AppearanceSettings>('settings/appearance');
        const docSnap = await firestore.doc('settings/appearance').get();
        return docSnap.exists ? serializeValue(docSnap.data() as AppearanceSettings) : null;
    }, null);
});

export const getAnnouncement = cache(async (): Promise<AnnouncementSettings | null> => {
    return withServerCache('settings/announcement', 120_000, async () => {
        const firestore = getFirestore();
        if (!firestore) return fetchRestDoc<AnnouncementSettings>('settings/announcement');
        const docSnap = await firestore.doc('settings/announcement').get();
        return docSnap.exists ? serializeValue(docSnap.data() as AnnouncementSettings) : null;
    }, null);
});

export const getHomepageConfig = async (): Promise<HomepageDetailedConfig | null> => {
    return withServerCache('settings/homepage', 120_000, async () => {
        const firestore = getFirestore();
        if (!firestore) return fetchRestDoc<HomepageDetailedConfig>('settings/homepage');
        const docSnap = await firestore.doc('settings/homepage').get();
        return docSnap.exists ? serializeValue(docSnap.data() as HomepageDetailedConfig) : null;
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
