# 🤖 ChatForGeeks

> Turn natural language questions into interactive data visualizations — powered by **Google Gemini AI**, **FastAPI**, and **Next.js**.

![Tech Stack](https://img.shields.io/badge/Next.js-15-black?logo=next.js) ![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?logo=fastapi) ![Gemini](https://img.shields.io/badge/Gemini-1.5--flash-4285F4?logo=google) ![SQLite](https://img.shields.io/badge/SQLite-embedded-003B57?logo=sqlite)

---

## ✨ Features

| Feature | Description |
|--|--|
| 🗣️ **Natural Language → SQL** | Type a business question; Gemini generates the SQL query |
| 📊 **Smart Chart Selection** | Automatically picks bar, line, area, pie, or scatter charts |
| 💬 **Conversation Context** | Follow-up questions maintain conversation history |
| 📁 **CSV Upload** | Upload any CSV and query it instantly |
| 🔍 **Schema Explorer** | Browse database tables and columns in the sidebar |
| ⚡ **Real-time Streaming** | Loading indicators during AI + DB processing |
| 🌙 **Dark Glassmorphism UI** | Premium, responsive dark-mode dashboard |

---

## 🏗️ Architecture

```
User Prompt
    ↓
Next.js Frontend (React + Recharts)
    ↓ POST /query
FastAPI Backend
    ↓
Google Gemini 1.5 Flash (NL → SQL + chart hint)
    ↓
SQLAlchemy → SQLite
    ↓
Chart Recommendation Engine
    ↓
JSON Response → Recharts Dashboard
```

---

## 📁 Project Structure

```
chatforgeeks/
├── backend/
│   ├── main.py          # FastAPI application + endpoints
│   ├── database.py      # SQLAlchemy setup + seeded demo dataset
│   ├── llm_engine.py    # Gemini API integration + prompt engineering
│   ├── chart_selector.py# Chart recommendation engine
│   ├── csv_loader.py    # CSV upload + SQLite ingestion
│   ├── requirements.txt
│   └── .env             # GEMINI_API_KEY
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx         # Root page
│   │   │   ├── layout.tsx       # SEO metadata + fonts
│   │   │   └── globals.css      # Dark theme + glassmorphism
│   │   ├── components/
│   │   │   ├── Dashboard.tsx    # Main orchestrator (sessions, layout)
│   │   │   ├── ChatInput.tsx    # Auto-resize textarea + suggested queries
│   │   │   ├── MessageBubble.tsx# Chat messages + chart rendering
│   │   │   ├── ChartRenderer.tsx# Recharts bar/line/area/pie/scatter
│   │   │   ├── UploadPanel.tsx  # Drag-and-drop CSV uploader
│   │   │   └── SchemaPanel.tsx  # DB schema tree explorer
│   │   ├── types/index.ts       # TypeScript interfaces
│   │   └── utils/api.ts         # Axios API client
│   └── .env.local
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18 and **npm**
- **Python** ≥ 3.10
- A **Google Gemini API key** → [Get one free](https://aistudio.google.com/app/apikey)

---

### 1. Clone & Setup Backend

```bash
cd chatforgeeks/backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate
# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure API Key

Edit `backend/.env`:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
DATABASE_URL=sqlite:///./bi_dashboard.db
```

### 3. Start the Backend

```bash
cd chatforgeeks/backend
python main.py
```

The API will start at **http://localhost:8000**  
API docs: **http://localhost:8000/docs**

> On first startup, it automatically seeds 1,000 rows of demo sales data.

---

### 4. Setup & Start the Frontend

```bash
cd chatforgeeks/frontend
npm install
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## 🎮 Demo Queries

Once the app is running, try these example questions:

```
"Show monthly revenue trend"
"Compare revenue by region"
"Which product category performs best?"
"Show revenue vs profit scatter"
"What is the quarterly profit breakdown?"
"Top 5 regions by customer count"
"Revenue for Q3 broken down by product category"
```

---

## 📊 Demo Dataset Schema

The `sales` table is automatically created with 1,000 sample rows:

| Column | Type | Description |
|--|--|--|
| `id` | INTEGER | Row identifier |
| `date` | TEXT | Sale date (YYYY-MM-DD) |
| `month` | TEXT | Month name |
| `quarter` | TEXT | Q1, Q2, Q3, Q4 |
| `year` | INTEGER | Year |
| `region` | TEXT | North/South/East/West/Central |
| `product_category` | TEXT | Electronics/Clothing/etc. |
| `revenue` | REAL | Revenue amount |
| `profit` | REAL | Profit amount |
| `customer_count` | INTEGER | Number of customers |

---

## 🔌 API Reference

### `POST /query`
Convert a natural language prompt to SQL and chart data.

**Request:**
```json
{
  "prompt": "Show monthly revenue trend",
  "session_id": "abc123",
  "active_table": null
}
```

**Response:**
```json
{
  "session_id": "abc123",
  "prompt": "Show monthly revenue trend",
  "sql_query": "SELECT month, SUM(revenue) ...",
  "explanation": "This query aggregates...",
  "charts": [{
    "chart_type": "line",
    "x_axis": "month",
    "y_axis": "revenue_sum",
    "data": [...]
  }]
}
```

### `POST /upload`
Upload a CSV file. Returns table name, row count, and schema.

### `GET /schema`
Returns the schema of all tables in the SQLite database.

### `DELETE /session/{session_id}`
Clear conversation history for a session.

---

## 🛠️ Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|--|--|
| `GEMINI_API_KEY` | Your Google Gemini API key |
| `DATABASE_URL` | SQLAlchemy database URL (default: SQLite) |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|--|--|
| `NEXT_PUBLIC_API_URL` | Backend API base URL (default: http://localhost:8000) |

---

## 📦 Tech Stack

### Frontend
- **Next.js 15** (App Router)
- **TypeScript**
- **TailwindCSS** — dark glassmorphism theme
- **Recharts** — responsive charts
- **Axios** — HTTP client
- **Lucide React** — icons

### Backend
- **FastAPI** + **Uvicorn**
- **Google Gemini 1.5 Flash**
- **SQLAlchemy** + **SQLite**
- **Pandas** — CSV processing
- **Python-dotenv**

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📜 License

MIT — free to use, modify, and distribute.
