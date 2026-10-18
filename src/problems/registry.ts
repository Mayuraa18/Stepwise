
import type { Problem } from "../engine/types.ts";
import { adaptProblem } from "./adapt-problem.ts";
import { adaptArrayProblem } from "./adapt-array-problem.ts";
import { adaptStringProblem } from "./adapt-string-problem.ts";
import { twoSumProblem } from "./two-sum.ts";
import { binarySearchProblem } from "./binary-search.ts";
import { bestTimeToBuySellStockProblem } from "./best-time-to-buy-sell-stock.ts";
import { maximumSubarrayProblem } from "./maximum-subarray.ts";
import { validParenthesesProblem } from "./valid-parentheses.ts";

export const modularProblems: Problem[] = [
  adaptProblem(twoSumProblem),
  adaptProblem(binarySearchProblem),
  adaptArrayProblem(bestTimeToBuySellStockProblem),
  adaptArrayProblem(maximumSubarrayProblem),
  adaptStringProblem(validParenthesesProblem),
];
