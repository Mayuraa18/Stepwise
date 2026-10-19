import type { ExecutionStep } from "../engine/types.ts";

type Input = { nums: number[] };

type State = {
  nums: number[];
  currentIndex: number | null;
  currentValue: number | null;
  i: number | null;
  j: number | null;
  result: number | null;
  arrayItemIds: string[];
  pointers: Record<string, string | number | null>;
};

function parseInput(raw: string): Input {
  if (raw.length > 10000) throw new Error("Input is too long.");

  const parts = raw.trim().split(/[,\s]+/).filter(Boolean);
  if (!parts.length || parts.length > 1000) {
    throw new Error("Enter between 1 and 1000 integers.");
  }

  const nums = parts.map(Number);
  if (nums.some((n) => !Number.isSafeInteger(n))) {
    throw new Error("Enter valid safe integers.");
  }
  if (nums.some((n, i) => i > 0 && n < nums[i - 1])) {
    throw new Error("Enter numbers sorted in ascending order.");
  }

  return { nums };
}

function step(
  id: string,
  title: string,
  explanation: string,
  codeLine: number,
  pseudocodeLine: number,
  nums: number[],
  i: number | null,
  j: number | null,
  result: number | null = null,
): ExecutionStep<State> {
  return {
    id,
    title,
    explanation,
    codeLine,
    pseudocodeLine,
    state: {
      nums: [...nums],
      currentIndex: j,
      currentValue: j === null ? null : nums[j],
      i,
      j,
      result,
      // Remove Duplicates overwrites array slots; slot identity stays fixed.
      arrayItemIds: nums.map((_, index) => `slot-${index}`),
      pointers: {
        ...(i === null ? {} : { i }),
        ...(j === null ? {} : { j }),
      },
    },
  };
}

function bruteForceSteps({ nums: input }: Input): ExecutionStep<State>[] {
  const nums = [...input];
  const steps: ExecutionStep<State>[] = [];
  const unique = [...new Set(nums)].sort((a, b) => a - b);

  steps.push(step(
    "brute-initialize",
    "Create a set of unique values",
    "The sorted input lets us preserve the original order of unique values.",
    1, 1, nums, null, 0,
  ));

  for (let j = 0; j < nums.length; j++) {
    steps.push(step(
      `brute-scan-${j}`,
      `Inspect ${nums[j]}`,
      `Insert ${nums[j]} into the set. Duplicate values are stored only once.`,
      3, 2, nums, null, j,
    ));
  }

  for (let i = 0; i < unique.length; i++) {
    nums[i] = unique[i];
    steps.push(step(
      `brute-write-${i}`,
      `Write ${unique[i]}`,
      `Write the next unique value into array index ${i}.`,
      5, 3, nums, i, i,
    ));
  }

  steps.push(step(
    "brute-complete",
    "Brute-force approach complete",
    `There are ${unique.length} unique values. Return k = ${unique.length}.`,
    6, 4, nums, null, null, unique.length,
  ));

  return steps;
}

function optimalSteps({ nums: input }: Input): ExecutionStep<State>[] {
  const nums = [...input];
  const steps: ExecutionStep<State>[] = [];
  let i = 0;

  steps.push(step(
    "optimal-initialize",
    "Initialize the unique pointer",
    "i points to the last known unique value. j scans the remaining array.",
    1, 1, nums, i, 1,
  ));

  for (let j = 1; j < nums.length; j++) {
    if (nums[i] === nums[j]) {
      steps.push(step(
        `optimal-skip-${j}`,
        `Skip duplicate ${nums[j]}`,
        `nums[i] and nums[j] are equal. Keep i unchanged.`,
        3, 2, nums, i, j,
      ));
      continue;
    }

    i++;
    const value = nums[j];
    nums[i] = value;

    steps.push(step(
      `optimal-write-${j}`,
      `Write ${value} at index ${i}`,
      `The value differs from nums[i]. Advance i and overwrite nums[i] with nums[j].`,
      5, 3, nums, i, j,
    ));
  }

  steps.push(step(
    "optimal-complete",
    "Optimal approach complete",
    `The first ${i + 1} positions contain the unique values. Return k = ${i + 1}.`,
    6, 4, nums, null, null, i + 1,
  ));

  return steps;
}

export type RemoveDuplicatesApproach = "brute-force" | "optimal";

export function getRemoveDuplicatesSteps(
  rawInput: string,
  approach: RemoveDuplicatesApproach,
): ExecutionStep<State>[] {
  const input = parseInput(rawInput);
  return approach === "brute-force"
    ? bruteForceSteps(input)
    : optimalSteps(input);
}

export const removeDuplicatesApproachMetadata = {
  "brute-force": {
    label: "Brute Force",
    time: "O(n log n)",
    space: "O(n)",
    pseudocode: [
      "Create a set of unique values",
      "Visit every array value",
      "Insert values into the set",
      "Write unique values back into the array",
      "Return the number of unique values",
    ],
  },
  optimal: {
    label: "Optimal · Two Pointers",
    time: "O(n)",
    space: "O(1)",
    pseudocode: [
      "Set i to the first unique position",
      "Visit each value using j",
      "  If nums[i] equals nums[j], skip it",
      "  Otherwise advance i and write nums[j] at nums[i]",
      "Return i + 1",
    ],
  },
} as const;
