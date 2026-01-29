
import type { Lecture, Series, Book, ScheduleItem, QAPair, Topic, ListenHistoryItem, UserProfile, Playlist, Stats, Channel, Program } from './types';
import { collection, getDocs, getDoc, doc, query, orderBy, limit, where, Timestamp, collectionGroup, setDoc } from 'firebase/firestore';
import { initializeFirebaseOnServer } from '@/firebase/server-init';
import { toSerializable } from './data-helpers';

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

export async function getSeriesPageData(slug: string) {
    const { db, isLive } = getDbSafe();

    if (isLive && db) {
        try {
            const seriesData = await getSeriesBySlug(slug);

            if (!seriesData) {
                return null; // No series found with this slug
            }

            const lecturesCol = collection(db, 'lectures');
            const lecturesQuery = query(lecturesCol, where('seriesId', '==', seriesData.id), orderBy('createdAt', 'asc'));
            const lecturesSnapshot = await getDocs(lecturesQuery);
            const lecturesInSeries = lecturesSnapshot.docs.map(d => toSerializable({ ...d.data(), id: d.id }) as Lecture);
            
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
    if (isLive && db) {
        try {
            const statsRef = doc(db, 'stats', 'global');
            const statsSnap = await getDoc(statsRef);
            if (statsSnap.exists()) {
                return statsSnap.data() as Stats;
            }
            // If stats doc doesn't exist, create it with initial values from actual data.
            const [programs, lectures, series, books, channels] = await Promise.all([
                getDocs(collection(db, 'programs')),
                getDocs(collection(db, 'lectures')),
                getDocs(collection(db, 'series')),
                getDocs(collection(db, 'books')),
                getDocs(collection(db, 'channels')),
            ]);
            const statsData: Stats = {
                programs: programs.size,
                lectures: lectures.size, 
                series: series.size, 
                books: books.size,
                channels: channels.size,
            };
            await setDoc(statsRef, statsData);
            return statsData;
        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
            // In case of error, return a default object to avoid crashing the page.
            return { programs: 0, lectures: 0, series: 0, books: 0, channels: 0 };
        }
    }
    // Fallback for non-live/error environment
    return { programs: 0, lectures: 0, series: 0, books: 0, channels: 0 };
}

export const getPopularLectures = async (count: number): Promise<Lecture[]> => {
    const { db, isLive } = getDbSafe();
    if (isLive && db) {
        try {
            const lecturesCol = collection(db, 'lectures');
            const q = query(lecturesCol, orderBy('viewCount', 'desc'), limit(count));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                return snapshot.docs.map(d => toSerializable({
                    ...d.data(),
                    id: d.id,
                    createdAt: d.data().createdAt || Timestamp.now()
                }) as Lecture);
            }
        } catch (error) {
            console.error("Error fetching popular lectures:", error);
        }
    }
    return [];
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
        console.error("Error fetching all series:", error);
      }
  }
  return [];
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
          console.error("Error fetching lecture by slug:", error);
      }
  }
  return undefined;
};

export const getLecturesByChannel = async (channelId: string): Promise<Lecture[]> => {
  const { db, isLive } = getDbSafe();
  if (isLive && db) {
      try {
        const lecturesCol = collection(db, 'lectures');
        const q = query(lecturesCol, where('channelId', '==', channelId), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            return snapshot.docs.map(doc => toSerializable({ ...doc.data(), id: doc.id }) as Lecture);
        }
        return [];
      } catch (error) {
        console.error("Error fetching lectures by channel:", error);
      }
  }
  return [];
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

export const getRelatedLectures = async (currentLectureId: string, seriesId?: string): Promise<Lecture[]> => {
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
            console.error("Error fetching related lectures:", e);
        }
    }
    return [];
}

export async function searchContent(searchTerm: string): Promise<{ lectures: Lecture[], series: Series[], programs: Program[], channels: Channel[], books: Book[] }> {
    if (!searchTerm) {
        return { lectures: [], series: [], programs: [], channels: [], books: [] };
    }
    
    const searchTermLower = searchTerm.toLowerCase();

    try {
        const [allLectures, allSeries, allPrograms, allChannels, allBooks] = await Promise.all([
          getAllLectures(),
          getAllSeries(),
          getAllPrograms(),
          getAllChannels(),
          getAllBooks(),
        ]);

        const lectures = allLectures.filter(l => 
            l.title.toLowerCase().includes(searchTermLower) || 
            (l.description && l.description.toLowerCase().includes(searchTermLower)) ||
            (l.programName && l.programName.toLowerCase().includes(searchTermLower)) ||
            (l.seriesTitle && l.seriesTitle.toLowerCase().includes(searchTermLower)) ||
            (l.channelName && l.channelName.toLowerCase().includes(searchTermLower))
        );
        const series = allSeries.filter(s => 
            s.title.toLowerCase().includes(searchTermLower) ||
            (s.description && s.description.toLowerCase().includes(searchTermLower)) ||
            (s.programName && s.programName.toLowerCase().includes(searchTermLower))
        );

        const programs = allPrograms.filter(p => 
            p.name.toLowerCase().includes(searchTermLower) ||
            (p.bio && p.bio.toLowerCase().includes(searchTermLower))
        );

        const channels = allChannels.filter(c => 
            c.name.toLowerCase().includes(searchTermLower) ||
            (c.description && c.description.toLowerCase().includes(searchTermLower))
        );

        const books = allBooks.filter(b => 
            b.title.toLowerCase().includes(searchTermLower)
        );

        return { lectures, series, programs, channels, books };
    } catch (error) {
        console.error("Error searching content:", error);
        return { lectures: [], series: [], programs: [], channels: [], books: [] };
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
        console.error("Error fetching all lectures:", error);
      }
  }
  return [];
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

// --- Channels ---
export const getAllChannels = async (): Promise<Channel[]> => {
  const { db, isLive } = getDbSafe();
  if (isLive && db) {
      try {
        const channelsCol = collection(db, 'channels');
        const q = query(channelsCol, orderBy('name', 'asc'));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            return snapshot.docs.map(doc => toSerializable({ ...doc.data(), id: doc.id }) as Channel);
        }
      } catch (error) {
        console.error("Error fetching all channels:", error);
      }
  }
  return [];
};

export const getChannelBySlug = async (slug: string): Promise<Channel | undefined> => {
  const { db, isLive } = getDbSafe();
  if (isLive && db) {
      try {
        const channelsCol = collection(db, 'channels');
        const q = query(channelsCol, where("slug", "==", slug), limit(1));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            const docSnap = snapshot.docs[0];
            return toSerializable({ ...docSnap.data(), id: docSnap.id }) as Channel;
        }
      } catch (error) {
        console.error("Error fetching channel by slug:", error);
      }
  }
  return undefined;
}

export const getSeriesBySlug = async (slug: string): Promise<Series | undefined> => {
  const { db, isLive } = getDbSafe();
  if (isLive && db) {
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
    return [];
}

export const getLecturesByIds = (ids: string[] | undefined) => getDocumentsByIds<Lecture>('lectures', ids);
export const getSeriesByIds = (ids: string[] | undefined) => getDocumentsByIds<Series>('series', ids);


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
            orderBy('createdAt', 'desc'),
            limit(30)
        );
        const playlistsSnapshot = await getDocs(playlistsQuery);
        
        if (playlistsSnapshot.empty) {
            return [];
        }

        const playlists = playlistsSnapshot.docs.map(doc => toSerializable({ ...doc.data(), id: doc.id }) as Playlist);

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

export const getAllPrograms = async (): Promise<Program[]> => {
  const { db, isLive } = getDbSafe();
  if (isLive && db) {
      try {
        const programsCol = collection(db, 'programs');
        const q = query(programsCol, orderBy('name', 'asc'));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            return snapshot.docs.map(doc => toSerializable({ ...doc.data(), id: doc.id }) as Program);
        }
      } catch (error) {
        console.error("Error fetching all programs:", error);
      }
  }
  return [];
};

export const getProgramBySlug = async (slug: string): Promise<Program | undefined> => {
  const { db, isLive } = getDbSafe();
  if (isLive && db) {
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
    if (isLive && db) {
        try {
            const lecturesCol = collection(db, 'lectures');
            const q = query(lecturesCol, where('programId', '==', programId), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => toSerializable({ ...doc.data(), id: doc.id }) as Lecture);
        } catch (error) {
            console.error("Error fetching lectures by program:", error);
        }
    }
    return [];
}

export async function getSeriesByProgram(programId: string): Promise<Series[]> {
    const { db, isLive } = getDbSafe();
    if (isLive && db) {
        try {
            const seriesCol = collection(db, 'series');
            const q = query(seriesCol, where('programId', '==', programId), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => toSerializable({ ...doc.data(), id: doc.id }) as Series);
        } catch (error) {
            console.error("Error fetching series by program:", error);
        }
    }
    return [];
}
