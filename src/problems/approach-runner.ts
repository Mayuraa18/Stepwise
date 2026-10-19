
import type { VisualStep } from "../engine/types.ts";

type Approach = "brute-force" | "optimal";

const metadata: Record<string, {
  time: string; space: string; pseudocode: string[];
}> = {
  "1": { time: "O(n²)", space: "O(1)", pseudocode: [
    "Visit every first index i", "Visit every later index j",
    "Compare nums[i] + nums[j] with target", "Return the matching pair or an empty result"
  ]},
  "704": { time: "O(n)", space: "O(1)", pseudocode: [
    "Start at the first index", "Inspect each value from left to right",
    "If the value equals target, return its index", "If the scan ends, return -1"
  ]},
  "121": { time: "O(n²)", space: "O(1)", pseudocode: [
    "Choose each day as a buying day", "Check every later selling day",
    "Calculate the profit for each pair", "Keep the largest profit"
  ]},
  "53": { time: "O(n²)", space: "O(1)", pseudocode: [
    "Choose every possible start index", "Extend the subarray one value at a time",
    "Update the running sum", "Keep the maximum sum"
  ]},
  "20": { time: "O(n²)", space: "O(n)", pseudocode: [
    "Find an opening bracket", "Search for its matching close",
    "Check bracket order and nesting", "Return whether the string is valid"
  ]},
  "206": { time: "O(n)", space: "O(n)", pseudocode: [
    "Copy the list values into temporary storage", "Read the stored values backwards",
    "Build the reversed list", "Return the reversed list"
  ]},
  "217": { time: "O(n²)", space: "O(1)", pseudocode: [
    "Choose each array index i", "Compare it with each later index j",
    "If two values match, return true", "If no pair matches, return false"
  ]},
  "26": { time: "O(n)", space: "O(n)", pseudocode: [
    "Create a set of unique values", "Visit each input value",
    "Keep only one copy of each value", "Write unique values back and return k"
  ]},
  "283": { time: "O(n²)", space: "O(n)", pseudocode: [
    "Create a temporary result array", "Copy all nonzero values in order",
    "Append enough zeroes to restore the length", "Return the rearranged array"
  ]},
};

export function getApproachMetadata(id: string, approach: Approach) {
  if (approach === "optimal" && id === "26") {
    return {
      time: "O(n)", space: "O(1)",
      pseudocode: [
        "Set i to the first unique position",
        "Visit each value using j",
        "If nums[i] equals nums[j], skip it",
        "Otherwise advance i and write nums[j] at nums[i]",
        "Return i + 1"
      ]
    };
  }
  if (approach === "optimal") return null;
  return metadata[id] ?? null;
}

function makeStep(
  title: string, explanation: string, array: number[],
  currentIndex: number | null, line: number, variables: {label:string;value:string}[] = [],
  result: string | null = null, memory: {label:string;value:string}[] = [],
  pseudocodeLine = 0
): VisualStep {
  return {
    title, explanation, array: [...array], currentIndex, line,
    pseudocodeLine, variables, memory, result,
    visualization: {
      items: array.map((value, index) => ({
        id: `brute-slot-${index}`, label: `index ${index}`,
        value: String(value), active: index === currentIndex
      })),
      pointers: currentIndex === null ? {} : { i: currentIndex }
    }
  };
}

function parseNums(raw: string): number[] {
  const prefix = raw.split(/;\s*target\s*:/i)[0];
  const match = prefix.match(/-?\d+(?:\.\d+)?/g);
  return match ? match.map(Number) : [];
}
function parseTarget(raw: string): number {
  const match = raw.match(/target\s*:\s*(-?\d+(?:\.\d+)?)/i);
  return match ? Number(match[1]) : Number.NaN;
}

export function getBruteForceSteps(id: string, raw: string): VisualStep[] {
  const nums = parseNums(raw);
  const steps: VisualStep[] = [];
  const push = (
    title: string, explanation: string, values = nums,
    index: number | null = null, variables: {label:string;value:string}[] = [],
    result: string | null = null, memory: {label:string;value:string}[] = [],
    pseudo = 0
  ) => steps.push(makeStep(title, explanation, values, index, pseudo + 1, variables, result, memory, pseudo));

  if (id === "1") {
    const target = parseTarget(raw);
    for (let i = 0; i < nums.length; i++) {
      for (let j = i + 1; j < nums.length; j++) {
        const sum = nums[i] + nums[j];
        push(`Compare indices ${i} and ${j}`,
          `${nums[i]} + ${nums[j]} = ${sum}. ${sum === target ? "This pair matches the target." : `The sum is not ${target}; try another pair.`}`,
          nums, i, [{label:"i",value:String(i)},{label:"j",value:String(j)},{label:"sum",value:String(sum)}],
          sum === target ? `[${i}, ${j}]` : null, [], 2);
        if (sum === target) return steps;
      }
    }
    push("No pair found", "Every distinct pair was checked without finding the target.", nums, null, [], "[]", [], 3);
    return steps;
  }

  if (id === "704") {
    const target = parseTarget(raw);
    for (let i = 0; i < nums.length; i++) {
      const found = nums[i] === target;
      push(`Inspect index ${i}`, `${nums[i]} ${found ? "matches" : "does not match"} target ${target}.`, nums, i,
        [{label:"i",value:String(i)},{label:"target",value:String(target)}],
        found ? String(i) : null, [], 1);
      if (found) return steps;
    }
    push("Target not found", "The linear scan reached the end of the array.", nums, null, [], "-1", [], 3);
    return steps;
  }

  if (id === "121") {
    let best = 0;
    for (let i = 0; i < nums.length; i++) {
      for (let j = i + 1; j < nums.length; j++) {
        const profit = nums[j] - nums[i];
        best = Math.max(best, profit);
        push(`Try buy ${i}, sell ${j}`,
          `Buying at ${nums[i]} and selling at ${nums[j]} gives profit ${profit}. Best profit so far: ${best}.`,
          nums, j, [{label:"buy",value:String(i)},{label:"sell",value:String(j)},{label:"best",value:String(best)}],
          null, [], 2);
      }
    }
    push("Maximum profit found", `The best profit across all pairs is ${best}.`, nums, null,
      [{label:"best",value:String(best)}], String(best), [], 3);
    return steps;
  }

  if (id === "53") {
    let best = -Infinity;
    for (let i = 0; i < nums.length; i++) {
      let sum = 0;
      for (let j = i; j < nums.length; j++) {
        sum += nums[j];
        best = Math.max(best, sum);
        push(`Extend subarray [${i}, ${j}]`,
          `Running sum is ${sum}; maximum subarray sum so far is ${best}.`,
          nums, j, [{label:"start",value:String(i)},{label:"end",value:String(j)},{label:"sum",value:String(sum)},{label:"best",value:String(best)}],
          null, [], 2);
      }
    }
    push("Maximum subarray found", `The largest sum is ${best}.`, nums, null,
      [{label:"best",value:String(best)}], String(best), [], 3);
    return steps;
  }

  if (id === "217") {
    for (let i = 0; i < nums.length; i++) {
      for (let j = i + 1; j < nums.length; j++) {
        const duplicate = nums[i] === nums[j];
        push(`Compare ${i} and ${j}`,
          `${nums[i]} ${duplicate ? "equals" : "differs from"} ${nums[j]}.`,
          nums, i, [{label:"i",value:String(i)},{label:"j",value:String(j)}],
          duplicate ? "true" : null, [], 1);
        if (duplicate) return steps;
      }
    }
    push("No duplicates", "Every pair contains different values.", nums, null, [], "false", [], 3);
    return steps;
  }

  if (id === "26") {
    const unique: number[] = [];
    for (let i = 0; i < nums.length; i++) {
      if (!unique.includes(nums[i])) unique.push(nums[i]);
      push(`Inspect ${nums[i]}`,
        `${unique.includes(nums[i]) ? "Keep one copy" : "Skip duplicate"} of ${nums[i]} using temporary storage.`,
        [...unique, ...nums.slice(i + 1)], i,
        [{label:"unique count",value:String(unique.length)}],
        null, unique.map((value,index)=>({label:String(index),value:String(value)})), 1);
    }
    push("Write unique values", `There are ${unique.length} unique values.`, [...unique, ...nums.slice(unique.length)],
      null, [{label:"k",value:String(unique.length)}], String(unique.length), [], 3);
    return steps;
  }

  if (id === "283") {
    const output = nums.filter(value => value !== 0);
    for (let i = 0; i < nums.length; i++) {
      push(`Inspect index ${i}`, nums[i] === 0
        ? "This value is zero, so defer it until after the nonzero values."
        : `Copy nonzero value ${nums[i]} to temporary storage.`,
        nums, i, [{label:"i",value:String(i)}],
        null, output.map((value,index)=>({label:String(index),value:String(value)})), 1);
    }
    const result = [...output, ...Array(nums.length - output.length).fill(0)];
    push("Build final array", "Nonzero values retain their relative order, followed by the required zeroes.",
      result, null, [], JSON.stringify(result), [], 3);
    return steps;
  }

  if (id === "206") {
    const reversed = [...nums].reverse();
    for (let i = nums.length - 1; i >= 0; i--) {
      push(`Read value at ${i}`, `Copy ${nums[i]} into auxiliary storage in reverse traversal order.`,
        nums, i, [{label:"i",value:String(i)}],
        null, reversed.slice(nums.length - 1 - i).map((value,index)=>({label:String(index),value:String(value)})), 1);
    }
    push("Reversed list ready", "The values are read in reverse order and can be used to construct the reversed list.",
      reversed, null, [], JSON.stringify(reversed), [], 3);
    return steps;
  }

  if (id === "20") {
    const source = raw.trim().replace(/^["']|["']$/g, "");
    const stack: string[] = [];
    const pairs: Record<string,string> = {")":"(","]":"[","}":"{"};
    for (let i = 0; i < source.length; i++) {
      const char = source[i];
      if ("([{".includes(char)) stack.push(char);
      else if (")]}" .includes(char)) {
        const index = stack.lastIndexOf(pairs[char]);
        if (index >= 0) stack.splice(index, 1);
      }
      push(`Inspect character ${i}`, `Read '${char}'. The baseline repeatedly searches and removes matching bracket pairs.`,
        nums, i, [{label:"character",value:char},{label:"position",value:String(i)}],
        null, stack.map((value,index)=>({label:String(index),value})), 1);
    }
    const valid = stack.length === 0 && source.length > 0;
    push("Bracket scan complete", `Remaining unmatched opening brackets: ${stack.length}.`,
      nums, null, [], String(valid), stack.map((value,index)=>({label:String(index),value})), 3);
    return steps;
  }

  return [makeStep("Brute-force trace unavailable",
    "This problem needs a dedicated baseline trace before its approach can be selected.",
    nums, null, 1)];
}

export type { Approach };
