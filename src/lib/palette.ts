// ニコニコ動画風の定番カラーパレット（#なし6桁）
export const PALETTE: { name: string; hex: string }[] = [
  { name: "白", hex: "FFFFFF" },
  { name: "黄", hex: "FFFF00" },
  { name: "赤", hex: "FF6666" },
  { name: "ピンク", hex: "FF88FF" },
  { name: "シアン", hex: "88FFFF" },
  { name: "緑", hex: "88FF88" },
  { name: "オレンジ", hex: "FFAA44" },
  { name: "紫", hex: "CC99FF" },
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
