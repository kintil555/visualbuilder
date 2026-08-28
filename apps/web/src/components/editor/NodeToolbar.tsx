"use client";

import { useEditor } from "@craftjs/core";
import { useEffect, useRef } from "react";
import { cloneNodeTree } from "@/lib/duplicateNode";

interface NodeToolbarProps {
  nodeId: string;
  name: string;
  dom: HTMLElement;
}

export function NodeToolbar({ nodeId, name, dom }: NodeToolbarProps) {
  const { actions, query, canDelete } = useEditor((_, query) => ({
    canDelete: query.node(nodeId).isDeletable(),
  }));
  const ref = useRef<HTMLDivElement>(null);

  // Position is written straight to the DOM on scroll/resize instead of
  // going through React state, so tracking the target's rect never causes
  // a render-triggers-effect-triggers-render loop.
  useEffect(() => {
    function update() {
      if (!ref.current) return;
      const rect = dom.getBoundingClientRect();
      ref.current.style.top = `${rect.top}px`;
      ref.current.style.left = `${rect.left}px`;
    }
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    const observer = new ResizeObserver(update);
    observer.observe(dom);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
      observer.disconnect();
    };
  }, [dom]);

  function handleDuplicate(e: React.MouseEvent) {
    e.stopPropagation();
    const node = query.node(nodeId).get();
    const parentId = node.data.parent;
    if (!parentId) return;

    const tree = query.node(nodeId).toNodeTree();
    const cloned = cloneNodeTree(tree, parentId);
    const index = query.node(parentId).get().data.nodes.indexOf(nodeId);
    actions.addNodeTree(cloned, parentId, index + 1);
    actions.selectNode(cloned.rootNodeId);
  }

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    actions.delete(nodeId);
  }

  return (
    <div
      ref={ref}
      className="fixed z-50 flex items-center gap-1 rounded bg-blue-600 px-2 py-1 text-xs text-white shadow-lg select-none"
      style={{ transform: "translateY(-100%)" }}
    >
      <span className="pr-1 font-medium">{name}</span>
      <button
        onClick={handleDuplicate}
        title="Duplikat"
        className="rounded px-1.5 py-0.5 hover:bg-blue-500"
      >
        ⧉
      </button>
      {canDelete && (
        <button
          onClick={handleDelete}
          title="Hapus"
          className="rounded px-1.5 py-0.5 hover:bg-red-500"
        >
          🗑
        </button>
      )}
    </div>
  );
}
