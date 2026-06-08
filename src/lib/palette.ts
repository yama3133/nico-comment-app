// ニコニコ動画風の定番カラーパレット（#なし6桁）。nameKeyはi18n辞書のキー。
export const PALETTE: { nameKey: string; hex: string }[] = [
  { nameKey: "cWhite", hex: "FFFFFF" },
  { nameKey: "cYellow", hex: "FFFF00" },
  { nameKey: "cRed", hex: "FF6666" },
  { nameKey: "cPink", hex: "FF88FF" },
  { nameKey: "cCyan", hex: "88FFFF" },
  { nameKey: "cGreen", hex: "88FF88" },
  { nameKey: "cOrange", hex: "FFAA44" },
  { nameKey: "cPurple", hex: "CC99FF" },
];

/** パレットから順番に色を割り当てる */
export function pickColor(index: number): string {
  return PALETTE[index % PALETTE.length].hex;
}

/** "FFFFFF" -> "#FFFFFF" */
export function toCss(hex: string): string {
  return `#${hex.replace(/^#/, "")}`;
}

/** "#FFFFFF" -> "FFFFFF" */
export function fromCss(css: string): string {
  return css.replace(/^#/, "").toUpperCase();
}
