import type { Timestamp } from 'firebase/firestore';

export type Lecture = {
  id: string; // Document ID from Firestore
  slug: string;
  title: string;
  seriesSlug: string;
  seriesId: string; // Document ID of the series
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
