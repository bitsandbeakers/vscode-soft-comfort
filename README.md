# Soft Comfort

Two VS Code themes for long sessions and tired eyes: **Soft Comfort Dark** and **Soft Comfort Light**. Both use Monokai's colour layout (pink keywords, yellow strings, green functions, purple numbers, cyan types, orange parameters), softened.

Built around three problems: text that glows or blurs, tired aching eyes, and squinting.

- **No pure black, no pure white.** Hard black/white edges cause halation, a glow around letters that's worse with astigmatism or after LASIK.
- **Lifted dark background (`#2b2c30`).** A near-black background makes your pupils open wider, which blurs text more. Charcoal keeps them smaller.
- **A light twin for bright rooms.** In a bright office, a dark theme forces your eyes to adjust constantly between the screen and the room. Soft Comfort Light is warm paper (`#f3f0e8`) with dark-grey text, not black on white.
- **Contrast in a comfort band.** Body text is about 8.7:1 in both themes: easy to read, no glare. Syntax colours are 5–9:1, comments 4.5:1 so they recede.
- **Quiet chrome.** The sidebar, tabs and panels are one step off the editor colour, with no borders.

## Install

**From a release (no marketplace needed, works on a locked-down work machine):**

1. Download `soft-comfort-dark-<version>.vsix` from [Releases](https://github.com/bitsandbeakers/vscode-soft-comfort/releases).
2. In VS Code: Extensions view → `...` menu → **Install from VSIX...** and pick the file.
   Or from a terminal: `code --install-extension soft-comfort-dark-1.1.0.vsix`
3. Ctrl+K Ctrl+T → **Soft Comfort Dark** or **Soft Comfort Light**.

## Recommended settings

The theme is half of it. These settings do the rest.

**Quick version:** copy everything inside the braces of [`settings.json`](settings.json) in this repo. In VS Code, press Ctrl+Shift+P → **Preferences: Open User Settings (JSON)**. Paste it before the final `}`, and add a comma after the line above it.

Full version with the reasons:

```jsonc
{
  // Follow Windows/macOS light-dark mode: Light in the day, Dark at night.
  "window.autoDetectColorScheme": true,
  "workbench.preferredLightColorTheme": "Soft Comfort Light",
  "workbench.preferredDarkColorTheme": "Soft Comfort Dark",
  "workbench.colorTheme": "Soft Comfort Light",

  // Thicker strokes blur less than Consolas' thin ones.
  "editor.fontFamily": "'Fira Code', 'Cascadia Code', Consolas, monospace",
  "editor.fontWeight": "500",
  "editor.fontSize": 15,
  "editor.lineHeight": 1.6,          // more room between lines = less crowding
  "editor.letterSpacing": 0.3,

  "editor.cursorBlinking": "solid",  // a blinking cursor keeps pulling your eye
  "editor.minimap.enabled": false,   // less visual noise at the edge
  "editor.renderLineHighlight": "line",
  "editor.smoothScrolling": true,
  "workbench.list.smoothScrolling": true,
  "terminal.integrated.fontSize": 14,
  "terminal.integrated.lineHeight": 1.3
}
```

[Fira Code](https://github.com/tonsky/FiraCode/releases) is free. On a work machine where you can't install fonts, Cascadia Code ships with Windows Terminal.

Outside the editor:
- Match screen brightness to the room. A screen brighter than its surroundings is the biggest strain driver.
- Use the 20-20-20 rule: every 20 minutes, look 20 feet away for 20 seconds.
- Blink on purpose. Screen work cuts your blink rate by about half.

## Eye test (calibration)

Open [the eye test](https://bitsandbeakers.github.io/vscode-soft-comfort/calibrate.html) on the monitor you code on, at your normal distance and lighting. It works like an optician's test: two blind options per question, pick the one that's clearer and calmer, about 3 minutes. At the end it gives one short line like:

```
SC1 f=fira w=500 s=15 lh=1.6 wm=40 L=93,25,45 D=18,79,50
```

Rebuild the themes and `settings.json` from it:

```
node build/generate.js "SC1 f=fira w=500 s=15 lh=1.6 wm=40 L=93,25,45 D=18,79,50"
```

## Tuning

Both themes are derived from `build/calibration.json` by `build/palette.js` (shared with the eye test). Every syntax colour is pushed until it clears 5:1 contrast (5.5:1 on dark), comments 4.5:1. Run `node build/generate.js` to rebuild `themes/` and print each colour's contrast.

## License

MIT
