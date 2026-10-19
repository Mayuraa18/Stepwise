import type {
  Problem,
  ProblemDefinition,
} from "../engine/types.ts";
import { createVisualTrace, formatTraceValue } from "../engine/trace.ts";

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
      array: [...getArray(input)],
      text: rawInput,
    };
  }

  function run(rawInput: string) {
    const input = definition.parseInput(rawInput);
    const inputArray = getArray(input);

    return createVisualTrace(definition.createSteps(input), {
      getArray: (state) => state.nums ?? state.prices ?? inputArray,
      getCurrentIndex: (state) => state.currentIndex,
      getVariables: (state) =>
        Object.entries(state)
          .filter(
            ([key, value]) =>
              !["prices", "nums", "result"].includes(key) &&
              (typeof value === "string" ||
                typeof value === "number" ||
                typeof value === "boolean" ||
                value === null),
          )
          .map(([label, value]) => ({
            label,
            value: formatTraceValue(value),
          })),
      getMemory: (state) => {
        const seen = state.seen;

        if (!Array.isArray(seen)) {
          return [];
        }

        return seen.map((value, index) => ({
          label: `Set ${index + 1}`,
          value: formatTraceValue(value),
        }));
      },
      getResult: (state) => state.result,
      getVisualization: (state) => {
        const ids = state.arrayItemIds;
        if (!Array.isArray(ids) || ids.length !== getArray(state).length) {
          return {};
        }

        const pointerData = state.pointers;
        return {
          items: getArray(state).map((value, index) => ({
            id: String(ids[index]),
            label: `index ${index}`,
            value: String(value),
            active: state.currentIndex === index,
          })),
          ...(pointerData && typeof pointerData === "object"
            ? { pointers: pointerData as Record<string, string | number | null> }
            : {}),
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
      kind: "array",
      inputLabel: "Input array",
      stateLabel: "Algorithm state",
      emptyStateLabel: "No extra data structure",
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
