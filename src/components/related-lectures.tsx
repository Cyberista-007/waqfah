import { recommendLectures } from "@/ai/flows/recommend-lectures"
import { getLectureBySlug, getLecturesBySeries } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import Link from "next/link";
import Image from "next/image";
import { getPlaceholderImage } from "@/lib/images";
import { notFound } from "next/navigation";

export default async function RelatedLectures({ currentLectureSlug }: { currentLectureSlug: string }) {
    const currentLecture = getLectureBySlug(currentLectureSlug);
    if (!currentLecture) {
        notFound();
    }
    
    // Mock viewing history. In a real app, this would come from the user's session/database.
    const viewingHistory = [
        "أهمية التوحيد",
        "فضل العلم",
    ];

    let relatedLectures = [];

    try {
        const recommendations = await recommendLectures({
            viewingHistory,
            numberOfRecommendations: 2,
        });

        // Find the full lecture objects from the recommended titles
        relatedLectures = recommendations.recommendedLectures
            .map(title => getLectureBySlug(title.toLowerCase().replace(/\s+/g, '-')))
            .filter((l): l is NonNullable<typeof l> => l !== undefined && l.slug !== currentLectureSlug);

    } catch (error) {
        console.error("AI recommendation failed, falling back to simple logic:", error);
    }
    
    // Fallback logic if AI fails or returns too few lectures
    if (relatedLectures.length < 2) {
        const fallbackLectures = getLecturesBySeries(currentLecture.seriesSlug)
            .filter(l => l.slug !== currentLectureSlug)
            .slice(0, 2);
        
        // Add fallback lectures, avoiding duplicates
        fallbackLectures.forEach(fl => {
            if (!relatedLectures.some(rl => rl.slug === fl.slug) && relatedLectures.length < 2) {
                relatedLectures.push(fl);
            }
        });
    }

    if (relatedLectures.length === 0) {
        return null;
    }

    return (
        <section>
            <h3 className="text-2xl font-semibold mb-4 font-headline">محاضرات مقترحة لك</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedLectures.map(lecture => {
                    const placeholder = getPlaceholderImage(lecture.imageId);
                    return (
                        <Card key={lecture.slug} className="overflow-hidden">
                            <Link href={`/lectures/${lecture.slug}`}>
                                <Image 
                                    src={placeholder?.imageUrl || `https://picsum.photos/seed/${lecture.slug}/300/200`}
                                    alt={lecture.title}
                                    width={300}
                                    height={200}
                                    className="w-full h-32 object-cover"
                                    data-ai-hint={placeholder?.imageHint}
                                />
                            </Link>
                            <CardContent className="p-4">
                                <h4 className="font-semibold font-headline hover:underline">
                                    <Link href={`/lectures/${lecture.slug}`}>{lecture.title}</Link>
                                </h4>
                                <p className="text-sm text-muted-foreground">{lecture.seriesTitle}</p>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </section>
    )
}
