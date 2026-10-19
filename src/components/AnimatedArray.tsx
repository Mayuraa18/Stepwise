import { Component, createRef } from "react";

type AnimatedArrayProps = {
  values: number[];
  itemIds?: string[];
  currentIndex: number | null;
  activeRange?: [number, number];
  matchedIndexes?: number[];
  pointerLabels?: Record<number, string[]>;
  label?: string;
};

type Token = { id: string; value: number };
type AnimatedArrayState = { tokens: Token[] };

function tokensFromProps(props: AnimatedArrayProps): Token[] {
  return props.values.map((value, index) => ({
    id: props.itemIds?.[index] ?? `slot-${index}`,
    value,
  }));
}

function sameTokens(a: Token[], b: Token[]): boolean {
  return a.length === b.length &&
    a.every((token, i) => token.id === b[i].id && token.value === b[i].value);
}

export default class AnimatedArray extends Component<
  AnimatedArrayProps,
  AnimatedArrayState
> {
  private itemRefs = new Map<string, HTMLDivElement>();
  private gridRef = createRef<HTMLDivElement>();

  constructor(props: AnimatedArrayProps) {
    super(props);
    this.state = { tokens: tokensFromProps(props) };
  }

  static getDerivedStateFromProps(
    props: AnimatedArrayProps,
    state: AnimatedArrayState,
  ): Partial<AnimatedArrayState> | null {
    const next = tokensFromProps(props);
    return sameTokens(state.tokens, next) ? null : { tokens: next };
  }

  getSnapshotBeforeUpdate(): Map<string, DOMRect> {
    const rects = new Map<string, DOMRect>();
    for (const [id, element] of this.itemRefs) {
      if (!element.isConnected) continue;

      // Finish any in-flight FLIP animation before measuring the previous layout.
      // Otherwise rapid stepping can measure a temporary transform and compound it.
      element.getAnimations().forEach((animation) => animation.cancel());
      rects.set(id, element.getBoundingClientRect());
    }
    return rects;
  }

  componentDidUpdate(
    _prevProps: Readonly<AnimatedArrayProps>,
    _prevState: Readonly<AnimatedArrayState>,
    before: Map<string, DOMRect>,
  ): void {
    if (
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) return;

    for (const token of this.state.tokens) {
      const element = this.itemRefs.get(token.id);
      const oldRect = before.get(token.id);
      if (!element || !oldRect) continue;

      const rect = element.getBoundingClientRect();
      const dx = oldRect.left - rect.left;
      const dy = oldRect.top - rect.top;
      if (dx === 0 && dy === 0) continue;

      element.animate(
        [
          { transform: `translate(${dx}px, ${dy}px)` },
          { transform: "translate(0, 0)" },
        ],
        {
          duration: 420,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        },
      );
    }
  }

  render() {
    const {
      values, currentIndex, activeRange, matchedIndexes = [], pointerLabels = {},
      label = "Algorithm state array",
    } = this.props;

    return (
      <div
        ref={this.gridRef}
        className="array animated-array"
        aria-label={label}
        style={{
          gridTemplateColumns: `repeat(${Math.min(Math.max(values.length, 1), 8)}, minmax(0, 1fr))`,
        }}
      >
        {this.state.tokens.map((token, index) => (
          <div
            ref={(element) => {
              if (element) this.itemRefs.set(token.id, element);
              else this.itemRefs.delete(token.id);
            }}
            className="array-item animated-array-item"
            key={token.id}
          >
            <div className="array-pointer-labels" aria-label={pointerLabels[index]?.join(", ") || undefined}>
              {(pointerLabels[index] ?? []).map((pointer) => (
                <span className="array-pointer" key={pointer}>{pointer}</span>
              ))}
            </div>
            <div
              className={[
                "array-value",
                currentIndex === index ? "selected" : "",
                matchedIndexes.includes(index) ? "matched" : "",
                activeRange && index >= activeRange[0] && index <= activeRange[1]
                  ? "in-range" : "",
              ].filter(Boolean).join(" ")}
            >
              {token.value}
            </div>
            <span className="array-index">index {index}</span>
          </div>
        ))}
      </div>
    );
  }
}
