import type { Lecture, Series, Book, ScheduleItem, QAPair } from './types';
import { collection, getDocs, getDoc, doc, query, orderBy, limit, where, Timestamp } from 'firebase/firestore';
import { initializeFirebaseOnServer } from '@/firebase/server-init';

// This file now interacts with Firestore instead of mock data.
const getDb = () => initializeFirebaseOnServer().serverFirestore;

// --- Series ---
export const getLatestSeries = async (count: number): Promise<Series[]> => {
  const db = getDb();
  const seriesCol = collection(db, 'series');
  // Order by a field, assuming 'createdAt' exists for latest. If not, this just limits.
  const q = query(seriesCol, orderBy('createdAt', 'desc'), limit(count));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...(doc.data() as Omit<Series, 'id'>), id: doc.id }));
};

export const getAllSeries = async (): Promise<Series[]> => {
  const db = getDb();
  const seriesCol = collection(db, 'series');
  const q = query(seriesCol, orderBy('title'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...(doc.data() as Omit<Series, 'id'>), id: doc.id }));
};

export const getSeriesBySlug = async (slug: string): Promise<Series | undefined> => {
  const db = getDb();
  // In Firestore, we query by a field. Assuming 'slug' is a field on the document.
  const seriesCol = collection(db, 'series');
  const q = query(seriesCol, where("slug", "==", slug), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return undefined;
  const docSnap = snapshot.docs[0];
  return { ...(docSnap.data() as Omit<Series, 'id'>), id: docSnap.id };
};


// --- Lectures ---
export const getLatestLectures = async (count: number): Promise<Lecture[]> => {
  const db = getDb();
  const lecturesCol = collection(db, 'lectures');
  const q = query(lecturesCol, orderBy('createdAt', 'desc'), limit(count));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...(doc.data() as Omit<Lecture, 'id'>), id: doc.id }));
};

export const getAllLectures = async (): Promise<Lecture[]> => {
  const db = getDb();
  const lecturesCol = collection(db, 'lectures');
  const q = query(lecturesCol, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...(doc.data() as Omit<Lecture, 'id'>), id: doc.id }));
};

export const getLecturesBySeries = async (seriesSlug: string): Promise<Lecture[]> => {
  const db = getDb();
  const lecturesCol = collection(db, 'lectures');
  const q = query(lecturesCol, where('seriesSlug', '==', seriesSlug), orderBy('createdAt', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...(doc.data() as Omit<Lecture, 'id'>), id: doc.id }));
};

export const getLectureBySlug = async (slug: string): Promise<Lecture | undefined> => {
  const db = getDb();
  const lecturesCol = collection(db, 'lectures');
  const q = query(lecturesCol, where("slug", "==", slug), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return undefined;
  const docSnap = snapshot.docs[0];
  const lectureData = docSnap.data();

  // Fetch the series to get the seriesId for linking
  const seriesSnapshot = await getDocs(query(collection(db, 'series'), where('slug', '==', lectureData.seriesSlug), limit(1)));
  if (!seriesSnapshot.empty) {
    lectureData.seriesId = seriesSnapshot.docs[0].id;
  }

  return { ...(lectureData as Omit<Lecture, 'id'>), id: docSnap.id };
};

// --- Books, Schedule, Q&A (assuming similar structure) ---

export const getAllBooks = async (): Promise<Book[]> => {
    const db = getDb();
    const booksCol = collection(db, 'books');
    const snapshot = await getDocs(booksCol);
    return snapshot.docs.map(doc => ({ ...(doc.data() as Omit<Book, 'id'>), id: doc.id }));
}

export const getAllScheduleItems = async (): Promise<ScheduleItem[]> => {
    const db = getDb();
    const scheduleCol = collection(db, 'scheduled_lessons');
    const q = query(scheduleCol, orderBy('dateTime', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        // Convert Firestore Timestamp to string if needed
        if (data.dateTime instanceof Timestamp) {
            const date = data.dateTime.toDate();
            return { 
                ...(data as Omit<ScheduleItem, 'id' | 'date' | 'time'>),
                id: doc.id,
                date: date.toLocaleDateString('ar-EG'),
                time: date.toLocaleTimeString('ar-EG'),
            };
        }
        return { ...(data as Omit<ScheduleItem, 'id'>), id: doc.id };
    });
}

export const getAllQAPairs = async (): Promise<QAPair[]> => {
    const db = getDb();
    const qaCol = collection(db, 'question_answers');
    const snapshot = await getDocs(qaCol);
    return snapshot.docs.map(doc => ({ ...(doc.data() as Omit<QAPair, 'id'>), id: doc.id }));
}

// Note: The original `getRelatedLectures` had AI logic. We'll stick to simple logic for now.
export const getRelatedLectures = async (currentLectureSlug: string, seriesSlug: string): Promise<Lecture[]> => {
    if (!seriesSlug) return [];
    const db = getDb();
    const lecturesCol = collection(db, 'lectures');
    const q = query(
        lecturesCol,
        where('seriesSlug', '==', seriesSlug),
        where('slug', '!=', currentLectureSlug),
        limit(3)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...(doc.data() as Omit<Lecture, 'id'>), id: doc.id }));
}
