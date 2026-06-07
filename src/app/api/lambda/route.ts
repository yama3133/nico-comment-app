import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { awsCredentialsProvider } from "@vercel/oidc-aws-credentials-provider";

// generateはGIF生成を伴うため、関数の最大実行時間を延ばす
export const maxDuration = 60;

// リソースは東京固定。Vercelが自動設定するAWS_REGIONに汚染されないよう固定値にする
const REGION = "ap-northeast-1";
const ROLE_ARN = process.env.AWS_ROLE_ARN;
const FUNCTION_NAME = process.env.LAMBDA_FUNCTION_NAME || "nico-comment-app";

function lambdaClient(): LambdaClient {
  // Vercel上(process.env.VERCEL==="1")でROLE_ARNがあればOIDCでロールをAssume（キーレス）
  // OIDCトークンはx-vercel-oidc-tokenヘッダー/envからprovider内部が取得する
  if (ROLE_ARN && process.env.VERCEL) {
    return new LambdaClient({
      region: REGION,
      credentials: awsCredentialsProvider({ roleArn: ROLE_ARN }),
    });
  }
  // ローカル開発: 既定のクレデンシャルチェーン（aws login など）
  return new LambdaClient({ region: REGION });
}

export async function POST(req: Request) {
  let action: string;
  let payload: unknown;
  try {
    const j = await req.json();
    action = j.action;
    payload = j.payload;
  } catch {
    return Response.json({ error: "不正なリクエスト" }, { status: 400 });
  }

  if (action !== "presign" && action !== "generate") {
    return Response.json({ error: "未知のaction" }, { status: 400 });
  }

  // Lambda(Function URL形式)のイベントを組み立ててinvoke
  const event = {
    requestContext: { http: { method: "POST" } },
    queryStringParameters: { action },
    body: JSON.stringify(payload ?? {}),
  };

  try {
    const res = await lambdaClient().send(
      new InvokeCommand({
        FunctionName: FUNCTION_NAME,
        Payload: Buffer.from(JSON.stringify(event)),
      }),
    );
    if (res.FunctionError) {
      const detail = res.Payload
        ? Buffer.from(res.Payload).toString()
        : res.FunctionError;
      return Response.json(
        { error: `Lambda実行エラー: ${detail}` },
        { status: 502 },
      );
    }
    const parsed = JSON.parse(Buffer.from(res.Payload!).toString());
    // parsed = { statusCode, headers, body(文字列) }
    return new Response(parsed.body, {
      status: parsed.statusCode ?? 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return Response.json(
      { error: `呼び出しに失敗: ${msg}` },
      { status: 500 },
    );
  }
}
