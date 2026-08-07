import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const exactDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use an exact date in YYYY-MM-DD format.")
  .refine((value) => {
    const parsed = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
  }, "Use a real calendar date in YYYY-MM-DD format.")
  .transform((value) => new Date(`${value}T00:00:00.000Z`));

const slug = z
  .string()
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use a lowercase kebab-case slug. Published slugs are permanent.",
  );

const writingSchema = z
  .object({
    title: z.string().trim().min(1),
    slug,
    type: z.enum(["fragment", "essay", "letter"]),
    summary: z.string().trim().min(1),
    category: z.string().trim().min(1),
    tags: z
      .array(slug)
      .default([])
      .refine((tags) => new Set(tags).size === tags.length, "Tags must be unique."),
    publishedDate: exactDate.optional(),
    originalPublishedDate: exactDate.optional(),
    updatedDate: exactDate.optional(),
    fragmentNumber: z.number().int().positive().optional(),
    featured: z.boolean().default(false),
    startHereOrder: z.number().int().positive().optional(),
    mediumUrl: z.string().url().optional(),
    status: z.enum(["draft", "published"]).default("draft"),
    related: z
      .array(
        z.string().regex(
          /^(fragment|essay|letter):[a-z0-9]+(?:-[a-z0-9]+)*$/,
          "Related writing identifiers must use type:slug.",
        ),
      )
      .default([])
      .refine(
        (identifiers) => new Set(identifiers).size === identifiers.length,
        "Related writing identifiers must be unique.",
      ),
    connections: z
      .array(
        z.object({
          kind: z.enum(["book", "project", "guide"]),
          label: z.string().trim().min(1),
          url: z.string().min(1),
        }),
      )
      .default([]),
    heroImage: z
      .object({
        src: z.string().trim().min(1),
        alt: z.string().trim().min(1),
        caption: z.string().trim().min(1).optional(),
        credit: z.string().trim().min(1).optional(),
      })
      .optional(),
  })
  .superRefine((data, context) => {
    if (data.status === "published" && !data.publishedDate) {
      context.addIssue({
        code: "custom",
        path: ["publishedDate"],
        message: "Published writing requires the verified GarryTipler.com publication date.",
      });
    }

    if (data.type === "fragment" && data.fragmentNumber === undefined) {
      context.addIssue({
        code: "custom",
        path: ["fragmentNumber"],
        message: "Fragments require a positive fragmentNumber.",
      });
    }

    if (data.type !== "fragment" && data.fragmentNumber !== undefined) {
      context.addIssue({
        code: "custom",
        path: ["fragmentNumber"],
        message: "Only fragments may define fragmentNumber.",
      });
    }

    if (
      data.originalPublishedDate &&
      data.publishedDate &&
      data.originalPublishedDate > data.publishedDate
    ) {
      context.addIssue({
        code: "custom",
        path: ["originalPublishedDate"],
        message: "originalPublishedDate cannot be later than publishedDate.",
      });
    }

    if (data.updatedDate && data.publishedDate && data.updatedDate < data.publishedDate) {
      context.addIssue({
        code: "custom",
        path: ["updatedDate"],
        message: "updatedDate cannot be earlier than publishedDate.",
      });
    }
  });

const writing = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/writing",
    retainBody: true,
    generateId: ({ entry }) => entry.replace(/\\/g, "/").replace(/\.md$/, ""),
  }),
  schema: writingSchema,
});

export const collections = { writing };
