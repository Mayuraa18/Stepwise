import type {
  ExecutionStep,
  ProblemDefinition,
} from "../engine/types.ts";
import {
  MAX_RAW_INPUT_LENGTH,
  MAX_VISUALIZATION_ITEMS,
} from "../engine/limits.ts";

type Input = { nums: number[] };

type State = {
  nums: number[];
  currentIndex: number | null;
  currentValue: number | null;
  seen: number[];
  result: boolean | null;
};

function parseInput(rawInput: string): Input {
  if (rawInput.length > MAX_RAW_INPUT_LENGTH) {
    throw new Error("Input is too long.");
  }

  const values = rawInput.trim().split(/[,\s]+/).filter(Boolean);

  if (values.length === 0 || values.length > MAX_VISUALIZATION_ITEMS) {
    throw new Error(
      `Enter between 1 and ${MAX_VISUALIZATION_ITEMS} integers.`,
    );
  }

  const nums = values.map(Number);

  if (nums.some((num) => !Number.isSafeInteger(num))) {
    throw new Error("Enter valid safe integers.");
  }

  return { nums };
}

function solve({ nums }: Input): boolean {
  const seen = new Set<number>();

  for (const num of nums) {
    if (seen.has(num)) return true;
    seen.add(num);
  }

  return false;
}

function createSteps({ nums }: Input): ExecutionStep<State>[] {
  const steps: ExecutionStep<State>[] = [];
  const seen = new Set<number>();

  const snapshot = (
    currentIndex: number | null,
    currentValue: number | null,
    result: boolean | null = null,
  ): State => ({
    nums: [...nums],
    currentIndex,
    currentValue,
    seen: [...seen],
    result,
  });

  steps.push({
    id: "initialize",
    codeLine: 2,
    pseudocodeLine: 1,
    title: "Create an empty set",
    explanation:
      "The set stores numbers we have already visited.",
    state: snapshot(null, null),
  });

  for (let i = 0; i < nums.length; i++) {
    const value = nums[i];

    if (seen.has(value)) {
      steps.push({
        id: `duplicate-${i}`,
        codeLine: 5,
        pseudocodeLine: 3,
        title: `Duplicate found: ${value}`,
        explanation:
          `${value} is already in the set, so the array contains a duplicate.`,
        state: snapshot(i, value, true),
      });

      return steps;
    }

    seen.add(value);

    steps.push({
      id: `inspect-${i}`,
      codeLine: 6,
      pseudocodeLine: 4,
      title: `Add ${value} to the set`,
      explanation:
        `${value} has not appeared before. Store it and continue.`,
      state: snapshot(i, value),
    });
  }

  steps.push({
    id: "complete",
    codeLine: 8,
    pseudocodeLine: 5,
    title: "No duplicates found",
    explanation: "Every number was unique.",
    state: snapshot(null, null, false),
  });

  return steps;
}

export const containsDuplicateProblem: ProblemDefinition<
  Input,
  boolean,
  State
> = {
  id: "contains-duplicate",
  leetcodeNumber: 217,
  title: "Contains Duplicate",
  difficulty: "Easy",
  description:
    "Determine whether any value appears at least twice in an array.",
  examples: [
    {
      input: "nums = [1, 2, 3, 1]",
      output: "true",
      explanation: "The number 1 appears twice.",
    },
    {
      input: "nums = [1, 2, 3, 4]",
      output: "false",
      explanation: "Every number appears exactly once.",
    },
  ],
  constraints: [
    "1 <= nums.length <= 10^5",
    "Each value is a safe integer.",
  ],
  tags: ["Array", "Hash Table", "Sorting"],
  inputHint: "Enter integers separated by commas.",
  defaultInput: "1, 2, 3, 1",
  bestCase: "O(1) when the second element is already a duplicate.",
  averageCase: "O(n) expected time using a set.",
  worstCase: "O(n) expected time under standard hash-set assumptions.",
  memoryNote: "O(n) auxiliary space for the set.",
  pseudocode: [
    "Create an empty set",
    "Visit each number",
    "  If the number is already in the set, return true",
    "  Otherwise, add the number to the set",
    "Return false",
  ],
  solutions: {
    Python: [
      "def containsDuplicate(nums):",
      "    seen = set()",
      "    for num in nums:",
      "        if num in seen:",
      "            return True",
      "        seen.add(num)",
      "    return False",
    ],
    "C++": [
      "bool containsDuplicate(vector<int>& nums) {",
      "    unordered_set<int> seen;",
      "    for (int num : nums) {",
      "        if (seen.count(num)) return true;",
      "        seen.insert(num);",
      "    }",
      "    return false;",
      "}",
    ],
    Java: [
      "boolean containsDuplicate(int[] nums) {",
      "    Set<Integer> seen = new HashSet<>();",
      "    for (int num : nums) {",
      "        if (!seen.add(num)) return true;",
      "    }",
      "    return false;",
      "}",
    ],
  },
  complexity: {
    time: "O(n) expected",
    timeExplanation:
      "Each number is checked and inserted at most once, with expected constant-time set operations.",
    space: "O(n)",
    spaceExplanation:
      "In the worst case, the set stores every input number.",
  },
  parseInput,
  solve,
  createSteps,
};
