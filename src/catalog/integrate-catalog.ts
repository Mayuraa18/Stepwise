import type { Problem } from "../engine/types.ts";
import type { CatalogProblem } from "./types.ts";
import { validateCatalogMappings } from "./validate-catalog-mappings.ts";

export function integrateCatalog(
  catalog: CatalogProblem[],
  registeredProblems: Problem[],
): Problem[] {
  validateCatalogMappings(catalog, registeredProblems);

  const metadataByVisualizerId = new Map(
    catalog
      .filter(
        (entry): entry is CatalogProblem & { visualizerId: string } =>
          entry.visualizerId !== undefined,
      )
      .map((entry) => [entry.visualizerId, entry]),
  );

  return registeredProblems.map((problem) => {
    const metadata = metadataByVisualizerId.get(problem.id);

    if (!metadata) return problem;

    return {
      ...problem,
      title: metadata.title,
      difficulty: metadata.difficulty,
      category: metadata.tags.join(", "),
      description: metadata.description,
    };
  });
}
