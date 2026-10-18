import type {
  ExecutionStep,
  ResultStatus,
  VisualStep,
} from "./types.ts";

type TraceVariable = {
  label: string;
  value: string;
};

type TraceOptions<State> = {
  getArray: (state: State) => number[];
  getCurrentIndex: (state: State) => number | null;
  getVariables: (state: State) => TraceVariable[];
  getMemory: (state: State) => TraceVariable[];
  getResult: (state: State) => unknown;
  getResultStatus?: (state: State) => ResultStatus | undefined;
  getActiveRange?: (state: State) => [number, number] | undefined;
};

export function formatTraceValue(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";

  if (typeof value === "string") return value;

  if (
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "bigint"
  ) {
    return String(value);
  }

  try {
    const serialized = JSON.stringify(value);
    return serialized ?? String(value);
  } catch {
    return String(value);
  }
}

export function serializeTraceResult(
  result: unknown,
): string | null {
  return result == null ? null : formatTraceValue(result);
}

export function inferResultStatus(
  result: unknown,
): ResultStatus | undefined {
  if (result == null) return "info";
  if (typeof result === "boolean") {
    return result ? "success" : "failure";
  }

  return "success";
}

export function createVisualTrace<State>(
  steps: ExecutionStep<State>[],
  options: TraceOptions<State>,
): VisualStep[] {
  return steps.map(({ state, ...step }) => {
    const array = options.getArray(state);

    return {
      title: step.title,
      explanation: step.explanation,
      line: step.codeLine,
      pseudocodeLine: step.pseudocodeLine,
      currentIndex: options.getCurrentIndex(state),
      array: [...array],
      variables: options.getVariables(state).map((item) => ({ ...item })),
      memory: options.getMemory(state).map((item) => ({ ...item })),
      result: serializeTraceResult(options.getResult(state)),
      resultStatus:
        options.getResultStatus?.(state) ??
        inferResultStatus(options.getResult(state)),
      ...(options.getActiveRange
        ? (() => {
            const range = options.getActiveRange!(state);
            return range
              ? { activeRange: [range[0], range[1]] as [number, number] }
              : {};
          })()
        : {}),
    };
  });
}
