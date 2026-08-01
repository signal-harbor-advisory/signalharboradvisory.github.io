import { defineCollection } from 'astro:content';
import { z } from 'zod';
import { glob } from 'astro/loaders';

const insights = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/insights' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    publishDate: z.coerce.date(),
    topic: z.string(),
    tags: z.array(z.string()),
    readingTime: z.string(),
    draft: z.boolean().default(false),
    canonicalUrl: z.string().url().optional(),
  }),
});

export const collections = { insights };
