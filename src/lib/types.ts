
import type { Timestamp } from 'firebase/firestore';

// When passing data from server to client, Timestamps are serialized to strings.
// This type helps handle that.
type Serializable<T> = {
  [P in keyof T]: T[P] extends Timestamp ? string : T[P];
};

export type NotificationSettings = {
    newPrograms?: boolean;
    newPlaylists?: boolean;
    newBooks?: boolean;
};

export type AnnouncementSettings = {
    text?: string;
    link?: string;
    isActive?: boolean;
};

export type DonationSettings = {
    monthlyGoal?: number;
    currentAmount?: number;
};

export type AppearanceSettings = {
    defaultTheme: string;
    defaultFont: string;
    maintenanceMode?: boolean;
};

export type Stats = {
  programs: number;
  lectures: number;
  series: number;
  books: number;
}

export type Channel = Serializable<{
  id: string; // Document ID
  slug: string;
  name: string;
  description: string;
  imageId: string;
  imageUrl?: string;
  youtubeUrl?: string;
  followerCount: number;
}>;

export type Program = Serializable<{
  id: string; // Document ID
  slug: string;
  name: string;
  bio: string;
  imageId: string;
  imageUrl?: string;
  youtubeUrl?: string;
  createdAt: Timestamp;
  followerCount: number;
}>;

export type Lecture = Serializable<{
  id: string; // Document ID from Firestore
  slug: string;
  title: string;
  programId?: string;
  programName?: string;
  programSlug?: string;
  channelId?: string;
  channelName?: string;
  channelSlug?: string;
  seriesId?: string; // Document ID of the series
  seriesSlug?: string;
  seriesTitle?: string; 
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
  youtubeViewCount?: number;
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
  programName?: string;
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
    points?: number;
    minutesListened?: number;
    lecturesCompleted?: number;
    seriesCompleted?: number;
    role: 'user' | 'admin';
    notificationSettings?: NotificationSettings;
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

export type Following = Serializable<{
    id: string; // programId
    programId: string;
    followedAt: Timestamp;
    notificationsEnabled?: boolean;
}>;

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

export type Challenge = Serializable<{
    id: string;
    title: string;
    description: string;
    seriesId: string;
    startDate: Timestamp;
    endDate: Timestamp;
    isActive: boolean;
    participantCount: number;
    rewardPoints: number;
    series?: Series;
}>;

export type UserChallenge = Serializable<{
    id: string; // This will be the challengeId
    userId: string;
    challengeId: string;
    progress: number; // Number of lectures completed
    total: number; // Total lectures in the challenge
    status: 'in-progress' | 'completed';
    startedAt: Timestamp;
    completedAt?: Timestamp;
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

export type Donation = Serializable<{
  id: string;
  donorName: string;
  amount?: number;
  isAnonymous: boolean;
  donatedAt: Timestamp;
}>;
