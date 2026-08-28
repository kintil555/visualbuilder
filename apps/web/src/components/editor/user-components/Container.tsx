"use client";

import { useNode } from "@craftjs/core";
import { CSSProperties, ReactNode } from "react";

export interface ContainerProps {
  width?: number;
  height?: number;
  background?: string;
  padding?: number;
  margin?: number;
  borderRadius?: number;
  boxShadow?: boolean;
  position?: "static" | "sticky" | "relative";
  top?: number;
  hoverBackground?: string;
  children?: ReactNode;
}

export function Container({
  width = 400,
  height = 200,
  background = "#f3f4f6",
  padding = 16,
  margin = 0,
  borderRadius = 0,
  boxShadow = false,
  position = "static",
  top = 0,
  hoverBackground,
  children,
}: ContainerProps) {
  const {
    connectors: { connect, drag },
  } = useNode();

  const style: CSSProperties = {
    width,
    height,
    background,
    padding,
    margin,
    borderRadius,
    boxShadow: boxShadow ? "0 4px 12px rgba(0,0,0,0.15)" : undefined,
    position: position === "static" ? "relative" : position,
    top: position === "sticky" ? top : undefined,
  };

  return (
    <div
      ref={(ref) => {
        if (ref) connect(drag(ref));
      }}
      style={style}
      className="border border-dashed border-slate-300/70 transition-all duration-150 hover:border-indigo-300 hover:shadow-[inset_0_0_0_1px_rgba(99,102,241,0.15)]"
      onMouseEnter={(e) => {
        if (hoverBackground) e.currentTarget.style.background = hoverBackground;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = background;
      }}
    >
      {children}
    </div>
  );
}

Container.craft = {
  displayName: "Container",
  props: {
    width: 400,
    height: 200,
    background: "#f3f4f6",
    padding: 16,
    margin: 0,
    borderRadius: 0,
    boxShadow: false,
    position: "static",
    top: 0,
  },
  rules: {
    canDrag: () => true,
  },
};
