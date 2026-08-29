import * as cheerio from "cheerio";
import type { AnyNode } from "domhandler";
import JSZip from "jszip";

export interface ImportedNode {
  tag: string;
  text?: string;
  src?: string;
  style?: Record<string, string>;
  children: ImportedNode[];
}

/** Parse deklarasi CSS sederhana "prop: value; prop2: value2" jadi object. */
function parseDeclarations(cssText: string): Record<string, string> {
  const out: Record<string, string> = {};
  cssText.split(";").forEach((decl) => {
    const idx = decl.indexOf(":");
    if (idx === -1) return;
    const prop = decl.slice(0, idx).trim().toLowerCase();
    const value = decl.slice(idx + 1).trim();
    if (prop && value) out[prop] = value;
  });
  return out;
}

/** Resolve semua var(--x[, fallback]) di dalam satu value memakai map variabel. Maks 5 iterasi jaga-jaga circular ref. */
function resolveVars(value: string, vars: Record<string, string>): string {
  let result = value;
  for (let i = 0; i < 5 && result.includes("var("); i++) {
    result = result.replace(/var\(\s*(--[\w-]+)\s*(?:,\s*([^)]+))?\)/g, (_m, name, fallback) => {
      return vars[name] ?? (fallback ? fallback.trim() : _m);
    });
  }
  return result;
}

/**
 * Kumpulkan rule dari semua tag <style> dalam dokumen menjadi map
 * selector (persis seperti ditulis, mis. ".card", "#hero") -> declarations,
 * dengan var(--x) sudah di-resolve memakai variabel dari :root.
 * Hanya mendukung selector class/id/root tunggal tanpa kombinator — cukup
 * untuk mayoritas HTML export sederhana tanpa perlu CSS engine penuh.
 */
function collectStyleRules($: cheerio.CheerioAPI): {
  rules: Record<string, Record<string, string>>;
  cssVars: Record<string, string>;
} {
  const rawRules: { selectors: string[]; decls: Record<string, string> }[] = [];
  const cssVars: Record<string, string> = {};

  $("style").each((_, el) => {
    const css = $(el).contents().text();
    const blockRe = /([^{}]+)\{([^{}]*)\}/g;
    let match: RegExpExecArray | null;
    while ((match = blockRe.exec(css))) {
      const selectors = match[1].split(",").map((s) => s.trim());
      const decls = parseDeclarations(match[2]);
      if (Object.keys(decls).length === 0) continue;
      if (selectors.includes(":root")) {
        Object.entries(decls).forEach(([k, v]) => {
          if (k.startsWith("--")) cssVars[k] = v;
        });
      }
      rawRules.push({ selectors, decls });
    }
  });

  const rules: Record<string, Record<string, string>> = {};
  rawRules.forEach(({ selectors, decls }) => {
    const resolved: Record<string, string> = {};
    Object.entries(decls).forEach(([k, v]) => {
      resolved[k] = resolveVars(v, cssVars);
    });
    selectors.forEach((sel) => {
      if (!/^[.#][\w-]+$/.test(sel)) return; // hanya .class atau #id tunggal (:root sudah ditangani di atas)
      rules[sel] = { ...(rules[sel] || {}), ...resolved };
    });
  });
  return { rules, cssVars };
}

/** Gabungkan style dari <style> rules (class lalu id) + inline style attr (prioritas tertinggi). */
function resolveNodeStyle(
  $node: cheerio.Cheerio<AnyNode>,
  styleRules: Record<string, Record<string, string>>,
  cssVars: Record<string, string>
): Record<string, string> {
  let merged: Record<string, string> = {};
  const classList = ($node.attr("class") || "").split(/\s+/).filter(Boolean);
  classList.forEach((cls) => {
    const rule = styleRules[`.${cls}`];
    if (rule) merged = { ...merged, ...rule };
  });
  const id = $node.attr("id");
  if (id && styleRules[`#${id}`]) merged = { ...merged, ...styleRules[`#${id}`] };
  const inline = $node.attr("style");
  if (inline) {
    const inlineDecls = parseDeclarations(inline);
    Object.keys(inlineDecls).forEach((k) => { inlineDecls[k] = resolveVars(inlineDecls[k], cssVars); });
    merged = { ...merged, ...inlineDecls };
  }
  return merged;
}

/** Parse satu file HTML string menjadi tree sederhana */
export function parseHtmlToTree(html: string): ImportedNode {
  const $ = cheerio.load(html);
  const body = $("body").length ? $("body") : $.root();
  const { rules: styleRules, cssVars } = collectStyleRules($);

  function walk(el: cheerio.Cheerio<AnyNode>): ImportedNode[] {
    const nodes: ImportedNode[] = [];
    el.children().each((_, node) => {
      const $node = $(node);
      const tag = (node as { tagName?: string }).tagName?.toLowerCase() || "div";
      const style = resolveNodeStyle($node, styleRules, cssVars);
      if (tag === "img") {
        nodes.push({ tag, src: $node.attr("src") || "", style, children: [] });
      } else if ($node.children().length === 0) {
        nodes.push({ tag, text: $node.text().trim(), style, children: [] });
      } else {
        nodes.push({ tag, style, children: walk($node) });
      }
    });
    return nodes;
  }

  return { tag: "root", children: walk(body) };
}

/** Extract semua file .html dari ZIP project */
export async function parseZipToTrees(zipBuffer: ArrayBuffer): Promise<Record<string, ImportedNode>> {
  const zip = await JSZip.loadAsync(zipBuffer);
  const results: Record<string, ImportedNode> = {};

  for (const [path, file] of Object.entries(zip.files)) {
    if (!file.dir && path.endsWith(".html")) {
      const content = await file.async("string");
      results[path] = parseHtmlToTree(content);
    }
  }

  return results;
}

/** Bentuk minimal satu node dalam format serialize() craft.js (lihat SerializedNode). */
interface CraftSerializedNode {
  type: { resolvedName: string };
  isCanvas: boolean;
  props: Record<string, unknown>;
  displayName: string;
  custom: Record<string, unknown>;
  parent: string | null;
  hidden: boolean;
  nodes: string[];
  linkedNodes: Record<string, string>;
}

let idCounter = 0;
function nextId(prefix: string) {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

const IMG_TAGS = new Set(["img"]);
// tag yang dianggap "leaf teks" kalau punya isi teks dan tidak punya children
const TEXT_TAGS = new Set(["p", "span", "h1", "h2", "h3", "h4", "h5", "h6", "a", "li", "button", "label"]);

/** Ambil angka px dari value CSS semacam "16px" / "1rem" / "20". Return undefined kalau tak bisa diparse. */
function toPx(value: string | undefined, remBase = 16): number | undefined {
  if (!value) return undefined;
  const remMatch = value.match(/^([\d.]+)rem$/);
  if (remMatch) return parseFloat(remMatch[1]) * remBase;
  const pxMatch = value.match(/^([\d.]+)px$/);
  if (pxMatch) return parseFloat(pxMatch[1]);
  const plain = value.match(/^([\d.]+)$/);
  if (plain) return parseFloat(plain[1]);
  return undefined;
}

function isValidColor(value: string | undefined): value is string {
  if (!value) return false;
  return /^(#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(|[a-zA-Z]+)$/.test(value.trim());
}

/** Ambil {position, top, left} dari style asli — hanya "absolute" yang ditangkap, mode lain (relative/fixed/sticky) di-treat sebagai static di canvas builder ini. Mendukung top/left langsung; right/bottom dikonversi kasar dengan asumsi parent width/height dari style container (tidak selalu akurat, tapi lebih baik daripada 0). */
function extractPosition(
  style: Record<string, string>,
  parentWidth?: number,
  parentHeight?: number
): { position: "static" | "absolute"; top: number; left: number } {
  if (style.position !== "absolute") return { position: "static", top: 0, left: 0 };

  let top = toPx(style.top);
  if (top === undefined && style.bottom !== undefined && parentHeight !== undefined) {
    top = parentHeight - (toPx(style.bottom) ?? 0);
  }
  let left = toPx(style.left);
  if (left === undefined && style.right !== undefined && parentWidth !== undefined) {
    left = parentWidth - (toPx(style.right) ?? 0);
  }
  return { position: "absolute", top: top ?? 0, left: left ?? 0 };
}

/**
 * Convert satu ImportedNode (dan children-nya) menjadi flat map SerializedNodes
 * yang siap dipakai `actions.deserialize()`. ROOT_NODE selalu jadi Container akar.
 */
export function importedTreeToCraftNodes(
  root: ImportedNode
): Record<string, CraftSerializedNode> {
  idCounter = 0;
  const nodes: Record<string, CraftSerializedNode> = {};

  function addNode(
    imported: ImportedNode,
    parentId: string | null,
    id: string,
    parentDims?: { width?: number; height?: number }
  ) {
    const children = imported.children || [];
    const style = imported.style || {};

    if (IMG_TAGS.has(imported.tag)) {
      const pos = extractPosition(style, parentDims?.width, parentDims?.height);
      nodes[id] = {
        type: { resolvedName: "ImageBlock" },
        isCanvas: false,
        props: {
          src: imported.src || "https://placehold.co/400x300",
          width: toPx(style.width) ?? 400,
          height: toPx(style.height) ?? 300,
          objectFit: style["object-fit"] || "cover",
          borderRadius: toPx(style["border-radius"]) ?? 0,
          ...pos,
        },
        displayName: "Image",
        custom: {},
        parent: parentId,
        hidden: false,
        nodes: [],
        linkedNodes: {},
      };
      return;
    }

    const hasText = !!imported.text && imported.text.trim().length > 0;
    if (children.length === 0 && (hasText || TEXT_TAGS.has(imported.tag))) {
      const pos = extractPosition(style, parentDims?.width, parentDims?.height);
      nodes[id] = {
        type: { resolvedName: "TextBlock" },
        isCanvas: false,
        props: {
          text: imported.text || "",
          fontSize: toPx(style["font-size"]) ?? 16,
          fontFamily: style["font-family"] || "Inter, sans-serif",
          color: isValidColor(style.color) ? style.color : "#111827",
          fontWeight:
            style["font-weight"] || (imported.tag.match(/^h[1-6]$/) ? "bold" : "normal"),
          ...pos,
        },
        displayName: "Text",
        custom: {},
        parent: parentId,
        hidden: false,
        nodes: [],
        linkedNodes: {},
      };
      return;
    }

    // Default: Container (bisa nested / kosong)
    const childIds = children.map(() => nextId("node"));
    const pos = extractPosition(style, parentDims?.width, parentDims?.height);
    const containerWidth = toPx(style.width) ?? 400;
    const containerHeight = toPx(style.height) ?? (children.length ? undefined : 100);
    nodes[id] = {
      type: { resolvedName: "Container" },
      isCanvas: true,
      props: {
        width: containerWidth,
        height: containerHeight ?? "auto",
        background: isValidColor(style["background-color"] || style.background)
          ? style["background-color"] || style.background
          : "#ffffff",
        padding: toPx(style.padding) ?? 16,
        borderRadius: toPx(style["border-radius"]) ?? 0,
        ...pos,
      },
      displayName: "Container",
      custom: {},
      parent: parentId,
      hidden: false,
      nodes: childIds,
      linkedNodes: {},
    };

    children.forEach((child, i) =>
      addNode(child, id, childIds[i], { width: containerWidth, height: containerHeight })
    );
  }

  addNode(root, null, "ROOT");
  nodes["ROOT"].parent = null;
  return nodes;
}
