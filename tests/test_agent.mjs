import * as math from 'mathjs';
import { makeSolver, isCorrect } from '../js/solver.js';
import { solveWithSolver, solveDirect, parseNumber } from '../js/agent.js';
import { PROBLEMS, ORACLE } from '../js/problems.js';
const S = makeSolver(math);
// fałszywy model: najpierw zwraca równanie z literą, po feedbacku poprawne
function fake(p) {
  let n = 0;
  return { lastTokens: 10, async chat(msgs) { n++; return n === 1 ? 'EQ: 0.5*m*x^2 = 4' : 'EQ: ' + ORACLE[p.id]; } };
}
let ok = 0;
for (const p of PROBLEMS) { const r = await solveWithSolver(p, fake(p), S); ok += isCorrect(r.x, p.a); if (r.attempts !== 2) throw new Error('attempts'); }
console.log('agent with 1 correction:', ok, '/', PROBLEMS.length);
const d = await solveDirect(PROBLEMS[0], { async chat() { return 'Step 1: 5x = 35\nANSWER: 7'; } });
console.log('direct parse', d.x, parseNumber('so x = 1,500 and **ANSWER: 1500**'), parseNumber('The answer is 3.03 s'));
