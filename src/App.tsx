
import { useEffect, useState } from "react";
import "./App.css";

type Step = {
  line: number;
  currentIndex: number | null;
  complement: number | null;
  seen: Record<string, number>;
  result: number[] | null;
  title: string;
  explanation: string;
};

const nums = [2, 7, 11, 15];
const target = 9;

const code = [
  "function twoSum(nums, target) {",
  "  const seen = new Map();",
  "  for (let i = 0; i < nums.length; i++) {",
  "    const complement = target - nums[i];",
  "    if (seen.has(complement)) {",
  "      return [seen.get(complement), i];",
  "    }",
  "    seen.set(nums[i], i);",
  "  }",
  "  return [];",
  "}",
];

const steps: Step[] = [
  {
    line: 2,
    currentIndex: null,
    complement: null,
    seen: {},
    result: null,
    title: "Initialize the hash map",
    explanation:
      "Create an empty map to remember numbers we have already visited and their indices.",
  },
  {
    line: 4,
    currentIndex: 0,
    complement: 7,
    seen: {},
    result: null,
    title: "Inspect the first number",
    explanation:
      "The current number is 2. We need 9 − 2 = 7. The map does not contain 7 yet.",
  },
  {
    line: 8,
    currentIndex: 0,
    complement: 7,
    seen: { "2": 0 },
    result: null,
    title: "Store the first number",
    explanation:
      "The complement was not found, so store 2 at index 0 for a future match.",
  },
  {
    line: 4,
    currentIndex: 1,
    complement: 2,
    seen: { "2": 0 },
    result: null,
    title: "Inspect the second number",
    explanation:
      "The current number is 7. Its complement is 9 − 7 = 2, which is already in the map.",
  },
  {
    line: 6,
    currentIndex: 1,
    complement: 2,
    seen: { "2": 0 },
    result: [0, 1],
    title: "Found the answer!",
    explanation:
      "Return indices [0, 1]. The values 2 and 7 add up to the target 9.",
  },
];

export default function App() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    try {
      return localStorage.getItem("leetvisual-theme") === "dark"
        ? "dark"
        : "light";
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;

    try {
      localStorage.setItem("leetvisual-theme", theme);
    } catch {
      // The theme still works if browser storage is unavailable.
    }
  }, [theme]);

  const [problem, setProblem] = useState("1");
  const [activeProblem, setActiveProblem] = useState("1");
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState("");

  const step = steps[stepIndex];

  function searchProblem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = problem.trim().toLowerCase();

    if (query === "1" || query === "two sum") {
      setActiveProblem("1");
      setStepIndex(0);
      setError("");
    } else {
      setError(
        "This MVP currently supports LeetCode #1 (Two Sum). More problems will be added next."
      );
    }
  }

  function reset() {
    setStepIndex(0);
  }

  function toggleTheme() {
    setTheme((current) => (current === "light" ? "dark" : "light"));
  }

  return (
    <main className="app">
      <header className="topbar">
        <a className="brand" href="/">
          <span className="brand-mark">L</span>
          LeetVisual
        </a>

        <div className="header-actions">
          <span className="topbar-label">
            Learn algorithms by watching them run
          </span>

          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
            title="Toggle theme"
          >
            {theme === "light" ? "☾ Dark" : "☀ Light"}
          </button>
        </div>
      </header>

      <section className="page">
        <div className="intro">
          <p className="eyebrow">INTERACTIVE DSA LAB</p>
          <h1>Understand the algorithm.</h1>
          <p className="subtitle">
            Follow every line, variable, and decision as the code executes.
          </p>
        </div>

        <form className="search" onSubmit={searchProblem}>
          <label htmlFor="problem">LeetCode problem</label>

          <div className="search-row">
            <input
              id="problem"
              value={problem}
              onChange={(event) => setProblem(event.target.value)}
              placeholder="Enter number or problem name"
            />

            <button type="submit">Open problem →</button>
          </div>

          {error && <p className="error">{error}</p>}
        </form>

        {activeProblem === "1" && (
          <>
            <section className="problem-heading">
              <div>
                <div className="problem-meta">
                  <span>PROBLEM #1</span>
                  <span className="difficulty">Easy</span>
                </div>

                <h2>Two Sum</h2>

                <p>
                  Find two distinct indices whose values add up to the target.
                </p>
              </div>

              <div className="target-card">
                <span>Target</span>
                <strong>{target}</strong>
              </div>
            </section>

            <section className="workspace">
              <div className="panel code-panel">
                <div className="panel-header">
                  <span>Solution</span>
                  <span className="language">JavaScript</span>
                </div>

                <div className="code">
                  {code.map((line, index) => (
                    <div
                      className={`code-line ${
                        step.line === index + 1 ? "active-line" : ""
                      }`}
                      key={index}
                    >
                      <span className="line-number">{index + 1}</span>
                      <code>{line}</code>
                    </div>
                  ))}
                </div>

                <p className="code-note">
                  The highlighted line corresponds to the current step.
                </p>
              </div>

              <div className="panel visual-panel">
                <div className="panel-header">
                  <span>Execution visualizer</span>
                  <span className="step-count">
                    {stepIndex + 1} / {steps.length}
                  </span>
                </div>

                <div className="step-content">
                  <p className="eyebrow">CURRENT STEP</p>
                  <h3>{step.title}</h3>
                  <p className="explanation">{step.explanation}</p>
                </div>

                <div className="section-label">Input array</div>

                <div className="array">
                  {nums.map((num, index) => (
                    <div className="array-item" key={index}>
                      <div
                        className={`array-value ${
                          step.currentIndex === index ? "selected" : ""
                        } ${
                          step.result?.includes(index) ? "matched" : ""
                        }`}
                      >
                        {num}
                      </div>

                      <span className="array-index">index {index}</span>
                    </div>
                  ))}
                </div>

                <div className="metrics">
                  <div className="metric">
                    <span>Current value</span>
                    <strong>
                      {step.currentIndex === null
                        ? "—"
                        : nums[step.currentIndex]}
                    </strong>
                  </div>

                  <div className="metric">
                    <span>Complement</span>
                    <strong>{step.complement ?? "—"}</strong>
                  </div>
                </div>

                <div className="section-label">
                  Hash map · value → index
                </div>

                <div className="hash-map">
                  {Object.keys(step.seen).length === 0 ? (
                    <span className="empty-state">Empty map</span>
                  ) : (
                    Object.entries(step.seen).map(([value, index]) => (
                      <span className="map-entry" key={value}>
                        {value} → {index}
                      </span>
                    ))
                  )}
                </div>

                {step.result && (
                  <div className="result">
                    <span>✓</span>

                    <div>
                      <strong>Answer: [{step.result.join(", ")}]</strong>
                      <p>nums[0] + nums[1] = 2 + 7 = 9</p>
                    </div>
                  </div>
                )}

                <div className="controls">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                      setStepIndex((i) => Math.max(0, i - 1))
                    }
                    disabled={stepIndex === 0}
                  >
                    ← Previous
                  </button>

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={reset}
                  >
                    ↺ Reset
                  </button>

                  <button
                    type="button"
                    className="primary-button"
                    onClick={() =>
                      setStepIndex((i) =>
                        Math.min(steps.length - 1, i + 1)
                      )
                    }
                    disabled={stepIndex === steps.length - 1}
                  >
                    Next →
                  </button>
                </div>
              </div>
            </section>

            <section className="complexity">
              <div>
                <span>Time complexity</span>
                <strong>O(n)</strong>
              </div>

              <div>
                <span>Space complexity</span>
                <strong>O(n)</strong>
              </div>

              <p>
                Each number is processed once, and the hash map can store up
                to n numbers.
              </p>
            </section>
          </>
        )}
      </section>
    </main>
  );
}
