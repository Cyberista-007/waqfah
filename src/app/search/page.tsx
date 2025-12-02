
import { searchContent } from "@/lib/data";
import { Suspense } from "react";
import { Loader2, SearchIcon } from "lucide-react";
import { LectureCard } from "@/components/lecture-card";
import { SeriesCard } from "@/components/series-card";

async function SearchResults({ searchTerm }: { searchTerm: string }) {
    const { lectures, series } = await searchContent(searchTerm);

    if (!lectures.length && !series.length) {
        return (
            <div className="text-center py-16">
                <p className="text-lg text-muted-foreground">
                    لم يتم العثور على نتائج للبحث عن: <span className="font-bold text-foreground">"{searchTerm}"</span>
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            {series.length > 0 && (
                <section>
                    <h2 className="text-3xl font-bold mb-6 font-headline">السلاسل</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                       {series.map((s, index) => <SeriesCard key={s.id} series={s} index={index} />)}
                    </div>
                </section>
            )}
             {lectures.length > 0 && (
                <section>
                    <h2 className="text-3xl font-bold mb-6 font-headline">المحاضرات</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {lectures.map((lecture, index) => <LectureCard key={lecture.id} lecture={lecture} index={index} />)}
                    </div>
                </section>
            )}
        </div>
    );
}


export default function SearchPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | undefined };
}) {
    const searchTerm = searchParams?.q || "";

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8 font-headline flex items-center gap-3">
        <SearchIcon />
        نتائج البحث عن: <span className="text-primary">"{searchTerm}"</span>
      </h1>
      
      <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="w-16 h-16 animate-spin" /></div>}>
        <SearchResults searchTerm={searchTerm} />
      </Suspense>
    </div>
  );
}
