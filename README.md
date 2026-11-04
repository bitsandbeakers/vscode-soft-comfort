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
  "editor.fontFamily": "'JetBrains Mono', 'Cascadia Code', Consolas, monospace",
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

[JetBrains Mono](https://www.jetbrains.com/lp/mono/) is free. On a work machine where you can't install fonts, Cascadia Code ships with Windows Terminal.

Outside the editor:
- Match screen brightness to the room. A screen brighter than its surroundings is the biggest strain driver.
- Use the 20-20-20 rule: every 20 minutes, look 20 feet away for 20 seconds.
- Blink on purpose. Screen work cuts your blink rate by about half.

## Palette

| Role | Dark | Contrast | Light | Contrast |
| --- | --- | --- | --- | --- |
| Background | `#2b2c30` | — | `#f3f0e8` | — |
| Text | `#cfccc4` | 8.7 | `#45423c` | 8.8 |
| Comments | `#959285` | 4.5 | `#736e62` | 4.5 |
| Keywords | `#eb9bb4` | 6.6 | `#a83e66` | 5.2 |
| Strings | `#d8cf8f` | 8.8 | `#7a6514` | 5.0 |
| Functions | `#b3cf84` | 8.1 | `#4f7024` | 5.0 |
| Numbers | `#b9a0e6` | 6.1 | `#6c4fb0` | 5.5 |
| Types | `#8cc8d4` | 7.5 | `#22707e` | 5.0 |
| Parameters | `#e0a477` | 6.5 | `#9a5320` | 5.1 |

## Tuning

Both themes are generated from one palette each in `build/generate.js`. Change a colour there, run `node build/generate.js`, and it rewrites `themes/` and prints every colour's contrast.

## License

MIT
