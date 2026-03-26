# Project Implementation Plan: ElysiaJS + Drizzle + MySQL with Bun

Dokumen ini berisi instruksi tingkat tinggi (high-level) untuk menginisialisasi dan mengatur proyek backend baru. Silakan ikuti langkah-langkah di bawah ini untuk mengimplementasikan proyek.

## 1. Inisialisasi Proyek
- Buat dan inisialisasi proyek baru menggunakan **Bun** di root folder ini (`bun init`).
- Pastikan pengaturan proyek menggunakan TypeScript.

## 2. Instalasi Dependensi
- Instal framework web **ElysiaJS**.
- Instal **Drizzle ORM** dan dependensi CLI terkait (`drizzle-kit`).
- Instal driver/klien **MySQL** yang kompatibel dengan Bun/Drizzle (misalnya `mysql2`).

## 3. Konfigurasi Database (Drizzle & MySQL)
- Buat file `.env` untuk menyimpan string koneksi database MySQL.
- Buat konfigurasi untuk Drizzle (`drizzle.config.ts`).
- Siapkan direktori untuk skema database dan buat satu skema tabel dasar (contoh: tabel `users`) untuk memverifikasi koneksi.
- Tambahkan skrip pada `package.json` untuk menjalankan migrasi Drizzle (generate dan push) serta Drizzle Studio.

## 4. Setup Aplikasi Elysia
- Buat file entry point aplikasi (misalnya `src/index.ts`).
- Inisialisasi instance ElysiaJS.
- Buat koneksi database menggunakan Drizzle dan hubungkan ke aplikasi.
- Buat endpoint dasar (misalnya `GET /`) untuk memastikan server berjalan dengan baik.

## 5. Verifikasi & Pengujian
- Jalankan server menggunakan mode watch/dev pada Bun (`bun run --watch src/index.ts`).
- Pastikan endpoint dapat diakses dan database dapat dikueri tanpa error.
