
import { useEffect, useMemo, useState } from "react";
import type { Language, VisualStep, Problem } from "./engine/types";
import "./App.css";
import { modularProblems } from "./problems/registry.ts";

const problems: Problem[] = [...modularProblems];


function lineFor(step: VisualStep, language: Language, problem: Problem): number {

  const source = problem.languages[language];

  return Math.min(Math.max(step.line, 1), source.length);

}



export default function App() {

  const [theme, setTheme] = useState<"light" | "dark">(() => {

    try { return localStorage.getItem("stepwise-theme") === "dark" ? "dark" : "light"; } catch { return "light"; }

  });

  useEffect(() => {

    document.documentElement.dataset.theme = theme;

    try { localStorage.setItem("stepwise-theme", theme); } catch {}

  }, [theme]);



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



  const problem = problems.find(p => p.id === activeId) ?? problems[0];

  const steps = useMemo(() => {

    try { return problem.run(input); } catch { return []; }

  }, [problem, input]);

  const step = steps[Math.min(stepIndex, Math.max(steps.length-1,0))];

  const highlightedLine = step ? lineFor(step, language, problem) : 1;



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

  function toggleTheme() { setTheme(current => current === "light" ? "dark" : "light"); }



  return <main className="app">

    <header className="topbar">

      <a className="brand" href="/"><span className="brand-mark">S</span>Stepwise</a>

      <div className="header-actions">

        <span className="topbar-label">Understand code. One step at a time.</span>

        <button type="button" className="about-dev-toggle" onClick={()=>setAboutDevOpen(true)}>About Dev</button>

        <button type="button" className="theme-toggle" onClick={toggleTheme}>{theme==="light"?"☾ Dark":"☀ Light"}</button>

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

        <div className="problem-quick-list">{problems.map(p=><button type="button" key={p.id} className={p.id===activeId?"quick-problem active":"quick-problem"} onClick={()=>{setProblemQuery(p.id);setActiveId(p.id);setInput(p.defaultInput);setInputDraft(p.defaultInput);setStepIndex(0);setSelectedCaseId("default");setError("");}}><span>#{p.id}</span>{p.title}<small>{p.difficulty}</small></button>)}</div>

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

        <div className="complexity-lab-heading"><div><p className="eyebrow">COMPLEXITY LAB</p><h2>What does the complexity mean?</h2></div><span className="category-pill">Interactive explanation</span></div>

        <div className="complexity-summary"><div><span>Time complexity</span><strong>{problem.time}</strong><p>{problem.timeWhy}</p></div><div><span>Space complexity</span><strong>{problem.space}</strong><p>{problem.spaceWhy}</p></div></div>

        <div className="complexity-details"><article><h3>Time growth</h3><p>{problem.bestCase}</p><p>{problem.averageCase}</p><p>{problem.worstCase}</p><div className="growth-visual"><div className="growth-row"><span>Linear O(n)</span><div className="growth-track"><div className="growth-bar linear"/></div></div><div className="growth-row"><span>Quadratic O(n²)</span><div className="growth-track"><div className="growth-bar quadratic"/></div></div><small>Illustrative growth shapes. The highlighted algorithm's complexity is explained above; these bars are not measured runtime.</small></div></article>

          <article><h3>Extra memory</h3><p>{problem.memoryNote}</p><div className="memory-visual">{Array.from({length:8},(_,i)=><div key={i} className={`memory-cell ${problem.space==="O(1)"?i<2?"used":"" : i<6?"used":""}`}>{problem.space==="O(1)"?(i<2?"state":""):(i<6?"item":"")}</div>)}</div><small>Conceptual memory illustration; not a live memory profiler.</small></article>

        </div>

      </section>

    </section>

  </main>;

}
