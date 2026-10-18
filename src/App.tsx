import { useEffect, useMemo, useState } from "react";
import type { Language, VisualStep, Problem } from "./engine/types";
import "./App.css";
import { modularProblems } from "./problems/registry.ts";


function step(

  title: string, explanation: string, line: number, pseudocodeLine: number,

  currentIndex: number | null, array: number[], variables: {label: string; value: string}[],

  memory: {label: string; value: string}[], result: string | null,

  activeRange?: [number, number]

): VisualStep {

  return { title, explanation, line, pseudocodeLine, currentIndex, array, variables, memory, result, activeRange };

}



function parseNumbers(input: string): number[] {

  const values = input.trim().split(/[\s,]+/).filter(Boolean).map(Number);

  if (!values.length || values.some((n) => !Number.isFinite(n))) throw new Error("Enter one or more valid numbers separated by commas or spaces.");

  return values;

}



const problems: Problem[] = [
  ...modularProblems,

  {

    id:"121",title:"Best Time to Buy and Sell Stock",difficulty:"Easy",category:"Greedy",

    description:"Choose one day to buy and a later day to sell for the maximum profit.",

    inputHint:"Daily prices (example: 7, 1, 5, 3, 6, 4)",

    defaultInput:"7, 1, 5, 3, 6, 4",

    languages:{

      Python:["def maxProfit(prices):","    min_price = float('inf')","    best = 0","    for price in prices:","        min_price = min(min_price, price)","        best = max(best, price - min_price)","    return best"],

      "C++":["int maxProfit(vector<int>& prices) {","    int minPrice = INT_MAX, best = 0;","    for (int price : prices) {","        minPrice = min(minPrice, price);","        best = max(best, price - minPrice);","    }","    return best;","}"],

      Java:["int maxProfit(int[] prices) {","    int minPrice = Integer.MAX_VALUE, best = 0;","    for (int price : prices) {","        minPrice = Math.min(minPrice, price);","        best = Math.max(best, price - minPrice);","    }","    return best;","}"]

    },

    pseudocode:["set minimum price to infinity and best profit to zero","for each day's price","update the lowest price seen so far","calculate profit if selling today","keep the largest profit","return the best profit"],

    parse(input){return {array:parseNumbers(input)};},

    run(input){const {array}=this.parse(input);let minPrice=Infinity,best=0;const s:VisualStep[]=[step("Initialize tracking values","We need the cheapest price seen so far and the best profit. Start with infinity and zero.",2,0,null,array,[{label:"Min price",value:"∞"},{label:"Best profit",value:"0"}],[],null)];array.forEach((price,i)=>{if(price<minPrice)minPrice=price;s.push(step(`Check day ${i+1}`,`Price is ${price}. Lowest price seen so far is ${minPrice}.`,5,2,i,array,[{label:"Price",value:String(price)},{label:"Min price",value:String(minPrice)}],[],null));const profit=price-minPrice;if(profit>best)best=profit;s.push(step("Update possible profit",`Selling today would give ${price} − ${minPrice} = ${profit}. Best profit so far is ${best}.`,6,3,i,array,[{label:"Today's profit",value:String(profit)},{label:"Best profit",value:String(best)}],[],null));});s.push(step("Maximum profit",`The best achievable profit is ${best}. Buy before selling; a negative profit is never chosen.`,7,4,null,array,[{label:"Best profit",value:String(best)}],[],`Maximum profit: ${best}`));return s;},

    time:"O(n)",space:"O(1)",timeWhy:"Each price is processed once. Updating the minimum and comparing the current profit are constant-time operations, so doubling the number of days roughly doubles the work.",spaceWhy:"Only the minimum price and best profit are tracked. The algorithm does not need a second array or a map.",bestCase:"O(n) for the standard single-pass implementation, even if the first price is ideal.",averageCase:"O(n): one pass over all prices.",worstCase:"O(n): every day is visited once.",memoryNote:"Two main values are kept: minimum price and best profit."

  },

  {

    id:"53",title:"Maximum Subarray",difficulty:"Medium",category:"Dynamic Programming",

    description:"Find the contiguous subarray with the largest sum.",

    inputHint:"Array values (example: -2, 1, -3, 4, -1, 2, 1, -5, 4)",

    defaultInput:"-2, 1, -3, 4, -1, 2, 1, -5, 4",

    languages:{

      Python:["def maxSubArray(nums):","    current = best = nums[0]","    for num in nums[1:]:","        current = max(num, current + num)","        best = max(best, current)","    return best"],

      "C++":["int maxSubArray(vector<int>& nums) {","    int current = nums[0], best = nums[0];","    for (int i = 1; i < nums.size(); i++) {","        current = max(nums[i], current + nums[i]);","        best = max(best, current);","    }","    return best;","}"],

      Java:["int maxSubArray(int[] nums) {","    int current = nums[0], best = nums[0];","    for (int i = 1; i < nums.length; i++) {","        current = Math.max(nums[i], current + nums[i]);","        best = Math.max(best, current);","    }","    return best;","}"]

    },

    pseudocode:["initialize current sum and best sum from first value","for each remaining value","choose between starting fresh or extending current subarray","update the best sum seen so far","return the best sum"],

    parse(input){return {array:parseNumbers(input)};},

    run(input){const {array}=this.parse(input);let current=array[0],best=array[0];const s:VisualStep[]=[step("Initialize sums","Start both current sum and best sum at the first value. This also handles arrays containing only negative values.",2,0,0,array,[{label:"Current sum",value:String(current)},{label:"Best sum",value:String(best)}],[],null)];for(let i=1;i<array.length;i++){const extended=current+array[i];current=Math.max(array[i],extended);best=Math.max(best,current);s.push(step(`Process value ${array[i]}`,`Compare starting a new subarray at ${array[i]} with extending the previous sum (${extended}). Current sum becomes ${current}; best remains ${best}.`,4,2,i,array,[{label:"Value",value:String(array[i])},{label:"Current sum",value:String(current)},{label:"Best sum",value:String(best)}],[],null));}s.push(step("Maximum subarray sum",`The largest contiguous-subarray sum found is ${best}.`,6,4,null,array,[{label:"Best sum",value:String(best)}],[],`Maximum subarray sum: ${best}`));return s;},

    time:"O(n)",space:"O(1)",timeWhy:"The algorithm makes one pass and does constant work per value: decide whether to extend the current subarray, then update the best sum.",spaceWhy:"Only two running sums are stored. No table of all subarray sums is created.",bestCase:"O(n) for this one-pass method.",averageCase:"O(n): one constant-time update per element.",worstCase:"O(n): each element is processed once.",memoryNote:"Two running sums, independent of the input length."

  },

  {

    id:"20",title:"Valid Parentheses",difficulty:"Easy",category:"Stack",

    description:"Check whether every opening bracket is closed in the correct order.",

    inputHint:"Bracket string (example: ()[]{} or ([)] )",

    defaultInput:"()[]{}",

    languages:{

      Python:["def isValid(s):","    stack = []","    pairs = {')':'(', ']':'[', '}':'{'}","    for char in s:","        if char in pairs:","            if not stack or stack.pop() != pairs[char]:","                return False","        else:","            stack.append(char)","    return not stack"],

      "C++":["bool isValid(string s) {","    stack<char> st;","    for (char c : s) {","        if (c == '(' || c == '[' || c == '{') st.push(c);","        else {","            if (st.empty()) return false;","            char top = st.top(); st.pop();","            if ((c == ')' && top != '(') || (c == ']' && top != '[') || (c == '}' && top != '{')) return false;","        }","    }","    return st.empty();","}"],

      Java:["boolean isValid(String s) {","    Deque<Character> stack = new ArrayDeque<>();","    for (char c : s.toCharArray()) {","        if (c == '(' || c == '[' || c == '{') stack.push(c);","        else {","            if (stack.isEmpty()) return false;","            char top = stack.pop();","            if ((c == ')' && top != '(') || (c == ']' && top != '[') || (c == '}' && top != '{')) return false;","        }","    }","    return stack.isEmpty();","}"]

    },

    pseudocode:["create an empty stack","read each bracket from left to right","push opening brackets","for a closing bracket, check the most recent opening bracket","return false if the pair/order is invalid","valid only if the stack is empty at the end"],

    parse(input){const text=input.trim();if(!text||!Array.from(text).every(c=>"()[]{}".includes(c)))throw new Error("Enter a bracket string using only (, ), [, ], {, }.");return {array:Array.from(text).map(c=>c.charCodeAt(0)),text};},

    run(input){const {text}=this.parse(input);const chars=Array.from(text??"");const stack:string[]=[];const pairs:Record<string,string>={")":"(","]":"[","}":"{"};const arr=chars.map(c=>c.charCodeAt(0));const s:VisualStep[]=[step("Create an empty stack","The stack remembers opening brackets. The most recent opening bracket must close first.",2,0,null,arr,[{label:"Input",value:text??""}],[],null)];for(let i=0;i<chars.length;i++){const c=chars[i];if("([{".includes(c)){stack.push(c);s.push(step(`Push '${c}'`, `'${c}' is an opening bracket, so push it onto the stack.`,9,2,i,arr,[{label:"Character",value:c},{label:"Position",value:String(i)}],stack.map((v,j)=>({label:`Stack ${j+1}`,value:v})),null));}else{const top=stack.pop();const ok=top===pairs[c];s.push(step(ok?`Match '${c}'`:`Invalid closing '${c}'`,ok?`'${c}' correctly closes '${top}'. Remove the opening bracket from the stack.`:`Expected a closing bracket for '${top??"nothing"}', but found '${c}'. The sequence is invalid.`,6,3,i,arr,[{label:"Character",value:c},{label:"Top before pop",value:top??"empty"}],stack.map((v,j)=>({label:`Stack ${j+1}`,value:v})),ok?null:"Invalid bracket sequence"));if(!ok)return s;}}s.push(step(stack.length===0?"Valid parentheses":"Unclosed brackets",stack.length===0?"All brackets matched in the correct order, and the stack is empty.":"Some opening brackets remain without matching closers.",10,5,null,arr,[],stack.map((v,j)=>({label:`Stack ${j+1}`,value:v})),stack.length===0?"Valid bracket sequence":"Invalid · opening brackets remain"));return s;},

    time:"O(n)",space:"O(n)",timeWhy:"Each character is examined once. Stack push and pop operations take O(1), so processing n characters takes linear time.",spaceWhy:"In the worst case, all characters are opening brackets and must remain on the stack until the end. Stack size can therefore grow with n.",bestCase:"O(1) if an invalid closing bracket is detected immediately; otherwise input must be scanned.",averageCase:"O(n): scan characters and use constant-time stack operations.",worstCase:"O(n): every character is processed.",memoryNote:"The stack can hold up to n opening brackets."

  }

];



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

              {step.result&&<div className="result"><span>✓</span><div><strong>{step.result}</strong><p>Result for this input</p></div></div>}

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
