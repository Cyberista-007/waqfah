'use client';

import { useParams, notFound } from 'next/navigation';
import type { Program, Lecture, Series } from '@/lib/types';
import { useCollection } from '@/firebase';
import { ProgramClientPage } from '@/components/program-client-page';
import { CinematicAppLoader } from '@/components/skeletons';

export default function ProgramPageClient() {
  const params = useParams();
  const slugParam = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const slug = decodeURIComponent(slugParam as string);

  const { data: programs, isLoading: programsLoading } = useCollection<Program>('programs', { 
    where: ['slug', '==', slug], 
    limit: 1 
  });
  
  const program = programs?.[0];

  const { data: programLectures, isLoading: lecturesLoading } = useCollection<Lecture>('lectures', { 
    where: ['programId', '==', program?.id || 'none'], 
    limit: 100 
  });
  
  const { data: programSeries, isLoading: seriesLoading } = useCollection<Series>('series', { 
    where: ['programId', '==', program?.id || 'none'], 
    limit: 50 
  });

  const isLoading = programsLoading || (!!program && (lecturesLoading || seriesLoading));

  if (isLoading) {
    return <CinematicAppLoader />;
  }

  if (!program) {
    notFound();
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
       <ProgramClientPage 
          program={program} 
          lectures={programLectures || []} 
          series={programSeries || []} 
        />
    </div>
  );
}
