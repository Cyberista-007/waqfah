
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function HomePageSkeleton() {
  return (
    <div className="space-y-12">
      <section className="relative -mt-[calc(4rem+1px)] flex h-[60vh] min-h-[500px] flex-col items-center justify-center bg-muted/30 text-center">
        <div className="container relative z-10">
          <Skeleton className="h-16 w-3/4 mx-auto mb-4" />
          <Skeleton className="h-8 w-1/2 mx-auto mb-8" />
          <Skeleton className="h-16 w-full max-w-xl mx-auto rounded-full" />
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 py-8 space-y-16">
        <section>
          <Skeleton className="h-10 w-64 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <Skeleton className="h-10 w-64 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i}>
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export function SeriesPageSkeleton() {
    return (
        <div className="container mx-auto px-4 sm:px-6 py-8 space-y-12">
            <Card className="flex flex-col md:flex-row gap-8 items-center p-8 border-none shadow-none bg-transparent">
                <Skeleton className="w-full md:w-1/4 h-64 rounded-lg" />
                <div className="md:w-3/4 space-y-4">
                    <Skeleton className="h-12 w-3/4" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-2/3" />
                    <Skeleton className="h-8 w-32" />
                </div>
            </Card>
            <section>
                <Skeleton className="h-10 w-64 mb-6" />
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                       <Skeleton key={i} className="h-20 w-full rounded-lg" />
                    ))}
                </div>
            </section>
        </div>
    )
}

export function LecturePageSkeleton() {
    return (
        <div className="container mx-auto px-4 sm:px-6 py-8 space-y-10 animate-pulse">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="space-y-3 w-3/4">
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-12 w-full" />
                </div>
                <Skeleton className="h-12 w-12 rounded-full" />
            </div>

            {/* Player */}
            <Card className="shadow-lg">
                <CardContent className="p-4">
                    <Skeleton className="h-12 w-full" />
                </CardContent>
            </Card>

            {/* Sections */}
            {[...Array(4)].map((_, i) => (
                <section key={i}>
                    <Skeleton className="h-8 w-1/3 mb-4" />
                    <div className="flex flex-wrap gap-3">
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                </section>
            ))}
            
             {/* Comments */}
            <section>
                 <Skeleton className="h-8 w-1/3 mb-4" />
                 <Card><CardContent className="p-6 space-y-4">
                    <Skeleton className="h-24 w-full" />
                     <Skeleton className="h-10 w-32" />
                 </CardContent></Card>
            </section>
        </div>
    );
}
