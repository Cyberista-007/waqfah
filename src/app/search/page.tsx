
import { searchContent } from "@/lib/data";
import { Suspense } from "react";
import { Loader2, SearchIcon, Podcast, Book as BookIcon } from "lucide-react";
import { LectureCard } from "@/components/lecture-card";
import { SeriesCard } from "@/components/series-card";
import { ProgramCard } from "@/components/program-card";
import { BookCard } from "@/components/book-card";

async function SearchResults({ searchTerm }: { searchTerm: string }) {
    const { lectures, series, programs, books, isLive, error } = await searchContent(searchTerm);

    if (!isLive) {
    return (
      <div className="container py-10">
        <div className="rounded-lg border text-card-foreground shadow-sm p-8 bg-destructive/10 border-destructive">
          <h2 className="text-2xl font-bold text-destructive-foreground font-headline mb-4">
            خطأ في الاتصال بقاعدة البيانات
          </h2>
          <p className="text-destructive-foreground/90 mb-4">
            فشل الخادم في الاتصال بـ Firebase. هذا يعني أن وظيفة البحث ستعمل على البيانات التجريبية فقط.
          </p>
          <div className="bg-destructive/20 p-4 rounded-md text-destructive-foreground">
            <h3 className="font-bold mb-2">الخطأ الفني:</h3>
            <pre className="whitespace-pre-wrap font-mono text-sm">
              {error || 'No specific error message available.'}
            </pre>
          </div>
          <p className="mt-4 text-destructive-foreground/90">
            للاتصال بقاعدة البيانات الحقيقية، يرجى التأكد من تعيين متغير البيئة <code className="font-mono bg-destructive/30 px-1 py-0.5 rounded">FIREBASE_SERVICE_ACCOUNT</code> بشكل صحيح.
          </p>
        </div>
      </div>
    )
  }

    const hasResults = lectures.length > 0 || series.length > 0 || programs.length > 0 || books.length > 0;

    if (!hasResults) {
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
             {programs.length > 0 && (
                <section>
                    <h2 className="text-3xl font-bold mb-6 font-headline flex items-center gap-3"><Podcast /> البرامج</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                       {programs.map((p, index) => <ProgramCard key={p.id} program={p} index={index} />)}
                    </div>
                </section>
            )}
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
            {books.length > 0 && (
                <section>
                    <h2 className="text-3xl font-bold mb-6 font-headline flex items-center gap-3"><BookIcon /> الكتب</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
                       {books.map((b, index) => <BookCard key={b.id} book={b} index={index} />)}
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
