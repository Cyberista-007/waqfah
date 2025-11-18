
import type { Timestamp } from 'firebase/firestore';

export type Lecture = {
  id: string; // Document ID from Firestore
  slug: string;
  title: string;
  seriesId: string; // Document ID of the series
  seriesSlug: string;
  seriesTitle: string; 
  duration: number; // in minutes
  audioSrc: string;
  imageId: string;
  youtubeUrl?: string;
  pdfUrl?: string;
  description: string;
  transcript: TranscriptItem[];
  rating: number;
  ratingCount: number;
  viewCount: number;
  createdAt: Timestamp; // Firestore timestamp
};

export type TranscriptItem = {
  timestamp: number;
  text: string;
};

export type Series = {
  id: string; // Document ID from Firestore
  slug: string;
  title:string;
  description: string;
  lectureCount: number;
  imageId: string;
  createdAt: Timestamp;
};

export type Book = {
  id: string; // Document ID from Firestore
  slug: string;
  title: string;
  pdfUrl: string;
  imageId: string;
};

export type ScheduleItem = {
  id: string;
  title: string;
  date: string; // Consider using a Timestamp for better sorting
  time: string;
  isLive: boolean;
  dateTime?: Timestamp;
};

export type QAPair = {
  id: string;
  question: string;
  answer: string;
};

export type Comment = {
    id: string;
    lectureId: string;
    lectureSlug: string;
    lectureTitle: string;
    userId: string;
    userName: string;
    userImage?: string;
    text: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: Timestamp;
};

export type UserProfile = {
    id: string;
    email: string;
    name: string;
    photoURL?: string;
    createdAt: Timestamp;
    bio?: string;
    minutesListened?: number;
    lecturesCompleted?: number;
    seriesCompleted?: number;
};

export type Favorite = {
    id: string; // lectureId
    userId: string;
    lectureId: string;
    addedAt: Timestamp;
}

export type Rating = {
    id: string; // combination of userId_lectureId
    userId: string;
    lectureId: string;
    value: number;
    createdAt: Timestamp;
}

export type ListenHistoryItem = {
    id: string; // lectureId
    lectureId: string;
    position: number;
    duration: number;
    lastListened: Timestamp;
    lecture?: Lecture; // Populated client-side
}

export type Playlist = {
    id: string;
    name: string;
    description?: string;
    lectureIds: string[];
    isPublic: boolean;
    createdAt: Timestamp;
    userId: string;
}

export type Topic = {
    id: string;
    name: string;
    slug: string;
    description: string;
    imageId: string;
    lectureIds: string[];
    seriesIds: string[];
};

export type Challenge = {
    id: string;
    title: string;
    description: string;
    lectureIds: string[];
    seriesId?: string;
    startDate: Timestamp;
    endDate: Timestamp;
    isActive: boolean;
};

export type LectureClip = {
    id: string;
    lectureId: string;
    userId: string; // Creator
    title: string;
    startTime: number; // in seconds
    endTime: number; // in seconds
    createdAt: Timestamp;
};
    
