export interface WritingValidationEntry {
  id: string;
  data: {
    type: "fragment" | "essay" | "letter";
    slug: string;
    fragmentNumber?: number;
    startHereOrder?: number;
    status: "draft" | "published";
    related: string[];
  };
}

export function validateWritingCollection<T extends WritingValidationEntry>(entries: T[]): T[] {
  const errors: string[] = [];
  const writingKeys = new Map<string, string>();
  const entriesByKey = new Map<string, WritingValidationEntry>();
  const fragmentNumbers = new Map<number, string>();
  const startHereOrders = new Map<number, string>();

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
      entriesByKey.set(key, entry);
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

    if (entry.data.startHereOrder !== undefined) {
      const existingStartHereEntry = startHereOrders.get(entry.data.startHereOrder);

      if (existingStartHereEntry) {
        errors.push(
          `Duplicate startHereOrder ${entry.data.startHereOrder} in ` +
            `"${existingStartHereEntry}" and "${entry.id}". Start Here order values must be unique.`,
        );
      } else {
        startHereOrders.set(entry.data.startHereOrder, entry.id);
      }
    }
  }

  for (const entry of entries) {
    const currentKey = `${entry.data.type}:${entry.data.slug}`;

    for (const relatedKey of entry.data.related) {
      if (relatedKey === currentKey) {
        errors.push(
          `Writing "${currentKey}" cannot relate to itself. Remove "${relatedKey}" from related.`,
        );
        continue;
      }

      const relatedEntry = entriesByKey.get(relatedKey);

      if (!relatedEntry) {
        errors.push(
          `Writing "${currentKey}" references missing related writing "${relatedKey}". ` +
            "Related identifiers must match an existing type:slug.",
        );
        continue;
      }

      if (entry.data.status === "published" && relatedEntry.data.status !== "published") {
        errors.push(
          `Published writing "${currentKey}" cannot expose draft related writing "${relatedKey}".`,
        );
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`Writing content validation failed:\n- ${errors.join("\n- ")}`);
  }

  return entries;
}
