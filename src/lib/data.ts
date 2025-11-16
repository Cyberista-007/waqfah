import type { Lecture, Series, Book, ScheduleItem, QAPair } from './types';
import { collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc, query, orderBy, limit, where } from 'firebase/firestore';
import { getSdks } from '@/firebase';

// This file now interacts with Firestore instead of mock data.

const { firestore } = getSdks();

// --- Series ---
export const getLatestSeries = async (count: number): Promise<Series[]> => {
  const seriesCol = collection(firestore, 'series');
  const q = query(seriesCol, limit(count)); // Note: Firestore doesn't have a native "latest" without a timestamp. This gets the first few.
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...(doc.data() as Omit<Series, 'id'>), id: doc.id }));
};

export const getAllSeries = async (): Promise<Series[]> => {
  const seriesCol = collection(firestore, 'series');
  const q = query(seriesCol, orderBy('title'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...(doc.data() as Omit<Series, 'id'>), id: doc.id }));
};

export const getSeriesBySlug = async (slug: string): Promise<Series | undefined> => {
  // In Firestore, we query by a field. Assuming 'slug' is a field on the document.
  const seriesCol = collection(firestore, 'series');
  const q = query(seriesCol, where("slug", "==", slug), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return undefined;
  const docSnap = snapshot.docs[0];
  return { ...(docSnap.data() as Omit<Series, 'id'>), id: docSnap.id };
};


// --- Lectures ---
export const getLatestLectures = async (count: number): Promise<Lecture[]> => {
  const lecturesCol = collection(firestore, 'lectures');
  const q = query(lecturesCol, orderBy('createdAt', 'desc'), limit(count));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...(doc.data() as Omit<Lecture, 'id'>), id: doc.id }));
};

export const getAllLectures = async (): Promise<Lecture[]> => {
  const lecturesCol = collection(firestore, 'lectures');
  const q = query(lecturesCol, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...(doc.data() as Omit<Lecture, 'id'>), id: doc.id }));
};

export const getLecturesBySeries = async (seriesSlug: string): Promise<Lecture[]> => {
  const lecturesCol = collection(firestore, 'lectures');
  const q = query(lecturesCol, where('seriesSlug', '==', seriesSlug), orderBy('createdAt', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...(doc.data() as Omit<Lecture, 'id'>), id: doc.id }));
};

export const getLectureBySlug = async (slug: string): Promise<Lecture | undefined> => {
  const lecturesCol = collection(firestore, 'lectures');
  const q = query(lecturesCol, where("slug", "==", slug), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return undefined;
  const docSnap = snapshot.docs[0];
  return { ...(docSnap.data() as Omit<Lecture, 'id'>), id: docSnap.id };
};

// --- Books, Schedule, Q&A (assuming similar structure) ---

export const getAllBooks = async (): Promise<Book[]> => {
    const booksCol = collection(firestore, 'books');
    const snapshot = await getDocs(booksCol);
    return snapshot.docs.map(doc => ({ ...(doc.data() as Omit<Book, 'id'>), id: doc.id }));
}

export const getAllScheduleItems = async (): Promise<ScheduleItem[]> => {
    const scheduleCol = collection(firestore, 'scheduled_lessons');
    const snapshot = await getDocs(scheduleCol);
    return snapshot.docs.map(doc => ({ ...(doc.data() as Omit<ScheduleItem, 'id'>), id: doc.id }));
}

export const getAllQAPairs = async (): Promise<QAPair[]> => {
    const qaCol = collection(firestore, 'question_answers');
    const snapshot = await getDocs(qaCol);
    return snapshot.docs.map(doc => ({ ...(doc.data() as Omit<QAPair, 'id'>), id: doc.id }));
}

// Note: The original `getRelatedLectures` had AI logic. We'll stick to simple logic for now.
export const getRelatedLectures = async (currentLectureSlug: string, seriesSlug: string): Promise<Lecture[]> => {
    const lecturesCol = collection(firestore, 'lectures');
    const q = query(
        lecturesCol,
        where('seriesSlug', '==', seriesSlug),
        where('slug', '!=', currentLectureSlug),
        limit(2)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...(doc.data() as Omit<Lecture, 'id'>), id: doc.id }));
}
