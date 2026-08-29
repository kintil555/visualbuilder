"use client";

import { useNode } from "@craftjs/core";
import ContentEditable from "react-contenteditable";
import { useState, useCallback } from "react";

export interface TextBlockProps {
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  fontWeight?: string;
  position?: "static" | "absolute";
  top?: number;
  left?: number;
}

export function TextBlock({
  text = "Edit teks ini",
  fontSize = 16,
  fontFamily = "Inter, sans-serif",
  color = "#111827",
  fontWeight = "normal",
  position = "static",
  top = 0,
  left = 0,
}: TextBlockProps) {
  const {
    connectors: { connect, drag },
    actions: { setProp },
  } = useNode();
  const [editable, setEditable] = useState(false);

  const onChange = useCallback(
    (e: { target: { value: string } }) => {
      setProp((props: TextBlockProps) => (props.text = e.target.value));
    },
    [setProp]
  );

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      style={position === "absolute" ? { position: "absolute", top, left } : undefined}
    >
      <ContentEditable
        html={text}
        disabled={!editable}
        onChange={onChange}
        tagName="p"
        onDoubleClick={() => setEditable(true)}
        onBlur={() => setEditable(false)}
        style={{ fontSize, fontFamily, color, fontWeight, outline: "none", margin: 0 }}
      />
    </div>
  );
}

TextBlock.craft = {
  displayName: "Text",
  props: {
    text: "Edit teks ini",
    fontSize: 16,
    fontFamily: "Inter, sans-serif",
    color: "#111827",
    fontWeight: "normal",
    position: "static",
    top: 0,
    left: 0,
  },
};
