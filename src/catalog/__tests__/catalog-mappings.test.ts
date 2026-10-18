import rawCatalog from "../../../data/catalog.json";
import { modularProblems } from "../../problems/registry.ts";
import { describe, expect, it } from "vitest";
import { loadCatalog } from "../load-catalog.ts";
import { validateCatalogMappings } from "../validate-catalog-mappings.ts";

describe("catalog-to-visualizer mappings", () => {
  it("maps the five catalog entries to existing visualizers", () => {
    const catalog = loadCatalog(rawCatalog);

    expect(() =>
      validateCatalogMappings(catalog, modularProblems),
    ).not.toThrow();
  });

  it("allows metadata entries without visualizers", () => {
    const catalog = loadCatalog([
      {
        id: "future-problem",
        title: "Future Problem",
        difficulty: "Easy",
        tags: ["Array"],
        description: "Metadata can exist before its visualization.",
        constraints: ["Use valid input."],
        examples: [
          {
            input: "example input",
            output: "example output",
            explanation: "An illustrative example.",
          },
        ],
      },
    ]);

    expect(() =>
      validateCatalogMappings(catalog, modularProblems),
    ).not.toThrow();
  });

  it("rejects unknown visualizer IDs", () => {
    const catalog = loadCatalog([
      {
        id: "unknown-mapping",
        visualizerId: "does-not-exist",
        title: "Unknown Mapping",
        difficulty: "Easy",
        tags: ["Array"],
        description: "Test an invalid mapping.",
        constraints: ["Use valid input."],
        examples: [
          {
            input: "example input",
            output: "example output",
            explanation: "An illustrative example.",
          },
        ],
      },
    ]);

    expect(() =>
      validateCatalogMappings(catalog, modularProblems),
    ).toThrow(/unknown visualizer/i);
  });

  it("rejects multiple entries mapping to the same visualizer", () => {
    const catalog = loadCatalog([
      {
        id: "first-entry",
        visualizerId: "1",
        title: "First Entry",
        difficulty: "Easy",
        tags: ["Array"],
        description: "First mapping.",
        constraints: ["Use valid input."],
        examples: [
          {
            input: "input",
            output: "output",
            explanation: "Example.",
          },
        ],
      },
      {
        id: "second-entry",
        visualizerId: "1",
        title: "Second Entry",
        difficulty: "Easy",
        tags: ["Array"],
        description: "Duplicate mapping.",
        constraints: ["Use valid input."],
        examples: [
          {
            input: "input",
            output: "output",
            explanation: "Example.",
          },
        ],
      },
    ]);

    expect(() =>
      validateCatalogMappings(catalog, modularProblems),
    ).toThrow(/multiple catalog entries/i);
  });
});
