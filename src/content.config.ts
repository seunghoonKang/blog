import { glob } from "astro/loaders";
import { z, defineCollection } from "astro:content";

const baseSchema = z.object({
  title: z.string(),
  pubDate: z.date(),
  description: z.string(),
  author: z.string(),
  image: z.object({
    url: z.string(),
    alt: z.string(),
  }),
  tags: z.array(z.string()).default([]),
  category: z.string().default(""),
});

// posts 컬렉션
const posts = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/data/posts" }),
  schema: baseSchema,
});

// notes 컬렉션
const notes = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/data/notes" }),
  schema: baseSchema,
});

export const collections = { posts, notes };
