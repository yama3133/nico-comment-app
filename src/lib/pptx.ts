import JSZip from "jszip";
import type { PptxInfo } from "./types";

/**
 * ブラウザ上でpptx(zip)を解析し、スライド枚数とスライドサイズ(EMU)を返す。
 * ファイルはサーバーに送らずローカルで読むだけ。
 */
export async function parsePptx(file: File): Promise<PptxInfo> {
  const zip = await JSZip.loadAsync(file);

  // ppt/slides/slideN.xml の数を数える（_rels配下は除外）
  const slideRe = /^ppt\/slides\/slide(\d+)\.xml$/;
  let slideCount = 0;
  zip.forEach((path) => {
    if (slideRe.test(path)) slideCount += 1;
  });

  if (slideCount === 0) {
    throw new Error(
      "スライドが見つかりません。PowerPoint形式(.pptx)のファイルを選んでください。",
    );
  }

  // presentation.xml から <p:sldSz cx=".." cy=".."/> を取得
  const presXml = await zip.file("ppt/presentation.xml")?.async("string");
  let widthEmu = 12192000; // 16:9 デフォルト
  let heightEmu = 6858000;
  if (presXml) {
    const m = presXml.match(/<p:sldSz[^>]*cx="(\d+)"[^>]*cy="(\d+)"/);
    if (m) {
      widthEmu = parseInt(m[1], 10);
      heightEmu = parseInt(m[2], 10);
    }
  }

  return { slideCount, widthEmu, heightEmu };
}

/**
 * "1,3,5-7" のような指定を1始まりのスライド番号配列に変換。
 * total を超える/0以下は除外。
 */
export function parseSlideSpec(spec: string, total: number): number[] {
  const out = new Set<number>();
  for (const part of spec.split(",")) {
    const p = part.trim();
    if (!p) continue;
    if (p.includes("-")) {
      const [a, b] = p.split("-");
      const lo = parseInt(a, 10);
      const hi = parseInt(b, 10);
      if (!isNaN(lo) && !isNaN(hi)) {
        for (let n = lo; n <= hi; n++) out.add(n);
      }
    } else {
      const n = parseInt(p, 10);
      if (!isNaN(n)) out.add(n);
    }
  }
  return [...out].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
}
