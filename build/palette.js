// Turns a few calibration numbers into a full palette. Shared by
// build/generate.js (Node) and calibrate.html (browser), so what you pick in
// the eye test is exactly what gets built.
(function (root) {
  // Soft Monokai roles: the hue each syntax colour keeps, whatever the tuning.
  const HUES = { keyword: 340, string: 52, func: 85, number: 262, type: 190, param: 25 };

  // Theme bases the eye test chooses between. Each is a hue family (role ->
  // [hue, extra saturation]) taken from a well-known theme, plus its starting
  // tuning. Every base still goes through the same contrast floors below.
  const BASES = {
    soft: {
      label: 'Soft Comfort (soft Monokai)', warmth: 100,
      roles: { keyword: [340, 10], string: [52, 5], func: [85, 0], number: [262, 10], type: [190, 0], param: [25, 15] },
      light: { bg: 93, tx: 22, sat: 60 }, dark: { bg: 17, tx: 82, sat: 45 },
    },
    github: {
      label: 'GitHub-style', warmth: 25,
      roles: { keyword: [355, 15], string: [215, 10], func: [262, 0], number: [210, 10], type: [24, 10], param: [24, -10] },
      light: { bg: 99, tx: 14, sat: 70 }, dark: { bg: 12, tx: 85, sat: 60 },
    },
    latte: {
      label: 'Catppuccin Latte-style', warmth: 0,
      roles: { keyword: [266, 0], string: [109, -5], func: [220, 5], number: [22, 15], type: [35, 10], param: [355, 5] },
      light: { bg: 95, tx: 22, sat: 70 }, dark: { bg: 16, tx: 85, sat: 60 },
    },
    ink: {
      label: 'iA Writer-style ink on paper', warmth: 55,
      roles: { keyword: [215, -20], string: [150, -25], func: [205, -10], number: [280, -20], type: [185, -20], param: [30, -15] },
      light: { bg: 97, tx: 10, sat: 45 }, dark: { bg: 13, tx: 86, sat: 35 },
    },
    sepia: {
      label: 'E-reader sepia', warmth: 100,
      roles: { keyword: [345, 0], string: [95, -10], func: [200, -5], number: [280, 0], type: [175, -5], param: [20, 5] },
      light: { bg: 89, tx: 16, sat: 50 }, dark: { bg: 15, tx: 80, sat: 40 },
    },
    atom: {
      label: 'Atom One Light-style', warmth: 35,
      roles: { keyword: [301, 0], string: [120, -10], func: [221, 10], number: [35, 10], type: [45, 15], param: [5, 10] },
      light: { bg: 98, tx: 18, sat: 60 }, dark: { bg: 17, tx: 80, sat: 45 },
    },
    // Popular dark themes, taken from their official light variants.
    tokyo: {
      label: 'Tokyo Night Day-style', warmth: 0,
      roles: { keyword: [266, 15], string: [90, -5], func: [215, 15], number: [32, 15], type: [195, 10], param: [343, 10] },
      light: { bg: 90, tx: 20, sat: 70 }, dark: { bg: 14, tx: 82, sat: 55 },
    },
    monokai: {
      label: 'Monokai Pro Light-style', warmth: 75,
      roles: { keyword: [342, 15], string: [35, 15], func: [153, 5], number: [254, 10], type: [192, 10], param: [16, 15] },
      light: { bg: 97, tx: 18, sat: 65 }, dark: { bg: 16, tx: 84, sat: 55 },
    },
    solarized: {
      label: 'Solarized Light-style', warmth: 100,
      roles: { keyword: [68, 10], string: [175, 0], func: [205, 10], number: [331, 5], type: [45, 15], param: [18, 10] },
      light: { bg: 94, tx: 22, sat: 70 }, dark: { bg: 14, tx: 80, sat: 55 },
    },
    gruvbox: {
      label: 'Gruvbox Light-style', warmth: 100,
      roles: { keyword: [358, 15], string: [58, 5], func: [143, 0], number: [323, 5], type: [37, 15], param: [189, 10] },
      light: { bg: 90, tx: 18, sat: 65 }, dark: { bg: 15, tx: 82, sat: 50 },
    },
  };

  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  function hsl(h, s, l) {
    s = clamp(s, 0, 100) / 100;
    l = clamp(l, 0, 100) / 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
    return '#' + [f(0), f(8), f(4)].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
  }

  function luminance(hex) {
    const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map(v => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }

  function contrast(a, b) {
    const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
    return (x + 0.05) / (y + 0.05);
  }

  // Highlights and cursor: selection strength (lightness step from the
  // background), selection tint, current-line step, find-match opacity (%),
  // cursor width (px), style, and colour (a = accent, t = text).
  const HL = { sel: 11, tint: 'g', line: 2.5, find: 33, cw: 2, cst: 'line', cc: 'a' };
  const TINTS = { g: null, b: 212, y: 45, n: 130 };
  const alpha = pct => Math.round(Math.max(0, Math.min(100, pct)) * 2.55).toString(16).padStart(2, '0');

  // variant: 'dark' | 'light'
  // t: { bg, tx, sat } lightness of background, lightness of text, syntax saturation
  // warmth: 0 (cool blue-grey) .. 100 (warm paper/charcoal)
  function derive(variant, t, warmth, base = 'soft', hl = {}) {
    const h = { ...HL, ...hl };
    const dark = variant === 'dark';
    const R = BASES[base].roles;
    // Neutral greys: blue-grey below 50, pure grey at 50, amber-grey above.
    // (Sweeping the hue from 220 to 40 would pass through green.)
    const nh = warmth < 50 ? 220 : 40;
    const ns = 2 + (Math.abs(warmth - 50) / 50) * 14;
    const n = l => hsl(nh, ns, l);
    const dir = dark ? 1 : -1;            // which way "raised" or "stronger" goes
    const sl = dark ? t.tx - 6 : t.tx + 10;
    const bgHex = n(t.bg);
    // Never let a colour fall below a readable floor: step it away from the
    // background until it clears. Yellows and greens need this most.
    const floor = (h, s, l, min) => {
      let c = hsl(h, s, l);
      for (let i = 0; i < 40 && contrast(c, bgHex) < min; i++) c = hsl(h, s, (l += dir));
      return c;
    };
    const role = (h, extraSat = 0, dl = 0) => floor(h, t.sat + extraSat, sl + dl, dark ? 7 : 6.5);
    const mid = (t.bg + t.tx) / 2;

    const tint = TINTS[h.tint];
    const p = {
      bg: bgHex,
      bgDeep: n(t.bg - 2.5),
      bgRaised: n(t.bg + (dark ? 3 : 2)),
      line: n(t.bg + h.line * dir),
      selection: tint == null ? n(t.bg + h.sel * dir) : hsl(tint, dark ? 30 : 55, t.bg + h.sel * dir),
      border: n(t.bg + 6 * dir),
      // Body text always outranks comments, even when the pick is very dim.
      text: floor(nh, ns * 0.8, t.tx, 7),
      textUi: floor(nh, ns * 0.8, t.tx - 5 * dir, 7),
      muted: n(mid + 8 * dir),
      faint: n(t.bg + 24 * dir),
      comment: floor(nh, ns, mid + 10 * dir, 5.5),
      punct: floor(nh, ns, t.tx - 14 * dir, 5),
      keyword: role(...R.keyword),
      string: role(...R.string),
      func: role(...R.func),
      number: role(...R.number),
      type: role(...R.type),
      param: role(...R.param),
      error: role(2, 15),
      warning: role(40, 20),
      info: role(...R.type),
      added: role(R.func[0], 0, -8 * dir),
      modified: role(205, 5, -8 * dir),
      deleted: role(2, 10, -8 * dir),
      accent: dark ? role(...R.string) : role(...R.param),
      button: n(dark ? t.bg + 18 : t.tx + 18),
      buttonText: n(dark ? 92 : 97),
    };
    p.findMatch = p.warning + alpha(h.find);
    p.findMatchHi = p.warning + alpha(h.find * 0.55);
    p.cursor = h.cc === 't' ? p.text : p.accent;
    return p;
  }

  // Short result code from the eye test, e.g.
  // SC2 b=soft f=fira w=550 s=14 lh=1.6 wm=100 pf=lit ps=17 plh=1.8 pw=80 L=93,22,60 D=17,82,45
  const FONTS = {
    jet: 'JetBrains Mono', fira: 'Fira Code', plex: 'IBM Plex Mono', scp: 'Source Code Pro',
    ahm: 'Atkinson Hyperlegible Mono', ahn: 'Atkinson Hyperlegible Next', plexs: 'IBM Plex Sans', lit: 'Literata', inter: 'Inter',
  };
  const MONO = ['fira', 'jet', 'plex', 'ahm', 'scp'];
  const fontKey = name => Object.keys(FONTS).find(k => FONTS[k] === name);

  // Fill in anything an older code didn't carry, so every field exists.
  function complete(c) {
    c.hl = { ...HL, ...(c.hl || {}) };
    if (c.ls == null) c.ls = 0.3;
    if (c.prose.ls == null) c.prose.ls = 0;
    c.md = { font: c.prose.font, size: c.prose.size, lineHeight: c.prose.lineHeight, ...(c.md || {}) };
    return c;
  }

  function encode(c) {
    complete(c);
    const tri = t => [t.bg, t.tx, t.sat].map(v => Math.round(v)).join(',');
    const h = c.hl;
    return `SC2 b=${c.base} f=${fontKey(c.font)} w=${c.weight} s=${c.size} lh=${c.lineHeight} wm=${Math.round(c.warmth)} ` +
      `pf=${fontKey(c.prose.font)} ps=${c.prose.size} plh=${c.prose.lineHeight} pw=${c.prose.width} L=${tri(c.light)} D=${tri(c.dark)} ` +
      `hs=${h.sel} ht=${h.tint} cl=${h.line} hf=${h.find} cw=${h.cw} cst=${h.cst} cc=${h.cc} ls=${c.ls} pls=${c.prose.ls} ` +
      `mf=${fontKey(c.md.font)} ms=${c.md.size} mlh=${c.md.lineHeight}`;
  }

  function decode(code) {
    // Case-insensitive and forgiving, since codes get retyped on phones.
    const kv = Object.fromEntries(code.trim().split(/\s+/).slice(1).map(p => p.toLowerCase().split('=')));
    const tri = s => { const [bg, tx, sat] = s.split(',').map(Number); return { bg, tx, sat }; };
    if (!FONTS[kv.f] || !kv.l || !kv.d) throw new Error(`Not a Soft Comfort code: ${code}`);
    const base = BASES[kv.b] ? kv.b : 'soft';
    const num = (v, d) => (v == null || v === '' || isNaN(Number(v)) ? d : Number(v));
    const hl = {
      sel: num(kv.hs, HL.sel), tint: kv.ht in TINTS ? kv.ht : HL.tint, line: num(kv.cl, HL.line),
      find: num(kv.hf, HL.find), cw: num(kv.cw, HL.cw),
      cst: ['line', 'block', 'underline'].includes(kv.cst) ? kv.cst : HL.cst, cc: kv.cc === 't' ? 't' : 'a',
    };
    return complete({
      base, font: FONTS[kv.f], weight: Number(kv.w), size: Number(kv.s),
      lineHeight: Number(kv.lh), warmth: Number(kv.wm),
      prose: {
        font: FONTS[kv.pf] || FONTS[kv.f], size: Number(kv.ps) || Number(kv.s) + 2,
        lineHeight: Number(kv.plh) || 1.8, width: Number(kv.pw) || 80, ls: num(kv.pls, 0),
      },
      light: tri(kv.l), dark: tri(kv.d), hl, ls: num(kv.ls, 0.3),
      md: FONTS[kv.mf] ? { font: FONTS[kv.mf], size: num(kv.ms, 16), lineHeight: num(kv.mlh, 1.6) } : undefined,
      nd: kv.nd ? kv.nd.split('.') : [],
    });
  }

  // ---------- word codes ----------
  // Every test result sits on a fixed grid, so the whole result is one big
  // number in mixed radix (one digit per setting, one per test's effect).
  // That number is written as made-up three-syllable words, like "bakemo".

  // The staircase grids. The eye test steps along these, so results land on them.
  const GRID = {
    tx: { path: ['light', 'tx'], lo: 4, hi: 34, round: 1 },
    bg: { path: ['light', 'bg'], lo: 84, hi: 100, round: 1 },
    wm: { path: ['warmth'], lo: 0, hi: 100, round: 5 },
    sat: { path: ['light', 'sat'], lo: 10, hi: 95, round: 5 },
    w: { path: ['weight'], lo: 300, hi: 700, round: 50 },
    ps: { path: ['prose', 'size'], lo: 13, hi: 26, round: 1 },
    plh: { path: ['prose', 'lineHeight'], lo: 1.2, hi: 2.3, round: 0.05 },
    pw: { path: ['prose', 'width'], lo: 45, hi: 120, round: 5 },
    cs: { path: ['size'], lo: 11, hi: 22, round: 1 },
    clh: { path: ['lineHeight'], lo: 1.2, hi: 2.0, round: 0.05 },
    hs: { path: ['hl', 'sel'], lo: 3, hi: 30, round: 1 },
    cl: { path: ['hl', 'line'], lo: 0, hi: 10, round: 0.5 },
    hf: { path: ['hl', 'find'], lo: 10, hi: 95, round: 5 },
    cw: { path: ['hl', 'cw'], lo: 1, hi: 5, round: 1 },
    ls: { path: ['ls'], lo: 0, hi: 1.5, round: 0.1 },
    pls: { path: ['prose', 'ls'], lo: 0, hi: 1.5, round: 0.1 },
    ms: { path: ['md', 'size'], lo: 13, hi: 26, round: 1 },
    mlh: { path: ['md', 'lineHeight'], lo: 1.2, hi: 2.3, round: 0.05 },
  };
  const at = (o, p) => p.reduce((a, k) => a[k], o);
  const put = (o, p, v) => { p.slice(0, -1).reduce((a, k) => (a[k] = a[k] || {}), o)[p[p.length - 1]] = v; };
  const gridField = g => {
    const n = Math.round((g.hi - g.lo) / g.round) + 1;
    return { n, get: c => Math.max(0, Math.min(n - 1, Math.round((at(c, g.path) - g.lo) / g.round))),
      set: (c, i) => put(c, g.path, Number((g.lo + i * g.round).toFixed(2))) };
  };
  const pickField = (path, opts, toName = v => v, fromName = v => v) => ({
    n: opts.length, get: c => Math.max(0, opts.indexOf(fromName(at(c, path)))), set: (c, i) => put(c, path, toName(opts[i])),
  });
  const fontField = (path, keys) => pickField(path, keys, k => FONTS[k], fontKey);
  const PICKS = {
    th: pickField(['base'], Object.keys(BASES)),
    pf: fontField(['prose', 'font'], Object.keys(FONTS)),
    cf: fontField(['font'], MONO),
    ht: pickField(['hl', 'tint'], Object.keys(TINTS)),
    cst: pickField(['hl', 'cst'], ['line', 'block', 'underline']),
    cc: pickField(['hl', 'cc'], ['a', 't']),
    mf: fontField(['md', 'font'], Object.keys(FONTS)),
  };
  // The eye test's order. fx per test: 0 same (or skipped), 1 slightly, 2 clearly.
  const TEST_IDS = ['th', 'tx', 'bg', 'wm', 'sat', 'pf', 'w', 'ps', 'plh', 'pw', 'cf', 'cs', 'clh',
    'hs', 'ht', 'cl', 'hf', 'cst', 'cw', 'cc', 'ls', 'pls', 'mf', 'ms', 'mlh'];
  const FIELDS = TEST_IDS.map(id => PICKS[id] || gridField(GRID[id]));
  const CHECK = 251;   // a typo almost always breaks the check digit
  const CONS = 'bdfghjklmnprstvz', VOW = 'aeiou', SYL = CONS.length * VOW.length, PER_WORD = 3;

  // Digits are written least significant first: d0 + r0*(d1 + r1*(d2 + ...)),
  // so the decoder can learn each next radix from the digits before it.
  const RADIX = [...FIELDS.map(f => f.n), ...TEST_IDS.map(() => 3)];
  const values = (c, fx = {}) => [...FIELDS.map(f => f.get(complete(c))), ...TEST_IDS.map(id => fx[id] || 0)];
  const sumCheck = (ds, m) => ds.reduce((a, d, i) => (a + d * (i + 1)) % m, 0);

  // Full: every value. Changes: only the values that differ from a base
  // calibration (a refine run), as (gap to the next changed slot, new value).
  function payload(v, b) {
    if (!b) return { mode: 0, digits: v.map((d, i) => [d, RADIX[i]]) };
    const ds = [[sumCheck(b, CHECK), CHECK]];
    const changed = v.map((d, i) => i).filter(i => v[i] !== b[i]);
    ds.push([changed.length, RADIX.length + 1]);
    let next = 0;
    for (const i of changed) {
      ds.push([i - next, RADIX.length - next]);
      ds.push([v[i] < b[i] ? v[i] : v[i] - 1, RADIX[i] - 1]);   // the base value can't recur
      next = i + 1;
    }
    return { mode: 1, digits: ds };
  }

  function spell(digits) {
    let big = 0n, mult = 1n;
    for (const [d, r] of digits) { big += BigInt(d) * mult; mult *= BigInt(r); }
    const syl = [];
    while (big > 0n || syl.length === 0) { syl.unshift(Number(big % BigInt(SYL))); big /= BigInt(SYL); }
    while (syl.length % PER_WORD) syl.unshift(0);
    const out = syl.map(d => CONS[Math.floor(d / VOW.length)] + VOW[d % VOW.length]);
    const words = [];
    for (let i = 0; i < out.length; i += PER_WORD) words.push(out.slice(i, i + PER_WORD).join(''));
    return words.join(' ');
  }

  // base: the calibration the run started from, if any. Gives the shorter code.
  function toWords(c, fx = {}, base = null) {
    const v = values(JSON.parse(JSON.stringify(c)), fx);
    const options = [payload(v)];
    if (base) options.push(payload(v, values(JSON.parse(JSON.stringify(base)), base.fx)));
    return options.map(({ mode, digits }) => {
      const body = digits.map(x => x[0]);
      return spell([[mode, 2], [sumCheck(body, CHECK), CHECK], ...digits]);
    }).sort((a, b) => a.length - b.length)[0];
  }

  // base: the current calibration. It supplies what the words don't carry
  // (the dark colours), and for a changes-only code, everything unchanged.
  function fromWords(text, base) {
    const letters = text.toLowerCase().replace(/[^a-z]/g, '');
    if (!letters || letters.length % 2) throw new Error('Those words are the wrong length. Check for a missing letter.');
    let big = 0n;
    for (let i = 0; i < letters.length; i += 2) {
      const ci = CONS.indexOf(letters[i]), vi = VOW.indexOf(letters[i + 1]);
      if (ci < 0 || vi < 0) throw new Error(`"${letters.slice(i, i + 2)}" is not a syllable these codes use. Check the spelling.`);
      big = big * BigInt(SYL) + BigInt(ci * VOW.length + vi);
    }
    const body = [];
    const read = r => { const d = Number(big % BigInt(r)); big /= BigInt(r); body.push(d); return d; };
    const bad = () => new Error('The words do not check out. One is probably misspelled.');
    const mode = Number(big % 2n); big /= 2n;
    const check = Number(big % BigInt(CHECK)); big /= BigInt(CHECK);
    const b = values(JSON.parse(JSON.stringify(base)), base.fx);
    let v;
    if (mode === 0) v = RADIX.map(r => read(r));
    else {
      if (read(CHECK) !== sumCheck(b, CHECK)) throw new Error('These words were made from a different starting calibration than the current one.');
      v = b.slice();
      const k = read(RADIX.length + 1);
      let next = 0;
      for (let j = 0; j < k; j++) {
        const i = next + read(RADIX.length - next);
        if (i >= RADIX.length) throw bad();
        const alt = read(RADIX[i] - 1);
        v[i] = alt < b[i] ? alt : alt + 1;
        next = i + 1;
      }
    }
    if (big !== 0n || check !== sumCheck(body, CHECK)) throw bad();
    const c = complete(JSON.parse(JSON.stringify(base)));
    delete c.nd;
    FIELDS.forEach((f, i) => f.set(c, v[i]));
    c.fx = Object.fromEntries(TEST_IDS.map((id, i) => [id, v[FIELDS.length + i]]));
    c.nd = TEST_IDS.filter(id => c.fx[id] === 0 && !(id === 'cw' && c.hl.cst === 'block'));
    return c;
  }

  const api = { HUES, BASES, FONTS, MONO, HL, TINTS, GRID, TEST_IDS, hsl, contrast, derive, complete, encode, decode, toWords, fromWords };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SoftComfort = api;
})(this);
