
import type {
  Problem,
  ProblemDefinition,
  VisualStep,
} from "../engine/types.ts";

type ArrayInput = {
  prices?: number[];
  nums?: number[];
};

type ArrayState = {
  prices?: number[];
  nums?: number[];
  currentIndex: number | null;
  result: unknown;
  [key: string]: unknown;
};

function getArray(value: ArrayInput): number[] {
  const values = value.prices ?? value.nums;

  if (!values) {
    throw new Error("This problem did not provide an input array.");
  }

  return values;
}

export function adaptArrayProblem<
  Input extends ArrayInput,
  Output,
  State extends ArrayState,
>(
  definition: ProblemDefinition<Input, Output, State>,
): Problem {
  function parse(rawInput: string) {
    const input = definition.parseInput(rawInput);

    return {
      array: getArray(input),
      text: rawInput,
    };
  }

  function run(rawInput: string): VisualStep[] {
    const input = definition.parseInput(rawInput);
    const inputArray = getArray(input);

    return definition.createSteps(input).map(({ state, ...step }) => {
      const variables: { label: string; value: string }[] = [];
      const memory: { label: string; value: string }[] = [];

      for (const [key, value] of Object.entries(state)) {
        if (
          key === "prices" ||
          key === "nums" ||
          key === "result"
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

      const result = state.result;

      return {
        title: step.title,
        explanation: step.explanation,
        line: step.codeLine,
        pseudocodeLine: step.pseudocodeLine,
        currentIndex: state.currentIndex,
        array: inputArray,
        variables,
        memory,
                result:
          result == null
            ? null
            : typeof result === "string"
              ? result
              : JSON.stringify(result),
        resultStatus:
          result == null
            ? "info"
            : typeof result === "boolean"
              ? result
                ? "success"
                : "failure"
              : "success",
      };
    });
  }

  const isStockProblem = definition.leetcodeNumber === 121;

  return {
    id: String(definition.leetcodeNumber),
    title: definition.title,
    difficulty: definition.difficulty,
    category: definition.tags.join(", "),
    description: definition.description,
    inputHint: isStockProblem
      ? "Daily prices separated by commas"
      : "Array values separated by commas",
    defaultInput: isStockProblem
      ? "7, 1, 5, 3, 6, 4"
      : "-2, 1, -3, 4, -1, 2, 1, -5, 4",
    languages: definition.solutions,
    pseudocode: definition.pseudocode,
    parse,
    run,
    time: definition.complexity.time,
    space: definition.complexity.space,
    timeWhy: definition.complexity.timeExplanation,
    spaceWhy: definition.complexity.spaceExplanation,
    bestCase: definition.complexity.time,
    averageCase: definition.complexity.time,
    worstCase: definition.complexity.time,
    memoryNote: definition.complexity.spaceExplanation,
  };
}
