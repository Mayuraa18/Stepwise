import { describe, expect, it } from "vitest";
import { moveZeroesProblem } from "../array-batch.ts";

describe("Move Zeroes synchronized trace", () => {
  it("shows inspection, movement, and write-pointer advancement as separate steps", () => {
    const steps = moveZeroesProblem.createSteps(
      moveZeroesProblem.parseInput("0, 1, 0, 3, 12"),
    );

    expect(steps.map((step) => step.id)).toContain("inspect-1");
    expect(steps.map((step) => step.id)).toContain("place-1");
    expect(steps.map((step) => step.id)).toContain("advance-1");

    const inspect = steps.find((step) => step.id === "inspect-1");
    const place = steps.find((step) => step.id === "place-1");
    const advance = steps.find((step) => step.id === "advance-1");

    expect(inspect?.codeLine).toBe(3);
    expect(inspect?.pseudocodeLine).toBe(1);
    expect(inspect?.state.nums).toEqual([0, 1, 0, 3, 12]);
    expect(place?.codeLine).toBe(5);
    expect(place?.pseudocodeLine).toBe(2);
    expect(place?.state.nums).toEqual([1, 0, 0, 3, 12]);
    expect(place?.state.writeIndex).toBe(0);
    expect(place?.state.arrayItemIds).toEqual(["item-1", "item-0", "item-2", "item-3", "item-4"]);
    expect(advance?.codeLine).toBe(6);
    expect(advance?.pseudocodeLine).toBe(2);
    expect(advance?.state.writeIndex).toBe(1);
    expect(advance?.state.nums).toEqual([1, 0, 0, 3, 12]);
  });

  it("explains skipped zeros without moving the write pointer", () => {
    const steps = moveZeroesProblem.createSteps(
      moveZeroesProblem.parseInput("0, 1, 0"),
    );
    const zero = steps.find((step) => step.id === "zero-2");

    expect(zero?.state.nums).toEqual([1, 0, 0]);
    expect(zero?.state.writeIndex).toBe(1);
    expect(zero?.explanation).toContain("write stays at 1");
  });

  it("preserves stable non-zero order and reaches the correct final state", () => {
    const input = moveZeroesProblem.parseInput("0, 1, 0, 3, 12");
    const original = [...input.nums];
    const steps = moveZeroesProblem.createSteps(input);
    const finalStep = steps.at(-1);

    expect(input.nums).toEqual(original);
    expect(finalStep?.id).toBe("complete");
    expect(finalStep?.state.nums).toEqual([1, 3, 12, 0, 0]);
    expect(finalStep?.state.result).toEqual([1, 3, 12, 0, 0]);
    expect(new Set(steps.map((step) => step.id)).size).toBe(steps.length);
  });

  it("handles arrays that need no movement", () => {
    const steps = moveZeroesProblem.createSteps(
      moveZeroesProblem.parseInput("1, 2, 3"),
    );

    expect(steps.at(-1)?.state.nums).toEqual([1, 2, 3]);
    expect(steps.find((step) => step.id === "place-0")?.title)
      .toBe("Keep 1 at index 0");
  });
});
