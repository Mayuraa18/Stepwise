import { describe, expect, it } from "vitest";
import { createVisualTrace } from "../trace.ts";
import type { ExecutionStep } from "../types.ts";

type State = {
  array: number[];
  currentIndex: number | null;
  result: string | null;
};

function createStep(state: State): ExecutionStep<State> {
  return {
    id: "step-1",
    codeLine: 1,
    pseudocodeLine: 1,
    title: "Inspect state",
    explanation: "Inspect the current algorithm state.",
    state,
  };
}

const baseOptions = {
  getArray: (state: State) => state.array,
  getCurrentIndex: (state: State) => state.currentIndex,
  getVariables: () => [],
  getMemory: () => [],
  getResult: (state: State) => state.result,
};

describe("createVisualTrace", () => {
  it("preserves default array visualization data", () => {
    const [step] = createVisualTrace(
      [
        createStep({
          array: [10, 20, 30],
          currentIndex: 1,
          result: null,
        }),
      ],
      baseOptions,
    );

    expect(step.array).toEqual([10, 20, 30]);
    expect(step.visualization?.items).toEqual([
      { id: "item-0", label: "index 0", value: "10", active: false },
      { id: "item-1", label: "index 1", value: "20", active: true },
      { id: "item-2", label: "index 2", value: "30", active: false },
    ]);
  });

  it("supports custom nodes, edges, and pointers", () => {
    const [step] = createVisualTrace(
      [
        createStep({
          array: [],
          currentIndex: null,
          result: null,
        }),
      ],
      {
        ...baseOptions,
        getVisualization: () => ({
          items: [
            { id: "root", label: "Root", value: "8" },
            { id: "left", label: "Left child", value: "4" },
          ],
          edges: [["root", "left"]],
          pointers: { root: "left", current: "root" },
        }),
      },
    );

    expect(step.visualization?.items).toEqual([
      { id: "root", label: "Root", value: "8" },
      { id: "left", label: "Left child", value: "4" },
    ]);
    expect(step.visualization?.edges).toEqual([["root", "left"]]);
    expect(step.visualization?.pointers).toEqual({
      root: "left",
      current: "root",
    });
  });

  it("preserves default entries when custom visualization data is added", () => {
    const [step] = createVisualTrace(
      [
        createStep({
          array: [5],
          currentIndex: 0,
          result: null,
        }),
      ],
      {
        ...baseOptions,
        getMemory: () => [{ label: "visited", value: "true" }],
        getVisualization: () => ({
          edges: [["item-0", "item-1"]],
        }),
      },
    );

    expect(step.visualization?.items).toHaveLength(1);
    expect(step.visualization?.entries).toEqual([
      { id: "entry-0", label: "visited", value: "true" },
    ]);
    expect(step.visualization?.edges).toEqual([["item-0", "item-1"]]);
  });

  it("allows custom items to replace the default array items", () => {
    const [step] = createVisualTrace(
      [
        createStep({
          array: [100, 200],
          currentIndex: 0,
          result: null,
        }),
      ],
      {
        ...baseOptions,
        getVisualization: () => ({
          items: [{ id: "node-a", label: "Node A", value: "A" }],
        }),
      },
    );

    expect(step.array).toEqual([100, 200]);
    expect(step.visualization?.items).toEqual([
      { id: "node-a", label: "Node A", value: "A" },
    ]);
  });
});
