
import { useEffect, useMemo, useState } from "react";
import { animate } from "animejs";
import type { Language, VisualStep, Problem } from "./engine/types";
import "./App.css";
import { modularProblems } from "./problems/registry.ts";

const problems: Problem[] = [...modularProblems];

type ThemeId = "navy" | "berry" | "ember" | "meadow" | "sand";

const themes: { id: ThemeId; name: string; colors: [string, string, string, string]; mood: string }[] = [
  { id: "navy", name: "Deep Navy", colors: ["#0C2B4E", "#1A3D64", "#1D546C", "#F4F4F4"], mood: "Cool · Focused" },
  { id: "berry", name: "Berry Wine", colors: ["#662222", "#842A3B", "#A3485A", "#F5DAA7"], mood: "Warm · Bold" },
  { id: "ember", name: "Ember Red", colors: ["#3E0703", "#660B05", "#8C1007", "#FFF0C4"], mood: "Rich · Energetic" },
  { id: "meadow", name: "Soft Meadow", colors: ["#ECF4E8", "#CBF3BB", "#ABE7B2", "#93BFC7"], mood: "Fresh · Calm" },
  { id: "sand", name: "Warm Sand", colors: ["#F9F8F6", "#EFE9E3", "#D9CFC7", "#C9B59C"], mood: "Soft · Neutral" },
];


const growthCurves = [
  { id: "constant", label: "O(1) · Constant", color: "#64748b", value: (_n: number) => 1 },
  { id: "logarithmic", label: "O(log n) · Logarithmic", color: "#0d9488", value: (n: number) => Math.max(1, Math.log2(n)) },
  { id: "linear", label: "O(n) · Linear", color: "#398457", value: (n: number) => n },
  { id: "linearithmic", label: "O(n log n)", color: "#2563eb", value: (n: number) => n * Math.max(1, Math.log2(n)) },
  { id: "quadratic", label: "O(n²) · Quadratic", color: "#d97757", value: (n: number) => n ** 2 },
  { id: "exponential", label: "O(2ⁿ) · Exponential", color: "#9333ea", value: (n: number) => 2 ** n },
];


function lineFor(step: VisualStep, language: Language, problem: Problem): number {

  const source = problem.languages[language];

  return Math.min(Math.max(step.line, 1), source.length);

}



export default function App() {

  const [theme, setTheme] = useState<ThemeId>(() => {
    try {
      const saved = localStorage.getItem("stepwise-theme");
      return themes.some(item => item.id === saved) ? saved as ThemeId : "navy";
    } catch { return "navy"; }
  });
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const palettes: Record<ThemeId, Record<string, string>> = {
      navy: {
        "--page-bg": "#0C2B4E", "--panel-bg": "#1A3D64", "--soft-bg": "#1D546C",
        "--code-bg": "#102F50", "--text-color": "#F4F4F4", "--muted-color": "#D0DCE5",
        "--border-color": "#315575", "--active-bg": "#1D546C", "--accent-color": "#F4F4F4",
        "--accent-strong": "#1D546C", "--accent-soft": "#1A3D64",
      },
      berry: {
        "--page-bg": "#F5DAA7", "--panel-bg": "#F5DAA7", "--soft-bg": "#FBE8C8",
        "--code-bg": "#FFF1D7", "--text-color": "#662222", "--muted-color": "#842A3B",
        "--border-color": "#A3485A", "--active-bg": "#F0C98A", "--accent-color": "#A3485A",
        "--accent-strong": "#842A3B", "--accent-soft": "#F5DAA7",
      },
      ember: {
        "--page-bg": "#3E0703", "--panel-bg": "#FFF0C4", "--soft-bg": "#FFE7A0",
        "--code-bg": "#FFF5D8", "--text-color": "#660B05", "--muted-color": "#8C1007",
        "--border-color": "#8C1007", "--active-bg": "#F5DDA0", "--accent-color": "#8C1007",
        "--accent-strong": "#660B05", "--accent-soft": "#FFF0C4",
      },
      meadow: {
        "--page-bg": "#ECF4E8", "--panel-bg": "#ECF4E8", "--soft-bg": "#CBF3BB",
        "--code-bg": "#F5FBF1", "--text-color": "#173B2A", "--muted-color": "#365F50",
        "--border-color": "#93BFC7", "--active-bg": "#ABE7B2", "--accent-color": "#1D546C",
        "--accent-strong": "#1D546C", "--accent-soft": "#ECF4E8",
      },
      sand: {
        "--page-bg": "#F9F8F6", "--panel-bg": "#F9F8F6", "--soft-bg": "#EFE9E3",
        "--code-bg": "#FFFFFF", "--text-color": "#30271F", "--muted-color": "#65584C",
        "--border-color": "#C9B59C", "--active-bg": "#D9CFC7", "--accent-color": "#6B4F3A",
        "--accent-strong": "#6B4F3A", "--accent-soft": "#EFE9E3",
      },
    };
    root.dataset.theme = theme;
    Object.entries(palettes[theme]).forEach(([key, value]) => root.style.setProperty(key, value));
    root.style.colorScheme = ["navy", "coffee"].includes(theme) ? "dark" : "light";
    try { localStorage.setItem("stepwise-theme", theme); } catch {}
  }, [theme]);

  function selectTheme(nextTheme: ThemeId) {
    setTheme(nextTheme);
    setThemeMenuOpen(false);
    // A short palette transition plus a tiny stagger on the swatches keeps the interaction tactile.
    animate(".app", {
      opacity: [0.94, 1],
      duration: 260,
      ease: "out(2)"
    });
    animate(".theme-current-dots i", {
      scale: [0.72, 1],
      delay: 0,
      duration: 300,
      ease: "out(3)"
    });
  }



  const [problemQuery, setProblemQuery] = useState("1");

  const [activeId, setActiveId] = useState<string>("1");

  const [language, setLanguage] = useState<Language>("Python");

  const [stepIndex, setStepIndex] = useState(0);

  const [input, setInput] = useState(problems[0].defaultInput);

  const [inputDraft, setInputDraft] = useState(problems[0].defaultInput);

  const [customCases, setCustomCases] = useState<{id:string; label:string; input:string}[]>([]);

  const [selectedCaseId, setSelectedCaseId] = useState("default");

  const [error, setError] = useState("");

  const [aboutDevOpen, setAboutDevOpen] = useState(false);

  const [pseudocodeZoom, setPseudocodeZoom] = useState(1);

  const [solutionZoom, setSolutionZoom] = useState(1);

  const [visualizerZoom, setVisualizerZoom] = useState(1);
  const [complexityN, setComplexityN] = useState(8);
  const [complexityOpen, setComplexityOpen] = useState(false);
  const problem = problems.find(p => p.id === activeId) ?? problems[0];
  const steps = useMemo(() => {
    try { return problem.run(input); } catch { return []; }
  }, [problem, input]);
  const step = steps[Math.min(stepIndex, Math.max(steps.length-1,0))];
  const highlightedLine = step ? lineFor(step, language, problem) : 1;

  // First-visit reveal: small stagger, no oversized movement or distracting loops.
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;
    animate(".intro", {
      opacity: [0, 1], translateY: [12, 0],
      duration: 560, ease: "out(3)"
    });
    animate(".search", {
      opacity: [0, 1], translateY: [14, 0],
      delay: 100, duration: 560, ease: "out(3)"
    });
    animate(".problem-heading", {
      opacity: [0, 1], translateY: [10, 0],
      delay: 190, duration: 520, ease: "out(3)"
    });
    animate(".testcase-selector", {
      opacity: [0, 1], translateY: [12, 0],
      delay: 260, duration: 540, ease: "out(3)"
    });
    animate(".workspace .panel", {
      opacity: [0, 1], translateY: [16, 0],
      delay: 340,
      duration: 600, ease: "out(3)"
    });
  }, []);

  // Make each execution step feel responsive without animating the whole page.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    animate(".step-content", {
      opacity: [0.55, 1], translateY: [5, 0],
      duration: 240, ease: "out(2)"
    });
    animate(".code-line.active-line, .pseudo-line.pseudo-active", {
      opacity: [0.72, 1], duration: 220, ease: "out(2)"
    });
    animate(".array-value.selected, .array-value.matched, .bracket-string span.selected", {
      scale: [0.94, 1], duration: 240, ease: "out(3)"
    });
  }, [activeId, stepIndex, language, input]);

  useEffect(() => {
    if (!aboutDevOpen || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    animate(".about-dev-dialog", {
      opacity: [0, 1], translateY: [14, 0], scale: [0.98, 1],
      duration: 300, ease: "out(3)"
    });
  }, [aboutDevOpen]);

  useEffect(() => {
    if (!themeMenuOpen || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    animate(".theme-option", {
      opacity: [0, 1], translateX: [8, 0],
      delay: 0,
      duration: 240, ease: "out(2)"
    });
  }, [themeMenuOpen]);

  function openProblem(e: React.FormEvent<HTMLFormElement>) {

    e.preventDefault();

    const q = problemQuery.trim().toLowerCase();

    const found = problems.find(p => p.id === q || p.title.toLowerCase() === q || p.title.toLowerCase().includes(q));

    if (!found) { setError("Problem not found yet. Try 1, 20, 53, 121, 704 or a problem name."); return; }

    setActiveId(found.id); setInput(found.defaultInput); setInputDraft(found.defaultInput);

    setSelectedCaseId("default"); setStepIndex(0); setError("");

  }

  function applyInput(next: string) {

    try { problem.run(next); setInput(next); setInputDraft(next); setStepIndex(0); setError(""); setSelectedCaseId("custom"); }

    catch (err) { setError(err instanceof Error ? err.message : "Could not run this input."); }

  }

  function addCase() {

    try {

      problem.run(inputDraft);

      const id = `custom-${Date.now()}`;

      const item = {id, label:`Custom ${customCases.length+1}`, input:inputDraft};

      setCustomCases(current=>[...current,item]); setSelectedCaseId(id);

      setInput(item.input); setStepIndex(0); setError("");

    } catch(err) { setError(err instanceof Error ? err.message : "Please check your input."); }

  }

  function chooseCase(id:string, value:string) {

    setSelectedCaseId(id); setInput(value); setInputDraft(value); setStepIndex(0); setError("");

  }




  return <main className="app">

    <header className="topbar">

      <a className="brand" href="/"><span className="brand-mark">S</span>Stepwise</a>

      <div className="header-actions">

        <span className="topbar-label">Understand code. One step at a time.</span>

        <button type="button" className="about-dev-toggle" onClick={()=>setAboutDevOpen(true)}>About Dev</button>

        <div className="theme-picker-wrap">
          <button type="button" className="theme-toggle" aria-expanded={themeMenuOpen} aria-haspopup="dialog" onClick={() => setThemeMenuOpen(open => !open)}>
            <span className="theme-current-dots" aria-hidden="true">{(themes.find(item => item.id === theme) ?? themes[0]).colors.map((color, index) => <i key={index} style={{ background: color }} />)}</span>
            Themes <span aria-hidden="true">{themeMenuOpen ? "⌃" : "⌄"}</span>
          </button>
          {themeMenuOpen && <div className="theme-menu" role="dialog" aria-label="Choose a color theme">
            <div className="theme-menu-heading"><div><strong>Choose your palette</strong><span>Six complete color systems</span></div><button type="button" className="theme-menu-close" aria-label="Close theme menu" onClick={() => setThemeMenuOpen(false)}>×</button></div>
            <div className="theme-options">
              {themes.map(item => <button type="button" key={item.id} className={`theme-option ${theme === item.id ? "selected" : ""}`} aria-pressed={theme === item.id} onClick={() => selectTheme(item.id)}>
                <span className="theme-option-swatches">{item.colors.map((color, index) => <i key={index} style={{ background: color }} />)}</span>
                <span className="theme-option-copy"><strong>{item.name}</strong><small>{item.mood}</small></span>
                {theme === item.id && <span className="theme-option-check" aria-hidden="true">✓</span>}
              </button>)}
            </div>
          </div>}
        </div>

      </div>

    </header>

    {aboutDevOpen && <div className="about-dev-backdrop" onClick={()=>setAboutDevOpen(false)}><section className="about-dev-dialog" role="dialog" aria-modal="true" onClick={e=>e.stopPropagation()}>

      <button type="button" className="about-dev-close" onClick={()=>setAboutDevOpen(false)}>×</button>

      <p className="eyebrow">THE DEVELOPER</p><h2>Mayura C R</h2>

      <p className="about-dev-intro">Engineering student building tools that make complex concepts easier to understand.</p>

      <div className="about-dev-details">

        <div><span>Currently studying</span><strong>B.Tech — Computer Science & Engineering (AI & ML)</strong></div>

        <div><span>University</span><strong>Parul University · Expected 2029</strong></div>

        <div><span>Also completed</span><strong>Dual Degree — Robotics & Automation</strong></div>

        <div><span>Interests</span><strong>AI/ML · DSA · Robotics · Developer tools</strong></div>

      </div>

      <div className="about-dev-contact"><a href="mailto:mayuracr18@gmail.com">Email</a><a href="https://www.linkedin.com/in/mayura-c-r-29784b377" target="_blank" rel="noreferrer">LinkedIn</a><a href="https://github.com/Mayuraa18" target="_blank" rel="noreferrer">GitHub</a></div>

      <div className="about-dev-footer"><span className="portfolio-placeholder">Portfolio link coming soon</span><button type="button" className="primary-button" onClick={()=>setAboutDevOpen(false)}>Nice, got it</button></div>

    </section></div>}

    <section className="page">

      <div className="intro"><p className="eyebrow">INTERACTIVE DSA LAB</p><h1>Understand the algorithm.</h1><p className="subtitle">Follow every line, variable, and decision as the code executes.</p></div>

      <form className="search" onSubmit={openProblem}>

        <label htmlFor="problem-search">LeetCode problem</label>

        <div className="search-row"><input id="problem-search" value={problemQuery} onChange={e=>setProblemQuery(e.target.value)} placeholder="Enter number or problem name"/><button type="submit">Open problem →</button></div>

        {error && <p className="error" role="alert">{error}</p>}

        <div className="problem-quick-list">{problems.map(p=><button type="button" key={p.id} className={p.id===activeId?"quick-problem active":"quick-problem"} onClick={(event)=>{animate(event.currentTarget,{scale:[0.97,1],duration:220,ease:"out(3)"});setProblemQuery(p.id);setActiveId(p.id);setInput(p.defaultInput);setInputDraft(p.defaultInput);setStepIndex(0);setSelectedCaseId("default");setError("");}}><span>#{p.id}</span>{p.title}<small>{p.difficulty}</small></button>)}</div>

      </form>

      <section className="problem-heading">

        <div><div className="problem-meta"><span>PROBLEM #{problem.id}</span><span className="difficulty">{problem.difficulty}</span><span className="category-pill">{problem.category}</span></div><h2>{problem.title}</h2><p>{problem.description}</p></div>

      </section>



      <section className="testcase-selector">

        <div className="testcase-heading"><strong>Test cases</strong><span>Choose an example or run your own input</span></div>

        <div className="testcase-buttons">

          <button type="button" className={`testcase-button ${selectedCaseId==="default"?"testcase-active":""}`} onClick={()=>chooseCase("default",problem.defaultInput)}><strong>Default example</strong><code>{problem.defaultInput}</code></button>

          {customCases.map(c=><div className="custom-case-wrap" key={c.id}><button type="button" className={`testcase-button ${selectedCaseId===c.id?"testcase-active":""}`} onClick={()=>chooseCase(c.id,c.input)}><strong>{c.label}</strong><code>{c.input}</code></button><button type="button" className="remove-case" title={`Remove ${c.label}`} onClick={()=>{setCustomCases(cs=>cs.filter(x=>x.id!==c.id));if(selectedCaseId===c.id)chooseCase("default",problem.defaultInput);}}>×</button></div>)}

        </div>

        <div className="custom-input">

          <label htmlFor="custom-input">Custom input</label>

          <textarea id="custom-input" rows={2} value={inputDraft} onChange={e=>setInputDraft(e.target.value)} placeholder={problem.inputHint}/>

          <p>{problem.inputHint}</p>

          <div className="custom-input-actions"><button type="button" className="secondary-button" onClick={()=>applyInput(inputDraft)}>Run input ↻</button><button type="button" className="primary-button" onClick={addCase}>Save as test case +</button></div>

        </div>

      </section>



      <section className="workspace">

        <div className="panel code-panel">

          <section className="pseudocode-section"><div className="panel-header"><span>1. Understand the pseudocode first</span><div className="zoom-controls"><button type="button" onClick={()=>setPseudocodeZoom(z=>Math.max(.8,Math.round((z-.1)*10)/10))} disabled={pseudocodeZoom<=.8}>A−</button><button type="button" onClick={()=>setPseudocodeZoom(z=>Math.min(1.4,Math.round((z+.1)*10)/10))} disabled={pseudocodeZoom>=1.4}>A+</button></div></div>

            <div className="pseudocode-content" style={{zoom:pseudocodeZoom}}><div className="pseudocode-intro">Try to explain each step in your own words before looking at the implementation.</div><div className="pseudocode">{problem.pseudocode.map((line,i)=><div className={`pseudo-line ${step?.pseudocodeLine===i?"pseudo-active":""}`} key={line}><span>{i+1}</span><code>{line}</code></div>)}</div></div>

          </section>

          <section className="solution-section"><div className="panel-header code-panel-header"><span>2. Main solution</span><div className="solution-header-actions"><div className="zoom-controls"><button type="button" onClick={()=>setSolutionZoom(z=>Math.max(.8,Math.round((z-.1)*10)/10))} disabled={solutionZoom<=.8}>A−</button><button type="button" onClick={()=>setSolutionZoom(z=>Math.min(1.4,Math.round((z+.1)*10)/10))} disabled={solutionZoom>=1.4}>A+</button></div><label className="language-picker"><span className="sr-only">Programming language</span><select value={language} onChange={e=>setLanguage(e.target.value as Language)}><option>Python</option><option>C++</option><option>Java</option></select></label></div></div>

            <div className="solution-content" style={{zoom:solutionZoom}}><div className="solution-split"><div className="code">{problem.languages[language].map((line,i)=><div className={`code-line ${highlightedLine===i+1?"active-line":""}`} key={`${language}-${i}`}><span className="line-number">{i+1}</span><code>{line}</code></div>)}</div><aside className="code-explanation"><div className="code-explanation-title"><span className="explanation-pulse"/><strong>What this code is doing</strong><span>Line {highlightedLine}</span></div><p>{step?.explanation??"Edit the input and run it to generate execution steps."}</p></aside></div><p className="code-note">The highlighted line and explanation update as you move through the steps.</p></div>

          </section>

        </div>



        <div className="panel visual-panel"><div className="panel-header"><span>Execution visualizer</span><div className="visualizer-header-actions"><div className="zoom-controls"><button type="button" onClick={()=>setVisualizerZoom(z=>Math.max(.8,Math.round((z-.1)*10)/10))} disabled={visualizerZoom<=.8}>A−</button><button type="button" onClick={()=>setVisualizerZoom(z=>Math.min(1.4,Math.round((z+.1)*10)/10))} disabled={visualizerZoom>=1.4}>A+</button></div><span className="step-count">{steps.length?stepIndex+1:0} / {steps.length}</span></div></div>

          <div className="visualizer-content" style={{zoom:visualizerZoom}}>

            {step?<><div className="step-content"><p className="eyebrow">CURRENT STEP</p><h3>{step.title}</h3><p className="explanation">{step.explanation}</p></div>

              <div className="section-label">{problem.id==="20"?"Bracket input (character codes shown)": "Input array"}</div>

              {problem.id==="20" ? <div className="bracket-string">{input.trim().split("").map((c,i)=><span key={i} className={step.currentIndex===i?"selected":""}>{c}</span>)}</div> :

              <div className="array" style={{gridTemplateColumns:`repeat(${Math.min(Math.max(step.array.length,1),8)}, minmax(0,1fr))`}}>{step.array.map((num,i)=><div className="array-item" key={i}><div className={`array-value ${step.currentIndex===i?"selected":""} ${step.result&&step.result.includes(`index ${i}`)?"matched":""} ${step.activeRange&&i>=step.activeRange[0]&&i<=step.activeRange[1]?"in-range":""}`}>{num}</div><span className="array-index">index {i}</span></div>)}</div>}

              <div className="metrics">{step.variables.map(v=><div className="metric" key={v.label}><span>{v.label}</span><strong>{v.value}</strong></div>)}</div>

              <div className="section-label">{problem.id==="20"?"Stack · last in, first out":problem.id==="1"?"Hash map · value → index":"Algorithm state"}</div>

              <div className="hash-map">{step.memory.length?step.memory.map((m,i)=><span className="map-entry" key={`${m.label}-${i}`}>{m.label} → {m.value}</span>):<span className="empty-state">{problem.id==="1"?"Empty map":problem.id==="20"?"Stack is empty":"No extra data structure"}</span>}</div>

{step.result && (
  <div
    className={`result ${
      step.resultStatus === "failure"
        ? "result-invalid"
        : step.resultStatus === "info"
          ? "result-info"
          : "result-success"
    }`}
    role="status"
  >
    <span>
      {step.resultStatus === "failure"
        ? "✕"
        : step.resultStatus === "info"
          ? "i"
          : "✓"}
    </span>
    <div>
      <strong>{step.result}</strong>
      <p>Result for this input</p>
    </div>
  </div>
)}

              <div className="controls"><button type="button" className="secondary-button" onClick={()=>setStepIndex(i=>Math.max(0,i-1))} disabled={stepIndex===0}>← Previous</button><button type="button" className="secondary-button" onClick={()=>setStepIndex(0)}>↺ Reset</button><button type="button" className="primary-button" onClick={()=>setStepIndex(i=>Math.min(steps.length-1,i+1))} disabled={stepIndex>=steps.length-1}>Next →</button></div>

            </>:<div className="step-content"><h3>Check your input</h3><p className="explanation">Fix the input above, then choose Run input to create the execution steps.</p></div>}

          </div>

        </div>

      </section>



      <section className="complexity-lab">

        <div className="complexity-lab-heading">
          <div>
            <p className="eyebrow">COMPLEXITY LAB</p>
            <h2>Time &amp; space complexity</h2>
            <p className="complexity-heading-hint">A quick overview for this problem. Open the guide whenever you want to learn more.</p>
          </div>
          <button
            type="button"
            className="complexity-toggle"
            aria-expanded={complexityOpen}
            aria-controls="complexity-learning-content"
            onClick={() => setComplexityOpen(open => !open)}
          >
            <span aria-hidden="true">{complexityOpen ? "−" : "+"}</span>
            {complexityOpen ? "Hide explanation" : "Understand complexity"}
          </button>
        </div>

        <div className="complexity-summary"><div><span>Time complexity</span><strong>{problem.time}</strong><p>{problem.timeWhy}</p></div><div><span>Space complexity</span><strong>{problem.space}</strong><p>{problem.spaceWhy}</p></div></div>

        {complexityOpen && <div className="complexity-details" id="complexity-learning-content"><div className="complexity-learning-intro"><strong>Let’s break it down</strong><p>Big-O describes how an algorithm’s work or extra memory grows as the input gets larger. The examples and chart below are learning aids, not measured runtime.</p></div><article><h3>Time growth</h3><p>{problem.bestCase}</p><p>{problem.averageCase}</p><p>{problem.worstCase}</p><div className="growth-visual" style={{ gap: 14 }}>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <strong style={{ display: "block", fontSize: 12, marginBottom: 4 }}>Compare Big-O growth</strong>
                  <span style={{ color: "var(--muted-color)", fontSize: 10 }}>Choose an input size to inspect estimated operation counts.</span>
                </div>
                <label htmlFor="complexity-input-size" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "var(--muted-color)" }}>
                  Input size <strong style={{ color: "var(--text-color)", font: '600 13px "DM Mono", monospace' }}>n = {complexityN}</strong>
                </label>
              </div>
              <input
                id="complexity-input-size"
                aria-label="Complexity graph input size"
                type="range"
                min={2}
                max={20}
                step={1}
                value={complexityN}
                onChange={e => setComplexityN(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#398457", cursor: "pointer" }}
              />
              <div style={{ border: "1px solid var(--border-color)", borderRadius: 10, padding: "10px 8px 4px", background: "var(--code-bg)" }}>
                <svg viewBox="0 0 640 250" role="img" aria-label="Interactive comparison of Big-O operation growth on a logarithmic vertical scale" style={{ display: "block", width: "100%", height: "auto", overflow: "visible" }}>
                  { [1, 10, 100, 1000, 10000, 100000, 1000000].map(tick => {
                    const y = 194 - (Math.log10(tick) / Math.log10(2 ** 20)) * 158;
                    return <g key={tick}>
                      <line x1="48" x2="622" y1={y} y2={y} stroke="var(--border-color)" strokeDasharray="3 4" />
                      <text x="41" y={y + 3} textAnchor="end" fontSize="9" fill="var(--muted-color)">{tick >= 1000000 ? "1M" : tick >= 1000 ? `${tick / 1000}k` : tick}</text>
                    </g>;
                  })}
                  { [1, 5, 10, 15, 20].map(tick => {
                    const x = 48 + ((tick - 1) / 19) * 574;
                    return <g key={tick}>
                      <line x1={x} x2={x} y1="36" y2="194" stroke="var(--border-color)" strokeDasharray="2 5" />
                      <text x={x} y="212" textAnchor="middle" fontSize="10" fill="var(--muted-color)">{tick}</text>
                    </g>;
                  })}
                  <text x="335" y="239" textAnchor="middle" fontSize="10" fill="var(--muted-color)">Input size (n)</text>
                  <text x="12" y="20" fontSize="10" fill="var(--muted-color)">Operations · log scale</text>
                  <line x1={48 + ((complexityN - 1) / 19) * 574} x2={48 + ((complexityN - 1) / 19) * 574} y1="36" y2="194" stroke="var(--text-color)" strokeDasharray="4 4" opacity="0.65" />
                  { growthCurves.map(curve => {
                    const points = Array.from({ length: 20 }, (_, index) => {
                      const n = index + 1;
                      const value = Math.max(1, curve.value(n));
                      const x = 48 + (index / 19) * 574;
                      const y = 194 - (Math.log10(value) / Math.log10(2 ** 20)) * 158;
                      return `${x},${y}`;
                    }).join(" ");
                    const selectedValue = Math.max(1, curve.value(complexityN));
                    const selectedX = 48 + ((complexityN - 1) / 19) * 574;
                    const selectedY = 194 - (Math.log10(selectedValue) / Math.log10(2 ** 20)) * 158;
                    return <g key={curve.id}>
                      <polyline points={points} fill="none" stroke={curve.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                      <circle cx={selectedX} cy={selectedY} r="4" fill={curve.color} stroke="var(--panel-bg)" strokeWidth="1.5" />
                    </g>;
                  })}
                </svg>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))", gap: 8 }}>
                {growthCurves.map(curve => <div key={curve.id} style={{ minWidth: 0, padding: "9px 10px", border: "1px solid var(--border-color)", borderRadius: 8, background: "var(--soft-bg)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <span aria-hidden="true" style={{ width: 8, height: 8, flex: "0 0 8px", borderRadius: "50%", background: curve.color }} />
                    <span style={{ fontSize: 10, color: "var(--muted-color)" }}>{curve.label}</span>
                  </div>
                  <strong style={{ font: '600 13px "DM Mono", monospace', color: "var(--text-color)" }}>{Math.round(curve.value(complexityN)).toLocaleString("en-US")}</strong>
                  <span style={{ display: "block", marginTop: 3, fontSize: 9, color: "var(--muted-color)" }}>estimated operations at n={complexityN}</span>
                </div>)}
              </div>
              <small>The curves use illustrative operation-count models, not measured runtime. The vertical axis is logarithmic so slower and faster growth classes can be compared in one chart. Actual complexity for the selected problem is shown above.</small>
            </div></article>

          <article><h3>Extra memory</h3><p>{problem.memoryNote}</p><div className="memory-visual">{Array.from({length:8},(_,i)=><div key={i} className={`memory-cell ${problem.space==="O(1)"?i<2?"used":"" : i<6?"used":""}`}>{problem.space==="O(1)"?(i<2?"state":""):(i<6?"item":"")}</div>)}</div><small>Conceptual memory illustration; not a live memory profiler.</small></article>

        </div>}

      </section>

    </section>

  </main>;

}
