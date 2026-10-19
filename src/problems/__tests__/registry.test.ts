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
  {
    id: "206",
    input: "1, 2, 3, 4, 5",
    expectedResult: "[5,4,3,2,1]",
  },
  {
    id: "217",
    input: "1, 2, 3, 1",
    expectedResult: "true",
  },
  {
    id: "26",
    input: "0, 0, 1, 1, 2, 3, 3",
    expectedResult: "4",
  },
  {
    id: "283",
    input: "0, 1, 0, 3, 12",
    expectedResult: "[1,3,12,0,0]",
  },
];

describe("UI-facing problem registry", () => {
  it("preserves moving item identities while Move Zeroes updates the state", () => {
    const problem = modularProblems.find((item) => item.id === "283");
    if (!problem) throw new Error("Move Zeroes is not registered");

    const steps = problem.run("0, 1, 0, 3, 12");
    const firstIds = steps[0]?.visualization?.items?.map((item) => item.id);
    const moveOne = steps.find((step) => step.title === "Move 1 from index 1 to index 0");
    const finalStep = steps.at(-1);

    expect(firstIds).toEqual(["item-0", "item-1", "item-2", "item-3", "item-4"]);
    expect(moveOne?.array).toEqual([1, 0, 0, 3, 12]);
    expect(moveOne?.line).toBe(5);
    expect(moveOne?.pseudocodeLine).toBe(2);
    expect(moveOne?.visualization?.items?.map((item) => item.id)?.[0]).toBe("item-1");
    expect(finalStep?.array).toEqual([1, 3, 12, 0, 0]);
    expect(finalStep?.result).toBe("[1,3,12,0,0]");
  });

  it("registers all nine unique problems", () => {
  expect(modularProblems).toHaveLength(9);
  expect(new Set(modularProblems.map((problem) => problem.id)).size)
    .toBe(9);
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

        if (problem.visualization.kind === "array") {
          expect(step.visualization?.items?.map((item) => item.value)).toEqual(
            step.array.map(String),
          );
        }
      }

      // Running a trace must not mutate the source input shown in the fixed input panel.
      expect(problem.parse(input).array).toEqual(parsed.array);
      expect(steps.at(-1)?.result).toBe(expectedResult);

      if (id === "206") {
        expect(steps.at(-1)?.visualization?.items?.map((item) => item.value))
          .toEqual(["5", "4", "3", "2", "1"]);
        expect(steps.at(-1)?.visualization?.edges).toEqual([
          ["node-4", "node-3"],
          ["node-3", "node-2"],
          ["node-2", "node-1"],
          ["node-1", "node-0"],
        ]);
      }
    },
  );

  it.each([
    ["1", "not valid input"],
    ["704", '{"nums":[3,1,2],"target":1}'],
    ["121", "7, -1, 5"],
    ["53", ""],
    ["20", "(abc)"],
    ["26", "3, 1, 2"],
    ["283", ""],
  ])("rejects invalid input for problem %s", (id, input) => {
    const problem = modularProblems.find((item) => item.id === id);

    expect(problem).toBeDefined();
    if (!problem) throw new Error(`Problem ${id} is not registered`);

    expect(() => problem.run(input)).toThrow();
  });
});
