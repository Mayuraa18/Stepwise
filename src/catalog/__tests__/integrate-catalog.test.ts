import rawCatalog from "../../../data/catalog.json";
import { modularProblems } from "../../problems/registry.ts";
import { describe, expect, it } from "vitest";
import { integrateCatalog } from "../integrate-catalog.ts";
import { loadCatalog } from "../load-catalog.ts";

describe("integrateCatalog", () => {
  it("applies catalog metadata while preserving all registered problems", () => {
    const catalog = loadCatalog(rawCatalog);
    const integrated = integrateCatalog(catalog, modularProblems);

    expect(integrated).toHaveLength(modularProblems.length);

    for (const original of modularProblems) {
      const result = integrated.find((problem) => problem.id === original.id);

      expect(result).toBeDefined();
      expect(result?.run).toBe(original.run);
      expect(result?.parse).toBe(original.parse);
    }

    expect(integrated.find((problem) => problem.id === "1")?.title)
      .toBe("Two Sum");
  });

  it("preserves registered problems without catalog mappings", () => {
    const catalog = loadCatalog([]);
    const integrated = integrateCatalog(catalog, modularProblems);

    expect(integrated).toEqual(modularProblems);
  });
});
