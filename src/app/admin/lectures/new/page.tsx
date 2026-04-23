
"use client";

import { LectureForm } from "@/components/admin/lecture-form";
import type { Series } from "@/lib/types";
import { useCollection } from "@/firebase";
import { CinematicAppLoader } from "@/components/skeletons";

export default function AdminNewLecturePage() {
  const { data: series, isLoading: seriesLoading } = useCollection<Series>('series', { orderBy: ['title', 'asc'] });

  if (seriesLoading) {
      return <CinematicAppLoader />;
  }

  return (
    <LectureForm seriesList={series || []} />
  );
}
