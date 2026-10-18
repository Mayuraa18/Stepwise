import type {
  ExecutionStep,
  ProblemDefinition,
} from "../engine/types.ts";

type TwoSumInput = {
  nums: number[];
  target: number;
};

type TwoSumState = {
  nums: number[];
  target: number;
  currentIndex: number | null;
  currentValue: number | null;
  complement: number | null;
  seen: Record<string, number>;
  result: number[] | null;
};

function parseInput(rawInput: string): TwoSumInput {
  const parsed: unknown = JSON.parse(rawInput);

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("nums" in parsed) ||
    !("target" in parsed)
  ) {
    throw new Error(
      'Input must look like {"nums":[2,7,11,15],"target":9}.'
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
    throw new Error(
      "nums must contain finite numbers and target must be a finite number."
    );
  }

  return {
    nums: [...input.nums] as number[],
    target: input.target,
  };
}

function solve({ nums, target }: TwoSumInput): number[] {
  const seen = new Map<number, number>();

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];

    if (seen.has(complement)) {
      return [seen.get(complement)!, i];
    }

    seen.set(nums[i], i);
  }

  return [];
}

function createSteps({
  nums,
  target,
}: TwoSumInput): ExecutionStep<TwoSumState>[] {
  const steps: ExecutionStep<TwoSumState>[] = [];
  const seen: Record<string, number> = {};

  const snapshot = (
    currentIndex: number | null,
    complement: number | null,
    result: number[] | null
  ): TwoSumState => ({
    nums: [...nums],
    target,
    currentIndex,
    currentValue:
      currentIndex === null ? null : nums[currentIndex],
    complement,
    seen: { ...seen },
    result: result ? [...result] : null,
  });

  steps.push({
    id: "initialize",
    codeLine: 2,
    pseudocodeLine: 1,
    title: "Initialize the hash map",
    explanation:
      "Start with an empty map. It will store each previously visited number and its index.",
    state: snapshot(null, null, null),
  });

  for (let i = 0; i < nums.length; i++) {
    const num = nums[i];
    const complement = target - num;

    steps.push({
      id: `inspect-${i}`,
      codeLine: 4,
      pseudocodeLine: 3,
      title: `Inspect index ${i}`,
      explanation:
        `The current value is ${num}. To reach ${target}, we need ` +
        `${target} − ${num} = ${complement}.`,
      state: snapshot(i, complement, null),
    });

    if (Object.hasOwn(seen, String(complement))) {
      const result = [seen[String(complement)], i];

      steps.push({
        id: `found-${i}`,
        codeLine: 6,
        pseudocodeLine: 5,
        title: "Found the answer!",
        explanation:
          `The map already contains ${complement} at index ` +
          `${result[0]}. Return indices [${result.join(", ")}].`,
        state: snapshot(i, complement, result),
      });

      return steps;
    }

    seen[String(num)] = i;

    steps.push({
      id: `store-${i}`,
      codeLine: 7,
      pseudocodeLine: 6,
      title: `Store ${num} in the map`,
      explanation:
        `${complement} is not in the map yet, so store ` +
        `${num} → ${i} and continue.`,
      state: snapshot(i, complement, null),
    });
  }

  steps.push({
    id: "not-found",
    codeLine: 8,
    pseudocodeLine: 7,
    title: "No matching pair found",
    explanation:
      "Every number was checked, but no pair adds up to the target.",
    state: snapshot(null, null, []),
  });

  return steps;
}

export const twoSumProblem: ProblemDefinition<
  TwoSumInput,
  number[],
  TwoSumState
> = {
  id: "two-sum",
  leetcodeNumber: 1,
  title: "Two Sum",
  difficulty: "Easy",
  description:
    "Find two distinct indices whose values add up to the target.",
  examples: [
    {
      input: "nums = [2, 7, 11, 15], target = 9",
      output: "[0, 1]",
      explanation: "nums[0] + nums[1] = 2 + 7 = 9.",
    },
    {
      input: "nums = [3, 2, 4], target = 6",
      output: "[1, 2]",
      explanation: "nums[1] + nums[2] = 2 + 4 = 6.",
    },
  ],
  constraints: [
    "2 <= nums.length <= 10^4",
    "Each input contains finite numeric values.",
    "The target is a finite number.",
  ],
  tags: ["Array", "Hash Table"],
  inputHint: "Array values and target (example: 2, 7, 11, 15; target: 9)",
  defaultInput: "2, 7, 11, 15; target: 9",
  bestCase: "O(1) when a matching complement is found immediately.",
  averageCase: "O(n) expected time using a hash map.",
  worstCase: "O(n) expected time under standard hash-map assumptions.",
  memoryNote: "O(n) auxiliary space for stored values.",
  pseudocode: [
    "Create an empty map called seen",
    "For each number at index i",
    "  Calculate complement = target - number",
    "  If complement exists in seen",
    "    Return the stored index and i",
    "  Store number → i in seen",
    "Return an empty result",
  ],
  solutions: {
    Python: [
      "def twoSum(nums, target):",
      "    seen = {}",
      "    for i, num in enumerate(nums):",
      "        complement = target - num",
      "        if complement in seen:",
      "            return [seen[complement], i]",
      "        seen[num] = i",
      "    return []",
    ],
    "C++": [
      "vector<int> twoSum(vector<int>& nums, int target) {",
      "    unordered_map<int, int> seen;",
      "    for (int i = 0; i < nums.size(); i++) {",
      "        int complement = target - nums[i];",
      "        if (seen.count(complement)) {",
      "            return {seen[complement], i};",
      "        }",
      "        seen[nums[i]] = i;",
      "    }",
      "    return {};",
      "}",
    ],
    Java: [
      "int[] twoSum(int[] nums, int target) {",
      "    Map<Integer, Integer> seen = new HashMap<>();",
      "    for (int i = 0; i < nums.length; i++) {",
      "        int complement = target - nums[i];",
      "        if (seen.containsKey(complement)) {",
      "            return new int[] { seen.get(complement), i };",
      "        }",
      "        seen.put(nums[i], i);",
      "    }",
      "    return new int[] {};",
      "}",
    ],
  },
  complexity: {
    time: "O(n) average",
    timeExplanation:
      "We visit each number at most once. Hash-map lookups and insertions take O(1) average time, giving O(n) average total time.",
    space: "O(n)",
    spaceExplanation:
      "In the worst case, the map stores nearly every input number, so additional storage grows linearly with the input size.",
  },
  parseInput,
  solve,
  createSteps,
};
