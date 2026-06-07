// アプリ全体で使う型定義

/** 1件のコメント */
export interface CommentItem {
  id: string;
  text: string;
  /** 16進カラー（#なし6桁、例 "FFFFFF"） */
  color: string;
}

/** 流れ方の設定 */
export interface FlowSettings {
  /** 流れる速さ px/秒 */
  speed: number;
  /** コメント出現間隔 秒 */
  interval: number;
  /** コメント行数（レーン数） */
  rows: number;
  /** 文字サイズ px（960x540基準） */
  fontSize: number;
}

/** pptx解析結果 */
export interface PptxInfo {
  slideCount: number;
  widthEmu: number;
  heightEmu: number;
}

/** Lambdaへ送る生成リクエスト */
export interface GenerateRequest {
  /** S3にアップ済み入力pptxのキー */
  inputKey: string;
  /** 対象スライド（1始まり） */
  slides: number[];
  comments: { text: string; color: string }[];
  settings: FlowSettings;
}

export const DEFAULT_SETTINGS: FlowSettings = {
  speed: 220,
  interval: 0.42,
  rows: 6,
  fontSize: 30,
};
