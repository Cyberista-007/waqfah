
import type { Lecture, Series, Book, ScheduleItem, QAPair, Topic, ListenHistoryItem, UserProfile, Playlist, Stats, Program } from './types';
import { collection, getDocs, getDoc, doc, query, orderBy, limit, where, Timestamp, collectionGroup, setDoc } from 'firebase/firestore';
import { initializeFirebaseOnServer } from '@/firebase/server-init';
import { toSerializable } from './data-helpers';

// --- Dummy Data Fallback ---
// This data is used when a Firebase connection is not available.

const DUMMY_PROGRAMS_RAW = [
    {
        "id": "amged-samir",
        "slug": "amged-samir",
        "name": "أمجد سمير",
        "bio": "باحث متخصص في علوم الحديث والعقيدة، له العديد من السلاسل العلمية المنهجية.",
        "imageId": "sheikh-1",
        "youtubeUrl": "https://www.youtube.com/@AmgedSamir",
        "createdAt": "2023-01-15T10:00:00Z"
    },
    {
        "id": "mohamed-hassan",
        "slug": "mohamed-hassan",
        "name": "محمد حسان",
        "bio": "داعية إسلامي معروف، يتميز بأسلوبه العاطفي والمؤثر في الدعوة إلى الله.",
        "imageId": "sheikh-2",
        "youtubeUrl": "https://www.youtube.com/channel/UCi-tPtgJ9aJFibfJ3-2_wEA",
        "createdAt": "2023-02-20T12:00:00Z"
    },
    {
        "id": "abu-ishaq",
        "slug": "abu-ishaq",
        "name": "أبو إسحاق الحويني",
        "bio": "محدث العصر، علامة في علوم الحديث والجرح والتعديل، وله مؤلفات قيمة.",
        "imageId": "sheikh-3",
        "youtubeUrl": "https://www.youtube.com/channel/UCu3Npy42s5a5Daj5V-sA2tQ",
        "createdAt": "2023-03-10T14:30:00Z"
    }
];

const DUMMY_SERIES_RAW = [
    {
        "id": "sharh-sona",
        "slug": "sharh-sona",
        "title": "شرح السنة للبربهاري",
        "description": "سلسلة علمية متكاملة لشرح كتاب 'شرح السنة' للإمام البربهاري، والذي يعد من أهم متون العقيدة السلفية.",
        "lectureCount": 15,
        "imageId": "series-aqidah",
        "programId": "amged-samir",
        "programName": "أمجد سمير",
        "programSlug": "amged-samir",
        "createdAt": "2023-05-01T10:00:00Z"
    },
    {
        "id": "ahwal-nass",
        "slug": "ahwal-nass",
        "title": "أحوال الناس",
        "description": "سلسلة مؤثرة تتناول أحوال الناس يوم القيامة، من البعث والحشر إلى الحساب والميزان والصراط.",
        "lectureCount": 10,
        "imageId": "series-fiqh",
        "programId": "mohamed-hassan",
        "programName": "محمد حسان",
        "programSlug": "mohamed-hassan",
        "createdAt": "2023-06-15T18:00:00Z"
    },
    {
        "id": "sharh-hadith",
        "slug": "sharh-hadith",
        "title": "شرح الأربعين النووية",
        "description": "شرح ماتع ومفصل للأربعين حديثًا التي جمعها الإمام النووي رحمه الله، والتي تعد من جوامع كلم النبي صلى الله عليه وسلم.",
        "lectureCount": 20,
        "imageId": "series-hadith",
        "programId": "abu-ishaq",
        "programName": "أبو إسحاق الحويني",
        "programSlug": "abu-ishaq",
        "createdAt": "2023-04-22T14:00:00Z"
    }
];

const DUMMY_LECTURES_RAW = [
    {
        "id": "sharh-sona-1",
        "slug": "sharh-sona-1",
        "title": "مقدمة في أهمية لزوم السنة",
        "programId": "amged-samir",
        "programName": "أمجد سمير",
        "programSlug": "amged-samir",
        "seriesId": "sharh-sona",
        "seriesSlug": "sharh-sona",
        "seriesTitle": "شرح السنة للبربهاري",
        "duration": 55,
        "audioSrc": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        "imageId": "lecture-thumbnail-1",
        "description": "محاضرة افتتاحية تشرح أهمية السنة النبوية ووجوب لزومها والتحذير من البدع.",
        "rating": 4.8,
        "ratingCount": 150,
        "viewCount": 5000,
        "createdAt": "2023-05-02T10:00:00Z"
    },
    {
        "id": "sharh-sona-2",
        "slug": "sharh-sona-2",
        "title": "شرح قول المصنف: 'والسنة هي الإسلام'",
        "programId": "amged-samir",
        "programName": "أمجد سمير",
        "programSlug": "amged-samir",
        "seriesId": "sharh-sona",
        "seriesSlug": "sharh-sona",
        "seriesTitle": "شرح السنة للبربهاري",
        "duration": 62,
        "audioSrc": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        "imageId": "lecture-thumbnail-2",
        "description": "شرح تفصيلي لأولى قواعد الإمام البربهاري في كتابه، وتوضيح العلاقة بين السنة والإسلام.",
        "rating": 4.9,
        "ratingCount": 120,
        "viewCount": 4500,
        "createdAt": "2023-05-03T10:00:00Z"
    },
    {
        "id": "ahwal-nass-1",
        "slug": "ahwal-nass-1",
        "title": "يوم ينفخ في الصور",
        "programId": "mohamed-hassan",
        "programName": "محمد حسان",
        "programSlug": "mohamed-hassan",
        "seriesId": "ahwal-nass",
        "seriesSlug": "ahwal-nass",
        "seriesTitle": "أحوال الناس",
        "duration": 70,
        "audioSrc": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        "imageId": "lecture-thumbnail-3",
        "description": "وصف مؤثر لأهوال يوم القيامة وبدايته بالنفخ في الصور، مع ذكر الأدلة من الكتاب والسنة.",
        "rating": 4.7,
        "ratingCount": 250,
        "viewCount": 8000,
        "createdAt": "2023-06-16T18:00:00Z"
    },
    {
        "id": "sharh-hadith-1",
        "slug": "sharh-hadith-1",
        "title": "شرح حديث 'إنما الأعمال بالنيات'",
        "programId": "abu-ishaq",
        "programName": "أبو إسحاق الحويني",
        "programSlug": "abu-ishaq",
        "seriesId": "sharh-hadith",
        "seriesSlug": "sharh-hadith",
        "seriesTitle": "شرح الأربعين النووية",
        "duration": 85,
        "audioSrc": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        "imageId": "lecture-thumbnail-4",
        "description": "شرح مستفيض للحديث الأول من الأربعين النووية، مع بيان أهمية النية في قبول الأعمال وذكر الفوائد الفقهية والتربوية.",
        "rating": 5.0,
        "ratingCount": 300,
        "viewCount": 12000,
        "createdAt": "2023-04-23T14:00:00Z"
    }
];

const DUMMY_PROGRAMS: Program[] = DUMMY_PROGRAMS_RAW.map(p => ({
    ...(p as any),
    createdAt: new Date(p.createdAt).toISOString()
}));

const DUMMY_SERIES: Series[] = DUMMY_SERIES_RAW.map(s => ({
    ...(s as any),
    createdAt: new Date(s.createdAt).toISOString()
}));

const DUMMY_LECTURES: Lecture[] = DUMMY_LECTURES_RAW.map((l, index) => ({
    ...(l as any),
    createdAt: new Date(l.createdAt).toISOString(),
    viewCount: (l as any).viewCount || Math.floor(Math.random() * 10000),
    rating: (l as any).rating || (Math.random() * (5 - 3.5) + 3.5),
    ratingCount: (l as any).ratingCount || Math.floor(Math.random() * 200),
    transcript: [],
}));

const DUMMY_BOOKS: Book[] = [];
const DUMMY_TOPICS: Topic[] = [];
const DUMMY_QA: QAPair[] = [];
const DUMMY_SCHEDULE: ScheduleItem[] = [];
const DUMMY_PLAYLISTS: Playlist[] = [];
// --- End Dummy Data ---


export const getDbSafe = () => {
    try {
        const { serverFirestore } = initializeFirebaseOnServer();
        return { db: serverFirestore, isLive: true, error: null };
    } catch(e: any) {
        return { db: null, isLive: false, error: e.message || 'An unknown error occurred during Firebase server initialization.' };
    }
}

export async function getHomePageData() {
    const { db, isLive, error } = getDbSafe();

    if (!isLive) {
        return { latestSeries: [], latestLectures: [], topPrograms: [], isLive, error };
    }
    
    const [allSeries, allLectures, allPrograms] = await Promise.all([
        getAllSeries(db),
        getAllLectures(db),
        getAllPrograms(db),
    ]);

    const latestSeries = allSeries.slice(0, 3);
    const latestLectures = allLectures.slice(0, 3);
    const topPrograms = allPrograms.slice(0, 4);

    return { latestSeries, latestLectures, topPrograms, isLive, error };
}


export async function getSeriesPageData(slug: string) {
    const { db, isLive } = getDbSafe();

    if (!isLive) {
        return null;
    }

    if (db) {
        try {
            const seriesData = await getSeriesBySlug(slug, db);

            if (!seriesData) {
                return null; // No series found with this slug
            }

            const lecturesCol = collection(db, 'lectures');
            const lecturesQuery = query(lecturesCol, where('seriesId', '==', seriesData.id));
            const lecturesSnapshot = await getDocs(lecturesQuery);
            const lecturesInSeries = lecturesSnapshot.docs.map(d => toSerializable({ ...d.data(), id: d.id }) as Lecture)
                .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            
            let seriesCreator: Program | null = null;
            if (seriesData.programId) {
                const programRef = doc(db, 'programs', seriesData.programId);
                const programSnap = await getDoc(programRef);
                if (programSnap.exists()) {
                    seriesCreator = toSerializable({ ...programSnap.data(), id: programSnap.id }) as Program;
                }
            }

            return { series: seriesData, lecturesInSeries, seriesCreator };

        } catch (error) {
            console.error("Error fetching series page data:", error);
            return null;
        }
    }
    return null;
}


// --- Dashboard Stats ---
export const getDashboardStats = async (): Promise<Stats | null> => {
    const { db, isLive } = getDbSafe();
    if (!isLive) {
        return { programs: 0, lectures: 0, series: 0, books: 0 };
    }
    if (db) {
        try {
            const statsRef = doc(db, 'stats', 'global');
            const statsSnap = await getDoc(statsRef);
            if (statsSnap.exists()) {
                return statsSnap.data() as Stats;
            }
            // If stats doc doesn't exist, create it with initial values from actual data.
            const [programs, lectures, series, books] = await Promise.all([
                getDocs(collection(db, 'programs')),
                getDocs(collection(db, 'lectures')),
                getDocs(collection(db, 'series')),
                getDocs(collection(db, 'books')),
            ]);
            const statsData: Stats = {
                programs: programs.size,
                lectures: lectures.size, 
                series: series.size, 
                books: books.size,
            };
            await setDoc(statsRef, statsData);
            return statsData;
        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
            return { programs: 0, lectures: 0, series: 0, books: 0 };
        }
    }
    return { programs: 0, lectures: 0, series: 0, books: 0 };
}

export const getPopularLectures = async (count: number): Promise<Lecture[]> => {
    const { db, isLive } = getDbSafe();
    if (!isLive) {
        return [];
    }
    if (db) {
        try {
            const lecturesCol = collection(db, 'lectures');
            const snapshot = await getDocs(lecturesCol);
            const lectures = snapshot.docs.map(d => toSerializable({ ...d.data(), id: d.id }) as Lecture);
            return lectures.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, count);
        } catch (error) {
            console.error("Error fetching popular lectures:", error);
        }
    }
    return [];
}


// --- Series ---
export const getAllSeries = async (dbInstance?: any): Promise<Series[]> => {
  const { db, isLive } = dbInstance ? { db: dbInstance, isLive: true } : getDbSafe();
  if (!isLive) {
      return [];
  }
  if (db) {
      try {
        const seriesCol = collection(db, 'series');
        const snapshot = await getDocs(seriesCol);
        const series = snapshot.docs.map(doc => toSerializable({ ...doc.data(), id: doc.id }) as Series);
        return series.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } catch (error) {
        console.error("Error fetching all series:", error);
      }
  }
  return [];
};


// --- Lectures ---
export const getLectureBySlug = async (slug: string): Promise<Lecture | undefined> => {
  const { db, isLive } = getDbSafe();
  if (!isLive) {
    return undefined;
  }
  if (db) {
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
          console.error("Error fetching lecture by slug:", error);
      }
  }
  return undefined;
};

// --- Books, Schedule, Q&A ---

export const getAllBooks = async (dbInstance?: any): Promise<Book[]> => {
    const { db, isLive } = dbInstance ? { db: dbInstance, isLive: true } : getDbSafe();
    if (!isLive) return [];
    if (db) {
        try {
            const booksCol = collection(db, 'books');
            const snapshot = await getDocs(booksCol);
            return snapshot.docs.map(doc => toSerializable({ ...doc.data(), id: doc.id }) as Book);
        } catch(e) {
            console.error("Error fetching books:", e);
        }
    }
    return [];
}

export const getAllScheduleItems = async (): Promise<ScheduleItem[]> => {
    const { db, isLive } = getDbSafe();
    if (!isLive) return [];
    if (db) {
        try {
            const scheduleCol = collection(db, 'scheduled_lessons');
            const snapshot = await getDocs(scheduleCol);
            const items = snapshot.docs.map(docSnap => {
                const data = docSnap.data();
                const date = data.dateTime.toDate();
                return { 
                    ...toSerializable(data),
                    id: docSnap.id,
                    date: date.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
                    time: date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
                };
            });
            return items.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
        } catch (e) {
            console.error("Error fetching schedule items:", e);
        }
    }
    return [];
}

export const getAllQAPairs = async (): Promise<QAPair[]> => {
    const { db, isLive } = getDbSafe();
    if (!isLive) return [];
    if (db) {
        try {
            const qaCol = collection(db, 'question_answers');
            const snapshot = await getDocs(qaCol);
            return snapshot.docs.map(doc => toSerializable({ ...doc.data(), id: doc.id }) as QAPair);
        } catch (e) {
            console.error("Error fetching Q&A pairs:", e);
        }
    }
    return [];
}

export const getRelatedLectures = async (currentLectureId: string, seriesId?: string): Promise<Lecture[]> => {
    if (!seriesId) return [];
    const { db, isLive } = getDbSafe();
    if (!isLive) {
        return [];
    }
    if (db) {
        try {
            const lecturesCol = collection(db, 'lectures');
            const q = query(
                lecturesCol,
                where('seriesId', '==', seriesId),
                where('__name__', '!=', currentLectureId),
                limit(3)
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => toSerializable({ ...doc.data(), id: doc.id }) as Lecture);
        } catch (e) {
            console.error("Error fetching related lectures:", e);
        }
    }
    return [];
}

export async function searchContent(searchTerm: string): Promise<{ isLive: boolean, lectures: Lecture[], series: Series[], programs: Program[], books: Book[], error: string | null }> {
    const { db, isLive, error } = getDbSafe();

    if (!searchTerm) {
        return { isLive, lectures: [], series: [], programs: [], books: [], error: null };
    }
    
    // The individual getAll functions will handle the isLive fallback.
    const [allLectures, allSeries, allPrograms, allBooks] = await Promise.all([
      getAllLectures(db),
      getAllSeries(db),
      getAllPrograms(db),
      getAllBooks(db),
    ]);

    const searchTermLower = searchTerm.toLowerCase();

    const lectures = allLectures.filter(l => 
        (l.title || '').toLowerCase().includes(searchTermLower) || 
        (l.description || '').toLowerCase().includes(searchTermLower) ||
        (l.programName || '').toLowerCase().includes(searchTermLower) ||
        (l.seriesTitle || '').toLowerCase().includes(searchTermLower)
    );
    const series = allSeries.filter(s => 
        (s.title || '').toLowerCase().includes(searchTermLower) ||
        (s.description || '').toLowerCase().includes(searchTermLower) ||
        (s.programName || '').toLowerCase().includes(searchTermLower)
    );

    const programs = allPrograms.filter(p => 
        (p.name || '').toLowerCase().includes(searchTermLower) ||
        (p.bio || '').toLowerCase().includes(searchTermLower)
    );

    const books = allBooks.filter(b => 
        (b.title || '').toLowerCase().includes(searchTermLower)
    );

    return { isLive, lectures, series, programs, books, error };
}

const getAllLectures = async (dbInstance?: any): Promise<Lecture[]> => {
  const { db, isLive } = dbInstance ? { db: dbInstance, isLive: true } : getDbSafe();
  if(!isLive) {
    return [];
  }
  if(db) {
      try {
        const lecturesCol = collection(db, 'lectures');
        const snapshot = await getDocs(lecturesCol);
        const lectures = snapshot.docs.map(doc => toSerializable({ ...doc.data(), id: doc.id }) as Lecture);
        return lectures.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } catch (error) {
        console.error("Error fetching all lectures:", error);
      }
  }
  return [];
}


// --- Topics ---
export const getAllTopics = async (): Promise<Topic[]> => {
  const { db, isLive } = getDbSafe();
  if (!isLive) return [];
  if (db) {
      try {
        const topicsCol = collection(db, 'topics');
        const snapshot = await getDocs(topicsCol);
        const topics = snapshot.docs.map(doc => toSerializable({ ...doc.data(), id: doc.id }) as Topic);
        return topics.sort((a,b) => a.name.localeCompare(b.name));
      } catch (error) {
        console.error("Error fetching all topics:", error);
      }
  }
  return [];
};

export const getTopicBySlug = async (slug: string): Promise<Topic | undefined> => {
  const { db, isLive } = getDbSafe();
  if (!isLive) return undefined;
  if (db) {
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

export const getSeriesBySlug = async (slug: string, dbInstance?: any): Promise<Series | undefined> => {
  const { db, isLive } = dbInstance ? { db: dbInstance, isLive: true } : getDbSafe();
  if (!isLive) return undefined;
  if (db) {
      try {
        const seriesCol = collection(db, 'series');
        const q = query(seriesCol, where("slug", "==", slug), limit(1));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            const docSnap = snapshot.docs[0];
            return toSerializable({ ...docSnap.data(), id: docSnap.id }) as Series;
        }
      } catch (error) {
        console.error("Error fetching series by slug:", error);
      }
  }
  return undefined;
}


async function getDocumentsByIds<T extends {id: string}>(collectionName: string, ids: string[] | undefined, dummyData: T[]): Promise<T[]> {
    if (!ids || ids.length === 0) return [];
    
    const { db, isLive } = getDbSafe();
    if (!isLive) {
        return [];
    }
    if (db) {
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
    return [];
}

export const getLecturesByIds = (ids: string[] | undefined) => getDocumentsByIds<Lecture>('lectures', ids, DUMMY_LECTURES);
export const getSeriesByIds = (ids: string[] | undefined) => getDocumentsByIds<Series>('series', ids, DUMMY_SERIES);


// --- Playlists ---
export const getAllPublicPlaylists = async (): Promise<(Playlist & { userProfile?: UserProfile })[]> => {
    const { db, isLive } = getDbSafe();
    if (!isLive || !db) {
        return [];
    }

    try {
        const playlistsQuery = query(
            collectionGroup(db, 'playlists'),
            where('isPublic', '==', true),
            limit(30)
        );
        const playlistsSnapshot = await getDocs(playlistsQuery);
        
        if (playlistsSnapshot.empty) {
            return [];
        }

        const playlists = playlistsSnapshot.docs.map(doc => toSerializable({ ...doc.data(), id: doc.id }) as Playlist)
            .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        // Fetch user profiles for each playlist
        const userIds = [...new Set(playlists.map(p => p.userId))];
        const userProfiles: Record<string, UserProfile> = {};
        
        // Batch fetch users
        for (let i = 0; i < userIds.length; i += 30) {
            const chunk = userIds.slice(i, i + 30);
            const usersQuery = query(collection(db, 'users'), where('__name__', 'in', chunk));
            const usersSnapshot = await getDocs(usersQuery);
            usersSnapshot.forEach(doc => {
                userProfiles[doc.id] = toSerializable({ ...doc.data(), id: doc.id }) as UserProfile;
            });
        }
        
        // Attach user profiles to playlists
        return playlists.map(playlist => ({
            ...playlist,
            userProfile: userProfiles[playlist.userId],
        }));

    } catch (error) {
        console.error("Error fetching public playlists:", error);
        return [];
    }
};

export const getAllPrograms = async (dbInstance?: any): Promise<Program[]> => {
  const { db, isLive } = dbInstance ? { db: dbInstance, isLive: true } : getDbSafe();
  if (!isLive) {
    return [];
  }
  if (db) {
      try {
        const programsCol = collection(db, 'programs');
        const snapshot = await getDocs(programsCol);
        const programs = snapshot.docs.map(doc => toSerializable({ ...doc.data(), id: doc.id }) as Program);
        return programs.sort((a,b) => (b.followerCount || 0) - (a.followerCount || 0));
      } catch (error) {
        console.error("Error fetching all programs:", error);
      }
  }
  return [];
};

export const getProgramBySlug = async (slug: string, dbInstance?: any): Promise<Program | undefined> => {
  const { db, isLive } = dbInstance ? { db: dbInstance, isLive: true } : getDbSafe();
  if (!isLive) return undefined;
  if (db) {
      try {
        const programsCol = collection(db, 'programs');
        const q = query(programsCol, where("slug", "==", slug), limit(1));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            const docSnap = snapshot.docs[0];
            return toSerializable({ ...docSnap.data(), id: docSnap.id }) as Program;
        }
      } catch (error) {
        console.error("Error fetching program by slug:", error);
      }
  }
  return undefined;
}

export async function getLecturesByProgram(programId: string): Promise<Lecture[]> {
    const { db, isLive } = getDbSafe();
    if (!isLive) {
        return [];
    }
    if (db) {
        try {
            const lecturesCol = collection(db, 'lectures');
            const q = query(lecturesCol, where('programId', '==', programId));
            const snapshot = await getDocs(q);
            const lectures = snapshot.docs.map(doc => toSerializable({ ...doc.data(), id: doc.id }) as Lecture);
            return lectures.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } catch (error) {
            console.error("Error fetching lectures by program:", error);
        }
    }
    return [];
}

export async function getSeriesByProgram(programId: string): Promise<Series[]> {
    const { db, isLive } = getDbSafe();
    if (!isLive) {
        return [];
    }
    if (db) {
        try {
            const seriesCol = collection(db, 'series');
            const q = query(seriesCol, where('programId', '==', programId));
            const snapshot = await getDocs(q);
            const series = snapshot.docs.map(doc => toSerializable({ ...doc.data(), id: doc.id }) as Series);
            return series.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } catch (error) {
            console.error("Error fetching series by program:", error);
        }
    }
    return [];
}

    