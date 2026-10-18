import { describe, expect, it } from "vitest";
import { loadCatalog } from "../load-catalog.ts";

const problem = {
  id: "two-sum",
  visualizerId: "1",
  title: "Two Sum",
  difficulty: "Easy",
  tags: ["Array"],
  description: "Find two numbers that add to a target.",
  constraints: ["At least two numbers."],
  examples: [
    {
      input: "[2, 7], target 9",
      output: "[0, 1]",
      explanation: "The two values add to nine.",
    },
  ],
};

describe("loadCatalog", () => {
  it("loads valid entries", () => {
    expect(loadCatalog([problem])).toHaveLength(1);
    expect(loadCatalog([problem])[0].title).toBe("Two Sum");
  });

  it("rejects non-array catalogs", () => {
    expect(() => loadCatalog({ problem })).toThrow(/must be an array/i);
  });

  it("rejects duplicate IDs", () => {
    expect(() => loadCatalog([problem, problem])).toThrow(/duplicate problem ID/i);
  });

  it("rejects malformed entries", () => {
    expect(() => loadCatalog([{ ...problem, title: "" }]))
      .toThrow(/Catalog validation failed/i);
  });
});
