'use client';

import { useParams, notFound } from 'next/navigation';
import { useCollection } from '@/firebase';
import { useMemo } from 'react';
import type { Lecture } from '@/lib/types';
import { LectureClientPage } from '@/components/lecture-client-page';
import { CinematicAppLoader } from '@/components/skeletons';
import { useMood } from '@/components/mood-provider';
import { useEffect } from 'react';

const MOOD_COLORS: Record<string, string> = {
    'رقائق': '#f59e0b', // Amber/Gold
    'تزكية': '#10b981', // Emerald
    'فقه': '#3b82f6',   // Blue
    'عقيدة': '#8b5cf6', // Violet
    'سيرة': '#ef4444',  // Red
    'تفسير': '#06b6d4', // Cyan
};

export default function LecturePage() {
  const { setMoodColor } = useMood();
  const params = useParams();
  const slugParam = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const slug = decodeURIComponent(slugParam as string);

  const { data: lectures, isLoading: lectureLoading } = useCollection<Lecture>('lectures', {
    where: ['slug', '==', slug],
    limit: 1
  });
  
  const lecture = lectures?.[0];

  const { data: relatedLectures, isLoading: relatedLoading } = useCollection<Lecture>('lectures', {
    where: ['seriesId', '==', lecture?.seriesId || 'none'],
    limit: 10
  });

  const isLoading = lectureLoading || (!!lecture && relatedLoading);

  useEffect(() => {
    if (lecture) {
        // Try to match programName to a color, or use a default based on slug
        const match = Object.keys(MOOD_COLORS).find(key => 
            lecture.programName?.includes(key) || lecture.title?.includes(key)
        );
        
        if (match) {
            setMoodColor(MOOD_COLORS[match]);
        } else {
            // Pick a deterministic color based on slug
            const hues = [200, 240, 280, 320, 160];
            const charCodeSum = (lecture.slug || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const hue = hues[charCodeSum % hues.length];
            setMoodColor(`hsl(${hue}, 70%, 50%)`);
        }
    }
    
    // Reset mood on unmount
    return () => setMoodColor('hsl(var(--primary))');
  }, [lecture, setMoodColor]);

  if (isLoading) {
    return <CinematicAppLoader />;
  }

  if (!lecture) {
    notFound();
    return null;
  }

  return <LectureClientPage lecture={lecture} relatedLectures={relatedLectures || []} />;
}
