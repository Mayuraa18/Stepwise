import type {
  Problem,
  ProblemDefinition,
} from "../engine/types.ts";
import { createVisualTrace } from "../engine/trace.ts";

type StringInput = {
  text: string;
};

type StringState = {
  text: string;
  currentIndex: number | null;
  character: string | null;
  stack: string[];
  result: boolean | null;
};

export function adaptStringProblem<
  Input extends StringInput,
  Output,
  State extends StringState,
>(
  definition: ProblemDefinition<Input, Output, State>,
): Problem {
  function parse(rawInput: string) {
    const input = definition.parseInput(rawInput);

    return {
      array: Array.from(input.text).map((character) =>
        character.charCodeAt(0),
      ),
      text: input.text,
    };
  }

  function run(rawInput: string) {
    const input = definition.parseInput(rawInput);

    return createVisualTrace(definition.createSteps(input), {
      getArray: (state) =>
        Array.from(state.text).map((character) =>
          character.charCodeAt(0),
        ),

      getCurrentIndex: (state) => state.currentIndex,

      getVariables: (state) => [
        ...(state.character !== null
          ? [{ label: "Character", value: state.character }]
          : []),
        ...(state.currentIndex !== null
          ? [{
              label: "Position",
              value: String(state.currentIndex),
            }]
          : []),
      ],

      getMemory: (state) =>
        state.stack.map((character, index) => ({
          label: `Stack ${index + 1}`,
          value: character,
        })),

      getStack: (state) => [...state.stack],

      getResult: (state) =>
        state.result === null
          ? null
          : state.result
            ? "Valid bracket sequence"
            : "Invalid bracket sequence",

      getResultStatus: (state) =>
        state.result === null
          ? "info"
          : state.result
            ? "success"
            : "failure",
    });
  }

  return {
    id: String(definition.leetcodeNumber),
    title: definition.title,
    difficulty: definition.difficulty,
    category: definition.tags.join(", "),
    visualization: {
      kind: "string",
      inputLabel: "Bracket input · original string",
      stateLabel: "Stack · last in, first out",
      emptyStateLabel: "Stack is empty",
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
