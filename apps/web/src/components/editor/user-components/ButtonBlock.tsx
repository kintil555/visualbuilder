"use client";

import { useNode } from "@craftjs/core";
import ContentEditable from "react-contenteditable";
import { CSSProperties, useCallback, useState } from "react";

export interface ButtonBlockProps {
  text?: string;
  href?: string;
  background?: string;
  color?: string;
  fontSize?: number;
  paddingX?: number;
  paddingY?: number;
  borderRadius?: number;
}

export function ButtonBlock({
  text = "Klik di sini",
  href = "#",
  background = "#2563eb",
  color = "#ffffff",
  fontSize = 14,
  paddingX = 16,
  paddingY = 8,
  borderRadius = 6,
}: ButtonBlockProps) {
  const {
    connectors: { connect, drag },
    actions: { setProp },
  } = useNode();
  const [editable, setEditable] = useState(false);

  const onChange = useCallback(
    (e: { target: { value: string } }) => {
      setProp((props: ButtonBlockProps) => (props.text = e.target.value));
    },
    [setProp]
  );

  const style: CSSProperties = {
    display: "inline-block",
    background,
    color,
    fontSize,
    padding: `${paddingY}px ${paddingX}px`,
    borderRadius,
    border: "none",
    cursor: "pointer",
    textDecoration: "none",
    fontFamily: "inherit",
  };

  return (
    <div
      ref={(ref) => {
        if (ref) connect(drag(ref));
      }}
      style={{ display: "inline-block" }}
    >
      <ContentEditable
        html={text}
        disabled={!editable}
        onChange={onChange}
        tagName="span"
        onDoubleClick={() => setEditable(true)}
        onBlur={() => setEditable(false)}
        style={{ ...style, outline: "none" }}
      />
      {/* href is stored as a prop for export/AI-edit purposes; the editable
          span above stays a span (not <a>) so double-click-to-edit and
          Moveable don't fight with native link navigation in the canvas. */}
    </div>
  );
}

ButtonBlock.craft = {
  displayName: "Button",
  props: {
    text: "Klik di sini",
    href: "#",
    background: "#2563eb",
    color: "#ffffff",
    fontSize: 14,
    paddingX: 16,
    paddingY: 8,
    borderRadius: 6,
  },
};
