
import type {
  Problem,
  ProblemDefinition,
  VisualStep,
} from "../engine/types.ts";

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
        character.charCodeAt(0)
      ),
      text: input.text,
    };
  }

  function run(rawInput: string): VisualStep[] {
    const input = definition.parseInput(rawInput);

    return definition.createSteps(input).map(({ state, ...step }) => {
      const variables: { label: string; value: string }[] = [];

      if (state.character !== null) {
        variables.push({
          label: "Character",
          value: state.character,
        });
      }

      if (state.currentIndex !== null) {
        variables.push({
          label: "Position",
          value: String(state.currentIndex),
        });
      }

      return {
        title: step.title,
        explanation: step.explanation,
        line: step.codeLine,
        pseudocodeLine: step.pseudocodeLine,
        currentIndex: state.currentIndex,
        array: Array.from(state.text).map((character) =>
          character.charCodeAt(0)
        ),
        variables,
        
        memory: state.stack.map((character, index) => ({
          label: `Stack ${index + 1}`,
          value: character,
        })),
        result:
          state.result === null
            ? null
            : state.result
              ? "Valid bracket sequence"
              : "Invalid bracket sequence",
        resultStatus:
          state.result === null
            ? "info"
            : state.result
              ? "success"
              : "failure",
      };
    });
  }

  return {
    id: String(definition.leetcodeNumber),
    title: definition.title,
    difficulty: definition.difficulty,
    category: definition.tags.join(", "),
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
