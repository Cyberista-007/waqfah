export type Lecture = {
  slug: string;
  title: string;
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
  createdAt: string;
};

export type TranscriptItem = {
  timestamp: number;
  text: string;
};

export type Series = {
  slug: string;
  title:string;
  description: string;
  lectureCount: number;
  imageId: string;
};

export type Book = {
  slug: string;
  title: string;
  pdfUrl: string;
  imageId: string;
};

export type ScheduleItem = {
  id: string;
  title: string;
  date: string;
  time: string;
  isLive: boolean;
};

export type QAPair = {
  id: string;
  question: string;
  answer: string;
};
