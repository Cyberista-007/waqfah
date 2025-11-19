
"use client";

import { LectureForm } from "@/components/admin/lecture-form";
import type { Series, Sheikh } from "@/lib/types";
import { useCollection } from "@/firebase";
import { HomePageSkeleton } from "@/components/skeletons";

export default function AdminNewLecturePage() {
  const { data: series, isLoading: seriesLoading } = useCollection<Series>('series', { orderBy: ['title', 'asc'] });
  const { data: sheikhs, isLoading: sheikhsLoading } = useCollection<Sheikh>('sheikhs', { orderBy: ['name', 'asc'] });

  if (seriesLoading || sheikhsLoading) {
      return <HomePageSkeleton />;
  }

  return (
    <LectureForm seriesList={series || []} sheikhsList={sheikhs || []} />
  );
}
