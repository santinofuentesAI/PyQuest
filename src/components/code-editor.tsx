"use client";

import dynamic from "next/dynamic";
import { useLayoutEffect, useEffect, useRef, useState } from "react";
import type { editor } from "monaco-editor";
import { useProgress } from "@/lib/progress-store";
import { paletteById } from "@/lib/palettes";
import { completions, completeWord, insertText } from "@/lib/editor-tools";
import { cn } from "@/lib/utils";

const Monaco = dynamic(() => import("@monaco-editor/react"), { ssr: false,
  loading: () => <p className="p-4 text-sm">Cargando editor avanzado…</p> });
const SYMBOLS = [":", '"', "'", "(", ")", "[", "]", "{", "}", "=", "==", "!=", ">", "<", ">=", "<=", "+", "-", "*", "/", ",", ".", "_", "#"];

export function CodeEditor({ value, onChange, height = 220, words = [], forceDark = false }: {
  value: string; onChange: (v: string) => void; height?: number; words?: string[]; forceDark?: boolean;
}) {
  const palette = useProgress((s) => s.palette);
  const [advanced, setAdvanced] = useState(false);
  const [caret, setCaret] = useState(0);
  const area = useRef<HTMLTextAreaElement>(null);
  const monaco = useRef<editor.IStandaloneCodeEditor | null>(null);
  const hold = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingCaret = useRef<number | null>(null);
  const suggestions = completions(value, caret, words);
  useLayoutEffect(() => {
    if (pendingCaret.current == null || !area.current) return;
    const next = pendingCaret.current;
    pendingCaret.current = null;
    area.current.focus();
    area.current.setSelectionRange(next, next);
  }, [value, caret, advanced]);
  useEffect(() => () => { if (hold.current) clearTimeout(hold.current); }, []);

  function apply(result: { value: string; caret: number }) {
    pendingCaret.current = result.caret;
    onChange(result.value);
    setCaret(result.caret);
  }
  function insert(text: string, wrap = false) {
    if (advanced && monaco.current) {
      const ed = monaco.current, selection = ed.getSelection();
      if (selection) ed.executeEdits("toolbar", [{ range: selection, text, forceMoveMarkers: true }]);
      ed.focus();
      return;
    }
    const el = area.current;
    apply(insertText(value, el?.selectionStart ?? caret, el?.selectionEnd ?? caret, text, wrap));
  }
  function complete(word?: string) {
    const el = area.current;
    const start = el?.selectionStart ?? caret;
    const choice = word ?? completions(value, start, words)[0];
    if (choice) apply(completeWord(value, start, el?.selectionEnd ?? start, choice));
  }
  function cancelHold() {
    if (hold.current) clearTimeout(hold.current);
    hold.current = null;
  }
  const dark = forceDark;
  const chip = dark
    ? "min-h-10 rounded-lg border border-zinc-700 bg-zinc-900 px-2 font-mono text-base text-zinc-100 hover:bg-zinc-800"
    : "min-h-10 rounded-lg border bg-muted/40 px-2 font-mono text-base text-foreground hover:bg-primary/10";
  const action = dark
    ? "min-h-10 rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-sm font-medium text-zinc-100 hover:bg-zinc-800"
    : "min-h-10 rounded-lg border px-3 text-sm text-foreground";

  return (
    <div
      className={cn(
        "min-w-0 overflow-hidden rounded-2xl border",
        dark ? "border-zinc-800 bg-zinc-950 text-zinc-100" : "bg-card text-card-foreground",
      )}
      style={dark ? { colorScheme: "dark" } : undefined}
    >
      <div className={cn(
        "flex items-center justify-between gap-2 border-b px-3 py-2 text-xs",
        dark && "border-zinc-800 text-zinc-300",
      )}>
        <span className="font-semibold">Python · {advanced ? "editor avanzado" : "editor táctil"}</span>
        <button type="button" onClick={() => setAdvanced(!advanced)} className={cn("min-h-9 rounded-lg px-2 font-semibold", dark ? "text-emerald-400" : "text-primary")}>
          {advanced ? "Usar editor táctil" : "Usar editor avanzado"}
        </button>
      </div>
      {advanced ? <Monaco height={height} language="python" value={value}
        theme={dark || paletteById(palette).dark ? "vs-dark" : "light"}
        onMount={(ed) => { monaco.current = ed; }} onChange={(v) => onChange(v ?? "")}
        options={{ minimap: { enabled: false }, fontSize: 16, wordWrap: "on", automaticLayout: true, tabSize: 4, scrollBeyondLastLine: false, padding: { top: 12, bottom: 12 }, tabCompletion: "on" }} />
        : <textarea ref={area} aria-label="Código Python" value={value} spellCheck={false} autoCapitalize="off" autoCorrect="off"
          style={{ minHeight: height, caretColor: "#e4e4e7" }}
          className={cn(
            "block w-full resize-y bg-zinc-950 p-4 font-mono text-base leading-7 text-zinc-100 outline-none focus:ring-2 focus:ring-inset",
            dark ? "selection:bg-emerald-500/30 focus:ring-emerald-500" : "focus:ring-primary",
          )}
          onChange={(e) => { onChange(e.target.value); setCaret(e.target.selectionStart); }}
          onSelect={(e) => setCaret(e.currentTarget.selectionStart)}
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing) return;
            if (e.key === "Tab" && !e.shiftKey) { e.preventDefault(); if (suggestions.length) complete(); else insert("    "); }
            if (e.key === "Enter") {
              e.preventDefault();
              const el = e.currentTarget;
              const line = value.slice(0, el.selectionStart).split("\n").at(-1) ?? "";
              insert("\n" + (line.match(/^\s*/)?.[0] ?? "") + (line.trimEnd().endsWith(":") ? "    " : ""));
            }
          }}
          onPointerDown={(e) => { cancelHold(); if (e.pointerType === "touch") hold.current = setTimeout(() => complete(), 650); }}
          onPointerUp={cancelHold} onPointerCancel={cancelHold} onPointerMove={cancelHold} onBlur={cancelHold} />}
      {!advanced && <div className={cn("flex min-h-11 flex-wrap items-center gap-1 border-t p-2", dark && "border-zinc-800")} aria-label="Autocompletar">
        {suggestions.length ? suggestions.map((word) => <button key={word} type="button" onPointerDown={(e) => e.preventDefault()} onClick={() => complete(word)} className={dark ? "min-h-10 rounded-lg bg-emerald-500/15 px-3 font-mono text-sm font-semibold text-emerald-300" : "min-h-10 rounded-lg bg-primary/10 px-3 font-mono text-sm font-semibold text-primary"}>{word}</button>)
          : <span className={cn("px-1 text-xs", dark ? "text-zinc-400" : "text-muted-foreground")}>Escribe para ver sugerencias. Tab completa o indenta. Mantén el dedo quieto sobre el editor para completar.</span>}
      </div>}
      <div className={cn("flex flex-wrap gap-1 border-t p-2", dark && "border-zinc-800 bg-zinc-950")} aria-label="Símbolos Python">
        {SYMBOLS.map((symbol) => <button key={symbol} type="button" aria-label={`Insertar ${symbol}`} onPointerDown={(e) => e.preventDefault()} onClick={() => insert(symbol, true)} className={cn(chip, "min-w-10")}>{symbol}</button>)}
        <button type="button" onPointerDown={(e) => e.preventDefault()} onClick={() => insert("    ")} className={action}>Indentar</button>
        <button type="button" onPointerDown={(e) => e.preventDefault()} onClick={() => insert("\n")} className={action}>Nueva línea</button>
        {advanced && <button type="button" onClick={() => monaco.current?.trigger("toolbar", "editor.action.triggerSuggest", {})} className={action}>Autocompletar</button>}
      </div>
    </div>
  );
}
