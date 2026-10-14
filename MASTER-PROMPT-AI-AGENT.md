# Instruksi untuk AI Coding Agent — Edgefolio Landing Page

Baca dan ikuti seluruh isi `PRD-Edgefolio-Landing-Page.md` sebelum mengubah kode. PRD tersebut adalah sumber kebenaran untuk scope dan acceptance criteria.

Kerjakan sampai semua pekerjaan yang masuk scope PRD selesai:
1. Audit project existing dan cari logo Edgefolio yang telah disediakan di direktori.
2. Implementasikan hanya Hero, Product Preview, dan Footer sesuai konsep Minimalist Premium / Professional Trading: dark charcoal, aksen emerald, tipografi kuat, whitespace luas, animasi halus.
3. Jangan membuat navbar, login/signup, dashboard fungsional, backend, auth, billing, database schema, atau fitur lain di luar PRD.
4. Siapkan Supabase URL dan environment-variable structure secara aman saja. Jangan membuat request data atau mengubah project/database Supabase. Jangan pernah menggunakan/menaruh service-role key di frontend atau commit secret.
5. Jalankan lint, type-check, tests yang tersedia, dan production build. Perbaiki error dan ulangi pemeriksaan yang gagal.
6. Periksa perubahan Git. Jangan menimpa pekerjaan pengguna, jangan commit secret, dan commit/push hanya jika konfigurasi repository tersedia serta pemeriksaan relevan berhasil.
7. Pada akhir pekerjaan, laporkan: ringkasan implementasi, file yang berubah, pengujian yang benar-benar dijalankan beserta hasilnya, status Git/push, dan kendala yang belum selesai.

Jangan berhenti hanya pada analisis atau rencana. Implementasikan PRD sampai tuntas dalam scope yang ditetapkan. Jangan mengklaim hasil test/build/push berhasil jika belum benar-benar berhasil.
