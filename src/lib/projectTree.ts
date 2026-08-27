import type { SerializedNodes, SerializedNode } from "@craftjs/core";

export class ProjectNotFoundError extends Error {}

const COMPONENT_DEFAULTS: Record<string, Record<string, unknown>> = {
  Container: { width: 300, height: 100, background: "#ffffff", padding: 8, position: "static" },
  TextBlock: { text: "Text", fontSize: 16, fontWeight: "normal", color: "#000000" },
  ImageBlock: { src: "", objectFit: "cover" },
  Button: { text: "Button", background: "#2563eb", color: "#ffffff", padding: 12 },
};

function makeNodeId(): string {
  return "node_" + Math.random().toString(36).slice(2, 10);
}

/**
 * Parses a JSON string into SerializedNodes.
 */
export function parseTree(treeJson: string): SerializedNodes {
  return JSON.parse(treeJson) as SerializedNodes;
}

/**
 * Adds a new component node under parentId (defaults to ROOT).
 * Returns the updated tree — caller is responsible for persisting it (e.g. client-side).
 */
export function addComponent(
  tree: SerializedNodes,
  type: keyof typeof COMPONENT_DEFAULTS,
  props: Record<string, unknown> = {},
  parentId = "ROOT"
): { nodeId: string; tree: SerializedNodes } {
  const parent = tree[parentId];
  if (!parent) throw new Error(`Parent node "${parentId}" not found`);

  const nodeId = makeNodeId();
  const node: SerializedNode = {
    type: { resolvedName: type },
    isCanvas: type === "Container",
    props: { ...COMPONENT_DEFAULTS[type], ...props },
    displayName: type,
    custom: {},
    hidden: false,
    nodes: [],
    linkedNodes: {},
    parent: parentId,
  } as SerializedNode;

  tree[nodeId] = node;
  parent.nodes = [...(parent.nodes || []), nodeId];
  return { nodeId, tree };
}

/** Shallow-merges props into an existing node. Returns updated tree. */
export function editComponent(
  tree: SerializedNodes,
  nodeId: string,
  props: Record<string, unknown>
): SerializedNodes {
  const node = tree[nodeId];
  if (!node) throw new Error(`Node "${nodeId}" not found`);
  node.props = { ...node.props, ...props };
  return tree;
}

/** Removes a node and detaches from parent. Returns updated tree. */
export function deleteComponent(tree: SerializedNodes, nodeId: string): SerializedNodes {
  if (nodeId === "ROOT") throw new Error("Cannot delete ROOT node");
  const node = tree[nodeId];
  if (!node) throw new Error(`Node "${nodeId}" not found`);

  const parent = node.parent ? tree[node.parent as string] : undefined;
  if (parent) {
    parent.nodes = (parent.nodes || []).filter((id) => id !== nodeId);
  }
  delete tree[nodeId];
  return tree;
}
