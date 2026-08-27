"use client";

import { useNode } from "@craftjs/core";
import { CSSProperties, ReactNode } from "react";

export interface ContainerProps {
  width?: number;
  height?: number;
  background?: string;
  padding?: number;
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
    position: position === "static" ? "relative" : position,
    top: position === "sticky" ? top : undefined,
  };

  return (
    <div
      ref={(ref) => {
        if (ref) connect(drag(ref));
      }}
      style={style}
      className="border border-dashed border-gray-300 transition-colors"
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
    position: "static",
    top: 0,
  },
  rules: {
    canDrag: () => true,
  },
};
