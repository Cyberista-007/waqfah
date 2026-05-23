
/**
 * @fileOverview Mocked version of recommend lectures for static/electron builds.
 */

import { z } from 'zod';

const RecommendLecturesInputSchema = z.object({
  viewingHistory: z.array(z.string()),
  allLectures: z.array(z.string()),
  numberOfRecommendations: z.number().default(4),
});
export type RecommendLecturesInput = z.infer<typeof RecommendLecturesInputSchema>;

const RecommendLecturesOutputSchema = z.object({
  recommendedLectures: z.array(z.string()),
});
export type RecommendLecturesOutput = z.infer<typeof RecommendLecturesOutputSchema>;

export async function recommendLectures(input: RecommendLecturesInput): Promise<RecommendLecturesOutput> {
  console.log('AI recommendations are disabled in static/electron builds.');
  return { recommendedLectures: [] };
}
