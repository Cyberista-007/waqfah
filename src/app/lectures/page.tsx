

"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LectureCard } from "@/components/lecture-card";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import type { Lecture, Series } from "@/lib/types";
import { HomePageSkeleton } from "@/components/skeletons";
import { useMemo } from "react";
import { Dices } from "lucide-react";

export default function LecturesListPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const firestore = useFirestore();

  const lecturesQuery = useMemo(() => (firestore ? query(collection(firestore, 'lectures'), orderBy('createdAt', 'desc')) : null), [firestore]);
  const { data: allLectures, isLoading: lecturesLoading } = useCollection<Lecture>(lecturesQuery);
  
  const seriesQuery = useMemo(() => (firestore ? query(collection(firestore, 'series'), orderBy('title')) : null), [firestore]);
  const { data: allSeries, isLoading: seriesLoading } = useCollection<Series>(seriesQuery);

  const seriesFilter = searchParams.get('series');
  const sortOrder = searchParams.get('sort') || 'newest';

  const handleFilterChange = (type: 'series' | 'sort', value: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    if (value === "all") {
      current.delete(type);
    } else {
      current.set(type, value);
    }

    const search = current.toString();
    const query = search ? `?${search}` : "";

    router.push(`${pathname}${query}`);
  };
  
  const filteredLectures = useMemo(() => {
    if (!allLectures) return [];
    
    let lectures = [...allLectures];
    
    if (seriesFilter && seriesFilter !== 'all') {
      lectures = lectures.filter(l => l.seriesId === seriesFilter);
    }
    
    lectures.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt as any);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt as any);

      switch (sortOrder) {
          case 'oldest':
              return dateA.getTime() - dateB.getTime();
          case 'most_popular':
              return (b.viewCount || 0) - (a.viewCount || 0);
          case 'alphabetical':
              return a.title.localeCompare(b.title, 'ar');
          case 'newest':
          default:
              return dateB.getTime() - dateA.getTime();
      }
    });

    return lectures;

  }, [allLectures, seriesFilter, sortOrder]);

  const pickRandomLecture = () => {
    if (!filteredLectures || filteredLectures.length === 0) return;
    const randomIndex = Math.floor(Math.random() * filteredLectures.length);
    const randomLecture = filteredLectures[randomIndex];
    if (randomLecture) {
      router.push(`/lectures/${randomLecture.slug}`);
    }
  }


  if (lecturesLoading || seriesLoading) {
    return <HomePageSkeleton />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold font-headline">كل المحاضرات</h1>
        <Button onClick={pickRandomLecture} variant="outline" size="lg" className="shrink-0">
          <Dices className="me-2" />
          اختر لي محاضرة
        </Button>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <Select onValueChange={(value) => handleFilterChange("series", value)} defaultValue={seriesFilter || "all"}>
          <SelectTrigger className="md:w-1/2">
            <SelectValue placeholder="فلترة حسب السلسلة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل السلاسل</SelectItem>
            {allSeries?.map(s => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select onValueChange={(value) => handleFilterChange("sort", value)} defaultValue={sortOrder}>
          <SelectTrigger className="md:w-1/2">
            <SelectValue placeholder="فرز حسب" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">فرز حسب: الأحدث</SelectItem>
            <SelectItem value="oldest">الأقدم</SelectItem>
            <SelectItem value="most_popular">الأكثر استماعاً</SelectItem>
            <SelectItem value="alphabetical">أبجدي (أ-ي)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredLectures?.map((lecture) => (
          <LectureCard key={lecture.id} lecture={lecture} />
        ))}
      </div>
    </div>
  );
}
