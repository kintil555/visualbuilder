import { NodeId, NodeTree, Nodes } from "@craftjs/core";
import { getRandomId } from "@craftjs/utils";

/**
 * Clone a NodeTree (from query.node(id).toNodeTree()) with all node ids
 * regenerated, preserving parent/child structure. Craft.js requires every
 * node id in the editor state to be unique, so re-adding a tree without
 * regenerating ids throws "Attempting to add a node with duplicated id".
 */
export function cloneNodeTree(tree: NodeTree, newParentId: NodeId): NodeTree {
  const idMap: Record<NodeId, NodeId> = {};

  // First pass: assign a fresh id to every node in the tree.
  Object.keys(tree.nodes).forEach((oldId) => {
    idMap[oldId] = oldId === tree.rootNodeId ? getRandomId() : getRandomId();
  });

  const newNodes: Nodes = {};

  Object.entries(tree.nodes).forEach(([oldId, node]) => {
    const newId = idMap[oldId];
    const newParent =
      node.data.parent === null
        ? newParentId
        : idMap[node.data.parent] ?? node.data.parent;

    newNodes[newId] = {
      ...node,
      id: newId,
      data: {
        ...node.data,
        parent: newParent,
        nodes: node.data.nodes.map((childId) => idMap[childId] ?? childId),
        linkedNodes: Object.fromEntries(
          Object.entries(node.data.linkedNodes).map(([key, childId]) => [
            key,
            idMap[childId] ?? childId,
          ])
        ),
      },
    };
  });

  return {
    rootNodeId: idMap[tree.rootNodeId],
    nodes: newNodes,
  };
}
