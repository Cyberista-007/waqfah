"use client"

import { useState, useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAllLectures, getAllSeries } from "@/lib/data";
import { LectureCard } from "@/components/lecture-card";

export default function LecturesListPage() {
  const allLectures = useMemo(() => getAllLectures(), []);
  const allSeries = useMemo(() => getAllSeries(), []);
  
  const [filteredLectures, setFilteredLectures] = useState(allLectures);

  // Note: Topics would likely come from a taxonomy/category system in a real app
  const allTopics = useMemo(() => [...new Set(allLectures.map(l => l.seriesTitle))], [allLectures]);

  const handleFilter = (type: 'series' | 'topic', value: string) => {
    if (value === 'all') {
      setFilteredLectures(allLectures);
      return;
    }
    let lectures = allLectures;
    if (type === 'series') {
        lectures = lectures.filter(l => l.seriesSlug === value);
    }
    if (type === 'topic') {
        // This is a simplified topic filter based on series title
        lectures = lectures.filter(l => l.seriesTitle === value);
    }
    setFilteredLectures(lectures);
  }

  const handleSort = (value: string) => {
    const sorted = [...filteredLectures].sort((a, b) => {
        switch (value) {
            case 'newest':
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            case 'oldest':
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            case 'most_popular':
                return b.viewCount - a.viewCount;
            case 'alphabetical':
                return a.title.localeCompare(b.title, 'ar');
            default:
                return 0;
        }
    });
    setFilteredLectures(sorted);
  }


  return (
    <div>
      <h1 className="text-4xl font-bold mb-8 font-headline">كل المحاضرات</h1>
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <Select onValueChange={(value) => handleFilter('series', value)}>
          <SelectTrigger className="md:w-1/3">
            <SelectValue placeholder="فلترة حسب السلسلة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل السلاسل</SelectItem>
            {allSeries.map(s => <SelectItem key={s.slug} value={s.slug}>{s.title}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select onValueChange={(value) => handleFilter('topic', value)}>
          <SelectTrigger className="md:w-1/3">
            <SelectValue placeholder="فلترة حسب الموضوع" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل المواضيع</SelectItem>
            {allTopics.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select defaultValue="newest" onValueChange={handleSort}>
          <SelectTrigger className="md:w-1/3">
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

      <div className="space-y-4">
        {filteredLectures.map((lecture) => (
          <LectureCard key={lecture.slug} lecture={lecture} />
        ))}
      </div>
    </div>
  );
}
