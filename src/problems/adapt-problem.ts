import type {
  Problem,
  ProblemDefinition,
  ParsedProblemInput,
} from "../engine/types.ts";
import { createVisualTrace, formatTraceValue } from "../engine/trace.ts";

type ArrayTargetInput = {
  nums: number[];
  target: number;
};

type AdaptableState = {
  nums: number[];
  target: number;
  currentIndex: number | null;
  result: unknown;
  [key: string]: unknown;
};

function normalizeInput(rawInput: string): string {
  const input = rawInput.trim();

  if (input.startsWith("{")) {
    return input;
  }

  const targetMatch = input.match(
    /target\s*:\s*(-?\d+(?:\.\d+)?)/i,
  );

  if (!targetMatch) {
    throw new Error(
      "Include a target, e.g. 2, 7, 11, 15; target: 9.",
    );
  }

  const arrayText = input
    .replace(/;?\s*target\s*:\s*-?\d+(?:\.\d+)?/i, "")
    .trim();

  const nums = arrayText
    .split(/[,\s]+/)
    .filter(Boolean)
    .map(Number);

  if (
    nums.length === 0 ||
    nums.some((value) => !Number.isFinite(value))
  ) {
    throw new Error(
      "Enter valid numbers separated by commas or spaces.",
    );
  }

  return JSON.stringify({
    nums,
    target: Number(targetMatch[1]),
  });
}

export function adaptProblem<
  Input extends ArrayTargetInput,
  Output,
  State extends AdaptableState,
>(
  definition: ProblemDefinition<Input, Output, State>,
): Problem {
  function parse(rawInput: string): ParsedProblemInput {
    const input = definition.parseInput(normalizeInput(rawInput));

    return {
      array: [...input.nums],
      target: input.target,
      text: rawInput,
    };
  }

  function run(rawInput: string) {
    const input = definition.parseInput(normalizeInput(rawInput));

    return createVisualTrace(definition.createSteps(input), {
      getArray: (state) => state.nums,
      getCurrentIndex: (state) => state.currentIndex,
      getVariables: (state) =>
        Object.entries(state)
          .filter(
            ([key, value]) =>
              !["nums", "result", "seen"].includes(key) &&
              (typeof value === "string" ||
                typeof value === "number" ||
                typeof value === "boolean" ||
                value === null),
          )
          .map(([label, value]) => ({
            label,
            value: formatTraceValue(value),
          })),
      getMemory: (state) =>
        typeof state.seen === "object" && state.seen !== null
          ? Object.entries(state.seen).map(([label, value]) => ({
              label,
              value: formatTraceValue(value),
            }))
          : [],
      getResult: (state) => state.result,
      getActiveRange: (state) =>
        typeof state.left === "number" &&
        typeof state.right === "number"
          ? [state.left, state.right]
          : undefined,
    });
  }

  return {
    id: String(definition.leetcodeNumber),
    title: definition.title,
    difficulty: definition.difficulty,
    category: definition.tags.join(", "),
    visualization: {
      kind: "array",
      inputLabel: "Input array",
      stateLabel:
        definition.id === "two-sum"
          ? "Hash map · value → index"
          : "Algorithm state",
      emptyStateLabel:
        definition.id === "two-sum"
          ? "Empty map"
          : "No extra data structure",
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
