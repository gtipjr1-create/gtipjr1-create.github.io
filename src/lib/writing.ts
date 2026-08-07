import { getCollection, type CollectionEntry } from "astro:content";
import { validateWritingCollection } from "./writing-validation";

export type WritingEntry = CollectionEntry<"writing">;
export type WritingData = WritingEntry["data"];
export type WritingType = WritingData["type"];

export interface AdjacentWritingEntries {
  previous?: WritingEntry;
  next?: WritingEntry;
}

const collectionSegments: Record<WritingType, string> = {
  fragment: "fragments",
  essay: "essays",
  letter: "letters",
};

const collectionLabels: Record<WritingType, string> = {
  fragment: "Fragments",
  essay: "Essays",
  letter: "Letters",
};

export async function getWritingEntries(): Promise<WritingEntry[]> {
  const entries = await getCollection("writing");
  return validateWritingCollection(entries);
}

export async function getPublishedWritingEntries(): Promise<WritingEntry[]> {
  const entries = await getWritingEntries();
  return entries.filter((entry) => entry.data.status === "published");
}

export async function getPublishedWritingEntriesByType(
  type: WritingType,
): Promise<WritingEntry[]> {
  const entries = await getPublishedWritingEntries();
  return entries.filter((entry) => entry.data.type === type);
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

export function getWritingCollectionPath(type: WritingType): string {
  return `/writing/${collectionSegments[type]}/`;
}

export function getWritingCollectionLabel(type: WritingType): string {
  return collectionLabels[type];
}

export function sortWritingByPublicationDate(
  entries: WritingEntry[],
  direction: "ascending" | "descending" = "descending",
): WritingEntry[] {
  const multiplier = direction === "ascending" ? 1 : -1;

  return [...entries].sort((left, right) => {
    const dateDifference =
      getEffectivePublicationDate(left.data).valueOf() -
      getEffectivePublicationDate(right.data).valueOf();

    if (dateDifference !== 0) return dateDifference * multiplier;
    return left.data.slug.localeCompare(right.data.slug) * multiplier;
  });
}

export function sortWritingCollection(
  entries: WritingEntry[],
  direction: "ascending" | "descending" = "descending",
): WritingEntry[] {
  const multiplier = direction === "ascending" ? 1 : -1;

  return [...entries].sort((left, right) => {
    if (
      left.data.type === "fragment" &&
      right.data.type === "fragment" &&
      left.data.fragmentNumber !== undefined &&
      right.data.fragmentNumber !== undefined
    ) {
      const numberDifference = left.data.fragmentNumber - right.data.fragmentNumber;
      if (numberDifference !== 0) return numberDifference * multiplier;
    }

    const dateDifference =
      getEffectivePublicationDate(left.data).valueOf() -
      getEffectivePublicationDate(right.data).valueOf();

    if (dateDifference !== 0) return dateDifference * multiplier;
    return left.data.slug.localeCompare(right.data.slug) * multiplier;
  });
}

export function getAdjacentWritingEntries(
  currentEntry: WritingEntry,
  entries: WritingEntry[],
): AdjacentWritingEntries {
  const collectionEntries = sortWritingCollection(
    entries.filter((entry) => entry.data.type === currentEntry.data.type),
    "ascending",
  );
  const currentIndex = collectionEntries.findIndex((entry) => entry.id === currentEntry.id);

  if (currentIndex === -1) {
    throw new Error(`Writing entry "${currentEntry.id}" was not found in its public collection.`);
  }

  return {
    previous: collectionEntries[currentIndex - 1],
    next: collectionEntries[currentIndex + 1],
  };
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
