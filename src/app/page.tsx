import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

const FEATURES = [
  {
    icon: "🧱",
    title: "Susun layout dengan drag & drop",
    desc: "Tarik Section, Container, Text, Button, Image, atau Video langsung ke kanvas. Atur ukuran dan posisi dengan handle resize seperti software desain, bukan menulis CSS.",
  },
  {
    icon: "🗂️",
    title: "Kelola elemen lewat Layers",
    desc: "Semua elemen di kanvas tersusun sebagai hierarki yang bisa disusun ulang, diberi nama, diduplikasi, atau dihapus — jadi layout yang kompleks tetap rapi dan gampang dikelola.",
  },
  {
    icon: "🤖",
    title: "Hubungkan Claude lewat MCP",
    desc: "Sambungkan project ke Claude sebagai asisten yang membantu mengatur ulang layout, mengganti teks, atau menyesuaikan style — langsung dari percakapan.",
  },
  {
    icon: "📤",
    title: "Ekspor jadi HTML siap pakai",
    desc: "Saat layout sudah pas, ekspor langsung ke file HTML yang bisa dipakai di mana saja tanpa dependensi tambahan.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Buka Editor",
    desc: "Mulai dari kanvas kosong atau import file .html / .zip yang sudah ada.",
  },
  {
    n: "02",
    title: "Susun & sesuaikan",
    desc: "Drag komponen ke kanvas, geser dan resize secara visual, atur warna, spacing, dan style lewat panel pengaturan.",
  },
  {
    n: "03",
    title: "Hubungkan Claude (opsional)",
    desc: "Buat API token di Pengaturan, sambungkan ke Claude via MCP, dan minta bantuan mengedit layout lewat chat.",
  },
  {
    n: "04",
    title: "Ekspor",
    desc: "Unduh hasil akhirnya sebagai file HTML kapan saja lewat tombol Export.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <SiteHeader />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-20 pt-20 sm:pt-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="inline-block rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">
              Editor layout visual berbasis craft.js
            </span>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
              Susun layout web-mu,{" "}
              <span className="text-blue-600">tanpa nulis kode</span>
            </h1>
            <p className="mt-5 max-w-md text-lg leading-7 text-zinc-500">
              Visual Builder adalah editor drag-and-drop untuk merancang layout halaman web —
              geser, resize, atur style langsung di kanvas, lalu ekspor jadi HTML. Bisa juga
              dibantu Claude lewat koneksi MCP.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/editor"
                className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800"
              >
                Buka Editor
              </Link>
              <Link
                href="/settings"
                className="rounded-full border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              >
                Hubungkan Claude
              </Link>
            </div>
          </div>

          {/* Mock editor canvas — reflects the actual editor UI (frame with
              resize handles), not a generic illustration. */}
          <div className="relative">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 shadow-sm">
              <div className="flex items-center gap-1.5 pb-3">
                <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
              </div>
              <div className="relative rounded-lg border border-dashed border-zinc-300 bg-white p-6">
                <div className="space-y-3">
                  <div className="h-4 w-2/3 rounded bg-zinc-800" />
                  <div className="h-3 w-full rounded bg-zinc-200" />
                  <div className="h-3 w-5/6 rounded bg-zinc-200" />
                  <div className="mt-4 inline-block rounded-full bg-blue-600 px-4 py-2 text-xs font-medium text-white">
                    Tombol Contoh
                  </div>
                </div>
                {/* selection handles, mirrors react-moveable outline */}
                <span className="absolute -left-1.5 -top-1.5 h-3 w-3 rounded-sm border-2 border-blue-600 bg-white" />
                <span className="absolute -right-1.5 -top-1.5 h-3 w-3 rounded-sm border-2 border-blue-600 bg-white" />
                <span className="absolute -bottom-1.5 -left-1.5 h-3 w-3 rounded-sm border-2 border-blue-600 bg-white" />
                <span className="absolute -bottom-1.5 -right-1.5 h-3 w-3 rounded-sm border-2 border-blue-600 bg-white" />
                <span className="pointer-events-none absolute inset-0 rounded-lg border-2 border-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-zinc-100 bg-zinc-50/60">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Semua yang dibutuhkan untuk merancang layout
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-xl border border-zinc-200 bg-white p-6">
                <div className="text-2xl">{f.icon}</div>
                <h3 className="mt-3 font-medium text-zinc-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">Cara kerjanya</h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.n}>
              <div className="text-sm font-mono text-blue-600">{s.n}</div>
              <h3 className="mt-2 font-medium text-zinc-900">{s.title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="border-t border-zinc-100">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-16 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
              Siap mulai menyusun layout?
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              Langsung buka editor, tidak perlu setup tambahan.
            </p>
          </div>
          <Link
            href="/editor"
            className="shrink-0 rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Buka Editor
          </Link>
        </div>
      </section>

      <footer className="border-t border-zinc-100 py-8 text-center text-xs text-zinc-400">
        Visual Builder
      </footer>
    </div>
  );
}
