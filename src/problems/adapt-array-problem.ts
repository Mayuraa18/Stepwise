
import type {
  Problem,
  ProblemDefinition,
  VisualStep,
} from "../engine/types.ts";

type ArrayInput = {
  prices: number[];
};

type ArrayState = {
  prices: number[];
  currentIndex: number | null;
  result: unknown;
  [key: string]: unknown;
};

export function adaptArrayProblem<
  Input extends ArrayInput,
  Output,
  State extends ArrayState,
>(
  definition: ProblemDefinition<Input, Output, State>
): Problem {
  function parse(rawInput: string) {
    const input = definition.parseInput(rawInput);

    return {
      array: [...input.prices],
      text: rawInput,
    };
  }

  function run(rawInput: string): VisualStep[] {
    const input = definition.parseInput(rawInput);

    return definition.createSteps(input).map(({ state, ...step }) => {
      const variables: { label: string; value: string }[] = [];
      const memory: { label: string; value: string }[] = [];

      for (const [key, value] of Object.entries(state)) {
        if (key === "prices" || key === "result") continue;

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

      return {
        title: step.title,
        explanation: step.explanation,
        line: step.codeLine,
        pseudocodeLine: step.pseudocodeLine,
        currentIndex: state.currentIndex,
        array: [...state.prices],
        variables,
        memory,
        result:
          state.result == null
            ? null
            : typeof state.result === "string"
              ? state.result
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
    inputHint: "Daily prices separated by commas",
    defaultInput: "7, 1, 5, 3, 6, 4",
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
