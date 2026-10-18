
import type {
  ExecutionStep,
  ProblemDefinition,
} from "../engine/types.ts";
import { MAX_RAW_INPUT_LENGTH, MAX_VISUALIZATION_ITEMS } from "../engine/limits.ts";

type BinarySearchInput = {
  nums: number[];
  target: number;
};

type BinarySearchState = {
  nums: number[];
  target: number;
  left: number;
  mid: number | null;
  right: number;
  currentIndex: number | null;
  result: number | null;
};

function parseInput(rawInput: string): BinarySearchInput {
  if (rawInput.length > MAX_RAW_INPUT_LENGTH) {
    throw new Error(`Input is too long. Maximum: ${MAX_RAW_INPUT_LENGTH} characters.`);
  }
  const parsed: unknown = JSON.parse(rawInput);

  if (typeof parsed !== "object" || parsed === null ||
      !("nums" in parsed) || !("target" in parsed)) {
    throw new Error(
      'Input must look like {"nums":[-1,0,3,5,9,12],"target":9}.'
    );
  }

  const input = parsed as { nums: unknown; target: unknown };

  if (
    !Array.isArray(input.nums) ||
    !input.nums.every(
      (value) => typeof value === "number" && Number.isFinite(value)
    ) ||
    typeof input.target !== "number" ||
    !Number.isFinite(input.target)
  ) {
    throw new Error("nums must contain finite numbers and target must be a finite number.");
  }

  if (input.nums.length < 1 || input.nums.length > MAX_VISUALIZATION_ITEMS) {
    throw new Error(`Enter between 1 and ${MAX_VISUALIZATION_ITEMS} numbers.`);
  }

  const nums = [...input.nums] as number[];

  if (nums.some((value, i) => i > 0 && nums[i - 1] > value)) {
    throw new Error("Binary Search needs a sorted array.");
  }

  return { nums, target: input.target };
}

function solve({ nums, target }: BinarySearchInput): number {
  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (nums[mid] === target) return mid;

    if (nums[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return -1;
}

function createSteps({
  nums,
  target,
}: BinarySearchInput): ExecutionStep<BinarySearchState>[] {
  const steps: ExecutionStep<BinarySearchState>[] = [];
  let left = 0;
  let right = nums.length - 1;

  const snapshot = (
    mid: number | null,
    currentIndex: number | null,
    result: number | null,
  ): BinarySearchState => ({
    nums: [...nums],
    target,
    left,
    mid,
    right,
    currentIndex,
    result,
  });

  steps.push({
    id: "initialize",
    codeLine: 2,
    pseudocodeLine: 1,
    title: "Set search boundaries",
    explanation:
      "Start with the entire sorted array. Left is the first index and right is the last.",
    state: snapshot(null, null, null),
  });

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const value = nums[mid];

    steps.push({
      id: `check-${mid}-${left}-${right}`,
      codeLine: 4,
      pseudocodeLine: 3,
      title: `Check middle index ${mid}`,
      explanation:
        `Calculate mid = floor((${left} + ${right}) / 2) = ${mid}. ` +
        `The value at this index is ${value}; compare it with ${target}.`,
      state: snapshot(mid, mid, null),
    });

    if (value === target) {
      steps.push({
        id: "found",
        codeLine: 5,
        pseudocodeLine: 4,
        title: "Target found!",
        explanation:
          `${value} equals the target ${target}. Return index ${mid}.`,
        state: snapshot(mid, mid, mid),
      });

      return steps;
    }

    if (value < target) {
      steps.push({
        id: `discard-left-${mid}`,
        codeLine: 6,
        pseudocodeLine: 5,
        title: "Search the right half",
        explanation:
          `${value} is smaller than ${target}. Because the array is sorted, ` +
          "the middle value and everything to its left can be discarded.",
        state: snapshot(mid, mid, null),
      });

      left = mid + 1;
    } else {
      steps.push({
        id: `discard-right-${mid}`,
        codeLine: 7,
        pseudocodeLine: 6,
        title: "Search the left half",
        explanation:
          `${value} is larger than ${target}. Because the array is sorted, ` +
          "the middle value and everything to its right can be discarded.",
        state: snapshot(mid, mid, null),
      });

      right = mid - 1;
    }
  }

  steps.push({
    id: "not-found",
    codeLine: 9,
    pseudocodeLine: 7,
    title: "Target not found",
    explanation:
      "The search range is empty (left is greater than right). Return -1.",
    state: snapshot(null, null, -1),
  });

  return steps;
}

export const binarySearchProblem: ProblemDefinition<
  BinarySearchInput,
  number,
  BinarySearchState
> = {
  id: "binary-search",
  leetcodeNumber: 704,
  title: "Binary Search",
  difficulty: "Easy",
  description:
    "Find a target in a sorted array by repeatedly halving the search range.",
  examples: [
    {
      input: "nums = [-1, 0, 3, 5, 9, 12], target = 9",
      output: "4",
      explanation: "The target 9 is at index 4.",
    },
    {
      input: "nums = [-1, 0, 3, 5, 9, 12], target = 2",
      output: "-1",
      explanation: "The target 2 does not exist in the array.",
    },
  ],
  constraints: [
    "1 <= nums.length <= 10^4",
    "nums is sorted in ascending order.",
    "All array values are distinct.",
    "-10^4 <= target <= 10^4",
  ],
  tags: ["Array", "Binary Search"],
  inputHint: "Sorted array and target (example: -1, 0, 3, 5, 9, 12; target: 9)",
  defaultInput: "-1, 0, 3, 5, 9, 12; target: 9",
  bestCase: "O(1) when the target is the middle element on the first check.",
  averageCase: "O(log n) because the search range is repeatedly halved.",
  worstCase: "O(log n) when the search continues until the range is exhausted.",
  memoryNote: "O(1) auxiliary space for the iterative implementation.",
  pseudocode: [
    "Set left to the first index and right to the last",
    "While left is not greater than right",
    "  Calculate the middle index",
    "  If the middle value equals target, return mid",
    "  If the middle value is smaller, search right half",
    "  Otherwise, search left half",
    "Return -1 when the range is empty",
  ],
  solutions: {
    Python: [
      "def search(nums, target):",
      "    left, right = 0, len(nums) - 1",
      "    while left <= right:",
      "        mid = (left + right) // 2",
      "        if nums[mid] == target:",
      "            return mid",
      "        if nums[mid] < target:",
      "            left = mid + 1",
      "        else:",
      "            right = mid - 1",
      "    return -1",
    ],
    "C++": [
      "int search(vector<int>& nums, int target) {",
      "    int left = 0, right = nums.size() - 1;",
      "    while (left <= right) {",
      "        int mid = left + (right - left) / 2;",
      "        if (nums[mid] == target) return mid;",
      "        if (nums[mid] < target) left = mid + 1;",
      "        else right = mid - 1;",
      "    }",
      "    return -1;",
      "}",
    ],
    Java: [
      "int search(int[] nums, int target) {",
      "    int left = 0, right = nums.length - 1;",
      "    while (left <= right) {",
      "        int mid = left + (right - left) / 2;",
      "        if (nums[mid] == target) return mid;",
      "        if (nums[mid] < target) left = mid + 1;",
      "        else right = mid - 1;",
      "    }",
      "    return -1;",
      "}",
    ],
  },
  complexity: {
    time: "O(log n)",
    timeExplanation:
      "Each iteration discards approximately half the remaining search range, so the number of comparisons grows logarithmically.",
    space: "O(1)",
    spaceExplanation:
      "The iterative algorithm uses only a fixed number of variables: left, right, and mid.",
  },
  parseInput,
  solve,
  createSteps,
};
