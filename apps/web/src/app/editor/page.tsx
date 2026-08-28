"use client";

import { Editor, Frame, Element } from "@craftjs/core";
import { Container } from "@/components/editor/user-components/Container";
import { TextBlock } from "@/components/editor/user-components/TextBlock";
import { ImageBlock } from "@/components/editor/user-components/ImageBlock";
import { ButtonBlock } from "@/components/editor/user-components/ButtonBlock";
import { Section } from "@/components/editor/user-components/Section";
import { VideoBlock } from "@/components/editor/user-components/VideoBlock";
import { RenderNode } from "@/components/editor/RenderNode";
import { Toolbox } from "@/components/editor/Toolbox";
import { LayersPanel } from "@/components/editor/LayersPanel";
import { SettingsPanel } from "@/components/editor/SettingsPanel";
import { UploadPanel } from "@/components/editor/UploadPanel";
import { ExportButton } from "@/components/editor/ExportButton";

export default function EditorPage() {
  return (
    <Editor
      resolver={{ Container, TextBlock, ImageBlock, ButtonBlock, Section, VideoBlock }}
      onRender={RenderNode}
    >
      <div className="flex flex-col h-screen bg-slate-50">
        <header className="flex items-center justify-between px-5 h-14 shrink-0 border-b border-slate-200 bg-white/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600" />
            <span className="font-semibold text-sm text-slate-800 tracking-tight">Visual Builder</span>
          </div>
          <ExportButton />
        </header>
        <div className="flex flex-1 min-h-0">
          <aside className="w-64 shrink-0 border-r border-slate-200 bg-white overflow-y-auto flex flex-col divide-y divide-slate-100">
            <UploadPanel />
            <Toolbox />
            <LayersPanel />
          </aside>
          <main className="flex-1 overflow-auto p-10 bg-[radial-gradient(circle,_#e2e8f0_1px,_transparent_1px)] bg-[size:20px_20px]">
            <div
              className="bg-white shadow-xl shadow-slate-200/60 ring-1 ring-slate-200 mx-auto rounded-lg overflow-hidden animate-canvas-in"
              style={{ width: 1200, minHeight: 800 }}
            >
              <Frame>
                <Element is={Container} canvas width={1200} height={800} background="#ffffff">
                  <TextBlock text="Selamat datang di editor visual" fontSize={24} fontWeight="bold" />
                </Element>
              </Frame>
            </div>
          </main>
          <aside className="w-72 shrink-0 border-l border-slate-200 bg-white overflow-y-auto">
            <SettingsPanel />
          </aside>
        </div>
      </div>
    </Editor>
  );
}
