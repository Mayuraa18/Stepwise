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

type Language = "Python" | "C++" | "Java";

type TestCase = {
  id: string;
  label: string;
  nums: number[];
  target: number;
  steps: Step[];
};

const languageCode: Record<Language, string[]> = {
  Python: [
    "def twoSum(nums, target):",
    "    seen = {}",
    "    for i, num in enumerate(nums):",
    "        complement = target - num",
    "        if complement in seen:",
    "            return [seen[complement], i]",
    "        seen[num] = i",
    "    return []",
  ],
  "C++": [
    "vector<int> twoSum(vector<int>& nums, int target) {",
    "    unordered_map<int, int> seen;",
    "    for (int i = 0; i < nums.size(); i++) {",
    "        int complement = target - nums[i];",
    "        if (seen.count(complement)) {",
    "            return {seen[complement], i};",
    "        }",
    "        seen[nums[i]] = i;",
    "    }",
    "    return {};",
    "}",
  ],
  Java: [
    "int[] twoSum(int[] nums, int target) {",
    "    Map<Integer, Integer> seen = new HashMap<>();",
    "    for (int i = 0; i < nums.length; i++) {",
    "        int complement = target - nums[i];",
    "        if (seen.containsKey(complement)) {",
    "            return new int[] { seen.get(complement), i };",
    "        }",
    "        seen.put(nums[i], i);",
    "    }",
    "    return new int[] {};",
    "}",
  ],
};

const pseudocode = [
  "create an empty map called seen",
  "for each number at index i:",
  "    calculate complement = target - number",
  "    if complement exists in seen:",
  "        return the stored index and i",
  "    store number → i in seen",
  "return an empty result",
];

const firstCaseSteps: Step[] = [
  {
    line: 2, currentIndex: null, complement: null, seen: {}, result: null,
    title: "Initialize the hash map",
    explanation: "Create an empty map named seen. It will remember each number we have visited and the index where it appeared, so we can look up a matching number quickly.",
  },
  {
    line: 4, currentIndex: 0, complement: 7, seen: {}, result: null,
    title: "Inspect the first number",
    explanation: "The current number is 2 at index 0. To reach the target 9, we need 9 − 2 = 7. Since 7 is not in the map yet, keep looking.",
  },
  {
    line: 7, currentIndex: 0, complement: 7, seen: { "2": 0 }, result: null,
    title: "Store the first number",
    explanation: "We have not found 7, so save the current number as seen[2] = 0. If a later number needs 2, we will know where to find it.",
  },
  {
    line: 4, currentIndex: 1, complement: 2, seen: { "2": 0 }, result: null,
    title: "Inspect the second number",
    explanation: "Now the current number is 7 at index 1. Its complement is 9 − 7 = 2, and the map tells us that 2 appeared at index 0.",
  },
  {
    line: 6, currentIndex: 1, complement: 2, seen: { "2": 0 }, result: [0, 1],
    title: "Found the answer!",
    explanation: "Return indices [0, 1]. The values at those positions are 2 and 7, and 2 + 7 = 9. We have the answer without checking every possible pair.",
  },
];

const secondCaseSteps: Step[] = [
  {
    line: 2, currentIndex: null, complement: null, seen: {}, result: null,
    title: "Initialize the hash map",
    explanation: "Start with an empty map named seen. We are looking for two values whose sum is 6, and the map will track earlier values and their indices.",
  },
  {
    line: 4, currentIndex: 0, complement: 3, seen: {}, result: null,
    title: "Inspect the first number",
    explanation: "The current number is 3 at index 0. We need another 3 to reach 6, but the map is empty, so we save this number and continue.",
  },
  {
    line: 7, currentIndex: 0, complement: 3, seen: { "3": 0 }, result: null,
    title: "Store the first number",
    explanation: "Save 3 → 0 in the map. The matching 3 has not appeared earlier, so we keep moving through the array.",
  },
  {
    line: 4, currentIndex: 1, complement: 4, seen: { "3": 0 }, result: null,
    title: "Inspect the second number",
    explanation: "The current number is 2 at index 1. We need 4 to reach 6, but 4 is not stored yet, so save 2 → 1 and continue.",
  },
  {
    line: 7, currentIndex: 1, complement: 4, seen: { "3": 0, "2": 1 }, result: null,
    title: "Store the second number",
    explanation: "The map now remembers 3 at index 0 and 2 at index 1. Neither matched yet, so the algorithm moves to the final number.",
  },
  {
    line: 4, currentIndex: 2, complement: 2, seen: { "3": 0, "2": 1 }, result: null,
    title: "Inspect the third number",
    explanation: "The current number is 4 at index 2. We need 6 − 4 = 2, and the map already has 2 → 1, so we can finish immediately.",
  },
  {
    line: 6, currentIndex: 2, complement: 2, seen: { "3": 0, "2": 1 }, result: [1, 2],
    title: "Found the answer!",
    explanation: "Return indices [1, 2]. Those positions contain 2 and 4, and 2 + 4 = 6. The stored index gives us the earlier half of the pair.",
  },
];

const testCases: TestCase[] = [
  { id: "case1", label: "Example 1", nums: [2, 7, 11, 15], target: 9, steps: firstCaseSteps },
  { id: "case2", label: "Example 2", nums: [3, 2, 4], target: 6, steps: secondCaseSteps },
];

function getHighlightedLine(stepIndex: number, language: Language, caseId: string) {
  const lineMap: Record<Language, Record<string, number[]>> = {
    Python: { case1: [2, 4, 7, 4, 6], case2: [2, 4, 7, 4, 7, 4, 6] },
    "C++": { case1: [2, 4, 8, 4, 6], case2: [2, 4, 8, 4, 8, 4, 6] },
    Java: { case1: [2, 4, 8, 4, 6], case2: [2, 4, 8, 4, 8, 4, 6] },
  };
  return lineMap[language][caseId]?.[stepIndex] ?? 1;
}


function getCodeExplanation(stepIndex: number, caseId: string, language: Language) {
  const explanations: Record<string, string[]> = {
    case1: [
      "The function receives the array and target. This is the setup for the algorithm.",
      "Create an empty map named seen. It stores each earlier number and the index where it appeared.",
      "No matching 7 has appeared, so save the current number: seen[2] = 0. A future number can now find it quickly.",
      "For 7, calculate 9 − 7 = 2. The map already contains 2 at index 0, so the pair has been found.",
      "Return the saved index for 2 and the current index for 7: [0, 1]. There is no need to scan every possible pair.",
    ],
    case2: [
      "The function receives the array and target. Here, we want two values that add up to 6.",
      "Start with an empty map named seen to remember earlier numbers and their indices.",
      "The complement of 3 is 3, but it has not appeared earlier. Save 3 at index 0 and continue.",
      "For the current value 2, the complement is 4. It is not stored yet, so keep searching.",
      "Save 2 at index 1. The map now remembers both earlier values: 3 → 0 and 2 → 1.",
      "For 4, calculate 6 − 4 = 2. The map contains 2 at index 1, which completes the pair.",
      "Return index 1 and the current index 2: [1, 2]. The corresponding values 2 and 4 add up to 6.",
    ],
  };

  const byStep = explanations[caseId] ?? explanations.case1;
  const text = byStep[Math.min(stepIndex, byStep.length - 1)] ?? byStep[0];

  if (language === "C++") {
    return `${text} Here, unordered_map stores the pairs; count() is used to check whether a key exists.`;
  }
  if (language === "Java") {
    return `${text} Here, HashMap stores the pairs; containsKey() checks whether a key exists.`;
  }
  return `${text} In Python, a dictionary stores the pairs, and “in” checks whether a key exists.`;
}

export default function App() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    try {
      return localStorage.getItem("stepwise-theme") === "dark" ? "dark" : "light";
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("stepwise-theme", theme);
    } catch {
      // The theme still works if browser storage is unavailable.
    }
  }, [theme]);

  const [problem, setProblem] = useState("1");
  const [activeProblem, setActiveProblem] = useState("1");
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState("");
  const [language, setLanguage] = useState<Language>("Python");
  const [selectedTestCase, setSelectedTestCase] = useState("case1");
  const [pseudocodeZoom, setPseudocodeZoom] = useState(1);
  const [solutionZoom, setSolutionZoom] = useState(1);
  const [visualizerZoom, setVisualizerZoom] = useState(1);

  const activeTestCase = testCases.find((testCase) => testCase.id === selectedTestCase) ?? testCases[0];
  const nums = activeTestCase.nums;
  const target = activeTestCase.target;
  const steps = activeTestCase.steps;
  const step = steps[Math.min(stepIndex, steps.length - 1)];
  const highlightedLine = getHighlightedLine(stepIndex, language, activeTestCase.id);
  const codeExplanation = getCodeExplanation(stepIndex, activeTestCase.id, language);

  function searchProblem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = problem.trim().toLowerCase();

    if (query === "1" || query === "two sum") {
      setActiveProblem("1");
      setStepIndex(0);
      setSelectedTestCase("case1");
      setError("");
    } else {
      setError(
        "This MVP currently supports LeetCode #1 (Two Sum). More problems will be added next."
      );
    }
  }

  function toggleTheme() {
    setTheme((current) => (current === "light" ? "dark" : "light"));
  }

  return (
    <main className="app">
      <header className="topbar">
        <a className="brand" href="/">
          <span className="brand-mark">S</span>
          Stepwise
        </a>

        <div className="header-actions">
          <span className="topbar-label">Understand code. One step at a time.</span>
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
                <p>Find two distinct indices whose values add up to the target.</p>
              </div>
              <div className="target-card">
                <span>Target</span>
                <strong>{target}</strong>
              </div>
            </section>

            <section className="testcase-selector" aria-label="Choose a test case">
              <div className="testcase-heading">
                <strong>Try different test cases</strong>
                <span>Choose an example to visualize its execution</span>
              </div>
              <div className="testcase-buttons">
                {testCases.map((testCase) => (
                  <button
                    type="button"
                    key={testCase.id}
                    className={`testcase-button ${selectedTestCase === testCase.id ? "testcase-active" : ""}`}
                    onClick={() => {
                      setSelectedTestCase(testCase.id);
                      setStepIndex(0);
                    }}
                    aria-pressed={selectedTestCase === testCase.id}
                  >
                    <strong>{testCase.label}</strong>
                    <code>nums = [{testCase.nums.join(", ")}], target = {testCase.target}</code>
                  </button>
                ))}
              </div>
            </section>

            <section className="workspace">
              <div className="panel code-panel">
                <section className="pseudocode-section">
                  <div className="panel-header">
                    <span>1. Understand the pseudocode first</span>
                    <div className="zoom-controls" aria-label="Pseudocode zoom controls">
                      <button type="button" onClick={() => setPseudocodeZoom((z) => Math.max(0.8, Math.round((z - 0.1) * 10) / 10))} disabled={pseudocodeZoom <= 0.8} aria-label="Zoom out pseudocode" title="Zoom out">A−</button>
                      <button type="button" onClick={() => setPseudocodeZoom((z) => Math.min(1.4, Math.round((z + 0.1) * 10) / 10))} disabled={pseudocodeZoom >= 1.4} aria-label="Zoom in pseudocode" title="Zoom in">A+</button>
                    </div>
                  </div>
                  <div className="pseudocode-content" style={{ zoom: pseudocodeZoom }}>
                    <div className="pseudocode-intro">
                      Try to explain each step in your own words before looking at the implementation.
                    </div>
                    <div className="pseudocode">
                    {pseudocode.map((line, index) => {
                      const activePseudocodeLine = [0, 2, 5, 2, 4, 2, 4][Math.min(stepIndex, 6)];
                      return (
                        <div
                          className={`pseudo-line ${activePseudocodeLine === index ? "pseudo-active" : ""}`}
                          key={line}
                        >
                          <span>{index + 1}</span>
                          <code>{line}</code>
                        </div>
                      );
                    })}
                    </div>
                  </div>
                </section>

                <section className="solution-section">
                  <div className="panel-header code-panel-header">
                    <span>2. Main solution</span>
                    <div className="solution-header-actions">
                    <div className="zoom-controls" aria-label="Solution zoom controls">
                      <button type="button" onClick={() => setSolutionZoom((z) => Math.max(0.8, Math.round((z - 0.1) * 10) / 10))} disabled={solutionZoom <= 0.8} aria-label="Zoom out solution" title="Zoom out">A−</button>
                      <button type="button" onClick={() => setSolutionZoom((z) => Math.min(1.4, Math.round((z + 0.1) * 10) / 10))} disabled={solutionZoom >= 1.4} aria-label="Zoom in solution" title="Zoom in">A+</button>
                    </div>
                    <label className="language-picker">
                      <span className="sr-only">Programming language</span>
                      <select
                        value={language}
                        onChange={(event) => setLanguage(event.target.value as Language)}
                        aria-label="Select programming language"
                      >
                        <option value="Python">Python</option>
                        <option value="C++">C++</option>
                        <option value="Java">Java</option>
                      </select>
                    </label>
                    </div>
                  </div>
                  <div className="solution-content" style={{ zoom: solutionZoom }}>
                  <div className="solution-split">
                    <div className="code" aria-label={`${language} solution code`}>
                      {languageCode[language].map((line, index) => (
                        <div
                          className={`code-line ${highlightedLine === index + 1 ? "active-line" : ""}`}
                          key={`${language}-${index}`}
                        >
                          <span className="line-number">{index + 1}</span>
                          <code>{line}</code>
                        </div>
                      ))}
                    </div>
                    <aside className="code-explanation" aria-live="polite">
                      <div className="code-explanation-title">
                        <span className="explanation-pulse" />
                        <strong>What this code is doing</strong>
                        <span>Line {highlightedLine}</span>
                      </div>
                      <p>{codeExplanation}</p>
                    </aside>
                  </div>
                  <p className="code-note">The highlighted line and explanation update as you move through the steps.</p>
                  </div>
                </section>
              </div>

              <div className="panel visual-panel">
                <div className="panel-header">
                  <span>Execution visualizer</span>
                  <div className="visualizer-header-actions">
                    <div className="zoom-controls" aria-label="Visualizer zoom controls">
                      <button type="button" onClick={() => setVisualizerZoom((z) => Math.max(0.8, Math.round((z - 0.1) * 10) / 10))} disabled={visualizerZoom <= 0.8} aria-label="Zoom out visualizer" title="Zoom out">A−</button>
                      <button type="button" onClick={() => setVisualizerZoom((z) => Math.min(1.4, Math.round((z + 0.1) * 10) / 10))} disabled={visualizerZoom >= 1.4} aria-label="Zoom in visualizer" title="Zoom in">A+</button>
                    </div>
                    <span className="step-count">{stepIndex + 1} / {steps.length}</span>
                  </div>
                </div>

                <div className="visualizer-content" style={{ zoom: visualizerZoom }}>
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
                        } ${step.result?.includes(index) ? "matched" : ""}`}
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
                      {step.currentIndex === null ? "—" : nums[step.currentIndex]}
                    </strong>
                  </div>
                  <div className="metric">
                    <span>Complement</span>
                    <strong>{step.complement ?? "—"}</strong>
                  </div>
                </div>

                <div className="section-label">Hash map · value → index</div>
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
                      <p>
                        nums[{step.result[0]}] + nums[{step.result[1]}] ={" "}
                        {nums[step.result[0]]} + {nums[step.result[1]]} = {target}
                      </p>
                    </div>
                  </div>
                )}

                <div className="controls">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
                    disabled={stepIndex === 0}
                  >
                    ← Previous
                  </button>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setStepIndex(0)}
                  >
                    ↺ Reset
                  </button>
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() =>
                      setStepIndex((i) => Math.min(steps.length - 1, i + 1))
                    }
                    disabled={stepIndex === steps.length - 1}
                  >
                    Next →
                  </button>
                </div>
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
                Each number is processed once, and the hash map can store up to n
                numbers.
              </p>
            </section>
          </>
        )}
      </section>
    </main>
  );
}
