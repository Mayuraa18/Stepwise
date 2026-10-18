import { describe, expect, it } from "vitest";
import { modularProblems } from "../registry.ts";

const validCases = [
  {
    id: "1",
    input: '{"nums":[2,7,11,15],"target":9}',
    expectedResult: "[0,1]",
  },
  {
    id: "704",
    input: '{"nums":[-1,0,3,5,9,12],"target":9}',
    expectedResult: "4",
  },
  {
    id: "121",
    input: "7, 1, 5, 3, 6, 4",
    expectedResult: "5",
  },
  {
    id: "53",
    input: "-2, 1, -3, 4, -1, 2, 1, -5, 4",
    expectedResult: "6",
  },
  {
    id: "20",
    input: "()[]{}",
    expectedResult: "Valid bracket sequence",
  },
];

describe("UI-facing problem registry", () => {
  it("registers all six unique problems", () => {
  expect(modularProblems).toHaveLength(6);
  expect(new Set(modularProblems.map((problem) => problem.id)).size)
    .toBe(6);
});

  it.each(validCases)(
    "adapts problem $id into usable visualization steps",
    ({ id, input, expectedResult }) => {
      const problem = modularProblems.find((item) => item.id === id);

      expect(problem).toBeDefined();
      if (!problem) throw new Error(`Problem ${id} is not registered`);

      const parsed = problem.parse(input);
      expect(Array.isArray(parsed.array)).toBe(true);

      const steps = problem.run(input);
      expect(steps.length).toBeGreaterThan(0);

      for (const step of steps) {
        expect(step.title.length).toBeGreaterThan(0);
        expect(step.explanation.length).toBeGreaterThan(0);
        expect(Array.isArray(step.array)).toBe(true);
        expect(Array.isArray(step.variables)).toBe(true);
        expect(Array.isArray(step.memory)).toBe(true);
        expect(typeof step.line).toBe("number");
        expect(typeof step.pseudocodeLine).toBe("number");
      }

      expect(steps.at(-1)?.result).toBe(expectedResult);
    },
  );

  it.each([
    ["1", "not valid input"],
    ["704", '{"nums":[3,1,2],"target":1}'],
    ["121", "7, -1, 5"],
    ["53", ""],
    ["20", "(abc)"],
  ])("rejects invalid input for problem %s", (id, input) => {
    const problem = modularProblems.find((item) => item.id === id);

    expect(problem).toBeDefined();
    if (!problem) throw new Error(`Problem ${id} is not registered`);

    expect(() => problem.run(input)).toThrow();
  });
});
