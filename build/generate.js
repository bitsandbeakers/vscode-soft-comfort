// Generates both theme files from one palette per variant, and prints each
// syntax colour's contrast against its background so tuning stays honest.
// Run: node build/generate.js
const fs = require('fs');
const path = require('path');

const palettes = {
  dark: {
    name: 'Soft Comfort Dark',
    type: 'dark',
    file: 'soft-comfort-dark-color-theme.json',
    // Lifted, warm charcoal instead of near-black: a brighter background keeps
    // pupils smaller, which cuts the glow/halo around light text.
    bg: '#2b2c30', bgDeep: '#26272a', bgRaised: '#323338', line: '#313237',
    selection: '#45464d', border: '#38393f',
    text: '#cfccc4', textUi: '#bdbab2', muted: '#8f8c82', faint: '#64625c',
    comment: '#959285', punct: '#a8a59c',
    // Soft Monokai: same colour roles, saturation pulled down.
    keyword: '#eb9bb4', string: '#d8cf8f', func: '#b3cf84', number: '#b9a0e6',
    type: '#8cc8d4', param: '#e0a477',
    error: '#e8928f', warning: '#dcbc78', info: '#8cc8d4',
    added: '#93ad6c', modified: '#7fa6c4', deleted: '#c27b78',
    accent: '#d8cf8f', button: '#5c5a52', buttonText: '#efece4',
  },
  light: {
    name: 'Soft Comfort Light',
    type: 'light',
    file: 'soft-comfort-light-color-theme.json',
    // Warm paper, never pure white: for bright rooms, where a dark theme
    // makes your pupils open wide and text blurs.
    bg: '#f3f0e8', bgDeep: '#ebe7dd', bgRaised: '#f8f6f0', line: '#ebe7de',
    selection: '#d9d3c4', border: '#ddd8cc',
    text: '#45423c', textUi: '#4f4c45', muted: '#6f6b61', faint: '#a29d91',
    comment: '#736e62', punct: '#5f5b52',
    keyword: '#a83e66', string: '#7a6514', func: '#4f7024', number: '#6c4fb0',
    type: '#22707e', param: '#9a5320',
    error: '#b0403c', warning: '#8a6410', info: '#22707e',
    added: '#6f9442', modified: '#4f7fa6', deleted: '#b85c58',
    accent: '#9a5320', button: '#6a6558', buttonText: '#f8f6f0',
  },
};

const lum = h => {
  const c = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255)
    .map(v => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const contrast = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

function theme(p) {
  const dark = p.type === 'dark';
  const colors = {
    focusBorder: p.selection,
    foreground: p.textUi,
    descriptionForeground: p.muted,
    errorForeground: p.error,
    'icon.foreground': p.muted,
    'widget.shadow': dark ? '#00000040' : '#00000014',
    'selection.background': p.selection,
    'textLink.foreground': p.type,
    'textLink.activeForeground': p.type,

    'editor.background': p.bg,
    'editor.foreground': p.text,
    'editorCursor.foreground': p.accent,
    'editor.lineHighlightBackground': p.line,
    'editor.lineHighlightBorder': '#00000000',
    'editor.selectionBackground': p.selection + 'b0',
    'editor.inactiveSelectionBackground': p.selection + '70',
    'editor.selectionHighlightBackground': p.selection + '60',
    'editor.wordHighlightBackground': p.selection + '55',
    'editor.wordHighlightStrongBackground': p.selection + '80',
    'editor.findMatchBackground': p.warning + '55',
    'editor.findMatchHighlightBackground': p.warning + '30',
    'editor.findRangeHighlightBackground': p.selection + '40',
    'editor.rangeHighlightBackground': p.selection + '40',
    'editorLineNumber.foreground': p.faint,
    'editorLineNumber.activeForeground': p.muted,
    'editorIndentGuide.background1': p.border,
    'editorIndentGuide.activeBackground1': p.faint,
    'editorWhitespace.foreground': p.border,
    'editorRuler.foreground': p.border,
    'editorBracketMatch.background': p.selection + '80',
    'editorBracketMatch.border': '#00000000',
    'editorBracketHighlight.foreground1': p.punct,
    'editorBracketHighlight.foreground2': p.number,
    'editorBracketHighlight.foreground3': p.type,
    'editorBracketHighlight.unexpectedBracket.foreground': p.error,
    'editorError.foreground': p.error,
    'editorWarning.foreground': p.warning,
    'editorInfo.foreground': p.info,
    'editorHint.foreground': p.info,
    'editorGutter.addedBackground': p.added,
    'editorGutter.modifiedBackground': p.modified,
    'editorGutter.deletedBackground': p.deleted,
    'editorOverviewRuler.border': '#00000000',
    'editorWidget.background': p.bgRaised,
    'editorWidget.border': p.border,
    'editorSuggestWidget.background': p.bgRaised,
    'editorSuggestWidget.border': p.border,
    'editorSuggestWidget.selectedBackground': p.selection,
    'editorSuggestWidget.highlightForeground': p.accent,
    'editorHoverWidget.background': p.bgRaised,
    'editorHoverWidget.border': p.border,
    'editorGroupHeader.tabsBackground': p.bgDeep,
    'editorGroup.border': p.border,
    'diffEditor.insertedTextBackground': p.added + '26',
    'diffEditor.removedTextBackground': p.deleted + '26',

    'activityBar.background': p.bgDeep,
    'activityBar.foreground': p.textUi,
    'activityBar.inactiveForeground': p.faint,
    'activityBar.border': '#00000000',
    'activityBarBadge.background': p.button,
    'activityBarBadge.foreground': p.buttonText,
    'sideBar.background': p.bgDeep,
    'sideBar.foreground': p.textUi,
    'sideBar.border': '#00000000',
    'sideBarTitle.foreground': p.muted,
    'sideBarSectionHeader.background': p.bgDeep,
    'sideBarSectionHeader.foreground': p.muted,
    'list.activeSelectionBackground': p.selection,
    'list.activeSelectionForeground': p.text,
    'list.inactiveSelectionBackground': p.line,
    'list.hoverBackground': p.line,
    'list.focusOutline': '#00000000',
    'list.highlightForeground': p.accent,
    'list.errorForeground': p.error,
    'list.warningForeground': p.warning,
    'gitDecoration.modifiedResourceForeground': p.modified,
    'gitDecoration.untrackedResourceForeground': p.added,
    'gitDecoration.deletedResourceForeground': p.deleted,
    'gitDecoration.ignoredResourceForeground': p.faint,
    'gitDecoration.conflictingResourceForeground': p.warning,

    'tab.activeBackground': p.bg,
    'tab.activeForeground': p.text,
    'tab.inactiveBackground': p.bgDeep,
    'tab.inactiveForeground': p.muted,
    'tab.border': p.bgDeep,
    'tab.activeBorderTop': p.accent + '90',
    'tab.unfocusedActiveBorderTop': '#00000000',

    'titleBar.activeBackground': p.bgDeep,
    'titleBar.activeForeground': p.textUi,
    'titleBar.inactiveBackground': p.bgDeep,
    'titleBar.inactiveForeground': p.faint,
    'titleBar.border': '#00000000',
    'menu.background': p.bgRaised,
    'menu.foreground': p.textUi,
    'menu.selectionBackground': p.selection,

    'statusBar.background': p.bgDeep,
    'statusBar.foreground': p.muted,
    'statusBar.border': '#00000000',
    'statusBar.debuggingBackground': p.param + '40',
    'statusBar.debuggingForeground': p.text,
    'statusBar.noFolderBackground': p.bgDeep,
    'statusBarItem.remoteBackground': p.selection,
    'statusBarItem.remoteForeground': p.text,

    'panel.background': p.bgDeep,
    'panel.border': p.border,
    'panelTitle.activeForeground': p.text,
    'panelTitle.inactiveForeground': p.muted,
    'panelTitle.activeBorder': p.accent + '90',

    'terminal.background': p.bgDeep,
    'terminal.foreground': p.text,
    'terminalCursor.foreground': p.accent,
    'terminal.ansiBlack': dark ? p.bgRaised : p.text,
    'terminal.ansiRed': p.keyword,
    'terminal.ansiGreen': p.func,
    'terminal.ansiYellow': p.string,
    'terminal.ansiBlue': p.modified,
    'terminal.ansiMagenta': p.number,
    'terminal.ansiCyan': p.type,
    'terminal.ansiWhite': dark ? p.textUi : p.faint,
    'terminal.ansiBrightBlack': p.faint,
    'terminal.ansiBrightRed': p.error,
    'terminal.ansiBrightGreen': p.added,
    'terminal.ansiBrightYellow': p.warning,
    'terminal.ansiBrightBlue': p.type,
    'terminal.ansiBrightMagenta': p.keyword,
    'terminal.ansiBrightCyan': p.info,
    'terminal.ansiBrightWhite': dark ? p.text : p.muted,

    'input.background': p.bgRaised,
    'input.border': p.border,
    'input.foreground': p.text,
    'input.placeholderForeground': p.faint,
    'inputOption.activeBorder': p.accent,
    'dropdown.background': p.bgRaised,
    'dropdown.border': p.border,
    'button.background': p.button,
    'button.foreground': p.buttonText,
    'button.hoverBackground': p.muted,
    'button.secondaryBackground': p.selection,
    'button.secondaryForeground': p.text,
    'badge.background': p.selection,
    'badge.foreground': p.text,
    'progressBar.background': p.accent,
    'scrollbar.shadow': '#00000000',
    'scrollbarSlider.background': p.faint + '40',
    'scrollbarSlider.hoverBackground': p.faint + '70',
    'scrollbarSlider.activeBackground': p.faint + '90',
    'notifications.background': p.bgRaised,
    'notifications.border': p.border,
    'peekView.border': p.selection,
    'peekViewEditor.background': p.bgDeep,
    'peekViewResult.background': p.bgDeep,
    'peekViewTitle.background': p.bgRaised,
    'breadcrumb.foreground': p.muted,
    'breadcrumb.focusForeground': p.text,
    'minimap.background': p.bg,
    'minimapSlider.background': p.faint + '30',
  };

  const tok = (name, scope, foreground, fontStyle) =>
    ({ name, scope, settings: fontStyle ? { foreground, fontStyle } : { foreground } });

  const tokenColors = [
    tok('Comments', ['comment', 'punctuation.definition.comment', 'string.comment'], p.comment, 'italic'),
    tok('Keywords and storage', ['keyword', 'storage.type', 'storage.modifier', 'keyword.control', 'keyword.other.using', 'keyword.other.import'], p.keyword),
    tok('Operators', ['keyword.operator', 'keyword.operator.assignment', 'keyword.operator.arithmetic', 'keyword.operator.logical', 'keyword.operator.comparison'], p.keyword),
    tok('Word operators', ['keyword.operator.new', 'keyword.operator.expression', 'keyword.operator.logical.python', 'keyword.operator.word'], p.keyword),
    tok('Punctuation', ['punctuation', 'meta.brace', 'punctuation.separator', 'punctuation.terminator', 'punctuation.accessor'], p.punct),
    tok('Strings', ['string', 'string.quoted', 'string.template', 'punctuation.definition.string'], p.string),
    tok('String escapes and regex', ['constant.character.escape', 'string.regexp', 'constant.other.placeholder'], p.number),
    tok('Template expression', ['punctuation.definition.template-expression', 'punctuation.section.embedded'], p.keyword),
    tok('Numbers and constants', ['constant.numeric', 'constant.language', 'constant.character', 'constant.other', 'support.constant'], p.number),
    tok('Functions', ['entity.name.function', 'support.function', 'meta.function-call entity.name.function', 'variable.function'], p.func),
    tok('Types and classes', ['entity.name.type', 'entity.name.class', 'support.type', 'support.class', 'entity.other.inherited-class', 'storage.type.primitive', 'entity.name.namespace'], p.type),
    tok('Variables', ['variable', 'variable.other'], p.text),
    tok('Parameters', ['variable.parameter'], p.param, 'italic'),
    tok('Language variables', ['variable.language', 'variable.language.this', 'variable.language.self', 'variable.parameter.function.language.special'], p.param, 'italic'),
    tok('Properties and object keys', ['variable.other.property', 'variable.other.object.property', 'support.variable.property', 'meta.object-literal.key', 'support.type.property-name', 'entity.name.tag.yaml'], p.text),
    tok('Decorators and annotations', ['meta.decorator', 'entity.name.function.decorator', 'punctuation.decorator', 'storage.type.annotation'], p.func, 'italic'),
    tok('HTML/XML tags', ['entity.name.tag', 'punctuation.definition.tag'], p.keyword),
    tok('Tag attributes', ['entity.other.attribute-name'], p.func),
    tok('CSS selectors', ['entity.other.attribute-name.class.css', 'entity.other.attribute-name.id.css', 'entity.name.tag.css'], p.func),
    tok('CSS values and units', ['support.constant.property-value', 'keyword.other.unit', 'constant.other.color'], p.number),
    tok('Markdown headings', ['markup.heading', 'entity.name.section', 'punctuation.definition.heading'], p.func, 'bold'),
    tok('Markdown bold', ['markup.bold'], p.param, 'bold'),
    tok('Markdown italic', ['markup.italic'], p.number, 'italic'),
    tok('Markdown code', ['markup.inline.raw', 'markup.fenced_code.block', 'markup.raw'], p.string),
    tok('Markdown links', ['markup.underline.link', 'string.other.link', 'meta.link'], p.type),
    tok('Markdown quotes and lists', ['markup.quote', 'punctuation.definition.list.begin.markdown'], p.keyword),
    tok('Diff inserted', ['markup.inserted'], p.added),
    tok('Diff deleted', ['markup.deleted'], p.deleted),
    tok('Diff changed', ['markup.changed'], p.modified),
    tok('Invalid', ['invalid', 'invalid.illegal'], p.error),
    tok('JSON keys', ['support.type.property-name.json'], p.keyword),
  ];

  const semanticTokenColors = {
    namespace: p.type, class: p.type, interface: p.type, enum: p.type,
    typeParameter: p.type, type: p.type,
    function: p.func, method: p.func,
    property: p.text, enumMember: p.number,
    parameter: { foreground: p.param, italic: true },
    variable: p.text,
    'variable.readonly': p.number, 'variable.defaultLibrary': p.number,
    selfParameter: { foreground: p.param, italic: true },
    decorator: { foreground: p.func, italic: true },
  };

  return { name: p.name, type: p.type, semanticHighlighting: true, colors, tokenColors, semanticTokenColors };
}

for (const p of Object.values(palettes)) {
  const out = path.join(__dirname, '..', 'themes', p.file);
  fs.writeFileSync(out, JSON.stringify(theme(p), null, 2) + '\n');
  console.log(`${p.name} (${p.bg})`);
  for (const k of ['text', 'comment', 'keyword', 'string', 'func', 'number', 'type', 'param', 'punct']) {
    console.log(`  ${k.padEnd(8)} ${p[k]}  ${contrast(p[k], p.bg).toFixed(1)}:1`);
  }
}
