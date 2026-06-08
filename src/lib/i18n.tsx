"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Lang = "ja" | "en";

type Dict = Record<string, { ja: string; en: string }>;

// 全UI文言（フラットキー）
const DICT: Dict = {
  subtitle: {
    ja: "既存のスライドに、ニコニコ動画風に流れるコメントを乗せます。アップロード → スライド指定 → コメント入力で完成。",
    en: "Overlay scrolling comments (Niconico-style) on your existing slides. Upload → pick slides → type comments.",
  },
  constraint: {
    ja: "※ 流れるコメント（アニメGIF）を再生できるのは PowerPoint と Keynote です。Googleスライド/Canvaは静止画になります。",
    en: "* Animated comments (GIF) play only in PowerPoint and Keynote. Google Slides / Canva show a static image.",
  },
  step1: { ja: "1. スライドをアップロード（.pptx）", en: "1. Upload your slides (.pptx)" },
  uploadCta: { ja: "クリックして.pptxを選択", en: "Click to choose a .pptx" },
  slidesUnit: { ja: "枚", en: " slides" },
  inch: { ja: "インチ", en: " in" },
  errNotPptx: {
    ja: "PowerPoint形式(.pptx)を選んでください。",
    en: "Please choose a PowerPoint (.pptx) file.",
  },
  step2: { ja: "2. コメントを流すスライド", en: "2. Slides to add comments to" },
  target: { ja: "対象: ", en: "Target: " },
  none: { ja: "（なし）", en: "(none)" },
  step3: { ja: "3. コメント（色も指定可）", en: "3. Comments (color selectable)" },
  step4: { ja: "4. 流れ方の調整", en: "4. Flow settings" },
  speed: { ja: "スピード", en: "Speed" },
  speedUnit: { ja: "px/秒", en: "px/s" },
  interval: { ja: "出現間隔", en: "Interval" },
  secUnit: { ja: "秒", en: "s" },
  rows: { ja: "行数", en: "Rows" },
  rowsUnit: { ja: "行", en: "" },
  fontSize: { ja: "文字サイズ", en: "Font size" },
  pxUnit: { ja: "px", en: "px" },
  preview: { ja: "プレビュー（流れ方の確認）", en: "Preview (flow check)" },
  previewEmpty: {
    ja: "コメントを入力するとここで流れます",
    en: "Comments will scroll here",
  },
  generate: { ja: "コメント入りpptxを生成", en: "Generate pptx with comments" },
  processing: { ja: "処理中… ", en: "Processing… " },
  download: { ja: "⬇ 生成されたpptxをダウンロード", en: "⬇ Download the generated pptx" },
  errNoComment: {
    ja: "コメントを1件以上入力してください。",
    en: "Please enter at least one comment.",
  },
  errNoSlide: {
    ja: "対象スライドを指定してください。",
    en: "Please specify target slides.",
  },
  footerDelete: {
    ja: "スライドの中身はサーバーに一時保存され、24時間後に自動削除されます。",
    en: "Uploaded slides are stored temporarily and auto-deleted after 24 hours.",
  },
  noticeLink: {
    ja: "コメント機能と権利について",
    en: "About the comment feature & rights",
  },
  footerNotice: {
    ja: "（配信用途でのリアルタイム反映は想定していません）",
    en: " (Not intended for real-time streaming use)",
  },
  // CommentEditor
  addComment: { ja: "＋ コメントを追加", en: "+ Add comment" },
  bulkPaste: { ja: "まとめて貼り付け", en: "Bulk paste" },
  commentPlaceholder: { ja: "コメントを入力", en: "Enter a comment" },
  bulkPlaceholder: {
    ja: "1行1コメント\n例: 888\n例: 神LT|FF88FF（末尾に|色も可）",
    en: "One comment per line\ne.g. 888\ne.g. nice|FF88FF (optional |color)",
  },
  bulkHint: {
    ja: "入力すると上のリストに反映されます（既存は置き換え）",
    en: "This replaces the list above.",
  },
  paletteRef: { ja: "色パレットの参考", en: "Color palette reference" },
  remove: { ja: "削除", en: "Remove" },
  pickColor: { ja: "色を選ぶ", en: "Pick a color" },
  // progress
  pUploadUrl: { ja: "アップロード用URLを取得中…", en: "Getting upload URL…" },
  pUploading: { ja: "スライドをアップロード中…", en: "Uploading slides…" },
  pGenerating: {
    ja: "コメントGIFを生成・注入中…",
    en: "Generating & injecting comment GIF…",
  },
  pDone: { ja: "完了", en: "Done" },
  // colors
  cWhite: { ja: "白", en: "White" },
  cYellow: { ja: "黄", en: "Yellow" },
  cRed: { ja: "赤", en: "Red" },
  cPink: { ja: "ピンク", en: "Pink" },
  cCyan: { ja: "シアン", en: "Cyan" },
  cGreen: { ja: "緑", en: "Green" },
  cOrange: { ja: "オレンジ", en: "Orange" },
  cPurple: { ja: "紫", en: "Purple" },
};

interface I18nValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof DICT | string) => string;
}

const I18nContext = createContext<I18nValue>({
  lang: "ja",
  setLang: () => {},
  t: (k) => String(k),
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ja");

  useEffect(() => {
    const s = localStorage.getItem("lang");
    if (s === "ja" || s === "en") setLangState(s);
    else if (navigator.language && !navigator.language.startsWith("ja"))
      setLangState("en");
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("lang", l);
    } catch {}
  };

  const t = (key: string) => DICT[key]?.[lang] ?? key;

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => useContext(I18nContext);
