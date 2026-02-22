

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

export type PinnedItem = {
    id: string;
    type: 'lecture' | 'series' | 'program';
    message?: string;
};

export type PinnedItemSettings = {
    pinnedItems?: PinnedItem[];
    isActive?: boolean;
    startDate?: Timestamp;
    endDate?: Timestamp;
    layout?: 'grid' | 'carousel';
};

export type DonationSettings = {
    monthlyGoal?: number;
    currentAmount?: number;
};

export type AppearanceSettings = {
    defaultTheme: string;
    defaultFont: string;
    maintenanceMode?: boolean;
    quranIconUrl?: string;
    hadithIconUrl?: string;
    heroImageUrl?: string;
    heroTitle?: string;
    heroSubtitle?: string;
};

export type Stats = {
  programs: number;
  lectures: number;
  series: number;
  books: number;
}

export type Program = Serializable<{
  id: string; // Document ID
  slug: string;
  name: string;
  bio: string;
  imageId: string;
  imageUrl?: string;
  youtubeUrl?: string;
  channelId?: string;
  rssFeedUrl?: string;
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
  publishedAt?: Timestamp;
  createdAt: Timestamp; // Firestore timestamp
  language?: string;
  suggestionCount?: number;
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
    totalDonated?: number;
    donationTier?: 'bronze' | 'silver' | 'gold';
    notificationSettings?: NotificationSettings;
    stripeCustomerId?: string;
    savedCardBrand?: string;
    savedCardLast4?: string;
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
  userId?: string;
  donorName: string;
  amount?: number;
  isAnonymous: boolean;
  donatedAt: Timestamp;
}>;

export type CustomAccountabilityAction = {
  id: string;
  title: string;
  points: number;
};

export type AccountabilityEntry = Serializable<{
  id: string; // The date in YYYY-MM-DD format
  userId: string;
  date: Timestamp;
  completedActionIds?: string[];
  customActions?: {
    [prayerKey: string]: CustomAccountabilityAction[];
  };
  totalPoints?: number;
}>;

export type DestructiveSin = Serializable<{
  id: string;
  title: string;
  dialogTitle: string;
  quranVerse?: string;
  hadith?: string;
  hadith2?: string;
  icon: string;
}>;

export type Suggestion = Serializable<{
    id: string; // userId
    userId: string;
    createdAt: Timestamp;
}>;
    
export type GamificationBadge = Serializable<{
  id: string;
  title: string;
  description: string;
  icon: string;
  metric: 'minutesListened' | 'lecturesCompleted' | 'seriesCompleted' | 'totalDonated' | 'points' | 'fajrStreak';
  threshold: number;
  points: number;
}>;

export type UserBadge = Serializable<{
  id: string; // The badgeId
  badgeId: string;
  earnedAt: Timestamp;
}>;

export type CurriculumItem = {
    id: string; // The ID of the lecture or series document.
    type: 'lecture' | 'series';
};

export type Curriculum = Serializable<{
    id: string;
    slug: string;
    title: string;
    description: string;
    imageId: string;
    items: CurriculumItem[];
    studentCount: number;
    createdAt: Timestamp;
}>;

export type UserCurriculum = Serializable<{
    id: string; // curriculumId
    userId: string;
    curriculumId: string;
    completedItems: string[];
    status: 'not-started' | 'in-progress' | 'completed';
    startedAt?: Timestamp;
    completedAt?: Timestamp;
}>;
