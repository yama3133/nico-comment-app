"use client";

import type { CommentItem } from "@/lib/types";
import { PALETTE, pickColor, toCss, fromCss } from "@/lib/palette";
import { useI18n } from "@/lib/i18n";

interface Props {
  comments: CommentItem[];
  onChange: (next: CommentItem[]) => void;
}

function newId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function CommentEditor({ comments, onChange }: Props) {
  const { t } = useI18n();

  const update = (id: string, patch: Partial<CommentItem>) =>
    onChange(comments.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  const remove = (id: string) =>
    onChange(comments.filter((c) => c.id !== id));

  const add = () =>
    onChange([
      ...comments,
      { id: newId(), text: "", color: pickColor(comments.length) },
    ]);

  // テキストエリアから一括取り込み（1行1コメント、"文字|色"も可）
  const bulkImport = (raw: string) => {
    const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
    const items: CommentItem[] = lines.map((line, i) => {
      if (line.includes("|")) {
        const idx = line.lastIndexOf("|");
        const text = line.slice(0, idx).trim();
        const color = fromCss(line.slice(idx + 1).trim());
        return { id: newId(), text, color: color || pickColor(i) };
      }
      return { id: newId(), text: line, color: pickColor(i) };
    });
    onChange(items);
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {comments.map((c) => (
          <div key={c.id} className="flex items-center gap-2">
            <input
              type="color"
              value={toCss(c.color)}
              onChange={(e) => update(c.id, { color: fromCss(e.target.value) })}
              className="h-9 w-9 shrink-0 cursor-pointer rounded border border-white/20 bg-transparent"
              title={t("pickColor")}
            />
            <input
              type="text"
              value={c.text}
              onChange={(e) => update(c.id, { text: e.target.value })}
              placeholder={t("commentPlaceholder")}
              className="min-w-0 flex-1 rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm outline-none focus:border-pink-400"
            />
            <button
              onClick={() => remove(c.id)}
              className="shrink-0 rounded-md px-2 py-2 text-white/40 hover:text-red-400"
              title={t("remove")}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={add}
          className="rounded-md bg-pink-500/90 px-4 py-2 text-sm font-bold text-white hover:bg-pink-500"
        >
          {t("addComment")}
        </button>
        <details className="group">
          <summary className="cursor-pointer list-none rounded-md border border-white/15 px-4 py-2 text-sm text-white/70 hover:text-white">
            {t("bulkPaste")}
          </summary>
          <div className="mt-2">
            <textarea
              rows={5}
              placeholder={t("bulkPlaceholder")}
              className="w-full rounded-md border border-white/15 bg-black/30 p-2 text-sm outline-none focus:border-pink-400"
              onChange={(e) => bulkImport(e.target.value)}
            />
            <p className="mt-1 text-xs text-white/40">{t("bulkHint")}</p>
          </div>
        </details>
      </div>

      <details>
        <summary className="cursor-pointer text-xs text-white/40">
          {t("paletteRef")}
        </summary>
        <div className="mt-1 flex flex-wrap gap-2 text-xs">
          {PALETTE.map((p) => (
            <span key={p.hex} className="flex items-center gap-1">
              <span
                className="inline-block h-3 w-3 rounded-full border border-white/20"
                style={{ background: toCss(p.hex) }}
              />
              {t(p.nameKey)}
            </span>
          ))}
        </div>
      </details>
    </div>
  );
}
