"use client";

import { useState } from "react";
import Preview from "@/components/Preview";
import CommentEditor from "@/components/CommentEditor";
import { parsePptx, parseSlideSpec } from "@/lib/pptx";
import { processPptx, type ProgressKey } from "@/lib/api";
import { pickColor } from "@/lib/palette";
import { useI18n } from "@/lib/i18n";
import {
  type CommentItem,
  type PptxInfo,
  type FlowSettings,
  DEFAULT_SETTINGS,
} from "@/lib/types";

const SAMPLE = ["888", "キタ━━━!!", "わかる", "草", "天才", "神LT"];

export default function Home() {
  const { t, lang } = useI18n();
  const [file, setFile] = useState<File | null>(null);
  const [info, setInfo] = useState<PptxInfo | null>(null);
  const [slideSpec, setSlideSpec] = useState("all");
  const [comments, setComments] = useState<CommentItem[]>(
    SAMPLE.map((text, i) => ({
      id: Math.random().toString(36).slice(2, 10),
      text,
      color: pickColor(i),
    })),
  );
  const [settings, setSettings] = useState<FlowSettings>(DEFAULT_SETTINGS);
  const [parseError, setParseError] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<ProgressKey | "">("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [genError, setGenError] = useState("");

  async function onFile(f: File | undefined) {
    if (!f) return;
    setParseError("");
    setDownloadUrl("");
    setGenError("");
    if (!f.name.toLowerCase().endsWith(".pptx")) {
      setParseError(t("errNotPptx"));
      return;
    }
    try {
      const i = await parsePptx(f);
      setFile(f);
      setInfo(i);
    } catch (e) {
      setParseError(e instanceof Error ? e.message : String(e));
    }
  }

  const targetSlides =
    info && slideSpec.trim().toLowerCase() === "all"
      ? Array.from({ length: info.slideCount }, (_, i) => i + 1)
      : info
        ? parseSlideSpec(slideSpec, info.slideCount)
        : [];

  async function onGenerate() {
    if (!file || !info) return;
    const validComments = comments.filter((c) => c.text.trim() !== "");
    if (validComments.length === 0) {
      setGenError(t("errNoComment"));
      return;
    }
    if (targetSlides.length === 0) {
      setGenError(t("errNoSlide"));
      return;
    }
    setBusy(true);
    setGenError("");
    setDownloadUrl("");
    try {
      const res = await processPptx({
        file,
        slides: targetSlides,
        comments: validComments.map((c) => ({ text: c.text, color: c.color })),
        settings,
        onProgress: setProgress,
      });
      setDownloadUrl(res.downloadUrl);
    } catch (e) {
      setGenError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-8 text-white">
      <header className="mb-8">
        <h1 className="text-3xl font-black tracking-tight">
          {lang === "ja" ? (
            <>
              スライド<span className="text-pink-400">コメント</span>
              ジェネレーター
            </>
          ) : (
            <>
              Slide <span className="text-pink-400">Comment</span> Generator
            </>
          )}
        </h1>
        <p className="mt-2 text-sm text-white/60">{t("subtitle")}</p>
        <p className="mt-1 text-xs text-amber-300/80">{t("constraint")}</p>
      </header>

      {/* STEP 1: アップロード */}
      <section className="mb-6">
        <h2 className="mb-2 text-sm font-bold text-white/80">{t("step1")}</h2>
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/20 bg-white/5 px-6 py-10 text-center hover:border-pink-400/60">
          <input
            type="file"
            accept=".pptx"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
          <span className="text-sm text-white/70">
            {file ? file.name : t("uploadCta")}
          </span>
          {info && (
            <span className="mt-1 text-xs text-white/50">
              {info.slideCount}
              {t("slidesUnit")} /{" "}
              {Math.round((info.widthEmu / 914400) * 10) / 10}×
              {Math.round((info.heightEmu / 914400) * 10) / 10}
              {t("inch")}
            </span>
          )}
        </label>
        {parseError && <p className="mt-2 text-sm text-red-400">{parseError}</p>}
      </section>

      {info && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* STEP 2-4: 設定 */}
          <div className="space-y-6">
            <section>
              <h2 className="mb-2 text-sm font-bold text-white/80">
                {t("step2")}
              </h2>
              <input
                type="text"
                value={slideSpec}
                onChange={(e) => setSlideSpec(e.target.value)}
                placeholder="all / 1,3,5-7"
                className="w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm outline-none focus:border-pink-400"
              />
              <p className="mt-1 text-xs text-white/50">
                {t("target")}
                {targetSlides.length > 0 ? targetSlides.join(", ") : t("none")}
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-sm font-bold text-white/80">
                {t("step3")}
              </h2>
              <CommentEditor comments={comments} onChange={setComments} />
            </section>

            <section>
              <h2 className="mb-2 text-sm font-bold text-white/80">
                {t("step4")}
              </h2>
              <div className="space-y-3 text-sm">
                <Slider
                  label={t("speed")}
                  value={settings.speed}
                  min={80}
                  max={500}
                  step={10}
                  unit={t("speedUnit")}
                  onChange={(v) => setSettings({ ...settings, speed: v })}
                />
                <Slider
                  label={t("interval")}
                  value={settings.interval}
                  min={0.1}
                  max={1.5}
                  step={0.05}
                  unit={t("secUnit")}
                  onChange={(v) => setSettings({ ...settings, interval: v })}
                />
                <Slider
                  label={t("rows")}
                  value={settings.rows}
                  min={3}
                  max={10}
                  step={1}
                  unit={t("rowsUnit")}
                  onChange={(v) => setSettings({ ...settings, rows: v })}
                />
                <Slider
                  label={t("fontSize")}
                  value={settings.fontSize}
                  min={16}
                  max={48}
                  step={1}
                  unit={t("pxUnit")}
                  onChange={(v) => setSettings({ ...settings, fontSize: v })}
                />
              </div>
            </section>
          </div>

          {/* プレビュー＋生成 */}
          <div>
            <section className="md:sticky md:top-6">
              <h2 className="mb-2 text-sm font-bold text-white/80">
                {t("preview")}
              </h2>
              <Preview comments={comments} settings={settings} />

              <button
                onClick={onGenerate}
                disabled={busy}
                className="mt-4 w-full rounded-lg bg-pink-500 px-4 py-3 font-bold text-white hover:bg-pink-400 disabled:opacity-50"
              >
                {busy
                  ? `${t("processing")}${progress ? t(progress) : ""}`
                  : t("generate")}
              </button>

              {genError && <p className="mt-2 text-sm text-red-400">{genError}</p>}
              {downloadUrl && (
                <a
                  href={downloadUrl}
                  className="mt-3 block rounded-lg bg-emerald-500 px-4 py-3 text-center font-bold text-white hover:bg-emerald-400"
                >
                  {t("download")}
                </a>
              )}
            </section>
          </div>
        </div>
      )}

      <footer className="mt-12 space-y-2 border-t border-white/10 pt-4 text-xs text-white/40">
        <p>{t("footerDelete")}</p>
        <p>
          <a href="/notice" className="text-pink-400/80 hover:underline">
            {t("noticeLink")}
          </a>
          {t("footerNotice")}
        </p>
      </footer>
    </main>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-white/70">
        <span>{label}</span>
        <span className="tabular-nums text-white/90">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-pink-400"
      />
    </div>
  );
}
