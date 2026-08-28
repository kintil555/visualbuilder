"use client";

import { useEditor } from "@craftjs/core";
import { ReactNode } from "react";

type Props = Record<string, unknown>;
type SetProp = (key: string, value: unknown) => void;

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-gray-600 mb-1">{label}</span>
      {children}
    </label>
  );
}

const inputClass = "w-full border rounded p-1";
const colorClass = "w-full h-8";

function NumberField({ label, value, onChange, min }: { label: string; value: number; onChange: (v: number) => void; min?: number }) {
  return (
    <Field label={label}>
      <input type="number" className={inputClass} min={min} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </Field>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <Field label={label}>
      <input type="color" className={colorClass} value={value} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <Field label={label}>
      <input type="text" className={inputClass} value={value} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: [string, string][]; onChange: (v: string) => void }) {
  return (
    <Field label={label}>
      <select className={inputClass} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map(([val, text]) => (
          <option key={val} value={val}>{text}</option>
        ))}
      </select>
    </Field>
  );
}

function CheckboxField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="text-gray-600">{label}</span>
    </label>
  );
}

const FONT_OPTIONS: [string, string][] = [
  ["Inter, sans-serif", "Inter"],
  ["Georgia, serif", "Georgia"],
  ["'Courier New', monospace", "Courier New"],
  ["'Poppins', sans-serif", "Poppins"],
];

function TextSettings({ p, setProp }: { p: Props; setProp: SetProp }) {
  return (
    <>
      <SelectField label="Font Family" value={p.fontFamily as string} options={FONT_OPTIONS} onChange={(v) => setProp("fontFamily", v)} />
      <NumberField label="Font Size" value={p.fontSize as number} onChange={(v) => setProp("fontSize", v)} />
      <ColorField label="Color" value={p.color as string} onChange={(v) => setProp("color", v)} />
      <SelectField
        label="Font Weight"
        value={(p.fontWeight as string) || "normal"}
        options={[["normal", "Normal"], ["bold", "Bold"]]}
        onChange={(v) => setProp("fontWeight", v)}
      />
    </>
  );
}

function ButtonSettings({ p, setProp }: { p: Props; setProp: SetProp }) {
  return (
    <>
      <TextField label="Link (href)" value={p.href as string} onChange={(v) => setProp("href", v)} />
      <NumberField label="Font Size" value={p.fontSize as number} onChange={(v) => setProp("fontSize", v)} />
      <ColorField label="Background" value={p.background as string} onChange={(v) => setProp("background", v)} />
      <ColorField label="Text Color" value={p.color as string} onChange={(v) => setProp("color", v)} />
      <NumberField label="Padding X" value={p.paddingX as number} onChange={(v) => setProp("paddingX", v)} min={0} />
      <NumberField label="Padding Y" value={p.paddingY as number} onChange={(v) => setProp("paddingY", v)} min={0} />
      <NumberField label="Border Radius" value={p.borderRadius as number} onChange={(v) => setProp("borderRadius", v)} min={0} />
    </>
  );
}

function ImageSettings({ p, setProp }: { p: Props; setProp: SetProp }) {
  return (
    <>
      <TextField label="Image URL" value={p.src as string} onChange={(v) => setProp("src", v)} />
      <NumberField label="Width" value={p.width as number} onChange={(v) => setProp("width", v)} min={1} />
      <NumberField label="Height" value={p.height as number} onChange={(v) => setProp("height", v)} min={1} />
      <SelectField
        label="Object Fit"
        value={p.objectFit as string}
        options={[["cover", "Cover"], ["contain", "Contain"], ["fill", "Fill"]]}
        onChange={(v) => setProp("objectFit", v)}
      />
    </>
  );
}

function VideoSettings({ p, setProp }: { p: Props; setProp: SetProp }) {
  return (
    <>
      <TextField label="Video URL" value={p.src as string} onChange={(v) => setProp("src", v)} />
      <NumberField label="Width" value={p.width as number} onChange={(v) => setProp("width", v)} min={1} />
      <NumberField label="Height" value={p.height as number} onChange={(v) => setProp("height", v)} min={1} />
      <CheckboxField label="Tampilkan kontrol" checked={p.controls as boolean} onChange={(v) => setProp("controls", v)} />
      <CheckboxField label="Autoplay" checked={p.autoPlay as boolean} onChange={(v) => setProp("autoPlay", v)} />
      <CheckboxField label="Loop" checked={p.loop as boolean} onChange={(v) => setProp("loop", v)} />
    </>
  );
}

function ContainerSettings({ p, setProp }: { p: Props; setProp: SetProp }) {
  return (
    <>
      <ColorField label="Background" value={p.background as string} onChange={(v) => setProp("background", v)} />
      <ColorField label="Hover Background" value={(p.hoverBackground as string) || "#f3f4f6"} onChange={(v) => setProp("hoverBackground", v)} />
      <NumberField label="Padding" value={p.padding as number} onChange={(v) => setProp("padding", v)} min={0} />
      <NumberField label="Margin" value={p.margin as number} onChange={(v) => setProp("margin", v)} min={0} />
      <NumberField label="Border Radius" value={p.borderRadius as number} onChange={(v) => setProp("borderRadius", v)} min={0} />
      <CheckboxField label="Shadow" checked={!!p.boxShadow} onChange={(v) => setProp("boxShadow", v)} />
      <SelectField
        label="Position"
        value={p.position as string}
        options={[["static", "Normal"], ["sticky", "Sticky"], ["relative", "Relative"]]}
        onChange={(v) => setProp("position", v)}
      />
      {p.position === "sticky" && (
        <NumberField label="Top (sticky)" value={p.top as number} onChange={(v) => setProp("top", v)} />
      )}
    </>
  );
}

function SectionSettings({ p, setProp }: { p: Props; setProp: SetProp }) {
  const isFlex = p.display !== "grid";
  return (
    <>
      <SelectField
        label="Layout"
        value={p.display as string}
        options={[["flex", "Flex"], ["grid", "Grid"]]}
        onChange={(v) => setProp("display", v)}
      />
      {isFlex ? (
        <>
          <SelectField
            label="Arah"
            value={p.direction as string}
            options={[["row", "Horizontal"], ["column", "Vertikal"]]}
            onChange={(v) => setProp("direction", v)}
          />
          <SelectField
            label="Justify"
            value={p.justify as string}
            options={[
              ["flex-start", "Awal"],
              ["center", "Tengah"],
              ["flex-end", "Akhir"],
              ["space-between", "Space Between"],
              ["space-around", "Space Around"],
            ]}
            onChange={(v) => setProp("justify", v)}
          />
          <SelectField
            label="Align"
            value={p.align as string}
            options={[["flex-start", "Awal"], ["center", "Tengah"], ["flex-end", "Akhir"], ["stretch", "Stretch"]]}
            onChange={(v) => setProp("align", v)}
          />
        </>
      ) : (
        <NumberField label="Jumlah Kolom" value={p.columns as number} onChange={(v) => setProp("columns", v)} min={1} />
      )}
      <NumberField label="Gap" value={p.gap as number} onChange={(v) => setProp("gap", v)} min={0} />
      <NumberField label="Padding" value={p.padding as number} onChange={(v) => setProp("padding", v)} min={0} />
      <NumberField label="Min Height" value={p.minHeight as number} onChange={(v) => setProp("minHeight", v)} min={0} />
      <ColorField label="Background" value={p.background as string} onChange={(v) => setProp("background", v)} />
    </>
  );
}

export function SettingsPanel() {
  const { selected, actions } = useEditor((state, query) => {
    const currentNodeId = query.getEvent("selected").first();
    let selected;
    if (currentNodeId) {
      const node = state.nodes[currentNodeId];
      selected = {
        id: currentNodeId,
        name: node.data.displayName,
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

  const setProp: SetProp = (key, value) => {
    actions.setProp(selected.id, (props: Record<string, unknown>) => {
      props[key] = value;
    });
  };

  const p = selected.props as Props;

  return (
    <div className="p-4 space-y-3 text-sm">
      <div className="font-semibold text-gray-700">{selected.name}</div>

      {selected.name === "Text" && <TextSettings p={p} setProp={setProp} />}
      {selected.name === "Button" && <ButtonSettings p={p} setProp={setProp} />}
      {selected.name === "Image" && <ImageSettings p={p} setProp={setProp} />}
      {selected.name === "Video" && <VideoSettings p={p} setProp={setProp} />}
      {selected.name === "Container" && <ContainerSettings p={p} setProp={setProp} />}
      {selected.name === "Section" && <SectionSettings p={p} setProp={setProp} />}
    </div>
  );
}
