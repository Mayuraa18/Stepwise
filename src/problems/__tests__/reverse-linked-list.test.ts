
import { describe, expect, it } from "vitest";
import { reverseLinkedListProblem } from "../reverse-linked-list.ts";

describe("Reverse Linked List", () => {
  it("reverses a multi-node list", () => {
    const input = reverseLinkedListProblem.parseInput("1, 2, 3, 4, 5");
    const steps = reverseLinkedListProblem.createSteps(input);
    const finalStep = steps.at(-1);

    expect(reverseLinkedListProblem.solve(input)).toEqual([5, 4, 3, 2, 1]);
    expect(finalStep?.state.result).toEqual([5, 4, 3, 2, 1]);
    expect(finalStep?.state.nodes.map((node) => node.value)).toEqual([
      1, 2, 3, 4, 5,
    ]);

    const reversedNodes = finalStep!.state.nodes;
    expect(reversedNodes.map((node) => node.nextId)).toEqual([
      null, "node-0", "node-1", "node-2", "node-3",
    ]);
  });

  it("handles a single-node list", () => {
    const input = reverseLinkedListProblem.parseInput("7");
    const steps = reverseLinkedListProblem.createSteps(input);

    expect(steps.at(-1)?.state.result).toEqual([7]);
    expect(steps.at(-1)?.state.nodes).toEqual([
      { id: "node-0", value: 7, nextId: null },
    ]);
  });

  it("preserves the saved next pointer during each reversal step", () => {
    const input = reverseLinkedListProblem.parseInput("10, 20, 30");
    const steps = reverseLinkedListProblem.createSteps(input);
    const firstReversal = steps.find((step) => step.id === "reverse-0");

    expect(firstReversal?.state.previousId).toBe("node-0");
    expect(firstReversal?.state.currentId).toBe("node-1");
    expect(firstReversal?.state.nextId).toBe("node-1");
    expect(
      firstReversal?.state.nodes.find((node) => node.id === "node-0")?.nextId,
    ).toBeNull();
  });

  it("rejects empty input and invalid values", () => {
    expect(() => reverseLinkedListProblem.parseInput("")).toThrow();
    expect(() => reverseLinkedListProblem.parseInput("1, nope, 3")).toThrow();
    expect(() => reverseLinkedListProblem.parseInput("1.5, 2")).toThrow();
  });
});
