// Turns a few calibration numbers into a full palette. Shared by
// build/generate.js (Node) and calibrate.html (browser), so what you pick in
// the eye test is exactly what gets built.
(function (root) {
  // Soft Monokai roles: the hue each syntax colour keeps, whatever the tuning.
  const HUES = { keyword: 340, string: 52, func: 85, number: 262, type: 190, param: 25 };

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

  // variant: 'dark' | 'light'
  // t: { bg, tx, sat } lightness of background, lightness of text, syntax saturation
  // warmth: 0 (cool blue-grey) .. 100 (warm paper/charcoal)
  function derive(variant, t, warmth) {
    const dark = variant === 'dark';
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
    const role = (h, extraSat = 0, dl = 0) => floor(h, t.sat + extraSat, sl + dl, dark ? 5.5 : 5);
    const mid = (t.bg + t.tx) / 2;

    return {
      bg: bgHex,
      bgDeep: n(t.bg - 2.5),
      bgRaised: n(t.bg + (dark ? 3 : 2)),
      line: n(t.bg + 2.5 * dir),
      selection: n(t.bg + 11 * dir),
      border: n(t.bg + 6 * dir),
      // Body text always outranks comments, even when the pick is very dim.
      text: floor(nh, ns * 0.8, t.tx, dark ? 5.5 : 5),
      textUi: floor(nh, ns * 0.8, t.tx - 5 * dir, 4.5),
      muted: n(mid + 8 * dir),
      faint: n(t.bg + 24 * dir),
      comment: floor(nh, ns, mid + 10 * dir, 4.5),
      punct: floor(nh, ns, t.tx - 14 * dir, 3.5),
      keyword: role(HUES.keyword, 10),
      string: role(HUES.string, 5),
      func: role(HUES.func),
      number: role(HUES.number, 10),
      type: role(HUES.type),
      param: role(HUES.param, 15),
      error: role(2, 15),
      warning: role(40, 20),
      info: role(HUES.type),
      added: role(HUES.func, 0, -8 * dir),
      modified: role(205, 5, -8 * dir),
      deleted: role(2, 10, -8 * dir),
      accent: dark ? role(HUES.string, 5) : role(HUES.param, 15),
      button: n(dark ? t.bg + 18 : t.tx + 18),
      buttonText: n(dark ? 92 : 97),
    };
  }

  // Short result code from the eye test, e.g.
  // SC1 f=fira w=500 s=15 lh=1.6 wm=40 L=93,25,40 D=18,79,45
  const FONTS = { jet: 'JetBrains Mono', fira: 'Fira Code', plex: 'IBM Plex Mono', scp: 'Source Code Pro' };

  function encode(c) {
    const key = Object.keys(FONTS).find(k => FONTS[k] === c.font);
    const tri = t => [t.bg, t.tx, t.sat].map(v => Math.round(v)).join(',');
    return `SC1 f=${key} w=${c.weight} s=${c.size} lh=${c.lineHeight} wm=${Math.round(c.warmth)} L=${tri(c.light)} D=${tri(c.dark)}`;
  }

  function decode(code) {
    const kv = Object.fromEntries(code.trim().split(/\s+/).slice(1).map(p => p.split('=')));
    const tri = s => { const [bg, tx, sat] = s.split(',').map(Number); return { bg, tx, sat }; };
    if (!FONTS[kv.f] || !kv.L || !kv.D) throw new Error(`Not a Soft Comfort code: ${code}`);
    return {
      font: FONTS[kv.f], weight: Number(kv.w), size: Number(kv.s),
      lineHeight: Number(kv.lh), warmth: Number(kv.wm), light: tri(kv.L), dark: tri(kv.D),
    };
  }

  const api = { HUES, FONTS, hsl, contrast, derive, encode, decode };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SoftComfort = api;
})(this);
