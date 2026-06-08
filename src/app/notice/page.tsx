"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export default function NoticePage() {
  const { lang } = useI18n();
  const ja = lang === "ja";

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-10 text-white">
      <Link href="/" className="text-sm text-pink-400 hover:underline">
        {ja ? "← トップに戻る" : "← Back to top"}
      </Link>

      <h1 className="mt-4 text-2xl font-black">
        {ja ? "コメント機能と権利について" : "About the comment feature & rights"}
      </h1>

      <div className="mt-6 space-y-6 text-sm leading-relaxed text-white/85">
        <section>
          <h2 className="mb-2 text-base font-bold text-white">
            {ja ? "背景となる事実" : "Background facts"}
          </h2>
          <p>
            {ja
              ? "ニコニコ動画の「動画上にコメントが流れる機能（コメント配信システム）」については、運営会社であるドワンゴが特許（特許第4695064号 など）を保有しているとされています。"
              : "Niconico's feature that scrolls comments over a video (the “comment delivery system”) is said to be patented by its operator, Dwango (e.g., Japanese Patent No. 4695064)."}
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-bold text-white">
            {ja ? "本ツールがしていること" : "What this tool does"}
          </h2>
          <p>
            {ja
              ? "本ツールが生成するのは、スライド上にあらかじめ用意したコメントを「演出」として流す pptx です。各コメントは透過アニメGIFとしてスライドに埋め込まれ、ネットワークを介さず、その場（ローカル）で完結します。"
              : "This tool generates a pptx that scrolls pre-written comments as a visual effect. Each comment is embedded as a transparent animated GIF and plays locally, without going through any network."}
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-bold text-white">
            {ja
              ? "「配信システム」との違い"
              : "Difference from a “delivery system”"}
          </h2>
          <p className="mb-2">
            {ja
              ? "特許の核心とされるのは、おおむね次のような構成です。"
              : "The core of the patent is roughly the following configuration:"}
          </p>
          <blockquote className="rounded-md border-l-2 border-pink-400/60 bg-white/5 px-4 py-2 text-white/75">
            {ja
              ? "不特定多数の視聴者がネットを介してコメントを投稿し、それがサーバーを経由して他の視聴者の画面上にリアルタイムで同期して流れる配信システム"
              : "an unspecified number of viewers post comments over the internet, which are synchronized in real time via a server and scroll over other viewers' screens."}
          </blockquote>
          <p className="mt-2">
            {ja
              ? "本ツールはこれに該当する「ネット経由・サーバー同期・リアルタイム」の要素を持ちません。あくまでスライドに静的な演出を付与するものです。"
              : "This tool has none of those “internet-relayed, server-synchronized, real-time” elements. It merely adds a static visual effect to slides."}
          </p>
        </section>

        <section className="rounded-lg border border-amber-300/30 bg-amber-300/5 p-4">
          <h2 className="mb-2 text-base font-bold text-amber-200">
            {ja ? "ご利用上の注意（免責）" : "Usage notes (disclaimer)"}
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              {ja
                ? "権利の最終的な判断は、利用の目的・態様によって異なります。"
                : "The ultimate legal assessment depends on the purpose and manner of use."}
            </li>
            <li>
              {ja
                ? "生配信などで、リアルタイムに届いたコメントを画面に同期表示する用途は、配信システムの特許範囲に触れる可能性があります。本ツールはそうした用途を想定していません。"
                : "Displaying comments that arrive in real time during a live stream may fall within the scope of the delivery-system patent. This tool does not target such use."}
            </li>
            <li>
              {ja
                ? "商用利用・配信用途で利用する場合は、各自の責任で権利関係をご確認ください。"
                : "For commercial or streaming use, please verify the rights situation at your own responsibility."}
            </li>
            <li>
              {ja
                ? "本ツールおよび作者は、本ツールの利用により生じたいかなる問題についても責任を負いません。"
                : "The tool and its author accept no liability for any issues arising from its use."}
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-base font-bold text-white">
            {ja ? "参考" : "Reference"}
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <a
                href="https://www.j-platpat.inpit.go.jp/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-400 hover:underline"
              >
                J-PlatPat
              </a>
              {ja
                ? "（特許情報プラットフォーム）｜「特許第4695064号」等で検索できます"
                : " (Japan's patent platform) — search “特許第4695064号”"}
            </li>
          </ul>
        </section>
      </div>

      <Link
        href="/"
        className="mt-8 inline-block text-sm text-pink-400 hover:underline"
      >
        {ja ? "← トップに戻る" : "← Back to top"}
      </Link>
    </main>
  );
}
