# 🌿 INUK - Infaq untuk Umat & Kesejahteraan

Website donasi digital dan sistem transparansi infaq yang dikembangkan untuk mendukung program **LAZISNU Kudus**.  
Aplikasi ini terdiri dari dua bagian utama:

1. **Landing Page Publik** — menampilkan informasi program, layanan, dan ajakan donasi.  
2. **Dashboard Admin** — untuk mengelola data donatur, transaksi, dan penyaluran dana secara transparan.

---

## 🚀 Fitur Utama

### 🏠 **Landing Page**
- Hero Section interaktif dengan animasi carousel (Framer Motion)
- Informasi keunggulan dan manfaat infaq
- Daftar layanan sosial LAZISNU
- Program unggulan: INUK, Mobil Layanan Ummat, Beasiswa, Diklat Tani
- Halaman Tentang Kami dengan kontak dan CTA

### 📊 **Dashboard Admin**
- **Transaksi Donasi (INFAQ/ZIS)**  
  Menampilkan daftar transaksi, filter berdasarkan periode, metode, status, serta ekspor data.
- **Penyaluran Dana**  
  Memantau distribusi dana ke penerima manfaat (kategori, program, status, total dana).
- **Donatur & Penerima Manfaat**  
  Manajemen data donatur dan penerima bantuan, lengkap dengan sorting dan pencarian.
- Sidebar navigasi dinamis dengan animasi Framer Motion.

---

## 🧱 **Teknologi yang Digunakan**

| Kategori | Teknologi |
|-----------|------------|
| Framework UI | **React + TypeScript** |
| Styling | **Tailwind CSS** |
| Animasi | **Framer Motion** |
| Ikon | **React Icons** |
| Build Tool | **Vite** (bisa juga disesuaikan ke Next.js) |
| Data | Dummy statis (bisa dikembangkan menjadi API backend) |

---

## 📂 **Struktur Folder (utama)**

```
src/
├── components/
│   ├── landing/
│   │   ├── HeroSection.tsx
│   │   ├── Keunggulan.tsx
│   │   ├── Layanan.tsx
│   │   ├── Program.tsx
│   │   └── Tentang.tsx
│   └── dashboard/
│       ├── DashboardLayout.tsx
│       ├── TransaksiDonasi.tsx
│       ├── PenyaluranDana.tsx
│       └── DonaturPenerima.tsx
├── assets/
│   └── (gambar dan ikon pendukung)
├── App.tsx
├── main.tsx
└── index.css
```

---

## ⚙️ **Cara Menjalankan Proyek**

Pastikan kamu sudah menginstal **Node.js (v16 atau lebih baru)**.

### 1️⃣ Clone repository
```bash
git clone https://github.com/username/inuk-donasi.git
cd inuk-donasi
```

### 2️⃣ Install dependencies
```bash
npm install
```

### 3️⃣ Jalankan aplikasi (development mode)
```bash
npm run dev
```

Akses melalui:  
👉 http://localhost:5173 (untuk proyek Vite)  
👉 atau http://localhost:3000 (jika menggunakan Next.js)

---

## 🧩 **Konfigurasi Tambahan (opsional)**

Jika kamu ingin menghubungkan ke backend atau database:
- Buat file `.env` berisi endpoint API, contoh:
  ```
  VITE_API_URL=https://api.inuk-lazisnu.or.id
  ```
- Integrasikan dengan `fetch` atau `axios` di bagian dashboard (Transaksi, Donatur, dsb).

---

## 🧠 **Rencana Pengembangan Selanjutnya**

- [ ] Integrasi dengan backend (Laravel/Express)
- [ ] Sistem autentikasi admin (Login Dashboard)
- [ ] Upload & ekspor laporan Excel otomatis
- [ ] API publik untuk transparansi data donasi
- [ ] Responsivitas penuh untuk mobile & tablet

---

## 👨‍💻 **Kontributor**

| Nama | Peran |
|------|-------|
| **Alfian Maulana** | Pengembang & Peneliti |
| (Opsional) Tim LAZISNU Kudus | Pemilik program & validasi data |

---

## 📄 **Lisensi**

Proyek ini dilisensikan di bawah [MIT License](LICENSE).

---

> _“Setiap infaq Anda adalah harapan bagi yang membutuhkan.”_  
> Bersama **LAZISNU Kudus**, wujudkan kepedulian melalui **INUK – Infaq untuk Umat & Kesejahteraan** 🌿
