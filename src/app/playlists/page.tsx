import { getPublicPlaylists } from '@/lib/data';
import { PlaylistsClient } from './playlists-client';
import { Playlist } from '@/lib/types';

export const revalidate = 3600;

export default async function PlaylistsPage() {
    const publicPlaylists = await getPublicPlaylists() as Playlist[];
    return <PlaylistsClient initialPublicPlaylists={publicPlaylists} />;
}
