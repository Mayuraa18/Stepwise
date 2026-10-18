
import type {
  ExecutionStep,
  ProblemDefinition,
} from "../engine/types.ts";

type MaximumSubarrayInput = {
  nums: number[];
};

type MaximumSubarrayState = {
  nums: number[];
  currentIndex: number | null;
  currentValue: number | null;
  currentSum: number;
  bestSum: number;
  result: number | null;
};

const MAX_VISUALIZATION_ITEMS = 200;

function parseInput(rawInput: string): MaximumSubarrayInput {
  if (rawInput.length > 10_000) {
    throw new Error("Input is too long. Keep it under 10,000 characters.");
  }

  const values = rawInput.trim().split(/[,\s]+/).filter(Boolean);

  if (
    values.length === 0 ||
    values.length > MAX_VISUALIZATION_ITEMS
  ) {
    throw new Error(
      `Enter between 1 and ${MAX_VISUALIZATION_ITEMS} integers.`
    );
  }

  const nums = values.map(Number);

  if (
    nums.some(
      (num) =>
        !Number.isSafeInteger(num) ||
        Math.abs(num) > 1_000_000_000
    )
  ) {
    throw new Error(
      "Enter valid integers between -1,000,000,000 and 1,000,000,000."
    );
  }

  return { nums };
}

function solve({ nums }: MaximumSubarrayInput): number {
  let currentSum = nums[0];
  let bestSum = nums[0];

  for (let i = 1; i < nums.length; i++) {
    currentSum = Math.max(nums[i], currentSum + nums[i]);
    bestSum = Math.max(bestSum, currentSum);
  }

  return bestSum;
}

function createSteps({
  nums,
}: MaximumSubarrayInput): ExecutionStep<MaximumSubarrayState>[] {
  const steps: ExecutionStep<MaximumSubarrayState>[] = [];

  let currentSum = nums[0];
  let bestSum = nums[0];

  const snapshot = (
    currentIndex: number | null,
    currentValue: number | null,
    result: number | null = null,
  ): MaximumSubarrayState => ({
    nums,
    currentIndex,
    currentValue,
    currentSum,
    bestSum,
    result,
  });

  steps.push({
    id: "initialize",
    codeLine: 2,
    pseudocodeLine: 1,
    title: "Initialize the sums",
    explanation:
      `Start with the first value (${nums[0]}) as both the current subarray sum and the best sum. This handles all-negative arrays correctly.`,
    state: snapshot(0, nums[0]),
  });

  for (let i = 1; i < nums.length; i++) {
    const value = nums[i];
    const extendedSum = currentSum + value;
    const startNew = value > extendedSum;

    currentSum = Math.max(value, extendedSum);
    bestSum = Math.max(bestSum, currentSum);

    steps.push({
      id: `process-${i}`,
      codeLine: 4,
      pseudocodeLine: 3,
      title: `Process value ${value}`,
      explanation:
        `Compare starting a new subarray (${value}) with extending the previous sum (${extendedSum}). ` +
        `Choose ${startNew ? "a new subarray" : "the extended subarray"}; ` +
        `current sum = ${currentSum}, best sum = ${bestSum}.`,
      state: snapshot(i, value),
    });
  }

  steps.push({
    id: "complete",
    codeLine: 6,
    pseudocodeLine: 5,
    title: "Maximum subarray sum",
    explanation:
      `The largest contiguous-subarray sum is ${bestSum}.`,
    state: snapshot(null, null, bestSum),
  });

  return steps;
}

export const maximumSubarrayProblem: ProblemDefinition<
  MaximumSubarrayInput,
  number,
  MaximumSubarrayState
> = {
  id: "maximum-subarray",
  leetcodeNumber: 53,
  title: "Maximum Subarray",
  difficulty: "Medium",
  description:
    "Find the contiguous subarray with the largest sum.",
  examples: [
    {
      input: "nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]",
      output: "6",
      explanation:
        "The subarray [4, -1, 2, 1] has the largest sum: 6.",
    },
    {
      input: "nums = [-5, -2, -8]",
      output: "-2",
      explanation:
        "The largest sum comes from the single value -2.",
    },
  ],
  constraints: [
    "1 <= nums.length <= 10^5",
    "nums[i] is an integer",
  ],
  tags: ["Array", "Dynamic Programming", "Divide and Conquer"],
  pseudocode: [
    "Initialize current sum and best sum with the first value",
    "For each remaining value",
    "  Compare starting a new subarray with extending the current one",
    "  Update the current sum",
    "  Update the best sum",
    "Return the best sum",
  ],
  solutions: {
    Python: [
      "def maxSubArray(nums):",
      "    current = best = nums[0]",
      "    for num in nums[1:]:",
      "        current = max(num, current + num)",
      "        best = max(best, current)",
      "    return best",
    ],
    "C++": [
      "int maxSubArray(vector<int>& nums) {",
      "    int current = nums[0], best = nums[0];",
      "    for (int i = 1; i < nums.size(); i++) {",
      "        current = max(nums[i], current + nums[i]);",
      "        best = max(best, current);",
      "    }",
      "    return best;",
      "}",
    ],
    Java: [
      "int maxSubArray(int[] nums) {",
      "    int current = nums[0], best = nums[0];",
      "    for (int i = 1; i < nums.length; i++) {",
      "        current = Math.max(nums[i], current + nums[i]);",
      "        best = Math.max(best, current);",
      "    }",
      "    return best;",
      "}",
    ],
  },
  complexity: {
    time: "O(n)",
    timeExplanation:
      "Each element is visited once. Every iteration performs a constant number of comparisons and updates.",
    space: "O(1)",
    spaceExplanation:
      "The algorithm itself stores only the current sum and best sum, excluding the input and visualization trace.",
  },
  parseInput,
  solve,
  createSteps,
};
