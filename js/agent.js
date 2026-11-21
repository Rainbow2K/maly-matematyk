// Dwie strategie dla tego samego małego modelu:
//  direct  - model rozwiązuje zadanie sam (krótki chain-of-thought) i podaje liczbę,
//  solver  - model TYLKO tłumaczy zadanie na równanie z niewiadomą x,
//            liczy deterministyczny solver, a błędy wracają do modelu jako feedback.

import { fmt } from './solver.js';

const TRANSLATE_SYSTEM = `You translate math and physics problems into ONE equation with ONE unknown x.
Rules:
- x is the quantity the question asks for.
- Substitute every given number. Do not use letters other than x.
- Allowed: numbers, x, + - * / ^ ( ), sqrt, sin, cos, tan, exp, log, pi.
- Angles in degrees: write sin(x*pi/180).
- Do NOT solve the equation.
- Output exactly one line: EQ: <left side> = <right side>`;

const FEW_SHOT = [
  ['Solve for x: 4(x + 1) = 2x + 10', 'EQ: 4*(x + 1) = 2*x + 10'],
  ['A car starts from rest and accelerates at 2 m/s^2. How many seconds does it need to travel 100 m?', 'EQ: 0.5*2*x^2 = 100'],
  ['A resistor dissipates 50 W when a current of 2 A flows through it. What is its resistance in ohms?', 'EQ: 2^2*x = 50'],
  ['A runner covers 400 m in 80 s. What is the average speed in m/s?', 'EQ: x*80 = 400'],
];

const DIRECT_SYSTEM = `You are a careful math and physics solver. Solve the problem step by step, briefly.
On the last line write only: ANSWER: <number>`;

function translateMessages(q) {
  const m = [{ role: 'system', content: TRANSLATE_SYSTEM }];
  for (const [u, a] of FEW_SHOT) {
    m.push({ role: 'user', content: u });
    m.push({ role: 'assistant', content: a });
  }
  m.push({ role: 'user', content: q });
  return m;
}

export function parseNumber(text) {
  if (!text) return null;
  const t = String(text).replace(/,(?=\d{3}\b)/g, '').replace(/−/g, '-');
  const m = t.match(/ANSWER\s*:?\s*\**\s*(-?\d+(?:\.\d+)?(?:e[-+]?\d+)?)/i);
  if (m) return parseFloat(m[1]);
  const all = t.match(/-?\d+(?:\.\d+)?(?:e[-+]?\d+)?/gi);
  return all ? parseFloat(all[all.length - 1]) : null;
}

export async function solveDirect(problem, llm, { maxTokens = 320 } = {}) {
  const t0 = performance.now();
  const out = await llm.chat(
    [{ role: 'system', content: DIRECT_SYSTEM }, { role: 'user', content: problem.q }],
    { max_new_tokens: maxTokens },
  );
  const x = parseNumber(out);
  return { x, attempts: 1, trace: [{ role: 'model', text: out }], ms: performance.now() - t0, tokens: llm.lastTokens };
}

export async function solveWithSolver(problem, llm, solver, { retries = 2, maxTokens = 48 } = {}) {
  const t0 = performance.now();
  const messages = translateMessages(problem.q);
  const trace = [];
  let tokens = 0;
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    const out = await llm.chat(messages, {
      max_new_tokens: maxTokens,
      ...(attempt > 1 ? { do_sample: true, temperature: 0.6, top_p: 0.95 } : {}),
    });
    tokens += llm.lastTokens || 0;
    const eq = solver.extractEquation(out);
    trace.push({ role: 'model', text: out });
    try {
      const r = solver.solve(eq, problem.pick || 'pos');
      trace.push({
        role: 'solver',
        text: `${r.lhs} = ${r.rhs}  →  x = ${fmt(r.x)}  (pierwiastki: ${r.roots.map(fmt).join(', ')}; residuum ${r.residual.toExponential(1)})`,
      });
      return { x: r.x, eq, attempts: attempt, trace, ms: performance.now() - t0, tokens };
    } catch (e) {
      trace.push({ role: 'solver', text: 'błąd: ' + e.message });
      messages.push({ role: 'assistant', content: out.trim() });
      messages.push({
        role: 'user',
        content: `That equation cannot be used: ${e.message}. Rewrite it. Output exactly one line: EQ: <left side> = <right side>`,
      });
    }
  }
  return { x: null, attempts: retries + 1, trace, ms: performance.now() - t0, tokens };
}
