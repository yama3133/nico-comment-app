"use client";

import { useEffect, useRef } from "react";
import type { CommentItem, FlowSettings } from "@/lib/types";
import { toCss } from "@/lib/palette";

const W = 960;
const H = 540;

interface Props {
  comments: CommentItem[];
  settings: FlowSettings;
}

/** Canvasでコメント流れをライブ再生（実際のGIF生成はサーバー側だが、見た目を即確認できる） */
export default function Preview({ comments, settings }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const valid = comments.filter((c) => c.text.trim() !== "");
    const { speed, interval, rows, fontSize } = settings;
    const stroke = Math.max(2, Math.floor(fontSize / 10));

    // 事前に各コメントの幅・レーン・開始時刻を計算
    ctx.font = `bold ${fontSize}px sans-serif`;
    const items = valid.map((c, i) => {
      const tw = ctx.measureText(c.text).width;
      const lane = i % rows;
      const y =
        Math.round(H * 0.03) + lane * Math.round((H * 0.94) / rows);
      return { text: c.text, color: toCss(c.color), tw, y, start: i * interval };
    });

    const travel = (W + Math.max(1, ...items.map((it) => it.tw))) / speed;
    const loopTime =
      items.length > 0 ? items[items.length - 1].start + travel : 1;

    startRef.current = performance.now();

    const draw = (now: number) => {
      const t = ((now - startRef.current) / 1000) % loopTime;
      // 背景（暗いスライドを想定したダークグレー＋うっすらグリッド感）
      ctx.fillStyle = "#0a0c0f";
      ctx.fillRect(0, 0, W, H);

      if (items.length === 0) {
        ctx.fillStyle = "#555";
        ctx.font = "bold 28px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("コメントを入力するとここで流れます", W / 2, H / 2);
        ctx.textAlign = "left";
      } else {
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.lineJoin = "round";
        for (const it of items) {
          if (t < it.start) continue;
          const x = W - speed * (t - it.start);
          if (x < -it.tw) continue;
          ctx.lineWidth = stroke;
          ctx.strokeStyle = "#000";
          ctx.strokeText(it.text, x, it.y);
          ctx.fillStyle = it.color;
          ctx.fillText(it.text, x, it.y);
        }
      }
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(rafRef.current);
  }, [comments, settings]);

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      className="w-full rounded-lg border border-white/10 shadow-lg"
      style={{ aspectRatio: "16 / 9" }}
    />
  );
}
