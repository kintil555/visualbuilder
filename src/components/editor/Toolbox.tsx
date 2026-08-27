"use client";

import { useEditor, Element } from "@craftjs/core";
import { Container } from "./user-components/Container";
import { TextBlock } from "./user-components/TextBlock";
import { ImageBlock } from "./user-components/ImageBlock";

export function Toolbox() {
  const { connectors } = useEditor();

  return (
    <div className="p-4 space-y-2 text-sm">
      <div className="font-semibold text-gray-700 mb-2">Komponen</div>
      <div
        ref={(ref) => { if (ref) connectors.create(ref, <Element is={Container} canvas />); }}
        className="border rounded p-2 cursor-move hover:bg-gray-50"
      >
        📦 Container
      </div>
      <div
        ref={(ref) => { if (ref) connectors.create(ref, <TextBlock />); }}
        className="border rounded p-2 cursor-move hover:bg-gray-50"
      >
        🔤 Text
      </div>
      <div
        ref={(ref) => { if (ref) connectors.create(ref, <ImageBlock />); }}
        className="border rounded p-2 cursor-move hover:bg-gray-50"
      >
        🖼️ Image
      </div>
    </div>
  );
}
