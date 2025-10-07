# 🌿 INUK - Infaq untuk Umat & Kesejahteraan

Website donasi digital dan sistem transparansi infaq yang dikembangkan untuk mendukung program **LAZISNU Kudus**.  
Aplikasi ini terdiri dari dua bagian utama:

1. **Landing Page Publik** — menampilkan informasi program, layanan, dan ajakan donasi.  
2. **Dashboard Admin** — untuk mengelola data donatur, transaksi, dan penyaluran dana secara transparan.

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
git clone https://github.com/Alfianmnaa/Inuk-Frontend.git
cd Inuk-Frontend
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

---


## 🧠 **Rencana Pengembangan Selanjutnya**

- [ ] Integrasi dengan backend (Laravel/Express)
- [ ] Sistem autentikasi admin (Login Dashboard)
- [ ] Upload & ekspor laporan Excel otomatis
- [ ] API publik untuk transparansi data donasi
- [ ] 
---

> _“Setiap infaq Anda adalah harapan bagi yang membutuhkan.”_  
> Bersama **LAZISNU Kudus**, wujudkan kepedulian melalui **INUK – Infaq untuk Umat & Kesejahteraan** 🌿
