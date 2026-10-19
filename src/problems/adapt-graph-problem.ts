import type {
  ExecutionStep,
  Problem,
  ProblemDefinition,
  VisualizationKind,
} from "../engine/types.ts";
import { createVisualTrace, formatTraceValue } from "../engine/trace.ts";

export type GraphNode = {
  id: string;
  value: number;
};

export type GraphEdge = [from: string, to: string];

export type GraphInput = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  startId?: string;
  targetId?: string;
};

export type GraphState = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  currentNodeId: string | null;
  visited: string[];
  result: unknown;
  queue?: string[];
  stack?: string[];
  pointers?: Record<string, string | number | null>;
};

const isGraphKind = (kind: VisualizationKind): kind is "tree" | "graph" =>
  kind === "tree" || kind === "graph";

function validateSnapshot(state: GraphState): void {
  const ids = new Set<string>();

  for (const node of state.nodes) {
    if (!node.id.trim()) {
      throw new Error("Graph visualization nodes must have a non-empty id.");
    }
    if (ids.has(node.id)) {
      throw new Error(`Graph visualization contains duplicate node id "${node.id}".`);
    }
    ids.add(node.id);
  }

  for (const [from, to] of state.edges) {
    if (!ids.has(from) || !ids.has(to)) {
      throw new Error(`Graph visualization edge "${from} → ${to}" references a missing node.`);
    }
  }

  if (state.currentNodeId !== null && !ids.has(state.currentNodeId)) {
    throw new Error(`Current node "${state.currentNodeId}" is missing from the graph snapshot.`);
  }
}

/**
 * Adapts tree/graph algorithm definitions to the shared trace and visualization
 * contracts. Problem-specific code only needs to produce immutable state snapshots.
 */
export function adaptGraphProblem<
  Input extends GraphInput,
  Output,
  State extends GraphState,
>(
  definition: ProblemDefinition<Input, Output, State>,
  kind: "tree" | "graph",
): Problem {
  if (!isGraphKind(kind)) {
    throw new Error("Graph adapter requires a tree or graph visualization kind.");
  }

  function parse(rawInput: string) {
    const input = definition.parseInput(rawInput);
    return {
      array: input.nodes.map((node) => node.value),
      text: rawInput,
    };
  }

  function run(rawInput: string) {
    const input = definition.parseInput(rawInput);

    return createVisualTrace(definition.createSteps(input), {
      getArray: (state) => state.nodes.map((node) => node.value),
      getCurrentIndex: (state) =>
        state.currentNodeId === null
          ? null
          : state.nodes.findIndex((node) => node.id === state.currentNodeId),
      getVariables: (state) => [
        { label: "current", value: state.currentNodeId ?? "null" },
        { label: "visited", value: String(state.visited.length) },
        ...(state.queue ? [{ label: "queue size", value: String(state.queue.length) }] : []),
        ...(state.stack ? [{ label: "stack size", value: String(state.stack.length) }] : []),
      ],
      getMemory: (state) => state.visited.map((id, index) => {
        const node = state.nodes.find((item) => item.id === id);
        return {
          label: `visited ${index + 1}`,
          value: node ? `${node.id}: ${node.value}` : id,
        };
      }),
      getResult: (state) => state.result,
      getStack: (state) => state.stack,
      getVisualization: (state) => {
        validateSnapshot(state);
        return {
          items: state.nodes.map((node) => ({
            id: node.id,
            label: node.id,
            value: String(node.value),
            active: node.id === state.currentNodeId,
          })),
          edges: state.edges.map(([from, to]) => [from, to] as [string, string]),
          pointers: {
            ...(state.pointers ?? {}),
            current: state.currentNodeId,
          },
        };
      },
    });
  }

  return {
    id: String(definition.leetcodeNumber),
    title: definition.title,
    difficulty: definition.difficulty,
    category: definition.tags.join(", "),
    visualization: {
      kind,
      inputLabel: "Input nodes",
      stateLabel: kind === "tree" ? "Tree state" : "Graph state",
      emptyStateLabel: kind === "tree" ? "Tree is empty" : "Graph is empty",
    },
    description: definition.description,
    inputHint: definition.inputHint,
    defaultInput: definition.defaultInput,
    languages: definition.solutions,
    pseudocode: definition.pseudocode,
    parse,
    run,
    time: definition.complexity.time,
    space: definition.complexity.space,
    timeWhy: definition.complexity.timeExplanation,
    spaceWhy: definition.complexity.spaceExplanation,
    bestCase: definition.bestCase,
    averageCase: definition.averageCase,
    worstCase: definition.worstCase,
    memoryNote: definition.memoryNote,
  };
}
