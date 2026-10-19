import { describe, expect, it } from "vitest";
import type { GraphInput, GraphState } from "../adapt-graph-problem.ts";
import { adaptGraphProblem } from "../adapt-graph-problem.ts";
import type { ProblemDefinition } from "../../engine/types.ts";

const input: GraphInput = {
  nodes: [
    { id: "a", value: 8 },
    { id: "b", value: 4 },
    { id: "c", value: 12 },
  ],
  edges: [["a", "b"], ["a", "c"]],
  startId: "a",
};

const definition: ProblemDefinition<GraphInput, number, GraphState> = {
  id: "graph-traversal-test",
  leetcodeNumber: 9999,
  title: "Graph Traversal Test",
  difficulty: "Easy",
  description: "Test fixture for the reusable graph adapter.",
  inputHint: "Provide nodes and edges as JSON.",
  defaultInput: JSON.stringify(input),
  bestCase: "O(V + E)",
  averageCase: "O(V + E)",
  worstCase: "O(V + E)",
  memoryNote: "The queue or stack can hold up to O(V) nodes.",
  examples: [{
    input: JSON.stringify(input),
    output: "3",
    explanation: "The fixture contains three nodes.",
  }],
  constraints: ["Node IDs must be unique."],
  tags: ["Graph"],
  pseudocode: ["Initialize traversal", "Visit connected nodes"],
  solutions: {
    Python: ["queue = [start]"],
    "C++": ["queue<int> q;"],
    Java: ["Queue<Integer> queue = new ArrayDeque<>();"],
  },
  complexity: {
    time: "O(V + E)",
    timeExplanation: "Each node and edge is visited at most once.",
    space: "O(V)",
    spaceExplanation: "The traversal structure stores discovered nodes.",
  },
  parseInput: (raw) => JSON.parse(raw) as GraphInput,
  solve: (value) => value.nodes.length,
  createSteps: (value) => {
    const snapshot = (currentNodeId: string | null, visited: string[], result: unknown): GraphState => ({
      nodes: value.nodes.map((node) => ({ ...node })),
      edges: value.edges.map(([from, to]) => [from, to] as [string, string]),
      currentNodeId,
      visited: [...visited],
      result,
      queue: ["b", "c"],
      pointers: { start: "a" },
    });

    return [
      {
        id: "initialize",
        codeLine: 1,
        pseudocodeLine: 1,
        title: "Initialize traversal",
        explanation: "Begin at the start node.",
        state: snapshot("a", [], null),
      },
      {
        id: "visit-a",
        codeLine: 2,
        pseudocodeLine: 2,
        title: "Visit node a",
        explanation: "Record the start node as visited.",
        state: snapshot("a", ["a"], 3),
      },
    ];
  },
};

describe("adaptGraphProblem", () => {
  it("adapts node and edge snapshots to the shared visualization contract", () => {
    const problem = adaptGraphProblem(definition, "graph");
    const steps = problem.run(JSON.stringify(input));

    expect(problem.parse(JSON.stringify(input)).array).toEqual([8, 4, 12]);
    expect(steps).toHaveLength(2);
    expect(steps[0]?.visualization?.items).toEqual([
      { id: "a", label: "a", value: "8", active: true },
      { id: "b", label: "b", value: "4", active: false },
      { id: "c", label: "c", value: "12", active: false },
    ]);
    expect(steps[0]?.visualization?.edges).toEqual([["a", "b"], ["a", "c"]]);
    expect(steps[0]?.visualization?.pointers).toEqual({ start: "a", current: "a" });
    expect(steps[1]?.memory).toEqual([{ label: "visited 1", value: "a: 8" }]);
    expect(steps[1]?.result).toBe("3");
  });

  it("rejects edges that reference missing nodes instead of rendering a misleading graph", () => {
    const invalidDefinition: ProblemDefinition<GraphInput, number, GraphState> = {
      ...definition,
      createSteps: (value) => [{
        id: "invalid-edge",
        codeLine: 1,
        pseudocodeLine: 1,
        title: "Invalid graph",
        explanation: "This snapshot references a missing endpoint.",
        state: {
          nodes: value.nodes.map((node) => ({ ...node })),
          edges: [["a", "missing"]],
          currentNodeId: "a",
          visited: [],
          result: null,
        },
      }],
    };

    expect(() => adaptGraphProblem(invalidDefinition, "graph").run(JSON.stringify(input)))
      .toThrow(/references a missing node/i);
  });

  it("supports tree as a visualization kind without a second adapter implementation", () => {
    expect(adaptGraphProblem(definition, "tree").visualization.kind).toBe("tree");
  });
});
