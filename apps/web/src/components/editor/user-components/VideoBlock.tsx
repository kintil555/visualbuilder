"use client";

import { useNode } from "@craftjs/core";

export interface VideoBlockProps {
  src?: string;
  width?: number;
  height?: number;
  controls?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
}

function isEmbedUrl(src: string) {
  return /youtube\.com|youtu\.be|vimeo\.com/.test(src);
}

function toEmbedUrl(src: string) {
  const yt = src.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([\w-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = src.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return src;
}

export function VideoBlock({
  src = "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  width = 480,
  height = 270,
  controls = true,
  autoPlay = false,
  loop = false,
}: VideoBlockProps) {
  const {
    connectors: { connect, drag },
  } = useNode();

  return (
    <div
      ref={(ref) => {
        if (ref) connect(drag(ref));
      }}
      style={{ width, height }}
    >
      {isEmbedUrl(src) ? (
        <iframe
          src={toEmbedUrl(src)}
          width={width}
          height={height}
          style={{ border: 0 }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <video
          src={src}
          width={width}
          height={height}
          controls={controls}
          autoPlay={autoPlay}
          loop={loop}
          muted={autoPlay}
        />
      )}
    </div>
  );
}

VideoBlock.craft = {
  displayName: "Video",
  props: {
    src: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    width: 480,
    height: 270,
    controls: true,
    autoPlay: false,
    loop: false,
  },
};
