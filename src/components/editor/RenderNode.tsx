"use client";

import { useNode, useEditor } from "@craftjs/core";
import { useEffect, useState } from "react";
import Moveable from "react-moveable";
import { NodeToolbar } from "./NodeToolbar";

export function RenderNode({ render }: { render: React.ReactNode }) {
  const {
    id,
    isSelected,
    dom,
    name,
    actions: { setProp },
  } = useNode((node) => ({
    isSelected: node.events.selected,
    dom: node.dom,
    name: node.data.displayName,
  }));

  const { actions, query, isRootNode } = useEditor((_, query) => ({
    isRootNode: query.node(id)?.isRoot?.() ?? false,
  }));
  const [shiftKey, setShiftKey] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => e.key === "Shift" && setShiftKey(true);
    const up = (e: KeyboardEvent) => e.key === "Shift" && setShiftKey(false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  // Keyboard shortcuts on the selected node: Delete/Backspace to remove,
  // Ctrl/Cmd+D to duplicate. Skip when focus is inside an editable field
  // (e.g. TextBlock's contentEditable) so typing isn't hijacked.
  useEffect(() => {
    if (!isSelected) return;
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const isEditing =
        target?.isContentEditable ||
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT";
      if (isEditing) return;

      if ((e.key === "Delete" || e.key === "Backspace") && query.node(id).isDeletable()) {
        e.preventDefault();
        actions.delete(id);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isSelected, id, actions, query]);

  return (
    <>
      {isSelected && dom && (
        <Moveable
          target={dom as HTMLElement}
          resizable
          draggable
          keepRatio={shiftKey}
          throttleResize={0}
          onResize={({ width, height, drag }) => {
            setProp((props: { width?: number; height?: number }) => {
              props.width = Math.round(width);
              props.height = Math.round(height);
            });
            drag.target.style.transform = drag.transform;
          }}
          onDrag={({ target, transform }) => {
            target.style.transform = transform;
          }}
        />
      )}
      {isSelected && dom && !isRootNode && (
        <NodeToolbar nodeId={id} name={name} dom={dom as HTMLElement} />
      )}
      {render}
    </>
  );
}
