import rawCatalog from "../../../data/catalog.json";
import { loadCatalog } from "../load-catalog.ts";
import { describe, expect, it } from "vitest";

describe("catalog data file", () => {
  it("loads and validates the real JSON catalog", () => {
    const catalog = loadCatalog(rawCatalog);

    expect(catalog).toHaveLength(8);
    expect(new Set(catalog.map((problem) => problem.id)).size).toBe(8);
  });
});
