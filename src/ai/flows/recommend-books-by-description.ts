
'use server';
/**
 * @fileOverview Recommends books based on a provided description.
 *
 * - recommendBooksByDescription - A function that handles book recommendations based on description.
 * - RecommendBooksByDescriptionInput - The input type for the function.
 * - RecommendBooksByDescriptionOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendBooksByDescriptionInputSchema = z.object({
  description: z.string().min(20, { message: "Description must be at least 20 characters."}).describe('The description of the book.'),
});
export type RecommendBooksByDescriptionInput = z.infer<typeof RecommendBooksByDescriptionInputSchema>;

const RecommendedBookSchema = z.object({
  title: z.string().describe('The title of the recommended book.'),
  author: z.string().describe('The author of the recommended book.'),
  genre: z.string().optional().describe('The genre of the recommended book.'),
  reason: z.string().describe('Why the book is recommended based on the provided description.'),
});

const RecommendBooksByDescriptionOutputSchema = z.object({
  recommendations: z.array(RecommendedBookSchema).describe('A list of recommended books.'),
});
export type RecommendBooksByDescriptionOutput = z.infer<typeof RecommendBooksByDescriptionOutputSchema>;

export async function recommendBooksByDescription(input: RecommendBooksByDescriptionInput): Promise<RecommendBooksByDescriptionOutput> {
  return recommendBooksByDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendBooksByDescriptionPrompt',
  input: {schema: RecommendBooksByDescriptionInputSchema},
  output: {schema: RecommendBooksByDescriptionOutputSchema},
  prompt: `You are an expert book recommender. Based on the following book description, please provide a list of 3 similar books.

For each recommended book, include:
- title
- author
- genre (if easily identifiable from the context of the description or common knowledge about the book)
- reason (a short explanation of why this book is a good recommendation based on the provided description)

Description:
{{{description}}}

Format your response as a JSON object with a 'recommendations' array.
`,
});

const recommendBooksByDescriptionFlow = ai.defineFlow(
  {
    name: 'recommendBooksByDescriptionFlow',
    inputSchema: RecommendBooksByDescriptionInputSchema,
    outputSchema: RecommendBooksByDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
