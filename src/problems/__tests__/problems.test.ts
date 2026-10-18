import { describe, expect, it } from "vitest";

import { twoSumProblem } from "../two-sum.ts";
import { binarySearchProblem } from "../binary-search.ts";
import { bestTimeToBuySellStockProblem } from "../best-time-to-buy-sell-stock.ts";
import { maximumSubarrayProblem } from "../maximum-subarray.ts";
import { validParenthesesProblem } from "../valid-parentheses.ts";
import { modularProblems } from "../registry.ts";

describe("Two Sum", () => {
  it("finds the matching pair", () => {
    const input = twoSumProblem.parseInput(
      '{"nums":[2,7,11,15],"target":9}',
    );
    expect(twoSumProblem.solve(input)).toEqual([0, 1]);
  });

  it("returns an empty result when no pair exists", () => {
    const input = twoSumProblem.parseInput(
      '{"nums":[1,2,3],"target":10}',
    );
    expect(twoSumProblem.solve(input)).toEqual([]);
  });

  it("rejects invalid input", () => {
    expect(() => twoSumProblem.parseInput('{"nums":"bad","target":9}'))
      .toThrow();
  });
});

describe("Binary Search", () => {
  it("finds a target in a sorted array", () => {
    const input = binarySearchProblem.parseInput(
      '{"nums":[-1,0,3,5,9,12],"target":9}',
    );
    expect(binarySearchProblem.solve(input)).toBe(4);
  });

  it("returns -1 when the target is absent", () => {
    const input = binarySearchProblem.parseInput(
      '{"nums":[1,3,5,7],"target":4}',
    );
    expect(binarySearchProblem.solve(input)).toBe(-1);
  });

  it("rejects an unsorted array", () => {
    expect(() =>
      binarySearchProblem.parseInput('{"nums":[3,1,2],"target":1}'),
    ).toThrow(/sorted/i);
  });
});

describe("Best Time to Buy and Sell Stock", () => {
  it("calculates the maximum profit", () => {
    const input = bestTimeToBuySellStockProblem.parseInput("7, 1, 5, 3, 6, 4");
    expect(bestTimeToBuySellStockProblem.solve(input)).toBe(5);
  });

  it("returns zero when prices only decrease", () => {
    const input = bestTimeToBuySellStockProblem.parseInput("7, 6, 4, 3, 1");
    expect(bestTimeToBuySellStockProblem.solve(input)).toBe(0);
  });

  it("rejects negative prices", () => {
    expect(() => bestTimeToBuySellStockProblem.parseInput("7, -1, 5"))
      .toThrow();
  });
});

describe("Maximum Subarray", () => {
  it("finds the maximum contiguous sum", () => {
    const input = maximumSubarrayProblem.parseInput(
      "-2, 1, -3, 4, -1, 2, 1, -5, 4",
    );
    expect(maximumSubarrayProblem.solve(input)).toBe(6);
  });

  it("handles an all-negative array", () => {
    const input = maximumSubarrayProblem.parseInput("-5, -2, -8");
    expect(maximumSubarrayProblem.solve(input)).toBe(-2);
  });

  it("rejects an empty array", () => {
    expect(() => maximumSubarrayProblem.parseInput("")).toThrow();
  });
});

describe("Valid Parentheses", () => {
  it("accepts correctly matched brackets", () => {
    const input = validParenthesesProblem.parseInput("()[]{}");
    expect(validParenthesesProblem.solve(input)).toBe(true);
  });

  it("rejects incorrectly nested brackets", () => {
    const input = validParenthesesProblem.parseInput("([)]");
    expect(validParenthesesProblem.solve(input)).toBe(false);
  });

  it("rejects invalid characters", () => {
    expect(() => validParenthesesProblem.parseInput("(abc)")).toThrow();
  });
});


describe("Input limits", () => {
  it("rejects oversized Two Sum arrays", () => {
    const nums = Array.from({ length: 201 }, (_, i) => i);
    expect(() => twoSumProblem.parseInput(
      JSON.stringify({ nums, target: 10 }),
    )).toThrow(/between 2 and 200/i);
  });

  it("rejects oversized Binary Search arrays", () => {
    const nums = Array.from({ length: 201 }, (_, i) => i);
    expect(() => binarySearchProblem.parseInput(
      JSON.stringify({ nums, target: 10 }),
    )).toThrow(/between 1 and 200/i);
  });

  it("rejects oversized stock inputs", () => {
    expect(() => bestTimeToBuySellStockProblem.parseInput(
      Array(201).fill("1").join(","),
    )).toThrow(/between 1 and 200/i);
  });

  it("rejects oversized Maximum Subarray inputs", () => {
    expect(() => maximumSubarrayProblem.parseInput(
      Array(201).fill("1").join(","),
    )).toThrow(/between 1 and 200/i);
  });

  it("rejects oversized bracket strings", () => {
    expect(() => validParenthesesProblem.parseInput("(".repeat(201)))
      .toThrow(/200 characters or fewer/i);
  });

  it("rejects excessively long raw input before parsing", () => {
    expect(() => twoSumProblem.parseInput(" ".repeat(10_001)))
      .toThrow(/input is too long/i);
    expect(() => validParenthesesProblem.parseInput(" ".repeat(10_001)))
      .toThrow(/input is too long/i);
  });
});

describe("Visualization traces", () => {
  it.each([
    ["Two Sum", () => twoSumProblem.createSteps(
      twoSumProblem.parseInput('{"nums":[2,7],"target":9}'),
    )],
    ["Binary Search", () => binarySearchProblem.createSteps(
      binarySearchProblem.parseInput('{"nums":[1,3,5],"target":3}'),
    )],
    ["Stock", () => bestTimeToBuySellStockProblem.createSteps(
      bestTimeToBuySellStockProblem.parseInput("7, 1, 5"),
    )],
    ["Maximum Subarray", () => maximumSubarrayProblem.createSteps(
      maximumSubarrayProblem.parseInput("-2, 1, -3"),
    )],
    ["Valid Parentheses", () => validParenthesesProblem.createSteps(
      validParenthesesProblem.parseInput("()"),
    )],
  ])("%s generates a non-empty trace with unique step IDs", (_name, createSteps) => {
    const steps = createSteps();
    expect(steps.length).toBeGreaterThan(0);
    expect(new Set(steps.map((step) => step.id)).size).toBe(steps.length);
  });
});

describe("Snapshot safety", () => {
  it("does not mutate the parsed Two Sum input", () => {
    const input = twoSumProblem.parseInput(
      '{"nums":[2,7,11],"target":9}',
    );
    const originalNums = [...input.nums];

    twoSumProblem.createSteps(input);

    expect(input.nums).toEqual(originalNums);
  });

  it("preserves earlier Two Sum memory snapshots", () => {
    const input = twoSumProblem.parseInput(
      '{"nums":[2,7,11],"target":18}',
    );
    const steps = twoSumProblem.createSteps(input);

    const firstStore = steps.find((step) => step.id === "store-0");
    const secondStore = steps.find((step) => step.id === "store-1");

    expect(firstStore?.state.seen).toEqual({ "2": 0 });
    expect(secondStore?.state.seen).toEqual({ "2": 0, "7": 1 });
    expect(firstStore?.state.seen).not.toBe(secondStore?.state.seen);
  });

  it("does not mutate parsed arrays when generating traces", () => {
    const binaryInput = binarySearchProblem.parseInput(
      '{"nums":[1,3,5,7],"target":5}',
    );
    const binaryOriginal = [...binaryInput.nums];
    binarySearchProblem.createSteps(binaryInput);
    expect(binaryInput.nums).toEqual(binaryOriginal);

    const stockInput = bestTimeToBuySellStockProblem.parseInput("7, 1, 5, 3, 6, 4");
    const stockOriginal = [...stockInput.prices];
    bestTimeToBuySellStockProblem.createSteps(stockInput);
    expect(stockInput.prices).toEqual(stockOriginal);

    const subarrayInput = maximumSubarrayProblem.parseInput("-2, 1, -3, 4");
    const subarrayOriginal = [...subarrayInput.nums];
    maximumSubarrayProblem.createSteps(subarrayInput);
    expect(subarrayInput.nums).toEqual(subarrayOriginal);
  });
});


describe("Array visualization snapshots", () => {
  it("gives each Stock visualization step an independent array snapshot", () => {
    const stock = modularProblems.find((problem) => problem.id === "121");
    expect(stock).toBeDefined();

    const steps = stock!.run("7, 1, 5, 3");
    expect(steps.length).toBeGreaterThan(1);
    expect(steps[0].array).toEqual(steps[1].array);
    expect(steps[0].array).not.toBe(steps[1].array);
  });
});
