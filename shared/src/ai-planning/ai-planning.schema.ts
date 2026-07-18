import { z } from 'zod';

export const aiPlaceSuggestionSchema = z.object({
  name: z.string(),
  reason: z.string(),
  category: z.string().optional(),
});
export type AiPlaceSuggestion = z.infer<typeof aiPlaceSuggestionSchema>;

export const aiPlanningSuggestResponseSchema = z.object({
  suggestions: z.array(aiPlaceSuggestionSchema),
});
export type AiPlanningSuggestResponse = z.infer<typeof aiPlanningSuggestResponseSchema>;
