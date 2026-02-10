"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LectureCard } from "@/components/lecture-card";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCollection } from "@/firebase";
import type { Lecture, Series } from "@/lib/types";
import { HomePageSkeleton } from "@/components/skeletons";
import { useMemo, useState, Suspense } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Fuse from 'fuse.js';
import { normalizeArabic } from "@/lib/utils";

function LecturesListPageClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { data: allLectures, isLoading: lecturesLoading } = useCollection<Lecture>('lectures', { orderBy: ['createdAt', 'desc'] });
  const { data: allSeries, isLoading: seriesLoading } = useCollection<Series>('series', { orderBy: ['title', 'asc'] });

  const seriesFilter = searchParams.get('series');
  const sortOrder = searchParams.get('sort') || 'most_popular';
  
  const [searchTerm, setSearchTerm] = useState("");

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

    if (searchTerm) {
        const fuseOptions = {
          includeScore: false,
          keys: ['title', 'description', 'programName', 'seriesTitle'],
          threshold: 0.4,
          ignoreLocation: true,
          preprocessor: normalizeArabic,
        };
        const fuse = new Fuse(lectures, fuseOptions);
        lectures = fuse.search(searchTerm).map(result => result.item);
    }
    
    lectures.sort((a, b) => {
      const toDate = (ts: any) => ts && typeof ts.toDate === 'function' ? ts.toDate() : new Date(ts);
      const dateA = toDate(a.createdAt);
      const dateB = toDate(b.createdAt);
      
      if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
        return 0;
      }

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

  }, [allLectures, seriesFilter, sortOrder, searchTerm]);

  const isLoading = lecturesLoading || seriesLoading;


  if (isLoading) {
    return <HomePageSkeleton />;
  }

  return (
    <div>
      <h1 className="text-4xl font-bold font-headline mb-8">كل المحاضرات</h1>
      
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input 
            type="search"
            placeholder="ابحث بالاسم عن محاضرة..."
            className="w-full ps-10 h-12 text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>


      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select onValueChange={(value) => handleFilterChange("series", value)} defaultValue={seriesFilter || "all"}>
          <SelectTrigger>
            <SelectValue placeholder="فلترة حسب السلسلة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل السلاسل</SelectItem>
            {allSeries?.map(s => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select onValueChange={(value) => handleFilterChange("sort", value)} defaultValue={sortOrder}>
          <SelectTrigger>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredLectures?.map((lecture, index) => {
          return (
            <LectureCard key={lecture.id} lecture={lecture} index={index} />
          )
        })}
      </div>
       {!isLoading && filteredLectures.length === 0 && (
         <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">لا توجد محاضرات تطابق خيارات الفلترة الحالية.</p>
         </div>
      )}
    </div>
  );
}

export default function LecturesPage() {
    return (
        <Suspense fallback={<HomePageSkeleton />}>
            <LecturesListPageClient />
        </Suspense>
    );
}
