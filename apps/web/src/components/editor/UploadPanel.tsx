"use client";

import { useEditor } from "@craftjs/core";
import { useRef, useState } from "react";
import { parseHtmlToTree, parseZipToTrees, importedTreeToCraftNodes } from "@/lib/importParser";

export function UploadPanel() {
  const { actions } = useEditor();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  async function handleFile(file: File) {
    setError(null);
    try {
      if (file.name.endsWith(".zip")) {
        const buf = await file.arrayBuffer();
        const trees = await parseZipToTrees(buf);
        const firstPath = Object.keys(trees)[0];
        if (!firstPath) {
          setError("Tidak ada file .html di dalam ZIP.");
          return;
        }
        const nodes = importedTreeToCraftNodes(trees[firstPath]);
        actions.deserialize(nodes);
      } else if (file.name.endsWith(".html") || file.name.endsWith(".htm")) {
        const text = await file.text();
        const tree = parseHtmlToTree(text);
        const nodes = importedTreeToCraftNodes(tree);
        actions.deserialize(nodes);
      } else {
        setError("Format tidak didukung. Gunakan .html atau .zip.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memproses file.");
    }
  }

  return (
    <div className="p-4">
      <div className="font-semibold text-xs uppercase tracking-wide text-slate-400 mb-2">Import</div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-4 text-center text-xs cursor-pointer transition-all duration-150 ${
          dragOver
            ? "border-indigo-400 bg-indigo-50 scale-[1.02]"
            : "border-slate-200 text-slate-500 hover:border-indigo-300 hover:bg-slate-50"
        }`}
      >
        Tarik file .html / .zip ke sini, atau klik untuk pilih
        <input
          ref={inputRef}
          type="file"
          accept=".html,.htm,.zip"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
      </div>
      {error && <div className="text-xs text-red-600 mt-2">{error}</div>}
    </div>
  );
}
