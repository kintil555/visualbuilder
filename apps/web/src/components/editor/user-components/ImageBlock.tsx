"use client";

import { useNode } from "@craftjs/core";

export interface ImageBlockProps {
  src?: string;
  width?: number;
  height?: number;
  objectFit?: "cover" | "contain" | "fill";
}

export function ImageBlock({
  src = "https://placehold.co/400x300",
  width = 400,
  height = 300,
  objectFit = "cover",
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
      style={{ width, height, objectFit }}
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
  },
};
