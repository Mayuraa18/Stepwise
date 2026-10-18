
import type {
  Problem,
  ProblemDefinition,
  ParsedProblemInput,
  VisualStep,
} from "../engine/types.ts";

type TwoSumInput = {
  nums: number[];
  target: number;
};

type TwoSumStateShape = {
  nums: number[];
  target: number;
  currentIndex: number | null;
  currentValue: number | null;
  complement: number | null;
  seen: Record<string, number>;
  result: number[] | null;
};

function normalizeInput(rawInput: string): string {
  const input = rawInput.trim();

  // Also accept the JSON format used by the new problem module.
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
  Input extends TwoSumInput,
  State extends TwoSumStateShape,
>(
  definition: ProblemDefinition<Input, number[], State>
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

      const variables: { label: string; value: string }[] = [
        { label: "Target", value: String(state.target) },
      ];

      if (state.currentIndex !== null) {
        variables.push({
          label: "Current index",
          value: String(state.currentIndex),
        });
      }

      if (state.currentValue !== null) {
        variables.push({
          label: "Current value",
          value: String(state.currentValue),
        });
      }

      if (state.complement !== null) {
        variables.push({
          label: "Complement",
          value: String(state.complement),
        });
      }

      return {
        title: executionStep.title,
        explanation: executionStep.explanation,
        line: executionStep.codeLine,
        pseudocodeLine: executionStep.pseudocodeLine,
        currentIndex: state.currentIndex,
        array: [...state.nums],
        variables,
        memory: Object.entries(state.seen).map(([number, index]) => ({
          label: number,
          value: String(index),
        })),
        result:
          state.result === null
            ? null
            : JSON.stringify(state.result),
      };
    });
  }

  return {
    id: String(definition.leetcodeNumber),
    title: definition.title,
    difficulty: definition.difficulty,
    category: definition.tags.join(", "),
    description: definition.description,
    inputHint:
      "Array values, then target (example: 2, 7, 11, 15; target: 9)",
    defaultInput: "2, 7, 11, 15; target: 9",
    languages: definition.solutions,
    pseudocode: definition.pseudocode,
    parse,
    run,
    time: definition.complexity.time,
    space: definition.complexity.space,
    timeWhy: definition.complexity.timeExplanation,
    spaceWhy: definition.complexity.spaceExplanation,
    bestCase: "O(1) when a matching pair is found early.",
    averageCase: definition.complexity.time,
    worstCase: "O(n) when the array must be scanned.",
    memoryNote: definition.complexity.spaceExplanation,
  };
}
