# Implementation Plan: API Logout

## 1. Deskripsi Tugas
Buatkan endpoint API untuk proses Logout user menggunakan ElysiaJS. Endpoint ini akan merespon proses logout dari user yang sedang aktif.

## 2. Spesifikasi Endpoint
- **Method:** `GET`
- **Endpoint:** `/api/logout`

### Response Berhasil (Success Status 200)
```json
{
    "message": "User logged out successfully"
}
```

### Response Gagal (Error Status 401)
Jika request dilakukan tanpa menyertakan token autentikasi:
```json
{
    "message": "Unauthorized: No token provided"
}
```

## 3. Struktur Direktori dan File
Implementasi harus mengikuti struktur arsitektur berikut di dalam folder `src/`:
- **`src/services/users-service.ts`**: Berisi *business logic* untuk operasi users, termasuk operasi logout.
- **`src/routes/users-route.ts`**: Berisi definisi *routing* ElysiaJS yang menghubungkan endpoint HTTP dengan fungsi dari *service*.

---

## 4. Tahapan Implementasi (Step-by-Step)

Untuk mengimplementasikan fitur ini, ikuti langkah-langkah berikut secara berurutan:

### Langkah 1: Implementasi Logika Bisnis di Service
1. Buka file `src/services/users-service.ts`.
2. Buat sebuah fungsi asynchronous baru (contoh: `logoutUser`).
3. Fungsi ini harus menerima argumen berupa `token` (string) atau objek *request context*.
4. **Validasi:** Di dalam fungsi tersebut, cek apakah `token` tersedia. Jika tidak ada / kosong, lemparkan error yang memilki indikasi "Unauthorized" (misalnya `throw new Error("Unauthorized: No token provided")` atau menggunakan custom error class jika ada).
5. **Proses Logout:** Lakukan proses invalidate token jika menggunakan database. Jika menggunakan JWT stateless atau cookie, bagian ini bisa difokuskan pada pengembalian pesan sukses yang akan disambungkan dengan penghapusan cookie di level route.
6. **Return:** Kembalikan pesan string atau objek sesuai spesifikasi sukses: `User logged out successfully`.

### Langkah 2: Implementasi Endpoint HTTP di Route
1. Buka file `src/routes/users-route.ts`.
2. Tambahkan definisi route baru: `.get('/logout', async (context) => { ... })` ke dalam instance Elysia routing user. (Perhatikan prefix routing, jika file ini sudah di-prefix `/api/users`, sesuaikan path agar URL jadinya adalah `/api/logout` atau `/api/users/logout` sesuai konvensi project).
3. Di dalam handler route, ambil token dari header `Authorization` (Bearer token) atau dari `cookie` melalui argumen `context`.
4. Bungkus pemanggilan *service* dengan `try-catch` blok:
   - **Try:** Panggil fungsi `usersService.logoutUser(token)` dan simpan hasilnya. Set response HTTP status menjadi `200` dan kembalikan response *success* JSON.
   - **Catch:** Tangkap pesan error dari *service*. Jika error tersebut adalah error Unauthorized, set response HTTP status ke `401` dan kembalikan *response error body*: `{"message": "Unauthorized: No token provided"}`.

### Langkah 3: Verifikasi dan Testing
1. Pastikan server berjalan tidak menghasilkan *error compiler* TypeScript.
2. Tes endpoint yang sudah dibuat menggunakan HTTP client sepert *cURL*, *Postman*, REST Client, atau *Hoppscotch*.
3. **Skenario Negatif:** Panggil endpoint `GET /api/logout` **tanpa** mengirimkan header token. Pastikan balasan adalah status 401 dan body persis seperti spesifikasi Error.
4. **Skenario Positif:** Panggil endpoint `GET /api/logout` **dengan** mengirimkan header token. Pastikan balasan adalah status 200 dan body persis seperti spesifikasi Success.
