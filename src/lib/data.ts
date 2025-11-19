
import type { Lecture, Series, Book, ScheduleItem, QAPair, Sheikh, Topic, ListenHistoryItem, UserProfile } from './types';
import { collection, getDocs, getDoc, doc, query, orderBy, limit, where, Timestamp } from 'firebase/firestore';
import { initializeFirebaseOnServer } from '@/firebase/server-init';

// Dummy data imports
import DUMMY_SHEIKHS from '@/../docs/dummy-data/sheikhs.json';
import DUMMY_SERIES from '@/../docs/dummy-data/series.json';
import DUMMY_LECTURES from '@/../docs/dummy-data/lectures.json';

// This file now interacts with Firestore instead of mock data.
const getDb = () => {
    // This can throw if credentials are not available.
    // The calling functions must handle this.
    const { serverFirestore } = initializeFirebaseOnServer();
    return serverFirestore;
}

const toSerializable = (docData: any) => {
    if (!docData) return docData;

    const data = { ...docData };
    for (const key in data) {
        if (data[key] instanceof Timestamp) {
            data[key] = data[key].toDate().toISOString();
        }
    }
    return data;
};

// --- Sheikhs ---
export const getAllSheikhs = async (): Promise<Sheikh[]> => {
  try {
    const db = getDb();
    const sheikhsCol = collection(db, 'sheikhs');
    const q = query(sheikhsCol, orderBy('name'));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
        return snapshot.docs.map(doc => toSerializable({ ...doc.data(), id: doc.id })) as Sheikh[];
    }
    // Fallback to dummy data if collection is empty
    return DUMMY_SHEIKHS.map(s => ({...s, id: s.id, createdAt: new Date(s.createdAt).toISOString()})) as Sheikh[];
  } catch (error) {
    console.error("Error fetching all sheikhs, using fallback:", error);
    return DUMMY_SHEIKHS.map(s => ({...s, id: s.id, createdAt: new Date(s.createdAt).toISOString()})) as Sheikh[];
  }
}

export const getSheikhBySlug = async (slug: string): Promise<Sheikh | undefined> => {
  try {
    const db = getDb();
    const sheikhsCol = collection(db, 'sheikhs');
    const q = query(sheikhsCol, where("slug", "==", slug), limit(1));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        return toSerializable({ ...docSnap.data(), id: docSnap.id }) as Sheikh;
    }
    const dummySheikh = DUMMY_SHEIKHS.find(s => s.slug === slug);
    if (dummySheikh) return {...dummySheikh, id: dummySheikh.id, createdAt: new Date(dummySheikh.createdAt).toISOString()} as Sheikh;
    return undefined;
  } catch (error) {
    console.error("Error fetching sheikh by slug, using fallback:", error);
    const dummySheikh = DUMMY_SHEIKHS.find(s => s.slug === slug);
    if (dummySheikh) return {...dummySheikh, id: dummySheikh.id, createdAt: new Date(dummySheikh.createdAt).toISOString()} as Sheikh;
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
    if (!snapshot.empty) {
        return snapshot.docs.map(doc => toSerializable({ ...doc.data(), id: doc.id })) as Series[];
    }
    return DUMMY_SERIES.map(s => ({...s, id: s.id, createdAt: new Date(s.createdAt).toISOString()})) as Series[];
  } catch (error) {
    console.error("Error fetching all series, using fallback:", error);
    return DUMMY_SERIES.map(s => ({...s, id: s.id, createdAt: new Date(s.createdAt).toISOString()})) as Series[];
  }
};


// --- Lectures ---
export const getLectureBySlug = async (slug: string): Promise<Lecture | undefined> => {
  try {
    const db = getDb();
    const lecturesCol = collection(db, 'lectures');
    const q = query(lecturesCol, where("slug", "==", slug), limit(1));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        const lectureData = docSnap.data();
        return toSerializable({ 
          ...lectureData, 
          id: docSnap.id,
          transcript: lectureData.transcript || [],
        }) as Lecture;
    }
    const dummyLecture = DUMMY_LECTURES.find(l => l.slug === slug);
    if (dummyLecture) return {...dummyLecture, id: dummyLecture.id, createdAt: new Date(dummyLecture.createdAt).toISOString(), transcript: []} as Lecture;
    return undefined;

  } catch (error) {
      console.error("Error fetching lecture by slug, using fallback:", error);
      const dummyLecture = DUMMY_LECTURES.find(l => l.slug === slug);
      if (dummyLecture) return {...dummyLecture, id: dummyLecture.id, createdAt: new Date(dummyLecture.createdAt).toISOString(), transcript: []} as Lecture;
      return undefined;
  }
};

export const getLecturesBySheikh = async (sheikhId: string): Promise<Lecture[]> => {
  try {
    const db = getDb();
    const lecturesCol = collection(db, 'lectures');
    const q = query(lecturesCol, where('sheikhId', '==', sheikhId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
        return snapshot.docs.map(doc => toSerializable({ ...doc.data(), id: doc.id })) as Lecture[];
    }
    return DUMMY_LECTURES.filter(l => l.sheikhId === sheikhId).map(l => ({...l, id: l.id, createdAt: new Date(l.createdAt).toISOString(), transcript: []})) as Lecture[];
  } catch (error) {
    console.error("Error fetching lectures by sheikh, using fallback:", error);
    return DUMMY_LECTURES.filter(l => l.sheikhId === sheikhId).map(l => ({...l, id: l.id, createdAt: new Date(l.createdAt).toISOString(), transcript: []})) as Lecture[];
  }
}

export const getSeriesBySheikh = async (sheikhId: string): Promise<Series[]> => {
  try {
    const db = getDb();
    const seriesCol = collection(db, 'series');
    const q = query(seriesCol, where('sheikhId', '==', sheikhId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
        return snapshot.docs.map(doc => toSerializable({ ...doc.data(), id: doc.id })) as Series[];
    }
    return DUMMY_SERIES.filter(s => s.sheikhId === sheikhId).map(s => ({...s, id: s.id, createdAt: new Date(s.createdAt).toISOString()})) as Series[];
  } catch (error) {
    console.error("Error fetching series by sheikh, using fallback:", error);
    return DUMMY_SERIES.filter(s => s.sheikhId === sheikhId).map(s => ({...s, id: s.id, createdAt: new Date(s.createdAt).toISOString()})) as Series[];
  }
}

// --- Books, Schedule, Q&A ---

export const getAllBooks = async (): Promise<Book[]> => {
    try {
        const db = getDb();
        const booksCol = collection(db, 'books');
        const q = query(booksCol, orderBy('title', 'asc'));
        const snapshot = await getDocs(q);
        if(!snapshot.empty) {
          return snapshot.docs.map(doc => toSerializable({ ...doc.data(), id: doc.id })) as Book[];
        }
        return []; // No dummy data for books yet
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
        if (!snapshot.empty) {
            return snapshot.docs.map(docSnap => {
                const data = docSnap.data();
                const date = data.dateTime.toDate();
                return { 
                    ...toSerializable(data),
                    id: docSnap.id,
                    date: date.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
                    time: date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
                };
            });
        }
        return []; // No dummy data for schedule yet
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
        if (!snapshot.empty) {
            return snapshot.docs.map(doc => toSerializable({ ...doc.data(), id: doc.id })) as QAPair[];
        }
        return []; // No dummy data for Q&A yet
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
        if (!snapshot.empty) {
            return snapshot.docs.map(doc => toSerializable({ ...doc.data(), id: doc.id })) as Lecture[];
        }
        return DUMMY_LECTURES.filter(l => l.seriesId === seriesId && l.id !== currentLectureId).slice(0, 3).map(l => ({...l, id: l.id, createdAt: new Date(l.createdAt).toISOString(), transcript: []})) as Lecture[];
    } catch (e) {
        console.error("Error fetching related lectures, using fallback:", e);
        return DUMMY_LECTURES.filter(l => l.seriesId === seriesId && l.id !== currentLectureId).slice(0, 3).map(l => ({...l, id: l.id, createdAt: new Date(l.createdAt).toISOString(), transcript: []})) as Lecture[];
    }
}

export async function searchContent(searchTerm: string): Promise<{ lectures: Lecture[], series: Series[], sheikhs: Sheikh[] }> {
    if (!searchTerm) {
        return { lectures: [], series: [], sheikhs: [] };
    }
    
    // This is a very basic search. For production, a dedicated search service like Algolia or Typesense is recommended.
    const searchTermLower = searchTerm.toLowerCase();

    try {
        const [allLectures, allSeries, allSheikhs] = await Promise.all([
          getAllLectures(),
          getAllSeries(),
          getAllSheikhs()
        ]);

        const lectures = allLectures.filter(l => l.title.toLowerCase().includes(searchTermLower));
        const series = allSeries.filter(s => s.title.toLowerCase().includes(searchTermLower));
        const sheikhs = allSheikhs.filter(s => s.name.toLowerCase().includes(searchTermLower));

        return { lectures, series, sheikhs };
    } catch (error) {
        console.error("Error searching content:", error);
        return { lectures: [], series: [], sheikhs: [] };
    }
}

const getAllLectures = async (): Promise<Lecture[]> => {
  try {
    const db = getDb();
    const lecturesCol = collection(db, 'lectures');
    const q = query(lecturesCol, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
        return snapshot.docs.map(doc => toSerializable({ ...doc.data(), id: doc.id })) as Lecture[];
    }
    return DUMMY_LECTURES.map(l => ({...l, id: l.id, createdAt: new Date(l.createdAt).toISOString(), transcript: []})) as Lecture[];
  } catch (error) {
    console.error("Error fetching all lectures, using fallback:", error);
    return DUMMY_LECTURES.map(l => ({...l, id: l.id, createdAt: new Date(l.createdAt).toISOString(), transcript: []})) as Lecture[];
  }
}


// --- Topics ---
export const getAllTopics = async (): Promise<Topic[]> => {
  try {
    const db = getDb();
    const topicsCol = collection(db, 'topics');
    const q = query(topicsCol, orderBy('name'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => toSerializable({ ...doc.data(), id: doc.id })) as Topic[];
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
    return toSerializable({ ...docSnap.data(), id: docSnap.id }) as Topic;
  } catch (error) {
    console.error("Error fetching topic by slug:", error);
    return undefined;
  }
};

async function getDocumentsByIds<T>(collectionName: string, ids: string[] | undefined): Promise<T[]> {
    if (!ids || ids.length === 0) return [];
    
    // First try Firestore
    try {
        const db = getDb();
        const docs: T[] = [];
        // Firestore 'in' query limit is 30
        for (let i = 0; i < ids.length; i += 30) {
            const chunk = ids.slice(i, i + 30);
            const colRef = collection(db, collectionName);
            const q = query(colRef, where('__name__', 'in', chunk));
            const snapshot = await getDocs(q);
            if(!snapshot.empty) {
                 snapshot.forEach(docSnap => {
                    const data = docSnap.data();
                    const item = toSerializable({ ...data, id: docSnap.id }) as T;
                    docs.push(item);
                });
            }
        }
        if (docs.length > 0) return docs;
    } catch(e) {
         console.error(`Error fetching docs from ${collectionName}, using fallback`, e);
    }

    // Fallback to dummy data
    let dummyData: any[] = [];
    if (collectionName === 'lectures') {
        dummyData = DUMMY_LECTURES;
    } else if (collectionName === 'series') {
        dummyData = DUMMY_SERIES;
    }
    
    return dummyData.filter(item => ids.includes(item.id)).map(item => ({
        ...item,
        id: item.id,
        createdAt: new Date(item.createdAt).toISOString()
    })) as T[];
}

export const getLecturesByIds = (ids: string[] | undefined) => getDocumentsByIds<Lecture>('lectures', ids);
export const getSeriesByIds = (ids: string[] | undefined) => getDocumentsByIds<Series>('series', ids);

    