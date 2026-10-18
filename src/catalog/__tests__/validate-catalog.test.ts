import { describe, expect, it } from "vitest";
import {
  isCatalogProblem,
  validateCatalogProblem,
} from "../validate-catalog.ts";

const validProblem = {
  id: "two-sum",
  visualizerId: "1",
  title: "Two Sum",
  difficulty: "Easy",
  tags: ["Array", "Hash Table"],
  description: "Find two values that add up to a target.",
  constraints: ["At least two values are provided."],
  examples: [
    {
      input: "nums = [2, 7], target = 9",
      output: "[0, 1]",
      explanation: "The first two values add up to nine.",
    },
  ],
};

describe("problem catalog validation", () => {
  it("accepts valid metadata", () => {
    expect(validateCatalogProblem(validProblem)).toEqual({
      valid: true,
      errors: [],
    });
    expect(isCatalogProblem(validProblem)).toBe(true);
  });

  it("rejects non-object entries", () => {
    expect(validateCatalogProblem(null).valid).toBe(false);
    expect(validateCatalogProblem([]).valid).toBe(false);
  });

  it("rejects invalid difficulty and missing metadata", () => {
    const result = validateCatalogProblem({
      ...validProblem,
      difficulty: "Extreme",
      title: "",
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "difficulty must be Easy, Medium, or Hard.",
    );
    expect(result.errors).toContain(
      "title must be a non-empty string.",
    );
  });

  it("rejects empty or malformed examples", () => {
    expect(
      validateCatalogProblem({ ...validProblem, examples: [] }).valid,
    ).toBe(false);

    expect(
      validateCatalogProblem({
        ...validProblem,
        examples: [{ input: "", output: "1", explanation: "Example" }],
      }).valid,
    ).toBe(false);
  });
});
