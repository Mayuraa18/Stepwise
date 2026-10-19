
import type {
  VisualizationData,
  VisualizationItem,
  VisualizationKind,
} from "../engine/types.ts";

type MemoryItem = {
  label: string;
  value: string;
};

type VisualizationRendererProps = {
  kind: VisualizationKind;
  data?: VisualizationData;
  fallbackItems: MemoryItem[];
  emptyStateLabel: string;
};

const itemStyle: React.CSSProperties = {
  minWidth: 0,
  padding: "10px 12px",
  border: "1px solid var(--border-color)",
  borderRadius: 8,
  background: "var(--soft-bg)",
  color: "var(--text-color)",
  overflowWrap: "anywhere",
};

const centeredRowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  alignItems: "center",
  gap: 8,
  width: "100%",
  minWidth: 0,
};

function EmptyState({ label }: { label: string }) {
  return <span className="empty-state">{label}</span>;
}

function ItemCard({ item }: { item: VisualizationItem }) {
  return (
    <div
      style={{
        ...itemStyle,
        textAlign: "center",
        borderColor: item.active
          ? "var(--accent-color)"
          : "var(--border-color)",
        background: item.active
          ? "var(--active-bg)"
          : "var(--soft-bg)",
      }}
    >
      <span
        style={{
          display: "block",
          marginBottom: 4,
          fontSize: 11,
          color: "var(--muted-color)",
        }}
      >
        {item.label}
      </span>
      <strong>{item.value}</strong>
    </div>
  );
}

function KeyValueEntries({ items }: { items: MemoryItem[] }) {
  return (
    <div className="hash-map">
      {items.map((item, index) => (
        <span className="map-entry" key={`${item.label}-${index}`}>
          {item.label.startsWith("Set ") ? item.value : `${item.label} → ${item.value}`}
        </span>
      ))}
    </div>
  );
}

function PointerLabels({
  item,
  pointers,
}: {
  item: VisualizationItem;
  pointers: Record<string, string | number | null>;
}) {
  const names = Object.entries(pointers)
    .filter(([, target]) => target === item.id)
    .map(([name]) => name);

  if (names.length === 0) return null;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: 4,
        marginBottom: 6,
      }}
    >
      {names.map((name) => (
        <span
          key={name}
          style={{
            padding: "3px 6px",
            borderRadius: 5,
            background: "var(--active-bg)",
            border: "1px solid var(--accent-color)",
            color: "var(--text-color)",
            fontSize: 10,
            fontWeight: 600,
          }}
        >
          {name}
        </span>
      ))}
    </div>
  );
}

function PointerSummary({
  pointers,
}: {
  pointers: Record<string, string | number | null>;
}) {
  const entries = Object.entries(pointers);

  if (entries.length === 0) return null;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 8,
        width: "100%",
        marginTop: 12,
      }}
    >
      {entries.map(([name, target]) => (
        <div
          key={name}
          style={{
            padding: "7px 10px",
            border: "1px solid var(--border-color)",
            borderRadius: 7,
            background: "var(--soft-bg)",
            fontSize: 11,
            overflowWrap: "anywhere",
          }}
        >
          <strong>{name}</strong>
          <span style={{ color: "var(--muted-color)" }}> → </span>
          {target ?? "null"}
        </div>
      ))}
    </div>
  );
}

export default function VisualizationRenderer({
  kind,
  data,
  fallbackItems,
  emptyStateLabel,
}: VisualizationRendererProps) {
  const stack = data?.stack;
  const entries = data?.entries;
  const items = data?.items ?? [];
  const edges = data?.edges ?? [];
  const pointers = data?.pointers ?? {};

  if (kind === "stack" || (kind === "string" && stack !== undefined)) {
    const stackItems = stack ?? [];

    if (stackItems.length === 0) {
      return <EmptyState label={emptyStateLabel} />;
    }

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column-reverse",
          alignItems: "stretch",
          gap: 6,
          width: "100%",
          maxWidth: 320,
          marginInline: "auto",
          paddingInline: 18,
        }}
        aria-label="Stack visualization"
      >
        {stackItems.map((item, index) => (
          <div
            key={item.id}
            style={{
              ...itemStyle,
              textAlign: "center",
              borderColor:
                index === stackItems.length - 1
                  ? "var(--accent-color)"
                  : "var(--border-color)",
            }}
          >
            <span
              style={{
                display: "block",
                fontSize: 10,
                color: "var(--muted-color)",
              }}
            >
              {index === stackItems.length - 1 ? "TOP · " : ""}
              {item.label}
            </span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>
    );
  }

  if (kind === "hash-map") {
    const mapItems = entries ?? fallbackItems;

    return mapItems.length > 0 ? (
      <KeyValueEntries items={mapItems} />
    ) : (
      <EmptyState label={emptyStateLabel} />
    );
  }

  if (kind === "linked-list") {
    if (items.length === 0) {
      return <EmptyState label={emptyStateLabel} />;
    }

    return (
      <div
        style={{
          display: "grid",
          justifyItems: "center",
          gap: 12,
          width: "100%",
          minWidth: 0,
          padding: "0 18px",
        }}
        aria-label="Linked list visualization"
      >
        <div style={centeredRowStyle}>
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minWidth: 70,
              }}
            >
              <PointerLabels item={item} pointers={pointers} />
              <ItemCard item={item} />
            </div>
          ))}
        </div>

        <div
          style={{
            width: "100%",
            maxWidth: 560,
            padding: 12,
            border: "1px solid var(--border-color)",
            borderRadius: 8,
            fontSize: 12,
            overflowWrap: "anywhere",
          }}
        >
          <strong style={{ display: "block", marginBottom: 8 }}>
            Next connections
          </strong>

          {edges.length > 0 ? (
            edges.map(([from, to], index) => (
              <div key={`${from}-${to}-${index}`}>
                {from} → {to}
              </div>
            ))
          ) : (
            <span style={{ color: "var(--muted-color)" }}>
              No next connections in this step.
            </span>
          )}
        </div>

        <PointerSummary pointers={pointers} />
      </div>
    );
  }

  if (kind === "tree" || kind === "graph") {
    if (items.length === 0) {
      return <EmptyState label={emptyStateLabel} />;
    }

    return (
      <div
        style={{
          display: "grid",
          justifyItems: "center",
          gap: 12,
          width: "100%",
          minWidth: 0,
          paddingInline: 18,
        }}
        aria-label={`${kind} visualization`}
      >
        <div style={centeredRowStyle}>
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>

        <div
          style={{
            width: "100%",
            maxWidth: 560,
            padding: 10,
            border: "1px solid var(--border-color)",
            borderRadius: 8,
            fontSize: 12,
            overflowWrap: "anywhere",
          }}
        >
          <strong style={{ display: "block", marginBottom: 8 }}>
            Connections
          </strong>

          {edges.length > 0 ? (
            edges.map(([from, to], index) => (
              <div key={`${from}-${to}-${index}`}>
                {from} → {to}
              </div>
            ))
          ) : (
            <span style={{ color: "var(--muted-color)" }}>
              No connections in this step.
            </span>
          )}
        </div>
      </div>
    );
  }

  if (items.length > 0) {
    return (
      <div
        style={{
          ...centeredRowStyle,
          paddingInline: 18,
          boxSizing: "border-box",
        }}
      >
        {items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    );
  }

  return fallbackItems.length > 0 ? (
    <KeyValueEntries items={fallbackItems} />
  ) : (
    <EmptyState label={emptyStateLabel} />
  );
}
