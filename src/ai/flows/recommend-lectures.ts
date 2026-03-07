
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
    .describe('An array of lecture titles the user has already viewed.'),
  allLectures: z
    .array(z.string())
    .describe('The complete list of all available lecture titles in the library.'),
  numberOfRecommendations: z
    .number()
    .default(4)
    .describe('The number of lecture recommendations to return.'),
});
export type RecommendLecturesInput = z.infer<typeof RecommendLecturesInputSchema>;

const RecommendLecturesOutputSchema = z.object({
  recommendedLectures: z
    .array(z.string())
    .describe('An array of recommended lecture titles. These titles must be from the provided list of all available lectures and must not be in the user\'s viewing history.'),
});
export type RecommendLecturesOutput = z.infer<typeof RecommendLecturesOutputSchema>;

export async function recommendLectures(input: RecommendLecturesInput): Promise<RecommendLecturesOutput> {
  return recommendLecturesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendLecturesPrompt',
  input: {schema: RecommendLecturesInputSchema},
  output: {schema: RecommendLecturesOutputSchema},
  prompt: `You are an intelligent lecture recommendation system for an Islamic studies platform. Your task is to recommend new lectures to a user based on their viewing history.

You must follow these rules strictly:
1.  The recommendations MUST be chosen from the list of all available lectures.
2.  The recommendations MUST NOT include any lectures the user has already seen (from their viewing history).
3.  Analyze the topics and themes from the user's viewing history to find similar or related lectures.
4.  Return exactly the number of recommendations requested.

Here is the data:

All Available Lectures:
- {{allLectures}}

User's Viewing History:
- {{viewingHistory}}

Please recommend {{numberOfRecommendations}} new lectures for this user.`,
});

const recommendLecturesFlow = ai.defineFlow(
  {
    name: 'recommendLecturesFlow',
    inputSchema: RecommendLecturesInputSchema,
    outputSchema: RecommendLecturesOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
