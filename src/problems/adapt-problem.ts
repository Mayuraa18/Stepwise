
import type {
  Problem,
  ProblemDefinition,
  ParsedProblemInput,
  VisualStep,
} from "../engine/types.ts";

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
    /target\s*:\s*(-?\d+(?:\.\d+)?)/i
  );

  if (!targetMatch) {
    throw new Error(
      "Include a target, e.g. 2, 7, 11, 15; target: 9."
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
      "Enter valid numbers separated by commas or spaces."
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
  definition: ProblemDefinition<Input, Output, State>
): Problem {
  function parse(rawInput: string): ParsedProblemInput {
    const input = definition.parseInput(normalizeInput(rawInput));

    return {
      array: [...input.nums],
      target: input.target,
      text: rawInput,
    };
  }

  function run(rawInput: string): VisualStep[] {
    const input = definition.parseInput(normalizeInput(rawInput));

    return definition.createSteps(input).map((executionStep) => {
      const state = executionStep.state;
      const variables: { label: string; value: string }[] = [];
      const memory: { label: string; value: string }[] = [];

      for (const [key, value] of Object.entries(state)) {
        if (
          key === "nums" ||
          key === "result" ||
          key === "seen"
        ) {
          continue;
        }

        if (
          typeof value === "string" ||
          typeof value === "number" ||
          typeof value === "boolean" ||
          value === null
        ) {
          variables.push({
            label: key,
            value: value === null ? "null" : String(value),
          });
        }
      }

      if (
        typeof state.seen === "object" &&
        state.seen !== null
      ) {
        for (const [key, value] of Object.entries(state.seen)) {
          memory.push({
            label: key,
            value: String(value),
          });
        }
      }

      const result = state.result;

      return {
        title: executionStep.title,
        explanation: executionStep.explanation,
        line: executionStep.codeLine,
        pseudocodeLine: executionStep.pseudocodeLine,
        currentIndex: state.currentIndex,
        array: [...state.nums],
        variables,
        memory,
        result:
          result === null || result === undefined
            ? null
            : typeof result === "string"
              ? result
              : JSON.stringify(result),
        ...(Array.isArray(state.nums) &&
        typeof state.left === "number" &&
        typeof state.right === "number"
          ? { activeRange: [state.left, state.right] as [number, number] }
          : {}),
      };
    });
  }

  return {
    id: String(definition.leetcodeNumber),
    title: definition.title,
    difficulty: definition.difficulty,
    category: definition.tags.join(", "),
    description: definition.description,
    inputHint: definition.leetcodeNumber === 704
      ? "Sorted array, then target (example: -1, 0, 3, 5, 9, 12; target: 9)"
      : "Array values, then target (example: 2, 7, 11, 15; target: 9)",
    defaultInput: definition.leetcodeNumber === 704
      ? "-1, 0, 3, 5, 9, 12; target: 9"
      : "2, 7, 11, 15; target: 9",
    languages: definition.solutions,
    pseudocode: definition.pseudocode,
    parse,
    run,
    time: definition.complexity.time,
    space: definition.complexity.space,
    timeWhy: definition.complexity.timeExplanation,
    spaceWhy: definition.complexity.spaceExplanation,
    bestCase: definition.leetcodeNumber === 704
      ? "O(1) when the target is at the middle index."
      : "O(n) in the worst case for a hash-map search.",
    averageCase: definition.complexity.time,
    worstCase: definition.complexity.time,
    memoryNote: definition.complexity.spaceExplanation,
  };
}
