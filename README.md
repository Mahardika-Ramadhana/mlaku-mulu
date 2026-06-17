# Backend Biro Perjalanan Mlaku-Mulu

Repositori ini berisi kode backend untuk aplikasi manajemen turis dan riwayat perjalanan Biro Perjalanan **Mlaku-Mulu**, dibangun menggunakan **NestJS**, **TypeScript**, dan **Prisma ORM** dengan database **SQLite**.

Aplikasi ini dirancang untuk memenuhi persyaratan pengujian backend engineer magang di Datacakra.

---

## Live Deployment

Aplikasi backend ini telah di-deploy secara _live_ di **Render** dan dapat langsung diakses serta diuji melalui tautan berikut:

- **Dokumentasi OpenAPI (Swagger Docs):** [https://mlaku-mulu-backend.onrender.com/docs](https://mlaku-mulu-backend.onrender.com/docs)
- **Base URL API (Live):** [https://mlaku-mulu-backend.onrender.com/api](https://mlaku-mulu-backend.onrender.com/api)

> [!NOTE]
> Karena di-deploy menggunakan Render _free tier_, server akan masuk ke mode _idle/sleep_ jika tidak ada aktivitas. Mohon tunggu 1-2 menit pada akses pertama agar server melakukan _cold start_ dan kembali aktif.

---

## Fitur Utama

1.  **Autentikasi JWT & Otorisasi Berbasis Role**:
    - Sistem membedakan akses antara **Pegawai (Employee)** dan **Turis (Tourist)**.
    - Endpoint diproteksi menggunakan Passport JWT Strategy dan NestJS Guards.
2.  **Manajemen Turis & Perjalanan (Pegawai)**:
    - Menambah, mengambil, memperbarui, dan menghapus data turis.
    - Menambah, memperbarui, dan menghapus data perjalanan (Trip) milik turis.
3.  **Akses Mandiri Turis**:
    - Turis dapat login menggunakan kredensial yang dibuat oleh pegawai.
    - Turis dapat melihat riwayat perjalanan mereka sendiri dengan field response yang sesuai spesifikasi.
4.  **Integrasi AI - Travel Itinerary Planner**:
    - Turis dapat merencanakan liburan secara interaktif melalui AI (Google Gemini API) untuk membuat itinerary JSON yang terstruktur.
    - Pegawai dapat mendaftarkan trip baru untuk turis dengan rencana perjalanan yang otomatis dibuat oleh AI.
    - _Graceful Fallback:_ Jika `GEMINI_API_KEY` kosong di `.env`, sistem otomatis beralih ke Mode Simulasi (Mock) agar pengujian tetap lulus tanpa hambatan.
5.  **Dashboard Statistik & Analitik Bisnis**:
    - Dashboard khusus pegawai untuk melihat ringkasan total turis, total perjalanan, status trip (aktif/mendatang/selesai).
    - Analisis 5 destinasi paling populer serta tren pendaftaran turis baru selama 6 bulan terakhir.
6.  **Validasi Otomatis & Dokumentasi**:
    - Validasi input menggunakan `class-validator` untuk memastikan keutuhan data.
    - Integrasi otomatis **Swagger OpenAPI** di route `/docs` untuk memudahkan pengujian endpoint secara interaktif.
7.  **Pengujian Komprehensif (E2E & Unit)**:
    - Terdapat **20 test cases** di pengujian E2E (meningkat dari 16) yang mencakup seluruh alur utama sistem beserta pengujian AI dan Dashboard.

---

## Tech Stack

- **Framework**: NestJS (v11.x)
- **Language**: TypeScript (Strict Mode)
- **Database**: SQLite
- **ORM**: Prisma ORM (v7.x) dengan driver adapter `@prisma/adapter-better-sqlite3`
- **AI SDK**: `@google/generative-ai` (Google Gemini API)
- **Security**: bcrypt untuk hashing password, Passport & JWT untuk autentikasi

---

## Daftar API Endpoints

### Autentikasi

- `POST /api/auth/employee/register` - Mendaftarkan akun pegawai baru (untuk keperluan setup/testing).
- `POST /api/auth/employee/login` - Login pegawai untuk mendapatkan token JWT pegawai.
- `POST /api/auth/tourist/login` - Login turis menggunakan email & password dari pegawai untuk mendapatkan token JWT turis.

### Operasi Pegawai (Diperlukan Bearer Token Pegawai)

- `GET /api/employees/dashboard` - **(Tambahan)** Mendapatkan statistik ringkasan dan analisis tren bisnis.
- `GET /api/employees/tourists` - Mengambil daftar seluruh turis.
- `POST /api/employees/tourists` - Menambahkan turis baru.
- `PUT /api/employees/tourists/:id` - Memperbarui data profil turis.
- `DELETE /api/employees/tourists/:id` - Menghapus turis beserta seluruh riwayat perjalanannya (cascade delete).
- `POST /api/employees/tourists/:id/trips` - Menambahkan riwayat perjalanan baru ke turis tertentu.
- `POST /api/employees/tourists/:id/ai-trip` - **(Tambahan)** Mendaftarkan perjalanan baru turis menggunakan itinerary otomatis dari AI.
- `PUT /api/employees/trips/:tripId` - Memperbarui data perjalanan turis.
- `DELETE /api/employees/trips/:tripId` - Menghapus data perjalanan turis.

### Operasi Turis (Diperlukan Bearer Token Turis)

- `GET /api/tourists/my-trips` - Mengambil daftar riwayat perjalanan milik turis yang sedang login.
- `POST /api/tourists/ai/generate-itinerary` - **(Tambahan)** Membuat rancangan liburan otomatis berbasis AI.

---

## Cara Menjalankan Aplikasi

### 1. Prasyarat

- Node.js (versi 18 ke atas disarankan)
- NPM (bawaan Node.js)

### 2. Instalasi Dependensi

Jalankan perintah berikut di direktori utama:

```bash
npm install
```

### 3. Konfigurasi Environment Variables

Salin berkas `.env.example` ke `.env` (atau buat berkas `.env` secara manual di direktori root) dan pastikan konfigurasinya sesuai:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="super-secret-key-change-in-prod"
GEMINI_API_KEY="isi_dengan_api_key_gemini_anda"
```

### 4. Setup Database (Migrasi & Seeding)

Jalankan migrasi database Prisma untuk membuat tabel-tabel di SQLite:

```bash
npx prisma migrate dev --name init
```

Kemudian jalankan data seeding untuk membuat akun **Pegawai Default** (`pegawai@mlakumulu.com` / `password123`):

```bash
npx prisma db seed
```

### 5. Jalankan Server Development

Jalankan server dalam mode development (watch mode):

```bash
npm run start:dev
```

Server akan berjalan di: [http://localhost:3000/api](http://localhost:3000/api)

### 6. Akses Dokumentasi Swagger

Buka browser dan buka alamat berikut untuk menguji API secara langsung:
[http://localhost:3000/docs](http://localhost:3000/docs)

---

## Cara Menjalankan Pengujian (Testing)

Aplikasi telah dilengkapi dengan pengujian unit dan E2E untuk memvalidasi keamanan rute serta kebenaran logika bisnis.

- **Menjalankan Unit Test**:
  ```bash
  npm run test
  ```
- **Menjalankan E2E Test**:
  ```bash
  npm run test:e2e
  ```

---

## Petunjuk Deployment

Aplikasi ini dapat di-deploy ke platform seperti **Render**, **Railway**, atau **Fly.io** dengan mudah karena menggunakan SQLite:

1.  **Build Aplikasi**:
    ```bash
    npm run build
    ```
2.  **Environment Variables di Production**:
    Pastikan untuk mengubah `JWT_SECRET` dengan kunci rahasia yang kuat dan aman.
3.  **Persistensi Volume SQLite**:
    Jika di-deploy ke platform serverless container seperti Render atau Fly.io, buatlah volume persistent untuk menyimpan file `dev.db` agar data tidak hilang ketika container di-restart. Alternatifnya, Anda dapat mengubah konfigurasi ke PostgreSQL di `prisma.config.ts` dan `prisma/schema.prisma` jika ingin menggunakan database terpisah.
