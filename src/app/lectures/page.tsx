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
import { CinematicAppLoader } from "@/components/skeletons";
import { useMemo, useState, Suspense } from "react";
import { Search, Sparkles, Clapperboard, Clock, ListVideo, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Fuse from "fuse.js";
import { normalizeArabic, cn } from "@/lib/utils";
import { Pagination } from "@/components/pagination";
import { motion } from "framer-motion";
import LecturePageClient from "./[slug]/LecturePageClient";

const ITEMS_PER_PAGE = 12;

function LecturesListPageClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Handle SPA sub-routing for Electron
  const pathParts = pathname.split("/").filter(Boolean);
  const isIndividualLecture = pathParts.length > 1;

  if (isIndividualLecture) {
    return <LecturePageClient />;
  }

  const { data: allLectures, isLoading: lecturesLoading } = useCollection<Lecture>("lectures", {
    orderBy: ["createdAt", "desc"],
    once: true,
  });
  const { data: allSeries, isLoading: seriesLoading } = useCollection<Series>("series", {
    orderBy: ["title", "asc"],
    once: true,
  });

  const currentPage = Number(searchParams.get("page")) || 1;
  const seriesFilter = searchParams.get("series");
  const sortOrder = searchParams.get("sort") || "newest";

  const [searchTerm, setSearchTerm] = useState("");

  const handleFilterChange = (type: "series" | "sort", value: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set("page", "1");

    if (value === "all") {
      current.delete(type);
    } else {
      current.set(type, value);
    }

    const search = current.toString();
    const query = search ? `?${search}` : "";
    router.push(`${pathname}${query}`);
  };

  const handlePageChange = (page: number) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set("page", page.toString());
    const search = current.toString();
    const query = search ? `?${search}` : "";
    window.scrollTo({ top: 0, behavior: "smooth" });
    router.push(`${pathname}${query}`, { scroll: false });
  };

  const totalHours = useMemo(() => {
    if (!allLectures) return 0;
    const totalSec = allLectures.reduce((acc, l) => acc + (l.duration || 0), 0);
    return Math.max(1, Math.round(totalSec / 3600));
  }, [allLectures]);

  const filteredLectures = useMemo(() => {
    if (!allLectures) return [];

    let lectures = [...allLectures];

    if (seriesFilter && seriesFilter !== "all") {
      lectures = lectures.filter((l) => l.seriesId === seriesFilter);
    }

    if (searchTerm.trim()) {
      const fuseOptions = {
        includeScore: false,
        keys: ["title", "description", "programName", "seriesTitle"],
        threshold: 0.4,
        ignoreLocation: true,
        getFn: (obj: any, path: string | string[]) => {
          const keys = Array.isArray(path) ? path : path.split(".");
          let value = obj;
          for (const key of keys) {
            if (value == null) break;
            value = value[key];
          }
          if (typeof value === "string") return normalizeArabic(value);
          return value;
        },
      };
      const fuse = new Fuse(lectures, fuseOptions);
      lectures = fuse.search(normalizeArabic(searchTerm)).map((result) => result.item);
    }

    lectures.sort((a, b) => {
      const parseDate = (ts: any): Date => {
        if (!ts) return new Date(0);
        if (typeof ts.toDate === "function") return ts.toDate();
        if (typeof ts.seconds === "number") return new Date(ts.seconds * 1000);
        if (typeof ts._seconds === "number") return new Date(ts._seconds * 1000);
        const d = new Date(ts);
        return isNaN(d.getTime()) ? new Date(0) : d;
      };
      const dateA = parseDate(a.publishedAt || a.createdAt);
      const dateB = parseDate(b.publishedAt || b.createdAt);

      switch (sortOrder) {
        case "oldest":
          return dateA.getTime() - dateB.getTime();
        case "most_popular":
          return (b.youtubeViewCount ?? b.viewCount ?? 0) - (a.youtubeViewCount ?? a.viewCount ?? 0);
        case "alphabetical":
          return a.title.localeCompare(b.title, "ar");
        case "newest":
        default:
          return dateB.getTime() - dateA.getTime();
      }
    });

    return lectures;
  }, [allLectures, seriesFilter, sortOrder, searchTerm]);

  const totalPages = Math.ceil(filteredLectures.length / ITEMS_PER_PAGE);
  const lecturesForPage = filteredLectures.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const isLoading = lecturesLoading || seriesLoading;

  if (isLoading) {
    return <CinematicAppLoader />;
  }

  const hasActiveFilters = Boolean(searchTerm.trim() || (seriesFilter && seriesFilter !== "all"));

  return (
    <div className="min-h-screen pb-20" dir="rtl">
      <div className="container mx-auto px-3 sm:px-6 pt-6 md:pt-10 space-y-8">
        {/* ── 1. CLEAN PAGE HEADER ── */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/60">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>مكتبة وقفة الصوتية والمرئية</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-headline text-foreground tracking-tight">
              مكتبة <span className="text-primary">المحاضرات</span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed">
              تصفح جميع الدروس العلمية والمحاضرات الصوتية والمرئية لنخبة من العلماء والدعاة.
            </p>
          </div>

          {/* Live Stats Pills */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-bold">
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card border border-border text-foreground shadow-sm">
              <Clapperboard className="w-4 h-4 text-primary" />
              <span>{allLectures?.length || 0} محاضرة</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card border border-border text-foreground shadow-sm">
              <ListVideo className="w-4 h-4 text-emerald-500" />
              <span>{allSeries?.length || 0} سلسلة</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card border border-border text-foreground shadow-sm">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>{totalHours}+ ساعة علم</span>
            </div>
          </div>
        </header>

        {/* ── 2. SEARCH & FILTER TOOLBAR ── */}
        <section className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-3.5 md:p-4 shadow-sm space-y-3">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 lg:max-w-md">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="ابحث عن محاضرة بالاسم أو المضمون..."
                className="pr-10 pl-9 h-11 bg-background border-border rounded-xl text-sm font-medium text-right"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  aria-label="مسح البحث"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filters & Sort */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Series Select */}
              <div className="relative w-full sm:w-60">
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
                <Select
                  onValueChange={(value) => handleFilterChange("series", value)}
                  value={seriesFilter || "all"}
                >
                  <SelectTrigger className="h-11 pr-9 bg-background border-border rounded-xl text-sm font-semibold">
                    <SelectValue placeholder="فلترة حسب السلسلة" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">كل السلاسل</SelectItem>
                    {allSeries?.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Segmented Control */}
              <div className="flex items-center gap-1 p-1 bg-muted/60 border border-border rounded-xl overflow-x-auto no-scrollbar">
                {[
                  { value: "newest", label: "الأحدث" },
                  { value: "most_popular", label: "الأكثر مشاهدة" },
                  { value: "oldest", label: "الأقدم" },
                ].map((option) => {
                  const isActive = sortOrder === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleFilterChange("sort", option.value)}
                      className={cn(
                        "relative px-3.5 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap flex-1 sm:flex-none text-center",
                        isActive
                          ? "text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeSortTab"
                          className="absolute inset-0 bg-primary rounded-lg shadow-sm"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Active Filters Bar */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs text-muted-foreground">
              <span>
                عرض <strong className="text-foreground">{filteredLectures.length}</strong> محاضرة مطابقة
              </span>
              <button
                onClick={() => {
                  setSearchTerm("");
                  handleFilterChange("series", "all");
                }}
                className="text-primary font-bold hover:underline flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>إعادة ضبط الفلاتر</span>
              </button>
            </div>
          )}
        </section>

        {/* ── 3. LECTURES GRID ── */}
        {lecturesForPage.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {lecturesForPage.map((lecture, index) => (
              <LectureCard key={lecture.id} lecture={lecture} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-card/50 border border-dashed border-border rounded-3xl space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-muted flex items-center justify-center">
              <Search className="h-7 w-7 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-bold text-foreground">لا توجد محاضرات تطابق بحثك</p>
              <p className="text-sm text-muted-foreground">جرّب تغيير كلمات البحث أو إزالة الفلتر المحدد.</p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                handleFilterChange("series", "all");
              }}
              className="rounded-xl font-bold"
            >
              إعادة ضبط الفلاتر
            </Button>
          </div>
        )}

        {/* ── 4. PAGINATION ── */}
        {totalPages > 1 && (
          <div className="flex justify-center pt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function LecturesPage() {
  return (
    <Suspense fallback={<CinematicAppLoader />}>
      <LecturesListPageClient />
    </Suspense>
  );
}
