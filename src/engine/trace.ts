import type {
   ExecutionStep,
   ResultStatus,
   VisualStep,
   VisualizationData,
   VisualizationItem,
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
   getStack?: (state: State) => string[];
   getResultStatus?: (state: State) => ResultStatus | undefined;
   getActiveRange?: (state: State) => [number, number] | undefined;
   getVisualization?: (
      state: State,
   ) => Partial<VisualizationData>;
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

function createItems(
   values: string[],
   prefix: string,
): VisualizationItem[] {
   return values.map((value, index) => ({
      id: `${prefix}-${index}`,
      label: `${prefix} ${index + 1}`,
      value,
   }));
}

export function createVisualTrace<State>(
   steps: ExecutionStep<State>[],
   options: TraceOptions<State>,
): VisualStep[] {
   return steps.map(({ state, ...step }) => {
      const array = options.getArray(state);
      const currentIndex = options.getCurrentIndex(state);
      const variables = options
         .getVariables(state)
         .map((item) => ({ ...item }));
      const memory = options
         .getMemory(state)
         .map((item) => ({ ...item }));
      const result = options.getResult(state);
      const stack = options.getStack?.(state);

      const visualization: VisualizationData = {
         items: array.map((value, index) => ({
            id: `item-${index}`,
            label: `index ${index}`,
            value: String(value),
            active: currentIndex === index,
         })),
         entries: memory.map((item, index) => ({
            id: `entry-${index}`,
            label: item.label,
            value: item.value,
         })),
         ...(stack !== undefined
            ? { stack: createItems(stack, "stack") }
            : {}),
         ...options.getVisualization?.(state),
      };

      return {
         title: step.title,
         explanation: step.explanation,
         line: step.codeLine,
         pseudocodeLine: step.pseudocodeLine,
         currentIndex,
         array: [...array],
         variables,
         memory,
         visualization,
         result: serializeTraceResult(result),
         resultStatus:
            options.getResultStatus?.(state) ??
            inferResultStatus(result),
         ...(options.getActiveRange
            ? (() => {
               const range = options.getActiveRange!(state);
               return range
                  ? {
                     activeRange: [
                        range[0],
                        range[1],
                     ] as [number, number],
                  }
                  : {};
            })()
            : {}),
      };
   });
}
