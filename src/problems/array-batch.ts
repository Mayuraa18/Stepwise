import type { ExecutionStep, ProblemDefinition } from "../engine/types.ts";
import { MAX_RAW_INPUT_LENGTH, MAX_VISUALIZATION_ITEMS } from "../engine/limits.ts";

type Input = { nums: number[] };
type State = {
  nums: number[];
  currentIndex: number | null;
  currentValue: number | null;
  writeIndex: number;
  result: number | number[] | null;
  arrayItemIds?: string[];
};

function parseNumbers(raw: string, sorted = false): Input {
  if (raw.length > MAX_RAW_INPUT_LENGTH) throw new Error("Input is too long.");

  const parts = raw.trim().split(/[,\s]+/).filter(Boolean);
  if (!parts.length || parts.length > MAX_VISUALIZATION_ITEMS) {
    throw new Error(`Enter between 1 and ${MAX_VISUALIZATION_ITEMS} integers.`);
  }

  const nums = parts.map(Number);
  if (nums.some(n => !Number.isSafeInteger(n))) {
    throw new Error("Enter valid safe integers.");
  }
  if (sorted && nums.some((n, i) => i > 0 && n < nums[i - 1])) {
    throw new Error("Enter numbers sorted in ascending order.");
  }
  return { nums };
}

function parseSorted(raw: string): Input {
  return parseNumbers(raw, true);
}
function parseAny(raw: string): Input {
  return parseNumbers(raw);
}

function removeDuplicates({ nums }: Input): number {
  let write = 1;
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] !== nums[write - 1]) nums[write++] = nums[i];
  }
  return write;
}

function removeDuplicateSteps({ nums: input }: Input): ExecutionStep<State>[] {
  const nums = [...input];
  const steps: ExecutionStep<State>[] = [];
  let write = 1;

  const snapshot = (
    i: number | null,
    value: number | null,
    result: number | number[] | null = null,
  ): State => ({
    nums: [...nums],
    currentIndex: i,
    currentValue: value,
    writeIndex: write,
    result,
    arrayItemIds: nums.map((_, index) => `slot-${index}`),
  });

  steps.push({
    id: "initialize",
    codeLine: 2,
    pseudocodeLine: 1,
    title: "Initialize the write pointer",
    explanation: "The first value is unique. The write pointer marks where the next unique value belongs.",
    state: snapshot(null, null),
  });

  for (let i = 1; i < nums.length; i++) {
    const value = nums[i];
    if (value !== nums[write - 1]) {
      nums[write] = value;
      write++;
      steps.push({
        id: `keep-${i}`,
        codeLine: 5,
        pseudocodeLine: 4,
        title: `Keep ${value}`,
        explanation: `${value} differs from the previous unique value, so write it at the next unique position.`,
        state: snapshot(i, value),
      });
    } else {
      steps.push({
        id: `skip-${i}`,
        codeLine: 4,
        pseudocodeLine: 3,
        title: `Skip duplicate ${value}`,
        explanation: `${value} matches the previous unique value. The write pointer stays where it is.`,
        state: snapshot(i, value),
      });
    }
  }

  steps.push({
    id: "complete",
    codeLine: 7,
    pseudocodeLine: 5,
    title: `${write} unique values`,
    explanation: `The first ${write} positions contain the unique values. Return ${write}.`,
    state: snapshot(null, null, write),
  });
  return steps;
}

function moveZeroes({ nums }: Input): number[] {
  let write = 0;
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] !== 0) {
      [nums[write], nums[i]] = [nums[i], nums[write]];
      write++;
    }
  }
  return nums;
}

function moveZeroesSteps({ nums: input }: Input): ExecutionStep<State>[] {
  const nums = [...input];
  const itemIds = input.map((_, index) => `item-${index}`);
  const steps: ExecutionStep<State>[] = [];
  let write = 0;

  const snapshot = (
    i: number | null,
    value: number | null,
    result: number | number[] | null = null,
  ): State => ({
    nums: [...nums],
    currentIndex: i,
    currentValue: value,
    writeIndex: write,
    result,
    arrayItemIds: [...itemIds],
  });

  steps.push({
    id: "initialize",
    codeLine: 2,
    pseudocodeLine: 0,
    title: "Initialize the write pointer",
    explanation: "write = 0 marks the first position where a non-zero value can be placed.",
    state: snapshot(null, null),
  });

  for (let i = 0; i < nums.length; i++) {
    const value = nums[i];

    steps.push({
      id: `inspect-${i}`,
      codeLine: 3,
      pseudocodeLine: 1,
      title: `Inspect index ${i}`,
      explanation: `Read nums[${i}] = ${value}. The scan pointer i is at index ${i}, and write = ${write} marks the next non-zero position.`,
      state: snapshot(i, value),
    });

    if (value === 0) {
      steps.push({
        id: `zero-${i}`,
        codeLine: 4,
        pseudocodeLine: 2,
        title: `Keep zero at index ${i} for now`,
        explanation: `nums[${i}] is 0, so it is skipped. No values move and write stays at ${write}; the next non-zero value can use this position.`,
        state: snapshot(i, value),
      });
      continue;
    }

    const destination = write;
    if (i !== destination) {
      [nums[destination], nums[i]] = [nums[i], nums[destination]];
      [itemIds[destination], itemIds[i]] = [itemIds[i], itemIds[destination]];
    }

    steps.push({
      id: `place-${i}`,
      codeLine: 5,
      pseudocodeLine: 2,
      title: i === destination
        ? `Keep ${value} at index ${destination}`
        : `Move ${value} from index ${i} to index ${destination}`,
      explanation: i === destination
        ? `${value} is already at the write position, so its value and position stay the same.`
        : `${value} is non-zero, so it moves from index ${i} to write index ${destination}. The displaced value moves to index ${i}; non-zero order is preserved.`,
      state: snapshot(i, value),
    });

    write++;
    steps.push({
      id: `advance-${i}`,
      codeLine: 6,
      pseudocodeLine: 2,
      title: `Advance write to ${write}`,
      explanation: `Index ${destination} now contains a non-zero value. Advance write to ${write}, the next position for a non-zero value.`,
      state: snapshot(i, value),
    });
  }

  steps.push({
    id: "complete",
    codeLine: 3,
    pseudocodeLine: 3,
    title: "All zeros moved to the end",
    explanation: `The array is now [${nums.join(", ")}]. Non-zero values retain their original relative order, and the remaining positions contain zeros.`,
    state: snapshot(null, null, [...nums]),
  });
  return steps;
}

export const removeDuplicatesProblem: ProblemDefinition<Input, number, State> = {
  id: "remove-duplicates-sorted-array",
  leetcodeNumber: 26,
  title: "Remove Duplicates from Sorted Array",
  difficulty: "Easy",
  description: "Remove duplicates in-place from a sorted array and return the number of unique values.",
  examples: [
    { input: "nums = [1, 1, 2]", output: "2, nums = [1, 2, _]", explanation: "The first two positions contain 1 and 2." },
    { input: "nums = [0, 0, 1, 1, 2]", output: "3, nums = [0, 1, 2, _, _]", explanation: "There are three unique values." },
  ],
  constraints: ["1 <= nums.length <= 10^5", "nums is sorted in non-decreasing order.", "Values are safe integers."],
  tags: ["Array", "Two Pointers"],
  inputHint: "Enter sorted integers separated by commas.",
  defaultInput: "0, 0, 1, 1, 2, 3, 3",
  bestCase: "O(n) time.",
  averageCase: "O(n) time.",
  worstCase: "O(n) time.",
  memoryNote: "O(1) auxiliary space for the in-place algorithm.",
  pseudocode: [
    "Set the write pointer to 1",
    "Visit each value from index 1",
    "  Compare it with the previous unique value",
    "  If different, write it and advance the pointer",
    "Return the write pointer",
  ],
  solutions: {
    Python: [
      "def removeDuplicates(nums):",
      "    write = 1",
      "    for i in range(1, len(nums)):",
      "        if nums[i] != nums[write - 1]:",
      "            nums[write] = nums[i]",
      "            write += 1",
      "    return write",
    ],
    "C++": [
      "int removeDuplicates(vector<int>& nums) {",
      "    int write = 1;",
      "    for (int i = 1; i < nums.size(); i++) {",
      "        if (nums[i] != nums[write - 1]) nums[write++] = nums[i];",
      "    }",
      "    return write;",
      "}",
    ],
    Java: [
      "int removeDuplicates(int[] nums) {",
      "    int write = 1;",
      "    for (int i = 1; i < nums.length; i++) {",
      "        if (nums[i] != nums[write - 1]) nums[write++] = nums[i];",
      "    }",
      "    return write;",
      "}",
    ],
  },
  complexity: {
    time: "O(n)",
    timeExplanation: "Each element is inspected at most once.",
    space: "O(1)",
    spaceExplanation: "The algorithm modifies the array in-place using a write pointer.",
  },
  parseInput: parseSorted,
  solve: removeDuplicates,
  createSteps: removeDuplicateSteps,
};

export const moveZeroesProblem: ProblemDefinition<Input, number[], State> = {
  id: "move-zeroes",
  leetcodeNumber: 283,
  title: "Move Zeroes",
  difficulty: "Easy",
  description: "Move all zeros to the end while preserving the relative order of non-zero values.",
  examples: [
    { input: "nums = [0, 1, 0, 3, 12]", output: "[1, 3, 12, 0, 0]", explanation: "Non-zero values keep their relative order." },
    { input: "nums = [0, 0, 1]", output: "[1, 0, 0]", explanation: "The non-zero value moves to the front." },
  ],
  constraints: ["1 <= nums.length <= 10^5", "Values are safe integers."],
  tags: ["Array", "Two Pointers"],
  inputHint: "Enter integers separated by commas.",
  defaultInput: "0, 1, 0, 3, 12",
  bestCase: "O(n) time.",
  averageCase: "O(n) time.",
  worstCase: "O(n) time.",
  memoryNote: "O(1) auxiliary space for the in-place algorithm.",
  pseudocode: [
    "Set the write pointer to 0",
    "Visit every array value",
    "  If it is non-zero, move it to the write position",
    "Return the modified array",
  ],
  solutions: {
    Python: [
      "def moveZeroes(nums):",
      "    write = 0",
      "    for i in range(len(nums)):",
      "        if nums[i] != 0:",
      "            nums[write], nums[i] = nums[i], nums[write]",
      "            write += 1",
    ],
    "C++": [
      "void moveZeroes(vector<int>& nums) {",
      "    int write = 0;",
      "    for (int i = 0; i < nums.size(); i++) {",
      "        if (nums[i] != 0) {",
      "            swap(nums[write], nums[i]);",
      "            write++;",
      "        }",
      "    }",
      "}",
    ],
    Java: [
      "void moveZeroes(int[] nums) {",
      "    int write = 0;",
      "    for (int i = 0; i < nums.length; i++) {",
      "        if (nums[i] != 0) {",
      "            int temp = nums[write]; nums[write] = nums[i]; nums[i] = temp;",
      "            write++;",
      "        }",
      "    }",
      "}",
    ],
  },
  complexity: {
    time: "O(n)",
    timeExplanation: "The algorithm scans the array once.",
    space: "O(1)",
    spaceExplanation: "The input array is rearranged in-place using one pointer.",
  },
  parseInput: parseAny,
  solve: moveZeroes,
  createSteps: moveZeroesSteps,
};
