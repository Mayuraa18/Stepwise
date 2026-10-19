import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import VisualizationRenderer from "../VisualizationRenderer.tsx";
import type {
  VisualizationData,
  VisualizationKind,
} from "../../engine/types.ts";

type Props = {
  kind: VisualizationKind;
  data?: VisualizationData;
  fallbackItems?: { label: string; value: string }[];
  emptyStateLabel?: string;
};

function renderRenderer({
  kind,
  data,
  fallbackItems = [],
  emptyStateLabel = "Nothing to display",
}: Props) {
  return renderToStaticMarkup(
    createElement(VisualizationRenderer, {
      kind,
      data,
      fallbackItems,
      emptyStateLabel,
    }),
  );
}

describe("VisualizationRenderer", () => {

  it("shows previous, current, and next pointer labels", () => {
    const html = renderRenderer({
      kind: "linked-list",
      data: {
        items: [
          { id: "n1", label: "Node 1", value: "10" },
          { id: "n2", label: "Node 2", value: "20" },
          { id: "n3", label: "Node 3", value: "30" },
        ],
        edges: [["n1", "n2"], ["n2", "n3"]],
        pointers: {
          previous: "n1",
          current: "n2",
          next: "n3",
        },
      },
    });

    expect(html).toContain(">previous</span>");
    expect(html).toContain(">current</span>");
    expect(html).toContain(">next</span>");
    expect(html).toContain("<strong>previous</strong>");
    expect(html).toContain("<strong>current</strong>");
    expect(html).toContain("<strong>next</strong>");

    expect(html).toContain("→ </span>n1");
    expect(html).toContain("→ </span>n2");
    expect(html).toContain("→ </span>n3");
  });

  it("renders stack items with the top element identified", () => {
    const html = renderRenderer({
      kind: "stack",
      data: {
        stack: [
          { id: "s1", label: "stack 1", value: "(" },
          { id: "s2", label: "stack 2", value: "[" },
        ],
      },
    });

    expect(html).toContain("Stack visualization");
    expect(html).toContain("TOP");
    expect(html).toContain("(");
    expect(html).toContain("[");
  });

  it("shows the empty state for an empty stack", () => {
    const html = renderRenderer({
      kind: "stack",
      data: { stack: [] },
      emptyStateLabel: "Stack is empty",
    });

    expect(html).toContain("Stack is empty");
  });

  it("renders hash-map key-value entries", () => {
    const html = renderRenderer({
      kind: "hash-map",
      data: {
        entries: [
          { id: "e1", label: "key", value: "alpha" },
          { id: "e2", label: "count", value: "3" },
        ],
      },
    });

    expect(html).toContain("key");
    expect(html).toContain("alpha");
    expect(html).toContain("count");
    expect(html).toContain("3");
  });

  it("uses fallback memory when hash-map entries are missing", () => {
    const html = renderRenderer({
      kind: "hash-map",
      fallbackItems: [{ label: "visited", value: "true" }],
    });

    expect(html).toContain("visited");
    expect(html).toContain("true");
  });

  it("renders seen-set entries as values rather than key-value pairs", () => {
    const html = renderRenderer({
      kind: "hash-map",
      data: {
        entries: [
          { id: "set-0", label: "Set 1", value: "4" },
          { id: "set-1", label: "Set 2", value: "9" },
        ],
      },
    });

    expect(html).toContain(">4</span>");
    expect(html).toContain(">9</span>");
    expect(html).not.toContain("Set 1 → 4");
  });

  it("renders linked-list nodes and their connections", () => {
    const html = renderRenderer({
      kind: "linked-list",
      data: {
        items: [
          { id: "n1", label: "Node 1", value: "10" },
          { id: "n2", label: "Node 2", value: "20" },
        ],
        edges: [["n1", "n2"]],
      },
    });

    expect(html).toContain("Linked list visualization");
    expect(html).toContain("Node 1");
    expect(html).toContain("Node 2");
    expect(html).toContain("n1");
    expect(html).toContain("n2");
  });

  it("renders tree nodes and edges", () => {
    const html = renderRenderer({
      kind: "tree",
      data: {
        items: [
          { id: "root", label: "Root", value: "8" },
          { id: "left", label: "Left", value: "4" },
          { id: "right", label: "Right", value: "12" },
        ],
        edges: [
          ["root", "left"],
          ["root", "right"],
        ],
      },
    });

    expect(html).toContain("tree visualization");
    expect(html).toContain("Root");
    expect(html).toContain("Left");
    expect(html).toContain("Right");
    expect(html).toContain("root");
  });

  it("renders graph nodes and edges", () => {
    const html = renderRenderer({
      kind: "graph",
      data: {
        items: [
          { id: "a", label: "Vertex A", value: "A" },
          { id: "b", label: "Vertex B", value: "B" },
        ],
        edges: [["a", "b"]],
      },
    });

    expect(html).toContain("graph visualization");
    expect(html).toContain("Vertex A");
    expect(html).toContain("Vertex B");
    expect(html).toContain("a");
    expect(html).toContain("b");
  });

  it("renders the configured empty state when tree data is empty", () => {
    const html = renderRenderer({
      kind: "tree",
      data: { items: [] },
      emptyStateLabel: "Tree is empty",
    });

    expect(html).toContain("Tree is empty");
  });

  it("renders generic items for array visualization data", () => {
    const html = renderRenderer({
      kind: "array",
      data: {
        items: [
          { id: "i1", label: "index 0", value: "5" },
          { id: "i2", label: "index 1", value: "9", active: true },
        ],
      },
    });

    expect(html).toContain("index 0");
    expect(html).toContain("index 1");
    expect(html).toContain("5");
    expect(html).toContain("9");
  });

});
