# TopoNix 🌐
**Platform Pembelajaran Topologi Jaringan Berbasis Web**
> Untuk Siswa SMKN 1 Bojonegoro — Mata Pelajaran Informatika

---

## ✨ Fitur Utama
- 📚 **Materi Interaktif** — 5 topologi jaringan dengan simulasi visual
- 🖥️ **Network Simulator** — Drag-and-drop node, animasi packet, path-finding
- 🧠 **Kuis Adaptif** — 25 soal, 3 tingkat kesulitan, remedial otomatis
- 🎮 **Gamified Project Learning (GPL)** — 4 misi, XP, badge, level up
- 🏆 **Leaderboard** — Papan peringkat siswa real-time
- 👩‍🏫 **Panel Guru & Admin** — Kelola siswa, soal, pengaturan KKM/XP
- ☁️ **Supabase Integration** — Sinkronisasi data cloud (opsional)

---

## 🚀 Cara Menjalankan

### Tanpa instalasi apapun:
1. Double-click **`Jalankan-TopoNix.bat`**
2. Buka browser → `http://localhost:8080`

### Manual (PowerShell):
```powershell
powershell -ExecutionPolicy Bypass -File start-server.ps1
```

---

## 🔑 Akun Demo

| Username | Password | Role |
|----------|----------|------|
| rizky | 123 | Siswa |
| salsa | 123 | Siswa |
| dimas | 123 | Siswa |
| nadia | 123 | Siswa |
| guru | 123 | Guru |
| admin | 123 | Admin |

---

## 🗄️ Setup Supabase (Opsional)

1. Buat project di [supabase.com](https://supabase.com)
2. Jalankan `supabase/schema.sql` di **SQL Editor** Supabase
3. Login sebagai **admin** → **Pengaturan** → masukkan URL & Anon Key
4. Klik **Test Koneksi** → **Seed Data** → data tersinkron ke cloud

> Tanpa Supabase, aplikasi berjalan penuh dalam mode **localStorage** (Mode Lokal).

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| UI Framework | React 18 (via esm.sh CDN) |
| Templating | htm (hyperscript tagged markup) |
| Styling | Tailwind CSS (CDN) + Custom CSS |
| Database | Supabase (PostgreSQL + RLS) |
| Runtime | Browser-only, tanpa build step |

---

## 📁 Struktur Proyek

```
netlearn-smkn1bjn/
├── index.html              # Entry point
├── css/
│   └── styles.css          # Custom styles
├── js/
│   ├── reactHtm.js         # React + htm loader (CDN)
│   ├── config.js           # Supabase config helpers
│   ├── supabaseClient.js   # Supabase client & sync
│   ├── data.js             # Seed data (materi, soal, misi)
│   ├── store.js            # State management (TopoStore)
│   ├── simulator.js        # Network simulator components
│   ├── views-student.js    # Halaman siswa
│   ├── views-staff.js      # Halaman guru & admin
│   └── app.js              # Root App component
├── supabase/
│   └── schema.sql          # PostgreSQL schema + RLS
├── start-server.ps1        # PowerShell HTTP server
└── Jalankan-TopoNix.bat    # Launcher (double-click)
```

---

## 📄 Lisensi
MIT — Dibuat untuk keperluan pendidikan SMKN 1 Bojonegoro.
