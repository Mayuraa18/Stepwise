
import type {
  ExecutionStep,
  ProblemDefinition,
} from "../engine/types.ts";

type StockInput = {
  prices: number[];
};

type StockState = {
  prices: number[];
  currentIndex: number | null;
  currentPrice: number | null;
  minPrice: number | null;
  currentProfit: number | null;
  bestProfit: number;
  result: number | null;
};

const MAX_VISUALIZATION_ITEMS = 200;

function parseInput(rawInput: string): StockInput {
  if (rawInput.length > 10_000) {
    throw new Error("Input is too long. Keep it under 10,000 characters.");
  }

  const values = rawInput.trim().split(/[,\s]+/).filter(Boolean);

  if (
    values.length === 0 ||
    values.length > MAX_VISUALIZATION_ITEMS
  ) {
    throw new Error(
      `Enter between 1 and ${MAX_VISUALIZATION_ITEMS} daily prices.`
    );
  }

  const prices = values.map(Number);

  if (prices.some((price) => !Number.isFinite(price) || price < 0)) {
    throw new Error(
      "Enter non-negative daily prices separated by commas."
    );
  }

  return { prices };
}

function solve({ prices }: StockInput): number {
  let minPrice = Infinity;
  let bestProfit = 0;

  for (const price of prices) {
    minPrice = Math.min(minPrice, price);
    bestProfit = Math.max(bestProfit, price - minPrice);
  }

  return bestProfit;
}

function createSteps({
  prices,
}: StockInput): ExecutionStep<StockState>[] {
  const steps: ExecutionStep<StockState>[] = [];
  let minPrice = Infinity;
  let bestProfit = 0;

  // The input array is never mutated, so every snapshot can safely share it.
  const snapshot = (
    currentIndex: number | null,
    currentPrice: number | null,
    currentProfit: number | null,
    result: number | null = null,
  ): StockState => ({
    prices,
    currentIndex,
    currentPrice,
    minPrice: minPrice === Infinity ? null : minPrice,
    currentProfit,
    bestProfit,
    result,
  });

  steps.push({
    id: "initialize",
    codeLine: 2,
    pseudocodeLine: 1,
    title: "Initialize tracking values",
    explanation:
      "Track the lowest price seen so far and the best profit. Initially, the minimum is infinity and the best profit is zero.",
    state: snapshot(null, null, null),
  });

  prices.forEach((price, i) => {
    minPrice = Math.min(minPrice, price);

    steps.push({
      id: `check-day-${i}`,
      codeLine: 5,
      pseudocodeLine: 3,
      title: `Check day ${i + 1}`,
      explanation:
        `Today's price is ${price}. The lowest price seen through today is ${minPrice}.`,
      state: snapshot(i, price, null),
    });

    const profit = price - minPrice;
    bestProfit = Math.max(bestProfit, profit);

    steps.push({
      id: `profit-day-${i}`,
      codeLine: 6,
      pseudocodeLine: 4,
      title: "Update possible profit",
      explanation:
        `Selling today gives ${price} − ${minPrice} = ${profit}. ` +
        `The best profit so far is ${bestProfit}.`,
      state: snapshot(i, price, profit),
    });
  });

  steps.push({
    id: "complete",
    codeLine: 7,
    pseudocodeLine: 6,
    title: "Maximum profit",
    explanation:
      `The maximum achievable profit is ${bestProfit}. The algorithm never chooses a negative profit.`,
    state: snapshot(null, null, null, bestProfit),
  });

  return steps;
}

export const bestTimeToBuySellStockProblem: ProblemDefinition<
  StockInput,
  number,
  StockState
> = {
  id: "best-time-to-buy-sell-stock",
  leetcodeNumber: 121,
  title: "Best Time to Buy and Sell Stock",
  difficulty: "Easy",
  description:
    "Choose one day to buy and a later day to sell for the maximum profit.",
  examples: [
    {
      input: "prices = [7, 1, 5, 3, 6, 4]",
      output: "5",
      explanation: "Buy at 1 and sell later at 6 for a profit of 5.",
    },
    {
      input: "prices = [7, 6, 4, 3, 1]",
      output: "0",
      explanation: "Prices only decrease, so no profitable trade exists.",
    },
  ],
  constraints: [
    "1 <= prices.length <= 10^5",
    "0 <= prices[i] <= 10^4",
  ],
  tags: ["Array", "Dynamic Programming", "Greedy"],
  pseudocode: [
    "Set minimum price to infinity and best profit to zero",
    "For each day's price",
    "  Update the lowest price seen so far",
    "  Calculate profit if selling today",
    "  Keep the largest profit",
    "Return the best profit",
  ],
  solutions: {
    Python: [
      "def maxProfit(prices):",
      "    min_price = float('inf')",
      "    best = 0",
      "    for price in prices:",
      "        min_price = min(min_price, price)",
      "        best = max(best, price - min_price)",
      "    return best",
    ],
    "C++": [
      "int maxProfit(vector<int>& prices) {",
      "    int minPrice = INT_MAX, best = 0;",
      "    for (int price : prices) {",
      "        minPrice = min(minPrice, price);",
      "        best = max(best, price - minPrice);",
      "    }",
      "    return best;",
      "}",
    ],
    Java: [
      "int maxProfit(int[] prices) {",
      "    int minPrice = Integer.MAX_VALUE, best = 0;",
      "    for (int price : prices) {",
      "        minPrice = Math.min(minPrice, price);",
      "        best = Math.max(best, price - minPrice);",
      "    }",
      "    return best;",
      "}",
    ],
  },
  complexity: {
    time: "O(n)",
    timeExplanation:
      "Each price is processed once, with constant-time updates for the minimum and maximum profit.",
    space: "O(1)",
    spaceExplanation:
      "The algorithm maintains only the minimum price and best profit, excluding the input and visualization trace.",
  },
  parseInput,
  solve,
  createSteps,
};
