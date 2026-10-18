
export type Language = "Python" | "C++" | "Java";

export type Difficulty = "Easy" | "Medium" | "Hard";


export type ResultStatus = "success" | "failure" | "info";

export type VisualStep = {
  title: string;
  explanation: string;
  line: number;
  pseudocodeLine: number;
  currentIndex: number | null;
  array: number[];
  variables: { label: string; value: string }[];
  memory: { label: string; value: string }[];
  result: string | null;
  resultStatus?: ResultStatus;
  activeRange?: [number, number];
};


export type ParsedProblemInput = {
  array: number[];
  target?: number;
  text?: string;
};

export type Problem = {
  id: string;
  title: string;
  difficulty: Difficulty;
  category: string;
  description: string;
  inputHint: string;
  defaultInput: string;
  languages: Record<Language, string[]>;
  pseudocode: string[];

  parse: (input: string) => ParsedProblemInput;
  run: (input: string) => VisualStep[];

  time: string;
  space: string;
  timeWhy: string;
  spaceWhy: string;
  bestCase: string;
  averageCase: string;
  worstCase: string;
  memoryNote: string;
};


export type ExecutionStep<State> = {
  id: string;
  codeLine: number;
  pseudocodeLine: number;
  title: string;
  explanation: string;
  state: State;
};

export type ProblemExample = {
  input: string;
  output: string;
  explanation: string;
};

export type ProblemDefinition<Input, Output, State> = {
  id: string;
  leetcodeNumber: number;
  title: string;
  difficulty: Difficulty;
  description: string;
  examples: ProblemExample[];
  constraints: string[];
  tags: string[];
  pseudocode: string[];

  solutions: Record<Language, string[]>;

  complexity: {
    time: string;
    timeExplanation: string;
    space: string;
    spaceExplanation: string;
  };

  parseInput: (rawInput: string) => Input;
  solve: (input: Input) => Output;
  createSteps: (input: Input) => ExecutionStep<State>[];
};
