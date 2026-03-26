# Implementasi API Get Current User

## Deskripsi Tugas
Halaman ini berisi instruksi untuk mengimplementasikan API endpoint yang berfungsi mengambil data user yang saat ini sedang login.

## Spesifikasi API
- **Method**: `GET`
- **Endpoint**: `/api/users/me`

### Response Berhasil (200 OK)
```json
{
    "message": "User fetched successfully",
    "data": {
        "id": 1,
        "name": "John Doe",
        "email": "[EMAIL_ADDRESS]",
        "created_at": "2022-01-01T00:00:00.000Z"
    }
}
```

### Response Gagal (401 Unauthorized)
```json
{
    "message": "Unauthorized: No token provided"
}
```

## Aturan Struktur Direktori dan File
Kode harus ditulis dengan mengikuti struktur folder di dalam `src`:
- **Routes** (`src/routes`): Berisi file routing Elysia.js. Penamaan file harus menggunakan format kebab-case, misal: `users-route.ts`.
- **Services** (`src/services`): Berisi file logic bisnis aplikasi. Penamaan file harus menggunakan format kebab-case, misal: `users-service.ts`.

---

## Tahapan Implementasi

Berikut adalah langkah-langkah detail yang perlu dilakukan untuk mengimplementasikan fitur ini:

### 1. Buat Service untuk Mengambil Data User (`src/services/users-service.ts`)
1. Buat file baru dengan nama `users-service.ts` di dalam folder `src/services/` (jika belum ada).
2. Buat sebuah function (misalnya `getCurrentUser`) yang menerima parameter identifier dari user (seperti argumen `userId` yang didapat dari token/session).
3. Di dalam function tersebut, lakukan `query` ke database untuk mengambil detail data user berdasarkan `userId` tersebut.
4. Jika data user ditemukan, kembalikan (*return*) object berisi data user (`id`, `name`, `email`, `created_at`).
5. Lakukan *export* function `getCurrentUser` tersebut agar dapat digunakan di modul HTTP/route.

### 2. Buat Route Endpoint (`src/routes/users-route.ts`)
1. Buat file baru dengan nama `users-route.ts` di dalam folder `src/routes/` (jika belum ada).
2. Lakukan import module `Elysia` dan import service `getCurrentUser` yang baru saja dibuat.
3. Buat sebuah instance/group route baru dengan prefix `/api/users`.
4. Buat handler untuk HTTP method `.get('/me', ...)`.
5. **Terapkan Middleware Otentikasi**:
   - Pastikan endpoint terlindungi oleh autentikasi. Ambil header `Authorization` / Cookie JWT dari request klien.
   - Apabila tidak valid atau tidak ada token otentikasi, kembalikan langsung response HTTP dengan status `401 Unauthorized` dengan isi response body:
     ```json
     {
         "message": "Unauthorized: No token provided"
     }
     ```
6. **Eksekusi dan Return Data**:
   - Apabila otentikasi berhasil, ambil id user dari payload token yang sudah terverifikasi.
   - Panggil service `getCurrentUser(userId)` menggunakan ID tersebut untuk mengambil data lengkap dari database.
   - Susun dan kembalikan response berhasil dengan bentuk JSON object sesuai spesifikasi ("message" dan "data").

### 3. Daftarkan Route pada Entry Point Utama (Contoh: `src/index.ts`)
1. Buka file entry point utama dari aplikasi ElysiaJS (biasanya terletak di `src/index.ts` atau file setup utama).
2. Import module hasil file route yang kita buat (`import userRoutes from './routes/users-route'`).
3. Daftarkan route tersebut ke instance utama Elysia menggunakan method `.use(userRoutes)`.

### 4. Pengujian (Testing)
Lakukan testing manual pada endpoint tersebut (bisa dengan cURL, Postman, ataupun unit testing otomatis):
1. **Skenario Gagal**: Lakukan request `GET /api/users/me` tanpa token atau token invalid. Pastikan server menolak request dengan status Code `401 Unauthorized` beserta message *"Unauthorized: No token provided"*.
2. **Skenario Berhasil**: Lakukan request `GET /api/users/me` dengan mengirim token otentikasi valid pada HTTP Header. Pastikan server merespons dengan status code `200 OK` dan body object yang sesuai format lengkap (berisi *id, name, email, created_at*).
