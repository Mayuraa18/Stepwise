
import type {
  ExecutionStep,
  ProblemDefinition,
} from "../engine/types.ts";
import {
  MAX_RAW_INPUT_LENGTH,
  MAX_VISUALIZATION_ITEMS,
} from "../engine/limits.ts";

type ReverseInput = {
  values: number[];
};

type Node = {
  id: string;
  value: number;
  nextId: string | null;
};

type ReverseState = {
  values: number[];
  nodes: Node[];
  previousId: string | null;
  currentId: string | null;
  nextId: string | null;
  currentIndex: number | null;
  result: number[] | null;
};

function parseInput(rawInput: string): ReverseInput {
  if (rawInput.length > MAX_RAW_INPUT_LENGTH) {
    throw new Error(
      `Input is too long. Maximum: ${MAX_RAW_INPUT_LENGTH} characters.`,
    );
  }

  const tokens = rawInput.trim().split(/[,\s]+/).filter(Boolean);

  if (
    tokens.length === 0 ||
    tokens.length > MAX_VISUALIZATION_ITEMS
  ) {
    throw new Error(
      `Enter between 1 and ${MAX_VISUALIZATION_ITEMS} integers.`,
    );
  }

  if (tokens.some((token) => !/^-?\d+$/.test(token))) {
    throw new Error("Enter integers separated by commas or spaces.");
  }

  const values = tokens.map(Number);

  if (
    values.some(
      (value) =>
        !Number.isSafeInteger(value) ||
        Math.abs(value) > 1_000_000_000,
    )
  ) {
    throw new Error(
      "Enter safe integers between -1,000,000,000 and 1,000,000,000.",
    );
  }

  return { values };
}

function solve({ values }: ReverseInput): number[] {
  return [...values].reverse();
}

function createSteps({
  values,
}: ReverseInput): ExecutionStep<ReverseState>[] {
  const nodes: Node[] = values.map((value, index) => ({
    id: `node-${index}`,
    value,
    nextId: index + 1 < values.length ? `node-${index + 1}` : null,
  }));

  const steps: ExecutionStep<ReverseState>[] = [];

  let previousId: string | null = null;
  let currentId: string | null = nodes[0]?.id ?? null;
  let currentIndex: number | null = currentId === null ? null : 0;

  const snapshot = (
    result: number[] | null = null,
    nextPointerId?: string | null,
  ): ReverseState => {
    const currentNode = nodes.find((node) => node.id === currentId);

    return {
      values: [...values],
      nodes: nodes.map((node) => ({ ...node })),
      previousId,
      currentId,
      nextId: nextPointerId === undefined
        ? currentNode?.nextId ?? null
        : nextPointerId,
      currentIndex,
      result: result === null ? null : [...result],
    };
  };

  steps.push({
    id: "initialize",
    codeLine: 2,
    pseudocodeLine: 1,
    title: "Initialize pointers",
    explanation:
      "Previous starts at null. Current points to the head of the list.",
    state: snapshot(),
  });

  while (currentId !== null) {
    const currentNode = nodes.find((node) => node.id === currentId);

    if (!currentNode) {
      throw new Error("Invalid linked-list pointer in execution state.");
    }

    // Save the original next node before changing the connection.
    const nextId = currentNode.nextId;

    // Reverse the current node's connection.
    currentNode.nextId = previousId;

    // Advance the pointers using the saved next node.
    previousId = currentId;
    currentId = nextId;

    const processedIndex = Number(previousId.replace("node-", ""));

    currentIndex = currentId === null
      ? null
      : Number(currentId.replace("node-", ""));

    steps.push({
      id: `reverse-${processedIndex}`,
      codeLine: 6,
      pseudocodeLine: 4,
      title: `Reverse connection at node ${currentNode.value}`,
      explanation:
        `Saved next as ${nextId ?? "null"}. Changed ${currentNode.id}'s next connection to ${
          currentNode.nextId ?? "null"
        }, then advanced the pointers.`,
      // Preserve the saved next pointer for this execution step.
      state: snapshot(null, nextId),
    });
  }

  const reversedValues: number[] = [];
  let cursor = previousId;

  while (cursor !== null) {
    const node = nodes.find((item) => item.id === cursor);

    if (!node) {
      throw new Error("Invalid linked-list connection in result.");
    }

    reversedValues.push(node.value);
    cursor = node.nextId;
  }

  steps.push({
    id: "complete",
    codeLine: 8,
    pseudocodeLine: 6,
    title: "Reversal complete",
    explanation: `The reversed list is ${reversedValues.join(" → ")}.`,
    state: snapshot(reversedValues, null),
  });

  return steps;
}

export const reverseLinkedListProblem: ProblemDefinition<
  ReverseInput,
  number[],
  ReverseState
> = {
  id: "reverse-linked-list",
  leetcodeNumber: 206,
  title: "Reverse Linked List",
  difficulty: "Easy",
  description:
    "Reverse a singly linked list by changing its next connections.",
  examples: [
    {
      input: "1, 2, 3, 4, 5",
      output: "[5, 4, 3, 2, 1]",
      explanation:
        "Each node points to its previous node, reversing the list.",
    },
    {
      input: "1, 2",
      output: "[2, 1]",
      explanation: "The two nodes exchange their direction.",
    },
    {
      input: "7",
      output: "[7]",
      explanation: "A one-node list remains unchanged.",
    },
  ],
  constraints: [
    `1 <= number of nodes <= ${MAX_VISUALIZATION_ITEMS}`,
    "Node values are safe integers between -1,000,000,000 and 1,000,000,000.",
  ],
  tags: ["Linked List"],
  inputHint: "Integer values separated by commas (example: 1, 2, 3, 4, 5)",
  defaultInput: "1, 2, 3, 4, 5",
  bestCase: "O(n); every node must be visited.",
  averageCase: "O(n); every node is visited once.",
  worstCase: "O(n); every node is visited once.",
  memoryNote:
    "O(1) auxiliary space for an in-place reversal, excluding visualization snapshots.",
  pseudocode: [
    "Set previous to null and current to head",
    "While current is not null",
    "  Save current.next as next",
    "  Set current.next to previous",
    "  Advance previous and current",
    "Return previous as the new head",
  ],
  solutions: {
    Python: [
      "def reverseList(head):",
      "    prev = None",
      "    current = head",
      "    while current:",
      "        next_node = current.next",
      "        current.next = prev",
      "        prev = current",
      "        current = next_node",
      "    return prev",
    ],
    "C++": [
      "ListNode* reverseList(ListNode* head) {",
      "    ListNode* prev = nullptr;",
      "    ListNode* current = head;",
      "    while (current != nullptr) {",
      "        ListNode* next = current->next;",
      "        current->next = prev;",
      "        prev = current;",
      "        current = next;",
      "    }",
      "    return prev;",
      "}",
    ],
    Java: [
      "ListNode reverseList(ListNode head) {",
      "    ListNode prev = null;",
      "    ListNode current = head;",
      "    while (current != null) {",
      "        ListNode next = current.next;",
      "        current.next = prev;",
      "        prev = current;",
      "        current = next;",
      "    }",
      "    return prev;",
      "}",
    ],
  },
  complexity: {
    time: "O(n)",
    timeExplanation: "Each node is visited exactly once.",
    space: "O(1)",
    spaceExplanation:
      "The iterative algorithm uses a constant number of pointers, excluding visualization snapshots.",
  },
  parseInput,
  solve,
  createSteps,
};
