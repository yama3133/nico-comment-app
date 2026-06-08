---
title: スライドにニコニコ動画風の流れるコメントを乗せるWebアプリを作った（PowerPoint対応・OIDCキーレス）
published: false
tags: nextjs, aws, lambda,個人開発
cover_image: https://raw.githubusercontent.com/yama3133/nico-comment-app/main/docs/thumb-ja.png
---

LTスライドの上を、ニコニコ動画みたいにコメントが流れたら盛り上がる ── そんな思いつきから、既存の `.pptx` にコメントを乗せるWebアプリを作りました。

- 本番: https://nico-comment-app.vercel.app
- ソース: https://github.com/yama3133/nico-comment-app

![メイン画面](https://raw.githubusercontent.com/yama3133/nico-comment-app/main/docs/main-ja.png)

## 何ができるか

1. `.pptx` をアップロード
2. コメントを流すスライドを番号で指定（`all` / `1,3,5-7`）
3. コメントを色付きで入力、流れる速さなどを調整
4. 「生成」を押すと、コメント入りの `.pptx` がダウンロードできる

PowerPoint / Keynote のスライドショーで再生すると、コメントが右から左へ流れます。

## 最初の難関：PowerPointでアニメをどう実現するか

最初はPowerPointの**ネイティブのアニメーション（モーションパス）**で実現しようとしました。テキストボックスを右から左へ動かすXMLを `python-pptx` で直接書き込む方法です。

しかしこれは**3回続けて失敗**しました。

- 1回目：全コメントが中央に重なって表示されただけ（初期位置の設定ミス）
- 2回目：スライドショーで何も流れずフリーズ
- 3回目：PowerPointが「コンテンツに問題があります」と表示し、**修復＝アニメ部分を削除**

原因は、手書きしたアニメーションXMLがPowerPointのスキーマに合っていなかったこと。そして何より、**自分の環境ではアニメの再生を検証できない**まま渡していたことでした。検証できないものを「動くはず」で出してはいけない、という当たり前の教訓です。

## 解決策：透過アニメGIFを重ねる

方針を変えて、**コメントが流れる透過アニメGIFを生成し、スライドの上に全面で重ねる**ことにしました。

- PowerPoint / Keynote は、スライドショー時にアニメGIFを**自動再生**する（標準機能）
- GIFなら**自分でフレームを抽出して動作確認できる**（検証できる）
- アニメーションXMLのスキーマ問題から解放される

GIFの生成は Pillow で、1フレームずつコメントを描画していくだけです。

```python
for f in range(n_frames):
    t = f / fps
    img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    for it in items:
        x = width - speed * (t - it["start"])  # 右→左へ
        d.text((x, it["y"]), it["text"], font=font,
               fill=it["color"], stroke_width=stroke, stroke_fill=(0,0,0,255))
    # 透過パレット化してフレーム追加
```

あとは `python-pptx` の `add_picture` で、各スライドの全面にGIFを置くだけ。pptxへの変更は「Content_Types へのGIF登録」「media にGIF追加」「rels に関連付け」「slideXML に `<p:pic>` 追加」の4箇所だけと分かったので、ブラウザでもサーバーでも再現できます。

## Webアプリ化と構成

CLIツールをWebアプリにするにあたり、こんな構成にしました。

![構成図](https://raw.githubusercontent.com/yama3133/nico-comment-app/main/docs/arch-ja.png)

- **フロント（Next.js / Vercel）**：pptxの解析（JSZip）とライブプレビュー（Canvas）はブラウザ内で完結。スライドの中身を外部に送らずにプレビューできる
- **バックエンド（AWS Lambda・東京）**：重いGIF生成は Pillow + python-pptx のコンテナLambdaで。日本語フォントは Noto Sans JP を同梱
- **ストレージ（S3）**：アップロードは署名付きPUTで直接S3へ。Vercel/Lambdaのペイロード制限を回避し、大きめのpptxにも対応。入出力は24時間で自動削除

## キーレス：Vercel OIDC Federation

当初は Lambda Function URL を公開してフロントから直接叩く予定でしたが、利用環境のガードレールで**公開アクセスがブロック**されていました（`403 Forbidden`）。

そこで **Vercel OIDC Federation** に切り替えました。Vercelの関数に発行されるOIDCトークンで、AWSのIAMロールを `AssumeRoleWithWebIdentity` し、短命の認証情報でLambdaを呼びます。**長期的なアクセスキーをどこにも保存しない**のが利点です。

```ts
import { awsCredentialsProvider } from "@vercel/oidc-aws-credentials-provider";

const lambda = new LambdaClient({
  region: "ap-northeast-1",
  credentials: awsCredentialsProvider({ roleArn: process.env.AWS_ROLE_ARN }),
});
```

AWS側には、Vercelの発行者URL（`https://oidc.vercel.com/<team>`）をOIDCプロバイダとして登録し、IAMロールの信頼ポリシーで「特定プロジェクトの本番環境」だけに絞ります。

## 権利への配慮

ニコニコ動画の「コメントが動画上を流れる機能（コメント配信システム）」については、運営会社が特許を保有しているとされています。

本ツールがしているのは、**スライドにあらかじめ用意したコメントを演出として流す**ことであり、各コメントは透過GIFとしてスライドに埋め込まれ、**ネットワークを介さずローカルで完結**します。「不特定多数がネット経由で投稿し、サーバーを経由してリアルタイムに同期して流れる配信システム」とは構成が異なります。

ただし用途によって判断は変わるため、商用・配信用途では各自で権利関係を確認すべきですし、**生配信などでリアルタイムに届いたコメントを同期表示する用途は想定していません**。アプリ内にもこの注記ページを置いています。

## まとめ

- PowerPointでアニメを「確実に」動かすなら、ネイティブアニメより**アニメGIFを重ねる**方が堅実だった
- 「自分で検証できる方式」を選ぶのが結局いちばん速い
- Vercel OIDCで**キーレス**にAWSへつなげるのは、個人開発でも嬉しい

触ってみてください → https://nico-comment-app.vercel.app
