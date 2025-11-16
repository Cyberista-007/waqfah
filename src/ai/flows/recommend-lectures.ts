'use server';

/**
 * @fileOverview Recommends lectures to a user based on their viewing history.
 *
 * - recommendLectures - A function that recommends lectures to a user.
 * - RecommendLecturesInput - The input type for the recommendLectures function.
 * - RecommendLecturesOutput - The return type for the recommendLectures function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendLecturesInputSchema = z.object({
  viewingHistory: z
    .array(z.string())
    .describe('An array of lecture titles the user has viewed.'),
  numberOfRecommendations: z
    .number()
    .default(3)
    .describe('The number of lecture recommendations to return.'),
});
export type RecommendLecturesInput = z.infer<typeof RecommendLecturesInputSchema>;

const RecommendLecturesOutputSchema = z.object({
  recommendedLectures: z
    .array(z.string())
    .describe('An array of recommended lecture titles.'),
});
export type RecommendLecturesOutput = z.infer<typeof RecommendLecturesOutputSchema>;

export async function recommendLectures(input: RecommendLecturesInput): Promise<RecommendLecturesOutput> {
  return recommendLecturesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendLecturesPrompt',
  input: {schema: RecommendLecturesInputSchema},
  output: {schema: RecommendLecturesOutputSchema},
  prompt: `You are a lecture recommendation system. Given a user's viewing history, recommend lectures they might be interested in.

  Viewing History: {{viewingHistory}}

  Number of Recommendations: {{numberOfRecommendations}}`,
});

const recommendLecturesFlow = ai.defineFlow(
  {
    name: 'recommendLecturesFlow',
    inputSchema: RecommendLecturesInputSchema,
    outputSchema: RecommendLecturesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
