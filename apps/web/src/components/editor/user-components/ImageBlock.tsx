"use client";

import { useNode } from "@craftjs/core";

export interface ImageBlockProps {
  src?: string;
  width?: number;
  height?: number;
  objectFit?: "cover" | "contain" | "fill";
  borderRadius?: number;
  position?: "static" | "absolute";
  top?: number;
  left?: number;
}

export function ImageBlock({
  src = "https://placehold.co/400x300",
  width = 400,
  height = 300,
  objectFit = "cover",
  borderRadius = 0,
  position = "static",
  top = 0,
  left = 0,
}: ImageBlockProps) {
  const {
    connectors: { connect, drag },
  } = useNode();

  return (
    <img
      ref={(ref) => {
        if (ref) connect(drag(ref));
      }}
      src={src}
      alt=""
      style={{
        width,
        height,
        objectFit,
        borderRadius,
        position: position === "absolute" ? "absolute" : undefined,
        top: position === "absolute" ? top : undefined,
        left: position === "absolute" ? left : undefined,
      }}
      draggable={false}
    />
  );
}

ImageBlock.craft = {
  displayName: "Image",
  props: {
    src: "https://placehold.co/400x300",
    width: 400,
    height: 300,
    objectFit: "cover",
    borderRadius: 0,
    position: "static",
    top: 0,
    left: 0,
  },
};
