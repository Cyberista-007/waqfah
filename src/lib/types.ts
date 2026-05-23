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
    lectureIds?: string[]; // Added for backward compatibility
    message?: string;      // Added for backward compatibility
    isActive?: boolean;
    startDate?: Timestamp;
    endDate?: Timestamp;
    layout?: 'grid' | 'carousel';
};

export type DonationSettings = {
    monthlyGoal?: number;
    currentAmount?: number;
};

export type HeroBanner = {
    imageUrl: string;
    title?: string;
    subtitle?: string;
    link?: string;
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
    heroBanners?: HeroBanner[];
};

export type HomepagePathConfig = {
    title: string;
    desc: string;
    parts: string[];
    icon: string;
    color: string;
    border: string;
    linkType?: 'series' | 'playlist' | 'lecture' | 'url' | 'none';
    linkId?: string;  // series slug, playlist id, lecture slug, or full url
};

export type HomepageFeatureConfig = {
    icon: string;
    title: string;
    desc: string;
    color: string;
};

export type HomepageQuoteConfig = {
    quote: string;
    author: string;
};

export type HomepageStatConfig = {
    label: string;
    value: string;
    icon: string;
    color: string;
};

export type HomepageTestimonialConfig = {
    name: string;
    role: string;
    quote: string;
};

export type HomepageFAQConfig = {
    q: string;
    a: string;
};

export type HomepageDetailedConfig = {
    paths?: HomepagePathConfig[];
    features?: HomepageFeatureConfig[];
    stats?: HomepageStatConfig[];
    quote?: HomepageQuoteConfig;
    testimonials?: HomepageTestimonialConfig[];
    faqs?: HomepageFAQConfig[];
    featuredStrips?: HomepageFeaturedStripConfig[];
};

export type HomepageFeaturedStripConfig = {
    title: string;
    subtitle?: string;
    accentColor: string;
    lectureIds: string[];  // IDs of lectures to show
    viewAllHref?: string;
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

export type LectureChapter = {
  title: string;       // e.g. "مقدمة"
  startTime: number;   // seconds from start
};

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
  chapters?: LectureChapter[];  // NEW: named timestamps
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
  isCompleted?: boolean;
}>;

export type Book = Serializable<{
  id: string; // Document ID from Firestore
  slug: string;
  title: string;
  programName?: string;
  pdfUrl: string;
  imageUrl?: string;
  imageId: string;
  isPublic?: boolean; // New field for digital library
  author?: string;
  category?: string;
  description?: string;
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
  createdAt: Timestamp;
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
    donationTier?: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'benefactor';
    notificationSettings?: NotificationSettings;
    stripeCustomerId?: string;
    savedCardBrand?: string;
    savedCardLast4?: string;
    savedCardLast4_?: string; // typo protection
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

export interface Inspiration {
    id: string;
    text: string;
    author: string;
    title?: string;
    type?: 'hadith' | 'quote' | 'wisdom';
    createdAt?: any;
}

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
  concept?: string;
  quranVerses?: string[];
  hadiths?: string[];
  dailyLifeExamples?: string[];
  icon: string;
  linkedVideoId?: string;
  curePlan?: string[];
  testQuestions?: string[];
  relatedSinIds?: string[];
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
    lectureId?: string;
    value?: number;
}>;

// Added for the new floating video player
export type IframeTrack = {
  type: 'youtube' | 'soundcloud';
  src: string;
  title: string;
  lectureId?: string;
  seriesId?: string;
};

export type Shubha = Serializable<{
  id: string; // Document ID
  categoryId: string;
  question: string;
  summary: string;
  answer: string;
  sources?: string[];
  tags?: string[];
  views?: number;
  isVerified?: boolean;
  createdAt: Timestamp;
}>;

export type MuhlikatProgressItem = {
  status: 'focused' | 'completed';
  score?: number;
  checkedSteps?: number[];
  lastTestedAt?: string;
  pointsAwarded?: boolean;
};

export type UserState = Serializable<{
  id: string; // userId
  favorites: string[];
  bookProgress: Record<string, number>;
  essentialsProgress: Record<string, boolean>;
  muhlikatProgress: Record<string, number | MuhlikatProgressItem>;
  quranMemorization?: { [surahNumber: number]: 'not-started' | 'memorizing' | 'completed' | 'reviewed' };
  activeMemoPlan?: {
    planId: string;
    startDate: string;
    dailyReminderTime?: string;
  };
  points: number;
  completedChallenges: number[];
  lastSync: Timestamp;
}>;

export type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: number; // Index of the correct option
  explanation?: string;
};

export type Quiz = Serializable<{
  id: string; // Document ID
  lectureId?: string; // Optional link to a lecture
  title: string;
  questions: QuizQuestion[];
  rewardPoints: number;
  createdAt: Timestamp;
}>;
