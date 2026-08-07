import { getCollection, type CollectionEntry } from "astro:content";
import { validateWritingCollection } from "./writing-validation";

export type WritingEntry = CollectionEntry<"writing">;
export type WritingData = WritingEntry["data"];

const collectionSegments: Record<WritingData["type"], string> = {
  fragment: "fragments",
  essay: "essays",
  letter: "letters",
};

export async function getWritingEntries(): Promise<WritingEntry[]> {
  const entries = await getCollection("writing");
  return validateWritingCollection(entries);
}

export async function getPublishedWritingEntries(): Promise<WritingEntry[]> {
  const entries = await getWritingEntries();
  return entries.filter((entry) => entry.data.status === "published");
}

export function getEffectivePublicationDate(data: WritingData): Date {
  const effectiveDate = data.originalPublishedDate ?? data.publishedDate;

  if (!effectiveDate) {
    throw new Error(
      `Writing "${data.type}:${data.slug}" has no effective publication date. ` +
        "Published entries require publishedDate; historical dates must not be inferred.",
    );
  }

  return effectiveDate;
}

export function getWritingPath(data: WritingData): string {
  return `/writing/${collectionSegments[data.type]}/${data.slug}/`;
}

export function getWritingCollectionSegment(data: WritingData): string {
  return collectionSegments[data.type];
}

export function calculateReadingTime(markdown: string, wordsPerMinute = 225): number {
  const readableText = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/^[#>*+-]+\s*/gm, " ");
  const words = readableText.match(/[\p{L}\p{N}]+(?:[’'][\p{L}\p{N}]+)*/gu) ?? [];

  return Math.max(1, Math.ceil(words.length / wordsPerMinute));
}

export function formatReadingTime(minutes: number): string {
  return `${minutes} min read`;
}

export function formatWritingDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

