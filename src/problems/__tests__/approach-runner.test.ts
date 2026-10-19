import { describe, expect, it } from "vitest";
import { getBruteForceSteps } from "../approach-runner.ts";

describe("baseline approach traces", () => {
  it("reads JSON arrays and targets without treating object fields as numbers", () => {
    const steps = getBruteForceSteps(
      "1",
      '{"nums":[2,7,11,15],"target":9}',
    );

    expect(steps.at(-1)?.result).toBe("[0, 1]");
    expect(steps[0]?.array).toEqual([2, 7, 11, 15]);
    expect(steps[0]?.variables).toContainEqual({ label: "sum", value: "9" });
  });

  it("accepts JSON target inputs for the linear-search baseline", () => {
    const steps = getBruteForceSteps(
      "704",
      '{"nums":[-1,0,3,5,9,12],"target":9}',
    );

    expect(steps.at(-1)?.result).toBe("4");
    expect(steps.at(-1)?.currentIndex).toBe(4);
  });

  it("keeps the original input array fixed while collecting unique values", () => {
    const input = [0, 0, 1, 1, 2, 3, 3];
    const steps = getBruteForceSteps("26", input.join(", "));

    expect(steps.slice(0, -1).every((step) => step.array === input || (
      step.array.length === input.length &&
      step.array.every((value, index) => value === input[index])
    ))).toBe(true);
    expect(steps.at(-1)?.result).toBe("4");
    expect(steps.at(-1)?.array).toEqual(input);
    expect(steps.at(-1)?.memory.map((item) => item.value)).toEqual(["0", "1", "2", "3"]);
  });

  it("records nonzero values incrementally for Move Zeroes", () => {
    const steps = getBruteForceSteps("283", "0, 1, 0, 3, 12");

    expect(steps[0]?.memory.map((item) => item.value)).toEqual([]);
    expect(steps[1]?.memory.map((item) => item.value)).toEqual(["1"]);
    expect(steps[3]?.memory.map((item) => item.value)).toEqual(["1", "3"]);
    expect(steps.at(-1)?.array).toEqual([1, 3, 12, 0, 0]);
    expect(steps.at(-1)?.result).toBe("[1,3,12,0,0]");
  });

  it.each([
    ["()", "true"],
    ["([])", "true"],
    ["([)]", "false"],
    ["(]", "false"],
    ["", "false"],
  ])("reduces bracket pairs correctly for %j", (input, expected) => {
    const steps = getBruteForceSteps("20", input);
    expect(steps.at(-1)?.result).toBe(expected);
  });

  it("builds the reversed linked-list result in traversal order", () => {
    const steps = getBruteForceSteps("206", "1, 2, 3, 4");

    expect(steps[0]?.array).toEqual([1, 2, 3, 4]);
    expect(steps.at(-1)?.array).toEqual([4, 3, 2, 1]);
    expect(steps.at(-1)?.result).toBe("[4,3,2,1]");
  });
});
