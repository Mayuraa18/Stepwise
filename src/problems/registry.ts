
import type { Problem } from "../engine/types.ts";
import { adaptProblem } from "./adapt-problem.ts";
import { twoSumProblem } from "./two-sum.ts";
import { binarySearchProblem } from "./binary-search.ts";

export const modularProblems: Problem[] = [
  adaptProblem(twoSumProblem),
  adaptProblem(binarySearchProblem),
];
