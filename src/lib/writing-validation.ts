export interface WritingValidationEntry {
  id: string;
  data: {
    type: "fragment" | "essay" | "letter";
    slug: string;
    fragmentNumber?: number;
  };
}

export function validateWritingCollection<T extends WritingValidationEntry>(entries: T[]): T[] {
  const errors: string[] = [];
  const writingKeys = new Map<string, string>();
  const fragmentNumbers = new Map<number, string>();

  for (const entry of entries) {
    const key = `${entry.data.type}:${entry.data.slug}`;
    const existingKeyEntry = writingKeys.get(key);

    if (existingKeyEntry) {
      errors.push(
        `Duplicate writing key "${key}" in "${existingKeyEntry}" and "${entry.id}". ` +
          "Each type + slug combination must be unique.",
      );
    } else {
      writingKeys.set(key, entry.id);
    }

    if (entry.data.type === "fragment" && entry.data.fragmentNumber !== undefined) {
      const existingNumberEntry = fragmentNumbers.get(entry.data.fragmentNumber);

      if (existingNumberEntry) {
        errors.push(
          `Duplicate fragmentNumber ${entry.data.fragmentNumber} in ` +
            `"${existingNumberEntry}" and "${entry.id}". Fragment numbers may have gaps but cannot duplicate.`,
        );
      } else {
        fragmentNumbers.set(entry.data.fragmentNumber, entry.id);
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`Writing content validation failed:\n- ${errors.join("\n- ")}`);
  }

  return entries;
}

