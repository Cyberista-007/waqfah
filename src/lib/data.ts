import type { Lecture, Series, Book, ScheduleItem, QAPair, Sheikh, Topic, ListenHistoryItem, UserProfile } from './types';
import { collection, getDocs, getDoc, doc, query, orderBy, limit, where, Timestamp } from 'firebase/firestore';
import { initializeFirebaseOnServer } from '@/firebase/server-init';

// This file now interacts with Firestore instead of mock data.
const getDb = () => {
    const { serverFirestore } = initializeFirebaseOnServer();
    if (!serverFirestore) {
        throw new Error("Firestore is not initialized on the server.");
    }
    return serverFirestore;
}

// --- Sheikhs ---
export const getAllSheikhs = async (): Promise<Sheikh[]> => {
  try {
    const db = getDb();
    const sheikhsCol = collection(db, 'sheikhs');
    const q = query(sheikhsCol, orderBy('name'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...(doc.data() as Omit<Sheikh, 'id'>), id: doc.id }));
  } catch (error) {
    console.error("Error fetching all sheikhs:", error);
    return [];
  }
}

export const getSheikhBySlug = async (slug: string): Promise<Sheikh | undefined> => {
  try {
    const db = getDb();
    const sheikhsCol = collection(db, 'sheikhs');
    const q = query(sheikhsCol, where("slug", "==", slug), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return undefined;
    const docSnap = snapshot.docs[0];
    return { ...(docSnap.data() as Omit<Sheikh, 'id'>), id: docSnap.id };
  } catch (error) {
    console.error("Error fetching sheikh by slug:", error);
    return undefined;
  }
}


// --- Series ---
export const getAllSeries = async (): Promise<Series[]> => {
  try {
    const db = getDb();
    const seriesCol = collection(db, 'series');
    const q = query(seriesCol, orderBy('title'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...(doc.data() as Omit<Series, 'id'>), id: doc.id }));
  } catch (error) {
    console.error("Error fetching all series:", error);
    return [];
  }
};


// --- Lectures ---
export const getLectureBySlug = async (slug: string): Promise<Lecture | undefined> => {
  try {
    const db = getDb();
    const lecturesCol = collection(db, 'lectures');
    const q = query(lecturesCol, where("slug", "==", slug), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return undefined;
    const docSnap = snapshot.docs[0];
    const lectureData = docSnap.data();

    // Ensure Timestamps are converted if they exist
    const createdAt = lectureData.createdAt instanceof Timestamp ? lectureData.createdAt : Timestamp.now();

    return { 
      ...(lectureData as Omit<Lecture, 'id' | 'createdAt'>), 
      id: docSnap.id,
      createdAt,
    };
  } catch (error) {
      console.error("Error fetching lecture by slug:", error);
      return undefined;
  }
};

export const getLecturesBySheikh = async (sheikhId: string): Promise<Lecture[]> => {
  try {
    const db = getDb();
    const lecturesCol = collection(db, 'lectures');
    const q = query(lecturesCol, where('sheikhId', '==', sheikhId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...(doc.data() as Omit<Lecture, 'id'>), id: doc.id }));
  } catch (error) {
    console.error("Error fetching lectures by sheikh:", error);
    return [];
  }
}

export const getSeriesBySheikh = async (sheikhId: string): Promise<Series[]> => {
  try {
    const db = getDb();
    const seriesCol = collection(db, 'series');
    const q = query(seriesCol, where('sheikhId', '==', sheikhId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...(doc.data() as Omit<Series, 'id'>), id: doc.id }));
  } catch (error) {
    console.error("Error fetching series by sheikh:", error);
    return [];
  }
}

// --- Books, Schedule, Q&A ---

export const getAllBooks = async (): Promise<Book[]> => {
    try {
        const db = getDb();
        const booksCol = collection(db, 'books');
        const q = query(booksCol, orderBy('title', 'asc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ ...(doc.data() as Omit<Book, 'id'>), id: doc.id }));
    } catch(e) {
        console.error("Error fetching books:", e);
        return [];
    }
}

export const getAllScheduleItems = async (): Promise<ScheduleItem[]> => {
    try {
        const db = getDb();
        const scheduleCol = collection(db, 'scheduled_lessons');
        const q = query(scheduleCol, orderBy('dateTime', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(docSnap => {
            const data = docSnap.data();
            const date = data.dateTime.toDate();
            return { 
                ...(data as Omit<ScheduleItem, 'id' | 'date' | 'time'>),
                id: docSnap.id,
                date: date.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
                time: date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
            };
        });
    } catch (e) {
        console.error("Error fetching schedule items:", e);
        return [];
    }
}

export const getAllQAPairs = async (): Promise<QAPair[]> => {
    try {
        const db = getDb();
        const qaCol = collection(db, 'question_answers');
        const snapshot = await getDocs(qaCol);
        return snapshot.docs.map(doc => ({ ...(doc.data() as Omit<QAPair, 'id'>), id: doc.id }));
    } catch (e) {
        console.error("Error fetching Q&A pairs:", e);
        return [];
    }
}

export const getRelatedLectures = async (currentLectureId: string, seriesId: string): Promise<Lecture[]> => {
    if (!seriesId) return [];
    try {
        const db = getDb();
        const lecturesCol = collection(db, 'lectures');
        const q = query(
            lecturesCol,
            where('seriesId', '==', seriesId),
            where('__name__', '!=', currentLectureId),
            orderBy('__name__'), // orderBy name is required for inequality filters
            limit(3)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ ...(doc.data() as Omit<Lecture, 'id'>), id: doc.id }));
    } catch (e) {
        console.error("Error fetching related lectures:", e);
        return [];
    }
}

export async function searchContent(searchTerm: string): Promise<{ lectures: Lecture[], series: Series[], sheikhs: Sheikh[] }> {
    if (!searchTerm) {
        return { lectures: [], series: [], sheikhs: [] };
    }
    const db = getDb();
    
    // This is a very basic search. For production, a dedicated search service like Algolia or Typesense is recommended.
    const searchTermLower = searchTerm.toLowerCase();

    try {
        const [lecturesSnap, seriesSnap, sheikhsSnap] = await Promise.all([
            getDocs(collection(db, "lectures")),
            getDocs(collection(db, "series")),
            getDocs(collection(db, "sheikhs"))
        ]);

        const lectures = lecturesSnap.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Lecture))
            .filter(l => l.title.toLowerCase().includes(searchTermLower));

        const series = seriesSnap.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Series))
            .filter(s => s.title.toLowerCase().includes(searchTermLower));
            
        const sheikhs = sheikhsSnap.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Sheikh))
            .filter(s => s.name.toLowerCase().includes(searchTermLower));

        return { lectures, series, sheikhs };
    } catch (error) {
        console.error("Error searching content:", error);
        return { lectures: [], series: [], sheikhs: [] };
    }
}

// --- Topics ---
export const getAllTopics = async (): Promise<Topic[]> => {
  try {
    const db = getDb();
    const topicsCol = collection(db, 'topics');
    const q = query(topicsCol, orderBy('name'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...(doc.data() as Omit<Topic, 'id'>), id: doc.id }));
  } catch (error) {
    console.error("Error fetching all topics:", error);
    return [];
  }
};

export const getTopicBySlug = async (slug: string): Promise<Topic | undefined> => {
  try {
    const db = getDb();
    const topicsCol = collection(db, 'topics');
    const q = query(topicsCol, where("slug", "==", slug), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return undefined;
    const docSnap = snapshot.docs[0];
    return { ...(docSnap.data() as Omit<Topic, 'id'>), id: docSnap.id };
  } catch (error) {
    console.error("Error fetching topic by slug:", error);
    return undefined;
  }
};

async function getDocumentsByIds<T>(collectionName: string, ids: string[] | undefined): Promise<T[]> {
    if (!ids || ids.length === 0) return [];
    const db = getDb();
    const docs: T[] = [];
    // Firestore 'in' query limit is 30
    for (let i = 0; i < ids.length; i += 30) {
        const chunk = ids.slice(i, i + 30);
        const colRef = collection(db, collectionName);
        const q = query(colRef, where('__name__', 'in', chunk));
        const snapshot = await getDocs(q);
        snapshot.forEach(docSnap => {
            docs.push({ ...(docSnap.data() as Omit<T, 'id'>), id: docSnap.id } as T);
        });
    }
    return docs;
}

export const getLecturesByIds = (ids: string[] | undefined) => getDocumentsByIds<Lecture>('lectures', ids);
export const getSeriesByIds = (ids: string[] | undefined) => getDocumentsByIds<Series>('series', ids);
