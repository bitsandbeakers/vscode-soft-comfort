# Soft Comfort Dark

A dark VS Code theme built for long sessions and tired eyes.

- **No pure black, no pure white.** Background `#22252b` (dim warm grey), text `#c4c8cf` (soft off-white). Hard black/white edges cause halation, a glow that tires your eyes, especially with astigmatism.
- **Contrast in a comfort band.** Body text is about 9:1, enough to read easily without glare. Syntax colours sit at 6–8.5:1, and comments at about 4.5:1 so they recede.
- **Muted pastels only.** Lavender keywords, sage strings, soft-blue functions, sand types, peach numbers. Nothing neon or saturated.
- **Quiet chrome.** The sidebar, tabs, status bar and panels are one step darker than the editor, with no borders, so your eye stays on the code.

## Install

**From a release (no marketplace needed, works on a locked-down work machine):**

1. Download `soft-comfort-dark-<version>.vsix` from [Releases](https://github.com/bitsandbeakers/vscode-soft-comfort/releases).
2. In VS Code: Extensions view → `...` menu → **Install from VSIX...** and pick the file.
   Or from a terminal: `code --install-extension soft-comfort-dark-1.0.0.vsix`
3. Ctrl+K Ctrl+T → **Soft Comfort Dark**.

**From source:** clone this repo into your extensions folder (`~/.vscode/extensions/soft-comfort-dark`) and reload VS Code.

## Recommended settings for eye strain

The theme is only half of it. These settings take the rest of the strain off:

```jsonc
{
  "workbench.colorTheme": "Soft Comfort Dark",
  "editor.fontSize": 15,
  "editor.lineHeight": 1.6,            // more space between lines = less crowding
  "editor.letterSpacing": 0.3,
  "editor.fontWeight": "400",
  "editor.cursorBlinking": "solid",    // a blinking cursor keeps pulling your eye
  "editor.cursorStyle": "line",
  "editor.renderLineHighlight": "line",
  "editor.minimap.enabled": false,     // less visual noise at the edge
  "editor.guides.bracketPairs": false,
  "editor.bracketPairColorization.enabled": true,
  "editor.smoothScrolling": true,
  "workbench.list.smoothScrolling": true,
  "terminal.integrated.fontSize": 14,
  "terminal.integrated.lineHeight": 1.3
}
```

Good fonts for low strain (all free): **JetBrains Mono**, **IBM Plex Mono**, **Fira Code**, **Cascadia Code**.

Outside the editor: keep the room lit (a dark room makes the screen harsher), lower screen brightness to match the room, and use the 20-20-20 rule (every 20 min, look 20 ft away for 20 s).

## Palette

| Role | Colour | Contrast vs background |
| --- | --- | --- |
| Background | `#22252b` | — |
| Text | `#c4c8cf` | 9.2 |
| Comments | `#858c97` | 4.5 |
| Keywords | `#c3a2d4` | 6.9 |
| Strings | `#a8c38f` | 8.0 |
| Functions | `#8fb3d6` | 7.0 |
| Types | `#d6bd8b` | 8.4 |
| Numbers / constants | `#dda27e` | 7.0 |
| Properties | `#9cc2c2` | 8.0 |
| Errors | `#de8b8b` | 6.0 |

## License

MIT
