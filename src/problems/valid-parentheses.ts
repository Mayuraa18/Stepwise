
import type {
  ExecutionStep,
  ProblemDefinition,
} from "../engine/types.ts";

type ParenthesesInput = {
  text: string;
};

type ParenthesesState = {
  text: string;
  currentIndex: number | null;
  character: string | null;
  stack: string[];
  result: boolean | null;
};

const MAX_INPUT_LENGTH = 200;

function parseInput(rawInput: string): ParenthesesInput {
  const text = rawInput.trim();

  if (text.length === 0) {
    throw new Error("Enter a bracket string.");
  }

  if (text.length > MAX_INPUT_LENGTH) {
    throw new Error(
      `Keep the bracket string to ${MAX_INPUT_LENGTH} characters or fewer.`
    );
  }

  if (!/^[()[\]{}]+$/.test(text)) {
    throw new Error(
      "Use only opening and closing parentheses, square brackets, and curly braces."
    );
  }

  return { text };
}

function solve({ text }: ParenthesesInput): boolean {
  const stack: string[] = [];
  const pairs: Record<string, string> = {
    ")": "(",
    "]": "[",
    "}": "{",
  };

  for (const character of text) {
    if ("([{".includes(character)) {
      stack.push(character);
    } else {
      const top = stack.pop();

      if (top !== pairs[character]) {
        return false;
      }
    }
  }

  return stack.length === 0;
}

function createSteps({
  text,
}: ParenthesesInput): ExecutionStep<ParenthesesState>[] {
  const steps: ExecutionStep<ParenthesesState>[] = [];
  const stack: string[] = [];
  const pairs: Record<string, string> = {
    ")": "(",
    "]": "[",
    "}": "{",
  };

  const snapshot = (
    currentIndex: number | null,
    character: string | null,
    result: boolean | null = null,
  ): ParenthesesState => ({
    text,
    currentIndex,
    character,
    stack: [...stack],
    result,
  });

  steps.push({
    id: "initialize",
    codeLine: 2,
    pseudocodeLine: 1,
    title: "Create an empty stack",
    explanation:
      "The stack stores opening brackets. The most recently opened bracket must be closed first.",
    state: snapshot(null, null),
  });

  for (let i = 0; i < text.length; i++) {
    const character = text[i];

    if ("([{".includes(character)) {
      stack.push(character);

      steps.push({
        id: `push-${i}`,
        codeLine: 9,
        pseudocodeLine: 3,
        title: `Push '${character}'`,
        explanation:
          `'${character}' is an opening bracket, so push it onto the stack.`,
        state: snapshot(i, character),
      });

      continue;
    }

    const top = stack.pop();
    const matches = top === pairs[character];

    steps.push({
      id: `check-${i}`,
      codeLine: 6,
      pseudocodeLine: 4,
      title: matches
        ? `Match '${character}'`
        : `Invalid closing '${character}'`,
      explanation: matches
        ? `'${character}' correctly closes '${top}'. The opening bracket is removed from the stack.`
        : `Expected a closing bracket for '${top ?? "nothing"}', but found '${character}'. The sequence is invalid.`,
      state: snapshot(i, character, matches ? null : false),
    });

    if (!matches) {
      steps.push({
        id: "invalid",
        codeLine: 7,
        pseudocodeLine: 5,
        title: "Invalid bracket sequence",
        explanation:
          "A closing bracket does not match the most recent opening bracket.",
        state: snapshot(i, character, false),
      });

      return steps;
    }
  }

  const valid = stack.length === 0;

  steps.push({
    id: "complete",
    codeLine: 11,
    pseudocodeLine: 6,
    title: valid ? "Valid parentheses" : "Unclosed brackets",
    explanation: valid
      ? "Every opening bracket was matched in the correct order, and the stack is empty."
      : "Some opening brackets remain without matching closing brackets.",
    state: snapshot(null, null, valid),
  });

  return steps;
}

export const validParenthesesProblem: ProblemDefinition<
  ParenthesesInput,
  boolean,
  ParenthesesState
> = {
  id: "valid-parentheses",
  leetcodeNumber: 20,
  title: "Valid Parentheses",
  difficulty: "Easy",
  description:
    "Check whether every opening bracket is closed in the correct order.",
  examples: [
    {
      input: 's = "()"',
      output: "true",
      explanation: "The opening parenthesis is correctly closed.",
    },
    {
      input: 's = "()[]{}"',
      output: "true",
      explanation: "Every bracket closes in the correct order.",
    },
    {
      input: 's = "([)]"',
      output: "false",
      explanation: "The closing parenthesis does not match the most recent opening bracket.",
    },
  ],
  constraints: [
    "1 <= s.length <= 10^4",
    "s contains only parentheses, square brackets, and curly brackets.",
  ],
  tags: ["String", "Stack"],
  pseudocode: [
    "Create an empty stack",
    "Read each bracket from left to right",
    "Push opening brackets",
    "For a closing bracket, check the most recent opening bracket",
    "Return false if the pair or order is invalid",
    "Return true only if the stack is empty at the end",
  ],
  solutions: {
    Python: [
      "def isValid(s):",
      "    stack = []",
      "    pairs = {')': '(', ']': '[', '}': '{'}",
      "    for char in s:",
      "        if char in pairs:",
      "            if not stack or stack.pop() != pairs[char]:",
      "                return False",
      "        else:",
      "            stack.append(char)",
      "    return not stack",
    ],
    "C++": [
      "bool isValid(string s) {",
      "    stack<char> st;",
      "    for (char c : s) {",
      "        if (c == '(' || c == '[' || c == '{') st.push(c);",
      "        else {",
      "            if (st.empty()) return false;",
      "            char top = st.top(); st.pop();",
      "            if ((c == ')' && top != '(') ||",
      "                (c == ']' && top != '[') ||",
      "                (c == '}' && top != '{')) return false;",
      "        }",
      "    }",
      "    return st.empty();",
      "}",
    ],
    Java: [
      "boolean isValid(String s) {",
      "    Deque<Character> stack = new ArrayDeque<>();",
      "    for (char c : s.toCharArray()) {",
      "        if (c == '(' || c == '[' || c == '{') stack.push(c);",
      "        else {",
      "            if (stack.isEmpty()) return false;",
      "            char top = stack.pop();",
      "            if ((c == ')' && top != '(') ||",
      "                (c == ']' && top != '[') ||",
      "                (c == '}' && top != '{')) return false;",
      "        }",
      "    }",
      "    return stack.isEmpty();",
      "}",
    ],
  },
  complexity: {
    time: "O(n)",
    timeExplanation:
      "Each bracket is processed at most once, with constant-time stack operations.",
    space: "O(n)",
    spaceExplanation:
      "In the worst case, the stack stores every opening bracket.",
  },
  parseInput,
  solve,
  createSteps,
};
