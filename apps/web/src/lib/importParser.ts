import * as cheerio from "cheerio";
import type { AnyNode } from "domhandler";
import JSZip from "jszip";

export interface ImportedNode {
  tag: string;
  text?: string;
  src?: string;
  children: ImportedNode[];
}

/** Parse satu file HTML string menjadi tree sederhana */
export function parseHtmlToTree(html: string): ImportedNode {
  const $ = cheerio.load(html);
  const body = $("body").length ? $("body") : $.root();

  function walk(el: cheerio.Cheerio<AnyNode>): ImportedNode[] {
    const nodes: ImportedNode[] = [];
    el.children().each((_, node) => {
      const $node = $(node);
      const tag = (node as { tagName?: string }).tagName?.toLowerCase() || "div";
      if (tag === "img") {
        nodes.push({ tag, src: $node.attr("src") || "", children: [] });
      } else if ($node.children().length === 0) {
        nodes.push({ tag, text: $node.text().trim(), children: [] });
      } else {
        nodes.push({ tag, children: walk($node) });
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

/**
 * Convert satu ImportedNode (dan children-nya) menjadi flat map SerializedNodes
 * yang siap dipakai `actions.deserialize()`. ROOT_NODE selalu jadi Container akar.
 */
export function importedTreeToCraftNodes(
  root: ImportedNode
): Record<string, CraftSerializedNode> {
  idCounter = 0;
  const nodes: Record<string, CraftSerializedNode> = {};

  function addNode(imported: ImportedNode, parentId: string | null, id: string) {
    const children = imported.children || [];

    if (IMG_TAGS.has(imported.tag)) {
      nodes[id] = {
        type: { resolvedName: "ImageBlock" },
        isCanvas: false,
        props: { src: imported.src || "https://placehold.co/400x300", width: 400, height: 300, objectFit: "cover" },
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
      nodes[id] = {
        type: { resolvedName: "TextBlock" },
        isCanvas: false,
        props: {
          text: imported.text || "",
          fontSize: 16,
          fontFamily: "Inter, sans-serif",
          color: "#111827",
          fontWeight: imported.tag.match(/^h[1-6]$/) ? "bold" : "normal",
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
    nodes[id] = {
      type: { resolvedName: "Container" },
      isCanvas: true,
      props: { width: 400, height: children.length ? "auto" : 100, background: "#ffffff", padding: 16, position: "static", top: 0 },
      displayName: "Container",
      custom: {},
      parent: parentId,
      hidden: false,
      nodes: childIds,
      linkedNodes: {},
    };

    children.forEach((child, i) => addNode(child, id, childIds[i]));
  }

  addNode(root, null, "ROOT");
  nodes["ROOT"].parent = null;
  return nodes;
}
