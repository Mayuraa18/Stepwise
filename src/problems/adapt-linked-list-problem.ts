import type {
  Problem,
  ProblemDefinition,
} from "../engine/types.ts";
import { createVisualTrace } from "../engine/trace.ts";

type LinkedListInput = {
  values: number[];
};

type LinkedListNode = {
  id: string;
  value: number;
  nextId: string | null;
};

type LinkedListState = {
  values: number[];
  nodes: LinkedListNode[];
  previousId: string | null;
  currentId: string | null;
  nextId: string | null;
  currentIndex: number | null;
  result: number[] | null;
};

export function adaptLinkedListProblem<
  Input extends LinkedListInput,
  Output,
  State extends LinkedListState,
>(
  definition: ProblemDefinition<Input, Output, State>,
): Problem {
  function parse(rawInput: string) {
    const input = definition.parseInput(rawInput);

    return {
      array: [...input.values],
      text: rawInput,
    };
  }

  function run(rawInput: string) {
    const input = definition.parseInput(rawInput);

    return createVisualTrace(definition.createSteps(input), {
      getArray: (state) => state.values,
      getCurrentIndex: (state) => state.currentIndex,
      getVariables: (state) => [
        {
          label: "previous",
          value: state.previousId ?? "null",
        },
        {
          label: "current",
          value: state.currentId ?? "null",
        },
        {
          label: "next",
          value: state.nextId ?? "null",
        },
      ],
      getMemory: (state) =>
        state.nodes.map((node) => ({
          label: node.id,
          value: `value=${node.value}, next=${node.nextId ?? "null"}`,
        })),
      getResult: (state) => state.result,
      getVisualization: (state) => ({
        items: state.nodes.map((node) => ({
          id: node.id,
          label: node.id,
          value: String(node.value),
          active: node.id === state.currentId,
        })),
        edges: state.nodes.flatMap((node) =>
          node.nextId === null
            ? []
            : [[node.id, node.nextId] as [string, string]],
        ),
        pointers: {
          previous: state.previousId,
          current: state.currentId,
          next: state.nextId,
        },
      }),
    });
  }

  return {
    id: String(definition.leetcodeNumber),
    title: definition.title,
    difficulty: definition.difficulty,
    category: definition.tags.join(", "),
    visualization: {
      kind: "linked-list",
      inputLabel: "Linked-list values",
      stateLabel: "Nodes · next connections · pointers",
      emptyStateLabel: "The linked list is empty",
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
