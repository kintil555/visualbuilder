"use client";

import { useEditor } from "@craftjs/core";

export function SettingsPanel() {
  const { selected, actions } = useEditor((state, query) => {
    const currentNodeId = query.getEvent("selected").first();
    let selected;
    if (currentNodeId) {
      const node = state.nodes[currentNodeId];
      selected = {
        id: currentNodeId,
        name: node.data.displayName,
        settings: node.related?.settings,
        props: node.data.props,
      };
    }
    return { selected };
  });

  if (!selected) {
    return (
      <div className="p-4 text-sm text-gray-400">Pilih elemen di canvas untuk mengedit properti.</div>
    );
  }

  const setProp = (key: string, value: unknown) => {
    actions.setProp(selected.id, (props: Record<string, unknown>) => {
      props[key] = value;
    });
  };

  const p = selected.props as Record<string, unknown>;

  return (
    <div className="p-4 space-y-3 text-sm">
      <div className="font-semibold text-gray-700">{selected.name}</div>

      {"text" in p && (
        <>
          <label className="block">Font Family
            <select className="w-full border rounded p-1" value={p.fontFamily as string} onChange={(e) => setProp("fontFamily", e.target.value)}>
              <option value="Inter, sans-serif">Inter</option>
              <option value="Georgia, serif">Georgia</option>
              <option value="'Courier New', monospace">Courier New</option>
              <option value="'Poppins', sans-serif">Poppins</option>
            </select>
          </label>
          <label className="block">Font Size
            <input type="number" className="w-full border rounded p-1" value={p.fontSize as number} onChange={(e) => setProp("fontSize", Number(e.target.value))} />
          </label>
          <label className="block">Color
            <input type="color" className="w-full h-8" value={p.color as string} onChange={(e) => setProp("color", e.target.value)} />
          </label>
        </>
      )}

      {"src" in p && (
        <label className="block">Image URL
          <input type="text" className="w-full border rounded p-1" value={p.src as string} onChange={(e) => setProp("src", e.target.value)} />
        </label>
      )}

      {"background" in p && (
        <>
          <label className="block">Background
            <input type="color" className="w-full h-8" value={p.background as string} onChange={(e) => setProp("background", e.target.value)} />
          </label>
          <label className="block">Hover Background
            <input type="color" className="w-full h-8" value={(p.hoverBackground as string) || "#f3f4f6"} onChange={(e) => setProp("hoverBackground", e.target.value)} />
          </label>
          <label className="block">Position
            <select className="w-full border rounded p-1" value={p.position as string} onChange={(e) => setProp("position", e.target.value)}>
              <option value="static">Normal</option>
              <option value="sticky">Sticky</option>
              <option value="relative">Relative</option>
            </select>
          </label>
        </>
      )}
    </div>
  );
}
