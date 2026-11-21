// Deterministyczny solver numeryczny jednej zmiennej (x).
// LLM tylko tłumaczy zadanie na równanie, liczenie robi ten moduł.
// mathjs jest wstrzykiwany, żeby ten sam kod działał w przeglądarce i w Node.

const ALLOWED_FUNCS = new Set([
  'sqrt', 'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'exp', 'log', 'log10', 'abs', 'pow', 'cbrt',
]);
const ALLOWED_CONSTS = new Set(['x', 'pi', 'e']);

export function makeSolver(math) {
  // Wyciąga z odpowiedzi modelu jedną linię z równaniem.
  function extractEquation(text) {
    if (!text) return null;
    let t = String(text)
      .replace(/[−–—]/g, '-')
      .replace(/[×·]/g, '*')
      .replace(/÷/g, '/')
      .replace(/\*\*/g, '^')
      .replace(/`/g, '')
      .replace(/\\cdot/g, '*')
      .replace(/²/g, '^2').replace(/³/g, '^3');
    const lines = t.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    let line = lines.find((l) => /^EQ\s*:/i.test(l));
    if (!line) line = lines.find((l) => /EQ\s*:/i.test(l));
    if (!line) line = lines.find((l) => (l.match(/=/g) || []).length === 1 && /x/.test(l));
    if (!line) return null;
    line = line.replace(/^.*?EQ\s*:/i, '').trim();
    line = line.replace(/^[A-Za-z ,']+:\s*/, '').trim();
    line = line.replace(/[.;,]+$/, '').replace(/\$/g, '').trim();
    return line;
  }

  function parse(eq) {
    if (!eq) throw new Error('no equation found (expected a line "EQ: ... = ...")');
    const parts = eq.split('=');
    if (parts.length !== 2) throw new Error('the equation must contain exactly one "=" sign');
    const [lhsStr, rhsStr] = parts.map((s) => s.trim());
    if (!lhsStr || !rhsStr) throw new Error('one side of the equation is empty');
    let lhs, rhs;
    try {
      lhs = math.parse(lhsStr);
      rhs = math.parse(rhsStr);
    } catch (e) {
      throw new Error('cannot parse the expression: ' + e.message);
    }
    const symbols = new Set();
    for (const node of [lhs, rhs]) {
      node.traverse((n, path, parent) => {
        if (n.isSymbolNode) {
          const isFn = parent && parent.isFunctionNode && path === 'fn';
          if (isFn) {
            if (!ALLOWED_FUNCS.has(n.name)) throw new Error(`function "${n.name}" is not allowed`);
          } else if (!ALLOWED_CONSTS.has(n.name)) {
            symbols.add(n.name);
          }
        }
      });
    }
    if (symbols.size) {
      throw new Error(`unknown symbols: ${[...symbols].join(', ')}. Substitute the given numbers; the only unknown allowed is x`);
    }
    let usesX = false;
    for (const node of [lhs, rhs]) node.traverse((n) => { if (n.isSymbolNode && n.name === 'x') usesX = true; });
    if (!usesX) throw new Error('the equation does not contain the unknown x');
    const l = lhs.compile();
    const r = rhs.compile();
    const evalSide = (c, x) => {
      const v = c.evaluate({ x });
      return typeof v === 'number' ? v : (v && typeof v.re === 'number' && Math.abs(v.im) < 1e-12 ? v.re : NaN);
    };
    return {
      lhsStr, rhsStr,
      f: (x) => evalSide(l, x) - evalSide(r, x),
      scale: (x) => 1 + Math.abs(evalSide(l, x)) + Math.abs(evalSide(r, x)),
    };
  }

  function grid() {
    const pts = new Set();
    for (let v = -1000; v <= 1000; v += 0.25) pts.add(+v.toFixed(2));
    for (let k = -6; k <= 8; k += 0.01) {
      const v = Math.pow(10, k);
      pts.add(v); pts.add(-v);
    }
    pts.add(0);
    return [...pts].sort((a, b) => a - b);
  }
  const GRID = grid();

  function isRoot(eqn, r) {
    const fr = eqn.f(r);
    return Number.isFinite(fr) && Math.abs(fr) <= 1e-7 * eqn.scale(r);
  }

  function bisect(eqn, a, fa, b) {
    let lo = a, hi = b, flo = fa;
    for (let i = 0; i < 200; i++) {
      const mid = (lo + hi) / 2;
      const fm = eqn.f(mid);
      if (!Number.isFinite(fm)) return null;
      if (fm === 0) return mid;
      if (Math.sign(fm) === Math.sign(flo)) { lo = mid; flo = fm; } else { hi = mid; }
      if (Math.abs(hi - lo) <= 1e-13 * Math.max(1, Math.abs(lo))) break;
    }
    return (lo + hi) / 2;
  }

  // Zwraca wszystkie pierwiastki znalezione na siatce [-1e8, 1e8].
  function findRoots(eqn) {
    const roots = [];
    let px = null, pf = null;
    for (const x of GRID) {
      const fx = eqn.f(x);
      if (!Number.isFinite(fx)) { px = null; pf = null; continue; }
      if (fx === 0 && isRoot(eqn, x)) roots.push(x);
      else if (pf !== null && Math.sign(fx) !== Math.sign(pf) && pf !== 0) {
        const r = bisect(eqn, px, pf, x);
        if (r !== null && isRoot(eqn, r)) roots.push(r);
      }
      px = x; pf = fx;
    }
    // pierwiastki podwójne: lokalne minima |f| blisko zera
    for (let i = 1; i < GRID.length - 1; i++) {
      const a = Math.abs(eqn.f(GRID[i - 1])), b = Math.abs(eqn.f(GRID[i])), c = Math.abs(eqn.f(GRID[i + 1]));
      if (b < a && b < c && b < 1e-3 * eqn.scale(GRID[i])) {
        // złoty podział na |f|
        let lo = GRID[i - 1], hi = GRID[i + 1];
        for (let k = 0; k < 200; k++) {
          const m1 = lo + (hi - lo) * 0.382, m2 = lo + (hi - lo) * 0.618;
          if (Math.abs(eqn.f(m1)) < Math.abs(eqn.f(m2))) hi = m2; else lo = m1;
        }
        const r = (lo + hi) / 2;
        if (isRoot(eqn, r)) roots.push(r);
      }
    }
    roots.sort((a, b) => a - b);
    const uniq = [];
    for (const r of roots) {
      if (!uniq.length || Math.abs(r - uniq[uniq.length - 1]) > 1e-6 * Math.max(1, Math.abs(r))) uniq.push(r);
    }
    return uniq.map((r) => (Math.abs(r - Math.round(r)) < 1e-9 ? Math.round(r) : r));
  }

  // pick: 'any' (jedyne rozwiązanie), 'pos' (najmniejsze dodatnie), 'max' (największe)
  function choose(roots, pick = 'pos') {
    if (!roots.length) return null;
    if (pick === 'max') return roots[roots.length - 1];
    if (pick === 'pos') {
      const pos = roots.filter((r) => r > 1e-12);
      return pos.length ? pos[0] : (roots.length === 1 ? roots[0] : null);
    }
    return roots.length === 1 ? roots[0] : roots.find((r) => r > 0) ?? roots[0];
  }

  function solve(eqText, pick = 'pos') {
    const eqn = parse(eqText);
    const roots = findRoots(eqn);
    if (!roots.length) throw new Error('the equation has no real solution (|x| < 1e8)');
    const x = choose(roots, pick);
    if (x === null) throw new Error(`no solution matches the condition (${pick}); roots found: ${roots.map(fmt).join(', ')}`);
    const residual = eqn.f(x);
    return { x, roots, residual, lhs: eqn.lhsStr, rhs: eqn.rhsStr };
  }

  return { extractEquation, parse, findRoots, choose, solve };
}

export function fmt(v) {
  if (v === null || v === undefined || Number.isNaN(v)) return '—';
  if (Math.abs(v) >= 1e5 || (Math.abs(v) < 1e-3 && v !== 0)) return v.toExponential(4);
  return String(+v.toPrecision(6));
}

export function isCorrect(got, expected, rel = 0.01) {
  if (got === null || got === undefined || !Number.isFinite(got)) return false;
  return Math.abs(got - expected) <= rel * Math.max(1, Math.abs(expected));
}
