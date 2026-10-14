# Edgefolio — Landing Page PRD

**Dokumen:** Product Requirements Document (PRD)  
**Produk:** Edgefolio  
**Versi:** 1.0  
**Status:** Siap dikerjakan oleh AI coding agent  
**Scope:** Landing page frontend saja  
**Stack:** Next.js, TypeScript, Supabase (koneksi awal saja)  

---

## 1. Ringkasan Produk

Edgefolio adalah konsep platform trading journal untuk membantu trader mencatat dan mengevaluasi performa trading. Pada tahap ini, yang dibuat hanya landing page publik dengan tiga bagian: **Hero**, **Product Preview**, dan **Footer**.

Landing page harus menyampaikan karakter brand Edgefolio: premium, minimalis, modern, dan relevan dengan trading analytics. Website harus responsif untuk desktop, tablet, dan ponsel.

## 2. Tujuan

1. Membuat landing page Edgefolio yang terlihat profesional dan konsisten dengan konsep visual yang telah dipilih.
2. Menampilkan identitas brand menggunakan logo Edgefolio yang sudah disediakan di dalam direktori project.
3. Menjelaskan nilai produk secara singkat melalui hero dan product preview.
4. Menyediakan satu CTA utama: **Get Started**.
5. Menyiapkan konfigurasi koneksi Supabase dengan aman, tanpa membangun backend, autentikasi, database schema, atau fitur dinamis pada tahap ini.
6. Menyelesaikan seluruh item PRD, menjalankan pemeriksaan yang tersedia, dan memperbaiki masalah sebelum menyatakan pekerjaan selesai.

## 3. Di Luar Scope

Jangan membangun hal berikut kecuali diminta secara eksplisit di kemudian hari:

- Dashboard aplikasi yang berfungsi.
- Registrasi, login, logout, reset password, atau Supabase Auth flow.
- Backend, API routes, server actions, Edge Functions, atau business logic.
- Membuat atau mengubah tabel/database schema, migration, trigger, atau RLS policies.
- CRUD trade, trading journal, analytics langsung, kalender, strategi, atau CSV import.
- Sistem trial 30 hari, billing, subscription, payment gateway, atau pricing page.
- Admin CMS atau admin dashboard.
- Navbar.
- Tombol Sign In, Login, Sign Up, atau CTA tambahan.
- Section tambahan seperti pricing, testimonials, FAQ, blog, atau fitur panjang.
- Integrasi broker/exchange.
- Mengarang data produk seolah-olah berasal dari pengguna nyata.

## 4. Target Pengguna dan Pesan

**Target:** trader Forex, Crypto, Stocks, Indices, dan instrumen lain yang ingin mengembangkan kebiasaan evaluasi trading.

**Pesan utama:** Edgefolio membantu trader meninjau trading mereka dengan lebih terstruktur.

Contoh copy hero (boleh dipoles tanpa mengubah makna):
- Eyebrow opsional: `TRADING JOURNAL, REDEFINED`
- Headline: `Your Trading Edge Starts Here.`
- Deskripsi: `Track your trades, understand your performance, and make every decision more intentional.`
- CTA: `Get Started`

Jaga copy tetap singkat. Hindari klaim profit, janji hasil finansial, atau jaminan performa.

## 5. Konsep Visual

### 5.1 Arah desain

**Minimalist Premium** dengan sentuhan **Professional Trading**:
- Premium, bersih, percaya diri, dan modern.
- Latar dominan charcoal/hitam.
- Aksen emerald/hijau trading yang digunakan secara terukur.
- Tipografi besar dan jelas dengan hirarki yang kuat.
- Whitespace luas dan komposisi rapi.
- Garis, grid, atau detail chart halus bila membantu.
- Hindari UI yang terlalu ramai, glow berlebihan, dekorasi acak, dan glassmorphism berlebihan.

### 5.2 Warna

Gunakan token CSS terpusat agar mudah disesuaikan. Nilai berikut adalah titik awal, bukan aturan kaku:
- Background utama: `#080B0A` atau charcoal sangat gelap.
- Surface: `#101513`.
- Text utama: `#F4F7F5`.
- Text sekunder: `#A0AAA4`.
- Aksen emerald: `#16C784` atau variasi emerald yang konsisten.
- Border halus: putih dengan opacity rendah.

Pastikan kontras teks memenuhi aksesibilitas yang wajar. Jangan menggunakan warna hijau untuk semua teks; gunakan sebagai aksen.

### 5.3 Tipografi

- Gunakan sans-serif modern yang sudah tersedia dalam project atau font loading Next.js yang sesuai.
- Buat headline hero menonjol dengan line-height dan max-width yang rapi.
- Body text harus mudah dibaca di layar kecil.
- Hindari terlalu banyak keluarga font dan variasi weight.

### 5.4 Motion

- Animasi halus dan singkat untuk elemen hero, CTA, dan preview bila sesuai.
- Gunakan CSS transitions sederhana; jangan menambahkan library animasi baru kecuali memang sudah tersedia dan benar-benar diperlukan.
- Hormati `prefers-reduced-motion`.
- Jangan membuat animasi yang mengganggu, berat, atau menyebabkan layout shift.

## 6. Struktur Halaman

Landing page hanya mempunyai tiga bagian, dalam urutan berikut.

### 6.1 Hero

**Wajib:**
- Tidak ada navbar.
- Tidak ada menu navigasi di bagian atas.
- Tidak ada tombol Login, Sign In, atau Sign Up.
- Headline, deskripsi pendek, dan satu tombol `Get Started`.
- Logo boleh ditampilkan sebagai elemen brand di hero jika sesuai komposisi; gunakan asset logo yang tersedia di direktori project.
- Komposisi kuat dan sederhana; CTA harus mudah ditemukan.
- Bisa memakai aksen visual abstrak yang relevan dengan data/trading, tetapi jangan sampai mengalahkan headline.

**Perilaku CTA:**
- Untuk tahap frontend-only, tombol boleh diarahkan ke route placeholder yang sudah ada jika route itu benar-benar tersedia.
- Jika belum ada route dashboard/auth, gunakan perilaku placeholder yang jujur dan sederhana, atau nonaktifkan CTA dengan penjelasan yang jelas. Jangan membuat halaman login/dashboard palsu.
- Jangan mengklaim bahwa registrasi, login, atau dashboard sudah berfungsi.
- Pisahkan destination CTA ke konstanta/config agar mudah diubah nanti.

### 6.2 Product Preview

**Tujuan:** memberikan gambaran visual tentang aplikasi yang akan dibuat di masa mendatang.

**Wajib:**
- Visual preview dashboard trading journal yang terlihat kredibel dan sejalan dengan brand.
- Bisa berupa mockup frontend statis yang dibuat dari komponen lokal, CSS, SVG, atau asset lokal.
- Menampilkan contoh elemen seperti equity curve, metrik performa, win rate, dan ringkasan trade hanya sebagai data demonstrasi.
- Beri penanda yang sesuai jika diperlukan agar data demo tidak disalahartikan sebagai data nyata.
- Mockup tidak harus interaktif dan tidak boleh mengambil data dari Supabase.
- Pastikan layout mockup tetap terbaca di mobile; boleh menyederhanakan atau mengubah komposisi pada layar kecil.
- Jangan gunakan gambar yang tidak relevan dengan trading journal.

### 6.3 Footer

**Wajib:**
- Sederhana dan minimal.
- Identitas/wordmark Edgefolio menggunakan asset logo yang tersedia jika sesuai.
- Copyright dengan tahun dinamis bila implementasi yang ada mendukungnya.
- Tautan kebijakan hanya jika halaman tujuan benar-benar tersedia. Jangan membuat link mati.
- Tidak ada CTA tambahan dan tidak ada navbar duplikat.

## 7. Interaksi dan Responsivitas

- Seluruh halaman harus responsif pada ponsel, tablet, laptop, dan desktop.
- Tidak boleh ada horizontal overflow pada viewport umum.
- CTA harus punya hover, focus, active, dan disabled state jika relevan.
- Navigasi keyboard harus berfungsi.
- Focus indicator harus terlihat.
- Gunakan semantic HTML: `main`, `section`, `footer`, heading yang berurutan, dan button/link yang sesuai.
- Semua gambar memiliki alt yang sesuai; dekorasi murni memakai alt kosong.
- Hormati `prefers-reduced-motion`.
- Hindari layout shift dan ukuran gambar yang tidak ditentukan.

## 8. Persyaratan Next.js

1. Periksa terlebih dahulu struktur, versi Next.js, package manager, scripts, dependensi, dan pola coding yang sudah ada.
2. Pertahankan project yang sudah ada; jangan membuat ulang project atau mengganti framework tanpa alasan dan persetujuan.
3. Gunakan App Router atau Pages Router sesuai struktur existing.
4. Gunakan TypeScript jika project sudah menggunakannya atau setup saat ini memang TypeScript.
5. Gunakan komponen reusable dan CSS yang konsisten dengan sistem styling existing.
6. Jangan memasang package tambahan jika fitur bisa dibuat dengan teknologi yang sudah ada.
7. Jangan melakukan refactor luas di luar kebutuhan landing page.
8. Jangan menambahkan file dokumentasi tambahan yang tidak dibutuhkan.
9. Pastikan metadata dasar halaman (title dan description) sesuai Edgefolio.
10. Pastikan tidak ada error hydration, React key warnings, console errors, atau broken assets yang ditemukan saat pengujian.

## 9. Persyaratan Supabase — Koneksi Awal Saja

URL project Supabase yang diberikan:
`https://vzpqpxlatshisunzftop.supabase.co`

REST API URL yang diberikan:
`https://vzpqpxlatshisunzftop.supabase.co/rest/v1/`

**Batas penting:** Supabase hanya disiapkan sebagai koneksi awal untuk tahap ini. Jangan membangun backend atau mengakses/mengubah data aplikasi.

### 9.1 Yang boleh dilakukan

- Periksa apakah Supabase package sudah ada.
- Jika belum ada dan memang diperlukan untuk menyiapkan koneksi client, tambahkan `@supabase/supabase-js` dengan versi kompatibel dengan project.
- Buat konfigurasi client minimal yang tidak dipakai oleh landing page untuk mengambil data.
- Gunakan environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL=https://vzpqpxlatshisunzftop.supabase.co`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY=` (pemilik project mengisi sendiri dengan publishable/anon key dari Supabase dashboard)
- Sediakan `.env.example` hanya jika sesuai struktur project, dan jangan pernah memasukkan nilai key nyata ke file tersebut.
- Dokumentasikan secara ringkas di README yang sudah ada atau catatan setup minimal bagaimana mengisi environment variable, tanpa membuat dokumentasi berlebihan.
- Bila key belum tersedia, landing page tetap harus bisa dibangun dan berjalan karena frontend tidak perlu melakukan query Supabase.

### 9.2 Yang tidak boleh dilakukan

- Jangan meminta, menebak, atau mengarang API key.
- Jangan menaruh `service_role` key, secret key, atau kredensial server di variable `NEXT_PUBLIC_*`.
- Jangan mengirimkan key rahasia ke browser atau commit key ke Git.
- Jangan melakukan insert, update, delete, atau query data.
- Jangan membuat tabel, migration, trigger, RLS policy, Edge Function, auth provider, signup, atau login.
- Jangan menyatakan koneksi sudah diverifikasi jika belum diuji.
- Jangan mengubah pengaturan project Supabase atau database yang ada.
- Jangan menggunakan REST URL sebagai pengganti Supabase project URL untuk inisialisasi SDK. Gunakan project URL `https://vzpqpxlatshisunzftop.supabase.co`; endpoint REST `/rest/v1/` dikelola oleh SDK bila nanti diperlukan.

**Catatan keamanan:** URL project bukan secret, tetapi key tetap harus dikelola sesuai jenisnya. Publishable/anon key dapat digunakan di frontend hanya dengan kebijakan akses database yang aman saat fitur data dibangun nanti. Karena belum ada backend/data feature pada scope ini, tidak perlu mengirim request ke Supabase.

## 10. Aksesibilitas dan Kualitas

- Kontras teks yang memadai.
- Semua kontrol dapat diakses dengan keyboard.
- Jangan hanya memakai warna untuk menyampaikan makna.
- Ukuran tap target yang masuk akal pada mobile.
- Tidak ada teks terpotong, elemen bertumpuk, atau CTA yang tertutup.
- Gunakan format gambar efisien dan ukuran yang sesuai.
- Hindari library yang tidak diperlukan.
- Jangan menggunakan logo/brand lain sebagai identitas Edgefolio.

## 11. Penggunaan Logo yang Disediakan

- Cari logo yang telah disediakan pengguna di direktori project sebelum membuat atau mengganti asset.
- Periksa folder yang wajar seperti `public/`, `public/images/`, `public/brand/`, `assets/`, atau direktori terkait yang memang sudah ada.
- Gunakan asset logo Edgefolio yang ditemukan; jangan menggambar ulang atau mengganti logo dengan teks generik tanpa alasan.
- Jangan menebak nama/path file. Verifikasi file yang benar-benar tersedia.
- Pastikan logo tampil tajam, proporsional, dan sesuai latar gelap.
- Jika ada beberapa versi logo, pilih versi yang paling cocok untuk latar gelap dan gunakan konsisten.
- Jangan menghapus atau memindahkan asset yang sudah ada tanpa kebutuhan yang jelas.

## 12. Testing dan Definition of Done

PRD dianggap selesai hanya jika semua hal yang relevan di bawah sudah diperiksa:

### Visual dan fungsi
- [ ] Landing page berisi hanya Hero, Product Preview, dan Footer.
- [ ] Tidak ada navbar.
- [ ] Tidak ada Sign In, Login, Sign Up, atau CTA tambahan.
- [ ] CTA utama bertuliskan `Get Started`.
- [ ] Logo dari direktori project digunakan.
- [ ] Mockup product preview relevan dan responsif.
- [ ] Footer minimal dan tidak memiliki link mati.
- [ ] Layout diuji pada ukuran mobile, tablet, dan desktop.
- [ ] Tidak ada horizontal overflow yang ditemukan.

### Implementasi
- [ ] Struktur project existing dipertahankan.
- [ ] Tidak ada backend, auth, billing, atau dashboard fungsional yang dibuat.
- [ ] Supabase URL dan env setup disiapkan dengan aman.
- [ ] Tidak ada secret yang masuk ke Git.
- [ ] Tidak ada dependency yang tidak diperlukan.

### Verifikasi
- [ ] Jalankan lint sesuai script yang tersedia.
- [ ] Jalankan type-check jika script tersedia.
- [ ] Jalankan test jika test suite tersedia dan relevan.
- [ ] Jalankan production build.
- [ ] Perbaiki error yang ditemukan dan jalankan ulang pemeriksaan yang gagal.
- [ ] Periksa console/log untuk error yang dapat diverifikasi.
- [ ] Jangan menyatakan pengujian lulus jika tidak dijalankan atau gagal.
- [ ] Ringkas file yang diubah, perintah yang dijalankan, hasilnya, dan kendala yang masih tersisa.

### Git
- [ ] Periksa status dan remote repository sebelum melakukan perubahan Git.
- [ ] Jangan menghapus atau menimpa pekerjaan pengguna.
- [ ] Jangan commit `.env`, secret, build output, atau file sensitif.
- [ ] Commit dan push hanya jika repository dan autentikasi memang sudah dikonfigurasi, seluruh pemeriksaan yang relevan berhasil, dan perubahan aman untuk dipush.
- [ ] Jika push gagal, laporkan error yang sebenarnya dan jangan mengklaim berhasil.

## 13. Cara Kerja AI Agent

Kerjakan PRD secara berurutan:

1. Audit project existing dan temukan logo.
2. Buat daftar singkat kondisi awal serta risiko sebelum mengubah file.
3. Implementasikan Hero.
4. Implementasikan Product Preview.
5. Implementasikan Footer.
6. Siapkan Supabase client/env setup minimal yang aman tanpa request data.
7. Uji responsivitas dan aksesibilitas.
8. Jalankan lint, type-check, tests yang tersedia, dan production build.
9. Perbaiki seluruh error yang ditemukan lalu uji ulang.
10. Periksa diff, status Git, dan secret sebelum commit/push jika diizinkan konfigurasi repository.

Jangan berhenti setelah membuat desain awal. Selesaikan semua item PRD yang dapat diselesaikan dalam scope ini. Jika ada prasyarat yang tidak tersedia (misalnya logo, env key, script test, atau konfigurasi Git), jangan mengarangnya; lanjutkan bagian yang tidak terblokir dan laporkan prasyarat tersebut secara jelas.

**Prioritas utama:** kualitas landing page, kesesuaian dengan konsep yang disepakati, tidak ada error yang dapat diverifikasi, dan tidak melampaui scope frontend-only.
