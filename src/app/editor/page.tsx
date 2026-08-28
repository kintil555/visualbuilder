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
      <div className="flex flex-col h-screen">
        <header className="flex items-center justify-between px-4 py-2 border-b bg-white">
          <span className="font-semibold text-sm text-gray-700">Visual Builder</span>
          <ExportButton />
        </header>
        <div className="flex flex-1 min-h-0">
          <aside className="w-56 border-r overflow-y-auto">
            <UploadPanel />
            <Toolbox />
            <LayersPanel />
          </aside>
          <main className="flex-1 overflow-auto bg-gray-100 p-8">
            <div className="bg-white shadow mx-auto" style={{ width: 1200, minHeight: 800 }}>
              <Frame>
                <Element is={Container} canvas width={1200} height={800} background="#ffffff">
                  <TextBlock text="Selamat datang di editor visual" fontSize={24} fontWeight="bold" />
                </Element>
              </Frame>
            </div>
          </main>
          <aside className="w-64 border-l overflow-y-auto">
            <SettingsPanel />
          </aside>
        </div>
      </div>
    </Editor>
  );
}
