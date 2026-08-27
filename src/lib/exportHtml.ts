import type { SerializedNodes } from "@craftjs/core";

/** Escape teks untuk aman disisipkan sebagai HTML */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function styleToCss(style: Record<string, string | number | undefined>): string {
  return Object.entries(style)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => {
      const cssKey = k.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
      const cssVal = typeof v === "number" ? `${v}px` : v;
      return `${cssKey}:${cssVal}`;
    })
    .join(";");
}

function renderNode(id: string, nodes: SerializedNodes): string {
  const node = nodes[id];
  if (!node || node.hidden) return "";

  const resolvedName = (node.type as { resolvedName?: string }).resolvedName;
  const props = node.props as Record<string, unknown>;
  const childrenHtml = (node.nodes || []).map((childId) => renderNode(childId, nodes)).join("\n");

  if (resolvedName === "ImageBlock") {
    const src = (props.src as string) || "";
    const style = styleToCss({
      width: props.width as number,
      height: props.height as number,
      objectFit: props.objectFit as string,
    });
    return `<img src="${escapeHtml(src)}" alt="" style="${style}" />`;
  }

  if (resolvedName === "TextBlock") {
    const text = (props.text as string) || "";
    const style = styleToCss({
      fontSize: props.fontSize as number,
      fontFamily: props.fontFamily as string,
      color: props.color as string,
      fontWeight: props.fontWeight as string,
      margin: 0,
    });
    return `<p style="${style}">${text}</p>`;
  }

  // Container (default)
  const position = (props.position as string) || "static";
  const style = styleToCss({
    width: props.width as number,
    height: props.height as number,
    background: props.background as string,
    padding: props.padding as number,
    position: position === "static" ? "relative" : position,
    top: position === "sticky" ? (props.top as number) : undefined,
  });
  return `<div style="${style}">\n${childrenHtml}\n</div>`;
}

/**
 * Convert SerializedNodes (hasil query.serialize() craft.js, di-parse jadi objek)
 * menjadi dokumen HTML statis lengkap.
 */
export function craftNodesToHtml(nodes: SerializedNodes, title = "Exported Page"): string {
  const bodyHtml = renderNode("ROOT", nodes);
  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(title)}</title>
</head>
<body>
${bodyHtml}
</body>
</html>`;
}
