
import type { Lecture, Series, Book, ScheduleItem, QAPair, Sheikh, Topic, ListenHistoryItem, UserProfile } from './types';
import { collection, getDocs, getDoc, doc, query, orderBy, limit, where, Timestamp } from 'firebase/firestore';
import { initializeFirebaseOnServer } from '@/firebase/server-init';
import { toSerializable } from './data-helpers';

// Dummy data imports
import DUMMY_SHEIKHS from '@/../docs/dummy-data/sheikhs.json';
import DUMMY_SERIES from '@/../docs/dummy-data/series.json';
import DUMMY_LECTURES from '@/../docs/dummy-data/lectures.json';

// This file now interacts with Firestore instead of mock data.
export const getDbSafe = () => {
    try {
        // This can throw if credentials are not available.
        const { serverFirestore } = initializeFirebaseOnServer();
        return { db: serverFirestore, isLive: true };
    } catch(e) {
        // console.warn("Could not connect to live DB, falling back to dummy data.", e);
        return { db: null, isLive: false };
    }
}


// --- Sheikhs ---
export const getAllSheikhs = async (): Promise<Sheikh[]> => {
  const { db, isLive } = getDbSafe();
  if (isLive && db) {
      try {
        const sheikhsCol = collection(db, 'sheikhs');
        const q = query(sheikhsCol, orderBy('name'));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            return snapshot.docs.map(doc => toSerializable({ ...doc.data(), id: doc.id }) as Sheikh);
        }
      } catch (error) {
          console.error("Error fetching all sheikhs, using fallback:", error);
      }
  }
  // Fallback to dummy data
  return DUMMY_SHEIKHS.map(s => toSerializable({...s, id: s.id, createdAt: new Date(s.createdAt)})) as Sheikh[];
}

export const getSheikhBySlug = async (slug: string): Promise<Sheikh | undefined> => {
  const { db, isLive } = getDbSafe();
  if (isLive && db) {
      try {
        const sheikhsCol = collection(db, 'sheikhs');
        const q = query(sheikhsCol, where("slug", "==", slug), limit(1));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            const docSnap = snapshot.docs[0];
            return toSerializable({ ...docSnap.data(), id: docSnap.id }) as Sheikh;
        }
      } catch (error) {
        console.error("Error fetching sheikh by slug, using fallback:", error);
      }
  }
  const dummySheikh = DUMMY_SHEIKHS.find(s => s.slug === slug);
  if (dummySheikh) return toSerializable({...dummySheikh, id: dummySheikh.id, createdAt: new Date(dummySheikh.createdAt)}) as Sheikh;
  return undefined;
}


// --- Series ---
export const getAllSeries = async (): Promise<Series[]> => {
  const { db, isLive } = getDbSafe();
  if (isLive && db) {
      try {
        const seriesCol = collection(db, 'series');
        const q = query(seriesCol, orderBy('title'));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            return snapshot.docs.map(doc => toSerializable({ ...doc.data(), id: doc.id }) as Series);
        }
      } catch (error) {
        console.error("Error fetching all series, using fallback:", error);
      }
  }
  return DUMMY_SERIES.map(s => toSerializable({...s, id: s.id, createdAt: new Date(s.createdAt)})) as Series[];
};


// --- Lectures ---
export const getLectureBySlug = async (slug: string): Promise<Lecture | undefined> => {
  const { db, isLive } = getDbSafe();
  if (isLive && db) {
      try {
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
      } catch (error) {
          console.error("Error fetching lecture by slug, using fallback:", error);
      }
  }
  const dummyLecture = DUMMY_LECTURES.find(l => l.slug === slug);
  if (dummyLecture) return toSerializable({...dummyLecture, id: dummyLecture.id, createdAt: new Date(dummyLecture.createdAt), transcript: []}) as Lecture;
  return undefined;
};

export const getLecturesBySheikh = async (sheikhId: string): Promise<Lecture[]> => {
  const { db, isLive } = getDbSafe();
  if (isLive && db) {
      try {
        const lecturesCol = collection(db, 'lectures');
        const q = query(lecturesCol, where('sheikhId', '==', sheikhId), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            return snapshot.docs.map(doc => toSerializable({ ...doc.data(), id: doc.id }) as Lecture);
        }
        return []; // Return empty if sheikh exists but has no lectures in DB
      } catch (error) {
        console.error("Error fetching lectures by sheikh, using fallback:", error);
      }
  }
  return DUMMY_LECTURES.filter(l => l.sheikhId === sheikhId).map(l => toSerializable({...l, id: l.id, createdAt: new Date(l.createdAt), transcript: []})) as Lecture[];
}

export const getSeriesBySheikh = async (sheikhId: string): Promise<Series[]> => {
  const { db, isLive } = getDbSafe();
  if (isLive && db) {
      try {
        const seriesCol = collection(db, 'series');
        const q = query(seriesCol, where('sheikhId', '==', sheikhId), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            return snapshot.docs.map(doc => toSerializable({ ...doc.data(), id: doc.id }) as Series);
        }
        return []; // Return empty if sheikh exists but has no series in DB
      } catch (error) {
        console.error("Error fetching series by sheikh, using fallback:", error);
      }
  }
  return DUMMY_SERIES.filter(s => s.sheikhId === sheikhId).map(s => toSerializable({...s, id: s.id, createdAt: new Date(s.createdAt)})) as Series[];
}

// --- Books, Schedule, Q&A ---

export const getAllBooks = async (): Promise<Book[]> => {
    const { db, isLive } = getDbSafe();
    if (isLive && db) {
        try {
            const booksCol = collection(db, 'books');
            const q = query(booksCol, orderBy('title', 'asc'));
            const snapshot = await getDocs(q);
            if(!snapshot.empty) {
              return snapshot.docs.map(doc => toSerializable({ ...doc.data(), id: doc.id }) as Book);
            }
        } catch(e) {
            console.error("Error fetching books:", e);
        }
    }
    return []; // No dummy data for books yet
}

export const getAllScheduleItems = async (): Promise<ScheduleItem[]> => {
    const { db, isLive } = getDbSafe();
    if (isLive && db) {
        try {
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
                }) as ScheduleItem[];
            }
        } catch (e) {
            console.error("Error fetching schedule items:", e);
        }
    }
    return []; // No dummy data for schedule yet
}

export const getAllQAPairs = async (): Promise<QAPair[]> => {
    const { db, isLive } = getDbSafe();
    if (isLive && db) {
        try {
            const qaCol = collection(db, 'question_answers');
            const snapshot = await getDocs(qaCol);
            if (!snapshot.empty) {
                return snapshot.docs.map(doc => toSerializable({ ...doc.data(), id: doc.id }) as QAPair);
            }
        } catch (e) {
            console.error("Error fetching Q&A pairs:", e);
        }
    }
    return []; // No dummy data for Q&A yet
}

export const getRelatedLectures = async (currentLectureId: string, seriesId: string): Promise<Lecture[]> => {
    if (!seriesId) return [];
    const { db, isLive } = getDbSafe();
    if (isLive && db) {
        try {
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
                return snapshot.docs.map(doc => toSerializable({ ...doc.data(), id: doc.id }) as Lecture);
            }
        } catch (e) {
            console.error("Error fetching related lectures, using fallback:", e);
        }
    }
    return DUMMY_LECTURES.filter(l => l.seriesId === seriesId && l.id !== currentLectureId).slice(0, 3).map(l => toSerializable({...l, id: l.id, createdAt: new Date(l.createdAt), transcript: []})) as Lecture[];
}

export async function searchContent(searchTerm: string): Promise<{ lectures: Lecture[], series: Series[], sheikhs: Sheikh[] }> {
    if (!searchTerm) {
        return { lectures: [], series: [], sheikhs: [] };
    }
    
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
  const { db, isLive } = getDbSafe();
  if(isLive && db) {
      try {
        const lecturesCol = collection(db, 'lectures');
        const q = query(lecturesCol, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            return snapshot.docs.map(doc => toSerializable({ ...doc.data(), id: doc.id }) as Lecture);
        }
      } catch (error) {
        console.error("Error fetching all lectures, using fallback:", error);
      }
  }
  return DUMMY_LECTURES.map(l => toSerializable({...l, id: l.id, createdAt: new Date(l.createdAt), transcript: []})) as Lecture[];
}


// --- Topics ---
export const getAllTopics = async (): Promise<Topic[]> => {
  const { db, isLive } = getDbSafe();
  if (isLive && db) {
      try {
        const topicsCol = collection(db, 'topics');
        const q = query(topicsCol, orderBy('name'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => toSerializable({ ...doc.data(), id: doc.id }) as Topic);
      } catch (error) {
        console.error("Error fetching all topics:", error);
      }
  }
  return [];
};

export const getTopicBySlug = async (slug: string): Promise<Topic | undefined> => {
  const { db, isLive } = getDbSafe();
  if (isLive && db) {
      try {
        const topicsCol = collection(db, 'topics');
        const q = query(topicsCol, where("slug", "==", slug), limit(1));
        const snapshot = await getDocs(q);
        if (snapshot.empty) return undefined;
        const docSnap = snapshot.docs[0];
        return toSerializable({ ...docSnap.data(), id: docSnap.id }) as Topic;
      } catch (error) {
        console.error("Error fetching topic by slug:", error);
      }
  }
  return undefined;
};

async function getDocumentsByIds<T>(collectionName: string, ids: string[] | undefined): Promise<T[]> {
    if (!ids || ids.length === 0) return [];
    
    const { db, isLive } = getDbSafe();
    if (isLive && db) {
        try {
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
    }

    // Fallback to dummy data
    let dummyData: any[] = [];
    if (collectionName === 'lectures') {
        dummyData = DUMMY_LECTURES;
    } else if (collectionName === 'series') {
        dummyData = DUMMY_SERIES;
    }
    
    return dummyData.filter(item => ids.includes(item.id)).map(item => toSerializable({
        ...item,
        id: item.id,
        createdAt: new Date(item.createdAt)
    })) as T[];
}

export const getLecturesByIds = (ids: string[] | undefined) => getDocumentsByIds<Lecture>('lectures', ids);
export const getSeriesByIds = (ids: string[] | undefined) => getDocumentsByIds<Series>('series', ids);
