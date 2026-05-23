'use client';

import { useParams, notFound, useSearchParams } from 'next/navigation';
import { useCollection, useFirestore } from '@/firebase';
import { useMemo, useEffect, useState } from 'react';
import type { Lecture, Playlist } from '@/lib/types';
import { LectureClientPage } from '@/components/lecture-client-page';
import { CinematicAppLoader } from '@/components/skeletons';
import { useMood } from '@/components/mood-provider';
import { doc, getDoc, query, collection, where, getDocs, documentId } from 'firebase/firestore';

const MOOD_COLORS: Record<string, string> = {
    'OU,O OU,': '#f59e0b', // Amber/Gold
    'OOUUSOc': '#10b981', // Emerald
    'U?U,U': '#3b82f6',   // Blue
    'O1U,USO_Oc': '#8b5cf6', // Violet
    'O3USOOc': '#ef4444',  // Red
    'OU?O3USO': '#06b6d4', // Cyan
};

export default function LecturePageClient() {
  const { setMoodColor } = useMood();
  const params = useParams();
  const slugParam = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const slug = decodeURIComponent(slugParam as string);
  const searchParams = useSearchParams();
  const playlistId = searchParams.get('playlist');
  const playlistOwnerId = searchParams.get('u');
  const firestore = useFirestore();
  const [playlistLectures, setPlaylistLectures] = useState<Lecture[] | null>(null);
  const [playlistData, setPlaylistData] = useState<Playlist | null>(null);
  const [isPlaylistLoading, setIsPlaylistLoading] = useState(false);

  const { data: lectures, isLoading: lectureLoading } = useCollection<Lecture>('lectures', {
    where: ['slug', '==', slug],
    limit: 1
  });
  
  const lecture = lectures?.[0];

  useEffect(() => {
    async function fetchPlaylistContext() {
        if (!playlistId || !firestore) return;
        setIsPlaylistLoading(true);
        try {
            let userId = playlistOwnerId;
            if (!userId && playlistId.includes('_')) {
                userId = playlistId.split('_')[0];
            }

            if (!userId) {
                console.error("Could not determine playlist owner ID");
                setIsPlaylistLoading(false);
                return;
            }

            const playlistDoc = await getDoc(doc(firestore, 'users', userId, 'playlists', playlistId));
            if (playlistDoc.exists()) {
                const data = playlistDoc.data() as Playlist;
                setPlaylistData(data);
                const lectureIds = data.lectureIds || [];
                
                if (lectureIds.length > 0) {
                    const fetchedLectures: Lecture[] = [];
                    const chunks = [];
                    for (let i = 0; i < lectureIds.length; i += 10) {
                        chunks.push(lectureIds.slice(i, i + 10));
                    }

                    for (const chunk of chunks) {
                        const q = query(collection(firestore, 'lectures'), where(documentId(), 'in', chunk));
                        const snapshot = await getDocs(q);
                        snapshot.forEach(doc => fetchedLectures.push({ id: doc.id, ...doc.data() } as Lecture));
                    }
                    
                    const sorted = lectureIds.map((id: string) => fetchedLectures.find(l => l.id === id)).filter(Boolean) as Lecture[];
                    setPlaylistLectures(sorted);
                }
            }
        } catch (error) {
            console.error("Error fetching playlist context:", error);
        } finally {
            setIsPlaylistLoading(false);
        }
    }
    fetchPlaylistContext();
  }, [playlistId, firestore]);

  const { data: relatedLectures, isLoading: relatedLoading } = useCollection<Lecture>('lectures', {
    where: ['seriesId', '==', (!playlistId && lecture?.seriesId) ? lecture.seriesId : 'none'],
    limit: 10
  });

  const isLoading = lectureLoading || isPlaylistLoading || (!!lecture && !playlistId && relatedLoading);

  useEffect(() => {
    if (lecture) {
        const match = Object.keys(MOOD_COLORS).find(key => 
            lecture.programName?.includes(key) || lecture.title?.includes(key)
        );
        
        if (match) {
            setMoodColor(MOOD_COLORS[match]);
        } else {
            const hues = [200, 240, 280, 320, 160];
            const charCodeSum = (lecture.slug || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const hue = hues[charCodeSum % hues.length];
            setMoodColor(`hsl(${hue}, 70%, 50%)`);
        }
    }
    
    return () => setMoodColor('hsl(var(--primary))');
  }, [lecture, setMoodColor]);

  if (isLoading) {
    return <CinematicAppLoader />;
  }

  if (!lecture) {
    notFound();
    return null;
  }

  return <LectureClientPage lecture={lecture} relatedLectures={playlistLectures || relatedLectures || []} playlist={playlistData || undefined} />;
}
