'use client';

import { useMemo, useState, useEffect } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import type { Playlist, UserProfile } from '@/lib/types';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { ListMusic, Loader2 } from 'lucide-react';
import { PlaylistCard } from './PlaylistCard';
import { Skeleton } from './ui/skeleton';

type WithId<T> = T & { id: string };

function PublicPlaylistsSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
               <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
        </div>
    )
}

export function PublicPlaylistsSection({ playlists }: { playlists: Playlist[] }) {
    const firestore = useFirestore();
    const [users, setUsers] = useState<Record<string, UserProfile>>({});
    const [isLoading, setIsLoading] = useState(true);

    const userIds = useMemo(() => {
        if (!playlists) return [];
        return [...new Set(playlists.map(p => p.userId).filter(Boolean))];
    }, [playlists]);
    
    useEffect(() => {
        if (!firestore || userIds.length === 0) {
            setIsLoading(false);
            return;
        }

        const fetchUsers = async () => {
            const usersData: Record<string, UserProfile> = {};
            const chunks: string[][] = [];
            for (let i = 0; i < userIds.length; i += 30) {
                chunks.push(userIds.slice(i, i + 30));
            }
            
            try {
                for (const chunk of chunks) {
                    if (chunk.length === 0) continue;
                    const usersQuery = query(collection(firestore, 'users'), where('__name__', 'in', chunk));
                    const usersSnap = await getDocs(usersQuery);
                    usersSnap.forEach(doc => {
                        usersData[doc.id] = doc.data() as UserProfile;
                    });
                }
                setUsers(usersData);
            } catch (error) {
                console.error("Error fetching user profiles for playlists:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, [firestore, userIds]);

    if (!playlists || playlists.length === 0) {
        return null;
    }

    return (
        <section>
            <h2 className="text-3xl font-bold font-headline mb-6 flex items-center gap-2">
                <ListMusic />
                قوائم تشغيل مميزة
            </h2>
            {isLoading ? <PublicPlaylistsSkeleton /> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {playlists.map((playlist, index) => (
                        <PlaylistCard 
                            key={playlist.id}
                            playlist={playlist}
                            userProfile={users[playlist.userId]}
                            index={index}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
