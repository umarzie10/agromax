# AgroMax - B2B Parrandachilik va Qishloq Xo'jaligi Platformasi

AgroMax — parrandachilik va qishloq xo'jaligi mahsulotlari ulgurji savdosi (B2B) uchun to'liq tizim (Fullstack).

## 🚀 Texnologiyalar

- **Frontend (`exact-screenshot/`)**:
  - React + Vite + TypeScript
  - Tailwind CSS + Lucide Icons + Shadcn UI
  - TanStack Router

- **Backend (`backend/`)**:
  - Python FastAPI
  - SQLite (SQLAlchemy / aiosqlite)
  - Telegram Bot Integratsiyasi (buyurtmalarni qabul qilish va bildirishnomalar yuborish)

---

## 🛠 O'rnatish va Ishga tushirish

### 1. Backend sozlash va ishga tushirish

1. `backend` papkasiga o'ting:
   ```bash
   cd backend
   ```
2. Kerakli kutubxonalarni o'rnating:
   ```bash
   pip install -r requirements.txt
   ```
3. `.env` faylini sozlang (`.env.example` dan nusxa oling):
   ```bash
   cp .env.example .env
   ```
   Telegram bot tokeni va admin parolini kiriting.

4. Serverni ishga tushiring:
   ```bash
   python main.py
   ```
   Yoki loyiha ildizidagi `run_backend.bat` faylini ishga tushiring.
   - Server: http://localhost:8000
   - Swagger API Hujjatlari: http://localhost:8000/docs

---

### 2. Frontend sozlash va ishga tushirish

1. `exact-screenshot` papkasiga o'ting:
   ```bash
   cd exact-screenshot
   ```
2. Paketlarni o'rnating:
   ```bash
   npm install
   ```
3. Dasturni ishga tushiring:
   ```bash
   npm run dev
   ```
   Yoki loyiha ildizidagi `run_frontend.bat` faylini ishga tushiring.
   - Frontend manzili: http://localhost:5173

---

## 📂 Loyiha tuzilishi

```
AgroMax/
├── backend/                  # FastAPI server va Telegram bot
│   ├── routers/              # API yo'nalishlari
│   ├── models.py             # Ma'lumotlar bazasi modellari
│   ├── telegram_service.py   # Telegram xizmati
│   ├── main.py               # Asosiy kirish nuqtasi
│   ├── requirements.txt      # Python kutubxonalari
│   └── .env.example          # Sozlamalar namunasi
├── exact-screenshot/         # React + Vite frontend
│   ├── src/                  # Komponentlar va sahifalar
│   └── package.json          # Node paketlari
├── run_backend.bat           # Backend-ni bir bosishda ishga tushirish
├── run_frontend.bat          # Frontend-ni bir bosishda ishga tushirish
├── .gitignore
└── README.md
```
