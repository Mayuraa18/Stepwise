import type { CatalogProblem } from "./types.ts";
import { validateCatalogProblem } from "./validate-catalog.ts";

export function loadCatalog(value: unknown): CatalogProblem[] {
  if (!Array.isArray(value)) {
    throw new Error("Catalog must be an array of problem entries.");
  }

  const catalog: CatalogProblem[] = [];
  const seenIds = new Set<string>();
  const errors: string[] = [];

  value.forEach((entry, index) => {
    const validation = validateCatalogProblem(entry);

    if (!validation.valid) {
      errors.push(
        ...validation.errors.map((error) => `Entry ${index}: ${error}`),
      );
      return;
    }

    const problem = entry as CatalogProblem;

    if (seenIds.has(problem.id)) {
      errors.push(`Entry ${index}: duplicate problem ID "${problem.id}".`);
      return;
    }

    seenIds.add(problem.id);
    catalog.push(problem);
  });

  if (errors.length > 0) {
    throw new Error(`Catalog validation failed:\n${errors.join("\n")}`);
  }

  return catalog;
}
