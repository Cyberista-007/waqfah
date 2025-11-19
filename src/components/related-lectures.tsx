
import { getRelatedLectures } from "@/lib/data"
import { Card, CardContent } from "./ui/card";
import Link from "next/link";
import Image from "next/image";
import { getPlaceholderImage } from "@/lib/images";

export default async function RelatedLectures({ currentLectureId, seriesId }: { currentLectureId: string, seriesId: string }) {
    
    const relatedLectures = await getRelatedLectures(currentLectureId, seriesId);

    if (relatedLectures.length === 0) {
        return null;
    }

    return (
        <section>
            <h3 className="text-2xl font-semibold mb-4 font-headline">محاضرات ذات صلة</h3>
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
