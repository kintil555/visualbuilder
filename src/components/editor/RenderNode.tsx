"use client";

import { useNode, useEditor } from "@craftjs/core";
import { useRef, useEffect, useState } from "react";
import Moveable from "react-moveable";

export function RenderNode({ render }: { render: React.ReactNode }) {
  const {
    id,
    isSelected,
    isHover,
    dom,
    connectors: { connect },
    actions: { setProp },
  } = useNode((node) => ({
    isSelected: node.events.selected,
    isHover: node.events.hovered,
    dom: node.dom,
  }));

  const { actions, query } = useEditor();
  const targetRef = useRef<HTMLDivElement>(null);
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
      {render}
    </>
  );
}
