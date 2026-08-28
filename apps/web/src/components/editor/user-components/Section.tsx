"use client";

import { useNode } from "@craftjs/core";
import { CSSProperties, ReactNode } from "react";

export interface SectionProps {
  display?: "flex" | "grid";
  direction?: "row" | "column";
  gap?: number;
  columns?: number;
  padding?: number;
  background?: string;
  minHeight?: number;
  justify?: "flex-start" | "center" | "flex-end" | "space-between" | "space-around";
  align?: "flex-start" | "center" | "flex-end" | "stretch";
  children?: ReactNode;
}

export function Section({
  display = "flex",
  direction = "row",
  gap = 16,
  columns = 2,
  padding = 24,
  background = "#ffffff",
  minHeight = 120,
  justify = "flex-start",
  align = "stretch",
  children,
}: SectionProps) {
  const {
    connectors: { connect, drag },
  } = useNode();

  const style: CSSProperties = {
    display,
    gap,
    padding,
    background,
    minHeight,
    width: "100%",
    ...(display === "flex"
      ? { flexDirection: direction, justifyContent: justify, alignItems: align }
      : { gridTemplateColumns: `repeat(${columns}, 1fr)` }),
  };

  return (
    <div
      ref={(ref) => {
        if (ref) connect(drag(ref));
      }}
      style={style}
      className="border border-dashed border-sky-300/60 transition-all duration-150 hover:border-sky-400 hover:shadow-[inset_0_0_0_1px_rgba(56,189,248,0.15)]"
    >
      {children}
    </div>
  );
}

Section.craft = {
  displayName: "Section",
  props: {
    display: "flex",
    direction: "row",
    gap: 16,
    columns: 2,
    padding: 24,
    background: "#ffffff",
    minHeight: 120,
    justify: "flex-start",
    align: "stretch",
  },
  rules: {
    canDrag: () => true,
  },
};
