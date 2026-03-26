# Implementasi Autentikasi Menggunakan Session (Migrasi dari JWT)

Dokumen ini berisi spesifikasi dan tahapan implementasi untuk mentransisikan mekanisme autentikasi pada API yang sudah ada, dari menggunakan **JWT** menjadi menggunakan **Session berbasis Database**. Perencanaan ini dirancang agar mudah diikuti secara runtut oleh _junior programmer_ atau *model AI*.

## 1. Spesifikasi Database Tambahan

Buat tabel `sessions` untuk menyimpan data sesi login pengguna (sebagai pengganti Token JWT mandiri) dengan skema berikut:

| Nama Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | `integer` | Primary Key, Auto Increment |
| `user_id` | `integer` | Not Null (Sebaiknya diset sebagai *Foreign Key* ke tabel `users`) |
| `token` | `varchar(255)` | Not Null, Unique (Token sesi yang digenerate acak) |
| `created_at` | `timestamp` | Default: `CURRENT_TIMESTAMP` |

---

## 2. Spesifikasi Perubahan API

Mekanisme Autentikasi yang pada awalnya menggunakan JWT akan sepenuhnya digantikan dengan pengecekan baris record dari tabel `sessions`. Berikut adalah rincian interaksi pada API yang sudah ada:

### A. Registrasi User Baru (`POST /api/register`)
- **Perubahan:** Tidak ada perubahan pada bagian registrasi user. Pengguna tetap didaftarkan dan password tetap di-*hash* menggunakan bcrypt.

### B. Login User (`POST /api/login`)
- **Perubahan Logic:** 
  1. Setelah pengecekan email dan pencocokan password berhasil, sistem **tidak lagi men-generate JWT**.
  2. Sistem diwajibkan melakukan *generate random string* yang aman (misalnya fungsi hash, `crypto.randomUUID()`, atau string acak base64 sepanjang minimal 32-karakter). String ini akan menjadi **Session Token**.
  3. Lakukan **INSERT** ke dalam tabel `sessions` untuk menyimpan kombinasi `user_id` dari user yang berhasil login dengan `token` sesi yang baru dibuat.
- **Response:**
  Mengembalikan session token pada JSON response.
  ```json
  {
      "message": "User logged in successfully",
      "data": {
          "id": 1,
          "name": "John Doe",
          "email": "[EMAIL_ADDRESS]",
          "created_at": "...",
          "token": "4f92d8a5e1b3c7... (Session Token Acak)" 
      }
  }
  ```

### C. Mendapatkan Semua User (`GET /api/users`)
- **Perubahan Verifikasi Otentikasi:**
  1. *Middlewares/Hooks* tidak lagi melakukan *decoding* JWT.
  2. Sistem akan membaca token sesi dari header `Authorization: Bearer <SESSION_TOKEN>`. 
  3. Lakukan validasi **query ke database** (tabel `sessions`) untuk mencari apakah parameter `<SESSION_TOKEN>` tersebut terdaftar.
  4. Jika baris token ditemukan pada tabel `sessions`, artinya user tersebut aktif/valid, dan request diizinkan untuk melihat tabel users.
  5. Jika record session tidak ditemukan di database, status request wajib ditolak dengan mengembalikan `401 Unauthorized`.

---

## 3. Tahapan Implementasi

Berikut langkah-langkah praktikal yang harus dilakukan untuk menerapkan perubahan di atas:

### Tahap 1: Pembaruan Skema Database (Tabel `sessions`)
1. Buka file definisi skema database (contoh: `src/db/schema.ts`).
2. Tambahkan variabel skema baru untuk tabel `sessions` dengan field `id`, `user_id`, `token`, dan `created_at` sesuai dengan tabel yang ada di spesifikasi nomor 1.
3. Jalankan *command push* dari *ORM* (contoh: `drizzle-kit push`) untuk mensinkronisasi dan membuat tabel baru tersebut ke dalam database.

### Tahap 2: Perubahan *Services Logic* (`src/services/users-service.ts`)
Fokus perubahan di sini berada pada logic Login.
1. **Refaktor Fungsi Login (`loginUser`):**
   - Hapus instansi atau import _plugin_ JWT (jika sebelumnya dilakukan di service).
   - Buat *logic generater random string*/token. Gunakan *built-in module* bawaan Bun/Node seperti `crypto.randomUUID()`.
   - Setelah password dipastikan valid (`bcrypt.compare` true), buat entri baru ke tabel `sessions` menggunakan query *insert* dari db. Masukkan `user_id` berdasarkan user yang ditemukan beserta string `token` tadi.
   - Kembalikan kembalian JSON dengan membawa data `token` untuk HTTP handler.
2. **Pembuatan Layanan Pengecekan Sesi (Opsional):**
   - Buat *method* service seperti `async checkSession(token: string)` yang mengembalikan nilai boolean (true/false) dengan cara melakukan *select* pada tabel `sessions` berdasar filter token.

### Tahap 3: Perubahan *Routing API* (`src/routes/users-route.ts`)
1. **Pembersihan Modul JWT:** 
   - Hapus inisialisasi *plugin* `@elysiajs/jwt` dari deklarasi Elysia App dan juga hapus destrukturisasi instansi `{ jwt }` pada parameter request *endpoint* API.
2. **Pembaruan Endpoint `POST /api/login`:**
   - Tangani kembalian dari *service* login dan pastikan API mengembalikan Token Sesi kepada Klien tanpa perlu *menandatangani/sign* melalui JWT plugin lagi.
3. **Pembaruan Middleware Endpoint `GET /api/users`:**
   - Perbarui *hook proteksi* / `beforeHandle`.
   - Ekstrak token mentah dari format `Bearer <TOKEN>` di dalam *request Headers* `Authorization`.
   - Daripada menggunakan method `.verify()`, berikan token mentah ini pada *service pengecekan session* (atau lakukan query baca db secara langsung untuk memastikan bahwa di dalam tabel `sessions` benar-benar terdapat record baris dengan nilai string kolom token yang sama).
   - Apabila token terverifikasi di database, jalankan fungsi ambil daftar Users. Apabila tidak ditemukan barisnya di DB (atau header kosong), kembalikan response gagal / error `401 Unauthorized`.

### Tahap 4: Testing (Pengujian)
1. **DB Check:** Pastikan struktur tabel `sessions` telah di-*generate* utuh oleh spesifikasi Drizzle ORM.
2. **Skenario Login:** Panggil POST `/api/login` melalui API Client (Postman/Curl). Periksa MySQL database Anda dan pastikan satu baris log akses sesi baru telah masuk di tabel `sessions` dan terikat pada *user_id* yang benar.
3. **Skenario Pengenalan Token:**
   - Lakukan GET request pada `/api/users` dengan header `Authorization: Bearer <SESSION_TOKEN_BARU_YANG_ADA_DI_DB>`. Pastikan data daftar users dapat dibaca.
   - Ubah huruf *header* Bearer Token dengan sembarang teks dan pastikan Anda terblokir dengan akses error `401`.
