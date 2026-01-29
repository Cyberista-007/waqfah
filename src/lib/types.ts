
import type { Timestamp } from 'firebase/firestore';

// When passing data from server to client, Timestamps are serialized to strings.
// This type helps handle that.
type Serializable<T> = {
  [P in keyof T]: T[P] extends Timestamp ? string : T[P];
};

export type Stats = {
  programs: number;
  lectures: number;
  series: number;
  books: number;
  channels: number;
}

export type Program = Serializable<{
  id: string; // Document ID
  slug: string;
  name: string;
  bio: string;
  imageId: string;
  createdAt: Timestamp;
  followerCount: number;
}>

export type Lecture = Serializable<{
  id: string; // Document ID from Firestore
  slug: string;
  title: string;
  programId?: string;
  programName?: string;
  programSlug?: string;
  seriesId?: string; // Document ID of the series
  seriesSlug?: string;
  seriesTitle?: string; 
  channelId?: string;
  channelName?: string;
  channelSlug?: string;
  duration: number; // in seconds
  audioSrc: string;
  imageId: string;
  youtubeUrl?: string;
  pdfUrl?: string;
  telegramUrl?: string;
  soundcloudUrl?: string;
  description: string;
  transcript: TranscriptItem[];
  rating: number;
  ratingCount: number;
  viewCount: number;
  createdAt: Timestamp; // Firestore timestamp
  language?: string;
}>;

export type TranscriptItem = {
  timestamp: number;
  text: string;
};

export type Series = Serializable<{
  id: string; // Document ID from Firestore
  slug: string;
  title:string;
  description: string;
  programId?: string;
  programName?: string;
  programSlug?: string;
  lectureCount: number;
  imageId: string;
  createdAt: Timestamp;
  language?: string;
}>;

export type Book = Serializable<{
  id: string; // Document ID from Firestore
  slug: string;
  title: string;
  sheikhName?: string;
  pdfUrl: string;
  imageId: string;
}>;

export type ScheduleItem = Serializable<{
  id: string;
  title: string;
  date: string; // Consider using a Timestamp for better sorting
  time: string;
  isLive: boolean;
  dateTime: Timestamp;
  duration?: number; // in minutes
}>;

export type QAPair = Serializable<{
  id: string;
  question: string;
  answer: string;
}>;

export type UserProfile = Serializable<{
    id: string;
    email: string;
    name: string;
    photoURL?: string;
    createdAt: Timestamp;
    bio?: string;
    minutesListened?: number;
    lecturesCompleted?: number;
    seriesCompleted?: number;
    role: 'user' | 'admin';
}>;

export type EditProfileForm = {
    name: string;
    bio: string;
    photoURL: string;
}

export type Favorite = Serializable<{
    id: string; // lectureId
    userId: string;
    lectureId: string;
    addedAt: Timestamp;
}>;

export type FollowingProgram = Serializable<{
    id: string; // programId
    programId: string;
    followedAt: Timestamp;
}>;

export type FollowingChannel = Serializable<{
    id: string; // channelId
    channelId: string;
    followedAt: Timestamp;
    notificationsEnabled?: boolean;
}>

export type Rating = Serializable<{
    id: string; // combination of userId_lectureId
    userId: string;
    lectureId: string;
    value: number;
    createdAt: Timestamp;
}>;

export type ListenHistoryItem = Serializable<{
    id: string; // lectureId
    lectureId: string;
    seriesId?: string; // Add seriesId to track progress per series
    position: number;
    duration: number;
    lastListened: Timestamp;
    lecture?: Lecture; // Populated client-side
    lastUpdateTime?: Timestamp;
}>;

export type Playlist = Serializable<{
    id: string;
    name: string;
    description?: string;
    lectureIds: string[];
    isPublic: boolean;
    createdAt: Timestamp;
    userId: string;
}>;

export type Topic = Serializable<{
    id: string;
    name: string;
    slug: string;
    description: string;
    imageId: string;
    lectureIds: string[];
    seriesIds: string[];
}>;

export type Channel = Serializable<{
    id: string;
    name: string;
    slug: string;
    description?: string;
    imageId: string;
    imageUrl?: string;
    youtubeUrl: string;
    followerCount?: number;
}>;

export type Challenge = Serializable<{
    id: string;
    title: string;
    description: string;
    lectureIds: string[];
    seriesId?: string;
    startDate: Timestamp;
    endDate: Timestamp;
    isActive: boolean;
}>;

export type LectureClip = Serializable<{
    id: string;
    lectureId: string;
    userId: string; // Creator
    title: string;
    startTime: number; // in seconds
    endTime: number; // in seconds
    createdAt: Timestamp;
}>;

export type LectureNote = Serializable<{
    id: string; // lectureId
    userId: string;
    lectureId: string;
    content: string;
    updatedAt: Timestamp;
}>;

export type Comment = Serializable<{
    id: string;
    userId: string;
    userName: string;
    userPhotoURL: string;
    text: string;
    createdAt: Timestamp;
}>;
