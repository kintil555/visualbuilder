# Visual Builder — Website Layout Editor

Editor visual untuk mengatur layout website (mirip Photoshop/Webflow), dengan target akhir: AI Claude bisa ikut membaca & mengubah layout secara terprogram.

## Status saat ini (checkpoint)

✅ Selesai:
- Scaffold Next.js 16 (App Router) + TypeScript + Tailwind
- Canvas editor pakai **craft.js** (`@craftjs/core`) — drag komponen baru dari Toolbox ke canvas
- Resize & drag pakai **react-moveable**, tahan **Shift** = scale proporsional (lihat `RenderNode.tsx`)
- 3 komponen dasar: `Container` (frame/box, support `position: sticky` + hover background), `TextBlock` (contentEditable, ganti font/size/color), `ImageBlock` (ganti src, object-fit)
- `SettingsPanel` — panel kanan untuk edit props elemen terpilih
- Parser import: `src/lib/importParser.ts` — HTML string → tree JSON, dan ZIP project → banyak tree (pakai `cheerio` + `jszip`)
- **UI upload** — `UploadPanel.tsx` (dropzone + file picker di sidebar kiri), pakai `importedTreeToCraftNodes()` untuk convert `ImportedNode` → format `SerializedNodes` craft.js, lalu `actions.deserialize()`
- **Export HTML** — `ExportButton.tsx` di header, pakai `src/lib/exportHtml.ts` (`craftNodesToHtml`) untuk convert `query.serialize()` → dokumen HTML statis (inline style), lalu download sebagai `.html`
- Build production **sudah lolos** (`npm run build` sukses, tidak ada error SSR)

⏳ Belum dikerjakan (lanjutan):
1. **Integrasi AI Claude** — belum ada API route yang menerima instruksi user (misal "buat tombol jadi biru") lalu memanggil Claude API untuk mengubah JSON tree craft.js secara terprogram (lihat `query.serialize()` dari craft.js sebagai titik masuk)
2. **Auth/persist project** — belum ada database, semua state masih di memory (hilang saat refresh)
3. Komponen masih minim: belum ada Button, Section/Grid, Video, dsb.
4. Import ZIP saat ini hanya ambil file `.html` pertama yang ditemukan (multi-page belum di-handle)
5. Export HTML saat ini single-file inline style; belum ada opsi export CSS terpisah atau ZIP multi-file

## Struktur folder penting

```
src/
  app/
    editor/page.tsx          # halaman utama editor (Toolbox + Canvas + SettingsPanel)
    layout.tsx                # root layout (font Google Fonts SUDAH DIHAPUS, lihat catatan di bawah)
  components/editor/
    Toolbox.tsx                # panel kiri, drag komponen baru
    SettingsPanel.tsx          # panel kanan, edit props node terpilih
    RenderNode.tsx              # wrapper Moveable (resize/drag + shift-scale)
    user-components/
      Container.tsx            # box/frame, support sticky + hover
      TextBlock.tsx             # teks editable
      ImageBlock.tsx            # gambar
  lib/
    importParser.ts            # HTML/ZIP → tree JSON (belum disambung ke UI)
```

## Cara menjalankan

```bash
npm install
npm run dev       # dev server, http://localhost:3000/editor
npm run build     # production build (sudah teruji lolos)
```

## Catatan penting untuk yang melanjutkan

- **Font**: `layout.tsx` awalnya pakai `next/font/google` (Geist), tapi **sengaja dihapus** karena sandbox development tidak punya akses ke `fonts.googleapis.com` → build gagal. Kalau environment lanjutan punya akses internet penuh, boleh dikembalikan atau pakai `next/font/local`.
- **Craft.js sebagai single source of truth**: semua elemen di canvas disimpan sebagai node tree yang bisa di-serialize (`query.serialize()`). Ini fondasi supaya nanti Claude API bisa baca/tulis tree yang sama tanpa perlu parsing DOM.
- **State management**: craft.js `<Editor>` menyimpan state di React context — untuk export/import/AI-edit, ambil lewat `useEditor()` hook (`query.serialize()` untuk baca, `actions.deserialize()` untuk tulis).
- **TypeScript strict mode aktif** — `npx tsc --noEmit` harus tetap bersih setelah perubahan (sempat ada isu tipe `cheerio.Element` yang tidak diekspor, sudah di-fix pakai `AnyNode` dari `domhandler`).
- **Dependencies terpasang**: `@craftjs/core`, `@craftjs/layers` (belum dipakai — untuk panel layer/hierarchy nanti), `react-moveable`, `cheerio`, `jszip`, `react-contenteditable`. `formidable`/`archiver` terpasang tapi belum dipakai (disiapkan untuk upload & export nanti).

## Rencana lanjutan (urutan disarankan)

1. Sambungkan `importParser.ts` ke UI upload (dropzone) + convert `ImportedNode` → craft.js tree otomatis
2. Fungsi export: craft.js tree → HTML/CSS file (pakai serialisasi node + renderer terpisah dari React, atau server-side render lalu ekstrak `outerHTML`)
3. API route `/api/ai-edit` — terima prompt user + `query.serialize()` saat ini → panggil Claude API dengan tool/structured output untuk mengembalikan tree baru → `actions.deserialize()`
4. Tambah komponen: Button, Section (flex/grid container), Video
5. Persist project (localStorage dulu, lalu database kalau perlu multi-user)
