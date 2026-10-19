import type {
  ExecutionStep,
  ProblemDefinition,
} from "../engine/types.ts";
import { adaptGraphProblem, type GraphInput, type GraphState } from "./adapt-graph-problem.ts";

const MAX_TREE_NODES = 127;

type LevelOrderValue = number | null;

function parseLevelOrder(raw: string): GraphInput {
  if (raw.length > 10_000) {
    throw new Error("Tree input is too long. Maximum: 10000 characters.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Enter a JSON level-order array, for example [1,null,2,3].');
  }

  const values: unknown = Array.isArray(parsed)
    ? parsed
    : parsed && typeof parsed === "object" && "root" in parsed
      ? (parsed as { root: unknown }).root
      : undefined;

  if (!Array.isArray(values)) {
    throw new Error('Tree input must be a level-order array or an object with a "root" array.');
  }
  if (values.length > MAX_TREE_NODES) {
    throw new Error(`Keep the tree to ${MAX_TREE_NODES} values or fewer.`);
  }
  if (!values.every(
    (value): value is LevelOrderValue =>
      value === null || (typeof value === "number" && Number.isSafeInteger(value)),
  )) {
    throw new Error("Tree values must be safe integers or null.");
  }
  if (values.length === 0 || values[0] === null) {
    if (values.slice(1).some((value) => value !== null)) {
      throw new Error("A tree cannot contain non-null nodes when its root is null.");
    }
    return { nodes: [], edges: [] };
  }

  const nodes: GraphInput["nodes"] = [];
  const edges: GraphInput["edges"] = [];
  const queue: Array<{ id: string; value: number }> = [];
  let nextId = 0;

  const root = { id: `n${nextId++}`, value: values[0] };
  nodes.push(root);
  queue.push(root);

  let cursor = 1;
  while (cursor < values.length) {
    const parent = queue.shift();
    if (!parent) {
      if (values.slice(cursor).some((value) => value !== null)) {
        throw new Error("Level-order input contains nodes without a valid parent.");
      }
      break;
    }

    for (let childIndex = 0; childIndex < 2 && cursor < values.length; childIndex++, cursor++) {
      const value = values[cursor];
      if (value === null) continue;

      const child = { id: `n${nextId++}`, value };
      nodes.push(child);
      queue.push(child);
      edges.push([parent.id, child.id]);
    }
  }

  return { nodes, edges, startId: root.id };
}

type TreeInput = GraphInput;

type TreeState = GraphState & {
  traversal: number[];
};

function leftChild(edges: GraphInput["edges"], parentId: string): string | null {
  return edges.find(([from]) => from === parentId)?.[1] ?? null;
}

function childrenByParent(edges: GraphInput["edges"]): Map<string, string[]> {
  const children = new Map<string, string[]>();
  for (const [from, to] of edges) {
    const current = children.get(from) ?? [];
    current.push(to);
    children.set(from, current);
  }
  return children;
}

function parseInput(raw: string): TreeInput {
  return parseLevelOrder(raw);
}

function solve(input: TreeInput): number[] {
  const children = childrenByParent(input.edges);
  const nodesById = new Map(input.nodes.map((node) => [node.id, node.value]));
  const output: number[] = [];
  const stack: string[] = [];
  let current = input.nodes[0]?.id ?? null;

  while (current !== null || stack.length > 0) {
    while (current !== null) {
      stack.push(current);
      current = children.get(current)?.[0] ?? null;
    }
    const id = stack.pop();
    if (id === undefined) break;
    output.push(nodesById.get(id)!);
    current = children.get(id)?.[1] ?? null;
  }
  return output;
}

function createSteps(input: TreeInput): ExecutionStep<TreeState>[] {
  const steps: ExecutionStep<TreeState>[] = [];
  const children = childrenByParent(input.edges);
  const nodesById = new Map(input.nodes.map((node) => [node.id, node.value]));
  const stack: string[] = [];
  const visited: string[] = [];
  const traversal: number[] = [];
  let current = input.nodes[0]?.id ?? null;

  const snapshot = (currentNodeId: string | null, result: number[] | null): TreeState => ({
    nodes: input.nodes.map((node) => ({ ...node })),
    edges: input.edges.map(([from, to]) => [from, to] as [string, string]),
    currentNodeId,
    visited: [...visited],
    stack: [...stack],
    result: result === null ? null : [...result],
    traversal: [...traversal],
  });

  steps.push({
    id: "initialize",
    codeLine: 1,
    pseudocodeLine: 1,
    title: "Initialize inorder traversal",
    explanation: "Start at the root. Inorder visits the left subtree, then the node, then the right subtree.",
    state: snapshot(current, null),
  });

  while (current !== null || stack.length > 0) {
    while (current !== null) {
      stack.push(current);
      steps.push({
        id: `push-${current}`,
        codeLine: 3,
        pseudocodeLine: 2,
        title: `Push node ${nodesById.get(current)}`,
        explanation: "Keep this node on the stack while moving left to find the next inorder value.",
        state: snapshot(current, null),
      });
      current = children.get(current)?.[0] ?? null;
    }

    const id = stack.pop();
    if (id === undefined) break;
    visited.push(id);
    traversal.push(nodesById.get(id)!);
    steps.push({
      id: `visit-${id}`,
      codeLine: 5,
      pseudocodeLine: 3,
      title: `Visit node ${nodesById.get(id)}`,
      explanation: "There is no unvisited left child, so emit this node and then explore its right subtree.",
      state: snapshot(id, null),
    });
    current = children.get(id)?.[1] ?? null;
  }

  steps.push({
    id: "complete",
    codeLine: 7,
    pseudocodeLine: 4,
    title: "Inorder traversal complete",
    explanation: "Every node was visited in left-node-right order.",
    state: snapshot(null, traversal),
  });

  return steps;
}

export const binaryTreeInorderProblem: ProblemDefinition<TreeInput, number[], TreeState> = {
  id: "binary-tree-inorder-traversal",
  leetcodeNumber: 94,
  title: "Binary Tree Inorder Traversal",
  difficulty: "Easy",
  description: "Return the values of a binary tree in left-node-right order.",
  inputHint: 'Enter level-order JSON, for example [1,null,2,3].',
  defaultInput: "[1,null,2,3]",
  bestCase: "O(n)",
  averageCase: "O(n)",
  worstCase: "O(n)",
  memoryNote: "The explicit stack uses O(h) space, where h is the tree height.",
  examples: [{
    input: "[1,null,2,3]",
    output: "[1,3,2]",
    explanation: "Visit the left subtree first, then the root, then the right subtree.",
  }],
  constraints: [
    `The tree contains at most ${MAX_TREE_NODES} level-order values.`,
    "Node values are safe integers.",
  ],
  tags: ["Tree", "Depth-First Search", "Stack"],
  pseudocode: [
    "Initialize current at the root",
    "Push current nodes and move left",
    "Pop, visit the node, then move right",
    "Repeat until current and stack are empty",
  ],
  solutions: {
    Python: [
      "stack, result = [], []",
      "current = root",
      "while current or stack:",
      "    while current:",
      "        stack.append(current)",
      "        current = current.left",
      "    current = stack.pop()",
      "    result.append(current.val)",
      "    current = current.right",
    ],
    "C++": [
      "stack<TreeNode*> st;",
      "vector<int> result;",
      "TreeNode* current = root;",
      "while (current || !st.empty()) {",
      "    while (current) { st.push(current); current = current->left; }",
      "    current = st.top(); st.pop();",
      "    result.push_back(current->val);",
      "    current = current->right;",
      "}",
    ],
    Java: [
      "Deque<TreeNode> stack = new ArrayDeque<>();",
      "List<Integer> result = new ArrayList<>();",
      "TreeNode current = root;",
      "while (current != null || !stack.isEmpty()) {",
      "    while (current != null) { stack.push(current); current = current.left; }",
      "    current = stack.pop();",
      "    result.add(current.val);",
      "    current = current.right;",
      "}",
    ],
  },
  complexity: {
    time: "O(n)",
    timeExplanation: "Every node is pushed and popped at most once.",
    space: "O(h)",
    spaceExplanation: "The explicit stack holds the current root-to-leaf path.",
  },
  parseInput,
  solve,
  createSteps,
};
