"use client";

import { useEditor, Element } from "@craftjs/core";
import { Container } from "./user-components/Container";
import { TextBlock } from "./user-components/TextBlock";
import { ImageBlock } from "./user-components/ImageBlock";
import { ButtonBlock } from "./user-components/ButtonBlock";
import { Section } from "./user-components/Section";
import { VideoBlock } from "./user-components/VideoBlock";

export function Toolbox() {
  const { connectors } = useEditor();

  const items = [
    { icon: "📦", label: "Container", el: <Element is={Container} canvas /> },
    { icon: "🧱", label: "Section (flex/grid)", el: <Element is={Section} canvas /> },
    { icon: "🔤", label: "Text", el: <TextBlock /> },
    { icon: "🔘", label: "Button", el: <ButtonBlock /> },
    { icon: "🖼️", label: "Image", el: <ImageBlock /> },
    { icon: "🎬", label: "Video", el: <VideoBlock /> },
  ];

  return (
    <div className="p-4">
      <div className="font-semibold text-xs uppercase tracking-wide text-slate-400 mb-2">Komponen</div>
      <div className="grid grid-cols-2 gap-2">
        {items.map(({ icon, label, el }) => (
          <div
            key={label}
            ref={(ref) => { if (ref) connectors.create(ref, el); }}
            className="flex flex-col items-center justify-center gap-1 rounded-lg border border-slate-200 bg-slate-50/50 py-3 px-2 text-center cursor-grab active:cursor-grabbing text-slate-600 text-xs transition-all duration-150 hover:border-indigo-300 hover:bg-indigo-50 hover:-translate-y-0.5 hover:shadow-sm"
          >
            <span className="text-base leading-none">{icon}</span>
            <span className="leading-tight">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
