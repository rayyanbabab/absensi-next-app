# Absensi QR - Next.js Fullstack Edition (v2.0)

Aplikasi Presensi Siswa dan Guru berbasis pemindai **QR Code** modern yang telah dimigrasikan secara penuh dari CodeIgniter 4 ke **Next.js 16 (App Router + TypeScript)** dengan integrasi **PostgreSQL / Supabase** dan **Prisma ORM**.

---

## 🚀 Fitur Unggulan

1. **Stasiun Pemindai QR Kamera Real-time (`/`)**
   - Pemindai otomatis menggunakan webcam/kamera laptop/HP (`html5-qrcode`).
   - Efek suara bip sintetis (Web Audio API, tanpa dependensi file eksternal).
   - Saklar mode kehadiran: **Absen Masuk** dan **Absen Pulang**.
   - Kartu konfirmasi kehadiran instan (menampilkan Nama, NIS/NUPTK, Kelas, dan Status Tepat Waktu).
   - Live ticker daftar kehadiran hari ini.

2. **Portal Admin & Dashboard (`/admin`)**
   - Ringkasan metrik: Total Siswa, Total Guru, Total Kelas, dan Siswa Hadir Hari Ini.
   - Grafik tren kehadiran 7 hari terakhir (komparasi Siswa & Guru).
   - Breakdown status kehadiran: Hadir, Sakit, Izin, Alfa/Belum Absen.

3. **Manajemen Data Siswa (`/admin/siswa`)**
   - CRUD lengkap data siswa.
   - Filter cepat berdasarkan Kelas dan Jurusan.
   - Pencarian instan berdasarkan NIS atau Nama.
   - Modal preview kode QR siswa & tombol unduh file gambar QR PNG.
   - Ekspor data siswa ke file **Excel (`.xlsx`)**.

4. **Manajemen Data Guru (`/admin/guru`)**
   - CRUD lengkap data guru & tenaga pendidik.
   - Modal preview kode QR guru & unduh file gambar QR.
   - Ekspor data guru ke file **Excel (`.xlsx`)**.

5. **Manajemen Kelas & Jurusan (`/admin/kelas`)**
   - Pengaturan rombongan belajar (Kelas X, XI, XII).
   - Relasi otomatis ke program keahlian / jurusan (RPL, TKJ, AKL, OTKP).

6. **Rekapitulasi Presensi Siswa & Guru (`/admin/absen-siswa` & `/admin/absen-guru`)**
   - Filter tanggal harian dan filter kelas.
   - Pencarian siswa / guru.
   - Ekspor laporan ke **Excel (`.xlsx`)** dan cetak **PDF (`jspdf`)**.

7. **Cetak Kartu QR Pelajar & Guru (`/admin/generate-qr`)**
   - Desain resmi kartu pelajar & presensi guru dengan kop sekolah dan QR code aktif.
   - Fitur **Cetak Langsung (Print Preview)** dengan format tata letak cetak kertas rapi (`@media print`).

8. **Laporan Absensi Periodik (`/admin/laporan`)**
   - Rekapitulasi absensi berdasarkan rentang tanggal mulai s/d selesai.
   - Kalkulasi otomatis persentase kehadiran (%).
   - Cetak dokumen resmi format PDF lengkap dengan tempat tanda tangan Kepala Sekolah.

9. **Pengaturan Umum (`/admin/settings`)**
   - Konfigurasi nama sekolah, tahun ajaran, teks hak cipta (copyright).
   - Aturan jam masuk (batas tepat waktu) dan jam pulang sekolah.

10. **Data Petugas & Akun (`/admin/petugas`)**
    - Manajemen peran pengguna: **Super Administrator** dan **Petugas Piket**.

---

## 🛠️ Panduan Menjalankan Aplikasi

### 1. Masuk ke direktori Next.js
```bash
cd "c:\Users\Rayyan af\OneDrive\Desktop\MyProject\absensi\next-app"
```

### 2. Jalankan Server Development
```bash
npm run dev
```
Aplikasi langsung dapat diakses di browser:
- **Kamera Scanner**: [http://localhost:3000](http://localhost:3000)
- **Portal Admin**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **Login Admin**: [http://localhost:3000/login](http://localhost:3000/login)
  - **Username**: `superadmin`
  - **Password**: `superadmin`

---

## 🗄️ Konfigurasi Database (PostgreSQL / Supabase)

Aplikasi ini sudah dilengkapi sistem **dual-layer storage**:
- **Secara otomatis**: Jika `DATABASE_URL` belum dihubungkan ke Supabase, sistem menggunakan database file lokal (`data/local-db.json`) sehingga Anda dapat langsung menjalankan dan menguji aplikasi secara offline tanpa setup rumit.
- **Untuk menghubungkan ke PostgreSQL / Supabase**:
  1. Buka file `.env` di dalam folder `next-app`.
  2. Masukkan connection string Supabase Anda pada variabel `DATABASE_URL`:
     ```env
     DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
     ```
  3. Sinkronkan skema tabel ke database Supabase Anda:
     ```bash
     npx prisma db push
     ```

## 🎨 Integrasi UI: shadcn/ui & Tailwind CSS v4

Aplikasi ini telah terintegrasi dengan standar **shadcn/ui** dan **Tailwind CSS v4**:
- Konfigurasi `components.json` siap pakai untuk menambah komponen shadcn/ui kapan saja.
- Library primitif **Radix UI** (`@radix-ui/react-dialog`, `@radix-ui/react-slot`, `@radix-ui/react-tabs`, `@radix-ui/react-dropdown-menu`).
- Komponen bawaan yang tersedia di `src/components/ui/`:
  - `Button` (`src/components/ui/button.tsx`)
  - `Card` (`src/components/ui/card.tsx`)
  - `Badge` (`src/components/ui/badge.tsx`)
  - `Dialog / Modal` (`src/components/ui/dialog.tsx`)
  - `Table` (`src/components/ui/table.tsx`)
  - `Tabs` (`src/components/ui/tabs.tsx`)
  - `Input` (`src/components/ui/input.tsx`)

### Menambahkan Komponen Tambahan dari [awesome-shadcn-ui](https://github.com/birobirobiro/awesome-shadcn-ui)
Anda dapat memasang komponen atau blok UI populer (seperti Aceternity UI, Magic UI, Shadcnblocks) dengan menjalankan perintah:
```bash
npx shadcn@latest add [nama-komponen]
```

---

## 📁 Struktur Folder `next-app`

```
next-app/
├── components.json           # Konfigurasi resmi shadcn/ui
├── postcss.config.mjs        # Konfigurasi PostCSS Tailwind CSS v4
├── prisma/
│   └── schema.prisma         # Skema database Prisma (PostgreSQL / Supabase)
├── src/
│   ├── app/
│   │   ├── api/              # Rute Backend API (Scan, Auth, Siswa, Guru, dll.)
│   │   ├── admin/            # Halaman Dashboard, Siswa, Guru, QR, Laporan
│   │   ├── login/            # Halaman Autentikasi Petugas
│   │   ├── globals.css       # Tailwind v4 + Desain Sistem Dark Glassmorphism
│   │   ├── layout.tsx        # Root HTML Layout
│   │   └── page.tsx          # Halaman Utama Pemindai QR
│   ├── components/
│   │   ├── ui/               # Komponen resmi shadcn/ui (Button, Card, Dialog, Table, Tabs, Badge, Input)
│   │   └── QRScanner.tsx     # Komponen Web Scanner Kamera & Audio Beep
│   └── lib/
│       ├── db.ts             # Service Database (Prisma + Local Storage Fallback)
│       ├── prisma.ts         # Singleton Client Prisma
│       ├── types.ts          # Definisi TypeScript Interface
│       └── utils.ts          # Helper utility cn() (clsx + twMerge)
└── package.json
```
