import type { CatalogProblem } from "./types.ts";

const isRecord = (
  value: unknown,
): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) &&
  value.every((item) => typeof item === "string" && item.trim().length > 0);

export function validateCatalogProblem(
  value: unknown,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!isRecord(value)) {
    return { valid: false, errors: ["Problem entry must be an object."] };
  }

  for (const field of ["id", "title", "description"] as const) {
    if (
      typeof value[field] !== "string" ||
      value[field].trim().length === 0
    ) {
      errors.push(`${field} must be a non-empty string.`);
    }
  }

  if (
    value.visualizerId !== undefined &&
    (typeof value.visualizerId !== "string" ||
      value.visualizerId.trim().length === 0 ||
      value.visualizerId.length > 100)
  ) {
    errors.push("visualizerId must be a non-empty string of at most 100 characters when provided.");
  }

  if (
    typeof value.id === "string" &&
    value.id.length > 100
  ) {
    errors.push("id must be 100 characters or fewer.");
  }

  if (
    typeof value.title === "string" &&
    value.title.length > 200
  ) {
    errors.push("title must be 200 characters or fewer.");
  }

  if (
    value.difficulty !== "Easy" &&
    value.difficulty !== "Medium" &&
    value.difficulty !== "Hard"
  ) {
    errors.push("difficulty must be Easy, Medium, or Hard.");
  }

  if (!isStringArray(value.tags)) {
    errors.push("tags must be an array of non-empty strings.");
  }

  if (!isStringArray(value.constraints)) {
    errors.push("constraints must be an array of non-empty strings.");
  }

  if (!Array.isArray(value.examples) || value.examples.length === 0) {
    errors.push("examples must contain at least one example.");
  } else {
    value.examples.forEach((example, index) => {
      if (!isRecord(example)) {
        errors.push(`examples[${index}] must be an object.`);
        return;
      }

      for (const field of ["input", "output", "explanation"] as const) {
        if (
          typeof example[field] !== "string" ||
          example[field].trim().length === 0
        ) {
          errors.push(
            `examples[${index}].${field} must be a non-empty string.`,
          );
        }
      }
    });
  }

  return { valid: errors.length === 0, errors };
}

export function isCatalogProblem(value: unknown): value is CatalogProblem {
  return validateCatalogProblem(value).valid;
}
