"use client";

import { useI18n } from "@/lib/i18n";

export default function LangToggle() {
  const { lang, setLang } = useI18n();
  return (
    <div className="fixed right-3 top-3 z-50 flex overflow-hidden rounded-full border border-white/20 bg-black/40 text-xs backdrop-blur">
      <button
        onClick={() => setLang("ja")}
        className={`px-3 py-1 ${lang === "ja" ? "bg-pink-500 text-white" : "text-white/60 hover:text-white"}`}
        aria-pressed={lang === "ja"}
      >
        日本語
      </button>
      <button
        onClick={() => setLang("en")}
        className={`px-3 py-1 ${lang === "en" ? "bg-pink-500 text-white" : "text-white/60 hover:text-white"}`}
        aria-pressed={lang === "en"}
      >
        EN
      </button>
    </div>
  );
}
