import * as math from 'mathjs';
import { makeSolver, isCorrect, fmt } from '../js/solver.js';
import { PROBLEMS, ORACLE } from '../js/problems.js';
const S = makeSolver(math);
let ok = 0; const t0 = Date.now();
for (const p of PROBLEMS) {
  const r = S.solve(S.extractEquation('EQ: ' + ORACLE[p.id]), p.pick);
  const good = isCorrect(r.x, p.a, 1e-4);
  ok += good;
  if (!good) console.log('FAIL', p.id, r.x, p.a, r.roots);
}
console.log(`oracle ${ok}/${PROBLEMS.length} in ${Date.now()-t0} ms`);
// błędy, które mają dać czytelny feedback
for (const bad of ['EQ: v = 3*x', 'EQ: 3*x', 'EQ: x^2 = -4', 'Here: 0.5*m*x^2 = 4', 'EQ: foo(x) = 1', 'blah']) {
  try { S.solve(S.extractEquation(bad)); console.log('?? no error', bad); }
  catch (e) { console.log('err ok:', bad, '->', e.message); }
}
console.log(S.extractEquation('Sure!\nThe equation is:\nEQ: 0.5 × 2 × x² = 100.'));
