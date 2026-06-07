import type { GenerateRequest } from "./types";

// 同一オリジンのAPI Route経由でLambdaを呼ぶ（Function URLは公開しない）
const API = "/api/lambda";

interface PresignResponse {
  uploadUrl: string;
  inputKey: string;
}

interface GenerateResponse {
  downloadUrl: string;
  outputKey: string;
}

async function callLambda<T>(action: string, payload: unknown): Promise<T> {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, payload }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || `エラー (${res.status})`);
  }
  return data as T;
}

/** S3へpptxを直接PUT */
async function putToS3(url: string, file: File): Promise<void> {
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    },
    body: file,
  });
  if (!res.ok) throw new Error(`アップロードに失敗 (${res.status})`);
}

export interface ProcessParams {
  file: File;
  slides: number[];
  comments: { text: string; color: string }[];
  settings: GenerateRequest["settings"];
  onProgress?: (msg: string) => void;
}

/** アップロード→生成→DL URL取得 を通しで実行 */
export async function processPptx(
  p: ProcessParams,
): Promise<{ downloadUrl: string }> {
  p.onProgress?.("アップロード用URLを取得中…");
  const { uploadUrl, inputKey } = await callLambda<PresignResponse>("presign", {
    filename: p.file.name,
  });

  p.onProgress?.("スライドをアップロード中…");
  await putToS3(uploadUrl, p.file);

  p.onProgress?.("コメントGIFを生成・注入中…");
  const { downloadUrl } = await callLambda<GenerateResponse>("generate", {
    inputKey,
    slides: p.slides,
    comments: p.comments,
    settings: p.settings,
  });

  p.onProgress?.("完了");
  return { downloadUrl };
}
