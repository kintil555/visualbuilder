"use client";

import { useEditor } from "@craftjs/core";
import { craftNodesToHtml } from "@/lib/exportHtml";

export function ExportButton() {
  const { query } = useEditor();

  function handleExport() {
    const json = query.serialize();
    const nodes = JSON.parse(json);
    const html = craftNodesToHtml(nodes, "Visual Builder Export");

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "export.html";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={handleExport}
      className="px-3 py-1.5 text-sm rounded border bg-white hover:bg-gray-50"
    >
      Export HTML
    </button>
  );
}
