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

  const api = { HUES, BASES, FONTS, MONO, HL, TINTS, hsl, contrast, derive, complete, encode, decode };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SoftComfort = api;
})(this);
