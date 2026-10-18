import type { Problem } from "../engine/types.ts";
import type { CatalogProblem } from "./types.ts";

export function validateCatalogMappings(
  catalog: CatalogProblem[],
  registeredProblems: Pick<Problem, "id">[],
): void {
  const registeredIds = new Set(
    registeredProblems.map((problem) => problem.id),
  );
  const mappedIds = new Set<string>();

  for (const entry of catalog) {
    const visualizerId = entry.visualizerId;

    // Metadata-only entries do not need a visualization yet.
    if (visualizerId === undefined) continue;

    if (!registeredIds.has(visualizerId)) {
      throw new Error(
        `Catalog entry "${entry.id}" references unknown visualizer "${visualizerId}".`,
      );
    }

    if (mappedIds.has(visualizerId)) {
      throw new Error(
        `Multiple catalog entries reference visualizer "${visualizerId}".`,
      );
    }

    mappedIds.add(visualizerId);
  }
}
