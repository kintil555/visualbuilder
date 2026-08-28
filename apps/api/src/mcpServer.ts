import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { parseTree, addComponent, editComponent, deleteComponent } from "@visualbuilder/shared";

/**
 * Builds a stateless MCP server. No database — the caller passes the
 * current tree JSON with each tool call and receives the updated tree back.
 * Claude stores the tree on its side (in the conversation) or the client
 * can persist it however it likes (localStorage, file, etc).
 */
export function buildMcpServer(_discordId: string) {
  const server = new McpServer({ name: "visual-builder", version: "0.1.0" });

  server.registerTool(
    "get_component_defaults",
    {
      title: "Get component defaults",
      description:
        "Returns default prop values for all available components: Container, TextBlock, ImageBlock, Button.",
    },
    async () => {
      const defaults = {
        Container: { width: 300, height: 100, background: "#ffffff", padding: 8, position: "static" },
        TextBlock: { text: "Text", fontSize: 16, fontWeight: "normal", color: "#000000" },
        ImageBlock: { src: "", objectFit: "cover" },
        Button: { text: "Button", background: "#2563eb", color: "#ffffff", padding: 12 },
      };
      return { content: [{ type: "text", text: JSON.stringify(defaults, null, 2) }] };
    }
  );

  server.registerTool(
    "add_component",
    {
      title: "Add component",
      description:
        "Add a new component to a layout tree. Pass the current tree JSON and receive the updated tree + new node id.",
      inputSchema: {
        treeJson: z.string().describe("Current SerializedNodes JSON (from editor)"),
        type: z.enum(["Container", "TextBlock", "ImageBlock", "Button"]),
        props: z.record(z.string(), z.unknown()).optional(),
        parentId: z.string().optional(),
      },
    },
    async ({ treeJson, type, props, parentId }) => {
      const tree = parseTree(treeJson);
      const result = addComponent(tree, type, props ?? {}, parentId);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ nodeId: result.nodeId, treeJson: JSON.stringify(result.tree) }, null, 2),
          },
        ],
      };
    }
  );

  server.registerTool(
    "edit_component",
    {
      title: "Edit component",
      description: "Update props of an existing component node.",
      inputSchema: {
        treeJson: z.string(),
        nodeId: z.string(),
        props: z.record(z.string(), z.unknown()),
      },
    },
    async ({ treeJson, nodeId, props }) => {
      const tree = parseTree(treeJson);
      const updated = editComponent(tree, nodeId, props);
      return {
        content: [{ type: "text", text: JSON.stringify({ treeJson: JSON.stringify(updated) }, null, 2) }],
      };
    }
  );

  server.registerTool(
    "delete_component",
    {
      title: "Delete component",
      description: "Remove a component node from the layout.",
      inputSchema: { treeJson: z.string(), nodeId: z.string() },
    },
    async ({ treeJson, nodeId }) => {
      const tree = parseTree(treeJson);
      const updated = deleteComponent(tree, nodeId);
      return {
        content: [{ type: "text", text: JSON.stringify({ treeJson: JSON.stringify(updated) }, null, 2) }],
      };
    }
  );

  return server;
}
