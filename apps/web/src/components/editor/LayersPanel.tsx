"use client";

import { Layers } from "@craftjs/layers";

export function LayersPanel() {
  return (
    <div className="border-t">
      <div className="px-4 pt-4 pb-2 font-semibold text-gray-700 text-sm">Layer</div>
      <div className="px-2 pb-4 text-sm layers-panel">
        <Layers expandRootOnLoad />
      </div>
    </div>
  );
}
