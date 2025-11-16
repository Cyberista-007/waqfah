import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAllLectures, getAllSeries } from "@/lib/data";
import { LectureCard } from "@/components/lecture-card";

// This is now a Server Component
export default async function LecturesListPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | undefined };
}) {
  let allLectures = await getAllLectures();
  const allSeries = await getAllSeries();

  const seriesFilter = searchParams?.series;
  const topicFilter = searchParams?.topic;
  const sortOrder = searchParams?.sort || 'newest';

  const allTopics = [...new Set(allLectures.map(l => l.seriesTitle))];

  let filteredLectures = allLectures;

  if (seriesFilter && seriesFilter !== 'all') {
    filteredLectures = filteredLectures.filter(l => l.seriesSlug === seriesFilter);
  }

  if (topicFilter && topicFilter !== 'all') {
    // This is a simplified topic filter based on series title
    filteredLectures = filteredLectures.filter(l => l.seriesTitle === topicFilter);
  }

  filteredLectures.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);

      switch (sortOrder) {
          case 'newest':
              return dateB.getTime() - dateA.getTime();
          case 'oldest':
              return dateA.getTime() - dateB.getTime();
          case 'most_popular':
              return (b.viewCount || 0) - (a.viewCount || 0);
          case 'alphabetical':
              return a.title.localeCompare(b.title, 'ar');
          default:
              return 0;
      }
  });

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8 font-headline">كل المحاضرات</h1>
      {/* The filtering logic will now work via URL params and server-side rendering */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <form className="contents">
            <Select name="series" defaultValue={seriesFilter || "all"}>
              <SelectTrigger className="md:w-1/3">
                <SelectValue placeholder="فلترة حسب السلسلة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل السلاسل</SelectItem>
                {allSeries.map(s => <SelectItem key={s.slug} value={s.slug}>{s.title}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select name="topic" defaultValue={topicFilter || "all"}>
              <SelectTrigger className="md:w-1/3">
                <SelectValue placeholder="فلترة حسب الموضوع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل المواضيع</SelectItem>
                {allTopics.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select name="sort" defaultValue={sortOrder}>
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
            {/* A submit button can be added if we don't want to rely on JS to submit the form */}
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredLectures.map((lecture) => (
          <LectureCard key={lecture.slug} lecture={lecture} />
        ))}
      </div>
    </div>
  );
}
