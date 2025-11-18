import type { Lecture, Series, Book, ScheduleItem, QAPair } from './types';
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

// --- Series ---
export const getLatestSeries = async (count: number): Promise<Series[]> => {
  try {
    const db = getDb();
    const seriesCol = collection(db, 'series');
    const q = query(seriesCol, orderBy('createdAt', 'desc'), limit(count));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...(doc.data() as Omit<Series, 'id'>), id: doc.id }));
  } catch (error) {
    console.error("Error fetching latest series:", error);
    return [];
  }
};

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

export const getSeriesBySlug = async (slug: string): Promise<Series | undefined> => {
  try {
    const db = getDb();
    const seriesCol = collection(db, 'series');
    const q = query(seriesCol, where("slug", "==", slug), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return undefined;
    const docSnap = snapshot.docs[0];
    return { ...(docSnap.data() as Omit<Series, 'id'>), id: docSnap.id };
  } catch (error) {
    console.error("Error fetching series by slug:", error);
    return undefined;
  }
};


// --- Lectures ---
export const getLatestLectures = async (count: number): Promise<Lecture[]> => {
  try {
    const db = getDb();
    const lecturesCol = collection(db, 'lectures');
    const q = query(lecturesCol, orderBy('createdAt', 'desc'), limit(count));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...(doc.data() as Omit<Lecture, 'id'>), id: doc.id }));
  } catch (error) {
    console.error("Error fetching latest lectures:", error);
    return [];
  }
};

export const getAllLectures = async (): Promise<Lecture[]> => {
  try {
    const db = getDb();
    const lecturesCol = collection(db, 'lectures');
    const q = query(lecturesCol, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...(doc.data() as Omit<Lecture, 'id'>), id: doc.id }));
  } catch (error) {
    console.error("Error fetching all lectures:", error);
    return [];
  }
};

export const getLecturesBySeries = async (seriesSlug: string): Promise<Lecture[]> => {
  try {
    const db = getDb();
    const lecturesCol = collection(db, 'lectures');
    const q = query(lecturesCol, where('seriesSlug', '==', seriesSlug), orderBy('createdAt', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...(doc.data() as Omit<Lecture, 'id'>), id: doc.id }));
  } catch (error) {
    console.error("Error fetching lectures by series:", error);
    return [];
  }
};

export const getLectureBySlug = async (slug: string): Promise<Lecture | undefined> => {
  try {
    const db = getDb();
    const lecturesCol = collection(db, 'lectures');
    const q = query(lecturesCol, where("slug", "==", slug), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return undefined;
    const docSnap = snapshot.docs[0];
    const lectureData = docSnap.data();

    return { ...(lectureData as Omit<Lecture, 'id'>), id: docSnap.id };
  } catch (error) {
      console.error("Error fetching lecture by slug:", error);
      return undefined;
  }
};

// --- Books, Schedule, Q&A (assuming similar structure) ---

export const getAllBooks = async (): Promise<Book[]> => {
    try {
        const db = getDb();
        const booksCol = collection(db, 'books');
        const snapshot = await getDocs(booksCol);
        return snapshot.docs.map(doc => ({ ...(doc.data() as Omit<Book, 'id'>), id: doc.id }));
    } catch(e) {
        return [];
    }
}

export const getAllScheduleItems = async (): Promise<ScheduleItem[]> => {
    try {
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
                    date: date.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
                    time: date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
                };
            }
            return { ...(data as Omit<ScheduleItem, 'id'>), id: doc.id };
        });
    } catch (e) {
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
            limit(3)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ ...(doc.data() as Omit<Lecture, 'id'>), id: doc.id }));
    } catch (e) {
        return [];
    }
}

export async function searchContent(searchTerm: string): Promise<{ lectures: Lecture[], series: Series[], books: Book[] }> {
    if (!searchTerm) {
        return { lectures: [], series: [], books: [] };
    }
    const db = getDb();

    // This is a very basic search. For production, a dedicated search service like Algolia or Typesense is recommended.
    // This queries for titles that are >= search term and < search term + a high-unicode character.
    const lecturesRef = collection(db, "lectures");
    const seriesRef = collection(db, "series");
    const booksRef = collection(db, "books");

    const lecturesQuery = query(
        lecturesRef,
        where("title", ">=", searchTerm),
        where("title", "<=", searchTerm + "\uf8ff")
    );
    const seriesQuery = query(
        seriesRef,
        where("title", ">=", searchTerm),
        where("title", "<=", searchTerm + "\uf8ff")
    );
    const booksQuery = query(
        booksRef,
        where("title", ">=", searchTerm),
        where("title", "<=", searchTerm + "\uf8ff")
    );
    
    try {
        const [lecturesSnapshot, seriesSnapshot, booksSnapshot] = await Promise.all([
            getDocs(lecturesQuery),
            getDocs(seriesQuery),
            getDocs(booksQuery)
        ]);

        const lectures = lecturesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lecture));
        const series = seriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Series));
        const books = booksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Book));

        return { lectures, series, books };
    } catch (error) {
        console.error("Error searching content:", error);
        return { lectures: [], series: [], books: [] };
    }
}

export const getListenHistory = async (userId: string): Promise<any[]> => {
    const db = getDb();
    const historyRef = collection(db, 'users', userId, 'listenHistory');
    const q = query(historyRef, orderBy('lastListened', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), lectureId: doc.id }));
};

export const getPlaylist = async (userId: string): Promise<string[]> => {
    const db = getDb();
    const playlistRef = collection(db, 'users', userId, 'playlist');
    const snapshot = await getDocs(playlistRef);
    // Returns an array of lecture IDs
    return snapshot.docs.map(doc => doc.id);
};


export const getStats = async (userId: string) => {
    const db = getDb();
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
        const userData = userSnap.data();
        return {
            minutesListened: userData.minutesListened || 0,
            lecturesCompleted: userData.lecturesCompleted || 0,
            seriesCompleted: userData.seriesCompleted || 0,
        };
    }
    return { minutesListened: 0, lecturesCompleted: 0, seriesCompleted: 0 };
};

export const getAllUsers = async (): Promise<any[]> => {
    const db = getDb();
    const usersCol = collection(db, 'users');
    const snapshot = await getDocs(usersCol);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
};